---
name: diferir-plan
description: Lleva un plan vivo a Diferido — pospuesto a propósito para revisarlo más adelante, del que se vuelve siempre a Análisis. Acepta "suspender" como disparador. Use when el usuario dice "dejá esto para más adelante", "diferí este plan" o "suspendelo".
---

# Diferir un plan

Pospone a propósito un plan vivo (`Nuevo`, `Análisis`, `Listo`, `En curso` o `En pausa`). Un plan `Diferido` vuelve siempre a `Análisis`, nunca directo a `Listo` ni a `En curso`: el tiempo pasado obliga a re-contrastar. El contrato de estados vive en `.claude/planes/ESTADOS.md`; la mecánica de la transición, en el README del subsistema (`.claude/planes/README.md`).

## Flujo

1. **Pasar a `Diferido`**: actualizar la fila en `.claude/planes/PLANES.md` y el encabezado del documento. El archivo se queda en `pendientes/`.
2. **Si venía de `En pausa`, borrar `estado_a_retomar`** del encabezado: un diferido no vuelve al estado pausado, vuelve a `Análisis`.
3. **Anotar la condición de reanudación** en el documento, si la hay (p. ej. "retomar cuando termine tal medición").

## Cerrar con el lint

```bash
node .claude/planes/lint-planes/lint-planes.js
```

Debe dar 0 hallazgos. Reportar el plan diferido y su condición de reanudación si se anotó.

## Reconciliación

Si el plan ya está `Diferido`, reportar `ya estaba`. Verificar que no haya quedado con `estado_a_retomar` de una pausa previa; si quedó, borrarlo.
