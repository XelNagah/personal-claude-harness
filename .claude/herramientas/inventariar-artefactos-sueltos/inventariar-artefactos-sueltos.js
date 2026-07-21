#!/usr/bin/env node
// inventariar-artefactos-sueltos.js — Frente B del plan "Que el harness tenga efecto conductual".
// El punto ciego: los 8 lints solo miran ADENTRO de su propio subsistema; nada reportaba lo
// que quedó afuera. Este chequeo cierra la mitad barata: barre `.claude/` y lista los artefactos
// (archivos y carpetas) que no pertenecen a ningún subsistema ni a la infra conocida.
// INVENTARÍA, NO JUZGA: solo dice "esto está fuera de todo subsistema"; qué hacer con cada cosa
// lo decide un humano (los criterios para juzgar son el frente A, todavía sin escribir).
//
// Alcance (opción A, acordada 21/07/2026): SOLO `.claude/`. La raíz del repo no se toca —
// en un repo consumidor está llena del Propósito real (código, datos) y separar "del proyecto"
// de "harness mal puesto" necesita los criterios del frente A. Barrer `.claude/` sí es decidible
// hoy sin ruido: ahí solo deben vivir los subsistemas + infra.
//
// Un subsistema se reconoce igual que en mostrar-pantalla-bienvenida: carpeta hija de `.claude/` con su
// lint co-ubicado `.claude/<D>/lint-<D>/lint-<D>.js` (decisión 0008). Mismo criterio, una fuente.
//
// Uso:
//   node .claude/herramientas/inventariar-artefactos-sueltos/inventariar-artefactos-sueltos.js            (este repo, cwd)
//   node .claude/herramientas/inventariar-artefactos-sueltos/inventariar-artefactos-sueltos.js <rutaRepo> (apuntar a un consumidor)
//   node .claude/herramientas/inventariar-artefactos-sueltos/inventariar-artefactos-sueltos.js --quiet    (calla si no hay sueltos)
// Sin process.exit(1): informa, no falla (decisión 0003, capa mecánica).

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const quiet = args.includes('--quiet');
const rutaArg = args.find(a => !a.startsWith('--'));
const REPO = rutaArg ? path.resolve(rutaArg) : process.cwd();
const CLAUDE_DIR = path.join(REPO, '.claude');

// Infra que legítimamente vive en `.claude/` sin ser subsistema: config de Claude Code, sus
// carpetas estándar (commands/agents/hooks/skills) y la Identidad del Agente del harness.
// Todo lo que no esté acá NI sea subsistema se reporta. Lista corta y estable a propósito:
// de más cría falsos negativos (esconde lo mal puesto); de menos, falsos positivos.
const INFRA = new Set([
  'settings.json', 'settings.local.json', // config Claude Code
  'skills', 'commands', 'agents', 'hooks', // carpetas estándar Claude Code
  'identidad.md', // Identidad del Agente (harness)
]);

function existe(p) { try { return fs.existsSync(p); } catch { return false; } }

// --- clasificar los hijos directos de `.claude/` ---
const subsistemas = []; // nombres — carpeta con lint co-ubicado
const infra = [];       // nombres reconocidos como infra
const sueltos = [];     // { nombre, motivo } — artefactos sin subsistema ni infra

if (existe(CLAUDE_DIR)) {
  for (const e of fs.readdirSync(CLAUDE_DIR, { withFileTypes: true })) {
    const nombre = e.name;
    const esDir = e.isDirectory();
    const lintCoubicado = esDir && existe(path.join(CLAUDE_DIR, nombre, 'lint-' + nombre, 'lint-' + nombre + '.js'));
    if (lintCoubicado) { subsistemas.push(nombre); continue; }
    if (INFRA.has(nombre)) { infra.push(nombre); continue; }
    sueltos.push({
      nombre: nombre + (esDir ? '/' : ''),
      motivo: esDir
        ? 'carpeta, no es subsistema (sin lint co-ubicado) ni infra conocida'
        : 'archivo, no es infra conocida',
    });
  }
}

subsistemas.sort((a, b) => a.localeCompare(b));
infra.sort((a, b) => a.localeCompare(b));
sueltos.sort((a, b) => a.nombre.localeCompare(b.nombre));

// --- salida (formato `[SECCION] (N)` como los demás lints) ---
if (quiet && sueltos.length === 0) process.exit(0);

console.log('== ARTEFACTOS SUELTOS: ' + REPO + ' ==');
if (!existe(CLAUDE_DIR)) {
  console.log('no hay `.claude/` en esta ruta — nada que barrer.');
  process.exit(0);
}
console.log(`.claude/ escaneado | subsistemas: ${subsistemas.length} | infra conocida: ${infra.length} | sueltos: ${sueltos.length}\n`);

const secciones = [
  ['SUBSISTEMAS RECONOCIDOS (lint co-ubicado)', subsistemas],
  ['INFRA CONOCIDA', infra],
  ['ARTEFACTOS SUELTOS EN .claude/', sueltos.map(x => `${x.nombre}   [${x.motivo}]`)],
];
for (const [titulo, items] of secciones) {
  if (quiet && titulo !== 'ARTEFACTOS SUELTOS EN .claude/') continue;
  console.log(`[${titulo}] (${items.length})`);
  items.forEach(i => console.log(`    ${i}`));
  if (!quiet && !items.length) console.log('    (ninguno)');
}
