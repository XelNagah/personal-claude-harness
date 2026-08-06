#!/usr/bin/env node
// Control del momento `cada turno` del subsistema conducta: mide el transcript de la sesion como
// aproximacion del contexto acumulado y, pasado un umbral, emite un aviso proponiendo un punto de
// corte (persistir + handoff + /clear). NUNCA emite deny: es clase `Bloquear` porque esa es la clase
// que ejecuta un programa y combina su additionalContext con las reglas del momento, no porque frene.
//
// Por que existe: el problema medido nunca fue la sesion abierta sino la sesion abierta con contexto
// gordo — cada turno re-lee todo el contexto, y volver de una pausa lo re-escribe entero. La
// disciplina que este aviso empuja es: tarea terminada -> persistir + handoff + /clear, con la
// terminal siempre abierta y en escucha.
//
// Estimacion PROVISORIA a calibrar: tokens ~ bytes del transcript / 4. El JSONL tiene sobrecarga
// propia (metadatos por linea), asi que dividir por 4 sobreestima y avisa temprano — el lado seguro.
// Calibrar contra una sesion real cuando haya un numero medido, y ajustar BYTES_POR_TOKEN.
//
// Re-aviso por escalones: avisa al cruzar el umbral y de nuevo cada PASO tokens estimados, no en
// cada turno. La marca vive en `.claude/tmp/avisar-contexto-pesado/<session_id>.txt` (NO en
// `.claude/tmp/avisos/`, que es el Buzon de Avisos Generales y el repartidor lo vacia).
//
// Lo invoca el hook repartidor `establecer-conducta` como Contenido de una regla clase `Bloquear`.
// No es una Herramienta (no va al registro de Herramientas): es infra del subsistema, co-ubicada.
//
// Entrada: el JSON del hook por stdin (transcript_path, session_id).
// Uso a mano: echo {"transcript_path":"...","session_id":"x"} | node avisar-contexto-pesado.js --umbral 150000
const fs = require('fs'), path = require('path');
const repoRoot = path.resolve(__dirname, '..', '..', '..');   // .../conducta/avisar-contexto-pesado -> repo

const args = process.argv.slice(2);
function flag(nombre, def) {
  const i = args.indexOf(nombre);
  const v = i >= 0 ? Number(args[i + 1]) : NaN;
  return Number.isFinite(v) && v > 0 ? v : def;
}
const UMBRAL = flag('--umbral', 150000);   // tokens estimados a partir de los cuales se avisa
const PASO = flag('--paso', 50000);        // cada cuantos tokens estimados mas se repite el aviso
const BYTES_POR_TOKEN = 4;                 // PROVISORIO: calibrar contra una sesion medida
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
    const tokens = Math.round(bytes / BYTES_POR_TOKEN);
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

    const texto = `Aviso de contexto pesado (subsistema conducta): esta sesión ronda ~${Math.round(tokens / 1000)}k tokens estimados (umbral ${Math.round(UMBRAL / 1000)}k). En el próximo punto de corte natural, proponé cerrar limpio: persistir lo pendiente, handoff si hace falta (Preferencia Base-0014) y \`/clear\` — la terminal queda abierta y en escucha.`;
    process.stdout.write(JSON.stringify({ hookSpecificOutput: {
      hookEventName: 'UserPromptSubmit', additionalContext: texto } }));
    process.exit(0);
  } catch (e) { process.exit(0); }   // nunca romper el turno
});
process.stdin.on('error', () => process.exit(0));
