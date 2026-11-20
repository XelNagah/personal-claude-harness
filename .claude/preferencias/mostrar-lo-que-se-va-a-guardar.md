# Mostrar lo que se va a guardar, con su tipo como título

Elaboración de la Preferencia Base-0003 (Mostrar lo que se va a guardar, con su tipo como título, antes de escribir en un registro).

## Un bloque suelto obliga al usuario a adivinar qué está aprobando

Una fila mostrada como `| … | … |` no dice qué es cada celda, y «te muestro la página» no dice si es de un plan, de una Herramienta o de conocimiento. El usuario termina aprobando sin leer, o tiene que preguntar. Por eso el tipo va primero y destacado, y cada columna con su nombre.

## Las tres formas, con ejemplo

### Fila nueva

> ## **FILA DE HERRAMIENTA — NUEVA**
> Va a quedar en `.claude/herramientas/INDICE-LOCAL.md`.
>
> - **Código:** Local-0013
> - **Nombre:** …
> - **Descripción:** …

### Fila modificada

> ## **FILA DE DECISIÓN — MODIFICADA**
> Va a quedar en `.claude/decisiones/INDICE.md`.
>
> - **Estado:** antes `vigente` · ahora `reemplazada por Local-0043`
> - Sin cambios: Código, Nombre, Descripción, Fecha, Detalle.

### Página

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

Si se guardan varias cosas juntas —una fila y su página—, cada una lleva su propio título.

## Las habilidades de registro llevan la forma escrita entera

Cada habilidad que escribe en un registro trae esta misma forma en su paso de aprobación, no una remisión a esta Preferencia. La remisión («mostrala con la forma de la Preferencia Base-0003») obliga a ir a buscar la forma a otro lado, y ese paso es el que se saltea. Esta Preferencia es la red para los casos que no pasan por ninguna habilidad.

## Aprobar la acción no es aprobar el texto

Un «sí» a «¿lo registro?», o elegir un candidato de una lista, aprueba registrar. El texto exacto se muestra después, con esta forma, y se escribe tal como se aprobó.
