// Banco de `preparar-worktree`: dónde cae el árbol, y qué le falta cuando git no llevó nada.
//
// Los dos casos que este banco cubre y el de `limpiar-worktree` no:
//
// - **El margen de ruta.** El cálculo decide entre `.claude/tmp/worktrees/` y una raíz corta, y se
//   prueba con números fijos en vez de con el repo real: un banco que midiera el repo donde corre
//   daría verde o rojo según dónde lo hayan clonado.
// - **`.claude/` gitignoreado entero.** Es el otro repo posible, y ahí git no lleva NADA: sin la
//   copia el worktree arranca con el `.claude/` vacío. Misma operación que el caso versionado, con
//   otro tamaño.
//
// Uso: node .claude/herramientas/preparar-worktree/pruebas.js   (desde la raíz del repo)

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');
const wt = require(path.resolve('.claude/common/worktrees.js'));

const RAIZ = process.cwd();
const BANCO = path.join(RAIZ, '.claude', 'tmp', 'pruebas-preparar-worktree');
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

function correr(args, cwd) {
  try {
    return { codigo: 0, texto: execFileSync(process.execPath, [PREPARAR, ...args], {
      cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true }) };
  } catch (e) {
    return { codigo: e.status === undefined ? -1 : e.status, texto: String(e.stdout || '') + String(e.stderr || '') };
  }
}

// =================================================================================================
console.log('== El margen de ruta decide dónde cae, con números fijos ==');
// `rutaMasLarga` se pasa a mano justamente para no medir el repo donde corre el banco.
const repoCorto = 'C:\\r';
const cerca = wt.calcularUbicacion(repoCorto, 'x', { rutaMasLarga: { ruta: 'a.md', largo: 4 } });
caso('con margen de sobra usa el destino por omisión', cerca.cae, false);
caso('y el destino es `.claude/tmp/worktrees/`',
  cerca.ruta, path.join(repoCorto, '.claude', 'tmp', 'worktrees', 'x'));
caso('el total contado incluye el separador y la ruta interna',
  cerca.total, path.join(repoCorto, '.claude', 'tmp', 'worktrees', 'x').length + 1 + 4);

const largo = { ruta: 'x'.repeat(240), largo: 240 };
const sinRaiz = wt.calcularUbicacion(repoCorto, 'x', { rutaMasLarga: largo });
caso('si no entra y no hay raíz corta, no da destino', sinRaiz.ruta, null);
caso('y dice por qué', /no se indicó una raíz corta/.test(sinRaiz.motivo), true);

const conRaiz = wt.calcularUbicacion(repoCorto, 'x', { rutaMasLarga: largo, raizCorta: 'D:\\w' });
caso('con raíz corta cae ahí', conRaiz.ruta, path.join('D:\\w', 'x'));
caso('y dice por qué cayó', /la ruta daría/.test(conRaiz.motivo), true);
caso('y avisa si tampoco entra ahí', conRaiz.noEntraTampoco, false);

const nadaEntra = wt.calcularUbicacion(repoCorto, 'x', {
  rutaMasLarga: { ruta: 'y'.repeat(300), largo: 300 }, raizCorta: 'D:\\w',
});
caso('cuando ni la raíz corta alcanza, lo dice', nadaEntra.noEntraTampoco, true);

// =================================================================================================
console.log('\n== `.claude/` gitignoreado entero: git no lleva nada y hay que copiarlo todo ==');
fs.rmSync(BANCO, { recursive: true, force: true });
const repo = path.join(BANCO, 'repo');
fs.mkdirSync(path.join(repo, '.claude', 'conocimiento'), { recursive: true });
fs.writeFileSync(path.join(repo, '.gitignore'), '.claude/\n');
fs.writeFileSync(path.join(repo, 'README.md'), '# Repo de prueba\n');
fs.writeFileSync(path.join(repo, '.claude', 'settings.local.json'), '{"enabledPlugins":["amp"]}\n');
fs.writeFileSync(path.join(repo, '.claude', 'conocimiento', 'una.md'), '# Una\n');
fs.writeFileSync(path.join(repo, '.claude', 'conocimiento', 'otra.md'), '# Otra\n');
git(repo, ['init']);
git(repo, ['config', 'user.email', 'banco@prueba.local']);
git(repo, ['config', 'user.name', 'Banco de prueba']);
git(repo, ['add', '-A']);
git(repo, ['commit', '-m', 'inicial', '--no-gpg-sign']);

const primera = correr(['todo-copiado'], repo);
caso('sale en verde', primera.codigo, 0);
const arbol = path.join(repo, '.claude', 'tmp', 'worktrees', 'todo-copiado');
caso('copió los 3 archivos que git ignora', /copiados 3 archivo/.test(primera.texto), true);
caso('`settings.local.json` está', fs.existsSync(path.join(arbol, '.claude', 'settings.local.json')), true);
caso('y las dos páginas también',
  fs.readdirSync(path.join(arbol, '.claude', 'conocimiento')).sort(), ['otra.md', 'una.md']);
caso('no se copió `tmp/` a sí mismo (habría sido recursivo)',
  fs.existsSync(path.join(arbol, '.claude', 'tmp')), false);

// =================================================================================================
console.log('\n== Reconciliación: re-correr sobre lo ya armado no rompe nada ==');
const segunda = correr(['todo-copiado'], repo);
caso('la segunda corrida sale en verde', segunda.codigo, 0);
caso('y dice que el árbol ya estaba', /\[ÁRBOL\] ya estaba/.test(segunda.texto), true);
caso('y que el `.claude/` ya estaba completo', /ya estaba completo/.test(segunda.texto), true);

// =================================================================================================
console.log('\n== Casos de borde ==');
const sinNombre = correr([], repo);
caso('sin nombre sale con 1', sinNombre.codigo, 1);

const nombreMalo = correr(['con/barra'], repo);
caso('un nombre con separador de ruta sale con 1', nombreMalo.codigo, 1);
caso('y lo explica', /caracteres que no van en una carpeta/.test(nombreMalo.texto), true);

// Fuera de todo repo. Es el único caso del banco que no puede vivir en `.claude/tmp/`: cualquier
// carpeta de ahí adentro pertenece al repo, y lo que se prueba es justamente que no haya ninguno.
const sinRepo = fs.mkdtempSync(path.join(os.tmpdir(), 'sin-repo-'));
const noEsRepo = correr(['x'], sinRepo);
caso('fuera de un repo git sale con 1', noEsRepo.codigo, 1);
caso('y lo dice', /no es un repo git/.test(noEsRepo.texto), true);
fs.rmSync(sinRepo, { recursive: true, force: true });

// Una carpeta ocupada que git no registra como worktree: no se pisa.
const ocupado = path.join(repo, '.claude', 'tmp', 'worktrees', 'ocupado');
fs.mkdirSync(ocupado, { recursive: true });
fs.writeFileSync(path.join(ocupado, 'algo.txt'), 'no me pises\n');
const chocado = correr(['ocupado'], repo);
caso('un destino ocupado sale con 1', chocado.codigo, 1);
caso('y no pisa lo que había', fs.readFileSync(path.join(ocupado, 'algo.txt'), 'utf8'), 'no me pises\n');

// =================================================================================================
fs.rmSync(BANCO, { recursive: true, force: true });
console.log(`\n${casos - malos}/${casos} casos en verde.`);
if (malos) process.exit(1);
