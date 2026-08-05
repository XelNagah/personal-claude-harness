---
name: cerrar-plan
description: Cierra un plan como Ejecutado — completa la fecha de cierre, deja sus notas de implementación y lo mueve a ejecutados/. Use when un plan terminó, o al detectar evidencia de que un plan pendiente ya se implementó (un commit, un mensaje del usuario, código verificado).
---

# Cerrar un plan

Cierra como `Ejecutado` un plan que terminó. `Ejecutado` es terminal. El contrato de estados vive en `.claude/planes/ESTADOS.md`; la mecánica de la transición, en el README del subsistema (`.claude/planes/README.md`).

## Flujo

1. **Mover el archivo** a `ejecutados/` **sin renombrar** (mover = borrar de `pendientes/`; nunca duplicar).
2. **Actualizar la fila** en `.claude/planes/PLANES.md`: Estado `Ejecutado`, `Fecha de cierre`, y el Detalle con la ruta nueva. El Código y el Nombre no cambian nunca.
3. **Notas de implementación, obligatorias.** Revisar primero los encabezados del documento: si ya hay una sección de implementación (`## Implementación` o `## Notas de implementación`, con cualquier nivel), conservar su contenido y normalizar el título a `## Notas de implementación`. Solo si no existe, agregarla (cómo se implementó frente a lo planificado, hash de commit, cosas notables). Nunca crear una sección vacía que duplique notas previas.
4. **Actualizar el encabezado** del documento para que no contradiga al registro.

**Partir un plan a medias:** si el núcleo se hizo pero queda un cacho, cerrar como `Ejecutado` lo logrado y desprender el resto como plan nuevo con `crear-plan`, con `Origen` apuntando al cerrado — en vez de arrastrar un plan que dice `En curso` mientras en realidad espera.

## Cerrar con el lint

```bash
node .claude/planes/lint-planes/lint-planes.js
```

El lint verifica que un ejecutado tenga fecha de cierre y sección de implementación. Debe dar 0 hallazgos. Reportar el cierre y el resultado del lint.

## Reconciliación

Al ver evidencia de implementación de un plan todavía pendiente, proponer este cierre en vez de dejar un plan zombi. Si el plan ya está `Ejecutado` y consistente, reportar `ya estaba`.
