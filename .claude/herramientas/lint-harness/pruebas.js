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
const BASE_INST = 'funcionalidades/amp/skills/inicializar/base';

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

// El motivo del control: arreglar un lint en `.claude/` y olvidar la copia que viaja dejaba el
// defecto saliendo publicado con el control de cierre en verde.
caso('un script que viaja difiere del instalado', 'LO QUE VIAJA DIFIERE DE LO INSTALADO EN .claude/',
  () => fs.appendFileSync(path.join(REPO_PRUEBA, '.claude/subsistemas/lint-subsistemas/lint-subsistemas.js'),
    '\n// divergencia que la copia que viaja no tiene\n'));

// El encabezado de un registro del Agente Desplegado SI se compara: es la convencion que manda el
// Agente Multiproposito y, si nadie la mira, queda vieja para siempre en cada repo instalado.
caso('el encabezado de un registro del Agente Desplegado difiere', 'LO QUE VIAJA DIFIERE DE LO INSTALADO EN .claude/',
  () => escribir('.claude/semantica/GLOSARIO.md',
    leer('.claude/semantica/GLOSARIO.md').replace('# Glosario del proyecto', '# Glosario del proyecto (retocado)')));

// El otro sentido: un Componente que se declara en lo que viaja y no existe instalado.
caso('viaja un Componente que no existe en .claude/', 'VIAJA UN COMPONENTE QUE NO EXISTE EN .claude/',
  () => fs.rmSync(path.join(REPO_PRUEBA, '.claude/subsistemas/lint-subsistemas/README.md'), { force: true }));

// Y el hueco que ningun control veia: infra Base instalada que nunca viajo. Partir del bloque no
// podia verlo —no hay bloque—, y asi estuvo meses la Herramienta `instalar-plugins-codex`, que el
// registro Base declaraba y la instalacion no llevaba.
caso('infra Base instalada que no viaja', 'INFRA BASE EN .claude/ QUE NO VIAJA',
  () => fs.rmSync(path.join(REPO_PRUEBA, BASE_INST, 'subsistemas/lint-subsistemas/README.md'), { force: true }));

// Un Indice del Agente Desplegado nace declarado y SIN filas. Si viaja con alguna, todo repo que
// se instale arranca con las entradas de este como si fueran propias. El control del encabezado no
// puede verlo —mira arriba de la tabla justamente para no comparar filas—, asi que va aparte.
caso('un Índice del Agente Desplegado viaja con filas', 'UN INDICE DEL AGENTE DESPLEGADO VIAJA CON FILAS',
  () => fs.appendFileSync(path.join(REPO_PRUEBA, BASE_INST, 'herramientas/INDICE-LOCAL.md'),
    '| Local-0001 | una-tool | Que hace. | script | `node x.js` | vigente | [x/](x/) |\n'));

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

// -- CASO BUENO fino: las FILAS de un registro del Agente Desplegado son del repo ------
// Es el contrario exacto del caso malo del encabezado, y hace falta que esten los dos: un control
// que marcara todo el archivo dejaria en rojo a cualquier repo apenas escribe su primer termino,
// y uno que no mirara nada dejaria el encabezado viejo para siempre. La linea esta en la tabla.
console.log('\n== CASO BUENO: las filas de un registro del Agente Desplegado no se comparan ==');
armar();
escribir('.claude/semantica/GLOSARIO.md',
  leer('.claude/semantica/GLOSARIO.md') + '| Local-0099 | Mudanza | Un termino que suma este repo. | — | — | — |\n');
{
  const h = hallazgos(correr());
  const n = h['LO QUE VIAJA DIFIERE DE LO INSTALADO EN .claude/'] || 0;
  console.log(`${n === 0 ? 'OK  ' : 'FALLA'} una fila propia en el glosario → ${n} hallazgos`);
  if (n !== 0) malos++;
}

fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
console.log(`\ncasos: ${casos.length + 3}`);
console.log(`no cubierto a propósito: [${IGNORAR}] — compara contra los plugins instalados en la máquina, que un repo de prueba no tiene.`);
console.log(malos ? `${malos} FALLARON.` : 'TODO VERDE.');
process.exit(malos ? 1 : 0);
