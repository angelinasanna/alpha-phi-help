// app/admin/manage/page.js
"use client";
import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs";
import { useEffect, useMemo, useState } from "react";

function useIsAdmin() {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase() || "";
  const role = user?.publicMetadata?.role;
  const allowed = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
  return role === "admin" || allowed.includes(email);
}

export default function ManageChunks() {
  const isAdmin = useIsAdmin();
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(false);

  const page = useMemo(() => Math.floor(offset / limit) + 1, [offset, limit]);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/admin/chunks?q=${encodeURIComponent(q)}&limit=${limit}&offset=${offset}`);
    const data = await res.json().catch(()=>({}));
    if (res.ok) {
      setItems(data.items || []);
      setTotal(data.total || 0);
    }
    setLoading(false);
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [q, offset]);

  async function saveEdit(row) {
    const res = await fetch(`/api/admin/chunks/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: row.content, source: row.source, url: row.url ?? null }),
    });
    if (res.ok) load();
    else alert((await res.json()).error || "Error saving");
  }

  async function del(id) {
    if (!confirm("Delete this entry?")) return;
    const res = await fetch(`/api/admin/chunks/${id}`, { method: "DELETE" });
    if (res.ok) load(); else alert((await res.json()).error || "Error deleting");
  }

  // simple inline editing
  function Row({ row }) {
    const [edit, setEdit] = useState(false);
    const [draft, setDraft] = useState(row);
    return (
      <div className="border rounded p-3 bg-white/70">
        {edit ? (
          <>
            <div className="flex gap-2 mb-2">
              <input className="border rounded px-2 py-1 flex-1"
                value={draft.source || ""} onChange={(e)=>setDraft({...draft, source:e.target.value})}
                placeholder="Source (FAQ, Handbook…)" />
              <input className="border rounded px-2 py-1 flex-1"
                value={draft.url || ""} onChange={(e)=>setDraft({...draft, url:e.target.value})}
                placeholder="Optional URL" />
            </div>
            <textarea className="border rounded px-2 py-1 w-full min-h-[120px]"
              value={draft.content} onChange={(e)=>setDraft({...draft, content:e.target.value})}/>
            <div className="mt-2 flex gap-2">
              <button className="px-3 py-1 rounded bg-[#7a1f3d] text-white"
                onClick={async()=>{ await saveEdit(draft); setEdit(false); }}>
                Save
              </button>
              <button className="px-3 py-1 rounded border" onClick={()=>{ setDraft(row); setEdit(false); }}>
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-sm text-gray-500">
              {row.source || "source"} · {new Date(row.created_at).toLocaleString()}
            </div>
            {row.url && <a className="underline text-sm" href={row.url} target="_blank">{row.url}</a>}
            <p className="mt-2 whitespace-pre-wrap">{row.content}</p>
            <div className="mt-2 flex gap-2">
              <button className="px-3 py-1 rounded border" onClick={()=>setEdit(true)}>Edit</button>
              <button className="px-3 py-1 rounded border text-red-600" onClick={()=>del(row.id)}>Delete</button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Admin: manage knowledge</h1>

      <SignedOut>
        <div className="p-4 border rounded bg-white/70">
          Members only — <SignInButton>sign in</SignInButton>.
        </div>
      </SignedOut>

      <SignedIn>
        {!isAdmin ? (
          <div className="p-4 border rounded bg-white/70">Admins only.</div>
        ) : (
          <>
            <input
              className="border rounded px-3 py-2 w-full"
              placeholder="Search by text or source…"
              value={q}
              onChange={(e) => { setOffset(0); setQ(e.target.value); }}
            />

            {loading && <div className="text-sm">Loading…</div>}

            <div className="grid gap-3">
              {items.map((row) => <Row key={row.id} row={row} />)}
              {!loading && items.length === 0 && <div className="text-sm text-gray-600">No results.</div>}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                className="px-3 py-1 rounded border disabled:opacity-50"
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0}
              >Prev</button>
              <span className="text-sm">Page {page} · {total} total</span>
              <button
                className="px-3 py-1 rounded border disabled:opacity-50"
                onClick={() => setOffset(offset + limit)}
                disabled={offset + limit >= total}
              >Next</button>
            </div>
          </>
        )}
      </SignedIn>
    </main>
  );
}
