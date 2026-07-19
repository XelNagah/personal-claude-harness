# Prompt: inicializar Herramientas

> **Uso:** pegar todo lo que sigue (desde la línea horizontal) a un agente de código parado en la raíz del proyecto. Instala la convención en el directorio nativo de tu harness (`.claude/`, `.codex/`, `.cursor/`, `.github/`, o `.agent/` — `<config>/` es ese directorio).
>
> **Depende de la memoria local.** Si todavía no configuraste el sistema de memoria, pegá antes el prompt de `memoria-local`.

---

Configurá en este proyecto la gestión de **Herramientas**: las *tools* que el propósito del repo requiere y el agente invoca para tareas repetibles — tipos `script`, `skill` local del repo, `MCP` local — catalogadas en un registro-tabla con un lint. Ordena el "cementerio de tools". Si parte ya existe, **extendé sin pisar**.

**Qué NO entra:** los lints de subsistema (el de memoria, glosario, decisiones…) **no** son Herramientas — son infra del Patrón de cada subsistema y viven con su subsistema (`<config>/<sub>/lint-<sub>/`). Acá solo van las tools de dominio que sirven al propósito.

## Reconciliación (idempotencia)

Seguro de re-correr:

- **Inspeccioná antes de escribir.** Leé el destino. Nunca reescribas de cuajo el registro ni un README de tool.
- **Detectá equivalentes.** Puede haber ya un registro de tools/scripts con otro nombre. Buscá por tema. Igual → no tocar. Distinto → reportá y preguntame.
- **Reportá al final** en tres baldes: `agregado` / `ya estaba` / `divergente`.

## 1. Registro de Herramientas

Asegurá `<config>/herramientas/INDICE.md`. Si no existe, crealo con encabezado + una tabla vacía de columnas **Herramienta | Tipo | Qué hace | Cómo se invoca | Estado**:

- **Herramienta** — nombre; si es tipo `script` con carpeta local, link a `<tool>/`. Si es `skill` o `MCP`, link a donde vive (`<config>/skills/<skill>/`, `.mcp.json`).
- **Tipo** — `script` | `skill` | `mcp`.
- **Qué hace** — una línea.
- **Cómo se invoca** — el comando (`script`), el nombre de skill que dispara el modelo (`skill`), o cómo se conecta y qué tool-calls expone (`mcp`).
- **Estado** — `vigente`, `experimental` u `obsoleto`.

Un `script` vive en `<config>/herramientas/<tool>/` con su `README.md` (ficha: qué hace, cómo se invoca, dependencias, quién lo referencia por ruta, y origen si aporta). Nunca suelto. Una `skill` vive en `<config>/skills/<skill>/`; un `MCP` se configura en `.mcp.json`: el registro solo los **indexa** donde viven.

## 2. Lint de integridad

Instalá `<config>/herramientas/lint-herramientas/lint-herramientas.js` (Node, sin deps ni red) con su README: chequea **README por herramienta con carpeta local**, **herramienta en el índice**, **filas colgadas** (link a subdir local inexistente; saltea links externos a skills/MCP) y **refs por ruta de lint en settings** (toda ruta `.claude/**/*.js` en `settings.local.json`/`settings.json` existe). Contenido exacto en la plantilla de la versión Claude Code — `skills/inicializar-herramientas/PLANTILLA.md` §Script. Corré `node <config>/herramientas/lint-herramientas/lint-herramientas.js` al cerrar tareas que tocaron Herramientas.

## 3. Migración (ordenar el cementerio)

Si ya hay scripts sueltos sin doc: agrupá cada uno como una Herramienta tipo `script` en su `<tool>/` con README y fila en el registro. Si no se sabe qué hace uno, marcalo `Estado: obsoleto` y reportalo — no inventes propósito. ⚠️ **Antes de mover un script, grep su ruta** en `settings`, `.gitignore` y hooks: si aparece, actualizá la referencia en el mismo paso (mover rompe el match por prefijo y la pre-autorización). Cubrí **todas** las tools en el registro.

## 4. Convención como memoria

Si tenés sistema de memoria local, persistí la convención como memoria tipada `feedback` (indexala): las tools del Propósito (script/skill local/MCP) en el registro con su Tipo; los lints de subsistema no son herramientas; cuidado con refs por ruta; lint al cerrar.

## 5. Referencia en las instrucciones del proyecto

En el archivo que tu harness carga al inicio (`CLAUDE.md`, `AGENTS.md`, etc.), creá/extendé una sección **"Herramientas del proyecto"** con link a `herramientas/INDICE.md`, la aclaración de que los lints de subsistema no van acá, y el paso de lint al cerrar.

## 6. Reporte

Reportá en los tres baldes (`agregado` / `ya estaba` / `divergente`). No hagas commit salvo que te lo pida.
