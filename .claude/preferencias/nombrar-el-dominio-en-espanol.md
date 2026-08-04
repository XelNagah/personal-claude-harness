# Nombrar y explicar el dominio en español

Elaboración de la Preferencia Local-0010.

## El test, antes de escribir una palabra de origen inglés

**¿La diría tal cual, sin traducir, un desarrollador hispanohablante en una conversación en español?**

- **Sí → pasa.** Es vocabulario corriente del oficio: `commit`, `deploy`, `parsear`, `hardcodear`, `bug`, `hook`, `lint`, `script`. Traducirlas suena peor que dejarlas y, en varios casos, rompe la correspondencia con la herramienta que las usa.
- **No → traducila.** Son metáforas y modismos del inglés que no viajaron al habla: `churn`, `wedge`, `dogfooding`, `staleness`, `feasibility`, `stale`, `bump`, `workflow`.

**Ante la duda, traducir.** El costo de traducir de más es una palabra un poco formal; el de no traducir es un término que el autor no reconoce en su propio proyecto.

## Por qué el test y no "evitá los anglicismos"

Una regla abstracta no se puede obedecer: el agente **no siente lo raro**. Una palabra que le es nativa no le suena a nada, así que "no uses palabras raras" lo deja exactamente donde estaba. El test funciona porque reemplaza esa sensación por una pregunta con respuesta verificable — si la palabra circula en el habla del oficio o no.

## Qué se conserva en inglés

- **Identificadores externos:** nombres de archivos, campos de configuración, claves de una API, comandos.
- **Infraestructura técnica** cuya traducción pierda precisión o rompa compatibilidad.

No alcanza a los nombres del dominio del proyecto, que van en español aunque el concepto haya nacido en inglés.

## Relación con el criterio general de terminología

Esta preferencia es la aplicación **a un repo en español** de un criterio más amplio, que es neutral respecto del idioma y vive en la página de conocimiento sobre terminología farlopa: ahí el filtro es «¿lo entiende el usuario del Propósito de este repo?», y por eso el mismo término puede ser legítimo en un repo técnico y ajeno en uno contable. Un repo cuyo usuario trabaje en inglés usa ese criterio general y **no** necesita esta preferencia.
