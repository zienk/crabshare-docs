import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { groups, home, reader } from '../src/site.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const docs = JSON.parse(await readFile(path.join(root, 'src/data/documents.json'), 'utf8'));
const plain = (text) =>
  text
    .replace(/<[^>]*>/g, '')
    .replace(
      /&(amp|lt|gt|quot|#x27|#39);/g,
      (_, key) =>
        ({
          amp: '&',
          lt: '<',
          gt: '>',
          quot: String.fromCharCode(34),
          '#x27': String.fromCharCode(39),
          '#39': String.fromCharCode(39),
        })[key],
    )
    .replace(/\s+/g, '');
test('31 documents belong to exactly one group', () => {
  assert.equal(docs.length, 31);
  assert.deepEqual(
    groups.flatMap((g) => g.numbers).sort((a, b) => a - b),
    Array.from({ length: 31 }, (_, i) => i + 1),
  );
  assert.equal(new Set(docs.map((d) => d.id)).size, 31);
});
test('converted text and all 219 tables are retained from source', () => {
  assert.equal(
    docs.reduce((sum, d) => sum + d.tables, 0),
    219,
  );
  for (const d of docs) {
    assert.equal(
      plain(d.code + d.title + d.description + d.html),
      d.sourceText.replace(/\s+/g, ''),
      d.code + ' text fidelity',
    );
    assert.equal((d.html.match(/<table>/g) || []).length, d.tables, d.code + ' table count');
    for (const heading of d.toc) assert.ok(d.html.includes(`id="${heading.id}"`));
  }
});
test('every internal page, source download and anchor resolves', async () => {
  const pages = [
    ['index.html', home(docs)],
    ...docs.map((d) => [`docs/${d.id}.html`, reader(d, docs)]),
  ];
  for (const [filename, html] of pages) {
    for (const [, link] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const [pathname, hash] = link.split('#');
      if (!pathname) {
        assert.ok(html.includes(`id="${hash}"`), filename + ' anchor ' + hash);
      } else {
        await access(
          path.resolve(
            root,
            'dist',
            path.dirname(filename),
            decodeURIComponent(pathname.replace(/&amp;/g, '&')),
          ),
        );
      }
    }
  }
});
test('source documents retain their original bytes', async () => {
  for (const d of docs) {
    const source = await readFile(path.join(root, 'public/documents', d.filename));
    const built = await readFile(path.join(root, 'dist/documents', d.filename));
    assert.deepEqual(built, source, d.code);
  }
});
