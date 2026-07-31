# ejecutar-pruebas

Corre de una pasada **todas las pruebas de los controles** del repo y resume verde o fallas.

```bash
node .claude/herramientas/ejecutar-pruebas/ejecutar-pruebas.js [rutaRepo]
```

## Por qué existe, al lado de `ejecutar-control-cierre`

Las dos Herramientas contestan preguntas distintas, y hacen falta las dos:

- **`ejecutar-control-cierre`** — ¿el repo está bien? Corre los lints y les cree.
- **`ejecutar-pruebas`** — ¿los controles que contestan eso siguen funcionando?

La segunda existe porque la primera no puede detectar su propio punto ciego. El conocimiento [`cambiar-la-forma-de-un-registro`](../../conocimiento/cambiar-la-forma-de-un-registro.md) lo midió: de **once** roturas de un control, **ocho no emitieron ninguna señal** — el control seguía contestando en verde porque había pasado a validar sobre un conjunto vacío. Un control sin prueba no avisa cuando deja de controlar.

Ese mismo conocimiento fija el remedio que esta Herramienta hace corrible: **una prueba por control, con caso bueno y caso malo**. Sin el caso malo, un control que no hace nada pasa por sano; sin el caso bueno, no se detecta el falso positivo.

## Cómo descubre las pruebas

Cualquier archivo `pruebas.js` co-ubicado con lo que prueba —misma convención que los lints— en **dos raíces**: `.claude/` y `funcionalidades/`. No hay lista que mantener: una prueba nueva se corre sola con solo existir.

`funcionalidades/` entra porque ahí vive código propio que ninguna otra raíz alcanza —hoy `amp-actualizar.js`, el motor del nivelador—, y un banco que no se corre es lo mismo que no tenerlo: existe, el repo informa todo verde, y nadie miró.

De esa segunda raíz se excluye **`base/`**, y no por ruido incidental: sus `pruebas.js` son *copias* de las de `.claude/`, que ya corren por la primera raíz, y `lint-harness` compara los dos lados en ambos sentidos. Correrlas de nuevo no controla nada nuevo — solo llevaría el conteo de trece a veintiséis con doce duplicados adentro, y un tablero inflado de duplicados es un tablero que se deja de leer.

Se excluyen además `tmp/`, `node_modules/`, `.git/` y los respaldos del nivelador.

El nombre que se muestra sale del script que la prueba acompaña, y si no se puede saber, de la carpeta que la contiene. Para un lint las dos formas coinciden (`lint-planes/lint-planes.js`); donde no coinciden es en `funcionalidades/`, y ahí la carpeta sola diría «actualizar», que no nombra nada.

## Contrato de una prueba

Un `pruebas.js` **sale con código 0 si todo pasó y 1 si algo falló**. Es lo contrario de los lints, que reportan y nunca fallan (decisión `Local-0003`): un lint que encuentra algo describe el estado del repo, mientras una prueba que falla dice que un control está roto. Por eso acá el código de salida sí manda, y esta Herramienta también sale con 1.

Si además la prueba imprime `casos: N` o `(N casos)`, se muestra el conteo. Es informativo: la autoridad sobre pasa o falla es el código de salida.

## Qué NO hace

- **No viaja a los Agentes Desplegados.** Las pruebas son control de calidad del Agente Multipropósito: verifican que los controles que este repo publica funcionen, y quien los instala los recibe ya verificados. Mismo trato que `lint-harness`.
- **No reemplaza al control de cierre.** Corren juntas: primero las pruebas (¿los controles sirven?), después el control de cierre (¿el repo está bien?).

## Verificar que una prueba sirva

Una prueba que nunca falla no prueba nada. Para confiar en ella hay que romper el control a propósito y ver que la prueba avise; después restaurarlo. Así se verificaron las dos primeras: se le quitó a `detectar-terminologia-vetada` la exención por comillas y el filtro de `.md`, de a uno, y en los dos casos falló el caso que correspondía y solo ese.

El banco de `amp-actualizar` se verificó igual, con dos roturas: apagar el chequeo de `identidad.md` hizo fallar ese caso y solo ese; hacer que los registros del Agente Desplegado se comparen como si fueran mecanismo hizo fallar tres, y el detalle mostró el daño que evita — el glosario del repo marcado como `contenido viejo`, o sea el nivelador proponiendo pisar el Aprendizaje.
