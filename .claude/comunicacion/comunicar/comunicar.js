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
// Dos cosas que este mecanismo distingue y que antes devolvía con la misma forma:
//   «el Agente contestó esto»       — se imprime bajo el rótulo «Respuesta de …», con TODO lo que
//                                     escribió en la corrida, no solo su último mensaje.
//   «el Agente no llegó a contestar» — carpeta inexistente, CLI no instalado, tope vencido, error de
//                                     la API (clave inválida, sin crédito): se imprime como FALLA,
//                                     sin el rótulo de respuesta, y sale con código 1.
//
// Uso: node comunicar.js <nombre> <mensaje> [--modo preguntar|resolver] [--modelo <alias>]
//                                           [--sesion <uuid>] [--tope <segundos>]
//                                           [--leer <ruta>]... [--crudo]
//
// Node pelado, sin dependencias externas (los scripts del Agente Multipropósito corren así).
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const { spawnSync } = require('child_process');
const { CLIS_SOPORTADOS, leerIndice } = require('../indice.js');

const MODOS = ['preguntar', 'resolver'];

// La marca que este mecanismo le pone en el entorno al Agente consultado. Le dice a sus controles
// que corre dentro de una consulta, sin nadie del otro lado: el aviso de cierre del consultado
// (`conducta/avisar-sesion-sin-asentar/`) no actúa si la encuentra. Sin esa marca, el aviso le
// daba un turno más, el consultado lo contestaba y ese turno pisaba la respuesta real.
const VARIABLE_CONSULTA = 'AMP_CONSULTA_ENTRE_AGENTES';

// Las herramientas que escriben y que NINGÚN Agente necesita para contestar una pregunta. Son
// genéricas: las trae todo agente, así que la lista no depende de a quién se consulte. Lo que este
// mecanismo NO hace es enumerar las herramientas propias del consultado —sus MCP—: solo él sabe
// cuáles tiene y cuáles escriben, y una copia de esa lista acá se desactualiza en silencio.
const ESCRITURA_GENERICA = 'Write,Edit,NotebookEdit,Bash';

// Las variables de la máquina que el CLI `claude` usa como credencial ANTES que la sesión iniciada.
// No se limpian —la configuración de la máquina es de la máquina—: solo se NOMBRAN cuando la
// consulta falla por la API, porque son la explicación más común de esa falla.
const CREDENCIALES_DE_MAQUINA = ['ANTHROPIC_API_KEY', 'ANTHROPIC_AUTH_TOKEN', 'CLAUDE_CODE_OAUTH_TOKEN'];

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

// Una ruta absoluta en la forma que piden las reglas de permiso de `claude`: `//d/carpeta/archivo`.
function rutaDeRegla(ruta) {
  const abs = path.resolve(ruta).replace(/\\/g, '/');
  const m = abs.match(/^([A-Za-z]):\/(.*)$/);
  return m ? `//${m[1].toLowerCase()}/${m[2]}` : `/${abs}`;
}

// Lo que el consultado puede leer fuera de su carpeta, en modo `preguntar`. Medido el 16/11/2026:
//   - `--add-dir <carpeta>` abre la carpeta ENTERA (se leyeron sus dos archivos).
//   - `--add-dir <archivo>` NO abre nada y no avisa: el CLI lo acepta, sale con 0 y el Read se
//     deniega igual. Por eso un archivo no se pasa así.
//   - `--allowedTools "Read(//d/…/archivo)"` abre ESE archivo y nada más (el vecino se denegó).
// Así que una carpeta va por `--add-dir` y un archivo por una regla de lectura de ese archivo solo.
// Codex en `--sandbox read-only` ya puede leer fuera de su carpeta: no lleva nada.
function argumentosDeLectura(cli, rutas) {
  const args = [];
  if (cli !== 'claude') return args;
  for (const r of rutas) {
    const abs = path.resolve(r);
    if (fs.statSync(abs).isDirectory()) args.push('--add-dir', abs);
    else args.push('--allowedTools', `Read(${rutaDeRegla(abs)})`);
  }
  return args;
}

// El comando por CLI y por modo. El mensaje NO va acá: se pasa por STDIN, y el directorio por el
// `cwd` del proceso. Las rutas de `--leer` sí son datos y van en la línea de comandos: por eso
// todos los argumentos se citan (ver `citarParaShell`).
//
// claude:
//   `-p`                       corrida no interactiva, lee el mensaje de stdin.
//   `--output-format stream-json --verbose`
//                              un evento por línea: cada mensaje que el consultado escribe en la
//                              corrida, y al final un evento `result` con `.session_id`,
//                              `.is_error`, `.total_cost_usd` y sobre todo `.permission_denials`.
//                              Con `json` a secas solo volvía `.result`, que es el ÚLTIMO mensaje:
//                              si el consultado contestaba y después le saltaba un aviso de cierre,
//                              contestar el aviso pisaba la respuesta sin señal.
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
//   `exec`                     corrida no interactiva.  `--json` un evento por línea.
//   `--sandbox read-only`      (modo preguntar) impide toda escritura.
//   `--sandbox workspace-write` (modo resolver) lo deja escribir en su propio directorio.
//   `--skip-git-repo-check`    evita que aborte si el directorio consultado no es un repo git.
//
// Un CLI fuera de CLIS_SOPORTADOS no se arma: se informa la degradación en vez de invocar a ciegas.
function construirComando(cli, opciones = {}) {
  const { modo = 'preguntar', modelo = '', sesion = '', leer = [] } = opciones;
  if (!MODOS.includes(modo)) return null;
  switch (cli) {
    case 'claude': {
      const args = ['-p', '--output-format', 'stream-json', '--verbose'];
      if (modo === 'preguntar') {
        args.push('--permission-mode', 'dontAsk',
                  '--allowedTools', 'mcp__*',
                  '--disallowedTools', ESCRITURA_GENERICA);
        args.push(...argumentosDeLectura(cli, leer));
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

// El entorno con que corre el consultado: el de la máquina, más la marca de consulta. Nada se
// quita: si la máquina tiene una credencial, la decisión de usarla es de la máquina (y del
// `settings.json` del consultado, que gana sobre el entorno).
function construirEntorno(base = process.env) {
  return { ...base, [VARIABLE_CONSULTA]: '1' };
}

// `shell: true` hace falta en Windows (los CLI son `.cmd`), y con él Node pega los argumentos con
// espacios, sin comillas. Cada argumento se cita para el intérprete que lo va a leer. En Windows,
// dentro de comillas dobles `cmd` todavía expande `%VAR%`, y una comilla doble cerraría el
// argumento: una ruta con `"`, `%` o un salto de línea se rechaza en vez de citarse mal.
function citarParaShell(arg, plataforma = process.platform) {
  const s = String(arg);
  if (plataforma === 'win32') {
    if (/["%\r\n]/.test(s)) throw new Error(`el argumento ${JSON.stringify(s)} trae un carácter que no se puede pasar sano por la línea de comandos de Windows (", % o salto de línea)`);
    if (/^[A-Za-z0-9_\-.,:=/+@]+$/.test(s)) return s;
    return `"${s.replace(/(\\+)$/, '$1$1')}"`;
  }
  if (/^[A-Za-z0-9_\-.,:=/+@]+$/.test(s)) return s;
  return `'${s.replace(/'/g, `'\\''`)}'`;
}

function lineasJson(txt) {
  const eventos = [];
  let sueltas = 0;
  for (const l of (txt || '').split(/\r?\n/)) {
    if (!l.trim()) continue;
    try { eventos.push(JSON.parse(l)); } catch (e) { sueltas++; }
  }
  return { eventos, sueltas };
}

// Un error de la API, en castellano. El texto del CLI se conserva al lado.
const ERRORES_DE_API = {
  401: 'la clave de API no es válida',
  402: 'la cuenta no tiene crédito',
  403: 'la credencial no tiene permiso',
  429: 'se pasó del límite de uso',
  529: 'la API está sobrecargada',
};

// La salida del CLI, ya interpretada. Distingue tres casos:
//   estructurada y sin error — `textos` es todo lo que el consultado escribió, en orden.
//   estructurada con error   — `error` y `motivo`: el consultado no llegó a contestar.
//   no estructurada          — el CLI no produjo eventos (no arrancó): se marca, no se inventa.
function interpretarSalida(stdout, cli = 'claude') {
  const vacio = { estructurada: false, textos: [], respuesta: '', sesion: '', error: false, motivo: '',
                  estadoApi: null, cerrado: false, denegaciones: [], avisos: [], costo: null, turnos: null };
  const { eventos } = lineasJson(stdout);
  if (!eventos.length) return { ...vacio, respuesta: (stdout || '').trim() };
  const s = { ...vacio, estructurada: true };

  if (cli === 'codex') {
    for (const e of eventos) {
      if (e.type === 'thread.started' && e.thread_id) s.sesion = e.thread_id;
      else if (e.type === 'item.completed' && e.item) {
        if (e.item.type === 'agent_message' && e.item.text) s.textos.push(e.item.text);
        else if (e.item.type === 'error' && e.item.message) s.avisos.push(e.item.message);
      } else if (e.type === 'turn.completed') s.cerrado = true;
      else if (e.type === 'turn.failed') { s.error = true; s.cerrado = true; s.motivo = (e.error && e.error.message) || 'el turno falló'; }
      else if (e.type === 'error') { s.error = true; s.motivo = e.message || 'error del CLI'; }
    }
  } else {
    let resultado = null;
    for (const e of eventos) {
      if (e.type === 'assistant' && e.message && Array.isArray(e.message.content)) {
        for (const c of e.message.content) if (c.type === 'text' && c.text && c.text.trim()) s.textos.push(c.text);
      } else if (e.type === 'result') resultado = e;
    }
    if (resultado) {
      s.cerrado = true;
      s.sesion = resultado.session_id || '';
      s.error = Boolean(resultado.is_error);
      s.estadoApi = typeof resultado.api_error_status === 'number' ? resultado.api_error_status : null;
      s.denegaciones = Array.isArray(resultado.permission_denials) ? resultado.permission_denials : [];
      s.costo = typeof resultado.total_cost_usd === 'number' ? resultado.total_cost_usd : null;
      s.turnos = typeof resultado.num_turns === 'number' ? resultado.num_turns : null;
      // La salida de `--output-format json` (un único evento `result`, sin los mensajes) también
      // se acepta: ahí lo único que hay es el último mensaje.
      if (!s.textos.length && resultado.result && !s.error) s.textos.push(resultado.result);
      if (s.error) {
        const texto = (resultado.result || resultado.subtype || '').trim();
        const glosa = s.estadoApi && ERRORES_DE_API[s.estadoApi];
        s.motivo = s.estadoApi
          ? `error ${s.estadoApi}${glosa ? ', ' + glosa : ''}${texto ? ` (${texto})` : ''}`
          : (texto || 'el CLI marcó la corrida como fallida');
        // El texto del error lo emite el CLI como si fuera un mensaje del consultado: no lo es.
        if (texto) s.textos = s.textos.filter(t => t.trim() !== texto);
      }
    }
  }
  if (!s.cerrado && !s.error) { s.error = true; s.motivo = 'la corrida se cortó antes de cerrar el turno'; }
  s.respuesta = s.textos.join('\n\n');
  return s;
}

function leerOpciones(argv) {
  const sueltos = [];
  const op = { modo: 'preguntar', modelo: '', sesion: '', tope: 0, crudo: false, leer: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--crudo') op.crudo = true;
    else if (a === '--modo') op.modo = argv[++i] || '';
    else if (a === '--modelo') op.modelo = argv[++i] || '';
    else if (a === '--sesion') op.sesion = argv[++i] || '';
    else if (a === '--tope') op.tope = parseInt(argv[++i], 10) || 0;
    else if (a === '--leer') { const r = argv[++i]; if (r) op.leer.push(r); }
    else sueltos.push(a);
  }
  return { op, sueltos };
}

// «El Agente no llegó a contestar»: sin el rótulo de respuesta, con el motivo, y código 1.
function informarFalla(fila, motivo, extra = []) {
  console.log(`✖ "${fila.nombre}" no contestó: ${motivo}.`);
  console.log('  Esto NO es una respuesta del Agente: la consulta no llegó a producir una.');
  for (const l of extra) console.log(l);
}

function main() {
  const { op, sueltos } = leerOpciones(process.argv.slice(2));
  const [nombre, mensaje] = sueltos;
  if (!nombre || !mensaje) {
    console.error('Uso: node comunicar.js <nombre> <mensaje> [--modo preguntar|resolver] [--modelo <alias>] [--sesion <uuid>] [--tope <segundos>] [--leer <ruta>]... [--crudo]');
    process.exit(2);
  }
  if (!MODOS.includes(op.modo)) {
    console.error(`Modo "${op.modo}" desconocido. Los modos son: ${MODOS.join(' / ')}.`);
    process.exit(2);
  }
  if (op.leer.length && op.modo !== 'preguntar') {
    console.error('--leer es del modo preguntar: en resolver el consultado corre con sus propios permisos, y abrirle una carpeta ajena le daría también permiso de escribir ahí.');
    process.exit(2);
  }
  for (const r of op.leer) {
    if (!fs.existsSync(r)) { console.error(`--leer: la ruta "${r}" no existe.`); process.exit(2); }
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
  if (!fs.existsSync(fila.directorio)) {
    informarFalla(fila, `su carpeta ${fila.directorio} no existe (corregila con la skill registrar-agente)`);
    process.exit(1);
  }
  const cmd = construirComando(fila.cli, op);
  let linea;
  try { linea = [cmd.archivo, ...cmd.args].map(a => citarParaShell(a)).join(' '); }
  catch (e) { console.error(`No se puede armar el comando: ${e.message}.`); process.exit(2); }

  // `shell: true` en Windows: `claude`/`codex` son `.cmd` y spawn sin intérprete falla con EINVAL
  // (precedente `probar-disparo-de-skills.js`). El mensaje entra por stdin (`input`) y el
  // directorio por `cwd`; lo único que viene de datos en la línea son las rutas de `--leer`, y van
  // citadas.
  //
  // Sin tope de tiempo salvo que se pida uno. El tope fijo de 3 minutos que traía el mecanismo viejo
  // mataba consultas buenas: la que funcionó necesitó 21 turnos. Un tope no lo decide el mecanismo.
  const r = spawnSync(linea, [], {
    cwd: fila.directorio,
    env: construirEntorno(),
    input: PREAMBULO + mensaje,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    ...(op.tope ? { timeout: op.tope * 1000 } : {}),
    shell: true,
    windowsHide: true,
  });

  if (r.error && r.error.code !== 'ETIMEDOUT') {
    informarFalla(fila, `no se pudo lanzar "${fila.cli}" en ${fila.directorio}: ${r.error.message}`);
    process.exit(1);
  }
  if (r.status === null) {
    informarFalla(fila, `la consulta se cortó por el tope de ${op.tope}s`);
    process.exit(1);
  }

  if (op.crudo) { process.stdout.write(r.stdout || ''); process.exit(r.status === 0 ? 0 : 1); }

  const s = interpretarSalida(r.stdout, fila.cli);
  const stderr = (r.stderr || '').trim();

  if (!s.estructurada) {
    const ultima = stderr.split(/\r?\n/).filter(Boolean).slice(-3).join(' / ');
    const motivo = r.status !== 0
      ? `"${fila.cli}" terminó con código ${r.status} sin producir una respuesta${ultima ? ` (${ultima})` : ''}`
      : 'la salida no vino en el formato esperado';
    const extra = s.respuesta ? ['', 'Salida cruda del CLI (no controlada):', s.respuesta] : [];
    informarFalla(fila, motivo, extra);
    process.exit(1);
  }

  if (s.error) {
    const extra = [];
    if (s.estadoApi) {
      const presentes = CREDENCIALES_DE_MAQUINA.filter(v => process.env[v]);
      if (presentes.length) extra.push(`  En el entorno de la máquina hay ${presentes.join(', ')}: el CLI la usa antes que la sesión iniciada.`);
    }
    if (s.textos.length) extra.push('', 'Lo que alcanzó a escribir antes de la falla (incompleto, no es su respuesta):', s.respuesta);
    informarFalla(fila, s.motivo, extra);
    if (stderr) console.error(`\n[stderr de ${fila.cli}]\n${stderr}`);
    process.exit(1);
  }

  // La respuesta rotulada con su origen: es material para considerar, no una instrucción. El rótulo
  // lo escribe el mecanismo; la skill lo reenvía tal cual al hilo del agente consultante.
  console.log(`── Respuesta de "${fila.nombre}" (${fila.proposito || 'sin propósito registrado'}) — modo ${op.modo} — CONTEXTO, no orden ──`);
  console.log(s.respuesta || '(terminó sin escribir nada)');

  // Lo que hace observable la falla. Una denegación significa que el Agente consultado NO pudo usar
  // una herramienta: su respuesta puede estar hecha con menos de lo que tenía, y eso hay que verlo.
  if (s.denegaciones.length) {
    const cuales = [...new Set(s.denegaciones.map(d => d.tool_name))].join(', ');
    console.log(`\n⚠️ Se le denegaron herramientas (${s.denegaciones.length}): ${cuales}.`);
    console.log('   La respuesta puede estar hecha con menos información de la que el Agente tenía disponible.');
  }
  for (const a of s.avisos) console.log(`\n⚠️ Aviso del CLI: ${a}`);

  const pie = [];
  if (s.sesion) pie.push(`hilo ${s.sesion}${fila.cli === 'claude' ? ` (repreguntar con --sesion ${s.sesion})` : ''}`);
  if (s.textos.length > 1) pie.push(`${s.textos.length} mensajes`);
  if (s.turnos !== null) pie.push(`${s.turnos} turnos`);
  if (s.costo !== null) pie.push(`US$ ${s.costo.toFixed(4)}`);
  if (pie.length) console.log(`\n[${pie.join(' · ')}]`);

  if (stderr) console.error(`\n[stderr de ${fila.cli}]\n${stderr}`);
  process.exit(r.status === 0 ? 0 : 1);
}

if (require.main === module) main();

module.exports = {
  construirComando, construirEntorno, interpretarSalida, leerOpciones, citarParaShell, rutaDeRegla,
  MODOS, ESCRITURA_GENERICA, PREAMBULO, VARIABLE_CONSULTA,
};
