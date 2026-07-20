# Registro de decisiones

Instala un **registro de decisiones** del repo, con la misma estructura que el glosario: una tabla donde lo simple vive en la fila y lo complejo linkea a una página de detalle propia. Se consulta al planificar y analizar para mantener **coherencia decisional** — no re-decidir ni contradecir lo ya resuelto.

> **Subsistema de acumulación** — sigue el patrón índice + entradas + lint del harness ([cómo aprende](../../README.md#cómo-aprende)). Acá el índice es `decisiones/INDICE.md`.

> **No son "ADR".** La sigla ADR (*Architecture Decision Record*) viene del software y asume "arquitectura". Estos repos son de propósito general, así que se cae la "A" — pero se conserva su función de **acotar**: solo lo estructural, no cada elección operativa.

## Qué se registra

Solo decisiones **estructurales al propósito del repo**: las que definen cómo es / qué hace el repo en lo esencial, o que eligen un camino que **condiciona el trabajo futuro**. **No** las operativas triviales o efímeras ("decidí buscar info en internet para averiguar X", "usé tal flag"). Ante la duda: ¿esto condiciona el repo a futuro? Sí → va.

## Qué agrega al repo destino

```
<config>/
├── CLAUDE.md                              # sección "Decisiones del proyecto"
├── decisiones/
│   ├── INDICE.md                      # tabla: N° | Decisión | Fecha | Estado | Detalle
│   ├── NNNN-slug.md                       # página de detalle, solo decisiones complejas
│   └── lint-decisiones/
│       └── lint-decisiones.js             # lint mecánico (sin LLM, sin red)
└── memoria/
    └── feedback_decisiones.md             # la convención, como memoria (+ índice)
```

## Idea

El `INDICE.md` **es** el registro: una tabla donde cada fila es una decisión. Lo simple se asienta en la fila; lo complejo (contexto, alternativas, consecuencias) linkea a su propia página.

| N° | Decisión | Fecha | Estado | Detalle |
|----|----------|-------|--------|---------|
| 0001 | Node para los lints: cero deps, corre en cualquier lado | 2026-07-18 | vigente | — |
| 0002 | Modelar el costo con una FECE en vez de tabla fija | 2026-07-18 | vigente | [ver](0002-fece.md) |

- **Detalle bajo demanda** (como el glosario): decisión simple → fila con Detalle en `—`; decisión compleja → página `NNNN-slug.md` propia, linkeada.
- **Reemplazar, no borrar:** revertir = agregar una nueva y marcar la vieja `reemplazada por NNNN`.
- **Lint** — numeración sin huecos, links de detalle resuelven, páginas sin huérfanos, refs superseded resuelven. Al cerrar tareas que registraron decisiones.

## Dependencias

`memoria-local` (la convención se persiste como una memoria tipada e indexada).

## Skill operativa

**`registrar-decision`** — de uso, no de instalación: juzga si la decisión es estructural (las triviales no van), chequea que no re-decida ni contradiga lo asentado (contradicción → reemplaza, nunca borra), numera y redacta la fila, confirma con el usuario y corre el lint. Con detección pasiva: ofrece registrar decisiones que se cristalizan en la conversación. Viaja en este plugin junto a la de instalación.

## Formatos

| Formato | Archivo |
|---------|---------|
| Skill de instalación (Claude Code) | [`skills/inicializar-decisiones/SKILL.md`](skills/inicializar-decisiones/SKILL.md) + [`PLANTILLA.md`](skills/inicializar-decisiones/PLANTILLA.md) |
| Skill operativa (Claude Code) | [`skills/registrar-decision/SKILL.md`](skills/registrar-decision/SKILL.md) |
