#!/usr/bin/env node
// Control del momento `cada turno` del subsistema conducta: mide el contexto de la sesion que
// informa la propia API y, pasado un umbral, emite un aviso proponiendo un punto de
// corte (persistir + handoff + /clear). NUNCA emite deny: es clase `Controlar` porque esa es la clase
// que ejecuta un programa y combina su additionalContext con las reglas del momento, no porque frene.
//
// Por que existe: el problema medido nunca fue la sesion abierta sino la sesion abierta con contexto
// gordo — cada turno re-lee todo el contexto, y volver de una pausa lo re-escribe entero. La
// disciplina que este aviso recuerda es: tarea terminada -> persistir + handoff + /clear, con la
// terminal siempre abierta y en escucha.
//
// Como mide: la ultima linea `type: "assistant"` de la transcripcion que trae `message.usage` dice el
// contexto que leyo el modelo en ese turno: input_tokens + cache_read_input_tokens +
// cache_creation_input_tokens. Alcanza con leer el final del archivo (LECTURA_COLA bytes).
// NO se usa el tamaño del archivo: guarda mucho mas que lo que lee el modelo —registros de llamadas
// a la API y los avisos de los hooks repetidos en cada turno—. Medido: 2.048.112 bytes daban ~512k
// tokens por bytes/4 contra 144.118 reales; una sesion de 4 turnos estimaba 194k contra 91k reales.
// Solo si no aparece ningun usage (formato cambiado, sesion sin respuestas) queda bytes/4 de respaldo.
//
// Re-aviso por escalones: avisa al cruzar el umbral y de nuevo cada PASO tokens, no en
// cada turno. La marca vive en `.claude/tmp/avisar-contexto-pesado/<session_id>.txt` (NO en
// `.claude/tmp/avisos/`, que es el Buzon de Avisos Generales y el repartidor lo vacia).
//
// Lo invoca el hook repartidor `establecer-conducta` como Contenido de una regla clase `Controlar`.
// No es una Herramienta (no va al registro de Herramientas): es infra del subsistema, co-ubicada.
//
// Entrada: el JSON del hook por stdin (transcript_path, session_id).
// Uso a mano: echo {"transcript_path":"...","session_id":"x"} | node avisar-contexto-pesado.js --umbral 180000
const fs = require('fs'), path = require('path');
const repoRoot = path.resolve(__dirname, '..', '..', '..');   // .../conducta/avisar-contexto-pesado -> repo

const args = process.argv.slice(2);
function flag(nombre, def) {
  const i = args.indexOf(nombre);
  const v = i >= 0 ? Number(args[i + 1]) : NaN;
  return Number.isFinite(v) && v > 0 ? v : def;
}
const UMBRAL = flag('--umbral', 180000);   // tokens de contexto a partir de los cuales se avisa
const PASO = flag('--paso', 50000);        // cada cuantos tokens mas se repite el aviso
const LECTURA_COLA = 512 * 1024;           // bytes del final de la transcripcion donde se busca el usage
const BYTES_POR_TOKEN = 4;                 // solo el respaldo sin usage: sobreestima ~3,5 veces

// El contexto del ultimo turno segun la API, o null si el final del archivo no trae ningun usage.
// Las lineas de subagentes (isSidechain) no cuentan: su contexto no es el de esta sesion.
function contextoMedido(ruta, bytes) {
  const fd = fs.openSync(ruta, 'r');
  let texto;
  try {
    const largo = Math.min(bytes, LECTURA_COLA);
    const buf = Buffer.alloc(largo);
    fs.readSync(fd, buf, 0, largo, bytes - largo);
    texto = buf.toString('utf8');
  } finally { fs.closeSync(fd); }
  const lineas = texto.split('\n');
  if (bytes > LECTURA_COLA) lineas.shift();   // la primera quedo cortada a la mitad
  for (let i = lineas.length - 1; i >= 0; i--) {
    if (!lineas[i].includes('"usage"')) continue;
    let o; try { o = JSON.parse(lineas[i]); } catch (e) { continue; }
    if (!o || o.type !== 'assistant' || o.isSidechain || !o.message || !o.message.usage) continue;
    const u = o.message.usage;
    return (Number(u.input_tokens) || 0) + (Number(u.cache_read_input_tokens) || 0)
      + (Number(u.cache_creation_input_tokens) || 0);
  }
  return null;
}
const DIR_MARCAS = path.join(repoRoot, '.claude', 'tmp', 'avisar-contexto-pesado');

let input = '';
process.stdin.on('data', c => { input += c; });
process.stdin.on('end', () => {
  try {
    let data = {};
    try { data = JSON.parse(input || '{}'); } catch (e) { data = {}; }
    if (!data.transcript_path) return process.exit(0);

    let bytes = 0;
    try { bytes = fs.statSync(data.transcript_path).size; } catch (e) { return process.exit(0); }
    let medido = null;
    try { medido = contextoMedido(data.transcript_path, bytes); } catch (e) { medido = null; }
    const tokens = medido !== null ? medido : Math.round(bytes / BYTES_POR_TOKEN);
    if (tokens < UMBRAL) return process.exit(0);

    // El escalon alcanzado: umbral, umbral+PASO, umbral+2*PASO... Se avisa una vez por escalon.
    const escalon = UMBRAL + Math.floor((tokens - UMBRAL) / PASO) * PASO;
    const sesion = String(data.session_id || 'sin-sesion').replace(/[^A-Za-z0-9_-]/g, '_');
    const marca = path.join(DIR_MARCAS, sesion + '.txt');
    let previo = 0;
    try { previo = Number(fs.readFileSync(marca, 'utf8').trim()) || 0; } catch (e) { previo = 0; }
    if (previo >= escalon) return process.exit(0);

    // Si escribir la marca falla, el aviso se repite en el turno siguiente — molesta, no se pierde.
    try { fs.mkdirSync(DIR_MARCAS, { recursive: true }); fs.writeFileSync(marca, String(escalon)); } catch (e) {}
    // Limpieza de marcas de sesiones viejas (mejor esfuerzo): tmp/ es descartable pero no crece solo.
    try {
      const limite = Date.now() - 7 * 24 * 60 * 60 * 1000;
      for (const n of fs.readdirSync(DIR_MARCAS)) {
        const p = path.join(DIR_MARCAS, n);
        try { if (fs.statSync(p).mtimeMs < limite) fs.unlinkSync(p); } catch (e) { /* queda para otra vez */ }
      }
    } catch (e) { /* sin limpieza no pasa nada */ }

    const texto = `Aviso de contexto pesado (subsistema conducta): esta sesión ronda ~${Math.round(tokens / 1000)}k tokens de contexto${medido !== null ? '' : ' (estimados por el tamaño del archivo)'} (umbral ${Math.round(UMBRAL / 1000)}k). En el próximo punto de corte natural, proponé cerrar limpio: persistir lo pendiente, handoff si hace falta (Preferencia Base-0014) y \`/clear\` — la terminal queda abierta y en escucha.`;
    process.stdout.write(JSON.stringify({ hookSpecificOutput: {
      hookEventName: 'UserPromptSubmit', additionalContext: texto } }));
    process.exit(0);
  } catch (e) { process.exit(0); }   // nunca romper el turno
});
process.stdin.on('error', () => process.exit(0));
