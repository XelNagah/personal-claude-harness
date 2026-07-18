#!/usr/bin/env node
// Lint del registro de scripts: README por tool, tool en indice, filas colgadas, refs por ruta en settings. Sin LLM, sin red.
// Uso: node lint-scripts.js [<carpeta scripts>]   (default: .claude/scripts)
const fs = require('fs'), path = require('path');
const root = path.resolve(process.argv[2] || '.claude/scripts');
const idxPath = path.join(root, 'INDICE.md');
const idx = fs.existsSync(idxPath) ? fs.readFileSync(idxPath, 'utf8') : '';

// subdirectorios = tools (cada script en su carpeta)
const tools = fs.existsSync(root)
  ? fs.readdirSync(root, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name)
  : [];

// [1] README por tool
const sinReadme = tools.filter(t => !fs.existsSync(path.join(root, t, 'README.md')));

// [2] tool fuera del indice
const fueraIndice = tools.filter(t => !idx.includes(t));

// [3] filas del indice que apuntan a un directorio inexistente
const toolSet = new Set(tools), colgadas = [];
for (const line of idx.split('\n')) {
  const t = line.trim();
  if (!t.startsWith('|')) continue;
  const cells = t.split('|').slice(1, -1).map(c => c.trim());
  if (cells.length < 2) continue;
  const c0 = cells[0];
  if (/^:?-{2,}:?$/.test(c0.replace(/\s/g, ''))) continue;    // separador
  if (/^tool$/i.test(c0.replace(/[*\s]/g, ''))) continue;      // header
  const m = /\]\(([^)]+?)\/?\)/.exec(c0);                       // link [x](dir/)
  const name = (m ? m[1] : c0).replace(/[*`\[\]]/g, '').replace(/\/$/, '').trim();
  if (name && !toolSet.has(name)) colgadas.push(name);
}

// [4] refs por ruta a scripts en settings que no resuelven
const repoRoot = path.resolve(root, '..', '..');   // .claude/scripts -> raiz del repo
const refsRotas = [];
for (const sf of ['.claude/settings.local.json', '.claude/settings.json']) {
  const abs = path.join(repoRoot, sf);
  if (!fs.existsSync(abs)) continue;
  const txt = fs.readFileSync(abs, 'utf8');
  const re = /([.\w/-]*scripts\/[\w./-]+?\.(?:js|sh|py|mjs|cjs|ts))/g;
  let m;
  while ((m = re.exec(txt))) {
    const p = m[1], cand = path.isAbsolute(p) ? p : path.join(repoRoot, p);
    if (!fs.existsSync(cand)) refsRotas.push([sf, p]);
  }
}

console.log(`== LINT SCRIPTS: ${root} ==`);
console.log(`tools: ${tools.length}\n`);
console.log(`[1] SIN README (${sinReadme.length}):`);
sinReadme.forEach(t => console.log(`    ${t}/`));
if (!sinReadme.length) console.log('    (todos tienen README)');
console.log(`\n[2] FUERA DEL INDICE (${fueraIndice.length}):`);
fueraIndice.forEach(t => console.log(`    ${t}/`));
if (!fueraIndice.length) console.log('    (completo)');
console.log(`\n[3] FILAS COLGADAS (${colgadas.length}):`);
colgadas.forEach(c => console.log(`    ${c}   [directorio no existe]`));
if (!colgadas.length) console.log('    (ninguna)');
console.log(`\n[4] REFS POR RUTA ROTAS EN SETTINGS (${refsRotas.length}):`);
refsRotas.forEach(([f, p]) => console.log(`    ${f}  ->  ${p}   [no existe]`));
if (!refsRotas.length) console.log('    (ninguna)');
