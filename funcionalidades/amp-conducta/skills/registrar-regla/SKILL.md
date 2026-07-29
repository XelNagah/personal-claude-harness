---
name: registrar-regla
description: Agrega, modifica o da de baja una regla del Propósito en .claude/conducta/, eligiendo un momento y una clase de acción compatibles y corriendo el lint. Use when el usuario pide asegurar un comportamiento en un momento del flujo, o al reubicar un Componente de Subsistema cuyo destino es Conducta.
---

# Registrar una regla

1. Leer `.claude/conducta/MANIFIESTO.md`, `README.md`, `MOMENTOS.md` e `INDICE.md`.
2. Buscar una regla equivalente por intención y momento. Actualizarla en vez de duplicar.
3. Elegir un momento existente. Si hace falta uno nuevo, declararlo en `MOMENTOS.md`; queda `declarado` hasta tener repartidor.
4. Elegir la clase mínima: `inyectar` cuando requiere juicio, `correr` cuando una Herramienta decide mecánicamente, `bloquear` solo si el falso positivo es imposible.
5. Escribir en `INDICE-LOCAL.md` (el Índice del Agente Desplegado, que ya existe declarado); nunca modificar `INDICE.md`, que es del Agente Multipropósito.
6. Una regla sin repartidor queda `pendiente`, no `vigente`.
7. Si toca terminología o decisiones canónicas, mostrar el texto exacto y esperar ratificación antes de asentarlo.
8. Correr `node .claude/conducta/lint-conducta/lint-conducta.js`.

## Reconciliación

Inspeccionar antes de escribir. Reportar `agregado`, `ya estaba` y `divergente`. No pisar una regla divergente ni cablear un hook ambiguo sin confirmación.
