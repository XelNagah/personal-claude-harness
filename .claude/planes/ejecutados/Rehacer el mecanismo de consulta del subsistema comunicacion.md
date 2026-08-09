# Rehacer el mecanismo de consulta del subsistema comunicacion

**Estado: Ejecutado · Creado 26-08-08 · Cerrado 26-08-09.** Se abrió, se analizó y se ejecutó su núcleo en la misma sesión del 26-08-08, así que pasó por `Análisis` y `Listo` sin quedar registrado en ninguno de los dos.

El subsistema `comunicacion` está instalado y publicado (plan Local-0100, Decisión Local-0064), pero su mecanismo de consulta —`.claude/comunicacion/consultar/consultar.js`— se probó contra una instalación real el 26-08-08 y **no sirve para el uso que el usuario quiere**. Este plan lo rehace y modifica la decisión que lo fundó.

## El problema

El mecanismo garantiza la solo lectura con `--permission-mode plan`. Ese modo es **demasiado grueso: bloquea los servidores MCP del Agente consultado**. En la prueba, el agente que lleva cuentas por un servidor MCP contestó desde lo que tenía anotado en un `.md` en vez de leer sus datos, y uno de los tres importes estaba mal. Peor que el error: **no avisó por ningún canal mecánico**. Se supo solo porque el agente lo aclaró en su texto. El mecanismo lee stdout crudo y no puede detectar nada.

## El alcance nuevo que pidió el usuario (26-08-08)

1. **La señalización de solo lectura no es un objetivo si complica.** Textual: *«no me importa señalizar que sean de solo lectura si es más difícil. Me interesa un mecanismo sencillo de comunicación, y poder pedirle a otros agentes que resuelvan cosas»*. Esto **contradice el corazón de la Decisión Local-0064**, que hizo de la solo lectura la garantía central y dejó la delegación con efecto como extensión futura. La decisión hay que modificarla, no estirarla.
2. **Distintos Agentes tienen sus propios MCP.** El mecanismo no puede asumir un conjunto fijo de herramientas.
3. **Consultas en paralelo y asincrónicas.** Que el chat no se quede esperando, que varias corran a la vez, y que **avise cuando llega**.

## Lo ya resuelto en el análisis del 26-08-08

**El Agente origen no identifica los MCP del Agente destino.** La enumeración era hija de la solo lectura, no de la comunicación: sacada la garantía, se queda sin motivo. Tres razones para no enumerar:

- Es el **mismo dato escrito dos veces sin control que compare** (conocimiento Base-0001). Qué MCP tiene el destino ya está en su `.mcp.json` y su `settings.local.json`; el origen no puede lintear el disco de otro repo.
- **Se desactualiza en silencio y el control sigue en verde** (conocimiento Local-0013). Si el destino suma una herramienta, la lista blanca del origen no la incluye, el destino no la usa, y la respuesta sale peor sin que falle nada. Es la misma falla del modo plan, más tarde y más difícil de atribuir.
- **Escala con N×M.** El comando verificado enumera 11 nombres para *un* agente.

Evidencia de campo: el **Agente-Coordinador** maneja nueve agentes en producción y **no guarda las herramientas de ninguno**; pasa un comodín por servidor (`mcp__gnucash__*`) solo en el paso de ejecución de su protocolo de escrituras.

El origen conoce **cómo invocar** al destino (nombre, Propósito, directorio, CLI — lo que ya está en el Índice), no **qué sabe hacer**.

## El comando que SÍ funciona (verificado, 26-08-08)

Corrido dentro del directorio del agente consultado, con el mensaje por STDIN. Devolvió la respuesta leyendo sus datos de verdad (citó identificadores de asiento), en 21 turnos y US$ 1,69:

```bash
cd "<dir del agente>" && printf '%s' "<mensaje>" | claude -p --output-format json \
  --allowedTools "mcp__gnucash__get_upcoming_transactions,mcp__gnucash__list_scheduled_transactions,mcp__gnucash__list_accounts,mcp__gnucash__get_balance,mcp__gnucash__get_transaction,mcp__gnucash__get_book_summary,Read,Grep,Glob" \
  --disallowedTools "Write,Edit,NotebookEdit,Bash,mcp__gnucash__create_transaction,mcp__gnucash__delete_transaction,mcp__gnucash__create_account,mcp__gnucash__delete_account"
```

Verificado después de correrlo: árbol del repo consultado idéntico, mismo commit, y el archivo del libro sin cambio en su fecha de modificación. **Las dos listas de herramientas se caen** con lo resuelto arriba; lo que se conserva del comando es la forma: `-p`, `--output-format json`, mensaje por STDIN, `cwd` en el directorio del destino.

## Trampas ya pagadas

- **`--permission-mode plan` NO es solo lectura.** Impide *actuar*, así que bloquea los MCP del destino. Es la causa raíz.
- **`--tools` no es lo mismo que `--allowedTools`.** El mecanismo viejo pasa `--tools Read Grep Glob`; según el `--help` esa bandera elige del *conjunto integrado*. No se verificó cuál de las dos mandaba, y el diseño nuevo no usa `--tools`.
- **El `settings.local.json` del destino puede tener pre-autorizada su propia escritura.** El contable tiene `mcp__gnucash__create_transaction` en permitidos, y la consulta, al correr en su directorio, lo hereda. ⚠️ **No se probó** qué pasa sin `--disallowedTools`; lo verificado es que **con** él no se escribió nada.
- **El tope de 3 minutos (`TIMEOUT_MS = 180000`) mata consultas buenas.** La primera murió con `ETIMEDOUT`; la que funcionó necesitó 21 turnos. Ese número no lo decidió nadie: lo puso el implementador. El Agente-Coordinador no tiene timeout.
- **`--output-format json` es lo que hace observable la falla.** Trae `.result`, `.session_id`, `.is_error` y sobre todo **`.permission_denials`**, que en la corrida buena capturó una denegación de PowerShell como dato estructurado.
- **Costo:** el arranque domina el precio (recarga el contexto entero del destino). La misma pregunta salió US$ 0,89 en Opus 5 y ~US$ 0,36 en Sonnet 5, y el mecanismo viejo **no permite elegir modelo**. Conviene armar el pedido completo en un solo mensaje.
- **En headless el agente no puede preguntar.** Instruirlo siempre a no usar `AskUserQuestion` y a proponer una interpretación con la salvedad marcada; si frena a preguntar, gasta el turno entero.
- **El Índice de este repo se mantiene sin filas y NO está gitignoreado acá** (sí lo está en un Agente Desplegado). Para probar, agregar la fila y revertirla con `git checkout -- .claude/comunicacion/INDICE.md`.

## Contradicción sin resolver

Si una herramienta **no** pre-autorizada en headless **cuelga** (lo afirma la skill del Agente-Coordinador) o **deniega y lo reporta en `.permission_denials`** (lo observado en la corrida buena). Si cuelga, hace falta un comodín grueso tipo `mcp__*` —que igual no requiere saber qué MCP hay—. Medirlo antes de diseñar el modo de permisos.

## Lo hecho y verificado (26-08-08)

`consultar/consultar.js` rehecho, con **dos modos** —el usuario los pidió los dos, no como alternativa—:

| | `preguntar` (predeterminado) | `resolver` |
|---|---|---|
| Para qué | preguntarle algo | pedirle que haga algo |
| Sus MCP | vivos | vivos |
| Escribir archivos, ejecutar comandos | no | sí |

El modo se llama `preguntar` y no `consultar` por el punto 7: `consultar` nombra el acto entero —el mecanismo, la habilidad, el subsistema—, así que usarlo también para uno de los dos modos hacía que la misma palabra fuera el todo y la parte. Renombrado el 26-08-08, antes de publicar `amp-comunicacion` 0.2.0, así que nadie tenía instalado el nombre viejo.

El comando que quedó, sin nombrarle una sola herramienta al consultado:

```
claude -p --output-format json --permission-mode dontAsk \
       --allowedTools "mcp__*" --disallowedTools "Write,Edit,NotebookEdit,Bash"
```

**Prueba de aceptación contra una instalación real**, en una corrida: trajo un saldo real por su MCP, **no pudo** crear el archivo de prueba, sus datos quedaron con la misma fecha de modificación, y el intento de esquivarlo por PowerShell volvió como denegación estructurada. 5 turnos, US$ 0,44.

Lo demás que entró y quedó probado: salida interpretada con sus advertencias, **hilo retomable** (`--sesion`: US$ 0,03 la repregunta contra US$ 0,65 la consulta inicial), **elección de modelo** (`--modelo`), **sin tope de tiempo** salvo `--tope`, y un preámbulo que instruye al consultado a no frenar a preguntar. Banco de pruebas verde con seis controles nuevos, entre ellos que el modo `preguntar` conserve los MCP y que `plan` no vuelva a colarse. Documentación, `base/` y versiones (`amp` 0.45.0, `amp-comunicacion` 0.2.0) al día.

**Frenos medidos que NO sirven:** con `--permission-mode auto` no se aplican ni `--disallowedTools` ni las reglas de `permissions.deny` pasadas por `--settings` — el archivo se escribió igual y las denegaciones volvieron vacías. Por eso el modo `resolver` no lleva lista: sería decorativa.

**Consecuencia asumida:** en modo `preguntar` se frenan las escrituras **genéricas**, no las del MCP del consultado. No hay forma genérica de distinguir un `get_balance` de un `create_transaction` sin enumerarlos, y enumerarlos es lo que este mecanismo evita.

## Los nombres, resueltos el 26-08-08 (punto 7)

El usuario ratificó, uno por uno:

- **Los dos modos son `preguntar` y `resolver`.** `consultar` nombraba el acto entero —el mecanismo, la habilidad, el subsistema— y además uno de los dos modos: la misma palabra era el todo y la parte. Y `resolver` no es una consulta, es un pedido.
- **El concepto se llama `Modo de Comunicación`**, no «modo de la consulta»: ningún nombre con «consulta» adentro puede cubrir los dos modos, y el subsistema ya se llama `comunicacion`.
- **Cada modo es una habilidad**, invocada con el prefijo del plugin, que es el que dice «comunicación»:

  ```
  /amp-comunicacion:registrar-agente
  /amp-comunicacion:buscar-agentes
  /amp-comunicacion:preguntar   <agente> "<pregunta>"
  /amp-comunicacion:resolver    <agente> "<pedido>"
  ```

  `consultar-agente` se retira y se parte en `preguntar` y `resolver`. La ganancia no es el nombre: hoy la habilidad **decide el modo por el usuario** y por eso lleva escrita la regla «elegir `resolver` solo cuando pidió que el otro Agente haga algo». Partida en dos, la única forma de que el otro repo escriba es que el usuario tipee `resolver` — deja de ser texto que el modelo puede no obedecer y pasa a ser estructura, el mismo criterio de la Decisión Local-0060 (subagentes: se delega traer evidencia, nunca decidir sobre ella).
- **El mecanismo pasa a `comunicacion/comunicar/comunicar.js`** y conserva `--modo preguntar|resolver`: es el mecanismo único del subsistema y cada habilidad lo llama con el suyo.
- `registrar-agente` **conserva su nombre**: se evaluó acortarlo a `registrar` y se descartó para no romper el patrón `registrar-<objeto>` que comparten los otros cuatro subsistemas.

**Los usos reales de `resolver`** que declaró el usuario: pedirle al otro Agente que **guarde un plan** para X, o que **ejecute el plan Y**. Los dos caen dentro de los subsistemas del consultado, así que el pedido tiene que nombrarle su propia maquinaria (`amp-planes:crear-plan`) en vez de parafrasearla, y «ejecutá el plan Y» va en segundo plano sí o sí. ⚠️ **«Qué efecto tendría tal cambio en tu repo» NO es `resolver`**: no escribe nada, es una pregunta cara y de solo lectura. La frase dice «hacer» y empuja al modo equivocado; las dos `description` tienen que decirlo.

## `buscar-agentes` — diseño medido el 26-08-08 (punto 12)

La habilidad que faltaba: encontrar las instalaciones del Agente Multipropósito de la máquina y preguntar cuáles registrar. La Decisión Local-0064 la había marcado como extensión futura con el nombre `descubrir-agentes`; se llama **`buscar-agentes`**, que calza con el `buscar-conocimiento` que ya existe.

**No barre el disco** — los CLI ya saben dónde corrieron (Preferencia Local-0012, evaluar soluciones existentes):

| Paso | Cómo | Medido |
|---|---|---|
| Enumerar candidatos | `~/.claude.json` → `projects`, más el rastro de Codex (`~/.codex/history.jsonl`) | 33 → **30** tras normalizar mayúsculas y separadores |
| Filtrar los que son | existe `.claude/subsistemas/SUBSISTEMAS.md` | **8 instalaciones**, en milisegundos |
| Título y Propósito | `.claude/identidad.md`: H1 + línea `Propósito:` | el mismo formato que lee la Pantalla de bienvenida |
| Qué CLI usa | lo dice la fuente: de `~/.claude.json` → `claude`; del rastro de Codex → `codex` | — |
| Restar | los ya registrados en `INDICE.md`, y el repo actual | — |

El lector de `identidad.md` hoy está incrustado en `conducta/mostrar-pantalla-bienvenida/mostrar-pantalla-bienvenida.js:217`. Se **extrae a `.claude/common/identidad.js`** —Herramienta de tipo `funcion`, Decisión Local-0050— con su prueba propia, para no tener dos copias del mismo parseo (conocimiento Base-0001 y Base-0004).

## A resolver

1. ~~**El modelo de permisos.**~~ **Resuelto: dos modos, y el origen no conoce las herramientas del destino.** Ver arriba. El Índice guarda **cómo invocarlo** (nombre, Propósito, directorio, CLI), no **qué sabe hacer**.
2. ~~**El modo asincrónico y en paralelo.**~~ **Resuelto el 26-08-08: no se construye nada.** El usuario lo precisó — asincrónico no es lo mismo que paralelo: quiere dejar **una** consulta corriendo, seguir hablando, y que avise al volver. **Claude Code ya lo hace**: `run_in_background` en la herramienta Bash devuelve un identificador al instante, manda la salida a un archivo y avisa al terminar (también con `Ctrl+B` sobre un comando ya lanzado). Construir un mecanismo propio duplicaría una capacidad del programa (Preferencia Local-0012).

   ⚠️ **Estaba apagada en esta máquina, y por un diagnóstico errado.** El `settings.json` global traía `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS: "1"`, así que la herramienta Bash no ofrecía la opción. La había puesto el Agente-Coordinador el 26-08-06 buscando frenar unas ventanas de PowerShell que aparecían todo el tiempo (las atribuyó al defecto abierto de Claude Code en Windows, issues #14828/#78189/#80925). **No era eso:** la causa real eran los chequeos de la Pantalla de bienvenida de este mismo Agente Multipropósito, que se disparaban mal en todas las instalaciones. La variable quedó puesta sin resolver nada y apagando una capacidad. Sacada el 26-08-08.

   **El Buzón de Avisos Generales no aplica**: existe para cuando no hay nadie esperando —el aviso de plugins lo produce un proceso lanzado en el hook de arranque—; acá la sesión está viva.
3. ~~**Multi-turno sobre el mismo hilo.**~~ **Hecho** con `--sesion`. Queda **sin hacer** el registro de qué hilos están abiertos (el `sessions.json` del Agente-Coordinador): hoy el identificador se devuelve y hay que copiarlo a mano. Decidir si hace falta.
4. ~~**Elegir modelo** por consulta.~~ **Hecho** (`--modelo`).
5. ~~**El timeout.**~~ **Hecho**: no hay tope salvo `--tope <segundos>`.
6. ~~**Qué pasa con el plan Local-0060 (Buzones).**~~ **Resuelto el 26-08-09: descartado**, con su motivo escrito en el archivo. Sus dos distancias quedaron cubiertas —entre sesiones por el handoff más el Buzón de Avisos Generales; entre repos por este subsistema, pero por la vía contraria: el que tiene algo que entregar lo entrega **corriéndolo**, en vez de dejar un sobre—. Sus cinco condiciones conservan dueño: las cuatro primeras el Buzón de Avisos Generales, la quinta —contexto, no orden— este subsistema. El choque que el plan marcaba contra esa quinta no aplica: rechaza un archivo que se ejecuta al arrancar sin que nadie lo pida, y en `resolver` el usuario está delante y lo pidió.
7. ~~**Convergir la terminología.**~~ **Cerrado el 26-08-09.** Barrido hecho el 26-08-08: cero términos vetados en el subsistema y en su plugin. De lo que quedaba:
   - **Glosario `Local-0038`, `Modo de Comunicación`** — asentado. Se le sacaron dos cosas al texto propuesto: la frase que decía que el modo lo elige el usuario al invocar la habilidad —empujaba a frenar y preguntar de más, cuando lo pedido es que si el usuario pide consultar, se consulte— y el número, porque una definición que dice «dos» queda falsa el día que haya un tercero.
   - **Terminología Farlopa `Local-0049`, `Control de Escritura`** — **descartado, no se veta.** El conocimiento Base-0005 (*El ciclo de vida de un término del glosario*) dice que vetar rinde antes del barrido, no después: quedaba **una** aparición viva, y la fila habría marcado para siempre cada cita del protocolo del Agente-Coordinador. Se reescribió esa línea (`pendientes/Subagentes del AMP…:166`) y listo. Si el término vuelve a colarse, se veta ahí, con su barrido en la misma tanda.
   - Y una convergencia **sin fila**: `origen`/`destino` → `consultante`/`consultado`, aplicada. No se veta `origen` porque es la palabra con que todo Índice declara de dónde viene su contenido: la fila marcaría cientos de usos válidos.
8. ~~**Redefinir el término del glosario Local-0037**~~ **Hecho el 26-08-09.** *Agente Multipropósito Conocido* decía «para consultarla de forma síncrona y de solo lectura», que quedó falso; ahora dice «para pedirle algo en el momento y traer su respuesta, en el Modo de Comunicación que corresponda» — sin numerar, por lo mismo que la `Local-0038`.
9. ~~**Registrar la decisión que modifica la Local-0064**~~ **Hecha el 26-08-09: Decisión Local-0065** — sería la `Local-0065`, el último Código usado es el 0064 y ninguna de las dos lleva archivo de detalle. Tiene que asentar: los dos modos y que la solo lectura deja de ser la garantía central; que el origen **no conoce las herramientas del destino** (dato escrito dos veces sin control que compare, desactualización silenciosa, escala N×M); que en modo `preguntar` los MCP de escritura del consultado **no** quedan frenados; que lo asincrónico no se construye porque es `run_in_background`; y que la respuesta sigue entrando como **contexto, no orden**.
10. ~~**Registrar el conocimiento medido**~~ **Hecho el 26-08-09: conocimiento Local-0017** sobre invocar a otro agente en una corrida no interactiva. Costó unos US$ 3 en consultas reales y se vuelve a pagar si no queda escrito: que `plan` apaga los MCP, que `auto` ignora las listas de denegación y contesta en verde, la combinación que sí funciona, que `--output-format json` es lo único que vuelve observable la falla, y que el arranque domina el costo. Enlazar con el conocimiento Local-0013 (controles que dejan de controlar sin avisar) en vez de repetirlo.
11. ~~**Renombrar las habilidades y construir `buscar-agentes`.**~~ **Hecho el 26-08-09.** Ver «Lo construido» abajo.

12. **Cerrar el plan y publicar.** `cerrar-plan` con sus notas, control de cierre en verde, commit `Comunicación: …` con la convención Antes/Ahora, y `actualizar-plugins --aplicar` — eso apaga el único hallazgo que queda hoy (`amp` 0.45.0 y `amp-comunicacion` 0.2.0 en disco contra 0.44.0 / 0.1.0 instalados).

## Lo construido el 26-08-09 (punto 11)

La partición quedó aplicada y el control de cierre en verde, con el único hallazgo esperado (las versiones sin publicar). Qué quedó en disco:

| Antes | Ahora |
|---|---|
| skill `consultar-agente` | skills `preguntar` y `resolver` — el modo lo elige el usuario tipeando una u otra |
| — | skill `buscar-agentes` |
| `comunicacion/consultar/consultar.js` | `comunicacion/comunicar/comunicar.js`, con `--modo` intacto |
| — | `comunicacion/buscar/buscar.js` + README |
| parseo de `identidad.md` incrustado en la Pantalla de bienvenida | `common/identidad.js`, Herramienta Base-0005 de tipo `funcion` |

**Dos cosas que el diseño no decía y se decidieron acá:**

- **`buscar-agentes` lleva su propio script**, `buscar/buscar.js`, y no lo resuelve el modelo leyendo archivos: `~/.claude.json` pesa megabytes y hay 93 rollouts de Codex. El mecanismo del subsistema sigue siendo uno solo —`comunicar/`, el que invoca a otra instalación—; buscar es otra cosa y vive aparte.
- **El rastro de Codex no es `~/.codex/history.jsonl`**, que no guarda directorio: el `cwd` está en la primera línea (`session_meta`) de cada `~/.codex/sessions/**/rollout-*.jsonl`. Se leen los primeros 8 KB de cada uno. Corrida real: **8 instalaciones en 112 ms**, el mismo número que la medición del 26-08-08.

**Un defecto encontrado al extraer el parseo:** `**Propósito:** …` —la forma más común en Markdown, con el cierre del énfasis después de los dos puntos— devolvía el Propósito con `**` pegado adelante. Este repo escribe la línea llana, así que nadie lo había visto; el buscador abre el `identidad.md` de repos escritos por otras manos. Arreglado, con su caso en el banco.

**Controles nuevos:** siete casos de `identidad.js` en el banco de `common/` (incluido que lea el repo que se le pasa y no el que corre) y cuatro de `buscarAgentes` en el de `comunicacion` (la señal que descarta un repo con `.claude/` sin harness, la unión de las dos fuentes, el marcado de lo ya registrado, y la ruta escrita distinto). `consultar-agente` entró a los nombres retirados de `lint-harness`. Cinco entradas nuevas en el banco de `probar-disparo-de-skills`, entre ellas la trampa «qué efecto tendría…», que tiene que disparar `preguntar` y no `resolver`. ⚠️ Ese banco **mide lo instalado**: correrlo antes de publicar da verde sobre las `description` viejas.

## Notas de implementación (26-08-09)

El plan cierra con el control de cierre en verde y **un solo hallazgo pendiente**, el de publicar: `amp` 0.45.0 y `amp-comunicacion` 0.3.0 en disco contra 0.44.0 / 0.1.0 instalados.

**Lo que cambió, de punta a punta:**

| Antes | Ahora |
|---|---|
| un modo de solo lectura que le apagaba los MCP al consultado | dos Modos de Comunicación, `preguntar` y `resolver`, con los MCP vivos en los dos |
| una habilidad, `consultar-agente`, con el modo decidido por una regla escrita adentro | una habilidad por modo, `preguntar` y `resolver` — elegir el modo es elegir cuál se invoca |
| las instalaciones de la máquina se registraban a mano | `buscar-agentes` las encuentra en milisegundos, sin barrer el disco |
| `comunicacion/consultar/consultar.js` | `comunicacion/comunicar/comunicar.js` + `comunicacion/buscar/buscar.js` |
| el parseo de `identidad.md` incrustado en la Pantalla de bienvenida | `common/identidad.js`, Herramienta Base-0005 |
| tope fijo de 3 minutos, sin elección de modelo, salida cruda | sin tope salvo `--tope`, `--modelo`, `--sesion`, y salida interpretada con sus advertencias |

**Lo asentado:** Decisión Local-0065 (reemplaza la Local-0064) · conocimiento Local-0017 (*Invocar a otro agente en una corrida no interactiva*) · glosario Local-0038 (*Modo de Comunicación*) y redefinición del Local-0037 · plan Local-0060 (Buzones) descartado con su motivo.

**Dos cosas que se resolvieron distinto de lo previsto:**

- **El veto de `Control de Escritura` no se hizo.** Quedaba una sola aparición viva, y el conocimiento Base-0005 dice que vetar rinde antes del barrido, no después: la fila habría marcado para siempre cada cita sin nada que corregir. Se reescribió esa línea.
- **Los datos de la medición no viajan.** El importe errado y el nombre de cuenta que ilustraban la falla estaban en un README que **viaja adentro del plugin**, en el conocimiento y en este plan. Se reemplazaron por lo que el dato probaba —que el Agente contestó desde lo que tenía anotado en vez de leer sus datos, y nada avisó—, que es además lo que se entiende sin conocer el caso.

**Publicado y medido (09/08/2026).** Las cinco entradas nuevas dan **5/5**, incluida la trampa que separa los dos Modos de Comunicación. La primera corrida daba 0/5, y no por las `description`: `probar-disparo-de-skills` le pasaba la consulta a `claude` como argumento, y en Windows el intérprete la partía en palabras sueltas, así que el CLI tomaba solo la primera —el banco medía `preguntale`, no la consulta—. Corregido (la consulta va por STDIN), las once consultas del banco pasan sin tocar ninguna `description`. Quedó asentado como la novena forma del conocimiento Local-0013, la que contesta **en rojo**: el veredicto vale lo que valga la entrada.

## Leer antes de diseñar

El **Agente-Coordinador** (`D:\Proyectos\Agente-Coordinador`) ya tenía resuelto este problema en producción, y el subsistema se construyó sin mirarlo (choca con la Preferencia Local-0012, evaluar soluciones existentes antes de implementar una propia):

- `.claude/skills/consultar-agente/SKILL.md` — el flujo: confirmación de escrituras en tres pasos, protocolo de preguntas del agente, fichas de capacidades con chequeo de frescura, consulta en paralelo, costo.
- `.claude/skills/consultar-agente/scripts/consultar.sh` — el invocador: modos de permiso excluyentes, multi-turno con `--session-id`/`--resume`, `--allowed`, `--model`, `--stream`.

## Se cruza con

- [Buzones de comunicación entre Agentes](Buzones%20de%20comunicacion%20entre%20Agentes.md) — el corte asincrónico del mismo problema; ver el punto 6 de «A resolver».

Correr por `amp:planificar` antes de construir nada.
