# Que la lista de piezas Base salga de la plantilla

**Estado: Nuevo · Creado 26-07-26.** Origen: los dos arreglos al nivelador del 26/07/2026, que dejaron el problema resuelto pero no la causa.

## El problema

El detector del nivelador (`amp-actualizar.js`) sabe qué piezas Base tiene que haber porque **están escritas a mano en su código**: la lista de subsistemas, `HERRAMIENTAS_BASE`, las piezas de `conducta`, los tres eventos de hook, `identidad.md`. La plantilla de `amp:inicializar` tiene esa misma información, en otro formato.

Son **dos fuentes para el mismo dato**, y nada las mantiene sincronizadas. Cada pieza nueva que sume la plantilla hay que acordarse de agregarla también al detector — y si no, el nivelador informa "al día" un repo al que le falta. Ya pasó dos veces el mismo día:

- faltaba la Herramienta Base `actualizar-plugins` y el detector no la miraba;
- arreglado eso, faltaban cinco piezas de `conducta` y tampoco.

## La dirección

Que el detector **derive la lista de la plantilla** en vez de duplicarla. Abierto: cómo, sin volver frágil el acoplamiento — la plantilla es prosa con bloques de código, no una estructura de datos. Alternativas a evaluar: un manifiesto de piezas Base declarativo que la plantilla y el detector consuman los dos; o que el detector extraiga los nombres de archivo de los bloques de la plantilla.

## Tercera vez, 26/07/2026 — y esta vez sobre un consumidor real

El Agente-Coordinador corrió `amp:actualizar` con `amp` 0.6.18 y reportó **«Repo al día: nada para nivelar»**, con los 7 subsistemas en `ya estaba`. Era falso: le faltaban las cuatro piezas del control de terminología del momento `al escribir` (la Herramienta `detectar-terminologia-vetada/`, su Regla Base, la condición ampliada del momento, y el `PreToolUse` de Codex). El agente de allá lo diagnosticó solo cuando el usuario desconfió: *«el script clasifica por presencia de piezas, no compara contenido»*.

Lo que agrava el caso frente a las dos veces anteriores: acá **el mitigante de comportamiento no alcanzó**. `amp:inicializar` no puede reportar sin que el detector dé cero, pero el detector **dio cero**, así que el nivelador se declaró al día y nadie volvió a mirar. Es el modo de falla que el propio `SKILL.md` advierte —*«el repo se informa al día mientras le falta la mitad del cableado»*— ocurriendo en el nivelador y no en el instalador.

**Arreglado a mano** (`amp` 0.6.19): las cuatro piezas se sumaron al detector, y de paso se cerró un hueco que no era de esta lista — el nivelador **nunca miraba `.codex/hooks.json`**, así que el cableado de Codex no se nivelaba en ningún consumidor. Verificado con un fixture en el estado anterior: pasó de 0 hallazgos a 4.

## Cuarta vez, 27/07/2026 — y el defecto de fondo era otro

Con `amp` 0.6.19 el Coordinador **volvió a decir «nada para nivelar»**, y el agente de allá dio con la causa real: *«el script solo chequea que las piezas **existan**, no que su contenido esté al día»*. Es un defecto distinto y más grande que el de esta lista: el detector usaba `existe()` para **todos** los scripts Base, así que un consumidor que ya tenía `establecer-conducta.js` en su versión vieja se lo quedaba para siempre. **Ningún consumidor recibía nunca una mejora a un script ya instalado** — solo piezas nuevas. Por eso el Coordinador tenía las piezas (se las había instalado la corrida anterior) y seguía sin lo de esta sesión.

**Arreglado** (`amp` 0.6.20): el detector compara el **contenido** de los once scripts Base contra el bloque de la PLANTILLA, que es la fuente, ubicándolo por un ancla. Verificado con fixture: un repartidor con una línea cambiada y un lint con una línea de menos salen como `contenido viejo`.

De paso apareció una lección para esta lista: **seis de las once anclas no ubicaban su bloque, y el chequeo se salteaba en silencio** — el mismo modo de falla, un nivel más adentro. Ahora, cuando no encuentra la fuente, lo reporta como divergente en vez de callarse. **La regla que sale de las cuatro veces: un chequeo que no puede mirar tiene que decirlo, nunca devolver cero.**

## Mientras tanto

El cierre del 26/07/2026 mitiga el síntoma: `amp:inicializar` **no puede reportar sin correr el detector** y exigir cero pendientes. Eso ata las dos piezas por comportamiento, pero la duplicación del dato sigue —y la tercera vez probó que el mitigante no cubre al nivelador, donde el cero del detector **es** la conclusión.
