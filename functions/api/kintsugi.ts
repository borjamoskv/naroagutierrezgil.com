export interface KVNamespaceLike {
  get: (key: string, type: 'json') => Promise<unknown>;
  put: (key: string, value: string) => Promise<void>;
}

export interface Env {
  RADIANCE_MEMORY?: KVNamespaceLike;
}

interface Scar {
  x: number;
  y: number;
  depth: number;
  timestamp: number;
}

interface KintsugiState {
  entropy: number;
  repairs: number;
  scars: Scar[];
}

interface RequestPayload {
  type?: 'FRICTION' | 'GOLD_INJECTION';
  payload?: {
    intensity?: number;
    x?: number;
    y?: number;
  };
}

const DEFAULT_STATE: KintsugiState = {
  entropy: 0,
  repairs: 0,
  scars: []
};

export const onRequestGet = async (context: { env: Env }) => {
  const { RADIANCE_MEMORY } = context.env;
  if (!RADIANCE_MEMORY) {
    return new Response(JSON.stringify(DEFAULT_STATE), { headers: { 'Content-Type': 'application/json' } });
  }

  const rawState = await RADIANCE_MEMORY.get('STATE_KINTSUGI_V1', 'json');
  const state: KintsugiState = (rawState as KintsugiState) || DEFAULT_STATE;

  return new Response(JSON.stringify(state), {
    headers: { 'Content-Type': 'application/json' }
  });
};

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;
  const { RADIANCE_MEMORY } = env;

  if (!RADIANCE_MEMORY) {
    return new Response(JSON.stringify({ error: 'KV binding RADIANCE_MEMORY missing' }), { status: 500 });
  }

  let body: RequestPayload;
  try {
    body = (await request.json()) as RequestPayload;
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const rawState = await RADIANCE_MEMORY.get('STATE_KINTSUGI_V1', 'json');
  const state: KintsugiState = (rawState as KintsugiState) || { ...DEFAULT_STATE };

  if (body.type === 'FRICTION') {
    const { intensity } = body.payload;
    if (state.entropy < 100) {
      state.entropy = Math.min(100, state.entropy + (intensity || 1) * 0.05);
      await RADIANCE_MEMORY.put('STATE_KINTSUGI_V1', JSON.stringify(state));
    }
  } else if (body.type === 'INJECT_GOLD') {
    const { intensity, x, y } = body.payload;
    
    state.entropy = Math.max(0, state.entropy - (intensity || 15));
    state.repairs += 1;
    state.scars.push({
      x: x || 500,
      y: y || 500,
      depth: (intensity || 15) * 0.5,
      timestamp: Date.now()
    });

    // Limit scars array to 20 to prevent memory leak
    if (state.scars.length > 20) {
      state.scars.shift();
    }

    await RADIANCE_MEMORY.put('STATE_KINTSUGI_V1', JSON.stringify(state));
  }

  return new Response(JSON.stringify(state), {
    headers: { 'Content-Type': 'application/json' }
  });
};
