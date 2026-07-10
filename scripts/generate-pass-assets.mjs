// Regenerates the Apple Wallet pass images in pass-model.pass/ from vector art.
// Run after changing brand colors: node scripts/generate-pass-assets.mjs
import sharp from 'sharp';
import path from 'node:path';
import fs from 'node:fs/promises';

const OUT_DIR = path.join(process.cwd(), 'pass-model.pass');

// Brand palette (must match frontend-v2/src/index.css)
const GREEN_DARK = '#1b4332';
const CREAM = '#f5e9c8';
const GOLD = '#c9a84c';

// Discount-tag glyph on a rounded dark-green tile, drawn in a 100x100 viewBox.
// Pure vector shapes — no text, so it renders identically on any machine.
function tileSvg(size) {
  return Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
  <rect x="0" y="0" width="100" height="100" rx="22" fill="${GREEN_DARK}"/>
  <g transform="rotate(45 50 50)">
    <path d="M32 38 q0 -6 6 -6 h18 q4 0 7 3 l14 14 q4 4 0 8 L63 71 q-4 4 -8 0 L41 57 q-3 -3 -3 -7 z"
          fill="none" stroke="${CREAM}" stroke-width="6" stroke-linejoin="round"/>
    <circle cx="44" cy="42" r="5" fill="${GOLD}"/>
  </g>
</svg>`);
}

// Logo shown top-left on the pass, next to the native logoText wordmark.
// Transparent background so it sits directly on the pass color.
function logoSvg(size) {
  return Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="46" fill="none" stroke="${CREAM}" stroke-width="6"/>
  <g transform="rotate(45 50 50)">
    <path d="M34 40 q0 -5 5 -5 h15 q4 0 6.5 2.5 L72 49 q3.5 3.5 0 7 L60 68 q-3.5 3.5 -7 0 L41 56 q-2.5 -2.5 -2.5 -6 z"
          fill="none" stroke="${CREAM}" stroke-width="5" stroke-linejoin="round"/>
    <circle cx="44" cy="44" r="4.5" fill="${GOLD}"/>
  </g>
</svg>`);
}

async function render(svg, size, file) {
  await sharp(svg, { density: 300 })
    .resize(size, size)
    .png()
    .toFile(path.join(OUT_DIR, file));
  console.log(`wrote ${file} (${size}x${size})`);
}

// Apple Wallet required/expected sizes (points x scale)
await render(tileSvg(29), 29, 'icon.png');
await render(tileSvg(58), 58, 'icon@2x.png');
await render(tileSvg(87), 87, 'icon@3x.png');
await render(logoSvg(50), 50, 'logo.png');
await render(logoSvg(100), 100, 'logo@2x.png');
await render(logoSvg(150), 150, 'logo@3x.png');

// The redesign removes strip artwork entirely — solid background color instead
for (const f of ['strip.png', 'strip@2x.png', 'strip@3x.png']) {
  await fs.rm(path.join(OUT_DIR, f), { force: true });
  console.log(`removed ${f} (if present)`);
}
console.log('Done.');
