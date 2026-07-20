# Glosario del proyecto

Terminología del dominio de este repo. Una fila por concepto en la tabla de abajo:

- **Concepto** — nombre canónico.
- **Definición** — una o dos frases: qué ES el concepto (no qué hace).
- **Alias** — otras formas de llamarlo, todas válidas, **registradas para mapear (no se prohíben)**; separadas por coma. `—` si no hay.
- **Detalle** — link a una página propia `<slug>.md` **solo si el concepto es complejo** (fórmulas, ejemplos, contraejemplos). `—` si es simple.

Solo términos **propios del dominio** (no conceptos generales de programación). Consultar al planificar y analizar. Ejemplo completo en el README de la funcionalidad `glosario`.

**Toda entrada nueva pasa por el usuario:** el agente puede *proponer* términos (marcados como propuestos), pero no se asientan como canónicos sin ratificación. Preferir las palabras del usuario a acuñar nuevas.

| Concepto | Definición | Alias | Detalle |
|----------|------------|-------|---------|
| Propósito | Objetivo de dominio que el usuario define para el repo; los subsistemas se llenan con lo aprendido para lograrlo. | — | — |
| Multipropósito | El mismo harness sirve a cualquier propósito con el mismo setup (contable, análisis, código…): el usuario lo define y los subsistemas se llenan hacia él. | — | — |
| Subsistema | Área del harness que persiste estado siguiendo el patrón índice + entradas + lint (memoria, conocimiento, glosario, decisiones, planes, herramientas). | subsistema de acumulación | — |
| Herramienta | Capacidad que el repo se fabricó para su Propósito y el agente invoca para tareas repetibles. Tipos: script, skill local del repo, MCP local. **No** incluye los lints (esos son infra del Patrón de cada subsistema, decisión 0003). | Tool | — |
| Entrada | Elemento de un índice (fila o línea). Puede ser autocontenida o referenciar un documento o una carpeta. | Entry | — |
| Documento | El `.md` que una entrada referencia (opcional en glosario/decisiones, siempre en memoria/planes). | Document | — |
| Carpeta | Referencia de una entrada que es un directorio con su propio índice → recursión del patrón. | Folder, directorio | — |
| Lint mecánico | Chequeo de integridad estructural sin LLM: refs rotas, huérfanos, índice incompleto, colisiones de alias. | lint | — |
| Nivelar | Re-correr la instalación sobre un repo que ya tiene partes del setup para llevarlo al día: crear solo lo ausente, respetar lo divergente. | poner al día | — |
| Textual | Copia que debe mantenerse idéntica carácter a carácter entre la fuente y sus duplicados (los textos de funcionalidades embebidos en el orquestador). | literal, carácter a carácter | — |
| Control | Chequeo que frena el avance si no se cumple (ratificación del usuario antes de asentar un término, verificación completa antes de cerrar un plan). | — | — |
| Harness | El setup estándar multipropósito que este repo autora y distribuye: los subsistemas, sus funcionalidades/plugins y el marketplace. | setup estándar | — |
| Skill | Flujo empaquetado que el agente invoca por nombre (artefacto de Claude Code, `SKILL.md`); uno de los tipos de Herramienta. | habilidad | — |
| Skill de Subsistema | Skill operativa que trabaja sobre un subsistema concreto; viaja en el plugin de la funcionalidad de ese subsistema. | — | — |
| Skill del Agente Multipropósito | Skill transversal sin subsistema dueño (hoy: `planificar`); se empaqueta como funcionalidad propia. | — | — |
| Texto plano | Texto corriente en lenguaje natural dentro de los `.md`, por oposición a código (cercas, backticks, identificadores, rutas y nombres de archivo). | — | — |
| Chequeo semántico | Detección de contradicciones, incompatibilidades, duplicación o staleness que requiere entender el significado (LLM). | — | — |
