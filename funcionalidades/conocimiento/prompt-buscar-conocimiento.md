# Prompt: buscar conocimiento (agnóstico)

Versión agnóstica de la skill `buscar-conocimiento`. Reemplazá `<config>` por el directorio de configuración del agente (p. ej. `.claude`).

---

Recorré el repo buscando saber que no esté asentado en la base de conocimiento y proponé páginas. **Nada se migra ni se crea sin el ok del usuario.**

1. **Cargá la base** (`<config>/conocimiento/INDICE.md` y sus páginas) para no proponer duplicados.
2. **Barré el repo**: `.md` sueltos fuera de la base, saber enterrado en código/configuración que costó descubrir, lo aprendido en esta sesión. Prueba de valor: ¿el agente lo tendría que volver a averiguar? → es conocimiento.
3. **Filtrá por naturaleza**: documentación del proyecto (README, registros — para humanos) se queda donde está; conocimiento de agente → candidato; correcciones/hechos del usuario → memoria, no acá.
4. **Proponé la lista**: título → fuente actual → qué aporta → mover o sintetizar.
5. **Asentá lo aprobado**: página en `<config>/conocimiento/` + línea-puntero en `INDICE.md`; si fue movimiento, sin duplicado en la fuente.
6. **Lint**: `node <config>/conocimiento/lint-conocimiento/lint-conocimiento.js` desde la raíz → limpio.
7. **Reportá**: creadas, rechazadas y por qué, lint.
