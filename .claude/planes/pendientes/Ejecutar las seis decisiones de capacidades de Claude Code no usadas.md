# Ejecutar las seis decisiones de capacidades de Claude Code no usadas

**Estado: Nuevo · Creado 26-08-22.**

Ejecutar las **seis decisiones ya ratificadas por el usuario** que salieron del análisis de once
capacidades de Claude Code que el agente no usaba, hecho en el Agente Desplegado `como-uso-claude`
entre el 14 y el 21/08/2026. Las seis tocan el Agente Multipropósito, así que su ejecución es de
este repo.

**Origen:** plan `capacidades-de-claude-code-no-usadas.md` (estado `Ejecutado`) del repo
`como-uso-claude`. Llegaron por el subsistema `comunicacion` el 22/08/2026, con autorización
explícita del usuario para abrir este plan.

## Por qué existe este plan

**Nada de acá se re-decide.** Las seis están decididas y ratificadas, con su fundamento escrito. Este
plan es de ejecución: falta bajarlas a código, no elegirlas.

Se perdieron en el traspaso. El plan de origen se cerró el 21/08 y cerrarlo no las ejecutó: al
verificar el 22/08 contra este repo, las seis daban «no arrancó» y ninguna figuraba ni como decisión
ni como plan en el registro local. El modo de falla es el que ya tiene asentado el conocimiento
Local-0006 (*El plan que reparte su trabajo en otros planes*): los frentes se resuelven en otro lado
y nadie vuelve al padre. Acá fue peor, porque el otro lado era otro repo.

**Al ejecutar, cada decisión se registra en el subsistema `decisiones` de este repo.** Una decisión
ratificada en un Agente Desplegado ajeno no está asentada acá, y sin asentarla el próximo que mire
el registro vuelve a decidir lo mismo.

## Las seis decisiones

### A1 — Dar de baja la regla Base-0010 del momento `cada turno`

Se da de baja la fila de clase `Inyectar` de la regla Base-0010 (*Proponer dejar la sesión limpia al
terminar una tarea*) en el momento `cada turno`.

**Motivo ratificado:** el control `avisar-contexto-pesado` (regla Base-0011) ya emite el mismo
empujón —persistir, handoff, `/clear`, la terminal queda abierta— condicionado a un umbral y con
re-aviso por escalones. Es el mismo dato en dos lugares sin control que los compare, y la copia de
`cada turno` se paga siempre: ~100 tokens por prompt para un evento que ocurre una o dos veces por
sesión. El alcance queda acotado a las sesiones con contexto grande, que es donde el problema se
midió: con contexto liviano, `/clear` no ahorra nada que importe.

**Verificado el 22/08/2026 — la baja no pierde texto.** El aviso que emite
`avisar-contexto-pesado.js` dice hoy, literal: *«proponé cerrar limpio: persistir lo pendiente,
handoff si hace falta (Preferencia Base-0014) y `/clear` — la terminal queda abierta y en escucha»*.
Cubre las cuatro cosas que dice el Contenido de la regla Base-0010, incluida la aclaración de que se
limpia el contexto y no la sesión.

**Dónde:** `.claude/conducta/INDICE.md`, fila `Base-0010`. Es un Componente de Subsistema que viaja.

### A2 — Construir el repartidor del hook `Stop` y poner la regla Base-0009 en vigencia

> **EJECUTADA el 23/08/2026.** Queda construido y probado; el detalle fino de la señal salió del plan
> Local-0111, que la corrigió (el piso mide el **tamaño de la conversación**, no las escrituras).
> Lo que se hizo:
>
> - **Control nuevo** `.claude/conducta/avisar-sesion-sin-asentar/` — decide si el aviso sale. 27 casos
>   de prueba en verde.
> - **Repartidor** `establecer-conducta/`: mapea `Stop` → `al cerrar tarea`, devuelve ese nombre en el
>   `hookEventName` y sale **mudo** con `stop_hook_active`. 44 casos en verde.
> - **Regla de diseño nueva, que A2 no tenía:** en un momento donde emitir cuesta un turno completo,
>   **callar es el default** y una regla `Inyectar` NO sale sola — la habilita una regla `Bloquear` del
>   mismo momento. Sin esto el aviso saldría en cada cierre y el agente no podría terminar nunca. La
>   lista de esos momentos vive en `momentos-que-cuestan-un-turno.js`, única copia que leen el
>   repartidor y el lint.
> - **`lint-conducta`**: chequeo nuevo que marca la regla `Inyectar` que nadie habilita, porque no se
>   entregaría nunca y el síntoma sería que el agente trabaja sin ella.
> - **Registros**: el momento `al cerrar tarea` pasó a `activo`; `Base-0009` a `vigente`; se sumó la
>   regla `Base-0012` con el control.
> - **`settings.json` y la plantilla de `amp:inicializar`** (Claude Code y Codex) registran el evento.
> - Todo sincronizado a la carpeta que viaja; plugin `amp` a 0.54.0.
>
> ⚠️ **El corte del piso quedó en 200 KB de transcripción y es PROVISORIO**, declarado como tal en el
> código y en el README del control. Este repo es el peor banco para calibrarlo: acá escribir el
> Producto **es** escribir subsistemas.
>
> ⚠️ **Sin verificar en vivo:** el evento se registra al arrancar la sesión, así que la primera prueba
> real es la sesión siguiente al reinicio.
>
> **Sigue abierto de este frente:** si el aviso alcanza también a las preferencias — el texto de
> `Base-0009` no las nombra. Es tocar una regla del Agente Multipropósito: el agente propone, el
> usuario ratifica.

Se construye el repartidor del hook `Stop`, con señal estrecha y tope por sesión, y la regla
Base-0009 (*Registrar en el subsistema cuando algo cambia*) pasa de `pendiente` a `vigente` atada a
él.

**Fundamento verificado contra la documentación oficial:** `Stop` **no** permite hablar sin forzar un
turno más. Acepta `additionalContext`, pero con la misma consecuencia que `decision: block`: la
conversación continúa y el modelo produce otra respuesta. La única forma de que el turno cierre es
que el hook no emita nada. O sea, el costo de decir algo ahí no son los tokens del texto sino **una
vuelta completa del modelo** con todo el contexto de entrada.

**Por qué encaja igual para Base-0009:** el turno extra hace trabajo real —el agente lo usa para
asentar lo que se iba a perder— y es el último punto donde todavía se puede actuar, porque un aviso
equivalente en `cada turno` llega recién en el prompt siguiente, que puede no existir.

**La señal, decidida:** el programa solo empuja si hubo escrituras en `.claude/` **sin que ningún
Índice cambiara**, como máximo **una vez por sesión**. Con ese tope el gasto máximo es una vuelta
extra por sesión. El diseño fino de la señal se resuelve al ejecutar.

**Lo que quedó sin medir, dicho:** cuántas veces una tarea cierra con cambios en `.claude/` sin tocar
ningún Índice. Se decidió construir sin ese número. Si el empujón resulta ruidoso, ese es el dato que
lo calibra, y `como-uso-claude` tiene con qué medirlo.

**Dónde:** repartidor nuevo; `MOMENTOS.md` (el momento `al cerrar tarea` pasa de `declarado` a
`activo`); `.claude/conducta/INDICE.md` fila `Base-0009`; el `settings.json` que instala
`amp:inicializar`. Se cruza con el plan Local-0111 — ver más abajo.

### A3 — Descartar `PreCompact` y sumar una regla `Bloquear` al arranque que mire `source`

Se **descarta** usar `PreCompact`. Se suma una regla de clase `Bloquear` al momento `al arrancar la
sesión`, cuyo programa mira `source` y, **solo si es `compact`**, le devuelve el hilo al agente:
releer el plan vivo y el archivo de estado antes de seguir.

**Fundamento verificado:** `PreCompact` no tiene canal hacia el modelo —descarta `systemMessage` y
`continue` y no inyecta contexto—, así que no puede pedirle al agente que escriba el handoff. Frenar
la compresión tampoco sirve: si fue preventiva, bloquear la salta; pero si fue para recuperarse de un
error de límite que la API ya devolvió, bloquear hace aflorar ese error y la petición en curso falla,
y el campo `trigger` dice `auto` en los dos casos, así que el hook no puede distinguirlos.
`SessionStart` con `source: compact` es el único evento del ciclo de compresión que admite
`additionalContext`, y su momento **ya tiene repartidor y ya corre**.

**Se descarta declarar un momento nuevo:** obligaría al repartidor a pasar de «un evento realiza un
momento» a «un evento realiza varios», porque el arranque general ya ocupa `SessionStart`. Con un
programa que evalúa la condición —el mismo patrón de `avisar-contexto-pesado`— el repartidor no se
toca.

> ⚠️ **Observación verificada contra el código el 22/08/2026 — A3 no funciona hasta arreglar el plan
> Local-0099.** Esto no cambia la decisión: la condiciona. En `establecer-conducta.js` la clase
> `Bloquear` deja su texto en `medido.contexto`, que se concatena a `ctx`; y la última línea del
> repartidor hace `if (contexto) salida.hookSpecificOutput = { hookEventName: ev, additionalContext:
> contexto }`, que **pisa entero** el `hookSpecificOutput` que ya había puesto la clase `Ejecutar`
> vía `corrida.extra`. En `al arrancar la sesión` esa clase es la Pantalla de bienvenida, que desde
> el plan Local-0098 manda su estado al modelo por ese mismo campo. Sumar la regla `Bloquear` de A3
> ahí adentro la apaga, sin ninguna señal. Y hay un segundo defecto en la misma línea: `ev` en el
> arranque vale `UserPromptSubmit`, evento equivocado para un `SessionStart`.
>
> El plan Local-0099 (*El repartidor pisa el additionalContext de la Pantalla si hay una regla
> Inyectar al arrancar*, estado `Nuevo`) ya tiene diagnosticado ese defecto y su arreglo —fusionar en
> vez de pisar, corregir el `hookEventName`, y una prueba de regresión—. Lo describe para la clase
> `Inyectar`; queda verificado que **`Bloquear` lo dispara igual**, porque las dos escriben `ctx`.
> **Local-0099 es prerrequisito de A3.**

### A4 — Línea de estado: mostrar y además medir

Alcance decidido el 26-08-19: **mostrar y además medir**. La línea muestra modelo, contexto, ventana
de cinco horas y costo, y su script deja el contexto **real** en un archivo de sesión para que
`avisar-contexto-pesado` lo lea en vez de estimarlo dividiendo por cuatro los bytes de la
transcripción de la sesión
—su propio código marca esa constante como provisoria a calibrar (`BYTES_POR_TOKEN = 4`)—.

Es el mismo patrón del Buzón de Avisos Generales (Decisión Local-0051): un proceso deja algo y el
repartidor lo levanta.

**Se descartó medir primero y mostrar después:** el número del CLI es exacto por definición, así que
el contraste contra la estimación por bytes no cambiaría qué fuente conviene usar, y el único dato
que aportaría —cuánto recalibrar el umbral— desaparece si el umbral se expresa como porcentaje real
en vez de tokens estimados.

**Los dos costos, a la vista:** configurar una línea de estado hace que Claude Code deje de mostrar
la mayoría de las pistas del pie, incluidas «esc to interrupt» y «? for shortcuts»; y el script corre
con cada mensaje del asistente, o sea un proceso más por vuelta, aunque fuera del camino crítico del
modelo.

**Formato acordado el 26-08-19** mirándolo andar, una sola fila de 166 caracteres con datos reales:

```
AMP: Cómo uso Claude Code · main* · Opus 5 high · 18h42m (9m API) · $5.74 · ctx 14% 139k/1M · 5h 7% en 3h55m · 7d 12% en 5d14h · ? for shortcuts · hold space to speak
```

> 🛑 **Dónde vive la configuración quedó DIFERIDO a propósito el 26-08-19, y sigue diferido. No se
> decide en este plan.** El usuario no la vio funcionando y no quiere sumar una barra que choque con
> las que instalen otros repos o él mismo. La elección entre viajar en el harness o ser configuración
> de máquina se toma **después del uso**.
>
> Lo que se sabe para cuando toque decidir: los tres hooks del harness ya viajan en el
> `.claude/settings.json` del repo con un preámbulo de `node` que sube desde `CLAUDE_PROJECT_DIR`,
> así que la línea seguiría el mismo molde; y si termina siendo de máquina, el script igual puede
> escribir la medición en el repo actual porque recibe el directorio de trabajo, pero el control
> tendría que conservar la estimación por bytes como respaldo permanente.

### A5 — Ayuda del subsistema

Tres decisiones.

**A5.1 — Once habilidades llamadas `ayuda`.** `amp:ayuda` para las transversales y el índice de
subsistemas, y `amp-<sub>:ayuda` para cada subsistema. Cada una viaja en el plugin de su subsistema,
que es el molde del repo.

- Se descartó una sola `amp:ayuda <subsistema>` con argumento: obligaría al plugin `amp` a saber qué
  subsistemas hay y dónde están —lo que el Patrón evita— y un subsistema que sume el Propósito con
  `agregar-subsistema` no aparecería solo.
- El nombre `ayuda` se prefirió a `comandos` (las habilidades están diseñadas para dispararse
  hablando; llamarlas comandos refuerza el malentendido que este trabajo corrige, y el glosario tiene
  Skill con alias habilidad, no «comando») y a `listar-habilidades` (nombra solo la mitad derivada,
  no la de explicar qué es el subsistema).
- Las once llevan `disable-model-invocation: true`: son para la persona, no para el agente, así que
  cuestan **cero tokens por sesión** y no compiten por el presupuesto del 1% de la ventana que Claude
  Code le da al listado de habilidades. Ese presupuesto en el harness es un recurso escaso compartido
  por las 28 habilidades reales, y cuando se desborda el CLI recorta descripciones empezando por las
  que menos se invocan — con la consecuencia de que una habilidad deja de dispararse sola porque
  perdió las palabras con que se la reconocía.

**A5.2 — El texto sale del manifiesto; la lista, de lo instalado.** El texto explicativo lo extrae el
script del `MANIFIESTO.md` de cada subsistema: el título, el párrafo de qué es, y la línea
`**Disparador:**`. La **lista de habilidades se lee de lo instalado**, no de la línea `**Skills:**`
del manifiesto.

Se descartó que cada ayuda traiga su propio texto: sería el mismo dato escrito dos veces sin control
que los compare (conocimiento Base-0001). Si un manifiesto se lee mal para una persona, se arregla el
manifiesto y mejoran los dos lectores.

Leer de lo instalado hace que **la ayuda se vuelva el control** que expone la divergencia ya
detectada el 20/08: `inicializar-conocimiento` e `inicializar-decisiones` figuran en manifiestos y no
existen; `adoptar-recomendadas` está instalada y no figura; y las cuatro transversales —`amp:info`,
`amp:planificar`, `amp:actualizar`, `amp:inicializar`— no figuran en ningún manifiesto.

**A5.3 — Las métricas las calcula un solo lugar.** La cuenta que hoy hace
`mostrar-pantalla-bienvenida.js` (el renglón «7 planes: 5 pendientes · 1 ejecutado · 1 descartado»)
se muda a `.claude/common/` y la usan la Pantalla y la ayuda. Mismo motivo que A5.2. Verificado el
22/08/2026: `contarEntradas()` sigue definida y usada dentro de
`.claude/conducta/mostrar-pantalla-bienvenida/mostrar-pantalla-bienvenida.js` (líneas 84, 152, 174 y
229).

**Dato útil traído por `como-uso-claude`:** el comando nativo `/skills` ya existe y cubre la mitad
«listar nombres» —lista, filtra escribiendo, ordena por costo en tokens y permite apagar la
visibilidad—, así que esa parte no hay que construirla. Lo que **no** cubre: mezcla las 28 del Agente
con las empaquetadas del CLI y las locales, sin decir cuáles son del harness ni qué subsistema opera
cada una, y las descripciones del Agente están escritas para el modelo («Use when el usuario dice…»),
no como menú para una persona.

### A6 — La Preferencia Recomendada Base-0012 pasa a decir «Dejar escrito»

En la Preferencia Base-0012 (*Evaluar soluciones existentes antes de implementar una propia*), que
viaja en el plugin `amp-preferencias`, donde hoy dice:

> Informar qué se encontró y por qué se adopta o se descarta.

pasa a decir, **textual**:

> Dejar escrito qué se encontró y por qué se adopta o se descarta, donde vive lo que se fabricó: el
> README o el archivo de la habilidad o de la herramienta. Decirlo en la conversación no alcanza — la
> conversación no es registro.

Ratificada por el usuario el 21/08. **El caso que la motivó:** el 24/07 `como-uso-claude` fabricó su
habilidad `investigar-documentar` con `deep-research` instalada desde el 06/07 y visible en el
listado de cada sesión. No falló el relevamiento —el agente sabía que existía y tenía una razón
defendible para no usarla, que es la exención que la propia regla hace del comportamiento específico
del dominio—: falló que **la razón no quedó escrita en ningún lado**. Veintisiete días después nadie
puede distinguir «se evaluó y se descartó con criterio» de «no se miró».

> **Precisión de ejecución, verificada el 22/08/2026.** El pedido dice cambiarlo «en los dos lados».
> Son dos lugares, sí, pero **se toca uno solo**: el catálogo que viaja
> (`funcionalidades/amp-preferencias/skills/adoptar-recomendadas/recomendadas/RECOMENDADAS.md`) es
> **derivado** y su encabezado dice que no se edita a mano — lo genera la Herramienta Local-0011
> (`sincronizar-recomendadas`) a partir del Índice del Agente Desplegado, y sale con código 1 si
> quedó viejo. Entonces: editar la Preferencia Local-0012 en
> `.claude/preferencias/PREFERENCIAS-LOCAL.md` y correr
> `node .claude/herramientas/sincronizar-recomendadas/sincronizar-recomendadas.js --aplicar`.
> Editar el catálogo a mano lo dejaría divergente hasta la próxima regeneración, que lo pisaría.
>
> Verificado además que la frase vieja **no** aparece en las páginas de detalle
> (`buscar-solucion-existente.md`, en sus dos copias): está solo en las dos filas.

## Trabajo previsible

Ninguna de las seis se ejecuta en esta sesión: este plan las abre.

| # | Qué | Bloqueado por |
|---|---|---|
| A1 | Baja de la fila `Base-0010` en `cada turno` | — |
| A6 | Cambio de frase en la Preferencia Local-0012 + regenerar el catálogo | — |
| A5.3 | Mudar la cuenta de métricas a `.claude/common/` | — |
| A5.1 + A5.2 | Las once habilidades `ayuda` | A5.3 (usan la cuenta mudada) |
| A2 | Repartidor de `Stop` + Base-0009 a `vigente` | — (coordinar con el plan Local-0111) |
| A3 | Regla `Bloquear` al arranque que mira `source: compact` | **Plan Local-0099** (ver A3) |

Orden sugerido: A1, A6 y A5.3 primero, que no dependen de nada; después A5.1/A5.2; A2 en paralelo; y
A3 al final, detrás de Local-0099.

Transversal a casi todas: son Componentes de Subsistema que **viajan**. Al tocarlos hay que
sincronizar `base/`, subir la versión del plugin que corresponda, sumar al `REGISTRO.md` las once
habilidades nuevas de A5 —que `lint-harness` cruza contra el disco y el marketplace— y correr el
control de cierre.

## Fuera de alcance

- **Dónde vive la configuración de la línea de estado (A4).** Diferido a propósito por el usuario, se
  decide después de usarla. No se toma acá.
- Las otras cinco de las once capacidades analizadas en `como-uso-claude` que no derivaron en
  decisión para este repo.
- Arreglar el defecto del plan Local-0099: es su plan, no este. Acá solo queda anotado que A3 depende
  de él.

## Verificación

- La regla `Base-0010` ya no figura en `cada turno` y una sesión con contexto liviano no recibe el
  empujón de higiene; una que cruza el umbral sí lo recibe, una sola vez por escalón.
- Cerrar una tarea que escribió en `.claude/` sin tocar ningún Índice produce **un** turno extra con
  el empujón de Base-0009, y cerrar una segunda en la misma sesión **no** lo produce.
- Una sesión arrancada por compresión de contexto recibe el pedido de releer el plan vivo y el
  archivo de estado; una sesión arrancada normalmente **no** lo recibe — y en las dos, el estado de
  la Pantalla de bienvenida sigue llegando al modelo (es lo que el defecto de Local-0099 rompería).
- `amp-conocimiento:ayuda` lista `registrar-conocimiento` y `buscar-conocimiento` leyéndolas de lo
  instalado, y **no** lista `inicializar-conocimiento`, que el manifiesto nombra y no existe. Si
  listara lo que dice el manifiesto, la divergencia seguiría tapada.
- La cuenta de métricas tiene un solo lugar: cambiarla ahí cambia el renglón de la Pantalla y el de
  la ayuda a la vez.
- La Preferencia Base-0012 dice «Dejar escrito» en el catálogo que viaja, y
  `sincronizar-recomendadas` sin `--aplicar` sale con código 0 (nada por sincronizar).
