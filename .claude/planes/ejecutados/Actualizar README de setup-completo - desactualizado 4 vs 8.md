# Actualizar el README de setup-completo (stale: dice 4, instala 8)

**Estado: Ejecutado · Creado 26-07-18 · Cerrado 26-07-19.** Origen: [Rework README raíz](Rework%20README%20raiz%20+%20patron%20carpeta-indice-lint%20+%20audit%20sub-README.md) (detectado en el pase de sub-README).

## El problema

`funcionalidades/setup-completo/README.md` está desactualizado:
- Dice *"orquestando las **cuatro** funcionalidades"* y lista 4 en "Orden de orquestación" (preferencias, memoria, planes, commits).
- Pero `REGISTRO.md` y `.claude/CLAUDE.md` dicen que el orquestador instala **8** (suma conocimiento, glosario, decisiones, scripts).
- Su bloque "Qué agrega al repo destino" muestra el esquema viejo de planes (`planes-pendientes/` / `planes-ejecutados/`), ya migrado a `pendientes/ejecutados/descartados/`.
- **(26-07-18)** No refleja la máquina de estados nueva (un eje + `ESTADOS.md`): al propagar el rediseño de estados, el resto de `setup-completo` se actualizó pero este README se dejó intacto por estar globalmente stale — corregirlo acá, en una sola pasada con lo demás. La skill (`SKILL.md`/`PLANTILLA.md`/`prompt.md`) ya quedó al día.

## Antes de reescribir — verificar qué instala de verdad

No es solo texto: hay que confirmar la fuente de verdad. Leer `funcionalidades/setup-completo/skills/inicializar-custom/SKILL.md` (+ `PLANTILLA.md`) y `prompt.md` para ver si el orquestador realmente instala 4 u 8. Recién ahí decidir si el stale está en el README (actualizarlo a 8) o en el skill (que instalaría de menos).

## Verificación
- README de setup-completo coincide con lo que el skill instala y con REGISTRO/CLAUDE.md.
- Sin refs al esquema viejo de planes.
- `lint-harness` verde.

## Notas de implementación

Confirmado que el skill (`SKILL.md`/`PLANTILLA.md`) es la fuente de verdad y ya instala las 8 — el stale estaba solo en el README. Reescrito `funcionalidades/setup-completo/README.md`:

- "cuatro funcionalidades" → "ocho funcionalidades".
- Bloque "Qué agrega al repo destino" espejado desde la "Estructura objetivo" del skill: `preferencias/`, `memoria/` (8 memorias), `planes/` con `ESTADOS.md` + `PLANES.md` + `pendientes/ejecutados/descartados/`, `conocimiento/`, `glosario/`, `decisiones/`, `scripts/` (8 lints), y el mapa completo del `CLAUDE.md`.
- "Orden de orquestación" de 4 → 8 pasos, con la nota de dependencia (4–8 dependen de `memoria-local`).
- Sin refs al esquema viejo `planes-pendientes/` / `planes-ejecutados/`.

`lint-harness` verde (0 hallazgos, incluidos los bloques verbatim entre plantillas). El rename `memory/`→`memoria/` de este README se integró en la reescritura (commit anterior lo dejó sin tocar por venir fundido con el fix).
