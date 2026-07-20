---
name: registrar-decision
description: Registra una decisión estructural en .claude/decisiones/ — juzga si es estructural, chequea que no re-decida ni contradiga lo asentado, numera, redacta qué+por qué, detalle solo si es compleja, lint. Use when se toma una decisión que condiciona el repo a futuro ("asentá la decisión", "registrá esto"), o al detectar en la conversación una decisión que se está por perder.
---

# Registrar una decisión

Asienta una decisión en el registro (`.claude/decisiones/INDICE.md`) sin ruido ni contradicciones. Los dos riesgos que esta skill elimina: decisiones estructurales que se pierden en la conversación, y el opuesto — llenar el registro de trivialidades operativas.

## Flujo

1. **Juzgar si es estructural.** El criterio del registro: ¿define cómo es o qué hace el repo en lo esencial, o elige un camino que **condiciona el trabajo futuro**? Las operativas triviales o efímeras ("usé tal flag", "busqué X") **no van**. Ante la duda: ¿esto condiciona el repo a futuro? Sí → va. No → no registrar (y decirlo).
2. **Chequear contra lo asentado.** Leer el registro:
   - ¿Ya está decidido igual? → no duplicar; reportar cuál la cubre.
   - ¿Contradice una vigente? → no pisar: la decisión nueva **reemplaza** — se agrega con estado `vigente` y la vieja pasa a `reemplazada por NNNN`. Nunca se borra ni se edita la vieja.
3. **Redactar la fila:**
   - **N°** — siguiente secuencial (`0001`, `0002`, …); referencia estable.
   - **Decisión** — qué se decidió **y por qué**, en una frase para las simples. Terminología del glosario y del usuario — ningún término acuñado por el agente se asienta sin ratificación.
   - **Fecha** — `AAAA-MM-DD` (absoluta).
   - **Estado** — `vigente`.
   - **Detalle** — link a `NNNN-nombre.md` **solo si** requiere conceptualización mayor (contexto, alternativas evaluadas, consecuencias); `—` si es simple.
4. **Confirmar con el usuario** antes de asentar (el registro es canónico): mostrar la fila propuesta — texto exacto — y esperar el ok.
5. **Cerrar con el lint** desde la raíz del repo:

   ```bash
   node .claude/decisiones/lint-decisiones/lint-decisiones.js
   ```

6. **Reportar**: número asignado, si reemplazó a otra, y el resultado del lint.

## Detección pasiva

Si en cualquier sesión se cristaliza una decisión estructural sin que nadie diga "registrala" (se eligió una arquitectura, se fijó una convención, se descartó un camino por una razón de fondo) → **ofrecer** registrarla en el momento, no acumular para el final.
