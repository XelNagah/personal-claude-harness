# Registro de funcionalidades

Catálogo de las funcionalidades que este repo instala para armar un agente de **propósito general** — el usuario define el propósito del repo y los subsistemas se llenan con lo aprendido para lograrlo. Cada funcionalidad vive en `funcionalidades/<nombre>/`, **es un plugin de Claude Code** (listado en `.claude-plugin/marketplace.json`) y sus skills usan el **estándar abierto Agent Skills** (`SKILL.md`), legible también por Codex CLI, Cursor, Gemini CLI y Copilot (decisión 0010). Ver el README de cada una para el detalle.

**Empaquetado:** un plugin transversal **`amp`** (skills `inicializar` · `planificar` · `info` · `actualizar`) + un plugin **`amp-<sub>`** por cada uno de los ocho subsistemas. Se instala `amp` y el paquete completo entra por dependencias.

| Funcionalidad | Qué hace | Depende de | Carpeta |
|---------------|----------|-----------|---------|
| **amp** | Plugin transversal. Skills: `inicializar`, `planificar`, `info` y `actualizar`. El actualizador también conduce las migraciones de formas retiradas y no informa “al día” mientras quede `memoria/`. | los 8 `amp-<sub>` | [`amp/`](funcionalidades/amp/) |
| **amp-subsistemas** | Catálogo Base/Propósito y coordinación de la reubicación del Aprendizaje. Skills: `agregar-subsistema` y `reubicar-aprendizaje`. | — | [`amp-subsistemas/`](funcionalidades/amp-subsistemas/) |
| **amp-preferencias** | Preferencias versionadas en `preferencias/PREFERENCIAS.md` (Base del harness + Adaptaciones del repo), importadas siempre vía `@`, + lint estructural. Skill de operación `registrar-preferencia`. | — | [`amp-preferencias/`](funcionalidades/amp-preferencias/) |
| **amp-planes** | Ciclo de planes `pendientes/ejecutados/descartados` + registro, README, lint y hook. Skill `ciclo-de-plan`. | — | [`amp-planes/`](funcionalidades/amp-planes/) |
| **amp-conocimiento** | Base única de lo que el agente sabe + README y lint. Skills `registrar-conocimiento` y `buscar-conocimiento`. | — | [`amp-conocimiento/`](funcionalidades/amp-conocimiento/) |
| **amp-semantica** | Glosario + Terminología Farlopa + README y lint. Skill `converger-terminologia`. | — | [`amp-semantica/`](funcionalidades/amp-semantica/) |
| **amp-decisiones** | Decisiones estructurales + README y lint. Skill `registrar-decision`. | — | [`amp-decisiones/`](funcionalidades/amp-decisiones/) |
| **amp-herramientas** | Registro de Herramientas Base/Propósito, fichas y lint. Skill `registrar-herramienta`. | — | [`amp-herramientas/`](funcionalidades/amp-herramientas/) |
| **amp-conducta** | Momentos, reglas Base/Propósito, repartidor y lint. Skill `registrar-regla`. | — | [`amp-conducta/`](funcionalidades/amp-conducta/) |

Todos los subsistemas Base tienen plugin y skill de operación. `commits` no es un subsistema: su texto vive en Preferencias y Conducta lo entrega antes de confirmar.

## Plugin y skill (Claude Code)

El prefijo de skill **es** el nombre del plugin (`amp-planes:ciclo-de-plan` ≠ `amp-conocimiento:registrar-conocimiento`): agrupa al tipear "amp" y deja visible de qué subsistema es cada skill (decisión 0029, modifica 0013).

| Funcionalidad | Plugin | Skill |
|---------------|--------|-------|
| amp | `amp@xelnagah-harness` | `inicializar`, `planificar`, `actualizar` |
| amp-subsistemas | `amp-subsistemas@xelnagah-harness` | `agregar-subsistema`, `reubicar-aprendizaje` |
| amp-preferencias | `amp-preferencias@xelnagah-harness` | `registrar-preferencia` |
| amp-planes | `amp-planes@xelnagah-harness` | `ciclo-de-plan` |
| amp-conocimiento | `amp-conocimiento@xelnagah-harness` | `registrar-conocimiento`, `buscar-conocimiento` |
| amp-semantica | `amp-semantica@xelnagah-harness` | `converger-terminologia` |
| amp-decisiones | `amp-decisiones@xelnagah-harness` | `registrar-decision` |
| amp-herramientas | `amp-herramientas@xelnagah-harness` | `registrar-herramienta` |
| amp-conducta | `amp-conducta@xelnagah-harness` | `registrar-regla` |

> **Instalar en otra PC:** `/plugin marketplace add <owner>/<repo>` y después `/plugin install amp@xelnagah-harness` — trae los 8 `amp-<sub>` por dependencias.
> **Codex CLI:** no resuelve `dependencies`; después de registrar el marketplace, desde el repo destino correr `node <checkout-harness>/.claude/herramientas/instalar-plugins-codex/instalar-plugins-codex.js --aplicar`.
> **Nota:** dentro de `amp`, `planificar` y `actualizar` son **operacionales** (no instalan estructura propia): `planificar` analiza sin escribir; `actualizar` es el nivelador, contraparte de `inicializar`. `inicializar` es el instalador consolidado — absorbe los ex `inicializar-<sub>` individuales, es la fuente única de todo el setup.

## Cómo agregar una funcionalidad nueva

1. Crear `funcionalidades/<nombre>/` con:
   - `.claude-plugin/plugin.json` — manifiesto (`name`, `description`, `version`, `author`; `dependencies` si aplica).
   - `README.md` — qué hace, qué agrega al repo destino, dependencias.
   - `skills/<nombre-skill>/SKILL.md` (+ `PLANTILLA.md` si lleva textos literales) — **fuente única** del flujo, en el estándar Agent Skills.
2. Agregar el plugin a `.claude-plugin/marketplace.json` (`name` + `source: "./funcionalidades/<nombre>"`).
3. Validar con `claude plugin validate .`.
4. Registrarla en la tabla de arriba.

> **Invariante:** `SKILL.md` es la fuente única de cada flujo. Un subsistema que gana una skill de operación se documenta en su `amp-<sub>`; su instalación la escribe `amp:inicializar` (que duplica los textos literales en su `SKILL.md`/`PLANTILLA.md`, porque la copia instalada del Plugin aísla la carpeta de la Habilidad) — usar la skill `propagar-harness`.
