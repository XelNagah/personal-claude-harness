# Hacer avanzar varios planes a la vez hasta la próxima decisión del usuario

**Estado: Análisis · Creado 26-08-27.** Origen: consulta del Agente Desplegado
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

### Resultado de la segunda corrida — 10/09/2026

**Los cuatro produjeron y los cuatro escribieron.** Contra la primera corrida, donde de
tres agentes uno solo llegó a escribir: acá cuatro de cuatro, sin una sola denegación de
permiso. Las tres trampas de permisos de la primera corrida eran del lanzamiento por CLI
y no aparecen con los subagentes nativos.

| Plan | Estado al que llegó | Decisiones abiertas | Duración | Herramientas usadas |
|---|---|---|---|---|
| Local-0099 | `Listo` | 0 | 5 min 43 s | 35 |
| Local-0114 | `Listo` | 0 | 8 min 42 s | 40 |
| Local-0115 | `Análisis` | 2 | 8 min 17 s | 39 |
| Local-0107 | `Análisis` | 1 | 12 min 33 s | 70 |

Las cuatro copias cayeron en `.claude/worktrees/`, no en `.claude/tmp/worktrees/` como
las de `preparar-worktree`. La ruta la excluye `.git/info/exclude`, que es de esta
máquina y **no viaja**: en otro Agente Desplegado las copias de los subagentes aparecerían
como archivos sin versionar. El arreglo del hallazgo 6 las cubre igual, porque mide contra
la raíz del repo al que pertenece el archivo y no contra la ruta absoluta.

**8. Con cuatro planes, `PLANES.md` sí da conflicto — y no por editar la misma fila.**
Es la respuesta a la cuestión abierta 6, y corrige el hallazgo 5. Las dos primeras ramas
se juntaron solas; la tercera dio conflicto, y el motivo es que **las filas son
adyacentes**: la rama del plan Local-0115 tocó su fila y arrastró sin cambios la del
Local-0114, que la rama anterior ya había movido a `Listo`. git no puede separar dos
líneas contiguas y frena.

**Frenar es el buen resultado, y lo que importa es el caso en que no hubiera frenado.**
La resolución correcta era quedarse con la fila del Local-0114 de un lado y la del
Local-0115 del otro. Si las dos filas hubieran estado separadas por una tercera, git las
mergeaba limpio y la transición del Local-0114 volvía a `Nuevo` sin que nadie lo viera:
una transición perdida en verde, que es la forma del conocimiento Local-0013.

**Consecuencia para el diseño, y es la primera restricción dura sobre cuántos planes a la
vez:** el riesgo no crece con la cantidad de planes sino con la **distancia entre sus
filas en el registro**. Cuatro planes de códigos lejanos se juntan solos; dos de códigos
consecutivos chocan. `avanzar-planes` puede leer esa distancia antes de agrupar, porque
el código de cada plan ya la dice. Es un criterio de agrupamiento que no requiere el
alcance declarado de la cuestión abierta 1.

**9. La copia y el repo principal dan exactamente el mismo resultado, y el número que
los dos informan está multiplicado por nueve.**

El control de cierre sobre el árbol integrado dio `lint-harness` con 1 hallazgo —el
desfase de versión de `amp`, 0.62.0 en disco contra 0.61.0 instalado, que es estado de
plugins de la máquina y no lo tocó este trabajo—, `lint-planes` con los 3 planes
envejecidos de siempre, los otros ocho lints en verde, y el banco de pruebas marcado
**NO CORRIÓ**. Corrido a mano, el banco tarda más de diez minutos y cierra con «18
prueba(s) fallaron: hay un control que dejó de controlar».

**Corrido en el repo principal, sin una sola diferencia: 18 también.** Así que ninguna
de las dos cosas es de trabajar en una copia, y el arreglo del hallazgo 6 sigue en pie —
`detectar-terminologia-vetada` da sus 27 casos y `establecer-conducta` sus 55, adentro
de la copia igual que afuera. **El árbol integrado se puede traer a `main`.**

**Pero 18 no es la cantidad de casos que fallan: son dos, contados nueve veces.** El
listado completo de los 23 bancos aparece nueve veces en la salida, y los dos casos que
fallan son siempre los mismos:

- `actualizar-plugins` — *sin el plugin instalado para ese repo, no compara nada*. Es el
  caso que ya venía fallando, conocido y previo.
- `lint-harness` — *un fragmento vigilado se queda sin muestras*, y en el listado resumen
  ese banco figura directamente como **NO CORRIÓ**.

**La causa está en el propio banco de `ejecutar-control-cierre`:** sus casos invocan la
Herramienta `ejecutar-control-cierre`, que corre `ejecutar-pruebas`, que corre todos los
bancos incluido el suyo. Cada caso que invoca la Herramienta dispara una corrida completa
del banco, y de ahí salen las nueve repeticiones, los diez minutos y el número inflado.

**Por qué importa más allá de la lentitud.** El repo cierra tareas con este control, y su
última línea dice «18 pruebas fallaron: hay un control que dejó de controlar» cuando los
casos que fallan son dos. Un conteo que no corresponde a nada es la forma del conocimiento
Local-0013: la señal deja de significar lo que dice, y cuando el número suba porque se
rompió algo de verdad, nadie va a poder distinguirlo del ruido. Es candidato a plan
propio, y no es de este trabajo ni de la paralelización.

**10. Al limpiar las copias de los subagentes, la Herramienta gritó cuatro veces el daño
que existe para evitar, y no había ningún daño.**

`limpiar-worktree` cerró las cuatro con el mismo texto: *«faltan 502 archivo(s) en el
`.claude/` del repo»*, seguido de *«ESTO ES EL DAÑO QUE LA HERRAMIENTA EXISTE PARA
EVITAR. Recuperá el `.claude/` del repo antes de seguir trabajando»*. Verificado
enseguida: `git status` limpio, los 302 archivos versionados de `.claude/` presentes, el
árbol intacto. No faltaba nada.

**La causa es una ruta que el código no conoce.** La Herramienta compara cuántos archivos
tiene el `.claude/` del repo antes y después de borrar, y excluye de esa cuenta lo que no
es del repo: `common/worktrees.js:24` declara `NO_SE_COPIA = new Set(['tmp',
'.respaldo-amp'])`. Las copias que arma `preparar-worktree` caen en
`.claude/tmp/worktrees/`, adentro de `tmp`, así que no se cuentan. **Las copias de los
subagentes nativos caen en `.claude/worktrees/`**, que no está en esa lista: se cuentan
como si fueran del repo, y al borrarlas la baja se lee como destrucción.

Los 502 son los archivos de las cuatro copias. El conteo del `.claude/` pasó de 2313 a
623, que son los 623 reales.

**Es la misma forma del hallazgo 6, dada vuelta.** Allá una ruta con `tmp` adentro apagaba
un control que debía revisar; acá una ruta sin `tmp` adentro enciende una alarma que no
corresponde. Las dos veces el defecto es medir contra una ruta escrita a mano en vez de
contra lo que la ruta significa.

**Por qué es caro.** Es la alarma más fuerte que emite el repo, y salió cuatro veces
seguidas sin que hubiera pasado nada. Una alarma que grita en falso enseña a ignorarla, y
el día que el borrado sí vacíe el `.claude/` —el caso del conocimiento Base-0007, que es
real y ya ocurrió— va a estar entre estas cuatro. Corresponde plan propio.

**Aparte, del primer intento sobre el árbol de integración:** falló con `EPERM` al borrar
la raíz porque la sesión tenía su directorio de trabajo adentro de esa misma copia. El
segundo intento, ya parado afuera, salió limpio. La Herramienta avisa bien lo que ese
error significa —«borré hasta acá», no «no borré nada»—, pero quien la invoque tiene que
pararse afuera antes.

## Tercera corrida — 11/09/2026

En curso mientras se escribe esto: **tres agentes en paralelo**, con aislamiento por
worktree nativo, contra los cuatro de la segunda. Este análisis lo escribió uno de esos
tres agentes, sobre el plan que diseña el mecanismo que lo lanzó.

**Qué cambia respecto de la segunda corrida.** Tres reglas nuevas, y las tres son de
diseño, no parches de esta corrida.

**a. El hilo principal se quedó con la escritura del registro.** Ningún agente toca
`PLANES.md`: cada uno escribe solo su archivo de plan y **reporta el texto exacto de la
fila** que corresponde; el hilo principal las escribe al integrar, en orden. Es la
respuesta directa al hallazgo 8, y **no es una regla nueva: es la Decisión Local-0060
aplicada**, que ya fija que escribir los registros se queda en el hilo principal. Las dos
corridas anteriores la incumplían, y el hallazgo 8 es el precio.

Contra la mitigación que la segunda corrida había anotado —agrupar mirando la distancia
entre códigos antes de lanzar—, ésta **no necesita mirar nada**: elimina la clase entera
de choque en vez de esquivarla. El costo es que el estado de cada plan queda viejo adentro
de la copia hasta la integración; con un solo escritor eso no rompe nada, porque nadie lee
ese estado para decidir. **Verificado en esta corrida:** con el encabezado del plan en
`Análisis` y su fila todavía en `Nuevo`, `lint-planes` da verde — no compara los dos, así
que el desfase transitorio no dispara ningún control ni obliga a inventar uno.

**b. Las preguntas se trasladan de a una, en vivo.** No frenan la corrida, pero tampoco
esperan al final: el hilo principal las lleva al usuario mientras los otros agentes siguen
trabajando. Qué regla queda —en vivo o estrictamente al final— es la decisión abierta 2 de
más abajo.

**c. Uno de los tres agentes escribe dos planes.** Los dos planes nuevos llevan códigos
consecutivos y habrían chocado entre sí si los escribían dos agentes distintos. Es el
corrimiento del criterio de agrupar: **la unidad que se paraleliza no es «un plan por
agente», es «un conjunto de archivos que no se pisan por agente»**.

### Lo que esta corrida midió

**11. La copia arranca vieja, y esta vez el número es grande.** El worktree de este
análisis se armó sobre `1e5311d`, **doce commits detrás de `main`** (`80057c2`). Entre
ellos, los cuatro merges de integración de la segunda corrida. El daño concreto: **el
propio archivo de este plan medía 152 líneas menos adentro de la copia** —le faltaba la
segunda corrida entera y sus hallazgos 8, 9 y 10—. Un agente al que se le pide «analizá
este plan» y escribe sobre lo que ve borra esas 152 líneas, o le deja al merge un
conflicto del tamaño del archivo.

Esto es el fenómeno que el hallazgo 7 describió y cuya explicación el diagnóstico del
08/09 refutó: **el envejecimiento existe y ahora está medido**; lo que no era cierto es
que hubiera sido la causa de aquel término reintroducido. La diferencia con el hallazgo 7
es que allá el riesgo era que un control validara contra un registro viejo, y acá es más
simple y más grave: **el agente produce sobre un documento que ya no es el vigente**.

El remedio que esta corrida usó, y que corresponde volver regla: **antes de escribir un
archivo, comparar la versión de la copia contra la de `main`** —alcanza `git show
main:<ruta>`, que el worktree resuelve porque comparte la base de objetos— y trabajar
sobre la de `main`. Para un archivo no hace falta traer `main` entero a la copia; para
integrar, sí.

**12. El aislamiento nativo sí trae `settings.local.json`.** Medido en esta copia: el
archivo está presente, con su fecha original, sin que el repo tenga ningún
`.worktreeinclude`; `tmp/` y `.respaldo-amp/`, también ignorados, **no** están. O sea que
la plataforma copia por sí sola la configuración local. **Esto tira abajo la objeción con
la que la primera corrida descartó el aislamiento nativo** —«arma un `git worktree add`
pelado, sin `settings.local.json`, y el agente de adentro arranca sin plugins y sin
señal»— y la tira para cualquier Agente Desplegado, no solo para éste: la segunda corrida
la había salvado con que `enabledPlugins` está duplicado en `settings.json`, que es una
particularidad de este repo. Con esto, la salvedad sobre la Decisión Local-0035 del
principio de este plan deja de aplicar al aislamiento nativo; sigue aplicando a un `git
worktree add` armado a mano. ⚠️ Medido en esta máquina y en esta versión de Claude Code,
no verificado en otra.

**13. La plataforma sí contiene al agente, al menos en git.** Un comando de git compuesto
—un `git diff` con dos commits y una ruta, encadenado— fue **rechazado** con el mensaje de
que el agente está aislado en su worktree y que sus operaciones de git tienen que apuntar
ahí. Es contención real, y es nueva respecto del hallazgo 2. ⚠️ **No alcanza para darlo
por resuelto**: se midió git, no la escritura de archivos por ruta absoluta, que es lo que
el hallazgo 2 vio fallar. Sigue siendo la capacidad 3 del plan Local-0121
(`PermissionRequest`) la que lo cubre.

## El contrato de la habilidad, definido (11/09/2026)

**Qué recibe.** Un conjunto de planes —códigos explícitos, o un criterio como «los N
primeros que devuelva `priorizar-planes`»— y un tope de cuántos agentes lanzar a la vez.
Nada más: el prompt de cada agente no se le pasa, lo arma ella.

**Qué hace**, en orden:

1. **Precondiciones.** Que exista un commit desde el cual ramificar —no que el árbol esté
   limpio, que es la regla ya fijada más arriba—, y que el estado de cada plan lo admita.
2. **Descarta** los que no entran: `Diferido` (volver al trabajo es una decisión, no un
   avance), `Ejecutado` y `Descartado`.
3. **Agrupa** los que quedan en conjuntos de archivos que no se pisan, con el criterio de
   la sección siguiente. Un grupo, un agente, una copia.
4. **Lanza** un agente por grupo con aislamiento por worktree nativo, y le entrega dos
   cosas: el verbo que le toca según el estado de cada plan y la restricción de alcance.
   Cada agente deja su copia consistente —archivo de plan, fila de registro y lint verde—
   con los códigos que tenga a mano, que adentro de su copia son provisorios.
5. **Cobra** de cada agente: los archivos de plan escritos, sus filas de registro, sus
   decisiones abiertas y lo que haya propuesto asentar en otro subsistema.
6. **Traslada** las decisiones al usuario, de a una y con su contexto, sin frenar a los
   agentes que siguen.
7. **Integra**: junta en un árbol de integración traído al día contra `main`, **fija los
   códigos definitivos** de las filas nuevas y las escribe él en `PLANES.md`, verifica, y
   recién ahí commitea.

**Qué devuelve.** Por plan: a qué estado llegó, sus decisiones abiertas y sus propuestas
para asentar. Por la ronda: qué se integró, qué quedó afuera y por qué.

**Qué NO hace.**

- **No analiza ni ejecuta ningún plan**: despacha a `analizar-plan` y a `ejecutar-plan`.
  Es el corte que el plan Local-0070 pide para que la conducción no se coma a la familia.
- **No decide** lo que un plan dejó abierto, ni contesta por el usuario.
- **No cierra** planes: cerrar exige aprobación del usuario y asienta el aprendizaje.
- **No deja que la fila que escribió un agente llegue al repo tal cual.** El agente la
  escribe en su copia con un código provisorio; el hilo principal fija el código
  definitivo y la escribe él al integrar. Lo que ningún agente lanzado escribe es un
  Índice de Subsistema **del repo**: adentro de su copia, sí (Decisión Local-0060).
- **No asienta** decisiones, conocimiento ni términos: quedan propuestos adentro del plan.
- **No toca repos ajenos.** Allá no se controla el aislamiento, así que «un plan por agente
  a la vez» sigue valiendo y el transporte es `resolver`. Con eso queda contestada la
  cuestión abierta 3: es **una** habilidad, y el repo ajeno es un modo degradado, no un
  caso simétrico.

## Cómo agrupa

**La unidad es el conjunto de archivos que no se pisan, no el plan.** Dos planes van a
agentes distintos solo si los archivos que van a escribir son disjuntos; si comparten uno,
van al mismo agente, o uno de los dos no entra en la ronda.

**El código de un plan es provisorio adentro de la copia, y el coordinador lo fija al
integrar.** Corregido por el usuario el 11/09/2026, contra lo que la tercera corrida
había hecho y contra lo que este párrafo decía antes.

Cada agente escribe su archivo **y su fila**, con el código que tenga a mano; en su copia
ese número no significa nada, porque nadie más lo ve. Al integrar, el coordinador recorre
las filas nuevas, les asigna los códigos definitivos en orden y las escribe él en
`PLANES.md`. La clase de choque desaparece igual que si los agentes no escribieran el
registro —el coordinador es el único que lo escribe de verdad—, pero sin el costo de que
el plan quede incompleto en su copia: adentro del árbol de cada agente el lint da verde,
el estado es el correcto y el documento se sostiene solo.

En cambio, la mitigación que la segunda corrida había propuesto a partir del hallazgo 8
—agrupar mirando la distancia entre códigos— sí se cae: no hay nada que mirar antes de
lanzar, porque el conflicto ya no se evita, se resuelve al llegar y de a una fila.

**Lo que queda por mirar es el alcance no registral**, y hoy se mira a ojo: mientras un
plan escriba solamente su propio archivo, los grupos son disjuntos por construcción y
alcanza con un plan por agente. El criterio deja de alcanzar en el momento en que un plan
escriba código o Componentes de Subsistema, y ahí hace falta el alcance declarado y
comparable de la cuestión abierta 1. **Ninguna de las tres corridas probó ese caso**: las
tres usaron planes cuyos archivos eran disjuntos de entrada.

## La restricción de alcance que recibe cada agente

Hoy se escribe a mano en el prompt de quien lanza, así que no vive en ningún lado y se
reescribe cada vez. Las tres salidas posibles:

- **La genera la habilidad al vuelo** — se reescribe en cada versión y diverge del texto
  que usó la corrida anterior, sin que nada compare.
- **La toma de un lugar fijo** — el texto vive una sola vez, al lado de la habilidad, en su
  `PLANTILLA.md`, que es el mecanismo que el repo ya tiene para los textos literales de una
  skill. La habilidad lo pega en el prompt de cada agente que lanza.
- **Depende de la capacidad 2 del plan Local-0121** (`SubagentStart`, que inyecta contexto
  al subagente antes de su primer turno).

**Se toma la segunda, y la tercera queda como cambio aditivo.** Motivos: la capacidad 2 es
documentación leída y no comportamiento medido —lo declara el propio plan Local-0121, y el
conocimiento Local-0017 ya midió tres frenos de permisos que fallaron en verde—, así que
atar `avanzar-planes` a ella la vuelve inconstruible hasta que se mida; y `SubagentStart`
es un hook de Claude Code, así que entregar el alcance solo por ahí rompe la paridad con
Codex CLI que declara `AGENTS.md`. Con el texto en un lugar fijo, adoptar la capacidad 2
después cambia **el transporte y no el texto**: es aditivo, que es lo que pide la
Preferencia Local-0006.

⚠️ **Un texto no contiene a nadie.** El hallazgo 2 midió que un agente con la restricción
escrita en el prompt escribió igual en el repo principal, que es la forma «la recita sin
obedecer» del conocimiento Local-0001. Decir el alcance y **hacerlo cumplir** son dos
cosas distintas: lo segundo es la capacidad 3 del plan Local-0121, y mientras no exista,
**el hilo principal verifica después** — antes de integrar, mira que el repo principal no
tenga cambios sin commitear que no haya puesto él.

## La integración

**Dónde se junta.** En un árbol de integración propio, nunca en el repo principal; las dos
corridas anteriores ya lo hicieron así y funcionó. **Traído al día contra `main` antes de
juntar nada**: el hallazgo 11 midió doce commits de atraso en una sola corrida, y lo que
envejece incluye los registros contra los que los controles validan.

**Qué escribe el hilo principal, y solo él.** Las filas de `PLANES.md` de todos los planes
de la ronda, en orden, a partir del texto que cada agente reportó. Y los Códigos: como
nadie más escribe registros, **asignarlos es serial por construcción y la reserva de
códigos antes de lanzar deja de hacer falta**.

**Cómo se verifica.** El control de cierre sobre el árbol integrado sigue siendo lo
correcto —dos mitades válidas pueden dar un conjunto malo, y ningún lint por rama lo ve—,
pero **hoy no se puede correr por ronda**: el hallazgo 9 midió que tarda más de diez
minutos y que su conteo está multiplicado por nueve. Mientras eso no se arregle, la
verificación por ronda es: los lints de subsistema, que son rápidos; el banco de
`detectar-terminologia-vetada`; y `lint-harness` si la ronda tocó algo que viaja. El
control completo queda para quien cierre a mano. Arreglar el conteo es plan propio y **no
bloquea** a `avanzar-planes`: lo que bloquearía es creerle al número.

**Cuándo se commitea.** Cada agente commitea en su propia rama, adentro de su copia
—medido en las tres corridas—. El hilo principal mergea rama por rama, escribe las filas en
un commit propio, verifica y recién ahí lleva el árbol a `main`. Nunca durante la ronda.

**Qué pasa si un agente falla.** Su rama no se mergea y la ronda no se frena. Tres formas,
y las tres están medidas:

- **No produjo nada** —el plan Local-0107 en la primera corrida—: el plan queda como
  estaba, no hay nada que integrar, y se informa.
- **Produjo y no pudo escribir** —el plan Local-0110 en la primera corrida—: el contenido
  se recupera de la salida de la corrida. Con subagentes nativos este modo **no volvió a
  aparecer** (cero denegaciones en la segunda y en la tercera), así que deja de ser un caso
  a diseñar y pasa a ser nota histórica.
- **Produjo algo mal**: para eso está la verificación sobre el árbol integrado.

⚠️ **Antes de limpiar las copias, pararse afuera de ellas** —el `EPERM` de la segunda
corrida—, y contar con la falsa alarma del hallazgo 10 mientras no se arregle.

## Las seis cuestiones abiertas, al 11/09/2026

1. **Cómo se declara el alcance de un plan para que una máquina lo compare** — **sigue
   abierta**, y ahora se sabe cuándo hace falta: recién cuando un plan escriba algo más que
   su propio archivo. No bloquea la primera versión.
2. **Dónde vive `avanzar-planes`** — decisión abierta 3.
3. **Si es una habilidad o dos, para planes propios y ajenos** — **resuelta**: una sola,
   con el repo ajeno como modo degradado.
4. **El límite del transporte** (`--sesion` resuelto solo para `claude`) — **sigue abierta,
   y con consecuencia nueva**: es lo que impide que un agente ya lanzado reciba la
   respuesta del usuario en vuelo, y por eso la cola solo puede desbloquear planes en la
   ronda siguiente. Ver decisión abierta 2.
5. **Que una habilidad llame a otras del mismo subsistema** — **confirmado por uso**:
   `analizar-plan` reutiliza `amp:planificar`, y esta corrida volvió a hacerlo. Lo que no
   tiene precedente es el **despacho condicional por estado**, y eso corresponde asentarlo
   como decisión.
6. **Cuántos planes a la vez** — **respondida en lo que importa, y no con un número**: el
   riesgo no crecía con la cantidad sino con el choque en los registros (hallazgo 8), y con
   el hilo principal como único escritor esa clase desaparece. El tope real es cuántos
   grupos disjuntos hay. Medido: tres por CLI (escribió uno), cuatro nativos (escribieron
   cuatro, un conflicto), tres nativos con el registro en el hilo principal. Un tope por
   omisión de cuatro es razonable y revisable; **no hay ninguna medición de rendimiento por
   encima de cuatro**.

## Qué está medido y qué está inferido

**Medido** (tres corridas, del 04/09 al 11/09/2026):

- Costo y duración por CLI: tres sesiones, US$ 7,57, escribió una sola, 0/3/5 denegaciones
  de permiso.
- Con subagentes nativos: cuatro de cuatro escribieron, cero denegaciones, entre 5 m 43 s y
  12 m 33 s cada uno, dos llegaron a `Listo` y dos a `Análisis`, tres decisiones abiertas en
  total.
- El conflicto de `PLANES.md` por filas adyacentes, y que dos filas lejanas se auto-mergean.
- El hallazgo 6 y su arreglo: 27 de 27 y 55 de 55, adentro y afuera de la copia.
- El conteo del control de cierre multiplicado por nueve, idéntico en la copia y en el repo
  principal.
- La falsa alarma de `limpiar-worktree` (502 archivos) y su causa exacta.
- Doce commits de atraso de una copia, y 152 líneas de diferencia en el archivo a escribir.
- Que el aislamiento nativo trae `settings.local.json` sin `.worktreeinclude`.
- Que la plataforma rechaza un comando de git que no puede verificar que se quede adentro
  de la copia.

**Inferido, o directamente no probado:**

- Que el rendimiento siga subiendo por encima de cuatro agentes. **Nadie lo midió.**
- Que el hilo principal como único escritor escale: se probó con tres grupos, y con planes
  cuyo único archivo compartido era el registro.
- **Que dos planes que tocan el mismo archivo que no es un registro se comporten igual.**
  Las tres corridas usaron planes de archivos disjuntos de entrada, así que el caso difícil
  del arreglo 2 —dos mitades válidas que juntas están mal— **todavía no ocurrió ni una vez**.
- Que las capacidades 2 y 3 del plan Local-0121 hagan lo que su documentación dice.
- Que el árbol integrado esté bien: el único control que lo diría está roto (hallazgo 9).
- Que el alcance escrito en el prompt se obedezca. Lo único medido al respecto dice que
  **no** (hallazgo 2); la segunda y la tercera corrida no lo pusieron a prueba.
- Que retomar un hilo con `--sesion` funcione fuera de `claude`.

## Estado de los diez hallazgos

| # | Hallazgo | Al 11/09/2026 |
|---|---|---|
| 1 | `--allowedTools` no habilita la escritura en `dontAsk` | **Muerto para el diseño.** Es del lanzamiento por CLI; con subagentes nativos hubo cero denegaciones en dos corridas. Sigue vivo como conocimiento —cuarta forma del Local-0017—, no como precondición de la habilidad. |
| 2 | El worktree no contiene al agente de adentro | **Vivo, más chico.** Esta corrida midió que git sí está contenido; la escritura por ruta absoluta no se probó. Lo cubre la capacidad 3 del plan Local-0121. |
| 3 | El clasificador bloquea `bypassPermissions`, y no siempre | **Muerto.** Misma causa que el 1: no hay modo de permisos que elegir al lanzar un subagente nativo. |
| 4 | El objetivo principal quedó sin responder | **Muerto.** Lo respondieron el hallazgo 8 y esta corrida. |
| 5 | Las dos transiciones se juntan solas, sin conflicto | **Muerto dos veces.** Corregido por el hallazgo 8, y ahora sin objeto: con el hilo principal como único escritor no hay transiciones simultáneas que juntar. Su lección —auto-mergear no es estar bien— sobrevive adentro del 8. |
| 6 | Los controles dan rojo adentro de un worktree | **Resuelto** el 08/09/2026, verificado en los dos sentidos y sincronizado a `base/`. |
| 7 | El agente reintrodujo un término vetado; la copia envejece | **Partido.** La explicación está refutada —el control ni llegó a mirar el registro—. El envejecimiento sí existe, y esta corrida lo midió mucho más grande: es el hallazgo 11. |
| 8 | Con cuatro planes `PLANES.md` da conflicto por filas adyacentes | **Resuelto por diseño**: el código que escribe el agente en su copia es provisorio y el coordinador fija el definitivo al integrar. **Se cae la mitigación que proponía** —agrupar mirando la distancia entre códigos—: el conflicto ya no se esquiva antes de lanzar, se resuelve al llegar y de a una fila. |
| 9 | El conteo del control de cierre está multiplicado por nueve | **Vivo, y su diagnóstico refutado.** No hay cascada del banco: el descubrimiento baja adentro de cada copia y cuenta los mismos bancos una vez por copia (medido: 164 donde hay 26, con tres copias vivas). Es el plan Local-0123. |
| 10 | `limpiar-worktree` grita un daño que no existe | **Vivo.** `NO_SE_COPIA` no conoce `.claude/worktrees/`, que es justo donde caen las copias de los subagentes nativos. Es el plan Local-0122. Reproducido tres veces más en la tercera corrida, con el repo intacto las tres. |

## Sobreingeniería a sacar

- **La reserva de códigos antes de lanzar (arreglo 1), y su Herramienta.** Existía porque
  dos copias que crean una entrada eligen el mismo `máximo + 1`. Con el hilo principal como
  único escritor de registros, **ningún agente elige un código nunca**: los asigna quien
  escribe la fila, que es uno solo y va en orden. Y el código no vive en ningún otro lado
  —el archivo de un plan no lo lleva en el encabezado—, así que tampoco hay nada que
  pasarle al agente.
- **El dedupe de preguntas equivalentes en la cola.** Medido: siete decisiones abiertas de
  un solo plan en la primera corrida, tres de cuatro planes en la segunda. **Ninguna corrida
  produjo dos preguntas equivalentes.** Construir el dedupe es resolver un problema que
  todavía no se vio; leer menos de diez entradas antes de trasladarlas no necesita mecanismo.
- **El frontmatter estructurado de la cola.** Se justificaba con que sin datos no se puede
  ordenar, filtrar ni deduplicar. Con menos de diez entradas vaciadas dentro de la misma
  ronda no hay nada que ordenar ni filtrar.
- **La cola como archivo persistido aparte.** Las tres corridas la resolvieron con una
  sección `## Decisiones abiertas` **adentro de cada plan**, y ahí la entrada ya es
  respondible en frío por construcción: está al lado de su contexto, el plan ya está
  indexado y su estado ya lo dice. Lo que esa forma no da es **ver de un vistazo qué
  decisiones esperan sin abrir cincuenta planes**, y eso es un conteo, que la Pantalla de
  bienvenida o `priorizar-planes` pueden dar. **Recomendación:** primera versión sin cola
  persistida; se agrega si una ronda termina con decisiones sin contestar que sobrevivan a
  la ronda. Es aditivo.
- **`ejecutar-plan` como precondición dura.** Ver decisión abierta 1.

### Alcance del trabajo, actualizado

Reemplaza la lista de «Alcance del trabajo» de más arriba:

- La conducción `avanzar-planes` y su despacho por estado.
- El agrupamiento por conjuntos de archivos que no se pisan.
- La restricción de alcance, en el `PLANTILLA.md` de la habilidad.
- La integración: árbol al día, filas escritas por el hilo principal, verificación, commit.
- Bancos de prueba con escenario sintético (Decisión Local-0075).
- Si viaja: `sincronizar-base` y subir la versión del plugin.

**Sale:** la reserva de códigos y su Herramienta; el dedupe y el frontmatter de la cola; la
cola como archivo persistido; el control de cierre completo por ronda. **Queda afuera de
la primera versión y entra después como una fila más en la tabla de despacho:**
`ejecutar-plan` (decisión abierta 1). **Sigue afuera y sin fecha:** el alcance declarado y
comparable (cuestión abierta 1), que no hace falta mientras un plan escriba solo su archivo.

## Decisiones abiertas

### 1. ¿La primera versión despacha también `Listo` a `ejecutar-plan`, o solo el tramo de análisis?

**Contexto.** Este plan declara al plan Local-0043 (`ejecutar-plan`) como precondición,
porque la tabla de despacho manda los planes `Listo` ahí. Pero el censo que abre este plan
dice que de los 78 planes vivos de la máquina había **1 `Listo` y 65 `Nuevo`**, y que el
embudo está en `Nuevo → Análisis → Listo`. Las tres corridas ejercitaron **solo** el tramo
de análisis: nunca se despachó un plan a ejecución, porque el verbo no existe.

- **Si entra `ejecutar-plan`:** la habilidad no se puede construir hasta que el plan
  Local-0043 esté hecho, y ese plan está en `Nuevo` y con dos huecos propios declarados
  —qué hace con el aprendizaje al cerrar, y cómo se comporta adentro de una copia—. El
  trabajo se encadena y `avanzar-planes` no existe en el corto plazo.
- **Si no entra:** la primera versión despacha `Nuevo` y `Análisis` a `analizar-plan`, y a
  un plan `Listo` lo deja afuera diciendo por qué. Cubre 65 de los 78 planes vivos medidos
  con cero dependencias nuevas. Cuando `ejecutar-plan` exista, **se agrega una fila a la
  tabla de despacho**.

**Recomendación: no entra en la primera versión.** El costo de esperar es real y medible; el
costo de no esperar es una fila de tabla. Si no fuera aditivo —si meter `ejecutar-plan`
después obligara a rehacer el despacho— la recomendación se daría vuelta, pero el despacho
es una tabla estado → verbo, y agregarle una fila no toca las otras.

### 2. ¿La cola se vacía en vivo o estrictamente al final de la ronda?

**Contexto.** Lo que la habilidad promete es que **ningún plan espere al usuario**; no
promete que al usuario no lo interrumpan. Y hay un límite duro: un agente ya lanzado **no
puede recibir la respuesta en vuelo** —retomar un hilo con `--sesion` está resuelto solo
para `claude`, que es la cuestión abierta 4—, así que contestar en vivo **no desbloquea al
agente que preguntó**: desbloquea a la ronda siguiente.

- **Estrictamente al final:** el usuario recibe todo junto, una sola interrupción. Con los
  números medidos en la segunda corrida, donde las cuatro copias terminaron entre los 5 y
  los 12 minutos, habría contestado tres decisiones de una sentada a los 13 minutos. Costo:
  una decisión que llegó a los 2 minutos se enfría once minutos antes de que alguien la lea,
  y para entonces el hilo principal también perdió el hilo de por qué se preguntó.
- **En vivo:** esa decisión se contesta a los 2 minutos, con el contexto todavía caliente en
  el hilo principal. Costo: al usuario lo interrumpen tres veces en vez de una, que es
  exactamente el recurso escaso que este plan dice estar cuidando.

**Recomendación: en vivo, y dicho explícitamente en el contrato**, con la aclaración de que
la respuesta entra en la ronda siguiente y no en el agente que preguntó. Motivo: la entrada
tiene que ser respondible en frío igual (Decisión Local-0073), así que enfriarla no la
rompe; pero **el hilo principal sí se enfría**, y es el que tiene que traducir la respuesta
a la ronda siguiente. Es una preferencia sobre la atención del usuario y no se deriva de
nada: por eso queda abierta.

### 3. ¿Dónde vive la habilidad, y cómo se llama su plugin?

**Contexto.** La Decisión Local-0078 fija que lo que coordina a otros agentes no le sirve a
todo Agente Desplegado y viaja en plugin aparte, habilitado por repo. El subsistema `planes`
es el dueño natural del verbo, y el plan Local-0070 pide que una habilidad sea un verbo y no
se coma a la familia. El nombre `avanzar-planes` está ratificado por Javier el 26/08/2026,
sobre `paralelizar-planes`; el nombre del **plugin** no.

- **Todo en `amp-planes`:** un Agente Desplegado que instala el subsistema de planes se
  lleva de arriba una habilidad que lanza agentes en copias —maquinaria pesada que no va a
  usar—. Contradice la Decisión Local-0078.
- **Todo en un plugin propio que dependa de `amp-planes`:** el verbo y la conducción van
  juntos, que es lo que son —la conducción sin el verbo no existe—, y solo lo instala quien
  lo quiera.
- **El verbo en `amp-planes` y la conducción en un plugin propio:** parte en dos algo que
  nadie usa por separado y deja dos lugares que editar.

**Recomendación: un plugin propio que dependa de `amp-planes`.** El nombre del plugin queda
para ratificar: proponerlo pasa por `converger-terminologia`, y este análisis no acuña
ninguno (Preferencia Base-0010).

## Propuestas para asentar

Nada de esto se asentó: este análisis corrió con la restricción de escribir solo este
archivo.

**Candidatas a decisión:**

1. **Un agente al que se le delega producir escribe su producto, nunca un Índice de
   Subsistema.** La Decisión Local-0060 ya fija que escribir los registros se queda en el
   hilo principal, pero lo fija para **subagentes de recorrido, de solo lectura por
   construcción**. Acá se delega producir, con herramientas de escritura, y el corte sigue
   valiendo por el mismo motivo y por uno nuevo y medido: dos agentes que escriben filas
   adyacentes del mismo registro chocan o, peor, se auto-mergean mal (hallazgo 8). Es una
   extensión de Local-0060, no una re-decisión, y corresponde decisión propia porque cambia
   qué se puede delegar.
2. **Una habilidad puede despachar a otras del mismo subsistema según el estado de la
   entrada.** Es la cuestión abierta 5: hay precedentes de reutilización
   (`sugerir-siguiente-plan` reutiliza `priorizar-planes`, `analizar-plan` reutiliza
   `amp:planificar`) pero ninguno de despacho condicional. Sin asentarlo, la próxima
   habilidad que lo necesite lo vuelve a discutir.

**Candidatas a página de conocimiento:**

3. **Una copia arranca vieja y no lo dice.** Medido en esta corrida: doce commits de atraso,
   y el archivo que había que escribir medía 152 líneas menos adentro de la copia que en
   `main`. No falla: el agente lee, entiende y produce sobre un documento que ya no es el
   vigente, y el daño aparece recién al juntar —o no aparece, si el merge sale limpio—. La
   página lleva el remedio barato (`git show main:<ruta>` antes de escribir, que el worktree
   resuelve porque comparte la base de objetos). Es la forma «mira una copia» del
   conocimiento Local-0013, aplicada al documento en vez de al control.
4. **El aislamiento nativo por worktree copia la configuración local sin
   `.worktreeinclude`.** Medido acá: `settings.local.json` presente con su fecha original,
   `tmp/` y `.respaldo-amp/` ausentes. Tira abajo la objeción con la que se descartó el
   aislamiento nativo, y toca la Herramienta Base-0009 (`preparar-worktree`), que existe en
   buena parte para eso. ⚠️ Una máquina, una versión: caduca.

**Ya tienen destino y no hace falta abrirles nada acá:** el conteo multiplicado por nueve
del control de cierre (hallazgo 9) y la falsa alarma de `limpiar-worktree` (hallazgo 10), los
dos ya declarados candidatos a plan propio en la segunda corrida.

## Por qué queda en `Análisis` y no en `Listo`

`Listo` es «analizado y suficientemente definido para iniciar su ejecución». Quedan tres
decisiones abiertas, y la primera **cambia el tamaño del trabajo**: si `ejecutar-plan` entra,
la ejecución de este plan arranca por el plan Local-0043, que está en `Nuevo`. Lo demás
—contrato, agrupamiento, alcance, integración— quedó definido acá. Contestadas las tres, el
plan pasa a `Listo` sin más análisis.
