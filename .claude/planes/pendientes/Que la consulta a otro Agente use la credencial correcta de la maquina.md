# Que la consulta a otro Agente use la credencial correcta de la máquina

**Estado: Análisis · Creado 26-08-12 · Analizado 26-09-10 · Reanalizado 26-11-14.** Origen: reportado por el usuario el 12/08/2026 desde otra PC.

> **CAMBIO DE RUMBO — 11/09/2026, decidido por el usuario. Este plan dejó de ser sobre
> credenciales.**
>
> **Descartado: limpiar variables de entorno antes de lanzar el Agente consultado.** Las
> variables de entorno de la máquina están para configurar la máquina. Si había una clave
> de API vieja tirada ahí, el problema era esa clave, y se arregla borrándola. Un
> mecanismo del repo no tiene por qué desautorizar la configuración de la máquina en la
> que corre.
>
> **El problema que sí es de este mecanismo: el Agente consultado no contestó nada, y sin
> embargo volvió un texto presentado como su respuesta.** Su CLI ni llegó a arrancar,
> porque la clave de API no tenía crédito. El error de facturación viajó de vuelta al hilo
> que había preguntado, con etiqueta de respuesta. El hilo lo leyó, lo dio por bueno y
> siguió trabajando con eso.
>
> **El directorio inexistente, el CLI no instalado y el tiempo de espera vencido producen
> exactamente lo mismo.** Cualquier falla de arranque vuelve como un texto que no es una
> respuesta pero se presenta como tal. Son cuatro causas distintas con un solo defecto
> detrás, y ninguna se arregla tocando variables de entorno.
>
> **Hay que construir la distinción entre «el Agente contestó esto» y «el Agente no llegó
> a contestar».** Hoy el mecanismo devuelve las dos cosas con la misma forma. La segunda
> tiene que llegar al hilo marcada como falla, no como contenido.
>
> **Se conserva la tabla de precedencia de credenciales que levantó el análisis del
> 10/09/2026.** Dejó de ser la solución, pero sigue siendo la explicación de por qué pasó,
> y sigue propuesta como página de conocimiento.
>
> **El nombre del plan quedó viejo: dice «usar la credencial correcta» y eso ya no es lo
> que el plan hace.** Nombre propuesto: *El error de un Agente que no pudo arrancar llega
> como si fuera su respuesta*. El código Local-0107 no cambia.

## El síntoma

En otra máquina había una variable de entorno `ANTHROPIC_API_KEY` **que no se usaba para nada**, resto de alguna prueba vieja. Con esa variable presente, los Agentes invocados **contestaban que no tenían crédito** en vez de responder la consulta.

> Dato **reportado por el usuario, no reproducido en este repo** con ese caso puntual (clave sin saldo). Lo que sí se reprodujo en este análisis, en esta máquina, es el mecanismo general: ver «Verificado por reproducción directa» más abajo.

## Por qué pasa

`comunicar.js` invoca al Agente consultado con `spawnSync` **sin declarar `env`**, así que el CLI hijo hereda el entorno entero de la máquina (verificado: `.claude/comunicacion/comunicar/comunicar.js:182`, sin clave `env` en el objeto de opciones). Si ese entorno trae una credencial de API, el CLI la toma y factura por API en vez de usar la sesión con que el usuario está logueado.

**Verificado contra la documentación oficial** (`code.claude.com/docs/en/authentication#authentication-precedence`, consultada el 10/09/2026): cuando hay más de una credencial presente, el CLI `claude` elige en este orden —

1. Credenciales de proveedor en la nube, si está seteada `CLAUDE_CODE_USE_BEDROCK`, `CLAUDE_CODE_USE_VERTEX` o `CLAUDE_CODE_USE_FOUNDRY`.
2. `ANTHROPIC_AUTH_TOKEN` (la variable que el usuario nombró como «`AUTH_KEY`, presumiblemente»: **confirmado**, es esta).
3. `ANTHROPIC_API_KEY`. **En modo no interactivo (`-p`, el que usa `comunicar.js`) se usa siempre que está presente, sin preguntar** — la aprobación de una vez que sí existe en modo interactivo no aplica acá.
4. Salida del script `apiKeyHelper`, si el consultado lo configuró en su `settings.json`.
5. `CLAUDE_CODE_OAUTH_TOKEN` (token de larga vida, pensado para CI — no lo nombraba el plan original).
6. Perfil Anthropic / credenciales de federación (`ant auth login`, Workload Identity Federation).
7. La sesión con `/login` (lo que usa por omisión una cuenta Pro/Max/Team/Enterprise) — el último de la lista, no el primero.

Dato adicional relevante para el diseño de la solución: cuando la misma variable está seteada tanto en el shell como en el bloque `env` de un `settings.json`, **gana el `settings.json`** — el CLI reescribe la variable en su propio entorno de proceso al arrancar. Esto quiere decir que si `comunicar.js` deja de heredar la credencial de la máquina, el Agente consultado que esté **legítimamente** configurado con su propia clave (vía su `settings.json`) **sigue funcionando igual**: su propia configuración gana sin que `comunicar.js` tenga que saber nada de ella.

### Verificado por reproducción directa

Se reprodujo en esta máquina, con una `ANTHROPIC_API_KEY` inválida seteada solo para la corrida:

```
ANTHROPIC_API_KEY=<clave inválida> claude -p "..." --output-format json
```

Resultado (JSON real, no inferido):

```json
{"is_error": true, "terminal_reason": "api_error", "api_error_status": 401,
 "result": "Failed to authenticate. API Error: 401 API key is invalid."}
```

Esto **corrige la hipótesis original en un punto concreto**: `is_error` sí se enciende ante una falla de autenticación/facturación — el mecanismo actual (reescrito después de la Decisión Local-0065, con `--output-format json`) no pasa "entero en verde": `comunicar.js` ya lee `is_error` (línea 217) y sale con código de salida 1 (línea 227). La forma exacta en que el usuario lo vivió como "contestaban que no tenían crédito" es otra, más sutil y también verificada leyendo el código: `s.respuesta` (`j.result`, acá el texto del error) se imprime **primero**, bajo el rótulo `── Respuesta de "<nombre>" ... ──` (línea 208), y recién **después** aparece la advertencia `⚠️ El CLI marcó la corrida como fallida` (línea 217). El error de facturación no pasa inadvertido para el mecanismo, pero se muestra con la forma de una respuesta del Agente antes de la advertencia — fácil de leer como contenido si no se repara en las dos líneas de abajo. No se pudo probar el caso exacto reportado (clave con formato válido pero sin saldo): es razonable esperar que también termine en `terminal_reason: "api_error"` con `is_error: true` (misma familia de error de la API), pero **eso es una inferencia, no el dato reproducido**.

Es la misma clase de defecto que el conocimiento Local-0013 (*Controles que dejan de controlar sin avisar*) cataloga — acá en su forma más leve: no es que no avise, es que lo que avisa queda debajo de algo que parece la respuesta.

## Alcance verificado del problema

`comunicar.js` no es el único que lanza un CLI que se autentica sin declarar `env` — los tres heredan el entorno de la máquina tal cual, verificado leyendo cada uno:

| Archivo | Línea | Quién invoca a quién |
|---|---|---|
| `.claude/comunicacion/comunicar/comunicar.js` | 182 | Este repo → otro Agente Multipropósito Conocido (`cwd` es **su** directorio) |
| `.claude/herramientas/actualizar-plugins/actualizar-plugins.js` | 729 | Este repo → `claude plugin ...` en **su propio** repo (`cwd: REPO`) |
| `.claude/herramientas/probar-disparo-de-skills/probar-disparo-de-skills.js` | 75 | Este repo → `claude` en **su propio** repo (`cwd: raizRepo`) |

Los tres comparten el defecto de fondo (una credencial de máquina inesperada rompe la corrida), pero solo el primero es literalmente "la consulta a otro Agente" del título: los otros dos corren `claude` sobre el propio repo, así que ahí no hay una credencial ajena que "gane por error" — el riesgo es el mismo tipo de falla (una variable vieja de la máquina corta una corrida no interactiva), no el de usar la identidad equivocada.

## Lo que se resuelve en este análisis

1. **Qué variables intervienen y cuál gana** — resuelto arriba, contra la documentación oficial vigente (no de memoria, cumpliendo la Preferencia Base-0012 / Local-0012). La única pata sin verificar es la precedencia del lado `codex`: una búsqueda rápida encontró un reporte de que Codex CLI, en builds recientes, **no** lee `OPENAI_API_KEY` por defecto para su proveedor nativo — dato de un blog de terceros, no de la documentación oficial de Codex, así que queda marcado como **verificación pendiente durante la implementación**, no como hallazgo asentable.

2. **Quién decide con qué credencial corre el consultado** — resuelto: **el Agente consultado**, a través de su propio `settings.json`, tal como ya lo establece la Decisión Local-0065 para las herramientas ("el consultante no conoce las herramientas del consultado"). Si `comunicar.js` deja de heredarle a ciegas el entorno de la máquina, el caso legítimo (`Agente consultado configurado con su propia clave de API`) sigue andando exactamente igual, porque esa clave vive en el `settings.json` de ese Agente y el CLI la vuelve a aplicar al arrancar, no depende de lo que `comunicar.js` le pase por variable de entorno. La máquina — que es el único de los tres candidatos que **nadie eligió** — deja de tener el criterio hoy vigente por omisión.

3. **Qué hace el mecanismo cuando detecta el desfase** — resuelto: limpiar **y** avisar, no una cosa u otra. `comunicar.js` ya tiene el patrón (denegaciones, `is_error`, salida no estructurada se avisan todas con `⚠️` antes del pie): agregar un aviso simétrico, "se ignoraron N variables de credencial heredadas de la máquina: `ANTHROPIC_API_KEY`, …", cuando `comunicar.js` detecte alguna de las variables limpiadas presente en `process.env` antes de lanzar al hijo. Limpiar en silencio repetiría exactamente el defecto que este mismo plan señala (Local-0013): correr distinto sin que se note. Hay precedente de `env` explícito en el repo (`actualizar-plugins.js` le pasa `CODEX_HOME` al hijo por esa vía), así que el mecanismo — pasar un objeto `env` construido a mano en vez de heredar `process.env` entero — no es nuevo en este código.

4. **El alcance del arreglo** — resuelto: los tres call-sites comparten el mismo bug de fondo (verificado arriba), así que conviene una única función compartida, candidata natural a `.claude/common/` según el criterio ya asentado en el conocimiento Base-0004 (*La carpeta `.claude/common/`*: módulos que usan varios subsistemas y no son de ninguno). Hacerlo una sola vez en esta ejecución evita dejar dos call-sites con el mismo defecto ya identificado y sin arreglar, que es el patrón que el conocimiento Local-0016 (*No inventar soluciones particulares cuando ya existen mecanismos*) desaconseja. El nombre de archivo y de función quedan **propuestos, no ratificados** (Preferencia Base-0010): algo como `common/credenciales-heredadas.js`, exportando una función que devuelve una copia de `process.env` sin las variables limpiadas — a nombrar en la ejecución.

## Decisiones abiertas

### ¿Qué universo de variables limpia el mecanismo: solo credenciales, o también selección de proveedor?

> **SIN OBJETO desde el 11/09/2026: no se limpia ninguna variable.** La pregunta daba por
> sentado que el mecanismo tenía que limpiar algo, y esa premisa se cayó — ver el CAMBIO
> DE RUMBO al principio de este documento. Lo que sigue queda como registro de lo que se
> analizó, no como una decisión pendiente.

**Qué estábamos haciendo:** decidiendo qué variables de entorno tiene que dejar de heredar `comunicar.js` (y los otros dos call-sites) al lanzar el CLI hijo, para que una variable vieja de la máquina no le rompa la corrida a una consulta.

**Por qué importa:** la lista de variables que intervienen en la autenticación (ver arriba) tiene dos familias con consecuencias muy distintas si se limpian de más. Elegir mal rompe un caso legítimo en vez del que se quiere arreglar.

**Recomendación:** Opción A — limpiar solo las variables de credencial explícita, no las de selección de proveedor.

**Opciones:**

- **A. Limpiar solo credenciales** (`ANTHROPIC_API_KEY`, `ANTHROPIC_AUTH_TOKEN`, `CLAUDE_CODE_OAUTH_TOKEN`, `ANTHROPIC_AWS_API_KEY`) — **recomendada**. Cubre exactamente el síntoma reportado (una clave vieja de prueba) sin tocar cómo el consultado elige *proveedor*. Si `A` ⇒ una máquina que por política corporativa corre **todo** `claude` a través de Bedrock (`CLAUDE_CODE_USE_BEDROCK=1` seteado a nivel de máquina, caso plausible y no descartable con lo que hay en este repo) sigue funcionando igual en la consulta, porque esa variable no se toca ⇒ pero si la clave vieja de prueba en cuestión fuera en cambio una variable de *proveedor* mal seteada (`ANTHROPIC_BASE_URL` apuntando a un proxy caído, por ejemplo), esta opción no la limpia y el síntoma persistiría para ese caso puntual.
- **B. Limpiar credenciales + selección de proveedor** (agrega `CLAUDE_CODE_USE_BEDROCK`, `CLAUDE_CODE_USE_VERTEX`, `CLAUDE_CODE_USE_FOUNDRY`, `ANTHROPIC_BASE_URL` y las `*_BASE_URL` de cada proveedor). Si `B` ⇒ cualquier variable vieja de esta familia deja de poder romper una consulta ⇒ pero si una máquina tiene una política real y deliberada de "todo `claude` sale por Bedrock" seteada a nivel de máquina (no en el `settings.json` de cada Agente Desplegado, que es donde hoy vive la configuración por repo), esta opción se la saca sin que nadie lo haya pedido, y ahí sí se repite el defecto que el punto 3 ya resolvió evitar: correr distinto sin que el caso legítimo lo note a tiempo.
- **Otro** — un tercer criterio (por ejemplo, limpiar B pero solo si `A` no alcanzó a explicar un fallo reportado) que este análisis no evaluó.

**Qué dicen los registros:** ninguno de los dos registros de decisiones o conocimiento de este repo describe una política de selección de proveedor a nivel de máquina (el repo no tiene ese caso de uso hoy, ni evidencia de tenerlo), así que no hay con qué resolver esta alternativa sin una llamada de quien conoce el uso real de la máquina — es el único punto de este plan que de verdad necesita esa llamada, y no la delimitación de las variables en sí (eso ya quedó resuelto arriba).

## Lo que no cubre

Configurar las credenciales de la máquina del usuario. El plan es sobre **con qué corre el proceso que este repo lanza**, no sobre cómo está logueado el usuario. Tampoco cubre la precedencia de credenciales de `codex` (queda como verificación a hacer en la ejecución, ver punto 1) ni una política de "toda la máquina usa tal proveedor" — si la Decisión abierta de arriba se resuelve por la opción B, ese caso pasa a estar deliberadamente fuera de lo que la consulta respeta.

## Propuestas para asentar

- **Conocimiento** (candidato a **Base**, `agente-multiproposito`, porque describe un mecanismo del CLI `claude` que usa cualquier instalación del harness, no algo propio del Propósito de este repo): una página con la tabla de precedencia de autenticación verificada arriba (las 7 fuentes, en orden, con la particularidad de `ANTHROPIC_API_KEY` en modo `-p`) y el hallazgo de la reproducción (`is_error` sí se enciende ante una falla de autenticación, pero el texto del error se imprime primero bajo el rótulo de "Respuesta de"). Le sirve a cualquier Agente Desplegado que dispare un CLI hijo de forma no interactiva, no solo a `comunicacion`.

## Evidencia del análisis de un mes de conversaciones (13/11/2026)

Lo trae el plan Local-0129 (plan maestro), arreglo 5. Informe: `D:\Proyectos\analisis\como-uso-claude\.claude\conocimiento\analisis-2026-11\agentes-que-no-usan-lo-guardado.md`. Dos casos más de «el Agente no llegó a contestar y vuelve algo presentado como su respuesta»:

- **El aviso de cierre del consultado pisa la respuesta.** `comunicar.js` devuelve solo el último mensaje del consultado. Si a ese Agente le salta su propio aviso de cierre («sesión sin asentar»), contesta el aviso en un turno más y la respuesta real se pierde sin señal. Pasó el 13/11/2026 consultando a `como-uso-claude`, y antes en los repos Trámites y Agente Coordinador. Arreglo: que el aviso de cierre no actúe en una corrida no interactiva, o devolver el turno completo.
- **En modo `preguntar` el consultado no puede leer el material que se le pasa.** Se le deniega `Read` fuera de su carpeta (y `Bash`/`PowerShell`); el 13/11/2026 no pudo leer el handoff que se le indicó y contestó con lo que decía el pedido. Las denegaciones sí vuelven en la respuesta.
- **En modo automático el modo `resolver` no se puede lanzar:** el clasificador de permisos lo bloqueó sin motivo, y hubo que pasar a aprobación manual.

## Reanálisis del 14/11/2026

Lo hizo un subagente de solo lectura, junto con el plan Local-0132 (mismo grupo de trabajo, mismos archivos), coordinado desde el plan Local-0129. Trae evidencia; no decidió nada.

### Lo que este plan tiene y lo que no

- Desde el 11/09 el problema dejó de ser la credencial: es que «el Agente no llegó a contestar» vuelve con la misma forma que una respuesta. La decisión de qué variables limpiar quedó sin objeto.
- Siguen pendientes: el renombre propuesto (*El error de un Agente que no pudo arrancar llega como si fuera su respuesta*) y la página de conocimiento Base con la tabla de credenciales.
- **Los tres casos del 13/11 están anotados como evidencia, pero sin alcance ni decisión.** El arreglo 5 del plan Local-0129 («que la comunicación no pierda la respuesta») hoy no es trabajo de ningún plan.
- El nombre del plan y su fila en `PLANES.md` siguen diciendo «credencial».

### Mecanismo actual (verificado)

- `comunicar.js:79-108` arma el comando: `claude -p --output-format json`; en `preguntar`, `dontAsk`, `--allowedTools mcp__*` y `--disallowedTools Write,Edit,NotebookEdit,Bash` (`:86-88`); en `resolver`, `--permission-mode auto` (`:90`); `--sesion` pasa a `--resume`, y sin ella `--session-id <uuid>` (`:95-96`); codex, `exec --json` (`:100`).
- **Devuelve solo `j.result`** (`:118`): el último mensaje. En codex, `--json` emite varias líneas y cae a «salida no estructurada» (`:125-126`; inferido, no probado).
- Lanza con `spawnSync` sin `env`, `shell: true`, sin tope salvo `--tope` (`:182-190`).
- **Primero imprime el rótulo «Respuesta de» y el texto** (`:207-208`) y recién después las advertencias de `is_error` y de salida no estructurada (`:217-218`): un error sale rotulado como respuesta.
- **Cadena que pierde la respuesta:** el control de conducta Base-0012 (`avisar-sesion-sin-asentar.js`) solo se saltea con `stop_hook_active` (`:165`) y una marca por sesión (`:185`); no distingue una corrida no interactiva. Su `decision: block` le da al consultado un turno más, y ese turno pasa a ser `result`. (El código está verificado; la cadena la atribuye el informe.)
- Pruebas: `lint-comunicacion/pruebas.js:160-240`. No cubren la respuesta pisada, ni que un error se distinga de una respuesta, ni la salida de codex.
- El Agente Coordinador ya devuelve el turno completo con `--stream` (`--output-format stream-json --verbose`, `Agente-Coordinador/.claude/skills/consultar-agente/SKILL.md:65`).
- El conocimiento Local-0017 no dice que `result` sea solo el último mensaje.

### Choque no previsto

Que el aviso de cierre no actúe en una consulta toca `conducta/avisar-sesion-sin-asentar/`, que es del grupo D (plan Local-0111). El plan Local-0129 solo listaba el choque entre A y D.

### Orden conveniente (inferido)

Primero este plan, que arregla el mecanismo; después el plan Local-0132. Disparar la comunicación más seguido sobre un mecanismo que pierde respuestas multiplica el daño.

### Decisiones abiertas

1. ¿Cómo no perder la respuesta: (a) que el aviso de cierre no actúe en una consulta (por ejemplo, `comunicar.js` le pasa una variable de entorno y el control sale con 0; choca con el grupo D), (b) devolver el turno completo con `stream-json`, o (c) las dos?
2. ¿El arreglo 5 amplía este plan, renombrado, o va a un plan hijo nuevo del plan Local-0129?
3. ¿Cómo se muestra una falla de arranque: sin rótulo de respuesta («no contestó: error 401»), o con el rótulo y la advertencia arriba?
4. ¿Leer fuera de la carpeta: una bandera `--leer <ruta>` que pase `--add-dir` solo para ese material, que el consultante pegue el contenido, o nada?
5. ¿Que el modo automático bloquee `resolver` es problema del Agente Multipropósito? Investigar primero de quién es el clasificador que frena, o documentarlo como límite en el `SKILL.md`.
6. ¿Se asienta ya la página de conocimiento con la tabla de credenciales, sumándole que `result` es solo el último mensaje?
