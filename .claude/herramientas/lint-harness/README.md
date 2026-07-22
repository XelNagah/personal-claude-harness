# lint-harness

**Qué hace:** lint de coherencia del harness — punto de entrada (AGENTS.md fuente + CLAUDE.md adaptador, decisión 0010), funcionalidades en disco vs `marketplace.json` vs `REGISTRO.md`, sources del marketplace que no resuelven, archivos clave por funcionalidad (README, plugin.json, SKILL.md), junctions de skills en las dos tandas (`~/.claude/skills` y `~/.agents/skills`; existencia y destino), divergencia de bloques textuales de memorias entre las PLANTILLA.md de cada funcionalidad y la del orquestador (hash normalizado), tamaño de los `MANIFIESTO.md` de subsistema (dec. 0017: van siempre en contexto, deben quedar breves — límite 220 palabras), y estructura mínima de esos manifiestos (dec. 0019: los 5 campos obligatorios —título, Disparador, declaración de carga, comando de lint— y coherencia entre la declaración de carga y la presencia de la línea `@INDICE`). Sin LLM, sin red. Todo informativo, no corta el avance.
**Cómo se corre:** `node .claude/herramientas/lint-harness/lint-harness.js` (desde la raíz del repo del harness). Flag: `--quiet` (solo imprime si hay hallazgos).
**Estado:** vigente.
**Referenciado por:** nadie por ruta todavía (candidato a hook SessionStart de este repo si se quiere chequeo automático).
**Dependencias:** Node.js (sin libs externas).
**Origen (opcional):** ítem 10 del plan de mejoras de uso 2026-07 (repo como-uso-claude): el drift docs↔realidad del harness era recurrente y manual.
