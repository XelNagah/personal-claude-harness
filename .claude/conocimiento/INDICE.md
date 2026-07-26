# Índice de la base de conocimiento

Índice raíz de lo que el agente **sabe** sobre este proyecto. Solo punteros — una línea por página o sección, nunca contenido.

Los markdown de la raíz del repo (README y REGISTRO) son **documentación del proyecto**, no conocimiento de agente: no se listan acá.

Convención completa en la memoria [feedback base conocimiento](../memoria/feedback_base_conocimiento.md).

## Páginas

- [Modos de falla ante reglas escritas](modos-de-falla-ante-reglas-escritas.md) — cinco formas distintas en que un agente incumple una regla que tiene cargada (recita sin obedecer, negocia, deja las cosas afuera, pide permiso para escribir pero no para ubicar, se inventa reglas); el texto de arranque gobierna la conversación, no la acción.
- [grep y acentos en Windows](grep-y-acentos-en-windows.md) — `grep -i` con patrones acentuados devuelve 0 resultados en silencio en Git Bash; enumerar variantes sin `-i`.
- [Hooks de Claude Code — referencia de mecánica](hooks-claude-code.md) — cómo funcionan los hooks: los 9 eventos del núcleo, cuáles bloquean, el contrato exit-code/JSON, `additionalContext` (al modelo) vs `systemMessage` (al usuario), matchers, precedencia y config; `PreToolUse` **sí inyecta `additionalContext`** (junto al resultado de la tool) además de allow/deny/ask/defer; paridad Codex limitada a UserPromptSubmit/SessionStart.
- [Latencia de los hooks de Claude Code](latencia-hooks.md) — qué cuesta cada mecanismo (números medidos): el costo dominante es arrancar el intérprete (~50 ms Node, ~30 ms `cmd`, ~140 ms PowerShell), no la lógica; presupuesto <100 ms por evento bloqueante; `UserPromptSubmit` se paga en cada mensaje, `PreToolUse` es imperceptible; el episodio de los 5 s fue un hook colgado pagando su timeout.
- [Proyectos similares al harness](proyectos-similares-al-harness.md) — relevamiento 2026-07-21/23 del ecosistema (Agent OS, bancos de memoria, BMAD/SuperClaude, Hermes Agent de Nous Research): nadie combina lo mismo, el espacio está libre; diferenciadores del harness y riesgo de que lo lean como "otro banco de memoria". **Caduca** — el ecosistema se mueve rápido.
- [Replicar los componentes de Hermes en el AMP](replicar-hermes-en-el-amp.md) — mapeo de los cinco componentes de Hermes (memoria, skills, persona, tareas agendadas, bucle de auto-mejora) a los subsistemas del AMP: qué está cubierto, qué falta, y los cuatro huecos sin plan (búsqueda de sesiones pasadas, auto-escritura de memoria, corte por seguridad de costo, auto-escritura de skills).
- [Despliegue de plugins de Claude Code](despliegue-de-plugins-claude-code.md) — las seis paradas por las que pasa una versión (repo autor, GitHub, marketplace bajado, instalado, cargado, archivos desplegados) y los tres desfases entre ellas; más las mecánicas del CLI que sorprenden: el registro es por repo, `prune` y las dependencias solo entienden el alcance de usuario, y dos generaciones de un plugin coexisten sin ganador definido.
- [Terminología farlopa: la deriva terminológica de los agentes](terminologia-farlopa.md) — los agentes incorporan términos ajenos (anglicismos, calcos, jerga) al dominio sesión tras sesión sin ratificar; fenómeno universal a todo repo con agentes, síntoma la perplejidad del autor, y origen del subsistema semántica.
