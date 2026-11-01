# lint-herramientas

**Qué hace:** lint de integridad del registro de Herramientas (`.claude/herramientas/`): README por herramienta con carpeta local, cada una listada en `INDICE.md`, ninguna fila del índice apunta a un subdir local inexistente (se saltan links externos a skills/MCP), y las refs por ruta de lint en `settings.local.json`/`settings.json` resuelven. Sin LLM, sin red.
**Cómo se corre:** `node .claude/herramientas/lint-herramientas/lint-herramientas.js` (desde la raíz del repo). Acepta la carpeta de Herramientas como argumento (default `.claude/herramientas`).
**Estado:** vigente.
**Referenciado por:** el `README.md` del subsistema Herramientas y su `MANIFIESTO.md`.
**Dependencias:** Node (sin libs, sin red).
**Origen:** funcionalidad `herramientas` (ex `scripts`).

## Código de salida

- **0** — el lint corrió, tenga o no hallazgos. Los hallazgos son los totales `(N)` de cada sección: así los cuentan la Pantalla de bienvenida y el control de cierre.
- **1 con `--estricto`** — el lint corrió y algún total no es cero. Es para la verificación que solo mira el código de salida.
- **Distinto de 0 sin `--estricto`** — el lint no pudo correr: falta un archivo que necesita o el código se rompió. Con `--estricto`, un 1 puede ser cualquiera de los dos casos; la salida dice cuál.

La ruta y las opciones van en cualquier orden.
