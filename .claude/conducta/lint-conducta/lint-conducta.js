#!/usr/bin/env node
// Lint del subsistema conducta (decision 0021): valida el registro de reglas (INDICE.md) contra el
// vocabulario de momentos (MOMENTOS.md). Sin LLM, sin red. Autocontenido: solo lee archivos del
// propio subsistema (por eso no comparte el fragmento repoRoot de los otros lints).
// Uso: node lint-conducta.js [<carpeta conducta>]   (default: .claude/conducta)
const fs = require('fs'), path = require('path');
const root = path.resolve(process.argv[2] || '.claude/conducta');
const quiet = process.argv.includes('--quiet');

const CLASES = ['inyectar', 'correr', 'bloquear'];      // las tres clases de accion (0021), cerradas
const ESTADOS = ['vigente', 'pendiente', 'obsoleto'];

// -- parseo de tablas markdown ------------------------------------------
function filasTabla(txt, requeridas) {
  const out = [];
  const lineas = txt.split('\n').map(l => l.trim()).filter(l => l.startsWith('|'));
  let cols = null;
  for (const l of lineas) {
    const celdas = l.split('|').slice(1, -1).map(c => c.trim());
    const norm = celdas.map(c => c.toLowerCase().replace(/\*/g, ''));
    if (!cols) {
      if (requeridas.every(r => norm.includes(r))) {
        cols = {}; requeridas.forEach(r => { cols[r] = norm.indexOf(r); });
      }
      continue;
    }
    if (/^:?-{2,}:?$/.test(celdas[0].replace(/\s/g, ''))) continue;   // separador ---
    const fila = {}; for (const r of requeridas) fila[r] = (cols[r] < celdas.length ? celdas[cols[r]] : '');
    out.push(fila);
  }
  return { cols, filas: out };
}

const problemas = { estructura: [], momentoInexistente: [], claseInvalida: [], estadoInvalido: [], inyectarSinTexto: [], vigenteSinRepartidor: [] };

// -- vocabulario de momentos --------------------------------------------
const momPath = path.join(root, 'MOMENTOS.md');
let momentos = new Map();   // nombre -> disponibilidad (activo|declarado)
if (!fs.existsSync(momPath)) problemas.estructura.push('falta MOMENTOS.md (vocabulario de momentos)');
else {
  const { cols, filas } = filasTabla(fs.readFileSync(momPath, 'utf8'), ['momento', 'disponibilidad']);
  if (!cols) problemas.estructura.push('MOMENTOS.md: no se encontro la tabla (columnas Momento, Disponibilidad)');
  else for (const f of filas) momentos.set(f.momento.toLowerCase(), f.disponibilidad.toLowerCase());
}

// -- registro de reglas -------------------------------------------------
const idxPath = path.join(root, 'INDICE.md');
if (!fs.existsSync(idxPath)) problemas.estructura.push('falta INDICE.md (registro de reglas)');
else {
  const requeridas = ['regla', 'momento', 'clase', 'contenido', 'estado'];
  const { cols, filas } = filasTabla(fs.readFileSync(idxPath, 'utf8'), requeridas);
  if (!cols) problemas.estructura.push(`INDICE.md: no se encontro la tabla (columnas ${requeridas.join(', ')})`);
  else for (const f of filas) {
    const regla = f.regla || '(sin nombre)';
    const momento = f.momento.toLowerCase(), clase = f.clase.toLowerCase(), estado = f.estado.toLowerCase();
    if (!momentos.has(momento)) problemas.momentoInexistente.push(`"${regla}" -> momento "${f.momento}" no esta en MOMENTOS.md`);
    if (!CLASES.includes(clase)) problemas.claseInvalida.push(`"${regla}" -> clase "${f.clase}" (validas: ${CLASES.join('/')})`);
    if (!ESTADOS.includes(estado)) problemas.estadoInvalido.push(`"${regla}" -> estado "${f.estado}" (validos: ${ESTADOS.join('/')})`);
    if (clase === 'inyectar' && !f.contenido) problemas.inyectarSinTexto.push(`"${regla}" -> clase inyectar sin Contenido`);
    // honestidad: una regla vigente no puede colgar de un momento sin repartidor (disponibilidad declarado)
    if (estado === 'vigente' && momentos.get(momento) === 'declarado')
      problemas.vigenteSinRepartidor.push(`"${regla}" -> vigente pero su momento "${f.momento}" es 'declarado' (sin repartidor): deberia ser 'pendiente'`);
  }
}

// -- salida -------------------------------------------------------------
const secciones = [
  ['ESTRUCTURA', problemas.estructura],
  ['MOMENTO INEXISTENTE (regla apunta a un momento fuera de MOMENTOS.md)', problemas.momentoInexistente],
  ['CLASE INVALIDA', problemas.claseInvalida],
  ['ESTADO INVALIDO', problemas.estadoInvalido],
  ['INYECTAR SIN CONTENIDO', problemas.inyectarSinTexto],
  ['VIGENTE SOBRE MOMENTO SIN REPARTIDOR', problemas.vigenteSinRepartidor],
];
const total = secciones.reduce((n, [, it]) => n + it.length, 0);
if (quiet && total === 0) process.exit(0);
console.log(`== LINT CONDUCTA: ${root} ==`);
console.log(`momentos: ${momentos.size} | hallazgos: ${total}\n`);
for (const [titulo, items] of secciones) {
  if (quiet && !items.length) continue;
  console.log(`[${titulo}] (${items.length})`);
  items.forEach(i => console.log(`    ${i}`));
  if (!quiet && !items.length) console.log('    (ninguno)');
}
