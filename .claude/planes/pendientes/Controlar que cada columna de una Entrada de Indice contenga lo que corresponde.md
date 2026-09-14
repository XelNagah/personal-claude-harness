# Controlar que cada columna de una Entrada de Índice contenga lo que corresponde

**Estado: Nuevo · Creado 26-08-07.** Origen: se desprende del plan Local-0095 (que las habilidades se disparen solas), al registrar la Decisión Local-0062 — su título salió dos veces como una afirmación antes de nombrar la decisión.

## El problema

En un Índice de Subsistema cada columna tiene que contener su aspecto de la Entrada. El **Nombre** tiene que nombrar qué es la Entrada según la convención de su encabezado; una afirmación verdadera no sirve de título: «El cielo es azul» es verdadera y no dice qué se decidió. Pasó de verdad al asentar la Decisión Local-0062: el título salió primero como premisa («la conversación cuesta atención»), no como la decisión que se tomó, y hubo que reescribirlo dos veces.

Ningún control lo caza hoy:

- El **lint** es mecánico: longitud de la Descripción, referencias, huecos de numeración, forma de la tabla. No juzga si el Nombre nombra la Entrada.
- El subsistema **semántica** marca términos vetados, pero un título mal formado no usa términos vetados, y un registro informal («fuga», «se cuela») tampoco los usa — son metáforas, no anglicismos.

## El objetivo

Un control de que cada columna de una Entrada de Índice contenga lo que su convención pide, con foco en el Nombre/título: que se ponga lo que se tiene que poner, no cualquier cosa.

## Lo que ya existe (no reinventar)

- Cada encabezado de Índice **ya declara** qué va en Nombre y en Descripción (Decisión Local-0042): decisiones pide «qué se decidió y por qué»; herramientas, «el flag/modo que cambia el resultado»; conocimiento, «lo suficiente para decidir si vale abrirla». Es texto declarativo, ninguna habilidad lo ejecuta como chequeo.
- La habilidad `converger-terminologia` barre un texto contra el glosario y la Terminología Farlopa — cubre la mitad de terminología, pero no está cableada al registro.
- El Contraste automático (glosario Local-0036, Decisión Local-0062) ya trae al contexto las filas de semántica y decisiones que tocan el turno.

## El hueco

- Que el **Nombre** nombre la Entrada según su convención, no una afirmación ni una premisa.
- El **registro formal** de la Descripción: sin metáforas informales.

## Restricciones de diseño (relevadas el 07/08/2026)

- El punto donde conviene revisar —**antes de mostrar el texto exacto y ratificar**— **no es un momento de conducta**: los momentos son eventos de hook (SessionStart, PreToolUse…), y esto es un paso interno del flujo de una habilidad de registro. Vive en el flujo, no en conducta.
- **No duplicar el texto** en las siete habilidades de registro (conocimiento Base-0001, Local-0016): ya re-tipean la regla de asignación de Código ocho veces; sumar un checklist copiado repite esa deuda.
- El chequeo «¿el Nombre nombra la Entrada o es una afirmación?» es de **juicio, no mecánico** — como el reparto de semántica: la máquina puede marcar, el agente juzga.

## A decidir en el análisis

- ¿El control es mecánico (lint), de juicio (paso en el flujo / regla), o mixto?
- Dónde vive el fragmento compartido sin copiarlo en las siete habilidades.
- Alcance: todos los Índices, o arranca por decisiones —donde el Nombre más tiende a salir como afirmación— y se extiende.

## Relevado el 13/09/2026: tres de los nueve Índices dicen qué tiene que afirmar el Nombre, y seis no

Medido sobre los nueve Índices de Subsistema de este repo, leyendo qué declara cada
encabezado sobre su columna **Nombre**:

| Índice | Qué declara que tiene que ser el Nombre | |
|---|---|---|
| decisiones | «qué se decidió… **No** es el tema ni el área» | completo |
| planes | «qué va a hacer el plan… **No** es el tema ni el área» | completo |
| conocimiento | «qué se sabe: la afirmación que la página sostiene… **No** es el tema» | completo |
| conducta | «qué asegura, en una frase con verbo» | a medias |
| preferencias | «qué pide la preferencia, en una frase con verbo» | a medias |
| herramientas | «el nombre de la Herramienta» | no especifica |
| subsistemas | «el nombre del subsistema, que es también el de su carpeta» | no especifica |
| glosario | «el nombre canónico del concepto» | no especifica |
| comunicacion | «cómo se lo nombra al consultarlo» | no especifica |

Los tres completos declaran **las dos mitades**: qué tiene que afirmar el nombre, y qué error
se comete si no («Gobernanza de terminología» dice de qué se habló, no qué se resolvió). Los
otros seis no dan criterio.

**Evidencia de que la especificación es lo que separa un registro sano de uno que nadie midió.**
Un barrido de sustantivos y verbos vacíos —«una situación», «un registro», «algo ocurre»— sobre
los títulos de decisiones, planes y conocimiento devolvió **4 marcas, de las cuales 1 genuina**
(«Avisar al cerrar una tarea que hay algo para asentar», que nunca dice qué algo). Esos tres son
exactamente los tres que especifican. Donde el criterio no está escrito, nadie midió nunca.

## El alcance, decidido por el usuario el 13/09/2026

Contesta la tercera pregunta de «A decidir en el análisis». **El control alcanza a los cinco
Índices cuyo Nombre es una afirmación** —decisiones, planes, conocimiento, conducta y
preferencias—, no a los nueve:

1. **Completar la especificación en `conducta` y `preferencias`**, tomando de molde la de
   decisiones: qué tiene que afirmar el Nombre **y** qué error se comete si no.
2. **Dejar como están** decisiones, planes y conocimiento: ya la declaran completa.
3. **Agregar el control** que marque el título que nombra un tema en vez de afirmar algo.
4. **Dejar afuera** herramientas, subsistemas, glosario y comunicacion. Ahí el Nombre es una
   etiqueta legítima —el subsistema se llama `planes`, el término del glosario se llama
   «Propósito», el otro agente se llama como se lo invoca— y quien tiene que explicar qué es y
   para qué sirve es la **Descripción**. Exigirles una afirmación los rompe y cambia cómo se los
   busca y se los cita.

**Costo asumido, y es el caso que disparó la revisión.** En `herramientas` el defecto queda sin
resolver por otra vía: el Nombre es `sincronizar-base`, legítimo, y la Descripción es un párrafo
de seis líneas; entre los dos no hay ninguna frase corta que diga para qué sirve. Queda afuera
de este plan porque arreglarlo es sumarle una columna o recortar la Descripción a un registro
que ya tiene siete columnas, y eso es otro trabajo.

## El título misterioso es un segundo modo de falla, distinto del que ya tiene preferencia

La Preferencia Local-0014 (*Escribir cada título de modo que se entienda leído solo*), registrada
el 12/09/2026, cubre **el título que apunta a otra parte del documento**: «el problema real está
en la otra mitad del síntoma» obliga al lector a ir a buscar qué síntoma.

El defecto que reporta el usuario es otro, y la regla de ayer **no lo atrapa**, porque un título
así sí se entiende leído solo —gramaticalmente está completo—. Falla porque **cada sustantivo que
debería nombrar una cosa nombra la categoría a la que la cosa pertenece**, y el verbo es la marca
del lugar donde iba el verbo:

> «Una situación que ocurre en un registro no es leído por nadie y en algún momento, algo ocurre»

Qué situación, cuál registro, quién debería leerla, qué ocurre y cuándo: ninguna de las cinco
está. El test es mecánico y se aplica sin releer nada: **¿cada sustantivo del título nombra una
cosa específica o la categoría a la que pertenece? ¿el verbo dice qué pasa, o es «ocurre» /
«sucede» / «hay un problema con»?** Escrito como corresponde, ese mismo título sería: «Una fila
del registro de planes cuyo archivo se borró no la lee ningún lint, y al cerrar el plan siguiente
el lint falla sobre ella».

El usuario reporta que lo sufre **a diario en los repos que usan el Agente Multipropósito**, y que
le consume tiempo y frustración de forma sistemática. Dónde vive la regla —ampliar la Preferencia
Local-0014, o una regla de conducta entregada en el momento de escribir— **quedó sin decidir**: es
la pregunta que sigue abierta. El repo tiene asentado que una regla cargada al inicio se recita y
no se obedece (conocimiento Local-0001, *Modos de falla ante reglas escritas*), y la de ayer ya
falló una vez después de registrada.

## Planes relacionados

- [Que las habilidades se disparen solas al plantear un tema](Que%20las%20habilidades%20se%20disparen%20solas%20al%20plantear%20un%20tema.md) (Local-0095) — de donde se desprende: el Contraste automático que ese plan construyó es parte de lo que ya existe acá.
