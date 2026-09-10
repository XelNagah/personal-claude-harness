# Reemplazar por capacidades nativas de hooks lo que el Agente Multipropósito construyó a mano

**Estado: Nuevo · Creado 26-09-10.**

Claude Code amplió los hooks muy por encima de lo que este repo tiene asentado, y varias
de las capacidades nuevas hacen de forma nativa cosas que el Agente Multipropósito
construyó a mano, o cubren agujeros que hoy no cubre nadie. Este plan releva cuáles
convienen, cuáles no, y qué se retira cuando entran.

## De dónde sale, y qué está verificado

Relevado el 10/09/2026 de la referencia oficial de hooks y de la de worktrees, contra la
versión **2.1.267** instalada en esta máquina. La documentación fecha varios de estos
cambios en versiones anteriores a la instalada (v2.1.200, v2.1.216, v2.1.239), así que
por número de versión están disponibles acá.

⚠️ **Todo lo de abajo es documentación leída, no comportamiento medido en este repo.**
Ninguna de las siete capacidades se probó todavía. El conocimiento Local-0004 (hooks de
Codex CLI) ya dejó asentado que una capacidad documentada puede no hacer lo que dice, y
el conocimiento Local-0017 midió tres frenos de permisos que fallaron en verde. La
primera etapa de este plan es medir, no adoptar.

**La página de conocimiento Local-0003 quedó vieja.** Dice «los 9 eventos del núcleo»;
hoy la referencia lista alrededor de treinta y cinco, entre ellos todos los que menciona
este plan. Actualizarla es parte del alcance.

## Las siete capacidades, y qué resuelve cada una

### 1. `.worktreeinclude` — los archivos que git ignora llegan solos a la copia

Un archivo en la raíz del proyecto, con sintaxis de `.gitignore`, que declara qué
archivos **ignorados** se copian a cada worktree nuevo. Se aplica a `claude --worktree`,
a los subagentes con aislamiento por worktree y a las sesiones en segundo plano.

**Qué resuelve.** Es exactamente la objeción con la que la medición del plan Local-0119
descartó el aislamiento nativo: «arma un `git worktree add` pelado, sin
`settings.local.json`, y el agente de adentro arranca sin plugins y sin señal». Con esto
la objeción cae, y con ella buena parte de lo que hace la Herramienta Base-0009
(`preparar-worktree`), que existe para traer a mano lo que git ignora.

⚠️ **No se aplica si se configura un hook `WorktreeCreate` propio**, que reemplaza el
comportamiento por omisión entero. Las capacidades 1 y 7 son alternativas, no
complementos.

### 2. `SubagentStart` — inyectarle contexto al subagente antes de su primer turno

Devuelve `additionalContext` y entra al contexto del subagente antes de su primer
prompt. Filtra por tipo de agente, con el identificador con prefijo del plugin para los
subagentes que viajan en uno (`amp-planes:relevador-de-planes`).

**Qué resuelve.** Hoy la restricción de alcance de cada subagente se escribe a mano en el
prompt de quien lo lanza, así que no está en ningún lado y se reescribe cada vez. Toca la
Decisión Local-0060, que fija que los subagentes viajan con su plugin: si el alcance se
entrega por hook, viaja con el subsistema y no con quien lo invoca.

### 3. `PermissionRequest` — acotar por dónde puede escribir un agente

Permite denegar con motivo, y permitir con `updatedPermissions`, que incluye
`addDirectories` y reglas de permiso con destino en memoria o en un archivo de
configuración.

**Qué resuelve.** El hallazgo 2 de la medición del plan Local-0119, hoy sin cubrir: *el
worktree no contiene al agente de adentro* — uno escribió su primera edición en el repo
principal, no en su copia. El aislamiento es de árbol, no de alcance de escritura, y esto
es el alcance de escritura.

### 4. `PermissionDenied` — las denegaciones dejan de ser invisibles

Evento propio cuando se deniega un permiso.

**Qué resuelve.** La trampa más cara de la medición del plan Local-0119: dos corridas
perdieron 463 s y US$ 3,13 con **todo** `Write` y `Edit` denegado, y la respuesta pelada
se leía como un análisis entregado. La contramedida asentada fue lanzar siempre con
`--output-format json` y revisar las denegaciones después. Con este evento el aviso llega
en el momento, no al revisar la salida.

### 5. Hooks en segundo plano — el mecanismo ya viene hecho

Un hook de comando marcado para correr en segundo plano no frena el turno, y su salida se
entrega en el turno siguiente.

**Qué resuelve.** Es el mecanismo del Buzón de Avisos Generales (Decisión Local-0051),
que este repo construyó a mano: un proceso lanzado desprendido de su padre, un archivo
por origen en `.claude/tmp/avisos/`, y el repartidor que lo entrega y lo borra en el
momento `cada turno`. ⚠️ **No es reemplazo automático**: el buzón propio entrega una vez
por sesión y sobrevive al cierre del proceso, dos propiedades que hay que verificar en el
mecanismo nativo antes de retirar nada. Esta capacidad es la que más chance tiene de
resolverse en «se queda como está».

### 6. Hooks por prompt y por agente — un Control que juzga significado

Además de los hooks de comando, hay hooks de tipo `prompt` (una llamada a un modelo,
Haiku por omisión, que devuelve la decisión) y de tipo `agent` (un subagente con
herramientas de lectura, hasta 50 turnos, que devuelve si pasa o no). Los dos corren en
los eventos de herramienta y de permiso, no en todos.

**Qué resuelve.** Es la capa que falta de la Decisión Local-0003 (integridad en dos
capas): la mecánica está en los lints y la semántica quedó «hoy informal, pendiente de
formalizar» — y sigue así, con el plan Local-0006 Diferido desde el 18/07/2026. También
toca el subsistema `conducta`: hoy la clase `Controlar` es «un programa que decide», y
esto le agrega una forma de decidir que entiende el texto. El control
`detectar-terminologia-vetada` es el caso obvio: hoy marca por término y el juicio del
significado queda para el agente, que es justo lo que un hook por prompt podría hacer.

⚠️ Los hooks por agente están declarados **experimentales** en la propia documentación, y
un hook que llama a un modelo cuesta plata y tiempo en cada disparo. El conocimiento
Local-0005 fijó un presupuesto de menos de 100 ms por evento bloqueante; una llamada a un
modelo no entra ahí ni cerca.

### 7. `WorktreeCreate` y `WorktreeRemove` — enganches del ciclo de vida de las copias

Se disparan al crear y al borrar una copia, incluidas las de los subagentes con
aislamiento por worktree. El de creación **reemplaza** el comportamiento por omisión y
debe devolver la ruta.

**Qué resuelve.** Es el punto de enganche para las dos Herramientas del ciclo de copias
(`preparar-worktree` Base-0009 y `limpiar-worktree` Base-0010), que hoy se invocan a
mano. ⚠️ El de borrado no puede frenar el borrado, así que **no** sirve para el freno que
`limpiar-worktree` tiene hoy —parar cuando el agente escribió en el `.claude/` de la
copia—, y el conocimiento Base-0007 (borrar un worktree vacía el destino del enlace que
tenga adentro) sigue valiendo entero.

## Además: una salida alternativa para el plan Local-0099

La documentación dice que **cuando varios hooks devuelven `additionalContext` para el
mismo evento, el modelo recibe todos los valores**. El plan Local-0099 describe que una
regla `Inyectar` pisaría el `additionalContext` de la Pantalla al arrancar; eso pasa
porque las dos salen del **mismo** hook repartidor, que arma un solo JSON. Declarar dos
entradas de hook en vez de una haría que la plataforma las junte sola.

No es obviamente mejor: partir el repartidor cambia el modelo del subsistema `conducta`,
y el arreglo que ese plan ya tiene analizado —fusionar adentro— es más chico. Queda
anotado para que quien lo ejecute lo compare, no como recomendación.

## Alcance del trabajo

- Medir las siete antes de adoptar ninguna, en un escenario chico y a propósito.
- Actualizar la página de conocimiento Local-0003, que dice nueve eventos.
- Por cada una que se adopte, decidir qué se retira del mecanismo propio y registrarlo.
- Lo que viaje a la Base pasa por `sincronizar-base` y sube la versión del plugin.

## Lo que hay que resolver

1. **Cuáles entran y cuáles no.** Siete capacidades no son un solo trabajo, y tres de
   ellas compiten con mecanismo propio que ya funciona y ya está probado.
2. **Qué pasa con Codex CLI.** El conocimiento Local-0004 ya asentó que sus hooks cubren
   menos y tienen tres límites; cada capacidad que se adopte acá agranda la distancia
   entre los dos agentes, contra la paridad de comportamiento que declara `AGENTS.md`.
3. **Si un Control que llama a un modelo es aceptable**, contra el presupuesto de
   latencia del conocimiento Local-0005 y contra el costo por disparo.
4. **Qué se hace con las dos Herramientas del ciclo de copias** si `.worktreeinclude`
   cubre lo que hace la de preparación.

## Planes relacionados

- [Hacer avanzar varios planes a la vez hasta la proxima decision del usuario](Hacer%20avanzar%20varios%20planes%20a%20la%20vez%20hasta%20la%20proxima%20decision%20del%20usuario.md) (Local-0119) — de su medición salen los dos agujeros que las capacidades 3 y 4 tapan.
- [El repartidor pisa el additionalContext de la Pantalla si hay una regla Inyectar al arrancar](El%20repartidor%20pisa%20el%20additionalContext%20de%20la%20Pantalla%20si%20hay%20una%20regla%20Inyectar%20al%20arrancar.md) (Local-0099) — la salida alternativa de más arriba.
- [Ejecutar las seis decisiones de capacidades de Claude Code no usadas](Ejecutar%20las%20seis%20decisiones%20de%20capacidades%20de%20Claude%20Code%20no%20usadas.md) (Local-0112) — el relevamiento anterior de capacidades, de agosto de 2026, ya ratificado y sin ejecutar del todo. Verificar solapamiento antes de arrancar.
- [Capa semantica de coherencia - contradicciones e incompatibilidades](Capa%20semantica%20de%20coherencia%20-%20contradicciones%20e%20incompatibilidades.md) (Local-0006) — Diferido; la capacidad 6 es una forma de construirlo.
