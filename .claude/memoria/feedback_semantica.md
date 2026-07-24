---
name: semantica
description: Subsistema semántica en .claude/semantica/ — dos registros pares: GLOSARIO.md (terminología legítima, alias/propuestos) y TERMINOLOGIA-FARLOPA.md (relaciones vetadas término→significado); el agente solo propone, el usuario ratifica y veta; consultar al planificar/analizar; lint al cerrar.
metadata:
  type: feedback
---

El subsistema `semántica` mantiene la coherencia semántica del dominio en el tiempo. Vive en `.claude/semantica/` con **dos registros pares**, ninguno cargado en contexto siempre:

- `GLOSARIO.md` — terminología **legítima**: una tabla donde cada fila es un concepto (nombre canónico, definición corta, `Alias`, `Propuestos`, `Detalle`). Los conceptos complejos tienen su propia página `.claude/semantica/<nombre>.md`.
- `TERMINOLOGIA-FARLOPA.md` — relaciones **vetadas**: `Término | Significado vetado | Cómo decirlo`. **Lo vetado es la relación término→significado, no el término**: el mismo término con otro significado puede ser legítimo (`plomería`=cañerías es válido; `plomería`=infra interna es farlopa). El lint **marca por término**; el agente **juzga el significado** al leer la marca.

**Términos por estado (glosario):** `Alias` (formas válidas, ratificadas), `Propuestos` (sugeridos por el agente, sin usar hasta ratificar). El glosario **NO tiene columna de vetados**: todo veto es una relación término→significado y vive en el registro par de Terminología Farlopa.

**Why:** coherencia semántica a lo largo de la vida del repo. Los alias válidos **se registran** (saber que "birra/chela" son la misma cerveza evita confusión); los términos confusos o ajenos al dominio **se vetan** (dejan de usarse y se barren del texto vivo). Los agentes acumulan jerga sesión tras sesión —ver el conocimiento `terminologia-farlopa.md`—; la semántica la frena.

**Gobernanza:** el agente **nunca** ratifica un alias ni veta por su cuenta: solo **propone** en `Propuestos`. Ratificar y vetar son del usuario. El agente **nunca usa** un término que esté en `Propuestos`, ni uno vetado en el significado que Terminología Farlopa prohíbe, ni en texto plano, memorias, planes o código.

**How to apply:**

1. **Al planificar o analizar**, consultar los dos registros. Término nuevo válido → proponerlo en `Propuestos`. Término confuso o ajeno → proponer vetarlo (a Terminología Farlopa). En ambos casos, decide el usuario.
2. Concepto **simple** → una fila del glosario. Concepto **complejo** → fila + página de detalle enlazada.
3. **Al cerrar** una tarea que tocó semántica, correr el lint: `node .claude/semantica/lint-semantica/lint-semantica.js` (links de detalle, huérfanos, colisiones, propuestos pendientes, apariciones de vetados en el repo).

Relacionado: [[flujo-planes]] (consultar la semántica al planificar/analizar), [[terminologia-canonica]] (la ratificación no vale hasta bajarla al texto).
