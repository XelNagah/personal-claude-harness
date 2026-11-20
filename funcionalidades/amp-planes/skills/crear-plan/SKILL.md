---
name: crear-plan
description: Registra un plan nuevo en .claude/planes/ — escribe el documento con nombre estable, agrega su fila en PLANES.md en estado Nuevo y deja los enlaces consistentes. Use when el usuario dice "guardá este plan", "creá un plan", o hay que persistir una idea o un trabajo antes de arrancarlo.
---

# Crear un plan

Persiste un plan nuevo en `.claude/planes/`, en estado `Nuevo`. El plan nace sin analizar: el análisis es el paso siguiente (`analizar-plan`), no parte de crearlo.

El contrato de estados vive en `.claude/planes/ESTADOS.md`; la convención completa del ciclo, en el README del subsistema (`.claude/planes/README.md`). Esta skill solo abre.

## Flujo

1. **Redactar el documento**, que va en `.claude/planes/pendientes/<nombre-estable>.md`. **Nombre estable**: sin fecha, sin paréntesis (rompen los enlaces markdown), no cambia nunca aunque cambie el estado — el nombre del archivo es la identidad del plan. Encabezado: `**Estado: Nuevo · Creado <AA-MM-DD>.**` y el contexto del plan.
2. **Redactar la fila**, que va en `.claude/planes/PLANES.md`, al final de la tabla (las filas van en orden ascendente por Código):
   - **Código** — `Local-NNNN`, calculado como el **mayor del Índice más uno**, nunca la cantidad de filas más uno: si alguna vez se retiró un plan hay un hueco, y contar filas repite un código ya usado. Los huecos no se reusan.
   - **Nombre** — **qué va a hacer el plan**, escrito para entenderse leído solo: lo que el plan resuelve —qué va a hacer o qué va a existir cuando termine—, no el problema que lo originó, que va en la Descripción. Nunca el tema ni el área. Único en el Índice.
   - **Descripción** — el desarrollo del Nombre: qué problema resuelve y qué va a cambiar cuando esté hecho. Tiene que seguir siendo cierta dentro de dos meses, así que los conteos del estado actual y el caso puntual de la sesión van en el archivo, no en la celda.
   - **Estado** `Nuevo`, **Fecha de creación** (`AA-MM-DD`), **Fecha de cierre** en `—`, **Origen** si se desprende de otro plan, **Detalle** con el enlace al archivo.
3. **Mostrar el documento y la fila** con la forma de abajo, cada uno con su título, y esperar el visto bueno antes de escribir. Acá los tipos son `PÁGINA DE PLAN` y `FILA DE PLAN`.

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

4. **Escribir** el documento y la fila tal como se aprobaron.

## Cerrar con el lint

```bash
node .claude/planes/lint-planes/lint-planes.js
```

Debe dar 0 hallazgos. Reportar el plan creado, su Código y el resultado del lint.

## Reconciliación

Antes de crear, buscar un plan equivalente en el registro y en los archivos de `pendientes/`. Si ya existe, reportar `ya estaba` en vez de duplicar; si existe pero difiere, reportar `divergente` y no pisar. Conservar Código, Nombre y nombre de archivo de lo que ya esté.
