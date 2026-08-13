# Que la consulta a otro Agente use la credencial correcta de la máquina

**Estado: Nuevo · Creado 26-08-12.** Origen: reportado por el usuario el 12/08/2026 desde otra PC.

## El síntoma

En otra máquina había una variable de entorno `ANTHROPIC_API_KEY` **que no se usaba para nada**, resto de alguna prueba vieja. Con esa variable presente, los Agentes invocados **contestaban que no tenían crédito** en vez de responder la consulta.

> Dato **reportado por el usuario, no reproducido en este repo**. La primera tarea del análisis es reproducirlo: sin eso, todo lo que sigue es hipótesis.

## Por qué pasa (hipótesis a verificar)

`comunicar.js` invoca al Agente consultado con `spawnSync` **sin declarar `env`**, así que el CLI hijo hereda el entorno entero de la máquina. Si ese entorno trae una credencial de API, el CLI la toma y factura por API en vez de usar la sesión con que el usuario está logueado — y si esa clave no tiene saldo, la corrida termina en un error de facturación.

Es el modo de falla más caro que puede tener este subsistema: **el mecanismo devuelve una respuesta**, rotulada y con su pie, y esa respuesta es un error de facturación disfrazado de contenido. Hay que verificar si `is_error` o `permission_denials` encienden algo, o si pasa entero en verde. Es la misma clase de defecto que el conocimiento Local-0013 (*Controles que dejan de controlar sin avisar*) cataloga, y la misma forma que ya se pagó una vez en este subsistema: el modo viejo le apagaba los MCP al consultado, contestaba de memoria y nada avisaba (conocimiento Local-0017).

## Lo que hay que decidir

1. **Qué variables intervienen y cuál gana.** El usuario nombra dos: `ANTHROPIC_API_KEY` y una que llamó `AUTH_KEY` —presumiblemente `ANTHROPIC_AUTH_TOKEN`, a confirmar—. Hay que averiguar contra la documentación, no de memoria, la lista real y su precedencia frente a la sesión interactiva, incluidas las que redirigen el proveedor (`ANTHROPIC_BASE_URL`, las de Bedrock y Vertex) y las del otro CLI soportado (`codex`, con sus propias credenciales). Sin la precedencia escrita no se puede decidir cuál borrar.
2. **Quién decide con qué credencial corre el consultado.** Tres candidatos: la sesión que consulta, el Agente consultado —que puede estar legítimamente configurado para correr con clave de API— o la máquina. Hoy es la máquina por omisión, que es el único de los tres que nadie eligió. Ojo con la simetría: el Índice guarda **cómo invocar** a cada Agente Multipropósito Conocido, y la Decisión Local-0065 fijó que el consultante **no conoce** las herramientas del consultado; una credencial por fila del Índice habría que argumentarla contra ese mismo criterio.
3. **Qué hace el mecanismo cuando detecta el desfase.** Limpiar el entorno del hijo (pasarle un `env` explícito) es arreglar; detectar y avisar es informar. No son excluyentes, pero un mecanismo que borra en silencio una credencial que el usuario puso a propósito rompe el caso legítimo. Hay precedente de `env` explícito en el repo: `actualizar-plugins.js` le pasa `CODEX_HOME` al hijo por esa vía.
4. **El alcance.** `comunicar.js` no es el único que lanza un CLI que se autentica: `probar-disparo-de-skills.js` corre `claude` por consulta del banco, y `actualizar-plugins.js` lo corre para los plugins. Los tres heredan el entorno igual. Hay que decidir si la solución es del subsistema `comunicacion` o de un módulo compartido — y si es compartido, `common/` es su casa (conocimiento Base-0004).

## Lo que no cubre

Configurar las credenciales de la máquina del usuario. El plan es sobre **con qué corre el proceso que este repo lanza**, no sobre cómo está logueado el usuario.
