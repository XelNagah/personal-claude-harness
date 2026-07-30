// Prueba cada control de lint-harness contra un caso malo y uno bueno. Un lint que lee mal contesta
// en verde sobre un conjunto vacio, asi que verde no prueba nada por si solo: cada control tiene que
// ENCENDERSE ante su defecto, y solo ante el suyo.
//
// El banco es un REPO DE PRUEBA: `lint-harness` mira el repo entero (punto de entrada, marketplace,
// REGISTRO, `funcionalidades/` y los manifiestos), asi que se copia lo que necesita y se corre con el
// directorio de trabajo puesto ahi. Se copia selectivamente porque los planes pesan mas que todo lo
// demas junto y este lint no los mira.
//
// Uso: node .claude/herramientas/lint-harness/pruebas.js   (desde la raíz del repo)
const fs = require('fs'), path = require('path'), cp = require('child_process');
const REPO_PRUEBA = path.resolve('.claude/tmp/repo-prueba-harness');
const LINT = path.resolve('.claude/herramientas/lint-harness/lint-harness.js');

// Lo que el lint mira. De `.claude/` alcanzan los manifiestos, semantica (los terminos vetados) y
// preferencias (la Base que compara contra las plantillas).
function armar() {
  fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
  fs.mkdirSync(REPO_PRUEBA, { recursive: true });
  for (const f of ['AGENTS.md', 'CLAUDE.md', 'REGISTRO.md', 'README.md']) {
    if (fs.existsSync(f)) fs.cpSync(f, path.join(REPO_PRUEBA, f));
  }
  fs.cpSync('.claude-plugin', path.join(REPO_PRUEBA, '.claude-plugin'), { recursive: true });
  fs.cpSync('funcionalidades', path.join(REPO_PRUEBA, 'funcionalidades'), { recursive: true });
  // `.claude/` se copia ENTRADA POR ENTRADA, no de una: el repo de prueba vive en `.claude/tmp/` —donde el
  // repo guarda sus temporales— y copiar `.claude/` entera ahí adentro es copiarla dentro de sí
  // misma, que Node rechaza. Salteando `tmp` en el nivel de arriba, el conflicto desaparece.
  // Se saltean además las carpetas de planes, que pesan más que todo el resto junto y este lint no mira.
  const salteados = new Set(['tmp', 'pendientes', 'ejecutados', 'descartados']);
  fs.mkdirSync(path.join(REPO_PRUEBA, '.claude'), { recursive: true });
  for (const e of fs.readdirSync('.claude', { withFileTypes: true })) {
    if (salteados.has(e.name)) continue;
    fs.cpSync(path.join('.claude', e.name), path.join(REPO_PRUEBA, '.claude', e.name), {
      recursive: true,
      filter: src => !salteados.has(path.basename(src)),
    });
  }
}
const leer = f => fs.readFileSync(path.join(REPO_PRUEBA, f), 'utf8');
const escribir = (f, t) => fs.writeFileSync(path.join(REPO_PRUEBA, f), t);

function correr() {
  const r = cp.spawnSync('node', [LINT], { cwd: REPO_PRUEBA, encoding: 'utf8', timeout: 120000 });
  return (r.stdout || '') + (r.stderr || '');
}
function hallazgos(salida) {
  const out = {};
  for (const m of salida.matchAll(/^\[([^\]]+)\] \((\d+)\)$/gm)) out[m[1]] = parseInt(m[2], 10);
  return out;
}
const total = h => Object.values(h).reduce((a, b) => a + b, 0);

let malos = 0;
const PLANTILLA = 'funcionalidades/amp/skills/inicializar/PLANTILLA.md';

// -- CASO BUENO: el repo de prueba intacto da cero --------------------------------
// Salvo el control de versiones, que compara contra los plugins instalados EN LA MAQUINA: en un
// repo de prueba no hay ninguno instalado, asi que ese control no aplica y se ignora a proposito.
const IGNORAR = 'VERSION EN DISCO DISTINTA DE LA INSTALADA';
console.log('== CASO BUENO: el repo de prueba intacto da cero ==');
armar();
{
  const h = hallazgos(correr());
  delete h[IGNORAR];
  const t = total(h);
  console.log(`${t === 0 ? 'OK  ' : 'FALLA'} repo de prueba sin tocar → ${t} hallazgos${t ? '  ' + JSON.stringify(h) : ''}`);
  if (t !== 0) malos++;
}

// -- CASOS MALOS -----------------------------------------------------------
const casos = [];
const caso = (nombre, seccion, romper) => casos.push({ nombre, seccion, romper });

// El control que se agregó el 30/07/2026, y el motivo por el que se agregó: nadie comparaba el
// script embebido en una PLANTILLA contra el instalado en `.claude/`, así que arreglar un lint y
// olvidar su copia dejaba el defecto viajando con el control de cierre en verde.
caso('script embebido que difiere del instalado', 'SCRIPT EMBEBIDO DISTINTO DEL INSTALADO EN .claude/',
  () => fs.appendFileSync(path.join(REPO_PRUEBA, '.claude/subsistemas/lint-subsistemas/lint-subsistemas.js'),
    '\n// divergencia que la copia embebida no tiene\n'));

caso('funcionalidad en REGISTRO sin carpeta en disco', 'FANTASMAS (catalogadas pero sin carpeta)',
  () => fs.rmSync(path.join(REPO_PRUEBA, 'funcionalidades/amp-conducta'), { recursive: true, force: true }));

caso('manifiesto que engordó', 'MANIFIESTOS QUE ENGORDARON (> 220 palabras)',
  () => escribir('.claude/decisiones/MANIFIESTO.md',
    leer('.claude/decisiones/MANIFIESTO.md') + '\n' + 'palabra '.repeat(250) + '\n'));

caso('manifiesto sin el campo Disparador', 'MANIFIESTOS SIN CAMPOS MINIMOS (dec. 0019)',
  () => escribir('.claude/decisiones/MANIFIESTO.md',
    leer('.claude/decisiones/MANIFIESTO.md').replace(/\*\*Disparador:\*\*/g, 'Cuando conviene:')));

caso('cita a una decisión del harness en texto que viaja', 'CITAS A DECISIONES DEL HARNESS EN DISTRIBUIBLES (dec. 0024)',
  () => escribir(PLANTILLA, leer(PLANTILLA).replace(/^# /m, 'Ver la decisión 0017 para el detalle.\n\n# ')));

caso('término vetado en el texto que viaja', 'TERMINOLOGIA VETADA EN EL TEXTO QUE VIAJA (funcionalidades/)',
  () => escribir('funcionalidades/amp/README.md',
    leer('funcionalidades/amp/README.md') + '\nEste repo tiene mucho churn.\n'));

caso('adaptador CLAUDE.md que dejó de importar AGENTS.md', 'PUNTO DE ENTRADA (AGENTS.md + adaptador CLAUDE.md)',
  () => escribir('CLAUDE.md', '# Instrucciones propias\n\nSin importar nada.\n'));

console.log('\n== CASOS MALOS: cada control se enciende ante su defecto ==');
for (const c of casos) {
  armar();
  try { c.romper(); } catch (e) { console.log(`FALLA ${c.nombre}\n      no se pudo romper el repo de prueba: ${e.message}`); malos++; continue; }
  const h = hallazgos(correr());
  delete h[IGNORAR];
  const propio = h[c.seccion] || 0;
  if (propio === 0) {
    console.log(`FALLA ${c.nombre}  → [${c.seccion}] siguió en 0 (el control no lo vio)`);
    malos++; continue;
  }
  const otros = Object.entries(h).filter(([k, n]) => k !== c.seccion && n > 0).map(([k, n]) => `${k}=${n}`);
  console.log(`OK    ${c.nombre}  → 0→${propio}${otros.length ? '   (además: ' + otros.join(', ') + ')' : ''}`);
}

// -- CASO BUENO fino: citar un término vetado en lo que viaja no es usarlo --
console.log('\n== CASO BUENO: citar un término vetado en lo que viaja no es usarlo ==');
armar();
escribir('funcionalidades/amp/README.md', leer('funcionalidades/amp/README.md') + '\nEl término `churn` está vetado.\n');
{
  const h = hallazgos(correr());
  const n = h['TERMINOLOGIA VETADA EN EL TEXTO QUE VIAJA (funcionalidades/)'] || 0;
  console.log(`${n === 0 ? 'OK  ' : 'FALLA'} citado entre comillas simples invertidas → ${n} hallazgos`);
  if (n !== 0) malos++;
}

fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
console.log(`\ncasos: ${casos.length + 2}`);
console.log(`no cubierto a propósito: [${IGNORAR}] — compara contra los plugins instalados en la máquina, que un repo de prueba no tiene.`);
console.log(malos ? `${malos} FALLARON.` : 'TODO VERDE.');
process.exit(malos ? 1 : 0);
