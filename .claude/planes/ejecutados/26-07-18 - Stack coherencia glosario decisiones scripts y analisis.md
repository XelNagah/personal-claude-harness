# Stack de coherencia semántica y decisional: glosario, decisiones, scripts + análisis

**Plan cerrado: 26-07-18 · Ejecutado: 26-07-18** (commits `7db0666` + `aebfb9c`). Cerrado y aprobado tras la sesión de análisis; reemplaza al placeholder previo del 26-07-17. Implementado el mismo día.

## Objetivo

Sumar al harness un **stack de coherencia** para repos de propósito general (no solo software): un **glosario** y un **registro de decisiones** que se consulten al planificar/analizar, la **gestión de scripts**, y una **skill de análisis** que interroga un plan hasta llegar a acuerdo. Reemplaza `grill-with-docs` (mattpocock) y la copia suelta `analizar-con-docs`; absorbe `/analizar-plan` (oficina).

## Decisiones cerradas

- **D1** — Convención propia bajo `.claude/`, en español. No adoptar `CONTEXT.md`/`docs/adr/` de mattpocock.
- **D2** — Glosario como **carpeta + tabla-índice + detalle opcional + lint**. `INDICE.md` es una tabla `Concepto | Definición | Alias | Detalle`: lo simple se define en la fila, lo complejo (ej. una FECE con fórmulas/ejemplos) linkea a una página `<slug>.md` propia. **Alias registrados, no prohibidos** (se identifican para mapear "birra/chela = cerveza", no se vetan). _(Reemplaza el "canónico simple con _Evitar_" original, más el formato revisado el 26-07-18.)_
- **D3** — Ortogonales sobre `memoria-local` (grafo plano). La skill `planificar` consume glosario + decisiones + conocimiento (la "sabiduría del repo"); dependencia en uso, no en instalación; degrada si faltan.
- **D4** — `scripts` posee la convención `.claude/scripts/<tool>/` + registro + integridad. Refactor: sacarla de la memoria de `conocimiento`.
- **D5** — Las 3 convenciones al setup base (orquestador instala 8). La skill `planificar` es global, no se instala por-repo.
- **D6** — Lint para las **tres** convenciones: `glosario` (links de detalle, huérfanos, colisión de alias), `decisiones` (numeración, índice, superseded), `scripts` (README por tool, registro, refs por ruta). _(Glosario ganó lint al adoptar el formato tabla+detalle.)_
- **D7** — Registro de decisiones **NO "ADR"** (se cae la "A"), **misma estructura que glosario** (tabla `INDICE.md` + páginas de detalle para las complejas + lint). Acotado a lo **estructural al propósito del repo** (define cómo es/qué hace, o elige un camino que condiciona el futuro); NO operativas triviales ("busqué en internet"). La "A" hacía ese acotamiento; se generaliza a "estructural". Va en `.claude/decisiones/` (no es doc pública de software → no va en raíz).
- **D8** — 4ª funcionalidad `planificar` (skill `/planificar`, ex `analizar-plan`): "entender qué hacer tomando en cuenta la sabiduría del repo". Un loop (interrogar hasta acuerdo, para *descubrir* el qué) + dos lentes (coherencia contra glosario/decisiones/conocimiento; crítica de calidad: problemas/faltantes/oportunidades/sobreingeniería). Corre en diseño y post-plan-mode. Merge de grill-with-docs + analizar-con-docs + /analizar-plan. En repos en inglés, alias `/planify` (para distinguir del `/plan` nativo).

## Las cuatro funcionalidades

### 1. `glosario` (skill `inicializar-glosario`) ✅ construida
`.claude/glosario/INDICE.md` (tabla `Concepto | Definición | Alias | Detalle`) + páginas `<slug>.md` para conceptos complejos · lint `.claude/scripts/lint-glosario/lint-glosario.js` (links de detalle, huérfanos, colisión de alias) · memoria `feedback_glosario.md` (+ `[[flujo-planes]]`) · sección CLAUDE.md "Glosario del proyecto".

### 2. `decisiones` (skill `inicializar-decisiones`) ✅ construida
Estructura espejo del glosario: `.claude/decisiones/INDICE.md` (tabla `N° | Decisión | Fecha | Estado | Detalle`) + páginas `NNNN-slug.md` para las complejas · lint `.claude/scripts/lint-decisiones/lint-decisiones.js` (numeración, links de detalle, huérfanos, superseded) · memoria `feedback_decisiones.md` · sección "Decisiones del proyecto". Criterio: solo estructural al propósito.

### 3. `scripts` (skill `inicializar-scripts`) ✅ construida
Registro-tabla `.claude/scripts/INDICE.md` (`Tool | Qué hace | Cómo se corre | Estado`) + cada `<tool>/` con README (la ficha; origen opcional ahí) · lint `.claude/scripts/lint-scripts/lint-scripts.js` (README por tool, tool en índice, filas colgadas, refs por ruta en settings) · memoria `feedback_scripts.md` (absorbe lo de scripts de `feedback_base_conocimiento.md`) · sección "Scripts del proyecto". Incluye migración del "cementerio".

### 4. `planificar` (skill `/planificar`) — operacional, no instalador
Skill de grilling merge, español, propósito general, consume la "sabiduría del repo" (`.claude/glosario` + `.claude/decisiones` + `.claude/conocimiento`). "Entender qué hacer" vía interrogatorio hasta acuerdo + crítica de calidad. No entra al orquestador. Base: portar `analizar-con-docs` repuntado + lente de crítica de `/analizar-plan`. Alias `/planify` en repos en inglés.

## Refactor `conocimiento` (D4)
Sacar la convención de scripts de: `funcionalidades/conocimiento/skills/.../PLANTILLA.md` (§Memoria), `funcionalidades/conocimiento/prompt.md` (paso 3), `funcionalidades/setup-completo/{prompt.md, .../PLANTILLA.md}`. En este repo: quitar scripts de `.claude/memoria/feedback_base_conocimiento.md`, crear `.claude/memoria/feedback_scripts.md`.

## Limpieza
- Quitar `grill-with-docs` de uso (el user lo desinstala).
- Superar `analizar-con-docs` (copia suelta en `~/.claude/skills/`).
- ⚠️ Reconciliar `/analizar-plan` (oficina) — **bloqueado**, no legible desde esta máquina. Al ejecutar, el user pega su texto.

## Cableado (repo harness)
`marketplace.json` +4 · orquestador `setup-completo` suma glosario/decisiones/scripts (verbatim) en orden preferencias→memoria→planes→commits→conocimiento→glosario→decisiones→scripts · `REGISTRO.md` +4 filas · conteos 6→10 en README/CLAUDE.md · junctions ×4 · aplicar setup a este repo · `claude plugin validate .` verde.

## Secuencia de ejecución
1. Construir `glosario`, `decisiones`, `scripts` (desbloqueadas) + sus lints + refactor conocimiento.
2. Cableado (marketplace, orquestador, REGISTRO, conteos, junctions).
3. Aplicar a este repo.
4. **`planificar` al final**, cuando el user traiga `/analizar-plan` (oficina).

## Verificación
`claude plugin validate .` (10 plugins) · `inicializar-custom` en scratch instala 8 · regresión lint-decisiones (hueco de numeración, fuera de índice) · regresión lint-scripts (tool sin README, fuera de registro, ref por ruta rota) · dueño único de scripts (grep en conocimiento) · skill análisis interroga hasta acuerdo + marca conflicto de término y decisión contradictoria · barrido conteos 6→10 · commits español sin Co-Authored-By.

## Notas de implementación

- **26-07-18, commit `7db0666`** — construidas y aplicadas glosario, decisiones y scripts (funcionalidades + lints probados + orquestador + REGISTRO/README/CLAUDE + junctions + aplicado a este repo). `claude plugin validate .` verde con 9 plugins; los 4 lints corren limpios sobre este repo.
- **Divergencias vs lo planificado:**
  - Glosario/decisiones: formato revisado a **tabla + detalle opcional** (no "canónico simple") y **alias registrados, no prohibidos** (pedido del user).
  - Decisiones: criterio acotado a lo **estructural al propósito** (no solo "elige entre varias").
  - Naming: **todos los índices se llaman `INDICE.md`** (unificado; el directorio dice qué son).
  - Skill de análisis renombrada a **`planificar`** (funcionalidad + skill).
- **26-07-18 — `planificar` construida** (funcionalidad + skill + prompt agnóstico + marketplace + junction + docs a 10). No estaba bloqueada: el `/analizar-plan` de la oficina era pulido opcional, no requisito (mala caracterización mía). Incorpora: recorrer el árbol de decisión, agrupar preguntas independientes en tandas (dejar los cruces que mandan de a una), cola final en una tanda, y **siempre sugerir la respuesta recomendada** (sugerencia para agilizar, NO default que se toma solo — el usuario siempre responde).
- **Sin pendientes.** El `/analizar-plan` de la oficina era exactamente la mirada de crítica (problemas, faltantes, oportunidades, sobreingeniería) que ya quedó en `planificar` — no había nada extra que fusionar. Plan 100% implementado.
- Sin pushear todavía (commits locales `7db0666` + `aebfb9c`).
