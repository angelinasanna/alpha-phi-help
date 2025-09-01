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
  const model = process.env.EMBED_MODEL || "voyage-3.5-lite";
  const res = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.VOYAGE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, input: text, input_type: type }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Voyage embed error ${res.status}: ${t}`);
  }
  const data = await res.json();
  return data?.data?.[0]?.embedding;
}

// ⬇︎ NEW: Save content (no question required)
export async function POST(req) {
  try {
    await requireAdmin();

    const { content, url, source } = await req.json();

    // Allow saving plain info; just ensure there is some content
    if (!content || !content.trim()) {
      return Response.json({ error: "No content provided" }, { status: 400 });
    }

    // Create an embedding so entries are retrievable later
    const embedding = await embedWithVoyage(content, "document");

    // Insert into your 'chunks' table (assumes columns: content, source, url, embedding)
    const { data, error } = await supa()
      .from("chunks")
      .insert([{ content, source: source || "admin", url: url || null, embedding }])
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ ok: true, item: data });
  } catch (e) {
    if (e instanceof Response) return e;
    return Response.json({ error: e.message }, { status: 500 });
  }
}
