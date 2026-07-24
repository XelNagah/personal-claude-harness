# Registro de funcionalidades

Catálogo de las funcionalidades que este repo instala para armar un agente de **propósito general** — el usuario define el propósito del repo y los subsistemas se llenan con lo aprendido para lograrlo. Cada funcionalidad vive en `funcionalidades/<nombre>/`, **es un plugin de Claude Code** (listado en `.claude-plugin/marketplace.json`) y sus skills usan el **estándar abierto Agent Skills** (`SKILL.md`), legible también por Codex CLI, Cursor, Gemini CLI y Copilot (decisión 0010). Ver el README de cada una para el detalle.

**Empaquetado (decisión 0029):** un plugin transversal **`amp`** (prefijo `amp:`, skills `inicializar` · `planificar` · `info` · `actualizar`) + un plugin **`amp-<sub>`** por cada subsistema con skill de operación. Se instala `amp` y el **bundle completo** entra por `dependencies` (project scope, 1 install por repo). Los subsistemas **sin** skill de operación (`herramientas`, `conducta`, `commits`) **no tienen plugin**: su estructura la escribe `amp:inicializar`.

| Funcionalidad | Qué hace | Depende de | Carpeta |
|---------------|----------|-----------|---------|
| **amp** | Plugin transversal. Skills: `inicializar` (arma el `.claude` completo con los 9 subsistemas, instalador consolidado idempotente), `planificar` (interroga un plan contra la sabiduría del repo y lo critica; operacional, no escribe estructura), `info` (pantalla de estado a demanda), `actualizar` (nivelador: pone al día un `.claude` ya instalado contra la plantilla nueva; pisa lo Base respaldándolo, no toca lo aprendido). | las 6 `amp-<sub>` | [`amp/`](funcionalidades/amp/) |
| **amp-memoria** | Sistema de memoria local: `memoria/` + índice `MEMORIA.md` + memorias tipadas + bloque "Mapa del repo" (`@imports` en CLAUDE.md) + lint (`memoria/lint-memoria/`). Skill de operación `registrar-memoria`. Infraestructura base. | — | [`amp-memoria/`](funcionalidades/amp-memoria/) |
| **amp-preferencias** | Preferencias versionadas en `preferencias/PREFERENCIAS.md` (Base del harness + Adaptaciones del repo), importadas siempre vía `@`, + lint estructural. Skill de operación `registrar-preferencia`. | — | [`amp-preferencias/`](funcionalidades/amp-preferencias/) |
| **amp-planes** | Ciclo de planes `pendientes/ejecutados/descartados` + registro `PLANES.md` + `lint-planes` + hook SessionStart. Skill de operación `ciclo-de-plan`. | amp-memoria | [`amp-planes/`](funcionalidades/amp-planes/) |
| **amp-conocimiento** | Base de conocimiento en carpeta única `conocimiento/` + lint de integridad. Skills de operación `registrar-conocimiento` y `buscar-conocimiento`. | amp-memoria | [`amp-conocimiento/`](funcionalidades/amp-conocimiento/) |
| **amp-semantica** | Subsistema semántica en `semantica/`: dos registros pares — `GLOSARIO.md` (terminología legítima) y `TERMINOLOGIA-FARLOPA.md` (relaciones término→significado vetadas) — + lint + gobernanza (el agente propone; ratificar/vetar es del usuario). El veto es la relación, no el término. Skill de operación `converger-terminologia`. | amp-memoria | [`amp-semantica/`](funcionalidades/amp-semantica/) |
| **amp-decisiones** | Registro de decisiones estructurales en `decisiones/` (tabla + detalle, **no ADR**) + lint. Skill de operación `registrar-decision`. | amp-memoria | [`amp-decisiones/`](funcionalidades/amp-decisiones/) |

**Subsistemas sin plugin propio** (su estructura la escribe `amp:inicializar`, no tienen skill de operación): `herramientas` (registro de las *tools* del Propósito), `conducta` (reglas "cuando hagas X, asegurate de Y" + hook repartidor `establecer-conducta`), `commits` (preferencia de commits como memoria).

## Plugin y skill (Claude Code)

El prefijo de skill **es** el nombre del plugin (`amp-planes:ciclo-de-plan` ≠ `amp-conocimiento:registrar-conocimiento`): agrupa al tipear "amp" y deja visible de qué subsistema es cada skill (decisión 0029, modifica 0013).

| Funcionalidad | Plugin | Skill |
|---------------|--------|-------|
| amp | `amp@xelnagah-harness` | `inicializar`, `planificar`, `actualizar` |
| amp-memoria | `amp-memoria@xelnagah-harness` | `registrar-memoria` |
| amp-preferencias | `amp-preferencias@xelnagah-harness` | `registrar-preferencia` |
| amp-planes | `amp-planes@xelnagah-harness` | `ciclo-de-plan` |
| amp-conocimiento | `amp-conocimiento@xelnagah-harness` | `registrar-conocimiento`, `buscar-conocimiento` |
| amp-semantica | `amp-semantica@xelnagah-harness` | `converger-terminologia` |
| amp-decisiones | `amp-decisiones@xelnagah-harness` | `registrar-decision` |

> **Instalar en otra PC:** `/plugin marketplace add <owner>/<repo>` y después `/plugin install amp@xelnagah-harness` — trae los 6 `amp-<sub>` por dependencias (ver [README](README.md#instalación-en-otra-pc-marketplace-de-plugins)).
> **En esta máquina** los skills están enlazados por junction (autoría/edición en vivo). No mezclar junction + plugin del mismo skill en una misma máquina.
> **Agentes no-Claude** (Codex/Cursor/Gemini): las skills se leen desde `~/.agents/skills/` — clonar el repo y correr `node .claude/herramientas/instalar-junctions/instalar-junctions.js`; no necesitan marketplace.
> **Nota:** dentro de `amp`, `planificar` y `actualizar` son **operacionales** (no instalan estructura propia): `planificar` analiza sin escribir; `actualizar` es el nivelador, contraparte de `inicializar`. `inicializar` es el instalador consolidado — absorbe los ex `inicializar-<sub>` individuales, es la fuente única de todo el setup.

## Cómo agregar una funcionalidad nueva

1. Crear `funcionalidades/<nombre>/` con:
   - `.claude-plugin/plugin.json` — manifiesto (`name`, `description`, `version`, `author`; `dependencies` si aplica).
   - `README.md` — qué hace, qué agrega al repo destino, dependencias.
   - `skills/<nombre-skill>/SKILL.md` (+ `PLANTILLA.md` si lleva textos literales) — **fuente única** del flujo, en el estándar Agent Skills.
2. Agregar el plugin a `.claude-plugin/marketplace.json` (`name` + `source: "./funcionalidades/<nombre>"`).
3. Crear sus junctions locales (dos tandas) con `node .claude/herramientas/instalar-junctions/instalar-junctions.js` si se quiere editar en vivo. Validar con `claude plugin validate .`.
4. Registrarla en la tabla de arriba.

> **Invariante:** `SKILL.md` es la fuente única de cada flujo. Un subsistema que gana una skill de operación se documenta en su `amp-<sub>`; su instalación la escribe `amp:inicializar` (que duplica los textos literales en su `SKILL.md`/`PLANTILLA.md`, porque tanto el junction como el cache de plugins aíslan la carpeta del skill) — usar la skill `propagar-harness`.
