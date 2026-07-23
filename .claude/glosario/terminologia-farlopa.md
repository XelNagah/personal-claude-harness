# Terminología Farlopa

Conjunto de términos farlopa —ambiguos o semánticamente incomprensibles para el autor del repo— que los agentes van incorporando al dominio a medida que el proyecto avanza. Sin limpieza, eventualmente el agente los menciona generando una inconfundible expresión de perplejidad y confusión en el autor frente a conceptos que le resultan absolutamente alienígenas.

Es el concepto-paraguas de los términos **vetados que no tienen un concepto de dominio propio**: no son un alias confuso de algo del glosario (para eso el vetado vive en la columna `Vetados` de su concepto, y el reemplazo es el canónico de esa fila), sino jerga, anglicismos o metáforas que hay que purgar y reemplazar caso por caso. Por eso su reemplazo **no es un canónico único** sino uno por término.

El fenómeno es universal —le pasa a cualquier repo trabajado con agentes— y es el **origen del subsistema glosario**. Ver la página de conocimiento [terminología farlopa](../conocimiento/terminologia-farlopa.md).

## Mapa término → reemplazo

Cada término de la columna `Vetados` de *Terminología Farlopa* se reemplaza según esta tabla. El reemplazo depende a veces del contexto: se elige el que corresponda.

| Vetado | Reemplazo |
|--------|-----------|
| `dogfooding` | el harness probándose a sí mismo / usarlo sobre el propio repo |
| `Workflow` (como encabezado o sustantivo) | flujo de trabajo |
| `bump` / `bumpear` | subir la versión |
| `reconcile-on-use` | se ponen al día cuando se usan |
| `slug` | nombre estable (sin fecha) |
| `baldes` | grupos |
| `linkea` / `linkear` | apunta a / enlaza |
| `semilla` | contenido inicial |
| `stale` / `staleness` | desactualizado / desactualización |
| `cementerio de tools` | herramientas desordenadas |
| `sigilo` (por *sigil*) | símbolo |
| `plomería` | infraestructura interna |
| `tripa` / `tripas` | contenido interno de la Herramienta (código + archivos de trabajo dentro de su carpeta, que ningún índice lista) |
| `static` | config fija / estático |
| `binding` | atadura / vínculo |
| `dispatcher` | hook repartidor |
| `catch-all` | sin filtro / que atrapa todo |
| `feasibility` | viabilidad |
| `stress-test` | cuestionar a fondo |
| `thin` / `thin-first` | fino / empezar fino |

Todos fueron ratificados por el usuario (barridos del 2026-07-19 y 2026-07-20; `dogfooding` el 2026-07-21; `tripa` y los anglicismos de mecanismo —`static`, `binding`, `dispatcher`, `catch-all`, `feasibility`, `stress-test`, `thin`— el 2026-07-22). `payload` y `lookup` se evaluaron y **no** se vetaron: se entienden y se usan. El texto vivo ya está barrido; la columna `Vetados` y este mapa existen para que el lint cace **regresiones**.
