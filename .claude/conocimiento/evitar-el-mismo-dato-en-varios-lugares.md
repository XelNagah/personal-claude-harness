# Evitar el mismo dato escrito en varios lugares: casos detectados y cómo prevenirlos

Cada vez que un dato queda escrito en dos lados, **divergen**. No es una posibilidad: es lo que pasa, y lo que decide el daño es si hay un control que compare las dos copias o no. Sin control, la copia equivocada se descubre cuando alguien la sufre.

## Las cuatro formas

### El texto que se distribuye, duplicado del que se usa

Cuando un archivo vive dos veces —la copia que se usa y la copia que se publica—, arreglar una deja a la otra con el defecto.

Lo que lo vuelve difícil de ver es que el control que **parece** cubrirlo suele comparar las copias distribuidas **entre sí**, o por fragmentos, y no la copia distribuida contra la que se usa. Da verde mientras las dos divergen, y lo publicado sale a medias.

### El comentario que sobrevive al código que describe

Un comentario es un dato sobre el código, escrito al lado del código. Cuando el código cambia y el comentario no, el comentario **afirma lo contrario de lo que pasa** — y es peor que no tenerlo, porque el que lo lee confía.

No hay forma mecánica de saber si un comentario sigue siendo cierto: ningún control puede leerlo. Es la forma que solo se previene al escribir.

### El número que copia un dato que cambia

Un número escrito en un registro es una copia del dato real, así que le pasa lo mismo que a cualquier copia. Lo que decide si eso importa es **qué está contando**:

- **Cuenta el pasado** — *"esta decisión bajó los pasos de doce a siete"*. No envejece: describe lo que la entrada hizo en su momento, y eso sigue siendo cierto aunque hoy sean nueve.
- **Afirma el presente** — *"los encabezados son literales en los diez registros"*. Envejece con el repo, y nada avisa.
- **Apunta por posición** — el peor caso, porque no cuenta sino que **señala**. *"Las tres últimas filas se vetaron el lunes"* deja de ser cierto en cuanto se suman filas: la nota sigue apuntando al final de la tabla mientras las filas que describía se corrieron al medio. Se arregla nombrando por Código, que es estable.

**Antes de escribir un número en un registro:** ¿describe algo que pasó, o algo que es? Lo primero se escribe. Lo segundo se reemplaza por la palabra que lo hace innecesario (*todos los registros*) o por el identificador estable de aquello que se quería señalar.

### El dato que un archivo declara y otro repite

Cuando dos archivos afirman lo mismo, la salida es **nombrar una autoridad y hacer que el control compare**: uno manda y el otro se valida contra él.

Aplica al manifiesto de un subsistema y a los Índices que lista —el frontmatter de cada Índice manda, el lint valida el manifiesto contra él—, y a cualquier lista que el código tenga escrita a mano cuando ya existe un registro que la contiene: el código lee el registro *en vez de* repetir la lista.

## Qué hacer, en orden de preferencia

1. **Que el dato viva una sola vez.** Es la única solución que no necesita mantenimiento. Cuando la duplicación existe porque *se supone* que no hay alternativa, conviene revisar esa suposición antes de darla por buena.
2. **Si tiene que vivir dos veces, nombrar la autoridad y escribir el control que compare.** Comparar **entero, no por fragmentos**: los fragmentos dejan pasar todo lo que no se pensó de antemano.
3. **Que el control diga dónde difiere**, no solo que difiere. Un control que informa *"hay divergencia"* sobre un texto largo no es accionable.

## Dos trampas propias del texto que se distribuye

- **El texto que viaja queda sujeto a controles más estrictos que su original.** Si un control mira solo los `.md`, el mismo texto pasa adentro de un `.js` y se rechaza embebido en un `.md`. El efecto perverso es que ese desnivel **empuja a divergencia**: la vía fácil es cambiar solo la copia que se queja.
- **La copia que viaja no debe arrastrar la historia del repo que la publica.** Un comentario que cuenta qué le pasó al autor no le sirve a quien recibe el archivo, y encima obliga a que las dos copias difieran. Lo que explica **por qué** algo es así viaja; lo que cuenta **qué nos pasó** se queda en el plan o en el conocimiento de quien lo vivió.
