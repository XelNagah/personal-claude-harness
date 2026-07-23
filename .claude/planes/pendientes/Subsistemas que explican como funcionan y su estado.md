# Subsistemas que explican cómo funcionan y su estado

**Estado: Nuevo · Creado 26-07-20.** Pedido de Javier el 26-07-20: *"quiero poder preguntar por la memoria, por el conocimiento, las herramientas… preguntarle al agente qué hace y cómo funciona y que explique mecanismos y dominio."*

**Diseño decidido 26-07-21 (`planificar`).** El plan se cruzó con una pregunta de carga de contexto ("¿por qué se cargan todos los planes siempre?") y de ahí salió el componente que lo materializa: el **Manifiesto de subsistema**. Ver sección abajo. Decisión **0017**.

## Diseño decidido (26-07-21): Manifiesto de subsistema

- **Qué se carga siempre = un Manifiesto de subsistema** (glosario, EN *Manifest*), no su índice. Archivo breve `MANIFIESTO.md` por subsistema: qué es, cómo se usa, cuándo consultarlo. **Consolida la descripción que hoy está desparramada en 4 lugares** → resuelve la pregunta abierta #3 de este plan.
- **Mecanismo = import anidado (M1).** `AGENTS.md` importa cada `MANIFIESTO.md` (siempre, liviano); cada manifiesto **incluye o no** la línea `@INDICE.md` de su subsistema. La presencia de la línea **es** la declaración de si el índice se carga — no hay import condicional en Claude Code (verificado); anidamiento hop ≤3, bajo el límite de 4. Se descartaron M2 (flag documental + lint que lo vigile) y M3 (hook que ensambla en runtime).
- **Reemplaza** la cláusula "el índice va siempre en contexto" de la decisión 0002.
- **Cross-agente:** Claude expande la cadena de imports; Codex/Cursor/Gemini degradan a "leé estos archivos al inicio" (igual que 0010).

### Aplicación por subsistema (política — caso por caso al ejecutar)

- **planes: descripción sola, sin índice** *(decidido — era el disparador)*. `planes/MANIFIESTO.md` **sin** `@PLANES.md`; el registro se lee a demanda. Descarga el índice más pesado del repo (~21k chars, casi la mitad del contexto siempre cargado, mitad de sus filas terminales). El agente sabe que los planes existen + la Pantalla de bienvenida da el conteo; lee `PLANES.md` cuando un plan se vuelve relevante.
- **decisiones: candidato a lo mismo** (segundo más pesado, ~11k) — evaluar al ejecutar.
- **memoria, conocimiento, glosario, herramientas:** índices livianos (≤5k) → probablemente `@INDICE.md` = sí. Caso por caso.

### Ejecutado repo-local (26-07-21)

Aplicado al `.claude/` de **este** repo + `AGENTS.md`. Control de cierre 9/9 verde.

- **6 `MANIFIESTO.md` creados** (memoria, planes, conocimiento, glosario, decisiones, herramientas) con el texto plano que estaba en las `## <subsistema>` de `AGENTS.md`.
- **`AGENTS.md` reescrito:** las 6 secciones de texto plano + el bloque "Mapa del repo" (@índices) → una sola sección "## Subsistemas" con `@.claude/<sub>/MANIFIESTO.md ×6`. Cada manifiesto declara su `@INDICE.md` o no.
- **Política aplicada:** cargan índice **memoria, conocimiento, herramientas**; NO cargan (se consultan a demanda) **planes, glosario, decisiones** (planes = el cambio buscado; glosario/decisiones ya estaban a demanda, se preservó).
- **5 lints de subsistema** ahora excluyen `MANIFIESTO.md` como infra conocida (igual que ya ignoran la carpeta `lint-<sub>/`): memoria, conocimiento, glosario, decisiones, planes. Herramientas no lo necesitó.

### Verificado en sesión fresca (26-07-21)

- **hop3 confirmado.** Sesión fresca (contexto de arranque, sin leer archivos): cargaron los índices de **memoria** (`MEMORIA.md`), **conocimiento** y **herramientas** (`INDICE.md`) vía `MANIFIESTO.md → @INDICE`; NO cargaron **planes/glosario/decisiones**; los 6 manifiestos presentes. Cadena `CLAUDE.md → @AGENTS.md → @MANIFIESTO.md → @INDICE.md` (hop3, límite 4) resuelta sin regresión. No hizo falta el fallback (devolver `@INDICE` directo al `AGENTS.md`).
- **Lint de tamaño del manifiesto:** vive en **`lint-harness`** (transversal al concepto Manifiesto, dec. 0017 — no es lint *de un subsistema*, no aplica dec. 0008). Sección `MANIFIESTOS QUE ENGORDARON`, umbral **220 palabras** por archivo (mayor hoy: conocimiento 159 → ~40% de aire). Probado en positivo (con umbral 100 saltan 4) y negativo (con 220, cero). Ventaja: `lint-harness` no viaja → el chequeo queda fuera de la propagación. README + INDICE + AGENTS actualizados. Control de cierre 9/9.

### Esqueleto y cableado del manifiesto — decidido (26-07-22, `planificar` → decisión 0019)

Antes de escribir los 6 manifiestos genéricos se fijó su forma:

- **Cableado: 6 `@MANIFIESTO` directos** en una sección `## Subsistemas` de `AGENTS.md`, **sin** archivo agregador. Se evaluó un `Subsistemas.md` que importara los 6 y se descartó como mero cargador: suma un hop (3→4, al ras del límite 4) y duplica la indirección cross-agente (0010). Solo se justificaría si llevara la **autodescripción del Agente Multipropósito completo** (pregunta abierta #1) — queda como opción futura, no para esta propagación.
- **Estructura obligatoria (5 campos):** (1) título, (2) identidad (qué es + dónde vive), (3) **disparador** (cuándo se consulta y cuándo se escribe — el gancho conductual, obligatorio), (4) declaración explícita de carga del índice, (5) lint al cerrar; más `@INDICE.md` **solo si** carga (presencia = declaración, M1). **Sin frontmatter.** Opcionales por subsistema: gobernanza, advertencias, prueba de pertenencia.
- **Control de estructura en `lint-harness`** (lado autor, junto al chequeo de tamaño), no viaja.

### Ejecutado — propagación al harness (26-07-22)

Propagado a las 6 funcionalidades de subsistema + orquestador (`/planificar` previo; subagente fresco para la copia verbatim de las PLANTILLA; verificación por inclusión propia). Control de cierre **9/9 verde**, `lint-harness` 0 hallazgos (incluido el chequeo nuevo de campos de manifiesto).

- **Manifiestos vivos (este repo):** los 6 ganaron el campo **Disparador** explícito (faltaba en todos), conservando refs a decisiones de este repo.
- **`lint-harness`:** chequeo nuevo "MANIFIESTOS SIN CAMPOS MÍNIMOS (dec. 0019)" — título H1, Disparador, declaración de carga, comando de lint, y coherencia carga↔`@INDICE`. Informativo (no corta). README + cabecera actualizados.
- **6 PLANTILLA:** §Manifiesto (cerca de 4 backticks para no chocar con el ```bash interno → byte-idéntico al source) + §Subsistemas; §Sección de prosa vieja borrada donde existía (planes/glosario/decisiones/herramientas); §Script sincronizado con el lint vivo (exclusión `MANIFIESTO.md`).
- **Orquestador:** §Mapa (pre-0017) → §Subsistemas + 6 §Manifiesto; 5 lints embebidos sincronizados. *Residual conocido:* la PLANTILLA del orquestador todavía carga los templates de prosa viejos ("## Glosario del proyecto", etc.) dentro de sus §-bloques grandes — inertes (el SKILL ya no los escribe y manda migrarlos), pero convendría depurarlos en una pasada futura.
- **6 SKILL + orquestador SKILL:** cableado por manifiesto + **migración por subsistema** (cada `inicializar-<sub>` crea su MANIFIESTO, asegura `## Subsistemas` + su línea, y quita su prosa vieja + su `@INDICE` del Mapa; vacío el Mapa, se quita el encabezado). El orquestador suma la sección "Cableado de subsistemas".
- **Versiones subidas:** memoria-local 0.4.3 · gestion-de-planes 0.4.2 · conocimiento 0.5.1 · glosario 0.4.3 · decisiones 0.4.2 · herramientas 0.4.3 · setup-completo 0.5.5. `marketplace.json` sin cambios (no hay plugins nuevos).
- **Refinamiento de ejecución (cruce resuelto con el usuario):** la migración modelo-viejo→nuevo es **por subsistema** (no solo del orquestador) — aplicación de la idempotencia ya vigente + 0019, no decisión nueva.

### Qué queda para ejecutar

1. ~~Propagar a las funcionalidades + orquestador~~ **hecho (26-07-22, ver arriba).** Queda el **nivelado de consumidores** (correr los `inicializar-*` actualizados sobre repos ya instalados con el modelo viejo). *(El lint de tamaño NO entra acá: vive en `lint-harness`, que no se distribuye.)*
2. **Publicación en inglés:** el nombre ya traduce 1:1 (`MANIFIESTO.md` ↔ `MANIFEST.md`); coordinar con la migración de idioma, no renombrar suelto.

## Qué se pide

Que el agente multipropósito **y cada subsistema por separado** puedan explicarse de forma consistente. Dos preguntas distintas, con respuestas de naturaleza distinta:

1. **Cómo funciona** — el mecanismo y su dominio. Es información estática: ya está escrita, pero desparramada entre el `SKILL.md` de la funcionalidad, la memoria `feedback_*`, el `README.md` del plugin y la sección correspondiente de `AGENTS.md`.
2. **En qué estado está** — cuántas entradas tiene, qué falta, si el lint pasa, si hay cosas sin indexar. Es información dinámica: se calcula leyendo el índice y corriendo el lint.

Hoy el agente responde las dos a su manera cada vez, según qué archivo haya leído en esa sesión. No hay una forma acordada de contestar.

## Decidido (26-07-23, `planificar` → decisión 0023, reemplaza 0022): autodescripción vía MANIFIESTO enriquecido

Sesión de `planificar`. Primero se acordó una skill transversal que ensamblaba en runtime (0022); al iterar con el usuario se descartó por sobreingeniería y se resolvió **enriquecer el propio MANIFIESTO** para que sea la fuente. La skill nueva **ya no se construye**.

- **Bloqueo de nomenclatura: no aplica a este nivel.** Los nombres de los subsistemas (memoria, planes, conocimiento, glosario, decisiones, herramientas, conducta) **no** están entre los sospechosos del plan de renombre — son firmes. Se avanza ya; solo se evita hardcodear los nombres en revisión (`Base`/`Adaptaciones`, nombres de skills).
- **Alcance: solo el mecanismo.** La mitad "en qué estado está" **ya la construye `amp-info` / la Pantalla de bienvenida** (métricas por subsistema + lint, descubrimiento dinámico). El trabajo nuevo se enfoca en el "cómo funciona".
- **Fuente = el MANIFIESTO, no una skill.** El MANIFIESTO está siempre en contexto; enriquecerlo hace que la autodescripción caiga por su peso. Preguntar "¿cómo funciona X?" ⇒ el agente contesta desde el MANIFIESTO ya cargado + corre `amp-info` para el estado. **Restricción que lo permite:** el MANIFIESTO viaja a los repos consumidores (se instala en `.claude/<sub>/`), a diferencia del README de plugin (`funcionalidades/`, no viaja).

### Anatomía del MANIFIESTO (ratificada 26-07-23)

Una sola clase: núcleo obligatorio + bloques opcionales que se prenden según el subsistema. El archivo queda plano y compacto (≤220 palabras); las categorías ordenan la spec, no son encabezados del archivo.

- **Obligatorios:** (1) Título · (2) Identidad (qué es + dónde vive) · (3) Disparador (cuándo se consulta / cuándo se escribe) · (4) **Skills** *(campo nuevo)* — nombra las skills de **operación** y qué hace cada una; la de **instalación** `inicializar-<sub>` se menciona al pasar; `conducta` pone "ninguna aún" · (5) Carga del índice (declaración explícita + `@INDICE.md` solo si carga) · (6) Lint al cerrar.
- **Opcionales:** **Flujo de trabajo** *(campo nuevo)* — solo si es multi-paso, y como **puntero** al detalle on-demand (`feedback`/`SKILL`), nunca el paso a paso inline (0017) · Gobernanza (glosario/decisiones) · Advertencias (herramientas) · Prueba de pertenencia (conocimiento).
- **Extiende la 0019** (que fijó "5 campos, sin skills"). El chequeo de campos vive en `lint-harness` (lado autor, no viaja).

### Qué queda para ejecutar

1. ~~Extender `lint-harness` (`Skills` obligatorio + `Flujo` opcional)~~ **hecho 26-07-23** (commit `dac4c8a`).
2. ~~Llenar el campo Skills en los 7 MANIFIESTOs vivos~~ **hecho 26-07-23** (`conducta` = "ninguna aún"; commit `dac4c8a`).
3. ~~Propagar al harness: 6 PLANTILLA + orquestador + 7 versiones~~ **hecho 26-07-23** (commit `5d7f206`; inclusión verificada, control de cierre 10/10).
4. **Nivelar consumidores:** correr los `inicializar-*` actualizados sobre repos ya instalados. **Pendiente** — diferido al patrón de consumidores dormidos (se ponen al día cuando se usan).

> El **ordenamiento de los skills** en sí (declarado por el campo Skills de arriba) ya está repartido en 3 planes vivos, no necesita uno nuevo: [Nombres y distribución de las skills del harness](Nombres%20y%20distribucion%20de%20las%20skills%20del%20harness.md) (ejecutar el prefijo 0013 — capa en-uso), [Revisar la nomenclatura de los subsistemas](Revisar%20la%20nomenclatura%20de%20los%20subsistemas.md) (los nombres opacos `ciclo-de-plan`/`converger-terminologia`), y [Revisar cada subsistema — sentido, disparador y skill de operación](Revisar%20cada%20subsistema%20-%20sentido%2C%20disparador%20y%20skill%20de%20operacion.md) (los huecos de cobertura de herramientas/conducta).

## Por qué no es el plan diferido

[Funcionalidades como agentes consultables](Funcionalidades%20como%20agentes%20consultables.md) es **consulta de contenido**: *"che, agente conocimiento, ¿sabemos algo de X?"*. Se difirió porque su valor depende del volumen de cada base, y el volumen depende del propósito del repo.

Este plan es **autodescripción**: *"¿qué es el subsistema de conocimiento y cómo lo uso?"*. Su valor no depende del volumen — un subsistema recién instalado y vacío necesita explicarse igual o más. No hereda el motivo del diferimiento.

Los dos pueden convivir: uno contesta sobre el contenido, el otro sobre el continente.

## Por qué importa ahora

El 26-07-20, el autor del repo preguntó *"¿qué es la Base?"* sobre un concepto central de su propio proyecto. Ese mismo hecho abrió [Revisar la nomenclatura de los subsistemas](Revisar%20la%20nomenclatura%20de%20los%20subsistemas.md).

Los dos planes atacan el mismo problema por lados opuestos: renombrar arregla el nombre de una vez; que el subsistema se explique arregla la consulta cada vez. Se complementan — un nombre bueno no elimina la necesidad de explicar el mecanismo, y una buena explicación no salva a un nombre opaco.

Y si el repo va a servir a otras personas (ver [Separar mecánica del harness de criterio del autor](Separar%20mecanica%20del%20harness%20de%20criterio%20del%20autor.md)), la autodescripción pasa de comodidad a requisito: es cómo se orienta alguien que no estuvo en las conversaciones donde se diseñó esto.

## Direcciones a evaluar

1. **Una skill por subsistema** (`explicar-memoria`, `explicar-conocimiento`…). Cada una viaja en el plugin de su funcionalidad, como las Skills de Subsistema que ya existen (decisión 0009). Consistente por construcción, pero son 8 piezas más para mantener sincronizadas.
2. **Una sola skill transversal** que reciba el subsistema por parámetro y arme la respuesta leyendo los documentos de ese subsistema. Una pieza sola; el riesgo es que quede genérica y no sepa lo particular de cada uno.
3. **Convención, sin skill nueva.** Cada `INDICE.md` suma una sección corta y estándar de "cómo funciona", y el estado sale de lo que el lint ya reporta. Costo mínimo, pero nada obliga al agente a contestar con esa forma: vuelve a depender de que lea el archivo correcto.
4. **Herramienta que emite el estado** (conteos, resultado de lint, faltantes) y el agente narra el mecanismo encima. Aprovecha que `control-cierre` ya recorre todos los subsistemas y reporta por cada uno.

Las direcciones no son excluyentes: 4 resuelve bien el estado y 1 o 2 resuelven mejor el mecanismo.

## Preguntas abiertas

- ¿La explicación del **agente multipropósito completo** es la suma de sus subsistemas, o es un texto propio? Sospecha: es propio, porque lo interesante es cómo se articulan entre sí, y eso no está en ninguno de ellos por separado.
- ¿A qué profundidad se contesta? No es lo mismo "para qué sirve la memoria" que "por qué las memorias llevan `metadata.type` y qué pasa si falta".
- ¿Se apoya en el material que ya existe (`SKILL.md`, `feedback_*`, `README.md`) o se escribe una explicación nueva? Si es lo primero, hay que resolver que hoy está repetido en cuatro lugares con redacciones distintas.
- ¿Hace falta que el usuario pueda pedirlo por nombre (una skill que se dispara), o alcanza con que el agente sepa contestar cuando le preguntan en lenguaje corriente?

## Depende de

Conviene después de [Revisar la nomenclatura de los subsistemas](Revisar%20la%20nomenclatura%20de%20los%20subsistemas.md): escribir explicaciones sobre nombres que están por cambiar es trabajo que se rehace.
