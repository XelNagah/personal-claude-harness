# Los agentes saltean lo guardado cuando nada los lleva a consultarlo en el momento de actuar

**Estado: Nuevo · Creado 26-11-13.** Plan maestro. Origen: el usuario planteó el 13/11/2026 que los agentes guardan cosas en los registros pero después no las leen, no usan las habilidades y le preguntan lo que ya tendrían que saber. El análisis lo hizo el Agente Desplegado *Cómo uso Claude Code* (`D:\Proyectos\analisis\como-uso-claude`) sobre un mes de conversaciones de todos los repos.

**Este plan no tiene trabajo propio.** Lleva el orden, qué va en paralelo y el estado de cada plan hijo. Cada hijo se analiza, se ejecuta y se cierra por su cuenta; al cerrar uno, se actualiza la tabla de abajo. Este plan se cierra cuando cierran todos sus hijos y se repitió la medición (último paso).

> Trampa conocida (conocimiento Base-0006, *El plan que reparte su trabajo en otros planes*): los frentes se resuelven en los hijos y nadie vuelve al padre. Por eso la tabla de hijos es lo único que este archivo mantiene, y se actualiza en el mismo momento en que un hijo cambia de estado.

## El resultado del análisis

Informe completo: `D:\Proyectos\analisis\como-uso-claude\.claude\conocimiento\analisis-2026-11\agentes-que-no-usan-lo-guardado.md` (conocimiento Local-0030 de ese repo). ⚠️ Al 13/11/2026 estaba **sin commitear** allá.

- Período 14/10 al 13/11/2026; 184 sesiones recorridas con subagentes. 59 episodios firmes y 27 dudosos. La verificación ciega confirmó menos de la mitad tal cual: los 59 son un techo; las tasas se sostienen porque salen de conteos por sesión.
- **Conclusión:** el agente consulta lo guardado la mayoría de las veces; falla cuando nada lo lleva a consultarlo en el momento de actuar.
- Tasas: preguntas evitables 4 %; habilidades salteadas 42 % (68 de 163); altas en registros hechas a mano 43 % (34 de 79); olvidos de lo guardado 13 %.
- Causas de los episodios firmes: la habilidad no se disparó 26; el dato no estaba cargado y nada disparó la consulta 21; estaba cargado y no se aplicó 12; se disparó y no se siguió 4; faltaba un prerrequisito 2.
- 29 de los 59 pasaron con la versión 0.74.0 de `amp`: no es un problema viejo ya resuelto.
- **Refutado:** que el listado de habilidades recorte las descripciones de las `amp*`. Ninguna perdió la suya.
- Evidencia más clara de que el arreglo funciona: en Impresión 3D, una regla que vivía dentro de una habilidad (invocada en 3 de 19 sesiones) se cumplió siempre al pasar a regla de conducta.

## Planes hijos

| Orden | Plan | Arreglo del informe | Grupo | Estado |
|---|---|---|---|---|
| 1 | plan Local-0130 (Las reglas que viven dentro de una habilidad no se cumplen cuando la habilidad no se invoca) | 1 | A | Análisis |
| 2 | plan Local-0131 (El contraste automático no trae los planes ni las fichas que tocan el pedido) | 2 | B | Análisis |
| 3 | plan Local-0111 (Avisar al cerrar una tarea que hay algo para asentar) | 3 y 6 | D | Análisis |
| 4 | plan Local-0132 (El agente le pide al usuario que copie un texto a otra sesión en vez de consultar al otro repo) | 4 | C | Análisis |
| 5 | plan Local-0107 (Que la consulta a otro Agente avise cuando no arranca, traiga la respuesta completa, pueda leer archivos de otra carpeta y no se frene al resolver) | 5 | C | Análisis |

Fuera de este plan, a propósito:
- Arreglo 7 (depurar registros viejos o contradictorios): difuso; lo rozan el plan Local-0124 y el plan Local-0006.
- Arreglo 8 (huecos propios de cada repo, como «fijate en MercadoPago antes de preguntarme»): lo decide cada repo; el camino para ofrecer reglas es el plan Local-0126.

## Cómo se ejecuta

- **Grupos en paralelo, cada uno en su worktree** (Herramienta Base-0009 `preparar-worktree`). Un grupo junta los planes que tocan los mismos archivos: C reúne los dos de comunicación (`comunicar.js` y las habilidades `preguntar`/`resolver`).
- **Posibles choques entre grupos:** A y D escriben en `.claude/conducta/` (A suma reglas; D corrige el programa del aviso de cierre). Integrar uno y rebasar el otro antes de integrarlo.
- **Un agente coordinador** reparte cada grupo en subagentes, y él solo:
  - presenta al usuario cada decisión, una por vez, con el formato de la habilidad `explicar-plan`;
  - revisa el resultado de cada grupo, lo integra a `main` y corre `ejecutar-control-cierre --estricto`;
  - transiciona los hijos (`analizar-plan`, `cerrar-plan`) y actualiza la tabla de arriba;
  - borra cada worktree con la Herramienta Base-0010 `limpiar-worktree`, nunca con `git worktree remove`.
- Los subagentes traen evidencia y escriben código en su worktree; no deciden por el usuario ni escriben registros canónicos (Decisión Local-0060).

## Último paso: medir de nuevo

Cuando cierren los hijos y hayan pasado al menos dos semanas de uso, pedirle al Agente *Cómo uso Claude Code* (habilidad `preguntar` o `resolver`) que repita el mismo análisis con su Herramienta `condensar-sesiones` y compare las tasas. Sin esta medición no se sabe si los arreglos sirvieron.

## Estado

**15/11/2026 — decisiones tomadas, construcción sin empezar.**

- El grupo A (plan Local-0130) quedó decidido el 14/11; la #04 fue A, con la condición de documentar el mecanismo del tope para que el aviso se entienda solo.
- B, C y D se decidieron en **una sola página con pestañas** (`.claude/tmp/decisiones-tres-temas-2026-11-14.html`, https://claude.ai/artifact/ERoJTmKvHcykuxUih7fFbY), a pedido del usuario, con nombres que reconoce: «Aviso de lo ya guardado» (B), «Consultas a otro repo» (C) y «Aviso al cerrar» (D). Eligió la recomendada en las 22 fichas. Las respuestas están en cada plan hijo, sección «Respuestas del usuario a la página de decisiones — 15/11/2026».
- En `Listo` los cinco hijos: planes Local-0130, Local-0131, Local-0132, Local-0111 y Local-0107. Este último se renombró el 15/11 con el nombre que ratificó el usuario, que dice lo que resuelve y no el problema.
- El choque C↔D se resolvió con las dos medidas: la consulta devuelve el turno completo (plan Local-0107) y el aviso de cierre se calla ante una marca que pone `comunicar.js` (plan Local-0111).
- Al construir, quedan para el coordinador (no para un subagente, Decisión Local-0060): la decisión nueva que precisa la Decisión Local-0062 y la definición del Contraste automático en el glosario (plan Local-0131, #6), con el texto exacto mostrado antes.
- **Pendientes que no son construcción**, pedidos por el usuario el 15/11:
  - Renombrar los planes Local-0130, Local-0131 y Local-0132 para que su nombre diga lo que resuelven y no el problema, como ya se hizo con el plan Local-0107. Proponer cada nombre y esperar la ratificación.
  - Candidata a preferencia: «el nombre de un plan dice lo que resuelve, no el problema». Es la segunda corrección del usuario en esa línea (la primera fue pedir nombres que él reconozca en la página de decisiones). Proponerla con `registrar-preferencia`, mostrando el texto exacto.

**14/11/2026 — ronda de análisis hecha, construcción sin empezar.**

- Commit `aeb2af3` con los planes, para que las copias de trabajo los vean.
- Cuatro subagentes de solo lectura analizaron los cuatro grupos en paralelo (sin copias del repo: analizar no escribe). Lo que encontraron quedó escrito en cada plan hijo, en su sección del 14/11/2026, y los cinco hijos pasaron a `Análisis`. El plan Local-0111 volvió de `Listo`, porque no cubría los arreglos 3 y 6.
- **Choque nuevo, no previsto arriba:** C y D también se tocan. Para que la comunicación no pierda la respuesta, lo más directo es que el aviso de cierre (`conducta/avisar-sesion-sin-asentar/`, del grupo D) no actúe en una corrida no interactiva. Además, B toca el mismo repartidor que A y D.
- **Página de decisiones del grupo A**, con 5 fichas: `.claude/tmp/decisiones-grupo-a-2026-11-14.html`, armada con la plantilla del Agente Coordinador y publicada como página privada para verla en el celular (https://claude.ai/artifact/KJVcJgiaSeML2Dhn569wzV). El usuario la está contestando; la respuesta llega como un código `#01=A #02=…` pegado en el chat.
- Faltan las páginas de los grupos B (7 decisiones), C (10, entre los planes Local-0107 y Local-0132) y D (6). Las preguntas ya están escritas en cada plan hijo.
- Se descubrió que lo que hace este coordinador a mano es el diseño del plan Local-0119 (`avanzar-planes`), que todavía no existe; el usuario pidió que sea la forma estándar. Quedó anotado allá.
- Pendiente aparte: el informe de `como-uso-claude` sigue sin commitear en ese repo.
