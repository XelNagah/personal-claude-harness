# lint-decisiones

**Qué hace:** lint de integridad del registro de decisiones (`.claude/decisiones/`): numeración sin huecos ni duplicados, links de detalle que resuelven, páginas `NNNN-slug.md` sin huérfanos, y refs `reemplazada por NNNN` que apuntan a una decisión existente. Sin LLM, sin red.
**Cómo se corre:** `node .claude/decisiones/lint-decisiones/lint-decisiones.js` (desde la raíz del repo). Acepta una carpeta como argumento (default `.claude/decisiones`).
**Estado:** vigente.
**Referenciado por:** la memoria `feedback_decisiones.md` y la sección "Decisiones del proyecto" de `CLAUDE.md` (por texto, no por regla de permiso).
**Dependencias:** Node (sin libs, sin red).
**Origen:** funcionalidad `decisiones`.
