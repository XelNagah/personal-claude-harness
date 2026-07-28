# Subsistemas — manifiesto de subsistema

Este directorio cataloga los subsistemas instalados del Agente Multipropósito. `SUBSISTEMAS.md` separa los que pertenecen a la Base de los que nacieron del Propósito y apunta a la casa de cada uno; no guarda el contenido de esos subsistemas.

**Disparador:** consultar el catálogo para descubrir qué casas existen y quién debe recibir una pieza de Aprendizaje. Escribir al agregar, retirar o cambiar de origen un subsistema.

**Skills:** `agregar-subsistema` (crea una casa nueva siguiendo el Patrón) y `reubicar-aprendizaje` (coordina con las habilidades dueñas el reparto guiado de piezas antiguas).

**Índice: se carga siempre** (liviano). Al cerrar una tarea que cambió el catálogo o sus casas, correr:

```bash
node .claude/subsistemas/lint-subsistemas/lint-subsistemas.js
```

@SUBSISTEMAS.md
