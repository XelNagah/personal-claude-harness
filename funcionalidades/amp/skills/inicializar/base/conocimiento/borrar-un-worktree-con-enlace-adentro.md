# Borrar un worktree con `git worktree remove` vacía el destino del enlace que tenga adentro

Un worktree se arma con `git worktree add` y se limpia al terminar. Si adentro hay un enlace
—un junction de Windows, típicamente hacia una carpeta compartida del repo principal—, la forma
obvia de limpiar es la que destruye datos, y la que parece peligrosa es la inocente.

## Lo medido

Dos instalaciones, un junction real hacia un destino de prueba de 25 archivos en 5 subcarpetas.

| Forma de borrar | Destino real |
|---|---|
| `git worktree remove` | 0 de 25 |
| `Remove-Item -Force` sobre el junction y después `git worktree remove` | 0 de 25 |
| `Remove-Item -Recurse -Force` sobre el worktree (PowerShell) | 25 de 25 intactos |
| `fs.rmSync(junction, {recursive, force})` (Node 24.14.1) | 25 de 25 intactos |
| `fs.rmSync(worktree entero, con el junction adentro)` | 25 de 25 intactos |
| `fs.unlinkSync(junction)` / `fs.rmdirSync(junction)` | 25 de 25 intactos |

Git en Windows no reconoce el junction como enlace: entra y vacía lo que hay del otro lado. Node
sí lo reconoce — `lstat()` lo devuelve como `isSymbolicLink=true` y `isDirectory=false`, así que el
recorrido recursivo lo desarma en vez de entrar. PowerShell se comporta igual.

## Las tres trampas

- **El borrado recursivo es inocente y parece culpable.** La primera versión del diagnóstico
  culpaba a `Remove-Item -Recurse -Force` y recomendaba «preferí `git worktree remove`»: la
  salvaguarda escrita dirigía al comando que había hecho el daño. Estuvo así un día.
- **Sacar el enlace primero, sin recursión, no alcanza.** Sobre un junction que apunta a un
  directorio no vacío, `Remove-Item -Force` pide confirmación y en modo no interactivo aborta sin
  sacar nada; después git lo atraviesa igual. Lo que sí lo saca:
  `[System.IO.Directory]::Delete($ruta, $false)`, o `fs.unlinkSync` desde Node.
- **Un `Permission denied` de git no significa «no borré nada».** Significa «borré hasta acá y me
  trabé». Un daemon de compilación con locks sobre la carpeta de salida alcanza para producirlo, y
  lo perdido es un tramo alfabético consecutivo: la firma de un recorrido interrumpido. En el
  incidente que originó esta página, el daño se descubrió siete minutos después y de casualidad,
  porque un hook falló con `MODULE_NOT_FOUND`.

## Lo que se hace en su lugar

No poner enlaces adentro de un worktree: copiar lo que haga falta. Sin enlace no hay nada que
atravesar, y la regla no depende de que nadie se olvide del orden de los pasos.

Cuando igual hay que limpiar uno: borrar el árbol con el borrado recursivo del lenguaje —desde
Node, `fs.rmSync` con `recursive` y `force`—, después `git worktree prune` para que el registro de
git quede consistente, y **verificar el resultado**. La rama sobrevive al `prune`: si no se la
quiere, se borra aparte.

Un fallo de borrado es estado sucio a revisar, nunca un no-evento.

## Lo que no se probó

Con un archivo abierto por otro proceso Node, `fs.rmSync` igual borró todo: libuv abre con
`FILE_SHARE_DELETE`, que permite borrar el nombre aunque el handle siga vivo. **Contra una JVM no
se probó**, y una JVM puede abrir sin esa bandera. Por eso la verificación posterior sigue
haciendo falta.
