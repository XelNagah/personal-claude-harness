# Avisar al terminar la sesión que hay algo para asentar

**Estado: Nuevo · Creado 26-08-20.** Sale del análisis del repo ajeno
[everything-claude-code](https://github.com/worldflowai/everything-claude-code) (WorldFlowAI, 1.4k
estrellas al 20/08/2026), pedido por Javier para tomar ideas. De las cuatro que salieron, es la única
que cierra un hueco que este repo ya tenía asentado por escrito.

## Qué se pide

Un **momento nuevo del subsistema conducta — al terminar la sesión — que inyecte un aviso** para que
el agente evalúe si la sesión produjo algo que corresponde asentar, y lo asiente con las habilidades
que ya existen.

El aviso **no extrae ni escribe nada**. Avisa; el agente evalúa y, si hay material, invoca
`registrar-conocimiento`, `registrar-preferencia`, `registrar-decision` o la que corresponda, con la
ratificación del usuario donde aplique.

## Por qué

El conocimiento [Replicar los componentes de Hermes en el Agente Multipropósito](../../conocimiento/replicar-hermes-en-el-amp.md)
deja asentado que el bucle de auto-mejora —observar, destilar, reusar— es el componente sin
equivalente en este repo: hoy asentar es manual y depende de que el usuario lo pida o de que el
agente se acuerde. Lo que se explicó en la conversación y no se asentó se vuelve a averiguar en la
sesión siguiente.

El destino ya está construido: ocho subsistemas con su habilidad de alta. **Lo que falta es el
disparador**, y este plan es solo eso.

## Lo que trae el repo ajeno

Su habilidad `continuous-learning` es un hook en el momento `Stop`. Lo que hace, entero:

1. Lee el archivo de transcripción de la sesión por la variable de entorno que le pasa el CLI.
2. Cuenta las apariciones de `"type":"user"` — los mensajes del usuario.
3. Si son menos de diez (umbral configurable), sale sin decir nada.
4. Si los supera, emite dos líneas: *«la sesión tiene N mensajes, evaluá si hay patrones para
   extraer»* y adónde guardarlos.

Su argumento para elegir ese momento y no cada turno: `Stop` corre una vez, no agrega latencia por
mensaje, y tiene la transcripción completa. Es el mismo criterio de latencia que este repo ya midió.

Tienen además un comando `/learn` para hacer lo mismo a mitad de sesión, a pedido.

**Qué copiar y qué no:**

- **El momento sí.** Al terminar la sesión, una sola vez, con la transcripción completa disponible.
- **La forma sí:** avisar, no extraer. El agente decide; el aviso solo abre la puerta.
- **Su medida no.** Contar cuántas veces habló el usuario mide volumen de conversación, no si hubo
  algo que aprender: veinte preguntas triviales le disparan igual que una sesión con tres hallazgos.
  Este repo ya tiene medido cómo leer una transcripción `.jsonl` con detalle
  ([Medir el ahorro de contexto de un subagente de subsistema](../../conocimiento/medir-subagentes-de-subsistema.md)).

## El riesgo, que ya está catalogado

El conocimiento [Modos de falla ante reglas escritas](../../conocimiento/modos-de-falla-ante-reglas-escritas.md)
abre con el modo que más aplica acá: **el agente recita la regla sin obedecerla**. Un aviso que
aparece al final de todas las sesiones es exactamente el material del que está hecho ese modo de
falla: se vuelve parte del paisaje y se contesta con una frase.

De ahí que el umbral —cuándo el aviso **no** se emite— sea la decisión de diseño central del plan,
no un detalle de implementación. Un aviso raro que se obedece vale más que uno constante que se
recita.

## Preguntas abiertas

- **Qué mide el umbral.** El repo ajeno cuenta mensajes del usuario. Alternativas a evaluar: que la
  sesión haya escrito archivos, que haya corregido al agente, que haya durado más de cierto trabajo
  real. Ninguna está medida todavía en este repo.
- **Qué momento exacto del CLI.** `Stop` corre cada vez que el agente termina de responder, no cuando
  se cierra la terminal; `SessionEnd` es el que cierra. El repo ya tiene asentada la mecánica de los
  nueve eventos ([Hooks de Claude Code](../../conocimiento/hooks-claude-code.md)) — hay que releerla
  antes de elegir, porque el nombre engaña.
- **Si hay paridad en Codex CLI.** El repo sostiene paridad de comportamiento entre los dos agentes;
  la cobertura de hooks de Codex está asentada y es menor
  ([Hooks de Codex CLI](../../conocimiento/hooks-codex-cli.md)). Si el momento no existe allá, el
  plan tiene que declarar en qué degrada, como ya se hizo con el control de terminología.
- **Si el aviso alcanza también a las preferencias.** Una corrección repetida del usuario es material
  de preferencia, no de conocimiento, y detectarla exige mirar la conversación, no los archivos
  tocados.
- **Si el que evalúa es un subagente.** Leer una transcripción entera en el hilo principal paga todo
  lo que leyó. El corte ya decidido —el subagente trae evidencia y nunca juzga— encaja: podría traer
  los candidatos y el hilo principal decidir. Queda por ver si al terminar la sesión hay lugar para
  delegar.

## Se cruza con

- **Plan Local-0039, *Verificar que el aprendizaje quede asentado en los subsistemas*** (`Nuevo`).
  Misma intención, **otro disparo**: aquel cubre el pedido a demanda y el cierre de un plan, y su
  motor es una habilidad que todavía no existe. Este cubre el final de sesión, que es justamente el
  caso donde no hubo plan. **Al analizar, decidir si son dos planes o uno**: son candidatos a
  fusionarse, y dejarlos sueltos es la forma exacta en que un plan y su pariente terminan resueltos
  al revés uno del otro
  ([El plan que reparte su trabajo en otros planes](../../conocimiento/el-plan-que-reparte-su-trabajo.md)).
- **Subsistema conducta.** El momento nuevo y su regla se dan de alta con `registrar-regla`; el
  repartidor ya combina clases en un mismo momento.

## Las otras tres ideas del mismo relevamiento

No entran en este plan. Se anotan acá para no volver a leer el repo ajeno:

1. **Sugerir el corte antes de que el contexto se llene.** La regla de handoff nombra ese disparador
   —«cortar porque el contexto se llenó»— y no tiene mecanismo: hoy el agente propone dejar la sesión
   limpia cuando la tarea terminó, que es el caso fácil. La implementación ajena no sirve (cuenta
   llamadas a herramientas en un archivo temporal: mide volumen, no fase), pero el hueco es real.
2. **Modos de trabajo que cambian la conducta.** Tres archivos de contexto —desarrollo, revisión,
   investigación— que se inyectan según la fase. El subsistema conducta ata reglas a eventos, no a
   una fase elegida a mano. Idea genuina, sin evidencia todavía de que haga falta.
3. **Medir varias corridas en vez de una.** Su marco de evaluación reporta «acertó al menos una vez
   en k intentos». La Herramienta que prueba si las habilidades se disparan solas corre **una sesión
   por consulta**: una habilidad que dispara seis de cada diez veces da verde o rojo según el día, y
   en ninguno de los dos casos se ve que es inestable. Es el mismo banco con el contador cambiado.

Lo que **no** conviene traer de ese repo, ya descartado: sus nueve subagentes y sus habilidades de
patrones (dominio código, contra el propósito general), sus archivos de reglas sueltos (siempre en
contexto, sin origen ni control), su comando de orquestación (encadena agentes que deciden y se pasan
traspasos, contra el corte ya decidido de que el subagente trae evidencia y no juzga) y su
persistencia entre sesiones (crea un archivo por día con un molde vacío que nadie llena).
