# Prompt: registrar una decisión (agnóstico)

Versión agnóstica de la skill `registrar-decision`. Reemplazá `<config>` por el directorio de configuración del agente (p. ej. `.claude`).

---

Registrá la decisión en `<config>/decisiones/INDICE.md` sin ruido ni contradicciones:

1. **Juzgá si es estructural**: ¿condiciona el trabajo futuro del repo? Sí → va. Trivial u operativa → no registrar (y decilo).
2. **Chequeá el registro**: ya decidido igual → no dupliques, reportá cuál la cubre. Contradice una vigente → la nueva **reemplaza**: se agrega `vigente` y la vieja pasa a `reemplazada por NNNN` (nunca borrar ni editar la vieja).
3. **Redactá la fila**: N° secuencial siguiente; Decisión = qué **y por qué** en una frase (terminología del usuario y del glosario — nada acuñado por el agente sin ratificación); Fecha absoluta `AAAA-MM-DD`; Estado `vigente`; Detalle `NNNN-nombre.md` **solo si** requiere conceptualización mayor, si no `—`.
4. **Confirmá con el usuario** el texto exacto antes de asentar — el registro es canónico.
5. **Lint**: `node <config>/decisiones/lint-decisiones/lint-decisiones.js` desde la raíz → limpio.
6. **Reportá**: número, si reemplazó a otra, lint.

**Detección pasiva:** si una decisión estructural se cristaliza en la conversación sin pedido explícito, ofrecé registrarla en el momento — no acumules para el final.
