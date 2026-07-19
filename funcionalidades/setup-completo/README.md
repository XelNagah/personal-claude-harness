# Setup completo (orquestador)

Instala de una sola pasada el **setup estándar completo** del usuario, orquestando las ocho funcionalidades de convención en orden. Conserva el skill histórico `inicializar-custom` y el junction homónimo.

Es la forma cómoda de arrancar un repo nuevo. Cada funcionalidad también se puede instalar suelta desde su propia carpeta.

## Qué agrega al repo destino

```
<config>/
├── CLAUDE.md          # Descripción + Preferencias (@import) + Mapa del repo (@imports) + Memoria + Planes + Conocimiento + Glosario + Decisiones + Scripts
├── settings.json      # hook SessionStart → lint-planes --quiet
├── preferencias/
│   └── PREFERENCIAS.md    # Base (harness vN) + Adaptaciones de este repo
├── memoria/
│   ├── MEMORIA.md
│   ├── feedback_flujo_planes.md
│   ├── feedback_artefacto_estado.md
│   ├── feedback_estilo_commits.md
│   ├── feedback_base_conocimiento.md
│   ├── feedback_glosario.md
│   ├── feedback_decisiones.md
│   └── feedback_scripts.md
├── planes/
│   ├── ESTADOS.md     # estados: Estado | Sentido | Carpeta | Terminal (fuente de verdad, la lee el lint)
│   ├── PLANES.md      # registro: Plan | Estado | Creado | Cerrado | Origen | Notas
│   ├── pendientes/
│   ├── ejecutados/
│   └── descartados/
├── conocimiento/
│   └── INDICE.md
├── glosario/
│   └── INDICE.md
├── decisiones/
│   └── INDICE.md
└── scripts/
    ├── INDICE.md
    ├── lint-preferencias/
    ├── lint-memoria/
    ├── lint-conocimiento/
    ├── lint-planes/
    ├── lint-glosario/
    ├── lint-decisiones/
    └── lint-scripts/
```

## Orden de orquestación

1. [`preferencias-trabajo`](../preferencias-trabajo/) — `CLAUDE.md` (Descripción) + `preferencias/PREFERENCIAS.md` (Base/Adaptaciones, `@import`) + lint.
2. [`memoria-local`](../memoria-local/) — `memoria/MEMORIA.md` + Mapa del repo + lint.
3. [`gestion-de-planes`](../gestion-de-planes/) — `planes/` (pendientes/ejecutados/descartados) + `ESTADOS.md` + `PLANES.md` + lint + hook `SessionStart`.
4. [`estilo-commits`](../estilo-commits/) — memoria de commits.
5. [`conocimiento`](../conocimiento/) — `conocimiento/INDICE.md` + lint (migra conocimiento disperso).
6. [`glosario`](../glosario/) — `glosario/INDICE.md` + lint.
7. [`decisiones`](../decisiones/) — `decisiones/INDICE.md` + lint.
8. [`scripts`](../scripts/) — `scripts/INDICE.md` + lint (ordena el cementerio de scripts).

Dependencias: 4–8 dependen de `memoria-local` (guardan memorias en `memoria/`). El orden las respeta.

## Formatos

| Formato | Archivo |
|---------|---------|
| Skill (Claude Code) | [`skills/inicializar-custom/SKILL.md`](skills/inicializar-custom/SKILL.md) + [`PLANTILLA.md`](skills/inicializar-custom/PLANTILLA.md) |
| Prompt agnóstico | [`prompt.md`](prompt.md) |

> **Duplicación intencional:** tanto por la isolation del junction como por el cache de plugins (cada plugin se copia y no puede leer afuera de su carpeta), el skill del orquestador no puede leer las carpetas de las piezas en runtime, así que repite los textos verbatim (memorias y bloques de preferencias). Al cambiar un texto, actualizar **la pieza y este orquestador**.
