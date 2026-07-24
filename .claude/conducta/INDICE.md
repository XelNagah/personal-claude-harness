# Reglas de conducta

Registro de las **reglas de conducta** del repo: cada fila ata un **momento** (del vocabulario en `MOMENTOS.md`) a una **acción**, para asegurar "cuando hagas X, asegurate de Y". El hook repartidor `establecer-conducta/` lee este registro **vivo** en cada momento y entrega la regla que corresponde — agregar o cambiar una regla **no toca la config del hook**. Una fila por regla.

- **Regla** — qué asegura, en una frase (verbo).
- **Momento** — a qué momento se ata; tiene que existir en `MOMENTOS.md`.
- **Clase** — `inyectar` (el agente lee un texto y actúa con su juicio) · `correr` (una Herramienta lo resuelve sin juicio) · `bloquear` (se frena la acción; solo donde Y es sin juicio y el falso positivo es imposible).
- **Contenido** — el texto a inyectar (`inyectar`), la Herramienta a correr (`correr`) o la condición de bloqueo (`bloquear`).
- **Estado** — `vigente` (se entrega) · `pendiente` (declarada, su momento aún no tiene repartidor) · `obsoleto` (no se entrega; se puede depurar).

> **Origen del contenido:** las reglas se separan por origen en dos secciones — **Reglas Base** (las manda el harness; el nivelador `amp-actualizar` las reemplaza enteras al poner al día un AMP) y **Reglas del Propósito** (las suma cada repo; el nivelador no las toca). Hoy tienen repartidor los momentos `cada turno` (`UserPromptSubmit`) y `al escribir` (`PreToolUse`); la regla de momento `al cerrar tarea` (`Stop`) queda en `pendiente` (honesta, sin entregar) hasta que se sume su repartidor.

## Reglas Base

Las que instala el harness (origen **Base**). El nivelador `amp-actualizar` reemplaza **esta sección entera** al poner al día un AMP; nunca abre la de abajo.

| Regla | Momento | Clase | Contenido | Estado |
|-------|---------|-------|-----------|--------|
| Respetar las preferencias cargadas | cada turno | inyectar | Antes de responder, respetá las preferencias ya cargadas (PREFERENCIAS.md): en particular fechas en formato argentino al conversar, ejemplos del dominio del repo (nunca deportivos) y temporales en `.claude/tmp/`. | vigente |
| No acuñar terminología del dominio | cada turno | inyectar | No acuñes términos del dominio (usá el glosario, proponé en Propuestos, nunca uses vetados). Antes de una palabra de origen inglés, aplicá el test: ¿la diría tal cual un desarrollador hispanohablante en una charla en español (`commit`, `deploy`, `parsear`, `hardcodear`, `bug`) o es una metáfora o modismo del inglés (`churn`, `wedge`, `dogfooding`, `staleness`, `feasibility`)? Lo segundo → traducilo, le resulta raro al usuario. Ante la duda, traducí. | vigente |
| Preguntar antes de redefinir o remover algo canónico | cada turno | inyectar | Antes de **remover, renombrar o redefinir** algo canónico (una definición del glosario, una decisión) o con dependientes: proponé y esperá la ratificación del usuario. El agente propone; ratificar, vetar y redefinir son potestad del usuario. Aplica también a **definiciones y remociones**, no solo al alta de un término. | vigente |
| Contrastar contra la sabiduría del repo al escribir | al escribir | inyectar | Acabás de escribir un `.md` del harness (`.claude/`): contrastá lo escrito contra el test de demarcación, el glosario y las decisiones — ¿va en este subsistema?, ¿contradice algo asentado?, ¿usaste un término vetado o inventado? Corregí si hace falta. | vigente |
| Registrar en el subsistema cuando algo cambia | al cerrar tarea | inyectar | Si en esta tarea cambió algo que otro subsistema debe saber (memoria, decisión, conocimiento, semántica, herramientas), registralo antes de cerrar. | pendiente |

## Reglas del Propósito

Las que cada repo suma para su Propósito (origen **aprendido**). El nivelador **no toca esta sección**. Hoy vacía: cuando el repo sume una regla propia, va acá con las mismas columnas que la tabla de arriba.
