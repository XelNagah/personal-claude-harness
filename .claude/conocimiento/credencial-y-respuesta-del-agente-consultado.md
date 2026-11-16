# Una clave de API olvidada en la máquina le gana a la sesión iniciada del Agente consultado

Al consultar a otro Agente Multipropósito, su CLI corre con el entorno de la máquina. Si en ese
entorno quedó una credencial —una `ANTHROPIC_API_KEY` de una prueba vieja—, el CLI la usa **antes**
que la sesión con que el usuario está logueado, y la consulta factura por API o falla por esa clave.
Pasó en otra máquina en agosto de 2026: los Agentes consultados «contestaban que no tenían crédito».

**Caduca.** El orden de las credenciales y los formatos de salida son del CLI y cambian entre
versiones. Verificado el **10/09/2026** contra la documentación oficial
(`code.claude.com/docs/en/authentication#authentication-precedence`) y medido el **16/11/2026** con
Claude Code 2.1.325 y Codex CLI en esta máquina. Lo que no caduca es la forma del problema: la
credencial la decide algo que nadie eligió, y su falla vuelve con forma de respuesta si el mecanismo
no las distingue.

## Qué credencial usa el CLI `claude`, en orden

Cuando hay más de una presente, gana la primera de esta lista:

| # | Fuente | Nota |
|---|---|---|
| 1 | Proveedor en la nube | si está `CLAUDE_CODE_USE_BEDROCK`, `CLAUDE_CODE_USE_VERTEX` o `CLAUDE_CODE_USE_FOUNDRY` |
| 2 | `ANTHROPIC_AUTH_TOKEN` | |
| 3 | `ANTHROPIC_API_KEY` | en modo no interactivo (`-p`, el de la consulta) **se usa siempre que está, sin preguntar** |
| 4 | el programa `apiKeyHelper` | si el consultado lo configuró en su `settings.json` |
| 5 | `CLAUDE_CODE_OAUTH_TOKEN` | token de larga vida, pensado para integración continua |
| 6 | perfil de Anthropic o credenciales de federación | |
| 7 | la sesión iniciada con `/login` | la de una cuenta Pro, Max, Team o Enterprise: **la última**, no la primera |

Si la misma variable está en el entorno y en el bloque `env` del `settings.json` del consultado,
**gana el `settings.json`**. Por eso un consultado configurado a propósito con su propia clave sigue
andando igual aunque la máquina traiga otra: su configuración gana sin que el consultante sepa nada.

Con una credencial de la máquina presente, el CLI además lo dice por la salida de errores:
«claude.ai connectors are disabled because ANTHROPIC_API_KEY or another auth source is set».

Del lado de `codex` el orden no está verificado: hay un reporte de terceros de que las versiones
recientes no leen `OPENAI_API_KEY` por defecto, sin confirmar en su documentación.

## Por qué no se limpia la credencial al lanzar al consultado

Se analizó y se descartó (11/09/2026): las variables de la máquina están para configurar la máquina.
Si hay una clave vieja, el problema es esa clave, y se arregla borrándola. Lo que sí le toca al
mecanismo de consulta es **no presentar su falla como una respuesta**, y nombrar la variable cuando
la consulta falla por la API.

## Qué devuelve una consulta no interactiva

- **`--output-format json` devuelve solo el último mensaje** en `.result`. Si el consultado contesta
  y después le salta un control propio al cerrar —un aviso que le da un turno más—, lo que contesta
  a ese aviso pasa a ser `.result` y la respuesta real se pierde **sin señal**.
- **`--output-format stream-json --verbose`** devuelve un evento por línea: cada mensaje del
  consultado y al final un evento `result` con `is_error`, `api_error_status`, `permission_denials`,
  el costo y el hilo. Es la forma de traer el turno completo.
- **Una falla de la API llega como un mensaje del consultado.** Medido con una clave inválida: el
  flujo trae un mensaje `assistant` con el texto «Invalid API key · Fix external API key» y un
  `result` con `is_error: true`, `terminal_reason: "api_error"`, `api_error_status: 401`. Un
  mecanismo que imprime los mensajes antes de mirar `is_error` lo muestra como contenido.
- **`codex exec --json`** emite `thread.started`, `item.completed` (los mensajes son
  `item.type: "agent_message"`; un `item.type: "error"` es un aviso, no una falla), `turn.completed`,
  o `turn.failed` cuando falla.

## Leer un archivo fuera de la carpeta del consultado

En `--permission-mode dontAsk` (el de una pregunta) leer fuera del directorio se deniega. Medido:

- `--add-dir <carpeta>` abre la carpeta **entera**.
- `--add-dir <archivo>` **no abre nada y no avisa**: el CLI lo acepta, sale con 0 y el `Read` se
  deniega igual.
- `--allowedTools "Read(//d/…/archivo)"` abre **ese archivo y nada más**.

Ojo al medirlo: una regla de lectura amplia en la configuración del usuario (por ejemplo sobre la
carpeta temporal del sistema) hace que la prueba dé verde sin que la opción haga nada. La primera
medición de esta página dio así.

## Lanzar a otro agente con permisos abiertos desde una sesión en modo automático

El clasificador del modo automático de la sesión que lanza trata como riesgo lanzar otro agente con
los permisos abiertos (`claude -p --permission-mode auto`): su regla por omisión «Create Unsafe
Agents», que se destraba si el usuario nombra qué agente corre y con qué permisos. El listado
completo de reglas sale de `claude auto-mode defaults`.
