# Glosario del dominio

Instala un **glosario del dominio** del repo: una tabla de conceptos (nombre canónico, definición, y sus **términos por estado**: alias, propuestos, vetados) donde los conceptos complejos apuntan a una página de detalle propia. Se consulta al planificar y analizar para mantener **coherencia semántica** a lo largo de la vida del repo.

> **Subsistema de acumulación** — sigue el patrón índice + entradas + lint del harness ([cómo aprende](../../README.md#cómo-aprende)). Acá el índice es `glosario/INDICE.md`.

## Qué agrega al repo destino

```
<repo>/
├── AGENTS.md                          # sección "Glosario del proyecto" (CLAUDE.md = adaptador)
├── .claude/glosario/
│   ├── INDICE.md                    # tabla: Concepto | Definición | Alias | Propuestos | Vetados | Detalle
│   ├── <nombre>.md                    # página de detalle, solo para conceptos complejos
│   └── lint-glosario/
│       └── lint-glosario.js           # lint mecánico (sin LLM, sin red)
└── .claude/memoria/
    └── feedback_glosario.md           # la convención, como memoria (+ índice)
```

## Idea

El `INDICE.md` **es** el glosario: una tabla donde cada fila es un concepto. Lo simple se define en la fila; lo complejo apunta a su propia página.

| Concepto | Definición | Alias | Propuestos | Vetados | Detalle |
|----------|------------|-------|------------|---------|---------|
| **FECE** | Función de Evaluación de Costo Económico. | función de costo | — | — | [ver](FECE.md) |
| **Cerveza** | Bebida fermentada de malta. | birra, chela, fresca | rubia | escabio | — |

- **Términos por estado (un solo eje).** Cada concepto reparte sus términos en tres columnas: `Alias` (formas válidas, ratificadas, para mapear "birra/chela = cerveza"), `Propuestos` (los que el agente *sugiere* pero no usa hasta que el usuario los mueve a Alias o Vetados) y `Vetados` (prohibidos; el reemplazo es el canónico de la propia fila, y se barren del texto vivo). El lint caza colisiones de alias, contradicciones (alias en una fila y vetado en otra) y apariciones de vetados en el repo.
- **El agente propone; el usuario ratifica y veta.** El agente **nunca** escribe en `Alias` ni en `Vetados`: solo *propone* en `Propuestos`. Ratificar y vetar son potestad del usuario. El agente **nunca usa** un término que esté en `Propuestos` o en `Vetados`. Preferir las palabras del usuario a acuñar nuevas — gobernanza del glosario como registro canónico (decisión 0004).
- **Detalle bajo demanda.** Concepto simple → fila con Detalle en `—`. Concepto complejo (fórmulas, ejemplos, contraejemplos, o el mapa de reemplazos de un vetado, como una FECE) → página `<nombre>.md` propia, enlazada.
- **Lint** — links de detalle resuelven, páginas sin huérfanos, colisiones de términos, propuestos pendientes y apariciones de vetados en el repo. Mecánico y gratis; al cerrar tareas que tocaron el glosario.

## Dependencias

`memoria-local` (la convención se persiste como una memoria tipada e indexada).

## Skill operativa

**`converger-terminologia`** — de uso, no de instalación: recorre el texto del repo contra el glosario, detecta sinónimos no registrados y anglicismos que compiten con los canónicos, y propone ratificar alias, vetar o reescribir — nada se asienta sin el usuario. Separa texto plano (se reescribe) de código (solo se informa: refactor). Viaja en este plugin junto a la de instalación.

## Formatos

| Formato | Archivo |
|---------|---------|
| Skill de instalación (Claude Code) | [`skills/inicializar-glosario/SKILL.md`](skills/inicializar-glosario/SKILL.md) + [`PLANTILLA.md`](skills/inicializar-glosario/PLANTILLA.md) |
| Skill operativa (Claude Code) | [`skills/converger-terminologia/SKILL.md`](skills/converger-terminologia/SKILL.md) |
