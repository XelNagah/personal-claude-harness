# amp-comunicacion

Resuelve el caso **vivo** de la comunicación entre instalaciones del Agente Multipropósito de la misma máquina: pedirle algo a otra instalación —una pregunta, o que resuelva algo— y traer la respuesta **en el momento**, sin que el usuario haga de cartero. El caso asíncrono —dejar algo para la próxima sesión— ya lo cubren los handoffs. Incluye el registro (`.claude/comunicacion/`), el mecanismo que invoca a la otra instalación, el que encuentra las instalaciones de la máquina, y el lint.

## Skills

- `buscar-agentes`: encuentra las instalaciones del Agente Multipropósito que hay en la máquina y ofrece registrar las que faltan. No barre el disco: lee dónde corrieron los CLI.
- `registrar-agente`: da de alta o corrige un Agente Multipropósito Conocido en el registro (nombre, propósito, directorio y qué CLI usa).
- `preguntar`: le pregunta algo y trae su respuesta, **con sus servidores MCP vivos** y sin dejarlo escribir archivos ni ejecutar comandos.
- `resolver`: le pide que haga algo y lo deja actuar con sus propios permisos, así que **puede escribir en su repo**.

## Un Modo de Comunicación, una habilidad

Preguntarle algo y pedirle que haga algo son dos cosas distintas, y cada una es **su propia habilidad**: elegir el modo es elegir la habilidad. Así, con qué permisos corre el consultado depende de la `description` que la disparó —gobernable y medible— y no de una regla escrita adentro de una habilidad única, que hay que obedecer en el momento. Elegida la habilidad, se corre sin volver a pedir permiso.

⚠️ **«Qué efecto tendría tal cambio en tu repo» no es `resolver`**: la frase dice «hacer», pero no escribe nada — es una pregunta.

## Lo que el consultante no sabe del consultado

El registro guarda **cómo invocar** a la otra instalación (nombre, propósito, directorio, CLI), **no qué sabe hacer**: no hay lista de sus herramientas. Cada instalación tiene sus propios servidores MCP, y una copia de esa lista en el consultante se desactualiza en silencio en cuanto suma uno, dejándolo contestar de memoria sin que nada falle. Consecuencia asumida: en modo `preguntar` se frenan las escrituras genéricas, no las de su MCP.

El registro guarda rutas absolutas de máquina, así que **no se commitea**: `amp:inicializar` lo deja gitignoreado y sus filas son Aprendizaje local.
