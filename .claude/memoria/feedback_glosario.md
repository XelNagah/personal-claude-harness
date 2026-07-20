---
name: glosario
description: Glosario del dominio en .claude/glosario/INDICE.md — tabla de conceptos con alias registrados + páginas de detalle para lo complejo; consultar al planificar/analizar; lint al cerrar.
metadata:
  type: feedback
---

La terminología del dominio vive en `.claude/glosario/INDICE.md`: una tabla donde cada fila es un concepto (nombre canónico, definición corta, alias, y link a página de detalle si el concepto es complejo). Los conceptos complejos tienen su propia página `.claude/glosario/<nombre>.md` (fórmulas, ejemplos, contraejemplos).

**Why:** coherencia semántica a lo largo de la vida del repo. Los alias **se registran, no se prohíben**: saber que "birra/chela" son la misma cerveza evita confusión, sin vetar cómo se la nombra.

**How to apply:**

1. **Al planificar o analizar**, consultar el glosario. Si aparece un término, ver si ya es alias de un concepto registrado; si es nuevo, agregar el concepto (o el alias) en el momento.
2. Concepto **simple** → una fila, columna Detalle en `—`. Concepto **complejo** → fila + página de detalle enlazada.
3. **Alias:** registrarlos en la columna Alias (no vetarlos). Un mismo alias no puede estar bajo dos conceptos distintos (el lint lo caza).
4. **Al cerrar** una tarea que tocó el glosario, correr el lint: `node .claude/glosario/lint-glosario/lint-glosario.js` (links de detalle resuelven, páginas sin huérfanos, alias sin colisión).

Relacionado: [[flujo-planes]] (consultar el glosario al planificar/analizar).
