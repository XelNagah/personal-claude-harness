**Estado: Ejecutado · Creado 26-08-07 · Cerrado 26-08-07.**

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

## Notas de implementación

- **Se PARSEA el id, no se tabula** (decisión al ejecutar, distinta de la «tabla de mapeo» que preveía el plan): `modeloLegible()` toma `claude-<familia>-<versión>` y arma `Opus 4.8`, `Haiku 4.5`, `Sonnet 5`. Así un modelo nuevo de la familia sale solo y **desaparece el riesgo de mantenimiento** que el plan señalaba. Los segmentos largos (fecha `20251001`) se descartan; la versión son los grupos de 1-2 dígitos.
- **Degradado seguro:** solo ids `claude-*` con familia en letras. Sin `model`, id de otro agente (`gpt-5-codex`) o desconocido → queda el rótulo fijo `Agente Multipropósito`. Cubre Codex/Gemini sin romper.
- **Lectura de stdin:** `leerStdin()` lee `fd 0` solo en `--hook` y solo si no es TTY (en una terminal, leer bloquearía). El repartidor `establecer-conducta` ya le pasa el JSON del hook —con `model`— por stdin, verificado end-to-end: `says: Opus 4.8`.
- **`/model` a mitad de sesión (decisión al ejecutar):** se acepta la foto del arranque. `SessionStart` dispara solo al arrancar; el canal confiable para el modelo vigente sería `statusLine`, no un hook. Documentado como límite conocido.
- **La marca del harness** sigue como renglón 1 dentro de la caja; solo cambia el rótulo del renglón 1 del `systemMessage` (el que absorbe la etiqueta `says:`).
- **Base + pruebas + versión:** `sincronizar-base --aplicar` copió los 2 archivos; `pruebas.js` 26 → 31 casos (rótulo Opus 4.8, fecha que no ensucia, degradado sin model, degradado no-claude, marca en la caja); `amp` a `0.42.3`.
- **Control de cierre:** verde salvo el desfase de instalación previo (`disco 0.42.3 vs instalado 0.40.0`), que se resuelve con `amp:actualizar` + reinicio de sesión, acción del usuario.
