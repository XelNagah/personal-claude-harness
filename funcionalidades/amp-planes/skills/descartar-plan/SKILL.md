---
name: descartar-plan
description: Cierra un plan como Descartado — completa la fecha de cierre, escribe el motivo obligatorio en el archivo y lo mueve a descartados/. Use when un plan ya no se va a hacer, o el usuario dice "descartá este plan" o "esto ya no va".
---

# Descartar un plan

Cierra como `Descartado` un plan que no se hará. Descartar es un cierre válido, no un fracaso: deja registro de que se decidió no hacerlo y por qué. `Descartado` es terminal. El contrato de estados vive en `.claude/planes/ESTADOS.md`; la mecánica de la transición, en el README del subsistema (`.claude/planes/README.md`).

## Flujo

1. **Mover el archivo** a `descartados/` **sin renombrar** (mover = borrar de `pendientes/`; nunca duplicar).
2. **Actualizar la fila** en `.claude/planes/PLANES.md`: Estado `Descartado`, `Fecha de cierre`, y el Detalle con la ruta nueva. El Código y el Nombre no cambian nunca.
3. **Motivo obligatorio** en el archivo del plan, en una sección `## Notas de cierre` (p. ej. "reemplazado por tal plan"). El registro no lleva el motivo: lo largo va al archivo, que es su Detalle. Un plan abandonado sin decir por qué es un hallazgo del lint.

## Cerrar con el lint

```bash
node .claude/planes/lint-planes/lint-planes.js
```

El lint verifica que un descartado tenga fecha de cierre y sección `## Notas de cierre`. Debe dar 0 hallazgos. Reportar el descarte, el motivo y el resultado del lint.

## Reconciliación

Si el plan ya está `Descartado` con su motivo, reportar `ya estaba`. Si quedó en `descartados/` sin la sección de motivo, completarla en vez de dejar el cierre a medias.
