// Prueba cada control de lint-conocimiento contra un caso malo y uno bueno. Un lint que lee mal
// contesta en verde sobre un conjunto vacio, asi que verde no prueba nada por si solo: cada control
// tiene que ENCENDERSE ante su defecto, y solo ante el suyo.
//
// El banco es un REPO DE PRUEBA con su propio `.claude/`, no una copia suelta de la carpeta: el lint
// resuelve las referencias contra la raiz del repo, asi que sin eso una ref rota podria resolver
// contra el repo real y el caso no seria aislado.
//
// Cada prueba es autonoma a proposito, sin andamiaje compartido con las otras: un modulo comun roto
// apagaria todas las pruebas a la vez, que es justo el modo de falla que estas pruebas existen para
// evitar.
//
// Uso: node .claude/conocimiento/lint-conocimiento/pruebas.js   (desde la raíz del repo)
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ORIGEN = '.claude/conocimiento';
const REPO_PRUEBA = '.claude/tmp/repo-prueba-conocimiento';
const BANCO = path.join(REPO_PRUEBA, '.claude', 'conocimiento');
const LINT = '.claude/conocimiento/lint-conocimiento/lint-conocimiento.js';

// Se copia `.claude/` ENTERA, no solo `conocimiento/`: las páginas del subsistema referencian otros
// —`../semantica/README.md`, `../herramientas/README.md`— y con el banco recortado esas referencias
// aparecían rotas de arranque, así que el caso bueno nunca podía dar cero. Medido: 3 de base.
// Se saltea `tmp` porque el banco vive ahí adentro (copiarla sería copiarla dentro de sí misma) y
// las carpetas de planes, que pesan más que todo el resto y este lint no las mira.
function armar() {
  fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
  const salteados = new Set(['tmp', 'pendientes', 'ejecutados', 'descartados']);
  fs.mkdirSync(path.join(REPO_PRUEBA, '.claude'), { recursive: true });
  for (const e of fs.readdirSync('.claude', { withFileTypes: true })) {
    if (salteados.has(e.name)) continue;
    fs.cpSync(path.join('.claude', e.name), path.join(REPO_PRUEBA, '.claude', e.name), {
      recursive: true,
      filter: src => !salteados.has(path.basename(src)),
    });
  }
  fs.rmSync(path.join(BANCO, 'lint-conocimiento'), { recursive: true, force: true });
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
  () => escribir('buscar-con-acentos-en-windows.md',
    leer('buscar-con-acentos-en-windows.md') + '\nVer [la página que no está](pagina-que-no-existe.md).\n'));

// El índice tiene que reclamar una página nueva, y la página tiene que quedar marcada como no
// referenciada: son dos controles distintos y el mismo defecto los enciende a los dos.
caso('página nueva que el índice no lista', 'INDICE INCOMPLETO',
  () => fs.writeFileSync(path.join(BANCO, 'pagina-sin-indexar.md'), '# Sin indexar\n\nNadie la lista.\n'));

caso('columna declarada que la tabla no tiene', 'INDICES DECLARADOS',
  () => escribir('INDICE.md', leer('INDICE.md').replace(
    /^columnas: \[(.+)\]$/m, 'columnas: [$1, Inventada]')));

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
console.log('\n== CASO BUENO: resuelve contra el repo que se le pasa ==');
armar();
{
  // `AGENTS.md` existe en el repo real pero NO en el banco: si el lint mirara el repo real, esta
  // referencia resolveria y el control no diria nada.
  escribir('buscar-con-acentos-en-windows.md',
    leer('buscar-con-acentos-en-windows.md') + '\nVer [el punto de entrada](../../AGENTS.md).\n');
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
  fs.writeFileSync(path.join(BANCO, 'pagina-del-segundo-indice.md'), '# Pagina del segundo Indice\n\nSolo la lista uno de los dos.\n');
  escribir('INDICE-LOCAL.md', leer('INDICE-LOCAL.md').trimEnd() +
    '\n| Local-9999 | Pagina del segundo Indice | Solo la lista uno de los dos. | [pagina-del-segundo-indice.md](pagina-del-segundo-indice.md) |\n');
  const h = hallazgos(correr());
  const n = (h['INDICE INCOMPLETO'] || 0) + (h['HUERFANOS'] || 0);
  console.log(`${n === 0 ? 'OK  ' : 'FALLA'} pagina listada solo en INDICE-LOCAL.md → ${n} reclamo(s) de indice (0 esperados)`);
  if (n !== 0) malos++;
}

fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
console.log(`\ncasos: ${casos.length + 3}`);
console.log(malos ? `${malos} FALLARON.` : 'TODO VERDE.');
process.exit(malos ? 1 : 0);
