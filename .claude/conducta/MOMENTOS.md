---
origen: agente-multiproposito
---

# Momentos de conducta

Vocabulario de los **momentos** válidos a los que una regla de conducta puede atarse. Un momento es un **evento de hook + una condición que la máquina evalúa sin juicio**; es agente-agnóstico, y su realización depende de que el agente tenga un repartidor para ese evento. Este archivo es el punto de partida del registro de momentos: hoy alcanza el vocabulario (nombre · qué representa · evento · disponibilidad). Crece a las columnas completas (condición fina, disponibilidad por agente) cuando se sumen repartidores nuevos. El `lint-conducta` lo lee para validar que toda regla apunte a un momento existente y que ninguna regla `vigente` cuelgue de un momento sin repartidor.

> **Este archivo es del Agente Multipropósito y el actualizador lo reemplaza entero.** Los momentos que suma el Propósito de un repo van en [`MOMENTOS-LOCAL.md`](MOMENTOS-LOCAL.md), que el actualizador no abre; escribirlos acá los pierde en la corrida siguiente. El `lint-conducta` lee los dos y valida que ninguno se repita.

- **Momento** — nombre canónico, en español corriente.
- **Qué representa** — el punto del flujo, en una línea.
- **Evento de hook** — el evento que lo dispara (+ condición, si la hay).
- **Disponibilidad** — `activo` (hay repartidor construido que lo entrega) o `declarado` (definido, sin repartidor todavía → sus reglas van en estado `pendiente`).

| Momento | Qué representa | Evento de hook | Disponibilidad |
|---------|----------------|----------------|----------------|
| al arrancar la sesión | Al iniciar la sesión, sin condición. Es el único momento cuya salida ve el usuario en su terminal. | `SessionStart` | activo |
| cada turno | Antes de cada respuesta del agente, sin condición. | `UserPromptSubmit` | activo |
| al escribir | Al escribir o editar texto o código de cualquier parte del repo, salvo el directorio de borradores `tmp/`. Alcance y salvedades más abajo. | `PreToolUse` sobre `Write`\|`Edit`\|`apply_patch`, condición: **alguna** ruta tocada es `.md`, `.js`, `.mjs`, `.cjs`, `.sh` o `.ps1` fuera de `tmp/` | activo |
| al cerrar tarea | Al terminar de responder una tarea. **Único momento donde hablar cuesta un turno completo del modelo**; su excepción está más abajo. | `Stop` | activo |
| al crear un commit | Antes de confirmar un commit o redactar una descripción de PR. | `PreToolUse` sobre la creación del commit; repartidor específico pendiente | declarado |

> Paridad: `cada turno` (`UserPromptSubmit` + `additionalContext`) tiene paridad plena Claude Code ↔ Codex (conocimiento `hooks-claude-code`). `al arrancar la sesión` (`SessionStart` → `systemMessage`) anda en Claude Code, Codex y Gemini; Cursor no tiene banner nativo y degrada sin caja. `al escribir` **también corre en Codex** desde abril de 2026: toda edición pasa por `apply_patch`, que dispara `PreToolUse` y matchea como `apply_patch`, `Edit` o `Write` (conocimiento `hooks-codex-cli`; hasta entonces solo disparaba para Bash y el momento figuraba acá como Claude-first). Con una salvedad: **el `deny` todavía no frena en Codex** —el archivo se escribe igual, bug abierto del CLI—, así que ahí una regla `Controlar` que quiera frenar degrada a aviso hasta que lo arreglen; se emite igual para que empiece a frenar sola el día que ocurra. `al cerrar tarea` (`Stop`) **existe en Codex pero hoy no está cableado ahí** (`.codex/hooks.json` declara los otros tres), así que en Codex el momento no se entrega. Cuando se cablee, degrada así: el CLI parsea varios campos de respuesta sin aplicarlos, de modo que el aviso puede no llegarle al modelo aunque el control corra y consuma su marca de sesión. Se emite igual, con la misma forma que en Claude Code. Los momentos `declarado` esperan su repartidor.

## El momento donde hablar cuesta un turno

**Escritura única de esta excepción.** El README del subsistema, `CLASES.md` y el registro de reglas apuntan acá en vez de repetirla.

`al cerrar tarea` es el único momento en el que emitir algo **le cuesta al usuario un turno completo del modelo**: el evento `Stop` no admite dejar una nota y que el turno cierre igual, así que todo lo que salga por ahí continúa la conversación. Una regla `Inyectar` entregada en cada cierre haría que el agente no pudiera terminar nunca.

Por eso, **solo en este momento**, el default es callar:

- Una regla `Inyectar` **no se entrega sola**. Necesita que una regla `Controlar` vigente del mismo momento la habilite: el Control de esa regla decide **cuándo** se dice —midiendo, por ejemplo, si la sesión escribió en algún registro—, y el texto de la `Inyectar` sigue siendo **qué** se dice. El registro conserva el contenido; el Control solo abre o cierra la puerta.
- Una regla `Inyectar` ahí **sin ninguna `Controlar` que la habilite no se entrega nunca**, y el `lint-conducta` lo marca.
- Con `stop_hook_active` —la señal de que el turno actual ya lo continuó un hook— el repartidor sale mudo sin despachar nada, o el cierre entra en bucle.

En los demás momentos las reglas `Inyectar` salen siempre, sin habilitación de nadie.

La lista de los momentos que caen bajo esta excepción vive en `momentos-que-cuestan-un-turno.js`, única copia que leen el repartidor y el `lint-conducta`. Hoy tiene un solo momento.

## Qué alcanza el momento `al escribir`

Alcanza **cualquier parte del repo** —lo que el repo publica incluido, no solo los registros del Agente Multipropósito—, salvo el directorio de borradores `tmp/`. Las extensiones las define un solo archivo del subsistema, `alcance-al-escribir.js`, que leen tanto el repartidor como el control: con una lista por cabeza, la que sume una extensión primero deja a la otra mirando para otro lado sin emitir señal.

Adentro del momento, avisar y frenar ocurren en instantes distintos:

- El **aviso** (`additionalContext`) llega **junto al resultado** de la escritura: es un recordatorio posterior, con el archivo ya escrito.
- El **freno** (`deny`) es **previo**: corta la escritura antes de que el archivo exista.

**En código el control avisa y no frena** (decisión `Local-0052`). Lo que hace usable al bloqueo es que frena *usar* un término vetado pero no *nombrarlo*, mirando lo que queda fuera de las comillas simples invertidas. En un `.js` esas comillas son plantillas de cadena, así que la exención de cita no existe y bloquear dejaría archivos sin forma de escribirse.
