# Controlar terminología y preferencias en commits

**Estado: Nuevo · Creado 26-07-27.**

Los controles actuales revisan los archivos del repositorio, pero no el asunto ni el cuerpo de los commits. Por eso un mensaje puede usar terminología que el repo evita o no respetar las preferencias de escritura.

## Objetivo

Antes de crear un commit, revisar su mensaje contra la Terminología Farlopa y las preferencias aplicables a commits.

## Alcance

- Elegir un único punto de control previo al commit.
- Validar asunto y cuerpo contra los términos vetados.
- Comprobar las preferencias mecánicamente verificables: español, formato y nombres completos del dominio cuando corresponda.
- Cubrir ejemplos que deben pasar y fallar.
- Propagar el control al Agente Multipropósito publicado si forma parte de su Base.

## Resultado esperado

Un commit con un término vetado o un formato contrario a las preferencias se rechaza antes de quedar registrado; un mensaje válido continúa sin pasos extra.

## Evidencia y diseño explorado (06/08/2026)

El hueco se manifestó en vivo: un barrido de terminología sobre el texto que el propio agente produjo en una sesión encontró dos términos vetados **ya asentados en la historia del repo** — `Workflow` y `transcript`, en mensajes de commit escritos ese mismo día. Ningún control los vio, y el agente tenía cargada en cada turno la regla que se lo prohibía. Es el primer modo de falla del conocimiento Local-0013 (Modos de falla ante reglas escritas): una regla inyectada se recita, no se obedece; hace falta un control.

Sobre el punto de control único que pide el alcance: **el momento ya está declarado** en `conducta/MOMENTOS.md` como `al crear un commit`, con disponibilidad `declarado` y la nota «repartidor específico pendiente». No hay que decidir el punto ni acuñar un momento nuevo: hay que construirle el repartidor. Hoy cuelgan cero reglas de ese momento, así que el `lint-conducta` no marca nada — el control que falta no emite ninguna señal de que falta.

Las dos partes grandes ya existen:

- **El juicio**, en `conducta/detectar-terminologia-vetada/`: lee el registro, distingue `bloquea` de `avisa` y exime lo citado entre comillas simples invertidas. No hay que tocar esa lógica.
- **El reparto**, en `establecer-conducta/`: falta la condición del momento — `PreToolUse` sobre `Bash` con el comando conteniendo `git commit`.

Lo que hay que sumar es una **cuarta forma de entrada** en el control, que hoy lee tres (`Write` con `content`, `Edit` con `new_string`, `apply_patch` de Codex con `command`).

**La trampa a resolver: extraer el mensaje, no inspeccionar el comando entero.** Un `git commit -F "planes/code review.md"` dispararía por el nombre del archivo y no por el texto. Y de las cuatro formas de pasar un mensaje, solo dos lo traen en el comando:

| Forma | ¿El texto está en `tool_input.command`? | Qué debe hacer el control |
|---|---|---|
| `-m "…"` | sí | inspeccionar |
| `-F -` con documento incrustado (`<<`) | sí | inspeccionar |
| `-F <archivo>` | no | callar |
| editor interactivo | no | callar |

Callar no es opcional: adivinar sobre lo que no ve convierte el control en uno de los que dan verde sin mirar (conocimiento Local-0013, Controles que dejan de controlar sin avisar).

**Lo que este plan no cierra.** El barrido encontró tres huecos y este es el único con mecanismo disponible. Los otros dos: la conversación no la puede inspeccionar ningún hook antes de que la respuesta salga, y el momento `al cerrar tarea` (`Stop`, también `declarado`) solo permitiría avisar en el turno siguiente, con el texto ya emitido.
