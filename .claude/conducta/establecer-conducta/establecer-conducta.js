#!/usr/bin/env node
// Hook repartidor del subsistema conducta (decision 0021). Corre en UserPromptSubmit: lee el
// registro VIVO de reglas (../INDICE.md), toma las reglas de clase `inyectar`, estado `vigente`
// y momento `cada turno`, y emite su Contenido como additionalContext para el modelo.
// Agregar/cambiar una regla NO toca este script: lee el registro en cada disparo.
//
// Contrato de hook (conocimiento hooks-claude-code): stdin recibe el JSON del harness; se emite por
// stdout { hookSpecificOutput: { hookEventName: "UserPromptSubmit", additionalContext } }.
// Nunca rompe el turno: ante cualquier error o registro vacio, sale 0 sin emitir nada.
//
// Uso: como hook (settings.json de Claude / .codex/hooks.json). A mano, para probar:
//   echo {} | node .claude/conducta/establecer-conducta/establecer-conducta.js
const fs = require('fs'), path = require('path');

const MOMENTO_ACTIVO = 'cada turno';   // unico momento con repartidor en la version fina
const idxPath = path.resolve(__dirname, '..', 'INDICE.md');

// Parseo minimo de la tabla markdown del registro: mapea encabezados a indices de columna y
// devuelve una fila como objeto { regla, momento, clase, contenido, estado }.
function leerReglas(txt) {
  const filas = [];
  const lineas = txt.split('\n').map(l => l.trim()).filter(l => l.startsWith('|'));
  let cols = null;
  for (const l of lineas) {
    const celdas = l.split('|').slice(1, -1).map(c => c.trim());
    const norm = celdas.map(c => c.toLowerCase().replace(/\*/g, ''));
    if (!cols) {                                   // primera fila con pipes = encabezado
      if (norm.includes('regla') && norm.includes('momento')) {
        cols = {
          regla: norm.indexOf('regla'), momento: norm.indexOf('momento'),
          clase: norm.indexOf('clase'), contenido: norm.indexOf('contenido'),
          estado: norm.indexOf('estado'),
        };
      }
      continue;
    }
    if (/^:?-{2,}:?$/.test(celdas[0].replace(/\s/g, ''))) continue;  // separador ---
    const val = i => (i >= 0 && i < celdas.length ? celdas[i] : '');
    filas.push({
      regla: val(cols.regla), momento: val(cols.momento).toLowerCase(),
      clase: val(cols.clase).toLowerCase(), contenido: val(cols.contenido),
      estado: val(cols.estado).toLowerCase(),
    });
  }
  return filas;
}

function construir() {
  if (!fs.existsSync(idxPath)) return '';
  const reglas = leerReglas(fs.readFileSync(idxPath, 'utf8'))
    .filter(r => r.clase === 'inyectar' && r.estado === 'vigente' && r.momento === MOMENTO_ACTIVO && r.contenido);
  if (!reglas.length) return '';
  const bullets = reglas.map(r => `- ${r.contenido}`).join('\n');
  return `Recordatorio de conducta — momento «${MOMENTO_ACTIVO}» (subsistema conducta):\n${bullets}`;
}

// Se lee stdin hasta el cierre (contrato del hook), pero la version fina no depende del prompt:
// las reglas de `cada turno` son incondicionales. Se drena igual para no dejar el pipe abierto.
let input = '';
process.stdin.on('data', c => { input += c; });
process.stdin.on('end', () => {
  let ctx = '';
  try { ctx = construir(); } catch (e) { ctx = ''; }   // ante error, no romper el turno
  if (ctx) {
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: ctx },
    }));
  }
  process.exit(0);
});
process.stdin.on('error', () => process.exit(0));
