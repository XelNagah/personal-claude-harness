#!/usr/bin/env node
// Lint del subsistema `comunicacion`: integridad del Índice de Agentes Multipropósito Conocidos.
// Controla la forma del Índice (origen y columnas contra el manifiesto), nombres únicos y no vacíos,
// que cada Directorio exista y contenga un `.claude/`, y que el CLI sea uno soportado. Sin LLM, sin red.
// Uso: node lint-comunicacion.js [<carpeta>]   (default: .claude/comunicacion)
//
// El Índice es Aprendizaje local: guarda rutas de máquina y NO se commitea. Un Índice ausente es
// válido —puede no existir en un Agente Desplegado— y no genera hallazgos; en este repo, que publica
// el mecanismo, existe pero sin filas, así que los controles de fila corren sobre cero y dan verde.
const fs = require('fs'), path = require('path');

const { indicesDe, problemasDeIndices } = require('../../common/indices.js');
const { CLIS_SOPORTADOS, leerIndice } = require('../indice.js');

const root = path.resolve(process.argv[2] || '.claude/comunicacion');
const indicePath = path.join(root, 'INDICE.md');

// [forma del Índice] solo si el archivo existe: `problemasDeIndices` marca un índice listado en el
// manifiesto cuyo archivo no está, y un Índice ausente acá es un estado válido, no un defecto.
const indices = indicesDe(root, ['INDICE.md']);
const maniPath = path.join(root, 'MANIFIESTO.md');
const problemasIndices = fs.existsSync(indicePath)
  ? problemasDeIndices(indices, fs.existsSync(maniPath) ? fs.readFileSync(maniPath, 'utf8') : null)
  : [];

// Las filas del Índice se leen con el módulo compartido `indice.js`: el lint y el mecanismo de
// consulta parsean las mismas filas, así que el parseo vive en un solo lugar (un dato leído de dos
// formas distintas diverge). Ausencia del archivo → lista vacía sin señal de error.
const filas = leerIndice(root);

// [1] nombres únicos y no vacíos: el Nombre es la clave con que se resuelve un agente al consultarlo.
const nombresMal = [];
const vistos = new Set();
for (const f of filas) {
  if (!f.nombre) { nombresMal.push(`${f.codigo} (línea ${f.linea}) sin Nombre`); continue; }
  const clave = f.nombre.toLowerCase();
  if (vistos.has(clave)) nombresMal.push(`nombre duplicado "${f.nombre}" (${f.codigo}, línea ${f.linea})`);
  else vistos.add(clave);
}

// [2] Directorio: existe y contiene un `.claude/`. Un Agente Multipropósito Conocido es otra
// instalación del harness, detectable por su `.claude/`; sin él, o la ruta cambió o no es un AMP, y
// consultarlo fallaría o traería una respuesta sin subsistemas. Se resuelve la ruta tal cual está
// escrita (es absoluta de máquina), sin intentar reubicarla contra este repo.
const dirsMal = [];
for (const f of filas) {
  if (!f.directorio) { dirsMal.push(`${f.codigo} (${f.nombre || 's/nombre'}) sin Directorio`); continue; }
  const dir = f.directorio;
  if (!fs.existsSync(dir)) { dirsMal.push(`${f.codigo} (${f.nombre}): el Directorio no existe → ${dir}`); continue; }
  if (!fs.existsSync(path.join(dir, '.claude'))) dirsMal.push(`${f.codigo} (${f.nombre}): el Directorio no tiene .claude/ (¿es un Agente Multipropósito?) → ${dir}`);
}

// [3] CLI soportado: el mecanismo solo sabe invocar en solo lectura a los CLI de la lista. Uno fuera
// de ella no se invoca a ciegas; el registro no debería tenerlo hasta que el mecanismo lo soporte.
const clisMal = [];
for (const f of filas) {
  if (!f.cli) { clisMal.push(`${f.codigo} (${f.nombre}) sin CLI`); continue; }
  if (!CLIS_SOPORTADOS.includes(f.cli)) clisMal.push(`${f.codigo} (${f.nombre}): CLI "${f.cli}" no soportado (soportados: ${CLIS_SOPORTADOS.join(' / ')})`);
}

console.log(`== LINT COMUNICACION: ${root} ==`);
console.log(`agentes conocidos: ${filas.length}${fs.existsSync(indicePath) ? '' : '  (sin Índice: Aprendizaje local ausente, válido)'}\n`);
console.log(`[1] NOMBRES VACIOS O DUPLICADOS (${nombresMal.length}):`);
nombresMal.forEach(n => console.log(`    ${n}`));
if (!nombresMal.length) console.log('    (ninguno)');
console.log(`\n[2] DIRECTORIOS INVALIDOS (${dirsMal.length}):`);
dirsMal.forEach(d => console.log(`    ${d}`));
if (!dirsMal.length) console.log('    (ninguno)');
console.log(`\n[3] CLI NO SOPORTADO (${clisMal.length}):`);
clisMal.forEach(c => console.log(`    ${c}`));
if (!clisMal.length) console.log('    (ninguno)');
console.log(`\n[4] FORMA DEL INDICE (${problemasIndices.length}):`);
problemasIndices.forEach(p => console.log(`    ${p}`));
if (!problemasIndices.length) console.log(`    (${indices.length} índice(s), coherentes con el manifiesto)`);
