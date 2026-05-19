// Music Master – Backend Stubs
// ------------------------------------------------------------
// Este documento reúne tres stubs de backend para el endpoint
// POST /action compatible con tu OpenAPI.
// Incluye:
//  1) Vercel Serverless (Node/TS)  -> /api/action.ts
//  2) Cloudflare Worker (TS)       -> /src/worker.ts
//  3) Express (Node/TS o JS)       -> server.(ts|js)
//
// Pasos rápidos:
//  A) Elige un objetivo (Vercel, Cloudflare o Express) y despliega.
//  B) Copia la URL pública y pégala en `servers[0].url` de tu OpenAPI.
//  C) Prueba:
//     curl -X POST "$URL/action" -H "Content-Type: application/json" \
//          -d '{"action":"make_setlist","params":{"start_bpm":132,"end_bpm":90,"duracion_min":75,"arco":"rave→spa"}}'
//
// Nota: Este stub solo valida y enruta las 50 acciones core
//       (las enumeradas en tu OpenAPI). Añade más si amplías el spec.

// ────────────────────────────────────────────────────────────
// COMÚN: registro y utilidades
// ────────────────────────────────────────────────────────────

const ACTIONS_CORE = [
  "make_setlist",
  "set_arc_plot",
  "bpm_energy_map",
  "crate_digger",
  "key_detect",
  "tempo_map",
  "groove_extractor",
  "swing_injector",
  "cue_points_auto",
  "transition_suggester",
  "master_warm_club",
  "stem_balancer",
  "transient_sculpt",
  "bass_consistency",
  "kick_bass_align",
  "stereo_field_analyzer",
  "haas_magic",
  "sibilance_tamer",
  "reverb_match",
  "spectral_space",
  "cover_art_glitch",
  "logo_gen",
  "sticker_pack_png",
  "animated_loop",
  "frames_videoclip_batch",
  "prompt_forge_video",
  "prompt_forge_music",
  "glitch_poetry",
  "silence_sculptor",
  "persona_voice_cast",
  "mint_pack_zora",
  "zora_stream_prep",
  "trait_csv_builder",
  "rarity_balancer",
  "metadata_autofill",
  "pfp_variations",
  "airdrop_plan",
  "onchain_mixdrop",
  "press_release",
  "track_desc_es",
  "hook_generator",
  "thread_writer",
  "email_pitch",
  "bio_variations",
  "title_shaker",
  "tagline_lab",
  "fan_segmenter",
  "analytics_digest",
  "folder_structure_builder",
  "backup_manifest"
] as const;

type ActionName = typeof ACTIONS_CORE[number];

type RunActionRequest = {
  action: ActionName;
  params?: Record<string, any>;
  dryRun?: boolean;
};

type RunActionResponse = {
  ok: boolean;
  action?: ActionName;
  result?: any;
  logs?: string[];
  error?: string;
};

function jsonResponse(body: any, status = 200, cors = true) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (cors) {
    headers["Access-Control-Allow-Origin"] = "*";
    headers["Access-Control-Allow-Headers"] = "*";
    headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
  }
  return { status, headers, body: JSON.stringify(body) };
}

function validateAction(name: string): name is ActionName {
  return (ACTIONS_CORE as ReadonlyArray<string>).includes(name);
}

// Simulación de un registry de acciones. Aquí devuelves resultados reales.
const handlers: Record<ActionName, (params: any) => Promise<any>> = Object.fromEntries(
  (ACTIONS_CORE as ReadonlyArray<ActionName>).map((a) => [
    a,
    async (params: any) => ({ message: `Stub ejecutado para '${a}'`, echo: params ?? {} })
  ])
) as any;

// ────────────────────────────────────────────────────────────
// 1) VERCEL SERVERLESS  (archivo: /api/action.ts)
// ────────────────────────────────────────────────────────────

/*
// Estructura de proyecto sugerida:
// .
// ├─ api/
// │  └─ action.ts
// ├─ package.json
// └─ tsconfig.json (opcional si usas TS)
*/

export default async function handlerVercel(req: any, res: any) {
  // CORS preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    const { status, headers, body } = jsonResponse({ ok: false, error: "Method not allowed" }, 405);
    Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(status).send(body);
  }

  try {
    const contentType = req.headers["content-type"] || "";
    if (!String(contentType).includes("application/json")) {
      const { status, headers, body } = jsonResponse({ ok: false, error: "Content-Type must be application/json" }, 415);
      Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
      return res.status(status).send(body);
    }

    const bodyIn: RunActionRequest = req.body && typeof req.body === "object" ? req.body : JSON.parse(req.rawBody || req.body || "{}");

    if (!bodyIn || !bodyIn.action) {
      const { status, headers, body } = jsonResponse({ ok: false, error: "'action' requerido" }, 400);
      Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
      return res.status(status).send(body);
    }

    if (!validateAction(bodyIn.action)) {
      const { status, headers, body } = jsonResponse({ ok: false, error: `Acción no soportada: ${bodyIn.action}` }, 400);
      Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
      return res.status(status).send(body);
    }

    const run = handlers[bodyIn.action];
    const result = bodyIn.dryRun ? { dryRun: true, accepted: true, params: bodyIn.params ?? {} } : await run(bodyIn.params ?? {});

    const out: RunActionResponse = {
      ok: true,
      action: bodyIn.action,
      result,
      logs: ["validated params", bodyIn.dryRun ? "dry-run" : "executed"]
    };

    const { status, headers, body } = jsonResponse(out, 200);
    Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(status).send(body);
  } catch (err: any) {
    const { status, headers, body } = jsonResponse({ ok: false, error: err?.message || String(err) }, 500);
    Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(status).send(body);
  }
}

// ────────────────────────────────────────────────────────────
// 2) CLOUDFLARE WORKER  (archivo: /src/worker.ts)
// ────────────────────────────────────────────────────────────

export default {
  async fetch(request: Request, env: Record<string, any>, ctx: ExecutionContext): Promise<Response> {
    // CORS preflight
    if (request.method === "OPTIONS") {
      const pre = jsonResponse({}, 204);
      return new Response(pre.body, { status: pre.status, headers: pre.headers as any });
    }

    if (request.method !== "POST") {
      const bad = jsonResponse({ ok: false, error: "Method not allowed" }, 405);
      return new Response(bad.body, { status: bad.status, headers: bad.headers as any });
    }

    try {
      const contentType = request.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const r = jsonResponse({ ok: false, error: "Content-Type must be application/json" }, 415);
        return new Response(r.body, { status: r.status, headers: r.headers as any });
      }

      const bodyIn = (await request.json()) as RunActionRequest;

      if (!bodyIn || !bodyIn.action) {
        const r = jsonResponse({ ok: false, error: "'action' requerido" }, 400);
        return new Response(r.body, { status: r.status, headers: r.headers as any });
      }

      if (!validateAction(bodyIn.action)) {
        const r = jsonResponse({ ok: false, error: `Acción no soportada: ${bodyIn.action}` }, 400);
        return new Response(r.body, { status: r.status, headers: r.headers as any });
      }

      const run = handlers[bodyIn.action];
      const result = bodyIn.dryRun ? { dryRun: true, accepted: true, params: bodyIn.params ?? {} } : await run(bodyIn.params ?? {});

      const out: RunActionResponse = {
        ok: true,
        action: bodyIn.action,
        result,
        logs: ["validated params", bodyIn.dryRun ? "dry-run" : "executed"]
      };

      const r = jsonResponse(out, 200);
      return new Response(r.body, { status: r.status, headers: r.headers as any });
    } catch (err: any) {
      const r = jsonResponse({ ok: false, error: err?.message || String(err) }, 500);
      return new Response(r.body, { status: r.status, headers: r.headers as any });
    }
  }
};

// ────────────────────────────────────────────────────────────
// 3) EXPRESS SERVER  (archivo: server.ts o server.js)
// ────────────────────────────────────────────────────────────

/*
// package.json (mínimo):
// {
//   "name": "music-master-server",
//   "version": "1.0.0",
//   "type": "module",
//   "scripts": { "start": "node server.js" }
// }
*/

import express from "express";

const app = express();
app.use(express.json({ limit: "5mb" }));

// CORS simple
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") return res.status(204).end();
  next();
});

app.post("/action", async (req, res) => {
  try {
    const bodyIn: RunActionRequest = req.body;
    if (!bodyIn || !bodyIn.action) {
      return res.status(400).json({ ok: false, error: "'action' requerido" });
    }
    if (!validateAction(bodyIn.action)) {
      return res.status(400).json({ ok: false, error: `Acción no soportada: ${bodyIn.action}` });
    }

    const run = handlers[bodyIn.action];
    const result = bodyIn.dryRun ? { dryRun: true, accepted: true, params: bodyIn.params ?? {} } : await run(bodyIn.params ?? {});

    const out: RunActionResponse = {
      ok: true,
      action: bodyIn.action,
      result,
      logs: ["validated params", bodyIn.dryRun ? "dry-run" : "executed"]
    };
    return res.status(200).json(out);
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || String(err) });
  }
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => {
  console.log(`Music Master server escuchando en :${PORT}`);
});

// ────────────────────────────────────────────────────────────
// FIN – Amplía "handlers" con lógica real por acción cuando quieras.
// Si añades acciones nuevas, recuerda actualizar el OpenAPI y el array ACTIONS_CORE.
