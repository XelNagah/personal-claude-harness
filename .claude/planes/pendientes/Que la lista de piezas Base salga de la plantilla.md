# Que la lista de piezas Base salga de la plantilla

**Estado: Nuevo · Creado 26-07-26.** Origen: los dos arreglos al nivelador del 26/07/2026, que dejaron el problema resuelto pero no la causa.

## El problema

El detector del nivelador (`amp-actualizar.js`) sabe qué piezas Base tiene que haber porque **están escritas a mano en su código**: la lista de subsistemas, `HERRAMIENTAS_BASE`, las piezas de `conducta`, los tres eventos de hook, `identidad.md`. La plantilla de `amp:inicializar` tiene esa misma información, en otro formato.

Son **dos fuentes para el mismo dato**, y nada las mantiene sincronizadas. Cada pieza nueva que sume la plantilla hay que acordarse de agregarla también al detector — y si no, el nivelador informa "al día" un repo al que le falta. Ya pasó dos veces el mismo día:

- faltaba la Herramienta Base `actualizar-plugins` y el detector no la miraba;
- arreglado eso, faltaban cinco piezas de `conducta` y tampoco.

## La dirección

Que el detector **derive la lista de la plantilla** en vez de duplicarla. Abierto: cómo, sin volver frágil el acoplamiento — la plantilla es prosa con bloques de código, no una estructura de datos. Alternativas a evaluar: un manifiesto de piezas Base declarativo que la plantilla y el detector consuman los dos; o que el detector extraiga los nombres de archivo de los bloques de la plantilla.

## Mientras tanto

El cierre del 26/07/2026 mitiga el síntoma: `amp:inicializar` **no puede reportar sin correr el detector** y exigir cero pendientes. Eso ata las dos piezas por comportamiento, pero la duplicación del dato sigue.
