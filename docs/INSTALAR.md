# Instalar el Agente Multipropósito

Manual de instalación y actualización del **Agente Multipropósito** en un repo. Cubre las dos situaciones:

- [Instalar de cero](#instalar-de-cero) — repo que todavía no tiene el harness.
- [Actualizar una instalación existente](#actualizar-una-instalación-existente) — repo que lo tiene, con nombres de plugin viejos o con archivos desactualizados.

Dos nombres que conviene tener claros antes de empezar, porque el manual los usa todo el tiempo: el **Agente Multipropósito** es lo que se instala — el mecanismo sin propósito, y lo único que tiene versión. Cuando le definís un **Propósito** al repo, nace un **Agente con Propósito**: ese repo, persiguiendo su objetivo, con lo que va aprendiendo guardado en sus subsistemas. Actualizar significa siempre poner al día el Agente Multipropósito **que está adentro** de un Agente con Propósito, sin tocar lo que aprendió.

El Agente Multipropósito se distribuye como **marketplace de plugins de Claude Code** y, en paralelo, como skills en el estándar abierto [Agent Skills](https://agentskills.io/) (`SKILL.md`) para Codex CLI, Cursor y Gemini CLI. La instalación por marketplace de abajo es la de Claude Code; para los otros agentes ver [Otros agentes](#otros-agentes-codex-cursor-gemini).

---

## Qué instala

Un solo comando trae **7 plugins**: el transversal `amp` más los seis por subsistema, que entran solos como dependencias.

| Plugin | Skills | Para qué |
|--------|--------|----------|
| `amp` | `inicializar` · `planificar` · `info` · `actualizar` | Arma el `.claude/` completo, analiza planes contra lo que el repo ya sabe, muestra el estado, pone al día una instalación vieja |
| `amp-memoria` | `registrar-memoria` | Hechos que hay que recordar entre sesiones |
| `amp-preferencias` | `registrar-preferencia` | Reglas de conducta del agente, versionadas |
| `amp-planes` | `ciclo-de-plan` | Planes con estado, del alta al cierre |
| `amp-conocimiento` | `registrar-conocimiento` · `buscar-conocimiento` | Lo que el agente sabe del dominio |
| `amp-semantica` | `converger-terminologia` | Glosario del dominio y términos vetados |
| `amp-decisiones` | `registrar-decision` | Decisiones estructurales, para no re-decidir |

Además de esos seis, `amp:inicializar` escribe la estructura de tres subsistemas que todavía no tienen skill propia: **herramientas** (las tools que el repo se fabrica), **conducta** (reglas "cuando hagas X, asegurate de Y", entregadas por un hook) y **commits** (estilo de los mensajes).

---

## Instalar de cero

**Requisitos:** Claude Code instalado, y el repo destino abierto como directorio de trabajo. El repo puede estar vacío o ya tener contenido — la instalación es idempotente y no pisa lo que encuentra.

### 1. Agregar el marketplace

```bash
claude plugin marketplace add XelNagah/personal-claude-harness
```

### 2. Instalar el plugin transversal

```bash
claude plugin install amp@xelnagah-harness -s project
```

Los seis `amp-<sub>` entran solos por dependencias: es **una instalación por repo**, no siete.

El alcance (*scope*) es **`project`** a propósito: el harness aplica a los repos que lo usan, no a todos. Instalarlo a nivel usuario le pondría estas skills a cualquier repo que abras, incluidos los que no tienen `.claude/` de Agente Multipropósito.

### 3. Reiniciar la sesión

Claude Code lee los plugins al arrancar. Cerrá y volvé a abrir la sesión, o corré `/plugin` para verificar que aparezcan.

### 4. Armar el `.claude/` del repo

Adentro de la sesión, pedile al agente:

```
amp:inicializar
```

Escribe la estructura completa de los nueve subsistemas: índices, manifiestos, lints, el hook de conducta y el cableado en `AGENTS.md` / `CLAUDE.md`. Es **reconciliable**: si el repo ya tenía algo, crea solo lo ausente, respeta lo divergente y te reporta al final qué agregó, qué ya estaba y qué encontró distinto.

### 5. Verificar

```
amp:info
```

Muestra el Título y el Propósito del repo más las métricas de cada subsistema. Si algo falta, lo vas a ver ahí.

---

## Actualizar una instalación existente

Poner al día un Agente con Propósito es un **proceso de dos fases**, y cada una tiene su ejecutor. Las dos actualizan lo mismo —el Agente Multipropósito que el repo tiene adentro— por dos vías distintas:

| Fase | Qué pone al día | Quién la ejecuta |
|------|-----------------|------------------|
| **1. Plugins** | Los plugins instalados en la máquina: nombres, versiones, alcance | La Herramienta `actualizar-plugins` |
| **2. Archivos** | El contenido de `.claude/` en el repo: lints, manifiestos, estructura | La skill `amp:actualizar` |

**El orden de ejecución es plugins primero, después archivos**, con un reinicio en el medio. El motivo: los archivos los escribe una skill que viaja *adentro* del plugin, así que si nivelás los archivos antes, te los pone al día una versión vieja del instalador.

### Fase 1 — los plugins

```bash
node .claude/herramientas/actualizar-plugins/actualizar-plugins.js            # diagnostica
node .claude/herramientas/actualizar-plugins/actualizar-plugins.js --aplicar  # actualiza
```

Sin `--aplicar` la Herramienta solo diagnostica, así que se puede correr sin miedo para ver cómo está la instalación. Chequea **tres desfases distintos**:

1. **El marketplace bajado** (la copia que Claude Code clona en tu máquina) todavía no trajo lo publicado. Engaña porque todo lo demás se compara contra eso: si está viejo, un plugin atrasado se informa `ACTUALIZADO`. Aparece en el bloque `MARKETPLACES BAJADOS` como `ACTUALIZAR` y se arregla con `--aplicar`.
2. **Los plugins que falta traer** de lo bajado. Se arreglan con `--aplicar`.
3. **Los que ya se trajeron pero la sesión no tomó**, porque arrancó antes de que llegaran. Aparecen como `[SIN CARGAR]` y **se arreglan reiniciando, no actualizando**; también engaña, porque `claude plugin list` muestra la versión nueva mientras la sesión ejecuta la vieja.

**Después: reiniciar la sesión.** Hasta entonces seguís con la versión vieja cargada. `/reload-plugins` **no** sirve para esto: recarga los plugins que ya están, en la versión que ya tenían.

Aparte de esos tres desfases, la Herramienta marca `RETIRADO` a los plugins habilitados cuyo nombre el marketplace ya no ofrece. Esos **no los arregla `--aplicar`**: son una migración y van por [su propia sección](#si-aparecen-nombres-de-plugin-retirados).

#### Si el repo todavía no tiene la Herramienta

Un repo instalado antes de que `actualizar-plugins` existiera no la tiene en su `.claude/`. **Igual se puede usar**: agregar o actualizar un marketplace clona el repo entero en la máquina, así que la Herramienta está ahí desde antes de instalar cualquier plugin.

```bash
node ~/.claude/plugins/marketplaces/xelnagah-harness/.claude/herramientas/actualizar-plugins/actualizar-plugins.js
```

En Windows, `~` es `%USERPROFILE%`. Diagnostica el repo donde se corre, no el del marketplace.

Y normalmente **ni siquiera hace falta**: `amp:actualizar` la busca sola —primero en el repo, después en el marketplace bajado— y hace la fase 1 él mismo. Los comandos del CLI de acá abajo son para cuando se quiere hacer a mano:

```bash
# 1. Traer el catálogo nuevo desde GitHub
claude plugin marketplace update xelnagah-harness

# 2. Actualizar el plugin (arrastra los 6 amp-<sub> por dependencias)
claude plugin update amp@xelnagah-harness --scope project
```

⚠️ **Las dos partes del segundo comando son obligatorias.** Con el nombre pelado (`claude plugin update amp`) falla con *Plugin "amp" not found*, y sin `--scope project` lo busca en el alcance de usuario, donde no está — el Agente Multipropósito se instala con alcance de proyecto. El mensaje de error es el mismo en los dos casos y no dice cuál de las dos cosas falta. Por eso conviene usar la Herramienta y no los comandos sueltos.

**Verificar que aplicó:** `claude plugin list` tiene que mostrar la versión nueva. Si querés confirmarlo contra el origen, la versión que corre es el nombre de la carpeta en `~/.claude/plugins/cache/xelnagah-harness/<plugin>/<version>/`.

#### Si aparecen nombres de plugin retirados

Si instalaste el Agente Multipropósito antes de la consolidación en 7 plugins, tenés hasta 10 plugins con nombres viejos (`memoria-local`, `gestion-de-planes`, `preferencias-trabajo`, `conocimiento`, `semantica`, `decisiones`, `herramientas`, `conducta`, `planificar`, `amp-actualizar`). Hay que poner el conjunto nuevo y sacar esos.

**Sacarlos no es opcional.** La generación vieja y la nueva no se pisan: **coexisten**. `memoria-local` y `amp-memoria` traen las dos una skill `registrar-memoria`, con la misma descripción y distinto prefijo de plugin, y no hay ganador definido — el modelo elige cuál usa. Mientras convivan, cada tarea puede caer en la versión vieja sin que te enteres.

**La hace `amp:actualizar`.** Pedísela y ejecuta la migración completa —instalar lo nuevo, desinstalar lo viejo con el alcance de cada uno, pedirte el reinicio— previa confirmación tuya, porque desinstalar no se puede deshacer: esos nombres ya no se publican, así que no hay forma de reinstalarlos desde el marketplace. Los comandos de abajo son para hacerlo a mano.

Es una **migración, no una actualización**: `actualizar-plugins --aplicar` no la ejecuta por su cuenta; marca los plugins como `RETIRADO` e imprime los comandos, cada uno con **su** alcance.

⚠️ **Los alcances pueden ser distintos entre generaciones.** Es normal que los viejos estén en `project` y los nuevos en `local`. Con el alcance equivocado el comando no encuentra nada y no borra nada, sin error claro — por eso conviene tomar los comandos de la Herramienta y no escribirlos de memoria.

⚠️ **El orden es obligatorio: instalar lo nuevo → desinstalar lo viejo → reiniciar.** Nunca al revés: entre medio el repo se queda sin las skills que todavía usa.

```bash
# 1. Traer la lista nueva de plugins desde GitHub
claude plugin marketplace update xelnagah-harness

# 2. Instalar el conjunto nuevo (trae los 6 amp-<sub> por dependencias)
claude plugin install amp@xelnagah-harness -s project

# 3. Recién ahora, sacar los nombres viejos de todos los alcances donde estén
for p in memoria-local preferencias-trabajo gestion-de-planes conocimiento \
         semantica decisiones herramientas conducta planificar amp-actualizar; do
  for s in project local user; do
    claude plugin uninstall "$p@xelnagah-harness" -s "$s" -y 2>/dev/null
  done
done
```

En PowerShell, el paso 3 es:

```powershell
foreach ($p in @('memoria-local','preferencias-trabajo','gestion-de-planes','conocimiento',
                 'semantica','decisiones','herramientas','conducta','planificar','amp-actualizar')) {
  foreach ($s in @('project','local','user')) {
    claude plugin uninstall "$p@xelnagah-harness" -s $s -y
  }
}
```

**Después: reiniciar la sesión.** Los plugins nuevos no cargan hasta entonces.

> **`claude plugin prune` no sirve para limpiar acá.** Solo mira el alcance de usuario: con seis dependencias huérfanas instaladas en alcance de proyecto contesta `Nothing to prune (no auto-installed plugins at user scope)`. Las dependencias de proyecto se sacan a mano, una por una.

> **Desinstalar un plugin no arrastra sus dependencias.** `claude plugin uninstall amp@xelnagah-harness -s project` saca **solo** `amp` y deja los seis `amp-<sub>` instalados y habilitados. Si alguna vez necesitás sacar el conjunto entero, van los siete nombres, uno por uno.

**Verificar que quedó bien.** Lo que carga de verdad no es lo que lista `claude plugin list`, sino el campo `enabledPlugins` de `settings.json` — el del repo (`.claude/settings.json`) y el del usuario (`~/.claude/settings.json`). Ahí tienen que estar los siete nombres nuevos y ninguno viejo. Si `plugin list` sigue mostrando nombres viejos marcados como deshabilitados pero no están en `enabledPlugins`, son restos de la caché: no cargan y no molestan.

### Fase 2 — los archivos del `.claude/`

Ya con los plugins nuevos cargados, adentro de la sesión:

```
amp:actualizar
```

Converge la estructura del repo contra la plantilla nueva. En concreto:

- **Lo Base** (el mecanismo del harness: lints, manifiestos, estructura, cableado del hook) se **pisa**, respaldando antes la versión vieja en `.claude/.respaldo-amp/<fecha>/`. El respaldo importa porque `.claude/` suele estar fuera del control de versiones, así que no hay red abajo.
- **Lo aprendido** (el contenido que el repo acumuló: tus memorias, planes, decisiones, términos) **no se toca nunca**.
- **Los renombres conocidos** se aplican solos (`glosario/` → `semantica/`) y los subsistemas que falten se instalan.
- **Lo dudoso se pregunta**: si algo del acomodo viejo puede enredar contenido aprendido, frena y consulta antes.

Trae vista previa: te muestra qué va a hacer antes de hacerlo.

---

## Otros agentes: Codex, Cursor, Gemini

No hay marketplace para ellos. Las skills se enlazan a la ubicación estándar de Agent Skills:

```bash
git clone https://github.com/XelNagah/personal-claude-harness.git
cd personal-claude-harness
node .claude/herramientas/instalar-junctions/instalar-junctions.js
```

Eso crea enlaces (junctions en Windows) desde `~/.agents/skills/` —donde miran Codex, Cursor y Gemini— hacia las skills de este repo, y desde `~/.claude/skills/` para Claude Code. Es idempotente: repara lo que falte y no pisa lo que apunte a otro lado.

> ⚠️ **No mezclar enlace y plugin de la misma skill en una máquina**: colisionan por nombre. El enlace sirve para editar las skills en vivo (autoría); el plugin instalado, para consumirlas.

El punto de entrada de instrucciones es `AGENTS.md` en la raíz del repo, que esos agentes leen de forma nativa. Claude Code no lee `AGENTS.md`, por eso hay un `CLAUDE.md` de una línea que lo importa.

**Límite conocido:** el prefijo `amp:` / `amp-<sub>:` que separa las skills por subsistema es un mecanismo de Claude Code. Con enlaces, las skills se ven con el nombre pelado (`registrar-memoria` en vez de `amp-memoria:registrar-memoria`).

---

## Problemas frecuentes

**Las skills no aparecen después de instalar.** Falta reiniciar la sesión. Si ya reiniciaste, revisá `enabledPlugins` en `.claude/settings.json`.

**`claude plugin list` muestra nombres viejos.** Si no están en `enabledPlugins`, no cargan — son restos de la caché. Se pueden sacar con `claude plugin uninstall <viejo>@xelnagah-harness -s <alcance> -y`.

**La misma skill aparece dos veces.** Dos causas posibles:

- **Enlace y plugin conviviendo.** Elegí uno: borrá el enlace de `~/.claude/skills/<skill>` o desinstalá el plugin.
- **Generación vieja y nueva conviviendo** — `registrar-memoria` aparece con prefijo `memoria-local:` y con `amp-memoria:`. No hay ganador definido, el modelo elige. Se arregla desinstalando los nombres viejos (ver [Si aparecen nombres de plugin retirados](#si-aparecen-nombres-de-plugin-retirados)).

**Edité una skill en el repo y la sesión sigue comportándose igual.** Si la consumís por plugin, estás corriendo la copia de la caché, que se sirve de GitHub: el cambio no llega hasta que lo commiteás, lo pusheás y corrés la fase 1. Editar el repo local no alcanza, y `/reload-plugins` tampoco. Si estás escribiendo skills a menudo, conviene consumirlas por enlace (ver la sección de otros agentes) en vez de por plugin.

**`amp:inicializar` no pisó algo que yo quería actualizar.** Es a propósito: cuando encuentra algo divergente lo reporta en vez de pisarlo. Para converger contra la plantilla nueva usá `amp:actualizar`, que sí pisa lo Base (con respaldo).
