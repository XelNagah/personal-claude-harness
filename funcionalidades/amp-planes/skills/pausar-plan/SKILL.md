---
name: pausar-plan
description: Lleva un plan de Análisis o En curso a En pausa y guarda en su archivo el dato estado_a_retomar, para que al retomarlo vuelva exactamente a donde estaba. Use when hay que interrumpir temporalmente el análisis o la ejecución de un plan con intención de retomarlo, o el usuario dice "pausá esto".
---

# Pausar un plan

Interrumpe temporalmente un plan `Análisis` o `En curso` sin perder de dónde viene. El contrato de estados vive en `.claude/planes/ESTADOS.md`; la mecánica de toda transición —el archivo, la fila de `PLANES.md`, el encabezado— en el README del subsistema (`.claude/planes/README.md`).

`En pausa` es el **único** estado con el dato `estado_a_retomar`, que vive en el archivo del plan, no en el registro.

## Flujo

1. **Confirmar el origen**: solo se pausa desde `Análisis` o `En curso`.
2. **Escribir `estado_a_retomar`** en el encabezado del archivo del plan: la línea `**estado_a_retomar:** <estado>`, con el estado del que se pausa —solo `Análisis` o `En curso`—.
3. **Pasar a `En pausa`**: actualizar la fila en `.claude/planes/PLANES.md` y el encabezado. El archivo se queda en `pendientes/`.

## Cerrar con el lint

```bash
node .claude/planes/lint-planes/lint-planes.js
```

El lint verifica que `En pausa` lleve `estado_a_retomar` válido. Debe dar 0 hallazgos. Reportar la pausa y el estado al que se volverá.

## Reconciliación

Si el plan ya está `En pausa` con un `estado_a_retomar` válido, reportar `ya estaba` y no reescribir. Si está `En pausa` sin el dato, completarlo con el estado de origen que corresponda.
