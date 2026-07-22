# Plantilla del glosario

textos literales que la skill escribe. (El formato general de una memoria lo define la funcionalidad `memoria-local`.)

## §Glosario — contenido inicial de `.claude/glosario/INDICE.md`

Si el archivo no existe, crearlo con este contenido (la tabla arranca vacía — sin filas de ejemplo, para que el lint no las tome como conceptos reales):

```markdown
# Glosario del proyecto

Terminología del dominio de este repo. Una fila por concepto en la tabla de abajo:

- **Concepto** — nombre canónico.
- **Definición** — una o dos frases: qué ES el concepto (no qué hace).
- **Alias** — otras formas de llamarlo, todas válidas, registradas para mapear; separadas por coma. `—` si no hay.
- **Propuestos** — términos que el agente *sugiere* pero que **no se usan** hasta que el usuario los mueve a `Alias` o a `Vetados`. Es un buzón, no un estado de reposo. `—` si no hay.
- **Vetados** — términos prohibidos. El reemplazo es el `Concepto` de la propia fila. Separados por coma; `—` si no hay.
- **Detalle** — link a una página propia `<nombre>.md` **solo si el concepto es complejo** (fórmulas, ejemplos, contraejemplos, o el mapa de reemplazos de un vetado). `—` si es simple.

Solo términos **propios del dominio** (no conceptos generales de programación). Consultar al planificar y analizar. Ejemplo completo en el README de la funcionalidad `glosario`.

**Gobernanza (control del usuario, decisión 0004):**

- Toda entrada nueva —**concepto o alias**— pasa por el usuario. El agente puede *proponer* (columna `Propuestos`), pero no asienta nada en `Alias` ni en `Vetados`: ratificar y vetar son potestad del usuario. Preferir las palabras del usuario a acuñar nuevas.
- El agente **nunca usa**, ni en texto plano, memorias, planes o código, un término que esté en `Propuestos` o en `Vetados`.
- Los alias válidos **se registran** (mapear "birra/chela = cerveza" evita confusión); los términos confusos o ajenos al dominio **se vetan** (dejan de usarse y se barren del texto vivo).

| Concepto | Definición | Alias | Propuestos | Vetados | Detalle |
|----------|------------|-------|------------|---------|---------|
```

## §Memoria — `.claude/memoria/feedback_glosario.md`

```markdown
---
name: glosario
description: Glosario del dominio en .claude/glosario/INDICE.md — tabla de conceptos con términos por estado (alias/propuestos/vetados) + páginas de detalle; el agente solo propone, el usuario ratifica y veta; consultar al planificar/analizar; lint al cerrar.
metadata:
  type: feedback
---

La terminología del dominio vive en `.claude/glosario/INDICE.md`: una tabla donde cada fila es un concepto (nombre canónico, definición corta, y sus **términos por estado**). Los conceptos complejos tienen su propia página `.claude/glosario/<nombre>.md` (fórmulas, ejemplos, o el mapa de reemplazos de un vetado).

**Términos por estado (un solo eje):** `Alias` (formas válidas, ratificadas), `Propuestos` (sugeridos por el agente, sin usar hasta ratificar), `Vetados` (prohibidos; el reemplazo es el canónico de la propia fila).

**Why:** coherencia semántica a lo largo de la vida del repo. Los alias válidos **se registran** (saber que "birra/chela" son la misma cerveza evita confusión); los términos confusos o ajenos al dominio **se vetan** (dejan de usarse y se barren del texto vivo).

**Gobernanza (decisión 0004):** el agente **nunca** escribe en `Alias` ni en `Vetados`: solo **propone** en `Propuestos`. Ratificar y vetar son del usuario. El agente **nunca usa** un término que esté en `Propuestos` o en `Vetados`, ni en texto plano, memorias, planes o código.

**How to apply:**

1. **Al planificar o analizar**, consultar el glosario. Término nuevo válido → proponerlo en `Propuestos` (no escribir en Alias). Término confuso o ajeno → proponer vetarlo. En ambos casos, decide el usuario.
2. Concepto **simple** → una fila. Concepto **complejo** → fila + página de detalle enlazada.
3. **Al cerrar** una tarea que tocó el glosario, correr el lint: `node .claude/glosario/lint-glosario/lint-glosario.js` (links de detalle, huérfanos, colisiones de términos, propuestos pendientes, apariciones de vetados en el repo).

Relacionado: [[flujo-planes]] (consultar el glosario al planificar/analizar).
```

## §Script — `.claude/glosario/lint-glosario/lint-glosario.js`

Contenido exacto (Node, sin dependencias, sin red):

```js
#!/usr/bin/env node
// Lint del glosario: links de detalle resuelven, paginas sin huerfanos, colisiones de terminos,
// propuestos pendientes y apariciones de vetados en el repo. Sin LLM, sin red.
// Uso: node lint-glosario.js [<carpeta>]   (default: .claude/glosario)
const fs = require('fs'), path = require('path');
const root = path.resolve(process.argv[2] || '.claude/glosario');
const glosPath = path.join(root, 'INDICE.md');
const txt = fs.existsSync(glosPath) ? fs.readFileSync(glosPath, 'utf8') : '';

// La raiz del repo se deduce de la ubicacion del propio lint: .claude/<sub>/lint-<sub>/ -> 3 arriba.
// La profundidad la fija el instalador (decision 0008); no depende de desde donde se invoque.
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

// parsear filas de la tabla: | Concepto | Definicion | Alias | Propuestos | Vetados | Detalle |
const rows = [];
for (const line of txt.split('\n')) {
  const t = line.trim();
  if (!t.startsWith('|')) continue;
  const cells = t.split('|').slice(1, -1).map(c => c.trim());
  if (cells.length < 6) continue;
  const c0 = cells[0].replace(/[*\s]/g, '');
  if (/^:?-{2,}:?$/.test(c0)) continue;                 // separador |---|
  if (/^concepto$/i.test(c0)) continue;                  // header
  rows.push({
    concepto: cells[0].replace(/\*/g, '').trim(),
    alias: cells[2],
    propuestos: cells[3],
    vetados: cells[4],
    detalle: cells[5],
  });
}

// [1] links de detalle rotos
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

// [2] paginas .md huerfanas (en glosario/, no referenciadas por la tabla)
const huerfanos = [];
if (fs.existsSync(root)) {
  for (const f of fs.readdirSync(root)) {
    if (!f.endsWith('.md') || f === 'INDICE.md' || f === 'MANIFIESTO.md') continue;  // MANIFIESTO.md: infra del subsistema (dec. 0017)
    if (!referenced.has(f)) huerfanos.push(f);
  }
}

// [3] colisiones de terminos, sobre alias y vetados
//   - mismo termino como alias en dos conceptos          -> error (ya existia)
//   - termino como alias en una fila y vetado en otra     -> error duro (el glosario lo bendice y lo prohibe)
//   - mismo termino vetado en dos filas                   -> vetado ambiguo (no es error; pedir pagina de Detalle)
const aliasOf = new Map();     // termino -> concepto que lo tiene como alias (incluye el canonico)
const vetadoEn = new Map();    // termino -> [conceptos que lo vetan]
const colisionesAlias = [];
const contradicciones = [];
const vetadosAmbiguos = [];
const registrarAlias = (term, concepto) => {
  const key = term.toLowerCase();
  if (aliasOf.has(key) && aliasOf.get(key) !== concepto) colisionesAlias.push([term, aliasOf.get(key), concepto]);
  else aliasOf.set(key, concepto);
};
for (const r of rows) registrarAlias(r.concepto, r.concepto);
for (const r of rows) for (const a of splitTerms(r.alias)) registrarAlias(a, r.concepto);
for (const r of rows) for (const v of splitTerms(r.vetados)) {
  const key = v.toLowerCase();
  vetadoEn.set(key, [...(vetadoEn.get(key) || []), r.concepto]);
}
for (const [key, concepts] of vetadoEn) {
  if (aliasOf.has(key)) contradicciones.push([key, aliasOf.get(key), concepts[0]]);
  if (concepts.length > 1) vetadosAmbiguos.push([key, concepts]);
}

// [4] propuestos pendientes de ratificacion (recordatorio, no error)
const propuestos = [];
for (const r of rows) for (const p of splitTerms(r.propuestos)) propuestos.push([p, r.concepto]);

// [5] apariciones de vetados en el repo (barrido recursivo desde la raiz)
// Reusa walk()+EXCLUDE de lint-conocimiento. Dos grupos: prosa (accion inmediata) y codigo (informativo).
const EXCLUDE = new Set(['.git', 'node_modules', 'exports', 'pdfs']);
// Autoexclusiones obligatorias: el glosario contiene los vetados por definicion; el historico congelado
// de planes no se reescribe (falsearia el registro).
const AUTOEXCL = [
  path.join(repoRoot, '.claude', 'glosario'),
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
const vetadosTerms = [...vetadoEn.keys()];
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

console.log(`== LINT GLOSARIO: ${root} ==`);
console.log(`conceptos: ${rows.length}\n`);
console.log(`[1] LINKS DE DETALLE ROTOS (${refsRotas.length}):`);
refsRotas.forEach(([c, t]) => console.log(`    ${c}  ->  ${t}   [no existe]`));
if (!refsRotas.length) console.log('    (ninguno)');
console.log(`\n[2] PAGINAS HUERFANAS (${huerfanos.length}):`);
huerfanos.forEach(h => console.log(`    ${h}`));
if (!huerfanos.length) console.log('    (ninguna)');
console.log(`\n[3] COLISIONES DE TERMINOS (${colisionesAlias.length + contradicciones.length + vetadosAmbiguos.length}):`);
colisionesAlias.forEach(([t, a, b]) => console.log(`    alias "${t}"  en  ${a}  y  ${b}   [colision de alias]`));
contradicciones.forEach(([t, a, b]) => console.log(`    "${t}"  alias en  ${a}  y vetado en  ${b}   [contradiccion]`));
vetadosAmbiguos.forEach(([t, cs]) => console.log(`    "${t}"  vetado en  ${cs.join(', ')}   [ambiguo: dar pagina de Detalle]`));
if (!colisionesAlias.length && !contradicciones.length && !vetadosAmbiguos.length) console.log('    (ninguna)');
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

## §Manifiesto — `.claude/glosario/MANIFIESTO.md`

Contenido EXACTO (si el archivo no existe, crearlo con esto; si existe, reconciliar sin pisar):

````markdown
# Glosario — manifiesto de subsistema

La terminología del dominio vive en `INDICE.md`: una tabla de conceptos (nombre canónico, definición, y términos por estado — alias, propuestos, vetados — más detalle para lo complejo). Los alias válidos se registran; los términos confusos o ajenos al dominio se vetan.

**Disparador:** consultar el glosario al planificar y analizar (no acuñar términos propios; usar los del usuario). El agente solo **propone** (columna `Propuestos`); ratificar y vetar son potestad del usuario. Proponer una entrada al detectar un término del dominio sin registrar.

**Índice: NO se carga siempre** — se consulta al planificar y analizar. Al cerrar una tarea que tocó el glosario, correr el lint desde la raíz del repo:
```bash
node .claude/glosario/lint-glosario/lint-glosario.js
```
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
@.claude/glosario/MANIFIESTO.md
@.claude/decisiones/MANIFIESTO.md
@.claude/herramientas/MANIFIESTO.md
```
