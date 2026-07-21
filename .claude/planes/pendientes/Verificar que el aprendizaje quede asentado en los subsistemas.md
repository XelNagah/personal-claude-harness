# Verificar que el aprendizaje quede asentado en los subsistemas

**Estado: Nuevo · Creado 26-07-21.** Pedido de Javier el 26-07-21, al preguntar *"¿se guardaron los aprendizajes en los subsistemas correspondientes?"* al cierre de una tarea. La sesión había producido un criterio reutilizable ("un lint de concepto transversal del harness va en `lint-harness`, no repartido en los lints de subsistema") que quedó **enterrado en la nota del plan que lo generó**, sin rutear a `decisiones/`. Ese es el patrón de falla a atacar.

## Qué se pide

Que, dado lo que se hizo o algo que se le pase, quede **verificado que todo el aprendizaje se incorporó al subsistema correcto** (conocimiento, glosario, decisiones, memoria, herramientas, preferencias) y **ruteado lo que falte**, con ratificación donde aplique (0004/0016).

Dos formas de disparo:

1. **A demanda, sobre algo particular** — invocable en la sesión, apuntándolo a un tema, un diff, o el trabajo de la sesión.
2. **Automático al cierre de un plan** — cuando un plan pasa a `Ejecutado`, la verificación corre como parte del cierre. **Esto es un cambio al flujo de trabajo del subsistema de planes** (`ciclo-de-plan` / `feedback_flujo_planes`): sumar el paso a la transición a Ejecutado, junto al lint y las notas de implementación.

## Diseño decidido (26-07-21): reusar `/contrastar`, no un skill nuevo

Javier lo resolvió: **no se construye un verificador aparte** — se reaprovecha `/contrastar`.

- **`/contrastar` es el motor y el que persiste.** Ya contrasta contra conocimiento+glosario+decisiones y rutea al subsistema apropiado con ratificación. Este plan **no duplica ese mecanismo**: lo invoca.
- **`/contrastar` gana una segunda dirección de entrada.** Hoy mira **hacia adelante** (lo que se *solicita*). Se le agrega mirar **hacia atrás**: aceptar como material **lo ejecutado o la conversación**. Es el mismo contraste con la sabiduría del repo, con otra fuente. *(Requisito cruzado para el plan `/contrastar` — anotado allí.)*
- **El cierre de plan solo dispara.** Al pasar a Ejecutado, invoca `/contrastar` contra lo ejecutado / la conversación; `/contrastar` hace el resto (detecta lo nuevo, propone/rutea, persiste).

Trabajo propio de **este** plan, entonces:
1. La **entrada "hacia atrás"** de `/contrastar` (que acepte "lo ejecutado / la conversación" como material). Vive en el plan `/contrastar`, referida desde acá.
2. El **gancho en el flujo de `planes`**: el paso nuevo en la transición a Ejecutado. Vive en el subsistema `planes`.

## Por qué importa

El harness tiene subsistemas para capturar cada tipo de aprendizaje, pero **nada verifica que la captura ocurra**. El aprendizaje se explica en la conversación, se asienta a veces en el plan, y se pierde para la sesión siguiente si no llegó a `decisiones/INDICE.md`, `conocimiento/INDICE.md`, etc. Mismo diagnóstico del plan madre [Que el harness tenga efecto conductual](Que%20el%20harness%20tenga%20efecto%20conductual.md): el saber existe pero no está donde el agente lo encuentra la próxima vez. Un hallazgo que se explica y no se rutea se vuelve a averiguar.

## Preguntas abiertas

- Al cierre: ¿contra qué exactamente corre `/contrastar` — el **diff** de los commits del plan, las **notas de implementación**, la **conversación** entera, o una combinación? (La conversación captura razonamiento que el diff no; el diff es más acotado y barato.)
- ¿El paso al cierre **bloquea** la transición a `Ejecutado` si hay aprendizaje sin rutear, o solo **avisa**? (Bloquear = más garantía, más fricción.)
- ¿Alcanza a **preferencias** (feedback recurrente) además de los 6 subsistemas de datos? — depende de hasta dónde llegue `/contrastar`.
- ¿El disparo a demanda es literalmente `/contrastar <tema>` o hace falta un alias/modo que deje claro que es "hacia atrás"?

## Deuda concreta que ya lo justifica

Candidato a decisión detectado esta sesión y **todavía sin rutear**: *"el lint de un concepto transversal del harness vive en `lint-harness`, no repartido en los lints de subsistema; la dec. 0008 aplica a lints DE un subsistema, no a chequeos transversales"*. Coherente con lo que ya asume el plan **Vetar términos** ("chequeo de Base en `lint-harness`"). Es exactamente lo que este disparo tendría que haber cazado. Evaluar registrarlo (¿decisión nueva o nota en 0008?) al diseñar, como caso de prueba real.

## Depende de

- **`/contrastar`** — es el motor. Este plan no arranca sin él; su diseño incluye la entrada "hacia atrás". Diseñar `/contrastar` teniendo esta necesidad a la vista.
- Toca el flujo de **planes**: coordinar con `ciclo-de-plan` y `feedback_flujo_planes` el paso nuevo en la transición a Ejecutado.
