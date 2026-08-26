# Priorizar planes releva de cero los planes que no cambiaron

**Estado: Nuevo · Creado 26-08-25.**

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

### Que el ahorro se vea

La habilidad reporta cuántas fichas vinieron del cache y cuántas se relevaron. Un cache mudo que empieza a fallar se ve igual que uno que anda.

## Sobre generalizar el mecanismo

**No conviene generalizar el uso ahora, sí el mecanismo.** Los otros tres subagentes del Agente Multipropósito recorren el repo entero o el Aprendizaje entero —`buscador-de-conocimiento`, `buscador-de-terminologia`, `relevador-de-aprendizaje`— y ahí no hay una unidad con identidad estable que cachear: el conjunto de archivos lo define el recorrido, no un registro. `priorizar-planes` es el único caso donde el registro enumera de antemano qué documentos entran y cuál es cada uno.

Por eso la Herramienta se escribe genérica y con un solo consumidor. Generalizar el uso, cuando aparezca el segundo caso, no obliga a tocar lo construido.

## Puntos a decidir

1. **Si el cache viaja como Componente de la Base o queda de este repo.** El problema es de cualquier Agente Desplegado con muchos planes, así que en principio viaja; hay que confirmarlo contra qué entra a la Base.
2. **Qué pasa con dos sesiones a la vez** escribiendo el mismo archivo de cache. El plan Local-0110 ya tiene abierto el mismo problema para el directorio de trabajo de las pruebas: conviene resolverlos con el mismo criterio.
3. **Si `sugerir-siguiente-plan` necesita algo propio** o le alcanza con heredarlo de `priorizar-planes`, que es lo que reutiliza.

## Alcance del trabajo

- Herramienta nueva, con su ficha y su fila en el registro de Herramientas (`registrar-herramienta`).
- `funcionalidades/amp-planes/skills/priorizar-planes/SKILL.md` — los dos pasos nuevos y el reporte del ahorro.
- Banco de pruebas de la Herramienta, con escenario sintético (Decisión Local-0075).
- Si viaja: `sincronizar-base` y subir la versión del plugin.

## Origen

Reporte de un Agente Desplegado, 25/08/2026.
