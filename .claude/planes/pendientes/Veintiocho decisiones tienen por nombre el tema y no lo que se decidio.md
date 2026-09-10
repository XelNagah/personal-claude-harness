# Veintiocho decisiones tienen por nombre el tema y no lo que se decidió

**Estado: Análisis · Creado 26-08-25 · En Análisis desde 26-09-10.**

## Qué pasó

El 25/08/2026 el usuario cortó una discusión sobre el nombre de una decisión nueva con un reclamo que venía de largo: los nombres que le proponía el agente *"no representan decisiones sino afirmaciones genéricas que no dicen nada"*.

La causa no era del agente. `decisiones/INDICE.md` definía la columna como **"Nombre — de qué trata la decisión, en una frase corta"**. *De qué trata* pide un tema, y eso es lo que el registro tiene.

La convención ya se corrigió el mismo día, en el Índice y en la habilidad `registrar-decision`: el Nombre pasa a ser **qué se decidió**, en una afirmación con sujeto concreto, que nombra también la alternativa descartada cuando la hubo. Queda pendiente lo viejo.

## Lo medido

De las 78 decisiones del registro, **28 tienen nombre-tema**. Casi todas son anteriores a la 0044; de ahí en adelante la práctica ya había mejorado sola, sin que la convención cambiara.

Las cuatro peores solo nombran la cosa, y leídas solas no dicen nada de lo que se resolvió:

- Local-0020 — *Test de demarcación*
- Local-0021 — *Subsistema conducta*
- Local-0028 — *Diseño del actualizador*
- Local-0043 — *Núcleo del Índice de Subsistema*

Las otras 24: 0002, 0003, 0004, 0005, 0006, 0007, 0008, 0009, 0010, 0011, 0013, 0014, 0015, 0017, 0018, 0019, 0022, 0023, 0025, 0026, 0027, 0029, 0039, 0057.

## Por qué importa

El manifiesto del subsistema manda consultar las decisiones **al planificar y analizar**, para no re-decidir ni contradecir lo asentado. Un registro de 78 filas se recorre por la columna Nombre: la Descripción de estas filas es larga y no se lee entera. Un nombre que dice el tema y no la resolución obliga a abrir la Descripción de cada candidata, y en la práctica lo que pasa es que no se abre ninguna y la decisión se vuelve a tomar.

## Qué hay que hacer antes de renombrar

El Código es la referencia estable, no el Nombre, pero el Nombre igual se cita. Antes de tocar nada hay que barrer quién nombra estas decisiones por su nombre y no por su código:

- El propio registro, en las Descripciones que se refieren entre sí.
- Las páginas de detalle `NNNN-*.md` del subsistema, cuyo nombre de archivo también arrastra el nombre viejo.
- Los planes, el conocimiento y los README del repo.
- Lo que viaja en `base/`, con la salvedad de que ahí no se citan decisiones por código (Decisión Local-0024), así que la cita, si existe, es por nombre.

## Puntos a decidir

1. **Si los archivos de detalle se renombran también.** Hay once, con el número adelante (`0020-test-de-demarcacion.md`). Renombrarlos rompe los enlaces del Índice, que hay que actualizar en la misma pasada; dejarlos deja el nombre viejo escrito en el disco.
2. **De a cuántas por vez.** Cada nombre nuevo es una redefinición de algo asentado y la ratifica el usuario, no el agente. Veintiocho ratificaciones de a una es caro; conviene proponerlas por tandas con la fila vieja y la nueva enfrentadas.
3. **Si el nombre viejo se conserva en algún lado.** El registro no tiene columna de alias y sumarle una por esto sería mucho; la alternativa es no conservarlo, asumiendo que quien busque por el nombre viejo no lo encuentre.

## Alcance del trabajo

- `.claude/decisiones/INDICE.md` — las 28 celdas de Nombre.
- Los archivos de detalle, si se decide renombrarlos, y sus enlaces.
- Las citas por nombre en el resto del repo.
- `lint-decisiones` y `lint-harness` al cerrar.

## Origen

Reclamo del usuario, 25/08/2026, al proponerle el nombre de la decisión sobre dónde vive el texto del aviso al cerrar tarea.

---

## Análisis (10/09/2026)

### Lo medido, actualizado contra el registro de hoy

El registro creció desde que se escribió este plan: **80 decisiones** (`Local-0001` a `Local-0080`), no 78. Las 22 que se sumaron desde la `Local-0058` en adelante siguen todas la convención buena — ninguna suma nombre-tema nuevo. La lista de las 28 candidatas no cambia.

**Corrección sobre "hay once" archivos de detalle.** De las 28 candidatas, solo **cinco** tienen página de detalle: `Local-0010`, `Local-0020`, `Local-0021`, `Local-0026` y `Local-0043`. El registro tiene doce páginas de detalle en total, pero las otras siete (`0034`, `0042`, `0046`, `0047`, `0048`, `0071`, `0078`) pertenecen a decisiones que **ya** tienen nombre-decisión y no están en la lista de renombre.

### Punto 1 resuelto por inspección: no hace falta renombrar los archivos de detalle

El `README.md` del subsistema dice del nombre de archivo: *"no es el código, es un nombre corto legible"* — no dice que tenga que copiar el Nombre de la fila. Revisando las páginas de detalle que ya nacieron con nombre-decisión (`Local-0034` en adelante, todas posteriores a que la convención se corrigiera el 25/08/2026), ninguna usa el Nombre completo como nombre de archivo: `0071-indice-de-lo-que-trae-la-base.md` es un mnemónico corto de "La Base declara lo que trae en un índice generado adentro de `base/`"; `0078-plugin-de-codigo-por-repo.md` lo es de una Descripción bastante más larga. Las cinco candidatas con archivo (`0010`, `0020`, `0021`, `0026`, `0043`) solo coinciden hoy, letra por letra, con su Nombre porque nacieron **antes** de la corrección, cuando Nombre y tema eran la misma cosa. Renombrar la fila no rompe ninguna convención de archivo: la alinea con el resto del registro, que ya funciona así. **No renombrar los cinco archivos** — se dejan como están, con el número y el mnemónico que ya tienen.

### Punto 3 resuelto por precedente: no conservar el nombre viejo en ningún lado

La Decisión `Local-0079` ya resolvió el mismo dilema para el renombre de la clase de conducta `Bloquear` → `Controlar`: *"Renombre limpio, sin nombre alternativo: se descartó aceptar `Bloquear` en paralelo, porque un alias sin fecha de corte deja dos vocabularios vivos para siempre."* Es un precedente análogo, no idéntico —`Local-0079` renombraba un término de vocabulario operativo, esto renombra la celda `Nombre` de un registro—, pero la razón de fondo es la misma y `decisiones/INDICE.md` no tiene columna de alias (a diferencia del glosario, que sí la sostiene para términos del dominio). **No conservar el nombre viejo**: quien busque por el nombre viejo no lo encuentra: busca por Código, que es la referencia estable, o relee la fila.

Con esto, del punto 2 original (**de a cuántas por vez**) es lo único que sigue siendo una decisión genuina — ver abajo, ahora numerado junto con los choques nuevos que aparecieron al verificar.

### Choque con dos planes vivos que tocan las mismas filas

Buscar cada uno de los 28 nombres actuales en el resto del repo (fuera de `decisiones/`) encontró, además de las citas esperadas, **dos planes pendientes que van a tocar tres de las mismas filas por otro motivo**:

- **Plan Local-0067** (*Una decisión, un tema — y baja de la reemplazada*, en Análisis, con siete decisiones propias todavía abiertas) va a **partir o dar de baja** las Decisiones `Local-0002`, `Local-0013` y `Local-0029` — tres de las 28 candidatas de este plan. El propio Local-0067 dice: *"Si Local-0115 corre primero, el usuario ratifica tres nombres para filas que quedan `reemplazada por` acto seguido: tres ratificaciones tiradas. Este plan debería correr antes, y Local-0115 recalcular su lista después."* Coincido: no tiene sentido ratificar un nombre nuevo para una fila que el otro plan va a dar de baja o partir en varias.
- **Plan Local-0076** (*Barrer la terminología hallada en preferencias y subsistemas*, en Nuevo) propone unificar el término «Test de demarcación» —hoy el Nombre exacto de la Decisión `Local-0020`— con «Prueba de pertenencia», y anota explícitamente: *"⚠️ Renombra el título de una decisión vigente."* Es el mismo título que este plan también quiere cambiar, por un motivo distinto (uno por convergencia terminológica, este por convención de nombre). Renombrarlo dos veces en el orden equivocado tira ratificaciones igual que el caso anterior.

**Cuatro de las 28 candidatas quedan entonces fuera de cualquier tanda hasta que se resuelva la otra punta**: `Local-0002`, `Local-0013`, `Local-0020` y `Local-0029`. Las 24 restantes no tienen este problema.

### Barrido de citas por nombre (evidencia, no aplicado)

Se buscó el texto exacto de las 28 celdas de Nombre en todo el repo, fuera de `decisiones/INDICE.md` y de este plan. Lo relevante:

- **`Test de demarcación` (`Local-0020`)** es, de las 28, la que más se cita por nombre fuera del registro: aparece en `.claude/herramientas/inventariar-componentes-sueltos/README.md` (y su copia en `funcionalidades/amp/skills/inicializar/base/`, que viaja en el plugin) y en varios planes pendientes, ejecutados y descartados. Ya casi funciona como término del repo («el Test de demarcación» a secas). Es la más costosa de las cuatro peores, y coincide con ser una de las bloqueadas por el choque con Local-0076.
- **`Subsistema conducta` (`Local-0021`)**: sin citas reales a la decisión fuera del registro. Las dos coincidencias textuales encontradas (`PLANES.md`, un plan pendiente) nombran el subsistema `conducta` en general, no citan esta decisión. Riesgo bajo.
- **`Diseño del actualizador` (`Local-0028`)**: sin ninguna cita fuera del registro. Riesgo nulo — es la candidata más barata de las cuatro peores.
- **`Núcleo del Índice de Subsistema` (`Local-0043`)**: una sola cita, en un plan **ejecutado** (`Partir los indices por origen y pasar preferencias a tabla.md`), que es registro histórico y no se toca. Riesgo bajo.
- **`Integridad en dos capas: mecánica y semántica` (`Local-0003`)** está citada activamente, con su nombre actual entre paréntesis, en `.claude/herramientas/ejecutar-control-cierre/README.md`. Esa cita sí hay que actualizarla si se renombra `0003`.
- **`Gobernanza de terminología` (`Local-0004`)** y **`Diseño del actualizador` (`Local-0028`)** aparecen citadas **como ejemplo de mal nombre** en la propia convención (`funcionalidades/amp-decisiones/skills/registrar-decision/SKILL.md`: *"«Gobernanza de terminología» o «Diseño del actualizador» dicen de qué se habló, no qué se resolvió"*). Al renombrarlas, el ejemplo sigue siendo válido como ilustración del patrón viejo, pero deja de describir el nombre **actual** de esas dos filas — conviene, al ejecutar, aclarar ahí "nombre antiguo de la fila" o cambiar el ejemplo por otro par ya vigente.
- El resto de las 24 solo aparece citado dentro de planes **ejecutados o descartados** (registro histórico, no se toca) o en la copia de `base/` de los propios archivos que ya se cuentan (`INDICE.md`, `PLANES.md`), que no son citas nuevas.

No se encontró ninguna cita dentro de `funcionalidades/*/base/` que nombre una decisión por su nombre en un lugar distinto de la copia mecánica de `INDICE.md` — consistente con la Decisión `Local-0024` (el texto distribuido no cita decisiones del harness).

### Primera tanda, ya redactada (sin conflicto con Local-0067 ni Local-0076)

De las cuatro peores, tres quedan libres de choque y con evidencia de citas ya relevada: `Local-0021`, `Local-0028` y `Local-0043` (`Local-0020` queda afuera por el choque con Local-0076). Nombres propuestos, en el mismo estilo del resto del registro — nombran también la alternativa descartada cuando la Descripción la deja ver:

| Código | Nombre actual | Nombre propuesto (borrador, sin ratificar) |
|---|---|---|
| Local-0021 | Subsistema conducta | El subsistema `conducta` ata momentos del flujo a acciones mediante un hook repartidor, no con configuración fija a mano |
| Local-0028 | Diseño del actualizador | El actualizador converge por estructura sin guardar número de versión, en vez de correr una lista de migraciones versionadas |
| Local-0043 | Núcleo del Índice de Subsistema | Todo Índice de Subsistema comparte un núcleo de cuatro columnas, con un código de origen que se asigna una sola vez y no se reusa |

Estos tres son borrador para que `registrar-decision` los ratifique de a uno, mostrando la fila vieja y la nueva enfrentadas (Preferencia Base-0003). Las 21 candidatas restantes de las 24 sin choque quedan sin redactar — se resuelven en tandas siguientes, no en esta corrida, siguiendo el mismo criterio de a cuántas por vez que sigue abierto más abajo.

## Decisiones abiertas

### 1. En qué orden corre este plan respecto de Local-0067 y Local-0076

**Qué hay que decidir.** Cuatro de las 28 candidatas (`Local-0002`, `Local-0013`, `Local-0020`, `Local-0029`) están también en el alcance de otros dos planes vivos que las tocan por un motivo distinto: Local-0067 las va a partir o dar de baja, Local-0076 puede cambiarle el nombre a la `0020` por convergencia terminológica. Si este plan las renombra primero, esas ratificaciones se tiran apenas el otro plan corra.

**Alternativas.**
- **(a) Excluirlas de este plan y de cualquier tanda hasta que Local-0067 y Local-0076 cierren sus propias decisiones abiertas.** Este plan avanza solo con las 24 restantes; al cerrar los otros dos, se recalcula si las 4 excluidas siguen necesitando renombre o ya nacieron con nombre-decisión (partidas o reemplazadas).
- **(b) Renombrarlas igual ahora, aceptando que una o más ratificaciones se pierdan si el otro plan corre después.** Evita depender de otros dos planes, pero es tirar trabajo de ratificación a sabiendas.
- **(c) Esperar a que los otros dos planes cierren antes de tocar ninguna de las 28**, no solo las 4. Más prolijo en el orden, pero frena sin necesidad las 24 que no tienen ningún choque.

**Recomendación: (a).** Es el punto medio: no bloquea el 86% de la lista (24 de 28) que no tiene ningún choque, y no tira ratificaciones en el 14% que sí lo tiene.

### 2. De a cuántas candidatas por vez, y en qué orden dentro de las 24 sin choque

**Qué hay que decidir.** Cada nombre nuevo es una redefinición de algo asentado que ratifica el usuario, fila por fila (Preferencia Base-0003: mostrar el texto exacto y esperar el visto bueno). Proponer las 24 restantes juntas es una sola sesión larga de ratificación; proponerlas de a una es 24 idas y vueltas.

**Alternativas.**
- **(a) Tandas de 4 a 6, empezando por las de menor riesgo de citas** (medido arriba: `Local-0028` sin ninguna cita, `Local-0043` con una sola en un plan ejecutado, `Local-0021` sin citas reales a la decisión — ya redactadas arriba como primera tanda de 3 — y siguiendo con las 21 restantes en el orden que salga de medir sus citas igual que se hizo acá con las cuatro peores).
- **(b) Las 24 juntas en una sola tanda.** Una sola sesión de ratificación, pero el usuario tiene que juzgar 24 pares de nombre viejo/nuevo de corrido, con el riesgo de aprobar de largada sin leer cada uno (exactamente lo que la Preferencia Base-0003 quiere evitar).
- **(c) De a una, en el orden del Código.** Es el trabajo más fino pero el más caro en idas y vueltas; no aprovecha que ya se separaron por riesgo de citas.

**Recomendación: (a).** Ya está aplicada en esta misma corrida: la tanda de 3 de arriba (`Local-0021`, `Local-0028`, `Local-0043`) sigue exactamente este criterio. Las tandas siguientes deberían medir citas de la misma forma antes de redactar el nombre nuevo, para no proponer un nombre sin saber antes cuánto cuesta.

## Propuestas para asentar

Ninguna se escribió en ningún registro fuera de este plan. Quedan acá para que `registrar-decision` las tome cuando se resuelvan las Decisiones abiertas de arriba (en particular, después de confirmar que no chocan con Local-0067 ni Local-0076).

**Tres renombres de Nombre en `.claude/decisiones/INDICE.md`** (la Descripción, Fecha, Estado y Detalle de las tres filas no cambian — la página de detalle tampoco se renombra, ver "Punto 1" arriba):

- `Local-0021`: "Subsistema conducta" → **"El subsistema `conducta` ata momentos del flujo a acciones mediante un hook repartidor, no con configuración fija a mano"**
- `Local-0028`: "Diseño del actualizador" → **"El actualizador converge por estructura sin guardar número de versión, en vez de correr una lista de migraciones versionadas"**
- `Local-0043`: "Núcleo del Índice de Subsistema" → **"Todo Índice de Subsistema comparte un núcleo de cuatro columnas, con un código de origen que se asigna una sola vez y no se reusa"**

Al asentar cada una, actualizar además su cita en `funcionalidades/amp-decisiones/skills/registrar-decision/SKILL.md` (los dos ejemplos de mal nombre que usan el texto viejo de `0004` y `0028`) y en `.claude/herramientas/ejecutar-control-cierre/README.md` (la cita de `Local-0003`, si esa fila entra en una tanda futura).

## Por qué queda en Análisis y no en Listo

Quedan dos cosas que solo puede resolver el usuario: el orden respecto de Local-0067 y Local-0076 (decisión 1), y el tamaño y orden de las tandas siguientes para las 21 candidatas que todavía no se redactaron (decisión 2). La tanda de tres ya redactada tampoco se aplicó: cada renombre de una fila `vigente` lo ratifica el usuario, no el agente (Preferencia Base-0010), así que ejecutar sin esa ratificación sería adivinarla.
