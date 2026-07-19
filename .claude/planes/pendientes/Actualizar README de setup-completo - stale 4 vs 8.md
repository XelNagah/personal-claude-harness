# Actualizar el README de setup-completo (stale: dice 4, instala 8)

**Estado: Diferido · Creado 26-07-18.** Origen: [Rework README raíz](../ejecutados/Rework%20README%20raiz%20+%20patron%20carpeta-indice-lint%20+%20audit%20sub-README.md) (detectado en el pase de sub-README).

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
