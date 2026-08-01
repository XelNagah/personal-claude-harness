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
  const repo = armar('pesado', { 'AGENTS.md': '@gordo.md\n', 'gordo.md': 'x'.repeat(50 * 1024) + '\n' });
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
console.log('\ncasos: 8');
console.log(malos ? `${malos} FALLARON.` : 'TODO VERDE.');
process.exit(malos ? 1 : 0);
