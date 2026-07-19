# Repensar la funcionalidad de `scripts` como Herramientas (Tools)

**Estado: Ejecutado · Creado 26-07-19 · Cerrado 26-07-19.** Analizado por `planificar` → acuerdo cerrado, decisiones 0007/0008, glosario actualizado, rename físico + propagación al harness completos.

## Qué se acordó (diseño)

**Dos cosas que estaban confundidas se separan:**

1. **Herramienta (Tool)** — capacidad que el repo se fabricó para su **Propósito** y el agente invoca para tareas repetibles. Tipos: `script`, `skill` local del repo, `MCP` local. Hooks **afuera** (automatización disparada por evento, no invocable). El subsistema `scripts` se generaliza a **`herramientas`** (decisión 0007). Registro con **columna Tipo**; el nombre de cada fila linkea a donde vive la tool (script en su carpeta, skill en `.claude/skills/`, MCP en `.mcp.json`).

2. **Lint = infra del Patrón de cada subsistema** (decisión 0008, alinea el disco con 0003). Los 8 lints estaban centralizados en `.claude/scripts/` por accidente histórico; nunca fueron Herramientas de dominio. Se **co-ubican con su subsistema**: `.claude/<sub>/lint-<sub>/`. Cada funcionalidad queda **autocontenida** (instalás memoria → `memoria/` + su lint juntos), sin el acoplamiento cruzado de hoy (cada funcionalidad instala su lint en territorio de `scripts`).

**`lint-harness`** (transversal: chequea marketplace↔disco↔REGISTRO) es Herramienta de dominio de **este** repo (cuyo Propósito es autorar el harness) → vive en `.claude/herramientas/lint-harness/` y es la primera fila real del registro Herramientas. `lint-scripts` → `lint-herramientas` (guarda ese registro, vive ahí).

**Registro Herramientas** (`.claude/herramientas/INDICE.md`): tabla `Herramienta | Tipo | Qué hace | Cómo se invoca | Estado`. "Cómo se invoca" generaliza "Cómo se corre" (una skill no se corre como un `.js`, un MCP se conecta). Lint mecánico simple: el link-target existe + Tipo válido.

## Estado final del disco (objetivo)

```
.claude/
├── memoria/       + lint-memoria/
├── preferencias/  + lint-preferencias/
├── conocimiento/  + lint-conocimiento/
├── glosario/      + lint-glosario/
├── decisiones/    + lint-decisiones/
├── planes/        + lint-planes/
└── herramientas/  (ex scripts) + lint-herramientas/ + lint-harness/  ← tools del Propósito
```

## Ya hecho (cristalización, 26-07-19)

- Decisiones **0007** (rename+realcance) y **0008** (lints co-ubicados) registradas.
- Glosario: concepto **Herramienta** agregado; def de **Subsistema** actualizada (`scripts`→`herramientas`).
- Descripción coloquial barrida: decisión 0001, CLAUDE.md objetivo, README (el "herramientas para agentes" viejo significaba "funcionalidades/subsistemas"; liberó la palabra).

## Fase 2a — repo-local `.claude/` (HECHA, 26-07-19, lints verdes)

- 8 lints movidos con `git mv` a su subsistema (`.claude/<X>/lint-<X>/`); `lint-harness` + `lint-herramientas` (ex `lint-scripts`) → `.claude/herramientas/`. `.claude/scripts/` disuelto.
- `scripts/INDICE.md` → `herramientas/INDICE.md` con las 5 columnas (Herramienta | Tipo | Qué hace | Cómo se invoca | Estado); filas reales `lint-harness` + `lint-herramientas`.
- `lint-herramientas.js` reescrito: default `.claude/herramientas`, [3] tolera links externos (skill/MCP), [4] valida cualquier ruta de lint `.claude/**/*.js` en settings.
- Hook `settings.json` re-ruteado a `.claude/planes/lint-planes/`. `feedback_scripts`→`feedback_herramientas` (modelo nuevo) + puntero MEMORIA.md + wikilink `[[scripts]]`→`[[herramientas]]`.
- Todas las rutas de lint re-ruteadas en CLAUDE.md, los 8 README y las memorias vivas.
- **Descubierto y arreglado:** los lints **recursivos** (`lint-memoria`, `lint-conocimiento`) levantaban su propio `lint-<sub>/README.md` como contenido → `walk()` ahora saltea dirs `lint-*`. Los no-recursivos (glosario, decisiones, planes, preferencias) no lo necesitan. **Este fix debe ir a 2b** (las versiones de esos dos lints en `funcionalidades/`).

## Fase 2b — harness (HECHA, 26-07-19)

- Funcionalidad `funcionalidades/scripts/`→`herramientas/` re-autorada al modelo nuevo (plugin.json, README, prompt, skill `inicializar-scripts`→`inicializar-herramientas` + PLANTILLA). Autorada por mí; §Script byte-exacto verificado.
- Los 6 instaladores restantes co-ubican su lint (`.claude/<sub>/lint-<sub>/`) en sus 3 formatos; walk-guard propagado a los §Script de memoria y conocimiento; hook de planes re-ruteado en `gestion-de-planes`.
- Orquestador `setup-completo` sincronizado verbatim; `marketplace.json` + `REGISTRO.md` actualizados; junction `inicializar-scripts`→`inicializar-herramientas` recreado.
- Propagación delegada a subagente fresco (memoria de propagación); byte-exactness verificada por mí.

## Notas de implementación

- **Resultado:** `scripts`→`herramientas` completo (repo + harness). Herramientas = tools del Propósito (script/skill local/MCP); los lints pasaron a ser infra co-ubicada del Patrón de cada subsistema (0008), no Herramientas.
- **Decisiones:** 0007 (rename+realcance) y 0008 (lints co-ubicados). Glosario: concepto **Herramienta**. Descripción coloquial "herramientas para agentes" barrida de 0001/CLAUDE.md/README.
- **Bug encontrado:** los lints recursivos (`lint-memoria`, `lint-conocimiento`) levantaban su propio `lint-<sub>/README.md` como contenido → `walk()` saltea dirs `lint-*`. Propagado a repo + funcionalidades + orquestador.
- **Commits:** 2a repo-local `97dbea4`; 2b harness (este cierre).
- **Gate final verde:** los 8 lints, `lint-harness` (0 hallazgos, incl. verbatim entre plantillas), `claude plugin validate .` (passed), byte-check de 20 bloques js embebidos (0 divergentes), grep de control sin refs vivas a `scripts`.
- **Trampa del hook** (`settings.json`) verificada: apunta a `.claude/planes/lint-planes/`.
- Históricos (`ejecutados/`, memorias narrativas) no reescritos.
