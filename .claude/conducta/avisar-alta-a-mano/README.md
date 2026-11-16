# avisar-alta-a-mano

Control del momento `al escribir`: avisa cuando una escritura da de alta una fila en un Índice de Subsistema sin pasar por la habilidad de ese subsistema. **Avisa y no frena** (Decisiones `Local-0038` y `Local-0052`): el aviso llega junto al resultado de la escritura, con el archivo ya escrito.

**Por qué existe:** medido sobre un mes de conversaciones, el 43 % de las altas en registros (34 de 79) se hicieron escribiendo la fila a mano. La habilidad de alta es la que controla duplicados, contradicciones con lo asentado y el lint; una fila escrita a mano se saltea las tres.

**Qué es un alta a mano — las dos pistas juntas:**

1. Aparece una fila con un Código que el Índice no tenía. Se compara el Índice en disco con cómo va a quedar después de aplicar la escritura, así que corregir una fila vieja o moverla de lugar no avisa.
2. En la sesión no se invocó ninguna habilidad de ese subsistema, ni por la herramienta `Skill` ni tipeada por el usuario.

Las habilidades de cada subsistema salen de la columna `Operación` del catálogo de subsistemas, no de una lista escrita acá: vale igual para las casas que suma el Propósito. Una casa sin fila en el catálogo acepta cualquier habilidad de alta (`registrar-*`, `converger-terminologia`, `agregar-subsistema`), para errar del lado de callar. El criterio entero vive en [`altas-a-mano.js`](../altas-a-mano.js), compartido con [`avisar-sesion-sin-asentar/`](../avisar-sesion-sin-asentar/).

**Qué cuenta como Índice:** un `.md` de la casa de un subsistema que declara `indice` en su frontmatter. Las páginas de detalle no. Los borradores de `tmp/` tampoco, medidos contra la raíz del repo al que pertenece el archivo.

**Lo que no ve:** las escrituras por consola (`sed -i`, heredocs, redirecciones), que no pasan por `Write`/`Edit` y por lo tanto no disparan el momento. Esas las avisa `avisar-sesion-sin-asentar` al cerrar la tarea; y al revés, el alta que este control ya avisó no se vuelve a avisar al cerrar.

**Herramientas que mira:** `Write`, `Edit` y `MultiEdit` de Claude Code, y `apply_patch` de Codex, donde lo agregado son las líneas con `+` del parche.

**Costo:** la transcripción se lee solo cuando la escritura trae un Código nuevo en un Índice, que es raro. En el resto de las escrituras el control lee el archivo en disco y sale.

**Quién lo invoca:** el hook repartidor `establecer-conducta`, como `Contenido` de una regla `Controlar` del momento `al escribir`. No es una Herramienta: es infra del subsistema, co-ubicada por el Patrón.

**Pruebas:** `node .claude/conducta/avisar-alta-a-mano/pruebas.js` — 17 casos sobre un repo fabricado: el alta por `Edit`, `Write` y `apply_patch`; lo que no es un alta a mano (corregir, reordenar, con la habilidad del subsistema invocada, una página que no es Índice, un borrador, un `.md` fuera de toda casa); que la habilidad de otro subsistema no lo calla, y que ninguna entrada rompa la escritura.
