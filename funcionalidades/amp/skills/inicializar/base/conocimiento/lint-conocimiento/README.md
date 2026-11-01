# lint-conocimiento

**Qué hace:** lint de integridad de la base de conocimiento (`.claude/conocimiento/`): refs `.md` rotas, índice incompleto (páginas no listadas) y huérfanos (páginas que nada referencia). Sin LLM, sin red.
**Cómo se corre:** `node .claude/conocimiento/lint-conocimiento/lint-conocimiento.js` (desde la raíz del repo). Acepta una carpeta como argumento (default `.claude/conocimiento`).
**Estado:** vigente.
**Referenciado por:** la memoria `feedback_base_conocimiento.md` y la sección "Base de conocimiento del proyecto" de `CLAUDE.md` (por texto, no por regla de permiso).
**Dependencias:** Node (sin libs, sin red).
**Origen:** funcionalidad `conocimiento`.

## Código de salida

- **0** — el lint corrió, tenga o no hallazgos. Los hallazgos son los totales `(N)` de cada sección: así los cuentan la Pantalla de bienvenida y el control de cierre.
- **1 con `--estricto`** — el lint corrió y algún total no es cero. Es para la verificación que solo mira el código de salida.
- **Distinto de 0 sin `--estricto`** — el lint no pudo correr: falta un archivo que necesita o el código se rompió. Con `--estricto`, un 1 puede ser cualquiera de los dos casos; la salida dice cuál.

La ruta y las opciones van en cualquier orden.
