---
name: inicializar-glosario
description: Instala el glosario del dominio del usuario en el repo actual (.claude/glosario/INDICE.md tabla + páginas de detalle + lint + memoria + sección CLAUDE.md). Conceptos con alias registrados; detalle propio para lo complejo. Depende de memoria-local. Use when el usuario dice "inicializar glosario", "armá el glosario", "glosario del dominio".
---

# Inicializar glosario del dominio

Instala un glosario del dominio: una **tabla** de conceptos (nombre canónico, definición, alias registrados) donde los conceptos complejos linkean a una **página de detalle** propia. Se consulta al planificar/analizar para mantener coherencia semántica. Si parte ya existe, **extender sin pisar**.

**Depende de `memoria-local`**: la convención se guarda como memoria. Si `.claude/memoria/MEMORIA.md` no existe, ejecutar primero la skill `inicializar-memoria-local`.

## Estructura objetivo

```
.claude/
├── CLAUDE.md          # se le asegura la sección "Glosario del proyecto"
├── glosario/
│   ├── INDICE.md    # tabla: Concepto | Definición | Alias | Detalle
│   └── <slug>.md      # página de detalle, solo para conceptos complejos
├── memoria/
│   └── feedback_glosario.md
└── scripts/
    └── lint-glosario/
        └── lint-glosario.js
```

## Reconciliación (idempotencia)

Segura de re-correr: sirve para **"levelear"** repos que ya tienen algunas partes. Reglas para **todo** paso que escribe:

- **Inspeccionar antes de escribir.** Leer primero el destino. Nunca reescribir de cuajo `INDICE.md` ni una página de detalle (pueden tener conceptos cargados).
- **Crear solo lo ausente.** No existe → crear. Existe → preservar; agregar solo lo que falte.
- **Detectar equivalentes.** Puede haber ya un glosario con otro nombre (un `CONTEXT.md`, un `glosario.md` suelto). Buscar por tema. Igual → no tocar. Distinto → **no pisar**: reportar divergencia y preguntar si migrar.
- **Reportar al final** en tres baldes: `agregado` / `ya estaba` / `divergente`.

## Concepto de la funcionalidad

- **Alias registrados, no prohibidos.** Un concepto tiene un nombre canónico y sus alias quedan *identificados* en la columna Alias (todos válidos). El objetivo es mapear ("birra/chela = cerveza"), no vetar. El lint solo caza que un mismo alias no esté bajo dos conceptos distintos.
- **Toda entrada nueva pasa por el usuario.** El agente puede *proponer* términos (marcados como propuestos), pero no se asientan como canónicos sin ratificación. Preferir las palabras del usuario a acuñar nuevas — el glosario es un registro canónico y tiene gate duro (ver preferencia de terminología).
- **Detalle bajo demanda.** Concepto simple → una fila, columna Detalle en `—`. Concepto complejo (fórmulas, ejemplos, contraejemplos) → su fila linkea a una página `<slug>.md` en la misma carpeta.

## Workflow

1. **Verificar `memoria-local`.** Si `.claude/memoria/` no existe, instalarla primero.
2. **Asegurar `.claude/glosario/INDICE.md`** con la semilla de [PLANTILLA.md](PLANTILLA.md) §Glosario (encabezado + tabla vacía). Si ya existe un glosario equivalente (ej. un `CONTEXT.md` en la raíz), **no duplicar**: reportar `divergente` y preguntar si migrar su contenido a la tabla.
3. **Instalar el lint** `.claude/scripts/lint-glosario/lint-glosario.js` con el contenido EXACTO de PLANTILLA.md §Script.
4. **Asegurar la memoria `feedback_glosario.md`** (verbatim de PLANTILLA.md §Memoria) y su línea en `memoria/MEMORIA.md`. Equivalente presente → no duplicar; difiere → reportar.
5. **En `.claude/CLAUDE.md`** asegurar la sección **"Glosario del proyecto"** (PLANTILLA.md §Sección). Equivalente presente → no duplicar. No reescribir el archivo entero.
6. **Reportar** en los tres baldes. Correr el lint (`node .claude/scripts/lint-glosario/lint-glosario.js`) → debe dar limpio sobre el glosario vacío. **No hacer commit** salvo pedido explícito.
