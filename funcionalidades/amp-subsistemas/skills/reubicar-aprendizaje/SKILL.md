---
name: reubicar-aprendizaje
description: Recorre el Aprendizaje y coordina a los subsistemas dueños para proponer la reubicación de Componentes de Subsistema mal ubicados. Excluye infraestructura y duplicados Base antes de conversar: la confirmación de a uno por vez se reserva para contenido propio del Propósito. Use when se quiere vaciar Memoria, migrar contenido entre subsistemas, o revisar dónde debería vivir lo aprendido; nunca mueve ni parte un Componente de Subsistema de Aprendizaje sin confirmación del usuario.
---

# Reubicar Aprendizaje

Coordina una revisión transversal, sin registro persistente de propuestas. No es `amp:actualizar`: abre Aprendizaje y por eso requiere confirmación por cada Componente de Subsistema.

1. **Relevar el Aprendizaje — delegado en el subagente `relevador-de-aprendizaje`.** Inventariar exige recorrer el Aprendizaje entero —`.claude/memoria/` si existe y los documentos fuera de su casa— para quedarse con un puñado de datos de cada Componente de Subsistema: hecho en el hilo principal, todo lo que leyó queda ahí y se paga al modelo de la sesión. El subagente devuelve el inventario —fuente con archivo y línea, qué es, naturaleza aparente y las señales para filtrar—, más lo que parece Base o infraestructura. Es de solo lectura por construcción: trae la evidencia, no la reubicación.

   **Si el agente no puede delegar** (no tiene subagentes, o el tipo no está instalado), el relevamiento se hace en el hilo principal con el mismo criterio y el mismo resultado — lo que cambia es el costo, no el flujo.
2. **Filtrar antes de preguntar.** Excluir infraestructura Base y contenido Base ya cubierto por su destino actual. Cuando la invoca `amp:actualizar`, respetar su tabla de ocho memorias Base retiradas: esos Componentes de Subsistema se reconcilian automáticamente y no se presentan para confirmación. Si uno del Agente Multipropósito contiene una adición propia del repo, separar la adición y tratar solo esa parte como Aprendizaje.
3. Consultar al subsistema dueño de cada destino:
   - conocimiento: `amp-conocimiento:buscar-conocimiento`;
   - decisiones: `amp-decisiones:registrar-decision` para juzgar si una propuesta es estructural;
   - conducta: sus reglas y momentos;
   - preferencias: `amp-preferencias:registrar-preferencia`;
   - documentación de subsistema: el `README.md` de su carpeta.
4. Presentar **un Componente de Subsistema de Aprendizaje por vez**: fuente, destino recomendado, por qué, y si corresponde mover, sintetizar o partir. Lo que va a quedar escrito en el destino —la fila y la página resultantes— se muestra con la forma de abajo, con el tipo del destino (`FILA DE CONOCIMIENTO`, `PÁGINA DE DETALLE DE DECISIÓN`…). Esperar confirmación explícita.

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

5. Aplicar solo lo confirmado; reparar índices y referencias. No borrar el origen hasta que el destino esté completo.
6. Cerrar con los lints de cada subsistema tocado y un reporte `movido / sintetizado / dividido / descartado`.

## Reconciliación

Si se vuelve a correr, excluir Componentes de Subsistema ya reubicados y reconocer equivalentes por tema. Si una propuesta anterior quedó a medias, mostrar el estado real y pedir dirección; no duplicar contenido.
