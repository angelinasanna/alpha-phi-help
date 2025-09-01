// app/admin/page.js
"use client";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs";
import { useEffect, useMemo, useState } from "react";

// optional: allow admins via email env list or Clerk role
function useIsAdmin() {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase() || "";
  const role = user?.publicMetadata?.role;
  const allowed = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
  return role === "admin" || allowed.includes(email);
}

export default function AdminAllInOne() {
  const isAdmin = useIsAdmin();

  // Create form
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // List/search/pagination
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(false);
  const page = useMemo(() => Math.floor(offset / limit) + 1, [offset, limit]);

  async function load() {
    setLoading(true);
    const res = await fetch(
      `/api/admin/chunks?q=${encodeURIComponent(q)}&limit=${limit}&offset=${offset}`
    );
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setItems(data.items || []);
      setTotal(data.total || 0);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, offset]);

  async function createEntry() {
    setSaveMsg("");
    if (!content.trim()) {
      setSaveMsg("Please add some info first!");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/chunks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, url: url || null }), // server defaults source
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setSaveMsg(data.error || `Error ${res.status}`);
      else {
        setSaveMsg("Saved!");
        setContent("");
        setUrl("");
        setOffset(0);
        load();
      }
    } catch {
      setSaveMsg("Network error — try again.");
    } finally {
      setSaving(false);
    }
  }

  async function saveEdit(row) {
    const res = await fetch(`/api/admin/chunks/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: row.content, url: row.url ?? null }), // only content+url
    });
    if (res.ok) load();
    else alert((await res.json()).error || "Error saving");
  }

  async function del(id) {
    if (!confirm("Delete this entry?")) return;
    const res = await fetch(`/api/admin/chunks/${id}`, { method: "DELETE" });
    if (res.ok) load();
    else alert((await res.json()).error || "Error deleting");
  }

  function Row({ row }) {
    const [edit, setEdit] = useState(false);
    const [draft, setDraft] = useState(row);

    return (
      <div className="border rounded p-3 bg-white/70">
        {edit ? (
          <>
            {/* Editable content */}
            <textarea
              className="border rounded px-2 py-1 w-full min-h-[120px]"
              value={draft.content}
              onChange={(e) => setDraft({ ...draft, content: e.target.value })}
            />
            {/* Optional URL */}
            <input
              className="border rounded px-2 py-1 w-full mt-2"
              value={draft.url || ""}
              onChange={(e) => setDraft({ ...draft, url: e.target.value })}
              placeholder="Optional URL"
            />
            <div className="mt-2 flex gap-2">
              <button
                className="px-3 py-1 rounded bg-[#7a1f3d] text-white"
                onClick={async () => {
                  await saveEdit(draft);
                  setEdit(false);
                }}
              >
                Save
              </button>
              <button
                className="px-3 py-1 rounded border"
                onClick={() => {
                  setDraft(row);
                  setEdit(false);
                }}
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-sm text-gray-500">
              {new Date(row.created_at).toLocaleString()}
            </div>
            {row.url && (
              <a className="underline text-sm" href={row.url} target="_blank">
                {row.url}
              </a>
            )}
            <p className="mt-2 whitespace-pre-wrap">{row.content}</p>
            <div className="mt-2 flex gap-2">
              <button className="px-3 py-1 rounded border" onClick={() => setEdit(true)}>
                Edit
              </button>
              <button
                className="px-3 py-1 rounded border text-red-600"
                onClick={() => del(row.id)}
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Add Info!</h1>

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
            {/* Create form */}
            <section className="space-y-2 border rounded p-4 bg-white/70">
              <textarea
                className="w-full border rounded px-3 py-2 min-h-[160px]"
                placeholder="Paste info, event details, policy, etc…"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="Optional URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <div className="flex items-center gap-3">
                <button
                  onClick={createEntry}
                  disabled={saving}
                  className="px-4 py-2 rounded bg-[#7a1f3d] text-white disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
                {saveMsg && <span className="text-sm">{saveMsg}</span>}
              </div>
              <p className="text-xs text-gray-600">
                Tip: include words members will search (e.g., “dues”, “big/little”, "dates").
              </p>
            </section>

            {/* Search box */}
            <div className="flex gap-2 items-center">
              <input
                className="border rounded px-3 py-2 w-full"
                placeholder="Search entries by text…"
                value={q}
                onChange={(e) => {
                  setOffset(0);
                  setQ(e.target.value);
                }}
              />
              {loading && <span className="text-sm text-gray-600">Loading…</span>}
            </div>

            {/* Results */}
            <div className="grid gap-3">
              {items.map((row) => (
                <Row key={row.id} row={row} />
              ))}
              {!loading && items.length === 0 && (
                <div className="text-sm text-gray-600">No results.</div>
              )}
            </div>

            {/* Pagination */}
            <div className="flex items-center gap-3 pt-2">
              <button
                className="px-3 py-1 rounded border disabled:opacity-50"
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0}
              >
                Prev
              </button>
              <span className="text-sm">
                Page {page} · {total} total
              </span>
              <button
                className="px-3 py-1 rounded border disabled:opacity-50"
                onClick={() => setOffset(offset + limit)}
                disabled={offset + limit >= total}
              >
                Next
              </button>
            </div>
          </>
        )}
      </SignedIn>
    {/* Go back button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link
          href="/"
          className="inline-block px-4 py-2 rounded bg-[#7a1f3d] text-white hover:opacity-90"
        >
          Go Back
        </Link>
      </div>
    </main>
  );
}
