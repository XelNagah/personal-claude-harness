---
name: inicializar-custom
description: Inicializa en el repo actual el setup estándar completo del usuario — orquesta todas las funcionalidades (preferencias de trabajo, memoria local, gestión de planes, estilo de commits). Use when el usuario dice "inicializar-custom", "inicializá el repo", "armá el .claude", "setup completo" o quiere arrancar un proyecto nuevo con su setup estándar.
---

# Inicializar setup completo (orquestador)

Instala el setup estándar completo del usuario aplicando las ocho funcionalidades de convención en orden. Los textos literales (memorias, bloques de preferencias, contenidos iniciales y los scripts de lint) están en [PLANTILLA.md](PLANTILLA.md). (La skill de análisis `planificar` no se instala por-repo: es global.)

## Reconciliación (idempotencia)

Segura de re-correr: este es el modo de **"nivelar"** repos que ya tienen partes del setup (unas sí, otras no). Reglas para **todo** paso que escribe:

- **Inspeccionar antes de escribir.** Leer primero el archivo/carpeta destino. Nunca reescribir de cuajo un archivo existente (en especial `AGENTS.md` y `memoria/MEMORIA.md`).
- **Crear solo lo ausente.** No existe → crear. Existe → agregar únicamente lo que falte, preservando el resto tal cual.
- **Detectar equivalentes.** Una sección o memoria puede estar ya con otro título o redacción (de pedidos previos). Buscar por tema, no solo por nombre exacto. Igual → no tocar. Distinto → **no pisar**: reportar divergencia y preguntar antes de reconciliar.
- **Reportar al final** en tres grupos por funcionalidad: `agregado` (faltaba), `ya estaba` (ok), `divergente` (existe distinto, requiere decisión del user).

## Cableado de subsistemas (decisiones 0017 / 0019)

Cada subsistema se cablea en `AGENTS.md` con **una línea `@.claude/<sub>/MANIFIESTO.md`** dentro de una **única sección `## Subsistemas`** (PLANTILLA §Subsistemas) — no con una sección de prosa por subsistema ni con el viejo bloque "Mapa del repo". Además de su índice/lint/memoria, cada paso de subsistema **crea `<sub>/MANIFIESTO.md`** (PLANTILLA §Manifiesto de ese subsistema) y **asegura su línea** en `## Subsistemas`. El manifiesto **declara si su índice se carga** incluyendo o no la línea `@INDICE.md`: cargan índice **memoria, conocimiento, herramientas**; NO cargan (se consultan a demanda) **planes, glosario, decisiones**.

**Migración (modelo viejo → nuevo).** Si el repo ya tenía secciones de prosa por-subsistema ("## Memoria del proyecto", "## Glosario del proyecto", …) y/o el bloque "## Mapa del repo (siempre cargado)", `## Subsistemas` las **reemplaza**: al cablear cada subsistema, quitar su sección de prosa vieja y su línea `@…INDICE`/`@…MEMORIA`/`@…PLANES` del Mapa; cuando el bloque Mapa queda sin líneas de subsistema, quitar también su encabezado. La sección `## Preferencias (siempre cargadas)` y la Descripción del proyecto **no se tocan**.

## Estructura objetivo

```
├── AGENTS.md          # punto de entrada (fuente única): Descripción + Preferencias (@import) + Subsistemas (una sección con 6 @MANIFIESTO)
├── CLAUDE.md          # adaptador para Claude Code: @AGENTS.md
├── .codex/
│   └── hooks.json     # hook SessionStart → lint-planes --quiet (Codex CLI; requiere repo trusted + features.hooks)
└── .claude/
    ├── settings.json      # hook SessionStart → lint-planes --quiet (Claude Code)
    ├── preferencias/
    │   ├── PREFERENCIAS.md    # Base (harness vN) + Adaptaciones de este repo
    │   └── lint-preferencias/lint-preferencias.js
    ├── memoria/
    │   ├── MEMORIA.md
    │   ├── feedback_flujo_planes.md
    │   ├── feedback_archivo_de_estado.md
    │   ├── feedback_estilo_commits.md
    │   ├── feedback_base_conocimiento.md
    │   ├── feedback_glosario.md
    │   ├── feedback_decisiones.md
    │   ├── feedback_herramientas.md
    │   └── lint-memoria/lint-memoria.js
    ├── planes/
    │   ├── ESTADOS.md     # estados: Estado | Sentido | Carpeta | Terminal (fuente de verdad, la lee el lint)
    │   ├── PLANES.md      # registro: Plan | Estado | Creado | Cerrado | Origen | Notas
    │   ├── pendientes/.gitkeep
    │   ├── ejecutados/.gitkeep
    │   ├── descartados/.gitkeep
    │   └── lint-planes/lint-planes.js
    ├── conocimiento/
    │   ├── INDICE.md
    │   └── lint-conocimiento/lint-conocimiento.js
    ├── glosario/
    │   ├── INDICE.md
    │   └── lint-glosario/lint-glosario.js
    ├── decisiones/
    │   ├── INDICE.md
    │   └── lint-decisiones/lint-decisiones.js
    └── herramientas/
        ├── INDICE.md
        └── lint-herramientas/lint-herramientas.js
```

## Flujo de trabajo

0. **Ubicar la raíz.** Si el cwd contiene subproyectos independientes (varias carpetas con su propio `.claude`), preguntar en cuál inicializar antes de crear nada.
1. **preferencias** — asegurar el **punto de entrada** (decisión 0010): `AGENTS.md` en la raíz (fuente única de instrucciones) + `CLAUDE.md` en la raíz como adaptador de una línea (`@AGENTS.md`). Si no existe ninguno, arrancar `AGENTS.md` con la **Descripción del proyecto** (1 a 3 párrafos inferidos del repo; si está vacío o es ambiguo, preguntar — no inventar). **Migración desde CLAUDE.md** (esquema previo a 0010): si hay un `CLAUDE.md` con contenido (en la raíz o en `.claude/`) y no hay `AGENTS.md` → mover el contenido a `AGENTS.md` (reescribiendo los `@imports` con prefijo `.claude/`), dejar `CLAUDE.md` como adaptador y eliminar el `.claude/CLAUDE.md` residual si lo hubiera (genera doble carga); si el contenido difiere de lo que instala el harness, migrar tal cual y marcar `divergente`. Crear `preferencias/PREFERENCIAS.md` (contenido inicial en PLANTILLA.md §Preferencias; la Base incluye el bullet de **Terminología** — control duro en glosario/decisiones) y asegurar en `AGENTS.md` la sección "Preferencias (siempre cargadas)" con su `@import` (`@.claude/preferencias/PREFERENCIAS.md`) **y el paso de lint** (PLANTILLA.md §Preferencias). Instalar el lint `preferencias/lint-preferencias/lint-preferencias.js` (PLANTILLA.md §Script — lint-preferencias) en su carpeta propia, co-ubicado con el subsistema. **Reconciliación de versiones:** Base con versión vieja → reemplazarla entera por la actual (reportar como actualización, no divergencia); Base editada a mano → mover lo ajeno a Adaptaciones; **Adaptaciones nunca se toca**. **Migración v0:** bloques inline "Preferencias de comunicación"/"Principios de trabajo" en el punto de entrada textualmente iguales a §Bases anteriores → borrarlos y dejar el import, sin preguntar; con diferencias → diferencias a Adaptaciones + reportar.
2. **memoria-local** — asegurar `memoria/MEMORIA.md` (índice: encabezado "Cargar al inicio de cada sesión y respetar." + una línea por memoria, con descriptions que carguen el dato clave). Si ya existe, conservar encabezado y líneas; agregar solo las que falten — nunca reescribirlo entero. Crear `memoria/MANIFIESTO.md` (PLANTILLA.md §Manifiesto memoria; trae el criterio de uso + el lint al cerrar e importa su índice `@MEMORIA.md`) y asegurar su línea `@.claude/memoria/MANIFIESTO.md` en la sección `## Subsistemas` (PLANTILLA.md §Subsistemas; ver **Cableado de subsistemas** — migrar el viejo bloque "Mapa del repo"/sección de prosa "Memoria del proyecto" si estaban). Instalar el lint `memoria/lint-memoria/lint-memoria.js` (PLANTILLA.md §Script — lint-memoria) en su carpeta propia, co-ubicado con el subsistema. Formato de memoria en PLANTILLA.md §Formato.
3. **gestión-de-planes** — **Migración si hay esquema viejo (dos casos, pueden darse juntos):** (a) *dos carpetas → tres:* renombrar `planes-pendientes/`→`pendientes/`, `planes-ejecutados/`→`ejecutados/`; `.md` sueltos en la raíz de `planes/` → `pendientes/` marcados `Diferido` (preguntar en bloque si hay dudas); ⚠️ grep `planes-pendientes|planes-ejecutados` en AGENTS.md/memorias/planes/settings/hooks y actualizar refs (las de settings pueden vivir en el global de la máquina — reportarlas). (b) *dos ejes → un eje:* si `PLANES.md` tiene columna `Prioridad` (foco/estacionado) + estados viejos (`idea`/`en diseño`/`listo`/`en ejecución`), quitar la columna `Prioridad` y remapear cada fila a un único `Estado` (`estacionado`/`idea`/`en diseño`/`listo` → `Diferido`; `en ejecución` → `En curso`; cerradas conservan `Ejecutado`/`Descartado`); los términos viejos se barren, no se registran como alias. Luego: asegurar `pendientes/`, `ejecutados/`, `descartados/` (`.gitkeep` si usa git), `planes/ESTADOS.md` (PLANTILLA.md §Planes) y `planes/PLANES.md` (PLANTILLA.md §Planes; una fila por plan existente — Creado desde la fecha del nombre viejo; planes nuevos = nombre estable sin fecha); instalar las memorias `feedback_flujo_planes.md` y `feedback_archivo_de_estado.md` (la versión vieja del flujo se reemplaza, reportando) e indexarlas; instalar `planes/lint-planes/` (js + README, PLANTILLA.md §Script), co-ubicado con el subsistema; asegurar el hook `SessionStart` → lint-planes `--quiet` con **registro doble** (PLANTILLA.md §Planes, decisión 0010): en `.claude/settings.json` (Claude Code) y en `.codex/hooks.json` (Codex CLI; avisar que requiere repo trusted y `features.hooks`), merge cuidadoso en ambos, sin pisar hooks existentes; crear `planes/MANIFIESTO.md` (PLANTILLA.md §Manifiesto planes; NO importa índice) y asegurar su línea `@.claude/planes/MANIFIESTO.md` en `## Subsistemas` (ver **Cableado de subsistemas**; migrar la sección "Planes del proyecto"/`@PLANES.md` del Mapa si estaban).
4. **estilo-commits** — instalar la memoria `feedback_estilo_commits.md` (PLANTILLA.md) e indexarla con la línea **textual** que acompaña a esa sección (nombra el formato `<Área>: <Resumen>` + Antes/Ahora; un puntero mudo no alcanza, porque el cuerpo de la memoria no queda en contexto). Si el repo ya tiene una convención de commits propia con otro nombre de archivo (`commit_format.md`, `CONTRIBUTING.md`…) y más rica: reconocerla por tema, no crear un segundo archivo, reportar como `divergente` qué falta y preguntar antes de editar.
5. **conocimiento** — asegurar `conocimiento/INDICE.md` (índice raíz; solo punteros); instalar el lint en su carpeta propia `conocimiento/lint-conocimiento/lint-conocimiento.js` (PLANTILLA.md §Script); instalar la memoria `feedback_base_conocimiento.md` (PLANTILLA.md) e indexarla; crear `conocimiento/MANIFIESTO.md` (PLANTILLA.md §Manifiesto conocimiento; importa su índice `@INDICE.md`) y asegurar su línea `@.claude/conocimiento/MANIFIESTO.md` en `## Subsistemas` (ver **Cableado de subsistemas**; migrar la sección "Base de conocimiento del proyecto"/`@INDICE` del Mapa si estaban). ⚠️ El **disparador de escritura** (*cuándo* asentar: al averiguar algo del dominio que costó descubrir, con la prueba «¿seguiría siendo cierto si este repo no existiera?»; la skill `registrar-conocimiento` hace el flujo) vive **en el manifiesto**, siempre en contexto — sin él nadie llena la carpeta y el lint da verde igual, porque un índice vacío es coherente.
   **Migración — buscar en tres lugares, no solo el obvio:**
   - **(a) raíz del repo:** árboles de md, carpetas con su `INDICE.md`, notas sueltas.
   - **(b) dentro de `memoria/`** (el caso más común y el que más se pasa por alto): la memoria se desborda y termina siendo la base de conocimiento. Señales → **sin frontmatter**, **largo** (decenas/cientos de líneas con secciones), **diccionario/catálogo/procedimiento/formato/estructura**, o **`memoria/` indexado por un `README.md` en vez de `MEMORIA.md`**. Se quedan solo los hechos atómicos tipados con frontmatter.
   - **(c) fuentes crudas: NO se mueven** — lo que el agente *lee* (escaneos, PDFs de resúmenes, exports, json/csv de origen) vs. lo que *sabe* (el md sintetizado). Salvo que ya estén entreveradas dentro de una carpeta de conocimiento.

   Proponer plan de move y mover por defecto; ambiguo (código/assets/build) → preguntar antes. ⚠️ **Material sensible, en los dos sentidos:** (i) si un archivo a mover está **ya ignorado** por ruta (`memoria/*-token.md`, credenciales), moverlo rompe el ignore y **hace el commit del secreto** → no moverlo o actualizar el `.gitignore` en el mismo paso (verificar con `git status`); (ii) si hay material sensible **sin ignorar** (credenciales/tokens/`.env`/`*.key`, documentos personales o legales, resúmenes bancarios, libros contables, estudios médicos) → **sugerir** las líneas de `.gitignore` y el riesgo concreto, como hallazgo aparte, sin aplicarlo solo (el user decide; puede querer versionarlos en un repo local) + avisar si el repo nunca debería pushearse a un remoto. **Índice completo:** si había un índice parcial, cubrir TODOS los documentos (los no listados eran huérfanos). **Reparar refs:** índices, links, refs desde `AGENTS.md`/memorias/planes, y acople de scripts movidos a `herramientas/<tool>/` — `__dirname` (reapuntar) o **cwd** (prepender `process.chdir(require('path').join(__dirname,'<ruta datos>'))`). ⚠️ **Script referenciado por ruta en `settings.local.json`/`settings.json`** (ej. `"Bash(bash tools/moonraker-get.sh:*)"`): las reglas de permiso matchean por prefijo exacto → moverlo rompe la pre-autorización (en headless = denegación). `grep` su ruta en los settings antes de mover: o no lo movés, o actualizás la regla en el mismo paso. Correr el lint → 0 refs rotas. **Sin git en el repo → `git init` + commit inicial ANTES de mover** (un commit inicial post-migración no sirve de rollback).
6. **glosario** — asegurar `glosario/INDICE.md` (tabla vacía; PLANTILLA.md §Glosario); instalar el lint `glosario/lint-glosario/lint-glosario.js` (PLANTILLA.md §Glosario); instalar la memoria `feedback_glosario.md` e indexarla; crear `glosario/MANIFIESTO.md` (PLANTILLA.md §Manifiesto glosario; NO importa índice) y asegurar su línea `@.claude/glosario/MANIFIESTO.md` en `## Subsistemas` (ver **Cableado de subsistemas**; migrar la sección "Glosario del proyecto" si estaba). Alias registrados (no prohibidos); conceptos complejos con página de detalle.
7. **decisiones** — asegurar `decisiones/INDICE.md` (tabla vacía; PLANTILLA.md §Decisiones); instalar el lint `decisiones/lint-decisiones/lint-decisiones.js`; instalar la memoria `feedback_decisiones.md` e indexarla; crear `decisiones/MANIFIESTO.md` (PLANTILLA.md §Manifiesto decisiones; NO importa índice) y asegurar su línea `@.claude/decisiones/MANIFIESTO.md` en `## Subsistemas` (ver **Cableado de subsistemas**; migrar la sección "Decisiones del proyecto" si estaba). Solo lo **estructural al propósito** del repo; misma estructura tabla+detalle que el glosario.
8. **herramientas** — asegurar `herramientas/INDICE.md` (registro-tabla vacío **Herramienta | Tipo | Qué hace | Cómo se invoca | Estado**; PLANTILLA.md §Herramientas) — las *tools* que el Propósito requiere (tipos `script`, `skill` local, `MCP` local); instalar el lint `herramientas/lint-herramientas/lint-herramientas.js` con su `README.md`; instalar la memoria `feedback_herramientas.md` e indexarla; crear `herramientas/MANIFIESTO.md` (PLANTILLA.md §Manifiesto herramientas; importa su índice `@INDICE.md`) y asegurar su línea `@.claude/herramientas/MANIFIESTO.md` en `## Subsistemas` (ver **Cableado de subsistemas**; migrar la sección "Herramientas del proyecto"/`@INDICE` del Mapa si estaban). Los **lints de subsistema no van acá** (son infra del Patrón, co-ubicados con su subsistema). **Migrar las herramientas desordenadas:** cada script suelto a `<tool>/` con README y fila (`Tipo: script`); lo que no se sabe qué hace → `Estado: obsoleto` + reportar. ⚠️ Grep de refs por ruta en `settings`/`.gitignore`/hooks antes de mover.
9. **Memorias adicionales**: si en la conversación ya surgieron preferencias u objetivos del proyecto, persistirlos con el frontmatter estándar e indexarlos.
10. **Reportar el nivelado**: por funcionalidad, qué quedó en `agregado` / `ya estaba` / `divergente`, y la estructura final. Si hubo `divergente`, listarlo aparte para que el user decida. **No hacer commit** salvo pedido explícito.
