# amp

Plugin transversal del Agente Multipropósito.

## Skills

- `inicializar`: instala la Base completa en un repo nuevo o parcial.
- `actualizar`: nivela una instalación viva, migra nombres retirados y conduce reacomodos de Aprendizaje.
- `planificar`: contrasta un plan contra Semántica, Decisiones y Conocimiento.
- `info`: muestra identidad, métricas descubiertas y estado de lints.

`amp` depende de los ocho plugins de subsistema. En Codex, `actualizar-plugins --aplicar` los registra en orden antes de instalar el transversal.

La condición de cierre de `actualizar` es explícita: una instalación que todavía conserva `.claude/memoria/` no está al día. El flujo instala `subsistemas/`, coordina la reubicación pieza por pieza y vuelve a ejecutar el detector antes de cerrar.
