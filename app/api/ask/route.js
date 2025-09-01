// app/api/ask/route.js
import { createClient } from "@supabase/supabase-js";
import Groq from "groq-sdk";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { question } = await req.json();
    if (!question?.trim()) {
      return Response.json({ error: "No question provided." }, { status: 400 });
    }

    // 1) Embed the question with Voyage
    const modelEmb = process.env.EMBED_MODEL || "voyage-3.5-lite";
    const vRes = await fetch("https://api.voyageai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.VOYAGE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelEmb,
        input: question,
        input_type: "query",
      }),
    });
    if (!vRes.ok) {
      const txt = await vRes.text();
      return Response.json({ error: `Voyage error: ${vRes.status} ${txt}` }, { status: 500 });
    }
    const vJson = await vRes.json();
    const queryVec = vJson?.data?.[0]?.embedding;

    // 2) Retrieve top matches from Supabase (voyage column)
    const supa = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE,
      { auth: { persistSession: false } }
    );

    const { data: matches, error } = await supa.rpc("match_chunks_voyage", {
      query_embedding: queryVec,
      match_threshold: 0.0,
      match_count: 5,
    });
    if (error) throw new Error("DB search failed: " + error.message);

    const context = (matches || [])
      .map((m, i) => `[#${i + 1} ${m.source || "source"}] ${m.content}`)
      .join("\n---\n");

    if (!context) {
      return Response.json({
        answer:
          "I couldn’t find that in our notes yet. Try rephrasing or ask an officer to add it on /admin.",
        sources: [],
      });
    }

    // 3) Chat with Groq (Llama)
    const messages = [
      { role: "system", content: `You are an Alpha Phi helper.
Use ONLY the provided Context. If something is missing, say you're not sure and suggest asking an officer.
Keep answers short and cite chunks like [#1], [#2].` },
      { role: "user", content: `Question: ${question}\n\nContext:\n${context}` },
    ];

    let answer = "Sorry, not sure.";
    const provider = process.env.CHAT_PROVIDER || "groq";

    if (provider === "groq") {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const modelChat = process.env.CHAT_MODEL || "llama-3.1-8b-instant";
      const resp = await groq.chat.completions.create({
        model: modelChat,
        messages,
        temperature: 0.2,
        max_tokens: 350,
      });
      answer = resp.choices?.[0]?.message?.content ?? answer;
    } else {
      // (optional) fallback to OpenAI if you keep it configured
      const OpenAI = (await import("openai")).default;
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const modelChat = process.env.CHAT_MODEL || "gpt-4o-mini";
      const resp = await openai.chat.completions.create({
        model: modelChat,
        messages,
        temperature: 0.2,
        max_tokens: 350,
      });
      answer = resp.choices?.[0]?.message?.content ?? answer;
    }

    const sources = (matches || []).map((m, i) => ({
      n: i + 1, source: m.source, url: m.url
    }));

    return Response.json({ answer, sources });
  } catch (err) {
    const status = err?.status || err?.response?.status || 500;
    const msg = err?.message || "Server error";
    if (status === 429 || /quota/i.test(msg)) {
      return Response.json(
        { error: "Model quota reached—try again later or contact an officer." },
        { status: 429 }
      );
    }
    return Response.json({ error: msg }, { status });
  }
}
