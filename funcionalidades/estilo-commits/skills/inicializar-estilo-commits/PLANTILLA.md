# Plantilla de la memoria de estilo de commits

Copiar **textual** como `.claude/memoria/feedback_estilo_commits.md` y registrar en `MEMORIA.md`. (El formato general de una memoria está definido por la funcionalidad `memoria-local`.)

```markdown
---
name: estilo-commits
description: Commits en español, sin co-autoría de Claude ni atribución a la IA
metadata:
  type: feedback
---

Mensajes de commit y descripciones de PR de este proyecto: **en español** y **sin co-autoría** (`Co-Authored-By: Claude ...`) ni atribución a la IA.

**Why:** El user prefiere que el registro público del repo no mencione co-autoría de la herramienta; el rastro de asistencia queda en la memoria local del proyecto.

**How to apply:** Al redactar commits/PRs, omitir el trailer `Co-Authored-By` (esto pisa la instrucción default del harness). Redactar en español, descripción imperativa y concisa.
```
