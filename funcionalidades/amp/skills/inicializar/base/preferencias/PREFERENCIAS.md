---
indice: Preferencias
origen: agente-multiproposito
columnas: [Código, Nombre, Descripción, Detalle]
descripcion: la preferencia en sí — lo que hace falta saber para obedecerla
---

# Preferencias

Reglas de conducta del agente en este repo. Siempre en contexto (importado desde AGENTS.md). Una fila por preferencia.

- **Código** — `Base-NNNN`. Se asigna al crear la entrada y no se reusa.
- **Nombre** — qué pide la preferencia, en una frase con verbo. Único en el Índice.
- **Descripción** — la preferencia en sí: todo lo que hace falta para obedecerla.
- **Detalle** — `—`, o la página con su elaboración: ejemplos, motivos y casos ya discutidos. Lo que no hace falta para obedecer.

> **Origen del contenido:** las preferencias se separan por origen en dos archivos, y cada uno lo declara en su frontmatter — este (`origen: agente-multiproposito`, las manda el Agente Multipropósito; el nivelador lo reemplaza entero) y [`PREFERENCIAS-LOCAL.md`](PREFERENCIAS-LOCAL.md) (`origen: agente-desplegado`, las suma cada repo; el nivelador no lo abre).

## Preferencias del Agente Multipropósito

| Código | Nombre | Descripción | Detalle |
|--------|--------|-------------|---------|
| Base-0001 | Dar ejemplos concretos de cada postura | Al preguntar por una decisión o analizar alternativas, dar SIEMPRE ejemplos concretos de cada postura (numéricos si aplica): cómo es ahora vs. cómo quedaría y por qué, encadenando consecuencias ("A ⇒ B; si no fuera B ⇒ no A porque X"). Objetivo: ubicar inmediatamente al lector en la mecánica relevante sin que tenga que reconstruir contexto. | — |
| Base-0002 | Pedir una decisión por vez, con el contexto en la respuesta | Al pedir una decisión al usuario, **el contexto va en el texto de la respuesta**, nunca comprimido dentro de las opciones de una pregunta. Y **de a una decisión por vez**, aunque sean independientes entre sí. Única excepción: una cola de confirmaciones donde la respuesta esperada es "sí" a todas puede ir junta, con la recomendada visible. | — |
| Base-0003 | Mostrar el texto exacto antes de escribir en un registro canónico | Antes de escribir en un **registro canónico** (glosario, decisiones, preferencias, Terminología Farlopa), mostrar el **texto exacto** que se va a asentar y esperar el visto bueno. Un "sí" a *"¿lo registro?"* aprueba la **acción** de registrar, nunca el **contenido**: lo que el usuario no leyó, no lo ratificó. | — |
| Base-0004 | Acordar el formato con un esqueleto antes de calcular | Ante un informe o visualización de **formato nuevo**: mostrar primero el esqueleto con datos de prueba marcados como PROVISORIO, acordar la representación, recién después calcular en serio. **Nunca re-producir completo un formato rechazado**: volver al esqueleto y realinear. | — |
| Base-0005 | Esperar la notificación de las tareas en background | Esperar la notificación de finalización; no reportar ni consultar estado a cada rato — solo ante sospecha de cuelgue. | — |
| Base-0006 | Resolver lo conceptual antes que la implementación | Conceptual antes que implementación. Ante ambigüedad de diseño, preguntar antes de asumir. Minimizar cambios sustractivos. | — |
| Base-0007 | Iterar de alto a bajo nivel | Interfaces y contratos antes que implementación. | — |
| Base-0008 | Nombrar el dominio en español | Nomenclatura en español para el dominio; inglés solo para infraestructura técnica. | — |
| Base-0009 | No inventar datos | Lo que no salga de una fuente verificada se marca como faltante o como interpretación propia. | — |
| Base-0010 | No acuñar términos del dominio | No acuñar términos del dominio por cuenta propia; preferir las palabras del usuario. **Español corriente en todo**: nada de palabras inventadas o raras (aunque suenen técnicas), ni en texto plano ni en diagramas — no solo en los registros. **Control duro en registros canónicos** (glosario, decisiones): ningún término acuñado por el agente se asienta sin ratificación del usuario. En texto plano y diagramas se puede usar, marcado como propuesto. | — |
| Base-0011 | No usar la sigla sola en lo que queda escrito | En documentación, registros, comentarios y textos que viajan a otros repos, el nombre del dominio va **completo**. La sigla puede **acompañarlo** —`Agente Multipropósito (AMP)`— y conviene presentarla así en la primera mención, para que el lector la reconozca cuando la encuentre; lo que no se hace es usarla **en lugar** del nombre. En la conversación es libre. Que un alias esté registrado en el glosario dice qué significa ese término, **no** autoriza a sustituir el nombre por él en el texto escrito. | — |
| Base-0012 | Escribir los commits y las descripciones de PR en español | En español, sin coautoría ni atribución a la IA, con título `<Área>: <Resumen>` y cuerpo `Antes, … Ahora, …`. El área es funcional y el cuerpo describe el cambio observable. | [estilo-commits.md](estilo-commits.md) |
| Base-0013 | Mantener un archivo de estado en tareas exploratorias | En tareas exploratorias con varias variables, mantener un único archivo de estado desde la primera corrida y actualizarlo antes de informar cada resultado. Si responde a un plan, vive en su sección `## Estado`; si es independiente, en `conocimiento/<tema>/estado.md`. | [archivo-de-estado.md](archivo-de-estado.md) |
| Base-0014 | Dejar un handoff con nombre propio y el texto para pasárselo al que sigue | Al cerrar la sesión, al cortar porque el contexto se llenó, o cuando el usuario lo pida, escribir un handoff en `.claude/tmp/` con un nombre que diga **de qué es** (`handoff-<tema>.md`); nunca un nombre fijo, porque en una misma tanda pueden hacer falta varios y el que se pisa es siempre el que servía. Lleva, en este orden: qué hacer primero al arrancar, cómo verificar el estado del repo (con los comandos), qué quedó pendiente y en qué plan vive, y las trampas ya pagadas. **Y al terminar, dar en la respuesta un texto corto listo para copiar y pegarle al agente siguiente, con la ruta completa del archivo adentro**: un handoff que el que tiene que leerlo no sabe dónde está no sirve de nada. | — |
