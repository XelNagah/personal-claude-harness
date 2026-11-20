---
name: agregar-subsistema
description: Agrega un subsistema del Propósito al catálogo y al disco siguiendo el Patrón. Use when un repo necesita una casa nueva para entradas, con índice, manifiesto, README, lint y habilidad de operación.
---

# Agregar subsistema

1. Confirmar que no existe un subsistema cuyo sentido cubra el caso.
2. Proponer nombre, propósito, entradas, índice, README, lint y habilidad de operación.
3. Redactar la fila del catálogo, que va en `SUBSISTEMAS-LOCAL.md`, el catálogo del Agente Desplegado (ya existe declarado); nunca en `SUBSISTEMAS.md`, que es del Agente Multipropósito. La fila lleva `Código | Nombre | Descripción | Operación | Detalle`:
   - **Código** — `Local-NNNN`, porque el origen es el Agente Desplegado. El número es **el mayor de ese catálogo más uno**, nunca la cantidad de filas más uno: si alguna vez se retiró un subsistema, contar filas repite un código ya usado. Un código retirado deja un hueco y no se reusa.
   - **Nombre** — el nombre del subsistema, que es también el de su carpeta.
   - **Descripción** — qué guarda, en una línea. **Operación** — las skills que lo operan. **Detalle** — el link a su casa.
4. Mostrar la fila y el manifiesto del subsistema nuevo con la forma de abajo, cada uno con su título, y esperar el visto bueno: aprobar la propuesta del paso 2 aprueba crearlo, no el texto con que queda. Acá los tipos son `FILA DE SUBSISTEMA` y `PÁGINA DE MANIFIESTO DE SUBSISTEMA`.

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

5. Con el visto bueno, crear la carpeta y registrar la fila tal como se mostró.
6. Cablear su manifiesto al punto de entrada y validar el catálogo y el subsistema.

## Reconciliación

Inspeccionar primero los dos catálogos y el disco. Si el subsistema ya existe completo, reportar `ya estaba`; si está a medio crear, agregar solo los Componentes ausentes y volver a validar; si nombre, propósito o estructura divergen, reportar `divergente` y no pisar sin confirmación.
