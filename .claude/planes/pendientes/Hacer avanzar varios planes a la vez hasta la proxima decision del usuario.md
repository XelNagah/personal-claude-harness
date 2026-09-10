# Hacer avanzar varios planes a la vez hasta la próxima decisión del usuario

**Estado: Nuevo · Creado 26-08-27.** Origen: consulta del Agente Desplegado
*Agente-Coordinador*, que había armado un paquete propio para hacer avanzar los
planes de otros agentes de la máquina y preguntó si eso debía subir a la Base.
El diseño de abajo es de Javier, ratificado en esa conversación el 26/08/2026,
incluido el nombre `avanzar-planes` sobre `paralelizar-planes`.

## El problema

El backlog crece más rápido de lo que se ejecuta, y el cuello de botella es **la
atención del usuario**, no la máquina: cada plan se frena en la primera duda que
sus bases no resuelven, y se queda frenado hasta que él conteste.

Censado el 26/08/2026 sobre los `PLANES.md` de los 21 Agentes Desplegados de la
máquina, leídos del disco: **1 `Listo`, 11 `En curso`, 1 `Análisis`, 65 `Nuevo`**.
De esos 65 en `Nuevo`, 46 son de este repo.

Dos cosas se siguen del número. La primera: cualquier mecanismo que arranque
pidiendo planes en `Listo` no tiene con qué correr. La segunda: **el embudo está
en `Nuevo` → `Análisis` → `Listo`**, o sea en analizar, no en ejecutar.

## El diseño

Una habilidad de **conducción**, `avanzar-planes`, que toma varios planes y los
empuja hacia adelante todo lo que se pueda sin el usuario. Cuando uno topa una
decisión que lo necesita, **no espera**: la levanta, la deja en la cola y sigue
con el siguiente. El usuario decide después, de a varias juntas, y ahí los planes
retoman.

No es una habilidad monolítica: despacha según el estado, que es un dato que la
máquina de estados ya provee (Decisión Local-0057).

| Estado del plan | A quién llama |
|---|---|
| `Nuevo` | `analizar-plan` |
| `Análisis` | `analizar-plan` (continúa) |
| `Listo` | `ejecutar-plan` |
| `En pausa` con su decisión ya respondida | `retomar-plan`, y después el verbo del `estado_a_retomar` |
| `Diferido` | no entra: volver al trabajo es una decisión, no un avance |
| `Ejecutado`, `Descartado` | no entran |

El avance de cada plan para de tres maneras, y las tres son salidas normales:

- **Topó una decisión** → `pausar-plan` con `estado_a_retomar`, más su entrada en
  la cola. No adivina.
- **Terminó** → queda `En curso`, sin commitear y sin cerrar, esperando revisión.
- **No era ejecutable** → vuelve a `Análisis` diciendo qué le faltaba.

## Por qué el aislamiento por worktree, y qué se verificó

La restricción «un plan por repo a la vez» se sostenía en que dos planes se pisan
los registros compartidos y dejan el `git diff` ilegible. Es cierto, pero se
disuelve con un worktree por plan, y el descarte que se
le había hecho —que el worktree arrancaría sin `.claude/`— es falso acá.

Verificado el 26/08/2026 en este repo:

- **`.claude/` está versionado**: 288 archivos rastreados. `git worktree add` lo
  trae solo, sin copiar ni enlazar nada.
- Lo único ignorado es `settings.local.json`, `tmp/`, `.respaldo-amp/` y un json
  de salida. **De los cuatro, tres es correcto que no viajen.**
- **`.claude/tmp/` propio por copia es un beneficio, no una pérdida**: el
  directorio de trabajo de nombre fijo del plan Local-0110 deja de ser compartido,
  y el Buzón de Avisos Generales (Decisión Local-0051), que borra el aviso al
  entregarlo, deja de comerse el de la otra sesión.
- **Los hooks no se rompen.** Los cuatro de `.claude/settings.json` resuelven la
  raíz con `process.env.CLAUDE_PROJECT_DIR || process.cwd()` y suben hasta
  encontrar `.claude`, así que en una copia resuelven a la copia. Es el
  conocimiento Local-0008 (El repo que un script describe) ya aplicado en código.
- **La plataforma ya lo hace**: el mecanismo de subagentes acepta aislamiento por
  worktree y lo limpia solo si el agente no cambió nada. No hay que
  construir el manejo.

⚠️ **Salvedad para otros Agentes Desplegados.** Acá `enabledPlugins` está en
`settings.json`, versionado, así que los plugins llegan a la copia. Un repo que
siga la Decisión Local-0035 los tiene en `settings.local.json`, que **no viaja**:
la copia arrancaría sin plugins habilitados y **sin ninguna señal** — las
habilidades simplemente no existen en esa sesión. Copiar ese archivo al crear la
copia es una línea, y hay que hacerla.

## Los tres arreglos que el aislamiento obliga

Lo que se rompe no es la ejecución: es el merge de vuelta.

**1. Reservar los códigos antes de lanzar.** El registro asigna `máximo + 1`. Dos
copias que crean una entrada a la vez eligen el mismo número, y `git merge` no lo
ve: son dos líneas distintas al final de la misma tabla, así que las deja convivir
con el código duplicado. Y el control posterior depende del subsistema — medido el
26/08/2026 sobre los lints de este repo, detectan código o nombre repetido
`planes`, `decisiones`, `herramientas`, `preferencias`, `subsistemas` y
`comunicacion`, y **no lo detectan `conocimiento` ni `semantica`**. Ahí la
colisión pasa en verde, que es la forma del conocimiento Local-0013. El arreglo es
barato: el conductor asigna los códigos en el hilo principal antes de lanzar y le
pasa a cada copia el suyo. Serializa la identidad, que es lo único que no se puede
paralelizar, sin serializar el trabajo.

**2. El control de cierre corre sobre el árbol integrado.** Dos planes que editan
el mismo archivo en secciones distintas mergean sin conflicto y el resultado
combinado puede estar mal; ningún lint lo ve, porque cada mitad es válida. Un
verde por copia no dice nada del conjunto.

**3. La versión del plugin y `sincronizar-base`, una sola vez al final.** Dos
planes que suben `version` en el mismo `plugin.json` chocan, y el chequeo
versión↔contenido de la Decisión Local-0063 compara contra el commit donde se fijó.

## La cola de decisiones

Lo que hoy no existe en ningún lado: una decisión que espera respuesta **durante
días** no tiene dónde vivir. Cada entrada tiene que ser respondible en frío, por
alguien que no siguió la sesión — el mismo requisito y el mismo remedio que la
Decisión Local-0073 le puso al handoff: lo escribe quien tiene el contexto, ya
redactado, no como la instrucción de redactarlo.

Dos requisitos propios:

- **Dedupe de preguntas equivalentes.** Con varios planes en vuelo, dos pueden
  topar el mismo punto abierto. Sin dedupe el usuario responde dos veces, y peor,
  puede responder distinto.
- **Estructura antes que texto plano.** La entrada lleva frontmatter —plan, estado
  a retomar, identificador de sesión para retomar, fechas— porque sin datos no se
  puede ordenar, filtrar ni deduplicar.

**No reabre el plan Local-0060 (Buzones de comunicación entre Agentes),
descartado el 09/08/2026.** Aquel resolvía la distancia **entre agentes**, y se
descartó porque `comunicacion` la cubre corriendo al otro en vez de dejarle un
sobre. Esta cola es entre **el agente y el usuario**: otra distancia, sin
cobertura. Y el nombre «buzón» ya está tomado por el Buzón de Avisos Generales
(glosario Local-0034), así que el nombre de esto queda para ratificar.

## Repo limpio: la regla que reemplaza a «avisar y esperar»

Exigir el árbol limpio antes de lanzar trata igual tres casos distintos:

- **Basura ignorada del propio harness** — no cuenta, y `git status --porcelain`
  ya no la lista.
- **Trabajo real sin commitear de otra sesión** — con worktree deja de
  importar: el worktree se crea desde un commit, así que el plan no ve la basura ni
  la basura ve al plan.
- **Cambios del mismo plan que se va a lanzar** — no hay que frenar, hay que
  retomar.

La regla queda: **no exigir repo limpio; exigir que exista un commit desde el cual
ramificar.** Si el árbol está sucio se lanza igual desde `HEAD` y se informa qué
quedó afuera. Se frena en un solo caso: cuando lo sin commitear toca los mismos
archivos que el plan va a tocar, porque ahí el merge pelea contra algo que no está
en ningún commit y no se puede reconstruir ni descartar limpio.

## Lo que hay que resolver

1. **Cómo se declara el alcance de un plan para que una máquina lo compare.** Hoy
   «Alcance del trabajo» es texto plano —los planes Local-0113 y Local-0114 lo
   traen bien escrito, con archivos nombrados— y no se puede leer para decidir qué
   agrupar ni para predecir un choque de merge. Sin esto, agrupar es a ojo.
2. **Dónde vive `avanzar-planes`.** El subsistema `planes` es el dueño natural del
   verbo, pero coordinar a otros agentes no le sirve a todo Agente Desplegado; la
   Decisión Local-0078 fija que eso viaja en plugin aparte habilitado por repo.
   Puede que el verbo vaya en `amp-planes` y la conducción en un plugin propio.
3. **Si es una habilidad o dos, para planes propios y ajenos.** El verbo es el
   mismo y lo que cambia es quién ejecuta —worktree local, o `resolver`
   sobre el repo del otro—, así que en principio es una. Pero hay una asimetría
   que no desaparece: en el repo propio se controla el aislamiento y en el ajeno
   no, así que allá «un plan por agente a la vez» sigue valiendo. Cambia de dueño,
   no se levanta.
4. **El límite del transporte.** `comunicar.js:169` avisa que retomar un hilo con
   `--sesion` **solo está resuelto para `claude`**. Contra un agente que corra
   Codex, retomar no existe y el plan hay que relanzarlo entero.
5. **Que una habilidad llame a otras del mismo subsistema.** Hay precedentes de
   reutilización (`sugerir-siguiente-plan` reutiliza `priorizar-planes`,
   `analizar-plan` reutiliza `amp:planificar`), pero no de despacho condicional
   por estado. Si se confirma, corresponde asentarlo como decisión.
6. **Cuántos planes a la vez.** Ninguna medición dice si el rendimiento sube
   lineal o si el merge se come la ganancia después de tres.

## Alcance del trabajo

- `ejecutar-plan`, que no existe: vive en el plan Local-0043 y es precondición.
- La conducción `avanzar-planes` y su despacho.
- La cola de decisiones, con dedupe y frontmatter.
- La reserva de códigos antes de lanzar, que es mecánica y va en Herramienta.
- El control de cierre sobre el árbol integrado.
- El alcance declarado por plan, comparable.
- Bancos de prueba con escenario sintético (Decisión Local-0075).
- Si viaja: `sincronizar-base` y subir la versión del plugin.

## Cómo se prueba

Tres planes en `Nuevo` de alcance chico y disjunto, llevados de `Nuevo` a
`Análisis`/`Listo` —el embudo real—, no ejecutados: los planes Local-0113,
Local-0114 y Local-0118. Tocan archivos distintos, ninguno toca `AGENTS.md` ni los
índices grandes, y **entre los tres ya traen seis puntos a decidir escritos**, así
que hay carga real para la cola desde la primera corrida sin fabricar nada.

Lo que hay que medir: cuántas entradas produce cada plan, cuántas se responden en
una sola pasada, y qué pasa cuando los tres escriben su transición de estado en
`PLANES.md`. Aunque cambien una sola celda, los tres escriben el mismo registro:
es el problema del merge en chico, con daño acotado y reversible.

## Planes relacionados

- [Habilidad de ejecucion de planes](Habilidad%20de%20ejecucion%20de%20planes.md) (Local-0043) — el verbo que falta. Precondición.
- [Dos corridas de las pruebas a la vez se pisan el directorio de trabajo](Dos%20corridas%20de%20las%20pruebas%20a%20la%20vez%20se%20pisan%20el%20directorio%20de%20trabajo.md) (Local-0110) — sigue valiendo para dos sesiones a mano, que no tienen worktree.
- [Priorizar planes releva de cero los planes que no cambiaron](Priorizar%20planes%20releva%20de%20cero%20los%20planes%20que%20no%20cambiaron.md) (Local-0114) — su punto a decidir 2 es el mismo problema de concurrencia.
- [Partir las mega-skills en habilidades de un verbo](Partir%20las%20mega-skills%20en%20habilidades%20de%20un%20verbo.md) (Local-0070) — el criterio que impide que la conducción se coma a la familia.

## Estado

Archivo de estado de la **medición del 04/09/2026**: la corrida a mano que responde
la cuestión abierta 6 (cuántos planes a la vez) heredada del plan Local-0120.

**Diseño de la corrida.** Tres planes en `Nuevo`, chicos y de subsistemas distintos,
llevados a `Análisis`/`Listo` — el embudo real. Cada uno en su worktree armado con
`preparar-worktree`, con una sesión no interactiva de Claude Code adentro y
`--output-format json`, que es lo único que deja ver una denegación de permisos
(conocimiento Local-0017). **No** se usa el aislamiento por worktree nativo del
mecanismo de subagentes: arma un `git worktree add` pelado, sin `settings.local.json`,
y el agente de adentro arranca sin plugins y sin señal.

**Restricción impuesta a cada agente:** escribe solo su archivo de plan y su fila en
`PLANES.md`. Nada de decisiones, glosario ni conocimiento — lo que proponga queda en
el archivo del plan y lo asienta el hilo principal (Decisión Local-0060). Esquiva
además la reserva de códigos, que todavía no existe.

| Plan | Modo de permisos | Turnos | Duración | Costo | Denegaciones | ¿Escribió? |
|---|---|---|---|---|---|---|
| Local-0067 | `bypassPermissions` | 35 | 453 s | US$ 3,40 | 0 | **sí** |
| Local-0110 | `dontAsk` + `--allowedTools` | 29 | 463 s | US$ 3,13 | 3 | no |
| Local-0107 | `dontAsk` + `--allowedTools` | 16 | 70 s | US$ 1,04 | 5 | no |

Total US$ 7,57, contra los ~US$ 2 estimados. La estimación venía del conocimiento
Local-0017, que midió **consultas** de un turno; un análisis de plan son 16 a 35
turnos y cuesta otro orden.

**Margen de ruta medido:** 211 de 260 caracteres con la raíz por omisión
(`.claude/tmp/worktrees/`). Entra sin raíz corta, pero con 49 de margen: un repo
instalado en una ruta más larga que ésta no entra.

**Qué se mide:** duración y costo de cada corrida, denegaciones de permiso, cuántas
decisiones abiertas produce cada plan, y qué pasa al integrar las tres transiciones
de estado sobre el mismo `PLANES.md`. Cierre con `ejecutar-control-cierre` sobre el
árbol ya integrado — el arreglo 2 de este plan.

### Bitácora

- **04/09/2026** — Worktrees `plan-0110`, `plan-0107` y `plan-0067` armados sobre
  `19c04a6`, con repo limpio. Los tres verificados sin enlaces adentro.

- **05/09/2026 — Resultado de la primera corrida. Cuatro hallazgos, y el objetivo
  principal quedó sin responder.**

  **1. `--allowedTools` no habilita la escritura en modo `dontAsk`.** Las dos
  corridas lanzadas con `--permission-mode dontAsk --allowedTools
  "Read,Write,Edit,Glob,Grep,Skill,TodoWrite"` tuvieron **todo** `Write` y `Edit`
  denegado, pese a estar nombrados en la lista. `settings.local.json` del repo
  incluso trae `Write(.claude/planes/**)` y `Edit(.claude/planes/**)` en `allow`, y
  tampoco alcanzó. Es una cuarta forma de la falla del conocimiento Local-0017: los
  frenos obvios no hacen lo que dicen. La diferencia es que **esta vez se vio**,
  porque `--output-format json` devuelve `permission_denials`. Leyendo la respuesta
  pelada, el reporte del plan Local-0110 se lee como un análisis hecho.

  El trabajo se perdió igual: 463 s y US$ 3,13 de análisis completo que nunca llegó
  a disco. **Para `avanzar-planes` esto es una precondición, no un detalle**: el
  modo de permisos con que se lanza cada worktree hay que verificarlo con una
  escritura de prueba antes de gastar la corrida.

  **2. El worktree no contiene al agente de adentro.** El del plan Local-0067
  escribió su primera edición de `PLANES.md` **en el repo principal**, no en su
  worktree. La revirtió por su cuenta y el árbol principal quedó limpio, pero pudo
  no hacerlo. La ruta absoluta del repo original le sigue estando disponible, y
  aparece en el texto que carga al arrancar. El aislamiento es de árbol, no de
  alcance de escritura: hay que acotarlo aparte.

  **3. El clasificador del modo automático bloquea `bypassPermissions`, y no
  siempre.** De tres lanzamientos idénticos, uno pasó y dos se rechazaron. O sea que
  el único modo que sí escribió no se puede lanzar de forma reproducible desde una
  sesión en modo automático. Es un problema de mecanismo, no de diseño del plan.

  **4. El objetivo principal quedó sin responder.** Como escribió uno solo, **no
  hubo merge que medir**: las tres transiciones de estado simultáneas sobre
  `PLANES.md`, que era el punto, no llegaron a ocurrir. Tampoco quedó medido cuántos
  planes a la vez rinden.

  **Lo que sí rindió, y era el otro objetivo:** el análisis del plan Local-0067
  quedó hecho y persistido en su worktree, con 7 decisiones anotadas para el usuario
  y un hallazgo que le cambia el tamaño al plan — la deuda son 3 filas, no 80.

- **05/09/2026 — Segunda parte: la integración, que era el objetivo. Se completó
  con dos planes, y apareció el hallazgo que más cambia el diseño.**

  El análisis del plan Local-0110 se recuperó **del archivo de la corrida**: el
  `content` del `Write` denegado traía el documento entero, 181 líneas. Se escribió
  en su worktree y se le hizo la transición de estado, para que la integración
  ocurriera de verdad por git y no la fabricara el hilo principal. Cada worktree
  quedó con un commit propio, y los dos se juntaron en un cuarto worktree
  (`integracion`) armado desde el mismo commit — el repo principal no se tocó.

  **5. Las dos transiciones simultáneas sobre `PLANES.md` se juntan solas, sin
  conflicto.** `git` las auto-mergeó y las dos sobrevivieron: Local-0067 y
  Local-0110 quedaron los dos en `Análisis`. **Es la respuesta al objetivo, y no es
  tranquilizadora**: es exactamente lo que el arreglo 2 de este plan advertía —dos
  ediciones de secciones distintas del mismo archivo mergean limpio y nadie mira el
  resultado combinado—. Acá el combinado está bien porque son dos filas distintas,
  pero eso lo garantizó el caso, no el mecanismo. El control sobre el árbol
  integrado sigue siendo obligatorio.

  **6. Los controles del repo dan rojo adentro de un worktree, sin que nada haya
  cambiado.** El control de cierre sobre el árbol integrado marcó 3 pruebas
  fallando; sobre el repo principal, ninguna. Aislado con el worktree `plan-0107`,
  que **no tiene un solo cambio**: falla idéntico —8 de 25 casos de
  `detectar-terminologia-vetada`, más `establecer-conducta`—. O sea que la falla es
  de correr en una copia, no del trabajo.

  **Para `avanzar-planes` esto es lo más caro de los seis hallazgos:** el agente que
  trabaja en un worktree **no puede verificar su propio trabajo**, porque el control
  de cierre le contesta rojo por el entorno. Y un rojo que no corresponde a ningún
  defecto es la forma que el propio plan Local-0110 describe: se lee como problema
  de máquina y se ignora, hasta que un día tapa uno real. Hay que diagnosticar por
  qué esos bancos dependen del árbol antes de construir la conducción; si no, el
  control sobre el árbol integrado nace sin valor.

### Lo que la medición deja para el diseño

1. **Verificar el permiso de escritura con una escritura de prueba antes de gastar
   la corrida.** Cuesta un turno y evita perder los treinta.
2. **Acotar por dónde puede escribir el agente**, que el worktree no hace.
3. **Correr el control de cierre sobre el árbol integrado**, ya confirmado como
   necesario — pero antes arreglar el hallazgo 6, o no mide nada.
4. **Guardar siempre la salida en JSON**: es lo único que muestra las denegaciones,
   y además es de donde se recuperó un análisis entero que ya estaba pago.
5. **Cuántos planes a la vez sigue sin responder.** Con dos, la juntada no costó
   nada; el costo aparece cuando dos planes tocan el mismo archivo en serio, y eso
   no pasó.

- **07/09/2026 — La juntada final, con `main` ya movido. Séptimo hallazgo, y es el
  peor de los siete.**

  Entre el armado de las copias y la juntada, `main` avanzó un commit —el barrido de
  la relación vetada Local-0051 (`bundle` → `paquete`)—. Las copias seguían paradas
  en la foto anterior.

  **7. El agente de la copia reintrodujo tres veces un término que se había vetado
  y barrido mientras él trabajaba.** El análisis del plan Local-0067 escribió
  «bundle por dependencias» en tres lugares nuevos, sobre un texto del que `main`
  acababa de sacarlo. La copia no podía saberlo: su registro de relaciones vetadas
  era el viejo.

  **Los dos controles que existen para esto no lo hubieran visto, y por motivos
  distintos.** El hook `detectar-terminologia-vetada` sí corrió y sí dejó escribir,
  porque lee el registro de **su** copia, donde la relación todavía no existía —un
  control que valida contra un registro viejo es la forma «mira una copia» del
  conocimiento Local-0013—. Y el control de cierre adentro de la copia está roto por
  el hallazgo 6, así que tampoco había segunda barrera.

  **Lo que sí lo agarró fue git**, y por casualidad: `main` había tocado el mismo
  párrafo, así que la juntada dio conflicto y hubo que mirarla a mano. Las otras dos
  apariciones estaban en párrafos nuevos y se habrían mergeado limpio. Si el barrido
  hubiera tocado otra línea del archivo, el término entraba en verde.

  **Consecuencia para el diseño, y es una precondición más:** una copia envejece
  respecto del repo, y lo que envejece no es solo el código — son **los registros
  contra los que el agente valida lo que escribe**. `avanzar-planes` tiene que traer
  el repo a la copia antes de dar por bueno lo que produjo, y volver a pasarle los
  controles del subsistema semántica al texto ya integrado, no al de la copia.

## Resultado de la corrida

**Integrado en `main`.** Los dos análisis quedaron en el repo, los planes Local-0067
y Local-0110 pasaron a `Análisis`, el término reintroducido se barrió al juntar, y
las cuatro copias se limpiaron con `limpiar-worktree` dejando el `.claude/` completo
en 304 archivos.

**Verificado sobre `main` ya integrado:** `detectar-terminologia-vetada` da **OK en
sus 25 casos** y `establecer-conducta` **OK en 55** — los mismos que fallaban 8 y
entero adentro de la copia. Es la prueba del hallazgo 6. Queda fallando
`actualizar-plugins` (1 caso), que mira el estado de plugins de la máquina y no lo
tocó nada de este trabajo: la juntada movió tres archivos, los tres de
`.claude/planes/`.

## Diagnóstico del hallazgo 6 — resuelto el 08/09/2026

**El hallazgo 6 no era «los controles dan rojo»: era que el control estaba apagado.**
Y no había una causa sino dos, las dos del mismo tipo — una expresión que busca `tmp`
en la ruta **absoluta** entera, aplicada a un repo que vive bajo una carpeta `tmp`.

| Archivo | Qué miraba | Efecto adentro de un worktree |
|---|---|---|
| `conducta/alcance-al-escribir.js` (l. 20) | eximía toda ruta con `/tmp/` | el control de términos vetados quedaba **apagado**: no revisaba nada |
| `conducta/establecer-conducta/pruebas.js` (l. 50) | excluía del copiado toda ruta con `/tmp/` | **no copiaba un solo archivo**; el banco moría con `ENOENT` antes de correr un caso |

Los worktrees caían en `.claude/tmp/worktrees/<nombre>/`, así que las dos se
disparaban con todo lo de adentro.

**Evidencia directa**, mismo contenido y mismo término vetado, sola diferencia la ruta:

| Ruta | Veredicto del control |
|---|---|
| `<repo>/nota.md` | rechaza: «terminología vetada» |
| `<repo>/.claude/tmp/worktrees/plan-0067/nota.md` | **nada** |

**Esto reemplaza la explicación del hallazgo 7.** Ahí se dijo que el control dejó
pasar el término recién vetado porque leía el registro viejo de su copia. Es falso: el
control **ni siquiera llegó a mirar el registro**, porque descartó la ruta antes. La
copia sí envejece, pero eso no fue lo que dejó entrar el término, y no hay ninguna
medición que sostenga que envejecer haya causado nada. El punto 3 de «lo que la
medición deja para el diseño» queda cumplido; el resto de esa lista sigue vigente.

**El arreglo**, igual en los dos: medir contra **la raíz del repo al que pertenece el
archivo**, no contra la ruta entera — el primer ancestro con `.git`, que en un worktree
es un archivo y no una carpeta. Así `<worktree>/nota.md` se revisa y
`<worktree>/.claude/tmp/borrador.md` sigue exento, que es lo correcto: cada repo tiene
su propia carpeta de borradores.

**Verificado:**

| Qué | Antes | Ahora |
|---|---|---|
| `detectar-terminologia-vetada` en el repo | 25 de 25 | 27 de 27 (dos casos nuevos) |
| el mismo banco adentro de un worktree | 8 fallando | 27 de 27 |
| `establecer-conducta` en el repo | 55 verdes | 55 verdes |
| el mismo adentro de un worktree | reventaba con `ENOENT` | 55 verdes |
| escribir un término vetado adentro de un worktree | pasaba en silencio | rechazado |

Los dos casos nuevos se verificaron al revés: con la lógica vieja puesta a propósito,
fallan. Un caso que pasa siempre no prueba nada.

Los tres archivos se sincronizaron a `base/`, así que el arreglo viaja a todo Agente
Desplegado que instale el plugin.

## Segunda corrida — 10/09/2026

Responde la cuestión abierta 6 (cuántos planes a la vez) subiendo de dos a **cuatro**,
ahora con el hallazgo 6 ya arreglado: el agente de una copia puede verificar su propio
trabajo.

**Qué cambia respecto de la primera corrida.** El mecanismo: en vez de lanzar una
sesión no interactiva de Claude Code por copia, se usan los **subagentes nativos con
aislamiento por worktree**. Las tres trampas de permisos que costaron US$ 4,17 —
`--allowedTools` que no habilita la escritura en `dontAsk`, el clasificador que
rechaza `bypassPermissions` dos de cada tres veces, y la salida pelada que esconde
las denegaciones — son todas del lanzamiento por CLI y no aplican. La objeción que la
primera corrida le hacía al aislamiento nativo —que arma un `git worktree add` pelado
sin `settings.local.json`, y el agente arranca sin plugins y sin señal— **no se
sostiene en este repo**: `enabledPlugins` está duplicado en `settings.json`, que sí
está versionado, así que los plugins llegan a la copia.

**Los cuatro planes**, uno por subsistema, para que los archivos sean disjuntos y el
único choque posible sea `PLANES.md`:

| Plan | Tema | Subsistema que toca |
|---|---|---|
| Local-0107 | Credencial al consultar a otro Agente | comunicacion |
| Local-0114 | Priorizar planes releva de cero | planes |
| Local-0115 | Veintiocho decisiones con nombre de tema | decisiones |
| Local-0099 | El repartidor pisa el `additionalContext` | conducta |

El Local-0107 entra porque es el único de la primera corrida que no produjo nada
recuperable.

**Restricción a cada agente**, igual que la vez pasada: escribe solo el archivo de su
plan y su fila en `PLANES.md`; lo que haya que asentar en otro subsistema lo anota
adentro del plan y lo ratifica el hilo principal (Decisión Local-0060). Se agrega una
escritura de prueba antes de gastar la corrida, que es el punto 1 de lo que la
medición anterior dejó para el diseño.

**Qué se mide:** si cuatro copias mergean como mergearon dos, cuánto cuesta la ronda
contra los US$ 7,57 de tres corridas por CLI, cuántas decisiones abiertas produce cada
plan, y si el control de cierre sobre el árbol integrado ahora sí dice algo.
