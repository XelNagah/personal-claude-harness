---
name: inicializar-decisiones
description: Instala el registro de decisiones del usuario en el repo actual (.claude/decisiones/INDICE.md tabla + páginas de detalle + lint + memoria + sección en AGENTS.md). Decisiones estructurales al propósito del repo (NO "ADR"). Depende de memoria-local. Use when el usuario dice "inicializar decisiones", "registro de decisiones", "armá las decisiones".
---

# Inicializar registro de decisiones

Instala un registro de las decisiones **estructurales al propósito del repo**. Misma estructura que el glosario: una **tabla** (`INDICE.md`) donde lo simple vive en la fila y lo complejo apunta a una **página de detalle** propia. Se consultan al planificar/analizar. Si parte ya existe, **extender sin pisar**.

> **No son "ADR".** Estos repos son de propósito general, no solo software: se cae la "A" de *Architecture*. Pero se conserva su espíritu de acotar: solo lo **estructural**, no lo operativo trivial.

**Depende de `memoria-local`**: la convención se guarda como memoria. Si `.claude/memoria/MEMORIA.md` no existe, ejecutar primero la skill `inicializar-memoria-local`.

## Estructura objetivo

```
├── AGENTS.md          # (raíz) se le asegura la sección "Decisiones del proyecto"; CLAUDE.md = adaptador
├── .claude/decisiones/
│   ├── INDICE.md  # tabla: N° | Decisión | Fecha | Estado | Detalle
│   ├── NNNN-slug.md   # página de detalle, solo para decisiones complejas
│   └── lint-decisiones/
│       └── lint-decisiones.js
└── memoria/
    └── feedback_decisiones.md
```

## Reconciliación (idempotencia)

Segura de re-correr: sirve para **"nivelar"** repos que ya tienen algunas partes. Reglas para **todo** paso que escribe:

- **Inspeccionar antes de escribir.** Leer primero el destino. Nunca reescribir de cuajo `INDICE.md` ni una página de detalle (pueden tener decisiones registradas).
- **Crear solo lo ausente.** No existe → crear. Existe → preservar; agregar solo lo que falte.
- **Detectar equivalentes.** Puede haber ya un registro con otro nombre/ubicación (un `docs/adr/`, un `INDICE.md` con otro formato). Buscar por tema. Igual → no tocar. Distinto → **no pisar**: reportar divergencia y preguntar si migrar.
- **Reportar al final** en tres grupos: `agregado` / `ya estaba` / `divergente`.

## Concepto de la funcionalidad

- **Qué se registra:** solo decisiones **estructurales al propósito del repo** — las que definen cómo es / qué hace el repo en lo esencial, o que eligen un camino que condiciona el trabajo futuro. **No** las operativas triviales o efímeras ("busqué en internet", "usé tal flag").
- **Detalle bajo demanda** (como el glosario): decisión simple → una fila, columna Detalle en `—`. Decisión compleja (contexto, alternativas, consecuencias) → su fila apunta a una página `NNNN-slug.md`.
- **Reemplazar, no borrar:** para revertir una decisión, agregar una nueva y marcar la vieja `reemplazada por NNNN`.

## Flujo de trabajo

1. **Verificar `memoria-local`.** Si `.claude/memoria/` no existe, instalarla primero.
2. **Asegurar `.claude/decisiones/INDICE.md`** con el contenido inicial de [PLANTILLA.md](PLANTILLA.md) §Decisiones (encabezado + tabla vacía). Formato de página de detalle en §Detalle. Si ya existe un registro equivalente (ej. `docs/adr/`), no duplicar: reportar `divergente` y preguntar si migrar.
3. **Instalar el lint** `.claude/decisiones/lint-decisiones/lint-decisiones.js` con el contenido EXACTO de PLANTILLA.md §Script.
4. **Asegurar la memoria `feedback_decisiones.md`** (textual de PLANTILLA.md §Memoria) y su línea en `memoria/MEMORIA.md`. Equivalente presente → no duplicar; difiere → reportar.
5. **En `AGENTS.md`** (punto de entrada en la raíz, decisión 0010; si falta, crearlo con el adaptador `CLAUDE.md` = `@AGENTS.md` como indica `inicializar-preferencias-trabajo`) asegurar la sección **"Decisiones del proyecto"** (PLANTILLA.md §Sección). Equivalente presente → no duplicar. No reescribir el archivo entero.
6. **Reportar** en los tres grupos. Correr el lint (`node .claude/decisiones/lint-decisiones/lint-decisiones.js`) → debe dar limpio sobre el registro vacío. **No hacer commit** salvo pedido explícito.
