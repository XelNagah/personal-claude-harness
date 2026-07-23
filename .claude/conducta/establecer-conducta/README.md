# establecer-conducta — hook repartidor de conducta

Hook del subsistema `conducta` (decisión 0021). **No es una Herramienta** (los hooks van afuera del registro de Herramientas, decisión 0007): es infra co-ubicada del subsistema, como el lint. El agente no lo invoca — lo dispara el harness.

## Qué hace

Un mismo script sirve a varios eventos. Según el evento que lo dispara, resuelve qué **momento** realiza (con su condición, sin juicio), lee el registro **vivo** `../INDICE.md`, filtra las reglas de clase `inyectar`, estado `vigente` y ese momento, y emite su `Contenido` como `additionalContext` para el modelo. Agregar o cambiar una regla **no toca este script**: lee el registro en cada disparo. El vocabulario de momentos vive en `../MOMENTOS.md`; acá vive **cómo** se realiza cada uno.

Eventos que realiza hoy:

- **`UserPromptSubmit`** → momento `cada turno` (sin condición). El recordatorio en cada turno.
- **`PreToolUse`** con `Write`/`Edit` de un `.md` bajo `.claude/` → momento `al escribir`. El `additionalContext` llega **junto al resultado** de la tool (post-ejecución): es un recordatorio posterior a la escritura, no un aviso previo.

## Contrato

- **Entrada:** el JSON del harness por stdin (se lee `hook_event_name`, y para `PreToolUse` `tool_name` + `tool_input.file_path`).
- **Salida:** por stdout, `{ "hookSpecificOutput": { "hookEventName": …, "additionalContext": "…" } }`.
- **`PreToolUse` sin efecto de lado:** se **omite** `permissionDecision` (= `defer`, verificado 2026-07-23): inyecta el texto y deja el flujo de permisos intacto — **no** auto-aprueba la tool. (`allow` auto-aprobaría; `deny` descartaría el `additionalContext`.)
- **Nunca rompe el turno:** ante cualquier error o registro vacío sale con código 0 sin emitir nada.

Mecánica y capacidades de hooks: conocimiento `hooks-claude-code`. Latencia (~65 ms, Node): conocimiento `latencia-hooks`.

## Cableado

- **Claude Code (`.claude/settings.json`):** `UserPromptSubmit` (sin matcher) + `PreToolUse` (matcher `Write|Edit`).
- **Codex (`.codex/hooks.json`):** solo `UserPromptSubmit` (paridad del momento `cada turno`). El momento `al escribir` es **Claude-first**: el `PreToolUse` de Codex intercepta solo Bash (decisión 0021), no es realizable ahí — degradación documentada en `../MOMENTOS.md`.

## Probar a mano

```bash
echo {"hook_event_name":"UserPromptSubmit"} | node .claude/conducta/establecer-conducta/establecer-conducta.js
echo {"hook_event_name":"PreToolUse","tool_name":"Write","tool_input":{"file_path":".claude/glosario/INDICE.md"}} | node .claude/conducta/establecer-conducta/establecer-conducta.js
```

Emiten el JSON con las reglas vigentes de ese momento, o nada si no aplica.
