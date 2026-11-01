# lint-decisiones

**Qué hace:** lint de integridad del registro de decisiones (`.claude/decisiones/`): numeración sin huecos ni duplicados, links de detalle que resuelven, páginas `NNNN-nombre.md` sin huérfanos, y refs `reemplazada por NNNN` que apuntan a una decisión existente. Sin LLM, sin red.
**Cómo se corre:** `node .claude/decisiones/lint-decisiones/lint-decisiones.js` (desde la raíz del repo). Acepta una carpeta como argumento (default `.claude/decisiones`).
**Estado:** vigente.
**Referenciado por:** la memoria `feedback_decisiones.md` y la sección "Decisiones del proyecto" de `CLAUDE.md` (por texto, no por regla de permiso).
**Dependencias:** Node (sin libs, sin red).
**Origen:** funcionalidad `decisiones`.

## Código de salida

- **0** — el lint corrió, tenga o no hallazgos. Los hallazgos son los totales `(N)` de cada sección: así los cuentan la Pantalla de bienvenida y el control de cierre.
- **1 con `--estricto`** — el lint corrió y algún total no es cero. Es para la verificación que solo mira el código de salida.
- **Distinto de 0 sin `--estricto`** — el lint no pudo correr: falta un archivo que necesita o el código se rompió. Con `--estricto`, un 1 puede ser cualquiera de los dos casos; la salida dice cuál.

La ruta y las opciones van en cualquier orden.
