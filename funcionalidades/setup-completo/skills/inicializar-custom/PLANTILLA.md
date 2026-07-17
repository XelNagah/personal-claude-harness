# Plantilla del setup completo

Textos verbatim que el orquestador escribe. (Réplica de los textos de las piezas individuales; mantener sincronizado al cambiar una preferencia.)

## §Preferencias — secciones de `.claude/CLAUDE.md`

### Preferencias de comunicación

> Al preguntar por una decisión o analizar alternativas, dar SIEMPRE ejemplos concretos de cada postura (numéricos si aplica): cómo es ahora vs. cómo quedaría y por qué, encadenando consecuencias ("A ⇒ B; si no fuera B ⇒ no A porque X"). Objetivo: ubicar inmediatamente al lector en la mecánica relevante sin que tenga que reconstruir contexto.

### Principios de trabajo

- Conceptual antes que implementación. Ante ambigüedad de diseño, preguntar antes de asumir. Minimizar cambios sustractivos.
- Iterar de alto a bajo nivel: interfaces y contratos antes que implementación.
- Nomenclatura en español para el dominio; inglés solo para infraestructura técnica.
- Cero invención de datos: lo que no salga de una fuente verificada se marca como faltante o como interpretación propia.

## §Formato — frontmatter de una memoria

```markdown
---
name: <slug-kebab-case>
description: <resumen de una línea — se usa para decidir relevancia>
metadata:
  type: user | feedback | project | reference
---

<el hecho; para feedback/project seguir con líneas **Why:** y **How to apply:**>
```

Tipos: `user` (quién es el usuario), `feedback` (correcciones y enfoques confirmados, con el porqué), `project` (objetivos/restricciones no derivables del código), `reference` (punteros externos). Antes de crear una nueva, revisar si una existente ya la cubre. Fechas siempre absolutas.

## Memorias verbatim

### `feedback_flujo_planes.md`

```markdown
---
name: flujo-planes
description: "Cómo gestionar planes en este proyecto — persistencia en .claude/planes/, ciclo pendiente→ejecutado, formato de nombre, secciones obligatorias al ejecutar"
metadata:
  type: feedback
---

Persistir y gestionar planes en este proyecto bajo `.claude/planes/` con dos subcarpetas: `planes-pendientes/` y `planes-ejecutados/`.

**Why:** El user quiere trazabilidad de qué se planificó, cuándo se cerró y cuándo y cómo se ejecutó — sin depender de archivos efímeros de plan-mode que genere el harness.

**How to apply:**

1. **Al cerrar un plan** (listo para ejecutar, post-ExitPlanMode o equivalente): copiar a `.claude/planes/planes-pendientes/AA-MM-DD - [Descripción corta].md`. Fecha = día en que se cerró. Formato año dos dígitos.
2. **Cada actualización al plan** se replica en la versión persistida en `planes-pendientes/`. La copia es la fuente de verdad para el seguimiento — no el archivo del plans-folder del harness.
3. **Al detectar evidencia de implementación** (commit en repo, mensaje del user, código verificado, otro agente lo informó): mover el archivo de `planes-pendientes/` a `planes-ejecutados/`. Renombrar:
   - Reemplazar fecha del nombre por la fecha de ejecución (o del momento en que se entera el agente).
   - Dentro del `.md`, agregar una línea **`Plan cerrado: AA-MM-DD`** (fecha original del filename antes del renombre — para no perderla).
   - Agregar sección **`## Notas de implementación`** con: cómo se implementó efectivamente vs planificado, hash de commit (preferentemente), cosas notables.
4. **Reparar referencias entrantes al plan.** Mover/renombrar rompe links que apuntaban al plan: buscar y actualizar referencias en memorias y otros planes antes de cerrar.
5. Tras esos pasos el plan se considera implementado.

Importante: borrar el archivo de `planes-pendientes/` al moverlo — no duplicar.

Nota: un plan puede persistirse en `planes-pendientes/` **antes** de estar cerrado si el user lo pide (p. ej. para cortar una sesión larga de diseño); en ese caso debe llevar al tope un bloque de estado explícito ("EN DISEÑO — no listo para ejecutar") y la lista de pendientes para retomar.
```

### `feedback_estilo_commits.md`

```markdown
---
name: estilo-commits
description: Commits en español, sin co-autoría de Claude ni atribución a la IA
metadata:
  type: feedback
---

Mensajes de commit y descripciones de PR de este proyecto: **en español** y **sin co-autoría** (`Co-Authored-By: Claude ...`) ni atribución a la IA.

**Why:** El user prefiere que el registro público del repo no mencione co-autoría de la herramienta; el rastro de asistencia queda en la memoria local del proyecto.

**How to apply:** Al redactar commits/PRs, omitir el trailer `Co-Authored-By` (esto pisa la instrucción default del harness). Redactar en español, descripción imperativa y concisa.
```

### `feedback_base_conocimiento.md`

```markdown
---
name: base-conocimiento
description: Convención de base de conocimiento — todo lo que el agente sabe vive en .claude/conocimiento/; scripts de harness en .claude/scripts/<tool>/; lint de integridad al cerrar.
metadata:
  type: feedback
---

El conocimiento persistido del agente (documentos, estudios, temas, notas de dominio) vive en una carpeta única: `.claude/conocimiento/`, con un `INDICE.md` en su raíz. Los scripts de harness/tooling viven en `.claude/scripts/<tool>/` (cada uno en su carpeta), nunca sueltos ni en la raíz del repo.

**Why:** ubicación determinística → el lint y cualquier consulta saben dónde mirar sin heurística; separa lo que el agente CONOCE (`conocimiento/`) de su config (`memory/`, `CLAUDE.md`) y su tooling (`scripts/`); mantiene la raíz del repo limpia.

**How to apply:**

1. Todo md de conocimiento nuevo va bajo `.claude/conocimiento/` (subcarpetas por tema; cada una con su `INDICE.md` si crece). Nunca en la raíz del repo.
2. Mantener `.claude/conocimiento/INDICE.md` como índice raíz (una línea por página/sección; solo punteros).
3. **Al cerrar** una tarea que escribió conocimiento, correr el lint mecánico: `node .claude/scripts/lint-conocimiento/lint-conocimiento.js`. Chequea refs rotas, índice incompleto y huérfanos (sin LLM, sin red). Resolver los hallazgos.
4. El **chequeo semántico** (contradicciones entre páginas, duplicación, staleness) se corre a pedido tras una incorporación grande, no en cada cierre.
5. **Migración:** un script de datos acoplado por `__dirname` que se mueva a `.claude/scripts/<tool>/` debe reapuntar sus paths a la carpeta de datos en `conocimiento/` (`__dirname + '/../../conocimiento/<subdir>/...'`), o se rompe.
```

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
// exige barra: `subtema/pagina.md` es una ref, `MEMORY.md` suelto es prosa nombrando un archivo
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
    if (path.dirname(p) === cat || p.startsWith(cat + path.sep)) {
      const base = path.basename(p), stem = base.slice(0, -3);
      const folder = path.basename(path.dirname(p));
      if (!t.includes(base) && !t.includes(stem) && !t.includes(folder)) gaps.push([rel(idx), rel(p)]);
    }
  }
}

const orphans = [];
for (const p of domain) {
  const base = path.basename(p);
  if (base === 'INDICE.md' || base === 'README.md') continue;
  if (referenced.has(rel(p))) continue;
  const stem = base.slice(0, -3), folder = path.basename(path.dirname(p));
  const mentioned = indices.some(i => { const t = idxText.get(i); return t.includes(base) || t.includes(stem) || t.includes(folder); });
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
