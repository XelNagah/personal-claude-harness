# Plantilla de gestión de planes

Textos verbatim que esta skill escribe. (El formato general de una memoria está definido por la funcionalidad `memoria-local`.)

## §Memoria — `.claude/memoria/feedback_flujo_planes.md`

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

## §Memoria — `.claude/memoria/feedback_artefacto_estado.md`

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

## §Estados — `.claude/planes/ESTADOS.md`

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

## §Semilla — `.claude/planes/PLANES.md`

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

## §Sección de `.claude/CLAUDE.md` — "Planes del proyecto"

```markdown
## Planes del proyecto

Los planes se persisten en [`planes/`](planes/): `pendientes/` (planes vivos: `Nuevo`, `En curso`, `Diferido`), `ejecutados/` y `descartados/` (registro, con motivo). Nombre = slug estable sin fecha; estado y fechas viven en el registro [`planes/PLANES.md`](planes/PLANES.md), y los estados disponibles (con su carpeta y si son terminales) en [`planes/ESTADOS.md`](planes/ESTADOS.md) — configurable, que el lint lee. Ciclo completo en la memoria [`feedback_flujo_planes.md`](memoria/feedback_flujo_planes.md). Al cerrar una tarea que tocó planes, correr el lint **desde la raíz del repo**:

​```bash
node .claude/scripts/lint-planes/lint-planes.js
​```
```

## §Hook — chequeo al abrir sesión

Merge (sin pisar hooks existentes) en `.claude/settings.json` del repo:

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

Con `--quiet` el lint solo imprime cuando hay hallazgos: sesión limpia = hook silencioso. Es el trigger mecánico del ciclo — sin él, mover planes vuelve a depender de acordarse.

## §Script — `.claude/scripts/lint-planes/lint-planes.js`

Contenido exacto (Node, sin dependencias, sin red). Si la funcionalidad `scripts` está instalada, registrarlo también en `scripts/INDICE.md` con su `README.md`.

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

## §README del tool — `.claude/scripts/lint-planes/README.md`

```markdown
# lint-planes

**Qué hace:** lint del ciclo de planes — lee los estados de `planes/ESTADOS.md` (data-driven) y valida: coherencia estado↔carpeta y carpeta↔registro (PLANES.md), planes sueltos, estados inválidos (fuera de ESTADOS.md), pendientes ya resueltos sin mover, cierres a medias (sin fecha, sin motivo, sin notas de implementación) y activos (`En curso`) envejecidos. Sin LLM, sin red.
**Cómo se corre:** `node .claude/scripts/lint-planes/lint-planes.js` (desde la raíz del repo). Flags: `--quiet` (solo imprime si hay hallazgos; usado por el hook), `--dias N` (umbral de envejecimiento, default 30).
**Estado:** vigente.
**Referenciado por:** hook `SessionStart` en `.claude/settings.json` — actualizar el hook si se mueve.
**Dependencias:** Node.js (sin libs externas).
**Origen (opcional):** funcionalidad `gestion-de-planes` del harness (análisis de uso 2026-07: los ciclos manuales de planes no se sostenían solos).
```
