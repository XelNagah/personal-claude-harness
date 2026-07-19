# Prompt: inicializar gestión de planes

> **Uso:** pegar todo lo que sigue (desde la línea horizontal) a un agente de código parado en la raíz del proyecto.
>
> **Depende de la memoria local.** Si todavía no configuraste el sistema de memoria, pegá antes el prompt de `memoria-local`.

---

Configurá en este proyecto la gestión de planes persistida, usando el directorio de configuración **nativo de tu harness** (`.claude/`, `.codex/`, `.cursor/`, `.github/`, o `.agent/` si no hay convención). En lo que sigue, `<config>/` es ese directorio. Si parte ya existe, **extendé sin pisar**.

## Reconciliación (idempotencia)

Este prompt es seguro de re-correr: sirve para **"levelear"** repos que ya tienen algunas partes. Aplicá a cada paso que escribe:

- **Inspeccioná antes de escribir.** Leé primero el archivo/carpeta destino. Nunca reescribas de cuajo un archivo existente.
- **Creá solo lo ausente.** No existe → crear. Existe → agregar únicamente lo que falte, preservando el resto tal cual.
- **Detectá equivalentes.** Buscá por tema, no solo por nombre exacto. Igual → no tocar. Distinto → **no pises**: reportá la divergencia y preguntame antes de reconciliar.
- **Reportá al final** en tres baldes: `agregado` (faltaba), `ya estaba` (ok), `divergente` (existe distinto, requiere tu decisión).

## 1. Migración desde el esquema viejo (si aplica)

Dos migraciones posibles, ambas idempotentes; aplicá las que correspondan:

**(a) Dos carpetas → tres.** Si existen `<config>/planes/planes-pendientes/` / `planes-ejecutados/`: renombralas a `pendientes/` y `ejecutados/`, creá `descartados/`, y mové los `.md` sueltos de la raíz de `planes/` a `pendientes/` (marcalos `Diferido` en el registro del paso 2). ⚠️ Antes, grep `planes-pendientes|planes-ejecutados` en instrucciones, memorias, planes, settings y hooks — actualizá esas referencias en el mismo paso y reportame las de settings (pueden vivir fuera del repo).

**(b) Dos ejes → un eje.** Si el registro `PLANES.md` tiene una columna `Prioridad` (`foco`/`estacionado`) además de un `Estado` con los valores viejos (`idea`, `en diseño`, `listo`, `en ejecución`): pasalo a la máquina de **un solo eje**. Quitá la columna `Prioridad` y remapeá cada fila a un único `Estado`: `estacionado`/`idea`/`en diseño`/`listo` → `Diferido`; `en ejecución` → `En curso`; las filas ya cerradas conservan `Ejecutado`/`Descartado`. Sembrá `<config>/planes/ESTADOS.md` (paso 2) si falta. Los términos viejos se **barren, no se registran como alias**.

## 2. Carpetas, estados y registro

Asegurá `<config>/planes/pendientes/` (planes vivos: `Nuevo`, `En curso`, `Diferido`), `ejecutados/` y `descartados/` (con `.gitkeep` si el repo usa git). Asegurá `<config>/planes/ESTADOS.md` (fuente de verdad de los estados; contenido al final) y el registro `<config>/planes/PLANES.md`:

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

Una fila por plan existente (Estado de `ESTADOS.md`; Creado desde la fecha del nombre viejo si la tenía; en ejecutados, Cerrado = fecha del nombre). Los planes nuevos usan **slug estable sin fecha** — las fechas viven en el registro.

## 3. Memoria del flujo

Asegurá la memoria `feedback_flujo_planes.md` (contenido al final) bajo `<config>/memoria/` y su línea en `MEMORIA.md`. Si la versión vieja del flujo (dos carpetas, fecha en el nombre) está instalada, reemplazala por esta — es la misma convención actualizada; reportá el reemplazo. Asegurá también `feedback_artefacto_estado.md` (al final).

## 4. Referencia en las instrucciones del proyecto

En el archivo de instrucciones de tu harness, asegurá una sección **"Planes del proyecto"** con el modelo (carpetas = ciclo grueso, registro = estado/fechas, `ESTADOS.md` = juego de estados configurable) y un puntero a la memoria del flujo. Si existe un bloque de imports/mapa que tu harness cargue siempre, sumá el registro `PLANES.md` ahí.

## 5. Chequeo mecánico al abrir sesión

Si tu harness soporta hooks de inicio de sesión, configurá uno que corra un chequeo del ciclo al abrir: archivos sueltos en `planes/`, pendientes con marcadores de resuelto (`✅`/`RESUELTO`), inconsistencias estado↔carpeta, estados inválidos (fuera de `ESTADOS.md`), planes `En curso` envejecidos. Sin este trigger, mover planes depende de acordarse — y no se sostiene. (En Claude Code: hook `SessionStart` + el script `lint-planes` de la funcionalidad completa.)

## 6. Reporte

Reportá en los tres baldes (`agregado` / `ya estaba` / `divergente`). No hagas commit salvo que te lo pida.

---

## Contenido de `ESTADOS.md`

Fuente de verdad de los estados (paso 2). El lint lo lee: cambiar el juego de estados = editar esta tabla, no el código.

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

## Contenido de las memorias

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

**Why:** en sesiones largas el contexto conversacional es el peor lugar para el estado — se diluye, se pierde en compactaciones y no sobrevive a limpiezas de contexto ni al cambio de máquina. El archivo sí.

**How to apply:**

1. Actualizar el archivo **antes** de reportar cada resultado en el chat — el archivo es la fuente de verdad; el chat, el comentario.
2. Ubicación: si la exploración responde a un plan, sección `## Estado` dentro del plan; si es ad-hoc, en la base de conocimiento del repo (al cerrar, destilar o borrar).
3. Al retomar (nueva sesión, otra máquina, contexto limpio): leer el archivo antes que nada.
```

> Reemplazá `<config>` por el directorio real de tu harness en las memorias.
