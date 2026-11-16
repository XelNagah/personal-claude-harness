// Prueba cada control de lint-comunicacion contra un caso malo y uno bueno, más las funciones puras
// de los otros mecanismos del subsistema: `leerIndice` (indice.js), `construirComando` e
// `interpretarSalida` (comunicar/) y `buscarAgentes` (buscar/).
// Un lint que lee mal contesta en verde sobre un conjunto vacío, así que verde no prueba nada por sí
// solo: cada control tiene que ENCENDERSE ante su defecto, y solo ante el suyo.
//
// EL BANCO FABRICA SU ÍNDICE. Antes copiaba el `.claude/` del repo que lo corre y agregaba sus filas
// de prueba sobre el Índice REAL ya copiado, y después exigía contarlas: `filas.length === 1`. El
// Índice de este subsistema es Aprendizaje local —guarda rutas de máquina y viaja sin filas—, así que
// en el repo autor la cuenta daba 1 y en cualquier repo que hubiera registrado un Agente
// Multipropósito Conocido daba una más por cada uno. Medido el 20/08/2026 en un Agente Desplegado al
// día con `amp` 0.50.0, con tres instalaciones registradas: el caso daba 4 y el banco se encendía en
// rojo sin que hubiera nada roto. Es la forma «escenario prestado» del conocimiento
// `controles-que-no-avisan`, y la Decisión `Local-0075` es la que la prohíbe para todo banco que viaja.
//
// Lo único que se toma del subsistema instalado es el `MANIFIESTO.md` —Componente del Agente
// Multipropósito e igual en todas las instalaciones, y lo que el control de forma del Índice
// contrasta— y el CÓDIGO de los tres mecanismos, que es justamente lo que el banco viene a probar.
// El Índice y sus filas son datos sintéticos.
//
// Uso: node .claude/comunicacion/lint-comunicacion/pruebas.js   (desde la raíz del repo)
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ORIGEN = '.claude/comunicacion';
const REPO_PRUEBA = '.claude/tmp/repo-prueba-comunicacion';
const BANCO = path.join(REPO_PRUEBA, '.claude', 'comunicacion');
const LINT = '.claude/comunicacion/lint-comunicacion/lint-comunicacion.js';

const DEL_SUBSISTEMA = ['MANIFIESTO.md'];

const ABS = path.resolve(REPO_PRUEBA);                 // tiene .claude/  → Directorio válido
const DIR_SIN_CLAUDE = path.join(ABS, '.claude');      // existe, pero sin .claude/ adentro
const DIR_INEXISTENTE = path.join(ABS, 'no-existe-xyz');

// El Índice se fabrica SIN filas, que es como viaja y como nace en toda instalación: las filas las
// pone cada caso, así que la cuenta que un caso afirma no depende de lo que el repo haya registrado.
function indiceSintetico() {
  return '---\nindice: Agentes Multipropósito Conocidos\norigen: agente-desplegado\n'
    + 'columnas: [Código, Nombre, Propósito, Directorio, CLI]\n'
    + 'descripcion: cada otra instalación del Agente Multipropósito que se registró para consultarla\n---\n\n'
    + '# Agentes Multipropósito Conocidos\n\nDatos sintéticos: este registro existe solo para romperlo.\n\n'
    + '| Código | Nombre | Propósito | Directorio | CLI |\n'
    + '|--------|--------|-----------|------------|-----|\n';
}

function armar() {
  fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
  fs.mkdirSync(BANCO, { recursive: true });
  for (const f of DEL_SUBSISTEMA) {
    const src = path.join(ORIGEN, f);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(BANCO, f));
  }
  escribir(indiceSintetico());
  // El catálogo de subsistemas del propio repo de prueba: es la señal con que el buscador reconoce
  // una instalación del Agente Multipropósito, y sin ella el repo de prueba no se reconocería a sí
  // mismo (el candidato que tiene que salir marcado como `esEsteRepo`).
  fs.mkdirSync(path.join(REPO_PRUEBA, '.claude', 'subsistemas'), { recursive: true });
  fs.writeFileSync(path.join(REPO_PRUEBA, '.claude', 'subsistemas', 'SUBSISTEMAS.md'), '# Subsistemas\n');
}
const reg = () => fs.readFileSync(path.join(BANCO, 'INDICE.md'), 'utf8');
const escribir = t => fs.writeFileSync(path.join(BANCO, 'INDICE.md'), t);
// Agrega filas al Índice (que se fabrica sin ninguna): se pegan después del renglón separador `|---|`.
const fila = (cod, nom, prop, dir, cli) => `| ${cod} | ${nom} | ${prop} | ${dir} | ${cli} |`;
function conFilas(...filas) {
  const lineas = reg().split(/\r?\n/);
  const iSep = lineas.findIndex(l => /^\|[\s:|-]+\|\s*$/.test(l));
  lineas.splice(iSep + 1, 0, ...filas);
  escribir(lineas.join('\n'));
}
const FILA_OK = () => fila('Local-0001', 'contable', 'Lleva la contabilidad', ABS, 'claude');

function correr() {
  const r = cp.spawnSync('node', [LINT, BANCO], { encoding: 'utf8' });
  return (r.stdout || '') + (r.stderr || '');
}
function hallazgos(salida) {
  const out = {};
  for (const m of salida.matchAll(/^\[\d+\] (.+?) \((\d+)\):/gm)) out[m[1].trim()] = parseInt(m[2], 10);
  return out;
}
const total = h => Object.values(h).reduce((a, b) => a + b, 0);
// La salida por eventos de `claude --output-format stream-json`, fabricada.
const eventos = (...ev) => ev.map(e => JSON.stringify(e)).join('\n') + '\n';
const asistente = texto => ({ type: 'assistant', message: { content: [{ type: 'text', text: texto }] } });

let malos = 0;

console.log('== CASO BUENO: el banco intacto (Índice sin filas) da cero ==');
armar();
{
  const h = hallazgos(correr());
  const t = total(h);
  console.log(`${t === 0 ? 'OK  ' : 'FALLA'} banco sin tocar → ${t} hallazgos${t ? '  ' + JSON.stringify(h) : ''}`);
  if (t !== 0) malos++;
}

console.log('\n== CASO BUENO: una fila válida (Directorio con .claude/, CLI soportado) da cero ==');
armar();
conFilas(FILA_OK());
{
  const h = hallazgos(correr());
  const t = total(h);
  console.log(`${t === 0 ? 'OK  ' : 'FALLA'} una fila sana → ${t} hallazgos${t ? '  ' + JSON.stringify(h) : ''}`);
  if (t !== 0) malos++;
}

const casos = [];
const caso = (nombre, seccion, romper) => casos.push({ nombre, seccion, romper });

caso('Nombre duplicado', 'NOMBRES VACIOS O DUPLICADOS',
  () => conFilas(FILA_OK(), fila('Local-0002', 'contable', 'Otra cosa', ABS, 'claude')));

caso('Nombre vacío', 'NOMBRES VACIOS O DUPLICADOS',
  () => conFilas(fila('Local-0001', '', 'Sin nombre', ABS, 'claude')));

caso('Directorio que no existe', 'DIRECTORIOS INVALIDOS',
  () => conFilas(fila('Local-0001', 'contable', 'x', DIR_INEXISTENTE, 'claude')));

caso('Directorio sin .claude/', 'DIRECTORIOS INVALIDOS',
  () => conFilas(fila('Local-0001', 'contable', 'x', DIR_SIN_CLAUDE, 'claude')));

caso('CLI no soportado', 'CLI NO SOPORTADO',
  () => conFilas(fila('Local-0001', 'contable', 'x', ABS, 'gemini')));

caso('columna declarada que la tabla no tiene', 'FORMA DEL INDICE',
  () => escribir(reg().replace(/^columnas: \[(.+)\]$/m, 'columnas: [$1, Inventada]')));

console.log('\n== CASOS MALOS: cada control se enciende ante su defecto ==');
for (const c of casos) {
  armar();
  try { c.romper(); } catch (e) { console.log(`FALLA ${c.nombre}\n      no se pudo romper el banco: ${e.message}`); malos++; continue; }
  const h = hallazgos(correr());
  const propio = h[c.seccion] || 0;
  if (propio === 0) {
    console.log(`FALLA ${c.nombre}  → [${c.seccion}] siguió en 0 (el control no lo vio)`);
    malos++; continue;
  }
  const otros = Object.entries(h).filter(([k, n]) => k !== c.seccion && n > 0).map(([k, n]) => `${k}=${n}`);
  console.log(`OK    ${c.nombre}  → [${c.seccion}] 0→${propio}${otros.length ? '   (además: ' + otros.join(', ') + ')' : ''}`);
}

// -- el código de salida: 0 siempre, y 1 con `--estricto` si hay hallazgos ------
// Una verificación que solo mira el código de salida daba por bueno un lint con hallazgos: el
// código distinto de cero está reservado para decir que el lint se rompió. Se prueban las dos
// mitades del contrato, y que la opción no se lea como carpeta.
console.log('\n== CODIGO DE SALIDA: 0 siempre; 1 con --estricto y hallazgos ==');
{
  const salir = (...extra) => cp.spawnSync('node', [LINT, ...extra], { encoding: 'utf8' }).status;
  const salidas = [];
  armar();
  conFilas(fila('Local-0001', 'contable', 'x', ABS, 'gemini'));
  salidas.push(['con hallazgos y sin --estricto sale con 0', salir(BANCO), 0]);
  salidas.push(['con hallazgos y --estricto sale con 1', salir(BANCO, '--estricto'), 1]);
  salidas.push(['con --estricto antes de la ruta lee la misma carpeta', salir('--estricto', BANCO), 1]);
  armar();
  salidas.push(['sin hallazgos y --estricto sale con 0', salir(BANCO, '--estricto'), 0]);
  for (const [nombre, obtenido, esperado] of salidas) {
    const ok = obtenido === esperado;
    if (!ok) malos++;
    console.log(`${ok ? 'OK  ' : 'FALLA'} ${nombre}  → ${obtenido}${ok ? '' : `  (esperado ${esperado})`}`);
  }
}

// -- funciones puras: leerIndice y construirComando --------------------------
// Los módulos se toman del subsistema INSTALADO, que es el código que se está probando, y se los
// apunta al banco por parámetro: `leerIndice` recibe la carpeta, así que no hace falta copiarlo.
console.log('\n== FUNCIONES PURAS ==');
armar();
conFilas(fila('Local-0001', 'Contable', 'Lleva la contabilidad', ABS, 'Claude'));
{
  const { leerIndice, CLIS_SOPORTADOS } = require(path.resolve(ORIGEN, 'indice.js'));
  const filas = leerIndice(BANCO);
  const f = filas[0] || {};
  const ok = filas.length === 1 && f.nombre === 'Contable' && f.directorio === ABS
    && f.cli === 'claude' && f.codigo === 'Local-0001';   // el CLI se normaliza a minúscula
  console.log(`${ok ? 'OK  ' : 'FALLA'} leerIndice parsea la fila por nombre de columna y normaliza el CLI`);
  if (!ok) { malos++; console.log('      ', JSON.stringify(f)); }

  const vacio = leerIndice(path.join(ABS, 'no-existe')).length === 0;
  console.log(`${vacio ? 'OK  ' : 'FALLA'} leerIndice sobre un Índice ausente devuelve lista vacía sin error`);
  if (!vacio) malos++;

  const { construirComando, interpretarSalida, leerOpciones, ESCRITURA_GENERICA } =
    require(path.resolve(ORIGEN, 'comunicar', 'comunicar.js'));

  // El modo `preguntar` tiene que dejar VIVOS los MCP del consultado y sacarle solo la escritura
  // genérica. Es el control que faltaba: el mecanismo anterior apagaba los MCP y el Agente contestaba
  // de memoria sin que nada avisara. Se controla que no aparezca `plan`, el modo que causaba eso.
  const cl = construirComando('claude', { modo: 'preguntar' });
  const args = (cl && cl.args) || [];
  const par = (b) => { const i = args.indexOf(b); return i >= 0 ? args[i + 1] : ''; };
  const okPreguntar = cl && cl.archivo === 'claude'
    && par('--output-format') === 'stream-json'     // el turno completo, no solo el último mensaje
    && args.includes('--verbose')                   // sin esto `-p` rechaza stream-json
    && par('--permission-mode') === 'dontAsk'
    && par('--allowedTools') === 'mcp__*'           // los MCP del consultado siguen vivos
    && par('--disallowedTools') === ESCRITURA_GENERICA
    && !args.includes('plan');                      // el modo que apagaba los MCP no vuelve
  console.log(`${okPreguntar ? 'OK  ' : 'FALLA'} construirComando: el modo preguntar conserva los MCP y saca la escritura genérica`);
  if (!okPreguntar) { malos++; console.log('      ', JSON.stringify(args)); }

  // El modo `resolver` lo deja actuar, y NO lleva lista de denegación: está medido que en ese modo
  // no se aplica, y una lista que no frena es peor que ninguna porque se confía en ella.
  const clR = construirComando('claude', { modo: 'resolver' });
  const argsR = (clR && clR.args) || [];
  const okResolver = clR && argsR.includes('auto') && !argsR.includes('--disallowedTools');
  console.log(`${okResolver ? 'OK  ' : 'FALLA'} construirComando: el modo resolver deja actuar y no lleva lista de denegación`);
  if (!okResolver) { malos++; console.log('      ', JSON.stringify(argsR)); }

  const cx = construirComando('codex', { modo: 'preguntar' });
  const cxR = construirComando('codex', { modo: 'resolver' });
  const okResto = cx && cx.archivo === 'codex' && cx.args.includes('read-only')
    && cxR && cxR.args.includes('workspace-write')
    && construirComando('gemini') === null
    && construirComando('claude', { modo: 'inventado' }) === null
    && CLIS_SOPORTADOS.length === 2;
  console.log(`${okResto ? 'OK  ' : 'FALLA'} construirComando: codex por modo, y null para el CLI o el modo desconocido`);
  if (!okResto) malos++;

  // Retomar un hilo pide `--resume`; una consulta nueva estrena identificador propio.
  const conHilo = construirComando('claude', { sesion: 'abc-123' }).args;
  const okHilo = conHilo.includes('--resume') && conHilo.includes('abc-123')
    && !conHilo.includes('--session-id')
    && construirComando('claude', {}).args.includes('--session-id');
  console.log(`${okHilo ? 'OK  ' : 'FALLA'} construirComando: --sesion retoma el hilo y sin ella se estrena uno`);
  if (!okHilo) malos++;

  // Interpretar la salida es lo que vuelve observable la falla: si se pierde una denegación, el
  // consultante cree que la respuesta se hizo con todo lo disponible cuando no fue así.
  const s = interpretarSalida(JSON.stringify({
    type: 'result', result: 'hola', session_id: 'u-1', is_error: false, total_cost_usd: 0.5, num_turns: 3,
    permission_denials: [{ tool_name: 'Write' }],
  }));
  const roto = interpretarSalida('esto no es json');
  const okSalida = s.estructurada && s.respuesta === 'hola' && s.sesion === 'u-1' && !s.error
    && s.denegaciones.length === 1 && s.costo === 0.5 && s.turnos === 3
    && !roto.estructurada && roto.respuesta === 'esto no es json';
  console.log(`${okSalida ? 'OK  ' : 'FALLA'} interpretarSalida rescata denegaciones, hilo y costo, y marca lo que no es JSON`);
  if (!okSalida) malos++;

  // EL TURNO COMPLETO. El consultado contesta, le salta un aviso de cierre y contesta el aviso: con
  // `json` a secas volvía solo lo último («Listo, lo asenté») y la respuesta real se perdía.
  const turno = eventos(
    { type: 'system', subtype: 'init' },
    asistente('El saldo de julio es 1.234.'),
    { type: 'user', message: { content: [{ type: 'text', text: 'aviso de cierre' }] } },
    asistente('Listo, lo asenté.'),
    { type: 'result', is_error: false, result: 'Listo, lo asenté.', session_id: 'u-2', num_turns: 2 });
  const st = interpretarSalida(turno);
  const okTurno = !st.error && st.textos.length === 2 && st.respuesta.includes('1.234') && st.respuesta.includes('lo asenté');
  console.log(`${okTurno ? 'OK  ' : 'FALLA'} interpretarSalida devuelve todos los mensajes del turno, no solo el último`);
  if (!okTurno) { malos++; console.log('      ', JSON.stringify(st)); }

  // UNA FALLA DE LA API NO ES UNA RESPUESTA. Forma real medida el 16/11/2026 con una clave inválida:
  // el CLI emite el texto del error como si fuera un mensaje del consultado.
  const e401 = interpretarSalida(eventos(
    asistente('Invalid API key · Fix external API key'),
    { type: 'result', is_error: true, api_error_status: 401, result: 'Invalid API key · Fix external API key' }));
  const okFalla = e401.error && e401.motivo.startsWith('error 401, la clave de API no es válida')
    && e401.textos.length === 0;
  console.log(`${okFalla ? 'OK  ' : 'FALLA'} interpretarSalida marca el error de la API como falla y no como mensaje del consultado`);
  if (!okFalla) { malos++; console.log('      ', JSON.stringify(e401)); }

  const cortado = interpretarSalida(eventos(asistente('Empiezo a buscar…')));
  const okCorte = cortado.error && /antes de cerrar/.test(cortado.motivo);
  console.log(`${okCorte ? 'OK  ' : 'FALLA'} una corrida sin evento final es falla, no respuesta`);
  if (!okCorte) malos++;

  // Codex: forma real medida el 16/11/2026 (`codex exec --json`).
  const cxs = interpretarSalida(eventos(
    { type: 'thread.started', thread_id: 't-1' }, { type: 'turn.started' },
    { type: 'item.completed', item: { type: 'error', message: 'descripciones acortadas' } },
    { type: 'item.completed', item: { type: 'agent_message', text: 'hola' } },
    { type: 'turn.completed', usage: {} }), 'codex');
  const cxf = interpretarSalida(eventos({ type: 'turn.failed', error: { message: 'sin crédito' } }), 'codex');
  const okCodex = !cxs.error && cxs.respuesta === 'hola' && cxs.sesion === 't-1' && cxs.avisos.length === 1
    && cxf.error && cxf.motivo === 'sin crédito';
  console.log(`${okCodex ? 'OK  ' : 'FALLA'} interpretarSalida lee los eventos de codex y su falla`);
  if (!okCodex) { malos++; console.log('      ', JSON.stringify({ cxs, cxf })); }

  // LEER FUERA DE LA CARPETA. Medido: `--add-dir <archivo>` no abre nada y no avisa, así que un
  // archivo va como regla de lectura de ESE archivo; una carpeta, por `--add-dir`.
  const { rutaDeRegla, construirEntorno, citarParaShell, VARIABLE_CONSULTA } =
    require(path.resolve(ORIGEN, 'comunicar', 'comunicar.js'));
  const archivo = path.resolve(REPO_PRUEBA, '.claude', 'subsistemas', 'SUBSISTEMAS.md');
  const conLeer = construirComando('claude', { leer: [archivo, ABS] }).args;
  const iRead = conLeer.findIndex(a => a === `Read(${rutaDeRegla(archivo)})`);
  const okLeer = iRead > 0 && conLeer[iRead - 1] === '--allowedTools'
    && conLeer[conLeer.indexOf('--add-dir') + 1] === ABS
    && !conLeer.includes(archivo)                       // el archivo NO va por --add-dir
    && (process.platform !== 'win32' || rutaDeRegla('D:\\a b\\c.md') === '//d/a b/c.md')
    && !construirComando('claude', { modo: 'resolver', leer: [ABS] }).args.includes('--add-dir');
  console.log(`${okLeer ? 'OK  ' : 'FALLA'} --leer: un archivo abre solo ese archivo, una carpeta va por --add-dir, y resolver no lo usa`);
  if (!okLeer) { malos++; console.log('      ', JSON.stringify(conLeer)); }

  // LA MARCA DE CONSULTA. Contrato con el aviso de cierre del consultado: si la ve, no actúa.
  const ent = construirEntorno({ PATH: 'x', OTRA: 'y' });
  const okEnt = VARIABLE_CONSULTA === 'AMP_CONSULTA_ENTRE_AGENTES' && ent.AMP_CONSULTA_ENTRE_AGENTES === '1'
    && ent.PATH === 'x' && ent.OTRA === 'y';
  console.log(`${okEnt ? 'OK  ' : 'FALLA'} construirEntorno conserva el entorno de la máquina y suma ${VARIABLE_CONSULTA}=1`);
  if (!okEnt) malos++;

  // Las rutas de --leer son datos en la línea de comandos: se citan, y lo que no se puede citar sano
  // en Windows se rechaza.
  let rechazo = false;
  try { citarParaShell('C:\\100%\\x', 'win32'); } catch (e) { rechazo = true; }
  const okCita = rechazo && citarParaShell('C:\\a b\\', 'win32') === '"C:\\a b\\\\"'
    && citarParaShell('mcp__*', 'linux') === "'mcp__*'" && citarParaShell("a'b", 'linux') === "'a'\\''b'"
    && citarParaShell('-p', 'win32') === '-p';
  console.log(`${okCita ? 'OK  ' : 'FALLA'} citarParaShell cita por plataforma y rechaza lo que cmd expandiría`);
  if (!okCita) malos++;

  // El modo predeterminado es el que NO deja actuar: equivocarse hacia el lado seguro.
  const { op, sueltos } = leerOpciones(['contable', 'una pregunta', '--modelo', 'sonnet']);
  const okOp = op.modo === 'preguntar' && op.modelo === 'sonnet' && op.tope === 0
    && sueltos.length === 2 && sueltos[1] === 'una pregunta';
  console.log(`${okOp ? 'OK  ' : 'FALLA'} leerOpciones separa banderas de posicionales y arranca en modo preguntar`);
  if (!okOp) malos++;
}

// -- el mecanismo entero, contra un CLI doble ---------------------------------
// Las funciones puras no prueban lo que pasa de punta a punta: que la marca de consulta llegue al
// proceso hijo, que una falla de arranque salga SIN el rótulo de respuesta y con código 1, que el
// turno completo llegue a la salida. Se corre una copia del mecanismo dentro del banco —así lee el
// Índice sintético y no el del repo— contra un `claude` doble que va primero en el PATH. No se
// lanza ningún agente de verdad: no cuesta nada y no depende de la cuenta de la máquina.
console.log('\n== EL MECANISMO ENTERO, CONTRA UN CLI DOBLE ==');
armar();
{
  const COMUN = path.join(REPO_PRUEBA, '.claude', 'common');
  fs.mkdirSync(COMUN, { recursive: true });
  fs.copyFileSync(path.join('.claude', 'common', 'frontmatter.js'), path.join(COMUN, 'frontmatter.js'));
  fs.copyFileSync(path.join(ORIGEN, 'indice.js'), path.join(BANCO, 'indice.js'));
  fs.mkdirSync(path.join(BANCO, 'comunicar'), { recursive: true });
  fs.copyFileSync(path.join(ORIGEN, 'comunicar', 'comunicar.js'), path.join(BANCO, 'comunicar', 'comunicar.js'));

  // El doble: escribe la salida por eventos del escenario pedido y deja ver con qué entorno y qué
  // argumentos lo lanzaron.
  const DOBLE = path.resolve(REPO_PRUEBA, 'doble');
  const VACIO = path.resolve(REPO_PRUEBA, 'sin-cli');
  fs.mkdirSync(DOBLE, { recursive: true });
  fs.mkdirSync(VACIO, { recursive: true });
  fs.writeFileSync(path.join(DOBLE, 'claude-doble.js'), [
    "const ev = (o) => process.stdout.write(JSON.stringify(o) + '\\n');",
    "const txt = (t) => ev({ type: 'assistant', message: { content: [{ type: 'text', text: t }] } });",
    "const esc = process.env.DOBLE_ESCENARIO;",
    "if (esc === 'muerto') { process.stderr.write('el doble se rompió al arrancar\\n'); process.exit(3); }",
    "ev({ type: 'system', subtype: 'init' });",
    "if (esc === 'api401') { txt('Invalid API key'); ev({ type: 'result', is_error: true, api_error_status: 401, result: 'Invalid API key' }); process.exit(1); }",
    "txt('RESPUESTA-REAL marca=' + process.env.AMP_CONSULTA_ENTRE_AGENTES + ' args=' + JSON.stringify(process.argv.slice(2)));",
    "txt('contesto el aviso de cierre');",
    "ev({ type: 'result', is_error: false, result: 'contesto el aviso de cierre', session_id: 's-doble', num_turns: 2, total_cost_usd: 0 });",
  ].join('\n'));
  if (process.platform === 'win32') {
    fs.writeFileSync(path.join(DOBLE, 'claude.cmd'), '@node "%~dp0claude-doble.js" %*\r\n');
  } else {
    fs.writeFileSync(path.join(DOBLE, 'claude'), '#!/bin/sh\nexec node "$(dirname "$0")/claude-doble.js" "$@"\n');
    fs.chmodSync(path.join(DOBLE, 'claude'), 0o755);
  }
  conFilas(FILA_OK(), fila('Local-0002', 'mudado', 'Se mudó', DIR_INEXISTENTE, 'claude'));

  const nodeDir = path.dirname(process.execPath);
  const correrConDoble = (escenario, args, pathDe = DOBLE) => {
    const env = {};
    for (const [k, v] of Object.entries(process.env)) if (!/^path$/i.test(k)) env[k] = v;
    env.PATH = [pathDe, ...(pathDe === DOBLE ? [nodeDir] : [])].join(path.delimiter);
    env.DOBLE_ESCENARIO = escenario;
    delete env.AMP_CONSULTA_ENTRE_AGENTES;
    const r = cp.spawnSync(process.execPath, [path.join(BANCO, 'comunicar', 'comunicar.js'), ...args],
      { encoding: 'utf8', env });
    return { status: r.status, out: r.stdout || '', err: r.stderr || '' };
  };
  const esRespuesta = o => o.includes('── Respuesta de');
  const esFalla = o => /✖ "[^"]+" no contestó/.test(o);
  const verificar = (nombre, ok, r) => {
    console.log(`${ok ? 'OK  ' : 'FALLA'} ${nombre}`);
    if (!ok) { malos++; console.log('       status', r.status, '\n', r.out.slice(0, 600), '\n', r.err.slice(0, 300)); }
  };

  const bien = correrConDoble('turno', ['contable', 'cuánto hay']);
  verificar('la respuesta trae el turno completo, no solo el último mensaje',
    bien.status === 0 && esRespuesta(bien.out) && bien.out.includes('RESPUESTA-REAL') && bien.out.includes('aviso de cierre'), bien);
  verificar('el consultado corre con AMP_CONSULTA_ENTRE_AGENTES=1 en su entorno',
    bien.out.includes('marca=1'), bien);

  const material = path.resolve(REPO_PRUEBA, '.claude', 'subsistemas', 'SUBSISTEMAS.md');
  const leido = correrConDoble('turno', ['contable', 'leé esto', '--leer', material, '--leer', ABS]);
  verificar('--leer llega al CLI: el archivo como regla de lectura y la carpeta por --add-dir, con espacios intactos',
    leido.status === 0 && leido.out.includes('Read(') && leido.out.includes('--add-dir')
    && leido.out.includes(JSON.stringify(ABS).slice(1, -1)), leido);

  const conResolver = correrConDoble('turno', ['contable', 'hacé algo', '--modo', 'resolver', '--leer', ABS]);
  verificar('--leer se rechaza en modo resolver', conResolver.status === 2 && !esRespuesta(conResolver.out), conResolver);

  const e401 = correrConDoble('api401', ['contable', 'hola']);
  verificar('un error 401 sale como falla, sin el rótulo de respuesta, y con código 1',
    e401.status === 1 && esFalla(e401.out) && !esRespuesta(e401.out) && e401.out.includes('error 401'), e401);

  const muerto = correrConDoble('muerto', ['contable', 'hola']);
  verificar('un CLI que muere al arrancar sale como falla con su motivo',
    muerto.status === 1 && esFalla(muerto.out) && !esRespuesta(muerto.out) && muerto.out.includes('el doble se rompió'), muerto);

  const sinCli = correrConDoble('turno', ['contable', 'hola'], VACIO);
  verificar('un CLI no instalado sale como falla, no como respuesta vacía',
    sinCli.status === 1 && esFalla(sinCli.out) && !esRespuesta(sinCli.out), sinCli);

  const mudado = correrConDoble('turno', ['mudado', 'hola']);
  verificar('una carpeta que ya no existe sale como falla antes de lanzar nada',
    mudado.status === 1 && esFalla(mudado.out) && mudado.out.includes('no existe'), mudado);
}

// -- el buscador de instalaciones -------------------------------------------
// Se le pasan los candidatos armados en vez de dejarlo leer `~/.claude.json` y el rastro de Codex:
// leídos de la máquina, el resultado depende de qué repos vio esta PC y el banco no podría afirmar
// nada. Lo que se prueba es el FILTRADO, que es lo que decide qué se le ofrece al usuario.
console.log('\n== EL BUSCADOR DE INSTALACIONES ==');
armar();
{
  const raizFalsos = path.join(REPO_PRUEBA, 'falsos');
  // Una instalación de verdad: la señal es el catálogo de subsistemas, no `.claude/` a secas.
  const instalacion = (nombre, identidad) => {
    const d = path.resolve(raizFalsos, nombre);
    fs.mkdirSync(path.join(d, '.claude', 'subsistemas'), { recursive: true });
    fs.writeFileSync(path.join(d, '.claude', 'subsistemas', 'SUBSISTEMAS.md'), '# Subsistemas\n');
    if (identidad) fs.writeFileSync(path.join(d, '.claude', 'identidad.md'), identidad);
    return d;
  };
  // Un repo que vio Claude Code alguna vez: tiene `.claude/` y nada del harness adentro. Es el caso
  // que separa el control de uno que mirara solo `.claude/` — ahí entrarían decenas de repos.
  const soloClaudeDir = path.resolve(raizFalsos, 'sin-harness');
  fs.mkdirSync(path.join(soloClaudeDir, '.claude'), { recursive: true });

  const conHarness = instalacion('contable', '# Contabilidad Personal\n\nPropósito: Llevar las cuentas.\n');
  const sinIdentidad = instalacion('mudo', null);
  conFilas(fila('Local-0001', 'contable', 'Llevar las cuentas', conHarness, 'claude'));

  const { buscarAgentes, clave } = require(path.resolve(ORIGEN, 'buscar', 'buscar.js'));
  const hallados = buscarAgentes(ABS, {
    claude: [conHarness, soloClaudeDir, path.join(ABS, 'no-existe-xyz')],
    codex: [conHarness, sinIdentidad, ABS],
  });
  const por = d => hallados.find(a => clave(a.directorio) === clave(d));

  const okSenal = hallados.length === 3 && !por(soloClaudeDir);
  console.log(`${okSenal ? 'OK  ' : 'FALLA'} buscarAgentes descarta el repo con .claude/ pero sin el catálogo de subsistemas`);
  if (!okSenal) { malos++; console.log('      ', JSON.stringify(hallados.map(a => a.directorio))); }

  // Un directorio que aparece en las dos fuentes es UNA instalación con dos CLI, no dos candidatos:
  // el CLI lo dice la fuente, y quien registre elige.
  const c = por(conHarness) || {};
  const okDoble = JSON.stringify(c.clis) === '["claude","codex"]' && c.titulo === 'Contabilidad Personal';
  console.log(`${okDoble ? 'OK  ' : 'FALLA'} el candidato de las dos fuentes se une con los dos CLI y trae su Identidad`);
  if (!okDoble) { malos++; console.log('      ', JSON.stringify(c)); }

  // Lo ya registrado y el propio repo se MARCAN, no se esconden: filtrarlos de entrada haría que la
  // salida dijera "1 instalación" cuando hay 3, y nadie podría explicar la diferencia.
  const okMarcas = c.yaRegistradoComo === 'contable' && !c.esEsteRepo
    && (por(ABS) || {}).esEsteRepo === true
    && (por(sinIdentidad) || {}).sinIdentidad === true
    && (por(sinIdentidad) || {}).yaRegistradoComo === null;
  console.log(`${okMarcas ? 'OK  ' : 'FALLA'} marca el ya registrado, el repo propio y el que no declara Identidad`);
  if (!okMarcas) { malos++; console.log('      ', JSON.stringify(hallados, null, 1)); }

  // Windows escribe la misma ruta de varias formas. Sin normalizar, el mismo repo se ofrecería dos
  // veces y el ya registrado no se reconocería (la fila lo guarda con la forma que tipeó el usuario).
  const otraForma = conHarness.replace(/\\/g, '/').toUpperCase();
  const dosFormas = buscarAgentes(ABS, { claude: [conHarness], codex: [otraForma] });
  const okNorm = dosFormas.length === 1 && dosFormas[0].yaRegistradoComo === 'contable';
  console.log(`${okNorm ? 'OK  ' : 'FALLA'} la misma ruta escrita distinto es un solo candidato y se reconoce como registrada`);
  if (!okNorm) { malos++; console.log('      ', JSON.stringify(dosFormas.map(a => a.directorio))); }
}

fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
console.log(`\ncasos: ${casos.length + 6} + 4 mecanismos (indice, comunicar, buscar y sus funciones puras) + el mecanismo entero contra un CLI doble`);
console.log(malos ? `${malos} FALLARON.` : 'TODO VERDE.');
process.exit(malos ? 1 : 0);
