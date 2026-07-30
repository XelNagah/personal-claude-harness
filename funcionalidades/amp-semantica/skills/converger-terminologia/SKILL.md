---
name: converger-terminologia
description: Recorre el texto del repo contra la semántica (glosario + Terminología Farlopa) — detecta sinónimos no registrados, anglicismos y desviaciones de los términos canónicos, y propone ratificar alias, vetar o reescribir; nada se asienta sin el usuario. Use when el usuario dice "converger terminología", "chequeo de terminología", "revisá los términos", o cuando en una sesión se detecta que circulan términos ajenos al glosario.
---

# Converger la terminología a la semántica

La semántica solo da coherencia si el repo la usa: los sinónimos improvisados y los anglicismos se propagan por texto plano, conocimiento y planes hasta volverse la terminología de facto. Esta skill hace el chequeo **semántico** que el lint mecánico no puede hacer: juzgar que dos palabras nombran el mismo concepto, y que un término está usado en su significado vetado.

**Gobernanza (regla dura):** el agente **propone**; ratificar, vetar o reescribir es del usuario. Ningún término se asienta sin su ok.

## Flujo

1. **Cargar los dos registros** (`.claude/semantica/GLOSARIO.md` y `.claude/semantica/TERMINOLOGIA-FARLOPA.md`): canónicos, definiciones, alias registrados, propuestos, y las relaciones término→significado vetadas.
2. **Barrido del repo** (la parte bruta puede ser mecánica — grep por término; el juicio no):
   - Apariciones de términos que **compiten** con un canónico: sinónimos no registrados, anglicismos, traducciones a medias, variantes ("tool" donde el canónico es "Herramienta").
   - Términos de dominio **frecuentes que no están** en el glosario (candidatos a concepto nuevo).
   - Vetados que sigan apareciendo **en su significado vetado** (el lint los marca por término; acá se juzga el significado — el mismo término en un sentido legítimo no cuenta).
3. **Separar los hallazgos en dos grupos** (destino distinto):
   - **Texto plano** — párrafos y listas de los `.md`: se reescribe con tranquilidad.
   - **Código** — delimitadores de bloque de código, backticks, identificadores, rutas, nombres de archivo: tocarlo es refactor y puede romper referencias por ruta (settings, hooks, links). Se informa, nunca se reescribe automáticamente.
   - **Autoexclusiones**: el propio subsistema semántica (`.claude/semantica/`, contiene los vetados por definición), y el histórico congelado (planes ejecutados/descartados — reescribir el pasado falsea el registro).
4. **Presentar la tabla de convergencia** al usuario: término hallado → concepto del glosario al que compite (o "concepto nuevo") → dónde y cuántas veces → propuesta con recomendación:
   - **ratificar como alias** (forma válida alternativa, al glosario),
   - **vetar / reemplazar por el canónico** (el término no va más en ese significado: fila en Terminología Farlopa),
   - **asentar como concepto nuevo** (no competía: era un hueco del glosario).
5. **Aplicar solo lo ratificado:** actualizar los registros; reescribir el texto plano de los reemplazos aprobados; dejar el grupo de código como lista informativa para refactors deliberados. Las filas de los dos registros llevan `Código` adelante: `Local-NNNN`, **el mayor de ese Índice más uno** —nunca la cantidad de filas más uno, que repetiría un código ya usado si alguna vez se retiró una entrada—, y un código retirado deja un hueco que no se reusa. En el glosario, `Nombre` es el concepto y `Descripción` su definición; en Terminología Farlopa, `Nombre` es el término y `Descripción` es el **Significado Farlopa**, el significado que se veta.
6. **Cerrar con el lint** desde la raíz del repo:

   ```bash
   node .claude/semantica/lint-semantica/lint-semantica.js
   ```

7. **Reportar**: qué se ratificó/vetó/asentó, cuánto texto plano se reescribió, y el grupo de código pendiente.

## Cuándo dispararla

Además de a pedido: si durante cualquier sesión el agente nota que él mismo u otros textos vienen usando un término ajeno al glosario, proponer una pasada — cuanto antes se converge, menos se propaga.
