# El Contraste automático no lee los archivos que se le pasan y se queda con las palabras del pedido

**Estado: Nuevo · Creado 26-08-26.** Origen: [Que las habilidades se disparen solas al plantear un tema](../ejecutados/Que%20las%20habilidades%20se%20disparen%20solas%20al%20plantear%20un%20tema.md) (Local-0095), que dejó esto como seguimiento aparte al cerrar. Lo detectó el usuario al ver que una sesión que arrancó leyendo un handoff trabajó sin haber consultado ningún registro — *«Que ni bien se arranque a laburar se contraste con la sabiduría del repo en lugar de trabajar a ciegas»*.

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

## Cómo se mide

El Contraste automático es determinista: la calidad de la selección se prueba con su banco co-ubicado —pedido de entrada, filas esperadas— sin costo de sesión. Que el agente **use** las filas inyectadas es la apuesta blanda, y esa sí necesita sesiones reales.

## Planes relacionados

- [Que las habilidades se disparen solas al plantear un tema](../ejecutados/Que%20las%20habilidades%20se%20disparen%20solas%20al%20plantear%20un%20tema.md) (Local-0095) — construyó el Contraste automático y dejó esto abierto.
- [Chequear el plan escrito contra la sabiduría del repo](Chequear%20el%20plan%20escrito%20contra%20la%20sabiduria%20del%20repo.md) (Local-0022) — el otro lado: chequear el texto que el agente produce, no el que lee.
- [Por que las preferencias cargadas no se aplican](Por%20que%20las%20preferencias%20cargadas%20no%20se%20aplican.md) (Local-0089) — el mismo eje sobre material que ya está en contexto y no se aplica.
