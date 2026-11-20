# Skill `/contrastar` — contraste contra la sabiduría del repo

**Estado: Ejecutado · Creado 26-07-21 · Cerrado 26-11-18.** Pedido de Javier: un skill `/contrastar` similar a `/planificar` pero que, **en vez de producir un plan, contraste lo solicitado** contra el conocimiento, el glosario y las decisiones. Si del contraste aparecen elementos nuevos válidos, que los **incorpore al subsistema apropiado**.

## Qué se pide

Una skill que toma una entrada (una idea, una afirmación, un texto, un plan) y la **contrasta** contra las tres bases de saber del repo:

- **Conocimiento** — ¿contradice o confirma lo que el agente sabe del dominio?
- **Glosario** — ¿usa términos que chocan con los canónicos? ¿introduce sinónimos no registrados?
- **Decisiones** — ¿re-abre o contradice algo ya decidido?

Salida: **no** un plan, sino el **resultado del contraste** (coincidencias, choques, huecos) + la incorporación de lo nuevo válido al subsistema que corresponda, con ratificación donde el subsistema la exige (glosario/decisiones, decisiones 0004/0016).

### Dos direcciones de entrada (requisito de 26-07-21)

`/contrastar` no solo mira **hacia adelante** (lo que se *solicita*, antes de hacerlo). Debe aceptar también material **hacia atrás**: **lo ejecutado o la conversación** de una tarea ya hecha, para verificar que su aprendizaje quedó asentado. Es el mismo contraste con la sabiduría del repo, con otra fuente. Esta dirección la consume el plan [Verificar que el aprendizaje quede asentado en los subsistemas](Verificar%20que%20el%20aprendizaje%20quede%20asentado%20en%20los%20subsistemas.md): al cerrar un plan (transición a Ejecutado) se invoca `/contrastar` contra lo ejecutado / la conversación, y **`/contrastar` es el que persiste**. Diseñar la entrada del skill para las dos direcciones desde el arranque.

## Se distingue de / se cruza con

- **`planificar`:** ya lee las tres bases y las escribe sobre la marcha, pero su objetivo es **descubrir qué hacer** y producir un plan criticado. `contrastar` es más acotado: el contraste **es** el producto, no un paso hacia un plan. Riesgo de solape alto → definir el límite (¿`contrastar` es un pedazo de `planificar` extraído como skill propia? ¿o un modo de `planificar`?).
- **`converger-terminologia`:** ya contrasta texto contra el glosario. `contrastar` generaliza a las tres bases. ¿`converger-terminologia` queda como caso particular suyo?
- **Plan [Capa semántica de coherencia](Capa%20semantica%20de%20coherencia%20-%20contradicciones%20e%20incompatibilidades.md)** (Diferido) y **[Chequear el plan escrito contra la sabiduría del repo](Chequear%20el%20plan%20escrito%20contra%20la%20sabiduria%20del%20repo.md)** (Nuevo): `contrastar` es una materialización de esa capa semántica, **on-demand sobre una entrada dada**. Coordinar — no construir tres mecanismos distintos para lo mismo.
- **Decisión 0003:** la capa semántica está *"hoy informal, pendiente de formalizar"*; esta skill la aterriza para un momento y un archivo concretos.

## Preguntas abiertas (para diseñar con `planificar`)

- ¿Contra qué contrasta exactamente: solo las tres bases (conocimiento, glosario, decisiones), o también memoria y planes?
- ¿Qué hace con lo nuevo válido: lo **propone y espera ratificación** (glosario/decisiones lo exigen por 0004/0016), o **incorpora directo** lo que no requiere control (p. ej. una memoria)?
- ¿Es **Skill del Agente Multipropósito** (transversal, como `planificar`) o de Subsistema? Probablemente transversal → funcionalidad propia.
- **Nombre:** `contrastar` es verbo (cumple 0015); ratificar (0016). Alias EN posible: *contrast* / *cross-check*.
- ¿El solape con `planificar` es tan grande que conviene un **modo** de `planificar` en lugar de una skill nueva?

## Insumo externo (2026-07-23): artículo de bucles de verificación

Anthropic, *"Building verification loops in Claude Code with skills"* (2026-07-22). Aporta a este plan:

- **La pregunta "¿skill nueva o modo de `planificar`?" se ilumina con el eje standalone / embedded / chained.** `/contrastar` es un **verificador que se encadena** (o se invoca standalone) sobre una entrada dada — el artículo lo trata como patrón de primera clase, distinto de embeberlo en la skill que produce.
- **El truco directamente aplicable:** *"chaining es cómo agregás verificación a una skill que no podés modificar — una skill que la envuelve y después invoca la de verificación"*. Es el mecanismo para la dirección **hacia atrás** de `/contrastar` (contrastar lo ejecutado sin tocar la skill que lo produjo).
- **Refuerza el "no construir tres mecanismos distintos":** el artículo empuja a una sola cadena reusable, no a un chequeo ad-hoc por flujo.
- Análisis completo del solapamiento en el conocimiento de `como-uso-claude` (`documentos-investigacion/bucles-de-verificacion.md`).

## Depende de

Diseñarla con `planificar` antes de construir. Coordinar con los planes de capa semántica (no duplicar el mecanismo).

## Notas de implementación

Se construyó como la habilidad transversal `amp:contrastar` (`funcionalidades/amp/skills/contrastar/SKILL.md`), que entró con el commit `32f0459` (02/09/2026) junto con el Contraste automático. Delega la lectura en el subagente `contrastador`.

Diferencias con lo planificado:

- **Contrasta contra más registros que los tres pedidos:** glosario, relaciones vetadas, decisiones y planes vivos.
- **No escribe en ningún registro** (`SKILL.md:70`): trae las filas que el material toca y deja el veredicto y la incorporación al agente y al usuario, con las habilidades de registro de cada subsistema. El plan pedía que incorporara lo nuevo; eso no se construyó, y no hay una decisión registrada que lo descarte: es el diseño de la habilidad.
- **La dirección hacia atrás** (contrastar lo ejecutado al cerrar una tarea) no entró en esta habilidad. La cubre en parte el aviso al cerrar una tarea, del plan Local-0111 (Avisar al cerrar una tarea que hay algo para asentar), y lo que falte sigue en el plan Local-0039 (Verificar que el aprendizaje quede asentado en los subsistemas).
- La pregunta de si era un modo de `planificar` se resolvió por la habilidad aparte: `planificar` la reutiliza delegando en el mismo subagente.
