const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const dir = path.join(__dirname, 'public/assets');

async function optimize() {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.webp'));
  let totalSaved = 0;
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const tmpPath = filePath + '.tmp.webp';
    const originalSize = fs.statSync(filePath).size;
    
    // Only process files > 100KB to avoid degrading small icons
    if (originalSize > 100 * 1024) {
      await sharp(filePath)
        .webp({ quality: 75, effort: 6, smartSubsample: true })
        .toFile(tmpPath);
        
      const newSize = fs.statSync(tmpPath).size;
      
      if (newSize < originalSize) {
        fs.renameSync(tmpPath, filePath);
        totalSaved += (originalSize - newSize);
        console.log(`Optimized ${file}: ${(originalSize/1024).toFixed(1)}KB -> ${(newSize/1024).toFixed(1)}KB`);
      } else {
        fs.unlinkSync(tmpPath);
        console.log(`Skipped ${file}: optimization would not reduce size`);
      }
    }
  }
  console.log(`\nTotal saved: ${(totalSaved / 1024 / 1024).toFixed(2)} MB`);
}

optimize().catch(console.error);
