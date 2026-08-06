#!/usr/bin/env node
// Lint de la base de conocimiento: refs rotas, indice incompleto, huerfanos. Sin LLM, sin red.
// Uso: node lint-conocimiento.js [<carpeta>]   (default: .claude/conocimiento)
const fs = require('fs'), path = require('path');

const { indicesDe, problemasDeIndices } = require('../../common/indices.js');
const root = path.resolve(process.argv[2] || '.claude/conocimiento');
// '.respaldo-amp' son copias congeladas de .claude/ que dejaron corridas viejas del actualizador:
// sus hallazgos ya no se pueden corregir y duplican el diagnostico real. No se barren.
// 'tmp' es material de trabajo descartable (handoffs, notas, borradores) que el propio harness
// gitignorea: sus hallazgos no se corrigen, se borra la carpeta. Excluye por NOMBRE, en
// cualquier nivel del repo, no solo `.claude/tmp/`.
const EXCLUDE = new Set(['.git', 'node_modules', '.respaldo-amp', 'tmp', 'exports', 'pdfs']);

function walk(dir, acc) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDE.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name.startsWith('lint-')) continue; walk(full, acc); }  // el lint co-ubicado del subsistema no es contenido
    else if (e.name.endsWith('.md') && e.name !== 'MANIFIESTO.md') acc.push(full);  // MANIFIESTO.md: infra del subsistema, no es pagina
  }
  return acc;
}
const rel = p => path.relative(root, p).replace(/\\/g, '/');
const domain = walk(root, []);
const read = f => fs.readFileSync(f, 'utf8');
const inRoot = p => path.resolve(p).startsWith(path.resolve(root) + path.sep);

// El repo se deriva de `root` —la carpeta del subsistema que se esta mirando—, NUNCA de la ubicacion
// de este script. En cuanto hay una segunda copia (un plugin instalado, un marketplace bajado, otro
// repo con el harness) deducirlo desde __dirname describe el repo equivocado, y no falla: contesta.
// Derivandolo de `root`, la carpeta que se lee y el repo que se barre salen de la misma fuente y no
// pueden divergir. Conocimiento `el-repo-que-un-script-describe`.
function repoDe(carpetaSubsistema) {
  let d = path.resolve(carpetaSubsistema);
  for (;;) {
    if (fs.existsSync(path.join(d, '.claude'))) return d;
    const padre = path.dirname(d);
    if (padre === d) return path.resolve(carpetaSubsistema, '..', '..');   // sin `.claude` arriba
    d = padre;
  }
}
const repoRoot = repoDe(root);
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

// --- Atribucion por ancestro mas cercano ---
// Cada pagina se atribuye a su indice ancestro mas cercano; un sub-indice (INDICE.md), a su
// ancestro ESTRICTO mas cercano (asi el padre queda obligado a nombrar la Carpeta que delego).
// Un hallazgo cae una sola vez, contra el indice que corresponde.
function indiceAncestro(p, dirsIndice, estricto) {
  let d = path.dirname(p);
  if (estricto) d = path.dirname(d);
  while (d.length >= root.length) {
    if (dirsIndice.has(d)) return d;
    const up = path.dirname(d);
    if (up === d) break;
    d = up;
  }
  return null;
}
// Un indice "nombra" a p si menciona su archivo, su stem, o alguna Carpeta de la cadena entre el
// dir del indice y p (la Entrada que delega el subarbol). Un sub-indice se nombra por su Carpeta.
function indiceNombra(t, p, idxDir) {
  const base = path.basename(p);
  if (base !== 'INDICE.md') {
    const stem = base.slice(0, -3);
    if (t.includes(base) || t.includes(stem)) return true;
  }
  let d = path.dirname(p);
  while (d !== idxDir && d.length > idxDir.length) {
    if (t.includes(path.basename(d))) return true;
    d = path.dirname(d);
  }
  return false;
}
// --- fin atribucion por ancestro ---

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

// El Indice del subsistema se descubre por frontmatter; los sub-indices de una Carpeta se siguen
// reconociendo por nombre (son entradas del subsistema, no Indices de Subsistema).
const idxSub = indicesDe(root, ['INDICE.md']);
const maniPath = path.join(root, 'MANIFIESTO.md');
const problemasIndices = problemasDeIndices(idxSub, fs.existsSync(maniPath) ? fs.readFileSync(maniPath, 'utf8') : null);
const archivosIndice = new Set(idxSub.map(i => path.resolve(i.archivo)));
const esIndice = p => path.basename(p) === 'INDICE.md' || archivosIndice.has(path.resolve(p));
const indices = domain.filter(esIndice);
const idxText = new Map(indices.map(i => [i, read(i)]));
const dirsIndice = new Set(indices.map(i => path.dirname(i)));
// Una carpeta puede tener MAS de un Indice —uno por origen—, asi que el mapa guarda la lista y no
// un solo archivo: con `new Map(indices.map(...))` el segundo Indice tapaba al primero y todas las
// paginas del tapado se reportaban como no listadas. Una pagina esta listada si la nombra
// CUALQUIERA de los Indices de su carpeta.
const idxsPorDir = new Map();
for (const i of indices) {
  const d = path.dirname(i);
  if (!idxsPorDir.has(d)) idxsPorDir.set(d, []);
  idxsPorDir.get(d).push(i);
}
const nombradaPorAlguno = (idxs, p, dir) => idxs.some(idx => indiceNombra(idxText.get(idx), p, dir));
const gaps = [];
for (const p of domain) {
  const ownerDir = indiceAncestro(p, dirsIndice, esIndice(p));
  if (ownerDir === null) continue;                 // la raiz: sin indice ancestro
  const idxs = idxsPorDir.get(ownerDir);
  if (!nombradaPorAlguno(idxs, p, ownerDir)) gaps.push([idxs.map(i => rel(i)).join(' / '), rel(p)]);
}

const orphans = [];
for (const p of domain) {
  const base = path.basename(p);
  if (esIndice(p) || base === 'README.md') continue;
  if (referenced.has(rel(p))) continue;
  const ownerDir = indiceAncestro(p, dirsIndice, false);
  const idxs = ownerDir === null ? [] : idxsPorDir.get(ownerDir);
  if (!nombradaPorAlguno(idxs, p, ownerDir)) orphans.push(rel(p));
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
console.log(`\n[4] INDICES DECLARADOS (${problemasIndices.length}):`);
problemasIndices.forEach(p => console.log(`    ${p}`));
if (!problemasIndices.length) console.log(`    (${idxSub.length} indice(s) de subsistema, coherentes con el manifiesto)`);
