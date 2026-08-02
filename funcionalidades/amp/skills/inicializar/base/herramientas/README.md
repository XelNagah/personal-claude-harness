# Herramientas

Las **Herramientas** del repo son la maquinaria con que se construye y se mantiene el Producto, y que no es parte del Producto. La invoca el agente, o la invoca otro mecanismo del repo — quién la llama no cambia lo que es. Tipos: `script`, `skill` local del repo, `MCP` local, `funcion`. Viven catalogadas en `.claude/herramientas/INDICE.md` y `INDICE-LOCAL.md` —un archivo por origen, declarado en su frontmatter— con la misma tabla (Herramienta | Tipo | Qué hace | Cómo se invoca | Estado). Cada fila apunta a donde vive la tool: un `script` en su carpeta `<tool>/` bajo herramientas, una `skill` en `.claude/skills/<skill>/`, un `MCP` en `.mcp.json`, una `funcion` en `.claude/common/`.

**Distinción clave:** los **lints de subsistema** (`lint-subsistemas`, `lint-semantica`, …) **no** son Herramientas. Son infraestructura del Patrón de cada subsistema (índice + entradas + **lint**) y viven con su subsistema. En el registro de Herramientas solo van tools del Propósito.

**Why:** que la colección de tools del Propósito no se vuelva un conjunto de herramientas desordenadas sin saber qué son, de dónde salieron ni cómo se usan. Ubicación determinística + registro escaneable + ficha por tool. Y que la infraestructura interna del harness (lints) no se confunda con las tools de dominio.

**How to apply:**

1. Toda Herramienta nueva del repo va al registro `.claude/herramientas/INDICE-LOCAL.md` (una fila), con su `Tipo`. Un `script` vive en `.claude/herramientas/<tool>/` con su `README.md` (nunca suelto); una `skill`/`MCP`/`funcion` se apunta a donde vive.
2. Marcar `Estado`; los `obsoleto` se pueden depurar.
3. ⚠️ **Refs por ruta:** una tool referenciada por ruta en `settings.local.json`/`settings.json` (regla de permiso), en `.gitignore` o en un hook NO se mueve/renombra alegremente — rompe el match por prefijo exacto y se pierde la pre-autorización (en headless, denegación directa). Antes de mover, grep su ruta; si aparece, actualizar la referencia en el mismo paso.
4. **Al cerrar** una tarea que tocó Herramientas, correr el lint: `node .claude/herramientas/lint-herramientas/lint-herramientas.js` (README por herramienta local, registro completo, filas colgadas, refs por ruta de lint en settings).

Planes, conocimiento u otros subsistemas pueden referenciar una Herramienta por su ruta explicando cómo usarla en su contexto.

Relacionado: [[flujo-planes]], [[base-conocimiento]].
