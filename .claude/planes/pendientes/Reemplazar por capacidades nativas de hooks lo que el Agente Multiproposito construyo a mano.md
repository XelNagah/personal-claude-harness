# Reemplazar por capacidades nativas de hooks lo que el Agente Multipropósito construyó a mano

**Estado: Análisis · Creado 26-09-10 · Analizado 26-09-11.**

Claude Code amplió los hooks muy por encima de lo que este repo tiene asentado, y varias
de las capacidades nuevas hacen de forma nativa cosas que el Agente Multipropósito
construyó a mano, o cubren agujeros que hoy no cubre nadie. Este plan releva cuáles
convienen, cuáles no, y qué se retira cuando entran.

## De dónde sale, y en qué grado está verificado cada cosa

El relevamiento de partida es del 10/09/2026, hecho sobre la referencia oficial de hooks y
la de worktrees, contra la versión **2.1.267**. El análisis del 11/09/2026 volvió a bajar
las dos referencias y midió lo que se podía medir sin gastar una corrida.

Este documento usa **tres grados**, y ninguna afirmación de acá abajo va sin uno:

- **Medido** — se observó en esta máquina, y el documento dice cómo. Es lo único que
  cuenta como verificado según la Preferencia Base-0009 (*Distinguir lo verificado de lo
  inferido o generado*).
- **Documentación leída** — está en la referencia oficial, bajada el 11/09/2026, y se cita
  lo que dice. Que lo diga no significa que lo haga: el conocimiento Local-0004 (*Hooks de
  Codex CLI*) asentó un `deny` documentado que no frena la escritura, y el conocimiento
  Local-0017 (*Invocar a otro agente en una corrida no interactiva*) midió tres frenos de
  permisos que fallan en verde.
- **Inferencia** — la sacó este análisis encadenando las dos cosas anteriores. No se
  ejecuta nada apoyado solo en una inferencia.

**Medido el 11/09/2026, y cambia dos cosas del plan de partida:**

1. **La versión instalada es 2.1.268**, no 2.1.267 (`claude --version`). Por número de
   versión, las siete capacidades están disponibles.
2. **El aislamiento por copia del mecanismo de subagentes ya trae lo que git ignora, sin
   declarar nada.** Esta misma corrida trabajó en
   `.claude/worktrees/agent-a2d372a912bdaa2d4` —la ubicación por omisión de la
   plataforma, no la de `preparar-worktree`, que es `.claude/tmp/worktrees/`—. El repo
   **no tiene** `.worktreeinclude` y **no tiene** ningún hook `WorktreeCreate`
   (`.claude/settings.json` declara solo `SessionStart`, `UserPromptSubmit`, `PreToolUse`
   y `Stop`). Aun así `.claude/settings.local.json` llegó a la copia **idéntico** al del
   repo principal (`cmp` sin diferencias, mismo tamaño y misma fecha), y `.claude/tmp/`
   no llegó. ⚠️ **No se observó el momento de la creación**: que lo haya copiado la
   plataforma y no el agente coordinador que lanzó esta corrida es una **inferencia**, y
   es la primera medición de la etapa 1.

## Estado de verificación, capacidad por capacidad

| # | Capacidad | Medido | Documentación leída | Inferencia que queda abierta |
|---|---|---|---|---|
| 1 | `.worktreeinclude` | Que la copia por omisión ya trae `settings.local.json` sin declararlo | El archivo, su sintaxis, que solo copia lo ignorado que además matchea, el caso `**/` con un directorio ignorado entero, y que un hook `WorktreeCreate` lo apaga | Quién hizo la copia que se observó |
| 2 | `SubagentStart` | Nada | El evento, el matcher por tipo de agente con el identificador con prefijo del plugin, que **no puede frenar** la creación, y que solo inyecta `additionalContext` | Si el matcher con prefijo engancha a un subagente que viaja en un plugin |
| 3 | `PermissionRequest` | Nada | Que corre **solo cuando la plataforma va a pedir permiso**, o cuando auto-denegaría una llamada que no puede preguntar; el objeto `decision` con `behavior`, `updatedInput`, `updatedPermissions` y `message` | Si dispara en el escenario exacto del hallazgo 1 del plan Local-0119 |
| 4 | `PermissionDenied` | Nada | Que corre cuando **el modo automático** deniega; que la denegación **ya ocurrió**; que su única salida es `retry: true`, ignorado en las denegaciones sin veredicto del clasificador | Si `dontAsk` cuenta como modo automático a estos efectos |
| 5 | Hooks en segundo plano | Nada | `async: true` solo en hooks de comando; el resultado se entrega **solo mientras la sesión viva** y en `-p` se cancela al cerrar; ni `additionalContext` ni `systemMessage` se le muestran al usuario | Ninguna: la documentación ya contesta que no reemplaza el Buzón |
| 6 | Hooks `prompt` y `agent` | Nada | Los campos `prompt` y `model`; **plazos por omisión de 30 s (`prompt`) y 60 s (`agent`)**; `agent` experimental | Cuánto tarda de verdad uno de estos en `PreToolUse` |
| 7 | `WorktreeCreate` / `WorktreeRemove` | Nada | Que `WorktreeCreate` reemplaza el comportamiento por omisión entero y **apaga `.worktreeinclude`**; que su hook de comando **no puede devolver JSON** porque su salida estándar es la ruta; y que **para los worktrees de git la limpieza la hace la plataforma con `git worktree remove`** | Si esa limpieza automática corre también al terminar un subagente aislado, y qué hace con un enlace adentro |

## Las siete capacidades, y qué resuelve cada una

### 1. `.worktreeinclude` — los archivos que git ignora llegan solos a la copia

Un archivo en la raíz del proyecto, con sintaxis de `.gitignore`, que declara qué archivos
**ignorados** se copian a cada worktree nuevo. Se aplica a `claude --worktree`, a los
subagentes con aislamiento por worktree y a las sesiones en segundo plano.

**Veredicto: reemplaza, en parte, a la Herramienta Base-0009 (`preparar-worktree`).**

Era la objeción con la que la medición del plan Local-0119 descartó el aislamiento por
copia del mecanismo de subagentes: «arma un `git worktree add` pelado, sin
`settings.local.json`, y el agente de adentro arranca sin plugins y sin señal». **Medido
el 11/09/2026, esa objeción ya es falsa sin configurar nada**: la copia llegó con su
`settings.local.json`. Si la medición 1 de la etapa 1 confirma que el copiador es la
plataforma, `.worktreeinclude` deja de ser lo que hace caer la objeción y pasa a ser lo
que amplía la lista de lo que se trae.

**Lo que `preparar-worktree` hace y esta capacidad no cubre**, y por eso el reemplazo es
parcial: elegir una raíz corta cuando la ruta no entra en el límite de Windows —diciendo
por qué—, y no copiar lo que está sin commitear. Las dos son decisiones de este repo, no del
mecanismo.

⚠️ **Dos límites, los dos documentación leída.** Un patrón que empieza con `**/` no
alcanza lo que está adentro de un directorio ignorado entero salvo que el primer nombre
después del `**/` sea uno de los nombres del camino — la referencia usa `**/.claude/…`
como su propio ejemplo, que es justo el caso de este repo. Y **no se aplica si se
configura un hook `WorktreeCreate` propio**: las capacidades 1 y 7 son alternativas, no
complementos.

### 2. `SubagentStart` — inyectarle contexto al subagente antes de su primer turno

Devuelve `additionalContext` y entra al contexto del subagente antes de su primer prompt.
Filtra por tipo de agente, con el identificador con prefijo del plugin para los subagentes
que viajan en uno (`amp-planes:relevador-de-planes`); como el dos puntos lo manda por el
camino de las expresiones regulares, el matcher se ancla: `^amp-planes:relevador-de-planes$`.

**Veredicto: tapa un agujero abierto, y el mecanismo casero al que reemplaza es
literalmente ninguno.** Hoy la restricción de alcance de cada subagente se escribe a mano
en el prompt de quien lo lanza, así que no vive en ningún archivo y se reescribe cada vez.
**Confirmado por el usuario y por esta corrida**, que se lanzó exactamente así: la lista
de qué podía y qué no podía escribir vino en el texto del pedido.

Toca la Decisión Local-0060 (*El Agente Multipropósito transporta subagentes, y las
habilidades delegan en ellos el recorrido*), que fija que cada subagente viaja con el
plugin de su subsistema: si el alcance se entrega por hook del mismo plugin, viaja con el
subsistema y no con quien lo invoca. Es la capacidad que más se parece a lo que el repo ya
decidió y menos le cuesta adoptar.

⚠️ **Lo que esta capacidad no es.** `additionalContext` es contexto, no cumplimiento: le
dice al subagente qué no debe escribir, no se lo impide. El agujero que tapa es **dónde
vive la restricción**; el de **que se cumpla** es la capacidad 3. Confundirlos deja el
agujero abierto con la sensación de haberlo cerrado — que es el modo de falla «la recita
sin obedecer» del conocimiento Local-0001 (*Modos de falla ante reglas escritas*).

### 3. `PermissionRequest` — conceder o denegar en lugar del usuario

Permite denegar con motivo y permitir con `updatedPermissions`, que incluye
`addDirectories` y reglas de permiso con destino en memoria o en un archivo de
configuración.

**Veredicto: tapa un agujero, pero no el que el plan de partida decía, y no con el
mecanismo que nombraba.** El análisis corrige el relevamiento en dos puntos:

- **Para acotar por dónde escribe un agente, el punto no es este evento.** La referencia
  es explícita: `PreToolUse` corre antes de **cada** llamada, necesite permiso o no;
  `PermissionRequest` corre **solo** cuando la plataforma va a preguntar, o cuando
  auto-denegaría una llamada en una sesión que no puede preguntar. Una escritura que las
  reglas ya permiten no pasa por acá. El freno por ruta —el hallazgo 2 del plan Local-0119,
  *el worktree no contiene al agente de adentro*— se realiza con un `deny` de `PreToolUse`,
  que **no es capacidad nueva** y que este repo ya tiene enganchado: el repartidor
  `establecer-conducta` corre en `PreToolUse` con matcher `Write|Edit` y su clase
  `Controlar` ya sabe devolver `permissionDecision: deny`. Lo que falta es la regla, no el
  mecanismo.
- **Lo que sí es nuevo, y sí tapa un agujero, es la otra punta.** En una sesión que no
  puede mostrar un diálogo —un subagente en segundo plano, una corrida `-p`— la
  plataforma corre igual estos hooks y, **si ninguno devuelve decisión, deniega la
  llamada**. Eso describe el hallazgo 1 del plan Local-0119: dos corridas con **todo**
  `Write` y `Edit` denegado pese a estar nombrados en `--allowedTools`, 463 s y US$ 3,13
  perdidos. `PermissionRequest` con `decision.behavior: "allow"` es la forma documentada
  de conceder ahí, en vez de pelearle a la combinación de banderas.

**Mecanismo casero al que reemplaza:** la contramedida asentada en el plan Local-0119 —
lanzar siempre con `--output-format json` y revisar `permission_denials` después de que la
corrida se gastó. Reemplaza la revisión posterior por una concesión previa.

### 4. `PermissionDenied` — las denegaciones dejan de ser invisibles

Evento propio cuando se deniega un permiso.

**Veredicto: tapa a medias el mismo agujero que la capacidad 3, contra el mismo mecanismo
casero, y es la candidata más clara a sobreingeniería.** Tres reparos, los tres
documentación leída:

- **Llega tarde por diseño.** La denegación ya ocurrió; el hook no la revierte. Su única
  salida es `retry: true`, y la referencia aclara que se **ignora** cuando el clasificador
  no produjo veredicto.
- **Le habla al agente equivocado.** El aviso entra al contexto del agente denegado. En la
  corrida del plan Local-0119, el que tenía que enterarse era el hilo coordinador que
  lanzó las tres copias, y este evento no le habla.
- **Puede no disparar en el caso que lo motivó.** La referencia lo describe como el evento
  del **modo automático**. Las corridas del hallazgo 1 se lanzaron con
  `--permission-mode dontAsk`. Si `dontAsk` no cuenta, el evento no cubre nada de lo que
  se lo está invocando a cubrir. Es una **inferencia**, y es una medición de la etapa 1.

### 5. Hooks en segundo plano — el mecanismo ya viene hecho, y no es el mismo

Un hook de comando marcado `async: true` no frena el turno, y su salida se entrega en el
turno siguiente.

**Veredicto: no reemplaza el Buzón de Avisos Generales (Decisión Local-0051, término del
glosario Local-0034). Se queda como está.** El plan de partida ya lo sospechaba; la
documentación bajada el 11/09/2026 lo cierra, con tres divergencias:

- **El aviso muere con la sesión que lo lanzó.** La referencia dice que los resultados se
  entregan **solo mientras la sesión corre**, y que en modo `-p` la plataforma mata el
  hook pendiente al cerrar y lo finaliza como cancelado. El Buzón sobrevive al cierre del
  proceso y entrega en el arranque siguiente, que es su razón de ser.
- **Le habla al modelo y no al usuario.** En un hook `async`, ni `additionalContext` ni
  `systemMessage` se le muestran al usuario. El aviso de plugins atrasados de este repo va
  al usuario.
- **La propia referencia recomienda el mecanismo casero.** Textual: si el trabajo tiene que
  sobrevivir a la sesión, hay que arrancar desde el hook un proceso completamente
  desprendido. Es exactamente lo que el repo construyó.

Lo que sí conviene: usar `async` como **transporte adicional** —el trabajo desprendido
sigue escribiendo en el Buzón, y además puede avisar en la misma sesión si todavía
vive—, no como reemplazo. Eso es aditivo y no retira nada, en la línea de la Preferencia
Local-0006 (*Analizar y diseñar de alto a bajo nivel*).

### 6. Hooks por prompt y por agente — un Control que juzga significado

Además de los hooks de comando, hay hooks de tipo `prompt` (una llamada a un modelo rápido,
con los campos `prompt` y `model`) y de tipo `agent` (un subagente con herramientas de
lectura, que devuelve si pasa o no). Los dos corren en los eventos de herramienta y de
permiso, no en todos.

**Veredicto: no aplica donde el plan de partida lo proponía, y sí aplica en otro lado.**

- **Contra `detectar-terminologia-vetada`: no aplica, y adoptarlo re-decidiría una decisión
  vigente.** La Decisión Local-0038 (*El control al escribir frena por término sin uso
  legítimo*) ya resolvió exactamente esta pregunta y la resolvió al revés: el control queda
  en dos velocidades —`bloquea` donde el falso positivo es imposible, `avisa` donde depende
  del significado, «la máquina marca y el agente juzga»— porque medido, el Frente A del
  barrido dio **41 apariciones y solo 14 reales**. Poner un modelo en el momento de la
  escritura es volver a intentar lo que esa decisión descartó, y encima en el camino
  crítico. Si se quiere hacer igual, se hace revirtiendo la Decisión Local-0038 a la
  vista, no de costado.
- **Contra la Decisión Local-0003 (*Integridad en dos capas*): sí aplica, y es la forma más
  concreta que apareció hasta ahora de construir la capa que le falta.** Esa capa está
  «pendiente de formalizar» desde el 18/07/2026 y su plan Local-0006 está Diferido desde la
  misma fecha. Pero el Chequeo semántico **no es un momento de escritura**: es una pasada
  sobre un texto. Ahí el plazo no se le paga al usuario en cada tecla.
- **El plan Local-0118** (*El Contraste automático no lee los archivos que se le pasan*),
  En curso, es el otro candidato natural y el plan de partida no lo nombraba.

⚠️ **El costo, ahora con número.** El conocimiento Local-0005 (*Latencia de los hooks de
Claude Code*) fija menos de 100 ms por evento bloqueante. Los **plazos por omisión** de
estos dos tipos son **30 s para `prompt` y 60 s para `agent`** — 300 y 600 veces el
presupuesto. No es que «no entra ni cerca»: es que la plataforma ni siquiera los diseñó
para esa escala. Y `agent` está declarado experimental en la propia referencia.

**Nota de semántica, porque se lee al revés.** El término del glosario Local-0013 (*Momento
de conducta*) dice que un momento es un evento de hook más una condición que la máquina
evalúa **sin juicio**, y que lo que necesita juicio no es un momento. Un hook por prompt
**no** contradice eso: el juicio va en la **acción** —la clase `Controlar`, Decisión
Local-0079—, no en la condición del momento. Conviene decirlo al registrarlo, o la próxima
lectura va a ver una contradicción que no está.

### 7. `WorktreeCreate` y `WorktreeRemove` — enganches del ciclo de vida de las copias

Se disparan al crear y al borrar una copia, incluidas las de los subagentes con
aislamiento por worktree. El de creación **reemplaza** el comportamiento por omisión y debe
devolver la ruta.

**Veredicto: reemplaza el enganche de las dos Herramientas del ciclo de copias — Base-0009 (`preparar-worktree`) y
Base-0010 (`limpiar-worktree`) —que hoy se invocan a mano— pero se lleva por delante la
capacidad 1 y no cubre el freno de la de limpieza.** Tres precisiones que el análisis suma:

- **Es excluyente con la capacidad 1**, ya dicho: configurar `WorktreeCreate` apaga
  `.worktreeinclude` y obliga a copiar lo ignorado adentro del guion del hook.
- **El hook de comando de creación no puede devolver JSON**, porque su salida estándar se
  lee como la ruta del worktree. Todo lo que hoy `preparar-worktree` informa —por qué cayó
  en una raíz corta, qué copió— tendría que salir por otro canal.
- **La referencia trae un dato que no estaba en el relevamiento y es el más serio:** para
  los worktrees de git, **la limpieza la hace la plataforma sola con `git worktree
  remove`**, y `WorktreeRemove` existe como contraparte para los sistemas que no son git.
  Ese es exactamente el comando que la Decisión Local-0080 (*Un worktree recibe una copia de
  `.claude/`, nunca un enlace, y no se limpia con `git worktree remove`*) prohíbe y que el
  conocimiento Base-0007 explica: en Windows atraviesa el enlace y vacía el destino.
  **Inferencia con la que hay que tener cuidado en las dos direcciones:** el daño que esas
  dos entradas describen necesita un enlace adentro de la copia, y una copia nativa no lo
  tiene —«copia, nunca enlace» es la mitad de la misma decisión—, así que probablemente no
  haya nada que atravesar. Pero es una inferencia sobre el mecanismo destructivo ya medido
  de este repo, y por eso es la medición más cara de no hacer.
- Sobre el freno, el plan de partida se pasó de tajante. La referencia dice que **una salida
  distinta de cero de `WorktreeRemove` hace fallar el borrado si el directorio sigue
  existiendo después**. No es «no puede frenar»: es que, para una copia de git, el hook no
  es quien borra. El freno que `limpiar-worktree` tiene hoy —parar cuando el agente escribió
  en el `.claude/` de la copia— no se traslada ahí sin medirlo.

## Además: una salida alternativa para el plan Local-0099

**Documentación leída, confirmada el 11/09/2026 y textual:** cuando varios hooks devuelven
`additionalContext` para el mismo evento, el modelo recibe **todos** los valores. El plan
Local-0099 describe que una regla `Inyectar` pisaría el `additionalContext` de la Pantalla
de bienvenida al arrancar; eso pasa porque las dos salen del **mismo** hook repartidor, que
arma un solo JSON. Declarar dos entradas de hook en vez de una haría que la plataforma las
junte sola.

No es obviamente mejor: partir el repartidor cambia el modelo del subsistema `conducta`, y
el arreglo que ese plan ya tiene analizado —fusionar adentro— es más chico. Queda anotado
para que quien lo ejecute lo compare, no como recomendación. El plan Local-0099 está en
estado `Listo`, así que la comparación tiene dueño y no hay que moverla acá.

## Lo que el análisis corrigió del plan de partida

Cinco puntos, para que no se ejecute lo que decía la versión anterior:

1. **La objeción que descartó el aislamiento por copia del mecanismo de subagentes ya era
   falsa cuando se escribió el plan** — medido el 11/09/2026.
2. **La capacidad 3 no es el mecanismo para acotar la escritura.** Ese es `PreToolUse`, que
   el repo ya engancha. Lo que la capacidad 3 tapa es la denegación en una sesión que no
   puede preguntar.
3. **La capacidad 6 contra `detectar-terminologia-vetada` re-decide la Decisión
   Local-0038**, que ya descartó medir el significado por máquina en ese punto.
4. **La capacidad 7 no cubre `limpiar-worktree`, y además revela que el aislamiento por
   omisión llama a `git worktree remove`**, el comando que la Decisión Local-0080 prohíbe.
5. **La página de conocimiento Local-0003 está menos vieja de lo que el plan dice.** No es
   que «diga nueve eventos» y nada más: tiene un Apéndice A que ya nombra
   `PermissionRequest`, `PermissionDenied`, `SubagentStart`, y los tipos `agent`, `prompt`
   y los campos `async`/`asyncRewake` — marcados **sin verificar** y con la instrucción
   expresa de chequearlos contra la versión instalada antes de usarlos. El Apéndice hizo
   su trabajo. Lo que hay que actualizar es otra cosa (ver abajo).

## Contraste contra las páginas de conocimiento de hooks que ya existen

### `hooks-claude-code.md` (conocimiento Local-0003) — no está caduca, está incompleta

**Lo que quedó viejo:** el conteo. La referencia del 11/09/2026 lista **34 eventos** en su
tabla de resumen, contra los 9 del núcleo que la página documenta como firmes. El §2, que
dibuja «el ciclo de una vuelta» con esos 9, describe un subconjunto y no lo dice.

**Lo que sigue valiendo entero:** el contrato de proceso (§1), el contrato de control por
código de salida y por JSON (§4.1 y §4.2), la distinción `systemMessage` al usuario contra
`additionalContext` al modelo (§4.3), la precedencia y el paralelismo entre hooks (§5.3), y
los errores típicos (§7). Nada de eso lo tocó ninguna de las siete capacidades.

**Lo que hay que sumarle, y no estaba ni en el Apéndice A:**

- **`${CLAUDE_PROJECT_DIR}` no sigue al agente a la copia.** La referencia trae una sección
  nueva, *Worktrees are different*: la variable **se queda apuntando a la raíz donde arrancó
  la sesión**, y lo que sigue a la copia es el campo `cwd` del JSON de entrada. El §5.6 de
  la página enseña a resolver la raíz usando la variable como punto de partida y subiendo
  hasta encontrar `.claude` — y en una copia la variable ya apunta a un directorio que
  **tiene** `.claude`, así que el bucle corta en el primer paso y el hook entrega los
  registros del repo principal. Es la misma clase de falla que el §5.6 dice evitar, con el
  signo cambiado: no acierta el repo vecino, acierta el repo padre. ⚠️ **Inferencia, no
  medida**: la variable no se pudo leer desde acá porque la herramienta de consola no
  corre con el entorno del hook. Es la medición 0 de la etapa 1, y es una precondición de
  todo lo demás — el `commit` 1e5311d acaba de arreglar que el control de terminología no
  revisaba nada adentro de una copia, y esto sería el mismo agujero por otra puerta.
- Los tipos de hook `prompt` y `agent` con sus **plazos por omisión** (30 s y 60 s), que es
  el dato que decide si entran o no en un evento bloqueante.
- Que **varios `additionalContext` del mismo evento se suman** en vez de pisarse.
- Que en una sesión que no puede preguntar, **sin hook que decida, la llamada se deniega**.

### `hooks-codex-cli.md` (conocimiento Local-0004) — marcada caduca, y envejeció al revés

La página se declara de caducidad rápida y acertó, pero lo que cambió la **mejora** para
este plan, no la empeora. Su propia lista de eventos ya incluye **`SubagentStart`** y
**`PermissionRequest`**. O sea: las capacidades 2 y 3 —las dos que este análisis recomienda
mirar primero— **no agrandan la distancia** contra la paridad que fija la Decisión
Local-0010. Las que sí la agrandan son la 1, la 5, la 6 y la 7, que no tienen contraparte
declarada en Codex CLI.

**Lo que de esa página hay que volver a chequear antes de apoyarse en ella**, porque tiene
más de un mes y sus dos límites mayores eran fallas abiertas: si el `deny` sobre
`apply_patch` sigue sin frenar la escritura (falla #27833) — que es lo que decide si un
freno de escritura es realizable en Codex CLI o solo en Claude Code —, y si sigue haciendo
falta darle confianza a mano a cada hook, que es lo que hace que un hook distribuido no
arranque solo.

### `latencia-hooks.md` (conocimiento Local-0005) — vigente, y es lo que decide la capacidad 6

No la tocó nada. Sus números —~50 ms de arranque de Node, ~30 ms de una inyección de texto
sin intérprete, ~140 ms de PowerShell— y su presupuesto de menos de 100 ms por evento
bloqueante siguen siendo el criterio. Lo que este análisis le suma es el otro lado de la
comparación: los plazos por omisión de los hooks por prompt y por agente. **La página no
está vieja; está siendo usada por primera vez para rechazar algo.**

## Etapa 1 — la medición

Ocho mediciones, en un repo de prueba chico y a propósito, en este orden. Ninguna capacidad
se adopta antes de la suya. Cada una dice **qué resultado la hace abandonar**.

| # | Cap. | Qué se mide | Con qué | Qué resultado hace abandonar |
|---|---|---|---|---|
| M0 | — | Qué trae `${CLAUDE_PROJECT_DIR}` y qué raíz resuelve la receta del §5.6 del conocimiento Local-0003, para un hook que corre adentro de una copia | Un hook `SessionStart` de cuatro líneas que imprime la variable, el `cwd` y la raíz resuelta, lanzado en una copia | No se abandona nada: si resuelve el repo principal, **se frena todo lo demás** hasta arreglarlo, porque el harness de conducta adentro de una copia estaría leyendo los registros del otro repo |
| M1 | 1 | Quién copia lo ignorado, y qué copia | Repo de prueba con tres archivos ignorados (`settings.local.json`, `.claude/tmp/x.txt`, `.env`), un subagente con aislamiento por copia, sin `.worktreeinclude` ni hook, y listar lo que llegó | Si no llega nada, la objeción del plan Local-0119 seguía en pie y lo medido acá fue obra del coordinador: `.worktreeinclude` pasa de «amplía» a «imprescindible», y no se abandona — se reordena |
| M2 | 1 | Si un patrón de `.worktreeinclude` alcanza lo ignorado que está adentro de `.claude/` | El mismo repo, con `**/.claude/tmp/*` y con `.claude/tmp/**`, comparando qué llega con cada uno | Si ningún patrón trae lo de adentro de un directorio ignorado entero, la capacidad 1 no sirve para este repo y queda solo la 7 |
| M3 | 7 | Qué corre la plataforma al terminar un subagente aislado, y qué le hace a un enlace adentro de la copia | Copia nativa con un enlace adentro apuntando a una carpeta con un archivo centinela; terminar el subagente; verificar el centinela | Si el centinela desaparece, **el aislamiento por copia nativo no se adopta** mientras no haya forma de evitar `git worktree remove`, y las dos Herramientas del ciclo de copias (Base-0009 y Base-0010) se quedan enteras |
| M4 | 2 | Si `SubagentStart` dispara para un subagente que viaja en un plugin, y si su texto llega | Hook con matcher `^amp-planes:relevador-de-planes$` que emite un texto centinela; invocar la habilidad que lo usa; pedirle al subagente que repita el centinela | Si el matcher con prefijo no engancha o el texto no aparece, la capacidad 2 se abandona y la restricción sigue en el prompt de quien lanza |
| M5 | 3 y 4 | Si `PermissionRequest` dispara y concede en el escenario exacto del hallazgo 1 del plan Local-0119, y si `PermissionDenied` dispara en esa denegación | Sesión `-p` con `--permission-mode dontAsk` y una escritura de prueba de una línea, con los dos hooks puestos y registrando | Si `PermissionRequest` no dispara ahí, se abandona la 3 para este uso. Si `PermissionDenied` no dispara con `dontAsk`, **se abandona la 4 entera**: no le queda ningún caso |
| M6 | 5 | Si el resultado de un hook `async` sobrevive al cierre de la sesión que lo lanzó | Hook `async: true` que duerme más de lo que tarda la sesión `-p`, y mirar si el aviso aparece en la sesión siguiente | Ya está decidido por documentación: la medición es para **confirmar antes de no retirar nada**. Si sobrevive, se reabre la comparación con el Buzón |
| M7 | 6 | Cuánto tarda de verdad un hook `type: "prompt"` en un evento bloqueante | Hook por prompt trivial en `PreToolUse` sobre `Write`, cinco corridas, tomando el peor tiempo | Si el peor tiempo pasa de 1 s, se abandona el uso en el camino crítico —diez veces el presupuesto del conocimiento Local-0005— y queda solo el uso fuera de él |

**Lo que la etapa 1 no incluye a propósito:** nada que escriba en los registros del repo,
ninguna adopción, y ningún cambio a `settings.json` del repo que no se revierta al
terminar. La etapa 1 produce números y una respuesta por capacidad, no código.

## Sobreingeniería: lo que no vale el cambio aunque funcione

- **La capacidad 4 (`PermissionDenied`).** Aunque dispare, avisa después del daño, le habla
  al agente equivocado y su único efecto —`retry`— está condicionado a un veredicto que en
  el caso que la motivó puede no existir. La capacidad 3 resuelve la causa. Adoptar las dos
  es pagar dos mecanismos para un problema.
- **La capacidad 6 en el momento de escribir.** Un modelo por cada `Write` cuesta plata y
  segundos en cada disparo para reemplazar un control que la Decisión Local-0038 ya
  dimensionó y acotó a propósito.
- **La capacidad 7 como reemplazo de las dos Herramientas del ciclo de copias.** Traslada
  a un guion de hook —que no puede ni devolver JSON— dos Herramientas que hoy funcionan,
  están probadas y se invocan cuando hace falta. El beneficio real es que se disparen solas;
  el costo es reescribirlas contra un contrato más pobre. Si M1 y M2 salen bien, la
  capacidad 1 da casi el mismo beneficio por una fracción del trabajo.
- **Partir el repartidor de conducta por la salida alternativa del plan Local-0099.** Ya
  está dicho en ese plan y se repite acá: el arreglo chico ya está analizado.

## Alcance del trabajo

Por etapas, y cada una con su condición de salida:

1. **Medir** las ocho de arriba, empezando por M0, que es precondición. Sale con un número
   y un veredicto por capacidad.
2. **Actualizar la página de conocimiento Local-0003** con lo de la sección de contraste —
   el conteo, el comportamiento de `${CLAUDE_PROJECT_DIR}` en una copia, los plazos de los
   tipos `prompt` y `agent`, la suma de los `additionalContext` y la denegación por omisión
   cuando nadie decide. Esto vale aunque no se adopte ninguna capacidad.
3. **Adoptar, de a una**, solo las que su medición haya dejado en pie, y con el orden que
   deje esa medición. Por cada una: decidir qué se retira del mecanismo propio y
   registrarlo.
4. **Revisar el conocimiento Local-0004** (Codex CLI) antes de invocar la paridad como
   argumento a favor o en contra de nada: sus dos límites mayores eran fallas abiertas.
5. Lo que viaje a la Base pasa por `sincronizar-base` y sube la versión del plugin.

**Solapamiento con el plan Local-0112, verificado el 11/09/2026 y cerrado acá:** ninguno.
Sus seis decisiones son A1 (dar de baja una fila del momento `cada turno`), A2 (el
repartidor del hook `Stop`, ya ejecutada el 23/08/2026), A3 (descartar `PreCompact` y sumar
una regla al arranque que mire `source`), A4 (línea de estado), A5 (ayuda del subsistema) y
A6 (una Preferencia Recomendada). Ninguna toca ninguna de las siete capacidades. El pedido
de «verificar solapamiento antes de arrancar» queda respondido y no hace falta volver a
abrirlo.

## Decisiones abiertas

Tres, y hay un orden: la primera condiciona a la tercera, y la segunda es independiente.

### DA-1 — ¿Se adopta el aislamiento por copia del mecanismo de subagentes, o se sigue con las dos Herramientas propias?

**Contexto.** Hoy el repo arma y limpia sus copias con dos Herramientas del Agente
Multipropósito: `preparar-worktree` (Base-0009), que crea la copia y le trae a mano lo que
git ignora, y `limpiar-worktree` (Base-0010), que la borra sin usar `git worktree remove`
porque ese comando, medido el 04/09/2026 en dos instalaciones, atraviesa el enlace de
Windows y vacía el `.claude/` real (Decisión Local-0080, conocimiento Base-0007). El plan
Local-0119 descartó el aislamiento por copia nativo con una objeción que **ahora está
medida como falsa**: la copia sí llega con `settings.local.json`. Pero la referencia dice
que, para las copias de git, **la limpieza la hace la plataforma con `git worktree
remove`** — el comando prohibido. Esta corrida está pasando por ese camino ahora mismo.

**Alternativa A — adoptar lo nativo y retirar las dos Herramientas.** El aislamiento se
dispara solo al lanzar un subagente, no hay que acordarse de invocar nada, y desaparece el
paso manual que el plan Local-0119 identificó como el más fácil de olvidar. ⇒ La limpieza
pasa a manos de `git worktree remove`; si M3 muestra que con un enlace adentro vacía el
destino, se está reintroduciendo a propósito un daño ya medido ⇒ y si no hubiera enlace
nunca —que es lo que la Decisión Local-0080 manda—, no habría daño; pero eso depende de que
nadie ponga un enlace adentro de una copia, que es exactamente la clase de cosa que la
decisión evitó por diseño en vez de por disciplina.

**Alternativa B — quedarse con las dos Herramientas y no adoptar ni la capacidad 1 ni la 7.**
Todo sigue funcionando, la raíz corta de Windows y el freno del borrado se conservan, y el
costo es el que ya se paga: hay que invocarlas. ⇒ Las capacidades 1 y 7 dejan de tener
sentido y el plan se reduce a las capacidades 2 y 3 ⇒ que son, justamente, las dos que este
análisis recomienda y las dos que Codex CLI también declara.

**Alternativa C — adoptar lo nativo para la creación y conservar la limpieza propia.**
Declarar `.worktreeinclude`, dejar que la plataforma cree, y seguir limpiando con
`limpiar-worktree` antes de que la sesión termine. ⇒ Requiere que la limpieza propia corra
**antes** de que se dispare la automática, y no está claro que haya un punto donde
engancharla ⇒ si no lo hay, C colapsa en A.

**Recomendación: B, y revisarla solo si M3 sale limpia.** El motivo es de asimetría de
costos, no de preferencia: la alternativa B pierde comodidad, la alternativa A puede perder
el `.claude/` de un repo. Además la alternativa B deja el plan concentrado en las dos
capacidades de mejor relación valor/costo, y no cuenta como costo el trabajo de invocar las
Herramientas, que ya está comprometido en todas las opciones (Preferencia Local-0004).

### DA-2 — ¿Se acepta un Control que llama a un modelo, y dónde?

**Contexto.** El subsistema `conducta` define la clase `Controlar` como un programa que
corre y del que se usa lo que devuelve (Decisión Local-0079). Un hook de tipo `prompt` o
`agent` es un Control cuyo programa es un modelo: entiende el texto, y por eso puede hacer
lo que la Decisión Local-0003 dejó pendiente hace casi dos meses. El costo es plata y tiempo
por disparo, contra un presupuesto de menos de 100 ms por evento bloqueante (conocimiento
Local-0005) y plazos por omisión de 30 s y 60 s.

**Alternativa A — no aceptarlo en ningún lado.** La capa semántica sigue siendo trabajo del
agente cuando el lint marca, como la dejó la Decisión Local-0038. ⇒ El plan Local-0006 sigue
Diferido sin camino ⇒ y la única forma de cerrarlo pasa a ser una habilidad que el usuario
invoca, que es lo que ya hay con `converger-terminologia`.

**Alternativa B — aceptarlo solo fuera del camino crítico.** Nada de hooks por modelo en
`PreToolUse` ni en `UserPromptSubmit`; sí en una pasada que se invoca, o en un evento que ya
cuesta un turno. ⇒ El Chequeo semántico del plan Local-0006 y el Contraste automático del
plan Local-0118 quedan habilitados ⇒ y `detectar-terminologia-vetada` no se toca, así que no
se re-decide la Decisión Local-0038.

**Alternativa C — aceptarlo también al escribir.** ⇒ Revierte la Decisión Local-0038 ⇒ y
paga un modelo por cada `Write` de cada sesión de cada Agente Desplegado, porque esto viaja
en la Base.

**Recomendación: B.** Es la única que abre la capa que falta sin revertir nada ni poner un
modelo en el camino crítico. La medición M7 le pone número a la frontera.

### DA-3 — ¿Qué grado de paridad con Codex CLI se le exige a cada capacidad que se adopte?

**Contexto.** `AGENTS.md` declara paridad de comportamiento objetivo entre Claude Code y
Codex CLI, y la Decisión Local-0010 la fija. Verificado contra el conocimiento Local-0004:
Codex CLI ya declara `SubagentStart` y `PermissionRequest`, así que las capacidades 2 y 3 no
rompen paridad. Las capacidades 1, 5, 6 y 7 no tienen contraparte declarada.

**Alternativa A — no adoptar nada que Codex CLI no tenga.** ⇒ La paridad se conserva al
100 % ⇒ y el Agente Multipropósito queda limitado por el CLI con menos capacidades, para
siempre.

**Alternativa B — adoptar, y declarar por capacidad si la paridad se conserva, se degrada
con aviso, o no aplica.** ⇒ Hace falta un lugar donde eso se escriba y un control que lo
mire, o se convierte en un dato que nadie compara (conocimiento Base-0001) ⇒ el lugar
natural es la ficha de cada Componente de Subsistema, y ya hay precedente: el término del
glosario Local-0013 (*Momento de conducta*) dice que es agente-agnóstico y que **cada agente
declara con qué mecanismo lo realiza, o que no puede**.

**Recomendación: B, reusando el mecanismo que el término del glosario Local-0013 ya
describe** en vez de inventar uno nuevo — es el caso del conocimiento Local-0016 (*No
inventar soluciones particulares cuando ya existen mecanismos*). Si DA-1 sale B, esta
decisión solo alcanza a las capacidades 2 y 3, y las dos conservan la paridad, así que se
vuelve barata.

## Propuestas para asentar

Ninguna se escribió en su registro: el análisis las deja acá para que el usuario ratifique.

- **Actualizar el conocimiento Local-0003** (*Hooks de Claude Code — referencia de
  mecánica*) con los cuatro datos de la sección de contraste. El más urgente no es el
  conteo de eventos sino el comportamiento de `${CLAUDE_PROJECT_DIR}` adentro de una copia,
  que le cambia el sentido al §5.6 de esa misma página.
- **Página de conocimiento nueva: el aislamiento por copia del mecanismo de subagentes trae
  lo ignorado sin declararlo y limpia con el comando prohibido.** Lo medido el 11/09/2026 y
  lo leído sobre la limpieza automática. Es el caso «una capacidad de la plataforma tapa un
  agujero propio y abre otro», y hoy no está en ningún lado.
- **Decisión, cuando DA-1 se resuelva:** qué mecanismo arma y limpia las copias de este
  repo. La Decisión Local-0080 fija el *cómo* (copia, nunca enlace; nunca `git worktree
  remove`) pero no el *quién*, y ahora hay dos candidatos.
- **Revisar y re-fechar el conocimiento Local-0004** (*Hooks de Codex CLI*): la página
  envejeció a favor —ya declara `SubagentStart` y `PermissionRequest`— y sus dos límites
  mayores eran fallas abiertas que hay que volver a chequear.

## Planes relacionados

- [Hacer avanzar varios planes a la vez hasta la proxima decision del usuario](Hacer%20avanzar%20varios%20planes%20a%20la%20vez%20hasta%20la%20proxima%20decision%20del%20usuario.md) (Local-0119) — de su medición salen los agujeros que tapan las capacidades 2 y 3, y la objeción que la medición de este análisis dio por caída.
- [El repartidor pisa el additionalContext de la Pantalla si hay una regla Inyectar al arrancar](El%20repartidor%20pisa%20el%20additionalContext%20de%20la%20Pantalla%20si%20hay%20una%20regla%20Inyectar%20al%20arrancar.md) (Local-0099) — `Listo`; la salida alternativa de más arriba es para comparar allá, no acá.
- [Ejecutar las seis decisiones de capacidades de Claude Code no usadas](Ejecutar%20las%20seis%20decisiones%20de%20capacidades%20de%20Claude%20Code%20no%20usadas.md) (Local-0112) — solapamiento verificado el 11/09/2026: **ninguno**. No hace falta volver a mirarlo.
- [Capa semantica de coherencia - contradicciones e incompatibilidades](Capa%20semantica%20de%20coherencia%20-%20contradicciones%20e%20incompatibilidades.md) (Local-0006) — `Diferido`; la capacidad 6 fuera del camino crítico es la forma más concreta que apareció de construirlo, y depende de DA-2.
- [El Contraste automatico no lee los archivos que se le pasan y se queda con las palabras del pedido](El%20Contraste%20automatico%20no%20lee%20los%20archivos%20que%20se%20le%20pasan%20y%20se%20queda%20con%20las%20palabras%20del%20pedido.md) (Local-0118) — `En curso`; el otro candidato a hook por modelo, que el relevamiento de partida no nombraba.
- [Subagentes del AMP para el flujo de desarrollo por etapas](Subagentes%20del%20AMP%20para%20el%20flujo%20de%20desarrollo%20por%20etapas.md) (Local-0094) — `En curso`; toca subagentes, así que la capacidad 2 le cambia dónde vive el alcance de cada uno. Coordinar antes de adoptarla.
