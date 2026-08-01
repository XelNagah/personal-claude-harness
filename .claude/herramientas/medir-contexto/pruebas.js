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

let malos = 0;
function chequear(nombre, ok, detalle) {
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
const kbDe = t => (t.match(/total: ([\d.]+) KB/) || [])[1];

console.log('== CASO BUENO: un repo liviano queda dentro del tope ==');
{
  const repo = armar('liviano', { 'AGENTS.md': '# Punto de entrada\n\nCorto.\n' });
  const { texto, codigo } = correr(repo);
  chequear('mide y no avisa', /DENTRO DEL TOPE/.test(texto), `${kbDe(texto)} KB`);
  chequear('  …y reporta sin fallar', codigo === 0, `codigo ${codigo}`);
}

console.log('\n== CASO MALO: pasar el tope se avisa ==');
{
  // El tamaño se DERIVA del tope que informa la Herramienta, no se escribe acá. Estaba en 50 KB, que
  // pasaba el tope de 48 y dejó de pasarlo el día que subió a 52: el caso se apagó solo, sin que
  // nada cambiara en lo que prueba. Un número absoluto envejece adentro de una prueba igual que
  // adentro de un registro — que es lo que el encabezado de este banco ya decía.
  const sonda = correr(armar('sonda', { 'AGENTS.md': '# Solo para leer el tope\n' }));
  const topeKb = parseFloat((sonda.texto.match(/tope: ([\d.]+) KB/) || [])[1]);
  if (!(topeKb > 0)) { chequear('no se pudo leer el tope para armar el caso', false); }
  const repo = armar('pesado', { 'AGENTS.md': '@gordo.md\n', 'gordo.md': 'x'.repeat(Math.ceil(topeKb * 2) * 1024) + '\n' });
  const { texto, codigo } = correr(repo);
  chequear('avisa cuando el contexto pasa el tope', /PASA EL TOPE/.test(texto), `${kbDe(texto)} KB`);
  // Reportar y fallar son contratos distintos: este reporta. Si saliera != 0, el control de cierre
  // lo leeria como una rotura y no como el estado del repo.
  chequear('  …y sigue reportando sin fallar', codigo === 0, `codigo ${codigo}`);
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

for (const n of ['liviano', 'pesado', 'importa', 'vacio', 'ajeno']) {
  fs.rmSync(path.join(BASE_TMP, 'repo-prueba-' + n), { recursive: true, force: true });
}
// El piso es el otro numero: lo que carga un Agente Desplegado recien instalado, medido contra los
// archivos de `base/` y no deducido. Cada caso rompe una condicion distinta, porque las tres se
// apagan solas de formas distintas: sin `base/` el piso da 0 y se lee como "no manda nada"; un
// registro del Agente Desplegado que viaja con filas infla el piso con entradas de este repo; y un
// archivo que se fusiona no tiene contraparte, asi que contarlo como 0 o como su peso entero son
// dos errores opuestos y ninguno emite senal.
const pisoDe = t => (t.match(/piso del Agente Desplegado: ([\d.]+) KB/) || [])[1];
const propioDe = t => (t.match(/propio de este repo: ([\d.]+) KB/) || [])[1];

console.log('\n== EL PISO SALE DE `base/`, NO DEL REPO ==');
{
  // El Indice del Agente Desplegado: 2 KB de encabezado que viaja + 4 KB de filas que se quedan acá.
  // Los tres numeros son distintos entre si a proposito. Si fueran parecidos, el caso pasaria igual
  // con el piso en 0 —que es el modo de falla real, "no encontro `base/` y contesto"— y con el piso
  // en el total, que es el otro error posible. Cada afirmacion tiene que poder distinguirlos.
  const encabezado = '# Paginas\n\n' + 'convencion del registro. '.repeat(80) + '\n| A |\n|---|\n';
  const repo = armar('piso', {
    'AGENTS.md': '@.claude/conocimiento/INDICE-LOCAL.md\n',
    '.claude/conocimiento/INDICE-LOCAL.md': encabezado + '| fila propia de este repo, que no hereda nadie |\n'.repeat(90),
    'funcionalidades/amp/skills/inicializar/base/conocimiento/INDICE-LOCAL.md': encabezado,
  });
  const { texto } = correr(repo);
  const piso = parseFloat(pisoDe(texto)), total = parseFloat(kbDe(texto)), propio = parseFloat(propioDe(texto));
  chequear('el piso es el peso del archivo que viaja', piso >= 1.9 && piso <= 2.1,
    `piso ${piso} KB (esperado ~2.0, ni 0 ni el total ${total})`);
  chequear('el resto se atribuye a este repo', propio >= 3.5 && Math.abs(piso + propio - total) < 0.15,
    `propio ${propio} KB, y piso + propio = ${(piso + propio).toFixed(1)} de ${total}`);
}

console.log('\n== LO QUE SE FUSIONA NO SE CUENTA COMO PISO NI COMO PROPIO ==');
{
  // `AGENTS.md` no esta en `base/`. Contarlo como piso mentiria sobre lo que este repo manda;
  // contarlo como propio mentiria sobre lo que aprendio. Va aparte, declarado.
  const repo = armar('fusionado', { 'AGENTS.md': 'x'.repeat(3 * 1024) + '\n' });
  const { texto } = correr(repo);
  chequear('AGENTS.md no infla el piso', parseFloat(pisoDe(texto)) === 0, `piso ${pisoDe(texto)} KB`);
  chequear('AGENTS.md no infla lo propio', parseFloat(propioDe(texto)) === 0, `propio ${propioDe(texto)} KB`);
  chequear('y se declara como sin medir', /sin medir: 3\.0 KB/.test(texto));
}

console.log('\n== UN REPO SIN `base/` NO INVENTA UN PISO ==');
{
  const repo = armar('sin-base', { 'AGENTS.md': '@.claude/X.md\n', '.claude/X.md': 'y'.repeat(2 * 1024) });
  const { texto } = correr(repo);
  chequear('sin carpeta que viaje, el piso es 0 y no el total', parseFloat(pisoDe(texto)) === 0,
    `piso ${pisoDe(texto)} KB con total ${kbDe(texto)} KB`);
}

console.log('\ncasos: 14');
console.log(malos ? `${malos} FALLARON.` : 'TODO VERDE.');
process.exit(malos ? 1 : 0);
