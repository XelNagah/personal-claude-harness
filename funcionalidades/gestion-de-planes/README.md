# Gestión de planes

Instala el ciclo de planes del usuario: **carpetas = ciclo de vida grueso** (`pendientes/` como backlog amplio, `ejecutados/` y `descartados/` como registro), **registro `PLANES.md` = lo fino** (prioridad foco/estacionado, estado, fechas de creación y cierre, origen). Nombres de plan = slug estable sin fecha. Con `lint-planes` + hook de inicio de sesión como trigger mecánico — sin él, mover planes depende de acordarse y no se sostiene.

## Qué agrega al repo destino

```
<config>/
├── CLAUDE.md          # sección "Planes del proyecto" + @planes/PLANES.md en el Mapa del repo
├── settings.json      # hook SessionStart → lint-planes --quiet
├── memory/
│   ├── feedback_flujo_planes.md     # el ciclo completo, como memoria
│   └── feedback_artefacto_estado.md # estado vivo de exploraciones multi-variable
├── planes/
│   ├── PLANES.md      # registro: Plan | Prioridad | Estado | Creado | Cerrado | Origen | Notas
│   ├── pendientes/
│   ├── ejecutados/
│   └── descartados/
└── scripts/
    └── lint-planes/   # lint del ciclo (js + README)
```

- **`pendientes/`** es backlog amplio: planes en foco y estacionados conviven; la prioridad vive en el registro.
- **Descartar es un cierre válido** — a `descartados/` con motivo (p. ej. superseded por otro plan).
- **Migración**: detecta el esquema viejo (`planes-pendientes/`/`planes-ejecutados/`, fecha en el nombre) y lo convierte, reparando referencias por ruta.

## Dependencias

**`memoria-local`** — las memorias del flujo se guardan en `memory/`. Si no está instalada, instalarla primero.

## Formatos

| Formato | Archivo |
|---------|---------|
| Skill (Claude Code) | [`skills/inicializar-gestion-planes/SKILL.md`](skills/inicializar-gestion-planes/SKILL.md) + [`PLANTILLA.md`](skills/inicializar-gestion-planes/PLANTILLA.md) |
| Prompt agnóstico | [`prompt.md`](prompt.md) |
