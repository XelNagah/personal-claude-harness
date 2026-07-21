---
name: base-conocimiento
description: Convención de base de conocimiento — todo lo que el agente sabe vive en .claude/conocimiento/; lint de integridad al cerrar.
metadata:
  type: feedback
---

El conocimiento persistido del agente (documentos, estudios, temas, notas de dominio) vive en una carpeta única: `.claude/conocimiento/`, con un `INDICE.md` en su raíz. (La convención de dónde viven las Herramientas la define la memoria [[herramientas]].)

**Why:** ubicación determinística → el lint y cualquier consulta saben dónde mirar sin heurística; separa lo que el agente CONOCE (`conocimiento/`) de su config (`memoria/`, `AGENTS.md`) y su tooling (`herramientas/`); mantiene la raíz del repo limpia.

**How to apply:**

1. **Cuándo asentar:** al averiguar algo del dominio que costó descubrir y que va a hacer falta de nuevo (cómo funciona un sistema externo, un formato, una restricción real). La prueba que lo separa de la memoria: **¿seguiría siendo cierto si este repo no existiera?** Sí → conocimiento; no → memoria o decisión. La skill `registrar-conocimiento` hace el flujo. **Dónde:** todo md de conocimiento nuevo va bajo `.claude/conocimiento/` (subcarpetas por tema; cada una con su `INDICE.md` si crece). Nunca en la raíz del repo.
2. Mantener `.claude/conocimiento/INDICE.md` como índice raíz (una línea por página/sección; solo punteros).
3. **Al cerrar** una tarea que escribió conocimiento, correr el lint mecánico: `node .claude/conocimiento/lint-conocimiento/lint-conocimiento.js`. Chequea refs rotas, índice incompleto y huérfanos (sin LLM, sin red). Resolver los hallazgos.
4. El **chequeo semántico** (contradicciones entre páginas, duplicación, desactualización) se corre a pedido tras una incorporación grande, no en cada cierre.
5. **Migración:** un script de datos acoplado por `__dirname` que se mueva a `.claude/herramientas/<tool>/` debe reapuntar sus paths a la carpeta de datos en `conocimiento/` (`__dirname + '/../../conocimiento/<subdir>/...'`), o se rompe.
