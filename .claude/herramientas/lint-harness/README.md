# lint-harness

**Qué hace:** lint de coherencia del harness — punto de entrada (AGENTS.md fuente + CLAUDE.md adaptador, decisión 0010), funcionalidades en disco vs `marketplace.json` vs `REGISTRO.md`, sources del marketplace que no resuelven, archivos clave por funcionalidad (README, plugin.json, SKILL.md), versión instalada distinta de la publicada, divergencia de bloques textuales de memorias entre las PLANTILLA.md de cada funcionalidad y la del orquestador (hash normalizado), tamaño de los `MANIFIESTO.md` de subsistema (dec. 0017: van siempre en contexto, deben quedar breves — límite 220 palabras), y estructura mínima de esos manifiestos (dec. 0019: los 5 campos obligatorios —título, Disparador, declaración de carga, comando de lint— y coherencia entre la declaración de carga y la presencia de la línea `@INDICE`), **terminología vetada en el texto que viaja** y la **marca de orden de bytes (U+FEFF)** suelta en cualquier archivo del repo (ver abajo los dos). Sin LLM, sin red. Todo informativo, no corta el avance.
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

**Una sola vía de excepción, y no toca ningún archivo:** la lista `USOS_LEGITIMOS`, adentro del código del lint, con el motivo escrito al lado. Existe porque el veto es sobre la **relación término→significado** y el lint solo ve el término. **Hoy está vacía**: su única entrada —`capa mecánica` y `capa semántica`— se retiró el 30/07/2026 al reformularse esa fila del registro, que pasó a registrar la expresión (`capa de plugins`) en vez de la palabra corriente. Así el registro sigue enumerando lo prohibido, que es finito, en vez de lo permitido, que no lo es.

**Todo lo demás se corrige en el texto.** Se evaluó y se descartó un marcador en el archivo (`<!-- vetado-ok -->`) para eximir citas deliberadas: el único caso que lo pedía —un párrafo de la PLANTILLA que citaba las Bases viejas para poder reconocerlas— se resolvió reescribiendo el párrafo, que además dejó de envejecer con cada versión de la Base. La excepción parece barata en el momento y queda para siempre; corregir el texto hace que el caso no exista.

## La marca de orden de bytes (U+FEFF)

Un mismo carácter invisible, dos defectos según dónde caiga, y el lint los distingue en el mensaje:

| Dónde | Qué es | Qué rompe |
|---|---|---|
| Primera posición del archivo | la **marca de orden de bytes** | el `.md` deja de matchear `^---`: se lo lee "sin frontmatter" y pierde todo lo que declaraba de sí mismo —`origen`, `indice`, `columnas`— sin emitir ninguna señal |
| Cualquier otra posición | el **carácter literal en el texto** | típicamente adentro del regex escrito para sacarlo: funciona, se lee igual, y deja en el fuente exactamente aquello de lo que trata el defecto |

Ninguno de los dos se ve abriendo el archivo en un editor, así que el único que los encuentra es un barrido. El lint recorre todo el repo (`.md`, `.js`, `.json`, `.mjs`, `.cjs`, `.sh`, `.ps1`) salteando `node_modules`, `.git` y `.claude/tmp/` —gitignoreada, nada de ahí viaja ni se ejecuta, y es donde los bancos siembran la marca a propósito para probar que sus controles la ven—.

El carácter se construye por código (`String.fromCharCode(0xFEFF)`), nunca literal: un control escrito con el carácter que persigue se marca a sí mismo. Vale igual para el banco de pruebas.

**Alcance:** este lint es del Agente Desplegado y no viaja, así que el control cuida **este** repo, que es donde se escriben los regex que pueden volver a colarse el carácter. Detalle del defecto en el conocimiento `Local-0015`.

**Lo que este lint no mira:** si la versión instalada es además la que la **sesión cargó**. Una sesión toma sus plugins al arrancar y se queda con esos, así que puede estar corriendo una versión anterior a la instalada. Eso lo diagnostica la Herramienta `actualizar-plugins`, que lo deduce comparando contra la hora de arranque del proceso.
