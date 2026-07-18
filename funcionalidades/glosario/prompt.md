# Prompt: inicializar glosario del dominio

> **Uso:** pegar todo lo que sigue (desde la línea horizontal) a un agente de código parado en la raíz del proyecto. Instala el glosario en el directorio nativo de tu harness (`.claude/`, `.codex/`, `.cursor/`, `.github/`, o `.agent/` — `<config>/` es ese directorio).
>
> **Depende de la memoria local.** Si todavía no configuraste el sistema de memoria, pegá antes el prompt de `memoria-local`.

---

Configurá en este proyecto un **glosario del dominio**: una tabla de conceptos (nombre canónico, definición, alias registrados) donde los conceptos complejos linkean a una página de detalle propia. Sirve para mantener **coherencia semántica** al planificar y analizar. Si parte ya existe, **extendé sin pisar**.

## Reconciliación (idempotencia)

Seguro de re-correr:

- **Inspeccioná antes de escribir.** Leé el destino. Nunca reescribas de cuajo el glosario ni una página de detalle.
- **Detectá equivalentes.** Puede haber ya un glosario con otro nombre (un `CONTEXT.md`, un `glosario.md` suelto). Buscá por tema. Igual → no tocar. Distinto → reportá y preguntame antes de migrar.
- **Reportá al final** en tres baldes: `agregado` / `ya estaba` / `divergente`.

## 1. Archivo de glosario

Asegurá `<config>/glosario/INDICE.md`. Si no existe, crealo con encabezado + una tabla vacía de columnas **Concepto | Definición | Alias | Detalle**:

- **Concepto** — nombre canónico.
- **Definición** — una o dos frases: qué ES (no qué hace).
- **Alias** — otras formas de llamarlo, **registradas para mapear, no prohibidas** (separadas por coma; `—` si no hay). Ej.: cerveza → birra, chela, fresca.
- **Detalle** — link a una página `<config>/glosario/<slug>.md` **solo si el concepto es complejo** (fórmulas, ejemplos, contraejemplos); `—` si es simple.

Solo términos **propios del dominio** (no conceptos generales de programación).

**Gobernanza — toda entrada nueva pasa por el usuario:** el agente puede *proponer* términos (marcados como propuestos), pero no se asientan como canónicos sin ratificación. Preferir las palabras del usuario a acuñar nuevas.

## 2. Lint de integridad

Instalá `<config>/scripts/lint-glosario/lint-glosario.js` (Node, sin deps ni red): chequea **links de detalle** (resuelven), **páginas huérfanas** (toda `<slug>.md` está referenciada desde la tabla) y **colisiones de alias** (un mismo alias no cuelga de dos conceptos). El contenido exacto está en la plantilla de la versión Claude Code — `skills/inicializar-glosario/PLANTILLA.md` §Script. Corré `node <config>/scripts/lint-glosario/lint-glosario.js` al cerrar tareas que tocaron el glosario.

## 3. Convención como memoria

Si tenés sistema de memoria local, persistí la convención como memoria tipada `feedback` (indexala): al planificar/analizar consultar el glosario; registrar alias en vez de vetarlos; concepto complejo → página de detalle; correr el lint al cerrar.

## 4. Referencia en las instrucciones del proyecto

En el archivo que tu harness carga al inicio (`CLAUDE.md`, `AGENTS.md`, etc.), creá/extendé una sección **"Glosario del proyecto"** con link a `glosario/INDICE.md` y la regla de consultarlo al planificar/analizar.

## 5. Reporte

Reportá en los tres baldes (`agregado` / `ya estaba` / `divergente`). No hagas commit salvo que te lo pida.
