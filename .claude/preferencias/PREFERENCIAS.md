---
indice: Preferencias
origen: agente-multiproposito
---

# Preferencias

Reglas de conducta del agente en este repo. Siempre en contexto (importado desde AGENTS.md). Las preferencias se separan por origen en **dos archivos**, y cada uno lo declara en su frontmatter: este (`origen: agente-multiproposito`) viene del Agente Multipropósito y se actualiza al nivelar, que lo reemplaza entero — no editarlo acá; los ajustes de este repo van en [`PREFERENCIAS-LOCAL.md`](PREFERENCIAS-LOCAL.md) (`origen: agente-desplegado`), que el nivelado nunca abre.

## Preferencias del Agente Multipropósito

**Comunicación:**

- Al preguntar por una decisión o analizar alternativas, dar SIEMPRE ejemplos concretos de cada postura (numéricos si aplica): cómo es ahora vs. cómo quedaría y por qué, encadenando consecuencias ("A ⇒ B; si no fuera B ⇒ no A porque X"). Objetivo: ubicar inmediatamente al lector en la mecánica relevante sin que tenga que reconstruir contexto.
- Al pedir una decisión al usuario, **el contexto va en el texto de la respuesta**, nunca comprimido dentro de las opciones de una pregunta. Y **de a una decisión por vez**, aunque sean independientes entre sí. Única excepción: una cola de confirmaciones donde la respuesta esperada es "sí" a todas puede ir junta, con la recomendada visible.
- Antes de escribir en un **registro canónico** (glosario, decisiones, preferencias, Terminología Farlopa), mostrar el **texto exacto** que se va a asentar y esperar el visto bueno. Un "sí" a *"¿lo registro?"* aprueba la **acción** de registrar, nunca el **contenido**: lo que el usuario no leyó, no lo ratificó.
- Ante un informe o visualización de **formato nuevo**: mostrar primero el esqueleto con datos de juguete marcados como DUMMY, acordar la representación, recién después calcular en serio. **Nunca re-producir completo un formato rechazado**: volver al esqueleto y realinear.
- Tareas en background: esperar la notificación de finalización; no reportar ni consultar estado a cada rato — solo ante sospecha de cuelgue.

**Principios de trabajo:**

- Conceptual antes que implementación. Ante ambigüedad de diseño, preguntar antes de asumir. Minimizar cambios sustractivos.
- Iterar de alto a bajo nivel: interfaces y contratos antes que implementación.
- Nomenclatura en español para el dominio; inglés solo para infraestructura técnica.
- Cero invención de datos: lo que no salga de una fuente verificada se marca como faltante o como interpretación propia.
- Terminología: no acuñar términos del dominio por cuenta propia; preferir las palabras del usuario. **Español corriente en todo**: nada de palabras inventadas o raras (aunque suenen técnicas), ni en texto plano ni en diagramas — no solo en los registros. **Control duro en registros canónicos** (glosario, decisiones): ningún término acuñado por el agente se asienta sin ratificación del usuario. En texto plano/diagramas se puede usar, marcado como propuesto.
- **La sigla nunca sola en lo que queda escrito.** En documentación, registros, comentarios y textos que viajan a otros repos, el nombre del dominio va **completo**. La sigla puede **acompañarlo** —`Agente Multipropósito (AMP)`— y conviene presentarla así en la primera mención, para que el lector la reconozca cuando la encuentre; lo que no se hace es usarla **en lugar** del nombre. En la conversación es libre. Que un alias esté registrado en el glosario dice qué significa ese término, **no** autoriza a sustituir el nombre por él en el texto escrito.
- **Commits y descripciones de PR:** escribirlos en español, sin coautoría ni atribución a la IA, con título `<Área>: <Resumen>` y cuerpo `Antes, … Ahora, …`. El área es funcional y el cuerpo describe el cambio observable. Convención completa en `estilo-commits.md`.
- **Tareas exploratorias con varias variables:** mantener un único archivo de estado desde la primera corrida y actualizarlo antes de informar cada resultado. Si responde a un plan, vive en su sección `## Estado`; si es independiente, en `conocimiento/<tema>/estado.md`. Convención completa en `archivo-de-estado.md`.
