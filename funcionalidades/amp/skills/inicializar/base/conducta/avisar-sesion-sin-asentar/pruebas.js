#!/usr/bin/env node
// Pruebas del control `avisar-sesion-sin-asentar`.
//
// Lo que este banco protege es una decision que NO se ve fallar: el control decide si el agente
// habla al cerrar una tarea, y las dos formas de romperlo son mudas. Si se pasa de callado, el
// conocimiento se pierde y nadie se entera. Si se pasa de hablador, cada cierre cuesta una vuelta
// completa del modelo y el agente no puede terminar hasta el corte del CLI a las 8 continuaciones.
// Ninguna de las dos emite un error en ninguna parte.
//
// EL BANCO FABRICA SU REPO, y no presta el real. Dos motivos:
//   1. El control resuelve su repo desde su propia ubicacion —correcto para un hook, que siempre
//      opera sobre el repo donde esta instalado—, asi que la unica forma de darle otro escenario es
//      correr una COPIA suya en otro arbol.
//   2. Escribiria sus marcas de sesion en el `.claude/tmp/` real, y una marca de mas apaga el aviso
//      verdadero de la sesion que este corriendo el banco.
// Las casas del escenario son de mentira a proposito: se prueba que el control reconozca UNA CASA,
// no las nueve de este repo. Un banco que espere las de aca da rojo el dia que se instala en un
// Agente Desplegado con otras (conocimiento `controles-que-no-avisan`, forma «escenario prestado»).
//
// Uso: node .claude/conducta/avisar-sesion-sin-asentar/pruebas.js   (desde la raíz del repo)
const fs = require('fs'), path = require('path'), os = require('os');
const { spawnSync } = require('child_process');

const ORIGEN = path.join(__dirname, 'avisar-sesion-sin-asentar.js');
const REPO = fs.mkdtempSync(path.join(os.tmpdir(), 'banco-sin-asentar-'));
const DIR_CONTROL = path.join(REPO, '.claude', 'conducta', 'avisar-sesion-sin-asentar');
fs.mkdirSync(DIR_CONTROL, { recursive: true });
fs.copyFileSync(ORIGEN, path.join(DIR_CONTROL, 'avisar-sesion-sin-asentar.js'));
const CONTROL = path.join(DIR_CONTROL, 'avisar-sesion-sin-asentar.js');

// Tres casas de subsistema del escenario. Una casa ES un directorio de `.claude/` con MANIFIESTO.md.
// `conducta` lo lleva tambien, porque el control vive adentro y tiene que reconocerla como casa.
for (const casa of ['conducta', 'decisiones', 'conocimiento']) {
  const d = path.join(REPO, '.claude', casa);
  fs.mkdirSync(d, { recursive: true });
  fs.writeFileSync(path.join(d, 'MANIFIESTO.md'), '# ' + casa + '\n');
}
// Un directorio de `.claude/` SIN manifiesto no es una casa: escribir ahi no cuenta como asentar.
fs.mkdirSync(path.join(REPO, '.claude', 'tmp'), { recursive: true });

// -- transcripciones sinteticas ------------------------------------------
const PISO = 5000;   // el banco usa un piso chico para no fabricar archivos de 200 KB
const RELLENO = JSON.stringify({ type: 'user', message: { role: 'user', content: 'texto de relleno para llegar al piso' } });

// Arma un `.jsonl` con los usos de herramienta que se le pasen, rellenado hasta `bytes`.
function transcripcion(nombre, usos, bytes = PISO + 2000) {
  const lineas = usos.map(u => JSON.stringify({
    type: 'assistant', message: { role: 'assistant', content: [{ type: 'tool_use', name: u.name, input: u.input }] },
  }));
  let texto = lineas.join('\n') + '\n';
  while (texto.length < bytes) texto += RELLENO + '\n';
  const p = path.join(REPO, nombre);
  fs.writeFileSync(p, texto, 'utf8');
  return p;
}

let n = 0;
function correr(datos, extra = []) {
  const args = ['--piso', String(PISO), ...extra];
  const r = spawnSync(process.execPath, [CONTROL, ...args], {
    input: typeof datos === 'string' ? datos : JSON.stringify(datos),
    encoding: 'utf8', timeout: 30000, cwd: REPO,
  });
  const salida = (r.stdout || '').trim();
  let json = null;
  try { json = salida ? JSON.parse(salida) : null; } catch { /* salida no-JSON: se informa cruda */ }
  const h = (json && json.hookSpecificOutput) || {};
  return { codigo: r.status, crudo: salida, contexto: h.additionalContext || '', evento: h.hookEventName || '' };
}
// Cada caso usa una sesion distinta, o el tope de «una vez por sesion» se comeria a los siguientes.
const sesion = () => 'banco-' + (++n);

let malos = 0, total = 0;
const chequear = (nombre, condicion, detalle) => {
  total++;
  console.log(`${condicion ? 'OK  ' : 'FALLA'} ${nombre}${detalle ? `  → ${detalle}` : ''}`);
  if (!condicion) malos++;
};

console.log('== EL PISO: hubo sesión de verdad ==');
{
  const t = transcripcion('corta.jsonl', [], 500);
  const r = correr({ transcript_path: t, session_id: sesion() });
  chequear('sesión por debajo del piso → mudo', !r.contexto, r.crudo.slice(0, 60));
}
{
  const t = transcripcion('larga.jsonl', []);
  const r = correr({ transcript_path: t, session_id: sesion() });
  chequear('sesión larga sin nada asentado → avisa', !!r.contexto, r.contexto.slice(0, 70));
  chequear('  …y el evento de salida es Stop', r.evento === 'Stop', r.evento || '(vacío)');
}

console.log('\n== SIN ASENTAR (archivos): un .md de la casa de un subsistema ==');
{
  const t = transcripcion('escribio-registro.jsonl', [
    { name: 'Write', input: { file_path: path.join(REPO, '.claude', 'decisiones', 'INDICE.md') } }]);
  const r = correr({ transcript_path: t, session_id: sesion() });
  chequear('escribió un registro → calla', !r.contexto);
}
{
  // Rutas de Windows: en el .jsonl vienen con barras invertidas. Un control que no las normalice
  // cuenta cero y contesta en verde sin frenar nada.
  const t = transcripcion('ruta-windows.jsonl', [
    { name: 'Edit', input: { file_path: 'D:\\Proyectos\\Repo\\.claude\\conocimiento\\una-pagina.md' } }]);
  const r = correr({ transcript_path: t, session_id: sesion() });
  chequear('ruta con barras invertidas → la reconoce y calla', !r.contexto, r.contexto.slice(0, 50));
}
{
  // ⚠️ El caso que el criterio grueso perdia: 16 escrituras de maquinaria y ningun registro tocado.
  const t = transcripcion('solo-maquinaria.jsonl', Array.from({ length: 16 }, () => (
    { name: 'Write', input: { file_path: path.join(REPO, '.claude', 'conducta', 'lint-conducta', 'lint-conducta.js') } })));
  const r = correr({ transcript_path: t, session_id: sesion() });
  chequear('16 escrituras de .js en una casa → igual avisa (un lint no es asentar)', !!r.contexto);
}
{
  const t = transcripcion('borrador.jsonl', [
    { name: 'Write', input: { file_path: path.join(REPO, '.claude', 'tmp', 'handoff-algo.md') } }]);
  const r = correr({ transcript_path: t, session_id: sesion() });
  chequear('un .md en tmp/ → avisa (los borradores no son asentar)', !!r.contexto);
}
{
  const t = transcripcion('fuera-de-casa.jsonl', [
    { name: 'Write', input: { file_path: path.join(REPO, 'README.md') } }]);
  const r = correr({ transcript_path: t, session_id: sesion() });
  chequear('un .md fuera de toda casa → avisa', !!r.contexto);
}
{
  // Codex manda el parche entero en `command` y puede tocar varias rutas de una.
  const t = transcripcion('apply-patch.jsonl', [
    { name: 'apply_patch', input: { command: '*** Begin Patch\n*** Update File: .claude/decisiones/INDICE.md\n*** End Patch' } }]);
  const r = correr({ transcript_path: t, session_id: sesion() });
  chequear('apply_patch sobre un registro → calla', !r.contexto);
}

console.log('\n== SIN ASENTAR (consola): las ediciones que no pasan por Write/Edit ==');
{
  const t = transcripcion('consola-escribe.jsonl', [
    { name: 'Bash', input: { command: "sed -i 's/a/b/' .claude/conocimiento/INDICE.md" } }]);
  const r = correr({ transcript_path: t, session_id: sesion() });
  chequear('sed -i sobre un registro → calla', !r.contexto);
}
{
  const t = transcripcion('consola-redirige.jsonl', [
    { name: 'Bash', input: { command: 'cat plantilla.txt > .claude/decisiones/INDICE.md' } }]);
  const r = correr({ transcript_path: t, session_id: sesion() });
  chequear('redirección sobre un registro → calla', !r.contexto);
}
{
  // Leer no es asentar. Si contara, el aviso se apagaria en toda sesion que abra un registro.
  const t = transcripcion('consola-lee.jsonl', [
    { name: 'Bash', input: { command: 'cat .claude/decisiones/INDICE.md' } }]);
  const r = correr({ transcript_path: t, session_id: sesion() });
  chequear('leer un registro por consola → igual avisa', !!r.contexto);
}

console.log('\n== SIN ASENTAR (habilidades): las altas ==');
for (const [nombre, calla] of [
  ['amp-decisiones:registrar-decision', true],
  ['registrar-conocimiento', true],
  ['amp-semantica:converger-terminologia', true],
  ['amp-subsistemas:agregar-subsistema', true],
  ['amp:planificar', false],
  ['amp-planes:crear-plan', false],
]) {
  const t = transcripcion('skill-' + nombre.replace(/[^a-z0-9]/gi, '-') + '.jsonl', [
    { name: 'Skill', input: { skill: nombre } }]);
  const r = correr({ transcript_path: t, session_id: sesion() });
  chequear(`skill ${nombre} → ${calla ? 'calla' : 'avisa'}`, calla ? !r.contexto : !!r.contexto);
}

console.log('\n== LAS DOS GUARDAS ==');
{
  const t = transcripcion('bucle.jsonl', []);
  const r = correr({ transcript_path: t, session_id: sesion(), stop_hook_active: true });
  chequear('stop_hook_active → mudo (sin esto el agente no puede cerrar)', !r.contexto, r.crudo.slice(0, 60));
}
{
  const t = transcripcion('dos-veces.jsonl', []);
  const s = sesion();
  const primera = correr({ transcript_path: t, session_id: s });
  const segunda = correr({ transcript_path: t, session_id: s });
  chequear('primer cierre de la sesión → avisa', !!primera.contexto);
  chequear('segundo cierre de la MISMA sesión → mudo (una vez por sesión)', !segunda.contexto);
}
{
  const t = transcripcion('otra-sesion.jsonl', []);
  const r = correr({ transcript_path: t, session_id: sesion() });
  chequear('otra sesión sobre la misma transcripción → vuelve a avisar', !!r.contexto);
}

console.log('\n== NUNCA ROMPE EL TURNO ==');
for (const [nombre, entrada] of [
  ['entrada vacía', ''],
  ['JSON inválido', '{esto no es json'],
  ['objeto sin transcript_path', '{}'],
  ['transcripción inexistente', JSON.stringify({ transcript_path: path.join(REPO, 'no-existe.jsonl'), session_id: 'x' })],
]) {
  const r = correr(entrada);
  chequear(`${nombre} → sale 0 sin emitir`, r.codigo === 0 && !r.contexto, `código ${r.codigo}`);
}
{
  // Una linea rota en el medio no puede tapar lo que viene despues.
  const p = path.join(REPO, 'linea-rota.jsonl');
  const buena = JSON.stringify({ type: 'assistant', message: { role: 'assistant', content: [
    { type: 'tool_use', name: 'Write', input: { file_path: path.join(REPO, '.claude', 'decisiones', 'INDICE.md') } }] } });
  let texto = '{roto\n' + buena + '\n';
  while (texto.length < PISO + 2000) texto += RELLENO + '\n';
  fs.writeFileSync(p, texto, 'utf8');
  const r = correr({ transcript_path: p, session_id: sesion() });
  chequear('línea rota antes del dato → la saltea y sigue leyendo', !r.contexto && r.codigo === 0);
}

console.log(`\ncasos: ${total}`);
console.log(malos ? `${malos} FALLARON.` : 'TODO VERDE.');
try { fs.rmSync(REPO, { recursive: true, force: true }); } catch { /* el escenario es descartable */ }
process.exit(malos ? 1 : 0);
