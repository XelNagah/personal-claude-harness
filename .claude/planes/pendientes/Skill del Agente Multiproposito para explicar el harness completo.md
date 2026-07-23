# Skill del Agente Multipropósito para explicar el harness completo

**Estado: Nuevo · Creado 26-07-23.** Origen: [Subsistemas que explican cómo funcionan y su estado](../ejecutados/Subsistemas%20que%20explican%20como%20funcionan%20y%20su%20estado.md). Ese plan resolvió la **mitad 1** (explicar cada subsistema por separado, vía MANIFIESTO enriquecido, decisión 0023) y desprendió acá la **mitad 2**.

## Qué se pide

Que el agente pueda explicar **el harness completo**, no un subsistema aislado: *cómo se articulan los siete subsistemas entre sí*. Es la foto de conjunto que ningún MANIFIESTO da —cada uno habla de sí mismo— y que hoy vive desparramada entre `AGENTS.md` y el registro de decisiones.

Ejemplos de lo que solo existe en la mitad 2:

- Por qué `planes` **no** carga su índice pero `memoria` sí (modelo de carga de contexto, decisión 0017).
- Cómo `conducta` se apoya en los otros seis subsistemas **sin** reimplementarlos (decisión 0021).
- Por qué `herramientas` y los lints son cosas distintas aunque ambos sean archivos `.js` (decisión 0008).

## Idea semilla (Javier, 26-07-23)

Una **Skill del Agente Multipropósito** (decisión 0009: transversal, sin subsistema dueño, empaquetada como funcionalidad propia — como `planificar`). Trae una **estructura general** de la explicación del conjunto y **recorta** a lo que aplica en cada repo consumidor (un repo con `conducta` sin instalar no lo explica; los conteos/estado salen de `amp-info`).

## Requisito de arranque: no reabrir lo ya cerrado

Antes de diseñar, contrastar contra dos decisiones vigentes:

- **0022 (reemplazada por 0023):** propuso una skill transversal que *ensambla en runtime* la explicación **por subsistema**, y se **descartó por sobreingeniería** — el MANIFIESTO ya cargado alcanza para la mitad 1.
- **0023:** enriqueció el MANIFIESTO como fuente de la autodescripción **por subsistema**.

La justificación de este plan es distinta y hay que sostenerla: para el **conjunto** (mitad 2) **no hay una fuente única siempre cargada** —la articulación está partida entre `AGENTS.md` y las decisiones—, así que acá una skill sí puede ganarse el lugar que no se ganó para la mitad 1. Si el análisis muestra que `AGENTS.md` + los 7 MANIFIESTOs ya alcanzan, el plan se descarta.

## Preguntas abiertas (para `planificar`)

- ¿Skill nueva, o basta con designar `AGENTS.md` como fuente canónica del conjunto y que el agente conteste desde ahí?
- ¿La explicación del conjunto es un **texto propio** (cómo se articulan) o la **suma** de los MANIFIESTOs? (El plan padre sospechaba: propio, porque la articulación no está en ninguno por separado.)
- ¿A qué profundidad contesta? (No es lo mismo "qué subsistemas hay" que "por qué el modelo de carga de 0017 es así".)
- ¿Cómo "recorta" a lo instalado sin hardcodear la lista de subsistemas? (Descubrimiento dinámico, como `amp-info` / `pantalla-bienvenida`.)
- ¿Se cruza con `amp-info` (estado dinámico)? La skill sería el "cómo funciona el conjunto"; `amp-info` ya es el "en qué estado está".

## Al construir (si sobrevive al análisis)

- Nombre **verbo+objeto** (decisión 0015) + **ratificación** del usuario (decisión 0016).
- Operacional ⇒ sin lint (decisión 0003).
- Si viaja al consumidor, respetar que el texto distribuido **no cita números de decisión del harness** (decisión 0024).

## Depende de / se cruza con

- **Diseñar por `planificar`** antes de construir.
- Se cruza con [Revisar la nomenclatura de los subsistemas](Revisar%20la%20nomenclatura%20de%20los%20subsistemas.md): explicar el conjunto sobre nombres que están por cambiar es trabajo que se rehace.
