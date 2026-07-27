# Hooks de Codex CLI — cobertura, formato y límites

Qué puede y qué no puede un hook de Codex CLI, verificado el **26/07/2026** contra la documentación oficial (`learn.chatgpt.com/docs/hooks`) y los issues del repositorio `openai/codex`. Complementa [hooks de Claude Code](hooks-claude-code.md): acá va solo lo que difiere o lo que la doc de Claude no cubre.

**Caduca rápido.** Dos de los tres límites de abajo son bugs abiertos; uno de los datos que esta página corrige había quedado viejo en tres meses.

## Dónde busca los hooks

Cuatro ubicaciones útiles, y **todas las que matcheen corren** — una capa de configuración de más precedencia no reemplaza a las de abajo:

- `~/.codex/hooks.json` y `~/.codex/config.toml` (tablas `[hooks]` en línea)
- `<repo>/.codex/hooks.json` y `<repo>/.codex/config.toml`

Si una misma capa tiene `hooks.json` y `[hooks]` a la vez, Codex los junta y avisa al arrancar. Conviene una sola forma por capa.

## Confianza: el hook no corre hasta que lo aprueban a mano

Un hook no administrado **no corre hasta que se lo revisa y se le da confianza**, y la confianza se registra contra el hash del hook: **cambiar el texto del hook lo vuelve a marcar para revisión** y se saltea mientras tanto. Se gestiona con `/hooks` en la línea de comandos. Los hooks del proyecto además cargan solo si la capa `.codex/` del proyecto es de confianza.

⚠️ Consecuencia para cualquier setup que se distribuya: **el hook no empieza a funcionar solo al instalarlo**, y cada actualización que cambie su texto lo vuelve a frenar. La instalación tiene que decírselo a la persona. Los hooks administrados (sistema, MDM, nube, `requirements.toml`) están exentos y no se pueden desactivar.

## Cobertura de herramientas: `apply_patch` sí dispara

`PreToolUse` y `PostToolUse` **no** se limitan a los comandos de consola. La tabla oficial de cobertura:

| Camino de la herramienta | ¿Dispara? | Cómo se matchea |
|---|---|---|
| Comandos de consola y `exec_command` | sí | `Bash` |
| **`apply_patch`** (toda edición de archivos) | **sí** | **`apply_patch`, `Edit` o `Write`** |
| Herramientas MCP | sí | por su nombre, `mcp__servidor__tool` |
| Otras funciones locales | sí | por su nombre (`update_plan`; `spawn_agent` también matchea `Agent`) |
| Herramientas alojadas (`WebSearch`) | **no** | — |

Que `apply_patch` matchee como `Edit` o `Write` significa que **un matcher escrito para Claude Code funciona igual en Codex sin tocarlo**.

> **Dato que envejeció:** hasta abril de 2026 los hooks disparaban **solo** para la línea de comandos — `ApplyPatchHandler` no emitía el evento y el runtime escribía `tool_name: "Bash"` fijo (issue **#16732**, cerrado el 22/04/2026). Cualquier nota anterior a esa fecha que diga "Codex intercepta solo Bash" está vieja.

## El campo con los datos es `command`, no `file_path`

Diferencia que rompe en silencio: la entrada del hook trae `tool_input`, y para `apply_patch` **la doc dice que se usa `tool_input.command`** — el texto del parche, con las rutas adentro. `tool_name` siempre llega como `apply_patch`, aunque el matcher haya sido `Write` o `Edit`.

Un hook portado de Claude Code que lea `tool_input.file_path` recibe vacío y no falla: **contesta que la condición no se cumple**. Además un parche toca **varias rutas de una**, así que la condición no puede preguntar por *la* ruta sino por *alguna*.

Campos comunes de entrada: `session_id`, `transcript_path`, `cwd`, `hook_event_name`, `model` y `permission_mode`. Los de turno suman `turn_id`.

## Salida: qué se acepta y qué no

El texto plano en la salida estándar **se ignora**; hay que emitir JSON.

- **Agregar contexto sin frenar:** `hookSpecificOutput.additionalContext` — igual que en Claude Code.
- **Denegar:** `hookSpecificOutput.permissionDecision: "deny"` con `permissionDecisionReason`. También acepta la forma vieja `{"decision": "block", "reason": …}` y el código de salida `2` con el motivo por la salida de error.
- **Reescribir la llamada:** `permissionDecision: "allow"` con `updatedInput`, que para `apply_patch` y los comandos de consola **debe** traer un campo `command` de texto.
- **Parseados pero sin efecto todavía:** `permissionDecision: "ask"`, `decision: "approve"`, `continue: false`, `stopReason`, `suppressOutput`. Codex marca el hook como fallado, reporta el error **y sigue con la herramienta igual**.

## Límite mayor: el `deny` no se aplica a las escrituras

Issue **#27833**, **abierto** al 26/07/2026 y reconfirmado el 06/07/2026 sobre otra herramienta: con `apply_patch` el hook dispara, el `deny` se emite por los dos canales documentados, y el archivo **se escribe igual con exactamente el contenido denegado**. La transcripción muestra el hook como `Failed` y `apply_patch` como exitoso.

La propia documentación lo enmarca así:

> Treat tool hooks as a useful guardrail, not a complete enforcement boundary.
> *(Tratá los hooks de herramienta como una barrera útil, no como una frontera de cumplimiento completa.)*

⇒ **Cualquier control que dependa de frenar una escritura no es realizable en Codex hoy.** Un control equivalente tiene que apoyarse en `additionalContext`, que sí llega, o correr después sobre lo escrito.

## Eventos disponibles

`PreToolUse`, `PermissionRequest`, `PostToolUse`, `PreCompact`, `PostCompact`, `UserPromptSubmit`, `SubagentStop` y `Stop` durante el turno; `SessionStart` y `SubagentStart` al empezar; `SessionEnd` al terminar la conversación principal (no corre para los subagentes).

Los hooks que matchean el mismo evento **arrancan a la vez**, así que uno no puede impedir que otro empiece.

## Lo que todavía no llega

Issue **#18491** (abierto): `PreToolUse` no cubre las herramientas de lectura (`read_file`, `grep`) y `updatedInput` se rechaza con *"PreToolUse hook returned unsupported updatedInput"* en varios caminos.
