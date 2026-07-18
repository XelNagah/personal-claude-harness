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
