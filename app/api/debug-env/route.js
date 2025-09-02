export const runtime = 'nodejs';
export async function GET() {
  const key = (process.env.VOYAGE_API_KEY || "").trim();
  const model = process.env.EMBED_MODEL?.trim() || "voyage-3.5-lite";

  // Never return the key; just the shape
  const meta = { present: !!key, length: key.length, startsWith: key.slice(0,3) };

  try {
    const res = await fetch("https://api.voyageai.com/v1/embeddings", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, input: "ping", input_type: "query" }),
    });
    const text = await res.text();
    return Response.json({ meta, status: res.status, body: text });
  } catch (e) {
    return Response.json({ meta, error: String(e) }, { status: 500 });
  }
}
