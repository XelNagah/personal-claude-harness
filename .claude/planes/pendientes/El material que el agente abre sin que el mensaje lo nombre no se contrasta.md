# El material que el agente abre sin que el mensaje lo nombre no se contrasta

**Estado: Nuevo · Creado 26-11-12.** Origen: se desprende al cerrar el plan Local-0118 ([El Contraste automatico no lee los archivos que se le pasan y se queda con las palabras del pedido](../ejecutados/El%20Contraste%20automatico%20no%20lee%20los%20archivos%20que%20se%20le%20pasan%20y%20se%20queda%20con%20las%20palabras%20del%20pedido.md)), que dejó hecho su núcleo y este resto.

## El problema

El Contraste automático ya sigue el archivo que nombra el mensaje y trae las filas que ese archivo cita con su tipo delante. Quedan afuera dos casos:

- un material sin citas, como un handoff que explica el trabajo sin nombrar ningún código;
- un archivo que el agente abre por su cuenta, sin que el mensaje lo nombre.

En los dos, el agente trabaja sin haber contrastado lo que leyó contra los registros. La habilidad `contrastar` lo resuelve a demanda, pero se midió que no se dispara sola (0 de 2).

## Lo que hay que resolver

1. Elegir entre las tres salidas que dejó el plan de origen: colgarlo del hook, resolverlo en el handoff o aceptarlo a demanda.
2. Rehacer el caso `contrastar-02` del banco de `probar-disparo-de-skills`, que quedó mal armado.

## Cruces

- Plan Local-0043 (Habilidad de ejecución de planes): contrasta el plan entero con el `contrastador` al ejecutarlo; cubre la ejecución, no el arranque desde un handoff.
- Plan Local-0121 (Reemplazar por capacidades nativas de hooks lo que el Agente Multipropósito construyó a mano): su Alternativa B nombra este hueco como candidato a un hook con modelo fuera del camino crítico.
