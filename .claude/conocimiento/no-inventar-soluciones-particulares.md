# No inventar soluciones particulares cuando ya existen mecanismos

Cuando el repo ya tiene una forma de decidir algo, un rincón nuevo **no se inventa la suya**. La segunda forma no se nota el día que se escribe: se nota el día que aparece un caso donde las dos no coinciden, y para entonces ya hay código, controles y decisiones apoyados en ella.

## Por qué no se nota al escribirlo

Mientras **todos** los casos caen del mismo lado, las dos formas dan idéntico resultado. La regla propia parece funcionar perfecto, y de hecho funciona: no hay ningún caso que las distinga, así que nada emite señal. Recién el primer caso distinto revela que había dos mecanismos para la misma pregunta.

Por eso no alcanza con revisar si la regla nueva anda. Anda. La pregunta es si decide algo que ya se decidía en otro lado.

## Qué queda cuando aparece ese caso

Ninguna de las dos salidas obvias es el arreglo:

- **Obedecer la regla propia** — forzar el caso a entrar. Cuesta poco una vez, y es exactamente así como se llena de cosas inútiles lo que se distribuye: cada caso individual es barato, la suma no.
- **Abrirle una excepción** — dejar la regla y agregarle un permiso. Cada excepción hay que recordarla, probarla y explicarla, y la próxima va a querer la suya.

La tercera, que es la buena, es **sacar la regla propia y usar el mecanismo que ya existía**. Cuesta más ese día y deja de costar para siempre.

## La señal de alarma

Al escribir una regla que decide **por ubicación** —todo lo de esta carpeta viaja, nada de este directorio se toca, lo de acá siempre es de tal tipo—, preguntarse si el repo ya decide eso mismo **por declaración** en otro lado.

La señal literal es escribir **«todo lo de acá»** o **«nada de acá»**. Una regla sin excepciones sobre una carpeta es una apuesta a que nunca va a aparecer un caso distinto, y las carpetas viven más que las apuestas.

## Ejemplos medidos

### `.claude/common/` y qué viaja a los Agentes Desplegados

Medido el 01/08/2026. La carpeta nació con una regla propia: **todo lo que vive adentro viaja**. Era razonable —no es un subsistema, no acumula entradas de nadie, y un archivo sin contraparte ahí es un olvido, no algo normal—, y el control que la vigila se escribió en base a ella.

Pero el repo **ya decidía** qué viaja de otra manera: cada archivo declara su `origen`, y ese origen lo dice. La carpeta no lo usó.

**El primer caso que no encajaba apareció el mismo día**, en la tanda siguiente: un módulo compartido por tres Herramientas locales, que no le sirve a ningún repo instalado. El margen entre crear el mecanismo paralelo y chocar con él fue de **horas**, no de meses.

Se resolvió por la tercera salida (Decisión Local-0050): la carpeta dejó de tener regla propia y el control pasa a leer el Índice de Herramientas, que ya está partido por origen. Las dos salidas descartadas fueron las de arriba — mandar el módulo igual, y agregarle una exclusión al control.
