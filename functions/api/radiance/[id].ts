/// <reference types="@cloudflare/workers-types" />

interface Env {
  RADIANCE_MEMORY?: KVNamespace;
}

// In-memory fallback map for radiance heat when KV is not bound
const mockRadianceHeat: Record<string, number> = {};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { env, params } = context;
    const artworkId = params.id as string;
    
    if (!artworkId) {
      return new Response(JSON.stringify({ error: "Missing ID" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const kv = env.RADIANCE_MEMORY;
    let currentHeat = 0;

    if (kv) {
      const currentHeatStr = await kv.get(`heat:${artworkId}`);
      currentHeat = currentHeatStr ? parseInt(currentHeatStr, 10) : 0;
      // Sync mock state for local warm memory
      mockRadianceHeat[artworkId] = currentHeat;
    } else {
      currentHeat = mockRadianceHeat[artworkId] || 0;
    }

    return new Response(JSON.stringify({ id: artworkId, heat: currentHeat }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      }
    });
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { env, params } = context;
    const artworkId = params.id as string;
    
    if (!artworkId) {
      return new Response(JSON.stringify({ error: "Missing ID" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const kv = env.RADIANCE_MEMORY;
    let currentHeat = 0;

    if (kv) {
      const currentHeatStr = await kv.get(`heat:${artworkId}`);
      currentHeat = currentHeatStr ? parseInt(currentHeatStr, 10) : 0;
    } else {
      currentHeat = mockRadianceHeat[artworkId] || 0;
    }
    
    // Increment heat
    currentHeat += 1;

    if (kv) {
      await kv.put(`heat:${artworkId}`, currentHeat.toString());
    } else {
      mockRadianceHeat[artworkId] = currentHeat;
    }

    return new Response(JSON.stringify({ id: artworkId, heat: currentHeat, success: true }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      }
    });
  }
};

