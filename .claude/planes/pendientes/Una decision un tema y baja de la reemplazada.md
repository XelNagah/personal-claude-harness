# Una decisión, un tema — y baja de la reemplazada

**Estado: Análisis · Creado 26-07-26 · En Análisis desde 26-09-04.** Origen: conversación del 26/07/2026 al asentar la Decisión Local-0035 (el Agente Multipropósito se instala con alcance local), que modifica una cláusula de la Decisión Local-0029 (empaquetado en un plugin por subsistema).

## El problema

Para saber **qué rige hoy** sobre el alcance de instalación hay que leer tres filas encadenadas: **Decisiones Local-0013 → Local-0029 → Local-0035**. La convención actual dice que la decisión vieja no se edita ni se borra, y eso preserva el porqué —sin él, la próxima sesión lee "project = install for all collaborators", le suena razonable y vuelve a decidir lo mismo—, pero **el costo de lectura crece con cada modificación** y lo paga cada consulta.

Hoy la fila vieja queda `vigente` con una nota entre paréntesis: o sea, **marcada como vigente algo que en parte ya no rige**.

## La dirección acordada

- **Una decisión = un tema.**
- Al modificar, la decisión nueva **reenuncia el tema entero**, no solo el delta.
- La vieja pasa a **`reemplazada por NNNN`** (el estado ya existe en el registro).
- Para saber qué rige, **leer las `vigente` alcanza**.

---

## Análisis (04/09/2026)

### Lo medido en el registro

Datos verificados sobre `.claude/decisiones/INDICE.md` al 04/09/2026:

- **80 decisiones** (Local-0001 a Local-0080), **103 KB**. Es el segundo Índice más pesado del repo y **no se carga siempre**: lo lee entero cada consulta — `amp:planificar`, el subagente `contrastador`, el Contraste automático de cada turno.
- **Cuatro filas** llevan hoy el estado `reemplazada por`: Local-0005→0057, Local-0022→0023, Local-0064→0065, Local-0071→0076. Son reemplazos **enteros**, y funcionaron: nadie tuvo que encadenar nada.
- **Tres filas** están `vigente` con una cláusula caída, declarada en una nota entre paréntesis dentro de la Descripción. Son exactamente estas y no hay más:

  | Fila vigente | Cláusula caída | Quién la modificó |
  |---|---|---|
  | Local-0002 (Patrón de subsistema) | "el `INDICE.md` va siempre en contexto" | Local-0017 |
  | Local-0013 (Segmentación por prefijo) | el prefijo pelado (`memoria:`) | Local-0029 |
  | Local-0029 (Empaquetado en un plugin por subsistema) | el alcance (`project`) | Local-0035 |

  Las tres notas se detectan mecánicamente: son las únicas ocurrencias del patrón *(La cláusula … fue **modificada por** / **revisada por** NNNN …)*.

**Consecuencia de dimensionamiento, y es la que cambia el plan:** el problema activo son **tres filas**, no ochenta. Una decisión multi-tema que nadie modificó parcialmente no le cuesta nada a nadie — su costo aparece recién el día que alguien le toca una cláusula. Así que el barrido del registro entero, que el plan daba por implícito al decir "la regla solo funciona si cada decisión es de un tema", **no hace falta**: alcanza con la convención a futuro más estas tres.

### El hueco central: qué cuenta como "un tema"

El plan dice "la Decisión Local-0029 decide cuatro cosas a la vez" y las enumera —empaquetado en 7 plugins, bundle por dependencias, alcance, consolidación de los `inicializar-<sub>`—, pero **no da el criterio con que se llegó a cuatro**. Sin criterio la regla es inaplicable: la misma fila se puede partir en dos o en ocho, y cada sesión va a partirla distinto.

El test que se propone —y que hace falta ratificar, es la decisión 1 de abajo— es **de reemplazabilidad, no de contenido**: *una decisión es de un tema si se la puede dar de baja entera sin arrastrar nada que siga rigiendo*. La unidad de tema es la unidad de baja, porque la baja es para lo que la regla existe. Aplicado a la Local-0029 da exactamente las cuatro que el plan enumera: la Local-0035 dio de baja el alcance y **no** pudo llevarse el resto, y eso es lo que prueba que el resto son temas aparte.

### Las tres relaciones entre decisiones, hoy mezcladas

El registro usa **seis verbos** para relacionar decisiones, sin distinción declarada: *reemplaza* (0057, 0023, 0065, 0076), *modifica* (0029→0013, 0035→0029), *revisa* (0017→0002), *refina* (0029→0009), *extiende* (0018→0004, 0019→0017, 0023→0019, 0025→0021/0018, 0028→0001, 0061→0015, 0066→0036), *precisa* (0062→0025, y esa fila aclara "sin reemplazarla").

Debajo de los seis verbos hay **tres relaciones distintas**, y la regla del plan alcanza solo a dos:

| Relación | Qué le pasa a la vieja | Dónde se asienta hoy | ¿La toca esta regla? |
|---|---|---|---|
| **Reemplaza** — la nueva enuncia el mismo tema entero | deja de regir | columna `Estado` | sí, ya funciona |
| **Modifica una cláusula** — la nueva enuncia parte del tema | rige a medias | nota entre paréntesis en la Descripción | **sí, es el problema** |
| **Extiende** — la nueva agrega un tema vecino | rige entera | frase suelta en la Descripción de la nueva | **no**, y hay que decirlo |

Si esto no queda declarado, el barrido va a querer partir la Local-0004 porque la Local-0018 "la extiende", y la Local-0004 no tiene ninguna cláusula caída. **Extender no da de baja nada.** Es la decisión 3 de abajo.

### Correcciones al alcance que declaraba el plan

- **`feedback_decisiones.md` ya no existe.** El subsistema `memoria` se retiró (Decisión Local-0036) y ese archivo no está en el repo. Ese ítem del alcance caducó: se elimina.
- **`lint-decisiones` valida hoy los reemplazos** (su chequeo `[4] REEMPLAZOS ROTOS`), con una expresión que captura **un solo número** después de `reemplazada por`. Al partir la Local-0029 en cuatro, la vieja queda reemplazada por cuatro decisiones y esa expresión captura solo la primera. Es la decisión 4 de abajo.
- **El `MANIFIESTO.md` y el `README.md` de `decisiones` describen el reemplazo entero** ("para revertir no se borra, se marca `reemplazada por NNNN`") y no mencionan la modificación parcial. No la contradicen: la ignoran. Sumar la regla nueva es aditivo en los dos.
- **La habilidad `registrar-decision` sí hay que tocarla**: su paso 2 dice "¿Contradice una vigente? → la nueva **reemplaza**", y no contempla el caso de contradecir *una parte*, que es el que produjo esta deuda tres veces.

### Lo que se descubre al partir la Local-0029

Su Descripción tiene además **datos numéricos vencidos**: dice "**12 plugins → 7**" y "los 6 `amp-<sub>`", cuando hoy el marketplace lista **10** plugins (`amp` más nueve `amp-<sub>`, según `AGENTS.md` y `.claude-plugin/marketplace.json`). Ya lo había detectado el plan ejecutado *Resolver los once hallazgos del análisis crítico del repo*, que anotó "hoy son 9" en su momento y no lo corrigió.

Esto no es un descuido de esa fila: es la falla que describe el conocimiento Base-0001 (evitar el mismo dato escrito en varios lugares). **Al reenunciar, el conteo de plugins no se copia**: la decisión fija la *forma* (un plugin transversal más uno por subsistema con habilidad de operación), y el número vive en el marketplace, que es donde se cuenta solo.

### Citas por barrer

Al dar de baja la Local-0029 hay que revisar quién la nombra. Medido: **fuera del propio Índice hay 12 apariciones de "0029"**, y la mayoría no son trabajo —

- **9 en planes ejecutados o descartados**: no se tocan (son registro histórico de lo que pasó).
- **2 en planes pendientes**: *Barrer la terminología hallada en preferencias y subsistemas* y *Canal de instalación por copia*.
- **0 en lo que viaja en `base/`**: coherente con la Decisión Local-0024 (el texto distribuido no cita decisiones del harness).
- Las otras coincidencias de "0029" son de otros registros (plan Local-0029, término Local-0029 del glosario, Local-0029 de Terminología Farlopa) y **no son esta decisión**: cuidado al barrer con búsqueda por número pelado.

### Choque con el plan Local-0115

El plan Local-0115 (*Veintiocho decisiones tienen por nombre el tema y no lo que se decidió*) va a renombrar 28 filas del mismo registro, y su lista **incluye a las Decisiones Local-0002, Local-0013 y Local-0029** — las tres que este plan da de baja o parte. Cada renombre es una ratificación del usuario. Si Local-0115 corre primero, el usuario ratifica tres nombres para filas que quedan `reemplazada por` acto seguido: tres ratificaciones tiradas.

Este plan debería correr **antes**, y Local-0115 recalcular su lista después (las filas nuevas nacen ya con la convención de nombre correcta). Es la decisión 6 de abajo.

---

## Decisiones que necesitan al usuario

Ninguna se resolvió sola: cada una es una convención del registro de decisiones, y redefinir algo asentado lo ratifica el usuario. Van numeradas y redactadas para responderse en frío.

### 1. Cuál es el test de "un tema"

**Qué hay que decidir.** La regla "una decisión = un tema" no se puede aplicar sin un criterio de qué cuenta como un tema. Hoy no hay ninguno, y sin él la misma fila se parte distinto en cada sesión.

**Alternativas.**

- **(a) Test de reemplazabilidad.** Una decisión es de un tema si se la puede dar de baja entera sin arrastrar nada que siga rigiendo. Ejemplo: la Local-0029 falla el test, porque bajarla se llevaría puestos el multi-plugin, el bundle por dependencias y la consolidación de los `inicializar-<sub>`, que rigen. Partida en cuatro, cada parte lo pasa.
- **(b) Test de enunciado.** Una decisión es de un tema si su Descripción sostiene una sola afirmación principal. Es más fácil de evaluar leyendo, pero no dice nada sobre la baja, que es el problema: una fila puede tener una afirmación principal y tres cláusulas colgadas, y al bajarla se van las tres.
- **(c) Sin test.** Juicio caso por caso al registrar. Es lo que hay hoy, y produjo tres cláusulas caídas en 80 filas.

**Recomendación: (a).** La regla existe para que la baja sea posible, así que la unidad de tema tiene que ser la unidad de baja. Es además el único test que se puede aplicar contra el registro sin reabrir la discusión de fondo de cada decisión: se pregunta qué se llevaría la baja, no qué dice la fila.

### 2. Hasta dónde llega hacia atrás

**Qué hay que decidir.** Si la convención rige solo a futuro, o si además se corrige lo ya escrito.

**Alternativas.**

- **(a) Solo a futuro.** Las tres cláusulas caídas se quedan como están. Costo cero hoy; la cadena Local-0013 → Local-0029 → Local-0035 la sigue pagando cada consulta sobre alcance de instalación, que es el caso que originó el plan.
- **(b) A futuro más las tres filas con cláusula caída.** Se parte la Local-0029 en cuatro y se da de baja la parte de alcance; se hace lo mismo con la Local-0002 (cláusula de carga del índice, caída por Local-0017) y la Local-0013 (cláusula del prefijo pelado, caída por Local-0029). El registro queda sin ninguna fila `vigente` que rija a medias.
- **(c) Barrido de las 80.** Partir toda decisión multi-tema, tenga o no una cláusula caída.

**Recomendación: (b).** Es el trabajo acotado que borra la deuda entera: tres filas, no ochenta. (c) es caro y no compra nada — una decisión multi-tema que nadie modificó parcialmente se lee igual de bien que una de un tema; su costo aparece recién cuando alguien le toca una cláusula, y ahí la convención de (b) ya obliga a partirla.

### 3. Si el vocabulario de relaciones entre decisiones se cierra

**Qué hay que decidir.** Hoy conviven seis verbos (*reemplaza, modifica, revisa, refina, extiende, precisa*) para tres relaciones distintas, asentadas de dos formas incompatibles: unas en la columna `Estado`, otras en una nota entre paréntesis dentro de la Descripción, que ningún control mira.

**Alternativas.**

- **(a) Cerrar a dos relaciones.** *Reemplaza* (la vieja deja de regir; se asienta en la columna `Estado`) y *extiende* (la vieja sigue rigiendo entera; se asienta en la Descripción de la nueva). La modificación parcial deja de existir como relación: si la nueva toca una cláusula, o reenuncia el tema entero y reemplaza, o el tema estaba mal partido y primero se parte.
- **(b) Dejar los seis verbos y solo agregar la regla de baja.** Menos trabajo ahora; el próximo agente vuelve a elegir entre seis palabras sin saber cuál cambia el estado de la vieja.

**Recomendación: (a).** Es lo que hace ejecutable la regla del plan: mientras "modifica una cláusula" siga siendo una relación disponible, la vía que produce el problema queda abierta. ⚠️ Cerrar el vocabulario acuña dos términos del dominio (*reemplazar* y *extender* con significado fijo en este registro) — eso pasa por `converger-terminologia` y por el glosario antes de darse por adoptado, no se fija en este plan.

### 4. Cómo se asienta que una decisión fue reemplazada por varias

**Qué hay que decidir.** Al partir la Local-0029 en cuatro, la fila vieja queda reemplazada por cuatro decisiones nuevas. La columna `Estado` admite hoy la forma `reemplazada por NNNN`, un número, y el lint la lee con una expresión que captura uno solo.

**Alternativas.**

- **(a) Permitir lista.** `reemplazada por 0081, 0082, 0083, 0084`, y ajustar la expresión de `lint-decisiones` para validar que existan todos. Cambio chico y contenido: un solo control lee esa celda.
- **(b) Apuntar solo a la primera.** No se toca el lint; quien lea la fila vieja encuentra una sola de las cuatro herederas y tiene que descubrir las otras tres solo. Reintroduce el encadenamiento que el plan viene a borrar.
- **(c) Prohibir la partición.** Que un reemplazo sea siempre uno a uno, y que las decisiones multi-tema no se partan sino que se reemplacen enteras por una sola decisión nueva igual de multi-tema. Contradice la decisión 1.

**Recomendación: (a).** ⚠️ Cambiarle la forma a una celda de un registro es exactamente el caso del conocimiento Local-0012 (cambiar la forma de un registro rompe a sus lectores) y del Local-0013 (controles que dejan de controlar sin avisar): el lector nuevo hay que probarlo con una fila de lista real, porque si la expresión no encuentra la fila el control **contesta en verde** sobre cero filas.

### 5. Qué fecha llevan las decisiones que salen de una partición

**Qué hay que decidir.** Las cuatro filas que salen de partir la Local-0029 no se decidieron el día de la partición: se decidieron el 2026-07-24. La columna `Fecha` no distingue cuándo se decidió de cuándo se escribió la fila.

**Alternativas.**

- **(a) Fecha original más nota.** Fecha `2026-07-24`, y en la Descripción "(sale de partir la Decisión Local-0029, 2026-09-XX)". Conserva cuándo se decidió, que es lo que la columna significa, y deja rastro de la partición.
- **(b) Fecha del día de la partición.** Simple, pero borra que la decisión tiene dos meses y deja cuatro filas nuevas con fecha de hoy que nadie decidió hoy — contradice la Preferencia Base-0009 (distinguir lo verificado de lo inferido o generado).

**Recomendación: (a).**

### 6. En qué orden va este plan respecto del Local-0115

**Qué hay que decidir.** El plan Local-0115 renombra 28 decisiones, y su lista incluye las Decisiones Local-0002, Local-0013 y Local-0029 — las tres que este plan parte o da de baja. Cada renombre lo ratifica el usuario de a uno.

**Alternativas.**

- **(a) Este primero, Local-0115 después.** Las filas nuevas de la partición nacen con la convención de nombre nueva, y Local-0115 recalcula su lista sobre lo que queda: tres ratificaciones menos.
- **(b) Local-0115 primero.** El usuario ratifica un nombre nuevo para tres filas que quedan `reemplazada por` inmediatamente después. Tres ratificaciones tiradas.
- **(c) Juntos, en una pasada por fila.** Menos idas y vueltas, pero mezcla dos criterios distintos en la misma ratificación (cómo se llama la fila y en cuántas se parte), y el usuario tiene que juzgar los dos a la vez.

**Recomendación: (a).**

### 7. Si el lint controla la convención

**Qué hay que decidir.** Si `lint-decisiones` gana un chequeo que marque toda fila `vigente` cuya Descripción contenga una nota de modificación parcial.

**Alternativas.**

- **(a) Sí.** El patrón es mecánico y ya se probó en este análisis: las tres notas existentes se encuentran con una sola expresión. Detecta la erosión el día que aparece, no dos meses después.
- **(b) No, queda en la habilidad `registrar-decision`.** Una regla que solo vive en el texto de una habilidad se cumple mientras alguien la lea; el conocimiento Local-0001 (modos de falla ante reglas escritas) dice que la primera forma de incumplir una regla cargada es recitarla sin obedecerla.

**Recomendación: (a).** Con la salvedad del conocimiento Local-0013: el chequeo nuevo necesita su caso en `pruebas.js`, con una fila que lo dispare y otra que no, porque un control que nadie probó puede estar mirando un conjunto vacío y salir en verde.

---

## Textos propuestos para asentar, con su destino

Esta corrida no escribió en ningún registro fuera de planes. Los textos van redactados para que otro agente los asiente una vez decidido lo de arriba.

### Decisión, a asentar en `.claude/decisiones/INDICE.md`

⚠️ **El código no está reservado.** Se asigna al asentar, como el mayor del registro más uno; al 04/09/2026 el mayor es Local-0080, pero hay otras sesiones corriendo. Verificar antes de escribir.

El texto depende de cómo se resuelvan las decisiones 1, 3 y 4. La versión que sigue asume las recomendaciones (test de reemplazabilidad, vocabulario cerrado a dos relaciones, lista de reemplazos permitida):

> | Local-NNNN | Una decisión enuncia un tema, y la que lo cambia lo reenuncia entero y da de baja a la vieja | **Una decisión del registro enuncia exactamente un tema, y el tema es la unidad de baja: una fila está bien partida si se la puede dar de baja entera sin arrastrar nada que siga rigiendo.** Entre dos decisiones hay solo dos relaciones posibles: **reemplazar** —la nueva reenuncia el tema entero, se asienta en la columna `Estado` de la vieja (`reemplazada por NNNN`, o una lista si la reemplazan varias) y la vieja deja de regir— y **extender** —la nueva agrega un tema vecino, se dice en su Descripción y la vieja sigue rigiendo entera—. **Se elimina la modificación parcial**, la vía por la que una fila quedaba `vigente` con una cláusula caída anotada entre paréntesis: si la decisión nueva toca solo una parte, primero se parte la vieja en sus temas y después se reemplaza el que corresponde. Motivo: saber qué regía sobre el alcance de instalación obligaba a leer tres filas encadenadas (Decisiones Local-0013 → Local-0029 → Local-0035), y la primera y la segunda seguían marcadas `vigente` con parte de su contenido ya caído. Con esta regla, **leer las `vigente` alcanza**. `lint-decisiones` marca toda fila `vigente` cuya Descripción declare una cláusula modificada. | AAAA-MM-DD | vigente | — |

Si la decisión 2 se resuelve como **(b)**, esta decisión se asienta junto con la partición de las Decisiones Local-0002, Local-0013 y Local-0029, y el trabajo de partirlas es su ejecución, no otra decisión.

### Nada para el glosario todavía

La decisión 3 acuña *reemplazar* y *extender* con significado fijo en este registro. Eso lo tiene que pasar `converger-terminologia` y ratificarlo el usuario; no se propone acá una fila de glosario porque el término no está decidido hasta que la decisión 3 se resuelva.

### Nada para conocimiento

Lo aprendido en este análisis —que la deuda son tres filas y no ochenta, y que la unidad de tema es la unidad de baja— es material de la decisión, no una página aparte: no se vuelve a averiguar si la decisión queda asentada.

---

## Trabajo, una vez resueltas las decisiones

Con las recomendaciones de arriba, el trabajo es:

1. Asentar la decisión de la convención (texto propuesto arriba).
2. **Partir la Decisión Local-0029** en sus cuatro temas: empaquetado en un plugin transversal más uno por subsistema con habilidad de operación · bundle completo por dependencias, no à la carte · alcance de instalación · consolidación de los `inicializar-<sub>` en `amp:inicializar`. Al reenunciar, **no copiar el conteo de plugins**, que hoy dice 7 y son 10. La fila vieja queda `reemplazada por` las cuatro; la de alcance nace ya reemplazada por la Decisión Local-0035, o directamente no se escribe y la Local-0035 la absorbe (a definir al ejecutar, con el texto a la vista).
3. **Partir la Decisión Local-0002** y dar de baja la cláusula de carga del índice, que la Local-0017 ya reenunció.
4. **Partir la Decisión Local-0013** y dar de baja la cláusula del prefijo pelado, que la Local-0029 ya reenunció.
5. Ajustar `lint-decisiones`: lista de reemplazos en la columna `Estado`, chequeo de cláusula caída en fila `vigente`, y los dos casos en su `pruebas.js`.
6. Actualizar la habilidad `registrar-decision` (paso 2: qué hacer cuando la decisión nueva contradice **una parte** de una vigente), el `README.md` y el `MANIFIESTO.md` de `decisiones`.
7. Barrer las citas a la Decisión Local-0029 en los dos planes pendientes que la nombran. Los planes ejecutados y descartados no se tocan.
8. Cerrar con `node .claude/herramientas/ejecutar-control-cierre/ejecutar-control-cierre.js`, y correr `sincronizar-base` si algo de lo tocado viaja.

## Por qué queda en Análisis y no en Listo

Las siete decisiones de arriba son del usuario y ninguna es cosmética: la 1 define si el trabajo se puede hacer, la 2 define si son 3 filas o 80, la 3 define qué convención se asienta, la 4 cambia la forma de una celda del registro. Ejecutar sin ellas sería adivinarlas.
