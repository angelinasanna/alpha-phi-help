// app/api/admin/chunks/route.js
import { auth, currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

function isEmailAdmin(email) {
  const list = (process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
  return list.includes((email || "").toLowerCase());
}

async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) throw new Response("Unauthorized", { status: 401 });
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  const role = user?.publicMetadata?.role;
  if (!(role === "admin" || isEmailAdmin(email))) {
    throw new Response("Forbidden", { status: 403 });
  }
}

function supa() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE,
    { auth: { persistSession: false } }
  );
}

export async function GET(req) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);
    const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0);

    let query = supa()
      .from("chunks")
      .select("id, content, source, url, created_at, updated_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (q) {
      // search on content OR source (case-insensitive)
      query = query.or(`content.ilike.%${q}%,source.ilike.%${q}%`);
    }

    const { data, count, error } = await query;
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ items: data || [], total: count || 0 });
  } catch (e) {
    if (e instanceof Response) return e;
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    // 1. Get embedding for the question
    const vRes = await fetch("https://api.voyageai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.VOYAGE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "voyage-3.5-lite",
        input: question,
        input_type: "query",
      }),
    });

    if (!vRes.ok) {
      return Response.json({ error: await vRes.text() }, { status: vRes.status });
    }

    const v = await vRes.json();
    const queryEmbedding = v.data[0].embedding;

    // 2. Call your Postgres function match_chunks_voyage
    const { data, error } = await supa().rpc("match_chunks_voyage", {
      query_embedding: queryEmbedding,
      match_threshold: 0.75,   // you can tweak this
      match_count: 5,
    });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return Response.json({ answer: "I couldn’t find that in our notes yet." });
    }

    // 3. Return the best match (first row)
    const best = data[0];
    return Response.json({
      answer: best.content,
      source: best.source,
      url: best.url,
      similarity: best.similarity,
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}