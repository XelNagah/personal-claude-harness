# Verificar que el aprendizaje quede asentado en los subsistemas

**Estado: Nuevo · Creado 26-07-21.** Pedido de Javier el 26-07-21, al preguntar *"¿se guardaron los aprendizajes en los subsistemas correspondientes?"* al cierre de una tarea. La sesión había producido un criterio reutilizable ("un lint de concepto transversal del harness va en `lint-harness`, no repartido en los lints de subsistema") que quedó **enterrado en la nota del plan que lo generó**, sin rutear a `decisiones/`. Ese es el patrón de falla a atacar.

## Qué se pide

Un skill que, dado lo que se hizo o algo que se le pase, **verifique que todo el aprendizaje quedó incorporado en el subsistema correcto** (conocimiento, glosario, decisiones, memoria, herramientas, preferencias) — y proponga rutear lo que falte, con ratificación donde aplique (0004/0016).

Dos formas de disparo:

1. **A demanda, sobre algo particular** — invocable en la sesión: *"verificá que esto quedó asentado"*, apuntándolo a un tema, un diff, o el trabajo de la sesión.
2. **Automático al cierre de un plan** — cuando un plan pasa a `Ejecutado`, correr esta verificación como parte del cierre. **Esto es un cambio al flujo de trabajo del subsistema de planes** (`ciclo-de-plan` / `feedback_flujo_planes`): sumar el paso "auditar captura de aprendizaje" a la transición a Ejecutado, junto al lint y las notas de implementación.

## Por qué importa

El harness tiene subsistemas para capturar cada tipo de aprendizaje, pero **nada verifica que la captura ocurra**. El aprendizaje se explica en la conversación, se asienta a veces en el plan, y se pierde para la sesión siguiente si no llegó a `decisiones/INDICE.md`, `conocimiento/INDICE.md`, etc. Es el mismo diagnóstico del plan madre [Que el harness tenga efecto conductual](Que%20el%20harness%20tenga%20efecto%20conductual.md): el saber existe pero no está donde el agente lo encuentra la próxima vez. Un hallazgo que se explica y no se rutea se vuelve a averiguar.

## Solape a resolver (diseñar con `planificar` antes de construir)

Este plan **no debe duplicar mecanismo**. Solapa fuerte con piezas existentes:

- **`/contrastar`** (Nuevo, sin diseñar): *contrasta lo solicitado contra conocimiento+glosario+decisiones y, si aparecen elementos nuevos válidos, los incorpora al subsistema apropiado*. Mismo mecanismo de ruteo con ratificación. **La diferencia es la dirección:**
  - `/contrastar` mira **hacia adelante** — lo que se *pide* vs. la sabiduría del repo.
  - Este skill mira **hacia atrás** — lo que se *hizo/aprendió* → ¿quedó destilado? Es un **verificador de captura al cierre** (retrospectiva).
  - A resolver en diseño: **¿skill propia, un modo de `/contrastar`, o dos hermanos** que comparten el motor de ruteo?
- **`buscar-conocimiento`** y **`converger-terminologia`**: barren texto ya escrito buscando lo no asentado (conocimiento / glosario). Este skill hace lo análogo pero sobre **lo recién producido** y **a todos los subsistemas**, no a uno.
- **`registrar-*`** (una skill de registro por subsistema): son el destino del ruteo, no el verificador. Este skill decide *qué* rutear y las invoca.

## Preguntas abiertas

- ¿El verificador **propone** (y el usuario ratifica cada ruteo) o **incorpora directo** lo que no requiere ratificación (memoria) y solo pregunta por los canónicos (glosario/decisiones, 0004/0016)?
- ¿Cómo sabe qué es "aprendizaje" en la sesión sin releer todo? ¿Se apoya en un resumen de la tarea, en el diff, en los planes tocados?
- Al cierre de plan: ¿bloquea la transición a `Ejecutado` si detecta aprendizaje sin rutear, o solo avisa? (Bloquear = más garantía, más fricción.)
- ¿Alcanza a **preferencias** (feedback recurrente) además de los 6 subsistemas de datos?
- ¿Es un skill puro (lo dispara el modelo) o necesita un gancho mecánico en el cierre de plan para no depender de que el agente se acuerde?

## Deuda concreta que ya lo justifica

Candidato a decisión detectado esta sesión y **todavía sin rutear**: *"el lint de un concepto transversal del harness vive en `lint-harness`, no repartido en los lints de subsistema; la dec. 0008 aplica a lints DE un subsistema, no a chequeos transversales"*. Coherente con lo que ya asume el plan **Vetar términos** ("chequeo de Base en `lint-harness`"). Es exactamente lo que este skill tendría que haber cazado. Evaluar registrarlo (¿decisión nueva o nota en 0008?) al diseñar, como caso de prueba real.

## Depende de

- **`/contrastar`**: conviene diseñarlos juntos o decidir la relación antes, para no construir dos veces el motor de ruteo.
- Toca el flujo de **planes**: coordinar con `ciclo-de-plan` y `feedback_flujo_planes` el paso nuevo en la transición a Ejecutado.
