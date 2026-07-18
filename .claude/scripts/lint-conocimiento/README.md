# lint-conocimiento

**Qué hace:** lint de integridad de la base de conocimiento (`.claude/conocimiento/`): refs `.md` rotas, índice incompleto (páginas no listadas) y huérfanos (páginas que nada referencia). Sin LLM, sin red.
**Cómo se corre:** `node .claude/scripts/lint-conocimiento/lint-conocimiento.js` (desde la raíz del repo). Acepta una carpeta como argumento (default `.claude/conocimiento`).
**Estado:** vigente.
**Referenciado por:** la memoria `feedback_base_conocimiento.md` y la sección "Base de conocimiento del proyecto" de `CLAUDE.md` (por texto, no por regla de permiso).
**Dependencias:** Node (sin libs, sin red).
**Origen:** funcionalidad `conocimiento`.
