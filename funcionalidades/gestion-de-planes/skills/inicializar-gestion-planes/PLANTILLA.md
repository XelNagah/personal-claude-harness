# Plantilla de gestión de planes

Textos verbatim que esta skill escribe. (El formato general de una memoria está definido por la funcionalidad `memoria-local`.)

## §Memoria — `.claude/memory/feedback_flujo_planes.md`

```markdown
---
name: flujo-planes
description: "Cómo gestionar planes — .claude/planes/ (pendientes/ejecutados/descartados), registro PLANES.md con prioridad y fechas, slug estable, lint al cerrar"
metadata:
  type: feedback
---

Persistir y gestionar planes bajo `.claude/planes/` con tres subcarpetas: `pendientes/` (backlog amplio — planes en foco y estacionados conviven), `ejecutados/` y `descartados/` (registro, siempre con motivo). Lo fino (prioridad, estado, fechas, origen) vive en el registro `planes/PLANES.md`, no en el nombre del archivo.

**Why:** trazabilidad de qué se planificó, cuándo se creó y cuándo y cómo se cerró — sin depender de archivos efímeros de plan-mode del harness, y sin mirar carpetas a ojo: el registro es la vista, y está siempre en contexto vía el Mapa del repo.

**How to apply:**

1. **Al cerrar un plan** (listo para ejecutar, post-ExitPlanMode o equivalente): copiar a `.claude/planes/pendientes/<slug-estable>.md` (sin fecha en el nombre) y agregar su fila en `PLANES.md`: Prioridad (`foco`/`estacionado`), Estado, Creado, Origen si se desprende de otro plan.
2. **Cada actualización al plan** se replica en la versión persistida — es la fuente de verdad, no el archivo del plans-folder del harness. Cambios de prioridad/estado se reflejan en `PLANES.md`.
3. **Al detectar evidencia de implementación** (commit, mensaje del user, código verificado, otro agente): mover a `ejecutados/` **sin renombrar**, completar `Cerrado` en el registro y agregar sección **`## Notas de implementación`** (cómo se implementó vs planificado, hash de commit, cosas notables).
4. **Descartar es un cierre válido:** mover a `descartados/`, completar `Cerrado` y una línea de motivo en Notas (p. ej. "superseded por <plan>").
5. **Reparar referencias entrantes** si las hubiera (el slug estable minimiza esto; preferir linkear planes vía `PLANES.md`).
6. **Al cerrar** una tarea que tocó planes, correr el lint: `node .claude/scripts/lint-planes/lint-planes.js`.

Importante: borrar el archivo de `pendientes/` al moverlo — no duplicar. Un plan puede persistirse **antes** de estar cerrado (p. ej. para cortar una sesión larga de diseño): Estado "en diseño" en el registro y bloque al tope con los pendientes para retomar.

Relacionado: [[artefacto-estado]] (estado vivo de una exploración dentro del plan).
```

## §Memoria — `.claude/memory/feedback_artefacto_estado.md`

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

## §Semilla — `.claude/planes/PLANES.md`

```markdown
# Registro de planes

Lo fino de cada plan vive acá, no en el nombre del archivo. Las carpetas dan el ciclo grueso: `pendientes/` (backlog amplio: foco + estacionado), `ejecutados/`, `descartados/` (con motivo).

- **Plan** — link al archivo en su carpeta actual.
- **Prioridad** — `foco` (comprometido) o `estacionado` (surgió de otra planificación; guardado para no perderlo).
- **Estado** — libre en pendientes (`idea`, `en diseño`, `listo`, `en ejecución`); `ejecutado` o `descartado` al cerrar.
- **Creado / Cerrado** — `AA-MM-DD`; Cerrado en `—` mientras esté vivo.
- **Origen** — plan del que se desprendió, si aplica.
- **Notas** — corto; en descartados, el motivo es obligatorio.

| Plan | Prioridad | Estado | Creado | Cerrado | Origen | Notas |
|------|-----------|--------|--------|---------|--------|-------|
```

## §Sección de `.claude/CLAUDE.md` — "Planes del proyecto"

```markdown
## Planes del proyecto

Los planes se persisten en [`planes/`](planes/): `pendientes/` (backlog amplio — foco y estacionados), `ejecutados/` y `descartados/` (registro, con motivo). Nombre = slug estable sin fecha; prioridad, estado y fechas viven en el registro [`planes/PLANES.md`](planes/PLANES.md). Ciclo completo en la memoria [`feedback_flujo_planes.md`](memory/feedback_flujo_planes.md). Al cerrar una tarea que tocó planes, correr el lint **desde la raíz del repo**:

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
// Lint del ciclo de planes: carpeta<->registro, sueltos, resueltos sin mover, cierres a medias, focos envejecidos. Sin LLM, sin red.
// Uso: node lint-planes.js [<carpeta>] [--quiet] [--dias N]   (default: .claude/planes, N=30)
const fs = require('fs'), path = require('path');
const args = process.argv.slice(2);
const quiet = args.includes('--quiet');
const diasIdx = args.indexOf('--dias');
const MAX_DIAS = diasIdx >= 0 ? parseInt(args[diasIdx + 1], 10) : 30;
const root = path.resolve(args.find(a => !a.startsWith('--') && !/^\d+$/.test(a)) || '.claude/planes');
const CARPETAS = ['pendientes', 'ejecutados', 'descartados'];
const regPath = path.join(root, 'PLANES.md');
const reg = fs.existsSync(regPath) ? fs.readFileSync(regPath, 'utf8') : '';

// filas: | Plan | Prioridad | Estado | Creado | Cerrado | Origen | Notas |
const rows = [];
for (const line of reg.split('\n')) {
  const t = line.trim();
  if (!t.startsWith('|')) continue;
  const cells = t.split('|').slice(1, -1).map(c => c.trim());
  if (cells.length < 7) continue;
  const c0 = cells[0].replace(/[*\s]/g, '');
  if (/^:?-{2,}:?$/.test(c0) || /^plan$/i.test(c0)) continue;
  const m = /\]\(([^)]+?)\)/.exec(cells[0]);
  const ref = (m ? m[1] : cells[0].replace(/[`\[\]]/g, '')).trim();
  rows.push({ ref, prioridad: cells[1].toLowerCase(), estado: cells[2].toLowerCase(),
              creado: cells[3], cerrado: cells[4], notas: cells[6] });
}

const enDisco = new Map(); // rel -> carpeta
for (const c of CARPETAS) {
  const dir = path.join(root, c);
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir)) if (f.endsWith('.md')) enDisco.set(c + '/' + f, c);
}

const sueltos = fs.existsSync(root)
  ? fs.readdirSync(root, { withFileTypes: true })
      .filter(e => e.isFile() && e.name.endsWith('.md') && e.name !== 'PLANES.md').map(e => e.name)
  : [];

const norm = r => r.replace(/\\/g, '/').replace(/^\.\//, '');
const refs = new Set(rows.map(r => norm(r.ref)));
const sinFila = [...enDisco.keys()].filter(k => !refs.has(k));
const colgadas = [], estadoCarpeta = [], cierreAMedias = [], sinMotivo = [];
for (const r of rows) {
  const rel = norm(r.ref), carpeta = enDisco.get(rel);
  if (!carpeta) { colgadas.push(rel); continue; }
  const esEjec = /ejecutado/.test(r.estado), esDesc = /descartado|superseded/.test(r.estado);
  if (carpeta === 'ejecutados' && !esEjec) estadoCarpeta.push([rel, r.estado, carpeta]);
  if (carpeta === 'descartados' && !esDesc) estadoCarpeta.push([rel, r.estado, carpeta]);
  if (carpeta === 'pendientes' && (esEjec || esDesc)) estadoCarpeta.push([rel, r.estado, carpeta]);
  if (carpeta !== 'pendientes' && (!r.cerrado || r.cerrado === '—' || r.cerrado === '-')) cierreAMedias.push([rel, 'sin fecha Cerrado']);
  if (carpeta === 'descartados' && (!r.notas || r.notas === '—' || r.notas === '-')) sinMotivo.push(rel);
}

// contenido: pendientes con marcador de resolucion; ejecutados sin notas de implementacion
const resueltosSinMover = [], ejecSinNotas = [];
for (const [rel, carpeta] of enDisco) {
  const txt = fs.readFileSync(path.join(root, rel), 'utf8');
  if (carpeta === 'pendientes' && /(✅|RESUELTO|## Notas de implementación)/i.test(txt)) resueltosSinMover.push(rel);
  if (carpeta === 'ejecutados' && !/## Notas de implementación/i.test(txt)) ejecSinNotas.push(rel);
}

// focos envejecidos (solo pendientes con prioridad foco)
const viejos = [];
const hoy = Date.now();
for (const r of rows) {
  if (enDisco.get(norm(r.ref)) !== 'pendientes' || !/foco/.test(r.prioridad)) continue;
  const m = /^(\d{2})-(\d{2})-(\d{2})$/.exec(r.creado);
  if (!m) continue;
  const dias = Math.floor((hoy - Date.parse(`20${m[1]}-${m[2]}-${m[3]}`)) / 86400000);
  if (dias > MAX_DIAS) viejos.push([norm(r.ref), dias]);
}

const secciones = [
  ['SUELTOS EN LA RAIZ (mover a una carpeta del ciclo)', sueltos],
  ['ARCHIVOS SIN FILA EN PLANES.md', sinFila],
  ['FILAS COLGADAS (archivo no existe)', colgadas],
  ['ESTADO vs CARPETA INCONSISTENTE', estadoCarpeta.map(([r, e, c]) => `${r}  estado="${e}" en ${c}/`)],
  ['PENDIENTES CON MARCADOR DE RESUELTO (¿mover a ejecutados?)', resueltosSinMover],
  ['CIERRES A MEDIAS', cierreAMedias.map(([r, w]) => `${r}  [${w}]`)],
  ['DESCARTADOS SIN MOTIVO', sinMotivo],
  ['EJECUTADOS SIN "## Notas de implementación"', ejecSinNotas],
  [`FOCOS ENVEJECIDOS (> ${MAX_DIAS} dias: ¿sigue/estacionado/descartado?)`, viejos.map(([r, d]) => `${r}  (${d} dias)`)],
];
const total = secciones.reduce((n, [, items]) => n + items.length, 0);
if (quiet && total === 0) process.exit(0);
console.log(`== LINT PLANES: ${root} ==`);
console.log(`filas en registro: ${rows.length} | archivos en ciclo: ${enDisco.size} | hallazgos: ${total}\n`);
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

**Qué hace:** lint del ciclo de planes — coherencia carpeta↔registro (PLANES.md), planes sueltos, pendientes ya resueltos sin mover, cierres a medias (sin fecha, sin motivo, sin notas de implementación) y focos envejecidos. Sin LLM, sin red.
**Cómo se corre:** `node .claude/scripts/lint-planes/lint-planes.js` (desde la raíz del repo). Flags: `--quiet` (solo imprime si hay hallazgos; usado por el hook), `--dias N` (umbral de envejecimiento, default 30).
**Estado:** vigente.
**Referenciado por:** hook `SessionStart` en `.claude/settings.json` — actualizar el hook si se mueve.
**Dependencias:** Node.js (sin libs externas).
**Origen (opcional):** funcionalidad `gestion-de-planes` del harness (análisis de uso 2026-07: los ciclos manuales de planes no se sostenían solos).
```
