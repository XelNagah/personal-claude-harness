---
name: registrar-herramienta
description: Registra o actualiza una Herramienta del Propósito en .claude/herramientas/INDICE.md, crea o reconcilia su ficha y verifica referencias por ruta. Use when se fabrica o adopta una tool repetible del Propósito, o al reubicar una pieza cuyo destino es Herramientas.
---

# Registrar una Herramienta

1. Leer `.claude/herramientas/MANIFIESTO.md`, `README.md` e `INDICE.md`.
2. Buscar por nombre y por finalidad. Si una fila existente ya cubre la Herramienta, actualizarla en vez de duplicar.
3. Determinar el tipo: `script`, `skill` local o `MCP` local. La infraestructura interna de un subsistema, incluidos sus lints, no es una Herramienta.
4. Antes de mover o renombrar algo, buscar su ruta en `settings`, `.gitignore`, hooks, documentación y scripts. Actualizar todas las referencias en el mismo cambio.
5. Escribir en `## Herramientas del Propósito`; nunca modificar `## Herramientas Base`.
6. Para un script local, asegurar `.claude/herramientas/<nombre>/README.md` y su archivo ejecutable. Para una skill o MCP, apuntar a su ubicación real.
7. Correr `node .claude/herramientas/lint-herramientas/lint-herramientas.js`.

## Reconciliación

Inspeccionar antes de escribir. Reportar `agregado`, `ya estaba` y `divergente`. No pisar una fila divergente ni una referencia ambigua sin confirmación.
