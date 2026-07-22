# Setup completo (orquestador)

Instala de una sola pasada el **setup estándar completo** del usuario, orquestando las ocho funcionalidades de convención en orden. Conserva el skill histórico `inicializar-custom` y sus junctions homónimos (dos tandas: `~/.claude/skills` y `~/.agents/skills`).

Es la forma cómoda de arrancar un repo nuevo. Cada funcionalidad también se puede instalar suelta desde su propia carpeta.

## Qué agrega al repo destino

```
<repo>/
├── AGENTS.md          # punto de entrada (fuente única): Descripción + Preferencias (@import) + Mapa del repo (@imports) + Memoria + Planes + Conocimiento + Glosario + Decisiones + Herramientas
├── CLAUDE.md          # adaptador para Claude Code: @AGENTS.md
├── .codex/
│   └── hooks.json     # hook SessionStart → lint-planes --quiet (Codex CLI)
└── .claude/
    ├── settings.json      # hook SessionStart → lint-planes --quiet (Claude Code)
    ├── preferencias/
    │   ├── PREFERENCIAS.md    # Base (harness vN) + Adaptaciones de este repo
    │   └── lint-preferencias/
    ├── memoria/
    │   ├── MEMORIA.md
    │   ├── feedback_flujo_planes.md
    │   ├── feedback_archivo_de_estado.md
    │   ├── feedback_estilo_commits.md
    │   ├── feedback_base_conocimiento.md
    │   ├── feedback_glosario.md
    │   ├── feedback_decisiones.md
    │   ├── feedback_herramientas.md
    │   └── lint-memoria/
    ├── planes/
    │   ├── ESTADOS.md     # estados: Estado | Sentido | Carpeta | Terminal (fuente de verdad, la lee el lint)
    │   ├── PLANES.md      # registro: Plan | Estado | Creado | Cerrado | Origen | Notas
    │   ├── pendientes/
    │   ├── ejecutados/
    │   ├── descartados/
    │   └── lint-planes/
    ├── conocimiento/
    │   ├── INDICE.md
    │   └── lint-conocimiento/
    ├── glosario/
    │   ├── INDICE.md
    │   └── lint-glosario/
    ├── decisiones/
    │   ├── INDICE.md
    │   └── lint-decisiones/
    └── herramientas/
        ├── INDICE.md
        └── lint-herramientas/
```

## Orden de orquestación

1. [`preferencias-trabajo`](../preferencias-trabajo/) — punto de entrada `AGENTS.md` (Descripción; `CLAUDE.md` = adaptador `@AGENTS.md`) + `preferencias/PREFERENCIAS.md` (Base/Adaptaciones, `@import`) + lint.
2. [`memoria-local`](../memoria-local/) — `memoria/MEMORIA.md` + Mapa del repo + lint.
3. [`gestion-de-planes`](../gestion-de-planes/) — `planes/` (pendientes/ejecutados/descartados) + `ESTADOS.md` + `PLANES.md` + lint + hook `SessionStart` con registro doble (`.claude/settings.json` + `.codex/hooks.json`).
4. [`estilo-commits`](../estilo-commits/) — memoria de commits.
5. [`conocimiento`](../conocimiento/) — `conocimiento/INDICE.md` + lint (migra conocimiento disperso).
6. [`glosario`](../glosario/) — `glosario/INDICE.md` + lint.
7. [`decisiones`](../decisiones/) — `decisiones/INDICE.md` + lint.
8. [`herramientas`](../herramientas/) — `herramientas/INDICE.md` (columna Tipo) + lint (ordena las herramientas desordenadas del Propósito; los lints de subsistema no van acá).

Dependencias: 4–8 dependen de `memoria-local` (guardan memorias en `memoria/`). El orden las respeta.

## Formatos

| Formato | Archivo |
|---------|---------|
| Skill (Claude Code) | [`skills/inicializar-custom/SKILL.md`](skills/inicializar-custom/SKILL.md) + [`PLANTILLA.md`](skills/inicializar-custom/PLANTILLA.md) |

> **Duplicación intencional:** tanto por la isolation del junction como por el cache de plugins (cada plugin se copia y no puede leer afuera de su carpeta), el skill del orquestador no puede leer las carpetas de las piezas en ejecución, así que repite los textos literales (memorias y bloques de preferencias). Al cambiar un texto, actualizar **la pieza y este orquestador**.
