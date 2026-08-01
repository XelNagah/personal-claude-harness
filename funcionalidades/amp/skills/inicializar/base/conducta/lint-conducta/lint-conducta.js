#!/usr/bin/env node
// Lint del subsistema conducta: valida el registro de reglas (INDICE.md) contra el
// vocabulario de momentos (MOMENTOS.md). Sin LLM, sin red. Autocontenido: solo lee archivos del
// propio subsistema (por eso no comparte el fragmento repoRoot de los otros lints).
// Uso: node lint-conducta.js [<carpeta conducta>]   (default: .claude/conducta)
const fs = require('fs'), path = require('path');

const { indicesDe, problemasDeIndices } = require('../../common/indices.js');
// La ruta es el primer argumento que NO sea una bandera: con `--quiet` primero, tomarlo por
// posicion daba una carpeta inexistente y el lint reportaba que faltaban MOMENTOS.md e INDICE.md.
const root = path.resolve(process.argv.slice(2).find(a => !a.startsWith('--')) || '.claude/conducta');
const quiet = process.argv.includes('--quiet');

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

const problemas = { estructura: [], indices: [], momentoInexistente: [], claseInvalida: [], estadoInvalido: [], inyectarSinTexto: [], vigenteSinRepartidor: [] };

// -- vocabulario de momentos --------------------------------------------
// El vocabulario se lee de DOS archivos: `MOMENTOS.md` (lo manda el Agente Multiproposito y el
// nivelador lo reemplaza entero) y `MOMENTOS-LOCAL.md` (los momentos que suma el Propósito de cada
// repo; el nivelador no lo abre). Sin el segundo, un repo que necesitaba un momento propio no tenia
// donde declararlo: el unico archivo disponible era uno que el nivelador pisa en la corrida siguiente.
// El del Agente Desplegado es OPCIONAL — la mayoria de los repos no suma momentos— y su ausencia no
// es un hallazgo.
//
// No llevan frontmatter de Índice a proposito: no listan entradas del subsistema sino vocabulario, y
// declararlos como Índice haria que el lint les exigiera las columnas de una regla.
const momPath = path.join(root, 'MOMENTOS.md');
const momLocalPath = path.join(root, 'MOMENTOS-LOCAL.md');
let momentos = new Map();   // nombre -> disponibilidad (activo|declarado)
if (!fs.existsSync(momPath)) problemas.estructura.push('falta MOMENTOS.md (vocabulario de momentos)');
else {
  const { cols, filas } = filasTabla(fs.readFileSync(momPath, 'utf8'), ['momento', 'disponibilidad']);
  if (!cols) problemas.estructura.push('MOMENTOS.md: no se encontro la tabla (columnas Momento, Disponibilidad)');
  else for (const f of filas) momentos.set(f.momento.toLowerCase(), f.disponibilidad.toLowerCase());
}
if (fs.existsSync(momLocalPath)) {
  const { cols, filas } = filasTabla(fs.readFileSync(momLocalPath, 'utf8'), ['momento', 'disponibilidad']);
  if (!cols) problemas.estructura.push('MOMENTOS-LOCAL.md: no se encontro la tabla (columnas Momento, Disponibilidad)');
  else for (const f of filas) {
    const nombre = f.momento.toLowerCase();
    // Un momento del repo que repite uno de la Base es ambiguo: el nivelador reemplaza el de arriba y
    // el de abajo queda pisandolo en silencio, con otra disponibilidad.
    if (momentos.has(nombre)) problemas.estructura.push(`MOMENTOS-LOCAL.md: "${f.momento}" ya esta en MOMENTOS.md (el del Agente Multiproposito manda)`);
    else momentos.set(nombre, f.disponibilidad.toLowerCase());
  }
}

// -- vocabulario de clases ----------------------------------------------
// La lista vivia escrita a mano aca; ahora sale de CLASES.md, para que el dato y su significado
// no queden en dos lugares que nada sincroniza. Si el archivo falta —Agente Desplegado sin
// nivelar— se cae a las tres de siempre en vez de dar por invalida toda regla.
const clasPath = path.join(root, 'CLASES.md');
let CLASES = ['inyectar', 'ejecutar', 'bloquear'];
if (fs.existsSync(clasPath)) {
  const { cols, filas } = filasTabla(fs.readFileSync(clasPath, 'utf8'), ['clase', 'disponibilidad']);
  if (!cols) problemas.estructura.push('CLASES.md: no se encontro la tabla (columnas Clase, Disponibilidad)');
  else {
    const leidas = filas.map(f => f.clase.toLowerCase()).filter(Boolean);
    if (leidas.length) CLASES = leidas;
    else problemas.estructura.push('CLASES.md: la tabla no tiene ninguna clase');
  }
}

// -- registro de reglas -------------------------------------------------
// Las reglas se reparten entre uno o dos Indices (uno por origen) y el repartidor los lee a todos:
// mirar uno solo dejaria las reglas del otro sin validar, calladas.
const indices = indicesDe(root, ['INDICE.md']);
const maniPath = path.join(root, 'MANIFIESTO.md');
problemas.indices.push(...problemasDeIndices(indices, fs.existsSync(maniPath) ? fs.readFileSync(maniPath, 'utf8') : null));
if (!indices.length) problemas.estructura.push('falta el Indice de reglas (INDICE.md)');
for (const idx of indices) {
  // La columna del nombre es `Nombre` desde que el registro tomo el nucleo; `Regla` es la forma
  // vieja, que se acepta mientras haya Agentes Desplegados sin nivelar. Sin ninguna de las dos
  // no se lee una sola fila y el registro entero se valida en verde sin validar nada.
  const nombreCol = /^\|[^\n]*\bnombre\b/mi.test(idx.texto) ? 'nombre' : 'regla';
  const requeridas = [nombreCol, 'momento', 'clase', 'contenido', 'estado'];
  const { cols, filas } = filasTabla(idx.texto, requeridas);
  if (!cols) { problemas.estructura.push(`${idx.nombre}: no se encontro la tabla (columnas ${requeridas.join(', ')})`); continue; }
  for (const f of filas) {
    const regla = f[nombreCol] || '(sin nombre)';
    const momento = f.momento.toLowerCase(), clase = f.clase.toLowerCase(), estado = f.estado.toLowerCase();
    if (!momentos.has(momento)) problemas.momentoInexistente.push(`"${regla}" -> momento "${f.momento}" no esta en MOMENTOS.md`);
    if (!CLASES.includes(clase)) problemas.claseInvalida.push(`"${regla}" -> clase "${f.clase}" (validas: ${CLASES.join('/')})`);
    if (!ESTADOS.includes(estado)) problemas.estadoInvalido.push(`"${regla}" -> estado "${f.estado}" (validos: ${ESTADOS.join('/')})`);
    // `—` es el marcador de "nada" en todos los registros del repo, asi que cuenta como vacio: sin
    // esto una regla `Inyectar` con la celda en `—` pasaba el control y quedaba sin texto que
    // inyectar, entregando una cadena vacia en su momento sin que nadie avisara.
    const sinContenido = !f.contenido || ['—', '-', '–'].includes(f.contenido.trim());
    if (clase === 'inyectar' && sinContenido) problemas.inyectarSinTexto.push(`"${regla}" -> clase inyectar sin Contenido`);
    // honestidad: una regla vigente no puede colgar de un momento sin repartidor (disponibilidad declarado)
    if (estado === 'vigente' && momentos.get(momento) === 'declarado')
      problemas.vigenteSinRepartidor.push(`"${regla}" -> vigente pero su momento "${f.momento}" es 'declarado' (sin repartidor): deberia ser 'pendiente'`);
  }
}

// -- salida -------------------------------------------------------------
const secciones = [
  ['ESTRUCTURA', problemas.estructura],
  ['INDICES DECLARADOS (frontmatter vs tabla vs manifiesto)', problemas.indices],
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
