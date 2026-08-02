# Revisar el modo de preguntar de amp:planificar

**Estado: Ejecutado · Creado 26-07-25 · Cerrado 26-08-02.**

## Problema

La sección **«El modo de preguntar»** de `amp:planificar` contradice la preferencia Base asentada el 25/07/2026:

> Al pedir una decisión al usuario, **el contexto va en el texto de la respuesta**, nunca comprimido dentro de las opciones de una pregunta. Y **de a una decisión por vez**, aunque sean independientes entre sí. Única excepción: una cola de confirmaciones donde la respuesta esperada es "sí" a todas puede ir junta, con la recomendada visible.

Lo que el SKILL manda hoy (`funcionalidades/amp/skills/planificar/SKILL.md`, líneas 20–31):

- Línea 27 — *«**Racimo de preguntas independientes** (ninguna depende de la respuesta de otra) → **una sola tanda** (hasta 4 juntas). Preguntarlas de a una desperdicia turnos.»* **Choque directo:** la preferencia pide una por vez justamente cuando son independientes.
- Línea 31 — *«Regla para decidir tanda vs. una por una: ¿la respuesta de esta pregunta cambia cómo formulo otra? Sí → secuencial. No → se pueden agrupar.»* El criterio queda invertido respecto de la preferencia.
- Línea 29 — la cola final de confirmaciones agrupada **sí** sobrevive: es la excepción que la preferencia admite. Revisar solo la redacción.
- Línea 26 — las preguntas de fondo una por una ya coinciden; no se toca.

## Cómo se detectó

Sesión del 25/07/2026, corriendo `amp:planificar` sobre el plan *Ubicación de la documentación del proyecto*: el agente agrupó tres decisiones independientes en una sola tanda **siguiendo el SKILL al pie de la letra**, y el usuario la rechazó. O sea: no fue incumplimiento del agente, fue el harness empujando a la conducta no deseada. El usuario pidió revisarlo él mismo.

## Alcance

- `funcionalidades/amp/skills/planificar/SKILL.md` — **copia única**, verificado: el texto no tiene gemelo textual en `amp:inicializar` ni en ninguna otra plantilla, así que no dispara `propagar-harness`. Alcanza con editar el SKILL y subir la versión del plugin `amp`.
- Revisar si el mismo criterio de agrupar aparece —con otras palabras— en otras skills que preguntan.

## A resolver

- Redacción nueva de la sección, coherente con la preferencia Base: ¿se reescribe la clasificación entera (fondo / independientes / dependientes / confirmaciones) o alcanza con dar vuelta la fila de las independientes y el criterio de cierre?
- Si el contexto en el texto de la respuesta merece decirse explícito en el SKILL o queda delegado a la preferencia (que ya está siempre en contexto). Riesgo de duplicar la regla en dos lugares que después divergen.
- **Pregunta de fondo detrás del caso:** cuando una preferencia Base y el texto de un SKILL se contradicen, ¿qué gana y quién lo detecta? Hoy no hay lint que cace la contradicción — se descubrió porque el usuario estaba mirando. Ver si corresponde una guarda en `lint-harness` o si es un chequeo semántico (requiere entender el significado, decisión 0003) y por lo tanto no es automatizable barato.

## Contexto

Se desprende del registro de la preferencia (misma sesión). No bloquea nada: `amp:planificar` sigue funcionando, solo que su texto empuja en la dirección equivocada y el agente tiene que ignorarlo a favor de la preferencia.

## Notas de implementación

Ejecutado el 02/08/2026, tras una **segunda ocurrencia** del mismo caso: corriendo `amp:planificar`, el agente metió tres decisiones independientes dentro de una sola opción. Ocho días entre el diagnóstico y el arreglo, con el texto empujando en contra todo ese tiempo.

Las tres preguntas abiertas quedaron contestadas:

- **Se reescribió la sección entera**, no la fila de las independientes. Dar vuelta solo esa dejaba conviviendo el `hasta 4 juntas` y la regla de cierre (*«¿la respuesta cambia cómo formulo otra? No → se pueden agrupar»*), o sea dos instrucciones opuestas en la misma sección para que el agente elija una. Las cuatro categorías colapsaron a dos: **la decisión sola** y **la cola final de confirmaciones**, con el test *«¿tiene que decidir o ratificar?»* para separarlas.
- **El texto de la regla no se repite: se nombra la preferencia.** Repetirlo la habría dejado viviendo en dos archivos que viajan por caminos distintos —`PREFERENCIAS.md` dentro de `base/`, este `SKILL.md` dentro del plugin— sin ningún control que los compare, así que la próxima reformulación de la preferencia habría dejado la habilidad enseñando la versión vieja (conocimiento Base-0001).
- **La pregunta de fondo se mudó**, sin resolver, al plan `Por que las preferencias cargadas no se aplican` (Local-0089), que nació el mismo día y es su lugar natural: acá se arregló la contradicción concreta, no el mecanismo que la deja pasar.

Se sumó además, a pedido del usuario, un **filtro previo al árbol de decisión**: si la respuesta sale del conocimiento del repo, de sus decisiones y su glosario, o de mirar el Producto del Propósito y su código, el agente la resuelve y sigue en vez de preguntar. Existía una versión débil de esa regla en la sección anterior (*«explorar en vez de preguntar»*); se sacó de ahí al absorberla, para no dejar el mismo dato en dos lugares.

Alcance real: `funcionalidades/amp/skills/planificar/SKILL.md`, copia única verificada. Publicado en `amp` 0.23.0.
