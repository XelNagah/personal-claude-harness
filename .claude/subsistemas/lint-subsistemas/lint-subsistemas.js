#!/usr/bin/env node
// Lint del catalogo de subsistemas: catalogo<->disco, duplicados y manifiestos. Sin LLM, sin red.
const fs = require('fs');
const path = require('path');

const claude = path.resolve(process.argv[2] || '.claude');
const catalogo = path.join(claude, 'subsistemas', 'SUBSISTEMAS.md');
const ignorar = new Set(['skills', 'tmp']);
const errores = [];

if (!fs.existsSync(catalogo)) {
  console.error('[!] Falta .claude/subsistemas/SUBSISTEMAS.md');
  process.exit(1);
}

const texto = fs.readFileSync(catalogo, 'utf8');
const filas = [...texto.matchAll(/^\|\s*\[([^\]]+)\]\(([^)]+)\)\s*\|/gm)]
  .map(([, nombre, enlace]) => ({ nombre: nombre.trim(), enlace: enlace.trim() }));
const nombres = filas.map(f => f.nombre);

for (const nombre of new Set(nombres)) {
  if (nombres.filter(n => n === nombre).length > 1) errores.push(`fila duplicada: ${nombre}`);
}

for (const fila of filas) {
  const destino = path.resolve(path.dirname(catalogo), fila.enlace);
  if (!fs.existsSync(destino) || !fs.statSync(destino).isDirectory()) errores.push(`casa inexistente: ${fila.nombre} -> ${fila.enlace}`);
  else if (!fs.existsSync(path.join(destino, 'MANIFIESTO.md')) && fila.nombre !== 'preferencias')
    errores.push(`sin MANIFIESTO.md: ${fila.nombre}`);
}

const casas = fs.readdirSync(claude, { withFileTypes: true })
  .filter(e => e.isDirectory() && !e.name.startsWith('.') && !ignorar.has(e.name))
  .map(e => e.name)
  .filter(n => fs.existsSync(path.join(claude, n, 'MANIFIESTO.md')));
for (const casa of casas) {
  if (!nombres.includes(casa)) errores.push(`casa no catalogada: ${casa}`);
}

console.log(`subsistemas: ${filas.length} | casas: ${casas.length}`);
if (errores.length) {
  errores.forEach(e => console.error(`[!] ${e}`));
  process.exit(1);
}
console.log('OK');
