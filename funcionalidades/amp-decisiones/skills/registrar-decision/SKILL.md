---
name: registrar-decision
description: Registra una decisión estructural en .claude/decisiones/ — juzga si es estructural, chequea que no re-decida ni contradiga lo asentado, numera, redacta qué+por qué, detalle solo si es compleja, lint. Use when se toma una decisión que condiciona el repo a futuro ("asentá la decisión", "registrá esto"), o al detectar en la conversación una decisión que se está por perder.
---

# Registrar una decisión

Asienta una decisión en el registro (`.claude/decisiones/INDICE.md`) sin ruido ni contradicciones. Los dos riesgos que esta skill elimina: decisiones estructurales que se pierden en la conversación, y el opuesto — llenar el registro de trivialidades operativas.

## Flujo

1. **Juzgar si es estructural.** El criterio del registro: ¿define cómo es o qué hace el repo en lo esencial, o elige un camino que **condiciona el trabajo futuro**? Las operativas triviales o efímeras ("usé tal flag", "busqué X") **no van**. Ante la duda: ¿esto condiciona el repo a futuro? Sí → va. No → no registrar (y decirlo).
2. **Chequear contra lo asentado.** Leer el registro:
   - ¿Ya está decidido igual? → no duplicar; reportar cuál la cubre.
   - ¿Contradice una vigente? → no pisar: la decisión nueva **reemplaza** — se agrega con estado `vigente` y la vieja pasa a `reemplazada por NNNN`. Nunca se borra ni se edita la vieja.
3. **Redactar la fila:**
   - **Código** — `Local-NNNN`, referencia estable. **El mayor del registro más uno**, nunca la cantidad de filas más uno: si alguna vez se retiró una decisión, contar filas repite un código ya usado. Un código retirado deja un hueco y no se reusa. En lo que queda escrito no va solo: se dice `Decisión Local-0042`.
   - **Nombre** — **qué se decidió**, escrito para entenderse leído solo, sin abrir la Descripción. Es una afirmación con sujeto concreto —qué cosa del repo queda fijada— y el verbo de lo que esa cosa pasa a hacer o a dejar de hacer. Cuando la decisión eligió entre alternativas, el nombre nombra también la descartada: *X hace A, no B*. **No** es el tema ni el área: «Gobernanza de terminología» o «Diseño del actualizador» dicen de qué se habló, no qué se resolvió, y obligan a leer la Descripción entera para saberlo. Único en el registro: es la clave práctica, la que se usa al hablar.
   - **Descripción** — qué se decidió **y por qué**, en una frase para las simples. Terminología del glosario y del usuario — ningún término acuñado por el agente se asienta sin ratificación.
   - **Fecha** — `AAAA-MM-DD` (absoluta).
   - **Estado** — `vigente`.
   - **Detalle** — link a `NNNN-nombre.md` **solo si** requiere conceptualización mayor (contexto, alternativas evaluadas, consecuencias); `—` si es simple.
4. **Confirmar con el usuario** antes de asentar (el registro es canónico): mostrar la fila propuesta y, si lleva, su página de detalle, con la forma de abajo, y esperar el ok. Si la nueva reemplaza a otra, mostrar también la fila vieja como modificada: le cambia el Estado. Acá los tipos son `FILA DE DECISIÓN` y `PÁGINA DE DETALLE DE DECISIÓN`.

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

5. **Cerrar con el lint** desde la raíz del repo:

   ```bash
   node .claude/decisiones/lint-decisiones/lint-decisiones.js
   ```

6. **Reportar**: número asignado, si reemplazó a otra, y el resultado del lint.

## Detección pasiva

Si en cualquier sesión se cristaliza una decisión estructural sin que nadie diga "registrala" (se eligió una arquitectura, se fijó una convención, se descartó un camino por una razón de fondo) → **ofrecer** registrarla en el momento, no acumular para el final.

## Reconciliación

Re-correr el flujo sobre la misma decisión consulta primero el registro: si ya está vigente, reportar `ya estaba`; si cambia el criterio, tratarlo como posible reemplazo y pedir ratificación. Nunca crear dos filas vigentes para el mismo tema ni pisar una divergencia.
