// Prueba cada control de lint-decisiones contra un caso malo y uno bueno. Un lint que lee mal
// contesta en verde sobre un conjunto vacio, asi que verde no prueba nada por si solo: cada control
// tiene que ENCENDERSE ante su defecto, y solo ante el suyo.
//
// El banco es un REPO DE PRUEBA con `.claude/` entera: las decisiones referencian archivos de otros
// subsistemas, y con el banco recortado esas referencias aparecerian rotas de arranque.
//
// Uso: node .claude/decisiones/lint-decisiones/pruebas.js   (desde la raíz del repo)
const fs = require('fs'), path = require('path'), cp = require('child_process');
const REPO_PRUEBA = '.claude/tmp/repo-prueba-decisiones';
const BANCO = path.join(REPO_PRUEBA, '.claude', 'decisiones');
const LINT = '.claude/decisiones/lint-decisiones/lint-decisiones.js';

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
  fs.rmSync(path.join(BANCO, 'lint-decisiones'), { recursive: true, force: true });
}
const reg = () => fs.readFileSync(path.join(BANCO, 'INDICE.md'), 'utf8');
const escribir = t => fs.writeFileSync(path.join(BANCO, 'INDICE.md'), t);

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

caso('código repetido', 'NUMERACION',
  () => escribir(reg().replace('| Local-0003 |', '| Local-0002 |')));

caso('Detalle que apunta a un archivo que no existe', 'LINKS DE DETALLE ROTOS',
  () => escribir(reg().replace('[0020-test-de-demarcacion.md](0020-test-de-demarcacion.md)',
    '[0020-que-no-existe.md](0020-que-no-existe.md)')));

caso('página de detalle que ninguna fila referencia', 'PAGINAS HUERFANAS',
  () => fs.writeFileSync(path.join(BANCO, '0099-decision-suelta.md'), '# Suelta\n\nNadie la referencia.\n'));

caso('reemplazada por una decisión que no existe', 'REEMPLAZOS ROTOS',
  () => escribir(reg().replace('| 2026-07-23 | reemplazada por 0023 |', '| 2026-07-23 | reemplazada por 9999 |')));

caso('Nombre duplicado', 'NOMBRES VACIOS O DUPLICADOS',
  () => escribir(reg().replace(/(\| Local-0005 \| )[^|]+(\|)/, '$1Gobernanza de terminología $2')));

caso('columna declarada que la tabla no tiene', 'INDICES DECLARADOS',
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

// -- CASO BUENO fino: las tuberias escapadas no corren las columnas ----------
// El registro de decisiones tiene celdas que nombran columnas adentro del texto, escapadas con `\|`.
// Si el lint las tomara como separador, correria el Estado y el Detalle de esas filas.
console.log('\n== CASO BUENO: una celda con tubería escapada no corre las columnas ==');
armar();
{
  const h = hallazgos(correr());
  const t = total(h);
  console.log(`${t === 0 ? 'OK  ' : 'FALLA'} el registro real ya trae celdas con \\| y da ${t} hallazgos`);
  if (t !== 0) malos++;
}

fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
console.log(`\ncasos: ${casos.length + 2}`);
console.log(malos ? `${malos} FALLARON.` : 'TODO VERDE.');
process.exit(malos ? 1 : 0);
