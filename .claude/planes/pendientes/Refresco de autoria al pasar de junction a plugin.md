# Refresco de autoría al pasar de enlace a plugin

**Estado: Nuevo · Creado 26-07-25.** Origen: [Modelo de distribución y empaquetado del harness](../ejecutados/Modelo%20de%20distribucion%20y%20empaquetado%20del%20harness.md), sección "Abierto" — hueco heredado de la decisión **0013**, que eligió la instalación por plugin sin definir cómo sigue trabajando la máquina que **autora** el harness.

## El problema

Este repo tiene dos formas de consumir sus propias skills, y no pueden convivir para el mismo skill (colisionan por nombre; lo dice `AGENTS.md`):

- **Enlace (junction NTFS):** `~/.claude/skills/<skill>` y `~/.agents/skills/<skill>` apuntan a `funcionalidades/<n>/skills/<skill>`. Editás el `SKILL.md` y el cambio está vivo en la sesión siguiente, sin pasos intermedios. Es la forma de **autoría**.
- **Plugin instalado:** el skill vive en el cache de plugins, que se llena clonando el repo. Editás el `SKILL.md` del repo y **no pasa nada** hasta que subís la versión, commiteás, pusheás y actualizás el plugin. Es la forma de **consumo**.

Hoy esta máquina está del lado plugin: los 7 plugins están habilitados en `.claude/settings.json` y `lint-harness` reporta 22 enlaces faltantes como hallazgo conocido. O sea que **el repo que autora el harness lo consume como si fuera un repo ajeno**: un cambio en un `SKILL.md` no se prueba hasta publicarlo.

Ejemplo concreto de lo que cuesta: corregir una línea de `amp:planificar` y probarla hoy son cinco pasos (editar, subir versión, commit, push, actualizar plugin) y deja versión publicada por cada intento; con enlace es uno (editar) y no ensucia el historial de versiones. Si el ciclo de prueba cuesta cinco pasos ⇒ se prueba menos ⇒ se publica sin probar.

## A resolver

- **Qué corre la máquina autora:** ¿enlace para todo (y se acepta perder la prueba de la vía de distribución real), plugin para todo (y se acepta el ciclo de cinco pasos), o mixto? Si es mixto, cuál es el criterio de corte: ¿lo que se está tocando en la sesión?
- **Si es mixto, cómo se cambia de una a otra sin romper nada.** Hoy `instalar-junctions` crea enlaces pero no desinstala plugins, y habilitar un plugin no borra enlaces — nada impide el estado colisionado que `AGENTS.md` prohíbe.
- **Qué hace `lint-harness` con esto.** Hoy marca los 22 enlaces faltantes como hallazgo aunque la máquina esté deliberadamente del lado plugin: el lint no sabe en qué modo está la máquina, así que reporta un falso positivo permanente. Un hallazgo que siempre está y siempre se ignora entrena a ignorar el lint.
- **Cross-agente:** Codex, Cursor y Gemini **no** tienen plugins — para ellos la única vía es el enlace en `~/.agents/skills`. Así que el modo mixto ya existe de hecho, partido por agente, no por decisión.

## Se cruza con

- [Nombres y distribución de las skills del harness](Nombres%20y%20distribucion%20de%20las%20skills%20del%20harness.md) — ahí vive la parte "pasar la máquina de autoría de enlace a instalación por plugin", declarada *"falta definir flujo de refresco"*. Es el mismo hueco visto desde el otro plan: resolver una vez, en uno de los dos.
- [Publicar el harness en inglés](Publicar%20el%20harness%20en%20ingles.md) — si el monorepo de autoría publica dos marketplaces, la máquina autora tiene que poder probar los dos.
