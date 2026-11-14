# El contraste automático no trae los planes ni las fichas que tocan el pedido

**Estado: Nuevo · Creado 26-11-13.** Origen: plan Local-0129 (plan maestro), arreglo 2 del análisis de un mes de conversaciones. Informe: `D:\Proyectos\analisis\como-uso-claude\.claude\conocimiento\analisis-2026-11\agentes-que-no-usan-lo-guardado.md`.

## El problema

«El dato no estaba cargado y nada disparó la consulta» es la segunda causa (21 de 59 episodios firmes). Lo que se consulta a demanda —planes, fichas, páginas de conocimiento— solo llega al agente si lo abre.

El Contraste automático (término del glosario Local-0036) tiene dos caminos: por coincidencia con el mensaje, que mira solo semántica y decisiones, y por cita, que además trae planes. El análisis encontró que trae casi siempre la misma decisión, nunca planes ni fichas por coincidencia, y nunca las páginas que no tienen fila en un Índice.

Casos (Impresión 3D):
- 26/10/2026: «¿No estarás midiendo OTRA VEZ el cepillo…? Eso ya lo habíamos aprendido». El plan decía desde el 21/10 «No medir hasta Y = 215».
- 01/11/2026: «Otra vez me preguntás siempre lo mismo… en-PLA se llama». El dato estaba en la ficha del filamento y en el plan; volvió a pasar a las 16:06.

## Lo que hay que resolver

1. Por qué trae casi siempre la misma decisión (¿umbral, tope de 3 filas, silencio de 20 turnos?).
2. Sumar planes vivos al camino por coincidencia y decidir si suma fichas y páginas de conocimiento. Cambia el alcance que fijó la Decisión Local-0062 (registros de semántica y decisiones, umbral alto): es una decisión del usuario.
3. Medir el costo por turno: el presupuesto de los hooks bloqueantes es de menos de 100 ms (conocimiento Local-0005).

## Cruces

- plan Local-0128 (El material que el agente abre sin que el mensaje lo nombre no se contrasta): vecino, pero sobre qué material entra al contraste, no sobre qué registros devuelve.
- plan Local-0121 (Reemplazar por capacidades nativas de hooks lo que el Agente Multipropósito construyó a mano): puede cambiar cómo se construye.
