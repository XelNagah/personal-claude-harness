# Prompt: inicializar setup completo

> **Uso:** pegar todo lo que sigue (desde la línea horizontal) a un agente de código parado en la raíz del proyecto. Configura de una sola pasada el setup estándar completo en el directorio nativo de tu harness.

---

Configurá en este proyecto el setup estándar completo, usando el directorio de configuración **nativo de tu harness**:

- Claude Code → `.claude/`
- Codex → `.codex/` (instrucciones en `AGENTS.md`)
- Cursor → `.cursor/` (instrucciones en `.cursor/rules/`)
- Copilot → `.github/` (instrucciones en `.github/copilot-instructions.md`)
- Otro / sin convención → `.agent/`

En lo que sigue, `<config>/` es ese directorio. Si parte ya existe, **extendé sin pisar**. Aplicá las ocho partes de convención en orden. (La skill de análisis `planificar` es aparte — no se instala por-repo.)

## Reconciliación (idempotencia)

Este prompt es seguro de re-correr: este es el modo de **"levelear"** repos que ya tienen partes del setup (unas sí, otras no). Aplicá a cada paso que escribe:

- **Inspeccioná antes de escribir.** Leé primero el archivo/carpeta destino. Nunca reescribas de cuajo un archivo existente (en especial el archivo de instrucciones y `memoria/MEMORIA.md`).
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
   - Terminología: no acuñar términos del dominio por cuenta propia; preferir las palabras del usuario. **Gate duro en registros canónicos** (glosario, decisiones): ningún término acuñado por el agente se asienta sin ratificación del usuario. En prosa se puede usar, marcado como propuesto.
4. **Sección "Memoria y planes del proyecto"** con links a `<config>/memoria/MEMORIA.md`, al registro `<config>/planes/PLANES.md` y al archivo de estados `<config>/planes/ESTADOS.md`, indicando que la memoria se carga al inicio de cada sesión y se respeta. El ciclo de planes vive en las carpetas `pendientes/`/`ejecutados/`/`descartados/`.

> **Preferencias como archivo versionado (recomendado):** en vez de inline, preferí persistir las preferencias en `<config>/preferencias/PREFERENCIAS.md` con secciones **Base** (del harness — incluye el bullet de terminología) y **Adaptaciones de este repo**, importada siempre al contexto (`@` si tu harness lo soporta). Instalá entonces el lint `<config>/scripts/lint-preferencias/lint-preferencias.js` (al final, §Script — lint-preferencias), que verifica esa estructura (secciones Base/Adaptaciones + el `@import`); correlo al tocar las preferencias. (Detalle en la funcionalidad `preferencias-trabajo`.)

## 2. Memoria local

Asegurá `<config>/memoria/` con:

- `MEMORIA.md` — índice: una línea por memoria, formato `- [Título](archivo.md) — resumen corto`. Encabezado: "Cargar al inicio de cada sesión y respetar." Acá nunca va contenido, solo punteros. Si ya existe, conservá su encabezado y todas sus líneas y agregá solo las que falten — nunca lo reescribas entero.
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

Instalá el lint en su carpeta propia `<config>/scripts/lint-memoria/lint-memoria.js` (contenido al final, §Script — lint-memoria) — chequea sobre `<config>/memoria/`: refs `.md`/wikilinks rotos, `MEMORIA.md` incompleto, huérfanos y frontmatter inválido; correlo al cerrar tareas que tocaron la memoria. Asegurá en la sección "Memoria del proyecto" del archivo de instrucciones el paso de correr el lint al cerrar.

Creá las dos memorias iniciales (contenido completo al final) y registralas en `MEMORIA.md`:

- `feedback_flujo_planes.md`
- `feedback_estilo_commits.md`

## 3. Gestión de planes

Creá `<config>/planes/pendientes/`, `<config>/planes/ejecutados/` y `<config>/planes/descartados/` (con `.gitkeep` si el repo usa git), más el registro `<config>/planes/PLANES.md` y el archivo de estados `<config>/planes/ESTADOS.md` (fuente de verdad configurable de los estados, que el lint lee; contenido al final, §Estados). El ciclo de vida —máquina de **un solo eje**: `Nuevo · En curso · Diferido · Ejecutado · Descartado`— queda definido en `feedback_flujo_planes.md`.

Si el repo trae un esquema viejo, migralo antes (dos casos, pueden darse juntos): **dos carpetas → tres** (`planes-pendientes/`/`planes-ejecutados/` → `pendientes/`/`ejecutados/` + `descartados/`; grep y reparar refs por ruta); **dos ejes → un eje** (si `PLANES.md` tiene columna `Prioridad` foco/estacionado + estados viejos `idea`/`en diseño`/`listo`/`en ejecución`: quitar la columna `Prioridad`, remapear `estacionado`/`idea`/`en diseño`/`listo` → `Diferido`, `en ejecución` → `En curso`, las cerradas conservan `Ejecutado`/`Descartado`, y sembrar `ESTADOS.md`). Los términos viejos se **barren, no se registran como alias**.

## 4. Base de conocimiento

Asegurá `<config>/conocimiento/` con un `INDICE.md` raíz (una línea por página/sección; solo punteros) — es la **ubicación única** de todo lo que el agente sabe. Instalá el lint en su carpeta propia `<config>/scripts/lint-conocimiento/lint-conocimiento.js` (contenido al final, §Script) — chequea refs rotas, índice incompleto y huérfanos sobre `conocimiento/`; correlo al cerrar tareas que escribieron conocimiento. Persistí la memoria `feedback_base_conocimiento.md` (contenido al final) e indexala. Asegurá en el archivo de instrucciones la sección **"Base de conocimiento del proyecto"** (ubicación única + lint al cerrar).

**Migración — buscá en tres lugares, no solo el obvio:**
- **(a) raíz del repo:** árboles de md, carpetas con su `INDICE.md`, notas sueltas.
- **(b) dentro de `<config>/memoria/`** (el caso más común en repos viejos, y el que más se pasa por alto): la memoria se desborda y termina siendo la base de conocimiento. Señales → **sin frontmatter**, **largo** (decenas/cientos de líneas con secciones), **diccionario/catálogo/procedimiento/formato/estructura**, o **`memoria/` indexado por un `README.md` en vez de `MEMORIA.md`**. Se quedan solo los hechos atómicos tipados con frontmatter.
- **(c) fuentes crudas: NO se mueven** — lo que el agente *lee* (escaneos, PDFs de resúmenes, exports, json/csv de origen) vs. lo que *sabe* (el md sintetizado). Salvo que ya estén entreveradas dentro de una carpeta de conocimiento.

Proponé el plan de move y mové por defecto; ambiguo (código/assets/build) → preguntame antes. ⚠️ **Material sensible, en los dos sentidos:** (i) si un archivo a mover está **ya ignorado** por su ruta (`memoria/*-token.md`, credenciales), moverlo rompe el ignore y **commitea el secreto** → no lo muevas o actualizá el `.gitignore` en el mismo paso (verificá con `git status`); (ii) si hay material sensible **sin ignorar** (credenciales/tokens/`.env`/`*.key`, documentos personales o legales, resúmenes bancarios, libros contables, estudios médicos) → **sugerime** las líneas de `.gitignore` con el riesgo concreto, como hallazgo aparte, sin aplicarlo solo (puedo querer versionarlos a propósito en un repo local) + avisame si el repo nunca debería pushearse a un remoto. **Índice completo:** si había un índice parcial, cubrí TODOS los documentos (los no listados eran huérfanos). **Reparar refs:** índices, links, refs desde el archivo de instrucciones/memorias/planes, y el acople de scripts movidos a `scripts/<tool>/` — `__dirname` (reapuntar) o **cwd** (prepender `process.chdir(require('path').join(__dirname,'<ruta datos>'))`). ⚠️ **Script referenciado por ruta en la config de permisos** (ej. `"Bash(bash tools/moonraker-get.sh:*)"`): las reglas matchean por prefijo exacto → moverlo rompe la pre-autorización (en headless = denegación). Buscá su ruta en la config antes de mover: o no lo movés, o actualizás la regla en el mismo paso. Corré el lint → 0 refs rotas. **Si el repo no tiene git: `git init` + commit inicial ANTES de mover** (un commit inicial post-migración no sirve de rollback).

## 5. Glosario del dominio

Asegurá `<config>/glosario/INDICE.md` (tabla vacía **Concepto | Definición | Alias | Detalle**; contenido al final, §Glosario) — terminología del dominio, un concepto por fila, **alias registrados (no prohibidos)**, conceptos complejos con página `<slug>.md` de detalle. **Gobernanza — toda entrada nueva pasa por el usuario:** el agente puede *proponer* términos (marcados como propuestos), pero no se asientan como canónicos sin ratificación (dejar la línea en el header del glosario). Instalá el lint `<config>/scripts/lint-glosario/lint-glosario.js` (al final, §Lint-glosario). Persistí la memoria `feedback_glosario.md` (al final) e indexala. Asegurá en el archivo de instrucciones la sección **"Glosario del proyecto"**.

## 6. Registro de decisiones

Asegurá `<config>/decisiones/INDICE.md` (tabla vacía **N° | Decisión | Fecha | Estado | Detalle**; §Decisiones) — solo decisiones **estructurales al propósito del repo** (no "ADR", no operativas triviales), misma estructura tabla+detalle que el glosario. Instalá el lint `<config>/scripts/lint-decisiones/lint-decisiones.js` (§Lint-decisiones). Persistí `feedback_decisiones.md` e indexala. Sección **"Decisiones del proyecto"**.

## 7. Gestión de scripts

Asegurá `<config>/scripts/INDICE.md` (registro-tabla vacío **Tool | Qué hace | Cómo se corre | Estado**; §Scripts) — cada script en su carpeta `<tool>/` con un `README.md`; ordena el "cementerio de scripts". Instalá el lint `<config>/scripts/lint-scripts/lint-scripts.js` (§Lint-scripts) con su README. Persistí `feedback_scripts.md` e indexala. Sección **"Scripts del proyecto"**. **Migrar sueltos:** cada uno a `<tool>/` con README y fila; lo que no se sabe qué hace → `Estado: obsoleto` + reportar. ⚠️ Grep de refs por ruta en la config de permisos/`.gitignore`/hooks antes de mover.

## 8. Reporte del leveling

Al terminar: por parte, qué quedó en `agregado` / `ya estaba` / `divergente`, más la estructura final. Si hubo `divergente`, listalo aparte para que lo decida. No hagas commit salvo que te lo pida.

---

## Contenido de las memorias iniciales

### `feedback_flujo_planes.md`

```markdown
---
name: flujo-planes
description: "Cómo gestionar planes — <config>/planes/ (pendientes/ejecutados/descartados), registro PLANES.md, estados en ESTADOS.md (máquina de un eje), slug estable, lint al cerrar"
metadata:
  type: feedback
---

Persistir y gestionar planes bajo `<config>/planes/` con tres subcarpetas: `pendientes/` (planes vivos: `Nuevo`, `En curso`, `Diferido`), `ejecutados/` y `descartados/` (registro, siempre con motivo). Lo fino (estado, fechas, origen) vive en el registro `planes/PLANES.md`, no en el nombre del archivo. Los **estados disponibles y su semántica** (a qué carpeta mapea cada uno, cuáles son terminales) están en `planes/ESTADOS.md` — fuente de verdad configurable que el lint lee.

**Máquina de un solo eje:** un plan está en exactamente un estado. `Nuevo` (creado, sin ejecutar; la revisión con `planificar` ocurre acá) → `En curso` (se tomó el plan y se está ejecutando) → `Ejecutado` (terminal). `Diferido` = pospuesto, retomable. `Descartado` = abandonado con motivo (terminal). No hay estado de "diseño": la revisión es parte de estar `Nuevo`.

**Why:** trazabilidad de qué se planificó, cuándo se creó y cuándo y cómo se cerró — sin depender de archivos efímeros de plan-mode del harness, y sin mirar carpetas a ojo: el registro es la vista, y está siempre en contexto vía el Mapa del repo. Un solo eje (en vez de prioridad × progreso) porque en la práctica un plan pausado siempre está sin empezar, y la distinción diseño/ejecución no aporta al flujo.

**How to apply:**

1. **Al crear un plan:** copiar a `<config>/planes/pendientes/<slug-estable>.md` (sin fecha en el nombre) y agregar su fila en `PLANES.md`: Estado (de `ESTADOS.md`), Creado, Origen si se desprende de otro plan.
2. **Cada actualización al plan** se replica en la versión persistida — es la fuente de verdad, no el archivo del plans-folder del harness. Los cambios de estado se reflejan en `PLANES.md`, y el archivo se mueve a la carpeta que el estado indica.
3. **Al detectar evidencia de implementación** (commit, mensaje del user, código verificado, otro agente): pasar a `Ejecutado` y mover a `ejecutados/` **sin renombrar**, completar `Cerrado` en el registro y agregar sección **`## Notas de implementación`** (cómo se implementó vs planificado, hash de commit, cosas notables).
4. **Descartar es un cierre válido:** `Descartado`, mover a `descartados/`, completar `Cerrado` y una línea de motivo en Notas (p. ej. "superseded por <plan>").
5. **Reparar referencias entrantes** si las hubiera (el slug estable minimiza esto; preferir linkear planes vía `PLANES.md`).
6. **Al cerrar** una tarea que tocó planes, correr el lint: `node <config>/scripts/lint-planes/lint-planes.js`.

Importante: borrar el archivo de `pendientes/` al moverlo — no duplicar. Un plan puede persistirse antes de arrancar la ejecución (p. ej. para cortar una sesión larga de diseño): Estado `Nuevo` o `Diferido` en el registro y bloque al tope con los pendientes para retomar.
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
description: Convención de base de conocimiento — todo lo que el agente sabe vive en <config>/conocimiento/; lint de integridad al cerrar.
metadata:
  type: feedback
---

El conocimiento persistido del agente (documentos, estudios, temas, notas de dominio) vive en una carpeta única: `<config>/conocimiento/`, con un `INDICE.md` en su raíz. (La convención de dónde viven las herramientas/scripts la define la funcionalidad `scripts`.)

**Why:** ubicación determinística → el lint y cualquier consulta saben dónde mirar sin heurística; separa lo que el agente CONOCE (`conocimiento/`) de su config y su tooling; mantiene la raíz del repo limpia.

**How to apply:**

1. Todo md de conocimiento nuevo va bajo `<config>/conocimiento/` (subcarpetas por tema; cada una con su `INDICE.md` si crece). Nunca en la raíz.
2. Mantener `<config>/conocimiento/INDICE.md` como índice raíz (solo punteros).
3. **Al cerrar** una tarea que escribió conocimiento, correr `node <config>/scripts/lint-conocimiento/lint-conocimiento.js` (refs rotas, índice incompleto, huérfanos; sin LLM, sin red) y resolver hallazgos.
4. El **chequeo semántico** (contradicciones, duplicación, staleness) a pedido tras una incorporación grande.
5. **Migración:** un script de datos acoplado por `__dirname` que se mueva a `scripts/<tool>/` debe reapuntar sus paths a `<config>/conocimiento/...`, o se rompe.
```

> Reemplazá `<config>` por el directorio real de tu harness en las tres memorias.

## §Estados — `<config>/planes/ESTADOS.md`

Fuente de verdad de los estados de planes (paso 3). El lint lo lee: cambiar el juego de estados = editar esta tabla, no el código.

```markdown
# Estados de planes

Define los estados disponibles para los planes de este repo y su semántica. Es la **fuente de verdad**: el lint (`lint-planes`) lee este archivo para validar la columna `Estado` de `PLANES.md` y el mapeo estado↔carpeta. Cambiar el juego de estados = editar esta tabla, no el código del lint.

Máquina de **un solo eje**: un plan está en exactamente **un** estado a la vez.

- **Estado** — nombre canónico (el valor que va en la columna `Estado` de `PLANES.md`).
- **Sentido** — qué significa que un plan esté en ese estado.
- **Carpeta** — subcarpeta de `planes/` donde vive el archivo del plan mientras está en ese estado.
- **Terminal** — `sí` si es un estado de cierre (el plan ya no se mueve); `no` si sigue vivo.

| Estado | Sentido | Carpeta | Terminal |
|--------|---------|---------|----------|
| Nuevo | Creado; todavía sin ejecutar. La revisión de alto nivel (con `planificar`) ocurre acá, antes de arrancar. | `pendientes/` | no |
| En curso | Se tomó el plan y se está **ejecutando**. | `pendientes/` | no |
| Diferido | Pospuesto a propósito; retomable más adelante. | `pendientes/` | no |
| Ejecutado | Terminado con éxito. | `ejecutados/` | sí |
| Descartado | Abandonado; no se hará (motivo obligatorio en Notas). | `descartados/` | sí |

No hay estado de "diseño": todo plan `Nuevo` se revisa en alto nivel antes de ejecutarse, así que la revisión es parte de estar `Nuevo`, no un estado aparte. El lint vigila la antigüedad del estado **activo** (`En curso`) — un plan que se está ejecutando hace demasiado y quedó frenado (ver la constante `VIGILAR_ANTIGUEDAD` en `lint-planes.js`).

## Transiciones

​```
  Nuevo ──────► En curso ──────► Ejecutado
    │              │             (terminal)
    ├──► Diferido ◄┘   (retomable → En curso)
    │
    └──► Descartado   (terminal, con motivo)
​```

- `Nuevo` → En curso · Diferido · Descartado
- `En curso` → Diferido · Ejecutado · Descartado
- `Diferido` → En curso · Descartado
- `Ejecutado` — terminal
- `Descartado` — terminal

## Cómo cambiar los estados

Editar la tabla de arriba (agregar/quitar filas o renombrar un estado). Reglas que el lint espera:

- Cada estado no-terminal debe mapear a una carpeta que exista bajo `planes/`.
- Debe haber al menos un estado terminal por carpeta de cierre.
- El valor de la columna `Estado` en `PLANES.md` debe coincidir exactamente con un `Estado` de esta tabla.
```

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

## Contenido de las memorias de glosario, decisiones y scripts

> Reemplazá `<config>` por el directorio real de tu harness.

### `feedback_glosario.md`

```markdown
---
name: glosario
description: Glosario del dominio en <config>/glosario/INDICE.md — tabla de conceptos con alias registrados + páginas de detalle para lo complejo; consultar al planificar/analizar; lint al cerrar.
metadata:
  type: feedback
---

La terminología del dominio vive en `<config>/glosario/INDICE.md`: una tabla donde cada fila es un concepto (nombre canónico, definición corta, alias, y link a página de detalle si el concepto es complejo). Los conceptos complejos tienen su propia página `<config>/glosario/<slug>.md` (fórmulas, ejemplos, contraejemplos).

**Why:** coherencia semántica a lo largo de la vida del repo. Los alias **se registran, no se prohíben**: saber que "birra/chela" son la misma cerveza evita confusión, sin vetar cómo se la nombra.

**How to apply:**

1. **Al planificar o analizar**, consultar el glosario. Si aparece un término, ver si ya es alias de un concepto registrado; si es nuevo, agregar el concepto (o el alias) en el momento.
2. Concepto **simple** → una fila, columna Detalle en `—`. Concepto **complejo** → fila + página de detalle linkeada.
3. **Alias:** registrarlos en la columna Alias (no vetarlos). Un mismo alias no puede estar bajo dos conceptos distintos (el lint lo caza).
4. **Al cerrar** una tarea que tocó el glosario, correr `node <config>/scripts/lint-glosario/lint-glosario.js` (links de detalle, huérfanos, colisión de alias).

Relacionado: [[flujo-planes]].
```

### `feedback_decisiones.md`

```markdown
---
name: decisiones
description: Registro de decisiones estructurales del repo en <config>/decisiones/INDICE.md (tabla + detalle para las complejas, NO ADR); consultar al planificar/analizar; lint al cerrar.
metadata:
  type: feedback
---

Las decisiones **estructurales al propósito del repo** se asientan en `<config>/decisiones/INDICE.md`: una tabla donde cada fila es una decisión (N° secuencial, qué se decidió y por qué, fecha, estado, y link a página de detalle si requiere conceptualización mayor). Misma estructura que el glosario: lo simple vive en la fila, lo complejo en su `NNNN-slug.md`.

**Why:** coherencia decisional — no re-decidir ni contradecir lo estructural. Acotado a lo estructural (no lo operativo trivial) para que el registro siga siendo señal y no ruido — es lo que hacía la "A" de ADR, generalizada a repos de cualquier propósito.

**How to apply:**

1. **Qué registrar:** decisiones que definen cómo es / qué hace el repo en lo esencial, o que eligen un camino que condiciona el trabajo futuro. **No** las triviales o efímeras ("busqué en internet", "usé tal comando").
2. **Al planificar o analizar**, consultar las decisiones previas: no re-abrir ni contradecir. Reemplazar, no borrar: agregar la nueva y marcar la vieja `reemplazada por NNNN`.
3. **Simple** → una fila, Detalle en `—`. **Compleja** → fila + página `NNNN-slug.md`.
4. **Al cerrar**, correr `node <config>/scripts/lint-decisiones/lint-decisiones.js`.

Relacionado: [[flujo-planes]].
```

### `feedback_scripts.md`

```markdown
---
name: scripts
description: Convención de scripts del repo — cada tool en <config>/scripts/<tool>/ con README; registro tabla en INDICE.md; lint; cuidado con refs por ruta en la config de permisos/.gitignore/hooks.
metadata:
  type: feedback
---

Las herramientas/scripts del repo viven en `<config>/scripts/<tool>/`: cada script en su propia carpeta (nunca suelto), con un `README.md` que dice qué hace, cómo se corre y qué lo referencia. El registro `<config>/scripts/INDICE.md` es una tabla (Tool | Qué hace | Cómo se corre | Estado) que los lista a todos.

**Why:** que la carpeta de scripts no se vuelva un cementerio de archivos sin saber qué son, de dónde salieron ni cómo se usan.

**How to apply:**

1. Todo script nuevo va en `<config>/scripts/<tool>/` con su `README.md`. Nunca suelto.
2. Registrarlo en `<config>/scripts/INDICE.md`. Marcar `Estado`; los `obsoleto` se pueden depurar.
3. ⚠️ **Refs por ruta:** un script referenciado por ruta en la config de permisos, en `.gitignore` o en un hook NO se mueve/renombra alegremente — rompe el match por prefijo exacto y se pierde la pre-autorización. Antes de mover, grep su ruta; si aparece, actualizar la referencia en el mismo paso.
4. **Al cerrar**, correr `node <config>/scripts/lint-scripts/lint-scripts.js`.

Otras memorias, planes o conocimiento pueden referenciar un tool por su ruta explicando cómo usarlo.

Relacionado: [[flujo-planes]], [[base-conocimiento]].
```

## §Lint-glosario — `<config>/scripts/lint-glosario/lint-glosario.js`

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

## §Lint-decisiones — `<config>/scripts/lint-decisiones/lint-decisiones.js`

```js
#!/usr/bin/env node
// Lint del registro de decisiones: numeracion, links de detalle, huerfanos, superseded. Sin LLM, sin red.
// Uso: node lint-decisiones.js [<carpeta>]   (default: .claude/decisiones)
const fs = require('fs'), path = require('path');
const root = path.resolve(process.argv[2] || '.claude/decisiones');
const mainPath = path.join(root, 'INDICE.md');
const txt = fs.existsSync(mainPath) ? fs.readFileSync(mainPath, 'utf8') : '';
const pad = n => String(n).padStart(4, '0');

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
  const target = m[1].trim(), abs = path.normalize(path.join(root, target));
  if (fs.existsSync(abs)) referenced.add(path.basename(abs));
  else refsRotas.push([pad(r.n), target]);
}

// [3] paginas de detalle huerfanas
const huerfanos = [];
if (fs.existsSync(root)) {
  for (const f of fs.readdirSync(root)) {
    if (!f.endsWith('.md') || f === 'INDICE.md') continue;
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

## §Lint-scripts — `<config>/scripts/lint-scripts/lint-scripts.js`

```js
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
```

## §Script — lint-memoria — `<config>/scripts/lint-memoria/lint-memoria.js`

> Reemplazá `.claude` por el directorio real de tu harness.

```js
#!/usr/bin/env node
// Lint de la memoria local: refs rotas, indice (MEMORIA.md) incompleto, huerfanos, frontmatter. Sin LLM, sin red.
// Uso: node lint-memoria.js [<carpeta>]   (default: .claude/memoria)
const fs = require('fs'), path = require('path');
const root = path.resolve(process.argv[2] || '.claude/memoria');
const EXCLUDE = new Set(['.git', 'node_modules']);
const TYPES = new Set(['user', 'feedback', 'project', 'reference']);

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
const read = f => fs.readFileSync(f, 'utf8');
const inRoot = p => path.resolve(p).startsWith(path.resolve(root) + path.sep);

const all = walk(root, []);
const indexFile = path.join(root, 'MEMORIA.md');
const hasIndex = fs.existsSync(indexFile);
const idxText = hasIndex ? read(indexFile) : '';
const memos = all.filter(p => path.basename(p) !== 'MEMORIA.md');

// nombres validos para wikilinks: `name:` del frontmatter + stem del archivo
const nameSet = new Set();
for (const p of memos) {
  nameSet.add(path.basename(p).slice(0, -3));
  const fm = read(p).match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (fm) { const nm = fm[1].match(/^name:\s*(\S+)/m); if (nm) nameSet.add(nm[1].trim()); }
}

const mdLink = /\]\(([^)]+?\.md)\)/g;
const codePath = /`([^`]+?\/[^`]+?\.md)`/g;
const wiki = /\[\[([^\]]+?)\]\]/g;

// [1] refs rotas: links a .md inexistentes + wikilinks sin memoria.
// Una memoria puede linkear a otros subsistemas (planes/, conocimiento/, ...): se resuelve
// tambien relativo a .claude/, a la raiz del repo y al cwd, no solo dentro de memoria/.
const broken = [], referenced = new Set();
for (const f of all) {
  const txt = read(f), fdir = path.dirname(f);
  for (const re of [mdLink, codePath]) {
    let m; re.lastIndex = 0;
    while ((m = re.exec(txt))) {
      let t = m[1].trim();
      if (/^https?:\/\//.test(t)) continue;
      if (t.includes('...') || t.includes('<')) continue;
      const cands = [
        path.join(fdir, t),
        path.join(root, t),
        path.join(root, '..', t),
        path.join(root, '..', '..', t),
        path.resolve(t),
      ].map(p => path.normalize(p));
      const hit = cands.find(fs.existsSync);
      if (hit) { if (inRoot(hit)) referenced.add(rel(hit)); }
      else broken.push([rel(f), t, 'ref .md no existe']);
    }
  }
  let m; wiki.lastIndex = 0;
  while ((m = wiki.exec(txt))) {
    const name = m[1].split('|')[0].trim();
    if (!nameSet.has(name)) broken.push([rel(f), `[[${name}]]`, 'wikilink sin memoria']);
  }
}

// [2] indice incompleto: memoria no listada en MEMORIA.md (por archivo o por name)
const gaps = [];
for (const p of memos) {
  const base = path.basename(p), stem = base.slice(0, -3);
  if (!idxText.includes(base) && !idxText.includes(stem)) gaps.push(rel(p));
}

// [3] huerfanos: ni referenciada ni en el indice
const orphans = [];
for (const p of memos) {
  if (referenced.has(rel(p))) continue;
  const base = path.basename(p), stem = base.slice(0, -3);
  if (idxText.includes(base) || idxText.includes(stem)) continue;
  orphans.push(rel(p));
}

// [4] frontmatter: name / description / metadata.type valido
const fmBad = [];
for (const p of memos) {
  const txt = read(p);
  const fm = txt.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) { fmBad.push([rel(p), 'sin frontmatter']); continue; }
  const body = fm[1];
  if (!/\bname:\s*\S/.test(body)) fmBad.push([rel(p), 'falta name']);
  if (!/\bdescription:\s*\S/.test(body)) fmBad.push([rel(p), 'falta description']);
  const tm = body.match(/type:\s*([a-z]+)/);
  if (!tm) fmBad.push([rel(p), 'falta metadata.type']);
  else if (!TYPES.has(tm[1])) fmBad.push([rel(p), `type invalido: ${tm[1]}`]);
}

console.log(`== LINT MEMORIA: ${root} ==`);
console.log(`memorias: ${memos.length} | indice: ${hasIndex ? 'MEMORIA.md' : 'FALTA'}\n`);
if (!hasIndex) console.log('[!] No existe MEMORIA.md (indice de memoria)\n');
console.log(`[1] REFS ROTAS (${broken.length}):`);
broken.forEach(([f, r, w]) => console.log(`    ${f}  ->  ${r}   [${w}]`));
if (!broken.length) console.log('    (ninguna)');
console.log(`\n[2] INDICE INCOMPLETO (${gaps.length}):`);
gaps.forEach(p => console.log(`    MEMORIA.md  no lista  ${p}`));
if (!gaps.length) console.log('    (completo)');
console.log(`\n[3] HUERFANOS (${orphans.length}):`);
orphans.forEach(o => console.log(`    ${o}`));
if (!orphans.length) console.log('    (ninguno)');
console.log(`\n[4] FRONTMATTER (${fmBad.length}):`);
fmBad.forEach(([p, w]) => console.log(`    ${p}   [${w}]`));
if (!fmBad.length) console.log('    (ok)');
```

## §Script — lint-preferencias — `<config>/scripts/lint-preferencias/lint-preferencias.js`

> Reemplazá `.claude` por el directorio real de tu harness.

```js
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

// @import en CLAUDE.md (las preferencias tienen que estar siempre en contexto)
const claudeMd = path.join(claudeDir, 'CLAUDE.md');
if (fs.existsSync(claudeMd)) {
  const c = fs.readFileSync(claudeMd, 'utf8');
  if (!/@preferencias\/PREFERENCIAS\.md/.test(c)) {
    problems.push('CLAUDE.md no importa @preferencias/PREFERENCIAS.md (no queda en contexto)');
  }
} else {
  problems.push('no existe CLAUDE.md (no se pudo verificar el @import)');
}

console.log(`== LINT PREFERENCIAS: ${prefFile} ==`);
console.log(`hallazgos: ${problems.length}\n`);
if (!problems.length) console.log('    (ok)');
else problems.forEach(p => console.log(`    [x] ${p}`));
```
