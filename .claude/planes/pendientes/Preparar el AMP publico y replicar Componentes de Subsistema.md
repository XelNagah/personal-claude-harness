# Preparar el AMP público y replicar Componentes de Subsistema

**Estado: En curso · Creado 03/08/2026.**

> El nombre del plan se conserva porque es su identidad estable. En el cuerpo, «replicar» se reemplaza por la acción concreta: copiar o llevar Componentes entre Agentes Desplegados e incorporarlos en el destino.

## Contexto

La revisión integral del Agente Multipropósito encontró defectos concretos en sus habilidades, acumulación de planes que ya no reflejan el estado real, contexto cercano al tope y mecanismos cuya integridad mecánica está probada pero cuyo efecto sobre la conducta todavía no. La conversación que abrió este plan resolvió además la pregunta que manda sobre la distribución: **el Agente Multipropósito apunta a ser público**, aunque hoy la Base que publica contiene preferencias y reglas personales incorporadas durante el uso diario del autor.

Hay tres necesidades distintas que el diseño actual trata como si fueran dos:

- **Publicar el Agente Multipropósito:** distribuir el mecanismo general, neutral respecto del criterio personal de un usuario.
- **Aprender dentro de un Agente Desplegado:** conservar las preferencias, decisiones, conocimiento y demás Componentes de Subsistema propios de ese Propósito.
- **Reutilizar parte de lo aprendido:** llevar selectivamente preferencias u otros Componentes de Subsistema personales desde un Agente Desplegado a varios otros, sin convertirlos por eso en Base pública.

La tercera no es el canal de instalación por copia del plan Local-0062 (Canal de instalación por copia): ese copia el Producto completo como alternativa al marketplace. Tampoco es poblar un repo existente, como el plan Local-0007 (Habilidad para poblar subsistemas desde un repo existente): acá la fuente ya es un Agente Desplegado estructurado y se quiere reutilizar una selección de sus entradas.

## Resultado buscado

1. Una instalación pública nueva no recibe preferencias, conducta ni convenciones personales del autor como si fueran parte del mecanismo.
2. El autor conserva esas elecciones y puede aplicarlas a otro Agente Desplegado sin copiar filas y archivos a mano.
3. Las habilidades leen todos los Índices que cada manifiesto declara, escriben solo en el origen correcto y verifican el resultado.
4. La inicialización, la actualización y los controles delegan en código determinista todo lo que no requiere juicio.
5. Los planes y decisiones vuelven a ser vistas confiables: sin falsos pendientes y sin párrafos de detalle incrustados en los Índices.
6. Los costos de contexto y el efecto real de Conducta se miden antes de agregar más reglas o abstracciones.

## Dirección inicial para copiar Componentes entre Agentes Desplegados

Empezar por el caso mínimo real: **llevar una preferencia del Índice del Agente Desplegado de un repo a otro Agente Desplegado**.

La primera versión no agrega un tercer `origen` a los Índices ni promete sincronización permanente:

1. La fuente selecciona una entrada y los archivos de detalle que le pertenecen.
2. El destino muestra una vista previa y consulta al subsistema dueño.
3. Busca un equivalente por tema y contenido.
4. Si falta, la registra como entrada del Agente Desplegado destino, con un Código `Local-NNNN` nuevo; el Código de la fuente no viaja porque puede colisionar.
5. Repara vínculos internos y copia solo los archivos alcanzados.
6. Reporta `agregado` / `ya estaba` / `divergente`; nunca pisa una divergencia.
7. Repetir la misma operación es idempotente.

La forma del conjunto exportado y el nombre público del mecanismo quedan abiertos. Diseñarlo de modo que una versión posterior pueda agrupar varias entradas o versionar una colección reutilizable, pero **no construir esa segunda etapa** hasta que el caso de una preferencia funcione de punta a punta.

### Contrato de incorporación por subsistema

La operación de copia **no interpreta** el registro de cada destino ni escribe directamente en sus tablas. Cada subsistema es dueño de incorporar una propuesta mediante una habilidad propia. Esta distribución aplica el principio ya fijado por la Decisión Local-0040 (Las habilidades que clasifican Aprendizaje viven en su destino): el coordinador transporta y deriva; el destino conserva el criterio.

Ejemplo mínimo para Preferencias: la operación recibe el texto de una preferencia y sus detalles opcionales, lee todos los Índices declarados por el subsistema, busca equivalentes y contradicciones, comprueba consistencia con las reglas existentes, propone el texto final y su destino, espera ratificación, asigna el Código local, escribe, corre el lint y devuelve un resultado común.

Todos los subsistemas comparten **el contrato externo**, no su implementación:

- Entrada: contenido candidato, archivos relacionados, procedencia informativa y modo `vista previa` o `aplicar`.
- Salida: `agregado` / `ya estaba` / `divergente` / `rechazado`, más las rutas y entradas alcanzadas.
- Garantías: inspección antes de escribir, equivalencia por tema, texto canónico ratificado cuando corresponda, Código asignado por el destino, ninguna divergencia pisada e idempotencia.
- Autoridad: el coordinador nunca decide qué columnas tiene el Índice, qué consistencia semántica exige el subsistema ni cómo se materializa una entrada.

`registrar-preferencia` ya está cerca de esta operación. Antes de crear otra habilidad, evaluar si se la corrige y se la renombra a una acción de incorporación más evidente, o si `agregar-preferencia` queda como operación mínima y `registrar-preferencia` conserva el flujo que detecta feedback recurrente. La misma pregunta se resuelve por subsistema; no se multiplican aliases sin una diferencia funcional.

Antes de ampliar el alcance, resolver explícitamente qué tipos son transferibles:

- Preferencias: primer caso; transferible por defecto.
- Conocimiento y semántica: transferibles solo si no dependen del Propósito de la fuente.
- Conducta: puede arrastrar un Momento o una Herramienta; necesita resolver dependencias.
- Herramientas: requiere copiar código, ficha y referencias por ruta; nunca es solo una fila.
- Decisiones y planes: no transferir por defecto; normalmente describen el futuro o la historia del repo fuente.
- Subsistemas completos: tratar aparte; crear una casa nueva es distinto de mover una entrada.

## Trabajo

### 1. Asentar las decisiones que mandan

Mostrar y ratificar por separado el texto exacto de estas decisiones estructurales:

1. **Ratificada el 03/08/2026 como Decisión Local-0053 (La Base pública no incluye elecciones personales del autor):** el Agente Multipropósito publicado contiene el mecanismo general y las reglas necesarias para operarlo, pero no las elecciones personales del autor.
2. **Ratificada el 03/08/2026 como Decisión Local-0054 (Replicar una elección personal no la convierte en Base):** los Componentes de Subsistema personales reutilizables se incorporan como Aprendizaje local de cada destino; reutilizarlos no los promueve automáticamente a la Base pública.
3. **Ratificada el 03/08/2026 como Decisión Local-0055 (Copiar una entrada entre Agentes Desplegados es una operación puntual):** lo copiado entra como Aprendizaje local del destino, sin crear un tercer origen, un vínculo permanente ni propagación automática de cambios posteriores.

Una decisión por vez. No avanzar a una forma de archivos o una implementación que presuponga las decisiones siguientes.

### 2. Corregir primero los defectos de las habilidades

- Cambiar `amp:planificar`, `registrar-conocimiento` y `buscar-conocimiento` para que lean tanto el Índice del Agente Multipropósito como el del Agente Desplegado, descubiertos desde el manifiesto/frontmatter.
- Hacer que `registrar-herramienta` y `registrar-regla` busquen equivalentes en ambos orígenes antes de escribir en el Índice del Agente Desplegado.
- Corregir `registrar-regla`: un Momento propio se declara en `MOMENTOS-LOCAL.md`, nunca en el archivo reemplazable del Agente Multipropósito.
- Reconciliar el criterio de `registrar-conocimiento`: debe admitir conocimiento verificable específico del proyecto, no solo hechos que seguirían siendo ciertos sin el repo.
- Separar claramente `amp:inicializar` —instalación/reconciliación de ausencias— de `amp:actualizar` —nivelación de una Base ya instalada—.
- Corregir la contradicción de `amp:actualizar` sobre dónde vive el respaldo.
- Crear un control de habilidades que valide frontmatter, disparador, reconciliación, referencias locales, nombres retirados y cierre verificable.
- Definir el contrato común de incorporación y hacer que cada habilidad dueña lo cumpla sin uniformar las tablas internas de los subsistemas.

Este bloque coordina el plan Local-0070 (Partir las mega-skills en habilidades de un verbo), pero no obliga a partir una habilidad que ya sea cohesiva. El criterio es una acción reconocible y verificable, no el largo por sí solo.

### 3. Separar el Producto público del criterio personal

- Inventariar todo Componente del Agente Multipropósito que hoy viaja a cada instalación: preferencias, reglas de Conducta, páginas de detalle, convenciones de commits y cualquier ejemplo que imponga criterio personal.
- Clasificar cada uno como `mecanismo público`, `elección personal reutilizable` o `Aprendizaje propio de este repo`.
- Mostrar la clasificación antes de mover contenido canónico.
- Dejar la Base pública con el mecanismo y las garantías mínimas necesarias para operarlo.
- Conservar las elecciones personales en este repo hasta que el mecanismo para copiarlas a otro Agente Desplegado pueda moverlas sin pérdida.
- Probar una instalación limpia y verificar que no reciba fechas argentinas, prohibición de analogías deportivas, estilo personal de commits ni otras elecciones no seleccionadas.

Este bloque absorbe el problema del plan Local-0020 (Separar mecánica del harness de criterio del autor). También obliga a revisar el plan Local-0080 (Subir dos preferencias del Agente Desplegado al Agente Multipropósito): una preferencia útil en varios agentes del autor no es por eso parte neutral del Producto público.

### 4. Construir el caso mínimo de copia entre Agentes Desplegados

- Definir una vista previa que muestre fuente, destino, archivos alcanzados, equivalentes y divergencias.
- Implementar exportación e importación de una preferencia con página de detalle opcional.
- Hacer que el coordinador entregue la propuesta a la operación de incorporación de Preferencias; no permitirle editar `PREFERENCIAS-LOCAL.md` por su cuenta.
- Reasignar el Código en destino y reparar toda referencia al Código o a la ruta anterior.
- Generalizar solo el transporte, la vista previa y la forma del resultado. La validación, la reconciliación y la escritura siguen en la habilidad dueña de cada subsistema.
- Probar: destino vacío, equivalente exacto, divergente del mismo tema, colisión de Código, detalle ausente, segunda corrida idempotente y cancelación sin cambios.
- Aplicar la prueba real: retirar de la Base pública una preferencia personal, conservarla en la fuente y llevarla a dos Agentes Desplegados de prueba.
- Recién después evaluar un conjunto de varias entradas y dependencias entre Conducta y Herramientas.

No mezclar este mecanismo con el plan Local-0062 (Canal de instalación por copia): instalar el Agente Multipropósito y reutilizar Aprendizaje son operaciones diferentes, aunque ambas muevan archivos.

### 5. Reconciliar planes y decisiones existentes

- Auditar todos los planes vivos contra el código y los documentos actuales.
- Transicionar los falsos pendientes; dividir los parcialmente ejecutados; descartar con motivo los absorbidos por este plan.
- Revisar primero los planes Local-0034, Local-0042, Local-0054, Local-0068 y Local-0078, que ya contienen evidencia de implementación.
- Tratar el plan Local-0067 (Una decisión, un tema — y baja de la reemplazada) como precondición para adelgazar el registro de decisiones.
- Dejar en cada fila de decisión solo un resumen breve de qué se decidió y por qué; mover la conceptualización larga a su Detalle.
- Antes de abrir un plan nuevo durante esta ejecución, buscar equivalentes en `PLANES.md` y en los planes que este paraguas coordina.

### 6. Volver deterministas los flujos mecánicos

- Extraer de `amp:inicializar` y `amp:actualizar` las copias, cortes de tabla, merges y verificaciones que pueden ejecutar Herramientas con vista previa.
- Mantener en las habilidades solo la coordinación, las preguntas por divergencias y la ratificación de contenido canónico.
- Dar al control de cierre un modo estricto que salga con error ante hallazgos y una salida estructurada para automatización, sin sacar el modo informativo actual.
- Cubrir con pruebas negativas cada operación que decide que algo viaja, se pisa o se declara verde.
- Corregir la documentación desactualizada: cantidad de plugins, nombres de instaladores retirados, enlaces rotos y alcance real por agente.

### 7. Medir efecto y costo antes de crecer Conducta

- Ejecutar el plan Local-0027 (Banco de pruebas conductual de mecanismos) empezando por una salida verificable sin juez de lenguaje.
- Resolver junto con él el plan Local-0089 (Por qué las preferencias cargadas no se aplican).
- Extender la medición de contexto para incluir lo que Conducta inyecta en cada turno y mostrar costo por turno y estimación acumulada.
- Comparar la tasa de cumplimiento con regla siempre cargada, recordatorio por turno y control determinista en el punto de acción.
- No sumar reglas generales nuevas hasta saber si la reinyección aporta más de lo que cuesta.

### 8. Recién al final, reevaluar la complejidad estructural

- Medir si nueve plugins obligatorios justifican su costo por la visibilidad del prefijo de subsistema.
- Para los lints, preferir una biblioteca compartida de capacidades con envoltorios finos; no construir automáticamente un único lint configurable. Contrastar contra el plan Local-0031 (Lint unificado parametrizable por capacidad de subsistema).
- Decidir si copiar Componentes necesita actualización repetida y versiones. Si los casos reales son copias puntuales, no agregar suscripción, tercer origen ni estado permanente.

## Orden y dependencias

1. Decisiones estructurales del punto 1.
2. Defectos de habilidades y control de habilidades.
3. Inventario público/personal.
4. Caso mínimo de copia de una preferencia entre Agentes Desplegados.
5. Migración de las elecciones personales fuera de la Base.
6. Reconciliación de planes y decisiones.
7. Herramientas deterministas, control estricto y documentación.
8. Pruebas conductuales y medición completa de contexto.
9. Evaluación de simplificaciones mayores.

El inventario puede descubrir contenido personal antes de que exista el importador, pero no se lo retira de la Base hasta demostrar que puede conservarse y aplicarse en otro agente.

## Avance

### 03/08/2026 — decisiones y corrección urgente de habilidades

- Ratificadas las Decisiones Local-0053 (La Base pública no incluye elecciones personales del autor), Local-0054 (Replicar una elección personal no la convierte en Base) y Local-0055 (Copiar una entrada entre Agentes Desplegados es una operación puntual).
- `amp:planificar`, `registrar-conocimiento`, `buscar-conocimiento`, `registrar-herramienta` y `registrar-regla` leen todos los Índices declarados antes de comparar; las operaciones de alta escriben solo en el origen del Agente Desplegado.
- Corregido el criterio de Conocimiento: admite hechos y procedimientos verificables específicos del proyecto y los distingue de la documentación por su público y propósito, no por su alcance.
- Un Momento propio de Conducta se declara en `MOMENTOS-LOCAL.md`; la skill ya no modifica el registro reemplazable del Agente Multipropósito.
- Separados los alcances de `amp:inicializar` y `amp:actualizar`: el primero completa ausencias sin nivelar una Base existente; el segundo respalda, reemplaza Base y migra formas viejas.
- Unificada la ubicación del respaldo de `amp:actualizar`: si git no cubre `.claude/`, se crea fuera del repo bajo el temporal del sistema.
- `lint-harness` valida las skills publicadas: frontmatter y nombre, disparador, reconciliación, referencias Markdown, nombres retirados y cierre verificable. Sus seis controles nuevos tienen caso negativo; el banco completo quedó en 30 casos.
- Las ocho skills que no declaraban reconciliación ahora explicitan su comportamiento al re-ejecutarse. Se subieron las versiones de los nueve plugins modificados; publicar e instalar esas versiones queda fuera de este bloque.
- Validación: marketplace válido; 18 bancos de pruebas verdes, incluido `amp-actualizar` con 38 casos y `lint-harness` con 30.

### Inventario provisional de lo público y lo personal — sin mover contenido

La clasificación siguiente es una propuesta para revisar antes de tocar la Base. Reutilidad, calidad o uso frecuente no alcanzan para volver pública una elección: la prueba es si el Agente Multipropósito necesita imponerla para que el mecanismo funcione para cualquier usuario.

| Grupo | Componentes actuales | Propuesta |
|---|---|---|
| Mecanismo público | Estructura de los ocho subsistemas; manifiestos; registros vacíos del Agente Desplegado; lints, hooks, funciones comunes y Herramientas del Agente Multipropósito; ciclo de planes; Pantalla de bienvenida; Regla de Conducta Base-0004 (Preguntar antes de redefinir o remover algo canónico), Regla de Conducta Base-0005 (Contrastar contra la sabiduría del repo al escribir) y Regla de Conducta Base-0006 (Frenar la terminología vetada antes de que se escriba) | Conservar en la Base. Son infraestructura o garantías necesarias para operar los registros sin perder Aprendizaje. |
| Preferencias del Agente Multipropósito clasificadas | Las dieciséis filas originales de `preferencias/PREFERENCIAS.md` y sus páginas de detalle | Clasificación individual completada el 04/08/2026: ocho filas vigentes eran elecciones personales reutilizables, seis son garantías o mecanismos públicos y dos se retiraron. La Preferencia Base-0006 ya migró a Preferencia Local-0006 después de probar la copia segura, la Preferencia Base-0001 a Preferencia Local-0007, la Preferencia Base-0002 a Preferencia Local-0008 y, en una tanda final, las Preferencias Base-0004, Base-0008, Base-0011 y Base-0015 a Locales 0009 a 0012; queda una sola elección personal en la Base, la Preferencia Base-0012, retenida por sus dependencias. |
| Elecciones personales de Conducta | Regla de Conducta Base-0007 (Mantener el archivo de estado antes de informar) y Regla de Conducta Base-0008 (Aplicar el estilo de commits antes de confirmar) | Revisar junto con las Preferencias que consumen; si aquellas resultan personales, retirar también estas reglas de la Base pública cuando exista la copia segura. |
| Mezcla que hay que partir | Regla de Conducta Base-0002 (Respetar las preferencias cargadas): la intención de entregar recordatorios puede ser mecanismo, pero el texto fija fechas argentinas, ejemplos no deportivos y `.claude/tmp/`; Regla de Conducta Base-0003 (No acuñar terminología del dominio): la consulta al glosario es mecanismo, pero el filtro español/inglés y «le resulta raro al usuario» expresan un perfil de lector | Separar garantía general de contenido personal. No publicar la fila actual tal cual. |
| Mecanismo incompleto | Regla de Conducta Base-0009 (Registrar en el subsistema cuando algo cambia) y momentos `al cerrar tarea` / `al crear un commit` | No son preferencias personales, pero hoy están `pendiente` o `declarado` sin repartidor. Conservar solo si se implementan y se prueba su efecto; si no, retirarlos para no publicar capacidad aparente. |
| Conocimiento público condicional | Las cinco páginas Base actuales de Conocimiento, incluidos Windows, módulos comunes y Semántica | Conservar por ahora: describen hechos o mecanismos reutilizables y declaran cuándo aplican. Revisar aparte si alguna explica este repo autor en vez del Producto público. |
| Aprendizaje personal ya bien ubicado | Preferencias Local-0001 (Usar fechas en formato argentino al hablar con el usuario), Local-0002 (Tomar los ejemplos del dominio del repo, sin analogías deportivas), Local-0003 (Guardar los archivos temporales en `.claude/tmp/`), Local-0004 (No contar como costo lo que ya está comprometido en todas las opciones) y Local-0005 (Enumerar tres o más elementos en lista de bullets) | No viajan hoy y no requieren migración para sanear la Base. Son candidatas directas para probar la copia entre Agentes Desplegados. |

Clasificaciones de Preferencias ratificadas:

- **04/08/2026 — Preferencia Base-0001 (Dar ejemplos concretos de cada postura): elección personal reutilizable.** Define cómo el usuario quiere recibir alternativas; el mecanismo del Agente Multipropósito funciona sin imponer ese grado y forma de detalle a terceros. Migrada el 04/08/2026 a Preferencia Local-0007 con texto idéntico; el Código Base-0001 queda como hueco histórico.
- **04/08/2026 — Preferencia Base-0002 (Pedir una decisión por vez, con contexto y recomendación): elección personal reutilizable.** Define cómo el usuario quiere que los agentes resuelvan o eleven decisiones. Se completó su texto para exigir que primero se consulten los subsistemas y se inspeccione el repo, y que toda consulta incluya una alternativa recomendada con su motivo. Esas garantías ya existían dentro de `amp:planificar`, pero no como regla general. Migrada el 04/08/2026 a Preferencia Local-0008 con texto idéntico; el Código Base-0002 queda como hueco histórico.
- **04/08/2026 — Preferencia Base-0003 (Mostrar el texto exacto antes de escribir en un registro canónico): mecanismo público mal ubicado.** Protege la autoridad del usuario sobre el contenido normativo o semántico que se le atribuye; no debe abarcar indiscriminadamente hechos verificables que el agente puede asentar desde el Producto o su código. La garantía debe salir de Preferencias y quedar explícita en los skills que escriben decisiones, preferencias, términos y reglas de Conducta; `amp:planificar` no debe depender indirectamente de que esta preferencia esté cargada. No se mueve todavía.
- **04/08/2026 — Preferencia Base-0004 (Acordar el formato con un esqueleto antes de calcular): elección personal reutilizable.** Fija el balance que el usuario prefiere entre autonomía y validación previa para informes o visualizaciones de formato nuevo. El Agente Multipropósito puede operar sin imponer ese turno adicional a terceros. Migrada el 04/08/2026 a Preferencia Local-0009 con texto idéntico.
- **04/08/2026 — Preferencia Base-0005 (Esperar la notificación de las tareas en background): retirada.** Surgió para contrarrestar la opacidad de Codex Luna durante tareas largas, que llevaba al usuario a preguntar repetidamente si seguía trabajando. Ya no representa una preferencia deseada y puede agravar el comportamiento opuesto observado en Terra: detenerse después de informar un avance o una acción pendiente. Se retiró la fila; el Código queda como hueco histórico y no se reutiliza.
- **04/08/2026 — Preferencia Base-0006 (Analizar y diseñar de alto a bajo nivel): elección personal reutilizable; absorbe la Preferencia Base-0007 (Iterar de alto a bajo nivel).** Expresa la estrategia del usuario de comprender el problema, sus elementos y relaciones antes de implementar, asumir temprano el costo de análisis y favorecer extensiones aditivas para reducir cambios sustractivos. Se acotó a extensiones razonablemente previsibles para no convertirla en abstracción especulativa. La Preferencia Base-0007 se retiró por duplicada y su Código no se reutiliza. La idea se relaciona con *Early Pain* de Martin Fowler —hacer aflorar temprano los problemas que aparecerían tarde—, aunque la aplicación del usuario enfatiza análisis y diseño de alto nivel, mientras Fowler lo presenta como beneficio del desarrollo iterativo. Después de validar el mecanismo, la fila migró a Preferencia Local-0006 y su página dejó de viajar en la Base pública.
- **04/08/2026 — Preferencia Base-0009 (Distinguir lo verificado de lo inferido o generado): garantía pública transversal.** Es una ontología epistemológica básica para el agente: separa hechos verificados, inferencias, supuestos, faltantes y datos sintéticos o de prueba. No debe quedar limitada a Conocimiento porque cualquier flujo puede producir afirmaciones. Se conserva en la Base pública y se afinó su texto para permitir información generada cuando está identificada, sin presentarla como real.
- **04/08/2026 — Preferencias Base-0008 y Base-0010: separación ratificada entre elección personal y mecanismo público.** La Preferencia Base-0008 (Nombrar y explicar el dominio en español) concentra el criterio personal de usar español corriente y combatir anglicismos, copias literales del inglés y palabras innecesariamente raras. La Preferencia Base-0010 (No adoptar terminología del dominio sin ratificación) conserva la gobernanza pública de Semántica: los términos nuevos se proponen, pero no se adoptan como vocabulario del repo antes de la ratificación del usuario. Se resolvió la contradicción anterior: un término propuesto puede mencionarse para discutirlo, no usarse como si fuera canónico. La Preferencia Base-0008 migró el 04/08/2026 a Preferencia Local-0010 con texto idéntico; la Preferencia Base-0010 permanece en la Base pública.
- **04/08/2026 — Preferencia Base-0011 (No reemplazar los nombres del dominio por siglas): elección personal reutilizable.** Exige conservar el nombre completo en lo que queda escrito, aun cuando la sigla ya se haya presentado. Se acotó a nombres propios del dominio para no prohibir siglas técnicas externas ni identificadores que deban conservarse. El Agente Multipropósito público no necesita imponer este grado de repetición a terceros. Migrada el 04/08/2026 a Preferencia Local-0011 con texto idéntico; su página de detalle dejó de viajar.
- **04/08/2026 — Preferencia Base-0012 (Redactar commits y descripciones de PR con la convención Antes/Ahora): elección personal reutilizable.** El usuario quiere esta convención en todos sus repos: español, sin coautoría ni atribución a la IA, título por área funcional y cuerpo Antes/Ahora. La Regla de Conducta Base-0008 (Aplicar el estilo de commits antes de confirmar) no duplica el contenido: es el mecanismo público que debe entregar la preferencia en el momento de redactar; se conserva como deuda pendiente de implementar. La preferencia no se mueve todavía.
- **04/08/2026 — Preferencia Base-0013 (Mantener un archivo de estado en tareas exploratorias): mecanismo público mal distribuido.** Resuelve la pérdida objetiva de estado en exploraciones largas por compactaciones, reinicios y cambios de agente. Hoy duplica parte de su norma con la Regla de Conducta Base-0007 (Mantener el archivo de estado antes de informar) y manda estado transitorio a Conocimiento. La forma objetivo es que Planes defina el documento y su sección `Estado`, Conducta entregue el recordatorio en el momento correspondiente y Conocimiento reciba solo los hallazgos reutilizables al cerrar. No se reubica todavía.
- **04/08/2026 — Preferencia Base-0014 (Dejar un handoff con nombre propio y el texto para pasárselo al que sigue): mecanismo público incompleto.** La transferencia de una tarea entre sesiones o agentes es generalizable, pero la fila depende de `.claude/tmp/`, ubicación fijada por una preferencia local que terceros no reciben, y no tiene skill propia, destinatario explícito ni ciclo de consumo. Debe resolverse junto con los planes `Buzones de comunicación entre Agentes` y `Herramienta Base para reiniciar la sesión desde un handoff`, sin inventar ahora otra ubicación. No se reubica todavía.
- **04/08/2026 — Preferencia Base-0015 (Evaluar soluciones existentes antes de implementar una propia): elección personal reutilizable.** Nació después de implementar manualmente el procesamiento de frontmatter, pagar defectos y duplicación, y descubrir que `gray-matter` ya resolvía el mecanismo. Se acotó a capacidades generales o mecanismos no triviales, con consulta a internet solo cuando esté permitida y sea pertinente; no obliga a adoptar dependencias ni alcanza adaptaciones triviales o comportamiento específico del dominio. Migrada el 04/08/2026 a Preferencia Local-0012 con texto idéntico; su página de detalle dejó de viajar.
- **04/08/2026 — Preferencia Base-0016 (Citar los códigos de las Entradas de Índice con su tipo y contexto): garantía pública transversal.** La regla se acotó a los códigos de Entradas de Índice de Subsistema, no a identificadores del Producto, código fuente, commits ni sistemas externos. Es pública porque `Base-NNNN` y `Local-NNNN` se repiten entre Índices; el tipo evita ambigüedad y el título evita búsquedas innecesarias. La descripción incorporó las excepciones que antes vivían solo en el detalle. Debe incorporarse también al Patrón y a los skills que producen referencias.

Dependencias que el mecanismo de copia no puede ignorar:

- La Preferencia Base-0012 (Escribir los commits y las descripciones de PR en español) tiene como consumidora la regla de Conducta Base-0008 (Aplicar el estilo de commits antes de confirmar).
- La Preferencia Base-0013 (Mantener un archivo de estado en tareas exploratorias) tiene como consumidora la regla de Conducta Base-0007 (Mantener el archivo de estado antes de informar).
- La Preferencia Base-0014 (Dejar un handoff con nombre propio y el texto para pasárselo al que sigue) presupone la ubicación de temporales que hoy fija la Preferencia Local-0003 (Guardar los archivos temporales en `.claude/tmp/`).
- La regla de Conducta Base-0002 (Respetar las preferencias cargadas) nombra tres Preferencias Locales que **no viajan en una instalación pública**. Un tercero recibe hoy el recordatorio de obedecer reglas que no recibió: es un defecto funcional, no solo contenido personal.

La clasificación individual quedó completa. El caso mínimo de incorporación se implementó, se probó y se aplicó con la antigua Preferencia Base-0006, ahora Preferencia Local-0006.

### 04/08/2026 — contrato de incorporación y caso mínimo de Preferencias

- Se amplió `amp-preferencias:registrar-preferencia` en vez de crear `agregar-preferencia`: ambas nombraban la misma acción de alta y separarlas habría duplicado el control semántico, la ratificación y la reconciliación.
- La habilidad acepta dos procedencias —texto nuevo o copia puntual desde otro Agente Desplegado— y cumple el contrato común: entrada candidata, vista previa o aplicación, salida `agregado` / `ya estaba` / `divergente` / `rechazado`, Código asignado por el destino y ninguna divergencia pisada.
- El juicio quedó en la habilidad: lee todos los Índices y compara tema, intención, alcance y contenido. La mecánica quedó en `funcionalidades/amp-preferencias/skills/registrar-preferencia/scripts/incorporar-preferencia.js`: descubre el Índice local por `origen`, calcula `máximo + 1`, copia el Detalle, repara el Código fuente y produce salida estructurada.
- El banco de diez casos usa únicamente repos temporales. Demostró la Preferencia Base-0006 (Analizar y diseñar de alto a bajo nivel) entrando como Preferencia Local-0001 con su página, lint verde y segunda corrida `ya estaba`; cubre además vista previa/cancelación sin cambios, divergencia temática, colisión de Código, colisión de archivo, detalle ausente, reparación de referencias, alta desde JSON y rechazo de dependencias locales que esta primera versión no copia.
- Se repararon cuatro casos del banco de `lint-preferencias` que habían quedado inertes al retirarse las Preferencias Base-0005 y Base-0007; los doce controles vuelven a encenderse ante su defecto.
- Ratificado el texto exacto, la Preferencia Base-0006 migró a Preferencia Local-0006 en este repo. Su página de detalle permanece en `.claude/preferencias/`, pero se retiró de `amp:inicializar`; una instalación pública nueva ya no recibe ni la fila ni la página.
- La Preferencia Local-0006 se copió desde este Agente a **dos** Agentes Desplegados temporales. En ambos destinos entró como Preferencia Local-0001, conservó el detalle, pasó el lint y no creó ningún vínculo con la fuente. No se modificó otro Agente real.
- `sincronizar-base` informa ahora 88 archivos distribuibles, cero pendientes, y no vuelve a incorporar la página personal retirada. El próximo paso de saneamiento es migrar una por una las siete elecciones personales que todavía permanecen en la Base, mostrando su fila exacta antes de cada cambio.
- Ratificado su texto exacto, la Preferencia Base-0001 (Dar ejemplos concretos de cada postura) migró a Preferencia Local-0007 sin cambios de contenido. Se repararon los tres casos del banco de `lint-preferencias` que usaban su fila para simular defectos —ahora se apoyan en la Preferencia Base-0003, que permanece pública— y se sincronizó la Base distribuible.
- Migró después la Preferencia Base-0002 (Pedir una decisión por vez, con contexto y recomendación) a Preferencia Local-0008, también con texto idéntico. Su banco de `lint-preferencias` no la usaba, pero apareció una dependencia que el traspaso anterior no había listado: `funcionalidades/amp/skills/planificar/SKILL.md` citaba la fila por su Código y delegaba en ella el fundamento de cómo presentar cada decisión. Como la habilidad ya enuncia la norma completa —resolver lo averiguable, una decisión por vez, contexto en el texto y no en las opciones, recomendada visible y cola final de confirmaciones—, se retiró el puntero al Código sin perder contenido y la habilidad quedó autosuficiente. **Regla general para las migraciones que faltan: antes de mover una fila, buscar su Código en `funcionalidades/`, porque una habilidad pública que apunte a una Preferencia retirada de la Base queda referenciando algo que la instalación ya no entrega.**
- Migraron después, en una sola tanda, las cuatro elecciones personales sin dependencias en habilidades: la Preferencia Base-0004 a Local-0009, la Base-0008 a Local-0010, la Base-0011 a Local-0011 y la Base-0015 a Local-0012, todas con texto idéntico. Las dos últimas tenían página de detalle: se retiró su copia de `funcionalidades/amp/skills/inicializar/base/preferencias/`, se sacó su enlace del README distribuible y se reparó dentro de cada página la cita al Código de origen. Las páginas siguen vivas en `.claude/preferencias/` porque las declaran las filas Local. El instalador pasó de 88 archivos distribuibles a 86.
- El banco de `lint-preferencias` marcó cuatro casos en rojo apenas salió la Preferencia Base-0008, que era la fila sobre la que sembraban su defecto. **Es el comportamiento buscado**: el banco avisó en vez de quedar inerte en verde, que es la falla que ya se había pagado con las Preferencias Base-0005, Base-0006 y Base-0007. Se los reapuntó a la Preferencia Base-0009, clasificada como garantía pública transversal y por lo tanto estable.
### 04/08/2026 — el catálogo de Preferencias Recomendadas

El usuario objetó, con razón, el costo de replicar: sacadas las elecciones personales de la Base, aplicarlas a cada repo suyo pasaba a ser doce copias sueltas por repo, y las Reglas de Conducta no tienen mecanismo de copia. Propuso en cambio **una habilidad de preferencias recomendadas que las cargue**, y esa forma resultó mejor que el conjunto exportable que este plan tenía previsto: el conjunto necesita el repo fuente a mano, el catálogo viaja con el plugin.

- **Se resolvió que el catálogo viaje en el plugin público.** No contradice la Decisión Local-0053: lo que aquella prohíbe es que un tercero *herede impuesta* una elección del autor, y del catálogo no se instala nada — la habilidad lo muestra y la adopción es explícita. De yapa le resuelve a un tercero el problema de arrancar con el Índice vacío y ninguna guía.
- **No se construyó motor nuevo.** El auxiliar `incorporar-preferencia.js` ya aceptaba propuestas, así que el catálogo se le dio con la forma de un Índice de Preferencias —frontmatter que lo declara y la misma tabla— y se le sumó `--catalogo <dir>`, que descubre índices en un directorio suelto en vez de exigir un repo alrededor. Cambio aditivo: los diez casos previos siguieron verdes sin tocarlos.
- **El catálogo es derivado.** Lo genera la Herramienta `sincronizar-recomendadas` desde el Índice del Agente Desplegado de este repo: renumera los Códigos, copia las páginas de detalle, repara adentro la cita al Código de origen y borra lo que ya nadie declara. Así la misma preferencia no queda escrita en dos lugares que divergen sin control, que es el defecto del conocimiento Base-0001 (Evitar el mismo dato escrito en varios lugares). Sale con código 1 si quedó viejo.
- Se sumó la habilidad `adoptar-recomendadas` al plugin `amp-preferencias`, que subió a 0.9.0. Bancos: 17 casos nuevos para la Herramienta y 2 para la vía `--catalogo`; los 20 bancos del repo quedaron verdes.
- **Queda pendiente el mismo mecanismo para Conducta.** El catálogo hoy solo publica preferencias, y la Regla de Conducta Base-0008 sigue sin forma de viajar. Es lo que falta para poder mover la Preferencia Base-0012.

### 04/08/2026 — cierre del saneamiento de Preferencias

La última elección personal, la Preferencia Base-0012 (Redactar commits y descripciones de PR con la convención Antes/Ahora), migró a Preferencia Local-0013 con texto idéntico, y **se retiró de la Base la Regla de Conducta Base-0008** (Aplicar el estilo de commits antes de confirmar) que la consumía.

Lo que destrabó la decisión fue comprobar que **retirar esa regla no le saca capacidad a nadie**: su momento `al crear un commit` figura `declarado`, con repartidor pendiente, y la regla estaba en estado `pendiente`, así que nunca se entregó. Lo que se publicaba era capacidad aparente, el caso que este mismo plan había marcado como «conservar solo si se implementan y se prueba su efecto; si no, retirarlos». Hay además evidencia en contrario de que hiciera falta: el plan Local-0089 registra que el 02/08/2026 **se cumplió** la convención de commits, con la regla sin correr — la Preferencia sola, siempre en contexto, ya hacía el trabajo. **Una Preferencia no depende de su Regla de Conducta para regir; la regla es refuerzo en el momento de actuar, no el canal de entrega.**

Reparaciones que arrastró: se retiró la página `estilo-commits.md` del instalador y su enlace del README distribuible; se corrigió en `amp:actualizar` la fila de migración de `feedback_estilo_commits.md`, que apuntaba a la página y a la regla y hoy habría mandado a un repo viejo contra dos destinos inexistentes —ahora deriva el contenido al Aprendizaje del repo con `registrar-preferencia`—; y dos bancos volvieron a marcar en rojo apenas la página dejó de viajar, el de `lint-preferencias` y el del nivelador, los dos reapuntados a `archivo-de-estado.md`, que sigue siendo Base. **Tercera vez en la sesión que un banco avisa al retirarse una fila: el patrón está confirmado y conviene buscar el Código y el nombre del archivo en los bancos antes de cada retiro, no después.**

Estado de la Base pública tras el saneamiento: **seis Preferencias** —Base-0003, 0009, 0010, 0013, 0014 y 0016, todas garantías o mecanismos— y **ocho Reglas de Conducta**. Ninguna elección personal del autor queda publicada.

### 04/08/2026 — las dos Reglas de Conducta que publicaban criterio personal

Cerrado el saneamiento de Preferencias, quedaban dos Reglas de Conducta que seguían publicando contenido personal por la ventana. Las dos eran la «mezcla que hay que partir» del inventario y las dos se resolvieron igual: se conservó la garantía general y se retiró de la regla el contenido que pertenece a una Preferencia del Agente Desplegado.

- **Regla de Conducta Base-0002 (Respetar las preferencias cargadas):** su Contenido enumeraba tres Preferencias Locales de este repo —fechas argentinas, ejemplos no deportivos, temporales en `.claude/tmp/`— que **no viajan**. Un tercero recibía en cada turno la orden de obedecer reglas que nunca le llegaron. Ahora recuerda que las tablas están cargadas y dónde leerlas, sin nombrar ninguna fila.
- **Regla de Conducta Base-0003 (No acuñar terminología del dominio):** transcribía el test de idioma español/inglés con sus ejemplos y cerraba con «le resulta raro al usuario», suponiendo un lector hispanohablante. Ahora conserva la garantía —consultar el glosario, proponer en Propuestos, no usar vetados, no dar por canónico un propuesto— y remite al criterio del conocimiento, que es relativo al lector y no fija idioma.

**El criterio de idioma no se perdió, se reubicó donde el usuario lo señaló.** El intento de conservarlo dentro de la página de conocimiento Base-0003 (Terminología farlopa) fue un error propio y se revirtió en el momento: esa página se declara universal y su criterio es «¿lo entiende el usuario del Propósito de este repo?», así que sumarle el test español/inglés metía en la Base pública justo lo que se estaba sacando. El test completo, con las dos listas de ejemplos y el motivo por el que un test operable reemplaza a una regla abstracta, pasó a ser la página de detalle de la Preferencia Local-0010 (Nombrar y explicar el dominio en español), que hasta entonces no tenía Detalle. Como el catálogo de Recomendadas es derivado, la página entró sola al regenerarlo, con su Código reparado.

**Queda dicho el criterio de reparto que ordenó todo el saneamiento:** el fenómeno y el criterio de demarcación son mecanismo y viajan como conocimiento Base; su aplicación a un idioma concreto es elección personal y viaja como Preferencia adoptable. Un repo cuyo usuario trabaje en inglés recibe el primero y no necesita la segunda.

**Estado: ninguna elección personal del autor queda en la Base pública.** Seis Preferencias —todas garantías o mecanismos— y ocho Reglas de Conducta, ninguna de las cuales nombra una Preferencia que no viaje. Verificado con los 20 bancos del repo en verde, `sincronizar-base` sin pendientes y `lint-harness` sin más hallazgos que los nueve desfases de versión sin publicar.

### Observación no resuelta

El término es **Terminología Farlopa**, entero: nunca «farlopa» a secas, que es una palabra suelta y no el término del dominio. Es lunfardo rioplatense, y está en el nombre del registro `TERMINOLOGIA-FARLOPA.md`, en el título del conocimiento Base-0003 y en el texto de varias habilidades que se publican. Por el mismo criterio que ordenó este saneamiento es criterio personal en lo que viaja; a diferencia de los casos anteriores, cambiarlo toca un registro canónico y todas sus citas, así que **no se abrió acá**.

Conversado el 04/08/2026 y postergado por el usuario, que lo dio por innecesario ahora. Lo que quedó dicho, para no reconstruirlo:

- **La salida es el mecanismo que el subsistema ya tiene:** el nombre llano —«deriva terminológica» o «deriva semántica»— como término canónico del glosario, y **Terminología Farlopa** registrada como **alias**. No hace falta inventar nada: el glosario ya lleva concepto, definición y alias, y el título del conocimiento Base-0003 ya usa las dos formas juntas.
- **Abarata el cambio un dato verificado ese día:** **Terminología Farlopa no tiene fila en el glosario ni en su propio registro par**. El término que ordena el subsistema nunca fue definido en los registros que ese subsistema gobierna. Entonces no hay una definición que redefinir ni dependientes de esa definición que reparar: hay que **crear** la entrada. Los nombres de archivo y las citas en el texto plano son un barrido posterior y separable.
- **La intención detrás del nombre era pedagógica:** el usuario había pensado traducirlo como *farlop terminology*, un sinsentido deliberado en inglés para que el lector anglófono experimente en carne propia lo que la página describe. El costo es que un término deliberadamente incomprensible falla el propio test del criterio, y termina apareciendo en nombres de archivo y en salidas de lint. Se puede conservar la demostración sin pagarlo: el nombre llano manda y la humorada vive dentro de la definición, explicando por qué se eligió.
- **Trampa de esta conversación, ya pagada:** el agente partió el término y trató «farlopa» como si fuera la unidad a discutir. Un término compuesto se busca, se cita y se decide **entero**; partirlo cambia lo que se está preguntando y produce un hallazgo sobre algo que no es el término.

### 04/08/2026 — la instalación limpia, ejecutada por primera vez

Se ejecutó el criterio de cierre número uno: instalar sobre un **repo vacío** y verificar qué recibe un tercero. La instalación se replicó paso a paso desde `amp:inicializar` —copiar el árbol de `base/`, crear las tres carpetas del ciclo de planes, y fusionar `AGENTS.md`, `CLAUDE.md`, `.claude/settings.json` y `.codex/hooks.json`—, con los bloques que se fusionan **extraídos de `PLANTILLA.md`**, no transcriptos: transcribirlos habría medido la copia en vez del original. El repo de prueba se armó fuera de este repo, porque uno dentro de `.claude/tmp/` lo barre `lint-harness` y contamina la verificación misma.

**El saneamiento pasó la prueba.** 85 archivos instalados —el mismo número que informa `sincronizar-base`—, los ocho lints en verde, y `amp-actualizar --vista-previa` con `identidad.md` como única línea del grupo `BASE — INSTALAR / PISAR`, que es exactamente lo que la habilidad exige de una instalación nueva. Disparados los tres momentos del repartidor contra el repo instalado, **ninguno de los cuatro criterios personales llega**: no hay fechas argentinas, ni prohibición de analogías deportivas, ni estilo de commits, ni criterio de idioma. El texto de `cada turno` que recibe un tercero son 1153 caracteres que no nombran ninguna fila. El barrido se extendió a los `SKILL.md` del plugin, que también viajan: las únicas apariciones están en el catálogo de Recomendadas, que es el canal explícito y del que no se instala nada. El arranque carga 27,8 KB contra un tope de 52 KB.

**Pero la prueba encontró lo que ningún control podía ver: una instalación pública no crea `.gitignore`, y cuatro mecanismos Base dan por sentado que `.claude/tmp/` está gitignoreado.** Lo declaran en su propio texto `lint-semantica`, `lint-conocimiento`, `alcance-al-escribir.js` y `establecer-conducta.js`. La premisa es verdadera **en este repo**, donde la fija la Preferencia Local-0003 (Guardar los archivos temporales en `.claude/tmp/`), que **no viaja** — y ninguna parte de la instalación la establece en el destino. Medido: apenas corre el primer `SessionStart`, la Pantalla de bienvenida lanza `actualizar-plugins --avisar` y quedan `.claude/tmp/avisos/plugins.txt` y `.claude/tmp/ultima-consulta-plugins.txt` listos para entrar en el primer commit del tercero.

Esto **reencuadra la deuda ya asentada** de la Preferencia Base-0014 (Dejar un handoff con nombre propio y el texto para pasárselo al que sigue), clasificada como mecanismo público incompleto por depender de una ubicación que fija una preferencia local. La ubicación **sí es mecanismo**: el Buzón de Avisos Generales del propio Agente Multipropósito escribe ahí. Lo que falta no es reubicar el handoff, es que la instalación establezca la condición que sus mecanismos ya suponen.

**Segundo hallazgo, en texto que se publica.** La sección §Nota de `PLANTILLA.md`, la que habla de la Regla de Conducta Base-0002 (Respetar las preferencias cargadas), decía que el `Contenido` de esa regla «nombra preferencias concretas: fechas, ejemplos del dominio, ubicación de los temporales». Esa fila se reescribió en esta misma sesión justamente para no nombrar ninguna. La nota quedó describiendo un contenido que ya no existe **y reponiendo en el texto publicado los tres criterios personales que el saneamiento había sacado**. Ningún control lo marca: no es terminología vetada ni un enlace roto.

### 04/08/2026 — la instalación establece la condición que sus mecanismos suponían

Ratificado por el usuario, `.gitignore` pasó a ser el **cuarto archivo que `amp:inicializar` fusiona**, con las dos rutas donde escribe el mecanismo: la config de Claude Code propia de la máquina y `.claude/tmp/`. Bloque `§Gitignore` en la PLANTILLA, y las tres enumeraciones de la habilidad —los que se fusionan, la estructura objetivo y el paso 3 del flujo— actualizadas.

**El respaldo del nivelador no entró, y era la tentación.** El `.gitignore` de este repo tiene `.claude/.respaldo-amp/`, pero esa ruta está muerta: el nivelador respalda desde hace tiempo en el temporal del sistema, y `amp:actualizar` ya detecta los `.respaldo-amp/` que dejaron corridas viejas y ofrece borrarlos. Copiar la línea al bloque que viaja habría publicado una ruta que una instalación nueva nunca crea.

**El arreglo alcanza también a quien ya instaló.** `amp:inicializar` solo cubre repos nuevos o parciales, así que el nivelador ganó su chequeo `[4b]`: compara el `.gitignore` del repo contra las dos rutas —normalizando `./` inicial y barra final, que son la misma regla escrita distinto— y marca **solo las que faltan**, para merge. Es determinista, como el cableado del hook: sin chequeo propio, la instrucción del `SKILL.md` habría sido letra muerta.

**El banco avisó, por cuarta vez en el plan.** Al sumar el chequeo, el caso «un repo al día cierra sin nada para nivelar» se puso en rojo: el repo de referencia no tenía `.gitignore` y por lo tanto ya no estaba al día. Se lo agregó a `armarAlDia()` —igual que los hooks, que tampoco se copian de `base/` sino que se fusionan— y se sumaron dos casos negativos: sin archivo se reclaman las dos rutas, y con una sola puesta se reclama únicamente la que falta. El banco pasó de 38 a 40 casos.

Se retiró además la sección §Nota de la PLANTILLA en vez de reescribirla: existía solo para explicar por qué se esperaba que *esa* fila divergiera por repo, y sin filas nombradas no hay expectativa especial. La regla general de no pisar lo divergente ya vive en el `SKILL.md` §Reconciliación y en el nivelador.

**Verificado de punta a punta.** Reinstalada la instalación limpia con el bloque nuevo: la vista previa del nivelador vuelve a dar `identidad.md` como única línea, y `git check-ignore` confirma que quedan fuera del control de versiones los tres archivos que el mecanismo deja —el buzón de avisos, la marca de última consulta y un traspaso—. Esto resuelve de paso el daño práctico de la Preferencia Base-0014 (Dejar un handoff con nombre propio y el texto para pasárselo al que sigue): su ubicación ya no depende de una preferencia que no viaja. Los 20 bancos verdes, `sincronizar-base` sin pendientes y el control de cierre sin más hallazgos que los desfases de versión. `amp` subió a 0.28.0.

### Lo que falta para publicar

El saneamiento de contenido personal está cerrado; lo que queda no es criterio del autor sino trabajo de publicación:

- **Publicar las versiones.** Los nueve plugins tienen la versión subida en disco y sin publicar; son los nueve hallazgos permanentes de `lint-harness`. Hasta que se publiquen, ningún Agente Desplegado recibe nada de esto.
- ~~**Probar una instalación limpia**~~ — **hecho el 04/08/2026.** Ninguno de los cuatro criterios personales llega a un repo vacío. Los dos defectos que encontró están corregidos.
- **Curar y traducir**, si el destino es un público que no lee español. El usuario lo marcó explícitamente como proyecto aparte, fuera de este plan.
- **Extender el catálogo a comportamientos**, para que una Preferencia adoptada pueda traerse la Regla de Conducta que la refuerza. Hoy el catálogo solo publica Preferencias, y la dependencia entre una Preferencia y su Regla no está declarada como dato: vive en el texto del Contenido. Medido el 04/08/2026, declararla cuesta cuatro `.md` y ningún `.js` —los dos consumidores del registro de Conducta resuelven las columnas por nombre en cada corrida, y tres controles distintos avisan si el cambio queda a medias—, pero el mecanismo de adopción de reglas es el trabajo real.

## Criterios de cierre

- Una instalación pública limpia contiene solo mecanismo neutral y pasa todos los controles.
- Una preferencia personal con detalle se lleva de un Agente Desplegado a otro, reasigna Código, conserva contenido y da `ya estaba` en la segunda corrida.
- El coordinador de la copia no contiene nombres de columnas ni lógica propia de Preferencias: obtiene el resultado llamando a la operación dueña del subsistema.
- Un equivalente divergente se informa y no se pisa.
- Las cinco habilidades que hoy ignoran Índices locales leen todos los declarados y tienen prueba de regresión.
- Una regla con Momento propio se registra en `MOMENTOS-LOCAL.md` y sobrevive a una nivelación.
- El control de habilidades detecta al menos una referencia rota, un nombre retirado y una habilidad sin reconciliación.
- No queda un plan `Nuevo` cuyo propio documento declare terminado el trabajo; los planes absorbidos por este paraguas tienen transición explícita.
- El Índice de decisiones vuelve a ser una vista breve y las decisiones modificadas dejan una sola versión vigente por tema.
- El modo estricto del control de cierre falla ante un defecto sembrado.
- La medición de contexto incluye arranque e inyección dinámica; la decisión de conservar o reducir recordatorios se toma con una prueba conductual.
- README, manual, manifiestos, marketplace y habilidades coinciden en cantidad de plugins, nombres y flujo de instalación.

## Fuera de alcance inicial

- Publicar efectivamente una versión nueva del marketplace.
- Traducir el proyecto al inglés.
- Sincronizar automáticamente todos los Agentes Desplegados cada vez que cambie una preferencia personal.
- Copiar decisiones o planes entre repos por defecto.
- Agregar un tercer origen a todos los Índices antes de que un caso real lo exija.
- Fusionar instalación del Producto y copia de Aprendizaje en un solo mecanismo.
