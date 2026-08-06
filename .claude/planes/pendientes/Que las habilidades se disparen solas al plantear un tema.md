# Que las habilidades se disparen solas al plantear un tema

**Estado: Nuevo · Creado 26-08-06.** Origen: el usuario, en la sesión del 06/08/2026 — *"cuando yo planteo un tema ya directamente tiene que analizarlo a la luz de la sabiduría del repo sin que yo diga nada. Cuando veo q empieza con cosas raras le tengo que decir? a ver? usa converger terminologia o amp:planificar. Necesito que sea más automático"*.

## El problema

El agente no contrasta lo que el usuario plantea contra los registros del repo hasta que alguien se lo pide por nombre. El usuario tiene que cortar la conversación, darse cuenta de qué habilidad hace falta, y escribirla.

Ubicación exacta del hueco en `conducta`, verificada el 06/08/2026: la regla `Base-0005` contrasta contra la sabiduría del repo, pero está atada al momento **`al escribir`**. Y ese momento, según `MOMENTOS.md`, entrega su texto *"junto al resultado de la tool: es un recordatorio posterior a la escritura"*. Las cinco reglas del momento `cada turno` son otras: respetar preferencias, no acuñar terminología, preguntar antes de redefinir, mantener el archivo de estado y proponer dejar la sesión limpia.

O sea: el contraste existe, pero llega **después de que el agente ya se formó la opinión y la escribió**.

## Las dos hipótesis, ninguna medida

### A — Fallan las listas de disparo, no la autoinvocación

Planteada por el usuario el 06/08/2026 y es la que primero hay que probar, porque si acierta el arreglo es editar texto.

Las descripciones de las habilidades declaran su disparo, y hoy dicen:

- **`amp:planificar`** — *Use when el usuario dice "planificar", "analizá el plan", "cuestionalo", "revisá contra las docs", o después de armar un plan.*
- **`converger-terminologia`** — *Use when el usuario dice "converger terminología", "chequeo de terminología", "revisá los términos" … o cuando en una sesión se detecta que circulan términos ajenos al glosario.*

Casi todos los disparos son **el nombre de la habilidad o un sinónimo cercano**: la habilidad se autoinvoca cuando el usuario ya sabe que existe y cómo se llama. Pero el usuario escribe *"quiero que los planes guarden la prioridad"*, que no matchea ninguna.

⇒ Si es esto, el arreglo es **ensanchar las descripciones** y subir la versión. Barato.

### B — La autoinvocación no alcanza y hace falta un disparo determinista

Es lo que la Decisión Local-0025 dio por sentado. Si con descripciones anchas igual no dispara, el disparo tiene que venir del hook repartidor, que corre siempre y no depende de que el modelo se acuerde.

## La Decisión Local-0025 junta un hecho con una inferencia

Textual:

> *"queda fuera del disparo automático (**un hook no corre skills**, y **un skill que el agente elige invocar recae en el modo 1 «recita sin obedece»**)"*

- **La primera cláusula es un hecho mecánico** y sigue en pie: un hook ejecuta un programa, no invoca una habilidad.
- **La segunda no está medida.** Descansa en una analogía con el conocimiento Local-0001 (Modos de falla ante reglas escritas), que trata de **reglas que el agente lee y no obedece** — otro mecanismo distinto de la autoinvocación por descripción, donde el modelo matchea un texto y el harness carga la habilidad.

⇒ Si la prueba da que dispara, **la segunda cláusula queda refutada y la decisión hay que corregirla**. Es potestad del usuario.

## Por qué no alcanza cargar todo al inicio

Pregunta del usuario en la misma sesión. Medido el 06/08/2026:

| | Peso |
|---|---|
| Contexto de arranque actual | **51,1 KB** (tope 52,0 — margen 0,9 KB) |
| Glosario | 13 KB |
| Terminología Farlopa | 13 KB |
| Decisiones | **69 KB** |
| Planes | 40 KB |
| **Los cuatro registros no cargados** | **135 KB** |

El índice de decisiones solo pesa más que todo el contexto de arranque junto. Cargar los cuatro da ~186 KB contra un tope de 52: casi cuatro veces. Es la misma medición que fundó la Decisión Local-0017.

**El conocimiento ya carga siempre** (los dos índices, 7 KB). Lo que falta es semántica, decisiones y planes.

Y hay un argumento que no depende del tamaño: aunque entraran, cargarlos al arrancar es peor que cargarlos al recibir la consulta, porque al arrancar nadie sabe de qué se va a hablar.

## El diseño del programa que compara

⚠️ **Sin nombre ratificado.** Acá se lo describe, no se lo bautiza: nombrarlo es potestad del usuario (Decisión Local-0016).

Sirve **cualquiera sea la hipótesis que gane**, porque resuelve otra cosa que el disparo: una vez que la habilidad arranca, todavía tiene que leer 135 KB para quedarse con tres filas.

Un programa que toma el mensaje del usuario y devuelve las filas que matchean:

1. Lee el mensaje del campo `prompt` que entrega `UserPromptSubmit`.
2. Carga las celdas `Nombre` + `Descripción` de los registros que no están en contexto.
3. **Normaliza sin acentos** — trampa ya pagada, conocimiento Base-0002: buscar con acentos en Windows devuelve cero sin emitir señal.
4. Puntúa cada fila por cuántas palabras del mensaje aparecen, pesando más el `Nombre`.
5. Corta por umbral y por **tope duro de filas**.
6. Devuelve las filas con su ruta de detalle.

Se apoya en que los Índices están hechos para esto: el `INDICE.md` de conocimiento dice de su celda `Descripción` que *"la enumeración corta de lo que la página cubre se queda, porque la celda es también con lo que se la busca"*.

**Dónde vive según qué hipótesis gane:** si gana A, como paso 1 de la habilidad. Si gana B, dentro del hook repartidor.

### Tres cosas que el diseño tiene que respetar

- **La clase es `Bloquear`, no `Ejecutar`.** `CLASES.md`: `Ejecutar` manda su salida *"a la terminal del usuario … no entra al contexto"*; `Bloquear` *"lo ejecuta y lee su respuesta; si trae `additionalContext`, se combina con las reglas `Inyectar`"*. Probado en vivo: `Base-0011` es `Bloquear` en `cada turno` y su aviso llega al contexto sin frenar nada.
- **No va como programa aparte.** La Decisión Local-0051 midió el descarte: un programa propio en `cada turno` cuesta **48 ms en cada mensaje, para siempre**, mientras que *"el repartidor ya corre ahí y ya es Node"*. Va adentro del repartidor.
- **El reparto ya está fijado.** La máquina marca por término y el agente juzga el significado (manifiesto de semántica). El programa trae candidatos, no veredictos — igual que el corte de la Decisión Local-0060 para los subagentes.

## Lo que hay que resolver

- **Cuál de las dos hipótesis es.** Es lo primero y lo barato.
- **Con qué alcance arranca la comparación.** Los cuatro registros no están en igualdad: semántica pesa 26 KB y decisiones más planes 109 KB. Se preguntó y quedó sin responder.
- **Si semántica merece cargar siempre**, subiendo el tope de 52 a ~78 KB. Lo pidió el usuario en la misma sesión —*"tiene que saber evitar la Deriva Semántica, así que tiene que estar en contexto"*— pero el costo lo paga cada Agente Desplegado en cada turno, para siempre, y va en la dirección opuesta a la Decisión Local-0017. **Es del usuario:** `medir-contexto` declara que el tope no es de un Agente Desplegado para mover.
- **El umbral de la comparación.** Es el riesgo principal: si matchea flojo inyecta filas irrelevantes en cada turno y el usuario aprende a ignorarlas — el mismo modo de falla que ya está documentado para las reglas.
- **La clase `Bloquear` no describe lo que hace.** `Base-0011` la usa sin bloquear nada (su propia Descripción dice *"nunca frena nada"*). Renombrarla es redefinir algo canónico y lo ratifica el usuario. Anotado, sin tocar.
- **La Decisión Local-0025 acepta fugas en la conversación** —*"la conversación es efímera, bajo daño"*—. El pedido del usuario objeta esa premisa: el daño lo paga su atención en cada turno. Hay que precisarla.
- **«sabiduría del repo» no está en el glosario.** Circula en los títulos de dos planes y en la regla `Base-0005`. El barrido del 06/08/2026 ya lo marcó como candidato sin canónico asentado.

## Pasos

1. **Medir cuál hipótesis es**, en sesión limpia — una sesión donde ya se nombraron las habilidades está contaminada para probar si disparan solas. Mensajes que no nombran ninguna: *"quiero que los planes guarden la prioridad"*, *"esto lo llamaría capa de configuración"*. Ver si `amp:planificar` y `converger-terminologia` disparan.
2. Repetir con las descripciones ensanchadas y comparar. Si dispara, gana A.
3. Según el resultado: ensanchar descripciones (A) o llevar el disparo al hook repartidor (B).
4. Construir el programa que compara, con el alcance y el umbral ya decididos.
5. Si ganó A, **corregir la Decisión Local-0025** — su segunda cláusula queda refutada.

## Planes relacionados

- [Banco de pruebas conductual de mecanismos](Banco%20de%20pruebas%20conductual%20de%20mecanismos.md) (Local-0027) — **es el instrumento del paso 1**: correr un agente real y medir si una regla escrita efectivamente dispara.
- [Por que las preferencias cargadas no se aplican](Por%20que%20las%20preferencias%20cargadas%20no%20se%20aplican.md) (Local-0004) — el mismo eje sobre las preferencias de forma; comparten la pregunta de qué distingue un recordatorio que cambia la conducta de uno que se pasa por alto.
- [Crecer el subsistema conducta](Crecer%20el%20subsistema%20conducta.md) — Diferido, y **su condición de reanudación es justamente esta señal**: uso acumulado que muestre si las reglas activas cambian la conducta.
- [Skill contrastar - contraste contra la sabiduria del repo](Skill%20contrastar%20-%20contraste%20contra%20la%20sabiduria%20del%20repo.md) (Local-0038) — la habilidad que produciría el contraste; este plan resuelve cómo se dispara.
- [Que el harness tenga efecto conductual](Que%20el%20harness%20tenga%20efecto%20conductual.md) — el plan madre de la medición.
