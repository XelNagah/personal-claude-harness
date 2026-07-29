#!/usr/bin/env node
// Lint del registro de decisiones: numeracion, links de detalle, huerfanos, superseded. Sin LLM, sin red.
// Uso: node lint-decisiones.js [<carpeta>]   (default: .claude/decisiones)
const fs = require('fs'), path = require('path');

// --- Indices por frontmatter ---
// Un subsistema tiene uno o mas Indices y cada archivo se declara a si mismo en un frontmatter
// minimo (indice, origen, columnas). El lint los descubre por ese frontmatter y no por un nombre
// fijo: el nombre dejo de codificar el origen, asi que deducirlo del nombre volveria a atarlos.
// Se acepta la forma vieja —el archivo de siempre, sin frontmatter— mientras haya Agentes
// Desplegados sin nivelar: ahi el origen queda en null y los chequeos que dependen de el no corren.
const ORIGENES = ['agente-multiproposito', 'agente-desplegado'];
const ETIQUETA_ORIGEN = { 'agente-multiproposito': 'Agente Multipropósito', 'agente-desplegado': 'Agente Desplegado' };
function leerFrontmatter(txt) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(txt);
  if (!m) return null;
  const campos = {};
  for (const linea of m[1].split(/\r?\n/)) {
    const kv = /^([a-zA-Z_][\w-]*):\s*(.*)$/.exec(linea);
    if (!kv) continue;
    const v = kv[2].trim();
    campos[kv[1]] = /^\[.*\]$/.test(v)
      ? v.slice(1, -1).split(',').map(x => x.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean)
      : v.replace(/^['"]|['"]$/g, '');
  }
  return campos;
}
// Encabezado real de la primera tabla markdown del archivo (null si no tiene tabla).
function cabeceraTabla(txt) {
  for (const linea of txt.split(/\r?\n/)) {
    const t = linea.trim();
    if (!t.startsWith('|')) continue;
    const celdas = t.split('|').slice(1, -1).map(c => c.replace(/\*/g, '').trim());
    if (/^:?-{2,}:?$/.test((celdas[0] || '').replace(/\s/g, ''))) continue;
    return celdas;
  }
  return null;
}
// Indices de un subsistema: los .md de su carpeta con frontmatter `indice:`, mas los nombres
// viejos que todavia no lo declaran. Da {archivo, nombre, texto, indice, origen, columnas, cabecera}.
function indicesDe(dirSub, nombresViejos) {
  const salida = [];
  let entradas = [];
  try { entradas = fs.readdirSync(dirSub); } catch (e) { return salida; }
  for (const nombre of entradas.sort()) {
    if (!nombre.endsWith('.md')) continue;
    const archivo = path.join(dirSub, nombre);
    let txt; try { txt = fs.readFileSync(archivo, 'utf8'); } catch (e) { continue; }
    const fm = leerFrontmatter(txt);
    const declarado = !!(fm && fm.indice);
    if (!declarado && !(nombresViejos || []).includes(nombre)) continue;
    salida.push({
      archivo, nombre, texto: txt,
      indice: declarado ? fm.indice : null,
      origen: declarado ? (fm.origen || '') : null,
      columnas: declarado && Array.isArray(fm.columnas) ? fm.columnas : null,
      cabecera: cabeceraTabla(txt),
    });
  }
  return salida;
}
// Dos controles sobre lo declarado. [a] Las columnas, en los DOS sentidos: la declarada que la
// tabla no tiene y la que la tabla tiene sin declarar. Con un solo sentido el frontmatter puede
// mentir por omision, y el codigo que ubica una columna por nombre —el repartidor de conducta
// ubica Momento y Clase— deja de encontrarla sin emitir ningun error. [b] El manifiesto contra el
// frontmatter: el manifiesto lista los Indices como texto fijo y el frontmatter es la autoridad;
// sin compararlos, el mismo dato queda escrito en dos lugares que nada sincroniza.
function problemasDeIndices(idxs, manifiestoTxt) {
  const out = [];
  const declarados = idxs.filter(i => i.indice);
  for (const i of declarados) {
    if (!ORIGENES.includes(i.origen)) out.push(`${i.nombre}: origen "${i.origen}" invalido (validos: ${ORIGENES.join(' / ')})`);
    if (!i.columnas) continue;
    if (!i.cabecera) { out.push(`${i.nombre}: declara columnas pero no se encontro la tabla`); continue; }
    for (const c of i.columnas) if (!i.cabecera.includes(c)) out.push(`${i.nombre}: columna declarada "${c}" que la tabla no tiene`);
    for (const c of i.cabecera) if (!i.columnas.includes(c)) out.push(`${i.nombre}: columna "${c}" en la tabla, sin declarar en el frontmatter`);
  }
  if (manifiestoTxt == null) return out;
  const linea = /^\*\*[IÍ]ndices?:\*\*(.*)$/m.exec(manifiestoTxt);
  if (!linea) {
    if (declarados.length) out.push('MANIFIESTO.md: falta el campo Indices, que lista los Indices del subsistema con su origen');
    return out;
  }
  const listados = [...linea[1].matchAll(/`([^`]+\.md)`\s*\(([^)]+)\)/g)].map(m => ({ nombre: m[1], origen: m[2].trim() }));
  for (const i of declarados) {
    const l = listados.find(x => x.nombre === i.nombre);
    if (!l) out.push(`MANIFIESTO.md: no lista el Indice ${i.nombre}`);
    else if (l.origen !== ETIQUETA_ORIGEN[i.origen]) out.push(`MANIFIESTO.md: ${i.nombre} figura como "${l.origen}" y su frontmatter dice "${i.origen}"`);
  }
  for (const l of listados) {
    if (!declarados.some(i => i.nombre === l.nombre)) out.push(`MANIFIESTO.md: lista ${l.nombre}, que no existe o no declara frontmatter`);
  }
  return out;
}
// --- fin indices por frontmatter ---
const root = path.resolve(process.argv[2] || '.claude/decisiones');
const indices = indicesDe(root, ['INDICE.md']);
const maniPath = path.join(root, 'MANIFIESTO.md');
const problemasIndices = problemasDeIndices(indices, fs.existsSync(maniPath) ? fs.readFileSync(maniPath, 'utf8') : null);
const nombresIndice = new Set(indices.map(i => i.nombre));
const txt = indices.map(i => i.texto).join('\n');
const pad = n => String(n).padStart(4, '0');

// La raiz del repo se deduce de la ubicacion del propio lint: .claude/<sub>/lint-<sub>/ -> 3 arriba.
// La profundidad la fija el instalador; no depende de desde donde se invoque.
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

// parsear filas de la tabla: | N° | Decisión | Fecha | Estado | Detalle |
const rows = [];
for (const line of txt.split('\n')) {
  const t = line.trim();
  if (!t.startsWith('|')) continue;
  const cells = t.split('|').slice(1, -1).map(c => c.trim());
  if (cells.length < 5) continue;
  const nRaw = cells[0].replace(/[*\s]/g, '');
  if (/^:?-{2,}:?$/.test(nRaw)) continue;               // separador |---|
  if (!/^\d{1,4}$/.test(nRaw)) continue;                 // header u otra fila sin N°
  rows.push({ n: parseInt(nRaw, 10), estado: cells[3], detalle: cells[4] });
}

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

// [4] superseded (en la columna Estado) que no resuelven
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
console.log(`\n[4] SUPERSEDED ROTAS (${supRotas.length}):`);
supRotas.forEach(([n, r]) => console.log(`    ${n}  ->  ${r}   [decision inexistente]`));
if (!supRotas.length) console.log('    (ninguna)');
console.log(`\n[5] INDICES DECLARADOS (${problemasIndices.length}):`);
problemasIndices.forEach(p => console.log(`    ${p}`));
if (!problemasIndices.length) console.log(`    (${nombresIndice.size} indice(s), coherentes con el manifiesto)`);
