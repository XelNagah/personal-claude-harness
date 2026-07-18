---
name: inicializar-custom
description: Inicializa en el repo actual el setup estándar completo del usuario — orquesta todas las funcionalidades (preferencias de trabajo, memoria local, gestión de planes, estilo de commits). Use when el usuario dice "inicializar-custom", "inicializá el repo", "armá el .claude", "setup completo" o quiere arrancar un proyecto nuevo con su setup estándar.
---

# Inicializar setup completo (orquestador)

Instala el setup estándar completo del usuario aplicando las ocho funcionalidades de convención en orden. Los textos verbatim (memorias, bloques de preferencias, semillas y los scripts de lint) están en [PLANTILLA.md](PLANTILLA.md). (La skill de análisis `planificar` no se instala por-repo: es global.)

## Reconciliación (idempotencia)

Segura de re-correr: este es el modo de **"levelear"** repos que ya tienen partes del setup (unas sí, otras no). Reglas para **todo** paso que escribe:

- **Inspeccionar antes de escribir.** Leer primero el archivo/carpeta destino. Nunca reescribir de cuajo un archivo existente (en especial `CLAUDE.md` y `memory/MEMORY.md`).
- **Crear solo lo ausente.** No existe → crear. Existe → agregar únicamente lo que falte, preservando el resto tal cual.
- **Detectar equivalentes.** Una sección o memoria puede estar ya con otro título o redacción (de pedidos previos). Buscar por tema, no solo por nombre exacto. Igual → no tocar. Distinto → **no pisar**: reportar divergencia y preguntar antes de reconciliar.
- **Reportar al final** en tres baldes por funcionalidad: `agregado` (faltaba), `ya estaba` (ok), `divergente` (existe distinto, requiere decisión del user).

## Estructura objetivo

```
.claude/
├── CLAUDE.md          # Descripción + Preferencias + Principios + Memoria + Planes + Conocimiento + Glosario + Decisiones + Scripts
├── memory/
│   ├── MEMORY.md
│   ├── feedback_flujo_planes.md
│   ├── feedback_estilo_commits.md
│   ├── feedback_base_conocimiento.md
│   ├── feedback_glosario.md
│   ├── feedback_decisiones.md
│   └── feedback_scripts.md
├── planes/
│   ├── planes-pendientes/.gitkeep
│   └── planes-ejecutados/.gitkeep
├── conocimiento/
│   └── INDICE.md
├── glosario/
│   └── INDICE.md
├── decisiones/
│   └── INDICE.md
└── scripts/
    ├── INDICE.md
    ├── lint-conocimiento/lint-conocimiento.js
    ├── lint-glosario/lint-glosario.js
    ├── lint-decisiones/lint-decisiones.js
    └── lint-scripts/lint-scripts.js
```

## Workflow

0. **Ubicar la raíz.** Si el cwd contiene subproyectos independientes (varias carpetas con su propio `.claude`), preguntar en cuál inicializar antes de crear nada.
1. **preferencias-trabajo** — crear/extender `.claude/CLAUDE.md`:
   - **Descripción del proyecto** (1 a 3 párrafos inferidos del repo; si está vacío o es ambiguo, preguntar — no inventar).
   - **Preferencias de comunicación** y **Principios de trabajo** (textos en PLANTILLA.md §Preferencias).
2. **memoria-local** — asegurar `memory/MEMORY.md` (índice: encabezado "Cargar al inicio de cada sesión y respetar." + una línea por memoria). Si ya existe, conservar encabezado y líneas; agregar solo las que falten — nunca reescribirlo entero. Asegurar en `CLAUDE.md` la sección "Memoria del proyecto". Formato de memoria en PLANTILLA.md §Formato.
3. **gestión-de-planes** — crear `planes/planes-pendientes/` y `planes/planes-ejecutados/` (con `.gitkeep` si usa git); instalar la memoria `feedback_flujo_planes.md` (PLANTILLA.md) e indexarla; asegurar en `CLAUDE.md` la sección "Planes del proyecto" (formato `AA-MM-DD - [Descripción corta].md`).
4. **estilo-commits** — instalar la memoria `feedback_estilo_commits.md` (PLANTILLA.md) e indexarla.
5. **conocimiento** — asegurar `conocimiento/INDICE.md` (índice raíz; solo punteros); instalar el lint en su carpeta propia `scripts/lint-conocimiento/lint-conocimiento.js` (PLANTILLA.md §Script); instalar la memoria `feedback_base_conocimiento.md` (PLANTILLA.md) e indexarla; asegurar en `CLAUDE.md` la sección "Base de conocimiento del proyecto" (ubicación única + lint al cerrar).
   **Migración — buscar en tres lugares, no solo el obvio:**
   - **(a) raíz del repo:** árboles de md, carpetas con su `INDICE.md`, notas sueltas.
   - **(b) dentro de `memory/`** (el caso más común y el que más se pasa por alto): la memoria se desborda y termina siendo la base de conocimiento. Señales → **sin frontmatter**, **largo** (decenas/cientos de líneas con secciones), **diccionario/catálogo/procedimiento/formato/estructura**, o **`memory/` indexado por un `README.md` en vez de `MEMORY.md`**. Se quedan solo los hechos atómicos tipados con frontmatter.
   - **(c) fuentes crudas: NO se mueven** — lo que el agente *lee* (escaneos, PDFs de resúmenes, exports, json/csv de origen) vs. lo que *sabe* (el md sintetizado). Salvo que ya estén entreveradas dentro de una carpeta de conocimiento.

   Proponer plan de move y mover por defecto; ambiguo (código/assets/build) → preguntar antes. ⚠️ **Material sensible, en los dos sentidos:** (i) si un archivo a mover está **ya ignorado** por ruta (`memory/*-token.md`, credenciales), moverlo rompe el ignore y **commitea el secreto** → no moverlo o actualizar el `.gitignore` en el mismo paso (verificar con `git status`); (ii) si hay material sensible **sin ignorar** (credenciales/tokens/`.env`/`*.key`, documentos personales o legales, resúmenes bancarios, libros contables, estudios médicos) → **sugerir** las líneas de `.gitignore` y el riesgo concreto, como hallazgo aparte, sin aplicarlo solo (el user decide; puede querer versionarlos en un repo local) + avisar si el repo nunca debería pushearse a un remoto. **Índice completo:** si había un índice parcial, cubrir TODOS los documentos (los no listados eran huérfanos). **Reparar refs:** índices, links, refs desde `CLAUDE.md`/memorias/planes, y acople de scripts movidos a `scripts/<tool>/` — `__dirname` (reapuntar) o **cwd** (prepender `process.chdir(require('path').join(__dirname,'<ruta datos>'))`). ⚠️ **Script referenciado por ruta en `settings.local.json`/`settings.json`** (ej. `"Bash(bash tools/moonraker-get.sh:*)"`): las reglas de permiso matchean por prefijo exacto → moverlo rompe la pre-autorización (en headless = denegación). `grep` su ruta en los settings antes de mover: o no lo movés, o actualizás la regla en el mismo paso. Correr el lint → 0 refs rotas. **Sin git en el repo → `git init` + commit inicial ANTES de mover** (un commit inicial post-migración no sirve de rollback).
6. **glosario** — asegurar `glosario/INDICE.md` (tabla vacía; PLANTILLA.md §Glosario); instalar el lint `scripts/lint-glosario/lint-glosario.js` (PLANTILLA.md §Glosario); instalar la memoria `feedback_glosario.md` e indexarla; asegurar en `CLAUDE.md` la sección "Glosario del proyecto". Alias registrados (no prohibidos); conceptos complejos con página de detalle.
7. **decisiones** — asegurar `decisiones/INDICE.md` (tabla vacía; PLANTILLA.md §Decisiones); instalar el lint `scripts/lint-decisiones/lint-decisiones.js`; instalar la memoria `feedback_decisiones.md` e indexarla; asegurar la sección "Decisiones del proyecto". Solo lo **estructural al propósito** del repo; misma estructura tabla+detalle que el glosario.
8. **scripts** — asegurar `scripts/INDICE.md` (registro-tabla vacío; PLANTILLA.md §Scripts); instalar el lint `scripts/lint-scripts/lint-scripts.js` con su `README.md`; instalar la memoria `feedback_scripts.md` e indexarla; asegurar la sección "Scripts del proyecto". **Migrar el cementerio:** cada script suelto a `<tool>/` con README y fila en el registro; lo que no se sabe qué hace → `Estado: obsoleto` + reportar. ⚠️ Grep de refs por ruta en `settings`/`.gitignore`/hooks antes de mover.
9. **Memorias adicionales**: si en la conversación ya surgieron preferencias u objetivos del proyecto, persistirlos con el frontmatter estándar e indexarlos.
10. **Reportar el leveling**: por funcionalidad, qué quedó en `agregado` / `ya estaba` / `divergente`, y la estructura final. Si hubo `divergente`, listarlo aparte para que el user decida. **No hacer commit** salvo pedido explícito.
