---
origen: agente-multiproposito
---

# Clases de acción de conducta

Vocabulario de las **clases** válidas para una regla de conducta. La clase dice **qué hace el subsistema con la regla** cuando llega su momento. El `lint-conducta` lee este archivo para validar que toda regla use una clase existente, en vez de tener la lista escrita a mano en su código.

Las tres se entregan por un hook: el hook es el mecanismo, no una clase. Lo que las distingue es **quién recibe el resultado y quién decide qué hacer con él**.

- **Clase** — nombre canónico, en español corriente.
- **Qué se escribe en la regla** — qué va en la celda `Contenido` de la fila.
- **Qué hace el subsistema** — cómo la despacha cuando llega el momento.
- **Quién recibe el resultado** — a quién le llega y qué puede hacer con eso.
- **Disponibilidad** — `activo` (hay repartidor que la entrega) o las salvedades por agente.

| Clase | Qué se escribe en la regla | Qué hace el subsistema | Quién recibe el resultado | Disponibilidad |
|-------|---------------------------|------------------------|---------------------------|----------------|
| Inyectar | un texto fijo, escrito en el Índice | se lo entrega al agente tal cual | **el agente**, que actúa con su juicio; el usuario no lo ve | activo |
| Ejecutar | la ruta de un programa, con sus flags | lo corre y reenvía su salida | **el usuario**, en su terminal; no le llega al agente | activo |
| Controlar | la ruta de un **Control**, con sus flags | lo corre y lee su respuesta | **el agente**, si el Control avisó; **nadie**, si el Control bloqueó y la acción no ocurre | activo en Claude Code; en Codex el freno todavía no corta (bug abierto del CLI), así que ahí el Control degrada a aviso |

**Cuándo usar cada una.** El corte entre `Inyectar` y las otras dos es si lo que hay que asegurar necesita criterio. «Acordate de contrastar lo que escribiste contra lo ya asentado» lo tiene que juzgar el agente caso por caso, así que es un texto (`Inyectar`). «Este archivo usa un término vetado» se resuelve comparando contra una lista, sin juicio, así que lo decide un Control (`Controlar`). Producir una salida y ponerla a la vista del usuario no es ninguna de las dos: es `Ejecutar`.

**Varias reglas de clases distintas conviven en un mismo momento** y se entregan juntas, no una en lugar de otra. El caso a la vista está en el arranque de sesión, donde una regla `Ejecutar` del Agente Multipropósito y otra del repo salen pegadas en la terminal; el ejemplo, en el [README del subsistema](README.md). La única que se entrega sola es la que frena: si la acción no va a ocurrir, el resto sobra. **Por qué campo sale cada una** —que es lo que hace posible combinarlas— está en el [README del repartidor](establecer-conducta/README.md).

**En el momento `al cerrar tarea` esto tiene una excepción:** ahí una regla `Inyectar` no se entrega sola. Está explicada una sola vez, en [`MOMENTOS.md`](MOMENTOS.md#el-momento-donde-hablar-cuesta-un-turno).

> **Este vocabulario no tiene versión del Agente Desplegado, y es a propósito.** Los momentos sí: `MOMENTOS-LOCAL.md` existe para que un repo declare puntos del flujo propios de su Propósito. Las clases no, porque **están implementadas en el código del repartidor**: agregar una cuarta clase sin tocar `establecer-conducta/` deja reglas que nadie sabe despachar, y el síntoma sería una regla que existe y no se entrega nunca. Una clase nueva es un cambio del Agente Multipropósito, no una extensión del repo. A diferencia de los estados de `planes`, agregar una fila acá no hace que el repartidor la soporte: el archivo existe para que la lista y su significado vivan en un solo lugar, y para que el lint valide contra él.
