# Inicializador de Repos Custom — jllarens

**Objetivo:** poder inicializar rápido mis repositorios con mis preferencias de trabajo (gestión de planes persistida, memoria local, estilo de commits, preferencias de comunicación). Este proyecto se va a ir actualizando a medida que esas preferencias cambien — es la fuente de verdad del setup estándar.

El repo es a la vez un **marketplace de plugins de Claude Code** (estilo Matt Pocock, https://github.com/mattpocock) y una colección de prompts agnósticos. Cada funcionalidad = un plugin.

## Estructura

```
├── README.md                                  # presentación del repo (público)
├── REGISTRO.md                                # catálogo de funcionalidades
├── .claude/                                   # el propio setup estándar, aplicado a este repo
│   ├── CLAUDE.md                              # este archivo (instrucciones internas)
│   ├── memory/                                # memoria local + índice MEMORY.md
│   ├── planes/                                # planes-pendientes/ + planes-ejecutados/
│   ├── conocimiento/                          # lo que el agente sabe (INDICE.md)
│   ├── glosario/                              # terminología del dominio (INDICE.md)
│   ├── decisiones/                            # decisiones estructurales (INDICE.md)
│   └── scripts/                               # tooling del harness, uno por carpeta + INDICE.md
│       ├── lint-conocimiento/                 # lint de integridad de conocimiento/
│       ├── lint-glosario/                     # lint de glosario/
│       ├── lint-decisiones/                   # lint de decisiones/
│       └── lint-scripts/                      # lint del registro de scripts
├── .claude-plugin/marketplace.json            # catálogo del marketplace (10 plugins)
└── funcionalidades/                           # cada subcarpeta = un plugin
    ├── memoria-local/                         # infra: memory/ + MEMORY.md + formato
    ├── preferencias-trabajo/                  # comunicación + principios (secciones CLAUDE.md)
    ├── gestion-de-planes/                     # ciclo planes pendientes→ejecutados (dep: memoria-local)
    ├── estilo-commits/                        # memoria de commits (dep: memoria-local)
    ├── conocimiento/                          # base .claude/conocimiento/ + lint (dep: memoria-local)
    ├── glosario/                              # glosario del dominio: tabla + alias + lint (dep: memoria-local)
    ├── decisiones/                            # decisiones estructurales: tabla + detalle + lint (dep: memoria-local)
    ├── scripts/                               # gestión de scripts: registro + lint (dep: memoria-local)
    ├── setup-completo/                        # orquestador, skill inicializar-custom (instala las 8)
    └── planificar/                            # skill de análisis (operacional, no instala; skill planificar)
```

Cada **funcionalidad/plugin** = `funcionalidades/<nombre>/` con `.claude-plugin/plugin.json` + `README.md` + `prompt.md` (agnóstico, placeholder `<config>`) + `skills/<nombre-skill>/SKILL.md` (Claude Code, `.claude/` literal) y `PLANTILLA.md` cuando lleva textos verbatim. Catálogo, dependencias, nombres de plugin/skill en `REGISTRO.md`.

## Distribución: marketplace de plugins

`.claude-plugin/marketplace.json` (name `xelnagah-harness`) lista los 10 plugins con `source: "./funcionalidades/<nombre>"`. Validado con `claude plugin validate .` (el `source` debe arrancar con `./`; `metadata.pluginRoot` lo rechazó esta versión del CLI). En PC destino: `/plugin marketplace add <owner>/<repo>` + `/plugin install <plugin>@xelnagah-harness`. Repo privado: anda con git autenticado (clone por debajo); auto-update background necesita `GITHUB_TOKEN`.

## Desarrollo local (junction, ya hecho en esta máquina)

Los 10 skills están enlazados por **junction** (NTFS) desde `~/.claude/skills/<nombre-skill>` hacia `funcionalidades\<n>\skills\<nombre-skill>` — fuente única para editar en vivo, sin pasar por el cache de plugins. Recrear el orquestador:

```powershell
New-Item -ItemType Junction -Path "$env:USERPROFILE\.claude\skills\inicializar-custom" -Target "<ruta-repo>\funcionalidades\setup-completo\skills\inicializar-custom"
```

> **No mezclar junction + plugin del mismo skill en una misma máquina** (colisionan por nombre). Junction = autoría/edición en vivo; plugin instalado = distribución/consumo.

## Mantenimiento

- **Cambia una preferencia** → actualizar los **dos formatos** de la funcionalidad afectada (`prompt.md` agnóstico y `skills/<nombre-skill>/` Claude Code) **y** el orquestador `setup-completo` (su `PLANTILLA.md` y `prompt.md` duplican los textos verbatim, porque tanto el junction como el cache de plugins aíslan la carpeta del skill — no pueden leer las piezas en runtime). Divergentes en forma, no en contenido.
- **Agregar una funcionalidad nueva** → crear `funcionalidades/<nombre>/` (plugin.json + README + skills/<skill>/ + prompt.md), sumarla a `marketplace.json`, crear su junction si se edita en vivo, registrarla en `REGISTRO.md`, y sumarla al orquestador si es parte del setup base. Validar con `claude plugin validate .`. Procedimiento en `REGISTRO.md`.
- **Dependencias actuales:** `gestion-de-planes` y `estilo-commits` dependen de `memoria-local` (guardan memorias en `memory/`). El orquestador respeta el orden: preferencias-trabajo → memoria-local → gestion-de-planes → estilo-commits.
- **Idempotencia / leveling:** todo skill y prompt lleva una sección "Reconciliación (idempotencia)" — son seguros de re-correr y sirven para llevar al día repos a medio configurar. Reglas: inspeccionar antes de escribir, crear solo lo ausente, detectar equivalentes por tema (no pisar lo divergente, preguntar), reportar al final en tres baldes (`agregado` / `ya estaba` / `divergente`). Al tocar un workflow, conservar esa propiedad: nada de "Crear X" a secas sobre archivos compartidos (`CLAUDE.md`, `MEMORY.md`).
- **Versionado de plugins:** cada `plugin.json` tiene `version`. Con `version` fijo, los usuarios solo reciben update al bumpearlo; si se omite, cada commit cuenta como versión nueva. Hoy en `0.1.0` — bumpear al publicar cambios, o quitar `version` para auto-versionar por commit.

## Preferencias de comunicación

> Al preguntar por una decisión o analizar alternativas, dar SIEMPRE ejemplos concretos de cada postura (numéricos si aplica): cómo es ahora vs. cómo quedaría y por qué, encadenando consecuencias ("A ⇒ B; si no fuera B ⇒ no A porque X"). Objetivo: ubicar inmediatamente al lector en la mecánica relevante sin que tenga que reconstruir contexto.

## Principios de trabajo

- Conceptual antes que implementación. Ante ambigüedad de diseño, preguntar antes de asumir. Minimizar cambios sustractivos.
- Iterar de alto a bajo nivel: interfaces y contratos antes que implementación.
- Nomenclatura en español para el dominio; inglés solo para infraestructura técnica.
- Cero invención de datos: lo que no salga de una fuente verificada se marca como faltante o como interpretación propia.

## Memoria del proyecto

La memoria local vive en [`memory/`](memory/), indexada por [`memory/MEMORY.md`](memory/MEMORY.md). **Cargar el índice al inicio de cada sesión y respetar lo que dice.** Cada memoria es un `.md` propio con frontmatter (`name`, `description`, `metadata.type` ∈ `user` | `feedback` | `project` | `reference`); el índice lleva solo punteros, nunca contenido. Antes de crear una memoria nueva, revisar si una existente ya cubre el hecho — actualizar en vez de duplicar. Fechas siempre absolutas.

## Planes del proyecto

Los planes se persisten en [`planes/`](planes/): [`planes-pendientes/`](planes/planes-pendientes/) mientras esperan ejecución, [`planes-ejecutados/`](planes/planes-ejecutados/) una vez implementados. Formato de nombre: `AA-MM-DD - [Descripción corta].md`. El ciclo completo (cuándo se copia, cómo se replica cada actualización, qué agregar al mover a ejecutados) está en la memoria [`feedback_flujo_planes.md`](memory/feedback_flujo_planes.md).

## Base de conocimiento del proyecto

Todo lo que el agente **sabe** vive en una ubicación única: [`conocimiento/`](conocimiento/), indexado por [`INDICE.md`](conocimiento/INDICE.md). Nunca en la raíz del repo. Los `.md` de la raíz (README y REGISTRO) son **documentación del proyecto**, no conocimiento de agente: se quedan donde están.

Al cerrar una tarea que escribió conocimiento, correr el lint mecánico **desde la raíz del repo** (la ruta es relativa al cwd, no a este archivo):

```bash
node .claude/scripts/lint-conocimiento/lint-conocimiento.js
```

Chequea refs rotas, índice incompleto y huérfanos. Detalle de la convención en la memoria [`feedback_base_conocimiento.md`](memory/feedback_base_conocimiento.md).

## Glosario del proyecto

La terminología del dominio vive en [`glosario/INDICE.md`](glosario/INDICE.md): una tabla de conceptos (nombre canónico, definición, alias registrados, y link a página de detalle si el concepto es complejo). Los alias se **registran, no se prohíben**. **Consultarlo al planificar y analizar.** Al cerrar una tarea que tocó el glosario, correr el lint **desde la raíz del repo**:

```bash
node .claude/scripts/lint-glosario/lint-glosario.js
```

Detalle de la convención en la memoria [`feedback_glosario.md`](memory/feedback_glosario.md).

## Decisiones del proyecto

Las decisiones **estructurales al propósito del repo** (no las operativas triviales) se asientan en [`decisiones/INDICE.md`](decisiones/INDICE.md): una tabla donde cada fila es una decisión (N°, qué + por qué, fecha, estado, y link a detalle si requiere conceptualización mayor). Misma estructura que el glosario. **Consultarlas al planificar y analizar** para no re-decidir ni contradecir. Al cerrar una tarea que registró decisiones, correr el lint **desde la raíz del repo**:

```bash
node .claude/scripts/lint-decisiones/lint-decisiones.js
```

Detalle de la convención en la memoria [`feedback_decisiones.md`](memory/feedback_decisiones.md).

## Scripts del proyecto

Las herramientas del repo viven en [`scripts/`](scripts/): cada script en su carpeta `<tool>/` con un `README.md`, listadas en el registro [`scripts/INDICE.md`](scripts/INDICE.md) (tabla Tool | Qué hace | Cómo se corre | Estado). Nunca sueltos. ⚠️ Un script referenciado por ruta en `settings`, `.gitignore` o un hook no se mueve sin actualizar esa referencia (rompe el match por prefijo). Al cerrar una tarea que tocó scripts, correr el lint **desde la raíz del repo**:

```bash
node .claude/scripts/lint-scripts/lint-scripts.js
```

Detalle de la convención en la memoria [`feedback_scripts.md`](memory/feedback_scripts.md).
