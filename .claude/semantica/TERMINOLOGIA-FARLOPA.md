# Terminología Farlopa

*Farlop Terminology* (EN). Registro par del glosario: las **relaciones término→significado vetadas** del dominio. Cada fila prohíbe un término **en un significado específico**, no el término en sí — el mismo término con otro significado puede ser legítimo (`plomería`=cañerías en un repo de fontanería es válido; `plomería`=infraestructura interna de software es farlopa). Por eso la columna del medio: fija el significado que se veta.

Son términos farlopa —ambiguos o semánticamente incomprensibles para el autor del repo— que los agentes van incorporando al dominio a medida que el proyecto avanza. Sin limpieza, el agente eventualmente los menciona y genera una inconfundible expresión de perplejidad en el autor frente a conceptos que le resultan absolutamente alienígenas. El fenómeno es universal —le pasa a cualquier repo trabajado con agentes— y es el **origen del subsistema semántica**. Ver la página de conocimiento [terminología farlopa](../conocimiento/terminologia-farlopa.md).

El **lint marca por término** (lo mecánico: encuentra la palabra en el texto vivo); **el agente juzga el significado** al leer la marca (¿está usada en el sentido vetado o en uno legítimo?). El registro se calibra por repo: un anglicismo es farlopa para un lector hispanohablante y puede no serlo para uno angloparlante.

## La columna `Control`

Dice qué hace el control del momento `al escribir` cuando encuentra el término **antes** de que el archivo exista:

- **`bloquea`** — la palabra está mal **siempre**, sin importar la frase, así que la escritura se rechaza y hay que corregirla antes. Son los anglicismos puros: `levelear` no tiene ningún uso válido en español.
- **`avisa`** — la misma palabra puede estar bien o mal según qué signifique (`capa de configuración` es legítimo; `la segunda capa del proceso` está vetado). La máquina no puede decidirlo: informa los términos hallados y el agente juzga.

Vacío se lee como `avisa`. **El bloqueo mira solo las apariciones fuera de comillas simples invertidas**, así que citar un término para hablar de él —como hace esta misma tabla, o la Base de preferencias al dar ejemplos— nunca se frena; se frena usarlo.

**Gobernanza:** vetar es potestad del usuario; el agente solo propone. El agente **nunca usa** un término en el significado que este registro veta.

## Relaciones vetadas

| Término | Significado vetado | Cómo decirlo | Control |
|---------|--------------------|--------------|---------|
| `artefacto` | un Componente del repo (archivo o directorio) | Componente | avisa |
| `gate` | un Control (chequeo que frena el avance) | Control | bloquea |
| `prosa` | el texto corriente de los `.md` | texto plano | avisa |
| `levelear` / `leveleo` / `leveling` | poner al día una instalación existente | nivelar | bloquea |
| `verbatim` / `byte-exact` / `byte-check` | copia idéntica carácter a carácter | Textual / carácter a carácter | bloquea |
| `dogfooding` / `dogfood` | cualquier uso | el Agente Multipropósito probándose a sí mismo / usarlo sobre el propio repo | bloquea |
| `Workflow` | cualquier uso (como encabezado o sustantivo) | flujo de trabajo | avisa |
| `bump` / `bumpear` | cualquier uso | subir la versión | bloquea |
| `reconcile-on-use` | cualquier uso | se ponen al día cuando se usan | bloquea |
| `slug` | cualquier uso (como identificador) | nombre estable (sin fecha) | bloquea |
| `baldes` | cualquier uso (como agrupación) | grupos | avisa |
| `linkea` / `linkear` | cualquier uso | apunta a / enlaza | bloquea |
| `semilla` | contenido inicial de un registro o archivo | contenido inicial | avisa |
| `stale` / `staleness` | cualquier uso | desactualizado / desactualización | bloquea |
| `cementerio de tools` | un conjunto de herramientas sin ordenar | herramientas desordenadas | avisa |
| `sigilo` | símbolo (calco de *sigil*) — no *sigilo*=discreción, que es legítimo | símbolo | avisa |
| `plomería` | infraestructura o mecánica interna de software | infraestructura interna | avisa |
| `tripa` / `tripas` | el contenido interno de una Herramienta (código + archivos de trabajo dentro de su carpeta, que ningún índice lista) | contenido interno de la Herramienta | avisa |
| `static` | cualquier uso | config fija / estático | avisa |
| `binding` | cualquier uso | atadura / vínculo | avisa |
| `dispatcher` | cualquier uso | hook repartidor | avisa |
| `catch-all` | cualquier uso | sin filtro / que atrapa todo | bloquea |
| `feasibility` | cualquier uso | viabilidad | bloquea |
| `stress-test` | cualquier uso | cuestionar a fondo | bloquea |
| `thin` / `thin-first` | cualquier uso | fino / empezar fino | avisa |
| `churn` | cualquier uso | trajín / movimiento (o «rotación» si es de clientes o datos) | bloquea |
| `wedge` | cualquier uso | cuña / palanca / punto de entrada (según contexto) | bloquea |
| `reconciler` | el nivelador consolidado (`amp-actualizar`) | nivelador (glosario: *Nivelar*) | bloquea |
| `install-prompts` | los inicializadores del setup | skills de instalación / inicializadores | bloquea |
| `reforma de disco` | reorganizar el árbol de carpetas del repo | reorganizar el árbol de carpetas | avisa |
| `cruce` | la pregunta pivote que reconfigura el resto del análisis; o la relación con decisiones ya tomadas | **pregunta de fondo** (la que manda) / **dependencias** (relación con lo ya decidido) | avisa |
| `huevo-y-gallina` / `huevo y gallina` | la dependencia circular donde A necesita a B y B necesita a A (calco de *chicken-and-egg*) | **dependencia circular** / problema de arranque | avisa |
| `capa` | una **fase** de un proceso (p. ej. las dos de poner al día un Agente con Propósito: plugins y archivos) — NO el nivel de integridad *mecánica* / *semántica*, que es legítimo y está asentado en una decisión | **fase** | avisa |
| `ciclo-de-plan` | el nombre de la habilidad que opera el subsistema planes | nombrar cada habilidad por su verbo (`registrar-plan`, `analizar-plan`…); el **ciclo** en sí es del subsistema, no de una habilidad — plan `Partir las mega-skills en habilidades de un verbo` | avisa |
| `Herramientas Base` / `Reglas Base` / `preferencias Base` / `piezas Base` | etiqueta de origen de un grupo de registros. **`Base` sola no se veta**: la palabra es corriente (`base de conocimiento`) y además nombra legítimamente la parte no-aprendida de un Agente con Propósito, como la usa el glosario | `Herramientas del Agente Multipropósito`, `Reglas del Agente Multipropósito`, … | avisa |
| `Herramientas del Propósito` / `Reglas del Propósito` | etiqueta de origen de los registros que suma un Agente Desplegado. **`del Propósito` a secas no se veta**: aparece en `Producto del Propósito`, concepto ratificado aparte | `Herramientas del Agente Desplegado`, `Reglas del Agente Desplegado`, … | avisa |
| `Adaptaciones` | los registros que un Agente Desplegado suma a un índice (`## Adaptaciones de este repo`) | `Preferencias del Agente Desplegado` | avisa |

Ratificados por el usuario (barridos del 2026-07-19 y 2026-07-20; `dogfooding` el 2026-07-21; `tripa` y los anglicismos de mecanismo —`static`, `binding`, `dispatcher`, `catch-all`, `feasibility`, `stress-test`, `thin`— el 2026-07-22; `churn` y `wedge` el 2026-07-23; los cinco ex-`Vetados` del glosario —`artefacto`, `gate`, `prosa`, `levelear`, `verbatim`— migrados al registro el 2026-07-23; `reconciler`, `install-prompts`, `dogfood` y `reforma de disco` el 2026-07-24; `cruce` y `huevo-y-gallina` el 2026-07-24; `capa`=fase el 2026-07-25; `ciclo-de-plan` el 2026-07-26; las etiquetas de origen —`Herramientas Base` y sus hermanas, `Herramientas del Propósito`, `Reglas del Propósito` y `Adaptaciones`— el 2026-07-28). `payload` y `lookup` se evaluaron y **no** se vetaron: se entienden y se usan. `Base` sola se evaluó y **no** se vetó: es palabra corriente y además nombra legítimamente la parte no-aprendida de un Agente con Propósito; vetarla marcaba 673 apariciones, casi todas válidas, y un registro que marca todo entrena a ignorarlo. El texto vivo ya está barrido; este registro existe para que el lint cace **regresiones**.

⚠️ Las tres últimas filas son la **excepción**: se vetaron el 2026-07-28 y el texto vivo **todavía no está barrido**. El barrido es el paso 2 del plan `Alinear los índices al Patrón y ordenar la nomenclatura de origen`; hasta que cierre, el lint marca apariciones pendientes de corregir.
