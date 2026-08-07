**Estado: Nuevo · Creado 26-08-07.**

# Mostrar el modelo activo en la Pantalla de bienvenida

Aprovechar el rótulo del renglón 1 de la Pantalla de bienvenida —el que absorbe la etiqueta `SessionStart:startup says: `— para mostrar el **modelo activo** de la sesión (ej. `says: Opus 4.8`) en vez del rótulo fijo `Agente Multipropósito`.

## De dónde sale

En esta sesión (07/08/2026) se arregló que el borde superior de la caja salía corrido a la derecha: el CLI pega la etiqueta `SessionStart:startup says:` al primer renglón del `systemMessage`, así que ese renglón pasó a ser un rótulo de texto plano (la constante `MARCA = 'Agente Multipropósito'`) y la caja arranca en el renglón 2. El usuario propuso que ese rótulo, hoy fijo, muestre el modelo; se dejó para más adelante porque **el dato no está a mano**.

## Por qué no se hizo ya

Verificado hoy (conocimiento `hooks-claude-code` §4.4):

- El stdin de `SessionStart` **puede** traer el modelo, pero como **id string** (`"claude-opus-4-8"`), **opcional / no garantizado**, y **sin** `display_name` legible → hay que mapear el id a `"Opus 4.8"` / `"Fable 5"` a mano.
- El script `mostrar-pantalla-bienvenida.js` hoy **no lee stdin**. El JSON del hook lo consume el repartidor `establecer-conducta`, que invoca la Pantalla con `spawnSync` pasándole ese JSON por `input` (stdin del hijo). O sea el dato **llega** a la Pantalla, pero hay que parsearlo.

## Trabajo previsible si se retoma

- En `mostrar-pantalla-bienvenida.js` modo `--hook`: leer stdin, extraer `model` si viene.
- Tabla de mapeo id → nombre legible, con **degradado** al rótulo fijo `Agente Multipropósito` si el id es desconocido o el campo falta.
- **Modelo cambiado a mitad de sesión** (`/model`): `SessionStart` solo dispara al arrancar, así que el rótulo reflejaría el modelo del arranque, no el vigente. Decidir si es aceptable o si conviene otra vía (el objeto `model` completo solo lo da `statusLine`, no un hook).
- **Cross-agente:** dato de Claude Code / Codex (string); Gemini sin documentar. Degradar sin romper.
- Es Componente de Subsistema que **viaja**: al tocarlo, sincronizar `base/`, subir la versión de `amp` y correr `lint-harness` + las pruebas del script.

## Riesgo de mantenimiento

La tabla id → nombre hay que mantenerla al día cuando salen modelos nuevos: un id sin mapear cae al rótulo fijo (degradado seguro, pero deja de mostrar el modelo).
