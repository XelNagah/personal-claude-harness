# Herramientas — manifiesto de subsistema

Las **Herramientas** del repo — las *tools* que el Propósito requiere (tipos `script`, `skill` local, `MCP` local) — viven en este directorio (`herramientas/`), listadas en `INDICE.md` (tabla Herramienta | Tipo | Qué hace | Cómo se invoca | Estado). Los **lints de subsistema no son Herramientas**: son infra del Patrón y viven con su subsistema (decisión 0008). ⚠️ Una tool referenciada por ruta en `settings`, `.gitignore` o un hook no se mueve sin actualizar esa referencia (rompe el match por prefijo).

**Índice: se carga siempre** (liviano — decisión 0017). Al cerrar una tarea que tocó Herramientas, correr el lint desde la raíz del repo:

```bash
node .claude/herramientas/lint-herramientas/lint-herramientas.js
```

Convención en la memoria `feedback_herramientas.md`.

@INDICE.md
