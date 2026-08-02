# Controles que dejan de controlar sin avisar

Un control roto no se comporta como un control roto: se comporta como un control que **no encuentra nada**. Y "no encuentro nada" es indistinguible de "está todo bien". Ese es el modo de falla más caro de un repo gobernado por controles, porque el verde es lo que autoriza a seguir.

Medido en este repo el 30/07/2026, con todos los lints en verde y el nivelador informando el `.claude/` al día.

## Las siete formas en que un control se apaga solo

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

Medido el 31/07/2026 sobre el nivelador, con su banco en verde: de **cinco condiciones nuevas, dos no hacían nada**. Una guarda agregada para que un subsistema entero ausente no saliera repetido ya estaba cubierta por la deduplicación, y una comparación del orden de las columnas no tenía ningún caso que la ejercitara. Ninguna de las dos habría aparecido nunca: el banco daba verde con ellas y sin ellas.

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

## El remedio de una forma produce la otra

Las formas 1 y 2 tiran para lados opuestos, y ahí está la trampa: **lo que se agrega para que un control deje de marcar de más es lo que lo convierte en mudo.**

Ese mismo día, la guarda que se agregó para que un subsistema ausente no saliera una vez por archivo habría devuelto **silencio** ante una carpeta nueva que viajara sin chequeo propio — el defecto de la forma 1, introducido por el remedio de la forma 2, adentro del control que venía a cerrar exactamente ese agujero.

**Ante la duda, marcar de más.** Varias líneas se leen; ninguna, no. Bajar el ruido es un ajuste posterior, y se hace con un caso que lo justifique.

## El hallazgo que nadie puede resolver

Una variante de la forma 2 que no depende del volumen: **un solo hallazgo permanente alcanza para apagar el reporte entero**, si el usuario no tiene ninguna manera de resolverlo.

El primer intento del chequeo de columnas del nivelador marcaba a todo Agente Desplegado que le hubiera sumado una columna propia a un registro suyo —cosa que tiene permitida— aunque no hubiera nada que nivelar. Ese repo quedaba con un hallazgo bloqueante **en cada corrida, para siempre**, y sin acción posible: la columna es legítima y no se va a ir. Un reporte que nunca puede llegar a cero deja de significar «hay algo que hacer».

Los hallazgos de un control tienen que ser **resolubles**: cada uno nombra algo que alguien puede llevar a cero. Si un estado legítimo y permanente enciende un hallazgo, el defecto es del control.

## Cómo se prueba un control

- **Caso malo y caso bueno, los dos.** Sin el malo, un control que no hace nada pasa por sano. Sin el bueno, no se detecta el falso positivo — que es la forma 2 de esta lista.
- **Cada control se enciende ante su defecto, y solo ante el suyo.** Conviene informar qué *otros* controles se dispararon de más: si romper una cosa enciende cinco, alguno está mirando lo que no le toca.
- **La prueba se verifica rompiendo el control a propósito.** Una prueba que nunca falló no prueba nada: es indistinguible de una que no chequea. Se rompe, se confirma que falla el caso que corresponde **y solo ese**, y se restaura comprobando que el archivo quedó idéntico.
- **Se rompe cada condición, no el control entero.** Neutralizar el control de una y ver fallar el banco solo prueba que hay *alguna* condición viva. Cada guarda se desactiva por separado: la que deja el banco en verde no está probada, y hay que decidir entre sacarla o escribirle el caso.
- **Nada de números absolutos adentro de la prueba.** Un número absoluto envejece igual adentro de una prueba que adentro de un registro, y lo hace por dos caminos opuestos. El **ruidoso**: dos casos de la prueba de planes comparaban contra un `81` escrito a mano y empezaron a fallar solos el día que el repo abrió el plan 82, avisando de un defecto que no existía. El **mudo**, que es el que nadie ve: el caso deja de reproducir el defecto y pasa a no poder fallar (forma 7 de esta lista). Se arregla igual en los dos casos — derivar el número de lo que se prueba, no escribirlo.
- **Banco aparte, nunca el repo real.** Y si el control mira el repo entero, el banco tiene que ser un repo, no una carpeta: si no, el barrido cae sobre el repo real y los casos no quedan aislados.
- **Lo que no se cubre, se dice.** Un control que la prueba no puede ejercitar (porque depende del estado de la máquina, por ejemplo) se declara en la salida. Callarlo hace que la prueba en verde se lea como cobertura completa.
- **Una prueba terminada no se deja en la carpeta temporal.** Una prueba completa de `lint-planes` —169 líneas, funcionando, con el criterio correcto escrito en su encabezado— quedó en `.claude/tmp/`, que el repo gitignorea. No era un borrador: era el trabajo hecho, esperando que alguien lo borrara. Un archivo de `tmp/` que dejó de ser descartable se mueve el mismo día.

## Contrato: reportar y fallar son cosas distintas

- Un **lint** reporta y **no falla**: describe el estado del repo, y que haya hallazgos es información, no error.
- Una **prueba** sí falla, con código de salida distinto de cero: dice que un control está roto, que es otra clase de cosa.

Por eso son dos Herramientas separadas y hacen falta las dos. `ejecutar-control-cierre` pregunta *¿el repo está bien?*; `ejecutar-pruebas` pregunta *¿los controles que contestan eso siguen funcionando?*.
