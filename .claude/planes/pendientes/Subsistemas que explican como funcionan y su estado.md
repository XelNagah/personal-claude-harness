# Subsistemas que explican cómo funcionan y su estado

**Estado: Nuevo · Creado 26-07-20.** Pedido de Javier el 26-07-20: *"quiero poder preguntar por la memoria, por el conocimiento, las herramientas… preguntarle al agente qué hace y cómo funciona y que explique mecanismos y dominio."*

## Qué se pide

Que el agente multipropósito **y cada subsistema por separado** puedan explicarse de forma consistente. Dos preguntas distintas, con respuestas de naturaleza distinta:

1. **Cómo funciona** — el mecanismo y su dominio. Es información estática: ya está escrita, pero desparramada entre el `SKILL.md` de la funcionalidad, la memoria `feedback_*`, el `README.md` del plugin y la sección correspondiente de `AGENTS.md`.
2. **En qué estado está** — cuántas entradas tiene, qué falta, si el lint pasa, si hay cosas sin indexar. Es información dinámica: se calcula leyendo el índice y corriendo el lint.

Hoy el agente responde las dos a su manera cada vez, según qué archivo haya leído en esa sesión. No hay una forma acordada de contestar.

## Por qué no es el plan diferido

[Funcionalidades como agentes consultables](Funcionalidades%20como%20agentes%20consultables.md) es **consulta de contenido**: *"che, agente conocimiento, ¿sabemos algo de X?"*. Se difirió porque su valor depende del volumen de cada base, y el volumen depende del propósito del repo.

Este plan es **autodescripción**: *"¿qué es el subsistema de conocimiento y cómo lo uso?"*. Su valor no depende del volumen — un subsistema recién instalado y vacío necesita explicarse igual o más. No hereda el motivo del diferimiento.

Los dos pueden convivir: uno contesta sobre el contenido, el otro sobre el continente.

## Por qué importa ahora

El 26-07-20, el autor del repo preguntó *"¿qué es la Base?"* sobre un concepto central de su propio proyecto. Ese mismo hecho abrió [Revisar la nomenclatura de los subsistemas](Revisar%20la%20nomenclatura%20de%20los%20subsistemas.md).

Los dos planes atacan el mismo problema por lados opuestos: renombrar arregla el nombre de una vez; que el subsistema se explique arregla la consulta cada vez. Se complementan — un nombre bueno no elimina la necesidad de explicar el mecanismo, y una buena explicación no salva a un nombre opaco.

Y si el repo va a servir a otras personas (ver [Separar mecánica del harness de criterio del autor](Separar%20mecanica%20del%20harness%20de%20criterio%20del%20autor.md)), la autodescripción pasa de comodidad a requisito: es cómo se orienta alguien que no estuvo en las conversaciones donde se diseñó esto.

## Direcciones a evaluar

1. **Una skill por subsistema** (`explicar-memoria`, `explicar-conocimiento`…). Cada una viaja en el plugin de su funcionalidad, como las Skills de Subsistema que ya existen (decisión 0009). Consistente por construcción, pero son 8 piezas más para mantener sincronizadas.
2. **Una sola skill transversal** que reciba el subsistema por parámetro y arme la respuesta leyendo los documentos de ese subsistema. Una pieza sola; el riesgo es que quede genérica y no sepa lo particular de cada uno.
3. **Convención, sin skill nueva.** Cada `INDICE.md` suma una sección corta y estándar de "cómo funciona", y el estado sale de lo que el lint ya reporta. Costo mínimo, pero nada obliga al agente a contestar con esa forma: vuelve a depender de que lea el archivo correcto.
4. **Herramienta que emite el estado** (conteos, resultado de lint, faltantes) y el agente narra el mecanismo encima. Aprovecha que `control-cierre` ya recorre todos los subsistemas y reporta por cada uno.

Las direcciones no son excluyentes: 4 resuelve bien el estado y 1 o 2 resuelven mejor el mecanismo.

## Preguntas abiertas

- ¿La explicación del **agente multipropósito completo** es la suma de sus subsistemas, o es un texto propio? Sospecha: es propio, porque lo interesante es cómo se articulan entre sí, y eso no está en ninguno de ellos por separado.
- ¿A qué profundidad se contesta? No es lo mismo "para qué sirve la memoria" que "por qué las memorias llevan `metadata.type` y qué pasa si falta".
- ¿Se apoya en el material que ya existe (`SKILL.md`, `feedback_*`, `README.md`) o se escribe una explicación nueva? Si es lo primero, hay que resolver que hoy está repetido en cuatro lugares con redacciones distintas.
- ¿Hace falta que el usuario pueda pedirlo por nombre (una skill que se dispara), o alcanza con que el agente sepa contestar cuando le preguntan en lenguaje corriente?

## Depende de

Conviene después de [Revisar la nomenclatura de los subsistemas](Revisar%20la%20nomenclatura%20de%20los%20subsistemas.md): escribir explicaciones sobre nombres que están por cambiar es trabajo que se rehace.
