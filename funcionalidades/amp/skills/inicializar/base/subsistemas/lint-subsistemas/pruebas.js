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
// Uso: node .claude/subsistemas/lint-subsistemas/pruebas.js   (desde la raíz del repo)
const fs = require('fs'), path = require('path'), cp = require('child_process');
const REPO_PRUEBA = '.claude/tmp/repo-prueba-subsistemas';
const CLAUDE = path.join(REPO_PRUEBA, '.claude');
const BANCO = path.join(CLAUDE, 'subsistemas');
const LINT = '.claude/subsistemas/lint-subsistemas/lint-subsistemas.js';

function armar() {
  fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
  const salteados = new Set(['tmp', 'pendientes', 'ejecutados', 'descartados']);
  fs.mkdirSync(CLAUDE, { recursive: true });
  for (const e of fs.readdirSync('.claude', { withFileTypes: true })) {
    if (salteados.has(e.name)) continue;
    fs.cpSync(path.join('.claude', e.name), path.join(CLAUDE, e.name), {
      recursive: true,
      filter: src => !salteados.has(path.basename(src)),
    });
  }
  fs.rmSync(path.join(BANCO, 'lint-subsistemas'), { recursive: true, force: true });
}
const leer = f => fs.readFileSync(path.join(BANCO, f), 'utf8');
const escribir = (f, t) => fs.writeFileSync(path.join(BANCO, f), t);
const IDX = 'SUBSISTEMAS.md', LOCAL = 'SUBSISTEMAS-LOCAL.md';

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
  if (!ok) { malos++; console.log(texto.split('\n').filter(l => l.includes('[!]')).join('\n')); }
}

const casos = [];
const caso = (nombre, fragmento, romper) => casos.push({ nombre, fragmento, romper });

caso('código con prefijo que no corresponde al origen', 'no tiene la forma',
  () => escribir(IDX, leer(IDX).replace('| Base-0005 |', '| Local-0005 |')));

caso('código duplicado', 'codigo duplicado',
  () => escribir(IDX, leer(IDX).replace('| Base-0006 |', '| Base-0005 |')));

caso('fila sin Descripción', 'no tiene Descripción',
  () => escribir(IDX, leer(IDX).replace(/(\| Base-0006 \| [^|]+\| )[^|]+(\|)/, '$1 $2')));

caso('subsistema catalogado dos veces', 'fila duplicada',
  () => escribir(IDX, leer(IDX).replace(/(\| Base-0006 \| )[^|]+(\|)/, '$1semantica $2')));

caso('fila sin casa en la columna Detalle', 'sin casa en Detalle',
  () => escribir(IDX, leer(IDX).replace(/(\| Base-0006 \|[^\n]*\| )\[[^\]]+\]\([^)]+\)( \|)/, '$1—$2')));

caso('casa catalogada que no existe en disco', 'casa inexistente',
  () => escribir(IDX, leer(IDX).replace('[decisiones/](../decisiones/)', '[carpeta-que-no-existe/](../carpeta-que-no-existe/)')));

caso('casa sin manifiesto', 'sin MANIFIESTO.md',
  () => fs.rmSync(path.join(CLAUDE, 'decisiones', 'MANIFIESTO.md')));

// El defecto que deja un subsistema invisible: la carpeta está, nadie la cataloga, y las habilidades
// que descubren subsistemas por el catálogo no la ven nunca.
caso('casa en disco que el catálogo no lista', 'casa no catalogada',
  () => {
    const nueva = path.join(CLAUDE, 'inventario');
    fs.mkdirSync(nueva, { recursive: true });
    fs.writeFileSync(path.join(nueva, 'MANIFIESTO.md'), '# Inventario\n\nUna casa que nadie catalogó.\n');
  });

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
console.log('\n== CASO BUENO: el catálogo del Agente Desplegado sin filas es válido ==');
armar();
{
  // Es el estado normal: este repo no sumó ningún subsistema propio.
  const { texto, codigo } = correr();
  const n = cuantos(texto);
  const ok = n === 0 && codigo === 0;
  console.log(`${ok ? 'OK  ' : 'FALLA'} SUBSISTEMAS-LOCAL.md declarado y sin filas → ${n} hallazgos`);
  if (!ok) malos++;
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
  console.log(`${ok ? 'OK  ' : 'FALLA'} SUBSISTEMAS.md con la marca → ${n} hallazgos${tapado ? ' (el frontmatter quedó tapado)' : ''}`);
  if (!ok) malos++;
}

fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
console.log(`\ncasos: ${casos.length + 3}`);
console.log(malos ? `${malos} FALLARON.` : 'TODO VERDE.');
process.exit(malos ? 1 : 0);
