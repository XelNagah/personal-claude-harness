#!/usr/bin/env node
// Lint del glosario: links de detalle resuelven, paginas sin huerfanos, alias sin colision. Sin LLM, sin red.
// Uso: node lint-glosario.js [<carpeta>]   (default: .claude/glosario)
const fs = require('fs'), path = require('path');
const root = path.resolve(process.argv[2] || '.claude/glosario');
const glosPath = path.join(root, 'INDICE.md');
const txt = fs.existsSync(glosPath) ? fs.readFileSync(glosPath, 'utf8') : '';

// parsear filas de la tabla: | Concepto | Definicion | Alias | Detalle |
const rows = [];
for (const line of txt.split('\n')) {
  const t = line.trim();
  if (!t.startsWith('|')) continue;
  const cells = t.split('|').slice(1, -1).map(c => c.trim());
  if (cells.length < 4) continue;
  const c0 = cells[0].replace(/[*\s]/g, '');
  if (/^:?-{2,}:?$/.test(c0)) continue;                 // separador |---|
  if (/^concepto$/i.test(c0)) continue;                  // header
  rows.push({ concepto: cells[0].replace(/\*/g, '').trim(), alias: cells[2], detalle: cells[3] });
}

// [1] links de detalle rotos
const linkRe = /\]\(([^)]+?\.md)\)/;
const referenced = new Set();
const refsRotas = [];
for (const r of rows) {
  const m = linkRe.exec(r.detalle);
  if (!m) continue;
  const target = m[1].trim();
  const abs = path.normalize(path.join(root, target));
  if (fs.existsSync(abs)) referenced.add(path.basename(abs));
  else refsRotas.push([r.concepto, target]);
}

// [2] paginas .md huerfanas (en glosario/, no referenciadas por la tabla)
const huerfanos = [];
if (fs.existsSync(root)) {
  for (const f of fs.readdirSync(root)) {
    if (!f.endsWith('.md') || f === 'INDICE.md') continue;
    if (!referenced.has(f)) huerfanos.push(f);
  }
}

// [3] colisiones de alias (un termino bajo dos conceptos distintos)
const conceptOf = new Map();
const colisiones = [];
const register = (term, concepto) => {
  const key = term.toLowerCase();
  if (conceptOf.has(key) && conceptOf.get(key) !== concepto) colisiones.push([term, conceptOf.get(key), concepto]);
  else conceptOf.set(key, concepto);
};
for (const r of rows) register(r.concepto, r.concepto);
for (const r of rows) {
  for (const a of r.alias.split(/[,;]/).map(s => s.trim()).filter(s => s && s !== '—' && s !== '-')) {
    register(a, r.concepto);
  }
}

console.log(`== LINT GLOSARIO: ${root} ==`);
console.log(`conceptos: ${rows.length}\n`);
console.log(`[1] LINKS DE DETALLE ROTOS (${refsRotas.length}):`);
refsRotas.forEach(([c, t]) => console.log(`    ${c}  ->  ${t}   [no existe]`));
if (!refsRotas.length) console.log('    (ninguno)');
console.log(`\n[2] PAGINAS HUERFANAS (${huerfanos.length}):`);
huerfanos.forEach(h => console.log(`    ${h}`));
if (!huerfanos.length) console.log('    (ninguna)');
console.log(`\n[3] COLISIONES DE ALIAS (${colisiones.length}):`);
colisiones.forEach(([t, a, b]) => console.log(`    "${t}"  en  ${a}  y  ${b}`));
if (!colisiones.length) console.log('    (ninguna)');
