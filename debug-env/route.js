// app/api/debug-env/route.js
export async function GET() {
  return Response.json({
    hasVoyageKey: !!process.env.VOYAGE_API_KEY,
    model: process.env.EMBED_MODEL,
  });
}