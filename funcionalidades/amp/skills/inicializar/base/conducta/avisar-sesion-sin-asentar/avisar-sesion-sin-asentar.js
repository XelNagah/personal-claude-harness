#!/usr/bin/env node
// Control del momento `al cerrar tarea` del subsistema conducta: mira la transcripcion de la sesion
// y decide SI vale la pena avisar que quedo algo sin asentar. No redacta el aviso — el texto es el
// de la regla `Inyectar` del momento, que vive en el registro y lo edita el usuario sin tocar codigo.
// Aca solo se decide callar o hablar, y se aporta el dato medido.
//
// POR QUE DECIDE Y NO AVISA: en `Stop`, hablar CUESTA UNA VUELTA COMPLETA DEL MODELO. No
// existe dejar una nota y que el turno igual cierre: las dos formas de hablarle al modelo
// —`decision: block` con `reason` y `hookSpecificOutput.additionalContext`— continuan la conversacion
// (verificado contra la documentacion oficial el 22/08/2026). Por eso en este momento CALLAR ES EL
// DEFAULT y el texto fijo de la regla sale solo si este control lo habilita: un aviso incondicional
// dejaria al agente sin poder cerrar, y Claude Code corta recien a las 8 continuaciones seguidas.
//
// LA SENAL, acordada con el usuario el 23/08/2026 (plan `Avisar al cerrar una tarea que hay algo
// para asentar`, seccion *La senal*). Avisa solo si se cumplen las TRES:
//
//   1. Piso        — la transcripcion paso de un corte de tamano. Mide si hubo sesion de verdad.
//   2. Sin asentar — ninguna escritura cayo en un `.md` de la casa de un subsistema.
//   3. Sin asentar — no se invoco ninguna habilidad de alta (`registrar-*`, `converger-terminologia`,
//                    `agregar-subsistema`).
//
// EL PISO NO CUENTA ESCRITURAS, y es lo que corrige a la decision que lo habia fijado asi. Contar
// archivos escritos deja fuera POR CONSTRUCCION el caso mas importante: una conversacion larga donde
// se entendio algo y no se toco un solo archivo. Ahi no queda nada escrito en ningun lado, que es la
// definicion del problema. Subestima ademas por otro lado —las ediciones por consola no pasan por
// `Write`/`Edit`— y «escrituras en .claude/» no viaja: un Agente Desplegado trabaja sobre su Producto.
// Las escrituras siguen participando, pero SOLO DEL LADO DE CALLARSE: escribir un registro es prueba
// de que ya se asento.
//
// EL CORTE DEL PISO ES PROVISORIO, a calibrar con el uso — misma situacion declarada que
// `BYTES_POR_TOKEN` en `avisar-contexto-pesado`. Se mide en BYTES de la transcripcion, no en tokens
// estimados, para no duplicar esa constante en dos archivos que despues divergen. El riesgo se
// acomoda a proposito del lado seguro: un aviso de mas cuesta un turno; uno de menos pierde el
// conocimiento y hay que volver a averiguarlo.
// ⚠️ Este repo es el peor banco para calibrarlo: aca escribir el Producto ES escribir subsistemas.
//
// Lo invoca el hook repartidor `establecer-conducta` como Contenido de una regla clase `Bloquear`.
// NUNCA emite deny: es esa clase porque es la que ejecuta un programa y combina su additionalContext
// con las reglas del momento, no porque frene nada.
// No es una Herramienta (no va al registro de Herramientas): es infra del subsistema, co-ubicada.
//
// Entrada: el JSON del hook por stdin (transcript_path, session_id, stop_hook_active).
// Uso a mano: echo {"transcript_path":"...","session_id":"x"} | node avisar-sesion-sin-asentar.js --piso 200000
const fs = require('fs'), path = require('path');
const repoRoot = path.resolve(__dirname, '..', '..', '..');   // .../conducta/avisar-sesion-sin-asentar -> repo

const args = process.argv.slice(2);
function flag(nombre, def) {
  const i = args.indexOf(nombre);
  const v = i >= 0 ? Number(args[i + 1]) : NaN;
  return Number.isFinite(v) && v > 0 ? v : def;
}
const PISO = flag('--piso', 200000);   // PROVISORIO: bytes de transcripcion desde los que se evalua
const DIR_MARCAS = path.join(repoRoot, '.claude', 'tmp', 'avisar-sesion-sin-asentar');

// -- las casas de subsistema, descubiertas por el Patron -----------------
// Una casa es un directorio de `.claude/` con su MANIFIESTO.md: eso ES un subsistema, y vale igual
// para los que suma el Proposito con `agregar-subsistema`. Se descubre asi y no leyendo el catalogo
// porque lo que interesa es la carpeta que existe en disco, no la fila que la declara: un catalogo
// desactualizado dejaria de reconocer una casa real y el control avisaria de mas.
function casasDeSubsistema() {
  const base = path.join(repoRoot, '.claude');
  let hijos = [];
  try { hijos = fs.readdirSync(base, { withFileTypes: true }); } catch (e) { return []; }
  return hijos.filter(d => d.isDirectory() && fs.existsSync(path.join(base, d.name, 'MANIFIESTO.md')))
              .map(d => d.name.toLowerCase());
}

// -- que ruta cuenta como asentar ----------------------------------------
// Un `.md` bajo la casa de un subsistema, a cualquier profundidad (las paginas de conocimiento viven
// en subcarpetas). El segmento se busca dentro de la ruta, sin anclarla al repo: asi funciona con la
// ruta absoluta de Windows que trae la transcripcion y con la relativa que aparece en un comando.
// ⚠️ Un `.js` bajo la casa NO cuenta: un lint o un banco de pruebas es maquinaria, no aprendizaje.
// Medido: contandolos, la sesion de 16 escrituras y ningun registro tocado NO disparaba, que era
// justo el caso a cazar.
function esRegistroDeSubsistema(ruta, casas) {
  if (!ruta) return false;
  const r = String(ruta).replace(/\\/g, '/').toLowerCase();
  if (!r.endsWith('.md')) return false;
  if (r.includes('/tmp/')) return false;             // borradores: `.claude/tmp/` es descartable
  const m = r.match(/(?:^|\/)\.claude\/([^/]+)\//);
  return !!(m && casas.includes(m[1]));
}

// -- las habilidades cuya invocacion prueba que ya se asento --------------
// El nombre llega calificado por su plugin (`amp-decisiones:registrar-decision`): se descarta lo que
// va antes de los dos puntos. `registrar-*` cubre las altas de los subsistemas que las tienen.
const ES_ALTA = /^(?:registrar-[a-z-]+|converger-terminologia|agregar-subsistema)$/;
function esHabilidadDeAlta(nombre) {
  if (!nombre) return false;
  const corto = String(nombre).toLowerCase().split(':').pop().trim();
  return ES_ALTA.test(corto);
}

// -- escrituras hechas desde la consola ----------------------------------
// En modo automatico el agente edita con `sed`, heredocs y redirecciones, y esas NO pasan por
// `Write`/`Edit`: contarlas solo por la tool subestima. Se exige que el comando mencione la ruta de
// un registro Y traiga alguna marca de escritura, para que un `cat` de lectura no cuente como asentar.
const MARCA_DE_ESCRITURA = /(?:^|[^>])>>?(?:[^>]|$)|\btee\b|\bsed\s+-i\b|\bmv\b|\bcp\b|\bapply_patch\b/;
// Rutas de la forma `*** Update File: <ruta>` que usa `apply_patch` (Codex): un parche puede tocar
// varias de una, asi que se juntan todas.
function rutasDeParche(cmd) {
  return [...String(cmd).matchAll(/^\*\*\*\s+(?:Add|Update|Delete) File:\s*(.+)$/gm)].map(m => m[1].trim());
}
// Cualquier cosa con pinta de ruta a un .md dentro de la linea de comando.
const RUTA_MD_SUELTA = new RegExp('[^\\s"\'`|;()]*\\.md\\b', 'g');
function rutasMdSueltas(cmd) {
  return [...String(cmd).matchAll(RUTA_MD_SUELTA)].map(m => m[0]);
}

// -- recorrer la transcripcion -------------------------------------------
// Se PARSEA cada linea como JSON en vez de buscar con expresiones regulares sobre el texto crudo: en
// el `.jsonl` las rutas de Windows vienen doble-escapadas (`D:\\Proyectos\\...`), y un patron que
// espere una sola barra invertida NO matchea y NO FALLA — cuenta cero y el control contesta en verde.
// Medido: escanear el `.jsonl` entero cuesta 1 a 6 ms sobre doce transcripciones reales de 8 KB a
// 1,6 MB, contra un presupuesto de 100 ms para un evento del camino critico.
const TOOLS_DE_ESCRITURA = new Set(['write', 'edit', 'multiedit', 'notebookedit', 'apply_patch']);
const TOOLS_DE_CONSOLA = new Set(['bash', 'powershell', 'shell']);

function yaAsento(rutaTranscripcion, casas) {
  let texto;
  try { texto = fs.readFileSync(rutaTranscripcion, 'utf8'); } catch (e) { return null; }
  for (const linea of texto.split('\n')) {
    if (!linea.trim()) continue;
    let obj = null;
    try { obj = JSON.parse(linea); } catch (e) { continue; }   // linea rota: se saltea, no rompe
    const contenido = obj && obj.message && obj.message.content;
    if (!Array.isArray(contenido)) continue;
    for (const item of contenido) {
      if (!item || item.type !== 'tool_use') continue;
      const nombre = String(item.name || '').toLowerCase();
      const input = item.input || {};
      // 1) habilidad de alta invocada
      if (nombre === 'skill' && esHabilidadDeAlta(input.skill || input.name)) return 'skill';
      // 2) escritura directa por tool
      if (TOOLS_DE_ESCRITURA.has(nombre)) {
        if (esRegistroDeSubsistema(input.file_path, casas)) return 'escritura';
        for (const r of rutasDeParche(input.command || '')) {
          if (esRegistroDeSubsistema(r, casas)) return 'escritura';
        }
      }
      // 3) escritura desde la consola
      if (TOOLS_DE_CONSOLA.has(nombre) && typeof input.command === 'string') {
        if (!MARCA_DE_ESCRITURA.test(input.command)) continue;
        for (const r of rutasMdSueltas(input.command)) {
          if (esRegistroDeSubsistema(r, casas)) return 'consola';
        }
      }
    }
  }
  return '';
}

let input = '';
process.stdin.on('data', c => { input += c; });
process.stdin.on('end', () => {
  try {
    let data = {};
    try { data = JSON.parse(input || '{}'); } catch (e) { data = {}; }

    // La guarda contra el bucle vive TAMBIEN en el repartidor, que es donde protege a todas las
    // reglas del momento. Se repite aca a proposito: lo que evita es una cadena de continuaciones
    // hasta el corte del CLI, y el costo de tenerla dos veces es cero frente al de que falte.
    if (data.stop_hook_active) return process.exit(0);
    if (!data.transcript_path) return process.exit(0);

    let bytes = 0;
    try { bytes = fs.statSync(data.transcript_path).size; } catch (e) { return process.exit(0); }
    if (bytes < PISO) return process.exit(0);          // sesion corta: no hubo de que aprender

    // Sin ninguna casa de subsistema en el repo no hay donde asentar, y el control no tiene con que
    // juzgar. Se calla, en vez de avisar sobre un repo que todavia no tiene subsistemas.
    const casas = casasDeSubsistema();
    if (!casas.length) return process.exit(0);

    const asento = yaAsento(data.transcript_path, casas);
    if (asento === null) return process.exit(0);       // transcripcion ilegible: no se inventa nada
    if (asento) return process.exit(0);                // ya se asento: el aviso sobra

    // Una vez por sesion. La marca se escribe SOLO al emitir, para que el tope cuente avisos y no
    // chequeos. Si escribirla falla, el aviso se repite — molesta, no se pierde.
    const sesion = String(data.session_id || 'sin-sesion').replace(/[^A-Za-z0-9_-]/g, '_');
    const marca = path.join(DIR_MARCAS, sesion + '.txt');
    if (fs.existsSync(marca)) return process.exit(0);
    try { fs.mkdirSync(DIR_MARCAS, { recursive: true }); fs.writeFileSync(marca, String(bytes)); } catch (e) {}
    // Limpieza de marcas viejas (mejor esfuerzo): tmp/ es descartable pero no se vacia solo.
    try {
      const limite = Date.now() - 7 * 24 * 60 * 60 * 1000;
      for (const n of fs.readdirSync(DIR_MARCAS)) {
        const p = path.join(DIR_MARCAS, n);
        try { if (fs.statSync(p).mtimeMs < limite) fs.unlinkSync(p); } catch (e) { /* queda para otra vez */ }
      }
    } catch (e) { /* sin limpieza no pasa nada */ }

    const texto = 'Señal de sesión sin asentar (subsistema conducta): la sesión ronda los '
      + Math.round(bytes / 1000) + ' KB de conversación y no escribió ningún registro de subsistema '
      + 'ni invocó ninguna habilidad de alta. Se avisa una sola vez por sesión.';
    process.stdout.write(JSON.stringify({ hookSpecificOutput: {
      hookEventName: 'Stop', additionalContext: texto } }));
    process.exit(0);
  } catch (e) { process.exit(0); }   // nunca romper el turno
});
process.stdin.on('error', () => process.exit(0));
