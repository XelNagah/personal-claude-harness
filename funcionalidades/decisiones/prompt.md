# Prompt: inicializar registro de decisiones

> **Uso:** pegar todo lo que sigue (desde la línea horizontal) a un agente de código parado en la raíz del proyecto. Instala el registro en el directorio nativo de tu harness (`.claude/`, `.codex/`, `.cursor/`, `.github/`, o `.agent/` — `<config>/` es ese directorio).
>
> **Depende de la memoria local.** Si todavía no configuraste el sistema de memoria, pegá antes el prompt de `memoria-local`.

---

Configurá en este proyecto un **registro de decisiones**, con la misma estructura que un glosario: una tabla donde lo simple vive en la fila y lo complejo linkea a una página de detalle. Se consulta al planificar/analizar. **No son "ADR"** — estos repos son de propósito general; se cae la "A", pero se conserva su función de acotar: solo lo **estructural**. Si parte ya existe, **extendé sin pisar**.

## Reconciliación (idempotencia)

Seguro de re-correr:

- **Inspeccioná antes de escribir.** Leé el destino. Nunca reescribas de cuajo el registro ni una página de detalle.
- **Detectá equivalentes.** Puede haber ya un registro con otro nombre (un `docs/adr/`, un `INDICE.md` con otro formato). Buscá por tema. Igual → no tocar. Distinto → reportá y preguntame antes de migrar.
- **Reportá al final** en tres baldes: `agregado` / `ya estaba` / `divergente`.

## 1. Archivo de decisiones

Asegurá `<config>/decisiones/INDICE.md`. Si no existe, crealo con encabezado + una tabla vacía de columnas **N° | Decisión | Fecha | Estado | Detalle**:

- **N°** — secuencial (`0001`, `0002`, …), referencia estable.
- **Decisión** — qué se decidió y por qué, en una frase (para las simples).
- **Fecha** — `AAAA-MM-DD`.
- **Estado** — `vigente` o `reemplazada por NNNN` (revertir = agregar una nueva y marcar la vieja; no se borra).
- **Detalle** — link a `<config>/decisiones/NNNN-slug.md` **solo si la decisión requiere conceptualización mayor** (contexto, alternativas, consecuencias); `—` si es simple.

**Qué se registra:** solo decisiones **estructurales al propósito del repo** — las que definen cómo es / qué hace en lo esencial, o que eligen un camino que condiciona el trabajo futuro. **No** las operativas triviales ("busqué en internet", "usé tal flag").

## 2. Lint de integridad

Instalá `<config>/scripts/lint-decisiones/lint-decisiones.js` (Node, sin deps ni red): chequea **numeración** (sin huecos ni duplicados), **links de detalle** (resuelven), **páginas huérfanas** (toda `NNNN-slug.md` referenciada) y **superseded** (todo `reemplazada por NNNN` apunta a una decisión existente). Contenido exacto en la plantilla de la versión Claude Code — `skills/inicializar-decisiones/PLANTILLA.md` §Script. Corré `node <config>/scripts/lint-decisiones/lint-decisiones.js` al cerrar tareas que registraron decisiones.

## 3. Convención como memoria

Si tenés sistema de memoria local, persistí la convención como memoria tipada `feedback` (indexala): registrar solo lo estructural; al planificar/analizar consultar las decisiones previas para no re-decidir ni contradecir; simple → fila, complejo → página; correr el lint al cerrar.

## 4. Referencia en las instrucciones del proyecto

En el archivo que tu harness carga al inicio (`CLAUDE.md`, `AGENTS.md`, etc.), creá/extendé una sección **"Decisiones del proyecto"** con link a `decisiones/INDICE.md`, la regla de consultarlas al planificar/analizar y el paso de lint al cerrar.

## 5. Reporte

Reportá en los tres baldes (`agregado` / `ya estaba` / `divergente`). No hagas commit salvo que te lo pida.
