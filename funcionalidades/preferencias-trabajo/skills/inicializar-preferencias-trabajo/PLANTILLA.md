# Plantilla de preferencias

## §Contenido inicial — `.claude/preferencias/PREFERENCIAS.md`

La sección **Base** es textual y versionada: el nivelado la actualiza cuando su versión es vieja. **Adaptaciones** es del repo: nunca se toca. Al editar la Base acá, **incrementar la versión** — es lo que permite a la reconciliación distinguir "base desactualizada" (actualizar) de "adaptación deliberada" (respetar).

```markdown
# Preferencias

Reglas de conducta del agente en este repo. Siempre en contexto (importado desde AGENTS.md). La sección **Base** viene del harness y se actualiza al nivelar (no editarla acá: los ajustes de este repo van en **Adaptaciones**, que el nivelado nunca toca).

## Base (harness v3)

**Comunicación:**

- Al preguntar por una decisión o analizar alternativas, dar SIEMPRE ejemplos concretos de cada postura (numéricos si aplica): cómo es ahora vs. cómo quedaría y por qué, encadenando consecuencias ("A ⇒ B; si no fuera B ⇒ no A porque X"). Objetivo: ubicar inmediatamente al lector en la mecánica relevante sin que tenga que reconstruir contexto.
- Ante un informe o visualización de **formato nuevo**: mostrar primero el esqueleto con datos de juguete marcados como DUMMY, acordar la representación, recién después calcular en serio. **Nunca re-producir completo un formato rechazado**: volver al esqueleto y realinear.
- Tareas en background: esperar la notificación de finalización; no reportar ni consultar estado a cada rato — solo ante sospecha de cuelgue.

**Principios de trabajo:**

- Conceptual antes que implementación. Ante ambigüedad de diseño, preguntar antes de asumir. Minimizar cambios sustractivos.
- Iterar de alto a bajo nivel: interfaces y contratos antes que implementación.
- Nomenclatura en español para el dominio; inglés solo para infraestructura técnica.
- Cero invención de datos: lo que no salga de una fuente verificada se marca como faltante o como interpretación propia.
- Terminología: no acuñar términos del dominio por cuenta propia; preferir las palabras del usuario. **Español corriente en todo**: nada de palabras inventadas o raras (aunque suenen técnicas), ni en texto plano ni en diagramas — no solo en los registros. **Control duro en registros canónicos** (glosario, decisiones): ningún término acuñado por el agente se asienta sin ratificación del usuario. En texto plano/diagramas se puede usar, marcado como propuesto.

## Adaptaciones de este repo

(ninguna todavía — agregar acá lo específico de este proyecto)
```

## §Sección de `AGENTS.md` — "Preferencias (siempre cargadas)"

```markdown
## Preferencias (siempre cargadas)

@.claude/preferencias/PREFERENCIAS.md

Al tocar las preferencias, correr el lint estructural **desde la raíz del repo** (chequea secciones Base/Adaptaciones + el `@import`):

​```bash
node .claude/preferencias/lint-preferencias/lint-preferencias.js
​```
```

(El prefijo `.claude/` es porque `AGENTS.md` vive en la raíz — la ruta del `@import` es relativa al archivo que importa. Layout legacy con `CLAUDE.md` dentro de `.claude/`: `@preferencias/PREFERENCIAS.md`.)

## §Bases anteriores (para detectar "versión vieja" en la reconciliación)

Bloques que versiones previas del harness escribían inline en CLAUDE.md. Si el repo tiene estos textos **textuales**, son base desactualizada (migrar sin preguntar); si difieren, hay adaptación del user (migrar el diff a Adaptaciones y reportar).

**v0 — sección "Preferencias de comunicación":**

> Al preguntar por una decisión o analizar alternativas, dar SIEMPRE ejemplos concretos de cada postura (numéricos si aplica): cómo es ahora vs. cómo quedaría y por qué, encadenando consecuencias ("A ⇒ B; si no fuera B ⇒ no A porque X"). Objetivo: ubicar inmediatamente al lector en la mecánica relevante sin que tenga que reconstruir contexto.

**v0 — sección "Principios de trabajo":**

- Conceptual antes que implementación. Ante ambigüedad de diseño, preguntar antes de asumir. Minimizar cambios sustractivos.
- Iterar de alto a bajo nivel: interfaces y contratos antes que implementación.
- Nomenclatura en español para el dominio; inglés solo para infraestructura técnica.
- Cero invención de datos: lo que no salga de una fuente verificada se marca como faltante o como interpretación propia.

**v2 — difiere de la v3 solo en el bullet de Terminología** (el resto de la Base es idéntico). Si el repo trae este texto, es base desactualizada: reemplazar la Base entera por la v3 sin preguntar.

> - Terminología: no acuñar términos del dominio por cuenta propia; preferir las palabras del usuario. **Español corriente en todo**: nada de palabras inventadas o raras (aunque suenen técnicas), ni en prosa ni en diagramas — no solo en los registros. **Gate duro en registros canónicos** (glosario, decisiones): ningún término acuñado por el agente se asienta sin ratificación del usuario. En prosa/diagramas se puede usar, marcado como propuesto.

Además, la v2 abría el archivo con "se actualiza al levelear (…) que el leveleo nunca toca"; la v3 dice "al nivelar (…) que el nivelado nunca toca".

## §Script — `.claude/preferencias/lint-preferencias/lint-preferencias.js`

Contenido exacto (Node, sin dependencias, sin red):

```js
#!/usr/bin/env node
// Lint estructural de preferencias: PREFERENCIAS.md con Base/Adaptaciones + @import en el punto de entrada (AGENTS.md/CLAUDE.md). Sin LLM, sin red.
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

// @import en el punto de entrada (las preferencias tienen que estar siempre en contexto).
// Fuente: AGENTS.md en la raiz; layouts legacy: CLAUDE.md en la raiz o dentro de <config>/.
const root = path.dirname(claudeDir);
const entradas = [path.join(root, 'AGENTS.md'), path.join(root, 'CLAUDE.md'), path.join(claudeDir, 'CLAUDE.md')]
  .filter(f => fs.existsSync(f));
if (entradas.length) {
  // el import lleva el prefijo segun donde viva el punto de entrada: @preferencias/... o @.claude/preferencias/...
  const importa = entradas.some(f => /@[\w./-]*preferencias\/PREFERENCIAS\.md/.test(fs.readFileSync(f, 'utf8')));
  if (!importa) {
    problems.push('ningun punto de entrada (AGENTS.md/CLAUDE.md) importa @preferencias/PREFERENCIAS.md (no queda en contexto)');
  }
} else {
  problems.push('no existe punto de entrada (AGENTS.md o CLAUDE.md; no se pudo verificar el @import)');
}

console.log(`== LINT PREFERENCIAS: ${prefFile} ==`);
console.log(`hallazgos: ${problems.length}\n`);
if (!problems.length) console.log('    (ok)');
else problems.forEach(p => console.log(`    [x] ${p}`));
```
