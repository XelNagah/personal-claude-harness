# Darle banco a las dos Herramientas que deciden qué viaja y qué está verde

**Estado: En curso · Creado 26-07-31.**

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
| `ejecutar-control-cierre` | pendiente |

### `sincronizar-base` — 13 casos

Cubre el corte en los dos sentidos (mecanismo y registro del Agente Multipropósito viajan enteros; registro del Agente Desplegado viaja hasta el separador y sin filas), que sin `--aplicar` no escribe, lo que no puede decidir solo (un archivo nuevo de `.claude/` no se suma a lo que viaja; uno que viaja y ya no está del lado vivo se reporta), y el registro sin tabla, que se reporta en vez de copiarse entero.

**Verificado rompiendo la Herramienta:** sacarle el saneo de la marca de orden de bytes hace fallar exactamente ese caso.

**Defecto encontrado y corregido: la marca de orden de bytes tapaba el `origen`.** Un `.md` guardado con ella deja de matchear `^---`, así que el archivo perdía su `origen`, se trataba como mecanismo y se copiaba **entero** — con las filas de este repo adentro, a todo consumidor que se instalara. Es la falla más cara de esta Herramienta y la más difícil de ver, porque el archivo se lee igual en cualquier editor. Ahora la marca se saca antes de parsear y también del texto que se escribe, así que lo que viaja nunca la lleva.

### El mismo defecto, en otros doce lectores

El fragmento que parsea el frontmatter está copiado en **trece lugares** (los ocho lints de subsistema, `lint-harness`, `establecer-conducta`, `mostrar-pantalla-bienvenida`, `amp-actualizar` y esta Herramienta), y todos usan el mismo `^---` sin sanear la marca. Medido el 31/07/2026:

- **Es latente:** hoy ninguno de los 238 `.md` del repo la tiene.
- **En el nivelador NO es destructivo**, y por una razón que conviene no perder: lee el `origen` del archivo que **viaja**, no del instalado, así que clasifica bien igual. Lo único que produce son dos marcas espurias (`encabezado viejo` y `sin frontmatter de Indice`) sobre un archivo que está sano.
- **En los lints el efecto es que un Índice declarado se lea como no declarado**, o sea ruido y, en el peor caso, un chequeo validando sobre menos de lo que cree.

Queda sin plan abierto: es un cambio mecánico en doce archivos, varios de los cuales viajan en `base/` y obligan a sincronizar y subir versión. `lint-harness` ya controla que ese fragmento no diverja entre lints, así que el arreglo tiene que entrar en todos a la vez.
