// Qué es un alta hecha a mano en un Índice de Subsistema, en una sola definición.
//
// La comparten los dos controles del subsistema que la necesitan: `avisar-alta-a-mano`, que avisa
// en el momento `al escribir` cuando el alta pasa por la herramienta de edición, y
// `avisar-sesion-sin-asentar`, que avisa al cerrar la tarea cuando el alta se hizo por consola —un
// `sed -i`, un heredoc— que el momento `al escribir` no ve. Escrita dos veces, la primera que cambie
// el criterio deja a la otra avisando distinto sin que nada lo diga.
//
// El criterio lo fijó el usuario el 15/11/2026 (plan `Avisar al cerrar una tarea que hay algo para
// asentar`, respuestas #3 = C y #4 = C). Un alta es «a mano» con LAS DOS PISTAS JUNTAS:
//   1. aparece una fila nueva con un Código que el Índice no tenía, y
//   2. en la sesión no se invocó ninguna habilidad de ese subsistema.
// Corregir una fila vieja no avisa: el Código ya estaba.
//
// Qué habilidades son «de ese subsistema» NO está escrito acá: sale de la columna `Operación` del
// catálogo de subsistemas, que es donde cada casa declara las habilidades que la operan. Así vale
// igual para las casas que suma el Propósito con `agregar-subsistema`, sin tocar este archivo.
//
// No vive en `.claude/common/`: los dos consumidores son del mismo subsistema (decisión
// `Local-0049`). Viaja con `conducta`, por el Patrón.

const fs = require('fs');
const path = require('path');
const { declaraIndice } = require('../common/frontmatter.js');
const { indicesDe, filasDe } = require('../common/indices.js');
const { esBorrador } = require('./alcance-al-escribir.js');

const normalizar = s => String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Las casas de subsistema del repo: los directorios de `.claude/` con su MANIFIESTO.md. Se descubre
// así y no leyendo el catálogo porque lo que interesa es la carpeta que existe en disco.
function casasDeSubsistema(repoRoot) {
  const base = path.join(repoRoot, '.claude');
  let hijos = [];
  try { hijos = fs.readdirSync(base, { withFileTypes: true }); } catch (e) { return []; }
  return hijos.filter(d => d.isDirectory() && fs.existsSync(path.join(base, d.name, 'MANIFIESTO.md')))
              .map(d => d.name.toLowerCase());
}

// La casa a la que pertenece una ruta, o null. Se toma el ÚLTIMO segmento `.claude/<casa>/` y no el
// primero: un worktree vive en `<repo>/.claude/tmp/worktrees/<nombre>/`, así que su ruta lleva dos
// `.claude/`, y el primero es `tmp`. Con el primero, toda escritura hecha dentro de un worktree
// caía fuera de toda casa sin emitir señal. Los borradores se miden contra la raíz del repo al que
// pertenece el archivo (`alcance-al-escribir.js`), por el mismo motivo.
function casaDe(ruta, casas) {
  if (!ruta) return null;
  const r = String(ruta).replace(/\\/g, '/');
  if (esBorrador(r)) return null;
  const m = [...r.toLowerCase().matchAll(/(?:^|\/)\.claude\/([^/]+)\//g)].pop();
  if (!m) return null;
  return casas.includes(m[1]) ? m[1] : null;
}

// Los Códigos de las filas de entrada de un texto. Fila de entrada = la que trae un Código en su
// primera celda, por convención del Patrón; la lectura es la misma que usan los nueve lints.
function codigosDeFilas(texto) {
  return new Set(filasDe({ texto: String(texto || '') }).map(f => f.codigo));
}

// Los Códigos que aparecen como primera celda de una fila en un texto suelto — un comando de
// consola, donde la fila puede venir en una sola línea dentro de un `sed` o un `echo`.
function codigosEnComando(cmd) {
  return new Set([...String(cmd || '').matchAll(/\|\s*((?:Base|Local)-\d{4})\s*\|/g)].map(m => m[1]));
}

// Si un texto es un Índice de Subsistema: lo declara su frontmatter.
const esIndice = texto => declaraIndice(String(texto || ''));

// El nombre de una habilidad sin el plugin que la califica (`amp-decisiones:registrar-decision`).
const nombreCorto = n => String(n || '').toLowerCase().split(':').pop().trim();

// Las habilidades que operan cada casa, leídas de la columna `Operación` del catálogo: lo que va
// entre comillas simples invertidas. Devuelve un Map casa -> Set de nombres cortos.
function habilidadesPorCasa(repoRoot) {
  const mapa = new Map();
  for (const idx of indicesDe(path.join(repoRoot, '.claude', 'subsistemas'))) {
    const cab = (idx.cabecera || []).map(normalizar);
    const iNom = cab.indexOf('nombre'), iOp = cab.indexOf('operacion');
    if (iNom < 0 || iOp < 0) continue;
    for (const f of filasDe(idx)) {
      const casa = String(f.celdas[iNom] || '').toLowerCase().trim();
      const nombres = [...String(f.celdas[iOp] || '').matchAll(/`([^`]+)`/g)].map(m => nombreCorto(m[1]));
      if (casa) mapa.set(casa, new Set([...(mapa.get(casa) || []), ...nombres]));
    }
  }
  return mapa;
}

// Las habilidades invocadas en una transcripción ya parseada: por la herramienta `Skill` o tipeadas
// por el usuario como comando (`<command-name>/registrar-decision</command-name>`).
function habilidadesInvocadas(objs) {
  const vistas = new Set();
  for (const o of objs) {
    const c = o && o.message && o.message.content;
    if (typeof c === 'string') {
      const m = /<command-name>\/?([^<\s]+)<\/command-name>/.exec(c);
      if (m) vistas.add(nombreCorto(m[1]));
      continue;
    }
    if (!Array.isArray(c)) continue;
    for (const it of c) {
      if (it && it.type === 'tool_use' && String(it.name || '').toLowerCase() === 'skill') {
        const n = it.input && (it.input.skill || it.input.name);
        if (n) vistas.add(nombreCorto(n));
      }
    }
  }
  return vistas;
}

// Lee un `.jsonl` como objetos; las líneas rotas se saltean. null si no se puede leer.
function leerTranscripcion(ruta) {
  let texto;
  try { texto = fs.readFileSync(ruta, 'utf8'); } catch (e) { return null; }
  const objs = [];
  for (const l of texto.split('\n')) {
    if (!l.trim()) continue;
    try { objs.push(JSON.parse(l)); } catch (e) { /* línea rota: se saltea, no rompe */ }
  }
  return objs;
}

// Si la sesión ya invocó alguna habilidad de la casa. Sin fila en el catálogo para esa casa no hay
// con qué juzgar, y se acepta cualquier habilidad de alta: el error se acomoda del lado de callar,
// porque un aviso equivocado sobre un alta bien hecha enseña a ignorar el aviso.
const ES_ALTA_GENERICA = /^(?:registrar-[a-z-]+|converger-terminologia|agregar-subsistema)$/;
function invocoHabilidadDeLaCasa(casa, invocadas, porCasa) {
  const propias = porCasa.get(casa);
  if (propias && propias.size) return [...propias].some(h => invocadas.has(h));
  return [...invocadas].some(h => ES_ALTA_GENERICA.test(h));
}

module.exports = {
  casasDeSubsistema, casaDe, codigosDeFilas, codigosEnComando, esIndice, nombreCorto,
  habilidadesPorCasa, habilidadesInvocadas, leerTranscripcion, invocoHabilidadDeLaCasa,
};
