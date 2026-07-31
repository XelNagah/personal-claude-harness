# Darle banco de pruebas al nivelador y alcanzarlo con el corredor

**Estado: Ejecutado · Creado 26-07-30 · Cerrado 26-07-30.**

## El problema

`amp-actualizar.js` —el motor mecánico del nivelador, 503 líneas y unos quince chequeos— **no tiene banco de pruebas**. Es el script grande del repo que decide si un Agente con Propósito está al día, y nadie verifica que sus chequeos sigan controlando.

Y no se arregla escribiéndolo, porque el problema es de alcance del corredor: `ejecutar-pruebas` descubre **cualquier `pruebas.js` bajo `.claude/`**, y este script vive en `funcionalidades/amp/skills/actualizar/`. Un banco puesto al lado suyo existiría y **no se correría nunca**, y el repo seguiría informando «13 bancos verdes» sin haberlo mirado — el mismo modo de falla que documenta el conocimiento `controles-que-no-avisan`.

## Por qué no alcanza con barrer `funcionalidades/`

El inventario del 30/07/2026:

- Bajo `funcionalidades/` hay **un solo script propio**: `amp-actualizar.js`.
- Bajo `funcionalidades/` hay **doce `pruebas.js`**, y los doce son copias de `base/` — las mismas que ya corren desde `.claude/`.

Barrer la carpeta entera llevaría el repo de 13 a 26 bancos: doce duplicados exactos para ganar uno nuevo. Y `lint-harness` ya compara los dos lados en ambos sentidos, así que correr esas copias por segunda vez no agrega ninguna información — solo diluye el número que el repo informa.

Mudar el script a `.claude/herramientas/` tampoco sirve como atajo: encuentra la carpeta que compara con `path.resolve(__dirname, '..', 'inicializar', 'base')`, o sea **porque viaja en el mismo plugin**, y el `SKILL.md` lo invoca como `<ruta-de-esta-skill>/amp-actualizar.js`. Moverlo le rompe las dos cosas.

## El trabajo

1. **Ampliar `ejecutar-pruebas`** para que barra también `funcionalidades/`, **excluyendo `base/`**. El banco queda co-ubicado con el script, como todos los demás. Cualquier script propio que se sume después a `funcionalidades/` queda cubierto solo.
2. **Escribir el banco** de `amp-actualizar.js` en `funcionalidades/amp/skills/actualizar/pruebas.js`, con la convención del repo: caso bueno y caso malo por chequeo, sin números absolutos adentro, repo de prueba desechable bajo `.claude/tmp/`, cierre con `casos: N` y código de salida 1 si algo falla.
3. **Poner al día lo que describe al corredor**: el comentario de cabecera de `ejecutar-pruebas.js`, su ficha, y su fila en el Índice de Herramientas del Agente Desplegado — los tres afirman hoy que solo barre `.claude/`.

## Qué cubre el banco

Los chequeos que la corrida del plan `Local-0084` ejercitó a mano, más los que nunca se tocaron:

- Detección de `contenido viejo` y de `encabezado viejo`, y que un registro del Agente Desplegado con filas nuevas **no** se marque.
- Que `identidad.md` ausente se reporte.
- Renombres de forma anterior: `glosario/`, los encabezados renombrados, los Índices sin declarar y los que faltan partir por origen.
- La presencia de `memoria/`, que nunca puede terminar en «repo al día».
- Que un repo sin `.claude/` se reporte como caso de instalación y no de nivelado.
- Tolerancia: que ninguna entrada mal formada lo haga reventar.

## Fuera de alcance

`ejecutar-pruebas`, `ejecutar-control-cierre`, `inventariar-componentes-sueltos`, `sincronizar-base` e `instalar-plugins-codex` tampoco tienen banco. Los dos primeros son corredores, no controles; los otros tres son Herramientas del Agente Desplegado. Queda anotado acá, sin plan abierto.

## Estado

| Paso | Resultado |
|---|---|
| Ampliar `ejecutar-pruebas` | **hecho** |
| Escribir el banco | **hecho — 23 casos** |
| Poner al día lo que lo describe | **hecho** |

## Notas de implementación

**El corredor** pasó de una raíz a dos, declaradas en una constante `RAICES` con lo que cada una excluye. La etiqueta que muestra dejó de salir de la carpeta y sale del script que la prueba acompaña: para un lint las dos formas coinciden (`lint-planes/lint-planes.js`), pero en `funcionalidades/` la carpeta sola decía «actualizar», que no nombra nada. El repo pasó de 13 bancos a 14.

**El banco** cubre 23 casos en cinco grupos: que un repo al día no se marque, la detección de contenido, la estructura, las formas anteriores, y que no reviente ni se calle ante lo inesperado. Cada chequeo va de a dos —lo que está mal se marca, lo que está bien se calla—, porque un banco de solo casos malos no distingue un detector que funciona de uno que marca siempre.

El caso que más importa es el inverso: **que las filas que el repo agrega a un registro suyo NO se marquen**. Si eso se rompiera, el nivelador propondría pisar el Aprendizaje de cada Agente con Propósito instalado.

**Se verificó rompiendo el nivelador**, que es lo único que dice si un banco sirve:

- Apagar el chequeo de `identidad.md` hizo fallar ese caso y solo ese.
- Hacer que los registros del Agente Desplegado se comparen como si fueran mecanismo hizo fallar tres, y el detalle mostró el daño concreto: el glosario del repo marcado como `contenido viejo`.

**El fixture falló primero, y el detector tenía razón.** El primer armado de «repo al día» daba dos acciones propuestas: los hooks no se copian de `base/`, se fusionan, así que un repo con el árbol completo puede tener el repartidor sin enganchar. Se corrigió el armado y salieron dos casos más, uno por agente — que en Codex el cableado va aparte y estar en uno no dice nada del otro.

**Límite declarado adentro del banco:** se prueba el detector, o sea el modo vista previa. La aplicación —pisar el archivo, cortar por el separador de la tabla— la ejecuta el agente leyendo el `SKILL.md` y ninguna prueba automática la alcanza; se verificó a mano en el plan `Local-0084`.

**Los tres lugares que describían al corredor** decían que solo barre `.claude/`: el comentario de cabecera, la ficha y la fila del Índice. Los tres al día.
