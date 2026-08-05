---
name: sugerir-siguiente-plan
description: Solo lectura. Reutiliza priorizar-planes y propone una única próxima acción — ejecutar un plan Listo, analizar un pendiente, o abrir una funcionalidad conveniente para planificar. Use when el usuario dice "qué hago ahora", "cuál sigue", o al arrancar una sesión sin tarea definida.
---

# Sugerir el siguiente plan

Solo lectura: propone **una sola** próxima acción y la fundamenta. Reutiliza `priorizar-planes` para ordenar y se queda con la punta.

## Flujo

1. **Priorizar** con `priorizar-planes` (no reimplementar los criterios acá).
2. **Elegir una única acción** de entre estas:
   - **Ejecutar** un plan `Listo` — el que quedó primero.
   - **Analizar** un plan pendiente con `analizar-plan`, si el mejor candidato todavía no está `Listo`.
   - **Retomar** un plan `En pausa` o `Diferido`, si eso destraba más que arrancar uno nuevo.
3. **Explicar la evidencia**: por qué esa y no otra, y qué dato podría cambiar la sugerencia.

## Reportar

Una acción, con su fundamento en una línea y el dato que la cambiaría. No ejecutar la acción ni tocar el registro: solo sugerir.

## Reconciliación

Es solo lectura y sin estado: re-correrla recalcula desde el registro actual. Nada que reconciliar.
