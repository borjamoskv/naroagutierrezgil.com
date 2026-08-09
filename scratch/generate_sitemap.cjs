const fs = require('fs');

const artworksFile = 'src/artworks.ts';
const sitemapFile = 'public/sitemap.xml';

let content = fs.readFileSync(artworksFile, 'utf-8');

// Use regex to extract all url, title and descriptions
const regex = /url:\s*'([^']+)',\s*title:\s*'([^']+)',[\s\S]*?description:\s*'([^']+)'/g;
let match;
const artworks = [];

while ((match = regex.exec(content)) !== null) {
  artworks.push({
    url: match[1],
    title: match[2],
    description: match[3]
  });
}

let imageTags = artworks.map(art => {
  // fix absolute urls if they are relative
  let fullUrl = art.url.startsWith('http') ? art.url : `https://naroagutierrezgil.com${art.url}`;
  return `    <image:image>
      <image:loc>${fullUrl}</image:loc>
      <image:title>${art.title} — Naroa Gutiérrez Gil</image:title>
      <image:caption>${art.description.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</image:caption>
    </image:image>`;
}).join('\n');

const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>https://naroagutierrezgil.com/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
${imageTags}
  </url>
  <url>
    <loc>https://naroagutierrezgil.com/#/gallery</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://naroagutierrezgil.com/#/3d</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://naroagutierrezgil.com/#/commissions</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://naroagutierrezgil.com/#/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;

fs.writeFileSync(sitemapFile, sitemapContent);
console.log(`Sitemap generated successfully with ${artworks.length} images!`);
