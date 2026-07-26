# lint-harness

**Qué hace:** lint de coherencia del harness — punto de entrada (AGENTS.md fuente + CLAUDE.md adaptador, decisión 0010), funcionalidades en disco vs `marketplace.json` vs `REGISTRO.md`, sources del marketplace que no resuelven, archivos clave por funcionalidad (README, plugin.json, SKILL.md), **lo que corresponda al modo de consumo de la máquina** (ver abajo), divergencia de bloques textuales de memorias entre las PLANTILLA.md de cada funcionalidad y la del orquestador (hash normalizado), tamaño de los `MANIFIESTO.md` de subsistema (dec. 0017: van siempre en contexto, deben quedar breves — límite 220 palabras), y estructura mínima de esos manifiestos (dec. 0019: los 5 campos obligatorios —título, Disparador, declaración de carga, comando de lint— y coherencia entre la declaración de carga y la presencia de la línea `@INDICE`). Sin LLM, sin red. Todo informativo, no corta el avance.
**Cómo se corre:** `node .claude/herramientas/lint-harness/lint-harness.js` (desde la raíz del repo del harness). Flag: `--quiet` (solo imprime si hay hallazgos).
**Estado:** vigente.
**Referenciado por:** nadie por ruta todavía (candidato a hook SessionStart de este repo si se quiere chequeo automático).
**Dependencias:** Node.js (sin libs externas).
**Origen (opcional):** ítem 10 del plan de mejoras de uso 2026-07 (repo como-uso-claude): el desvío entre lo documentado y lo real del harness era recurrente y manual.

## El modo de consumo

El harness se consume de **dos formas, y no pueden convivir** (colisionan por nombre de skill):

- **enlace** — junctions a `funcionalidades/*/skills/*` desde `~/.claude/skills` y `~/.agents/skills`. Es el modo de autoría: se edita la skill en vivo.
- **plugin** — instalado desde el marketplace, servido de la caché. Es el modo de consumo.

El lint **detecta en cuál está la máquina** —mirando los enlaces que apuntan a este repo y el registro de plugins instalados para este `projectPath`— y chequea solo lo que aplica:

| Modo | Qué chequea |
|------|-------------|
| enlace | que estén los enlaces de las dos tandas y que apunten acá |
| plugin | que la versión de cada `plugin.json` coincida con la instalada |
| mixto | las dos cosas, **más un hallazgo propio**: las dos vías a la vez exponen la misma skill dos veces, sin ganador definido |
| sin consumo | ninguna de las dos: lo dice en la cabecera y no reclama nada |

El motivo de la separación: en una máquina que consume por plugin no *faltan* enlaces — se decidió no tenerlos. Reportarlos igual daba **22 hallazgos permanentes**, y un hallazgo que nunca se va entrena a ignorar la salida entera; el día que aparece uno real cae en la misma pila que ya se saltea.

**Lo que este lint no mira:** si la versión instalada es además la que la **sesión cargó**. Una sesión toma sus plugins al arrancar y se queda con esos, así que puede estar corriendo una versión anterior a la instalada. Eso lo diagnostica la Herramienta `actualizar-plugins`, que lo deduce comparando contra la hora de arranque del proceso.
