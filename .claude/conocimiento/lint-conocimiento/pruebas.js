// Prueba cada control de lint-conocimiento contra un caso malo y uno bueno. Un lint que lee mal
// contesta en verde sobre un conjunto vacio, asi que verde no prueba nada por si solo: cada control
// tiene que ENCENDERSE ante su defecto, y solo ante el suyo.
//
// El banco es un REPO DE PRUEBA con su propio `.claude/`, no una carpeta suelta: el lint resuelve las
// referencias contra la raiz del repo, asi que sin eso una ref rota podria resolver contra el repo
// real y el caso no seria aislado.
//
// EL BANCO FABRICA SU BASE DE CONOCIMIENTO. Antes copiaba el `.claude/` del repo que lo corre y
// rompia paginas REALES por su nombre de archivo. Las paginas y el Indice del Agente Desplegado son
// Aprendizaje de cada repo: en el destino esos nombres no existen, y ademas el caso bueno —«el banco
// intacto da cero»— pasaba a medir la salud de la base de conocimiento del repo destino, que este
// banco no tiene por que juzgar (para eso esta el lint corriendo sobre el repo). Es la forma
// «escenario prestado» del conocimiento `controles-que-no-avisan`, y la Decision `Local-0075` es la
// que la prohibe para todos los bancos que viajan.
//
// Cada prueba es autonoma a proposito, sin andamiaje compartido con las otras: un modulo comun roto
// apagaria todas las pruebas a la vez, que es justo el modo de falla que estas pruebas existen para
// evitar. Por eso el escenario se fabrica aca adentro y no en un ayudante compartido entre bancos.
//
// Lo unico que se toma del subsistema instalado es el `MANIFIESTO.md`, Componente del Agente
// Multiproposito e igual en todas las instalaciones, y que es ademas lo que el control de Indices
// declarados contrasta. El `README.md` NO se copia: el lint le revisa las referencias como a
// cualquier pagina, y el real apunta a otros subsistemas que el banco no fabrica.
//
// Uso: node .claude/conocimiento/lint-conocimiento/pruebas.js   (desde la raíz del repo)
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ORIGEN = '.claude/conocimiento';
const REPO_PRUEBA = '.claude/tmp/repo-prueba-conocimiento';
const BANCO = path.join(REPO_PRUEBA, '.claude', 'conocimiento');
const LINT = '.claude/conocimiento/lint-conocimiento/lint-conocimiento.js';

const DEL_SUBSISTEMA = ['MANIFIESTO.md'];
const IDX = 'INDICE.md', LOCAL = 'INDICE-LOCAL.md';
// Las paginas sinteticas, nombradas una sola vez: ningun caso vuelve a escribir un nombre de archivo.
const PAGINA_BASE = 'como-se-cuentan-los-remitos.md';
const PAGINA_LOCAL = 'el-cierre-del-mes.md';

const frontmatter = (nombre, origen) => '---\nindice: ' + nombre + '\norigen: ' + origen + '\n'
  + 'columnas: [Código, Nombre, Descripción, Detalle]\ndescripcion: de qué trata la página\n---\n\n';
const CABECERA = '| Código | Nombre | Descripción | Detalle |\n|---|---|---|---|\n';

function indiceBase() {
  return frontmatter('Índice de la base de conocimiento', 'agente-multiproposito')
    + '# Índice de la base de conocimiento\n\nDatos sintéticos: este índice existe solo para romperlo.\n\n'
    + CABECERA
    + `| Base-0001 | Cómo se cuentan los remitos | El recorrido con que se cuentan los remitos del período. | [${PAGINA_BASE}](${PAGINA_BASE}) |\n`;
}
function indiceLocal() {
  return frontmatter('Páginas del Agente Desplegado', 'agente-desplegado')
    + '# Páginas del Agente Desplegado\n\nDatos sintéticos: este índice existe solo para romperlo.\n\n'
    + CABECERA
    + `| Local-0001 | El cierre del mes | Qué se congela al cerrar el mes y qué queda abierto. | [${PAGINA_LOCAL}](${PAGINA_LOCAL}) |\n`;
}
const pagina = titulo => `# ${titulo}\n\nDatos sintéticos: esta página existe solo para romperla.\n`;

function armar() {
  fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
  fs.mkdirSync(BANCO, { recursive: true });
  for (const f of DEL_SUBSISTEMA) {
    const src = path.join(ORIGEN, f);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(BANCO, f));
  }
  escribir(IDX, indiceBase());
  escribir(LOCAL, indiceLocal());
  escribir(PAGINA_BASE, pagina('Cómo se cuentan los remitos'));
  escribir(PAGINA_LOCAL, pagina('El cierre del mes'));
}
const leer = f => fs.readFileSync(path.join(BANCO, f), 'utf8');
const escribir = (f, t) => fs.writeFileSync(path.join(BANCO, f), t);

function correr() {
  const r = cp.spawnSync('node', [LINT, BANCO], { encoding: 'utf8' });
  return (r.stdout || '') + (r.stderr || '');
}
// hallazgos por seccion: el formato es `[N] TITULO (M):`
function hallazgos(salida) {
  const out = {};
  for (const m of salida.matchAll(/^\[\d+\] (.+?) \((\d+)\):/gm)) out[m[1].trim()] = parseInt(m[2], 10);
  return out;
}
const total = h => Object.values(h).reduce((a, b) => a + b, 0);

let malos = 0;

console.log('== CASO BUENO: el banco intacto da cero ==');
armar();
{
  const h = hallazgos(correr());
  const t = total(h);
  console.log(`${t === 0 ? 'OK  ' : 'FALLA'} banco sin tocar → ${t} hallazgos${t ? '  ' + JSON.stringify(h) : ''}`);
  if (t !== 0) malos++;
}

const casos = [];
const caso = (nombre, seccion, romper) => casos.push({ nombre, seccion, romper });

caso('página con un link a un archivo que no existe', 'REFS ROTAS',
  () => escribir(PAGINA_BASE, leer(PAGINA_BASE) + '\nVer [la página que no está](pagina-que-no-existe.md).\n'));

// El índice tiene que reclamar una página nueva, y la página tiene que quedar marcada como no
// referenciada: son dos controles distintos y el mismo defecto los enciende a los dos.
caso('página nueva que el índice no lista', 'INDICE INCOMPLETO',
  () => escribir('pagina-sin-indexar.md', pagina('Sin indexar')));

caso('columna declarada que la tabla no tiene', 'INDICES DECLARADOS',
  () => escribir(IDX, leer(IDX).replace(/^columnas: \[(.+)\]$/m, 'columnas: [$1, Inventada]')));

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

// -- CASO BUENO fino: el repo que se mira es el que se le pasa ---------------
// Regresion del 30/07/2026: el lint deducia el repo de su propia ubicacion, asi que una referencia
// podia resolver contra el repo real y darse por buena sin que el archivo existiera en el banco.
// El testigo es `AGENTS.md`, el punto de entrada que `amp:inicializar` escribe en la raiz de todo
// Agente Desplegado: existe en el repo real y NO en el banco. Si el repo que corre las pruebas no lo
// tuviera, el caso pasaria en verde sin distinguir nada, asi que se saltea diciendolo en vez de
// afirmar lo que no midio.
console.log('\n== CASO BUENO: resuelve contra el repo que se le pasa ==');
if (!fs.existsSync('AGENTS.md')) {
  console.log('SALTEADO  este repo no tiene AGENTS.md en la raíz: sin testigo, el caso no distinguiría nada');
} else {
  armar();
  escribir(PAGINA_BASE, leer(PAGINA_BASE) + '\nVer [el punto de entrada](../../AGENTS.md).\n');
  const h = hallazgos(correr());
  const n = h['REFS ROTAS'] || 0;
  console.log(`${n === 1 ? 'OK  ' : 'FALLA'} ref a un archivo que solo existe en el repo real → ${n} rota(s) (1 esperada)`);
  if (n !== 1) malos++;
}

// -- CASO BUENO fino: una carpeta con DOS Indices ----------------------------
// El subsistema tiene un Indice por origen en la misma carpeta. Si el lint guardara un solo Indice
// por carpeta, el segundo taparia al primero y todas las paginas del tapado se reportarian como no
// listadas. Se afirma que no avisa POR ESTO, no que no avisa nada: una pagina listada en uno solo
// de los dos Indices esta listada.
console.log('\n== CASO BUENO: una pagina listada en el segundo Indice no se reclama ==');
armar();
{
  const nueva = 'pagina-del-segundo-indice.md';
  escribir(nueva, pagina('Página del segundo Índice'));
  escribir(LOCAL, leer(LOCAL).trimEnd() +
    `\n| Local-0002 | Página del segundo Índice | Solo la lista uno de los dos. | [${nueva}](${nueva}) |\n`);
  const h = hallazgos(correr());
  const n = (h['INDICE INCOMPLETO'] || 0) + (h['HUERFANOS'] || 0);
  console.log(`${n === 0 ? 'OK  ' : 'FALLA'} pagina listada solo en INDICE-LOCAL.md → ${n} reclamo(s) de indice (0 esperados)`);
  if (n !== 0) malos++;
}

fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
console.log(`\ncasos: ${casos.length + 3}`);
console.log(malos ? `${malos} FALLARON.` : 'TODO VERDE.');
process.exit(malos ? 1 : 0);
