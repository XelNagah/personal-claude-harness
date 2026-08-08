// Prueba cada control de lint-comunicacion contra un caso malo y uno bueno, más las dos funciones
// puras del subsistema (`leerIndice` de indice.js y `construirComando` del mecanismo de consulta).
// Un lint que lee mal contesta en verde sobre un conjunto vacío, así que verde no prueba nada por sí
// solo: cada control tiene que ENCENDERSE ante su defecto, y solo ante el suyo.
//
// El banco es un REPO DE PRUEBA con `.claude/` entera (los controles de forma del Índice usan el
// manifiesto y el módulo común). El Índice de este repo viaja sin filas, así que los casos con fila
// las AGREGAN sobre una fila válida que apunta al propio repo de prueba (que tiene su `.claude/`).
//
// Uso: node .claude/comunicacion/lint-comunicacion/pruebas.js   (desde la raíz del repo)
const fs = require('fs'), path = require('path'), cp = require('child_process');
const REPO_PRUEBA = '.claude/tmp/repo-prueba-comunicacion';
const BANCO = path.join(REPO_PRUEBA, '.claude', 'comunicacion');
const LINT = '.claude/comunicacion/lint-comunicacion/lint-comunicacion.js';

const ABS = path.resolve(REPO_PRUEBA);                 // tiene .claude/  → Directorio válido
const DIR_SIN_CLAUDE = path.join(ABS, '.claude');      // existe, pero sin .claude/ adentro
const DIR_INEXISTENTE = path.join(ABS, 'no-existe-xyz');

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
  fs.rmSync(path.join(BANCO, 'lint-comunicacion'), { recursive: true, force: true });
}
const reg = () => fs.readFileSync(path.join(BANCO, 'INDICE.md'), 'utf8');
const escribir = t => fs.writeFileSync(path.join(BANCO, 'INDICE.md'), t);
// Agrega filas al Índice (que viaja sin ninguna): se pegan después del renglón separador `|---|`.
const fila = (cod, nom, prop, dir, cli) => `| ${cod} | ${nom} | ${prop} | ${dir} | ${cli} |`;
function conFilas(...filas) {
  const t = reg();
  const lineas = t.split(/\r?\n/);
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
console.log('\n== FUNCIONES PURAS ==');
armar();
conFilas(fila('Local-0001', 'Contable', 'Lleva la contabilidad', ABS, 'Claude'));
{
  // Se requiere desde el BANCO para no cachear el módulo del repo real y leer el Índice del banco.
  const { leerIndice, CLIS_SOPORTADOS } = require(path.resolve(BANCO, 'indice.js'));
  const filas = leerIndice(BANCO);
  const f = filas[0] || {};
  const ok = filas.length === 1 && f.nombre === 'Contable' && f.directorio === ABS
    && f.cli === 'claude' && f.codigo === 'Local-0001';   // el CLI se normaliza a minúscula
  console.log(`${ok ? 'OK  ' : 'FALLA'} leerIndice parsea la fila por nombre de columna y normaliza el CLI`);
  if (!ok) { malos++; console.log('      ', JSON.stringify(f)); }

  const vacio = leerIndice(path.join(ABS, 'no-existe')).length === 0;
  console.log(`${vacio ? 'OK  ' : 'FALLA'} leerIndice sobre un Índice ausente devuelve lista vacía sin error`);
  if (!vacio) malos++;

  const { construirComando } = require(path.resolve(BANCO, 'consultar', 'consultar.js'));
  const cl = construirComando('claude'), cx = construirComando('codex');
  const okCmd = cl && cl.archivo === 'claude' && cl.args.includes('plan') && cl.args.includes('Read')
    && cx && cx.archivo === 'codex' && cx.args.includes('read-only')
    && construirComando('gemini') === null
    && CLIS_SOPORTADOS.length === 2;
  console.log(`${okCmd ? 'OK  ' : 'FALLA'} construirComando arma solo lectura para los soportados y null para el resto`);
  if (!okCmd) malos++;
}

fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
console.log(`\ncasos: ${casos.length + 2} + 3 funciones puras`);
console.log(malos ? `${malos} FALLARON.` : 'TODO VERDE.');
process.exit(malos ? 1 : 0);
