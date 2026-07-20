# Glosario del dominio

Instala un **glosario del dominio** del repo: una tabla de conceptos (nombre canónico, definición, alias registrados) donde los conceptos complejos apuntan a una página de detalle propia. Se consulta al planificar y analizar para mantener **coherencia semántica** a lo largo de la vida del repo.

> **Subsistema de acumulación** — sigue el patrón índice + entradas + lint del harness ([cómo aprende](../../README.md#cómo-aprende)). Acá el índice es `glosario/INDICE.md`.

## Qué agrega al repo destino

```
<repo>/
├── AGENTS.md                          # sección "Glosario del proyecto" (CLAUDE.md = adaptador)
├── .claude/glosario/
│   ├── INDICE.md                    # tabla: Concepto | Definición | Alias | Detalle
│   ├── <slug>.md                      # página de detalle, solo para conceptos complejos
│   └── lint-glosario/
│       └── lint-glosario.js           # lint mecánico (sin LLM, sin red)
└── .claude/memoria/
    └── feedback_glosario.md           # la convención, como memoria (+ índice)
```

## Idea

El `INDICE.md` **es** el glosario: una tabla donde cada fila es un concepto. Lo simple se define en la fila; lo complejo apunta a su propia página.

| Concepto | Definición | Alias | Detalle |
|----------|------------|-------|---------|
| **FECE** | Función de Evaluación de Costo Económico. | función de costo | [ver](FECE.md) |
| **Cerveza** | Bebida fermentada de malta. | birra, chela, fresca | — |

- **Alias registrados, no prohibidos.** Los alias quedan *identificados* (todos válidos), para mapear "birra/chela = cerveza" — no para vetar cómo se nombra algo. El lint solo caza que un mismo alias no cuelgue de dos conceptos distintos.
- **Toda entrada nueva pasa por el usuario.** El agente puede *proponer* términos (marcados como propuestos), pero no se asientan como canónicos sin ratificación. Preferir las palabras del usuario a acuñar nuevas — gobernanza del glosario como registro canónico.
- **Detalle bajo demanda.** Concepto simple → fila con Detalle en `—`. Concepto complejo (fórmulas, ejemplos, contraejemplos, como una FECE) → página `<slug>.md` propia, enlazada.
- **Lint** — links de detalle resuelven, páginas sin huérfanos, alias sin colisión. Mecánico y gratis; al cerrar tareas que tocaron el glosario.

## Dependencias

`memoria-local` (la convención se persiste como una memoria tipada e indexada).

## Skill operativa

**`converger-terminologia`** — de uso, no de instalación: recorre el texto del repo contra el glosario, detecta sinónimos no registrados y anglicismos que compiten con los canónicos, y propone ratificar alias, vetar o reescribir — nada se asienta sin el usuario. Separa texto plano (se reescribe) de código (solo se informa: refactor). Viaja en este plugin junto a la de instalación.

## Formatos

| Formato | Archivo |
|---------|---------|
| Skill de instalación (Claude Code) | [`skills/inicializar-glosario/SKILL.md`](skills/inicializar-glosario/SKILL.md) + [`PLANTILLA.md`](skills/inicializar-glosario/PLANTILLA.md) |
| Skill operativa (Claude Code) | [`skills/converger-terminologia/SKILL.md`](skills/converger-terminologia/SKILL.md) |
