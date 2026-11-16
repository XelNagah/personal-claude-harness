# Conducta

El subsistema `conducta` sirve para **asegurar comportamientos del tipo "cuando hagas X, asegurate de Y"**: guarda reglas y se las entrega al agente **en el momento del flujo en que hacen falta**, no al arrancar la sesión.

Esto es lo que produce, y es lo único que se ve en la terminal — el bloque que aparece al abrir una sesión (los números son los del repo que lo emite):

```
╔══════════════════════════════════════════════════════════════════╗
║ Agente Multipropósito                                            ║
║ Título: Diseño de Agentes Multipropósito                         ║   ← una regla
║ Propósito: Diseñar un Agente Multipropósito basado en …          ║
╟──────────────────────────────────────────────────────────────────╢
║ Subsistemas: 9      Lint: ⚠ 1 hallazgo                           ║
║   · conducta       12 reglas                                     ║
║   · planes         118 (57 pendientes · 55 ejecutados · 6 …)     ║
╚══════════════════════════════════════════════════════════════════╝
contexto: Agente Multipropósito 34.0 KB de 35.0  ·  este repo 15.6 KB   ← otra regla
```

Son **dos reglas distintas** atadas al **mismo momento** —`al arrancar la sesión`— y de origen distinto: el bloque lo trae el Agente Multipropósito, la línea de abajo la sumó este repo. Ninguna sabe de la otra y ninguna se pisa: el subsistema las junta y las emite pegadas. Eso, y nada más, es lo que quiere decir que varias reglas **conviven en un momento**.

Lo que **no** es: un registro para consultar. El registro de reglas no se carga al arrancar y el agente no lo abre a mano. Es a propósito — una regla cargada al inicio de la sesión **se recita, no se obedece** (conocimiento `modos-de-falla-ante-reglas-escritas`), así que el aporte del subsistema es entregarla pegada al punto de acción.

## Cómo se arranca

**No hay que encenderlo.** Recién instalado, el subsistema llega con sus reglas del Agente Multipropósito ya vigentes: el bloque de arranque, los recordatorios de cada turno, el control de terminología al escribir y el aviso de cierre. Se ven trabajando desde la primera sesión.

Lo que sí se hace es **sumarle reglas propias del Propósito del repo**:

1. **Invocar `registrar-regla`.** Pide qué hay que asegurar y en qué punto del flujo, elige el **momento** y la **clase** compatibles, y escribe la fila en `INDICE-LOCAL.md`, el registro de este repo.
2. **Reiniciar la sesión** si la regla es del momento `al arrancar la sesión`; las de los demás momentos empiezan a entregarse en el turno siguiente. No hay que tocar ninguna configuración: el repartidor lee el registro vivo en cada disparo.
3. **Correr el lint** al cerrar cualquier tarea que haya tocado el subsistema:

   ```bash
   node .claude/conducta/lint-conducta/lint-conducta.js
   ```

Para ver qué entrega un momento sin esperar a que ocurra, se lo puede alimentar a mano — el ejemplo está en el [README del repartidor](establecer-conducta/README.md#probar-a-mano).

## Las dos decisiones de cada regla

Escribir una regla es contestar dos preguntas: **cuándo** se entrega y **qué se entrega**.

### Cuándo: el momento

Un **momento** es un punto del flujo que la máquina reconoce sin juzgar nada. Los que hoy se entregan:

| Momento | Sirve para | Ejemplo de lo que se consigue |
|---|---|---|
| `al arrancar la sesión` | poner algo a la vista del usuario antes de que pida nada | el bloque de arriba: estado del repo y peso del contexto |
| `cada turno` | recordarle algo al agente antes de cada respuesta | «respetá las preferencias que ya tenés cargadas» |
| `al escribir` | revisar o frenar lo que se acaba de escribir en un archivo | rechazar un texto que usa un término vetado |
| `al cerrar tarea` | avisar algo al terminar de responder | «esta sesión no asentó nada en ningún registro» |

El vocabulario completo, con el evento que dispara cada uno y en qué agentes anda, está en [`MOMENTOS.md`](MOMENTOS.md). Un repo puede declarar momentos propios en [`MOMENTOS-LOCAL.md`](MOMENTOS-LOCAL.md), pero **declararlos no los enciende**: que un momento se entregue es código del repartidor, no una fila de registro.

### Qué: la clase

La **clase** dice qué hace el subsistema cuando llega el momento. Son tres, y la diferencia práctica es **quién recibe el resultado y quién decide qué hacer con él**:

| Clase | Qué se escribe en la regla | Quién lo recibe | Quién decide |
|---|---|---|---|
| `Inyectar` | un texto fijo | el agente | el agente, con su juicio |
| `Ejecutar` | la ruta de un programa | el usuario, en su terminal | nadie: el programa ya resolvió |
| `Controlar` | la ruta de un Control | el agente, o nadie si el Control frena la acción | el Control |

El corte entre `Inyectar` y las otras dos es si lo que hay que asegurar necesita criterio. «Acordate de contrastar contra lo asentado» lo tiene que juzgar el agente, así que es un texto (`Inyectar`). «Este archivo usa un término vetado» se decide comparando contra una lista, sin criterio, así que lo resuelve un Control (`Controlar`). Y «mostrale al usuario el estado del repo» no es ni una cosa ni la otra: es producir una salida y mostrarla (`Ejecutar`).

Las tres se pueden mezclar en un mismo momento, como en el ejemplo del arranque. La definición formal de cada una está en [`CLASES.md`](CLASES.md); las clases **no se extienden por repo**, porque están implementadas en el código del repartidor.

### La excepción: `al cerrar tarea`

Es el único momento donde **entregar algo le cuesta al usuario un turno completo del modelo**, así que ahí el default es callar y una regla `Inyectar` no sale sola. Está explicado una sola vez, en [`MOMENTOS.md`](MOMENTOS.md#el-momento-donde-hablar-cuesta-un-turno).

## Qué esperar al usarlo

- **Casi nada de esto se ve.** Solo el momento `al arrancar la sesión` escribe en la terminal del usuario. Los otros tres entregan su texto al agente; el usuario nota el efecto —que el agente respetó una regla— pero no el recordatorio.
- **Una regla `Inyectar` no obliga.** Entrega un texto y el agente actúa con su juicio; puede desobedecerlo. Lo único que garantiza cumplimiento es un Control que frene la acción.
- **Agregar o cambiar una regla no toca ningún mecanismo.** El repartidor lee el registro en cada disparo, así que la fila nueva rige de inmediato.
- **Cuesta tiempo en cada evento.** Alrededor de 65 ms por disparo, dominados por arrancar el intérprete (conocimiento `latencia-hooks`). Una regla `Ejecutar` o `Controlar` suma además lo que tarde su programa.
- **Fuera de Claude Code hay degradaciones**, documentadas por momento en [`MOMENTOS.md`](MOMENTOS.md). La principal: en Codex, frenar una acción todavía no funciona y la regla degrada a aviso.
- **Un aviso de un trabajo en segundo plano llega tarde, y llega igual.** Lo que se averigua después del arranque —hoy, el chequeo de plugins— queda en el Buzón de Avisos Generales (`.claude/tmp/avisos/`) y se entrega en el turno siguiente, una sola vez.
- **Los temporales de un control van en su carpeta de `.claude/tmp/`.** La regla está en `herramientas/README.md`, punto 5.

## El texto de `cada turno` tiene un tope de peso, y pasarlo solo avisa

Las reglas `Inyectar` del momento `cada turno` llegan juntas, en un solo bloque, antes de **cada** respuesta del agente. Ahí viven también las reglas que hacen falta para operar los subsistemas y que antes estaban escritas dentro de las habilidades: una regla dentro de una habilidad solo actúa si la habilidad se dispara, y en este momento actúa siempre, con la condición escrita en su texto («Antes de mover o renombrar…», «Si detectás que un plan…»).

El costo es que **cada regla de ese momento se paga en todos los turnos**, y un bloque pesado diluye a las demás reglas que van en él. Por eso el peso del bloque se mide y tiene un tope:

- **Qué se mide.** El texto de las reglas `Inyectar` vigentes de `cada turno`, de los dos Índices, como las emite el repartidor; la parte del Agente Multipropósito y la del repo, por separado. El tope es sobre las dos juntas, porque al agente le llega un solo bloque.
- **Qué queda afuera.** Todo lo que el agente consulta cuando lo necesita —preferencias, Índices, páginas— y lo que el repartidor suma a veces sin ser una regla fija: el contraste con los registros y los avisos del Buzón. El tope no limita lo que el agente puede obtener: solo lo que recibe sin pedirlo.
- **Quién lo mide.** La Herramienta `medir-contexto` del repo que publica el Agente Multipropósito, que es donde se decide qué reglas trae la Base. No viaja a los Agentes Desplegados. El número del tope y de dónde salió están escritos **solo** en su código (la constante `TOPE_CADA_TURNO`); este README no lo copia, para que no queden dos números que diverjan.
- **Qué pasa al pasarlo.** Nada se bloquea. Aparece un aviso al arrancar la sesión que dice qué midió, cuánto dio, cuánto es de la Base y cuánto del repo, el tope y qué hacer.
- **Qué hacer.** Pasar a un momento más específico la regla que se pueda detectar sin juicio —una que pida algo antes de un `git mv`, por ejemplo—, o acortar su texto. Subir el tope es la tercera salida, y se decide en ese código, con su motivo al lado.

## Lo que no cubre

- **No inventa momentos nuevos desde el registro.** Declarar uno en `MOMENTOS-LOCAL.md` deja sus reglas en estado `pendiente` hasta que el repartidor lo contemple, que es código del Agente Multipropósito.
- **No admite clases nuevas por repo.** No hay `CLASES-LOCAL.md`, y es deliberado: el motivo está en [`CLASES.md`](CLASES.md).
- **No guarda el contenido de los otros subsistemas.** Una regla deriva al subsistema que corresponde —preferencias, conocimiento, semántica— en vez de copiar lo que ahí está escrito. Copiarlo lo dejaría divergiendo en dos lugares.
- **No cubre el momento del commit.** Está declarado y todavía no tiene repartidor.

## Dónde está el detalle

- **El registro de reglas:** [`INDICE.md`](INDICE.md) (las del Agente Multipropósito) e [`INDICE-LOCAL.md`](INDICE-LOCAL.md) (las de este repo). El repartidor lee los dos.
- **Los dos vocabularios:** [`MOMENTOS.md`](MOMENTOS.md) y [`CLASES.md`](CLASES.md).
- **El mecanismo** que entrega las reglas, su contrato y por qué está armado así: [`establecer-conducta/`](establecer-conducta/README.md).
- **Los controles** que corren como reglas: [`detectar-terminologia-vetada/`](detectar-terminologia-vetada/), [`avisar-contexto-pesado/`](avisar-contexto-pesado/), [`avisar-sesion-sin-asentar/`](avisar-sesion-sin-asentar/), [`avisar-alta-a-mano/`](avisar-alta-a-mano/) —lista para engancharse, sin regla todavía— y [`mostrar-pantalla-bienvenida/`](mostrar-pantalla-bienvenida/).
- **El lint,** que valida que toda regla apunte a un momento existente, con clase y estado válidos, y que ninguna regla `vigente` cuelgue de un momento sin repartidor: [`lint-conducta/`](lint-conducta/).
