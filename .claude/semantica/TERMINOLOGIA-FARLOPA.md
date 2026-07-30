---
indice: Terminología Farlopa
origen: agente-desplegado
columnas: [Código, Nombre, Descripción, Cómo decirlo, Control, Detalle]
descripcion: el Significado Farlopa — el significado que este registro veta para ese término
---

# Terminología Farlopa

*Farlop Terminology* (EN). Registro par del glosario: las **relaciones término→significado vetadas** del dominio. Cada fila prohíbe un término **en un significado específico**, no el término en sí — el mismo término con otro significado puede ser legítimo (`plomería`=cañerías en un repo de fontanería es válido; `plomería`=infraestructura interna de software es farlopa). Por eso la `Descripción` de cada fila es el **Significado Farlopa**: fija cuál es el significado que se veta.

- **Código** — `Local-NNNN`. Se asigna al crear la entrada y no se reusa.
- **Nombre** — el término, o los términos hermanos que comparten el veto.
- **Descripción** — el **Significado Farlopa**: el significado que este registro veta para ese término.
- **Cómo decirlo** — el canónico que lo reemplaza.
- **Control** — ver abajo.
- **Detalle** — `—`, o la página donde se conceptualiza el veto.

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
| Local-0001 | `artefacto` | un archivo o una carpeta del repo | Componente de Subsistema cuando pertenece a uno; si no, `archivo` o `carpeta` | avisa | — |
| Local-0002 | `pieza` | un Componente de Subsistema (archivo o carpeta de un subsistema) | Componente de Subsistema | avisa | — |
| Local-0003 | `gate` | un Control (chequeo que frena el avance) | Control | bloquea | — |
| Local-0004 | `prosa` | el texto corriente de los `.md` | texto plano | avisa | — |
| Local-0005 | `levelear` / `leveleo` / `leveling` | poner al día una instalación existente | nivelar | bloquea | — |
| Local-0006 | `verbatim` / `byte-exact` / `byte-check` | copia idéntica carácter a carácter | Textual / carácter a carácter | bloquea | — |
| Local-0007 | `dogfooding` / `dogfood` | cualquier uso | el Agente Multipropósito probándose a sí mismo / usarlo sobre el propio repo | bloquea | — |
| Local-0008 | `Workflow` | cualquier uso (como encabezado o sustantivo) | flujo de trabajo | avisa | — |
| Local-0009 | `bump` / `bumpear` | cualquier uso | subir la versión | bloquea | — |
| Local-0010 | `reconcile-on-use` | cualquier uso | se ponen al día cuando se usan | bloquea | — |
| Local-0011 | `slug` | cualquier uso (como identificador) | nombre estable (sin fecha) | bloquea | — |
| Local-0012 | `baldes` | cualquier uso (como agrupación) | grupos | avisa | — |
| Local-0013 | `linkea` / `linkear` | cualquier uso | apunta a / enlaza | bloquea | — |
| Local-0014 | `semilla` | contenido inicial de un registro o archivo | contenido inicial | avisa | — |
| Local-0015 | `stale` / `staleness` | cualquier uso | desactualizado / desactualización | bloquea | — |
| Local-0016 | `cementerio de tools` | un conjunto de herramientas sin ordenar | herramientas desordenadas | avisa | — |
| Local-0017 | `sigilo` | símbolo (copiado de *sigil*) — no *sigilo*=discreción, que es legítimo | símbolo | avisa | — |
| Local-0018 | `plomería` | infraestructura o mecánica interna de software | infraestructura interna | avisa | — |
| Local-0019 | `tripa` / `tripas` | el contenido interno de una Herramienta (código + archivos de trabajo dentro de su carpeta, que ningún índice lista) | contenido interno de la Herramienta | avisa | — |
| Local-0020 | `static` | cualquier uso | config fija / estático | avisa | — |
| Local-0021 | `binding` | cualquier uso | atadura / vínculo | avisa | — |
| Local-0022 | `dispatcher` | cualquier uso | hook repartidor | avisa | — |
| Local-0023 | `catch-all` | cualquier uso | sin filtro / que atrapa todo | bloquea | — |
| Local-0024 | `feasibility` | cualquier uso | viabilidad | bloquea | — |
| Local-0025 | `stress-test` | cualquier uso | cuestionar a fondo | bloquea | — |
| Local-0026 | `thin` / `thin-first` | cualquier uso | fino / empezar fino | avisa | — |
| Local-0027 | `churn` | cualquier uso | trajín / movimiento (o «rotación» si es de clientes o datos) | bloquea | — |
| Local-0028 | `wedge` | cualquier uso | cuña / palanca / punto de entrada (según contexto) | bloquea | — |
| Local-0029 | `reconciler` | el nivelador consolidado (`amp-actualizar`) | nivelador (glosario: *Nivelar*) | bloquea | — |
| Local-0030 | `install-prompts` | los inicializadores del setup | skills de instalación / inicializadores | bloquea | — |
| Local-0031 | `reforma de disco` | reorganizar el árbol de carpetas del repo | reorganizar el árbol de carpetas | avisa | — |
| Local-0032 | `cruce` | la pregunta pivote que reconfigura el resto del análisis; o la relación con decisiones ya tomadas | **pregunta de fondo** (la que manda) / **dependencias** (relación con lo ya decidido) | avisa | — |
| Local-0033 | `huevo-y-gallina` / `huevo y gallina` | la dependencia circular donde A necesita a B y B necesita a A (copiado de *chicken-and-egg*) | **dependencia circular** / problema de arranque | avisa | — |
| Local-0034 | `capa de plugins` / `capa de archivos` / `capa de instalación` / `capa del proceso` | una **fase** de un proceso (p. ej. las dos de poner al día un Agente con Propósito: plugins y archivos) | **fase** | avisa | — |
| Local-0035 | `ciclo-de-plan` | el nombre de la habilidad que opera el subsistema planes | nombrar cada habilidad por su verbo (`registrar-plan`, `analizar-plan`…); el **ciclo** en sí es del subsistema, no de una habilidad — plan `Partir las mega-skills en habilidades de un verbo` | avisa | — |
| Local-0036 | `Herramientas Base` / `Reglas Base` / `preferencias Base` / `piezas Base` | etiqueta de origen de un grupo de registros. **`Base` sola no se veta**: la palabra es corriente (`base de conocimiento`) y además nombra legítimamente la parte no-aprendida de un Agente con Propósito, como la usa el glosario | `Herramientas del Agente Multipropósito`, `Reglas del Agente Multipropósito`, … | avisa | — |
| Local-0037 | `Herramientas del Propósito` / `Reglas del Propósito` | etiqueta de origen de los registros que suma un Agente Desplegado. **`del Propósito` a secas no se veta**: aparece en `Producto del Propósito`, concepto ratificado aparte | `Herramientas del Agente Desplegado`, `Reglas del Agente Desplegado`, … | avisa | — |
| Local-0038 | `Adaptaciones de este repo` / `Adaptaciones del repo` | el encabezado con que un Índice separaba los registros que suma un Agente Desplegado | `Preferencias del Agente Desplegado` | avisa | — |
| Local-0039 | `pintar` | mostrar algo en la terminal o en pantalla | `mostrar`, `emitir` o `escribir en la terminal`, según el caso | avisa | — |
| Local-0040 | `calco` / `calcos` | una expresión copiada palabra por palabra del inglés (término de lingüística) | copia literal del inglés / copiado de | avisa | — |
| Local-0041 | `juguete` / `de juguete` | datos o repo armados para probar algo | de prueba | avisa | — |

Ratificados por el usuario (barridos del 2026-07-19 y 2026-07-20; `dogfooding` el 2026-07-21; `tripa` y los anglicismos de mecanismo —`static`, `binding`, `dispatcher`, `catch-all`, `feasibility`, `stress-test`, `thin`— el 2026-07-22; `churn` y `wedge` el 2026-07-23; los cinco ex-`Vetados` del glosario —`artefacto`, `gate`, `prosa`, `levelear`, `verbatim`— migrados al registro el 2026-07-23; `reconciler`, `install-prompts`, `dogfood` y `reforma de disco` el 2026-07-24; `cruce` y `huevo-y-gallina` el 2026-07-24; `capa`=fase el 2026-07-25; `ciclo-de-plan` el 2026-07-26; las etiquetas de origen —`Herramientas Base` y sus hermanas, `Herramientas del Propósito`, `Reglas del Propósito` y `Adaptaciones`— el 2026-07-28; `pintar` el 2026-07-29). `payload` y `lookup` se evaluaron y **no** se vetaron: se entienden y se usan. `Base` sola se evaluó y **no** se vetó: es palabra corriente y además nombra legítimamente la parte no-aprendida de un Agente con Propósito; vetarla marcaba 673 apariciones, casi todas válidas, y un registro que marca todo entrena a ignorarlo. El texto vivo ya está barrido; este registro existe para que el lint cace **regresiones**.

⚠️ **`Local-0036`, `Local-0037` y `Local-0038`** son la **excepción**: se vetaron el 2026-07-28 y el texto vivo **todavía no está barrido**. El barrido es el paso 2 del plan `Partir los índices por origen y pasar preferencias a tabla`; hasta que cierre, el lint marca apariciones pendientes de corregir. Se nombran por Código y no por posición: al sumarse filas nuevas, «las tres últimas» pasó a señalar otras tres.
