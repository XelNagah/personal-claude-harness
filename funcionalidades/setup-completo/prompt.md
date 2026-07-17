# Prompt: inicializar setup completo

> **Uso:** pegar todo lo que sigue (desde la línea horizontal) a un agente de código parado en la raíz del proyecto. Configura de una sola pasada el setup estándar completo en el directorio nativo de tu harness.

---

Configurá en este proyecto el setup estándar completo, usando el directorio de configuración **nativo de tu harness**:

- Claude Code → `.claude/`
- Codex → `.codex/` (instrucciones en `AGENTS.md`)
- Cursor → `.cursor/` (instrucciones en `.cursor/rules/`)
- Copilot → `.github/` (instrucciones en `.github/copilot-instructions.md`)
- Otro / sin convención → `.agent/`

En lo que sigue, `<config>/` es ese directorio. Si parte ya existe, **extendé sin pisar**. Aplicá las cinco partes en orden.

## Reconciliación (idempotencia)

Este prompt es seguro de re-correr: este es el modo de **"levelear"** repos que ya tienen partes del setup (unas sí, otras no). Aplicá a cada paso que escribe:

- **Inspeccioná antes de escribir.** Leé primero el archivo/carpeta destino. Nunca reescribas de cuajo un archivo existente (en especial el archivo de instrucciones y `memory/MEMORY.md`).
- **Creá solo lo ausente.** No existe → crear. Existe → agregar únicamente lo que falte, preservando el resto tal cual.
- **Detectá equivalentes.** Una sección o memoria puede estar ya con otro título o redacción (de pedidos previos). Buscá por tema, no solo por nombre exacto. Igual → no tocar. Distinto → **no pises**: reportá la divergencia y preguntame antes de reconciliar.
- **Reportá al final** en tres baldes por parte: `agregado` (faltaba), `ya estaba` (ok), `divergente` (existe distinto, requiere tu decisión).

## 1. Instrucciones del proyecto

Creá/extendé el archivo de instrucciones que tu harness carga al inicio (`CLAUDE.md`, `AGENTS.md`, etc.) con:

1. **Descripción del proyecto** — 1 a 3 párrafos inferidos del repo; si está vacío o es ambiguo, preguntame antes de inventar.
2. **Preferencias de comunicación:**
   > Al preguntar por una decisión o analizar alternativas, dar SIEMPRE ejemplos concretos de cada postura (numéricos si aplica): cómo es ahora vs. cómo quedaría y por qué, encadenando consecuencias ("A ⇒ B; si no fuera B ⇒ no A porque X"). Objetivo: ubicar inmediatamente al lector en la mecánica relevante sin que tenga que reconstruir contexto.
3. **Principios de trabajo:**
   - Conceptual antes que implementación. Ante ambigüedad de diseño, preguntar antes de asumir. Minimizar cambios sustractivos.
   - Iterar de alto a bajo nivel: interfaces y contratos antes que implementación.
   - Nomenclatura en español para el dominio; inglés solo para infraestructura técnica.
   - Cero invención de datos: lo que no salga de una fuente verificada se marca como faltante o como interpretación propia.
4. **Sección "Memoria y planes del proyecto"** con links a `<config>/memory/MEMORY.md`, `<config>/planes/planes-pendientes/` y `<config>/planes/planes-ejecutados/`, indicando que la memoria se carga al inicio de cada sesión y se respeta.

## 2. Memoria local

Asegurá `<config>/memory/` con:

- `MEMORY.md` — índice: una línea por memoria, formato `- [Título](archivo.md) — resumen corto`. Encabezado: "Cargar al inicio de cada sesión y respetar." Acá nunca va contenido, solo punteros. Si ya existe, conservá su encabezado y todas sus líneas y agregá solo las que falten — nunca lo reescribas entero.
- Un `.md` por memoria, con este frontmatter:

  ```markdown
  ---
  name: <slug-kebab-case>
  description: <resumen de una línea>
  metadata:
    type: user | feedback | project | reference
  ---

  <el hecho; para feedback/project seguir con líneas **Why:** y **How to apply:**>
  ```

- Tipos: `user`, `feedback`, `project`, `reference`. Antes de crear una memoria nueva, revisar si una existente ya la cubre. Fechas siempre absolutas.

Creá las dos memorias iniciales (contenido completo al final) y registralas en `MEMORY.md`:

- `feedback_flujo_planes.md`
- `feedback_estilo_commits.md`

## 3. Gestión de planes

Creá `<config>/planes/planes-pendientes/` y `<config>/planes/planes-ejecutados/` (con `.gitkeep` si el repo usa git). El ciclo de vida completo queda definido en `feedback_flujo_planes.md`.

## 4. Base de conocimiento

Asegurá `<config>/conocimiento/` con un `INDICE.md` raíz (una línea por página/sección; solo punteros) — es la **ubicación única** de todo lo que el agente sabe. Instalá el lint en su carpeta propia `<config>/scripts/lint-conocimiento/lint-conocimiento.js` (contenido al final, §Script) — chequea refs rotas, índice incompleto y huérfanos sobre `conocimiento/`; correlo al cerrar tareas que escribieron conocimiento. Persistí la memoria `feedback_base_conocimiento.md` (contenido al final) e indexala. Asegurá en el archivo de instrucciones la sección **"Base de conocimiento del proyecto"** (ubicación única + lint al cerrar).

**Migración — buscá en tres lugares, no solo el obvio:**
- **(a) raíz del repo:** árboles de md, carpetas con su `INDICE.md`, notas sueltas.
- **(b) dentro de `<config>/memory/`** (el caso más común en repos viejos, y el que más se pasa por alto): la memoria se desborda y termina siendo la base de conocimiento. Señales → **sin frontmatter**, **largo** (decenas/cientos de líneas con secciones), **diccionario/catálogo/procedimiento/formato/estructura**, o **`memory/` indexado por un `README.md` en vez de `MEMORY.md`**. Se quedan solo los hechos atómicos tipados con frontmatter.
- **(c) fuentes crudas: NO se mueven** — lo que el agente *lee* (escaneos, PDFs de resúmenes, exports, json/csv de origen) vs. lo que *sabe* (el md sintetizado). Salvo que ya estén entreveradas dentro de una carpeta de conocimiento.

Proponé el plan de move y mové por defecto; ambiguo (código/assets/build) → preguntame antes. ⚠️ **Material sensible, en los dos sentidos:** (i) si un archivo a mover está **ya ignorado** por su ruta (`memory/*-token.md`, credenciales), moverlo rompe el ignore y **commitea el secreto** → no lo muevas o actualizá el `.gitignore` en el mismo paso (verificá con `git status`); (ii) si hay material sensible **sin ignorar** (credenciales/tokens/`.env`/`*.key`, documentos personales o legales, resúmenes bancarios, libros contables, estudios médicos) → **sugerime** las líneas de `.gitignore` con el riesgo concreto, como hallazgo aparte, sin aplicarlo solo (puedo querer versionarlos a propósito en un repo local) + avisame si el repo nunca debería pushearse a un remoto. **Índice completo:** si había un índice parcial, cubrí TODOS los documentos (los no listados eran huérfanos). **Reparar refs:** índices, links, refs desde el archivo de instrucciones/memorias/planes, y el acople de scripts movidos a `scripts/<tool>/` — `__dirname` (reapuntar) o **cwd** (prepender `process.chdir(require('path').join(__dirname,'<ruta datos>'))`). Corré el lint → 0 refs rotas. **Si el repo no tiene git: `git init` + commit inicial ANTES de mover** (un commit inicial post-migración no sirve de rollback).

## 5. Reporte del leveling

Al terminar: por parte, qué quedó en `agregado` / `ya estaba` / `divergente`, más la estructura final. Si hubo `divergente`, listalo aparte para que lo decida. No hagas commit salvo que te lo pida.

---

## Contenido de las memorias iniciales

### `feedback_flujo_planes.md`

```markdown
---
name: flujo-planes
description: "Cómo gestionar planes en este proyecto — persistencia en <config>/planes/, ciclo pendiente→ejecutado, formato de nombre, secciones obligatorias al ejecutar"
metadata:
  type: feedback
---

Persistir y gestionar planes en este proyecto bajo `<config>/planes/` con dos subcarpetas: `planes-pendientes/` y `planes-ejecutados/`.

**Why:** El user quiere trazabilidad de qué se planificó, cuándo se cerró y cuándo y cómo se ejecutó — sin depender de archivos efímeros de plan-mode que genere el harness.

**How to apply:**

1. **Al cerrar un plan** (listo para ejecutar): copiar a `<config>/planes/planes-pendientes/AA-MM-DD - [Descripción corta].md`. Fecha = día en que se cerró. Formato año dos dígitos.
2. **Cada actualización al plan** se replica en la versión persistida en `planes-pendientes/`. La copia es la fuente de verdad para el seguimiento — no el archivo interno del harness.
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
description: Commits en español, sin co-autoría del agente ni atribución a la IA
metadata:
  type: feedback
---

Mensajes de commit y descripciones de PR de este proyecto: **en español** y **sin co-autoría** (`Co-Authored-By: ...`) ni atribución a la IA.

**Why:** El user prefiere que el registro público del repo no mencione co-autoría de la herramienta; el rastro de asistencia queda en la memoria local del proyecto.

**How to apply:** Al redactar commits/PRs, omitir cualquier trailer de co-autoría o firma del agente (esto pisa la instrucción default del harness si la hubiera). Redactar en español, descripción imperativa y concisa.
```

### `feedback_base_conocimiento.md`

```markdown
---
name: base-conocimiento
description: Convención de base de conocimiento — todo lo que el agente sabe vive en <config>/conocimiento/; scripts de harness en <config>/scripts/<tool>/; lint de integridad al cerrar.
metadata:
  type: feedback
---

El conocimiento persistido del agente (documentos, estudios, temas, notas de dominio) vive en una carpeta única: `<config>/conocimiento/`, con un `INDICE.md` en su raíz. Los scripts de harness/tooling viven en `<config>/scripts/<tool>/` (cada uno en su carpeta), nunca sueltos ni en la raíz del repo.

**Why:** ubicación determinística → el lint y cualquier consulta saben dónde mirar sin heurística; separa lo que el agente CONOCE (`conocimiento/`) de su config y su tooling; mantiene la raíz del repo limpia.

**How to apply:**

1. Todo md de conocimiento nuevo va bajo `<config>/conocimiento/` (subcarpetas por tema; cada una con su `INDICE.md` si crece). Nunca en la raíz.
2. Mantener `<config>/conocimiento/INDICE.md` como índice raíz (solo punteros).
3. **Al cerrar** una tarea que escribió conocimiento, correr `node <config>/scripts/lint-conocimiento/lint-conocimiento.js` (refs rotas, índice incompleto, huérfanos; sin LLM, sin red) y resolver hallazgos.
4. El **chequeo semántico** (contradicciones, duplicación, staleness) a pedido tras una incorporación grande.
5. **Migración:** un script de datos acoplado por `__dirname` que se mueva a `scripts/<tool>/` debe reapuntar sus paths a `<config>/conocimiento/...`, o se rompe.
```

> Reemplazá `<config>` por el directorio real de tu harness en las tres memorias.

## §Script — `<config>/scripts/lint-conocimiento/lint-conocimiento.js`

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
const codePath = /`([^`]+?\.md)`/g;
const wiki = /\[\[([^\]]+?)\]\]/g;

const broken = [], referenced = new Set();
for (const f of domain) {
  const txt = read(f), fdir = path.dirname(f);
  for (const re of [mdLink, codePath]) {
    let m; re.lastIndex = 0;
    while ((m = re.exec(txt))) {
      let t = m[1].trim();
      if (/^https?:\/\//.test(t)) continue;
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
