# Que cada fila del índice Base de Herramientas tenga su bloque en la Plantilla

**Estado: Nuevo · Creado 26-07-30.** Origen: Javier instaló `amp:inicializar` en un repo nuevo (`/mnt/Datos/agentes/Agente A`) y la Pantalla de bienvenida mostró «Lint: 1 hallazgo» en la fila de Herramientas; verificado leyendo este repo desde otro, y reverificado el 30/07/2026 después de una tanda de 21 commits que tocó justo esta zona (partición de índices por origen, dos controles nuevos de sincronización bloque↔archivo).

## El problema

`funcionalidades/amp/skills/inicializar/PLANTILLA.md` declara en su índice Base de Herramientas dos filas:

- `Base-0001 | actualizar-plugins` — con su bloque `## §Script — actualizar-plugins` que la materializa.
- `Base-0002 | instalar-plugins-codex` — **sin bloque que la materialice**. Es la única aparición del nombre en las 4916 líneas del archivo (línea 1634).

`lint-herramientas.js` marca colgada toda fila cuyo link de `Detalle` no resuelve a una carpeta existente. Como `amp:inicializar` nunca crea `instalar-plugins-codex/` en el repo destino, **todo repo nuevo nace con un hallazgo de lint**, sin que nadie haya tocado nada: no depende de lo que haga el Propósito, es un defecto de la Base publicada.

## Qué índice mira el chequeo

Desde el 30/07/2026 el registro de Herramientas está partido por origen en dos archivos: `.claude/herramientas/INDICE.md` (`origen: agente-multiproposito`, lo reemplaza el nivelador entero, es el que viaja embebido en `PLANTILLA.md`) e `INDICE-LOCAL.md` (`origen: agente-desplegado`, el nivelador no lo abre). El defecto es exclusivo del primero: la fila `Base-0002 | instalar-plugins-codex` vive en `INDICE.md`, no en `INDICE-LOCAL.md`. Es evidencia —no concluyente— de que la intención registrada es que sea Base y se instale en cada repo; no prueba que esa intención sea la correcta (ver más abajo).

## Cómo se originó (rastreado con `git log -S`)

- 27/07/2026 (`ce10a6d`, "Plugins: Instalar el bundle de Codex"): se crea la Herramienta **solo en este repo** — script y README reales en `.claude/herramientas/instalar-plugins-codex/`, fila en `.claude/herramientas/INDICE.md`. Su invocación documentada es `node <checkout-harness>/.claude/herramientas/instalar-plugins-codex/instalar-plugins-codex.js --aplicar` — con un checkout externo del harness, a diferencia de `actualizar-plugins`, que se invoca con ruta local (`.claude/herramientas/actualizar-plugins/...`).
- 29/07/2026 (`d48e26b`, "Índices: Pasar conocimiento y herramientas al núcleo"): un commit que migra el **formato de columnas** del índice arrastra, como efecto colateral del reformateo, la fila de `instalar-plugins-codex` a `PLANTILLA.md` — sin agregar el bloque que la materializa y sin que el commit trate sobre esta Herramienta en absoluto.

Es una instancia nueva y fechable del mismo patrón que hoy ya está asentado en conocimiento (`el-mismo-dato-en-dos-lugares.md`, `cambiar-la-forma-de-un-registro.md`, y desde el 30/07/2026 también `controles-que-no-avisan.md`): tocar la **forma** de un registro arrastra contenido sin que nadie reevalúe si ese contenido sigue siendo correcto en el nuevo lugar, y el control existente no lo objeta porque valida sobre un recorrido que nunca llega a mirarlo.

## Duda de fondo, no resuelta acá

No está claro que "agregar el bloque faltante" sea la resolución correcta. La Herramienta, tal como está documentada, no encaja con el modelo que sí cumple `actualizar-plugins` (Base = se materializa e invoca localmente en cada repo instalado): su propio "Cómo se invoca" pide un checkout externo del harness, algo que la mayoría de los repos instalados por marketplace no tienen. Que la fila viva en `INDICE.md` (Base) y no en `INDICE-LOCAL.md` sugiere que en algún momento se la consideró Base, pero no zanja si eso fue una decisión deliberada o el mismo arrastre mecánico que explica su ausencia en la Plantilla. Puede ser:

- que sí debería materializarse localmente (y el `<checkout-harness>` de su invocación sea, en sí, un síntoma de que nunca se terminó de instalar bien) — en ese caso el bloque se agrega y la invocación se reescribe con ruta local, como `actualizar-plugins`; o
- que nunca debió declararse como fila Base para todo repo instalado, sino quedar como Herramienta propia de este repo (como `lint-harness`, `ejecutar-control-cierre`, etc., hoy todas `Local` en `INDICE-LOCAL.md`) — en ese caso se saca la fila de `PLANTILLA.md` y de `INDICE.md`, y pasa a `INDICE-LOCAL.md` con nuevo código `Local-NNNN`.

**A decidir al ejecutar**, no en este documento.

## Por qué los controles de hoy no lo agarran

La tanda del 30/07/2026 (`18de2b8`) sumó dos controles de sincronización bloque↔archivo que podrían parecer redundantes con este plan, y no lo son — son complementarios, y ahora puedo mostrarlo con el código:

- `actualizar-plugins.js` (función `archivosDeOtraGeneracion`, línea 389) recorre la Plantilla del plugin que efectivamente corre buscando fences ` ```js ` precedidos de una ruta entre backticks (línea 402: `` /`(\.claude\/[^`]+\.js)`/ ``); recién con ese destino en mano compara contra el archivo del repo (líneas 409-413). Su propio comentario lo dice: *"cada bloque de código de esa plantilla declara su destino: si el archivo que hay en el repo no coincide, las dos partes están en generaciones distintas"* (líneas 386-387).
- `lint-harness.js`, chequeo `[11]` (línea 469, nuevo en la misma tanda), hace la misma caminata con el mismo criterio (línea 477: *"El destino de cada bloque es la última ruta `.claude/**.js` nombrada antes de su cerca de código"*).
- `lint-harness.js`, chequeos `[4]` (línea 94) y `[4b]` (línea 163, sin cambios de numeración en esta tanda) comparan bloques `` ```markdown `` entre Plantillas y evitan que un mismo destino tenga dos bloques — misma lógica: parten de un bloque ya localizado.

Los cuatro controles caminan **de bloque hacia archivo**. Una fila de índice sin bloque no entra nunca a ese recorrido: no hay fence del que partir, así que el defecto es estructuralmente invisible para los cuatro, no por un descuido en cada uno sino por cómo están construidos. Esto no vuelve superfluos a esos controles —siguen agarrando la clase de defecto para la que se escribieron, divergencia o duplicación *entre bloques existentes*— pero deja exactamente el hueco de este plan: nada camina **de fila hacia bloque**.

## Alcance de este plan

Cubre dos cosas, no solo la fila de hoy:

1. **El defecto puntual** — resolver la fila `instalar-plugins-codex` según la dirección que se decida arriba.
2. **El control que evita que se repita** — extender `lint-harness.js` con un chequeo que camine en el sentido que falta: para cada fila del índice **Base** de Herramientas en `PLANTILLA.md` (`INDICE.md`, no `INDICE-LOCAL.md`, que el nivelador no toca y por ende no puede desincronizarse contra la Plantilla), verificar que exista un bloque que declare su `Detalle` como destino — o, si la Herramienta no se materializa localmente por diseño (ver "Duda de fondo"), que quede marcada de forma explícita para no reabrir este mismo hueco con una excepción legítima confundida con un olvido. Si no puede resolver la correspondencia, que lo reporte como divergente, nunca como cero.

Por qué el control entra en el mismo plan y no se separa: reutiliza el parseo de bloques que `lint-harness.js` ya tiene en `[4]`/`[4b]`/`[11]`, y esta es ya la segunda vez que la zona "fila de índice ↔ bloque de Plantilla" falla en silencio pese a tener controles activos alrededor — los cuatro existentes, verificado arriba, comparten el mismo punto ciego por construcción. Resolver solo la instancia de hoy deja ese punto ciego intacto para la próxima fila que alguien agregue.

## Implementación (30/07/2026)

Ejecutado junto con `Sacar la duplicación entre el Producto y el Agente instalado`, que resultó no ser independiente: la decisión `Local-0045` disuelve las dos partes de este plan.

**La duda de fondo se resolvió por el primer camino.** `instalar-plugins-codex` **sí** se materializa localmente en cada repo, como `actualizar-plugins`. Lo que la volvía dudosa era su propia invocación, que pedía un checkout aparte del repo que publica — y ese `<checkout-harness>` era el síntoma que el plan sospechaba: la fila prometía una Herramienta cuyo archivo nunca llegaba, así que no había de dónde correrla salvo un checkout externo. Desde que los Componentes de Subsistema viajan como archivos, se instala como cualquier otra y su invocación pasó a ruta local, en su ficha y en el registro. Para arrancar un repo que todavía no la tiene queda documentada la copia del marketplace bajado.

**El punto ciego se cerró sin escribir el control que el plan pedía.** El plan quería un chequeo que caminara *de fila hacia bloque*, porque los cuatro existentes caminaban *de bloque hacia archivo* y una fila sin bloque no entraba nunca a ese recorrido. Con los Componentes viajando como archivos ya no hay bloques: el control `INFRA BASE EN .claude/ QUE NO VIAJA` camina **de archivo instalado hacia lo que viaja**, que es el sentido que faltaba, y no puede tener el punto ciego porque no parte de ningún bloque. Los otros tres controles que el plan analiza se retiraron en la misma tanda.

## Cruces

- **Independiente de** [Sacar la duplicación entre el Producto y el Agente instalado](Sacar%20la%20duplicacion%20entre%20el%20Producto%20y%20el%20Agente%20instalado.md) — ese plan discute **cuál** de las dos copias (`.claude/` o `PLANTILLA.md`) es la fuente de verdad; este plan corrige una **inconsistencia interna** de `PLANTILLA.md` que existe sea cual sea esa dirección. El propio comentario de `lint-harness.js [11]` (línea 474) nombra ese plan como el que cierra el problema "de raíz" — confirma que son complementarios, no que uno reemplace al otro. No bloquea ni depende de esa decisión.
- **Relacionado con** [Que la lista de Componentes de Subsistema salga de la plantilla](Que%20la%20lista%20de%20Componentes%20de%20Subsistema%20salga%20de%20la%20plantilla.md) — ese plan es sobre el detector de `amp:actualizar` (duplica a mano la lista de qué debe existir); este es sobre `lint-harness` y la propia `PLANTILLA.md`. Comparten la lección de fondo, hoy asentada en conocimiento (`controles-que-no-avisan.md`: "un chequeo que no puede mirar tiene que decirlo, nunca devolver cero"), pero son fallas en componentes distintos.
