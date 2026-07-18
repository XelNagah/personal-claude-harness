# Capa semántica de coherencia: contradicciones e incompatibilidades

**Estado: idea · Creado 26-07-18.** Estacionado. Surgió en la sesión de `/planificar` del rework del README, del caso "preferencias mutuamente excluyentes". A analizar como parte del patrón/estructura general.

## Objetivo

Diseñar la **capa semántica** de la [decisión 0003](../../decisiones/INDICE.md): detección de contradicciones, incompatibilidades, duplicación y staleness **transversal a todos los subsistemas de acumulación** (memoria, conocimiento, glosario, decisiones, preferencias, planes). Es lo que los lints mecánicos NO pueden hacer porque requiere entender el significado (LLM).

## Motivación (caso disparador)

Dos preferencias mutuamente excluyentes ("respondé siempre en una tanda" vs "preguntá de a una") no las cacha un `.js`: hay que *entender* que chocan. Misma falla en otros subsistemas: dos decisiones `vigente` que se contradicen, dos términos del glosario incompatibles, conocimiento que quedó viejo (staleness).

## Preguntas de diseño abiertas (para cuando se retome)

- **Forma:** ¿skill de revisión a pedido (`/coherencia`), paso del leveling, extensión de `planificar`, o un "lint semántico" que invoca LLM? Hoy es informal (el agente lo hace en sesión).
- **Encaje en el patrón general:** ¿es un séptimo elemento del patrón de subsistema, o una pasada ortogonal que recorre todos? (El usuario quiere analizarlo *como parte de la estructura/patrón general*, no como parche.)
- **Alcance por subsistema:** contradicción (preferencias, decisiones), incompatibilidad (glosario), duplicación (memoria, conocimiento), staleness (conocimiento). ¿Uno que hace todo o especializados?
- **Costo/gatillo:** ¿cuándo corre? (caro: consume LLM). ¿Al cerrar tarea, on demand, en leveling?

## Depende de
Conceptualmente, de tener el patrón mecánico completo (plan [Completar cobertura de lint mecánico](Completar%20cobertura%20de%20lint%20mecanico%20-%20memoria%20y%20preferencias.md)) y el README que nombra las dos capas.

## Decisiones que aplica
[0003](../../decisiones/INDICE.md) (capa semántica, hoy informal, pendiente de formalizar).
