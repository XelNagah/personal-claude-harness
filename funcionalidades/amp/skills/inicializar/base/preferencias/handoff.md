# Handoff

Elaboración de la Preferencia Base-0014.

**Por qué un handoff no es un plan.** Los dos guardan estado, y por eso se confunden, pero resuelven cosas opuestas. Un plan responde *¿qué falta hacer acá?* y vive mientras haga falta, en `planes/`, con su ciclo y su lint. Un handoff responde *¿qué necesita saber el que sigue, ahora?* y se consume de una vez: apenas el otro agente lo lee, no sirve más. Por eso vive en el directorio de borradores y no se indexa en ningún registro.

La confusión tiene una dirección sola y un costo concreto: ante *"dejalo para mañana"* el agente escribe un handoff, avisa que quedó listo, y el trabajo desaparece — nadie lo va a buscar a un archivo temporal que ningún índice nombra, y a la sesión siguiente el repo no muestra ningún pendiente. Al revés casi no pasa. Por eso la regla nombra el disparador equivocado explícitamente en vez de confiar en que se deduzca.

**Por qué el nombre nunca es fijo:** en una misma tanda pueden hacer falta varios handoffs, y con un nombre fijo el que se pisa es siempre el que servía. El nombre tiene que decir de qué es.

**Por qué la ruta va en el texto para copiar:** un handoff cuya ubicación el que lo tiene que leer no conoce no sirve de nada. El texto que se le pasa al agente siguiente lleva la ruta del archivo adentro.

**Por qué cinco líneas, en bloque de código y sin contenido.** El texto de traspaso se copia **a mano desde una terminal**, y ahí un párrafo largo obliga a scrollear y a seleccionar con precisión: un traspaso que cuesta copiar no se usa. El bloque de código lo hace seleccionable de una. Y el contenido no va porque ya está en el archivo: repetirlo es el mismo dato escrito dos veces, con el agravante de que la copia es la que se lee. `texto corto` sin un número no alcanzó — «corto» le pareció al agente que era todo el handoff, que es justamente lo que se quería evitar.

**Escribir el archivo no completa el traspaso.** La falla observada es que el agente escribe el handoff, lo da por hecho y sigue: el usuario se queda sin el texto que necesitaba copiar. El archivo no es el resultado; el resultado es que el otro agente arranque.

**Los dos finales.** Traspaso serial —el usuario abre una sesión nueva y sigue ahí—: la tarea termina con la entrega del texto. Delegación en paralelo —se le pasa una parte a otro agente y esta sesión continúa—: hay que decir qué le tocó al otro y qué queda acá, porque si no los dos trabajan sobre lo mismo.

**Por qué el reencuadre para el usuario lo escribe el emisor.** El handoff traspasa de agente a agente y el usuario es el cartero: copia cinco líneas que por diseño no llevan contenido, así que por construcción nunca sabe qué dice el archivo. El agente nuevo arranca con todo el contexto y el usuario con cero, y ahí le pregunta por «el ítem 1 contra el ítem 4» de una lista que no vio. La falla es sistemática, no un descuido: los seis párrafos de esta preferencia miraban al que escribe y ninguno al que recibe. Se arregla en el origen porque el reencuadre lo tiene que escribir el que tiene el contexto: el receptor solo puede reconstruirlo de lo que leyó. Y va ya redactado para la persona, no como la instrucción de redactarlo — una instrucción se interpreta, y el receptor vuelve a reconstruir, que es exactamente lo que sale mal.
