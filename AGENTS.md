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
│   ├── memoria/                               # memoria local + índice MEMORIA.md + MANIFIESTO.md + lint-memoria/
│   ├── preferencias/                          # PREFERENCIAS.md (Base + Adaptaciones) + lint-preferencias/
│   ├── planes/                                # PLANES.md + ESTADOS.md + MANIFIESTO.md + pendientes/ ejecutados/ descartados/ + lint-planes/ (hook SessionStart)
│   ├── conocimiento/                          # lo que el agente sabe (INDICE.md) + MANIFIESTO.md + lint-conocimiento/
│   ├── glosario/                              # terminología del dominio (INDICE.md) + MANIFIESTO.md + lint-glosario/
│   ├── decisiones/                            # decisiones estructurales (INDICE.md) + MANIFIESTO.md + lint-decisiones/
│   └── herramientas/                          # tools del Propósito (INDICE.md, columna Tipo) + MANIFIESTO.md; los lints de subsistema viven con su subsistema, no acá
│       ├── lint-herramientas/                 # lint del registro de Herramientas
│       └── lint-harness/                      # lint de coherencia del harness (disco↔marketplace↔REGISTRO, junctions, textual, tamaño de manifiestos)
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

Cada **funcionalidad/plugin** = `funcionalidades/<nombre>/` con `.claude-plugin/plugin.json` + `README.md` + `skills/<nombre-skill>/SKILL.md` (formato estándar Agent Skills, **fuente única** del flujo, rutas `.claude/` literales) y `PLANTILLA.md` cuando lleva textos literales. Catálogo, dependencias, nombres de plugin/skill en `REGISTRO.md`.

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

- **`SKILL.md` es la fuente única de cada flujo** (no hay más `prompt.md` por funcionalidad). Cambia una preferencia o un texto que viaja → actualizar el `SKILL.md`/`PLANTILLA.md` de la funcionalidad afectada **y** el orquestador `setup-completo` (su `SKILL.md` y `PLANTILLA.md` duplican los textos literales, porque tanto el junction como el cache de plugins aíslan la carpeta del skill — no pueden leer las piezas en ejecución). Usar la skill `propagar-harness`.
- **Agregar una funcionalidad nueva** → skill `agregar-funcionalidad`: crear `funcionalidades/<nombre>/` (plugin.json + README + skills/<skill>/), sumarla a `marketplace.json`, junctions dobles si se edita en vivo, registrarla en `REGISTRO.md`, y sumarla al orquestador si es parte del setup base. Validar con `claude plugin validate .`. Procedimiento en `REGISTRO.md`.
- **Dependencias actuales:** `gestion-de-planes` y `estilo-commits` dependen de `memoria-local` (guardan memorias en `memoria/`). El orquestador respeta el orden: preferencias-trabajo → memoria-local → gestion-de-planes → estilo-commits.
- **Idempotencia / nivelar:** todo skill lleva una sección "Reconciliación (idempotencia)" — son seguros de re-correr y sirven para llevar al día repos a medio configurar. Reglas: inspeccionar antes de escribir, crear solo lo ausente, detectar equivalentes por tema (no pisar lo divergente, preguntar), reportar al final en tres grupos (`agregado` / `ya estaba` / `divergente`). Al tocar un flujo de trabajo, conservar esa propiedad: nada de "Crear X" a secas sobre archivos compartidos (`AGENTS.md`, `MEMORIA.md`).
- **Versionado de plugins:** cada `plugin.json` tiene `version`. Con `version` fijo, los usuarios solo reciben la actualización al subirle la versión; si se omite, cada commit cuenta como versión nueva. Subir la versión al publicar cambios, o quitar `version` para auto-versionar por commit.

## Preferencias (siempre cargadas)

@.claude/preferencias/PREFERENCIAS.md

Al tocar las preferencias, correr el lint estructural **desde la raíz del repo** (chequea secciones Base/Adaptaciones + el `@import`):

```bash
node .claude/preferencias/lint-preferencias/lint-preferencias.js
```

## Subsistemas (manifiestos siempre cargados)

Cada subsistema tiene un **Manifiesto** (`.claude/<sub>/MANIFIESTO.md`, decisión 0017): una descripción breve —qué es, cómo se usa, cuándo consultarlo— que va **siempre en contexto** y que **declara si su índice también se carga**, incluyendo o no la línea `@INDICE.md`. Lo que se carga siempre es el manifiesto, no necesariamente el índice (reemplaza la carga incondicional del índice de la decisión 0002).

Si tu agente no expande imports, **leé estos manifiestos al inicio de la sesión** (y, si el manifiesto importa su índice, ese índice también). Hoy cargan su índice: memoria, conocimiento, herramientas. NO lo cargan (se consultan a demanda): planes, glosario, decisiones.

@.claude/memoria/MANIFIESTO.md
@.claude/planes/MANIFIESTO.md
@.claude/conocimiento/MANIFIESTO.md
@.claude/glosario/MANIFIESTO.md
@.claude/decisiones/MANIFIESTO.md
@.claude/herramientas/MANIFIESTO.md
