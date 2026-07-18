# Propagar el guardarraíl de terminología corriente al harness

**Estado: idea · Creado 26-07-18.** Estacionado. Origen: [Rework README raíz](../ejecutados/Rework%20README%20raiz%20+%20patron%20carpeta-indice-lint%20+%20audit%20sub-README.md). Ratificado por el usuario en esa sesión.

## Objetivo

La decisión **0004** se amplió (español corriente en todo — nada de palabras inventadas o raras, ni en prosa ni en diagramas; no solo en registros). Falta llevar esa regla reforzada a la **Base** de preferencias para que valga en **todo repo**, no solo en este.

## Alcance

- **Base de preferencias** (`preferencias/PREFERENCIAS.md`, sección Base): bump `harness v1 → v2` con el texto reforzado de terminología.
- **Funcionalidad `preferencias-trabajo`**: propagar verbatim a `prompt.md` (agnóstico) + `skills/inicializar-preferencias-trabajo/SKILL.md` + `PLANTILLA.md`.
- **Orquestador `setup-completo`**: su `PLANTILLA.md` y `prompt.md` duplican el bloque de preferencias verbatim → actualizar ahí también.
- Verificar **byte-exactness** de los embebidos (ver memoria [propagación al harness](../../memory/feedback_propagacion_harness.md)): delegar a subagente fresco, no fork.

## Verificación
- `lint-preferencias` verde en este repo.
- `lint-harness` sin verbatim divergente entre plantillas.
- El texto de la Base v2 coincide con el de la decisión 0004.
