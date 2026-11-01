# lint-preferencias

**Qué hace:** lint **estructural** de las preferencias (`.claude/preferencias/PREFERENCIAS.md`): que existan las secciones `## Preferencias del Agente Multipropósito` y `## Preferencias del Agente Desplegado` (acepta también los nombres viejos, `## Base` y `## Adaptaciones`, mientras haya Agentes Desplegados sin actualizar), que el archivo no esté vacío, y que `CLAUDE.md` lo importe con `@preferencias/PREFERENCIAS.md` (para que quede siempre en contexto). Sin LLM, sin red. **No** detecta contradicciones semánticas entre preferencias — eso es la capa semántica (a pedido).
**Cómo se corre:** `node .claude/preferencias/lint-preferencias/lint-preferencias.js` (desde la raíz del repo). Acepta la carpeta `.claude` como argumento (default `.claude`).
**Estado:** vigente.
**Referenciado por:** la sección "Preferencias del proyecto" de `CLAUDE.md` (por texto, no por regla de permiso).
**Dependencias:** Node (sin libs, sin red).
**Origen:** funcionalidad `preferencias-trabajo`.

## Código de salida

- **0** — el lint corrió, tenga o no hallazgos. Los hallazgos son los totales `(N)` de cada sección: así los cuentan la Pantalla de bienvenida y el control de cierre.
- **1 con `--estricto`** — el lint corrió y algún total no es cero. Es para la verificación que solo mira el código de salida.
- **Distinto de 0 sin `--estricto`** — el lint no pudo correr: falta un archivo que necesita o el código se rompió. Con `--estricto`, un 1 puede ser cualquiera de los dos casos; la salida dice cuál.

La ruta y las opciones van en cualquier orden.
