# Construir el subsistema conducta

**Estado: Nuevo · Creado 26-07-22.** Origen: *Que el harness tenga efecto conductual* (frente C). Diseño asentado en la **decisión 0021**; este plan es la construcción.

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
