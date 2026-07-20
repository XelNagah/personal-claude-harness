**Estado: En curso · Creado 26-07-19.**

# Migración a harness multiagente — AGENTS.md fuente única

Documento de diseño + plan de migración, acordado en sesión de `planificar` del 2026-07-19. Objetivo: que el harness sea agnóstico del agente (Claude Code, Codex CLI y futuros) con **una única fuente de verdad** por pieza y adaptadores mínimos por agente. Paridad de comportamiento objetivo: **Claude Code ↔ Codex CLI**; el resto de los agentes queda cubierto por los estándares como efecto secundario. Decisión estructural asentada como **0010**.

## 1. Diagnóstico de la arquitectura actual

Cinco capas con acoplamiento muy distinto:

| Capa | Hoy | Acoplamiento a Claude |
|------|-----|-----------------------|
| 1. Contenido de subsistemas (memoria, planes, glosario, decisiones, conocimiento, herramientas) | markdown + lints Node en `.claude/` | **ninguno** (el nombre `.claude/` es cosmético; los lints hardcodean el path default pero es parametrizable) |
| 2. Instrucciones de entrada | `.claude/CLAUDE.md` + 5 `@imports` + PREFERENCIAS | nombre/ubicación + sintaxis `@import` |
| 3. Skills | `SKILL.md` por funcionalidad + `prompt.md` "agnóstico" duplicado | formato antes propietario, **hoy estándar abierto** (Agent Skills) |
| 4. Hooks | `SessionStart` → `lint-planes --quiet` en `settings.json` | solo el **registro**; el script es Node puro |
| 5. Distribución | marketplace de plugins + junctions `~/.claude/skills/` | marketplace propietario de Claude |

El frontmatter de las memorias (`metadata.type`) es convención propia del harness, no de Claude — portable. Los `prompt.md` ya preveían multi-agente con placeholder `<config>` y tabla de harnesses (Codex→`.codex/`, Cursor→`.cursor/`…).

## 2. Problemas detectados

- **Codex (o cualquier otro agente) abre un repo instalado y no ve nada**: no hay AGENTS.md; toda la sustancia queda invisible.
- **Doble formato `prompt.md`/`SKILL.md`**: duplicación por diseño ("divergentes en forma, no en contenido"), con costo real de propagación (la memoria `feedback_propagacion_harness` existe por ese dolor). Con más agentes, ese modelo escala multiplicando formatos.
- **El mapeo `<config>` de los prompt.md quedó conceptualmente mal**: asumía una casa de datos por agente (`.codex/`, `.cursor/`…), pero un repo lo comparten varios agentes a la vez — la casa de datos debe ser **una sola** para todos.
- **`@import` y hook `SessionStart` sin equivalente declarado** para otros agentes (resuelto: ver §3, hoy sí tienen equivalentes).

## 3. Investigación de estándares (2026-07-19, fuentes primarias)

- **AGENTS.md** ([agents.md](https://agents.md/)): estándar consolidado, gobernado por la Agentic AI Foundation (Linux Foundation). Markdown plano, sin imports, anidable por subcarpeta. Lo leen nativo: Codex, Cursor, Gemini CLI, Copilot y ~25 más. **Claude Code NO lo lee** — su doc oficial ([memory](https://code.claude.com/docs/en/memory)) dice "Claude Code reads CLAUDE.md, not AGENTS.md" y recomienda un CLAUDE.md con `@AGENTS.md` (symlink desaconsejado en Windows; además un symlink commiteado no sobrevive un clone con `core.symlinks=false`, el default de git en Windows).
- **Agent Skills** ([agentskills.io](https://agentskills.io/)): Anthropic abrió el formato SKILL.md como estándar (dic 2025). Adoptado por Codex, Cursor, Gemini CLI, Copilot y ~20 más. Ubicación convergente: `.agents/skills/` (proyecto) y `~/.agents/skills/` (usuario). **Claude Code no escanea `.agents/skills/`** — solo `.claude/skills/`, `~/.claude/skills/` y plugins, pero las entradas **pueden ser symlinks/junctions** (documentado). Codex escanea `$CWD/.agents/skills`, `$REPO_ROOT/.agents/skills`, `~/.agents/skills`, `/etc/codex/skills`, y también sigue symlinks.
- **Hooks**: Codex tiene sistema de hooks con `SessionStart` y nombres calcados de Claude Code (`features.hooks`, ~abr 2026); Gemini CLI y Cursor también. Formatos de registro incompatibles entre sí, pero el modelo (comando shell + JSON stdin/stdout) es el mismo: portar un hook = reescribir el registro, no el script.
- **Codex CLI**: AGENTS.md global (`~/.codex/AGENTS.md`) + por repo + anidado; `project_doc_fallback_filenames` configurable; config en `~/.codex/config.toml` + `.codex/config.toml` (solo repos trusted).
- **Convergencia comunitaria**: patrón dominante = AGENTS.md base compartida + archivo nativo fino por herramienta. Herramienta de referencia: [ruler](https://github.com/intellectronica/ruler) (fuente única → genera copias por agente) — útil como contraste, no adoptada (ver §4-C).

## 4. Alternativas evaluadas y descartadas

- **Paridad total mecánica** (cada agente recibe skills/hooks en formato propio, generados): multiplica formatos a mantener (~4-5 × 16 skills); descartada por costo. Se eligió paridad de **comportamiento** Claude↔Codex vía estándares compartidos.
- **B — CLAUDE.md como fuente + `project_doc_fallback_filenames` en Codex**: config por máquina o repo trusted, contra la corriente del ecosistema, cada agente nuevo = hack propio. Descartada.
- **C — archivo neutro (HARNESS.md) + generador de adaptadores (estilo ruler)**: maquinaria y paso de build para adaptadores que hoy son 1 línea; AGENTS.md ya *es* el archivo neutro con lectura nativa casi universal. Sobreingeniería; reversible si los adaptadores crecieran.
- **Symlink CLAUDE.md→AGENTS.md**: roto en Windows/git (ver §3). Descartado; se usa el `@import` oficial.
- **Mudar los subsistemas fuera de `.claude/`** (a `.agent/` u otra ubicación neutra): pureza de nombre a costo de migrar todos los repos consumidores + cada ref por ruta (lints, hooks, settings) + los verbatim del orquestador. Cero funcionalidad ganada. Descartada.
- **Mantener o generar `prompt.md`**: sin consumidor real (los agentes objetivo leen SKILL.md; su cuerpo es markdown pegable). Descartada la generación por sobreingeniería.
- **Distribución de skills a nivel repo** (copiarlas a cada consumidor): repos autocontenidos pero cada cambio ⇒ re-nivelar N repos × 2 copias. Descartada como default; queda disponible como opción futura para repos compartidos con terceros.

## 5. Arquitectura decidida (decisión 0010)

```
repo (harness y consumidores)
├── AGENTS.md            ← FUENTE de instrucciones (Codex/Cursor/Gemini/Copilot nativo)
├── CLAUDE.md            ← adaptador: `@AGENTS.md` (Claude Code lo expande)
└── .claude/             ← casa de datos de subsistemas, única para todos los agentes

máquina del usuario (autoría/consumo local)
├── ~/.claude/skills/<s> ─┐
└── ~/.agents/skills/<s> ─┴→ junctions → <harness>/funcionalidades/*/skills/<s>
```

1. **AGENTS.md en la raíz = fuente única de instrucciones.** Contiene todo lo que hoy tiene `.claude/CLAUDE.md`, con rutas explícitas `.claude/...`. Los 5 imports del mapa quedan como líneas doble-propósito: "cargá `@.claude/memoria/MEMORIA.md` al inicio" — Claude las expande automático (anidado ≤4 niveles, acá 2), los demás las leen como instrucción y abren el archivo.
2. **CLAUDE.md raíz = adaptador de 1 línea** (`@AGENTS.md`). Se elimina `.claude/CLAUDE.md` (evita doble carga).
3. **`.claude/` sigue siendo la casa de datos** de los 6 subsistemas para todos los agentes. El placeholder `<config>` muere.
4. **SKILL.md formato único** (estándar Agent Skills). Se retiran los `prompt.md` y `prompt-<skill>.md`. Muere el invariante "divergentes en forma, no en contenido".
5. **Distribución de skills a nivel usuario**: doble tanda de junctions (`~/.claude/skills/` para Claude, `~/.agents/skills/` para Codex/Cursor/Gemini) apuntando a las mismas carpetas fuente. Script de setup como Herramienta nueva. El marketplace de plugins **se mantiene** como canal Claude multi-máquina.
6. **Hooks con registro doble**: el mismo script (`lint-planes --quiet`) registrado en `.claude/settings.json` (Claude, `SessionStart`) y en el formato de hooks de Codex (requiere `features.hooks` habilitado por el usuario; el instalador lo documenta).

**Punto débil conocido:** en Codex las preferencias se cargan por instrucción textual, no por expansión `@import` — garantía más débil. Mitigación futura: hook `SessionStart` de Codex que inyecte `PREFERENCIAS.md` (converge con el plan pendiente `Hook de preferencias en punto de accion`).

## 6. Plan de migración (menor impacto, por fases verificables)

- **Fase 1 — punto de entrada en este repo.** Crear `AGENTS.md` raíz (contenido migrado de `.claude/CLAUDE.md`, imports reescritos `@.claude/...`), `CLAUDE.md` raíz = `@AGENTS.md`, borrar `.claude/CLAUDE.md`. Verificar: sesión Claude carga preferencias y mapa; sesión Codex ve AGENTS.md.
- **Fase 2 — junctions Codex.** Herramienta `instalar-junctions` (PowerShell/Node) que crea las dos tandas (`~/.claude/skills/` + `~/.agents/skills/`) desde `funcionalidades/*/skills/`; reemplaza el procedimiento manual del CLAUDE.md. Registrarla en `herramientas/INDICE.md`. Verificar: `/skills` en Codex lista las del harness.
- **Fase 3 — retirar prompt.md.** Borrar `prompt*.md` de las 10 funcionalidades; actualizar `REGISTRO.md` (estructura de funcionalidad, invariante), `lint-harness` (quitar chequeos prompt↔skill), skill `propagar-harness` y `agregar-funcionalidad` (ya no crean prompt.md). Bump plugins a 0.3.0.
- **Fase 4 — hooks dobles.** `gestion-de-planes` (instalador) escribe ambos registros; aplicar también en este repo. Documentar `features.hooks`.
- **Fase 5 — actualizar el instalador/orquestador.** Los `inicializar-*` y `setup-completo` pasan de "crear/merge CLAUDE.md" a "crear/merge AGENTS.md + adaptador CLAUDE.md". Reconciliación/nivelar: repo existente con CLAUDE.md gordo → mover contenido a AGENTS.md, dejar adaptador (sin pisar lo divergente, preguntar). Re-sincronizar los verbatim del orquestador (`propagar-harness`).
- **Fase 6 — migrar repos consumidores.** Nivelar los activos (mismo precedente que `Migrar repos consumidores a estados nuevos`: activos ahora, dormidos reconcile-on-use).
- **Fase 7 — control de cierre.** `control-cierre` + `lint-harness` + `claude plugin validate .` verdes; prueba de humo real con Codex CLI en un consumidor (leer AGENTS.md, invocar una skill, disparar el hook).

Cada fase deja el repo consistente por sí sola; el orden minimiza el riesgo (primero este repo, después el harness distribuible, al final los consumidores).

## 7. Cambios concretos en el repositorio

| Pieza | Cambio |
|-------|--------|
| `AGENTS.md` (raíz, nuevo) | fuente de instrucciones (ex `.claude/CLAUDE.md`, rutas `@.claude/...`) |
| `CLAUDE.md` (raíz, nuevo) | adaptador `@AGENTS.md` |
| `.claude/CLAUDE.md` | se elimina (contenido migrado) |
| `funcionalidades/*/prompt*.md` (≈16 archivos) | se retiran |
| `funcionalidades/*/skills/*/SKILL.md` | fuente única; frontmatter ya es estándar Agent Skills |
| `.claude/herramientas/instalar-junctions/` (nueva) | script doble tanda de junctions + fila en INDICE |
| `.claude/herramientas/lint-harness/` | quitar chequeos prompt↔skill; sumar chequeo AGENTS/CLAUDE adaptador y junctions dobles |
| `.claude/settings.json` + hooks Codex | registro doble del hook de planes |
| `REGISTRO.md` | estructura de funcionalidad sin prompt.md; invariante nuevo (SKILL.md fuente única) |
| `.claude/skills/propagar-harness/`, `agregar-funcionalidad/` | flujos sin prompt.md |
| `setup-completo` + `inicializar-*` | instalan AGENTS.md + adaptador; verbatim re-sincronizados |
| `marketplace.json` / plugins | se mantienen; bump 0.3.0 |
| Glosario y decisiones | ya actualizados en esta sesión (Skill redefinida, Punto de entrada, decisión 0010) |
