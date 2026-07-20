# Preferencias

Reglas de conducta del agente en este repo. Siempre en contexto (importado desde AGENTS.md). La sección **Base** viene del harness y se actualiza al nivelar (no editarla acá: los ajustes de este repo van en **Adaptaciones**, que el nivelado nunca toca).

## Base (harness v3)

**Comunicación:**

- Al preguntar por una decisión o analizar alternativas, dar SIEMPRE ejemplos concretos de cada postura (numéricos si aplica): cómo es ahora vs. cómo quedaría y por qué, encadenando consecuencias ("A ⇒ B; si no fuera B ⇒ no A porque X"). Objetivo: ubicar inmediatamente al lector en la mecánica relevante sin que tenga que reconstruir contexto.
- Ante un informe o visualización de **formato nuevo**: mostrar primero el esqueleto con datos de juguete marcados como DUMMY, acordar la representación, recién después calcular en serio. **Nunca re-producir completo un formato rechazado**: volver al esqueleto y realinear.
- Tareas en background: esperar la notificación de finalización; no reportar ni consultar estado a cada rato — solo ante sospecha de cuelgue.

**Principios de trabajo:**

- Conceptual antes que implementación. Ante ambigüedad de diseño, preguntar antes de asumir. Minimizar cambios sustractivos.
- Iterar de alto a bajo nivel: interfaces y contratos antes que implementación.
- Nomenclatura en español para el dominio; inglés solo para infraestructura técnica.
- Cero invención de datos: lo que no salga de una fuente verificada se marca como faltante o como interpretación propia.
- Terminología: no acuñar términos del dominio por cuenta propia; preferir las palabras del usuario. **Español corriente en todo**: nada de palabras inventadas o raras (aunque suenen técnicas), ni en texto plano ni en diagramas — no solo en los registros. **Control duro en registros canónicos** (glosario, decisiones): ningún término acuñado por el agente se asienta sin ratificación del usuario. En texto plano/diagramas se puede usar, marcado como propuesto.

## Adaptaciones de este repo

- Ejemplos y analogías: usar el dominio del repo o casos neutros. **Nada de analogías deportivas** (fútbol, jugadores, plantel). Si un ejemplo necesita un dominio inventado, preferir uno ya presente en el repo o un caso real ya decidido.
