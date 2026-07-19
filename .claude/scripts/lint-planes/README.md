# lint-planes

**Qué hace:** lint del ciclo de planes — coherencia carpeta↔registro (PLANES.md), planes sueltos, pendientes ya resueltos sin mover, cierres a medias (sin fecha, sin motivo, sin notas de implementación) y activos (`En curso`) envejecidos. Sin LLM, sin red.
**Cómo se corre:** `node .claude/scripts/lint-planes/lint-planes.js` (desde la raíz del repo). Flags: `--quiet` (solo imprime si hay hallazgos; usado por el hook), `--dias N` (umbral de envejecimiento, default 30).
**Estado:** vigente.
**Referenciado por:** hook `SessionStart` en `.claude/settings.json` — actualizar el hook si se mueve.
**Dependencias:** Node.js (sin libs externas).
**Origen (opcional):** funcionalidad `gestion-de-planes` del harness (análisis de uso 2026-07).
