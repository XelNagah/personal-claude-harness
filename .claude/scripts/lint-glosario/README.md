# lint-glosario

**Qué hace:** lint de integridad del glosario (`.claude/glosario/`): links de detalle que resuelven, páginas `<slug>.md` sin huérfanos, y colisiones de alias (un mismo alias bajo dos conceptos distintos). Sin LLM, sin red.
**Cómo se corre:** `node .claude/scripts/lint-glosario/lint-glosario.js` (desde la raíz del repo). Acepta una carpeta como argumento (default `.claude/glosario`).
**Estado:** vigente.
**Referenciado por:** la memoria `feedback_glosario.md` y la sección "Glosario del proyecto" de `CLAUDE.md` (por texto, no por regla de permiso).
**Dependencias:** Node (sin libs, sin red).
**Origen:** funcionalidad `glosario`.
