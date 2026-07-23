# Índice de la base de conocimiento

Índice raíz de lo que el agente **sabe** sobre este proyecto. Solo punteros — una línea por página o sección, nunca contenido.

Los markdown de la raíz del repo (README y REGISTRO) son **documentación del proyecto**, no conocimiento de agente: no se listan acá.

Convención completa en la memoria [feedback base conocimiento](../memoria/feedback_base_conocimiento.md).

## Páginas

- [Modos de falla ante reglas escritas](modos-de-falla-ante-reglas-escritas.md) — cinco formas distintas en que un agente incumple una regla que tiene cargada (recita sin obedecer, negocia, deja las cosas afuera, pide permiso para escribir pero no para ubicar, se inventa reglas); el texto de arranque gobierna la conversación, no la acción.
- [grep y acentos en Windows](grep-y-acentos-en-windows.md) — `grep -i` con patrones acentuados devuelve 0 resultados en silencio en Git Bash; enumerar variantes sin `-i`.
- [Hooks de Claude Code: inyección y bloqueo](hooks-de-claude-code-inyeccion-y-bloqueo.md) — qué puede cada hook: `additionalContext` (al modelo) vs `systemMessage` (al usuario); `PreToolUse` **solo bloquea, no inyecta**; el recordatorio antes de actuar solo existe vía `UserPromptSubmit`; paridad Codex limitada a UserPromptSubmit/SessionStart.
- [Terminología farlopa: la deriva terminológica de los agentes](terminologia-farlopa.md) — los agentes incorporan términos ajenos (anglicismos, calcos, jerga) al dominio sesión tras sesión sin ratificar; fenómeno universal a todo repo con agentes, síntoma la perplejidad del autor, y origen del subsistema glosario.
