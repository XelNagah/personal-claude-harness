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
//      correr una COPIA suya en otro arbol, con los modulos que usa.
//   2. Escribiria sus marcas de sesion en el `.claude/tmp/` real, y una marca de mas apaga el aviso
//      verdadero de la sesion que este corriendo el banco.
// Las casas del escenario son de mentira a proposito: se prueba que el control reconozca UNA CASA,
// no las nueve de este repo (conocimiento `controles-que-no-avisan`, forma «escenario prestado»).
//
// Uso: node .claude/conducta/avisar-sesion-sin-asentar/pruebas.js   (desde la raíz del repo)
const fs = require('fs'), path = require('path'), os = require('os');
const { spawnSync } = require('child_process');

const CLAUDE_ORIGEN = path.resolve(__dirname, '..', '..');
const REPO = fs.mkdtempSync(path.join(os.tmpdir(), 'banco-sin-asentar-'));
const DIR_CONTROL = path.join(REPO, '.claude', 'conducta', 'avisar-sesion-sin-asentar');
fs.mkdirSync(DIR_CONTROL, { recursive: true });
fs.mkdirSync(path.join(REPO, '.claude', 'common'), { recursive: true });
// El control y los modulos que carga, en el mismo arbol relativo que en un repo instalado.
for (const rel of ['conducta/avisar-sesion-sin-asentar/avisar-sesion-sin-asentar.js', 'conducta/altas-a-mano.js',
  'conducta/alcance-al-escribir.js', 'common/frontmatter.js', 'common/indices.js']) {
  fs.copyFileSync(path.join(CLAUDE_ORIGEN, rel), path.join(REPO, '.claude', rel));
}
const CONTROL = path.join(DIR_CONTROL, 'avisar-sesion-sin-asentar.js');

// El escenario es un repo git: el aviso de altas por consola le pregunta a git que tenia el Indice
// antes, y los borradores se miden contra la raiz del repo.
const git = (...a) => spawnSync('git', ['-C', REPO, ...a], { encoding: 'utf8' });
git('init', '-q');
git('config', 'user.email', 'banco@ejemplo'); git('config', 'user.name', 'banco');
git('config', 'core.autocrlf', 'false');

// Tres casas de subsistema del escenario, mas el catalogo que dice que habilidades opera cada una.
for (const casa of ['conducta', 'decisiones', 'conocimiento', 'subsistemas']) {
  const d = path.join(REPO, '.claude', casa);
  fs.mkdirSync(d, { recursive: true });
  fs.writeFileSync(path.join(d, 'MANIFIESTO.md'), '# ' + casa + '\n');
}
fs.writeFileSync(path.join(REPO, '.claude', 'subsistemas', 'SUBSISTEMAS.md'), [
  '---', 'indice: Subsistemas', 'origen: agente-multiproposito',
  'columnas: [Código, Nombre, Descripción, Operación, Detalle]', '---', '',
  '| Código | Nombre | Descripción | Operación | Detalle |', '|---|---|---|---|---|',
  '| Base-0001 | decisiones | Decisiones | `registrar-decision` | [d](../decisiones/) |',
  '| Base-0002 | conocimiento | Lo que se sabe | `registrar-conocimiento`, `buscar-conocimiento` | [c](../conocimiento/) |', ''].join('\n'));
const INDICE_DECISIONES = path.join(REPO, '.claude', 'decisiones', 'INDICE.md');
const indiceDecisiones = codigos => ['---', 'indice: Decisiones', 'origen: agente-desplegado',
  'columnas: [Código, Nombre]', '---', '', '| Código | Nombre |', '|---|---|',
  ...codigos.map(c => `| ${c} | entrada de prueba |`), ''].join('\n');
fs.writeFileSync(INDICE_DECISIONES, indiceDecisiones(['Local-0001', 'Local-0002']));
git('add', '-A'); git('commit', '-qm', 'escenario');
// Un directorio de `.claude/` SIN manifiesto no es una casa: escribir ahi no cuenta como asentar.
fs.mkdirSync(path.join(REPO, '.claude', 'tmp'), { recursive: true });

// -- transcripciones sinteticas ------------------------------------------
const PISO = 5000;   // el banco usa un piso chico para no fabricar conversaciones de 15 KB
const linea = o => JSON.stringify(o);
const dijo = texto => linea({ type: 'user', message: { role: 'user', content: texto } });
const contesto = texto => linea({ type: 'assistant', message: { role: 'assistant', content: [{ type: 'text', text: texto }] } });
const RELLENO = dijo('texto que escribió el usuario, de relleno para llegar al piso');
const usoDe = u => linea({ type: 'assistant', cwd: REPO,
  message: { role: 'assistant', content: [{ type: 'tool_use', name: u.name, input: u.input }] } });

// Arma un `.jsonl` con los usos de herramienta que se le pasen y `bytes` de conversacion de relleno.
function transcripcion(nombre, usos, bytes = PISO + 2000, previas = []) {
  let texto = previas.join('\n') + (previas.length ? '\n' : '') + usos.map(usoDe).join('\n') + '\n';
  let conv = 0;
  while (conv < bytes) { texto += RELLENO + '\n'; conv += 60; }
  const p = path.join(REPO, nombre);
  fs.writeFileSync(p, texto, 'utf8');
  return p;
}

let n = 0;
function correr(datos, { extra = [], env = {} } = {}) {
  const entorno = Object.assign({}, process.env, env);
  delete entorno.AMP_CONSULTA_ENTRE_AGENTES;
  Object.assign(entorno, env);
  const r = spawnSync(process.execPath, [CONTROL, '--piso', String(PISO), ...extra], {
    input: typeof datos === 'string' ? datos : JSON.stringify(datos),
    encoding: 'utf8', timeout: 30000, cwd: REPO, env: entorno,
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

console.log('== EL PISO: hubo conversación de verdad ==');
{
  const t = transcripcion('corta.jsonl', [], 500);
  const r = correr({ transcript_path: t, session_id: sesion() });
  chequear('conversación por debajo del piso → mudo', !r.contexto, r.crudo.slice(0, 60));
}
{
  const t = transcripcion('larga.jsonl', []);
  const r = correr({ transcript_path: t, session_id: sesion() });
  chequear('sesión larga sin nada asentado → avisa', !!r.contexto, r.contexto.slice(0, 70));
  chequear('  …y el evento de salida es Stop', r.evento === 'Stop', r.evento || '(vacío)');
}
{
  // ⚠️ El defecto que motivó medir la conversación: el CLI escribe al arrancar cientos de KB de
  // instrucciones, listas de habilidades y avisos de hooks. Con el piso por tamaño de archivo el
  // aviso salía en el primer cierre de toda sesión. Acá el archivo pesa 200 KB y se dijo una frase.
  const pesado = [
    linea({ type: 'attachment', attachment: { type: 'instructions', content: 'x'.repeat(80000) } }),
    linea({ type: 'attachment', attachment: { type: 'skill_listing', content: 'y'.repeat(60000) } }),
    linea({ type: 'user', isMeta: true, message: { role: 'user', content: 'z'.repeat(20000) } }),
    linea({ type: 'user', message: { role: 'user', content: [{ type: 'tool_result', content: 'r'.repeat(30000) }] } }),
    linea({ type: 'assistant', message: { role: 'assistant', content: [{ type: 'thinking', thinking: 'p'.repeat(20000) }] } }),
    dijo('hola, ¿qué hay pendiente?'), contesto('Hay tres planes en curso.'),
  ];
  const t = transcripcion('recien-arrancada.jsonl', [], 0, pesado);
  const r = correr({ transcript_path: t, session_id: sesion() });
  chequear('recién arrancada: archivo de más de 200 KB y una frase → mudo',
    !r.contexto && fs.statSync(t).size > 200000, `${Math.round(fs.statSync(t).size / 1000)} KB de archivo`);
}
{
  // Los comandos locales, sus salidas y los avisos de tareas viajan como mensajes del usuario y no
  // los escribió nadie.
  const ajenos = [
    dijo('<local-command-stdout>' + 'o'.repeat(8000) + '</local-command-stdout>'),
    dijo('<task-notification>' + 'n'.repeat(8000) + '</task-notification>'),
  ];
  const t = transcripcion('ajenos.jsonl', [], 0, ajenos);
  const r = correr({ transcript_path: t, session_id: sesion() });
  chequear('salidas de comandos y avisos de tareas no cuentan como conversación → mudo', !r.contexto);
}
{
  // Lo que el usuario encola mientras el agente trabaja no reaparece como mensaje: tiene que contar.
  const encolado = [linea({ type: 'attachment', attachment: { type: 'queued_command', prompt: 'q'.repeat(PISO + 500) } })];
  const t = transcripcion('encolado.jsonl', [], 0, encolado);
  const r = correr({ transcript_path: t, session_id: sesion() });
  chequear('lo que el usuario encoló cuenta como conversación → avisa', !!r.contexto);
}
{
  // Lo anterior al último /clear ya no está en el contexto del agente.
  const antes = [dijo('a'.repeat(PISO + 1000)), dijo('<command-name>/clear</command-name>\n<command-message>clear</command-message>')];
  const t = transcripcion('clear.jsonl', [], 200, antes);
  const r = correr({ transcript_path: t, session_id: sesion() });
  chequear('conversación larga ANTES de /clear y corta después → mudo', !r.contexto);
}

console.log('\n== SIN ASENTAR (archivos): un .md de la casa de un subsistema ==');
{
  const t = transcripcion('escribio-registro.jsonl', [
    { name: 'Write', input: { file_path: path.join(REPO, '.claude', 'conocimiento', 'una-pagina.md') } }]);
  const r = correr({ transcript_path: t, session_id: sesion() });
  chequear('escribió un registro → calla', !r.contexto);
}
{
  const t = transcripcion('ruta-windows.jsonl', [
    { name: 'Edit', input: { file_path: 'D:\\Proyectos\\Repo\\.claude\\conocimiento\\una-pagina.md' } }]);
  const r = correr({ transcript_path: t, session_id: sesion() });
  chequear('ruta con barras invertidas → la reconoce y calla', !r.contexto, r.contexto.slice(0, 50));
}
{
  // Un worktree vive en `.claude/tmp/worktrees/<nombre>/`: su ruta lleva DOS `.claude/` y un `tmp/`.
  // Antes se tomaba el primero, caía en `tmp` y toda escritura en un worktree contaba como borrador.
  const t = transcripcion('worktree.jsonl', [
    { name: 'Edit', input: { file_path: path.join(REPO, '.claude', 'tmp', 'worktrees', 'copia', '.claude', 'conocimiento', 'pagina.md') } }]);
  fs.mkdirSync(path.join(REPO, '.claude', 'tmp', 'worktrees', 'copia'), { recursive: true });
  fs.writeFileSync(path.join(REPO, '.claude', 'tmp', 'worktrees', 'copia', '.git'), 'gitdir: x\n');
  const r = correr({ transcript_path: t, session_id: sesion() });
  chequear('escribió un registro dentro de un worktree → calla', !r.contexto, r.contexto.slice(0, 50));
}
{
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
  const t = transcripcion('apply-patch.jsonl', [
    { name: 'apply_patch', input: { command: '*** Begin Patch\n*** Update File: .claude/conocimiento/pagina.md\n*** End Patch' } }]);
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
    { name: 'Bash', input: { command: 'cat plantilla.txt > .claude/conocimiento/pagina.md' } }]);
  const r = correr({ transcript_path: t, session_id: sesion() });
  chequear('redirección sobre un registro → calla', !r.contexto);
}
{
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
{
  // El usuario puede tipear la habilidad como comando: no pasa por la herramienta Skill.
  const t = transcripcion('skill-tipeada.jsonl', [], PISO + 2000,
    [dijo('<command-name>/amp-decisiones:registrar-decision</command-name>\n<command-message>x</command-message>')]);
  const r = correr({ transcript_path: t, session_id: sesion() });
  chequear('habilidad de alta tipeada por el usuario → calla', !r.contexto);
}

console.log('\n== ALTA A MANO POR CONSOLA: lo que el momento «al escribir» no ve ==');
{
  // El comando agrega Local-0003, que el Indice confirmado no tenia, y no se invoco registrar-decision.
  fs.writeFileSync(INDICE_DECISIONES, indiceDecisiones(['Local-0001', 'Local-0002', 'Local-0003']));
  const t = transcripcion('alta-consola.jsonl', [
    { name: 'Bash', input: { command: "echo '| Local-0003 | entrada de prueba |' >> .claude/decisiones/INDICE.md" } }], 100);
  const r = correr({ transcript_path: t, session_id: sesion() });
  chequear('alta con código nuevo por consola, sin la habilidad → avisa aunque la sesión sea corta',
    /Alta hecha a mano por consola/.test(r.contexto) && /Local-0003/.test(r.contexto), r.contexto.slice(0, 70));
}
{
  const t = transcripcion('alta-consola-con-habilidad.jsonl', [
    { name: 'Skill', input: { skill: 'amp-decisiones:registrar-decision' } },
    { name: 'Bash', input: { command: "echo '| Local-0003 | entrada de prueba |' >> .claude/decisiones/INDICE.md" } }]);
  const r = correr({ transcript_path: t, session_id: sesion() });
  chequear('la misma alta con la habilidad del subsistema invocada → calla', !r.contexto, r.contexto.slice(0, 50));
}
{
  const t = transcripcion('alta-consola-otra-habilidad.jsonl', [
    { name: 'Skill', input: { skill: 'amp-conocimiento:registrar-conocimiento' } },
    { name: 'Bash', input: { command: "echo '| Local-0003 | entrada de prueba |' >> .claude/decisiones/INDICE.md" } }]);
  const r = correr({ transcript_path: t, session_id: sesion() });
  chequear('con la habilidad de OTRO subsistema → igual avisa el alta', /Alta hecha a mano/.test(r.contexto));
}
{
  // Corregir una fila vieja no es un alta: el codigo ya estaba en el Indice confirmado.
  const t = transcripcion('correccion-consola.jsonl', [
    { name: 'Bash', input: { command: "sed -i 's/| Local-0002 | entrada de prueba |/| Local-0002 | corregida |/' .claude/decisiones/INDICE.md" } }]);
  const r = correr({ transcript_path: t, session_id: sesion() });
  chequear('corregir por consola una fila que ya estaba → calla', !r.contexto, r.contexto.slice(0, 50));
}
{
  // El alta con la herramienta de edicion ya la avisó el momento «al escribir»: no se repite.
  const t = transcripcion('alta-edit.jsonl', [
    { name: 'Edit', input: { file_path: INDICE_DECISIONES, old_string: 'x', new_string: '| Local-0003 | entrada de prueba |' } }]);
  const r = correr({ transcript_path: t, session_id: sesion() });
  chequear('alta con la herramienta de edición → calla al cerrar (ya avisó al escribir)', !r.contexto);
}
fs.writeFileSync(INDICE_DECISIONES, indiceDecisiones(['Local-0001', 'Local-0002']));

console.log('\n== LAS GUARDAS ==');
{
  const t = transcripcion('bucle.jsonl', []);
  const r = correr({ transcript_path: t, session_id: sesion(), stop_hook_active: true });
  chequear('stop_hook_active → mudo (sin esto el agente no puede cerrar)', !r.contexto, r.crudo.slice(0, 60));
}
{
  const t = transcripcion('consulta.jsonl', []);
  const r = correr({ transcript_path: t, session_id: sesion() }, { env: { AMP_CONSULTA_ENTRE_AGENTES: '1' } });
  chequear('consultado por otro agente (AMP_CONSULTA_ENTRE_AGENTES=1) → mudo y sin bloquear',
    !r.contexto && r.codigo === 0 && !r.crudo, r.crudo.slice(0, 60));
  const s = sesion();
  correr({ transcript_path: t, session_id: s }, { env: { AMP_CONSULTA_ENTRE_AGENTES: '1' } });
  const despues = correr({ transcript_path: t, session_id: s });
  chequear('  …y no gasta la marca de la sesión', !!despues.contexto);
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
  const p = path.join(REPO, 'linea-rota.jsonl');
  const buena = usoDe({ name: 'Write', input: { file_path: path.join(REPO, '.claude', 'conocimiento', 'pagina.md') } });
  let texto = '{roto\n' + buena + '\n';
  for (let i = 0; i < 120; i++) texto += RELLENO + '\n';
  fs.writeFileSync(p, texto, 'utf8');
  const r = correr({ transcript_path: p, session_id: sesion() });
  chequear('línea rota antes del dato → la saltea y sigue leyendo', !r.contexto && r.codigo === 0);
}

console.log(`\ncasos: ${total}`);
console.log(malos ? `${malos} FALLARON.` : 'TODO VERDE.');
try { fs.rmSync(REPO, { recursive: true, force: true }); } catch { /* el escenario es descartable */ }
process.exit(malos ? 1 : 0);
