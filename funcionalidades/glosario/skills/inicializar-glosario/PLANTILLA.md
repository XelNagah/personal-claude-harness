# Plantilla del glosario

Textos verbatim que la skill escribe. (El formato general de una memoria lo define la funcionalidad `memoria-local`.)

## §Glosario — semilla de `.claude/glosario/INDICE.md`

Si el archivo no existe, crearlo con este contenido (la tabla arranca vacía — sin filas de ejemplo, para que el lint no las tome como conceptos reales):

```markdown
# Glosario del proyecto

Terminología del dominio de este repo. Una fila por concepto en la tabla de abajo:

- **Concepto** — nombre canónico.
- **Definición** — una o dos frases: qué ES el concepto (no qué hace).
- **Alias** — otras formas de llamarlo, todas válidas, **registradas para mapear (no se prohíben)**; separadas por coma. `—` si no hay.
- **Detalle** — link a una página propia `<slug>.md` **solo si el concepto es complejo** (fórmulas, ejemplos, contraejemplos). `—` si es simple.

Solo términos **propios del dominio** (no conceptos generales de programación). Consultar al planificar y analizar. Ejemplo completo en el README de la funcionalidad `glosario`.

**Toda entrada nueva pasa por el usuario:** el agente puede *proponer* términos (marcados como propuestos), pero no se asientan como canónicos sin ratificación. Preferir las palabras del usuario a acuñar nuevas.

| Concepto | Definición | Alias | Detalle |
|----------|------------|-------|---------|
```

## §Memoria — `.claude/memoria/feedback_glosario.md`

```markdown
---
name: glosario
description: Glosario del dominio en .claude/glosario/INDICE.md — tabla de conceptos con alias registrados + páginas de detalle para lo complejo; consultar al planificar/analizar; lint al cerrar.
metadata:
  type: feedback
---

La terminología del dominio vive en `.claude/glosario/INDICE.md`: una tabla donde cada fila es un concepto (nombre canónico, definición corta, alias, y link a página de detalle si el concepto es complejo). Los conceptos complejos tienen su propia página `.claude/glosario/<slug>.md` (fórmulas, ejemplos, contraejemplos).

**Why:** coherencia semántica a lo largo de la vida del repo. Los alias **se registran, no se prohíben**: saber que "birra/chela" son la misma cerveza evita confusión, sin vetar cómo se la nombra.

**How to apply:**

1. **Al planificar o analizar**, consultar el glosario. Si aparece un término, ver si ya es alias de un concepto registrado; si es nuevo, agregar el concepto (o el alias) en el momento.
2. Concepto **simple** → una fila, columna Detalle en `—`. Concepto **complejo** → fila + página de detalle linkeada.
3. **Alias:** registrarlos en la columna Alias (no vetarlos). Un mismo alias no puede estar bajo dos conceptos distintos (el lint lo caza).
4. **Al cerrar** una tarea que tocó el glosario, correr el lint: `node .claude/glosario/lint-glosario/lint-glosario.js` (links de detalle resuelven, páginas sin huérfanos, alias sin colisión).

Relacionado: [[flujo-planes]] (consultar el glosario al planificar/analizar).
```

## §Sección de `AGENTS.md` — "Glosario del proyecto"

```markdown
## Glosario del proyecto

La terminología del dominio vive en [`glosario/INDICE.md`](.claude/glosario/INDICE.md): una tabla de conceptos (nombre canónico, definición, alias registrados, y link a página de detalle si el concepto es complejo). Los alias se **registran, no se prohíben**. **Consultarlo al planificar y analizar.** Al cerrar una tarea que tocó el glosario, correr el lint **desde la raíz del repo**:

​```bash
node .claude/glosario/lint-glosario/lint-glosario.js
​```

Detalle de la convención en la memoria [`feedback_glosario.md`](.claude/memoria/feedback_glosario.md).
```

## §Script — `.claude/glosario/lint-glosario/lint-glosario.js`

Contenido exacto (Node, sin dependencias, sin red):

```js
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
```
