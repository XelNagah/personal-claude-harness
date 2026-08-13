# ejecutar-control-cierre

Corre **todos los chequeos del repo de una pasada** y resume el resultado. Es el control que se pasa antes de cerrar una tarea o publicar: reemplaza correr ~10 comandos a mano.

```bash
node .claude/herramientas/ejecutar-control-cierre/ejecutar-control-cierre.js
```

## Qué corre

1. **Todos los lints de subsistema**, descubiertos dinámicamente: cualquier `.claude/**/lint-*/lint-*.js`, excepto las copias de prueba bajo `.claude/tmp/`. Un subsistema nuevo con su lint co-ubicado entra solo.
2. **Las pruebas de los controles**, corriendo `ejecutar-pruebas`, que descubre los `pruebas.js` co-ubicados con lo que prueban — ver abajo.
3. **El banco de `ejecutar-pruebas`** — ver abajo.
4. **`claude plugin validate .`** — validación del marketplace. Si el CLI no está disponible, lo reporta como `NO DISPONIBLE` (no como error).

## Por qué los lints no alcanzan

Un lint dice si los registros del repo están bien formados. No dice si el control que los revisa sigue funcionando: eso lo dicen las pruebas. Correr solo los lints dejaba pasar un banco en rojo sin mencionarlo, y esta Herramienta cerraba con `TODO VERDE` — el verde valía menos de lo que decía. Se descubrió el 11/08/2026, corriendo el corredor a mano después de que este control diera verde sobre un banco que fallaba.

Los puntos 2 y 3 no se pisan: el corredor **excluye su propio banco**, porque correrlo desde adentro es el manual de su modo de falla. Cada uno corre lo que el otro no puede.

## El banco que su hermana no puede correr

`ejecutar-pruebas` es el corredor de todos los bancos del repo, y su modo de falla es informar `TODO VERDE` sobre cero bancos si el descubrimiento se rompe. Su propio banco **no puede correrlo él**: un descubrimiento roto tampoco encontraría ese archivo, así que el hueco quedaría abierto con el banco en verde.

Lo corre esta Herramienta, que es otra. Así la circularidad desaparece sin inventar un piso numérico —«tienen que ser al menos dieciséis»— que envejece con solo abrir un lint más. Cada corredor prueba al otro: el banco de esta Herramienta lo corre `ejecutar-pruebas`, con el resto.

Es una **prueba**, no un lint, y el contrato es distinto: la prueba falla con código 1 y acá se reporta como un chequeo más (`OK` / `FALLA` / `NO CORRIO`), sin que esta Herramienta falle. Que el archivo no esté se reporta `AUSENTE` en vez de saltearse: es exactamente el estado que este chequeo viene a cerrar.

## Salida

Tabla chequeo → `OK` / `N HALLAZGO(S)` / `ERROR`. La salida completa se muestra **solo** de los chequeos que no están verdes. Si todo pasa: `TODO VERDE.`

## Cómo cuenta hallazgos

Heurística sobre el formato común de la familia de lints: suma los `(N)` finales de las líneas de categoría (`[1] LINKS ROTOS (2):` → 2). Un lint nuevo que respete ese formato se cuenta bien sin tocar este script.

## Los dos modos, y por qué el informativo es el predeterminado

| | Reporte | Código de salida |
|---|---|---|
| **Informativo** (predeterminado) | igual | `0`, haya rojos o no |
| **`--estricto`** | igual | `1` si algún chequeo no está verde |

El reporte es **idéntico** en los dos: lo único que cambia es el código de salida, y el banco lo controla — si la bandera cambiara además lo que se corre o lo que se informa, el guion estaría frenando por un criterio distinto del que ve el que corre a mano.

El predeterminado no falla porque esta Herramienta **describe el estado del repo, no el resultado de la corrida**. De eso depende la Pantalla de bienvenida, que la invoca en cada arranque de sesión: si saliera con 1 por su cuenta, un hallazgo del repo se leería como un error de sesión. Por lo mismo lee los totales `(N)` de la salida y no el código.

`--estricto` existe para el otro consumidor: el guion que tiene que frenar, y que no puede parsear prosa para saber si seguir. Es exactamente aditiva.

Una bandera desconocida **corta con código 2** —error de uso, distinto del `1` de hallazgos— en vez de ignorarse: un `--estrico` mal escrito corriendo en informativo le daría verde a un guion que cree estar en estricto, que es un control que deja de controlar sin avisar (conocimiento Local-0013).

> ⚠️ El «nunca falla» del comentario viejo se atribuía a la Decisión Local-0003 (*Integridad en dos capas: mecánica y semántica*), que **no lo enuncia**: fija que la capa mecánica es obligatoria para todo subsistema que persiste estado, y no habla de códigos de salida. Corregido el 13/08/2026 al ratificar la bandera.
