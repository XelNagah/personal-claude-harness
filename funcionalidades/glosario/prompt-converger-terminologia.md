# Prompt: converger la terminología (agnóstico)

Versión agnóstica de la skill `converger-terminologia`. Reemplazá `<config>` por el directorio de configuración del agente (p. ej. `.claude`).

---

Recorré el repo contra el glosario y proponé la convergencia terminológica. **Regla dura: vos proponés; ratificar, vetar o reescribir es del usuario** — nada se asienta sin su ok.

1. **Cargá el glosario** (`<config>/glosario/INDICE.md`): canónicos, definiciones, alias (y vetados si el repo los tiene).
2. **Barré el repo** buscando: términos que compiten con un canónico (sinónimos no registrados, anglicismos, variantes), términos de dominio frecuentes que faltan en el glosario, y vetados que sigan apareciendo.
3. **Separá en dos baldes**: **texto plano** (párrafos/listas de los `.md` — se puede reescribir) y **código** (fences, backticks, identificadores, rutas, nombres de archivo — refactor: solo se informa, nunca se toca automáticamente). Autoexcluí el propio glosario y el histórico congelado (planes cerrados).
4. **Presentá la tabla**: término hallado → concepto al que compite (o "concepto nuevo") → dónde y cuántas veces → propuesta recomendada (ratificar como alias / vetar y reemplazar por el canónico / asentar concepto nuevo).
5. **Aplicá solo lo ratificado**: glosario actualizado + reescritura del texto plano aprobado. El balde de código queda como lista informativa.
6. **Cerrá con el lint**: `node <config>/glosario/lint-glosario/lint-glosario.js` desde la raíz → limpio.
7. **Reportá**: ratificados/vetados/nuevos, texto plano reescrito, balde de código pendiente.
