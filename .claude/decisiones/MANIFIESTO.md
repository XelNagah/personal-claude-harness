# Decisiones — manifiesto de subsistema

Las decisiones **estructurales al propósito del repo** (no las operativas triviales) se asientan en `INDICE.md`: una tabla donde cada fila es una decisión (N°, qué + por qué, fecha, estado, y link a detalle si requiere conceptualización mayor).

**Disparador:** consultar las decisiones al planificar y analizar, para no re-decidir ni contradecir lo asentado. Registrar al tomar una decisión que condiciona el repo a futuro; para revertir no se borra, se marca `reemplazada por NNNN`.

**Skills:** `registrar-decision` (juzga si es estructural, chequea que no re-decida ni contradiga, numera, redacta y corre el lint); instalación con `inicializar-decisiones`.

**Índice: NO se carga siempre** (decisión 0017 — segundo registro más pesado) — se consulta al planificar y analizar. Al cerrar una tarea que registró decisiones, correr el lint desde la raíz del repo:

```bash
node .claude/decisiones/lint-decisiones/lint-decisiones.js
```

Convención en la memoria `feedback_decisiones.md`.
