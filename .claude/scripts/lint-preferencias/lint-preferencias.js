#!/usr/bin/env node
// Lint estructural de preferencias: PREFERENCIAS.md con Base/Adaptaciones + @import en CLAUDE.md. Sin LLM, sin red.
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

// @import en CLAUDE.md (las preferencias tienen que estar siempre en contexto).
// CLAUDE.md puede vivir dentro de <config>/ (layout del harness) o en la raiz del repo (layout estandar de Claude Code).
let claudeMd = path.join(claudeDir, 'CLAUDE.md');
if (!fs.existsSync(claudeMd)) claudeMd = path.join(path.dirname(claudeDir), 'CLAUDE.md');
if (fs.existsSync(claudeMd)) {
  const c = fs.readFileSync(claudeMd, 'utf8');
  // el import lleva el prefijo del <config> segun donde viva el CLAUDE.md: @preferencias/... o @.claude/preferencias/...
  if (!/@[\w./-]*preferencias\/PREFERENCIAS\.md/.test(c)) {
    problems.push('CLAUDE.md no importa @preferencias/PREFERENCIAS.md (no queda en contexto)');
  }
} else {
  problems.push('no existe CLAUDE.md (no se pudo verificar el @import)');
}

console.log(`== LINT PREFERENCIAS: ${prefFile} ==`);
console.log(`hallazgos: ${problems.length}\n`);
if (!problems.length) console.log('    (ok)');
else problems.forEach(p => console.log(`    [x] ${p}`));
