# Dos corridas de las pruebas a la vez se pisan el directorio de trabajo

**Estado: Análisis · Creado 26-08-21.**

## Qué pasó

El 21/08/2026, con dos sesiones trabajando el mismo repo, el banco de `lint-harness` murió con `EPERM` sobre `.claude/tmp/repo-prueba-harness`. La corrida siguiente, ya sin la otra sesión encima, dio verde sin tocar una línea.

La causa es el **nombre fijo** del directorio de trabajo: `lint-harness/pruebas.js:12` resuelve `.claude/tmp/repo-prueba-harness` y lo borra y rehace en cada corrida. Dos corridas simultáneas usan el mismo directorio, y la que borra mientras la otra lee deja a la segunda sin archivos o con el directorio tomado por el sistema.

## Por qué importa más de lo que parece

El síntoma es un **rojo que no corresponde a ningún defecto**, y con la forma más engañosa: un error del sistema de archivos, que se lee como problema de máquina —permisos, antivirus, disco— y no como defecto de la prueba. Es pariente de la forma «escenario a medias» del conocimiento `controles-que-no-avisan`: lo que el caso no fabrica lo pone el entorno, y acá el entorno es *otra corrida del mismo banco*.

Y no es una rareza de este repo: `ejecutar-control-cierre` corre todas las pruebas de una pasada, así que alcanza con que alguien lo dispare desde dos terminales, o con un hook que lo lance mientras alguien lo corre a mano.

---

## Análisis (05/09/2026)

### El inventario real: 23 bancos, no dos

El plan se abrió nombrando dos bancos conocidos. El barrido completo dice que son **23 de los 27 que corren**. Solo cuatro ya usan directorio único.

Se contaron los `pruebas.js` que `ejecutar-pruebas` descubre de verdad: los de `.claude/` más los de `funcionalidades/` excluyendo `base/`, cuyos bancos son copias que nunca se ejecutan. Las copias de `base/` se arreglan solas al correr `sincronizar-base`.

**Con directorio de nombre fijo** (rutas relativas a `.claude/tmp/`):

| Banco | Directorio de trabajo hoy |
|---|---|
| `common/pruebas.js` | `prueba-identidad` |
| `comunicacion/lint-comunicacion` | `repo-prueba-comunicacion` |
| `conducta/avisar-contexto-pesado` | `pruebas-avisar-contexto` |
| `conducta/lint-conducta` | `repo-prueba-conducta` |
| `conducta/mostrar-pantalla-bienvenida` | `repo-prueba-pantalla` |
| `conocimiento/lint-conocimiento` | `repo-prueba-conocimiento` |
| `decisiones/lint-decisiones` | `repo-prueba-decisiones` |
| `herramientas/actualizar-plugins` | `repo-prueba-plugins`, `casa-usuario-prueba`, `repo-avisos-prueba` |
| `herramientas/ejecutar-control-cierre` | `repo-prueba-cierre` |
| `herramientas/ejecutar-pruebas` | `repo-prueba-corredor` |
| `herramientas/inventariar-componentes-sueltos` | `repo-prueba-inventario` |
| `herramientas/limpiar-worktree` | `pruebas-limpiar-worktree` |
| `herramientas/lint-harness` | `repo-prueba-harness` |
| `herramientas/lint-herramientas` | `repo-prueba-herramientas` |
| `herramientas/medir-contexto` | `repo-prueba-<caso>`, uno por caso |
| `herramientas/preparar-worktree` | `pruebas-preparar-worktree` |
| `herramientas/sincronizar-base` | `repo-prueba-sincronizar` |
| `planes/lint-planes` | `banco-planes` |
| `preferencias/lint-preferencias` | `repo-prueba-preferencias` |
| `semantica/lint-semantica` | `repo-prueba-semantica` |
| `subsistemas/lint-subsistemas` | `repo-prueba-subsistemas` |
| `funcionalidades/amp/skills/actualizar` | `repo-prueba-actualizador` |
| `funcionalidades/amp-preferencias/skills/registrar-preferencia/scripts` | `pruebas-incorporar-preferencia` |

**Ya con directorio único** — los moldes:

- `conducta/detectar-terminologia-vetada` — `mkdtempSync` bajo `.claude/tmp/`, **con caída a `os.tmpdir()` si ese directorio no existe**. Es la forma más completa de las tres.
- `conducta/establecer-conducta` — `mkdtempSync` en `os.tmpdir()`, y el comentario dice por qué no puede usar `.claude/tmp/`: el banco copia `.claude/` entera, y copiarla dentro de sí misma es lo que Node rechaza.
- `conducta/avisar-sesion-sin-asentar` — `mkdtempSync` en `os.tmpdir()`, por el mismo motivo más uno propio: escribiría sus marcas de sesión en el `.claude/tmp/` real y una marca de más apaga un aviso.
- `herramientas/sincronizar-recomendadas` — `mkdtempSync` en `os.tmpdir()`.

### Dos hallazgos que el plan no tenía

**1. `avisar-contexto-pesado` escribe en el directorio de marcas real del agente.** Su `DIR_MARCAS` es `.claude/tmp/avisar-contexto-pesado/`, que no es un banco: es donde el control vivo guarda las marcas de sesión del agente que está corriendo. Hoy no rompe porque fabrica ids de sesión con `Date.now()` y borra los suyos al terminar; dos corridas arrancadas en el mismo milisegundo se pisarían. Es la única prueba que escribe en material de producción y merece el mismo tratamiento aunque su probabilidad de choque sea baja: alcanza con sumarle `process.pid` al id.

**2. Con nombre único, la basura deja de barrerse sola.** Hoy el nombre fijo tiene una virtud escondida: `armar()` hace `rmSync` al arrancar, así que una corrida que muere a la mitad deja un directorio que la corrida siguiente limpia. Con nombre único eso desaparece — cada corrida abortada deja su propio directorio y nada lo vuelve a mirar. `.claude/tmp/` está gitignoreado, así que crece en silencio. **El nombre único sin limpieza garantizada es un cambio a peor**, y por eso la limpieza no es un detalle de implementación sino parte del diseño (decisión 2).

### Lo que este plan NO arregla, a propósito

El directorio único resuelve el choque **escritura contra escritura entre corridas**. Queda afuera, y conviene decirlo para que nadie lo dé por cubierto:

- **La copia tomada de un repo que se está moviendo.** Varios bancos —`lint-harness`, `medir-contexto`, `sincronizar-base`— copian `.claude/` y `funcionalidades/` del repo real para armar su escenario. Si otra sesión está editando esos archivos mientras se copia, el escenario sale a medias y el hallazgo es falso igual. No hay arreglo barato: haría falta copiar desde un commit y no desde el disco. Es raro y no justifica el costo hoy.
- **El choque contra el agente vivo.** Fuera del caso de `avisar-contexto-pesado`, ningún banco escribe en material de producción. Verificado archivo por archivo en este relevamiento.

### El worktree ya cubre una parte, pero no alcanza

Desde que existen las Herramientas `preparar-worktree` y `limpiar-worktree` (Herramientas del Agente Multipropósito Base-0009 y Base-0010), dos sesiones en worktrees distintos tienen cada una su propio `.claude/tmp/`, y el choque no ocurre — los directorios de trabajo se resuelven contra el directorio actual, no contra la ubicación del script.

No cierra el asunto por tres motivos:

- El worktree es una convención de trabajo, no un control: nadie frena a dos sesiones abiertas sobre el mismo checkout, que es exactamente el caso del 21/08.
- Los cuatro bancos que hoy usan `os.tmpdir()` **comparten directorio entre worktrees**: para ellos el worktree no aísla nada, y se salvan porque ya usan nombre único.
- `ejecutar-control-cierre` lo puede disparar un hook mientras alguien lo corre a mano, en el mismo checkout.

### El trabajo

1. **Poner un directorio único por corrida en los 23 bancos**, con la forma que resuelvan las decisiones 1 y 2.
2. **Limpiar al terminar, también cuando el banco falla.** Los bancos salen con `process.exit(1)` y algunos revientan con excepción; el `rmSync` de la última línea no cubre ninguno de esos dos caminos.
3. **Acortar el prefijo en los dos bancos de worktree.** `preparar-worktree` y `limpiar-worktree` arman el árbol más profundo del repo —`<repo>/.claude/tmp/pruebas-preparar-worktree/repo/.claude/tmp/worktrees/<nombre>/<archivo>`— y `mkdtemp` suma seis caracteres. En un checkout con ruta larga eso puede cruzar el límite de 260 de Windows, y el banco fallaría por una causa distinta de la que este plan vino a arreglar. Con `wt-prep-`/`wt-limp-` más los seis de `mkdtemp` la ruta queda más corta que hoy, así que el cambio no cuesta nada. Los casos de margen de ruta de ese banco usan rutas sintéticas fijas (`C:\r`) y no se ven afectados.
4. **Sumarle `process.pid` al id de sesión de `avisar-contexto-pesado`.**
5. **Correr `sincronizar-base --aplicar`.** Quince de los bancos tocados viajan en `base/`, y `lint-harness` compara los dos lados en ambos sentidos: sin este paso el propio control de cierre queda en rojo. Si la decisión 1 sale por el módulo compartido, `sincronizar-base` lo va a listar como **candidato** —no viaja solo— y hay que sumarlo a `base/` a mano.

### Verificación

- `node .claude/herramientas/ejecutar-pruebas/ejecutar-pruebas.js` en verde, con el mismo número de bancos que antes del cambio.
- **La prueba del problema**: dos corridas simultáneas de `ejecutar-pruebas` sobre el mismo checkout, las dos en verde. Hoy eso falla. Es el único caso que demuestra el arreglo; sin él, verde no prueba nada, que es el criterio del conocimiento `controles-que-no-avisan`.
- `.claude/tmp/` sin directorios de banco sobrantes después de una corrida completa.
- Matar un banco a mitad de camino y verificar que no deja directorio; si lo deja, la decisión 2 tiene que cubrirlo.
- `node .claude/herramientas/ejecutar-control-cierre/ejecutar-control-cierre.js --estricto` en verde.

---

## Decisiones que necesitan al usuario

### 1. ¿Un módulo compartido para armar el banco, o tres líneas repetidas en cada uno?

**Qué hay que decidir.** El cambio es el mismo en los 23 bancos: crear un directorio único y borrarlo al terminar. Puede vivir en un solo lugar o repetirse.

**Alternativa A — módulo compartido `.claude/common/banco.js`.** Expone algo como `crearBanco('lint-harness-')`, que hace el `mkdtempSync` bajo `.claude/tmp/` —con caída a `os.tmpdir()` si no existe, como ya hace `detectar-terminologia-vetada`—, acepta pedir explícitamente `os.tmpdir()` para los bancos que copian `.claude/` entera, y registra la limpieza. Cada banco cambia una línea: `const REPO_PRUEBA = crearBanco('harness-')`.

**Alternativa B — cada banco se lo escribe.** Dos o tres líneas por archivo, sin dependencia nueva.

**Consecuencias, con números.** Con A hay 1 archivo con la regla y 23 llamadas de una línea; con B hay 23 copias de la misma regla, y la parte fácil de olvidar es la limpieza en el camino de falla, que es justamente la que hace que el cambio no empeore las cosas. Si dentro de tres meses hay que cambiar dónde caen los bancos —por ejemplo, sacarlos de `.claude/tmp/`—, con A es un archivo y con B son 23, y los que se olviden no van a fallar: van a seguir funcionando en el lugar viejo, en verde, que es el modo de falla que el conocimiento `controles-que-no-avisan` cataloga.

**Costos de A que B no tiene.** `common/banco.js` es un Componente del Agente Multipropósito nuevo: viaja en `base/`, hay que sumarlo a mano cuando `sincronizar-base` lo liste como candidato, necesita su propia prueba —el conocimiento `la-carpeta-common` lo pide explícitamente para todo módulo compartido— y hay que darlo de alta en el Índice de Herramientas como `funcion`. Además, si `banco.js` se rompe, los 23 bancos se caen juntos; el contrapeso es que se caen ruidosamente, no en verde.

**Recomendación: A.** El repo ya tiene siete funciones en `common/` con el mismo argumento (`frontmatter`, `indices`, `terminos-vetados`, `enlaces-de-indices`…), y el precedente más cercano —`terminos-vetados`, plan Local-0109— es literalmente el caso de dos copias de un lector que divergieron y dejaron un control en verde sin frenar nada. Repetir la regla 23 veces es la apuesta contraria a lo que ese plan acaba de pagar.

### 2. ¿Se agrega un barrido de bancos viejos, y con qué umbral?

**Qué hay que decidir.** Con nombre único, una corrida abortada deja su directorio para siempre y nada lo borra (ver el hallazgo 2 más arriba). La limpieza al terminar cubre el camino normal y el de falla ordenada; no cubre el proceso matado, la máquina apagada ni el `EPERM` que originó este plan.

**Alternativa A — solo limpieza al terminar.** Se registra la limpieza para que corra también cuando el banco sale con código 1 o revienta. Lo que quede de un proceso matado se acumula hasta que alguien vacíe `.claude/tmp/` a mano.

**Alternativa B — limpieza al terminar más barrido por edad al arrancar.** Además, al crear un banco se borran los directorios con el prefijo del módulo que tengan más de N horas.

**Consecuencias, con números.** Cada banco pesa entre unos pocos KB y varios MB —el de `lint-harness` copia `.claude/` sin planes más `funcionalidades/` entera, que son decenas de MB. Con A, diez corridas matadas a lo largo de un mes dejan diez copias; con B, ninguna sobrevive al día siguiente. El riesgo de B es borrarle el banco a una corrida viva: no puede pasar con un umbral de 24 horas, porque el banco más lento del repo tiene un límite de 180 segundos impuesto por `ejecutar-pruebas`; sí podría pasar con un umbral de minutos.

**Contra B hay un argumento real:** es una acción destructiva automática que nadie pidió, sobre un directorio donde también viven los worktrees y el buzón de avisos. Acotarla al prefijo del módulo la hace segura, pero es código que borra archivos sin que se lo pidan.

**Recomendación: B, con umbral de 24 horas y borrando únicamente directorios cuyo nombre empiece con el prefijo que el propio módulo escribe.** Sin el barrido, el arreglo cambia un rojo ruidoso por una acumulación silenciosa, y las cosas silenciosas son las que este repo viene arreglando de a una.

### 3. ¿Se agrega un control que impida la recaída?

**Qué hay que decidir.** Arreglados los 23, nada frena que el banco número 24 nazca con un nombre fijo. El defecto no se nota hasta que dos sesiones coinciden, y cuando se nota parece un problema de máquina — que es exactamente lo que hizo que este plan tardara en abrirse.

**Alternativa A — no agregar control.** El molde queda en los cuatro bancos que ya lo tienen, más el módulo si sale la decisión 1 por A. Se confía en que el que escriba el próximo banco copie uno existente.

**Alternativa B — sumarle un chequeo a `lint-harness`.** Marcaría todo `pruebas.js` que arme una ruta de trabajo bajo `.claude/tmp/` sin pasar por el módulo (o sin `mkdtempSync`). Es un chequeo sobre el texto del código, así que es una heurística: puede marcar de más y hay que poder callarlo.

**Consecuencias, con números.** Hoy el barrido a mano encontró 23 de 27; sin control, el que haga el mismo relevamiento dentro de seis meses vuelve a barrer 27 archivos. Con el control, cada banco nuevo se marca el día que se escribe. El costo de B son unas veinte líneas en `lint-harness` más su caso bueno y su caso malo en el banco de `lint-harness`. `lint-harness` es una Herramienta del Agente Desplegado y **no viaja**, así que el control protegería a quien escribe bancos —este repo— y no a los Agentes Desplegados, que los reciben y no los escriben. Eso es correcto y no un hueco.

**Recomendación: B.** Es el mismo argumento con que el repo tiene `pruebas.js` para cada lint: un modo de falla que ya ocurrió una vez y no emite señal necesita un control, no una convención. Si molesta por marcar de más, se puede abrir en una segunda tanda después de arreglar los 23 — pero conviene decidirlo ahora para no perderlo.

---

## Para asentar en otros registros

Esta sesión corrió con la instrucción de **no escribir en ningún registro salvo el de planes**, porque los Códigos de Entrada de Índice todavía no se reservan y hay otras sesiones en paralelo. Lo que sigue es el texto propuesto, para que otro agente lo asiente con el Código que corresponda.

### Página de conocimiento — a `.claude/conocimiento/INDICE-LOCAL.md` (`Local-NNNN`)

Corresponde solo si se ejecuta el plan; el hallazgo es genérico y le sirve a cualquier Agente Desplegado, así que **evaluar si va al Índice del Agente Multipropósito** (`INDICE.md`) en vez del local.

- **Nombre:** `Un banco con directorio de trabajo de nombre fijo falla cuando hay dos corridas`
- **Descripción:** `Dos corridas simultáneas comparten el directorio, y la que lo borra deja a la otra sin archivos: el rojo llega como error del sistema de archivos y se lee como problema de máquina, no como defecto de la prueba. El nombre único sin limpieza garantizada cambia el rojo por basura silenciosa.`
- **Detalle:** `banco-con-directorio-de-nombre-fijo.md`

### Decisión — a `.claude/decisiones/INDICE.md` (`Local-NNNN`)

Corresponde solo si la decisión 1 sale por la alternativa A, o si se ratifica el molde como obligatorio.

- **Título propuesto:** `Todo banco de pruebas trabaja en un directorio único por corrida`
- **Cuerpo propuesto:** `Todo `pruebas.js` del repo arma su escenario en un directorio único por corrida (`mkdtempSync`) y lo borra al terminar, también cuando falla. Cae bajo `.claude/tmp/`, salvo los bancos que copian `.claude/` entera —que no pueden copiarla dentro de sí misma— y usan el directorio temporal del sistema. Motivo: con nombre fijo, dos corridas a la vez se pisan y el rojo llega disfrazado de error de máquina. Medido el 21/08/2026 sobre el banco de `lint-harness`.`

### Herramienta — a `.claude/herramientas/INDICE.md` (`Base-NNNN`)

Corresponde solo si la decisión 1 sale por la alternativa A. Va al Índice del Agente Multipropósito, no al local: el módulo viaja en `base/`.

- **Nombre:** `banco`
- **Descripción:** `Arma el directorio de trabajo de un banco de pruebas: único por corrida, bajo `.claude/tmp/` —o el temporal del sistema para los bancos que copian `.claude/` entera— y borrado al terminar, también cuando el banco falla. Barre los restos de corridas abortadas por prefijo y edad. Única copia del repo: la usan los 23 bancos que fabrican escenario.`
- **Tipo:** `funcion` · **Cómo se invoca:** `require('../../common/banco.js')` · **Estado:** `vigente` · **Detalle:** `[../common/banco.js](../common/banco.js)`

---

## Qué falta para dejarlo Listo

Las tres decisiones de arriba. Con la 1 y la 2 resueltas el trabajo es mecánico y está enumerado; la 3 se puede diferir a una segunda tanda sin bloquear la primera.

⚠️ Al abrir este plan, `lint-harness/pruebas.js` estaba siendo editado por otra sesión: no se tocó a propósito. Verificado el 05/09/2026 — el archivo está en su forma actual y el relevamiento de arriba lo incluye.
