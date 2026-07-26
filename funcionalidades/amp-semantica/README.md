# Semántica del dominio

Instala el subsistema **semántica**: mantiene la **coherencia semántica** del dominio a lo largo de la vida del repo, con **dos registros pares** en `.claude/semantica/`. El agente propone; el usuario ratifica y veta. Se consulta al planificar y analizar.

> **Subsistema de acumulación** — sigue el patrón índice + entradas + lint del harness ([cómo aprende](../../README.md#cómo-aprende)). Acá hay dos registros bajo un mismo lint.

## Qué agrega al repo destino

```
<repo>/
├── AGENTS.md                            # línea @.claude/semantica/MANIFIESTO.md en "Subsistemas" (CLAUDE.md = adaptador)
├── .claude/semantica/
│   ├── MANIFIESTO.md                    # manifiesto de subsistema (siempre en contexto; no importa índice)
│   ├── GLOSARIO.md                      # terminología legítima: Concepto | Definición | Alias | Propuestos | Detalle
│   ├── TERMINOLOGIA-FARLOPA.md          # relaciones vetadas: Término | Significado vetado | Cómo decirlo
│   ├── <nombre>.md                      # página de detalle, solo para conceptos complejos
│   └── lint-semantica/
│       └── lint-semantica.js            # lint mecánico de los dos registros (sin LLM, sin red)
└── .claude/memoria/
    └── feedback_semantica.md            # la convención, como memoria (+ índice)
```

## Idea: dos registros pares

El subsistema separa lo **legítimo** de lo **vetado** en dos tablas.

**`GLOSARIO.md`** — la terminología que SÍ se usa. Una fila por concepto:

| Concepto | Definición | Alias | Propuestos | Detalle |
|----------|------------|-------|------------|---------|
| **FECE** | Función de Evaluación de Costo Económico. | función de costo | — | [ver](FECE.md) |
| **Cerveza** | Bebida fermentada de malta. | birra, chela, fresca | rubia | — |

**`TERMINOLOGIA-FARLOPA.md`** — las relaciones término→significado que NO se usan. Una fila por veto:

| Término | Significado vetado | Cómo decirlo |
|---------|--------------------|--------------|
| `escabio` | una cerveza | cerveza |
| `workflow` | cualquier uso | flujo de trabajo |

- **El veto es la relación término→significado, no el término.** El mismo término con otro significado puede ser legítimo: `plomería`=cañerías es válido en un repo de fontanería, `plomería`=infraestructura de software es farlopa. Por eso la columna del medio. El **lint marca por término**; el **agente juzga el significado** al leer la marca.
- **Términos por estado (glosario):** `Alias` (formas válidas, ratificadas, para mapear "birra/chela = cerveza") y `Propuestos` (los que el agente *sugiere* pero no usa hasta que el usuario los ratifica a Alias o los veta a Terminología Farlopa). El glosario **no tiene columna de vetados**: todo veto es una relación y vive en el registro par.
- **El agente propone; el usuario ratifica y veta.** El agente **nunca** ratifica un alias ni veta por su cuenta: solo *propone* en `Propuestos`. El agente **nunca usa** un término propuesto ni uno vetado en el significado que la farlopa prohíbe. Preferir las palabras del usuario a acuñar nuevas — registro canónico, control duro.
- **Lint** — sobre el glosario: links de detalle, huérfanos, colisiones de alias, propuestos pendientes; sobre la farlopa: contradicciones (un término alias/concepto y a la vez vetado) y apariciones de vetados en el texto vivo (texto plano accionable / código informativo). Mecánico y gratis; al cerrar tareas que tocaron la semántica.

## Dependencias

`memoria-local` (la convención se persiste como una memoria tipada e indexada).

## Skill operativa

**`converger-terminologia`** — de uso, no de instalación: recorre el texto del repo contra los dos registros, detecta sinónimos no registrados y anglicismos que compiten con los canónicos, y propone ratificar alias, vetar o reescribir — nada se asienta sin el usuario. Separa texto plano (se reescribe) de código (solo se informa: refactor). Viaja en este plugin junto a la de instalación.

## Formatos

| Formato | Archivo |
|---------|---------|
| Skill de instalación (Claude Code) | [`skills/inicializar-semantica/SKILL.md`](skills/inicializar-semantica/SKILL.md) + [`PLANTILLA.md`](skills/inicializar-semantica/PLANTILLA.md) |
| Skill operativa (Claude Code) | [`skills/converger-terminologia/SKILL.md`](skills/converger-terminologia/SKILL.md) |
