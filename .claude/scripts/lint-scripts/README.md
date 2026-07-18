# lint-scripts

**Qué hace:** lint de integridad de este registro de scripts (`.claude/scripts/`): README por tool, cada tool listado en `INDICE.md`, ninguna fila del índice apunta a un directorio inexistente, y las refs por ruta a scripts en `settings.local.json`/`settings.json` resuelven. Sin LLM, sin red.
**Cómo se corre:** `node .claude/scripts/lint-scripts/lint-scripts.js` (desde la raíz del repo). Acepta la carpeta de scripts como argumento (default `.claude/scripts`).
**Estado:** vigente.
**Referenciado por:** la memoria `feedback_scripts.md` y la sección "Scripts del proyecto" de `CLAUDE.md` (por texto, no por regla de permiso).
**Dependencias:** Node (sin libs, sin red).
**Origen:** funcionalidad `scripts`.
