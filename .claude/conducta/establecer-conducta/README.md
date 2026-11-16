# establecer-conducta — hook repartidor de conducta

Hook del subsistema `conducta`. **No es una Herramienta** (los hooks van afuera del registro de Herramientas): es infra co-ubicada del subsistema, como el lint. El agente no lo invoca — lo dispara el harness.

## Qué hace

Un mismo script sirve a varios eventos. Según el evento que lo dispara, resuelve qué **momento** realiza (con su condición, sin juicio), lee el registro **vivo** `../INDICE.md` y despacha las reglas `vigente` de ese momento según su clase. Agregar o cambiar una regla **no toca este script**: lee el registro en cada disparo. El vocabulario de momentos vive en `../MOMENTOS.md`; acá vive **cómo** se realiza cada uno.

Eventos que realiza hoy:

- **`SessionStart`** → momento `al arrancar la sesión` (sin condición).
- **`UserPromptSubmit`** → momento `cada turno` (sin condición). El recordatorio en cada turno.
- **`PreToolUse`** con `Write`/`Edit`/`apply_patch` cuando **alguna** ruta tocada es un `.md` fuera de `tmp/` → momento `al escribir`.
- **`Stop`** → momento `al cerrar tarea`. Es el único con reglas de despacho propias: ahí emitir continúa la conversación, así que el default es callar y una regla `Inyectar` sale solo si una `Controlar` del mismo momento lo habilita ([`../MOMENTOS.md`](../MOMENTOS.md#el-momento-donde-hablar-cuesta-un-turno)). Con `stop_hook_active` sale mudo sin despachar nada, o el cierre entra en bucle.

## El Contraste automático (en `cada turno`)

Además de despachar las reglas, en `cada turno` el repartidor corre el **Contraste automático** (glosario): busca las filas de los registros que el turno toca e **inyecta al `additionalContext` las pocas que pegan fuerte**. Así el modelo tiene el material del contraste presente al responder, sin que tenga que invocar ninguna habilidad ni leer los 135 KB de esos registros.

Las busca por **dos caminos, con alcances distintos porque tienen precisiones distintas**:

| Camino | Sobre qué texto | Alcance | Cómo elige |
|---|---|---|---|
| **Puntaje** | el mensaje del usuario | tres corpus, cada uno por separado: semántica (glosario + Terminología Farlopa) y decisiones · los **planes vivos** · las filas de los **Índices de carpeta** de conocimiento | palabras compartidas, con un umbral por corpus |
| **Citas** | el mensaje **y el material que apunta** | semántica, decisiones y **planes** (vivos o cerrados) | el código de la Entrada, exacto |

- **Precisión primero (puntaje).** Cada palabra pesa por lo **rara** que es en su corpus (una que está en muchas filas casi no suma) y el `Nombre` pesa más que la `Descripción`. Hay un umbral alto: la **mayoría de los turnos no inyecta nada** (un saludo, una consulta fáctica de un solo sustantivo → silencio). Un registro que marca todo entrena a ignorarlo.
- **El umbral se ajusta a la cantidad de filas.** El 7,0 se calibró con 166 filas. En un corpus chico una palabra corriente («mes», «servicios») queda en una sola fila por falta de filas y pesa el máximo: medido con el programa real en un repo de 11 filas, la misma Decisión llegaba en 54 de 300 mensajes. El umbral se multiplica por `ln(166/1,5) / ln(N/1,5)` (nunca por menos de 1), con un techo de tres palabras exclusivas del `Nombre` para que un repo recién instalado no quede mudo: 166 filas → 7,0 · 60 → 8,9 · 23 → 12,1 · 11 → 16,5 · 5 → 10,8. Con el ajuste, esa Decisión pasó de 54 mensajes a 15.
- **Cada corpus se compara aparte**, con su propio peso de palabras y su propio umbral: mezclados, los `Nombre` largos de los planes le bajarían el peso a las palabras del glosario. **Planes y conocimiento piden además dos palabras del mensaje en la fila**: sus `Nombre` son oraciones llenas de palabras corrientes, y una sola en común («resolver», «también») es casualidad.
- **Solo los planes vivos** entran por puntaje; cuáles estados son de cierre lo dicen `planes/ESTADOS.md` y `ESTADOS-LOCAL.md`. Un plan cerrado sigue llegando si se lo cita.
- **De conocimiento entran los Índices de carpeta**, no los raíz (esos cargan siempre): el `INDICE*.md` de cada carpeta de primer nivel y los que esos nombran por enlace. Se lee cada fila de tabla y cada renglón de lista que enlaza a algo, sin importar las columnas; el peso del `Nombre` lo gana una columna `Nombre` o el texto del enlace. La fila llega como «página de conocimiento», con la página como detalle y la descripción recortada a 300 caracteres. Se compara la **fila**, no el cuerpo de la página.
- **El puntaje no se traslada a un documento entero.** Está calibrado para un mensaje de 16 palabras; con un handoff superan el umbral 124 de 166 filas, o sea mide largo y no relevancia. Por eso el material apuntado entra **solo por sus citas**.
- **Sigue el puntero.** Un pedido que apunta a un archivo —«leé este handoff y seguimos»— lleva el contenido **afuera** del mensaje, así que el repartidor abre la ruta que el mensaje nombre, siempre que caiga dentro del repo. Los nombres de archivo llevan espacios, así que la ruta se ancla en la extensión y se retrocede token a token probando cuál existe: el sistema de archivos valida, no una expresión regular.
- **Una cita es un código con su tipo delante** («el plan `Local-0118`», «Decisión `Local-0073`»), la forma que impone la Preferencia `Base-0016`. Sin esa palabra, un código no se toma como cita. Conocimiento y preferencias quedan afuera aunque se los cite: sus Índices ya cargan siempre.
- **Cómo se reparte el tope.** Primero las citas. Lo que queda se reparte entre los tres corpus comparando cuántas veces supera cada fila **su** umbral: entra lo mejor de cada corpus que tenga algo, y después el resto. Un turno que toca una Decisión, un plan y una página trae una de cada una; si pega uno solo, trae hasta tres de ese, como antes.
- **Tope duro de 3 filas por turno, y son 3 nuevas:** una fila ya entregada se calla mientras no pasen 20 turnos, con la marca en `.claude/tmp/contraste-automatico/<session_id>.txt`. **No** se calla para siempre — en una conversación larga el contexto se resume, así que la fila del turno 3 puede no estar entera en el turno 60. Sin `session_id` la memoria no se aplica: repetir es la degradación segura.
- **Normaliza sin acentos** para tolerar que el usuario los omita al escribir.
- **No agrega una clase** al modelo de conducta: es mecánica interna que escribe en `additionalContext`, igual que el Buzón de Avisos Generales. Vive dentro del repartidor —que ya corre en `cada turno` y ya es Node— en vez de como programa aparte, que costaría ~48 ms en cada mensaje.
- **Demora.** Sumar planes y conocimiento tiene un límite propio: **no más de 10 ms** de mediana del contraste, medido adentro del proceso, en el repo con más Índices de carpeta de la máquina. Medido al construirlo: +4 ms en un repo de 11 filas, +5 en uno con dos Índices de carpeta, +8 en uno con cinco, y −0,5 en el de 171 filas, porque sacar los acentos con una sola expresión regular abarató la parte que ya estaba. El repartidor entero sigue en unos 95 a 100 ms.
- **Es determinista**, así que su calidad de selección se prueba en el banco `pruebas.js` (mensaje → filas esperadas), sin costo de sesión, y ahí se calibra el umbral. La Herramienta `probar-disparo-de-skills` no aplica: mide si una habilidad se dispara, y esto no dispara ninguna.

## Las tres clases

Acá vive **por qué campo sale cada clase**, que es el dato que las hace combinables. Qué es cada una y cuándo usarla está en [`../CLASES.md`](../CLASES.md).

| Clase | Qué hace el repartidor | Campo de salida | Se combina |
|-------|------------------------|-----------------|------------|
| `Inyectar` | Emite el `Contenido` de la regla tal cual | `additionalContext` (lo lee el modelo) | sí |
| `Ejecutar` | Corre la Herramienta cuya ruta es el `Contenido` y **reenvía su salida tal cual** | el campo que emita la Herramienta; la Pantalla de bienvenida usa `systemMessage`, el único que escribe en la terminal | sí: las salidas de varias reglas se fusionan en un único `systemMessage` |
| `Controlar` | Corre el Control y **lee su respuesta** | `additionalContext` si devolvió texto; `permissionDecision: deny` si frena | sí, salvo el `deny`, que se emite solo |

Las tres conviven en un mismo momento **porque escriben en campos distintos**: `Ejecutar` y el Buzón de Avisos Generales en `systemMessage`, `Inyectar` y `Controlar` en `additionalContext`. Así se emiten juntos el texto fijo de las `Inyectar` —que vive en el registro y lo actualiza el Agente Multipropósito— y los datos medidos de las `Controlar`, que produce un Control, uno abajo del otro. El `deny` gana solo: si la acción no va a ocurrir, el resto sobra.

⚠️ **Hasta el 02/08/2026 no era así:** el repartidor despachaba `Ejecutar` primero y **cortaba**, de modo que una regla `Ejecutar` en un momento con reglas `Inyectar` las apagaba a todas sin emitir ninguna señal. No hizo daño porque la única `Ejecutar` vivía en un momento sin `Inyectar`, pero el registro está pensado para editarse sin tocar este script: la fila que lo destapara habría dejado el momento mudo.

## Contrato

- **Entrada:** el JSON del agente por stdin. Se lee `hook_event_name`, y para `PreToolUse` `tool_name` + las rutas, que llegan de dos formas: `tool_input.file_path` (Claude Code) o adentro del parche de `tool_input.command` (Codex, `apply_patch`, que puede tocar **varias** rutas de una).
- **Salida:** por stdout, `{ "hookSpecificOutput": { "hookEventName": …, "additionalContext": "…" } }`, o el `deny` con su `permissionDecisionReason`.
- **`PreToolUse` sin efecto de lado:** cuando no hay bloqueo se **omite** `permissionDecision` (= `defer`, verificado 2026-07-23): inyecta el texto y deja el flujo de permisos intacto — **no** auto-aprueba la tool. (`allow` auto-aprobaría; `deny` descarta el `additionalContext`, por eso el bloqueo se emite solo.)
- **Nunca rompe el turno:** ante cualquier error o registro vacío sale con código 0 sin emitir nada.

Mecánica y capacidades de hooks: conocimiento `hooks-claude-code` (Claude Code) y `hooks-codex-cli` (Codex). Latencia (~65 ms, Node): conocimiento `latencia-hooks`.

## Cableado

- **Claude Code (`.claude/settings.json`):** `SessionStart` + `UserPromptSubmit` + `Stop` (sin matcher) + `PreToolUse` (matcher `Write|Edit`).
- **Codex (`.codex/hooks.json`):** los tres primeros. ⚠️ **`Stop` todavía no está cableado ahí**, así que en Codex el momento `al cerrar tarea` no se entrega, aunque el evento exista y el repartidor sepa realizarlo. El matcher `Write|Edit` alcanza igual: toda edición de Codex pasa por `apply_patch`, que matchea como `apply_patch`, `Edit` o `Write`. ⚠️ Un hook de Codex **no corre hasta que se lo revisa y se le da confianza** con `/hooks`, y la confianza se pierde cada vez que cambia su texto.

## Probar a mano

```bash
node -e 'process.stdout.write(JSON.stringify({hook_event_name:"UserPromptSubmit"}))' | node .claude/conducta/establecer-conducta/establecer-conducta.js
node -e 'process.stdout.write(JSON.stringify({hook_event_name:"PreToolUse",tool_name:"Write",tool_input:{file_path:"README.md",content:"texto"}}))' | node .claude/conducta/establecer-conducta/establecer-conducta.js
```

Emiten el JSON con las reglas vigentes de ese momento, o nada si no aplica.
