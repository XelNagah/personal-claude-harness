---
name: converger-terminologia
description: Recorre un texto contra la semántica (glosario + Terminología Farlopa) — detecta sinónimos no registrados, anglicismos y desviaciones de los términos canónicos, y propone ratificar alias, vetar o reescribir; también revisa si las filas del registro están bien puestas. El alcance se le indica al invocarla (todo el repo, solo los planes, solo lo que se publica, o un texto puntual); sin indicación, todo el repo. Nada se asienta sin el usuario. Use when el usuario dice "converger terminología", "chequeo de terminología", "revisá los términos", "revisá la terminología de los planes / de lo que se publica / de este texto", o cuando en una sesión se detecta que circulan términos ajenos al glosario.
---

# Converger la terminología a la semántica

La semántica solo da coherencia si el repo la usa: los sinónimos improvisados y los anglicismos se propagan por texto plano, conocimiento y planes hasta volverse la terminología de facto. Esta skill hace el chequeo **semántico** que el lint mecánico no puede hacer: juzgar que dos palabras nombran el mismo concepto, y que un término está usado en su significado vetado.

**Gobernanza (regla dura):** el agente **propone**; ratificar, vetar o reescribir es del usuario. Ningún término se asienta sin su ok.

## Alcance: sobre qué se corre

El alcance se indica **al invocarla**, con palabras. No hay un alcance fijo: el mismo chequeo sirve para todo el repo o para un párrafo, y mezclarlos entorpece — barrer el repo entero cuando lo que se quiere es revisar un texto devuelve cientos de apariciones que no vienen al caso.

| Se pide | Qué se recorre |
|---|---|
| nada (default) | todo el repo |
| «los planes» | los planes vivos (`.claude/planes/pendientes/`) |
| «lo que se publica» / «el Producto» | lo que el repo entrega y viaja a cada Agente Desplegado |
| «este texto», o se pega un texto / se nombra un archivo | solo eso |

Con un alcance acotado, las autoexclusiones del paso 3 siguen valiendo, pero lo que queda afuera **se dice** en el reporte: un barrido que calló lo que no miró se lee como si el resto estuviera limpio.

## Flujo

1. **Cargar los dos registros** (`.claude/semantica/GLOSARIO.md` y `.claude/semantica/TERMINOLOGIA-FARLOPA.md`): canónicos, definiciones, alias registrados, propuestos, y las relaciones término→significado vetadas.
2. **Barrido del alcance** elegido arriba (la parte bruta puede ser mecánica — grep por término; el juicio no):
   - Apariciones de términos que **compiten** con un canónico: sinónimos no registrados, anglicismos, traducciones a medias, variantes ("tool" donde el canónico es "Herramienta").
   - Términos de dominio **frecuentes que no están** en el glosario (candidatos a concepto nuevo).
   - Vetados que sigan apareciendo **en su significado vetado** (el lint los marca por término; acá se juzga el significado — el mismo término en un sentido legítimo no cuenta).
3. **Revisar si las filas del registro están bien puestas.** El barrido del paso 2 ya cuenta las apariciones término por término, así que esto sale de lo mismo: para cada fila, **cuántas veces marcó y en cuántas la palabra estaba de verdad mal usada**. Una fila que marca mucho y no acierta nunca no está protegiendo nada: está gastando la atención del lector, y un registro que marca todo entrena a ignorarlo.

   Cuando el uso válido domina, la causa es casi siempre la misma: el término ajeno se monta sobre una **palabra corriente del español** y la fila registró la palabra pelada. La corrección es registrar la **expresión** donde el sentido ajeno se realiza, no la palabra: `capa de plugins` en vez de `capa`, `Adaptaciones de este repo` en vez de `Adaptaciones`. Así el registro sigue enumerando lo prohibido —que es finito— y no lo permitido, que no lo es.

   Dos cosas que **no** son el caso y no se toca la fila:

   - la palabra corriente **no aparece** en este repo con su sentido corriente (el Nombre pelado funciona: no hay con qué confundirlo);
   - las marcas son aciertos, aunque sean muchas: eso es trabajo de barrido pendiente, no una fila mal puesta.

   Reformular el Nombre de una fila **es redefinir el registro**: se propone con el texto exacto y se espera la ratificación del usuario.

4. **Separar los hallazgos en dos grupos** (destino distinto):
   - **Texto plano** — párrafos y listas de los `.md`: se reescribe con tranquilidad.
   - **Código** — delimitadores de bloque de código, backticks, identificadores, rutas, nombres de archivo: tocarlo es refactor y puede romper referencias por ruta (settings, hooks, links). Se informa, nunca se reescribe automáticamente.
   - **Autoexclusiones**: el propio subsistema semántica (`.claude/semantica/`, contiene los vetados por definición), y el histórico congelado (planes ejecutados/descartados — reescribir el pasado falsea el registro).
5. **Presentar la tabla de convergencia** al usuario: término hallado → concepto del glosario al que compite (o "concepto nuevo") → dónde y cuántas veces → propuesta con recomendación:
   - **ratificar como alias** (forma válida alternativa, al glosario),
   - **vetar / reemplazar por el canónico** (el término no va más en ese significado: fila en Terminología Farlopa),
   - **asentar como concepto nuevo** (no competía: era un hueco del glosario).
6. **Aplicar solo lo ratificado:** actualizar los registros; reescribir el texto plano de los reemplazos aprobados; dejar el grupo de código como lista informativa para refactors deliberados. Las filas de los dos registros llevan `Código` adelante: `Local-NNNN`, **el mayor de ese Índice más uno** —nunca la cantidad de filas más uno, que repetiría un código ya usado si alguna vez se retiró una entrada—, y un código retirado deja un hueco que no se reusa. En el glosario, `Nombre` es el concepto y `Descripción` su definición; en Terminología Farlopa, `Nombre` es el término y `Descripción` es el **Significado Farlopa**, el significado que se veta.
7. **Cerrar con el lint** desde la raíz del repo:

   ```bash
   node .claude/semantica/lint-semantica/lint-semantica.js
   ```

8. **Reportar**: el alcance sobre el que se corrió y **qué quedó afuera**, qué se ratificó/vetó/asentó, las filas que se propuso reformular con su conteo, cuánto texto plano se reescribió, y el grupo de código pendiente.

## Cuándo dispararla

Además de a pedido: si durante cualquier sesión el agente nota que él mismo u otros textos vienen usando un término ajeno al glosario, proponer una pasada — cuanto antes se converge, menos se propaga.

## Reconciliación

Re-correr sobre el mismo alcance vuelve a comparar contra los registros actuales. No duplicar conceptos, aliases ni vetos ya ratificados; reportarlos `ya estaba`. Una fila o uso incompatible se informa `divergente` y no se reescribe sin una nueva ratificación. El conteo final debe permitir verificar qué usos quedaron pendientes.
