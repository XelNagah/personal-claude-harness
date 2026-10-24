#!/usr/bin/env node
// Pruebas del control `avisar-contexto-pesado`.
//
// Por que existen: un control sin prueba no avisa cuando deja de controlar (conocimiento
// `controles-que-no-avisan`). La verificacion del plan que lo creo es literal: "el aviso aparece
// pasado el umbral y no antes — si aparece siempre o nunca, falla". Eso es exactamente el caso
// bueno y el caso malo de este banco.
//
// Los transcripts de prueba se fabrican en `.claude/tmp/pruebas-avisar-contexto/` (borrados al
// final) y el umbral se baja por flag, para no fabricar archivos de megabytes. Hay de dos clases:
// de prueba con `message.usage` —la medida real, que manda— y de relleno sin usage, que ejercitan
// el respaldo bytes/4.
//
// Uso:  node .claude/conducta/avisar-contexto-pesado/pruebas.js
// Sale con codigo 1 si alguna prueba falla, para que `ejecutar-pruebas` lo detecte.
const fs = require('fs'), path = require('path');
const { execFileSync } = require('child_process');

const CONTROL = path.join(__dirname, 'avisar-contexto-pesado.js');
const REPO = path.resolve(__dirname, '..', '..', '..');
const DIR_PRUEBAS = path.join(REPO, '.claude', 'tmp', 'pruebas-avisar-contexto');
const DIR_MARCAS = path.join(REPO, '.claude', 'tmp', 'avisar-contexto-pesado');

// Umbral de prueba: 1000 tokens = 4000 bytes en el respaldo (BYTES_POR_TOKEN=4). PASO igual de chico.
const UMBRAL = 1000, PASO = 500;
const corrida = Date.now();   // ids de sesion unicos por corrida, para no chocar con marcas previas

function transcriptDe(bytes) {
  fs.mkdirSync(DIR_PRUEBAS, { recursive: true });
  const ruta = path.join(DIR_PRUEBAS, `transcript-${bytes}.jsonl`);
  fs.writeFileSync(ruta, 'x'.repeat(bytes));
  return ruta;
}

// Una transcripcion de prueba: una linea por elemento de `turnos`, cada una un mensaje del asistente
// con su usage (`{ contexto, sidechain }`), mas `relleno` bytes de lineas sin usage al final —lo que
// en una sesion real son los registros de la API y los avisos de los hooks—.
let nTranscript = 0;
function transcriptConUsage(turnos, relleno = 0) {
  fs.mkdirSync(DIR_PRUEBAS, { recursive: true });
  const ruta = path.join(DIR_PRUEBAS, `usage-${++nTranscript}.jsonl`);
  const lineas = [JSON.stringify({ type: 'user', message: { role: 'user', content: 'hola' } })];
  for (const t of turnos) {
    // El contexto repartido en las tres cifras, para que una suma incompleta no pase.
    const leido = Math.floor(t.contexto / 2), creado = Math.floor(t.contexto / 4);
    lineas.push(JSON.stringify({ type: 'assistant', isSidechain: !!t.sidechain, message: { role: 'assistant',
      usage: { input_tokens: t.contexto - leido - creado, cache_read_input_tokens: leido,
        cache_creation_input_tokens: creado, output_tokens: 50 } } }));
  }
  let texto = lineas.join('\n') + '\n';
  const linea = JSON.stringify({ type: 'attachment', texto: 'x'.repeat(200) }) + '\n';
  while (relleno > 0) { texto += linea; relleno -= linea.length; }
  fs.writeFileSync(ruta, texto);
  return ruta;
}

function correr({ bytes, turnos, relleno, sesion, sinTranscript = false, rutaRota = false }) {
  const entrada = { session_id: sesion };
  if (rutaRota) entrada.transcript_path = path.join(DIR_PRUEBAS, 'no-existe.jsonl');
  else if (turnos) entrada.transcript_path = transcriptConUsage(turnos, relleno);
  else if (!sinTranscript) entrada.transcript_path = transcriptDe(bytes);
  const salida = execFileSync(process.execPath,
    [CONTROL, '--umbral', String(UMBRAL), '--paso', String(PASO)],
    { input: JSON.stringify(entrada), encoding: 'utf8' });
  if (!salida.trim()) return { veredicto: 'nada', texto: '' };
  const h = JSON.parse(salida).hookSpecificOutput || {};
  if (h.permissionDecision) return { veredicto: 'frena', texto: h.permissionDecisionReason || '' };
  if (h.additionalContext) return { veredicto: 'avisa', texto: h.additionalContext };
  return { veredicto: 'nada', texto: salida };
}

// -- los casos ----------------------------------------------------------------
// Cada caso corre en secuencia sobre la MISMA sesion cuando prueba las marcas: el segundo turno
// bajo el mismo escalon tiene que callarse, y el escalon siguiente tiene que volver a avisar.
const s1 = `prueba-${corrida}-a`, s2 = `prueba-${corrida}-b`, s3 = `prueba-${corrida}-c`;
const s4 = `prueba-${corrida}-d`, s5 = `prueba-${corrida}-e`, s6 = `prueba-${corrida}-f`;
const s7 = `prueba-${corrida}-g`, s8 = `prueba-${corrida}-h`, s9 = `prueba-${corrida}-i`;
const SESIONES = [s1, s2, s3, s4, s5, s6, s7, s8, s9];
const CASOS = [
  // -- con usage: la medida que da la API manda sobre el tamaño del archivo --
  { nombre: 'con usage bajo el umbral no avisa aunque el archivo pese 10 veces el umbral (el defecto medido)',
    entrada: { turnos: [{ contexto: UMBRAL - 100 }], relleno: UMBRAL * 4 * 10, sesion: s4 }, espera: 'nada' },
  { nombre: 'con usage pasado el umbral avisa, sin decir que estima',
    entrada: { turnos: [{ contexto: UMBRAL + 100 }], sesion: s5 }, espera: 'avisa',
    contiene: '~1k tokens de contexto (umbral', noContiene: 'estimados' },
  { nombre: 'manda el último usage: tras una compactación que bajó el contexto, no avisa',
    entrada: { turnos: [{ contexto: UMBRAL * 3 }, { contexto: UMBRAL - 100 }], sesion: s6 }, espera: 'nada' },
  { nombre: 'el usage de un subagente no cuenta como contexto de la sesión',
    entrada: { turnos: [{ contexto: UMBRAL - 100 }, { contexto: UMBRAL * 3, sidechain: true }], sesion: s7 }, espera: 'nada' },
  { nombre: 'el usage se encuentra con relleno detrás, aunque el archivo no entre entero en la lectura del final',
    entrada: { turnos: [{ contexto: UMBRAL * 3 }, { contexto: UMBRAL - 100 }], relleno: 300 * 1024, sesion: s8 }, espera: 'nada' },
  // -- sin usage: queda el respaldo bytes/4 --
  { nombre: 'sin usage, el respaldo avisa y dice que el número es estimado',
    entrada: { bytes: (UMBRAL + 100) * 4, sesion: s9 }, espera: 'avisa', contiene: 'estimados por el tamaño del archivo' },
  { nombre: 'bajo el umbral no avisa (si avisa siempre, no controla)',
    entrada: { bytes: (UMBRAL - 100) * 4, sesion: s1 }, espera: 'nada' },
  { nombre: 'pasado el umbral avisa',
    entrada: { bytes: (UMBRAL + 100) * 4, sesion: s1 }, espera: 'avisa', contiene: 'contexto pesado' },
  { nombre: 'el aviso menciona el /clear que propone',
    entrada: { bytes: (UMBRAL + 100) * 4, sesion: s2 }, espera: 'avisa', contiene: '/clear' },
  { nombre: 'mismo escalon, segundo turno: se calla (la marca funciona)',
    entrada: { bytes: (UMBRAL + 150) * 4, sesion: s1 }, espera: 'nada' },
  { nombre: 'escalon siguiente: vuelve a avisar',
    entrada: { bytes: (UMBRAL + PASO + 100) * 4, sesion: s1 }, espera: 'avisa', contiene: 'contexto pesado' },
  { nombre: 'nunca frena: el veredicto es aviso, no deny',
    entrada: { bytes: (UMBRAL * 10) * 4, sesion: s3 }, espera: 'avisa' },
  { nombre: 'sin transcript_path no hace nada',
    entrada: { sinTranscript: true, sesion: s3 }, espera: 'nada' },
  { nombre: 'transcript inexistente no hace nada (ni revienta)',
    entrada: { rutaRota: true, sesion: s3 }, espera: 'nada' },
];

// -- correr ------------------------------------------------------------------
console.log(`== PRUEBAS avisar-contexto-pesado ==\ncasos: ${CASOS.length}\n`);
let fallas = 0;
for (const c of CASOS) {
  let got;
  try { got = correr(c.entrada); }
  catch (e) { console.log(`  FALLA  ${c.nombre}\n         reventó: ${e.message.split('\n')[0]}`); fallas++; continue; }

  if (got.veredicto !== c.espera) {
    console.log(`  FALLA  ${c.nombre}\n         esperaba "${c.espera}", dio "${got.veredicto}"${got.texto ? ` — ${got.texto.split('\n')[0]}` : ''}`);
    fallas++; continue;
  }
  if (c.contiene && !got.texto.includes(c.contiene)) {
    console.log(`  FALLA  ${c.nombre}\n         veredicto correcto pero el texto no menciona "${c.contiene}"`);
    fallas++; continue;
  }
  if (c.noContiene && got.texto.includes(c.noContiene)) {
    console.log(`  FALLA  ${c.nombre}\n         veredicto correcto pero el texto menciona "${c.noContiene}"`);
    fallas++; continue;
  }
  console.log(`  OK     ${c.nombre}`);
}

// -- limpieza: los transcripts fabricados y las marcas de estas sesiones -------
try { fs.rmSync(DIR_PRUEBAS, { recursive: true, force: true }); } catch (e) {}
for (const s of SESIONES) {
  try { fs.unlinkSync(path.join(DIR_MARCAS, s + '.txt')); } catch (e) {}
}

console.log(fallas ? `\n${fallas} de ${CASOS.length} FALLARON.` : `\nTODO VERDE (${CASOS.length} casos).`);
process.exit(fallas ? 1 : 0);
