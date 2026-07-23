# Momentos de conducta

Vocabulario de los **momentos** válidos a los que una regla de conducta puede atarse. Un momento es un **evento de hook + una condición que la máquina evalúa sin juicio** (decisión 0021); es agente-agnóstico, y su realización depende de que el agente tenga un repartidor para ese evento. Este archivo es la semilla del registro de momentos: hoy alcanza el vocabulario (nombre · qué representa · evento · disponibilidad). Crece a las columnas completas (condición fina, disponibilidad por agente) cuando se sumen repartidores nuevos. El `lint-conducta` lo lee para validar que toda regla apunte a un momento existente y que ninguna regla `vigente` cuelgue de un momento sin repartidor.

- **Momento** — nombre canónico, en español corriente.
- **Qué representa** — el punto del flujo, en una línea.
- **Evento de hook** — el evento que lo dispara (+ condición, si la hay).
- **Disponibilidad** — `activo` (hay repartidor construido que lo entrega) o `declarado` (definido, sin repartidor todavía → sus reglas van en estado `pendiente`).

| Momento | Qué representa | Evento de hook | Disponibilidad |
|---------|----------------|----------------|----------------|
| cada turno | Antes de cada respuesta del agente, sin condición. | `UserPromptSubmit` | activo |
| al escribir | Antes de escribir o editar un archivo del repo. | `PreToolUse` sobre `Write`\|`Edit` | declarado |
| al cerrar tarea | Al terminar de responder una tarea. | `Stop` | declarado |

> Paridad: `cada turno` (`UserPromptSubmit` + `additionalContext`) tiene paridad Claude Code ↔ Codex (conocimiento `hooks-claude-code`). Los momentos `declarado` esperan su repartidor; `al escribir` (`PreToolUse`) es Claude-first (Codex intercepta solo Bash, decisión 0021).
