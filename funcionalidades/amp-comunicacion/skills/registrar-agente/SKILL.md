---
name: registrar-agente
description: Registra o corrige un Agente Multipropósito Conocido en .claude/comunicacion/INDICE.md — otra instalación del Agente Multipropósito de la misma máquina, para poder consultarla. Pide nombre, propósito, directorio y CLI, valida que el directorio tenga su .claude/ y que el CLI sea soportado, y corre el lint. Use when el usuario dice "registrá este agente", "sumá esta instalación para consultarla", "conozco otro repo con el harness".
---

# Registrar un Agente Multipropósito Conocido

Da de alta en el registro (`.claude/comunicacion/INDICE.md`) otra instalación del Agente Multipropósito de la misma máquina, para poder preguntarle algo después con `preguntar` o pedirle que haga algo con `resolver`. **Solo se registran otras instalaciones del Agente Multipropósito**, no agentes cualquiera: se reconocen porque tienen su `.claude/` con el harness instalado.

Para saber cuáles hay en la máquina sin buscarlas a mano, está `buscar-agentes`: las encuentra y trae ya cargados el directorio, el CLI, el Título y el Propósito de cada una.

## El registro es Aprendizaje local

El Índice guarda **rutas absolutas de máquina**, así que **no se commitea**: en un Agente Desplegado está gitignoreado y sus filas son Aprendizaje local de esa máquina. Registrar acá no toca nada que viaje.

## Flujo

1. **Reunir los cuatro datos.** Preguntar lo que falte:
   - **Nombre** — cómo se lo va a nombrar al consultarlo. Único en el Índice, sin distinguir mayúsculas.
   - **Propósito** — el Propósito de esa instalación, en una línea: para saber qué tiene sentido preguntarle. Si el directorio tiene `.claude/identidad.md`, se puede leer de ahí y confirmarlo.
   - **Directorio** — la ruta absoluta de su carpeta (la que contiene su `.claude/`).
   - **CLI** — `claude` (Claude Code) o `codex` (Codex CLI). Decide cómo se arma el comando en cualquier Modo de Comunicación.
2. **Validar antes de escribir.**
   - El **Directorio** existe y contiene un `.claude/`. Si no, no es un Agente Multipropósito o la ruta está mal: no registrar y decirlo.
   - El **CLI** es uno soportado (`claude` o `codex`). El mecanismo no sabe armar la invocación de otro: no registrar y decirlo.
   - El **Nombre** no está ya en el Índice. Si está: es corrección, no alta → actualizar esa fila, no crear otra.
3. **Asignar el Código** — `Local-NNNN`, el mayor del Índice más uno (nunca la cantidad de filas más uno: un código retirado deja un hueco y no se reusa). Si el Índice está vacío, `Local-0001`.
4. **Confirmar la fila** — mostrarla con la forma de abajo, una línea por columna (Código, Nombre, Propósito, Directorio, CLI), y esperar el ok antes de escribir. Una corrección se muestra como fila modificada. Acá el tipo es `FILA DE AGENTE MULTIPROPÓSITO CONOCIDO`.

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

5. **Escribir** la fila en la tabla de `INDICE.md`, tal como se aprobó.
6. **Cerrar con el lint** desde la raíz del repo:

   ```bash
   node .claude/comunicacion/lint-comunicacion/lint-comunicacion.js
   ```

7. **Reportar**: el Código asignado (o la fila corregida) y el resultado del lint.

## Reconciliación

Re-correr sobre el mismo agente consulta primero el Índice por Nombre: si ya está con los mismos datos, reportar `ya estaba`; si cambió algún dato (se mudó el directorio, cambió el CLI), actualizar esa fila. Nunca crear dos filas con el mismo Nombre ni pisar una divergencia sin avisar.
