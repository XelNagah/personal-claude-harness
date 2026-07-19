# Plantilla de la gestión de scripts

Textos verbatim que la skill escribe. (El formato general de una memoria lo define la funcionalidad `memoria-local`.) Mismo patrón que glosario/decisiones: un registro-tabla + una ficha (el README) por tool.

## §Índice — semilla de `.claude/scripts/INDICE.md`

Si el archivo no existe, crearlo con este contenido (tabla vacía — sin filas de ejemplo, para que el lint no las tome como tools reales):

```markdown
# Scripts del proyecto

Registro de las herramientas del repo. Cada script vive en su carpeta `<tool>/` con un `README.md` (su ficha); nunca suelto. Una fila por tool. Ordena el "cementerio de scripts": qué es cada uno, cómo se corre, si sigue vigente.

- **Tool** — link a la carpeta `<tool>/` (adentro, el README y el código).
- **Qué hace** — una línea.
- **Cómo se corre** — el comando de invocación.
- **Estado** — `vigente`, `experimental` u `obsoleto` (los obsoletos se pueden depurar).

| Tool | Qué hace | Cómo se corre | Estado |
|------|----------|---------------|--------|
```

## §README-tool — plantilla de `.claude/scripts/<tool>/README.md`

```markdown
# <tool>

**Qué hace:** <una o dos frases>.
**Cómo se corre:** `<comando>` <args si los hay>.
**Estado:** vigente | experimental | obsoleto.
**Referenciado por:** <settings.local.json / .gitignore / hook / otro script / nadie> — quién lo invoca por ruta.
**Dependencias:** <runtime, libs, credenciales que necesita>.
**Origen (opcional):** <qué necesidad, plan o decisión lo generó — solo si aporta>.
**Notas (opcional):** <lo que haga falta>.
```

## §Memoria — `.claude/memoria/feedback_scripts.md`

```markdown
---
name: scripts
description: Convención de scripts del repo — cada tool en .claude/scripts/<tool>/ con README; registro tabla en INDICE.md; lint; cuidado con refs por ruta en settings/.gitignore/hooks.
metadata:
  type: feedback
---

Las herramientas/scripts del repo viven en `.claude/scripts/<tool>/`: cada script en su propia carpeta (nunca suelto), con un `README.md` que dice qué hace, cómo se corre y qué lo referencia. El registro `.claude/scripts/INDICE.md` es una tabla (Tool | Qué hace | Cómo se corre | Estado) que los lista a todos.

**Why:** que la carpeta de scripts no se vuelva un cementerio de archivos sin saber qué son, de dónde salieron ni cómo se usan. Ubicación determinística + registro escaneável + ficha por tool.

**How to apply:**

1. Todo script nuevo va en `.claude/scripts/<tool>/` con su `README.md`. Nunca suelto en `scripts/`.
2. Registrarlo en `.claude/scripts/INDICE.md` (una fila). Marcar `Estado`; los `obsoleto` se pueden depurar.
3. ⚠️ **Refs por ruta:** un script referenciado por ruta en `settings.local.json`/`settings.json` (regla de permiso), en `.gitignore` o en un hook NO se mueve/renombra alegremente — rompe el match por prefijo exacto y se pierde la pre-autorización (en headless, denegación directa). Antes de mover, grep su ruta; si aparece, actualizar la referencia en el mismo paso. Anotar quién lo referencia en el README del tool.
4. **Al cerrar** una tarea que tocó scripts, correr el lint: `node .claude/scripts/lint-scripts/lint-scripts.js` (README por tool, registro completo, filas colgadas, refs por ruta en settings).

Otras memorias, planes o conocimiento pueden referenciar un tool por su ruta explicando cómo usarlo en su contexto.

Relacionado: [[flujo-planes]], [[base-conocimiento]].
```

## §Sección CLAUDE.md — "Scripts del proyecto"

```markdown
## Scripts del proyecto

Las herramientas del repo viven en [`scripts/`](scripts/): cada script en su carpeta `<tool>/` con un `README.md`, listadas en el registro [`scripts/INDICE.md`](scripts/INDICE.md) (tabla Tool | Qué hace | Cómo se corre | Estado). Nunca sueltos. ⚠️ Un script referenciado por ruta en `settings`, `.gitignore` o un hook no se mueve sin actualizar esa referencia (rompe el match por prefijo). Al cerrar una tarea que tocó scripts, correr el lint **desde la raíz del repo**:

​```bash
node .claude/scripts/lint-scripts/lint-scripts.js
​```

Detalle de la convención en la memoria [`feedback_scripts.md`](memoria/feedback_scripts.md).
```

## §Script — `.claude/scripts/lint-scripts/lint-scripts.js`

Contenido exacto (Node, sin dependencias, sin red):

```js
#!/usr/bin/env node
// Lint del registro de scripts: README por tool, tool en indice, filas colgadas, refs por ruta en settings. Sin LLM, sin red.
// Uso: node lint-scripts.js [<carpeta scripts>]   (default: .claude/scripts)
const fs = require('fs'), path = require('path');
const root = path.resolve(process.argv[2] || '.claude/scripts');
const idxPath = path.join(root, 'INDICE.md');
const idx = fs.existsSync(idxPath) ? fs.readFileSync(idxPath, 'utf8') : '';

// subdirectorios = tools (cada script en su carpeta)
const tools = fs.existsSync(root)
  ? fs.readdirSync(root, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name)
  : [];

// [1] README por tool
const sinReadme = tools.filter(t => !fs.existsSync(path.join(root, t, 'README.md')));

// [2] tool fuera del indice
const fueraIndice = tools.filter(t => !idx.includes(t));

// [3] filas del indice que apuntan a un directorio inexistente
const toolSet = new Set(tools), colgadas = [];
for (const line of idx.split('\n')) {
  const t = line.trim();
  if (!t.startsWith('|')) continue;
  const cells = t.split('|').slice(1, -1).map(c => c.trim());
  if (cells.length < 2) continue;
  const c0 = cells[0];
  if (/^:?-{2,}:?$/.test(c0.replace(/\s/g, ''))) continue;    // separador
  if (/^tool$/i.test(c0.replace(/[*\s]/g, ''))) continue;      // header
  const m = /\]\(([^)]+?)\/?\)/.exec(c0);                       // link [x](dir/)
  const name = (m ? m[1] : c0).replace(/[*`\[\]]/g, '').replace(/\/$/, '').trim();
  if (name && !toolSet.has(name)) colgadas.push(name);
}

// [4] refs por ruta a scripts en settings que no resuelven
const repoRoot = path.resolve(root, '..', '..');   // .claude/scripts -> raiz del repo
const refsRotas = [];
for (const sf of ['.claude/settings.local.json', '.claude/settings.json']) {
  const abs = path.join(repoRoot, sf);
  if (!fs.existsSync(abs)) continue;
  const txt = fs.readFileSync(abs, 'utf8');
  const re = /([.\w/-]*scripts\/[\w./-]+?\.(?:js|sh|py|mjs|cjs|ts))/g;
  let m;
  while ((m = re.exec(txt))) {
    const p = m[1], cand = path.isAbsolute(p) ? p : path.join(repoRoot, p);
    if (!fs.existsSync(cand)) refsRotas.push([sf, p]);
  }
}

console.log(`== LINT SCRIPTS: ${root} ==`);
console.log(`tools: ${tools.length}\n`);
console.log(`[1] SIN README (${sinReadme.length}):`);
sinReadme.forEach(t => console.log(`    ${t}/`));
if (!sinReadme.length) console.log('    (todos tienen README)');
console.log(`\n[2] FUERA DEL INDICE (${fueraIndice.length}):`);
fueraIndice.forEach(t => console.log(`    ${t}/`));
if (!fueraIndice.length) console.log('    (completo)');
console.log(`\n[3] FILAS COLGADAS (${colgadas.length}):`);
colgadas.forEach(c => console.log(`    ${c}   [directorio no existe]`));
if (!colgadas.length) console.log('    (ninguna)');
console.log(`\n[4] REFS POR RUTA ROTAS EN SETTINGS (${refsRotas.length}):`);
refsRotas.forEach(([f, p]) => console.log(`    ${f}  ->  ${p}   [no existe]`));
if (!refsRotas.length) console.log('    (ninguna)');
```
