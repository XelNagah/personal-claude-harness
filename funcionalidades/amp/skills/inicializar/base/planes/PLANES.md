---
indice: Registro de planes
origen: agente-desplegado
columnas: [Código, Nombre, Descripción, Estado, Fecha de creación, Fecha de cierre, Origen, Detalle]
descripcion: qué problema resuelve el plan y qué va a cambiar cuando esté hecho
---

# Registro de planes

Lo fino de cada plan vive en su archivo, no acá. Las carpetas dan el ciclo grueso: `pendientes/` (planes vivos: `Nuevo`, `Análisis`, `Listo`, `En curso`, `En pausa`, `Diferido`), `ejecutados/`, `descartados/`.

Los **estados** y su semántica (a qué carpeta mapea cada uno, cuáles son terminales) están definidos en [`ESTADOS.md`](ESTADOS.md) — fuente de verdad configurable, que el lint lee.

- **Código** — `Local-NNNN`. Se asigna al crear la entrada y no se reusa.
- **Nombre** — **qué va a hacer el plan**, escrito para entenderse leído solo, sin abrir nada. Si el plan arregla algo, el nombre dice qué está mal hoy; si construye algo, qué va a existir cuando termine. **No** es el tema ni el área: «Subsistema conducta» o «Mejoras al registro» dicen de qué se habla, no qué se va a hacer, y obligan a abrir el archivo para saberlo. Único en el Índice.
- **Descripción** — el desarrollo del Nombre: qué problema resuelve y qué va a cambiar cuando esté hecho, con el detalle que haga falta para decidir si abrirlo. Lo que se escriba acá tiene que seguir siendo cierto dentro de dos meses, así que un conteo que cambia con cada fila nueva, o el caso puntual de la sesión que originó el plan, van en el archivo y no en la celda. El **Control de Longitud de Descripción** avisa cuando la celda se pasa.
- **Estado** — uno de los definidos en `ESTADOS.md`: `Nuevo`, `Análisis`, `Listo`, `En curso`, `En pausa`, `Diferido` (vivos, en `pendientes/`), `Ejecutado`, `Descartado` (terminales).
- **Fecha de creación / Fecha de cierre** — `AA-MM-DD`; la de cierre en `—` mientras el plan esté vivo.
- **Origen** — plan del que se desprendió, si aplica.
- **Detalle** — el archivo del plan, en la carpeta que le da su estado. Ahí vive todo lo largo: el diagnóstico, el trabajo, las notas de implementación y, en los descartados, el motivo.

| Código | Nombre | Descripción | Estado | Fecha de creación | Fecha de cierre | Origen | Detalle |
|--------|--------|-------------|--------|-------------------|-----------------|--------|---------|
