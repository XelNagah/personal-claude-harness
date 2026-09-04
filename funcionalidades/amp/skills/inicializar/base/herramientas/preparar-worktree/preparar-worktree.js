#!/usr/bin/env node
// preparar-worktree.js — arma un worktree listo para que un agente trabaje adentro.
//
// Un `git worktree add` deja el árbol versionado y nada más. Lo que falta es justo lo que decide si
// el agente de adentro arranca entero: `settings.local.json` no se commitea y
// es donde vive `enabledPlugins`, así que sin copiarlo el worktree arranca SIN NINGÚN PLUGIN
// HABILITADO y sin señal de que le falta algo. Esta Herramienta trae lo que git IGNORA — y solo
// eso: lo que está sin commitear no se copia, porque el worktree se arma desde un commit para no
// arrastrar el trabajo a medias del repo.
//
// COPIA, NUNCA ENLAZA. El procedimiento casero era poner adentro del worktree un enlace al
// `.claude/` del repo; al limpiar, `git worktree remove` lo atraviesa y vacía el destino real
// (conocimiento Base-0007). Sin enlace no hay nada que atravesar: la clase entera de problema deja
// de existir. Copiar cuesta unos megabytes por worktree y es todo el precio.
//
// Uso:
//   node .claude/herramientas/preparar-worktree/preparar-worktree.js <nombre>
//   node .claude/herramientas/preparar-worktree/preparar-worktree.js <nombre> --rama=<rama>
//   node .claude/herramientas/preparar-worktree/preparar-worktree.js <nombre> --desde=<commit>
//   node .claude/herramientas/preparar-worktree/preparar-worktree.js <nombre> --raiz-corta=D:\wt
//   node .claude/herramientas/preparar-worktree/preparar-worktree.js <nombre> <rutaRepo>
//
// Sale con 1 si no pudo dejar el worktree armado y completo.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const wt = require('../../common/worktrees.js');

const args = process.argv.slice(2);
const opcion = nombre => {
  const a = args.find(x => x.startsWith(`--${nombre}=`));
  return a ? a.slice(nombre.length + 3) : null;
};
const sueltos = args.filter(a => !a.startsWith('--'));
const nombre = sueltos[0] || null;
const REPO = sueltos[1] ? path.resolve(sueltos[1]) : process.cwd();
const ramaPedida = opcion('rama');
const desde = opcion('desde') || 'HEAD';
const raizCorta = opcion('raiz-corta');

const salida = [];
const anotar = t => salida.push(t);

function terminar(codigo) {
  console.log(salida.join('\n'));
  process.exit(codigo);
}

// --- 1. el repo -------------------------------------------------------------------------------
if (!nombre) {
  console.log('== PREPARAR WORKTREE ==\nfalta el nombre del worktree.\n'
    + 'uso: node .claude/herramientas/preparar-worktree/preparar-worktree.js <nombre> '
    + '[--rama=<rama>] [--desde=<commit>] [--raiz-corta=<ruta>] [rutaRepo]');
  process.exit(1);
}
if (/[\\/:*?"<>|]/.test(nombre)) {
  console.log(`== PREPARAR WORKTREE ==\nel nombre \`${nombre}\` tiene caracteres que no van en una `
    + 'carpeta. Poné un nombre simple: es el de la carpeta y el de la rama.');
  process.exit(1);
}

const raiz = wt.raizDelRepo(REPO);
anotar(`== PREPARAR WORKTREE: ${nombre} ==`);
if (!raiz) {
  anotar(`\`${REPO}\` no es un repo git — un worktree se arma sobre un repo.`);
  terminar(1);
}

// --- 2. dónde cae -----------------------------------------------------------------------------
const ubicacion = wt.calcularUbicacion(raiz, nombre, { raizCorta });
if (!ubicacion.ruta) {
  anotar(`no entra en \`${wt.DESTINO_POR_OMISION}\`: ${ubicacion.motivo}.`);
  anotar('volvé a correr con `--raiz-corta=<ruta>` — por ejemplo `--raiz-corta=D:\\wt`.');
  terminar(1);
}
anotar(`repo: ${raiz}`);
anotar(`destino: ${ubicacion.ruta}`);
anotar(`ruta: ${ubicacion.total} de ${ubicacion.limite} caracteres `
  + `(la interna más larga es \`${ubicacion.rutaMasLarga.ruta}\`, de ${ubicacion.rutaMasLarga.largo})`);
if (ubicacion.cae) {
  anotar(`⚠ cae a la raíz corta: ${ubicacion.motivo}.`);
  if (ubicacion.noEntraTampoco) {
    anotar('⚠ y en la raíz corta TAMPOCO entra: elegí una raíz más corta o un nombre más corto.');
    terminar(1);
  }
}
anotar('');

// --- 3. armar el árbol (reconciliable) ---------------------------------------------------------
const yaRegistrado = wt.listarWorktrees(raiz)
  .find(w => path.resolve(w.ruta) === path.resolve(ubicacion.ruta));
const rama = ramaPedida || nombre;
let creado = false;

if (yaRegistrado && !yaRegistrado.huerfano) {
  anotar(`[ÁRBOL] ya estaba — git lo registra en la rama \`${yaRegistrado.rama || '(suelta)'}\`.`);
} else {
  if (yaRegistrado && yaRegistrado.huerfano) {
    anotar('[ÁRBOL] git lo registraba y en disco no estaba: se limpia el registro y se rearma.');
    try {
      execFileSync('git', ['worktree', 'prune'], { cwd: raiz, stdio: 'ignore', windowsHide: true });
    } catch { /* si prune falla, el add de abajo lo dice */ }
  }
  if (fs.existsSync(ubicacion.ruta)) {
    anotar(`[ÁRBOL] \`${ubicacion.ruta}\` ya existe en disco y git no lo registra como worktree.`);
    anotar('    no se pisa nada: revisalo a mano, o usá otro nombre.');
    terminar(1);
  }
  const existeRama = (() => {
    try {
      execFileSync('git', ['rev-parse', '--verify', `refs/heads/${rama}`],
        { cwd: raiz, stdio: 'ignore', windowsHide: true });
      return true;
    } catch { return false; }
  })();
  const comando = existeRama
    ? ['worktree', 'add', ubicacion.ruta, rama]
    : ['worktree', 'add', '-b', rama, ubicacion.ruta, desde];
  try {
    execFileSync('git', comando, { cwd: raiz, stdio: 'pipe', windowsHide: true });
    creado = true;
    anotar(`[ÁRBOL] agregado en la rama \`${rama}\``
      + (existeRama ? ' (la rama ya existía)' : ` (rama nueva desde \`${desde}\`)`));
  } catch (e) {
    anotar(`[ÁRBOL] git no pudo armarlo: ${String(e.stderr || e.message).trim()}`);
    terminar(1);
  }
}

// --- 4. traer lo que git ignora, que es lo que no puede llevar --------------------------------------------------------------
const { faltan, bytes, origen } = wt.faltantesEnWorktree(raiz, ubicacion.ruta);
if (origen.total === 0) {
  anotar('[.claude/] el repo no tiene `.claude/` — no hay nada que completar.');
} else if (faltan.length === 0) {
  anotar('[.claude/] ya estaba completo — git no ignora nada que falte.');
} else {
  const { copiados, fallados } = wt.copiarFaltantes(raiz, ubicacion.ruta, faltan);
  const kb = (bytes / 1024).toFixed(0);
  anotar(`[.claude/] copiados ${copiados.length} archivo(s) que git ignora (${kb} KB).`);
  const clave = copiados.filter(r => r.endsWith('settings.local.json'));
  if (clave.length) {
    anotar('    incluye `settings.local.json`: sin él el worktree arrancaba sin plugins.');
  } else if (!origen.archivos.has(path.join('settings.local.json'))) {
    anotar('    ⚠ el repo no tiene `.claude/settings.local.json`: revisá si el worktree va a '
      + 'arrancar con los plugins que esperás.');
  }
  if (fallados.length) {
    anotar(`    ⚠ ${fallados.length} no se pudieron copiar:`);
    fallados.slice(0, 10).forEach(f => anotar(`      ${f.ruta} — ${f.error}`));
  }
}

// --- 5. verificar antes de decir que está listo -------------------------------------------------
const hallazgos = [];
if (!fs.existsSync(ubicacion.ruta)) hallazgos.push('el árbol no está en disco');
const enlaces = wt.enlacesEn(path.join(ubicacion.ruta, '.claude'));
if (enlaces.length) {
  hallazgos.push(`hay ${enlaces.length} enlace(s) adentro del \`.claude/\` del worktree`);
  enlaces.slice(0, 5).forEach(e => anotar(`    enlace: ${e.ruta} → ${e.destino || '(ilegible)'}`));
}
const registradoAhora = wt.listarWorktrees(raiz)
  .some(w => path.resolve(w.ruta) === path.resolve(ubicacion.ruta));
if (!registradoAhora) hallazgos.push('git no registra el worktree');

anotar('');
if (hallazgos.length) {
  anotar(`[VERIFICACIÓN] ${hallazgos.length} hallazgo(s):`);
  hallazgos.forEach(h => anotar(`    ⚠ ${h}`));
  terminar(1);
}

anotar('[VERIFICACIÓN] árbol en disco, registrado por git y sin enlaces adentro.');
anotar('');
anotar(creado ? 'Listo. Para trabajar adentro:' : 'Ya estaba listo. Para trabajar adentro:');
anotar(`    cd "${ubicacion.ruta}"`);
anotar('Al terminar, limpiar con:');
anotar(`    node .claude/herramientas/limpiar-worktree/limpiar-worktree.js ${nombre}`);
anotar('⚠ El agente que trabaje adentro no debe escribir en el `.claude/` del worktree: los códigos '
  + 'de las Entradas de Índice todavía no se reservan, y dos worktrees eligen el mismo.');
terminar(0);
