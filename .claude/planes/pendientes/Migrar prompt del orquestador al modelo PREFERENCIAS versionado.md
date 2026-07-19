# Migrar el prompt del orquestador al modelo PREFERENCIAS.md versionado

**Estado: Diferido · Creado 26-07-18.** Detectado al propagar los lints al harness (commit `4ff41ee`); se dejó una nota aditiva sin refactorizar.

## Objetivo

Alinear el `prompt.md` agnóstico del orquestador (`funcionalidades/setup-completo/prompt.md`) con el **modelo de preferencias versionado** (`PREFERENCIAS.md` con secciones Base/Adaptaciones + `@import`), que ya usan su propio SKILL/PLANTILLA y la funcionalidad `preferencias-trabajo`.

## Contexto (la divergencia)

Hoy ese `prompt.md` usa el **modelo v0**: escribe las preferencias *inline* directo en el archivo de instrucciones del harness destino, sin crear un `<config>/preferencias/PREFERENCIAS.md`. Diverge de:

- Su propio `skills/inicializar-custom/SKILL.md` y `PLANTILLA.md` (ya versionados).
- El `prompt.md` de la funcionalidad `preferencias-trabajo`.

Como parche, al propagar los lints se agregó una nota aditiva ("Preferencias como archivo versionado (recomendado)") que apunta al modelo `PREFERENCIAS.md` + su lint, **sin borrar** las instrucciones inline. Esto deja el prompt con dos modelos conviviendo.

## Alcance

- Reescribir la sección de preferencias de `funcionalidades/setup-completo/prompt.md` para que **cree `<config>/preferencias/PREFERENCIAS.md`** (Base/Adaptaciones) + el `@import`, e instale `lint-preferencias`, en vez del modelo inline. Quitar la nota aditiva provisional una vez migrado.
- Verificar coherencia con `preferencias-trabajo/prompt.md` (mismo modelo, forma agnóstica).
- Es solo el **prompt agnóstico**; SKILL/PLANTILLA ya están bien.

## Verificación
- `node .claude/scripts/lint-harness/lint-harness.js` verde.
- El prompt del orquestador y el de `preferencias-trabajo` describen el mismo modelo versionado, divergentes en forma no en contenido.
- Sin instrucciones inline residuales del modelo v0.

## Depende de
Nada — cleanup independiente.
