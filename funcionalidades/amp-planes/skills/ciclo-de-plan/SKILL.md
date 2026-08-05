---
name: ciclo-de-plan
description: Mueve un plan por su ciclo de vida en .claude/planes/ — abrir (archivo con nombre estable + fila en PLANES.md) y transicionar (cambiar estado, mover de carpeta, completar fechas, lint). Use when hay que persistir un plan nuevo ("guardá este plan"), retomarlo, marcarlo ejecutado/diferido/descartado, o al detectar evidencia de que un plan pendiente ya se implementó.
---

# Ciclo de un plan

Opera el ciclo de planes (`.claude/planes/`) sin dejar el registro y el disco desincronizados. Cada transición toca hasta 3 lugares coordinados: el **archivo** del plan (carpeta según estado), la **fila** en `PLANES.md` (estado, fechas, ruta) y a veces el **encabezado** del propio plan. Esta skill hace los tres de una vez.

**Fuente de verdad de los estados: `planes/ESTADOS.md`** — leerlo antes de transicionar (define los estados disponibles, a qué carpeta mapea cada uno y cuáles son terminales; es configurable por repo — no asumir los nombres).

## Abrir un plan

1. Escribir el plan en `planes/pendientes/<nombre-estable>.md`. **Nombre estable**: sin fecha, sin paréntesis (rompen los links markdown), no cambia nunca aunque cambie el estado — el nombre del archivo es la identidad del plan (no hay id).
2. Encabezado del documento: `**Estado: <estado> · Creado <fecha>.**` y el contexto del plan.
3. Fila en `PLANES.md`, al final de la tabla (las filas van en orden ascendente por Código):
   - **Código** — `Local-NNNN`, calculado como **`máximo + 1`**. Nunca `cantidad + 1`: si alguna vez se retiró un plan hay un hueco, y contar filas repite un código ya usado. Los huecos no se reusan.
   - **Nombre** — el título del plan, el mismo que encabeza el documento. Único en el Índice.
   - **Descripción** — de qué se trata el plan, en **una línea**. Lo largo va al archivo, que es su Detalle.
   - **Estado** (de `ESTADOS.md`), **Fecha de creación** (`AA-MM-DD`), **Fecha de cierre** en `—`, **Origen** (plan del que se desprende, si aplica).
   - **Detalle** — link al archivo en su carpeta actual.

## Transicionar un plan

1. **Confirmar la transición** con `ESTADOS.md`: estado nuevo válido y su carpeta. Si el estado es terminal, el plan se cierra.
2. **Mover el archivo** a la carpeta del estado nuevo **sin renombrar** (mover = borrar de la carpeta vieja; nunca duplicar).
3. **Actualizar la fila** en `PLANES.md`: Estado, Detalle (la ruta cambió de carpeta) y `Fecha de cierre` si es terminal. El Código y el Nombre **no cambian nunca**: el Código es la referencia estable del plan.
   - **Ejecutado**: completar la Fecha de cierre + revisar antes los encabezados del documento. Si ya hay una sección de implementación (`## Implementación` o `## Notas de implementación`, con cualquier nivel de encabezado), conservar su contenido y normalizar solo el título a `## Notas de implementación` si corresponde. Solo si no existe, agregar esa sección (cómo se implementó vs. lo planificado, hash de commit, cosas notables); nunca crear una sección vacía que duplique notas legacy.
   - **Descartado**: completar la Fecha de cierre + motivo **obligatorio** en el archivo del plan, en una sección `## Notas de cierre` (p. ej. "reemplazado por <plan>"). El registro no lleva el motivo: la columna donde vivía desapareció y lo largo va al archivo, que es el Detalle.
   - **En pausa**: escribir en el encabezado del archivo del plan la línea `**estado_a_retomar:** <estado>`, con el estado del que se pausa — **solo `Análisis` o `En curso`**. Es el único estado con este dato, y vive en el archivo, no en `PLANES.md`.
   - **Retomar** (salir de `En pausa`): volver el plan **exactamente** al valor de `estado_a_retomar` y **borrar esa línea** del encabezado. Al pasar a `Diferido` desde `En pausa`, también se borra (un diferido vuelve siempre a `Análisis`, no al estado pausado).
4. **Actualizar el encabezado** del documento (`**Estado: ...**`) para que no contradiga al registro.
5. **Reparar referencias entrantes** si las hubiera (el nombre estable minimiza esto; preferir enlazar planes vía `PLANES.md`).

## Detección pasiva

Al ver **evidencia de implementación** de un plan que sigue pendiente (commit, mensaje del usuario, código verificado) → proponer la transición a Ejecutado con esta skill. No dejar planes zombis.

## Cierre (siempre)

```bash
node .claude/planes/lint-planes/lint-planes.js
```

Debe dar 0 hallazgos — caza justamente las transiciones a medias (estado vs. carpeta inconsistente, cierres sin fecha, filas colgadas, descartados sin motivo). Reportar la transición hecha y el resultado del lint.

## Reconciliación

Antes de abrir, buscar un plan equivalente en el registro y en los archivos. Antes de transicionar, comparar fila, encabezado y carpeta: completar solo lo faltante y conservar Código, Nombre y nombre de archivo. Reportar `ya estaba` si el estado pedido ya es consistente y `divergente` si las fuentes no coinciden; no adivinar cuál pisar.
