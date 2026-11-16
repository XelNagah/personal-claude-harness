#!/usr/bin/env node
// Control del momento `al cerrar tarea` del subsistema conducta: mira la transcripcion de la sesion
// y decide SI vale la pena avisar que quedo algo sin asentar. No redacta el aviso de fondo — ese
// texto es el de la regla `Inyectar` del momento, que vive en el registro y lo edita el usuario sin
// tocar codigo. Aca solo se decide callar o hablar, y se aporta el dato medido.
//
// POR QUE DECIDE Y NO AVISA: en `Stop`, hablar CUESTA UNA VUELTA COMPLETA DEL MODELO. No
// existe dejar una nota y que el turno igual cierre: las dos formas de hablarle al modelo
// —`decision: block` con `reason` y `hookSpecificOutput.additionalContext`— continuan la conversacion
// (verificado contra la documentacion oficial el 22/08/2026). Por eso en este momento CALLAR ES EL
// DEFAULT y el texto fijo de la regla sale solo si este control lo habilita: un aviso incondicional
// dejaria al agente sin poder cerrar, y Claude Code corta recien a las 8 continuaciones seguidas.
//
// LA SENAL (plan `Avisar al cerrar una tarea que hay algo para asentar`). Avisa por uno de dos
// motivos, nunca los dos, y una sola vez por sesion:
//
//   A. SESION SIN ASENTAR — se cumplen las TRES:
//      1. Piso        — lo que ESCRIBIERON el usuario y el agente paso de un corte. Mide si hubo
//                       conversacion de verdad.
//      2. Sin asentar — ninguna escritura cayo en un `.md` de la casa de un subsistema.
//      3. Sin asentar — no se invoco ninguna habilidad de alta (`registrar-*`,
//                       `converger-terminologia`, `agregar-subsistema`).
//   B. ALTA A MANO POR CONSOLA — un comando de consola dio de alta una fila con Codigo nuevo en un
//      Indice de Subsistema y en la sesion no se invoco ninguna habilidad de esa casa. Solo la
//      consola: el alta hecha con la herramienta de edicion ya la aviso `avisar-alta-a-mano` en el
//      momento `al escribir`, y este aviso cuenta SOLO LO QUE AQUEL NO VIO (respuesta #4 = C del
//      usuario, 15/11/2026). El criterio de «alta a mano» vive en `../altas-a-mano.js`.
//
// EL PISO MIDE LA CONVERSACION, NO EL ARCHIVO (respuesta #1 = B, 15/11/2026). Antes media el tamano
// del `.jsonl`, y ese archivo arranca con lo que el CLI escribe al iniciar —instrucciones, lista de
// habilidades, herramientas, avisos de hooks—: medido el 14/11/2026, 659 KB antes de la primera
// respuesta. Con el piso de 200 KB el aviso salia SIEMPRE en el primer cierre, aunque no hubiera
// pasado nada. Ahora suma solo el texto que escribio el usuario (sus mensajes, incluidos los que
// encolo mientras el agente trabajaba) y el texto que le contesto el agente. Quedan fuera las
// instrucciones, los adjuntos, los resultados y las entradas de herramientas, el pensamiento del
// modelo, los comandos locales (`/clear`, `!comando`) y los avisos de tareas en segundo plano.
// Se mide desde el ultimo `/clear`: lo de antes ya no esta en el contexto del agente y no lo puede
// evaluar.
//
// EL PISO NO CUENTA ESCRITURAS. Contar archivos escritos deja fuera POR CONSTRUCCION el caso mas
// importante: una conversacion larga donde se entendio algo y no se toco un solo archivo. Las
// escrituras participan SOLO DEL LADO DE CALLARSE: escribir un registro es prueba de que ya se asento.
//
// EL CORTE ES PROVISORIO, a calibrar con el uso: se fijo el 16/11/2026 midiendo las transcripciones
// reales de la maquina (ver el README). El riesgo se acomoda a proposito del lado seguro: un aviso de
// mas cuesta un turno; uno de menos pierde el conocimiento y hay que volver a averiguarlo.
//
// CONSULTAS ENTRE AGENTES: si el agente corre como consultado por otro (`comunicar.js` lo lanza con
// `AMP_CONSULTA_ENTRE_AGENTES=1`), el control sale mudo. Ahi no hay nadie del otro lado para asentar
// nada, y continuar la conversacion le cambia la respuesta que el que pregunto se lleva (respuesta
// #5 = C, 15/11/2026: la marca la pone `comunicar.js`, este control la respeta).
//
// Lo invoca el hook repartidor `establecer-conducta` como Contenido de una regla clase `Controlar`.
// NUNCA emite deny: es esa clase porque es la que ejecuta un programa y combina su additionalContext
// con las reglas del momento, no porque frene nada.
// No es una Herramienta (no va al registro de Herramientas): es infra del subsistema, co-ubicada.
//
// Entrada: el JSON del hook por stdin (transcript_path, session_id, stop_hook_active).
// Uso a mano: echo {"transcript_path":"...","session_id":"x"} | node avisar-sesion-sin-asentar.js --piso 15000
const fs = require('fs'), path = require('path');
const { spawnSync } = require('child_process');
const altas = require('../altas-a-mano.js');
const repoRoot = path.resolve(__dirname, '..', '..', '..');   // .../conducta/avisar-sesion-sin-asentar -> repo

const PISO_POR_DEFECTO = 15000;   // PROVISORIO: bytes de texto escrito por el usuario y el agente
const DIR_MARCAS = path.join(repoRoot, '.claude', 'tmp', 'avisar-sesion-sin-asentar');
const VARIABLE_DE_CONSULTA = 'AMP_CONSULTA_ENTRE_AGENTES';

function pisoDe(args) {
  const i = args.indexOf('--piso');
  const v = i >= 0 ? Number(args[i + 1]) : NaN;
  return Number.isFinite(v) && v > 0 ? v : PISO_POR_DEFECTO;
}

// -- el tramo vigente: desde el ultimo /clear ----------------------------
// `/clear` vacia el contexto pero deja la misma transcripcion (verificado el 14/11/2026: un solo
// `sessionId` y el comando adentro). Lo anterior ya no lo ve el agente.
const ES_CLEAR = /<command-name>\/clear<\/command-name>/;
function tramoVigente(objs) {
  let desde = 0;
  objs.forEach((o, i) => {
    const c = o && o.type === 'user' && o.message && o.message.content;
    if (typeof c === 'string' && ES_CLEAR.test(c)) desde = i + 1;
  });
  return objs.slice(desde);
}

// -- cuanto escribieron el usuario y el agente ---------------------------
// Texto que NO escribio nadie aunque viaje como mensaje del usuario: comandos locales y su salida,
// avisos de tareas en segundo plano, recordatorios del sistema y lo que corre el usuario con `!`.
const NO_ES_DEL_USUARIO = /^\s*<(?:command-|local-command-|task-notification|system-reminder|bash-|user-memory-input)/;
const bytes = s => Buffer.byteLength(String(s), 'utf8');

function bytesDeConversacion(objs) {
  let total = 0;
  for (const o of objs) {
    if (!o || o.isSidechain || o.isMeta || o.isCompactSummary) continue;
    // Lo que el usuario encolo mientras el agente trabajaba no reaparece como mensaje: se cuenta aca.
    if (o.attachment && o.attachment.type === 'queued_command') {
      const p = o.attachment.prompt;
      if (typeof p === 'string' && !NO_ES_DEL_USUARIO.test(p)) total += bytes(p);
      continue;
    }
    const c = o.message && o.message.content;
    if (o.type === 'user') {
      if (typeof c === 'string') { if (!NO_ES_DEL_USUARIO.test(c)) total += bytes(c); continue; }
      if (Array.isArray(c)) for (const it of c) {
        if (it && it.type === 'text' && !NO_ES_DEL_USUARIO.test(it.text || '')) total += bytes(it.text || '');
      }
    } else if (o.type === 'assistant' && Array.isArray(c)) {
      for (const it of c) if (it && it.type === 'text') total += bytes(it.text || '');
    }
  }
  return total;
}

// -- que ruta cuenta como asentar ----------------------------------------
// Un `.md` bajo la casa de un subsistema, a cualquier profundidad (las paginas de conocimiento viven
// en subcarpetas). ⚠️ Un `.js` bajo la casa NO cuenta: un lint o un banco de pruebas es maquinaria.
// Medido: contandolos, la sesion de 16 escrituras y ningun registro tocado NO disparaba.
function esRegistroDeSubsistema(ruta, casas) {
  if (!ruta || !/\.md$/i.test(String(ruta))) return false;
  return !!altas.casaDe(ruta, casas);
}

// -- escrituras hechas desde la consola ----------------------------------
// En modo automatico el agente edita con `sed`, heredocs y redirecciones, y esas NO pasan por
// `Write`/`Edit`. Se exige que el comando mencione la ruta de un registro Y traiga alguna marca de
// escritura, para que un `cat` de lectura no cuente como asentar.
const MARCA_DE_ESCRITURA = /(?:^|[^>])>>?(?:[^>]|$)|\btee\b|\bsed\s+-i\b|\bmv\b|\bcp\b|\bapply_patch\b/;
function rutasDeParche(cmd) {
  return [...String(cmd).matchAll(/^\*\*\*\s+(?:Add|Update|Delete) File:\s*(.+)$/gm)].map(m => m[1].trim());
}
const RUTA_MD_SUELTA = new RegExp('[^\\s"\'`|;()]*\\.md\\b', 'g');
function rutasMdSueltas(cmd) {
  return [...String(cmd).matchAll(RUTA_MD_SUELTA)].map(m => m[0]);
}

// Las habilidades cuya invocacion prueba que ya se asento. `registrar-*` cubre las altas de los
// subsistemas que las tienen.
const ES_ALTA = /^(?:registrar-[a-z-]+|converger-terminologia|agregar-subsistema)$/;
const TOOLS_DE_ESCRITURA = new Set(['write', 'edit', 'multiedit', 'notebookedit', 'apply_patch']);
const TOOLS_DE_CONSOLA = new Set(['bash', 'powershell', 'shell']);

// -- el Indice tal como estaba en el ultimo commit ------------------------
// Para saber si un Codigo escrito por consola es NUEVO hay que saber que tenia el Indice antes, y la
// transcripcion no lo dice. Se le pregunta a git por la version confirmada. Solo corre cuando hay un
// candidato, que es raro. Sin git, o con el Indice sin versionar, no hay con que comparar y no se
// avisa: corregir una fila vieja no debe avisar, y sin el antes no se las puede distinguir.
function codigosConfirmados(abs) {
  try {
    const r = spawnSync('git', ['-C', path.dirname(abs), 'show', 'HEAD:./' + path.basename(abs)],
      { encoding: 'utf8', timeout: 5000, windowsHide: true });
    if (r.error || r.status !== 0) return null;
    return altas.codigosDeFilas(r.stdout);
  } catch (e) { return null; }
}

// Las altas a mano hechas por consola en un comando. Devuelve [{ casa, archivo, codigos }].
function altasPorConsola(cmd, cwd, casas, invocadas, porCasa) {
  const halladas = [];
  const codigosCmd = altas.codigosEnComando(cmd);
  if (!codigosCmd.size) return halladas;
  for (const rel of rutasMdSueltas(cmd)) {
    const casa = altas.casaDe(rel, casas);
    if (!casa || altas.invocoHabilidadDeLaCasa(casa, invocadas, porCasa)) continue;
    const abs = path.resolve(cwd || repoRoot, rel.replace(/^["']|["']$/g, ''));
    let actual; try { actual = fs.readFileSync(abs, 'utf8'); } catch (e) { continue; }
    if (!altas.esIndice(actual)) continue;
    const enDisco = altas.codigosDeFilas(actual);
    const antes = codigosConfirmados(abs);
    if (!antes) continue;
    const nuevos = [...codigosCmd].filter(c => enDisco.has(c) && !antes.has(c));
    if (nuevos.length) halladas.push({ casa, archivo: path.basename(abs), codigos: nuevos });
  }
  return halladas;
}

// -- recorrer la transcripcion -------------------------------------------
// Se PARSEA cada linea como JSON en vez de buscar con expresiones regulares sobre el texto crudo: en
// el `.jsonl` las rutas de Windows vienen doble-escapadas, y un patron que espere una sola barra
// invertida NO matchea y NO FALLA. Medido: 1 a 6 ms sobre transcripciones de 8 KB a 1,6 MB.
// Devuelve { asento: '' | 'skill' | 'escritura' | 'consola', altasConsola: [...] }.
function examinar(objs, casas, porCasa) {
  // Las habilidades cuentan invocadas por la herramienta `Skill` o tipeadas por el usuario.
  const invocadas = altas.habilidadesInvocadas(objs);
  let asento = [...invocadas].some(h => ES_ALTA.test(h)) ? 'skill' : '';
  const altasConsola = [];
  for (const o of objs) {
    const contenido = o && o.message && o.message.content;
    if (!Array.isArray(contenido)) continue;
    for (const item of contenido) {
      if (!item || item.type !== 'tool_use') continue;
      const nombre = String(item.name || '').toLowerCase();
      const input = item.input || {};
      if (TOOLS_DE_ESCRITURA.has(nombre)) {
        if (esRegistroDeSubsistema(input.file_path, casas)) asento = asento || 'escritura';
        for (const r of rutasDeParche(input.command || '')) {
          if (esRegistroDeSubsistema(r, casas)) asento = asento || 'escritura';
        }
        continue;
      }
      if (TOOLS_DE_CONSOLA.has(nombre) && typeof input.command === 'string') {
        if (!MARCA_DE_ESCRITURA.test(input.command)) continue;
        if (!rutasMdSueltas(input.command).some(r => esRegistroDeSubsistema(r, casas))) continue;
        asento = asento || 'consola';
        altasConsola.push(...altasPorConsola(input.command, o.cwd, casas, invocadas, porCasa));
      }
    }
  }
  return { asento, altasConsola };
}

function textoSinAsentar(conversacion) {
  return 'Señal de sesión sin asentar (subsistema conducta): en esta sesión el usuario y el agente '
    + 'escribieron unos ' + Math.round(conversacion / 1000) + ' KB de conversación, y no se escribió '
    + 'ningún registro de subsistema ni se invocó ninguna habilidad de alta. Se avisa una sola vez por sesión.';
}

function textoAltaPorConsola(halladas) {
  const lista = halladas.map(h => `${h.codigos.join(', ')} en ${h.casa}/${h.archivo}`).join('; ');
  return 'Alta hecha a mano por consola (subsistema conducta): un comando de consola dio de alta '
    + lista + ', y en la sesión no se invocó ninguna habilidad de ese subsistema. La habilidad de alta '
    + 'controla duplicados, contradicciones con lo asentado y el lint; revisá esa fila con ella o '
    + 'decile al usuario por qué no hizo falta. Se avisa una sola vez por sesión.';
}

// Decide. Devuelve el texto a emitir, o '' para callar. Separado de la lectura de stdin para que el
// banco y las mediciones lo usen sin arrancar un proceso.
function decidir(data, opciones = {}) {
  const env = opciones.env || process.env;
  const piso = opciones.piso || PISO_POR_DEFECTO;
  if (env[VARIABLE_DE_CONSULTA] === '1') return '';
  // La guarda contra el bucle vive TAMBIEN en el repartidor; se repite aca a proposito.
  if (data.stop_hook_active) return '';
  if (!data.transcript_path) return '';

  // Sin ninguna casa de subsistema no hay donde asentar ni con que juzgar.
  const casas = altas.casasDeSubsistema(repoRoot);
  if (!casas.length) return '';

  const objs = altas.leerTranscripcion(data.transcript_path);
  if (!objs) return '';                              // transcripcion ilegible: no se inventa nada
  const tramo = tramoVigente(objs);

  const { asento, altasConsola } = examinar(tramo, casas, altas.habilidadesPorCasa(repoRoot));
  if (altasConsola.length) return textoAltaPorConsola(altasConsola);
  if (asento) return '';                             // ya se asento: el aviso sobra
  const conversacion = bytesDeConversacion(tramo);
  if (conversacion < piso) return '';                // conversacion corta: no hubo de que aprender
  return textoSinAsentar(conversacion);
}

function correrComoHook() {
  let input = '';
  process.stdin.on('data', c => { input += c; });
  process.stdin.on('end', () => {
    try {
      let data = {};
      try { data = JSON.parse(input || '{}'); } catch (e) { data = {}; }
      const texto = decidir(data, { piso: pisoDe(process.argv.slice(2)) });
      if (!texto) return process.exit(0);

      // Una vez por sesion. La marca se escribe SOLO al emitir, para que el tope cuente avisos y no
      // chequeos. Si escribirla falla, el aviso se repite — molesta, no se pierde.
      const sesion = String(data.session_id || 'sin-sesion').replace(/[^A-Za-z0-9_-]/g, '_');
      const marca = path.join(DIR_MARCAS, sesion + '.txt');
      if (fs.existsSync(marca)) return process.exit(0);
      try { fs.mkdirSync(DIR_MARCAS, { recursive: true }); fs.writeFileSync(marca, texto); } catch (e) {}
      // Limpieza de marcas viejas (mejor esfuerzo): tmp/ es descartable pero no se vacia solo.
      try {
        const limite = Date.now() - 7 * 24 * 60 * 60 * 1000;
        for (const n of fs.readdirSync(DIR_MARCAS)) {
          const p = path.join(DIR_MARCAS, n);
          try { if (fs.statSync(p).mtimeMs < limite) fs.unlinkSync(p); } catch (e) { /* otra vez sera */ }
        }
      } catch (e) { /* sin limpieza no pasa nada */ }

      process.stdout.write(JSON.stringify({ hookSpecificOutput: {
        hookEventName: 'Stop', additionalContext: texto } }));
      process.exit(0);
    } catch (e) { process.exit(0); }   // nunca romper el turno
  });
  process.stdin.on('error', () => process.exit(0));
}

module.exports = { decidir, bytesDeConversacion, tramoVigente, examinar, PISO_POR_DEFECTO, VARIABLE_DE_CONSULTA };
if (require.main === module) correrComoHook();
