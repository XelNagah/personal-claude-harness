# 0010 — Arquitectura multiagente del harness

**Fecha:** 2026-07-19 · **Estado:** vigente

## Contexto

El harness nació para Claude Code: punto de entrada `CLAUDE.md` con `@imports`, skills `SKILL.md`, hook `SessionStart`, marketplace de plugins. El contenido de los subsistemas siempre fue agnóstico (markdown + lints Node), pero un agente distinto (Codex CLI) abría un repo instalado y no veía nada. Se buscó una arquitectura con una única fuente de verdad por pieza y adaptadores mínimos por agente, con **paridad de comportamiento Claude Code ↔ Codex CLI** como objetivo (otros agentes, best-effort vía estándares).

La investigación de estándares (2026-07-19, fuentes primarias) cambió el tablero: `AGENTS.md` es hoy estándar de la Linux Foundation leído nativo por Codex/Cursor/Gemini CLI/Copilot (Claude Code es el único grande que no lo lee, y su doc oficial recomienda `CLAUDE.md` con `@AGENTS.md`); el formato `SKILL.md` se abrió como estándar Agent Skills y lo adoptaron todos los agentes objetivo (ubicación convergente `.agents/skills/` / `~/.agents/skills/`, con symlinks soportados); y los hooks con `SessionStart` ya existen también en Codex, Gemini y Cursor (mismo modelo, registro distinto).

## Decisión

1. **`AGENTS.md` en la raíz = fuente única de instrucciones**; `CLAUDE.md` en la raíz = adaptador de una línea (`@AGENTS.md`). Los imports del mapa del repo quedan como líneas doble-propósito ("cargá `@.claude/...`"): Claude las expande, los demás agentes las ejecutan como instrucción.
2. **Los subsistemas quedan en `.claude/`** como casa de datos única para todos los agentes (el nombre es cosmético; mudarlo costaba migrar todos los consumidores y cada ref por ruta, sin ganar funcionalidad).
3. **`SKILL.md` es el formato único de skills** (estándar Agent Skills); se retiran los `prompt.md` — su placeholder `<config>` (una casa de datos por agente) quedó conceptualmente obsoleto con (2), y su rol de "versión agnóstica" lo absorbe el estándar. Muere el invariante "divergentes en forma, no en contenido".
4. **Distribución de skills a nivel usuario**: junctions dobles `~/.claude/skills/` (Claude) y `~/.agents/skills/` (Codex/Cursor/Gemini) hacia las mismas carpetas fuente del harness. El marketplace de plugins se mantiene como canal Claude multi-máquina.
5. **Hooks con registro doble**: el mismo script registrado en `.claude/settings.json` (Claude) y en el formato de hooks de Codex.

## Alternativas descartadas

- **Paridad total mecánica** (generar skills/hooks en formato propio de cada agente): multiplica formatos (~4-5 × 16 skills); el dolor de propagación actual, amplificado.
- **CLAUDE.md como fuente** + `project_doc_fallback_filenames` de Codex: config por máquina, contra el ecosistema, cada agente nuevo = hack propio.
- **Archivo neutro + generador** (estilo ruler): maquinaria para adaptadores que hoy son 1 línea; AGENTS.md ya es el neutro.
- **Symlink CLAUDE.md→AGENTS.md**: no sobrevive git en Windows (`core.symlinks=false`) y la propia doc de Anthropic lo desaconseja ahí.
- **Mudar subsistemas a ubicación neutra** o **copiar skills a cada repo**: costo alto de migración/sincronización sin funcionalidad nueva.

## Consecuencias

- Un agente futuro que adopte AGENTS.md o Agent Skills queda soportado sin tocar el harness.
- `REGISTRO.md`, `lint-harness`, `propagar-harness`, `agregar-funcionalidad` y el orquestador se simplifican (un formato menos que sincronizar).
- Glosario actualizado: `Skill` redefinida al estándar Agent Skills; alta de `Punto de entrada`.
- **Riesgo aceptado:** en Codex las preferencias se cargan por instrucción textual (sin `@import` automático) — garantía más débil; mitigación futura: hook `SessionStart` de Codex que inyecte `PREFERENCIAS.md` (converge con el plan `Hook de preferencias en punto de accion`).
- Migración en 7 fases en el plan [Migracion a harness multiagente - AGENTS.md fuente unica](../planes/pendientes/Migracion%20a%20harness%20multiagente%20-%20AGENTS.md%20fuente%20unica.md).
