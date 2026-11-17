# medir-contexto

Herramienta del Agente Desplegado (este repo). Mide **el texto que se carga en cada arranque de sesión**, lo reparte en tres categorías y compara contra un tope **solo la primera**: lo que aporta el Agente Multipropósito. Mide aparte, con su propio tope, **el texto que se entrega en cada turno** (ver «La segunda medición»).

```bash
node .claude/herramientas/medir-contexto/medir-contexto.js [--hook] [rutaRepo]
```

## Qué mide

Lo que entra al contexto sin que nadie lo pida: arranca por `CLAUDE.md` y `AGENTS.md` y sigue las líneas `@ruta`, que son importaciones. Hoy eso es el punto de entrada, los `MANIFIESTO.md` de cada subsistema, y los Índices que esos manifiestos importan.

Los registros que se consultan a demanda —planes, semántica, decisiones, conducta— **no cuentan**, justamente porque no se cargan. Lo que el repartidor de conducta entrega en cada turno es otra medición, más abajo.

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

## De dónde sale el tope de 40 KB

Se fijó el 30/07/2026 en 48 KB, midiendo lo que había ese día —43,9 KB en 17 archivos— y dejando unos 4 KB de margen. **Subió a 52 KB el 01/08/2026**, con el mismo criterio y después de recortar la celda que más había crecido: la de `actualizar-plugins`, que pesaba 1,4 KB en una columna que por convención es de una línea, con todo su desarrollo ya escrito en su propio `README.md`. **Bajó a 35 KB el 10/08/2026** al pasar a medir solo lo que aporta el Agente Multipropósito: 31,0 medidos más ~4 KB de margen, que alcanza para un subsistema nuevo completo —su manifiesto más su Índice, del orden de 3 a 4 KB— y avisa al segundo. **Subió a 40 KB el 17/11/2026**, con el mismo criterio: 36,9 medidos más unos 3 KB de margen. El margen anterior lo consumió crecimiento legítimo —el subsistema de comunicación, las Herramientas de copias de trabajo y tres páginas de conocimiento del Agente Multipropósito—, no celdas infladas.

**No sale de un límite del modelo ni de ningún cálculo**: es una disciplina auto-impuesta.

Lo que aporta el control es **que haya un número**, no cuál sea. El contexto siempre cargado no lo vigila nadie y crece de a poco: cada Índice liviano que se suma no pesa nada por sí solo. El modelo de carga por manifiesto se adoptó justamente para bajarlo —el registro de planes llegó a pesar casi la mitad del total—, y sin un número a la vista ese ahorro se vuelve a consumir sin que se note.

## Qué hacer cuando lo pase

No es una alarma que haya que apagar: es el momento de decidir a mano entre dos cosas.

- **Subirlo**, porque el Agente Multipropósito legítimamente creció y lo que manda vale su costo.
- **Recortar.** El primer lugar donde mirar son las celdas de `Descripción` de los Índices cargados, que son de una línea por convención y tienden a crecer a párrafo. El desarrollo va en la página, y lo que sale de la celda deja de estar cargado. El desglose que imprime la Herramienta está ordenado por peso para eso.

## La segunda medición: el texto que se entrega en cada turno

Aparte de lo que se carga al arrancar, la Herramienta mide **el texto que el repartidor de conducta (`.claude/conducta/establecer-conducta/`) le entrega al agente en el momento `cada turno`** sin que nadie lo pida, y lo compara contra un tope propio.

**Qué cuenta.** Las reglas de clase `Inyectar`, en estado `vigente` y del momento `cada turno`, de los dos Índices de reglas (`conducta/INDICE.md` e `INDICE-LOCAL.md`): el mismo filtro que usa el repartidor. Cada regla pesa lo que el repartidor emite de ella, la línea `- <Contenido>`. Informa la Base y el repo por separado.

**Qué deja afuera.** Todo lo que el agente consulta cuando lo necesita —las preferencias, los Índices, las páginas que abre a demanda—, el encabezado fijo del bloque, y lo que el repartidor suma a veces en ese momento sin ser una regla fija: el contraste con los registros y los avisos del Buzón. El tope **no limita lo que el agente puede obtener**: solo lo que recibe sin pedirlo.

**Por qué hay tope.** Cada regla de ese momento se paga en todos los turnos, y un bloque pesado diluye a las demás reglas que van en él. Desde que las reglas que hacían falta para operar los subsistemas pasaron de las habilidades a este momento (plan Local-0130), el bloque es el camino natural para cualquier regla nueva, y sin un número crece sin que nadie lo note. No es que una regla en un bloque largo «se recite sin obedecerse»: eso no se observó en reglas re-inyectadas (conocimiento Local-0001, Modos de falla ante reglas escritas). El motivo es el peso.

**El tope es sobre la Base sola**, igual que el del arranque: esta Herramienta no viaja, así que el aviso solo lo ve quien publica, y lo único que quien publica decide son las reglas de la Base. Las del repo se informan como dato, sin veredicto: un repo que necesita sus reglas no recibe un aviso cada vez que suma una.

**El número y de dónde salió** están escritos en un solo lugar, la constante `TOPE_CADA_TURNO` del código de esta Herramienta, con su fecha y su cálculo en el comentario de al lado. Esta ficha no lo copia a propósito (conocimiento Base-0001, Evitar el mismo dato escrito en varios lugares).

**Dónde se ve.** En la línea que la regla de conducta Local-0001 (Informar el peso del contexto al arrancar) muestra al abrir la sesión: dentro del tope, como `cada turno X KB de Y`; pasado, como un aviso entero en su propia línea, que dice qué midió, cuánto dio, Base y repo por separado, el tope y qué hacer. Sin el flag `--hook`, la Herramienta imprime además cuánto pesa cada regla, ordenadas de mayor a menor. No bloquea nada y sale 0 igual.

**Qué hacer cuando lo pase.** Mirar las reglas más pesadas del desglose y elegir:

- **Pasar a un momento más específico** la regla que se pueda detectar sin juicio —por ejemplo, la que pide algo antes de un `git mv`—, para que se entregue solo cuando hace falta y no en todos los turnos.
- **Acortar su texto**, dejando lo necesario para obedecer.
- **Subir el tope**, si el bloque creció legítimamente; eso se decide acá, en la constante, con su motivo al lado.

Si no encuentra el registro de reglas, lo dice en vez de informar 0 KB.

## Pruebas

```bash
node .claude/herramientas/medir-contexto/pruebas.js
```

Treinta y cuatro casos sobre repos de prueba armados en `.claude/tmp/`, nunca sobre el repo real: afirmar algo del repo real metería un número absoluto adentro de la prueba, que envejece igual que adentro de un registro. Cubren el caso bueno y el malo del tope, **que un repo que aprendió mucho no lo encienda**, que se sigan las líneas `@`, que un repo sin punto de entrada lo diga en vez de informar 0 KB, que se mida el repo que se le pasa y no el propio, el reparto en las tres categorías, el bloque de cableado: que cuente, que no se lleve lo que viene después, y que su ausencia se avise; y la medición de cada turno: que cuente solo las reglas que el repartidor entrega, las del repo aparte y sin encender el tope, que el aviso diga todo lo que tiene que decir, y que la falta del registro se diga.
