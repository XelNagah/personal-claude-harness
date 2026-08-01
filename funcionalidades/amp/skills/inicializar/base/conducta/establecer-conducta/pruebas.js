#!/usr/bin/env node
// Pruebas del repartidor `establecer-conducta`.
//
// Es el control mas importante del repo y el que menos se ve: los diez lints pueden dar verde
// mientras el repartidor no entrega NADA. Una regla bien escrita, con su momento y su clase validos,
// no sirve de nada si el hook no la despacha — y el sintoma es que el agente simplemente trabaja sin
// ella, sin ningun error en ninguna parte. La decision `Local-0042` describe el caso exacto: el
// repartidor ubica `Momento` y `Clase` por nombre de columna, y si una se renombra no encuentra
// ninguna y cada fila queda con el momento vacio, sin emitir un error.
//
// Corre contra el registro REAL, no contra un banco: el repartidor resuelve su registro desde su
// propia ubicacion, y eso es correcto para un hook (siempre opera sobre el repo donde esta
// instalado, y su directorio de trabajo no es confiable). Lo que se verifica es la cadena completa:
// leer el registro, resolver el momento del evento, despachar por clase.
//
// Uso: node .claude/conducta/establecer-conducta/pruebas.js   (desde la raíz del repo)
const path = require('path');
const { spawnSync } = require('child_process');

const HOOK = path.join(__dirname, 'establecer-conducta.js');
const REPO = path.resolve(__dirname, '..', '..', '..');
const MD = path.join(REPO, 'caso-de-prueba-que-no-existe.md').replace(/\\/g, '/');

function disparar(entrada, ms = 120000) {
  const r = spawnSync(process.execPath, [HOOK], {
    input: typeof entrada === 'string' ? entrada : JSON.stringify(entrada),
    encoding: 'utf8', timeout: ms, cwd: REPO,
  });
  const salida = (r.stdout || '').trim();
  let json = null;
  try { json = salida ? JSON.parse(salida) : null; } catch { /* salida no-JSON: se informa cruda */ }
  const h = (json && json.hookSpecificOutput) || {};
  return {
    codigo: r.status,
    crudo: salida,
    contexto: h.additionalContext || '',
    decision: h.permissionDecision || '',
    mensaje: (json && json.systemMessage) || '',
  };
}

let malos = 0;
const chequear = (nombre, condicion, detalle) => {
  console.log(`${condicion ? 'OK  ' : 'FALLA'} ${nombre}${detalle ? `  → ${detalle}` : ''}`);
  if (!condicion) malos++;
};

console.log('== ENTREGA: cada evento despacha las reglas de su momento ==');

// `cada turno`: el momento que más reglas tiene. Si no entrega, el agente pierde el recordatorio de
// preferencias y el de terminología en TODOS los turnos.
{
  const r = disparar({ hook_event_name: 'UserPromptSubmit' });
  chequear('UserPromptSubmit entrega las reglas de «cada turno»',
    r.contexto.length > 100, `${r.contexto.length} caracteres de contexto`);
  chequear('  …y el texto es el del registro, no uno vacío',
    /preferencia|terminolog/i.test(r.contexto), r.contexto.slice(0, 60).replace(/\n/g, ' ') + '…');
}

// `al escribir` sobre un .md: combina el texto fijo de las reglas `Inyectar` con lo que mide la
// regla `Bloquear`.
{
  const r = disparar({ hook_event_name: 'PreToolUse', tool_name: 'Write',
    tool_input: { file_path: MD, content: 'Un texto en español corriente, sin nada que objetar.\n' } });
  chequear('PreToolUse sobre un .md entrega las reglas de «al escribir»',
    r.contexto.length > 50, `${r.contexto.length} caracteres`);
  chequear('  …y no frena una escritura limpia',
    r.decision !== 'deny', r.decision || '(sin decisión: defer)');
}

// La clase `Bloquear` en acción: el mismo momento, con un término que no tiene uso legítimo posible.
{
  const r = disparar({ hook_event_name: 'PreToolUse', tool_name: 'Write',
    tool_input: { file_path: MD, content: 'hay mucho churn en el repo\n' } });
  chequear('PreToolUse frena la escritura con un término vetado', r.decision === 'deny', r.decision || '(nada)');
}

// La clase `Ejecutar`: su salida ES la respuesta del hook, y `systemMessage` es el único campo que
// escribe en la terminal del usuario.
{
  const r = disparar({ hook_event_name: 'SessionStart' });
  chequear('SessionStart entrega la Pantalla de bienvenida por systemMessage',
    r.mensaje.length > 100, `${r.mensaje.length} caracteres`);
  chequear('  …y la caja llega armada, no en pedazos',
    r.mensaje.includes('╔') && r.mensaje.includes('╚'), r.mensaje.split('\n')[1] || '');
  // Varias reglas `Ejecutar` en el mismo momento se FUSIONAN en un `systemMessage`. Escribir los
  // JSON uno detrás del otro deja dos objetos pegados, que no es JSON válido: el harness lo
  // descarta y no se ve NADA — ni siquiera la caja que sí funcionaba. Este repo tiene dos reglas en
  // este momento, así que el caso corre de verdad; el chequeo afirma que la respuesta sigue siendo
  // un JSON con `systemMessage` y que lo de la segunda regla llegó, no que haya exactamente dos.
  chequear('  …y con varias reglas la respuesta sigue siendo un JSON solo',
    r.crudo.trim().startsWith('{') && r.crudo.trim().endsWith('}') && !/\}\s*\{/.test(r.crudo),
    `${r.crudo.length} caracteres, un objeto`);
  // El orden lo decide el origen, no el nombre del archivo. `INDICE-LOCAL.md` ordena antes que
  // `INDICE.md`, así que sin ordenar por origen lo que sumó el repo sale DELANTE de la Pantalla de
  // bienvenida. Se afirma que no hay texto antes de la caja, que es lo que se rompe al invertirlo.
  const antesDeLaCaja = r.mensaje.slice(0, r.mensaje.indexOf('╔')).trim();
  chequear('  …con las del Agente Multipropósito antes que las del repo',
    r.mensaje.includes('╔') && antesDeLaCaja === '',
    antesDeLaCaja ? `"${antesDeLaCaja.slice(0, 50)}" quedó delante` : 'la caja primero');
}

console.log('\n== NO ENTREGA donde no corresponde ==');

{
  const r = disparar({ hook_event_name: 'PreToolUse', tool_name: 'Write',
    tool_input: { file_path: path.join(REPO, 'caso.js').replace(/\\/g, '/'), content: 'hay mucho churn\n' } });
  chequear('un archivo que no es .md no dispara «al escribir»', !r.crudo, r.crudo.slice(0, 60) || '(nada)');
}
{
  const r = disparar({ hook_event_name: 'Stop' });
  chequear('un evento sin momento realizado no emite nada', !r.crudo, r.crudo.slice(0, 60) || '(nada)');
}

console.log('\n== NUNCA ROMPE EL TURNO ==');
// Un hook que revienta se lleva puesto el turno del usuario. Ante cualquier entrada, sale 0.
for (const [nombre, entrada] of [
  ['entrada vacía', ''],
  ['JSON inválido', '{esto no es json'],
  ['objeto sin evento', '{}'],
  ['evento con tool_input nulo', '{"hook_event_name":"PreToolUse","tool_name":"Write","tool_input":null}'],
]) {
  const r = disparar(entrada, 30000);
  chequear(`${nombre} → sale 0 sin romper`, r.codigo === 0, `código ${r.codigo}`);
}

console.log(`\ncasos: 12`);
console.log(malos ? `${malos} FALLARON.` : 'TODO VERDE.');
process.exit(malos ? 1 : 0);
