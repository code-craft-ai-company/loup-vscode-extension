// Copies the language server and debug adapter bundles into the extension's
// `out/` folder, so the extension folder is self-contained and can be packaged.
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'packages', 'extension', 'out');
mkdirSync(out, { recursive: true });
const copies = [
  [join('packages', 'language-server', 'out', 'server.js'), 'server.js'],
  [join('packages', 'debug-adapter', 'out', 'debugAdapter.js'), 'debugAdapter.js'],
];
for (const [from, to] of copies) {
  copyFileSync(join(root, from), join(out, to));
}
