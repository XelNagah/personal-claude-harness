#!/usr/bin/env node
// Control del momento `al escribir` del subsistema conducta: avisa cuando una escritura da de alta
// una fila en un Índice de Subsistema sin pasar por la habilidad de ese subsistema.
//
// POR QUÉ EXISTE: medido sobre un mes de conversaciones (plan `Avisar al cerrar una tarea que hay
// algo para asentar`, sección del 13/11/2026), el 43 % de las altas en registros (34 de 79) se
// hicieron escribiendo la fila a mano. La habilidad de alta es la que controla duplicados,
// contradicciones con lo asentado y el lint; una fila escrita a mano se saltea las tres.
//
// AVISA Y NO FRENA (respuesta #2 = A del usuario, 15/11/2026; Decisiones `Local-0038` y
// `Local-0052`). El aviso llega junto al resultado de la escritura, con el archivo ya escrito.
//
// QUÉ ES UN ALTA A MANO (respuesta #3 = C): las dos pistas juntas — aparece una fila con un Código
// que el Índice no tenía, y en la sesión no se invocó ninguna habilidad de ese subsistema. Corregir
// una fila vieja no avisa. El criterio vive en `../altas-a-mano.js`, que comparte con el aviso de
// cierre: lo que este control no ve —las altas por consola, que no pasan por `Write`/`Edit`— lo
// avisa aquel al cerrar la tarea, y lo que este ya avisó aquel no lo repite (respuesta #4 = C).
//
// Lo invoca el hook repartidor `establecer-conducta` como Contenido de una regla clase `Controlar`
// del momento `al escribir`. NUNCA emite deny. No es una Herramienta: es infra del subsistema.
//
// Entrada: el JSON del hook por stdin (tool_name, tool_input, transcript_path).
// Salida: { hookSpecificOutput: { hookEventName: 'PreToolUse', additionalContext } } o nada.
const fs = require('fs'), path = require('path');
const altas = require('../altas-a-mano.js');
const repoRoot = path.resolve(__dirname, '..', '..', '..');   // .../conducta/avisar-alta-a-mano -> repo

// -- el Índice antes y después de la escritura ---------------------------
// Se arma el texto que va a quedar aplicando la edición sobre lo que hay en disco, en vez de mirar
// solo el fragmento nuevo: un `Edit` que mueve una fila de lugar trae el Código en `new_string` y
// sin embargo no es un alta.
function aplicarEdicion(antes, oldStr, newStr, todas) {
  if (typeof oldStr !== 'string' || typeof newStr !== 'string') return null;
  if (!oldStr) return newStr + antes;
  return todas ? antes.split(oldStr).join(newStr) : antes.replace(oldStr, () => newStr);
}

// Devuelve [{ ruta, antes, despues }] para cada archivo que toca la escritura.
function escrituras(tool, ti) {
  const salida = [];
  const leer = r => { try { return fs.readFileSync(r, 'utf8'); } catch (e) { return ''; } };
  if (!ti) return salida;
  if (tool === 'Write' && ti.file_path) {
    salida.push({ ruta: ti.file_path, antes: leer(ti.file_path), despues: String(ti.content || '') });
  } else if (tool === 'Edit' && ti.file_path) {
    const antes = leer(ti.file_path);
    const despues = aplicarEdicion(antes, ti.old_string, ti.new_string, ti.replace_all);
    if (despues !== null) salida.push({ ruta: ti.file_path, antes, despues });
  } else if (tool === 'MultiEdit' && ti.file_path && Array.isArray(ti.edits)) {
    const antes = leer(ti.file_path);
    let despues = antes;
    for (const e of ti.edits) {
      const x = aplicarEdicion(despues, e.old_string, e.new_string, e.replace_all);
      if (x !== null) despues = x;
    }
    salida.push({ ruta: ti.file_path, antes, despues });
  } else if (tool === 'apply_patch' && typeof ti.command === 'string') {
    // Codex: el parche trae varias rutas. Lo agregado son las líneas con `+`; el antes es el disco.
    let actual = null;
    for (const linea of ti.command.split(/\r?\n/)) {
      const m = /^\*\*\*\s+(?:Add|Update) File:\s*(.+)$/.exec(linea);
      if (m) {
        const ruta = path.resolve(repoRoot, m[1].trim());
        actual = { ruta, antes: leer(ruta), agregado: [] };
        salida.push(actual);
        continue;
      }
      if (/^\*\*\*/.test(linea)) { actual = null; continue; }
      if (actual && linea.startsWith('+')) actual.agregado.push(linea.slice(1));
    }
    for (const s of salida) s.despues = s.antes + '\n' + s.agregado.join('\n');
  }
  return salida;
}

function decidir(data) {
  const ti = data.tool_input;
  const tool = data.tool_name || '';
  const casas = altas.casasDeSubsistema(repoRoot);
  if (!casas.length) return '';

  const halladas = [];
  let objs = null, invocadas = null, porCasa = null;
  for (const e of escrituras(tool, ti)) {
    if (!/\.md$/i.test(String(e.ruta))) continue;
    const casa = altas.casaDe(e.ruta, casas);
    if (!casa) continue;
    if (!altas.esIndice(e.antes || e.despues)) continue;     // solo los Índices: una página no es un alta
    const antes = altas.codigosDeFilas(e.antes);
    const nuevos = [...altas.codigosDeFilas(e.despues)].filter(c => !antes.has(c));
    if (!nuevos.length) continue;                            // corregir una fila vieja no avisa
    // La transcripción se lee recién acá: la enorme mayoría de las escrituras no da de alta nada.
    if (objs === null) {
      objs = (data.transcript_path && altas.leerTranscripcion(data.transcript_path)) || [];
      invocadas = altas.habilidadesInvocadas(objs);
      porCasa = altas.habilidadesPorCasa(repoRoot);
    }
    if (altas.invocoHabilidadDeLaCasa(casa, invocadas, porCasa)) continue;
    const propias = [...(porCasa.get(casa) || [])];
    halladas.push({ casa, archivo: path.basename(String(e.ruta).replace(/\\/g, '/')), nuevos, propias });
  }
  if (!halladas.length) return '';
  const lineas = halladas.map(h => `- ${h.nuevos.join(', ')} en ${h.casa}/${h.archivo}`
    + (h.propias.length ? ` (habilidades de ese subsistema: ${h.propias.map(x => '`' + x + '`').join(', ')})` : ''));
  return 'Alta hecha a mano (subsistema conducta): esta escritura da de alta una fila nueva en un Índice '
    + 'sin que en la sesión se haya invocado ninguna habilidad de ese subsistema:\n' + lineas.join('\n')
    + '\nLa habilidad de alta controla duplicados, contradicciones con lo asentado y el lint. Si no hay '
    + 'un motivo para saltearla, revisá la fila con ella; si lo hay, decíselo al usuario.';
}

let input = '';
process.stdin.on('data', c => { input += c; });
process.stdin.on('end', () => {
  try {
    let data = {};
    try { data = JSON.parse(input || '{}'); } catch (e) { data = {}; }
    const texto = decidir(data);
    if (texto) process.stdout.write(JSON.stringify({ hookSpecificOutput: {
      hookEventName: 'PreToolUse', additionalContext: texto } }));
    process.exit(0);
  } catch (e) { process.exit(0); }   // nunca romper la escritura
});
process.stdin.on('error', () => process.exit(0));
