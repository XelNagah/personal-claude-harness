# El mismo dato en dos lugares, sin nada que los sincronice

Cada vez que un dato queda escrito en dos lados, **divergen**. No es una posibilidad: es lo que pasa, y lo que decide el daño es si hay un control que compare las dos copias o no. Sin control, la copia equivocada se descubre cuando alguien la sufre.

Medido en este repo el 30/07/2026, con todos los controles en verde.

## Las tres formas que aparecieron

### El texto que se publica, duplicado del que se usa

Este repo instala su propio harness y además lo publica, así que cada lint, cada manifiesto y cada registro vive dos veces: la copia que corre en `.claude/` y la copia embebida en la plantilla del instalador, que es la que viaja a cada Agente Desplegado.

Al arreglar cuatro lints en `.claude/`, la copia embebida quedó con el defecto. **El control de cierre siguió en verde**, porque el control de divergencia que existía comparaba las plantillas *entre sí* y por fragmentos, no la plantilla contra el archivo instalado. Cuando se escribió la comparación que faltaba, **2 de 12 scripts embebidos estaban divergentes**, y los dos eran cambios de esa misma sesión.

### El comentario que sobrevive al código que describe

Un comentario es un dato sobre el código, escrito al lado del código. Cuando el código cambia y el comentario no, el comentario **afirma lo contrario de lo que pasa** — y es peor que no tenerlo, porque el que lo lee confía.

Caso concreto: los cuatro lints llevaban arriba *la raíz del repo se deduce de la ubicación del propio lint*. Se cambió el código para que dejara de hacer exactamente eso, y el comentario quedó, contradiciendo a la línea siguiente. Estaba en **cinco copias** (los cuatro lints y sus cuatro bloques embebidos). Ningún lint mira esto: no hay forma mecánica de saber si un comentario sigue siendo cierto.

### El número que copia un dato que cambia

Un número escrito en un registro es una copia del dato real, así que le pasa lo mismo que a cualquier copia: diverge. Lo que decide si eso importa es **qué está contando**.

- **Cuenta el pasado** — *esta decisión llevó los plugins de 12 a 7*. No envejece: describe lo que la entrada hizo en su momento, y eso sigue siendo cierto aunque hoy sean nueve.
- **Afirma el presente** — *los encabezados son literales en los diez Índices*. Envejece con el repo, y nada avisa. Medido el 30/07/2026: eran trece.

Y un caso aparte, el peor de los tres, porque no cuenta sino que **apunta**: la referencia por posición. *Las tres últimas filas se vetaron el 28/07* dejó de ser cierta en cuanto se sumaron filas nuevas — la nota seguía señalando el final de la tabla mientras las filas que describía se habían corrido al medio. Se arregla nombrando por Código, que es estable: `Local-0036` a `Local-0038`.

**Antes de escribir un número en un registro:** ¿describe algo que pasó, o algo que es? Lo primero se escribe. Lo segundo se reemplaza por la palabra que lo hace innecesario (*todos los Índices*) o por el identificador estable de lo que se quería señalar. De cinco números auditados en el registro de decisiones, cuatro contaban el pasado y estaban bien: el problema es más raro de lo que parece, pero el que falla no da ninguna señal.

### El dato que un archivo declara y otro repite

Ya resuelto en este repo, y sirve de molde: el manifiesto de cada subsistema lista sus Índices, y cada Índice declara lo mismo en su frontmatter. Eran dos lugares con el mismo dato, y la solución fue **nombrar una autoridad y hacer que el control compare** — el frontmatter manda, el lint valida el manifiesto contra él. El mismo criterio aplica a los estados de planes (`ESTADOS.md`) y a las clases de conducta (`CLASES.md`), donde el registro es la fuente y el código lo lee *en vez de tener la lista escrita a mano*.

## Qué hacer, en orden de preferencia

1. **Que el dato viva una sola vez.** Es la única solución que no necesita mantenimiento. Cuando la duplicación existe porque *se supone* que no hay alternativa, conviene revisar esa suposición: acá la plantilla se duplica porque *la copia instalada no puede leer las otras carpetas*, y resulta que el marketplace bajado tiene el repo completo y otra habilidad del mismo paquete ya lo lee.
2. **Si tiene que vivir dos veces, nombrar la autoridad y escribir el control que compare.** Comparar entero, no por fragmentos: los fragmentos dejan pasar todo lo que no se pensó de antemano.
3. **Que el control diga dónde difiere**, no solo que difiere. Un control que informa *hay divergencia* en 296 KB de texto no es accionable.

## Dos trampas propias de un texto que se publica

- **El texto que viaja está sujeto a controles más estrictos que su original.** El control de terminología solo mira `.md`, así que un comentario dentro de un `.js` pasa y el **mismo** comentario embebido en una plantilla `.md` se rechaza. Pasó en vivo: el ejemplo con que el código explicaba por qué no eximir la cursiva usaba un término vetado en cursiva. El efecto perverso es que ese desnivel **empuja a divergencia**: la vía fácil es cambiar solo la copia que se queja.
- **La copia que viaja no debe arrastrar la historia del repo que la publica.** Un comentario que decía *Medido el 30/07/2026: este control rechazó dos veces…* es anécdota del autor y no le sirve a ningún Agente Desplegado; encima obliga a que las dos copias difieran. Lo que explica **por qué** el código es así viaja; lo que cuenta **qué nos pasó** se queda en el plan o en el conocimiento.

## Y una que no es duplicación pero se le parece

**El trabajo terminado que queda en la carpeta temporal se pierde.** Una prueba completa de `lint-planes` —169 líneas, funcionando, con el criterio correcto escrito en su encabezado— estaba en `.claude/tmp/`, que el repo gitignorea. No era un borrador: era el trabajo hecho, esperando que alguien lo borrara. Un archivo en `tmp/` que ya no es descartable hay que moverlo el mismo día.
