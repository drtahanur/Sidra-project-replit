import { themeCheckRun, Severity } from '@shopify/theme-check-node';
import { fileURLToPath } from 'node:url';
import { relative } from 'node:path';

const root = fileURLToPath(new URL('../../shopify-theme/', import.meta.url));
const result = await themeCheckRun(root, undefined, message => console.info(message));
for (const offense of result.offenses) {
  const file = relative(root, fileURLToPath(offense.uri));
  console.info(`${offense.severity === Severity.ERROR ? 'ERROR' : 'WARNING'} ${file}:${offense.start.line} ${offense.check}: ${offense.message}`);
}
const errors = result.offenses.filter(offense => offense.severity === Severity.ERROR);
console.info(`Shopify Theme Check: ${errors.length} errors, ${result.offenses.length - errors.length} other findings.`);
if (errors.length) process.exitCode = 1;
