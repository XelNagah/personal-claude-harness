# Invocar a otro agente en una corrida no interactiva

Correr a otro agente desde este —sin nadie mirando del otro lado— para traerse su respuesta. Todo lo de acá se midió contra instalaciones reales el 26-08-08, en unos US$ 3 de consultas pagadas.

El problema no es armar el comando: es que **las tres formas obvias de acotarle los permisos fallan sin emitir señal**. Cada una devuelve una respuesta perfectamente plausible y sale con código 0.

## El freno que apaga lo que el otro agente sabe

`--permission-mode plan` parece la elección natural para «que lea y no escriba». No lo es: ese modo impide **actuar**, y actuar incluye los servidores MCP del consultado.

Medido: un agente que lleva cuentas por un servidor MCP, consultado en ese modo, **contestó desde lo que tenía anotado en un `.md`** en vez de leer sus datos. Uno de los tres importes estaba mal. Nada avisó por ningún canal mecánico: se supo porque el agente lo aclaró escribiéndolo en su respuesta, y porque alguien lo leyó.

Lo peligroso no es el error: es que la respuesta **se ve igual que una buena**. El agente sigue siendo el mismo, contesta con su vocabulario y su formato, y lo único que cambió es de dónde sacó los datos.

Es la forma 1 del conocimiento [controles que dejan de controlar sin avisar](controles-que-no-avisan.md): el control seguía puesto, pero validaba sobre un conjunto vacío de herramientas.

## El freno que no frena y contesta en verde

Con los permisos abiertos (`--permission-mode auto`), **ni `--disallowedTools` ni las reglas de denegación pasadas por archivo de configuración se aplican**. Medido: el archivo de prueba se escribió igual, y la lista de denegaciones de la salida volvió vacía.

Una lista que no frena es peor que ninguna, porque se confía en ella. Si se va a correr en ese modo, no pasar lista: que se vea que no hay freno.

## La combinación que sí funciona

```
--permission-mode dontAsk --allowedTools "mcp__*" --disallowedTools "Write,Edit,NotebookEdit,Bash"
```

- `dontAsk` **deniega** lo no permitido en vez de colgarse esperando una confirmación que nadie va a dar, y lo deja anotado.
- `mcp__*` mantiene vivos **todos** los servidores del consultado sin nombrar ninguno, incluso los que su repo no tiene pre-autorizados.
- La lista de denegación son las herramientas de escritura **genéricas**, que trae cualquier agente: no depende de a quién se consulte.

Verificado contra el mismo agente: trajo un saldo real por su MCP, **no pudo** crear el archivo de prueba, sus datos quedaron con la misma fecha de modificación, y el intento de esquivarlo por consola volvió como denegación estructurada.

⚠️ **Lo que esto no frena** son las herramientas propias del consultado que escriben (un `create_transaction` de su MCP). No hay forma genérica de distinguirlas de las que leen sin enumerarlas, y enumerarlas trae la falla siguiente.

## Enumerarle las herramientas al consultado es el mismo error, más tarde

Tentación natural: que el consultante guarde qué MCP tiene cada agente y le pase la lista. Es el mismo dato escrito dos veces sin control que compare ([evitar el mismo dato en varios lugares](evitar-el-mismo-dato-en-varios-lugares.md)): el consultante no puede lintear el disco de otro repo. En cuanto el consultado suma una herramienta, la lista no la incluye, no la usa, y la respuesta sale peor **sin que falle nada** — exactamente la falla del modo `plan`, más tarde y más difícil de atribuir. Y escala con la cantidad de agentes por la cantidad de herramientas de cada uno: el comando verificado enumeraba 11 nombres para *un* agente.

## Sin salida estructurada la falla no es observable

`--output-format json` no es cosmético: es **lo único** que permite detectar cualquiera de las fallas de arriba. Devuelve la respuesta, el identificador del hilo, si el CLI marcó error, el costo, los turnos y —lo que importa— **las denegaciones de permiso**. Leyendo la salida pelada no hay nada que mirar: una respuesta hecha con la mitad de las herramientas se ve igual que una completa.

## Lo caro es el arranque

El consultado recarga todo su contexto en cada consulta nueva, y eso domina el precio. Medido contra un agente con un repo grande:

| | costo |
|---|---|
| consulta inicial | US$ 0,65 |
| repregunta sobre el mismo hilo (`--resume`) | **US$ 0,03** |
| la misma pregunta en el modelo grande | US$ 0,89 |
| la misma pregunta en el económico | ~US$ 0,36 |

De ahí tres consecuencias prácticas: armar el pedido completo en un solo mensaje, retomar el hilo antes que estrenar uno, y poder elegir el modelo por consulta.

## Un tope de tiempo fijo mata consultas buenas

La primera consulta murió con `ETIMEDOUT` contra un tope de 3 minutos que no había decidido nadie; la que funcionó necesitó **21 turnos**. Cuánto puede tardar una consulta no lo sabe el mecanismo que la lanza. Un tope se ofrece, no se impone.

## El consultado no puede preguntar

Sin nadie del otro lado, un agente que frena a pedir una aclaración gasta el turno entero —y su costo— sin contestar nada. Conviene anteponerle al mensaje una instrucción explícita: elegí la interpretación más razonable, respondé, y dejá la salvedad escrita.

## Cuándo aplica

Todo lo medido es sobre Claude Code y Codex CLI en esta máquina, en agosto de 2026. Las banderas de permisos son de cada CLI y cambian entre versiones; **lo que no caduca es la forma de la falla**: un freno grueso apaga capacidades sin avisar, un freno inaplicable contesta en verde, y sin salida estructurada no hay cómo saber cuál de las dos pasó.
