interface EventContext {
  request: Request;
  next: () => Promise<Response>;
}
type PagesFunction = (context: EventContext) => Promise<Response>;

export const onRequest: PagesFunction = async (context: EventContext) => {
  const url = new URL(context.request.url);
  
  // Vector 3 (SEO): Canonicalization
  // Consolidar el link juice hacia el dominio principal de la artista.
  if (url.hostname === 'naroa.online') {
    url.hostname = 'naroagutierrezgil.com';
    return Response.redirect(url.toString(), 301);
  }

  // Security Headers (Bonus)
  const response = await context.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  return response;
};
