// Prueba cada control de lint-herramientas contra un caso malo y uno bueno.
//
// El control mas propio de este lint es el cuarto: verifica que las rutas de lint que aparecen en la
// configuracion de hooks sigan existiendo. Es el que caza el defecto que el manifiesto advierte —una
// tool referenciada por ruta en `settings`, en `.gitignore` o en un hook no se mueve sin actualizar
// esa referencia—, y su falla no se ve en ningun informe: el hook simplemente deja de correr.
//
// EL BANCO FABRICA SU REGISTRO Y SUS HERRAMIENTAS. Antes copiaba el `.claude/` del repo que lo corre
// y rompia el Indice del Agente Desplegado REAL buscando la fila de `ejecutar-pruebas`, que es una
// Herramienta de ESTE repo. En otro Agente Desplegado esa Herramienta no existe: el `replace` no
// cambiaba nada, el archivo quedaba sano, el lint contestaba cero hallazgos —correctamente— y el
// banco lo leia como «el control no vio el defecto». Dos de sus siete casos se encendian en rojo en
// todo repo instalado, sin que hubiera nada roto. Medido el 20/08/2026 en un Agente Desplegado al
// dia con `amp` 0.50.0, con el banco y el lint byte a byte iguales a los que viajan.
// Es la forma «escenario prestado» del conocimiento `controles-que-no-avisan`, y la Decision
// `Local-0075` es la que la prohibe para todos los bancos que viajan.
//
// Lo unico que se toma del subsistema instalado es el `MANIFIESTO.md`, que es Componente del Agente
// Multiproposito e igual en todas las instalaciones, y que es ademas lo que el control de Indices
// declarados contrasta. Los dos Indices, las carpetas de Herramienta y la configuracion de hooks son
// datos sinteticos.
//
// Uso: node .claude/herramientas/lint-herramientas/pruebas.js   (desde la raíz del repo)
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ORIGEN = '.claude/herramientas';
const REPO_PRUEBA = '.claude/tmp/repo-prueba-herramientas';
const CLAUDE = path.join(REPO_PRUEBA, '.claude');
const BANCO = path.join(CLAUDE, 'herramientas');
const LINT = '.claude/herramientas/lint-herramientas/lint-herramientas.js';

const DEL_SUBSISTEMA = ['MANIFIESTO.md'];
const IDX = 'INDICE.md', LOCAL = 'INDICE-LOCAL.md';

// Las tres Herramientas sinteticas con carpeta local. Se nombran una sola vez: ningun caso vuelve a
// escribir el nombre de una carpeta, ni real ni de prueba.
//   `frontmatter` es la unica sin carpeta —vive en `common/`— y sirve para que el barrido de
//   carpetas no sea lo mismo que la lista de filas.
const CON_CARPETA = ['contar-remitos', 'emitir-resumen', 'cerrar-el-mes'];
// La que un caso descuelga y la que otro deja sin README: se nombran aca por lo mismo.
const COLGABLE = 'cerrar-el-mes';
const SIN_README = 'contar-remitos';
// La ruta de lint que la configuracion de hooks referencia, y que un caso rompe.
const LINT_REFERENCIADO = '.claude/herramientas/emitir-resumen/emitir-resumen.js';

const frontmatter = (nombre, origen) => '---\nindice: ' + nombre + '\norigen: ' + origen + '\n'
  + 'columnas: [Código, Nombre, Descripción, Tipo, Cómo se invoca, Estado, Detalle]\n'
  + 'descripcion: qué hace la Herramienta\n---\n\n';
const CABECERA = '| Código | Nombre | Descripción | Tipo | Cómo se invoca | Estado | Detalle |\n'
  + '|--------|--------|-------------|------|----------------|--------|---------|\n';
const fila = (cod, nombre, desc, tipo, invocacion, detalle) =>
  `| ${cod} | ${nombre} | ${desc} | ${tipo} | ${invocacion} | vigente | ${detalle} |`;
const carpeta = n => `[${n}/](${n}/)`;

function indiceBase() {
  return frontmatter('Herramientas del proyecto', 'agente-multiproposito')
    + '# Herramientas del proyecto\n\nDatos sintéticos: este registro existe solo para romperlo.\n\n'
    + CABECERA
    + fila('Base-0001', 'frontmatter', 'Lee el frontmatter de un archivo de texto.', 'funcion',
      "`require('../../common/frontmatter.js')`", '[../common/frontmatter.js](../common/frontmatter.js)') + '\n';
}
function indiceLocal() {
  return frontmatter('Herramientas del Agente Desplegado', 'agente-desplegado')
    + '# Herramientas del Agente Desplegado\n\nDatos sintéticos: este registro existe solo para romperlo.\n\n'
    + CABECERA
    + [
      fila('Local-0001', 'contar-remitos', 'Cuenta los remitos del período y los agrupa por proveedor.', 'script',
        '`node .claude/herramientas/contar-remitos/contar-remitos.js`', carpeta('contar-remitos')),
      fila('Local-0002', 'emitir-resumen', 'Emite el resumen del mes con los totales por rubro.', 'script',
        '`node .claude/herramientas/emitir-resumen/emitir-resumen.js`', carpeta('emitir-resumen')),
      fila('Local-0003', 'cerrar-el-mes', 'Cierra el mes: congela los totales y deja el período abierto siguiente.', 'script',
        '`node .claude/herramientas/cerrar-el-mes/cerrar-el-mes.js`', carpeta(COLGABLE)),
    ].join('\n') + '\n';
}

function armar() {
  fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
  fs.mkdirSync(BANCO, { recursive: true });
  for (const f of DEL_SUBSISTEMA) {
    const src = path.join(ORIGEN, f);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(BANCO, f));
  }
  escribir(IDX, indiceBase());
  escribir(LOCAL, indiceLocal());
  for (const t of CON_CARPETA) {
    fs.mkdirSync(path.join(BANCO, t), { recursive: true });
    fs.writeFileSync(path.join(BANCO, t, 'README.md'), `# ${t}\n\nDatos sintéticos.\n`);
    fs.writeFileSync(path.join(BANCO, t, `${t}.js`), '// dato sintético\n');
  }
  // La funcion que una fila referencia fuera de `herramientas/`: el control de filas colgadas tiene
  // que dejarla pasar (no apunta a una carpeta local), y sin el archivo el caso no lo distinguiria.
  fs.mkdirSync(path.join(CLAUDE, 'common'), { recursive: true });
  fs.writeFileSync(path.join(CLAUDE, 'common', 'frontmatter.js'), '// dato sintético\n');
  // La configuracion de hooks, con una ruta de lint que EXISTE en el banco.
  escribirSettings(JSON.stringify({
    hooks: { SessionStart: [{ hooks: [{ type: 'command', command: `node ${LINT_REFERENCIADO}` }] }] },
  }, null, 2));
}
const leer = f => fs.readFileSync(path.join(BANCO, f), 'utf8');
const escribir = (f, t) => fs.writeFileSync(path.join(BANCO, f), t);
const SETTINGS = path.join(CLAUDE, 'settings.json');
const escribirSettings = t => fs.writeFileSync(SETTINGS, t);

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

caso('herramienta con carpeta local y sin README', 'SIN README',
  () => fs.rmSync(path.join(BANCO, SIN_README, 'README.md')));

caso('carpeta de herramienta que ningún Índice lista', 'FUERA DEL INDICE',
  () => {
    const nueva = path.join(BANCO, 'medir-algo');
    fs.mkdirSync(nueva, { recursive: true });
    fs.writeFileSync(path.join(nueva, 'README.md'), '# medir-algo\n\nSin fila en el registro.\n');
    fs.writeFileSync(path.join(nueva, 'medir-algo.js'), '// nada\n');
  });

caso('fila que apunta a una carpeta local que no existe', 'FILAS COLGADAS',
  () => escribir(LOCAL, leer(LOCAL).replace(carpeta(COLGABLE), '[no-existe/](no-existe/)')));

// El defecto silencioso: el hook queda apuntando a un lint que se movió, y deja de correr sin avisar.
caso('la configuración de hooks apunta a un lint que ya no está', 'REFS POR RUTA DE LINT ROTAS EN SETTINGS',
  () => escribirSettings(fs.readFileSync(SETTINGS, 'utf8')
    .replace(LINT_REFERENCIADO, '.claude/herramientas/lint-mudado/lint-mudado.js')));

caso('columna declarada que la tabla no tiene', 'INDICES DECLARADOS',
  () => escribir(LOCAL, leer(LOCAL).replace(/^columnas: \[(.+)\]$/m, 'columnas: [$1, Inventada]')));

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

// -- CASO BUENO fino: el lint co-ubicado no se reclama a sí mismo ------------
// `lint-herramientas` vive dentro de `herramientas/` y es infra del Patrón, no una Herramienta. El
// lint se autoexcluye del barrido de carpetas por nombre (`lint-` + el del subsistema); si esa
// autoexclusión se rompiera, se reclamaría a sí mismo una fila. Se prueba con las dos carpetas a la
// vez: la del propio subsistema, que no se reclama, y una de otro nombre, que sí.
console.log('\n== CASO BUENO: la autoexclusión es solo para el lint del propio subsistema ==');
armar();
{
  for (const n of ['lint-herramientas', 'lint-otra-cosa']) {
    const d = path.join(BANCO, n);
    fs.mkdirSync(d, { recursive: true });
    fs.writeFileSync(path.join(d, 'README.md'), `# ${n}\n\nDatos sintéticos.\n`);
  }
  const h = hallazgos(correr());
  const n = h['FUERA DEL INDICE'] || 0;
  console.log(`${n === 1 ? 'OK  ' : 'FALLA'} lint-herramientas/ + lint-otra-cosa/ → ${n} reclamo(s) (1 esperado: solo el propio se autoexcluye)`);
  if (n !== 1) malos++;
}

fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
console.log(`\ncasos: ${casos.length + 2}`);
console.log(malos ? `${malos} FALLARON.` : 'TODO VERDE.');
process.exit(malos ? 1 : 0);
