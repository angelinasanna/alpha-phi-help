// app/api/admin/chunks/[id]/route.js
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
  if (!(role === "admin" || isEmailAdmin(email))) throw new Response("Forbidden", { status: 403 });
}
function supa() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE,
    { auth: { persistSession: false } }
  );
}

export async function PATCH(req, { params }) {
  try {
    await requireAdmin();
    const id = params.id;
    const body = await req.json();
    const { content, source, url } = body;

    let update = { updated_at: new Date().toISOString() };
    if (typeof source === "string") update.source = source;
    if (typeof url === "string" || url === null) update.url = url;

    // if content changed, re-embed (Voyage)
    if (typeof content === "string") {
      update.content = content;

      const model = process.env.EMBED_MODEL || "voyage-3.5-lite";
      const vRes = await fetch("https://api.voyageai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.VOYAGE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model, input: content, input_type: "document" }),
      });
      if (!vRes.ok) return Response.json({ error: await vRes.text() }, { status: vRes.status });
      const v = await vRes.json();
      update.embedding_voyage = v?.data?.[0]?.embedding;
    }

    const { error } = await supa().from("chunks").update(update).eq("id", id);
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ ok: true });
  } catch (e) {
    if (e instanceof Response) return e;
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  try {
    await requireAdmin();
    const id = params.id;
    const { error } = await supa().from("chunks").delete().eq("id", id);
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ ok: true });
  } catch (e) {
    if (e instanceof Response) return e;
    return Response.json({ error: e.message }, { status: 500 });
  }
}
