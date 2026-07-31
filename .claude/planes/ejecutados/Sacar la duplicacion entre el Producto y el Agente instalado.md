# Sacar la duplicación entre el Producto y el Agente instalado

**Estado: Nuevo · Creado 26-07-26.** Origen: sesión de `planificar` sobre el rework de memoria (26/07/2026), donde Javier preguntó *"no entiendo por qué estamos copiando lo mismo a 2 lugares"*.

## El problema

Cada texto del Agente Multipropósito vive **dos veces adentro de este repo**, y las dos copias hay que mantenerlas iguales a mano.

- **`.claude/<sub>/…`** — el Agente Multipropósito **instalado acá**. Está en uso: es lo que el agente de este repo lee en cada sesión.
- **`funcionalidades/amp/skills/inicializar/PLANTILLA.md`** — parte del **Producto del Propósito**. Es lo que se escribe en un repo nuevo al inicializarlo.

No se puede tener una sola copia con el diseño actual: `amp:inicializar` corre **en la máquina de destino**, donde `.claude/` de este repo no existe — ahí solo llegó la carpeta del plugin. El texto tiene que viajar adentro del instalador.

## Ya se desincronizó, y el control no lo vio

Medido el 26/07/2026, el mismo párrafo del manifiesto de planes:

- En `.claude/planes/MANIFIESTO.md`: *"`pendientes/` (planes vivos: `Nuevo`, `En curso`, `Diferido`)"*
- En `PLANTILLA.md`: *"`pendientes/` (vivos)"*

Y esa misma mañana el control de cierre había dado verde y `amp:actualizar` había reportado *"Repo al día: nada para nivelar"*. El nivelador chequea que el **Componente de Subsistema esté**, no que **diga lo mismo**: es el quinto caso del patrón ya asentado en el conocimiento `el-repo-que-un-script-describe` y `modos-de-falla-ante-reglas-escritas` — *chequear presencia en vez de completitud*, con su síntoma de siempre, una respuesta tranquilizadora sobre algo incompleto.

## El encuadre que lo resuelve (Javier, 26/07/2026)

> *"Es básicamente parte del Producto de ese Agente Multipropósito."*

El glosario define **Producto del Propósito** como *"lo que el repo produce para cumplir su Propósito… vive en la raíz del repo, fuera de `.claude/`"*. El Propósito de este repo es diseñar el Agente Multipropósito, así que `funcionalidades/` y la Plantilla **son** su Producto. Y `.claude/` es otra cosa: es el Agente Multipropósito **instalado acá**, igual que en Impresión3d o en el Coordinador.

**Este repo es un consumidor más de su propio Producto.** De ahí sale la dirección: la fuente es la Plantilla, y `.claude/` tendría que ser su **salida**, no un original paralelo que hay que empujar para arriba.

## Las dos direcciones posibles

1. **La Plantilla es la fuente; `.claude/` es su salida.** El repo autor se pone al día contra su propio Producto corriendo `amp:actualizar`, igual que cualquier Agente con Propósito. Es lo que `AGENTS.md` ya declara que es `.claude/` (*"el propio setup estándar, aplicado a este repo"*), solo que hoy no se cumple porque se edita `.claude/` directo. **Preferida.**
2. **`.claude/` es la fuente; un paso de construcción arma la Plantilla** antes de publicar. Requiere nombre para ese paso — `armar-plantilla` sería el candidato (verbo + objeto, decisión 0015).

Cualquiera de las dos mata la copia manual. La 1 además no agrega Componentes de Subsistema: usa el nivelador que ya existe.

## Consecuencia: `propagar-harness` se retira

Esa Herramienta existe **únicamente** por esta duplicación: copia un cambio textual de `.claude/` a la Plantilla y verifica que quedó igual. No tiene nada que ver con distribuir —eso lo hacen los plugins—: es un paso de construcción disfrazado de habilidad.

Con la dirección 1 no hay nada que propagar, así que se retira. Dos cosas la vuelven retirable **ya**, antes incluso de resolver el plan:

- Lo que aportaba de más —delegar la copia a un subagente fresco— está bloqueado en este entorno, que no permite subagentes sin pedido explícito. Hoy la habilidad ya se ejecuta a mano.
- El riesgo real (que las dos copias se separen sin que nadie lo note) lo cubre `lint-harness`, que chequea texto literal divergente entre plantillas. **Aunque hay que revisar por qué no pescó la divergencia de arriba** — o el manifiesto no está en el conjunto que compara, o hay un hueco.

Su nombre además usa el alias `harness` en lugar del nombre, contra la preferencia Base v5. No se renombra: se saca.

## A decidir

- Cuál de las dos direcciones.
- Si la 1: cómo se edita entonces un texto Base. Hoy se edita `.claude/` porque es lo que está a mano y se ve el efecto al instante; con la 1 hay que editar la Plantilla y **nivelarse a uno mismo** para verlo. Eso es más lento y hay que ver si se banca en la práctica.
- Qué pasa con los `.js` de los lints, que también están duplicados adentro de la Plantilla como bloques de código. ⚠️ Al copiarlos por marcadores, **el reemplazo va por función, nunca por string**: `String.replace` interpreta `$&` en el texto de reemplazo y varios lints contienen literalmente `'\\$&'`; con string el bloque se duplica adentro de sí mismo. Ya pasó y hubo que restaurar desde git.
- El hueco de `lint-harness` con el manifiesto divergente.

## Lo medido el 30/07/2026, y la dirección que eligió el usuario

Este plan quedó como el único pendiente del análisis crítico de ese día. Lo que se agregó:

**La premisa de arriba está incompleta.** El plan dice que no se puede tener una sola copia porque *ahí solo llegó la carpeta del plugin*. Medido: el **marketplace bajado** (`~/.claude/plugins/marketplaces/<marketplace>/`) tiene el **repo completo** —punto de entrada, `REGISTRO.md`, `docs/` y las nueve carpetas de `funcionalidades/`—, y `amp:actualizar` **ya lee de esa ruta**, describiéndola como *la del marketplace bajado, que siempre está*. Así que el texto no está obligado a viajar copiado adentro del instalador.

**La dirección que eligió el usuario es más fuerte que leer del marketplace.** No se trata de que el instalador lea los archivos en vez de llevarlos copiados: se trata de que **los lints no se copien nunca al repo** y se invoquen desde el plugin. Con eso la duplicación desaparece de raíz y actualizar un lint pasa a ser actualizar el plugin, sin nivelar archivos.

Y el marco con el que hay que decidirlo, en palabras del usuario: **el marketplace es la única forma de instalar el Agente Multipropósito.** La instalación por separado se dejó de mantener a propósito —con ella desaparecieron muchos scripts y bastante terminología ajena—, así que un problema que solo aparece en una forma no estándar de instalar es **secundario**: no puede seguir costando la estructura que hoy sostiene alternativas que nadie usa.

**Lo único que falta medir antes de prometer el cambio.** Hoy `settings.json` invoca el lint por la ruta `.claude/planes/lint-planes/lint-planes.js`. Si el archivo vive en el plugin, la ruta incluye la versión (`…/amp/0.12.0/…`), que cambia en cada publicación. Claude Code tiene una variable para eso; hay que confirmar **que funcione dentro de un hook** y qué hace Codex, que resuelve las rutas distinto. Sin eso resuelto, mover los lints deja los hooks apuntando a una ruta que se rompe en la próxima versión — el defecto que el manifiesto de herramientas ya advierte.

**Qué cambió mientras tanto, y qué no.** El riesgo de que las copias se separen sin aviso **ya está cubierto**: `lint-harness` ganó el control `SCRIPT EMBEBIDO DISTINTO DEL INSTALADO EN .claude/`, que compara cada script embebido contra su archivo entero y dice desde qué línea difiere. Se estrenó el mismo día y avisó tres veces. Eso responde el pendiente que este plan dejaba abierto —*hay que revisar por qué `lint-harness` no pescó la divergencia*—: no la pescaba porque comparaba las plantillas **entre sí** y por fragmentos, nunca la plantilla contra `.claude/`.

**Pero el control no reemplaza este plan:** mientras el texto viva dos veces, lo único que se puede hacer es ver la divergencia a tiempo. Medido ese día: al arreglar cinco scripts hubo que propagar cinco veces a mano, y en dos de ellas la copia habría salido publicada a medias si el control no hubiera existido.

## Estado — lo medido el 30/07/2026 (segunda tanda)

La premisa que sostenía todo el plan se cayó del todo: **no hay ninguna razón técnica para transcribir los scripts adentro del markdown.** El repo ya tiene el patrón correcto aplicado una vez.

### La prueba

`funcionalidades/amp/skills/actualizar/amp-actualizar.js` (28,8 KB) **es el único `.js` que viaja como archivo de verdad** adentro de un plugin, y funciona: se ejecutó en esta sesión desde el plugin bajado, en `<cache>/xelnagah-harness/amp/0.13.0/skills/actualizar/amp-actualizar.js`. Se lo puso como archivo porque un bloque de texto no se puede correr — o sea, se usó la forma correcta donde era obligatorio, no donde convenía.

### Qué está duplicado, exacto

De los 310,3 KB de `PLANTILLA.md`, **204,8 KB (66%) son copia byte a byte** de un archivo que ya existe en `.claude/`:

| Qué | Bloques | Peso |
|---|---|---|
| Scripts `.js` — 8 lints Base + 3 hooks + `actualizar-plugins` | 12 | 193,5 KB |
| Markdown idéntico — `PREFERENCIAS.md`, `herramientas/INDICE.md`, `lint-conducta/README.md` | 3 | 11,3 KB |

Los 12 `.js` están **hoy sin divergencia**, gracias al control `SCRIPT EMBEBIDO DISTINTO DEL INSTALADO EN .claude/`.

Los otros 9 bloques grandes (~12,8 KB) **no son duplicación**: son el contenido inicial —`ESTADOS.md`, el `PLANES.md` vacío, el glosario inicial, el índice de decisiones— que en el repo autor está poblado. Esos no pueden compartir archivo y se quedan en la plantilla.

Sacando lo duplicado, `PLANTILLA.md` queda en ~105 KB: el texto de instalación, el contenido inicial y los bloques `bash`/`json`.

### Dónde tienen que vivir los archivos

**Todos bajo el plugin `amp`, en la carpeta de la propia skill** (`funcionalidades/amp/skills/inicializar/`). No repartidos en cada `amp-<sub>`: los plugins se bajan a carpetas separadas **con la versión en la ruta**, así que para que `inicializar` alcance un archivo de `amp-planes` tendría que resolver la versión del plugin vecino — exactamente el problema de rutas versionadas que hace inviable mover los lints al plugin. Una skill sí conoce su propio directorio.

### Qué hay que tocar (medido)

- `lint-harness.js` — 4 de sus 14 controles miran la plantilla. `SCRIPT EMBEBIDO DISTINTO DEL INSTALADO EN .claude/` desaparece (pasa a comparación exacta de archivo); `BLOQUES VERBATIM DIVERGENTES ENTRE PLANTILLAS`, `DESTINOS DECLARADOS MAS DE UNA VEZ` y `BASE DE PREFERENCIAS DIVERGENTE` cambian de objeto.
- `funcionalidades/amp/skills/inicializar/SKILL.md` (12,3 KB) — sus pasos dicen "desde PLANTILLA" uno por uno.
- `funcionalidades/amp/skills/actualizar/` — `SKILL.md` y `amp-actualizar.js` tratan la plantilla como fuente canónica.
- `.claude/skills/propagar-harness/SKILL.md` (3,8 KB) — **se retira**: existe solo por esta duplicación.
- `.claude/skills/agregar-funcionalidad/SKILL.md`, `docs/INSTALAR.md`, `AGENTS.md`, `REGISTRO.md` — texto que la nombra.
- Dos planes pendientes quedan absorbidos o sin objeto: `Que la lista de Componentes de Subsistema salga de la plantilla` y `Que cada fila del indice Base de Herramientas tenga su bloque en la Plantilla`.

### Qué NO cambia

El repo consumidor queda **idéntico**: mismos archivos, mismas rutas bajo `.claude/`, mismo `settings.json`, hooks intactos. No hace falta medir ninguna variable de entorno ni tocar rutas con versión adentro.

## Implementación (30/07/2026)

Ejecutado. La decisión que salió del análisis es `Local-0045`.

**Lo que se hizo.** Los Componentes de Subsistema pasaron a viajar como **archivos** en `funcionalidades/amp/skills/inicializar/base/`, con el árbol de destino. `PLANTILLA.md` bajó de 310 KB a 12,8 KB y quedó solo con lo que no se puede copiar: el bloque que se fusiona en el punto de entrada, los dos archivos de hooks, los moldes con marcadores y las notas de reconciliación. Son 74 archivos, 389,7 KB.

**La regla, sin listas.** Qué se hace con cada archivo lo declara él mismo en su frontmatter — sin frontmatter u `origen: agente-multiproposito` se pisa entero; `origen: agente-desplegado` se pisa hasta el separador de su tabla y sus filas se preservan. Para que la norma no tuviera excepciones, `MOMENTOS.md`, `MOMENTOS-LOCAL.md`, `CLASES.md` y `ESTADOS.md` declaran su origen, y `ESTADOS.md` estrena su par `ESTADOS-LOCAL.md` con el control de estado repetido en `lint-planes` y sus tres casos de prueba.

**Lo que cerró de paso.** Cuatro huecos que ningún control veía: `instalar-plugins-codex` estaba declarado como Herramienta Base y su archivo nunca viajaba (plan `Local-0083`); el `README` de `actualizar-plugins` divergía 3 KB; el nivelador comparaba 11 archivos de una lista escrita a mano y ahora recorre los 74; y cinco de los ocho lints viajaban sin su `README`. Los 12 `pruebas.js` de los controles Base pasan a viajar también.

**Lo que reemplazó a `propagar-harness`.** La Herramienta `sincronizar-base` copia de `.claude/` a `base/` respetando la regla de origen. `lint-harness` cambió tres controles que parseaban bloques por cuatro que comparan archivo contra archivo en los dos sentidos, incluido el que caza un Índice del Agente Desplegado que viaja con filas — que se estrenó pescando un error real cometido a mano en esta misma sesión, con seis Herramientas de este repo coladas en lo que se instala.

**Cierre:** 13 bancos de prueba verdes (`lint-harness` pasó de 9 a 14 casos), control de cierre verde, `amp` a 0.14.0.

## Cruces

- `Canal de instalacion por copia` (Diferido) — otro canal de instalación; no cubre esto, pero si se hace, cambia dónde vive la fuente.
- `Rework de memoria` — de ahí salió. Le agrega un `README.md` por subsistema, que es un texto más a mantener en dos lados mientras esto no se resuelva.
- `Versionado del harness dentro del .claude del repo host` — la relación entre lo instalado y lo publicado.
