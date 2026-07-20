---
name: info
description: Muestra la Pantalla de bienvenida del Agente Multipropósito — Título + Propósito del repo + métricas de cada subsistema (cuántas memorias, planes, términos, decisiones, herramientas, páginas) + estado de lint. Use when el usuario dice "/info", "mostrá el estado", "info del repo", "cómo está configurado", o quiere ver el estado del harness a demanda (el mismo bloque que se emite al arrancar la sesión).
---

# info — Pantalla de bienvenida a demanda

Renderiza la **Pantalla de bienvenida** (glosario): el bloque de estado del repo. Es la misma info que el hook `SessionStart` emite al arrancar; esta skill la muestra cuando el usuario la pide.

## Qué hacer

1. Correr la Herramienta:

   ```bash
   node .claude/herramientas/pantalla-bienvenida/pantalla-bienvenida.js
   ```

2. Mostrar su salida **tal cual** (ya viene envuelta en una cerca de código para conservar monospace). No reformatear, no resumir: es un bloque de ancho fijo que se rompe si se toca.

3. Si el usuario quiere la versión rápida (sin correr los lints), agregar `--sin-lint`.

## Notas

- La Herramienta descubre los subsistemas dinámicamente; no hay lista que mantener acá.
- Título y Propósito salen de `.claude/identidad.md` (Identidad del Agente). Si no existe, muestra `<sin definir>`.
- Detalle de diseño y límites en el README de la Herramienta: `.claude/herramientas/pantalla-bienvenida/README.md`.
