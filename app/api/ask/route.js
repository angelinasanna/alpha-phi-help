// app/api/ask/route.js
import { createClient } from "@supabase/supabase-js";

function supa() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE, // service role for RPC
    { auth: { persistSession: false } }
  );
}

// Small helper to call Voyage
async function embedWithVoyage(text, type = "query") {
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

export async function POST(req) {
  try {
    const { question } = await req.json();
    if (!question || !question.trim()) {
      return Response.json({ error: "No question provided" }, { status: 400 });
    }

    // 1) Embed the user question with Voyage
    const queryEmbedding = await embedWithVoyage(question, "query");

    // 2) Call your Postgres function to retrieve matches
    //    Start with a low-ish threshold to verify flow; then tune up.
    const { data, error } = await supa().rpc("match_chunks_voyage", {
      query_embedding: queryEmbedding,
      match_threshold: 0.35,  // try 0.25–0.45 for initial testing
      match_count: 5,
    });

    if (error) {
      throw new Error(`Supabase RPC error: ${error.message}`);
    }

    // If nothing matched, send your friendly message
    if (!data || data.length === 0) {
      return Response.json({
        answer:
          "I couldn’t find that in our notes yet. Try rephrasing or ask an officer to add it on /admin.",
        sources: [],
      });
    }

    // 3) Return the top match and optionally show more as sources
    const top = data[0];
    return Response.json({
      answer: top.content,
      sources: data.map((r, i) => ({
        n: i + 1,
        source: r.source || "FAQ",
        url: r.url || null,
        similarity: r.similarity,
      })),
    });
  } catch (e) {
    // Surface a clear error in dev; keep user-facing message simple
    console.error("ASK ROUTE ERROR:", e);
    return Response.json(
      {
        error: "Ask route failed",
        detail: process.env.NODE_ENV !== "production" ? String(e) : undefined,
      },
      { status: 500 }
    );
  }
}
