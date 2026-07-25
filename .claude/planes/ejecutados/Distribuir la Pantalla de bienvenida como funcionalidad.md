# Distribuir la Pantalla de bienvenida como funcionalidad

**Estado: Ejecutado · Creado 26-07-23 · Cerrado 26-07-25.** Origen: [Pantalla de bienvenida del Agente Multipropósito](Pantalla%20de%20bienvenida%20del%20Agente%20Multiproposito.md), cerrado por path (a). Ese plan ejecutó la **pasada A** (la Pantalla funciona in-repo: script + hook + `/amp-info`, emisión por `systemMessage`, decisión 0012). Acá queda la **pasada B**: hacerla viajar.

## Qué falta (pasada B)

El núcleo ya se diseñó portable, así que esto es **traslado, no rediseño**:

1. **Empaquetar como funcionalidad/plugin distribuible** para que llegue a todo repo consumidor: carpeta bajo `funcionalidades/` (plugin.json + README + lo que corresponda) + alta en `.claude-plugin/marketplace.json` + fila en `REGISTRO.md` + sumarla al orquestador `setup-completo` + junctions dobles si se edita en vivo. Patrón `agregar-funcionalidad`.
2. **Hook doble** Claude/Codex(/Gemini) con degradación documentada: Claude Code (CLI), Codex y Gemini soportan `systemMessage` al arrancar; **Cursor no** tiene banner nativo → degrada sin caja (solo `additional_context`, va al modelo). Ya está registrado en la decisión 0012.
3. **`sessionTitle` al header:** poner el Título del repo en el encabezado de la sesión.
4. **Decidir en qué `source` dispara:** ¿solo `startup`/`clear`, o también `resume`/`compact`? `compact` es mitad de sesión → quizás ruidoso. Resolver al ejecutar.

## Candidato a decisión (al ejecutar)

Formalizar que el Agente Multipropósito **emite Pantalla de bienvenida** como comportamiento estándar del harness (hoy es Herramienta local; al distribuirse pasa a ser parte del setup base).

## Depende de / se cruza con

- **Depende de** [Identidad del Agente — Título y Propósito persistidos](../pendientes/Identidad%20del%20Agente%20-%20Titulo%20y%20Proposito%20persistidos.md) para el Título; arranca tolerante a indefinido (`<sin definir>`).
- **Se cruza con** [Nombres y distribución de las skills del harness](../pendientes/Nombres%20y%20distribucion%20de%20las%20skills%20del%20harness.md): la máquina de autoría pasa de junction a instalación por plugin (decisión 0013) — coordinar el mecanismo de distribución con ese plan para no elegir dos caminos distintos.

## Notas de implementación

**Cerrado 26-07-25.** El núcleo —que la Pantalla llegue a todo AMP consumidor— se cumplió, pero **por otro camino que el planificado**: no como funcionalidad/plugin propia, sino como **Regla Base del subsistema `conducta`** (decisión **0030**, 24/07/2026). El punto 1 del plan queda así **superado, no ejecutado**: no hay carpeta bajo `funcionalidades/`, ni entrada de marketplace, ni fila en `REGISTRO.md` para la Pantalla.

- **Punto 1 (empaquetar como funcionalidad) → superado por 0030.** La Pantalla es una regla Base clase `correr` en el momento `al arrancar la sesión`; el script se co-ubica con conducta (`.claude/conducta/mostrar-pantalla-bienvenida/`) y **sale** del registro de Herramientas. Viaja dentro de `amp:inicializar`, que instala `conducta` completo. Motivo del cambio de camino: distribuirla por el mecanismo que **ya viaja** en vez de sumar un plugin y un hook suelto que el instalador no cableaba (ese hueco —un consumidor que no la recibía— era justamente el problema).
- **Punto 2 (hook doble Claude/Codex) → hecho.** El repartidor `establecer-conducta` implementa la clase `correr` (corre el script y reenvía su stdout verbatim como `systemMessage`, decisión 0012) y está cableado en `SessionStart` de `.claude/settings.json` y de `.codex/hooks.json`. Degradación de Cursor (sin banner nativo) ya registrada en 0012. **Nivelado al cerrar:** este repo tenía el `SessionStart` de Codex con `lint-planes` solo — el repartidor faltaba, aunque `amp:inicializar` lo manda desde la sesión de `conducta`; se agregó por merge, sin pisar el lint.
- **Puntos 3 y 4 (`sessionTitle` en el encabezado + en qué `source` dispara) → desprendidos** al plan [Titulo de sesion y momentos de disparo de la Pantalla de bienvenida](../pendientes/Titulo%20de%20sesion%20y%20momentos%20de%20disparo%20de%20la%20Pantalla%20de%20bienvenida.md). Son dos ajustes de presentación y de alcance del disparo, independientes de la distribución, que ya está resuelta.
- **Candidato a decisión → cubierto.** «Formalizar que el AMP emite Pantalla de bienvenida» quedó asentado en 0030, que la fija como comportamiento Base del harness.
- **Dependencia de `Identidad del Agente`:** sigue viva pero no bloqueó — la Pantalla arranca tolerante a indefinido y este repo usa un `identidad.md` provisional.
