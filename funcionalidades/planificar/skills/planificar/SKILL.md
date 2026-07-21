---
name: planificar
description: Sesión de análisis que interroga un plan o una idea contra la sabiduría del repo (glosario + decisiones + conocimiento) hasta llegar a un acuerdo, para descubrir qué hacer, y lo critica (problemas, faltantes, oportunidades, sobreingeniería). Actualiza glosario y decisiones sobre la marcha. Use when el usuario dice "planificar", "analizá el plan", "cuestionalo", "revisá contra las docs", o después de armar un plan (post modo plan).
---

# Planificar — análisis crítico contra la sabiduría del repo

Interrogá el plan o la idea a fondo, sin pausa, hasta llegar a un **entendimiento compartido**. No es para validar algo ya decidido: es para **descubrir qué hay que hacer** a través del análisis, teniendo en cuenta lo que el repo ya sabe. Corre en dos momentos: durante el diseño de una idea, y **después del modo plan** sobre un plan ya formado.

## Antes de arrancar: leer la sabiduría del repo

Si existen, leer:

- **`.claude/glosario/INDICE.md`** — la terminología canónica del dominio (y las páginas de detalle que enlace).
- **`.claude/decisiones/INDICE.md`** — las decisiones estructurales ya tomadas (y su detalle).
- **`.claude/conocimiento/INDICE.md`** — lo que el agente sabe del dominio.

Si alguna no existe, seguir igual (la sesión degrada, no se rompe). Si una pregunta se puede responder **explorando el código o esas docs**, explorar en vez de preguntar.

## El modo de preguntar

Recorré el **árbol de decisión**, resolviendo las dependencias una por una. Para **cada** pregunta, **ofrecé siempre tu respuesta recomendada** — así el usuario responde rápido (acepta o corrige) en vez de arrancar de cero. Pero **esperá su respuesta**: la recomendada es una sugerencia para agilizar, **no un default que se toma solo**. No avanzar sin que responda.

Agrupá según el tipo de pregunta:

- **Cruces que mandan** (los que reconfiguran lo de abajo) → **una por una, a fondo**, bien visibles, para que el usuario pueda redirigir. Nunca esconder un cruce estructural dentro de una tanda.
- **Racimo de preguntas independientes** (ninguna depende de la respuesta de otra) → **una sola tanda** (hasta 4 juntas). Preguntarlas de a una desperdicia turnos.
- **Preguntas dependientes** (una necesita la respuesta de la anterior para siquiera existir) → **secuenciales**, nunca en tanda.
- **La cola final de confirmaciones** (las que casi seguro son "sí") → presentarlas en **una sola tanda** con la recomendada de cada una, para que el usuario las revise juntas y corrija lo que no le cierre en una respuesta. Evita el arrastre de preguntar cada una por separado — pero igual espera su respuesta a la tanda.

Regla para decidir tanda vs. una por una: **¿la respuesta de esta pregunta cambia cómo formulo otra?** Sí → secuencial. No → se pueden agrupar.

## Las dos miradas

Aplicá las dos sobre el plan:

### 1. Coherencia contra la sabiduría del repo

- **Contra el glosario:** si el usuario usa un término que choca con uno canónico, marcarlo al toque ("el glosario llama X a esto, vos parecés querer decir Y — ¿cuál es?"). Si usa un término vago o sobrecargado, proponer el término canónico. Si aparece un alias conocido, reconocerlo.
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

- **Se resuelve un término** → actualizar `.claude/glosario/INDICE.md` (fila del concepto; alias si aparecieron). El glosario es solo terminología, no detalles de implementación.
- **Se cristaliza una decisión estructural** (fija operatoria funcional, o elige un camino que condiciona el futuro) → registrarla en `.claude/decisiones/INDICE.md`. Ofrecerla **solo** si es estructural — no las triviales u operativas.
- **Se averigua algo del dominio que costó descubrir** (cómo funciona un sistema externo, un formato, una restricción real) → asentarlo en `.claude/conocimiento/`. La prueba: *¿seguiría siendo cierto si este repo no existiera?* Sí → es conocimiento; no → es memoria o decisión. **Este análisis lee las tres bases; también tiene que escribirlas** — el hallazgo que se explica en la conversación y no se asienta se vuelve a averiguar en la sesión siguiente.
- Al cerrar, correr los lints correspondientes (`lint-glosario`, `lint-decisiones`, `lint-conocimiento`) si se tocaron esas carpetas.

## Cierre

Cuando se llega al entendimiento compartido: resumir el plan acordado, las decisiones que quedaron registradas, y los términos que se afinaron. Si esto corrió después del modo plan, el plan revisado queda listo para ejecutar.
