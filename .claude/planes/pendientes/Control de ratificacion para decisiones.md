# Control de ratificación para decisiones

**Estado: Nuevo · Creado 26-07-20.**

## Origen

Incidente 2026-07-20, en esta misma sesión. Analizando la frontera de resolución de refs para los lints, el usuario eligió "lo más general" sobre una pregunta de acote. El agente **cambió el ancla propuesta** (de detectar `.git` a detectar `AGENTS.md`) y lo escribió en el documento del plan bajo el título **"Decisiones tomadas"**, presentando como resuelto algo que el usuario nunca eligió. El usuario lo marcó: *"No tomes decisiones por mí, dale? No me preguntaste nada."*

El glosario ya tiene un control para el caso análogo (que el agente acuñe términos). Decisiones no lo tiene.

## Diagnóstico

El control del glosario está replicado en cuatro lugares. Decisiones lo tiene en uno solo, y condicionado:

| Dónde | Glosario | Decisiones |
|---|---|---|
| Preámbulo de `INDICE.md` (en el repo) | *"Toda entrada nueva pasa por el usuario: el agente puede proponer términos (marcados como propuestos), pero no se asientan como canónicos sin ratificación."* | **ausente** |
| `PLANTILLA.md` (texto que viaja a los repos) | presente | **ausente** |
| `README.md` de la funcionalidad | presente | **ausente** |
| Skill de uso | `converger-terminologia`: *"el agente propone; ratificar, vetar o reescribir es del usuario"* | `registrar-decision` paso 4 pide confirmar antes de asentar — **pero solo corre si se invoca la skill** |

**El hueco de fondo no es el registro.** La decisión 0004 ya cubre los *términos* dentro de una decisión ("ningún término acuñado por el agente se asienta sin ratificación"), y `registrar-decision` cubre el acto de escribir una fila. Lo que ningún control cubre es **afirmar una decisión fuera del registro**: en un documento de plan, en un resumen de sesión, en un mensaje. Ahí el agente puede consolidar una elección que el usuario no hizo, y esa afirmación después se cita como si estuviera acordada.

El fallo es de la misma clase que el del plan pendiente [Hook de preferencias en punto de acción](Hook de preferencias en punto de accion.md): una regla escrita en un registro no actúa como control en el **punto de acción**. Aquel plan anota la evidencia relevante — el hook re-inyectado nunca se violó, la preferencia escrita sí. Los dos planes probablemente compartan mecanismo; resolver si se unifican.

## Preguntas a resolver (ninguna decidida)

1. **Alcance del control.** ¿Cubre solo asentar en `decisiones/INDICE.md` (paridad literal con el glosario), o también afirmar decisiones en otros artefactos — planes, resúmenes, mensajes? El incidente que motiva el plan cae en el segundo grupo; el primero no lo hubiera evitado.
2. **Mecanismo.** ¿Texto en el preámbulo del registro (como el glosario)? ¿Preferencia en la Base? ¿Hook en el punto de acción, como propone el plan de preferencias? ¿Combinación? Nota: el glosario resuelve con texto, y este incidente ocurrió **con** ese texto presente en el repo — evidencia de que el texto solo no alcanza para el caso ancho.
3. **Estado `propuesta` en el registro.** ¿Se agrega a la columna Estado, junto a `vigente` / `reemplazada por NNNN`, para que una decisión no ratificada pueda quedar asentada como propuesta y `lint-decisiones` la vigile? Le daría control mecánico a lo que hoy es solo texto. Contra: el glosario no lo tiene (marca los propuestos en prosa), y agregar estado rompe paridad entre los dos registros.
4. **Marca en el documento de plan.** ¿Los planes distinguen tipográficamente "decidido por el usuario" de "propuesto por el agente"? Hoy la sección se llama "Decisiones tomadas" sin distinguir origen — el formato mismo invita a consolidar. Se cruza con el plan pendiente [Estructura del documento de Plan](Estructura del documento de Plan.md), que todavía no definió el esqueleto.
5. **¿Amerita decisión estructural propia?** El control de terminología es la decisión 0004. Si este control se adopta, ¿va como decisión nueva, como ampliación de 0004, o no es estructural? — **a ratificar por el usuario, no asumir.**

## Pasos (después de resolver lo de arriba)

1. Escribir el control acordado en `.claude/decisiones/INDICE.md` (preámbulo).
2. Replicarlo textualmente a `funcionalidades/decisiones/skills/inicializar-decisiones/PLANTILLA.md` y al `SKILL.md`, y al `README.md` de la funcionalidad — paridad con los cuatro lugares del glosario.
3. Si el alcance resulta ancho (pregunta 1), evaluar si va también a la Base de `PREFERENCIAS.md` — y si va, entra en el circuito de propagación de la Base.
4. Si se adopta estado `propuesta` (pregunta 3), ajustar `lint-decisiones` y propagarlo.
5. Propagar con `propagar-harness` a las funcionalidades tocadas y al orquestador `setup-completo`. Bumpear `version` de los `plugin.json`.
6. Cierre: `control-cierre` verde.

## Riesgo

Un control demasiado ancho convierte cada elección menor en una consulta y hace la sesión impracticable. El límite útil hay que definirlo: **decisiones estructurales** ya tiene criterio en el registro ("¿condiciona el repo a futuro?"); usar ese mismo umbral evita inventar uno nuevo. El incidente que motiva el plan pasa ese umbral holgado — el ancla de la frontera define comportamiento de los cinco lints en todos los repos consumidores.
