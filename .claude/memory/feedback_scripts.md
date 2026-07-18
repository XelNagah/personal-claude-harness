---
name: scripts
description: Convención de scripts del repo — cada tool en .claude/scripts/<tool>/ con README; registro tabla en INDICE.md; lint; cuidado con refs por ruta en settings/.gitignore/hooks.
metadata:
  type: feedback
---

Las herramientas/scripts del repo viven en `.claude/scripts/<tool>/`: cada script en su propia carpeta (nunca suelto), con un `README.md` que dice qué hace, cómo se corre y qué lo referencia. El registro `.claude/scripts/INDICE.md` es una tabla (Tool | Qué hace | Cómo se corre | Estado) que los lista a todos.

**Why:** que la carpeta de scripts no se vuelva un cementerio de archivos sin saber qué son, de dónde salieron ni cómo se usan. Ubicación determinística + registro escaneável + ficha por tool.

**How to apply:**

1. Todo script nuevo va en `.claude/scripts/<tool>/` con su `README.md`. Nunca suelto en `scripts/`.
2. Registrarlo en `.claude/scripts/INDICE.md` (una fila). Marcar `Estado`; los `obsoleto` se pueden depurar.
3. ⚠️ **Refs por ruta:** un script referenciado por ruta en `settings.local.json`/`settings.json` (regla de permiso), en `.gitignore` o en un hook NO se mueve/renombra alegremente — rompe el match por prefijo exacto y se pierde la pre-autorización (en headless, denegación directa). Antes de mover, grep su ruta; si aparece, actualizar la referencia en el mismo paso. Anotar quién lo referencia en el README del tool.
4. **Al cerrar** una tarea que tocó scripts, correr el lint: `node .claude/scripts/lint-scripts/lint-scripts.js` (README por tool, registro completo, filas colgadas, refs por ruta en settings).

Otras memorias, planes o conocimiento pueden referenciar un tool por su ruta explicando cómo usarlo en su contexto.

Relacionado: [[flujo-planes]], [[base-conocimiento]].
