# El plan que reparte su trabajo en otros planes

Un plan grande se descompone. Nombra frentes, y con el tiempo cada frente se resuelve en otro lado: un plan hijo, una decisión, un mecanismo que se construyó aparte. Eso está bien — es cómo avanza el trabajo.

Lo que falla es lo que le pasa al plan padre: **nadie vuelve a él a tachar lo que ya se hizo**, porque quien cierra el hijo está mirando el hijo. El padre no aparece en su camino.

El daño no es tener un documento viejo, que sería barato. Es que el padre **sigue declarando pendiente lo que ya no lo es**, y mientras figure como vivo, cada vez que alguien pregunte «¿qué quedó por hacer?» hay que verificarlo entero para descubrir que no hay nada.

Medido el 12/08/2026 sobre un plan madre de tres semanas con seis pendientes declarados: **tres seguían siendo ciertos y tres no**.

## Las tres formas en que un pendiente envejece

### 1. Se resolvió en otro plan

La forma esperable, y la más barata de arreglar. Un plan hijo hizo el trabajo, se cerró bien, y el padre siguió pidiéndolo. Se detecta comparando: el hijo dice qué resolvió, el padre dice qué falta, y la intersección es lo que hay que tachar.

Dos de los seis pendientes medidos eran de esta clase: uno lo había resuelto una decisión nueve días después de que se escribiera el padre; el otro estaba resuelto en el código y nadie lo había anotado en ningún lado.

### 2. Se resolvió al revés de como el padre lo pedía

Esta es la cara, y no se detecta comparando lo hecho contra lo pedido, porque **coinciden en el tema y se oponen en el sentido**.

El caso medido: el padre pedía extender un control a la raíz del repo, y anotaba que un criterio ya ratificado lo *habilitaba*. Cuando se fue a leer ese criterio, decía exactamente lo contrario y con el mismo argumento — la raíz es donde vive lo que el repo produce, así que barrerla marcaría el trabajo real como sospechoso.

O sea: **el criterio que el padre citaba como su habilitación era el que lo descartaba.** Nada de eso emite señal. El padre y el criterio conviven, los dos vigentes, diciendo cosas opuestas, hasta que alguien los lee juntos.

La regla que se sigue: **cuando un pendiente cita algo que lo habilita, hay que abrir lo citado.** Un plan que dice «esto ya está destrabado por X» está afirmando el contenido de X sin mostrarlo, y esa afirmación envejece como cualquier otra copia de un dato.

### 3. Nunca fue accionable, y nadie lo dijo

Un pendiente que describe trabajo cuya **fuente no existe**. El caso medido pedía sumar los criterios restantes de un relevamiento que había rescatado unas veinticuatro reglas de conversaciones viejas; de esas, las que se escribieron están asentadas, y **las demás nunca se enumeraron en ningún archivo**. No hay lista que retomar: para hacerlo hay que rehacer el relevamiento.

Se lee como trabajo pendiente y es una intención. La diferencia se ve preguntando dónde está la entrada del trabajo: si la respuesta es «en una conversación que ya no está», el pendiente no es pendiente.

## Por qué el costo se paga muchas veces

Un plan vivo es una promesa de que ahí hay trabajo. Cada sesión que arranca preguntando qué quedó abierto lo encuentra, lo abre, y para saber si sirve tiene que verificar cada pendiente contra el estado real del repo — leer el código, abrir las decisiones citadas, buscar si algún otro plan lo resolvió.

Esa verificación **no se puede saltear**, porque el documento no distingue lo cierto de lo caduco: los seis pendientes se ven exactamente iguales. Y **no queda guardada** en ningún lado, así que la sesión siguiente la repite entera.

## Cómo se detecta

- **Al cerrar un plan hijo, abrir el padre.** Es el único momento en que alguien tiene el contexto para tachar la línea correcta, y cuesta un minuto. Después cuesta una verificación completa.
- **Un plan vivo con muchos meses y sin movimiento propio se audita, no se retoma.** Si su trabajo se fue repartiendo, lo que queda no es un plan: es un índice de otros planes.
- **Al verificar, abrir lo que el pendiente cita.** La forma 2 solo aparece leyendo la fuente citada, nunca leyendo el plan.

## La regla

**Un plan que reparte su trabajo tiene que quedarse con trabajo propio, o cerrarse.** Cuando todos sus frentes viven en otros planes, sigue siendo útil como relato de por qué existen esos planes —eso vale y no se tira—, pero deja de ser algo que alguien pueda ejecutar. Ahí corresponde cerrarlo dejando asentado qué materializó cada frente, y desprender como plan propio lo poco que le quedaba sin dueño.

Cerrarlo no cierra el problema que lo originó. Cierra la promesa de que ese documento tiene trabajo adentro.
