# Decisiones del proyecto

Registro de las decisiones **estructurales al propósito del repo**: las que definen cómo es o qué hace el repo en lo esencial, o que eligen un camino entre varios de forma que **condiciona el trabajo futuro**. **No** van las operativas triviales o efímeras ("busqué X en internet", "usé tal flag"). Ante la duda: ¿esto condiciona el repo a futuro? Sí → va.

Una fila por decisión:

- **N°** — secuencial (`0001`, `0002`, …), referencia estable.
- **Decisión** — qué se decidió y por qué, en una frase (para las simples).
- **Fecha** — `AAAA-MM-DD`.
- **Estado** — `vigente` o `reemplazada por NNNN`. Para revertir no se borra: se agrega una nueva y se marca la vieja.
- **Detalle** — link a `NNNN-slug.md` **solo si la decisión requiere conceptualización mayor** (contexto, alternativas, consecuencias); `—` si es simple.

| N° | Decisión | Fecha | Estado | Detalle |
|----|----------|-------|--------|---------|
| 0001 | El repo son **herramientas para agentes de propósito general (multipropósito)**, no un inicializador de repos de software: el usuario define el propósito del repo y los subsistemas se llenan con lo aprendido para lograrlo (ej.: agente contable con gnucash, análisis de casas, prueba de modelos). Se puede instalar sobre un repo vacío **o sobre uno que ya tenga cosas** (idempotente/reconciliable). | 2026-07-18 | vigente | — |
| 0002 | **Patrón de subsistema:** un `INDICE.md` (siempre en contexto) con **entradas**; cada entrada puede referenciar un **documento** de detalle (`.md`) o una **carpeta** con su propio índice (recursivo). Guardado por un lint de integridad. **Sin grafo explícito** (no aporta a este tamaño de repo). Síntesis propia, sin atribución externa. | 2026-07-18 | vigente | — |
| 0003 | **Integridad en dos capas:** mecánica (lints `.js`, sin LLM: refs, huérfanos, índice, colisiones) **obligatoria para todo subsistema que persiste estado**; semántica (contradicciones, incompatibilidades, duplicación, staleness — requiere LLM) hoy informal, pendiente de formalizar. Los operacionales (`setup-completo`, `planificar`) no llevan lint: no guardan estado. | 2026-07-18 | vigente | — |
| 0004 | **Gobernanza de terminología:** el agente no acuña términos del dominio por cuenta propia; prefiere las palabras del usuario. **Español corriente en todo**: nada de palabras inventadas o raras (aunque suenen técnicas), ni en prosa ni en diagramas — no solo en los registros. Gate duro en registros canónicos (glosario, decisiones): ningún término acuñado se asienta sin ratificación; en prosa/diagramas se usa marcado como propuesto. (Motivada por dos inventos que se colaron: "sustrato" al glosario/decisión, y "acretar" a un diagrama del README.) | 2026-07-18 | vigente | — |
