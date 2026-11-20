---
name: descartar-plan
description: Cierra un plan como Descartado — completa la fecha de cierre, escribe el motivo obligatorio en el archivo y lo mueve a descartados/. Use when un plan ya no se va a hacer, o el usuario dice "descartá este plan" o "esto ya no va".
---

# Descartar un plan

Cierra como `Descartado` un plan que no se hará. Descartar es un cierre válido, no un fracaso: deja registro de que se decidió no hacerlo y por qué. `Descartado` es terminal. El contrato de estados vive en `.claude/planes/ESTADOS.md`; la mecánica de la transición, en el README del subsistema (`.claude/planes/README.md`).

## Flujo

1. **Mostrar el descarte antes de tocar nada**, con la forma de abajo: la fila del plan modificada (Estado, Fecha de cierre, Detalle) y el documento modificado (la sección `## Notas de cierre` con el motivo, redactada como pide el paso 4), cada uno con su título, y esperar el visto bueno. Acá los tipos son `FILA DE PLAN` y `PÁGINA DE PLAN`.

<!-- forma-de-mostrar-lo-que-se-guarda: inicio -->
**Cómo se muestra lo que se va a guardar.** Antes de escribir, mostrarle al usuario lo que va a quedar escrito, con esta forma, y esperar su visto bueno. Un «sí» a «¿lo registro?» aprueba la acción, no un texto que el usuario no vio.

- **Lo primero, en una línea sola, es qué cosa se va a guardar**, como título en mayúsculas y negrita: `## **<TIPO> — NUEVA**` o `## **<TIPO> — MODIFICADA**`. El tipo dice la forma y de qué es: `FILA DE HERRAMIENTA`, `PÁGINA DE CONOCIMIENTO`, `PÁGINA DE DETALLE DE DECISIÓN`. Debajo, en qué archivo va a quedar. Nunca «la página», «la fila» o «el texto» a secas.
- **Fila nueva:** una línea por columna, con el nombre de la columna en negrita y la celda textual. Nunca la fila cruda `| … | … |`.
- **Fila modificada:** solo las columnas que cambian, cada una con su texto de antes y el de ahora —una celda larga va entera en los dos—; después se nombran las columnas que no cambian.
- **Página** (de conocimiento, de un plan, el detalle de una decisión): primero los datos del frontmatter, si los tiene, como lista igual que una fila nueva; después la lista de títulos de sección; después cada sección bajo su título, completa y renderizada, no dentro de un bloque de código. **Página modificada:** se nombran las secciones sin cambios y se muestran antes y ahora de las que cambian.
- Si se guardan varias cosas juntas —una fila y su página—, cada una lleva su propio título.

> ## **FILA DE HERRAMIENTA — NUEVA**
> Va a quedar en `.claude/herramientas/INDICE-LOCAL.md`.
>
> - **Código:** Local-0013
> - **Nombre:** …
> - **Descripción:** …

> ## **FILA DE DECISIÓN — MODIFICADA**
> Va a quedar en `.claude/decisiones/INDICE.md`.
>
> - **Estado:** antes `vigente` · ahora `reemplazada por Local-0043`
> - Sin cambios: Código, Nombre, Descripción, Fecha, Detalle.

> ## **PÁGINA DE CONOCIMIENTO — NUEVA**
> Va a quedar en `.claude/conocimiento/buscar-con-acentos.md`.
>
> **Datos de la página:**
> - **caduca:** no
>
> **Secciones:**
> 1. Qué pasa
> 2. Por qué
> 3. Cómo evitarlo
>
> **1. Qué pasa**
> …
<!-- forma-de-mostrar-lo-que-se-guarda: fin -->

2. **Mover el archivo** a `descartados/` **sin renombrar** (mover = borrar de `pendientes/`; nunca duplicar).
3. **Actualizar la fila** en `.claude/planes/PLANES.md`: Estado `Descartado`, `Fecha de cierre`, y el Detalle con la ruta nueva. El Código y el Nombre no cambian nunca.
4. **Motivo obligatorio** en el archivo del plan, en una sección `## Notas de cierre` (p. ej. "reemplazado por tal plan"). El registro no lleva el motivo: lo largo va al archivo, que es su Detalle. Un plan abandonado sin decir por qué es un hallazgo del lint.

## Cerrar con el lint

```bash
node .claude/planes/lint-planes/lint-planes.js
```

El lint verifica que un descartado tenga fecha de cierre y sección `## Notas de cierre`. Debe dar 0 hallazgos. Reportar el descarte, el motivo y el resultado del lint.

## Reconciliación

Si el plan ya está `Descartado` con su motivo, reportar `ya estaba`. Si quedó en `descartados/` sin la sección de motivo, completarla en vez de dejar el cierre a medias.
