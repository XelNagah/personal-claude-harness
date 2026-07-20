---
name: ciclo-de-plan
description: Mueve un plan por su ciclo de vida en .claude/planes/ — abrir (archivo con nombre estable + fila en PLANES.md) y transicionar (cambiar estado, mover de carpeta, completar fechas y notas, lint). Use when hay que persistir un plan nuevo ("guardá este plan"), retomarlo, marcarlo ejecutado/diferido/descartado, o al detectar evidencia de que un plan pendiente ya se implementó.
---

# Ciclo de un plan

Opera el ciclo de planes (`.claude/planes/`) sin dejar el registro y el disco desincronizados. Cada transición toca hasta 3 lugares coordinados: el **archivo** del plan (carpeta según estado), la **fila** en `PLANES.md` (estado, fechas, notas) y a veces el **encabezado** del propio plan. Esta skill hace los tres de una vez.

**Fuente de verdad de los estados: `planes/ESTADOS.md`** — leerlo antes de transicionar (define los estados disponibles, a qué carpeta mapea cada uno y cuáles son terminales; es configurable por repo — no asumir los nombres).

## Abrir un plan

1. Escribir el plan en `planes/pendientes/<nombre-estable>.md`. **Nombre estable**: sin fecha, sin paréntesis (rompen los links markdown), no cambia nunca aunque cambie el estado — el nombre del archivo es la identidad del plan (no hay id).
2. Encabezado del documento: `**Estado: <estado> · Creado <fecha>.**` y el contexto del plan.
3. Fila en `PLANES.md`: link al archivo en su carpeta actual, Estado (de `ESTADOS.md`), Creado (`AA-MM-DD`), Cerrado `—`, Origen (plan del que se desprende, si aplica), Notas cortas.

## Transicionar un plan

1. **Confirmar la transición** con `ESTADOS.md`: estado nuevo válido y su carpeta. Si el estado es terminal, el plan se cierra.
2. **Mover el archivo** a la carpeta del estado nuevo **sin renombrar** (mover = borrar de la carpeta vieja; nunca duplicar).
3. **Actualizar la fila** en `PLANES.md`: estado, link (la ruta cambió de carpeta), `Cerrado` si es terminal, Notas.
   - **Ejecutado**: completar Cerrado + agregar al documento la sección `## Notas de implementación` (cómo se implementó vs. lo planificado, hash de commit, cosas notables).
   - **Descartado**: completar Cerrado + motivo **obligatorio** en Notas (p. ej. "superseded por <plan>").
4. **Actualizar el encabezado** del documento (`**Estado: ...**`) para que no contradiga al registro.
5. **Reparar referencias entrantes** si las hubiera (el nombre estable minimiza esto; preferir linkear planes vía `PLANES.md`).

## Detección pasiva

Al ver **evidencia de implementación** de un plan que sigue pendiente (commit, mensaje del usuario, código verificado) → proponer la transición a Ejecutado con esta skill. No dejar planes zombis.

## Cierre (siempre)

```bash
node .claude/planes/lint-planes/lint-planes.js
```

Debe dar 0 hallazgos — caza justamente las transiciones a medias (estado vs. carpeta inconsistente, cierres sin fecha, filas colgadas, descartados sin motivo). Reportar la transición hecha y el resultado del lint.
