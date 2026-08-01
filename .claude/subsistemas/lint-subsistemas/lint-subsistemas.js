#!/usr/bin/env node
// Lint del catalogo de subsistemas: catalogo<->disco, duplicados y manifiestos. Sin LLM, sin red.
const fs = require('fs');
const path = require('path');

const { indicesDe, problemasDeIndices } = require('../../common/indices.js');

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
