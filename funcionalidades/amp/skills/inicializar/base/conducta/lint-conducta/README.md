# lint-conducta

**Qué hace:** lint del subsistema `conducta` — valida el registro de reglas (`INDICE.md`) contra el vocabulario de momentos (`MOMENTOS.md`): que toda regla apunte a un momento existente, que la clase (`inyectar`/`correr`/`bloquear`) y el estado (`vigente`/`pendiente`/`obsoleto`) sean válidos, que ninguna regla `inyectar` quede sin `Contenido`, y —honestidad— que ninguna regla `vigente` cuelgue de un momento sin repartidor (disponibilidad `declarado`). Sin LLM, sin red. Autocontenido: solo lee archivos del propio subsistema.
**Cómo se corre:** `node .claude/conducta/lint-conducta/lint-conducta.js` (desde la raíz del repo). Flags: `--quiet` (solo imprime si hay hallazgos). Acepta una ruta a la carpeta de conducta como primer argumento (default `.claude/conducta`).
**Estado:** vigente.
**Referenciado por:** nadie automático — se corre a mano al cerrar tareas que tocaron `conducta`. (El hook que sí vive en el subsistema es el repartidor `establecer-conducta`, que es otra cosa: entrega reglas, no valida el registro.)
**Dependencias:** Node.js (sin libs externas).
**Origen (opcional):** funcionalidad `conducta` del harness — es infra del Patrón del subsistema (co-ubicada, como todo lint), **no** una Herramienta, así que no se registra en `herramientas/INDICE.md`.
