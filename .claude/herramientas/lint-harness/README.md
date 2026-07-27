# lint-harness

**Qué hace:** lint de coherencia del harness — punto de entrada (AGENTS.md fuente + CLAUDE.md adaptador, decisión 0010), funcionalidades en disco vs `marketplace.json` vs `REGISTRO.md`, sources del marketplace que no resuelven, archivos clave por funcionalidad (README, plugin.json, SKILL.md), versión instalada distinta de la publicada, divergencia de bloques textuales de memorias entre las PLANTILLA.md de cada funcionalidad y la del orquestador (hash normalizado), tamaño de los `MANIFIESTO.md` de subsistema (dec. 0017: van siempre en contexto, deben quedar breves — límite 220 palabras), y estructura mínima de esos manifiestos (dec. 0019: los 5 campos obligatorios —título, Disparador, declaración de carga, comando de lint— y coherencia entre la declaración de carga y la presencia de la línea `@INDICE`), y **terminología vetada en el texto que viaja** (ver abajo). Sin LLM, sin red. Todo informativo, no corta el avance.
**Cómo se corre:** `node .claude/herramientas/lint-harness/lint-harness.js` (desde la raíz del repo del harness). Flag: `--quiet` (solo imprime si hay hallazgos).
**Estado:** vigente.
**Referenciado por:** nadie por ruta todavía (candidato a hook SessionStart de este repo si se quiere chequeo automático).
**Dependencias:** Node.js (sin libs externas).
**Origen (opcional):** ítem 10 del plan de mejoras de uso 2026-07 (repo como-uso-claude): el desvío entre lo documentado y lo real del harness era recurrente y manual.

## Plugins instalados

El lint consulta el registro de Plugins de Claude Code para este repositorio y compara la versión instalada con la publicada. Los Plugins ausentes no son hallazgos: la Herramienta `actualizar-plugins` diagnostica e instala los que correspondan.

## Terminología vetada en el texto que viaja

Un término vetado en `.claude/` lo lee el autor; uno en una PLANTILLA lo **hereda cada Agente con Propósito** que se inicialice. Por eso el hallazgo vive acá y **cuenta** (el control de cierre se pone rojo), mientras `lint-semantica` sigue reportando los del repo como información.

El lint lee los términos de `.claude/semantica/TERMINOLOGIA-FARLOPA.md` y barre `funcionalidades/`. La clasificación **no** puede ser la de `lint-semantica` —que trata todo lo que está entre backticks como código—: en una PLANTILLA los bloques ` ```markdown ` son justamente el texto literal que se escribe en el repo destino. Se clasifica así:

| Dónde aparece | Cómo se trata |
|---|---|
| Texto suelto y bloques ` ```markdown ` | **texto que viaja** → hallazgo, hay que reescribirlo |
| Bloques ` ```js `, ` ```json `, ` ```bash `… y archivos `.js`/`.json` | código → informativo |
| Bloques sin lenguaje (árboles de estructura, salidas de consola) | código → informativo |
| Entre backticks, destino de un link `](ruta)`, campo `name` del frontmatter | identificador → informativo (tocarlo es refactor, con refs por ruta de por medio) |

**Una sola vía de excepción, y no toca ningún archivo:** la lista `USOS_LEGITIMOS`, adentro del código del lint, con el motivo escrito al lado. Existe porque el veto es sobre la **relación término→significado** y el lint solo ve el término. Hoy tiene dos entradas, `capa mecánica` y `capa semántica`, que el propio registro de farlopa declara legítimas y que además son el vocabulario de una decisión asentada.

**Todo lo demás se corrige en el texto.** Se evaluó y se descartó un marcador en el archivo (`<!-- vetado-ok -->`) para eximir citas deliberadas: el único caso que lo pedía —un párrafo de la PLANTILLA que citaba las Bases viejas para poder reconocerlas— se resolvió reescribiendo el párrafo, que además dejó de envejecer con cada versión de la Base. La excepción parece barata en el momento y queda para siempre; corregir el texto hace que el caso no exista.

**Lo que este lint no mira:** si la versión instalada es además la que la **sesión cargó**. Una sesión toma sus plugins al arrancar y se queda con esos, así que puede estar corriendo una versión anterior a la instalada. Eso lo diagnostica la Herramienta `actualizar-plugins`, que lo deduce comparando contra la hora de arranque del proceso.
