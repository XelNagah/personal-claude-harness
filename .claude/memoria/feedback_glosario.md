---
name: glosario
description: Glosario del dominio en .claude/glosario/INDICE.md — tabla de conceptos con términos por estado (alias/propuestos/vetados) + páginas de detalle; el agente solo propone, el usuario ratifica y veta; consultar al planificar/analizar; lint al cerrar.
metadata:
  type: feedback
---

La terminología del dominio vive en `.claude/glosario/INDICE.md`: una tabla donde cada fila es un concepto (nombre canónico, definición corta, y sus **términos por estado**). Los conceptos complejos tienen su propia página `.claude/glosario/<nombre>.md` (fórmulas, ejemplos, o el mapa de reemplazos de un vetado).

**Términos por estado (un solo eje):** `Alias` (formas válidas, ratificadas), `Propuestos` (sugeridos por el agente, sin usar hasta ratificar), `Vetados` (prohibidos; el reemplazo es el canónico de la propia fila). El concepto *Terminología Farlopa* agrupa los vetados que no tienen concepto de dominio propio, con su mapa término→reemplazo en la página de Detalle.

**Why:** coherencia semántica a lo largo de la vida del repo. Los alias válidos **se registran** (saber que "birra/chela" son la misma cerveza evita confusión); los términos confusos o ajenos al dominio **se vetan** (dejan de usarse y se barren del texto vivo). Los agentes acumulan jerga sesión tras sesión —ver el conocimiento `terminologia-farlopa.md`—; el glosario la frena.

**Gobernanza (decisión 0004):** el agente **nunca** escribe en `Alias` ni en `Vetados`: solo **propone** en `Propuestos`. Ratificar y vetar son del usuario. El agente **nunca usa** un término que esté en `Propuestos` o en `Vetados`, ni en texto plano, memorias, planes o código.

**How to apply:**

1. **Al planificar o analizar**, consultar el glosario. Término nuevo válido → proponerlo en `Propuestos` (no escribir en Alias). Término confuso o ajeno → proponer vetarlo. En ambos casos, decide el usuario.
2. Concepto **simple** → una fila. Concepto **complejo** → fila + página de detalle enlazada.
3. **Al cerrar** una tarea que tocó el glosario, correr el lint: `node .claude/glosario/lint-glosario/lint-glosario.js` (links de detalle, huérfanos, colisiones de términos, propuestos pendientes, apariciones de vetados en el repo).

Relacionado: [[flujo-planes]] (consultar el glosario al planificar/analizar), [[terminologia-canonica]] (la ratificación no vale hasta bajarla al texto).
