# Paralelizar planes en worktrees es casero y en Windows borra el .claude del repo

**Estado: Ejecutado · Creado 26-09-04 · Cerrado 26-09-04.**

**Origen:** pedido del Agente Desplegado `sicape-backend` (backend Java del sistema SICAPE), traído
por el usuario el 04/09/2026. El repo del front del mismo sistema usa el mismo patrón casero, así
que el agujero ya está replicado en al menos dos instalaciones.

## Qué se pide

Un mecanismo del Agente Multipropósito para **paralelizar planes en worktrees, que cubra armar y
limpiar**, y donde la clase entera de problema no exista. Hoy cada instalación arma sus worktrees y
sus enlaces a mano, con el criterio del agente que le tocó ese día, y **el daño no ocurre al armar
sino al limpiar**, que es el momento en que ya nadie está mirando.

## Qué pasó en el repo que lo pide, con la causa verificada

El procedimiento casero era: `git worktree add` a `D:\wt\<plan>`, y adentro de cada worktree un
junction de Windows `\.claude` apuntando al `.claude/` real del repo principal, para que los tres
agentes compartieran preferencias, planes y conocimiento sin copiarlos.

Al terminar, la limpieza fue `git worktree remove` sobre los tres. Los tres devolvieron
`Permission denied` (un daemon de Gradle tenía locks sobre `build/`). El agente lo leyó como «no
borró nada» y siguió. Siete minutos después, un hook falló con `MODULE_NOT_FOUND`: se habían
perdido `.claude/.git`, `.claude/comunicacion/`, `.claude/conducta/` y `.claude/conocimiento/`.

**`git worktree remove` atraviesa el junction y borra el contenido del destino real.** Git en
Windows no lo reconoce como enlace: entra y vacía lo que hay del otro lado.

Lo reprodujeron con un repo, un worktree y un junction armados igual, sobre un destino de prueba de
25 archivos en 5 subcarpetas:

| Variante | Destino real |
|---|---|
| `Remove-Item -Recurse -Force` sobre el worktree | 25 de 25 intactos (repetido dos veces) |
| `git worktree remove` | 0 de 25 |
| `Remove-Item -Force` (sin `-Recurse`) sobre el junction, después `git worktree remove` | 0 de 25 |

Tres cosas que salen de ahí y que conviene no volver a descubrir:

- **`Remove-Item -Recurse -Force` es inocente.** La primera versión del diagnóstico lo culpaba a él
  y recomendaba «preferí `git worktree remove`»: la salvaguarda escrita dirigía al comando que
  había hecho el daño. Estuvo así un día.
- **El rodeo «sacá el junction primero con `Remove-Item -Force` sin `-Recurse`» no funciona.** Sobre
  un junction que apunta a un directorio no vacío, pide confirmación, y en modo no interactivo
  aborta sin sacar nada; después git lo atraviesa igual. Lo que sí funciona:
  `[System.IO.Directory]::Delete($ruta, $false)` o `(Get-Item $ruta -Force).Delete()`.
- **Un `Permission denied` de git no significa «no borré nada».** Significa «borré hasta acá y me
  trabé». Lo perdido fue un tramo alfabético consecutivo que se cortó antes de `decisiones/`: la
  firma de un recorrido interrumpido.

## Por qué el arreglo local no alcanza

Ese repo corrigió su página de conocimiento, su regla de conducta y su procedimiento. Eso lo
protege a él. El mecanismo sigue siendo casero en cada instalación. Además, `.claude/` está
gitignoreado por diseño: un borrado no deja rastro en `git status` del repo principal y no hay
`git checkout --` que lo deshaga. Allá lo resolvieron recreando un `.claude/.git` local sin remoto,
también artesanal.

## Lo verificado en este repo el 04/09/2026

Las mediciones de arriba son del repo que pide, sobre PowerShell. Estas son de acá, en Node 24.14.1
sobre Windows 11, con un junction real hacia un destino de 25 archivos en 5 subcarpetas:

| Forma de borrar | Destino real |
|---|---|
| `fs.rmSync(junction, {recursive, force})` | 25 de 25 intactos |
| `fs.rmSync(worktree entero, con el junction adentro)` | 25 de 25 intactos |
| `fs.unlinkSync(junction)` / `fs.rmdirSync(junction)` | 25 de 25 intactos |
| `git worktree remove` (medido allá) | 0 de 25 |

**Node no atraviesa el junction.** `lstat()` lo devuelve como `isSymbolicLink=true` y
`isDirectory=false`, así que el recorrido recursivo lo desarma en vez de entrar. El que atraviesa es
`git worktree remove`, no el borrado recursivo.

Probado además el ciclo completo en un repo de laboratorio:

- `git worktree add` trae el `.claude/` versionado solo, sin copiar ni enlazar nada.
- `fs.rmSync` del árbol más `git worktree prune` deja el registro de git consistente y el `.claude/`
  original intacto.
- **La rama sobrevive al `prune`**: si no se la quiere, hay que borrarla aparte. El pedido no lo
  anotaba.
- Con un archivo abierto por otro proceso Node, `fs.rmSync` igual borró todo (libuv abre con
  `FILE_SHARE_DELETE`). **No probado contra una JVM**, que puede abrir sin esa bandera: por eso la
  verificación posterior sigue haciendo falta.

Y sobre la longitud de ruta, que allá era el motivo de la raíz corta: **acá pasa lo mismo**. La raíz
del repo mide 51 caracteres y la ruta relativa más larga 127, o sea 179 de los 260 del límite. El
directorio de scratchpad de la sesión mide 150 de base y daría 278.

## El acuerdo

Este plan entrega el **ciclo de vida de un worktree** —armar, aislar, limpiar y verificar—,
invocable por comando, que no depende de `ejecutar-plan` (plan Local-0043) ni de `avanzar-planes`
(plan Local-0119). Los dos están en `Nuevo`, y el daño ya ocurrió y está replicado en dos
instalaciones: el arreglo no espera detrás de ellos. El plan Local-0119 lo consume después y
conserva lo suyo — la reserva de códigos, la cola de decisiones y el control de cierre sobre el
árbol integrado.

**Son dos Herramientas y un módulo común**, ratificado el 04/09/2026: `preparar-worktree` arma y
`limpiar-worktree` borra y verifica. Se separan porque son dos momentos distintos —uno al empezar el
trabajo, otro al terminarlo— y un solo verbo dejaba la punta riesgosa fuera del nombre: una
Herramienta llamada `preparar-` que además borra árboles enteros no dice lo que hace, y es
justamente el borrado el que causó el daño que este plan repara. El código que comparten —el cálculo
de margen de ruta, el listado de worktrees y la verificación del resultado— vive en
`.claude/common/worktrees.js`, que es donde la Decisión Local-0049 pone el código que necesitan dos
o más y que nadie invoca por comando. Las cinco reglas de abajo valen para las dos: la 1 es de
`preparar-worktree`, la 2, la 3 y la 4 de `limpiar-worktree`, y la 5 alcanza a todo.

Cinco reglas fijadas al analizar:

1. **Copiar, nunca enlazar.** La Herramienta trae al worktree lo que git no llevó: si `.claude/`
   está versionado son tres archivos ignorados, y de esos el que importa es `settings.local.json`
   —por la Decisión Local-0035, `enabledPlugins` vive ahí y no se commitea, así que sin copiarlo el
   worktree arranca sin ningún plugin habilitado y **sin señal**—; si `.claude/` está gitignoreado,
   son los 6,1 MB completos. Es la misma operación con distinto tamaño. Como no se crea ningún
   enlace, la clase entera de problema deja de existir.
2. **La limpieza no usa `git worktree remove`.** Borra el árbol con `fs.rmSync` recursivo, corre
   `git worktree prune` y decide aparte qué hace con la rama. Nada de esto necesita PowerShell ni
   `.NET`: se resuelve en Node nativo, como pide la Decisión Local-0047.
3. **Verificar siempre después de borrar, y la verificación la hace la propia Herramienta.**
   Comparar el listado real contra el de antes y mirar `git status` no es un recorrido de volumen,
   así que no corresponde delegarlo a un subagente por la Decisión Local-0060. Un fallo de borrado
   es **estado sucio a revisar**, nunca un no-evento: allá el daño se descubrió siete minutos tarde
   porque un `Permission denied` se leyó como «no borró nada».
4. **El agente que corre en un worktree no escribe en su `.claude/`**, y la limpieza avisa si
   detecta escrituras antes de borrar. No queda librado a la disciplina. El motivo no es la copia
   sino la reserva de códigos, que todavía no existe: dos worktrees que registran una entrada a la
   vez eligen los dos `máximo + 1`, y git mergea las dos filas sin conflicto porque son dos líneas
   distintas al final de la misma tabla. Medido en el plan Local-0119 sobre los lints de este repo,
   lo detectan `planes`, `decisiones`, `herramientas`, `preferencias`, `subsistemas` y
   `comunicacion`, y **no lo detectan `conocimiento` ni `semantica`**. El plan Local-0119 puede
   levantar esta restricción cuando tenga la reserva.
5. **La Herramienta es Base** y viaja a todo Agente Desplegado: paralelizar planes le sirve a
   cualquier Propósito y no es una elección personal del autor, así que pasa el filtro de la
   Decisión Local-0048 y no la frena la Local-0053. Va al `INDICE.md` de Herramientas del Agente
   Multipropósito, por la Decisión Local-0032. **No** va a `.claude/common/`: la Decisión Local-0049
   reserva esa carpeta para código que no se invoca, y esta se invoca por comando.

## Dónde va el worktree

La regla acordada: **`.claude/tmp/` por omisión, y una raíz corta solo cuando la ruta no entra.** La
Herramienta calcula la ruta candidata contra la relativa más larga del repo; si el total pasa el
límite de 260 de Windows, cae a una raíz corta configurable y **dice por qué**.

Así la Preferencia Local-0003 (*Guardar los archivos temporales en `.claude/tmp/`*) sigue siendo la
norma y el rodeo queda como excepción medida, no como criterio suelto. Verificado el 04/09/2026 que
`.claude/tmp/` no rompe ningún control: `lint-conocimiento` y `lint-semantica` excluyen `tmp` en
cualquier nivel por lista, `inventariar-componentes-sueltos` lo descarta por `git check-ignore`, y
los bancos de prueba de `medir-contexto` y de `inventariar-componentes-sueltos` ya arman repos de
prueba ahí adentro. Con un nombre de worktree corto, acá da 204 de 260.


## Notas de implementación

Ejecutado el 04/09/2026. Salió como el acuerdo lo fijaba, con dos correcciones de diseño que
aparecieron recién al usar las Herramientas contra este repo, no al escribirlas.

**Lo que se construyó:**

- `.claude/common/worktrees.js` — calcula la ubicación contra el margen de ruta, lista los worktrees
  de git, inventaría y compara los dos `.claude/`, halla enlaces sin atravesarlos y verifica el
  borrado. No crea ni borra: eso es de las Herramientas.
- `.claude/herramientas/preparar-worktree/` — arma, completa y verifica. Reconciliable: re-correr
  informa `ya estaba`, rearma un registro huérfano y se niega a pisar una carpeta ocupada.
- `.claude/herramientas/limpiar-worktree/` — mira enlaces y escrituras, borra con `fs.rmSync`, poda
  el registro, decide sobre la rama y verifica contra el inventario previo. `--listar` de yapa.
- Dos bancos con escenario sintético: 24 casos cada uno, los dos en verde. El de `limpiar-worktree`
  rearma el caso que causó el daño —repo, worktree y junction real— y verifica que el destino del
  enlace conserve sus 25 archivos.
- Tres filas Base en el Índice de Herramientas, la copia a `base/` y `sincronizar-base` corrido. La
  versión del plugin ya venía subida a 0.61.0 y no se volvió a tocar: 0.61.0 todavía no se publicó.

**Las dos correcciones que el uso reveló:**

1. **Copiar «lo que git no llevó» era la regla equivocada; la correcta es «lo que git ignora».** La
   primera versión copiaba también lo que estaba sin commitear, y al probarla contra este repo —con
   seis archivos nuevos sin commitear— el worktree se llevó el trabajo a medias, y después la
   limpieza lo leyó como escrito adentro y frenó. Arrastrar el trabajo sin commitear además
   contradice que el worktree se arme desde un commit.
2. **Comparar el `.claude/` byte a byte marcaba como escrito cada archivo versionado.** Con
   `core.autocrlf` prendido —el valor por omisión en Windows— el checkout del worktree convierte los
   fines de línea. Lo detectó el banco: 4 casos en rojo y la limpieza frenando siempre. Ahora lo
   versionado se lo pregunta a git (`status`) y solo lo no versionado —lo que la Herramienta copió
   con `copyFileSync`— se compara byte a byte, que es además el único camino cuando `.claude/` entero
   está gitignoreado.

**Terminología, resuelta antes de programar:** `worktree` entró al glosario como el término
Local-0040 y `copia de trabajo` quedó vetada para ese significado (relación Local-0050), con sus
siete apariciones barridas.

**Lo que queda afuera:** cuántos worktrees a la vez —la cuestión abierta 2— sigue sin medir y la
hereda el plan Local-0119, que es quien consume estas Herramientas.
## Alcance del trabajo

- La Herramienta: armar, completar lo que git no llevó, limpiar, verificar y reportar.
- El cálculo de margen de ruta y la caída a raíz corta con aviso.
- La detección de escrituras en el `.claude/` del worktree antes de borrar.
- El respaldo antes de tocar y el reporte al final, siguiendo el patrón que la Decisión Local-0028
  ya fijó para el actualizador.
- Banco de pruebas propio con escenario sintético, incluido el caso del junction preexistente: una
  instalación que ya venía armando worktrees a mano puede tener uno.
- Los nombres `preparar-worktree` y `limpiar-worktree`, en verbo más objeto (Decisión Local-0015) y
  ratificados el 04/09/2026 (Decisión Local-0016), con el módulo común `.claude/common/worktrees.js`.
- Su fila en el Índice de Herramientas del Agente Multipropósito, `sincronizar-base` y la versión
  del plugin.

## Lo que queda abierto

1. **Cómo se llama esto en español — resuelto el 04/09/2026.** Se corrió `converger-terminologia` y
   el usuario ratificó **`worktree`**, que entró al glosario como el término Local-0040: se conserva
   en inglés porque es el nombre del subcomando de git y aparece literal en todo texto que lo
   mencione. `copia de trabajo`, que el plan Local-0119 venía usando sin ratificar, quedó vetada
   para este significado (relación Local-0050) porque es la traducción histórica de *working copy* y
   se confundía con «árbol de trabajo», el canónico de la relación vetada Local-0045 para otra cosa
   —los archivos del repo en disco—. Sus siete apariciones ya se barrieron. La Herramienta se nombra
   `<verbo>-worktree`.
2. **Cuántos worktrees a la vez.** Ninguna medición dice si el rendimiento sube lineal o si el merge
   se come la ganancia; lo hereda del plan Local-0119 y no bloquea a la Herramienta.

## Lo que se decidió no hacer

**No se adoptan la Herramienta de recuperación desde las transcripciones de sesión que ofrece
`sicape-backend` ni el repo local sin remoto dentro de `.claude/`.** Con la Herramienta copiando en
vez de enlazar, el daño de esta clase deja de ocurrir, así que la red de reparación pierde su
motivo. Queda anotado el riesgo asumido: si `.claude/` se pierde por otra vía, no hay nada que lo
deshaga. **No hace falta contestarle nada al repo que las ofreció:** el conocimiento Base-0007 viaja
en la Base, así que se entera al actualizar su Agente Multipropósito.

Las cuestiones abiertas 1, 2, 3, 5, 6 y 7 del pedido original quedaron cerradas al analizar: la 1 y
la 3 por el acuerdo, la 2 porque sin enlaces no hay symlink de Linux ni macOS que probar, la 5 y la
7 por medición, y la 6 por la Decisión Local-0049.

## Relación con otros planes

- El plan **Local-0119** (*Hacer avanzar varios planes a la vez hasta la próxima decisión del
  usuario*): consume esta Herramienta. Ahí viven la reserva de códigos, la cola de decisiones y el
  control de cierre sobre el árbol integrado.
- El plan **Local-0043** (*Habilidad de ejecución de planes*): le falta cómo se comporta dentro de
  un worktree, y esta Herramienta le da la respuesta.
- El plan **Local-0081** (*Mudar los subsistemas de `.claude` a `.amp`*): ataca el mismo dolor de
  fondo —un `.claude/` frágil y a veces gitignoreado— por otra vía. No hay dependencia, pero si se
  ejecuta cambia qué carpeta copia esta Herramienta.

## Contexto de dónde salió

El registro del incidente, con la línea de tiempo completa y las pruebas, está en
`.claude/conocimiento/incidente-borrado-de-claude-por-junction.md` del repo `sicape-backend`. Ese
repo es un Agente Multipropósito Conocido: si al ejecutar hace falta el detalle, se le pregunta en
vez de reconstruirlo.
