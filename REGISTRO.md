# Registro de funcionalidades

Catálogo de las funcionalidades que este repo instala para armar un agente de **propósito general** — el usuario define el propósito del repo y los subsistemas se llenan con lo aprendido para lograrlo. Cada funcionalidad vive en `funcionalidades/<nombre>/`, **es un plugin de Claude Code** (listado en `.claude-plugin/marketplace.json`) y sus skills usan el **estándar abierto Agent Skills** (`SKILL.md`), legible también por Codex CLI, Cursor, Gemini CLI y Copilot (decisión 0010). Ver el README de cada una para el detalle.

**Empaquetado:** un plugin transversal **`amp`** (skills `inicializar` · `planificar` · `info` · `actualizar`) + un plugin **`amp-<sub>`** por cada uno de los nueve subsistemas. Se instala `amp` y el paquete completo entra por dependencias.

| Funcionalidad | Qué hace | Depende de | Carpeta |
|---------------|----------|-----------|---------|
| **amp** | Plugin transversal. Skills: `inicializar`, `planificar`, `info` y `actualizar`. El actualizador también conduce las migraciones de formas retiradas y no informa “al día” mientras quede `memoria/`. | los 9 `amp-<sub>` | [`amp/`](funcionalidades/amp/) |
| **amp-subsistemas** | Catálogo Base/Propósito y coordinación de la reubicación del Aprendizaje. Skills: `agregar-subsistema` y `reubicar-aprendizaje`. | — | [`amp-subsistemas/`](funcionalidades/amp-subsistemas/) |
| **amp-preferencias** | Preferencias versionadas en `preferencias/`, un archivo por origen (`PREFERENCIAS.md` del Agente Multipropósito + `PREFERENCIAS-LOCAL.md` del Agente Desplegado), los dos importados siempre vía `@`, + lint estructural. `registrar-preferencia` da de alta o copia puntualmente una regla con vista previa e idempotencia; `adoptar-recomendadas` muestra el catálogo de Preferencias Recomendadas que trae el plugin y adopta las que el usuario elija, sin instalar ninguna sola. | — | [`amp-preferencias/`](funcionalidades/amp-preferencias/) |
| **amp-planes** | Ciclo de planes `pendientes/ejecutados/descartados` + registro, README, lint y hook. Familia de skills por verbo: `crear-plan`, `analizar-plan`, `explicar-plan`, `priorizar-planes`, `sugerir-siguiente-plan`, `pausar-plan`, `retomar-plan`, `diferir-plan`, `cerrar-plan`, `descartar-plan`; subagente `relevador-de-planes`, en el que las dos de prioridad delegan la lectura de los planes vivos. | — | [`amp-planes/`](funcionalidades/amp-planes/) |
| **amp-conocimiento** | Base única de lo que el agente sabe + README y lint. Skills `registrar-conocimiento` y `buscar-conocimiento`; subagente `buscador-de-conocimiento`, en el que la segunda delega el recorrido. | — | [`amp-conocimiento/`](funcionalidades/amp-conocimiento/) |
| **amp-semantica** | Glosario + Terminología Farlopa + README y lint. Skill `converger-terminologia`; subagente `buscador-de-terminologia`, en el que delega el recorrido. | — | [`amp-semantica/`](funcionalidades/amp-semantica/) |
| **amp-decisiones** | Decisiones estructurales + README y lint. Skill `registrar-decision`. | — | [`amp-decisiones/`](funcionalidades/amp-decisiones/) |
| **amp-herramientas** | Registro de Herramientas separadas por origen, fichas y lint. Skill `registrar-herramienta`. | — | [`amp-herramientas/`](funcionalidades/amp-herramientas/) |
| **amp-conducta** | Momentos, reglas separadas por origen, repartidor y lint. Skill `registrar-regla`. | — | [`amp-conducta/`](funcionalidades/amp-conducta/) |
| **amp-comunicacion** | Comunicación en el momento entre instalaciones del Agente Multipropósito de la misma máquina: registro (Aprendizaje local, no se commitea), mecanismo de comunicación, buscador de instalaciones y lint. Skills `buscar-agentes`, `registrar-agente`, `preguntar` y `resolver`. | — | [`amp-comunicacion/`](funcionalidades/amp-comunicacion/) |

Todos los subsistemas Base tienen plugin y skill de operación. `commits` no es un subsistema: su texto vive en Preferencias y Conducta lo entrega antes de confirmar.

## Plugin y skill (Claude Code)

El prefijo de skill **es** el nombre del plugin (`amp-planes:crear-plan` ≠ `amp-conocimiento:registrar-conocimiento`): agrupa al tipear "amp" y deja visible de qué subsistema es cada skill (Decisión Local-0029, empaquetado en un plugin por subsistema; modifica la Local-0013, segmentación de skills por prefijo de plugin).

Un plugin transporta además **subagentes**, en su carpeta `agents/`. Se distinguen de las skills por la forma del nombre: una skill es una acción y se nombra verbo+objeto (`converger-terminologia`); un subagente es un rol y se nombra con un sustantivo (`buscador-de-terminologia`). No los invoca el usuario: los invoca la skill que delega en ellos el trabajo de volumen, para que lo que leen no quede en el contexto del hilo principal.

| Funcionalidad | Plugin | Skill | Subagente |
|---------------|--------|-------|-----------|
| amp | `amp@xelnagah-harness` | `inicializar`, `planificar`, `actualizar` | — |
| amp-subsistemas | `amp-subsistemas@xelnagah-harness` | `agregar-subsistema`, `reubicar-aprendizaje` | — |
| amp-preferencias | `amp-preferencias@xelnagah-harness` | `registrar-preferencia`, `adoptar-recomendadas` | — |
| amp-planes | `amp-planes@xelnagah-harness` | `crear-plan`, `analizar-plan`, `explicar-plan`, `priorizar-planes`, `sugerir-siguiente-plan`, `pausar-plan`, `retomar-plan`, `diferir-plan`, `cerrar-plan`, `descartar-plan` | `relevador-de-planes` |
| amp-conocimiento | `amp-conocimiento@xelnagah-harness` | `registrar-conocimiento`, `buscar-conocimiento` | `buscador-de-conocimiento` |
| amp-semantica | `amp-semantica@xelnagah-harness` | `converger-terminologia` | `buscador-de-terminologia` |
| amp-decisiones | `amp-decisiones@xelnagah-harness` | `registrar-decision` | — |
| amp-herramientas | `amp-herramientas@xelnagah-harness` | `registrar-herramienta` | — |
| amp-conducta | `amp-conducta@xelnagah-harness` | `registrar-regla` | — |
| amp-comunicacion | `amp-comunicacion@xelnagah-harness` | `buscar-agentes`, `registrar-agente`, `preguntar`, `resolver` | — |

> **Instalar en otra PC:** `/plugin marketplace add <owner>/<repo>` y después `/plugin install amp@xelnagah-harness` — trae los 9 `amp-<sub>` por dependencias.
> **Codex CLI:** no resuelve `dependencies`; después de registrar el marketplace, desde el repo destino correr `node <checkout-harness>/.claude/herramientas/instalar-plugins-codex/instalar-plugins-codex.js --aplicar`.
> **Nota:** dentro de `amp`, `planificar` y `actualizar` son **operacionales** (no instalan estructura propia): `planificar` analiza sin escribir; `actualizar` es el actualizador, contraparte de `inicializar`. `inicializar` es el instalador consolidado — absorbe los ex `inicializar-<sub>` individuales, es la fuente única de todo el setup.

## Cómo agregar una funcionalidad nueva

1. Crear `funcionalidades/<nombre>/` con:
   - `.claude-plugin/plugin.json` — manifiesto (`name`, `description`, `version`, `author`; `dependencies` si aplica).
   - `README.md` — qué hace, qué agrega al repo destino, dependencias.
   - `skills/<nombre-skill>/SKILL.md` (+ `PLANTILLA.md` si lleva pedazos que se fusionan o moldes con marcadores, y `base/` si instala Componentes de Subsistema, que viajan como **archivos** con el árbol de destino) — **fuente única** del flujo, en el estándar Agent Skills.
   - `agents/<nombre-subagente>.md` si alguna de sus skills delega trabajo de volumen — frontmatter con `name`, `description`, `tools` y `model`, y el nombre en sustantivo de rol.
2. Agregar el plugin a `.claude-plugin/marketplace.json` (`name` + `source: "./funcionalidades/<nombre>"`).
3. Validar con `claude plugin validate .`.
4. Registrarla en la tabla de arriba.

> **Invariante:** `SKILL.md` es la fuente única de cada flujo. Un subsistema que gana una skill de operación se documenta en su `amp-<sub>`; su instalación la escribe `amp:inicializar` (que duplica los textos literales en su `SKILL.md`/`PLANTILLA.md`, porque la copia instalada del Plugin aísla la carpeta de la Habilidad) — los Componentes de Subsistema que viajan se ponen al día con la Herramienta `sincronizar-base`.
