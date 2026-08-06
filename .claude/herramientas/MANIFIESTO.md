# Herramientas — manifiesto de subsistema

Las **Herramientas** del repo — la maquinaria con que se construye y se mantiene el Producto, que no es parte del Producto — viven en este directorio (`herramientas/`), en una tabla Herramienta | Tipo | Qué hace | Cómo se invoca | Estado. Tipos: `script`, `skill` local, `MCP` local, `funcion`; la invoca el agente o la invoca otro mecanismo del repo. Los **lints de subsistema y los hooks hoy no se registran acá**: vienen con su subsistema por el Patrón.

El registro se separa **por origen** en dos archivos: el del Agente Multipropósito (el actualizador lo reemplaza entero) y el del Agente Desplegado (lo suma cada repo; el actualizador no lo abre). Una Herramienta nueva del repo va siempre al segundo.

**Disparador:** consultar el índice para saber qué existe y cómo se invoca; registrar al fabricar o adoptar una repetible del Propósito. ⚠️ Una referenciada por ruta en `settings`, `.gitignore` o un hook no se mueve sin actualizar esa referencia.

**Skills:** `registrar-herramienta` (alta o actualización guiada, con su ficha y su fila); instalación con `amp:inicializar`.

**Índices:** `INDICE.md` (Agente Multipropósito) · `INDICE-LOCAL.md` (Agente Desplegado). **Se cargan siempre** (livianos). Al cerrar una tarea que tocó Herramientas, correr el lint desde la raíz del repo:

```bash
node .claude/herramientas/lint-herramientas/lint-herramientas.js
```

Convención completa en `README.md`.

@INDICE.md
@INDICE-LOCAL.md
