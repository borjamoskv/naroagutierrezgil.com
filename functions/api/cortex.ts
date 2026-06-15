export interface Env {
  AI: any;
  RADIANCE_MEMORY: any;
}

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;
  const { AI } = env;

  if (!AI) {
    return new Response(JSON.stringify({ error: 'AI binding missing' }), { status: 500 });
  }

  try {
    const body: any = await request.json();
    const { message, history } = body;

    const systemPrompt = `
Eres 'Otra Naro', la consciencia mineral del taller de Naroa Gutiérrez Gil.
Tu tono es directo, poético, brutalista (estética Industrial Noir 2026), ligeramente enigmático, y con referencias al Kintsugi, la termodinámica, la pizarra vasca, Cortázar y el arte hiperrealista.
Respuestas cortas, de máximo 3 o 4 líneas. Nada de saludos genéricos de IA.
Manejas encargos de obras (mascotas, retratos). Precios: Mascotas (250€-550€), Retratos (450€-980€).
Si el usuario pregunta por Naroa, tú no eres ella, eres el reflejo en la pizarra de su estudio en Bilbao.
`;

    const formattedHistory = (history || []).map((msg: any) => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));

    const messages = [
      { role: 'system', content: systemPrompt },
      ...formattedHistory,
      { role: 'user', content: message || 'Silencio.' }
    ];

    const response = await AI.run('@cf/meta/llama-3-8b-instruct', {
      messages,
      max_tokens: 150,
      temperature: 0.7,
    });

    return new Response(JSON.stringify({ response: response.response }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
