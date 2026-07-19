# Completar la cobertura de lint mecánico: memoria + preferencias

**Estado: Ejecutado · Creado 26-07-18.** Prerequisito del rework del README (para que describa el patrón completo, sin excepciones). Surgió en la sesión de `/planificar` del rework del README.

## Objetivo

Cerrar los dos huecos de **lint mecánico** para que *todo subsistema que persiste estado* tenga integridad estructural chequeada — la capa mecánica de la [decisión 0003](../../decisiones/INDICE.md). Deja el patrón índice+entradas+lint uniforme y el README puede afirmarlo sin hedging.

## Contexto (de la sesión de análisis)

Hoy 5 subsistemas tienen lint (`conocimiento`, `planes`, `glosario`, `decisiones`, `scripts`). Faltan dos:

- **`memoria`** — tiene `MEMORIA.md` + `.md` pero **no tiene lint**. Es el único subsistema de acumulación sin él.
- **`preferencias`** — un solo `PREFERENCIAS.md` (Base/Adaptaciones). No sigue el patrón índice+entradas, pero un lint **estructural** aporta (headers presentes, `@import` resuelve). El caso "preferencias mutuamente excluyentes" que motivó esto es **semántico**, NO lo cacha este lint — va al plan de capa semántica.

`estilo-commits` no necesita lint propio: vive dentro de `memoria/`, lo cubre `lint-memoria`. `setup-completo` y `planificar` quedan afuera: operacionales, no persisten estado.

## Alcance

### 1. `lint-memoria` (dentro de la funcionalidad `memoria-local`)
Calcado de `lint-conocimiento`: refs rotas, índice (`MEMORIA.md`) incompleto, `.md` huérfanos, frontmatter faltante/ inválido (`name`/`description`/`metadata.type`).
- Script: `.claude/scripts/lint-memoria/lint-memoria.js` (mecánico, sin LLM, sin red).
- Bundle en la funcionalidad `memoria-local` (skill + prompt + PLANTILLA si aplica): la init ahora también instala el lint.
- Sección "Memoria del proyecto" en CLAUDE.md destino: agregar el "correr el lint al cerrar".

### 2. `lint-preferencias` (dentro de la funcionalidad `preferencias-trabajo`)
Estructural: headers `## Base` y `## Adaptaciones` presentes, `@import` de `PREFERENCIAS.md` resuelve en CLAUDE.md, formato intacto. **No** detecta contradicciones (eso es semántico).
- Script: `.claude/scripts/lint-preferencias/lint-preferencias.js`.
- Bundle en la funcionalidad `preferencias-trabajo`.

### 3. Cableado (repo harness)
- Orquestador `setup-completo`: sumar ambos lints (textos verbatim) donde corresponda.
- `REGISTRO.md`: reflejar que `memoria-local` y `preferencias-trabajo` ahora traen lint.
- `.claude/scripts/INDICE.md`: +2 filas (`lint-memoria`, `lint-preferencias`).
- Aplicar a este repo (dogfooding): crear ambos lints en `.claude/scripts/`, correrlos.
- Junctions si hiciera falta (los lints van dentro de skills ya enlazados).

## Decisiones que aplica
[0003](../../decisiones/INDICE.md) (dos capas de integridad; mecánica obligatoria para subsistemas con estado) · [0002](../../decisiones/INDICE.md) (patrón de subsistema).

## Verificación
- `node .claude/scripts/lint-memoria/lint-memoria.js` verde sobre este repo; regresión: `.md` fuera de índice, índice apuntando a archivo borrado, frontmatter faltante.
- `node .claude/scripts/lint-preferencias/lint-preferencias.js` verde; regresión: header faltante, `@import` roto.
- `node .claude/scripts/lint-harness/lint-harness.js` verde (coherencia disco↔marketplace↔REGISTRO, conteos).
- `claude plugin validate .` verde.
- `inicializar-custom` en scratch instala ambos lints.

## Notas de implementación

- **26-07-18, commit `9e3a4ac`** — `lint-memoria` + `lint-preferencias` escritos y probados sobre este repo (regresión con fixtures rotos), README + fila en `scripts/INDICE.md` + pasos de lint en `CLAUDE.md`.
- **26-07-18, commit `4ff41ee`** — propagados a las funcionalidades `memoria-local` / `preferencias-trabajo` + orquestador (`§Script` byte-exacto) + `REGISTRO.md`. Verde: `lint-harness`, `lint-scripts`, `claude plugin validate`.
- Ejecutado junto con el plan de gobernanza de terminología (ambos tocaban `preferencias-trabajo`).
