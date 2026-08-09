const fs = require('fs');
const path = require('path');

const artworksPath = path.join(__dirname, '../src/artworks.ts');
const additionsPath = path.join(__dirname, 'new_artworks.txt');

let content = fs.readFileSync(artworksPath, 'utf8');
const additions = fs.readFileSync(additionsPath, 'utf8');

// Find the last closing bracket of the array
const arrayEndIndex = content.lastIndexOf(']');
if (arrayEndIndex !== -1) {
    const before = content.substring(0, arrayEndIndex).trimEnd();
    const after = content.substring(arrayEndIndex);
    
    // Ensure there is a comma after the last existing item
    const newContent = before + ',\n' + additions + after;
    fs.writeFileSync(artworksPath, newContent);
    console.log('Successfully merged new artworks into src/artworks.ts');
} else {
    console.error('Could not find end of ARTWORKS array');
}
