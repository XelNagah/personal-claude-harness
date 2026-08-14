# Controles que dejan de controlar sin avisar

Un control roto no se comporta como un control roto: se comporta como un control que **no encuentra nada**. Y "no encuentro nada" es indistinguible de "está todo bien". Ese es el modo de falla más caro de un repo gobernado por controles, porque el verde es lo que autoriza a seguir.

Medido en este repo el 30/07/2026, con todos los lints en verde y el actualizador informando el `.claude/` al día.

## Las doce formas en que un control se apaga solo

### 1. Valida sobre un conjunto vacío

Ya está asentado aparte, en [`cambiar-la-forma-de-un-registro`](cambiar-la-forma-de-un-registro.md): al cambiarle las columnas a un registro, el código que lo lee por posición pasa a leer cero filas y contesta en verde. **De once roturas medidas, ocho no emitieron ninguna señal.**

### 2. Marca tanto que se lo deja de leer

Un control puede funcionar perfecto y ser inútil igual. La fila `capa` de la Terminología Farlopa marcaba **37 apariciones y acertaba en ninguna**: todas eran el uso legítimo (`capa mecánica`, `capa semántica`, `capa de configuración`). Un grupo de hallazgos que nunca puede llegar a cero entrena a saltearlo, y con él se saltean los hallazgos reales que caen al lado — en ese mismo grupo había **3 usos que sí había que corregir, escondidos entre 89 que no**.

El repo ya conocía el riesgo y lo había aplicado una vez: `Base` se evaluó, se midió que marcaba 673 apariciones casi todas válidas y **se decidió no vetarla**, con el argumento de que *un registro que marca todo entrena a ignorarlo*. Lo que faltaba era aplicar ese mismo criterio hacia adentro, fila por fila.

**Cómo se mide:** de las veces que un control marca, cuántas son errores reales. No sirve el conteo de marcas solo. Una fila que marca 6 y acierta 6 está sana; una que marca 37 y acierta 0 está apagada aunque su código sea correcto.

### 3. Mira una copia y no la que se usa

Un texto que vive dos veces necesita un control que compare **las dos copias**, y es fácil escribir uno que parezca hacerlo y no lo haga. Acá había un control de divergencia que comparaba las plantillas **entre sí**, y por fragmentos con hash. Nadie comparaba la plantilla contra el archivo instalado. Resultado: se arreglaron cuatro lints en `.claude/`, la copia embebida que se publica quedó con el defecto, y el control de cierre siguió en verde. Al escribir la comparación que faltaba, **2 de 12 scripts embebidos estaban divergentes**, y los dos eran cambios de esa misma sesión que se habrían publicado a medias.

### 4. Nadie lo probó nunca

Un control sin prueba no avisa cuando deja de controlar, y el control de cierre no puede detectarlo porque le cree. Antes del 30/07/2026 este repo tenía **trece controles y cero pruebas**, mientras el conocimiento que prescribía el remedio —*una prueba por control, con caso bueno y caso malo*— ya estaba asentado hacía un día.

### 5. Tiene adentro una condición que no controla nada

Un banco verde prueba el control **como un todo**: dice que se enciende ante su defecto y se calla ante lo sano. No dice nada de cada condición por separado. Una condición que sobra —o que quedó cubierta por otra— pasa desapercibida mientras el control acierta por los otros caminos.

Medido el 31/07/2026 sobre el actualizador, con su banco en verde: de **cinco condiciones nuevas, dos no hacían nada**. Una guarda agregada para que un subsistema entero ausente no saliera repetido ya estaba cubierta por la deduplicación, y una comparación del orden de las columnas no tenía ningún caso que la ejercitara. Ninguna de las dos habría aparecido nunca: el banco daba verde con ellas y sin ellas.

Las dos terminaron distinto, y esa es la parte que importa. La guarda redundante **se sacó**, porque además de no hacer nada era dañina (ver abajo). La comparación de orden **se quedó**, porque al buscarle un caso apareció un defecto real que nadie había considerado. Una condición que no se puede romper no es necesariamente sobrante: puede ser una condición cuyo motivo nadie escribió todavía.

### 6. Se queda sin población que controlar

Las cinco anteriores describen un control que **nunca funcionó** o que **rompe un cambio externo**. Esta es distinta: el control funcionaba, sigue leyendo bien, y lo que se vació es aquello sobre lo que trabajaba. Le pasa a todo control que compara **varias copias de lo mismo**: si quedan cero o una, ya no hay con qué comparar, y la comparación contesta en verde pase lo que pase.

Medido el 01/08/2026 sobre `lint-harness`, que vigilaba cuatro fragmentos de código compartidos entre lints. **Dos de los cuatro no controlaban nada**, y se habían apagado por caminos distintos:

| Cómo se vació | Ejemplo | Qué corresponde |
|---|---|---|
| **Le migraron el patrón** | los lints dejaron de deducir la raíz del repo desde `__dirname`, y el ancla siguió buscando el código viejo | **reapuntar**: el fragmento compartido no desapareció, se mudó |
| **Le retiraron el consumidor** | de los dos lints que recorrían subárbol, uno se fue con la generación retirada de Memoria | **retirar**: con un solo consumidor no hay nada que uniformar |

**La pregunta que decide es por qué se vació, no que esté vacío.** Los dos casos se ven idénticos desde afuera —un control en verde que no mira nada—, y la respuesta correcta es opuesta: uno hay que arreglarlo, el otro sacarlo. Retirar el primero pierde un control que hacía falta; reparar el segundo deja código vivo vigilando algo que ya no existe.

**Cómo se detecta:** recorriendo lo **declarado**, no lo **encontrado**. El control que junta cero muestras ni siquiera llega al registro de resultados, así que un barrido sobre lo encontrado no lo puede ver — es el caso más mudo, y justo el que más importa. La guarda es un mínimo de dos muestras por cosa declarada.

Las dos formas se acumulan con la 4: acá el control de divergencia **no tenía ninguna prueba**, y por eso los dos fragmentos pudieron quedarse apagados durante meses con el control de cierre en verde.

### 7. La prueba lo cubre con un número que envejeció

Las seis anteriores son del control. Esta es de su **prueba**: el control funciona, la prueba corre y contesta en verde, pero el caso que la hacía valer dejó de reproducir el defecto. Sigue afirmando y ya no puede fallar. Es la forma 4 disfrazada de lo contrario — hay banco, y el banco no cubre.

Medido el 01/08/2026 sobre `medir-contexto`. El caso malo armaba un repo de 50 KB para probar que la Herramienta avisa al pasar el tope, que era 48. El día que el tope subió a 52 —un cambio legítimo, en otro archivo, hecho por otro motivo— 50 dejó de pasarlo: el caso siguió corriendo y siguió verde, midiendo un repo que ya no encendía nada. Nada cambió en lo que prueba.

**Cómo se distingue de la 6:** ahí se vació la población sobre la que el control trabaja. Acá la población está intacta y lo que caducó es la **premisa del caso** —que 50 fuera más que el tope—. Ninguna guarda de conteo la ve: hay una muestra, el caso corre, la cantidad de casos no baja.

**El arreglo es derivar, no actualizar.** Subirle el número al caso lo revive hasta el próximo cambio de tope. El caso lee el tope de la propia Herramienta y arma el repo a partir de él, así que la premisa no puede caducar. Regla general: un valor que la prueba comparte con lo que prueba se le pide a lo que prueba.

### 8. Corre en el único lugar donde la premisa es verdadera

Las siete anteriores son defectos del control o de su prueba. Esta no: el control está bien escrito, bien probado, y mira exactamente lo que tiene que mirar. Lo que falla es **dónde corre**. El código que viaja da por sentada una condición de su entorno; en el repo autor esa condición se cumple, porque algo local la establece; el consumidor nunca recibe ese algo. Y el control, que solo se corre en el repo autor, contesta en verde con razón.

Medido el 04/08/2026, en la primera instalación limpia del Agente Multipropósito contra un repo vacío.

Cuatro archivos que viajan declaran por escrito que `.claude/tmp/` está gitignoreado: los lints de semántica y de conocimiento lo excluyen de su barrido por ser material descartable, y dos módulos de conducta lo tratan como directorio de borradores. Es verdad **acá**, donde lo establece la Preferencia Local-0003 (Guardar los archivos temporales en `.claude/tmp/`) — que no viaja. La instalación nunca creaba un `.gitignore` en el destino, así que un tercero versionaba el buzón de avisos desde su primer commit y los cuatro mecanismos trabajaban sobre algo que su repo no cumplía. **Los once controles del cierre daban verde, y ninguno estaba equivocado.**

**Cómo se distingue de las anteriores.** No mira una copia por otra (forma 3): mira el original. No se quedó sin población (forma 6): la población está entera. Su prueba no caducó (forma 7): sigue reproduciendo lo que dice reproducir. La premisa que caducó no es del caso ni del control, es **del lugar donde se lo corre**.

**Cómo se detecta:** instalando en un destino limpio y ejerciendo el mecanismo ahí. Es la única corrida en la que el entorno no lo provee el autor, y por eso ningún control que viva en el repo autor la puede reemplazar.

**Regla general:** una condición que el código que viaja da por sentada, la instalación la tiene que establecer — o el código tiene que dejar de darla por sentada. Escribirla en un comentario no la establece. Acá lo que la establecía era un archivo que se quedó del lado del autor, y el comentario que la enunciaba viajó solo. Vale para cualquier condición del entorno, no solo para lo que git ignora: un directorio que tiene que existir, una herramienta que tiene que estar disponible, un ajuste que tiene que estar puesto.

### 9. Mide una entrada que no es la que dice medir

Las ocho anteriores terminan en un verde que no vale. Esta también apaga el control, pero se ve al revés: **contestó en rojo**, y el rojo tampoco valía. El control estaba bien escrito y bien probado; lo que nunca llegó a la cosa medida fue **la entrada**, mutilada en el camino por el mecanismo que la entrega.

Medido el 09/08/2026 sobre `probar-disparo-de-skills`. En Windows hay que correr `claude` con el intérprete de por medio —es un `.cmd`—, y eso concatena los argumentos sin escapar: la consulta pasada como argumento se partía en palabras sueltas y el CLI tomaba **solo la primera**. El banco venía midiendo si `preguntale` disparaba una habilidad, y `que`, y `quiero`. Las **once consultas del banco** estaban en esa condición desde que la Herramienta existe. Corregido —la consulta va por STDIN—, las cinco que motivaron la corrida pasaron de 0/5 a 5/5 sin tocar una sola `description`.

**Cómo se distingue de las anteriores.** No valida sobre un conjunto vacío (forma 1): hay entrada, y llega. No mira una copia (forma 3): mira lo que corresponde. Su población está entera (forma 6) y su premisa sigue en pie (forma 7). Lo que cambió es **qué se le entregó**, y el control no tiene cómo saber que recibió menos: un texto truncado sigue siendo un texto válido.

**Por qué el rojo no protege.** Un rojo se lee como «el objeto medido está mal» y manda a arreglarlo. Acá lo primero que estuvo por tocarse fue la `description` de las habilidades, que no tenían nada. Un control en rojo autoriza a cambiar lo medido, igual que uno en verde autoriza a seguir: los dos veredictos valen lo que valga la entrada.

**Cómo se detecta:** ejerciendo el control una vez a mano, por fuera de su mecanismo de entrega, y comparando. Acá alcanzó con correr la misma consulta escrita entre comillas: disparó. Dos resultados distintos para la misma consulta señalan el mecanismo de entrega, no el objeto medido.

**Regla general:** un control que arma la entrada de lo que mide tiene que poder mostrar la entrada tal como llegó. Mientras eso no se vea, un rojo es una hipótesis, no un hallazgo.

### 10. El control que agrupa a los otros cubre menos de lo que promete

Las nueve anteriores son de un control que se apaga. Esta es de un control que **funciona perfecto** y aun así deja pasar todo lo que no mira: el que corre a los demás y presenta un veredicto único. Su verde no dice «el repo está bien», dice «lo que corro está bien» — y nadie vuelve a leer qué corre.

Medido el 11/08/2026 sobre `ejecutar-control-cierre`, el control que se pasa antes de publicar. Corría los diez lints de subsistema, el banco propio de `ejecutar-pruebas` y `claude plugin validate`, y cerraba con `TODO VERDE`. Nunca corría el **corredor** `ejecutar-pruebas`, que ejecuta los veinte bancos del repo. Un banco en rojo —el del actualizador, con un control suyo roto por un cambio publicado ese mismo día— no aparecía por ningún lado. El agujero se descubrió corriendo el corredor a mano, por otro motivo.

**La confusión que lo produjo:** el control sí nombraba a `ejecutar-pruebas`, pero corría **su banco**, no la Herramienta. Probar al corredor y correr al corredor son cosas distintas, y el nombre las tapa: leyendo la lista de chequeos, «banco de ejecutar-pruebas» se lee como «las pruebas están cubiertas».

**Cómo se distingue de las anteriores.** No valida sobre un conjunto vacío (forma 1): encuentra sus diez lints y los corre bien. No se quedó sin población (forma 6): la población que mira está entera. No mide una entrada mutilada (forma 9): mide exactamente lo que recibe. Lo que falla es el **alcance declarado**: la Herramienta se llama «control de cierre» y su verde se usa como permiso para publicar, pero cubría una sola clase de control — los lints, que dicen si los registros están bien formados, y nunca las pruebas, que dicen si los controles siguen funcionando.

**Cómo se detecta:** contar. Correr a mano cada clase de control del repo y verificar que el agregador la nombre en su reporte. El reporte del agregador es una lista visible; que una clase entera falte ahí se ve leyendo, pero solo si alguien va a leerla con la lista de clases en la otra mano.

**Regla general:** un control que agrupa a otros tiene que enumerar lo que corre, y esa lista tiene que ser auditable contra las clases de control que el repo tiene. El riesgo crece con la comodidad: cuanto más reemplaza el agregador a correr los comandos a mano, menos gente conoce la lista, y más vale su verde de lo que cubre.

### 11. La lista contra la que reconcilia crece, y los que ya cumplían quedan afuera

Las diez anteriores son de un control que se apaga para todos, o que cubre menos de lo que promete. Esta se apaga **solo para una parte de su población** — y justo para la que estaba más al día.

Medido el 11/08/2026 al repartir una versión a los siete Agentes Desplegados de la máquina. El actualizador reconciliaba el `.gitignore` del repo destino contra una lista propia de dos rutas, mientras que el bloque que aplica cuando marca el archivo —el `§Gitignore` de la PLANTILLA de `amp:inicializar`— traía tres: la tercera es el Índice de `comunicacion`, que guarda rutas absolutas de máquina. Cuatro repos recibieron la línea **de rebote**: les faltaba alguna de las dos viejas, el control los marcó, y el bloque se aplica entero. Los otros tres ya ignoraban las dos viejas, así que nunca se los marcó y la línea no les llegó jamás. Iban a versionar rutas de máquina en cuanto registraran su primer Agente Multipropósito Conocido.

**Por qué la prueba no lo veía.** Había dos casos y los dos pasaban: sin `.gitignore` se marcan las rutas, y con una sola puesta se reclama únicamente la que falta. El caso que faltaba —**todas las viejas puestas, la nueva no**— no existía hasta el día en que la lista creció, y agregar una ruta no obliga a escribirlo.

**Cómo se distingue de las anteriores.** No valida sobre un conjunto vacío (forma 1): la lista tiene entradas y las compara bien. No mira una copia (forma 3): lee el `.gitignore` real. Su prueba no envejeció (forma 7): seguía reproduciendo lo que decía reproducir. No mide una entrada mutilada (forma 9): recibe el archivo entero. Lo que falla es **a quién alcanza**: funciona para el repo nuevo y para el atrasado, y es ciego exactamente con el que estaba al día.

**Cómo se detecta:** correr el control contra un destino que ya cumple la versión **anterior** del requisito, no solo contra uno vacío y uno roto. Acá se detectó por el resultado y no por el control: tres de siete repos quedaron sin la línea, y la correlación con cuáles ya tenían las otras dos señaló la causa.

**Regla general:** cuando una lista de reconciliación crece, el caso que hay que escribir no es el de la entrada nueva sola — es el del destino que **ya cumplía todo lo anterior**. Y si la misma lista vive en dos lados, un comentario que afirme que coinciden no es un control: el control es la prueba que las compara. Acá el comentario lo afirmaba, y llevaban meses divergiendo.

### 12. La prueba monta su escenario sobre la configuración de la máquina

Las once anteriores son del control, de su alcance o de la premisa de su caso. Esta es de **cuánto del escenario fabrica el caso**. El caso arma su mitad, el entorno de la máquina pone la otra sin que nadie lo escriba, y el día que alguien cambia una preferencia suya el escenario deja de ser el que el caso describe. Termina en rojo, como la forma 9, y el rojo tampoco vale.

Medido el 14/08/2026 sobre `actualizar-plugins`. Su detección de dependencias sin declarar existe porque un plugin al que le falta una dependencia **no carga** y la Herramienta antes informaba todo al día. El caso que la fija fabricaba un repo que declaraba solo `amp` y esperaba nueve filas `SIN DECLARAR`. Pero lo que un repo declara no sale de un archivo: la Herramienta une **tres**, y una es `~/.claude/settings.json`, que vale para todos los repos de la máquina. Cuando esa casa pasó a declarar los nueve `amp-<sub>` a nivel usuario, la Herramienta se calló **con razón** —ahí están declarados, y ese repo cargaría bien— y el banco lo leyó como falla. En la Herramienta no había cambiado nada.

**Cómo se distingue de las anteriores.** No es la 7: la premisa del caso no comparte ningún número con lo que prueba, y el caso no dejó de poder fallar — falló. No es la 8: ahí la premisa del entorno se cumple en el repo autor y no en el destino, y el resultado es un verde que no vale; acá dejó de cumplirse **en el propio autor**, y el resultado es un rojo que tampoco vale. No es la 9: la entrada llega entera y el caso mide lo que dice medir; lo que no controla es la mitad del escenario que pone la máquina.

**Por qué el rojo tampoco protege.** Un rojo permanente por un motivo falso deja de distinguir: la próxima vez que ese banco se rompa de verdad, la línea va a decir lo mismo que venía diciendo. Y manda a arreglar lo que no está roto — lo primero que estuvo por tocarse fue la detección, que funcionaba perfecto.

**Cómo se detecta:** preguntándole al caso de dónde sale **cada** parte de su escenario. La que no ponga el caso la pone la máquina. Acá alcanzó con correr la Herramienta a mano contra el mismo repo fabricado, pero con una casa de usuario fabricada también: las nueve filas aparecieron.

**Regla general:** un caso tiene que fabricar **todas** las fuentes que lo que prueba va a leer, no solo la que tiene más a mano. Lo que se fabrica a medias lo completa el entorno, y el entorno es de otro. Fabricar una casa de usuario sale barato: un archivo de configuración propio y los registros que hagan falta copiados de la real, con la variable de entorno que la ubica apuntada ahí.

## El remedio de una forma produce la otra

Las formas 1 y 2 tiran para lados opuestos, y ahí está la trampa: **lo que se agrega para que un control deje de marcar de más es lo que lo convierte en mudo.**

Ese mismo día, la guarda que se agregó para que un subsistema ausente no saliera una vez por archivo habría devuelto **silencio** ante una carpeta nueva que viajara sin chequeo propio — el defecto de la forma 1, introducido por el remedio de la forma 2, adentro del control que venía a cerrar exactamente ese agujero.

**Ante la duda, marcar de más.** Varias líneas se leen; ninguna, no. Bajar el ruido es un ajuste posterior, y se hace con un caso que lo justifique.

## El hallazgo que nadie puede resolver

Una variante de la forma 2 que no depende del volumen: **un solo hallazgo permanente alcanza para apagar el reporte entero**, si el usuario no tiene ninguna manera de resolverlo.

El primer intento del chequeo de columnas del actualizador marcaba a todo Agente Desplegado que le hubiera sumado una columna propia a un registro suyo —cosa que tiene permitida— aunque no hubiera nada que actualizar. Ese repo quedaba con un hallazgo bloqueante **en cada corrida, para siempre**, y sin acción posible: la columna es legítima y no se va a ir. Un reporte que nunca puede llegar a cero deja de significar «hay algo que hacer».

Los hallazgos de un control tienen que ser **resolubles**: cada uno nombra algo que alguien puede llevar a cero. Si un estado legítimo y permanente enciende un hallazgo, el defecto es del control.

## Cómo se prueba un control

- **Caso malo y caso bueno, los dos.** Sin el malo, un control que no hace nada pasa por sano. Sin el bueno, no se detecta el falso positivo — que es la forma 2 de esta lista.
- **Cada control se enciende ante su defecto, y solo ante el suyo.** Conviene informar qué *otros* controles se dispararon de más: si romper una cosa enciende cinco, alguno está mirando lo que no le toca.
- **La prueba se verifica rompiendo el control a propósito.** Una prueba que nunca falló no prueba nada: es indistinguible de una que no chequea. Se rompe, se confirma que falla el caso que corresponde **y solo ese**, y se restaura comprobando que el archivo quedó idéntico.
- **Se rompe cada condición, no el control entero.** Neutralizar el control de una y ver fallar el banco solo prueba que hay *alguna* condición viva. Cada guarda se desactiva por separado: la que deja el banco en verde no está probada, y hay que decidir entre sacarla o escribirle el caso.
- **Nada de números absolutos adentro de la prueba.** Un número absoluto envejece igual adentro de una prueba que adentro de un registro, y lo hace por dos caminos opuestos. El **ruidoso**: dos casos de la prueba de planes comparaban contra un `81` escrito a mano y empezaron a fallar solos el día que el repo abrió el plan 82, avisando de un defecto que no existía. El **mudo**, que es el que nadie ve: el caso deja de reproducir el defecto y pasa a no poder fallar (forma 7 de esta lista). Se arregla igual en los dos casos — derivar el número de lo que se prueba, no escribirlo.
- **Banco aparte, nunca el repo real.** Y si el control mira el repo entero, el banco tiene que ser un repo, no una carpeta: si no, el barrido cae sobre el repo real y los casos no quedan aislados.
- **Lo que viaja se prueba además en un destino limpio.** Todo control que corre en el repo autor comparte el entorno del autor, así que ninguno puede contestar qué recibe el que instala (forma 8 de esta lista). Instalar contra un repo vacío y ejercer el mecanismo ahí es una corrida distinta, no una repetición: verifica lo que llega, no lo que hay.
- **La entrada que el control arma se verifica una vez a mano.** Si el control invoca algo externo —un CLI, un proceso, un servicio— y le pasa texto, ese texto puede llegar cambiado sin que nada avise (forma 9 de esta lista). Una corrida a mano con la misma entrada, comparada contra la del control, es la única que lo muestra.
- **Una lista que crece se prueba contra quien ya cumplía la anterior.** Sumarle una entrada a una lista de reconciliación no obliga a escribir ningún caso, y los que hay siguen pasando. El que falta es el del destino que ya cumplía todo lo viejo (forma 11 de esta lista): es el único que distingue un control que reconcilia la lista entera de uno que solo despierta cuando falta algo de antes. Si además la lista vive en dos lados, se compara con una prueba, no con un comentario.
- **El caso fabrica todas las fuentes, no la más a mano.** Si lo que se prueba junta su entrada de varios lados —tres archivos de configuración, un registro, una carpeta—, un caso que fabrica uno solo le deja el resto a la máquina (forma 12 de esta lista), y cambia de escenario el día que alguien cambia una preferencia suya sin tocar el repo.
- **Lo que no se cubre, se dice.** Un control que la prueba no puede ejercitar (porque depende del estado de la máquina, por ejemplo) se declara en la salida. Callarlo hace que la prueba en verde se lea como cobertura completa. Y lo declarado se revisa cuando se agrega cobertura: un límite que quedó escrito después de dejar de ser cierto desalienta el caso que sí se podía escribir.
- **Una prueba terminada no se deja en la carpeta temporal.** Una prueba completa de `lint-planes` —169 líneas, funcionando, con el criterio correcto escrito en su encabezado— quedó en `.claude/tmp/`, que el repo gitignorea. No era un borrador: era el trabajo hecho, esperando que alguien lo borrara. Un archivo de `tmp/` que dejó de ser descartable se mueve el mismo día.

## Contrato: reportar y fallar son cosas distintas

- Un **lint** reporta y **no falla**: describe el estado del repo, y que haya hallazgos es información, no error.
- Una **prueba** sí falla, con código de salida distinto de cero: dice que un control está roto, que es otra clase de cosa.

Por eso son dos Herramientas separadas y hacen falta las dos. `ejecutar-control-cierre` pregunta *¿el repo está bien?*; `ejecutar-pruebas` pregunta *¿los controles que contestan eso siguen funcionando?*.
