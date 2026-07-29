---
name: inicializar
description: Inicializa en el repo actual el setup estándar completo del Agente Multipropósito — arma el .claude completo con el catálogo de subsistemas y las casas Base (preferencias, planes, conocimiento, semántica, decisiones, herramientas y conducta). Use when el usuario dice "amp:inicializar", "inicializá el repo", "armá el .claude", "setup completo" o quiere arrancar un proyecto nuevo con su setup estándar.
---

# Inicializar setup completo (orquestador)

Instala el setup estándar completo del usuario aplicando el catálogo y las siete casas Base en orden. Los textos literales (manifiestos, README, registros, preferencias, scripts de lint y hook repartidor de conducta) están en [PLANTILLA.md](PLANTILLA.md). (La skill de análisis `planificar` no se instala por-repo: es global.)

## Reconciliación (idempotencia)

Segura de re-correr: este es el modo de **"nivelar"** repos que ya tienen partes del setup (unas sí, otras no). Reglas para **todo** paso que escribe:

- **Inspeccionar antes de escribir.** Leer primero el archivo/carpeta destino. Nunca reescribir de cuajo un archivo existente (en especial `AGENTS.md`, `subsistemas/SUBSISTEMAS.md` y los registros con secciones del Propósito).
- **Crear solo lo ausente.** No existe → crear. Existe → agregar únicamente lo que falte, preservando el resto tal cual.
- ⚠️ **«Lo que falta» se mide por pieza, no por archivo.** Que el archivo exista **no** significa que esté completo. Un registro Base presente pero **sin una de sus filas** está incompleto, y esa fila se agrega —no se reporta `ya estaba`—. Es el modo de falla más caro de este flujo: el repo se informa al día mientras le falta la mitad del cableado, y nadie lo mira de nuevo. Los seis registros que se reconcilian **por fila o por entrada**, con lo que cada uno debe tener sí o sí:

  | Registro | Lo Base que no puede faltar |
  |----------|------------------------------|
  | `subsistemas/SUBSISTEMAS.md` → `## Subsistemas Base` | una fila por casa Base instalada; `## Subsistemas del Propósito` se preserva entero |
  | `conducta/MOMENTOS.md` | una fila por momento del vocabulario, incluido **al arrancar la sesión** (`SessionStart`) |
  | `conducta/INDICE.md` → `## Reglas del Agente Multipropósito` | las reglas de río arriba completas, incluidas **Mostrar la Pantalla de bienvenida al arrancar** (clase `correr`) y **Frenar la terminología vetada antes de que se escriba** (clase `bloquear`) |
  | `herramientas/INDICE.md` → `## Herramientas del Agente Multipropósito` | una fila por Herramienta de río arriba instalada (hoy `actualizar-plugins`) |
  | `.claude/settings.json` y `.codex/hooks.json` → `hooks` | el repartidor `establecer-conducta` en los **tres** eventos, en **los dos** archivos: `SessionStart`, `UserPromptSubmit`, `PreToolUse` con matcher `Write\|Edit` — **por merge**, sin sacar los hooks que ya estén |
  | `AGENTS.md` → `## Subsistemas` | una línea `@.claude/<sub>/MANIFIESTO.md` por subsistema instalado |

  Agregar una fila Base que falta **no es pisar**: lo que no se toca es lo aprendido —las filas del Propósito, las reglas propias, los hooks ajenos—, que convive en el mismo archivo y se preserva entero.
- **Detectar equivalentes.** Una sección o pieza puede estar ya con otro título o redacción (de pedidos previos). Buscar por tema, no solo por nombre exacto. Igual → no tocar. Distinto → **no pisar**: reportar divergencia y preguntar antes de reconciliar.
- **Reportar al final** en tres grupos por funcionalidad: `agregado` (faltaba), `ya estaba` (ok), `divergente` (existe distinto, requiere decisión del user).

## Cableado de subsistemas

`subsistemas/SUBSISTEMAS.md` es el catálogo de casas persistentes. Su sección `## Subsistemas Base` la mantiene el harness y se reconcilia por fila; `## Subsistemas del Propósito` pertenece al repo y nunca se pisa. Cada subsistema se cablea en `AGENTS.md` con **una línea `@.claude/<sub>/MANIFIESTO.md`** dentro de una **única sección `## Subsistemas`** (PLANTILLA §Subsistemas). Además de su índice o registro, README y lint, cada paso crea `<sub>/MANIFIESTO.md` y asegura su línea. Cargan índice **subsistemas, conocimiento y herramientas**; NO cargan índice **planes, semántica, decisiones y conducta**. Preferencias se carga siempre mediante su sección propia.

**Migración (modelo viejo → nuevo).** Si el repo ya tenía secciones de texto plano por-subsistema ("## Memoria del proyecto", "## Glosario del proyecto", …) y/o el bloque "## Mapa del repo (siempre cargado)", `## Subsistemas` las **reemplaza**: al cablear cada subsistema, quitar su sección de texto plano vieja y su línea `@…INDICE`/`@…MEMORIA`/`@…PLANES` del Mapa; cuando el bloque Mapa queda sin líneas de subsistema, quitar también su encabezado. La sección `## Preferencias (siempre cargadas)` y la Descripción del proyecto **no se tocan**.

## Estructura objetivo

```
├── AGENTS.md          # punto de entrada: Descripción + Preferencias (@import) + Subsistemas (una sección con 7 @MANIFIESTO)
├── CLAUDE.md          # adaptador para Claude Code: @AGENTS.md
├── .codex/
│   └── hooks.json     # hooks: SessionStart → lint-planes --quiet + establecer-conducta; UserPromptSubmit/PreToolUse → establecer-conducta (Codex CLI; requiere repo de confianza + features.hooks)
└── .claude/
    ├── settings.json      # hooks: SessionStart → lint-planes --quiet + establecer-conducta; UserPromptSubmit/PreToolUse → establecer-conducta (Claude Code)
    ├── preferencias/
    │   ├── PREFERENCIAS.md    # secciones del Agente Multipropósito + del Agente Desplegado
    │   ├── estilo-commits.md
    │   ├── archivo-de-estado.md
    │   └── lint-preferencias/lint-preferencias.js
    ├── subsistemas/
    │   ├── MANIFIESTO.md
    │   ├── SUBSISTEMAS.md
    │   ├── README.md
    │   └── lint-subsistemas/
    │       ├── lint-subsistemas.js
    │       └── README.md
    ├── planes/
    │   ├── README.md
    │   ├── ESTADOS.md     # estados: Estado | Sentido | Carpeta | Terminal (fuente de verdad, la lee el lint)
    │   ├── PLANES.md      # registro: Plan | Estado | Creado | Cerrado | Origen | Notas
    │   ├── pendientes/.gitkeep
    │   ├── ejecutados/.gitkeep
    │   ├── descartados/.gitkeep
    │   └── lint-planes/lint-planes.js
    ├── conocimiento/
    │   ├── README.md
    │   ├── INDICE.md
    │   └── lint-conocimiento/lint-conocimiento.js
    ├── semantica/
    │   ├── README.md
    │   ├── GLOSARIO.md
    │   ├── TERMINOLOGIA-FARLOPA.md
    │   └── lint-semantica/lint-semantica.js
    ├── decisiones/
    │   ├── README.md
    │   ├── INDICE.md
    │   └── lint-decisiones/lint-decisiones.js
    ├── herramientas/
    │   ├── README.md
    │   ├── INDICE.md      # registro: ## Herramientas del Agente Multipropósito + ## Herramientas del Agente Desplegado
    │   ├── actualizar-plugins/actualizar-plugins.js   # Herramienta Base: pone al día los plugins
    │   └── lint-herramientas/lint-herramientas.js
    └── conducta/
        ├── MANIFIESTO.md
        ├── README.md
        ├── INDICE.md         # registro de reglas: ## Reglas del Agente Multipropósito + ## Reglas del Agente Desplegado
        ├── MOMENTOS.md       # vocabulario de momentos (lo lee el lint)
        ├── establecer-conducta/establecer-conducta.js   # hook repartidor
        ├── mostrar-pantalla-bienvenida/mostrar-pantalla-bienvenida.js  # Pantalla de bienvenida (Regla Base correr)
        ├── detectar-terminologia-vetada/detectar-terminologia-vetada.js  # control al escribir (Regla Base bloquear)
        └── lint-conducta/lint-conducta.js
```

## Flujo de trabajo vigente

0. **Ubicar la raíz.** Si el cwd contiene subproyectos independientes, preguntar en cuál inicializar antes de crear nada.
1. **preferencias** — asegurar `AGENTS.md` como fuente única y `CLAUDE.md` como adaptador `@AGENTS.md`; instalar `preferencias/PREFERENCIAS.md` (preservando la sección del Agente Desplegado), `preferencias/estilo-commits.md`, `preferencias/archivo-de-estado.md` y `preferencias/lint-preferencias/` desde PLANTILLA. Asegurar la sección de preferencias y su import en `AGENTS.md`. Reconocer convenciones equivalentes por tema y reportar divergencias sin duplicarlas.
2. **subsistemas** — instalar `subsistemas/MANIFIESTO.md`, `SUBSISTEMAS.md`, `README.md` y `lint-subsistemas/` desde PLANTILLA. Reconciliar `## Subsistemas Base` por fila y preservar entera `## Subsistemas del Propósito`. Asegurar `@.claude/subsistemas/MANIFIESTO.md` en `AGENTS.md`.
3. **planes** — instalar `README.md`, `MANIFIESTO.md`, `ESTADOS.md`, `PLANES.md`, las tres carpetas de estados y `lint-planes/`; migrar esquemas previos según §Planes. Cablear el lint de arranque en Claude Code y Codex por merge.
4. **conocimiento** — instalar `README.md`, `MANIFIESTO.md`, `INDICE.md` y `lint-conocimiento/`. Migrar documentos que son saber reutilizable, reparar referencias y preservar fuentes crudas. No crear ni usar `memoria/`.
5. **semántica** — instalar `README.md`, `MANIFIESTO.md`, `GLOSARIO.md`, `TERMINOLOGIA-FARLOPA.md` y `lint-semantica/`.
6. **decisiones** — instalar `README.md`, `MANIFIESTO.md`, `INDICE.md` y `lint-decisiones/`.
7. **herramientas** — instalar `README.md`, `MANIFIESTO.md`, `INDICE.md`, `actualizar-plugins/` y `lint-herramientas/`; reconciliar sólo `## Herramientas del Agente Multipropósito` y preservar `## Herramientas del Agente Desplegado`.
8. **conducta** — instalar `README.md`, `MANIFIESTO.md`, `INDICE.md`, `MOMENTOS.md`, el repartidor, la Pantalla de bienvenida, el control de terminología y `lint-conducta/`. Reconciliar sólo `## Reglas del Agente Multipropósito`, preservar `## Reglas del Agente Desplegado` y cablear los tres eventos en Claude Code y Codex por merge.
9. **Verificar.** Correr todos los lints instalados y `../actualizar/amp-actualizar.js --vista-previa`; debe dar `BASE — INSTALAR / PISAR (0)`.
10. **Reportar.** Por subsistema: `agregado` / `ya estaba` / `divergente`. No hacer commit salvo pedido explícito.
