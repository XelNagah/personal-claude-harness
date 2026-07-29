# Partir los índices por origen y pasar preferencias a tabla

**Estado: Nuevo · Creado 26-07-28.** Origen: el autor preguntó por qué `PREFERENCIAS.md` no tiene forma de tabla como los demás índices.

## El problema

`preferencias` figura como subsistema Base en `SUBSISTEMAS.md`, pero **falla la definición de Subsistema del glosario** (*"área que persiste estado siguiendo el Patrón: índice + entradas + lint"*):

- **Índice** — `PREFERENCIAS.md` no indexa: es texto corrido en bullets.
- **Entradas** — no hay unidad discreta; una preferencia no se puede referenciar ni contar.
- **Lint** — `lint-preferencias` chequea tres cosas (que exista cada una de las dos secciones y el `@import`). No mira referencias, ni huérfanos, ni completitud, que la decisión 0003 declara obligatorio para todo subsistema que persiste estado.

El trato de excepción está cableado en tres lugares:

- `.claude/subsistemas/lint-subsistemas/lint-subsistemas.js:28` — `&& fila.nombre !== 'preferencias'`, para no exigirle `MANIFIESTO.md`.
- `AGENTS.md` importa **7** manifiestos para **8** subsistemas Base; preferencias entra por una sección propia.
- La decisión 0036 le dio `README.md` a cada subsistema; preferencias no lo tiene.

Los campos del Patrón ya existen en el archivo, escritos como texto corrido: el ámbito son los encabezados en negrita (`Comunicación:`, `Principios de trabajo:`), el detalle es una frase adentro del bullet (*"Convención completa en `estilo-commits.md`"*), y hay hasta un estado como paréntesis (*"candidato a subir al harness"*), que el paso 3 de `registrar-preferencia` produce y no tiene dónde anotar. Consecuencia medible: `estilo-commits.md` y `archivo-de-estado.md` son páginas huérfanas que ningún índice declara.

## La segunda mitad: partir por origen

Tres índices separan hoy lo que manda el harness de lo que suma el repo, y lo hacen **con dos secciones dentro de un mismo archivo**:

| Índice | Sección del harness | Sección del repo |
|---|---|---|
| `preferencias/PREFERENCIAS.md` | `## Base (harness v7)` | `## Adaptaciones de este repo` |
| `conducta/INDICE.md` | `## Reglas Base` | `## Reglas del Propósito` |
| `herramientas/INDICE.md` | `## Herramientas Base` | `## Herramientas del Propósito` |

Con dos secciones, el actualizador tiene que abrir el archivo y reemplazar media sección: es cirugía adentro de contenido del repo y contradice el principio fundante de la 0028. Con dos archivos, pisa uno entero y **nunca abre** el otro.

## Decidido

- Los tres índices se parten en **dos archivos** por origen.
- `preferencias` deja los bullets y pasa a tabla, con el contenido corto en la celda y lo largo en página de detalle. Molde: `conducta/INDICE.md`, cuya columna `Contenido` ya lleva el texto completo de cada regla. **17 entradas** (13 + 4) y **6 páginas de detalle** — las 2 que ya existen más 4 nuevas (dar ejemplos concretos, cómo pedir una decisión, gobernanza de terminología, la sigla nunca sola).
- `preferencias` gana `MANIFIESTO.md` y `README.md`. Sale su excepción del `lint-subsistemas` y su sección propia de `AGENTS.md`: pasa a ser el octavo manifiesto, con las dos líneas de importación de sus dos archivos. La cadena de importación sigue en 3 saltos, igual que hoy.
- **Sin identificadores numéricos.** La numeración corrida se rompe cuando el harness saca una entrada: el mismo número significa cosas distintas en dos repos con versiones distintas. Es la misma ambigüedad que la 0024 resolvió sacando el número en vez de administrar rangos. La clave estable es el nombre de la entrada, como ya hacen planes, conocimiento, herramientas y semántica.
- **Este repo también es un Agente Desplegado.** Acá también hay que actualizar marketplace, archivos y plugins; no es un caso aparte.
- **Formas que puede tomar una entrada del Patrón:** nada · un documento `.md` · una carpeta con su propio índice. Hay una cuarta forma en disco, ya contemplada al vetar `tripa`: la carpeta de una Herramienta, cuyo contenido ningún índice lista.
- **Cómo se llaman las dos secciones ya está ratificado y asentado** (28/07/2026): `Herramientas del Agente Multipropósito` / `Herramientas del Agente Desplegado`, y así con reglas y preferencias. El resto de la nomenclatura **no se toca acá** — ver el plan `Ordenar la nomenclatura del harness`.

## Diseño acordado el 29/07/2026 (sesión de `planificar`) — asentado en la decisión 0042

Lo que se resolvió cambia la forma del paso 1 y responde dos de los tres abiertos de abajo.

- **Son cuatro índices partidos, no tres.** `subsistemas/SUBSISTEMAS.md` también lo está (`## Subsistemas Base` / `## Subsistemas del Propósito`) y este plan no lo contemplaba. Además esas dos etiquetas **sobrevivieron al barrido del 29/07**: el registro de vetados lista `Herramientas Base`, `Reglas Base`, `preferencias Base` y `piezas Base`, pero no las de `subsistemas`, así que el lint nunca las marcó.
- **El origen se declara en un frontmatter, no en el nombre del archivo.** El nivelador identifica qué reemplazar leyendo `origen`, así que el nombre queda libre para decir qué lista. Eso descarta `MULTIPROPOSITO.md` y sus variantes, que fue el punto donde el diseño se trabó: el nombre decía de dónde venía el contenido y ocultaba cuál era.
- **El manifiesto lista los Índices del subsistema**, con el origen de cada uno — sexto campo obligatorio, validado por el control de campos mínimos que ya corre. Sin eso, con nombres libres no hay forma de descubrir los índices sin recorrer el directorio.
- **Un subsistema con un solo origen tiene un solo Índice.** No se crean archivos vacíos esperando contenido: el segundo entra el día que llegue. `semantica` deja de ser el caso raro, porque sus dos archivos se dividen por función y el formato ya no exige que la división sea por origen.
- **Las columnas también se declaran**, y cierran un fallo silencioso que existe hoy: el repartidor de conducta busca `Momento` y `Clase` por nombre en el encabezado y, si una se renombra, deja de despachar reglas sin emitir ningún error.
- **Descartado el puntero** —un `INDICE.md` con dos `@` a los índices reales— por el límite de cuatro saltos de importación, que la 0019 ya había medido con margen cero.

**Medición del 29/07/2026, entradas por origen:** `subsistemas` 8/0 · `preferencias` 13/5 · `conducta` 9/0 · `herramientas` 2/6. Los otros cuatro subsistemas tienen cero contenido del Agente Multipropósito.

## Falta decidir

1. **Las columnas de la tabla de preferencias.** Propuesto: `Preferencia | Ámbito | Contenido | Detalle`. Se descartaron `Estado` (una acción pendiente no es un estado; lo pendiente en este repo es un plan) y `Momento` (duplica la columna de `conducta/INDICE.md`).
2. **Un identificador estable no numérico.** Idea del autor: un código corto. Precisión a tener en cuenta: un hash del contenido cambia cuando cambia el texto, así que no da la referencia inmutable que se busca — tiene que ser un código asignado al crear la entrada.
3. ~~**Los nombres de los seis archivos** que salen de partir los tres índices.~~ **Resuelto el 29/07/2026.** Ver abajo.

## Nombres de archivo — resuelto el 29/07/2026

**Ningún archivo existente se renombra.** El sufijo `-LOCAL` marca sólo al que suma el repo, y aparece únicamente donde conviven los dos orígenes:

```
subsistemas/   SUBSISTEMAS.md
conducta/      INDICE.md
conocimiento/  INDICE.md
decisiones/    INDICE.md
planes/        PLANES.md
semantica/     GLOSARIO.md   TERMINOLOGIA-FARLOPA.md
preferencias/  PREFERENCIAS.md   PREFERENCIAS-LOCAL.md
herramientas/  INDICE.md         INDICE-LOCAL.md
```

Por qué así:

- **Ninguna convención del tipo "el que no lleva marca es de tal origen" se sostiene**, porque hay subsistemas de los dos tipos: `subsistemas` y `conducta` sólo tienen contenido del Agente Multipropósito, y `conocimiento`, `decisiones`, `planes` y `semantica` sólo tienen del repo. Con el frontmatter declarando el origen, el nombre no tiene que decirlo: le queda una sola tarea, distinguir dos archivos que conviven en un directorio.
- **`-LOCAL` es sólo el nombre de archivo.** Los encabezados de adentro conservan los términos ratificados el 28/07, y el frontmatter usa los mismos valores (`agente-multiproposito` / `agente-desplegado`).
- **Se descartó renombrar los `INDICE.md` a descriptivos** (`REGLAS.md`, `CONOCIMIENTO.md`…): son 61 referencias por ruta más 42 relativas, para una mejora de lectura y no de comportamiento. Queda como cambio independiente si alguna vez se quiere.
- **Se evaluó `-DESPLEGADO` y se prefirió `-LOCAL`** porque desde la perspectiva del usuario no queda claro que «desplegado» sea su propio repo. La colisión con el alcance `local` de la 0035 se midió y es débil: ese `local` nombra un alcance del CLI de plugins, no vocabulario del harness, y no se cruza con un nombre de archivo versionado.

**Resuelto el 29/07/2026 (segunda sesión de `planificar`), asentado en la 0042:** el manifiesto lista sus Índices como texto fijo del Agente Multipropósito, que los conoce de antemano, y el nivelador lo sigue copiando literal. Donde el Agente Multipropósito tiene contenido —`subsistemas`, `conducta`, `herramientas`, `preferencias`— `amp:inicializar` instala también el Índice del Agente Desplegado ya declarado: frontmatter con nombre, origen y columnas, y la tabla sin filas. Con eso `registrar-regla` y `agregar-subsistema` **no cambian**: siguen agregando una fila a un archivo que existe. Las columnas del Índice del Agente Multipropósito las declara el Agente Multipropósito; el del Agente Desplegado declara al menos esas mismas y puede sumar las suyas.

**Observación para el plan de nomenclatura, no para éste:** el autor señaló que `Agente con Propósito` y `Agente Desplegado` son en la práctica sinónimos —la única diferencia que sostiene el glosario es un despliegue recién instalado y todavía sin Propósito—, y que mantener dos entradas para eso cuesta más de lo que aporta. Fusionarlas toca la decisión 0034, que las separó deliberadamente.

## El trabajo

0. **Tres arreglos que la partición arrastra**, medidos el 29/07/2026 y sin alternativa:

   - **`AGENTS.md` gana la segunda línea de importación de preferencias.** Hoy importa un solo archivo (`AGENTS.md:63`); al mudarse las 5 preferencias del Agente Desplegado a su propio Índice, nadie las importa y salen del contexto. `lint-preferencias.js:29` chequea sólo `PREFERENCIAS.md`, así que seguiría en verde: pasa a exigir una importación **por cada Índice declarado**.
   - **La Pantalla de bienvenida cuenta un Índice y para.** `mostrar-pantalla-bienvenida.js:65` — `indiceDe()` recorre una lista fija de nombres y devuelve el primero que existe; después de partir informaría 2 herramientas en vez de 8 y 13 preferencias en vez de 18. Pasa a sumar todos los Índices del subsistema.
   - **Verificar el presupuesto de 220 palabras con el lint, no suponerlo.** Medido el 29/07/2026: `conducta` 214 · `semantica` 211 · `herramientas` 199 · `planes` 188 · `conocimiento` 155 · `decisiones` 140 · `subsistemas` 105.
1. Partir los tres índices en dos archivos cada uno.
2. Pasar `preferencias` a tabla, con sus 6 páginas de detalle.
3. `MANIFIESTO.md` y `README.md` de preferencias; sacar la excepción de `lint-subsistemas.js:28` y la sección propia de `AGENTS.md`.
4. Llevar los tres lints al Patrón: referencias, huérfanos, completitud, y que existan los dos archivos.
5. Reemplazar los encabezados viejos por los ratificados. Son unas 100 apariciones en texto vivo, que el lint de semántica ya marca.

   **Medido el 29/07/2026, lo que no se ve a simple vista:**

   - En `funcionalidades/` —el texto que viaja— son **43 apariciones en 6 archivos**: `Adaptaciones` 17, `Reglas Base` 7, `Reglas del Propósito` 6, `piezas Base` 6, `Herramientas del Propósito` 4, `Herramientas Base` 3. El grueso está en `PLANTILLA.md`. Es el único chequeo en rojo del control de cierre.
   - **Solo 11 de esas 43 son texto suelto** (`las ocho piezas Base conocidas`, `sin pisar adaptaciones locales`). Las otras **32 nombran los títulos de sección**, así que se acomodan solas una vez renombrados los títulos — pero renombrarlas antes deja instrucciones que mandan a secciones inexistentes. El orden es: primero los títulos, después las frases.
   - **Tres archivos de código tienen la cadena cableada**, no solo texto: `lint-preferencias.js` valida el título con `/^##\s+Adaptaciones\b/mi`, y `lint-harness.js` y `mostrar-pantalla-bienvenida.js` la buscan también. Mientras haya Agentes Desplegados sin migrar conviene que el lint acepte el nombre viejo y el nuevo.

   **Ejecutado el 29/07/2026.** Los 15 títulos vivos (9 en `PLANTILLA.md`, 6 en `.claude/`), su texto suelto, los índices de la raíz y las cinco decisiones que los citaban. El texto que viaja pasó de 43 hallazgos de terminología a **0**. Lo medido de más contra el diagnóstico de arriba:

   - **Los archivos de código eran cuatro, no tres:** el nivelador `amp-actualizar.js` tenía la cadena en cuatro puntos. Ganó `ENCABEZADOS_RENOMBRADOS`, análogo a `RENOMBRES` pero adentro de un archivo: detecta los seis encabezados viejos y pide renombrarlos **conservando el contenido** de cada sección. Verificado contra el consumidor de prueba (6 hallazgos) y contra este repo (0).
   - **`lint-harness` daba falso verde.** Su comparación de la Base entre `PREFERENCIAS.md` y las plantillas devolvía `null` cuando el encabezado no matcheaba, y `null` se salteaba en silencio: si el título cambiaba y el patrón no, el chequeo salía limpio sin comparar nada. Ahora el archivo sin sección reconocible es hallazgo.
   - **El número de versión salió del encabezado** (ratificado el 29/07/2026): `## Base (harness v7)` guardaba una versión adentro del Agente Desplegado, que la 0028 declara sin estado y la 0034 explica —la versión es del Agente Multipropósito—; ningún control la comparaba contra nada y quedaba desincronizada de la del plugin. La Pantalla pasó a contar las dos secciones, como con los demás subsistemas.

   Los tres lints aceptan la forma vieja y la nueva mientras dure la migración de la flota. Versiones: `amp` 0.8.0, `amp-preferencias` 0.5.0, `amp-conducta` y `amp-herramientas` 0.2.0.
6. Propagar a lo que viaja (`amp:inicializar` y su `PLANTILLA.md`, `amp-preferencias`, `amp:actualizar`) y verificar con `lint-harness`.
7. Migrar los Agentes Desplegados que ya tienen la forma vieja.

## Cruces

- **[Ordenar la nomenclatura del harness](Ordenar%20la%20nomenclatura%20del%20harness.md)** — se llevó toda la discusión de vocabulario. Este plan **no** depende de él.
- **[Separar origen Base y aprendido en los subsistemas](Separar%20origen%20Base%20y%20aprendido%20en%20los%20subsistemas.md)** — su abierto es literal *"dos-archivos vs dos-secciones, qué subsistemas aplican"*. Este plan lo responde; conviene cerrarlo contra este o absorberlo.
- **[Lint unificado parametrizable por capacidad de subsistema](Lint%20unificado%20parametrizable%20por%20capacidad%20de%20subsistema.md)** — el punto 4 del trabajo es una capacidad más a parametrizar.
- **[Revisar cada subsistema - sentido, disparador y skill de operacion](Revisar%20cada%20subsistema%20-%20sentido,%20disparador%20y%20skill%20de%20operacion.md)** — asume que el índice ya existe; este plan es la precondición para preferencias.
