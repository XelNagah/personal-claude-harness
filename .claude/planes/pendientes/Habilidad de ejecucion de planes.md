# Habilidad de ejecución de planes

**Estado: Nuevo · Creado 26-07-22.** Idea de Javier el 26-07-22, al ver esta misma sesión ejecutar el handoff de propagación de manifiestos de punta a punta a mano.

## Qué se pide

Una **skill que ejecute un plan de punta a punta** — desde un plan pendiente (o un handoff) hasta el control de cierre — y **asiente el aprendizaje al cerrar** (rutear a los subsistemas lo que se descubrió, transicionar el plan). Hoy eso lo hace el agente a pulso, guiado por un handoff escrito a mano.

## A evaluar (no decidido)

- **Contra `Workflow`** (orquestación multiagente determinista): ¿esta habilidad es una skill que *usa* Workflow para las partes paralelizables (copia verbatim, verificación por inclusión), o es una skill lineal que delega a subagentes frescos como hace hoy la memoria de propagación? Un plan grande = descubrir el work-list + pipeline sobre él.
- **Solape a resolver:** la parte "asentar el aprendizaje al cerrar" ya la cubre el plan [Verificar que el aprendizaje quede asentado en los subsistemas](Verificar%20que%20el%20aprendizaje%20quede%20asentado%20en%20los%20subsistemas.md) (reusa `/contrastar`, dirección hacia atrás). Esta habilidad sería el **motor de ejecución** que la invoca en la transición a Ejecutado — no duplicar ese mecanismo.
- **Contra el ciclo de planes:** ya existe `ciclo-de-plan` (abrir/transicionar). Esta sería la capa que *ejecuta el cuerpo* del plan, no solo mueve su estado.

## Preguntas abiertas

- ¿Skill nueva o modo de una existente? ¿Cuánto puede automatizarse sin perder los puntos de decisión del usuario (los cruces que hoy resuelve `planificar`)?
- ¿Cómo sabe la skill cuándo delegar a subagente fresco (memoria de propagación) vs. hacerlo inline?
- ¿Qué pasa si el control de cierre no da verde? ¿Reintenta, reporta, abre un plan de arreglo?

## Evidencia que lo motiva

Esta sesión (26-07-22): un handoff de ~170 líneas guió la propagación a 6 funcionalidades + orquestador con subagente fresco + verificación por inclusión + control de cierre. Todo el andamiaje (byte-source, verificación, asentar §6) estaba escrito a mano en el handoff. Una habilidad lo volvería repetible.
