---
name: analizar-plan
description: Trabaja sobre un plan ya persistido y lo mueve por el estado Análisis hasta Listo si corresponde, reutilizando amp:planificar para interrogarlo contra la sabiduría del repo. Use when hay que analizar, delimitar o afinar un plan pendiente antes de ejecutarlo, o el usuario dice "analizá este plan".
---

# Analizar un plan

Lleva un plan de `Nuevo` (o de vuelta desde `Diferido`) a `Análisis`, lo interroga a fondo, y lo deja en `Listo` cuando está suficientemente definido para ejecutar. El contrato de estados vive en `.claude/planes/ESTADOS.md`.

Esta skill **no reimplementa el análisis**: reutiliza `amp:planificar`, que interroga el plan contra semántica, decisiones y conocimiento, y actualiza esas bases sobre la marcha. Acá se agrega solo el movimiento de estado del plan persistido.

## Flujo

1. **Pasar a `Análisis`**: actualizar la fila del plan en `.claude/planes/PLANES.md` y el encabezado del documento. El archivo se queda en `pendientes/` (todos los estados vivos comparten carpeta).
2. **Correr `amp:planificar`** sobre el plan: recorrer el árbol de decisión, resolver lo averiguable, registrar términos y decisiones que se cristalicen. Volcar el acuerdo al documento del plan: antes de escribirlo, mostrar el documento modificado con la forma de abajo y esperar el visto bueno. Acá el tipo es `PÁGINA DE PLAN`; el cambio de Estado de la fila es la transición que se pidió y no hace falta mostrarlo.

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

3. **Decidir el estado de salida**:
   - Suficientemente definido para ejecutar → **`Listo`**.
   - Falta trabajo o se corta la sesión → dejar en `Análisis` o `pausar-plan`.
   - Se pospone a propósito → `diferir-plan`. Ya no sirve → `descartar-plan`.

## Cerrar con el lint

```bash
node .claude/planes/lint-planes/lint-planes.js
```

Reportar el estado en que quedó el plan, los términos y decisiones que se registraron, y el resultado del lint.

## Reconciliación

Al retomar un análisis a medias, volver a cargar la sabiduría del repo y el estado actual del plan; continuar desde la primera cuestión sin resolver y reportar como `ya estaba` lo que el repo ya incorporó. No reabrir decisiones ya ratificadas.
