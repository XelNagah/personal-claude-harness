# Herramienta Base para reiniciar la sesión desde un handoff

**Estado: Nuevo · Creado 26-07-25.** Idea de Javier. Hoy reiniciar una sesión para seguir limpio es un procedimiento manual de tres pasos que el usuario ejecuta a mano cada vez.

## Objetivo

Que un Agente pueda **reiniciarse y continuar**: terminar su propia sesión y dejar corriendo una sesión nueva, en el mismo directorio, que arranque leyendo un handoff y siga la tarea sin arrastrar el contexto viejo.

El hueco es real y ya está documentado del otro lado: el README de `actualizar-plugins` termina en *"Después hay que reiniciar la sesión"* y ahí se corta — nada reinicia. Lo mismo pasa cuando el contexto se llenó, cuando un plugin se actualizó a mitad de sesión, o cuando la conversación acumuló ruido que ensucia el trabajo que falta. En los tres casos el usuario hace lo mismo a mano: pedir el handoff, cerrar la ventana, abrir otra, pegar el handoff.

## Idea semilla

Lo más básico posible, tal como lo planteó Javier:

> Un script que reciba un PID y una ruta a un archivo de handoff; termine el proceso de ese PID; y lance un `claude` nuevo en el mismo directorio que lea ese handoff para continuar la tarea.

Encaja con el patrón de **Herramienta Base** que ya existe (`actualizar-plugins`): script en `.claude/herramientas/<nombre>/`, README al lado, capa mecánica sin juicio, vista previa por omisión y `--aplicar` para actuar. El juicio —qué contar en el handoff, cuándo conviene cortar— queda del lado del Agente, como en toda Herramienta.

Precedente útil: `actualizar-plugins` ya deduce el proceso de la sesión viva por la variable de entorno `CLAUDE_PID`, así que averiguar el PID propio no es trabajo nuevo.

## Preguntas de diseño abiertas

- **Cómo le llega el handoff a la sesión nueva.** Cuatro caminos, ninguno probado: (1) argumento de prompt inicial en la invocación de `claude`; (2) la ruta pasada como `@archivo` dentro de ese prompt; (3) un archivo en ubicación convenida que una regla de `conducta` en el momento `al arrancar la sesión` levanta e inyecta (mecanismo ya existente, el mismo de la Pantalla de bienvenida); (4) un parámetro de la CLI que agregue contexto al arranque. El (3) es el más integrado y el que más se cruza con `Buzones`; el (1) es el más barato para el piloto.
- **Quién termina a quién, y en qué orden.** El script corre **como hijo de la sesión que va a terminar**: si mata a su padre sin desprenderse antes, se mata a sí mismo a mitad de camino. ¿Lanza primero y termina después (dos sesiones vivas unos segundos), o termina primero desde un lanzador ya desprendido (riesgo de quedarse sin ninguna si el lanzamiento falla)?
- **Cómo sabe que la sesión nueva terminó de arrancar.** Solo hace falta si el orden es lanzar→terminar. Candidatas: esperar a que exista el proceso hijo (débil: existir no es estar listo), una marca en disco que escriba un hook `SessionStart` de la sesión nueva (fuerte, pero suma un Componente de Subsistema que hay que instalar), o un tiempo de espera fijo (frágil). Tercera opción: que el orden elegido haga la pregunta innecesaria.
- **Dónde aparece la sesión nueva.** La vieja es dueña de la terminal. ¿Ventana nueva, misma terminal heredada, pestaña nueva? Es la parte menos portable de todo el diseño y la que decide si esto es usable o una curiosidad.
- **Multiplataforma.** Terminar un proceso y lanzar uno desprendido se escriben distinto en Windows y en entornos POSIX. La auditoría externa ya marcó que `instalar-junctions` es solo-Windows: repetir el patrón sin declararlo es sumar deuda conocida. ¿El piloto declara Windows y deja el resto para después, o se diseña portable desde el primer día?
- **Relación con la skill de handoff.** **En el harness no hay una.** Lo que se usa hoy es la skill `handoff` de un plugin de terceros más la convención de dejar el archivo en `.claude/tmp/`. Tres opciones: la Herramienta acepta cualquier archivo de texto y no opina; el harness suma su propia skill que produce el handoff en un formato que la Herramienta espera; o el formato se fija por convención escrita sin skill. La primera es la única que no bloquea el piloto.
- **Dónde vive.** ¿Herramienta Base (viaja a los ~18 Agentes Multipropósito vía `amp:inicializar`) o Herramienta del Propósito de este repo? El disparador refuerza que sea Base: la necesidad de reiniciar aparece en cualquier repo, no solo autorando el harness. Y si es Base, hereda el corte Base/aprendido del registro de Herramientas, que ya está separado por origen.
- **Alcance de agentes.** ¿Solo Claude Code, o también Codex CLI por la paridad que fija la decisión 0010? Un script que lanza `claude` por nombre no sirve para Codex; parametrizar el ejecutable es barato si se decide temprano.
- **Quién lo dispara.** ¿El usuario a mano, el Agente cuando detecta que conviene cortar, o una regla de `conducta`? Que el Agente decida solo cuándo terminarse es un salto de autonomía que merece decisión aparte.

## Riesgos

- **Terminar el proceso equivocado.** Con ~18 Agentes Multipropósito abiertos, un PID mal pasado cierra la sesión de otro repo con trabajo sin guardar. Peor: si el PID resuelto es el de la terminal padre, se lleva la ventana entera. Mitigación mínima antes de actuar: verificar que el proceso sea efectivamente un `claude` y que su directorio de trabajo coincida con el del handoff — y mostrarlo en la vista previa para que el usuario lo vea antes de confirmar.
- **Perder trabajo no persistido.** Una terminación dura no le da a la sesión vieja oportunidad de guardar: tareas en segundo plano a medio correr, ediciones no escritas, resultados de herramientas en vuelo. Y todo lo que pasó *después* de redactar el handoff se pierde en silencio, porque el handoff ya estaba escrito.
- **Perder el hilo.** La sesión nueva no tiene historial: lo que no esté en el handoff no existe. El riesgo real no es el corte sino **repetir trabajo ya hecho** creyendo que falta, o rehacerlo distinto.
- **Condición de carrera entre terminar y lanzar.** Si lanza primero: dos sesiones vivas en el mismo repo, las dos con hooks que escriben, las dos capaces de tocar los mismos archivos. Si termina primero y el lanzamiento falla: no queda ninguna sesión, el handoff queda en disco y el rescate es manual.
- **Bucle de reinicio.** La sesión nueva lee el handoff, concluye que hay que reiniciar y vuelve a llamar la Herramienta. Necesita marca de consumido — es exactamente la condición 2 de `Buzones` (un solo uso), y la razón por la que ese plan descartó leer cualquier archivo del directorio de borradores.
- **El handoff como vía de instrucción.** Un archivo en disco que la sesión nueva obedece por el solo hecho de encontrarlo es una entrada de instrucciones que nadie autorizó en esa sesión. Condición 5 de `Buzones`: es contexto para proponer, no orden a ejecutar.

## Alcance mínimo del piloto

Deliberadamente chico, para probar la mecánica antes de decidir nada de lo de arriba:

- Un script `.claude/herramientas/reiniciar-sesion/reiniciar-sesion.js` + README, molde `actualizar-plugins`.
- Invocación: `node .claude/herramientas/reiniciar-sesion/reiniciar-sesion.js --handoff <ruta> [--pid <n>] [--aplicar]`.
- **Vista previa por omisión** (igual que `actualizar-plugins` y `amp:actualizar`): imprime qué proceso terminaría —con su nombre y su directorio de trabajo, no solo el número— y qué comando lanzaría. No toca nada. `--aplicar` ejecuta.
- PID por parámetro; si no viene, lo deduce de `CLAUDE_PID` como ya hace `actualizar-plugins`.
- Handoff: cualquier archivo de texto. Sin formato obligatorio, sin skill nueva.
- Windows como único entorno del piloto, declarado en el README.
- Un solo camino de entrega del handoff (el más barato) para poder medir; los otros tres quedan para después.
- Disparo a mano por el usuario. Sin regla de `conducta`, sin buzón, sin reinicio automático.

**Éxito del piloto:** con el usuario mirando, una sesión nueva arranca en el mismo directorio, muestra que leyó el handoff y sigue la tarea; la vieja queda cerrada; nada más se cerró.

**Fuera del piloto:** entrega automática al arrancar, marca de consumido, formato de handoff, Codex, entornos POSIX, y que el Agente decida solo cuándo reiniciarse.

## Se cruza con

- [Buzones de comunicación entre Agentes](Buzones%20de%20comunicacion%20entre%20Agentes.md) — mismo problema a la distancia "entre sesiones". Ese plan aporta las 5 condiciones que cualquier entrega de handoff tiene que cumplir; este aporta la mecánica de terminar y lanzar. Conviene que el buzón no se diseñe sin mirar esta Herramienta ni al revés.
- [Control de desfase entre el harness en disco y el plugin cargado](Control%20de%20desfase%20entre%20el%20harness%20en%20disco%20y%20el%20plugin%20cargado.md) — ese plan detecta que hay que reiniciar; este es el que reiniciaría. `actualizar-plugins` ya deja la frase colgada.
- [Crecer el subsistema conducta](Crecer%20el%20subsistema%20conducta.md) — si la entrega del handoff se hace en el momento `al arrancar la sesión`, es una regla de conducta y el repartidor ya existe.
- [Habilidad de ejecución de planes](Habilidad%20de%20ejecucion%20de%20planes.md) — un motor que ejecuta un plan de punta a punta necesita cortar y retomar sin perder el hilo; esta Herramienta sería su forma de reiniciarse.
- [Título de sesión y momentos de disparo de la Pantalla de bienvenida](Titulo%20de%20sesion%20y%20momentos%20de%20disparo%20de%20la%20Pantalla%20de%20bienvenida.md) — con sesiones que se reinician solas, distinguir cuál ventana es cuál pesa más.

Correr por `amp:planificar` antes de construir, salvo que se decida ir directo al piloto mínimo por ser barato y reversible.
