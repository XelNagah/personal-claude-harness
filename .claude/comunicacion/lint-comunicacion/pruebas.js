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
    && par('--output-format') === 'json'            // sin esto la falla no es observable
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
    result: 'hola', session_id: 'u-1', is_error: false, total_cost_usd: 0.5, num_turns: 3,
    permission_denials: [{ tool_name: 'Write' }],
  }));
  const roto = interpretarSalida('esto no es json');
  const okSalida = s.estructurada && s.respuesta === 'hola' && s.sesion === 'u-1'
    && s.denegaciones.length === 1 && s.costo === 0.5 && s.turnos === 3
    && !roto.estructurada && roto.respuesta === 'esto no es json';
  console.log(`${okSalida ? 'OK  ' : 'FALLA'} interpretarSalida rescata denegaciones, hilo y costo, y marca lo que no es JSON`);
  if (!okSalida) malos++;

  // El modo predeterminado es el que NO deja actuar: equivocarse hacia el lado seguro.
  const { op, sueltos } = leerOpciones(['contable', 'una pregunta', '--modelo', 'sonnet']);
  const okOp = op.modo === 'preguntar' && op.modelo === 'sonnet' && op.tope === 0
    && sueltos.length === 2 && sueltos[1] === 'una pregunta';
  console.log(`${okOp ? 'OK  ' : 'FALLA'} leerOpciones separa banderas de posicionales y arranca en modo preguntar`);
  if (!okOp) malos++;
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
console.log(`\ncasos: ${casos.length + 2} + 4 mecanismos (indice, comunicar, buscar y sus funciones puras)`);
console.log(malos ? `${malos} FALLARON.` : 'TODO VERDE.');
process.exit(malos ? 1 : 0);
