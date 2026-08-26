# La documentación de conducta explica mal lo que tiene que explicar

**Estado: Análisis · Creado 26-08-26.** Origen: el usuario, tras cuatro intentos seguidos de que le explicaran el subsistema y ninguno entendido — *«Me parece que hay que revisar todo ese mecanismo y subsistema para dejar todo más claro. Eso de que ocurre todo en el mismo momento sigo sin entenderlo, y eso no es bueno.»*

## El problema

El subsistema `conducta` no se puede entender leyéndolo. Cuando el agente logra explicarlo es parafraseándolo con palabras llanas, y eso está prohibido por la Preferencia Base-0010 (Nombrar y explicar el dominio en español) y por la regla de conducta que impide acuñar términos: si la explicación solo funciona cuando se abandona el vocabulario del subsistema, el problema no es la explicación.

Cuando un texto no sale a la cuarta, el problema no es el texto: es que el objeto que describe no está bien explicado en ningún lado.

## Lo que está mal, verificado

**El README no cumple el molde de la Decisión Local-0066** (El README de subsistema explica al usuario cómo se usa): seis secciones — qué es y qué no · cómo se arranca, con el recorrido numerado · las decisiones de uso con ejemplos llanos · qué esperar al usarlo · lo que no cubre · dónde está el detalle. El de `conducta` está escrito para quien construyó el subsistema.

**La explicación describe qué campo de la respuesta del hook escribe cada clase, en vez de qué recibe el usuario.** La frase que el usuario nombró dos veces sin entenderla —*«Las tres clases conviven en un mismo momento y salen en una sola respuesta»*— cuenta la infraestructura interna y no el efecto observable.

**Se usan de ejemplo salidas que el usuario nunca ve.** De los momentos con repartidor construido, el único que produce algo visible en la terminal es `al arrancar la sesión`; los demás entregan su texto al contexto del modelo. Explicar con esos otros le habla al usuario de algo que no está en su pantalla, y fue el error que hundió los cuatro intentos.

**La clase `Bloquear` nombra un efecto que sus reglas casi nunca producen.** Lo que hacen todas es correr un programa y usar lo que devuelve; frenar es una de las cosas que ese programa puede pedir, y la menos frecuente. Por eso la explicación de la excepción del momento `al cerrar tarea` —*«la habilita una regla `Bloquear`»*— se lee como una contradicción: se nombra el bloqueo para contar cómo se habilita un aviso.

**`clase` no tiene entrada propia en el glosario.** Existe dentro de la definición de Regla de conducta (Local-0012) y en `CLASES.md`, sin definirse a sí misma. `Momento de conducta` (Local-0013) y `Regla de conducta` sí están.

**La excepción del momento `al cerrar tarea` está escrita en varios documentos del subsistema con redacciones distintas**, y ningún control las compara. Es el modo de falla del conocimiento Base-0001 (Evitar el mismo dato escrito en varios lugares), en su forma «texto distribuido».

## El ejemplo bueno: el único que el usuario ve

Al arrancar la sesión salen a la terminal dos cosas pegadas, y son **dos reglas de origen distinto**:

```
╔═══════════════════════════════════╗
║ Agente Multipropósito             ║   ← regla Base-0001, la trae el Agente Multipropósito
║ Título: … Propósito: …            ║
║ Subsistemas: 9   Lint: …          ║
╚═══════════════════════════════════╝
contexto: Agente Multipropósito … KB de …  ·  este repo … KB
                                       ↑ regla Local-0001, la sumó este repo
```

Eso —y nada más— es lo que la documentación quiere decir con «conviven en un mismo momento y salen juntas». Es el ejemplo con el que hay que explicar el modelo, porque es el único que el usuario tiene delante.

Verificado en esta sesión alimentando el repartidor con el evento de arranque: las dos reglas se despachan y sus salidas se fusionan en un único campo visible. La sospecha que traía el handoff anterior —que la segunda no salía— era falsa alarma: no llega al contexto del modelo, que es distinto de no salir.

## El alcance acordado

Dos tramos, en este orden.

**Tramo 1 — la explicación.** No toca el vocabulario ni la forma de las tablas, así que no toca el `lint-conducta` ni el repartidor:

- Reescribir el `README.md` con el molde de la Decisión Local-0066.
- Reescribir la explicación del modelo con el ejemplo visible adelante, y sacar de los textos la descripción de qué campo escribe cada clase (eso baja al README del repartidor, que es donde va el «por qué se decidió cada cosa» según la misma decisión).
- Dejar la excepción del momento `al cerrar tarea` escrita **una sola vez**, y que los demás documentos la enlacen.
- Sacar de las celdas de tabla los párrafos con excepciones adentro.

**Tramo 2 — el nombre de la clase `Bloquear`.** Se propone renombrarla por lo que hace siempre. Es potestad del usuario y se tramita por `converger-terminologia`. Arrastra el registro de reglas, el `lint-conducta`, el repartidor y los Agentes Desplegados ya instalados. Va después del tramo 1 porque, al revés, la explicación se escribe dos veces.

Se resuelve además, adentro de este plan, el **plan Local-0116** (La regla que propone cerrar la sesión manda escribir un handoff para trabajo que sigue otro día): es una regla de este mismo subsistema y su corrección cae dentro del tramo 1.

## Lo que no se toca

- El vocabulario de momentos: los nombres son claros y están en el glosario.
- La forma de las tablas de `MOMENTOS.md` y del registro de reglas. El `lint-conducta` las lee, y cambiarles las columnas rompe controles que siguen contestando en verde — conocimiento Local-0012 (Cambiar la forma de un registro rompe a sus lectores).
- El mecanismo: el repartidor no cambia en el tramo 1.

## Trampas

- **Todo lo que se toque en `.claude/conducta/` hay que espejarlo** con `sincronizar-base --aplicar` y subirle la versión al plugin `amp`, o el cambio no llega a ningún Agente Desplegado y `lint-harness` lo marca.
- **Correr el banco de pruebas del subsistema después de cada cambio**, no solo el lint.
- **Antes de escribir «esto que ves», verificar por dónde sale.** Solo `al arrancar la sesión` produce salida visible al usuario.

## Pasos

1. Reescribir el `README.md` con el molde de la Decisión Local-0066.
2. Reescribir la explicación del modelo con el ejemplo visible adelante.
3. Dejar la excepción del momento caro en un solo lugar y enlazarla desde el resto.
4. Corregir la regla del plan Local-0116, que cae adentro.
5. Espejar a la Base, subir la versión y correr el control de cierre.
6. Tramo 2: proponer el renombre de la clase `Bloquear` por `converger-terminologia`.

## Planes relacionados

- [Reescribir los README de subsistema como explicación de uso](Reescribir%20los%20README%20de%20subsistema%20como%20explicacion%20de%20uso.md) (Local-0103) — este plan se lleva el README de `conducta`; ahí quedan los otros siete.
- [La regla que propone cerrar la sesión manda escribir un handoff para trabajo que sigue otro día](La%20regla%20que%20propone%20cerrar%20la%20sesion%20manda%20escribir%20un%20handoff%20para%20trabajo%20que%20sigue%20otro%20dia.md) (Local-0116) — se resuelve adentro del tramo 1.
- [Crecer el subsistema conducta](Crecer%20el%20subsistema%20conducta.md) (Local-0051) — Diferido, y es sobre sumar momentos y medir, no sobre explicar.
