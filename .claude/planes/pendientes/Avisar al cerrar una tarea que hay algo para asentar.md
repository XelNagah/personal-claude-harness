# Avisar al cerrar una tarea que hay algo para asentar

**Estado: Análisis · Creado 26-08-20 · Vuelve de Listo a Análisis 26-11-14.** Sale del análisis del repo ajeno
[everything-claude-code](https://github.com/worldflowai/everything-claude-code) (WorldFlowAI, 1.4k
estrellas al 20/08/2026), pedido por Javier para tomar ideas. De las cuatro que salieron, es la única
que cierra un hueco que este repo ya tenía asentado por escrito.

> **Actualizado el 22/08/2026 — el disparador ya está decidido en otro lado, y este plan no lo
> re-decide.** El plan Local-0112 (*Ejecutar las seis decisiones de capacidades de Claude Code no
> usadas*) trae del repo `como-uso-claude` tres cosas ratificadas por el usuario que este documento
> tenía como preguntas abiertas:
>
> - **El evento es `Stop`**, no `SessionEnd`.
> - **La señal es estrecha:** hubo escrituras en `.claude/` **sin que ningún Índice cambiara**. No es
>   el conteo de mensajes del usuario que este plan ya había descartado, pero tampoco es una pregunta
>   abierta: es esa condición.
> - **El tope es una vez por sesión.** Es la respuesta al riesgo que este plan levanta más abajo —el
>   aviso que se vuelve paisaje y se recita— y viene con su costo medido: en `Stop`, decir algo cuesta
>   **una vuelta completa del modelo**, no los tokens del texto, porque el turno no cierra hasta que
>   el hook calla.
>
> **Este plan no se descarta.** *(Al 23/08/2026 sí cambió de estado: se analizó y quedó en `Listo` —
> ver las secciones nuevas de abajo, que resuelven tres de sus cinco preguntas abiertas y corrigen el
> piso de la señal que A2 traía.)* Lo que aporta y Local-0112 no tiene sigue vivo:
> el relevamiento del repo ajeno *everything-claude-code* con qué copiar y qué no, el riesgo
> catalogado, lo que comparte con el plan Local-0039, las tres ideas anotadas para no volver a leer ese repo,
> y las preguntas que A2 no toca —si el aviso alcanza también a las preferencias, si el que evalúa es
> un subagente, y qué pasa en Codex CLI—. **Quien lo retome: el disparador se construye en
> Local-0112; acá se decide qué se le pide al agente cuando salta.**

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

- ~~**Qué mide el umbral.**~~ **Resuelto el 23/08/2026 con el usuario — ver *La señal*, abajo.** El
  piso **no** cuenta escrituras: eso corrige lo que la decisión A2 de Local-0112 había fijado.
- ~~**Qué momento exacto del CLI.**~~ **Resuelto — no se vuelve a decidir. Es `Stop`.** Lo decidió el
  usuario en `como-uso-claude` entre el 14 y el 21/08/2026 y llegó acá el 22/08. Ver el plan
  Local-0112, decisión A2. `SessionEnd` queda descartado por esa vía, no por análisis de este plan.
  **Confirmado por separado el 22/08/2026** contra la documentación oficial, sin conocer A2: `SessionEnd`
  solo admite efecto de lado — ahí el modelo ya no está y **nadie lee el aviso**.
- ~~**Si hay paridad en Codex CLI.**~~ **Resuelto el 22/08/2026: sí**, Codex expone `Stop`
  (conocimiento [Hooks de Codex CLI](../../conocimiento/hooks-codex-cli.md)). Con la salvedad ya
  asentada de que parsea varios campos de respuesta sin aplicarlos: al construir, **declarar en qué
  degrada**, como se hizo con el control de terminología.
- ~~**Si el que evalúa es un subagente.**~~ **Resuelto el 22/08/2026: no hace falta.** Medido sobre
  doce transcripciones reales de este repo, de 8 KB a 1,6 MB: leer y escanear el `.jsonl` entero cuesta
  **1 a 6 ms**, contra un presupuesto de 100 ms para un evento del camino crítico (conocimiento
  [Latencia de los hooks](../../conocimiento/latencia-hooks.md)). Entra cómodo en el hilo del hook.
- **Si el aviso alcanza también a las preferencias.** Sigue abierta, y ahora con evidencia de que
  importa: el texto ya escrito de `Base-0009` enumera *decisión, conocimiento, semántica, herramientas,
  conducta o catálogo de subsistemas* y **no nombra preferencias**. Una corrección repetida del usuario
  es material de preferencia y hoy quedaría fuera del aviso. Sumarlas es tocar el texto de una regla del
  Agente Multipropósito: **el agente propone, el usuario ratifica**.

## Lo que ya está construido y sin enchufar

Relevado el 22/08/2026. Lo que este plan daba por hacer, en buena parte ya existe:

- El momento **`al cerrar tarea`** (`Stop`) está en `MOMENTOS.md` como **`declarado`**: definido, sin
  repartidor que lo entregue.
- La regla **`Base-0009`** (*Registrar en el subsistema cuando algo cambia*) está en el Índice de
  conducta con su texto escrito, clase `Inyectar`, estado **`pendiente`** — pendiente porque su momento
  no tiene repartidor. **El texto del aviso ya está aprobado y no hay que redactarlo.**
- El repartidor `establecer-conducta/` ya realiza tres momentos y **lee el registro vivo en cada
  disparo**: sumar un evento es mapear `Stop` → `al cerrar tarea` y contemplarlo en el `hookEventName`
  de salida, que hoy resuelve `PreToolUse` o `UserPromptSubmit` y nada más.
- El control hermano `avisar-contexto-pesado/` es el molde entero: mide la sesión por su
  `transcript_path`, se calla bajo el umbral, deja marca por sesión en `tmp/` para no repetirse y limpia
  las marcas viejas.

## Lo construido el 23/08/2026

> **La señal de abajo está construida y probada.** El disparador se ejecutó por la decisión A2 del
> plan Local-0112, con este documento como fuente del diseño fino. Lo que hay hoy en el repo:
>
> - `.claude/conducta/avisar-sesion-sin-asentar/` — el control que decide si el aviso sale, con las
>   tres condiciones de la tabla de abajo y las dos guardas. 27 casos de prueba en verde.
> - El repartidor entrega el momento `al cerrar tarea` y sale mudo con `stop_hook_active`. 44 en verde.
> - El momento pasó a `activo` y la regla `Base-0009` a `vigente`, con la regla `Base-0012` que la
>   habilita.
>
> **Un hallazgo de diseño que este plan no tenía previsto:** como emitir ahí continúa la conversación,
> una regla `Inyectar` en ese momento **no puede salir sola** — saldría en cada cierre y el agente no
> podría terminar. Se resolvió haciendo que **callar sea el default** en ese momento: el texto fijo lo
> habilita el control que mide. Es una regla general del subsistema, no un parche de este aviso, y el
> `lint-conducta` la controla.
>
> **Queda una sola pregunta abierta de este plan:** si el aviso alcanza también a las preferencias.

## La señal (acordada con el usuario el 23/08/2026)

> ⚠️ **Esto precisa y corrige la señal de la decisión A2 de Local-0112**, que la había fijado como
> *«hubo escrituras en `.claude/` sin que ningún Índice cambiara»*. A2 deja explícito que *«el diseño
> fino de la señal se resuelve al ejecutar»* y que quedó **sin medir**; esto es ese diseño fino, ya
> medido. **Lo que cambia es el piso**; el tope de una vez por sesión y el evento no se tocan.

**El piso NO cuenta escrituras.** Objetado por el usuario y descartado: contar archivos escritos deja
pasar de largo **el caso más importante** —una conversación larga donde se entendió algo del dominio, se
descartó un camino o se aprendió cómo funciona un sistema externo, sin tocar un solo archivo—. Ahí no
queda nada escrito en ningún lado, que es la definición misma del problema que el plan ataca; un piso por
escrituras lo excluye **por construcción**. Subestima además por otro lado: las ediciones que el agente
hace desde la consola no pasan por `Write`/`Edit` y no se cuentan. Y *«escrituras en `.claude/`»* no
viaja: un Agente Desplegado cualquiera trabaja sobre su Producto, no sobre su `.claude/`.

El aviso se emite cuando se cumplen las tres:

| | Qué mide | Cómo |
|---|---|---|
| **Piso** | ¿hubo sesión de verdad? | el **tamaño de la transcripción** pasó de un corte — la misma medida que ya usa `avisar-contexto-pesado`, gratis y ajena a con qué herramienta se editó |
| **Sin asentar (archivos)** | ¿se escribió algún registro? | ninguna escritura cayó en un **`.md` de la casa de un subsistema** |
| **Sin asentar (habilidades)** | ¿se invocó alguna alta? | ninguna invocación de `registrar-*`, `converger-terminologia` o `agregar-subsistema` |

Más dos guardas: **una sola vez por sesión** (marca en `.claude/tmp/`, molde de `avisar-contexto-pesado`)
y **salir mudo si `stop_hook_active`** viene en `true`.

**Las escrituras siguen participando, pero solo del lado de callarse**: escribir un registro es prueba de
que ya se asentó. Del lado de disparar no entran.

⚠️ **Un `.js` dentro de la casa de un subsistema NO cuenta como asentar.** Un lint o un banco de pruebas
es maquinaria. Contándolos la señal se ensucia y el aviso deja de salir cuando debería: medido, con el
criterio grueso (cualquier archivo bajo `.claude/<sub>/`) la sesión de 16 escrituras y ningún registro
tocado **no** disparaba.

### En `Stop`, avisar cuesta un turno — y de ahí salen tres consecuencias

Verificado contra la documentación oficial el 22/08/2026, coincidiendo con el fundamento de A2: un hook
`Stop` tiene **dos** formas de hablarle al modelo —`decision: "block"` con `reason`, o
`hookSpecificOutput.additionalContext`— y **las dos continúan la conversación**. La segunda solo se
distingue en que la transcripción la rotula `Stop hook feedback` en vez de un error de hook. **No existe
dejar una nota y que el turno igual termine.**

1. Cada aviso emitido **cuesta una vuelta completa del modelo**. El umbral no es solo higiene contra la
   recitación (conocimiento [Modos de falla ante reglas escritas](../../conocimiento/modos-de-falla-ante-reglas-escritas.md)):
   es lo que evita pagar ese turno de más.
2. Un aviso **sin condición dejaría al agente sin poder cerrar**. Claude Code corta a las **8
   continuaciones consecutivas** y el stdin trae `stop_hook_active` para detectarlo: salir mudo con esa
   bandera es **obligatorio**, no una prolijidad.
3. La clase de la regla se queda en `Inyectar` (texto fijo del registro) y el que mide es un programa
   aparte, como ya hacen las reglas `Bloquear` del momento `cada turno`.

### Lo medido, y qué prueba y qué no

Doce sesiones reales de este repo (20 al 22/08/2026), con el criterio final: **avisaría en 3**. El caso
que caza es el que el plan quería — una sesión con **16 escrituras y ningún registro tocado**. Las dos
sesiones chicas (8 y 140 KB) quedan fuera por el piso; las demás, porque asentaron.

**Honestidad sobre la muestra:** el resultado da 3 de 12 con el piso viejo y con el nuevo, y no porque el
cambio no sirva. Las dos sesiones de pura conversación de la muestra —820 y 286 KB, cero archivos
tocados— **sí habían asentado**, cada una invocando `registrar-decision`. El caso que motivó el cambio
**no aparece en la muestra**, que por lo tanto no lo prueba ni lo refuta. Lo afirmable es que con el piso
por escrituras ese caso quedaba fuera por construcción, y con el piso por tamaño entra.

**El corte del piso queda SIN FIJAR y es PROVISORIO**, a calibrar con el uso — misma situación declarada
que `BYTES_POR_TOKEN` en `avisar-contexto-pesado`. El riesgo se acomoda a propósito del lado seguro: un
aviso de más cuesta un turno; uno de menos pierde el conocimiento y hay que volver a averiguarlo.

⚠️ **Este repo es el peor banco para calibrar ese corte**: acá escribir el Producto **es** escribir
subsistemas, cosa que en un Agente Desplegado cualquiera no pasa. Antes de dar por bueno el número, medir
contra un repo real ajeno (trampa ya pagada con `inventariar-componentes-sueltos`).

## Renombrar el plan (RATIFICADO y aplicado el 23/08/2026)

El plan se llama *«avisar al terminar la sesión»*, pero el momento real es **al cerrar tarea**: el agente
terminó de responder, no se cerró la terminal. El nombre desalinea al plan de su propio mecanismo y
empuja a buscar `SessionEnd`, que es el camino equivocado. Propuesto: **«Avisar al cerrar una tarea que
hay algo para asentar»**. Renombrar tocaba el archivo y su fila en `PLANES.md`: **hecho el 23/08/2026**, con el título, el archivo, la fila del registro y la referencia del plan Local-0039.

## Se cruza con

- **Plan Local-0039, *Verificar que el aprendizaje quede asentado en los subsistemas*** (`Nuevo`).
  Misma intención, **otro disparo**: aquel cubre el pedido a demanda y el cierre de un plan, y su
  motor es una habilidad que todavía no existe. Este cubre el final de sesión, que es justamente el
  caso donde no hubo plan.

  **Resuelto el 23/08/2026 con el usuario: son dos planes, y se ordenan en vez de fusionarse.** El
  motivo de no unirlos es la asimetría de dependencias, no la de intención: este **no depende de nada**
  —el mecanismo ya está en el repo sin enchufar— y **no escribe nada**; aquel depende del plan
  Local-0038 (*Skill `/contrastar`*), que no existe y arrastra un solape sin resolver con
  `amp:planificar`. Son tres planes encadenados, y meter el chico adentro de esa cadena lo bloquea sin
  necesidad.

  **El orden acordado:** ejecutar este primero y **después reevaluar el Local-0039** con la evidencia de
  cuánto alcanzó el aviso. Hipótesis a verificar entonces, no ahora: que el aviso más las habilidades de
  alta que ya existen cubran buena parte de lo que el Local-0039 pide, a una fracción del costo de
  construir `/contrastar`.

  ⚠️ **Esta anotación es la mitad del acuerdo; la otra mitad vive en el Local-0039.** Dejarlas sueltas es
  la forma exacta en que un plan y su pariente terminan resueltos al revés uno del otro
  ([El plan que reparte su trabajo en otros planes](../../conocimiento/el-plan-que-reparte-su-trabajo.md)).
- **Plan Local-0112, decisión A2** — construye el disparador (repartidor de `Stop`, momento a `activo`,
  regla `Base-0009` a `vigente`). **La señal fina la fija este plan**, y corrige el piso que A2 traía;
  ver *La señal*, arriba. Coordinar: quien ejecute A2 tiene que leer esa sección antes de escribir el
  control, o va a construir el piso por escrituras que se descartó.
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

## Evidencia del análisis de un mes de conversaciones (13/11/2026)

Lo trae el plan Local-0129 (plan maestro), arreglos 3 y 6. Informe: `D:\Proyectos\analisis\como-uso-claude\.claude\conocimiento\analisis-2026-11\agentes-que-no-usan-lo-guardado.md`.

- **Altas en registros hechas a mano: 43 % (34 de 79).** El agente escribe la fila sin la habilidad `registrar-*` que corresponde. Este plan avisa al cerrar; queda abierto si además hay que avisar o frenar **en el momento del alta**.
- **La señal «sesión sin asentar» mide mal.** Mide el tamaño del archivo de la transcripción y lo presenta como «KB de conversación». Saltó en 123 de 197 sesiones, casi siempre con uno o dos prompts; la conversación es, en la mediana, el 14 % de lo que informa. Se vio en vivo el 13/11/2026: 675 KB en una sesión recién limpiada con `/clear` y un solo intercambio. Arreglo: medir la conversación, no el archivo, y fijar el corte que este plan dejó provisorio.

## Vuelve a Análisis — 14/11/2026

Lo analizó un subagente de solo lectura, coordinado desde el plan Local-0129. Trae evidencia; no decidió nada. **El plan estaba en `Listo` para su diseño original, pero no para lo que el plan Local-0129 le sumó**: la sección del 13/11 solo anota los arreglos 3 y 6, y los dos chocan con lo ya cerrado.

- **Arreglo 6 (medir la conversación y no el archivo)** contradice el diseño cerrado del piso por tamaño de archivo (este plan, sección del piso).
- **Arreglo 3 (avisar o frenar al dar un alta sin su habilidad)** es otro momento (`al escribir`) y otra clase de regla, que este plan no tiene.

### Mecanismo actual (verificado)

- Hook `Stop` (`.claude/settings.json:38-43`) al repartidor. Reglas del momento en `conducta/INDICE.md`: la Base-0009 (`Inyectar`, l.38) y la Base-0012 (`Controlar`, l.41), que corre `avisar-sesion-sin-asentar.js --piso 200000`.
- **Tamaño:** `fs.statSync(transcript_path).size` (l.169) contra 200000 bytes (l.54, l.170). El texto dice «KB de conversación» (l.196-198), aunque el comentario de l.30-33 admite que esos bytes no son contexto.
- **«Asentó»:** recorre las herramientas usadas (l.121-153). Cuenta una habilidad `registrar-*`, `converger-terminologia` o `agregar-subsistema` (l.89, l.135); un `Write`/`Edit`/`MultiEdit`/`apply_patch` sobre un `.md` de una casa con `MANIFIESTO.md`, salvo `tmp/` (l.77-84, l.137-142); o un comando de consola con marca de escritura que menciona esa ruta (l.100, l.144-148).
- **Las altas a mano no se detectan: callan el aviso.** Editar un Índice con `Edit` cuenta como asentar (l.138).
- El momento `al escribir` es `PreToolUse` con matcher `Write|Edit` (`settings.json:29`): no ve `sed -i` ni heredocs por consola.
- Pruebas: `pruebas.js`, 27 casos, con piso de prueba de 5000 bytes (l.42). Ninguno prueba «primer turno grande».
- Errata: el comentario de l.38 dice «clase `Cloquear`»; quedó viejo tras la Decisión Local-0079.
- El commit `a2db32d` arregló el control hermano `avisar-contexto-pesado` (ahora lee `message.usage`), pero en este solo retocó el comentario.

### El aviso salta en el primer turno: no es por el `/clear`

Verificado el 14/11/2026 sobre la transcripción de la sesión: el archivo tiene un solo `sessionId` y el `/clear` está en su línea 10, con 8 KB acumulados. Lo que pesa es lo que el CLI escribe al arrancar: con el primer pedido ya son 289 KB (instrucciones 131 KB, lista de habilidades 64 KB, herramientas y MCP unos 42 KB), y antes de la primera respuesta suma 659 KB. El `usage` del primer turno da unos 85.000 tokens, casi todo contexto fijo. **Con el piso de 200 KB, en este repo el aviso sale siempre en el primer turno.** La hipótesis de que medía lo previo al `/clear` quedó refutada.

### Choques

- Grupo A (plan Local-0130): los dos escriben `conducta/INDICE.md` y su copia en `base/`; si el arreglo 3 se hace acá, comparten además el momento `al escribir`.
- Grupo C (planes Local-0107 y Local-0132): para que la consulta a otro agente no pierda la respuesta, la opción más directa es que este aviso no actúe en una corrida no interactiva. Toca este mismo control.

### Archivos

Viajan en la Base: `conducta/avisar-sesion-sin-asentar/{avisar-sesion-sin-asentar.js, pruebas.js, README.md}`, `conducta/INDICE.md` si cambia el piso o el texto, y para el arreglo 3 un control nuevo `al escribir` con su regla, quizás con `settings.json` si se amplía el matcher. Subir la versión de `amp`.

### Riesgos

- Medir con `usage` tiene el mismo piso fijo de unos 85.000 tokens: hay que medir la diferencia contra el primer turno, o contar lo que escribieron usuario y asistente.
- Arreglo 3: las habilidades de alta también escriben con `Edit` (hay que saber si se está dentro de su flujo); el lint y las actualizaciones legítimas también tocan los Índices; las escrituras por consola no pasan por `PreToolUse Write|Edit`.

### Decisiones abiertas

1. ¿Los arreglos 3 y 6 se quedan en este plan, o el 3 pasa a un plan propio (control `al escribir`)?
2. ¿Qué mide el piso: (a) la diferencia de `usage` contra el primer turno (por ejemplo, avisar si pasó de 85.000 a más de 125.000 tokens), (b) los bytes de texto de usuario y asistente (por ejemplo, más de 30 KB), o (c) una cantidad mínima de pedidos? Este plan ya descartó contar pedidos como medida única.
3. Arreglo 3: ¿frenar o avisar? Frenar choca con la Decisión Local-0079; avisar sigue a las Decisiones Local-0038 y Local-0052.
4. ¿Cómo se decide que un alta está dentro del flujo de su habilidad: hubo una habilidad `registrar-*` antes en la sesión, o se miran solo filas nuevas con código nuevo?
5. ¿El aviso de cierre sigue callándose ante un alta hecha a mano, o avisa además que se hizo sin la habilidad?
6. ¿Quién se encarga de que el aviso no actúe en las corridas de consulta: el grupo C en `comunicar.js`, o este plan detectando la corrida no interactiva?
