# El Contraste automático no lee los archivos que se le pasan y se queda con las palabras del pedido

**Estado: Listo · Creado 26-08-26.** Origen: [Que las habilidades se disparen solas al plantear un tema](../ejecutados/Que%20las%20habilidades%20se%20disparen%20solas%20al%20plantear%20un%20tema.md) (Local-0095), que dejó esto como seguimiento aparte al cerrar. Lo detectó el usuario al ver que una sesión que arrancó leyendo un handoff trabajó sin haber consultado ningún registro — *«Que ni bien se arranque a laburar se contraste con la sabiduría del repo en lugar de trabajar a ciegas»*.

## El problema

El **Contraste automático** (glosario Local-0036) puntúa el texto del pedido del usuario contra las celdas de los registros de semántica y decisiones, e inyecta al contexto las pocas filas que superan el umbral. El material que el agente lee **después**, para poder trabajar, no pasa por ahí.

Un pedido que apunta a un archivo lleva el contenido afuera del mensaje: *«leé este handoff y seguimos»*, *«retomá el plan tal»*, *«mirá este README»*. El comparador ve la frase que apunta, no lo apuntado. El agente carga entonces un documento entero al contexto sin que ninguna de sus palabras haya sido comparada contra lo asentado, y arranca a trabajar sin la sabiduría del repo.

**El caso más caro es el arranque desde un handoff**, y no es marginal: la Decisión Local-0073 lo tiene medido como la tercera familia de pedidos más repetida y la única transversal a los repos con el harness instalado.

## Lo que ya está decidido y no se re-abre

Todo esto sale del plan Local-0095, que lo midió:

- **Que el agente invoque una habilidad de contraste por su cuenta no funciona.** Se probó con descripciones ensanchadas, con descripciones directivas y con un recordatorio inyectado por el hook: los tres fallaron por igual. El modelo lee la orden y no la ejecuta — el modo «recita sin obedece» del conocimiento Local-0001.
- **Por eso el contraste ocurre por presencia de material en contexto**, no por decisión del modelo. Ese es el mecanismo y no se discute.
- **Cargar los registros enteros al arrancar no es una salida:** pesan varias veces el contexto de arranque completo, y al arrancar nadie sabe de qué se va a hablar (Decisión Local-0017).
- **El Contraste automático vive dentro del hook repartidor**, no como programa aparte: un proceso propio en cada turno ya se midió y se descartó (Decisión Local-0051).
- **Alcance actual: semántica y decisiones.** Conocimiento queda afuera porque ya carga siempre; planes, por movimiento y ruido.
- **Precisión primero:** umbral alto y tope duro bajo, para que la mayoría de los turnos no inyecte nada. Un registro que marca todo entrena a ignorarlo.

## Lo que hay que resolver

- **Cuándo se dispara la comparación.** Hoy es al recibir el mensaje. El material que falta se lee después, así que hace falta un punto donde el contenido ya esté a la vista. El momento `al escribir` no sirve: entrega su texto junto al resultado de la escritura, o sea después de que el agente ya se formó la opinión.
- **Qué se compara.** Un documento largo tiene muchas más palabras que un mensaje, así que el puntaje calibrado para un pedido corto no se traslada sin recalibrar: con demasiado texto, el umbral se supera por acumulación y el mecanismo inyecta de más — el modo de falla que el plan Local-0095 evitó con el umbral alto.
- **Qué archivos entran.** Leer un archivo es la operación más frecuente de una sesión. Comparar en cada lectura tiene un costo por turno y puede repetir las mismas filas una y otra vez.
- **Si la respuesta es el propio handoff.** El handoff lo escribe un agente que sí conoce el repo. Que traiga escritas las filas relevantes es el mismo remedio que la Decisión Local-0073 aplicó al reencuadre para el usuario: se arregla en el origen, donde está el contexto, en vez de pedirle al receptor que lo reconstruya. Cubre el caso más caro y no cubre los demás.
- **Si conviene alcanzar también a los planes**, que hoy quedan afuera del alcance y son justamente lo que se lee al retomar un trabajo.

## Lo medido en el análisis (26-08-27)

Todo esto se corrió contra el repartidor real y contra su fórmula, sobre un corpus de **166 filas**
(glosario + Terminología Farlopa + decisiones). Es determinista: no costó ninguna sesión.

**1. El material apuntado no se puede concatenar al mensaje.** Con el pedido real de esta sesión
—*«Leé .claude/tmp/handoff-….md y seguimos»*, 139 caracteres— el contraste trae la Decisión
Local-0073, que acierta, más dos que no vienen al caso. Al concatenarle el handoff (8568 caracteres),
la salida es **idéntica a puntuar solo el handoff**: el mensaje aporta el 1,6% del texto y se ahoga,
y la única fila que acertaba desaparece. Si el archivo entra, entra como texto aparte.

**2. Con un documento, el umbral mide longitud y no relevancia.** Filas que superan el umbral 7.0:
**13 de 166** con el mensaje corto (16 palabras de contenido), **124 de 166** con el handoff (466
palabras), **114 de 166** con este mismo plan (293 palabras). Con un documento pasa el 75% del
corpus, así que lo único que decide es el orden — y el orden también falla: con el plan que trata
del Contraste automático, la fila del glosario *Contraste automático* sale **cuarta**.

**3. Ninguna de las tres fórmulas probadas ordena bien un documento.**

| Fórmula | Mensaje corto | Handoff | Este plan |
|---|---|---|---|
| suma cruda (la de hoy) | acierta 1 de 3 | 124 filas; 1ª es de bancos de prueba | 114 filas; la correcta 4ª |
| coseno (normaliza fila y texto) | 1ª pasa a ser el término «Carpeta» | del 1º al 6º: 0,039 → 0,033, sin separación | la correcta 1ª, bien separada |
| por párrafos, mejor puntaje | — | 78 filas; 1ª sigue siendo de bancos | 75 filas; la correcta 2ª |

El coseno arregla el documento y rompe el mensaje corto: una fila cuyo Nombre es una sola palabra
tiene norma chica, así que cualquier coincidencia la infla.

**4. El diagnóstico no es la fórmula.** Un handoff resume una sesión entera y toca treinta temas del
repo con parecida intensidad; **no existen «sus tres filas»**. Traerlas todas es cargar el registro,
que la Decisión Local-0017 ya descartó.

**5. Los documentos citan sus códigos, y eso sí es exacto.** La Preferencia Base-0016 obliga a citar
cada código con su tipo delante, y los documentos la cumplen: el handoff cita **9** códigos, este
plan **8**, el plan Local-0119 **17** — todos con la forma «el plan Local-0118», «conocimiento
Local-0019», «Decisión Local-0073», «glosario Local-0036». Extraerlos es determinista y no tiene
ruido, y alcanza a planes y conocimiento sin pagar precisión, que es justo lo que el alcance actual
deja afuera.

**6. El presupuesto de filas se gasta repitiendo.** El comparador solo mira `data.prompt`: no guarda
nada entre turnos, así que vuelve a inyectar la misma fila cada vez que el tema se repite. Medido
sobre las transcripciones reales de este repo:

| Sesión | Turnos con contraste | Filas inyectadas | Distintas | Repetido |
|---|---|---|---|---|
| la del análisis (26-08-27) | 21 | 28 | 10 | **64%** |
| la anterior | 14 | 39 | 22 | 44% |
| una de 5 turnos | 5 | 15 | 8 | 47% |
| una de 2 turnos | 2 | 6 | 6 | 0% |

En la sesión del análisis, las Decisiones Local-0073, Local-0074, Local-0075, Local-0072 y Local-0051
entraron **cuatro veces cada una**. El desperdicio crece con el largo de la conversación. Consecuencia
para el diseño: **el tope duele porque no hay memoria** — con memoria de sesión el mismo tope de 3
rinde el triple, y recién ahí tiene sentido discutir si son 3 o 5, porque pasarían a ser 3 *nuevas*.

**7. De dónde sale el tope 3**, para que no se discuta a ciegas: umbral 7,0 y tope 3 los calibró el
plan Local-0095 con un experimento contra sus tres consultas positivas y sus negativas, con un banco
de 38 casos que sigue vivo. El argumento es «un registro que marca todo entrena a ignorarlo». Está
calibrado **para el mensaje del usuario** —16 palabras— y nunca se probó contra un documento. Moverlo
a 4 o 5 se mide con ese banco, gratis.

## Lo decidido en el análisis (26-08-27 / 26-08-29)

**Ya decidido en esta sesión:** el material apuntado entra por el momento `cada turno`, siguiendo el
puntero — si el mensaje nombra una ruta del repo, el hook la abre. Se descartaron el momento nuevo
`al leer` (sobre `PostToolUse`/`Read`, que cobra ~50 ms en la operación más frecuente de la sesión) y
resolverlo solo en el origen del handoff (cubre un caso de tres).

**Decidido 1 — al archivo apuntado se le extraen las citas, y nada más (26-08-29).** El puntaje por
palabras **se descarta** para el material apuntado. No se conserva ni siquiera como complemento para
el documento que no cita códigos, porque no complementa: come del mismo tope de 3 filas por turno que
las citas, y está medido que ordena mal —con el handoff pasan 124 de 166 filas y la primera es una de
bancos de prueba; con este plan, la fila del glosario *Contraste automático* sale cuarta—. Si esas
entran, empujan afuera a las citas, que con el handoff dan **9 códigos exactos** sin fórmula.

El puntaje sigue vivo donde está calibrado: el mensaje del usuario, 16 palabras. Lo que cambia es que
no se traslada al documento.

Lo que queda descubierto y por qué es aceptable: el archivo sin citas no inyecta nada. Uno, la
Preferencia Base-0016 obliga a citar cada código con su tipo delante y los documentos del repo la
cumplen (handoff 9, este plan 8, el plan Local-0119 17). Dos, no inyectar nada es el comportamiento
normal del mecanismo —precisión primero—. Y el caso real que queda afuera —un README, un archivo de
otro repo, un documento viejo sin citas— es del paso 2, la habilidad, que lee los registros enteros y
no depende de que el texto cite.

**Decidido 2 — memoria de sesión con caducidad de 20 turnos (26-08-29).** La marca vive en
`.claude/tmp/contraste-automatico/<session_id>.txt`, el molde ya probado de `avisar-contexto-pesado`,
que además trae la degradación correcta: si escribir la marca falla, la fila se repite en vez de
perderse, o sea el comportamiento de hoy.

Guarda **el código y el turno en que salió**, no solo el código: una fila ya entregada se calla
mientras no pasen 20 turnos, y después puede volver. **No se calla para siempre.** El motivo es que
«ya se la traje» no es «la tiene»: en una conversación larga el contexto se resume, así que la fila
del turno 3 puede no estar entera en el turno 60. Con silencio permanente el hook la calla justo
cuando volvería a hacer falta y **no emite señal** — el modo de falla del conocimiento Local-0013,
peor que la repetición que veníamos a arreglar, porque la repetición se ve en pantalla y el silencio
no.

**De dónde sale el 20.** Simulado sobre las 8 sesiones más recientes, 131 filas inyectadas:

| Ventana | Filas entregadas | Calladas | Presupuesto liberado |
|---|---|---|---|
| sin memoria (hoy) | 131 | 0 | 0% |
| 10 turnos | 93 | 38 | 29% |
| 20 turnos | 87 | 44 | 34% |
| 40 turnos | 82 | 49 | 37% |
| silencio permanente | 82 | 49 | 37% |

El número que decide es el empate de las dos últimas filas: **40 turnos da exactamente lo mismo que
el silencio permanente**, porque la sesión más larga del corpus tiene 30 turnos y ninguna fila llega
a cumplir los 40. Una ventana de 40 sería silencio permanente con otro nombre, y perdería el seguro
que justifica la caducidad. 10 deja volver la fila demasiado pronto: repite unas 6 de más sin que en
una sesión de 30 turnos haya pasado nada que lo justifique. **20 captura 34 de los 37 puntos posibles
y sigue siendo una ventana real.**

**Dos límites de esa medición, para no leerla de más:** cuenta lo que el mecanismo *entregó*, ya
topado en 3 por turno, así que con memoria el total real sería igual o mayor —lo que mide bien es
cuántas repeticiones se eliminan, no cuántas filas nuevas entrarían en el hueco liberado—; y las
sesiones del corpus son cortas, así que si se pasa a trabajar en sesiones de 80 o 100 turnos, el
número se vuelve a medir. El simulador quedó en `.claude/tmp/simular-caducidad.js`.

**Decidido 4 — el alcance de las citas suma planes, no conocimiento (26-08-29).** Lo destapó la
decisión anterior: el alcance de hoy —semántica y decisiones— se fijó con un motivo que era del
puntaje, y con citas exactas ese motivo se cae en un caso y sigue en pie en el otro.

**Planes entra.** Quedaba afuera por movimiento y ruido, y el ruido era de la fórmula, no de la cita:
cuando un documento dice «el plan Local-0119», traer esa fila es exacto. Además es lo que se lee al
retomar un trabajo, que es el caso que originó este plan.

**Conocimiento no entra.** Su Índice ya se carga siempre, así que la fila citada ya está en contexto
y traerla de nuevo gasta presupuesto sin agregar nada. El motivo original sigue valiendo.

Queda entonces: **citas** sobre semántica, decisiones y planes; **puntaje** donde está calibrado,
semántica y decisiones sobre el mensaje del usuario.

**Decidido 3 — el hook primero, la habilidad después (26-08-28).** Se construye en dos pasos, no a
la vez. Primero el hook: sigue el puntero, extrae los códigos citados e inyecta esas filas. Después,
con lo que quede sin cubrir a la vista, la habilidad de contraste a demanda.

La habilidad **no se descarta**: la propuesta del usuario tiene dos partes separables y solo una está
condenada por el 0 de 3 del plan Local-0095. La habilidad invocada por el usuario funciona por
construcción, como `amp:planificar`; lo que falló tres veces es el recordatorio para que el agente la
invoque solo, que se suma después y se mide con la Herramienta `probar-disparo-de-skills` (Local-0012).
Tampoco la frena el costo: los registros pesan 187 KB juntos —decisiones sola, 102 KB—, pero el repo
ya tiene el molde para no cargarlos al hilo principal, los subagentes de subsistema, con un ahorro
medido de 84 a 94% (conocimiento Local-0018). Sería un quinto de esos.

Consecuencia para lo que queda: con la habilidad afuera del primer paso, el hook no tiene que resolver
el documento largo, y los Abiertos 1 y 2 se deciden contra un hook que solo hace citas.

Encuadre acordado con el usuario: **los dos mecanismos no compiten**. El hook es barato, corre
siempre y no puede traer todo; la habilidad es cara, trae todo y depende de que se la invoque. Lo que
hoy está mal es que el hook intenta hacer el trabajo del segundo con el presupuesto del primero.

## Cómo se mide

El Contraste automático es determinista: la calidad de la selección se prueba con su banco co-ubicado —pedido de entrada, filas esperadas— sin costo de sesión. Que el agente **use** las filas inyectadas es la apuesta blanda, y esa sí necesita sesiones reales.

## Planes relacionados

- [Que las habilidades se disparen solas al plantear un tema](../ejecutados/Que%20las%20habilidades%20se%20disparen%20solas%20al%20plantear%20un%20tema.md) (Local-0095) — construyó el Contraste automático y dejó esto abierto.
- [Chequear el plan escrito contra la sabiduría del repo](Chequear%20el%20plan%20escrito%20contra%20la%20sabiduria%20del%20repo.md) (Local-0022) — el otro lado: chequear el texto que el agente produce, no el que lee.
- [Por que las preferencias cargadas no se aplican](Por%20que%20las%20preferencias%20cargadas%20no%20se%20aplican.md) (Local-0089) — el mismo eje sobre material que ya está en contexto y no se aplica.
