/// <reference types="@cloudflare/workers-types" />

export interface Env {
  RADIANCE_MEMORY?: KVNamespace;
}

// In-memory mock state fallback when KV is not bound
let mockKintsugiState = { entropy: 0, repairs: 0, scars: [] as any[] };

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const kv = context.env.RADIANCE_MEMORY;
    let state = mockKintsugiState;

    if (kv) {
      const rawState = await kv.get("kintsugi_state");
      if (rawState) {
        state = JSON.parse(rawState);
        // Sync mock state for local warm memory
        mockKintsugiState = state;
      }
    }

    return new Response(JSON.stringify(state), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache"
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as { type: "FRICTION" | "REPAIR", payload?: { x: number, y: number, intensity: number } };
    const kv = context.env.RADIANCE_MEMORY;
    
    let state = mockKintsugiState;

    if (kv) {
      const rawState = await kv.get("kintsugi_state");
      if (rawState) {
        state = JSON.parse(rawState);
      }
    }

    if (body.type === "FRICTION") {
      // Each interaction adds micro-entropy
      state.entropy = Math.min(100, state.entropy + 0.05);
    } else if (body.type === "REPAIR") {
      // Repair heals entropy and leaves a golden scar
      state.entropy = Math.max(0, state.entropy - 2.5);
      state.repairs += 1;
      
      if (body.payload) {
        state.scars.push({
          x: body.payload.x,
          y: body.payload.y,
          intensity: body.payload.intensity,
          timestamp: Date.now()
        });
      }

      // Limit scars to prevent KV bloat
      if (state.scars.length > 50) {
        state.scars = state.scars.slice(-50);
      }
    }

    // Save back to KV if bound, else update in-memory mock
    if (kv) {
      await kv.put("kintsugi_state", JSON.stringify(state));
    } else {
      mockKintsugiState = state;
    }

    return new Response(JSON.stringify(state), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

