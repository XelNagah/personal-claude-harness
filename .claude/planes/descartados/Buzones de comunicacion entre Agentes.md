# Buzones de comunicación entre Agentes

**Estado: Descartado · Creado 26-07-25 · Cerrado 26-08-09.** Idea de Javier, disparada al necesitar que una sesión que se reinicia vuelva sabiendo dónde quedó. La necesidad puntual se resolvió por otro lado; queda la general: **los Agentes no tienen forma de dejarse mensajes**.

## Notas de cierre — motivo del descarte (26-08-09)

Las dos distancias que le quedaban vivas después del achique del 26-08-06 quedaron cubiertas, y ninguna por un buzón:

- **Entre sesiones no simultáneas del mismo repo** — ya lo cubrían el handoff (Preferencia Base-0014) y el Buzón de Avisos Generales (término del glosario Local-0034), que existe y funciona.
- **Entre repos** — lo cubre el subsistema `comunicacion` (Decisión Local-0065), pero **por la vía contraria a la que este plan imaginaba**: en vez de dejarle un sobre al otro repo, el que tiene algo que entregar lo entrega **corriéndolo**. Concreto: un repo que descubre algo que le sirve a otro le pide con `resolver` que corra su propia `amp-planes:crear-plan`, y el plan queda creado del otro lado.

Lo único que no queda cubierto es dejarle un **aviso** a un repo cerrado sin escribirle nada — con `resolver` se le escribe, que es más invasivo. Se descarta igual: no apareció la necesidad real, y construir el buzón para ese caso es el mecanismo entero por su borde.

**Sus cinco condiciones no se pierden, tienen dueño:** las cuatro primeras —destinatario explícito, un solo uso, procedencia y fecha, visible para el usuario— las cumple el Buzón de Avisos Generales, que es el que entrega al arrancar. La quinta —**es contexto, no orden**— la hereda `comunicacion` y está asentada en su decisión.

El choque que este plan marcaba contra la quinta no aplica: la condición rechaza un archivo que aparece y se ejecuta al arrancar **sin que nadie lo haya pedido**; en `resolver` el usuario está delante y lo pidió explícitamente. Son cosas distintas.

Si el caso del aviso a un repo cerrado aparece de verdad, se abre un plan nuevo con ese alcance, que es chico. Lo de abajo es el texto original, sin tocar.

## El problema

Hoy la comunicación entre Agentes existe pero **la hace el usuario a mano**: lee lo que un Agente produjo, lo copia y se lo pega a otro. No hay lugar convenido donde dejar algo dirigido a alguien.

No es hipotético — el repo está lleno de rastros:

- **Traspasos entre repos.** Varios planes de este repo arrancan diciendo *"traspaso del agente `automejora`"*, *"traspaso del agente de mejora de uso (`como-uso-claude`)"*, *"traspaso del agente salud"*. Un Agente de otro repo produjo algo que le pertenece a este, y el traslado lo hizo el usuario copiando texto entre ventanas. Con ~18 Agentes Multipropósito en la máquina, eso escala mal.
- **Entre sesiones del mismo repo.** Los handoffs en `.claude/tmp/`: la sesión que se va escribe dónde quedó y el usuario tiene que acordarse de pasárselo a la que llega.
- **Hacia adentro de una sesión.** Cuando una skill delega en un subagente (`propagar-harness`), el mensaje va por el texto del pedido y la respuesta vuelve como texto; nada queda asentado.

Los tres son el mismo hueco visto de tres distancias: **falta el buzón**.

## Condiciones que cualquier diseño tiene que cumplir

Salieron de descartar un primer intento —una regla que al arrancar leyera cualquier archivo de handoff del directorio de borradores— por inseguro: `.claude/tmp/` junta borradores, notas y handoffs ya consumidos, así que un comodín levanta lo que sea, incluido un mensaje viejo que reordena trabajo ya hecho.

1. **Destinatario explícito.** Un mensaje va dirigido a alguien; no se recoge por coincidencia de nombre ni por barrer un directorio.
2. **Un solo uso.** Al consumirse se marca consumido, o revive en cada arranque siguiente.
3. **Procedencia y fecha.** Quién lo dejó y cuándo, para poder juzgar si venció. Un mensaje de hace dos semanas sobre un plan ya cerrado es ruido peligroso, no contexto.
4. **Visible para el usuario.** Si una sesión retoma o incorpora un mensaje, el usuario tiene que verlo — no puede enterarse por el comportamiento.
5. **Es contexto, no orden.** El Agente que lo recibe lo lee y **propone**; no ejecuta lo que dice un archivo por el solo hecho de encontrarlo. Un buzón que ejecuta es una vía de instrucción que nadie autorizó en esta sesión.

## A resolver

- **Qué es un mensaje y qué no.** Un traspaso de trabajo, un aviso ("cerré el plan que te importaba"), una pregunta que espera respuesta — ¿son todos lo mismo? De la respuesta sale si el buzón es una cola de mensajes o un registro más del harness.
- **Dónde vive el buzón.** ¿Uno por Agente dentro de su `.claude/`, o uno compartido en la máquina fuera de los repos? Un mensaje de `como-uso-claude` para este repo tiene que llegar aunque este repo esté cerrado hace un mes.
- **Quién entrega.** El momento `al arrancar la sesión` ya tiene repartidor (subsistema `conducta`), así que la entrega es realizable sin mecanismo nuevo — pero con las cinco condiciones de arriba, no con un comodín.
- **Relación con los subsistemas que ya guardan cosas.** Un traspaso que llega y se acepta termina siendo un plan, una memoria o una página de conocimiento. ¿El buzón es la bandeja de entrada de esos subsistemas, o un lugar aparte que se vacía a mano?
- **Vencimiento.** Qué pasa con un mensaje que nadie recogió.

## Se cruza con

- [Crecer el subsistema conducta](Crecer%20el%20subsistema%20conducta.md) — la entrega al arrancar sería una regla de conducta; el repartidor ya existe.
- [Subagentes como componente distribuible del AMP](Subagentes%20como%20componente%20distribuible%20del%20AMP.md) — la comunicación hacia adentro de una sesión es el mismo problema a menor distancia.
- [Habilidad de ejecución de planes](Habilidad%20de%20ejecucion%20de%20planes.md) — un motor que ejecuta un plan de punta a punta necesita justamente recibir y dejar estado.
- [Verificar que el aprendizaje quede asentado en los subsistemas](Verificar%20que%20el%20aprendizaje%20quede%20asentado%20en%20los%20subsistemas.md) — un mensaje aceptado tiene que terminar asentado en algún subsistema, no quedarse en la bandeja.

Correr por `amp:planificar` antes de construir nada.

## Achique contra la plataforma (26-08-06)

De las tres distancias del problema, la plataforma ya cubre la más corta: hacia adentro de una
sesión, la herramienta SendMessage continúa un subagente ya lanzado conservando su contexto, y las
notificaciones de tareas devuelven el resultado sin que el usuario copie nada. El alcance vivo de
este plan queda en lo que la plataforma no hace: mensajes entre repos y entre sesiones no
simultáneas — SendMessage no cruza ni sesiones ni repos. Achique ratificado en la poda de
pendientes contra la plataforma (ítem 5 del plan de consumo de tokens).
