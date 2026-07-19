# Herramientas del proyecto

Registro de las **Herramientas** del repo: las *tools* que el **Propósito** del repo requiere y el agente invoca para tareas repetibles (decisión 0007). Tipos: `script`, `skill` local del repo, `MCP` local. Una fila por Herramienta. Ordena el "cementerio de tools": qué es cada una, cómo se invoca, si sigue vigente.

> Los **lints de subsistema** (lint-memoria, lint-glosario, …) **no** van acá: son infra del Patrón de cada subsistema (decisión 0008) y viven con su subsistema (`.claude/<sub>/lint-<sub>/`). Acá solo van tools de dominio. El Propósito de **este** repo es autorar el harness, así que su Herramienta de dominio es `lint-harness`.

- **Herramienta** — nombre; si es tipo `script` con carpeta local, link a `<tool>/` (adentro, README + código). Si es `skill` o `MCP`, link a donde vive (`.claude/skills/<skill>/`, `.mcp.json`).
- **Tipo** — `script` | `skill` | `mcp`.
- **Qué hace** — una línea.
- **Cómo se invoca** — el comando (`script`), el nombre de skill que dispara el modelo (`skill`), o cómo se conecta y qué tool-calls expone (`mcp`).
- **Estado** — `vigente`, `experimental` u `obsoleto` (los obsoletos se pueden depurar).

| Herramienta | Tipo | Qué hace | Cómo se invoca | Estado |
|-------------|------|----------|----------------|--------|
| [lint-harness](lint-harness/) | script | Lint de coherencia del harness: disco↔marketplace↔REGISTRO, junctions, verbatim divergente entre plantillas | `node .claude/herramientas/lint-harness/lint-harness.js` | vigente |
| [lint-herramientas](lint-herramientas/) | script | Lint de este registro: README por herramienta local, herramienta en índice, filas colgadas, refs por ruta de lint en settings | `node .claude/herramientas/lint-herramientas/lint-herramientas.js` | vigente |
