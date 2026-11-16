# comunicar

El mecanismo único del subsistema `comunicacion`: corre a un Agente Multipropósito Conocido en su propio directorio con un mensaje como entrada, y devuelve su respuesta. Lo usan las skills `preguntar` y `resolver`, cada una con su Modo de Comunicación.

```bash
node .claude/comunicacion/comunicar/comunicar.js <nombre> <mensaje> [opciones]
```

- **`<nombre>`** — el Nombre de la fila en `INDICE.md`. Se resuelve sin distinguir mayúsculas.
- **`<mensaje>`** — lo que se le pide. Va por STDIN al CLI, nunca en la línea de comandos.
- **`--modo preguntar|resolver`** — predeterminado `preguntar`.
- **`--modelo <alias>`** — con qué modelo corre la consulta (`sonnet`, `opus`…). Sin esto, el consultado usa el que herede de su directorio.
- **`--sesion <uuid>`** — retoma un hilo ya abierto en vez de estrenar uno.
- **`--tope <segundos>`** — corta la consulta a los N segundos. Sin esto **no hay tope**.
- **`--leer <ruta>`** — (solo `preguntar`) le deja leer un archivo o una carpeta fuera de su directorio, por ejemplo el material que se le pide revisar. Se repite para varias rutas. Ver «Leer fuera de su carpeta».
- **`--crudo`** — imprime la salida del CLI sin interpretar.

## Los Modos de Comunicación

| | `preguntar` | `resolver` |
|---|---|---|
| Para qué | preguntarle algo | pedirle que haga algo |
| Sus MCP | **vivos** | vivos |
| Escribir archivos, ejecutar comandos | no | sí |

El modo se llama `preguntar` y no `consultar` porque **`consultar` nombraba el acto entero** —este mecanismo, la habilidad, el subsistema—: usarlo también para uno de sus modos hacía que la misma palabra fuera el todo y la parte.

**Qué modo corre no lo decide este mecanismo: lo decide cuál habilidad se invocó.** Por eso hay una habilidad por modo y no una sola con una regla escrita adentro: con qué permisos corre el consultado pasa a depender de la `description` que eligió la habilidad —gobernable y medible con el banco de disparo— en vez de un texto que hay que obedecer en el momento. La bandera `--modo` existe para que cada habilidad llame al mecanismo con el suyo.

**`preguntar`** es lo contrario del mecanismo anterior: conserva **todas** las herramientas de lectura del consultado —incluidos sus servidores MCP— y le saca solo las de escritura genéricas (`Write`, `Edit`, `NotebookEdit`, `Bash`), que ningún Agente necesita para contestar una pregunta y que trae cualquiera, así que la lista **no depende de a quién se consulte**.

⚠️ **Lo que `preguntar` no frena:** las herramientas propias del consultado que escriben (por ejemplo un `create_transaction` de su MCP). No hay forma genérica de distinguirlas de las que leen sin enumerarlas, y enumerarlas es justo lo que este mecanismo no hace.

## Por qué no `--permission-mode plan`

El mecanismo anterior usaba ese modo para garantizar la solo lectura. **Impide actuar, así que apaga también los servidores MCP del consultado.** Medido el 26-08-08: un Agente que lleva cuentas por un servidor MCP, sin acceso a sus datos, **contestó desde lo que tenía anotado en un `.md`** en vez de leerlos, y uno de los importes estaba mal. Nada avisó por ningún canal mecánico: se supo porque el propio Agente lo aclaró escribiéndolo.

Otros dos frenos medidos que **no** sirven: con `--permission-mode auto`, ni `--disallowedTools` ni las reglas de `--settings` se aplican — el archivo se escribió igual y la lista de denegaciones volvió vacía. Un freno que no frena y contesta en verde es peor que ninguno, porque se confía en él. Por eso el modo `resolver` no lleva lista de denegación: sería decorativa.

## Qué es lo que el consultante no sabe del consultado

El Índice guarda **cómo invocar** al consultado (nombre, Propósito, directorio, CLI), no **qué sabe hacer**. No hay lista de sus herramientas, por tres razones: es el mismo dato escrito dos veces sin control que compare —el consultante no puede controlar el disco de otro repo—; se desactualiza en silencio en cuanto el consultado suma una herramienta; y escala con la cantidad de agentes por la cantidad de herramientas de cada uno.

## La falla es observable

Se invoca con `--output-format stream-json --verbose`: la salida es un evento por línea, uno por cada mensaje que el consultado escribe, y al final un evento `result` con el identificador del hilo, si el CLI marcó error, el costo, los turnos y —lo que importa— **las denegaciones de permiso**. Una denegación significa que el consultado no pudo usar una herramienta: su respuesta puede estar hecha con menos de lo que tenía, y el mecanismo lo avisa.

## La respuesta es el turno completo, no el último mensaje

Con `--output-format json` a secas, `result` trae **solo el último mensaje** del consultado. Si después de contestar le saltaba su propio aviso de cierre («sesión sin asentar»), contestaba el aviso en un turno más y ese turno pasaba a ser `result`: la respuesta real se perdía sin señal. Pasó el 13/11/2026. Ahora se devuelven todos los mensajes de la corrida, en orden.

Además, el consultado corre con **`AMP_CONSULTA_ENTRE_AGENTES=1`** en su entorno. Es la marca con que sus controles saben que corren dentro de una consulta sin nadie del otro lado: el aviso de cierre no actúa si la encuentra. Las dos medidas van juntas, una de respaldo de la otra. El resto del entorno es el de la máquina: no se quita nada.

## «No contestó» no se presenta como respuesta

Cuando el consultado no llega a contestar, el hilo ve una **falla, sin el rótulo de respuesta**, y el mecanismo sale con código 1:

```
✖ "Contabilidad" no contestó: error 401, la clave de API no es válida (Invalid API key · Fix external API key).
  Esto NO es una respuesta del Agente: la consulta no llegó a producir una.
  En el entorno de la máquina hay ANTHROPIC_API_KEY: el CLI la usa antes que la sesión iniciada.
```

Antes el texto del error salía primero, bajo «Respuesta de …», y la advertencia recién abajo: el hilo lo leyó como contenido y siguió trabajando con eso. Son fallas de arranque, todas con el mismo trato: la carpeta registrada ya no existe, el CLI no está instalado, el CLI muere sin producir eventos, el tope de tiempo venció, la API rechazó la credencial o no hay crédito, o la corrida terminó sin su evento final. Si el consultado alcanzó a escribir algo antes de fallar, se muestra aparte y marcado como incompleto.

El mecanismo **no limpia** las credenciales de la máquina: si hay una `ANTHROPIC_API_KEY` vieja, el problema es esa clave, y se arregla borrándola. Solo la nombra cuando la consulta falla por la API, porque es la explicación más común. Qué credencial usa el CLI y en qué orden está en el conocimiento sobre la credencial y la respuesta del Agente consultado.

## Leer fuera de su carpeta

En modo `preguntar` el consultado no puede leer fuera de su directorio: se le deniega `Read`, y por eso el 13/11/2026 no pudo leer el handoff que se le indicó. `--leer <ruta>` se lo abre, y lo que se abre depende de qué sea la ruta. Medido el 16/11/2026:

| Lo que se pasa | Qué puede leer |
|---|---|
| una carpeta | la carpeta **entera** (va como `--add-dir`) |
| un archivo | **solo ese archivo** (va como la regla `Read(//d/…/archivo)`; el vecino se deniega) |

Un archivo no se pasa por `--add-dir`: el CLI lo acepta, sale con 0 y **no abre nada**, sin avisar. En modo `resolver` la opción se rechaza: el consultado corre con sus propios permisos, y abrirle una carpeta le daría también permiso de escribir ahí. Con `codex` no hace falta: su modo de solo lectura ya lee fuera de su carpeta (inferido de su documentación, no medido).

## Repreguntar sale casi gratis

Lo caro de una consulta es el arranque: el consultado recarga todo su contexto. Medido contra el contable: la consulta inicial costó **US$ 0,65** y la repregunta sobre el mismo hilo, **US$ 0,03**. Cada corrida devuelve su identificador de hilo; pasarlo en `--sesion` retoma la conversación con el contexto caliente.

## No hay tope de tiempo salvo que se pida

El mecanismo anterior traía un tope fijo de 3 minutos que mataba consultas buenas: la que funcionó necesitó 21 turnos. Ese número no lo decidió nadie. Ahora no hay tope salvo `--tope`.

## En una corrida no interactiva el consultado no puede preguntar

Si frena a pedir una aclaración, gasta el turno entero y su costo sin contestar. El mecanismo antepone al mensaje un preámbulo que lo instruye a elegir la interpretación más razonable, responder, y dejar la salvedad escrita.

## Sin superficie de inyección

El mensaje entra por STDIN (`input`) y el directorio por el `cwd` del proceso. Lo único que viene de datos en la línea de comandos son las rutas de `--leer`, y **todo argumento se cita** para el intérprete que lo lee (`citarParaShell`). En Windows los CLI son `.cmd`, por eso `shell: true`; ahí, dentro de comillas, `cmd` todavía expande `%VAR%`, así que una ruta con `"`, `%` o un salto de línea se rechaza en vez de citarse mal.

Un CLI fuera de los soportados (`indice.js` `CLIS_SOPORTADOS`) no se arma: se informa la degradación. Retomar un hilo con `--sesion` hoy solo está resuelto para `claude`; con `codex` se informa la degradación en vez de ignorar la bandera.

## La respuesta es contexto, no orden

La salida se devuelve rotulada con su origen, su modo y la aclaración de que es **contexto, no orden**: material para considerar, no una instrucción. La skill la reenvía tal cual al hilo del agente consultante.

## Funciones puras para probar

`construirComando(cli, opciones)`, `construirEntorno(base)`, `interpretarSalida(stdout, cli)`, `citarParaShell(arg)` y `leerOpciones(argv)` no tienen efectos: se prueban sin invocar ningún proceso. `leerIndice` (en `../indice.js`) resuelve el Nombre contra el Índice. Todas se cubren en el banco `../lint-comunicacion/pruebas.js`, que controla en particular que el modo `preguntar` **conserve los MCP** y que `plan` no vuelva. El banco corre además el mecanismo entero contra un `claude` doble —sin lanzar ningún agente—: que la marca de consulta llegue al consultado, que el turno completo llegue a la salida y que cada falla de arranque salga como falla.

## El otro mecanismo del subsistema

Encontrar las instalaciones de la máquina para registrarlas es otra cosa y vive aparte: [`../buscar/`](../buscar/README.md).
