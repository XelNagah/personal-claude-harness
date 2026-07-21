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
    if (e.isDirectory()) { if (e.name.startsWith('lint-')) continue; walk(full, acc); }  // el lint co-ubicado del subsistema no es contenido
    else if (e.name.endsWith('.md') && e.name !== 'MANIFIESTO.md') acc.push(full);  // MANIFIESTO.md: infra del subsistema (dec. 0017), no es pagina
  }
  return acc;
}
const rel = p => path.relative(root, p).replace(/\\/g, '/');
const domain = walk(root, []);
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

const mdLink = /\]\(([^)]+?\.md)\)/g;
// exige barra: `subtema/pagina.md` es una ref, `MEMORIA.md` suelto es prosa nombrando un archivo
const codePath = /`([^`]+?\/[^`]+?\.md)`/g;
const wiki = /\[\[([^\]]+?)\]\]/g;

// Un wikilink ACTIVO (que el harness resuelve) va crudo; uno CITADO va en backticks
// para mostrar el simbolo. Mapear code-spans inline (y fences) para saltar citas.
function codeSpans(txt) {
  const runs = []; let m; const re = /`+/g;
  while ((m = re.exec(txt))) runs.push([m.index, m[0].length]);
  const spans = [];
  for (let i = 0; i < runs.length; ) {
    const [open, len] = runs[i]; let j = i + 1;
    while (j < runs.length && runs[j][1] !== len) j++;
    if (j < runs.length) { spans.push([open, runs[j][0] + runs[j][1]]); i = j + 1; }
    else i++;
  }
  return spans;
}
const enCodeSpan = (spans, idx) => spans.some(([s, e]) => idx >= s && idx < e);

const broken = [], referenced = new Set();
for (const f of domain) {
  const txt = read(f), fdir = path.dirname(f);
  for (const re of [mdLink, codePath]) {
    let m; re.lastIndex = 0;
    while ((m = re.exec(txt))) {
      let t = m[1].trim();
      if (/^https?:\/\//.test(t)) continue;
      // saltar placeholders/taquigrafia: elipsis, plantillas de nombre, angulos
      if (t.includes('...') || t.includes('<') || t.includes('*') || /A{3,}|AA-MM|MM-DD/.test(t)) continue;
      const hit = resolverRef(t, fdir);
      if (hit) { if (inRoot(hit)) referenced.add(rel(hit)); }
      else broken.push([rel(f), t, 'ref .md no existe']);
    }
  }
  const spans = codeSpans(txt);
  let m; wiki.lastIndex = 0;
  while ((m = wiki.exec(txt))) {
    if (enCodeSpan(spans, m.index)) continue;  // wikilink citado en backticks, no activo
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
    const pdir = path.dirname(p);
    if (pdir === cat || p.startsWith(cat + path.sep)) {
      const base = path.basename(p), stem = base.slice(0, -3);
      // fallback por carpeta contenedora: solo para paginas en subcarpetas (el indice lista
      // `tema/`, no cada pagina). Para hijos directos exige el nombre: si no, folder == el dir
      // del propio indice y su texto siempre lo contiene -> el check se autoanula.
      const folderOk = pdir !== cat && t.includes(path.basename(pdir));
      if (!t.includes(base) && !t.includes(stem) && !folderOk) gaps.push([rel(idx), rel(p)]);
    }
  }
}

const orphans = [];
for (const p of domain) {
  const base = path.basename(p);
  if (base === 'INDICE.md' || base === 'README.md') continue;
  if (referenced.has(rel(p))) continue;
  const stem = base.slice(0, -3), pdir = path.dirname(p);
  const mentioned = indices.some(i => {
    const t = idxText.get(i);
    if (t.includes(base) || t.includes(stem)) return true;
    // fallback por carpeta: valido solo si la pagina cuelga de una SUBcarpeta del indice,
    // no de su mismo dir (ahi el nombre de la carpeta == el del propio indice, siempre matchea).
    const idir = path.dirname(i);
    return pdir !== idir && p.startsWith(idir + path.sep) && t.includes(path.basename(pdir));
  });
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
