const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '..', 'app', 'icon.svg');
const outDir = path.join(__dirname, '..', 'public');

// Key iOS portrait splash sizes (physical pixels)
const splashSizes = [
  { name: 'splash-640x1136.png', w: 640, h: 1136 },   // iPhone SE (1st), 5/5S
  { name: 'splash-750x1334.png', w: 750, h: 1334 },   // iPhone 6/7/8/SE (2nd)
  { name: 'splash-1242x2208.png', w: 1242, h: 2208 }, // iPhone 6/7/8 Plus
  { name: 'splash-1125x2436.png', w: 1125, h: 2436 }, // iPhone X/XS/11 Pro
  { name: 'splash-828x1792.png', w: 828, h: 1792 },   // iPhone XR/11
  { name: 'splash-1170x2532.png', w: 1170, h: 2532 }, // iPhone 12/13/14/15
  { name: 'splash-1284x2778.png', w: 1284, h: 2778 }, // 12/13/14 Pro Max, 14 Plus
  { name: 'splash-1179x2556.png', w: 1179, h: 2556 }, // 14/15 Pro
  { name: 'splash-1290x2796.png', w: 1290, h: 2796 }, // 14/15 Pro Max
  // iPad portrait
  { name: 'splash-1536x2048.png', w: 1536, h: 2048 }, // iPad (Retina)
  { name: 'splash-1668x2388.png', w: 1668, h: 2388 }, // iPad Pro 11"
  { name: 'splash-2048x2732.png', w: 2048, h: 2732 }, // iPad Pro 12.9"
];

async function main() {
  if (!fs.existsSync(svgPath)) {
    throw new Error('SVG source not found at ' + svgPath);
  }
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  const svg = fs.readFileSync(svgPath);

  for (const { name, w, h } of splashSizes) {
    await sharp(svg, { density: 384 })
      .resize(w, h, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .flatten({ background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png({ compressionLevel: 9 })
      .toFile(path.join(outDir, name));
  }
  console.log('Splash screens generated in', outDir);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});