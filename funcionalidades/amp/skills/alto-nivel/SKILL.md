---
name: alto-nivel
description: Frena la discusión y la vuelve a explicar desde arriba — qué mecanismo ya existe y funciona, qué problema concreto se está resolviendo, y cuál es el cambio mínimo. Sin códigos de registro, sin jerga interna, sin alternativas de más. Use when el usuario dice "alto nivel", "zoom out", "me perdí", "no entiendo nada", "me estás enquilombando", "explicame el panorama", "de qué estamos hablando"; o al detectar que la conversación se llenó de nombres propios del repo, que las últimas respuestas discutieron detalles sin haber dicho de qué mecanismo son parte, o que el usuario preguntó dos veces lo mismo.
---

# alto-nivel — volver a explicar desde arriba

Esta habilidad existe porque el modo de falla es frecuente y agota al usuario: la conversación entra en el detalle de una parte y nunca dice de qué mecanismo es parte, y encima lo hace citando nombres y códigos internos que el usuario no tiene por qué recordar. El resultado es que el usuario no puede decidir, porque no le queda claro qué está en juego.

**Se dispara sola.** No hay que esperar a que el usuario la pida: si notás que estás discutiendo el detalle sin haber dicho cuál es el mecanismo, o que el usuario volvió a preguntar algo que ya se explicó, invocala.

## Qué hacer

Escribir **una sola respuesta** con estas cuatro partes, en este orden y con estos nombres:

1. **Cómo funciona hoy.** El mecanismo que ya existe y ya anda, en no más de cinco líneas. Si tiene pasos encadenados, un esquema de flechas ayuda más que un párrafo. Arrancar por acá siempre: lo que el usuario perdió es el marco, no el detalle.
2. **El problema.** Qué está roto o qué falta, numerado, con una línea cada uno. Solo los problemas reales que motivaron la discusión, no los que aparecieron por el camino.
3. **El cambio mínimo.** Para cada problema, lo más chico que lo resuelve. Si algo ya está hecho, decirlo.
4. **Lo que sobra.** Lo que se propuso o se construyó y no hace falta. Si fuiste vos quien lo metió, decilo sin rodeos y sin disculparte.

Cerrar con **una sola pregunta**, o con ninguna.

## Las reglas de redacción

Son el punto de la habilidad, no un detalle de estilo:

- **Ningún código de entrada de Índice.** Ni de decisión, ni de plan, ni de preferencia. Si un registro importa, se lo nombra por lo que dice, no por su número. Un código en medio de una explicación de alto nivel obliga al usuario a ir a buscar algo, que es lo contrario de lo que esta habilidad hace.
- **Ningún nombre interno que el usuario no haya usado.** Si el nombre de un archivo o de una carpeta es imprescindible, se lo introduce diciendo qué es.
- **Una sola respuesta.** No pedir permiso para explicar, no anunciar que vas a explicar, no partirlo en dos turnos.
- **Las alternativas van en el texto, a la vista, con la recomendación y su porqué.** No se ofrecen dentro de un menú de opciones.
- **Nunca más de dos alternativas.** Si te salen tres, es que la decisión todavía no está madura: madurala antes de traerla.

## Qué NO hace

- No decide nada ni ejecuta ningún cambio: reencuadra y devuelve la decisión al usuario.
- No reabre lo ya acordado en la conversación. Lo acordado se da por acordado y se dice en una línea.
- No es un resumen de lo conversado: es una explicación del mecanismo, que puede no haberse dicho nunca.

## Reconciliación

Es una operación de solo lectura: se puede invocar cuantas veces haga falta y no modifica el repo. Si se invoca dos veces sobre el mismo tema, la segunda no repite la primera — o el marco cambió porque se acordó algo, y entonces se explica desde el acuerdo nuevo, o el marco no cambió y lo que falló fue la explicación, y entonces hay que explicarlo de otra manera, no más largo.

## Cierre

Verificar antes de emitir, contra la propia respuesta: que tenga las cuatro partes en orden, que no lleve ningún código de entrada de Índice, que no cierre con más de una pregunta y que no ofrezca más de dos alternativas. Si alguna no se cumple, corregir la respuesta antes de mandarla.
