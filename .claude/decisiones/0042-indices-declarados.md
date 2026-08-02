# 0042 — Un subsistema tiene uno o más Índices, declarados

Elaboración de la decisión. Lo que se decidió está en su fila del registro; acá van el defecto que la
motivó, las alternativas descartadas y la excepción que disuelve.

## El fallo silencioso que motivó las columnas declaradas

El repartidor de conducta localiza las columnas `Momento` y `Clase` por su nombre en el encabezado de
la tabla. Si una se renombra, no encuentra ninguna, **cada fila queda con el momento vacío y el
repartidor deja de despachar reglas sin emitir ningún error**. El mismo patrón vale para el lint de
herramientas, que necesita `Tipo` y `Estado`.

Declarar las columnas convierte eso en una comparación mecánica: el lint mira el encabezado real
contra lo declarado y falla en los dos sentidos. Es el caso general del conocimiento
[cambiar la forma de un registro rompe a sus lectores](../conocimiento/cambiar-la-forma-de-un-registro.md).

## Por qué el frontmatter es la autoridad y no el manifiesto

Sin un control que compare los dos, el mismo dato queda escrito en dos lugares que nada sincroniza.
No es hipotético: es el defecto que se midió **dos veces el 26/07/2026** con la lista de Componentes
de Subsistema del nivelador.

## Lo que se evaluó y se descartó

- **Un `INDICE.md` puntero**, con dos líneas `@` hacia los Índices reales. Suma un salto de
  importación sobre un presupuesto que la Decisión Local-0019 (cableado y estructura del Manifiesto
  de subsistema) ya midió al ras del límite documentado de cuatro, con margen cero. Y deja a los
  agentes que no expanden imports leyendo dos rutas en vez de la tabla, sin ninguna señal de error.
- **Un nombre uniforme para todos los Índices.** Su único motivo era que el nivelador pudiera
  identificar el archivo por el nombre, y el frontmatter lo reemplaza.
- **Unificar el Índice con el mecanismo de Registros Multipropósito.** Obligaría a todo subsistema a
  usarlo, y ese mecanismo es opcional —un subsistema puede usar cero—; además se diseña en su propio
  plan.

## La excepción que disuelve

Con esta forma, `semantica` —cuyos dos archivos se dividen por función y no por origen— deja de ser
una excepción del patrón. Y si algún subsistema necesitara tres Índices, no hay que redefinir nada.
