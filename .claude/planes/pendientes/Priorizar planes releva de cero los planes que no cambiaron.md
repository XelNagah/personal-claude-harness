# Priorizar planes releva de cero los planes que no cambiaron

**Estado: Listo · Creado 26-08-25.**

## Qué pasó

Un Agente Desplegado reportó el 25/08/2026 que `priorizar-planes` —y `sugerir-siguiente-plan`, que la reutiliza— releva **todos** los planes vivos desde cero en cada invocación, con el subagente `relevador-de-planes`, aunque ningún documento haya cambiado desde la corrida anterior. Con unos 16 planes vivos, preguntar "qué sigue" dos o tres veces en un día repite el relevamiento entero.

En este repo el número es peor: **52 planes vivos, 492 KB de documentos**. El subagente los abre todos para quedarse con cinco datos de cada uno.

## Qué se cachea y qué no

Lo caro es **leer** los documentos; lo barato es **ordenarlos**. El corte va exactamente ahí:

- **Se cachea la ficha de cada plan** — los cinco datos que devuelve el subagente: de qué depende, si declara fecha o urgencia, qué resuelve, cuán definido está, qué dato le falta.
- **No se cachea nada del juicio.** El orden, la fundamentación y la sugerencia se recalculan siempre, en el hilo principal, como hoy. Un orden guardado sería una prioridad persistida, y la habilidad dice explícitamente que la prioridad es una vista que se recalcula, no un dato guardado.

## Diseño propuesto

### Dónde vive

En `.claude/tmp/`, no como archivo del subsistema `planes`.

Un cache es **derivado y descartable**: si se pierde, la corrida siguiente lo rehace sin que nadie note otra cosa que la demora. Ponerlo adentro de `planes/` lo haría parecer una Entrada del subsistema —con lint que lo vigile y presencia en git—, y ahí molesta el doble: 52 fichas que cambian solas ensucian cada commit y chocan entre dos sesiones trabajando el mismo repo. La Preferencia Local-0003 ya manda los archivos de trabajo a `.claude/tmp/`, que está gitignoreado.

Costo asumido: quien limpie `tmp/` pierde el ahorro de una corrida.

### Cómo se invalida

La clave de cada ficha son **dos** hashes, no uno:

1. **El contenido del archivo del plan.**
2. **La fila del plan en `PLANES.md`.** La ficha depende también de la fila —estado, fechas, Origen—, así que un plan que cambia de estado sin que se toque su documento deja la ficha vieja. Con un solo hash eso no se detecta.

Más una **marca de versión del formato de ficha**: si la habilidad o el subagente cambian qué datos trae una ficha, todas las guardadas quedan con la forma anterior. Si la versión no coincide, se releva todo. Sin esa marca el cache sirve fichas viejas y **no falla: contesta** — el modo de falla del conocimiento `controles-que-no-avisan`.

Resultado de comparar: se releva lo que cambió de hash y lo que es nuevo en el registro; se descarta del cache lo que ya no está vivo; el resto sale del cache.

### Con qué se calcula el hash

Con `crypto` de la biblioteca estándar de Node, no con `git hash-object`.

`git hash-object` obliga a que el Agente Desplegado esté en un repo git, y no todos lo están; ahí el mecanismo se caería o —peor— degradaría a relevar siempre sin decirlo. `crypto` no agrega dependencias, que es lo que fija la Decisión Local-0047.

### Quién lo escribe

El subagente `relevador-de-planes` es de solo lectura por construcción y **no puede escribir el cache**. La parte mecánica va en una **Herramienta** nueva, que la habilidad invoca dos veces: una antes de delegar, para preguntar qué hay que relevar, y otra después, para guardar las fichas nuevas. Es el reparto que fija la Decisión Local-0003: lo determinista en script, el juicio en la habilidad.

La Herramienta **no sabe de planes**: recibe un nombre de cache, una lista de archivos con su clave y devuelve qué está al día y qué falta. Así, si mañana otra habilidad la necesita, el cambio es aditivo y no hay que desarmar nada (Preferencia Local-0006).

> **Corrección del análisis (10/09/2026):** el párrafo de arriba citaba la Decisión Local-0003, y esa decisión no dice eso — fija la integridad en dos capas (mecánica obligatoria, semántica informal) del subsistema, no el reparto entre script y habilidad. La cita correcta es la **Decisión Local-0009** (*Taxonomía de skills por ámbito*), que sí lo dice: «lo mecánico determinista va en script/lint; lo que requiere juicio o significado va en skill». No se reescribió el párrafo para no perder el rastro de la corrección; ver más abajo.

### Que el ahorro se vea

La habilidad reporta cuántas fichas vinieron del cache y cuántas se relevaron. Un cache mudo que empieza a fallar se ve igual que uno que anda.

## Sobre generalizar el mecanismo

**No conviene generalizar el uso ahora, sí el mecanismo.** Los otros tres subagentes del Agente Multipropósito recorren el repo entero o el Aprendizaje entero —`buscador-de-conocimiento`, `buscador-de-terminologia`, `relevador-de-aprendizaje`— y ahí no hay una unidad con identidad estable que cachear: el conjunto de archivos lo define el recorrido, no un registro. `priorizar-planes` es el único caso donde el registro enumera de antemano qué documentos entran y cuál es cada uno.

Por eso la Herramienta se escribe genérica y con un solo consumidor. Generalizar el uso, cuando aparezca el segundo caso, no obliga a tocar lo construido.

> **Actualización del análisis (10/09/2026).** Desde que se abrió este plan se sumó un cuarto subagente de subsistema, `contrastador` (`funcionalidades/amp/agents/contrastador.md`, 02/09/2026), que también lee registros enteros en cada invocación —glosario, Terminología Farlopa, decisiones y la tabla de `PLANES.md`—. No cambia la conclusión de arriba: lo que `contrastador` extrae de cada registro depende del **material que se le pasa a contrastar**, así que una ficha guardada solo serviría si se repitiera exactamente la misma consulta, algo que en la práctica no pasa. `relevador-de-planes` es distinto porque su ficha por plan **no depende de quién pregunta**: es función pura del contenido del plan y de su fila en `PLANES.md`, y por eso sí conviene guardarla. Sigue habiendo un único caso con una unidad de identidad estable que cachear.

## Análisis (10/09/2026)

Verificado contra el código actual (`funcionalidades/amp-planes/skills/priorizar-planes/SKILL.md`, `funcionalidades/amp-planes/skills/sugerir-siguiente-plan/SKILL.md`, `funcionalidades/amp-planes/agents/relevador-de-planes.md`) y contra `.claude/decisiones/INDICE.md`, `.claude/semantica/GLOSARIO.md`, `.claude/semantica/TERMINOLOGIA-FARLOPA.md` y `.claude/conocimiento/INDICE.md` + `INDICE-LOCAL.md`. Los números que el plan traía (52 planes vivos, 492 KB) están respaldados por la medición ya asentada en el conocimiento [Medir el ahorro de contexto de un subagente de subsistema](../../conocimiento/medir-subagentes-de-subsistema.md) (49 planes vivos, 390 KB, medido el 10/08/2026); hoy, 10/09/2026, son **55 planes vivos y 584 KB**: el problema que este plan ataca no se achicó.

### Los tres puntos a decidir, resueltos

1. ~~Si el cache viaja como Componente de la Base o queda de este repo.~~ **Resuelto: viaja, y no es una alternativa real entre las dos.** `priorizar-planes` **es** una skill de la Base: vive en `funcionalidades/amp-planes/skills/priorizar-planes/SKILL.md`, uno de los nueve plugins `amp-<sub>` que este repo distribuye a todo Agente Desplegado (`AGENTS.md`, `REGISTRO.md`). Los dos pasos nuevos que este plan le agrega a esa SKILL.md invocan la Herramienta; si la Herramienta quedara solo en el `INDICE-LOCAL.md` de este repo, la instrucción que viaja con la skill citaría algo que no existe en ningún `.claude/` recién instalado, y `priorizar-planes` se rompería en todo Agente Desplegado que no sea este. La Herramienta va al **Índice del Agente Multipropósito** (`herramientas/INDICE.md`, código `Base-NNNN`) y su carpeta (`.claude/herramientas/<nombre>/`) tiene que estar copiada dentro de `funcionalidades/amp/skills/inicializar/base/` —la única carpeta `base/` del repo, la que `amp:inicializar` copia entera a cada instalación nueva— antes de subir la versión del plugin. Se hace con `node .claude/herramientas/sincronizar-base/sincronizar-base.js --aplicar`, que además la va a listar como **candidato** la primera vez, porque todavía no está declarada.

2. ~~Qué pasa con dos sesiones a la vez escribiendo el mismo archivo de cache.~~ **Resuelto, con un criterio distinto del que este plan proponía copiar de Local-0110.** La solución de Local-0110 —directorio único por corrida (`mkdtempSync`), sin compartir nada entre corridas— no se puede trasladar tal cual: el valor entero de este cache está en que **sobrevive** a la corrida y a la sesión que lo escribió. El caso que motivó el plan es preguntar «qué sigue» dos o tres veces en un día, en sesiones que normalmente no son la misma conversación; un cache por sesión no ahorraría nada entre ellas y el plan dejaría de resolver lo que vino a resolver.
   El criterio que sí aplica: **escritura atómica, con la pérdida de una escritura concurrente aceptada como costo.** La Herramienta escribe el cache entero a un archivo temporal (nombre único) y lo reemplaza con un `rename` sobre el mismo directorio — atómico en el sistema de archivos, así que nunca queda un cache a medio escribir. Si dos sesiones terminan de escribir casi al mismo tiempo, la segunda gana y las fichas que la primera acababa de guardar se pierden. Eso es aceptable porque la clave de cada ficha es una función pura de sus dos hashes (`Cómo se invalida`, arriba): una ficha perdida no dejó un dato **incorrecto**, dejó de estar — la próxima consulta la vuelve a relevar, que es exactamente lo que pasa siempre hoy. No hace falta un candado de archivo: el peor caso es perder el ahorro de una sola ficha entre dos sesiones que escribieron en el mismo instante, no una respuesta mal calculada.
   Esto también explica por qué el punto 2 de Local-0110 —el barrido por edad para no acumular directorios de corridas abortadas— no tiene equivalente acá: este cache tiene **como mucho una entrada por plan vivo** (hoy 55), nunca una por corrida. No hay proceso matado que deje basura de tamaño creciente, porque no hay un directorio nuevo por corrida que limpiar.

3. ~~Si `sugerir-siguiente-plan` necesita algo propio o le alcanza con heredarlo de `priorizar-planes`.~~ **Resuelto: le alcanza, sin tocar su SKILL.md.** El primer paso de su flujo dice, literal: «Priorizar con `priorizar-planes` (no reimplementar los criterios acá)» — invoca la skill entera, no una función suya. El cache vive adentro del paso 1 de `priorizar-planes`; `sugerir-siguiente-plan` lo hereda por ser ese su único punto de entrada al relevamiento.

## Puntos a decidir

Ninguno queda abierto: los tres de arriba se resolvieron en el análisis del 10/09/2026.

## Alcance del trabajo

- Herramienta nueva, con su ficha y su fila en el **Índice del Agente Multipropósito** de Herramientas (`registrar-herramienta`, código `Base-NNNN` — viaja, ver el análisis).
- `funcionalidades/amp-planes/skills/priorizar-planes/SKILL.md` — los dos pasos nuevos y el reporte del ahorro.
- Banco de pruebas de la Herramienta, con escenario sintético (Decisión Local-0075).
- `node .claude/herramientas/sincronizar-base/sincronizar-base.js --aplicar` y subir la versión de `amp-planes` (`funcionalidades/amp-planes/.claude-plugin/plugin.json`, hoy `0.12.0`).

## Propuestas para asentar

Esta sesión de análisis corrió con la restricción de escribir solo este archivo y la fila de `PLANES.md`; lo que sigue no se asentó en ningún registro y queda para que el hilo principal lo ratifique.

- **Semántica — evaluar `cache` / `caché`.** Este plan y otros tres planes vivos (`Capa semantica de coherencia - contradicciones e incompatibilidades`, `Nombres y distribucion de las skills del harness`, `Subagentes del AMP para el flujo de desarrollo por etapas`) usan `cache` sin acento y sin que el término esté en el glosario ni en la Terminología Farlopa. Verificado contra el Diccionario panhispánico de dudas de la RAE (`rae.es/dpd/caché`) y Fundéu: la forma adaptada **«caché»**, con tilde, es la que registran para la memoria caché en informática — no es un anglicismo crudo a vetar sin más, podría ser la forma canónica a ratificar. Corresponde correr `converger-terminologia` con alcance «los planes» antes de escribir la Herramienta y la SKILL.md nuevas, para no sumar más apariciones sin ratificar (Preferencia Base-0010).

## Origen

Reporte de un Agente Desplegado, 25/08/2026.
