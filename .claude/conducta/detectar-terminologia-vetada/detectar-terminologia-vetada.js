#!/usr/bin/env node
// Control del momento `al escribir` del subsistema conducta: chequea el contenido que se esta por
// escribir contra el registro de relaciones vetadas (../../semantica/TERMINOLOGIA-FARLOPA.md) ANTES
// de que el archivo exista, y responde segun la columna Control de cada termino:
//
//   bloquea -> permissionDecision 'deny' + motivo (la palabra esta mal siempre: `levelear`)
//   avisa   -> additionalContext con los terminos hallados (la palabra puede ser legitima segun el
//              significado: `capa de configuracion` es valido, `la segunda capa del proceso` no)
//
// El bloqueo mira solo las apariciones FUERA de comillas simples invertidas y de bloques de codigo:
// citar un termino para hablar de el (esta tabla, la Base de preferencias, un plan que documenta el
// barrido) nunca se frena; se frena usarlo. Sin esa distincion el control volveria inescribibles a
// los propios archivos que documentan el veto.
//
// Lo invoca el hook repartidor `establecer-conducta` como Contenido de una regla clase `bloquear`.
// No es una Herramienta (no va al registro de Herramientas): es infra del subsistema, co-ubicada.
//
// Entrada: el JSON del hook por stdin. Se leen tool_name y tool_input, en las dos formas:
//   Claude Code -> Write: {content, file_path} | Edit: {new_string, file_path}
//   Codex       -> apply_patch: {command} (el texto del parche, con las rutas adentro)
// Salida: JSON de hook por stdout, o nada si no aplica. Nunca rompe el turno (siempre exit 0).
//
// Uso a mano (probar):
//   echo {"tool_name":"Write","tool_input":{"file_path":"README.md","content":"hay mucho churn"}} | node detectar-terminologia-vetada.js
const fs = require('fs'), path = require('path');
const registro = path.resolve(__dirname, '..', '..', 'semantica', 'TERMINOLOGIA-FARLOPA.md');

// Subsistema exento: el registro de vetados contiene los vetados por definicion.
const EXENTOS = [/(^|\/)\.claude\/semantica\//];

// -- registro: [{variantes:[...], comoDecirlo, control}] -----------------
function leerRegistro() {
  if (!fs.existsSync(registro)) return [];
  const out = [];
  const lineas = fs.readFileSync(registro, 'utf8').split('\n').map(l => l.trim()).filter(l => l.startsWith('|'));
  let cols = null;
  for (const l of lineas) {
    const celdas = l.split('|').slice(1, -1).map(c => c.trim());
    const norm = celdas.map(c => c.toLowerCase().replace(/\*/g, ''));
    if (!cols) {
      if (norm.includes('término') && norm.includes('cómo decirlo')) {
        cols = { termino: norm.indexOf('término'), como: norm.indexOf('cómo decirlo'), control: norm.indexOf('control') };
      }
      continue;
    }
    if (/^:?-{2,}:?$/.test(celdas[0].replace(/\s/g, ''))) continue;
    // las variantes del termino vienen entre comillas simples invertidas, separadas por /
    const variantes = (celdas[cols.termino].match(/`([^`]+)`/g) || []).map(v => v.slice(1, -1).trim()).filter(Boolean);
    if (!variantes.length) continue;
    const control = (cols.control >= 0 && cols.control < celdas.length ? celdas[cols.control] : '').toLowerCase();
    out.push({ variantes, comoDecirlo: celdas[cols.como] || '', control: control === 'bloquea' ? 'bloquea' : 'avisa' });
  }
  return out;
}

// -- texto en el que se busca: sin bloques de codigo ni tramos citados ---
// Se reemplaza por espacios (no se borra) para no pegar palabras que estaban separadas.
function textoDesnudo(txt) {
  return txt
    .replace(/```[\s\S]*?```/g, m => ' '.repeat(m.length))     // bloques de codigo
    .replace(/`[^`\n]*`/g, m => ' '.repeat(m.length))          // tramos entre comillas simples invertidas
    .replace(/^\s{4,}\S.*$/gm, m => ' '.repeat(m.length));     // bloques indentados
}

// Limites de palabra propios: \b es ASCII y falla con acentos (`plomería`).
const LETRA = 'A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9_';
function apariciones(texto, termino) {
  const esc = termino.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
  const re = new RegExp(`(^|[^${LETRA}])(${esc})(?=[^${LETRA}]|$)`, 'gi');
  const lineas = texto.split('\n');
  const hits = [];
  for (let i = 0; i < lineas.length; i++) { re.lastIndex = 0; if (re.test(lineas[i])) hits.push(i + 1); }
  return hits;
}

// -- que se esta por escribir: contenido + rutas -------------------------
// Codex manda el parche entero en tool_input.command y puede tocar VARIAS rutas de una.
function loQueSeEscribe(data) {
  const ti = data.tool_input || {};
  const tool = data.tool_name || '';
  if (tool === 'apply_patch' || (!ti.file_path && typeof ti.command === 'string')) {
    const patch = ti.command || '';
    const rutas = [...patch.matchAll(/^\*\*\*\s+(?:Add|Update|Delete) File:\s*(.+)$/gm)].map(m => m[1].trim());
    const agregado = patch.split('\n').filter(l => l.startsWith('+')).map(l => l.slice(1)).join('\n');
    return { rutas, contenido: agregado };
  }
  const contenido = typeof ti.content === 'string' ? ti.content
                  : typeof ti.new_string === 'string' ? ti.new_string : '';
  return { rutas: ti.file_path ? [ti.file_path] : [], contenido };
}

let input = '';
process.stdin.on('data', c => { input += c; });
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input || '{}');
    const { rutas, contenido } = loQueSeEscribe(data);
    if (!contenido.trim()) return process.exit(0);

    const normal = rutas.map(r => r.replace(/\\/g, '/'));
    if (!normal.some(r => /\.md$/i.test(r))) return process.exit(0);            // solo .md
    if (normal.some(r => EXENTOS.some(re => re.test(r)))) return process.exit(0); // subsistema exento

    const desnudo = textoDesnudo(contenido);
    const bloquear = [], avisar = [];
    for (const fila of leerRegistro()) {
      for (const v of fila.variantes) {
        const hits = apariciones(desnudo, v);
        if (!hits.length) continue;
        const item = `\`${v}\` (${hits.length === 1 ? 'línea ' : 'líneas '}${hits.slice(0, 5).join(', ')}) → ${fila.comoDecirlo}`;
        (fila.control === 'bloquea' ? bloquear : avisar).push(item);
      }
    }

    if (bloquear.length) {
      const motivo = 'Escritura rechazada: terminología vetada sin uso legítimo posible.\n- '
        + bloquear.join('\n- ')
        + '\nCorregí el texto y volvé a escribir. El veto está en .claude/semantica/TERMINOLOGIA-FARLOPA.md.';
      process.stdout.write(JSON.stringify({
        hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: motivo }
      }));
      return process.exit(0);
    }
    if (avisar.length) {
      const texto = 'Términos vetados detectados en lo que acabás de escribir (pueden ser legítimos según el significado — juzgá cada uno):\n- '
        + avisar.join('\n- ');
      process.stdout.write(JSON.stringify({
        hookSpecificOutput: { hookEventName: 'PreToolUse', additionalContext: texto }
      }));
    }
  } catch (e) { /* nunca romper el turno */ }
  process.exit(0);
});
process.stdin.on('error', () => process.exit(0));
