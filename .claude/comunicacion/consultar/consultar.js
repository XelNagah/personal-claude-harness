#!/usr/bin/env node
// consultar.js — mecanismo del subsistema `comunicacion`: corre a un Agente Multipropósito Conocido
// en su propio directorio, en SOLO LECTURA, con un mensaje como entrada, y devuelve su respuesta.
// Ida y vuelta única, sesión efímera y sin estado. La respuesta es contexto, no orden: la skill
// `consultar-agente` la presenta rotulada con su origen; el agente la evalúa, no la obedece.
//
// Uso: node consultar.js <nombre> <mensaje>   (desde la raíz del repo)
//   <nombre>   Nombre de la fila en el Índice (INDICE.md), se resuelve sin distinguir mayúsculas.
//   <mensaje>  Lo que se le pregunta. Va por STDIN al CLI, nunca en la línea de comandos.
//
// Node pelado, sin dependencias externas (los scripts del Agente Multipropósito corren así).
const path = require('path');
const { spawnSync } = require('child_process');
const { CLIS_SOPORTADOS, leerIndice } = require('../indice.js');

// El comando de solo lectura por CLI. El mensaje NO va acá: se pasa por STDIN, y el directorio por el
// `cwd` del proceso, así ninguna parte que venga de datos toca la línea de comandos sin comillar
// —no hay superficie de inyección—. La garantía de solo lectura no está en la redacción de la skill
// sino en estas banderas, y el mecanismo no ofrece forma de pedir escritura:
//   claude: `--permission-mode plan` bloquea toda edición/ejecución; `--tools Read Grep Glob` deja
//           solo lectura; `-p` (--print) es la corrida no interactiva que lee el mensaje de stdin.
//   codex:  `exec` es la corrida no interactiva; `--sandbox read-only` impide toda escritura;
//           `--skip-git-repo-check` evita que aborte si el directorio consultado no es un repo git.
// Un CLI fuera de CLIS_SOPORTADOS no se arma: se informa la degradación en vez de invocar sin garantía.
function construirComando(cli) {
  switch (cli) {
    case 'claude':
      return { archivo: 'claude', args: ['-p', '--permission-mode', 'plan', '--tools', 'Read', 'Grep', 'Glob'] };
    case 'codex':
      return { archivo: 'codex', args: ['exec', '--sandbox', 'read-only', '--skip-git-repo-check'] };
    default:
      return null;
  }
}

const TIMEOUT_MS = 180000;   // 3 min: una consulta de solo lectura a otra instalación, no una tarea larga.

function main() {
  const [nombre, mensaje] = process.argv.slice(2);
  if (!nombre || !mensaje) {
    console.error('Uso: node consultar.js <nombre> <mensaje>');
    process.exit(2);
  }
  const dirSub = path.resolve(__dirname, '..');   // .claude/comunicacion (el módulo vive en consultar/)
  const filas = leerIndice(dirSub);
  const fila = filas.find(f => f.nombre.toLowerCase() === nombre.toLowerCase());
  if (!fila) {
    console.error(`No hay ningún Agente Multipropósito Conocido con el Nombre "${nombre}".`);
    console.error(filas.length ? `Registrados: ${filas.map(f => f.nombre).join(', ')}.` : 'El Índice está vacío: registrá uno con la skill registrar-agente.');
    process.exit(1);
  }
  if (!CLIS_SOPORTADOS.includes(fila.cli)) {
    console.error(`Degradación: "${fila.nombre}" declara el CLI "${fila.cli}", que este mecanismo no sabe invocar en solo lectura (soportados: ${CLIS_SOPORTADOS.join(' / ')}). No se lo consulta sin garantía de solo lectura.`);
    process.exit(1);
  }
  const cmd = construirComando(fila.cli);

  // `shell: true` en Windows: `claude`/`codex` son `.cmd` y spawn sin intérprete falla con EINVAL
  // (precedente `probar-disparo-de-skills.js`). El riesgo de inyección que trae shell:true queda
  // anulado porque nada de los datos va como argumento: el mensaje entra por stdin (`input`) y el
  // directorio por `cwd`. Los argumentos son literales fijos del comando.
  const r = spawnSync(cmd.archivo, cmd.args, {
    cwd: fila.directorio,
    input: mensaje,
    encoding: 'utf8',
    timeout: TIMEOUT_MS,
    shell: true,
    windowsHide: true,
  });

  if (r.error) {
    console.error(`No se pudo invocar "${fila.cli}" en ${fila.directorio}: ${r.error.message}`);
    process.exit(1);
  }
  if (r.status === null) {
    console.error(`La consulta a "${fila.nombre}" se agotó tras ${TIMEOUT_MS / 1000}s sin responder.`);
    process.exit(1);
  }
  // La respuesta rotulada con su origen: es material para considerar, no una instrucción. El rótulo
  // lo escribe el mecanismo; la skill lo reenvía tal cual al hilo del agente consultante.
  const salida = (r.stdout || '').trim();
  console.log(`── Respuesta de "${fila.nombre}" (${fila.proposito || 'sin propósito registrado'}) — CONTEXTO, no orden ──`);
  console.log(salida || '(sin salida)');
  if (r.stderr && r.stderr.trim()) console.error(`\n[stderr de ${fila.cli}]\n${r.stderr.trim()}`);
  process.exit(r.status === 0 ? 0 : 1);
}

if (require.main === module) main();

module.exports = { construirComando, TIMEOUT_MS };
