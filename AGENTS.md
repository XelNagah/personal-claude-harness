# Inicializador de Repos Custom — jllarens

**Objetivo:** funcionalidades para agentes de código de **propósito general** (multipropósito). El usuario define el propósito del repo (contabilidad, análisis de mudanza, prueba de modelos…) y los subsistemas se llenan con lo aprendido para lograrlo, sesión a sesión. Se instala sobre un repo vacío o sobre uno que ya tenga cosas (idempotente/reconciliable). Este repo es la **fuente de verdad del setup estándar** y se actualiza a medida que las preferencias cambian.

El repo es a la vez un **marketplace de plugins de Claude Code** (estilo Matt Pocock, https://github.com/mattpocock) y una colección de skills en el estándar abierto **Agent Skills** (`SKILL.md`), legibles por Claude Code, Codex CLI, Cursor, Gemini CLI y Copilot. Cada funcionalidad = un plugin.

## Punto de entrada (multiagente, decisión 0010)

- **`AGENTS.md` (este archivo) es la fuente única de instrucciones** del repo: lo leen nativo Codex/Cursor/Gemini/Copilot.
- **`CLAUDE.md` (raíz) es solo un adaptador de una línea** (`@AGENTS.md`) para Claude Code, que no lee AGENTS.md nativo. No agregar contenido ahí.
- **`.claude/` es la casa de datos de los subsistemas para TODOS los agentes** (el nombre es cosmético; no hay una casa por agente).
- Las líneas `@ruta` de este archivo: Claude Code las expande automáticamente (import). Si tu agente no soporta imports, **leé esos archivos al inicio de la sesión** — son parte obligatoria del contexto.
- Paridad de comportamiento objetivo: Claude Code ↔ Codex CLI; el resto de los agentes queda cubierto por los estándares.

## Estructura

```
├── AGENTS.md                                  # fuente única de instrucciones (este archivo)
├── CLAUDE.md                                  # adaptador Claude Code: @AGENTS.md
├── README.md                                  # presentación del repo (público)
├── REGISTRO.md                                # catálogo de funcionalidades
├── .claude/                                   # el propio setup estándar, aplicado a este repo
│   ├── memoria/                               # memoria local + índice MEMORIA.md + lint-memoria/
│   ├── preferencias/                          # PREFERENCIAS.md (Base + Adaptaciones) + lint-preferencias/
│   ├── planes/                                # PLANES.md + ESTADOS.md + pendientes/ ejecutados/ descartados/ + lint-planes/ (hook SessionStart)
│   ├── conocimiento/                          # lo que el agente sabe (INDICE.md) + lint-conocimiento/
│   ├── glosario/                              # terminología del dominio (INDICE.md) + lint-glosario/
│   ├── decisiones/                            # decisiones estructurales (INDICE.md) + lint-decisiones/
│   └── herramientas/                          # tools del Propósito (INDICE.md, columna Tipo); los lints de subsistema viven con su subsistema, no acá
│       ├── lint-herramientas/                 # lint del registro de Herramientas
│       └── lint-harness/                      # lint de coherencia del harness (disco↔marketplace↔REGISTRO, junctions, verbatim)
├── .claude-plugin/marketplace.json            # catálogo del marketplace (10 plugins)
└── funcionalidades/                           # cada subcarpeta = un plugin
    ├── memoria-local/                         # infra: memoria/ + MEMORIA.md + Mapa del repo (@imports)
    ├── preferencias-trabajo/                  # preferencias versionadas Base/Adaptaciones (@import)
    ├── gestion-de-planes/                     # ciclo pendientes/ejecutados/descartados + PLANES.md + lint + hook (dep: memoria-local)
    ├── estilo-commits/                        # memoria de commits (dep: memoria-local)
    ├── conocimiento/                          # base .claude/conocimiento/ + lint (dep: memoria-local)
    ├── glosario/                              # glosario del dominio: tabla + alias + lint (dep: memoria-local)
    ├── decisiones/                            # decisiones estructurales: tabla + detalle + lint (dep: memoria-local)
    ├── herramientas/                          # gestión de Herramientas: registro + lint (dep: memoria-local)
    ├── setup-completo/                        # orquestador, skill inicializar-custom (instala las 8)
    └── planificar/                            # skill de análisis (operacional, no instala; skill planificar)
```

Cada **funcionalidad/plugin** = `funcionalidades/<nombre>/` con `.claude-plugin/plugin.json` + `README.md` + `skills/<nombre-skill>/SKILL.md` (formato estándar Agent Skills, **fuente única** del flujo, rutas `.claude/` literales) y `PLANTILLA.md` cuando lleva textos verbatim. Catálogo, dependencias, nombres de plugin/skill en `REGISTRO.md`.

## Distribución: marketplace de plugins

`.claude-plugin/marketplace.json` (name `xelnagah-harness`) lista los 10 plugins con `source: "./funcionalidades/<nombre>"`. Validado con `claude plugin validate .` (el `source` debe arrancar con `./`; `metadata.pluginRoot` lo rechazó esta versión del CLI). En PC destino: `/plugin marketplace add <owner>/<repo>` + `/plugin install <plugin>@xelnagah-harness`. Repo privado: anda con git autenticado (clone por debajo); auto-update background necesita `GITHUB_TOKEN`. Para Codex/Cursor/Gemini no hay marketplace: clone del repo + junctions de skills (abajo).

## Desarrollo local (junctions dobles, ya hecho en esta máquina)

Los skills están enlazados por **junction** (NTFS) en dos tandas apuntando a la misma fuente `funcionalidades\<n>\skills\<nombre-skill>`:

- `~/.claude/skills/<nombre-skill>` — los ve Claude Code.
- `~/.agents/skills/<nombre-skill>` — los ven Codex CLI, Cursor y Gemini CLI (ubicación estándar Agent Skills).

Fuente única para editar en vivo, sin pasar por el cache de plugins. Crear/reparar ambas tandas con la Herramienta:

```powershell
node .claude/herramientas/instalar-junctions/instalar-junctions.js
```

> **No mezclar junction + plugin del mismo skill en una misma máquina** (colisionan por nombre). Junction = autoría/edición en vivo; plugin instalado = distribución/consumo.

## Mantenimiento

- **`SKILL.md` es la fuente única de cada flujo** (no hay más `prompt.md` por funcionalidad). Cambia una preferencia o un texto que viaja → actualizar el `SKILL.md`/`PLANTILLA.md` de la funcionalidad afectada **y** el orquestador `setup-completo` (su `SKILL.md` y `PLANTILLA.md` duplican los textos verbatim, porque tanto el junction como el cache de plugins aíslan la carpeta del skill — no pueden leer las piezas en runtime). Usar la skill `propagar-harness`.
- **Agregar una funcionalidad nueva** → skill `agregar-funcionalidad`: crear `funcionalidades/<nombre>/` (plugin.json + README + skills/<skill>/), sumarla a `marketplace.json`, junctions dobles si se edita en vivo, registrarla en `REGISTRO.md`, y sumarla al orquestador si es parte del setup base. Validar con `claude plugin validate .`. Procedimiento en `REGISTRO.md`.
- **Dependencias actuales:** `gestion-de-planes` y `estilo-commits` dependen de `memoria-local` (guardan memorias en `memoria/`). El orquestador respeta el orden: preferencias-trabajo → memoria-local → gestion-de-planes → estilo-commits.
- **Idempotencia / nivelar:** todo skill lleva una sección "Reconciliación (idempotencia)" — son seguros de re-correr y sirven para llevar al día repos a medio configurar. Reglas: inspeccionar antes de escribir, crear solo lo ausente, detectar equivalentes por tema (no pisar lo divergente, preguntar), reportar al final en tres baldes (`agregado` / `ya estaba` / `divergente`). Al tocar un workflow, conservar esa propiedad: nada de "Crear X" a secas sobre archivos compartidos (`AGENTS.md`, `MEMORIA.md`).
- **Versionado de plugins:** cada `plugin.json` tiene `version`. Con `version` fijo, los usuarios solo reciben update al bumpearlo; si se omite, cada commit cuenta como versión nueva. Bumpear al publicar cambios, o quitar `version` para auto-versionar por commit.

## Preferencias (siempre cargadas)

@.claude/preferencias/PREFERENCIAS.md

Al tocar las preferencias, correr el lint estructural **desde la raíz del repo** (chequea secciones Base/Adaptaciones + el `@import`):

```bash
node .claude/preferencias/lint-preferencias/lint-preferencias.js
```

## Mapa del repo (siempre cargado)

@.claude/memoria/MEMORIA.md
@.claude/planes/PLANES.md
@.claude/conocimiento/INDICE.md
@.claude/herramientas/INDICE.md

## Memoria del proyecto

La memoria local vive en [`memoria/`](.claude/memoria/), indexada por [`memoria/MEMORIA.md`](.claude/memoria/MEMORIA.md). **Cargar el índice al inicio de cada sesión y respetar lo que dice.** Cada memoria es un `.md` propio con frontmatter (`name`, `description`, `metadata.type` ∈ `user` | `feedback` | `project` | `reference`); el índice lleva solo punteros, nunca contenido. Antes de crear una memoria nueva, revisar si una existente ya cubre el hecho — actualizar en vez de duplicar. Fechas siempre absolutas. Al cerrar una tarea que tocó la memoria, correr el lint **desde la raíz del repo**:

```bash
node .claude/memoria/lint-memoria/lint-memoria.js
```

Chequea refs/wikilinks rotos, `MEMORIA.md` incompleto, huérfanos y frontmatter inválido.

## Planes del proyecto

Los planes se persisten en [`planes/`](.claude/planes/): `pendientes/` (planes vivos: `Nuevo`, `En curso`, `Diferido`), `ejecutados/` y `descartados/` (registro, con motivo). Nombre = slug estable sin fecha; estado y fechas viven en el registro [`planes/PLANES.md`](.claude/planes/PLANES.md), y los estados disponibles (con su carpeta y si son terminales) en [`planes/ESTADOS.md`](.claude/planes/ESTADOS.md) — configurable, que el lint lee. Ciclo completo en la memoria [`feedback_flujo_planes.md`](.claude/memoria/feedback_flujo_planes.md). Al cerrar una tarea que tocó planes, correr el lint **desde la raíz del repo**:

```bash
node .claude/planes/lint-planes/lint-planes.js
```

## Base de conocimiento del proyecto

Todo lo que el agente **sabe** vive en una ubicación única: [`conocimiento/`](.claude/conocimiento/), indexado por [`INDICE.md`](.claude/conocimiento/INDICE.md). Nunca en la raíz del repo. Los `.md` de la raíz (README y REGISTRO) son **documentación del proyecto**, no conocimiento de agente: se quedan donde están.

Al cerrar una tarea que escribió conocimiento, correr el lint mecánico **desde la raíz del repo** (la ruta es relativa al cwd, no a este archivo):

```bash
node .claude/conocimiento/lint-conocimiento/lint-conocimiento.js
```

Chequea refs rotas, índice incompleto y huérfanos. Detalle de la convención en la memoria [`feedback_base_conocimiento.md`](.claude/memoria/feedback_base_conocimiento.md).

## Glosario del proyecto

La terminología del dominio vive en [`glosario/INDICE.md`](.claude/glosario/INDICE.md): una tabla de conceptos (nombre canónico, definición, alias registrados, y link a página de detalle si el concepto es complejo). Los alias se **registran, no se prohíben**. **Consultarlo al planificar y analizar.** Al cerrar una tarea que tocó el glosario, correr el lint **desde la raíz del repo**:

```bash
node .claude/glosario/lint-glosario/lint-glosario.js
```

Detalle de la convención en la memoria [`feedback_glosario.md`](.claude/memoria/feedback_glosario.md).

## Decisiones del proyecto

Las decisiones **estructurales al propósito del repo** (no las operativas triviales) se asientan en [`decisiones/INDICE.md`](.claude/decisiones/INDICE.md): una tabla donde cada fila es una decisión (N°, qué + por qué, fecha, estado, y link a detalle si requiere conceptualización mayor). Misma estructura que el glosario. **Consultarlas al planificar y analizar** para no re-decidir ni contradecir. Al cerrar una tarea que registró decisiones, correr el lint **desde la raíz del repo**:

```bash
node .claude/decisiones/lint-decisiones/lint-decisiones.js
```

Detalle de la convención en la memoria [`feedback_decisiones.md`](.claude/memoria/feedback_decisiones.md).

## Herramientas del proyecto

Las **Herramientas** del repo — las *tools* que el Propósito requiere (tipos `script`, `skill` local, `MCP` local) — viven en [`herramientas/`](.claude/herramientas/), listadas en el registro [`herramientas/INDICE.md`](.claude/herramientas/INDICE.md) (tabla Herramienta | Tipo | Qué hace | Cómo se invoca | Estado). Los **lints de subsistema no son Herramientas**: son infra del Patrón y viven con su subsistema (`.claude/<sub>/lint-<sub>/`, decisión 0008). ⚠️ Una tool referenciada por ruta en `settings`, `.gitignore` o un hook no se mueve sin actualizar esa referencia (rompe el match por prefijo). Al cerrar una tarea que tocó Herramientas, correr el lint **desde la raíz del repo**:

```bash
node .claude/herramientas/lint-herramientas/lint-herramientas.js
```

Detalle de la convención en la memoria [`feedback_herramientas.md`](.claude/memoria/feedback_herramientas.md).
