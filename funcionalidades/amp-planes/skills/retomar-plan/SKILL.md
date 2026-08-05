---
name: retomar-plan
description: Saca un plan de En pausa y lo devuelve exactamente al estado guardado en estado_a_retomar (Análisis o En curso), borrando ese dato. Use when hay que retomar un plan que estaba pausado, o el usuario dice "seguimos con esto" sobre un plan En pausa.
---

# Retomar un plan

Devuelve un plan `En pausa` al estado del que se pausó. El contrato de estados vive en `.claude/planes/ESTADOS.md`; la mecánica de la transición, en el README del subsistema (`.claude/planes/README.md`).

## Flujo

1. **Leer `estado_a_retomar`** del encabezado del archivo del plan: su valor es `Análisis` o `En curso`.
2. **Volver a ese estado exacto**: actualizar la fila en `.claude/planes/PLANES.md` y el encabezado del documento con ese estado.
3. **Borrar la línea `estado_a_retomar`** del encabezado: ningún estado que no sea `En pausa` la lleva.

## Cerrar con el lint

```bash
node .claude/planes/lint-planes/lint-planes.js
```

El lint verifica que el dato `estado_a_retomar` no quede en un estado que no sea `En pausa`. Debe dar 0 hallazgos. Reportar el estado al que volvió el plan.

## Reconciliación

Si el plan ya salió de `En pausa` y no tiene el dato, reportar `ya estaba`. Si quedó a medias —fuera de `En pausa` pero con la línea todavía escrita—, borrarla.
