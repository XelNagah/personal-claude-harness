# Por qué las preferencias cargadas no se aplican

**Estado: Nuevo · Creado 26-08-02.** Origen: el usuario, al final de una sesión donde tuvo que señalar tres veces la misma clase de incumplimiento — *"las preferencias de cómo plantearme las cosas, los ejemplos consecuenciales y de negación ni 5 de bola. Algo no está funcionando"*.

## El problema

Tres preferencias fallaron en una misma sesión (02/08/2026) estando **las tres siempre en contexto**:

| Preferencia | Qué pide | Cómo falló |
|---|---|---|
| Base-0001 | ejemplos concretos de cada postura, encadenando consecuencias | se entregaron conteos y categorías; los ejemplos consecuenciales aparecieron recién cuando el usuario los reclamó |
| Base-0002 | una decisión por vez, con el contexto en la respuesta y no en las opciones | tres decisiones independientes metidas dentro de una sola opción |
| Base-0003 | mostrar el texto exacto antes de escribir en un registro canónico | se preguntó *"¿se borra la fila?"* sin poner la fila a la vista |

**Base-0002 ya tiene causa conocida y plan propio:** el texto de `amp:planificar` manda agrupar las preguntas independientes en una tanda, justo lo contrario de la preferencia. Está en [Revisar el modo de preguntar de amp planificar](Revisar%20el%20modo%20de%20preguntar%20de%20amp%20planificar.md), `Nuevo` desde el 25/07/2026 — la falla de hoy es su **segunda ocurrencia documentada**, con el mismo mecanismo.

**Las otras dos fallaron sin que ningún texto del harness las contradijera.** Ese es el caso que ningún plan cubre y el motivo de este.

## Qué hay que averiguar

Si la **carga permanente alcanza** para obedecer una preferencia de forma, o si —como ya está asentado para las reglas de conducta en el conocimiento [modos de falla ante reglas escritas](../../conocimiento/modos-de-falla-ante-reglas-escritas.md)— una regla leída al arrancar **se recita y no se obedece**, y hace falta entregarla en el momento de actuar.

Dato que acota la respuesta: `conducta` ya entrega recordatorios en dos momentos —cada turno y al escribir un archivo—, y el de cada turno **nombra explícitamente las preferencias**. Ninguno de los dos alcanzó. Así que "entregar la regla en el momento" no es, por sí solo, la solución: hay que entender qué distingue un recordatorio que cambia la conducta de uno que se lee y se pasa por alto.

## Evidencia de la sesión

En la misma sesión **se cumplieron** Local-0001 (fechas argentinas), Base-0012 (commit en español sin coautoría), Base-0016 (nombrar qué es cada código al citarlo) y Local-0005 (enumerar en bullets).

Hipótesis que sale de comparar las dos listas: **las cumplidas gobiernan el formato de algo que se produce** (una fecha, un mensaje de commit, la cita de un código); **las falladas gobiernan cómo se le plantea una decisión al usuario**. Producir algo tiene un momento identificable donde la regla aplica; plantear una decisión, no.

**Contraejemplo dentro de la misma sesión, que la hipótesis no explica:** Local-0003 (archivos temporales en `.claude/tmp/`) es de acción y también falló — se escribieron dos archivos de trabajo en el directorio temporal del sistema antes de corregir el rumbo. Es una hipótesis con evidencia de una sesión, no una conclusión.

### Señal retrospectiva del 04/08/2026

Al revisar si la Preferencia Base-0001 (Dar ejemplos concretos de cada postura) debía seguir en la Base pública, el usuario confirmó que es una elección personal reutilizable y agregó: *«no recuerdo que se cumpla mucho esa preferencia, la verdad»*. No identifica una corrida concreta y por eso no cuenta como un caso observable adicional, pero sí confirma que el incumplimiento de la sesión del 02/08/2026 coincide con la percepción acumulada del usuario, no con un episodio aislado.

### Tercera ocurrencia observable del 04/08/2026

En la sesión que migró las elecciones personales fuera de la Base pública, el agente abrió el trabajo pidiendo ratificar la migración de la Preferencia Base-0001 mediante una consulta que citaba Códigos sin decir qué contenían, sin explicar qué cambiaba en la práctica y sin comparar cómo es ahora contra cómo quedaría. El usuario lo cortó: *«¿Vos pensás que esa es la forma correcta de plantearme una decisión? Por alguna razón ignora TODAS mis preferencias»*.

Es la **misma clase de falla que el 02/08/2026 y con las mismas dos Preferencias** —Base-0001 (ejemplos concretos de cada postura) y Base-0002 (contexto en la respuesta, no comprimido en las opciones)—, ambas siempre en contexto. Suma dos datos que la sesión anterior no tenía:

- **El recordatorio de cada turno estaba activo y nombraba las preferencias.** No alcanzó. Refuerza lo ya anotado: entregar la regla en el momento no es por sí solo la solución.
- **La falla ocurrió en el primer turno de trabajo, al retomar desde un traspaso.** El agente venía de leer el traspaso y los registros, y produjo la consulta reutilizando el vocabulario de los documentos —Códigos y nombres de fila— en lugar de traducirlo para el usuario. Es una hipótesis nueva a contrastar: **cuando el contexto inmediato está lleno de texto interno, el agente hereda su registro y le habla al usuario como si fuera otro documento.** Explicaría por qué falla justo la clase de preferencia que gobierna cómo se le plantea algo a una persona, y por qué las que gobiernan el formato de un producto (una fecha, un commit) sobreviven.

Corregida la consulta con contexto, comparación y recomendación, el usuario ratificó sin fricción y la migración avanzó. La falla no fue de comprensión de la regla: el agente pudo enunciarla y aplicarla apenas se la señalaron.

## A resolver

- ¿La distinción "formato de lo que se produce" vs. "forma de plantear una decisión" se sostiene sobre más sesiones, o es casualidad de esta?
- Si se sostiene: ¿qué momento de `conducta` puede atrapar el acto de plantear una decisión? No hay evento de hook para "voy a preguntarle algo al usuario".
- ¿Corresponde que una preferencia de forma tenga un control que la verifique, o eso es chequeo semántico (decisión 0003) y por lo tanto no automatizable barato?
- ¿Cambia algo la **redacción** de la preferencia? Base-0001 y Base-0003 son largas y densas; Local-0001 y Local-0005, que se cumplieron, son cortas y con un ejemplo adentro.
- ¿Se sostiene la hipótesis del 04/08/2026 de que el agente **hereda el registro del texto que acaba de leer**? Si se sostiene, el momento a atrapar no es "voy a preguntar" sino "vengo de leer documentos internos y ahora le hablo al usuario", y el arranque desde un traspaso es su caso más expuesto.
- **Cuando una preferencia y el texto de una habilidad se contradicen, ¿qué gana y quién lo detecta?** Heredada del plan Local-0064 al ejecutarse el 02/08/2026: ahí se arregló la contradicción concreta, pero no el mecanismo. Las dos veces que ese choque produjo la conducta no deseada —25/07/2026 y 02/08/2026— lo detectó el usuario mirando, no un control. `lint-harness` no puede: entender que dos textos se contradicen es chequeo semántico (decisión 0003), así que la guarda barata no existe. Queda por decidir si hay alguna forma más floja de acotarlo —por ejemplo, que una habilidad no pueda enunciar una regla que un registro ya enuncia, solo nombrarla— o si se acepta que dependa de que alguien lo vea.

## Cruces

- [Revisar el modo de preguntar de amp planificar](Revisar%20el%20modo%20de%20preguntar%20de%20amp%20planificar.md) — la causa conocida de Base-0002. **Independiente:** su arreglo es editar un texto y subir la versión, y no debería esperar a esta investigación.
- [Que el harness tenga efecto conductual](Que%20el%20harness%20tenga%20efecto%20conductual.md) — el plan madre del que este es un caso particular: aquel mide el incumplimiento en la demarcación, este en la forma de comunicar.
- [Crecer el subsistema conducta](Crecer%20el%20subsistema%20conducta.md) — si la salida es un momento nuevo, se implementa ahí.
- [Controlar terminologia y preferencias en commits](Controlar%20terminologia%20y%20preferencias%20en%20commits.md) — el mismo eje, acotado a un momento que sí existe.
