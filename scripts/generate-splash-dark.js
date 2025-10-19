const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '..', 'app', 'icon.svg');
const outDir = path.join(__dirname, '..', 'public');

// iOS portrait splash sizes
const splashSizes = [
  { w: 640, h: 1136 },   // iPhone SE (1st), 5/5S
  { w: 750, h: 1334 },   // iPhone 6/7/8/SE (2nd)
  { w: 1242, h: 2208 },  // iPhone 6/7/8 Plus
  { w: 1125, h: 2436 },  // iPhone X/XS/11 Pro
  { w: 828, h: 1792 },   // iPhone XR/11
  { w: 1170, h: 2532 },  // iPhone 12/13/14/15
  { w: 1284, h: 2778 },  // 12/13/14 Pro Max, 14 Plus
  { w: 1179, h: 2556 },  // 14/15 Pro
  { w: 1290, h: 2796 },  // 14/15 Pro Max
  // iPad portrait
  { w: 1536, h: 2048 },  // iPad (Retina)
  { w: 1668, h: 2388 },  // iPad Pro 11"
  { w: 2048, h: 2732 },  // iPad Pro 12.9"
];

const darkBg = { r: 11, g: 15, b: 26, alpha: 1 }; // #0b0f1a

async function main() {
  if (!fs.existsSync(svgPath)) {
    throw new Error('SVG source not found at ' + svgPath);
  }
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  const svg = fs.readFileSync(svgPath);

  for (const { w, h } of splashSizes) {
    const name = `splash-dark-${w}x${h}.png`;
    await sharp(svg, { density: 384 })
      .resize(w, h, { fit: 'contain', background: darkBg })
      .flatten({ background: darkBg })
      .png({ compressionLevel: 9 })
      .toFile(path.join(outDir, name));
  }
  console.log('Dark splash screens generated in', outDir);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});