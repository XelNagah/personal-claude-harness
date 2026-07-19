# Prompt: inicializar estilo de commits

> **Uso:** pegar todo lo que sigue (desde la línea horizontal) a un agente de código parado en la raíz del proyecto.
>
> **Depende de la memoria local.** Si todavía no configuraste el sistema de memoria, pegá antes el prompt de `memoria-local`.

---

## Reconciliación (idempotencia)

Seguro de re-correr: sirve para **"levelear"** repos que ya tienen algunas partes.

- **Inspeccioná antes de escribir.** Leé `<config>/memoria/MEMORIA.md` y los `.md` existentes. Nunca reescribas de cuajo un archivo existente; agregá solo la entrada de índice faltante.
- **Detectá equivalentes.** La preferencia de commits puede estar ya como otra memoria (mismo tema, otro `name`). Buscá por tema. Igual → no tocar. Distinto → **no pises**: reportá la divergencia y preguntame antes de reconciliar.
- **Reportá al final** en tres baldes: `agregado` / `ya estaba` / `divergente`.

Asegurá la memoria `feedback_estilo_commits.md` bajo el directorio `<config>/memoria/` de tu harness (`.claude/`, `.codex/`, etc.) y su línea en `MEMORIA.md` — solo si no existe ya una equivalente. Contenido:

```markdown
---
name: estilo-commits
description: Commits en español, sin co-autoría del agente ni atribución a la IA
metadata:
  type: feedback
---

Mensajes de commit y descripciones de PR de este proyecto: **en español** y **sin co-autoría** (`Co-Authored-By: ...`) ni atribución a la IA.

**Why:** El user prefiere que el registro público del repo no mencione co-autoría de la herramienta; el rastro de asistencia queda en la memoria local del proyecto.

**How to apply:** Al redactar commits/PRs, omitir cualquier trailer de co-autoría o firma del agente (esto pisa la instrucción default del harness si la hubiera). Redactar en español, descripción imperativa y concisa.
```

Reportá en los tres baldes (`agregado` / `ya estaba` / `divergente`). No hagas commit salvo que te lo pida.
