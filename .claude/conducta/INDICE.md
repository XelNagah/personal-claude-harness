---
indice: Reglas de conducta
origen: agente-multiproposito
columnas: [Código, Nombre, Descripción, Momento, Clase, Contenido, Estado, Detalle]
descripcion: qué asegura la regla, en una línea
---

# Reglas de conducta

Registro de las **reglas de conducta** del repo: cada fila ata un **momento** (del vocabulario en `MOMENTOS.md`) a una **acción** de una **clase** (del vocabulario en `CLASES.md`), para asegurar "cuando hagas X, asegurate de Y". El hook repartidor `establecer-conducta/` lee este registro **vivo** en cada momento y entrega la regla que corresponde — agregar o cambiar una regla **no toca la config del hook**. Una fila por regla.

- **Código** — `Base-NNNN` o `Local-NNNN` según el origen. Se asigna al crear la entrada y no se reusa.
- **Nombre** — qué asegura, en una frase con verbo.
- **Descripción** — para qué existe la regla, en una línea. No es el texto que se entrega: eso es el `Contenido`.
- **Momento** — a qué momento se ata; tiene que existir en `MOMENTOS.md`.
- **Clase** — `Inyectar` (el agente lee un texto y actúa con su juicio) · `Ejecutar` (una Herramienta lo resuelve sin juicio) · `Bloquear` (se frena la acción; solo donde Y es sin juicio y el falso positivo es imposible). Definidas en `CLASES.md`.
- **Contenido** — el dato que el hook consume: el texto a inyectar (`Inyectar`) o la ruta del programa a correr (`Ejecutar`, `Bloquear`).
- **Estado** — `vigente` (se entrega) · `pendiente` (declarada, su momento aún no tiene repartidor) · `obsoleto` (no se entrega; se puede depurar).
- **Detalle** — `—`, o la página donde se conceptualiza la regla.

> **Origen del contenido:** las reglas se separan por origen en **dos archivos**, y cada uno lo declara en su frontmatter — este (`origen: agente-multiproposito`, las manda el Agente Multipropósito; el nivelador `amp:actualizar` lo reemplaza entero al poner al día un Agente con Propósito) e [`INDICE-LOCAL.md`](INDICE-LOCAL.md) (`origen: agente-desplegado`, las suma cada repo; el nivelador no lo abre). El repartidor lee los dos. Hoy tienen repartidor los momentos `al arrancar la sesión` (`SessionStart`, clase `Ejecutar`), `cada turno` (`UserPromptSubmit`) y `al escribir` (`PreToolUse`); la regla de momento `al cerrar tarea` (`Stop`) queda en `pendiente` (honesta, sin entregar) hasta que se sume su repartidor.

## Reglas del Agente Multipropósito

Las que instala el Agente Multipropósito. El nivelador `amp:actualizar` reemplaza **este archivo entero** al poner al día un Agente con Propósito; nunca abre el del Agente Desplegado.

| Código | Nombre | Descripción | Momento | Clase | Contenido | Estado | Detalle |
|--------|--------|-------------|---------|-------|-----------|--------|---------|
| Base-0001 | Mostrar la Pantalla de bienvenida al arrancar | Le da al usuario el estado del repo apenas abre la sesión: Título, Propósito, métricas de cada subsistema y estado de lint | al arrancar la sesión | Ejecutar | conducta/mostrar-pantalla-bienvenida/mostrar-pantalla-bienvenida.js --hook | vigente | — |
| Base-0002 | Respetar las preferencias cargadas | Recuerda que las preferencias ya están en contexto, y nombra las tres que más se incumplen | cada turno | Inyectar | Antes de responder, respetá las preferencias ya cargadas (PREFERENCIAS.md): en particular fechas en formato argentino al conversar, ejemplos del dominio del repo (nunca deportivos) y temporales en `.claude/tmp/`. | vigente | — |
| Base-0003 | No acuñar terminología del dominio | Frena la deriva terminológica antes de que se escriba, con el test que decide si una palabra de origen inglés pasa o se traduce | cada turno | Inyectar | No acuñes términos del dominio (usá el glosario, proponé en Propuestos, nunca uses vetados). Antes de una palabra de origen inglés, aplicá el test: ¿la diría tal cual un desarrollador hispanohablante en una charla en español (`commit`, `deploy`, `parsear`, `hardcodear`, `bug`) o es una metáfora o modismo del inglés (`churn`, `wedge`, `dogfooding`, `staleness`, `feasibility`)? Lo segundo → traducilo, le resulta raro al usuario. Ante la duda, traducí. | vigente | — |
| Base-0004 | Preguntar antes de redefinir o remover algo canónico | Reserva al usuario la potestad de ratificar, vetar y redefinir; el agente solo propone | cada turno | Inyectar | Antes de **remover, renombrar o redefinir** algo canónico (una definición del glosario, una decisión) o con dependientes: proponé y esperá la ratificación del usuario. El agente propone; ratificar, vetar y redefinir son potestad del usuario. Aplica también a **definiciones y remociones**, no solo al alta de un término. | vigente | — |
| Base-0005 | Contrastar contra la sabiduría del repo al escribir | Confronta el `.md` recién escrito con el test de demarcación, lo ya asentado y la terminología | al escribir | Inyectar | Acabás de escribir un `.md`. Si es de `.claude/`, contrastalo contra el test de demarcación (¿va en este subsistema?); si es de lo que el repo publica, acordate de que ese texto lo hereda quien lo instale. En los dos casos: ¿contradice algo asentado?, ¿usaste un término vetado o inventado? Corregí si hace falta. | vigente | — |
| Base-0006 | Frenar la terminología vetada antes de que se escriba | Rechaza la escritura que usa un término sin uso legítimo posible, e informa los que dependen del significado | al escribir | Bloquear | conducta/detectar-terminologia-vetada/detectar-terminologia-vetada.js | vigente | — |
| Base-0007 | Mantener el archivo de estado antes de informar | Evita que una tarea exploratoria pierda lo medido entre una corrida y la siguiente | cada turno | Inyectar | Si la tarea es exploratoria y tiene varias variables, actualizá su único archivo de estado antes de informar un resultado; al retomar, leelo primero. | vigente | — |
| Base-0008 | Aplicar el estilo de commits antes de confirmar | Lleva la convención al momento en que se redacta el mensaje, no al de leerla | al crear un commit | Inyectar | Antes de crear un commit o redactar una descripción de PR, leé `preferencias/estilo-commits.md` y verificá el texto contra esas reglas. | pendiente | — |
| Base-0009 | Registrar en el subsistema cuando algo cambia | Cierra la tarea derivando a su subsistema lo que otro debe saber | al cerrar tarea | Inyectar | Si en esta tarea cambió algo que otro subsistema debe saber (decisión, conocimiento, semántica, herramientas, conducta o catálogo de subsistemas), registralo antes de cerrar. | pendiente | — |
