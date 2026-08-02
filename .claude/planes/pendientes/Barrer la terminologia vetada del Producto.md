# Barrer la terminología vetada del Producto

**Estado: En curso · Creado 26-07-26.** Origen: sesión de `planificar` sobre el rework de memoria (26/07/2026). Javier: *"es que confunde que sigas llamándole harness. Referite con terminología del repo"*. Al medir el alcance apareció un segundo frente, más grande.

## Frente A — el Producto nunca se barrió

`PLANTILLA.md` es lo que `amp:inicializar` escribe en cada Agente con Propósito. Medido el 26/07/2026, **arrastra 41 apariciones de 16 términos vetados**:

| Término | Veces | Vetado desde |
|---|---|---|
| `prosa` | 12 | 2026-07-23 |
| `slug` · `capa` | 5 c/u | 2026-07-19 · 2026-07-25 |
| `linkear` | 4 | — |
| `verbatim` | 3 | 2026-07-23 |
| `plomería` | 2 | — |
| `wedge` · `staleness` · `leveleo` · `levelear` · `gate` · `feasibility` · `dogfooding` · `cruce` · `churn` | 1 c/u | varias |

**Adelantado el 29/07/2026, fuera de este plan:** las 5 de `slug` en `PLANTILLA.md` ya se barrieron, junto con 3 apariciones vivas en `.claude/` que este plan no cubría (`planes/README.md`, `decisiones/README.md` ×2) — quedaron como `<nombre-estable>.md` y `NNNN-nombre.md`. Salieron a la luz porque el agente reusó el término en una conversación: el control `al escribir` no mira la conversación, y las apariciones sobrevivían **porque estaban entre comillas simples invertidas**, que es justo lo que el bloqueo saltea. Las 36 restantes siguen pendientes.

**Adelantado el 02/08/2026, también fuera de este plan:** se barrieron los 18 usos vivos que quedaban en `.claude/` —planes pendientes, dos decisiones asentadas y el título de un plan en `PLANES.md`—. Ninguno estaba en el alcance de este plan ni del de preferencias y subsistemas: los dos apuntan a `funcionalidades/` y a los registros, y **los planes nunca entraron en el alcance de ningún barrido**. Salieron a la luz al preguntarse por qué el informe del lint tenía 291 marcas. Lo que queda en `.claude/` son relatos de barridos ya hechos, que no se tocan. **El Producto sigue sin barrer: las 36 apariciones de abajo son el trabajo de este plan y no cambiaron.**

Los barridos de terminología se hicieron sobre `.claude/` —el Agente Multipropósito instalado acá— y **nunca sobre el Producto**. O sea que cada repo consumidor recibe, hasta hoy, textos escritos con el vocabulario que este repo prohibió hace tres días o más.

**El control no lo canta, y el escape es de severidad, no de cobertura.** `lint-semantica` **sí** barre la raíz —por eso encontró las 41 de la Plantilla y las de los `README.md` de las funcionalidades—, pero sale con **código 0** y las reporta como información, no como falla: hoy van **110 en texto plano y 171 en código**. Con ese volumen la sección es ruido de fondo y nadie la lee, así que el control de cierre da verde con el Producto sucio.

## Lo que pidió el autor (26/07/2026)

> *"Los archivos del Agente Multipropósito que ponemos en la raíz tienen que estar en el lint y los chequeos también. Que no se nos escapen. Deben ser parte de los que me siguen propagando la terminología farlopa."*

O sea: el Producto no puede quedar fuera del control. Dos partes:

1. **Que falle, no que informe.** Un término vetado en `.claude/` lo lee el autor; uno en la Plantilla lo hereda cada Agente con Propósito. Candidato: `lint-harness` —que ya mira `funcionalidades/`— falla ante vetados en el Producto, mientras `lint-semantica` los sigue reportando como información para el repo.
2. **Revisar la cobertura del resto.** `lint-semantica` llega a la raíz; `lint-planes` y `lint-preferencias` no la miran para nada, y `lint-decisiones`, `lint-conocimiento`, `lint-memoria` y `lint-conducta` apenas. Hay que verificar cuáles **deberían** mirarla y hoy no lo hacen.

## Ejecutado del Frente A (26/07/2026)

`lint-harness` ganó el chequeo **terminología vetada en el texto que viaja**: lee los términos de `TERMINOLOGIA-FARLOPA.md`, barre `funcionalidades/` y **cuenta como hallazgo**, así que el control de cierre se pone rojo (verificado con un archivo de prueba: 2 hallazgos, control rojo, `lint-semantica` sigue en verde e informativo). Detalle en el README de la Herramienta.

**Las 41 apariciones eran 14 reales.** El resto no era texto: la medición original usaba la clasificación de `lint-semantica`, que trata todo lo que está entre backticks como código y —al revés— no distingue el bloque ` ```markdown ` de la PLANTILLA, que **es** el texto literal que se escribe en el repo destino. Clasificando por lenguaje de bloque y separando identificadores (backticks, destino de link, campo `name` del frontmatter), quedaron 14 para reescribir y 2 usos que el propio registro de farlopa declara legítimos (`capa mecánica`/`capa semántica`, además vocabulario de la decisión 0003 y de 4 planes vivos), que van en la lista `USOS_LEGITIMOS` del lint.

Barridas: `prosa` → *texto plano* (7), `capa` `.codex/` → *carpeta* (3), `cruce` → *encuentre* (Base de preferencias).

**Se descartó un marcador en el archivo** (`<!-- vetado-ok -->`) para eximir citas deliberadas: el único caso que lo pedía —el párrafo de la PLANTILLA que citaba las Bases viejas para reconocerlas— se resolvió **reescribiendo el párrafo**, que ahora identifica la versión por el encabezado y dejó de envejecer con cada Base nueva. Criterio del autor (26/07/2026): antes de agregar una excepción a un control, corregir el texto que la pide.

De paso, la Base pasa a **v6**: entra la preferencia de mostrar el texto exacto antes de asentar en un registro canónico. Versiones subidas: `amp` 0.6.17, `amp-semantica` 0.5.1 (falta publicar y actualizar).

**Lo que queda del Frente A:** la cobertura del resto de los lints sobre la raíz. Medición del 26/07/2026: la raíz de este repo (`README.md`, `REGISTRO.md`, `AGENTS.md`, `docs/`) está **limpia**, salvo 6 apariciones de `ciclo-de-plan`, que es el nombre vigente de la habilidad hasta que se ejecute `Partir las mega-skills en habilidades de un verbo`.

## Frente B — el alias «harness» ocupa el lugar del nombre

### La regla que se está incumpliendo

La preferencia **Base v5** dice: *"La sigla nunca sola en lo que queda escrito… Que un alias esté registrado en el glosario dice qué significa ese término, **no** autoriza a sustituir el nombre por él en el texto escrito."*

`harness` está registrado en el glosario como **alias** de *Agente Multipropósito*. Eso lo hace legítimo para entender qué significa cuando aparece; no lo habilita a ocupar el lugar del nombre. Hoy lo ocupa en cientos de lugares.

## Alcance medido (26/07/2026)

Los archivos más cargados, en `.md`, sin contar `tmp/`:

| Archivo | Apariciones |
|---|---|
| `.claude/planes/PLANES.md` | 35 |
| `funcionalidades/amp/skills/inicializar/PLANTILLA.md` | **29** |
| `.claude/decisiones/INDICE.md` | 18 |
| `docs/INSTALAR.md` | 12 |
| `REGISTRO.md` | 10 |
| `.claude/semantica/GLOSARIO.md` | 7 |

Más una cola larga de planes ejecutados y pendientes.

**La prioridad no es este repo: es `PLANTILLA.md`.** Esas 29 apariciones **viajan**. Cada Agente con Propósito que se inicialice recibe textos que llaman "harness" a lo que debería llamar por su nombre, y ahí el lector no tiene el glosario a mano para traducirlo.

## No es un reemplazo a ciegas: tres poblaciones

1. **Sustitución en texto plano** — `harness` puesto donde iba *Agente Multipropósito*. Es lo que viola la preferencia. **Se reescribe.**
2. **Nombres de identificador** — `lint-harness`, `propagar-harness`, y el marketplace `xelnagah-harness`. Son interfaces: renombrarlos rompe cosas. El del marketplace **rompe a los consumidores ya instalados** y ya figura como pendiente en el plan `Nombres y distribucion de las skills del harness`. `propagar-harness` se retira por el plan de la duplicación, así que se resuelve solo.
3. **Uso legítimo del género** — el propio glosario dice: *"'Harness' es el término genérico —un setup de subsistemas cualquiera—; en este repo **denota** el AMP: no todo harness es un AMP, pero todo AMP es un harness."* Cuando el texto habla del género —comparar contra otros proyectos, como en el conocimiento `proyectos-similares-al-harness`— es correcto y **se deja**.

El barrido necesita juicio por aparición: es trabajo de `converger-terminologia`, no de buscar y reemplazar.

## Registros históricos: no se tocan

Los planes **ejecutados** y **descartados** son registro de lo que pasó, con la redacción de su momento. Reescribirlos falsea el registro. Se barre lo **vivo**: `PLANTILLA.md`, `AGENTS.md`, `REGISTRO.md`, `docs/`, los manifiestos, el glosario, las decisiones vigentes y los planes pendientes.

## A decidir

- **Si el Producto merece un control más duro que el repo.** Es lo único que viaja: un término vetado en `.claude/` lo lee el autor, uno en la Plantilla lo hereda cada Agente con Propósito. Candidato: que `lint-harness` —que ya mira el Producto— falle ante vetados en la Plantilla, mientras `lint-semantica` los sigue reportando como información.
- Si la fila **Agente Multipropósito** del glosario tiene que distinguir `harness`-alias de `harness`-género. Hoy la definición explica la diferencia en texto plano pero la columna `Alias` lo lista pelado, así que un lint que marque por término no puede separarlos.
- Si conviene un control que impida la reincidencia. Marcar cada aparición como hallazgo es ruidoso —el uso genérico es legítimo—; el candidato es una regla de conducta en el momento de escribir, no un lint.
- El orden: la Plantilla primero (es lo que viaja), el resto después.

## Frente C — el momento de escribir no cubre lo que se publica

Apareció al verificar el Frente A el 26/07/2026. **Analizado con `amp:planificar` el 26/07/2026; diseño acordado**, incluida la prioridad que Javier fijó en el medio: *"lo siguiente más importante para mí es que todo funcione con Codex"*.

### La regla no se entrega: el momento no dispara

Este plan afirmaba que *"la regla se entrega igual, el hook la dispara al escribir cualquier `.md`"* y que el problema era el texto. **Es falso.** La condición vive en `establecer-conducta.js:43` y exige `.md` **bajo `.claude/`**: escribir `PLANTILLA.md` devuelve `null` y **no entrega ninguna regla**. `MOMENTOS.md` lo declara igual, así que registro y código coinciden: el hueco es de **condición**, no de redacción. Reescribir el texto no habría cambiado nada — nunca llega.

### Lo acordado

1. **Alcance:** la condición Base pasa de `.md` bajo `.claude/` a **`.md` en cualquier lado del repo**, salvo `tmp/`. Vale para todo Agente con Propósito: en un repo de contabilidad cubre también el informe al cliente, donde la terminología farlopa hace más daño que adentro de `.claude/`.
2. **Se bloquea, en dos velocidades.** Javier lo ratificó el 26/07/2026: *"mi intención es que se bloquee"*. Una regla de clase **`correr`** chequea el contenido contra `TERMINOLOGIA-FARLOPA.md` **antes** de que el archivo exista, y reparte según el término:
   - **Bloquea** (`deny` + motivo) los términos **sin uso legítimo posible** — anglicismos puros como `levelear`, `dogfooding`, `staleness`, `feasibility`. No hay caso donde valgan, así que el falso positivo sí es imposible y se cumple el criterio de la columna `Clase`. El agente recibe el motivo, corrige y reescribe: forzado, no recitado.
   - **Informa** (`additionalContext` con los términos hallados) los que **sí** tienen uso legítimo — `capa`, `prosa`, `harness`. Ahí la máquina marca y el agente juzga el significado, que es el reparto de la 0026.
   - **Exime** los archivos de `semantica/`: el registro de vetados contiene los vetados por definición, y bloquearlo lo volvería inescribible.
3. **El repartidor combina clases en un mismo momento:** junta el texto de las reglas `inyectar` con la salida de las `correr` cuando ambas producen `additionalContext` (`PreToolUse`, `UserPromptSubmit`); `SessionStart` sigue reenviando la salida tal cual. Hoy `correr` corta el despacho (`establecer-conducta.js:112`), así que sumar la detección **apagaría** el recordatorio existente. Se descartó que un solo script arme todo el mensaje: mudaría el texto de la Regla Base del registro al código, donde deja de leerse y de nivelarse.
4. **Texto de la regla:** se reescribe — dice *"del harness (`.claude/`)"*, que nombra el lugar equivocado **y** usa el alias en lugar del nombre (Base v6).

### Por qué el bloqueo va por lista corta y no por término vetado

La 0025 previó *vetado conocido → `bloquear`*, a secas. Medido, eso frena escrituras legítimas:

- **Dos de cada tres bloqueos serían falsos.** La columna `Clase` admite `bloquear` *"solo donde el falso positivo es imposible"*; el Frente A midió **41 detectadas, 14 reales** — el resto eran identificadores, destinos de enlace y usos que el propio registro declara legítimos (`capa mecánica`, `capa semántica`).
- **El registro de vetados contiene los vetados.** Bloquear por término dejaría `TERMINOLOGIA-FARLOPA.md` inescribible, y también los planes que documentan el barrido: este mismo cita `wedge` y `churn` para explicarlo.

Por eso el bloqueo se acota a los términos sin uso legítimo posible y el resto informa. La intención se cumple —lo que no debe existir no llega a escribirse— sin trabar el repo.

⇒ **Modifica el punto (a) de la decisión 0025**, que sigue vigente en todo lo demás: el bloqueo deja de ser por *vetado conocido* y pasa a ser por *vetado sin uso legítimo posible*, con el resto en aviso.

**Pendiente de ratificación:** dónde vive la marca de qué término bloquea y cuál avisa. Propuesta: una columna nueva en `TERMINOLOGIA-FARLOPA.md` (`Control`: `bloquea` / `avisa`), que es el dato semántico y ya lo lee el lint — pero toca un registro canónico, así que el texto exacto va al usuario antes de escribirse. La alternativa es una lista adentro del script, más barata y menos visible.

### Codex: el momento sí es realizable, el bloqueo no

`MOMENTOS.md` declara `al escribir` como **activo (Claude)** porque *"el `PreToolUse` de Codex intercepta solo Bash"*. **Ese dato quedó viejo** (era `openai/codex#16732`, cerrado el 22/04/2026). Verificado el 26/07/2026 y asentado en el conocimiento [hooks de Codex CLI](../../conocimiento/hooks-codex-cli.md):

- `apply_patch` **sí** dispara `PreToolUse` y **matchea como `apply_patch`, `Edit` o `Write`** ⇒ el matcher que ya usa Claude sirve sin tocarlo.
- Los datos llegan en **`tool_input.command`** (el texto del parche), no en `file_path`. El repartidor lee `file_path`: en Codex recibiría vacío y **contestaría que la condición no se cumple**, sin fallar.
- Un parche toca **varias rutas de una** ⇒ la condición pregunta por *alguna* ruta, no por *la* ruta.
- El **`deny` no se aplica** a las escrituras (`#27833`, abierto, reconfirmado el 06/07/2026): el archivo se escribe con el contenido denegado. La doc oficial: *"tratá los hooks de herramienta como una barrera útil, no como una frontera de cumplimiento completa"*. **El `deny` se emite igual**: hoy en Codex queda como aviso, y el día que arreglen el bug empieza a frenar sin tocar nada acá. Vía a probar si urge: `updatedInput` —soportado para `apply_patch`, que exige un campo `command` de texto— permitiría reescribir el parche en vez de rechazarlo, pero hay reportes de que el runtime lo rechaza en varios caminos (`#18491`).
- Un hook de Codex **no corre hasta que se le da confianza a mano** (`/hooks`), y la confianza se pierde cada vez que cambia su texto ⇒ toca a `amp:inicializar` y a cada actualización.

### Ejecutado del Frente C (26/07/2026)

Todo lo de la tabla de abajo, más la propagación al Producto. Verificado:

- **El momento dispara donde no disparaba.** Comprobado en vivo durante la propia ejecución: al editar `funcionalidades/…/PLANTILLA.md` el recordatorio llegó, cosa que antes no pasaba.
- **El control frena y distingue.** Siete casos probados: término `bloquea` desnudo → `deny`; el mismo entre comillas simples invertidas → nada; término `avisa` → aviso combinado con el recordatorio; archivo de `semantica/` → exento; `.md` en `tmp/` → exento; archivo que no es `.md` → nada; parche de Codex con dos rutas → `deny`.
- **Sin regresión** en `cada turno` ni en `al arrancar la sesión` (la Pantalla sigue saliendo).
- **Los siete embebidos son idénticos** a los archivos vivos (comparación carácter a carácter).
- **Dos apariciones legítimas cayeron en el control nuevo** —el README del control cita `capa` para explicar la diferencia— y se resolvieron **corrigiendo el texto**, no exceptuando el archivo: las citas pasaron a comillas simples invertidas y el ejemplo copiable usa `<termino>`. Mismo criterio que el Frente A.
- **Defecto preexistente encontrado y arreglado:** `lint-conducta.js --quiet` tomaba `--quiet` como si fuera la ruta y reportaba que faltaban `MOMENTOS.md` e `INDICE.md`.

Versiones: `amp` 0.6.18, `amp-semantica` 0.5.2 (falta publicar y actualizar).

### Qué hay que tocar

| Componente de Subsistema | Cambio |
|---|---|
| `establecer-conducta.js` | condición del momento (todo `.md` salvo `tmp/`); leer `tool_input.command` de `apply_patch` y extraer todas las rutas; combinar `inyectar` + `correr` |
| `.codex/hooks.json` | cablear `PreToolUse` con matcher `Write\|Edit` |
| `conducta/MOMENTOS.md` | condición nueva; corregir la nota de paridad (Codex pasa a activo) |
| `conducta/INDICE.md` | reescribir el texto de la regla `al escribir` + sumar la regla `correr` |
| Herramienta de detección | co-ubicada con `conducta`, como la Pantalla de bienvenida (0030/0008); emite `deny` o `additionalContext` según el término |
| `TERMINOLOGIA-FARLOPA.md` | columna `Control` (`bloquea` / `avisa`), si se ratifica |
| `PLANTILLA.md` + versiones | propagar los cinco Componentes de Subsistema y subir versión |

Pendiente de ratificación: el **texto exacto** de las dos reglas, antes de asentarlas.

Se cruza con `Crecer el subsistema conducta` (dueño de las clases de acción) y con `Excluir tmp del barrido de los lints de subsistema` (misma exclusión, otro alcance).

## Cruces

- `Nombres y distribucion de las skills del harness` — dueño del renombre del marketplace, que es la población 2.
- `Sacar la duplicacion entre el Producto y el Agente instalado` — mientras la Plantilla y `.claude/` sean dos originales, el barrido hay que hacerlo dos veces.
- `Publicar el harness en ingles` — el nombre en inglés (*Multipurpose Agent*) arrastra la misma discusión.
