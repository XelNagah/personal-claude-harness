# Prompt: inicializar gestión de scripts

> **Uso:** pegar todo lo que sigue (desde la línea horizontal) a un agente de código parado en la raíz del proyecto. Instala la convención en el directorio nativo de tu harness (`.claude/`, `.codex/`, `.cursor/`, `.github/`, o `.agent/` — `<config>/` es ese directorio).
>
> **Depende de la memoria local.** Si todavía no configuraste el sistema de memoria, pegá antes el prompt de `memoria-local`.

---

Configurá en este proyecto la **gestión de scripts**: cada herramienta en su carpeta `<tool>/` con un README, listadas en un registro-tabla, con un lint. Ordena el "cementerio de scripts". Si parte ya existe, **extendé sin pisar**.

## Reconciliación (idempotencia)

Seguro de re-correr:

- **Inspeccioná antes de escribir.** Leé el destino. Nunca reescribas de cuajo el registro ni un README de tool.
- **Detectá equivalentes.** Puede haber ya un registro de scripts con otro nombre. Buscá por tema. Igual → no tocar. Distinto → reportá y preguntame.
- **Reportá al final** en tres baldes: `agregado` / `ya estaba` / `divergente`.

## 1. Registro de scripts

Asegurá `<config>/scripts/INDICE.md`. Si no existe, crealo con encabezado + una tabla vacía de columnas **Tool | Qué hace | Cómo se corre | Estado**:

- **Tool** — link a la carpeta `<tool>/` (adentro, el README y el código).
- **Qué hace** — una línea.
- **Cómo se corre** — el comando de invocación.
- **Estado** — `vigente`, `experimental` u `obsoleto`.

Cada script vive en `<config>/scripts/<tool>/` con su `README.md` (ficha: qué hace, cómo se corre, dependencias, quién lo referencia por ruta, y origen si aporta). Nunca suelto en `scripts/`.

## 2. Lint de integridad

Instalá `<config>/scripts/lint-scripts/lint-scripts.js` (Node, sin deps ni red) con su README: chequea **README por tool**, **tool en el índice**, **filas colgadas** (ninguna fila apunta a un dir inexistente) y **refs por ruta en settings** (todo script referenciado por ruta en `settings.local.json`/`settings.json` existe). Contenido exacto en la plantilla de la versión Claude Code — `skills/inicializar-scripts/PLANTILLA.md` §Script. Corré `node <config>/scripts/lint-scripts/lint-scripts.js` al cerrar tareas que tocaron scripts.

## 3. Migración (ordenar el cementerio)

Si ya hay scripts sueltos sin doc: agrupá cada uno en su `<tool>/` con README y fila en el registro. Si no se sabe qué hace uno, marcalo `Estado: obsoleto` y reportalo — no inventes propósito. ⚠️ **Antes de mover un script, grep su ruta** en `settings`, `.gitignore` y hooks: si aparece, actualizá la referencia en el mismo paso (mover rompe el match por prefijo y la pre-autorización). Cubrí **todos** los scripts en el registro.

## 4. Convención como memoria

Si tenés sistema de memoria local, persistí la convención como memoria tipada `feedback` (indexala): cada tool en su carpeta con README; registrar en el índice; cuidado con refs por ruta; lint al cerrar.

## 5. Referencia en las instrucciones del proyecto

En el archivo que tu harness carga al inicio (`CLAUDE.md`, `AGENTS.md`, etc.), creá/extendé una sección **"Scripts del proyecto"** con link a `scripts/INDICE.md`, la regla de una carpeta por tool y el paso de lint al cerrar.

## 6. Reporte

Reportá en los tres baldes (`agregado` / `ya estaba` / `divergente`). No hagas commit salvo que te lo pida.
