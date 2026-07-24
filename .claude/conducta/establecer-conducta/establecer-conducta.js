#!/usr/bin/env node
// Hook repartidor del subsistema conducta. Un mismo script sirve a varios eventos:
// lee el registro VIVO de reglas (../INDICE.md), resuelve que momento(s) realiza el evento que lo
// disparo (con su condicion, sin juicio), y despacha las reglas de ese momento segun su clase.
// Agregar/cambiar una regla NO toca este script: lee el registro en cada disparo.
//
// Eventos que realiza hoy (la realizacion del momento es agente-especifica):
//   - UserPromptSubmit         -> momento `cada turno`            (sin condicion)      [clase inyectar]
//   - PreToolUse Write|Edit .md bajo .claude/ -> momento `al escribir` (condicion sin juicio) [clase inyectar]
//   - SessionStart             -> momento `al arrancar la sesion` (sin condicion)     [clase correr]
// El vocabulario de momentos vive en ../MOMENTOS.md; aca vive COMO se realiza cada uno.
//
// Dos clases de despacho (la tercera, `bloquear`, todavia no se implementa):
//   - inyectar: arma un texto y lo emite como additionalContext (llega al modelo).
//   - correr:   ejecuta la Herramienta cuya ruta es el Contenido de la regla y REENVIA su stdout
//               verbatim (ej. la Pantalla de bienvenida emite {systemMessage} en SessionStart:
//               ese campo es el unico que pinta la terminal del usuario). Un momento es hoy de un
//               solo tipo (SessionStart es correr-only): inyectar y correr no se combinan en el mismo momento.
//
// Contrato de hook (conocimiento hooks-claude-code): stdin = JSON del harness; stdout = JSON.
//   UserPromptSubmit/PreToolUse: { hookSpecificOutput: { hookEventName, additionalContext } }
//     (PreToolUse sin permissionDecision => 'defer': inyecta y deja el flujo de permisos intacto,
//     verificado 2026-07-23; NO auto-aprueba. additionalContext llega junto al resultado de la tool.)
//   SessionStart: lo que emita la Herramienta `correr` (ej. { systemMessage: <caja> }, visible al usuario).
// Nunca rompe el turno: ante cualquier error o registro vacio, sale 0 sin emitir nada.
//
// Uso a mano (probar): echo {"hook_event_name":"SessionStart"} | node establecer-conducta.js
const fs = require('fs'), path = require('path');
const { execSync } = require('child_process');
const idxPath = path.resolve(__dirname, '..', 'INDICE.md');
const repoRoot = path.resolve(__dirname, '..', '..', '..');   // .../conducta/establecer-conducta -> repo

// -- que momento realiza cada evento, con su condicion sin juicio -------
// Devuelve el nombre del momento a entregar, o null si el evento+datos no realiza ninguno.
function momentoDe(data) {
  const ev = data.hook_event_name;
  if (ev === 'UserPromptSubmit') return 'cada turno';
  if (ev === 'SessionStart') return 'al arrancar la sesión';
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

// Devuelve las reglas del registro que matchean (clase, vigente, momento) con Contenido.
function reglasDe(momento, clase) {
  if (!momento || !fs.existsSync(idxPath)) return [];
  return leerReglas(fs.readFileSync(idxPath, 'utf8'))
    .filter(r => r.clase === clase && r.estado === 'vigente' && r.momento === momento && r.contenido);
}

// -- inyectar: texto para el modelo -------------------------------------
function construir(momento) {
  const reglas = reglasDe(momento, 'inyectar');
  if (!reglas.length) return '';
  const bullets = reglas.map(r => `- ${r.contenido}`).join('\n');
  return `Recordatorio de conducta — momento «${momento}» (subsistema conducta):\n${bullets}`;
}

// -- correr: ejecutar la Herramienta y reenviar su stdout verbatim ------
// El Contenido es la ruta del script relativa a .claude/ (con sus flags), ej.
// `conducta/mostrar-pantalla-bienvenida/mostrar-pantalla-bienvenida.js --hook`.
function correr(momento, input) {
  const reglas = reglasDe(momento, 'correr');
  if (!reglas.length) return false;
  for (const r of reglas) {
    try {
      const out = execSync('node .claude/' + r.contenido, { cwd: repoRoot, input, encoding: 'utf8', timeout: 20000 });
      if (out && out.trim()) process.stdout.write(out);   // reenvio verbatim (JSON valido del hijo)
    } catch (e) { /* no romper el turno: el hijo fallo, se ignora */ }
  }
  return true;
}

// Se drena stdin (contrato del hook) y se despacha segun el evento y la clase.
let input = '';
process.stdin.on('data', c => { input += c; });
process.stdin.on('end', () => {
  let data = {};
  try { data = JSON.parse(input || '{}'); } catch (e) { data = {}; }
  let momento = null;
  try { momento = momentoDe(data); } catch (e) { momento = null; }

  // clase `correr` primero (SessionStart): ejecuta y reenvia; no se combina con inyectar.
  try { if (correr(momento, input)) return process.exit(0); } catch (e) { /* sigue a inyectar */ }

  // clase `inyectar` (cada turno / al escribir): additionalContext para el modelo.
  let ctx = '';
  try { ctx = construir(momento); } catch (e) { ctx = ''; }   // ante error, no romper el turno
  if (ctx) {
    const ev = data.hook_event_name === 'PreToolUse' ? 'PreToolUse' : 'UserPromptSubmit';
    // PreToolUse: se OMITE permissionDecision a proposito (=> 'defer'): inyecta sin auto-aprobar.
    process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: ev, additionalContext: ctx } }));
  }
  process.exit(0);
});
process.stdin.on('error', () => process.exit(0));
