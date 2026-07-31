# Darle banco a las dos Herramientas que deciden qué viaja y qué está verde

**Estado: Ejecutado · Creado 26-07-31 · Cerrado 26-07-31.**

## El problema

De las Herramientas del Agente Desplegado, cinco no tienen banco de pruebas. Dos de ellas deciden cosas con consecuencia fuera de este repo, y ninguna tiene nada que verifique que sigan controlando:

- **`sincronizar-base`** decide **qué viaja** a cada Agente con Propósito. Su regla es un corte: el mecanismo se copia entero, pero un registro `origen: agente-desplegado` se copia **solo hasta el separador de su tabla**, porque las filas son de cada repo. Si ese corte se rompiera, las entradas de este repo viajarían a todos los consumidores — y ya pasó una vez, con seis Herramientas coladas en `herramientas/INDICE-LOCAL.md`. El control `UN INDICE DEL AGENTE DESPLEGADO VIAJA CON FILAS` de `lint-harness` existe por eso, pero nadie prueba el cortador en sí.
- **`ejecutar-control-cierre`** decide **qué está verde**. Es la que más corre de todo el repo: la invoca `mostrar-pantalla-bienvenida.js`, o sea en cada arranque de sesión, y el `SKILL.md` del nivelador la manda al cerrar. Si dejara de descubrir un lint, el repo se informaría verde sobre un conjunto más chico, que es exactamente el modo de falla del conocimiento `controles-que-no-avisan`.

Las dos son corredores o copiadores, no lints, así que el control de cierre no las mira: les cree.

## El trabajo

Un banco por Herramienta, co-ubicado, con la convención del repo: caso bueno y caso malo por chequeo, fixtures desechables, cierre con `casos: N` y código de salida 1 si algo falla. Y cada uno verificado **rompiendo la Herramienta a propósito**, que es lo único que dice si el banco sirve.

### `sincronizar-base`

El corte es lo que hay que probar, en los dos sentidos:

- Un archivo de mecanismo (sin frontmatter, o `origen: agente-multiproposito`) se copia **entero**.
- Un registro `origen: agente-desplegado` se copia **hasta el separador**, y sus filas **no** viajan.
- Sin `--aplicar` no escribe nada: es diagnóstico.
- Un archivo nuevo en `.claude/` aparece como pendiente de sincronizar.
- Un archivo con BOM no pierde su `origen` — la trampa ya pagada, que hace que un registro se compare como si fuera mecanismo.

### `ejecutar-control-cierre`

- Descubre los lints dinámicamente: un subsistema nuevo con su lint entra solo, sin tocar la Herramienta.
- Un lint que falla se reporta y no se lo tapa.
- Un lint que revienta se distingue de uno que encuentra hallazgos.
- El conteo que informa coincide con lo que corrió.

## Fuera de alcance

- **`inventariar-componentes-sueltos`** no lo invoca nada: nació como Frente B del plan `Que el harness tenga efecto conductual`, que sigue pendiente. Darle banco antes de saber si sobrevive a ese plan es trabajo que puede tirarse.
- **`instalar-plugins-codex`** y **`ejecutar-pruebas`** quedan para después. La primera ya la mira `lint-harness`; la segunda es el corredor mismo, y probar al que corre las pruebas con una prueba que él corre tiene un problema de fundamento que hay que pensar aparte.

## Estado

| Herramienta | Resultado |
|---|---|
| `sincronizar-base` | **hecho — 13 casos, y encontró un defecto** |
| `ejecutar-control-cierre` | **hecho — 12 casos** |

## Notas de implementación

Los dos bancos quedaron co-ubicados con su Herramienta, con la convención del repo, y los dos se verificaron **rompiendo la Herramienta a propósito** — que es lo único que dice si un banco sirve. El repo pasó de 14 bancos a 16.

### `sincronizar-base` — 13 casos

Cubre el corte en los dos sentidos (mecanismo y registro del Agente Multipropósito viajan enteros; registro del Agente Desplegado viaja hasta el separador y sin filas), que sin `--aplicar` no escribe, lo que no puede decidir solo (un archivo nuevo de `.claude/` no se suma a lo que viaja; uno que viaja y ya no está del lado vivo se reporta), y el registro sin tabla, que se reporta en vez de copiarse entero.

**Verificado rompiendo la Herramienta:** sacarle el saneo de la marca de orden de bytes hace fallar exactamente ese caso.

**Defecto encontrado y corregido: la marca de orden de bytes tapaba el `origen`.** Un `.md` guardado con ella deja de matchear `^---`, así que el archivo perdía su `origen`, se trataba como mecanismo y se copiaba **entero** — con las filas de este repo adentro, a todo consumidor que se instalara. Es la falla más cara de esta Herramienta y la más difícil de ver, porque el archivo se lee igual en cualquier editor. Ahora la marca se saca antes de parsear y también del texto que se escribe, así que lo que viaja nunca la lleva.

### `ejecutar-control-cierre` — 12 casos

Cubre el descubrimiento (los lints no están escritos en el código: uno nuevo entra solo y el conteo lo refleja), la clasificación de las tres respuestas posibles —verde, con hallazgos sumados de todas sus categorías, y **reventado**, que es un caso distinto de tener hallazgos porque uno describe el repo y el otro dice que el control no pudo mirarlo—, que muestre la salida completa de lo que no está verde, y que **reporte sin fallar**: sale con código 0 aunque haya rojos, como manda la decisión `Local-0003`. Si saliera con 1, el hook que la invoca al arrancar la sesión trataría un hallazgo del repo como un error de sesión.

Y los tres casos de no contar de más ni de menos: un lint adentro de otro lint no es un chequeo aparte, una carpeta `lint-x/` sin su script tampoco, y los lints bajo `tmp/` no se corren.

**Verificado rompiendo la Herramienta de tres formas**, cada una detectada por el caso que le toca:

- No distinguir un lint reventado de uno con hallazgos → 2 fallas.
- Descender adentro de las carpetas de lint → 1 falla.
- Dejar de descubrir en profundidad → **6 fallas**, con el conteo clavado en `1 → 1`. Es la falla de omisión que este banco existe para atrapar, y es la única que en producción no dejaría ninguna señal.

**Límite declarado adentro del banco:** el resultado de `claude plugin validate` depende del CLI instalado en la máquina y no del repo que se mira, así que el banco solo controla que aparezca como un chequeo más.

### El mismo defecto, en otros doce lectores

El fragmento que parsea el frontmatter está copiado en **trece lugares** (los ocho lints de subsistema, `lint-harness`, `establecer-conducta`, `mostrar-pantalla-bienvenida`, `amp-actualizar` y esta Herramienta), y todos usan el mismo `^---` sin sanear la marca. Medido el 31/07/2026:

- **Es latente:** hoy ninguno de los 238 `.md` del repo la tiene.
- **En el nivelador NO es destructivo**, y por una razón que conviene no perder: lee el `origen` del archivo que **viaja**, no del instalado, así que clasifica bien igual. Lo único que produce son dos marcas espurias (`encabezado viejo` y `sin frontmatter de Indice`) sobre un archivo que está sano.
- **En los lints el efecto es que un Índice declarado se lea como no declarado**, o sea ruido y, en el peor caso, un chequeo validando sobre menos de lo que cree.

Queda sin plan abierto: es un cambio mecánico en doce archivos, varios de los cuales viajan en `base/` y obligan a sincronizar y subir versión. `lint-harness` ya controla que ese fragmento no diverja entre lints, así que el arreglo tiene que entrar en todos a la vez.
