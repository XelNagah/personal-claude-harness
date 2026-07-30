# Resolver los once hallazgos del análisis crítico del repo

**Estado: Ejecutado · Creado 30/07/2026 · Cerrado 30/07/2026.**

> El título dice «los once hallazgos» porque el nombre de un plan es su identidad y no cambia. Terminaron siendo **dieciocho**: los siete que aparecieron después salieron de resolver los primeros, y están numerados del 12 en adelante.

Análisis crítico del repo completo pedido el 30/07/2026, después de que `amp:actualizar` diera todo al día y el control de cierre diera los diez chequeos en verde. La pregunta era qué problemas, faltantes, oportunidades y sobreingeniería tiene el repo **cuando todos sus controles dicen que está bien**.

Se leyó el glosario (33 conceptos), la Terminología Farlopa (39 filas / 54 términos), las 43 decisiones, los 81 planes y las 12 páginas de conocimiento, y se midió lo medible. Salieron doce hallazgos; dos colapsaron en uno al verificarlos, quedan **once**.

Un hallazgo se descartó en la verificación: se había reportado que `lint-harness` clasificaba mal la terminología del Producto y por eso el control de cierre daba verde. Falso. Se muestrearon las seis líneas que discrepaban con `lint-semantica` y las seis son usos legítimos que `lint-harness` exime bien (términos citados entre backticks dentro de la regla que enseña el test de anglicismos, un dato de prueba en un comentario de código, los dos ejemplos con que el registro explica su columna `Control`, un nombre de habilidad, y dos encabezados viejos aceptados por compatibilidad). El solapamiento real entre los dos lints es de **4 líneas**, no de decenas: de las 91 apariciones de texto plano que reporta `lint-semantica`, 87 están en `.claude/` y 4 en `funcionalidades/`.

## Los once hallazgos

### Defectos

**Hallazgo 1 — la lista de 87 apariciones de `lint-semantica` mezcla tres cosas distintas, y el trabajo real queda enterrado.** El grupo de texto plano a reescribir informa 87 apariciones en `.claude/`. Inspeccionadas, tienen tres causas que piden tres tratamientos opuestos:

- **(a) Citas entre comillas dobles.** `terminologia-canonica.md:5` cita textualmente la regla vieja —el `gate` duro en registros canónicos— para contar el defecto que la motivó; `:7` cuenta cuántos usos de `verbatim`, `slug` y `gate` seguían circulando dos días después de ratificar los reemplazos. Son citas por definición. Los mismos términos, en la misma línea, entre backticks **sí** quedan exentos: la exención existe y funciona, solo no alcanza a las comillas.
- **(b) Usos legítimos por significado.** `hooks-codex-cli.md:9,14,18` usa `capa de configuración`, que el propio registro declara legítimo en la fila que explica la columna `Control` (la relación vetada es `capa`=fase). `lint-harness` tiene para esto una lista `USOS_LEGITIMOS` por fragmento de texto, con `capa mecánica` y `capa semántica`, y le falta este caso; `lint-semantica` no tiene esa lista en absoluto.
- **(c) Usos reales a corregir.** `hooks-claude-code.md:64` dice `Lectura en prosa:`. Ese es el trabajo verdadero, y hoy está sepultado entre (a) y (b).

La exención por backticks no falta —se verificó que empareja bien y no se desalinea—; lo que falta es distinguir cita de uso, y tener la lista de usos legítimos por significado que el lint hermano ya tiene. El efecto es el que el registro quiso evitar al no vetar `Base` (*un registro que marca todo entrena a ignorarlo*), alcanzado por clasificación gruesa en vez de por una fila mal elegida. Absorbe el hallazgo de calibración de la Terminología Farlopa: mismo defecto.

**Evidencia en vivo, medida al escribir este plan:** el primer intento de redactar este párrafo fue **rechazado por el control `detectar-terminologia-vetada`**, que marcó los tres términos citados entre comillas dobles y exigió corregirlos. Citar el término para explicar el veto se frena; el mismo término entre backticks pasa. El control y el lint comparten el criterio, así que la causa (a) no es solo ruido en un informe: **impide escribir sobre la propia terminología** salvo que el autor conozca la exención y la aplique a mano. El registro de Terminología Farlopa ya declara la intención correcta —*el bloqueo mira solo las apariciones fuera de comillas simples invertidas*— pero la comilla doble, que en español es la marca de cita, quedó afuera.

> **Corrección (30/07/2026).** Las causas (a) y (b) de arriba se midieron y quedaron mal ponderadas: la cita por marca tipográfica es **5 de 92** (4 entre comillas rectas, 1 en cursiva), no la causa dominante. La causa real está más abajo, en la medición por término. Se conserva el texto porque los dos rechazos del control que documenta siguen siendo válidos y son un hallazgo por sí mismos.

**Medición por término — la causa dominante.** Las 92 apariciones del grupo de texto plano, por término vetado:

| Término | Apariciones | | Término | Apariciones |
|---|---|---|---|---|
| `capa` | **38** | | `bumpear` | 3 |
| `adaptaciones` | 9 | | `semilla` | 2 |
| `prosa` | 6 | | `workflow` | 1 |
| `slug` | 5 | | `tripa` / `tripas` | 2 |
| `gate` | 5 | | `pieza` | 1 |
| `verbatim` | 3 | | `artefacto` | 1 |
| `stale` | 3 | | etiquetas de origen | 4 |
| `pintar` | 3 | | `ciclo-de-plan` | 3 |

**`capa` es el 41% del total, y ninguna de sus 38 apariciones está en el significado vetado.** Clasificadas una por una por el término que sigue:

- `capa semántica` — 22 (con y sin tilde, con y sin mayúscula)
- `capa mecánica` — 5
- `capa de configuración` — 3 (`hooks-codex-cli`, incluidas las que no llevan el calificador: *si una misma capa tiene `hooks.json` y `[hooks]` a la vez*)
- `capa` = nivel de software o de contenido — 8 (*no una capa sobre Claude Code*, *tres capas: mecánica del harness / criterio del autor*, *es una tercera capa: la decisión 0003 define dos*, *ausencia de capa terminológica*)

Las 38 son el nivel de integridad que fijó la decisión `Local-0003` y los usos que la propia fila del registro declara legítimos. El sentido vetado —`capa` = fase de un proceso— **no aparece ni una vez**.

Esto es el precedente de `Base` decidido al revés. El registro dejó asentado que `Base` **no** se vetó porque marcaba 673 apariciones casi todas válidas y *un registro que marca todo entrena a ignorarlo*. `capa` marca 38, todas válidas, y sí está vetado. Mismo caso, criterio opuesto.

**Reparto anterior por destino**, que sigue valiendo:

| Destino | Apariciones |
|---|---|
| `.claude/planes/` (solo `pendientes/`) | 71 |
| `.claude/conocimiento/` | 10 |
| `README.md` de la raíz | 5 |
| `funcionalidades/` | 4 |
| `.claude/herramientas/` | 3 |
| `.claude/decisiones/` | 2 |
| `.claude/preferencias/` | 1 |

**El 78% está en planes pendientes**, y aparece una cuarta causa que no había visto, la dominante:

- **(d) Planes pendientes que nombran el término porque el término es su tema.** El lint autoexcluye `planes/ejecutados/` y `planes/descartados/` con el motivo *el histórico congelado de planes no se reescribe*, pero **no** excluye `pendientes/`. Y hay planes cuyo asunto **es** la terminología vetada — `Barrer la terminología vetada del Producto`, `Barrer la terminología hallada en preferencias y subsistemas`, `Ordenar la nomenclatura del harness` —: no pueden describir su propio trabajo sin nombrar los términos.

Clasificadas las 20 apariciones que **no** están en planes, una por una:

| Clase | Cuántas | Casos |
|---|---|---|
| Legítimo por significado | 11 | `capa mecánica` ×3, `capa semántica` ×3, `capa de configuración` ×4 (`hooks-codex-cli`), `capa` = nivel de software ×1 (*no una capa sobre Claude Code*) |
| Cita del término para hablar de él | 4 | `terminologia-canonica.md:5,7` — `gate` ×2, `verbatim`, `slug` |
| Identificador | 2 | `ciclo-de-plan` como nombre de habilidad (`PLANTILLA:4150`, y el campo `name:` de su `SKILL.md`) |
| **Uso real a corregir** | **3** | `hooks-claude-code.md:64` (`prosa`) · `decisiones/INDICE.md:49` (`prosa`) · `decisiones/INDICE.md:55` (`verbatim`) |

**De 91 apariciones informadas, 3 son trabajo real: 3,3% de señal.** Dos de esas tres están en el registro de decisiones, que es canónico.

Defecto adicional detectado al medir: la lista `USOS_LEGITIMOS` de `lint-harness` compara por fragmento **con tilde** (`capa semántica`), y `PLANTILLA.md:3824` escribe la variante sin tilde. La exención no matchea. Hoy no se nota porque esa línea cae en un bloque sin lenguaje y va a informativo por otra vía — pero la exención es sensible a la tilde y eso va a morder.

**Segunda evidencia en vivo:** el control volvió a rechazar esta misma actualización, ahora por un término vetado escrito en cursiva dentro de una celda de la tabla de arriba. Dos rechazos en dos intentos, los dos por documentar el hallazgo. La forma que el control acepta es una sola —backticks—, y ni las comillas dobles ni la cursiva, que en español también marcan cita, cuentan.

Decisión pendiente antes de tocar código: qué hace el control con una cita, y si el barrido debe mirar los planes pendientes. Es un lint que viaja a cada Agente Desplegado, así que el criterio se hereda.

**Hallazgo 2 — Cero pruebas en todo el repo.** Sin cobertura: los 9 lints de subsistema, `lint-harness`, `lint-herramientas`, el repartidor `establecer-conducta` y el control `detectar-terminologia-vetada`. Trece controles, ninguna prueba. El conocimiento `cambiar-la-forma-de-un-registro` (asentado el 29/07/2026, un día antes de este análisis) prescribe textualmente *"una prueba por control con caso bueno y malo"* después de medir que **de once roturas, ocho no emitieron ninguna señal**. El remedio está escrito y sin aplicar.

**Hallazgo 3 — Números absolutos dentro de registros canónicos, sin control que los mire.**

- Decisión `Local-0043`: *"los encabezados del núcleo son literales en los **diez** Índices"* → hay **13** (contados por frontmatter `indice:`).
- Decisión `Local-0029`: *"**12 plugins → 7**"* → hoy son **9**.
- `TERMINOLOGIA-FARLOPA.md:80`: *"Las **tres últimas filas** son la excepción: se vetaron el 2026-07-28"*. Al sumarse `pintar` el 29/07 la referencia posicional se corrió y ahora describe un conjunto que incluye una fila del 29 y excluye una del 28.

Es el modo de falla que `cambiar-la-forma-de-un-registro` documenta para el código que lee por posición, acá en texto normativo.

**Hallazgo 4 — Dos conteos de vetados para lo mismo.** La Pantalla de bienvenida informa `39 vetados` (filas); `lint-semantica` informa `vetados: 54` (términos, porque las filas con hermanos como `levelear / leveleo / leveling` valen 3). Ninguno está mal y ningún texto dice cuál mide qué.

### Faltantes

**Hallazgo 5 — `conducta` no es extensible por el Agente Desplegado, aunque su Índice diga que sí.** `MOMENTOS.md` y `CLASES.md` no tienen frontmatter, no declaran origen y no tienen par del Agente Desplegado, pero `conducta/INDICE-LOCAL.md` declara la columna `Momento` y el lint valida que toda regla apunte a un momento existente. Un Agente con Propósito que necesite un momento propio no tiene dónde declararlo salvo en un archivo que el nivelador reemplaza entero. La decisión `Local-0042` partió por origen los Índices y dejó afuera los dos archivos de vocabulario que el lint consume.

**Hallazgo 6 — Sin control del desfase entre las dos partes del Agente Multipropósito.** La decisión `Local-0034` lo dice de sí misma: *"de ahí se sigue un desfase que ningún control mira todavía, el de las dos partes entre sí (caso medido: el Coordinador tiene los archivos de la generación nueva y los plugins de la vieja)"*. `actualizar-plugins` compara plugins contra lo publicado; `amp:actualizar` compara archivos contra la plantilla; nada compara archivos contra plugins. Autodiagnosticado el 25/07, sin cerrar.

**Hallazgo 7 — Cache de plugins con once nombres retirados, invisible al diagnóstico.** En `~/.claude/plugins/cache/xelnagah-harness/` conviven los 9 vigentes con `amp-memoria`, `amp-actualizar`, `memoria-local`, `gestion-de-planes`, `preferencias-trabajo`, `planificar`, `conducta`, `conocimiento`, `decisiones`, `herramientas` y `semantica`. No cargan (no están en `enabledPlugins`), pero `actualizar-plugins` mira `enabledPlugins` y nunca el cache, así que informa `TODO ACTUALIZADO` con once generaciones viejas en disco.

### Oportunidades

**Hallazgo 8 — La premisa que sostiene 296 KB de duplicación es falsa.** `AGENTS.md` justifica la duplicación así: *"la copia instalada del Plugin no puede leer las otras carpetas en ejecución"*. Medido: `~/.claude/plugins/marketplaces/xelnagah-harness/` contiene el repo completo — `AGENTS.md`, `README.md`, `REGISTRO.md`, `docs/` y las nueve carpetas de `funcionalidades/` — y `amp:actualizar` **ya lee de esa ruta**, describiéndola como *"la del marketplace bajado, que siempre está"*.

Hoy: `PLANTILLA.md` = 296.071 bytes con 159 cercas de código, más `propagar-harness` para copiar a mano, más el control de texto divergente de `lint-harness` para cazar cuando la copia se despega. Si `amp:inicializar` resuelve esa ruta y lee los ocho `SKILL.md`/`PLANTILLA.md` reales, las tres cosas dejan de tener trabajo.

Queda una pregunta abierta para el usuario: si el plugin se instala **sin** pasar por el marketplace esa carpeta no existe y hay que degradar. Es el plan `Sacar la duplicación entre el Producto y el Agente instalado` (`Local-0071`) con un camino que ese plan no contempla.

**Hallazgo 9 — El ahorro de la decisión `Local-0017` se consumió íntegro.** `Local-0017` se tomó porque `PLANES.md` pesaba ~21 KB y era *"casi la mitad del contexto siempre cargado"* (⇒ ~45 KB). Medido hoy **sin** `PLANES.md`: **42.802 bytes** (8 manifiestos + 6 Índices cargados + `AGENTS.md` + `CLAUDE.md`). Mismo peso, repartido en catorce archivos en vez de uno. La arquitectura funcionó; falta un presupuesto que vigile, porque cada índice liviano que se suma reconstruye el problema sin señal.

### Sobreingeniería

**Hallazgo 10 — El registro de planes crece más rápido de lo que se cierra, y nada detecta duplicados.** 48 pendientes contra 32 ejecutados en 12 días: se abren ~2,4 por día y se cierran ~1,4. Solapamientos visibles:

- Nomenclatura: `Local-0021`, `Local-0035`, `Local-0079`.
- Duplicación fuente↔copia: `Local-0031`, `Local-0068`, `Local-0071`.
- Verificar el texto producido: `Local-0022`, `Local-0038`, `Local-0039`.
- Subsistema planes: `Local-0015`, `Local-0043`, `Local-0070`, `Local-0075`.

El lint es mecánico, así que nada ve dos planes del mismo tema. Con 48 abiertos (388 KB), leerlos todos antes de abrir el 49 es caro, así que se abre duplicado. El registro se comporta como las herramientas desordenadas que el subsistema `herramientas` existe para evitar.

**Hallazgo 11 — `ESTADOS.md` configurable sin uso comprobado.** La decisión `Local-0005` lo hizo configurable por repo y el lint lo lee en vez de tener los estados fijos. Pregunta empírica: ¿algún Agente Desplegado cambió los estados alguna vez? Si no, es un punto de extensión que se paga sin usarse — y el plan `Local-0075` propone llevarlo a ocho estados, que multiplica el precio.

## Orden de trabajo

Por dependencia, no por gusto:

1. **Hallazgo 1** — mientras la lista de terminología no sea accionable, ningún barrido posterior se puede dar por cerrado.
2. **Hallazgo 2** — para que Hallazgo 1 y los demás controles no se rompan en silencio otra vez.
3. **Hallazgo 3 · Hallazgo 4 · Hallazgo 7** — correcciones mecánicas, sin criterio de por medio.
4. **Hallazgo 5 · Hallazgo 6 · Hallazgo 9** — huecos de diseño; el texto exacto se muestra antes de tocar decisiones o estructura.
5. **Hallazgo 8** — cambio estructural mayor; necesita ratificación y resolver la degradación sin marketplace.
6. **Hallazgo 10 · Hallazgo 11** — quitar cosas; quitar algo canónico es potestad del usuario.

## Lo resuelto del Hallazgo 1 (30/07/2026)

**El criterio que quedó, ratificado por el usuario:** donde el término ajeno se monta sobre una **palabra corriente del español**, lo que se registra es la **expresión**, no la palabra. Así el registro sigue enumerando lo prohibido —que es finito— en vez de lo permitido, que no lo es. El registro ya lo hacía en seis filas (`cementerio de tools`, `reforma de disco`, `Herramientas Base` y hermanas, que aclaran en su propio texto que `Base` sola no se veta); `capa` y `adaptaciones` eran las que habían quedado con la palabra pelada.

Se evaluó y **se descartó** una columna `Usos legítimos` en el registro: convierte la tabla en lista de lo permitido, y los usos válidos de una palabra corriente son infinitos, así que esa columna nunca cierra.

Y una fila **no** se califica por la forma de su Nombre sino por lo que acierta: **de las veces que marca una palabra, cuántas están de verdad mal usadas.** `capa` marcaba 37 y acertaba en ninguna.

Tres cambios aplicados:

1. **Exención por cita** en los tres lectores del registro —`lint-semantica`, `lint-harness` y el control `detectar-terminologia-vetada`—: las **comillas** (rectas, tipográficas y angulares) valen como cita igual que las comillas simples invertidas, porque en español son la marca de cita y sin ellas no se puede escribir sobre la propia terminología. La **cursiva queda afuera a propósito**: marca cita pero también énfasis, así que eximirla dejaría pasar el uso real. Efecto: −8 apariciones (`slug` 5→3, `gate` 5→2, `verbatim` 3→2, `pieza` 3→1, `tripa` 2→1).
2. **Fila `Local-0034` reformulada** a `capa de plugins` / `capa de archivos` / `capa de instalación` / `capa del proceso`. Se le quitó de la Descripción la salvedad *NO el nivel de integridad mecánica/semántica*, que existía para suplir lo que el Nombre no podía decir. Efecto: 37 → 0, verificado además con el control por los dos lados (`la capa de plugins va antes` avisa; `eso es la capa semántica` y `una capa de configuración` callan).
3. **Fila `Local-0038` reformulada** a `Adaptaciones de este repo` / `Adaptaciones del repo`. No se usó `## Adaptaciones` como Nombre por una restricción real: `lint-semantica` busca con `\b`, que **no matchea si el término arranca con un carácter que no es letra**, así que ese Nombre no se encontraría nunca —falso negativo silencioso—. El encabezado pelado ya lo valida `lint-preferencias` con su propio control sobre el título. Efecto: 9 → 1, y esa 1 es un acierto real.

También se retiró de `lint-harness` la lista `USOS_LEGITIMOS`, que quedó como código muerto: eximía `capa mecánica` y `capa semántica` de un término que ya no se busca.

**Resultado medido: 92 → 39 apariciones de texto plano**, y las 39 son barrido real, no ruido (`prosa` 6, `stale` 3, `slug` 3, `pintar` 3, `piezas base` 3, `ciclo-de-plan` 3, `bumpear` 3, y once más de a una o dos). Ese barrido ya tiene dueño en dos planes abiertos: `Local-0073` y `Local-0076`.

**Lo que quedó pendiente del Hallazgo 1:**

- **`semilla`** — la fila no se toca (está bien vetada, es copia literal de *seed*). Lo que se corrige son dos encabezados `## Idea semilla` que puso el agente, a `## Idea original` o `## Punto de partida`.
- **`calco`** — **vetado** (fila `Local-0040`) y barrido. El propio agente lo usó en esta sesión y el usuario mostró perplejidad, que es el síntoma con que el registro define su propio alcance; además ya estaba adentro del registro, en las filas `Local-0017` y `Local-0033`. Se corrigieron 8 apariciones en texto vivo (registro, dos páginas de conocimiento, la decisión `Local-0018`, dos planes); los planes ya ejecutados no se tocan, son histórico congelado.
- **La revisión periódica de las filas** — **hecha**, y sin habilidad nueva. `converger-terminologia` ganó dos cosas: una sección **Alcance** (el repo · los planes · lo que se publica · un texto puntual, indicado al invocarla; sin indicación, el repo) con la obligación de decir en el reporte qué quedó afuera, y un **paso 3** que revisa si cada fila del registro acierta y propone reformular a expresión cuando el uso válido domina, con la salvedad de que reformular una fila es redefinir el registro y va con ratificación. Se alineó el manifiesto de semántica y su copia en la PLANTILLA, y subieron `amp-semantica` a 0.8.0 y `amp` a 0.12.0. Esto ya estaba planteado en `Local-0070`, `Local-0073` y `Local-0038`.
- **Un dato desactualizado encontrado de paso** (clase Hallazgo 3): el manifiesto de semántica enumeraba las columnas del registro como `Término | Significado vetado | Cómo decirlo`, que dejaron de existir cuando la decisión `Local-0043` impuso el núcleo. Se quitó la enumeración —el detalle vive en el `README.md`— en las dos copias.
- **Dos defectos menores detectados y no arreglados:** `lint-semantica` no normaliza espacios al buscar un término de varias palabras (el control sí lo hace), y busca con `\b`, que falla con términos que empiezan con carácter no alfabético.

## Lo resuelto del Hallazgo 2 (30/07/2026)

**Diseño ratificado:** la prueba de cada control se co-ubica con él (`pruebas.js` al lado de lo que prueba, misma convención que los lints de la decisión `Local-0008`), **no viaja** a los Agentes Desplegados —es control de calidad del Agente Multipropósito, mismo trato que `lint-harness`—, y una Herramienta las corre todas.

**Hecho:**

1. **`.claude/conducta/detectar-terminologia-vetada/pruebas.js`** — 16 casos, con caso bueno y caso malo de cada cosa: uso real que frena, término con acento (los límites de palabra de `\b` son solo del alfabeto inglés), expresión de varias palabras, expresión con espacios de más, `new_string` de Edit, parche entero de Codex, las cuatro formas de cita, bloque de código cercado, archivo que no es `.md`, subsistema exento, contenido vacío y texto limpio. Incluye la **regresión de la decisión `Local-0044`**: `capa semántica` y `capa de configuración` no deben decir nada.
2. **`.claude/planes/lint-planes/pruebas.js`** — **rescatada de `tmp/`**, donde estaba terminada, funcionando y a punto de perderse: esa carpeta está gitignoreada. Su encabezado ya traía el criterio correcto —*cada control tiene que encenderse ante su defecto*, rompiendo de a uno y verificando que ningún otro se dispare de más—. Se le corrigieron dos casos que comparaban contra un **81 escrito a mano** y empezaron a fallar solos el día que este plan pasó a ser el 82: ahora cuentan las filas del banco. Es el hallazgo Hallazgo 3 dentro de una prueba, y confirma que el defecto no distingue entre registro y código.
3. **Herramienta `ejecutar-pruebas`** (`Local-0007` del registro del Agente Desplegado) — descubre cualquier `pruebas.js` bajo `.claude/` sin lista que mantener, y **sale con código 1 si una falla**, al revés de los lints, que reportan y nunca fallan: un lint que encuentra algo describe el repo, una prueba que falla dice que un control está roto. Es la hermana de `ejecutar-control-cierre` y contesta lo que esa no puede: *¿los controles que declaran verde el repo siguen funcionando?*

**Las pruebas se verificaron rompiendo el control a propósito**, porque una prueba que nunca falla no prueba nada. Dos roturas distintas en `detectar-terminologia-vetada` —quitarle la exención por comillas, y quitarle el filtro de `.md`—, y en las dos falló el caso que correspondía **y solo ese**. Después se restauró y se comprobó que el archivo quedó idéntico al respaldo.

4. **`.claude/semantica/lint-semantica/pruebas.js`** — 11 casos. Los **6 controles** del lint se encienden ante su defecto (Detalle roto, página huérfana, término legítimo y vetado a la vez, propuesto sin ratificar, columna declarada que la tabla no tiene, término vetado en texto plano), más el banco intacto en cero y cuatro casos buenos finos: las tres formas de cita que no deben contar como uso, y que el lint **barra el repo que se le pasa y no el propio**.

   El banco es un **repo de prueba completo**, con su propio `.claude/`, no una copia de la carpeta del subsistema: el lint barre el repo entero buscando términos vetados, así que sin eso el barrido caería sobre el repo real y los casos no serían aislados. Esto **recién se volvió posible con el Hallazgo 12**: mientras el lint deducía el repo de su propia ubicación, no había forma de apuntarlo a un banco.

   Verificada rompiendo el código: al quitarle la exención por comillas, fallaron los dos casos de cita que dependen de ella **y solo esos**.

**Un comentario que decía lo contrario del código.** Al restaurar `lint-semantica` quedó a la vista que los cuatro lints conservaban arriba del arreglo el comentario viejo —*la raíz del repo se deduce de la ubicación del propio lint*—, que después del Hallazgo 12 afirma justo lo que el código dejó de hacer. Se quitó de las **cinco** copias (los cuatro lints y sus cuatro bloques en la PLANTILLA).

5. **`.claude/herramientas/lint-harness/pruebas.js`** — 9 casos. Se encienden 7 controles, incluido el del Hallazgo 13 que hasta ahora solo estaba verificado a mano. El banco es un repo de prueba armado por copia selectiva —los planes pesan más que todo el resto y este lint no los mira—, y hay un detalle que vale recordar: **el repo de prueba no puede copiar `.claude/` de una** si vive en `.claude/tmp/`, porque sería copiarla dentro de sí misma; se copia entrada por entrada salteando `tmp`. Declara en la salida el control que **no** cubre (`VERSION EN DISCO DISTINTA DE LA INSTALADA`, que compara contra los plugins instalados en la máquina y un repo de prueba no tiene).

## Conocimiento asentado (30/07/2026)

Lo reutilizable de esta sesión quedó en dos páginas, a pedido del usuario:

- **`controles-que-no-avisan.md`** (`Local-0013`) — las cuatro formas en que un control se apaga solo y sigue dando verde, y cómo se prueba un control. Absorbe la disciplina que esta sesión fue descubriendo: caso bueno y malo, romper la prueba para saber si sirve, sin números absolutos adentro, banco aparte, y declarar lo que no se cubre.
- **`el-mismo-dato-en-dos-lugares.md`** (`Local-0014`) — un dato escrito dos veces diverge siempre; lo que decide el daño es si hay un control que compare. Las **cuatro** formas medidas acá, las dos trampas propias del texto que se publica, y el trabajo terminado que muere en la carpeta temporal.

  La cuarta se agregó al cerrar el Hallazgo 3: **el número que copia un dato que cambia**, con la distinción que lo salva. Un número que **cuenta el pasado** —*esta decisión llevó los plugins de 12 a 7*— no envejece, porque describe lo que la entrada hizo en su momento. Uno que **afirma el presente** —*los encabezados son literales en los diez Índices*— envejece con el repo y nada avisa. Y la **referencia por posición** es el peor caso, porque no cuenta sino que apunta: *las tres últimas filas* siguió señalando el final de la tabla mientras las filas que describía se corrían al medio. De cinco números auditados en el registro de decisiones, cuatro contaban el pasado y estaban bien.

6. **`.claude/conocimiento/lint-conocimiento/pruebas.js`** — 5 casos, los 3 controles encendidos. Reveló que **el banco tiene que copiar `.claude/` entera**: las páginas de conocimiento referencian otros subsistemas (`../semantica/README.md`, `../herramientas/README.md`), así que con el banco recortado aparecían 3 referencias rotas de arranque y el caso bueno no podía dar cero nunca. Incluye la regresión del Hallazgo 12 por el lado más fino: una referencia a un archivo que **solo existe en el repo real** se detecta como rota, o sea el lint mira el banco y no el repo donde vive.
7. **`.claude/decisiones/lint-decisiones/pruebas.js`** — 8 casos, los **6** controles encendidos (código repetido, Detalle roto, página huérfana, reemplazada por una decisión que no existe, Nombre duplicado, columna declarada de más), más el banco intacto en cero y el caso bueno de las tuberías escapadas, que el registro real ya ejercita.

**Decisión de diseño: cada prueba es autónoma, sin andamiaje compartido.** Se repiten unas 30 líneas por archivo a propósito: un módulo común roto apagaría todas las pruebas a la vez, que es exactamente el modo de falla que estas pruebas existen para evitar.

8. **`.claude/conducta/lint-conducta/pruebas.js`** — 10 casos, los **7** controles encendidos. Es el lint de mayor riesgo del repo porque su defecto no se ve en un informe: una regla atada a un momento que no existe **no se entrega nunca** y el agente sigue trabajando sin ella. Trae dos casos buenos que valen como documentación: que `CLASES.md` ausente **no** es un hallazgo (es el estado de un Agente Desplegado sin nivelar, y el lint se cae a las tres clases de siempre a propósito), y que un `INDICE-LOCAL.md` declarado y sin reglas es lo normal.

   **Esta prueba encontró un defecto real y lo arregló.** El control `INYECTAR SIN CONTENIDO` preguntaba `!f.contenido`, así que una celda con `—` —el marcador de «nada» en todos los registros del repo— pasaba como si tuviera contenido: la regla quedaba **entregando una cadena vacía en su momento, sin que nadie avisara**. Ahora `—`, `-` y `–` cuentan como vacío, y la prueba cubre las dos formas.

   **Y el control del Hallazgo 13 se estrenó solo:** al arreglar el lint, avisó que la copia embebida en la PLANTILLA había quedado atrás y dio la línea exacta. Ese es exactamente el defecto que el Hallazgo 13 vino a cerrar, ocurriendo por primera vez con el control ya puesto.

9. **`.claude/preferencias/lint-preferencias/pruebas.js`** — 12 casos. Cubre el núcleo de la tabla y, sobre todo, los **dos controles de contexto**, que son los que más valen: que el punto de entrada importe el manifiesto y que el manifiesto importe sus Índices. Sin eso las preferencias existen y **no están cargadas** — la falla que el subsistema entero existe para evitar, y que ningún otro control puede ver.

   Reveló que **el control de las secciones `##` solo corre en la rama de la forma vieja**: cuando ningún Índice declara frontmatter. Con dos Índices declarados los encabezados dejaron de ser el mecanismo de separación por origen —ahora es por archivo—, así que para ejercitarlo hay que reconstruir la forma vieja: un solo archivo, sin frontmatter, con las dos secciones adentro. La prueba lo hace y lo deja documentado, porque es una rama que solo se recorre en un Agente Desplegado sin nivelar.

10. **`.claude/subsistemas/lint-subsistemas/pruebas.js`** — 11 casos, 9 controles encendidos, incluido el que deja un subsistema **invisible**: la carpeta existe, el catálogo no la lista, y las habilidades que descubren subsistemas por el catálogo no la ven nunca.

    **Inconsistencia detectada, no corregida:** `lint-subsistemas` es el **único** lint del repo que sale con código 1 y escribe en la salida de errores. Los otros nueve reportan y nunca fallan, que es lo que fija la decisión `Local-0003` (la capa mecánica reporta, no frena). La prueba junta las dos salidas a propósito para no depender de la diferencia, pero la diferencia sigue ahí y conviene resolverla: o `Local-0003` admite excepciones y se dice cuáles, o este lint se alinea con los demás.

11. **`.claude/herramientas/lint-herramientas/pruebas.js`** — 7 casos, 5 controles encendidos. El más propio es el que verifica que las **rutas de lint en la configuración de hooks sigan existiendo**: caza lo que el manifiesto advierte —una tool referenciada por ruta no se mueve sin actualizar la referencia— y su falla no se ve en ningún informe, el hook simplemente deja de correr. Reveló el Hallazgo 14.

12. **`.claude/conducta/establecer-conducta/pruebas.js`** — 12 casos, y era **el hueco más grande del repo**: los diez lints podían dar verde mientras el repartidor no entregaba nada. Corre contra el registro vivo, porque el repartidor resuelve su registro desde su propia ubicación y eso es correcto para un hook. Verifica las tres clases: `UserPromptSubmit` entrega las reglas de `cada turno` (1216 caracteres del registro, no una cadena vacía), `PreToolUse` sobre un `.md` entrega las de `al escribir` **sin** frenar una escritura limpia, `Bloquear` frena de verdad ante un término sin uso legítimo posible, y `SessionStart` entrega la Pantalla por `systemMessage` con la caja armada. Más: un `.js` y un evento sin momento **no** disparan nada, y las cuatro entradas rotas —vacía, JSON inválido, objeto sin evento, `tool_input` nulo— salen con código 0. Eso último importa porque **un hook que revienta se lleva puesto el turno del usuario**.

13. **`.claude/conducta/mostrar-pantalla-bienvenida/pruebas.js`** — 11 casos. Lo que se protege acá es una **forma**, no un conteo: compara el ancho de todos los renglones entre sí —no contra un número fijo, porque el ancho es automático a propósito— y verifica que la caja cierre. Más la tolerancia, que es lo que evita romper el arranque de la sesión: sin `identidad.md` lo dice en vez de callarlo, y sin `.claude/` no revienta.

14. **`.claude/herramientas/actualizar-plugins/pruebas.js`** — 9 casos. Cubre la clasificación que depende del repo (`RETIRADO` y el `SIN DECLARAR` que motivó su existencia) y que **sin `--aplicar` no toque nada**. Declara su límite en la salida: el estado de instalación sale de la carpeta del usuario y no es parametrizable, así que ninguna prueba puede simular otra máquina.

**Hallazgo 2 cerrado: 13 de 13 controles con prueba, ~121 casos, todo verde.** Y las pruebas ya se pagaron solas: encontraron el defecto del `—` en `INYECTAR SIN CONTENIDO` y el Hallazgo 14, y de paso salieron el Hallazgo 12 y el Hallazgo 13.

## Hallazgo 12 — Cinco scripts deducen el repo desde su propia ubicación

Encontrado al preparar la prueba de `lint-semantica`, que no se puede correr aislado por esto mismo.

| Script | Línea |
|---|---|
| `lint-conocimiento` | 120 |
| `lint-decisiones` | 106 |
| `lint-herramientas` | 177 |
| `lint-semantica` | 127 |
| `ejecutar-control-cierre` | 11 |

Los cinco con la misma forma: `path.resolve(__dirname, '..', '..', '..')`. Y `lint-semantica` **mezcla las dos fuentes en el mismo archivo**: la carpeta del subsistema sale del directorio de trabajo (línea 99, `process.argv[2] || '.claude/semantica'`) y el repo que barre sale de la ubicación del script (línea 127). Con eso, apuntar el lint a otro subsistema lee el registro de un repo y barre otro, sin error.

Es la clase que el propio repo ya asentó en el conocimiento `el-repo-que-un-script-describe`: *deducirlo desde `__dirname` describe y modifica el repo equivocado, y no falla — contesta*; e incluye el aviso de que **arreglar dónde está el script no arregla qué repo mira**. Los cuatro lints viajan a cada Agente Desplegado, así que el arreglo se propaga. `lint-harness` y la Herramienta `ejecutar-pruebas` nueva ya lo hacen bien, tomándolo del directorio de trabajo.

**Resuelto (30/07/2026).** Los cuatro lints derivan el repo de `root` —la carpeta del subsistema que están mirando—, así que la carpeta que leen y el repo que barren salen de la misma fuente y **no pueden divergir**; antes eran dos fuentes distintas dentro del mismo archivo. `ejecutar-control-cierre` lo toma del directorio de trabajo o de un argumento.

**El hook `establecer-conducta` NO se tocó, y es deliberado:** ahí `__dirname` es lo correcto. La diferencia es que un lint recibe qué mirar como argumento y puede apuntarse a otro repo, mientras un hook siempre opera sobre el repo donde está instalado — y su directorio de trabajo no es confiable.

**Verificado apuntando el lint a otro repo:** se armó un repo de prueba con su propio `.claude/semantica` y un archivo con un término vetado. Con el arreglo, `lint-semantica` del repo real apuntado al repo de prueba barre **el repo de prueba** (1 aparición) y no el real (37). Antes leía el registro de uno y barría el otro sin emitir error.

## Hallazgo 13 — Nada comparaba el script que viaja contra el instalado

Salió de arreglar el Hallazgo 12, y es el hueco que lo dejó pasar. Al cambiar los cuatro lints en `.claude/`, la copia embebida en la PLANTILLA del instalador **quedó con el defecto** y el control de cierre siguió en verde. El chequeo que existía —`BLOQUES VERBATIM DIVERGENTES ENTRE PLANTILLAS`— compara plantillas **entre sí**, y compara **fragmentos** por hash, no el script completo contra el archivo instalado. Nadie miraba eso.

Medido: al comparar los 12 scripts embebidos contra su archivo en `.claude/`, **2 estaban divergentes** — el `codeSpans` de `lint-semantica` y el `textoDesnudo` del control de terminología, o sea los dos cambios del Hallazgo 1 de esta misma sesión, que se habrían publicado a medias.

**Resuelto:** `lint-harness` gana el control `SCRIPT EMBEBIDO DISTINTO DEL INSTALADO EN .claude/`, que ubica el destino de cada bloque por la ruta declarada antes de su cerca de código y lo compara entero, informando desde qué línea difiere. **Verificado introduciendo una divergencia real** en `lint-subsistemas`: la detectó y la ubicó; restaurado, volvió a cero.

Esto no reemplaza al plan `Local-0071` (*Sacar la duplicación entre el Producto y el Agente instalado*), que la disuelve de raíz: mientras el texto viva dos veces, lo único que se puede hacer es ver la divergencia a tiempo.

**Dos cosas más que salieron de acá:**

- **El texto que viaja está sujeto a un control más estricto que su original.** El control de terminología solo mira `.md`, así que un comentario dentro de un `.js` pasa y el **mismo** comentario embebido en la PLANTILLA se frena. Pasó en vivo: el ejemplo con que el código explica por qué no eximir la cursiva usaba un término vetado en cursiva. Se reformuló el ejemplo en las dos copias. El efecto general es que este desnivel **empuja a divergencia** entre la copia y su original.
- **La copia que viaja no debe arrastrar la historia de este repo.** El comentario del control mencionaba *Medido el 30/07/2026: este control rechazó dos veces…*, que es anécdota del repo autor y no le sirve a ningún Agente Desplegado. Se dejó el texto genérico en las dos copias y el episodio quedó asentado acá, que es su lugar.

## Lo resuelto del Hallazgo 6 (30/07/2026)

La decisión `Local-0034` se autodiagnosticó el hueco y lo dejó escrito: *de ahí se sigue un desfase que ningún control mira todavía, el de las dos partes entre sí*. Las dos partes son las **skills**, que llegan como plugins, y los **archivos**, que escribe `amp:inicializar`. Cada una tenía su control —`actualizar-plugins` para los plugins, `amp:actualizar` para los archivos— y ninguno miraba la relación entre ellas: las dos podían estar al día por su cuenta y no coincidir, con los dos controles en verde.

**Resuelto en `actualizar-plugins`**, que es donde corresponde: ya conoce los plugins instalados y `amp:actualizar` la corre primero. Compara los archivos del repo contra los bloques de la **PLANTILLA del plugin que efectivamente corre**, cuya ruta sale del registro de instalación (`installPath`) y no de adivinar una versión.

**Verificado en los dos escenarios reales:**

- **Este repo** (el que publica, con los cambios de hoy sin publicar): informa **8 archivos de otra generación**, y son exactamente los que se arreglaron hoy. El mensaje aclara que en el repo que publica eso es lo esperable.
- **Un consumidor** (`Agente-Coordinador`): **9 plugins atrasados** y las dos partes **coincidiendo**. Está atrasado pero consistente: las dos partes son de la misma generación vieja. Son dos preguntas distintas y el control las separa. De paso quedó claro que el caso concreto que la decisión describía —archivos nuevos con plugins viejos— ya se había resuelto en algún momento.

**Tercer resultado, deliberado:** si el plugin no está instalado *para ese repo*, no compara nada y se calla. Tomar la versión instalada para otro repo sería el modo de falla que esa Herramienta existe para no cometer. Los tres resultados tienen caso de prueba.

## Decisiones que esperan al usuario

Lo que salió de esta sesión y **no se puede resolver sin ratificación**, junto en un lugar. El agente propone; remover, renombrar o redefinir algo canónico es potestad del usuario.

| # | Qué hay que decidir | Estado del texto |
|---|---|---|
| ~~Decisión 1~~ | **Resuelta el 30/07/2026: la fila se retiró.** Era `Local-0004 \| lint-herramientas`, y contra ella estaban tres fuentes —el manifiesto (*los lints de subsistema no son Herramientas: son infra del Patrón*), el glosario `Local-0009` y el encabezado del propio Índice—. `Local-0002 \| lint-harness` **no** se tocó: no es lint de subsistema sino transversal, y la decisión `Local-0008` lo declara Herramienta de este repo. Retirarla es seguro porque el lint se autoexcluye del barrido por nombre; verificado, no queda reclamada. El código `Local-0004` queda como hueco y no se reusa. | **Hecho** |
| ~~Decisión 2~~ | **Resuelta el 30/07/2026: `SUPERSEDED ROTAS` → `REEMPLAZOS ROTOS`**, más los dos comentarios que lo nombraban, en las dos copias. Las formas en inglés **dentro del patrón de búsqueda** se dejaron a propósito: son datos que un Agente Desplegado sin nivelar todavía puede tener en su columna `Estado`. | **Hecho** |
| ~~Decisión 3~~ | **Resuelta el 30/07/2026: `lint-subsistemas` se alineó con los otros nueve.** Al medirlo apareció que el arreglo tenía que ser doble: quitarle solo el código de error habría hecho que el control de cierre dijera **OK con hallazgos**, porque cuenta parseando `(N)` y este lint emitía `[!] mensaje`, que no es contable. Ahora emite `[CATALOGO vs DISCO] (N)` en la salida normal y sale 0 siempre. Antes, un hallazgo suyo aparecía como `ERROR` en vez de listarse, y no entraba en ningún total. | **Hecho** |
| Decisión 4 | **Hallazgo 8 — la duplicación de 296 KB.** Pregunta abierta: qué hacer si el plugin se instala sin pasar por el marketplace, caso en que la carpeta que haría innecesaria la copia no existe. | Analizado, sin propuesta cerrada |
| ~~Decisión 5~~ | **Resuelta el 30/07/2026: el usuario decidió dejarlos como están.** Se midieron 4 temas repartidos en 13 planes, todos en `Nuevo`: nomenclatura (`Local-0021`, `Local-0035`, `Local-0079` — el último abierto 8 días después del primero), duplicación de texto (`Local-0031`, `Local-0068`, `Local-0071`), verificar lo que el agente escribe (`Local-0022`, `Local-0038`, `Local-0039`) y el subsistema de planes (`Local-0015`, `Local-0043`, `Local-0070`, `Local-0075`). Se ofrecieron tres caminos —dejarlos, fusionarlos a 4, o agruparlos con un plan paraguas por tema usando la columna `Origen`— y se eligió el primero. **La causa queda sin atacar y es esperable que aparezca un plan repetido más:** nada detecta que dos planes hablan de lo mismo, porque eso es juicio y no mecánica. | **Cerrada** |
| ~~Decisión 6~~ | **Resuelta el 30/07/2026 midiendo, sin decisión que tomar.** De los seis repos con el harness instalado, cinco usan los cinco estados de siempre y **`Agente-Coordinador` los cambió a ocho** (suma `Análisis`, `Listo` y `En pausa`). La sospecha de sobreingeniería era falsa: el punto de extensión se usa. Además el plan `Local-0075` propone justo esos ocho estados, o sea que ese repo ya adoptó lo que el plan plantea. | **Descartada** |

## Estado

**Sobre la numeración:** los hallazgos van numerados **solo dentro de este plan**, para poder nombrarlos en la conversación sin repetir la descripción entera. No son códigos de ningún registro y no siguen la convención `Local-NNNN` / `Base-NNNN`, que es para las entradas de un Índice de Subsistema. Del 1 al 11 salieron del análisis del 30/07/2026; del 12 en adelante aparecieron mientras se resolvían los anteriores.

| Hallazgo | Qué es | Estado | Nota |
|---|---|---|---|
| 1 | Calibración del barrido de terminología | **Hecho** | 92 → 39 apariciones. Ver `## Lo resuelto del Hallazgo 1` |
| 2 | Pruebas de los trece controles | **Hecho** | 13 de 13, ~121 casos, todo verde. Encontraron dos defectos reales. Ver `## Lo resuelto del Hallazgo 2` |
| 3 | Números absolutos desactualizados en registros canónicos | **Hecho** | Casi todo era falso: de 5 números, 4 estaban bien. Ver la sección propia |
| 4 | Doble conteo de vetados (39 filas contra 54 términos) | **Hecho** | Los dos números eran correctos y medían cosas distintas; faltaba decirlo. El lint pasó a informar `vetado: N relaciones (M términos)`; la Pantalla cuenta entradas, como en los otros subsistemas |
| 5 | `conducta` no es extensible por el Agente Desplegado | **Hecho** | Nace `MOMENTOS-LOCAL.md`; las clases NO se extienden y queda dicho por qué |
| 6 | Sin control del desfase entre archivos y plugins | **Hecho** | `actualizar-plugins` compara los archivos del repo contra los que instalaría el plugin que corre. Ver `## Lo resuelto del Hallazgo 6` |
| 7 | Cache de plugins con once nombres retirados | **Hecho** | `actualizar-plugins` informa el cache huérfano: 46 carpetas, y nunca marca lo que otro repo usa |
| 8 | Duplicación de 296 KB en la PLANTILLA | Pendiente | Espera al usuario (Decisión 4) |
| 9 | Presupuesto del contexto siempre cargado | **Hecho** | La Pantalla de bienvenida lo mide y avisa pasados 48 KB. Hoy: 43,9 KB en 17 archivos |
| 10 | Acumulación y solapamiento de planes | **Cerrado sin acción** | El usuario decidió el 30/07/2026 dejar los 13 planes como están. Queda medido: 4 temas ocupan 13 planes, los 13 en `Nuevo` |
| 11 | `ESTADOS.md` configurable sin uso comprobado | **Descartado** | Falso: medido el 30/07/2026, `Agente-Coordinador` cambió los estados a ocho. La configurabilidad está en uso |
| 12 | Cinco scripts deducen el repo desde su propia ubicación | **Hecho** | Los 5 arreglados y propagados. De acá salió el 13 |
| 13 | Nada comparaba el script que viaja contra el instalado | **Hecho** | Control nuevo en `lint-harness`, verificado con una divergencia real |
| 14 | La fila `lint-herramientas` contradice su propio manifiesto | **Hecho** | Fila retirada; el código `Local-0004` queda como hueco |
| 15 | `SUPERSEDED ROTAS`: anglicismo en la salida que viaja | **Hecho** | Pasó a `REEMPLAZOS ROTOS` en las dos copias |
| 16 | `lint-subsistemas` falla; los otros nueve solo reportan | **Hecho** | Alineado: reporta con formato contable y sale 0 |
| 17 | Dos defectos menores de `lint-semantica` | **Hecho** | Alineado con el control: límites de palabra con las letras del español (`` es del alfabeto inglés y trata los acentos como separador) y espacios flexibles en términos de varias palabras. Salió un tercero: con `` un término que arranca con un carácter que no es letra **no se encontraba nunca**, así que un veto sobre `## Adaptaciones` quedaba escrito sin vigilar a nadie. Los tres con caso de prueba |
| 18 | Los temporales en `.claude/tmp/` colisionan con probar `.claude/` | **Resuelto en la práctica** | Copiar `.claude/` dentro de `.claude/tmp/` es copiarla dentro de sí misma; las pruebas copian entrada por entrada salteando `tmp`. Documentado en las cuatro pruebas que lo necesitan |

## Notas de implementación

Cerrado el 30/07/2026 con **17 de 18 hallazgos resueltos**. El único que queda —la duplicación del texto que se publica— **no se movió a un plan nuevo**: ya tenía uno, `Local-0071` (*Sacar la duplicación entre el Producto y el Agente instalado*), y crear otro habría sido exactamente el defecto que este plan diagnosticó en su hallazgo 10. Se le agregó una sección con lo medido acá y con la dirección que eligió el usuario.

### Qué quedó distinto en el repo

- **La terminología pasó de 92 marcas a 39**, y las que quedan son trabajo real. Se logró sin apagar nada: se reformularon dos filas del registro y se sumó la exención por cita. Salió de ahí la decisión `Local-0044`.
- **Los 13 controles del repo tienen prueba**, con ~136 casos. No había ninguna. Se sumó la Herramienta `ejecutar-pruebas`, que las descubre solas y responde lo que el control de cierre no puede: si los controles que declaran verde el repo siguen funcionando.
- **Cuatro defectos que viajaban a cada repo instalado**: cinco scripts que decidían qué repo mirar por su propia ubicación; la copia publicada que quedaba atrás sin aviso; el `—` que pasaba como contenido válido en una regla de conducta; y tres límites de la búsqueda de términos, entre ellos que un veto sobre un encabezado **no encontraba nada nunca**.
- **`conducta` quedó extensible**: nace `MOMENTOS-LOCAL.md`. Las clases **no** se extienden, y quedó escrito por qué.
- **El contexto siempre cargado se mide en cada arranque** (43,9 KB en 17 archivos, presupuesto 48 KB), y `actualizar-plugins` informa el cache huérfano y compara las dos partes del Agente Multipropósito entre sí.

### Lo que este plan enseñó sobre sí mismo

**Tres de los hallazgos eran falsos o estaban mal medidos, y los descubrió la verificación, no el análisis.** El primero —que un lint clasificaba mal y por eso el cierre daba verde— se cayó al muestrear las seis líneas. El de `ESTADOS.md` se cayó al medir los repos instalados: `Agente-Coordinador` cambió los estados a ocho, o sea que la configurabilidad se usa. Y del hallazgo de números desactualizados, cuatro de cinco estaban bien. La lección quedó asentada: **medir antes de proponer**, porque un hallazgo plausible y falso cuesta más que uno no encontrado.

**Los defectos aparecieron mientras se arreglaban otros, no mientras se buscaban.** Siete de los dieciocho salieron así: el control que faltaba salió de arreglar los cinco scripts, y los tres límites de búsqueda salieron de escribir la prueba. Ninguno estaba en el análisis inicial.

**Dos veces se escribió un comentario que describía lo que se acababa de cambiar.** Se corrigieron en el momento, y es el mismo defecto que el conocimiento `el-mismo-dato-en-dos-lugares` asienta.

### Conocimiento asentado

- `controles-que-no-avisan.md` — las cuatro formas en que un control se apaga solo y sigue dando verde, y cómo se prueba uno.
- `el-mismo-dato-en-dos-lugares.md` — un dato escrito dos veces diverge siempre; cuatro formas medidas.
