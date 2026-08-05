---
indice: Preferencias
origen: agente-multiproposito
columnas: [Código, Nombre, Descripción, Detalle]
descripcion: la preferencia en sí — lo que hace falta saber para obedecerla
---

# Preferencias

Reglas de conducta del agente en este repo. Siempre en contexto (importado desde AGENTS.md). Una fila por preferencia.

- **Código** — `Base-NNNN`. Se asigna al crear la entrada y no se reusa.
- **Nombre** — qué pide la preferencia, en una frase con verbo. Único en el Índice.
- **Descripción** — la preferencia en sí: todo lo que hace falta para obedecerla.
- **Detalle** — `—`, o la página con su elaboración: ejemplos, motivos y casos ya discutidos. Lo que no hace falta para obedecer.

> **Origen del contenido:** las preferencias se separan por origen en dos archivos, y cada uno lo declara en su frontmatter — este (`origen: agente-multiproposito`, las manda el Agente Multipropósito; el nivelador lo reemplaza entero) y [`PREFERENCIAS-LOCAL.md`](PREFERENCIAS-LOCAL.md) (`origen: agente-desplegado`, las suma cada repo; el nivelador no lo abre).

## Preferencias del Agente Multipropósito

| Código | Nombre | Descripción | Detalle |
|--------|--------|-------------|---------|
| Base-0003 | Mostrar el texto exacto antes de escribir en un registro canónico | Antes de escribir en un **registro canónico** (glosario, decisiones, preferencias, Terminología Farlopa), mostrar el **texto exacto** que se va a asentar y esperar el visto bueno. Un "sí" a *"¿lo registro?"* aprueba la **acción** de registrar, nunca el **contenido**: lo que el usuario no leyó, no lo ratificó. | — |
| Base-0009 | Distinguir lo verificado de lo inferido o generado | No presentar como cierto ni verificado ningún dato o afirmación que no provenga de una fuente comprobada. Distinguir explícitamente hechos verificados, inferencias propias, supuestos, datos faltantes y datos sintéticos o de prueba. | — |
| Base-0010 | No adoptar terminología del dominio sin ratificación | Preferir los términos que usa el usuario y los registrados en el glosario. Cuando un concepto necesite un nombre nuevo, proponerlo explícitamente y esperar la ratificación del usuario antes de adoptarlo como vocabulario del repo. Un término propuesto puede mencionarse para discutir la propuesta, pero no usarse como si fuera canónico en documentación, planes, diagramas, código o registros. | — |
| Base-0013 | Mantener un archivo de estado en tareas exploratorias | En tareas exploratorias con varias variables, mantener un único archivo de estado desde la primera corrida y actualizarlo antes de informar cada resultado. Si responde a un plan, vive en su sección `## Estado`; si es independiente, en `conocimiento/<tema>/estado.md`. | [archivo-de-estado.md](archivo-de-estado.md) |
| Base-0014 | Entregar un handoff cuando el trabajo pasa a otro agente ahora | Un handoff traspasa trabajo a otro agente **en el momento**: el usuario copia un texto, abre una sesión y lo pega. No es para archivar ni para dejar algo para otro día — eso es un plan, y va al subsistema planes. Ante «dejalo para mañana» o «guardá esto», abrir o actualizar un plan, no escribir un handoff. Se escribe cuando el usuario lo pide o cuando hay que cortar porque el contexto se llenó. Va en `.claude/tmp/` con un nombre que diga **de qué es** (`handoff-<tema>.md`), nunca un nombre fijo, y lleva en este orden: qué hacer primero al arrancar, cómo verificar el estado del repo con los comandos, qué quedó pendiente y en qué plan vive, y las trampas ya pagadas. **Escribir el archivo no completa el traspaso:** la respuesta que lo anuncia tiene que traer el texto para pegar, en un bloque de código de **hasta cinco líneas**, con la ruta del archivo adentro y **nada del contenido** — el que lo reciba abre el archivo. Un texto que haya que scrollear para copiar no sirve. Si el handoff era el pedido, la tarea termina ahí; si es para delegarle una parte a otro agente mientras esta sesión sigue, decir qué le tocó al otro y qué queda acá. | [handoff.md](handoff.md) |
| Base-0016 | Citar los códigos de las Entradas de Índice con su tipo y contexto | Esta regla se aplica solamente a los códigos de las Entradas de Índice de Subsistema, no a identificadores del Producto, del código fuente, commits u otros sistemas. Al citar una entrada, su código `Base-NNNN`/`Local-NNNN` nunca va solo: debe estar precedido por el tipo de entrada —Decisión, plan, Preferencia, conocimiento, Herramienta o término del glosario— porque esos códigos se repiten entre Índices. Agregar su título entre paréntesis en la conversación y en la primera mención de cada documento, excepto cuando la frase ya identifica la entrada, el código es un dato de inventario o se citan varias entradas juntas explicando qué tienen en común. | [nombrar-que-es-cada-codigo.md](nombrar-que-es-cada-codigo.md) |
