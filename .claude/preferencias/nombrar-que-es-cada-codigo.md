# Nombrar qué es cada código al citarlo

Elaboración de la Preferencia Base-0016.

**Por qué:** los códigos `Base-NNNN` y `Local-NNNN` se repiten entre registros. El mismo código puede ser una decisión, un plan, una preferencia, una página de conocimiento, una Herramienta o un término del glosario. Sin decir de cuál se trata, «Local-0047» a secas no identifica nada.

**El título, también en lo escrito.** Nadie tiene los códigos en memoria, ni el usuario ni un agente que retoma: un código pelado obliga a **interrumpir la lectura** para ir a buscarlo, y en la práctica no se va — se sigue leyendo sin entender la frase que lo cita. Hasta el 02/08/2026 esta preferencia pedía el título solo en la conversación, con el argumento de que en lo escrito el lector podía abrir el registro; el autor del repo señaló ese mismo día que no lo hace, leyendo una celda del registro de decisiones que citaba tres decisiones por número. **Lo que se conserva de aquel argumento es el peso:** repetir el título en cada cita de un documento que menciona la misma decisión ocho veces lo vuelve ilegible. De ahí la regla actual — la primera vez en cada documento alcanza, después el código solo ya está anclado.

**Tres casos donde el título no va**, encontrados al aplicar la regla al repo el 02/08/2026:

- **La cita múltiple.** *«las decisiones 0004/0016/0018 controlan el alta»* con tres títulos adentro
  se vuelve ilegible. Lo que reemplaza al título es que la frase diga **qué tienen en común**, que es
  para lo que se las cita juntas.
- **El inventario.** Cuando el código es un **dato contado** y no una referencia a seguir —*«106
  apariciones: decisiones 0024, 0028, 0033, 0036, manifiestos, varios README»*— el título no ayuda a
  nadie: lo que importa es cuántas y dónde.
- **La frase que ya lo dice.** *«citas a decisiones del harness en archivos distribuibles (dec.
  0024)»* — el título de esa decisión es literalmente lo que la frase acaba de enunciar. Agregarlo
  duplica la línea.

El criterio detrás de los tres: el título está para que el lector no tenga que ir a buscar el
registro. Donde ya no tiene que ir, no hace falta.
