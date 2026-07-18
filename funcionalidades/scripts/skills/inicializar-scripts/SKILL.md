---
name: inicializar-scripts
description: Instala la gestión de scripts del usuario en el repo actual (.claude/scripts/<tool>/ con README + registro tabla INDICE.md + lint + memoria + sección CLAUDE.md). Ordena el cementerio de scripts. Depende de memoria-local. Use when el usuario dice "inicializar scripts", "gestión de scripts", "ordená los scripts", "registro de scripts".
---

# Inicializar gestión de scripts

Instala la convención de scripts del repo: cada herramienta en su carpeta `.claude/scripts/<tool>/` con un `README.md`, listadas en un registro-tabla, con un lint. Ordena el "cementerio de scripts" — archivos sueltos sin saber qué son ni cómo se usan. Si parte ya existe, **extender sin pisar**.

**Depende de `memoria-local`**: la convención se guarda como memoria. Si `.claude/memory/MEMORY.md` no existe, ejecutar primero la skill `inicializar-memoria-local`.

## Estructura objetivo

```
.claude/
├── CLAUDE.md          # se le asegura la sección "Scripts del proyecto"
├── scripts/
│   ├── INDICE.md      # tabla: Tool | Qué hace | Cómo se corre | Estado
│   ├── <tool>/
│   │   ├── README.md  # ficha del tool
│   │   └── ...        # el código
│   └── lint-scripts/
│       ├── README.md
│       └── lint-scripts.js
└── memory/
    └── feedback_scripts.md
```

## Reconciliación (idempotencia)

Segura de re-correr: sirve para **"levelear"** repos que ya tienen algunas partes. Reglas para **todo** paso que escribe:

- **Inspeccionar antes de escribir.** Leer primero el destino. Nunca reescribir de cuajo `INDICE.md` ni un README de tool.
- **Crear solo lo ausente.** No existe → crear. Existe → preservar; agregar solo lo que falte.
- **Detectar equivalentes.** Puede haber ya un registro de scripts con otro nombre. Buscar por tema. Igual → no tocar. Distinto → **no pisar**: reportar divergencia y preguntar.
- **Reportar al final** en tres baldes: `agregado` / `ya estaba` / `divergente`.

## Concepto de la funcionalidad

- **Cada script en su carpeta** `<tool>/` con README (nunca suelto). El README es la ficha (uso, deps, quién lo referencia); la tabla es el índice escaneável.
- **Registro-tabla** `INDICE.md`: una fila por tool con qué hace, cómo se corre, estado.
- ⚠️ **Refs por ruta:** un script referenciado por ruta en `settings`, `.gitignore` o un hook NO se mueve/renombra sin actualizar esa referencia — rompe el match por prefijo exacto y se pierde la pre-autorización.

## Migración (ordenar el cementerio)

Si el repo ya tiene una carpeta de scripts desordenada (archivos sueltos, sin doc):

- **Agrupar** cada script suelto en su carpeta `<tool>/` y darle un `README.md` (qué hace, cómo se corre; origen solo si se sabe). Si no se sabe qué hace un script, **marcarlo `Estado: obsoleto`** en el registro y reportarlo para que el user decida — no inventar propósito.
- ⚠️ **Antes de mover un script, grep su ruta** en `settings.local.json`/`settings.json`, `.gitignore` y hooks. Si aparece, actualizar la referencia en el mismo paso (o no moverlo). Correr el lint tras mover → 0 refs por ruta rotas.
- Cubrir **todos** los scripts en el registro (los no listados eran el problema).

## Workflow

1. **Verificar `memoria-local`.** Si `.claude/memory/` no existe, instalarla primero.
2. **Asegurar `.claude/scripts/INDICE.md`** con la semilla de [PLANTILLA.md](PLANTILLA.md) §Índice (encabezado + tabla vacía). Formato de la ficha por tool en §README-tool.
3. **Instalar el lint** `.claude/scripts/lint-scripts/lint-scripts.js` (contenido EXACTO de PLANTILLA.md §Script) con su propio `README.md`.
4. **Migrar** scripts sueltos existentes a `<tool>/` con README y fila en el registro (ver Migración). Grep de refs por ruta antes de mover.
5. **Asegurar la memoria `feedback_scripts.md`** (verbatim de PLANTILLA.md §Memoria) y su línea en `memory/MEMORY.md`.
6. **En `.claude/CLAUDE.md`** asegurar la sección **"Scripts del proyecto"** (PLANTILLA.md §Sección). No reescribir el archivo entero. Si existe el bloque **"Mapa del repo (siempre cargado)"** (de `memoria-local`), asegurar la línea `@scripts/INDICE.md` en él.
7. **Reportar** en los tres baldes. Correr el lint (`node .claude/scripts/lint-scripts/lint-scripts.js`). **No hacer commit** salvo pedido explícito.
