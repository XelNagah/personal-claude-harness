// Prueba cada control de lint-conducta contra un caso malo y uno bueno.
//
// Este lint es el de mayor riesgo del repo, y su defecto no se ve en un informe: si deja de validar,
// el hook repartidor **deja de entregar reglas en silencio**. Una regla que apunta a un momento que
// no existe no falla — simplemente no se despacha nunca, y el agente sigue trabajando sin ella. Es
// el caso que la decision `Local-0042` describe: el repartidor ubica `Momento` y `Clase` por nombre
// de columna, y si una se renombra no encuentra ninguna y cada fila queda con el momento vacio.
//
// EL BANCO FABRICA SUS DOS INDICES DE REGLAS. Antes copiaba el `.claude/` del repo que lo corre y
// rompia la fila REAL `Base-0002`, y arrastraba consigo el `INDICE-LOCAL.md` del destino: el caso
// bueno —«el banco intacto da cero»— pasaba a medir si las reglas que escribio ese repo estan sanas,
// que este banco no tiene por que juzgar (para eso esta el lint corriendo sobre el repo), y el caso
// que afirma «sin MOMENTOS-LOCAL.md no se queja» corria con el archivo presente cuando el destino lo
// tenia. Es la forma «escenario prestado» del conocimiento `controles-que-no-avisan`, y la Decision
// `Local-0075` es la que la prohibe para todos los bancos que viajan.
//
// Lo que se toma del subsistema instalado es el vocabulario y el manifiesto —`MOMENTOS.md`,
// `CLASES.md` y `MANIFIESTO.md`—, que son Componentes del Agente Multiproposito, iguales en todas
// las instalaciones, y que son justamente contra lo que este lint valida. `MOMENTOS-LOCAL.md` NO se
// copia: es del Proposito de cada repo, y los casos que lo necesitan lo escriben ellos.
// Los momentos que usan los casos tampoco se escriben a mano: se DERIVAN del `MOMENTOS.md` copiado
// —uno activo y uno declarado—, asi que renombrar un momento de la Base no rompe el banco.
//
// Uso: node .claude/conducta/lint-conducta/pruebas.js   (desde la raíz del repo)
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ORIGEN = '.claude/conducta';
const REPO_PRUEBA = '.claude/tmp/repo-prueba-conducta';
const BANCO = path.join(REPO_PRUEBA, '.claude', 'conducta');
const LINT = '.claude/conducta/lint-conducta/lint-conducta.js';

const DEL_SUBSISTEMA = ['MOMENTOS.md', 'CLASES.md', 'MANIFIESTO.md'];
const IDX = 'INDICE.md', LOCAL = 'INDICE-LOCAL.md';

// -- los dos momentos que los casos usan, derivados del vocabulario instalado --
// `activo` tiene repartidor y sostiene una regla vigente; `declarado` no lo tiene todavia, y es lo
// que enciende el control de honestidad. Se leen del archivo en vez de escribirse: son nombres del
// Agente Multiproposito y cambiarlos no tiene por que romper este banco.
function momentosDe(txt) {
  const out = { activo: null, declarado: null };
  for (const l of txt.split('\n')) {
    if (!l.trim().startsWith('|')) continue;
    const c = l.trim().replace(/^\|/, '').replace(/\|$/, '').split(/(?<!\\)\|/).map(x => x.trim());
    if (c.length < 4) continue;
    const nombre = c[0], disp = c[c.length - 1].toLowerCase();
    if (/^:?-{2,}:?$/.test(nombre.replace(/\s/g, '')) || nombre.toLowerCase() === 'momento') continue;
    if (disp === 'activo' && !out.activo) out.activo = nombre;
    if (disp === 'declarado' && !out.declarado) out.declarado = nombre;
  }
  return out;
}
const MOM = momentosDe(fs.readFileSync(path.join(ORIGEN, 'MOMENTOS.md'), 'utf8'));

const frontmatter = (nombre, origen) => '---\nindice: ' + nombre + '\norigen: ' + origen + '\n'
  + 'columnas: [Código, Nombre, Descripción, Momento, Clase, Contenido, Estado, Detalle]\n'
  + 'descripcion: qué asegura la regla, en una línea\n---\n\n';
const CABECERA = '| Código | Nombre | Descripción | Momento | Clase | Contenido | Estado | Detalle |\n'
  + '|---|---|---|---|---|---|---|---|\n';
const fila = (cod, nombre, desc, momento, clase, contenido, estado) =>
  `| ${cod} | ${nombre} | ${desc} | ${momento} | ${clase} | ${contenido} | ${estado} | — |`;

// Dos reglas sintéticas sobre el momento activo. `Base-0002` es la que rompe cada caso; `Base-0001`
// queda sana al lado, para que un control que se disparara sobre TODAS las filas se distinga de uno
// que se dispara sobre la que se rompió.
function indiceBase() {
  return frontmatter('Reglas de conducta', 'agente-multiproposito')
    + '# Reglas de conducta\n\nDatos sintéticos: este registro existe solo para romperlo.\n\n' + CABECERA
    + [
      fila('Base-0001', 'Contar los remitos antes de cerrar', 'Que no se cierre el mes con remitos sin contar.',
        MOM.activo, 'Inyectar', 'Antes de cerrar, contá los remitos del período.', 'vigente'),
      fila('Base-0002', 'Archivar la factura bajo su proveedor', 'Que ninguna factura quede fuera de la carpeta de su proveedor.',
        MOM.activo, 'Inyectar', 'Al archivar una factura, poné la carpeta de su proveedor.', 'vigente'),
    ].join('\n') + '\n';
}
function indiceLocal() {
  return frontmatter('Reglas del Agente Desplegado', 'agente-desplegado')
    + '# Reglas del Agente Desplegado\n\nDatos sintéticos: este registro existe solo para romperlo.\n\n' + CABECERA;
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
}
const leer = f => fs.readFileSync(path.join(BANCO, f), 'utf8');
const escribir = (f, t) => fs.writeFileSync(path.join(BANCO, f), t);

function correr() {
  const r = cp.spawnSync('node', [LINT, BANCO], { encoding: 'utf8' });
  return (r.stdout || '') + (r.stderr || '');
}
// hallazgos por seccion: el formato es `[TITULO] (N)`
function hallazgos(salida) {
  const out = {};
  for (const m of salida.matchAll(/^\[([^\]]+)\] \((\d+)\)/gm)) out[m[1]] = parseInt(m[2], 10);
  return out;
}
const total = h => Object.values(h).reduce((a, b) => a + b, 0);

// Cambia una celda por su NOMBRE de columna en la fila del código dado. Se ubica por nombre y no por
// posición justamente porque es el defecto que este subsistema ya sufrió.
function cambiarCelda(codigo, columna, valor) {
  const lineas = leer(IDX).split('\n');
  const iCab = lineas.findIndex(l => l.startsWith('| Código |'));
  const cab = lineas[iCab].split('|').slice(1, -1).map(c => c.trim());
  const col = cab.indexOf(columna);
  if (col < 0) throw new Error(`no existe la columna ${columna} (hay: ${cab.join(', ')})`);
  const iFila = lineas.findIndex(l => l.startsWith(`| ${codigo} `));
  if (iFila < 0) throw new Error(`no existe la fila ${codigo}`);
  const celdas = lineas[iFila].split('|').slice(1, -1);
  celdas[col] = ' ' + valor + ' ';
  lineas[iFila] = '|' + celdas.join('|') + '|';
  escribir(IDX, lineas.join('\n'));
}
// El momento propio de un repo, que algunos casos declaran: se escribe entero acá una sola vez.
const momentosLocales = nombre => fs.writeFileSync(path.join(BANCO, 'MOMENTOS-LOCAL.md'),
  '# Momentos del Agente Desplegado\n\n| Momento | Qué representa | Evento de hook | Disponibilidad |\n' +
  `|---|---|---|---|\n| ${nombre} | Propio de este Propósito. | \`PreToolUse\` | declarado |\n`);
const MOMENTO_PROPIO = 'antes de asentar una factura';

let malos = 0;

// Si el vocabulario instalado no trae alguno de los dos tipos de momento, los casos que dependen de
// él no se pueden montar. Se dice y se corta, en vez de dar por buenos casos que no midieron nada.
if (!MOM.activo || !MOM.declarado) {
  console.log(`FALLA no se pudo derivar el vocabulario de MOMENTOS.md (activo: ${MOM.activo}, declarado: ${MOM.declarado})`);
  process.exit(1);
}
console.log(`momentos derivados de MOMENTOS.md → activo: "${MOM.activo}" · declarado: "${MOM.declarado}"\n`);

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

// El defecto más caro: la regla existe, se ve bien en la tabla, y no se entrega nunca.
caso('regla atada a un momento que no existe', 'MOMENTO INEXISTENTE (regla apunta a un momento fuera de MOMENTOS.md)',
  () => cambiarCelda('Base-0002', 'Momento', 'cuando se le ocurra'));

caso('clase que no está en CLASES.md', 'CLASE INVALIDA',
  () => cambiarCelda('Base-0002', 'Clase', 'Sugerir'));

caso('estado inventado', 'ESTADO INVALIDO',
  () => cambiarCelda('Base-0002', 'Estado', 'casi vigente'));

// Dos formas de no tener contenido, y las dos tienen que encenderlo: la celda vacía y la celda con
// el guión, que es el marcador de «nada» en todos los registros del repo. La segunda pasaba el
// control hasta el 30/07/2026: la regla quedaba entregando una cadena vacía sin que nadie avisara.
caso('regla Inyectar con la celda de Contenido vacía', 'INYECTAR SIN CONTENIDO',
  () => cambiarCelda('Base-0002', 'Contenido', ''));

caso('regla Inyectar con Contenido en «—»', 'INYECTAR SIN CONTENIDO',
  () => cambiarCelda('Base-0002', 'Contenido', '—'));

// Un momento declarado en MOMENTOS.md pero sin repartidor: una regla vigente ahí promete un
// comportamiento que nadie entrega.
caso('regla vigente sobre un momento sin repartidor', 'VIGENTE SOBRE MOMENTO SIN REPARTIDOR',
  () => cambiarCelda('Base-0002', 'Momento', MOM.declarado));

caso('columna declarada que la tabla no tiene', 'INDICES DECLARADOS (frontmatter vs tabla vs manifiesto)',
  () => escribir(IDX, leer(IDX).replace(/^columnas: \[(.+)\]$/m, 'columnas: [$1, Inventada]')));

caso('falta el vocabulario de momentos', 'ESTRUCTURA',
  () => fs.rmSync(path.join(BANCO, 'MOMENTOS.md')));

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
  console.log(`OK    ${c.nombre}  → 0→${propio}${otros.length ? '   (además: ' + otros.join(', ') + ')' : ''}`);
}

// -- EL PAR DE MOMENTOS: el repo puede sumar los suyos -----------------------
// Hasta el 30/07/2026 el único archivo de momentos era el del Agente Multipropósito, que el actualizador
// reemplaza entero: un repo que necesitaba un momento propio no tenía dónde declararlo sin perderlo
// en la corrida siguiente.
console.log('\n== EL PAR DE MOMENTOS ==');
{
  armar();
  momentosLocales(MOMENTO_PROPIO);
  cambiarCelda('Base-0002', 'Momento', MOMENTO_PROPIO);
  cambiarCelda('Base-0002', 'Estado', 'pendiente');
  const h = hallazgos(correr());
  const t = total(h);
  console.log(`${t === 0 ? 'OK  ' : 'FALLA'} una regla pendiente sobre un momento propio es válida → ${t} hallazgos${t ? '  ' + JSON.stringify(h) : ''}`);
  if (t !== 0) malos++;
}
{
  // El mismo momento propio, pero con la regla `vigente`: promete algo que ningún repartidor entrega.
  armar();
  momentosLocales(MOMENTO_PROPIO);
  cambiarCelda('Base-0002', 'Momento', MOMENTO_PROPIO);
  const n = hallazgos(correr())['VIGENTE SOBRE MOMENTO SIN REPARTIDOR'] || 0;
  console.log(`${n === 1 ? 'OK  ' : 'FALLA'} vigente sobre un momento propio sin repartidor → ${n} (1 esperado)`);
  if (n !== 1) malos++;
}
{
  // Un momento propio que repite uno de la Base: el de arriba manda y el de abajo lo pisaría callado.
  armar();
  momentosLocales(MOM.activo);
  const n = hallazgos(correr())['ESTRUCTURA'] || 0;
  console.log(`${n >= 1 ? 'OK  ' : 'FALLA'} un momento propio que repite uno de la Base se marca → ${n} (1 esperado)`);
  if (n < 1) malos++;
}
{
  // Sin el archivo del Agente Desplegado: es el estado normal, no un hallazgo. El banco nunca lo
  // copia del repo instalado, así que acá está garantizadamente ausente.
  armar();
  const t = total(hallazgos(correr()));
  console.log(`${t === 0 ? 'OK  ' : 'FALLA'} sin MOMENTOS-LOCAL.md no se queja → ${t} hallazgos`);
  if (t !== 0) malos++;
}

// -- CASO BUENO fino: sin CLASES.md el lint NO se queja -----------------------
// Es deliberado y conviene dejarlo escrito para que nadie lo "arregle": un Agente Desplegado sin
// actualizar todavía no tiene ese archivo, y el lint se cae a las tres clases de siempre en vez de dar
// por inválida cada regla del repo. Si algún día esto se vuelve un hallazgo, es una decisión, no un
// descuido.
console.log('\n== CASO BUENO: sin CLASES.md se cae a las tres clases de siempre ==');
armar();
fs.rmSync(path.join(BANCO, 'CLASES.md'));
{
  const h = hallazgos(correr());
  const t = total(h);
  console.log(`${t === 0 ? 'OK  ' : 'FALLA'} CLASES.md ausente → ${t} hallazgos (0 esperados: es un caso soportado)`);
  if (t !== 0) malos++;
}

// -- CASO BUENO fino: el Índice del Agente Desplegado sin filas es válido ----
// Un repo recién instalado tiene su `INDICE-LOCAL.md` declarado y sin ninguna regla propia. Eso no
// es un defecto: es el estado normal, y el lint no tiene que marcarlo. Es como lo fabrica `armar()`,
// así que el caso bueno de arriba ya lo cubre; se deja explícito porque es lo que se está afirmando.
console.log('\n== CASO BUENO: el Índice del Agente Desplegado sin filas es válido ==');
armar();
{
  const h = hallazgos(correr());
  const t = total(h);
  console.log(`${t === 0 ? 'OK  ' : 'FALLA'} INDICE-LOCAL.md declarado y sin reglas → ${t} hallazgos`);
  if (t !== 0) malos++;
}

fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
console.log(`\ncasos: ${casos.length + 7}`);
console.log(malos ? `${malos} FALLARON.` : 'TODO VERDE.');
process.exit(malos ? 1 : 0);
