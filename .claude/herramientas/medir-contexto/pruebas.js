// Prueba cada control de medir-contexto contra un caso malo y uno bueno. Un medidor que lee mal
// contesta "0 KB" sin emitir ninguna senal, asi que verde no prueba nada por si solo: cada control
// tiene que ENCENDERSE ante su defecto, y solo ante el suyo.
//
// Los casos se arman sobre repos de prueba y NO sobre el repo real: afirmar algo del repo real
// meteria un numero absoluto adentro de la prueba, que envejece igual que adentro de un registro —
// el dia que el repo pase el tope, el banco fallaria avisando de un defecto que no existe.
//
// El repo de prueba vive en `.claude/tmp/`, que este repo gitignorea y sus controles excluyen: en
// cualquier otro lado, sus archivos se levantarian como contenido de verdad.
//
// Uso: node .claude/herramientas/medir-contexto/pruebas.js   (desde la raíz del repo)
const fs = require('fs'), path = require('path'), cp = require('child_process');
const TOOL = '.claude/herramientas/medir-contexto/medir-contexto.js';
const BASE_TMP = '.claude/tmp';
const BASE_QUE_VIAJA = 'funcionalidades/amp/skills/inicializar/base';

let malos = 0, casos = 0;
function chequear(nombre, ok, detalle) {
  casos++;
  console.log(`${ok ? 'OK  ' : 'FALLA'} ${nombre}${detalle ? '  → ' + detalle : ''}`);
  if (!ok) malos++;
}
function correr(repo) {
  const r = cp.spawnSync('node', [TOOL, repo], { encoding: 'utf8' });
  return { texto: (r.stdout || '') + (r.stderr || ''), codigo: r.status };
}
// Arma un repo de prueba desde cero con los archivos que se le pasen.
function armar(nombre, archivos) {
  const dir = path.join(BASE_TMP, 'repo-prueba-' + nombre);
  fs.rmSync(dir, { recursive: true, force: true });
  for (const [rel, contenido] of Object.entries(archivos)) {
    const f = path.join(dir, rel);
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, contenido);
  }
  fs.mkdirSync(path.join(dir, '.claude'), { recursive: true });
  return dir;
}
// Las tres categorias y el tope, leidos de la salida. Se leen por rotulo y no por posicion: el dia
// que cambie el orden de las lineas, un lector por posicion mide otra cosa y no avisa.
const kbDe = t => (t.match(/total cargado: ([\d.]+) KB/) || [])[1];
const ampDe = t => (t.match(/Agente Multipropósito\s+([\d.]+) KB/) || [])[1];
const topeDe = t => (t.match(/Agente Multipropósito\s+[\d.]+ KB\s+de ([\d.]+) KB/) || [])[1];
const propioDe = t => (t.match(/este repo\s+([\d.]+) KB/) || [])[1];
const afueraDe = t => (t.match(/afuera\s+([\d.]+) KB/) || [])[1];
const nada = { 'AGENTS.md': '# Solo para leer el tope\n' };

console.log('== CASO BUENO: un repo liviano queda dentro del tope ==');
{
  const repo = armar('liviano', { 'AGENTS.md': '# Punto de entrada\n\nCorto.\n' });
  const { texto, codigo } = correr(repo);
  chequear('mide y no avisa', /DENTRO DEL TOPE/.test(texto), `${kbDe(texto)} KB cargados`);
  chequear('  …y reporta sin fallar', codigo === 0, `codigo ${codigo}`);
}

console.log('\n== CASO MALO: pasar el tope se avisa ==');
{
  // El tamaño se DERIVA del tope que informa la Herramienta, no se escribe acá. Estaba en 50 KB, que
  // pasaba el tope de 48 y dejó de pasarlo el día que subió a 52: el caso se apagó solo, sin que
  // nada cambiara en lo que prueba. Un número absoluto envejece adentro de una prueba igual que
  // adentro de un registro — que es lo que el encabezado de este banco ya decía.
  const topeKb = parseFloat(topeDe(correr(armar('sonda', nada)).texto));
  if (!(topeKb > 0)) chequear('no se pudo leer el tope para armar el caso', false);
  // Lo que pasa el tope tiene que ser lo que VIAJA, no el total: el gordo va en `.claude/` y con
  // contraparte en la carpeta que viaja. Un archivo gordo del repo ya no enciende nada, y ese es
  // justamente el cambio que este caso custodia.
  const gordo = 'x'.repeat(Math.ceil(topeKb * 2) * 1024) + '\n';
  const repo = armar('pesado', {
    'AGENTS.md': '@.claude/gordo.md\n',
    '.claude/gordo.md': gordo,
    [`${BASE_QUE_VIAJA}/gordo.md`]: gordo,
  });
  const { texto, codigo } = correr(repo);
  chequear('avisa cuando lo que viaja pasa el tope', /PASA EL TOPE/.test(texto), `${ampDe(texto)} KB de ${topeKb}`);
  // Reportar y fallar son contratos distintos: este reporta. Si saliera != 0, el control de cierre
  // lo leeria como una rotura y no como el estado del repo.
  chequear('  …y sigue reportando sin fallar', codigo === 0, `codigo ${codigo}`);
}

console.log('\n== EL TOPE MIRA LO QUE VIAJA, NO EL TOTAL ==');
{
  // El caso central de la Decisión Local-0067. Un repo que aprendió mucho carga muchísimo y NO tiene
  // que encender nada: lo que aprendió no lo hereda nadie y su umbral es suyo. Con el tope sobre el
  // total, este caso daba rojo — y la salida que sugería era recortar lo aprendido.
  const topeKb = parseFloat(topeDe(correr(armar('sonda2', nada)).texto));
  const repo = armar('aprendio', {
    'AGENTS.md': '@.claude/registro.md\n',
    '.claude/registro.md': '# Registro\n' + '| fila que este repo aprendió |\n'.repeat(2000),
    [`${BASE_QUE_VIAJA}/registro.md`]: '# Registro\n',
  });
  const { texto } = correr(repo);
  const total = parseFloat(kbDe(texto)), propio = parseFloat(propioDe(texto));
  chequear('un repo que aprendió mucho no enciende el tope', /DENTRO DEL TOPE/.test(texto),
    `carga ${total} KB, tope ${topeKb} KB`);
  chequear('  …y lo aprendido se le atribuye a él', propio > topeKb, `este repo ${propio} KB`);
}

console.log('\n== SIGUE LAS LÍNEAS @ ==');
{
  // Sin seguir los imports el medidor cuenta solo el punto de entrada y contesta un numero chico,
  // que es la forma en que este control se apagaria sin avisar.
  const repo = armar('importa', {
    'AGENTS.md': '# Entrada\n\n@.claude/importado.md\n',
    '.claude/importado.md': 'y'.repeat(3 * 1024) + '\n',
  });
  const { texto } = correr(repo);
  chequear('cuenta el archivo importado con `@`', /importado\.md/.test(texto), `${kbDe(texto)} KB en la cuenta`);
  chequear('  …y son 2 archivos, no 1', /archivos: 2\b/.test(texto),
    (texto.match(/archivos: \d+/) || ['(?)'])[0]);
}

console.log('\n== SIN PUNTO DE ENTRADA LO DICE ==');
{
  // Cero archivos no es un repo liviano: es que no se encontro por donde empezar. Callarlo haria
  // que la ausencia se lea como un contexto de 0 KB, que es el control validando sobre un conjunto
  // vacio y contestando en verde.
  const repo = armar('vacio', { 'README.md': 'Ni CLAUDE.md ni AGENTS.md.\n' });
  const { texto } = correr(repo);
  chequear('no se calla ante un repo sin punto de entrada',
    /no hay contexto que medir/.test(texto) && !/DENTRO DEL TOPE/.test(texto),
    'lo dice en vez de informar 0 KB');
}

console.log('\n== CASO BUENO: mide el repo que se le pasa ==');
{
  // Regresion conocida: un script que deduce "el repo" de su propia ubicacion describe el repo
  // equivocado y no falla, contesta. Se afirma que NO aparece el punto de entrada del repo real.
  const repo = armar('ajeno', { 'AGENTS.md': '# Otro repo\n\nSolo esto.\n' });
  const { texto } = correr(repo);
  chequear('mide el repo pasado y no el propio',
    /archivos: 1\b/.test(texto), (texto.match(/archivos: \d+/) || ['(?)'])[0]);
}

// Las tres categorias se apagan solas de formas distintas: sin `base/` la del Agente Multiproposito
// da 0 y se lee como "no manda nada"; un registro del Agente Desplegado que viaja con filas la infla
// con entradas de este repo; y el punto de entrada no tiene contraparte, asi que contarlo entero de
// un lado o del otro son dos errores opuestos y ninguno emite senal.

console.log('\n== LO QUE MANDA SALE DE `base/`, NO DEL REPO ==');
{
  // El Indice del Agente Desplegado: 2 KB de encabezado que viaja + 4 KB de filas que se quedan acá.
  // Los tres numeros son distintos entre si a proposito. Si fueran parecidos, el caso pasaria igual
  // con la categoria en 0 —que es el modo de falla real, "no encontro `base/` y contesto"— y con
  // ella en el total, que es el otro error posible. Cada afirmacion tiene que poder distinguirlos.
  const encabezado = '# Paginas\n\n' + 'convencion del registro. '.repeat(80) + '\n| A |\n|---|\n';
  const repo = armar('manda', {
    'AGENTS.md': '@.claude/conocimiento/INDICE-LOCAL.md\n',
    '.claude/conocimiento/INDICE-LOCAL.md': encabezado + '| fila propia de este repo, que no hereda nadie |\n'.repeat(90),
    [`${BASE_QUE_VIAJA}/conocimiento/INDICE-LOCAL.md`]: encabezado,
  });
  const { texto } = correr(repo);
  const amp = parseFloat(ampDe(texto)), total = parseFloat(kbDe(texto)), propio = parseFloat(propioDe(texto));
  chequear('lo que manda es el peso del archivo que viaja', amp >= 1.9 && amp <= 2.1,
    `${amp} KB (esperado ~2.0, ni 0 ni el total ${total})`);
  chequear('el resto se atribuye a este repo', propio >= 3.5 && Math.abs(amp + propio - total) < 0.15,
    `este repo ${propio} KB, y las dos suman ${(amp + propio).toFixed(1)} de ${total}`);
}

console.log('\n== EL CABLEADO DEL PUNTO DE ENTRADA CUENTA COMO DEL AGENTE MULTIPROPÓSITO ==');
{
  // El bloque `## Subsistemas` es lo unico del Agente Multiproposito que no viaja como archivo: se
  // fusiona adentro del que el repo ya tenia. Dejarlo afuera achica el numero controlado justo en la
  // parte que crece con cada subsistema nuevo. Se cuenta desde su encabezado hasta el proximo `## `,
  // ni una linea mas: lo que sigue es del repo.
  const bloque = '## Subsistemas\n\n' + 'x'.repeat(2 * 1024) + '\n\n';
  const repo = armar('cableado', {
    'AGENTS.md': '# Proyecto\n\n' + 'y'.repeat(4 * 1024) + '\n\n' + bloque + '## Lo que sigue es del repo\n\n' + 'z'.repeat(3 * 1024) + '\n',
  });
  const { texto } = correr(repo);
  const amp = parseFloat(ampDe(texto)), afuera = parseFloat(afueraDe(texto));
  chequear('el bloque de cableado cuenta como del Agente Multipropósito', amp >= 1.9 && amp <= 2.2,
    `${amp} KB (esperado ~2.0)`);
  chequear('  …y no se lleva lo que viene después del bloque', afuera >= 6.9 && afuera <= 7.2,
    `afuera ${afuera} KB (esperado ~7.0)`);
  chequear('  …y no se cuenta como aprendido de este repo', parseFloat(propioDe(texto)) === 0,
    `este repo ${propioDe(texto)} KB`);
}

console.log('\n== SIN BLOQUE DE CABLEADO, LO DICE ==');
{
  // Cero cableado no es un repo sin cableado: es que no se hallo el encabezado —lo renombraron, o el
  // punto de entrada es de otra forma—. Callarlo deja el numero controlado corto y en verde, que es
  // el control midiendo una entrada mutilada sin emitir senal.
  const repo = armar('sin-cableado', { 'AGENTS.md': 'x'.repeat(3 * 1024) + '\n' });
  const { texto } = correr(repo);
  chequear('avisa que no halló el bloque de cableado', /no se halló el bloque/.test(texto) || /no se hallo el bloque/.test(texto),
    'lo dice en vez de contar 0 en silencio');
  chequear('  …y el punto de entrada entero queda afuera', parseFloat(afueraDe(texto)) === 3.0,
    `afuera ${afueraDe(texto)} KB, este repo ${propioDe(texto)} KB`);
}

console.log('\n== UN ÍNDICE PROPIO QUE NO VIAJA ES DE ESTE REPO, NO «AFUERA» ==');
{
  // «Afuera» es el punto de entrada, no cualquier archivo sin contraparte. Un subsistema que el repo
  // se agrego para su Proposito no viaja y es suyo entero: contarlo como afuera lo sacaria de la
  // unica categoria donde se lo puede ver crecer.
  const repo = armar('propio', {
    'AGENTS.md': '@.claude/mio/INDICE.md\n',
    '.claude/mio/INDICE.md': 'm'.repeat(5 * 1024) + '\n',
  });
  const { texto } = correr(repo);
  chequear('lo propio bajo `.claude/` cuenta como este repo', parseFloat(propioDe(texto)) >= 4.9,
    `este repo ${propioDe(texto)} KB, afuera ${afueraDe(texto)} KB`);
}

console.log('\n== UN REPO SIN `base/` NO INVENTA UN NÚMERO ==');
{
  const repo = armar('sin-base', { 'AGENTS.md': '@.claude/X.md\n', '.claude/X.md': 'y'.repeat(2 * 1024) });
  const { texto } = correr(repo);
  chequear('sin carpeta que viaje, lo que manda es 0 y no el total', parseFloat(ampDe(texto)) === 0,
    `${ampDe(texto)} KB con total ${kbDe(texto)} KB`);
}

for (const n of ['liviano', 'sonda', 'sonda2', 'pesado', 'aprendio', 'importa', 'vacio', 'ajeno',
                 'manda', 'cableado', 'sin-cableado', 'propio', 'sin-base']) {
  fs.rmSync(path.join(BASE_TMP, 'repo-prueba-' + n), { recursive: true, force: true });
}

console.log(`\ncasos: ${casos}`);
console.log(malos ? `${malos} FALLARON.` : 'TODO VERDE.');
process.exit(malos ? 1 : 0);
