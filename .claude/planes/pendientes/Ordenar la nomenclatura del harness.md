# Ordenar la nomenclatura del harness

**Estado: Nuevo · Creado 26-07-28.** Origen: al ir a arreglar la estructura de `preferencias` apareció que el vocabulario con el que hay que escribirla está desordenado, y no en un punto: en varios a la vez.

## El problema

El harness lleva meses de sesiones donde el agente nombró cosas sobre la marcha. El resultado no es un término mal puesto: es un **conjunto de nombres que no cierran entre sí**, y cada vez que hay que escribir un texto nuevo la discusión se reabre y se lleva la sesión puesta.

Este plan agrupa todo ese desorden para resolverlo de una, en vez de corregir dos nombres por sesión y volver a chocar con el resto la vez siguiente.

## Lo que está desordenado

### 1. La palabra `registro` significa tres cosas distintas

| Sentido | Dónde se ve | Apariciones |
|---|---|---|
| **El archivo que lista** | `TERMINOLOGIA-FARLOPA.md` abre con *"Registro par del glosario"*; el manifiesto de planes dice *"`PLANES.md` es el registro más pesado del repo"*; `herramientas/INDICE.md` abre con *"Registro de las Herramientas del repo"* | 403 en texto vivo, más 108 en planes cerrados que el control excluye |
| **Una línea de un índice** | El sentido que el autor le quiere dar. Hoy esa línea se llama `Entrada`, término que acuñó el agente | 223 de `Entrada`, en 11 archivos, incluidos dos lints y la `PLANTILLA` que viaja |
| **Estado de sesión de una Herramienta** | La fila `Registro volátil` del glosario, acuñada por el agente en la decisión 0020 para `sessions.json` | 4, cero uso operativo |

Propuesto, nada ratificado:

- El archivo pasa a llamarse **`índice`**, que ya es el nombre de 4 de los 9 en disco (`INDICE.md`).
- La línea pasa a llamarse **`Registro`**, sin fila en el glosario: es sentido corriente del castellano y el criterio de [Criterio de pertenencia al glosario](Criterio%20de%20pertenencia%20al%20glosario.md) es que el glosario no es un diccionario.
- **`Registro volátil` se elimina** del glosario, no se renombra: nombra algo que ya se dice *"contenido interno de la Herramienta"*, el reemplazo ratificado cuando se vetó `tripa`. Es el punto más barato y el único independiente de los otros.
- **Sin resolver:** si `Entrada` se borra del glosario o queda como otra forma de decir lo mismo. Si queda, las 223 apariciones siguen siendo válidas y no se toca ninguna; si se borra, se suman al barrido, más dos lints y la `PLANTILLA` que viaja.

**Actualizado el 29/07/2026 por la decisión 0042, que cierra dos de los tres sentidos:**

- **`Registro` queda tomado para la colección**, no para la línea: es el mecanismo que el plan `Subsistema de Registros genérico` diseña, con el nombre `Registro Multipropósito`. La propuesta de arriba —usar `Registro` para la fila— **queda descartada**: chocaría con un uso que ya está en dos planes y en la conversación del autor.
- **La fila sigue siendo `Entrada`**, ahora asentada como `Entrada de Índice de Subsistema`. Sus 223 apariciones no se tocan.
- **El archivo se llama `Índice de Subsistema`**, también asentado. No es «el archivo que lista» a secas: es el que lista los elementos **de un subsistema**, y esa precisión lo separa de un Registro cualquiera.

**Cerrado el 02/08/2026:** `Registro volátil` se retiró del glosario y sus usos se barrieron. Los tres sentidos de `registro` quedan resueltos.

### 2. `Agente desplegado` se escribía de dos maneras — resuelto el 29/07/2026

El glosario lo asentaba con minúscula (`Agente desplegado`), mientras que los otros dos conceptos de la misma familia van con mayúscula (`Agente Multipropósito`, `Agente con Propósito`), igual que los encabezados ratificados el 28/07/2026.

**Ratificado: mayúscula**, con el criterio general que dio el autor — *una entidad o un concepto importante se escribe con mayúscula, como un nombre propio*. Corregidos la entrada del glosario, su definición y las dos citas en planes vivos. El criterio es candidato a preferencia: hoy no está escrito en ningún lado y aplica a todo el vocabulario del repo, no solo a este término.

### 3. `Base` quedó con dos sentidos, deliberadamente

Se evaluó y **no** se vetó la palabra sola (28/07/2026): además de ser corriente (`base de conocimiento`), nombra legítimamente la parte no-aprendida de un Agente con Propósito, y el glosario la usa así en tres definiciones (`Agente Multipropósito`, `Agente con Propósito`, `Aprendizaje`). Lo que sí se vetó son las etiquetas de origen: `Herramientas Base`, `Reglas Base`, `preferencias Base`, `piezas Base`.

Queda abierto si esa segunda mitad merece nombre propio. Ponerle uno obliga a redefinir las tres entradas del glosario.

## Cómo matchea el lint (verificado el 28/07/2026)

Dato que condiciona cualquier decisión de este plan. `lint-semantica.js:169` y `:176` usan `new RegExp('\\b' + término + '\\b', 'i')`: palabra completa, **insensible a mayúsculas**.

- No distingue `Base` de `base`. Vetar la palabra sola marcaba **673 apariciones**, casi todas válidas — y un registro que marca todo entrena a ignorarlo.
- La etiqueta entera sí funciona: `Herramientas Base` no matchea `base de conocimiento`.
- La primera celda del registro admite varios términos separados por ` / ` (`splitFarlop`), así que una fila puede vetar un grupo entero.

**Criterio que sale de ahí: no vetar palabras corrientes; vetar la etiqueta exacta que hay que cambiar.**

## Nombres ya recorridos y descartados

Quedan asentados para no volver a proponerlos:

- **`polo`** — para cada grupo de registros según su origen. Lo introdujo el agente el 28/07/2026 mientras se discutía justamente no acuñar términos. Cero apariciones en el repo.
- **`Estado volátil`** y **`agente instalado`** — ídem, misma conversación, nunca llegaron a un archivo.
- **`Registro del Agente Multipropósito` / `Registro del Agente Desplegado`** como par de sustantivos — dejaría los tres índices con el mismo encabezado, sin decir qué hay adentro.
- Para los dos orígenes: **`Generales/Particulares`** (nombra la extensión, no el origen), **`del Propósito`** (falso para preferencias: de las 4 adaptaciones actuales, 3 son gusto del autor que vale en todos sus repos), **`de este repo`**, **`Propias`** (*¿propias de quién?*), **`Locales`** (choca con el alcance `local` de la decisión 0035, que significa por máquina y sin commitear).

## Lo ya resuelto, para no reabrirlo

Ratificado y asentado el 28/07/2026 en `TERMINOLOGIA-FARLOPA.md`: las etiquetas de origen se dicen `del Agente Multipropósito` y `del Agente Desplegado`. `Base` sola y `del Propósito` sola quedan legítimas. El barrido de esas ~100 apariciones es trabajo del plan [Partir los índices por origen y pasar preferencias a tabla](Partir%20los%20indices%20por%20origen%20y%20pasar%20preferencias%20a%20tabla.md).

## Advertencia de alcance

**Nada de esto arregla algo roto.** Hoy `Entrada` se usa consistente en sus 223 apariciones y no confunde a nadie; `registro` con sentido de archivo se entiende. Es un trabajo de coherencia, y cuesta un barrido de 626 reemplazos sobre texto que además viaja a cada Agente Desplegado. Vale la pena hacerlo **entero y de una**, no de a dos nombres por sesión.

## El trabajo

1. Cerrar las decisiones abiertas de arriba, **una por vez y ratificada**, antes de tocar texto.
2. Asentar altas y retiros en `semantica/`, con el texto exacto a la vista y aprobación fila por fila.
3. Barrer el texto vivo. El lint marca por término y el agente juzga cada aparición: no es reemplazo ciego.
4. Actualizar los lints y la `PLANTILLA` que llevan los términos viejos.
5. Propagar a lo que viaja y verificar con `lint-harness`.

⚠️ Al medir, `grep -i` con patrones acentuados devuelve cero en silencio en Git Bash: enumerar variantes sin `-i` (conocimiento [grep y acentos en Windows](../../conocimiento/grep-y-acentos-en-windows.md)).

## Cruces

- **[Partir los índices por origen y pasar preferencias a tabla](Partir%20los%20indices%20por%20origen%20y%20pasar%20preferencias%20a%20tabla.md)** — el plan de estructura. **No** depende de este.
- **[Revisar la nomenclatura de los subsistemas](Revisar%20la%20nomenclatura%20de%20los%20subsistemas.md)** — mismo eje; conviene absorberlo o cerrarlo contra este.
- **[Criterio de pertenencia al glosario](Criterio%20de%20pertenencia%20al%20glosario.md)** — el criterio que zanja qué entra al glosario y qué es castellano corriente.
- **[Barrer la terminologia vetada del Producto](Barrer%20la%20terminologia%20vetada%20del%20Producto.md)** — el barrido de este plan alcanza también al Producto.
