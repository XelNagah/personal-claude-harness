# Plantilla de preferencias

## §Semilla — `.claude/preferencias/PREFERENCIAS.md`

La sección **Base** es verbatim y versionada: el leveleo la actualiza cuando su versión es vieja. **Adaptaciones** es del repo: nunca se toca. Al editar la Base acá, **incrementar la versión** — es lo que permite a la reconciliación distinguir "base desactualizada" (actualizar) de "adaptación deliberada" (respetar).

```markdown
# Preferencias

Reglas de conducta del agente en este repo. Siempre en contexto (importado desde CLAUDE.md). La sección **Base** viene del harness y se actualiza al levelear (no editarla acá: los ajustes de este repo van en **Adaptaciones**, que el leveleo nunca toca).

## Base (harness v2)

**Comunicación:**

- Al preguntar por una decisión o analizar alternativas, dar SIEMPRE ejemplos concretos de cada postura (numéricos si aplica): cómo es ahora vs. cómo quedaría y por qué, encadenando consecuencias ("A ⇒ B; si no fuera B ⇒ no A porque X"). Objetivo: ubicar inmediatamente al lector en la mecánica relevante sin que tenga que reconstruir contexto.
- Ante un informe o visualización de **formato nuevo**: mostrar primero el esqueleto con datos de juguete marcados como DUMMY, acordar la representación, recién después calcular en serio. **Nunca re-producir completo un formato rechazado**: volver al esqueleto y realinear.
- Tareas en background: esperar la notificación de finalización; no reportar ni consultar estado a cada rato — solo ante sospecha de cuelgue.

**Principios de trabajo:**

- Conceptual antes que implementación. Ante ambigüedad de diseño, preguntar antes de asumir. Minimizar cambios sustractivos.
- Iterar de alto a bajo nivel: interfaces y contratos antes que implementación.
- Nomenclatura en español para el dominio; inglés solo para infraestructura técnica.
- Cero invención de datos: lo que no salga de una fuente verificada se marca como faltante o como interpretación propia.
- Terminología: no acuñar términos del dominio por cuenta propia; preferir las palabras del usuario. **Español corriente en todo**: nada de palabras inventadas o raras (aunque suenen técnicas), ni en prosa ni en diagramas — no solo en los registros. **Gate duro en registros canónicos** (glosario, decisiones): ningún término acuñado por el agente se asienta sin ratificación del usuario. En prosa/diagramas se puede usar, marcado como propuesto.

## Adaptaciones de este repo

(ninguna todavía — agregar acá lo específico de este proyecto)
```

## §Sección de `.claude/CLAUDE.md` — "Preferencias (siempre cargadas)"

```markdown
## Preferencias (siempre cargadas)

@preferencias/PREFERENCIAS.md

Al tocar las preferencias, correr el lint estructural **desde la raíz del repo** (chequea secciones Base/Adaptaciones + el `@import`):

​```bash
node .claude/scripts/lint-preferencias/lint-preferencias.js
​```
```

(Ruta relativa al CLAUDE.md: si está en la raíz del repo, `@.claude/preferencias/PREFERENCIAS.md`.)

## §Bases anteriores (para detectar "versión vieja" en la reconciliación)

Bloques que versiones previas del harness escribían inline en CLAUDE.md. Si el repo tiene estos textos **verbatim**, son base desactualizada (migrar sin preguntar); si difieren, hay adaptación del user (migrar el diff a Adaptaciones y reportar).

**v0 — sección "Preferencias de comunicación":**

> Al preguntar por una decisión o analizar alternativas, dar SIEMPRE ejemplos concretos de cada postura (numéricos si aplica): cómo es ahora vs. cómo quedaría y por qué, encadenando consecuencias ("A ⇒ B; si no fuera B ⇒ no A porque X"). Objetivo: ubicar inmediatamente al lector en la mecánica relevante sin que tenga que reconstruir contexto.

**v0 — sección "Principios de trabajo":**

- Conceptual antes que implementación. Ante ambigüedad de diseño, preguntar antes de asumir. Minimizar cambios sustractivos.
- Iterar de alto a bajo nivel: interfaces y contratos antes que implementación.
- Nomenclatura en español para el dominio; inglés solo para infraestructura técnica.
- Cero invención de datos: lo que no salga de una fuente verificada se marca como faltante o como interpretación propia.

## §Script — `.claude/scripts/lint-preferencias/lint-preferencias.js`

Contenido exacto (Node, sin dependencias, sin red):

```js
#!/usr/bin/env node
// Lint estructural de preferencias: PREFERENCIAS.md con Base/Adaptaciones + @import en CLAUDE.md. Sin LLM, sin red.
// NO detecta contradicciones semanticas (eso es la capa semantica, a pedido).
// Uso: node lint-preferencias.js [<carpeta .claude>]   (default: .claude)
const fs = require('fs'), path = require('path');
const claudeDir = path.resolve(process.argv[2] || '.claude');
const prefFile = path.join(claudeDir, 'preferencias', 'PREFERENCIAS.md');
const problems = [];

if (!fs.existsSync(prefFile)) {
  problems.push('no existe preferencias/PREFERENCIAS.md');
} else {
  const txt = fs.readFileSync(prefFile, 'utf8');
  if (!/^##\s+Base\b/m.test(txt)) problems.push('falta la seccion "## Base"');
  if (!/^##\s+Adaptaciones\b/mi.test(txt)) problems.push('falta la seccion "## Adaptaciones"');
  if (txt.trim().length < 50) problems.push('PREFERENCIAS.md casi vacio (sin contenido util)');
}

// @import en CLAUDE.md (las preferencias tienen que estar siempre en contexto)
const claudeMd = path.join(claudeDir, 'CLAUDE.md');
if (fs.existsSync(claudeMd)) {
  const c = fs.readFileSync(claudeMd, 'utf8');
  if (!/@preferencias\/PREFERENCIAS\.md/.test(c)) {
    problems.push('CLAUDE.md no importa @preferencias/PREFERENCIAS.md (no queda en contexto)');
  }
} else {
  problems.push('no existe CLAUDE.md (no se pudo verificar el @import)');
}

console.log(`== LINT PREFERENCIAS: ${prefFile} ==`);
console.log(`hallazgos: ${problems.length}\n`);
if (!problems.length) console.log('    (ok)');
else problems.forEach(p => console.log(`    [x] ${p}`));
```
