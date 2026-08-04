---
name: info
description: Muestra la Pantalla de bienvenida del Agente Multipropósito — Título + Propósito del repo + métricas descubiertas de sus subsistemas + estado de lint. Use when el usuario dice "amp:info", "mostrá el estado", "info del repo", "cómo está configurado", o quiere ver el estado del Agente a demanda.
---

# info — Pantalla de bienvenida a demanda

Renderiza la **Pantalla de bienvenida** (glosario): el bloque de estado del repo. Es la misma info que se emite al arrancar la sesión (Regla Base `correr` del subsistema `conducta`); esta skill la muestra cuando el usuario la pide.

## Qué hacer

1. Correr la Herramienta (co-ubicada con `conducta`):

   ```bash
   node .claude/conducta/mostrar-pantalla-bienvenida/mostrar-pantalla-bienvenida.js
   ```

2. Mostrar su salida **tal cual** (ya viene envuelta en una cerca de código para conservar monospace). No reformatear, no resumir: es un bloque de ancho fijo que se rompe si se toca.

3. Si el usuario quiere la versión rápida (sin correr los lints), agregar `--sin-lint`.

## Notas

- La Herramienta descubre los subsistemas dinámicamente; no hay lista que mantener acá.
- Título y Propósito salen de `.claude/identidad.md` (Identidad del Agente). Si no existe, muestra `<sin definir>`.
- Detalle de diseño y límites en el README de la Herramienta: `.claude/conducta/mostrar-pantalla-bienvenida/README.md`.

## Reconciliación

Es una operación de solo lectura: re-ejecutarla no modifica el repo y debe reflejar su estado actual. Si la Herramienta falla, mostrar el error; no fabricar una pantalla parcial ni reutilizar una salida anterior.
