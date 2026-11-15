# El contraste automático no trae los planes ni las fichas que tocan el pedido

**Estado: Listo · Creado 26-11-13 · Analizado 26-11-14 · Decidido 26-11-15.** Origen: plan Local-0129 (plan maestro), arreglo 2 del análisis de un mes de conversaciones. Informe: `D:\Proyectos\analisis\como-uso-claude\.claude\conocimiento\analisis-2026-11\agentes-que-no-usan-lo-guardado.md`.

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

## Análisis del 14/11/2026

Lo hizo un subagente de solo lectura, coordinado desde el plan Local-0129. Trae evidencia; no decidió nada.

### Mecanismo actual (verificado)

- Entra por UserPromptSubmit (`.claude/settings.json:17-25`) al repartidor `establecer-conducta.js`, y solo contrasta en `cada turno` (`:654`). Lee `data.prompt` (`:462-464`).
- **Puntaje:** glosario, Terminología Farlopa y decisiones (`REGISTROS_PUNTAJE`, `:203-207`). Idf calculado sobre esas filas, Nombre con peso 3 y Descripción con peso 1, `UMBRAL = 7.0`, `TOPE = 3` (`:274`, `:280-310`).
- **Citas:** esos tres registros más `PLANES.md` (`:208-210`), del mensaje y del archivo apuntado (máximo 3 archivos y 200 KB, `:356-358`).
- **Memoria:** una fila entregada se calla 20 turnos (`:424`, `:492-495`), solo dentro de la sesión.
- Conocimiento, preferencias y Herramientas no entran por ningún camino (`:201-202`, `:315-317`).
- Pruebas: `conducta/establecer-conducta/pruebas.js`, 52 chequeos, con registros sintéticos (`:62-107`). Ninguno de latencia ni de corpus chico.

### Por qué trae siempre la misma decisión

- **Verificado:** en Contabilidad el corpus del puntaje tiene 11 filas (9 de glosario, 0 vetadas, 2 decisiones), y las marcas de `Contabilidad/.claude/tmp/contraste-automatico/` muestran `decisiones/INDICE.md#Local-0002` en dos de cinco sesiones.
- **Inferido con una simulación** que reimplementa la fórmula (no corre el hook): con 11 filas, una palabra que aparece en una sola pesa unos 2,0, así que una palabra del Nombre más una de la Descripción ya pasan 7,0. «Cuánto pagué de servicios este mes» trae la Decisión Local-0002 de Contabilidad (12,0). «Registrá la factura de AySA» no trae nada porque los planes no están en el puntaje.
- **Conclusión inferida:** el umbral se calibró con unas 166 filas (las de este repo) y no se adapta al tamaño del corpus del repo desplegado. Además, la memoria de 20 turnos no impide que la misma fila vuelva en cada sesión nueva.
- Corrección al informe: el informe dice que trae planes por coincidencia; el código los trae solo por cita.

### Latencia

El plan Local-0118 midió +2 a +6 ms sobre unos 150 ms que el hook ya costaba (fila 230 de ese plan). El hook entero ya pasa el tope de 100 ms del conocimiento Local-0005.

### Superposición con el plan Local-0128

El borde está claro: el plan Local-0128 decide qué material entra al contraste; este, qué registros devuelve. Se cruzan solo si este suma el contenido de páginas de conocimiento, que empuja hacia el modelo de documentos.

### Término sin ratificar: «ficha»

No está en el glosario y es ambiguo: en Herramientas es la carpeta de una herramienta; en el informe es una página del dominio («la ficha del filamento»). Hay que ratificar el término o elegir otro antes de construir (Preferencia Base-0010).

### Archivos y choques

`establecer-conducta.js`, `pruebas.js` y `README.md`, que viajan en la Base. La fila del término del glosario Local-0036 (Contraste automático) y quizás una decisión que precise la Decisión Local-0062: registros canónicos, con texto aprobado. Choque seguro con el grupo D (mismo repartidor) y probable con el A.

### Decisiones abiertas

1. ¿El umbral se ajusta al tamaño del corpus, o queda fijo?
2. ¿Los planes entran al puntaje: con su propio umbral, mezclados, o solo por cita como hoy?
3. ¿Solo planes vivos, o también ejecutados?
4. ¿Qué es una «ficha» y entra: fila de Índice (ya cargada), filas de subíndices de carpeta, o contenido de la página (zona del plan Local-0128)?
5. ¿Memoria solo por sesión, o entre sesiones con caducidad en días?
6. ¿Decisión nueva que precise la Decisión Local-0062, o solo reescribir la definición del término del glosario Local-0036?
7. ¿Qué se hace con la latencia ya pasada: aceptarla, bajarla antes de agregar alcance, o esperar al plan Local-0121?

### Respuestas del usuario a la página de decisiones — 15/11/2026

Página única de tres temas (`.claude/tmp/decisiones-tres-temas-2026-11-14.html`), pestaña «Aviso de lo ya guardado». El plan no recomendaba en ninguna; las recomendaciones las puso el subagente que armó las fichas, y el usuario eligió la recomendada en las siete.

- **#1 = A. El umbral se ajusta a la cantidad de filas de cada repo.** Primer paso: confirmar la causa corriendo el programa real sobre Contabilidad, porque salió de una simulación que copia la fórmula. La fórmula de ajuste se elige al construir.
- **#2 = A. Los planes entran con su propio umbral**, comparados aparte contra las filas de `PLANES.md`. El puntaje del glosario y las decisiones no cambia. Cómo se reparte el tope de 3 filas se define al construir. Límite anotado: se compara la fila del plan, no su cuerpo.
- **#3 = A. Solo los planes vivos**, no los ejecutados ni los descartados.
- **#4 = B. De las páginas de conocimiento se comparan las filas de los índices de carpeta.** El nombre «ficha» no está ratificado: queda para `converger-terminologia`, aparte de este plan.
- **#5 = A. Una fila entregada se calla solo dentro de la misma sesión**, como hoy. La repetición entre sesiones se ataca con el umbral de la #1.
- **#6 = A. El nuevo alcance se asienta en una decisión nueva que precisa la Decisión Local-0062, y se reescribe la definición del término Local-0036 del glosario (Contraste automático).** Los dos textos se le muestran al usuario antes de escribirlos (Preferencia Base-0003). Los escribe el coordinador, no un subagente (Decisión Local-0060).
- **#7 = A. Se acepta la demora que ya existe y se mide lo nuevo.** Se mide antes y después de sumar los planes; el límite propio de lo agregado se fija al construir.
