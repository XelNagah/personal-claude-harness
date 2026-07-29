# Herramientas — manifiesto de subsistema

Las **Herramientas** del repo — las *tools* que el Propósito requiere (tipos `script`, `skill` local, `MCP` local) — viven en este directorio (`herramientas/`), en una tabla Herramienta | Tipo | Qué hace | Cómo se invoca | Estado. Los **lints de subsistema no son Herramientas**: son infra del Patrón y viven con su subsistema.

El registro se separa **por origen** en dos archivos: el del Agente Multipropósito (el nivelador lo reemplaza entero) y el del Agente Desplegado (lo suma cada repo; el nivelador no lo abre). Una Herramienta nueva del repo va siempre al segundo.

**Disparador:** consultar el índice para saber qué tools existen y cómo se invocan; registrar una Herramienta al fabricar o adoptar una tool repetible del Propósito. ⚠️ Una tool referenciada por ruta en `settings`, `.gitignore` o un hook no se mueve sin actualizar esa referencia (rompe el match por prefijo).

**Skills:** `registrar-herramienta` (alta o actualización guiada de una Herramienta, su ficha y su fila); instalación con `amp:inicializar`.

**Índices:** `INDICE.md` (Agente Multipropósito) · `INDICE-LOCAL.md` (Agente Desplegado). **Se cargan siempre** (livianos). Al cerrar una tarea que tocó Herramientas, correr el lint desde la raíz del repo:

```bash
node .claude/herramientas/lint-herramientas/lint-herramientas.js
```

Convención completa en `README.md`.

@INDICE.md
@INDICE-LOCAL.md
