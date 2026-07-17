#!/usr/bin/env node
// Lint de la base de conocimiento: refs rotas, indice incompleto, huerfanos. Sin LLM, sin red.
// Uso: node lint-conocimiento.js [<carpeta>]   (default: .claude/conocimiento)
const fs = require('fs'), path = require('path');
const root = path.resolve(process.argv[2] || '.claude/conocimiento');
const EXCLUDE = new Set(['.git', 'node_modules', 'exports', 'pdfs']);

function walk(dir, acc) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDE.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, acc);
    else if (e.name.endsWith('.md')) acc.push(full);
  }
  return acc;
}
const rel = p => path.relative(root, p).replace(/\\/g, '/');
const domain = walk(root, []);
const read = f => fs.readFileSync(f, 'utf8');

const mdLink = /\]\(([^)]+?\.md)\)/g;
// exige barra: `subtema/pagina.md` es una ref, `MEMORY.md` suelto es prosa nombrando un archivo
const codePath = /`([^`]+?\/[^`]+?\.md)`/g;
const wiki = /\[\[([^\]]+?)\]\]/g;

const broken = [], referenced = new Set();
for (const f of domain) {
  const txt = read(f), fdir = path.dirname(f);
  for (const re of [mdLink, codePath]) {
    let m; re.lastIndex = 0;
    while ((m = re.exec(txt))) {
      let t = m[1].trim();
      if (/^https?:\/\//.test(t)) continue;
      // saltar placeholders/taquigrafia: elipsis, plantillas de nombre, angulos
      if (t.includes('...') || t.includes('<') || /A{3,}|AA-MM|MM-DD/.test(t)) continue;
      const c1 = path.normalize(path.join(fdir, t));
      const c2 = path.normalize(path.join(root, t));
      if (fs.existsSync(c1)) referenced.add(rel(c1));
      else if (fs.existsSync(c2)) referenced.add(rel(c2));
      else broken.push([rel(f), t, 'ref .md no existe']);
    }
  }
  let m; wiki.lastIndex = 0;
  while ((m = wiki.exec(txt))) {
    const name = m[1].split('|')[0].trim();
    const hit = domain.some(p => rel(p).endsWith('/' + name + '.md') || rel(p) === name + '.md');
    if (!hit) broken.push([rel(f), `[[${name}]]`, 'wikilink sin archivo']);
  }
}

const indices = domain.filter(p => path.basename(p) === 'INDICE.md');
const idxText = new Map(indices.map(i => [i, read(i)]));
const gaps = [];
for (const idx of indices) {
  const cat = path.dirname(idx), t = idxText.get(idx);
  for (const p of domain) {
    if (p === idx) continue;
    if (path.dirname(p) === cat || p.startsWith(cat + path.sep)) {
      const base = path.basename(p), stem = base.slice(0, -3);
      const folder = path.basename(path.dirname(p));
      if (!t.includes(base) && !t.includes(stem) && !t.includes(folder)) gaps.push([rel(idx), rel(p)]);
    }
  }
}

const orphans = [];
for (const p of domain) {
  const base = path.basename(p);
  if (base === 'INDICE.md' || base === 'README.md') continue;
  if (referenced.has(rel(p))) continue;
  const stem = base.slice(0, -3), folder = path.basename(path.dirname(p));
  const mentioned = indices.some(i => { const t = idxText.get(i); return t.includes(base) || t.includes(stem) || t.includes(folder); });
  if (!mentioned) orphans.push(rel(p));
}

console.log(`== LINT CONOCIMIENTO: ${root} ==`);
console.log(`paginas: ${domain.length} | indices: ${indices.length}\n`);
console.log(`[1] REFS ROTAS (${broken.length}):`);
broken.forEach(([f, r, w]) => console.log(`    ${f}  ->  ${r}   [${w}]`));
if (!broken.length) console.log('    (ninguna)');
console.log(`\n[2] INDICE INCOMPLETO (${gaps.length}):`);
gaps.forEach(([i, p]) => console.log(`    ${i}  no lista  ${p}`));
if (!gaps.length) console.log('    (completo)');
console.log(`\n[3] HUERFANOS (${orphans.length}):`);
orphans.forEach(o => console.log(`    ${o}`));
if (!orphans.length) console.log('    (ninguno)');
