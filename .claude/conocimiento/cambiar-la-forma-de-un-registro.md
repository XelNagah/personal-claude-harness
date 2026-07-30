# Cambiar la forma de un registro rompe a sus lectores, casi siempre en silencio

Un registro que varias piezas de código leen —una tabla markdown, un CSV, cualquier archivo con
columnas— tiene lectores que **ubican su dato**. Al cambiarle la forma, cada lector que lo ubicaba
mal se rompe. Lo caro no es que se rompan: es que **la mayoría no falla, contesta**.

## Los dos modos de ubicar, y por qué los dos fallan callados

- **Por posición** (`celdas[1]` es el Estado). Cambia el orden de columnas y esa celda pasa a traer
  otra cosa. No hay error: hay un valor equivocado. Si el código compara ese valor contra un
  conjunto conocido —estados válidos, tipos, prefijos— **ninguno matchea y el resultado es cero**.
- **Por el texto del encabezado** (buscar la columna que se llama `Regla`). Se renombra el
  encabezado y la búsqueda devuelve "no encontrada". Si el código sigue adelante con la tabla vacía
  —en vez de gritar— valida sobre un conjunto vacío y **sale limpio**.

El resultado es el mismo en los dos casos: **un chequeo que no mira nada informa que está todo
bien.** Un lint en verde sobre cero filas es indistinguible de un lint en verde sobre un registro
sano, y un contador que informa `0` es indistinguible de un registro vacío.

## Lo medido

Migrar los diez registros de este repo a una forma de columnas común, entre el 29 y el 30 de julio
de 2026, rompió **once piezas de código**. **Ocho no emitieron ninguna señal**; solo tres gritaron.

Las que gritaron lo hicieron por accidente, no por diseño: una tomó la palabra del encabezado nuevo
como si fuera un dato y disparó 54 falsos positivos; otra no encontró la tabla y lo dijo; la tercera
quedó reportando que los 81 archivos no tenían fila. Las ocho restantes —el repartidor de reglas dos
veces, el control que frena la escritura de términos vetados, cuatro lints y la pantalla de estado—
siguieron contestando en verde mientras no validaban nada.

El caso más caro fue el control que rechaza escrituras: al renombrarse la columna que buscaba, leyó
el registro **vacío** y pasó a aceptar cualquier término prohibido. Corre en cada escritura y nadie
se habría enterado.

## Qué hacer, entonces

1. **Antes de tocar la forma, buscar todos los lectores.** No alcanza con los que uno recuerda: la
   pantalla de estado y los hooks son los que más se olvidan, y son los que fallan callados.
2. **Que ubiquen por nombre de columna**, no por posición, y que acepten los nombres viejos mientras
   dure la migración de las instalaciones que todavía no se pusieron al día.
3. **Que la ausencia sea un error, no un cero.** Si el lector no encuentra su columna, tiene que
   decirlo o degradar visiblemente — nunca devolver el conjunto vacío como si fuera un resultado.
4. **Una prueba por control, con un caso bueno y uno malo.** Es lo único que distingue *verde porque
   está bien* de *verde porque no valida nada*: se rompe el registro de a un defecto por vez y se
   verifica que **el hallazgo esperado aparezca**. En este repo quedaron 22 pruebas para el lint de
   planes y 5 para el nivelador, cada una con su defecto sembrado.

## Tres trampas de parseo, todas verificadas

- **`split('|')` ignora las tuberías escapadas.** Una celda que contiene `\|` —legítimo en markdown,
  y la única forma de nombrar columnas dentro de una tabla— corre todas las columnas siguientes. La
  forma que las respeta es `split(/(?<!\\)\|/)`. Afectaba a dos filas vivas del registro de
  decisiones, y dos de sus cinco chequeos estaban ciegos sobre esas filas sin que nada lo dijera.
- **`decodeURIComponent` lanza `URIError: URI malformed` ante un `%` suelto.** Un archivo llamado
  `100% de cobertura.md` referenciado desde el registro voltea el lint entero, no la fila. Hay que
  contener el fallo y caer a la ruta cruda.
- **Un lector que concatena varios archivos no puede detectar el encabezado una sola vez.** Cada
  archivo declara sus propias columnas: compartir el mapa del primero lee el segundo corrido y en
  silencio, y de paso cuenta su fila de encabezado como una entrada más.

**Cómo se verificó:** las once roturas son las encontradas y arregladas al migrar los diez registros
(29 y 30 de julio de 2026); las tres trampas se reprodujeron a mano —`decodeURIComponent` con un
`%` suelto tira en el momento, y el encabezado compartido se probó partiendo un registro en dos
archivos, que pasó a contar 82 filas donde había 81—.

**Cuándo aplica:** a cualquier cambio en la forma de un archivo que otros lean por columnas —agregar
una columna, renombrarla, reordenarla, partir el archivo en dos—. **Cuándo no:** si el archivo solo
lo lee una persona, el problema no existe; el costo aparece cuando hay código que lo interpreta.
