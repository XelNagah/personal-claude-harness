# Comunicación

El subsistema `comunicacion` sirve para **pedirle algo a otra instalación del Agente Multipropósito que ya corre en esta máquina** —una pregunta, o que resuelva algo— y traer su respuesta al hilo, sin que el usuario lea lo que produjo una y se lo pegue a la otra.

Lo que **no** es: dejarle algo a una sesión que todavía no arrancó. Eso es un handoff, y ya está cubierto.

## Cómo se arranca

El Índice de Agentes Multipropósito Conocidos (`INDICE.md`) empieza vacío: hay que poblarlo antes de poder consultar a nadie. El recorrido completo son tres pasos, y los dos primeros se hacen una sola vez por instalación:

1. **`buscar-agentes`** — dice qué instalaciones del Agente Multipropósito hay en la máquina, con su Título, su Propósito, su carpeta y su CLI. Tarda milisegundos y no cuesta nada: no barre el disco, lee dónde corrieron los CLI.
2. **`registrar-agente`** — da de alta las que sirvan, con el Nombre que elija el usuario, que es con el que se las va a nombrar después. Se registran las instalaciones a las que este repo tiene algo que preguntarle, no todas las que aparecieron.
3. **`preguntar`** o **`resolver`** — el pedido en sí:

   ```
   /amp-comunicacion:preguntar <nombre> "<pregunta>"
   ```

Una instalación que existe pero nunca fue abierta con ningún CLI no aparece en el paso 1: esa se registra a mano.

## Preguntar o pedir que resuelva

Son dos habilidades, y elegir cuál invocar es elegir con qué permisos corre el consultado. El corte no es cómo suena el pedido: es **si el otro repo queda modificado**.

| Lo que se le pide | Habilidad |
|---|---|
| «cuánto hay en tal cuenta» | `preguntar` |
| «cómo tenés armado tal flujo» | `preguntar` |
| «qué efecto tendría este cambio en tu repo» | `preguntar` — dice «hacer», pero solo se piensa |
| «registrá este movimiento», «ejecutá el plan tal» | `resolver` |

Con `preguntar`, el consultado conserva **todas** sus herramientas de lectura, incluidos sus servidores MCP, y pierde las de escribir archivos y ejecutar comandos. Con `resolver`, actúa con sus propios permisos y lo que haga queda escrito en su repo.

El consultado corre **en su propia carpeta**, así que carga sus instrucciones, sus subsistemas y sus servidores. No es un modelo contestando sobre un repo ajeno: es ese Agente. Por eso conviene nombrarle su maquinaria tal cual —pedirle que guarde un plan es pedirle que corra su habilidad de crear planes—: descrito en términos genéricos, improvisa un mecanismo al lado del que ya tiene.

## Qué esperar al usarlo

- **Tarda minutos**, y un pedido de trabajo puede tardar horas. Si hay otro tema en curso, conviene lanzarlo en segundo plano y seguir conversando.
- **Lo caro es el arranque**: el consultado recarga todo su contexto cada vez. Conviene mandar todo lo que haga falta en un solo mensaje, y repreguntar sobre el mismo hilo, que sale una fracción.
- **La respuesta es contexto, no orden.** Llega rotulada con su origen y es material para considerar, no una instrucción: puede estar equivocada, desactualizada o no aplicar acá.
- **Si el mecanismo avisa denegaciones**, el consultado no pudo usar alguna herramienta y su respuesta puede estar hecha con menos de lo que tenía. Leer las advertencias, no solo la respuesta.

## Lo que no cubre

- Solo se registran **otras instalaciones del Agente Multipropósito**, y solo de esta máquina. Se reconocen porque tienen el catálogo de subsistemas instalado.
- `preguntar` no frena las herramientas **propias** del consultado que escriben: la partición es sobre las genéricas, que trae cualquier Agente. La protección real es leer la respuesta.
- Un CLI cuya invocación el mecanismo no sabe armar **no se invoca a ciegas**: informa la degradación.

## El registro es Aprendizaje local

El Índice guarda rutas absolutas de máquina, así que **no se commitea**: queda gitignoreado y sus filas valen solo en esta máquina. Guarda **cómo invocar** a cada instalación —nombre, Propósito, carpeta y CLI—, no qué sabe hacer.

## Dónde está el detalle

- **El mecanismo** que corre al consultado, sus banderas y por qué está armado así: [`comunicar/`](comunicar/README.md).
- **La búsqueda** de instalaciones y de dónde saca los datos: [`buscar/`](buscar/README.md).
- **El lint**, al cerrar una tarea que tocó el registro:

  ```bash
  node .claude/comunicacion/lint-comunicacion/lint-comunicacion.js
  ```

  Chequea la forma del Índice, nombres únicos y no vacíos, que cada carpeta exista y tenga su `.claude/`, y que el CLI sea uno soportado. Un Índice ausente es válido y no genera hallazgos.
