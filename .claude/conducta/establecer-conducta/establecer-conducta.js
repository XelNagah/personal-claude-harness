#!/usr/bin/env node
// Hook repartidor del subsistema conducta (decision 0021). Un mismo script sirve a varios eventos:
// lee el registro VIVO de reglas (../INDICE.md), resuelve que momento(s) realiza el evento que lo
// disparo (con su condicion, sin juicio), y entrega el Contenido de las reglas de clase `inyectar`,
// estado `vigente` y ese momento, como additionalContext para el modelo.
// Agregar/cambiar una regla NO toca este script: lee el registro en cada disparo.
//
// Eventos que realiza hoy (la realizacion del momento es agente-especifica, 0021):
//   - UserPromptSubmit         -> momento `cada turno`   (sin condicion)
//   - PreToolUse Write|Edit .md bajo .claude/ -> momento `al escribir` (condicion sin juicio)
// El vocabulario de momentos vive en ../MOMENTOS.md; aca vive COMO se realiza cada uno.
//
// Contrato de hook (conocimiento hooks-claude-code): stdin = JSON del harness; stdout = JSON.
//   UserPromptSubmit: { hookSpecificOutput: { hookEventName, additionalContext } }
//   PreToolUse:       { hookSpecificOutput: { hookEventName, additionalContext } }  (sin
//                     permissionDecision => 'defer': inyecta y deja el flujo de permisos intacto,
//                     verificado 2026-07-23; NO auto-aprueba). additionalContext llega junto al
//                     resultado de la tool (post-ejecucion): recordatorio posterior, no aviso previo.
// Nunca rompe el turno: ante cualquier error o registro vacio, sale 0 sin emitir nada.
//
// Uso a mano (probar): echo {"hook_event_name":"UserPromptSubmit"} | node establecer-conducta.js
const fs = require('fs'), path = require('path');
const idxPath = path.resolve(__dirname, '..', 'INDICE.md');

// -- que momento realiza cada evento, con su condicion sin juicio -------
// Devuelve el nombre del momento a entregar, o null si el evento+datos no realiza ninguno.
function momentoDe(data) {
  const ev = data.hook_event_name;
  if (ev === 'UserPromptSubmit') return 'cada turno';
  if (ev === 'PreToolUse') {
    const tool = data.tool_name || '';
    const fp = ((data.tool_input && data.tool_input.file_path) || '').replace(/\\/g, '/');
    // condicion `al escribir`: escribir/editar un .md bajo .claude/ (registros y docs del harness)
    if ((tool === 'Write' || tool === 'Edit') && /\.md$/i.test(fp) && /(^|\/)\.claude\//.test(fp)) return 'al escribir';
    return null;
  }
  return null;
}

// -- parseo minimo de la tabla markdown del registro de reglas ----------
function leerReglas(txt) {
  const filas = [];
  const lineas = txt.split('\n').map(l => l.trim()).filter(l => l.startsWith('|'));
  let cols = null;
  for (const l of lineas) {
    const celdas = l.split('|').slice(1, -1).map(c => c.trim());
    const norm = celdas.map(c => c.toLowerCase().replace(/\*/g, ''));
    if (!cols) {
      if (norm.includes('regla') && norm.includes('momento')) {
        cols = { momento: norm.indexOf('momento'), clase: norm.indexOf('clase'),
                 contenido: norm.indexOf('contenido'), estado: norm.indexOf('estado') };
      }
      continue;
    }
    if (/^:?-{2,}:?$/.test(celdas[0].replace(/\s/g, ''))) continue;
    const val = i => (i >= 0 && i < celdas.length ? celdas[i] : '');
    filas.push({ momento: val(cols.momento).toLowerCase(), clase: val(cols.clase).toLowerCase(),
                 contenido: val(cols.contenido), estado: val(cols.estado).toLowerCase() });
  }
  return filas;
}

function construir(momento) {
  if (!momento || !fs.existsSync(idxPath)) return '';
  const reglas = leerReglas(fs.readFileSync(idxPath, 'utf8'))
    .filter(r => r.clase === 'inyectar' && r.estado === 'vigente' && r.momento === momento && r.contenido);
  if (!reglas.length) return '';
  const bullets = reglas.map(r => `- ${r.contenido}`).join('\n');
  return `Recordatorio de conducta — momento «${momento}» (subsistema conducta):\n${bullets}`;
}

// Se drena stdin (contrato del hook) y se despacha segun el evento.
let input = '';
process.stdin.on('data', c => { input += c; });
process.stdin.on('end', () => {
  let data = {}, ctx = '';
  try { data = JSON.parse(input || '{}'); } catch (e) { data = {}; }
  try { ctx = construir(momentoDe(data)); } catch (e) { ctx = ''; }   // ante error, no romper el turno
  if (ctx) {
    const ev = data.hook_event_name === 'PreToolUse' ? 'PreToolUse' : 'UserPromptSubmit';
    // PreToolUse: se OMITE permissionDecision a proposito (=> 'defer'): inyecta sin auto-aprobar.
    process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: ev, additionalContext: ctx } }));
  }
  process.exit(0);
});
process.stdin.on('error', () => process.exit(0));
