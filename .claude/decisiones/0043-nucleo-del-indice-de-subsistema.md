# 0043 — Núcleo del Índice de Subsistema

## Qué se decidió

Todo Índice de Subsistema comparte cuatro columnas con nombre literal, y cada entrada lleva un código estable con prefijo de origen. Modifica 0042, que definió el Índice y su frontmatter pero no dijo nada de su forma interna. Ratificado el 2026-07-29.

## Por qué

El disparador fue `preferencias`, que figura como subsistema pero falla la definición del glosario: sin índice, sin entradas discretas, sin lint del Patrón. Al ir a arreglarlo apareció la pregunta de fondo: **no se acomoda `preferencias` a la forma que los otros tienen hoy; se define la forma correcta y se cambian los diez.**

Lo medido el 2026-07-29 sobre los diez Índices:

- La columna que cumple el mismo papel descriptivo se llama de cinco maneras distintas: `Qué guarda`, `Qué hace`, `Definición`, `Significado vetado`, `Decisión`.
- `decisiones` no tiene Nombre: para referirse a una hay que citar el número o el párrafo entero.
- `planes` no tiene Descripción, y el 76% de su archivo —48.649 de 64.260 caracteres— vive en una columna `Notas` que su propio encabezado declara "corto". Cada una de esas 80 filas tiene además su archivo de plan: el registro más pesado del repo lo es porque lleva adentro una segunda copia de cada plan.
- Solo un Índice tiene identificador: `decisiones`.

## El núcleo

- **Código** — referencia corta y estable, con prefijo de origen.
- **Nombre** — único dentro del Índice. Es la clave práctica, la que se usa al hablar.
- **Descripción** — la entrada en sí. Aplica el Patrón al Índice mismo: si con la línea alcanza, la entrada termina ahí.
- **Detalle** — `—`, un `.md`, o una carpeta con su propio manifiesto e índice.

A eso cada subsistema suma **solo las columnas operativas que su código realmente consume** (`Momento`, `Clase`, `Tipo`, `Estado`, `Alias`…), declaradas en el frontmatter como ya exige 0042.

**Los encabezados son literales en los diez Índices.** Un vocabulario único se aprende una vez y el lint encuentra el núcleo sin declaración extra. Lo que el encabezado deja de decir lo declara el frontmatter, con un campo que enuncia qué representa la Descripción de ese Índice: en Terminología Farlopa, el Significado Farlopa que el registro veta para ese término; en `herramientas`, qué hace la Herramienta.

**Las filas van en orden ascendente por Código.**

## El código

**Es un código, no una posición.** Se asigna al crear la entrada como `máximo + 1` —nunca `cantidad + 1`, que repetiría uno ya usado apenas se retire una entrada—, y retirar una deja un hueco que nadie vuelve a ocupar. De ahí que sobreviva a que el Agente Multipropósito saque una entrada en una versión nueva.

**El prefijo es el origen** (`Base-0007` para el Agente Multipropósito, `Local-0003` para el Agente Desplegado) y **va en todos los Índices, incluidos los de un solo origen**, para no tener que prefijar el día que reciban el segundo. Ese día llega: `semantica` es el caso probable, porque `Agente Multipropósito`, `Subsistema` e `Índice de Subsistema` son conceptos que todo Agente Desplegado querría en su glosario.

**En lo que queda escrito el código nunca va solo**: la referencia lleva adelante el sustantivo de la entidad (`Decisión Local-0042`, `Preferencia Base-0007`). Es la misma regla que la preferencia sobre siglas — en la conversación es libre; en el texto escrito el código acompaña al nombre y no lo sustituye.

**Los archivos de detalle conservan su nombre actual `NNNN-nombre.md`.** El nombre de archivo no es el código, y renombrarlos rompería links sin comprar nada.

## Alternativas descartadas

- **No numerar.** La objeción previa era que insertar una entrada en el medio pisaría códigos. Se disuelve al haber un archivo por origen: cada uno numera lo suyo y nadie inserta en el medio del otro. El resto de la objeción tampoco aplica: 0024 trata de dos registros distintos compartiendo numeración —el Agente Desplegado tiene su propio registro de decisiones arrancando en 0001— y acá cada archivo es su propio espacio de nombres.
- **Que cada Índice nombre sus columnas del núcleo y declare la equivalencia en el frontmatter.** Conservaba encabezados que ya dicen algo, pero deja nueve palabras donde puede haber una, y el riesgo que evitaba —que `Descripción` se lea como *qué significa el término* en vez de *qué significado está vetado*— se cubre con la declaración del frontmatter y el texto que encabeza la tabla.
- **Una columna de agrupamiento para `preferencias` (`Ámbito`).** La palabra ya nombra otra cosa (0009 clasifica las skills por ámbito), la lista de dos valores no cierra ni con el contenido actual —de las cinco preferencias del Agente Desplegado, la de guardar los temporales en `tmp/` no entra en ninguno— y sería la única columna del repo sin uso operativo.
- **Mudar el `Contenido` de `conducta` a un archivo por regla.** El repartidor lo consume: es el caso que el núcleo contempla como columna operativa. Los dos argumentos a favor no se sostuvieron — que la celda tenga 300 caracteres es cosmético, y el bloque de justificación que iba a llenar el archivo lo había inventado el agente, sin estar pedido y sin llegar a inyectarse.

## Consecuencias

- Cambian los diez Índices, sus lints, y el código que lee sus tablas: el repartidor de conducta, la Pantalla de bienvenida y el actualizador.
- `planes` reparte 48.649 caracteres en 80 archivos de plan, verificando en cada fila qué parte ya está en el archivo y qué parte solo vive en la celda.
- `decisiones` gana Nombre y Código. Sus 213 referencias en texto vivo quedan escritas en la forma vieja, sin apuntar mal: el número sigue identificando.
- `conducta` mantiene su `Contenido` y mueve sus clases a un registro propio.
- El actualizador gana contra qué validar la forma de un Índice, que hoy no tiene.
