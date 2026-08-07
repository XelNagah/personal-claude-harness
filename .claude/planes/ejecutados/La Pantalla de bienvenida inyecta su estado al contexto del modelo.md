**Estado: Ejecutado · Creado 26-08-07 · Cerrado 26-08-07.**

# La Pantalla de bienvenida inyecta su estado al contexto del modelo, no solo a la terminal del usuario

## Problema (verificado contra el código)

`mostrar-pantalla-bienvenida.js --hook` emite la caja de estado por `systemMessage` (línea 365), campo que va **solo a la terminal del usuario** — el modelo no lo ve. El script corre los lints en el arranque, cuenta hallazgos con `contarHallazgos` y **descarta el texto del lint**.

Resultado observado en otra sesión: la Pantalla mostró `⚠ 3 hallazgos` en conocimiento, el usuario preguntó «¿qué son esos hallazgos?» y el agente **negó tenerlos** («no me llegó esa Pantalla al contexto, solo entró el hook»), y terminó corriendo el lint de nuevo a mano. La Pantalla le promete al usuario un estado que el agente desconoce: confuso para el usuario.

## Solución acordada

En modo `--hook`, además del `systemMessage` (que se queda igual, con su cartel amarillo para el usuario), emitir un `additionalContext` orientado al modelo.

El script **ya tiene el precedente del doble canal**: `pedidoDeIdentidad()` ya emite `additionalContext` cuando falta la Identidad (líneas 366-367), y la **Decisión Local-0051** (El Buzón de Avisos Generales entrega en el turno lo que se averiguó en segundo plano) ya usa los dos canales a la vez «para que el modelo pueda responder». Es **extensión del patrón, no re-decisión**: no re-abre la **Decisión Local-0012** (La Pantalla de bienvenida se emite por systemMessage), que prohibía `additionalContext` por ser invisible al usuario, no por prohibir usar ambos canales; acá se suma el canal al modelo en paralelo y el del usuario se queda intacto.

### Contenido del `additionalContext`

- **Siempre:** Título y Propósito (anclaje — el modelo no tiene `identidad.md` cargado; ~3 líneas).
- **Estado de lint:** en verde, solo `Lint ✔ 0 hallazgos` (peso ~0). Cuando hay hallazgos, **sumar las líneas reales del lint** que ya se generaron en el arranque (hoy se descartan): subsistema + detalle, para que el agente responda sin re-correr el lint.
- **Combinar con el `pedidoDeIdentidad` existente** cuando la Identidad falte (no pisarlo).

**Decisión del usuario (07/08/2026):** detalle **solo cuando hay hallazgos**. En verde el peso extra es cero; muchos hallazgos = repo en mal estado, que es cuando conviene que el agente lo sepa entero; el costo es una vez por sesión, no por turno. Toca el presupuesto de contexto de arranque que el repo vigila (Decisión Local-0017, `medir-contexto`), y por eso el matiz «solo cuando hay hallazgos» lo mantiene en ~0 en el caso normal.

## Pistas para ejecutar

- Hoy `correrLint()` ya captura `stdout+stderr` del lint pero solo devuelve el conteo; **conservar el texto** para armar el detalle.
- El `additionalContext` debe ser **texto plano orientado al modelo**, NO la caja ASCII (bordes y padding son ruido para el modelo).
- Esto **viaja en la Base** (la Pantalla de bienvenida es Regla Base clase `correr`, Decisión Local-0030), así que hay que **sincronizar `base/`** con `sincronizar-base.js` y **actualizar la prueba** `pruebas.js` co-ubicada.

## Alcance / decisiones a resolver al ejecutar

- Valorar si amerita **registrar una decisión propia** o si queda como derivado del patrón de la Decisión Local-0051.
- Ajustar/duplicar la prueba del script para el nuevo `additionalContext` (verde vs. con hallazgos vs. con Identidad faltante).
- Al cerrar: `lint-conducta`, `lint-harness` y `ejecutar-pruebas`.

## Notas de implementación

Implementado tal como se acordó, sin desvíos.

- **`correrLint()`** ahora conserva el texto del lint (`salida`) además del conteo; antes solo devolvía `{estado, hallazgos}`.
- **`estadoParaModelo()`** (función nueva): arma el texto plano orientado al modelo — Título + Propósito siempre, `Lint: <estado>` siempre, y el **detalle por subsistema solo cuando hay hallazgos** (o `error` de lint), tomado del texto real que ya se corrió en el arranque. Sin la caja ASCII.
- **Rama `--hook`:** el `additionalContext` pasó de emitirse solo cuando faltaba la Identidad a emitirse **siempre**, con el estado; si además falta la Identidad, el `pedidoDeIdentidad()` existente se **suma** (no lo pisa) en un único campo.
- **Decisión sobre registrar decisión propia:** no amerita. Es aplicación derivada del doble canal ya asentado en la Decisión Local-0051 (Buzón de Avisos Generales usa systemMessage + additionalContext) y no re-abre la Decisión Local-0012 (la caja va por systemMessage), que prohibía `additionalContext` por ser invisible al usuario, no por vetar usar ambos canales. El `systemMessage` con la caja queda intacto.
- **Base + pruebas:** `sincronizar-base.js --aplicar` copió los 2 archivos a `funcionalidades/amp/skills/inicializar/base/`. `pruebas.js` pasó de 19 a 26 casos (additionalContext presente, texto plano sin caja, verde sin detalle, con hallazgos con detalle y texto real del lint, Identidad faltante que suma estado + pedido). Banco en verde.
- **Versión:** `amp` subida a `0.42.2` (los 2 archivos cambiaron después de fijar 0.42.1).
- **Control de cierre:** verde salvo el desfase de instalación previo (`disco 0.42.2 vs instalado 0.40.0`), que se resuelve con `amp:actualizar` + reinicio de sesión, acción del usuario.
- **Commit:** pendiente (el usuario no lo pidió).
