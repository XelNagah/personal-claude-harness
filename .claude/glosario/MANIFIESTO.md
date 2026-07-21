# Glosario — manifiesto de subsistema

La terminología del dominio vive en `INDICE.md`: una tabla de conceptos (nombre canónico, definición, alias registrados, y link a página de detalle si el concepto es complejo). Los alias se **registran, no se prohíben**.

**Índice: NO se carga siempre** (decisión 0017) — **consultarlo al planificar y analizar**. Toda entrada nueva pasa por el usuario (ratificación, decisión 0004). Al cerrar una tarea que tocó el glosario, correr el lint desde la raíz del repo:

```bash
node .claude/glosario/lint-glosario/lint-glosario.js
```

Convención en la memoria `feedback_glosario.md`.
