// Banco de `limpiar-worktree`, sobre un escenario sintético.
//
// Prueba el caso que motivó la Herramienta: un worktree con un ENLACE adentro apuntando a un
// destino real. Con `git worktree remove` ese destino quedaba vacío —0 de 25 archivos, medido en el
// repo que reportó el daño—; acá se verifica que el borrado recursivo de Node deja los 25 intactos.
// Un banco que probara solo el camino feliz dejaría sin cubrir justo la condición por la que la
// Herramienta existe.
//
// El escenario se arma entero cada corrida en `.claude/tmp/` y se borra al
// terminar. Node nativo, sin dependencias.
//
// Uso: node .claude/herramientas/limpiar-worktree/pruebas.js   (desde la raíz del repo)

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const RAIZ = process.cwd();
const BANCO = path.join(RAIZ, '.claude', 'tmp', 'pruebas-limpiar-worktree');
const LIMPIAR = path.join(RAIZ, '.claude', 'herramientas', 'limpiar-worktree', 'limpiar-worktree.js');
const PREPARAR = path.join(RAIZ, '.claude', 'herramientas', 'preparar-worktree', 'preparar-worktree.js');

let malos = 0, casos = 0;
function caso(nombre, obtenido, esperado) {
  casos++;
  const ok = JSON.stringify(obtenido) === JSON.stringify(esperado);
  if (!ok) malos++;
  console.log(`${ok ? 'OK  ' : 'FALLA'} ${nombre}  → ${JSON.stringify(obtenido)}${ok ? '' : `  (esperado ${JSON.stringify(esperado)})`}`);
}

function git(cwd, args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
}

/** Corre una Herramienta y devuelve `{ codigo, texto }` sin que un código 1 tumbe el banco. */
function correr(script, args, cwd) {
  try {
    const texto = execFileSync(process.execPath, [script, ...args], {
      cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true,
    });
    return { codigo: 0, texto };
  } catch (e) {
    return { codigo: e.status === undefined ? -1 : e.status, texto: String(e.stdout || '') + String(e.stderr || '') };
  }
}

function armarEscenario() {
  fs.rmSync(BANCO, { recursive: true, force: true });
  const repo = path.join(BANCO, 'repo');
  const destinoReal = path.join(BANCO, 'destino-real');

  // El destino del enlace: 25 archivos, como en la medición original.
  fs.mkdirSync(destinoReal, { recursive: true });
  for (let i = 1; i <= 25; i++) {
    fs.writeFileSync(path.join(destinoReal, `archivo-${i}.md`), `contenido ${i}\n`);
  }

  // Un repo con `.claude/` versionado y un archivo ignorado adentro, que es el caso real.
  fs.mkdirSync(path.join(repo, '.claude', 'conocimiento'), { recursive: true });
  fs.writeFileSync(path.join(repo, '.gitignore'), '.claude/settings.local.json\n.claude/tmp/\n');
  fs.writeFileSync(path.join(repo, '.claude', 'conocimiento', 'una-pagina.md'), '# Una página\n');
  fs.writeFileSync(path.join(repo, 'README.md'), '# Repo de prueba\n');
  git(repo, ['init']);
  git(repo, ['config', 'user.email', 'banco@prueba.local']);
  git(repo, ['config', 'user.name', 'Banco de prueba']);
  git(repo, ['add', '-A']);
  git(repo, ['commit', '-m', 'inicial', '--no-gpg-sign']);

  // Lo que git no lleva y decide si el agente de adentro arranca con plugins.
  fs.writeFileSync(path.join(repo, '.claude', 'settings.local.json'), '{"enabledPlugins":["amp"]}\n');

  return { repo, destinoReal };
}

function contarDestino(destinoReal) {
  try {
    return fs.readdirSync(destinoReal).length;
  } catch {
    return -1;
  }
}

// =================================================================================================
console.log('== Escenario: worktree con un enlace adentro ==');
const { repo, destinoReal } = armarEscenario();

const preparado = correr(PREPARAR, ['con-enlace'], repo);
caso('preparar sale en verde', preparado.codigo, 0);
const arbol = path.join(repo, '.claude', 'tmp', 'worktrees', 'con-enlace');
caso('el árbol quedó en disco', fs.existsSync(arbol), true);
caso('copió el `settings.local.json` que git no llevó',
  fs.existsSync(path.join(arbol, '.claude', 'settings.local.json')), true);
caso('el archivo versionado llegó por git',
  fs.existsSync(path.join(arbol, '.claude', 'conocimiento', 'una-pagina.md')), true);

// El enlace que causaba el daño. En Windows es un junction; donde no exista, un symlink de
// directorio prueba lo mismo: que el borrado no lo atraviese.
let tipoEnlace = 'junction';
try {
  fs.symlinkSync(destinoReal, path.join(arbol, 'enlace-al-destino'), 'junction');
} catch {
  tipoEnlace = 'dir';
  fs.symlinkSync(destinoReal, path.join(arbol, 'enlace-al-destino'), 'dir');
}
caso(`enlace (${tipoEnlace}) armado adentro del worktree`,
  fs.lstatSync(path.join(arbol, 'enlace-al-destino')).isSymbolicLink(), true);
caso('el destino real tiene sus 25 archivos antes de limpiar', contarDestino(destinoReal), 25);

const limpiado = correr(LIMPIAR, ['con-enlace'], repo);
caso('limpiar sale en verde', limpiado.codigo, 0);
caso('el árbol ya no está', fs.existsSync(arbol), false);
caso('EL DESTINO REAL QUEDÓ INTACTO (con `git worktree remove` daba 0)', contarDestino(destinoReal), 25);
caso('el reporte avisó del enlace', /\[ENLACES\]/.test(limpiado.texto), true);
caso('el `.claude/` del repo sigue completo',
  fs.existsSync(path.join(repo, '.claude', 'conocimiento', 'una-pagina.md')), true);
caso('git ya no registra el worktree',
  git(repo, ['worktree', 'list']).includes('con-enlace'), false);

// =================================================================================================
console.log('\n== Escrituras en el `.claude/` del worktree: frena, y con `--forzar` respalda ==');
// El motivo no es la copia sino la reserva de códigos, que todavía no existe: dos worktrees que
// registran una entrada a la vez eligen los dos `máximo + 1`.
correr(PREPARAR, ['con-escrituras'], repo);
const arbol2 = path.join(repo, '.claude', 'tmp', 'worktrees', 'con-escrituras');
fs.writeFileSync(path.join(arbol2, '.claude', 'conocimiento', 'nueva.md'), '# Escrita adentro\n');

const frenado = correr(LIMPIAR, ['con-escrituras'], repo);
caso('sin `--forzar` sale con 1', frenado.codigo, 1);
caso('y no borra nada', fs.existsSync(arbol2), true);
caso('el reporte nombra el archivo escrito', /nueva\.md/.test(frenado.texto), true);

const forzado = correr(LIMPIAR, ['con-escrituras', '--forzar'], repo);
caso('con `--forzar` sale en verde', forzado.codigo, 0);
caso('y borra el árbol', fs.existsSync(arbol2), false);
const respaldos = (() => {
  const base = path.join(repo, '.claude', '.respaldo-amp');
  if (!fs.existsSync(base)) return [];
  const fecha = fs.readdirSync(base)[0];
  const dir = path.join(base, fecha, 'worktree-con-escrituras', 'conocimiento');
  return fs.existsSync(dir) ? fs.readdirSync(dir) : [];
})();
caso('respaldó lo escrito antes de borrar', respaldos, ['nueva.md']);

// =================================================================================================
console.log('\n== Casos de borde ==');
const inexistente = correr(LIMPIAR, ['no-existe'], repo);
caso('un nombre que no existe sale con 1', inexistente.codigo, 1);
caso('y lo dice sin borrar nada', /no registra ningún worktree/.test(inexistente.texto), true);

const listado = correr(LIMPIAR, ['--listar'], repo);
caso('`--listar` sale en verde', listado.codigo, 0);
caso('y muestra el principal', /principal/.test(listado.texto), true);

// Registrado por git y ausente en disco: lo que deja un borrado a mano sin `prune`.
correr(PREPARAR, ['huerfano'], repo);
fs.rmSync(path.join(repo, '.claude', 'tmp', 'worktrees', 'huerfano'), { recursive: true, force: true });
const huerfano = correr(LIMPIAR, ['huerfano'], repo);
caso('el huérfano se limpia igual', huerfano.codigo, 0);
caso('y avisa que en disco ya no estaba', /ya no está/.test(huerfano.texto), true);

// =================================================================================================
fs.rmSync(BANCO, { recursive: true, force: true });
console.log(`\n${casos - malos}/${casos} casos en verde.`);
if (malos) process.exit(1);
