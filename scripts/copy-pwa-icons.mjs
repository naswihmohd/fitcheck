/**
 * Copies public/apple-touch-icon.png to standard PWA PNG icon filenames.
 */
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pub = join(root, 'public');
const source = join(pub, 'apple-touch-icon.png');

mkdirSync(pub, { recursive: true });

if (!existsSync(source)) {
  console.error('Missing public/apple-touch-icon.png');
  process.exit(1);
}

for (const name of [
  'android-chrome-512x512.png',
  'android-chrome-192x192.png',
  'og-image.png',
]) {
  copyFileSync(source, join(pub, name));
  console.log('Wrote', name);
}
