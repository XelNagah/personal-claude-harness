---
origen: agente-multiproposito
---

# Clases de acción de conducta

Vocabulario de las **clases** válidas para una regla de conducta. La clase dice **qué hace el hook repartidor con la regla** cuando llega su momento: las tres pasan por un hook — el hook es el mecanismo de entrega, no una clase. El `lint-conducta` lee este archivo para validar que toda regla use una clase existente, en vez de tener la lista escrita a mano en su código.

- **Clase** — nombre canónico, en español corriente.
- **Qué es el Contenido** — qué se escribe en la celda `Contenido` de la regla.
- **Qué hace el hook** — cómo la despacha el repartidor.
- **A dónde va el resultado** — dónde termina.
- **Disponibilidad** — `activo` (hay repartidor que la entrega) o las salvedades por agente.

> **Este vocabulario no tiene versión del Agente Desplegado, y es a propósito.** Los momentos sí: `MOMENTOS-LOCAL.md` existe para que un repo declare puntos del flujo propios de su Propósito. Las clases no, porque **están implementadas en el código del repartidor**: agregar una cuarta clase sin tocar `establecer-conducta/` deja reglas que nadie sabe despachar, y el síntoma sería una regla que existe y no se entrega nunca. Una clase nueva es un cambio del Agente Multipropósito, no una extensión del repo.

| Clase | Qué es el Contenido | Qué hace el hook | A dónde va el resultado | Disponibilidad |
|-------|---------------------|------------------|-------------------------|----------------|
| Inyectar | texto fijo, escrito en el Índice | lo emite como `additionalContext` | al contexto del modelo; el usuario no lo ve | activo |
| Ejecutar | la ruta de un programa, con sus flags | lo ejecuta y reenvía su salida; si el momento tiene varias reglas, las fusiona en un único `systemMessage` | a la terminal del usuario (hoy el `systemMessage` de la Pantalla de bienvenida); no entra al contexto | activo |
| Bloquear | la ruta de un programa, con sus flags | lo ejecuta y **lee** su respuesta | si trae `deny`, frena la acción; si trae `additionalContext`, se combina con las reglas `Inyectar` del mismo momento | activo en Claude Code; en Codex el `deny` todavía no frena (bug abierto del CLI), así que ahí degrada a aviso |

> **Las clases no son configurables por repo.** A diferencia de los estados de `planes`, agregar una fila acá no hace que el repartidor la soporte: las tres están implementadas en `establecer-conducta/`. El archivo existe para que la lista y su significado vivan en un solo lugar, y para que el lint valide contra él.
