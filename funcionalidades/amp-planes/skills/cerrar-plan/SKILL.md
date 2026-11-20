---
name: cerrar-plan
description: Cierra un plan como Ejecutado — completa la fecha de cierre, deja sus notas de implementación y lo mueve a ejecutados/. Use when un plan terminó, o al detectar evidencia de que un plan pendiente ya se implementó (un commit, un mensaje del usuario, código verificado).
---

# Cerrar un plan

Cierra como `Ejecutado` un plan que terminó. `Ejecutado` es terminal. El contrato de estados vive en `.claude/planes/ESTADOS.md`; la mecánica de la transición, en el README del subsistema (`.claude/planes/README.md`).

## Flujo

1. **Mostrar el cierre antes de tocar nada**, con la forma de abajo: la fila del plan modificada (Estado, Fecha de cierre, Detalle) y el documento modificado (las notas de implementación, redactadas como pide el paso 4, y el encabezado), cada uno con su título, y esperar el visto bueno. Acá los tipos son `FILA DE PLAN` y `PÁGINA DE PLAN`.

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

2. **Mover el archivo** a `ejecutados/` **sin renombrar** (mover = borrar de `pendientes/`; nunca duplicar).
3. **Actualizar la fila** en `.claude/planes/PLANES.md`: Estado `Ejecutado`, `Fecha de cierre`, y el Detalle con la ruta nueva. El Código y el Nombre no cambian nunca.
4. **Notas de implementación, obligatorias.** Revisar primero los encabezados del documento: si ya hay una sección de implementación (`## Implementación` o `## Notas de implementación`, con cualquier nivel), conservar su contenido y normalizar el título a `## Notas de implementación`. Solo si no existe, agregarla (cómo se implementó frente a lo planificado, hash de commit, cosas notables). Nunca crear una sección vacía que duplique notas previas.
5. **Actualizar el encabezado** del documento para que no contradiga al registro.

**Partir un plan a medias:** si el núcleo se hizo pero queda un cacho, cerrar como `Ejecutado` lo logrado y desprender el resto como plan nuevo con `crear-plan`, con `Origen` apuntando al cerrado — en vez de arrastrar un plan que dice `En curso` mientras en realidad espera.

## Cerrar con el lint

```bash
node .claude/planes/lint-planes/lint-planes.js
```

El lint verifica que un ejecutado tenga fecha de cierre y sección de implementación. Debe dar 0 hallazgos. Reportar el cierre y el resultado del lint.

## Reconciliación

Al ver evidencia de implementación de un plan todavía pendiente, proponer este cierre en vez de dejar un plan zombi. Si el plan ya está `Ejecutado` y consistente, reportar `ya estaba`.
