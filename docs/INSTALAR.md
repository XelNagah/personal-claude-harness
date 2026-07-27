# Instalar el Agente Multipropósito

Manual de instalación y actualización del **Agente Multipropósito** en un repo. Cubre las dos situaciones:

- [Instalar de cero](#instalar-de-cero) — repo que todavía no tiene el harness.
- [Actualizar una instalación existente](#actualizar-una-instalación-existente) — repo que lo tiene, con nombres de plugin viejos o con archivos desactualizados.

Dos nombres que conviene tener claros antes de empezar, porque el manual los usa todo el tiempo: el **Agente Multipropósito** es lo que se instala — el mecanismo sin propósito, y lo único que tiene versión. Cuando le definís un **Propósito** al repo, nace un **Agente con Propósito**: ese repo, persiguiendo su objetivo, con lo que va aprendiendo guardado en sus subsistemas. Actualizar significa siempre poner al día el Agente Multipropósito **que está adentro** de un Agente con Propósito, sin tocar lo que aprendió.

El Agente Multipropósito se distribuye como Plugins para Claude Code y Codex CLI. La instalación principal de abajo es la de Claude Code; la de Codex CLI está en [Codex CLI](#codex-cli).

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
claude plugin install amp@xelnagah-harness -s local
```

Los seis `amp-<sub>` entran solos por dependencias: es **una instalación por repo**, no siete. Si lo hacés desde la sesión con `/plugin install` y te pregunta el alcance, elegí **local**.

<details>
<summary>Por qué <code>local</code> y no las otras dos opciones</summary>

**No `user`**, porque el harness aplica a los repos que lo usan, no a todos: a nivel usuario le pondría estas skills a cualquier repo que abras.

**No `project`**, porque no cumple lo que promete. El menú lo ofrece como *"install for all collaborators on this repository"*, pero lo único que viaja en el repo es la declaración en `.claude/settings.json`: **quien lo clone igual tiene que instalar el plugin a mano**. Se midió el 26/07/2026 — una sesión abierta en un repo que declaraba `amp@xelnagah-harness` sin tenerlo instalado no tenía la skill, y nada se instaló solo. Así que `project` deja configuración de máquina en un archivo versionado sin dar nada a cambio.

Con `local` esa declaración va a `.claude/settings.local.json`, que no se commitea.
</details>

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

Tres pasos. Los dos primeros se tipean; el tercero lo hace el agente.

### 1. Traer la versión nueva

En la sesión abierta en el repo:

```
/plugin marketplace update xelnagah-harness
/plugin update amp@xelnagah-harness
```

Si te pregunta el alcance, elegí **local**.

### 2. Reiniciar la sesión

Claude Code carga los plugins al arrancar y se queda con esos, así que hasta reiniciar seguís ejecutando la versión anterior.

**Reiniciar significa cerrar la ventana y abrir `claude` de nuevo.** Ni `/clear` ni `/reload-plugins` alcanzan, y ninguno de los dos avisa:

- `/clear` vacía la conversación pero **no termina el proceso**, y los plugins se cargan cuando el proceso arranca ⇒ seguís con las versiones que estaban al abrir la ventana.
- `/reload-plugins` recarga lo que ya está, en la versión que ya tenía.

Por qué importa: la versión vieja de `amp:inicializar` escribe la Base de preferencias y los textos de **su** momento. Si quedó atrasada, siembra en el repo vocabulario y reglas que el Agente Multipropósito ya cambió, y nada lo marca como error.

Para confirmar que el reinicio tomó, pedile a cualquier agente del repo que corra la Herramienta Base `actualizar-plugins`: si sigue listando algo como `SIN CARGAR`, la ventana no se reinició de verdad.

### 3. Pedir el nivelado

```
amp:actualizar
```

Y listo. Esa skill se encarga del resto:

- **Chequea los plugins** antes de tocar archivos, y si algo quedó atrasado lo pone al día y te pide otro reinicio. Si el repo viene de la generación de nombres vieja, **hace la migración él mismo** —instalar lo nuevo, desinstalar lo viejo con el alcance que le toca a cada uno— previa confirmación tuya, porque desinstalar no se puede deshacer.
- **Nivela el `.claude/`** contra la plantilla nueva: pisa lo Base (mecanismo del harness) y **no toca nunca** lo aprendido — tus memorias, planes, decisiones, términos, y las Herramientas y reglas de tu Propósito.
- **Respalda solo si hace falta**: si `.claude/` está versionado en git, lo omite (git ya es la red); si no, deja la copia fuera del repo y te dice dónde.
- **Trae vista previa** y pregunta ante cualquier cosa dudosa antes de escribirla.

### Verificar

```
amp:info
```

Muestra el Título, el Propósito y las métricas de cada subsistema. Si el repo todavía no tiene Propósito definido, la pantalla de arranque te lo va a pedir sola.

### Si algo no cierra

Para ver el estado de los plugins sin tocar nada:

```bash
node .claude/herramientas/actualizar-plugins/actualizar-plugins.js
```

Diagnostica **el repo donde se corre**. Sin `--aplicar` no escribe nada, así que se puede correr sin miedo; con `--aplicar` pone al día lo que esté atrasado.

Si el repo es anterior a que esa Herramienta existiera y no la tiene, está igual en la máquina —agregar un marketplace clona el repo entero—:

```bash
node ~/.claude/plugins/marketplaces/xelnagah-harness/.claude/herramientas/actualizar-plugins/actualizar-plugins.js
```

> La mecánica de fondo —por qué una versión puede estar publicada y no corriendo, qué mira cada comando del CLI y dónde engaña— está en la página de conocimiento `despliegue-de-plugins-claude-code.md`. No hace falta para actualizar; sirve cuando algo no da lo esperado.

---

## Codex CLI

Codex CLI usa el mismo marketplace. Después de registrarlo, corré desde el repo destino:

```bash
node <checkout-harness>/.claude/herramientas/instalar-plugins-codex/instalar-plugins-codex.js --aplicar
```

El instalador agrega cada dependencia antes del Plugin `amp`, porque `codex plugin add` no las instala automáticamente. El punto de entrada de instrucciones es `AGENTS.md`; Claude Code lo recibe mediante `CLAUDE.md`.

---

## Problemas frecuentes

**Las skills no aparecen después de instalar.** Falta reiniciar la sesión. Si ya reiniciaste, pedile `amp:actualizar`, que diagnostica los plugins antes de tocar nada.

**`claude plugin list` muestra nombres viejos.** Si no están en `enabledPlugins`, no cargan — son restos de la caché. Se pueden sacar con `claude plugin uninstall <viejo>@xelnagah-harness -s <alcance> -y`.

**La misma skill aparece dos veces.** Hay una generación vieja y otra nueva conviviendo: `registrar-memoria` aparece con prefijo `memoria-local:` y con `amp-memoria:`. No hay ganador definido, el modelo elige. Lo resuelve `amp:actualizar`: detecta los nombres retirados y hace la migración.

**Edité una skill en el repo y la sesión sigue comportándose igual.** Estás corriendo la copia instalada del Plugin: el cambio no llega hasta que lo commiteás, lo pusheás y actualizás el Plugin. Editar el repo local no alcanza, y `/reload-plugins` tampoco.

**`amp:inicializar` no pisó algo que yo quería actualizar.** Es a propósito: cuando encuentra algo divergente lo reporta en vez de pisarlo. Para converger contra la plantilla nueva usá `amp:actualizar`, que sí pisa lo Base (con respaldo).
