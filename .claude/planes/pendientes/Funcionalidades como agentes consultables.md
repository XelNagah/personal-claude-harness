# Funcionalidades como agentes consultables

**Estado: Diferido · Creado 26-07-19.** Idea a analizar más adelante: que cada subsistema pueda **encarnarse como un agente con el que se dialoga** — "che, agente conocimiento, ¿sabemos algo de X?" y ese agente busca en su subsistema (contexto propio) y responde, sin volcar todo el material leído al contexto del agente principal. Diferido porque su valor depende del **volumen** de cada subsistema, y cuánto crece cada uno depende del propósito del repo (multipropósito) — hoy no se sabe.

## La idea

Un agente por subsistema, consultable en lenguaje natural, que responde desde **su** contexto. El agente principal pregunta y recibe solo la respuesta destilada — no las páginas que el subagente leyó para responder. Complementa el modelo actual, **no lo reemplaza** (ver más abajo).

## Cómo funciona el mecanismo (ya verificado)

- Un subagente corre en **contexto separado**; devuelve **un solo informe final**. Lo que lee por el camino no entra al contexto principal. ⇒ El aislamiento que la idea busca es real.
- Sabor **fresco** (arranca en blanco, sin memoria de llamadas previas), no *fork*. Sin estado entre llamadas: cada consulta re-lee la base. Si se lo mantiene vivo para acumular, su contexto crece sin techo y se pierde la ventaja.

## Análisis hecho (26-07-19)

**Decisión ya tomada en esta sesión: complementa, no reemplaza.** El modelo actual (decisión 0002) tiene los `INDICE.md` **siempre en contexto**, lo que da *conciencia ambiente* (el principal sabe que algo existe sin preguntar). Reemplazar eso por consultas a agentes haría perder esa conciencia. El agente consultable es un **camino opcional** para consulta pesada, encima del índice-siempre-cargado.

**La idea mezcla dos cosas distintas:**

- **(a) Exploración del repo** — "¿dónde está X en el repo?" (busca en código/archivos). **Ya existe de fábrica**: los subagentes `Explore` y `general-purpose` de Claude Code hacen exactamente esto. Nada que construir. El ejemplo original ("¿dónde está tal cosa en este repo?") cae acá.
- **(b) Consulta a un subsistema curado** — "¿qué *decidimos* / *aprendimos* sobre X?" (responde desde conocimiento/decisiones/memoria). Esto sí sería nuevo, pero **su valor es proporcional al volumen de la base**.

**Por qué se difiere — el valor es condicional al tamaño (mismo argumento que la 0002, "no aporta a este tamaño de repo"):**

- Consulta a conocimiento hoy: la base está **vacía** ⇒ no hay nada que leer ⇒ no aporta.
- Consulta a decisiones/glosario hoy: 6 y 8 filas, **ya cargadas siempre** en el contexto principal ⇒ se responde directo, el agente solo agrega latencia ⇒ no aporta.
- Consulta a conocimiento con, digamos, 200 páginas (futuro): sintetizar las 8 relevantes **sin acumularlas** en el contexto principal ⇒ **ahí sí aporta**.

## Condición de gatillo (cuándo retomar)

Cuando un subsistema curado (conocimiento sobre todo; también memoria) crezca lo suficiente como para que leer sus detalles on-demand **acumule material pesado** en el contexto principal durante una tarea típica. Mientras las bases sean chicas o el índice-siempre-cargado alcance, no construir nada.

## Qué quedaría por resolver al retomar

- Umbral concreto de "voluminoso" que justifica el agente (¿nº de páginas?, ¿tokens del subsistema?).
- Qué subsistemas lo ameritan (probablemente solo conocimiento y memoria; no preferencias/glosario/decisiones, que son chicos por naturaleza).
- Empaquetado: ¿un agent-type por subsistema? ¿Cómo se instala junto con la funcionalidad?
- Relación con las skills operativas del plan hermano (mecanismo distinto, mismo objetivo de fondo — no confundir).

## No confundir con
El plan [Proponer skills operativas por funcionalidad](Proponer%20skills%20operativas%20por%20funcionalidad.md): eso es *skills para administrar* cada subsistema. Esto es *el subsistema encarnado como agente consultable*. Cosas distintas.
