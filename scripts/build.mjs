import { readFile, mkdir, cp, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { home, reader } from '../src/site.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const docs = JSON.parse(await readFile(path.join(root, 'src/data/documents.json'), 'utf8'));
if (docs.length !== 31) throw new Error('Expected exactly 31 documents');
const out = path.join(root, 'dist');
await mkdir(path.join(out, 'assets'), { recursive: true });
await mkdir(path.join(out, 'docs'), { recursive: true });
await cp(path.join(root, 'public'), out, { recursive: true });
await cp(path.join(root, 'src/styles.css'), path.join(out, 'assets/styles.css'));
await cp(path.join(root, 'src/app.js'), path.join(out, 'assets/app.js'));
await writeFile(path.join(out, 'index.html'), home(docs));
for (const doc of docs)
  await writeFile(path.join(out, 'docs', doc.id + '.html'), reader(doc, docs));
console.log(`Built index + ${docs.length} readers + ${docs.length} original DOCX files in dist/`);
