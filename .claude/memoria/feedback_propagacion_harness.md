---
name: propagacion-harness
description: Propagar cambios textual (lint/preferencia) a las funcionalidades + orquestador — delegar a subagente FRESCO, no a un fork; verificar los embebidos textual uno mismo.
metadata:
  type: feedback
---

Al propagar un cambio textual al harness (un lint nuevo, un texto de preferencia, una línea de convención) hay que replicarlo en la funcionalidad (`skills/<s>/SKILL.md` + `PLANTILLA.md`) **y** en el orquestador `setup-completo` (que duplica todo en su `SKILL.md`/`PLANTILLA.md`, porque en ejecución no puede leer las otras carpetas). El código de un lint va embebido textual en `PLANTILLA.md` bajo `## §Script`, dentro de un bloque de código ```js.

**Why:** es voluminoso y con muchas copias (un lint de ~110 líneas termina en 3+ sitios). Un **fork** que hereda el contexto de la sesión puede creer que el trabajo ya está hecho y terminar con **0 ediciones** (pasó: `git status` limpio). `lint-harness` **solo compara bloques de memoria** (```markdown que empiezan con `---\nname:`) entre PLANTILLAs — NO compara el código de los lints ni los textos de preferencias/glosario, así que su verde no garantiza que los embebidos sean correctos.

**How to apply:** delegá a un subagente **fresco** (general-purpose, sin contexto heredado) con brief explícito: "esto NO está hecho; al terminar `git status --short` debe mostrar ediciones". Dale las fuentes de verdad en disco (`.claude/<sub>/lint-<sub>/<lint>.js`, el bullet/línea exactos) para que copie con `cat`, no reescriba. Verificá vos, sin fiarte del auto-reporte: `git status`, `lint-harness`, `lint-herramientas`, `claude plugin validate`, y **exactitud textual** de cada `.js` embebido con un chequeo de inclusión (`fs.readFileSync(target).includes(source.trim())`). Ver [[flujo-planes]] para el cierre.

**Al propagar textos que se embeben en un bloque `` ```markdown ``:** si el texto trae adentro su propia cerca ```bash (p. ej. un `MANIFIESTO.md` con su comando de lint), envolverlo con una cerca externa de **4 backticks** (````markdown), no de 3 con el U+200B invisible que usan las plantillas viejas — así el embebido queda **byte-idéntico** a su fuente en disco y la verificación por inclusión (`target.includes(source)`) da exacta. `lint-harness` **no** compara los textos de manifiesto ni el de `## Subsistemas` (solo memorias + 2 fragmentos de lint), así que esa verificación por inclusión hay que correrla a mano.

**Manifiestos distribuidos ≠ manifiestos vivos:** el texto que viaja a los consumidores se **genericiza** (sin números de decisión de este repo — no los tienen); los `MANIFIESTO.md` vivos de este repo sí conservan las refs. Son dos byte-sources distintos: escribir los genéricos aparte (no copiarlos de los vivos) y darle esos al subagente.

**Aparte:** los paréntesis en nombres de archivo de plan rompen los links markdown (`)` cierra el link) — usar nombres sin `()`.
