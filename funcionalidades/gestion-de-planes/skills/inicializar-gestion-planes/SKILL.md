---
name: inicializar-gestion-planes
description: Instala el ciclo de planes pendientes→ejecutados del usuario en el repo actual (.claude/planes/ + memoria flujo-planes). Depende de memoria-local. Use when el usuario dice "inicializar gestión de planes", "armá los planes", "configurá planes pendientes y ejecutados".
---

# Inicializar gestión de planes

Instala la gestión de planes persistida en el proyecto actual. Si parte ya existe, **extender sin pisar**.

**Depende de `memoria-local`**: la memoria del flujo se guarda en `.claude/memory/`. Si `.claude/memory/MEMORY.md` no existe, ejecutar primero la skill `inicializar-memoria-local` (o crear ese sistema) antes de seguir.

## Estructura objetivo

```
.claude/
├── CLAUDE.md          # se le asegura la sección "Planes del proyecto"
├── memory/
│   └── feedback_flujo_planes.md
└── planes/
    ├── planes-pendientes/.gitkeep
    └── planes-ejecutados/.gitkeep
```

## Reconciliación (idempotencia)

Segura de re-correr: sirve para **"levelear"** repos que ya tienen algunas partes. Reglas para **todo** paso que escribe:

- **Inspeccionar antes de escribir.** Leer primero el archivo/carpeta destino. Nunca reescribir de cuajo un archivo existente.
- **Crear solo lo ausente.** No existe → crear. Existe → agregar únicamente lo que falte, preservando el resto tal cual.
- **Detectar equivalentes.** La memoria del flujo o la sección de planes puede estar ya con otro título o redacción. Buscar por tema, no solo por nombre exacto. Igual → no tocar. Distinto → **no pisar**: reportar divergencia y preguntar antes de reconciliar.
- **Reportar al final** en tres baldes: `agregado` (faltaba), `ya estaba` (ok), `divergente` (existe distinto, requiere decisión del user).

## Workflow

1. **Verificar `memoria-local`.** Si `.claude/memory/` no existe, instalarla primero.
2. **Asegurar `planes/planes-pendientes/` y `planes/planes-ejecutados/`** (crear las que falten, con `.gitkeep` si el repo usa git). Si ya existen con planes adentro, no tocarlos.
3. **Asegurar la memoria `feedback_flujo_planes.md`** (texto **verbatim** de [PLANTILLA.md](PLANTILLA.md)) y su línea en `memory/MEMORY.md`. Si ya existe esa memoria o una equivalente (mismo tema de flujo de planes): no duplicar; si difiere, reportar como `divergente` y preguntar.
4. **En `.claude/CLAUDE.md`** asegurar una sección **"Planes del proyecto"** (si no hay equivalente) con links a `planes/planes-pendientes/` y `planes/planes-ejecutados/`, el formato de nombre `AA-MM-DD - [Descripción corta].md` y un puntero a la memoria del flujo. No reescribir el archivo entero.
5. **Reportar** en los tres baldes (`agregado` / `ya estaba` / `divergente`). **No hacer commit** salvo pedido explícito.
