/* i18n key-parity + literal t() usage check.
   Usage: npm run check:i18n */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const locales = {
  en: (await import(`file:///${join(root, 'src/locales/en.js').replace(/\\/g, '/')}`)).default,
  ru: (await import(`file:///${join(root, 'src/locales/ru.js').replace(/\\/g, '/')}`)).default,
  kk: (await import(`file:///${join(root, 'src/locales/kk.js').replace(/\\/g, '/')}`)).default,
};

function flatten(obj, prefix = '', out = new Set()) {
  Object.entries(obj).forEach(([k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, key, out);
    else out.add(key);
  });
  return out;
}

const sets = Object.fromEntries(Object.entries(locales).map(([code, dict]) => [code, flatten(dict)]));
let errors = 0;

const enKeys = sets.en;
for (const code of ['ru', 'kk']) {
  for (const k of enKeys) {
    if (!sets[code].has(k)) {
      console.error(`✗ ${code} missing key: ${k}`);
      errors += 1;
    }
  }
  for (const k of sets[code]) {
    if (!enKeys.has(k)) {
      console.error(`✗ ${code} has extra key: ${k}`);
      errors += 1;
    }
  }
}

/* scan source for t('literal') usages */
function walk(dir, files = []) {
  readdirSync(dir).forEach((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (name === 'node_modules' || name === 'locales') return;
      walk(full, files);
    } else if (/\.(js|jsx)$/.test(name)) {
      files.push(full);
    }
  });
  return files;
}

const srcFiles = walk(join(root, 'src'));
const usage = /[^a-zA-Z0-9_.]t\(\s*'([a-zA-Z0-9_.]+)'/g;
let used = 0;
for (const file of srcFiles) {
  const text = readFileSync(file, 'utf8');
  let m;
  while ((m = usage.exec(text))) {
    const key = m[1];
    used += 1;
    if (!enKeys.has(key)) {
      console.error(`✗ missing en key used in ${file.replace(root, '.')}: ${key}`);
      errors += 1;
    }
  }
}

if (errors) {
  console.error(`\n${errors} problem(s) found.`);
  process.exit(1);
}
console.log(`✓ ${enKeys.size} keys × 3 locales in sync · ${used} literal t() usages checked.`);
