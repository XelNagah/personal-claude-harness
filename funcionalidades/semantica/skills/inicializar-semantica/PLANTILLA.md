# Plantilla de la semántica

textos literales que la skill escribe. (El formato general de una memoria lo define la funcionalidad `memoria-local`.)

## §Glosario — contenido inicial de `.claude/semantica/GLOSARIO.md`

Si el archivo no existe, crearlo con este contenido (la tabla arranca vacía — sin filas de ejemplo, para que el lint no las tome como conceptos reales):

```markdown
# Glosario del proyecto

Terminología **legítima** del dominio de este repo. Una fila por concepto en la tabla de abajo:

- **Concepto** — nombre canónico.
- **Definición** — una o dos frases: qué ES el concepto (no qué hace).
- **Alias** — otras formas de llamarlo, todas válidas, registradas para mapear; separadas por coma. `—` si no hay.
- **Propuestos** — términos que el agente *sugiere* pero que **no se usan** hasta que el usuario los mueve a `Alias` (acá) o al registro de Terminología Farlopa (vetado). Es un buzón, no un estado de reposo. `—` si no hay.
- **Detalle** — link a una página propia `<nombre>.md` **solo si el concepto es complejo** (fórmulas, ejemplos, contraejemplos). `—` si es simple.

Solo términos **propios del dominio** (no conceptos generales de programación). Consultar al planificar y analizar. Ejemplo completo en el README de la funcionalidad `semantica`.

Los términos **vetados no viven acá**: un veto es sobre la relación término→significado (el mismo término con otro significado puede ser legítimo), así que va al registro par [`TERMINOLOGIA-FARLOPA.md`](TERMINOLOGIA-FARLOPA.md), donde la columna del medio fija el significado vetado. El glosario solo lleva terminología legítima.

**Gobernanza (control del usuario):**

- Toda entrada nueva —**concepto o alias**— pasa por el usuario. El agente puede *proponer* (columna `Propuestos`), pero no asienta nada en `Alias` ni veta nada por su cuenta: ratificar y vetar son potestad del usuario. Preferir las palabras del usuario a acuñar nuevas.
- El agente **nunca usa**, ni en texto plano, memorias, planes o código, un término que esté en `Propuestos` o vetado en el registro de Terminología Farlopa.
- Los alias válidos **se registran** (mapear "birra/chela = cerveza" evita confusión); los términos confusos o ajenos al dominio **se vetan** en el registro de Terminología Farlopa (dejan de usarse y se barren del texto vivo).

| Concepto | Definición | Alias | Propuestos | Detalle |
|----------|------------|-------|------------|---------|
```

## §Farlopa — contenido inicial de `.claude/semantica/TERMINOLOGIA-FARLOPA.md`

Si el archivo no existe, crearlo con este contenido (la tabla arranca vacía):

```markdown
# Terminología Farlopa

*Farlop Terminology* (EN). Registro par del glosario: las **relaciones término→significado vetadas** del dominio. Cada fila prohíbe un término **en un significado específico**, no el término en sí — el mismo término con otro significado puede ser legítimo (`plomería`=cañerías en un repo de fontanería es válido; `plomería`=infraestructura interna de software es farlopa). Por eso la columna del medio: fija el significado que se veta.

El **lint marca por término** (lo mecánico: encuentra la palabra en el texto vivo); **el agente juzga el significado** al leer la marca (¿está usada en el sentido vetado o en uno legítimo?). El registro se calibra por repo: un anglicismo es farlopa para un lector hispanohablante y puede no serlo para uno angloparlante.

**Gobernanza:** vetar es potestad del usuario; el agente solo propone. El agente **nunca usa** un término en el significado que este registro veta.

| Término | Significado vetado | Cómo decirlo |
|---------|--------------------|--------------|
```

## §Memoria — `.claude/memoria/feedback_semantica.md`

```markdown
---
name: semantica
description: Subsistema semántica en .claude/semantica/ — dos registros pares: GLOSARIO.md (terminología legítima, alias/propuestos) y TERMINOLOGIA-FARLOPA.md (relaciones vetadas término→significado); el agente solo propone, el usuario ratifica y veta; consultar al planificar/analizar; lint al cerrar.
metadata:
  type: feedback
---

El subsistema `semántica` mantiene la coherencia semántica del dominio en el tiempo. Vive en `.claude/semantica/` con **dos registros pares**, ninguno cargado en contexto siempre:

- `GLOSARIO.md` — terminología **legítima**: una tabla donde cada fila es un concepto (nombre canónico, definición corta, `Alias`, `Propuestos`, `Detalle`). Los conceptos complejos tienen su propia página `.claude/semantica/<nombre>.md`.
- `TERMINOLOGIA-FARLOPA.md` — relaciones **vetadas**: `Término | Significado vetado | Cómo decirlo`. **Lo vetado es la relación término→significado, no el término**: el mismo término con otro significado puede ser legítimo. El lint **marca por término**; el agente **juzga el significado** al leer la marca.

**Términos por estado (glosario):** `Alias` (formas válidas, ratificadas), `Propuestos` (sugeridos por el agente, sin usar hasta ratificar). El glosario **NO tiene columna de vetados**: todo veto es una relación y vive en el registro par de Terminología Farlopa.

**Why:** coherencia semántica a lo largo de la vida del repo. Los alias válidos **se registran** (saber que "birra/chela" son la misma cerveza evita confusión); los términos confusos o ajenos al dominio **se vetan** (dejan de usarse y se barren del texto vivo).

**Gobernanza:** el agente **nunca** ratifica un alias ni veta por su cuenta: solo **propone** en `Propuestos`. Ratificar y vetar son del usuario. El agente **nunca usa** un término que esté en `Propuestos` ni uno vetado en el significado que Terminología Farlopa prohíbe, ni en texto plano, memorias, planes o código.

**How to apply:**

1. **Al planificar o analizar**, consultar los dos registros. Término nuevo válido → proponerlo en `Propuestos`. Término confuso o ajeno → proponer vetarlo (a Terminología Farlopa). En ambos casos, decide el usuario.
2. Concepto **simple** → una fila del glosario. Concepto **complejo** → fila + página de detalle enlazada.
3. **Al cerrar** una tarea que tocó semántica, correr el lint: `node .claude/semantica/lint-semantica/lint-semantica.js` (links de detalle, huérfanos, colisiones, propuestos pendientes, apariciones de vetados en el repo).

Relacionado: [[flujo-planes]] (consultar la semántica al planificar/analizar).
```

## §Script — `.claude/semantica/lint-semantica/lint-semantica.js`

Contenido exacto (Node, sin dependencias, sin red):

```js
#!/usr/bin/env node
// Lint de semantica: dos registros pares (GLOSARIO.md + TERMINOLOGIA-FARLOPA.md). Chequea links de
// detalle, huerfanos, colisiones/contradicciones termino<->vetado, propuestos pendientes y apariciones
// de vetados en el repo. El veto es sobre la relacion termino->significado: el lint marca por termino,
// el agente juzga el significado al leer la marca. Sin LLM, sin red.
// Uso: node lint-semantica.js [<carpeta>]   (default: .claude/semantica)
const fs = require('fs'), path = require('path');
const root = path.resolve(process.argv[2] || '.claude/semantica');
const glosPath = path.join(root, 'GLOSARIO.md');
const farlPath = path.join(root, 'TERMINOLOGIA-FARLOPA.md');
const txt = fs.existsSync(glosPath) ? fs.readFileSync(glosPath, 'utf8') : '';
const farlTxt = fs.existsSync(farlPath) ? fs.readFileSync(farlPath, 'utf8') : '';

// La raiz del repo se deduce de la ubicacion del propio lint: .claude/<sub>/lint-<sub>/ -> 3 arriba.
// La profundidad la fija el instalador; no depende de desde donde se invoque.
const repoRoot = path.resolve(__dirname, '..', '..', '..');
const dentroDelRepo = p => {
  const r = path.resolve(p);
  return r === repoRoot || r.startsWith(repoRoot + path.sep);
};
// Un archivo de un subsistema puede linkear a otros (planes/, conocimiento/, docs/, ...): la ref se
// resuelve relativa al archivo, a la raiz del subsistema, a .claude/, a la raiz del repo y al cwd.
// Solo se acepta el candidato que caiga DENTRO del repo: una ref rota no resuelve contra afuera.
function resolverRef(t, fdir) {
  return [
    path.join(fdir, t),
    path.join(root, t),
    path.join(root, '..', t),
    path.join(repoRoot, t),
    path.resolve(t),
  ].map(p => path.normalize(p)).find(p => dentroDelRepo(p) && fs.existsSync(p)) || null;
}

// separar celdas de una columna en terminos: coma/;, descartando vacios y guiones
const splitTerms = s => (s || '').split(/[,;]/).map(x => x.trim()).filter(x => x && x !== '—' && x !== '-');
// la columna Termino de la farlopa agrupa variantes con "/"; ademas viene con backticks
const splitFarlop = s => (s || '').replace(/`/g, '').split(/[,;/]/).map(x => x.trim()).filter(x => x && x !== '—' && x !== '-');

// parsear filas de GLOSARIO.md: | Concepto | Definicion | Alias | Propuestos | Detalle |
const rows = [];
for (const line of txt.split('\n')) {
  const t = line.trim();
  if (!t.startsWith('|')) continue;
  const cells = t.split('|').slice(1, -1).map(c => c.trim());
  if (cells.length < 5) continue;
  const c0 = cells[0].replace(/[*\s]/g, '');
  if (/^:?-{2,}:?$/.test(c0)) continue;                 // separador |---|
  if (/^concepto$/i.test(c0)) continue;                  // header
  rows.push({
    concepto: cells[0].replace(/\*/g, '').trim(),
    alias: cells[2],
    propuestos: cells[3],
    detalle: cells[4],
  });
}

// parsear filas de TERMINOLOGIA-FARLOPA.md: | Termino | Significado vetado | Como decirlo |
// Solo interesa la primera columna (los terminos vetados); el significado lo juzga el agente.
const vetados = [];   // termino pelado, en minuscula
for (const line of farlTxt.split('\n')) {
  const t = line.trim();
  if (!t.startsWith('|')) continue;
  const cells = t.split('|').slice(1, -1).map(c => c.trim());
  if (cells.length < 3) continue;
  const c0 = cells[0].replace(/[*`\s]/g, '');
  if (/^:?-{2,}:?$/.test(c0)) continue;                 // separador |---|
  if (/^t[eé]rmino$/i.test(c0)) continue;                // header
  for (const v of splitFarlop(cells[0])) vetados.push(v.toLowerCase());
}

// [1] links de detalle rotos (en GLOSARIO.md)
const linkRe = /\]\(([^)]+?\.md)\)/;
const referenced = new Set();
const refsRotas = [];
for (const r of rows) {
  const m = linkRe.exec(r.detalle);
  if (!m) continue;
  const target = m[1].trim();
  const abs = resolverRef(target, root);
  if (abs) referenced.add(path.basename(abs));
  else refsRotas.push([r.concepto, target]);
}

// [2] paginas .md huerfanas (en semantica/, no referenciadas por la tabla)
// Los dos registros y la infra del subsistema no son paginas de detalle: se excluyen.
const NO_HUERFANO = new Set(['GLOSARIO.md', 'TERMINOLOGIA-FARLOPA.md', 'INDICE.md', 'MANIFIESTO.md']);
const huerfanos = [];
if (fs.existsSync(root)) {
  for (const f of fs.readdirSync(root)) {
    if (!f.endsWith('.md') || NO_HUERFANO.has(f)) continue;
    if (!referenced.has(f)) huerfanos.push(f);
  }
}

// [3] colisiones de terminos
//   - mismo termino como alias en dos conceptos          -> error (colision de alias)
//   - termino como alias/concepto del glosario y vetado   -> contradiccion (se bendice y se prohibe)
// La farlopa admite el MISMO termino en varias filas (distinto significado vetado): no es ambiguo.
const aliasOf = new Map();     // termino -> concepto que lo tiene como alias (incluye el canonico)
const colisionesAlias = [];
const contradicciones = [];
const registrarAlias = (term, concepto) => {
  const key = term.toLowerCase();
  if (aliasOf.has(key) && aliasOf.get(key) !== concepto) colisionesAlias.push([term, aliasOf.get(key), concepto]);
  else aliasOf.set(key, concepto);
};
for (const r of rows) registrarAlias(r.concepto, r.concepto);
for (const r of rows) for (const a of splitTerms(r.alias)) registrarAlias(a, r.concepto);
const vetadoSet = new Set(vetados);
for (const key of vetadoSet) {
  if (aliasOf.has(key)) contradicciones.push([key, aliasOf.get(key)]);
}

// [4] propuestos pendientes de ratificacion (recordatorio, no error)
const propuestos = [];
for (const r of rows) for (const p of splitTerms(r.propuestos)) propuestos.push([p, r.concepto]);

// [5] apariciones de vetados en el repo (barrido recursivo desde la raiz)
// Reusa walk()+EXCLUDE de lint-conocimiento. Dos grupos: prosa (accion inmediata) y codigo (informativo).
const EXCLUDE = new Set(['.git', 'node_modules', 'exports', 'pdfs']);
// Autoexclusiones obligatorias: el registro de semantica contiene los vetados por definicion; el
// historico congelado de planes no se reescribe (falsearia el registro).
const AUTOEXCL = [
  path.join(repoRoot, '.claude', 'semantica'),
  path.join(repoRoot, '.claude', 'planes', 'ejecutados'),
  path.join(repoRoot, '.claude', 'planes', 'descartados'),
];
const excluido = p => AUTOEXCL.some(a => { const r = path.resolve(p); return r === a || r.startsWith(a + path.sep); });
const CODE_EXT = new Set(['.js', '.json', '.ts', '.mjs', '.cjs', '.sh', '.ps1', '.yml', '.yaml']);
function walkRepo(dir, acc) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDE.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (excluido(full)) continue;
    if (e.isDirectory()) walkRepo(full, acc);
    else acc.push(full);
  }
  return acc;
}
// mapear code-spans inline y fences para separar prosa de codigo (igual que lint-conocimiento)
function codeSpans(t) {
  const runs = []; let m; const re = /`+/g;
  while ((m = re.exec(t))) runs.push([m.index, m[0].length]);
  const spans = [];
  for (let i = 0; i < runs.length; ) {
    const [open, len] = runs[i]; let j = i + 1;
    while (j < runs.length && runs[j][1] !== len) j++;
    if (j < runs.length) { spans.push([open, runs[j][0] + runs[j][1]]); i = j + 1; }
    else i++;
  }
  return spans;
}
const enCodeSpan = (spans, idx) => spans.some(([s, e]) => idx >= s && idx < e);
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const vetadosTerms = [...vetadoSet];
const apariciones = { prosa: [], codigo: [] };
if (vetadosTerms.length) {
  const rel = p => path.relative(repoRoot, p).replace(/\\/g, '/');
  for (const f of walkRepo(repoRoot, [])) {
    const ext = path.extname(f).toLowerCase();
    const nombre = path.basename(f);
    // nombre de archivo/carpeta que contiene un vetado -> codigo (tocarlo es refactor)
    for (const term of vetadosTerms) {
      const re = new RegExp('\\b' + esc(term) + '\\b', 'i');
      if (re.test(nombre)) apariciones.codigo.push([rel(f), term, 'nombre de archivo']);
    }
    if (ext !== '.md' && !CODE_EXT.has(ext)) continue;  // binarios y otros: solo el nombre
    let contenido; try { contenido = fs.readFileSync(f, 'utf8'); } catch { continue; }
    const spans = ext === '.md' ? codeSpans(contenido) : null;
    for (const term of vetadosTerms) {
      const re = new RegExp('\\b' + esc(term) + '\\b', 'gi');
      let m;
      while ((m = re.exec(contenido))) {
        const balde = (ext === '.md' && !enCodeSpan(spans, m.index)) ? 'prosa' : 'codigo';
        const linea = contenido.slice(0, m.index).split('\n').length;
        apariciones[balde].push([rel(f) + ':' + linea, term]);
      }
    }
  }
}

console.log(`== LINT SEMANTICA: ${root} ==`);
console.log(`conceptos: ${rows.length} | vetados: ${vetadosTerms.length}\n`);
console.log(`[1] LINKS DE DETALLE ROTOS (${refsRotas.length}):`);
refsRotas.forEach(([c, t]) => console.log(`    ${c}  ->  ${t}   [no existe]`));
if (!refsRotas.length) console.log('    (ninguno)');
console.log(`\n[2] PAGINAS HUERFANAS (${huerfanos.length}):`);
huerfanos.forEach(h => console.log(`    ${h}`));
if (!huerfanos.length) console.log('    (ninguna)');
console.log(`\n[3] COLISIONES DE TERMINOS (${colisionesAlias.length + contradicciones.length}):`);
colisionesAlias.forEach(([t, a, b]) => console.log(`    alias "${t}"  en  ${a}  y  ${b}   [colision de alias]`));
contradicciones.forEach(([t, a]) => console.log(`    "${t}"  alias/concepto en  ${a}  y vetado en la farlopa   [contradiccion]`));
if (!colisionesAlias.length && !contradicciones.length) console.log('    (ninguna)');
console.log(`\n[4] PROPUESTOS PENDIENTES DE RATIFICACION (${propuestos.length}):`);
propuestos.forEach(([p, c]) => console.log(`    "${p}"  propuesto para  ${c}`));
if (!propuestos.length) console.log('    (ninguno)');
console.log(`\n[5] APARICIONES DE VETADOS (prosa: ${apariciones.prosa.length}, codigo: ${apariciones.codigo.length}):`);
console.log('  prosa (reescribir):');
apariciones.prosa.forEach(([f, t]) => console.log(`    ${f}  "${t}"`));
if (!apariciones.prosa.length) console.log('    (ninguna)');
console.log('  codigo/nombres (refactor manual, cuidado con refs por ruta):');
apariciones.codigo.forEach(([f, t, w]) => console.log(`    ${f}  "${t}"${w ? '  [' + w + ']' : ''}`));
if (!apariciones.codigo.length) console.log('    (ninguna)');
```

## §Manifiesto — `.claude/semantica/MANIFIESTO.md`

Contenido EXACTO (si el archivo no existe, crearlo con esto; si existe, reconciliar sin pisar):

````markdown
# Semántica — manifiesto de subsistema

El subsistema `semántica` mantiene la coherencia semántica del dominio en el tiempo. Vive en este directorio (`semantica/`) con **dos registros pares**, ninguno cargado en contexto siempre: `GLOSARIO.md` (terminología legítima —concepto → definición, con alias y propuestos—) y `TERMINOLOGIA-FARLOPA.md` (relaciones vetadas, columnas `Término | Significado vetado | Cómo decirlo`). **Lo vetado es la relación término→significado, no el término**: el mismo término con otro significado puede ser legítimo; por eso la columna del medio, y por eso nada vetado se queda en el glosario.

**Disparador:** consultar ambos registros al planificar y analizar; no acuñar términos propios, preferir los del usuario. Proponer una entrada (columna `Propuestos` del glosario) al detectar un término del dominio sin registrar. El agente solo **propone**: ratificar (a alias) y vetar (a Terminología Farlopa) son potestad del usuario.

**Skills:** `converger-terminologia` (recorre el texto del repo contra los dos registros: detecta sinónimos, anglicismos y desvíos, y propone ratificar, vetar o reescribir); instalación con `inicializar-semantica`.

**Índice: NO se carga siempre** — los registros se consultan a demanda. El **lint marca por término** (lo mecánico); el **agente juzga el significado** al leer la marca. Al cerrar una tarea que tocó semántica, correr el lint desde la raíz del repo:

```bash
node .claude/semantica/lint-semantica/lint-semantica.js
```

Convención en la memoria `feedback_semantica.md`.
````

## §Subsistemas — sección `## Subsistemas` de `AGENTS.md`

Contenido EXACTO (reemplaza las viejas secciones de prosa por-subsistema + el bloque "Mapa del repo"):

```markdown
## Subsistemas (manifiestos siempre cargados)

Cada subsistema tiene un **Manifiesto** (`.claude/<sub>/MANIFIESTO.md`): una descripción breve —qué es, cómo se usa, cuándo consultarlo— que va **siempre en contexto** y que **declara si su índice también se carga** incluyendo —o no— la línea `@INDICE.md`. Lo que se carga siempre es el manifiesto, no necesariamente el índice.

Si tu agente no expande imports, **leé estos manifiestos al inicio de la sesión** (y, si el manifiesto importa su índice, ese índice también).

@.claude/memoria/MANIFIESTO.md
@.claude/planes/MANIFIESTO.md
@.claude/conocimiento/MANIFIESTO.md
@.claude/semantica/MANIFIESTO.md
@.claude/decisiones/MANIFIESTO.md
@.claude/herramientas/MANIFIESTO.md
```
