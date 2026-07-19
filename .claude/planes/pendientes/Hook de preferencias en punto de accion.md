# Hook de preferencias en punto de acción

## Contexto (incidente que lo origina)

Sesión del 2026-07-19 en `como-uso-claude`: el agente violó la primera preferencia de Comunicación ("al preguntar por una decisión, dar SIEMPRE ejemplos concretos de cada postura") **en el segundo turno de la sesión**, con las preferencias recién cargadas y el contexto fresco. Más tarde, misma sesión: ejecutó (creó y corrió una routine cloud) sin mostrar la configuración final para confirmación.

Diagnóstico acordado con Javier: las preferencias cargadas por `@import` están en contexto pero **no funcionan como gate en el punto de acción** — al armar una pregunta o ejecutar, la atención del modelo va a la mecánica de la acción y nada lo obliga a chequearlas ahí. No es un problema de "contexto largo": falló con contexto corto.

Evidencia de qué sí funciona: el modo caveman de esa sesión no se violó ni una vez — porque un hook lo **re-inyecta en cada prompt**. Repetición en el punto de acción >> carga única al inicio.

## Propuesta (iterar de menor a mayor)

1. **Hook `PreToolUse` sobre `AskUserQuestion`** — el punto exacto de la falla observada. Inyecta antes de cada pregunta al usuario: "las opciones deben llevar contexto y ejemplos concretos de cada postura (cómo es ahora vs. cómo quedaría, encadenando consecuencias)". Costo de contexto casi nulo, quirúrgico.
2. **(Si aparecen violaciones de otro tipo)** Digest de 2-3 líneas de las reglas de Comunicación vía `UserPromptSubmit` — cobertura total, algo más de ruido por turno.

## Entregable

- Probar el hook primero en un repo (p. ej. `como-uso-claude`, donde está documentado el incidente).
- Si funciona: incorporarlo a `inicializar-preferencias-trabajo` (y al orquestador) para que todos los repos lo hereden — las preferencias dejan de depender de la memoria del modelo en el punto donde más falla.

## Preguntas abiertas

- ¿El hook inyecta la regla verbatim de PREFERENCIAS.md (single source) o un resumen? Preferible leer del archivo para no duplicar.
- ¿Conviene un `PreToolUse` genérico configurable (tool → recordatorio) en vez de uno ad-hoc por herramienta?
