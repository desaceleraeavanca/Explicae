const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '..', 'app', 'icon.svg');
const outDir = path.join(__dirname, '..', 'public');

const iconSizes = [
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
];

async function main() {
  if (!fs.existsSync(svgPath)) {
    throw new Error('SVG source not found at ' + svgPath);
  }
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const svg = fs.readFileSync(svgPath);

  await Promise.all(
    iconSizes.map(({ name, size }) =>
      sharp(svg, { density: 384 })
        .resize(size, size)
        .png({ compressionLevel: 9 })
        .toFile(path.join(outDir, name))
    )
  );

  // Maskable variant (same layout, 512x512)
  await sharp(svg, { density: 384 })
    .resize(512, 512)
    .png({ compressionLevel: 9 })
    .toFile(path.join(outDir, 'android-chrome-512x512-maskable.png'));

  console.log('Icons generated in', outDir);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});