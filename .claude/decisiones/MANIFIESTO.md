# Decisiones — manifiesto de subsistema

Las decisiones **estructurales al propósito del repo** (no las operativas triviales) se asientan en `INDICE.md`: una tabla donde cada fila es una decisión (N°, qué + por qué, fecha, estado, y link a detalle si requiere conceptualización mayor).

**Índice: NO se carga siempre** (decisión 0017 — segundo registro más pesado) — **consultarlas al planificar y analizar** para no re-decidir ni contradecir. Al cerrar una tarea que registró decisiones, correr el lint desde la raíz del repo:

```bash
node .claude/decisiones/lint-decisiones/lint-decisiones.js
```

Convención en la memoria `feedback_decisiones.md`.
