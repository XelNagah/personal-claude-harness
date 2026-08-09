#!/usr/bin/env node
// comunicar.js — mecanismo único del subsistema `comunicacion`: corre a un Agente Multipropósito
// Conocido en su propio directorio, con un mensaje como entrada, y devuelve su respuesta.
//
// Un Modo de Comunicación por habilidad (`amp-comunicacion:preguntar`, `amp-comunicacion:resolver`),
// que llaman a este mecanismo con el suyo. Hoy hay estos, y el usuario pidió los dos —preguntarle
// algo y pedirle que haga algo son cosas distintas, no alternativas—:
//   preguntar (predeterminado) — le pregunta. Conserva TODAS sus herramientas de lectura, incluidos
//                                sus servidores MCP, y le saca las de escribir archivos y ejecutar
//                                comandos. Es lo contrario del mecanismo viejo, que para impedir
//                                escribir le apagaba también los MCP y lo obligaba a contestar de
//                                memoria (ver `README.md`, «Por qué no `--permission-mode plan`»).
//   resolver                   — le pide que haga algo y lo deja actuar con sus propios permisos.
//
// El modo se llama `preguntar` y no `consultar` a propósito: `consultar` nombraba el acto entero
// —el mecanismo, la habilidad, el subsistema—, así que usarlo también para uno de sus modos
// hacía que la misma palabra fuera el todo y la parte.
//
// Qué modo corre no lo decide este mecanismo: lo decide cuál habilidad se invocó. Por eso son dos y
// no una con una regla escrita adentro — con qué permisos corre el consultado pasa a depender de la
// `description` que eligió la habilidad, que es gobernable y medible, en vez de un texto que hay
// que obedecer en el momento. Elegida la habilidad, no se vuelve a pedir permiso: pedirlo dos veces
// es gastar un turno del usuario.
//
// Uso: node comunicar.js <nombre> <mensaje> [--modo preguntar|resolver] [--modelo <alias>]
//                                           [--sesion <uuid>] [--tope <segundos>] [--crudo]
//
// Node pelado, sin dependencias externas (los scripts del Agente Multipropósito corren así).
const path = require('path');
const { randomUUID } = require('crypto');
const { spawnSync } = require('child_process');
const { CLIS_SOPORTADOS, leerIndice } = require('../indice.js');

const MODOS = ['preguntar', 'resolver'];

// Las herramientas que escriben y que NINGÚN Agente necesita para contestar una pregunta. Son
// genéricas: las trae todo agente, así que la lista no depende de a quién se consulte. Lo que este
// mecanismo NO hace es enumerar las herramientas propias del consultado —sus MCP—: solo él sabe
// cuáles tiene y cuáles escriben, y una copia de esa lista acá se desactualiza en silencio.
const ESCRITURA_GENERICA = 'Write,Edit,NotebookEdit,Bash';

// En una corrida no interactiva el Agente consultado NO puede preguntar: si frena a pedir una
// aclaración, gasta el turno entero (y su costo) sin contestar nada. El encabezado lo instruye a
// elegir y dejar la salvedad escrita. Va como preámbulo del mensaje, no como bandera, porque es
// una instrucción al Agente y no una capacidad del programa.
const PREAMBULO = [
  'Esta consulta corre sin nadie del otro lado: no podés preguntar nada.',
  'Si algo es ambiguo, elegí la interpretación más razonable, respondé, y dejá la salvedad escrita.',
  'No uses AskUserQuestion ni frenes a pedir aclaraciones.',
  '',
].join('\n');

// El comando por CLI y por modo. El mensaje NO va acá: se pasa por STDIN, y el directorio por el
// `cwd` del proceso, así ninguna parte que venga de datos toca la línea de comandos sin comillar
// —no hay superficie de inyección—.
//
// claude:
//   `-p`                       corrida no interactiva, lee el mensaje de stdin.
//   `--output-format json`     devuelve un objeto en vez de texto crudo: es lo único que hace
//                              OBSERVABLE la falla. Trae `.result`, `.session_id`, `.is_error`,
//                              `.total_cost_usd` y sobre todo `.permission_denials`. El mecanismo
//                              viejo leía stdout pelado y no podía detectar nada.
//   `--permission-mode dontAsk` (modo preguntar) deniega lo que no esté permitido en vez de colgarse
//                              esperando una confirmación que nadie va a dar, y lo deja anotado.
//   `--allowedTools mcp__*`    (modo preguntar) mantiene vivos los servidores MCP del consultado sin
//                              nombrar ninguno, incluso si su repo no los tiene pre-autorizados.
//   `--disallowedTools`        (modo preguntar) le saca las de escritura genéricas.
//   `--permission-mode auto`   (modo resolver) lo deja actuar. ⚠️ Medido: en este modo las listas
//                              de denegación NO se aplican, así que no se pasan (una lista que no
//                              frena es peor que ninguna, porque se confía en ella).
//
// codex:
//   `exec`                     corrida no interactiva.  `--json` el equivalente observable.
//   `--sandbox read-only`      (modo preguntar) impide toda escritura.
//   `--sandbox workspace-write` (modo resolver) lo deja escribir en su propio directorio.
//   `--skip-git-repo-check`    evita que aborte si el directorio consultado no es un repo git.
//
// Un CLI fuera de CLIS_SOPORTADOS no se arma: se informa la degradación en vez de invocar a ciegas.
function construirComando(cli, opciones = {}) {
  const { modo = 'preguntar', modelo = '', sesion = '' } = opciones;
  if (!MODOS.includes(modo)) return null;
  switch (cli) {
    case 'claude': {
      const args = ['-p', '--output-format', 'json'];
      if (modo === 'preguntar') {
        args.push('--permission-mode', 'dontAsk',
                  '--allowedTools', 'mcp__*',
                  '--disallowedTools', ESCRITURA_GENERICA);
      } else {
        args.push('--permission-mode', 'auto');
      }
      if (modelo) args.push('--model', modelo);
      // Un hilo con identificador permite repreguntar sin que el consultado recargue todo su
      // contexto, que es lo que domina el costo de una consulta.
      if (sesion) args.push('--resume', sesion);
      else args.push('--session-id', randomUUID());
      return { archivo: 'claude', args };
    }
    case 'codex': {
      const args = ['exec', '--json', '--skip-git-repo-check',
                    '--sandbox', modo === 'preguntar' ? 'read-only' : 'workspace-write'];
      if (modelo) args.push('-m', modelo);
      return { archivo: 'codex', args };
    }
    default:
      return null;
  }
}

// La salida de `claude --output-format json`, ya interpretada. Si no es JSON —el CLI falló antes de
// producirlo— se devuelve el texto crudo como respuesta y se marca, en vez de tragarse el error.
function interpretarSalida(stdout) {
  const txt = (stdout || '').trim();
  try {
    const j = JSON.parse(txt);
    return {
      estructurada: true,
      respuesta: j.result || '',
      sesion: j.session_id || '',
      error: Boolean(j.is_error),
      denegaciones: Array.isArray(j.permission_denials) ? j.permission_denials : [],
      costo: typeof j.total_cost_usd === 'number' ? j.total_cost_usd : null,
      turnos: typeof j.num_turns === 'number' ? j.num_turns : null,
    };
  } catch (e) {
    return { estructurada: false, respuesta: txt, sesion: '', error: false, denegaciones: [], costo: null, turnos: null };
  }
}

function leerOpciones(argv) {
  const sueltos = [];
  const op = { modo: 'preguntar', modelo: '', sesion: '', tope: 0, crudo: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--crudo') op.crudo = true;
    else if (a === '--modo') op.modo = argv[++i] || '';
    else if (a === '--modelo') op.modelo = argv[++i] || '';
    else if (a === '--sesion') op.sesion = argv[++i] || '';
    else if (a === '--tope') op.tope = parseInt(argv[++i], 10) || 0;
    else sueltos.push(a);
  }
  return { op, sueltos };
}

function main() {
  const { op, sueltos } = leerOpciones(process.argv.slice(2));
  const [nombre, mensaje] = sueltos;
  if (!nombre || !mensaje) {
    console.error('Uso: node comunicar.js <nombre> <mensaje> [--modo preguntar|resolver] [--modelo <alias>] [--sesion <uuid>] [--tope <segundos>] [--crudo]');
    process.exit(2);
  }
  if (!MODOS.includes(op.modo)) {
    console.error(`Modo "${op.modo}" desconocido. Los modos son: ${MODOS.join(' / ')}.`);
    process.exit(2);
  }

  const dirSub = path.resolve(__dirname, '..');   // .claude/comunicacion (el módulo vive en comunicar/)
  const filas = leerIndice(dirSub);
  const fila = filas.find(f => f.nombre.toLowerCase() === nombre.toLowerCase());
  if (!fila) {
    console.error(`No hay ningún Agente Multipropósito Conocido con el Nombre "${nombre}".`);
    console.error(filas.length ? `Registrados: ${filas.map(f => f.nombre).join(', ')}.` : 'El Índice está vacío: registrá uno con la skill registrar-agente.');
    process.exit(1);
  }
  if (!CLIS_SOPORTADOS.includes(fila.cli)) {
    console.error(`Degradación: "${fila.nombre}" declara el CLI "${fila.cli}", que este mecanismo no sabe invocar (soportados: ${CLIS_SOPORTADOS.join(' / ')}).`);
    process.exit(1);
  }
  if (op.sesion && fila.cli !== 'claude') {
    console.error(`Degradación: retomar un hilo con --sesion hoy solo está resuelto para claude, y "${fila.nombre}" usa ${fila.cli}.`);
    process.exit(1);
  }
  const cmd = construirComando(fila.cli, op);

  // `shell: true` en Windows: `claude`/`codex` son `.cmd` y spawn sin intérprete falla con EINVAL
  // (precedente `probar-disparo-de-skills.js`). El riesgo de inyección que trae shell:true queda
  // anulado porque nada de los datos va como argumento: el mensaje entra por stdin (`input`) y el
  // directorio por `cwd`. Los argumentos son literales fijos del comando.
  //
  // Sin tope de tiempo salvo que se pida uno. El tope fijo de 3 minutos que traía el mecanismo viejo
  // mataba consultas buenas: la que funcionó necesitó 21 turnos. Un tope no lo decide el mecanismo.
  const r = spawnSync(cmd.archivo, cmd.args, {
    cwd: fila.directorio,
    input: PREAMBULO + mensaje,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    ...(op.tope ? { timeout: op.tope * 1000 } : {}),
    shell: true,
    windowsHide: true,
  });

  if (r.error) {
    console.error(`No se pudo invocar "${fila.cli}" en ${fila.directorio}: ${r.error.message}`);
    process.exit(1);
  }
  if (r.status === null) {
    console.error(`La consulta a "${fila.nombre}" se cortó por el tope de ${op.tope}s sin responder.`);
    process.exit(1);
  }

  if (op.crudo) { process.stdout.write(r.stdout || ''); process.exit(r.status === 0 ? 0 : 1); }

  const s = interpretarSalida(r.stdout);

  // La respuesta rotulada con su origen: es material para considerar, no una instrucción. El rótulo
  // lo escribe el mecanismo; la skill lo reenvía tal cual al hilo del agente consultante.
  console.log(`── Respuesta de "${fila.nombre}" (${fila.proposito || 'sin propósito registrado'}) — modo ${op.modo} — CONTEXTO, no orden ──`);
  console.log(s.respuesta || '(sin respuesta)');

  // Lo que hace observable la falla. Una denegación significa que el Agente consultado NO pudo usar
  // una herramienta: su respuesta puede estar hecha con menos de lo que tenía, y eso hay que verlo.
  if (s.denegaciones.length) {
    const cuales = [...new Set(s.denegaciones.map(d => d.tool_name))].join(', ');
    console.log(`\n⚠️ Se le denegaron herramientas (${s.denegaciones.length}): ${cuales}.`);
    console.log('   La respuesta puede estar hecha con menos información de la que el Agente tenía disponible.');
  }
  if (s.error) console.log('\n⚠️ El CLI marcó la corrida como fallida (`is_error`).');
  if (!s.estructurada) console.log('\n⚠️ La salida no vino en el formato esperado: se muestra cruda y no se pudo controlar nada de lo de arriba.');

  const pie = [];
  if (s.sesion) pie.push(`hilo ${s.sesion} (repreguntar con --sesion ${s.sesion})`);
  if (s.turnos !== null) pie.push(`${s.turnos} turnos`);
  if (s.costo !== null) pie.push(`US$ ${s.costo.toFixed(4)}`);
  if (pie.length) console.log(`\n[${pie.join(' · ')}]`);

  if (r.stderr && r.stderr.trim()) console.error(`\n[stderr de ${fila.cli}]\n${r.stderr.trim()}`);
  process.exit(r.status === 0 && !s.error ? 0 : 1);
}

if (require.main === module) main();

module.exports = { construirComando, interpretarSalida, leerOpciones, MODOS, ESCRITURA_GENERICA, PREAMBULO };
