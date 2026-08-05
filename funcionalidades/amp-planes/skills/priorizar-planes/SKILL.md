---
name: priorizar-planes
description: Solo lectura. Ordena los planes vivos y fundamenta una prioridad sugerida, marcando la evidencia que falta en vez de inventar certeza. No persiste prioridades ni modifica planes. Use when el usuario dice "qué conviene hacer primero", "priorizá los planes", o hay que decidir por dónde seguir.
---

# Priorizar los planes

Solo lectura: ordena los planes vivos (los no-terminales de `.claude/planes/PLANES.md`) y explica por qué, **sin persistir** la prioridad ni tocar ningún plan. La prioridad es una vista que se recalcula, no un dato guardado — por eso el registro no tiene columna de prioridad.

## Criterios, en orden

1. **Desbloqueo de dependencias** — un plan que destraba a otros pesa más.
2. **Urgencia o fecha explícita**.
3. **Valor para el propósito del agente**.
4. **Esfuerzo, riesgo y grado de definición** — un plan `Listo` cuesta menos de arrancar que uno `Nuevo`.

Marcar la **evidencia faltante** en lugar de inventar certeza: si un plan no dice su dependencia o su esfuerzo, decirlo, no suponerlo.

## Reportar

Presentar los planes vivos ordenados, con una línea por plan que fundamente su lugar y señale qué dato cambiaría el orden. No escribir nada en el registro ni en los archivos.

## Reconciliación

Es solo lectura y sin estado: re-correrla vuelve a leer el registro y recalcula el orden desde cero. No hay nada que reconciliar porque no persiste nada.
