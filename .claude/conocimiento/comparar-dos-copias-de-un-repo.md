# Comparar dos copias de un repo byte a byte en Windows las marca distintas aunque sean iguales

Un control que compara dos copias del mismo repo —un worktree contra el principal, un clon contra su
origen, un respaldo contra lo vivo— y decide «cambió» por tamaño o por bytes, en Windows contesta que
**cambió todo**. No falla: contesta, y contesta que sí.

La causa es `core.autocrlf`, que en Git para Windows viene en `true` desde la instalación, a nivel
`system`. Con ese valor, git convierte los fines de línea al escribir los archivos en disco: lo que
en el repositorio está guardado con `LF` sale con `CRLF`. Cualquier archivo que en la copia vieja
haya quedado con `LF` —porque lo escribió una herramienta que no convierte, un script de Node, un
editor configurado así— difiere del mismo archivo recién sacado por git.

## Cómo se verificó

Medido el 04/09/2026 en Windows 11, git con `core.autocrlf=true` heredado del nivel `system`. Un
repo con un archivo de dos líneas escrito con `LF`, commiteado, y un worktree armado con
`git worktree add`:

| Copia | Contenido en disco | Tamaño |
|---|---|---|
| el repo original | `linea uno\nlinea dos\n` | 20 bytes |
| el worktree | `linea uno\r\nlinea dos\r\n` | 22 bytes |

Es el mismo archivo, con el mismo hash en el repositorio, y no hay ninguna edición en el medio.

Lo encontró el banco de pruebas de `limpiar-worktree`, no el razonamiento: la Herramienta comparaba
el `.claude/` del worktree contra el del repo para avisar si el agente había escrito adentro, y
marcaba **todos** los archivos versionados. La limpieza frenaba siempre. Un control que marca todo
entrena a ignorarlo, así que el defecto no era una molestia: era el control apagándose.

## La forma que sí funciona

Preguntarle a git por lo que git maneja, y comparar bytes solo donde git no interviene:

- **Archivos versionados** → `git status --porcelain` dentro de la copia. Git compara contra el
  índice sabiendo lo que él mismo convirtió, así que un archivo intacto sale limpio.
- **Archivos que git no versiona** —los ignorados, los que copió otra herramienta— → ahí sí, byte a
  byte. Nadie los convirtió, y además es el único camino cuando el directorio entero está
  gitignoreado y git no sabe nada de nada.

## Cuándo aplica y cuándo no

Aplica a **cualquier comparación entre dos copias de un repo en Windows** donde al menos una haya
pasado por un checkout de git. También pisa a un control que compare un directorio contra un
respaldo hecho con una herramienta que no convierte.

No aplica a comparar dos archivos que ninguna de las dos puntas sacó de git, ni en sistemas donde
`core.autocrlf` esté en `false` o `input` — pero eso es la configuración de **la máquina donde
corre**, no la del repo: un mecanismo que viaja a otros Agentes Desplegados no puede suponerla, y
por eso la forma correcta no es apagar `autocrlf` sino no depender de él.
