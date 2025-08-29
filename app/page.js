// app/page.js
"use client";
import { useState } from "react";
import { Lora } from "next/font/google";
const titleFont = Lora({ subsets: ["latin"], weight: ["700"] });

export default function Home() {
  const [q, setQ] = useState("");
  const [a, setA] = useState("");
  const [sources, setSources] = useState([]);   // (1) NEW: sources state
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function ask() {
    setErr(""); setA(""); setSources([]);       // clear old stuff
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setA(data.answer || "No answer.");
      setSources(Array.isArray(data.sources) ? data.sources : []);  // (2) NEW: save sources
    } catch (e) {
    const msg = String(e?.message || e);
    const friendly =
        /429/.test(msg)
        ? "Our AI hit her budget for today—try again later or tell an officer."
        : /401|403/.test(msg)
        ? "Members only—please sign in with your andrew email."
        : /timeout|network/i.test(msg)
        ? "Wi-Fi mood swing. Give it a sec and try again."
        : "Unexpected glitch. Try again, and if it keeps happening, ping an officer.";

    setErr(friendly);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="space-y-4">
      {/* Title in new font + dark red */}
      <h1 className={`${titleFont.className} text-5xl font-bold text-center text-[#7a1f3d]`}>
        Phi-nally Answers
      </h1>

      <div className="flex gap-2">
        <input
          className="flex-1 rounded px-3 py-2 border border-gray-300 bg-white/70
             placeholder:text-gray-500 focus:outline-none focus:ring-2
             focus:ring-gray-400 focus:border-gray-400"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ask a question (e.g., When is Big/Little reveal?)"
        />
        <button
          onClick={ask}
          disabled={loading}
          className="px-4 py-2 rounded bg-[#7a1f3d] text-white hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Thinking..." : "Ask"}
        </button>
      </div>

      {/* (optional) show errors */}
      {err && <div className="text-red-600 text-sm">{err}</div>}

      {/* Answer + sources */}
      {a && (
        <div className="space-y-3">
          <div className="border rounded p-4 whitespace-pre-wrap border-gray-300 bg-white/70">
            {a}
          </div>

          {/* (3) NEW: sources list with optional links */}
          {sources.length > 0 && (
            <div className="text-sm text-gray-700">
              <div className="font-medium mb-1">Sources:</div>
              <ul className="list-disc pl-5">
                {sources.map((s) => (
                  <li key={s.n}>
                    [#{s.n}] {s.source || "source"}
                    {s.url ? (
                      <> — <a className="underline" href={s.url} target="_blank">link</a></>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

