# preparar-worktree

Arma un worktree listo para que un agente trabaje adentro, y le trae lo que git no le puede llevar.

```bash
node .claude/herramientas/preparar-worktree/preparar-worktree.js <nombre>
node .claude/herramientas/preparar-worktree/preparar-worktree.js <nombre> --rama=<rama>
node .claude/herramientas/preparar-worktree/preparar-worktree.js <nombre> --desde=<commit>
node .claude/herramientas/preparar-worktree/preparar-worktree.js <nombre> --raiz-corta=D:\wt
node .claude/herramientas/preparar-worktree/preparar-worktree.js <nombre> <rutaRepo>
```

El par de esta Herramienta es [`limpiar-worktree`](../limpiar-worktree/), que borra y verifica. Lo
que comparten vive en [`../../common/worktrees.js`](../../common/worktrees.js).

## Qué le falta a un `git worktree add`

El árbol versionado y nada más. Lo que decide si el agente de adentro arranca entero es
`settings.local.json`, que **no se commitea** y es donde vive
`enabledPlugins`: sin copiarlo, el worktree arranca **sin ningún plugin habilitado y sin señal** de
que le falta algo. Esta Herramienta lo trae.

Trae **lo que git ignora, y solo eso**. Con `.claude/` versionado son los pocos archivos ignorados
de adentro; con `.claude/` gitignoreado es el árbol entero. Es la misma operación con distinto
tamaño.

Lo que está **sin commitear pero no ignorado no se copia**, aunque git tampoco lo haya llevado: el
worktree se arma desde un commit justamente para no arrastrar el trabajo a medias del repo. La
primera versión copiaba todo lo que git no había llevado, y en este mismo repo —con seis archivos
nuevos sin commitear— eso hacía además que la limpieza los leyera como escritos adentro y frenara
siempre.

## Copia, nunca enlaza

El procedimiento casero era poner adentro del worktree un enlace de Windows al `.claude/` del repo.
Al limpiar, `git worktree remove` **atraviesa el enlace y vacía el destino real** (conocimiento
Base-0007): 0 de 25 archivos, medido en el repo que reportó el daño. Sin enlace no hay nada que
atravesar y la clase entera de problema deja de existir. Copiar cuesta unos megabytes por worktree y
es todo el precio.

## Dónde cae el árbol

`.claude/tmp/worktrees/<nombre>` por omisión, y una raíz corta **solo
cuando la ruta no entra** en el límite de 260 caracteres de Windows. La Herramienta suma la ruta del
destino más la ruta relativa más larga que haya versionada en el repo; si se pasa y no se le indicó
`--raiz-corta`, no arma nada y dice cuánto daba. Cuando cae a la raíz corta, **dice por qué**: el
rodeo queda como excepción medida, no como criterio suelto.

## Reconciliación (idempotencia)

Re-correr sobre un worktree ya armado no rompe nada: informa `ya estaba` y completa lo que falte
copiar. Si git lo registraba y en disco no está, limpia el registro y lo rearma. Si el destino
existe en disco y git **no** lo registra como worktree, no pisa nada y sale con 1.

## Salida

Secciones `[ÁRBOL]`, `[.claude/]` y `[VERIFICACIÓN]`. Sale con 1 si no pudo dejarlo armado y
completo — es una acción, no un chequeo.
