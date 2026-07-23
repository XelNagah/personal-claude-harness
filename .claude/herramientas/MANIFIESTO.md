# Herramientas — manifiesto de subsistema

Las **Herramientas** del repo — las *tools* que el Propósito requiere (tipos `script`, `skill` local, `MCP` local) — viven en este directorio (`herramientas/`), listadas en `INDICE.md` (tabla Herramienta | Tipo | Qué hace | Cómo se invoca | Estado). Los **lints de subsistema no son Herramientas**: son infra del Patrón y viven con su subsistema.

**Disparador:** consultar el índice para saber qué tools existen y cómo se invocan; registrar una Herramienta al fabricar o adoptar una tool repetible del Propósito. ⚠️ Una tool referenciada por ruta en `settings`, `.gitignore` o un hook no se mueve sin actualizar esa referencia (rompe el match por prefijo).

**Skills:** ninguna de operación — el registro (`INDICE.md`) se edita a mano; instalación con `inicializar-herramientas`.

**Índice: se carga siempre** (liviano). Al cerrar una tarea que tocó Herramientas, correr el lint desde la raíz del repo:

```bash
node .claude/herramientas/lint-herramientas/lint-herramientas.js
```

Convención en la memoria `feedback_herramientas.md`.

@INDICE.md
