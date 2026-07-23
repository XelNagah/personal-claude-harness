# Plantilla del registro de decisiones

textos literales que la skill escribe. (El formato general de una memoria lo define la funcionalidad `memoria-local`.) Misma estructura que el glosario: una tabla-índice + páginas de detalle para lo complejo.

## §Decisiones — contenido inicial de `.claude/decisiones/INDICE.md`

Si el archivo no existe, crearlo con este contenido (tabla vacía — sin filas de ejemplo, para que el lint no las tome como decisiones reales):

```markdown
# Decisiones del proyecto

Registro de las decisiones **estructurales al propósito del repo**: las que definen cómo es o qué hace el repo en lo esencial, o que eligen un camino entre varios de forma que **condiciona el trabajo futuro**. **No** van las operativas triviales o efímeras ("busqué X en internet", "usé tal flag"). Ante la duda: ¿esto condiciona el repo a futuro? Sí → va.

Una fila por decisión:

- **N°** — secuencial (`0001`, `0002`, …), referencia estable.
- **Decisión** — qué se decidió y por qué, en una frase (para las simples).
- **Fecha** — `AAAA-MM-DD`.
- **Estado** — `vigente` o `reemplazada por NNNN`. Para revertir no se borra: se agrega una nueva y se marca la vieja.
- **Detalle** — link a `NNNN-slug.md` **solo si la decisión requiere conceptualización mayor** (contexto, alternativas, consecuencias); `—` si es simple.

| N° | Decisión | Fecha | Estado | Detalle |
|----|----------|-------|--------|---------|
```

## §Detalle — formato de una página `NNNN-slug.md` (solo decisiones complejas)

```markdown
# NNNN — Título corto de la decisión

**Fecha:** AAAA-MM-DD · **Estado:** vigente

Contexto: qué problema o situación la motivó.
Decisión: qué se decidió.
Alternativas: cuáles se consideraron y por qué se eligió esta.
Consecuencias: efectos no obvios (solo si los hay).
```

## §Memoria — `.claude/memoria/feedback_decisiones.md`

```markdown
---
name: decisiones
description: Registro de decisiones estructurales del repo en .claude/decisiones/INDICE.md (tabla + detalle para las complejas, NO ADR); consultar al planificar/analizar; lint al cerrar.
metadata:
  type: feedback
---

Las decisiones **estructurales al propósito del repo** se asientan en `.claude/decisiones/INDICE.md`: una tabla donde cada fila es una decisión (N° secuencial, qué se decidió y por qué, fecha, estado, y link a página de detalle si requiere conceptualización mayor). Misma estructura que el glosario: lo simple vive en la fila, lo complejo en su `NNNN-slug.md`.

**Why:** coherencia decisional a lo largo de la vida del repo — no re-decidir ni contradecir lo estructural. Acotado a lo estructural (no lo operativo trivial) para que el registro siga siendo señal y no ruido — es lo que hacía la "A" de ADR, generalizada a repos de cualquier propósito.

**How to apply:**

1. **Qué registrar:** decisiones que definen cómo es / qué hace el repo en lo esencial, o que eligen un camino que condiciona el trabajo futuro. **No** las triviales o efímeras ("busqué en internet", "usé tal comando").
2. **Al planificar o analizar**, consultar las decisiones previas: no re-abrir lo cerrado ni contradecirlo. Reemplazar, no borrar: agregar la nueva y marcar la vieja `reemplazada por NNNN`.
3. **Simple** → una fila, Detalle en `—`. **Compleja** (contexto, alternativas, consecuencias) → fila + página `NNNN-slug.md`.
4. **Al cerrar** una tarea que registró decisiones, correr el lint: `node .claude/decisiones/lint-decisiones/lint-decisiones.js` (numeración, links de detalle, huérfanos, superseded).

Relacionado: [[flujo-planes]] (consultar/registrar decisiones al cerrar planes).
```

## §Script — `.claude/decisiones/lint-decisiones/lint-decisiones.js`

Contenido exacto (Node, sin dependencias, sin red):

```js
#!/usr/bin/env node
// Lint del registro de decisiones: numeracion, links de detalle, huerfanos, superseded. Sin LLM, sin red.
// Uso: node lint-decisiones.js [<carpeta>]   (default: .claude/decisiones)
const fs = require('fs'), path = require('path');
const root = path.resolve(process.argv[2] || '.claude/decisiones');
const mainPath = path.join(root, 'INDICE.md');
const txt = fs.existsSync(mainPath) ? fs.readFileSync(mainPath, 'utf8') : '';
const pad = n => String(n).padStart(4, '0');

// La raiz del repo se deduce de la ubicacion del propio lint: .claude/<sub>/lint-<sub>/ -> 3 arriba.
// La profundidad la fija el instalador; no depende de desde donde se invoque.
const repoRoot = path.resolve(__dirname, '..', '..', '..');
const dentroDelRepo = p => {
  const r = path.resolve(p);
  return r === repoRoot || r.startsWith(repoRoot + path.sep);
};
// Un archivo de un subsistema puede linkear a otros (planes/, conocimiento/, docs/, ...): la ref se
// resuelve relativa al archivo, a la raiz del subsistema, a .claude/, a la raiz del repo y al cwd.
// Solo se acepta el candidato que caiga DENTRO del repo: una ref rota no resuelve contra afuera.
function resolverRef(t, fdir) {
  return [
    path.join(fdir, t),
    path.join(root, t),
    path.join(root, '..', t),
    path.join(repoRoot, t),
    path.resolve(t),
  ].map(p => path.normalize(p)).find(p => dentroDelRepo(p) && fs.existsSync(p)) || null;
}

// parsear filas de la tabla: | N° | Decisión | Fecha | Estado | Detalle |
const rows = [];
for (const line of txt.split('\n')) {
  const t = line.trim();
  if (!t.startsWith('|')) continue;
  const cells = t.split('|').slice(1, -1).map(c => c.trim());
  if (cells.length < 5) continue;
  const nRaw = cells[0].replace(/[*\s]/g, '');
  if (/^:?-{2,}:?$/.test(nRaw)) continue;               // separador |---|
  if (!/^\d{1,4}$/.test(nRaw)) continue;                 // header u otra fila sin N°
  rows.push({ n: parseInt(nRaw, 10), estado: cells[3], detalle: cells[4] });
}

// [1] numeracion: huecos y duplicados
const gaps = [];
if (rows.length) {
  const nums = rows.map(r => r.n), set = new Set(nums), seen = new Set();
  for (let i = 1; i <= Math.max(...nums); i++) if (!set.has(i)) gaps.push(`falta ${pad(i)}`);
  for (const n of nums) { if (seen.has(n)) gaps.push(`duplicado ${pad(n)}`); seen.add(n); }
}

// [2] links de detalle rotos + recopilar referenciados
const linkRe = /\]\(([^)]+?\.md)\)/;
const referenced = new Set(), refsRotas = [];
for (const r of rows) {
  const m = linkRe.exec(r.detalle);
  if (!m) continue;
  const target = m[1].trim(), abs = resolverRef(target, root);
  if (abs) referenced.add(path.basename(abs));
  else refsRotas.push([pad(r.n), target]);
}

// [3] paginas de detalle huerfanas
const huerfanos = [];
if (fs.existsSync(root)) {
  for (const f of fs.readdirSync(root)) {
    if (!f.endsWith('.md') || f === 'INDICE.md' || f === 'MANIFIESTO.md') continue;  // MANIFIESTO.md: infra del subsistema
    if (!referenced.has(f)) huerfanos.push(f);
  }
}

// [4] superseded (en la columna Estado) que no resuelven
const nums = new Set(rows.map(r => r.n));
const supRe = /(?:reemplazada por|supersede-a|superseded by)[^0-9\n]{0,12}(\d{1,4})/i;
const supRotas = [];
for (const r of rows) {
  const m = supRe.exec(r.estado);
  if (m && !nums.has(parseInt(m[1], 10))) supRotas.push([pad(r.n), `reemplazada por ${pad(parseInt(m[1], 10))}`]);
}

console.log(`== LINT DECISIONES: ${root} ==`);
console.log(`decisiones: ${rows.length}\n`);
console.log(`[1] NUMERACION (${gaps.length}):`);
gaps.forEach(g => console.log(`    ${g}`));
if (!gaps.length) console.log('    (sin huecos ni duplicados)');
console.log(`\n[2] LINKS DE DETALLE ROTOS (${refsRotas.length}):`);
refsRotas.forEach(([n, t]) => console.log(`    ${n}  ->  ${t}   [no existe]`));
if (!refsRotas.length) console.log('    (ninguno)');
console.log(`\n[3] PAGINAS HUERFANAS (${huerfanos.length}):`);
huerfanos.forEach(h => console.log(`    ${h}`));
if (!huerfanos.length) console.log('    (ninguna)');
console.log(`\n[4] SUPERSEDED ROTAS (${supRotas.length}):`);
supRotas.forEach(([n, r]) => console.log(`    ${n}  ->  ${r}   [decision inexistente]`));
if (!supRotas.length) console.log('    (ninguna)');
```

## §Manifiesto — `.claude/decisiones/MANIFIESTO.md`

Contenido EXACTO (si el archivo no existe, crearlo con esto; si existe, reconciliar sin pisar):

````markdown
# Decisiones — manifiesto de subsistema

Las decisiones **estructurales al propósito del repo** (no las operativas triviales) se asientan en `INDICE.md`: una tabla donde cada fila es una decisión (N°, qué + por qué, fecha, estado, y link a detalle si requiere conceptualización mayor).

**Disparador:** consultar las decisiones al planificar y analizar, para no re-decidir ni contradecir lo asentado. Registrar al tomar una decisión que condiciona el repo a futuro; para revertir no se borra, se marca `reemplazada por NNNN`.

**Skills:** `registrar-decision` (juzga si es estructural, chequea que no re-decida ni contradiga, numera, redacta y corre el lint); instalación con `inicializar-decisiones`.

**Índice: NO se carga siempre** — se consulta al planificar y analizar. Al cerrar una tarea que registró decisiones, correr el lint desde la raíz del repo:
```bash
node .claude/decisiones/lint-decisiones/lint-decisiones.js
```
````

## §Subsistemas — sección `## Subsistemas` de `AGENTS.md`

Contenido EXACTO (reemplaza las viejas secciones de prosa por-subsistema + el bloque "Mapa del repo"):

```markdown
## Subsistemas (manifiestos siempre cargados)

Cada subsistema tiene un **Manifiesto** (`.claude/<sub>/MANIFIESTO.md`): una descripción breve —qué es, cómo se usa, cuándo consultarlo— que va **siempre en contexto** y que **declara si su índice también se carga** incluyendo —o no— la línea `@INDICE.md`. Lo que se carga siempre es el manifiesto, no necesariamente el índice.

Si tu agente no expande imports, **leé estos manifiestos al inicio de la sesión** (y, si el manifiesto importa su índice, ese índice también).

@.claude/memoria/MANIFIESTO.md
@.claude/planes/MANIFIESTO.md
@.claude/conocimiento/MANIFIESTO.md
@.claude/glosario/MANIFIESTO.md
@.claude/decisiones/MANIFIESTO.md
@.claude/herramientas/MANIFIESTO.md
```
