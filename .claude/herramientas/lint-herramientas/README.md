# lint-herramientas

**Qué hace:** lint de integridad del registro de Herramientas (`.claude/herramientas/`): README por herramienta con carpeta local, cada una listada en `INDICE.md`, ninguna fila del índice apunta a un subdir local inexistente (se saltan links externos a skills/MCP), y las refs por ruta de lint en `settings.local.json`/`settings.json` resuelven. Sin LLM, sin red.
**Cómo se corre:** `node .claude/herramientas/lint-herramientas/lint-herramientas.js` (desde la raíz del repo). Acepta la carpeta de Herramientas como argumento (default `.claude/herramientas`).
**Estado:** vigente.
**Referenciado por:** la memoria `feedback_herramientas.md` y la sección "Herramientas del proyecto" de `CLAUDE.md` (por texto, no por regla de permiso).
**Dependencias:** Node (sin libs, sin red).
**Origen:** funcionalidad `herramientas` (ex `scripts`).
