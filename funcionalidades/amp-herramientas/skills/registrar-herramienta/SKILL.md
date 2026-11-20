---
name: registrar-herramienta
description: Registra o actualiza una Herramienta del Propósito en el Índice local de .claude/herramientas/, crea o reconcilia su ficha y verifica referencias por ruta. Use when se fabrica o adopta una tool repetible del Propósito, o al reubicar un Componente de Subsistema cuyo destino es Herramientas.
---

# Registrar una Herramienta

1. Leer `.claude/herramientas/MANIFIESTO.md`, `README.md` y **todos los Índices declarados por el manifiesto**.
2. Buscar por nombre y por finalidad en ambos orígenes. Si una fila local existente ya cubre la Herramienta, actualizarla en vez de duplicar. Si la cubre la Base, reportar `ya estaba` o `divergente`; nunca crear una copia local para sombrearla ni modificar la Base desde este flujo.
3. Determinar el tipo: `script`, `skill` local, `MCP` local, o `funcion` (código que no se ejecuta solo: lo requiere otro código, y vive en `.claude/common/`). Los lints y los hooks de un subsistema no se registran acá: vienen con su subsistema.
4. Antes de mover o renombrar algo, buscar su ruta en `settings`, `.gitignore`, hooks, documentación y scripts. Actualizar todas las referencias en el mismo cambio.
5. Redactar la fila, que va en `INDICE-LOCAL.md` (el Índice del Agente Desplegado, que ya existe declarado); nunca modificar `INDICE.md`, que es del Agente Multipropósito. La fila lleva `Código | Nombre | Descripción | Tipo | Cómo se invoca | Estado | Detalle`:
   - **Código** — `Local-NNNN`, porque el origen es el Agente Desplegado. El número es **el mayor de ese Índice más uno**, nunca la cantidad de filas más uno: si alguna vez se retiró una Herramienta, contar filas repite un código ya usado. Un código retirado deja un hueco y no se reusa.
   - **Nombre** — el nombre de la Herramienta, sin link. **Descripción** — qué hace, en una línea. **Detalle** — el link a donde vive.
6. Mostrar la fila y, si se crea o cambia, la ficha de la Herramienta (su `README.md`), con la forma de abajo, y esperar el visto bueno antes de escribir. Acá los tipos son `FILA DE HERRAMIENTA` y `PÁGINA DE HERRAMIENTA` (la ficha).

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

7. Escribir la fila en `INDICE-LOCAL.md` tal como se aprobó. Para un script local, asegurar `.claude/herramientas/<nombre>/README.md` y su archivo ejecutable. Para una skill o MCP, apuntar a su ubicación real.
8. Correr `node .claude/herramientas/lint-herramientas/lint-herramientas.js`.

## Reconciliación

Inspeccionar antes de escribir. Reportar `agregado`, `ya estaba` y `divergente`. No pisar una fila divergente ni una referencia ambigua sin confirmación.
