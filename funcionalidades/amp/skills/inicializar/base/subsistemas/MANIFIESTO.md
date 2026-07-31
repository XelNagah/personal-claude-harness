# Subsistemas — manifiesto de subsistema

Este directorio cataloga los subsistemas instalados del Agente Multipropósito y apunta a la casa de cada uno; no guarda el contenido de esos subsistemas. Un archivo por origen: los que pertenecen a la Base y los que nacieron del Propósito.

**Disparador:** consultar el catálogo para descubrir qué casas existen y quién debe recibir un Componente de Subsistema de Aprendizaje. Escribir al agregar, retirar o cambiar de origen un subsistema.

**Skills:** `agregar-subsistema` (crea una casa nueva siguiendo el Patrón) y `reubicar-aprendizaje` (coordina con las habilidades dueñas el reparto guiado de los Componentes de Subsistema antiguos).

**Índices:** `SUBSISTEMAS.md` (Agente Multipropósito) · `SUBSISTEMAS-LOCAL.md` (Agente Desplegado). **Se cargan siempre** (livianos). Al cerrar una tarea que cambió el catálogo o sus casas, correr:

```bash
node .claude/subsistemas/lint-subsistemas/lint-subsistemas.js
```

@SUBSISTEMAS.md
@SUBSISTEMAS-LOCAL.md
