# Memoria local

Instala el sistema de **memoria local persistida** del usuario: un directorio `memoria/` con un índice y un archivo `.md` por hecho, tipado con frontmatter. Es infraestructura base — otras funcionalidades (`gestion-de-planes`, `estilo-commits`) guardan sus memorias acá.

> **Subsistema de acumulación** — sigue el patrón índice + entradas + lint del harness ([cómo aprende](../../README.md#cómo-aprende)). Acá el índice es `MEMORIA.md`.

## Qué agrega al repo destino

```
<config>/
├── CLAUDE.md          # se le asegura la sección "Memoria del proyecto"
├── memoria/
│   └── MEMORIA.md      # índice (solo punteros, nunca contenido)
└── scripts/
    └── lint-memoria/
        └── lint-memoria.js   # lint mecánico (sin LLM, sin red)
```

- **`MEMORIA.md`** — índice cargado al inicio de cada sesión. Encabezado fijo + una línea por memoria (`- [Título](archivo.md) — resumen`).
- **Formato de memoria** — un `.md` por hecho con frontmatter `name` / `description` / `metadata.type` (`user` · `feedback` · `project` · `reference`). Para `feedback`/`project`, líneas `**Why:**` y `**How to apply:**`. Fechas siempre absolutas; antes de crear, deduplicar.
- **Lint** — chequea refs `.md`/wikilinks rotos, `MEMORIA.md` incompleto, huérfanos y frontmatter inválido. Mecánico y gratis; se corre al cerrar tareas que tocaron la memoria. El semántico (contradicción, duplicación, staleness) queda a pedido.

## Dependencias

Ninguna. Es la base de la que dependen `gestion-de-planes` y `estilo-commits`.

## Formatos

| Formato | Archivo |
|---------|---------|
| Skill (Claude Code) | [`skills/inicializar-memoria-local/SKILL.md`](skills/inicializar-memoria-local/SKILL.md) |
| Prompt agnóstico | [`prompt.md`](prompt.md) |
