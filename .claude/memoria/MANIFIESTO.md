# Memoria — manifiesto de subsistema

La memoria local vive en este directorio (`memoria/`), indexada por `MEMORIA.md`. **Cargar el índice al inicio de cada sesión y respetar lo que dice.** Cada memoria es un `.md` propio con frontmatter (`name`, `description`, `metadata.type` ∈ `user` | `feedback` | `project` | `reference`); el índice lleva solo punteros, nunca contenido. Antes de crear una memoria nueva, revisar si una existente ya cubre el hecho — actualizar en vez de duplicar. Fechas siempre absolutas.

**Índice: se carga siempre** (liviano — decisión 0017). Al cerrar una tarea que tocó la memoria, correr el lint desde la raíz del repo:

```bash
node .claude/memoria/lint-memoria/lint-memoria.js
```

Chequea refs/wikilinks rotos, `MEMORIA.md` incompleto, huérfanos y frontmatter inválido.

@MEMORIA.md
