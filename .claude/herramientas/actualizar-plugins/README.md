# actualizar-plugins

Pone al día los **plugins** que este Agente con Propósito tiene habilitados en esta máquina —los que le traen su Agente Multipropósito—, y sirve de control de desfase.

```bash
# diagnostica, no toca nada
node .claude/herramientas/actualizar-plugins/actualizar-plugins.js

# actualiza lo que esté atrás y vuelve a verificar
node .claude/herramientas/actualizar-plugins/actualizar-plugins.js --aplicar

# apuntarlo a otro repo de la máquina
node .claude/herramientas/actualizar-plugins/actualizar-plugins.js "D:/Proyectos/otro-repo"
```

## Por qué hace falta

Hay **tres desfases distintos**, y el primero y el tercero son los que engañan:

1. **Publicado ↔ bajado** — el marketplace bajado todavía no trajo lo último. Engaña porque *todo lo demás se compara contra lo bajado*: si está viejo, un plugin atrasado se informa `ACTUALIZADO`. Se arregla con `--aplicar`.
2. **Bajado ↔ instalado** — el marketplace bajado tiene una versión nueva que esta máquina no instaló. Se arregla con `--aplicar`.
3. **Instalado ↔ cargado** — se instaló, pero la **sesión viva** sigue con la versión que cargó al arrancar. Se arregla **reiniciando**, y es silencioso: `claude plugin list` muestra la versión nueva mientras la sesión corre la vieja.

Los tres pasaron el 25/07/2026:

- Por la tarde, `amp` corría la 0.6.2 con la 0.6.3 publicada seis commits atrás. La versión vieja no tenía una preferencia Base que sí estaba escrita en el repo, así que el instalador habría sembrado preferencias viejas en un repo nuevo.
- A la noche, después de publicar la 0.6.5, el plugin **se trajo solo en segundo plano** (registro actualizado 00:12) pero la sesión —arrancada a las 19:34— siguió ejecutando la 0.6.3. La skill se cargó desde la carpeta vieja de la caché sin que nada lo indicara.
- Más tarde, publicada la 0.6.6, el marketplace bajado se había refrescado **doce minutos antes** del push. La Herramienta informó `TODO ACTUALIZADO` sobre un catálogo que no tenía la versión nueva: lo instalado coincidía con lo bajado, y lo bajado estaba viejo.

De ahí salen los dos chequeos que no se leen de un archivo:

- **Cargado**: se compara la hora en que se actualizó cada plugin contra la hora en que arrancó la sesión (por `CLAUDE_PID`). Si el plugin es más nuevo, lo marca `[SIN CARGAR]`. Si no puede averiguar el arranque —otro agente, otro sistema— lo dice y omite ese chequeo, en vez de dar por buena una comparación que no hizo.
- **Catálogo**: se le pregunta al remoto por el commit publicado con `git ls-remote` (~0,6 s, y no toca lo bajado: no trae ni escribe nada). Sin salida a red hay una reserva, abajo.

## Qué compara

Por cada plugin habilitado para el repo (`enabledPlugins` de `.claude/settings.json`, `settings.local.json` y el del usuario):

| Estado | Qué significa |
|--------|---------------|
| `ACTUALIZADO` | Lo que corre coincide con lo disponible |
| `ACTUALIZAR` | Hay versión nueva sin traer |
| `RETIRADO` | Está habilitado pero el marketplace ya no lo ofrece — el repo quedó en una generación de nombres vieja. **Actualizar no lo arregla**: es una migración (desinstalar los nombres viejos, instalar el conjunto nuevo) |
| `NO INSTALADO` | Habilitado en `settings` pero sin entrada instalada |
| `SIN DATO` | El plugin se sirve de un origen propio, o el catálogo no se pudo leer |

Y una marca aparte, que se suma a cualquiera de esos estados:

| Marca | Qué significa |
|-------|---------------|
| `[SIN CARGAR]` | El plugin se actualizó **después** de que arrancó esta sesión: está instalado pero la sesión sigue con la versión vieja. No se arregla con `--aplicar` — hay que **reiniciar** |

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
