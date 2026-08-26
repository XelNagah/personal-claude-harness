# El control de filas pegadas cuenta códigos en cualquier columna

**Estado: Nuevo · Creado 26-08-25.**

## Qué pasó

Un Agente Desplegado reportó el 25/08/2026 que `lint-planes` le marcaba dos filas pegadas en su `PLANES.md` sobre una fila sana. Lo que el control encontró fue la columna **Origen** —que el README del subsistema define como "Origen si se desprende de otro plan"— con un código `Local-NNNN` legítimamente adentro.

El control es `filasPegadas()` en `.claude/common/indices.js:110`. Cuenta con `/\|\s*(?:Base|Local)-\d{4}\s*\|/g` sobre la línea entera, así que suma cualquier código encerrado entre barras, esté en la columna que esté. Su propio comentario ya dice cuál era la intención: *"Se cuenta el Codigo, que es la primera celda de toda fila de entrada por convencion del Patron"*.

Como `indices.js` es la única copia del repo y la corren **los ocho lints de subsistema**, el defecto alcanza a cualquier Índice de Subsistema con una columna que referencie otra entrada.

## Por qué no se ve en este repo

Medido el 25/08/2026: `lint-planes` acá da **0 hallazgos** y el patrón no matchea en ningún Índice del repo. No porque el control esté bien, sino porque este repo escribe la columna Origen como `Decisión Local-0067`, con el tipo delante por la Preferencia Base-0016 (citar los códigos con su tipo y contexto). Ese prefijo rompe el patrón `| Local-NNNN |`, que exige la barra pegada al código.

O sea: **el defecto está latente en el repo autor y solo se manifiesta afuera**, en el repo que escribe el código pelado. Es la forma de falla que ya tiene asentado el conocimiento `controles-que-no-avisan`.

Barrido de los Índices de este repo, celdas que contienen un código fuera de la primera columna:

| Índice | Columna | Forma | ¿Matchea? |
|---|---|---|---|
| `planes/PLANES.md` | Origen | `Decisión Local-0067` | no (prefijo) |
| `conducta/INDICE.md` | Contenido | `…(Preferencia Base-0014)…` | no (texto alrededor) |
| `decisiones/INDICE.md` | Descripción | 29 casos, código dentro del texto | no |
| `semantica/GLOSARIO.md` | Descripción | código dentro del texto | no |

## El arreglo obvio apaga el control

Tomar el comentario al pie de la letra —*contar solo la primera celda*— deja el control **muerto en silencio**: en la primera celda nunca puede haber dos códigos, así que el conteo daría siempre 1 y nunca marcaría nada. El control quedaría verde para siempre, que es peor que el falso positivo de hoy.

Lo que distingue una fila fusionada no es dónde están los códigos: es que la fila **tiene más celdas de las que la tabla declara**. Una fila legítima trae exactamente las columnas de la cabecera; dos filas pegadas traen el doble.

## Propuesta

Contar celdas contra la cabecera en vez de contar códigos sobre la línea cruda. `descripcionesLargas()`, dos funciones más abajo en el mismo archivo, ya usa exactamente ese camino: `celdasDe(linea)`, saltear la separadora, exigir que `celdas[0]` sea un código. El mecanismo correcto ya existe adentro del archivo — falta que `filasPegadas()` lo use.

Criterio propuesto: es fila fusionada la que empieza con un código en `celdas[0]` y trae **más celdas que la cabecera**. Los códigos siguen sirviendo, pero solo para nombrar en el mensaje qué entradas quedaron adentro, no para decidir.

Medido el 25/08/2026 contra cinco casos sintéticos de ocho columnas:

| Caso | Criterio de hoy | Criterio propuesto |
|---|---|---|
| Fila sana, Origen con código pelado | **marca** (falso positivo) | ok |
| Fila sana, Origen con el tipo delante | ok | ok |
| Dos filas pegadas | marca | marca |
| Dos filas pegadas, con Origen | marca | marca |
| Dos filas pegadas, segundo código ilegible | **no marca** (falso negativo) | marca |

Además del falso positivo reportado, el cambio destapa un **falso negativo**: hoy la fusión pasa desapercibida si la segunda fila no arranca con un código que matchee el patrón.

## Puntos a decidir

1. **Qué hacer cuando la tabla no declara cabecera.** Sin cabecera no hay contra qué contar. Saltear el chequeo lo apaga en silencio; emitir un hallazgo propio ("no se pudo controlar") duplica lo que ya marca el chequeo `[a]` de columnas. Propuesto: emitir el aviso igual, porque un control que no corrió tiene que decirlo.
2. **Qué hacer con la fila que trae celdas de más sin ningún código adentro.** Es casi siempre una barra sin escapar en la Descripción. Propuesto: marcarla con un mensaje distinto, no como fila pegada.
3. **Si conviene documentar la columna de referencia en el Patrón.** Hoy `PLANES.md` es el único Índice con una columna que apunta a otra entrada, y su formato depende de una preferencia de este repo, no de una regla del Patrón.

## Alcance del trabajo

- `.claude/common/indices.js` — la función y su comentario, que hoy describe una intención que el código no cumple.
- `.claude/common/pruebas.js` — casos nuevos: fila sana con código pelado en una columna de referencia, y fusión con segundo código ilegible. Por la Decisión Local-0075, escenario sintético: no medir el `PLANES.md` del repo que corra el banco.
- `indices.js` viaja (Herramienta Base-0004) ⇒ `sincronizar-base` y subir la versión del plugin.
- Verificar con `ejecutar-control-cierre` que los ocho lints sigan en verde.

## Origen

Reporte de un Agente Desplegado, 25/08/2026.
