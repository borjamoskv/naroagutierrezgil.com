const fs = require('fs');
const path = require('path');

const artworksFile = path.join(__dirname, '../src/artworks.ts');
const sitemapFile = path.join(__dirname, '../public/sitemap.xml');

let content = fs.readFileSync(artworksFile, 'utf-8');

// Match title and url for all artwork objects
const titleMatches = [...content.matchAll(/title:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
const urlMatches = [...content.matchAll(/url:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
const descMatches = [...content.matchAll(/description:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);

const artworks = [];
const count = Math.min(titleMatches.length, urlMatches.length);

for (let i = 0; i < count; i++) {
  artworks.push({
    title: titleMatches[i],
    url: urlMatches[i],
    description: descMatches[i] || `Obra hiperrealista de Naroa Gutiérrez Gil: ${titleMatches[i]}.`
  });
}

let imageTags = artworks.map(art => {
  let fullUrl = art.url.startsWith('http') ? art.url : `https://naroa.online${art.url}`;
  const cleanTitle = art.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const cleanDesc = art.description.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  return `    <image:image>
      <image:loc>${fullUrl}</image:loc>
      <image:title>${cleanTitle} — Naroa Gutiérrez Gil</image:title>
      <image:caption>${cleanDesc}</image:caption>
    </image:image>`;
}).join('\n');

const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>https://naroa.online/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
${imageTags}
  </url>
  <url>
    <loc>https://naroa.online/#/gallery</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://naroa.online/#/3d</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://naroa.online/#/commissions</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://naroa.online/#/pop-lab</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://naroa.online/#/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;

fs.writeFileSync(sitemapFile, sitemapContent);
console.log(`Sitemap generated successfully with ${artworks.length} images!`);
