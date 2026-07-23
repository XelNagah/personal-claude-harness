# Memoria — manifiesto de subsistema

La memoria local vive en este directorio (`memoria/`), indexada por `MEMORIA.md`: hechos que hay que recordar entre sesiones. Cada memoria es un `.md` propio con frontmatter (`name`, `description`, `metadata.type` ∈ `user` | `feedback` | `project` | `reference`); el índice lleva solo punteros, nunca contenido.

**Disparador:** consultar `MEMORIA.md` al inicio de cada sesión y respetarlo. Escribir cuando surge algo para recordar entre sesiones; antes de crear una, revisar si una existente ya cubre el hecho — actualizar en vez de duplicar. Fechas siempre absolutas.

**Skills:** `registrar-memoria` (asienta un hecho como memoria tipada, detecta duplicados, indexa y corre el lint); instalación con `inicializar-memoria-local`.

**Índice: se carga siempre** (liviano). Al cerrar una tarea que tocó la memoria, correr el lint desde la raíz del repo:

```bash
node .claude/memoria/lint-memoria/lint-memoria.js
```

Chequea refs/wikilinks rotos, `MEMORIA.md` incompleto, huérfanos y frontmatter inválido.

@MEMORIA.md
