# Plantilla del setup completo

Textos verbatim que el orquestador escribe. (Réplica de los textos de las piezas individuales; mantener sincronizado al cambiar una preferencia.)

## §Preferencias — `.claude/preferencias/PREFERENCIAS.md` + sección de CLAUDE.md

Sistema versionado: **Base** (del harness; el leveleo la actualiza por versión) + **Adaptaciones de este repo** (nunca se toca). Importado siempre al contexto — las preferencias son reglas de conducta: inline, no índice+fetch. Al editar la Base acá, **incrementar la versión**.

Semilla de `.claude/preferencias/PREFERENCIAS.md`:

```markdown
# Preferencias

Reglas de conducta del agente en este repo. Siempre en contexto (importado desde CLAUDE.md). La sección **Base** viene del harness y se actualiza al levelear (no editarla acá: los ajustes de este repo van en **Adaptaciones**, que el leveleo nunca toca).

## Base (harness v2)

**Comunicación:**

- Al preguntar por una decisión o analizar alternativas, dar SIEMPRE ejemplos concretos de cada postura (numéricos si aplica): cómo es ahora vs. cómo quedaría y por qué, encadenando consecuencias ("A ⇒ B; si no fuera B ⇒ no A porque X"). Objetivo: ubicar inmediatamente al lector en la mecánica relevante sin que tenga que reconstruir contexto.
- Ante un informe o visualización de **formato nuevo**: mostrar primero el esqueleto con datos de juguete marcados como DUMMY, acordar la representación, recién después calcular en serio. **Nunca re-producir completo un formato rechazado**: volver al esqueleto y realinear.
- Tareas en background: esperar la notificación de finalización; no reportar ni consultar estado a cada rato — solo ante sospecha de cuelgue.

**Principios de trabajo:**

- Conceptual antes que implementación. Ante ambigüedad de diseño, preguntar antes de asumir. Minimizar cambios sustractivos.
- Iterar de alto a bajo nivel: interfaces y contratos antes que implementación.
- Nomenclatura en español para el dominio; inglés solo para infraestructura técnica.
- Cero invención de datos: lo que no salga de una fuente verificada se marca como faltante o como interpretación propia.
- Terminología: no acuñar términos del dominio por cuenta propia; preferir las palabras del usuario. **Español corriente en todo**: nada de palabras inventadas o raras (aunque suenen técnicas), ni en prosa ni en diagramas — no solo en los registros. **Gate duro en registros canónicos** (glosario, decisiones): ningún término acuñado por el agente se asienta sin ratificación del usuario. En prosa/diagramas se puede usar, marcado como propuesto.

## Adaptaciones de este repo

(ninguna todavía — agregar acá lo específico de este proyecto)
```

Sección de `.claude/CLAUDE.md`:

```markdown
## Preferencias (siempre cargadas)

@preferencias/PREFERENCIAS.md

Al tocar las preferencias, correr el lint estructural **desde la raíz del repo** (chequea secciones Base/Adaptaciones + el `@import`):

​```bash
node .claude/scripts/lint-preferencias/lint-preferencias.js
​```
```

(El lint `lint-preferencias.js` está más abajo, en §Script — lint-preferencias; y `lint-memoria.js` en §Script — lint-memoria.)

**Bases anteriores** (para la reconciliación): la v0 eran dos secciones inline en CLAUDE.md — "Preferencias de comunicación" (el primer bullet de Comunicación, como cita) y "Principios de trabajo" (los cuatro bullets). Verbatim iguales → migrar sin preguntar (borrar de CLAUDE.md, dejar el import); con diferencias → las diferencias van a Adaptaciones y se reporta.

## §Mapa — bloque de imports en `.claude/CLAUDE.md`

Lo crea `memoria-local`; cada funcionalidad con índice agrega su línea al instalarse:

```markdown
## Mapa del repo (siempre cargado)

@memoria/MEMORIA.md
@planes/PLANES.md
@conocimiento/INDICE.md
@scripts/INDICE.md
```

(Solo las líneas de lo instalado; rutas relativas al CLAUDE.md. **Datos** van por índice+fetch — las descriptions del índice se escriben como ganchos que carguen el dato clave. **Reglas de conducta** no: van inline vía §Preferencias.)

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
description: "Cómo gestionar planes — .claude/planes/ (pendientes/ejecutados/descartados), registro PLANES.md, estados en ESTADOS.md (máquina de un eje), slug estable, lint al cerrar"
metadata:
  type: feedback
---

Persistir y gestionar planes bajo `.claude/planes/` con tres subcarpetas: `pendientes/` (planes vivos: `Nuevo`, `En curso`, `Diferido`), `ejecutados/` y `descartados/` (registro, siempre con motivo). Lo fino (estado, fechas, origen) vive en el registro `planes/PLANES.md`, no en el nombre del archivo. Los **estados disponibles y su semántica** (a qué carpeta mapea cada uno, cuáles son terminales) están en `planes/ESTADOS.md` — fuente de verdad configurable que el lint lee.

**Máquina de un solo eje:** un plan está en exactamente un estado. `Nuevo` (creado, sin ejecutar; la revisión con `planificar` ocurre acá) → `En curso` (se tomó el plan y se está ejecutando) → `Ejecutado` (terminal). `Diferido` = pospuesto, retomable. `Descartado` = abandonado con motivo (terminal). No hay estado de "diseño": la revisión es parte de estar `Nuevo`.

**Why:** trazabilidad de qué se planificó, cuándo se creó y cuándo y cómo se cerró — sin depender de archivos efímeros de plan-mode del harness, y sin mirar carpetas a ojo: el registro es la vista, y está siempre en contexto vía el Mapa del repo. Un solo eje (en vez de prioridad × progreso) porque en la práctica un plan pausado siempre está sin empezar, y la distinción diseño/ejecución no aporta al flujo.

**How to apply:**

1. **Al crear un plan:** copiar a `.claude/planes/pendientes/<slug-estable>.md` (sin fecha en el nombre) y agregar su fila en `PLANES.md`: Estado (de `ESTADOS.md`), Creado, Origen si se desprende de otro plan.
2. **Cada actualización al plan** se replica en la versión persistida — es la fuente de verdad, no el archivo del plans-folder del harness. Los cambios de estado se reflejan en `PLANES.md`, y el archivo se mueve a la carpeta que el estado indica.
3. **Al detectar evidencia de implementación** (commit, mensaje del user, código verificado, otro agente): pasar a `Ejecutado` y mover a `ejecutados/` **sin renombrar**, completar `Cerrado` en el registro y agregar sección **`## Notas de implementación`** (cómo se implementó vs planificado, hash de commit, cosas notables).
4. **Descartar es un cierre válido:** `Descartado`, mover a `descartados/`, completar `Cerrado` y una línea de motivo en Notas (p. ej. "superseded por <plan>").
5. **Reparar referencias entrantes** si las hubiera (el slug estable minimiza esto; preferir linkear planes vía `PLANES.md`).
6. **Al cerrar** una tarea que tocó planes, correr el lint: `node .claude/scripts/lint-planes/lint-planes.js`.

Importante: borrar el archivo de `pendientes/` al moverlo — no duplicar. Un plan puede persistirse antes de arrancar la ejecución (p. ej. para cortar una sesión larga de diseño): Estado `Nuevo` o `Diferido` en el registro y bloque al tope con los pendientes para retomar.

Relacionado: [[artefacto-estado]] (estado vivo de una exploración dentro del plan).
```

### `feedback_artefacto_estado.md`

```markdown
---
name: artefacto-estado
description: En tareas exploratorias multi-variable, mantener UN archivo de estado (tabla dimensión×resultado) actualizado antes de reportar en el chat; leerlo al retomar.
metadata:
  type: feedback
---

En tareas exploratorias multi-variable (benchmarks, comparaciones, análisis de escenarios), mantener **un** archivo de estado desde la primera corrida: tabla dimensión×resultado + fecha/hora por fila + "próxima acción".

**Why:** en sesiones largas el contexto conversacional es el peor lugar para el estado — se diluye, se pierde en compactaciones y no sobrevive a `/clear` ni al cambio de máquina. El archivo sí. Origen: sesión de benchmarking de ~11 hs (2026-06) donde la matriz combinación×prueba se perdió y costó ~8 turnos reconstruirla.

**How to apply:**

1. Actualizar el archivo **antes** de reportar cada resultado en el chat — el archivo es la fuente de verdad; el chat, el comentario.
2. Ubicación: si la exploración responde a un plan, sección `## Estado` dentro del plan; si es ad-hoc, `conocimiento/<tema>/estado.md` (al cerrar, destilar a conocimiento o borrar).
3. Al retomar (nueva sesión, otra máquina, post-`/clear`): leer el archivo antes que nada.

Relacionado: [[flujo-planes]].
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

## §Planes — `.claude/planes/`

Semilla de `.claude/planes/ESTADOS.md` (fuente de verdad de los estados; la lee el lint):

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

Semilla de `.claude/planes/PLANES.md`:

```markdown
# Registro de planes

Lo fino de cada plan vive acá, no en el nombre del archivo. Las carpetas dan el ciclo grueso: `pendientes/` (planes vivos: `Nuevo`, `En curso`, `Diferido`), `ejecutados/`, `descartados/` (con motivo).

Los **estados** y su semántica (a qué carpeta mapea cada uno, cuáles son terminales) están definidos en [`ESTADOS.md`](ESTADOS.md) — fuente de verdad configurable, que el lint lee.

- **Plan** — link al archivo en su carpeta actual.
- **Estado** — uno de los definidos en `ESTADOS.md`: `Nuevo`, `En curso`, `Diferido` (vivos, en `pendientes/`), `Ejecutado`, `Descartado` (terminales).
- **Creado / Cerrado** — `AA-MM-DD`; Cerrado en `—` mientras esté vivo.
- **Origen** — plan del que se desprendió, si aplica.
- **Notas** — corto; en descartados, el motivo es obligatorio.

| Plan | Estado | Creado | Cerrado | Origen | Notas |
|------|--------|--------|---------|--------|-------|
```

Sección de `.claude/CLAUDE.md` — "Planes del proyecto":

```markdown
## Planes del proyecto

Los planes se persisten en [`planes/`](planes/): `pendientes/` (planes vivos: `Nuevo`, `En curso`, `Diferido`), `ejecutados/` y `descartados/` (registro, con motivo). Nombre = slug estable sin fecha; estado y fechas viven en el registro [`planes/PLANES.md`](planes/PLANES.md), y los estados disponibles (con su carpeta y si son terminales) en [`planes/ESTADOS.md`](planes/ESTADOS.md) — configurable, que el lint lee. Ciclo completo en la memoria [`feedback_flujo_planes.md`](memoria/feedback_flujo_planes.md). Al cerrar una tarea que tocó planes, correr el lint **desde la raíz del repo**:

​```bash
node .claude/scripts/lint-planes/lint-planes.js
​```
```

Hook (merge sin pisar hooks existentes en `.claude/settings.json`; con `--quiet` solo imprime si hay hallazgos — es el trigger mecánico del ciclo):

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/scripts/lint-planes/lint-planes.js --quiet"
          }
        ]
      }
    ]
  }
}
```

`.claude/scripts/lint-planes/README.md`:

```markdown
# lint-planes

**Qué hace:** lint del ciclo de planes — lee los estados de `planes/ESTADOS.md` (data-driven) y valida: coherencia estado↔carpeta y carpeta↔registro (PLANES.md), planes sueltos, estados inválidos (fuera de ESTADOS.md), pendientes ya resueltos sin mover, cierres a medias (sin fecha, sin motivo, sin notas de implementación) y activos (`En curso`) envejecidos. Sin LLM, sin red.
**Cómo se corre:** `node .claude/scripts/lint-planes/lint-planes.js` (desde la raíz del repo). Flags: `--quiet` (solo imprime si hay hallazgos; usado por el hook), `--dias N` (umbral de envejecimiento, default 30).
**Estado:** vigente.
**Referenciado por:** hook `SessionStart` en `.claude/settings.json` — actualizar el hook si se mueve.
**Dependencias:** Node.js (sin libs externas).
**Origen (opcional):** funcionalidad `gestion-de-planes` del harness.
```

## §Script — `.claude/scripts/lint-planes/lint-planes.js`

Contenido exacto (Node, sin dependencias, sin red):

```js
#!/usr/bin/env node
// Lint del ciclo de planes: carpeta<->registro, sueltos, resueltos sin mover, cierres a medias, activos envejecidos. Sin LLM, sin red.
// Estados y su mapeo (carpeta, terminal) se leen de ESTADOS.md: fuente de verdad configurable, no hardcodeada.
// Uso: node lint-planes.js [<carpeta>] [--quiet] [--dias N]   (default: .claude/planes, N=30)
const fs = require('fs'), path = require('path');
const args = process.argv.slice(2);
const quiet = args.includes('--quiet');
const diasIdx = args.indexOf('--dias');
const MAX_DIAS = diasIdx >= 0 ? parseInt(args[diasIdx + 1], 10) : 30;
const root = path.resolve(args.find(a => !a.startsWith('--') && !/^\d+$/.test(a)) || '.claude/planes');

// Estado(s) cuya antiguedad se vigila: el plan se esta ejecutando hace demasiado y quedo frenado.
// Si se renombra el estado activo en ESTADOS.md, ajustar esta lista (en minusculas).
const VIGILAR_ANTIGUEDAD = ['en curso'];

// --- ESTADOS.md: nombre -> {nombre, carpeta, terminal} ---
const estPath = path.join(root, 'ESTADOS.md');
const estTxt = fs.existsSync(estPath) ? fs.readFileSync(estPath, 'utf8') : '';
const estados = new Map();
for (const line of estTxt.split('\n')) {
  const t = line.trim();
  if (!t.startsWith('|')) continue;
  const cells = t.split('|').slice(1, -1).map(c => c.trim());
  if (cells.length < 4) continue;
  const nombre = cells[0];
  const c0 = nombre.replace(/[*\s]/g, '');
  if (/^:?-{2,}:?$/.test(c0) || /^estado$/i.test(c0)) continue;
  const carpeta = cells[2].replace(/[`/\\]/g, '').trim();
  const terminal = /^s[ií]$/i.test(cells[3].trim());
  estados.set(nombre.toLowerCase(), { nombre, carpeta, terminal });
}
// Fallback si no hay ESTADOS.md (repo a medio configurar): convencion clasica de carpetas.
const CARPETAS = estados.size
  ? [...new Set([...estados.values()].map(e => e.carpeta))]
  : ['pendientes', 'ejecutados', 'descartados'];
const carpetaDeEstado = e => (estados.get(e) || {}).carpeta;
const esTerminal = e => !!(estados.get(e) || {}).terminal;

const regPath = path.join(root, 'PLANES.md');
const reg = fs.existsSync(regPath) ? fs.readFileSync(regPath, 'utf8') : '';

// filas: | Plan | Estado | Creado | Cerrado | Origen | Notas |
const rows = [];
for (const line of reg.split('\n')) {
  const t = line.trim();
  if (!t.startsWith('|')) continue;
  const cells = t.split('|').slice(1, -1).map(c => c.trim());
  if (cells.length < 6) continue;
  const c0 = cells[0].replace(/[*\s]/g, '');
  if (/^:?-{2,}:?$/.test(c0) || /^plan$/i.test(c0)) continue;
  const m = /\]\(([^)]+?)\)/.exec(cells[0]);
  const ref = (m ? m[1] : cells[0].replace(/[`\[\]]/g, '')).trim();
  rows.push({ ref, estado: cells[1].toLowerCase(), creado: cells[2],
              cerrado: cells[3], origen: cells[4], notas: cells[5] });
}

const enDisco = new Map(); // rel -> carpeta
for (const c of CARPETAS) {
  const dir = path.join(root, c);
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir)) if (f.endsWith('.md')) enDisco.set(c + '/' + f, c);
}

const sueltos = fs.existsSync(root)
  ? fs.readdirSync(root, { withFileTypes: true })
      .filter(e => e.isFile() && e.name.endsWith('.md') && !['PLANES.md', 'ESTADOS.md'].includes(e.name)).map(e => e.name)
  : [];

const norm = r => r.replace(/\\/g, '/').replace(/^\.\//, '');
const refs = new Set(rows.map(r => norm(r.ref)));
const sinFila = [...enDisco.keys()].filter(k => !refs.has(k));
const colgadas = [], estadoInvalido = [], estadoCarpeta = [], cierreAMedias = [], sinMotivo = [];
for (const r of rows) {
  const rel = norm(r.ref), carpeta = enDisco.get(rel);
  if (!estados.size) break;                       // sin ESTADOS.md no se valida el estado
  if (!estados.has(r.estado)) { estadoInvalido.push([rel, r.estado]); continue; }
  if (!carpeta) { colgadas.push(rel); continue; }
  const esperada = carpetaDeEstado(r.estado);
  if (esperada && carpeta !== esperada) estadoCarpeta.push([rel, r.estado, carpeta, esperada]);
  if (esTerminal(r.estado) && (!r.cerrado || r.cerrado === '—' || r.cerrado === '-')) cierreAMedias.push([rel, 'sin fecha Cerrado']);
  // Motivo obligatorio en la carpeta de descarte (convencion de carpetas del harness).
  if (carpeta === 'descartados' && (!r.notas || r.notas === '—' || r.notas === '-')) sinMotivo.push(rel);
}
// filas colgadas (archivo no existe) para estados validos que no aparecieron en disco
for (const r of rows) {
  const rel = norm(r.ref);
  if (estados.size && estados.has(r.estado) && !enDisco.has(rel) && !colgadas.includes(rel)) colgadas.push(rel);
}

// contenido: pendientes con marcador de resolucion; ejecutados sin notas de implementacion
const resueltosSinMover = [], ejecSinNotas = [];
for (const [rel, carpeta] of enDisco) {
  const txt = fs.readFileSync(path.join(root, rel), 'utf8');
  if (carpeta === 'pendientes' && (/\bRESUELTO\b/.test(txt) || /##\s*Notas de implementación/i.test(txt))) resueltosSinMover.push(rel);
  if (carpeta === 'ejecutados' && !/## Notas de implementación/i.test(txt)) ejecSinNotas.push(rel);
}

// activos envejecidos (estado vigilado, p. ej. "En curso", con Creado viejo)
const viejos = [];
const hoy = Date.now();
for (const r of rows) {
  if (!VIGILAR_ANTIGUEDAD.includes(r.estado)) continue;
  const m = /^(\d{2})-(\d{2})-(\d{2})$/.exec(r.creado);
  if (!m) continue;
  const dias = Math.floor((hoy - Date.parse(`20${m[1]}-${m[2]}-${m[3]}`)) / 86400000);
  if (dias > MAX_DIAS) viejos.push([norm(r.ref), dias]);
}

const secciones = [
  ['ESTADOS.md AUSENTE O VACIO (no se valida el estado)', estados.size ? [] : [estPath]],
  ['SUELTOS EN LA RAIZ (mover a una carpeta del ciclo)', sueltos],
  ['ARCHIVOS SIN FILA EN PLANES.md', sinFila],
  ['FILAS COLGADAS (archivo no existe)', colgadas],
  ['ESTADO INVALIDO (no esta en ESTADOS.md)', estadoInvalido.map(([r, e]) => `${r}  estado="${e}"`)],
  ['ESTADO vs CARPETA INCONSISTENTE', estadoCarpeta.map(([r, e, c, esp]) => `${r}  estado="${e}" en ${c}/ (deberia ir en ${esp}/)`)],
  ['PENDIENTES CON MARCADOR DE RESUELTO (¿mover a ejecutados?)', resueltosSinMover],
  ['CIERRES A MEDIAS', cierreAMedias.map(([r, w]) => `${r}  [${w}]`)],
  ['DESCARTADOS SIN MOTIVO', sinMotivo],
  ['EJECUTADOS SIN "## Notas de implementación"', ejecSinNotas],
  [`ACTIVOS ENVEJECIDOS (> ${MAX_DIAS} dias en curso: ¿sigue/diferido/descartado?)`, viejos.map(([r, d]) => `${r}  (${d} dias)`)],
];
const total = secciones.reduce((n, [, items]) => n + items.length, 0);
if (quiet && total === 0) process.exit(0);
console.log(`== LINT PLANES: ${root} ==`);
console.log(`estados definidos: ${estados.size} | filas en registro: ${rows.length} | archivos en ciclo: ${enDisco.size} | hallazgos: ${total}\n`);
for (const [titulo, items] of secciones) {
  if (quiet && !items.length) continue;
  console.log(`[${titulo}] (${items.length})`);
  items.forEach(i => console.log(`    ${i}`));
  if (!quiet && !items.length) console.log('    (ninguno)');
}
```

## §Glosario — `.claude/glosario/`

Semilla de `.claude/glosario/INDICE.md` (tabla vacía — sin filas de ejemplo, para que el lint no las tome como conceptos reales):

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

Memoria `.claude/memoria/feedback_glosario.md`:

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
4. **Al cerrar** una tarea que tocó el glosario, correr el lint: `node .claude/scripts/lint-glosario/lint-glosario.js` (links de detalle resuelven, páginas sin huérfanos, alias sin colisión).

Relacionado: [[flujo-planes]] (consultar el glosario al planificar/analizar).
```

Sección de `.claude/CLAUDE.md` — "Glosario del proyecto":

```markdown
## Glosario del proyecto

La terminología del dominio vive en [`glosario/INDICE.md`](glosario/INDICE.md): una tabla de conceptos (nombre canónico, definición, alias registrados, y link a página de detalle si el concepto es complejo). Los alias se **registran, no se prohíben**. **Consultarlo al planificar y analizar.** Al cerrar una tarea que tocó el glosario, correr el lint **desde la raíz del repo**:

​```bash
node .claude/scripts/lint-glosario/lint-glosario.js
​```

Detalle de la convención en la memoria [`feedback_glosario.md`](memoria/feedback_glosario.md).
```

Lint `.claude/scripts/lint-glosario/lint-glosario.js` (Node, sin dependencias, sin red):

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

## §Decisiones — `.claude/decisiones/`

Semilla de `.claude/decisiones/INDICE.md` (tabla vacía — sin filas de ejemplo):

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

Formato de una página de detalle `.claude/decisiones/NNNN-slug.md` (solo decisiones complejas):

```markdown
# NNNN — Título corto de la decisión

**Fecha:** AAAA-MM-DD · **Estado:** vigente

Contexto: qué problema o situación la motivó.
Decisión: qué se decidió.
Alternativas: cuáles se consideraron y por qué se eligió esta.
Consecuencias: efectos no obvios (solo si los hay).
```

Memoria `.claude/memoria/feedback_decisiones.md`:

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
4. **Al cerrar** una tarea que registró decisiones, correr el lint: `node .claude/scripts/lint-decisiones/lint-decisiones.js` (numeración, links de detalle, huérfanos, superseded).

Relacionado: [[flujo-planes]] (consultar/registrar decisiones al cerrar planes).
```

Sección de `.claude/CLAUDE.md` — "Decisiones del proyecto":

```markdown
## Decisiones del proyecto

Las decisiones **estructurales al propósito del repo** (no las operativas triviales) se asientan en [`decisiones/INDICE.md`](decisiones/INDICE.md): una tabla donde cada fila es una decisión (N°, qué + por qué, fecha, estado, y link a detalle si requiere conceptualización mayor). Misma estructura que el glosario. **Consultarlas al planificar y analizar** para no re-decidir ni contradecir. Al cerrar una tarea que registró decisiones, correr el lint **desde la raíz del repo**:

​```bash
node .claude/scripts/lint-decisiones/lint-decisiones.js
​```

Detalle de la convención en la memoria [`feedback_decisiones.md`](memoria/feedback_decisiones.md).
```

Lint `.claude/scripts/lint-decisiones/lint-decisiones.js` (Node, sin dependencias, sin red):

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

## §Scripts — `.claude/scripts/`

Semilla de `.claude/scripts/INDICE.md` (tabla vacía — sin filas de ejemplo):

```markdown
# Scripts del proyecto

Registro de las herramientas del repo. Cada script vive en su carpeta `<tool>/` con un `README.md` (su ficha); nunca suelto. Una fila por tool. Ordena el "cementerio de scripts": qué es cada uno, cómo se corre, si sigue vigente.

- **Tool** — link a la carpeta `<tool>/` (adentro, el README y el código).
- **Qué hace** — una línea.
- **Cómo se corre** — el comando de invocación.
- **Estado** — `vigente`, `experimental` u `obsoleto` (los obsoletos se pueden depurar).

| Tool | Qué hace | Cómo se corre | Estado |
|------|----------|---------------|--------|
```

Plantilla de la ficha `.claude/scripts/<tool>/README.md`:

```markdown
# <tool>

**Qué hace:** <una o dos frases>.
**Cómo se corre:** `<comando>` <args si los hay>.
**Estado:** vigente | experimental | obsoleto.
**Referenciado por:** <settings.local.json / .gitignore / hook / otro script / nadie> — quién lo invoca por ruta.
**Dependencias:** <runtime, libs, credenciales que necesita>.
**Origen (opcional):** <qué necesidad, plan o decisión lo generó — solo si aporta>.
**Notas (opcional):** <lo que haga falta>.
```

Memoria `.claude/memoria/feedback_scripts.md`:

```markdown
---
name: scripts
description: Convención de scripts del repo — cada tool en .claude/scripts/<tool>/ con README; registro tabla en INDICE.md; lint; cuidado con refs por ruta en settings/.gitignore/hooks.
metadata:
  type: feedback
---

Las herramientas/scripts del repo viven en `.claude/scripts/<tool>/`: cada script en su propia carpeta (nunca suelto), con un `README.md` que dice qué hace, cómo se corre y qué lo referencia. El registro `.claude/scripts/INDICE.md` es una tabla (Tool | Qué hace | Cómo se corre | Estado) que los lista a todos.

**Why:** que la carpeta de scripts no se vuelva un cementerio de archivos sin saber qué son, de dónde salieron ni cómo se usan. Ubicación determinística + registro escaneável + ficha por tool.

**How to apply:**

1. Todo script nuevo va en `.claude/scripts/<tool>/` con su `README.md`. Nunca suelto en `scripts/`.
2. Registrarlo en `.claude/scripts/INDICE.md` (una fila). Marcar `Estado`; los `obsoleto` se pueden depurar.
3. ⚠️ **Refs por ruta:** un script referenciado por ruta en `settings.local.json`/`settings.json` (regla de permiso), en `.gitignore` o en un hook NO se mueve/renombra alegremente — rompe el match por prefijo exacto y se pierde la pre-autorización (en headless, denegación directa). Antes de mover, grep su ruta; si aparece, actualizar la referencia en el mismo paso. Anotar quién lo referencia en el README del tool.
4. **Al cerrar** una tarea que tocó scripts, correr el lint: `node .claude/scripts/lint-scripts/lint-scripts.js` (README por tool, registro completo, filas colgadas, refs por ruta en settings).

Otras memorias, planes o conocimiento pueden referenciar un tool por su ruta explicando cómo usarlo en su contexto.

Relacionado: [[flujo-planes]], [[base-conocimiento]].
```

Sección de `.claude/CLAUDE.md` — "Scripts del proyecto":

```markdown
## Scripts del proyecto

Las herramientas del repo viven en [`scripts/`](scripts/): cada script en su carpeta `<tool>/` con un `README.md`, listadas en el registro [`scripts/INDICE.md`](scripts/INDICE.md) (tabla Tool | Qué hace | Cómo se corre | Estado). Nunca sueltos. ⚠️ Un script referenciado por ruta en `settings`, `.gitignore` o un hook no se mueve sin actualizar esa referencia (rompe el match por prefijo). Al cerrar una tarea que tocó scripts, correr el lint **desde la raíz del repo**:

​```bash
node .claude/scripts/lint-scripts/lint-scripts.js
​```

Detalle de la convención en la memoria [`feedback_scripts.md`](memoria/feedback_scripts.md).
```

Lint `.claude/scripts/lint-scripts/lint-scripts.js` (Node, sin dependencias, sin red):

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

## §Script — lint-memoria — `.claude/scripts/lint-memoria/lint-memoria.js`

Contenido exacto (Node, sin dependencias, sin red):

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

## §Script — lint-preferencias — `.claude/scripts/lint-preferencias/lint-preferencias.js`

Contenido exacto (Node, sin dependencias, sin red):

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
