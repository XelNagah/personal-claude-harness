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

Si existen `<config>/planes/planes-pendientes/` / `planes-ejecutados/`: renombralas a `pendientes/` y `ejecutados/`, creá `descartados/`, y mové los `.md` sueltos de la raíz de `planes/` a `pendientes/` (marcalos `estacionado` en el registro del paso 2). ⚠️ Antes, grep `planes-pendientes|planes-ejecutados` en instrucciones, memorias, planes, settings y hooks — actualizá esas referencias en el mismo paso y reportame las de settings (pueden vivir fuera del repo).

## 2. Carpetas y registro

Asegurá `<config>/planes/pendientes/` (backlog amplio: planes en foco y estacionados conviven), `ejecutados/` y `descartados/` (con `.gitkeep` si el repo usa git), más el registro `<config>/planes/PLANES.md`:

```markdown
# Registro de planes

Lo fino de cada plan vive acá, no en el nombre del archivo. Las carpetas dan el ciclo grueso: `pendientes/` (backlog amplio: foco + estacionado), `ejecutados/`, `descartados/` (con motivo).

| Plan | Prioridad | Estado | Creado | Cerrado | Origen | Notas |
|------|-----------|--------|--------|---------|--------|-------|
```

Una fila por plan existente (Prioridad `foco`/`estacionado`; Creado desde la fecha del nombre viejo si la tenía; en ejecutados, Cerrado = fecha del nombre). Los planes nuevos usan **slug estable sin fecha** — las fechas viven en el registro.

## 3. Memoria del flujo

Asegurá la memoria `feedback_flujo_planes.md` (contenido al final) bajo `<config>/memory/` y su línea en `MEMORY.md`. Si la versión vieja del flujo (dos carpetas, fecha en el nombre) está instalada, reemplazala por esta — es la misma convención actualizada; reportá el reemplazo. Asegurá también `feedback_artefacto_estado.md` (al final).

## 4. Referencia en las instrucciones del proyecto

En el archivo de instrucciones de tu harness, asegurá una sección **"Planes del proyecto"** con el modelo (carpetas = ciclo grueso, registro = prioridad/estado/fechas) y un puntero a la memoria del flujo. Si existe un bloque de imports/mapa que tu harness cargue siempre, sumá el registro `PLANES.md` ahí.

## 5. Chequeo mecánico al abrir sesión

Si tu harness soporta hooks de inicio de sesión, configurá uno que corra un chequeo del ciclo al abrir: archivos sueltos en `planes/`, pendientes con marcadores de resuelto (`✅`/`RESUELTO`), inconsistencias registro↔carpeta, planes en foco envejecidos. Sin este trigger, mover planes depende de acordarse — y no se sostiene. (En Claude Code: hook `SessionStart` + el script `lint-planes` de la funcionalidad completa.)

## 6. Reporte

Reportá en los tres baldes (`agregado` / `ya estaba` / `divergente`). No hagas commit salvo que te lo pida.

---

## Contenido de las memorias

### `feedback_flujo_planes.md`

```markdown
---
name: flujo-planes
description: "Cómo gestionar planes — <config>/planes/ (pendientes/ejecutados/descartados), registro PLANES.md con prioridad y fechas, slug estable"
metadata:
  type: feedback
---

Persistir y gestionar planes bajo `<config>/planes/` con tres subcarpetas: `pendientes/` (backlog amplio — planes en foco y estacionados conviven), `ejecutados/` y `descartados/` (registro, siempre con motivo). Lo fino (prioridad, estado, fechas, origen) vive en el registro `planes/PLANES.md`, no en el nombre del archivo.

**Why:** trazabilidad de qué se planificó, cuándo se creó y cuándo y cómo se cerró — sin depender de archivos efímeros del harness, y sin mirar carpetas a ojo: el registro es la vista.

**How to apply:**

1. **Al cerrar un plan** (listo para ejecutar): copiar a `<config>/planes/pendientes/<slug-estable>.md` (sin fecha en el nombre) y agregar su fila en `PLANES.md`: Prioridad (`foco`/`estacionado`), Estado, Creado, Origen si se desprende de otro plan.
2. **Cada actualización al plan** se replica en la versión persistida — es la fuente de verdad. Cambios de prioridad/estado se reflejan en `PLANES.md`.
3. **Al detectar evidencia de implementación** (commit, mensaje del user, código verificado, otro agente): mover a `ejecutados/` **sin renombrar**, completar `Cerrado` en el registro y agregar sección **`## Notas de implementación`** (cómo se implementó vs planificado, hash de commit, cosas notables).
4. **Descartar es un cierre válido:** mover a `descartados/`, completar `Cerrado` y una línea de motivo en Notas (p. ej. "superseded por <plan>").
5. **Reparar referencias entrantes** si las hubiera (el slug estable minimiza esto; preferir linkear planes vía `PLANES.md`).

Importante: borrar el archivo de `pendientes/` al moverlo — no duplicar. Un plan puede persistirse **antes** de estar cerrado (p. ej. para cortar una sesión larga de diseño): Estado "en diseño" en el registro y bloque al tope con los pendientes para retomar.
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
