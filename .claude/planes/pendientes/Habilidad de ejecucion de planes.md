# Habilidad de ejecución de planes

**Estado: Nuevo · Creado 26-07-22.** Idea de Javier el 26-07-22, al ver esta misma sesión ejecutar el handoff de propagación de manifiestos de punta a punta a mano.

## Qué se pide

Una **skill que ejecute un plan de punta a punta** — desde un plan pendiente (o un handoff) hasta el control de cierre — y **asiente el aprendizaje al cerrar** (rutear a los subsistemas lo que se descubrió, transicionar el plan). Hoy eso lo hace el agente a pulso, guiado por un handoff escrito a mano.

## A evaluar (no decidido)

- **Contra `Workflow`** (orquestación multiagente determinista): ¿esta habilidad es una skill que *usa* Workflow para las partes paralelizables (copia Textual, verificación por inclusión), o es una skill lineal que delega a subagentes frescos como hace hoy la memoria de propagación? Un plan grande = descubrir el work-list + pipeline sobre él.
- **Solape a resolver:** la parte "asentar el aprendizaje al cerrar" ya la cubre el plan [Verificar que el aprendizaje quede asentado en los subsistemas](Verificar%20que%20el%20aprendizaje%20quede%20asentado%20en%20los%20subsistemas.md) (reusa `/contrastar`, dirección hacia atrás). Esta habilidad sería el **motor de ejecución** que la invoca en la transición a Ejecutado — no duplicar ese mecanismo.
- **Contra el ciclo de planes:** ya existe `ciclo-de-plan` (abrir/transicionar). Esta sería la capa que *ejecuta el cuerpo* del plan, no solo mueve su estado.

## Preguntas abiertas

- ¿Skill nueva o modo de una existente? ¿Cuánto puede automatizarse sin perder los puntos de decisión del usuario (los cruces que hoy resuelve `planificar`)?
- ¿Cómo sabe la skill cuándo delegar a subagente fresco (memoria de propagación) vs. hacerlo inline?
- ¿Qué pasa si el control de cierre no da verde? ¿Reintenta, reporta, abre un plan de arreglo?

## Evidencia que lo motiva

Esta sesión (26-07-22): un handoff de ~170 líneas guió la propagación a 6 funcionalidades + orquestador con subagente fresco + verificación por inclusión + control de cierre. Todo el andamiaje (byte-source, verificación, asentar §6) estaba escrito a mano en el handoff. Una habilidad lo volvería repetible.

## Achique contra la plataforma (26-08-06)

La orquestación que la sección «A evaluar» dejaba abierta ya no se construye: la dan la herramienta Workflow (encadenar subagentes de forma determinista), las tareas de seguimiento y los subagentes continuables de la plataforma. El alcance vivo de este plan queda en lo que la plataforma no hace: leer el plan persistido, conservar los puntos de ratificación del usuario, asentar el aprendizaje al cerrar y cerrar con el control de cierre. Achique ratificado en la poda de pendientes contra la plataforma (ítem 5 del plan de consumo de tokens).

## El contrato, definido (26-08-26)

Salió de la consulta del Agente Desplegado *Agente-Coordinador*, que estaba
pidiéndoles a otros agentes «ejecutá tu plan» en texto plano. Que el verbo no exista
es peor que un hueco de catálogo: **cada ejecución improvisó su propio flujo, así
que no hay dos ejecuciones comparables** — y comparables es justo lo que hace
falta para poder correr varias a la vez.

**Qué hace.** Toma un plan `Listo` —o uno `En curso` que se retoma—, lo pone
`En curso`, ejecuta el cuerpo del plan y para en el borde, dejando el trabajo
hecho **sin commitear y sin cerrar**.

**Qué no hace.** No analiza, no decide lo que el plan dejó abierto, no cierra, no
commitea.

**Tres salidas, y son el contrato:**

- **Terminó** → queda `En curso`, con el trabajo en el árbol, esperando revisión
  y `cerrar-plan`.
- **Topó una decisión** → `pausar-plan` con `estado_a_retomar: En curso`, más su
  entrada en la cola de decisiones. No adivina.
- **No era ejecutable** → vuelve a `Análisis`, diciendo qué le faltaba.

**El corte contra `analizar-plan`** es la compuerta `Listo` de la Decisión
Local-0057: `analizar-plan` produce un plan ejecutable y `ejecutar-plan` lo
consume. Si al ejecutar aparece que el plan no estaba listo, **no lo analiza al
vuelo**: devuelve. Ese corte es lo que evita que `ejecutar-plan` se coma a la
familia entera y se vuelva la mega-habilidad que el plan Local-0070 quiere partir.

**El corte contra `cerrar-plan`**: cerrar exige aprobación del usuario y es donde
se asienta el aprendizaje, que es un trabajo distinto de ejecutar. Cerrar antes de
la aprobación deja el plan cerrado en falso si el resultado se rechaza.

**Lo que le sigue faltando a este plan:** qué hace con el aprendizaje al cerrar
—hoy remite al plan «Verificar que el aprendizaje quede asentado en los
subsistemas», que sigue en `Nuevo`— y cómo se comporta cuando corre dentro de una
copia de trabajo aislada, que en julio no estaba sobre la mesa.

Este plan es **precondición** de [Hacer avanzar varios planes a la vez hasta la
próxima decisión del usuario](Hacer%20avanzar%20varios%20planes%20a%20la%20vez%20hasta%20la%20proxima%20decision%20del%20usuario.md)
(Local-0119), que lo invoca desde su despacho por estado.
