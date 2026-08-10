# medir-contexto

Herramienta del Agente Desplegado (este repo). Mide **el texto que se carga en cada arranque de sesión**, lo reparte en tres categorías y compara contra un tope **solo la primera**: lo que aporta el Agente Multipropósito.

```bash
node .claude/herramientas/medir-contexto/medir-contexto.js [rutaRepo]
```

## Qué mide

Lo que entra al contexto sin que nadie lo pida: arranca por `CLAUDE.md` y `AGENTS.md` y sigue las líneas `@ruta`, que son importaciones. Hoy eso es el punto de entrada, los `MANIFIESTO.md` de cada subsistema, y los Índices que esos manifiestos importan.

Los registros que se consultan a demanda —planes, semántica, decisiones, conducta— **no cuentan**, justamente porque no se cargan.

Reporta y no falla: sale 0 siempre. Describe el estado del repo, y pasar el tope es información, no error.

El **cableado** —el bloque `## Subsistemas` del punto de entrada— se mide aparte, porque es lo único del Agente Multipropósito que no llega como archivo. Ver «Las tres categorías».

## Por qué es una Herramienta de este repo y no algo que viaje

Estuvo un tiempo adentro de la Pantalla de bienvenida, que viaja a cada Agente Desplegado. Se sacó de ahí porque **no le sirve al que la recibe**:

- **El tope no es suyo para mover.** La constante vive en el código, y el código es mecanismo que el actualizador repone entero. Un Agente Desplegado que la edite pierde el cambio en la próxima corrida de `amp:actualizar`. Informarle un número sobre el que no puede actuar es ruido.
- **Decidir si el tope sube es potestad de acá.** Es este repo el que decide cuánto contexto puede permitirse mandar el Agente Multipropósito. Esa vigilancia le corresponde a quien publica, no a quien instala.

Lo que sí le serviría a un Agente Desplegado es el **desglose sin tope** —cuánto le agrega el Agente Multipropósito y cuánto su propio Aprendizaje—, que es otra cosa que este control y tiene plan propio: `Que un Agente Desplegado vea cuánto contexto carga y de quién es`.

Es una aplicación directa de la Decisión Local-0048.

## Las tres categorías

Lo cargado se reparte en tres, y **solo la primera tiene tope**:

- **Agente Multipropósito** — lo que este repo manda y carga todo Agente Desplegado el día uno, antes de aprender nada. Solo baja recortando lo que viaja. **Es el único número controlado.**
- **este repo** — las filas que este repo le agregó a esos Índices persiguiendo su Propósito, más cualquier archivo propio que haya sumado a la carga. Es **dato, no control**.
- **afuera** — el punto de entrada menos su bloque de cableado: la descripción del proyecto, que cada repo escribe como quiera. No se reparte y no entra en ningún veredicto.

Lo que manda se mide contra los archivos de `base/`, **no se deduce**: para cada archivo cargado se busca su contraparte, y un registro `origen: agente-desplegado` viaja declarado y sin filas, así que su contraparte ya pesa lo que va a pesar el día uno de un repo nuevo. Lo que queda es de este repo.

**El bloque de cableado se mide aparte.** El bloque `## Subsistemas` que `amp:inicializar` escribe en `AGENTS.md` —las líneas de importación de los manifiestos— es lo único del Agente Multipropósito que no viaja como archivo: se fusiona adentro del que el repo ya tenía. Se lo busca por su encabezado y se cuenta hasta el próximo `##`. Dejarlo afuera achicaría el número controlado justo en la parte que crece cada vez que se suma un subsistema. Si no se halla el encabezado, la Herramienta lo dice en vez de contar cero.

Por qué el tope mira solo la primera: son dos cosas que se mueven distinto. La primera la acota el diseño de acá; la segunda crece con el Propósito y **su umbral es indeterminado desde el rol de quien publica** — en un propósito continuo se espera que crezca sin techo. Con el tope sobre el total, el aviso se encendía por lo que este repo aprendió y mandaba a recortarlo, que es justo lo que no hay que recortar por un tope de diseño. Es la Decisión Local-0067.

## De dónde sale el tope de 35 KB

Se fijó el 30/07/2026 en 48 KB, midiendo lo que había ese día —43,9 KB en 17 archivos— y dejando unos 4 KB de margen. **Subió a 52 KB el 01/08/2026**, con el mismo criterio y después de recortar la celda que más había crecido: la de `actualizar-plugins`, que pesaba 1,4 KB en una columna que por convención es de una línea, con todo su desarrollo ya escrito en su propio `README.md`. **Bajó a 35 KB el 10/08/2026** al pasar a medir solo lo que aporta el Agente Multipropósito: 31,0 medidos más ~4 KB de margen, que alcanza para un subsistema nuevo completo —su manifiesto más su Índice, del orden de 3 a 4 KB— y avisa al segundo.

**No sale de un límite del modelo ni de ningún cálculo**: es una disciplina auto-impuesta.

Lo que aporta el control es **que haya un número**, no cuál sea. El contexto siempre cargado no lo vigila nadie y crece de a poco: cada Índice liviano que se suma no pesa nada por sí solo. El modelo de carga por manifiesto se adoptó justamente para bajarlo —el registro de planes llegó a pesar casi la mitad del total—, y sin un número a la vista ese ahorro se vuelve a consumir sin que se note.

## Qué hacer cuando lo pase

No es una alarma que haya que apagar: es el momento de decidir a mano entre dos cosas.

- **Subirlo**, porque el Agente Multipropósito legítimamente creció y lo que manda vale su costo.
- **Recortar.** El primer lugar donde mirar son las celdas de `Descripción` de los Índices cargados, que son de una línea por convención y tienden a crecer a párrafo. El desarrollo va en la página, y lo que sale de la celda deja de estar cargado. El desglose que imprime la Herramienta está ordenado por peso para eso.

## Pruebas

```bash
node .claude/herramientas/medir-contexto/pruebas.js
```

Diecinueve casos sobre repos de prueba armados en `.claude/tmp/`, nunca sobre el repo real: afirmar algo del repo real metería un número absoluto adentro de la prueba, que envejece igual que adentro de un registro. Cubren el caso bueno y el malo del tope, **que un repo que aprendió mucho no lo encienda**, que se sigan las líneas `@`, que un repo sin punto de entrada lo diga en vez de informar 0 KB, que se mida el repo que se le pasa y no el propio, el reparto en las tres categorías, y el bloque de cableado: que cuente, que no se lleve lo que viene después, y que su ausencia se avise.
