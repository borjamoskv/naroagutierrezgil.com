const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const titlesMap = {
  '1': 'Retrato Icono Naroa',
  '2': 'Marilyn Pop Gold',
  '3': 'Vintage Pop Portrait',
  '4': 'Serie Miradas',
  '5': 'Icono Cine Clásico',
  '6': 'One Love',
  '7': 'Denis',
  '8': 'Rattler',
  '9': 'Lip Balm',
  '10': 'Audrey Sparkle',
  '11': 'James Dean Slate',
  '12': 'Amy Winehouse Soul',
  '13': 'Freddie Mercury Queen',
  '14': 'Pizarra Mineral Viva',
  '15': 'Papitxulo',
  '16': 'He Creado un Ángel Verde y Gris',
  '17': 'OZielos! (Sigue el camino de baldosas bilbaínas)',
  '18': 'Es (l)a hora',
  '19': 'Cotton Girl',
  '20': 'Carole Lombard',
  '21': 'Concurso con Mi Torso al Dorso',
  '22': 'Autorretrato de Maxime',
  '23': 'Comic Life',
  '24': 'El Gordo',
  '25': 'Sigirinspired',
  '26': 'La pensadora',
  '27': 'Blue James',
  '28': 'm&...',
  '29': '...m\'s',
  '30': 'Peter Rowan',
  '31': 'Saioa',
  '32': 'The Great Escape',
  '33': 'Dreaming a Life',
  '34': 'Sonia',
  '35': 'El Luisma',
  '36': 'Wetever',
  '37': 'Cómo Caer Bien (C\'mon)',
  '38': 'Chenk',
  '39': 'Por los pelos',
  '40': 'Lo que el Ojo no Ve',
  '41': 'Poesje',
  '42': 'Cómo no tenerlo',
  '43': 'It\'s a Men\'s World'
};

const toSlug = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const srcDir = path.join(__dirname, 'naroa_eu_images');
const destDir = path.join(__dirname, '../public/assets');

const artworksPath = path.join(__dirname, '../src/artworks.ts');
let artworksContent = fs.readFileSync(artworksPath, 'utf8');

// Parse existing slugs to avoid duplicates
const existingSlugs = new Set();
const slugRegex = /slug:\s*['"]([^'"]+)['"]/g;
let m;
while ((m = slugRegex.exec(artworksContent)) !== null) {
  existingSlugs.add(m[1]);
}

const newEntries = [];

for (let i = 1; i <= 43; i++) {
  const jpgFile = path.join(srcDir, `${i}.jpg`);
  if (fs.existsSync(jpgFile)) {
    const stats = fs.statSync(jpgFile);
    if (stats.size < 1000) continue; // Skip tiny/error files

    const title = titlesMap[i] || `Obra Original ${i}`;
    let slug = toSlug(title);
    if (!slug || slug === '') slug = `obra-naroa-eu-${i}`;
    
    if (existingSlugs.has(slug)) {
      slug = `${slug}-eu-${i}`;
    }
    existingSlugs.add(slug);

    const webpFilename = `${slug}.webp`;
    const webpPath = path.join(destDir, webpFilename);

    console.log(`Converting ${i}.jpg -> ${webpFilename}`);
    try {
      execSync(`cwebp -q 90 "${jpgFile}" -o "${webpPath}"`, { stdio: 'ignore' });
    } catch (e) {
      console.log(`cwebp failed, using sips fallback for ${i}.jpg`);
      execSync(`sips -s format webp "${jpgFile}" --out "${webpPath}"`, { stdio: 'ignore' });
    }

    newEntries.push({
      id: 200 + i,
      title: title,
      slug: slug,
      category: i % 2 === 0 ? 'PIZARRA' : 'LIENZO',
      medium: i % 2 === 0 ? 'Acrílico sobre pizarra natural y mica mineral' : 'Acrílico y óleo sobre lienzo',
      year: 2012 + (i % 14),
      dimensions: '50 x 70 cm',
      price: 'Colección Privada',
      url: `/assets/${webpFilename}`,
      description: `Obra original de Naroa Gutiérrez Gil: ${title}. Técnica mixta y memoria matérica.`
    });
  }
}

console.log(`Generated ${newEntries.length} new artwork entries.`);

if (newEntries.length > 0) {
  // Inject before the closing bracket of ARTWORKS array
  const insertIndex = artworksContent.lastIndexOf(']');
  if (insertIndex !== -1) {
    const formattedEntries = newEntries.map(e => `  {
    id: ${e.id},
    slug: ${JSON.stringify(e.slug)},
    url: ${JSON.stringify(e.url)},
    title: ${JSON.stringify(e.title)},
    medium: ${JSON.stringify(e.medium)},
    year: ${e.year},
    category: ${JSON.stringify(e.category)},
    dimensions: ${JSON.stringify(e.dimensions)},
    description: ${JSON.stringify(e.description)},
    price: ${JSON.stringify(e.price)}
  }`).join(',\n');

    const updatedContent = artworksContent.slice(0, insertIndex).trimEnd() + ',\n' + formattedEntries + '\n' + artworksContent.slice(insertIndex);
    fs.writeFileSync(artworksPath, updatedContent, 'utf8');
    console.log(`Successfully injected ${newEntries.length} artworks into src/artworks.ts!`);
  }
}
