# Registro de funcionalidades

Catálogo de las funcionalidades que este repo instala para armar un agente de **propósito general** — el usuario define el propósito del repo y los subsistemas se llenan con lo aprendido para lograrlo. Cada funcionalidad vive en `funcionalidades/<nombre>/`, **es un plugin de Claude Code** (listado en `.claude-plugin/marketplace.json`) y sus skills usan el **estándar abierto Agent Skills** (`SKILL.md`), legible también por Codex CLI, Cursor, Gemini CLI y Copilot (decisión 0010). Cada una se instala/comparte por separado. Ver el README de cada una para el detalle.

| Funcionalidad | Qué hace | Depende de | Carpeta |
|---------------|----------|-----------|---------|
| **memoria-local** | Sistema de memoria local: `memoria/` + índice `MEMORIA.md` + formato de memorias tipadas + bloque "Mapa del repo" (`@imports` de índices en CLAUDE.md) + lint (`memoria/lint-memoria/`: refs/wikilinks rotos, índice incompleto, huérfanos, frontmatter). Skill operativa `registrar-memoria` (captura tipada sin duplicar). Infraestructura base. | — | [`memoria-local/`](funcionalidades/memoria-local/) |
| **preferencias-trabajo** | Preferencias versionadas en `preferencias/PREFERENCIAS.md` (Base del harness + Adaptaciones del repo), importadas siempre al contexto vía `@`, con regla de **terminología** (control duro en registros canónicos) + lint estructural (`preferencias/lint-preferencias/`: secciones Base/Adaptaciones + el `@import`). Skill operativa `registrar-preferencia` (feedback recurrente → regla). | — | [`preferencias-trabajo/`](funcionalidades/preferencias-trabajo/) |
| **gestion-de-planes** | Ciclo de planes `pendientes/ejecutados/descartados` + registro `PLANES.md` (estado, fechas) + `lint-planes` + hook SessionStart. Skill operativa `ciclo-de-plan` (abrir/transicionar sin desincronizar registro y disco). | memoria-local | [`gestion-de-planes/`](funcionalidades/gestion-de-planes/) |
| **estilo-commits** | Preferencia de commits (español, sin co-autoría de IA), como memoria. | memoria-local | [`estilo-commits/`](funcionalidades/estilo-commits/) |
| **conocimiento** | Base de conocimiento en carpeta única `conocimiento/` + lint de integridad (`conocimiento/lint-conocimiento/`). Migra conocimiento suelto de la raíz. Skills operativas `registrar-conocimiento` (asienta **un** hallazgo en el momento, con la prueba que lo separa de memoria/decisiones) y `buscar-conocimiento` (barrido del repo → páginas propuestas). | memoria-local | [`conocimiento/`](funcionalidades/conocimiento/) |
| **semantica** | Subsistema semántica en `semantica/`: dos registros pares — `GLOSARIO.md` (terminología legítima: conceptos + alias + detalle) y `TERMINOLOGIA-FARLOPA.md` (relaciones término→significado vetadas) — + lint + gobernanza (**toda entrada nueva pasa por el usuario**: el agente propone, no ratifica ni veta). El veto es la relación, no el término. Skill operativa `converger-terminologia` (barrido semántico del repo contra los dos registros). Coherencia semántica al planificar/analizar. | memoria-local | [`semantica/`](funcionalidades/semantica/) |
| **decisiones** | Registro de decisiones estructurales en `decisiones/` (tabla + detalle, **no ADR**) + lint. Skill operativa `registrar-decision` (juzga estructural, no re-decide, confirma y asienta). Coherencia decisional. | memoria-local | [`decisiones/`](funcionalidades/decisiones/) |
| **herramientas** | Gestión de Herramientas: las *tools* que el Propósito requiere (tipos `script`/`skill` local/`MCP` local) en `herramientas/` con registro-tabla (columna Tipo) + lint. Los lints de subsistema **no** van acá (viven con su subsistema). Ordena las herramientas desordenadas. | memoria-local | [`herramientas/`](funcionalidades/herramientas/) |
| **conducta** | Reglas "cuando hagas X, asegurate de Y" en `conducta/`: atan **momentos** (evento de hook + condición sin juicio) a **acciones** (`inyectar`/`correr`/`bloquear`). Un hook repartidor (`establecer-conducta`) lee el registro **vivo** y entrega la regla del momento — no se carga al arranque (una regla cargada al inicio se recita, no se obedece). Registro partido en Reglas Base (harness) / Reglas del Propósito (repo) + `lint-conducta`. Cablea el hook en `settings.json`. | memoria-local | [`conducta/`](funcionalidades/conducta/) |
| **setup-completo** | Orquestador: instala las ocho de convención de una pasada. Conserva el skill `inicializar-custom`. | (las ocho) | [`setup-completo/`](funcionalidades/setup-completo/) |
| **planificar** | Skill de análisis: interroga un plan contra la sabiduría del repo (semántica + decisiones + conocimiento) hasta acuerdo y lo critica (problemas, faltantes, sobreingeniería). **Operacional**: no instala nada ni entra al orquestador. Reemplaza `grill-with-docs`. | (usa semántica/decisiones/conocimiento) | [`planificar/`](funcionalidades/planificar/) |
| **amp-actualizar** | Nivelador del harness: pone al día el `.claude/` de un repo con el AMP ya instalado contra la plantilla nueva. Converge por estructura (sin versión): pisa lo Base respaldándolo en `.claude/.respaldo-amp/<fecha>/`, no toca lo aprendido, pregunta ante lo divergente. Renombra `glosario`→`semantica` e instala subsistemas faltantes (`conducta`) delegando en los `inicializar-<sub>`. Skill de juicio + script mecánico (respaldo/detección/vista previa). **Operacional**: no instala estructura propia ni entra al orquestador. | (delega en `inicializar-<sub>`) | [`amp-actualizar/`](funcionalidades/amp-actualizar/) |

## Plugin y skill (Claude Code)

| Funcionalidad | Plugin | Skill |
|---------------|--------|-------|
| memoria-local | `memoria-local@xelnagah-harness` | `inicializar-memoria-local`, `registrar-memoria` |
| preferencias-trabajo | `preferencias-trabajo@xelnagah-harness` | `inicializar-preferencias-trabajo`, `registrar-preferencia` |
| gestion-de-planes | `gestion-de-planes@xelnagah-harness` | `inicializar-gestion-planes`, `ciclo-de-plan` |
| estilo-commits | `estilo-commits@xelnagah-harness` | `inicializar-estilo-commits` |
| conocimiento | `conocimiento@xelnagah-harness` | `inicializar-conocimiento`, `registrar-conocimiento`, `buscar-conocimiento` |
| semantica | `semantica@xelnagah-harness` | `inicializar-semantica`, `converger-terminologia` |
| decisiones | `decisiones@xelnagah-harness` | `inicializar-decisiones`, `registrar-decision` |
| herramientas | `herramientas@xelnagah-harness` | `inicializar-herramientas` |
| conducta | `conducta@xelnagah-harness` | `inicializar-conducta` |
| setup-completo | `setup-completo@xelnagah-harness` | `inicializar-custom` |
| planificar | `planificar@xelnagah-harness` | `planificar` |
| amp-actualizar | `amp-actualizar@xelnagah-harness` | `amp-actualizar` |

> **Instalar en otra PC:** `/plugin marketplace add <owner>/<repo>` y después `/plugin install <plugin>@xelnagah-harness` (ver [README](README.md#instalación-en-otra-pc-marketplace-de-plugins)).
> **En esta máquina** los skills están enlazados por junction (autoría/edición en vivo). No mezclar junction + plugin del mismo skill en una misma máquina.
> Las **skills operativas** (`registrar-memoria`, `ciclo-de-plan`, `converger-terminologia`, `registrar-conocimiento`, `buscar-conocimiento`, `registrar-decision`, `registrar-preferencia`) viajan en el plugin de su funcionalidad junto a la de instalación — un plugin puede llevar varias skills.
> **Agentes no-Claude** (Codex/Cursor/Gemini): las skills se leen desde `~/.agents/skills/` — clonar el repo y correr `node .claude/herramientas/instalar-junctions/instalar-junctions.js`; no necesitan marketplace.
> **Nota:** `planificar` y `amp-actualizar` son **operacionales** (no instalan estructura propia en el repo destino; se invocan y operan) — por eso no entran al orquestador. `planificar` analiza sin escribir; `amp-actualizar` es el nivelador (pone al día un repo ya instalado, contraparte de `inicializar-custom`). Las otras diez instalan convención. De esas diez, `conducta` todavía no entra al orquestador `setup-completo` —se suma en un paso propio de propagación—: `inicializar-custom` instala las ocho base, `conducta` se instala suelta o vía el nivelador.

## Cómo agregar una funcionalidad nueva

1. Crear `funcionalidades/<nombre>/` con:
   - `.claude-plugin/plugin.json` — manifiesto (`name`, `description`, `version`, `author`).
   - `README.md` — qué hace, qué agrega al repo destino, dependencias.
   - `skills/<nombre-skill>/SKILL.md` (+ `PLANTILLA.md` si lleva textos literales) — **fuente única** del flujo, en el estándar Agent Skills.
2. Agregar el plugin a `.claude-plugin/marketplace.json` (`name` + `source: "./funcionalidades/<nombre>"`).
3. Crear sus junctions locales (dos tandas) con `node .claude/herramientas/instalar-junctions/instalar-junctions.js` si se quiere editar en vivo. Validar con `claude plugin validate .`.
4. Registrarla en la tabla de arriba (y en el orquestador `setup-completo` si forma parte del setup base).

> **Invariante:** `SKILL.md` es la fuente única de cada flujo. Un cambio se replica solo en el orquestador `setup-completo` (que duplica los textos literales en su `SKILL.md`/`PLANTILLA.md`, porque tanto el junction como el cache de plugins aíslan la carpeta del skill) — usar la skill `propagar-harness`.
