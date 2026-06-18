---
name: inicializar-memoria-local
description: Instala el sistema de memoria local del usuario en el repo actual (.claude/memory/ + MEMORY.md índice + formato de memorias tipadas). Use when el usuario dice "inicializar memoria local", "armá la memoria", "configurá memoria del proyecto", o como dependencia de gestión de planes / estilo de commits.
---

# Inicializar memoria local

Instala el sistema de memoria local persistida en el proyecto actual. Es infraestructura base: otras funcionalidades guardan sus memorias acá. Si parte de la estructura ya existe, **extender sin pisar**.

## Estructura objetivo

```
.claude/
├── CLAUDE.md          # se le asegura la sección "Memoria del proyecto"
└── memory/
    └── MEMORY.md      # índice (solo punteros, nunca contenido)
```

## Reconciliación (idempotencia)

Segura de re-correr: sirve para **"levelear"** repos que ya tienen algunas partes. Reglas para **todo** paso que escribe:

- **Inspeccionar antes de escribir.** Leer primero el archivo/carpeta destino. Nunca reescribir de cuajo un archivo existente.
- **Crear solo lo ausente.** No existe → crear. Existe → agregar únicamente lo que falte, preservando el resto tal cual.
- **Detectar equivalentes.** Una sección o memoria puede estar ya con otro título o redacción. Buscar por tema, no solo por nombre exacto. Igual → no tocar. Distinto → **no pisar**: reportar divergencia y preguntar antes de reconciliar.
- **Reportar al final** en tres baldes: `agregado` (faltaba), `ya estaba` (ok), `divergente` (existe distinto, requiere decisión del user).

## Workflow

1. **Asegurar `.claude/memory/MEMORY.md`** (índice; encabezado `Cargar al inicio de cada sesión y respetar.` + una línea por memoria `- [Título](archivo.md) — resumen corto`; solo punteros, nunca contenido). Si no existe, crearlo. **Si ya existe, conservar su encabezado y todas sus líneas y agregar solo las entradas que falten** — nunca reescribirlo entero.
2. **Definir el formato de cada memoria** — un `.md` propio bajo `.claude/memory/` con este frontmatter:

   ```markdown
   ---
   name: <slug-kebab-case>
   description: <resumen de una línea — se usa para decidir relevancia>
   metadata:
     type: user | feedback | project | reference
   ---

   <el hecho; para feedback/project seguir con líneas **Why:** y **How to apply:**>
   ```

   Tipos: `user` (quién es el usuario), `feedback` (correcciones y enfoques confirmados, con el porqué), `project` (objetivos/restricciones no derivables del código), `reference` (punteros externos). Antes de crear una memoria nueva, revisar si una existente ya la cubre — actualizar en vez de duplicar. Fechas siempre absolutas.
3. **En `.claude/CLAUDE.md`** asegurar una sección **"Memoria del proyecto"** con link a `memory/MEMORY.md`, indicando que la memoria se carga al inicio de cada sesión y se respeta. Si el archivo no existe, crearlo con esa sección; si existe pero ya tiene una sección equivalente (mismo tema, otro título), no duplicar.
4. **Memorias que ya hayan surgido** en la conversación (preferencias, objetivos del proyecto) → persistirlas con el frontmatter de arriba y registrarlas en el índice, salvo que ya exista una que cubra el hecho.
5. **Reportar** en los tres baldes (`agregado` / `ya estaba` / `divergente`). **No hacer commit** salvo pedido explícito.
