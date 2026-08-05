---
name: analizar-plan
description: Trabaja sobre un plan ya persistido y lo mueve por el estado Análisis hasta Listo si corresponde, reutilizando amp:planificar para interrogarlo contra la sabiduría del repo. Use when hay que analizar, delimitar o afinar un plan pendiente antes de ejecutarlo, o el usuario dice "analizá este plan".
---

# Analizar un plan

Lleva un plan de `Nuevo` (o de vuelta desde `Diferido`) a `Análisis`, lo interroga a fondo, y lo deja en `Listo` cuando está suficientemente definido para ejecutar. El contrato de estados vive en `.claude/planes/ESTADOS.md`.

Esta skill **no reimplementa el análisis**: reutiliza `amp:planificar`, que interroga el plan contra semántica, decisiones y conocimiento, y actualiza esas bases sobre la marcha. Acá se agrega solo el movimiento de estado del plan persistido.

## Flujo

1. **Pasar a `Análisis`**: actualizar la fila del plan en `.claude/planes/PLANES.md` y el encabezado del documento. El archivo se queda en `pendientes/` (todos los estados vivos comparten carpeta).
2. **Correr `amp:planificar`** sobre el plan: recorrer el árbol de decisión, resolver lo averiguable, registrar términos y decisiones que se cristalicen. Volcar el acuerdo al documento del plan.
3. **Decidir el estado de salida**:
   - Suficientemente definido para ejecutar → **`Listo`**.
   - Falta trabajo o se corta la sesión → dejar en `Análisis` o `pausar-plan`.
   - Se pospone a propósito → `diferir-plan`. Ya no sirve → `descartar-plan`.

## Cerrar con el lint

```bash
node .claude/planes/lint-planes/lint-planes.js
```

Reportar el estado en que quedó el plan, los términos y decisiones que se registraron, y el resultado del lint.

## Reconciliación

Al retomar un análisis a medias, volver a cargar la sabiduría del repo y el estado actual del plan; continuar desde la primera cuestión sin resolver y reportar como `ya estaba` lo que el repo ya incorporó. No reabrir decisiones ya ratificadas.
