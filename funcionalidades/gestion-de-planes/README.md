# Gestión de planes

Instala el ciclo de planes del usuario: **carpetas = ciclo de vida grueso** (`pendientes/` para los vivos, `ejecutados/` y `descartados/` como registro), **registro `PLANES.md` = lo fino** (estado, fechas de creación y cierre, origen) y **`ESTADOS.md` = juego de estados configurable** (máquina de un solo eje: `Nuevo · En curso · Diferido · Ejecutado · Descartado`, con su carpeta y si son terminales; el lint lo lee). Nombres de plan = slug estable sin fecha. Con `lint-planes` + hook de inicio de sesión como trigger mecánico — sin él, mover planes depende de acordarse y no se sostiene.

> **Subsistema de acumulación** — sigue el patrón índice + entradas + lint del harness ([cómo aprende](../../README.md#cómo-aprende)). Acá el índice es `PLANES.md` y las entradas son los planes en `pendientes/ejecutados/descartados/`.

## Qué agrega al repo destino

```
<config>/
├── CLAUDE.md          # sección "Planes del proyecto" + @planes/PLANES.md en el Mapa del repo
├── settings.json      # hook SessionStart → lint-planes --quiet
├── memoria/
│   ├── feedback_flujo_planes.md     # el ciclo completo, como memoria
│   └── feedback_artefacto_estado.md # estado vivo de exploraciones multi-variable
└── planes/
    ├── ESTADOS.md     # estados: Estado | Sentido | Carpeta | Terminal (fuente de verdad, la lee el lint)
    ├── PLANES.md      # registro: Plan | Estado | Creado | Cerrado | Origen | Notas
    ├── pendientes/
    ├── ejecutados/
    ├── descartados/
    └── lint-planes/   # lint del ciclo, data-driven desde ESTADOS.md (js + README)
```

- **`pendientes/`** aloja los planes vivos (`Nuevo`, `En curso`, `Diferido`); el estado exacto vive en el registro.
- **`ESTADOS.md`** define la máquina de un solo eje; para cambiar el juego de estados se edita esa tabla, no el lint.
- **Descartar es un cierre válido** — a `descartados/` con motivo (p. ej. superseded por otro plan).
- **Migración**: detecta el esquema de dos carpetas (`planes-pendientes/`/`planes-ejecutados/`, fecha en el nombre) y el de dos ejes (columna `Prioridad` foco/estacionado + estados viejos), y los convierte al de un eje, reparando referencias por ruta.

## Dependencias

**`memoria-local`** — las memorias del flujo se guardan en `memoria/`. Si no está instalada, instalarla primero.

## Formatos

| Formato | Archivo |
|---------|---------|
| Skill (Claude Code) | [`skills/inicializar-gestion-planes/SKILL.md`](skills/inicializar-gestion-planes/SKILL.md) + [`PLANTILLA.md`](skills/inicializar-gestion-planes/PLANTILLA.md) |
| Prompt agnóstico | [`prompt.md`](prompt.md) |
