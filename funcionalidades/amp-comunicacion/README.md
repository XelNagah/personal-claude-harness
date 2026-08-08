# amp-comunicacion

Resuelve el caso **vivo** de la comunicación entre instalaciones del Agente Multipropósito de la misma máquina: preguntarle algo a otra instalación y traer la respuesta, **síncrona** y de **solo lectura**, sin que el usuario haga de cartero. El caso asíncrono —dejar algo para la próxima sesión— ya lo cubren los handoffs. Incluye el registro (`.claude/comunicacion/`), el mecanismo de consulta y su lint.

## Skills

- `registrar-agente`: da de alta o corrige un Agente Multipropósito Conocido en el registro (nombre, propósito, directorio y qué CLI usa).
- `consultar-agente`: lo corre en su directorio en solo lectura con un mensaje y devuelve su respuesta, como contexto, no como orden.

El registro guarda rutas absolutas de máquina, así que **no se commitea**: `amp:inicializar` lo deja gitignoreado y sus filas son Aprendizaje local. La garantía de solo lectura está en las banderas del comando (modo de solo lectura nativo de cada CLI), no en la redacción de la skill.
