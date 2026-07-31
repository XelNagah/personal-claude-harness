# lint-semantica

**Qué hace:** lint de integridad del subsistema `semántica` (`.claude/semantica/`), que cubre los dos registros pares. Sobre `GLOSARIO.md`: links de detalle que resuelven, páginas `<nombre>.md` sin huérfanos, colisiones de alias y propuestos pendientes. Sobre `TERMINOLOGIA-FARLOPA.md`: contradicciones (un término alias/concepto en el glosario y vetado en la farlopa) y apariciones de los términos vetados en el texto vivo del repo (dos grupos: texto plano accionable / código informativo). El veto es sobre la relación término→significado: el lint **marca por término**, el agente **juzga el significado**. Sin LLM, sin red.
**Cómo se corre:** `node .claude/semantica/lint-semantica/lint-semantica.js` (desde la raíz del repo). Acepta una carpeta como argumento (default `.claude/semantica`).
**Estado:** vigente.
**Referenciado por:** la memoria `feedback_semantica.md` y el `MANIFIESTO.md` del subsistema (por texto, no por regla de permiso).
**Dependencias:** Node (sin libs, sin red).
**Origen:** funcionalidad `semantica`.
