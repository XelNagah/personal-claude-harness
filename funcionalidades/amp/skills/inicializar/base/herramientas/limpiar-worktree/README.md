# limpiar-worktree

Borra un worktree y **verifica que lo borrado sea lo que se quería borrar**.

```bash
node .claude/herramientas/limpiar-worktree/limpiar-worktree.js <nombre|ruta>
node .claude/herramientas/limpiar-worktree/limpiar-worktree.js <nombre> --rama=borrar
node .claude/herramientas/limpiar-worktree/limpiar-worktree.js <nombre> --forzar
node .claude/herramientas/limpiar-worktree/limpiar-worktree.js --listar [rutaRepo]
```

El par de esta Herramienta es [`preparar-worktree`](../preparar-worktree/), que arma. Lo que
comparten vive en [`../../common/worktrees.js`](../../common/worktrees.js).

## No usa `git worktree remove`

Ese comando en Windows **atraviesa los junctions**: entra por el enlace y borra del otro lado, y su
`Permission denied` significa «borré hasta acá», no «no borré nada». Es el daño que motivó las dos
Herramientas, y está asentado en el conocimiento Base-0007.

| Forma de limpiar | Archivos del destino real que sobrevivieron |
|---|---|
| `git worktree remove` | 0 de 25 |
| `Remove-Item -Force` sobre el enlace y después `git worktree remove` | 0 de 25 |
| Borrado recursivo de Node (`fs.rmSync`) | 25 de 25, dos veces |

Acá se borra con `fs.rmSync` y después se corre `git worktree prune`, que solo toca el registro. El
banco de pruebas rearma ese escenario —repo, worktree y enlace— en cada corrida: un banco que
probara solo el camino feliz dejaría sin cubrir justo la condición por la que la Herramienta existe.

## Qué mira antes de borrar

1. **Enlaces adentro del árbol.** Se informan aunque el borrado de Node no los atraviese: una
   instalación que venía armando worktrees a mano puede tener uno, y el estado sucio se ve, no se
   supone.
2. **Escrituras en el `.claude/` del worktree.** Si el agente escribió ahí, **frena y no borra
   nada**: eso se pierde al borrar el árbol y puede ser Aprendizaje real. Con `--forzar` se respalda
   en `.claude/.respaldo-amp/<fecha>/worktree-<nombre>/` antes de borrar, siguiendo el patrón que
   el actualizador ya usa: lo que se pisa se guarda antes.

   Lo versionado se lo pregunta a **git** (`status`), nunca comparando bytes contra el repo: con
   `core.autocrlf` prendido —el valor por omisión en Windows— el checkout convierte los fines de
   línea, y una comparación byte a byte marca como escrito **cada** archivo versionado. Medido en el
   banco: la limpieza frenaba siempre, y un control que marca todo entrena a ignorarlo. Lo no
   versionado —lo que la otra Herramienta copió— sí se compara byte a byte, que además es el único
   camino que queda cuando `.claude/` entero está gitignoreado.

## Verifica siempre

Después de borrar compara el `.claude/` del repo contra el listado que tomó antes, chequea que el
árbol ya no esté y que git no lo siga registrando. Un fallo de borrado es **estado sucio a
revisar**, nunca un no-evento: en el repo que reportó el daño se descubrió siete minutos tarde
porque un `Permission denied` se leyó como «no borró nada».

La verificación la hace la propia Herramienta y no un subagente: comparar dos listados no es un
recorrido de volumen.

## La rama

Se conserva por omisión. Con `--rama=borrar` se borra si está integrada; si tiene trabajo sin
integrar, lo dice y no la toca — salvo que se agregue `--forzar`.

## Reconciliación (idempotencia)

Un worktree que git registra y en disco ya no está se limpia igual: solo se poda el registro. Un
nombre que no existe sale con 1 y no borra nada.

## Salida

Secciones `[ANTES]`, `[ENLACES]`, `[ESCRITURAS]`, `[BORRADO]`, `[REGISTRO]`, `[RAMA]`, `[DESPUÉS]` y
`[VERIFICACIÓN]`. Sale con 1 si no borró o si la verificación encontró algo.
