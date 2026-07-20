# Herramientas del proyecto

Registro de las **Herramientas** del repo: las *tools* que el **Propósito** del repo requiere y el agente invoca para tareas repetibles (decisión 0007). Tipos: `script`, `skill` local del repo, `MCP` local. Una fila por Herramienta. Ordena las herramientas desordenadas: qué es cada una, cómo se invoca, si sigue vigente.

> Los **lints de subsistema** (lint-memoria, lint-glosario, …) **no** van acá: son infra del Patrón de cada subsistema (decisión 0008) y viven con su subsistema (`.claude/<sub>/lint-<sub>/`). Acá solo van tools de dominio. El Propósito de **este** repo es autorar el harness, así que su Herramienta de dominio es `lint-harness`.

- **Herramienta** — nombre; si es tipo `script` con carpeta local, link a `<tool>/` (adentro, README + código). Si es `skill` o `MCP`, link a donde vive (`.claude/skills/<skill>/`, `.mcp.json`).
- **Tipo** — `script` | `skill` | `mcp`.
- **Qué hace** — una línea.
- **Cómo se invoca** — el comando (`script`), el nombre de skill que dispara el modelo (`skill`), o cómo se conecta y qué tool-calls expone (`mcp`).
- **Estado** — `vigente`, `experimental` u `obsoleto` (los obsoletos se pueden depurar).

| Herramienta | Tipo | Qué hace | Cómo se invoca | Estado |
|-------------|------|----------|----------------|--------|
| [instalar-junctions](instalar-junctions/) | script | Crea/repara las dos tandas de junctions de skills (`~/.claude/skills` para Claude Code + `~/.agents/skills` para Codex/Cursor/Gemini) apuntando a `funcionalidades/*/skills/`; idempotente, no pisa lo divergente | `node .claude/herramientas/instalar-junctions/instalar-junctions.js` | vigente |
| [control-cierre](control-cierre/) | script | Corre todos los chequeos del repo de una pasada (lints de subsistema descubiertos dinámicamente + `claude plugin validate`) y resume verde/hallazgos | `node .claude/herramientas/control-cierre/control-cierre.js` | vigente |
| [lint-harness](lint-harness/) | script | Lint de coherencia del harness: disco↔marketplace↔REGISTRO, junctions, texto literal divergente entre plantillas | `node .claude/herramientas/lint-harness/lint-harness.js` | vigente |
| [lint-herramientas](lint-herramientas/) | script | Lint de este registro: README por herramienta local, herramienta en índice, filas colgadas, refs por ruta de lint en settings | `node .claude/herramientas/lint-herramientas/lint-herramientas.js` | vigente |
| [propagar-harness](../skills/propagar-harness/) | skill | Propaga un cambio textual a funcionalidades + orquestador: subagente fresco para la copia, verificación carácter a carácter de los embebidos, subida de versiones | skill `propagar-harness` (el agente la dispara al tocar textos que viajan) | vigente |
| [agregar-funcionalidad](../skills/agregar-funcionalidad/) | skill | Alta completa de una funcionalidad/plugin: carpeta + marketplace + junction + REGISTRO + orquestador si aplica, con validación final | skill `agregar-funcionalidad` | vigente |
