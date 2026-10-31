import { openSync } from 'fontkit';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('../../', import.meta.url));
const assets = join(root, 'shopify-theme/assets');
const publicBrand = join(root, 'artifacts/sidra-store/public/brand');
const font = openSync(join(assets, 'Tajawal-Bold.ttf'));
// Shape connected Arabic BEFORE outlining; reversing Unicode characters would
// break contextual Arabic joining. Fontkit applies the font's GSUB/GPOS tables.
const run = font.layout('سدرة', undefined, 'arab', 'ARA ', 'rtl');
const scale = 64 / font.unitsPerEm;
const x = 250 - run.advanceWidth * scale;
let pen = 0;
const paths = run.glyphs.map((glyph, index) => {
  const position = run.positions[index];
  const path = `<path transform="translate(${pen + position.xOffset} ${position.yOffset})" d="${glyph.path.toSVG()}"/>`;
  pen += position.xAdvance;
  return path;
}).join('');
await mkdir(publicBrand, { recursive: true });
for (const [name, color] of [['logo.svg', '#422333'], ['logo-light.svg', '#F8F4EF']]) {
  const original = await readFile(join(assets, name), 'utf8');
  if (original.includes('id="arabic-wordmark"')) {
    await writeFile(join(publicBrand, name), original);
    continue;
  }
  const outline = `<g id="arabic-wordmark" fill="${color}" transform="translate(${x.toFixed(3)} 72) scale(${scale} ${-scale})">${paths}</g>`;
  const svg = original
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<style>[\s\S]*?<\/style>/g, '')
    .replace(/<text[\s\S]*?<\/text>/, outline);
  if (!svg.includes('id="arabic-wordmark"')) throw new Error(`Cannot find wordmark in ${name}`);
  await writeFile(join(assets, name), svg);
  await writeFile(join(publicBrand, name), svg);
}
console.info('Arabic logo outlined: contextual Arabic shaping, no external fonts or text elements.');
