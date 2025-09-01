module.exports = [
"[project]/.next-internal/server/app/api/ask/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/punycode [external] (punycode, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("punycode", () => require("punycode"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[project]/app/api/ask/route.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// app/api/ask/route.js
__turbopack_context__.s([
    "POST",
    ()=>POST,
    "dynamic",
    ()=>dynamic
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/openai/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$client$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__OpenAI__as__default$3e$__ = __turbopack_context__.i("[project]/node_modules/openai/client.mjs [app-route] (ecmascript) <export OpenAI as default>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/module/index.js [app-route] (ecmascript) <locals>");
;
;
const supa = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(("TURBOPACK compile-time value", "sb_publishable__ArmHl0h5hctElqBgH81jg_U3yk6POc"), process.env.SUPABASE_SERVICE_ROLE, {
    auth: {
        persistSession: false
    }
});
const dynamic = "force-dynamic";
async function POST(req) {
    try {
        const { question } = await req.json();
        if (!question?.trim()) {
            return Response.json({
                error: "No question provided."
            }, {
                status: 400
            });
        }
        // 1) embed the question
        const openai = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$client$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__OpenAI__as__default$3e$__["default"]({
            apiKey: process.env.OPENAI_API_KEY
        });
        const EMBED_MODEL = process.env.EMBED_MODEL || "text-embedding-3-small";
        const CHAT_MODEL = process.env.CHAT_MODEL || "gpt-4o-mini";
        const qEmb = await openai.embeddings.create({
            model: EMBED_MODEL,
            input: question
        });
        const queryVec = qEmb.data[0].embedding;
        // 2) fetch top matches from Supabase
        const supa = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(("TURBOPACK compile-time value", "sb_publishable__ArmHl0h5hctElqBgH81jg_U3yk6POc"), process.env.SUPABASE_SERVICE_ROLE, {
            auth: {
                persistSession: false
            }
        });
        const { data: matches, error } = await supa.rpc("match_chunks", {
            query_embedding: queryVec,
            match_threshold: 0.0,
            match_count: 5
        });
        if (error) throw new Error("DB search failed: " + error.message);
        const context = (matches || []).map((m, i)=>`[#${i + 1} ${m.source || "source"}] ${m.content}`).join("\n---\n");
        // If we found nothing, bail early with a friendly nudge
        if (!context) {
            return Response.json({
                answer: `I couldn't find this in our chapter notes yet. Try rephrasing or ask an officer to add it on /admin.`,
                sources: []
            });
        }
        // 3) ask GPT to answer USING ONLY the retrieved context
        const system = `You are an Alpha Phi helper.
Use ONLY the "Context" below. If something is missing, say you aren’t sure and suggest asking an officer.
Keep answers short. Cite chunks like [#1], [#2].`;
        const completion = await openai.chat.completions.create({
            model: CHAT_MODEL,
            temperature: 0.2,
            max_tokens: 350,
            messages: [
                {
                    role: "system",
                    content: system
                },
                {
                    role: "user",
                    content: `Question: ${question}\n\nContext:\n${context}`
                }
            ]
        });
        const answer = completion.choices?.[0]?.message?.content ?? "Sorry, not sure.";
        const sources = (matches || []).map((m, i)=>({
                n: i + 1,
                source: m.source,
                url: m.url
            }));
        return Response.json({
            answer,
            sources
        });
    } catch (err) {
        const status = err?.status || err?.response?.status || 500;
        const msg = err?.message || "Server error";
        // graceful message for credit/rate limits
        if (status === 429 || /quota/i.test(msg)) {
            return Response.json({
                error: "Our AI hit her budget for today—try again later or DM an officer."
            }, {
                status: 429
            });
        }
        return Response.json({
            error: msg
        }, {
            status
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__08e6f5a4._.js.map