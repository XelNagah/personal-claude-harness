---
name: registrar-regla
description: Agrega, modifica o da de baja una regla del Propósito en .claude/conducta/, eligiendo un momento y una clase de acción compatibles y corriendo el lint. Use when el usuario pide asegurar un comportamiento en un momento del flujo, o al reubicar un Componente de Subsistema cuyo destino es Conducta.
---

# Registrar una regla

1. Leer `.claude/conducta/MANIFIESTO.md`, `README.md`, `MOMENTOS.md`, `MOMENTOS-LOCAL.md`, `CLASES.md` y **todos los Índices declarados por el manifiesto**.
2. Buscar una regla equivalente por intención y momento en ambos orígenes. Si una regla local ya la cubre, actualizarla en vez de duplicar. Si la cubre la Base, reportar `ya estaba` o `divergente`; nunca sombrearla con una copia local ni modificar la Base desde este flujo.
3. Elegir un momento existente de cualquiera de los dos registros. Si hace falta uno propio del repo, declararlo en `MOMENTOS-LOCAL.md`; nunca modificar `MOMENTOS.md`, que pertenece al Agente Multipropósito. El momento nuevo queda `declarado` hasta tener repartidor.
4. Elegir la clase mínima de las declaradas en `CLASES.md`: `Inyectar` cuando requiere juicio, `Ejecutar` cuando una Herramienta decide mecánicamente, `Controlar` cuando un Control decide (avisar o frenar); frenar solo si el falso positivo es imposible. Las clases **no son configurables**: agregar una fila a `CLASES.md` no hace que el repartidor la soporte.
5. Redactar la fila, que va en `INDICE-LOCAL.md` (el Índice del Agente Desplegado, que ya existe declarado); nunca modificar `INDICE.md`, que es del Agente Multipropósito. La fila lleva `Código | Nombre | Descripción | Momento | Clase | Contenido | Estado | Detalle`:
   - **Código** — `Local-NNNN`. **El mayor de ese Índice más uno**, nunca la cantidad de filas más uno: si alguna vez se retiró una regla, contar filas repite un código ya usado. Un código retirado deja un hueco y no se reusa.
   - **Nombre** — qué asegura, en una frase con verbo. **Descripción** — para qué existe, en una línea. **Contenido** — el dato que el hook consume: el texto a inyectar, o la ruta del programa a correr.
6. Una regla sin repartidor queda `pendiente`, no `vigente`.
7. Mostrar la fila —y la del momento, si se declara uno en `MOMENTOS-LOCAL.md`— con la forma de abajo, y esperar el visto bueno antes de escribir. Si toca terminología o decisiones canónicas, el visto bueno es además la ratificación del usuario. Una baja se muestra como fila modificada. Acá los tipos son `FILA DE REGLA` y `FILA DE MOMENTO`.

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

8. Escribir lo aprobado tal como se mostró.
9. Correr `node .claude/conducta/lint-conducta/lint-conducta.js`.

## Reconciliación

Inspeccionar antes de escribir. Reportar `agregado`, `ya estaba` y `divergente`. No pisar una regla divergente ni cablear un hook ambiguo sin confirmación.
