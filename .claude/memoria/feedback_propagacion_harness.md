---
name: propagacion-harness
description: Propagar cambios verbatim (lint/preferencia) a las funcionalidades + orquestador — delegar a subagente FRESCO, no a un fork; verificar los embebidos byte-exactos uno mismo.
metadata:
  type: feedback
---

Al propagar un cambio verbatim al harness (un lint nuevo, un texto de preferencia, una línea de convención) hay que replicarlo en la funcionalidad (`prompt.md` + `skills/<s>/SKILL.md` + `PLANTILLA.md`) **y** en el orquestador `setup-completo` (que duplica todo, porque en runtime no puede leer las otras carpetas). El código de un lint va embebido verbatim en `PLANTILLA.md` bajo `## §Script`, dentro de un fence ```js.

**Why:** es voluminoso y con muchas copias (un lint de ~110 líneas termina en 3+ sitios). Un **fork** que hereda el contexto de la sesión puede creer que el trabajo ya está hecho y terminar con **0 ediciones** (pasó: `git status` limpio). `lint-harness` **solo compara bloques de memoria** (```markdown que empiezan con `---\nname:`) entre PLANTILLAs — NO compara el código de los lints ni los textos de preferencias/glosario, así que su verde no garantiza que los embebidos sean correctos.

**How to apply:** delegá a un subagente **fresco** (general-purpose, sin contexto heredado) con brief explícito: "esto NO está hecho; al terminar `git status --short` debe mostrar ediciones". Dale las fuentes de verdad en disco (`.claude/<sub>/lint-<sub>/<lint>.js`, el bullet/línea exactos) para que copie con `cat`, no reescriba. Verificá vos, sin fiarte del auto-reporte: `git status`, `lint-harness`, `lint-herramientas`, `claude plugin validate`, y **byte-exactness** de cada `.js` embebido con un chequeo de inclusión (`fs.readFileSync(target).includes(source.trim())`). Ver [[flujo-planes]] para el cierre.

**Aparte:** los paréntesis en nombres de archivo de plan rompen los links markdown (`)` cierra el link) — usar slugs sin `()`.
