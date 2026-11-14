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
| 1 | plan Local-0130 (Las reglas que viven dentro de una habilidad no se cumplen cuando la habilidad no se invoca) | 1 | A | Nuevo |
| 2 | plan Local-0131 (El contraste automático no trae los planes ni las fichas que tocan el pedido) | 2 | B | Nuevo |
| 3 | plan Local-0111 (Avisar al cerrar una tarea que hay algo para asentar) | 3 y 6 | D | Listo |
| 4 | plan Local-0132 (El agente le pide al usuario que copie un texto a otra sesión en vez de consultar al otro repo) | 4 | C | Nuevo |
| 5 | plan Local-0107 (Que la consulta a otro Agente use la credencial correcta de la máquina) | 5 | C | Análisis |

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
