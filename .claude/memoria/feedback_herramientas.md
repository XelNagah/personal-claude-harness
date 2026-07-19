---
name: herramientas
description: Convención de Herramientas del repo — las tools del Propósito (script, skill local, MCP local) en .claude/herramientas/ con registro INDICE.md (columna Tipo); los lints de subsistema NO son herramientas (viven con su subsistema); cuidado con refs por ruta en settings/.gitignore/hooks.
metadata:
  type: feedback
---

Las **Herramientas** del repo son las *tools* que el **Propósito** del repo requiere y el agente invoca para tareas repetibles (decisión 0007). Tipos: `script`, `skill` local del repo, `MCP` local. Viven catalogadas en `.claude/herramientas/INDICE.md` — tabla (Herramienta | Tipo | Qué hace | Cómo se invoca | Estado). Cada fila linkea a donde vive la tool: un `script` en su carpeta `<tool>/` bajo herramientas, una `skill` en `.claude/skills/<skill>/`, un `MCP` en `.mcp.json`.

**Distinción clave (decisión 0008):** los **lints de subsistema** (lint-memoria, lint-glosario, …) **no** son Herramientas. Son infra del Patrón de cada subsistema (índice + entradas + **lint**), y viven **con su subsistema**: `.claude/<sub>/lint-<sub>/`. En el registro de Herramientas solo van tools de dominio. El Propósito de **este** repo es autorar el harness, así que su Herramienta de dominio es `lint-harness` (más `lint-herramientas`, que guarda este registro).

**Why:** que la colección de tools del Propósito no se vuelva un cementerio de archivos sin saber qué son, de dónde salieron ni cómo se usan. Ubicación determinística + registro escaneable + ficha por tool. Y que la plomería del harness (lints) no se confunda con las tools de dominio.

**How to apply:**

1. Toda Herramienta nueva va al registro `.claude/herramientas/INDICE.md` (una fila), con su `Tipo`. Un `script` vive en `.claude/herramientas/<tool>/` con su `README.md` (nunca suelto); una `skill`/`MCP` se linkea donde vive.
2. Marcar `Estado`; los `obsoleto` se pueden depurar.
3. ⚠️ **Refs por ruta:** una tool referenciada por ruta en `settings.local.json`/`settings.json` (regla de permiso), en `.gitignore` o en un hook NO se mueve/renombra alegremente — rompe el match por prefijo exacto y se pierde la pre-autorización (en headless, denegación directa). Antes de mover, grep su ruta; si aparece, actualizar la referencia en el mismo paso.
4. **Al cerrar** una tarea que tocó Herramientas, correr el lint: `node .claude/herramientas/lint-herramientas/lint-herramientas.js` (README por herramienta local, registro completo, filas colgadas, refs por ruta de lint en settings).

Otras memorias, planes o conocimiento pueden referenciar una tool por su ruta explicando cómo usarla en su contexto.

Relacionado: [[flujo-planes]], [[base-conocimiento]].
