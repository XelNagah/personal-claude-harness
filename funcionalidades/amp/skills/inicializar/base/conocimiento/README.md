# Conocimiento

El conocimiento persistido del agente (documentos, estudios, temas y notas del proyecto o dominio) vive en una carpeta única: `.claude/conocimiento/`, con un `INDICE.md` en su raíz. La convención de Herramientas está en [el README de ese subsistema](../herramientas/README.md).

**Why:** ubicación determinística → el lint y cualquier consulta saben dónde mirar sin heurística; separa lo que el agente conoce de la configuración y de sus Herramientas; mantiene la raíz del repo limpia.

**How to apply:**

1. **Cuándo asentar:** al averiguar algo que costó descubrir y que va a hacer falta de nuevo (cómo funciona el proyecto, el dominio, un sistema externo, un formato o una restricción real). La skill `registrar-conocimiento` hace el flujo. **Dónde:** todo md de conocimiento nuevo va bajo `.claude/conocimiento/` (subcarpetas por tema; cada una con su `INDICE.md` si crece). Nunca en la raíz del repo.
2. Mantener `.claude/conocimiento/INDICE.md` como índice raíz (una línea por página/sección; solo punteros).
3. **Al cerrar** una tarea que escribió conocimiento, correr el lint mecánico: `node .claude/conocimiento/lint-conocimiento/lint-conocimiento.js`. Chequea refs rotas, índice incompleto y huérfanos (sin LLM, sin red). Resolver los hallazgos.
4. El **chequeo semántico** (contradicciones entre páginas, duplicación, desactualización) se corre a pedido tras una incorporación grande, no en cada cierre.
5. **Migración:** un script de datos acoplado por `__dirname` que se mueva a `.claude/herramientas/<tool>/` debe reapuntar sus paths a la carpeta de datos en `conocimiento/` (`__dirname + '/../../conocimiento/<subdir>/...'`), o se rompe.
