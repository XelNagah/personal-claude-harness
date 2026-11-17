# Que el Contraste automático traiga todas las filas que pasan el umbral, con su código y su nombre, en vez de tres

**Estado: Ejecutado · Cerrado 26-11-17 · Creado 26-11-17.**

Hijo del plan Local-0129 (Los agentes saltean lo guardado cuando nada los lleva a consultarlo en el momento de actuar).

## Pedido

Del usuario, con sus palabras: «¿Por qué 3 filas? ¿Por qué no TODAS LAS NECESARIAS? Si un problema necesita los conocimientos A, B, C y D, ¿por qué le voy a dar solo A, B y C?».

## Problema

El Contraste automático (término del glosario Local-0036) entrega como máximo tres filas por turno, repartidas entre lo que compara —punto (d) de la Decisión Local-0082—. El tope existía porque cada fila llega con su Descripción entera, de 1 a 2 KB. Si un pedido toca cuatro registros, el cuarto no llega, y es justo lo que el agente no iba a abrir por su cuenta.

## Dirección acordada para probar

- Sin tope fijo de filas: entra toda fila que pase el umbral de su conjunto.
- Cada fila llega con su **código y su Nombre**, más el enlace a su detalle si lo tiene; sin la Descripción. El agente abre las que necesite.
- Evaluar si bajar el umbral, ahora que una fila pesa unos 150 bytes.
- Medir con mensajes reales, como el plan Local-0131 (este repo, Contabilidad, Impresión 3D): cuántas filas llegan por turno, cuánto pesan y la demora del hook. Correr el banco del repartidor (`.claude/conducta/establecer-conducta/pruebas.js`).

Código: `.claude/conducta/establecer-conducta/establecer-conducta.js` (`UMBRAL = 7.0, TOPE = 3`).

## Alternativa anotada, no elegida para esta prueba

Haiku en segundo plano, entregando por el Buzón de Avisos Generales (Decisión Local-0051) un turno tarde. Queda en segunda línea porque `claude -p --model haiku` tardó 3,5 s en una llamada mínima (sin verificar que contestara), y con unas 300 filas se estiman de 5 a 10 s por mensaje.

## Al terminar

- Una decisión nueva que precise el punto (d) de la Decisión Local-0082, mostrada antes de escribir.
- Actualizar la definición del término del glosario Local-0036 si cambia el tope, mostrada antes de escribir.
- Si funciona, entra en la próxima versión del Agente Multipropósito.

## Estado

### Prueba del 17/11/2026: sin tope, el umbral actual deja pasar ruido en el repo grande

Medidor fuera del repo (carpeta de trabajo de la sesión, `medir-sin-tope.js`): carga una copia del repartidor con tope, umbral, corte y formato cambiados, y lo corre sobre los mensajes reales más recientes de cada repo, sin `session_id` (la memoria de sesión no se aplica, así que los números son un techo). No escribe en los repos medidos.

| Repo (mensajes) | Hoy: tope 3, fila completa | Sin tope, liviana | Sin tope, liviana, ≥ 70 % de la mejor |
|---|---|---|---|
| Este repo (87) | 123 filas · máx. 3 · p90 6,1 KB | 1303 filas · máx. 124 · p90 14,0 KB | 220 filas · máx. 14 · p90 2,8 KB |
| Contabilidad (300) | 58 · máx. 3 · p90 1,2 KB | 67 · máx. 10 · p90 0,7 KB | 60 · máx. 7 · p90 0,6 KB |
| Impresión 3D (300) | 127 · máx. 3 · p90 1,2 KB | 165 · máx. 13 · p90 0,8 KB | 131 · máx. 5 · p90 0,8 KB |
| Salud (172) | 116 · máx. 3 · p90 1,2 KB | 166 · máx. 17 · p90 0,7 KB | 97 · máx. 8 · p90 0,3 KB |

«Liviana» = tipo, código, Nombre y enlace al detalle. Los KB son por turno con contraste. La demora no cambia: unos 5 ms adentro del proceso (7 ms en Salud) en todas las variantes.

- **En los repos chicos el tope casi no corta:** sacarlo suma entre 9 y 50 filas en 300 mensajes, y con el formato liviano pesa menos que hoy.
- **En este repo, sin tope el umbral actual trae ruido.** El puntaje se suma palabra por palabra: un mensaje con texto pegado largo pasa el umbral en 100 o más filas, y uno corto que dice «agentes» y «habilidades» trae la Decisión Local-0014 (Nombre del proyecto). Los mensajes que apuntan a un handoff traen por cita todo lo que el handoff nombra (20 a 30 filas).
- **Corte relativo:** entra toda fila con al menos el 70 % del puntaje de la mejor de su registro. Baja este repo a 14 filas como máximo y deja casi igual a los chicos. Sigue colando ruido cuando la mejor fila es débil (ejemplo: «al ejecutar planes los agentes se saltean las habilidades» trae 11, con la Decisión Local-0014 y la Local-0001 adentro).
- **Bajar el umbral (×0,75):** suma disparos en Contabilidad (43 → 68) e Impresión 3D (74 → 93); no se revisó la calidad de lo agregado.
- La fila liviana de un plan lleva el enlace a su archivo, que repite el Nombre: es la mitad del peso. Para planes alcanza el código.

### Construido el 17/11/2026: corte relativo al 70 % y filas livianas (elegido por el usuario)

El usuario eligió la opción del corte relativo. Cambios en `conducta/establecer-conducta/`:

- `establecer-conducta.js`: sin `TOPE`. Entran todas las citas; de cada corpus, toda fila con al menos el 70 % del puntaje de la mejor de ese corpus (`CORTE_RELATIVO = 0.7`, función `juntar`, que reemplaza a `repartir`). Cada fila llega como `- tipo código (Nombre).`, sin Descripción; el detalle va solo en conocimiento y en decisiones con página propia, no en planes. El encabezado dice dónde abrir cada tipo.
- `pruebas.js`: 70 casos en verde. Nuevos: cuatro decisiones que puntúan igual llegan las cuatro; una quinta que pasa el umbral pero queda bajo el 70 % no llega (con el corte apagado da rojo: verificado); citada, llega con su página. Se reemplazaron los casos del tope de 3.
- `README.md`: la sección del Contraste automático se reescribió a pedido del usuario, para que se entienda: qué problema resuelve, el recorrido de un mensaje en diagrama, cómo se calcula el puntaje con un ejemplo numérico y por qué cada parte está hecha así. Los ejemplos son neutros, porque el README viaja.

Medido con el código real (sin `session_id`):

| Repo | Antes: p90 / máx. por turno | Ahora: filas máx. · p90 / máx. por turno |
|---|---|---|
| Este repo (90 mensajes) | 6,1 KB / 7,6 KB | 14 · 1,4 KB / 1,9 KB |
| Contabilidad (300) | 1,2 KB / 1,7 KB | 7 · 0,5 KB / 1,3 KB |
| Impresión 3D (300) | 1,2 KB / 1,8 KB | 5 · 0,7 KB / 0,8 KB |
| Salud (172) | 1,2 KB / 1,4 KB | 8 · 0,6 KB / 1,2 KB |

Demora sin cambios: 4,3 a 6,9 ms de mediana adentro del proceso. El umbral no se bajó.

Asentados con el texto aprobado por el usuario: la Decisión Local-0083 (precisa el punto (d) de la Decisión Local-0082) y la nueva definición del término del glosario Local-0036. Falta `sincronizar-base --aplicar` y subir versiones; después se cierra este plan.

## Notas de implementación

Construido el 17/11/2026: corte al 70 % del puntaje de la mejor fila de cada registro y filas livianas, con su código y su nombre (Decisión Local-0083). Detalle y mediciones en la sección «Estado».

Al revisar la muestra con mensajes reales del repo de Salud aparecieron dos fallas, arregladas el mismo día con dos casos nuevos en el banco del repartidor (72 casos, todo verde): en una tabla de un Índice de carpeta sin columna `Nombre`, la fila llegaba nombrada solo por su primera celda («síntoma», «almuerzo») y ahora llega con el comienzo de la fila; y una ruta con paréntesis en el nombre del archivo llegaba cortada en el primer `)`. Publicado con `amp` 0.76.0.
