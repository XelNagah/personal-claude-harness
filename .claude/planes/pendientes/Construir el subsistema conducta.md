# Construir el subsistema conducta

**Estado: En curso · Creado 26-07-22.** Origen: *Que el harness tenga efecto conductual* (frente C). Diseño asentado en la **decisión 0021**; este plan es la construcción.

## Ya construido (26-07-22): la versión fina

Primera pieza medible, in-repo. Diseñada por `planificar` (alcance A, "fino de verdad"):

- **Estructura `.claude/conducta/`**: registro de reglas `INDICE.md` (columnas `Regla · Momento · Clase · Contenido · Estado`), vocabulario de momentos `MOMENTOS.md` (punto de partida del registro de momentos: `cada turno` activo, `al escribir`/`al cerrar tarea` declarados), `MANIFIESTO.md` (5 campos 0019; índice **no** se carga —cargar reglas al arranque es el modo de falla que el subsistema corrige—), `lint-conducta/` autocontenido.
- **Base de 4 reglas**: 2 `vigente` de momento `cada turno` (respetar preferencias · no acuñar terminología) que el hook entrega hoy; 2 `pendiente` de momentos aún sin repartidor (contrastar al escribir 0020 · registrar cuando algo cambia), declaradas honestas.
- **Hook repartidor `establecer-conducta`** (`UserPromptSubmit`): lee el registro vivo, entrega las reglas `cada turno` como `additionalContext`. Cableado en `.claude/settings.json` (Claude) **y** `.codex/hooks.json` (Codex) — paridad plena del momento `cada turno`.
- **Gotcha reconciliado**: `PreToolUse` **sí** inyecta `additionalContext` (verificado contra la doc oficial). Conocimiento migrado desde `como-uso-claude`: `hooks-claude-code.md` + `latencia-hooks.md` reemplazan la página flaca.
- **Verde**: control de cierre 10/10 (lint-conducta nuevo incluido).

Nombre `establecer-conducta` ratificado por el usuario (0016).

## Crecido (26-07-23): momento `al escribir`

- El repartidor `establecer-conducta` se generalizó a **multi-evento**: el mismo script sirve `UserPromptSubmit` (momento `cada turno`) y `PreToolUse` (momento `al escribir`), resolviendo por evento qué momento realiza. La regla 3 (contrastar contra la sabiduría del repo) pasó a `vigente`.
- Momento `al escribir` = `PreToolUse` sobre `Write`|`Edit` con condición `file_path` es `.md` bajo `.claude/`. Cableado en `settings.json` de Claude con matcher `Write|Edit`. **Claude-first**: no se cablea en Codex (su `PreToolUse` solo ve Bash; degradación en `MOMENTOS.md`).
- Mecánica verificada (26-07-23): se **omite** `permissionDecision` (= `defer`) para inyectar sin auto-aprobar la tool ni tocar el flujo de permisos; el `additionalContext` llega **post-ejecución** (junto al resultado), así que la regla es un recordatorio posterior a la escritura, no un aviso previo. Probado en vivo (disparó sobre las ediciones de esta misma sesión).

## Pausa deliberada (26-07-23)

Se para acá con **3 reglas activas** (2 de `cada turno` + 1 de `al escribir`) para dejar correr la medición unas sesiones antes de sumar más momentos. Motivo: el repartidor `Stop` no es un agregado mecánico limpio — su `additionalContext` llega tarde (el turno ya cerró), para que el agente actúe habría que **forzar la continuación** (riesgo de bucle, como pasó con caveman), y la condición "algo cambió" roza el juicio (0021: lo que necesita juicio no es un momento). Diseñar `Stop` por `planificar` si/cuando se retome, no agregándolo a las apuradas.

## Falta (crecer, a demanda)

- Repartidor `Stop` (momento `al cerrar tarea`) para activar la 4.ª regla `pendiente` (registrar cuando algo cambia) — **requiere diseño** (ver Pausa deliberada).
- Skills de gestión (crear/modificar/borrar/analizar/verificar reglas).
- Empaquetar como funcionalidad/plugin (marketplace + junctions + REGISTRO + orquestador), como el piloto de `conocimiento`: primero medir in-repo, después distribuir.
- Medir el efecto conductual (el juez del plan padre).

## Qué construir

- Estructura `.claude/conducta/`: registro de `reglas de conducta` (regla · momento · acción · estado) + registro de `momentos` (momento · qué representa · evento · condición · disponibilidad por agente) + `lint-conducta` + `MANIFIESTO.md`.
- **Base instalada** de reglas: respetar preferencias · considerar el conocimiento · contrastar contra glosario/decisiones al escribir (test 0020) · registrar en el subsistema que corresponde cuando algo cambia.
- **Hook repartidor por evento** (`UserPromptSubmit` y `PostToolUse`; `PreToolUse` solo para bloqueo) que lee el registro compartido y entrega la regla que corresponde.
- Skills de gestión: crear/modificar/borrar/analizar/verificar reglas.
- Funcionalidad/plugin: carpeta + `marketplace.json` + junctions dobles + fila en `REGISTRO.md` + orquestador (patrón `agregar-funcionalidad`).
- Config por agente: `settings.json` (Claude) + hooks de Codex, con degradación documentada.
- Traer el documento de hooks de `como-uso-claude` (`hooks-claude-code.md` + su página de latencia) al conocimiento, reemplazando la página flaca `hooks-de-claude-code-inyeccion-y-bloqueo.md`.

## Calibraciones abiertas (del diseño)

- **Empezar fino vs completo.** Recomendado: un repartidor `UserPromptSubmit` con la Base, medir, crecer.
- Latencia del repartidor corriendo en cada tool call.
- Viabilidad fina del desvío por Bash en Codex.
- Cómo se genera/instala la config de cada agente (nivelador).
- **Reconciliar:** ¿`PreToolUse` inyecta contexto o solo bloquea? Dos fuentes discrepan (el doc de `como-uso-claude` dice que sí; el guide del 22/07 dijo que no). Verificar contra la doc de la versión instalada **antes** de apoyarse en eso.

## Cómo seguir

Diseñar el detalle con `planificar` antes de construir en serio; empezar por la versión fina para medir efecto. Candidato natural para la futura skill de ejecución de planes.
