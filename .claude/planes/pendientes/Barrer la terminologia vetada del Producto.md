# Barrer la terminología vetada del Producto

**Estado: En curso · Creado 26-07-26.** Origen: sesión de `planificar` sobre el rework de memoria (26/07/2026). Javier: *"es que confunde que sigas llamándole harness. Referite con terminología del repo"*. Al medir el alcance apareció un segundo frente, más grande.

## Frente A — el Producto nunca se barrió

`PLANTILLA.md` es lo que `amp:inicializar` escribe en cada Agente con Propósito. Medido el 26/07/2026, **arrastra 41 apariciones de 16 términos vetados**:

| Término | Veces | Vetado desde |
|---|---|---|
| `prosa` | 12 | 2026-07-23 |
| `slug` · `capa` | 5 c/u | — · 2026-07-25 |
| `linkear` | 4 | — |
| `verbatim` | 3 | 2026-07-23 |
| `plomería` | 2 | — |
| `wedge` · `staleness` · `leveleo` · `levelear` · `gate` · `feasibility` · `dogfooding` · `cruce` · `churn` | 1 c/u | varias |

Los barridos de terminología se hicieron sobre `.claude/` —el Agente Multipropósito instalado acá— y **nunca sobre el Producto**. O sea que cada repo consumidor recibe, hasta hoy, textos escritos con el vocabulario que este repo prohibió hace tres días o más.

**El control no lo canta, y el escape es de severidad, no de cobertura.** `lint-semantica` **sí** barre la raíz —por eso encontró las 41 de la Plantilla y las de los `README.md` de las funcionalidades—, pero sale con **código 0** y las reporta como información, no como falla: hoy van **110 en texto plano y 171 en código**. Con ese volumen la sección es ruido de fondo y nadie la lee, así que el control de cierre da verde con el Producto sucio.

## Lo que pidió el autor (26/07/2026)

> *"Los archivos del Agente Multipropósito que ponemos en la raíz tienen que estar en el lint y los chequeos también. Que no se nos escapen. Deben ser parte de los que me siguen propagando la terminología farlopa."*

O sea: el Producto no puede quedar fuera del control. Dos piezas:

1. **Que falle, no que informe.** Un término vetado en `.claude/` lo lee el autor; uno en la Plantilla lo hereda cada Agente con Propósito. Candidato: `lint-harness` —que ya mira `funcionalidades/`— falla ante vetados en el Producto, mientras `lint-semantica` los sigue reportando como información para el repo.
2. **Revisar la cobertura del resto.** `lint-semantica` llega a la raíz; `lint-planes` y `lint-preferencias` no la miran para nada, y `lint-decisiones`, `lint-conocimiento`, `lint-memoria` y `lint-conducta` apenas. Hay que verificar cuáles **deberían** mirarla y hoy no lo hacen.

## Ejecutado del Frente A (26/07/2026)

`lint-harness` ganó el chequeo **terminología vetada en el texto que viaja**: lee los términos de `TERMINOLOGIA-FARLOPA.md`, barre `funcionalidades/` y **cuenta como hallazgo**, así que el control de cierre se pone rojo (verificado con un archivo de prueba: 2 hallazgos, control rojo, `lint-semantica` sigue en verde e informativo). Detalle en el README de la Herramienta.

**Las 41 apariciones eran 14 reales.** El resto no era texto: la medición original usaba la clasificación de `lint-semantica`, que trata todo lo que está entre backticks como código y —al revés— no distingue el bloque ` ```markdown ` de la PLANTILLA, que **es** el texto literal que se escribe en el repo destino. Clasificando por lenguaje de bloque y separando identificadores (backticks, destino de link, campo `name` del frontmatter), quedaron 14 para reescribir y 2 usos que el propio registro de farlopa declara legítimos (`capa mecánica`/`capa semántica`, además vocabulario de la decisión 0003 y de 4 planes vivos), que van en la lista `USOS_LEGITIMOS` del lint.

Barridas: `prosa` → *texto plano* (7), `capa` `.codex/` → *carpeta* (3), `cruce` → *encuentre* (Base de preferencias).

**Se descartó un marcador en el archivo** (`<!-- vetado-ok -->`) para eximir citas deliberadas: el único caso que lo pedía —el párrafo de la PLANTILLA que citaba las Bases viejas para reconocerlas— se resolvió **reescribiendo el párrafo**, que ahora identifica la versión por el encabezado y dejó de envejecer con cada Base nueva. Criterio del autor (26/07/2026): antes de agregar una excepción a un control, corregir el texto que la pide.

De paso, la Base pasa a **v6**: entra la preferencia de mostrar el texto exacto antes de asentar en un registro canónico. Versiones subidas: `amp` 0.6.17, `amp-semantica` 0.5.1 (falta publicar y actualizar).

**Lo que queda del Frente A:** la cobertura del resto de los lints sobre la raíz. Medición del 26/07/2026: la raíz de este repo (`README.md`, `REGISTRO.md`, `AGENTS.md`, `docs/`) está **limpia**, salvo 6 apariciones de `ciclo-de-plan`, que es el nombre vigente de la habilidad hasta que se ejecute `Partir las mega-skills en habilidades de un verbo`.

## Frente B — el alias «harness» ocupa el lugar del nombre

### La regla que se está incumpliendo

La preferencia **Base v5** dice: *"La sigla nunca sola en lo que queda escrito… Que un alias esté registrado en el glosario dice qué significa ese término, **no** autoriza a sustituir el nombre por él en el texto escrito."*

`harness` está registrado en el glosario como **alias** de *Agente Multipropósito*. Eso lo hace legítimo para entender qué significa cuando aparece; no lo habilita a ocupar el lugar del nombre. Hoy lo ocupa en cientos de lugares.

## Alcance medido (26/07/2026)

Los archivos más cargados, en `.md`, sin contar `tmp/`:

| Archivo | Apariciones |
|---|---|
| `.claude/planes/PLANES.md` | 35 |
| `funcionalidades/amp/skills/inicializar/PLANTILLA.md` | **29** |
| `.claude/decisiones/INDICE.md` | 18 |
| `docs/INSTALAR.md` | 12 |
| `REGISTRO.md` | 10 |
| `.claude/semantica/GLOSARIO.md` | 7 |

Más una cola larga de planes ejecutados y pendientes.

**La prioridad no es este repo: es `PLANTILLA.md`.** Esas 29 apariciones **viajan**. Cada Agente con Propósito que se inicialice recibe textos que llaman "harness" a lo que debería llamar por su nombre, y ahí el lector no tiene el glosario a mano para traducirlo.

## No es un reemplazo a ciegas: tres poblaciones

1. **Sustitución en prosa** — `harness` puesto donde iba *Agente Multipropósito*. Es lo que viola la preferencia. **Se reescribe.**
2. **Nombres de identificador** — `lint-harness`, `propagar-harness`, y el marketplace `xelnagah-harness`. Son interfaces: renombrarlos rompe cosas. El del marketplace **rompe a los consumidores ya instalados** y ya figura como pendiente en el plan `Nombres y distribucion de las skills del harness`. `propagar-harness` se retira por el plan de la duplicación, así que se resuelve solo.
3. **Uso legítimo del género** — el propio glosario dice: *"'Harness' es el término genérico —un setup de subsistemas cualquiera—; en este repo **denota** el AMP: no todo harness es un AMP, pero todo AMP es un harness."* Cuando el texto habla del género —comparar contra otros proyectos, como en el conocimiento `proyectos-similares-al-harness`— es correcto y **se deja**.

El barrido necesita juicio por aparición: es trabajo de `converger-terminologia`, no de buscar y reemplazar.

## Registros históricos: no se tocan

Los planes **ejecutados** y **descartados** son registro de lo que pasó, con la redacción de su momento. Reescribirlos falsea el registro. Se barre lo **vivo**: `PLANTILLA.md`, `AGENTS.md`, `REGISTRO.md`, `docs/`, los manifiestos, el glosario, las decisiones vigentes y los planes pendientes.

## A decidir

- **Si el Producto merece un control más duro que el repo.** Es lo único que viaja: un término vetado en `.claude/` lo lee el autor, uno en la Plantilla lo hereda cada Agente con Propósito. Candidato: que `lint-harness` —que ya mira el Producto— falle ante vetados en la Plantilla, mientras `lint-semantica` los sigue reportando como información.
- Si la fila **Agente Multipropósito** del glosario tiene que distinguir `harness`-alias de `harness`-género. Hoy la definición explica la diferencia en prosa pero la columna `Alias` lo lista pelado, así que un lint que marque por término no puede separarlos.
- Si conviene un control que impida la reincidencia. Marcar cada aparición como hallazgo es ruidoso —el uso genérico es legítimo—; el candidato es una regla de conducta en el momento de escribir, no un lint.
- El orden: la Plantilla primero (es lo que viaja), el resto después.

## El momento de escribir no cubre lo que se publica

Apareció al verificar el Frente A el 26/07/2026, y no lo cubre ningún plan. La regla Base de conducta que actúa en el momento `al escribir` arranca diciendo *"Acabás de escribir un `.md` del harness (`.claude/`)"*: **nombra solo el Agente Multipropósito instalado acá y no menciona lo que este repo publica**, que es por donde entró toda la terminología vetada. La regla se entrega igual —el hook la dispara al escribir cualquier `.md`—, pero el texto que llega le señala al agente el lugar equivocado.

Falta además la acción `bloquear` que la decisión 0025 previó para términos vetados conocidos: hoy la única clase implementada en ese momento es `inyectar`.

Consecuencia: el control nuevo agarra el término **después** de escrito, cuando corre el control de cierre. En el momento de escribirlo no hay cobertura. Es el frente que conviene encarar primero, porque los otros dos barren texto que se va a volver a escribir.

Se cruza con `Crecer el subsistema conducta`, que es el dueño de las clases de acción que faltan.

## Cruces

- `Nombres y distribucion de las skills del harness` — dueño del renombre del marketplace, que es la población 2.
- `Sacar la duplicacion entre el Producto y el Agente instalado` — mientras la Plantilla y `.claude/` sean dos originales, el barrido hay que hacerlo dos veces.
- `Publicar el harness en ingles` — el nombre en inglés (*Multipurpose Agent*) arrastra la misma discusión.
