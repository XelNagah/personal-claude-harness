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
