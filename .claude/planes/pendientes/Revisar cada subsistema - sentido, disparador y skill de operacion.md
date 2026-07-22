# Revisar cada subsistema — sentido, disparador y skill de operación

**Estado: Nuevo · Creado 26-07-21.** Origen: el piloto de `conocimiento` del 21/07/2026, que arregló un subsistema muerto y **dejó el molde** de cómo se ve el arreglo. Este plan lo aplica a los otros seis.

## Por qué existe

`conocimiento` llevaba semanas en **0 páginas** con el lint en verde y 15 planes ejecutados al lado. No era desidia del agente: era que el subsistema no tenía con qué dispararse. El diagnóstico se verificó contra el código, no se supuso.

**La regla que salió de mirar los siete juntos:** un subsistema se puebla si tiene **al menos una** de estas dos cosas.

1. **Un disparo proactivo** en la `description` de su skill — *"al cerrar una tarea que dejó aprendizajes"*, *"al detectar en la conversación una decisión que se está por perder"*, *"cuando el usuario corrige lo mismo por segunda vez"*.
2. **Un componente físico cuya ausencia el lint detecta.** `herramientas` no tiene skill y aun así tiene 8 entradas: cuando creás un script queda una carpeta en el disco y `lint-herramientas` grita si no tiene fila. El disco delata la omisión.

`conocimiento` no tenía ninguna de las dos, y **no puede tener la segunda**: el conocimiento que nunca se escribió no deja rastro, y un índice vacío es perfectamente coherente para cualquier lint. Es el único subsistema mecánicamente ciego a su propia ausencia — por eso era el único en cero.

## El molde (lo que se hizo en el piloto)

El arreglo de `conocimiento` fue de **tres patas**, y las tres hicieron falta:

| Pata | Qué se agregó | Por qué |
|---|---|---|
| **Skill de registro** | `registrar-conocimiento`, con la demarcación como paso 1 | Solo existía `buscar-conocimiento`: un barrido masivo a demanda que nadie invoca. Faltaba "asentá **esto**, ahora" |
| **Línea en `planificar`** | que **escriba** conocimiento, no solo lo lea | `planificar` leía los tres registros y escribía dos. El que leía sin escribir era el que estaba en cero |
| **Disparador en `AGENTS.md`** | *cuándo* asentar, no solo dónde vive | La sección describía una carpeta. Describir una carpeta no hace que nadie la llene |

Más la propagación: la memoria que viaja, el orquestador, y verificación **por hash**, no por lectura.

## Estado de los siete (21/07/2026)

| Subsistema | Skill de operación | Verbo | Disparo proactivo | Entradas |
|---|---|---|---|---|
| planes | `ciclo-de-plan` | mueve **uno** | sí | 34 |
| glosario | `converger-terminologia` | barre **todo** | + lo escribe `planificar` | 21 |
| decisiones | `registrar-decision` | asienta **una** | sí, + `planificar` | 13 |
| memoria | `registrar-memoria` | asienta **una** | sí | 9 |
| herramientas | **ninguna** | — | no (lo sostiene el lint) | 8 |
| preferencias | `registrar-preferencia` | asienta **una** | sí | 2 |
| conocimiento | `registrar-conocimiento` + `buscar-conocimiento` | asienta **una** + barre | **recién puesto** | 1 |

## Qué revisar, subsistema por subsistema

Seis preguntas por cada uno:

1. **Sentido** — ¿qué es y cuándo se usa, en una frase que no se solape con la de ningún otro? Es lo que hace que el agente no discuta ni elija mal.
2. **README** — ¿dice eso mismo? ¿está al día?
3. **Disparador** — ¿existe? ¿está en la `description` de la skill **y** en la sección de `AGENTS.md`?
4. **Skill de operación** — ¿hay una que asiente **uno**? ¿Y una que barra todo? ¿Hacen falta las dos?
5. **Hook / momento** — ¿hay un momento del ciclo de trabajo donde debería dispararse solo (arranque, cierre de tarea, pre-commit)?
6. **Lint** — ¿detecta la ausencia, o solo la incoherencia de lo que ya está?

## Huecos ya detectados (entran a este plan sin re-analizar)

- **`herramientas` no tiene ninguna skill de operación.** Hoy lo sostiene el lint. ¿Alcanza, o le falta una `registrar-herramienta`?
- **`glosario` y `decisiones` no tienen skill de registro unitario propia** — dependen de que corra `planificar`. Si el trabajo no pasa por `planificar`, no se asientan. `registrar-decision` sí existe; el glosario **no tiene equivalente**.
- **El solapamiento `memoria` ↔ `conocimiento` quedó resuelto** (la prueba «¿seguiría siendo cierto si este repo no existiera?») **pero solo está escrito del lado de `conocimiento`.** La memoria no menciona el corte. Los sentidos tienen que declararse de los dos lados o vuelven a solaparse.
- **Dónde vive el estado de una Herramienta.** Caso real sin resolver: `sessions.json` en `Agente-Coordinador` es estado vivo (runtime) de dos Herramientas, no es script ni dato de dominio, y ningún subsistema lo acepta. Se discutió varias veces sin conclusión porque el harness no contesta la pregunta.

## Cruces con otros planes

- **[Revisar la nomenclatura de los subsistemas](Revisar%20la%20nomenclatura%20de%20los%20subsistemas.md) — bloquea parcialmente.** Si de acá salen skills nuevas, hay que **fijar antes el patrón de nombre**, o nacen con el problema de `ciclo-de-plan` (*"lo leo y no sé qué es eso"*). El patrón que funciona es **verbo + objeto**: `registrar-memoria`, `buscar-conocimiento`.
- **[Lint unificado parametrizable](Lint%20unificado%20parametrizable%20por%20capacidad%20de%20subsistema.md).** La pregunta 6 (¿el lint detecta la ausencia?) es una capacidad nueva a parametrizar, no solo una limpieza de código.
- **[Subsistemas que explican cómo funcionan y su estado](Subsistemas%20que%20explican%20como%20funcionan%20y%20su%20estado.md).** La pregunta 1 (sentido en una frase, sin solape) es exactamente el insumo de ese plan.

## Preguntas abiertas

- ¿Todo subsistema necesita las dos skills (asentar una + barrer todo), o depende de si su contenido deja rastro en el disco?
- ¿Los disparadores por `description` de skill alcanzan, o hace falta el momento explícito (hook)? **Esto lo contesta la medición del piloto**, no una discusión: si `conocimiento` sube solo en las próximas semanas, alcanzan.
- ¿Se revisa de a uno con ratificación fila por fila, o se propone el barrido completo y se ratifica al final?
- ¿Entra acá el hueco del estado de Herramientas, o es un subsistema que falta y merece plan propio?
