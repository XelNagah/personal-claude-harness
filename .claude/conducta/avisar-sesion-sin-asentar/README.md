# avisar-sesion-sin-asentar

Control del momento `al cerrar tarea`: mira la transcripción de la sesión y decide **si el aviso de cierre sale**. No redacta el aviso de fondo — ese texto es el de la regla `Inyectar` de ese momento, que vive en el registro y el usuario edita sin tocar código. Acá se decide callar o hablar, y se aporta el dato medido. **Nunca frena nada**: es clase `Controlar`: la clase del registro que corre un Control y usa lo que devuelve, combinando su `additionalContext` con las reglas del momento, no porque emita `deny`.

**Por qué decide en vez de solo avisar:** `al cerrar tarea` es el único momento donde **hablar cuesta una vuelta completa del modelo**. No existe dejar una nota y que el turno igual cierre: las dos formas de hablarle al modelo —`decision: block` con `reason` y `hookSpecificOutput.additionalContext`— continúan la conversación (verificado contra la documentación oficial el 22/08/2026). Por eso ahí **callar es el default** y el texto fijo sale solo cuando este control lo habilita. Un aviso incondicional dejaría al agente sin poder cerrar, y Claude Code corta recién a las 8 continuaciones seguidas.

## Los dos motivos para avisar

Avisa por uno de los dos, nunca por los dos, y **una sola vez por sesión**.

**A. Sesión sin asentar — se cumplen las tres:**

| | Qué mide | Cómo |
|---|---|---|
| Piso | ¿hubo conversación de verdad? | el texto que **escribieron el usuario y el agente** pasó el corte |
| Sin asentar (archivos) | ¿se escribió algún registro? | ninguna escritura cayó en un `.md` de la casa de un subsistema |
| Sin asentar (habilidades) | ¿se invocó alguna alta? | ninguna invocación de `registrar-*`, `converger-terminologia` o `agregar-subsistema`, por la herramienta `Skill` o tipeada por el usuario |

**B. Alta a mano por consola:** un comando de consola —un `sed -i`, un heredoc, una redirección— dio de alta una fila con un Código que el Índice no tenía, y en la sesión no se invocó ninguna habilidad de ese subsistema. Es el único caso de alta a mano que se avisa al cerrar: el que se hace con la herramienta de edición ya lo avisó [`avisar-alta-a-mano/`](../avisar-alta-a-mano/) en el momento `al escribir`, y este aviso **cuenta solo lo que aquel no vio**. El criterio de qué es un alta a mano vive en [`altas-a-mano.js`](../altas-a-mano.js), compartido por los dos. Para saber si el Código es nuevo se le pregunta a git qué tenía el Índice en el último commit; sin git, o con el Índice sin versionar, no hay con qué comparar y no se avisa, porque corregir una fila vieja no debe avisar.

## El piso mide la conversación, no el archivo

Hasta el 16/11/2026 medía el tamaño del `.jsonl`, y ese archivo arranca con lo que el CLI escribe al iniciar: instrucciones, lista de habilidades, herramientas, avisos de hooks. **Medido: entre 666 y 727 KB en el primer cierre** de las cinco sesiones más recientes de este repo, contra **1,4 a 3,3 KB** de conversación. Con el piso de 200 KB el aviso salía siempre en el primer cierre.

Ahora suma solo lo que escribieron las dos partes: los mensajes del usuario —incluidos los que encoló mientras el agente trabajaba, que no reaparecen como mensaje— y el texto de las respuestas del agente. Quedan fuera las instrucciones y los adjuntos, las entradas y los resultados de herramientas, el pensamiento del modelo, los comandos locales y sus salidas (`/clear`, `!comando`) y los avisos de tareas en segundo plano. Se mide **desde el último `/clear`**: lo de antes ya no está en el contexto del agente y no lo puede evaluar. La revisión de qué se asentó también se hace sobre ese tramo.

**El piso NO cuenta escrituras**, y es a propósito. Contar archivos escritos deja fuera **por construcción** el caso más importante: una conversación larga donde se entendió algo y no se tocó un solo archivo. Las escrituras participan **solo del lado de callarse**: escribir un registro es prueba de que ya se asentó.

⚠️ **Un `.js` bajo la casa de un subsistema no cuenta como asentar.** Un lint o un banco de pruebas es maquinaria. Medido: con el criterio grueso, una sesión de 16 escrituras y ningún registro tocado **no** disparaba.

## El corte: 15 KB, provisorio

`--piso`, default 15000 bytes. Calibrado el 16/11/2026 simulando cada cierre de las 256 transcripciones con al menos un cierre que había en la máquina, de 18 repos:

| Medida | Sesiones donde avisa | Con 0 o 1 pedidos | Pedidos al avisar (mediana) |
|---|---|---|---|
| Archivo ≥ 200 KB (la anterior) | 190 | 184 | 1 |
| Conversación ≥ 12 KB | 38 | 6 | 6 |
| **Conversación ≥ 15 KB** | **18** | **1** | **8** |
| Conversación ≥ 20 KB | 7 | 0 | 11 |
| Conversación ≥ 30 KB | 0 | 0 | — |

El ejemplo de 30 KB que traía el plan **no avisaría nunca**: de las 66 sesiones que no asentaron nada, la de más conversación llega a 27 KB. Las que sí asentaron lo hicieron temprano —mediana a los 3 KB de conversación, el 90 % antes de los 10 KB—. El corte se acomoda a propósito del lado seguro: un aviso de más cuesta un turno; uno de menos pierde el conocimiento y hay que volver a averiguarlo.

## Las guardas

- **Una sola vez por sesión** — marca en `.claude/tmp/avisar-sesion-sin-asentar/<session_id>.txt`, escrita solo al emitir para que el tope cuente avisos y no chequeos. Las marcas de más de 7 días se limpian solas, a mejor esfuerzo.
- **Mudo si `stop_hook_active`** viene en `true`. Esa guarda vive **también** en el repartidor, que es donde protege a todas las reglas del momento; que esté en los dos lados es a propósito.
- **Mudo si corre como agente consultado.** Cuando otra instalación le pregunta algo con `preguntar` o `resolver`, `comunicar.js` lo lanza con la variable de entorno `AMP_CONSULTA_ENTRE_AGENTES=1`. Ahí no hay nadie del otro lado para asentar nada, y continuar la conversación le cambiaría la respuesta al que preguntó. Sale sin emitir, sin bloquear y sin gastar la marca de la sesión.

## Qué es una casa de subsistema

Un directorio de `.claude/` con su `MANIFIESTO.md`. Se descubre así y no leyendo el catálogo porque lo que importa es la carpeta que existe en disco; y vale igual para las casas que suma el Propósito. De una ruta se toma el **último** segmento `.claude/<casa>/`: un worktree vive en `<repo>/.claude/tmp/worktrees/<nombre>/`, y con el primero toda escritura hecha adentro caía en `tmp` y no contaba como asentar.

## Cómo mide y cuánto cuesta

Una pasada por el `.jsonl` **parseando cada línea como JSON**. No se busca con expresiones regulares sobre el texto crudo: ahí las rutas de Windows vienen doble-escapadas, y un patrón que espere una sola barra invertida no matchea, no falla, cuenta cero y el control contesta en verde. Medido el 16/11/2026: **14 ms** sobre una transcripción de 3,2 MB, contra un presupuesto de 100 ms.

## En Codex CLI

El CLI expone `Stop`, pero parsea varios campos de respuesta sin aplicarlos, de modo que el aviso puede no llegarle al modelo aunque el control corra y consuma su marca de sesión. Se emite igual, con la misma forma que en Claude Code.

## Quién lo invoca y cómo se prueba

Lo invoca el hook repartidor `establecer-conducta`, como `Contenido` de la regla correspondiente del registro (`INDICE.md`). No es una Herramienta: es infra del subsistema, co-ubicada por el Patrón.

`node .claude/conducta/avisar-sesion-sin-asentar/pruebas.js` — 40 casos sobre un repo fabricado con git: el piso por conversación (una sesión recién arrancada con el archivo pesado no avisa, una larga sin asentar sí, lo encolado cuenta, lo anterior a `/clear` no), cada forma de asentar (herramienta, consola, parche, habilidad invocada o tipeada), lo que **no** cuenta (un `.js`, un borrador de `tmp/`, leer un registro), las rutas de Windows y las de un worktree, el alta a mano por consola y lo que no lo es, las tres guardas y que ninguna entrada rompa el turno.
