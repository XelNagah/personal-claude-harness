# Terminología Farlopa como subsistema propio

**Estado: Nuevo · Creado 26-07-22.** Origen: sesión de `planificar` del 22/07 sobre el plan *efecto conductual*, al vetar `tripa`.

## El problema

Hoy la **Terminología Farlopa** vive como **una sola fila del glosario** (concepto-paraguas) más un mapa término→reemplazo en su página de detalle. Cada término vetado que no tiene un concepto de dominio propio (anglicismos, calcos, jerga) se apila ahí. Dos síntomas observados el 22/07:

1. **Acumula y ensucia el glosario.** El mapa crece sin techo (ya ~14 términos); el glosario es terminología del dominio, y esta fila es un cementerio de anti-términos que no aporta al dominio, solo al lint de regresiones.
2. **Difumina el concepto referido.** Al vetar `tripa`, el significado al que apuntaba (*contenido interno de la Herramienta*) quedó como texto en una celda del mapa, no como un concepto con su definición. La solución es elegante pero **tal vez imprecisa**: un vetado que arrastra un concepto real termina escondiéndolo en una tabla de reemplazos.

## A evaluar

¿Merece Terminología Farlopa **un subsistema propio** (`.claude/<...>/` con índice + lint), separado del glosario, para que el glosario no acumule anti-términos? Trade-offs a pesar:

- **A favor:** el glosario queda solo con terminología del dominio; el registro de vetados escala sin ensuciar; el lint de regresiones de vetados se muda con su dato.
- **En contra:** otro subsistema = más superficie (patrón 0002, funcionalidad, plugin, orquestador, nivelador). El veto está hoy acoplado a la gobernanza del glosario (0004/0018): el agente propone, el usuario veta — separarlo obliga a replicar ese control.
- **Punto medio posible:** dejar el veto en el glosario pero mover **solo** el mapa/cementerio a otro lado; o distinguir "vetado que arrastra un concepto real" (merece su concepto) de "vetado puramente farlopa" (solo mapa).

## Preguntas abiertas

- ¿Subsistema nuevo, o basta separar el mapa dentro del glosario?
- ¿Cómo convive con la gobernanza de veto de 0004/0018 (control del usuario)?
- El caso disparador (`tripa` → *contenido interno de la Herramienta*): ¿ese concepto amerita entrada propia en el glosario, en vez de vivir como reemplazo? Cruza con `Criterio de pertenencia al glosario`.
- ¿Toca el `lint-glosario` (sección [5] apariciones de vetados) y su distribución a consumidores?

Correr por `planificar`.
