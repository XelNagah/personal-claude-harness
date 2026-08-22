# Distribuir el inventario de componentes sueltos a los Agentes Desplegados

**Estado: Ejecutado · Creado 26-08-12 · Cerrado 26-08-22.**
 Origen: el punto 4 del frente B del plan Local-0037 (*Que el harness tenga efecto conductual*), que se cerró repartiendo lo que le quedaba vivo.

## El problema

`inventariar-componentes-sueltos` barre `.claude/` y lista los componentes —archivos y carpetas— que no pertenecen a ningún subsistema ni a la infra conocida. Es el **único control del repo que mira lo que quedó afuera**: los diez lints de subsistema barren cada uno adentro del suyo, y esa asimetría es el punto ciego que motivó el plan Local-0037.

Hoy figura en el Índice del Agente Desplegado (Herramienta Local-0003), así que **no viaja**. Cada Agente Desplegado tiene el mismo punto ciego y ningún control que lo mire. La Herramienta acepta una ruta para apuntarla a un repo ajeno a mano, que es como se la usó hasta ahora: diagnóstico manual de quien publica, no control del que recibe.

## Lo medido el 20/08/2026

Corrida de la Herramienta sobre los **diez Agentes Desplegados** de esta máquina que tienen el
harness instalado (descubiertos por los proyectos que registró el CLI, filtrando los que tienen
`.claude/subsistemas/`). **18 hallazgos en total**:

| Hallazgo | Cuántos | Qué es |
|---|---|---|
| `output-styles/` | 10 | Falso positivo permanente: uno por repo, el 100% |
| `scheduled_tasks.lock` | 1 | Archivo de trabajo del CLI, en este repo |
| Reales | 7 | `memory/` y un `CLAUDE.md` en *Gaming* (generación retirada sin migrar) · cinco carpetas del Propósito dentro de `.claude/` en *Contabilidad-Personal-IA*: `datos/`, `documentos/`, `fuentes/`, `registro-ediciones/`, `sync/` |

Dos cosas quedan verificadas y salen de la lista de lo que hay que decidir:

- **El beneficio para el Agente Desplegado es real** (Decisión Local-0048, criterio por beneficiario):
  la Herramienta encontró un harness viejo sin migrar y cinco carpetas que violan el eje 1 del Test
  de demarcación. No es diagnóstico de quien publica.
- **La señal es 7 sobre 18**, y todo el ruido es un único falso positivo permanente.

**Un tercer defecto, no previsto por el plan:** apuntada a un Agente Desplegado con harness viejo
(`BeatSaber-Overlay`), marca `planes/` y `preferencias/` como sueltos. Son subsistemas legítimos; lo
que falla es reconocerlos **por su lint co-ubicado**, criterio que en el destino no se sostiene: una
instalación vieja o un subsistema local sin lint quedan marcados. El catálogo de `subsistemas/` —que
declara cada casa con su carpeta y viaja— es la fuente que sí sabe.

## Historia del bloqueo

Este plan estuvo bloqueado por el plan Local-0108 (*Que un Componente Base nuevo viaje sin que nadie
lo agregue a mano*): las dos primeras decisiones eran la misma pregunta vista desde cada punta —qué
declara que un archivo es del Agente Multipropósito, mirando el origen o mirando el destino—.
Local-0108 cerró el 21/08/2026 con la **Decisión Local-0076**, que reemplazó a la Local-0071: no hay
índice de lo que trae la Base; **lo que está adentro de `base/` viaja, y esa es toda la declaración**.
Para saberlo en el destino se lista el árbol de `base/`, que llega adentro del plugin.

## Acordado el 21/08/2026

### 1. Cómo sabe la Herramienta qué es infraestructura legítima

Se retira la lista escrita a mano de ocho nombres (`INFRA`, línea 36), cuyo comentario se declaraba
*«corta y estable a propósito»* y que se rompió apenas el Agente Multipropósito sumó una carpeta.
La reemplazan **los registros del propio repo**, en este orden:

1. **El catálogo de `subsistemas/`** — declara cada casa con su carpeta. Se le suman el criterio
   anterior (lint co-ubicado) y una tercera señal: una carpeta que contiene un Índice que se declara
   a sí mismo en su frontmatter es una casa aunque el catálogo todavía no la liste. **La unión, no el
   reemplazo:** cada señal tapa el agujero de las otras.
2. **Los enlaces de todos los Índices de Subsistema** — así se reconoce `common/`, declarado por el
   Índice de Herramientas, y así una Herramienta o una skill del Propósito quedan reconocidas apenas
   se registran, sin tocar el código.
3. **Lo que git no versiona** — material de trabajo. **Se informa en su propio grupo del reporte, no
   como hallazgo**: queda a la vista en vez de esconderse.
4. **Una lista escrita a mano de siete nombres**, que es justamente lo que ningún Índice declara:
   `identidad.md` y `settings.json` —los pone el Agente Multipropósito sin copiarlos—,
   `settings.local.json`, `output-styles/` —el único Componente del Agente Multipropósito sin
   registro propio— y las cuatro carpetas estándar del CLI: `skills/`, `commands/`, `agents/`,
   `hooks/`.

**Por qué NO se lista el árbol de `base/`, que es lo que la Decisión Local-0076 nombra como la fuente
del destino.** Al bajarlo a código apareció que **`base/` no llega al repo**: llega al depósito de
plugins de la máquina, con una versión adentro. El precedente que el plan citaba —`amp-actualizar.js`
resolviéndola como carpeta hermana— no aplica, porque ese script vive adentro del plugin y esta
Herramienta se copia al `.claude/` del destino. Alcanzarla obligaría a leer la configuración de
plugins —distinta en Claude Code y en Codex— y no tendría respuesta en un repo instalado por copia.
Medido: de los 11 hijos que trae `base/`, **10 ya están declarados** por el catálogo (9) y por el
Índice de Herramientas (`common/`); el único sin declarante es `output-styles/`. Son **siete nombres
escritos contra seis**, y a cambio la Herramienta describe **el repo que tiene delante** y no la
versión del plugin que haya en el depósito, que es la trampa del conocimiento Local-0008.

**Lo medido el 21/08/2026 en este repo:** de los 17 hijos de `.claude/`, 9 son casas del catálogo,
1 lo declara un Índice (`common/`), 5 son de la lista y 2 los ignora git. **Cero sueltos**, contra
los dos falsos positivos de antes.

### 1b. La fuente de git se apaga sola si `.claude/` entero no se versiona

**Falso negativo encontrado al probar contra un repo real** (`BeatSaber-Overlay`, harness viejo):
ese repo no versiona `.claude/`, así que **todos** sus hijos caían en «material de trabajo» y el
inventario contestaba **cero sueltos**, escondiendo sus hallazgos reales —el `memory/` de la
generación retirada entre ellos—. Un reporte en cero se lee como «está todo bien», que es la peor
forma de fallar (conocimiento Local-0013).

Arreglado: si `.claude/` entero está fuera del control de versiones, la fuente se apaga, **el reporte
avisa que se apagó** y lo no declarado vuelve a salir como hallazgo. Verificado: ese repo pasó de
0 a 5 hallazgos. Por el mismo motivo `settings.local.json` entró a la lista escrita en vez de
quedar a cargo de git: existe siempre, y con la fuente apagada sería un falso positivo permanente.

**Por qué la lista no se elimina del todo.** La Herramienta tiene dos cajones —reconocido y suelto— y
lo que no sabe nombrar cae en el segundo. Un hallazgo permanente que nadie puede llevar a cero es
defecto del control (conocimiento Local-0013). Y **no sirve la salida corta de ignorar todo lo que
puso el Agente Desplegado**: 5 de los 7 hallazgos reales medidos son exactamente eso —las cinco
carpetas del Propósito adentro de `.claude/` en *Contabilidad-Personal-IA*, que violan el eje 1 del
Test de demarcación (Decisión Local-0020)—. Con ese criterio la Herramienta se queda con 2 de 7.

Lo que sí cambia es **el ritmo al que la lista envejece**: hoy envejece con cada Componente Base
nuevo —la fuente rápida, la que la rompió— y con el CLI. Las fuentes 1 y 2 matan las dos: un
Componente Base nuevo aparece en `base/`, y un archivo de trabajo nuevo del CLI nace gitignoreado.
Quedan seis nombres que solo cambian si el producto Claude Code suma una carpeta estándar.

### 2. Reconocer un subsistema: por el catálogo, no por su lint

El criterio pasa a ser el catálogo de `subsistemas/` —los dos Índices, el del Agente Multipropósito y
el del Agente Desplegado— leído con `common/indices.js`. Hoy es por lint co-ubicado, criterio que en
el destino no se sostiene y que ya está medido fallando: un Agente Desplegado con harness viejo se
marca `planes/` y `preferencias/` como sueltos. El catálogo declara cada casa con su carpeta, viaja,
y es la misma fuente que ya usan los demás mecanismos.

### 3. Sube al Índice del Agente Multipropósito

Sube, y con eso viaja en `base/herramientas/`. El criterio por beneficiario (Decisión Local-0048)
está verificado con medición, no argumentado: los 7 hallazgos reales están en repos ajenos y son
problemas que el Agente Desplegado puede resolver —harness viejo sin migrar, contenido del Propósito
mal ubicado—. Deja de estar en el Índice del Agente Desplegado (Herramienta Local-0003).

### 4. Cuándo corre: sigue suelta

Se contesta sola: `ejecutar-control-cierre` está en el Índice del Agente Desplegado y **no viaja**,
así que en el destino no hay control de cierre al que cablearla. Sigue corriendo a demanda, como
hoy. Engancharla al control de cierre de **este** repo es una decisión aparte de este repo y no
forma parte de lo que se distribuye.

### 5. Necesita banco de pruebas antes de viajar

La Herramienta no tenía ninguno: su carpeta traía solo el código y el README. Al viajar queda
alcanzada por la Decisión Local-0075 —**todo banco que viaja fabrica su escenario con datos
sintéticos** y del `.claude/` instalado toma solo el mecanismo, nunca el contenido—. Cada fuente se
prueba **con su par**: algo que esa fuente tiene que reconocer y algo que no, y que sí debe salir
como hallazgo; un banco que solo probara el reconocimiento no distinguiría una fuente que anda de
una que reconoce todo.

## Notas de implementación (21-22/08/2026)

- **`common/enlaces-de-indices.js`** (Herramienta Base-0008, tipo `funcion`): el recorrido de los
  enlaces de los Índices, que estaba adentro de `sincronizar-base` y no viajaba. Ahora lo usan las
  dos puntas —el origen acotado a `origen: agente-desplegado`, el destino sin acotar—. Con 12 casos
  nuevos en el banco de `common/`.
- **`inventariar-componentes-sueltos`** reescrita con las cuatro fuentes, y su banco propio de 16
  casos. Pasa al Índice del Agente Multipropósito como **Herramienta Base-0007**; se retira la fila
  Local-0003. Viaja en `base/herramientas/` y entra a `HERRAMIENTAS_BASE` del actualizador.
- **README** de la Herramienta reescrito, sin enlaces a Componentes que no viajan.

## Lo que no cubre

**El barrido de la raíz del repo.** El plan Local-0037 lo listaba como pendiente hermano de este, pero la Decisión Local-0020 lo resolvió en sentido contrario: la raíz es donde vive el Producto del Propósito, que legítimamente no pertenece a ningún subsistema. Barrerla marcaría el trabajo real de cada repo como sospechoso. Queda fuera de alcance.

- **Decisión Local-0077** (*El inventario del destino lee los registros del repo, no la carpeta que trae el plugin*), que precisa la Local-0076.
- **Forma 15** del conocimiento Local-0013: *Una excepción que en otro repo se vuelve la regla*, con el falso negativo medido.
- Plugin `amp` 0.53.0. Control de cierre: 13 de 13.
