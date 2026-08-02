# Título de sesión y momentos de disparo de la Pantalla de bienvenida

**Estado: Nuevo · Creado 26-07-25.** Origen: [Distribuir la Pantalla de bienvenida como funcionalidad](../ejecutados/Distribuir%20la%20Pantalla%20de%20bienvenida%20como%20funcionalidad.md), cerrado por decisión 0030 (la Pantalla viaja como Regla Base de `conducta`, no como plugin propio). Ese plan resolvió **que la Pantalla llegue** a todo Agente Multipropósito; acá quedan los dos ajustes que no son distribución.

## Qué falta

### 1. Título del repo en el encabezado de la sesión (`sessionTitle`)

Hoy el Título del repo aparece **dentro** de la caja de la Pantalla, que se ve una vez al arrancar y después se va con el hilo de la conversación. La idea es ponerlo también en el **encabezado de la sesión** (el campo `sessionTitle` del hook), que queda visible todo el tiempo. Ejemplo concreto: con 18 Agentes Multipropósito abiertos en ventanas distintas, hoy hay que subir hasta el arranque de cada una para saber cuál es cuál; con el Título en el encabezado se lee de un vistazo.

A resolver:

- Verificar qué agentes soportan el campo y qué hacen los que no (misma degradación documentada que `systemMessage` en la decisión 0012: Claude Code sí, Cursor no).
- Qué pone exactamente: ¿solo el Título, o Título + algo del Propósito? El Propósito es un párrafo — no entra.
- De dónde lo lee: hoy `identidad.md` es provisional en este repo, y el dato canónico lo define el plan [Identidad del Agente — Título y Propósito persistidos](Identidad%20del%20Agente%20-%20Titulo%20y%20Proposito%20persistidos.md). Arrancar tolerante a indefinido (`<sin definir>`), como ya hace la Pantalla.

### 2. En qué `source` dispara la Pantalla

El evento `SessionStart` trae un campo `source` que dice por qué arrancó la sesión: `startup` (sesión nueva), `clear` (`/clear`), `resume` (retomar una sesión guardada) y `compact` (la sesión se comprimió sola y sigue). Hoy la regla Base corre en **todos**, sin distinguir.

El caso que molesta es `compact`: pasa en el medio del trabajo, sin que el usuario haya pedido nada, y meter la caja de estado ahí interrumpe una tarea en curso con información que ya se mostró al arrancar. `resume` es discutible: el usuario vuelve después de un rato y el estado le sirve, pero ya vio esa pantalla en la sesión original.

A resolver: qué subconjunto de `source` dispara, y **dónde se declara** — hoy el momento `al arrancar la sesión` está definido en `MOMENTOS.md` como `SessionStart` **sin condición**, así que filtrar por `source` es agregarle una condición a un momento (mecánica de `conducta`, sin juicio: el `source` viene dado). Eso toca el vocabulario de momentos, no solo la Pantalla — chequear si otras reglas futuras querrían el mismo corte.

## Se cruza con

- [Identidad del Agente — Título y Propósito persistidos](Identidad%20del%20Agente%20-%20Titulo%20y%20Proposito%20persistidos.md) — dueño del dato del Título; el punto 1 lo consume, no lo define.
- [Crecer el subsistema conducta](Crecer%20el%20subsistema%20conducta.md) — el punto 2 es una condición sobre un momento existente; si ese plan reabre `MOMENTOS.md`, conviene resolver los dos juntos.
