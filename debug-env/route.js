// app/api/debug-env/route.js
export const runtime = 'nodejs';
export async function GET() {
  const v = process.env.VOYAGE_API_KEY || "";
  return Response.json({ VOYAGE_API_KEY_present: !!v, length: v.length });
}