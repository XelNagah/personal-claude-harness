---
name: contrastar
description: Lee los registros del repo enteros contra un material dado — un archivo, un handoff, un documento de otro repo, un texto pegado — y trae las definiciones, decisiones y planes que ese material toca, aunque el material no cite ningún código. Delega la lectura en el subagente `contrastador`. Use when el usuario dice "contrastá esto", "qué sabemos de esto", "revisá esto contra el repo", "contrastá este archivo"; o al arrancar a trabajar sobre un material que entró a la sesión desde afuera — un handoff, un README, un documento viejo, un archivo de otro repo — antes de tocar nada.
---

# contrastar — traer del repo lo que este material toca

Esta habilidad existe porque el material que entra a una sesión desde afuera no pasa por
ningún control. El mecanismo del **Contraste automático** corre en cada turno y compara el
mensaje del usuario más los códigos que el material cite; es barato, corre siempre y por
diseño trae poco. Esta habilidad es la otra mitad: es cara, se invoca a mano, lee los
registros enteros y **no depende de que el material cite nada**.

El caso que la motiva: *«leé este archivo y seguimos»*. El agente carga un documento entero
y arranca a trabajar sin que ninguna de sus palabras se haya comparado contra lo asentado.
Un README, un archivo de otro repo o un documento viejo no citan códigos, así que el hook
no les inyecta nada — a propósito.

## Qué recibe

El **material**: la ruta de un archivo, o un texto pegado en el pedido. Si el usuario dice
«contrastá esto» sin más, es el último material que entró a la sesión; si hay más de uno,
preguntar cuál antes de recorrer.

Opcionalmente, el **foco**: sobre qué se lo contrasta. Sin foco, se contrasta entero.

## Qué hacer

1. **Delegar el recorrido en el subagente `contrastador`**, pasándole el material y el foco.
   Lee los cuatro registros enteros —glosario, relaciones vetadas, decisiones y planes
   vivos— en su propia ventana y devuelve las filas que aplican. **No leer los registros en
   el hilo principal**: es lo que esta habilidad existe para evitar.

   En un agente sin subagentes, el recorrido se hace en el hilo principal siguiendo las
   mismas instrucciones del subagente. Cambia el costo, no el flujo.

2. **Separar lo que el hilo ya tenía.** El subagente marca qué filas venían citadas en el
   material: esas puede haberlas inyectado el hook solo. Lo valioso de esta pasada es lo
   **no citado** — lo que el material toca sin saber que existe.

3. **Juzgar, que es lo que el subagente tiene prohibido.** Sobre las filas que trajo:

   - **¿El material contradice una decisión vigente?** Decirlo con la decisión a la vista,
     no como sospecha.
   - **¿Usa un término del glosario en otro significado, o una relación vetada?** Marcarlo.
     Si el término no está en ningún registro y compite con uno canónico, no adoptarlo:
     eso es trabajo de `converger-terminologia`, que se invoca aparte.
   - **¿Hay un plan vivo sobre lo mismo?** Decir cuál y en qué estado, para no abrir trabajo
     duplicado.

4. **Informar en tres grupos**, y nada más:

   - **Ya decidido** — lo que no hay que re-decidir, con qué dice cada decisión.
   - **Trabajo ya abierto** — los planes vivos sobre el tema, con su estado.
   - **Terminología** — los términos del material que chocan con el glosario o con las
     relaciones vetadas.

   Si un grupo va vacío, decirlo en una línea. Un grupo omitido se lee como que no se miró.

5. **No actuar sobre lo que se encontró.** Contrastar termina cuando el material está a la
   vista. Corregir el texto, abrir un plan, registrar un término o revisar una decisión son
   habilidades propias, y cada una pasa por el usuario.

## Qué NO hace

- **No analiza ni diseña.** Eso es `amp:planificar`, que invoca a este mismo subagente como
  primer paso. Si el pedido era analizar algo, invocar esa habilidad, no ésta.
- **No barre terminología del repo.** Mira el material que se le pasó, no el repo entero:
  el barrido completo es `converger-terminologia`.
- **No escribe en ningún registro.**

## Cierre

Verificar antes de emitir, contra la propia respuesta: que estén los **tres grupos** —incluidos
los vacíos, dichos en una línea—; que cada fila citada lleve su tipo delante del código; que el
bloque de alcance del subagente esté reportado, con los registros que leyó y las filas que dejó
afuera; y que no se haya escrito ni corregido nada. Si alguna no se cumple, corregir la
respuesta antes de mandarla.

Un contraste que no reporta qué quedó afuera se lee como uno completo, y el que lo lea va a
creer que el repo no tenía nada más que decir.

## Reconciliación

Es de solo lectura: se puede invocar cuantas veces haga falta y no modifica el repo. Si se
invoca dos veces sobre el mismo material, la segunda no repite la primera — reporta lo que
cambió desde la anterior, o dice que no cambió nada.
