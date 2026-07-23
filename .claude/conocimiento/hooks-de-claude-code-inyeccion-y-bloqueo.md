# Hooks de Claude Code: qué puede inyectar y qué puede bloquear cada uno

Capacidades verificadas de los hooks de Claude Code, relevantes para diseñar mecanismos que **cambien la conducta del modelo** (inyectar reglas) o que **frenen acciones** (bloquear tools). Verificado contra la doc oficial el 2026-07-22.

## Dos canales de salida distintos

- **`additionalContext`** → va **al modelo** (invisible al usuario). Se agrega al contexto; Claude lo lee y actúa sobre él.
- **`systemMessage`** → va **al usuario** (terminal). El modelo **no** lo recibe como contexto.

Son destinos opuestos: para cambiar la conducta del modelo se usa `additionalContext`; para avisarle algo al usuario, `systemMessage`. (En este repo: la Pantalla de bienvenida usa `systemMessage`, decisión 0012; un mecanismo de reglas en el punto de acción usa `additionalContext`.)

## Qué puede cada hook

| Hook | ¿Inyecta `additionalContext` al modelo? | ¿Bloquea? | Momento |
|------|------------------------------------------|-----------|---------|
| `SessionStart` | Sí | — | al abrir la sesión |
| `UserPromptSubmit` | **Sí** | Sí (`"decision": "block"` top-level) | antes de cada turno del usuario |
| `PreToolUse` | **No** | **Sí** (`permissionDecision`) | antes de ejecutar una tool |
| `PostToolUse` | **Sí** | — | después de ejecutar una tool |
| `Stop` | Sí | — | al terminar |

**El punto clave y contraintuitivo: `PreToolUse` NO puede inyectar contexto — solo puede bloquear.** No existe "recordarle algo al modelo antes de la tool y dejar que siga". El único canal de recordatorio *antes* de actuar es `UserPromptSubmit` (por turno, no por tool); el recordatorio *ligado a una tool* solo existe *después*, vía `PostToolUse`.

## `PreToolUse` en detalle

- Campos de salida: `permissionDecision` (`allow` | `deny` | `ask` | `defer`), `permissionDecisionReason`, `updatedInput` (permite modificar el input de la tool).
- Cuando **deniega**, el texto de `permissionDecisionReason` **sí llega al modelo**, así entiende por qué y no reintenta.
- **Matcher** (filtra por nombre de tool): nombre exacto (`"Write"`), OR con pipe (`"Write|Edit|NotebookEdit"`), regex (`"^mcp__"`), o ausente = todas. El matcher **solo** filtra por nombre; para filtrar por ruta u otros args hay que inspeccionar `tool_input` dentro del hook (p. ej. `tool_input.file_path`).
- `AskUserQuestion` es una tool interceptable con matcher `"AskUserQuestion"` (case-sensitive).

## Formato de salida (ejemplos)

`UserPromptSubmit` inyectando contexto:
```json
{ "hookSpecificOutput": { "hookEventName": "UserPromptSubmit", "additionalContext": "..." } }
```
`PreToolUse` bloqueando:
```json
{ "hookSpecificOutput": { "hookEventName": "PreToolUse", "permissionDecision": "deny", "permissionDecisionReason": "..." } }
```

## Paridad con Codex CLI (importante para el harness)

- `UserPromptSubmit` + `additionalContext`: **paridad** (Codex lo soporta).
- `SessionStart` + `additionalContext`: **paridad**.
- `PreToolUse`: en Codex intercepta **solo Bash** y es **solo-bloqueo** (sin inyección de contexto). Divergencia grande.
- `PostToolUse` con inyección: **no** en Codex.

Conclusión para un mecanismo cross-agente: apoyarse en `UserPromptSubmit` + `SessionStart`. Lo que dependa de `PreToolUse`/`PostToolUse` degrada a Claude-only (como ya aceptan las decisiones 0010/0013).

## Fuentes

- Hooks reference: https://code.claude.com/docs/en/hooks.md
- Tools reference (AskUserQuestion): https://code.claude.com/docs/en/tools-reference.md
- Paridad Codex: https://github.com/openai/codex/issues/21753 · https://github.com/openai/codex/issues/19385
