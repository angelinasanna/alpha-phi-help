import { auth, currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

function isEmailAdmin(email) {
  const list = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
  return list.includes((email || "").toLowerCase());
}

export async function POST(req) {
  // --- Auth guard ---
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  const role = user?.publicMetadata?.role;

  const isAdmin = role === "admin" || isEmailAdmin(email);
  if (!isAdmin) return new Response("Forbidden", { status: 403 });

  // --- Your existing logic below ---
  try {
    const { content, source = "FAQ", url = null } = await req.json();
    if (!content?.trim()) return Response.json({ error: "No content" }, { status: 400 });

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const embedModel = process.env.EMBED_MODEL || "text-embedding-3-small";
    const emb = await openai.embeddings.create({ model: embedModel, input: content });

    const supa = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE,
      { auth: { persistSession: false } }
    );

    const { error } = await supa.from("chunks").insert({
      content, source, url, embedding: emb.data[0].embedding
    });

    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
