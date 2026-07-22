# Terminología farlopa: la deriva terminológica de los agentes

Un agente de código, al trabajar sobre un repo sesión tras sesión, **va incorporando términos propios al dominio del proyecto** sin que nadie los ratifique: anglicismos crudos (`workflow`, `stale`, `bump`), calcos (`baldes` por *buckets*, `semilla` por *seed*), falsos amigos (`sigilo` por *sigil*), metáforas privadas (`cementerio de tools`, `plomería`) y jerga acuñada al vuelo. Cada uno entra porque en ese instante le resultó cómodo al agente; ninguno pasó por el autor.

El efecto es acumulativo y silencioso. El agente recita y reusa esos términos como si fueran dominio establecido, los propaga a memorias, planes, documentación y código, y **eventualmente los menciona en una conversación generando una inconfundible expresión de perplejidad en el autor**, que se encuentra frente a conceptos de su propio proyecto que le resultan absolutamente alienígenas. El repo, que debería ser legible para quien lo gobierna, se vuelve un dialecto ajeno.

**Es universal.** No depende de este repo ni de su propósito: le pasa a cualquier proyecto trabajado con agentes durante el tiempo suficiente. Cuanto más largo el proyecto y más autónomo el agente, más deriva.

**Es el origen del subsistema glosario.** El glosario existe para frenar esta deriva: fija el vocabulario canónico del dominio, registra los alias válidos y **veta** los términos farlopa (los marca para barrer y para que el lint cace sus regresiones). La gobernanza de ratificación (decisión 0004: ningún término se asienta sin el usuario) es la defensa directa contra que el agente legitime su propia jerga.

En este repo, el catálogo operativo de términos vetados y su mapa de reemplazos vive en el glosario: [Terminología Farlopa](../glosario/terminologia-farlopa.md).
