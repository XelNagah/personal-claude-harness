// Prueba cada control de lint-preferencias contra un caso malo y uno bueno.
//
// Este lint no agrupa por secciones: emite una lista plana de problemas. Así que cada caso declara
// un FRAGMENTO del mensaje esperado, y no alcanza con que el conteo suba — si subiera por otro
// motivo, la prueba pasaría por la razón equivocada.
//
// El control más valioso del conjunto no mira la tabla sino el contexto: verifica que el punto de
// entrada importe el manifiesto y que el manifiesto importe sus Índices. Sin eso las preferencias
// existen y **no están cargadas**, que es la falla que el subsistema entero existe para evitar y la
// que ningún otro control puede ver.
//
// EL BANCO FABRICA SUS DOS ÍNDICES Y SU PUNTO DE ENTRADA. Antes copiaba el `.claude/` del repo que lo
// corre y rompía filas REALES por su código —`Base-0003`, `Base-0009`— y una página de detalle por su
// nombre. Eso ataba el banco a que la Base siguiera trayendo esas filas exactas, y hacía que el caso
// bueno —«el banco intacto da cero»— midiera la salud de las preferencias que escribió el repo
// destino, que este banco no tiene por qué juzgar: para eso está el lint corriendo sobre el repo. Es
// la forma «escenario prestado» del conocimiento `controles-que-no-avisan`, y la Decisión
// `Local-0075` es la que la prohíbe para todos los bancos que viajan.
//
// Lo único que se toma del subsistema instalado es el `MANIFIESTO.md`, Componente del Agente
// Multipropósito e igual en todas las instalaciones, y que es además lo que dos de los controles
// contrastan: el que compara los Índices declarados contra lo que el manifiesto lista, y el que
// verifica que el manifiesto importe cada Índice que declara cargar.
//
// Uso: node .claude/preferencias/lint-preferencias/pruebas.js   (desde la raíz del repo)
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ORIGEN = '.claude/preferencias';
const REPO_PRUEBA = '.claude/tmp/repo-prueba-preferencias';
const CLAUDE = path.join(REPO_PRUEBA, '.claude');
const BANCO = path.join(CLAUDE, 'preferencias');
const LINT = '.claude/preferencias/lint-preferencias/lint-preferencias.js';

const DEL_SUBSISTEMA = ['MANIFIESTO.md'];
const IDX = 'PREFERENCIAS.md', LOCAL = 'PREFERENCIAS-LOCAL.md';
// La página de detalle que una fila local referencia, nombrada una sola vez.
const PAGINA = 'como-se-archivan-las-facturas.md';
// El código cuyo Nombre otro caso copia, y el Nombre en cuestión: se nombran acá para que ningún
// caso los vuelva a escribir.
const NOMBRE_BASE_1 = 'Mostrar el texto exacto antes de escribir en un registro canónico';

const frontmatter = (nombre, origen) => '---\nindice: ' + nombre + '\norigen: ' + origen + '\n'
  + 'columnas: [Código, Nombre, Descripción, Detalle]\ndescripcion: qué pide la preferencia\n---\n\n';
const CABECERA = '| Código | Nombre | Descripción | Detalle |\n|--------|--------|-------------|---------|\n';
const fila = (cod, nombre, desc, detalle) => `| ${cod} | ${nombre} | ${desc} | ${detalle} |`;

function indiceBase() {
  return frontmatter('Preferencias', 'agente-multiproposito')
    + '# Preferencias\n\nDatos sintéticos: este registro existe solo para romperlo.\n\n'
    + '## Preferencias del Agente Multipropósito\n\n' + CABECERA
    + [
      fila('Base-0001', NOMBRE_BASE_1, 'Antes de escribir en un registro canónico, mostrar el texto exacto y esperar el visto bueno.', '—'),
      fila('Base-0002', 'Distinguir lo verificado de lo inferido', 'No presentar como cierto lo que no proviene de una fuente comprobada.', '—'),
    ].join('\n') + '\n';
}
function indiceLocal() {
  return frontmatter('Preferencias del Agente Desplegado', 'agente-desplegado')
    + '# Preferencias del Agente Desplegado\n\nDatos sintéticos: este registro existe solo para romperlo.\n\n'
    + '## Preferencias del Agente Desplegado\n\n' + CABECERA
    + [
      fila('Local-0001', 'Usar fechas en formato argentino al hablar con el usuario', 'Nunca `MM/DD` ni ISO en la conversación.', '—'),
      fila('Local-0002', 'Archivar las facturas por proveedor', 'Cada factura se archiva bajo la carpeta de su proveedor.', `[${PAGINA}](${PAGINA})`),
    ].join('\n') + '\n';
}

// Hace falta la raíz del repo además de `.claude/`: el lint chequea que el punto de entrada importe
// el manifiesto, y sin punto de entrada ese control se dispara siempre.
const AGENTS = '# Instrucciones del repo de prueba\n\nDatos sintéticos.\n\n@.claude/preferencias/MANIFIESTO.md\n';

function armar() {
  fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
  fs.mkdirSync(BANCO, { recursive: true });
  for (const f of DEL_SUBSISTEMA) {
    const src = path.join(ORIGEN, f);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(BANCO, f));
  }
  escribir(IDX, indiceBase());
  escribir(LOCAL, indiceLocal());
  fs.writeFileSync(path.join(BANCO, PAGINA),
    '# Cómo se archivan las facturas\n\nDatos sintéticos: esta página existe para que una fila la referencie.\n');
  fs.writeFileSync(path.join(REPO_PRUEBA, 'AGENTS.md'), AGENTS);
}
const leer = f => fs.readFileSync(path.join(BANCO, f), 'utf8');
const escribir = (f, t) => fs.writeFileSync(path.join(BANCO, f), t);

function correr() {
  const r = cp.spawnSync('node', [LINT, CLAUDE], { encoding: 'utf8' });
  return (r.stdout || '') + (r.stderr || '');
}
const cuantos = salida => {
  const m = /hallazgos: (\d+)/.exec(salida);
  return m ? parseInt(m[1], 10) : -1;
};

let malos = 0;

console.log('== CASO BUENO: el banco intacto da cero ==');
armar();
{
  const s = correr(), n = cuantos(s);
  console.log(`${n === 0 ? 'OK  ' : 'FALLA'} banco sin tocar → ${n} hallazgos`);
  if (n !== 0) { malos++; console.log(s.split('\n').filter(l => l.includes('[x]')).join('\n')); }
}

const casos = [];
const caso = (nombre, fragmento, romper) => casos.push({ nombre, fragmento, romper });

caso('código con prefijo que no corresponde al origen', 'no tiene la forma',
  () => escribir(IDX, leer(IDX).replace('| Base-0001 |', '| Local-0099 |')));

caso('código duplicado', 'codigo duplicado',
  () => escribir(IDX, leer(IDX).replace('| Base-0002 |', '| Base-0001 |')));

caso('fila sin Nombre', 'no tiene Nombre',
  () => escribir(IDX, leer(IDX).replace(/(\| Base-0002 \| )[^|]+(\|)/, '$1 $2')));

// Se le pone a Base-0002 el Nombre que ya tiene Base-0001, que es otro: ponerle el suyo propio no
// duplica nada y el caso pasaría en verde sin ejercitar el control.
caso('nombre duplicado', 'nombre duplicado',
  () => escribir(IDX, leer(IDX).replace(/(\| Base-0002 \| )[^|]+(\|)/, `$1${NOMBRE_BASE_1} $2`)));

caso('fila sin Descripción', 'no tiene Descripción',
  () => escribir(IDX, leer(IDX).replace(/(\| Base-0002 \| [^|]+\| )[^|]+(\|)/, '$1 $2')));

caso('Detalle que apunta a una página que no existe', 'que no existe',
  () => escribir(LOCAL, leer(LOCAL).replace(`[${PAGINA}](${PAGINA})`, '[no-existe.md](no-existe.md)')));

caso('página que ninguna celda Detalle declara', 'pagina huerfana',
  () => fs.writeFileSync(path.join(BANCO, 'pagina-suelta.md'), '# Suelta\n\nNadie la declara.\n'));

// El control de las secciones `##` vive en la rama de la FORMA VIEJA: solo corre cuando ningún
// Índice declara frontmatter, porque ahí los encabezados eran el único mecanismo de separación por
// origen. Con dos Índices declarados ese chequeo no aplica —la separación es por archivo—, así que
// para ejercitarlo hay que reconstruir la forma vieja: un solo archivo, sin frontmatter, con las dos
// secciones adentro. Es el estado de un Agente Desplegado que todavía no se niveló.
caso('forma vieja: falta la sección del Agente Multipropósito', 'falta la seccion',
  () => {
    fs.rmSync(path.join(BANCO, LOCAL));
    const sinFrontmatter = leer(IDX).replace(/^---[\s\S]*?\n---\n/, '');
    escribir(IDX, sinFrontmatter.replace('## Preferencias del Agente Multipropósito', '## Otra cosa')
      + '\n## Preferencias del Agente Desplegado\n\n(vacía)\n');
  });

// El control que importa de verdad: la preferencia existe pero queda fuera del contexto.
caso('el punto de entrada dejó de importar el manifiesto', 'no queda en contexto',
  () => fs.writeFileSync(path.join(REPO_PRUEBA, 'AGENTS.md'), '# Instrucciones\n\nSin importar nada.\n'));

caso('el manifiesto declara cargar un Índice que no importa', 'no importa @',
  () => escribir('MANIFIESTO.md', leer('MANIFIESTO.md').replace(/^@PREFERENCIAS-LOCAL\.md$/m, '')));

console.log('\n== CASOS MALOS: cada control se enciende ante su defecto ==');
for (const c of casos) {
  armar();
  try { c.romper(); } catch (e) { console.log(`FALLA ${c.nombre}\n      no se pudo romper el banco: ${e.message}`); malos++; continue; }
  const s = correr();
  if (!s.includes(c.fragmento)) {
    console.log(`FALLA ${c.nombre}  → no apareció "${c.fragmento}" (hallazgos: ${cuantos(s)})`);
    malos++; continue;
  }
  console.log(`OK    ${c.nombre}  → hallazgos: ${cuantos(s)}`);
}

// -- CASO BUENO fino: el Índice del Agente Desplegado sin filas es válido ----
// Es el estado de un repo recién instalado: el Índice del Agente Desplegado existe, declarado y con
// su tabla, y todavía no tiene ninguna preferencia propia. Sale también la página de detalle que
// declaraba una de sus filas, porque una instalación pública nunca la recibe.
console.log('\n== CASO BUENO: el Índice del Agente Desplegado sin filas propias es válido ==');
armar();
{
  escribir(LOCAL, leer(LOCAL).split('\n').filter(l => !/^\| Local-/.test(l)).join('\n'));
  fs.rmSync(path.join(BANCO, PAGINA));
  const s = correr(), n = cuantos(s);
  console.log(`${n === 0 ? 'OK  ' : 'FALLA'} sin preferencias propias → ${n} hallazgos`);
  if (n !== 0) { malos++; console.log(s.split('\n').filter(l => l.includes('[x]')).join('\n')); }
}

fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
console.log(`\ncasos: ${casos.length + 2}`);
console.log(malos ? `${malos} FALLARON.` : 'TODO VERDE.');
process.exit(malos ? 1 : 0);
