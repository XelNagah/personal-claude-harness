# Inicializador de Repos Custom — jllarens

Fuente de verdad de mi setup estándar de trabajo con agentes de código. Sirve para **inicializar un repo nuevo** con las funcionalidades a las que ya estoy acostumbrado (gestión de planes persistida, memoria local, base de conocimiento, glosario del dominio, registro de decisiones, gestión de scripts, estilo de commits, preferencias de comunicación), y se va actualizando a medida que esas preferencias cambian.

Es a la vez un **marketplace de plugins de Claude Code** (estilo [Matt Pocock](https://github.com/mattpocock)) y una colección de **prompts agnósticos**. Cada funcionalidad existe en los dos formatos.

## Estructura

```
├── README.md                          # este archivo
├── REGISTRO.md                        # catálogo de funcionalidades (qué agrega cada una)
├── .claude/                           # el propio setup estándar, aplicado a este repo
│   ├── CLAUDE.md                      # instrucciones internas de este repo
│   ├── memory/                        # memoria local + índice MEMORY.md
│   ├── planes/                        # planes-pendientes/ + planes-ejecutados/
│   ├── conocimiento/                  # lo que el agente sabe (INDICE.md)
│   ├── glosario/                      # terminología del dominio (INDICE.md)
│   ├── decisiones/                    # decisiones estructurales (INDICE.md)
│   └── scripts/                       # tooling del harness, uno por carpeta + INDICE.md
├── .claude-plugin/
│   └── marketplace.json               # catálogo del marketplace (lista los 10 plugins)
└── funcionalidades/                   # cada subcarpeta = un plugin
    ├── memoria-local/                 # sistema de memoria (infraestructura base)
    ├── preferencias-trabajo/          # preferencias de comunicación + principios
    ├── gestion-de-planes/             # ciclo planes pendientes→ejecutados
    ├── estilo-commits/                # commits en español, sin co-autoría de IA
    ├── conocimiento/                  # base de conocimiento + lint de integridad
    ├── glosario/                      # glosario del dominio (tabla + alias + lint)
    ├── decisiones/                    # registro de decisiones estructurales + lint
    ├── scripts/                       # gestión de scripts (registro + lint)
    ├── setup-completo/                # orquestador: instala todo (skill inicializar-custom)
    └── planificar/                    # skill de análisis (operacional, no instala; skill planificar)
```

Cada funcionalidad/plugin tiene adentro:

```
funcionalidades/<nombre>/
├── .claude-plugin/plugin.json         # manifiesto del plugin
├── README.md                          # qué hace
├── prompt.md                          # versión agnóstica de agente
└── skills/<nombre-skill>/             # versión Claude Code
    ├── SKILL.md
    └── PLANTILLA.md                   # si lleva textos verbatim
```

Los dos formatos intercambiables:

- **Skill / plugin** — para Claude Code, instalable por marketplace e invocable por nombre.
- **Prompt agnóstico** — texto para pegar a cualquier agente (Codex, Cursor, Copilot, Gemini CLI…), que arma el equivalente en su propio harness.

Ver [REGISTRO.md](REGISTRO.md) para el catálogo completo.

## Instalación en otra PC (marketplace de plugins)

Este repo es un marketplace de Claude Code. En la PC destino (con git autenticado contra el repo — `gh auth login` o SSH si es privado):

```shell
# 1. Registrar el marketplace (GitHub owner/repo, o git URL para privado)
/plugin marketplace add XelNagah/personal-claude-harness

# 2a. Setup completo de una pasada (instala el orquestador)
/plugin install setup-completo@xelnagah-harness

# 2b. …o una pieza suelta
/plugin install gestion-de-planes@xelnagah-harness
```

Después, en el repo a inicializar, invocar el skill (`inicializar-custom`, `inicializar-gestion-planes`, etc.).

Repo privado: el install es un `git clone` por debajo; alcanza con tener git autenticado. Para auto-update en background, exportar `GITHUB_TOKEN` con scope `repo`.

## Desarrollo local (junctions)

En **esta** máquina los 10 skills están enlazados por **junction** (NTFS) desde `~/.claude/skills/` hacia cada `funcionalidades/<n>/skills/<nombre-skill>` — fuente única para editar en vivo, sin pasar por el cache de plugins. Recrear en otra máquina de desarrollo:

```powershell
New-Item -ItemType Junction `
  -Path   "$env:USERPROFILE\.claude\skills\inicializar-custom" `
  -Target "<ruta-repo>\funcionalidades\setup-completo\skills\inicializar-custom"
```

En **Linux/macOS** el equivalente es un symlink:

```bash
ln -s "<ruta-repo>/funcionalidades/setup-completo/skills/inicializar-custom" \
  ~/.claude/skills/inicializar-custom
```

> No mezclar en la misma máquina: junction/symlink **o** plugin instalado para un mismo skill, no ambos (colisionan por nombre). Enlace = autoría; plugin = distribución.

## Uso

- **Setup completo con Claude Code:** invocar el skill `inicializar-custom` parado en la raíz del proyecto.
- **Una funcionalidad puntual:** invocar su skill (p. ej. `inicializar-gestion-planes`) o pegar su `funcionalidades/<nombre>/prompt.md`.
- **Con otro agente** (Codex, Cursor, Copilot…): pegar el `prompt.md` de la funcionalidad que quieras.
