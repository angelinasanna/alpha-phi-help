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

async function embedWithVoyage(text, type = "document") {
  const key = (process.env.VOYAGE_API_KEY || "").trim();
  if (!key) return null;

  const model = process.env.EMBED_MODEL?.trim() || "voyage-3.5-lite";

  try {
    const res = await fetch("https://api.voyageai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model, input: text, input_type: type }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("Voyage:", res.status, body);
      return null; // degrade gracefully
    }

    const data = await res.json();
    return data?.data?.[0]?.embedding ?? null;
  } catch (e) {
    console.error("Embed error:", e);
    return null;
  }
}

export async function POST(req) {
  try {
    await requireAdmin();

    const { content, url, source } = await req.json();
    if (!content?.trim()) {
      return Response.json({ error: "No content provided" }, { status: 400 });
    }

    const embedding = await embedWithVoyage(content, "document");

    // Build the row without embedding first
    const row = { content, source: source || "admin", url: url || null };
    if (embedding) row.embedding = embedding; // only if column exists

    const { data, error } = await supa()
      .from("chunks")
      .insert([row])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ ok: true, item: data, embedded: !!embedding });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error("Save route error:", e);
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);
    const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0);

    // First try with created_at (if your table has it)
    let query = supa()
      .from("chunks")
      .select("id, content, source, url, created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (q) query = query.or(`content.ilike.%${q}%,source.ilike.%${q}%`);

    let { data, count, error } = await query;

    // Fallback if the table has no created_at column
    if (error && /created_at/i.test(error.message)) {
      let q2 = supa()
        .from("chunks")
        .select("id, content, source, url", { count: "exact" })
        .order("id", { ascending: false })
        .range(offset, offset + limit - 1);
      if (q) q2 = q2.or(`content.ilike.%${q}%,source.ilike.%${q}%`);
      const res2 = await q2;
      data = res2.data; count = res2.count; error = res2.error;
    }

    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ items: data || [], total: count || 0 });
  } catch (e) {
    if (e instanceof Response) return e;
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

