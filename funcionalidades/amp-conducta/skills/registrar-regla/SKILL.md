---
name: registrar-regla
description: Agrega, modifica o da de baja una regla del Propósito en .claude/conducta/, eligiendo un momento y una clase de acción compatibles y corriendo el lint. Use when el usuario pide asegurar un comportamiento en un momento del flujo, o al reubicar un Componente de Subsistema cuyo destino es Conducta.
---

# Registrar una regla

1. Leer `.claude/conducta/MANIFIESTO.md`, `README.md`, `MOMENTOS.md`, `CLASES.md` e `INDICE.md`.
2. Buscar una regla equivalente por intención y momento. Actualizarla en vez de duplicar.
3. Elegir un momento existente. Si hace falta uno nuevo, declararlo en `MOMENTOS.md`; queda `declarado` hasta tener repartidor.
4. Elegir la clase mínima de las declaradas en `CLASES.md`: `Inyectar` cuando requiere juicio, `Ejecutar` cuando una Herramienta decide mecánicamente, `Bloquear` solo si el falso positivo es imposible. Las clases **no son configurables**: agregar una fila a `CLASES.md` no hace que el repartidor la soporte.
5. Escribir en `INDICE-LOCAL.md` (el Índice del Agente Desplegado, que ya existe declarado); nunca modificar `INDICE.md`, que es del Agente Multipropósito. La fila lleva `Código | Nombre | Descripción | Momento | Clase | Contenido | Estado | Detalle`:
   - **Código** — `Local-NNNN`. **El mayor de ese Índice más uno**, nunca la cantidad de filas más uno: si alguna vez se retiró una regla, contar filas repite un código ya usado. Un código retirado deja un hueco y no se reusa.
   - **Nombre** — qué asegura, en una frase con verbo. **Descripción** — para qué existe, en una línea. **Contenido** — el dato que el hook consume: el texto a inyectar, o la ruta del programa a correr.
6. Una regla sin repartidor queda `pendiente`, no `vigente`.
7. Si toca terminología o decisiones canónicas, mostrar el texto exacto y esperar ratificación antes de asentarlo.
8. Correr `node .claude/conducta/lint-conducta/lint-conducta.js`.

## Reconciliación

Inspeccionar antes de escribir. Reportar `agregado`, `ya estaba` y `divergente`. No pisar una regla divergente ni cablear un hook ambiguo sin confirmación.
