# Gestión de planes

Instala el ciclo de **planes pendientes→ejecutados** del usuario: planes persistidos fuera del plan-mode efímero del harness, con trazabilidad de qué se planificó, cuándo se cerró y cómo se ejecutó.

## Qué agrega al repo destino

```
<config>/
├── CLAUDE.md          # se le asegura la sección "Planes del proyecto"
├── memory/
│   └── feedback_flujo_planes.md     # el ciclo completo, como memoria
└── planes/
    ├── planes-pendientes/
    └── planes-ejecutados/
```

- **`planes/`** — dos carpetas para el ciclo de vida. Nombre de plan: `AA-MM-DD - [Descripción corta].md`.
- **Memoria `flujo-planes`** — fuente de verdad del flujo: cuándo copiar a pendientes, cuándo mover a ejecutados, qué secciones agregar al cerrar.

## Dependencias

**`memoria-local`** — la memoria del flujo se guarda en `memory/`. Si no está instalada, instalarla primero.

## Formatos

| Formato | Archivo |
|---------|---------|
| Skill (Claude Code) | [`skills/inicializar-gestion-planes/SKILL.md`](skills/inicializar-gestion-planes/SKILL.md) + [`PLANTILLA.md`](skills/inicializar-gestion-planes/PLANTILLA.md) |
| Prompt agnóstico | [`prompt.md`](prompt.md) |
