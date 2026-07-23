# Distribuir la Pantalla de bienvenida como funcionalidad

**Estado: Nuevo · Creado 26-07-23.** Origen: [Pantalla de bienvenida del Agente Multipropósito](../ejecutados/Pantalla%20de%20bienvenida%20del%20Agente%20Multiproposito.md), cerrado por path (a). Ese plan ejecutó la **pasada A** (la Pantalla funciona in-repo: script + hook + `/amp-info`, emisión por `systemMessage`, decisión 0012). Acá queda la **pasada B**: hacerla viajar.

## Qué falta (pasada B)

El núcleo ya se diseñó portable, así que esto es **traslado, no rediseño**:

1. **Empaquetar como funcionalidad/plugin distribuible** para que llegue a todo repo consumidor: carpeta bajo `funcionalidades/` (plugin.json + README + lo que corresponda) + alta en `.claude-plugin/marketplace.json` + fila en `REGISTRO.md` + sumarla al orquestador `setup-completo` + junctions dobles si se edita en vivo. Patrón `agregar-funcionalidad`.
2. **Hook doble** Claude/Codex(/Gemini) con degradación documentada: Claude Code (CLI), Codex y Gemini soportan `systemMessage` al arrancar; **Cursor no** tiene banner nativo → degrada sin caja (solo `additional_context`, va al modelo). Ya está registrado en la decisión 0012.
3. **`sessionTitle` al header:** poner el Título del repo en el encabezado de la sesión.
4. **Decidir en qué `source` dispara:** ¿solo `startup`/`clear`, o también `resume`/`compact`? `compact` es mitad de sesión → quizás ruidoso. Resolver al ejecutar.

## Candidato a decisión (al ejecutar)

Formalizar que el Agente Multipropósito **emite Pantalla de bienvenida** como comportamiento estándar del harness (hoy es Herramienta local; al distribuirse pasa a ser parte del setup base).

## Depende de / se cruza con

- **Depende de** [Identidad del Agente — Título y Propósito persistidos](Identidad%20del%20Agente%20-%20Titulo%20y%20Proposito%20persistidos.md) para el Título; arranca tolerante a indefinido (`<sin definir>`).
- **Se cruza con** [Nombres y distribución de las skills del harness](Nombres%20y%20distribucion%20de%20las%20skills%20del%20harness.md): la máquina de autoría pasa de junction a instalación por plugin (decisión 0013) — coordinar el mecanismo de distribución con ese plan para no elegir dos caminos distintos.
