# Reglas de conducta

Registro de las **reglas de conducta** del repo: cada fila ata un **momento** (del vocabulario en `MOMENTOS.md`) a una **acción**, para asegurar "cuando hagas X, asegurate de Y" (decisión 0021). El hook repartidor `establecer-conducta/` lee este registro **vivo** en cada momento y entrega la regla que corresponde — agregar o cambiar una regla **no toca la config del hook**. Una fila por regla.

- **Regla** — qué asegura, en una frase (verbo).
- **Momento** — a qué momento se ata; tiene que existir en `MOMENTOS.md`.
- **Clase** — `inyectar` (el agente lee un texto y actúa con su juicio) · `correr` (una Herramienta lo resuelve sin juicio) · `bloquear` (se frena la acción; solo donde Y es sin juicio y el falso positivo es imposible).
- **Contenido** — el texto a inyectar (`inyectar`), la Herramienta a correr (`correr`) o la condición de bloqueo (`bloquear`).
- **Estado** — `vigente` (se entrega) · `pendiente` (declarada, su momento aún no tiene repartidor) · `obsoleto` (no se entrega; se puede depurar).

> **Base instalada** (decisión 0021): las cuatro primeras filas son la Base del harness — respetar preferencias, no acuñar terminología, contrastar al escribir, registrar cuando algo cambia. Sobre esa Base, cada repo suma reglas de su Propósito. Hoy tienen repartidor los momentos `cada turno` (`UserPromptSubmit`) y `al escribir` (`PreToolUse`); la regla de momento `al cerrar tarea` (`Stop`) queda en `pendiente` (honesta, sin entregar) hasta que se sume su repartidor.

| Regla | Momento | Clase | Contenido | Estado |
|-------|---------|-------|-----------|--------|
| Respetar las preferencias cargadas | cada turno | inyectar | Antes de responder, respetá las preferencias ya cargadas (PREFERENCIAS.md): en particular fechas en formato argentino al conversar, ejemplos del dominio del repo (nunca deportivos) y temporales en `.claude/tmp/`. | vigente |
| No acuñar terminología del dominio | cada turno | inyectar | No acuñes términos del dominio: usá los del glosario, proponé en la columna Propuestos y nunca uses términos vetados ni inventes palabras (español corriente). | vigente |
| Contrastar contra la sabiduría del repo al escribir | al escribir | inyectar | Acabás de escribir un `.md` del harness (`.claude/`): contrastá lo escrito contra el test de demarcación (decisión 0020), el glosario y las decisiones — ¿va en este subsistema?, ¿contradice algo asentado?, ¿usaste un término vetado o inventado? Corregí si hace falta. | vigente |
| Registrar en el subsistema cuando algo cambia | al cerrar tarea | inyectar | Si en esta tarea cambió algo que otro subsistema debe saber (memoria, decisión, conocimiento, glosario, herramientas), registralo antes de cerrar. | pendiente |
