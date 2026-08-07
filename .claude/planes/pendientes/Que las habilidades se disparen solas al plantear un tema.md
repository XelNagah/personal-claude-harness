# Que las habilidades se disparen solas al plantear un tema

**Estado: En curso · Creado 26-08-06.** Origen: el usuario, en la sesión del 06/08/2026 — *"cuando yo planteo un tema ya directamente tiene que analizarlo a la luz de la sabiduría del repo sin que yo diga nada. Cuando veo q empieza con cosas raras le tengo que decir? a ver? usa converger terminologia o amp:planificar. Necesito que sea más automático"*.

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

## Estado

Medición del 06/08/2026: banco completo de la Herramienta `probar-disparo-de-skills` (Local-0012) sobre las dos descripciones ya reescritas por situación, publicadas e instaladas (`amp` 0.38.0, `amp-semantica` 0.12.0). Seis consultas, cada una en sesión limpia propia:

| Consulta | Esperado | Observado | Resultado |
|---|---|---|---|
| planificar-01 «quiero que los planes guarden la prioridad» | dispara `planificar` | contestó sin usar ninguna herramienta | **FALLA** |
| planificar-02 «se me ocurre que los lints deberían correr solos cuando termino una tarea» | dispara `planificar` | contestó sin usar ninguna herramienta | **FALLA** |
| planificar-03 «cuántos planes pendientes hay» | no dispara | usó `Bash` | OK |
| planificar-04 «corré el control de cierre» | no dispara | usó `PowerShell` | OK |
| converger-01 «a la carpeta que viaja adentro del plugin la llamaría capa de instalación» | dispara `converger-terminologia` | contestó sin usar ninguna herramienta | **FALLA** |
| converger-02 «dónde está el archivo del glosario» | no dispara | contestó sin disparar | OK |

**Conclusión: gana la hipótesis B — con un matiz medido después.** Las tres consultas que debían disparar no dispararon ni con las descripciones por situación. Esta conclusión sí es válida: a diferencia de la prueba anterior, las descripciones medidas ya no eran frases-comando. Las tres negativas no dispararon de más, así que el banco no acusa falsos positivos ni sobredisparo.

**El matiz (investigación del 06/08/2026):** dos estudios independientes con la misma metodología que este banco (sesiones reales + verificar la tool `Skill`) muestran que lo probado acá es la variante «situacional» de la description, y que existe una variante **directiva** sin medir: «SIEMPRE invocá esta skill cuando… No hagas X directamente — invocá esta skill primero». Números ajenos: activación de base ~50% (issue anthropics/claude-code#9716); description situacional con más disparadores, pobre; **directiva con restricción negativa, 100% sin hook** (Seleznov, 650 sesiones, feb 2026); hook de instrucción simple 20%, hook de evaluación forzada con compromiso en 3 pasos 84% (Spence, 200+ pruebas, nov 2025); un hook de puntaje que inyecta candidatas puede **bajar** la activación 30 puntos si el texto describe el trabajo en vez de ordenar usar la tool.

**Rama A′ medida el mismo día: también refutada.** Se reescribieron las dos descriptions en forma directiva («SIEMPRE invocá… No hagas X directamente — invocá esta skill primero»), se publicaron (`amp` 0.39.0, `amp-semantica` 0.13.0) y se verificó con una sesión real que una sesión nueva ve el texto nuevo completo, sin recorte. Resultado: **0/3** — planificar-01, planificar-02 y converger-01 contestaron sin usar ninguna herramienta, igual que con el texto situacional. Las negativas no se re-corrieron: con cero disparos positivos no hay sobredisparo que medir y cada consulta cuesta cuota. El 100% del estudio externo no replica en este entorno; las diferencias candidatas, sin aislar: skills de plugin con prefijo (`amp:planificar`) contra skills de proyecto, cantidad de skills instaladas en esta máquina (~40 entre todos los marketplaces), descriptions en español, y el modelo que usa `--print`. **Con A y A′ refutadas, queda B: el disparo va al hook repartidor**, con el formato de evaluación forzada con compromiso (84% medido afuera), nunca instrucción simple (20%) ni texto que describa el trabajo (empeora).

Sobre la Decisión Local-0025: no queda refutada — su segunda cláusula ahora tiene una medición que la apoya, aunque sigue mezclando el hecho mecánico con la inferencia y conviene precisarla al corregirla por el punto de las fugas.

**Diseño acordado el 07/08/2026 (sin construir todavía).** Con B ganada, se aterrizó el disparo contra el repartidor `establecer-conducta.js`:

- **Skills en la evaluación forzada: `amp:planificar` + `converger-terminologia`, solo esas dos.** Los otros seis subsistemas no entran: preferencias y conducta ya están en contexto / los entrega el hook (no hay skill que disparar); subsistemas y herramientas tienen su índice cargado y sus skills son operaciones estructurales; decisiones y conocimiento se consultan, y esa lectura ya la hace `amp:planificar` al entrar —lee semántica completa (glosario + Terminología Farlopa), decisiones y conocimiento, según su SKILL líneas 14-15 y 39— más el comparador del paso 5. **El patrón:** entra a la evaluación forzada solo el subsistema con una skill que dispara *al plantear un tema*; los demás disparan en otros momentos (al cerrar, al fabricar, al persistir).
- **El disparo es una regla `Inyectar` nueva en `cada turno`, en `INDICE.md` (Agente Multipropósito):** texto fijo con el formato de evaluación forzada con compromiso, costo cero de proceso (el repartidor ya emite `additionalContext` en ese momento). Va en el Índice del Agente Multipropósito porque es mecánica del harness que viaja a todo Agente Desplegado, no Propósito de este repo.
- **El comparador (paso 5) va dentro del repartidor, no como regla `Bloquear`:** una `Bloquear` es un programa aparte (`execSync`) = los 48 ms que la Decisión Local-0051 descartó. Es código del Agente Multipropósito.
- **Secuencia: paso 4 solo primero, medirlo con `probar-disparo-de-skills`, y recién después el paso 5.** El estudio externo advierte que inyectar filas describiendo el trabajo puede bajar la activación 30 puntos; mezclarlo con el disparo impediría saber qué efecto ganó. Y el 84% del hook no está garantizado en este entorno —A′ dio 0/3 y el 100% externo no replicó—, así que hay que medirlo aislado.
- **Queda abierto:** el formato exacto del texto de la regla, y cómo convive con las seis reglas `Inyectar` que ya se inyectan en `cada turno` (compiten por atención).

**Paso 4 construido y medido el 07/08/2026 — B también refutada, 0/3.** Se redactó la regla `Inyectar` `Base-0012` (Disparar la skill de contraste al plantear un tema) en `conducta/INDICE.md`, con el formato de evaluación forzada con compromiso en 3 pasos (evaluá → comprometeté → invocá antes de responder), skills `amp:planificar` + `converger-terminologia`. Se sincronizó a la Base (`amp`). **No se publicó** —midió sobre este repo, donde el hook lee `INDICE.md` vivo—.

Banco completo (6 consultas, sesión limpia por consulta):

| Consulta | Esperado | Observado | Resultado |
|---|---|---|---|
| planificar-01 | dispara `planificar` | contestó sin herramienta | **FALLA** |
| planificar-02 | dispara `planificar` | contestó sin herramienta | **FALLA** |
| planificar-03 | no dispara | contestó sin herramienta | OK |
| planificar-04 | no dispara | contestó sin herramienta | OK |
| converger-01 | dispara `converger-terminologia` | contestó sin herramienta | **FALLA** |
| converger-02 | no dispara | contestó sin herramienta | OK |

**0/3 de las que deben disparar; 0/3 de sobredisparo.** Igual que A (0/3) y A′ (0/3).

**El hook sí llegó — verificado, no supuesto.** Dos controles: (1) `establecer-conducta.js` alimentado con un `UserPromptSubmit` emite el texto de `Base-0012` (`REGLA-0012-PRESENTE`); (2) una sesión `claude --print` preguntada directamente contestó **SI** a que ve en su contexto el recordatorio de la «evaluación en 3 pasos». La regla se inyecta y el modelo la lee. **No la obedece.**

**Conclusión: los tres mecanismos de disparo automático fallan igual (0/3), y el modo de falla ahora está aislado — no es que el texto no llegue, es que el modelo lo lee y no actúa.** Es el modo 1 «recita sin obedece» del conocimiento Local-0001, medido directamente sobre el hook. La Decisión Local-0025 —«un skill que el agente elige invocar recae en el modo 1»— queda con apoyo medido directo, no ya por analogía. El 84% de Spence (evaluación forzada) no replica acá, igual que el 100% de Seleznov (A′) no replicó. Diferencias candidatas sin aislar, las mismas de A′: skills de plugin con prefijo, ~40 skills instaladas, español, y el sesgo de `--print` a la respuesta directa de un solo turno.

**Lo que queda vivo del plan, gane quien gane el disparo:** el comparador (paso 5) que inyecta las filas relevantes de los 135 KB no cargados. Reencuadre a decidir con el usuario: si ningún mecanismo hace que el modelo *invoque* la skill, el hook puede **saltear la skill** e inyectar directo el material del contraste (filas candidatas de semántica y decisiones) al contexto — el contraste ocurre sin que el modelo tenga que «decidir» invocar nada. Eso convierte el paso 5 de acelerador en el mecanismo mismo.

**Reencuadre acordado el 07/08/2026 — el comparador pasa a ser el mecanismo (ratificado por el usuario).** Con los tres disparos refutados (0/3), se adopta el reencuadre: el programa que compara **inyecta directo** las filas candidatas del contraste al `additionalContext` del momento `cada turno`, en vez de alimentar a una skill que no se invoca. El contraste ocurre inline, sin que el modelo tenga que decidir invocar nada; deja de ser acelerador y es el mecanismo. Fundamento: no descansa en el modo de falla medido (leer una orden y no actuar), sino en la presencia de material en contexto —la misma vía por la que ya operan las preferencias y los índices de conocimiento siempre cargados—. **No pelea con la Decisión Local-0017 (modelo de carga de contexto): la honra** — no carga índices pesados siempre, sino unas pocas filas relevantes al recibir la consulta, que es lo que 0017 prefiere.

Decisiones de diseño de esta sesión:

- **Alcance: semántica (glosario + Terminología Farlopa) + decisiones.** Las tres consultas positivas del banco lo prueban solas: planificar-01 pega en la Decisión Local-0005 (prioridad absorbida en el estado), converger-01 en Terminología Farlopa Local-0034 (`capa de instalación`=fase, vetado exacto), planificar-02 en las Decisiones Local-0003/Local-0008 (lints). Son los dos registros que leen las skills que el reencuadre reemplaza. **Planes queda afuera** (mayor movimiento, filas de estado transitorio = ruido; ningún caso positivo lo pide; aditivo, se suma si hace falta). **Conocimiento queda afuera** (ya cargado siempre; apuntar su detalle sería «andá a leer esto» = una acción, el modo de falla que el reencuadre evita).
- **Umbral: precisión primero.** Umbral alto, silencio cuando no hay match fuerte, tope duro bajo (2-3 filas); normaliza sin acentos (conocimiento Base-0002), descarta palabras vacías, pesa más el `Nombre`. La mayoría de los turnos no inyecta nada. Fundamento: un registro que marca todo entrena a ignorarlo (Terminología Farlopa; Decisión Local-0044, una fila se califica por lo que acierta).
- **El instrumento de medición cambia.** El comparador es determinista, así que la calidad de selección se prueba con un banco `pruebas.js` (mensaje → filas esperadas), sin costo de sesión, y ahí se calibra el umbral. La Herramienta `probar-disparo-de-skills` ya **no** aplica: mide si una skill dispara, y el reencuadre no dispara ninguna. Que el modelo *use* las filas inyectadas es la apuesta blanda (presencia = conducta), que sí necesita sesiones reales.
- **Resuelto de la sabiduría, no se re-abre:** vive dentro del repartidor `establecer-conducta.js` (la Decisión Local-0051 descartó el programa aparte, 48 ms/turno); **no agrega clase** a `CLASES.md` (mecánica interna que escribe en `additionalContext`, como el Buzón de Avisos de Local-0051); reusa `common/indices.js` + `common/frontmatter.js` para leer las celdas (Preferencia Local-0012, conocimiento Local-0016 no inventar soluciones particulares); Node nativo sin dependencias (Decisión Local-0047); va del lado del Agente Multipropósito (mecánica del harness que viaja a todo Agente Desplegado).
- **Terminología barrida:** `crux` y `just-in-time`, anglicismos que el agente metió en esta sesión, se vetaron en Terminología Farlopa (Local-0047 `bloquea`, Local-0048 `avisa`).

Pendiente para construir: el comparador dentro de `establecer-conducta.js` + su banco `pruebas.js`; **nombrarlo** (potestad del usuario, Decisión Local-0016); y precisar la Decisión Local-0025 en el punto de las fugas de la conversación, que el pedido del usuario objeta.

**Comparador construido y medido el 07/08/2026 — banco verde, sin costo de sesión.** Se escribió el comparador dentro de `establecer-conducta.js` (rama `cada turno`), con su banco en la `pruebas.js` co-ubicada del repartidor (subió de 26 a 38 casos, el conteo pasó a dinámico). Todo el control de cierre da verde (11 chequeos, incl. `lint-harness` y el banco de `ejecutar-pruebas`). El README del repartidor documenta el mecanismo. Sincronizado a la Base (`amp`); **no publicado** (mide sobre este repo).

Cómo quedó, decisión por decisión:

- **Dónde vive:** función `contrastar(data)` dentro del repartidor, invocada solo en `cada turno`; su salida se suma al `additionalContext` de las reglas `Inyectar`. Cero proceso nuevo. No agrega clase.
- **Qué lee:** las celdas `Nombre` + `Descripción` de `GLOSARIO.md`, `TERMINOLOGIA-FARLOPA.md` y `decisiones/INDICE.md`, vía `common/indices.js` (ubica columnas por encabezado, no por posición) — reuso, no reimplementación.
- **Cómo puntúa (calibrado, no supuesto):** puntaje **idf** (cada palabra pesa por lo rara que es en el corpus de los tres registros) con el `Nombre` pesando ×3 sobre la `Descripción`. Esto resuelve la precisión que un conteo de palabras plano no podía: distingue una palabra discriminante (`prioridad`, `capa`) de una genérica (`plugin`, `control`). Umbral 7,0 y tope duro 3, calibrados con un experimento contra las tres consultas positivas del plan y los negativos.
- **Qué elige (medido):** planificar-01 «…los planes guarden la prioridad» → encabeza la Decisión Local-0005 (estados de planes); planificar-02 «…los lints deberían correr solos…» → la Decisión Local-0008 (lints co-ubicados); converger-01 «…la llamaría capa de instalación» → la relación vetada Local-0034 (capa=fase). Los saludos, «cuántos planes pendientes hay» y «qué hora es» → **silencio**.
- **Normaliza sin acentos** para tolerar que el usuario los omita; el precio es que fusiona homógrafos (`termino`/`término`), que a veces suma una fila de baja relevancia detrás de la correcta — el tope duro la contiene.
- **Roce con la Decisión Local-0024 resuelto:** citar `Decisión NNNN` en texto que viaja cuelga en el repo destino. El comparador y su banco enuncian la razón inline sin el número; el banco arma en runtime el patrón que verifica la Preferencia Base-0016 para no dejar la adjacencia literal.

**Nombrado el 07/08/2026 (ratificado por el usuario):** el mecanismo es el **Contraste automático** (glosario Local-0036). Se evaluó `el comparador` como alias y **se descartó**: el usuario objetó que no dice qué compara con qué; no quedó en Propuestos. La función en código sigue siendo `contrastar` (verbo llano, identificador). Con esto la Decisión Local-0016 queda satisfecha para este mecanismo.

**Sigue pendiente (potestad del usuario):** **precisar la Decisión Local-0025** en el punto de las fugas de la conversación, que el pedido del usuario objeta. Apuesta blanda sin medir aún: que el modelo *use* las filas inyectadas (presencia = conducta) — necesita sesiones reales, no el banco.

## Pasos

1. ~~**Medir cuál hipótesis es**, en sesión limpia~~ — **hecho el 06/08/2026**: ninguna habilidad disparó con las descripciones viejas (sesión `c83db9c5`).
2. ~~Repetir con las descripciones ensanchadas y comparar~~ — **hecho el 06/08/2026**: tampoco disparan (ver `## Estado`). **Gana B.**
3. ~~**Rama A′, antes de pagar el hook:** reescribir las dos descriptions en forma directiva y repetir el banco~~ — **hecho el 06/08/2026: refutada, 0/3** (ver `## Estado`). Las descriptions directivas quedan publicadas igual: no empeoran nada y documentan la mejor forma conocida del texto.
4. Llevar el disparo al hook repartidor (B) — regla `Inyectar` nueva en `cada turno`, en `INDICE.md`, con el formato de evaluación forzada con compromiso (84% medido afuera), nunca instrucción simple (20%) ni texto que describa el trabajo (empeora). **Decidido el 07/08/2026** (ver `## Estado`): las skills son `amp:planificar` + `converger-terminologia`; el disparo va como regla `Inyectar`. **Falta:** redactar el texto exacto, publicar, y medir con `probar-disparo-de-skills` **antes** de tocar el paso 5. Resolver al redactar: cómo convive con las seis reglas `Inyectar` que ya viven en `cada turno`.
5. **Construir el comparador dentro del repartidor `establecer-conducta.js`** (no como regla `Bloquear`: 48 ms de la Decisión Local-0051), con el reencuadre, el alcance (semántica + decisiones) y el umbral (precisión primero) **acordados el 07/08/2026** (ver `## Estado`). Ya no es acelerador: con los tres disparos refutados, **es el mecanismo** — inyecta directo las filas candidatas al `additionalContext` de `cada turno`. ~~Escribir el comparador + su banco `pruebas.js`~~ — **hecho el 07/08/2026: banco verde (38 casos), control de cierre en verde** (ver `## Estado`). ~~Nombrarlo~~ — **hecho: Contraste automático (glosario Local-0036)**. **Falta, potestad del usuario:** precisar la Decisión Local-0025 (fugas de la conversación).
6. ~~Si ganó A, **corregir la Decisión Local-0025**~~ — no ganó A; la segunda cláusula quedó apoyada por la medición, no refutada. Si A′ replica el 100%, reabrir este punto.

## Planes relacionados

- [Banco de pruebas conductual de mecanismos](Banco%20de%20pruebas%20conductual%20de%20mecanismos.md) (Local-0027) — **es el instrumento del paso 1**: correr un agente real y medir si una regla escrita efectivamente dispara.
- [Por que las preferencias cargadas no se aplican](Por%20que%20las%20preferencias%20cargadas%20no%20se%20aplican.md) (Local-0004) — el mismo eje sobre las preferencias de forma; comparten la pregunta de qué distingue un recordatorio que cambia la conducta de uno que se pasa por alto.
- [Crecer el subsistema conducta](Crecer%20el%20subsistema%20conducta.md) — Diferido, y **su condición de reanudación es justamente esta señal**: uso acumulado que muestre si las reglas activas cambian la conducta.
- [Skill contrastar - contraste contra la sabiduria del repo](Skill%20contrastar%20-%20contraste%20contra%20la%20sabiduria%20del%20repo.md) (Local-0038) — la habilidad que produciría el contraste; este plan resuelve cómo se dispara.
- [Que el harness tenga efecto conductual](Que%20el%20harness%20tenga%20efecto%20conductual.md) — el plan madre de la medición.
