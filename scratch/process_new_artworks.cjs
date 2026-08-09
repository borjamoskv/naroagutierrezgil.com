const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ASSETS_DIR = path.join(__dirname, '../public/assets');
const ARTWORKS_TS = path.join(__dirname, '../src/artworks.ts');

const files = fs.readdirSync(ASSETS_DIR);
const jpgFiles = files.filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg'));

let currentArtworks = fs.readFileSync(ARTWORKS_TS, 'utf8');

// Find max ID
let maxId = 0;
const idMatches = [...currentArtworks.matchAll(/id:\s*(\d+)/g)];
if (idMatches.length > 0) {
  maxId = Math.max(...idMatches.map(m => parseInt(m[1])));
}

const newArtworks = [];

jpgFiles.forEach(file => {
  const filePath = path.join(ASSETS_DIR, file);
  const parsed = path.parse(file);
  const webpName = parsed.name + '.webp';
  const webpPath = path.join(ASSETS_DIR, webpName);
  
  console.log(`Processing ${file}...`);
  try {
    execSync(`cwebp -q 82 "${filePath}" -o "${webpPath}"`, { stdio: 'ignore' });
    fs.unlinkSync(filePath); // delete original jpg
  } catch (e) {
    console.error(`Error converting ${file}: ${e.message}`);
    return;
  }
  
  maxId++;
  const title = parsed.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  
  newArtworks.push(`  {
    id: ${maxId},
    slug: '${parsed.name}',
    url: '/assets/${webpName}',
    title: '${title}',
    href: '#obra-${parsed.name}',
    year: '2024',
    medium: 'Acrílico y Óleo sobre Lienzo',
    description: 'Obra hiperrealista: ${title}.',
    sizeCategory: 'medium'
  }`);
});

console.log('Conversion complete.');

// We can output the new array string for the agent to use
if (newArtworks.length > 0) {
  fs.writeFileSync(path.join(__dirname, 'new_artworks.txt'), newArtworks.join(',\n') + ',\n');
  console.log('Saved new artwork definitions to scratch/new_artworks.txt');
} else {
  console.log('No new artworks to add.');
}
