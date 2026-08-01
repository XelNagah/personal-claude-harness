# Terminología farlopa: la deriva terminológica de los agentes

Un agente de código, al trabajar sobre un repo sesión tras sesión, **va incorporando términos propios al dominio del proyecto** sin que nadie los ratifique: anglicismos crudos (`workflow`, `stale`, `bump`), copias literales del inglés (`baldes` por *buckets*, `semilla` por *seed*), falsos amigos (`sigilo` por *sigil*), metáforas privadas (`cementerio de tools`, `plomería`) y jerga acuñada al vuelo. Cada uno entra porque en ese instante le resultó cómodo al agente; ninguno pasó por el autor.

El efecto es acumulativo y silencioso. El agente recita y reusa esos términos como si fueran dominio establecido, los propaga a planes, documentación y código, y **eventualmente los menciona en una conversación generando una inconfundible expresión de perplejidad en el autor**, que se encuentra frente a conceptos de su propio proyecto que le resultan absolutamente alienígenas. El repo, que debería ser legible para quien lo gobierna, se vuelve un dialecto ajeno.

**Es universal.** No depende del propósito de ningún repo en particular: le pasa a cualquier proyecto trabajado con agentes durante el tiempo suficiente. Cuanto más largo el proyecto y más autónomo el agente, más deriva.

**Es el origen del subsistema semántica.** Ese subsistema existe para frenar esta deriva: fija el vocabulario canónico del dominio en el glosario, registra los alias válidos y **veta** las relaciones término→significado que no corresponden, en el registro de [Terminología Farlopa](../semantica/TERMINOLOGIA-FARLOPA.md), que es el catálogo operativo de lo vetado y sus reemplazos. La regla de que ningún término se asienta sin la ratificación del usuario es la defensa directa contra que el agente legitime su propia jerga.

## Cómo detectarla: el criterio de demarcación

Detectarla **a tiempo** —antes de usarla— depende de un criterio operable, no de "sentir" que una palabra es rara. El agente **no siente lo raro**: una palabra que le es nativa (un anglicismo), o una imagen usada de metáfora, no "suena" a nada; por eso el recordatorio abstracto (*"no uses palabras raras"*) falla y la palabra se cuela igual.

El criterio es **relativo al lector**, y el lector de referencia es **el usuario del Propósito del repo**, no un perfil fijo. En un repo cuyo propósito es técnico, ese usuario es un desarrollador y `hook`/`deploy`/`lint` le son transparentes; en un repo contable o de análisis de una mudanza, el usuario no es técnico y esos mismos términos **son** farlopa ahí. Coincide con la definición: es farlopa lo que resulta incomprensible para el autor del repo.

Antes de usar un término para nombrar algo **del dominio**, pasarlo por estos filtros en orden:

0. **¿Lo entiende el usuario del Propósito de este repo?** Sí → no es farlopa, cortá.
1. **¿La traés vos o la dijo el usuario?** La dijo el usuario → válida (preferir sus palabras). La traés vos para el dominio → seguí.
2. **¿Anglicismo o jerga fuera del vocabulario de ese lector?** (`churn`, `wedge`, `feasibility`, `staleness`, `dogfooding`) → farlopa.
3. **¿Imagen o metáfora en lugar del nombre llano —del inglés o del castellano—?** (`zombi`, `tripa`, `plomería`, `cementerio de tools`, `baldes`, `semilla`) → farlopa.

El **filtro 3 es el que más se escapa**: caza la metáfora acuñada aunque la palabra exista en español. Caso testigo: *plan zombi* — "zombi" existe (proceso zombi), pero la imagen extendida a un plan la acuñó el agente en lugar de decir "falso pendiente".

Cuando un filtro da farlopa: **no usar el término; proponerlo en `Propuestos` y escribir el nombre llano.** Ante la duda, llanar.

El subsistema `conducta` entrega la versión corta de este criterio en el punto de acción: suave en cada turno, para minimizar la aparición, y fuerte al escribir archivos, para evitar que se persista y se propague. Un criterio que solo se lee al arrancar la sesión se recita; entregado en el momento de escribir, se obedece.
