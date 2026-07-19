# Plantilla — base de conocimiento

Textos verbatim que la skill instala en el repo destino.

## §Script — `.claude/scripts/lint-conocimiento/lint-conocimiento.js`

Contenido exacto (Node, sin dependencias, sin red):

```js
#!/usr/bin/env node
// Lint de la base de conocimiento: refs rotas, indice incompleto, huerfanos. Sin LLM, sin red.
// Uso: node lint-conocimiento.js [<carpeta>]   (default: .claude/conocimiento)
const fs = require('fs'), path = require('path');
const root = path.resolve(process.argv[2] || '.claude/conocimiento');
const EXCLUDE = new Set(['.git', 'node_modules', 'exports', 'pdfs']);

function walk(dir, acc) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDE.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, acc);
    else if (e.name.endsWith('.md')) acc.push(full);
  }
  return acc;
}
const rel = p => path.relative(root, p).replace(/\\/g, '/');
const domain = walk(root, []);
const read = f => fs.readFileSync(f, 'utf8');

const mdLink = /\]\(([^)]+?\.md)\)/g;
// exige barra: `subtema/pagina.md` es una ref, `MEMORIA.md` suelto es prosa nombrando un archivo
const codePath = /`([^`]+?\/[^`]+?\.md)`/g;
const wiki = /\[\[([^\]]+?)\]\]/g;

const broken = [], referenced = new Set();
for (const f of domain) {
  const txt = read(f), fdir = path.dirname(f);
  for (const re of [mdLink, codePath]) {
    let m; re.lastIndex = 0;
    while ((m = re.exec(txt))) {
      let t = m[1].trim();
      if (/^https?:\/\//.test(t)) continue;
      // saltar placeholders/taquigrafia: elipsis, plantillas de nombre, angulos
      if (t.includes('...') || t.includes('<') || /A{3,}|AA-MM|MM-DD/.test(t)) continue;
      const c1 = path.normalize(path.join(fdir, t));
      const c2 = path.normalize(path.join(root, t));
      if (fs.existsSync(c1)) referenced.add(rel(c1));
      else if (fs.existsSync(c2)) referenced.add(rel(c2));
      else broken.push([rel(f), t, 'ref .md no existe']);
    }
  }
  let m; wiki.lastIndex = 0;
  while ((m = wiki.exec(txt))) {
    const name = m[1].split('|')[0].trim();
    const hit = domain.some(p => rel(p).endsWith('/' + name + '.md') || rel(p) === name + '.md');
    if (!hit) broken.push([rel(f), `[[${name}]]`, 'wikilink sin archivo']);
  }
}

const indices = domain.filter(p => path.basename(p) === 'INDICE.md');
const idxText = new Map(indices.map(i => [i, read(i)]));
const gaps = [];
for (const idx of indices) {
  const cat = path.dirname(idx), t = idxText.get(idx);
  for (const p of domain) {
    if (p === idx) continue;
    const pdir = path.dirname(p);
    if (pdir === cat || p.startsWith(cat + path.sep)) {
      const base = path.basename(p), stem = base.slice(0, -3);
      // fallback por carpeta contenedora: solo para paginas en subcarpetas (el indice lista
      // `tema/`, no cada pagina). Para hijos directos exige el nombre: si no, folder == el dir
      // del propio indice y su texto siempre lo contiene -> el check se autoanula.
      const folderOk = pdir !== cat && t.includes(path.basename(pdir));
      if (!t.includes(base) && !t.includes(stem) && !folderOk) gaps.push([rel(idx), rel(p)]);
    }
  }
}

const orphans = [];
for (const p of domain) {
  const base = path.basename(p);
  if (base === 'INDICE.md' || base === 'README.md') continue;
  if (referenced.has(rel(p))) continue;
  const stem = base.slice(0, -3), pdir = path.dirname(p);
  const mentioned = indices.some(i => {
    const t = idxText.get(i);
    if (t.includes(base) || t.includes(stem)) return true;
    // fallback por carpeta: valido solo si la pagina cuelga de una SUBcarpeta del indice,
    // no de su mismo dir (ahi el nombre de la carpeta == el del propio indice, siempre matchea).
    const idir = path.dirname(i);
    return pdir !== idir && p.startsWith(idir + path.sep) && t.includes(path.basename(pdir));
  });
  if (!mentioned) orphans.push(rel(p));
}

console.log(`== LINT CONOCIMIENTO: ${root} ==`);
console.log(`paginas: ${domain.length} | indices: ${indices.length}\n`);
console.log(`[1] REFS ROTAS (${broken.length}):`);
broken.forEach(([f, r, w]) => console.log(`    ${f}  ->  ${r}   [${w}]`));
if (!broken.length) console.log('    (ninguna)');
console.log(`\n[2] INDICE INCOMPLETO (${gaps.length}):`);
gaps.forEach(([i, p]) => console.log(`    ${i}  no lista  ${p}`));
if (!gaps.length) console.log('    (completo)');
console.log(`\n[3] HUERFANOS (${orphans.length}):`);
orphans.forEach(o => console.log(`    ${o}`));
if (!orphans.length) console.log('    (ninguno)');
```

## §Memoria — `.claude/memoria/feedback_base_conocimiento.md`

```markdown
---
name: base-conocimiento
description: Convención de base de conocimiento — todo lo que el agente sabe vive en .claude/conocimiento/; lint de integridad al cerrar.
metadata:
  type: feedback
---

El conocimiento persistido del agente (documentos, estudios, temas, notas de dominio) vive en una carpeta única: `.claude/conocimiento/`, con un `INDICE.md` en su raíz. (La convención de dónde viven las herramientas/scripts la define la memoria [[scripts]].)

**Why:** ubicación determinística → el lint y cualquier consulta saben dónde mirar sin heurística; separa lo que el agente CONOCE (`conocimiento/`) de su config (`memoria/`, `CLAUDE.md`) y su tooling (`scripts/`); mantiene la raíz del repo limpia.

**How to apply:**

1. Todo md de conocimiento nuevo va bajo `.claude/conocimiento/` (subcarpetas por tema; cada una con su `INDICE.md` si crece). Nunca en la raíz del repo.
2. Mantener `.claude/conocimiento/INDICE.md` como índice raíz (una línea por página/sección; solo punteros).
3. **Al cerrar** una tarea que escribió conocimiento, correr el lint mecánico: `node .claude/scripts/lint-conocimiento/lint-conocimiento.js`. Chequea refs rotas, índice incompleto y huérfanos (sin LLM, sin red). Resolver los hallazgos.
4. El **chequeo semántico** (contradicciones entre páginas, duplicación, staleness) se corre a pedido tras una incorporación grande, no en cada cierre.
5. **Migración:** un script de datos acoplado por `__dirname` (lee/escribe relativo a sí mismo) que se mueva a `.claude/scripts/<tool>/` debe reapuntar sus paths a la carpeta de datos en `conocimiento/` (`__dirname + '/../../conocimiento/<subdir>/...'`), o se rompe.
```

> Reemplazá `.claude` por el directorio real del harness si no es Claude Code.
