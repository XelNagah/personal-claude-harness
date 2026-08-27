# El control de filas pegadas cuenta códigos en cualquier columna

**Estado: Ejecutado · Creado 26-08-25 · Cerrado 26-08-27.**

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

## Estado

**27/08/2026 — pasa a `Análisis`.** Sondeo sobre los 15 Índices declarados de este repo
(`.claude/tmp/sondeo-0113.js`, temporal):

| Qué se midió | Resultado |
|---|---|
| Índices sin cabecera de tabla | **0** |
| Índices declarados que no declaran `columnas` | **0** |
| Índices donde la cabecera y las `columnas` del frontmatter difieren en cantidad | **0** |
| Filas de tabla que no arrancan con un código (tablas auxiliares dentro de un Índice) | **0** |
| Filas de entrada con ancho distinto al de la cabecera | **0** |

Consecuencias para los puntos a decidir:

- **El punto 1 se cae solo.** `cabeceraTabla()` devuelve la primera línea de tabla que no es
  separadora, así que `cabecera === null` implica que el archivo **no tiene ninguna línea de tabla**
  y por lo tanto tampoco filas que controlar: el control no queda apagado, queda sin material. Y el
  caso «declara columnas y no aparece la tabla» ya lo emite el chequeo `[a]`
  (`indices.js:170`). No hace falta hallazgo nuevo.
- **Aparece un modo de falla que el plan no vio: la cabecera fusionada.** Si la línea de cabecera es
  la que perdió el salto, `cabeceraTabla()` devuelve el doble de columnas, todas las filas sanas
  quedan **por debajo** de ese ancho y el control no marca nada — la misma forma del conocimiento
  Local-0013 (controles que dejan de controlar sin avisar), reintroducida por el arreglo. De ahí la
  cuestión nueva: contra qué se cuenta.
- **El punto 2 no tiene ningún caso vivo acá**, pero el sondeo mide un solo repo.

## Puntos a decidir — los tres, resueltos con evidencia

Ninguno llegó al usuario: los tres se resolvieron mirando el repo, como pide la Preferencia
Local-0008.

1. ~~**Qué hacer cuando la tabla no declara cabecera.**~~ **No hace falta hallazgo nuevo.**
   `cabecera === null` implica que el archivo no tiene ninguna línea de tabla, o sea tampoco filas
   que controlar; y el caso «declara columnas y no aparece la tabla» ya lo emite el chequeo `[a]`.
2. ~~**Qué hacer con la fila que trae celdas de más sin ningún código adentro.**~~ **No se marca.**
   Cero casos vivos en los 15 Índices, y marcarla convertiría en hallazgo cualquier tabla
   explicativa dentro de un Índice. Queda un caso de prueba que fija que no se controla.
3. ~~**Si conviene documentar la columna de referencia en el Patrón.**~~ **Se cae.** Con el ancho
   como criterio, al control le da igual cómo se escriba esa celda: `Local-0067` y
   `Decisión Local-0067` pasan las dos. El Patrón no tiene nada que fijar acá.

**Y una cuestión que el plan no había planteado, que sí cambiaba el resultado:** contra qué se mide
el ancho. Resuelto: **las `columnas` del frontmatter, con la cabecera de respaldo** si el Índice
todavía no las declara. El frontmatter se escribe a mano y la edición que fusiona líneas no lo toca;
la cabecera es texto de la misma tabla que se rompió. Con la cabecera fusionada, medir contra ella
deja el control muerto en verde.

## Notas de implementación

El defecto de fondo no era contra qué contar: era que **en el mismo archivo había dos formas de leer
una fila**. `filasPegadas()` adivinaba con una expresión regular sobre la línea cruda y
`descripcionesLargas()` parseaba celdas. Por eso una fallaba y la otra no.

- **`filasDe(idx)`, una sola lectura** para todos los controles de la capa. Fila de entrada = la que
  trae un Código en su primera celda. Los dos controles la usan.
- **`anchoEsperado(idx)`** — `columnas` del frontmatter, cabecera de respaldo.
- **`filasPegadas()`** marca por ancho de más. Los códigos siguen apareciendo en el mensaje para
  nombrar qué entradas quedaron adentro, nunca para decidir.
- **8 casos nuevos** en `common/pruebas.js`, todos sintéticos (Decisión Local-0075): el falso
  positivo reportado, la misma celda con el tipo delante, el falso negativo del código ilegible, la
  cabecera fusionada, el Índice sin `columnas` en sus dos lados y la tabla explicativa. Banco en
  **88 casos, todo verde**.
- **Se corrigieron tres casos viejos** que declaraban 1 columna sobre una tabla de 2: con el criterio
  nuevo marcaban toda fila sana. No probaban este control, probaban el de columnas.
- `sincronizar-base --aplicar` (viajan `common/indices.js` y `common/pruebas.js`) y `amp` a
  **0.58.0**.

**El control de cierre marcó dos cosas y sirvieron.** Un comentario del banco usaba
`Decisión Local-0067` como ejemplo, y ese archivo viaja: allá el registro de decisiones de este repo
no existe, así que la cita llega rota. El chequeo de citas en distribuibles lo agarró — reescrito
para enunciar la razón sin el número, con `Plan Local-0067`, que además es más fiel a la columna
Origen de `PLANES.md`. El segundo hallazgo, `amp: disco 0.58.0, instalado 0.57.0`, es el esperado
mientras la versión no esté publicada.

**Se volvió a pagar el conocimiento Base-0002.** Al verificar que no quedaran citas,
`grep -nEi "decisi[óo]n…"` contestó **cero teniendo una**: el acento en el patrón, sobre Git Bash en
Windows. Casi da por limpio un archivo sucio, que es el daño que esa página describe — la conclusión
falsa, no la búsqueda perdida. La verificación buena se hizo desde Node con el mismo patrón que usa
el lint. No hace falta página nueva: el caso ya está cubierto.

**Cierre verificado:** los 13 chequeos del control de cierre, con `pruebas de los controles` en OK
(24 bancos) y `lint-harness` sin más hallazgo que la versión sin publicar.

## Alcance del trabajo

- `.claude/common/indices.js` — la función y su comentario, que hoy describe una intención que el código no cumple.
- `.claude/common/pruebas.js` — casos nuevos: fila sana con código pelado en una columna de referencia, y fusión con segundo código ilegible. Por la Decisión Local-0075, escenario sintético: no medir el `PLANES.md` del repo que corra el banco.
- `indices.js` viaja (Herramienta Base-0004) ⇒ `sincronizar-base` y subir la versión del plugin.
- Verificar con `ejecutar-control-cierre` que los ocho lints sigan en verde.

## Origen

Reporte de un Agente Desplegado, 25/08/2026.
