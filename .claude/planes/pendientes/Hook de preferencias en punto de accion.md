# Hook de preferencias en punto de acción

## Contexto (incidente que lo origina)

Sesión del 2026-07-19 en `como-uso-claude`: el agente violó la primera preferencia de Comunicación ("al preguntar por una decisión, dar SIEMPRE ejemplos concretos de cada postura") **en el segundo turno de la sesión**, con las preferencias recién cargadas y el contexto fresco. Más tarde, misma sesión: ejecutó (creó y corrió una routine cloud) sin mostrar la configuración final para confirmación.

Diagnóstico acordado con Javier: las preferencias cargadas por `@import` están en contexto pero **no funcionan como control en el punto de acción** — al armar una pregunta o ejecutar, la atención del modelo va a la mecánica de la acción y nada lo obliga a chequearlas ahí. No es un problema de "contexto largo": falló con contexto corto.

Evidencia de qué sí funciona: el modo caveman de esa sesión no se violó ni una vez — porque un hook lo **re-inyecta en cada prompt**. Repetición en el punto de acción >> carga única al inicio.

**Segundo incidente (2026-07-19, este repo, sesión de skills operativas):** el agente abrió una decisión estructural con `AskUserQuestion` de opciones cortas sin la mecánica de cada postura — misma preferencia, violada de nuevo con contexto fresco. Corrección de Javier en el momento: *"prefiero no usar las multiple choice porque no le dan contexto para decidir"* — preguntó además si eso estaba en la memoria (no estaba). La sesión siguió en texto plano con ejemplos y funcionó bien. **Regla candidata que deja este incidente** (para asentar al ejecutar este plan, en la Base o como parte del texto del hook): las decisiones se preguntan en texto plano con ejemplos concretos de cada postura; multiple choice solo si cada opción lleva el contexto completo para decidir.

## Propuesta (iterar de menor a mayor)

1. **Hook `PreToolUse` sobre `AskUserQuestion`** — el punto exacto de la falla observada. Inyecta antes de cada pregunta al usuario: "las opciones deben llevar contexto y ejemplos concretos de cada postura (cómo es ahora vs. cómo quedaría, encadenando consecuencias)". Costo de contexto casi nulo, quirúrgico.
2. **(Si aparecen violaciones de otro tipo)** Digest de 2-3 líneas de las reglas de Comunicación vía `UserPromptSubmit` — cobertura total, algo más de ruido por turno.

## Costo de ejecución (medido 2026-07-22)

El plan no consideraba cuánto tarda el mecanismo. Medido en la PC de casa: un hook de Node completo (el `caveman-mode-tracker.js`, que lee stdin y parsea el prompt) cuesta **~65-70 ms**, de los cuales ~50 ms son el arranque del intérprete — la lógica y el I/O son ruido. Inyectar texto estático con `cmd /c type archivo.txt`, sin intérprete, cuesta **~30 ms**. PowerShell cuesta 4-5× más que `cmd` y no va en el camino crítico.

Consecuencias para las dos opciones de la propuesta:

1. **`PreToolUse` sobre `AskUserQuestion`** — costo percibido nulo: se dispara pocas veces por sesión y en un momento en que el usuario ya espera al modelo. La latencia no es argumento en contra.
2. **Digest vía `UserPromptSubmit`** — sí es camino crítico (bloquea entre el mensaje del usuario y el arranque del modelo), pero con presupuesto <100 ms entra sobrado. Dos hooks del mismo evento corren **en paralelo**: agregar uno no suma latencia si es más rápido que el peor que ya está.

Si el hook inyecta **texto fijo**, usar `cmd /c type` en vez de Node (la salida cruda se inyecta como contexto en `UserPromptSubmit`; no hace falta emitir JSON). Node solo se justifica si hay que decidir según el prompt o el estado. Declarar `timeout` corto (1-2 s): en máquinas con antivirus corporativo un hook colgado paga el timeout entero **por mensaje** — es lo que pasó en la PC de la oficina (episodio y números completos en `como-uso-claude/.claude/conocimiento/latencia-hooks.md`).

## Entregable

- Probar el hook primero en un repo (p. ej. `como-uso-claude`, donde está documentado el incidente).
- Si funciona: incorporarlo a `inicializar-preferencias-trabajo` (y al orquestador) para que todos los repos lo hereden — las preferencias dejan de depender de la memoria del modelo en el punto donde más falla.

## Preguntas abiertas

- ¿El hook inyecta la regla textual de PREFERENCIAS.md (single source) o un resumen? Preferible leer del archivo para no duplicar.
- ¿Conviene un `PreToolUse` genérico configurable (tool → recordatorio) en vez de uno ad-hoc por herramienta?
