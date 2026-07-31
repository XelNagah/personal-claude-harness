#!/usr/bin/env node
// Lint del catalogo de subsistemas: catalogo<->disco, duplicados y manifiestos. Sin LLM, sin red.
const fs = require('fs');
const path = require('path');

// --- Indices por frontmatter ---
// Un subsistema tiene uno o mas Indices y cada archivo se declara a si mismo en un frontmatter
// minimo (indice, origen, columnas). El lint los descubre por ese frontmatter y no por un nombre
// fijo: el nombre dejo de codificar el origen, asi que deducirlo del nombre volveria a atarlos.
// Se acepta la forma vieja —el archivo de siempre, sin frontmatter— mientras haya Agentes
// Desplegados sin nivelar: ahi el origen queda en null y los chequeos que dependen de el no corren.
const ORIGENES = ['agente-multiproposito', 'agente-desplegado'];
const ETIQUETA_ORIGEN = { 'agente-multiproposito': 'Agente Multipropósito', 'agente-desplegado': 'Agente Desplegado' };
// Un `.md` guardado con marca de orden de bytes deja de matchear `^---`: el archivo pierde su
// frontmatter y un Indice declarado se lee como no declarado, sin emitir ninguna senal. Se saca
// siempre al leer — el archivo se ve igual en cualquier editor, asi que la falla no se nota.
const sinMarcaDeOrden = s => s.replace(/^\uFEFF/, '');
function leerFrontmatter(txt) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(sinMarcaDeOrden(txt));
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

const claude = path.resolve(process.argv[2] || '.claude');
const dirCatalogo = path.join(claude, 'subsistemas');
const ignorar = new Set(['skills', 'tmp']);
const errores = [];

// El catalogo se reparte entre uno o dos Indices (uno por origen); las filas salen de todos.
const catalogos = indicesDe(dirCatalogo, ['SUBSISTEMAS.md']);
if (!catalogos.length) {
  console.error('[!] Falta el Indice del catalogo en .claude/subsistemas/ (SUBSISTEMAS.md)');
  process.exit(1);
}
const maniPath = path.join(dirCatalogo, 'MANIFIESTO.md');
errores.push(...problemasDeIndices(catalogos, fs.existsSync(maniPath) ? fs.readFileSync(maniPath, 'utf8') : null));

// --- las filas del catalogo, leidas por encabezado ------------------------
// Se ubica cada dato por el NOMBRE de su columna, no por su posicion: con el nucleo la primera
// celda es el Codigo y la casa se mudo a `Detalle`, asi que buscar un link en la celda inicial
// dejaba de encontrar filas y el catalogo se leia vacio, sin emitir ningun error.
// Y se separan las celdas RESPETANDO las tuberias escapadas (`\|`): partir por "|" a secas corre
// las columnas de cualquier fila que nombre otra tabla adentro de una celda.
function celdasDe(linea) {
  return linea.trim().replace(/^\|/, '').replace(/\|$/, '')
    .split(/(?<!\\)\|/).map(c => c.replace(/\\\|/g, '|').trim());
}
function filasDe(idx) {
  const lineas = idx.texto.split(/\r?\n/).map(l => l.trim()).filter(l => l.startsWith('|'));
  if (lineas.length < 2) return [];
  const cab = celdasDe(lineas[0]).map(c => c.replace(/\*/g, '').trim());
  const out = [];
  for (const l of lineas.slice(1)) {
    const c = celdasDe(l);
    if (/^:?-{2,}:?$/.test((c[0] || '').replace(/\s/g, ''))) continue;
    const fila = {};
    cab.forEach((n, k) => { fila[n] = c[k] !== undefined ? c[k] : ''; });
    out.push(fila);
  }
  return out;
}

// El prefijo del codigo es el origen: un `Local-` en el Indice del Agente Multiproposito significa
// que la fila se escribio en el archivo equivocado.
const PREFIJO = { 'agente-multiproposito': 'Base', 'agente-desplegado': 'Local' };
const filas = [];
const codigosVistos = new Set();
for (const i of catalogos) {
  const esperado = PREFIJO[i.origen];
  for (const f of filasDe(i)) {
    const cod = f['Código'] || '', nombre = f['Nombre'] || '';
    const enlace = (/\]\(([^)]+)\)/.exec(f['Detalle'] || '') || [])[1] || '';
    if (esperado) {
      if (!new RegExp(`^${esperado}-\\d{4}$`).test(cod))
        errores.push(`${i.nombre}: codigo "${cod}" no tiene la forma ${esperado}-NNNN que pide su origen`);
      else if (codigosVistos.has(cod)) errores.push(`${i.nombre}: codigo duplicado ${cod}`);
      else codigosVistos.add(cod);
    }
    if (!nombre) errores.push(`${i.nombre}: la fila ${cod || '(sin codigo)'} no tiene Nombre`);
    if (!(f['Descripción'] || '').trim()) errores.push(`${i.nombre}: ${cod} no tiene Descripción`);
    filas.push({ nombre, enlace });
  }
}
const nombres = filas.map(f => f.nombre);

for (const nombre of new Set(nombres)) {
  if (nombres.filter(n => n === nombre).length > 1) errores.push(`fila duplicada: ${nombre}`);
}

for (const fila of filas) {
  if (!fila.enlace) { errores.push(`sin casa en Detalle: ${fila.nombre}`); continue; }
  const destino = path.resolve(dirCatalogo, fila.enlace);
  if (!fs.existsSync(destino) || !fs.statSync(destino).isDirectory()) errores.push(`casa inexistente: ${fila.nombre} -> ${fila.enlace}`);
  else if (!fs.existsSync(path.join(destino, 'MANIFIESTO.md')))
    errores.push(`sin MANIFIESTO.md: ${fila.nombre}`);
}

const casas = fs.readdirSync(claude, { withFileTypes: true })
  .filter(e => e.isDirectory() && !e.name.startsWith('.') && !ignorar.has(e.name))
  .map(e => e.name)
  .filter(n => fs.existsSync(path.join(claude, n, 'MANIFIESTO.md')));
for (const casa of casas) {
  if (!nombres.includes(casa)) errores.push(`casa no catalogada: ${casa}`);
}

// Reporta y NO falla, como los otros nueve lints: la capa mecanica describe el estado del repo, y
// que haya hallazgos es informacion, no un error del programa. Hasta el 30/07/2026 este era el unico
// lint que salia con codigo 1 y escribia en la salida de errores, y eso tenia dos consecuencias: el
// control de cierre lo mostraba como ERROR en vez de listar sus hallazgos, y el formato `[!] linea`
// no era contable, asi que sus hallazgos no entraban en ningun total.
// El formato `[TITULO] (N)` es el mismo que usan los demas, y es lo que el control de cierre cuenta.
console.log(`subsistemas: ${filas.length} | casas: ${casas.length}`);
console.log(`\n[CATALOGO vs DISCO] (${errores.length}):`);
if (errores.length) errores.forEach(e => console.log(`    ${e}`));
else console.log('    (ninguno)');
