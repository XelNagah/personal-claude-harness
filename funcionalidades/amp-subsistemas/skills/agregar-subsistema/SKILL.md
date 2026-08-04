---
name: agregar-subsistema
description: Agrega un subsistema del Propósito al catálogo y al disco siguiendo el Patrón. Use when un repo necesita una casa nueva para entradas, con índice, manifiesto, README, lint y habilidad de operación.
---

# Agregar subsistema

1. Confirmar que no existe un subsistema cuyo sentido cubra el caso.
2. Proponer nombre, propósito, entradas, índice, README, lint y habilidad de operación.
3. Con aprobación, crear la carpeta y registrarla en `SUBSISTEMAS-LOCAL.md`, el catálogo del Agente Desplegado (ya existe declarado); nunca en `SUBSISTEMAS.md`, que es del Agente Multipropósito. La fila lleva `Código | Nombre | Descripción | Operación | Detalle`:
   - **Código** — `Local-NNNN`, porque el origen es el Agente Desplegado. El número es **el mayor de ese catálogo más uno**, nunca la cantidad de filas más uno: si alguna vez se retiró un subsistema, contar filas repite un código ya usado. Un código retirado deja un hueco y no se reusa.
   - **Nombre** — el nombre del subsistema, que es también el de su carpeta.
   - **Descripción** — qué guarda, en una línea. **Operación** — las skills que lo operan. **Detalle** — el link a su casa.
4. Cablear su manifiesto al punto de entrada y validar el catálogo y el subsistema.

## Reconciliación

Inspeccionar primero los dos catálogos y el disco. Si el subsistema ya existe completo, reportar `ya estaba`; si está a medio crear, agregar solo los Componentes ausentes y volver a validar; si nombre, propósito o estructura divergen, reportar `divergente` y no pisar sin confirmación.
