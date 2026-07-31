# establecer-conducta — hook repartidor de conducta

Hook del subsistema `conducta`. **No es una Herramienta** (los hooks van afuera del registro de Herramientas): es infra co-ubicada del subsistema, como el lint. El agente no lo invoca — lo dispara el harness.

## Qué hace

Un mismo script sirve a varios eventos. Según el evento que lo dispara, resuelve qué **momento** realiza (con su condición, sin juicio), lee el registro **vivo** `../INDICE.md` y despacha las reglas `vigente` de ese momento según su clase. Agregar o cambiar una regla **no toca este script**: lee el registro en cada disparo. El vocabulario de momentos vive en `../MOMENTOS.md`; acá vive **cómo** se realiza cada uno.

Eventos que realiza hoy:

- **`SessionStart`** → momento `al arrancar la sesión` (sin condición).
- **`UserPromptSubmit`** → momento `cada turno` (sin condición). El recordatorio en cada turno.
- **`PreToolUse`** con `Write`/`Edit`/`apply_patch` cuando **alguna** ruta tocada es un `.md` fuera de `tmp/` → momento `al escribir`.

## Las tres clases

| Clase | Qué hace | Se combina |
|-------|----------|------------|
| `inyectar` | Emite el `Contenido` de la regla como `additionalContext` | sí |
| `correr` | Ejecuta la Herramienta cuya ruta es el `Contenido` y **reenvía su salida tal cual** (la Pantalla de bienvenida emite `systemMessage`, el único campo que escribe en la terminal) | no: su salida **es** la respuesta del hook |
| `bloquear` | Ejecuta la Herramienta y **lee su respuesta**: un `deny` frena la acción y se emite solo; un `additionalContext` se suma al de las reglas `inyectar` | sí |

En un mismo momento conviven el texto fijo de las `inyectar` —que vive en el registro y lo nivela el Agente Multipropósito— y los datos medidos de las `bloquear`, que produce un programa. Se emiten juntos, uno abajo del otro.

## Contrato

- **Entrada:** el JSON del agente por stdin. Se lee `hook_event_name`, y para `PreToolUse` `tool_name` + las rutas, que llegan de dos formas: `tool_input.file_path` (Claude Code) o adentro del parche de `tool_input.command` (Codex, `apply_patch`, que puede tocar **varias** rutas de una).
- **Salida:** por stdout, `{ "hookSpecificOutput": { "hookEventName": …, "additionalContext": "…" } }`, o el `deny` con su `permissionDecisionReason`.
- **`PreToolUse` sin efecto de lado:** cuando no hay bloqueo se **omite** `permissionDecision` (= `defer`, verificado 2026-07-23): inyecta el texto y deja el flujo de permisos intacto — **no** auto-aprueba la tool. (`allow` auto-aprobaría; `deny` descarta el `additionalContext`, por eso el bloqueo se emite solo.)
- **Nunca rompe el turno:** ante cualquier error o registro vacío sale con código 0 sin emitir nada.

Mecánica y capacidades de hooks: conocimiento `hooks-claude-code` (Claude Code) y `hooks-codex-cli` (Codex). Latencia (~65 ms, Node): conocimiento `latencia-hooks`.

## Cableado

- **Claude Code (`.claude/settings.json`):** `SessionStart` + `UserPromptSubmit` (sin matcher) + `PreToolUse` (matcher `Write|Edit`).
- **Codex (`.codex/hooks.json`):** los mismos tres. El matcher `Write|Edit` alcanza igual: toda edición de Codex pasa por `apply_patch`, que matchea como `apply_patch`, `Edit` o `Write`. ⚠️ Un hook de Codex **no corre hasta que se lo revisa y se le da confianza** con `/hooks`, y la confianza se pierde cada vez que cambia su texto.

## Probar a mano

```bash
node -e 'process.stdout.write(JSON.stringify({hook_event_name:"UserPromptSubmit"}))' | node .claude/conducta/establecer-conducta/establecer-conducta.js
node -e 'process.stdout.write(JSON.stringify({hook_event_name:"PreToolUse",tool_name:"Write",tool_input:{file_path:"README.md",content:"texto"}}))' | node .claude/conducta/establecer-conducta/establecer-conducta.js
```

Emiten el JSON con las reglas vigentes de ese momento, o nada si no aplica.
