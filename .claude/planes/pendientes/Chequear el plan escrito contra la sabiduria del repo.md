# Chequear el plan escrito contra la sabiduría del repo

**Estado: Nuevo · Creado 26-07-20.**

## Origen

Incidente 2026-07-20. El agente escribió dos documentos de plan completos. La skill `planificar` manda leer glosario, decisiones y conocimiento **antes de arrancar**, y eso se hizo — pero nada chequea el texto **producido**. El agente acuñó `acote` (8 usos, sustantivo raro, nunca marcado como propuesto), contra la decisión 0004 y la preferencia de español corriente. Solo se detectó porque el usuario preguntó: *"¿ya lo analizaste contra el glosario? ¿Sin terminología farlopa?"*.

La pasada posterior encontró además `override`, `diffear` y `fallback` en texto plano. Ninguno lo habría frenado nadie.

## El patrón: tercer incidente de la misma clase

En una sola sesión se registraron tres fallas con la misma forma — **una regla escrita en un registro no actúa en el punto de acción**:

| # | Regla | Dónde falló | Plan |
|---|---|---|---|
| 1 | Preferencia de comunicación (ejemplos concretos de cada postura) | Violada dos veces, con contexto fresco | [Hook de preferencias en punto de accion.md](Hook%20de%20preferencias%20en%20punto%20de%20accion.md) |
| 2 | Control de ratificación (el glosario lo tiene; decisiones no) | "Decisiones tomadas" afirmando elecciones que el usuario no hizo | [Control de ratificacion para decisiones.md](Control%20de%20ratificacion%20para%20decisiones.md) |
| 3 | `planificar` manda consultar glosario/decisiones/conocimiento | Se consultó al entrar, no se chequeó lo escrito | este |

Las tres proponen un hook. **Si cada plan inventa el suyo, quedan tres mecanismos distintos para el mismo problema** — que es exactamente el defecto que acaba de costar el plan de unificación de lints (cuatro criterios conviviendo para resolver una ref).

Recomendación del agente, **a ratificar**: decidir el mecanismo **una vez** para la clase, y que los tres planes lo consuman. No fusionar los planes — cada uno tiene su regla y su punto de disparo propios — pero sí resolver el "cómo" en uno solo.

Evidencia disponible, del plan #1: el hook re-inyectado (caveman) nunca se violó en toda la sesión; las preferencias escritas sí, dos veces. Sugiere que re-inyectar en el punto de acción funciona donde escribir en un registro no.

## Conexión con lo ya decidido

La **decisión 0003** fija integridad en dos capas: mecánica (lints `.js`, sin LLM) **obligatoria**, y semántica (contradicciones, incompatibilidades, desactualización — requiere LLM) *"hoy informal, pendiente de formalizar"*. Lo que pide este plan **es** esa capa semántica, acotada a un punto de disparo concreto. No es una capa nueva: es formalizar la que 0003 dejó pendiente, empezando por el caso más barato.

Se cruza con el plan [Capa semantica de coherencia](Capa%20semantica%20de%20coherencia%20-%20contradicciones%20e%20incompatibilidades.md) (Diferido desde 26-07-18), que ataca lo transversal entre subsistemas. Este es más chico y más concreto: un solo artefacto (el plan), un solo momento (al escribirlo).

## Preguntas a resolver (ninguna decidida)

1. **¿Qué parte es mecánica y qué parte necesita LLM?** Separables: barrer el texto contra los términos canónicos y sus alias es mecánico (lo hace un `.js`); juzgar si un término nuevo es acuñación o palabra del usuario, o si el plan contradice una decisión vigente, no lo es. La parte mecánica podría ser un lint; la semántica, un paso de skill o un hook que re-inyecta.
2. **¿Cuál es el punto de disparo?** Candidatos: hook sobre `Write`/`Edit` con ruta bajo `.claude/planes/` (el más limpio: patrón de ruta concreto); paso obligatorio al final de `planificar` y `ciclo-de-plan`; o al cerrar el plan. Ojo: escribir un plan no siempre pasa por esas skills.
3. **¿Solo planes, o todo artefacto que el agente escribe?** El incidente fue en un plan, pero el mismo riesgo corre en memorias, páginas de conocimiento y decisiones. Empezar por planes es acotado; extender después es más trabajo pero cubre el hueco real.
4. **¿Qué hace el control cuando encuentra algo?** Frena y pregunta (Control, según el glosario), o informa y sigue. El glosario ya define `Control` como *"chequeo que frena el avance si no se cumple"* — usar ese umbral evita inventar semántica nueva.

## Pasos (después de resolver lo de arriba)

1. Resolver la pregunta de mecanismo compartido con los planes #1 y #2 (o registrar que se decidió no compartirlo, y por qué).
2. Implementar la parte mecánica, si se decide que la hay.
3. Implementar el disparo acordado; registro doble de hook si aplica (settings de Claude + `.codex/hooks.json`, decisión 0010).
4. Probar en negativo: introducir a propósito un término acuñado en un plan y verificar que el control lo frena. Sin esa prueba no se sabe si el control detecta o si no había nada que detectar.
5. Si el mecanismo viaja a los repos consumidores, propagar con `propagar-harness` y bumpear versiones.
6. Cierre con `control-cierre` verde.

## Riesgo

Un control que dispara en cada escritura de plan y exige repasar tres registros hace la sesión impracticable, y termina desactivado. El costo tiene que ser proporcional: barrer terminología es barato y automatizable; releer todo el conocimiento en cada guardado, no.
