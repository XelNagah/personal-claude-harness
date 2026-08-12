# Distribuir el inventario de componentes sueltos a los Agentes Desplegados

**Estado: Nuevo · Creado 26-08-12.** Origen: el punto 4 del frente B del plan Local-0037 (*Que el harness tenga efecto conductual*), que se cerró repartiendo lo que le quedaba vivo.

## El problema

`inventariar-componentes-sueltos` barre `.claude/` y lista los componentes —archivos y carpetas— que no pertenecen a ningún subsistema ni a la infra conocida. Es el **único control del repo que mira lo que quedó afuera**: los diez lints de subsistema barren cada uno adentro del suyo, y esa asimetría es el punto ciego que motivó el plan Local-0037.

Hoy figura en el Índice del Agente Desplegado (Herramienta Local-0003), así que **no viaja**. Cada Agente Desplegado tiene el mismo punto ciego y ningún control que lo mire. La Herramienta acepta una ruta para apuntarla a un repo ajeno a mano, que es como se la usó hasta ahora: diagnóstico manual de quien publica, no control del que recibe.

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
