const fs = require('fs');
const path = require('path');

const SPLAT_COUNT = 300000;
const buffer = new ArrayBuffer(SPLAT_COUNT * 32);
const f32 = new Float32Array(buffer);
const u8 = new Uint8Array(buffer);

for (let i = 0; i < SPLAT_COUNT; i++) {
  const baseFloatIdx = i * 8;
  const baseByteIdx = i * 32;

  // Generate a swirl/wave topology
  const t = i / SPLAT_COUNT;
  const angle = t * Math.PI * 20.0;
  const radius = Math.sqrt(t) * 10.0;
  
  // Add some noise to the position
  const noiseX = (Math.random() - 0.5) * 0.5;
  const noiseY = (Math.random() - 0.5) * 0.5;
  const noiseZ = (Math.random() - 0.5) * 2.0;

  f32[baseFloatIdx + 0] = Math.cos(angle) * radius + noiseX; // x
  f32[baseFloatIdx + 1] = Math.sin(angle) * radius + noiseY; // y
  f32[baseFloatIdx + 2] = Math.sin(radius * 2.0) * 2.0 + noiseZ; // z

  // Scale
  f32[baseFloatIdx + 3] = 0.1;
  f32[baseFloatIdx + 4] = 0.1;
  f32[baseFloatIdx + 5] = 0.1;

  // Colors: Blend between Noir (#0A0A0A) and Primary (#2B3BE5)
  const isHighlight = Math.random() > 0.8;
  if (isHighlight) {
    u8[baseByteIdx + 24] = 43;  // R: 0x2B
    u8[baseByteIdx + 25] = 59;  // G: 0x3B
    u8[baseByteIdx + 26] = 229; // B: 0xE5
  } else {
    // Dark grey/slate tones
    const shade = 10 + Math.random() * 20;
    u8[baseByteIdx + 24] = shade;
    u8[baseByteIdx + 25] = shade;
    u8[baseByteIdx + 26] = shade;
  }
  u8[baseByteIdx + 27] = 255; // Alpha

  // Rotation (Quaternion)
  u8[baseByteIdx + 28] = 128;
  u8[baseByteIdx + 29] = 128;
  u8[baseByteIdx + 30] = 128;
  u8[baseByteIdx + 31] = 255;
}

const dir = path.join(__dirname, '../public/assets');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(path.join(dir, 'naroa_artwork_1.splat'), Buffer.from(buffer));
console.log(`Successfully generated Naroa Splat Artifact (300k points, 9.6MB) at public/assets/naroa_artwork_1.splat`);
