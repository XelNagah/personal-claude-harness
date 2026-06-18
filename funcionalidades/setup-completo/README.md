# Setup completo (orquestador)

Instala de una sola pasada el **setup estándar completo** del usuario, orquestando las cuatro funcionalidades en orden. Conserva el skill histórico `inicializar-custom` y el junction homónimo.

Es la forma cómoda de arrancar un repo nuevo. Cada funcionalidad también se puede instalar suelta desde su propia carpeta.

## Qué agrega al repo destino

```
<config>/
├── CLAUDE.md          # Descripción + Preferencias de comunicación + Principios de trabajo + Memoria y planes
├── memory/
│   ├── MEMORY.md
│   ├── feedback_flujo_planes.md
│   └── feedback_estilo_commits.md
└── planes/
    ├── planes-pendientes/
    └── planes-ejecutados/
```

## Orden de orquestación

1. [`preferencias-trabajo`](../preferencias-trabajo/) — crea el `CLAUDE.md` (Descripción + preferencias + principios).
2. [`memoria-local`](../memoria-local/) — sistema de memoria.
3. [`gestion-de-planes`](../gestion-de-planes/) — carpetas de planes + memoria del flujo.
4. [`estilo-commits`](../estilo-commits/) — memoria de commits.

## Formatos

| Formato | Archivo |
|---------|---------|
| Skill (Claude Code) | [`skills/inicializar-custom/SKILL.md`](skills/inicializar-custom/SKILL.md) + [`PLANTILLA.md`](skills/inicializar-custom/PLANTILLA.md) |
| Prompt agnóstico | [`prompt.md`](prompt.md) |

> **Duplicación intencional:** tanto por la isolation del junction como por el cache de plugins (cada plugin se copia y no puede leer afuera de su carpeta), el skill del orquestador no puede leer las carpetas de las piezas en runtime, así que repite los textos verbatim (memorias y bloques de preferencias). Al cambiar un texto, actualizar **la pieza y este orquestador**.
