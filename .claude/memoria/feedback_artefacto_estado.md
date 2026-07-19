---
name: artefacto-estado
description: En tareas exploratorias multi-variable, mantener UN archivo de estado (tabla dimensión×resultado) actualizado antes de reportar en el chat; leerlo al retomar.
metadata:
  type: feedback
---

En tareas exploratorias multi-variable (benchmarks, comparaciones, análisis de escenarios), mantener **un** archivo de estado desde la primera corrida: tabla dimensión×resultado + fecha/hora por fila + "próxima acción".

**Why:** en sesiones largas el contexto conversacional es el peor lugar para el estado — se diluye, se pierde en compactaciones y no sobrevive a `/clear` ni al cambio de máquina. El archivo sí. Origen: sesión de benchmarking de ~11 hs (2026-06) donde la matriz combinación×prueba se perdió y costó ~8 turnos reconstruirla.

**How to apply:**

1. Actualizar el archivo **antes** de reportar cada resultado en el chat — el archivo es la fuente de verdad; el chat, el comentario.
2. Ubicación: si la exploración responde a un plan, sección `## Estado` dentro del plan; si es ad-hoc, `conocimiento/<tema>/estado.md` (al cerrar, destilar a conocimiento o borrar).
3. Al retomar (nueva sesión, otra máquina, post-`/clear`): leer el archivo antes que nada.

Relacionado: [[flujo-planes]].
