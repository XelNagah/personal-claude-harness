---
name: planificar
description: Sesión de análisis que interroga un plan o una idea contra la sabiduría del repo (semántica + decisiones + conocimiento) hasta llegar a un acuerdo, para descubrir qué hacer, y lo critica (problemas, faltantes, oportunidades, sobreingeniería). Actualiza semántica y decisiones sobre la marcha. Use when el usuario dice "planificar", "analizá el plan", "cuestionalo", "revisá contra las docs", o después de armar un plan (post modo plan).
---

# Planificar — análisis crítico contra la sabiduría del repo

Interrogá el plan o la idea a fondo, sin pausa, hasta llegar a un **entendimiento compartido**. No es para validar algo ya decidido: es para **descubrir qué hay que hacer** a través del análisis, teniendo en cuenta lo que el repo ya sabe. Corre en dos momentos: durante el diseño de una idea, y **después del modo plan** sobre un plan ya formado.

## Antes de arrancar: leer la sabiduría del repo

Si existen, leer:

- **`.claude/semantica/GLOSARIO.md`** y **`.claude/semantica/TERMINOLOGIA-FARLOPA.md`** — la terminología canónica del dominio (glosario) y las relaciones término→significado vetadas (Terminología Farlopa), más las páginas de detalle que enlacen.
- **`.claude/decisiones/INDICE.md`** — las decisiones estructurales ya tomadas (y su detalle).
- **`.claude/conocimiento/INDICE.md`** — lo que el agente sabe del dominio.

Si alguna no existe, seguir igual (la sesión degrada, no se rompe).

## El modo de preguntar

**Antes de preguntar, fijate si la pregunta ya tiene respuesta.** Si sale de lo que el agente sabe —el conocimiento del repo, sus decisiones, su glosario— o de mirar el Producto del Propósito y su código, **resolvela vos y seguí**: decí en el texto de dónde salió la respuesta y no la conviertas en pregunta. Al usuario solo llega lo que **tiene que decidir** porque no está decidido ni es averiguable. Preguntar lo averiguable le gasta un turno en algo que el agente podía cerrar solo, y encima lo obliga a reconstruir un contexto que ya está escrito.

Con lo que sí queda, recorré el **árbol de decisión** resolviendo **una decisión por vez**. Para **cada** pregunta, **ofrecé siempre tu respuesta recomendada** — así el usuario responde rápido (acepta o corrige) en vez de arrancar de cero. Pero **esperá su respuesta**: la recomendada es una sugerencia para agilizar, **no un valor que se toma solo**. No avanzar sin que responda.

Cómo se presenta cada una lo fija la Preferencia Base-0002, que ya está siempre en contexto: acá no se repite su fundamento, se aplica. Salen dos formas, y ninguna más:

- **La decisión, sola.** Todo lo que el usuario tenga que **decidir** va en una pregunta propia, con su contexto desplegado en el texto de la respuesta **antes** de preguntarla — nunca comprimido dentro de las opciones. Vale igual para la pregunta de fondo que reconfigura todo lo de abajo y para una menor que no depende de ninguna otra: **agrupar dos decisiones porque son independientes entre sí es exactamente lo que la preferencia prohíbe.**
- **La cola final de confirmaciones.** Las que casi seguro son "sí" —el trámite que cierra lo ya acordado— pueden ir juntas, con la recomendada de cada una visible. Es la única excepción.

El test antes de agrupar: **¿el usuario tiene que decidir algo, o ratificar lo que ya decidió?** Decidir → sola. Ratificar → puede ir en la cola.

## Las dos miradas

Aplicá las dos sobre el plan:

### 1. Coherencia contra la sabiduría del repo

- **Contra la semántica (glosario + Terminología Farlopa):** si el usuario usa un término que choca con uno canónico, marcarlo al toque ("el glosario llama X a esto, vos parecés querer decir Y — ¿cuál es?"). Si usa un término vago o sobrecargado, proponer el término canónico. Si aparece un alias conocido, reconocerlo. Si usa un término en un significado vetado, señalarlo.
- **Contra las decisiones:** si el plan re-abre algo ya decidido o lo contradice, sacarlo a la luz ("la decisión NNNN ya fijó esto así por tal razón — ¿lo estás cambiando a propósito?").
- **Contra el conocimiento y el código:** si el plan afirma cómo funciona algo, verificar que el código o el conocimiento coincidan. Si hay contradicción, mostrarla.

### 2. Crítica de calidad

Buscar en el plan:

- **Problemas** — lo que está mal o va a fallar.
- **Faltantes** — lo que el plan no cubre y debería.
- **Oportunidades de mejora** — lo que se puede hacer mejor.
- **Sobreingeniería** — lo que sobra, lo que resuelve un problema que no existe.

Discutir con **escenarios concretos**: inventar casos borde que obliguen a ser preciso sobre los límites del plan.

## Actualizar la sabiduría sobre la marcha

A medida que las cosas se cristalizan, no las acumules — capturalas en el momento:

- **Se resuelve un término** → actualizar `.claude/semantica/GLOSARIO.md` (fila del concepto; alias si aparecieron) o vetarlo en `.claude/semantica/TERMINOLOGIA-FARLOPA.md`. La semántica es solo terminología, no detalles de implementación.
- **Se cristaliza una decisión estructural** (fija operatoria funcional, o elige un camino que condiciona el futuro) → registrarla en `.claude/decisiones/INDICE.md`. Ofrecerla **solo** si es estructural — no las triviales u operativas.
- **Se averigua algo reutilizable que costó descubrir** sobre el proyecto, el dominio, un sistema externo, un formato o una restricción real → asentarlo en `.claude/conocimiento/`. Si en cambio gobierna cómo actuar, derivarlo a Preferencias, Decisiones, Planes, Semántica, Herramientas o Conducta. **Este análisis lee las bases; también tiene que escribirlas**: el hallazgo que solo se explica en la conversación se vuelve a averiguar.
- Al cerrar, correr los lints correspondientes (`lint-semantica`, `lint-decisiones`, `lint-conocimiento`) si se tocaron esas carpetas.

## Cierre

Cuando se llega al entendimiento compartido: resumir el plan acordado, las decisiones que quedaron registradas, y los términos que se afinaron. Si esto corrió después del modo plan, el plan revisado queda listo para ejecutar.
