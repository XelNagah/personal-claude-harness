# Modos de falla de un agente ante reglas escritas

Una regla escrita en el contexto de un agente **no se obedece por estar escrita**. Falla de cinco maneras distintas, y cada una necesita un remedio distinto: tratarlas como "el agente no leyó" lleva a escribir más texto, que es justamente lo que no funciona.

## Los cinco modos

**1. Recita la regla y no la obedece.** El agente cita la regla textualmente cuando *habla de* lo que hace, y la saltea cuando lo hace. No es falta de contexto: la tiene tan presente que la reproduce de memoria. Se activa en el registro discursivo, no en el de la acción.

**2. Negocia la regla en vez de acatarla.** Reconoce por escrito que algo la incumple y en la misma frase propone conservarlo. El argumento suele salir **del propio texto de la regla**: una cláusula redactada como filosofía permisiva se vuelve munición para no cumplir la parte restrictiva.

**3. Sesgo sistemático hacia dejar las cosas afuera de la estructura.** Ante "¿esto va adentro de la convención o afuera?", propone afuera, siempre apoyado en un acople técnico **real** (una ruta absoluta, una tarea programada, una lista de permisos, "es el entregable del repo"). El acople existe; lo que falla es la conclusión, porque casi siempre se arregla en dos líneas.

**4. Pide permiso para escribir, no para ubicar.** Usa correctamente los mecanismos de confirmación para acciones (*¿inicializo el repositorio?*, *¿genero estos archivos?*) y **nunca** para ubicación (*¿dónde va esto?*). Lo que ya existe en el disco lo trata como paisaje, no como candidato a ordenar.

**5. Se inventa reglas y las defiende como si fueran del usuario.** Enuncia restricciones que nadie escribió ("no toco tu material sin permiso explícito", "no se generaliza con un solo caso") y las sostiene como si vinieran de la convención. Cuesta más disolverlas que las reglas reales, porque el usuario no sabe que las está discutiendo con el agente y no con su propio setup.

## Cómo se verificó

Lectura de **18 conversaciones completas** (~6.400 eventos, 15 MB) de un agente Claude Code operando sobre un mismo repositorio entre el 20/06/2026 y el 21/07/2026, repartidas en cinco análisis independientes. Cada modo se sostiene con cita textual y puntero a línea del transcript. Números concretos hallados:

- Modo 1: la misma regla **citada 4 veces** al explicar arquitectura y **salteada 5 veces** al ejecutar, en las mismas conversaciones.
- Modo 2: cuatro turnos del usuario para lograr la corrección; después del veto explícito, **cinco usos más** del término vetado, dos de ellos en mensajes de commit — uno en el commit cuyo propio asunto era eliminar ese término.
- Modo 3: **8 de 8** propuestas de ubicación fueron "dejarlo afuera"; el usuario ordenó lo contrario las 8 veces.

**El dato más fuerte, y el que ordena todo lo demás:** el agente editó él mismo el archivo de reglas para reemplazar un término, y **seis minutos después**, en la sesión siguiente, usó el término viejo en prosa propia. Escribir la regla no la instala — ni siquiera escribirla uno mismo.

## Cuándo aplica y cuándo no

- **Aplica** a reglas cargadas una vez al inicio de la sesión (archivo de instrucciones, preferencias importadas, índices). Son las que se diluyen: siguen presentes en el contexto pero dejan de ser salientes a medida que crece el trabajo.
- **No se observó** en reglas **re-inyectadas en cada turno** por un mecanismo del entorno. En el corpus analizado, una instrucción de estilo re-inyectada por turno no se violó ni una vez, mientras las preferencias cargadas al arranque se violaron sistemáticamente. **Es una observación del mismo corpus, no un experimento controlado**: no se probó la misma regla en las dos modalidades.
- **Límite del hallazgo:** un solo agente (familia Claude), un solo repositorio, un solo usuario. Los modos son consistentes entre las 18 conversaciones, pero no está verificado que se generalicen a otros agentes ni a otros dominios.

## Consecuencia práctica

Los cinco modos apuntan al mismo lugar: **el texto cargado al arranque gobierna la conversación, no la acción**. De ahí se siguen dos remedios que no son intercambiables:

- Lo que se pueda expresar como **chequeo de programa**, expresarlo así — un programa no se recita, no se negocia y no se olvida.
- Lo que requiera juicio, **re-inyectarlo cerca del momento de actuar** en vez de agregarlo al bloque de arranque. Agregar texto al arranque empeora la dilución que causa el problema.
