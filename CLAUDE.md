# Inicializador de Repos Custom — jllarens

**Objetivo:** poder inicializar rápido mis repositorios con mis preferencias de trabajo (gestión de planes persistida, memoria local, estilo de commits, preferencias de comunicación). Este proyecto se va a ir actualizando a medida que esas preferencias cambien — es la fuente de verdad del setup estándar.

El repo es a la vez un **marketplace de plugins de Claude Code** (estilo Matt Pocock, https://github.com/mattpocock) y una colección de prompts agnósticos. Cada funcionalidad = un plugin.

## Estructura

```
├── README.md                                  # presentación del repo (público)
├── REGISTRO.md                                # catálogo de funcionalidades
├── CLAUDE.md                                  # este archivo (instrucciones internas)
├── .claude-plugin/marketplace.json            # catálogo del marketplace (5 plugins)
└── funcionalidades/                           # cada subcarpeta = un plugin
    ├── memoria-local/                         # infra: memory/ + MEMORY.md + formato
    ├── preferencias-trabajo/                  # comunicación + principios (secciones CLAUDE.md)
    ├── gestion-de-planes/                     # ciclo planes pendientes→ejecutados (dep: memoria-local)
    ├── estilo-commits/                        # memoria de commits (dep: memoria-local)
    └── setup-completo/                        # orquestador, skill inicializar-custom (instala las 4)
```

Cada **funcionalidad/plugin** = `funcionalidades/<nombre>/` con `.claude-plugin/plugin.json` + `README.md` + `prompt.md` (agnóstico, placeholder `<config>`) + `skills/<nombre-skill>/SKILL.md` (Claude Code, `.claude/` literal) y `PLANTILLA.md` cuando lleva textos verbatim. Catálogo, dependencias, nombres de plugin/skill en `REGISTRO.md`.

## Distribución: marketplace de plugins

`.claude-plugin/marketplace.json` (name `jllarens-harness`) lista los 5 plugins con `source: "./funcionalidades/<nombre>"`. Validado con `claude plugin validate .` (el `source` debe arrancar con `./`; `metadata.pluginRoot` lo rechazó esta versión del CLI). En PC destino: `/plugin marketplace add <owner>/<repo>` + `/plugin install <plugin>@jllarens-harness`. Repo privado: anda con git autenticado (clone por debajo); auto-update background necesita `GITHUB_TOKEN`.

## Desarrollo local (junction, ya hecho en esta máquina)

Los 5 skills están enlazados por **junction** (NTFS) desde `~/.claude/skills/<nombre-skill>` hacia `funcionalidades\<n>\skills\<nombre-skill>` — fuente única para editar en vivo, sin pasar por el cache de plugins. Recrear el orquestador:

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
