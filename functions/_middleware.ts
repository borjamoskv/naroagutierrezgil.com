interface EventContext {
  request: Request;
  env: unknown;
  next: () => Promise<Response>;
}
type PagesFunction = (context: EventContext) => Promise<Response>;

export const onRequest: PagesFunction = async (context: EventContext) => {
  const url = new URL(context.request.url);
  
  const host = url.hostname;
  
  // Enrutamiento de Dominio Dual (Sanedrín de Arte)
  // naroa.online -> Bóveda transaccional (/shop, /recreo, /cdn-cgi)
  // naroagutierrezgil.com -> Templo 3D Awwwards (/)
  if (host === 'www.naroagutierrezgil.com' || host.includes('.pages.dev')) {
    // Canonicalize to root domain for Awwwards
    url.hostname = 'naroagutierrezgil.com';
    return Response.redirect(url.toString(), 301);
  }

  // Cross-domain logic: If someone tries to access /shop on the Templo, redirect to Bóveda
  if (host === 'naroagutierrezgil.com' && (url.pathname.startsWith('/shop') || url.pathname.startsWith('/recreo'))) {
    url.hostname = 'naroa.online';
    return Response.redirect(url.toString(), 301);
  }

  // If someone tries to access the Templo root on the Bóveda, redirect to Templo
  if (host === 'naroa.online' && url.pathname === '/') {
    url.hostname = 'naroagutierrezgil.com';
    return Response.redirect(url.toString(), 301);
  }

  // Local fallback for Cloudflare Images resize paths
  if (host === 'localhost' || host === '127.0.0.1') {
    if (url.pathname.includes('/cdn-cgi/image/')) {
      const parts = url.pathname.split('/assets/');
      if (parts.length > 1) {
        const assetUrl = new URL('/assets/' + parts[1], url.origin);
        return fetch(assetUrl.toString());
      }
    }
  }

  // Security Headers (Bonus)
  const response = await context.next();
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  return response;
};
