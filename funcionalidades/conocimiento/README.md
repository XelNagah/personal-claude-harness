# Base de conocimiento

Instala la convención de **base de conocimiento** del usuario: una carpeta única donde vive todo lo que el agente sabe, más un **lint de integridad** que mantiene sano el grafo índice→páginas→referencias.

## Qué agrega al repo destino

```
<config>/
├── CLAUDE.md                              # sección "Base de conocimiento del proyecto"
├── conocimiento/
│   └── INDICE.md                          # índice raíz de la base (solo punteros)
├── memory/
│   └── feedback_base_conocimiento.md      # la convención, como memoria (+ índice)
└── scripts/
    └── lint-conocimiento/
        └── lint-conocimiento.js           # lint mecánico (sin LLM, sin red)
```

- **`conocimiento/`** — ubicación única y fija de todo el conocimiento del agente (documentos, estudios, temas, notas de dominio). Determinística: el lint y cualquier consulta saben dónde mirar sin heurística. La raíz del repo queda limpia.
- **`scripts/<tool>/`** — cada script de harness en su propia carpeta, nunca suelto en `scripts/` (que puede juntar decenas).
- **Lint** — chequea refs rotas, índice incompleto y huérfanos. Mecánico y gratis; se corre al cerrar tareas que escribieron conocimiento. El semántico (contradicciones, duplicación, staleness) queda a pedido.
- **Migración idempotente** — si el repo ya tiene conocimiento fuera de `conocimiento/` (en la raíz), la init lo **mueve** adentro y repara referencias.

## Dependencias

`memoria-local` (instala su convención como una memoria tipada e indexada).

## Formatos

| Formato | Archivo |
|---------|---------|
| Skill (Claude Code) | [`skills/inicializar-conocimiento/SKILL.md`](skills/inicializar-conocimiento/SKILL.md) |
| Prompt agnóstico | [`prompt.md`](prompt.md) |
