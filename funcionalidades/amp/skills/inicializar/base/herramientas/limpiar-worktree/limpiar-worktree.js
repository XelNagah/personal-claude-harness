#!/usr/bin/env node
// limpiar-worktree.js — borra un worktree y verifica que lo borrado sea lo que se quería borrar.
//
// NO USA `git worktree remove`. Ese comando en Windows atraviesa los junctions: entra por el enlace
// y borra del otro lado, y su `Permission denied` significa «borré hasta acá», no «no borré nada»
// (conocimiento Base-0007). Medido: con un junction adentro dejó 0 de 25 archivos del destino real;
// el borrado recursivo de Node dejó los 25 intactos, dos veces. Acá se borra con `fs.rmSync` y
// después se corre `git worktree prune`, que solo toca el registro.
//
// VERIFICA SIEMPRE. Un fallo de borrado es estado sucio a revisar, nunca un no-evento: allá el daño
// se descubrió siete minutos tarde porque nadie leyó el error hasta el final. La verificación la
// hace esta Herramienta y no un subagente — comparar dos listados no es un recorrido de volumen
//.
//
// Uso:
//   node .claude/herramientas/limpiar-worktree/limpiar-worktree.js <nombre|ruta>
//   node .claude/herramientas/limpiar-worktree/limpiar-worktree.js <nombre> --rama=borrar
//   node .claude/herramientas/limpiar-worktree/limpiar-worktree.js <nombre> --forzar
//   node .claude/herramientas/limpiar-worktree/limpiar-worktree.js --listar [rutaRepo]
//
// Sale con 1 si no borró, o si la verificación encontró algo.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const wt = require('../../common/worktrees.js');

const args = process.argv.slice(2);
const opcion = nombre => {
  const a = args.find(x => x.startsWith(`--${nombre}=`));
  return a ? a.slice(nombre.length + 3) : null;
};
const forzar = args.includes('--forzar');
const listar = args.includes('--listar');
const queHacerConLaRama = opcion('rama') || 'conservar';
const sueltos = args.filter(a => !a.startsWith('--'));
const objetivo = listar ? null : sueltos[0] || null;
const REPO = (listar ? sueltos[0] : sueltos[1]) ? path.resolve(listar ? sueltos[0] : sueltos[1]) : process.cwd();

const salida = [];
const anotar = t => salida.push(t);
function terminar(codigo) {
  console.log(salida.join('\n'));
  process.exit(codigo);
}

const raiz = wt.raizDelRepo(REPO);
if (!raiz) {
  console.log(`== LIMPIAR WORKTREE ==\n\`${REPO}\` no es un repo git.`);
  process.exit(1);
}

// --- modo listado: qué worktrees hay ------------------------------------------------------------
if (listar) {
  const todos = wt.listarWorktrees(raiz);
  console.log(`== WORKTREES DE ${raiz} ==`);
  console.log(`registrados: ${todos.length} (el principal incluido)\n`);
  for (const w of todos) {
    const etiquetas = [];
    if (w.principal) etiquetas.push('principal');
    if (w.huerfano) etiquetas.push('⚠ registrado y no está en disco');
    console.log(`    ${w.ruta}`);
    console.log(`        rama: ${w.rama || '(suelta)'}${etiquetas.length ? '   [' + etiquetas.join(' · ') + ']' : ''}`);
  }
  process.exit(0);
}

if (!objetivo) {
  console.log('== LIMPIAR WORKTREE ==\nfalta el nombre o la ruta del worktree.\n'
    + 'uso: node .claude/herramientas/limpiar-worktree/limpiar-worktree.js <nombre|ruta> '
    + '[--rama=borrar|conservar] [--forzar] [rutaRepo]\n'
    + '     node .claude/herramientas/limpiar-worktree/limpiar-worktree.js --listar');
  process.exit(1);
}

anotar(`== LIMPIAR WORKTREE: ${objetivo} ==`);

// --- 1. ubicar el worktree ---------------------------------------------------------------------
const todos = wt.listarWorktrees(raiz);
const candidatos = todos.filter(w => !w.principal && (
  path.resolve(w.ruta) === path.resolve(objetivo)
  || path.basename(w.ruta) === objetivo
));

if (candidatos.length === 0) {
  anotar(`git no registra ningún worktree llamado \`${objetivo}\` en este repo.`);
  anotar('corré `--listar` para ver los que hay.');
  terminar(1);
}
if (candidatos.length > 1) {
  anotar(`\`${objetivo}\` nombra ${candidatos.length} worktrees. Pasá la ruta completa:`);
  candidatos.forEach(c => anotar(`    ${c.ruta}`));
  terminar(1);
}

const elegido = candidatos[0];
anotar(`repo: ${raiz}`);
anotar(`árbol: ${elegido.ruta}`);
anotar(`rama: ${elegido.rama || '(suelta)'}`);
anotar('');

if (elegido.huerfano) {
  anotar('[ÁRBOL] git lo registraba y en disco ya no está: solo hay que limpiar el registro.');
}

// --- 2. inventario previo, que es contra lo que se verifica -------------------------------------
const previo = wt.inventariarClaude(raiz);
anotar(`[ANTES] el \`.claude/\` del repo tiene ${previo.total} archivo(s).`);
if (previo.enlaces.length) {
  anotar(`    ⚠ y ${previo.enlaces.length} enlace(s), que no se atraviesan.`);
}

// --- 3. enlaces adentro del worktree ------------------------------------------------------------
// Se informan aunque `fs.rmSync` no los atraviese: una instalación que venía armando worktrees a
// mano puede tener uno, y el estado sucio se ve, no se supone.
const enlaces = elegido.huerfano ? [] : wt.enlacesEn(elegido.ruta);
if (enlaces.length) {
  anotar(`[ENLACES] hay ${enlaces.length} adentro del worktree:`);
  enlaces.slice(0, 10).forEach(e => anotar(`    ${e.ruta} → ${e.destino || '(ilegible)'}`));
  anotar('    el borrado de Node no los atraviesa: se borra el enlace, no lo que apunta.');
  anotar('    (con `git worktree remove` esto habría vaciado el destino real.)');
}

// --- 4. escrituras en su `.claude/` --------------------------------------------------------------
if (!elegido.huerfano) {
  const escrituras = wt.escriturasEnClaude(raiz, elegido.ruta);
  if (escrituras.hay) {
    const total = escrituras.nuevos.length + escrituras.cambiados.length;
    anotar(`[ESCRITURAS] el agente escribió ${total} archivo(s) en el \`.claude/\` del worktree:`);
    escrituras.nuevos.slice(0, 10).forEach(r => anotar(`    nuevo:    ${r}`));
    escrituras.cambiados.slice(0, 10).forEach(r => anotar(`    cambiado: ${r}`));
    if (!forzar) {
      anotar('');
      anotar('No se borra nada. Eso se pierde al borrar el árbol, y puede ser Aprendizaje real:');
      anotar('    · si vale, traelo al repo (o commiteálo en la rama del worktree) y volvé a correr;');
      anotar('    · si no vale, volvé a correr con `--forzar` y se respalda antes de borrar.');
      terminar(1);
    }
    // Con `--forzar` se respalda, siguiendo el patrón del actualizador: lo
    // que se pisa se guarda antes, porque `.claude/` suele estar fuera del control de versiones y
    // no hay red de git abajo.
    const fecha = new Date().toISOString().slice(0, 10);
    const destino = path.join(raiz, '.claude', '.respaldo-amp', fecha, `worktree-${path.basename(elegido.ruta)}`);
    let guardados = 0;
    for (const rel of [...escrituras.nuevos, ...escrituras.cambiados]) {
      try {
        const hasta = path.join(destino, rel);
        fs.mkdirSync(path.dirname(hasta), { recursive: true });
        fs.copyFileSync(path.join(elegido.ruta, '.claude', rel), hasta);
        guardados++;
      } catch { /* el conteo de abajo dice cuántos quedaron */ }
    }
    anotar(`    respaldados ${guardados} de ${total} en \`${path.relative(raiz, destino)}\`.`);
  } else {
    anotar('[ESCRITURAS] ninguna: el `.claude/` del worktree está igual que el del repo.');
  }
}

// --- 5. borrar ------------------------------------------------------------------------------------
anotar('');
let borrado = true;
let errorBorrado = null;
if (!elegido.huerfano) {
  try {
    fs.rmSync(elegido.ruta, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
  } catch (e) {
    borrado = false;
    errorBorrado = e.message;
  }
}
anotar(borrado
  ? '[BORRADO] árbol borrado con el borrado recursivo de Node.'
  : `[BORRADO] ⚠ falló: ${errorBorrado}`);
if (!borrado) {
  anotar('    ⚠ un error acá significa «borré hasta acá», no «no borré nada»: revisá qué quedó.');
}

try {
  execFileSync('git', ['worktree', 'prune'], { cwd: raiz, stdio: 'ignore', windowsHide: true });
  anotar('[REGISTRO] `git worktree prune` corrido.');
} catch (e) {
  anotar(`[REGISTRO] ⚠ \`git worktree prune\` falló: ${String(e.stderr || e.message).trim()}`);
}

// --- 6. la rama ------------------------------------------------------------------------------------
if (elegido.rama && queHacerConLaRama === 'borrar') {
  try {
    execFileSync('git', ['branch', '-d', elegido.rama], { cwd: raiz, stdio: 'pipe', windowsHide: true });
    anotar(`[RAMA] \`${elegido.rama}\` borrada (estaba integrada).`);
  } catch (e) {
    if (forzar) {
      try {
        execFileSync('git', ['branch', '-D', elegido.rama], { cwd: raiz, stdio: 'pipe', windowsHide: true });
        anotar(`[RAMA] ⚠ \`${elegido.rama}\` borrada a la fuerza: tenía trabajo sin integrar.`);
      } catch (e2) {
        anotar(`[RAMA] ⚠ no se pudo borrar \`${elegido.rama}\`: ${String(e2.stderr || e2.message).trim()}`);
      }
    } else {
      anotar(`[RAMA] \`${elegido.rama}\` se conserva: tiene trabajo sin integrar.`);
      anotar('    para borrarla igual, volvé a correr con `--rama=borrar --forzar`.');
    }
  }
} else if (elegido.rama) {
  anotar(`[RAMA] \`${elegido.rama}\` se conserva.`);
}

// --- 7. verificar ------------------------------------------------------------------------------
anotar('');
const verificacion = wt.verificarBorrado(raiz, elegido.ruta, previo);
anotar(`[DESPUÉS] el \`.claude/\` del repo tiene ${verificacion.archivosAhora} archivo(s).`);

if (verificacion.limpio && borrado) {
  anotar('[VERIFICACIÓN] limpio: el árbol ya no está, el registro de git está al día y el '
    + '`.claude/` del repo quedó completo.');
  terminar(0);
}

anotar(`[VERIFICACIÓN] ${verificacion.hallazgos.length} hallazgo(s):`);
for (const h of verificacion.hallazgos) {
  anotar(`    ⚠ ${h.texto}`);
  if (h.rutas) h.rutas.forEach(r => anotar(`        ${r}`));
}
if (verificacion.perdidos.length) {
  anotar('');
  anotar('⚠ ESTO ES EL DAÑO QUE LA HERRAMIENTA EXISTE PARA EVITAR. Recuperá el `.claude/` del repo '
    + 'antes de seguir trabajando: `git checkout -- .claude` si está versionado, o el respaldo más '
    + 'reciente de `.claude/.respaldo-amp/` si no lo está.');
}
terminar(1);
