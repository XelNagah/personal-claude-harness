---
name: inicializar-conocimiento
description: Instala la base de conocimiento del usuario en el repo actual (.claude/conocimiento/ como ubicación única + lint de integridad en .claude/scripts/lint-conocimiento/). Migra conocimiento suelto de la raíz. Use when el usuario dice "inicializar conocimiento", "base de conocimiento", "armá el conocimiento", o como parte del setup completo.
---

# Inicializar base de conocimiento

Instala la convención de **base de conocimiento**: una carpeta única `.claude/conocimiento/` donde vive todo lo que el agente sabe, más un lint de integridad. Si el repo ya tiene conocimiento disperso (en la raíz), **migrarlo** adentro. Depende de `memoria-local` (la convención se persiste como memoria tipada).

## Estructura objetivo

```
.claude/
├── conocimiento/
│   └── INDICE.md                          # índice raíz (solo punteros)
├── memory/
│   └── feedback_base_conocimiento.md      # la convención, como memoria
└── scripts/
    └── lint-conocimiento/
        └── lint-conocimiento.js           # lint mecánico
```

## Reconciliación (idempotencia)

Segura de re-correr: sirve para **"levelear"** repos que ya tienen partes. Reglas para **todo** paso que escribe:

- **Inspeccionar antes de escribir.** Leer primero el destino. Nunca reescribir de cuajo un archivo existente.
- **Crear solo lo ausente.** No existe → crear. Existe → agregar únicamente lo que falte, preservando el resto.
- **Detectar equivalentes.** Una carpeta/sección puede estar con otro nombre. Buscar por tema, no solo por nombre exacto. Igual → no tocar. Distinto → reportar y decidir.
- **Reportar al final** en tres baldes: `agregado` (faltaba), `ya estaba` (ok), `divergente` (existe distinto o requiere decisión).

## Workflow

1. **Carpeta de conocimiento.** Asegurar `.claude/conocimiento/` con un `INDICE.md` raíz (encabezado + una línea por página/sección; solo punteros, nunca contenido). Si no existe, crear.
2. **Tool de lint.** Instalar `.claude/scripts/lint-conocimiento/lint-conocimiento.js` con el contenido EXACTO de [PLANTILLA.md](PLANTILLA.md) §Script. Va en **su propia carpeta** bajo `scripts/`, nunca suelto.
3. **Memoria de la convención.** Instalar `.claude/memory/feedback_base_conocimiento.md` (PLANTILLA.md §Memoria) e indexarla en `MEMORY.md` (agregar solo la línea si falta).
4. **Sección en `CLAUDE.md`.** Asegurar una sección **"Base de conocimiento del proyecto"** con link a `conocimiento/INDICE.md`, la regla de ubicación única, y el paso de lint al cerrar. Si ya hay una equivalente (otro título, mismo tema), no duplicar.
5. **Migración (el punto de la funcionalidad).** Detectar conocimiento que viva **fuera** de `.claude/conocimiento/`: árboles de md en la raíz del repo, carpetas con su propio `INDICE.md`, notas de dominio sueltas. Si hay:
   - Presentar un **plan de move concreto** (qué carpeta/archivo → dónde dentro de `conocimiento/`).
   - **Mover por defecto** (es el objetivo). Si es ambiguo qué es conocimiento vs. contenido incidental del repo (código, assets, config de build), listar y **preguntar antes de mover**.
   - Los **datos acoplados** (json de origen, archivos generados) se mueven con su carpeta.
   - **Reparar referencias:** paths en cada `INDICE.md`, links entre páginas, y el `__dirname` de scripts de datos que se muevan a `scripts/<tool>/` (reapuntar a `.../conocimiento/...`, ver §Migración de la memoria).
   - Correr el lint tras mover y confirmar **0 refs rotas**.
   Si ya está todo bajo `conocimiento/`, no-op.
6. **Reportar** en los tres baldes + estructura final. Si hubo `divergente`, listarlo aparte. **No hacer commit** salvo pedido explícito.
