# Rediseño de estados de planes + renombre de memoria local a español

**Estado:** Ejecutado · Cerrado 26-07-18.

## Objetivo

Rediseñar la máquina de estados de los planes y limpiar la nomenclatura del harness.

## Qué incluye

1. **Estados de un solo eje** — `Nuevo · En curso · Diferido · Ejecutado · Descartado`, declarados en `planes/ESTADOS.md` (configurable por repo). Elimina la columna `Prioridad`. Decisión 0005.
2. **Barrido de términos viejos** — `foco`, `estacionado`, `idea`, `en diseño`, `listo`, `en ejecución` se eliminan de todo lo vivo (no se registran como alias).
3. **Lint data-driven** — `lint-planes` lee `ESTADOS.md` en vez de hardcodear carpetas/estados.
4. **Renombre de memoria local** — `memory/`→`memoria/`, `MEMORY.md`→`MEMORIA.md`. Decisión 0006.
5. **Propagación al harness** — funcionalidades `gestion-de-planes` y `memoria-local` + orquestador `setup-completo` (textos verbatim).

## Fuera de alcance (plan aparte)

- Migrar los repos que ya instalaron el harness → [[Migrar repos consumidores a estados nuevos]].

## Notas de implementación

**Fase A — estados (repo local):** `ESTADOS.md` configurable (tabla Estado|Sentido|Carpeta|Terminal, un solo eje: `Nuevo · En curso · Diferido · Ejecutado · Descartado`); `lint-planes.js` reescrito data-driven (lee `ESTADOS.md`, valida estado↔carpeta y estados inválidos, vigila `En curso` envejecidos vía constante `VIGILAR_ANTIGUEDAD`); `PLANES.md` migrado sin columna `Prioridad`; decisiones **0005** (estados un eje) y **0006** (memoria en español); barrido total de `foco`/`estacionado`/`idea`/`en diseño`/`listo`/`en ejecución` en `.claude/`. Aclaración de flujo: `En curso` = se está ejecutando; el diseño/revisión es parte de estar `Nuevo` (no hay estado de diseño).

**Fase A — propagación al harness:** subagente fresco replicó la máquina nueva + `ESTADOS.md` sembrado + lint data-driven + migración dos-ejes→un-eje en `gestion-de-planes` (prompt/README/SKILL/PLANTILLA) y orquestador `setup-completo`. Byte-exactness verificada por mí (los bloques locales están embebidos idénticos en ambas PLANTILLAs) + `lint-harness` 0. El `setup-completo/README.md` stale quedó intacto (es el plan Diferido "Actualizar README de setup-completo").

**Fase B — renombre `memory→memoria` / `MEMORY.md→MEMORIA.md`:** local (`git mv` + refs en CLAUDE.md `@import`, `lint-memoria.js`, README, conocimiento/scripts/planes) y harness (subagente fresco, 30 archivos de `funcionalidades/`). Verificado: grep 0 en `funcionalidades/`, `lint-harness` 0, `claude plugin validate .` passed. La auto-memoria del sistema Claude Code (fuera del repo) queda como está.

**Fuera de alcance:** migrar los repos que ya instalaron el harness → plan Diferido [[Migrar repos consumidores a estados nuevos]]. Sin commit (a pedido).
