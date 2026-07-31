---
indice: Registro de planes
origen: agente-desplegado
columnas: [Código, Nombre, Descripción, Estado, Fecha de creación, Fecha de cierre, Origen, Detalle]
descripcion: de qué se trata el plan
---

# Registro de planes

Lo fino de cada plan vive en su archivo, no acá. Las carpetas dan el ciclo grueso: `pendientes/` (planes vivos: `Nuevo`, `En curso`, `Diferido`), `ejecutados/`, `descartados/`.

Los **estados** y su semántica (a qué carpeta mapea cada uno, cuáles son terminales) están definidos en [`ESTADOS.md`](ESTADOS.md) — fuente de verdad configurable, que el lint lee.

- **Código** — `Local-NNNN`. Se asigna al crear la entrada y no se reusa.
- **Nombre** — el título del plan. Único en el Índice.
- **Descripción** — de qué se trata el plan, en una línea.
- **Estado** — uno de los definidos en `ESTADOS.md`: `Nuevo`, `En curso`, `Diferido` (vivos, en `pendientes/`), `Ejecutado`, `Descartado` (terminales).
- **Fecha de creación / Fecha de cierre** — `AA-MM-DD`; la de cierre en `—` mientras el plan esté vivo.
- **Origen** — plan del que se desprendió, si aplica.
- **Detalle** — el archivo del plan, en la carpeta que le da su estado. Ahí vive todo lo largo: el diagnóstico, el trabajo, las notas de implementación y, en los descartados, el motivo.

| Código | Nombre | Descripción | Estado | Fecha de creación | Fecha de cierre | Origen | Detalle |
|--------|--------|-------------|--------|-------------------|-----------------|--------|---------|
