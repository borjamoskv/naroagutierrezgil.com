/// <reference types="@cloudflare/workers-types" />

export interface Env {
  RADIANCE_MEMORY: KVNamespace;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const rawState = await context.env.RADIANCE_MEMORY.get("kintsugi_state");
    const state = rawState ? JSON.parse(rawState) : { entropy: 0, repairs: 0, scars: [] };

    return new Response(JSON.stringify(state), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache"
      }
    });
  } catch (err) {
    return new Response("Internal Server Error", { status: 500 });
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as { type: "FRICTION" | "REPAIR", payload?: { x: number, y: number, intensity: number } };
    
    const rawState = await context.env.RADIANCE_MEMORY.get("kintsugi_state");
    const state = rawState ? JSON.parse(rawState) : { entropy: 0, repairs: 0, scars: [] };

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

    await context.env.RADIANCE_MEMORY.put("kintsugi_state", JSON.stringify(state));

    return new Response(JSON.stringify(state), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (err) {
    return new Response("Internal Server Error", { status: 500 });
  }
};
