# La regla que propone cerrar la sesión manda escribir un handoff para trabajo que sigue otro día

**Estado: Ejecutado · Creado 26-08-25 · Cerrado 26-08-26.** Se resolvió dentro del plan Local-0117, tramo 1.

Reporte del Agente Desplegado `sicape-backend`. La regla es de la Base y viaja a todos los Agentes
Desplegados, así que el defecto está en todos.

## El defecto

La regla de conducta `Base-0010` (*Proponer dejar la sesión limpia al terminar una tarea*, momento
`cada turno`, clase `Inyectar`) entrega este texto:

> Si la tarea quedó terminada, persistida y verificada, proponé dejar la sesión limpia antes de la
> próxima: asentá lo que falte, **escribí un handoff si hay trabajo que retomar** (Preferencia
> Base-0014) y sugerí `/clear`.

La frase resaltada **contradice a la Preferencia que cita**. La Preferencia `Base-0014` reserva el
handoff para el traspaso a otro agente **en el momento** —el usuario copia un texto, abre una sesión y
lo pega— y manda explícitamente a abrir o actualizar un plan lo que sigue otro día: *«Ante "dejalo para
mañana" o "guardá esto", abrir o actualizar un plan, no escribir un handoff»*.

«Si hay trabajo que retomar» abarca los dos casos y empuja al handoff en los dos, justo en el momento
en que el agente decide.

La columna `Descripción` de la fila repite el sesgo, y esa celda está siempre en contexto:

> Empuja la disciplina de higiene de sesión: tarea terminada → persistir + handoff + `/clear`, con la
> terminal siempre abierta

## La evidencia

El 25/08/2026, en `sicape-backend`, el agente escribió un handoff para un trabajo que seguía al día
siguiente, **con la Preferencia `Base-0014` cargada en contexto**. El usuario lo corrigió y la
secuencia se movió a un plan.

Es el modo de falla de siempre: el resumen que el agente recibe en el momento de actuar le gana a la
regla completa que tiene cargada desde el arranque.

## La corrección propuesta — a analizar, NO ratificada

Contenido de la regla:

> …asentá lo que falte, **actualizá su plan si el trabajo sigue otro día, escribí un handoff solo si
> otro agente lo retoma ahora** (Preferencia Base-0014) y sugerí `/clear`.

Y alinear la columna `Descripción` de la misma fila, que hoy nombra el handoff como paso fijo.

## Trampas ya pagadas

1. **La Preferencia `Base-0014` está bien y no se toca.** Su título dice «cuando el trabajo pasa a otro
   agente ahora» y su descripción desarrolla el caso del plan. El defecto está solo en el resumen que
   hace la regla de conducta.
2. **La regla tiene `origen: agente-multiproposito`.** Corregirla en un Agente Desplegado no sirve: el
   actualizador la pisa. El arreglo va en este repo, en los dos lados:
   - `.claude/conducta/INDICE.md` (línea 39)
   - `funcionalidades/amp/skills/inicializar/base/conducta/INDICE.md` (línea 39), vía
     `sincronizar-base --aplicar`

   Con **suba de versión del plugin `amp`**, o el Agente Desplegado no lo recibe y `lint-harness` lo
   marca.

## Verificado en este repo

Los tres puntos del reporte se confirmaron acá el 25/08/2026: la fila existe con ese texto exacto, su
`origen` es `agente-multiproposito`, y la copia que viaja tiene el mismo contenido.

## Lo que falta decidir

- Si la corrección propuesta es el texto final o hay uno mejor. La regla la lee el agente en cada
  turno, así que compite por longitud con las otras reglas del mismo momento.
- Si al arreglar esta fila conviene barrer las demás filas de la Base buscando el mismo defecto —un
  resumen que contradice a la Preferencia que cita—, o dejarlo para un plan aparte.

## Notas de implementación

Cerrado el 26/08/2026, resuelto **adentro del plan Local-0117** (tramo 1), como el propio Local-0117
lo había previsto.

**La corrección aplicada** es el texto que este plan proponía, ratificado por el usuario antes de
escribirlo. Las dos celdas de la fila `Base-0010` de `.claude/conducta/INDICE.md`:

- **`Contenido`** — «…asentá lo que falte, **actualizá su plan si el trabajo sigue otro día, escribí
  un handoff solo si otro agente lo retoma ahora** (Preferencia Base-0014) y sugerí `/clear`.»
- **`Descripción`** — «Recuerda la disciplina de higiene de sesión al terminar una tarea: persistir lo
  que falte, dejar en su plan el trabajo que sigue otro día, y `/clear` con la terminal siempre
  abierta». Ya no nombra el handoff como paso fijo.

Espejado a `funcionalidades/amp/skills/inicializar/base/conducta/INDICE.md` con `sincronizar-base
--aplicar`, y el plugin `amp` subido a **0.56.0**, sin lo cual ningún Agente Desplegado lo recibe.

**Las dos cuestiones que este plan dejaba abiertas, resueltas:**

1. *Si el texto propuesto era el final.* Lo fue, con un cambio: la `Descripción` arrancaba con
   «Empuja la disciplina…», y el usuario objetó el término como calco de *push*. Se verió en la misma
   sesión —relación `Local-0049` del registro de Terminología Farlopa, con canónico `recordar` /
   `pedir` / `un recordatorio`— y la celda quedó redactada con el canónico.
2. *Si convenía barrer las demás filas de la Base buscando el mismo defecto.* **No hay material.** El
   defecto es «un resumen que contradice a la Preferencia que cita», y de las trece reglas de los dos
   Índices la `Base-0010` es **la única que cita una Preferencia**. Verificado barriendo ambos Índices
   por citas a Preferencias, Decisiones y páginas de conocimiento. No se abre plan de barrido.
