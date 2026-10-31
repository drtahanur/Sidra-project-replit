import { readdir, readFile, mkdir, cp } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const theme = resolve(root, 'shopify-theme');
const generated = resolve(root, 'generated-artifacts');
const downloads = resolve(root, 'artifacts/sidra-store/public/downloads');

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map(entry =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]
  ))).flat();
}

// Check the installable OS2.0 contract before packaging. Theme Check remains the
// authoritative Liquid analyzer; this check ensures structural completeness.
const files = await walk(theme);
const sections = new Set(files.filter(p => p.includes('/sections/') && p.endsWith('.liquid')).map(p => p.split('/').pop().replace('.liquid', '')));
for (const path of files) {
  if (path.endsWith('.json')) {
    const json = JSON.parse(await readFile(path, 'utf8'));
    if (path.includes('/templates/')) {
      for (const section of Object.values(json.sections || {})) {
        if (!sections.has(section.type)) throw new Error(`Missing section ${section.type} in ${path}`);
      }
      for (const id of json.order || []) if (!json.sections[id]) throw new Error(`Unknown section order id ${id}`);
    }
  }
  if (path.includes('/sections/') && path.endsWith('.liquid')) {
    const text = await readFile(path, 'utf8');
    const match = text.match(/{%-?\s*schema\s*-?%}([\s\S]*?){%-?\s*endschema\s*-?%}/);
    if (!match) throw new Error(`Missing section schema: ${path}`);
    JSON.parse(match[1]);
  }
}
for (const required of ['layout/theme.liquid', 'assets/theme.css', 'assets/theme.js', 'assets/logo.svg', 'assets/logo-header.svg', 'config/settings_schema.json', 'locales/ar.default.json', 'templates/index.json']) {
  if (!files.includes(join(theme, required))) throw new Error(`Missing ${required}`);
}
await mkdir(generated, { recursive: true });
await mkdir(downloads, { recursive: true });
const archive = join(generated, 'sidra-shopify-theme.zip');
// Exclude README and check config from the installable archive. Put directories
// at ZIP root as Shopify requires, not inside an extra top-level folder.
execFileSync('zip', ['-q', '-r', '-FS', archive, 'assets', 'config', 'layout', 'locales', 'sections', 'snippets', 'templates'], { cwd: theme });
await cp(archive, join(downloads, 'sidra-shopify-theme.zip'));
await cp(join(theme, 'README.ar.md'), join(downloads, 'sidra-installation.ar.md'));
const brand = join(root, 'artifacts/sidra-store/public/brand');
await mkdir(brand, { recursive: true });
for (const name of ['logo.svg', 'logo-header.svg', 'logo-light.svg', 'logo-mark.svg']) {
  await cp(join(theme, 'assets', name), join(brand, name));
}
console.info(`Packaged ${files.length} source files; download ready: sidra-shopify-theme.zip`);
