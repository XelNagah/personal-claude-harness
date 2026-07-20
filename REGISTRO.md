# Registro de funcionalidades

Catálogo de las funcionalidades que este repo instala para armar un agente de **propósito general** — el usuario define el propósito del repo y los subsistemas se llenan con lo aprendido para lograrlo. Cada funcionalidad vive en `funcionalidades/<nombre>/`, **es un plugin de Claude Code** (listado en `.claude-plugin/marketplace.json`) y además trae un **prompt agnóstico** (`prompt.md`). Cada una se instala/comparte por separado. Ver el README de cada una para el detalle.

| Funcionalidad | Qué hace | Depende de | Carpeta |
|---------------|----------|-----------|---------|
| **memoria-local** | Sistema de memoria local: `memoria/` + índice `MEMORIA.md` + formato de memorias tipadas + bloque "Mapa del repo" (`@imports` de índices en CLAUDE.md) + lint (`memoria/lint-memoria/`: refs/wikilinks rotos, índice incompleto, huérfanos, frontmatter). Skill operativa `registrar-memoria` (captura tipada sin duplicar). Infraestructura base. | — | [`memoria-local/`](funcionalidades/memoria-local/) |
| **preferencias-trabajo** | Preferencias versionadas en `preferencias/PREFERENCIAS.md` (Base del harness + Adaptaciones del repo), importadas siempre al contexto vía `@`, con regla de **terminología** (gate duro en registros canónicos) + lint estructural (`preferencias/lint-preferencias/`: secciones Base/Adaptaciones + el `@import`). | — | [`preferencias-trabajo/`](funcionalidades/preferencias-trabajo/) |
| **gestion-de-planes** | Ciclo de planes `pendientes/ejecutados/descartados` + registro `PLANES.md` (estado, fechas) + `lint-planes` + hook SessionStart. Skill operativa `ciclo-de-plan` (abrir/transicionar sin desincronizar registro y disco). | memoria-local | [`gestion-de-planes/`](funcionalidades/gestion-de-planes/) |
| **estilo-commits** | Preferencia de commits (español, sin co-autoría de IA), como memoria. | memoria-local | [`estilo-commits/`](funcionalidades/estilo-commits/) |
| **conocimiento** | Base de conocimiento en carpeta única `conocimiento/` + lint de integridad (`conocimiento/lint-conocimiento/`). Migra conocimiento suelto de la raíz. | memoria-local | [`conocimiento/`](funcionalidades/conocimiento/) |
| **glosario** | Glosario del dominio en `glosario/` (tabla de conceptos + alias registrados + detalle para lo complejo) + lint + gobernanza (**toda entrada nueva pasa por el usuario**: el agente propone, no ratifica). Skill operativa `converger-terminologia` (barrido semántico del repo contra el glosario). Coherencia semántica al planificar/analizar. | memoria-local | [`glosario/`](funcionalidades/glosario/) |
| **decisiones** | Registro de decisiones estructurales en `decisiones/` (tabla + detalle, **no ADR**) + lint. Coherencia decisional. | memoria-local | [`decisiones/`](funcionalidades/decisiones/) |
| **herramientas** | Gestión de Herramientas: las *tools* que el Propósito requiere (tipos `script`/`skill` local/`MCP` local) en `herramientas/` con registro-tabla (columna Tipo) + lint. Los lints de subsistema **no** van acá (viven con su subsistema). Ordena el cementerio de tools. | memoria-local | [`herramientas/`](funcionalidades/herramientas/) |
| **setup-completo** | Orquestador: instala las ocho de convención de una pasada. Conserva el skill `inicializar-custom`. | (las ocho) | [`setup-completo/`](funcionalidades/setup-completo/) |
| **planificar** | Skill de análisis: interroga un plan contra la sabiduría del repo (glosario + decisiones + conocimiento) hasta acuerdo y lo critica (problemas, faltantes, sobreingeniería). **Operacional**: no instala nada ni entra al orquestador. Reemplaza `grill-with-docs`. | (usa glosario/decisiones/conocimiento) | [`planificar/`](funcionalidades/planificar/) |

## Plugin y skill (Claude Code)

| Funcionalidad | Plugin | Skill |
|---------------|--------|-------|
| memoria-local | `memoria-local@xelnagah-harness` | `inicializar-memoria-local`, `registrar-memoria` |
| preferencias-trabajo | `preferencias-trabajo@xelnagah-harness` | `inicializar-preferencias-trabajo` |
| gestion-de-planes | `gestion-de-planes@xelnagah-harness` | `inicializar-gestion-planes`, `ciclo-de-plan` |
| estilo-commits | `estilo-commits@xelnagah-harness` | `inicializar-estilo-commits` |
| conocimiento | `conocimiento@xelnagah-harness` | `inicializar-conocimiento` |
| glosario | `glosario@xelnagah-harness` | `inicializar-glosario`, `converger-terminologia` |
| decisiones | `decisiones@xelnagah-harness` | `inicializar-decisiones` |
| herramientas | `herramientas@xelnagah-harness` | `inicializar-herramientas` |
| setup-completo | `setup-completo@xelnagah-harness` | `inicializar-custom` |
| planificar | `planificar@xelnagah-harness` | `planificar` |

> **Instalar en otra PC:** `/plugin marketplace add <owner>/<repo>` y después `/plugin install <plugin>@xelnagah-harness` (ver [README](README.md#instalación-en-otra-pc-marketplace-de-plugins)).
> **En esta máquina** los skills están enlazados por junction (autoría/edición en vivo). No mezclar junction + plugin del mismo skill en una misma máquina.
> Las **skills operativas** (`registrar-memoria`, `ciclo-de-plan`, `converger-terminologia`) viajan en el plugin de su funcionalidad junto a la de instalación — un plugin puede llevar varias skills. Su versión agnóstica es `prompt-<skill>.md` en la carpeta de la funcionalidad.
> Las piezas siempre se pueden usar vía su `prompt.md` sin instalar nada.
> **Nota:** `planificar` es la única funcionalidad **operacional** (no instala nada en el repo destino; se invoca y opera). Las otras nueve instalan convención. Por eso `planificar` no entra al orquestador.

## Cómo agregar una funcionalidad nueva

1. Crear `funcionalidades/<nombre>/` con:
   - `.claude-plugin/plugin.json` — manifiesto (`name`, `description`, `version`, `author`).
   - `README.md` — qué hace, qué agrega al repo destino, dependencias.
   - `skills/<nombre-skill>/SKILL.md` (+ `PLANTILLA.md` si lleva textos verbatim) — versión Claude Code.
   - `prompt.md` — versión agnóstica (placeholder `<config>` para el directorio del harness).
2. Agregar el plugin a `.claude-plugin/marketplace.json` (`name` + `source: "./funcionalidades/<nombre>"`).
3. Crear su junction local si se quiere editar en vivo. Validar con `claude plugin validate .`.
4. Registrarla en la tabla de arriba (y en el orquestador `setup-completo` si forma parte del setup base).

> **Invariante:** skill y prompt de una misma funcionalidad son divergentes en forma, no en contenido. Un cambio de preferencia se replica en ambos formatos **y** en el orquestador (que duplica los textos verbatim, porque tanto el junction como el cache de plugins aíslan la carpeta del skill).
