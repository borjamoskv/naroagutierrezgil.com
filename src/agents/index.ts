import { routeAgentRequest } from 'agents';
import { EntropicCanvasAgent } from './EntropicCanvasAgent';

export { EntropicCanvasAgent };

const worker = {
  /**
   * Punto de entrada del Worker para las peticiones HTTP y WebSockets.
   * routeAgentRequest intercepta /agents/{agentName}/{instanceName} automáticamente.
   */
  async fetch(request: Request, env: unknown, _ctx: unknown): Promise<Response> {
    const response = await routeAgentRequest(request, env);
    return response ?? new Response("CORTEX: Entidad de Agente no localizada.", { status: 404 });
  }
};
export default worker;
