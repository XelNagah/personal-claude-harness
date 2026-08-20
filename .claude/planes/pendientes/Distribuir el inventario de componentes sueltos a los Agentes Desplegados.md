# Distribuir el inventario de componentes sueltos a los Agentes Desplegados

**Estado: En pausa · Creado 26-08-12.**
**estado_a_retomar:** Análisis
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

## Bloqueado por el plan Local-0108

La decisión 1 de acá es **la misma pregunta que la decisión 1 del plan Local-0108** (*Que un
Componente Base nuevo viaje sin que nadie lo agregue a mano*), vista desde el otro lado:

- Local-0108, parado en el **origen**: ¿qué declara que un archivo de `.claude/` debe copiarse a `base/`?
- Local-0106, parado en el **destino**: ¿qué declara que un hijo de `.claude/` lo puso el Agente Multipropósito?

Si Local-0108 resuelve con **un registro que viaja** —el camino que la Decisión Local-0050 ya usó
para `common/`, donde declarar una Herramienta es lo que decide si viaja—, ese mismo registro
contesta las dos. Si resuelve con un **campo de frontmatter**, no le sirve a este plan:
`common/*.js` no lleva frontmatter y `output-styles/` es una carpeta.

Decidir acá sin esa respuesta es inventar un mecanismo propio para algo que el repo está por decidir
en otro lado — el conocimiento Local-0016 (*No inventar soluciones particulares cuando ya existen
mecanismos*). **Acordado el 20/08/2026:** se analiza Local-0108 primero y se vuelve acá con su
respuesta.

## Desbloqueado el 20/08/2026 — Decisión Local-0071

El plan Local-0108 cerró la pregunta compartida: **`base/` lleva un índice generado de lo que trae**,
con cómo llega cada componente (`copiado`, `generado` en el destino, o `fragmentos` por merge), y ese
índice **viaja adentro del plugin**.

Con eso, la decisión 1 de acá —de dónde saca la Herramienta qué es infraestructura— se contesta
sola: **lo lee del índice**. Se va la lista escrita a mano, y con ella el falso positivo de
`output-styles/` medido en los diez repos. El precedente de que `base/` está disponible en el destino
es `amp-actualizar.js:154`, que la resuelve como carpeta hermana; verificado en el cache de esta
máquina, `amp/0.46.7/skills/inicializar/base` trae las once carpetas.

**Este plan se retoma cuando Local-0108 esté ejecutado**, no antes: el índice tiene que existir para
poder leerlo.

Lo que sigue abierto acá, y no depende de Local-0108:

- **Reconocer un subsistema.** Hoy es por lint co-ubicado, y en el destino no se sostiene: un Agente
  Desplegado con harness viejo marca `planes/` y `preferencias/` como sueltos. El catálogo de
  `subsistemas/` es la fuente que sí sabe.
- **Lo que pone el CLI y no el Agente Multipropósito** (`settings.local.json`, `scheduled_tasks.lock`,
  `skills/`): el índice no los va a declarar, porque no son suyos. Queda por decidir cómo se los
  reconoce sin volver a una lista que envejece.
- **Las decisiones 2 y 3 originales**: si sube al Índice del Agente Multipropósito —el beneficio ya
  quedó verificado más arriba— y si sigue corriendo suelta o se cablea al control de cierre.

## Lo que hay que resolver antes de distribuirla

La lista de infra conocida está escrita a mano (`INFRA`, línea 36 de la Herramienta) y ya quedó vieja. Medido el 12/08/2026 en este repo, marca dos sueltos:

- **`output-styles/`** — el Estilo de Respuesta, que la Decisión Local-0069 convirtió en Componente del Agente Multipropósito el 11/08/2026. **Los siete Agentes Desplegados lo recibieron ese mismo día.**
- **`scheduled_tasks.lock`** — archivo de trabajo de las tareas agendadas del CLI.

Distribuirla tal cual le entrega a cada Agente Desplegado un control que nace marcando un Componente que el propio Agente Multipropósito le acaba de instalar. Es un hallazgo permanente y sin acción posible, y el conocimiento Local-0013 (*Controles que dejan de controlar sin avisar*) ya fijó que eso es defecto del control: *«Los hallazgos de un control tienen que ser resolubles: cada uno nombra algo que alguien puede llevar a cero. Si un estado legítimo y permanente enciende un hallazgo, el defecto es del control.»*

Es además la **forma 11** de ese mismo conocimiento, medida el día anterior sobre el actualizador: una lista de reconciliación escrita a mano que la fuente dejó atrás, y que se apaga justo para el destino que ya estaba al día.

## Lo que hay que decidir

1. **Cómo sabe la Herramienta qué es infra.** Hoy es una lista escrita a mano cuyo comentario la declara *«corta y estable a propósito»*, y que se rompió apenas el Agente Multipropósito sumó una carpeta. Lo que viaja en `base/` es la fuente que sí sabe qué instala el Agente Multipropósito, y la prueba del actualizador ya deriva de ahí los subsistemas que viajan reconociéndolos por su `MANIFIESTO.md`. Falta decidir si acá se deriva igual, y qué pasa con lo que no instala el Agente Multipropósito sino el CLI (`scheduled_tasks.lock`).
2. **Si sube al Índice del Agente Multipropósito.** La Decisión Local-0048 fija el criterio por beneficiario: sube si le sirve al Agente Desplegado para hacer bien su trabajo. Hay que argumentarlo, no darlo por hecho: la Herramienta nació como instrumento de quien publica.
3. **Cuándo corre.** Hoy corre suelta, deliberadamente **no** cableada al control de cierre, porque cablearla convertía el inventario en veredicto y los criterios para juzgar no estaban escritos. Desde entonces se escribió la Decisión Local-0020 (Test de demarcación), así que la premisa cambió y conviene revisarla.

## Lo que no cubre

**El barrido de la raíz del repo.** El plan Local-0037 lo listaba como pendiente hermano de este, pero la Decisión Local-0020 lo resolvió en sentido contrario: la raíz es donde vive el Producto del Propósito, que legítimamente no pertenece a ningún subsistema. Barrerla marcaría el trabajo real de cada repo como sospechoso. Queda fuera de alcance.
