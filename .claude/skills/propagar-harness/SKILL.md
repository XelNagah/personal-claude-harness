---
name: propagar-harness
description: Propaga un cambio textual de este repo (lint, manifiesto, preferencia, contenido inicial) al instalador consolidado amp:inicializar, delegando la copia a un subagente fresco y verificando carácter a carácter. Use when se tocó un texto que viaja al harness (Base de preferencias, un lint, un manifiesto, una plantilla) y hay que replicarlo, o el usuario dice "propagá al harness", "propagar el cambio".
---

# Propagar al harness

Un cambio en una pieza Base de este repo (un lint, un `MANIFIESTO`, un texto de la Base de preferencias, un contenido inicial) tiene una **copia textual** que mantener: el instalador consolidado **`amp:inicializar`** (`funcionalidades/amp/skills/inicializar/SKILL.md` + `PLANTILLA.md`), que duplica los textos literales de **todos** los subsistemas porque en ejecución no puede leer las otras carpetas. El código de un lint va embebido en `PLANTILLA.md` bajo `## §Script`, dentro de un bloque de código ```js.

Desde el empaquetado 0029, `amp:inicializar` es la **fuente única** del setup (absorbió los ex `inicializar-<sub>` individuales). Por eso el destino de propagación es **uno solo**, no "funcionalidad + orquestador" como antes. Las skills de **operación** (`registrar-memoria`, `ciclo-de-plan`, `converger-terminologia`, …) viven en su `amp-<sub>` y son fuente única sin duplicar: no se propagan.

Esta skill encapsula el flujo probado (memoria `feedback_propagacion_harness.md`). Sus dos reglas duras salen de fallas reales:

1. **Delegar a un subagente FRESCO, nunca a un fork.** Un fork hereda el contexto de la sesión y puede creer que el trabajo ya está hecho — pasó: terminó con 0 ediciones y `git status` limpio.
2. **Verificar uno mismo, sin fiarse del auto-reporte.** `lint-harness` compara bloques de memoria entre la PLANTILLA de `amp:inicializar` y los **fragmentos de código compartidos entre lints** (la resolución de refs, identificada por su comentario ancla; también contra los lints vivos de `.claude/`). Lo que **NO** cubre: el lint entero embebido en la PLANTILLA, ni los textos de preferencias/glosario. Su verde no garantiza esos embebidos — el chequeo de inclusión del paso 3 sigue siendo obligatorio.

## Flujo

1. **Identificar qué cambió y dónde vive la copia.** Fuente de verdad = el archivo del repo local (`.claude/<sub>/...`). Destino = la sección del subsistema en `amp:inicializar` (SKILL + PLANTILLA). Confirmar el alcance con `git diff`/`git log` si hace falta.
2. **Delegar la copia a un subagente fresco** (general-purpose, sin contexto heredado) con brief explícito:
   - "Esto NO está hecho; al terminar, `git status --short` debe mostrar ediciones."
   - Rutas exactas de fuente y destino, para que **copie** (cat/read + paste), no reescriba de memoria.
3. **Verificar uno mismo:**
   - `git status --short` — hubo ediciones y son los archivos esperados.
   - Carácter a carácter cada embebido: chequeo de inclusión — `node -e "const fs=require('fs'); console.log(fs.readFileSync('<destino>','utf8').includes(fs.readFileSync('<fuente>','utf8').trim()))"` debe dar `true` por cada copia.
   - `node .claude/herramientas/ejecutar-control-cierre/ejecutar-control-cierre.js` — todo verde (incluye lint-harness y plugin validate).
4. **Subir la `version`** en el `plugin.json` de `amp` (los consumidores solo reciben updates al subir la versión).
5. **Reportar**: qué se propagó, resultado de la verificación, divergencias encontradas.

## Ojo

- `SKILL.md` es la **fuente única** de cada flujo (estándar Agent Skills, decisión 0010) — "textual" aplica a los bloques embebidos que se duplican en `amp:inicializar` (código de lints, manifiestos, contenidos iniciales, Base de preferencias), no al texto plano que los rodea.
- Los paréntesis en nombres de archivo rompen links markdown — nombres sin `()`.
