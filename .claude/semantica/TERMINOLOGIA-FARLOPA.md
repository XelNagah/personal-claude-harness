# Terminología Farlopa

*Farlop Terminology* (EN). Registro par del glosario: las **relaciones término→significado vetadas** del dominio. Cada fila prohíbe un término **en un significado específico**, no el término en sí — el mismo término con otro significado puede ser legítimo (`plomería`=cañerías en un repo de fontanería es válido; `plomería`=infraestructura interna de software es farlopa). Por eso la columna del medio: fija el significado que se veta.

Son términos farlopa —ambiguos o semánticamente incomprensibles para el autor del repo— que los agentes van incorporando al dominio a medida que el proyecto avanza. Sin limpieza, el agente eventualmente los menciona y genera una inconfundible expresión de perplejidad en el autor frente a conceptos que le resultan absolutamente alienígenas. El fenómeno es universal —le pasa a cualquier repo trabajado con agentes— y es el **origen del subsistema semántica**. Ver la página de conocimiento [terminología farlopa](../conocimiento/terminologia-farlopa.md).

El **lint marca por término** (lo mecánico: encuentra la palabra en el texto vivo); **el agente juzga el significado** al leer la marca (¿está usada en el sentido vetado o en uno legítimo?). El registro se calibra por repo: un anglicismo es farlopa para un lector hispanohablante y puede no serlo para uno angloparlante.

**Gobernanza:** vetar es potestad del usuario; el agente solo propone. El agente **nunca usa** un término en el significado que este registro veta.

## Relaciones vetadas

| Término | Significado vetado | Cómo decirlo |
|---------|--------------------|--------------|
| `artefacto` | un Componente del repo (archivo o directorio) | Componente |
| `gate` | un Control (chequeo que frena el avance) | Control |
| `prosa` | el texto corriente de los `.md` | texto plano |
| `levelear` / `leveleo` / `leveling` | poner al día una instalación existente | nivelar |
| `verbatim` / `byte-exact` / `byte-check` | copia idéntica carácter a carácter | Textual / carácter a carácter |
| `dogfooding` / `dogfood` | cualquier uso | el harness probándose a sí mismo / usarlo sobre el propio repo |
| `Workflow` | cualquier uso (como encabezado o sustantivo) | flujo de trabajo |
| `bump` / `bumpear` | cualquier uso | subir la versión |
| `reconcile-on-use` | cualquier uso | se ponen al día cuando se usan |
| `slug` | cualquier uso (como identificador) | nombre estable (sin fecha) |
| `baldes` | cualquier uso (como agrupación) | grupos |
| `linkea` / `linkear` | cualquier uso | apunta a / enlaza |
| `semilla` | contenido inicial de un registro o archivo | contenido inicial |
| `stale` / `staleness` | cualquier uso | desactualizado / desactualización |
| `cementerio de tools` | un conjunto de herramientas sin ordenar | herramientas desordenadas |
| `sigilo` | símbolo (calco de *sigil*) — no *sigilo*=discreción, que es legítimo | símbolo |
| `plomería` | infraestructura o mecánica interna de software | infraestructura interna |
| `tripa` / `tripas` | el contenido interno de una Herramienta (código + archivos de trabajo dentro de su carpeta, que ningún índice lista) | contenido interno de la Herramienta |
| `static` | cualquier uso | config fija / estático |
| `binding` | cualquier uso | atadura / vínculo |
| `dispatcher` | cualquier uso | hook repartidor |
| `catch-all` | cualquier uso | sin filtro / que atrapa todo |
| `feasibility` | cualquier uso | viabilidad |
| `stress-test` | cualquier uso | cuestionar a fondo |
| `thin` / `thin-first` | cualquier uso | fino / empezar fino |
| `churn` | cualquier uso | trajín / movimiento (o «rotación» si es de clientes o datos) |
| `wedge` | cualquier uso | cuña / palanca / punto de entrada (según contexto) |
| `reconciler` | el nivelador consolidado (`amp-actualizar`) | nivelador (glosario: *Nivelar*) |
| `install-prompts` | los inicializadores del setup | skills de instalación / inicializadores |
| `reforma de disco` | reorganizar el árbol de carpetas del repo | reorganizar el árbol de carpetas |
| `cruce` | la pregunta pivote que reconfigura el resto del análisis; o la relación con decisiones ya tomadas | **pregunta de fondo** (la que manda) / **dependencias** (relación con lo ya decidido) |
| `huevo-y-gallina` / `huevo y gallina` | la dependencia circular donde A necesita a B y B necesita a A (calco de *chicken-and-egg*) | **dependencia circular** / problema de arranque |

Ratificados por el usuario (barridos del 2026-07-19 y 2026-07-20; `dogfooding` el 2026-07-21; `tripa` y los anglicismos de mecanismo —`static`, `binding`, `dispatcher`, `catch-all`, `feasibility`, `stress-test`, `thin`— el 2026-07-22; `churn` y `wedge` el 2026-07-23; los cinco ex-`Vetados` del glosario —`artefacto`, `gate`, `prosa`, `levelear`, `verbatim`— migrados al registro el 2026-07-23; `reconciler`, `install-prompts`, `dogfood` y `reforma de disco` el 2026-07-24; `cruce` y `huevo-y-gallina` el 2026-07-24). `payload` y `lookup` se evaluaron y **no** se vetaron: se entienden y se usan. El texto vivo ya está barrido; este registro existe para que el lint cace **regresiones**.
