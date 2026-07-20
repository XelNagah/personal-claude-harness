#!/usr/bin/env node
// Lint de la memoria local: refs rotas, indice (MEMORIA.md) incompleto, huerfanos, frontmatter. Sin LLM, sin red.
// Uso: node lint-memoria.js [<carpeta>]   (default: .claude/memoria)
const fs = require('fs'), path = require('path');
const root = path.resolve(process.argv[2] || '.claude/memoria');
const EXCLUDE = new Set(['.git', 'node_modules']);
const TYPES = new Set(['user', 'feedback', 'project', 'reference']);

function walk(dir, acc) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDE.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name.startsWith('lint-')) continue; walk(full, acc); }  // el lint co-ubicado del subsistema no es contenido
    else if (e.name.endsWith('.md')) acc.push(full);
  }
  return acc;
}
const rel = p => path.relative(root, p).replace(/\\/g, '/');
const read = f => fs.readFileSync(f, 'utf8');
const inRoot = p => path.resolve(p).startsWith(path.resolve(root) + path.sep);

// La raiz del repo se deduce de la ubicacion del propio lint: .claude/<sub>/lint-<sub>/ -> 3 arriba.
// La profundidad la fija el instalador (decision 0008); no depende de desde donde se invoque.
const repoRoot = path.resolve(__dirname, '..', '..', '..');
const dentroDelRepo = p => {
  const r = path.resolve(p);
  return r === repoRoot || r.startsWith(repoRoot + path.sep);
};
// Un archivo de un subsistema puede linkear a otros (planes/, conocimiento/, docs/, ...): la ref se
// resuelve relativa al archivo, a la raiz del subsistema, a .claude/, a la raiz del repo y al cwd.
// Solo se acepta el candidato que caiga DENTRO del repo: una ref rota no resuelve contra afuera.
function resolverRef(t, fdir) {
  return [
    path.join(fdir, t),
    path.join(root, t),
    path.join(root, '..', t),
    path.join(repoRoot, t),
    path.resolve(t),
  ].map(p => path.normalize(p)).find(p => dentroDelRepo(p) && fs.existsSync(p)) || null;
}

const all = walk(root, []);
const indexFile = path.join(root, 'MEMORIA.md');
const hasIndex = fs.existsSync(indexFile);
const idxText = hasIndex ? read(indexFile) : '';
const memos = all.filter(p => path.basename(p) !== 'MEMORIA.md');

// nombres validos para wikilinks: `name:` del frontmatter + stem del archivo
const nameSet = new Set();
for (const p of memos) {
  nameSet.add(path.basename(p).slice(0, -3));
  const fm = read(p).match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (fm) { const nm = fm[1].match(/^name:\s*(\S+)/m); if (nm) nameSet.add(nm[1].trim()); }
}

const mdLink = /\]\(([^)]+?\.md)\)/g;
const codePath = /`([^`]+?\/[^`]+?\.md)`/g;
const wiki = /\[\[([^\]]+?)\]\]/g;

// [1] refs rotas: links a .md inexistentes + wikilinks sin memoria.
const broken = [], referenced = new Set();
for (const f of all) {
  const txt = read(f), fdir = path.dirname(f);
  for (const re of [mdLink, codePath]) {
    let m; re.lastIndex = 0;
    while ((m = re.exec(txt))) {
      let t = m[1].trim();
      if (/^https?:\/\//.test(t)) continue;
      if (t.includes('...') || t.includes('<')) continue;
      const hit = resolverRef(t, fdir);
      if (hit) { if (inRoot(hit)) referenced.add(rel(hit)); }
      else broken.push([rel(f), t, 'ref .md no existe']);
    }
  }
  let m; wiki.lastIndex = 0;
  while ((m = wiki.exec(txt))) {
    const name = m[1].split('|')[0].trim();
    if (!nameSet.has(name)) broken.push([rel(f), `[[${name}]]`, 'wikilink sin memoria']);
  }
}

// [2] indice incompleto: memoria no listada en MEMORIA.md (por archivo o por name)
const gaps = [];
for (const p of memos) {
  const base = path.basename(p), stem = base.slice(0, -3);
  if (!idxText.includes(base) && !idxText.includes(stem)) gaps.push(rel(p));
}

// [3] huerfanos: ni referenciada ni en el indice
const orphans = [];
for (const p of memos) {
  if (referenced.has(rel(p))) continue;
  const base = path.basename(p), stem = base.slice(0, -3);
  if (idxText.includes(base) || idxText.includes(stem)) continue;
  orphans.push(rel(p));
}

// [4] frontmatter: name / description / metadata.type valido
const fmBad = [];
for (const p of memos) {
  const txt = read(p);
  const fm = txt.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) { fmBad.push([rel(p), 'sin frontmatter']); continue; }
  const body = fm[1];
  if (!/\bname:\s*\S/.test(body)) fmBad.push([rel(p), 'falta name']);
  if (!/\bdescription:\s*\S/.test(body)) fmBad.push([rel(p), 'falta description']);
  const tm = body.match(/type:\s*([a-z]+)/);
  if (!tm) fmBad.push([rel(p), 'falta metadata.type']);
  else if (!TYPES.has(tm[1])) fmBad.push([rel(p), `type invalido: ${tm[1]}`]);
}

console.log(`== LINT MEMORIA: ${root} ==`);
console.log(`memorias: ${memos.length} | indice: ${hasIndex ? 'MEMORIA.md' : 'FALTA'}\n`);
if (!hasIndex) console.log('[!] No existe MEMORIA.md (indice de memoria)\n');
console.log(`[1] REFS ROTAS (${broken.length}):`);
broken.forEach(([f, r, w]) => console.log(`    ${f}  ->  ${r}   [${w}]`));
if (!broken.length) console.log('    (ninguna)');
console.log(`\n[2] INDICE INCOMPLETO (${gaps.length}):`);
gaps.forEach(p => console.log(`    MEMORIA.md  no lista  ${p}`));
if (!gaps.length) console.log('    (completo)');
console.log(`\n[3] HUERFANOS (${orphans.length}):`);
orphans.forEach(o => console.log(`    ${o}`));
if (!orphans.length) console.log('    (ninguno)');
console.log(`\n[4] FRONTMATTER (${fmBad.length}):`);
fmBad.forEach(([p, w]) => console.log(`    ${p}   [${w}]`));
if (!fmBad.length) console.log('    (ok)');
