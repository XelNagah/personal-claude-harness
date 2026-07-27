# Momentos de conducta

Vocabulario de los **momentos** válidos a los que una regla de conducta puede atarse. Un momento es un **evento de hook + una condición que la máquina evalúa sin juicio**; es agente-agnóstico, y su realización depende de que el agente tenga un repartidor para ese evento. Este archivo es el punto de partida del registro de momentos: hoy alcanza el vocabulario (nombre · qué representa · evento · disponibilidad). Crece a las columnas completas (condición fina, disponibilidad por agente) cuando se sumen repartidores nuevos. El `lint-conducta` lo lee para validar que toda regla apunte a un momento existente y que ninguna regla `vigente` cuelgue de un momento sin repartidor.

- **Momento** — nombre canónico, en español corriente.
- **Qué representa** — el punto del flujo, en una línea.
- **Evento de hook** — el evento que lo dispara (+ condición, si la hay).
- **Disponibilidad** — `activo` (hay repartidor construido que lo entrega) o `declarado` (definido, sin repartidor todavía → sus reglas van en estado `pendiente`).

| Momento | Qué representa | Evento de hook | Disponibilidad |
|---------|----------------|----------------|----------------|
| al arrancar la sesión | Al iniciar la sesión, sin condición. Su realización corre una Herramienta y reenvía su salida; hoy muestra la Pantalla de bienvenida (bloque de estado → `systemMessage`, visible al usuario). | `SessionStart` | activo |
| cada turno | Antes de cada respuesta del agente, sin condición. | `UserPromptSubmit` | activo |
| al escribir | Al escribir o editar un `.md` de **cualquier parte del repo** — lo que el repo publica incluido, no solo los registros del Agente Multipropósito—, salvo el directorio de borradores `tmp/`. El `additionalContext` llega **junto al resultado** de la tool: es un recordatorio posterior a la escritura. El `deny`, en cambio, **sí** es previo: frena la escritura antes de que el archivo exista. | `PreToolUse` sobre `Write`\|`Edit`\|`apply_patch`, condición: **alguna** ruta tocada es `.md` fuera de `tmp/` | activo |
| al cerrar tarea | Al terminar de responder una tarea. | `Stop` | declarado |

> Paridad: `cada turno` (`UserPromptSubmit` + `additionalContext`) tiene paridad plena Claude Code ↔ Codex (conocimiento `hooks-claude-code`). `al arrancar la sesión` (`SessionStart` → `systemMessage`) anda en Claude Code, Codex y Gemini; Cursor no tiene banner nativo y degrada sin caja. `al escribir` **también corre en Codex** desde abril de 2026: toda edición pasa por `apply_patch`, que dispara `PreToolUse` y matchea como `apply_patch`, `Edit` o `Write` (conocimiento `hooks-codex-cli`; hasta entonces solo disparaba para Bash y el momento figuraba acá como Claude-first). Con una salvedad: **el `deny` todavía no frena en Codex** —el archivo se escribe igual, bug abierto del CLI—, así que ahí una regla `bloquear` degrada a aviso hasta que lo arreglen; se emite igual para que empiece a frenar sola el día que ocurra. Los momentos `declarado` esperan su repartidor.
