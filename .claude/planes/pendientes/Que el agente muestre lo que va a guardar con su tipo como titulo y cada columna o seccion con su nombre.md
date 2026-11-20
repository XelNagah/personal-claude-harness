# Que el agente muestre lo que va a guardar con su tipo como título y cada columna o sección con su nombre

**Estado: Nuevo · Creado 26-11-19.** Surge de la revisión de los planes vivos (18 y 19/11/2026): el usuario mostró que los agentes, en todos los repos y «muy, muy seguido», le enseñan para aprobar una fila como una línea cruda `| … | … |` sin decir qué es cada columna, y anuncian «te muestro la página» sin decir de qué: de un plan, de una Herramienta, de conocimiento.

## El problema

- La Preferencia Base-0003 (Mostrar el texto exacto antes de escribir en un registro canónico) pide mostrar el texto exacto, pero no dice **cómo**.
- La Preferencia Base-0017 (Decir de qué componente es cada texto que se muestra para aprobar) pide decir qué componente es, pero no que sea lo primero ni que se destaque, y no se cumple.
- `funcionalidades/amp-comunicacion/skills/registrar-agente/SKILL.md`, paso 4, manda mostrar la fila cruda `| Código | Nombre | Propósito | Directorio | CLI |`.
- `registrar-conocimiento`, `registrar-herramienta`, `crear-plan`, `cerrar-plan` y `descartar-plan` no tienen paso de aprobación.
- Ninguna regla de conducta sirve: «al escribir» salta cuando ya se escribe, después de mostrar; «cada turno» cargaría todas las respuestas.
- Una regla cargada al arrancar se recita y no se obedece (conocimiento Local-0001, Modos de falla ante reglas escritas): por eso no alcanza con la preferencia.

## La forma acordada con el usuario

Vale para las tres formas. **Lo primero, en una línea sola, es qué cosa se va a guardar**, como título, en mayúsculas y negrita, con si es nueva o modificada; debajo, en qué archivo va a quedar. Nunca «la página», «la fila» o «el texto» a secas.

1. **Fila nueva** → lista vertical, una línea por columna: el nombre de la columna en negrita y la celda textual.

   > ## **FILA DE HERRAMIENTA — NUEVA**
   > Va a quedar en `.claude/herramientas/INDICE-LOCAL.md`.
   >
   > - **Código:** Local-0013
   > - **Nombre:** …
   > - **Descripción:** …

2. **Fila modificada** → solo las columnas que cambian, cada una con su texto de antes y el de ahora (una celda larga va entera en los dos); se nombran las columnas que no cambian.
3. **Página** (de conocimiento, un plan, el detalle de una decisión) → los datos del frontmatter como lista, como una fila nueva; después la lista de títulos de sección; después cada sección bajo su título, completa y renderizada, no dentro de un bloque de código. Si es una página modificada: se nombran las secciones sin cambios y se muestran antes y ahora de las que cambian.

   > ## **PÁGINA DE CONOCIMIENTO — NUEVA**
   > Va a quedar en `.claude/conocimiento/buscar-con-acentos.md`.
   >
   > **Datos de la página:**
   > - **caduca:** no
   >
   > **Secciones:**
   > 1. Qué pasa
   > 2. Por qué
   > 3. Cómo evitarlo
   >
   > **1. Qué pasa**
   > …

## Dónde vive la regla (acordado)

| Dónde | Qué tiene | Cuándo actúa |
|---|---|---|
| Paso de aprobación de cada habilidad de registro | La forma **escrita entera**, no una remisión a la preferencia | Justo antes de mostrar el texto: es lo que más se cumple |
| Control de `lint-harness` | La comparación de las copias del bloque entre las habilidades | Al cerrar cada tarea, para que no diverjan |
| Preferencia Base-0003 (descripción, más página de detalle con los ejemplos) | La forma completa | Siempre cargada: la red para los casos sin habilidad |

Se descartó la remisión («mostrala con la forma de la Preferencia Base-0003»): obliga a ir a buscar la forma a otro lado, y ese paso es el que se saltea.

## Pasos

1. Inventariar las habilidades que escriben en un registro (como mínimo: `registrar-preferencia`, `adoptar-recomendadas`, `registrar-conocimiento`, `registrar-decision`, `registrar-herramienta`, `registrar-regla`, `registrar-agente`, `converger-terminologia`, `crear-plan`, `cerrar-plan`, `descartar-plan`, `agregar-subsistema`) y dónde está su paso de aprobación, si lo tiene.
2. Escribir el bloque de la forma, idéntico, en el paso de aprobación de cada una; sumar el paso donde falta; reemplazar la fila cruda de `registrar-agente`.
3. Sumar a `lint-harness` el control que compara las copias del bloque, con su prueba en `pruebas.js`.
4. Redactar la nueva descripción de la Preferencia Base-0003 y su página de detalle. **El texto exacto se le muestra al usuario antes de escribirlo** (es un registro canónico); revisar si la Preferencia Base-0017 queda cubierta o se ajusta, y proponerlo también.
5. `sincronizar-base --aplicar`, subir la versión de los plugins tocados, `ejecutar-control-cierre --estricto` en verde.
6. Verificar en la práctica: una sesión limpia en otro repo, con los plugins publicados, registra una fila de conocimiento; mirar qué le muestra al usuario.

## Estado

- 26-11-19: forma y ubicación acordadas con el usuario; se ejecuta con un subagente.
- 26-11-19: pasos 1, 2, 3 y 5 hechos por el subagente: el bloque (marcas `forma-de-mostrar-lo-que-se-guarda`) en 15 habilidades; control [4c] en `lint-harness` con pruebas; nueve plugins con versión subida. `lint-harness` da 9 hallazgos de versión sin publicar, esperables hasta publicar. `registrar-regla` ahora pide aprobación siempre (antes solo si tocaba terminología o decisiones). Falta: paso 4 (Base-0003, su página de detalle y el ajuste de Base-0017, con texto aprobado por el usuario), publicar y paso 6.
- 26-11-19: fila de Base-0003 (nombre y descripción nuevos) y su página `mostrar-lo-que-se-va-a-guardar.md` escritas con el texto aprobado por el usuario; la página viaja en `base/preferencias/`; `amp` a 0.77.0; contexto al arrancar dentro del tope por 2,3 KB. Control de cierre: todo OK salvo 10 versiones sin publicar. Falta: ajuste de Base-0017, publicar, paso 6.
- 26-11-19: Base-0017 ajustada con el texto aprobado (el componente va primero, en una línea y destacado; remite a Base-0003 para lo que se guarda en un registro). Sincronizado; contexto al arrancar dentro del tope por 2,0 KB. Paso 4 completo. Falta: publicar y paso 6.
