# Migrar repos consumidores a los estados nuevos

**Estado:** Diferido.

## Objetivo

Los repos que ya instalaron el harness pueden tener su `PLANES.md` con la terminología vieja (`foco`, `estacionado`, estados de dos ejes). Barrerlos para mantener consistencia con la máquina de un solo eje (decisión 0005).

## Pendiente

- Enumerar los repos consumidores (varios proyectos bajo `~/.claude/projects/` y sus repos de trabajo).
- En cada uno: reescribir `PLANES.md` (quitar `Prioridad`, remapear estados), sembrar `ESTADOS.md`, actualizar el lint.
- Sin alias: **reemplazar** los términos viejos, no mapearlos.

**Origen:** Rediseño de estados de planes + renombre de memoria local.
