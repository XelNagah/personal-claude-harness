---
name: registrar-herramienta
description: Registra o actualiza una Herramienta del Propósito en .claude/herramientas/INDICE.md, crea o reconcilia su ficha y verifica referencias por ruta. Use when se fabrica o adopta una tool repetible del Propósito, o al reubicar un Componente de Subsistema cuyo destino es Herramientas.
---

# Registrar una Herramienta

1. Leer `.claude/herramientas/MANIFIESTO.md`, `README.md` e `INDICE.md`.
2. Buscar por nombre y por finalidad. Si una fila existente ya cubre la Herramienta, actualizarla en vez de duplicar.
3. Determinar el tipo: `script`, `skill` local, `MCP` local, o `funcion` (código que no se ejecuta solo: lo requiere otro código, y vive en `.claude/common/`). Los lints y los hooks de un subsistema no se registran acá: vienen con su subsistema.
4. Antes de mover o renombrar algo, buscar su ruta en `settings`, `.gitignore`, hooks, documentación y scripts. Actualizar todas las referencias en el mismo cambio.
5. Escribir en `INDICE-LOCAL.md` (el Índice del Agente Desplegado, que ya existe declarado); nunca modificar `INDICE.md`, que es del Agente Multipropósito. La fila lleva `Código | Nombre | Descripción | Tipo | Cómo se invoca | Estado | Detalle`:
   - **Código** — `Local-NNNN`, porque el origen es el Agente Desplegado. El número es **el mayor de ese Índice más uno**, nunca la cantidad de filas más uno: si alguna vez se retiró una Herramienta, contar filas repite un código ya usado. Un código retirado deja un hueco y no se reusa.
   - **Nombre** — el nombre de la Herramienta, sin link. **Descripción** — qué hace, en una línea. **Detalle** — el link a donde vive.
6. Para un script local, asegurar `.claude/herramientas/<nombre>/README.md` y su archivo ejecutable. Para una skill o MCP, apuntar a su ubicación real.
7. Correr `node .claude/herramientas/lint-herramientas/lint-herramientas.js`.

## Reconciliación

Inspeccionar antes de escribir. Reportar `agregado`, `ya estaba` y `divergente`. No pisar una fila divergente ni una referencia ambigua sin confirmación.
