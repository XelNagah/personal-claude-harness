---
name: buscar-conocimiento
description: Recorre el repo buscando saber que no está asentado en la base de conocimiento y propone páginas nuevas — distingue conocimiento de agente de documentación del proyecto y no migra nada sin el usuario. Use when el usuario dice "buscá conocimiento", "qué sabemos que no está asentado", "poblá la base", o al notar que la sesión re-descubre cosas que deberían estar escritas.
---

# Buscar conocimiento en el repo

La base de conocimiento (`.claude/conocimiento/`) solo sirve si captura lo que el agente sabe; el saber suele quedar disperso — en docs sueltos, en comentarios, en hallazgos de sesión que se pierden al cerrarla. Esta skill hace el barrido activo: encuentra el saber no asentado y lo propone.

## Flujo

1. **Cargar la base actual:** leer `.claude/conocimiento/MANIFIESTO.md`, todos los Índices que declare y sus páginas. Buscar en el Agente Multipropósito y en el Agente Desplegado para no proponer duplicados ni contradecir conocimiento ya asentado.
2. **Recorrer el repo buscando saber no asentado — delegado en el subagente `buscador-de-conocimiento`.** El recorrido abre el repo entero para quedarse con un puñado de candidatos: hacerlo en el hilo principal deja ahí todo lo que leyó, cuando lo único que hace falta es la lista con su evidencia. Devuelve cada candidato con su archivo y su línea, ya clasificado por naturaleza y con lo descartado aparte. Es de solo lectura por construcción: trae candidatos, no páginas.

   **Si el agente no puede delegar** (no tiene subagentes, o el tipo no está instalado), el recorrido se hace en el hilo principal con el mismo criterio y el mismo resultado — lo que cambia es el costo, no el flujo.

   Fuentes típicas:
   - documentos `.md` sueltos fuera de la base (carpetas de documentación, notas, análisis viejos);
   - saber enterrado en código o configuración que costó descubrir (convenciones no obvias, trampas, decisiones implícitas);
   - lo aprendido en la sesión actual que habría que volver a averiguar la próxima.
   La prueba de valor: **¿el agente lo necesitaría volver a averiguar?** Si sí, es conocimiento.
3. **Filtrar por naturaleza** (no todo `.md` es conocimiento de agente):
   - **Documentación para personas** (README, registros, manuales) → se queda donde está; no se traslada completa a la base.
   - **Conocimiento de agente** → hecho o procedimiento verificado que hará falta otra vez; puede ser específico del proyecto. Es candidato a página aunque su fuente sea documentación humana, pero se sintetiza para el uso del agente.
   - **Preferencias** (correcciones recurrentes sobre cómo trabajar) → van a Preferencias, no acá.
4. **Proponer al usuario** la lista de candidatos: título propuesto → fuente (dónde está hoy) → qué aporta → si es **mover** (el original queda obsoleto) o **sintetizar** (el original sigue siendo doc del proyecto). Nada se migra ni se crea sin su ok.
5. **Asentar lo aprobado:** crear cada página en `.claude/conocimiento/`, indexarla en el Índice con `origen: agente-desplegado` (una línea-puntero por página), y si fue un movimiento, dejar la fuente vieja sin duplicado. Nunca modificar el Índice o una página del Agente Multipropósito desde este flujo; una corrección de la Base se propone para su fuente pública.
6. **Cerrar con el lint** desde la raíz del repo:

   ```bash
   node .claude/conocimiento/lint-conocimiento/lint-conocimiento.js
   ```

7. **Reportar**: páginas creadas, candidatos rechazados y por qué, y el resultado del lint.

## Reconciliación

Cada corrida vuelve a cargar todos los Índices y filtra lo ya cubierto antes de proponer. Un candidato aprobado que ya fue asentado se reporta `ya estaba`; uno del mismo tema con contenido incompatible se reporta `divergente` y no se pisa.
