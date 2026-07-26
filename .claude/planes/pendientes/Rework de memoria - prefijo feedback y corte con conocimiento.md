# Rework de memoria — prefijo feedback y corte con conocimiento

**Estado: Nuevo · Creado 26-07-24 · Analizado con `planificar` el 26/07/2026.** Idea de Javier 26-07-24, en la sesión del plan de distribución marketplace.

> El título quedó viejo: el prefijo y el corte con conocimiento se resuelven **por disolución** — memoria deja de existir, así que no hay prefijo que arreglar ni corte que escribir. Se conserva el nombre del archivo por la regla de nombre estable.

## La molestia

- El prefijo **`feedback_`** antepuesto a **todas** las memorias molesta. No todas son feedback (el frontmatter ya tiene `metadata.type` ∈ `user | feedback | project | reference`), pero el nombre de archivo dice `feedback_` igual.
- Esas memorias **parecen un listado de subsistemas** (`feedback_flujo_planes`, `feedback_semantica`, `feedback_decisiones`, `feedback_herramientas`…): son punteros al comportamiento de cada subsistema, no hechos sueltos.
- El **resto** de lo que podría ir en memoria **se confunde con el Conocimiento**. El corte memoria↔conocimiento hoy está escrito de un solo lado (el MANIFIESTO de conocimiento tiene la prueba "¿seguiría siendo cierto si este repo no existiera?"; memoria no tiene el corte simétrico).

## De dónde viene el enredo (Javier, 26-07-25)

**Memoria fue el primer subsistema que existió**, así que los agentes de esa época guardaban **todo** ahí. Lo que hoy cuelga de memoria no es un diseño: es **legacy** de cuando no había dónde más ponerlo. Con eso, las dos molestias de arriba dejan de ser dos problemas y pasan a ser el mismo residuo visto por dos lados.

## Evidencia medida (26-07-25, sobre tres repos)

La memoria está partida en dos poblaciones, y la partición es la misma en los tres:

- **8 memorias Base, idénticas en los tres repos**, que describen subsistemas: `feedback_flujo_planes`, `feedback_semantica`, `feedback_decisiones`, `feedback_conducta`, `feedback_herramientas`, `feedback_estilo_commits`, `feedback_base_conocimiento`, `feedback_archivo_de_estado`.
- **Memorias del Propósito**, y varias **son conocimiento mal ubicado**: en Impresión3d, `k1c-network`, `machines`, `orcaslicer-cli-headless`, `gear-ring-petg-print-in-place` pasan la prueba de pertenencia sin dudar (la red de una impresora K1C sigue siendo cierta sin el repo).

En el repo autor las 10 memorias son `type: feedback`, las cuatro por igual. Ese tipo significa "el usuario me corrigió y lo asenté", que es lo que hoy hace `registrar-preferencia` — un subsistema que nació **después** que memoria. El prefijo molesta porque el tipo quedó sin razón de ser cuando preferencias se lo llevó.

---

# Diseño acordado (26/07/2026)

## 1. Memoria se transforma en `subsistemas`

Memoria **no sobrevive**. El subsistema pasa a ser `subsistemas`: el **catálogo de subsistemas del Agente Multipropósito**, indexado por `SUBSISTEMAS.md`, que toma el lugar de `MEMORIA.md` en el contexto siempre cargado.

- **Una entrada = un subsistema.** Cada fila apunta a su `MANIFIESTO.md`, su `README.md`, su skill y su lint.
- **Dos secciones por origen**, mismo molde que `herramientas`, `conducta` y `PREFERENCIAS.md`: **Subsistemas Base** (los que manda el Agente Multipropósito) y **Subsistemas del Propósito** (los que el repo se arma para lo suyo).
- **Lleva lint.** El catálogo se puede desincronizar del disco, y hoy ya pasa: `AGENTS.md` declara `commits` como subsistema y en `.claude/` no existe esa carpeta — todo el "subsistema commits" es la memoria `feedback_estilo_commits.md`. Ese lint pesca exactamente eso.
- **Lleva skill de operación: `agregar-subsistema`**, para acoplar uno nuevo en el momento. Con eso el Patrón (índice + entradas + lint) queda disponible para el Propósito de cada repo, no solo para la Base: Impresión3d podría armarse un subsistema de perfiles de impresión.

## 2. Cada subsistema gana un `README.md`, y el manifiesto deja de mandar a leer

El principio: **cada archivo se basta solo para su trabajo, y no hay cadena de punteros.**

- **`MANIFIESTO.md`** — siempre en contexto. Su trabajo es que el agente sepa qué es el subsistema, cuándo dispararlo y con qué operarlo, y tiene que estar **completo para eso**. Se le saca la línea que manda a leer otra cosa (`"detalle en la memoria feedback_flujo_planes.md"`): o lo que falta entra ahí, o no hacía falta.
- **`.claude/<sub>/README.md`** — a demanda. La explicación entera del subsistema: el porqué, el modelo, los casos raros. **No manda a ningún lado.**

Lo que fuerza la separación es el presupuesto de contexto, no el gusto: los siete manifiestos pesan hoy 9,2 KB y están siempre cargados; el detalle de los subsistemas pesa 26 KB. Meterlo adentro llevaría el arranque a ~35 KB en cada sesión de cada repo, que es lo que la decisión 0023 prohíbe explícitamente. Pero es **un salto, no una cadena**, y el salto es al archivo de al lado.

**`feedback_flujo_planes.md` no era una memoria mal puesta por su contenido: era el README de planes viviendo en la carpeta equivocada.** El repo ya usa esa convención 15 veces —hay README al lado de cada lint, cada script y cada hook—; lo que falta es el escalón de arriba, el README del subsistema.

**No agrega duplicación.** Cada texto vive hoy dos veces (la copia aplicada en `.claude/<sub>/` y la de `PLANTILLA.md` de `amp:inicializar`); mover el archivo de carpeta lo deja en dos.

## 3. Reparto de las 10 memorias del repo autor

| Memoria | Destino | Por qué |
|---|---|---|
| `feedback_flujo_planes` | `.claude/planes/README.md` | Es el README de planes |
| `feedback_semantica` | `.claude/semantica/README.md` | Ídem |
| `feedback_decisiones` | `.claude/decisiones/README.md` | Ídem |
| `feedback_base_conocimiento` | `.claude/conocimiento/README.md` | Ídem |
| `feedback_conducta` | `.claude/conducta/README.md` | Ídem |
| `feedback_herramientas` | `.claude/herramientas/README.md` | Ídem |
| `feedback_estilo_commits` | preferencias **+** conducta | El texto del estilo es una preferencia; la entrega antes de commitear es una regla de conducta. Se parte en dos, no gana una |
| `feedback_archivo_de_estado` | preferencias **+** conducta | Misma forma |
| `feedback_terminologia_canonica` | `.claude/conocimiento/` | Pasa la prueba de pertenencia: "una regla escrita con el vocabulario que prohíbe se auto-refuerza" sigue siendo cierto sin este repo. Hermana de `modos-de-falla-ante-reglas-escritas` |
| `feedback_propagacion_harness` | la skill local `propagar-harness` | Duplica una skill que ya existe |

Memoria queda **vacía** en el repo autor: 26 KB a cero. En el Coordinador sobreviven hechos como `project_piloto_contable_dockerizado`, que van a **conocimiento**.

## 4. Los hechos contingentes del proyecto van a conocimiento, sin secciones nuevas

La prueba de pertenencia del `MANIFIESTO.md` de conocimiento —*"¿seguiría siendo cierto si este repo no existiera? Sí → conocimiento; no → memoria o decisión"*— **se borra**. Se escribió para separar conocimiento de memoria, y memoria es justo lo que se retira: la rama del "no" apunta a un lugar que dejará de existir.

Conocimiento queda como el **único** lugar donde vive lo que el agente sabe, sin distinguir dominio de proyecto. La demarcación que importa deja de ser contra memoria y pasa a ser contra los otros subsistemas, que ya está resuelta por los cinco ejes de la **decisión 0020**.

## 5. `herramientas` y `conducta` reciben skill de operación

Son los dos subsistemas reales sin skill (`commits` no es un subsistema, ver arriba). Hoy sus registros se editan a mano: `herramientas/INDICE.md` son cinco columnas, dos secciones por origen y un README obligatorio que el lint reclama; dar de alta una regla de conducta es elegir un momento de `MOMENTOS.md`, una clase de acción entre tres, la sección que corresponde, y cablear el hook.

- **`registrar-herramienta`** (ratificado por el usuario 26/07/2026)
- **`registrar-regla`** (ratificado por el usuario 26/07/2026)

## 6. Una habilidad que reparte lo mal ubicado

**Una sola skill, de una corrida**, que barre el repo entero y trata de mandar cada cosa a su subsistema: propone destino y el porqué, y **pregunta pieza por pieza**. No ocho barridos por subsistema, no orquestador, no registro que lleve la cuenta.

- **Nombre provisorio: `actualizar-subsistemas`.** ⚠️ Choca con `amp:actualizar`, que significa "poner al día contra la plantilla **sin** tocar el Aprendizaje"; esta hace lo contrario —abre el Aprendizaje y lo mueve—. Dos cosas casi opuestas con el mismo verbo. **Nombre a resolver** (decisión 0016: los nombres de skill los ratifica el usuario).
- **Por qué no la hace el nivelador.** El principio fundante de `amp:actualizar` (decisiones 0027 y 0028) es que **nunca abre el Aprendizaje** — es lo que lo hace seguro de correr. Reclasificar las memorias del Propósito es abrir el Aprendizaje, y ahí no hay regla mecánica: en Impresión3d hay que mirar `k1c-network`, `machines` y `orcaslicer-cli-headless` una por una, con el usuario.
- **El corte cae solo:** las 8 Base son idénticas en los tres repos y son Base, así que las pisa el nivelador sin preguntar; las del Propósito las toma esta skill.

### Por qué NO un mecanismo con registro de propuestas

Se analizó y se descartó por sobreingeniería. Un orquestador que corre varios barridos, junta propuestas en una tabla y resuelve conflictos necesita un archivo de estado que sobreviva entre sesiones (es una exploración multi-variable) — y archivo de estado + entradas + lint **es** el Patrón de subsistema de la decisión 0002. La tabla no se queda en tabla: deriva sola en un subsistema más, que es el modo de falla que este rework está deshaciendo.

Los conflictos existen —`feedback_estilo_commits` la reclaman preferencias y conducta; `feedback_terminologia_canonica`, conocimiento y semántica— pero son pocos y se resuelven con criterio en el momento, con el usuario presente. Y la respuesta al conflicto no siempre es elegir uno: a veces la pieza se parte en dos.

## 7. Cuenta de plugins y migración

7 hoy → **9**: se retira `amp-memoria`, entran `amp-herramientas`, `amp-conducta` y `amp-subsistemas`.

Se disuelven las **cuatro dependencias** de `amp-planes`, `amp-conocimiento`, `amp-semantica` y `amp-decisiones` sobre `amp-memoria`: existían solo para sembrar las cuatro `feedback_<sub>` que se van.

`amp-memoria` pasa a ser **nombre retirado**. Es el caso que `actualizar-plugins` ya detecta y que `amp:actualizar` ya sabe ejecutar: instalar lo nuevo → desinstalar lo viejo con su alcance → reiniciar. Irreversible, pero herramentado.

## Decisiones que hay que tocar

- **Nueva**, que asiente el rework completo.
- **0006** queda sin objeto en su parte de memoria (renombró `memory/`→`memoria/`).
- **0029** cambia en dos cláusulas: la cuenta de plugins y las cuatro dependencias sobre `amp-memoria`.
- **0023** se cumple mejor, no se contradice: el detalle sigue siendo on-demand, pero el brazo `feedback` se reemplaza por el `README` del propio subsistema.

## Pendiente de ratificación del usuario

- La fila **Subsistema** del glosario define el concepto enumerando *"(memoria, conocimiento, semántica, decisiones, planes, herramientas)"*. Esa lista queda vieja. **Propuesta:** sacar la enumeración y dejar la definición por el Patrón, que es lo que de verdad define el concepto — más ahora que un repo puede crear los suyos con `agregar-subsistema`.

## Lo que este rework NO resuelve

- **El solapamiento entre subsistema y skill.** Cada subsistema sigue teniendo su skill viajando por plugin, así que `subsistemas` nunca va a nombrar *solo* archivos. Ese corte es otro (decisión 0034).
- **Las mega-skills** → plan `Partir las mega-skills en habilidades de un verbo`.
- **La duplicación del canal de distribución** → plan `Sacar la duplicacion del canal de distribucion`.

## Cruces

- `Revisar cada subsistema — sentido, disparador y skill de operación` — menciona "el corte memoria↔conocimiento escrito de un solo lado".
- `Subsistema de Registros genérico como parte de Conocimiento` — dónde viven documentos vs hechos.
- `Separar origen Base y aprendido en los subsistemas`: las `feedback_<sub>` son memorias de **Base**; mismo eje de origen.
- `Habilidad para poblar subsistemas desde un repo existente` (Diferido) — su nota dice que queda "glosario/decisiones/memoria"; la parte de memoria la absorbe el punto 6 de acá.
