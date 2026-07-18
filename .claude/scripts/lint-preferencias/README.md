# lint-preferencias

**Qué hace:** lint **estructural** de las preferencias (`.claude/preferencias/PREFERENCIAS.md`): que existan las secciones `## Base` y `## Adaptaciones`, que el archivo no esté vacío, y que `CLAUDE.md` lo importe con `@preferencias/PREFERENCIAS.md` (para que quede siempre en contexto). Sin LLM, sin red. **No** detecta contradicciones semánticas entre preferencias — eso es la capa semántica (a pedido).
**Cómo se corre:** `node .claude/scripts/lint-preferencias/lint-preferencias.js` (desde la raíz del repo). Acepta la carpeta `.claude` como argumento (default `.claude`).
**Estado:** vigente.
**Referenciado por:** la sección "Preferencias del proyecto" de `CLAUDE.md` (por texto, no por regla de permiso).
**Dependencias:** Node (sin libs, sin red).
**Origen:** funcionalidad `preferencias-trabajo`.
