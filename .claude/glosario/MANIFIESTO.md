# Glosario — manifiesto de subsistema

La terminología del dominio vive en `INDICE.md`: una tabla de conceptos (nombre canónico, definición, y **términos por estado** —alias, propuestos, vetados— más link a una página de detalle si el concepto es complejo). Los alias válidos se **registran**; los términos confusos o ajenos al dominio se **vetan**. El agente solo **propone** (columna `Propuestos`); ratificar y vetar son potestad del usuario (decisión 0004).

**Índice: NO se carga siempre** (decisión 0017) — **consultarlo al planificar y analizar**. Toda entrada nueva pasa por el usuario (ratificación, decisión 0004). Al cerrar una tarea que tocó el glosario, correr el lint desde la raíz del repo:

```bash
node .claude/glosario/lint-glosario/lint-glosario.js
```

Convención en la memoria `feedback_glosario.md`.
