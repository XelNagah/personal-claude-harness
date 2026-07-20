# Plantilla de la gestión de Herramientas

textos literales que la skill escribe. (El formato general de una memoria lo define la funcionalidad `memoria-local`.) Mismo patrón que glosario/decisiones: un registro-tabla + una ficha (el README) por tool tipo script.

## §Índice — contenido inicial de `.claude/herramientas/INDICE.md`

Si el archivo no existe, crearlo con este contenido (tabla vacía — sin filas de ejemplo, para que el lint no las tome como tools reales):

```markdown
# Herramientas del proyecto

Registro de las **Herramientas** del repo: las *tools* que el **Propósito** del repo requiere y el agente invoca para tareas repetibles. Tipos: `script`, `skill` local del repo, `MCP` local. Una fila por Herramienta. Ordena las herramientas desordenadas: qué es cada una, cómo se invoca, si sigue vigente.

> Los **lints de subsistema** (lint-memoria, lint-glosario, …) **no** van acá: son infra del Patrón de cada subsistema y viven con su subsistema (`.claude/<sub>/lint-<sub>/`). Acá solo van tools de dominio.

- **Herramienta** — nombre; si es tipo `script` con carpeta local, link a `<tool>/` (adentro, README + código). Si es `skill` o `MCP`, link a donde vive (`.claude/skills/<skill>/`, `.mcp.json`).
- **Tipo** — `script` | `skill` | `mcp`.
- **Qué hace** — una línea.
- **Cómo se invoca** — el comando (`script`), el nombre de skill que dispara el modelo (`skill`), o cómo se conecta y qué tool-calls expone (`mcp`).
- **Estado** — `vigente`, `experimental` u `obsoleto` (los obsoletos se pueden depurar).

| Herramienta | Tipo | Qué hace | Cómo se invoca | Estado |
|-------------|------|----------|----------------|--------|
```

## §README-tool — plantilla de `.claude/herramientas/<tool>/README.md` (tipo script)

```markdown
# <tool>

**Qué hace:** <una o dos frases>.
**Cómo se invoca:** `<comando>` <args si los hay>.
**Estado:** vigente | experimental | obsoleto.
**Referenciado por:** <settings.local.json / .gitignore / hook / otro script / nadie> — quién lo invoca por ruta.
**Dependencias:** <entorno de ejecución, libs, credenciales que necesita>.
**Origen (opcional):** <qué necesidad, plan o decisión lo generó — solo si aporta>.
**Notas (opcional):** <lo que haga falta>.
```

## §Memoria — `.claude/memoria/feedback_herramientas.md`

```markdown
---
name: herramientas
description: Convención de Herramientas del repo — las tools del Propósito (script/skill local/MCP local) en .claude/herramientas/ con registro INDICE.md (columna Tipo); los lints de subsistema NO son herramientas (viven con su subsistema); cuidado con refs por ruta en settings/.gitignore/hooks.
metadata:
  type: feedback
---

Las **Herramientas** del repo son las *tools* que el **Propósito** del repo requiere y el agente invoca para tareas repetibles. Tipos: `script`, `skill` local del repo, `MCP` local. Viven catalogadas en `.claude/herramientas/INDICE.md` — tabla (Herramienta | Tipo | Qué hace | Cómo se invoca | Estado). Cada fila apunta a donde vive la tool: un `script` en su carpeta `<tool>/` bajo herramientas, una `skill` en `.claude/skills/<skill>/`, un `MCP` en `.mcp.json`.

**Los lints de subsistema NO son Herramientas:** son infra del Patrón de cada subsistema (índice + entradas + lint) y viven con su subsistema (`.claude/<sub>/lint-<sub>/`). Acá solo van tools de dominio.

**Why:** que la colección de tools del Propósito no se vuelva un conjunto de herramientas desordenadas sin saber qué son, de dónde salieron ni cómo se usan. Ubicación determinística + registro escaneable + ficha por tool.

**How to apply:**

1. Toda Herramienta nueva va al registro `.claude/herramientas/INDICE.md` (una fila) con su `Tipo`. Un `script` vive en `.claude/herramientas/<tool>/` con su `README.md` (nunca suelto); una `skill`/`MCP` se apunta a donde vive.
2. Marcar `Estado`; los `obsoleto` se pueden depurar.
3. ⚠️ **Refs por ruta:** una tool referenciada por ruta en `settings.local.json`/`settings.json` (regla de permiso), en `.gitignore` o en un hook NO se mueve/renombra alegremente — rompe el match por prefijo exacto y se pierde la pre-autorización (en headless, denegación directa). Antes de mover, grep su ruta; si aparece, actualizar la referencia en el mismo paso.
4. **Al cerrar** una tarea que tocó Herramientas, correr el lint: `node .claude/herramientas/lint-herramientas/lint-herramientas.js` (README por herramienta local, registro completo, filas colgadas, refs por ruta de lint en settings).

Otras memorias, planes o conocimiento pueden referenciar una tool por su ruta explicando cómo usarla en su contexto.

Relacionado: [[flujo-planes]], [[base-conocimiento]].
```

## §Sección de `AGENTS.md` — "Herramientas del proyecto"

```markdown
## Herramientas del proyecto

Las **Herramientas** del repo — las *tools* que el Propósito requiere (tipos `script`, `skill` local, `MCP` local) — viven en [`herramientas/`](.claude/herramientas/), listadas en el registro [`herramientas/INDICE.md`](.claude/herramientas/INDICE.md) (tabla Herramienta | Tipo | Qué hace | Cómo se invoca | Estado). Los **lints de subsistema no son Herramientas**: son infra del Patrón y viven con su subsistema (`.claude/<sub>/lint-<sub>/`, decisión 0008). ⚠️ Una tool referenciada por ruta en `settings`, `.gitignore` o un hook no se mueve sin actualizar esa referencia (rompe el match por prefijo). Al cerrar una tarea que tocó Herramientas, correr el lint **desde la raíz del repo**:

​```bash
node .claude/herramientas/lint-herramientas/lint-herramientas.js
​```

Detalle de la convención en la memoria [`feedback_herramientas.md`](.claude/memoria/feedback_herramientas.md).
```

## §Script — `.claude/herramientas/lint-herramientas/lint-herramientas.js`

Contenido exacto (Node, sin dependencias, sin red):

```js
#!/usr/bin/env node
// Lint del registro de Herramientas: README por herramienta con carpeta local, herramienta en indice,
// filas colgadas (link a subdir local inexistente), refs por ruta de lint en settings. Sin LLM, sin red.
// Uso: node lint-herramientas.js [<carpeta herramientas>]   (default: .claude/herramientas)
const fs = require('fs'), path = require('path');
const root = path.resolve(process.argv[2] || '.claude/herramientas');
const idxPath = path.join(root, 'INDICE.md');
const idx = fs.existsSync(idxPath) ? fs.readFileSync(idxPath, 'utf8') : '';

// subdirectorios = herramientas tipo script/tool que viven aca (skill/MCP viven en su casa nativa).
// El lint co-ubicado del propio subsistema (lint-<sub>, decision 0008) NO es una Herramienta: se excluye.
const selfLint = 'lint-' + path.basename(root);
const tools = fs.existsSync(root)
  ? fs.readdirSync(root, { withFileTypes: true }).filter(e => e.isDirectory() && e.name !== selfLint).map(e => e.name)
  : [];

// [1] README por herramienta con carpeta local
const sinReadme = tools.filter(t => !fs.existsSync(path.join(root, t, 'README.md')));

// [2] carpeta local fuera del indice
const fueraIndice = tools.filter(t => !idx.includes(t));

// [3] filas del indice cuyo link apunta a un subdir LOCAL inexistente
//     (se saltan links externos: ../skills/, .mcp.json, etc. — esos no viven bajo herramientas/)
const colgadas = [];
for (const line of idx.split('\n')) {
  const t = line.trim();
  if (!t.startsWith('|')) continue;
  const cells = t.split('|').slice(1, -1).map(c => c.trim());
  if (cells.length < 2) continue;
  const c0 = cells[0];
  if (/^:?-{2,}:?$/.test(c0.replace(/\s/g, ''))) continue;     // separador
  if (/^herramienta$/i.test(c0.replace(/[*\s]/g, ''))) continue; // header
  const m = /\]\(([^)]+?)\)/.exec(c0);                          // link [x](target)
  if (!m) continue;                                             // fila sin link -> no se valida ruta
  const target = m[1].trim();
  if (target.startsWith('..') || target.includes('.json') || /^\w+:/.test(target)) continue; // externo
  const name = target.replace(/\/$/, '').replace(/[`]/g, '').trim();
  if (name && !fs.existsSync(path.join(root, name))) colgadas.push(name);
}

// [4] refs por ruta a lints en settings que no resuelven (cualquier .claude/**/*.js|sh|...)
// La raiz del repo se deduce de la ubicacion del propio lint: .claude/<sub>/lint-<sub>/ -> 3 arriba.
// La profundidad la fija el instalador (decision 0008); no depende de desde donde se invoque.
const repoRoot = path.resolve(__dirname, '..', '..', '..');
const refsRotas = [];
for (const sf of ['.claude/settings.local.json', '.claude/settings.json']) {
  const abs = path.join(repoRoot, sf);
  if (!fs.existsSync(abs)) continue;
  const txt = fs.readFileSync(abs, 'utf8');
  // rama 1: ruta absoluta de Windows con espacios (X:\...\.claude\...); rama 2: relativa como antes.
  // extension anclada con (?![\w]) para que `settings.json` no matchee como `settings.js` (cuantificador no-greedy).
  const re = /([A-Za-z]:[\\/][^"'\n]*?\.claude[\\/][^"'\n]+?\.(?:mjs|cjs|js|sh|py|ts)(?![\w])|[.\w/-]*\.claude\/[\w./-]+?\.(?:mjs|cjs|js|sh|py|ts)(?![\w]))/g;
  let m;
  while ((m = re.exec(txt))) {
    const p = m[1], cand = path.isAbsolute(p) ? p : path.join(repoRoot, p);
    if (!fs.existsSync(cand)) refsRotas.push([sf, p]);
  }
}

console.log(`== LINT HERRAMIENTAS: ${root} ==`);
console.log(`herramientas con carpeta local: ${tools.length}\n`);
console.log(`[1] SIN README (${sinReadme.length}):`);
sinReadme.forEach(t => console.log(`    ${t}/`));
if (!sinReadme.length) console.log('    (todas tienen README)');
console.log(`\n[2] FUERA DEL INDICE (${fueraIndice.length}):`);
fueraIndice.forEach(t => console.log(`    ${t}/`));
if (!fueraIndice.length) console.log('    (completo)');
console.log(`\n[3] FILAS COLGADAS (${colgadas.length}):`);
colgadas.forEach(c => console.log(`    ${c}   [subdir local no existe]`));
if (!colgadas.length) console.log('    (ninguna)');
console.log(`\n[4] REFS POR RUTA DE LINT ROTAS EN SETTINGS (${refsRotas.length}):`);
refsRotas.forEach(([f, p]) => console.log(`    ${f}  ->  ${p}   [no existe]`));
if (!refsRotas.length) console.log('    (ninguna)');
```
