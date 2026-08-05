---
name: crear-plan
description: Registra un plan nuevo en .claude/planes/ — escribe el documento con nombre estable, agrega su fila en PLANES.md en estado Nuevo y deja los enlaces consistentes. Use when el usuario dice "guardá este plan", "creá un plan", o hay que persistir una idea o un trabajo antes de arrancarlo.
---

# Crear un plan

Persiste un plan nuevo en `.claude/planes/`, en estado `Nuevo`. El plan nace sin analizar: el análisis es el paso siguiente (`analizar-plan`), no parte de crearlo.

El contrato de estados vive en `.claude/planes/ESTADOS.md`; la convención completa del ciclo, en el README del subsistema (`.claude/planes/README.md`). Esta skill solo abre.

## Flujo

1. **Escribir el documento** en `.claude/planes/pendientes/<nombre-estable>.md`. **Nombre estable**: sin fecha, sin paréntesis (rompen los enlaces markdown), no cambia nunca aunque cambie el estado — el nombre del archivo es la identidad del plan. Encabezado: `**Estado: Nuevo · Creado <AA-MM-DD>.**` y el contexto del plan.
2. **Agregar la fila** en `.claude/planes/PLANES.md`, al final de la tabla (las filas van en orden ascendente por Código):
   - **Código** — `Local-NNNN`, calculado como el **mayor del Índice más uno**, nunca la cantidad de filas más uno: si alguna vez se retiró un plan hay un hueco, y contar filas repite un código ya usado. Los huecos no se reusan.
   - **Nombre** — el título del plan, único en el Índice. **Descripción** — de qué se trata, en una línea. **Estado** `Nuevo`, **Fecha de creación** (`AA-MM-DD`), **Fecha de cierre** en `—`, **Origen** si se desprende de otro plan, **Detalle** con el enlace al archivo.

## Cerrar con el lint

```bash
node .claude/planes/lint-planes/lint-planes.js
```

Debe dar 0 hallazgos. Reportar el plan creado, su Código y el resultado del lint.

## Reconciliación

Antes de crear, buscar un plan equivalente en el registro y en los archivos de `pendientes/`. Si ya existe, reportar `ya estaba` en vez de duplicar; si existe pero difiere, reportar `divergente` y no pisar. Conservar Código, Nombre y nombre de archivo de lo que ya esté.
