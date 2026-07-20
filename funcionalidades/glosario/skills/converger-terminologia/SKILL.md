---
name: converger-terminologia
description: Recorre el texto del repo contra el glosario — detecta sinónimos no registrados, anglicismos y desviaciones de los términos canónicos, y propone ratificar alias, vetar o reescribir; nada se asienta sin el usuario. Use when el usuario dice "converger terminología", "chequeo de terminología", "revisá los términos", o cuando en una sesión se detecta que circulan términos ajenos al glosario.
---

# Converger la terminología al glosario

El glosario solo da coherencia si el repo lo usa: los sinónimos improvisados y los anglicismos se propagan por texto plano, memorias y planes hasta volverse la terminología de facto. Esta skill hace el chequeo **semántico** que el lint mecánico no puede hacer: juzgar que dos palabras nombran el mismo concepto.

**Gobernanza (regla dura):** el agente **propone**; ratificar, vetar o reescribir es del usuario. Ningún término se asienta en el glosario sin su ok.

## Flujo

1. **Cargar el glosario** (`.claude/glosario/INDICE.md`): canónicos, definiciones, alias registrados (y vetados, si el modelo del repo los tiene).
2. **Barrido del repo** (la parte bruta puede ser mecánica — grep por término; el juicio no):
   - Apariciones de términos que **compiten** con un canónico: sinónimos no registrados, anglicismos, traducciones a medias, variantes ("tool" donde el canónico es "Herramienta").
   - Términos de dominio **frecuentes que no están** en el glosario (candidatos a concepto nuevo).
   - Vetados que sigan apareciendo, si el repo los registra.
3. **Separar los hallazgos en dos grupos** (destino distinto):
   - **Texto plano** — párrafos y listas de los `.md`: se reescribe con tranquilidad.
   - **Código** — delimitadores de bloque de código, backticks, identificadores, rutas, nombres de archivo: tocarlo es refactor y puede romper referencias por ruta (settings, hooks, links). Se informa, nunca se reescribe automáticamente.
   - **Autoexclusiones**: el propio glosario, y el histórico congelado (planes ejecutados/descartados — reescribir el pasado falsea el registro).
4. **Presentar la tabla de convergencia** al usuario: término hallado → concepto del glosario al que compite (o "concepto nuevo") → dónde y cuántas veces → propuesta con recomendación:
   - **ratificar como alias** (forma válida alternativa),
   - **vetar / reemplazar por el canónico** (el término no va más),
   - **asentar como concepto nuevo** (no competía: era un hueco del glosario).
5. **Aplicar solo lo ratificado:** actualizar el glosario; reescribir el texto plano de los reemplazos aprobados; dejar el grupo de código como lista informativa para refactors deliberados.
6. **Cerrar con el lint** desde la raíz del repo:

   ```bash
   node .claude/glosario/lint-glosario/lint-glosario.js
   ```

7. **Reportar**: qué se ratificó/vetó/asentó, cuánto texto plano se reescribió, y el grupo de código pendiente.

## Cuándo dispararla

Además de a pedido: si durante cualquier sesión el agente nota que él mismo u otros textos vienen usando un término ajeno al glosario, proponer una pasada — cuanto antes se converge, menos se propaga.
