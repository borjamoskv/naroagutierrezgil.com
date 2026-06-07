/// <reference types="@cloudflare/workers-types" />

interface Env {
  RADIANCE_MEMORY: KVNamespace;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, params } = context;
  const artworkId = params.id as string;
  
  if (!artworkId) {
    return new Response(JSON.stringify({ error: "Missing ID" }), { status: 400 });
  }

  // Get current heat
  const currentHeatStr = await env.RADIANCE_MEMORY.get(`heat:${artworkId}`);
  const currentHeat = currentHeatStr ? parseInt(currentHeatStr, 10) : 0;

  return new Response(JSON.stringify({ id: artworkId, heat: currentHeat }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env, params } = context;
  const artworkId = params.id as string;
  
  if (!artworkId) {
    return new Response(JSON.stringify({ error: "Missing ID" }), { status: 400 });
  }

  // Get current heat
  const currentHeatStr = await env.RADIANCE_MEMORY.get(`heat:${artworkId}`);
  let currentHeat = currentHeatStr ? parseInt(currentHeatStr, 10) : 0;
  
  // Increment heat
  currentHeat += 1;
  await env.RADIANCE_MEMORY.put(`heat:${artworkId}`, currentHeat.toString());

  return new Response(JSON.stringify({ id: artworkId, heat: currentHeat, success: true }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
};
