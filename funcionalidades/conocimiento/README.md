# Base de conocimiento

Instala la convención de **base de conocimiento** del usuario: una carpeta única donde vive todo lo que el agente sabe, más un **lint de integridad** que mantiene sanas las referencias índice → páginas.

> **Subsistema de acumulación** — sigue el patrón índice + entradas + lint del harness ([cómo aprende](../../README.md#cómo-aprende)). Acá el índice es `conocimiento/INDICE.md`.

## Qué agrega al repo destino

```
<config>/
├── CLAUDE.md                              # sección "Base de conocimiento del proyecto"
├── conocimiento/
│   ├── INDICE.md                          # índice raíz de la base (solo punteros)
│   └── lint-conocimiento/
│       └── lint-conocimiento.js           # lint mecánico (sin LLM, sin red)
└── memoria/
    └── feedback_base_conocimiento.md      # la convención, como memoria (+ índice)
```

- **`conocimiento/`** — ubicación única y fija de todo el conocimiento del agente (documentos, estudios, temas, notas de dominio). Determinística: el lint y cualquier consulta saben dónde mirar sin heurística. La raíz del repo queda limpia.
- **Tooling** — los scripts/tools del repo los gestiona la funcionalidad `herramientas` (cada uno en `herramientas/<tool>/`, nunca suelto); la migración de conocimiento reapunta los que muevan datos.
- **Lint** — chequea refs rotas, índice incompleto y huérfanos. Mecánico y gratis; se corre al cerrar tareas que escribieron conocimiento. El semántico (contradicciones, duplicación, staleness) queda a pedido.
- **Migración idempotente** — si el repo ya tiene conocimiento disperso, la init lo **mueve** adentro y repara referencias. Busca en tres lugares: la **raíz** del repo, **dentro de `memoria/`** (el caso más común: la memoria se desborda y termina siendo la base de conocimiento — se detecta por documentos sin frontmatter, largos, o un `README.md` haciendo de índice), y distingue las **fuentes crudas** (lo que el agente *lee*: escaneos, PDFs, exports) que **no** se mueven. Contempla secretos gitignoreados, índices parciales que heredan huérfanos, y el acople de scripts (`__dirname` / cwd).

## Dependencias

`memoria-local` (instala su convención como una memoria tipada e indexada).

## Formatos

## Skill operativa

**`buscar-conocimiento`** — de uso, no de instalación: recorre el repo buscando saber no asentado (docs sueltos, gotchas enterrados, lo aprendido en la sesión) y propone páginas — distingue conocimiento de agente de documentación del proyecto; nada se migra sin el usuario. Viaja en este plugin junto a la de instalación.

| Formato | Archivo |
|---------|---------|
| Skill de instalación (Claude Code) | [`skills/inicializar-conocimiento/SKILL.md`](skills/inicializar-conocimiento/SKILL.md) |
| Skill operativa (Claude Code) | [`skills/buscar-conocimiento/SKILL.md`](skills/buscar-conocimiento/SKILL.md) |
