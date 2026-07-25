# Refresco de autoría al pasar de enlace a plugin

**Estado: Nuevo · Creado 26-07-25.** Origen: [Modelo de distribución y empaquetado del harness](../ejecutados/Modelo%20de%20distribucion%20y%20empaquetado%20del%20harness.md), sección "Abierto" — hueco heredado de la decisión **0013**, que eligió la instalación por plugin sin definir cómo sigue trabajando la máquina que **autora** el harness.

## El problema

Este repo tiene dos formas de consumir sus propias skills, y no pueden convivir para el mismo skill (colisionan por nombre; lo dice `AGENTS.md`):

- **Enlace (junction NTFS):** `~/.claude/skills/<skill>` y `~/.agents/skills/<skill>` apuntan a `funcionalidades/<n>/skills/<skill>`. Editás el `SKILL.md` y el cambio está vivo en la sesión siguiente, sin pasos intermedios. Es la forma de **autoría**.
- **Plugin instalado:** el skill vive en el cache de plugins, que se llena clonando el repo. Editás el `SKILL.md` del repo y **no pasa nada** hasta que subís la versión, commiteás, pusheás y actualizás el plugin. Es la forma de **consumo**.

Hoy esta máquina está del lado plugin: los 7 plugins están habilitados en `.claude/settings.json` y `lint-harness` reporta 22 enlaces faltantes como hallazgo conocido. O sea que **el repo que autora el harness lo consume como si fuera un repo ajeno**: un cambio en un `SKILL.md` no se prueba hasta publicarlo.

## Lo que se verificó el 25/07/2026

Lo de arriba dejó de ser sospecha. Mediciones sobre esta máquina:

- **El marketplace `xelnagah-harness` es de tipo `github`** (`XelNagah/personal-claude-harness`), no de tipo `directory`. Los plugins se sirven de un **clon del repo remoto**, no del disco. Consecuencia dura: **no hay forma de probar un cambio sin publicarlo antes**. El ciclo real no es de cinco pasos sino de seis — editar, subir versión, commit, **push**, `plugin update`, reiniciar — y el cuarto es publicar en GitHub.
- **El fallo ya ocurrió, en silencio.** El plugin `amp` estaba en **0.6.2** mientras el repo tenía **0.6.3** en disco, clavado en el commit `56607d6`, seis commits atrás. La 0.6.3 traía la preferencia Base nueva (una decisión por vez): esa regla estaba escrita en el repo y **ausente de la skill que corría**. Si alguien hubiera corrido `amp:inicializar` desde esta máquina en ese lapso, habría instalado las preferencias Base viejas en un repo nuevo. Nada avisó.
- **`/reload-plugins` no arregla esto:** recarga los plugins ya instalados en la versión que ya tenían. Releer el clon no es actualizarlo.
- **`claude plugin update` exige las dos cosas a la vez:** identificador completo **y** alcance (`claude plugin update amp@xelnagah-harness --scope project`). Con el nombre pelado falla, y con el alcance por omisión (usuario) también — con el **mismo** mensaje, *Plugin "amp" not found*, que no distingue cuál de las dos falta. Ya documentado en `docs/INSTALAR.md` §A1.

## Una alternativa que no estaba sobre la mesa: `skills-dir`

El CLI tiene una **tercera fuente de plugins** además del marketplace y las skills sueltas: `claude plugin init` crea un plugin en `~/.claude/skills/<nombre>/` y su ayuda declara que se auto-carga la sesión siguiente como `<nombre>@skills-dir`; `claude plugin eval` dice resolver *"installed and skills-dir plugins both"*. Si un enlace `~/.claude/skills/amp` → `funcionalidades/amp` funciona igual, sería edición en vivo **sin** perder la forma real de distribución (prefijo incluido) — que es exactamente lo que falta.

**No verificado.** Riesgo previsible: `amp@skills-dir` y `amp@xelnagah-harness` son el mismo nombre de plugin por dos fuentes; probablemente haya que desinstalar el del marketplace. Es una prueba corta y decide buena parte del plan.

## Un control que avise, sea cual sea el modo

Ortogonal a elegir modo: hoy `lint-harness` compara disco ↔ marketplace ↔ `REGISTRO.md`, pero **no** contra lo que está realmente cargado. La versión que corre es legible sin adivinar — es el nombre de la carpeta en `~/.claude/plugins/cache/<marketplace>/<plugin>/<version>/`. Compararla contra la `version` del `plugin.json` habría gritado *"amp: disco 0.6.3, activo 0.6.2"* el mismo día. No reemplaza decidir el modo, pero convierte un fallo silencioso en un hallazgo. Abierto: en una máquina que consume por enlace ese chequeo no aplica, así que el control tiene que saber en qué modo está — el mismo dato que hoy le falta al hallazgo de los 22 enlaces.

## A resolver

- **Qué corre la máquina autora:** ¿enlace para todo (y se acepta perder la prueba de la vía de distribución real), plugin para todo (y se acepta el ciclo de cinco pasos), o mixto? Si es mixto, cuál es el criterio de corte: ¿lo que se está tocando en la sesión?
- **Si es mixto, cómo se cambia de una a otra sin romper nada.** Hoy `instalar-junctions` crea enlaces pero no desinstala plugins, y habilitar un plugin no borra enlaces — nada impide el estado colisionado que `AGENTS.md` prohíbe.
- **Qué hace `lint-harness` con esto.** Hoy marca los 22 enlaces faltantes como hallazgo aunque la máquina esté deliberadamente del lado plugin: el lint no sabe en qué modo está la máquina, así que reporta un falso positivo permanente. Un hallazgo que siempre está y siempre se ignora entrena a ignorar el lint.
- **Cross-agente:** Codex, Cursor y Gemini **no** tienen plugins — para ellos la única vía es el enlace en `~/.agents/skills`. Así que el modo mixto ya existe de hecho, partido por agente, no por decisión.

## Se cruza con

- [Nombres y distribución de las skills del harness](Nombres%20y%20distribucion%20de%20las%20skills%20del%20harness.md) — ahí vive la parte "pasar la máquina de autoría de enlace a instalación por plugin", declarada *"falta definir flujo de refresco"*. Es el mismo hueco visto desde el otro plan: resolver una vez, en uno de los dos.
- [Publicar el harness en inglés](Publicar%20el%20harness%20en%20ingles.md) — si el monorepo de autoría publica dos marketplaces, la máquina autora tiene que poder probar los dos.
