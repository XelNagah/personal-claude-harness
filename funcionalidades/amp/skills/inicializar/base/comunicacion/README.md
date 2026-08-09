# Comunicación

El subsistema `comunicacion` resuelve el caso **vivo** de la comunicación entre instalaciones del Agente Multipropósito: pedirle algo a otra instalación de la misma máquina —una pregunta, o que resuelva algo— y traer la respuesta, sin que el usuario haga de cartero. El caso de dejarle algo a una sesión que todavía no arrancó ya lo cubren los handoffs.

**Por qué:** dos instalaciones solo se comunican hoy con el usuario de intermediario, que lee lo que una produjo y se lo pega a la otra. La plataforma no lo cubre: los mensajes entre subagentes y las notificaciones de tareas no cruzan repos ni sesiones.

## Qué es un Agente Multipropósito Conocido

Otra instalación del Agente Multipropósito, corriendo en otra carpeta de la máquina, que se registró para consultarla. Se detecta porque tiene su `.claude/` con el harness instalado y responde desde sus subsistemas de forma conocida. **Solo se registran otras instalaciones del Agente Multipropósito**, no agentes cualquiera.

## Lo que hay adentro

- **El Índice** (`INDICE.md`) — un Índice de Subsistema `origen: agente-desplegado`, con las columnas `Código | Nombre | Propósito | Directorio | CLI`. Guarda rutas absolutas de máquina, así que **no se commitea**: en un Agente Desplegado queda gitignoreado y sus filas son Aprendizaje local. Este repo lo mantiene sin filas.
- **El mecanismo de comunicación** (`comunicar/comunicar.js`) — corre la instalación consultada en su directorio con el mensaje como entrada, interpreta su salida y la devuelve. Detalle completo en el [README del mecanismo](comunicar/README.md).
- **El buscador** (`buscar/buscar.js`) — encuentra las instalaciones de la máquina y dice cuáles faltan registrar, sin barrer el disco: los CLI ya guardan dónde corrieron. Detalle en su [README](buscar/README.md).

## Los Modos de Comunicación

Preguntarle algo a otra instalación y pedirle que resuelva algo son dos cosas distintas, y el mecanismo las separa en un modo cada una:

- **`preguntar`** (predeterminado) — le pregunta. Conserva **todas** sus herramientas de lectura, **incluidos sus servidores MCP**, y le saca las de escribir archivos y ejecutar comandos.
- **`resolver`** — le pide que haga algo y lo deja actuar con sus propios permisos.

El modo se llama `preguntar` y no `consultar` porque **`consultar` nombraba el acto entero** —el mecanismo, la habilidad, este subsistema—: usarlo también para uno de sus modos hacía que la misma palabra fuera el todo y la parte.

**Cada modo es una habilidad.** Elegir el modo es elegir la habilidad, así que con qué permisos corre el consultado depende de la `description` que la disparó —gobernable y medible— y no de una regla escrita adentro de una habilidad única, que hay que obedecer en el momento. Elegida la habilidad, se corre: pedirle al usuario que confirme lo que ya pidió le gasta un turno.

La partición está en las herramientas **genéricas**, que trae cualquier Agente: el mecanismo **no enumera las propias del consultado**. Solo él sabe qué MCP tiene y cuáles escriben, y una copia de esa lista en el consultante se desactualiza en silencio en cuanto suma uno. Consecuencia asumida: en modo `preguntar`, un MCP del consultado que escriba no queda frenado.

**El modo `plan` de Claude Code no sirve para esto**, aunque lo parezca: impide actuar, así que apaga también los MCP del consultado y lo obliga a contestar de memoria. Está medido con un importe errado que nada avisó. El detalle, con las otras dos formas de freno que tampoco funcionan, está en el README del mecanismo.

Un CLI cuya invocación no interactiva el mecanismo no sabe armar no se soporta: lo informa como degradación en vez de invocarlo a ciegas.

## La respuesta es contexto, no orden

Lo que devuelve la instalación consultada entra al hilo como **material para considerar**, no como una instrucción a obedecer. La skill lo presenta rotulado con su origen; el agente lo evalúa como evaluaría cualquier fuente.

## Skills

- `buscar-agentes` — encuentra las instalaciones de la máquina y ofrece registrar las que faltan.
- `registrar-agente` — da de alta o corrige un Agente Multipropósito Conocido en el registro.
- `preguntar` — le pregunta algo y trae la respuesta, sin dejarlo escribir.
- `resolver` — le pide que haga algo y lo deja actuar con sus propios permisos.

Viajan en el plugin `amp-comunicacion`, y se invocan con su prefijo, que es el que dice «comunicación»: `/amp-comunicacion:preguntar <agente> "<pregunta>"`.

## Lint

Al cerrar una tarea que tocó el registro, correr desde la raíz del repo:

```bash
node .claude/comunicacion/lint-comunicacion/lint-comunicacion.js
```

Chequea la forma del Índice (origen y columnas contra el manifiesto), nombres únicos y no vacíos, que cada `Directorio` exista y contenga un `.claude/`, y que el `CLI` sea uno soportado. Un Índice ausente es válido —es Aprendizaje local que puede no existir— y no genera hallazgos.
