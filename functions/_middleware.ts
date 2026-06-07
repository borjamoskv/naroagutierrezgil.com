interface EventContext {
  request: Request;
  env: unknown;
  next: () => Promise<Response>;
}
type PagesFunction = (context: EventContext) => Promise<Response>;

export const onRequest: PagesFunction = async (context: EventContext) => {
  const url = new URL(context.request.url);
  
  const host = url.hostname;
  
  // TEMPORARILY DISABLED REDIRECTS FOR TESTING ON PAGES.DEV
  // if (host.includes('.pages.dev') || host === 'naroa.online' || host === 'www.naroagutierrezgil.com') {
  //   url.hostname = 'naroagutierrezgil.com';
  //   return Response.redirect(url.toString(), 301);
  // }

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
