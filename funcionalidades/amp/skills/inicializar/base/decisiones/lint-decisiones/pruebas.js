// Prueba cada control de lint-decisiones contra un caso malo y uno bueno. Un lint que lee mal
// contesta en verde sobre un conjunto vacio, asi que verde no prueba nada por si solo: cada control
// tiene que ENCENDERSE ante su defecto, y solo ante el suyo.
//
// EL BANCO FABRICA SU REGISTRO. Antes copiaba el `.claude/` del repo que lo corre y rompia el
// registro de decisiones REAL buscando texto literal —la fila `Local-0003`, la pagina
// `0020-...md`, el estado `reemplazada por 0023`—, que son decisiones de ESTE repo. En un Agente
// Desplegado el registro de decisiones es Aprendizaje propio y ese texto no existe: el `replace` no
// cambiaba nada, el archivo quedaba sano, el lint contestaba cero hallazgos —correctamente— y el
// banco lo leia como «el control no vio el defecto». Cuatro de sus ocho casos se encendian en rojo
// en todo repo instalado, sin que hubiera nada roto. Medido el 20/08/2026 en un Agente Desplegado
// al dia con `amp` 0.50.0, con el banco y el lint byte a byte iguales a los que viajan.
// Es la forma «escenario prestado» del conocimiento `controles-que-no-avisan`, y la Decision
// `Local-0075` es la que la prohibe para todos los bancos que viajan.
//
// Lo unico que se toma del subsistema instalado es lo que NO es contenido del repo: el
// `MANIFIESTO.md`, que es Componente del Agente Multiproposito e igual en todas las instalaciones, y
// que ademas es lo que el control de Indices declarados contrasta. El registro, sus paginas de
// detalle y los codigos son datos sinteticos.
//
// Uso: node .claude/decisiones/lint-decisiones/pruebas.js   (desde la raíz del repo)
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ORIGEN = '.claude/decisiones';
const REPO_PRUEBA = '.claude/tmp/repo-prueba-decisiones';
const BANCO = path.join(REPO_PRUEBA, '.claude', 'decisiones');
const LINT = '.claude/decisiones/lint-decisiones/lint-decisiones.js';

// Del subsistema instalado, solo el mecanismo. `README.md` no hace falta: este lint no lo mira.
const DEL_SUBSISTEMA = ['MANIFIESTO.md'];

// La pagina de detalle que una fila referencia, nombrada una sola vez: ningun caso vuelve a escribir
// el nombre de un archivo, ni real ni de prueba.
const PAGINA = '0004-decision-de-prueba-con-detalle.md';

// Cinco decisiones sinteticas, correlativas (el control de numeracion exige que no falte ninguna
// entre 1 y el maximo). Cada una existe para que un caso de abajo la rompa:
//   0001  la que un caso duplica       0002  la que un caso renombra
//   0003  la reemplazante              0004  la unica con pagina de detalle
//   0005  la que declara estar reemplazada por 0003
function registroSintetico() {
  const fila = (n, nombre, desc, estado, detalle) =>
    `| Local-000${n} | ${nombre} | ${desc} | 2026-01-0${n} | ${estado} | ${detalle} |`;
  return '---\nindice: Decisiones del proyecto\norigen: agente-desplegado\n'
    + 'columnas: [Código, Nombre, Descripción, Fecha, Estado, Detalle]\n'
    + 'descripcion: qué se decidió y por qué\n---\n\n'
    + '# Decisiones del proyecto\n\nDatos sintéticos: este registro existe solo para romperlo.\n\n'
    + '| Código | Nombre | Descripción | Fecha | Estado | Detalle |\n'
    + '|---|---|---|---|---|---|\n'
    + [
      fila(1, 'El inventario se cuenta una vez por mes', 'Se cuenta el inventario el último día hábil de cada mes.', 'vigente', '—'),
      fila(2, 'Las facturas se archivan por proveedor', 'Cada factura se archiva bajo la carpeta de su proveedor.', 'vigente', '—'),
      fila(3, 'Los remitos se numeran corridos', 'La numeración de remitos es corrida y no se reinicia por año.', 'vigente', '—'),
      fila(4, 'El cierre mensual lleva su propia página', 'El recorrido del cierre mensual se explica aparte.', 'vigente', `[${PAGINA}](${PAGINA})`),
      fila(5, 'Los remitos se numeraban por año', 'La numeración de remitos se reiniciaba cada año.', 'reemplazada por 0003', '—'),
    ].join('\n') + '\n';
}

function armar() {
  fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
  fs.mkdirSync(BANCO, { recursive: true });
  for (const f of DEL_SUBSISTEMA) {
    const src = path.join(ORIGEN, f);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(BANCO, f));
  }
  escribir(registroSintetico());
  fs.writeFileSync(path.join(BANCO, PAGINA),
    '# El cierre mensual\n\nDatos sintéticos: esta página existe para que una fila la referencie.\n');
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
  () => escribir(reg().replace('| Local-0002 |', '| Local-0001 |')));

caso('Detalle que apunta a un archivo que no existe', 'LINKS DE DETALLE ROTOS',
  () => escribir(reg().replace(`[${PAGINA}](${PAGINA})`, '[0004-que-no-existe.md](0004-que-no-existe.md)')));

caso('página de detalle que ninguna fila referencia', 'PAGINAS HUERFANAS',
  () => fs.writeFileSync(path.join(BANCO, '0099-decision-suelta.md'), '# Suelta\n\nNadie la referencia.\n'));

caso('reemplazada por una decisión que no existe', 'REEMPLAZOS ROTOS',
  () => escribir(reg().replace('| reemplazada por 0003 |', '| reemplazada por 9999 |')));

caso('Nombre duplicado', 'NOMBRES VACIOS O DUPLICADOS',
  () => escribir(reg().replace(/(\| Local-0002 \| )[^|]+(\|)/, '$1El inventario se cuenta una vez por mes $2')));

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
// El registro de decisiones de un repo real tiene celdas que nombran columnas adentro del texto,
// escapadas con `\|`. Si el lint las tomara como separador, correria el Estado y el Detalle de esas
// filas: el Estado pasaria a leerse donde esta el texto y el reemplazo dejaria de resolverse.
// La fila se AGREGA al registro sintetico en vez de buscarse en el del repo, que puede no tener
// ninguna: sin fila escapada el caso pasaba en verde sin ejercitar nada.
console.log('\n== CASO BUENO: una celda con tubería escapada no corre las columnas ==');
armar();
{
  escribir(reg().trimEnd() + '\n'
    + '| Local-0006 | El núcleo del registro es `Código \\| Nombre` | Toda fila arranca con `Código \\| Nombre`, en ese orden. | 2026-01-06 | vigente | — |\n');
  const h = hallazgos(correr());
  const t = total(h);
  console.log(`${t === 0 ? 'OK  ' : 'FALLA'} una fila con \\| en dos celdas → ${t} hallazgos${t ? '  ' + JSON.stringify(h) : ''}`);
  if (t !== 0) malos++;
}

fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
console.log(`\ncasos: ${casos.length + 2}`);
console.log(malos ? `${malos} FALLARON.` : 'TODO VERDE.');
process.exit(malos ? 1 : 0);
