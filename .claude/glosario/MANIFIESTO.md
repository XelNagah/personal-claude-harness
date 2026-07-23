# Glosario — manifiesto de subsistema

La terminología del dominio vive en `INDICE.md`: una tabla de conceptos (nombre canónico, definición, y **términos por estado** —alias, propuestos, vetados— más link a una página de detalle si el concepto es complejo). Los alias válidos se **registran**; los términos confusos o ajenos al dominio se **vetan**. El agente solo **propone** (columna `Propuestos`); ratificar y vetar son potestad del usuario.

**Disparador:** consultar el glosario al planificar y analizar; no acuñar términos propios, preferir los del usuario. Proponer una entrada (columna `Propuestos`) al detectar un término del dominio sin registrar — toda entrada nueva pasa por el usuario (ratificación).

**Skills:** `converger-terminologia` (recorre el texto del repo contra el glosario: detecta sinónimos, anglicismos y desvíos, y propone ratificar, vetar o reescribir); instalación con `inicializar-glosario`.

**Índice: NO se carga siempre** — se consulta al planificar y analizar. Al cerrar una tarea que tocó el glosario, correr el lint desde la raíz del repo:

```bash
node .claude/glosario/lint-glosario/lint-glosario.js
```

Convención en la memoria `feedback_glosario.md`.
