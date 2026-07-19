# Glosario del dominio

Instala un **glosario del dominio** del repo: una tabla de conceptos (nombre canónico, definición, alias registrados) donde los conceptos complejos linkean a una página de detalle propia. Se consulta al planificar y analizar para mantener **coherencia semántica** a lo largo de la vida del repo.

> **Subsistema de acumulación** — sigue el patrón índice + entradas + lint del harness ([cómo aprende](../../README.md#cómo-aprende)). Acá el índice es `glosario/INDICE.md`.

## Qué agrega al repo destino

```
<config>/
├── CLAUDE.md                          # sección "Glosario del proyecto"
├── glosario/
│   ├── INDICE.md                    # tabla: Concepto | Definición | Alias | Detalle
│   └── <slug>.md                      # página de detalle, solo para conceptos complejos
├── memoria/
│   └── feedback_glosario.md           # la convención, como memoria (+ índice)
└── scripts/
    └── lint-glosario/
        └── lint-glosario.js           # lint mecánico (sin LLM, sin red)
```

## Idea

El `INDICE.md` **es** el glosario: una tabla donde cada fila es un concepto. Lo simple se define en la fila; lo complejo linkea a su propia página.

| Concepto | Definición | Alias | Detalle |
|----------|------------|-------|---------|
| **FECE** | Función de Evaluación de Costo Económico. | función de costo | [ver](FECE.md) |
| **Cerveza** | Bebida fermentada de malta. | birra, chela, fresca | — |

- **Alias registrados, no prohibidos.** Los alias quedan *identificados* (todos válidos), para mapear "birra/chela = cerveza" — no para vetar cómo se nombra algo. El lint solo caza que un mismo alias no cuelgue de dos conceptos distintos.
- **Toda entrada nueva pasa por el usuario.** El agente puede *proponer* términos (marcados como propuestos), pero no se asientan como canónicos sin ratificación. Preferir las palabras del usuario a acuñar nuevas — gobernanza del glosario como registro canónico.
- **Detalle bajo demanda.** Concepto simple → fila con Detalle en `—`. Concepto complejo (fórmulas, ejemplos, contraejemplos, como una FECE) → página `<slug>.md` propia, linkeada.
- **Lint** — links de detalle resuelven, páginas sin huérfanos, alias sin colisión. Mecánico y gratis; al cerrar tareas que tocaron el glosario.

## Dependencias

`memoria-local` (la convención se persiste como una memoria tipada e indexada).

## Formatos

| Formato | Archivo |
|---------|---------|
| Skill (Claude Code) | [`skills/inicializar-glosario/SKILL.md`](skills/inicializar-glosario/SKILL.md) + [`PLANTILLA.md`](skills/inicializar-glosario/PLANTILLA.md) |
| Prompt agnóstico | [`prompt.md`](prompt.md) |
