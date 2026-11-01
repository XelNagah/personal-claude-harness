# lint-semantica

**Qué hace:** lint de integridad del subsistema `semántica` (`.claude/semantica/`), que cubre los dos registros pares. Sobre `GLOSARIO.md`: links de detalle que resuelven, páginas `<nombre>.md` sin huérfanos, colisiones de alias y propuestos pendientes. Sobre `TERMINOLOGIA-FARLOPA.md`: contradicciones (un término alias/concepto en el glosario y vetado en la farlopa) y apariciones de los términos vetados en el texto vivo del repo (dos grupos: texto plano accionable / código informativo). El veto es sobre la relación término→significado: el lint **marca por término**, el agente **juzga el significado**. Sin LLM, sin red.
**Cómo se corre:** `node .claude/semantica/lint-semantica/lint-semantica.js` (desde la raíz del repo). Acepta una carpeta como argumento (default `.claude/semantica`).
**Estado:** vigente.
**Referenciado por:** la memoria `feedback_semantica.md` y el `MANIFIESTO.md` del subsistema (por texto, no por regla de permiso).
**Dependencias:** Node (sin libs, sin red).
**Origen:** funcionalidad `semantica`.

## Código de salida

- **0** — el lint corrió, tenga o no hallazgos. Los hallazgos son los totales `(N)` de cada sección: así los cuentan la Pantalla de bienvenida y el control de cierre.
- **1 con `--estricto`** — el lint corrió y algún total no es cero. Es para la verificación que solo mira el código de salida.
- **Distinto de 0 sin `--estricto`** — el lint no pudo correr: falta un archivo que necesita o el código se rompió. Con `--estricto`, un 1 puede ser cualquiera de los dos casos; la salida dice cuál.

La ruta y las opciones van en cualquier orden.
