// Prueba cada control de lint-subsistemas contra un caso malo y uno bueno.
//
// Este lint es el que vigila que el catalogo y el disco no se separen: una casa que existe y no esta
// catalogada, o catalogada y sin casa, deja al subsistema invisible para las habilidades que lo
// operan. Cada caso declara un FRAGMENTO del mensaje esperado, porque el lint emite una lista plana.
//
// Hasta el 30/07/2026 este era el UNICO lint que salia con codigo 1 y escribia en la salida de
// errores, contra lo que fija la decision `Local-0003` (la capa mecanica reporta, no frena). Se
// alineo con los otros nueve: reporta en la salida normal, con el formato contable `[TITULO] (N)`, y
// sale 0 siempre. La prueba verifica las dos cosas — que el hallazgo aparezca Y que el codigo de
// salida siga siendo 0 —, porque el defecto que esto arreglaba tenia dos caras: el control de cierre
// lo mostraba como ERROR en vez de listar los hallazgos, y su formato no era contable, asi que sus
// hallazgos no entraban en ningun total.
//
// EL BANCO FABRICA SU CATALOGO Y SUS CASAS. Antes copiaba el `.claude/` del repo que lo corre y
// rompia filas REALES por su codigo —`Base-0005`, `Base-0006`— y una casa por su nombre. Eso ataba
// el banco a que la Base siguiera trayendo esas filas exactas, y hacia que el caso bueno —«el banco
// intacto da cero»— midiera si el repo destino tiene su catalogo en orden, que este banco no tiene
// por que juzgar: para eso esta el lint corriendo sobre el repo. Es la forma «escenario prestado»
// del conocimiento `controles-que-no-avisan`, y la Decision `Local-0075` es la que la prohibe para
// todos los bancos que viajan.
//
// Lo unico que se toma del subsistema instalado es el `MANIFIESTO.md`, Componente del Agente
// Multiproposito e igual en todas las instalaciones, que es lo que el control de Indices declarados
// contrasta y que ademas hace de la casa `subsistemas/` una casa valida. Las casas del catalogo son
// datos sinteticos: dos casas de un Proposito inventado.
//
// Uso: node .claude/subsistemas/lint-subsistemas/pruebas.js   (desde la raíz del repo)
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ORIGEN = '.claude/subsistemas';
const REPO_PRUEBA = '.claude/tmp/repo-prueba-subsistemas';
const CLAUDE = path.join(REPO_PRUEBA, '.claude');
const BANCO = path.join(CLAUDE, 'subsistemas');
const LINT = '.claude/subsistemas/lint-subsistemas/lint-subsistemas.js';

const DEL_SUBSISTEMA = ['MANIFIESTO.md'];
const IDX = 'SUBSISTEMAS.md', LOCAL = 'SUBSISTEMAS-LOCAL.md';
// Las dos casas sinteticas que el catalogo lista ademas de la propia, nombradas una sola vez.
const CASA_BASE = 'remitos';     // catalogada en el Indice del Agente Multiproposito
const CASA_LOCAL = 'facturas';   // catalogada en el del Agente Desplegado

const frontmatter = (nombre, origen) => '---\nindice: ' + nombre + '\norigen: ' + origen + '\n'
  + 'columnas: [Código, Nombre, Descripción, Operación, Detalle]\ndescripcion: qué guarda el subsistema\n---\n\n';
const CABECERA = '| Código | Nombre | Descripción | Operación | Detalle |\n|---|---|---|---|---|\n';
const fila = (cod, nombre, desc, op, detalle) => `| ${cod} | ${nombre} | ${desc} | ${op} | ${detalle} |`;

function catalogoBase() {
  return frontmatter('Subsistemas', 'agente-multiproposito')
    + '# Subsistemas\n\nDatos sintéticos: este catálogo existe solo para romperlo.\n\n' + CABECERA
    + [
      fila('Base-0001', 'subsistemas', 'Catálogo y coordinación entre casas', '`agregar-subsistema`', '[subsistemas/](./)'),
      fila('Base-0002', CASA_BASE, 'Los remitos del período y su estado', '`registrar-remito`', `[${CASA_BASE}/](../${CASA_BASE}/)`),
    ].join('\n') + '\n';
}
function catalogoLocal() {
  return frontmatter('Subsistemas del Agente Desplegado', 'agente-desplegado')
    + '# Subsistemas del Agente Desplegado\n\nDatos sintéticos: este catálogo existe solo para romperlo.\n\n' + CABECERA
    + fila('Local-0001', CASA_LOCAL, 'Las facturas recibidas y su archivo', '`registrar-factura`', `[${CASA_LOCAL}/](../${CASA_LOCAL}/)`) + '\n';
}
const casa = nombre => {
  const d = path.join(CLAUDE, nombre);
  fs.mkdirSync(d, { recursive: true });
  fs.writeFileSync(path.join(d, 'MANIFIESTO.md'), `# ${nombre} — manifiesto de subsistema\n\nDatos sintéticos.\n`);
  return d;
};

function armar() {
  fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
  fs.mkdirSync(BANCO, { recursive: true });
  for (const f of DEL_SUBSISTEMA) {
    const src = path.join(ORIGEN, f);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(BANCO, f));
  }
  escribir(IDX, catalogoBase());
  escribir(LOCAL, catalogoLocal());
  casa(CASA_BASE);
  casa(CASA_LOCAL);
}
const leer = f => fs.readFileSync(path.join(BANCO, f), 'utf8');
const escribir = (f, t) => fs.writeFileSync(path.join(BANCO, f), t);

function correr() {
  const r = cp.spawnSync('node', [LINT, CLAUDE], { encoding: 'utf8' });
  return { texto: (r.stdout || '') + (r.stderr || ''), codigo: r.status };
}
// Se lee del número que el propio lint informa en su encabezado de sección, no contando líneas: si
// el formato cambia, esto devuelve -1 y se ve, en vez de devolver 0 y hacer pasar todo en verde.
const cuantos = texto => {
  const m = /^\[CATALOGO vs DISCO\] \((\d+)\)/m.exec(texto);
  return m ? parseInt(m[1], 10) : -1;
};

let malos = 0;

console.log('== CASO BUENO: el banco intacto da cero ==');
armar();
{
  const { texto, codigo } = correr();
  const n = cuantos(texto);
  const ok = n === 0 && codigo === 0;
  console.log(`${ok ? 'OK  ' : 'FALLA'} banco sin tocar → ${n} hallazgos, código de salida ${codigo}`);
  if (!ok) { malos++; console.log(texto.split('\n').filter(l => l.trim() && !l.startsWith('subsistemas:')).join('\n')); }
}

const casos = [];
const caso = (nombre, fragmento, romper) => casos.push({ nombre, fragmento, romper });

caso('código con prefijo que no corresponde al origen', 'no tiene la forma',
  () => escribir(IDX, leer(IDX).replace('| Base-0002 |', '| Local-0002 |')));

caso('código duplicado', 'codigo duplicado',
  () => escribir(IDX, leer(IDX).replace('| Base-0002 |', '| Base-0001 |')));

caso('fila sin Descripción', 'no tiene Descripción',
  () => escribir(IDX, leer(IDX).replace(/(\| Base-0002 \| [^|]+\| )[^|]+(\|)/, '$1 $2')));

caso('subsistema catalogado dos veces', 'fila duplicada',
  () => escribir(IDX, leer(IDX).replace(/(\| Base-0002 \| )[^|]+(\|)/, '$1subsistemas $2')));

caso('fila sin casa en la columna Detalle', 'sin casa en Detalle',
  () => escribir(IDX, leer(IDX).replace(/(\| Base-0002 \|[^\n]*\| )\[[^\]]+\]\([^)]+\)( \|)/, '$1—$2')));

caso('casa catalogada que no existe en disco', 'casa inexistente',
  () => escribir(IDX, leer(IDX).replace(`[${CASA_BASE}/](../${CASA_BASE}/)`, '[carpeta-que-no-existe/](../carpeta-que-no-existe/)')));

caso('casa sin manifiesto', 'sin MANIFIESTO.md',
  () => fs.rmSync(path.join(CLAUDE, CASA_BASE, 'MANIFIESTO.md')));

// El defecto que deja un subsistema invisible: la carpeta está, nadie la cataloga, y las habilidades
// que descubren subsistemas por el catálogo no la ven nunca.
caso('casa en disco que el catálogo no lista', 'casa no catalogada',
  () => casa('inventario'));

caso('columna declarada que la tabla no tiene', 'columna declarada',
  () => escribir(IDX, leer(IDX).replace(/^columnas: \[(.+)\]$/m, 'columnas: [$1, Inventada]')));

console.log('\n== CASOS MALOS: cada control se enciende ante su defecto ==');
for (const c of casos) {
  armar();
  try { c.romper(); } catch (e) { console.log(`FALLA ${c.nombre}\n      no se pudo romper el banco: ${e.message}`); malos++; continue; }
  const { texto, codigo } = correr();
  if (!texto.includes(c.fragmento)) {
    console.log(`FALLA ${c.nombre}  → no apareció "${c.fragmento}" (hallazgos: ${cuantos(texto)})`);
    malos++; continue;
  }
  if (codigo !== 0) {
    console.log(`FALLA ${c.nombre}  → informó el hallazgo pero salió con código ${codigo} (los lints reportan, no fallan)`);
    malos++; continue;
  }
  console.log(`OK    ${c.nombre}  → hallazgos: ${cuantos(texto)}, código ${codigo}`);
}

// -- CASO BUENO fino: el catálogo del Agente Desplegado sin filas es válido --
// Es el estado de un repo recién instalado, que todavía no sumó ningún subsistema propio: el Índice
// existe, declarado y con su tabla, y no tiene ninguna fila.
console.log('\n== CASO BUENO: el catálogo del Agente Desplegado sin filas es válido ==');
armar();
{
  escribir(LOCAL, leer(LOCAL).split('\n').filter(l => !/^\| Local-/.test(l)).join('\n'));
  fs.rmSync(path.join(CLAUDE, CASA_LOCAL), { recursive: true, force: true });
  const { texto, codigo } = correr();
  const n = cuantos(texto);
  const ok = n === 0 && codigo === 0;
  console.log(`${ok ? 'OK  ' : 'FALLA'} ${LOCAL} declarado y sin filas → ${n} hallazgos`);
  if (!ok) { malos++; console.log(texto); }
}

// -- CASO BUENO fino: un Índice guardado con marca de orden de bytes se sigue leyendo --
console.log('\n== CASO BUENO: la marca de orden de bytes no tapa el frontmatter ==');
armar();
{
  // Un `.md` guardado con marca de orden de bytes deja de matchear `^---`, así que el Índice pierde
  // su frontmatter y se lee como NO declarado: el manifiesto pasa a listar un Índice que "no existe
  // o no declara frontmatter", y los chequeos que dependen del `origen` dejan de correr en silencio.
  // Este fragmento viaja idéntico a los ocho lints de subsistema, así que probarlo acá los cubre.
  escribir(IDX, '\uFEFF' + leer(IDX));
  const { texto, codigo } = correr();
  const n = cuantos(texto);
  // Se exige el mensaje puntual además del total: el mismo archivo puede encender otros controles,
  // y un total distinto de cero no diría CUÁL se encendió.
  const tapado = texto.includes('no declara frontmatter');
  const ok = n === 0 && codigo === 0 && !tapado;
  console.log(`${ok ? 'OK  ' : 'FALLA'} ${IDX} con la marca → ${n} hallazgos${tapado ? ' (el frontmatter quedó tapado)' : ''}`);
  if (!ok) malos++;
}

fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
console.log(`\ncasos: ${casos.length + 3}`);
console.log(malos ? `${malos} FALLARON.` : 'TODO VERDE.');
process.exit(malos ? 1 : 0);
