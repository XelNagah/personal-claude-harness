# actualizar-plugins

Prepara el marketplace y los **plugins** que este Agente con Propósito usa en Claude Code o Codex antes de nivelar sus archivos. Evita diagnosticar un agente mirando la configuración del otro.

```bash
# diagnostica, no toca nada
node .claude/herramientas/actualizar-plugins/actualizar-plugins.js --agente claude

# diagnostica Codex, sin tocar nada
node .claude/herramientas/actualizar-plugins/actualizar-plugins.js --agente codex

# actualiza lo que esté atrás y vuelve a verificar
node .claude/herramientas/actualizar-plugins/actualizar-plugins.js --agente codex --aplicar

# apuntarlo a otro repo de la máquina
node .claude/herramientas/actualizar-plugins/actualizar-plugins.js --agente claude "D:/Proyectos/otro-repo"

# en segundo plano: no imprime, deja el aviso en el Buzón de Avisos Generales
node .claude/herramientas/actualizar-plugins/actualizar-plugins.js --avisar
```

`amp:actualizar` elige el agente y ejecuta esta Herramienta con el argumento correspondiente; quien la usa no tiene que recordarlo. Si se corre el script a mano y no recibe `--agente`, solo acepta una detección inequívoca del proceso; ante duda pide el argumento en vez de revisar el estado equivocado.

## Claude Code y Codex

Los dos agentes guardan marketplaces y plugins en configuraciones distintas. Con `--agente claude`, la Herramienta conserva el diagnóstico por repo, los alcances y las versiones instaladas de Claude Code. Con `--agente codex`, verifica el marketplace `xelnagah-harness`; `--aplicar` lo agrega si falta, lo actualiza y reinstala `amp` junto con todas sus dependencias. En ambos casos termina pidiendo reiniciar la sesión antes de tocar archivos.

## Por qué hace falta

Hay **cuatro desfases distintos**, y todos menos el segundo engañan:

1. **Publicado ↔ bajado** — el marketplace bajado todavía no trajo lo último. Engaña porque *todo lo demás se compara contra lo bajado*: si está viejo, un plugin atrasado se informa `ACTUALIZADO`. Se arregla con `--aplicar`.
2. **Bajado ↔ instalado** — el marketplace bajado tiene una versión nueva que esta máquina no instaló. Se arregla con `--aplicar`.
3. **Instalado ↔ cargado** — se instaló, pero la **sesión viva** sigue con la versión que cargó al arrancar. Se arregla **reiniciando**, y es silencioso: `claude plugin list` muestra la versión nueva mientras la sesión corre la vieja.
4. **Declarado ↔ requerido** — un plugin instalado exige dependencias que el repo nunca declaró, así que **no carga** y sus skills no existen en la sesión. Es el que más engaña: los otros tres al menos dejan una fila. Se arregla con `--aplicar`, y da el estado `SIN DECLARAR`.

Los tres primeros pasaron el 25/07/2026:

- Por la tarde, `amp` corría la 0.6.2 con la 0.6.3 publicada seis commits atrás. La versión vieja no tenía una preferencia Base que sí estaba escrita en el repo, así que el instalador habría sembrado preferencias viejas en un repo nuevo.
- A la noche, después de publicar la 0.6.5, el plugin **se trajo solo en segundo plano** (registro actualizado 00:12) pero la sesión —arrancada a las 19:34— siguió ejecutando la 0.6.3. La skill se cargó desde la carpeta vieja de la caché sin que nada lo indicara.
- Más tarde, publicada la 0.6.6, el marketplace bajado se había refrescado **doce minutos antes** del push. La Herramienta informó `TODO ACTUALIZADO` sobre un catálogo que no tenía la versión nueva: lo instalado coincidía con lo bajado, y lo bajado estaba viejo.

El cuarto se midió el 28/07/2026 sobre un repo consumidor y sobre un repo de prueba:

- El consumidor tenía `amp` 0.7.1 instalado y cinco de sus ocho dependencias. La Herramienta informaba `TODO ACTUALIZADO` y la sesión no tenía ninguna de las cuatro skills de `amp`. En el registro de depuración estaba el motivo —`error type: dependency-unsatisfied`—, pero ahí no lo mira nadie, y nombra **una sola** de las tres que faltaban.
- Sacada una dependencia en el repo de prueba, el arranque procesa 7 plugins habilitados en vez de 8: Claude Code descarta el plugin **entero**, no la dependencia.
- `claude plugin update amp` contesta *"already at the latest version"* y no instala ninguna. `claude plugin install amp`, sobre un repo al que le faltan tres, repara **una por corrida**. De ahí que la Herramienta instale cada dependencia por su nombre en vez de confiar en el arrastre.

De ahí salen los dos chequeos que no se leen de un archivo:

- **Cargado**: se compara la hora en que se actualizó cada plugin contra la hora en que arrancó la sesión (por `CLAUDE_PID`). Si el plugin es más nuevo, lo marca `[SIN CARGAR]`. Si no puede averiguar el arranque —otro agente, otro sistema— lo dice y omite ese chequeo, en vez de dar por buena una comparación que no hizo.
- **Catálogo**: se le pregunta al remoto por el commit publicado con `git ls-remote` (~0,6 s, y no toca lo bajado: no trae ni escribe nada). Sin salida a red hay una reserva, abajo.

## Qué compara

Por cada plugin habilitado para el repo (`enabledPlugins` de `.claude/settings.json`, `settings.local.json` y el del usuario) **y por cada dependencia que esos plugins arrastran**, aunque el repo no la declare:

| Estado | Qué significa |
|--------|---------------|
| `ACTUALIZADO` | Lo que corre coincide con lo disponible |
| `ACTUALIZAR` | Hay versión nueva sin traer |
| `RETIRADO` | Está habilitado pero el marketplace ya no lo ofrece — el repo quedó en una generación de nombres vieja. **Actualizar no lo arregla**: es una migración (desinstalar los nombres viejos, instalar el conjunto nuevo) |
| `NO INSTALADO` | Habilitado en `settings` pero sin entrada instalada |
| `SIN DECLARAR` | Otro plugin la requiere y este repo **no la nombra** en `enabledPlugins`. El que la pide no carga: Claude Code lo descarta entero y sus skills no se registran. No es `NO INSTALADO` — ese estado es para un plugin que el repo sí declara |
| `SIN DATO` | El plugin se sirve de un origen propio, el catálogo no se pudo leer, o una dependencia requerida no está en el catálogo |

Y una marca aparte, que se suma a cualquiera de esos estados:

| Marca | Qué significa |
|-------|---------------|
| `[SIN CARGAR]` | El plugin se actualizó **después** de que arrancó esta sesión: está instalado pero la sesión sigue con la versión vieja. No se arregla con `--aplicar` — hay que **reiniciar** |

- **Lo requerido** sale del `plugin.json` de cada plugin dentro del marketplace bajado, recorriendo `dependencies` en cadena. `enabledPlugins` no sirve para esto: es la foto del momento en que se instaló, y no se mueve cuando una versión posterior suma dependencias.
- **Lo instalado** sale de `installed_plugins.json`, prefiriendo la entrada de este repo sobre la de alcance usuario.
- **Lo disponible** sale del `plugin.json` dentro del marketplace bajado. Si ese manifiesto no declara `version`, el plugin se versiona por commit y se comparan los sha.
- **Lo cargado** no se lee: se deduce comparando el `lastUpdated` de cada plugin contra la hora de arranque del proceso de la sesión (`CLAUDE_PID`). Si el plugin es posterior, no está cargado.

## El estado de los marketplaces bajados

Una línea por marketplace, no por plugin: lo bajado es compartido por todos los plugins que sirve, y de ahí sale la columna *disponible*.

La columna dice **la acción que corresponde**, no el diagnóstico:

| Estado | Qué significa |
|--------|---------------|
| `ACTUALIZADO` | Verificado: lo bajado está en el mismo commit que lo publicado. No hay nada que hacer |
| `ACTUALIZAR` | Lo bajado está atrasado, **o** no se pudo verificar que no lo esté. Los dos casos se resuelven igual, y refrescar de más sale casi nada: se comparan las versiones, no difieren, sigue. El motivo puntual queda en el detalle de al lado |
| `N/A` | El registro declara un marketplace servido desde una carpeta local: no hay "publicado" contra qué comparar |

Se averigua por dos vías, en orden:

1. **Por red** — `git ls-remote origin HEAD` sobre el marketplace bajado devuelve el commit publicado sin traer nada. Es la vía normal: **0,6 s**.
2. **Sin red** — si la consulta falla o vence (5 s), queda `ACTUALIZAR`: no hay evidencia de qué commit tiene GitHub. Si la Herramienta corre desde el repo que publica el marketplace, compara además ese commit con el checkout bajado para explicar el desfase, pero nunca lo convierte en `ACTUALIZADO` sin consultar el remoto.

Cuando lo bajado está en `ACTUALIZAR` **y** el repo desde donde se corre es el que publica, se listan además las versiones que cambian (`amp: bajado 0.6.5 · este repo 0.6.6`). Desde un consumidor eso no se puede saber: leer el árbol del remoto exigiría traerlo, que es lo que hace `--aplicar`.

⚠️ Con un marketplace en `ACTUALIZAR`, la Herramienta **no dice `TODO ACTUALIZADO`** aunque cada plugin coincida con lo bajado: avisa que la comparación se hizo contra datos que pueden estar viejos y remite a `--aplicar`.

Es genérico: no hardcodea nombres de plugin ni de marketplace, así que también reporta los plugins ajenos al harness que el repo tenga habilitados.

## Las dos partes entre sí

Un Agente Multipropósito son **dos cosas que viajan por caminos distintos**: sus **skills**, que llegan como plugins, y sus **archivos**, que escribe `amp:inicializar` dentro de `.claude/`. Cada camino tiene su control —esta Herramienta mira los plugins, `amp:actualizar` mira los archivos—, y de ahí se sigue un desfase que ninguno de los dos podía ver: el de las dos partes **entre sí**. Cada una puede estar al día por su cuenta y no coincidir con la otra, con los dos controles en verde por separado.

La comparación se hace contra la **PLANTILLA del plugin que efectivamente corre**, cuya ruta sale del propio registro de instalación (`installPath`), no de adivinar una versión. Cada bloque de código de esa plantilla declara su destino; si el archivo que hay en el repo no coincide, las dos partes están en generaciones distintas.

Tres resultados posibles, y los tres significan cosas distintas:

- **Coinciden** — los archivos del repo son los que instalaría el plugin que corre. Es lo normal.
- **Difieren** — hay que nivelar los archivos con `amp:actualizar`. En el repo que **publica** el Agente Multipropósito es lo esperable mientras haya cambios sin publicar.
- **No se compara** — el plugin no está instalado para ese repo, así que no hay contra qué comparar. Se calla a propósito: tomar la versión instalada para *otro* repo sería el modo de falla que esta Herramienta existe para no cometer.

Ojo con no confundirlo con el desfase de versiones: un repo puede tener los plugins atrasados **y** las dos partes coincidiendo, porque las dos son de la misma generación vieja. Medido el 30/07/2026 en un consumidor: nueve plugins atrasados y los archivos en perfecta correspondencia con ellos.

## El cache huérfano

El cache de plugins **es de la máquina, no del repo**: dos repos pueden correr versiones distintas del mismo plugin a propósito. Así que lo único que se informa como sobrante es lo que **ninguna entrada de instalación declara**, mirando el registro completo y no solo este repo. Marcar como sobrante una versión que otro repo está usando sería el mismo error que la Herramienta evita al no tomar la versión instalada allá.

Se distinguen dos clases, porque significan cosas distintas:

- **Nombres que el marketplace ya no ofrece** — generaciones de nombres que quedaron bajadas después de una migración.
- **Plugins vigentes en versiones que ya no corren** — el residuo normal de publicar seguido, y en volumen suele ser la mayoría.

Nada limpia esto y crece con cada publicación: el CLI baja cada versión a su carpeta y, al actualizar, apunta el registro a la nueva sin borrar la anterior. Medido el 02/08/2026 en esta máquina: `amp` iba por la 0.25.0 con siete carpetas bajadas y una sola en uso.

Un ejemplo de por qué el criterio prudente importa, medido el 30/07/2026 en esta máquina: `amp-memoria` es un nombre que el marketplace ya no ofrece, pero **no** figura como sobrante porque un repo todavía lo declara. Eso además delata un consumidor sin migrar, que es información útil por sí sola.

### Borrarlo: `--limpiar-cache`

**`--aplicar` no lo enciende**, y es a propósito: quien nivela un repo pidió eso, no que se borre nada de su carpeta de usuario. Son dos permisos distintos y llevan dos flags distintos.

```bash
node .claude/herramientas/actualizar-plugins/actualizar-plugins.js --agente claude --limpiar-cache
```

Que ninguna instalación declare una carpeta alcanza para **informarla**, no para borrarla: el registro puede no saber lo que la máquina está usando. Por eso hay dos guardas, y cada una saltea el plugin **entero** en vez de adivinar cuál de sus carpetas se salva:

- **Registro incompleto** — una entrada sin `version` no aporta nada al conjunto en uso, así que *todas* las carpetas de ese plugin se ven libres. Hoy el registro siempre la trae (incluso los que versionan por commit, donde el campo lleva el hash), así que la guarda no se dispara nunca; existe porque el día que falte, el borrado se lleva puesta justo la versión que corre.
- **Sesión viva** — un plugin `[SIN CARGAR]` se actualizó después de que arrancó la sesión, que sigue ejecutándose desde su carpeta anterior del cache. Esa carpeta ya no figura en el registro, o sea que aparece como huérfana, y borrarla no rompe la sesión que viene: rompe la que está abierta. Se saltea hasta el reinicio.

Lo salteado se informa con su motivo, no se calla.

## El aviso al arrancar (`--avisar`)

La Pantalla de bienvenida lanza esta Herramienta **en segundo plano** en cada arranque y **no la espera**: corre con `--avisar`, no imprime nada y deja lo que averiguó en `.claude/tmp/avisos/plugins.txt`, el Buzón de Avisos Generales. El hook repartidor lo entrega en el turno siguiente y lo borra. Así el arranque no paga el diagnóstico —1,7 s con red, y sin red hasta el vencimiento del plazo por marketplace— contra un presupuesto de 100 ms para un evento bloqueante.

El aviso **pone primero lo que rompe**: un plugin `SIN DECLARAR` o `NO INSTALADO` no carga, y sus skills no existen en la sesión sin que nada lo diga. Una versión atrasada, en comparación, es un inconveniente. Cierra diciendo que hay que **reiniciar** después de actualizar —los plugins nuevos no entran en la sesión viva— y que **informa, no actúa**, porque el mismo texto llega al modelo.

Un repo sin desfases **no deja aviso**, y si había uno viejo lo borra: un aviso que aparece siempre se vuelve ruido y se deja de leer.

### Apagar la salida a internet

Lo único que sale a la red es preguntarle al remoto si hay algo publicado que esta máquina no bajó. Se apaga entero declarando `AMP_SIN_RED=1` en el bloque `env` del `settings.json` del repo:

```json
{ "env": { "AMP_SIN_RED": "1" } }
```

Con eso el aviso sigue funcionando con lo que hay en disco —que es donde se detecta lo que rompe— y no se consulta nada afuera. Existe porque esto corre en cada arranque de cada Agente Desplegado, y una salida a internet que el usuario no pidió tiene que poder no ocurrir.

Además, la consulta al remoto no se repite si otra corrida la hizo hace menos de un minuto: sin eso, abrir varias sesiones de golpe dispara una por cada una. La marca es **solo de esa parte**; el aviso se rehace siempre, así que nunca queda uno viejo dando vueltas.

## Apuntarla a otro repo

Pasándole una ruta diagnostica —y con `--aplicar`, arregla— **otro** Agente con Propósito de la máquina, sin abrir una sesión ahí. Tres cosas cambian respecto de correrla sobre el propio, y las tres son casos donde antes contestaba de más:

- **Lo instalado es por repo.** `installed_plugins.json` guarda una entrada por `projectPath`: dos repos de la misma máquina pueden correr versiones distintas del mismo plugin. Sin entrada propia (ni de alcance usuario) el plugin está `NO INSTALADO` — nunca se toma la entrada de otro repo.
- **Los comandos corren en el repo apuntado.** `--scope project` significa "el proyecto del directorio donde corre el comando", así que todo se lanza con ese directorio como raíz. Sin eso, diagnosticaría allá y escribiría acá.
- **El chequeo de `[SIN CARGAR]` se omite.** Se deduce del arranque de la sesión que ejecuta el script, y en el repo apuntado no hay ninguna sesión que mirar. Se dice explícitamente en vez de marcar plugins que nadie tenía que haber cargado.

## Qué corre con `--aplicar`

```
claude plugin marketplace update <marketplace>
claude plugin update <plugin>@<marketplace> --scope <alcance>
```

⚠️ Las dos partes del segundo comando son obligatorias: con el nombre pelado (`claude plugin update amp`) o con el alcance por omisión falla con el mismo mensaje, `Plugin "amp" not found`, que no dice cuál de las dos falta. Por eso conviene correr esto y no los comandos a mano.

Refresca el catálogo primero y **vuelve a diagnosticar** antes de actualizar: traer el catálogo puede cambiar qué está atrasado.

**Después hay que reiniciar la sesión.** `/reload-plugins` no alcanza: recarga los plugins en la versión que ya tenían.

## Lo que no hace

- **No escribe el handoff.** Un script no sabe en qué venías trabajando; eso lo redacta el agente antes de llamarlo.
- **No toca los archivos de `.claude/`.** Esa es la otra fase, y la pone al día `amp:actualizar`.
- **No desinstala los nombres retirados.** Imprime el comando exacto y el orden; ejecutarlo es tuyo (ver abajo).

## Los nombres retirados

Un `RETIRADO` no se arregla actualizando: el nombre ya no está en el marketplace, así que no hay versión nueva que traer. Es una migración, y **el orden importa**:

1. **Instalar el conjunto nuevo.**
2. **Desinstalar los viejos** — la Herramienta imprime una línea por cada uno, con el alcance que corresponde:
   ```
   claude plugin uninstall <plugin>@<marketplace> --scope <alcance>
   ```
   Y sacar además su línea de `enabledPlugins` del `settings` donde esté declarado.
3. **Reiniciar la sesión.**

**Al revés no**: entre el paso 2 y el 1 el repo se queda sin las skills que todavía usa. Y desinstalar **no es reversible desde el marketplace** — esos nombres ya no están ahí para volver a instalarlos.

Por eso la Herramienta **imprime el comando pero no lo ejecuta**, ni siquiera con `--aplicar`. Para ver qué dependencias quedarían sin dueño sin tocar nada: `claude plugin prune --dry-run`.

⚠️ Mientras conviven, **el viejo y el nuevo no se pisan: coexisten**. `memoria-local` y `amp-memoria` traen los dos una skill `registrar-memoria`, con la misma descripción y distinto prefijo de plugin. No hay ganador definido — el modelo elige. De ahí que el paso 2 no sea opcional.

Sin `process.exit(1)`: reporta, no frena — es capa mecánica, el juicio queda del lado del agente.
