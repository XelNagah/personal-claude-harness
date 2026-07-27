# detectar-terminologia-vetada — control del momento `al escribir`

Infra co-ubicada del subsistema `conducta`. **No es una Herramienta** (no va al registro de Herramientas): la ejecuta el hook repartidor `establecer-conducta`, no el agente.

## Qué hace

Chequea el contenido que se está por escribir contra `../../semantica/TERMINOLOGIA-FARLOPA.md` **antes de que el archivo exista**, y responde según la columna `Control` del término encontrado:

| Control | Respuesta | Cuándo |
|---------|-----------|--------|
| `bloquea` | `permissionDecision: "deny"` con el motivo | La palabra está mal **siempre**: `levelear` no tiene uso válido en español |
| `avisa` | `additionalContext` con los términos y sus líneas | La palabra puede ser legítima según el significado: `capa de configuración` sí, `la segunda capa del proceso` no |

Con `avisa`, la máquina marca y **el agente juzga el significado** — el reparto que fija el subsistema `semantica`. Con `bloquea` no hay nada que juzgar, por eso frena.

## Qué no mira

- **Lo que está citado.** Las apariciones dentro de comillas simples invertidas, de bloques de código y de bloques indentados se ignoran. Hablar de un término vetado es legítimo y frecuente: esta misma tabla lo hace, la Base de preferencias lo hace al dar ejemplos, y los planes que documentan un barrido también. Sin esa distinción el control volvería inescribibles a los archivos que documentan el veto.
- **El subsistema `semantica`.** Exento: es el registro de los vetados.
- **Lo que no es `.md`.** El filtro por extensión y la exclusión del directorio de borradores `tmp/` los aplica el repartidor, en la condición del momento.

## Contrato

- **Entrada:** el JSON del hook por `stdin`. Lee `tool_name` y `tool_input` en las dos formas — `Write` (`content` + `file_path`), `Edit` (`new_string` + `file_path`) y `apply_patch` de Codex (`command`, el parche entero, del que saca las rutas y las líneas agregadas).
- **Salida:** JSON de hook por `stdout`, o nada si no aplica.
- **Nunca rompe el turno:** ante cualquier error sale con código 0 sin emitir nada.

## Probar a mano

Reemplazá `<termino>` por cualquiera marcado `bloquea` en el registro:

```bash
node -e 'process.stdout.write(JSON.stringify({tool_name:"Write",tool_input:{file_path:"README.md",content:"Hay mucho <termino> en el repo."}}))' \
  | node .claude/conducta/detectar-terminologia-vetada/detectar-terminologia-vetada.js
```

Devuelve el `deny`. Con el mismo término entre comillas simples invertidas no devuelve nada.
