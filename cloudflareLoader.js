export default function cloudflareLoader({ src, width, quality }) {
  const params = [`width=${width}`];
  if (quality) {
    params.push(`quality=${quality}`);
  }
  params.push('format=auto');
  
  // Cloudflare Docs: /cdn-cgi/image/width=80,format=auto/https://example.com/image.jpg
  return `/cdn-cgi/image/${params.join(',')}/${src}`;
}
