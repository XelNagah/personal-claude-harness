# Prompt: analizar un plan contra la sabiduría del repo

> **Uso:** pegar todo lo que sigue (desde la línea horizontal) a un agente de código, con un plan o una idea sobre la mesa. `<config>/` es el directorio nativo de tu harness (`.claude/`, `.codex/`, `.cursor/`, `.github/`, `.agent/`).

---

Analizá el plan o la idea a fondo, sin pausa, hasta llegar a un **entendimiento compartido**. No es para validar algo ya decidido: es para **descubrir qué hay que hacer** a través del análisis, teniendo en cuenta lo que el repo ya sabe.

## Antes de arrancar: leé la sabiduría del repo

Si existen, leé `<config>/glosario/INDICE.md` (terminología canónica), `<config>/decisiones/INDICE.md` (decisiones estructurales ya tomadas) y `<config>/conocimiento/INDICE.md` (lo que se sabe del dominio), con sus páginas de detalle. Si alguna no existe, seguí igual. Si una pregunta se puede responder explorando el código o esas docs, explorá en vez de preguntar.

## El modo de preguntar

Recorré el **árbol de decisión**, resolviendo las dependencias una por una. Para **cada** pregunta **ofrecé siempre tu respuesta recomendada** — así el usuario responde rápido (acepta o corrige) en vez de arrancar de cero. Pero **esperá su respuesta**: la recomendada es una sugerencia para agilizar, **no un default que se toma solo**.

- **Cruces que mandan** (reconfiguran lo de abajo) → una por una, a fondo, bien visibles. Nunca esconderlos en una tanda.
- **Preguntas independientes** (ninguna depende de otra) → una sola tanda (varias juntas).
- **Preguntas dependientes** (una necesita la respuesta de la anterior para existir) → secuenciales.
- **Cola final de confirmaciones** → una sola tanda con la recomendada de cada una, para revisarlas juntas y corregir lo que no cierre en una respuesta (igual esperá esa respuesta).

Regla: **¿la respuesta de esta pregunta cambia cómo formulo otra?** Sí → secuencial. No → se pueden agrupar.

## Las dos miradas

1. **Coherencia contra la sabiduría del repo.** Si un término choca con el glosario, marcarlo y proponer el canónico. Si el plan re-abre o contradice una decisión ya tomada, sacarlo a la luz. Si afirma cómo funciona algo, verificar contra el código/conocimiento.
2. **Crítica de calidad.** Buscar **problemas** (lo que va a fallar), **faltantes** (lo que no cubre y debería), **oportunidades de mejora** y **sobreingeniería** (lo que sobra). Discutir con escenarios concretos y casos borde.

## Actualizá la sabiduría sobre la marcha

Cuando se resuelve un término → actualizá el glosario. Cuando se cristaliza una decisión **estructural** (fija operatoria o elige un camino que condiciona el futuro) → registrala en decisiones. No acumules; capturá en el momento. Solo lo estructural, no lo trivial.

## Cierre

Al llegar al acuerdo: resumí el plan acordado, las decisiones registradas y los términos afinados. Si corrió después del modo plan, el plan revisado queda listo para ejecutar.
