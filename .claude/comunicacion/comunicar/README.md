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

Se invoca con `--output-format json`, así que la salida es un objeto y no texto plano. De ahí salen la respuesta, el identificador del hilo, si el CLI marcó error, el costo, los turnos y —lo que importa— **las denegaciones de permiso**. Una denegación significa que el consultado no pudo usar una herramienta: su respuesta puede estar hecha con menos de lo que tenía, y el mecanismo lo avisa. El mecanismo anterior leía la salida pelada y no podía detectar nada.

## Repreguntar sale casi gratis

Lo caro de una consulta es el arranque: el consultado recarga todo su contexto. Medido contra el contable: la consulta inicial costó **US$ 0,65** y la repregunta sobre el mismo hilo, **US$ 0,03**. Cada corrida devuelve su identificador de hilo; pasarlo en `--sesion` retoma la conversación con el contexto caliente.

## No hay tope de tiempo salvo que se pida

El mecanismo anterior traía un tope fijo de 3 minutos que mataba consultas buenas: la que funcionó necesitó 21 turnos. Ese número no lo decidió nadie. Ahora no hay tope salvo `--tope`.

## En una corrida no interactiva el consultado no puede preguntar

Si frena a pedir una aclaración, gasta el turno entero y su costo sin contestar. El mecanismo antepone al mensaje un preámbulo que lo instruye a elegir la interpretación más razonable, responder, y dejar la salvedad escrita.

## Sin superficie de inyección

El mensaje entra por STDIN (`input`) y el directorio por el `cwd` del proceso, así **nada que venga de datos toca la línea de comandos sin comillar**. Los argumentos son literales fijos del comando. En Windows los CLI son `.cmd`, por eso `shell: true`; su riesgo queda anulado porque no hay datos en los argumentos.

Un CLI fuera de los soportados (`indice.js` `CLIS_SOPORTADOS`) no se arma: se informa la degradación. Retomar un hilo con `--sesion` hoy solo está resuelto para `claude`; con `codex` se informa la degradación en vez de ignorar la bandera.

## La respuesta es contexto, no orden

La salida se devuelve rotulada con su origen, su modo y la aclaración de que es **contexto, no orden**: material para considerar, no una instrucción. La skill la reenvía tal cual al hilo del agente consultante.

## Funciones puras para probar

`construirComando(cli, opciones)`, `interpretarSalida(stdout)` y `leerOpciones(argv)` no tienen efectos: se prueban sin invocar ningún proceso. `leerIndice` (en `../indice.js`) resuelve el Nombre contra el Índice. Todas se cubren en el banco `../lint-comunicacion/pruebas.js`, que controla en particular que el modo `preguntar` **conserve los MCP** y que `plan` no vuelva.

## El otro mecanismo del subsistema

Encontrar las instalaciones de la máquina para registrarlas es otra cosa y vive aparte: [`../buscar/`](../buscar/README.md).
