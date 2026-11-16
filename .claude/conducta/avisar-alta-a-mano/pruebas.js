#!/usr/bin/env node
// Pruebas del control `avisar-alta-a-mano`.
//
// Lo que protege: que el aviso salga en el alta hecha a mano y SOLO ahí. Si se pasa de hablador
// —avisa al corregir una fila vieja, o al alta que hizo la habilidad misma— el agente aprende a
// ignorarlo. Si se pasa de callado, el 43 % de altas a mano medido sigue igual y nadie se entera.
//
// EL BANCO FABRICA SU REPO, por el mismo motivo que el de `avisar-sesion-sin-asentar`: el control
// resuelve su repo desde su propia ubicación, y las casas del escenario son de mentira a propósito.
//
// Uso: node .claude/conducta/avisar-alta-a-mano/pruebas.js   (desde la raíz del repo)
const fs = require('fs'), path = require('path'), os = require('os');
const { spawnSync } = require('child_process');

const CLAUDE_ORIGEN = path.resolve(__dirname, '..', '..');
const REPO = fs.mkdtempSync(path.join(os.tmpdir(), 'banco-alta-a-mano-'));
fs.mkdirSync(path.join(REPO, '.git'));   // la raíz del repo, contra la que se miden los borradores
for (const rel of ['conducta/avisar-alta-a-mano/avisar-alta-a-mano.js', 'conducta/altas-a-mano.js',
  'conducta/alcance-al-escribir.js', 'common/frontmatter.js', 'common/indices.js']) {
  fs.mkdirSync(path.dirname(path.join(REPO, '.claude', rel)), { recursive: true });
  fs.copyFileSync(path.join(CLAUDE_ORIGEN, rel), path.join(REPO, '.claude', rel));
}
const CONTROL = path.join(REPO, '.claude', 'conducta', 'avisar-alta-a-mano', 'avisar-alta-a-mano.js');

for (const casa of ['conducta', 'decisiones', 'conocimiento', 'subsistemas']) {
  fs.mkdirSync(path.join(REPO, '.claude', casa), { recursive: true });
  fs.writeFileSync(path.join(REPO, '.claude', casa, 'MANIFIESTO.md'), '# ' + casa + '\n');
}
fs.writeFileSync(path.join(REPO, '.claude', 'subsistemas', 'SUBSISTEMAS.md'), [
  '---', 'indice: Subsistemas', 'origen: agente-multiproposito',
  'columnas: [Código, Nombre, Descripción, Operación, Detalle]', '---', '',
  '| Código | Nombre | Descripción | Operación | Detalle |', '|---|---|---|---|---|',
  '| Base-0001 | decisiones | Decisiones | `registrar-decision` | [d](../decisiones/) |',
  '| Base-0002 | conocimiento | Lo que se sabe | `registrar-conocimiento`, `buscar-conocimiento` | [c](../conocimiento/) |', ''].join('\n'));
const INDICE = path.join(REPO, '.claude', 'decisiones', 'INDICE.md');
const fila = c => `| ${c} | entrada de prueba |`;
const TEXTO_INDICE = ['---', 'indice: Decisiones', 'origen: agente-desplegado', 'columnas: [Código, Nombre]', '---', '',
  '| Código | Nombre |', '|---|---|', fila('Local-0001'), fila('Local-0002'), ''].join('\n');
fs.writeFileSync(INDICE, TEXTO_INDICE);
const PAGINA = path.join(REPO, '.claude', 'decisiones', 'detalle.md');
fs.writeFileSync(PAGINA, '# Detalle\n\n| Código | Algo |\n|---|---|\n');

const transcripcion = (nombre, habilidades) => {
  const p = path.join(REPO, nombre);
  fs.writeFileSync(p, habilidades.map(h => JSON.stringify({ type: 'assistant',
    message: { role: 'assistant', content: [{ type: 'tool_use', name: 'Skill', input: { skill: h } }] } })).join('\n') + '\n');
  return p;
};
const SIN_HABILIDAD = transcripcion('sin.jsonl', []);

function correr(datos) {
  const r = spawnSync(process.execPath, [CONTROL], {
    input: typeof datos === 'string' ? datos : JSON.stringify(datos), encoding: 'utf8', timeout: 30000, cwd: REPO });
  let json = null;
  try { json = r.stdout.trim() ? JSON.parse(r.stdout) : null; } catch { /* no JSON */ }
  const h = (json && json.hookSpecificOutput) || {};
  return { codigo: r.status, crudo: (r.stdout || '').trim(), contexto: h.additionalContext || '',
           evento: h.hookEventName || '', deny: h.permissionDecision === 'deny' };
}
const editar = (old_string, new_string, transcript_path = SIN_HABILIDAD, file_path = INDICE) =>
  correr({ hook_event_name: 'PreToolUse', tool_name: 'Edit', transcript_path, tool_input: { file_path, old_string, new_string } });

let malos = 0, total = 0;
const chequear = (nombre, condicion, detalle) => {
  total++;
  console.log(`${condicion ? 'OK  ' : 'FALLA'} ${nombre}${detalle ? `  → ${detalle}` : ''}`);
  if (!condicion) malos++;
};

console.log('== LAS DOS PISTAS JUNTAS: código nuevo y ninguna habilidad del subsistema ==');
{
  const r = editar(fila('Local-0002'), fila('Local-0002') + '\n' + fila('Local-0003'));
  chequear('Edit que agrega Local-0003 sin habilidad → avisa', /Local-0003/.test(r.contexto), r.contexto.slice(0, 60));
  chequear('  …nombra la habilidad que corresponde', /registrar-decision/.test(r.contexto));
  chequear('  …sale por PreToolUse y NO frena', r.evento === 'PreToolUse' && !r.deny);
}
{
  const r = correr({ tool_name: 'Write', transcript_path: SIN_HABILIDAD,
    tool_input: { file_path: INDICE, content: TEXTO_INDICE + fila('Local-0004') + '\n' } });
  chequear('Write del Índice entero con una fila nueva → avisa', /Local-0004/.test(r.contexto));
}
{
  const r = correr({ tool_name: 'apply_patch', transcript_path: SIN_HABILIDAD, tool_input: { command:
    '*** Begin Patch\n*** Update File: .claude/decisiones/INDICE.md\n@@\n ' + fila('Local-0002') + '\n+' + fila('Local-0005') + '\n*** End Patch' } });
  chequear('apply_patch (Codex) que agrega una fila → avisa', /Local-0005/.test(r.contexto));
}
{
  const r = editar('x', fila('Local-0006'), SIN_HABILIDAD, 'D:\\Otro\\Repo\\.claude\\decisiones\\INDICE.md');
  // El archivo no existe: el antes es vacío y el texto nuevo no declara Índice → no se puede juzgar.
  chequear('Índice inexistente y fragmento sin frontmatter → calla', !r.contexto);
}

console.log('\n== LO QUE NO ES UN ALTA A MANO ==');
{
  const r = editar(fila('Local-0002'), '| Local-0002 | corregida |');
  chequear('corregir una fila vieja → calla', !r.contexto, r.contexto.slice(0, 50));
}
{
  const r = editar(fila('Local-0001') + '\n' + fila('Local-0002'), fila('Local-0002') + '\n' + fila('Local-0001'));
  chequear('reordenar filas que ya estaban → calla', !r.contexto);
}
{
  const t = transcripcion('con-habilidad.jsonl', ['amp-decisiones:registrar-decision']);
  const r = editar(fila('Local-0002'), fila('Local-0002') + '\n' + fila('Local-0003'), t);
  chequear('con la habilidad del subsistema invocada en la sesión → calla', !r.contexto);
}
{
  const t = transcripcion('otra-habilidad.jsonl', ['amp-conocimiento:registrar-conocimiento']);
  const r = editar(fila('Local-0002'), fila('Local-0002') + '\n' + fila('Local-0003'), t);
  chequear('con la habilidad de OTRO subsistema → igual avisa', /Local-0003/.test(r.contexto));
}
{
  const r = correr({ tool_name: 'Edit', transcript_path: SIN_HABILIDAD,
    tool_input: { file_path: PAGINA, old_string: '|---|---|\n', new_string: '|---|---|\n| Local-0009 | algo |\n' } });
  chequear('una página que no declara Índice → calla', !r.contexto);
}
{
  const borrador = path.join(REPO, '.claude', 'tmp', 'decisiones', 'INDICE.md');
  fs.mkdirSync(path.dirname(borrador), { recursive: true });
  fs.writeFileSync(borrador, TEXTO_INDICE);
  const r = editar(fila('Local-0002'), fila('Local-0002') + '\n' + fila('Local-0003'), SIN_HABILIDAD, borrador);
  chequear('un Índice copiado en tmp/ → calla (borrador)', !r.contexto);
}
{
  const r = correr({ tool_name: 'Edit', transcript_path: SIN_HABILIDAD,
    tool_input: { file_path: path.join(REPO, 'README.md'), old_string: 'a', new_string: fila('Local-0007') } });
  chequear('un .md fuera de toda casa → calla', !r.contexto);
}

console.log('\n== NUNCA ROMPE LA ESCRITURA ==');
for (const [nombre, entrada] of [['entrada vacía', ''], ['JSON inválido', '{no'], ['sin tool_input', '{"tool_name":"Edit"}']]) {
  const r = correr(entrada);
  chequear(`${nombre} → sale 0 sin emitir`, r.codigo === 0 && !r.crudo, `código ${r.codigo}`);
}
{
  const r = editar(fila('Local-0002'), fila('Local-0002') + '\n' + fila('Local-0003'), path.join(REPO, 'no-existe.jsonl'));
  chequear('transcripción ilegible → avisa igual (ninguna habilidad a la vista)', /Local-0003/.test(r.contexto) && r.codigo === 0);
}

console.log(`\ncasos: ${total}`);
console.log(malos ? `${malos} FALLARON.` : 'TODO VERDE.');
try { fs.rmSync(REPO, { recursive: true, force: true }); } catch { /* descartable */ }
process.exit(malos ? 1 : 0);
