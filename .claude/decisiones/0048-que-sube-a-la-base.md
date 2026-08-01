# 0048 — Qué sube a la Base y qué se queda como documentación de este proyecto

## Qué se decidió

Un Componente de Subsistema sube a la Base —y por lo tanto viaja a cada Agente Desplegado— solo si le sirve a ese agente **para hacer bien su trabajo**: le explica cómo funciona algo que va a usar, le evita perderse, o es una regla útil para cualquier propósito.

Lo que este repo aprendió **construyendo y propagando** el Agente Multipropósito se queda acá como documentación del proyecto. Es valioso, pero es historia de esta obra, no insumo de quien la recibe terminada.

Vale para todos los subsistemas —conocimiento, preferencias, conducta, semántica, herramientas—, no solo para conocimiento, que fue el que motivó la pregunta.

## Por qué

### El criterio distingue por beneficiario, no por tema

La trampa está en preguntar *"¿de qué habla esto?"*. Casi todo lo que este repo aprendió habla de mecanismos que el Agente Multipropósito instala, así que por tema casi todo parece Base.

La pregunta correcta es *"¿a quién le sirve?"*. Que el Agente Multipropósito instale aquello de lo que un Componente habla **no lo vuelve útil a quien lo recibe ya hecho**. El repo destino recibe los lints escritos, los registros con sus columnas y los plugins publicados; no los escribe, no les cambia las columnas y no los publica.

### Lo medido

El 31/07/2026, sobre las quince páginas de conocimiento de este repo. Antes de tener el criterio, ocho parecían universales **por tema**. Con el criterio pasan **tres**:

| Página | Por qué pasa |
|---|---|
| El mismo dato en dos lugares, sin nada que los sincronice | No es sabiduría de harness: es de cualquier trabajo con información. Un dato escrito dos veces diverge siempre, y lo que decide el daño es si hay algo que los compare |
| grep y acentos en Windows | Le evita perderse: busca un término acentuado en sus propios registros, recibe 0 resultados y concluye que no está registrado cuando sí lo está |
| Terminología farlopa | Le explica cómo funciona algo que va a usar: por qué tiene el subsistema semántica y qué fenómeno le va a pasar en su propio dominio |

Las doce restantes se quedan. Cinco ya estaban clasificadas como propias de este repo; las otras siete son el aprendizaje de haber construido esto: cómo desplegar plugins sin romper nada, cómo escribir un control que no se apague solo, cómo cambiarle las columnas a un registro sin dejar ciegos a sus lectores, la trampa del script que describe el repo equivocado.

## Los dos criterios que se descartaron

**"Sigue siendo cierta en un repo cuyo Propósito no es construir un harness."** Es un criterio de verdad, y casi toda la sabiduría sobre agentes sigue siendo cierta en cualquier lado. No separa: la referencia de mecánica de los hooks es tan cierta en un repo de contabilidad como acá, y ese repo no la necesita.

**"Habla de algo que el Agente Multipropósito instala."** Es el error de beneficiario, ya descripto. Hacía subir la página sobre desplegar plugins porque el destino instala plugins — pero el destino los *recibe*, no los publica, y el diagnóstico de los desfases ya se lo hace una Herramienta que viaja.

## Consecuencias

**Aplicado hacia atrás, marca cosas que ya viajan.** La Preferencia Base-0011 pide no usar la sigla del Agente Multipropósito en lugar de su nombre: eso es vocabulario de este proyecto, no del propósito de nadie más. Revisar lo ya propagado es trabajo aparte, no lo hace esta decisión.

**Un Componente que no sube puede seguir haciendo falta en el destino por otra vía.** El control que caza la marca de orden de bytes es el caso: la página no pasa el criterio, pero el defecto sí le puede pasar a cualquier Agente Desplegado y hoy no tiene con qué detectarlo, porque el control vive en una Herramienta que no viaja. Eso se resuelve haciendo viajar el control, no la página.

## Lo que esta decisión NO decide

**Si el Índice del Agente Multipropósito de un subsistema se carga siempre.** Eso lo declara cada manifiesto (Decisión Local-0042) y se juzga por subsistema. Lo que este criterio decide es qué entra al Índice, no cuánto contexto cuesta después.
