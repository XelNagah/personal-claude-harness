# Plantilla del setup completo

textos literales que el orquestador escribe. (Réplica de los textos de las piezas individuales; mantener sincronizado al cambiar una preferencia.)

## §Preferencias — `.claude/preferencias/PREFERENCIAS.md` + sección de AGENTS.md

Sistema versionado: **Base** (del harness; el nivelado la actualiza por versión) + **Adaptaciones de este repo** (nunca se toca). Importado siempre al contexto — las preferencias son reglas de conducta: inline, no índice+fetch. Al editar la Base acá, **incrementar la versión**.

Contenido inicial de `.claude/preferencias/PREFERENCIAS.md`:

```markdown
# Preferencias

Reglas de conducta del agente en este repo. Siempre en contexto (importado desde AGENTS.md). La sección **Base** viene del harness y se actualiza al nivelar (no editarla acá: los ajustes de este repo van en **Adaptaciones**, que el nivelado nunca toca).

## Base (harness v5)

**Comunicación:**

- Al preguntar por una decisión o analizar alternativas, dar SIEMPRE ejemplos concretos de cada postura (numéricos si aplica): cómo es ahora vs. cómo quedaría y por qué, encadenando consecuencias ("A ⇒ B; si no fuera B ⇒ no A porque X"). Objetivo: ubicar inmediatamente al lector en la mecánica relevante sin que tenga que reconstruir contexto.
- Al pedir una decisión al usuario, **el contexto va en el texto de la respuesta**, nunca comprimido dentro de las opciones de una pregunta. Y **de a una decisión por vez**, aunque sean independientes entre sí. Única excepción: una cola de confirmaciones donde la respuesta esperada es "sí" a todas puede ir junta, con la recomendada visible.
- Ante un informe o visualización de **formato nuevo**: mostrar primero el esqueleto con datos de juguete marcados como DUMMY, acordar la representación, recién después calcular en serio. **Nunca re-producir completo un formato rechazado**: volver al esqueleto y realinear.
- Tareas en background: esperar la notificación de finalización; no reportar ni consultar estado a cada rato — solo ante sospecha de cuelgue.

**Principios de trabajo:**

- Conceptual antes que implementación. Ante ambigüedad de diseño, preguntar antes de asumir. Minimizar cambios sustractivos.
- Iterar de alto a bajo nivel: interfaces y contratos antes que implementación.
- Nomenclatura en español para el dominio; inglés solo para infraestructura técnica.
- Cero invención de datos: lo que no salga de una fuente verificada se marca como faltante o como interpretación propia.
- Terminología: no acuñar términos del dominio por cuenta propia; preferir las palabras del usuario. **Español corriente en todo**: nada de palabras inventadas o raras (aunque suenen técnicas), ni en texto plano ni en diagramas — no solo en los registros. **Control duro en registros canónicos** (glosario, decisiones): ningún término acuñado por el agente se asienta sin ratificación del usuario. En texto plano/diagramas se puede usar, marcado como propuesto.
- **La sigla nunca sola en lo que queda escrito.** En documentación, registros, comentarios y textos que viajan a otros repos, el nombre del dominio va **completo**. La sigla puede **acompañarlo** —`Agente Multipropósito (AMP)`— y conviene presentarla así en la primera mención, para que el lector la reconozca cuando la cruce; lo que no se hace es usarla **en lugar** del nombre. En la conversación es libre. Que un alias esté registrado en el glosario dice qué significa ese término, **no** autoriza a sustituir el nombre por él en el texto escrito.

## Adaptaciones de este repo

(ninguna todavía — agregar acá lo específico de este proyecto)
```

Sección de `AGENTS.md`:

```markdown
## Preferencias (siempre cargadas)

@.claude/preferencias/PREFERENCIAS.md

Al tocar las preferencias, correr el lint estructural **desde la raíz del repo** (chequea secciones Base/Adaptaciones + el `@import`):

​```bash
node .claude/preferencias/lint-preferencias/lint-preferencias.js
​```
```

(El prefijo `.claude/` es porque `AGENTS.md` vive en la raíz — la ruta del `@import` es relativa al archivo que importa. Layout legacy con `CLAUDE.md` dentro de `.claude/`: `@preferencias/PREFERENCIAS.md`.)

(El lint `lint-preferencias.js` está más abajo, en §Script — lint-preferencias; y `lint-memoria.js` en §Script — lint-memoria.)

**Bases anteriores** (para la reconciliación): la v0 eran dos secciones inline en CLAUDE.md — "Preferencias de comunicación" (el primer bullet de Comunicación, como cita) y "Principios de trabajo" (los cuatro bullets). Textualmente iguales → migrar sin preguntar (borrar de CLAUDE.md, dejar el import); con diferencias → las diferencias van a Adaptaciones y se reporta. La **v2** difiere de la v3 solo en el bullet de Terminología (decía "**Gate duro** en registros canónicos" y "ni en prosa ni en diagramas", donde la v3 dice "**Control duro**" y "ni en texto plano ni en diagramas") y en el encabezado ("al levelear / el leveleo" → "al nivelar / el nivelado"): reemplazar la Base entera por la v3 sin preguntar.

## §Subsistemas — bloque `## Subsistemas` en `AGENTS.md`

Reemplaza el viejo "Mapa del repo" **y** las secciones de prosa por-subsistema. La primera funcionalidad de subsistema que se instala crea la sección; cada una la asegura y agrega su propia línea `@.claude/<sub>/MANIFIESTO.md`. Cada manifiesto declara si su índice se carga (incluyendo o no `@INDICE.md`), así que la carga de datos ya no se decide acá.

```markdown
## Subsistemas (manifiestos siempre cargados)

Cada subsistema tiene un **Manifiesto** (`.claude/<sub>/MANIFIESTO.md`): una descripción breve —qué es, cómo se usa, cuándo consultarlo— que va **siempre en contexto** y que **declara si su índice también se carga** incluyendo —o no— la línea `@INDICE.md`. Lo que se carga siempre es el manifiesto, no necesariamente el índice.

Si tu agente no expande imports, **leé estos manifiestos al inicio de la sesión** (y, si el manifiesto importa su índice, ese índice también).

@.claude/memoria/MANIFIESTO.md
@.claude/planes/MANIFIESTO.md
@.claude/conocimiento/MANIFIESTO.md
@.claude/semantica/MANIFIESTO.md
@.claude/decisiones/MANIFIESTO.md
@.claude/herramientas/MANIFIESTO.md
@.claude/conducta/MANIFIESTO.md
```

(La ruta del `@import` es relativa al archivo que importa — `AGENTS.md` está en la raíz, por eso el prefijo `.claude/`. Las **preferencias siempre cargadas** van inline vía §Preferencias, no como manifiesto acá; las reglas del subsistema `conducta` las reparte su hook en cada momento —no se recitan desde el índice—, por eso su manifiesto sí va en esta lista pero su registro no se carga.)

## §Manifiesto (memoria) — `.claude/memoria/MANIFIESTO.md`

````markdown
# Memoria — manifiesto de subsistema

La memoria local vive en este directorio (`memoria/`), indexada por `MEMORIA.md`: hechos que hay que recordar entre sesiones. Cada memoria es un `.md` con frontmatter (`name`, `description`, `metadata.type`); el índice lleva solo punteros, nunca contenido.

**Disparador:** consultar `MEMORIA.md` al inicio de cada sesión y respetarlo. Escribir cuando surge algo para recordar entre sesiones; antes de crear una, revisar si una existente ya lo cubre — actualizar en vez de duplicar. Fechas siempre absolutas.

**Skills:** `registrar-memoria` (asienta un hecho como memoria tipada, detecta duplicados, indexa y corre el lint); instalación con `inicializar-memoria-local`.

**Índice: se carga siempre** (liviano). Al cerrar una tarea que tocó la memoria, correr el lint desde la raíz del repo:
```bash
node .claude/memoria/lint-memoria/lint-memoria.js
```

@MEMORIA.md
````

## §Manifiesto (planes) — `.claude/planes/MANIFIESTO.md`

````markdown
# Planes — manifiesto de subsistema

Los planes se persisten en este directorio (`planes/`): `pendientes/` (vivos), `ejecutados/` y `descartados/` (con motivo). Nombre estable sin fecha; estado y fechas en el registro `PLANES.md`; los estados disponibles en `ESTADOS.md` (que el lint lee).

**Disparador:** el agente sabe que los planes existen; consultar `PLANES.md` a demanda cuando un plan se vuelve relevante (retomar, cerrar, o al detectar que un pendiente ya se implementó). Escribir al abrir un plan o transicionarlo de estado.

**Skills:** `ciclo-de-plan` (abre un plan —archivo con nombre estable + fila en `PLANES.md`— y lo transiciona de estado); instalación con `inicializar-gestion-planes`.

**Flujo de trabajo:** multi-paso (abrir → transicionar → cerrar con lint); detalle en la memoria `feedback_flujo_planes.md`.

**Índice: NO se carga siempre** — `PLANES.md` es el registro que más crece; se consulta a demanda, no en cada arranque. Al cerrar una tarea que tocó planes, correr el lint desde la raíz del repo:
```bash
node .claude/planes/lint-planes/lint-planes.js
```
````

## §Manifiesto (conocimiento) — `.claude/conocimiento/MANIFIESTO.md`

````markdown
# Conocimiento — manifiesto de subsistema

Todo lo que el agente **sabe** del dominio vive en una ubicación única: este directorio (`conocimiento/`), indexado por `INDICE.md`. No en la raíz del repo (los `.md` de la raíz son documentación del proyecto, no conocimiento de agente).

**Disparador:** asentar al averiguar algo del dominio que costó descubrir y que va a hacer falta de nuevo — cómo funciona un sistema externo, un formato, una restricción real. La prueba que lo separa de la memoria: **¿seguiría siendo cierto si este repo no existiera?** Sí → conocimiento. Un hallazgo que se explica y no se asienta se vuelve a averiguar la sesión siguiente.

**Skills:** `registrar-conocimiento` (asienta una página del dominio, evita duplicar, indexa y corre el lint) y `buscar-conocimiento` (recorre el repo y propone páginas nuevas); instalación con `inicializar-conocimiento`.

**Índice: se carga siempre** (liviano). Al cerrar una tarea que escribió conocimiento, correr el lint desde la raíz del repo:
```bash
node .claude/conocimiento/lint-conocimiento/lint-conocimiento.js
```

@INDICE.md
````

## §Manifiesto (semántica) — `.claude/semantica/MANIFIESTO.md`

````markdown
# Semántica — manifiesto de subsistema

El subsistema `semántica` mantiene la coherencia semántica del dominio en el tiempo. Vive en este directorio (`semantica/`) con **dos registros pares**, ninguno cargado en contexto siempre: `GLOSARIO.md` (terminología legítima —concepto → definición, con alias y propuestos—) y `TERMINOLOGIA-FARLOPA.md` (relaciones vetadas, columnas `Término | Significado vetado | Cómo decirlo`). **Lo vetado es la relación término→significado, no el término**: el mismo término con otro significado puede ser legítimo; por eso la columna del medio, y por eso nada vetado se queda en el glosario.

**Disparador:** consultar ambos registros al planificar y analizar; no acuñar términos propios, preferir los del usuario. Proponer una entrada (columna `Propuestos` del glosario) al detectar un término del dominio sin registrar. El agente solo **propone**: ratificar (a alias) y vetar (a Terminología Farlopa) son potestad del usuario.

**Skills:** `converger-terminologia` (recorre el texto del repo contra los dos registros: detecta sinónimos, anglicismos y desvíos, y propone ratificar, vetar o reescribir); instalación con `inicializar-semantica`.

**Índice: NO se carga siempre** — los registros se consultan a demanda. El **lint marca por término** (lo mecánico); el **agente juzga el significado** al leer la marca. Al cerrar una tarea que tocó semántica, correr el lint desde la raíz del repo:

```bash
node .claude/semantica/lint-semantica/lint-semantica.js
```

Convención en la memoria `feedback_semantica.md`.
````

## §Manifiesto (decisiones) — `.claude/decisiones/MANIFIESTO.md`

````markdown
# Decisiones — manifiesto de subsistema

Las decisiones **estructurales al propósito del repo** (no las operativas triviales) se asientan en `INDICE.md`: una tabla donde cada fila es una decisión (N°, qué + por qué, fecha, estado, y link a detalle si requiere conceptualización mayor).

**Disparador:** consultar las decisiones al planificar y analizar, para no re-decidir ni contradecir lo asentado. Registrar al tomar una decisión que condiciona el repo a futuro; para revertir no se borra, se marca `reemplazada por NNNN`.

**Skills:** `registrar-decision` (juzga si es estructural, chequea que no re-decida ni contradiga, numera, redacta y corre el lint); instalación con `inicializar-decisiones`.

**Índice: NO se carga siempre** — se consulta al planificar y analizar. Al cerrar una tarea que registró decisiones, correr el lint desde la raíz del repo:
```bash
node .claude/decisiones/lint-decisiones/lint-decisiones.js
```
````

## §Manifiesto (herramientas) — `.claude/herramientas/MANIFIESTO.md`

````markdown
# Herramientas — manifiesto de subsistema

Las **Herramientas** del repo — las *tools* que el Propósito requiere (tipos `script`, `skill` local, `MCP` local) — viven en este directorio (`herramientas/`), listadas en `INDICE.md` (tabla Herramienta | Tipo | Qué hace | Cómo se invoca | Estado). Los **lints de subsistema no son Herramientas**: son infra del Patrón y viven con su subsistema.

El registro se separa **por origen** en dos secciones: **Herramientas Base** (las manda el harness; el nivelador reemplaza esa sección entera) y **Herramientas del Propósito** (las suma cada repo; el nivelador no las toca). Una Herramienta nueva del repo va siempre a la segunda.

**Disparador:** consultar el índice para saber qué tools existen y cómo se invocan; registrar una Herramienta al fabricar o adoptar una tool repetible del Propósito. ⚠️ Una tool referenciada por ruta en `settings`, `.gitignore` o un hook no se mueve sin actualizar esa referencia (rompe el match por prefijo).

**Skills:** ninguna de operación — el registro (`INDICE.md`) se edita a mano; instalación con `inicializar-herramientas`.

**Índice: se carga siempre** (liviano). Al cerrar una tarea que tocó Herramientas, correr el lint desde la raíz del repo:

```bash
node .claude/herramientas/lint-herramientas/lint-herramientas.js
```

Convención en la memoria `feedback_herramientas.md`.

@INDICE.md
````

## §Manifiesto (conducta) — `.claude/conducta/MANIFIESTO.md`

````markdown
# Conducta — manifiesto de subsistema

El subsistema `conducta` asegura comportamientos del tipo "cuando hagas X, asegurate de Y": ata **momentos** del flujo (evento de hook + condición sin juicio) a **acciones** (inyectar un texto, correr una Herramienta, bloquear). Vive en este directorio (`conducta/`): el registro de reglas en `INDICE.md`, el vocabulario de momentos en `MOMENTOS.md`, y el hook repartidor `establecer-conducta/`, que entrega en cada momento la regla que corresponde. Viene con una **Base** instalada (respetar preferencias, contrastar al escribir, registrar cambios) y admite reglas del Propósito de cada repo. Modelo completo en la memoria `feedback_conducta.md`.

**Disparador:** en el flujo normal el agente **no** consulta este registro a mano — lo entrega el hook. Se edita al **agregar, modificar o dar de baja una regla**; toda regla nueva que toque terminología o decisiones pasa por el usuario (el agente propone; ratificar es potestad del usuario).

**Skills:** ninguna de operación aún — las entrega el hook repartidor `establecer-conducta`; instalación con `inicializar-conducta`.

**Índice: NO se carga siempre**: cargar las reglas al arranque es el modo de falla que este subsistema corrige (una regla cargada al inicio se recita, no se obedece — conocimiento `modos-de-falla-ante-reglas-escritas`). El registro se consulta a demanda solo para gestionarlo. Al cerrar una tarea que tocó `conducta`, correr el lint desde la raíz del repo:

```bash
node .claude/conducta/lint-conducta/lint-conducta.js
```
````

## §Formato — frontmatter de una memoria

```markdown
---
name: <nombre-estable-kebab-case>
description: <resumen de una línea — se usa para decidir relevancia>
metadata:
  type: user | feedback | project | reference
---

<el hecho; para feedback/project seguir con líneas **Why:** y **How to apply:**>
```

Tipos: `user` (quién es el usuario), `feedback` (correcciones y enfoques confirmados, con el porqué), `project` (objetivos/restricciones no derivables del código), `reference` (punteros externos). Antes de crear una nueva, revisar si una existente ya la cubre. Fechas siempre absolutas.

## Memorias textuales

### `feedback_flujo_planes.md`

```markdown
---
name: flujo-planes
description: "Cómo gestionar planes — .claude/planes/ (pendientes/ejecutados/descartados), registro PLANES.md, estados en ESTADOS.md (máquina de un eje), nombre estable, lint al cerrar"
metadata:
  type: feedback
---

Persistir y gestionar planes bajo `.claude/planes/` con tres subcarpetas: `pendientes/` (planes vivos: `Nuevo`, `En curso`, `Diferido`), `ejecutados/` y `descartados/` (registro, siempre con motivo). Lo fino (estado, fechas, origen) vive en el registro `planes/PLANES.md`, no en el nombre del archivo. Los **estados disponibles y su semántica** (a qué carpeta mapea cada uno, cuáles son terminales) están en `planes/ESTADOS.md` — fuente de verdad configurable que el lint lee.

**Máquina de un solo eje:** un plan está en exactamente un estado. `Nuevo` (creado, sin ejecutar; la revisión con `planificar` ocurre acá) → `En curso` (se tomó el plan y se está ejecutando) → `Ejecutado` (terminal). `Diferido` = pospuesto, retomable. `Descartado` = abandonado con motivo (terminal). No hay estado de "diseño": la revisión es parte de estar `Nuevo`.

**Why:** trazabilidad de qué se planificó, cuándo se creó y cuándo y cómo se cerró — sin depender de archivos efímeros de plan-mode del harness, y sin mirar carpetas a ojo: el registro es la vista, y está siempre en contexto vía el Mapa del repo. Un solo eje (en vez de prioridad × progreso) porque en la práctica un plan pausado siempre está sin empezar, y la distinción diseño/ejecución no aporta al flujo.

**How to apply:**

1. **Al crear un plan:** copiar a `.claude/planes/pendientes/<slug-estable>.md` (sin fecha en el nombre) y agregar su fila en `PLANES.md`: Estado (de `ESTADOS.md`), Creado, Origen si se desprende de otro plan.
2. **Cada actualización al plan** se replica en la versión persistida — es la fuente de verdad, no el archivo del plans-folder del harness. Los cambios de estado se reflejan en `PLANES.md`, y el archivo se mueve a la carpeta que el estado indica.
3. **Al detectar evidencia de implementación** (commit, mensaje del user, código verificado, otro agente): pasar a `Ejecutado` y mover a `ejecutados/` **sin renombrar**, completar `Cerrado` en el registro y agregar sección **`## Notas de implementación`** (cómo se implementó vs planificado, hash de commit, cosas notables).
4. **Descartar es un cierre válido:** `Descartado`, mover a `descartados/`, completar `Cerrado` y una línea de motivo en Notas (p. ej. "superseded por <plan>").
5. **Reparar referencias entrantes** si las hubiera (el nombre estable minimiza esto; preferir enlazar planes vía `PLANES.md`).
6. **Al cerrar** una tarea que tocó planes, correr el lint: `node .claude/planes/lint-planes/lint-planes.js`.

Importante: borrar el archivo de `pendientes/` al moverlo — no duplicar. Un plan puede persistirse antes de arrancar la ejecución (p. ej. para cortar una sesión larga de diseño): Estado `Nuevo` o `Diferido` en el registro y bloque al tope con los pendientes para retomar.

Relacionado: [[archivo-de-estado]] (estado vivo de una exploración dentro del plan).
```

### `feedback_archivo_de_estado.md`

```markdown
---
name: archivo-de-estado
description: En tareas exploratorias multi-variable, mantener UN archivo de estado (tabla dimensión×resultado) actualizado antes de reportar en el chat; leerlo al retomar.
metadata:
  type: feedback
---

En tareas exploratorias multi-variable (benchmarks, comparaciones, análisis de escenarios), mantener **un** archivo de estado desde la primera corrida: tabla dimensión×resultado + fecha/hora por fila + "próxima acción".

**Why:** en sesiones largas el contexto conversacional es el peor lugar para el estado — se diluye, se pierde en compactaciones y no sobrevive a `/clear` ni al cambio de máquina. El archivo sí. Origen: sesión de benchmarking de ~11 hs (2026-06) donde la matriz combinación×prueba se perdió y costó ~8 turnos reconstruirla.

**How to apply:**

1. Actualizar el archivo **antes** de reportar cada resultado en el chat — el archivo es la fuente de verdad; el chat, el comentario.
2. Ubicación: si la exploración responde a un plan, sección `## Estado` dentro del plan; si es ad-hoc, `conocimiento/<tema>/estado.md` (al cerrar, destilar a conocimiento o borrar).
3. Al retomar (nueva sesión, otra máquina, post-`/clear`): leer el archivo antes que nada.

Relacionado: [[flujo-planes]].
```

### `feedback_estilo_commits.md`

```markdown
---
name: estilo-commits
description: Commits en español, sin co-autoría de IA; título <Área>: <Resumen> y cuerpo Antes/Ahora
metadata:
  type: feedback
---

Mensajes de commit y descripciones de PR de este proyecto: **en español** y **sin co-autoría** (`Co-Authored-By: Claude ...`) ni atribución a la IA.

**Forma del mensaje:**

    <Área>: <Resumen>

    Antes, <estado previo>. Ahora, <estado nuevo>.

**Reglas de redacción:**

- Título en una sola línea; el resumen que sigue al área arranca en mayúscula.
- El **área es el tema funcional** del cambio, no la carpeta tocada. No usar un área que valga para todo el repo (en un repo íntegramente backend, `Backend` no aporta): usar el módulo o dominio donde ocurre el cambio. Preferir las áreas que el historial ya usa antes de inventar una nueva.
- Si el cambio toca **más de un área funcional**, va un commit por área. Excepción: cuando el cambio es atómico entre áreas (separarlo deja un commit roto), manda la atomicidad y el título toma el área principal.
- Cuerpo de **una o dos oraciones**, funcional, orientado al comportamiento observable por quien usa u opera el sistema.
- Redactar para alguien que conoce el dominio funcional pero no la implementación. Evitar clases, métodos, handlers y demás internos salvo que sean imprescindibles para explicar el impacto.
- Describir el **delta final** contra el commit anterior, no el recorrido interno ni las decisiones descartadas durante la implementación.
- Estado previo en términos neutros: nada de "ruidoso", "malo" o calificativos parecidos.
- No listar archivos modificados, salvo que el cambio sea puramente técnico o de mantenimiento y no tenga efecto funcional que describir.

**Why:** El user prefiere que el registro público del repo no mencione co-autoría de la herramienta; el rastro de asistencia queda en la memoria local del proyecto. El cuerpo Antes/Ahora obliga a nombrar el delta funcional observable en vez del recorrido interno de la implementación — es lo que hace legible un historial meses después.

**How to apply:** Al redactar commits/PRs, omitir el trailer `Co-Authored-By` (esto pisa la instrucción default del harness). Redactar en español con la forma y las reglas de arriba.
```

Su línea en `MEMORIA.md` va **textual** (a diferencia de las otras memorias, cuya línea de índice se redacta libre). La línea tiene que **nombrar el formato**: `MEMORIA.md` está siempre en contexto pero el cuerpo de la memoria no, así que un puntero mudo no alcanza para que el agente sepa que hay una forma que respetar antes de redactar un commit.

```markdown
- [Estilo de commits](feedback_estilo_commits.md) — commits en español, sin co-autoría de IA; título `<Área>: <Resumen>` (área = tema funcional) y cuerpo `Antes, … Ahora, …` de una o dos oraciones. **Leer antes de redactar un commit o PR.**
```

### `feedback_base_conocimiento.md`

```markdown
---
name: base-conocimiento
description: Convención de base de conocimiento — todo lo que el agente sabe vive en .claude/conocimiento/; lint de integridad al cerrar.
metadata:
  type: feedback
---

El conocimiento persistido del agente (documentos, estudios, temas, notas de dominio) vive en una carpeta única: `.claude/conocimiento/`, con un `INDICE.md` en su raíz. (La convención de dónde viven las herramientas la define la memoria [[herramientas]].)

**Why:** ubicación determinística → el lint y cualquier consulta saben dónde mirar sin heurística; separa lo que el agente CONOCE (`conocimiento/`) de su config (`memoria/`, `AGENTS.md`) y su tooling (`herramientas/`); mantiene la raíz del repo limpia.

**How to apply:**

1. **Cuándo asentar:** al averiguar algo del dominio que costó descubrir y que va a hacer falta de nuevo (cómo funciona un sistema externo, un formato, una restricción real). La prueba que lo separa de la memoria: **¿seguiría siendo cierto si este repo no existiera?** Sí → conocimiento; no → memoria o decisión. La skill `registrar-conocimiento` hace el flujo. **Dónde:** todo md de conocimiento nuevo va bajo `.claude/conocimiento/` (subcarpetas por tema; cada una con su `INDICE.md` si crece). Nunca en la raíz del repo.
2. Mantener `.claude/conocimiento/INDICE.md` como índice raíz (una línea por página/sección; solo punteros).
3. **Al cerrar** una tarea que escribió conocimiento, correr el lint mecánico: `node .claude/conocimiento/lint-conocimiento/lint-conocimiento.js`. Chequea refs rotas, índice incompleto y huérfanos (sin LLM, sin red). Resolver los hallazgos.
4. El **chequeo semántico** (contradicciones entre páginas, duplicación, desactualización) se corre a pedido tras una incorporación grande, no en cada cierre.
5. **Migración:** un script de datos acoplado por `__dirname` (lee/escribe relativo a sí mismo) que se mueva a `.claude/herramientas/<tool>/` debe reapuntar sus paths a la carpeta de datos en `conocimiento/` (`__dirname + '/../../conocimiento/<subdir>/...'`), o se rompe.
```

### `feedback_conducta.md`

```markdown
---
name: conducta
description: Subsistema conducta en .claude/conducta/ — reglas "cuando hagas X, asegurate de Y" que atan momentos (evento de hook + condición sin juicio) a acciones (inyectar/correr/bloquear); las entrega un hook repartidor que lee el registro vivo, no el agente a mano; Base (harness) vs Propósito (repo); lint al cerrar.
metadata:
  type: feedback
---

El subsistema `conducta` asegura comportamientos del tipo **"cuando hagas X, asegurate de Y"**: ata **momentos** del flujo a **acciones**. Vive en `.claude/conducta/`:

- `INDICE.md` — el **registro de reglas**: cada fila ata un momento a una acción (`Regla | Momento | Clase | Contenido | Estado`). Separado por origen en dos secciones: **Reglas Base** (las manda el harness; el nivelador las reemplaza enteras) y **Reglas del Propósito** (las suma cada repo; el nivelador no las toca).
- `MOMENTOS.md` — el **vocabulario de momentos**: un momento es un **evento de hook + una condición que la máquina evalúa sin juicio** (`cada turno` = `UserPromptSubmit`; `al escribir` = `PreToolUse` sobre un `.md` bajo `.claude/`; `al cerrar tarea` = `Stop`, aún sin repartidor).
- `establecer-conducta/` — el **hook repartidor**: un mismo script sirve a varios eventos; resuelve qué momento realiza el evento que lo disparó, lee el registro **vivo** y emite el `Contenido` de las reglas `inyectar` `vigente` de ese momento como `additionalContext`. Agregar o cambiar una regla **no toca el hook**.
- `lint-conducta/` — valida que toda regla apunte a un momento existente, con clase/estado válidos, y que ninguna regla `vigente` cuelgue de un momento sin repartidor.

**Clases de acción:** `inyectar` (el agente lee un texto y actúa con su juicio) · `correr` (una Herramienta lo resuelve sin juicio) · `bloquear` (se frena la acción; solo donde Y es sin juicio y el falso positivo es imposible).

**Why:** una regla cargada al arranque **se recita, no se obedece** (conocimiento `modos-de-falla-ante-reglas-escritas`). El aporte de conducta es entregar la regla **en el momento** en que hace falta, no al inicio de la sesión — por eso el registro **NO se carga siempre** y el agente **no lo consulta a mano**: lo entrega el hook cerca del punto de acción.

**Gobernanza:** se edita al **agregar, modificar o dar de baja una regla**. Toda regla nueva que toque terminología o decisiones pasa por el usuario (el agente propone; ratificar es potestad del usuario).

**How to apply:**

1. **En el flujo normal, no consultar `INDICE.md` a mano** — el hook entrega la regla que corresponde a cada momento.
2. **Para agregar una regla:** elegir un momento existente de `MOMENTOS.md` (o declarar uno nuevo, en `declarado` hasta que tenga repartidor), sumar la fila a la sección que corresponda (`Reglas Base` si la manda el harness, `Reglas del Propósito` si es de este repo), y correr el lint. Una regla `vigente` no puede colgar de un momento sin repartidor: va en `pendiente`.
3. **Al cerrar** una tarea que tocó conducta, correr el lint: `node .claude/conducta/lint-conducta/lint-conducta.js`.

Relacionado: [[flujo-planes]] (construcción del subsistema por plan), [[semantica]] (el control de terminología consume los momentos `cada turno` y `al escribir`).
```

## §Script — `.claude/conocimiento/lint-conocimiento/lint-conocimiento.js`

Contenido exacto (Node, sin dependencias, sin red):

```js
#!/usr/bin/env node
// Lint de la base de conocimiento: refs rotas, indice incompleto, huerfanos. Sin LLM, sin red.
// Uso: node lint-conocimiento.js [<carpeta>]   (default: .claude/conocimiento)
const fs = require('fs'), path = require('path');
const root = path.resolve(process.argv[2] || '.claude/conocimiento');
const EXCLUDE = new Set(['.git', 'node_modules', 'exports', 'pdfs']);

function walk(dir, acc) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDE.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name.startsWith('lint-')) continue; walk(full, acc); }  // el lint co-ubicado del subsistema no es contenido
    else if (e.name.endsWith('.md') && e.name !== 'MANIFIESTO.md') acc.push(full);  // MANIFIESTO.md: infra del subsistema, no es pagina
  }
  return acc;
}
const rel = p => path.relative(root, p).replace(/\\/g, '/');
const domain = walk(root, []);
const read = f => fs.readFileSync(f, 'utf8');
const inRoot = p => path.resolve(p).startsWith(path.resolve(root) + path.sep);

// La raiz del repo se deduce de la ubicacion del propio lint: .claude/<sub>/lint-<sub>/ -> 3 arriba.
// La profundidad la fija el instalador; no depende de desde donde se invoque.
const repoRoot = path.resolve(__dirname, '..', '..', '..');
const dentroDelRepo = p => {
  const r = path.resolve(p);
  return r === repoRoot || r.startsWith(repoRoot + path.sep);
};
// Un archivo de un subsistema puede linkear a otros (planes/, conocimiento/, docs/, ...): la ref se
// resuelve relativa al archivo, a la raiz del subsistema, a .claude/, a la raiz del repo y al cwd.
// Solo se acepta el candidato que caiga DENTRO del repo: una ref rota no resuelve contra afuera.
function resolverRef(t, fdir) {
  return [
    path.join(fdir, t),
    path.join(root, t),
    path.join(root, '..', t),
    path.join(repoRoot, t),
    path.resolve(t),
  ].map(p => path.normalize(p)).find(p => dentroDelRepo(p) && fs.existsSync(p)) || null;
}

// --- Atribucion por ancestro mas cercano (identico en lint-conocimiento y lint-memoria) ---
// Cada pagina se atribuye a su indice ancestro mas cercano; un sub-indice (INDICE.md), a su
// ancestro ESTRICTO mas cercano (asi el padre queda obligado a nombrar la Carpeta que delego).
// Un hallazgo cae una sola vez, contra el indice que corresponde.
function indiceAncestro(p, dirsIndice, estricto) {
  let d = path.dirname(p);
  if (estricto) d = path.dirname(d);
  while (d.length >= root.length) {
    if (dirsIndice.has(d)) return d;
    const up = path.dirname(d);
    if (up === d) break;
    d = up;
  }
  return null;
}
// Un indice "nombra" a p si menciona su archivo, su stem, o alguna Carpeta de la cadena entre el
// dir del indice y p (la Entrada que delega el subarbol). Un sub-indice se nombra por su Carpeta.
function indiceNombra(t, p, idxDir) {
  const base = path.basename(p);
  if (base !== 'INDICE.md') {
    const stem = base.slice(0, -3);
    if (t.includes(base) || t.includes(stem)) return true;
  }
  let d = path.dirname(p);
  while (d !== idxDir && d.length > idxDir.length) {
    if (t.includes(path.basename(d))) return true;
    d = path.dirname(d);
  }
  return false;
}
// --- fin atribucion por ancestro ---

const mdLink = /\]\(([^)]+?\.md)\)/g;
// exige barra: `subtema/pagina.md` es una ref, `MEMORIA.md` suelto es prosa nombrando un archivo
const codePath = /`([^`]+?\/[^`]+?\.md)`/g;
const wiki = /\[\[([^\]]+?)\]\]/g;

// Un wikilink ACTIVO (que el harness resuelve) va crudo; uno CITADO va en backticks
// para mostrar el simbolo. Mapear code-spans inline (y fences) para saltar citas.
function codeSpans(txt) {
  const runs = []; let m; const re = /`+/g;
  while ((m = re.exec(txt))) runs.push([m.index, m[0].length]);
  const spans = [];
  for (let i = 0; i < runs.length; ) {
    const [open, len] = runs[i]; let j = i + 1;
    while (j < runs.length && runs[j][1] !== len) j++;
    if (j < runs.length) { spans.push([open, runs[j][0] + runs[j][1]]); i = j + 1; }
    else i++;
  }
  return spans;
}
const enCodeSpan = (spans, idx) => spans.some(([s, e]) => idx >= s && idx < e);

const broken = [], referenced = new Set();
for (const f of domain) {
  const txt = read(f), fdir = path.dirname(f);
  for (const re of [mdLink, codePath]) {
    let m; re.lastIndex = 0;
    while ((m = re.exec(txt))) {
      let t = m[1].trim();
      if (/^https?:\/\//.test(t)) continue;
      // saltar placeholders/taquigrafia: elipsis, plantillas de nombre, angulos
      if (t.includes('...') || t.includes('<') || t.includes('*') || /A{3,}|AA-MM|MM-DD/.test(t)) continue;
      const hit = resolverRef(t, fdir);
      if (hit) { if (inRoot(hit)) referenced.add(rel(hit)); }
      else broken.push([rel(f), t, 'ref .md no existe']);
    }
  }
  const spans = codeSpans(txt);
  let m; wiki.lastIndex = 0;
  while ((m = wiki.exec(txt))) {
    if (enCodeSpan(spans, m.index)) continue;  // wikilink citado en backticks, no activo
    const name = m[1].split('|')[0].trim();
    const hit = domain.some(p => rel(p).endsWith('/' + name + '.md') || rel(p) === name + '.md');
    if (!hit) broken.push([rel(f), `[[${name}]]`, 'wikilink sin archivo']);
  }
}

const indices = domain.filter(p => path.basename(p) === 'INDICE.md');
const idxText = new Map(indices.map(i => [i, read(i)]));
const dirsIndice = new Set(indices.map(i => path.dirname(i)));
const idxPorDir = new Map(indices.map(i => [path.dirname(i), i]));
const gaps = [];
for (const p of domain) {
  const ownerDir = indiceAncestro(p, dirsIndice, path.basename(p) === 'INDICE.md');
  if (ownerDir === null) continue;                 // la raiz: sin indice ancestro
  const idx = idxPorDir.get(ownerDir);
  if (!indiceNombra(idxText.get(idx), p, ownerDir)) gaps.push([rel(idx), rel(p)]);
}

const orphans = [];
for (const p of domain) {
  const base = path.basename(p);
  if (base === 'INDICE.md' || base === 'README.md') continue;
  if (referenced.has(rel(p))) continue;
  const ownerDir = indiceAncestro(p, dirsIndice, false);
  const idx = ownerDir === null ? null : idxPorDir.get(ownerDir);
  const mentioned = idx !== null && indiceNombra(idxText.get(idx), p, ownerDir);
  if (!mentioned) orphans.push(rel(p));
}

console.log(`== LINT CONOCIMIENTO: ${root} ==`);
console.log(`paginas: ${domain.length} | indices: ${indices.length}\n`);
console.log(`[1] REFS ROTAS (${broken.length}):`);
broken.forEach(([f, r, w]) => console.log(`    ${f}  ->  ${r}   [${w}]`));
if (!broken.length) console.log('    (ninguna)');
console.log(`\n[2] INDICE INCOMPLETO (${gaps.length}):`);
gaps.forEach(([i, p]) => console.log(`    ${i}  no lista  ${p}`));
if (!gaps.length) console.log('    (completo)');
console.log(`\n[3] HUERFANOS (${orphans.length}):`);
orphans.forEach(o => console.log(`    ${o}`));
if (!orphans.length) console.log('    (ninguno)');
```

## §Planes — `.claude/planes/`

Contenido inicial de `.claude/planes/ESTADOS.md` (fuente de verdad de los estados; la lee el lint):

```markdown
# Estados de planes

Define los estados disponibles para los planes de este repo y su semántica. Es la **fuente de verdad**: el lint (`lint-planes`) lee este archivo para validar la columna `Estado` de `PLANES.md` y el mapeo estado↔carpeta. Cambiar el juego de estados = editar esta tabla, no el código del lint.

Máquina de **un solo eje**: un plan está en exactamente **un** estado a la vez.

- **Estado** — nombre canónico (el valor que va en la columna `Estado` de `PLANES.md`).
- **Sentido** — qué significa que un plan esté en ese estado.
- **Carpeta** — subcarpeta de `planes/` donde vive el archivo del plan mientras está en ese estado.
- **Terminal** — `sí` si es un estado de cierre (el plan ya no se mueve); `no` si sigue vivo.

| Estado | Sentido | Carpeta | Terminal |
|--------|---------|---------|----------|
| Nuevo | Creado; todavía sin ejecutar. La revisión de alto nivel (con `planificar`) ocurre acá, antes de arrancar. | `pendientes/` | no |
| En curso | Se tomó el plan y se está **ejecutando**. | `pendientes/` | no |
| Diferido | Pospuesto a propósito; retomable más adelante. | `pendientes/` | no |
| Ejecutado | Terminado con éxito. | `ejecutados/` | sí |
| Descartado | Abandonado; no se hará (motivo obligatorio en Notas). | `descartados/` | sí |

No hay estado de "diseño": todo plan `Nuevo` se revisa en alto nivel antes de ejecutarse, así que la revisión es parte de estar `Nuevo`, no un estado aparte. El lint vigila la antigüedad del estado **activo** (`En curso`) — un plan que se está ejecutando hace demasiado y quedó frenado (ver la constante `VIGILAR_ANTIGUEDAD` en `lint-planes.js`).

## Transiciones

​```
  Nuevo ──────► En curso ──────► Ejecutado
    │              │             (terminal)
    ├──► Diferido ◄┘   (retomable → En curso)
    │
    └──► Descartado   (terminal, con motivo)
​```

- `Nuevo` → En curso · Diferido · Descartado
- `En curso` → Diferido · Ejecutado · Descartado
- `Diferido` → En curso · Descartado
- `Ejecutado` — terminal
- `Descartado` — terminal

## Cómo cambiar los estados

Editar la tabla de arriba (agregar/quitar filas o renombrar un estado). Reglas que el lint espera:

- Cada estado no-terminal debe mapear a una carpeta que exista bajo `planes/`.
- Debe haber al menos un estado terminal por carpeta de cierre.
- El valor de la columna `Estado` en `PLANES.md` debe coincidir exactamente con un `Estado` de esta tabla.
```

Contenido inicial de `.claude/planes/PLANES.md`:

```markdown
# Registro de planes

Lo fino de cada plan vive acá, no en el nombre del archivo. Las carpetas dan el ciclo grueso: `pendientes/` (planes vivos: `Nuevo`, `En curso`, `Diferido`), `ejecutados/`, `descartados/` (con motivo).

Los **estados** y su semántica (a qué carpeta mapea cada uno, cuáles son terminales) están definidos en [`ESTADOS.md`](ESTADOS.md) — fuente de verdad configurable, que el lint lee.

- **Plan** — link al archivo en su carpeta actual.
- **Estado** — uno de los definidos en `ESTADOS.md`: `Nuevo`, `En curso`, `Diferido` (vivos, en `pendientes/`), `Ejecutado`, `Descartado` (terminales).
- **Creado / Cerrado** — `AA-MM-DD`; Cerrado en `—` mientras esté vivo.
- **Origen** — plan del que se desprendió, si aplica.
- **Notas** — corto; en descartados, el motivo es obligatorio.

| Plan | Estado | Creado | Cerrado | Origen | Notas |
|------|--------|--------|---------|--------|-------|
```

Hook — **registro doble**: el mismo script se registra en los dos formatos — Claude Code y Codex CLI ejecutan idéntico chequeo al abrir sesión. Con `--quiet` el lint solo imprime cuando hay hallazgos: sesión limpia = hook silencioso. Es el trigger mecánico del ciclo — sin él, mover planes vuelve a depender de acordarse.

**Claude Code** — merge (sin pisar hooks existentes) en `.claude/settings.json` del repo:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/planes/lint-planes/lint-planes.js --quiet"
          }
        ]
      }
    ]
  }
}
```

**Codex CLI** — merge (sin pisar hooks existentes) en `.codex/hooks.json` del repo:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/planes/lint-planes/lint-planes.js --quiet",
            "statusMessage": "Chequeando el ciclo de planes"
          }
        ]
      }
    ]
  }
}
```

> Codex carga hooks de proyecto solo si la capa `.codex/` del repo está **trusted** (revisar con `/hooks`), y con `features.hooks` habilitado en su config. Avisarle al usuario al instalar.

`.claude/planes/lint-planes/README.md`:

```markdown
# lint-planes

**Qué hace:** lint del ciclo de planes — lee los estados de `planes/ESTADOS.md` (data-driven) y valida: coherencia estado↔carpeta y carpeta↔registro (PLANES.md), planes sueltos, estados inválidos (fuera de ESTADOS.md), pendientes ya resueltos sin mover, cierres a medias (sin fecha, sin motivo, sin notas de implementación) y activos (`En curso`) envejecidos. Sin LLM, sin red.
**Cómo se corre:** `node .claude/planes/lint-planes/lint-planes.js` (desde la raíz del repo). Flags: `--quiet` (solo imprime si hay hallazgos; usado por el hook), `--dias N` (umbral de envejecimiento, default 30).
**Estado:** vigente.
**Referenciado por:** hook `SessionStart` en `.claude/settings.json` — actualizar el hook si se mueve.
**Dependencias:** Node.js (sin libs externas).
**Origen (opcional):** funcionalidad `gestion-de-planes` del harness (análisis de uso 2026-07: los ciclos manuales de planes no se sostenían solos).
```

## §Script — `.claude/planes/lint-planes/lint-planes.js`

Contenido exacto (Node, sin dependencias, sin red):

```js
#!/usr/bin/env node
// Lint del ciclo de planes: carpeta<->registro, sueltos, resueltos sin mover, cierres a medias, activos envejecidos. Sin LLM, sin red.
// Estados y su mapeo (carpeta, terminal) se leen de ESTADOS.md: fuente de verdad configurable, no hardcodeada.
// Uso: node lint-planes.js [<carpeta>] [--quiet] [--dias N]   (default: .claude/planes, N=30)
const fs = require('fs'), path = require('path');
const args = process.argv.slice(2);
const quiet = args.includes('--quiet');
const diasIdx = args.indexOf('--dias');
const MAX_DIAS = diasIdx >= 0 ? parseInt(args[diasIdx + 1], 10) : 30;
const root = path.resolve(args.find(a => !a.startsWith('--') && !/^\d+$/.test(a)) || '.claude/planes');

// Estado(s) cuya antiguedad se vigila: el plan se esta ejecutando hace demasiado y quedo frenado.
// Si se renombra el estado activo en ESTADOS.md, ajustar esta lista (en minusculas).
const VIGILAR_ANTIGUEDAD = ['en curso'];

// --- ESTADOS.md: nombre -> {nombre, carpeta, terminal} ---
const estPath = path.join(root, 'ESTADOS.md');
const estTxt = fs.existsSync(estPath) ? fs.readFileSync(estPath, 'utf8') : '';
const estados = new Map();
for (const line of estTxt.split('\n')) {
  const t = line.trim();
  if (!t.startsWith('|')) continue;
  const cells = t.split('|').slice(1, -1).map(c => c.trim());
  if (cells.length < 4) continue;
  const nombre = cells[0];
  const c0 = nombre.replace(/[*\s]/g, '');
  if (/^:?-{2,}:?$/.test(c0) || /^estado$/i.test(c0)) continue;
  const carpeta = cells[2].replace(/[`/\\]/g, '').trim();
  const terminal = /^s[ií]$/i.test(cells[3].trim());
  estados.set(nombre.toLowerCase(), { nombre, carpeta, terminal });
}
// Fallback si no hay ESTADOS.md (repo a medio configurar): convencion clasica de carpetas.
const CARPETAS = estados.size
  ? [...new Set([...estados.values()].map(e => e.carpeta))]
  : ['pendientes', 'ejecutados', 'descartados'];
const carpetaDeEstado = e => (estados.get(e) || {}).carpeta;
const esTerminal = e => !!(estados.get(e) || {}).terminal;

const regPath = path.join(root, 'PLANES.md');
const reg = fs.existsSync(regPath) ? fs.readFileSync(regPath, 'utf8') : '';

// filas: | Plan | Estado | Creado | Cerrado | Origen | Notas |
const rows = [];
for (const line of reg.split('\n')) {
  const t = line.trim();
  if (!t.startsWith('|')) continue;
  const cells = t.split('|').slice(1, -1).map(c => c.trim());
  if (cells.length < 6) continue;
  const c0 = cells[0].replace(/[*\s]/g, '');
  if (/^:?-{2,}:?$/.test(c0) || /^plan$/i.test(c0)) continue;
  const m = /\]\(([^)]+?)\)/.exec(cells[0]);
  const ref = (m ? m[1] : cells[0].replace(/[`\[\]]/g, '')).trim();
  rows.push({ ref, estado: cells[1].toLowerCase(), creado: cells[2],
              cerrado: cells[3], origen: cells[4], notas: cells[5] });
}

const enDisco = new Map(); // rel -> carpeta
for (const c of CARPETAS) {
  const dir = path.join(root, c);
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir)) if (f.endsWith('.md')) enDisco.set(c + '/' + f, c);
}

const sueltos = fs.existsSync(root)
  ? fs.readdirSync(root, { withFileTypes: true })
      .filter(e => e.isFile() && e.name.endsWith('.md') && !['PLANES.md', 'ESTADOS.md', 'MANIFIESTO.md'].includes(e.name)).map(e => e.name)
  : [];

const norm = r => r.replace(/\\/g, '/').replace(/^\.\//, '');
const refs = new Set(rows.map(r => norm(r.ref)));
const sinFila = [...enDisco.keys()].filter(k => !refs.has(k));
const colgadas = [], estadoInvalido = [], estadoCarpeta = [], cierreAMedias = [], sinMotivo = [];
for (const r of rows) {
  const rel = norm(r.ref), carpeta = enDisco.get(rel);
  if (!estados.size) break;                       // sin ESTADOS.md no se valida el estado
  if (!estados.has(r.estado)) { estadoInvalido.push([rel, r.estado]); continue; }
  if (!carpeta) { colgadas.push(rel); continue; }
  const esperada = carpetaDeEstado(r.estado);
  if (esperada && carpeta !== esperada) estadoCarpeta.push([rel, r.estado, carpeta, esperada]);
  if (esTerminal(r.estado) && (!r.cerrado || r.cerrado === '—' || r.cerrado === '-')) cierreAMedias.push([rel, 'sin fecha Cerrado']);
  // Motivo obligatorio en la carpeta de descarte (convencion de carpetas del harness).
  if (carpeta === 'descartados' && (!r.notas || r.notas === '—' || r.notas === '-')) sinMotivo.push(rel);
}
// filas colgadas (archivo no existe) para estados validos que no aparecieron en disco
for (const r of rows) {
  const rel = norm(r.ref);
  if (estados.size && estados.has(r.estado) && !enDisco.has(rel) && !colgadas.includes(rel)) colgadas.push(rel);
}

// contenido: pendientes con marcador de resolucion; ejecutados sin notas de implementacion
const resueltosSinMover = [], ejecSinNotas = [];
for (const [rel, carpeta] of enDisco) {
  const txt = fs.readFileSync(path.join(root, rel), 'utf8');
  if (carpeta === 'pendientes' && (/\bRESUELTO\b/.test(txt) || /##\s*Notas de implementación/i.test(txt))) resueltosSinMover.push(rel);
  if (carpeta === 'ejecutados' && !/## Notas de implementación/i.test(txt)) ejecSinNotas.push(rel);
}

// activos envejecidos (estado vigilado, p. ej. "En curso", con Creado viejo)
const viejos = [];
const hoy = Date.now();
for (const r of rows) {
  if (!VIGILAR_ANTIGUEDAD.includes(r.estado)) continue;
  const m = /^(\d{2})-(\d{2})-(\d{2})$/.exec(r.creado);
  if (!m) continue;
  const dias = Math.floor((hoy - Date.parse(`20${m[1]}-${m[2]}-${m[3]}`)) / 86400000);
  if (dias > MAX_DIAS) viejos.push([norm(r.ref), dias]);
}

const secciones = [
  ['ESTADOS.md AUSENTE O VACIO (no se valida el estado)', estados.size ? [] : [estPath]],
  ['SUELTOS EN LA RAIZ (mover a una carpeta del ciclo)', sueltos],
  ['ARCHIVOS SIN FILA EN PLANES.md', sinFila],
  ['FILAS COLGADAS (archivo no existe)', colgadas],
  ['ESTADO INVALIDO (no esta en ESTADOS.md)', estadoInvalido.map(([r, e]) => `${r}  estado="${e}"`)],
  ['ESTADO vs CARPETA INCONSISTENTE', estadoCarpeta.map(([r, e, c, esp]) => `${r}  estado="${e}" en ${c}/ (deberia ir en ${esp}/)`)],
  ['PENDIENTES CON MARCADOR DE RESUELTO (¿mover a ejecutados?)', resueltosSinMover],
  ['CIERRES A MEDIAS', cierreAMedias.map(([r, w]) => `${r}  [${w}]`)],
  ['DESCARTADOS SIN MOTIVO', sinMotivo],
  ['EJECUTADOS SIN "## Notas de implementación"', ejecSinNotas],
  [`ACTIVOS ENVEJECIDOS (> ${MAX_DIAS} dias en curso: ¿sigue/diferido/descartado?)`, viejos.map(([r, d]) => `${r}  (${d} dias)`)],
];
const total = secciones.reduce((n, [, items]) => n + items.length, 0);
if (quiet && total === 0) process.exit(0);
console.log(`== LINT PLANES: ${root} ==`);
console.log(`estados definidos: ${estados.size} | filas en registro: ${rows.length} | archivos en ciclo: ${enDisco.size} | hallazgos: ${total}\n`);
for (const [titulo, items] of secciones) {
  if (quiet && !items.length) continue;
  console.log(`[${titulo}] (${items.length})`);
  items.forEach(i => console.log(`    ${i}`));
  if (!quiet && !items.length) console.log('    (ninguno)');
}
```

## §Glosario — `.claude/semantica/`

Contenido inicial de `.claude/semantica/GLOSARIO.md` (tabla vacía — sin filas de ejemplo, para que el lint no las tome como conceptos reales):

```markdown
# Glosario del proyecto

Terminología **legítima** del dominio de este repo. Una fila por concepto en la tabla de abajo:

- **Concepto** — nombre canónico.
- **Definición** — una o dos frases: qué ES el concepto (no qué hace).
- **Alias** — otras formas de llamarlo, todas válidas, registradas para mapear; separadas por coma. `—` si no hay.
- **Propuestos** — términos que el agente *sugiere* pero que **no se usan** hasta que el usuario los mueve a `Alias` (acá) o al registro de Terminología Farlopa (vetado). Es un buzón, no un estado de reposo. `—` si no hay.
- **Detalle** — link a una página propia `<nombre>.md` **solo si el concepto es complejo** (fórmulas, ejemplos, contraejemplos). `—` si es simple.

Solo términos **propios del dominio** (no conceptos generales de programación). Consultar al planificar y analizar. Ejemplo completo en el README de la funcionalidad `semantica`.

Los términos **vetados no viven acá**: un veto es sobre la relación término→significado (el mismo término con otro significado puede ser legítimo), así que va al registro par [`TERMINOLOGIA-FARLOPA.md`](TERMINOLOGIA-FARLOPA.md), donde la columna del medio fija el significado vetado. El glosario solo lleva terminología legítima.

**Gobernanza (control del usuario):**

- Toda entrada nueva —**concepto o alias**— pasa por el usuario. El agente puede *proponer* (columna `Propuestos`), pero no asienta nada en `Alias` ni veta nada por su cuenta: ratificar y vetar son potestad del usuario. Preferir las palabras del usuario a acuñar nuevas.
- El agente **nunca usa**, ni en texto plano, memorias, planes o código, un término que esté en `Propuestos` o vetado en el registro de Terminología Farlopa.
- Los alias válidos **se registran** (mapear "birra/chela = cerveza" evita confusión); los términos confusos o ajenos al dominio **se vetan** en el registro de Terminología Farlopa (dejan de usarse y se barren del texto vivo).

| Concepto | Definición | Alias | Propuestos | Detalle |
|----------|------------|-------|------------|---------|
```

Registro par `.claude/semantica/TERMINOLOGIA-FARLOPA.md` (tabla vacía):

```markdown
# Terminología Farlopa

*Farlop Terminology* (EN). Registro par del glosario: las **relaciones término→significado vetadas** del dominio. Cada fila prohíbe un término **en un significado específico**, no el término en sí — el mismo término con otro significado puede ser legítimo (`plomería`=cañerías en un repo de fontanería es válido; `plomería`=infraestructura interna de software es farlopa). Por eso la columna del medio: fija el significado que se veta.

El **lint marca por término** (lo mecánico: encuentra la palabra en el texto vivo); **el agente juzga el significado** al leer la marca (¿está usada en el sentido vetado o en uno legítimo?). El registro se calibra por repo: un anglicismo es farlopa para un lector hispanohablante y puede no serlo para uno angloparlante.

**Gobernanza:** vetar es potestad del usuario; el agente solo propone. El agente **nunca usa** un término en el significado que este registro veta.

| Término | Significado vetado | Cómo decirlo |
|---------|--------------------|--------------|
```

Memoria `.claude/memoria/feedback_semantica.md`:

```markdown
---
name: semantica
description: Subsistema semántica en .claude/semantica/ — dos registros pares: GLOSARIO.md (terminología legítima, alias/propuestos) y TERMINOLOGIA-FARLOPA.md (relaciones vetadas término→significado); el agente solo propone, el usuario ratifica y veta; consultar al planificar/analizar; lint al cerrar.
metadata:
  type: feedback
---

El subsistema `semántica` mantiene la coherencia semántica del dominio en el tiempo. Vive en `.claude/semantica/` con **dos registros pares**, ninguno cargado en contexto siempre:

- `GLOSARIO.md` — terminología **legítima**: una tabla donde cada fila es un concepto (nombre canónico, definición corta, `Alias`, `Propuestos`, `Detalle`). Los conceptos complejos tienen su propia página `.claude/semantica/<nombre>.md`.
- `TERMINOLOGIA-FARLOPA.md` — relaciones **vetadas**: `Término | Significado vetado | Cómo decirlo`. **Lo vetado es la relación término→significado, no el término**: el mismo término con otro significado puede ser legítimo. El lint **marca por término**; el agente **juzga el significado** al leer la marca.

**Términos por estado (glosario):** `Alias` (formas válidas, ratificadas), `Propuestos` (sugeridos por el agente, sin usar hasta ratificar). El glosario **NO tiene columna de vetados**: todo veto es una relación y vive en el registro par de Terminología Farlopa.

**Why:** coherencia semántica a lo largo de la vida del repo. Los alias válidos **se registran** (saber que "birra/chela" son la misma cerveza evita confusión); los términos confusos o ajenos al dominio **se vetan** (dejan de usarse y se barren del texto vivo).

**Gobernanza:** el agente **nunca** ratifica un alias ni veta por su cuenta: solo **propone** en `Propuestos`. Ratificar y vetar son del usuario. El agente **nunca usa** un término que esté en `Propuestos` ni uno vetado en el significado que Terminología Farlopa prohíbe, ni en texto plano, memorias, planes o código.

**How to apply:**

1. **Al planificar o analizar**, consultar los dos registros. Término nuevo válido → proponerlo en `Propuestos`. Término confuso o ajeno → proponer vetarlo (a Terminología Farlopa). En ambos casos, decide el usuario.
2. Concepto **simple** → una fila del glosario. Concepto **complejo** → fila + página de detalle enlazada.
3. **Al cerrar** una tarea que tocó semántica, correr el lint: `node .claude/semantica/lint-semantica/lint-semantica.js` (links de detalle, huérfanos, colisiones, propuestos pendientes, apariciones de vetados en el repo).

Relacionado: [[flujo-planes]] (consultar la semántica al planificar/analizar).
```

Lint `.claude/semantica/lint-semantica/lint-semantica.js` (Node, sin dependencias, sin red):

```js
#!/usr/bin/env node
// Lint de semantica: dos registros pares (GLOSARIO.md + TERMINOLOGIA-FARLOPA.md). Chequea links de
// detalle, huerfanos, colisiones/contradicciones termino<->vetado, propuestos pendientes y apariciones
// de vetados en el repo. El veto es sobre la relacion termino->significado: el lint marca por termino,
// el agente juzga el significado al leer la marca. Sin LLM, sin red.
// Uso: node lint-semantica.js [<carpeta>]   (default: .claude/semantica)
const fs = require('fs'), path = require('path');
const root = path.resolve(process.argv[2] || '.claude/semantica');
const glosPath = path.join(root, 'GLOSARIO.md');
const farlPath = path.join(root, 'TERMINOLOGIA-FARLOPA.md');
const txt = fs.existsSync(glosPath) ? fs.readFileSync(glosPath, 'utf8') : '';
const farlTxt = fs.existsSync(farlPath) ? fs.readFileSync(farlPath, 'utf8') : '';

// La raiz del repo se deduce de la ubicacion del propio lint: .claude/<sub>/lint-<sub>/ -> 3 arriba.
// La profundidad la fija el instalador; no depende de desde donde se invoque.
const repoRoot = path.resolve(__dirname, '..', '..', '..');
const dentroDelRepo = p => {
  const r = path.resolve(p);
  return r === repoRoot || r.startsWith(repoRoot + path.sep);
};
// Un archivo de un subsistema puede linkear a otros (planes/, conocimiento/, docs/, ...): la ref se
// resuelve relativa al archivo, a la raiz del subsistema, a .claude/, a la raiz del repo y al cwd.
// Solo se acepta el candidato que caiga DENTRO del repo: una ref rota no resuelve contra afuera.
function resolverRef(t, fdir) {
  return [
    path.join(fdir, t),
    path.join(root, t),
    path.join(root, '..', t),
    path.join(repoRoot, t),
    path.resolve(t),
  ].map(p => path.normalize(p)).find(p => dentroDelRepo(p) && fs.existsSync(p)) || null;
}

// separar celdas de una columna en terminos: coma/;, descartando vacios y guiones
const splitTerms = s => (s || '').split(/[,;]/).map(x => x.trim()).filter(x => x && x !== '—' && x !== '-');
// la columna Termino de la farlopa agrupa variantes con "/"; ademas viene con backticks
const splitFarlop = s => (s || '').replace(/`/g, '').split(/[,;/]/).map(x => x.trim()).filter(x => x && x !== '—' && x !== '-');

// parsear filas de GLOSARIO.md: | Concepto | Definicion | Alias | Propuestos | Detalle |
const rows = [];
for (const line of txt.split('\n')) {
  const t = line.trim();
  if (!t.startsWith('|')) continue;
  const cells = t.split('|').slice(1, -1).map(c => c.trim());
  if (cells.length < 5) continue;
  const c0 = cells[0].replace(/[*\s]/g, '');
  if (/^:?-{2,}:?$/.test(c0)) continue;                 // separador |---|
  if (/^concepto$/i.test(c0)) continue;                  // header
  rows.push({
    concepto: cells[0].replace(/\*/g, '').trim(),
    alias: cells[2],
    propuestos: cells[3],
    detalle: cells[4],
  });
}

// parsear filas de TERMINOLOGIA-FARLOPA.md: | Termino | Significado vetado | Como decirlo |
// Solo interesa la primera columna (los terminos vetados); el significado lo juzga el agente.
const vetados = [];   // termino pelado, en minuscula
for (const line of farlTxt.split('\n')) {
  const t = line.trim();
  if (!t.startsWith('|')) continue;
  const cells = t.split('|').slice(1, -1).map(c => c.trim());
  if (cells.length < 3) continue;
  const c0 = cells[0].replace(/[*`\s]/g, '');
  if (/^:?-{2,}:?$/.test(c0)) continue;                 // separador |---|
  if (/^t[eé]rmino$/i.test(c0)) continue;                // header
  for (const v of splitFarlop(cells[0])) vetados.push(v.toLowerCase());
}

// [1] links de detalle rotos (en GLOSARIO.md)
const linkRe = /\]\(([^)]+?\.md)\)/;
const referenced = new Set();
const refsRotas = [];
for (const r of rows) {
  const m = linkRe.exec(r.detalle);
  if (!m) continue;
  const target = m[1].trim();
  const abs = resolverRef(target, root);
  if (abs) referenced.add(path.basename(abs));
  else refsRotas.push([r.concepto, target]);
}

// [2] paginas .md huerfanas (en semantica/, no referenciadas por la tabla)
// Los dos registros y la infra del subsistema no son paginas de detalle: se excluyen.
const NO_HUERFANO = new Set(['GLOSARIO.md', 'TERMINOLOGIA-FARLOPA.md', 'INDICE.md', 'MANIFIESTO.md']);
const huerfanos = [];
if (fs.existsSync(root)) {
  for (const f of fs.readdirSync(root)) {
    if (!f.endsWith('.md') || NO_HUERFANO.has(f)) continue;
    if (!referenced.has(f)) huerfanos.push(f);
  }
}

// [3] colisiones de terminos
//   - mismo termino como alias en dos conceptos          -> error (colision de alias)
//   - termino como alias/concepto del glosario y vetado   -> contradiccion (se bendice y se prohibe)
// La farlopa admite el MISMO termino en varias filas (distinto significado vetado): no es ambiguo.
const aliasOf = new Map();     // termino -> concepto que lo tiene como alias (incluye el canonico)
const colisionesAlias = [];
const contradicciones = [];
const registrarAlias = (term, concepto) => {
  const key = term.toLowerCase();
  if (aliasOf.has(key) && aliasOf.get(key) !== concepto) colisionesAlias.push([term, aliasOf.get(key), concepto]);
  else aliasOf.set(key, concepto);
};
for (const r of rows) registrarAlias(r.concepto, r.concepto);
for (const r of rows) for (const a of splitTerms(r.alias)) registrarAlias(a, r.concepto);
const vetadoSet = new Set(vetados);
for (const key of vetadoSet) {
  if (aliasOf.has(key)) contradicciones.push([key, aliasOf.get(key)]);
}

// [4] propuestos pendientes de ratificacion (recordatorio, no error)
const propuestos = [];
for (const r of rows) for (const p of splitTerms(r.propuestos)) propuestos.push([p, r.concepto]);

// [5] apariciones de vetados en el repo (barrido recursivo desde la raiz)
// Reusa walk()+EXCLUDE de lint-conocimiento. Dos grupos: prosa (accion inmediata) y codigo (informativo).
const EXCLUDE = new Set(['.git', 'node_modules', 'exports', 'pdfs']);
// Autoexclusiones obligatorias: el registro de semantica contiene los vetados por definicion; el
// historico congelado de planes no se reescribe (falsearia el registro).
const AUTOEXCL = [
  path.join(repoRoot, '.claude', 'semantica'),
  path.join(repoRoot, '.claude', 'planes', 'ejecutados'),
  path.join(repoRoot, '.claude', 'planes', 'descartados'),
];
const excluido = p => AUTOEXCL.some(a => { const r = path.resolve(p); return r === a || r.startsWith(a + path.sep); });
const CODE_EXT = new Set(['.js', '.json', '.ts', '.mjs', '.cjs', '.sh', '.ps1', '.yml', '.yaml']);
function walkRepo(dir, acc) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDE.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (excluido(full)) continue;
    if (e.isDirectory()) walkRepo(full, acc);
    else acc.push(full);
  }
  return acc;
}
// mapear code-spans inline y fences para separar prosa de codigo (igual que lint-conocimiento)
function codeSpans(t) {
  const runs = []; let m; const re = /`+/g;
  while ((m = re.exec(t))) runs.push([m.index, m[0].length]);
  const spans = [];
  for (let i = 0; i < runs.length; ) {
    const [open, len] = runs[i]; let j = i + 1;
    while (j < runs.length && runs[j][1] !== len) j++;
    if (j < runs.length) { spans.push([open, runs[j][0] + runs[j][1]]); i = j + 1; }
    else i++;
  }
  return spans;
}
const enCodeSpan = (spans, idx) => spans.some(([s, e]) => idx >= s && idx < e);
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const vetadosTerms = [...vetadoSet];
const apariciones = { prosa: [], codigo: [] };
if (vetadosTerms.length) {
  const rel = p => path.relative(repoRoot, p).replace(/\\/g, '/');
  for (const f of walkRepo(repoRoot, [])) {
    const ext = path.extname(f).toLowerCase();
    const nombre = path.basename(f);
    // nombre de archivo/carpeta que contiene un vetado -> codigo (tocarlo es refactor)
    for (const term of vetadosTerms) {
      const re = new RegExp('\\b' + esc(term) + '\\b', 'i');
      if (re.test(nombre)) apariciones.codigo.push([rel(f), term, 'nombre de archivo']);
    }
    if (ext !== '.md' && !CODE_EXT.has(ext)) continue;  // binarios y otros: solo el nombre
    let contenido; try { contenido = fs.readFileSync(f, 'utf8'); } catch { continue; }
    const spans = ext === '.md' ? codeSpans(contenido) : null;
    for (const term of vetadosTerms) {
      const re = new RegExp('\\b' + esc(term) + '\\b', 'gi');
      let m;
      while ((m = re.exec(contenido))) {
        const balde = (ext === '.md' && !enCodeSpan(spans, m.index)) ? 'prosa' : 'codigo';
        const linea = contenido.slice(0, m.index).split('\n').length;
        apariciones[balde].push([rel(f) + ':' + linea, term]);
      }
    }
  }
}

console.log(`== LINT SEMANTICA: ${root} ==`);
console.log(`conceptos: ${rows.length} | vetados: ${vetadosTerms.length}\n`);
console.log(`[1] LINKS DE DETALLE ROTOS (${refsRotas.length}):`);
refsRotas.forEach(([c, t]) => console.log(`    ${c}  ->  ${t}   [no existe]`));
if (!refsRotas.length) console.log('    (ninguno)');
console.log(`\n[2] PAGINAS HUERFANAS (${huerfanos.length}):`);
huerfanos.forEach(h => console.log(`    ${h}`));
if (!huerfanos.length) console.log('    (ninguna)');
console.log(`\n[3] COLISIONES DE TERMINOS (${colisionesAlias.length + contradicciones.length}):`);
colisionesAlias.forEach(([t, a, b]) => console.log(`    alias "${t}"  en  ${a}  y  ${b}   [colision de alias]`));
contradicciones.forEach(([t, a]) => console.log(`    "${t}"  alias/concepto en  ${a}  y vetado en la farlopa   [contradiccion]`));
if (!colisionesAlias.length && !contradicciones.length) console.log('    (ninguna)');
console.log(`\n[4] PROPUESTOS PENDIENTES DE RATIFICACION (${propuestos.length}):`);
propuestos.forEach(([p, c]) => console.log(`    "${p}"  propuesto para  ${c}`));
if (!propuestos.length) console.log('    (ninguno)');
console.log(`\n[5] APARICIONES DE VETADOS (prosa: ${apariciones.prosa.length}, codigo: ${apariciones.codigo.length}):`);
console.log('  prosa (reescribir):');
apariciones.prosa.forEach(([f, t]) => console.log(`    ${f}  "${t}"`));
if (!apariciones.prosa.length) console.log('    (ninguna)');
console.log('  codigo/nombres (refactor manual, cuidado con refs por ruta):');
apariciones.codigo.forEach(([f, t, w]) => console.log(`    ${f}  "${t}"${w ? '  [' + w + ']' : ''}`));
if (!apariciones.codigo.length) console.log('    (ninguna)');
```

## §Decisiones — `.claude/decisiones/`

Contenido inicial de `.claude/decisiones/INDICE.md` (tabla vacía — sin filas de ejemplo):

```markdown
# Decisiones del proyecto

Registro de las decisiones **estructurales al propósito del repo**: las que definen cómo es o qué hace el repo en lo esencial, o que eligen un camino entre varios de forma que **condiciona el trabajo futuro**. **No** van las operativas triviales o efímeras ("busqué X en internet", "usé tal flag"). Ante la duda: ¿esto condiciona el repo a futuro? Sí → va.

Una fila por decisión:

- **N°** — secuencial (`0001`, `0002`, …), referencia estable.
- **Decisión** — qué se decidió y por qué, en una frase (para las simples).
- **Fecha** — `AAAA-MM-DD`.
- **Estado** — `vigente` o `reemplazada por NNNN`. Para revertir no se borra: se agrega una nueva y se marca la vieja.
- **Detalle** — link a `NNNN-slug.md` **solo si la decisión requiere conceptualización mayor** (contexto, alternativas, consecuencias); `—` si es simple.

| N° | Decisión | Fecha | Estado | Detalle |
|----|----------|-------|--------|---------|
```

Formato de una página de detalle `.claude/decisiones/NNNN-slug.md` (solo decisiones complejas):

```markdown
# NNNN — Título corto de la decisión

**Fecha:** AAAA-MM-DD · **Estado:** vigente

Contexto: qué problema o situación la motivó.
Decisión: qué se decidió.
Alternativas: cuáles se consideraron y por qué se eligió esta.
Consecuencias: efectos no obvios (solo si los hay).
```

Memoria `.claude/memoria/feedback_decisiones.md`:

```markdown
---
name: decisiones
description: Registro de decisiones estructurales del repo en .claude/decisiones/INDICE.md (tabla + detalle para las complejas, NO ADR); consultar al planificar/analizar; lint al cerrar.
metadata:
  type: feedback
---

Las decisiones **estructurales al propósito del repo** se asientan en `.claude/decisiones/INDICE.md`: una tabla donde cada fila es una decisión (N° secuencial, qué se decidió y por qué, fecha, estado, y link a página de detalle si requiere conceptualización mayor). Misma estructura que el glosario: lo simple vive en la fila, lo complejo en su `NNNN-slug.md`.

**Why:** coherencia decisional a lo largo de la vida del repo — no re-decidir ni contradecir lo estructural. Acotado a lo estructural (no lo operativo trivial) para que el registro siga siendo señal y no ruido — es lo que hacía la "A" de ADR, generalizada a repos de cualquier propósito.

**How to apply:**

1. **Qué registrar:** decisiones que definen cómo es / qué hace el repo en lo esencial, o que eligen un camino que condiciona el trabajo futuro. **No** las triviales o efímeras ("busqué en internet", "usé tal comando").
2. **Al planificar o analizar**, consultar las decisiones previas: no re-abrir lo cerrado ni contradecirlo. Reemplazar, no borrar: agregar la nueva y marcar la vieja `reemplazada por NNNN`.
3. **Simple** → una fila, Detalle en `—`. **Compleja** (contexto, alternativas, consecuencias) → fila + página `NNNN-slug.md`.
4. **Al cerrar** una tarea que registró decisiones, correr el lint: `node .claude/decisiones/lint-decisiones/lint-decisiones.js` (numeración, links de detalle, huérfanos, superseded).

Relacionado: [[flujo-planes]] (consultar/registrar decisiones al cerrar planes).
```

Lint `.claude/decisiones/lint-decisiones/lint-decisiones.js` (Node, sin dependencias, sin red):

```js
#!/usr/bin/env node
// Lint del registro de decisiones: numeracion, links de detalle, huerfanos, superseded. Sin LLM, sin red.
// Uso: node lint-decisiones.js [<carpeta>]   (default: .claude/decisiones)
const fs = require('fs'), path = require('path');
const root = path.resolve(process.argv[2] || '.claude/decisiones');
const mainPath = path.join(root, 'INDICE.md');
const txt = fs.existsSync(mainPath) ? fs.readFileSync(mainPath, 'utf8') : '';
const pad = n => String(n).padStart(4, '0');

// La raiz del repo se deduce de la ubicacion del propio lint: .claude/<sub>/lint-<sub>/ -> 3 arriba.
// La profundidad la fija el instalador; no depende de desde donde se invoque.
const repoRoot = path.resolve(__dirname, '..', '..', '..');
const dentroDelRepo = p => {
  const r = path.resolve(p);
  return r === repoRoot || r.startsWith(repoRoot + path.sep);
};
// Un archivo de un subsistema puede linkear a otros (planes/, conocimiento/, docs/, ...): la ref se
// resuelve relativa al archivo, a la raiz del subsistema, a .claude/, a la raiz del repo y al cwd.
// Solo se acepta el candidato que caiga DENTRO del repo: una ref rota no resuelve contra afuera.
function resolverRef(t, fdir) {
  return [
    path.join(fdir, t),
    path.join(root, t),
    path.join(root, '..', t),
    path.join(repoRoot, t),
    path.resolve(t),
  ].map(p => path.normalize(p)).find(p => dentroDelRepo(p) && fs.existsSync(p)) || null;
}

// parsear filas de la tabla: | N° | Decisión | Fecha | Estado | Detalle |
const rows = [];
for (const line of txt.split('\n')) {
  const t = line.trim();
  if (!t.startsWith('|')) continue;
  const cells = t.split('|').slice(1, -1).map(c => c.trim());
  if (cells.length < 5) continue;
  const nRaw = cells[0].replace(/[*\s]/g, '');
  if (/^:?-{2,}:?$/.test(nRaw)) continue;               // separador |---|
  if (!/^\d{1,4}$/.test(nRaw)) continue;                 // header u otra fila sin N°
  rows.push({ n: parseInt(nRaw, 10), estado: cells[3], detalle: cells[4] });
}

// [1] numeracion: huecos y duplicados
const gaps = [];
if (rows.length) {
  const nums = rows.map(r => r.n), set = new Set(nums), seen = new Set();
  for (let i = 1; i <= Math.max(...nums); i++) if (!set.has(i)) gaps.push(`falta ${pad(i)}`);
  for (const n of nums) { if (seen.has(n)) gaps.push(`duplicado ${pad(n)}`); seen.add(n); }
}

// [2] links de detalle rotos + recopilar referenciados
const linkRe = /\]\(([^)]+?\.md)\)/;
const referenced = new Set(), refsRotas = [];
for (const r of rows) {
  const m = linkRe.exec(r.detalle);
  if (!m) continue;
  const target = m[1].trim(), abs = resolverRef(target, root);
  if (abs) referenced.add(path.basename(abs));
  else refsRotas.push([pad(r.n), target]);
}

// [3] paginas de detalle huerfanas
const huerfanos = [];
if (fs.existsSync(root)) {
  for (const f of fs.readdirSync(root)) {
    if (!f.endsWith('.md') || f === 'INDICE.md' || f === 'MANIFIESTO.md') continue;  // MANIFIESTO.md: infra del subsistema
    if (!referenced.has(f)) huerfanos.push(f);
  }
}

// [4] superseded (en la columna Estado) que no resuelven
const nums = new Set(rows.map(r => r.n));
const supRe = /(?:reemplazada por|supersede-a|superseded by)[^0-9\n]{0,12}(\d{1,4})/i;
const supRotas = [];
for (const r of rows) {
  const m = supRe.exec(r.estado);
  if (m && !nums.has(parseInt(m[1], 10))) supRotas.push([pad(r.n), `reemplazada por ${pad(parseInt(m[1], 10))}`]);
}

console.log(`== LINT DECISIONES: ${root} ==`);
console.log(`decisiones: ${rows.length}\n`);
console.log(`[1] NUMERACION (${gaps.length}):`);
gaps.forEach(g => console.log(`    ${g}`));
if (!gaps.length) console.log('    (sin huecos ni duplicados)');
console.log(`\n[2] LINKS DE DETALLE ROTOS (${refsRotas.length}):`);
refsRotas.forEach(([n, t]) => console.log(`    ${n}  ->  ${t}   [no existe]`));
if (!refsRotas.length) console.log('    (ninguno)');
console.log(`\n[3] PAGINAS HUERFANAS (${huerfanos.length}):`);
huerfanos.forEach(h => console.log(`    ${h}`));
if (!huerfanos.length) console.log('    (ninguna)');
console.log(`\n[4] SUPERSEDED ROTAS (${supRotas.length}):`);
supRotas.forEach(([n, r]) => console.log(`    ${n}  ->  ${r}   [decision inexistente]`));
if (!supRotas.length) console.log('    (ninguna)');
```

## §Herramientas — `.claude/herramientas/`

Contenido inicial de `.claude/herramientas/INDICE.md` (dos secciones por origen: `## Herramientas Base` poblada con la Herramienta Base que manda el harness + `## Herramientas del Propósito` con la tabla vacía — sin filas de ejemplo):

```markdown
# Herramientas del proyecto

Registro de las **Herramientas** del repo: las *tools* que el **Propósito** del repo requiere y el agente invoca para tareas repetibles. Tipos: `script`, `skill` local del repo, `MCP` local. Una fila por Herramienta. Ordena las herramientas desordenadas: qué es cada una, cómo se invoca, si sigue vigente.

> Los **lints de subsistema** (lint-memoria, lint-semantica, …) **no** van acá: son infra del Patrón de cada subsistema y viven con su subsistema (`.claude/<sub>/lint-<sub>/`). Acá solo van tools de dominio.

- **Herramienta** — nombre; si es tipo `script` con carpeta local, link a `<tool>/` (adentro, README + código). Si es `skill` o `MCP`, link a donde vive (`.claude/skills/<skill>/`, `.mcp.json`).
- **Tipo** — `script` | `skill` | `mcp`.
- **Qué hace** — una línea.
- **Cómo se invoca** — el comando (`script`), el nombre de skill que dispara el modelo (`skill`), o cómo se conecta y qué tool-calls expone (`mcp`).
- **Estado** — `vigente`, `experimental` u `obsoleto` (los obsoletos se pueden depurar).

> **Origen del contenido:** las Herramientas se separan por origen en dos secciones — **Herramientas Base** (las manda el Agente Multipropósito; el nivelador `amp:actualizar` reemplaza esa sección entera al poner al día un Agente con Propósito) y **Herramientas del Propósito** (las suma cada repo; el nivelador no las toca). Mismo molde que `conducta/INDICE.md` y que Base/Adaptaciones en `PREFERENCIAS.md`.

## Herramientas Base

Las que instala el harness (origen **Base**). El nivelador reemplaza **esta sección entera**; nunca abre la de abajo.

| Herramienta | Tipo | Qué hace | Cómo se invoca | Estado |
|-------------|------|----------|----------------|--------|
| [actualizar-plugins](actualizar-plugins/) | script | Pone al día los plugins que este Agente con Propósito tiene habilitados en esta máquina —los que le traen su Agente Multipropósito— y detecta los tres desfases: el marketplace bajado que no trajo lo publicado, el plugin que falta traer, y el silencioso —traído pero no cargado, porque la sesión arrancó antes—; marca aparte los plugins `RETIRADO` (nombres que el marketplace dejó de ofrecer ⇒ migración, no actualización). Sin `--aplicar` solo diagnostica; acepta ruta para apuntarlo a otro repo | `node .claude/herramientas/actualizar-plugins/actualizar-plugins.js [--aplicar] [rutaRepo]` | vigente |

## Herramientas del Propósito

Las que este repo suma para su Propósito (origen **aprendido**). El nivelador **no toca esta sección**.

| Herramienta | Tipo | Qué hace | Cómo se invoca | Estado |
|-------------|------|----------|----------------|--------|
```

Plantilla de la ficha `.claude/herramientas/<tool>/README.md` (tipo script):

```markdown
# <tool>

**Qué hace:** <una o dos frases>.
**Cómo se invoca:** `<comando>` <args si los hay>.
**Estado:** vigente | experimental | obsoleto.
**Referenciado por:** <settings.local.json / .gitignore / hook / otro script / nadie> — quién lo invoca por ruta.
**Dependencias:** <entorno de ejecución, libs, credenciales que necesita>.
**Origen (opcional):** <qué necesidad, plan o decisión lo generó — solo si aporta>.
**Notas (opcional):** <lo que haga falta>.
```

Memoria `.claude/memoria/feedback_herramientas.md`:

```markdown
---
name: herramientas
description: Convención de Herramientas del repo — las tools del Propósito (script/skill local/MCP local) en .claude/herramientas/ con registro INDICE.md (columna Tipo); los lints de subsistema NO son herramientas (viven con su subsistema); cuidado con refs por ruta en settings/.gitignore/hooks.
metadata:
  type: feedback
---

Las **Herramientas** del repo son las *tools* que el **Propósito** del repo requiere y el agente invoca para tareas repetibles. Tipos: `script`, `skill` local del repo, `MCP` local. Viven catalogadas en `.claude/herramientas/INDICE.md` — tabla (Herramienta | Tipo | Qué hace | Cómo se invoca | Estado). Cada fila apunta a donde vive la tool: un `script` en su carpeta `<tool>/` bajo herramientas, una `skill` en `.claude/skills/<skill>/`, un `MCP` en `.mcp.json`.

**Los lints de subsistema NO son Herramientas:** son infra del Patrón de cada subsistema (índice + entradas + lint) y viven con su subsistema (`.claude/<sub>/lint-<sub>/`). Acá solo van tools de dominio.

**Why:** que la colección de tools del Propósito no se vuelva un conjunto de herramientas desordenadas sin saber qué son, de dónde salieron ni cómo se usan. Ubicación determinística + registro escaneable + ficha por tool.

**How to apply:**

1. Toda Herramienta nueva va al registro `.claude/herramientas/INDICE.md` (una fila) con su `Tipo`. Un `script` vive en `.claude/herramientas/<tool>/` con su `README.md` (nunca suelto); una `skill`/`MCP` se apunta a donde vive.
2. Marcar `Estado`; los `obsoleto` se pueden depurar.
3. ⚠️ **Refs por ruta:** una tool referenciada por ruta en `settings.local.json`/`settings.json` (regla de permiso), en `.gitignore` o en un hook NO se mueve/renombra alegremente — rompe el match por prefijo exacto y se pierde la pre-autorización (en headless, denegación directa). Antes de mover, grep su ruta; si aparece, actualizar la referencia en el mismo paso.
4. **Al cerrar** una tarea que tocó Herramientas, correr el lint: `node .claude/herramientas/lint-herramientas/lint-herramientas.js` (README por herramienta local, registro completo, filas colgadas, refs por ruta de lint en settings).

Otras memorias, planes o conocimiento pueden referenciar una tool por su ruta explicando cómo usarla en su contexto.

Relacionado: [[flujo-planes]], [[base-conocimiento]].
```

Lint `.claude/herramientas/lint-herramientas/lint-herramientas.js` (Node, sin dependencias, sin red):

```js
#!/usr/bin/env node
// Lint del registro de Herramientas: README por herramienta con carpeta local, herramienta en indice,
// filas colgadas (link a subdir local inexistente), refs por ruta de lint en settings. Sin LLM, sin red.
// Uso: node lint-herramientas.js [<carpeta herramientas>]   (default: .claude/herramientas)
const fs = require('fs'), path = require('path');
const root = path.resolve(process.argv[2] || '.claude/herramientas');
const idxPath = path.join(root, 'INDICE.md');
const idx = fs.existsSync(idxPath) ? fs.readFileSync(idxPath, 'utf8') : '';

// subdirectorios = herramientas tipo script/tool que viven aca (skill/MCP viven en su casa nativa).
// El lint co-ubicado del propio subsistema (lint-<sub>) NO es una Herramienta: se excluye.
const selfLint = 'lint-' + path.basename(root);
const tools = fs.existsSync(root)
  ? fs.readdirSync(root, { withFileTypes: true }).filter(e => e.isDirectory() && e.name !== selfLint).map(e => e.name)
  : [];

// [1] README por herramienta con carpeta local
const sinReadme = tools.filter(t => !fs.existsSync(path.join(root, t, 'README.md')));

// [2] carpeta local fuera del indice
const fueraIndice = tools.filter(t => !idx.includes(t));

// [3] filas del indice cuyo link apunta a un subdir LOCAL inexistente
//     (se saltan links externos: ../skills/, .mcp.json, etc. — esos no viven bajo herramientas/)
const colgadas = [];
for (const line of idx.split('\n')) {
  const t = line.trim();
  if (!t.startsWith('|')) continue;
  const cells = t.split('|').slice(1, -1).map(c => c.trim());
  if (cells.length < 2) continue;
  const c0 = cells[0];
  if (/^:?-{2,}:?$/.test(c0.replace(/\s/g, ''))) continue;     // separador
  if (/^herramienta$/i.test(c0.replace(/[*\s]/g, ''))) continue; // header
  const m = /\]\(([^)]+?)\)/.exec(c0);                          // link [x](target)
  if (!m) continue;                                             // fila sin link -> no se valida ruta
  const target = m[1].trim();
  if (target.startsWith('..') || target.includes('.json') || /^\w+:/.test(target)) continue; // externo
  const name = target.replace(/\/$/, '').replace(/[`]/g, '').trim();
  if (name && !fs.existsSync(path.join(root, name))) colgadas.push(name);
}

// [4] refs por ruta a lints en settings que no resuelven (cualquier .claude/**/*.js|sh|...)
// La raiz del repo se deduce de la ubicacion del propio lint: .claude/<sub>/lint-<sub>/ -> 3 arriba.
// La profundidad la fija el instalador; no depende de desde donde se invoque.
const repoRoot = path.resolve(__dirname, '..', '..', '..');
const refsRotas = [];
for (const sf of ['.claude/settings.local.json', '.claude/settings.json']) {
  const abs = path.join(repoRoot, sf);
  if (!fs.existsSync(abs)) continue;
  const txt = fs.readFileSync(abs, 'utf8');
  // rama 1: ruta absoluta de Windows con espacios (X:\...\.claude\...); rama 2: relativa como antes.
  // extension anclada con (?![\w]) para que `settings.json` no matchee como `settings.js` (cuantificador no-greedy).
  const re = /([A-Za-z]:[\\/][^"'\n]*?\.claude[\\/][^"'\n]+?\.(?:mjs|cjs|js|sh|py|ts)(?![\w])|[.\w/-]*\.claude\/[\w./-]+?\.(?:mjs|cjs|js|sh|py|ts)(?![\w]))/g;
  let m;
  while ((m = re.exec(txt))) {
    const p = m[1], cand = path.isAbsolute(p) ? p : path.join(repoRoot, p);
    if (!fs.existsSync(cand)) refsRotas.push([sf, p]);
  }
}

console.log(`== LINT HERRAMIENTAS: ${root} ==`);
console.log(`herramientas con carpeta local: ${tools.length}\n`);
console.log(`[1] SIN README (${sinReadme.length}):`);
sinReadme.forEach(t => console.log(`    ${t}/`));
if (!sinReadme.length) console.log('    (todas tienen README)');
console.log(`\n[2] FUERA DEL INDICE (${fueraIndice.length}):`);
fueraIndice.forEach(t => console.log(`    ${t}/`));
if (!fueraIndice.length) console.log('    (completo)');
console.log(`\n[3] FILAS COLGADAS (${colgadas.length}):`);
colgadas.forEach(c => console.log(`    ${c}   [subdir local no existe]`));
if (!colgadas.length) console.log('    (ninguna)');
console.log(`\n[4] REFS POR RUTA DE LINT ROTAS EN SETTINGS (${refsRotas.length}):`);
refsRotas.forEach(([f, p]) => console.log(`    ${f}  ->  ${p}   [no existe]`));
if (!refsRotas.length) console.log('    (ninguna)');
```

## §Script — actualizar-plugins — `.claude/herramientas/actualizar-plugins/actualizar-plugins.js`

Herramienta **Base** del subsistema `herramientas` (va en la sección `## Herramientas Base` del registro). Pone al día los plugins que traen el Agente Multipropósito a este repo: se sirven de una copia local del catálogo, y entre lo publicado, lo que tiene esa copia, lo instalado y lo que la sesión cargó al arrancar puede haber tres desfases distintos, ninguno de los cuales se anuncia solo.

Contenido exacto (Node, sin dependencias; consulta el commit publicado con `git ls-remote`, y sin salida a red estima con lo que hay en disco):

```js
#!/usr/bin/env node
// actualizar-plugins.js — pone al dia los PLUGINS del Agente Multiproposito en esta maquina.
//
// Un cambio viaja por varias paradas y CADA UNA guarda su copia: se publica en el repo remoto, de ahi
// se baja el MARKETPLACE (una carpeta por marketplace en la maquina), de ahi se INSTALA el plugin para
// un repo, y la SESION carga lo instalado al arrancar. Entre parada y parada puede haber desfase:
//   1) publicado <-> bajado      (el marketplace bajado no trajo lo ultimo)  -> se arregla con --aplicar
//   2) bajado    <-> instalado   (falta traer la version nueva)              -> se arregla con --aplicar
//   3) instalado <-> cargado     (se trajo pero la sesion no la tomo)        -> se arregla REINICIANDO
// El (1) y el (3) son los silenciosos: el (1) porque lo "disponible" sale del marketplace bajado, asi
// que uno viejo da ACTUALIZADO sobre datos viejos; el (3) porque `claude plugin list` dice la version
// nueva mientras la sesion corre la vieja.
//
//   node .claude/herramientas/actualizar-plugins/actualizar-plugins.js            (solo diagnostica)
//   node .claude/herramientas/actualizar-plugins/actualizar-plugins.js --aplicar  (actualiza)
//
// Sin argumentos NO toca nada: sirve como control de desfase disco<->cargado.
// Generico: no hardcodea nombres de plugin ni de marketplace — sale de `enabledPlugins` del repo.
// Sin process.exit(1): reporta, no frena — es capa mecanica, el juicio queda del lado del agente.

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');

const APLICAR = process.argv.includes('--aplicar');
let ARRANQUE = null;   // se completa abajo, una sola vez (consultar el proceso cuesta ~150 ms)
// Acepta una ruta de repo como argumento (para apuntarlo a otro Agente Multiproposito de la maquina);
// por omision, el propio.
const RUTA_ARG = process.argv.slice(2).find(a => !a.startsWith('--'));
const REPO = RUTA_ARG ? path.resolve(RUTA_ARG) : path.resolve(__dirname, '..', '..', '..');
const PLUGINS_DIR = path.join(os.homedir(), '.claude', 'plugins');

function leerJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { return null; }
}

// git de una linea: devuelve la salida o null si el comando falla, no existe el repo o vence.
function gitEn(dir, args, timeout = 5000) {
  const r = spawnSync('git', args, { cwd: dir, encoding: 'utf8', timeout });
  if (!r || r.status !== 0) return null;
  return (r.stdout || '').trim() || null;
}

// Dos URLs de git apuntan al mismo repo: se compara <duenio>/<repo>, sin .git ni protocolo,
// para que "https://github.com/X/Y.git", "git@github.com:X/Y" y "X/Y" den todos lo mismo.
function mismoRemoto(a, b) {
  const cola = s => (s || '').trim().toLowerCase().replace(/\.git$/, '').replace(/\/+$/, '')
    .split(/[/:]/).filter(Boolean).slice(-2).join('/');
  return !!a && !!b && cola(a) === cola(b) && cola(a).includes('/');
}

function hace(iso) {
  const t = new Date(iso);
  if (isNaN(t.getTime())) return null;
  const min = Math.round((Date.now() - t.getTime()) / 60000);
  if (min < 60) return `hace ${min} min`;
  if (min < 60 * 48) return `hace ${Math.round(min / 60)} h`;
  return `hace ${Math.round(min / 1440)} dias`;
}

// -- cuando arranco esta sesion: los plugins que se actualizaron DESPUES no estan cargados --
// El harness expone el pid de la sesion en CLAUDE_PID. Si no se puede averiguar (otro agente, otro
// sistema), devuelve null y el chequeo de "cargado" se omite en vez de mentir.
function arranqueSesion() {
  // `CLAUDE_PID` es de la sesion que corre ESTE script, que vive en su propio repo. Si se apunto la
  // Herramienta a otro repo, alla no hay sesion abierta que conocer: comparar contra el arranque de
  // la propia marcaria "sin cargar" plugins que ninguna sesion tenia que haber cargado.
  const PROPIO = path.resolve(__dirname, '..', '..', '..');
  if (REPO !== PROPIO) return null;
  const pid = process.env.CLAUDE_PID;
  if (!pid || !/^\d+$/.test(pid)) return null;
  try {
    let r;
    if (process.platform === 'win32') {
      r = spawnSync('powershell', ['-NoProfile', '-Command',
        `(Get-Process -Id ${pid}).StartTime.ToUniversalTime().ToString("o")`], { encoding: 'utf8', timeout: 10000 });
    } else {
      r = spawnSync('ps', ['-o', 'lstart=', '-p', pid], { encoding: 'utf8', timeout: 10000 });
    }
    const t = (r.stdout || '').trim();
    if (!t) return null;
    const d = new Date(t);
    return isNaN(d.getTime()) ? null : d;
  } catch (e) { return null; }
}

// -- que plugins usa este repo: enabledPlugins del settings del repo + el del usuario --
function plugesHabilitados() {
  const ids = new Set();
  const fuentes = [
    path.join(REPO, '.claude', 'settings.json'),
    path.join(REPO, '.claude', 'settings.local.json'),
    path.join(os.homedir(), '.claude', 'settings.json'),
  ];
  for (const f of fuentes) {
    const j = leerJson(f);
    if (!j || !j.enabledPlugins) continue;
    for (const [id, on] of Object.entries(j.enabledPlugins)) if (on) ids.add(id);
  }
  return [...ids];
}

// -- version que CORRE: la entrada de installed_plugins.json que aplica a este repo --
function instalado(id) {
  const j = leerJson(path.join(PLUGINS_DIR, 'installed_plugins.json'));
  const entradas = (j && j.plugins && j.plugins[id]) || [];
  // El registro guarda UNA ENTRADA POR REPO (`projectPath`): dos repos de la misma maquina pueden
  // correr versiones distintas del mismo plugin. Asi que vale la entrada de ESTE repo, la de alcance
  // usuario (aplica a todos) o una sin repo declarado — NUNCA la de otro repo: dar por instalado acá
  // lo que esta instalado allá es el modo de falla que este script existe para no cometer.
  const propia = entradas.find(e => e.projectPath && path.resolve(e.projectPath) === REPO);
  const usuario = entradas.find(e => e.scope === 'user');
  const sinRepo = entradas.find(e => !e.projectPath);
  return propia || usuario || sinRepo || null;
}

function marketplaceRegistrado(marketplace) {
  const mkts = leerJson(path.join(PLUGINS_DIR, 'known_marketplaces.json')) || {};
  return mkts[marketplace] || null;
}

// -- version que declara un marketplace: sirve para el bajado y para el repo que lo publica --
// `raiz` es la carpeta que contiene `.claude-plugin/marketplace.json`; ese archivo apunta con
// `source` a la carpeta de cada plugin, y ahi vive el `plugin.json` con la version.
function versionDe(raiz, nombre) {
  const catalogo = leerJson(path.join(raiz, '.claude-plugin', 'marketplace.json'));
  if (!catalogo || !Array.isArray(catalogo.plugins)) return { error: 'catalogo ilegible' };
  const fila = catalogo.plugins.find(p => p.name === nombre);
  // Habilitado pero ausente del catalogo = el marketplace ya no lo ofrece (renombrado o dado de baja).
  // No es "sin dato": es un plugin colgado, y actualizarlo no lo arregla — hay que migrar los nombres.
  if (!fila) return { retirado: true };
  // `source` es una ruta relativa dentro del marketplace ("./funcionalidades/amp"). Algunos marketplaces
  // lo declaran como objeto (origen remoto propio): ahi el manifiesto no esta en la carpeta bajada.
  const origen = fila.source === undefined ? '.' : fila.source;
  if (typeof origen !== 'string') return { error: 'el plugin se sirve de un origen propio, no del marketplace bajado' };
  const manifiesto = leerJson(path.join(raiz, origen, '.claude-plugin', 'plugin.json'));
  if (!manifiesto) return { error: 'plugin.json ilegible' };
  // Sin campo `version` el plugin se versiona por commit: se compara el sha del arbol.
  if (!manifiesto.version) return { version: null, sha: gitEn(raiz, ['rev-parse', 'HEAD']) };
  return { version: manifiesto.version, sha: null };
}

// -- version DISPONIBLE: la del marketplace bajado, leyendo el plugin.json que apunta su catalogo --
function disponible(nombre, marketplace) {
  const mkt = marketplaceRegistrado(marketplace);
  if (!mkt || !mkt.installLocation) return { error: 'marketplace no registrado' };
  return versionDe(mkt.installLocation, nombre);
}

// -- primer desfase: el MARKETPLACE BAJADO atrasado respecto de lo PUBLICADO --
// Todo lo "disponible" de mas abajo sale del marketplace bajado, que se refresca solo en segundo plano:
// entre que se publica una version y el bajado la trae, la comparacion diria ACTUALIZADO sobre datos viejos.
// Se pregunta al remoto (barato, ~0.6 s, y no toca lo bajado: `ls-remote` no trae ni escribe nada) y,
// si no hay salida a red, se estima con lo que hay en disco en vez de dar por bueno lo no verificado.
//
// El estado es la ACCION que corresponde, no el diagnostico: `ACTUALIZADO` (verificado, no hay nada que
// hacer) o `ACTUALIZAR` (esta atrasado, o no se pudo verificar que no lo este). Los dos casos se
// resuelven igual y refrescar de mas sale casi nada — se comparan las versiones, no difieren, sigue.
// El motivo puntual queda en el detalle, que se lee solo si interesa.
function estadoCatalogo(marketplace, nombres) {
  const mkt = marketplaceRegistrado(marketplace);
  if (!mkt || !mkt.installLocation) return { estado: 'SIN DATO', detalle: 'marketplace no registrado' };
  const bajado = mkt.installLocation;
  const local = gitEn(bajado, ['rev-parse', 'HEAD']);
  // Un marketplace servido de una carpeta de la maquina no tiene "publicado" contra que comparar.
  if (!local) return { estado: 'N/A', detalle: 'no se trae de un repo git (marketplace servido de una carpeta)' };

  const publicado = (gitEn(bajado, ['ls-remote', 'origin', 'HEAD']) || '').split(/\s+/)[0] || null;
  if (publicado) {
    if (publicado === local) return { estado: 'ACTUALIZADO', detalle: `bajado ${local.slice(0, 12)} = publicado` };
    return {
      estado: 'ACTUALIZAR',
      detalle: `bajado ${local.slice(0, 12)} · publicado ${publicado.slice(0, 12)}`,
      versiones: versionesQueFaltan(marketplace, mkt, bajado, nombres),
    };
  }

  // Sin red: estimar. Si este repo es el que PUBLICA el marketplace, su arbol es la mejor referencia
  // que hay en disco — y es justo el caso del autor, que acaba de publicar y todavia no le llego.
  const origenRepo = gitEn(REPO, ['remote', 'get-url', 'origin'], 3000);
  const declarado = (mkt.source && (mkt.source.repo || mkt.source.url)) || null;
  if (mismoRemoto(origenRepo, declarado)) {
    const headRepo = gitEn(REPO, ['rev-parse', 'HEAD']);
    if (headRepo && headRepo !== local) return {
      estado: 'ACTUALIZAR',
      detalle: `sin red: bajado ${local.slice(0, 12)} · este repo (lo publica) ${headRepo.slice(0, 12)}`,
      versiones: versionesQueFaltan(marketplace, mkt, bajado, nombres),
    };
    if (headRepo) return { estado: 'ACTUALIZADO', detalle: `sin red: bajado ${local.slice(0, 12)} = este repo, que lo publica` };
  }
  const edad = mkt.lastUpdated ? hace(mkt.lastUpdated) : null;
  return {
    estado: 'ACTUALIZAR',
    detalle: `sin salida a red · el marketplace se bajo ${edad || 'en fecha desconocida'}`,
  };
}

// Cuando el marketplace bajado quedo atras, decir QUE cambia: se comparan las versiones que declara
// lo bajado contra las del repo que lo publica, si esta en esta maquina. Sin ese repo no se
// puede saber (leer el arbol del remoto exigiria traerlo, que es lo que hace `--aplicar`).
function versionesQueFaltan(marketplace, mkt, bajado, nombres) {
  const origenRepo = gitEn(REPO, ['remote', 'get-url', 'origin'], 3000);
  const declarado = (mkt.source && (mkt.source.repo || mkt.source.url)) || null;
  if (!mismoRemoto(origenRepo, declarado)) return null;
  const cambios = [];
  for (const n of nombres) {
    const enCatalogo = versionDe(bajado, n);
    const enRepo = versionDe(REPO, n);
    if (!enCatalogo.version || !enRepo.version) continue;
    if (enCatalogo.version !== enRepo.version) cambios.push(`${n}: bajado ${enCatalogo.version} · este repo ${enRepo.version}`);
  }
  return cambios.length ? cambios : null;
}

// -- diagnostico: una fila por plugin habilitado --
function diagnosticar() {
  const filas = [];
  for (const id of plugesHabilitados().sort()) {
    const [nombre, marketplace] = id.split('@');
    if (!marketplace) continue;   // plugin sin marketplace (skills-dir u otra fuente): no aplica
    const inst = instalado(id);
    const disp = disponible(nombre, marketplace);
    let estado, detalle;
    if (disp.retirado) {
      estado = 'RETIRADO';
      detalle = `habilitado, pero ${marketplace} ya no lo ofrece (renombrado o dado de baja)`;
    } else if (!inst) {
      estado = 'NO INSTALADO';
      detalle = 'habilitado en settings pero sin entrada instalada';
    } else if (disp.error) {
      estado = 'SIN DATO';
      detalle = disp.error;
    } else if (disp.version) {
      estado = inst.version === disp.version ? 'ACTUALIZADO' : 'ACTUALIZAR';
      detalle = `corre ${inst.version} · disponible ${disp.version}`;
    } else if (disp.sha) {
      const igual = (inst.gitCommitSha || '').startsWith(disp.sha.slice(0, 12));
      estado = igual ? 'ACTUALIZADO' : 'ACTUALIZAR';
      detalle = `versiona por commit · corre ${(inst.gitCommitSha || '?').slice(0, 12)} · disponible ${disp.sha.slice(0, 12)}`;
    } else {
      estado = 'SIN DATO';
      detalle = 'no se pudo determinar la version disponible';
    }
    // Segundo desfase: se trajo la version nueva DESPUES de que arranco la sesion => no esta cargada.
    let sinCargar = false;
    if (ARRANQUE && inst && inst.lastUpdated) {
      const t = new Date(inst.lastUpdated);
      if (!isNaN(t.getTime()) && t > ARRANQUE) sinCargar = true;
    }
    filas.push({ id, nombre, marketplace, estado, detalle, sinCargar, scope: (inst && inst.scope) || 'project' });
  }
  return filas;
}

// Una linea por marketplace en juego (no por plugin): lo bajado es compartido por todos sus plugins.
function imprimirCatalogos(filas) {
  const nombresPorMkt = new Map();
  for (const f of filas) {
    if (!nombresPorMkt.has(f.marketplace)) nombresPorMkt.set(f.marketplace, []);
    nombresPorMkt.get(f.marketplace).push(f.nombre);
  }
  const salida = [];
  for (const [m, nombres] of nombresPorMkt) salida.push({ marketplace: m, ...estadoCatalogo(m, nombres) });
  const ancho = Math.max(...salida.map(c => c.marketplace.length), 10);
  console.log('\nMARKETPLACES BAJADOS (de donde sale lo "disponible" de arriba)\n');
  for (const c of salida) {
    console.log(`  ${c.marketplace.padEnd(ancho)}  ${c.estado.padEnd(15)} ${c.detalle}`);
    for (const v of (c.versiones || [])) console.log(`  ${' '.repeat(ancho)}  ${' '.repeat(15)} ${v}`);
  }
  return salida;
}

function imprimir(filas) {
  const ancho = Math.max(...filas.map(f => f.id.length), 10);
  for (const f of filas) {
    const marca = f.sinCargar ? ' [SIN CARGAR]' : '';
    console.log(`  ${f.id.padEnd(ancho)}  ${f.estado.padEnd(15)} ${f.detalle}${marca}`);
  }
}

// -- aplicar: refrescar el catalogo del marketplace y actualizar lo desactualizado --
// El CLI exige el identificador COMPLETO (plugin@marketplace) y el alcance: con el nombre pelado
// o con el alcance por omision falla con el mismo mensaje, `Plugin "x" not found`.
function aplicar(filas) {
  // `--scope project` significa "el proyecto del directorio donde corre el comando", asi que TODO
  // spawn va con `cwd: REPO`. Sin eso, apuntar la Herramienta a otro repo diagnosticaria alla y
  // escribiria aca — el mismo error de confundir un repo con otro que corrige `instalado()`.
  const correr = args => {
    const r = spawnSync('claude', args, { cwd: REPO, encoding: 'utf8', shell: true, timeout: 180000 });
    return ((r.stdout || r.stderr || '').trim().split('\n').pop() || 'sin salida');
  };

  const marketplaces = [...new Set(filas.map(f => f.marketplace))];
  for (const m of marketplaces) {
    console.log(`\n> Refrescando el marketplace ${m}...`);
    console.log('  ' + correr(['plugin', 'marketplace', 'update', m]));
  }

  // Releer: refrescar el marketplace puede haber cambiado que esta desactualizado.
  const pendientes = diagnosticar().filter(f => f.estado === 'ACTUALIZAR' || f.estado === 'NO INSTALADO');
  if (!pendientes.length) {
    console.log('\nNada que actualizar despues de refrescar el marketplace.');
    return;
  }
  for (const f of pendientes) {
    // Lo que no esta se INSTALA; lo que esta y quedo atras se ACTUALIZA. `update` sobre un plugin
    // ausente falla con "not found", que se lee como si el nombre estuviera mal.
    // Y se relee el estado en cada vuelta: instalar un plugin con dependencias arrastra las suyas,
    // asi que las que venian pendientes pueden haber entrado solas.
    const yaEsta = instalado(f.id);
    if (f.estado === 'NO INSTALADO' && yaEsta) {
      console.log(`\n> ${f.id}: entro como dependencia, no hace falta instalarlo aparte.`);
      continue;
    }
    const accion = yaEsta ? 'update' : 'install';
    console.log(`\n> ${accion === 'install' ? 'Instalando' : 'Actualizando'} ${f.id} (alcance ${f.scope})...`);
    console.log('  ' + correr(['plugin', accion, f.id, '--scope', f.scope]));
  }
}

// ---------------------------------------------------------------------------
console.log(`== ACTUALIZAR PLUGINS: ${REPO} ==`);

ARRANQUE = arranqueSesion();
let filas = diagnosticar();
if (!filas.length) {
  console.log('\nNingun plugin habilitado para este repo (enabledPlugins vacio o ausente).');
} else {
  console.log('');
  imprimir(filas);

  const desfasados = filas.filter(f => f.estado === 'ACTUALIZAR' || f.estado === 'NO INSTALADO');
  const retirados = filas.filter(f => f.estado === 'RETIRADO');

  // Estado de lo bajado: sin esto, lo "disponible" de la tabla de arriba no se puede creer.
  const catalogos = imprimirCatalogos(filas);
  const catalogoDudoso = catalogos.filter(c => c.estado === 'ACTUALIZAR');

  if (APLICAR) {
    aplicar(filas);
    console.log('\n-- despues de aplicar --\n');
    filas = diagnosticar();
    imprimir(filas);
    console.log('\nREINICIAR LA SESION para que los cambios tomen efecto.');
    console.log('(`/reload-plugins` no alcanza: recarga los plugins en la version que ya tenian.)');
  } else if (desfasados.length) {
    console.log(`\n${desfasados.length} plugin(s) con desfase. Para nivelarlos:`);
    console.log('  node .claude/herramientas/actualizar-plugins/actualizar-plugins.js --aplicar');
  } else if (catalogoDudoso.length) {
    console.log('\nCADA PLUGIN COINCIDE CON LO BAJADO, PERO EL MARKETPLACE HAY QUE ACTUALIZARLO');
    console.log('(esta atrasado, o no se pudo verificar que no lo este). Refrescarlo y volver a comparar:');
    console.log('  node .claude/herramientas/actualizar-plugins/actualizar-plugins.js --aplicar');
  } else if (!retirados.length && !filas.some(f => f.sinCargar)) {
    console.log('\nTODO ACTUALIZADO.');
  }

  // Desfase silencioso: la version esta instalada pero la sesion arranco antes de traerla.
  const sinCargar = filas.filter(f => f.sinCargar);
  if (sinCargar.length) {
    console.log(`\n${sinCargar.length} plugin(s) SIN CARGAR: se actualizaron despues de que arranco esta`);
    console.log('sesion, asi que segui corriendo la version vieja aunque el registro diga la nueva.');
    console.log('REINICIAR LA SESION para tomarlos.');
    console.log('  ' + sinCargar.map(f => `${f.id} (traido ${f.detalle.replace(/^.*disponible /, '')})`).join('\n  '));
  } else if (!ARRANQUE) {
    console.log(RUTA_ARG
      ? '\n(Chequeo de "sin cargar" omitido: se apunto a otro repo, y alla no hay sesion que mirar.)'
      : '\n(No se pudo determinar cuando arranco la sesion: el chequeo de "sin cargar" se omitio.)');
  }

  // Los retirados no se arreglan actualizando: son nombres que el marketplace dejo de ofrecer.
  // Se imprime el comando y NO se ejecuta, ni siquiera con --aplicar: desinstalar es destructivo y
  // NO es reversible desde el marketplace (esos nombres ya no estan ahi para volver a instalarlos).
  // Ademas, sacar lo viejo antes de que entre lo nuevo deja el repo sin skills — de ahi el orden.
  if (retirados.length) {
    console.log(`\n${retirados.length} plugin(s) RETIRADO(S): este repo quedo en una generacion de nombres`);
    console.log('que el marketplace ya no ofrece. Actualizar no los arregla: hay que instalar el conjunto');
    console.log('nuevo y recien despues sacar estos (migracion, no actualizacion).');
    console.log('\nORDEN: 1) instalar lo nuevo  2) desinstalar lo viejo  3) reiniciar la sesion.');
    console.log('Nunca al reves: entre medio el repo se queda sin las skills que todavia usa.');
    console.log('\nPara el paso 2, cuando lo nuevo ya este instalado (ojo el alcance de cada uno:');
    console.log('es normal que los viejos esten en project y los nuevos en local, y con el alcance');
    console.log('equivocado el comando no encuentra nada y no borra nada, sin error claro):');
    for (const f of retirados) console.log(`  claude plugin uninstall ${f.id} --scope ${f.scope}`);
    console.log('\nCada uninstall saca solo su linea de `enabledPlugins`; no hace falta editar el settings');
    console.log('a mano. `claude plugin prune` NO sirve para limpiar acá: solo mira el alcance de usuario.');
  }
}
```

Ficha `.claude/herramientas/actualizar-plugins/README.md`:

````markdown
# actualizar-plugins

Pone al día los **plugins** que este Agente con Propósito tiene habilitados en esta máquina —los que le traen su Agente Multipropósito—, y sirve de control de desfase.

```bash
# diagnostica, no toca nada
node .claude/herramientas/actualizar-plugins/actualizar-plugins.js

# actualiza lo que esté atrás y vuelve a verificar
node .claude/herramientas/actualizar-plugins/actualizar-plugins.js --aplicar

# apuntarlo a otro repo de la máquina
node .claude/herramientas/actualizar-plugins/actualizar-plugins.js "D:/Proyectos/otro-repo"
```

## Por qué hace falta

Hay **tres desfases distintos**, y el primero y el tercero son los que engañan:

1. **Publicado ↔ bajado** — el marketplace bajado todavía no trajo lo último. Engaña porque *todo lo demás se compara contra lo bajado*: si está viejo, un plugin atrasado se informa `ACTUALIZADO`. Se arregla con `--aplicar`.
2. **Bajado ↔ instalado** — el marketplace bajado tiene una versión nueva que esta máquina no instaló. Se arregla con `--aplicar`.
3. **Instalado ↔ cargado** — se instaló, pero la **sesión viva** sigue con la versión que cargó al arrancar. Se arregla **reiniciando**, y es silencioso: `claude plugin list` muestra la versión nueva mientras la sesión corre la vieja.

Los tres pasaron el 25/07/2026:

- Por la tarde, `amp` corría la 0.6.2 con la 0.6.3 publicada seis commits atrás. La versión vieja no tenía una preferencia Base que sí estaba escrita en el repo, así que el instalador habría sembrado preferencias viejas en un repo nuevo.
- A la noche, después de publicar la 0.6.5, el plugin **se trajo solo en segundo plano** (registro actualizado 00:12) pero la sesión —arrancada a las 19:34— siguió ejecutando la 0.6.3. La skill se cargó desde la carpeta vieja de la caché sin que nada lo indicara.
- Más tarde, publicada la 0.6.6, el marketplace bajado se había refrescado **doce minutos antes** del push. La Herramienta informó `TODO ACTUALIZADO` sobre un catálogo que no tenía la versión nueva: lo instalado coincidía con lo bajado, y lo bajado estaba viejo.

De ahí salen los dos chequeos que no se leen de un archivo:

- **Cargado**: se compara la hora en que se actualizó cada plugin contra la hora en que arrancó la sesión (por `CLAUDE_PID`). Si el plugin es más nuevo, lo marca `[SIN CARGAR]`. Si no puede averiguar el arranque —otro agente, otro sistema— lo dice y omite ese chequeo, en vez de dar por buena una comparación que no hizo.
- **Catálogo**: se le pregunta al remoto por el commit publicado con `git ls-remote` (~0,6 s, y no toca lo bajado: no trae ni escribe nada). Sin salida a red hay una reserva, abajo.

## Qué compara

Por cada plugin habilitado para el repo (`enabledPlugins` de `.claude/settings.json`, `settings.local.json` y el del usuario):

| Estado | Qué significa |
|--------|---------------|
| `ACTUALIZADO` | Lo que corre coincide con lo disponible |
| `ACTUALIZAR` | Hay versión nueva sin traer |
| `RETIRADO` | Está habilitado pero el marketplace ya no lo ofrece — el repo quedó en una generación de nombres vieja. **Actualizar no lo arregla**: es una migración (desinstalar los nombres viejos, instalar el conjunto nuevo) |
| `NO INSTALADO` | Habilitado en `settings` pero sin entrada instalada |
| `SIN DATO` | El plugin se sirve de un origen propio, o el catálogo no se pudo leer |

Y una marca aparte, que se suma a cualquiera de esos estados:

| Marca | Qué significa |
|-------|---------------|
| `[SIN CARGAR]` | El plugin se actualizó **después** de que arrancó esta sesión: está instalado pero la sesión sigue con la versión vieja. No se arregla con `--aplicar` — hay que **reiniciar** |

- **Lo instalado** sale de `installed_plugins.json`, prefiriendo la entrada de este repo sobre la de alcance usuario.
- **Lo disponible** sale del `plugin.json` dentro del marketplace bajado. Si ese manifiesto no declara `version`, el plugin se versiona por commit y se comparan los sha.
- **Lo cargado** no se lee: se deduce comparando el `lastUpdated` de cada plugin contra la hora de arranque del proceso de la sesión (`CLAUDE_PID`). Si el plugin es posterior, no está cargado.

## El estado de los marketplaces bajados

Una línea por marketplace, no por plugin: lo bajado es compartido por todos los plugins que sirve, y de ahí sale la columna *disponible*.

La columna dice **la acción que corresponde**, no el diagnóstico:

| Estado | Qué significa |
|--------|---------------|
| `ACTUALIZADO` | Verificado: lo bajado está en el mismo commit que lo publicado. No hay nada que hacer |
| `ACTUALIZAR` | Lo bajado está atrasado, **o** no se pudo verificar que no lo esté. Los dos casos se resuelven igual, y refrescar de más sale casi nada: se comparan las versiones, no difieren, sigue. El motivo puntual queda en el detalle de al lado |
| `N/A` | El marketplace se sirve de una carpeta de la máquina: no hay "publicado" contra qué comparar |

Se averigua por dos vías, en orden:

1. **Por red** — `git ls-remote origin HEAD` sobre el marketplace bajado devuelve el commit publicado sin traer nada. Es la vía normal: **0,6 s**.
2. **Sin red, por estimación** — si la consulta falla o vence (5 s), se compara contra el **repo que publica el marketplace**, cuando ese repo es justamente desde donde se corre la Herramienta (se detecta comparando el `origin` del repo contra el que declara el catálogo). Es el caso del autor, que acaba de publicar y todavía no le llegó. Si el repo no publica ese marketplace, no hay con qué estimar: queda `ACTUALIZAR` y el detalle dice hace cuánto se bajó.

Cuando lo bajado está en `ACTUALIZAR` **y** el repo desde donde se corre es el que publica, se listan además las versiones que cambian (`amp: bajado 0.6.5 · este repo 0.6.6`). Desde un consumidor eso no se puede saber: leer el árbol del remoto exigiría traerlo, que es lo que hace `--aplicar`.

⚠️ Con un marketplace en `ACTUALIZAR`, la Herramienta **no dice `TODO ACTUALIZADO`** aunque cada plugin coincida con lo bajado: avisa que la comparación se hizo contra datos que pueden estar viejos y remite a `--aplicar`.

Es genérico: no hardcodea nombres de plugin ni de marketplace, así que también reporta los plugins ajenos al harness que el repo tenga habilitados.

## Apuntarla a otro repo

Pasándole una ruta diagnostica —y con `--aplicar`, arregla— **otro** Agente con Propósito de la máquina, sin abrir una sesión ahí. Tres cosas cambian respecto de correrla sobre el propio, y las tres son casos donde antes contestaba de más:

- **Lo instalado es por repo.** `installed_plugins.json` guarda una entrada por `projectPath`: dos repos de la misma máquina pueden correr versiones distintas del mismo plugin. Sin entrada propia (ni de alcance usuario) el plugin está `NO INSTALADO` — nunca se toma la entrada de otro repo.
- **Los comandos corren en el repo apuntado.** `--scope project` significa "el proyecto del directorio donde corre el comando", así que todo se lanza con ese directorio como raíz. Sin eso, diagnosticaría allá y escribiría acá.
- **El chequeo de `[SIN CARGAR]` se omite.** Se deduce del arranque de la sesión que ejecuta el script, y en el repo apuntado no hay ninguna sesión que mirar. Se dice explícitamente en vez de marcar plugins que nadie tenía que haber cargado.

## Qué corre con `--aplicar`

```
claude plugin marketplace update <marketplace>
claude plugin update <plugin>@<marketplace> --scope <alcance>
```

⚠️ Las dos partes del segundo comando son obligatorias: con el nombre pelado (`claude plugin update amp`) o con el alcance por omisión falla con el mismo mensaje, `Plugin "amp" not found`, que no dice cuál de las dos falta. Por eso conviene correr esto y no los comandos a mano.

Refresca el catálogo primero y **vuelve a diagnosticar** antes de actualizar: traer el catálogo puede cambiar qué está atrasado.

**Después hay que reiniciar la sesión.** `/reload-plugins` no alcanza: recarga los plugins en la versión que ya tenían.

## Lo que no hace

- **No escribe el handoff.** Un script no sabe en qué venías trabajando; eso lo redacta el agente antes de llamarlo.
- **No toca los archivos de `.claude/`.** Esa es la otra fase, y la pone al día `amp:actualizar`.
- **No desinstala los nombres retirados.** Imprime el comando exacto y el orden; ejecutarlo es tuyo (ver abajo).

## Los nombres retirados

Un `RETIRADO` no se arregla actualizando: el nombre ya no está en el marketplace, así que no hay versión nueva que traer. Es una migración, y **el orden importa**:

1. **Instalar el conjunto nuevo.**
2. **Desinstalar los viejos** — la Herramienta imprime una línea por cada uno, con el alcance que corresponde:
   ```
   claude plugin uninstall <plugin>@<marketplace> --scope <alcance>
   ```
   Y sacar además su línea de `enabledPlugins` del `settings` donde esté declarado.
3. **Reiniciar la sesión.**

**Al revés no**: entre el paso 2 y el 1 el repo se queda sin las skills que todavía usa. Y desinstalar **no es reversible desde el marketplace** — esos nombres ya no están ahí para volver a instalarlos.

Por eso la Herramienta **imprime el comando pero no lo ejecuta**, ni siquiera con `--aplicar`. Para ver qué dependencias quedarían sin dueño sin tocar nada: `claude plugin prune --dry-run`.

⚠️ Mientras conviven, **el viejo y el nuevo no se pisan: coexisten**. `memoria-local` y `amp-memoria` traen los dos una skill `registrar-memoria`, con la misma descripción y distinto prefijo de plugin. No hay ganador definido — el modelo elige. De ahí que el paso 2 no sea opcional.

Sin `process.exit(1)`: reporta, no frena — es capa mecánica, el juicio queda del lado del agente.
````

## §Conducta — `.claude/conducta/`

Subsistema posterior; sigue el molde de los demás (su manifiesto está arriba, en §Manifiesto (conducta)). A diferencia del resto trae un **hook repartidor** además del lint, y su registro **no se carga en contexto**: lo entrega el hook en el momento que corresponde. Ninguno de estos textos cita números de decisión del harness: enuncian la razón inline (se instalan en el repo destino).

Contenido inicial de `.claude/conducta/MOMENTOS.md` (vocabulario de momentos; lo lee el lint):

````markdown
# Momentos de conducta

Vocabulario de los **momentos** válidos a los que una regla de conducta puede atarse. Un momento es un **evento de hook + una condición que la máquina evalúa sin juicio**; es agente-agnóstico, y su realización depende de que el agente tenga un repartidor para ese evento. Este archivo es el punto de partida del registro de momentos: hoy alcanza el vocabulario (nombre · qué representa · evento · disponibilidad). Crece a las columnas completas (condición fina, disponibilidad por agente) cuando se sumen repartidores nuevos. El `lint-conducta` lo lee para validar que toda regla apunte a un momento existente y que ninguna regla `vigente` cuelgue de un momento sin repartidor.

- **Momento** — nombre canónico, en español corriente.
- **Qué representa** — el punto del flujo, en una línea.
- **Evento de hook** — el evento que lo dispara (+ condición, si la hay).
- **Disponibilidad** — `activo` (hay repartidor construido que lo entrega) o `declarado` (definido, sin repartidor todavía → sus reglas van en estado `pendiente`).

| Momento | Qué representa | Evento de hook | Disponibilidad |
|---------|----------------|----------------|----------------|
| al arrancar la sesión | Al iniciar la sesión, sin condición. Su realización corre una Herramienta y reenvía su salida; hoy muestra la Pantalla de bienvenida (bloque de estado → `systemMessage`, visible al usuario). | `SessionStart` | activo |
| cada turno | Antes de cada respuesta del agente, sin condición. | `UserPromptSubmit` | activo |
| al escribir | Al escribir o editar un `.md` bajo `.claude/` (registros y docs del harness). El `additionalContext` llega **junto al resultado** de la tool: es un recordatorio posterior a la escritura, no un aviso previo. | `PreToolUse` sobre `Write`\|`Edit`, condición: `file_path` es `.md` bajo `.claude/` | activo (Claude) |
| al cerrar tarea | Al terminar de responder una tarea. | `Stop` | declarado |

> Paridad: `cada turno` (`UserPromptSubmit` + `additionalContext`) tiene paridad plena Claude Code ↔ Codex (conocimiento `hooks-claude-code`). `al arrancar la sesión` (`SessionStart` → `systemMessage`) anda en Claude Code, Codex y Gemini; Cursor no tiene banner nativo y degrada sin caja. `al escribir` es **Claude-first**: el `PreToolUse` de Codex intercepta solo Bash, así que ese momento **no es realizable** en Codex sin desviar por Bash — degradación explícita, no rota en silencio. Los momentos `declarado` esperan su repartidor.
````

Contenido inicial de `.claude/conducta/INDICE.md` (registro de reglas; `## Reglas Base` poblada por el harness, `## Reglas del Propósito` vacía para que la llene cada repo):

````markdown
# Reglas de conducta

Registro de las **reglas de conducta** del repo: cada fila ata un **momento** (del vocabulario en `MOMENTOS.md`) a una **acción**, para asegurar "cuando hagas X, asegurate de Y". El hook repartidor `establecer-conducta/` lee este registro **vivo** en cada momento y entrega la regla que corresponde — agregar o cambiar una regla **no toca la config del hook**. Una fila por regla.

- **Regla** — qué asegura, en una frase (verbo).
- **Momento** — a qué momento se ata; tiene que existir en `MOMENTOS.md`.
- **Clase** — `inyectar` (el agente lee un texto y actúa con su juicio) · `correr` (una Herramienta lo resuelve sin juicio) · `bloquear` (se frena la acción; solo donde Y es sin juicio y el falso positivo es imposible).
- **Contenido** — el texto a inyectar (`inyectar`), la Herramienta a correr (`correr`) o la condición de bloqueo (`bloquear`).
- **Estado** — `vigente` (se entrega) · `pendiente` (declarada, su momento aún no tiene repartidor) · `obsoleto` (no se entrega; se puede depurar).

> **Origen del contenido:** las reglas se separan por origen en dos secciones — **Reglas Base** (las manda el Agente Multipropósito; el nivelador `amp:actualizar` las reemplaza enteras al poner al día un Agente con Propósito) y **Reglas del Propósito** (las suma cada repo; el nivelador no las toca). Hoy tienen repartidor los momentos `al arrancar la sesión` (`SessionStart`, clase `correr`), `cada turno` (`UserPromptSubmit`) y `al escribir` (`PreToolUse`); la regla de momento `al cerrar tarea` (`Stop`) queda en `pendiente` (honesta, sin entregar) hasta que se sume su repartidor.

## Reglas Base

Las que instala el Agente Multipropósito (origen **Base**). El nivelador `amp:actualizar` reemplaza **esta sección entera** al poner al día un Agente con Propósito; nunca abre la de abajo.

| Regla | Momento | Clase | Contenido | Estado |
|-------|---------|-------|-----------|--------|
| Mostrar la Pantalla de bienvenida al arrancar | al arrancar la sesión | correr | conducta/mostrar-pantalla-bienvenida/mostrar-pantalla-bienvenida.js --hook | vigente |
| Respetar las preferencias cargadas | cada turno | inyectar | Antes de responder, respetá las preferencias ya cargadas (PREFERENCIAS.md). | vigente |
| No acuñar terminología del dominio | cada turno | inyectar | No acuñes términos del dominio (usá el glosario, proponé en Propuestos, nunca uses vetados). Antes de una palabra de origen inglés, aplicá el test: ¿la diría tal cual un desarrollador hispanohablante en una charla en español (`commit`, `deploy`, `parsear`, `hardcodear`, `bug`) o es una metáfora o modismo del inglés (`churn`, `wedge`, `dogfooding`, `staleness`, `feasibility`)? Lo segundo → traducilo, le resulta raro al usuario. Ante la duda, traducí. | vigente |
| Preguntar antes de redefinir o remover algo canónico | cada turno | inyectar | Antes de **remover, renombrar o redefinir** algo canónico (una definición del glosario, una decisión) o con dependientes: proponé y esperá la ratificación del usuario. El agente propone; ratificar, vetar y redefinir son potestad del usuario. Aplica también a **definiciones y remociones**, no solo al alta de un término. | vigente |
| Contrastar contra la sabiduría del repo al escribir | al escribir | inyectar | Acabás de escribir un `.md` del harness (`.claude/`): contrastá lo escrito contra el test de demarcación, el glosario y las decisiones — ¿va en este subsistema?, ¿contradice algo asentado?, ¿usaste un término vetado o inventado? Corregí si hace falta. | vigente |
| Registrar en el subsistema cuando algo cambia | al cerrar tarea | inyectar | Si en esta tarea cambió algo que otro subsistema debe saber (memoria, decisión, conocimiento, semántica, herramientas), registralo antes de cerrar. | pendiente |

## Reglas del Propósito

Las que cada repo suma para su Propósito (origen **aprendido**). El nivelador **no toca esta sección**. Hoy vacía: cuando el repo sume una regla propia, va acá con las mismas columnas que la tabla de arriba.
````

> **Nota sobre la primera regla Base:** el texto de arriba es el mínimo genérico. En un repo con preferencias propias (fechas, ejemplos del dominio, ubicación de temporales), esa fila se afina para nombrar esas preferencias — pero esa afinación es del Propósito y no la escribe la instalación.

Hook repartidor `.claude/conducta/establecer-conducta/establecer-conducta.js` — **no es una Herramienta** (infra co-ubicada del subsistema, como el lint). Contenido exacto (Node, sin dependencias, sin red):

```js
#!/usr/bin/env node
// Hook repartidor del subsistema conducta. Un mismo script sirve a varios eventos:
// lee el registro VIVO de reglas (../INDICE.md), resuelve que momento(s) realiza el evento que lo
// disparo (con su condicion, sin juicio), y despacha las reglas de ese momento segun su clase.
// Agregar/cambiar una regla NO toca este script: lee el registro en cada disparo.
//
// Eventos que realiza hoy (la realizacion del momento es agente-especifica):
//   - UserPromptSubmit         -> momento `cada turno`            (sin condicion)      [clase inyectar]
//   - PreToolUse Write|Edit .md bajo .claude/ -> momento `al escribir` (condicion sin juicio) [clase inyectar]
//   - SessionStart             -> momento `al arrancar la sesion` (sin condicion)     [clase correr]
// El vocabulario de momentos vive en ../MOMENTOS.md; aca vive COMO se realiza cada uno.
//
// Dos clases de despacho (la tercera, `bloquear`, todavia no se implementa):
//   - inyectar: arma un texto y lo emite como additionalContext (llega al modelo).
//   - correr:   ejecuta la Herramienta cuya ruta es el Contenido de la regla y REENVIA su stdout
//               verbatim (ej. la Pantalla de bienvenida emite {systemMessage} en SessionStart:
//               ese campo es el unico que pinta la terminal del usuario). Un momento es hoy de un
//               solo tipo (SessionStart es correr-only): inyectar y correr no se combinan en el mismo momento.
//
// Contrato de hook (conocimiento hooks-claude-code): stdin = JSON del harness; stdout = JSON.
//   UserPromptSubmit/PreToolUse: { hookSpecificOutput: { hookEventName, additionalContext } }
//     (PreToolUse sin permissionDecision => 'defer': inyecta y deja el flujo de permisos intacto,
//     verificado 2026-07-23; NO auto-aprueba. additionalContext llega junto al resultado de la tool.)
//   SessionStart: lo que emita la Herramienta `correr` (ej. { systemMessage: <caja> }, visible al usuario).
// Nunca rompe el turno: ante cualquier error o registro vacio, sale 0 sin emitir nada.
//
// Uso a mano (probar): echo {"hook_event_name":"SessionStart"} | node establecer-conducta.js
const fs = require('fs'), path = require('path');
const { execSync } = require('child_process');
const idxPath = path.resolve(__dirname, '..', 'INDICE.md');
const repoRoot = path.resolve(__dirname, '..', '..', '..');   // .../conducta/establecer-conducta -> repo

// -- que momento realiza cada evento, con su condicion sin juicio -------
// Devuelve el nombre del momento a entregar, o null si el evento+datos no realiza ninguno.
function momentoDe(data) {
  const ev = data.hook_event_name;
  if (ev === 'UserPromptSubmit') return 'cada turno';
  if (ev === 'SessionStart') return 'al arrancar la sesión';
  if (ev === 'PreToolUse') {
    const tool = data.tool_name || '';
    const fp = ((data.tool_input && data.tool_input.file_path) || '').replace(/\\/g, '/');
    // condicion `al escribir`: escribir/editar un .md bajo .claude/ (registros y docs del harness)
    if ((tool === 'Write' || tool === 'Edit') && /\.md$/i.test(fp) && /(^|\/)\.claude\//.test(fp)) return 'al escribir';
    return null;
  }
  return null;
}

// -- parseo minimo de la tabla markdown del registro de reglas ----------
function leerReglas(txt) {
  const filas = [];
  const lineas = txt.split('\n').map(l => l.trim()).filter(l => l.startsWith('|'));
  let cols = null;
  for (const l of lineas) {
    const celdas = l.split('|').slice(1, -1).map(c => c.trim());
    const norm = celdas.map(c => c.toLowerCase().replace(/\*/g, ''));
    if (!cols) {
      if (norm.includes('regla') && norm.includes('momento')) {
        cols = { momento: norm.indexOf('momento'), clase: norm.indexOf('clase'),
                 contenido: norm.indexOf('contenido'), estado: norm.indexOf('estado') };
      }
      continue;
    }
    if (/^:?-{2,}:?$/.test(celdas[0].replace(/\s/g, ''))) continue;
    const val = i => (i >= 0 && i < celdas.length ? celdas[i] : '');
    filas.push({ momento: val(cols.momento).toLowerCase(), clase: val(cols.clase).toLowerCase(),
                 contenido: val(cols.contenido), estado: val(cols.estado).toLowerCase() });
  }
  return filas;
}

// Devuelve las reglas del registro que matchean (clase, vigente, momento) con Contenido.
function reglasDe(momento, clase) {
  if (!momento || !fs.existsSync(idxPath)) return [];
  return leerReglas(fs.readFileSync(idxPath, 'utf8'))
    .filter(r => r.clase === clase && r.estado === 'vigente' && r.momento === momento && r.contenido);
}

// -- inyectar: texto para el modelo -------------------------------------
function construir(momento) {
  const reglas = reglasDe(momento, 'inyectar');
  if (!reglas.length) return '';
  const bullets = reglas.map(r => `- ${r.contenido}`).join('\n');
  return `Recordatorio de conducta — momento «${momento}» (subsistema conducta):\n${bullets}`;
}

// -- correr: ejecutar la Herramienta y reenviar su stdout verbatim ------
// El Contenido es la ruta del script relativa a .claude/ (con sus flags), ej.
// `conducta/mostrar-pantalla-bienvenida/mostrar-pantalla-bienvenida.js --hook`.
function correr(momento, input) {
  const reglas = reglasDe(momento, 'correr');
  if (!reglas.length) return false;
  for (const r of reglas) {
    try {
      const out = execSync('node .claude/' + r.contenido, { cwd: repoRoot, input, encoding: 'utf8', timeout: 20000 });
      if (out && out.trim()) process.stdout.write(out);   // reenvio verbatim (JSON valido del hijo)
    } catch (e) { /* no romper el turno: el hijo fallo, se ignora */ }
  }
  return true;
}

// Se drena stdin (contrato del hook) y se despacha segun el evento y la clase.
let input = '';
process.stdin.on('data', c => { input += c; });
process.stdin.on('end', () => {
  let data = {};
  try { data = JSON.parse(input || '{}'); } catch (e) { data = {}; }
  let momento = null;
  try { momento = momentoDe(data); } catch (e) { momento = null; }

  // clase `correr` primero (SessionStart): ejecuta y reenvia; no se combina con inyectar.
  try { if (correr(momento, input)) return process.exit(0); } catch (e) { /* sigue a inyectar */ }

  // clase `inyectar` (cada turno / al escribir): additionalContext para el modelo.
  let ctx = '';
  try { ctx = construir(momento); } catch (e) { ctx = ''; }   // ante error, no romper el turno
  if (ctx) {
    const ev = data.hook_event_name === 'PreToolUse' ? 'PreToolUse' : 'UserPromptSubmit';
    // PreToolUse: se OMITE permissionDecision a proposito (=> 'defer'): inyecta sin auto-aprobar.
    process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: ev, additionalContext: ctx } }));
  }
  process.exit(0);
});
process.stdin.on('error', () => process.exit(0));
```

`.claude/conducta/establecer-conducta/README.md`:

````markdown
# establecer-conducta — hook repartidor de conducta

Hook del subsistema `conducta`. **No es una Herramienta** (los hooks van afuera del registro de Herramientas): es infra co-ubicada del subsistema, como el lint. El agente no lo invoca — lo dispara el harness.

## Qué hace

Un mismo script sirve a varios eventos. Según el evento que lo dispara, resuelve qué **momento** realiza (con su condición, sin juicio), lee el registro **vivo** `../INDICE.md`, filtra las reglas de clase `inyectar`, estado `vigente` y ese momento, y emite su `Contenido` como `additionalContext` para el modelo. Agregar o cambiar una regla **no toca este script**: lee el registro en cada disparo. El vocabulario de momentos vive en `../MOMENTOS.md`; acá vive **cómo** se realiza cada uno.

Eventos que realiza hoy:

- **`UserPromptSubmit`** → momento `cada turno` (sin condición). El recordatorio en cada turno.
- **`PreToolUse`** con `Write`/`Edit` de un `.md` bajo `.claude/` → momento `al escribir`. El `additionalContext` llega **junto al resultado** de la tool (post-ejecución): es un recordatorio posterior a la escritura, no un aviso previo.

## Contrato

- **Entrada:** el JSON del harness por stdin (se lee `hook_event_name`, y para `PreToolUse` `tool_name` + `tool_input.file_path`).
- **Salida:** por stdout, `{ "hookSpecificOutput": { "hookEventName": …, "additionalContext": "…" } }`.
- **`PreToolUse` sin efecto de lado:** se **omite** `permissionDecision` (= `defer`, verificado 2026-07-23): inyecta el texto y deja el flujo de permisos intacto — **no** auto-aprueba la tool. (`allow` auto-aprobaría; `deny` descartaría el `additionalContext`.)
- **Nunca rompe el turno:** ante cualquier error o registro vacío sale con código 0 sin emitir nada.

Mecánica y capacidades de hooks: conocimiento `hooks-claude-code`. Latencia (~65 ms, Node): conocimiento `latencia-hooks`.

## Cableado

- **Claude Code (`.claude/settings.json`):** `UserPromptSubmit` (sin matcher) + `PreToolUse` (matcher `Write|Edit`).
- **Codex (`.codex/hooks.json`):** solo `UserPromptSubmit` (paridad del momento `cada turno`). El momento `al escribir` es **Claude-first**: el `PreToolUse` de Codex intercepta solo Bash, no es realizable ahí — degradación documentada en `../MOMENTOS.md`.

## Probar a mano

```bash
echo {"hook_event_name":"UserPromptSubmit"} | node .claude/conducta/establecer-conducta/establecer-conducta.js
echo {"hook_event_name":"PreToolUse","tool_name":"Write","tool_input":{"file_path":".claude/semantica/GLOSARIO.md"}} | node .claude/conducta/establecer-conducta/establecer-conducta.js
```

Emiten el JSON con las reglas vigentes de ese momento, o nada si no aplica.
````

Script de la Pantalla de bienvenida `.claude/conducta/mostrar-pantalla-bienvenida/mostrar-pantalla-bienvenida.js` — lo corre la Regla Base `correr` del momento `al arrancar la sesión` (y la skill `amp:info` a demanda). Contenido exacto:

```js
#!/usr/bin/env node
// mostrar-pantalla-bienvenida.js — Pantalla de bienvenida del Agente Multipropósito (glosario).
// Emite al arrancar un bloque de estado: Título + Propósito (de la Identidad) + métricas
// de cada subsistema (entradas) + estado de lint. Bloque de texto para el transcript
// (no un banner del CLI: SessionStart no tiene punto de extensión para eso).
//
// Agregación por DESCUBRIMIENTO DINÁMICO (Postura 2): un subsistema es un dir hijo de
// `.claude/` que tiene su lint co-ubicado `.claude/<D>/lint-<D>/lint-<D>.js`.
// Sumar un subsistema con su lint lo hace aparecer solo, sin editar este script.
//
// Co-ubicado con el subsistema `conducta`: la Pantalla de bienvenida es una Regla Base clase
// `correr` del momento `al arrancar la sesión`, no una Herramienta. La corre el hook repartidor
// `establecer-conducta` (que reenvía su stdout) y la skill `amp:info` a demanda.
// Uso:
//   node .claude/conducta/mostrar-pantalla-bienvenida/mostrar-pantalla-bienvenida.js            (a mano / skill amp:info: caja en cerca de código)
//   node .claude/conducta/mostrar-pantalla-bienvenida/mostrar-pantalla-bienvenida.js --sin-lint (rápido, sin correr lints)
//   node .claude/conducta/mostrar-pantalla-bienvenida/mostrar-pantalla-bienvenida.js --hook     (para el SessionStart hook: emite JSON {"systemMessage": <caja>} → visible al usuario)
// Sin process.exit(1): informa, no falla.
//
// Por qué --hook: el stdout crudo de un SessionStart hook va a `additionalContext` (lo ve
// el modelo, NO el usuario). El único campo que se pinta en la terminal del usuario es
// `systemMessage`. Con --hook se emite ese JSON, sin cerca de código (los backticks saldrían
// literales). Sin --hook, la caja va con cerca ``` para conservar monospace en el transcript.

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const REPO = path.resolve(__dirname, '..', '..', '..');
const CLAUDE_DIR = path.join(REPO, '.claude');
const SIN_LINT = process.argv.slice(2).includes('--sin-lint');
const HOOK = process.argv.slice(2).includes('--hook');

// Sustantivo cosmético por subsistema conocido; los desconocidos caen a "entradas".
// (Solo afecta la etiqueta, no el conteo: el descubrimiento sigue siendo dinámico.)
const SUSTANTIVO = {
  memoria: 'memorias', semantica: 'términos', decisiones: 'decisiones',
  herramientas: 'herramientas', planes: 'planes', conocimiento: 'páginas',
  preferencias: 'preferencias',
};
// Archivo de índice del subsistema, por prioridad (nombres no uniformes entre subsistemas).
const INDICES = ['INDICE.md', 'MEMORIA.md', 'PLANES.md', 'PREFERENCIAS.md', 'GLOSARIO.md'];

function existe(p) { try { return fs.existsSync(p); } catch { return false; } }
function leer(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } }

// --- descubrir subsistemas: dir hijo de .claude con lint co-ubicado ---
function descubrirSubsistemas() {
  const out = [];
  if (!existe(CLAUDE_DIR)) return out;
  for (const e of fs.readdirSync(CLAUDE_DIR, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const lint = path.join(CLAUDE_DIR, e.name, 'lint-' + e.name, 'lint-' + e.name + '.js');
    if (existe(lint)) out.push({ nombre: e.name, dir: path.join(CLAUDE_DIR, e.name), lint });
  }
  return out.sort((a, b) => a.nombre.localeCompare(b.nombre));
}

// --- índice del subsistema ---
function indiceDe(dir) {
  for (const cand of INDICES) {
    const p = path.join(dir, cand);
    if (existe(p)) return p;
  }
  return null;
}

// --- conteo genérico de entradas: filas de tabla, si no hay tabla, bullets con link ---
function contarEntradas(txt) {
  const lineas = txt.split(/\r?\n/);
  const pipe = lineas.filter(l => l.trim().startsWith('|'));
  const sep = pipe.filter(l => /^\s*\|[\s:|-]+\|\s*$/.test(l)); // separadores |---|
  if (sep.length) return pipe.length - sep.length - sep.length; // -headers -separadores
  const bullets = lineas.filter(l => /^\s*[-*]\s+\[/.test(l));  // - [texto](link)
  return bullets.length;
}

// --- enriquecimientos baratos por subsistema conocido ---
// Planes: agrupa por CARPETA (pendientes/ejecutados/descartados), no por estado suelto.
// La agrupación sale de ESTADOS.md (fuente de verdad configurable): cada
// estado mapea a una carpeta, y los tres estados vivos caen todos en `pendientes`. Así el
// juego de estados se puede reconfigurar por repo sin tocar este script. La suma de las
// carpetas = total de planes (Pendientes + Ejecutados + Descartados = Total).
function detallePlanes(txt, estadosTxt) {
  // Estado → carpeta desde ESTADOS.md (col. Estado | Sentido | Carpeta | Terminal).
  const estadoCarpeta = {};   // 'nuevo' → 'pendientes'
  const orden = [];           // orden de aparición de carpetas: pendientes, ejecutados, descartados
  for (const l of (estadosTxt || '').split(/\r?\n/)) {
    if (!l.trim().startsWith('|')) continue;
    const c = l.split('|').slice(1, -1).map(x => x.trim());
    if (c.length < 3) continue;
    const est = c[0];
    const carpeta = c[2].replace(/`/g, '').replace(/\/+\s*$/, '').trim();
    if (/^-{2,}$/.test(est) || /^estado$/i.test(est) || !carpeta || /^carpeta$/i.test(carpeta)) continue;
    estadoCarpeta[est.toLowerCase()] = carpeta;
    if (!orden.includes(carpeta)) orden.push(carpeta);
  }
  // Contar filas de PLANES.md, tallando por carpeta del estado.
  const cont = {};
  for (const l of txt.split(/\r?\n/)) {
    if (!l.trim().startsWith('|')) continue;
    const c = l.split('|').slice(1, -1).map(x => x.trim());
    if (c.length < 2) continue;
    const est = c[1];
    if (/^-{2,}$/.test(est) || /^estado$/i.test(est)) continue;
    const carp = estadoCarpeta[est.toLowerCase()];
    if (carp) cont[carp] = (cont[carp] || 0) + 1;
  }
  if (!orden.length) return ''; // sin ESTADOS.md legible: degradar sin romper
  const partes = orden.map(carp => `${cont[carp] || 0} ${carp}`);
  return `(${partes.join(' · ')})`;
}
function detallePreferencias(txt) {
  const v = (txt.match(/harness\s+v(\d+)/i) || [])[1];
  const m = txt.split(/##\s+Adaptaciones/i);
  let adapt = 0;
  if (m[1]) adapt = (m[1].split(/\r?\n/).filter(l => /^\s*[-*]\s+\S/.test(l))).length;
  return `Base${v ? ' v' + v : ''} · ${adapt} adaptaci${adapt === 1 ? 'ón' : 'ones'}`;
}

// --- correr el lint del subsistema y contar hallazgos (misma heurística que ejecutar-control-cierre) ---
function contarHallazgos(salida) {
  let t = 0;
  for (const l of salida.split(/\r?\n/)) {
    const m = l.match(/\((\d+)\):?\s*$/);
    if (m) t += parseInt(m[1], 10);
  }
  return t;
}
function correrLint(lintPath) {
  // Sin --quiet: el flag da exit ≠ 0 en algunos lints artesanales (bug de divergencia).
  // Igual que ejecutar-control-cierre: leer los totales `(N)` de la salida, no confiar en el exit.
  const r = spawnSync('node', [lintPath], { cwd: REPO, encoding: 'utf8', timeout: 15000 });
  if (r.error || r.status === null) return { estado: 'n/d', hallazgos: null };
  const salida = (r.stdout || '') + (r.stderr || '');
  const h = contarHallazgos(salida);
  return { estado: r.status !== 0 ? 'error' : (h === 0 ? 'ok' : 'hallazgos'), hallazgos: h };
}

// --- Identidad del Agente: Título + Propósito (tolerante a indefinido) ---
function leerIdentidad() {
  const p = path.join(CLAUDE_DIR, 'identidad.md');
  const txt = leer(p);
  const SIN = '<sin definir>';
  if (!txt.trim()) return { titulo: SIN, proposito: SIN };
  const titulo = (txt.match(/^#\s+(.+)$/m) || [])[1] || SIN;
  const proposito = (txt.match(/^[*\s>]*Prop[óo]sito[*\s]*:\s*(.+)$/mi) || [])[1] || SIN;
  return { titulo: titulo.trim(), proposito: proposito.trim() };
}

// --- construir métricas ---
const subs = descubrirSubsistemas();
const filas = [];
let hallazgosTotal = 0, lintPeor = 'ok';
for (const s of subs) {
  const idx = indiceDe(s.dir);
  const txt = idx ? leer(idx) : '';
  let cuenta = idx ? contarEntradas(txt) : 0;
  let extra = '';
  if (s.nombre === 'planes') extra = detallePlanes(txt, leer(path.join(s.dir, 'ESTADOS.md')));
  if (s.nombre === 'preferencias') { extra = detallePreferencias(txt); cuenta = null; }
  let lint = { estado: 'n/d', hallazgos: null };
  if (!SIN_LINT) {
    lint = correrLint(s.lint);
    if (typeof lint.hallazgos === 'number') hallazgosTotal += lint.hallazgos;
    if (lint.estado === 'error') lintPeor = 'error';
    else if (lint.estado === 'hallazgos' && lintPeor !== 'error') lintPeor = 'hallazgos';
  }
  // En planes el `extra` ya trae los sustantivos (pendientes/ejecutados/descartados):
  // el sustantivo "planes" sería redundante y desborda el marco → se omite (queda "34 (…)").
  const sustantivo = s.nombre === 'planes' ? '' : (SUSTANTIVO[s.nombre] || 'entradas');
  filas.push({ nombre: s.nombre, cuenta, extra, sustantivo, lint });
}

// --- render ---
const { titulo, proposito } = leerIdentidad();
const lintGlobal = SIN_LINT ? '(sin correr)'
  : lintPeor === 'error' ? '✖ error en algún lint'
  : hallazgosTotal === 0 ? '✔ 0 hallazgos'
  : `⚠ ${hallazgosTotal} hallazgo${hallazgosTotal === 1 ? '' : 's'}`;

// Caja de ANCHO AUTOMÁTICO: se dimensiona sola al renglón más largo, así nunca se
// desarma cuando una métrica gana dígitos (planes 9 → 99 → 999). Las líneas largas
// (Propósito) se envuelven a un techo `WRAP`; el ancho final = el renglón más largo,
// con un piso `MIN` para que no quede angosta. Envuelta en cerca de código (```) para
// el transcript de un cliente no-terminal (skill amp:info); en --hook va como systemMessage.
const WRAP = 82;                                // techo de envoltura para texto largo
const MIN = 74;                                 // piso de ancho interno
const nfc = s => (s || '').normalize('NFC');    // acentos precompuestos → .length correcto
function envolver(texto, ancho, cont) {
  const palabras = nfc(texto).split(/\s+/).filter(Boolean);
  const out = [];
  let linea = '';
  for (const p of palabras) {
    const cand = linea ? linea + ' ' + p : p;
    if (cand.length > ancho && linea) { out.push(linea); linea = cont + p; }
    else linea = cand;
  }
  if (linea) out.push(linea);
  return out;
}

const cuerpo = [];
// Renglón de marca: va sin etiqueta a propósito. Es la identidad del harness, constante
// en todo repo; ponerle prefijo lo degradaría a un campo más entre los de abajo.
cuerpo.push('Agente Multipropósito');
cuerpo.push('');  // aire: despega la identidad de los campos del repo
cuerpo.push(...envolver('Título: ' + titulo, WRAP, '   '));
cuerpo.push(...envolver('Propósito: ' + proposito, WRAP, '   '));
cuerpo.push('__SEP__');
cuerpo.push(`Subsistemas: ${subs.length}      Lint: ${lintGlobal}`);
const anchoNom = Math.max(...filas.map(f => f.nombre.length), 0);
for (const f of filas) {
  const marca = (f.lint.estado === 'ok' || f.lint.estado === 'n/d') ? ' ' : '⚠';
  const val = f.cuenta === null ? f.extra : `${f.cuenta}${f.sustantivo ? ' ' + f.sustantivo : ''}${f.extra ? ' ' + f.extra : ''}`;
  cuerpo.push(`${marca} · ${f.nombre.padEnd(anchoNom)}   ${val}`);
}

// Ancho interno = el renglón más largo (piso MIN). Cada línea se rellena a ese ancho.
const W = Math.max(MIN, ...cuerpo.filter(l => l !== '__SEP__').map(l => nfc(l).length));
const regla = (l, mid, r) => l + mid.repeat(W + 2) + r;
const caja = s => {
  const t = nfc(s);
  return '║ ' + t + ' '.repeat(Math.max(0, W - t.length)) + ' ║';
};

const boxLines = [regla('╔', '═', '╗')];
for (const linea of cuerpo) boxLines.push(linea === '__SEP__' ? regla('╟', '─', '╢') : caja(linea));
boxLines.push(regla('╚', '═', '╝'));
const box = boxLines.join('\n');

// --hook: emitir JSON {"systemMessage": <caja>} → único campo que la terminal del usuario
// pinta en SessionStart (sin cerca ```: los backticks saldrían literales). Sin --hook:
// caja envuelta en cerca de código para el transcript (skill amp:info + corridas a mano).
if (HOOK) {
  // Salto inicial: separa la caja del prefijo "SessionStart:… says:" que antepone el CLI.
  process.stdout.write(JSON.stringify({ systemMessage: '\n' + box }));
} else {
  process.stdout.write('```\n' + box + '\n```\n');
}
```

`.claude/conducta/mostrar-pantalla-bienvenida/README.md`:

````markdown
# mostrar-pantalla-bienvenida

Script del subsistema `conducta`. Emite la **Pantalla de bienvenida** del Agente Multipropósito: un bloque de estado con Título + Propósito (de la **Identidad del Agente**) + métricas de cada subsistema (entradas) + estado de lint.

Es lo que corre la **Regla Base `correr`** del momento `al arrancar la sesión`: al iniciar la sesión, el hook repartidor `establecer-conducta` lo ejecuta y reenvía su salida. La skill `amp:info` muestra la misma pantalla a demanda. Por eso vive co-ubicado con `conducta` (como el repartidor y el lint) y no en el registro de Herramientas: es infra de una Regla Base, no una tool del Propósito.

## Cómo se invoca

```bash
node .claude/conducta/mostrar-pantalla-bienvenida/mostrar-pantalla-bienvenida.js
node .claude/conducta/mostrar-pantalla-bienvenida/mostrar-pantalla-bienvenida.js --sin-lint   # rápido, no corre los lints
node .claude/conducta/mostrar-pantalla-bienvenida/mostrar-pantalla-bienvenida.js --hook       # para el repartidor: emite {"systemMessage": <caja>}
```

En `settings.json` el `SessionStart` llama al repartidor `establecer-conducta`, que lee el registro de reglas, encuentra la regla `correr` de la bienvenida y ejecuta este script con `--hook`, reenviando su stdout.

## Cómo funciona

- **Descubrimiento dinámico:** un subsistema es un dir hijo de `.claude/` con su lint co-ubicado `.claude/<D>/lint-<D>/lint-<D>.js`. Sumar un subsistema con su lint lo hace aparecer solo, sin tocar este script.
- **Conteo de entradas:** genérico — filas de tabla si el índice es una tabla, si no bullets con link. Nombre del índice por prioridad (`INDICE.md` · `MEMORIA.md` · `PLANES.md` · `PREFERENCIAS.md`).
- **Enriquecimientos baratos:** `planes` desglosa los estados vivos; `preferencias` muestra versión de Base + cantidad de adaptaciones. El sustantivo por subsistema (memorias, términos…) es cosmético; los desconocidos caen a "entradas".
- **Lint:** corre cada `lint-<D>` (sin `--quiet`: ese flag da exit ≠ 0 en algunos lints artesanales) y suma los `(N)` de la salida, igual que `ejecutar-control-cierre`.
- **Identidad:** lee `.claude/identidad.md` (Título + Propósito). Tolerante a indefinido → muestra `<sin definir>`.

## Emisión (verificado)

Un `SessionStart` hook **no pinta un banner** propio como el logo del CLI. El único campo que se pinta en la terminal del usuario es `systemMessage`; el stdout crudo iría a `additionalContext`, que solo ve el modelo. Por eso `--hook` emite `{"systemMessage": <caja>}`. Sin `--hook`, la caja va envuelta en cerca de código para el transcript (skill `amp:info` y corridas a mano).
````

Cableado del repartidor — **registro doble**: el mismo script se registra en tres eventos de Claude Code (`SessionStart` + `UserPromptSubmit` + `PreToolUse`) y en dos de Codex. **Merge, nunca pisar:** sumar estas entradas a las que ya existan; si la entrada de `establecer-conducta` ya está, no duplicar. En particular el `SessionStart` del repartidor (que corre la Pantalla de bienvenida) se **mergea con el `SessionStart` de planes** (`lint-planes --quiet`) bajo el mismo evento, sin pisarlo — quedan las dos entradas en la lista de `hooks`.

**Claude Code** — merge en `.claude/settings.json` del repo (`SessionStart` merge con planes + `UserPromptSubmit` sin matcher + `PreToolUse` matcher `Write|Edit`):

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/planes/lint-planes/lint-planes.js --quiet"
          },
          {
            "type": "command",
            "command": "node .claude/conducta/establecer-conducta/establecer-conducta.js"
          }
        ]
      }
    ],
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/conducta/establecer-conducta/establecer-conducta.js"
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/conducta/establecer-conducta/establecer-conducta.js"
          }
        ]
      }
    ]
  }
}
```

**Codex CLI** — merge en `.codex/hooks.json` del repo (`SessionStart` + `UserPromptSubmit`; el momento `al escribir` es Claude-first, no se cablea en Codex):

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/conducta/establecer-conducta/establecer-conducta.js"
          }
        ]
      }
    ],
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/conducta/establecer-conducta/establecer-conducta.js"
          }
        ]
      }
    ]
  }
}
```

> En Codex el momento `al arrancar la sesión` **corre igual el repartidor** (mismo `SessionStart`), pero Codex **no soporta `SessionStart` → `systemMessage`** de la misma forma que Claude Code: la caja de la Pantalla de bienvenida sale solo si el agente pinta `systemMessage`; si no, degrada sin caja (la corrida no falla).
> Codex carga hooks de proyecto solo si la capa `.codex/` del repo está **trusted** (revisar con `/hooks`) y con `features.hooks` habilitado en su config. Avisarle al usuario al instalar.

Lint `.claude/conducta/lint-conducta/lint-conducta.js` (Node, sin dependencias, sin red):

```js
#!/usr/bin/env node
// Lint del subsistema conducta: valida el registro de reglas (INDICE.md) contra el
// vocabulario de momentos (MOMENTOS.md). Sin LLM, sin red. Autocontenido: solo lee archivos del
// propio subsistema (por eso no comparte el fragmento repoRoot de los otros lints).
// Uso: node lint-conducta.js [<carpeta conducta>]   (default: .claude/conducta)
const fs = require('fs'), path = require('path');
const root = path.resolve(process.argv[2] || '.claude/conducta');
const quiet = process.argv.includes('--quiet');

const CLASES = ['inyectar', 'correr', 'bloquear'];      // las tres clases de accion, cerradas
const ESTADOS = ['vigente', 'pendiente', 'obsoleto'];

// -- parseo de tablas markdown ------------------------------------------
function filasTabla(txt, requeridas) {
  const out = [];
  const lineas = txt.split('\n').map(l => l.trim()).filter(l => l.startsWith('|'));
  let cols = null;
  for (const l of lineas) {
    const celdas = l.split('|').slice(1, -1).map(c => c.trim());
    const norm = celdas.map(c => c.toLowerCase().replace(/\*/g, ''));
    if (!cols) {
      if (requeridas.every(r => norm.includes(r))) {
        cols = {}; requeridas.forEach(r => { cols[r] = norm.indexOf(r); });
      }
      continue;
    }
    if (/^:?-{2,}:?$/.test(celdas[0].replace(/\s/g, ''))) continue;   // separador ---
    const fila = {}; for (const r of requeridas) fila[r] = (cols[r] < celdas.length ? celdas[cols[r]] : '');
    out.push(fila);
  }
  return { cols, filas: out };
}

const problemas = { estructura: [], momentoInexistente: [], claseInvalida: [], estadoInvalido: [], inyectarSinTexto: [], vigenteSinRepartidor: [] };

// -- vocabulario de momentos --------------------------------------------
const momPath = path.join(root, 'MOMENTOS.md');
let momentos = new Map();   // nombre -> disponibilidad (activo|declarado)
if (!fs.existsSync(momPath)) problemas.estructura.push('falta MOMENTOS.md (vocabulario de momentos)');
else {
  const { cols, filas } = filasTabla(fs.readFileSync(momPath, 'utf8'), ['momento', 'disponibilidad']);
  if (!cols) problemas.estructura.push('MOMENTOS.md: no se encontro la tabla (columnas Momento, Disponibilidad)');
  else for (const f of filas) momentos.set(f.momento.toLowerCase(), f.disponibilidad.toLowerCase());
}

// -- registro de reglas -------------------------------------------------
const idxPath = path.join(root, 'INDICE.md');
if (!fs.existsSync(idxPath)) problemas.estructura.push('falta INDICE.md (registro de reglas)');
else {
  const requeridas = ['regla', 'momento', 'clase', 'contenido', 'estado'];
  const { cols, filas } = filasTabla(fs.readFileSync(idxPath, 'utf8'), requeridas);
  if (!cols) problemas.estructura.push(`INDICE.md: no se encontro la tabla (columnas ${requeridas.join(', ')})`);
  else for (const f of filas) {
    const regla = f.regla || '(sin nombre)';
    const momento = f.momento.toLowerCase(), clase = f.clase.toLowerCase(), estado = f.estado.toLowerCase();
    if (!momentos.has(momento)) problemas.momentoInexistente.push(`"${regla}" -> momento "${f.momento}" no esta en MOMENTOS.md`);
    if (!CLASES.includes(clase)) problemas.claseInvalida.push(`"${regla}" -> clase "${f.clase}" (validas: ${CLASES.join('/')})`);
    if (!ESTADOS.includes(estado)) problemas.estadoInvalido.push(`"${regla}" -> estado "${f.estado}" (validos: ${ESTADOS.join('/')})`);
    if (clase === 'inyectar' && !f.contenido) problemas.inyectarSinTexto.push(`"${regla}" -> clase inyectar sin Contenido`);
    // honestidad: una regla vigente no puede colgar de un momento sin repartidor (disponibilidad declarado)
    if (estado === 'vigente' && momentos.get(momento) === 'declarado')
      problemas.vigenteSinRepartidor.push(`"${regla}" -> vigente pero su momento "${f.momento}" es 'declarado' (sin repartidor): deberia ser 'pendiente'`);
  }
}

// -- salida -------------------------------------------------------------
const secciones = [
  ['ESTRUCTURA', problemas.estructura],
  ['MOMENTO INEXISTENTE (regla apunta a un momento fuera de MOMENTOS.md)', problemas.momentoInexistente],
  ['CLASE INVALIDA', problemas.claseInvalida],
  ['ESTADO INVALIDO', problemas.estadoInvalido],
  ['INYECTAR SIN CONTENIDO', problemas.inyectarSinTexto],
  ['VIGENTE SOBRE MOMENTO SIN REPARTIDOR', problemas.vigenteSinRepartidor],
];
const total = secciones.reduce((n, [, it]) => n + it.length, 0);
if (quiet && total === 0) process.exit(0);
console.log(`== LINT CONDUCTA: ${root} ==`);
console.log(`momentos: ${momentos.size} | hallazgos: ${total}\n`);
for (const [titulo, items] of secciones) {
  if (quiet && !items.length) continue;
  console.log(`[${titulo}] (${items.length})`);
  items.forEach(i => console.log(`    ${i}`));
  if (!quiet && !items.length) console.log('    (ninguno)');
}
```

`.claude/conducta/lint-conducta/README.md`:

```markdown
# lint-conducta

**Qué hace:** lint del subsistema `conducta` — valida el registro de reglas (`INDICE.md`) contra el vocabulario de momentos (`MOMENTOS.md`): que toda regla apunte a un momento existente, que la clase (`inyectar`/`correr`/`bloquear`) y el estado (`vigente`/`pendiente`/`obsoleto`) sean válidos, que ninguna regla `inyectar` quede sin `Contenido`, y —honestidad— que ninguna regla `vigente` cuelgue de un momento sin repartidor (disponibilidad `declarado`). Sin LLM, sin red. Autocontenido: solo lee archivos del propio subsistema.
**Cómo se corre:** `node .claude/conducta/lint-conducta/lint-conducta.js` (desde la raíz del repo). Flags: `--quiet` (solo imprime si hay hallazgos). Acepta una ruta a la carpeta de conducta como primer argumento (default `.claude/conducta`).
**Estado:** vigente.
**Referenciado por:** nadie automático — se corre a mano al cerrar tareas que tocaron `conducta`. (El hook que sí vive en el subsistema es el repartidor `establecer-conducta`, que es otra cosa: entrega reglas, no valida el registro.)
**Dependencias:** Node.js (sin libs externas).
**Origen (opcional):** funcionalidad `conducta` del harness — es infra del Patrón del subsistema (co-ubicada, como todo lint), **no** una Herramienta, así que no se registra en `herramientas/INDICE.md`.
```

## §Script — lint-memoria — `.claude/memoria/lint-memoria/lint-memoria.js`

Contenido exacto (Node, sin dependencias, sin red):

```js
#!/usr/bin/env node
// Lint de la memoria local: refs rotas, indice (MEMORIA.md) incompleto, huerfanos, frontmatter. Sin LLM, sin red.
// Uso: node lint-memoria.js [<carpeta>]   (default: .claude/memoria)
const fs = require('fs'), path = require('path');
const root = path.resolve(process.argv[2] || '.claude/memoria');
const EXCLUDE = new Set(['.git', 'node_modules']);
const TYPES = new Set(['user', 'feedback', 'project', 'reference']);

function walk(dir, acc) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDE.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name.startsWith('lint-')) continue; walk(full, acc); }  // el lint co-ubicado del subsistema no es contenido
    else if (e.name.endsWith('.md')) acc.push(full);
  }
  return acc;
}
const rel = p => path.relative(root, p).replace(/\\/g, '/');
const read = f => fs.readFileSync(f, 'utf8');
const inRoot = p => path.resolve(p).startsWith(path.resolve(root) + path.sep);

// La raiz del repo se deduce de la ubicacion del propio lint: .claude/<sub>/lint-<sub>/ -> 3 arriba.
// La profundidad la fija el instalador; no depende de desde donde se invoque.
const repoRoot = path.resolve(__dirname, '..', '..', '..');
const dentroDelRepo = p => {
  const r = path.resolve(p);
  return r === repoRoot || r.startsWith(repoRoot + path.sep);
};
// Un archivo de un subsistema puede linkear a otros (planes/, conocimiento/, docs/, ...): la ref se
// resuelve relativa al archivo, a la raiz del subsistema, a .claude/, a la raiz del repo y al cwd.
// Solo se acepta el candidato que caiga DENTRO del repo: una ref rota no resuelve contra afuera.
function resolverRef(t, fdir) {
  return [
    path.join(fdir, t),
    path.join(root, t),
    path.join(root, '..', t),
    path.join(repoRoot, t),
    path.resolve(t),
  ].map(p => path.normalize(p)).find(p => dentroDelRepo(p) && fs.existsSync(p)) || null;
}

// --- Atribucion por ancestro mas cercano (identico en lint-conocimiento y lint-memoria) ---
// Cada pagina se atribuye a su indice ancestro mas cercano; un sub-indice (INDICE.md), a su
// ancestro ESTRICTO mas cercano (asi el padre queda obligado a nombrar la Carpeta que delego).
// Un hallazgo cae una sola vez, contra el indice que corresponde.
function indiceAncestro(p, dirsIndice, estricto) {
  let d = path.dirname(p);
  if (estricto) d = path.dirname(d);
  while (d.length >= root.length) {
    if (dirsIndice.has(d)) return d;
    const up = path.dirname(d);
    if (up === d) break;
    d = up;
  }
  return null;
}
// Un indice "nombra" a p si menciona su archivo, su stem, o alguna Carpeta de la cadena entre el
// dir del indice y p (la Entrada que delega el subarbol). Un sub-indice se nombra por su Carpeta.
function indiceNombra(t, p, idxDir) {
  const base = path.basename(p);
  if (base !== 'INDICE.md') {
    const stem = base.slice(0, -3);
    if (t.includes(base) || t.includes(stem)) return true;
  }
  let d = path.dirname(p);
  while (d !== idxDir && d.length > idxDir.length) {
    if (t.includes(path.basename(d))) return true;
    d = path.dirname(d);
  }
  return false;
}
// --- fin atribucion por ancestro ---

const all = walk(root, []);
const indexFile = path.join(root, 'MEMORIA.md');
const hasIndex = fs.existsSync(indexFile);
const idxText = hasIndex ? read(indexFile) : '';
const memos = all.filter(p => path.basename(p) !== 'MEMORIA.md' && path.basename(p) !== 'MANIFIESTO.md');  // MANIFIESTO.md: infra del subsistema, no es memoria

// nombres validos para wikilinks: `name:` del frontmatter + stem del archivo
const nameSet = new Set();
for (const p of memos) {
  nameSet.add(path.basename(p).slice(0, -3));
  const fm = read(p).match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (fm) { const nm = fm[1].match(/^name:\s*(\S+)/m); if (nm) nameSet.add(nm[1].trim()); }
}

const mdLink = /\]\(([^)]+?\.md)\)/g;
const codePath = /`([^`]+?\/[^`]+?\.md)`/g;
const wiki = /\[\[([^\]]+?)\]\]/g;

// Un wikilink ACTIVO (que el harness resuelve) va crudo; uno CITADO va en backticks
// para mostrar el simbolo. Mapear code-spans inline (y fences) para saltar citas.
function codeSpans(txt) {
  const runs = []; let m; const re = /`+/g;
  while ((m = re.exec(txt))) runs.push([m.index, m[0].length]);
  const spans = [];
  for (let i = 0; i < runs.length; ) {
    const [open, len] = runs[i]; let j = i + 1;
    while (j < runs.length && runs[j][1] !== len) j++;
    if (j < runs.length) { spans.push([open, runs[j][0] + runs[j][1]]); i = j + 1; }
    else i++;
  }
  return spans;
}
const enCodeSpan = (spans, idx) => spans.some(([s, e]) => idx >= s && idx < e);

// [1] refs rotas: links a .md inexistentes + wikilinks sin memoria.
const broken = [], referenced = new Set();
for (const f of all) {
  const txt = read(f), fdir = path.dirname(f);
  for (const re of [mdLink, codePath]) {
    let m; re.lastIndex = 0;
    while ((m = re.exec(txt))) {
      let t = m[1].trim();
      if (/^https?:\/\//.test(t)) continue;
      if (t.includes('...') || t.includes('<') || t.includes('*')) continue;
      const hit = resolverRef(t, fdir);
      if (hit) { if (inRoot(hit)) referenced.add(rel(hit)); }
      else broken.push([rel(f), t, 'ref .md no existe']);
    }
  }
  const spans = codeSpans(txt);
  let m; wiki.lastIndex = 0;
  while ((m = wiki.exec(txt))) {
    if (enCodeSpan(spans, m.index)) continue;  // wikilink citado en backticks, no activo
    const name = m[1].split('|')[0].trim();
    if (!nameSet.has(name)) broken.push([rel(f), `[[${name}]]`, 'wikilink sin memoria']);
  }
}

// [2] indice incompleto: memoria no listada en su indice ancestro mas cercano
// (MEMORIA.md en la raiz + cualquier sub/INDICE.md; sin anidar, el dueno es siempre MEMORIA.md)
const subIndices = memos.filter(p => path.basename(p) === 'INDICE.md');
const dirsIndice = new Set([root, ...subIndices.map(i => path.dirname(i))]);
const idxPorDir = new Map([[root, indexFile], ...subIndices.map(i => [path.dirname(i), i])]);
const textoIndice = i => i === indexFile ? idxText : read(i);
const gaps = [];
for (const p of memos) {
  const ownerDir = indiceAncestro(p, dirsIndice, path.basename(p) === 'INDICE.md');
  if (ownerDir === null) continue;
  const idx = idxPorDir.get(ownerDir);
  if (idx === p) continue;
  if (!indiceNombra(textoIndice(idx), p, ownerDir)) gaps.push([rel(idx), rel(p)]);
}

// [3] huerfanos: ni referenciada ni en el indice que le corresponde
const orphans = [];
for (const p of memos) {
  if (referenced.has(rel(p))) continue;
  const ownerDir = indiceAncestro(p, dirsIndice, path.basename(p) === 'INDICE.md');
  const idx = ownerDir === null ? null : idxPorDir.get(ownerDir);
  if (idx !== null && idx !== p && indiceNombra(textoIndice(idx), p, ownerDir)) continue;
  orphans.push(rel(p));
}

// [4] frontmatter: name / description / metadata.type valido
const fmBad = [];
for (const p of memos) {
  if (path.basename(p) === 'INDICE.md') continue;  // sub-indice: estructura, no memoria con frontmatter
  const txt = read(p);
  const fm = txt.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) { fmBad.push([rel(p), 'sin frontmatter']); continue; }
  const body = fm[1];
  if (!/\bname:\s*\S/.test(body)) fmBad.push([rel(p), 'falta name']);
  if (!/\bdescription:\s*\S/.test(body)) fmBad.push([rel(p), 'falta description']);
  const tm = body.match(/type:\s*([a-z]+)/);
  if (!tm) fmBad.push([rel(p), 'falta metadata.type']);
  else if (!TYPES.has(tm[1])) fmBad.push([rel(p), `type invalido: ${tm[1]}`]);
}

console.log(`== LINT MEMORIA: ${root} ==`);
console.log(`memorias: ${memos.length} | indice: ${hasIndex ? 'MEMORIA.md' : 'FALTA'}\n`);
if (!hasIndex) console.log('[!] No existe MEMORIA.md (indice de memoria)\n');
console.log(`[1] REFS ROTAS (${broken.length}):`);
broken.forEach(([f, r, w]) => console.log(`    ${f}  ->  ${r}   [${w}]`));
if (!broken.length) console.log('    (ninguna)');
console.log(`\n[2] INDICE INCOMPLETO (${gaps.length}):`);
gaps.forEach(([i, p]) => console.log(`    ${i}  no lista  ${p}`));
if (!gaps.length) console.log('    (completo)');
console.log(`\n[3] HUERFANOS (${orphans.length}):`);
orphans.forEach(o => console.log(`    ${o}`));
if (!orphans.length) console.log('    (ninguno)');
console.log(`\n[4] FRONTMATTER (${fmBad.length}):`);
fmBad.forEach(([p, w]) => console.log(`    ${p}   [${w}]`));
if (!fmBad.length) console.log('    (ok)');
```

## §Script — lint-preferencias — `.claude/preferencias/lint-preferencias/lint-preferencias.js`

Contenido exacto (Node, sin dependencias, sin red):

```js
#!/usr/bin/env node
// Lint estructural de preferencias: PREFERENCIAS.md con Base/Adaptaciones + @import en el punto de entrada (AGENTS.md/CLAUDE.md). Sin LLM, sin red.
// NO detecta contradicciones semanticas (eso es la capa semantica, a pedido).
// Uso: node lint-preferencias.js [<carpeta .claude>]   (default: .claude)
const fs = require('fs'), path = require('path');
const claudeDir = path.resolve(process.argv[2] || '.claude');
const prefFile = path.join(claudeDir, 'preferencias', 'PREFERENCIAS.md');
const problems = [];

if (!fs.existsSync(prefFile)) {
  problems.push('no existe preferencias/PREFERENCIAS.md');
} else {
  const txt = fs.readFileSync(prefFile, 'utf8');
  if (!/^##\s+Base\b/m.test(txt)) problems.push('falta la seccion "## Base"');
  if (!/^##\s+Adaptaciones\b/mi.test(txt)) problems.push('falta la seccion "## Adaptaciones"');
  if (txt.trim().length < 50) problems.push('PREFERENCIAS.md casi vacio (sin contenido util)');
}

// @import en el punto de entrada (las preferencias tienen que estar siempre en contexto).
// Fuente: AGENTS.md en la raiz; layouts legacy: CLAUDE.md en la raiz o dentro de <config>/.
const root = path.dirname(claudeDir);
const entradas = [path.join(root, 'AGENTS.md'), path.join(root, 'CLAUDE.md'), path.join(claudeDir, 'CLAUDE.md')]
  .filter(f => fs.existsSync(f));
if (entradas.length) {
  // el import lleva el prefijo segun donde viva el punto de entrada: @preferencias/... o @.claude/preferencias/...
  const importa = entradas.some(f => /@[\w./-]*preferencias\/PREFERENCIAS\.md/.test(fs.readFileSync(f, 'utf8')));
  if (!importa) {
    problems.push('ningun punto de entrada (AGENTS.md/CLAUDE.md) importa @preferencias/PREFERENCIAS.md (no queda en contexto)');
  }
} else {
  problems.push('no existe punto de entrada (AGENTS.md o CLAUDE.md; no se pudo verificar el @import)');
}

console.log(`== LINT PREFERENCIAS: ${prefFile} ==`);
console.log(`hallazgos: ${problems.length}\n`);
if (!problems.length) console.log('    (ok)');
else problems.forEach(p => console.log(`    [x] ${p}`));
```
