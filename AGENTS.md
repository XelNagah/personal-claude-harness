# Inicializador de Repos Custom — jllarens

**Objetivo:** funcionalidades para agentes de código de **propósito general** (multipropósito). El usuario define el propósito del repo (contabilidad, análisis de mudanza, prueba de modelos…) y los subsistemas se llenan con lo aprendido para lograrlo, sesión a sesión. Se instala sobre un repo vacío o sobre uno que ya tenga cosas (idempotente/reconciliable). Este repo es la **fuente de verdad del setup estándar** y se actualiza a medida que las preferencias cambian.

El repo es a la vez un **marketplace de plugins de Claude Code** (estilo Matt Pocock, https://github.com/mattpocock) y una colección de skills en el estándar abierto **Agent Skills** (`SKILL.md`), legibles por Claude Code, Codex CLI, Cursor, Gemini CLI y Copilot. Cada funcionalidad = un plugin.

## Punto de entrada (multiagente, decisión 0010)

- **`AGENTS.md` (este archivo) es la fuente única de instrucciones** del repo: lo lee nativo Codex CLI.
- **`CLAUDE.md` (raíz) es solo un adaptador de una línea** (`@AGENTS.md`) para Claude Code, que no lee AGENTS.md nativo. No agregar contenido ahí.
- **`.claude/` es la casa de datos de los subsistemas para TODOS los agentes** (el nombre es cosmético; no hay una casa por agente).
- Las líneas `@ruta` de este archivo: Claude Code las expande automáticamente (import). Si tu agente no soporta imports, **leé esos archivos al inicio de la sesión** — son parte obligatoria del contexto.
- Paridad de comportamiento objetivo: Claude Code ↔ Codex CLI; el resto de los agentes queda cubierto por los estándares.

## Estructura

```
├── AGENTS.md                                  # fuente única de instrucciones (este archivo)
├── CLAUDE.md                                  # adaptador Claude Code: @AGENTS.md
├── README.md                                  # presentación del repo (público)
├── REGISTRO.md                                # catálogo de funcionalidades
├── .claude/                                   # el propio setup estándar, aplicado a este repo
│   ├── subsistemas/                           # catálogo SUBSISTEMAS.md + SUBSISTEMAS-LOCAL.md + MANIFIESTO.md + lint-subsistemas/
│   ├── preferencias/                          # PREFERENCIAS.md + PREFERENCIAS-LOCAL.md (un archivo por origen) + lint-preferencias/
│   ├── planes/                                # PLANES.md + ESTADOS.md + MANIFIESTO.md + pendientes/ ejecutados/ descartados/ + lint-planes/ (hook SessionStart)
│   ├── conocimiento/                          # lo que el agente sabe (INDICE.md) + MANIFIESTO.md + lint-conocimiento/
│   ├── semantica/                             # glosario + terminología farlopa (2 registros) + MANIFIESTO.md + lint-semantica/
│   ├── decisiones/                            # decisiones estructurales (INDICE.md) + MANIFIESTO.md + lint-decisiones/
│   ├── herramientas/                          # tools del Propósito (INDICE.md + INDICE-LOCAL.md, columna Tipo) + MANIFIESTO.md; los lints de subsistema viven con su subsistema, no acá
│   │   ├── lint-herramientas/                 # lint del registro de Herramientas
│   │   └── lint-harness/                      # lint de coherencia del harness (disco↔marketplace↔REGISTRO, textual, tamaño de manifiestos)
│   ├── conducta/                              # momentos + reglas (2 registros) + repartidor establecer-conducta + Pantalla de bienvenida + lint-conducta/
│   └── comunicacion/                          # registro de Agentes Multipropósito Conocidos (Aprendizaje local, no se commitea) + comunicar/ + buscar/ + lint-comunicacion/
├── .claude-plugin/marketplace.json            # catálogo del marketplace (10 plugins)
└── funcionalidades/                           # cada subcarpeta = un plugin
    ├── amp/                                   # plugin transversal: inicializar · planificar · actualizar · info; dep: los 9 amp-<sub>
    ├── amp-subsistemas/                       # catálogo + alta de casas + reubicación guiada del Aprendizaje
    ├── amp-preferencias/                      # preferencias por origen; alta o copia puntual con registrar-preferencia
    ├── amp-planes/                            # ciclo pendientes/ejecutados/descartados + PLANES.md + lint + hook
    ├── amp-conocimiento/                      # base .claude/conocimiento/ + lint
    ├── amp-semantica/                         # glosario + Terminología Farlopa + lint
    ├── amp-decisiones/                        # decisiones estructurales: tabla + detalle + lint
    ├── amp-herramientas/                      # registro de Herramientas; skill registrar-herramienta
    ├── amp-conducta/                          # momentos y reglas; skill registrar-regla
    └── amp-comunicacion/                      # comunicación en el momento entre instalaciones; skills buscar-agentes, registrar-agente, preguntar y resolver
```

Todos los subsistemas Base tienen plugin y al menos una skill de operación. `commits` no es un subsistema: su estilo vive en Preferencias y su entrega en Conducta.

Cada **funcionalidad/plugin** = `funcionalidades/<nombre>/` con `.claude-plugin/plugin.json` + `README.md` + `skills/<nombre-skill>/SKILL.md` (formato estándar Agent Skills, **fuente única** del flujo, rutas `.claude/` literales) y `PLANTILLA.md` cuando lleva textos literales. Un plugin puede llevar además `agents/<nombre>.md`: **subagentes**, que no invoca el usuario sino la skill que les delega el trabajo de volumen para que lo que leen no quede en el hilo principal. Se nombran con sustantivo de rol, no con verbo+objeto como las skills. Catálogo, dependencias, nombres de plugin/skill en `REGISTRO.md`.

## Distribución: marketplace de plugins

`.claude-plugin/marketplace.json` (nombre `xelnagah-harness`) lista 10 plugins: `amp` transversal + 9 `amp-<sub>`. En Claude Code: `/plugin marketplace add <owner>/<repo>` + `/plugin install amp@xelnagah-harness`. En Codex CLI, `actualizar-plugins --aplicar` registra el marketplace e instala las dependencias antes de `amp`.

## Mantenimiento

- **`SKILL.md` es la fuente única de cada flujo** (no hay más `prompt.md` por funcionalidad). `amp:inicializar` es la **fuente única** del setup: absorbió los ex `inicializar-<sub>` individuales.
- **Los Componentes de Subsistema que viajan son archivos, no texto transcripto.** Viven en `funcionalidades/amp/skills/inicializar/base/`, con el mismo árbol que ocupan en el destino, y son copia del `.claude/` de este repo. Editar un lint, un manifiesto o una preferencia = editar el archivo de `.claude/` y correr `node .claude/herramientas/sincronizar-base/sincronizar-base.js --aplicar`. La regla la declara cada archivo en su frontmatter: el mecanismo se copia entero; un registro `origen: agente-desplegado` viaja **solo hasta el separador de su tabla**, porque las filas son las que puebla cada repo. `lint-harness` compara los dos lados en ambos sentidos.
- **Agregar una funcionalidad nueva** → skill `agregar-funcionalidad`: crear `funcionalidades/<nombre>/` (plugin.json + README + skills/<skill>/), sumarla a `marketplace.json` (y a `dependencies` de `amp` si es un `amp-<sub>` del paquete), registrarla en `REGISTRO.md`, y sumar su sección a `amp:inicializar` si es parte del setup base. Validar con `claude plugin validate .`. Procedimiento en `REGISTRO.md`.
- **Dependencias actuales:** los nueve plugins de subsistema son independientes; `amp` depende de todos como paquete. `amp-memoria` está retirado. Si un consumidor todavía lo declara o conserva `.claude/memoria/`, `amp:actualizar` instala la Base nueva, migra el nombre retirado y coordina la reubicación del Aprendizaje antes de informar que quedó al día.
- **Idempotencia / actualizar:** todo skill lleva una sección "Reconciliación (idempotencia)" — son seguros de re-correr y sirven para llevar al día repos a medio configurar. Reglas: inspeccionar antes de escribir, crear solo lo ausente, detectar equivalentes por tema (no pisar lo divergente, preguntar), reportar al final en tres grupos (`agregado` / `ya estaba` / `divergente`). Al tocar un flujo de trabajo, conservar esa propiedad: nada de "Crear X" a secas sobre archivos compartidos (`AGENTS.md`, `MEMORIA.md`).
- **Versionado de plugins:** cada `plugin.json` tiene `version`. Con `version` fijo, los usuarios solo reciben la actualización al subirle la versión; si se omite, cada commit cuenta como versión nueva. Subir la versión al publicar cambios, o quitar `version` para auto-versionar por commit.

## Subsistemas (manifiestos siempre cargados)

Cada subsistema tiene un **Manifiesto** (`.claude/<sub>/MANIFIESTO.md`, decisión 0017): una descripción breve —qué es, cómo se usa, cuándo consultarlo— que va **siempre en contexto** y que **lista sus Índices de Subsistema con el origen de cada uno** y declara si se cargan, incluyendo o no su línea de importación (decisión 0042). Lo que se carga siempre es el manifiesto, no necesariamente el índice (reemplaza la carga incondicional del índice de la decisión 0002).

Un subsistema tiene **uno o más Índices**: hay dos cuando su contenido viene de dos orígenes, y cada archivo lo declara en su frontmatter (`indice`, `origen`, `columnas`). El `origen` —`agente-multiproposito` o `agente-desplegado`— es lo que decide el trato del actualizador, no el nombre del archivo: el sufijo `-LOCAL` solo distingue dos archivos que conviven.

Si tu agente no expande imports, **leé estos manifiestos al inicio de la sesión** (y, si el manifiesto importa sus índices, esos índices también). Hoy cargan su índice: subsistemas, preferencias, conocimiento y herramientas. NO lo cargan (se consultan a demanda): planes, semántica, decisiones, conducta y comunicacion.

@.claude/subsistemas/MANIFIESTO.md
@.claude/preferencias/MANIFIESTO.md
@.claude/planes/MANIFIESTO.md
@.claude/conocimiento/MANIFIESTO.md
@.claude/semantica/MANIFIESTO.md
@.claude/decisiones/MANIFIESTO.md
@.claude/herramientas/MANIFIESTO.md
@.claude/conducta/MANIFIESTO.md
@.claude/comunicacion/MANIFIESTO.md
