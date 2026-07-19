# Repensar la funcionalidad de `scripts` como Herramientas (Tools)

**Estado: En curso · Creado 26-07-19.** Analizado por `planificar` el 26-07-19 → acuerdo cerrado, decisiones 0007/0008 registradas, glosario actualizado. Falta la ejecución del rename físico + propagación.

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

## Falta (Fase 2b — harness: funcionalidades + orquestador)

Radio original: **126 ocurrencias de `.claude/scripts/` en 41 archivos** (2a cubrió las de `.claude/`). Históricos (`planes/ejecutados/*`) **no se tocan**.

**Delegar a subagente fresco, verificar byte-exactness (memoria de propagación):**
6. `funcionalidades/scripts/` → `funcionalidades/herramientas/` (plugin.json, README, prompt.md, skill `inicializar-scripts`→`inicializar-herramientas` + PLANTILLA). Reescribir al modelo nuevo (registro Herramientas + Tipo; el lint del subsistema va co-ubicado).
7. **Cada** funcionalidad instala su lint en su propio dir, no en `scripts/` — actualizar los 7 instaladores (prompt+SKILL+PLANTILLA) y sus rutas de lint.
8. Orquestador `setup-completo` (prompt + PLANTILLA verbatim): rutas de lint + paso `herramientas`.
9. `marketplace.json`, `REGISTRO.md`, junction `inicializar-scripts`→`inicializar-herramientas`.

**Gate final:** `lint-planes`, `lint-glosario`, `lint-decisiones`, `lint-harness`, `claude plugin validate .` — todos verdes.

## Notas de riesgo
- El hook de `settings.json` es la trampa silenciosa: verificar que corre tras el rename.
- No reescribir históricos (`ejecutados/`, memorias narrativas).
- Cambio grande; ejecutar metódico, no sweep ciego.
