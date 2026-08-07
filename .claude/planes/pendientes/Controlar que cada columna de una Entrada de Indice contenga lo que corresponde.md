# Controlar que cada columna de una Entrada de Índice contenga lo que corresponde

**Estado: Nuevo · Creado 26-08-07.** Origen: se desprende del plan Local-0095 (que las habilidades se disparen solas), al registrar la Decisión Local-0062 — su título salió dos veces como una afirmación antes de nombrar la decisión.

## El problema

En un Índice de Subsistema cada columna tiene que contener su aspecto de la Entrada. El **Nombre** tiene que nombrar qué es la Entrada según la convención de su encabezado; una afirmación verdadera no sirve de título: «El cielo es azul» es verdadera y no dice qué se decidió. Pasó de verdad al asentar la Decisión Local-0062: el título salió primero como premisa («la conversación cuesta atención»), no como la decisión que se tomó, y hubo que reescribirlo dos veces.

Ningún control lo caza hoy:

- El **lint** es mecánico: longitud de la Descripción, referencias, huecos de numeración, forma de la tabla. No juzga si el Nombre nombra la Entrada.
- El subsistema **semántica** marca términos vetados, pero un título mal formado no usa términos vetados, y un registro informal («fuga», «se cuela») tampoco los usa — son metáforas, no anglicismos.

## El objetivo

Un control de que cada columna de una Entrada de Índice contenga lo que su convención pide, con foco en el Nombre/título: que se ponga lo que se tiene que poner, no cualquier cosa.

## Lo que ya existe (no reinventar)

- Cada encabezado de Índice **ya declara** qué va en Nombre y en Descripción (Decisión Local-0042): decisiones pide «qué se decidió y por qué»; herramientas, «el flag/modo que cambia el resultado»; conocimiento, «lo suficiente para decidir si vale abrirla». Es texto declarativo, ninguna habilidad lo ejecuta como chequeo.
- La habilidad `converger-terminologia` barre un texto contra el glosario y la Terminología Farlopa — cubre la mitad de terminología, pero no está cableada al registro.
- El Contraste automático (glosario Local-0036, Decisión Local-0062) ya trae al contexto las filas de semántica y decisiones que tocan el turno.

## El hueco

- Que el **Nombre** nombre la Entrada según su convención, no una afirmación ni una premisa.
- El **registro formal** de la Descripción: sin metáforas informales.

## Restricciones de diseño (relevadas el 07/08/2026)

- El punto donde conviene revisar —**antes de mostrar el texto exacto y ratificar**— **no es un momento de conducta**: los momentos son eventos de hook (SessionStart, PreToolUse…), y esto es un paso interno del flujo de una habilidad de registro. Vive en el flujo, no en conducta.
- **No duplicar el texto** en las siete habilidades de registro (conocimiento Base-0001, Local-0016): ya re-tipean la regla de asignación de Código ocho veces; sumar un checklist copiado repite esa deuda.
- El chequeo «¿el Nombre nombra la Entrada o es una afirmación?» es de **juicio, no mecánico** — como el reparto de semántica: la máquina puede marcar, el agente juzga.

## A decidir en el análisis

- ¿El control es mecánico (lint), de juicio (paso en el flujo / regla), o mixto?
- Dónde vive el fragmento compartido sin copiarlo en las siete habilidades.
- Alcance: todos los Índices, o arranca por decisiones —donde el Nombre más tiende a salir como afirmación— y se extiende.

## Planes relacionados

- [Que las habilidades se disparen solas al plantear un tema](Que%20las%20habilidades%20se%20disparen%20solas%20al%20plantear%20un%20tema.md) (Local-0095) — de donde se desprende: el Contraste automático que ese plan construyó es parte de lo que ya existe acá.
