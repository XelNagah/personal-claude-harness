# lint-memoria

**Qué hace:** lint de integridad de la memoria local (`.claude/memoria/`): refs `.md` rotas y wikilinks `[[name]]` sin memoria, índice `MEMORIA.md` incompleto (memorias no listadas), huérfanos, y frontmatter inválido (`name`/`description`/`metadata.type` ∈ `user`·`feedback`·`project`·`reference`). Sin LLM, sin red.
**Cómo se corre:** `node .claude/scripts/lint-memoria/lint-memoria.js` (desde la raíz del repo). Acepta una carpeta como argumento (default `.claude/memoria`).
**Estado:** vigente.
**Referenciado por:** la sección "Memoria del proyecto" de `CLAUDE.md` (por texto, no por regla de permiso).
**Dependencias:** Node (sin libs, sin red).
**Origen:** funcionalidad `memoria-local`.
