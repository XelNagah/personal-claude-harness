# Controles que dejan de controlar sin avisar

Un control roto no se comporta como un control roto: se comporta como un control que **no encuentra nada**. Y "no encuentro nada" es indistinguible de "está todo bien". Ese es el modo de falla más caro de un repo gobernado por controles, porque el verde es lo que autoriza a seguir.

Medido en este repo el 30/07/2026, con todos los lints en verde y el nivelador informando el `.claude/` al día.

## Las cuatro formas en que un control se apaga solo

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

## Cómo se prueba un control

- **Caso malo y caso bueno, los dos.** Sin el malo, un control que no hace nada pasa por sano. Sin el bueno, no se detecta el falso positivo — que es la forma 2 de esta lista.
- **Cada control se enciende ante su defecto, y solo ante el suyo.** Conviene informar qué *otros* controles se dispararon de más: si romper una cosa enciende cinco, alguno está mirando lo que no le toca.
- **La prueba se verifica rompiendo el control a propósito.** Una prueba que nunca falló no prueba nada: es indistinguible de una que no chequea. Se rompe, se confirma que falla el caso que corresponde **y solo ese**, y se restaura comprobando que el archivo quedó idéntico.
- **Nada de números absolutos adentro de la prueba.** Dos casos de la prueba de planes comparaban contra un `81` escrito a mano y empezaron a fallar solos el día que el repo abrió el plan 82 — avisando de un defecto que no existía. Un número absoluto envejece igual adentro de una prueba que adentro de un registro.
- **Banco aparte, nunca el repo real.** Y si el control mira el repo entero, el banco tiene que ser un repo, no una carpeta: si no, el barrido cae sobre el repo real y los casos no quedan aislados.
- **Lo que no se cubre, se dice.** Un control que la prueba no puede ejercitar (porque depende del estado de la máquina, por ejemplo) se declara en la salida. Callarlo hace que la prueba en verde se lea como cobertura completa.

## Contrato: reportar y fallar son cosas distintas

- Un **lint** reporta y **no falla**: describe el estado del repo, y que haya hallazgos es información, no error.
- Una **prueba** sí falla, con código de salida distinto de cero: dice que un control está roto, que es otra clase de cosa.

Por eso son dos Herramientas separadas y hacen falta las dos. `ejecutar-control-cierre` pregunta *¿el repo está bien?*; `ejecutar-pruebas` pregunta *¿los controles que contestan eso siguen funcionando?*.
