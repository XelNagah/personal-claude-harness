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
| Chequeo semántico | Detección de contradicciones, incompatibilidades, duplicación o staleness que requiere entender el significado (LLM). | — | — |
