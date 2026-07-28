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

## Falta decidir

1. **Las columnas de la tabla de preferencias.** Propuesto: `Preferencia | Ámbito | Contenido | Detalle`. Se descartaron `Estado` (una acción pendiente no es un estado; lo pendiente en este repo es un plan) y `Momento` (duplica la columna de `conducta/INDICE.md`).
2. **Un identificador estable no numérico.** Idea del autor: un código corto. Precisión a tener en cuenta: un hash del contenido cambia cuando cambia el texto, así que no da la referencia inmutable que se busca — tiene que ser un código asignado al crear la entrada.
3. **Los nombres de los seis archivos** que salen de partir los tres índices.

## El trabajo

1. Partir los tres índices en dos archivos cada uno.
2. Pasar `preferencias` a tabla, con sus 6 páginas de detalle.
3. `MANIFIESTO.md` y `README.md` de preferencias; sacar la excepción de `lint-subsistemas.js:28` y la sección propia de `AGENTS.md`.
4. Llevar los tres lints al Patrón: referencias, huérfanos, completitud, y que existan los dos archivos.
5. Reemplazar los encabezados viejos por los ratificados. Son unas 100 apariciones en texto vivo, que el lint de semántica ya marca.
6. Propagar a lo que viaja (`amp:inicializar` y su `PLANTILLA.md`, `amp-preferencias`, `amp:actualizar`) y verificar con `lint-harness`.
7. Migrar los Agentes Desplegados que ya tienen la forma vieja.

## Cruces

- **[Ordenar la nomenclatura del harness](Ordenar%20la%20nomenclatura%20del%20harness.md)** — se llevó toda la discusión de vocabulario. Este plan **no** depende de él.
- **[Separar origen Base y aprendido en los subsistemas](Separar%20origen%20Base%20y%20aprendido%20en%20los%20subsistemas.md)** — su abierto es literal *"dos-archivos vs dos-secciones, qué subsistemas aplican"*. Este plan lo responde; conviene cerrarlo contra este o absorberlo.
- **[Lint unificado parametrizable por capacidad de subsistema](Lint%20unificado%20parametrizable%20por%20capacidad%20de%20subsistema.md)** — el punto 4 del trabajo es una capacidad más a parametrizar.
- **[Revisar cada subsistema - sentido, disparador y skill de operacion](Revisar%20cada%20subsistema%20-%20sentido,%20disparador%20y%20skill%20de%20operacion.md)** — asume que el índice ya existe; este plan es la precondición para preferencias.
