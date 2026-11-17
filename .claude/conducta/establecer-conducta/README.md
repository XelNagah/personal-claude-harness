# establecer-conducta — hook repartidor de conducta

Hook del subsistema `conducta`. **No es una Herramienta** (los hooks van afuera del registro de Herramientas): es infra co-ubicada del subsistema, como el lint. El agente no lo invoca — lo dispara el harness.

## Qué hace

Un mismo script sirve a varios eventos. Según el evento que lo dispara, resuelve qué **momento** realiza (con su condición, sin juicio), lee el registro **vivo** `../INDICE.md` y despacha las reglas `vigente` de ese momento según su clase. Agregar o cambiar una regla **no toca este script**: lee el registro en cada disparo. El vocabulario de momentos vive en `../MOMENTOS.md`; acá vive **cómo** se realiza cada uno.

Eventos que realiza hoy:

- **`SessionStart`** → momento `al arrancar la sesión` (sin condición).
- **`UserPromptSubmit`** → momento `cada turno` (sin condición). El recordatorio en cada turno.
- **`PreToolUse`** con `Write`/`Edit`/`apply_patch` cuando **alguna** ruta tocada es un `.md` fuera de `tmp/` → momento `al escribir`.
- **`Stop`** → momento `al cerrar tarea`. Es el único con reglas de despacho propias: ahí emitir continúa la conversación, así que el default es callar y una regla `Inyectar` sale solo si una `Controlar` del mismo momento lo habilita ([`../MOMENTOS.md`](../MOMENTOS.md#el-momento-donde-hablar-cuesta-un-turno)). Con `stop_hook_active` sale mudo sin despachar nada, o el cierre entra en bucle.

## El Contraste automático le muestra al agente, en cada turno, qué registros toca el pedido

### Qué problema resuelve

El agente no consulta los registros del repo —glosario, decisiones, planes, páginas de conocimiento— si nada lo lleva a hacerlo en el momento de actuar. Responde sin saber que el tema ya estaba decidido, o que hay un plan abierto sobre eso.

El **Contraste automático** (término del glosario) lo resuelve sin depender del agente. En `cada turno`, antes de que el modelo lea el mensaje, el repartidor busca qué filas de los registros toca ese mensaje y las agrega al `additionalContext`. El agente las ve como un aviso al principio del turno:

```
Contraste con la sabiduría del repo — lo que estás mirando toca estos registros
(candidatos para contrastar tu respuesta, no veredictos; abrí las que necesites: ...):
- Decisión Local-NNNN (Las goteras del techo se tapan cambiando las tejas).
- plan Local-NNNN (Cambiar la cerradura del galpón).
- página de conocimiento (La amoladora angular necesita el disco de corte fino). Detalle: conocimiento/herramientas-del-galpon/amoladora.md
```

Es un programa, sin inteligencia artificial: compara palabras. Por eso es rápido (unos 5 ms) y da siempre lo mismo para el mismo mensaje. Lo que trae son **candidatos**: el agente decide cuáles abrir.

### El recorrido de un mensaje, paso a paso

```
 Mensaje del usuario
        │
        ├──────────────────────────────┐
        ▼                              ▼
 CAMINO 1: CITAS                CAMINO 2: PUNTAJE
 ¿El mensaje, o un archivo      ¿Qué filas comparten palabras
 que el mensaje señala,         raras con el mensaje?
 nombra una entrada con
 su tipo delante?               Se compara aparte contra tres conjuntos:
 («el plan Local-0129»)           A. glosario, términos vetados y decisiones
        │                         B. planes vivos
        │                         C. índices de las carpetas de conocimiento
        │                              │
        │                              ▼
        │                       Cada fila recibe un puntaje (ver abajo)
        │                              │
        │                              ▼
        │                       ¿Llega al umbral de su conjunto?
        │                         no → afuera
        │                              │ sí
        │                              ▼
        │                       ¿Llega al 70 % de la mejor fila
        │                       de su conjunto?
        │                         no → afuera
        │                              │ sí
        ▼                              ▼
 Entran todas                   Entra
        │                              │
        └──────────────┬───────────────┘
                       ▼
        ¿Ya se la entregué en los últimos 20 turnos
        de esta sesión?   sí → se calla
                       │ no
                       ▼
        Renglón liviano: tipo, código y Nombre
                       │
                       ▼
        Aviso al principio del turno
        (si no quedó ninguna fila, no hay aviso: es lo más común)
```

### Cómo se calcula el puntaje de una fila

Por cada palabra del mensaje que también está en la fila, la fila suma puntos. Cuántos, depende de dos cosas:

- **Qué tan rara es la palabra en su conjunto.** Una palabra que está en una sola fila suma mucho; una que está en muchas casi no suma. «Prioridad» puede identificar una decisión; «agentes» no identifica nada en un repo que habla de agentes.
- **Dónde está.** En el `Nombre` vale el triple que en la `Descripción`, porque el Nombre dice de qué se trata la fila.

Antes de comparar se descartan las palabras vacías («de», «que», «para») y se sacan los acentos, por si el usuario no los escribe.

Ejemplo con números redondeados, en un conjunto de unas 37 decisiones. Mensaje: «hay goteras en el techo y se rompieron las tejas».

| Fila | Palabras en común | Puntaje | ¿Entra? |
|---|---|---|---|
| Las goteras del techo se tapan cambiando las tejas | goteras, techo, tejas (las tres en el Nombre) | 17,8 | sí: es la mejor |
| Las tejas rotas por goteras del techo se guardan | las mismas tres | 17,8 | sí |
| El techo de tejas se revisa por goteras | las mismas tres | 17,8 | sí |
| Las tejas nuevas para las goteras del techo | las mismas tres | 17,8 | sí |
| La canaleta del techo junta las hojas de las tejas | techo, tejas | 11,4 | no: pasa el umbral (10,3), pero no llega al 70 % de la mejor (12,5) |

Las cuatro primeras son igual de relevantes y llegan las cuatro. La quinta coincide en palabras, pero no trata de goteras.

### Por qué cada parte está hecha así

**Dos caminos, porque tienen precisiones distintas.**

| Camino | Mira | Alcance | Precisión |
|---|---|---|---|
| Citas | el mensaje **y el archivo que el mensaje señala** | glosario, términos vetados, decisiones y planes, vivos o cerrados | exacta: el texto nombró la entrada |
| Puntaje | solo el mensaje | los tres conjuntos A, B y C | aproximada: coincidencia de palabras |

- **Una cita es un código con su tipo delante** («el plan `Local-0118`», «Decisión `Local-0073`»), la forma que impone la Preferencia `Base-0016`. Un código suelto no se toma como cita, porque el mismo número existe en varios registros. Conocimiento y preferencias quedan afuera aunque se los cite: sus Índices raíz ya cargan siempre.
- **El repartidor sigue el puntero.** Un pedido como «leé este handoff y seguimos» deja el contenido afuera del mensaje. Por eso el repartidor abre el archivo que el mensaje nombra, si está dentro del repo, y toma sus citas. Los nombres de archivo llevan espacios: la ruta se ancla en la extensión y se retrocede palabra por palabra probando cuál existe.
- **El archivo señalado entra solo por sus citas, nunca por puntaje.** El puntaje está calibrado para un mensaje de unas 16 palabras; aplicado a un handoff entero, pasan el umbral 124 de 166 filas. Ahí mide largo, no relevancia.

**Cada conjunto se compara aparte, con su propio umbral.** Mezclados, los Nombres largos de los planes le bajarían el peso a las palabras del glosario. Y el corte del 70 % se toma dentro de cada conjunto: un plan muy fuerte no deja afuera a la decisión más fuerte del turno.

**Planes y conocimiento piden además dos palabras del mensaje en la fila.** Sus Nombres son oraciones largas, llenas de palabras corrientes, y una sola en común («resolver», «también») es casualidad.

**Solo los planes vivos entran por puntaje.** Uno cerrado ya no cambia lo que el agente tiene que hacer. Qué estados son de cierre lo dicen `planes/ESTADOS.md` y `ESTADOS-LOCAL.md`. Un plan cerrado sigue llegando si se lo cita.

**De conocimiento entran los índices de carpeta, no los raíz.** Los raíz cargan siempre. Se leen el `INDICE*.md` de cada carpeta de primer nivel y los que esos nombran por enlace. Cada fila de tabla y cada renglón de lista que enlaza a algo cuenta, sin importar las columnas; el peso del Nombre lo gana una columna `Nombre` o el texto del enlace. Se compara la fila, no el cuerpo de la página, y para puntuar la descripción se recorta a 300 caracteres.

**El umbral es alto, y sube en los repos chicos.** La mayoría de los turnos no trae nada: un saludo o «cuántos planes pendientes hay» no disparan. Un aviso que aparece siempre se aprende a ignorar. El umbral base es 7,0, calibrado con 166 filas. En un conjunto chico, una palabra corriente («mes», «servicios») queda en una sola fila por falta de filas, no por ser rara, y pesa el máximo: en un repo de 11 filas, la misma decisión llegaba en 54 de 300 mensajes. Por eso el umbral se multiplica por `ln(166/1,5) / ln(N/1,5)`, nunca por menos de 1, con un techo de tres palabras del Nombre que no estén en ninguna otra fila, para que un repo recién instalado no quede mudo. Valores: 166 filas → 7,0 · 60 → 8,9 · 23 → 12,1 · 11 → 16,5 · 5 → 10,8. Con el ajuste, esa decisión pasó de 54 mensajes a 15.

**No hay tope fijo de filas; hay un corte relativo.** Antes entraban como máximo tres filas por turno, y si un pedido necesitaba cuatro, la cuarta no llegaba. Sacar el tope a secas no sirve: el puntaje suma palabra por palabra, y un mensaje largo junta coincidencias casuales con casi cualquier fila (en un repo con unas 300 filas, un mensaje largo pasó el umbral en 124). Con el corte al 70 % de la mejor, llega lo que compite con lo más relevante y queda afuera lo que puntúa muy por debajo. La salida se ordena por cuántas veces supera cada fila el umbral de su conjunto: primero la mejor de cada conjunto, después el resto.

**Cada fila llega liviana.** Tipo, código y Nombre, sin la Descripción; el encabezado le dice al agente dónde abrir cada tipo. El detalle va solo cuando hace falta para encontrar la fila: la página de una fila de conocimiento, que no tiene código, o la página propia de una decisión. El de un plan no, porque es su archivo y repite el Nombre.

Medido sobre mensajes reales de cuatro repos, con el corte y las filas livianas:

| Repo | Antes, tope 3 con Descripción: p90 / máx. por turno | Ahora: máx. filas · p90 / máx. por turno |
|---|---|---|
| Grande: unas 300 filas, sin índices de carpeta | 6,1 KB / 7,6 KB | 14 · 1,4 KB / 1,9 KB |
| Chico: 11 filas, 1 índice de carpeta | 1,2 KB / 1,7 KB | 7 · 0,5 KB / 1,3 KB |
| Mediano: 2 índices de carpeta | 1,2 KB / 1,8 KB | 5 · 0,7 KB / 0,8 KB |
| Con 5 índices de carpeta | 1,2 KB / 1,4 KB | 8 · 0,6 KB / 1,2 KB |

Llegan más filas y el aviso pesa entre la mitad y un cuarto de lo que pesaba.

**Una fila ya entregada no se repite durante 20 turnos.** La marca vive en `.claude/tmp/contraste-automatico/<session_id>.txt`. No se calla para siempre: en una conversación larga el contexto se resume, y la fila del turno 3 puede no estar entera en el turno 60. Sin `session_id` la memoria no se aplica: repetir es la degradación segura.

**Vive dentro del repartidor y no es una clase nueva.** Es mecánica interna que escribe en `additionalContext`, igual que el Buzón de Avisos Generales. El repartidor ya corre en `cada turno` y ya es Node; un programa aparte costaría unos 48 ms por mensaje.

**Demora: no más de 10 ms de mediana para lo que suman planes y conocimiento**, medido adentro del proceso en el repo con más índices de carpeta de la máquina. Medido: +4 ms en un repo de 11 filas, +5 en uno con dos índices de carpeta, +8 en uno con cinco, y −0,5 en el de 171 filas, porque sacar los acentos con una sola expresión regular abarató lo que ya estaba. Ni el corte relativo ni las filas livianas cambiaron la demora: unos 4 a 7 ms. El repartidor entero sigue en unos 95 a 100 ms.

**Se prueba gratis.** Como es determinista, el banco `pruebas.js` le da mensajes y verifica qué filas trae, sin abrir una sesión. Ahí se calibra el umbral. La Herramienta `probar-disparo-de-skills` no aplica: mide si una habilidad se dispara, y esto no dispara ninguna.

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
