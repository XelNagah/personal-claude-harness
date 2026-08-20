---
indice: Terminología Farlopa
origen: agente-desplegado
columnas: [Código, Nombre, Descripción, Cómo decirlo, Control, Detalle]
descripcion: el Significado Farlopa — el significado que este registro veta para ese término
---

# Terminología Farlopa

*Farlop Terminology* (EN). Registro par del glosario: las **relaciones término→significado vetadas** del dominio. Cada fila prohíbe un término **en un significado específico**, no el término en sí — el mismo término con otro significado puede ser legítimo (`plomería`=cañerías en un repo de fontanería es válido; `plomería`=infraestructura interna de software es farlopa). Por eso la `Descripción` de cada fila es el **Significado Farlopa**: fija cuál es el significado que se veta.

- **Código** — `Local-NNNN`. Se asigna al crear la entrada y no se reusa.
- **Nombre** — el término, o los términos hermanos que comparten el veto, **separados por `/`**. Las comillas simples invertidas alrededor de cada término son **opcionales**, igual que el resaltado: los lectores del registro las quitan si están, así que la fila se lee igual con ellas y sin ellas. Lo que **no** es opcional es el separador: sin la barra, la celda entera se lee como un solo término, y ese término no aparece en ningún texto.
- **Descripción** — el **Significado Farlopa**: el significado que este registro veta para ese término.
- **Cómo decirlo** — el canónico que lo reemplaza.
- **Control** — ver abajo.
- **Detalle** — `—`, o la página donde se conceptualiza el veto.

> **Quién lee esta celda.** El lint del subsistema y el control del momento `al escribir` la desarman con la misma función (`.claude/common/terminos-vetados.js`), para que no puedan divergir. Cuando cada uno la leía por su cuenta, el control **exigía** las comillas y el lint no: un registro poblado sin ellas lo dejaba leyendo un registro **vacío** — en verde, sin frenar nada. Medido el 20/08/2026 en tres instalaciones, dos no detectaban ninguna de sus filas.

Son términos farlopa —ambiguos o semánticamente incomprensibles para el autor del repo— que los agentes van incorporando al dominio a medida que el proyecto avanza. Sin limpieza, el agente eventualmente los menciona y genera una inconfundible expresión de perplejidad en el autor frente a conceptos que le resultan absolutamente alienígenas. El fenómeno es universal —le pasa a cualquier repo trabajado con agentes— y es el **origen del subsistema semántica**. Ver la página de conocimiento [terminología farlopa](../conocimiento/terminologia-farlopa.md).

El **lint marca por término** (lo mecánico: encuentra la palabra en el texto vivo); **el agente juzga el significado** al leer la marca (¿está usada en el sentido vetado o en uno legítimo?). El registro se calibra por repo: un anglicismo es farlopa para un lector hispanohablante y puede no serlo para uno angloparlante.

## La columna `Control`

Dice qué hace el control del momento `al escribir` cuando encuentra el término **antes** de que el archivo exista:

- **`bloquea`** — la palabra está mal **siempre**, sin importar la frase, así que la escritura se rechaza y hay que corregirla antes. Son los anglicismos puros: `levelear` no tiene ningún uso válido en español.
- **`avisa`** — la misma palabra puede estar bien o mal según qué signifique (`capa de configuración` es legítimo; `la segunda capa del proceso` está vetado). La máquina no puede decidirlo: informa los términos hallados y el agente juzga.

Vacío se lee como `avisa`. **El bloqueo mira solo las apariciones fuera de comillas simples invertidas**, así que citar un término para hablar de él —como hace esta misma tabla, o la Base de preferencias al dar ejemplos— nunca se frena; se frena usarlo.

**Gobernanza:** vetar es potestad del usuario; el agente solo propone. El agente **nunca usa** un término en el significado que este registro veta.

## Relaciones vetadas

| Código | Nombre | Descripción | Cómo decirlo | Control | Detalle |
| --- | --- | --- | --- | --- | --- |
