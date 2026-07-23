# establecer-conducta — hook repartidor de conducta

Hook del subsistema `conducta` (decisión 0021). **No es una Herramienta** (los hooks van afuera del registro de Herramientas, decisión 0007): es infra co-ubicada del subsistema, como el lint. El agente no lo invoca — lo dispara el harness.

## Qué hace

Corre en el evento `UserPromptSubmit` (momento `cada turno`). Lee el registro **vivo** `../INDICE.md`, filtra las reglas de clase `inyectar`, estado `vigente` y momento `cada turno`, y emite su `Contenido` como `additionalContext` para el modelo — el recordatorio de conducta en el punto de acción, cada turno. Agregar o cambiar una regla **no toca este script**: lee el registro en cada disparo.

## Contrato

- **Entrada:** el JSON del harness por stdin (se drena; la versión fina no depende del `prompt`).
- **Salida:** por stdout, `{ "hookSpecificOutput": { "hookEventName": "UserPromptSubmit", "additionalContext": "…" } }`.
- **Nunca rompe el turno:** ante cualquier error o registro vacío sale con código 0 sin emitir nada.

Mecánica de hooks: conocimiento `hooks-claude-code`. Latencia (~65 ms, Node): conocimiento `latencia-hooks`.

## Cableado

- **Claude Code:** `.claude/settings.json`, evento `UserPromptSubmit`.
- **Codex:** `.codex/hooks.json`, evento `UserPromptSubmit` (mismo script; paridad del momento `cada turno`).

## Probar a mano

```bash
echo {} | node .claude/conducta/establecer-conducta/establecer-conducta.js
```

Emite el JSON con las reglas `cada turno` vigentes, o nada si no hay.
