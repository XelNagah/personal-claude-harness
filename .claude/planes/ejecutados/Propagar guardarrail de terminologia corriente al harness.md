# Propagar el guardarraíl de terminología corriente al harness

**Estado: Ejecutado · Creado 26-07-18 · Cerrado 26-07-19.** Origen: [Rework README raíz](Rework%20README%20raiz%20+%20patron%20carpeta-indice-lint%20+%20audit%20sub-README.md). Ratificado por el usuario en esa sesión.

## Objetivo

La decisión **0004** se amplió (español corriente en todo — nada de palabras inventadas o raras, ni en prosa ni en diagramas; no solo en registros). Falta llevar esa regla reforzada a la **Base** de preferencias para que valga en **todo repo**, no solo en este.

## Alcance

- **Base de preferencias** (`preferencias/PREFERENCIAS.md`, sección Base): bump `harness v1 → v2` con el texto reforzado de terminología.
- **Funcionalidad `preferencias-trabajo`**: propagar verbatim a `prompt.md` (agnóstico) + `skills/inicializar-preferencias-trabajo/SKILL.md` + `PLANTILLA.md`.
- **Orquestador `setup-completo`**: su `PLANTILLA.md` y `prompt.md` duplican el bloque de preferencias verbatim → actualizar ahí también.
- Verificar **byte-exactness** de los embebidos (ver memoria [propagación al harness](../../memoria/feedback_propagacion_harness.md)): delegar a subagente fresco, no fork.

## Verificación
- `lint-preferencias` verde en este repo.
- `lint-harness` sin verbatim divergente entre plantillas.
- El texto de la Base v2 coincide con el de la decisión 0004.

## Notas de implementación

Bump `harness v1 → v2` y bullet de terminología reforzado (texto literal de la decisión 0004: "Español corriente en todo — nada de palabras inventadas o raras, ni en prosa ni en diagramas — no solo en los registros; en prosa/diagramas se usa marcado como propuesto").

Propagado verbatim (mismo `new_string` idéntico) a los 5 lugares del bloque Base + el header de versión donde aplica:
- `preferencias/PREFERENCIAS.md` (fuente aplicada) — header v2 + bullet.
- `preferencias-trabajo`: `prompt.md` (header v2 + bullet) y `skills/…/PLANTILLA.md` (header v2 + bullet). El `SKILL.md` no embebe el bullet (referencia a §Preferencias), no requirió cambio.
- `setup-completo` (orquestador): `PLANTILLA.md` (header v2 + bullet) y `prompt.md` (bullet indentado; sin header de versión porque todavía usa preferencias inline v0 — eso lo cubre el plan "Migrar prompt del orquestador al modelo PREFERENCIAS versionado").
- `preferencias-trabajo/README.md`: descripción de la regla actualizada (paráfrasis, no verbatim).

**Método:** editado directo con `old_string`/`new_string` idénticos (byte-exacto por construcción, sin riesgo de parafraseo) en vez de delegar a subagente; verificado con `lint-harness` (0 bloques verbatim divergentes) + `lint-preferencias` (0) + grep (cero `harness v1` reales ni bullets viejos).

**No hecho (a propósito):** bump de `version` en los `plugin.json` de `preferencias-trabajo` y `setup-completo` (contenido cambió). Queda para el momento de publicar, igual que en la propagación previa de gobernanza. Hoy todos en `0.1.0`.
