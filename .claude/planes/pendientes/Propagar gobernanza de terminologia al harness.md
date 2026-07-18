# Propagar la gobernanza de terminología al harness

**Estado: en diseño · Creado 26-07-18.** Foco. Aplica la [decisión 0004](../../decisiones/INDICE.md) a las funcionalidades (hoy solo aplicada a este repo). Surgió en la sesión de `/planificar` del rework del README, tras un término inventado ("sustrato") que se coló al glosario/decisión.

## Objetivo

Llevar la regla de **gobernanza de terminología** (gate duro: el agente no asienta términos acuñados en registros canónicos sin ratificación del usuario) a las funcionalidades, para que **viaje a todos los repos** que se inicialicen — no solo a este.

## Ya aplicado a este repo (26-07-18)

- `.claude/preferencias/PREFERENCIAS.md` — bullet en Base (Principios de trabajo).
- `.claude/glosario/INDICE.md` — línea de gobernanza en el header.
- `.claude/decisiones/INDICE.md` — decisión 0004.

⚠️ Esto crea una **divergencia temporal**: este repo tiene la regla, las funcionalidades todavía no. Este plan la cierra.

## Alcance (funcionalidades a tocar)

- **`preferencias-trabajo`** — sumar el bullet de terminología a la **Base** del `PREFERENCIAS.md` que instala. Dos formatos: `prompt.md` + `skills/inicializar-preferencias-trabajo/` (y `PLANTILLA.md` si el texto va verbatim) + el verbatim en el orquestador `setup-completo`.
- **`glosario`** — sumar la línea de gobernanza al **header del `INDICE.md`** que instala. Dos formatos: `prompt.md` + `skills/inicializar-glosario/` (+ `PLANTILLA.md`) + orquestador.

## Coordinación
⚠️ El plan [Completar cobertura de lint mecánico](Completar%20cobertura%20de%20lint%20mecanico%20-%20memoria%20y%20preferencias.md) **también toca `preferencias-trabajo`** (para agregar `lint-preferencias`). Ejecutar ambos juntos para no editar esa funcionalidad dos veces.

## Nota de versión
Cambia la Base de preferencias ⇒ evaluar bump de "harness v1" y de `version` en los `plugin.json` afectados (`preferencias-trabajo`, `glosario`).

## Verificación
- `claude plugin validate .` verde.
- `inicializar-preferencias-trabajo` en scratch instala la Base con el bullet de terminología.
- `inicializar-glosario` en scratch instala el `INDICE.md` con la línea de gobernanza.
- `node .claude/scripts/lint-harness/lint-harness.js` verde (verbatim coherente entre funcionalidad y orquestador).
