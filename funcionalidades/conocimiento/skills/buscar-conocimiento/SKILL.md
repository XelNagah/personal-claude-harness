---
name: buscar-conocimiento
description: Recorre el repo buscando saber que no está asentado en la base de conocimiento y propone páginas nuevas — distingue conocimiento de agente de documentación del proyecto y no migra nada sin el usuario. Use when el usuario dice "buscá conocimiento", "qué sabemos que no está asentado", "poblá la base", o al notar que la sesión re-descubre cosas que deberían estar escritas.
---

# Buscar conocimiento en el repo

La base de conocimiento (`.claude/conocimiento/`) solo sirve si captura lo que el agente sabe; el saber suele quedar disperso — en docs sueltos, en comentarios, en hallazgos de sesión que se pierden al cerrarla. Esta skill hace el barrido activo: encuentra el saber no asentado y lo propone.

## Flujo

1. **Cargar la base actual** (`.claude/conocimiento/INDICE.md` y sus páginas): qué ya está cubierto, para no proponer duplicados.
2. **Recorrer el repo buscando saber no asentado.** Fuentes típicas:
   - documentos `.md` sueltos fuera de la base (carpetas de docs, notas, análisis viejos);
   - saber enterrado en código o configuración que costó descubrir (convenciones no obvias, gotchas, decisiones implícitas);
   - lo aprendido en la sesión actual que habría que re-descubrir la próxima.
   La prueba de valor: **¿el agente lo necesitaría volver a averiguar?** Si sí, es conocimiento.
3. **Filtrar por naturaleza** (no todo `.md` es conocimiento de agente):
   - **Documentación del proyecto** (README, registros, docs para humanos) → se queda donde está; no se lista en la base.
   - **Conocimiento de agente** → candidato a página.
   - **Memorias** (correcciones, preferencias, hechos del usuario) → van al subsistema de memoria, no acá.
4. **Proponer al usuario** la lista de candidatos: título propuesto → fuente (dónde está hoy) → qué aporta → si es **mover** (el original queda obsoleto) o **sintetizar** (el original sigue siendo doc del proyecto). Nada se migra ni se crea sin su ok.
5. **Asentar lo aprobado:** crear cada página en `.claude/conocimiento/`, indexarla en `INDICE.md` (una línea-puntero por página), y si fue un movimiento, dejar la fuente vieja sin duplicado.
6. **Cerrar con el lint** desde la raíz del repo:

   ```bash
   node .claude/conocimiento/lint-conocimiento/lint-conocimiento.js
   ```

7. **Reportar**: páginas creadas, candidatos rechazados y por qué, y el resultado del lint.
