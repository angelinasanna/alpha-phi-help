import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { question } = await req.json();
    if (!question?.trim()) return Response.json({ error: "No question" }, { status: 400 });

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const embedModel = process.env.EMBED_MODEL || "text-embedding-3-small";
    const chatModel  = process.env.CHAT_MODEL  || "gpt-4o-mini";

    // 1) Embed the question
    const qEmb = await openai.embeddings.create({ model: embedModel, input: question });
    const vector = qEmb.data[0].embedding;

    // 2) Find relevant admin-added entries
    const supa = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE,
      { auth: { persistSession: false } }
    );

    const { data: matches, error } = await supa.rpc("match_chunks", {
      query_embedding: vector,
      match_threshold: 0.0,
      match_count: 5,
    });
    if (error) throw new Error(error.message);

    const context = (matches || [])
      .map((m, i) => `[#${i + 1} ${m.source || "source"}] ${m.content}`)
      .join("\n---\n");

    // 3) Answer with citations
    const system = `You are an Alpha Phi helper. Use ONLY the provided context.
- If unsure or no context fits, say you aren't sure and suggest asking a director.
- Keep answers short. Cite chunks with [#1], [#2], etc.`;

    const resp = await openai.chat.completions.create({
      model: chatModel,
      temperature: 0.2,
      messages: [
        { role: "system", content: system },
        { role: "user", content: `Question: ${question}\n\nContext:\n${context}` },
      ],
    });

    const answer = resp.choices?.[0]?.message?.content ?? "Sorry, I’m not sure.";
    return Response.json({
      answer,
      sources: (matches || []).map((m, i) => ({ n: i + 1, source: m.source, url: m.url }))
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
