#!/usr/bin/env node
// Lint del registro de decisiones: numeracion, links de detalle, huerfanos, reemplazos. Sin LLM, sin red.
// Uso: node lint-decisiones.js [<carpeta>]   (default: .claude/decisiones)
const fs = require('fs'), path = require('path');

const { indicesDe, problemasDeIndices } = require('../../common/indices.js');
const root = path.resolve(process.argv[2] || '.claude/decisiones');
const indices = indicesDe(root, ['INDICE.md']);
const maniPath = path.join(root, 'MANIFIESTO.md');
const problemasIndices = problemasDeIndices(indices, fs.existsSync(maniPath) ? fs.readFileSync(maniPath, 'utf8') : null);
const nombresIndice = new Set(indices.map(i => i.nombre));
const txt = indices.map(i => i.texto).join('\n');
const pad = n => String(n).padStart(4, '0');

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

// -- filas de la tabla, leidas por NOMBRE de columna ------------------------
// Cada dato se ubica por el nombre de su columna, no por su posicion, y el numero se acepta con
// prefijo de origen (`Local-0042`) o pelado (`0042`, la forma vieja) mientras haya Agentes
// Desplegados sin nivelar. Leer por posicion dejaba el registro en CERO filas apenas la primera
// celda paso a ser el Codigo: la numeracion se validaba sobre un conjunto vacio y salia limpia.
// Y las celdas se separan RESPETANDO las tuberias escapadas (`\|`): sin eso, dos filas de este
// mismo registro —que nombran columnas adentro de una celda— corrian su Estado y su Detalle.
function celdasDe(linea) {
  return linea.trim().replace(/^\|/, '').replace(/\|$/, '')
    .split(/(?<!\\)\|/).map(c => c.replace(/\\\|/g, '|').trim());
}
const rows = [];
{
  let cab = null;
  for (const line of txt.split('\n')) {
    const t = line.trim();
    if (!t.startsWith('|')) continue;
    const c = celdasDe(t);
    if (!cab) {
      const norm = c.map(x => x.replace(/\*/g, '').trim().toLowerCase());
      // `Código` es la forma con nucleo; `N°` la vieja. Sin ninguna de las dos no se lee nada.
      const i = norm.indexOf('código') >= 0 ? norm.indexOf('código') : norm.findIndex(x => /^n[°º]?$/.test(x));
      if (i >= 0) cab = { cod: i, nombre: norm.indexOf('nombre'), estado: norm.indexOf('estado'), detalle: norm.indexOf('detalle') };
      continue;
    }
    if (/^:?-{2,}:?$/.test((c[0] || '').replace(/[*\s]/g, ''))) continue;   // separador |---|
    const crudo = (c[cab.cod] || '').replace(/[*\s]/g, '');
    const m = /^(?:Base-|Local-)?(\d{1,4})$/.exec(crudo);
    if (!m) continue;
    const val = i => (i >= 0 && i < c.length ? c[i] : '');
    rows.push({ n: parseInt(m[1], 10), codigo: crudo, nombre: val(cab.nombre), estado: val(cab.estado), detalle: val(cab.detalle) });
  }
  if (!cab) console.error('[!] no se encontro el encabezado de la tabla (columna Código o N°)');
}

// nombres unicos y no vacios: el Nombre es la clave practica del registro
const vistos = new Set();
const nombresMal = [];
for (const r of rows) {
  if (cabeceraTieneNombre(txt)) {
    if (!r.nombre) nombresMal.push(`${r.codigo} sin Nombre`);
    else if (vistos.has(r.nombre.toLowerCase())) nombresMal.push(`nombre duplicado "${r.nombre}"`);
    else vistos.add(r.nombre.toLowerCase());
  }
}
function cabeceraTieneNombre(t) { return /^\|[^\n]*\bNombre\b/mi.test(t); }

// [1] numeracion: huecos y duplicados
const gaps = [];
if (rows.length) {
  const nums = rows.map(r => r.n), set = new Set(nums), seen = new Set();
  for (let i = 1; i <= Math.max(...nums); i++) if (!set.has(i)) gaps.push(`falta ${pad(i)}`);
  for (const n of nums) { if (seen.has(n)) gaps.push(`duplicado ${pad(n)}`); seen.add(n); }
}

// [2] links de detalle rotos + recopilar referenciados
const linkRe = /\]\(([^)]+?\.md)\)/;
const referenced = new Set(), refsRotas = [];
for (const r of rows) {
  const m = linkRe.exec(r.detalle);
  if (!m) continue;
  const target = m[1].trim(), abs = resolverRef(target, root);
  if (abs) referenced.add(path.basename(abs));
  else refsRotas.push([pad(r.n), target]);
}

// [3] paginas de detalle huerfanas
const huerfanos = [];
if (fs.existsSync(root)) {
  for (const f of fs.readdirSync(root)) {
    if (!f.endsWith('.md') || nombresIndice.has(f) || ['INDICE.md', 'MANIFIESTO.md', 'README.md'].includes(f)) continue;
    if (!referenced.has(f)) huerfanos.push(f);
  }
}

// [4] reemplazos (en la columna Estado) que no resuelven
const nums = new Set(rows.map(r => r.n));
const supRe = /(?:reemplazada por|supersede-a|superseded by)[^0-9\n]{0,12}(\d{1,4})/i;
const supRotas = [];
for (const r of rows) {
  const m = supRe.exec(r.estado);
  if (m && !nums.has(parseInt(m[1], 10))) supRotas.push([pad(r.n), `reemplazada por ${pad(parseInt(m[1], 10))}`]);
}

console.log(`== LINT DECISIONES: ${root} ==`);
console.log(`decisiones: ${rows.length}\n`);
console.log(`[1] NUMERACION (${gaps.length}):`);
gaps.forEach(g => console.log(`    ${g}`));
if (!gaps.length) console.log('    (sin huecos ni duplicados)');
console.log(`\n[2] LINKS DE DETALLE ROTOS (${refsRotas.length}):`);
refsRotas.forEach(([n, t]) => console.log(`    ${n}  ->  ${t}   [no existe]`));
if (!refsRotas.length) console.log('    (ninguno)');
console.log(`\n[3] PAGINAS HUERFANAS (${huerfanos.length}):`);
huerfanos.forEach(h => console.log(`    ${h}`));
if (!huerfanos.length) console.log('    (ninguna)');
console.log(`\n[4] REEMPLAZOS ROTOS (${supRotas.length}):`);
supRotas.forEach(([n, r]) => console.log(`    ${n}  ->  ${r}   [decision inexistente]`));
if (!supRotas.length) console.log('    (ninguna)');
console.log(`\n[5] NOMBRES VACIOS O DUPLICADOS (${nombresMal.length}):`);
nombresMal.forEach(n => console.log(`    ${n}`));
if (!nombresMal.length) console.log('    (ninguno)');
console.log(`\n[6] INDICES DECLARADOS (${problemasIndices.length}):`);
problemasIndices.forEach(p => console.log(`    ${p}`));
if (!problemasIndices.length) console.log(`    (${nombresIndice.size} indice(s), coherentes con el manifiesto)`);
