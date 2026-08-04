# sincronizar-recomendadas

Genera el **catálogo de Preferencias Recomendadas** que viaja en el plugin `amp-preferencias`, a partir del Índice del Agente Desplegado de este repo.

```bash
node .claude/herramientas/sincronizar-recomendadas/sincronizar-recomendadas.js [--aplicar] [rutaRepo]
```

Sin `--aplicar` solo informa qué cambiaría, y **sale con código 1 si el catálogo quedó viejo** para que el control de cierre se entere. Con `--aplicar` lo escribe.

## Qué es el catálogo y por qué es derivado

El catálogo son las preferencias que el Agente Multipropósito **ofrece** a quien lo instala; la habilidad `adoptar-recomendadas` las muestra y el usuario elige. Ninguna se instala sola.

Su contenido es el Índice del Agente Desplegado de este repo —las elecciones de quien publica—, y por eso **es un archivo derivado que no se edita a mano**: si se lo mantuviera a mano, la misma preferencia quedaría escrita en dos lugares que divergen sin que nadie compare. Editar una recomendada significa editar la Preferencia local y regenerar.

## Qué hace exactamente

1. Descubre el Índice con `origen: agente-desplegado` por su frontmatter, no por su nombre.
2. Renumera cada fila como `Base-NNNN` correlativo: los Códigos del repo fuente no viajan.
3. Copia las páginas declaradas en `Detalle` y **repara adentro la referencia al Código de origen**, para que la página no cite un Código que en el catálogo no existe.
4. Borra del catálogo lo que ya ningún Índice declara, así una fila retirada no sobrevive como página huérfana.

El Índice del Agente Multipropósito del repo fuente **no** alimenta el catálogo: esas ya son mecanismo instalado, no sugerencias.

## Destino

`funcionalidades/amp-preferencias/skills/adoptar-recomendadas/recomendadas/`

El catálogo tiene la misma forma que un Índice de Preferencias —frontmatter que lo declara y tabla `Código | Nombre | Descripción | Detalle`—, así lo lee el mismo auxiliar `incorporar-preferencia.js` que copia entre Agentes, con `--catalogo`.

## Pruebas

```bash
node .claude/herramientas/sincronizar-recomendadas/pruebas.js
```

17 casos: generación, renumeración, reparación del Código en el detalle, catálogo viejo detectado, retiro de filas y páginas, y los defectos que tienen que frenar la generación (detalle ausente, Índice sin filas, Índice inexistente).
