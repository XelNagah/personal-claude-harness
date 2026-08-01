# `.claude/common/`: los módulos que usan varios subsistemas y no son de ninguno

En `.claude/` hay una carpeta que **no es un subsistema**: `common/`. No tiene manifiesto, no tiene índice, no tiene skill que la opere y no aparece en el catálogo de subsistemas. Guarda el código que **más de un subsistema necesita y ninguno posee**.

Hoy tiene dos módulos:

- **`frontmatter.js`** — leer el frontmatter de un `.md`: sacarle la marca de orden de bytes, dar sus campos, su `origen`, si se declara Índice, y la cabecera de su primera tabla.
- **`indices.js`** — descubrir los Índices de un subsistema por su frontmatter y controlarlos contra lo que declaran (columnas y manifiesto). Lo requieren los ocho lints de subsistema.

## Por qué existe

Porque el mismo código escrito en varios lugares diverge siempre, y acá divergía en trece.

La lectura de frontmatter estuvo copiada a mano en trece lugares: los ocho lints de subsistema, los dos hooks, dos Herramientas y el nivelador. Cuando apareció el defecto de la marca de orden de bytes —un `.md` guardado con U+FEFF deja de matchear `^---` y pierde todo lo que declaraba de sí mismo, sin emitir señal— hubo que taparlo en doce archivos **a la vez**: taparlo en uno solo no habría sido una mejora parcial sino una divergencia nueva.

Y aun así quedaron cuatro copias divergiendo sin que nadie lo viera: los hooks aceptaban como cierre del frontmatter un `---` con texto pegado en la misma línea, que no es frontmatter válido. Nadie las comparaba.

El costo se pagaba dos veces. Además del arreglo repetido, había un **control dedicado exclusivamente a que las copias no divergieran**: exigía que el bloque fuera idéntico carácter a carácter entre lints. Ese control existía solo porque el bloque estaba duplicado, y desapareció con la duplicación.

## Por qué lo que vive acá no son Herramientas

El registro de Herramientas es para las *tools* que **el agente invoca**: un script que se corre, una skill que se dispara, un servidor MCP que se conecta. Cada Herramienta tiene una columna «Cómo se invoca» porque invocarla es lo que la define.

Un módulo de `common/` no se invoca nunca. No tiene comando, no se corre solo y el agente no lo llama: lo requiere **otro código**, en tiempo de carga. Ponerlo en el registro obligaría a inventarle una forma de invocación que no existe, y a quien lea el registro buscando qué puede correr le agregaría filas que no puede correr.

Es el mismo criterio por el que los **lints de subsistema** tampoco son Herramientas: son infraestructura del Patrón, no *tools* del Propósito. La diferencia entre un lint y un módulo de `common/` es solo de quién lo posee — el lint vive con su subsistema porque es de él; el módulo vive en `common/` porque no es de ninguno.

## Cuándo poner algo acá

Cuando **dos o más subsistemas** necesitan el mismo código y no hay uno que sea su dueño natural. Si un solo subsistema lo usa, va con ese subsistema: mudarlo a `common/` lo aleja de donde se lee y no evita ninguna divergencia, porque con un solo consumidor no hay nada que pueda divergir.

Dos cosas que arrastra un módulo compartido, y hay que atender en la misma tanda:

- **Tiene que viajar.** Un módulo que se requiere y no llegó al destino no falla como un dato faltante: el archivo que lo requiere **no arranca**, y en un hook eso es una sesión sin reglas entregadas. Es una carpeta de primer nivel de `.claude/` que no acumula entradas de ningún repo, así que **todo** lo que tiene adentro debe estar en lo que se instala — a diferencia de la raíz de un subsistema, donde un archivo sin contraparte es lo normal.
- **Necesita su propia prueba.** Es el código del que más cosas dependen: un defecto acá no rompe una cosa, apaga a todos sus lectores a la vez, y cada uno contesta lo que sabe contestar cuando no encuentra frontmatter —«no lo declara»—, que es una respuesta válida. Ninguno emite señal.

## Lo que no se resuelve mudando código acá

Un módulo compartido elimina la **duplicación**, no la **clase de defecto**. El mantenimiento sigue siendo propio: la marca de orden de bytes la tenían tapada hace años las bibliotecas de frontmatter del ecosistema, y el defecto se pagó entero por escribir el parseo a mano. Lo que hace que valga escribirlo igual es que estos scripts corren con Node pelado, sin `package.json` ni `node_modules`, y una dependencia nueva no la paga el repo que la agrega sino cada repo que instale el Agente Multipropósito.
