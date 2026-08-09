const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '../public/assets');
const artworksPath = path.join(__dirname, '../src/artworks.ts');

let artworksContent = fs.readFileSync(artworksPath, 'utf8');

// Parse existing URLs from artworks.ts
const existingUrls = new Set();
const urlRegex = /url:\s*['"]([^'"]+)['"]/g;
let m;
while ((m = urlRegex.exec(artworksContent)) !== null) {
  existingUrls.add(m[1]);
}

const files = fs.readdirSync(assetsDir);
const newEntries = [];

const toTitle = (filename) => {
  const nameWithoutExt = filename.replace(/\.webp$/i, '').replace(/--[a-zA-Z0-9_-]+$/, '').replace(/_[0-9]+$/, '');
  return nameWithoutExt
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
};

const toSlug = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

let nextId = 500;

files.forEach(file => {
  if (!file.endsWith('.webp')) return;
  // Ignore portrait / UI background images
  if (file.includes('naroa-portrait') || file.includes('facebook-icon') || file.startsWith('expo-')) return;

  const relUrl = `/assets/${file}`;
  if (!existingUrls.has(relUrl)) {
    let title = toTitle(file);
    let slug = toSlug(title);
    if (!slug || slug.length < 2) slug = `obra-asset-${nextId}`;

    const isSlate = file.includes('pizarra') || file.includes('rocks') || file.includes('piedra') || file.includes('slate');

    newEntries.push({
      id: nextId++,
      slug: slug,
      url: relUrl,
      title: title,
      medium: isSlate ? 'Acrílico sobre pizarra natural y mica mineral' : 'Acrílico y óleo sobre lienzo de gran formato',
      year: '2025',
      category: isSlate ? 'PIZARRA' : 'LIENZO',
      dimensions: '60 x 80 cm',
      description: `Obra hiperrealista original: ${title}. Investigación sobre la vulnerabilidad y memoria matérica por Naroa Gutiérrez Gil.`,
      price: 'Consultar Colección'
    });
  }
});

console.log(`Found ${newEntries.length} uncatalogued WebP assets in public/assets/!`);

if (newEntries.length > 0) {
  const insertIndex = artworksContent.lastIndexOf(']');
  if (insertIndex !== -1) {
    const formattedEntries = newEntries.map(e => `  {
    id: ${e.id},
    slug: ${JSON.stringify(e.slug)},
    url: ${JSON.stringify(e.url)},
    title: ${JSON.stringify(e.title)},
    medium: ${JSON.stringify(e.medium)},
    year: ${JSON.stringify(e.year)},
    category: ${JSON.stringify(e.category)},
    dimensions: ${JSON.stringify(e.dimensions)},
    description: ${JSON.stringify(e.description)},
    price: ${JSON.stringify(e.price)}
  }`).join(',\n');

    const updatedContent = artworksContent.slice(0, insertIndex).trimEnd() + ',\n' + formattedEntries + '\n' + artworksContent.slice(insertIndex);
    fs.writeFileSync(artworksPath, updatedContent, 'utf8');
    console.log(`Successfully added ${newEntries.length} new artworks to src/artworks.ts!`);
  }
}
