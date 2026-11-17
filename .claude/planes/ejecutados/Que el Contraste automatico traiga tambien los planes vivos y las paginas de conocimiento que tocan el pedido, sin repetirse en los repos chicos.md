# Que el Contraste automático traiga también los planes vivos y las páginas de conocimiento que tocan el pedido, sin repetirse en los repos chicos

**Estado: Ejecutado · Cerrado 26-11-17 · Construcción desde 26-11-16 · Creado 26-11-13 · Analizado 26-11-14 · Decidido 26-11-15.** Origen: plan Local-0129 (plan maestro), arreglo 2 del análisis de un mes de conversaciones. Informe: `D:\Proyectos\analisis\como-uso-claude\.claude\conocimiento\analisis-2026-11\agentes-que-no-usan-lo-guardado.md`.

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

## Construcción — 16/11/2026

Construido en la rama `b-aviso` por un subagente. Archivos: `conducta/establecer-conducta/establecer-conducta.js`, `pruebas.js` y `README.md`, con su copia en la Base sincronizada. No se tocó la fila de `PLANES.md` ni el estado.

### La causa, confirmada con el programa real

Se corrió el repartidor de esta rama (y, aparte, el instalado en Contabilidad: dio idéntico) sobre una copia de solo los registros de Contabilidad, con los 300 mensajes más recientes del usuario sacados de sus transcripciones. El repo no se escribió.

- Corpus del puntaje: 11 filas (9 términos, 0 vetadas, 2 Decisiones). Una palabra que está en una sola fila pesa 1,99; en el `Nombre`, 5,98.
- Resultado: el contraste disparó en 59 de 300 mensajes (20 %) y en **54 trajo la misma Decisión Local-0002** (El consolidado de gastos compartidos se fecha al cierre del mes de los servicios).
- Por qué, con números: «Cuánto pagué de servicios este mes» suma 11,95 = `servicios` 5,98 + `mes` 5,98, las dos en el `Nombre` y cada una en una sola fila. En un corpus de 166 filas esas palabras corrientes estarían en muchas y casi no pesarían. La simulación del análisis acertaba.
- Hallazgo lateral: `del` no está en las palabras vacías y suma en las filas que la tienen en el `Nombre`. No se tocó: cambiaría el puntaje de glosario y decisiones, que la respuesta #2 deja igual.

### Lo que se construyó

1. **Umbral ajustado a la cantidad de filas (#1).** `umbral(N) = 7,0 × ln(166/1,5) / ln(N/1,5)`, nunca menos de 7,0, con un techo de tres palabras exclusivas del `Nombre` (`3 × 3 × ln(N/1,5)`) para que un repo recién instalado no quede mudo. Valores: 166 → 7,0 · 60 → 8,9 · 23 → 12,1 · 11 → 16,5 · 5 → 10,8 (techo). En este repo (171 filas de glosario y decisiones) queda en 7,0: nada cambia. En Contabilidad pasa a 16,5: la Decisión Local-0002 bajó de 54 mensajes a 15, y los que quedan la tocan de verdad («yo en un momento le consolidé la deuda…», 19,0).
2. **Planes vivos con su propio umbral (#2, #3).** Corpus aparte con las filas de `PLANES.md` cuyo estado no es de cierre según `ESTADOS.md` y `ESTADOS-LOCAL.md`. Por cita siguen entrando todos. Agregado al construir: planes y conocimiento piden **dos palabras del mensaje en la fila**, porque sus `Nombre` son oraciones y una palabra suelta («resolver», «también», «handoff») traía planes que no venían al caso en 77 mensajes de este repo.
3. **Filas de los Índices de carpeta de conocimiento (#4).** Tercer corpus, con las mismas reglas que planes. Se toma el `INDICE*.md` de cada carpeta de primer nivel y los que esos enlazan; cada fila de tabla y cada renglón de lista con enlace. El peso del `Nombre` lo da una columna `Nombre` o el texto del enlace; en tablas con otras columnas la fila entera puntúa como descripción. Llega como «página de conocimiento», con la página como detalle y la descripción recortada a 300 caracteres. Se compara la fila, no el cuerpo.
4. **Reparto del tope de 3.** Primero las citas; lo que queda se reparte entre los tres corpus por cuántas veces supera cada fila su propio umbral: primero lo mejor de cada corpus que tenga algo, después el resto. Si pega un solo corpus, se comporta como antes.
5. **Memoria (#5):** sin cambios, por sesión.
6. **Banco:** de 55 a 67 casos. Los registros sintéticos recibieron filas de relleno —con cinco filas el umbral ajustado no deja pasar nada y el banco habría probado el caso degenerado—. Casos nuevos: plan vivo por puntaje, plan cerrado callado por puntaje y traído por cita, una palabra sola no trae plan, página de tabla y de lista con su detalle, Índice más hondo por enlace, reparto de una fila por corpus con tope 3, y corpus chico de 11 filas (dos palabras corrientes ya no traen la Decisión; el mensaje que es su tema sí). Corrido contra el repartidor anterior, 9 casos dan rojo: los nuevos discriminan.

### Lo que trae ahora, con mensajes reales

| Repo | Mensajes | Con contraste antes → después | Filas entregadas |
|---|---|---|---|
| Contabilidad | 300 | 59 → 51 | 16 de glosario y decisiones, 64 de planes, 3 de conocimiento |
| Este repo | 77 | 39 → 40 | 71 de glosario y decisiones, 28 de planes |
| Impresión 3D | 300 | 20 → 72 | antes 12 de las 34 eran la misma Decisión Local-0003; ahora 1 de glosario y decisiones, 108 de planes, 15 de conocimiento |

Los planes que llegan se revisaron uno por uno en Contabilidad y sobre una muestra en Impresión 3D, y en su mayoría tocan el tema (AySA, multa de General Lavalle, reporte de Evelyn, la página del CR-PETG Negro). En el repo de Salud el contraste dispara en 69 de 177 mensajes, todos por conocimiento; **no se revisó qué trae**, porque son datos de salud y no estaban en el encargo.

Los dos casos de Impresión 3D del problema siguen sin resolverse con esto: «No medir hasta Y = 215» vive en el cuerpo del plan, no en su fila, y «en-PLA» no está en ninguna fila. Es el límite anotado en la respuesta #2.

### Demora (#7)

Medida con el repartidor real sobre copias de los registros, 90 disparos por repo, seis mensajes tipo. «Adentro» es solo el contraste, medido dentro del proceso.

| Repo | Contraste adentro, antes → después | Repartidor entero, antes → después |
|---|---|---|
| Este repo (171 filas, sin Índices de carpeta) | 17,1 → 16,6 ms | 101 → 99 ms |
| Contabilidad (1 Índice de carpeta) | 6,3 → 10,0 ms | 91 → 94 ms |
| Impresión 3D (2) | 6,3 → 11,0 ms | 90 → 92 ms |
| Salud (5, el que más tiene) | 6,0 → 14,4 ms | 90 → 98 ms |

**Límite fijado para lo agregado: 10 ms de mediana adentro del proceso**, en el repo con más Índices de carpeta de la máquina. Medido: +8,4 ms. Para entrar se hicieron tres ajustes: sacar los acentos con una sola expresión regular (mismo resultado sobre 143 KB, 3,5 ms → 0,6 en frío; abarató también lo que ya estaba), no recorrer el disco sino el primer nivel más los enlaces, y no leer los Índices raíz. El repartidor entero ya pasaba los 100 ms antes de este cambio (respuesta #7: se acepta).

### Lo que no se hizo y por qué

- La decisión nueva que precisa la Decisión Local-0062 y la definición nueva del término Local-0036 del glosario: se redactaron y se entregaron al coordinador; los escribe él después de mostrárselos al usuario (Decisión Local-0060).
- Los mensajes largos generados por el sistema —el resumen al continuar una sesión, las consultas de otra instalación— disparan con tres filas casi siempre: el puntaje mide largo ahí. Queda fuera de este plan; lo roza el plan Local-0128.
- Un Índice de carpeta más hondo que solo nombra el Índice raíz no se encuentra: leer los raíz costaba un milisegundo por turno.

### Medido el 17/11/2026: el resumen de continuación no pasa por el contraste

La línea de «Lo que no se hizo» sobre los mensajes largos salió de una simulación que pasaba todos los mensajes por el comparador. En la realidad, el resumen que arma Claude Code al continuar una sesión **no dispara el hook**: en 52 transcripciones de la máquina con resumen (35 de ellas con el contraste activo), ninguno de los 69 resúmenes recibió un contraste antes del siguiente mensaje real del usuario. Lo que sí pasa son las preguntas de otra instalación, del lado del consultado. La pregunta de fondo que abrió el usuario —por qué un tope fijo de 3 filas y no todas las necesarias— pasa a un plan propio (handoff `.claude/tmp/handoff-contraste-sin-tope-y-cierre.md`).

## Notas de implementación

Construido el 16/11/2026 e integrado a `main` en el commit `1926972`; registro de lo hecho y lo medido en `2d489a7`. Detalle en «Construcción — 16/11/2026». La Decisión Local-0082 y la definición del término del glosario Local-0036 quedaron asentadas el 17/11/2026 con el texto aprobado por el usuario.

Frente a lo planificado: el tope de tres filas por turno que traía este arreglo se reemplazó enseguida por el corte relativo del plan Local-0133. Publicado con `amp` 0.76.0.
