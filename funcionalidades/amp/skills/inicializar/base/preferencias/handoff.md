# Handoff

La regla: al cerrar la sesión, al cortar porque el contexto se llenó, o cuando el usuario lo pida, escribir un handoff en `.claude/tmp/` con nombre variable (`handoff-<tema>.md`), con las secciones en orden y un texto para copiar al final.

**Por qué el nombre nunca es fijo:** en una misma tanda pueden hacer falta varios handoffs, y con un nombre fijo el que se pisa es siempre el que servía. El nombre tiene que decir de qué es.

**Por qué la ruta va en el texto para copiar:** un handoff cuya ubicación el que lo tiene que leer no conoce no sirve de nada. El texto corto que se le pasa al agente siguiente lleva la ruta completa del archivo adentro.
