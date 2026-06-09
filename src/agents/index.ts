import { routeAgentRequest } from 'agents';
import { EntropicCanvasAgent } from './EntropicCanvasAgent';

export { EntropicCanvasAgent };

const BACKENDS = [
  "https://naroagutierrezgil-com.pages.dev",
  "https://naroa.online"
];

async function proxyRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  
  // Exclude API and agents routing
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/agents/")) {
    return new Response("CORTEX: API endpoint not found.", { status: 404 });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s timeout

  const fetchPromise = async (backend: string) => {
    const targetUrl = new URL(url.pathname + url.search, backend);
    
    // Copy headers and sanitize
    const newHeaders = new Headers(request.headers);
    newHeaders.set("Host", new URL(backend).host);
    
    return fetch(targetUrl.toString(), {
      method: request.method,
      headers: newHeaders,
      body: request.method !== "GET" && request.method !== "HEAD" ? request.body : undefined,
      redirect: "manual",
      signal: controller.signal
    });
  };

  try {
    // 1. Race/Try Cloudflare Pages first (local edge)
    const primaryResponse = await fetchPromise(BACKENDS[0]);
    clearTimeout(timeoutId);
    return primaryResponse;
  } catch (err) {
    // 2. Fallback to Vercel if Pages is down or slow
    try {
      const fallbackResponse = await fetchPromise(BACKENDS[1]);
      clearTimeout(timeoutId);
      return fallbackResponse;
    } catch (fallbackErr) {
      clearTimeout(timeoutId);
      return new Response("Galaxy Brain Router: All backends are unreachable (Byzantine Outage).", { status: 502 });
    }
  }
}

const worker = {
  /**
   * Punto de entrada del Worker para las peticiones HTTP y WebSockets.
   * Intercepta /agents/* y balancea el resto del tráfico entre los dos backends activos (Pages/Vercel).
   */
  async fetch(request: Request, env: unknown, _ctx: unknown): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/test-kv-inspect") {
      const kv = (env as any).RADIANCE_MEMORY;
      if (!kv) {
        return new Response(JSON.stringify({ error: "RADIANCE_MEMORY binding not found" }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
      try {
        const list = await kv.list();
        const results: Record<string, any> = {};
        for (const key of list.keys) {
          const val = await kv.get(key.name);
          try {
            results[key.name] = JSON.parse(val || "");
          } catch {
            results[key.name] = val;
          }
        }
        return new Response(JSON.stringify({ keys: list.keys.map((k: any) => k.name), data: results }), {
          headers: { "Content-Type": "application/json" }
        });
      } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    const response = await routeAgentRequest(request, env);
    if (response) {
      return response;
    }
    
    return proxyRequest(request);
  }
};

export default worker;
