#!/usr/bin/env node
// Lint estructural de preferencias: PREFERENCIAS.md con Base/Adaptaciones + @import en el punto de entrada (AGENTS.md/CLAUDE.md). Sin LLM, sin red.
// NO detecta contradicciones semanticas (eso es la capa semantica, a pedido).
// Uso: node lint-preferencias.js [<carpeta .claude>]   (default: .claude)
const fs = require('fs'), path = require('path');
const claudeDir = path.resolve(process.argv[2] || '.claude');
const prefFile = path.join(claudeDir, 'preferencias', 'PREFERENCIAS.md');
const problems = [];

if (!fs.existsSync(prefFile)) {
  problems.push('no existe preferencias/PREFERENCIAS.md');
} else {
  const txt = fs.readFileSync(prefFile, 'utf8');
  if (!/^##\s+Base\b/m.test(txt)) problems.push('falta la seccion "## Base"');
  if (!/^##\s+Adaptaciones\b/mi.test(txt)) problems.push('falta la seccion "## Adaptaciones"');
  if (txt.trim().length < 50) problems.push('PREFERENCIAS.md casi vacio (sin contenido util)');
}

// @import en el punto de entrada (las preferencias tienen que estar siempre en contexto).
// Fuente: AGENTS.md en la raiz (decision 0010); layouts legacy: CLAUDE.md en la raiz o dentro de <config>/.
const root = path.dirname(claudeDir);
const entradas = [path.join(root, 'AGENTS.md'), path.join(root, 'CLAUDE.md'), path.join(claudeDir, 'CLAUDE.md')]
  .filter(f => fs.existsSync(f));
if (entradas.length) {
  // el import lleva el prefijo segun donde viva el punto de entrada: @preferencias/... o @.claude/preferencias/...
  const importa = entradas.some(f => /@[\w./-]*preferencias\/PREFERENCIAS\.md/.test(fs.readFileSync(f, 'utf8')));
  if (!importa) {
    problems.push('ningun punto de entrada (AGENTS.md/CLAUDE.md) importa @preferencias/PREFERENCIAS.md (no queda en contexto)');
  }
} else {
  problems.push('no existe punto de entrada (AGENTS.md o CLAUDE.md; no se pudo verificar el @import)');
}

console.log(`== LINT PREFERENCIAS: ${prefFile} ==`);
console.log(`hallazgos: ${problems.length}\n`);
if (!problems.length) console.log('    (ok)');
else problems.forEach(p => console.log(`    [x] ${p}`));
