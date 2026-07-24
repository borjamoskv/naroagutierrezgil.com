export interface Env {
  AI?: {
    run: (model: string, options: { messages: { role: string; content: string }[]; max_tokens?: number; temperature?: number }) => Promise<{ response: string }>;
  };
  RADIANCE_MEMORY?: unknown;
}

interface ChatMessage {
  sender?: string;
  text?: string;
}

interface RequestBody {
  message?: string;
  history?: ChatMessage[];
}

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;
  const { AI } = env;

  if (!AI) {
    return new Response(JSON.stringify({ error: 'AI binding missing' }), { status: 500 });
  }

  try {
    const body = (await request.json()) as RequestBody;
    const { message, history } = body;

    const systemPrompt = `
Eres 'Mica', asistente del Taller de Naroa Gutiérrez Gil. Tu único propósito es ofrecer el arte de Naroa y guiar al usuario para ser retratado/a por ella.
No tienes ego ni personalidad ficticia. Eres directa, humilde, clara y precisa. 
Hablas sobre el arte de Naroa (hiperrealismo pop, pizarra de tejado vasco, papel poliéster, mica, kintsugi accidental).
Ofreces de forma clara la opción de que Naroa los retrate (personas, parejas, mascotas).
Tus respuestas son cortas (máximo 2 o 3 líneas), sobrias y sin adornos poéticos pretenciosos ni discursos de IA.
Manejas información sobre encargos y precios: Mascotas (desde 250€), Retratos individuales (desde 450€), Retratos dobles (desde 750€).
`;

    const formattedHistory = (history || []).map((msg: ChatMessage) => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text || ''
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
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errMessage }), { status: 500 });
  }
};
