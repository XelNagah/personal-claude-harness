# Plantilla de la memoria del flujo de planes

Copiar **verbatim** como `.claude/memory/feedback_flujo_planes.md` y registrar en `MEMORY.md`. (El formato general de una memoria está definido por la funcionalidad `memoria-local`.)

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
