# Prompt: inicializar base de conocimiento

> **Uso:** pegar todo lo que sigue (desde la línea horizontal) a un agente de código parado en la raíz del proyecto. Instala la base de conocimiento en el directorio nativo de tu harness.

---

Configurá en este proyecto una **base de conocimiento** con ubicación única, usando el directorio de configuración **nativo de tu harness**:

- Claude Code → `.claude/`
- Codex → `.codex/` (instrucciones en `AGENTS.md`)
- Cursor → `.cursor/` (instrucciones en `.cursor/rules/`)
- Copilot → `.github/` (instrucciones en `.github/copilot-instructions.md`)
- Otro / sin convención → `.agent/`

En lo que sigue, `<config>/` es ese directorio. Si parte ya existe, **extendé sin pisar**.

## Reconciliación (idempotencia)

Seguro de re-correr: sirve para **"levelear"** repos que ya tienen algunas partes. Aplicá a cada paso que escribe:

- **Inspeccioná antes de escribir.** Leé primero el destino. Nunca reescribas de cuajo un archivo existente.
- **Creá solo lo ausente.** No existe → crear. Existe → agregar únicamente lo que falte, preservando el resto.
- **Detectá equivalentes.** Buscá por tema, no solo por nombre exacto. Igual → no tocar. Distinto → reportá y preguntame.
- **Reportá al final** en tres baldes: `agregado`, `ya estaba`, `divergente`.

## 1. Carpeta de conocimiento

Asegurá `<config>/conocimiento/` con un `INDICE.md` raíz — índice con una línea por página/sección (`- [Título](ruta.md) — resumen corto`); solo punteros, nunca contenido. Es la **ubicación única** de todo lo que el agente sabe (documentos, estudios, temas, notas de dominio).

## 2. Lint de integridad

Instalá el tool en **su propia carpeta**: `<config>/scripts/lint-conocimiento/lint-conocimiento.js`. Es un script Node sin dependencias ni red que chequea, sobre `<config>/conocimiento/`: **refs rotas** (todo link/ruta `.md` mencionado existe), **índice incompleto** (todo `.md` está listado en su `INDICE.md`), **huérfanos** (páginas que nada referencia). Ignora placeholders (`...`, `<...>`, plantillas de fecha). Corré `node <config>/scripts/lint-conocimiento/lint-conocimiento.js` al cerrar tareas que escribieron conocimiento.

(El contenido exacto del script está en la plantilla de la versión Claude Code de esta funcionalidad — `skills/inicializar-conocimiento/PLANTILLA.md` §Script.)

## 3. Convención como memoria

Si tenés sistema de memoria local, persistí la convención como una memoria tipada `feedback`:

- **Ubicación única:** conocimiento nuevo siempre bajo `<config>/conocimiento/`, nunca en la raíz. Scripts de harness en `<config>/scripts/<tool>/`, cada uno en su carpeta.
- **Lint al cerrar** (mecánico, gratis); semántico (contradicciones, duplicación, staleness) a pedido.
- **Migración:** scripts acoplados por `__dirname` que se muevan deben reapuntar sus paths de datos a `<config>/conocimiento/...`.

Indexala en tu índice de memoria.

## 4. Referencia en las instrucciones del proyecto

En el archivo que tu harness carga al inicio (`CLAUDE.md`, `AGENTS.md`, etc.), creá/extendé una sección **"Base de conocimiento del proyecto"** con link a `conocimiento/INDICE.md`, la regla de ubicación única y el paso de lint al cerrar.

## 5. Migración

Detectá conocimiento que viva **fuera** de `<config>/conocimiento/` (árboles de md en la raíz, carpetas con su `INDICE.md`, notas de dominio sueltas). Proponé un plan de move concreto y **movelo adentro** preservando estructura; reparalo (paths de índices, links entre páginas, `__dirname` de scripts de datos) y corré el lint para confirmar 0 refs rotas. Si es ambiguo qué es conocimiento vs. contenido incidental (código, assets), listalo y preguntame antes de mover.

## 6. Reporte

Reportá en los tres baldes (`agregado` / `ya estaba` / `divergente`) + la estructura final. No hagas commit salvo que te lo pida.
