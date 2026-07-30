# Plantilla del setup completo

textos literales que el orquestador escribe. (Réplica de los textos de los plugins individuales; mantener sincronizado al cambiar una preferencia.)

## §Preferencias — `.claude/preferencias/PREFERENCIAS.md` + `PREFERENCIAS-LOCAL.md` + sección de AGENTS.md

Separado por origen en **dos archivos**, igual que `conducta/` y `herramientas/`, y cada uno lo declara en su frontmatter: `PREFERENCIAS.md` (`origen: agente-multiproposito`, el nivelado lo reemplaza entero) y `PREFERENCIAS-LOCAL.md` (`origen: agente-desplegado`, nunca se abre). Los dos se importan siempre al contexto — las preferencias son reglas de conducta: inline, no índice+fetch. Al editar acá el archivo del Agente Multipropósito, **subir la versión del plugin**: la versión vive ahí, no en el encabezado, porque el Agente Desplegado no guarda ninguna.

Contenido inicial de `.claude/preferencias/PREFERENCIAS.md`:

```markdown
---
indice: Preferencias
origen: agente-multiproposito
---

# Preferencias

Reglas de conducta del agente en este repo. Siempre en contexto (importado desde AGENTS.md). Las preferencias se separan por origen en **dos archivos**, y cada uno lo declara en su frontmatter: este (`origen: agente-multiproposito`) viene del Agente Multipropósito y se actualiza al nivelar, que lo reemplaza entero — no editarlo acá; los ajustes de este repo van en [`PREFERENCIAS-LOCAL.md`](PREFERENCIAS-LOCAL.md) (`origen: agente-desplegado`), que el nivelado nunca abre.

## Preferencias del Agente Multipropósito

**Comunicación:**

- Al preguntar por una decisión o analizar alternativas, dar SIEMPRE ejemplos concretos de cada postura (numéricos si aplica): cómo es ahora vs. cómo quedaría y por qué, encadenando consecuencias ("A ⇒ B; si no fuera B ⇒ no A porque X"). Objetivo: ubicar inmediatamente al lector en la mecánica relevante sin que tenga que reconstruir contexto.
- Al pedir una decisión al usuario, **el contexto va en el texto de la respuesta**, nunca comprimido dentro de las opciones de una pregunta. Y **de a una decisión por vez**, aunque sean independientes entre sí. Única excepción: una cola de confirmaciones donde la respuesta esperada es "sí" a todas puede ir junta, con la recomendada visible.
- Antes de escribir en un **registro canónico** (glosario, decisiones, preferencias, Terminología Farlopa), mostrar el **texto exacto** que se va a asentar y esperar el visto bueno. Un "sí" a *"¿lo registro?"* aprueba la **acción** de registrar, nunca el **contenido**: lo que el usuario no leyó, no lo ratificó.
- Ante un informe o visualización de **formato nuevo**: mostrar primero el esqueleto con datos de juguete marcados como DUMMY, acordar la representación, recién después calcular en serio. **Nunca re-producir completo un formato rechazado**: volver al esqueleto y realinear.
- Tareas en background: esperar la notificación de finalización; no reportar ni consultar estado a cada rato — solo ante sospecha de cuelgue.

**Principios de trabajo:**

- Conceptual antes que implementación. Ante ambigüedad de diseño, preguntar antes de asumir. Minimizar cambios sustractivos.
- Iterar de alto a bajo nivel: interfaces y contratos antes que implementación.
- Nomenclatura en español para el dominio; inglés solo para infraestructura técnica.
- Cero invención de datos: lo que no salga de una fuente verificada se marca como faltante o como interpretación propia.
- Terminología: no acuñar términos del dominio por cuenta propia; preferir las palabras del usuario. **Español corriente en todo**: nada de palabras inventadas o raras (aunque suenen técnicas), ni en texto plano ni en diagramas — no solo en los registros. **Control duro en registros canónicos** (glosario, decisiones): ningún término acuñado por el agente se asienta sin ratificación del usuario. En texto plano/diagramas se puede usar, marcado como propuesto.
- **La sigla nunca sola en lo que queda escrito.** En documentación, registros, comentarios y textos que viajan a otros repos, el nombre del dominio va **completo**. La sigla puede **acompañarlo** —`Agente Multipropósito (AMP)`— y conviene presentarla así en la primera mención, para que el lector la reconozca cuando la encuentre; lo que no se hace es usarla **en lugar** del nombre. En la conversación es libre. Que un alias esté registrado en el glosario dice qué significa ese término, **no** autoriza a sustituir el nombre por él en el texto escrito.
- **Commits y descripciones de PR:** escribirlos en español, sin coautoría ni atribución a la IA, con título `<Área>: <Resumen>` y cuerpo `Antes, … Ahora, …`. El área es funcional y el cuerpo describe el cambio observable. Convención completa en `estilo-commits.md`.
- **Tareas exploratorias con varias variables:** mantener un único archivo de estado desde la primera corrida y actualizarlo antes de informar cada resultado. Si responde a un plan, vive en su sección `## Estado`; si es independiente, en `conocimiento/<tema>/estado.md`. Convención completa en `archivo-de-estado.md`.

```

Contenido inicial de `.claude/preferencias/PREFERENCIAS-LOCAL.md` — nace **declarado y sin entradas**, no vacío:

```markdown
---
indice: Preferencias del Agente Desplegado
origen: agente-desplegado
---

# Preferencias del Agente Desplegado

Las que este repo suma para su Propósito. Siempre en contexto (importado desde AGENTS.md). El nivelador no toca este archivo. La convención completa está en [`PREFERENCIAS.md`](PREFERENCIAS.md).

(ninguna todavía — agregar acá lo específico de este proyecto)
```

Sección de `AGENTS.md`:

```markdown
## Preferencias (siempre cargadas)

@.claude/preferencias/PREFERENCIAS.md
@.claude/preferencias/PREFERENCIAS-LOCAL.md

Al tocar las preferencias, correr el lint estructural **desde la raíz del repo** (chequea los dos archivos por origen + una línea de importación por cada uno):

​```bash
node .claude/preferencias/lint-preferencias/lint-preferencias.js
​```
```

(El prefijo `.claude/` es porque `AGENTS.md` vive en la raíz — la ruta del `@import` es relativa al archivo que importa. Layout legacy con `CLAUDE.md` dentro de `.claude/`: `@preferencias/PREFERENCIAS.md`.)

(El lint `lint-preferencias.js` está más abajo, en §Script — lint-preferencias.)

**Formas anteriores** (para la reconciliación):

- La más vieja eran dos secciones inline en CLAUDE.md — "Preferencias de comunicación" (el primer bullet de Comunicación, como cita) y "Principios de trabajo" (los cuatro bullets). Textualmente iguales → migrar sin preguntar (borrar de CLAUDE.md, dejar el import); con diferencias → las diferencias van a la sección del Agente Desplegado y se reporta.
- Después vino el par de encabezados `## Base (harness vN)` / `## Adaptaciones de este repo`, con la versión adentro del encabezado. **Los dos se renombran sin preguntar** a `## Preferencias del Agente Multipropósito` y `## Preferencias del Agente Desplegado`, conservando el contenido de cada uno: es renombre de encabezado, no reemplazo de contenido. La versión sale del encabezado y no se traslada a ningún lado — vive en el plugin.
- Después los dos orígenes vivieron como **dos secciones de un mismo archivo**. Se migran **partiendo el archivo**: la sección del Agente Desplegado pasa a `PREFERENCIAS-LOCAL.md` **con su contenido intacto**, los dos archivos estrenan frontmatter y `AGENTS.md` gana la segunda línea de importación. Si esa sección estaba vacía, el archivo nace igual, declarado y sin entradas.
- Con los dos archivos ya al día, el del Agente Multipropósito se reemplaza **entero y sin preguntar**: las diferencias entre versiones son de redacción, y lo propio del repo vive en el otro archivo, que no se abre.

## §Subsistemas — bloque `## Subsistemas` en `AGENTS.md`

Reemplaza el viejo "Mapa del repo" **y** las secciones de texto plano por-subsistema. La primera funcionalidad de subsistema que se instala crea la sección; cada una la asegura y agrega su propia línea `@.claude/<sub>/MANIFIESTO.md`. Cada manifiesto lista sus Índices y declara si se cargan (incluyendo o no su línea de importación), así que la carga de datos ya no se decide acá.

```markdown
## Subsistemas (manifiestos siempre cargados)

Cada subsistema tiene un **Manifiesto** (`.claude/<sub>/MANIFIESTO.md`): una descripción breve —qué es, cómo se usa, cuándo consultarlo— que va **siempre en contexto** y que **lista sus Índices de Subsistema con el origen de cada uno** y declara si se cargan, incluyendo —o no— su línea de importación. Lo que se carga siempre es el manifiesto, no necesariamente el índice.

Un subsistema tiene **uno o más Índices**: hay dos cuando su contenido viene de dos orígenes, y cada archivo lo declara en su frontmatter (`indice`, `origen`, `columnas`). El `origen` —`agente-multiproposito` o `agente-desplegado`— es lo que decide el trato del nivelador, no el nombre del archivo: el sufijo `-LOCAL` solo distingue dos archivos que conviven.

Si tu agente no expande imports, **leé estos manifiestos al inicio de la sesión** (y, si el manifiesto importa sus índices, esos índices también).

@.claude/subsistemas/MANIFIESTO.md
@.claude/planes/MANIFIESTO.md
@.claude/conocimiento/MANIFIESTO.md
@.claude/semantica/MANIFIESTO.md
@.claude/decisiones/MANIFIESTO.md
@.claude/herramientas/MANIFIESTO.md
@.claude/conducta/MANIFIESTO.md
```

(La ruta del `@import` es relativa al archivo que importa — `AGENTS.md` está en la raíz, por eso el prefijo `.claude/`. Las **preferencias siempre cargadas** van inline vía §Preferencias, no como manifiesto acá; las reglas del subsistema `conducta` las reparte su hook en cada momento —no se recitan desde el índice—, por eso su manifiesto sí va en esta lista pero su registro no se carga.)

## §Script — `.claude/conocimiento/lint-conocimiento/lint-conocimiento.js`

Contenido exacto (Node, sin dependencias, sin red):

```js
#!/usr/bin/env node
// Lint de la base de conocimiento: refs rotas, indice incompleto, huerfanos. Sin LLM, sin red.
// Uso: node lint-conocimiento.js [<carpeta>]   (default: .claude/conocimiento)
const fs = require('fs'), path = require('path');

// --- Indices por frontmatter ---
// Un subsistema tiene uno o mas Indices y cada archivo se declara a si mismo en un frontmatter
// minimo (indice, origen, columnas). El lint los descubre por ese frontmatter y no por un nombre
// fijo: el nombre dejo de codificar el origen, asi que deducirlo del nombre volveria a atarlos.
// Se acepta la forma vieja —el archivo de siempre, sin frontmatter— mientras haya Agentes
// Desplegados sin nivelar: ahi el origen queda en null y los chequeos que dependen de el no corren.
const ORIGENES = ['agente-multiproposito', 'agente-desplegado'];
const ETIQUETA_ORIGEN = { 'agente-multiproposito': 'Agente Multipropósito', 'agente-desplegado': 'Agente Desplegado' };
function leerFrontmatter(txt) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(txt);
  if (!m) return null;
  const campos = {};
  for (const linea of m[1].split(/\r?\n/)) {
    const kv = /^([a-zA-Z_][\w-]*):\s*(.*)$/.exec(linea);
    if (!kv) continue;
    const v = kv[2].trim();
    campos[kv[1]] = /^\[.*\]$/.test(v)
      ? v.slice(1, -1).split(',').map(x => x.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean)
      : v.replace(/^['"]|['"]$/g, '');
  }
  return campos;
}
// Encabezado real de la primera tabla markdown del archivo (null si no tiene tabla).
function cabeceraTabla(txt) {
  for (const linea of txt.split(/\r?\n/)) {
    const t = linea.trim();
    if (!t.startsWith('|')) continue;
    const celdas = t.split('|').slice(1, -1).map(c => c.replace(/\*/g, '').trim());
    if (/^:?-{2,}:?$/.test((celdas[0] || '').replace(/\s/g, ''))) continue;
    return celdas;
  }
  return null;
}
// Indices de un subsistema: los .md de su carpeta con frontmatter `indice:`, mas los nombres
// viejos que todavia no lo declaran. Da {archivo, nombre, texto, indice, origen, columnas, cabecera}.
function indicesDe(dirSub, nombresViejos) {
  const salida = [];
  let entradas = [];
  try { entradas = fs.readdirSync(dirSub); } catch (e) { return salida; }
  for (const nombre of entradas.sort()) {
    if (!nombre.endsWith('.md')) continue;
    const archivo = path.join(dirSub, nombre);
    let txt; try { txt = fs.readFileSync(archivo, 'utf8'); } catch (e) { continue; }
    const fm = leerFrontmatter(txt);
    const declarado = !!(fm && fm.indice);
    if (!declarado && !(nombresViejos || []).includes(nombre)) continue;
    salida.push({
      archivo, nombre, texto: txt,
      indice: declarado ? fm.indice : null,
      origen: declarado ? (fm.origen || '') : null,
      columnas: declarado && Array.isArray(fm.columnas) ? fm.columnas : null,
      cabecera: cabeceraTabla(txt),
    });
  }
  return salida;
}
// Dos controles sobre lo declarado. [a] Las columnas, en los DOS sentidos: la declarada que la
// tabla no tiene y la que la tabla tiene sin declarar. Con un solo sentido el frontmatter puede
// mentir por omision, y el codigo que ubica una columna por nombre —el repartidor de conducta
// ubica Momento y Clase— deja de encontrarla sin emitir ningun error. [b] El manifiesto contra el
// frontmatter: el manifiesto lista los Indices como texto fijo y el frontmatter es la autoridad;
// sin compararlos, el mismo dato queda escrito en dos lugares que nada sincroniza.
function problemasDeIndices(idxs, manifiestoTxt) {
  const out = [];
  const declarados = idxs.filter(i => i.indice);
  for (const i of declarados) {
    if (!ORIGENES.includes(i.origen)) out.push(`${i.nombre}: origen "${i.origen}" invalido (validos: ${ORIGENES.join(' / ')})`);
    if (!i.columnas) continue;
    if (!i.cabecera) { out.push(`${i.nombre}: declara columnas pero no se encontro la tabla`); continue; }
    for (const c of i.columnas) if (!i.cabecera.includes(c)) out.push(`${i.nombre}: columna declarada "${c}" que la tabla no tiene`);
    for (const c of i.cabecera) if (!i.columnas.includes(c)) out.push(`${i.nombre}: columna "${c}" en la tabla, sin declarar en el frontmatter`);
  }
  if (manifiestoTxt == null) return out;
  const linea = /^\*\*[IÍ]ndices?:\*\*(.*)$/m.exec(manifiestoTxt);
  if (!linea) {
    if (declarados.length) out.push('MANIFIESTO.md: falta el campo Indices, que lista los Indices del subsistema con su origen');
    return out;
  }
  const listados = [...linea[1].matchAll(/`([^`]+\.md)`\s*\(([^)]+)\)/g)].map(m => ({ nombre: m[1], origen: m[2].trim() }));
  for (const i of declarados) {
    const l = listados.find(x => x.nombre === i.nombre);
    if (!l) out.push(`MANIFIESTO.md: no lista el Indice ${i.nombre}`);
    else if (l.origen !== ETIQUETA_ORIGEN[i.origen]) out.push(`MANIFIESTO.md: ${i.nombre} figura como "${l.origen}" y su frontmatter dice "${i.origen}"`);
  }
  for (const l of listados) {
    if (!declarados.some(i => i.nombre === l.nombre)) out.push(`MANIFIESTO.md: lista ${l.nombre}, que no existe o no declara frontmatter`);
  }
  return out;
}
// --- fin indices por frontmatter ---
const root = path.resolve(process.argv[2] || '.claude/conocimiento');
// '.respaldo-amp' son copias congeladas de .claude/ que dejaron corridas viejas del nivelador:
// sus hallazgos ya no se pueden corregir y duplican el diagnostico real. No se barren.
// 'tmp' es material de trabajo descartable (handoffs, notas, borradores) que el propio harness
// gitignorea: sus hallazgos no se corrigen, se borra la carpeta. Excluye por NOMBRE, en
// cualquier nivel del repo, no solo `.claude/tmp/`.
const EXCLUDE = new Set(['.git', 'node_modules', '.respaldo-amp', 'tmp', 'exports', 'pdfs']);

function walk(dir, acc) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDE.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name.startsWith('lint-')) continue; walk(full, acc); }  // el lint co-ubicado del subsistema no es contenido
    else if (e.name.endsWith('.md') && e.name !== 'MANIFIESTO.md') acc.push(full);  // MANIFIESTO.md: infra del subsistema, no es pagina
  }
  return acc;
}
const rel = p => path.relative(root, p).replace(/\\/g, '/');
const domain = walk(root, []);
const read = f => fs.readFileSync(f, 'utf8');
const inRoot = p => path.resolve(p).startsWith(path.resolve(root) + path.sep);

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

// --- Atribucion por ancestro mas cercano ---
// Cada pagina se atribuye a su indice ancestro mas cercano; un sub-indice (INDICE.md), a su
// ancestro ESTRICTO mas cercano (asi el padre queda obligado a nombrar la Carpeta que delego).
// Un hallazgo cae una sola vez, contra el indice que corresponde.
function indiceAncestro(p, dirsIndice, estricto) {
  let d = path.dirname(p);
  if (estricto) d = path.dirname(d);
  while (d.length >= root.length) {
    if (dirsIndice.has(d)) return d;
    const up = path.dirname(d);
    if (up === d) break;
    d = up;
  }
  return null;
}
// Un indice "nombra" a p si menciona su archivo, su stem, o alguna Carpeta de la cadena entre el
// dir del indice y p (la Entrada que delega el subarbol). Un sub-indice se nombra por su Carpeta.
function indiceNombra(t, p, idxDir) {
  const base = path.basename(p);
  if (base !== 'INDICE.md') {
    const stem = base.slice(0, -3);
    if (t.includes(base) || t.includes(stem)) return true;
  }
  let d = path.dirname(p);
  while (d !== idxDir && d.length > idxDir.length) {
    if (t.includes(path.basename(d))) return true;
    d = path.dirname(d);
  }
  return false;
}
// --- fin atribucion por ancestro ---

const mdLink = /\]\(([^)]+?\.md)\)/g;
// exige barra: `subtema/pagina.md` es una ref, `MEMORIA.md` suelto es prosa nombrando un archivo
const codePath = /`([^`]+?\/[^`]+?\.md)`/g;
const wiki = /\[\[([^\]]+?)\]\]/g;

// Un wikilink ACTIVO (que el harness resuelve) va crudo; uno CITADO va en backticks
// para mostrar el simbolo. Mapear code-spans inline (y fences) para saltar citas.
function codeSpans(txt) {
  const runs = []; let m; const re = /`+/g;
  while ((m = re.exec(txt))) runs.push([m.index, m[0].length]);
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

const broken = [], referenced = new Set();
for (const f of domain) {
  const txt = read(f), fdir = path.dirname(f);
  for (const re of [mdLink, codePath]) {
    let m; re.lastIndex = 0;
    while ((m = re.exec(txt))) {
      let t = m[1].trim();
      if (/^https?:\/\//.test(t)) continue;
      // saltar placeholders/taquigrafia: elipsis, plantillas de nombre, angulos
      if (t.includes('...') || t.includes('<') || t.includes('*') || /A{3,}|AA-MM|MM-DD/.test(t)) continue;
      const hit = resolverRef(t, fdir);
      if (hit) { if (inRoot(hit)) referenced.add(rel(hit)); }
      else broken.push([rel(f), t, 'ref .md no existe']);
    }
  }
  const spans = codeSpans(txt);
  let m; wiki.lastIndex = 0;
  while ((m = wiki.exec(txt))) {
    if (enCodeSpan(spans, m.index)) continue;  // wikilink citado en backticks, no activo
    const name = m[1].split('|')[0].trim();
    const hit = domain.some(p => rel(p).endsWith('/' + name + '.md') || rel(p) === name + '.md');
    if (!hit) broken.push([rel(f), `[[${name}]]`, 'wikilink sin archivo']);
  }
}

// El Indice del subsistema se descubre por frontmatter; los sub-indices de una Carpeta se siguen
// reconociendo por nombre (son entradas del subsistema, no Indices de Subsistema).
const idxSub = indicesDe(root, ['INDICE.md']);
const maniPath = path.join(root, 'MANIFIESTO.md');
const problemasIndices = problemasDeIndices(idxSub, fs.existsSync(maniPath) ? fs.readFileSync(maniPath, 'utf8') : null);
const archivosIndice = new Set(idxSub.map(i => path.resolve(i.archivo)));
const esIndice = p => path.basename(p) === 'INDICE.md' || archivosIndice.has(path.resolve(p));
const indices = domain.filter(esIndice);
const idxText = new Map(indices.map(i => [i, read(i)]));
const dirsIndice = new Set(indices.map(i => path.dirname(i)));
const idxPorDir = new Map(indices.map(i => [path.dirname(i), i]));
const gaps = [];
for (const p of domain) {
  const ownerDir = indiceAncestro(p, dirsIndice, esIndice(p));
  if (ownerDir === null) continue;                 // la raiz: sin indice ancestro
  const idx = idxPorDir.get(ownerDir);
  if (!indiceNombra(idxText.get(idx), p, ownerDir)) gaps.push([rel(idx), rel(p)]);
}

const orphans = [];
for (const p of domain) {
  const base = path.basename(p);
  if (esIndice(p) || base === 'README.md') continue;
  if (referenced.has(rel(p))) continue;
  const ownerDir = indiceAncestro(p, dirsIndice, false);
  const idx = ownerDir === null ? null : idxPorDir.get(ownerDir);
  const mentioned = idx !== null && indiceNombra(idxText.get(idx), p, ownerDir);
  if (!mentioned) orphans.push(rel(p));
}

console.log(`== LINT CONOCIMIENTO: ${root} ==`);
console.log(`paginas: ${domain.length} | indices: ${indices.length}\n`);
console.log(`[1] REFS ROTAS (${broken.length}):`);
broken.forEach(([f, r, w]) => console.log(`    ${f}  ->  ${r}   [${w}]`));
if (!broken.length) console.log('    (ninguna)');
console.log(`\n[2] INDICE INCOMPLETO (${gaps.length}):`);
gaps.forEach(([i, p]) => console.log(`    ${i}  no lista  ${p}`));
if (!gaps.length) console.log('    (completo)');
console.log(`\n[3] HUERFANOS (${orphans.length}):`);
orphans.forEach(o => console.log(`    ${o}`));
if (!orphans.length) console.log('    (ninguno)');
console.log(`\n[4] INDICES DECLARADOS (${problemasIndices.length}):`);
problemasIndices.forEach(p => console.log(`    ${p}`));
if (!problemasIndices.length) console.log(`    (${idxSub.length} indice(s) de subsistema, coherentes con el manifiesto)`);
```

## §Planes — `.claude/planes/`

Contenido inicial de `.claude/planes/ESTADOS.md` (fuente de verdad de los estados; la lee el lint):

```markdown
# Estados de planes

Define los estados disponibles para los planes de este repo y su semántica. Es la **fuente de verdad**: el lint (`lint-planes`) lee este archivo para validar la columna `Estado` de `PLANES.md` y el mapeo estado↔carpeta. Cambiar el juego de estados = editar esta tabla, no el código del lint.

Máquina de **un solo eje**: un plan está en exactamente **un** estado a la vez.

- **Estado** — nombre canónico (el valor que va en la columna `Estado` de `PLANES.md`).
- **Sentido** — qué significa que un plan esté en ese estado.
- **Carpeta** — subcarpeta de `planes/` donde vive el archivo del plan mientras está en ese estado.
- **Terminal** — `sí` si es un estado de cierre (el plan ya no se mueve); `no` si sigue vivo.

| Estado | Sentido | Carpeta | Terminal |
|--------|---------|---------|----------|
| Nuevo | Creado; todavía sin ejecutar. La revisión de alto nivel (con `planificar`) ocurre acá, antes de arrancar. | `pendientes/` | no |
| En curso | Se tomó el plan y se está **ejecutando**. | `pendientes/` | no |
| Diferido | Pospuesto a propósito; retomable más adelante. | `pendientes/` | no |
| Ejecutado | Terminado con éxito. | `ejecutados/` | sí |
| Descartado | Abandonado; no se hará (motivo obligatorio en Notas). | `descartados/` | sí |

No hay estado de "diseño": todo plan `Nuevo` se revisa en alto nivel antes de ejecutarse, así que la revisión es parte de estar `Nuevo`, no un estado aparte. El lint vigila la antigüedad del estado **activo** (`En curso`) — un plan que se está ejecutando hace demasiado y quedó frenado (ver la constante `VIGILAR_ANTIGUEDAD` en `lint-planes.js`).

## Transiciones

​```
  Nuevo ──────► En curso ──────► Ejecutado
    │              │             (terminal)
    ├──► Diferido ◄┘   (retomable → En curso)
    │
    └──► Descartado   (terminal, con motivo)
​```

- `Nuevo` → En curso · Diferido · Descartado
- `En curso` → Diferido · Ejecutado · Descartado
- `Diferido` → En curso · Descartado
- `Ejecutado` — terminal
- `Descartado` — terminal

## Cómo cambiar los estados

Editar la tabla de arriba (agregar/quitar filas o renombrar un estado). Reglas que el lint espera:

- Cada estado no-terminal debe mapear a una carpeta que exista bajo `planes/`.
- Debe haber al menos un estado terminal por carpeta de cierre.
- El valor de la columna `Estado` en `PLANES.md` debe coincidir exactamente con un `Estado` de esta tabla.
```

Contenido inicial de `.claude/planes/PLANES.md`:

```markdown
---
indice: Registro de planes
origen: agente-desplegado
columnas: [Plan, Estado, Creado, Cerrado, Origen, Notas]
---

# Registro de planes

Lo fino de cada plan vive acá, no en el nombre del archivo. Las carpetas dan el ciclo grueso: `pendientes/` (planes vivos: `Nuevo`, `En curso`, `Diferido`), `ejecutados/`, `descartados/` (con motivo).

Los **estados** y su semántica (a qué carpeta mapea cada uno, cuáles son terminales) están definidos en [`ESTADOS.md`](ESTADOS.md) — fuente de verdad configurable, que el lint lee.

- **Plan** — link al archivo en su carpeta actual.
- **Estado** — uno de los definidos en `ESTADOS.md`: `Nuevo`, `En curso`, `Diferido` (vivos, en `pendientes/`), `Ejecutado`, `Descartado` (terminales).
- **Creado / Cerrado** — `AA-MM-DD`; Cerrado en `—` mientras esté vivo.
- **Origen** — plan del que se desprendió, si aplica.
- **Notas** — corto; en descartados, el motivo es obligatorio.

| Plan | Estado | Creado | Cerrado | Origen | Notas |
|------|--------|--------|---------|--------|-------|
```

Hook — **registro doble**: el mismo script se registra en los dos formatos — Claude Code y Codex CLI ejecutan idéntico chequeo al abrir sesión. Con `--quiet` el lint solo imprime cuando hay hallazgos: sesión limpia = hook silencioso. Es el trigger mecánico del ciclo — sin él, mover planes vuelve a depender de acordarse.

**Claude Code** — merge (sin pisar hooks existentes) en `.claude/settings.json` del repo:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node -e \"let f=require('fs'),p=require('path'),d=process.env.CLAUDE_PROJECT_DIR||process.cwd();while(!f.existsSync(p.join(d,'.claude'))&&p.dirname(d)!==d)d=p.dirname(d);process.argv.push(p.join(d,'.claude/planes'));require(p.join(d,'.claude/planes/lint-planes/lint-planes.js'))\" lint-planes --quiet"
          }
        ]
      }
    ]
  }
}
```

**Codex CLI** — merge (sin pisar hooks existentes) en `.codex/hooks.json` del repo:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node -e \"let f=require('fs'),p=require('path'),d=process.env.CLAUDE_PROJECT_DIR||process.cwd();while(!f.existsSync(p.join(d,'.claude'))&&p.dirname(d)!==d)d=p.dirname(d);process.argv.push(p.join(d,'.claude/planes'));require(p.join(d,'.claude/planes/lint-planes/lint-planes.js'))\" lint-planes --quiet",
            "statusMessage": "Chequeando el ciclo de planes"
          }
        ]
      }
    ]
  }
}
```

> Codex carga hooks de proyecto solo si la carpeta `.codex/` del repo es **de confianza** (revisar con `/hooks`), y con `features.hooks` habilitado en su config. La confianza se registra contra el texto del hook: si el hook cambia, hay que aprobarlo de nuevo. Avisarle al usuario al instalar.

`.claude/planes/lint-planes/README.md`:

```markdown
# lint-planes

**Qué hace:** lint del ciclo de planes — lee los estados de `planes/ESTADOS.md` (data-driven) y valida: coherencia estado↔carpeta y carpeta↔registro (PLANES.md), planes sueltos, estados inválidos (fuera de ESTADOS.md), pendientes ya resueltos sin mover, cierres a medias (sin fecha, sin motivo, sin notas de implementación) y activos (`En curso`) envejecidos. Sin LLM, sin red.
**Cómo se corre:** `node .claude/planes/lint-planes/lint-planes.js` (desde la raíz del repo). Flags: `--quiet` (solo imprime si hay hallazgos; usado por el hook), `--dias N` (umbral de envejecimiento, default 30).
**Estado:** vigente.
**Referenciado por:** hook `SessionStart` en `.claude/settings.json` — actualizar el hook si se mueve.
**Dependencias:** Node.js (sin libs externas).
**Origen (opcional):** funcionalidad `gestion-de-planes` del harness (análisis de uso 2026-07: los ciclos manuales de planes no se sostenían solos).
```

## §Script — `.claude/planes/lint-planes/lint-planes.js`

Contenido exacto (Node, sin dependencias, sin red):

```js
#!/usr/bin/env node
// Lint del ciclo de planes: carpeta<->registro, sueltos, resueltos sin mover, cierres a medias, activos envejecidos. Sin LLM, sin red.
// Estados y su mapeo (carpeta, terminal) se leen de ESTADOS.md: fuente de verdad configurable, no hardcodeada.
// Uso: node lint-planes.js [<carpeta>] [--quiet] [--dias N]   (default: .claude/planes, N=30)
const fs = require('fs'), path = require('path');

// --- Indices por frontmatter ---
// Un subsistema tiene uno o mas Indices y cada archivo se declara a si mismo en un frontmatter
// minimo (indice, origen, columnas). El lint los descubre por ese frontmatter y no por un nombre
// fijo: el nombre dejo de codificar el origen, asi que deducirlo del nombre volveria a atarlos.
// Se acepta la forma vieja —el archivo de siempre, sin frontmatter— mientras haya Agentes
// Desplegados sin nivelar: ahi el origen queda en null y los chequeos que dependen de el no corren.
const ORIGENES = ['agente-multiproposito', 'agente-desplegado'];
const ETIQUETA_ORIGEN = { 'agente-multiproposito': 'Agente Multipropósito', 'agente-desplegado': 'Agente Desplegado' };
function leerFrontmatter(txt) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(txt);
  if (!m) return null;
  const campos = {};
  for (const linea of m[1].split(/\r?\n/)) {
    const kv = /^([a-zA-Z_][\w-]*):\s*(.*)$/.exec(linea);
    if (!kv) continue;
    const v = kv[2].trim();
    campos[kv[1]] = /^\[.*\]$/.test(v)
      ? v.slice(1, -1).split(',').map(x => x.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean)
      : v.replace(/^['"]|['"]$/g, '');
  }
  return campos;
}
// Encabezado real de la primera tabla markdown del archivo (null si no tiene tabla).
function cabeceraTabla(txt) {
  for (const linea of txt.split(/\r?\n/)) {
    const t = linea.trim();
    if (!t.startsWith('|')) continue;
    const celdas = t.split('|').slice(1, -1).map(c => c.replace(/\*/g, '').trim());
    if (/^:?-{2,}:?$/.test((celdas[0] || '').replace(/\s/g, ''))) continue;
    return celdas;
  }
  return null;
}
// Indices de un subsistema: los .md de su carpeta con frontmatter `indice:`, mas los nombres
// viejos que todavia no lo declaran. Da {archivo, nombre, texto, indice, origen, columnas, cabecera}.
function indicesDe(dirSub, nombresViejos) {
  const salida = [];
  let entradas = [];
  try { entradas = fs.readdirSync(dirSub); } catch (e) { return salida; }
  for (const nombre of entradas.sort()) {
    if (!nombre.endsWith('.md')) continue;
    const archivo = path.join(dirSub, nombre);
    let txt; try { txt = fs.readFileSync(archivo, 'utf8'); } catch (e) { continue; }
    const fm = leerFrontmatter(txt);
    const declarado = !!(fm && fm.indice);
    if (!declarado && !(nombresViejos || []).includes(nombre)) continue;
    salida.push({
      archivo, nombre, texto: txt,
      indice: declarado ? fm.indice : null,
      origen: declarado ? (fm.origen || '') : null,
      columnas: declarado && Array.isArray(fm.columnas) ? fm.columnas : null,
      cabecera: cabeceraTabla(txt),
    });
  }
  return salida;
}
// Dos controles sobre lo declarado. [a] Las columnas, en los DOS sentidos: la declarada que la
// tabla no tiene y la que la tabla tiene sin declarar. Con un solo sentido el frontmatter puede
// mentir por omision, y el codigo que ubica una columna por nombre —el repartidor de conducta
// ubica Momento y Clase— deja de encontrarla sin emitir ningun error. [b] El manifiesto contra el
// frontmatter: el manifiesto lista los Indices como texto fijo y el frontmatter es la autoridad;
// sin compararlos, el mismo dato queda escrito en dos lugares que nada sincroniza.
function problemasDeIndices(idxs, manifiestoTxt) {
  const out = [];
  const declarados = idxs.filter(i => i.indice);
  for (const i of declarados) {
    if (!ORIGENES.includes(i.origen)) out.push(`${i.nombre}: origen "${i.origen}" invalido (validos: ${ORIGENES.join(' / ')})`);
    if (!i.columnas) continue;
    if (!i.cabecera) { out.push(`${i.nombre}: declara columnas pero no se encontro la tabla`); continue; }
    for (const c of i.columnas) if (!i.cabecera.includes(c)) out.push(`${i.nombre}: columna declarada "${c}" que la tabla no tiene`);
    for (const c of i.cabecera) if (!i.columnas.includes(c)) out.push(`${i.nombre}: columna "${c}" en la tabla, sin declarar en el frontmatter`);
  }
  if (manifiestoTxt == null) return out;
  const linea = /^\*\*[IÍ]ndices?:\*\*(.*)$/m.exec(manifiestoTxt);
  if (!linea) {
    if (declarados.length) out.push('MANIFIESTO.md: falta el campo Indices, que lista los Indices del subsistema con su origen');
    return out;
  }
  const listados = [...linea[1].matchAll(/`([^`]+\.md)`\s*\(([^)]+)\)/g)].map(m => ({ nombre: m[1], origen: m[2].trim() }));
  for (const i of declarados) {
    const l = listados.find(x => x.nombre === i.nombre);
    if (!l) out.push(`MANIFIESTO.md: no lista el Indice ${i.nombre}`);
    else if (l.origen !== ETIQUETA_ORIGEN[i.origen]) out.push(`MANIFIESTO.md: ${i.nombre} figura como "${l.origen}" y su frontmatter dice "${i.origen}"`);
  }
  for (const l of listados) {
    if (!declarados.some(i => i.nombre === l.nombre)) out.push(`MANIFIESTO.md: lista ${l.nombre}, que no existe o no declara frontmatter`);
  }
  return out;
}
// --- fin indices por frontmatter ---
const args = process.argv.slice(2);
const quiet = args.includes('--quiet');
const diasIdx = args.indexOf('--dias');
const MAX_DIAS = diasIdx >= 0 ? parseInt(args[diasIdx + 1], 10) : 30;
const root = path.resolve(args.find(a => !a.startsWith('--') && !/^\d+$/.test(a)) || '.claude/planes');

// Estado(s) cuya antiguedad se vigila: el plan se esta ejecutando hace demasiado y quedo frenado.
// Si se renombra el estado activo en ESTADOS.md, ajustar esta lista (en minusculas).
const VIGILAR_ANTIGUEDAD = ['en curso'];

// --- ESTADOS.md: nombre -> {nombre, carpeta, terminal} ---
const estPath = path.join(root, 'ESTADOS.md');
const estTxt = fs.existsSync(estPath) ? fs.readFileSync(estPath, 'utf8') : '';
const estados = new Map();
for (const line of estTxt.split('\n')) {
  const t = line.trim();
  if (!t.startsWith('|')) continue;
  const cells = t.split('|').slice(1, -1).map(c => c.trim());
  if (cells.length < 4) continue;
  const nombre = cells[0];
  const c0 = nombre.replace(/[*\s]/g, '');
  if (/^:?-{2,}:?$/.test(c0) || /^estado$/i.test(c0)) continue;
  const carpeta = cells[2].replace(/[`/\\]/g, '').trim();
  const terminal = /^s[ií]$/i.test(cells[3].trim());
  estados.set(nombre.toLowerCase(), { nombre, carpeta, terminal });
}
// Fallback si no hay ESTADOS.md (repo a medio configurar): convencion clasica de carpetas.
const CARPETAS = estados.size
  ? [...new Set([...estados.values()].map(e => e.carpeta))]
  : ['pendientes', 'ejecutados', 'descartados'];
const carpetaDeEstado = e => (estados.get(e) || {}).carpeta;
const esTerminal = e => !!(estados.get(e) || {}).terminal;

const indices = indicesDe(root, ['PLANES.md']);
const maniPath = path.join(root, 'MANIFIESTO.md');
const problemasIndices = problemasDeIndices(indices, fs.existsSync(maniPath) ? fs.readFileSync(maniPath, 'utf8') : null);
const nombresIndice = new Set(indices.map(i => i.nombre));
const reg = indices.map(i => i.texto).join('\n');

// filas: | Plan | Estado | Creado | Cerrado | Origen | Notas |
const rows = [];
for (const line of reg.split('\n')) {
  const t = line.trim();
  if (!t.startsWith('|')) continue;
  const cells = t.split('|').slice(1, -1).map(c => c.trim());
  if (cells.length < 6) continue;
  const c0 = cells[0].replace(/[*\s]/g, '');
  if (/^:?-{2,}:?$/.test(c0) || /^plan$/i.test(c0)) continue;
  const m = /\]\(([^)]+?)\)/.exec(cells[0]);
  const ref = (m ? m[1] : cells[0].replace(/[`\[\]]/g, '')).trim();
  rows.push({ ref, estado: cells[1].toLowerCase(), creado: cells[2],
              cerrado: cells[3], origen: cells[4], notas: cells[5] });
}

const enDisco = new Map(); // rel -> carpeta
for (const c of CARPETAS) {
  const dir = path.join(root, c);
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir)) if (f.endsWith('.md')) enDisco.set(c + '/' + f, c);
}

const sueltos = fs.existsSync(root)
  ? fs.readdirSync(root, { withFileTypes: true })
      .filter(e => e.isFile() && e.name.endsWith('.md') && !nombresIndice.has(e.name)
                   && !['PLANES.md', 'ESTADOS.md', 'MANIFIESTO.md', 'README.md'].includes(e.name)).map(e => e.name)
  : [];

const norm = r => r.replace(/\\/g, '/').replace(/^\.\//, '');
const refs = new Set(rows.map(r => norm(r.ref)));
const sinFila = [...enDisco.keys()].filter(k => !refs.has(k));
const colgadas = [], estadoInvalido = [], estadoCarpeta = [], cierreAMedias = [], sinMotivo = [];
for (const r of rows) {
  const rel = norm(r.ref), carpeta = enDisco.get(rel);
  if (!estados.size) break;                       // sin ESTADOS.md no se valida el estado
  if (!estados.has(r.estado)) { estadoInvalido.push([rel, r.estado]); continue; }
  if (!carpeta) { colgadas.push(rel); continue; }
  const esperada = carpetaDeEstado(r.estado);
  if (esperada && carpeta !== esperada) estadoCarpeta.push([rel, r.estado, carpeta, esperada]);
  if (esTerminal(r.estado) && (!r.cerrado || r.cerrado === '—' || r.cerrado === '-')) cierreAMedias.push([rel, 'sin fecha Cerrado']);
  // Motivo obligatorio en la carpeta de descarte (convencion de carpetas del harness).
  if (carpeta === 'descartados' && (!r.notas || r.notas === '—' || r.notas === '-')) sinMotivo.push(rel);
}
// filas colgadas (archivo no existe) para estados validos que no aparecieron en disco
for (const r of rows) {
  const rel = norm(r.ref);
  if (estados.size && estados.has(r.estado) && !enDisco.has(rel) && !colgadas.includes(rel)) colgadas.push(rel);
}

// Una sección de implementación puede venir de un plan legacy con título abreviado.
// Solo se reconocen encabezados explícitos; texto que menciona commits no alcanza.
const tieneNotasDeImplementacion = txt => /^#{1,6}\s+(?:Notas?\s+de\s+)?implementaci[oó]n\b/im.test(txt);

// contenido: pendientes con marcador de resolucion; ejecutados sin notas de implementacion
const resueltosSinMover = [], ejecSinNotas = [];
for (const [rel, carpeta] of enDisco) {
  const txt = fs.readFileSync(path.join(root, rel), 'utf8');
  if (carpeta === 'pendientes' && (/\bRESUELTO\b/.test(txt) || tieneNotasDeImplementacion(txt))) resueltosSinMover.push(rel);
  if (carpeta === 'ejecutados' && !tieneNotasDeImplementacion(txt)) ejecSinNotas.push(rel);
}

// activos envejecidos (estado vigilado, p. ej. "En curso", con Creado viejo)
const viejos = [];
const hoy = Date.now();
for (const r of rows) {
  if (!VIGILAR_ANTIGUEDAD.includes(r.estado)) continue;
  const m = /^(\d{2})-(\d{2})-(\d{2})$/.exec(r.creado);
  if (!m) continue;
  const dias = Math.floor((hoy - Date.parse(`20${m[1]}-${m[2]}-${m[3]}`)) / 86400000);
  if (dias > MAX_DIAS) viejos.push([norm(r.ref), dias]);
}

const secciones = [
  ['INDICES DECLARADOS (frontmatter vs tabla vs manifiesto)', problemasIndices],
  ['ESTADOS.md AUSENTE O VACIO (no se valida el estado)', estados.size ? [] : [estPath]],
  ['SUELTOS EN LA RAIZ (mover a una carpeta del ciclo)', sueltos],
  ['ARCHIVOS SIN FILA EN PLANES.md', sinFila],
  ['FILAS COLGADAS (archivo no existe)', colgadas],
  ['ESTADO INVALIDO (no esta en ESTADOS.md)', estadoInvalido.map(([r, e]) => `${r}  estado="${e}"`)],
  ['ESTADO vs CARPETA INCONSISTENTE', estadoCarpeta.map(([r, e, c, esp]) => `${r}  estado="${e}" en ${c}/ (deberia ir en ${esp}/)`)],
  ['PENDIENTES CON MARCADOR DE RESUELTO (¿mover a ejecutados?)', resueltosSinMover],
  ['CIERRES A MEDIAS', cierreAMedias.map(([r, w]) => `${r}  [${w}]`)],
  ['DESCARTADOS SIN MOTIVO', sinMotivo],
  ['EJECUTADOS SIN SECCIÓN DE IMPLEMENTACIÓN', ejecSinNotas],
  [`ACTIVOS ENVEJECIDOS (> ${MAX_DIAS} dias en curso: ¿sigue/diferido/descartado?)`, viejos.map(([r, d]) => `${r}  (${d} dias)`)],
];
const total = secciones.reduce((n, [, items]) => n + items.length, 0);
if (quiet && total === 0) process.exit(0);
console.log(`== LINT PLANES: ${root} ==`);
console.log(`estados definidos: ${estados.size} | filas en registro: ${rows.length} | archivos en ciclo: ${enDisco.size} | hallazgos: ${total}\n`);
for (const [titulo, items] of secciones) {
  if (quiet && !items.length) continue;
  console.log(`[${titulo}] (${items.length})`);
  items.forEach(i => console.log(`    ${i}`));
  if (!quiet && !items.length) console.log('    (ninguno)');
}
```

## §Glosario — `.claude/semantica/`

Contenido inicial de `.claude/semantica/GLOSARIO.md` (tabla vacía — sin filas de ejemplo, para que el lint no las tome como conceptos reales):

```markdown
---
indice: Glosario del proyecto
origen: agente-desplegado
columnas: [Concepto, Definición, Alias, Propuestos, Detalle]
---

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

Registro par `.claude/semantica/TERMINOLOGIA-FARLOPA.md` (tabla vacía):

```markdown
---
indice: Terminología Farlopa
origen: agente-desplegado
columnas: [Término, Significado vetado, Cómo decirlo, Control]
---

# Terminología Farlopa

*Farlop Terminology* (EN). Registro par del glosario: las **relaciones término→significado vetadas** del dominio. Cada fila prohíbe un término **en un significado específico**, no el término en sí — el mismo término con otro significado puede ser legítimo (`plomería`=cañerías en un repo de fontanería es válido; `plomería`=infraestructura interna de software es farlopa). Por eso la columna del medio: fija el significado que se veta.

El **lint marca por término** (lo mecánico: encuentra la palabra en el texto vivo); **el agente juzga el significado** al leer la marca (¿está usada en el sentido vetado o en uno legítimo?). El registro se calibra por repo: un anglicismo es farlopa para un lector hispanohablante y puede no serlo para uno angloparlante.

## La columna `Control`

Dice qué hace el control del momento `al escribir` cuando encuentra el término **antes** de que el archivo exista:

- **`bloquea`** — la palabra está mal **siempre**, sin importar la frase, así que la escritura se rechaza y hay que corregirla antes. Son los anglicismos puros: `levelear` no tiene ningún uso válido en español.
- **`avisa`** — la misma palabra puede estar bien o mal según qué signifique (`capa de configuración` es legítimo; `la segunda capa del proceso` está vetado). La máquina no puede decidirlo: informa los términos hallados y el agente juzga.

Vacío se lee como `avisa`. **El bloqueo mira solo las apariciones fuera de comillas simples invertidas**, así que citar un término para hablar de él —como hace esta misma tabla— nunca se frena; se frena usarlo.

**Gobernanza:** vetar es potestad del usuario; el agente solo propone. El agente **nunca usa** un término en el significado que este registro veta.

| Término | Significado vetado | Cómo decirlo | Control |
|---------|--------------------|--------------|---------|
```

Lint `.claude/semantica/lint-semantica/lint-semantica.js` (Node, sin dependencias, sin red):

```js
#!/usr/bin/env node
// Lint de semantica: dos registros pares (GLOSARIO.md + TERMINOLOGIA-FARLOPA.md). Chequea links de
// detalle, huerfanos, colisiones/contradicciones termino<->vetado, propuestos pendientes y apariciones
// de vetados en el repo. El veto es sobre la relacion termino->significado: el lint marca por termino,
// el agente juzga el significado al leer la marca. Sin LLM, sin red.
// Uso: node lint-semantica.js [<carpeta>]   (default: .claude/semantica)
const fs = require('fs'), path = require('path');

// --- Indices por frontmatter ---
// Un subsistema tiene uno o mas Indices y cada archivo se declara a si mismo en un frontmatter
// minimo (indice, origen, columnas). El lint los descubre por ese frontmatter y no por un nombre
// fijo: el nombre dejo de codificar el origen, asi que deducirlo del nombre volveria a atarlos.
// Se acepta la forma vieja —el archivo de siempre, sin frontmatter— mientras haya Agentes
// Desplegados sin nivelar: ahi el origen queda en null y los chequeos que dependen de el no corren.
const ORIGENES = ['agente-multiproposito', 'agente-desplegado'];
const ETIQUETA_ORIGEN = { 'agente-multiproposito': 'Agente Multipropósito', 'agente-desplegado': 'Agente Desplegado' };
function leerFrontmatter(txt) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(txt);
  if (!m) return null;
  const campos = {};
  for (const linea of m[1].split(/\r?\n/)) {
    const kv = /^([a-zA-Z_][\w-]*):\s*(.*)$/.exec(linea);
    if (!kv) continue;
    const v = kv[2].trim();
    campos[kv[1]] = /^\[.*\]$/.test(v)
      ? v.slice(1, -1).split(',').map(x => x.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean)
      : v.replace(/^['"]|['"]$/g, '');
  }
  return campos;
}
// Encabezado real de la primera tabla markdown del archivo (null si no tiene tabla).
function cabeceraTabla(txt) {
  for (const linea of txt.split(/\r?\n/)) {
    const t = linea.trim();
    if (!t.startsWith('|')) continue;
    const celdas = t.split('|').slice(1, -1).map(c => c.replace(/\*/g, '').trim());
    if (/^:?-{2,}:?$/.test((celdas[0] || '').replace(/\s/g, ''))) continue;
    return celdas;
  }
  return null;
}
// Indices de un subsistema: los .md de su carpeta con frontmatter `indice:`, mas los nombres
// viejos que todavia no lo declaran. Da {archivo, nombre, texto, indice, origen, columnas, cabecera}.
function indicesDe(dirSub, nombresViejos) {
  const salida = [];
  let entradas = [];
  try { entradas = fs.readdirSync(dirSub); } catch (e) { return salida; }
  for (const nombre of entradas.sort()) {
    if (!nombre.endsWith('.md')) continue;
    const archivo = path.join(dirSub, nombre);
    let txt; try { txt = fs.readFileSync(archivo, 'utf8'); } catch (e) { continue; }
    const fm = leerFrontmatter(txt);
    const declarado = !!(fm && fm.indice);
    if (!declarado && !(nombresViejos || []).includes(nombre)) continue;
    salida.push({
      archivo, nombre, texto: txt,
      indice: declarado ? fm.indice : null,
      origen: declarado ? (fm.origen || '') : null,
      columnas: declarado && Array.isArray(fm.columnas) ? fm.columnas : null,
      cabecera: cabeceraTabla(txt),
    });
  }
  return salida;
}
// Dos controles sobre lo declarado. [a] Las columnas, en los DOS sentidos: la declarada que la
// tabla no tiene y la que la tabla tiene sin declarar. Con un solo sentido el frontmatter puede
// mentir por omision, y el codigo que ubica una columna por nombre —el repartidor de conducta
// ubica Momento y Clase— deja de encontrarla sin emitir ningun error. [b] El manifiesto contra el
// frontmatter: el manifiesto lista los Indices como texto fijo y el frontmatter es la autoridad;
// sin compararlos, el mismo dato queda escrito en dos lugares que nada sincroniza.
function problemasDeIndices(idxs, manifiestoTxt) {
  const out = [];
  const declarados = idxs.filter(i => i.indice);
  for (const i of declarados) {
    if (!ORIGENES.includes(i.origen)) out.push(`${i.nombre}: origen "${i.origen}" invalido (validos: ${ORIGENES.join(' / ')})`);
    if (!i.columnas) continue;
    if (!i.cabecera) { out.push(`${i.nombre}: declara columnas pero no se encontro la tabla`); continue; }
    for (const c of i.columnas) if (!i.cabecera.includes(c)) out.push(`${i.nombre}: columna declarada "${c}" que la tabla no tiene`);
    for (const c of i.cabecera) if (!i.columnas.includes(c)) out.push(`${i.nombre}: columna "${c}" en la tabla, sin declarar en el frontmatter`);
  }
  if (manifiestoTxt == null) return out;
  const linea = /^\*\*[IÍ]ndices?:\*\*(.*)$/m.exec(manifiestoTxt);
  if (!linea) {
    if (declarados.length) out.push('MANIFIESTO.md: falta el campo Indices, que lista los Indices del subsistema con su origen');
    return out;
  }
  const listados = [...linea[1].matchAll(/`([^`]+\.md)`\s*\(([^)]+)\)/g)].map(m => ({ nombre: m[1], origen: m[2].trim() }));
  for (const i of declarados) {
    const l = listados.find(x => x.nombre === i.nombre);
    if (!l) out.push(`MANIFIESTO.md: no lista el Indice ${i.nombre}`);
    else if (l.origen !== ETIQUETA_ORIGEN[i.origen]) out.push(`MANIFIESTO.md: ${i.nombre} figura como "${l.origen}" y su frontmatter dice "${i.origen}"`);
  }
  for (const l of listados) {
    if (!declarados.some(i => i.nombre === l.nombre)) out.push(`MANIFIESTO.md: lista ${l.nombre}, que no existe o no declara frontmatter`);
  }
  return out;
}
// --- fin indices por frontmatter ---
const root = path.resolve(process.argv[2] || '.claude/semantica');
// Los dos registros se descubren por frontmatter y se distinguen por sus COLUMNAS declaradas, que
// es lo que dice cual es cual: aca la division no es por origen sino por funcion. Si el frontmatter
// no esta todavia, se cae a los nombres de siempre.
const indices = indicesDe(root, ['GLOSARIO.md', 'TERMINOLOGIA-FARLOPA.md']);
const maniPath = path.join(root, 'MANIFIESTO.md');
const problemasIndices = problemasDeIndices(indices, fs.existsSync(maniPath) ? fs.readFileSync(maniPath, 'utf8') : null);
const nombresIndice = new Set(indices.map(i => i.nombre));
const conColumna = (col, nombreViejo) => {
  const hit = indices.find(i => (i.columnas || i.cabecera || []).includes(col));
  return hit || indices.find(i => i.nombre === nombreViejo) || null;
};
const glosario = conColumna('Concepto', 'GLOSARIO.md');
const farlopa = conColumna('Significado vetado', 'TERMINOLOGIA-FARLOPA.md');
const glosPath = glosario ? glosario.archivo : path.join(root, 'GLOSARIO.md');
const farlPath = farlopa ? farlopa.archivo : path.join(root, 'TERMINOLOGIA-FARLOPA.md');
const txt = glosario ? glosario.texto : '';
const farlTxt = farlopa ? farlopa.texto : '';

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

// parsear filas de TERMINOLOGIA-FARLOPA.md: | Termino | Significado vetado | Como decirlo | Control |
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
const NO_HUERFANO = new Set([...nombresIndice, 'GLOSARIO.md', 'TERMINOLOGIA-FARLOPA.md', 'INDICE.md', 'MANIFIESTO.md', 'README.md']);
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
// '.respaldo-amp' son copias congeladas de .claude/ que dejaron corridas viejas del nivelador:
// sus hallazgos ya no se pueden corregir y duplican el diagnostico real. No se barren.
// 'tmp' es material de trabajo descartable (handoffs, notas, borradores) que el propio harness
// gitignorea: sus hallazgos no se corrigen, se borra la carpeta. Excluye por NOMBRE, en
// cualquier nivel del repo, no solo `.claude/tmp/`.
const EXCLUDE = new Set(['.git', 'node_modules', '.respaldo-amp', 'tmp', 'exports', 'pdfs']);
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
console.log(`\n[5] INDICES DECLARADOS (${problemasIndices.length}):`);
problemasIndices.forEach(p => console.log(`    ${p}`));
if (!problemasIndices.length) console.log(`    (${nombresIndice.size} indice(s), coherentes con el manifiesto)`);
console.log(`\n[6] APARICIONES DE VETADOS (prosa: ${apariciones.prosa.length}, codigo: ${apariciones.codigo.length}):`);
console.log('  prosa (reescribir):');
apariciones.prosa.forEach(([f, t]) => console.log(`    ${f}  "${t}"`));
if (!apariciones.prosa.length) console.log('    (ninguna)');
console.log('  codigo/nombres (refactor manual, cuidado con refs por ruta):');
apariciones.codigo.forEach(([f, t, w]) => console.log(`    ${f}  "${t}"${w ? '  [' + w + ']' : ''}`));
if (!apariciones.codigo.length) console.log('    (ninguna)');
```

## §Decisiones — `.claude/decisiones/`

Contenido inicial de `.claude/decisiones/INDICE.md` (tabla vacía — sin filas de ejemplo):

```markdown
---
indice: Decisiones del proyecto
origen: agente-desplegado
columnas: [N°, Decisión, Fecha, Estado, Detalle]
---

# Decisiones del proyecto

Registro de las decisiones **estructurales al propósito del repo**: las que definen cómo es o qué hace el repo en lo esencial, o que eligen un camino entre varios de forma que **condiciona el trabajo futuro**. **No** van las operativas triviales o efímeras ("busqué X en internet", "usé tal flag"). Ante la duda: ¿esto condiciona el repo a futuro? Sí → va.

Una fila por decisión:

- **N°** — secuencial (`0001`, `0002`, …), referencia estable.
- **Decisión** — qué se decidió y por qué, en una frase (para las simples).
- **Fecha** — `AAAA-MM-DD`.
- **Estado** — `vigente` o `reemplazada por NNNN`. Para revertir no se borra: se agrega una nueva y se marca la vieja.
- **Detalle** — link a `NNNN-nombre.md` **solo si la decisión requiere conceptualización mayor** (contexto, alternativas, consecuencias); `—` si es simple.

| N° | Decisión | Fecha | Estado | Detalle |
|----|----------|-------|--------|---------|
```

Formato de una página de detalle `.claude/decisiones/NNNN-nombre.md` (solo decisiones complejas):

```markdown
# NNNN — Título corto de la decisión

**Fecha:** AAAA-MM-DD · **Estado:** vigente

Contexto: qué problema o situación la motivó.
Decisión: qué se decidió.
Alternativas: cuáles se consideraron y por qué se eligió esta.
Consecuencias: efectos no obvios (solo si los hay).
```

Lint `.claude/decisiones/lint-decisiones/lint-decisiones.js` (Node, sin dependencias, sin red):

```js
#!/usr/bin/env node
// Lint del registro de decisiones: numeracion, links de detalle, huerfanos, superseded. Sin LLM, sin red.
// Uso: node lint-decisiones.js [<carpeta>]   (default: .claude/decisiones)
const fs = require('fs'), path = require('path');

// --- Indices por frontmatter ---
// Un subsistema tiene uno o mas Indices y cada archivo se declara a si mismo en un frontmatter
// minimo (indice, origen, columnas). El lint los descubre por ese frontmatter y no por un nombre
// fijo: el nombre dejo de codificar el origen, asi que deducirlo del nombre volveria a atarlos.
// Se acepta la forma vieja —el archivo de siempre, sin frontmatter— mientras haya Agentes
// Desplegados sin nivelar: ahi el origen queda en null y los chequeos que dependen de el no corren.
const ORIGENES = ['agente-multiproposito', 'agente-desplegado'];
const ETIQUETA_ORIGEN = { 'agente-multiproposito': 'Agente Multipropósito', 'agente-desplegado': 'Agente Desplegado' };
function leerFrontmatter(txt) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(txt);
  if (!m) return null;
  const campos = {};
  for (const linea of m[1].split(/\r?\n/)) {
    const kv = /^([a-zA-Z_][\w-]*):\s*(.*)$/.exec(linea);
    if (!kv) continue;
    const v = kv[2].trim();
    campos[kv[1]] = /^\[.*\]$/.test(v)
      ? v.slice(1, -1).split(',').map(x => x.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean)
      : v.replace(/^['"]|['"]$/g, '');
  }
  return campos;
}
// Encabezado real de la primera tabla markdown del archivo (null si no tiene tabla).
function cabeceraTabla(txt) {
  for (const linea of txt.split(/\r?\n/)) {
    const t = linea.trim();
    if (!t.startsWith('|')) continue;
    const celdas = t.split('|').slice(1, -1).map(c => c.replace(/\*/g, '').trim());
    if (/^:?-{2,}:?$/.test((celdas[0] || '').replace(/\s/g, ''))) continue;
    return celdas;
  }
  return null;
}
// Indices de un subsistema: los .md de su carpeta con frontmatter `indice:`, mas los nombres
// viejos que todavia no lo declaran. Da {archivo, nombre, texto, indice, origen, columnas, cabecera}.
function indicesDe(dirSub, nombresViejos) {
  const salida = [];
  let entradas = [];
  try { entradas = fs.readdirSync(dirSub); } catch (e) { return salida; }
  for (const nombre of entradas.sort()) {
    if (!nombre.endsWith('.md')) continue;
    const archivo = path.join(dirSub, nombre);
    let txt; try { txt = fs.readFileSync(archivo, 'utf8'); } catch (e) { continue; }
    const fm = leerFrontmatter(txt);
    const declarado = !!(fm && fm.indice);
    if (!declarado && !(nombresViejos || []).includes(nombre)) continue;
    salida.push({
      archivo, nombre, texto: txt,
      indice: declarado ? fm.indice : null,
      origen: declarado ? (fm.origen || '') : null,
      columnas: declarado && Array.isArray(fm.columnas) ? fm.columnas : null,
      cabecera: cabeceraTabla(txt),
    });
  }
  return salida;
}
// Dos controles sobre lo declarado. [a] Las columnas, en los DOS sentidos: la declarada que la
// tabla no tiene y la que la tabla tiene sin declarar. Con un solo sentido el frontmatter puede
// mentir por omision, y el codigo que ubica una columna por nombre —el repartidor de conducta
// ubica Momento y Clase— deja de encontrarla sin emitir ningun error. [b] El manifiesto contra el
// frontmatter: el manifiesto lista los Indices como texto fijo y el frontmatter es la autoridad;
// sin compararlos, el mismo dato queda escrito en dos lugares que nada sincroniza.
function problemasDeIndices(idxs, manifiestoTxt) {
  const out = [];
  const declarados = idxs.filter(i => i.indice);
  for (const i of declarados) {
    if (!ORIGENES.includes(i.origen)) out.push(`${i.nombre}: origen "${i.origen}" invalido (validos: ${ORIGENES.join(' / ')})`);
    if (!i.columnas) continue;
    if (!i.cabecera) { out.push(`${i.nombre}: declara columnas pero no se encontro la tabla`); continue; }
    for (const c of i.columnas) if (!i.cabecera.includes(c)) out.push(`${i.nombre}: columna declarada "${c}" que la tabla no tiene`);
    for (const c of i.cabecera) if (!i.columnas.includes(c)) out.push(`${i.nombre}: columna "${c}" en la tabla, sin declarar en el frontmatter`);
  }
  if (manifiestoTxt == null) return out;
  const linea = /^\*\*[IÍ]ndices?:\*\*(.*)$/m.exec(manifiestoTxt);
  if (!linea) {
    if (declarados.length) out.push('MANIFIESTO.md: falta el campo Indices, que lista los Indices del subsistema con su origen');
    return out;
  }
  const listados = [...linea[1].matchAll(/`([^`]+\.md)`\s*\(([^)]+)\)/g)].map(m => ({ nombre: m[1], origen: m[2].trim() }));
  for (const i of declarados) {
    const l = listados.find(x => x.nombre === i.nombre);
    if (!l) out.push(`MANIFIESTO.md: no lista el Indice ${i.nombre}`);
    else if (l.origen !== ETIQUETA_ORIGEN[i.origen]) out.push(`MANIFIESTO.md: ${i.nombre} figura como "${l.origen}" y su frontmatter dice "${i.origen}"`);
  }
  for (const l of listados) {
    if (!declarados.some(i => i.nombre === l.nombre)) out.push(`MANIFIESTO.md: lista ${l.nombre}, que no existe o no declara frontmatter`);
  }
  return out;
}
// --- fin indices por frontmatter ---
const root = path.resolve(process.argv[2] || '.claude/decisiones');
const indices = indicesDe(root, ['INDICE.md']);
const maniPath = path.join(root, 'MANIFIESTO.md');
const problemasIndices = problemasDeIndices(indices, fs.existsSync(maniPath) ? fs.readFileSync(maniPath, 'utf8') : null);
const nombresIndice = new Set(indices.map(i => i.nombre));
const txt = indices.map(i => i.texto).join('\n');
const pad = n => String(n).padStart(4, '0');

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

// parsear filas de la tabla: | N° | Decisión | Fecha | Estado | Detalle |
const rows = [];
for (const line of txt.split('\n')) {
  const t = line.trim();
  if (!t.startsWith('|')) continue;
  const cells = t.split('|').slice(1, -1).map(c => c.trim());
  if (cells.length < 5) continue;
  const nRaw = cells[0].replace(/[*\s]/g, '');
  if (/^:?-{2,}:?$/.test(nRaw)) continue;               // separador |---|
  if (!/^\d{1,4}$/.test(nRaw)) continue;                 // header u otra fila sin N°
  rows.push({ n: parseInt(nRaw, 10), estado: cells[3], detalle: cells[4] });
}

// [1] numeracion: huecos y duplicados
const gaps = [];
if (rows.length) {
  const nums = rows.map(r => r.n), set = new Set(nums), seen = new Set();
  for (let i = 1; i <= Math.max(...nums); i++) if (!set.has(i)) gaps.push(`falta ${pad(i)}`);
  for (const n of nums) { if (seen.has(n)) gaps.push(`duplicado ${pad(n)}`); seen.add(n); }
}

// [2] links de detalle rotos + recopilar referenciados
const linkRe = /\]\(([^)]+?\.md)\)/;
const referenced = new Set(), refsRotas = [];
for (const r of rows) {
  const m = linkRe.exec(r.detalle);
  if (!m) continue;
  const target = m[1].trim(), abs = resolverRef(target, root);
  if (abs) referenced.add(path.basename(abs));
  else refsRotas.push([pad(r.n), target]);
}

// [3] paginas de detalle huerfanas
const huerfanos = [];
if (fs.existsSync(root)) {
  for (const f of fs.readdirSync(root)) {
    if (!f.endsWith('.md') || nombresIndice.has(f) || ['INDICE.md', 'MANIFIESTO.md', 'README.md'].includes(f)) continue;
    if (!referenced.has(f)) huerfanos.push(f);
  }
}

// [4] superseded (en la columna Estado) que no resuelven
const nums = new Set(rows.map(r => r.n));
const supRe = /(?:reemplazada por|supersede-a|superseded by)[^0-9\n]{0,12}(\d{1,4})/i;
const supRotas = [];
for (const r of rows) {
  const m = supRe.exec(r.estado);
  if (m && !nums.has(parseInt(m[1], 10))) supRotas.push([pad(r.n), `reemplazada por ${pad(parseInt(m[1], 10))}`]);
}

console.log(`== LINT DECISIONES: ${root} ==`);
console.log(`decisiones: ${rows.length}\n`);
console.log(`[1] NUMERACION (${gaps.length}):`);
gaps.forEach(g => console.log(`    ${g}`));
if (!gaps.length) console.log('    (sin huecos ni duplicados)');
console.log(`\n[2] LINKS DE DETALLE ROTOS (${refsRotas.length}):`);
refsRotas.forEach(([n, t]) => console.log(`    ${n}  ->  ${t}   [no existe]`));
if (!refsRotas.length) console.log('    (ninguno)');
console.log(`\n[3] PAGINAS HUERFANAS (${huerfanos.length}):`);
huerfanos.forEach(h => console.log(`    ${h}`));
if (!huerfanos.length) console.log('    (ninguna)');
console.log(`\n[4] SUPERSEDED ROTAS (${supRotas.length}):`);
supRotas.forEach(([n, r]) => console.log(`    ${n}  ->  ${r}   [decision inexistente]`));
if (!supRotas.length) console.log('    (ninguna)');
console.log(`\n[5] INDICES DECLARADOS (${problemasIndices.length}):`);
problemasIndices.forEach(p => console.log(`    ${p}`));
if (!problemasIndices.length) console.log(`    (${nombresIndice.size} indice(s), coherentes con el manifiesto)`);
```

## §Herramientas — `.claude/herramientas/`

Contenido inicial de `.claude/herramientas/INDICE.md` (un archivo por origen: este, poblado con la Herramienta que manda el Agente Multipropósito, e `INDICE-LOCAL.md`, declarado y con la tabla vacía — sin filas de ejemplo):

```markdown
---
indice: Herramientas del proyecto
origen: agente-multiproposito
columnas: [Herramienta, Tipo, Qué hace, Cómo se invoca, Estado]
---

# Herramientas del proyecto

Registro de las **Herramientas** del repo: las *tools* que el **Propósito** del repo requiere y el agente invoca para tareas repetibles. Tipos: `script`, `skill` local del repo, `MCP` local. Una fila por Herramienta. Ordena las herramientas desordenadas: qué es cada una, cómo se invoca, si sigue vigente.

> Los **lints de subsistema** (`lint-subsistemas`, `lint-semantica`, …) **no** van acá: son infraestructura del Patrón de cada subsistema y viven con su subsistema (`.claude/<sub>/lint-<sub>/`). En estos dos archivos solo van Herramientas.

- **Herramienta** — nombre; si es tipo `script` con carpeta local, link a `<tool>/` (adentro, README + código). Si es `skill` o `MCP`, link a donde vive (`.claude/skills/<skill>/`, `.mcp.json`).
- **Tipo** — `script` | `skill` | `mcp`.
- **Qué hace** — una línea.
- **Cómo se invoca** — el comando (`script`), el nombre de skill que dispara el modelo (`skill`), o cómo se conecta y qué tool-calls expone (`mcp`).
- **Estado** — `vigente`, `experimental` u `obsoleto` (los obsoletos se pueden depurar).

> **Origen del contenido:** las Herramientas se separan por origen en **dos archivos**, y cada uno lo declara en su frontmatter — este (`origen: agente-multiproposito`, las manda el Agente Multipropósito; el nivelador `amp:actualizar` lo reemplaza entero al poner al día un Agente con Propósito) e [`INDICE-LOCAL.md`](INDICE-LOCAL.md) (`origen: agente-desplegado`, las suma cada repo; el nivelador no lo abre). Mismo molde que `conducta/` y que los dos archivos de `preferencias/`.

## Herramientas del Agente Multipropósito

Las que instala el Agente Multipropósito. El nivelador reemplaza **este archivo entero**; nunca abre el del Agente Desplegado.

| Herramienta | Tipo | Qué hace | Cómo se invoca | Estado |
|-------------|------|----------|----------------|--------|
| [actualizar-plugins](actualizar-plugins/) | script | Pone al día los plugins que este Agente con Propósito tiene habilitados en esta máquina —los que le traen su Agente Multipropósito— y detecta los cuatro desfases: el marketplace bajado que no trajo lo publicado, el plugin que falta traer, el silencioso —traído pero no cargado, porque la sesión arrancó antes— y la dependencia que el repo nunca declaró (`SIN DECLARAR`, que deja al plugin que la pide sin cargar y sin señal); marca aparte los plugins `RETIRADO` (nombres que el marketplace dejó de ofrecer ⇒ migración, no actualización). Sin `--aplicar` solo diagnostica; acepta ruta para apuntarlo a otro repo | `node .claude/herramientas/actualizar-plugins/actualizar-plugins.js [--aplicar] [rutaRepo]` | vigente |
```

Contenido inicial de `.claude/herramientas/INDICE-LOCAL.md` — nace **declarado y sin filas**, no vacío:

```markdown
---
indice: Herramientas del Agente Desplegado
origen: agente-desplegado
columnas: [Herramienta, Tipo, Qué hace, Cómo se invoca, Estado]
---

# Herramientas del Agente Desplegado

Las que este repo suma para su Propósito. El nivelador **no toca este archivo**. Las columnas y la convención completa están en [`INDICE.md`](INDICE.md).

| Herramienta | Tipo | Qué hace | Cómo se invoca | Estado |
|-------------|------|----------|----------------|--------|
```

Plantilla de la ficha `.claude/herramientas/<tool>/README.md` (tipo script):

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

Lint `.claude/herramientas/lint-herramientas/lint-herramientas.js` (Node, sin dependencias, sin red):

```js
#!/usr/bin/env node
// Lint del registro de Herramientas: README por herramienta con carpeta local, herramienta en indice,
// filas colgadas (link a subdir local inexistente), refs por ruta de lint en settings. Sin LLM, sin red.
// Uso: node lint-herramientas.js [<carpeta herramientas>]   (default: .claude/herramientas)
const fs = require('fs'), path = require('path');

// --- Indices por frontmatter ---
// Un subsistema tiene uno o mas Indices y cada archivo se declara a si mismo en un frontmatter
// minimo (indice, origen, columnas). El lint los descubre por ese frontmatter y no por un nombre
// fijo: el nombre dejo de codificar el origen, asi que deducirlo del nombre volveria a atarlos.
// Se acepta la forma vieja —el archivo de siempre, sin frontmatter— mientras haya Agentes
// Desplegados sin nivelar: ahi el origen queda en null y los chequeos que dependen de el no corren.
const ORIGENES = ['agente-multiproposito', 'agente-desplegado'];
const ETIQUETA_ORIGEN = { 'agente-multiproposito': 'Agente Multipropósito', 'agente-desplegado': 'Agente Desplegado' };
function leerFrontmatter(txt) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(txt);
  if (!m) return null;
  const campos = {};
  for (const linea of m[1].split(/\r?\n/)) {
    const kv = /^([a-zA-Z_][\w-]*):\s*(.*)$/.exec(linea);
    if (!kv) continue;
    const v = kv[2].trim();
    campos[kv[1]] = /^\[.*\]$/.test(v)
      ? v.slice(1, -1).split(',').map(x => x.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean)
      : v.replace(/^['"]|['"]$/g, '');
  }
  return campos;
}
// Encabezado real de la primera tabla markdown del archivo (null si no tiene tabla).
function cabeceraTabla(txt) {
  for (const linea of txt.split(/\r?\n/)) {
    const t = linea.trim();
    if (!t.startsWith('|')) continue;
    const celdas = t.split('|').slice(1, -1).map(c => c.replace(/\*/g, '').trim());
    if (/^:?-{2,}:?$/.test((celdas[0] || '').replace(/\s/g, ''))) continue;
    return celdas;
  }
  return null;
}
// Indices de un subsistema: los .md de su carpeta con frontmatter `indice:`, mas los nombres
// viejos que todavia no lo declaran. Da {archivo, nombre, texto, indice, origen, columnas, cabecera}.
function indicesDe(dirSub, nombresViejos) {
  const salida = [];
  let entradas = [];
  try { entradas = fs.readdirSync(dirSub); } catch (e) { return salida; }
  for (const nombre of entradas.sort()) {
    if (!nombre.endsWith('.md')) continue;
    const archivo = path.join(dirSub, nombre);
    let txt; try { txt = fs.readFileSync(archivo, 'utf8'); } catch (e) { continue; }
    const fm = leerFrontmatter(txt);
    const declarado = !!(fm && fm.indice);
    if (!declarado && !(nombresViejos || []).includes(nombre)) continue;
    salida.push({
      archivo, nombre, texto: txt,
      indice: declarado ? fm.indice : null,
      origen: declarado ? (fm.origen || '') : null,
      columnas: declarado && Array.isArray(fm.columnas) ? fm.columnas : null,
      cabecera: cabeceraTabla(txt),
    });
  }
  return salida;
}
// Dos controles sobre lo declarado. [a] Las columnas, en los DOS sentidos: la declarada que la
// tabla no tiene y la que la tabla tiene sin declarar. Con un solo sentido el frontmatter puede
// mentir por omision, y el codigo que ubica una columna por nombre —el repartidor de conducta
// ubica Momento y Clase— deja de encontrarla sin emitir ningun error. [b] El manifiesto contra el
// frontmatter: el manifiesto lista los Indices como texto fijo y el frontmatter es la autoridad;
// sin compararlos, el mismo dato queda escrito en dos lugares que nada sincroniza.
function problemasDeIndices(idxs, manifiestoTxt) {
  const out = [];
  const declarados = idxs.filter(i => i.indice);
  for (const i of declarados) {
    if (!ORIGENES.includes(i.origen)) out.push(`${i.nombre}: origen "${i.origen}" invalido (validos: ${ORIGENES.join(' / ')})`);
    if (!i.columnas) continue;
    if (!i.cabecera) { out.push(`${i.nombre}: declara columnas pero no se encontro la tabla`); continue; }
    for (const c of i.columnas) if (!i.cabecera.includes(c)) out.push(`${i.nombre}: columna declarada "${c}" que la tabla no tiene`);
    for (const c of i.cabecera) if (!i.columnas.includes(c)) out.push(`${i.nombre}: columna "${c}" en la tabla, sin declarar en el frontmatter`);
  }
  if (manifiestoTxt == null) return out;
  const linea = /^\*\*[IÍ]ndices?:\*\*(.*)$/m.exec(manifiestoTxt);
  if (!linea) {
    if (declarados.length) out.push('MANIFIESTO.md: falta el campo Indices, que lista los Indices del subsistema con su origen');
    return out;
  }
  const listados = [...linea[1].matchAll(/`([^`]+\.md)`\s*\(([^)]+)\)/g)].map(m => ({ nombre: m[1], origen: m[2].trim() }));
  for (const i of declarados) {
    const l = listados.find(x => x.nombre === i.nombre);
    if (!l) out.push(`MANIFIESTO.md: no lista el Indice ${i.nombre}`);
    else if (l.origen !== ETIQUETA_ORIGEN[i.origen]) out.push(`MANIFIESTO.md: ${i.nombre} figura como "${l.origen}" y su frontmatter dice "${i.origen}"`);
  }
  for (const l of listados) {
    if (!declarados.some(i => i.nombre === l.nombre)) out.push(`MANIFIESTO.md: lista ${l.nombre}, que no existe o no declara frontmatter`);
  }
  return out;
}
// --- fin indices por frontmatter ---
const root = path.resolve(process.argv[2] || '.claude/herramientas');
// El registro se reparte entre uno o dos Indices (uno por origen): las filas salen de todos.
const indices = indicesDe(root, ['INDICE.md']);
const maniPath = path.join(root, 'MANIFIESTO.md');
const problemasIndices = problemasDeIndices(indices, fs.existsSync(maniPath) ? fs.readFileSync(maniPath, 'utf8') : null);
const nombresIndice = new Set(indices.map(i => i.nombre));
const idx = indices.map(i => i.texto).join('\n');

// subdirectorios = herramientas tipo script/tool que viven aca (skill/MCP viven en su casa nativa).
// El lint co-ubicado del propio subsistema (lint-<sub>) NO es una Herramienta: se excluye.
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
// La profundidad la fija el instalador; no depende de desde donde se invoque.
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
console.log(`\n[5] INDICES DECLARADOS (${problemasIndices.length}):`);
problemasIndices.forEach(p => console.log(`    ${p}`));
if (!problemasIndices.length) console.log(`    (${nombresIndice.size} indice(s), coherentes con el manifiesto)`);
```

## §Script — actualizar-plugins — `.claude/herramientas/actualizar-plugins/actualizar-plugins.js`

Herramienta del Agente Multipropósito, del subsistema `herramientas` (va en la sección `## Herramientas del Agente Multipropósito` del registro). Pone al día los plugins que traen el Agente Multipropósito a este repo: se sirven de una copia local del catálogo, y entre lo publicado, lo que tiene esa copia, lo instalado y lo que la sesión cargó al arrancar puede haber tres desfases distintos, ninguno de los cuales se anuncia solo.

Contenido exacto (Node, sin dependencias; consulta el commit publicado con `git ls-remote`, y sin salida a red estima con lo que hay en disco):

```js
#!/usr/bin/env node
// actualizar-plugins.js — pone al dia los PLUGINS del Agente Multiproposito en esta maquina.
//
// Un cambio viaja por varias paradas y CADA UNA guarda su copia: se publica en el repo remoto, de ahi
// se baja el MARKETPLACE (una carpeta por marketplace en la maquina), de ahi se INSTALA el plugin para
// un repo, y la SESION carga lo instalado al arrancar. Entre parada y parada puede haber desfase:
//   1) publicado <-> bajado      (el marketplace bajado no trajo lo ultimo)  -> se arregla con --aplicar
//   2) bajado    <-> instalado   (falta traer la version nueva)              -> se arregla con --aplicar
//   3) instalado <-> cargado     (se trajo pero la sesion no la tomo)        -> se arregla REINICIANDO
// El (1) y el (3) son los silenciosos: el (1) porque lo "disponible" sale del marketplace bajado, asi
// que uno viejo da ACTUALIZADO sobre datos viejos; el (3) porque `claude plugin list` dice la version
// nueva mientras la sesion corre la vieja.
//
//   node .claude/herramientas/actualizar-plugins/actualizar-plugins.js            (solo diagnostica)
//   node .claude/herramientas/actualizar-plugins/actualizar-plugins.js --aplicar  (actualiza)
//
// Sin argumentos NO toca nada: sirve como control de desfase disco<->cargado.
// Generico: no hardcodea nombres de plugin ni de marketplace — sale de `enabledPlugins` del repo.
// Sin process.exit(1): reporta, no frena — es capa mecanica, el juicio queda del lado del agente.

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');

const APLICAR = process.argv.includes('--aplicar');
const INDICE_AGENTE = process.argv.indexOf('--agente');
const AGENTE_PEDIDO = INDICE_AGENTE < 0 ? null : process.argv[INDICE_AGENTE + 1];
if (AGENTE_PEDIDO && !['claude', 'codex'].includes(AGENTE_PEDIDO)) {
  console.log('Agente invalido: usar --agente claude o --agente codex.');
  process.exit(0);
}
let ARRANQUE = null;   // se completa abajo, una sola vez (consultar el proceso cuesta ~150 ms)
// Acepta una ruta de repo como argumento (para apuntarlo a otro Agente Multiproposito de la maquina);
// por omision, el propio.
const RUTA_ARG = process.argv.slice(2).find((a, i, args) => !a.startsWith('--') && args[i - 1] !== '--agente');
// Sin argumento, el repo es el DIRECTORIO DE TRABAJO, no la ubicacion del script. La diferencia
// importa: la Herramienta tambien se corre desde el marketplace bajado (que es un clon del repo
// que la publica) cuando el repo destino todavia no la tiene. Deducir el repo desde __dirname
// hacia arriba daba, en ese caso, el marketplace bajado — y entonces diagnostica y ACTUALIZA el
// repo equivocado, en silencio y con salida tranquilizadora.
const REPO = RUTA_ARG ? path.resolve(RUTA_ARG) : process.cwd();
const PLUGINS_DIR = path.join(os.homedir(), '.claude', 'plugins');
// El comando que se sugiere es el que se acaba de invocar: la Herramienta se corre tanto desde el
// repo (.claude/herramientas/...) como desde el marketplace bajado, y sugerir la ruta fija manda a
// un archivo que en el repo destino puede no existir.
const COMANDO_APLICAR = '  node ' + JSON.stringify(process.argv[1])
  + (AGENTE_PEDIDO ? ` --agente ${AGENTE_PEDIDO}` : '')
  + (RUTA_ARG ? ' ' + JSON.stringify(RUTA_ARG) : '') + ' --aplicar';

function leerJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { return null; }
}

// -- catalogo de un marketplace bajado: se lee una vez por raiz --
// El cierre de dependencias vuelve sobre el mismo `marketplace.json` una vez por plugin declarado y
// otra por cada dependencia suya; releerlo en cada vuelta multiplica el disco sin cambiar la respuesta.
const CATALOGOS = new Map();
function catalogoDe(raiz) {
  if (!CATALOGOS.has(raiz)) CATALOGOS.set(raiz, leerJson(path.join(raiz, '.claude-plugin', 'marketplace.json')));
  return CATALOGOS.get(raiz);
}

// La fila del catalogo apunta con `source` a la carpeta del plugin; ahi vive su `plugin.json`.
// Devuelve el motivo en vez de un nulo pelado: "ausente del catalogo" y "manifiesto ilegible" se
// arreglan distinto, y quien llama necesita poder decir cual de los dos es.
function manifiestoDe(raiz, nombre) {
  const catalogo = catalogoDe(raiz);
  if (!catalogo || !Array.isArray(catalogo.plugins)) return { motivo: 'catalogo ilegible' };
  const fila = catalogo.plugins.find(p => p.name === nombre);
  if (!fila) return { motivo: 'ausente del catalogo' };
  const origen = fila.source === undefined ? '.' : fila.source;
  if (typeof origen !== 'string') return { motivo: 'se sirve de un origen propio, no del marketplace bajado' };
  const manifiesto = leerJson(path.join(raiz, origen, '.claude-plugin', 'plugin.json'));
  return manifiesto ? { manifiesto } : { motivo: 'plugin.json ilegible' };
}

// -- cierre de dependencias: todo lo que un plugin arrastra, en orden de instalacion --
// Un plugin que declara `dependencies` NO CARGA hasta que TODAS esten instaladas: Claude Code lo
// descarta entero (`error type: dependency-unsatisfied`) y sus skills no se registran. Medido el
// 28/07/2026 sobre un repo de prueba: sacada una dependencia de `amp`, el arranque procesa 7 plugins
// habilitados en vez de 8 y las cuatro skills de `amp` desaparecen. El aviso existe, pero solo en el
// registro de depuracion (`--debug`), que nadie mira, y nombra UNA sola de las que faltan.
// Por eso los plugins en juego para un repo no son los que declara `enabledPlugins`, sino su cierre.
function cerrarDependencias(raiz, nombres) {
  const orden = [], vistos = new Set(), faltantes = [];
  const requeridoPor = new Map();
  function visitar(nombre, padre) {
    if (vistos.has(nombre)) return;
    vistos.add(nombre);
    if (padre) requeridoPor.set(nombre, padre);
    const { manifiesto, motivo } = manifiestoDe(raiz, nombre);
    if (!manifiesto) { faltantes.push({ nombre, padre, motivo }); return; }
    for (const dep of manifiesto.dependencies || []) visitar(dep, nombre);
    orden.push(nombre);
  }
  for (const n of nombres) visitar(n, null);
  return { orden, requeridoPor, faltantes };
}

// -- Codex CLI -----------------------------------------------------------
// Codex y Claude Code guardan marketplaces y plugins en casas distintas. No se puede
// diagnosticar Codex leyendo ~/.claude: ahi puede haber un paquete completo mientras Codex
// no tiene siquiera el marketplace registrado. Detectar el runtime antes de consultar nada.
const AGENTE = AGENTE_PEDIDO || (process.env.CLAUDE_PID ? 'claude' : (process.env.CODEX_HOME || process.env.CODEX_CLI_PATH ? 'codex' : null));
const MARKETPLACE_AMP = 'xelnagah-harness';
const FUENTE_AMP = 'https://github.com/XelNagah/personal-claude-harness.git';
const CODEX_INSTALADO = path.join(process.env.LOCALAPPDATA || '', 'Programs', 'OpenAI', 'Codex', 'bin', 'codex.exe');
const EJECUTABLE_CODEX = process.env.CODEX_CLI_PATH || (fs.existsSync(CODEX_INSTALADO) ? CODEX_INSTALADO : 'codex');
// El sandbox de Codex reemplaza el CODEX_HOME del proceso hijo por un perfil vacio
// (CodexSandboxOffline). Fijar la casa real evita diagnosticar ese perfil aislado
// como si fuera la configuracion de la persona que invoco la Herramienta.
const CODEX_HOME_REAL = process.env.CODEX_HOME || path.join(os.homedir(), '.codex');

function correrCodex(args) {
  const r = spawnSync(EJECUTABLE_CODEX, args, {
    cwd: REPO,
    encoding: 'utf8',
    timeout: 180000,
    env: { ...process.env, CODEX_HOME: CODEX_HOME_REAL },
  });
  return { ok: r && r.status === 0, salida: ((r && (r.stdout || r.stderr)) || '').trim() };
}

function raizMarketplaceCodex() {
  const r = correrCodex(['plugin', 'marketplace', 'list']);
  if (!r.ok) return null;
  const linea = r.salida.split(/\r?\n/).find(l => l.trim().startsWith(MARKETPLACE_AMP));
  if (!linea) return null;
  const match = linea.trim().match(new RegExp(`^${MARKETPLACE_AMP}\\s+(.+)$`));
  return match ? match[1].trim() : null;
}

function bundleCodex(raiz) {
  const { orden, faltantes } = cerrarDependencias(raiz, ['amp']);
  // Codex instala el paquete entero, asi que un nombre irresoluble frena todo: sin el, el orden
  // que se devuelve estaria incompleto y la instalacion dejaria el repo a medias.
  if (faltantes.length) throw new Error(`${faltantes[0].nombre}: ${faltantes[0].motivo}`);
  return orden;
}

// `codex plugin list` es la fuente de verdad de lo que esta instalado y habilitado.
// `plugin add` es idempotente pero no informa si realmente cambio algo, por lo que no puede
// usarse como diagnostico: hacerlo para todo el bundle provocaba reinicios falsos.
function pluginsInstaladosCodex() {
  const r = correrCodex(['plugin', 'list']);
  if (!r.ok) return null;
  const filas = new Map();
  for (const linea of r.salida.split(/\r?\n/)) {
    const m = linea.match(/^\s*(\S+@xelnagah-harness)\s+(installed, enabled|not installed)\s*(\S*)/);
    if (m) filas.set(m[1], { instalado: m[2] === 'installed, enabled', version: m[3] || null });
  }
  return filas;
}

function pendientesCodex(raiz, orden) {
  const instalados = pluginsInstaladosCodex();
  if (!instalados) return { error: 'no se pudo leer `codex plugin list`', pendientes: [] };
  const pendientes = [];
  for (const nombre of orden) {
    const manifiesto = leerJson(path.join(raiz, 'funcionalidades', nombre, '.claude-plugin', 'plugin.json'));
    if (!manifiesto) return { error: `plugin.json ilegible: ${nombre}`, pendientes: [] };
    const actual = instalados.get(`${nombre}@${MARKETPLACE_AMP}`);
    // Los plugins del harness llevan version. Si algun dia uno se versiona por commit,
    // su presencia alcanza: no inventar una desigualdad que fuerce reinstalaciones eternas.
    if (!actual || !actual.instalado || (manifiesto.version && actual.version !== manifiesto.version)) {
      pendientes.push({ nombre, esperada: manifiesto.version || 'por commit', actual: actual && actual.version });
    }
  }
  return { pendientes };
}

function imprimirPendientesCodex(pendientes) {
  for (const p of pendientes) {
    console.log(`  ${p.nombre}@${MARKETPLACE_AMP}: ${p.actual || 'no instalado'} -> ${p.esperada}`);
  }
}

function actualizarEnCodex() {
  console.log(`== ACTUALIZAR PLUGINS (Codex): ${REPO} ==`);
  let raiz = raizMarketplaceCodex();
  if (!raiz) {
    console.log(`\nFALTA MARKETPLACE: ${MARKETPLACE_AMP} no esta configurado en Codex.`);
    if (!APLICAR) {
      console.log(`Para agregarlo y continuar: ${COMANDO_APLICAR.trim()}`);
      return;
    }
    const alta = correrCodex(['plugin', 'marketplace', 'add', FUENTE_AMP]);
    console.log(`\n> Agregando marketplace ${MARKETPLACE_AMP}...\n${alta.salida}`);
    if (!alta.ok) return;
    raiz = raizMarketplaceCodex();
  }
  if (!raiz) { console.log('\nNo se pudo ubicar la raiz del marketplace despues de agregarlo.'); return; }

  let orden;
  try { orden = bundleCodex(raiz); } catch (e) { console.log(`\nNo se pudo resolver el bundle: ${e.message}`); return; }

  if (!APLICAR) {
    const diagnostico = pendientesCodex(raiz, orden);
    if (diagnostico.error) { console.log(`\nSIN VERIFICAR: ${diagnostico.error}`); return; }
    if (!diagnostico.pendientes.length) {
      console.log(`\nTODO ACTUALIZADO: marketplace y bundle de Codex coinciden.`);
    } else {
      console.log(`\nACTUALIZAR (${diagnostico.pendientes.length}):`);
      imprimirPendientesCodex(diagnostico.pendientes);
      console.log(`\nPara aplicar: ${COMANDO_APLICAR.trim()}`);
    }
    return;
  }

  const refresco = correrCodex(['plugin', 'marketplace', 'upgrade', MARKETPLACE_AMP]);
  console.log(`\nMARKETPLACE ${MARKETPLACE_AMP}: ${refresco.ok ? 'ACTUALIZADO' : 'SIN VERIFICAR'}\n${refresco.salida}`);
  if (!refresco.ok) return;

  raiz = raizMarketplaceCodex() || raiz;
  try { orden = bundleCodex(raiz); } catch (e) { console.log(`\nNo se pudo resolver el bundle: ${e.message}`); return; }
  const diagnostico = pendientesCodex(raiz, orden);
  if (diagnostico.error) { console.log(`\nSIN VERIFICAR: ${diagnostico.error}`); return; }
  if (!diagnostico.pendientes.length) {
    console.log('\nTODO ACTUALIZADO: no se modifico ningun plugin; no hace falta reiniciar.');
    return;
  }
  console.log(`\nBUNDLE CODEX A ACTUALIZAR: ${diagnostico.pendientes.map(p => p.nombre).join(' -> ')}`);
  for (const { nombre } of diagnostico.pendientes) {
    const r = correrCodex(['plugin', 'add', `${nombre}@${MARKETPLACE_AMP}`]);
    console.log(`\n> ${nombre}@${MARKETPLACE_AMP}\n${r.salida}`);
    if (!r.ok) return;
  }
  const despues = pendientesCodex(raiz, orden);
  if (despues.error || despues.pendientes.length) {
    console.log(`\nACTUALIZACION INCOMPLETA: ${despues.error || 'todavia quedan plugins por actualizar.'}`);
    if (despues.pendientes.length) imprimirPendientesCodex(despues.pendientes);
    return;
  }
  console.log('\nPLUGINS ACTUALIZADOS. REINICIAR LA SESION para cargar las skills nuevas.');
}

if (AGENTE === 'codex') {
  actualizarEnCodex();
  process.exit(0);
}
if (!AGENTE) {
  console.log('== ACTUALIZAR PLUGINS ==\n\nNo se pudo saber si esta Herramienta fue invocada por Claude Code o Codex.');
  console.log('Usar --agente claude o --agente codex: cada uno guarda marketplaces y plugins en una configuracion distinta.');
  process.exit(0);
}

// git de una linea: devuelve la salida o null si el comando falla, no existe el repo o vence.
function gitEn(dir, args, timeout = 5000) {
  const r = spawnSync('git', args, { cwd: dir, encoding: 'utf8', timeout });
  if (!r || r.status !== 0) return null;
  return (r.stdout || '').trim() || null;
}

// Dos URLs de git apuntan al mismo repo: se compara <duenio>/<repo>, sin .git ni protocolo,
// para que "https://github.com/X/Y.git", "git@github.com:X/Y" y "X/Y" den todos lo mismo.
function mismoRemoto(a, b) {
  const cola = s => (s || '').trim().toLowerCase().replace(/\.git$/, '').replace(/\/+$/, '')
    .split(/[/:]/).filter(Boolean).slice(-2).join('/');
  return !!a && !!b && cola(a) === cola(b) && cola(a).includes('/');
}

function hace(iso) {
  const t = new Date(iso);
  if (isNaN(t.getTime())) return null;
  const min = Math.round((Date.now() - t.getTime()) / 60000);
  if (min < 60) return `hace ${min} min`;
  if (min < 60 * 48) return `hace ${Math.round(min / 60)} h`;
  return `hace ${Math.round(min / 1440)} dias`;
}

// -- cuando arranco esta sesion: los plugins que se actualizaron DESPUES no estan cargados --
// El harness expone el pid de la sesion en CLAUDE_PID. Si no se puede averiguar (otro agente, otro
// sistema), devuelve null y el chequeo de "cargado" se omite en vez de mentir.
function arranqueSesion() {
  // `CLAUDE_PID` es de la sesion que corre ESTE script, y esa sesion esta parada en el directorio
  // de trabajo. Si se apunto la Herramienta a OTRO repo (ruta por argumento), alla no hay sesion
  // abierta que conocer: comparar contra el arranque de la propia marcaria "sin cargar" plugins
  // que ninguna sesion tenia que haber cargado.
  if (RUTA_ARG) return null;
  const pid = process.env.CLAUDE_PID;
  if (!pid || !/^\d+$/.test(pid)) return null;
  try {
    let r;
    if (process.platform === 'win32') {
      r = spawnSync('powershell', ['-NoProfile', '-Command',
        `(Get-Process -Id ${pid}).StartTime.ToUniversalTime().ToString("o")`], { encoding: 'utf8', timeout: 10000 });
    } else {
      r = spawnSync('ps', ['-o', 'lstart=', '-p', pid], { encoding: 'utf8', timeout: 10000 });
    }
    const t = (r.stdout || '').trim();
    if (!t) return null;
    const d = new Date(t);
    return isNaN(d.getTime()) ? null : d;
  } catch (e) { return null; }
}

// -- que plugins DECLARA este repo: enabledPlugins del settings del repo + el del usuario --
// Ojo: lo declarado no es lo que el repo necesita. `enabledPlugins` es la foto del momento en que se
// instalo, y no se mueve cuando un plugin ya instalado suma dependencias en una version posterior.
function pluginsHabilitados() {
  const ids = new Set();
  const fuentes = [
    path.join(REPO, '.claude', 'settings.json'),
    path.join(REPO, '.claude', 'settings.local.json'),
    path.join(os.homedir(), '.claude', 'settings.json'),
  ];
  for (const f of fuentes) {
    const j = leerJson(f);
    if (!j || !j.enabledPlugins) continue;
    for (const [id, on] of Object.entries(j.enabledPlugins)) if (on) ids.add(id);
  }
  return [...ids];
}

// -- version que CORRE: la entrada de installed_plugins.json que aplica a este repo --
function instalado(id) {
  const j = leerJson(path.join(PLUGINS_DIR, 'installed_plugins.json'));
  const entradas = (j && j.plugins && j.plugins[id]) || [];
  // El registro guarda UNA ENTRADA POR REPO (`projectPath`): dos repos de la misma maquina pueden
  // correr versiones distintas del mismo plugin. Asi que vale la entrada de ESTE repo, la de alcance
  // usuario (aplica a todos) o una sin repo declarado — NUNCA la de otro repo: dar por instalado acá
  // lo que esta instalado allá es el modo de falla que este script existe para no cometer.
  const propia = entradas.find(e => e.projectPath && path.resolve(e.projectPath) === REPO);
  const usuario = entradas.find(e => e.scope === 'user');
  const sinRepo = entradas.find(e => !e.projectPath);
  return propia || usuario || sinRepo || null;
}

function marketplaceRegistrado(marketplace) {
  const mkts = leerJson(path.join(PLUGINS_DIR, 'known_marketplaces.json')) || {};
  return mkts[marketplace] || null;
}

// -- version que declara un marketplace: sirve para el bajado y para el repo que lo publica --
// `raiz` es la carpeta que contiene `.claude-plugin/marketplace.json`; ese archivo apunta con
// `source` a la carpeta de cada plugin, y ahi vive el `plugin.json` con la version.
function versionDe(raiz, nombre) {
  const catalogo = catalogoDe(raiz);
  if (!catalogo || !Array.isArray(catalogo.plugins)) return { error: 'catalogo ilegible' };
  const fila = catalogo.plugins.find(p => p.name === nombre);
  // Habilitado pero ausente del catalogo = el marketplace ya no lo ofrece (renombrado o dado de baja).
  // No es "sin dato": es un plugin colgado, y actualizarlo no lo arregla — hay que migrar los nombres.
  if (!fila) return { retirado: true };
  // `source` es una ruta relativa dentro del marketplace ("./funcionalidades/amp"). Algunos marketplaces
  // lo declaran como objeto (origen remoto propio): ahi el manifiesto no esta en la carpeta bajada.
  const origen = fila.source === undefined ? '.' : fila.source;
  if (typeof origen !== 'string') return { error: 'el plugin se sirve de un origen propio, no del marketplace bajado' };
  const manifiesto = leerJson(path.join(raiz, origen, '.claude-plugin', 'plugin.json'));
  if (!manifiesto) return { error: 'plugin.json ilegible' };
  // Sin campo `version` el plugin se versiona por commit: se compara el sha del arbol.
  if (!manifiesto.version) return { version: null, sha: gitEn(raiz, ['rev-parse', 'HEAD']) };
  return { version: manifiesto.version, sha: null };
}

// -- version DISPONIBLE: la del marketplace bajado, leyendo el plugin.json que apunta su catalogo --
function disponible(nombre, marketplace) {
  const mkt = marketplaceRegistrado(marketplace);
  if (!mkt || !mkt.installLocation) return { error: 'marketplace no registrado' };
  return versionDe(mkt.installLocation, nombre);
}

// -- primer desfase: el MARKETPLACE BAJADO atrasado respecto de lo PUBLICADO --
// Todo lo "disponible" de mas abajo sale del marketplace bajado, que se refresca solo en segundo plano:
// entre que se publica una version y el bajado la trae, la comparacion diria ACTUALIZADO sobre datos viejos.
// Se pregunta al remoto (barato, ~0.6 s, y no toca lo bajado: `ls-remote` no trae ni escribe nada) y,
// si no hay salida a red, se estima con lo que hay en disco en vez de dar por bueno lo no verificado.
//
// El estado es la ACCION que corresponde, no el diagnostico: `ACTUALIZADO` (verificado, no hay nada que
// hacer) o `ACTUALIZAR` (esta atrasado, o no se pudo verificar que no lo este). Los dos casos se
// resuelven igual y refrescar de mas sale casi nada — se comparan las versiones, no difieren, sigue.
// El motivo puntual queda en el detalle, que se lee solo si interesa.
function estadoCatalogo(marketplace, nombres) {
  const mkt = marketplaceRegistrado(marketplace);
  if (!mkt || !mkt.installLocation) return { estado: 'SIN DATO', detalle: 'marketplace no registrado' };
  const bajado = mkt.installLocation;
  const local = gitEn(bajado, ['rev-parse', 'HEAD']);
  // Un marketplace servido de una carpeta de la maquina no tiene "publicado" contra que comparar.
  if (!local) return { estado: 'N/A', detalle: 'no se trae de un repo git (marketplace servido de una carpeta)' };

  const publicado = (gitEn(bajado, ['ls-remote', 'origin', 'HEAD']) || '').split(/\s+/)[0] || null;
  if (publicado) {
    if (publicado === local) return { estado: 'ACTUALIZADO', detalle: `bajado ${local.slice(0, 12)} = publicado` };
    return {
      estado: 'ACTUALIZAR',
      detalle: `bajado ${local.slice(0, 12)} · publicado ${publicado.slice(0, 12)}`,
      versiones: versionesQueFaltan(marketplace, mkt, bajado, nombres),
    };
  }

  // Sin red: estimar. Si este repo es el que PUBLICA el marketplace, su arbol es la mejor referencia
  // que hay en disco — y es justo el caso del autor, que acaba de publicar y todavia no le llego.
  const origenRepo = gitEn(REPO, ['remote', 'get-url', 'origin'], 3000);
  const declarado = (mkt.source && (mkt.source.repo || mkt.source.url)) || null;
  if (mismoRemoto(origenRepo, declarado)) {
    const headRepo = gitEn(REPO, ['rev-parse', 'HEAD']);
    if (headRepo && headRepo !== local) return {
      estado: 'ACTUALIZAR',
      detalle: `sin red: bajado ${local.slice(0, 12)} · este repo (lo publica) ${headRepo.slice(0, 12)}`,
      versiones: versionesQueFaltan(marketplace, mkt, bajado, nombres),
    };
    if (headRepo) return { estado: 'ACTUALIZADO', detalle: `sin red: bajado ${local.slice(0, 12)} = este repo, que lo publica` };
  }
  const edad = mkt.lastUpdated ? hace(mkt.lastUpdated) : null;
  return {
    estado: 'ACTUALIZAR',
    detalle: `sin salida a red · el marketplace se bajo ${edad || 'en fecha desconocida'}`,
  };
}

// Cuando el marketplace bajado quedo atras, decir QUE cambia: se comparan las versiones que declara
// lo bajado contra las del repo que lo publica, si esta en esta maquina. Sin ese repo no se
// puede saber (leer el arbol del remoto exigiria traerlo, que es lo que hace `--aplicar`).
function versionesQueFaltan(marketplace, mkt, bajado, nombres) {
  const origenRepo = gitEn(REPO, ['remote', 'get-url', 'origin'], 3000);
  const declarado = (mkt.source && (mkt.source.repo || mkt.source.url)) || null;
  if (!mismoRemoto(origenRepo, declarado)) return null;
  const cambios = [];
  for (const n of nombres) {
    const enCatalogo = versionDe(bajado, n);
    const enRepo = versionDe(REPO, n);
    if (!enCatalogo.version || !enRepo.version) continue;
    if (enCatalogo.version !== enRepo.version) cambios.push(`${n}: bajado ${enCatalogo.version} · este repo ${enRepo.version}`);
  }
  return cambios.length ? cambios : null;
}

// Los estados que `--aplicar` sabe resolver. Cambiar esta lista alcanza: el resumen final y el
// bucle de aplicacion la leen los dos, asi que no puede haber un estado que se informe y no se toque.
const DESFASADOS = ['ACTUALIZAR', 'NO INSTALADO', 'SIN DECLARAR'];

// -- cuarto desfase: DECLARADO <-> REQUERIDO, el que no deja rastro --
// Los tres desfases del encabezado se ven porque el plugin tiene fila. Este no: la dependencia que
// `enabledPlugins` nunca nombro no aparece en ningun lado, y el plugin que la requiere no carga.
// No es `NO INSTALADO` — ese estado es para un plugin que el repo SI declara. Este ni siquiera se
// declaro, asi que lleva estado propio, `SIN DECLARAR`.
// Una fila por dependencia que el cierre exige y `enabledPlugins` no nombra.
function filasSinDeclarar(declarados) {
  const filas = [];
  const yaDeclarado = new Set(declarados);
  const porMarketplace = new Map();
  for (const id of declarados) {
    const [nombre, marketplace] = id.split('@');
    if (!marketplace) continue;
    if (!porMarketplace.has(marketplace)) porMarketplace.set(marketplace, []);
    porMarketplace.get(marketplace).push(nombre);
  }
  // El cierre se resuelve marketplace por marketplace: cada uno declara sus dependencias en SU catalogo.
  for (const [marketplace, nombres] of porMarketplace) {
    const mkt = marketplaceRegistrado(marketplace);
    // Sin catalogo bajado no hay dependencias que leer. No se inventa nada: los plugins de ese
    // marketplace ya salen `SIN DATO` en el diagnostico de arriba, que es donde se ve el problema.
    if (!mkt || !mkt.installLocation) continue;
    const { orden, requeridoPor, faltantes } = cerrarDependencias(mkt.installLocation, nombres);
    // El alcance con el que se instala una dependencia es el del plugin que la pide: no tiene entrada
    // propia de la cual sacarlo, y mezclar alcances deja al CLI sin encontrar lo que acaba de instalar.
    const alcanceDe = padre => {
      const inst = padre ? instalado(`${padre}@${marketplace}`) : null;
      return (inst && inst.scope) || 'local';
    };
    for (const nombre of orden) {
      const id = `${nombre}@${marketplace}`;
      if (yaDeclarado.has(id)) continue;
      const padre = requeridoPor.get(nombre);
      const inst = instalado(id);
      filas.push({
        id, nombre, marketplace, padre,
        estado: 'SIN DECLARAR',
        detalle: `lo requiere ${padre}, y este repo no lo declara en enabledPlugins`
          + (inst ? ' · instalado pero sin habilitar' : ' · sin instalar'),
        sinCargar: false,
        scope: alcanceDe(padre),
      });
    }
    // Una dependencia que el catalogo no ofrece no se puede instalar: se dice, no se omite.
    for (const { nombre, padre, motivo } of faltantes) {
      if (!padre || yaDeclarado.has(`${nombre}@${marketplace}`)) continue;
      filas.push({
        id: `${nombre}@${marketplace}`, nombre, marketplace,
        estado: 'SIN DATO',
        detalle: `lo requiere ${padre}, pero en ${marketplace}: ${motivo}`,
        sinCargar: false,
        scope: alcanceDe(padre),
      });
    }
  }
  return filas;
}

// -- diagnostico: una fila por plugin declarado, mas las dependencias que ninguno declara --
function diagnosticar() {
  // El catalogo se cachea por raiz durante UNA pasada de diagnostico. Se olvida al empezar la
  // siguiente porque entre medio `--aplicar` refresca el marketplace bajado: comparar contra el
  // catalogo viejo es exactamente el primer desfase que esta Herramienta existe para no cometer.
  CATALOGOS.clear();
  const filas = [];
  const declarados = pluginsHabilitados();
  for (const id of declarados.slice().sort()) {
    const [nombre, marketplace] = id.split('@');
    if (!marketplace) continue;   // plugin sin marketplace (skills-dir u otra fuente): no aplica
    const inst = instalado(id);
    const disp = disponible(nombre, marketplace);
    let estado, detalle;
    if (disp.retirado) {
      estado = 'RETIRADO';
      detalle = `habilitado, pero ${marketplace} ya no lo ofrece (renombrado o dado de baja)`;
    } else if (!inst) {
      estado = 'NO INSTALADO';
      detalle = 'habilitado en settings pero sin entrada instalada';
    } else if (disp.error) {
      estado = 'SIN DATO';
      detalle = disp.error;
    } else if (disp.version) {
      estado = inst.version === disp.version ? 'ACTUALIZADO' : 'ACTUALIZAR';
      detalle = `corre ${inst.version} · disponible ${disp.version}`;
    } else if (disp.sha) {
      const igual = (inst.gitCommitSha || '').startsWith(disp.sha.slice(0, 12));
      estado = igual ? 'ACTUALIZADO' : 'ACTUALIZAR';
      detalle = `versiona por commit · corre ${(inst.gitCommitSha || '?').slice(0, 12)} · disponible ${disp.sha.slice(0, 12)}`;
    } else {
      estado = 'SIN DATO';
      detalle = 'no se pudo determinar la version disponible';
    }
    // Segundo desfase: se trajo la version nueva DESPUES de que arranco la sesion => no esta cargada.
    let sinCargar = false;
    if (ARRANQUE && inst && inst.lastUpdated) {
      const t = new Date(inst.lastUpdated);
      if (!isNaN(t.getTime()) && t > ARRANQUE) sinCargar = true;
    }
    filas.push({ id, nombre, marketplace, estado, detalle, sinCargar, scope: (inst && inst.scope) || 'local' });
  }
  // Al final, y no intercaladas: son las que ninguna corrida anterior nombraba.
  return filas.concat(filasSinDeclarar(declarados));
}

// Una linea por marketplace en juego (no por plugin): lo bajado es compartido por todos sus plugins.
function imprimirCatalogos(filas) {
  const nombresPorMkt = new Map();
  for (const f of filas) {
    if (!nombresPorMkt.has(f.marketplace)) nombresPorMkt.set(f.marketplace, []);
    nombresPorMkt.get(f.marketplace).push(f.nombre);
  }
  const salida = [];
  for (const [m, nombres] of nombresPorMkt) salida.push({ marketplace: m, ...estadoCatalogo(m, nombres) });
  const ancho = Math.max(...salida.map(c => c.marketplace.length), 10);
  console.log('\nMARKETPLACES BAJADOS (de donde sale lo "disponible" de arriba)\n');
  for (const c of salida) {
    console.log(`  ${c.marketplace.padEnd(ancho)}  ${c.estado.padEnd(15)} ${c.detalle}`);
    for (const v of (c.versiones || [])) console.log(`  ${' '.repeat(ancho)}  ${' '.repeat(15)} ${v}`);
  }
  return salida;
}

function imprimir(filas) {
  const ancho = Math.max(...filas.map(f => f.id.length), 10);
  for (const f of filas) {
    const marca = f.sinCargar ? ' [SIN CARGAR]' : '';
    console.log(`  ${f.id.padEnd(ancho)}  ${f.estado.padEnd(15)} ${f.detalle}${marca}`);
  }
}

// -- aplicar: refrescar el catalogo del marketplace y actualizar lo desactualizado --
// El CLI exige el identificador COMPLETO (plugin@marketplace) y el alcance: con el nombre pelado
// o con el alcance por omision falla con el mismo mensaje, `Plugin "x" not found`.
function aplicar(filas) {
  // `--scope project` y `--scope local` significan los dos "el repo del directorio donde corre el
  // comando", asi que TODO spawn va con `cwd: REPO`. Sin eso, apuntar la Herramienta a otro repo
  // diagnosticaria alla y escribiria aca — el mismo error que corrige `instalado()`.
  const correr = args => {
    const r = spawnSync('claude', args, { cwd: REPO, encoding: 'utf8', shell: true, timeout: 180000 });
    return ((r.stdout || r.stderr || '').trim().split('\n').pop() || 'sin salida');
  };

  const marketplaces = [...new Set(filas.map(f => f.marketplace))];
  for (const m of marketplaces) {
    console.log(`\n> Refrescando el marketplace ${m}...`);
    console.log('  ' + correr(['plugin', 'marketplace', 'update', m]));
  }

  // Releer: refrescar el marketplace puede haber cambiado que esta desactualizado.
  const pendientes = diagnosticar().filter(f => DESFASADOS.includes(f.estado));
  if (!pendientes.length) {
    console.log('\nNada que actualizar despues de refrescar el marketplace.');
    return;
  }
  for (const f of pendientes) {
    // Lo que no esta se INSTALA; lo que esta y quedo atras se ACTUALIZA. `update` sobre un plugin
    // ausente falla con "not found", que se lee como si el nombre estuviera mal.
    // Y se relee el estado en cada vuelta: instalar un plugin con dependencias arrastra las suyas,
    // asi que las que venian pendientes pueden haber entrado solas.
    const yaEsta = instalado(f.id);
    if (f.estado === 'SIN DECLARAR') {
      // Una dependencia se instala SIEMPRE por su nombre, nunca reinstalando al que la pide.
      // Medido el 28/07/2026: `claude plugin install amp` sobre un repo al que le faltaban tres
      // dependencias reparo UNA por corrida (`+ 1 dependency`), y `claude plugin update amp`
      // contesto "already at the latest version" sin instalar ninguna. Confiar en el arrastre deja
      // el repo a medio arreglar y con salida tranquilizadora.
      if (pluginsHabilitados().includes(f.id)) {
        console.log(`\n> ${f.id}: entro como dependencia de otro, ya quedo declarado.`);
        continue;
      }
      console.log(`\n> Instalando ${f.id}, que requiere ${f.padre} (alcance ${f.scope})...`);
      console.log('  ' + correr(['plugin', 'install', f.id, '--scope', f.scope]));
      continue;
    }
    if (f.estado === 'NO INSTALADO' && yaEsta) {
      console.log(`\n> ${f.id}: entro como dependencia, no hace falta instalarlo aparte.`);
      continue;
    }
    const accion = yaEsta ? 'update' : 'install';
    console.log(`\n> ${accion === 'install' ? 'Instalando' : 'Actualizando'} ${f.id} (alcance ${f.scope})...`);
    console.log('  ' + correr(['plugin', accion, f.id, '--scope', f.scope]));
  }
}

// ---------------------------------------------------------------------------
console.log(`== ACTUALIZAR PLUGINS: ${REPO} ==`);

ARRANQUE = arranqueSesion();
let filas = diagnosticar();
if (!filas.length) {
  console.log('\nNingun plugin habilitado para este repo (enabledPlugins vacio o ausente).');
} else {
  console.log('');
  imprimir(filas);

  const desfasados = filas.filter(f => DESFASADOS.includes(f.estado));
  const retirados = filas.filter(f => f.estado === 'RETIRADO');
  const sinDeclarar = filas.filter(f => f.estado === 'SIN DECLARAR');

  // Se explica antes de cualquier otra cosa: es el unico desfase que deja al repo sin las skills
  // del plugin que las trae, y el unico que hasta esta version no aparecia en ninguna tabla.
  if (sinDeclarar.length) {
    console.log(`\n${sinDeclarar.length} dependencia(s) SIN DECLARAR: otro plugin las requiere y este repo`);
    console.log('no las nombra. `enabledPlugins` es la foto de cuando se instalo, y no se mueve cuando una');
    console.log('version posterior suma dependencias. El plugin que las pide NO CARGA hasta que esten:');
    console.log('Claude Code lo descarta entero y sus skills no se registran, sin avisar en la sesion.');
    for (const f of sinDeclarar) console.log(`  ${f.id} — lo requiere ${f.padre}`);
  }

  // Estado de lo bajado: sin esto, lo "disponible" de la tabla de arriba no se puede creer.
  const catalogos = imprimirCatalogos(filas);
  const catalogoDudoso = catalogos.filter(c => c.estado === 'ACTUALIZAR');

  if (APLICAR) {
    aplicar(filas);
    console.log('\n-- despues de aplicar --\n');
    filas = diagnosticar();
    imprimir(filas);
    console.log('\nREINICIAR LA SESION para que los cambios tomen efecto.');
    console.log('(`/reload-plugins` no alcanza: recarga los plugins en la version que ya tenian.)');
  } else if (desfasados.length) {
    console.log(`\n${desfasados.length} plugin(s) con desfase. Para nivelarlos:`);
    console.log(COMANDO_APLICAR);
  } else if (catalogoDudoso.length) {
    console.log('\nCADA PLUGIN COINCIDE CON LO BAJADO, PERO EL MARKETPLACE HAY QUE ACTUALIZARLO');
    console.log('(esta atrasado, o no se pudo verificar que no lo este). Refrescarlo y volver a comparar:');
    console.log(COMANDO_APLICAR);
  } else if (!retirados.length && !filas.some(f => f.sinCargar)) {
    console.log('\nTODO ACTUALIZADO.');
  }

  // Desfase silencioso: la version esta instalada pero la sesion arranco antes de traerla.
  const sinCargar = filas.filter(f => f.sinCargar);
  if (sinCargar.length) {
    console.log(`\n${sinCargar.length} plugin(s) SIN CARGAR: se actualizaron despues de que arranco esta`);
    console.log('sesion, asi que segui corriendo la version vieja aunque el registro diga la nueva.');
    console.log('REINICIAR LA SESION para tomarlos.');
    console.log('  ' + sinCargar.map(f => `${f.id} (traido ${f.detalle.replace(/^.*disponible /, '')})`).join('\n  '));
  } else if (!ARRANQUE) {
    console.log(RUTA_ARG
      ? '\n(Chequeo de "sin cargar" omitido: se apunto a otro repo, y alla no hay sesion que mirar.)'
      : '\n(No se pudo determinar cuando arranco la sesion: el chequeo de "sin cargar" se omitio.)');
  }

  // Los retirados no se arreglan actualizando: son nombres que el marketplace dejo de ofrecer.
  // Se imprime el comando y NO se ejecuta, ni siquiera con --aplicar: desinstalar es destructivo y
  // NO es reversible desde el marketplace (esos nombres ya no estan ahi para volver a instalarlos).
  // Ademas, sacar lo viejo antes de que entre lo nuevo deja el repo sin skills — de ahi el orden.
  if (retirados.length) {
    console.log(`\n${retirados.length} plugin(s) RETIRADO(S): este repo quedo en una generacion de nombres`);
    console.log('que el marketplace ya no ofrece. Actualizar no los arregla: hay que instalar el conjunto');
    console.log('nuevo y recien despues sacar estos (migracion, no actualizacion).');
    console.log('\nORDEN: 1) instalar lo nuevo  2) desinstalar lo viejo  3) reiniciar la sesion.');
    console.log('Nunca al reves: entre medio el repo se queda sin las skills que todavia usa.');
    console.log('\nPara el paso 2, cuando lo nuevo ya este instalado (ojo el alcance de cada uno:');
    console.log('es normal que los viejos esten en project y los nuevos en local, y con el alcance');
    console.log('equivocado el comando no encuentra nada y no borra nada, sin error claro):');
    for (const f of retirados) console.log(`  claude plugin uninstall ${f.id} --scope ${f.scope}`);
    console.log('\nCada uninstall saca solo su linea de `enabledPlugins`; no hace falta editar el settings');
    console.log('a mano. `claude plugin prune` NO sirve para limpiar acá: solo mira el alcance de usuario.');
  }
}
```

Ficha `.claude/herramientas/actualizar-plugins/README.md`:

````markdown
# actualizar-plugins

Prepara el marketplace y los **plugins** que este Agente con Propósito usa en Claude Code o Codex antes de nivelar sus archivos. Evita diagnosticar un agente mirando la configuración del otro.

```bash
# diagnostica, no toca nada
node .claude/herramientas/actualizar-plugins/actualizar-plugins.js --agente claude

# diagnostica Codex, sin tocar nada
node .claude/herramientas/actualizar-plugins/actualizar-plugins.js --agente codex

# actualiza lo que esté atrás y vuelve a verificar
node .claude/herramientas/actualizar-plugins/actualizar-plugins.js --agente codex --aplicar

# apuntarlo a otro repo de la máquina
node .claude/herramientas/actualizar-plugins/actualizar-plugins.js --agente claude "D:/Proyectos/otro-repo"
```

`amp:actualizar` elige el agente y ejecuta esta Herramienta con el argumento correspondiente; quien la usa no tiene que recordarlo. Si se corre el script a mano y no recibe `--agente`, solo acepta una detección inequívoca del proceso; ante duda pide el argumento en vez de revisar el estado equivocado.

## Claude Code y Codex

Los dos agentes guardan marketplaces y plugins en configuraciones distintas. Con `--agente claude`, la Herramienta conserva el diagnóstico por repo, los alcances y las versiones instaladas de Claude Code. Con `--agente codex`, verifica el marketplace `xelnagah-harness`; `--aplicar` lo agrega si falta, lo actualiza y reinstala `amp` junto con todas sus dependencias. En ambos casos termina pidiendo reiniciar la sesión antes de tocar archivos.

## Por qué hace falta

Hay **cuatro desfases distintos**, y todos menos el segundo engañan:

1. **Publicado ↔ bajado** — el marketplace bajado todavía no trajo lo último. Engaña porque *todo lo demás se compara contra lo bajado*: si está viejo, un plugin atrasado se informa `ACTUALIZADO`. Se arregla con `--aplicar`.
2. **Bajado ↔ instalado** — el marketplace bajado tiene una versión nueva que esta máquina no instaló. Se arregla con `--aplicar`.
3. **Instalado ↔ cargado** — se instaló, pero la **sesión viva** sigue con la versión que cargó al arrancar. Se arregla **reiniciando**, y es silencioso: `claude plugin list` muestra la versión nueva mientras la sesión corre la vieja.
4. **Declarado ↔ requerido** — un plugin instalado exige dependencias que el repo nunca declaró, así que **no carga** y sus skills no existen en la sesión. Es el que más engaña: los otros tres al menos dejan una fila. Se arregla con `--aplicar`, y da el estado `SIN DECLARAR`.

Los tres primeros pasaron el 25/07/2026:

- Por la tarde, `amp` corría la 0.6.2 con la 0.6.3 publicada seis commits atrás. La versión vieja no tenía una preferencia Base que sí estaba escrita en el repo, así que el instalador habría sembrado preferencias viejas en un repo nuevo.
- A la noche, después de publicar la 0.6.5, el plugin **se trajo solo en segundo plano** (registro actualizado 00:12) pero la sesión —arrancada a las 19:34— siguió ejecutando la 0.6.3. La skill se cargó desde la carpeta vieja de la caché sin que nada lo indicara.
- Más tarde, publicada la 0.6.6, el marketplace bajado se había refrescado **doce minutos antes** del push. La Herramienta informó `TODO ACTUALIZADO` sobre un catálogo que no tenía la versión nueva: lo instalado coincidía con lo bajado, y lo bajado estaba viejo.

El cuarto se midió el 28/07/2026 sobre un repo consumidor y sobre un repo de prueba:

- El consumidor tenía `amp` 0.7.1 instalado y cinco de sus ocho dependencias. La Herramienta informaba `TODO ACTUALIZADO` y la sesión no tenía ninguna de las cuatro skills de `amp`. En el registro de depuración estaba el motivo —`error type: dependency-unsatisfied`—, pero ahí no lo mira nadie, y nombra **una sola** de las tres que faltaban.
- Sacada una dependencia en el repo de prueba, el arranque procesa 7 plugins habilitados en vez de 8: Claude Code descarta el plugin **entero**, no la dependencia.
- `claude plugin update amp` contesta *"already at the latest version"* y no instala ninguna. `claude plugin install amp`, sobre un repo al que le faltan tres, repara **una por corrida**. De ahí que la Herramienta instale cada dependencia por su nombre en vez de confiar en el arrastre.

De ahí salen los dos chequeos que no se leen de un archivo:

- **Cargado**: se compara la hora en que se actualizó cada plugin contra la hora en que arrancó la sesión (por `CLAUDE_PID`). Si el plugin es más nuevo, lo marca `[SIN CARGAR]`. Si no puede averiguar el arranque —otro agente, otro sistema— lo dice y omite ese chequeo, en vez de dar por buena una comparación que no hizo.
- **Catálogo**: se le pregunta al remoto por el commit publicado con `git ls-remote` (~0,6 s, y no toca lo bajado: no trae ni escribe nada). Sin salida a red hay una reserva, abajo.

## Qué compara

Por cada plugin habilitado para el repo (`enabledPlugins` de `.claude/settings.json`, `settings.local.json` y el del usuario) **y por cada dependencia que esos plugins arrastran**, aunque el repo no la declare:

| Estado | Qué significa |
|--------|---------------|
| `ACTUALIZADO` | Lo que corre coincide con lo disponible |
| `ACTUALIZAR` | Hay versión nueva sin traer |
| `RETIRADO` | Está habilitado pero el marketplace ya no lo ofrece — el repo quedó en una generación de nombres vieja. **Actualizar no lo arregla**: es una migración (desinstalar los nombres viejos, instalar el conjunto nuevo) |
| `NO INSTALADO` | Habilitado en `settings` pero sin entrada instalada |
| `SIN DECLARAR` | Otro plugin la requiere y este repo **no la nombra** en `enabledPlugins`. El que la pide no carga: Claude Code lo descarta entero y sus skills no se registran. No es `NO INSTALADO` — ese estado es para un plugin que el repo sí declara |
| `SIN DATO` | El plugin se sirve de un origen propio, el catálogo no se pudo leer, o una dependencia requerida no está en el catálogo |

Y una marca aparte, que se suma a cualquiera de esos estados:

| Marca | Qué significa |
|-------|---------------|
| `[SIN CARGAR]` | El plugin se actualizó **después** de que arrancó esta sesión: está instalado pero la sesión sigue con la versión vieja. No se arregla con `--aplicar` — hay que **reiniciar** |

- **Lo requerido** sale del `plugin.json` de cada plugin dentro del marketplace bajado, recorriendo `dependencies` en cadena. `enabledPlugins` no sirve para esto: es la foto del momento en que se instaló, y no se mueve cuando una versión posterior suma dependencias.
- **Lo instalado** sale de `installed_plugins.json`, prefiriendo la entrada de este repo sobre la de alcance usuario.
- **Lo disponible** sale del `plugin.json` dentro del marketplace bajado. Si ese manifiesto no declara `version`, el plugin se versiona por commit y se comparan los sha.
- **Lo cargado** no se lee: se deduce comparando el `lastUpdated` de cada plugin contra la hora de arranque del proceso de la sesión (`CLAUDE_PID`). Si el plugin es posterior, no está cargado.

## El estado de los marketplaces bajados

Una línea por marketplace, no por plugin: lo bajado es compartido por todos los plugins que sirve, y de ahí sale la columna *disponible*.

La columna dice **la acción que corresponde**, no el diagnóstico:

| Estado | Qué significa |
|--------|---------------|
| `ACTUALIZADO` | Verificado: lo bajado está en el mismo commit que lo publicado. No hay nada que hacer |
| `ACTUALIZAR` | Lo bajado está atrasado, **o** no se pudo verificar que no lo esté. Los dos casos se resuelven igual, y refrescar de más sale casi nada: se comparan las versiones, no difieren, sigue. El motivo puntual queda en el detalle de al lado |
| `N/A` | El registro declara un marketplace servido desde una carpeta local: no hay "publicado" contra qué comparar |

Se averigua por dos vías, en orden:

1. **Por red** — `git ls-remote origin HEAD` sobre el marketplace bajado devuelve el commit publicado sin traer nada. Es la vía normal: **0,6 s**.
2. **Sin red** — si la consulta falla o vence (5 s), queda `ACTUALIZAR`: no hay evidencia de qué commit tiene GitHub. Si la Herramienta corre desde el repo que publica el marketplace, compara además ese commit con el checkout bajado para explicar el desfase, pero nunca lo convierte en `ACTUALIZADO` sin consultar el remoto.

Cuando lo bajado está en `ACTUALIZAR` **y** el repo desde donde se corre es el que publica, se listan además las versiones que cambian (`amp: bajado 0.6.5 · este repo 0.6.6`). Desde un consumidor eso no se puede saber: leer el árbol del remoto exigiría traerlo, que es lo que hace `--aplicar`.

⚠️ Con un marketplace en `ACTUALIZAR`, la Herramienta **no dice `TODO ACTUALIZADO`** aunque cada plugin coincida con lo bajado: avisa que la comparación se hizo contra datos que pueden estar viejos y remite a `--aplicar`.

Es genérico: no hardcodea nombres de plugin ni de marketplace, así que también reporta los plugins ajenos al harness que el repo tenga habilitados.

## Apuntarla a otro repo

Pasándole una ruta diagnostica —y con `--aplicar`, arregla— **otro** Agente con Propósito de la máquina, sin abrir una sesión ahí. Tres cosas cambian respecto de correrla sobre el propio, y las tres son casos donde antes contestaba de más:

- **Lo instalado es por repo.** `installed_plugins.json` guarda una entrada por `projectPath`: dos repos de la misma máquina pueden correr versiones distintas del mismo plugin. Sin entrada propia (ni de alcance usuario) el plugin está `NO INSTALADO` — nunca se toma la entrada de otro repo.
- **Los comandos corren en el repo apuntado.** `--scope project` significa "el proyecto del directorio donde corre el comando", así que todo se lanza con ese directorio como raíz. Sin eso, diagnosticaría allá y escribiría acá.
- **El chequeo de `[SIN CARGAR]` se omite.** Se deduce del arranque de la sesión que ejecuta el script, y en el repo apuntado no hay ninguna sesión que mirar. Se dice explícitamente en vez de marcar plugins que nadie tenía que haber cargado.

## Qué corre con `--aplicar`

```
claude plugin marketplace update <marketplace>
claude plugin update <plugin>@<marketplace> --scope <alcance>
```

⚠️ Las dos partes del segundo comando son obligatorias: con el nombre pelado (`claude plugin update amp`) o con el alcance por omisión falla con el mismo mensaje, `Plugin "amp" not found`, que no dice cuál de las dos falta. Por eso conviene correr esto y no los comandos a mano.

Refresca el catálogo primero y **vuelve a diagnosticar** antes de actualizar: traer el catálogo puede cambiar qué está atrasado.

**Después hay que reiniciar la sesión.** `/reload-plugins` no alcanza: recarga los plugins en la versión que ya tenían.

## Lo que no hace

- **No escribe el handoff.** Un script no sabe en qué venías trabajando; eso lo redacta el agente antes de llamarlo.
- **No toca los archivos de `.claude/`.** Esa es la otra fase, y la pone al día `amp:actualizar`.
- **No desinstala los nombres retirados.** Imprime el comando exacto y el orden; ejecutarlo es tuyo (ver abajo).

## Los nombres retirados

Un `RETIRADO` no se arregla actualizando: el nombre ya no está en el marketplace, así que no hay versión nueva que traer. Es una migración, y **el orden importa**:

1. **Instalar el conjunto nuevo.**
2. **Desinstalar los viejos** — la Herramienta imprime una línea por cada uno, con el alcance que corresponde:
   ```
   claude plugin uninstall <plugin>@<marketplace> --scope <alcance>
   ```
   Y sacar además su línea de `enabledPlugins` del `settings` donde esté declarado.
3. **Reiniciar la sesión.**

**Al revés no**: entre el paso 2 y el 1 el repo se queda sin las skills que todavía usa. Y desinstalar **no es reversible desde el marketplace** — esos nombres ya no están ahí para volver a instalarlos.

Por eso la Herramienta **imprime el comando pero no lo ejecuta**, ni siquiera con `--aplicar`. Para ver qué dependencias quedarían sin dueño sin tocar nada: `claude plugin prune --dry-run`.


Sin `process.exit(1)`: reporta, no frena — es capa mecánica, el juicio queda del lado del agente.


````

## §Conducta — `.claude/conducta/`

Subsistema posterior; sigue el molde de los demás (su manifiesto está arriba, en §Manifiesto (conducta)). A diferencia del resto trae un **hook repartidor** además del lint, y su registro **no se carga en contexto**: lo entrega el hook en el momento que corresponde. Ninguno de estos textos cita números de decisión del harness: enuncian la razón inline (se instalan en el repo destino).

El vocabulario de momentos, `.claude/conducta/MOMENTOS.md`, está en §Componentes de Subsistema — ahí vive la única copia, la que se mantiene al día contra el archivo vivo.

El registro de reglas, `.claude/conducta/INDICE.md`, y el del Agente Desplegado, `INDICE-LOCAL.md`, están en §Componentes de Subsistema — ahí viven las únicas copias.

> **Nota sobre la regla `Respetar las preferencias cargadas`:** su `Contenido` nombra preferencias concretas (fechas, ejemplos del dominio, ubicación de temporales). Un repo con preferencias propias afina esa fila para nombrar las suyas — esa afinación es del Propósito, no de la instalación.

Hook repartidor `.claude/conducta/establecer-conducta/establecer-conducta.js` — **no es una Herramienta** (infra co-ubicada del subsistema, como el lint). Contenido exacto (Node, sin dependencias, sin red):

```js
#!/usr/bin/env node
// Hook repartidor del subsistema conducta. Un mismo script sirve a varios eventos:
// lee el registro VIVO de reglas (../INDICE.md), resuelve que momento(s) realiza el evento que lo
// disparo (con su condicion, sin juicio), y despacha las reglas de ese momento segun su clase.
// Agregar/cambiar una regla NO toca este script: lee el registro en cada disparo.
//
// Eventos que realiza hoy (la realizacion del momento es agente-especifica):
//   - UserPromptSubmit         -> momento `cada turno`            (sin condicion)      [clase inyectar]
//   - PreToolUse Write|Edit|apply_patch de un .md -> momento `al escribir` (condicion sin juicio)
//                                                   [clases inyectar + bloquear, combinadas]
//   - SessionStart             -> momento `al arrancar la sesion` (sin condicion)     [clase correr]
// El vocabulario de momentos vive en ../MOMENTOS.md; aca vive COMO se realiza cada uno.
//
// Tres clases de despacho:
//   - inyectar: arma un texto y lo emite como additionalContext (llega al modelo).
//   - correr:   ejecuta la Herramienta cuya ruta es el Contenido de la regla y REENVIA su stdout
//               tal cual (ej. la Pantalla de bienvenida emite {systemMessage} en SessionStart:
//               ese campo es el unico que escribe en la terminal del usuario). No se combina: es para
//               momentos donde la salida del hijo ES la respuesta del hook.
//   - bloquear: ejecuta la Herramienta cuya ruta es el Contenido y LEE su respuesta. Si trae
//               permissionDecision 'deny', se emite ese deny solo (frena la accion; el
//               additionalContext se descartaria igual). Si trae additionalContext, se COMBINA
//               con el texto de las reglas `inyectar` del mismo momento.
//
// Combinacion: en un mismo momento conviven reglas `inyectar` (texto fijo, vive en el registro y lo
// nivela el harness) y `bloquear` (datos medidos, los produce un programa). Se emiten juntas, una
// abajo de la otra. `correr` sigue sin combinarse (su salida no es additionalContext).
//
// Contrato de hook (conocimiento hooks-claude-code): stdin = JSON del harness; stdout = JSON.
//   UserPromptSubmit/PreToolUse: { hookSpecificOutput: { hookEventName, additionalContext } }
//     (PreToolUse sin permissionDecision => 'defer': inyecta y deja el flujo de permisos intacto,
//     verificado 2026-07-23; NO auto-aprueba. additionalContext llega junto al resultado de la tool.)
//   SessionStart: lo que emita la Herramienta `correr` (ej. { systemMessage: <caja> }, visible al usuario).
// Nunca rompe el turno: ante cualquier error o registro vacio, sale 0 sin emitir nada.
//
// Uso a mano (probar): echo {"hook_event_name":"SessionStart"} | node establecer-conducta.js
const fs = require('fs'), path = require('path');
const { execSync } = require('child_process');
const dirSub = path.resolve(__dirname, '..');
const repoRoot = path.resolve(__dirname, '..', '..', '..');   // .../conducta/establecer-conducta -> repo

// -- los Indices de reglas del subsistema --------------------------------
// Son los .md del subsistema que se declaran Indice en su frontmatter (uno por origen), con
// INDICE.md de respaldo para la forma vieja. El repartidor los lee a TODOS: quedarse con el del
// Agente Multiproposito dejaria sin entregar las reglas que el repo sumo, y sin ninguna senal.
function indicesDeReglas() {
  let nombres = [];
  try { nombres = fs.readdirSync(dirSub).filter(n => n.endsWith('.md')).sort(); } catch (e) { return []; }
  const declarados = nombres.filter(n => {
    let txt; try { txt = fs.readFileSync(path.join(dirSub, n), 'utf8'); } catch (e) { return false; }
    const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(txt);
    return !!(fm && /^indice:\s*\S/m.test(fm[1]));
  });
  const elegidos = declarados.length ? declarados : ['INDICE.md'];
  return elegidos.map(n => path.join(dirSub, n)).filter(p => fs.existsSync(p));
}

// -- rutas que toca una escritura ---------------------------------------
// Dos formas, segun el agente:
//   Claude Code -> tool_input.file_path, una sola ruta.
//   Codex       -> apply_patch manda el parche entero en tool_input.command y puede tocar VARIAS
//                  rutas de una (`*** Update File: <ruta>`), asi que la condicion pregunta por
//                  ALGUNA ruta, no por LA ruta. Leer file_path ahi devuelve vacio y la condicion
//                  contestaria que no se cumple, sin fallar: el momento no se entregaria nunca.
function rutasDe(ti) {
  if (!ti) return [];
  if (ti.file_path) return [String(ti.file_path).replace(/\\/g, '/')];
  if (typeof ti.command === 'string')
    return [...ti.command.matchAll(/^\*\*\*\s+(?:Add|Update|Delete) File:\s*(.+)$/gm)]
      .map(m => m[1].trim().replace(/\\/g, '/'));
  return [];
}

// -- que momento realiza cada evento, con su condicion sin juicio -------
// Devuelve el nombre del momento a entregar, o null si el evento+datos no realiza ninguno.
function momentoDe(data) {
  const ev = data.hook_event_name;
  if (ev === 'UserPromptSubmit') return 'cada turno';
  if (ev === 'SessionStart') return 'al arrancar la sesión';
  if (ev === 'PreToolUse') {
    const tool = data.tool_name || '';
    if (tool !== 'Write' && tool !== 'Edit' && tool !== 'apply_patch') return null;
    // condicion `al escribir`: escribir/editar un .md de cualquier parte del repo (lo que se
    // publica incluido, que es por donde entra la terminologia ajena), salvo el directorio de
    // borradores tmp/, que el repo gitignorea y es material descartable.
    const rutas = rutasDe(data.tool_input);
    if (!rutas.some(r => /\.md$/i.test(r) && !/(^|\/)tmp\//.test(r))) return null;
    return 'al escribir';
  }
  return null;
}

// -- parseo minimo de la tabla markdown del registro de reglas ----------
function leerReglas(txt) {
  const filas = [];
  const lineas = txt.split('\n').map(l => l.trim()).filter(l => l.startsWith('|'));
  let cols = null;
  for (const l of lineas) {
    const celdas = l.split('|').slice(1, -1).map(c => c.trim());
    const norm = celdas.map(c => c.toLowerCase().replace(/\*/g, ''));
    if (!cols) {
      if (norm.includes('regla') && norm.includes('momento')) {
        cols = { momento: norm.indexOf('momento'), clase: norm.indexOf('clase'),
                 contenido: norm.indexOf('contenido'), estado: norm.indexOf('estado') };
      }
      continue;
    }
    if (/^:?-{2,}:?$/.test(celdas[0].replace(/\s/g, ''))) continue;
    const val = i => (i >= 0 && i < celdas.length ? celdas[i] : '');
    filas.push({ momento: val(cols.momento).toLowerCase(), clase: val(cols.clase).toLowerCase(),
                 contenido: val(cols.contenido), estado: val(cols.estado).toLowerCase() });
  }
  return filas;
}

// Devuelve las reglas del registro que matchean (clase, vigente, momento) con Contenido.
function reglasDe(momento, clase) {
  if (!momento) return [];
  const filas = [];
  for (const p of indicesDeReglas()) {
    try { filas.push(...leerReglas(fs.readFileSync(p, 'utf8'))); } catch (e) { /* un indice ilegible no frena el turno */ }
  }
  return filas.filter(r => r.clase === clase && r.estado === 'vigente' && r.momento === momento && r.contenido);
}

// -- inyectar: texto para el modelo -------------------------------------
function construir(momento) {
  const reglas = reglasDe(momento, 'inyectar');
  if (!reglas.length) return '';
  const bullets = reglas.map(r => `- ${r.contenido}`).join('\n');
  return `Recordatorio de conducta — momento «${momento}» (subsistema conducta):\n${bullets}`;
}

// -- ejecutar la Herramienta de una regla y devolver su stdout ----------
// El Contenido es la ruta del script relativa a .claude/ (con sus flags), ej.
// `conducta/mostrar-pantalla-bienvenida/mostrar-pantalla-bienvenida.js --hook`.
function ejecutar(regla, input) {
  try {
    return execSync('node .claude/' + regla.contenido, { cwd: repoRoot, input, encoding: 'utf8', timeout: 20000 });
  } catch (e) { return ''; }   // no romper el turno: el hijo fallo, se ignora
}

// -- correr: reenviar el stdout del hijo tal cual (no se combina) -------
function correr(momento, input) {
  const reglas = reglasDe(momento, 'correr');
  if (!reglas.length) return false;
  for (const r of reglas) {
    const out = ejecutar(r, input);
    if (out && out.trim()) process.stdout.write(out);   // reenvio tal cual (JSON valido del hijo)
  }
  return true;
}

// -- bloquear: leer la respuesta del hijo -------------------------------
// Devuelve { deny: <motivo> } si alguna regla frena la accion, o { contexto: <texto> } con lo que
// haya que sumarle a las reglas `inyectar` del mismo momento. El deny gana: si la escritura no va a
// ocurrir, el recordatorio sobra (y Claude Code descarta el additionalContext en un deny).
function bloquear(momento, input) {
  const partes = [];
  for (const r of reglasDe(momento, 'bloquear')) {
    const out = ejecutar(r, input);
    if (!out || !out.trim()) continue;
    let hs = null;
    try { hs = JSON.parse(out).hookSpecificOutput; } catch (e) { continue; }
    if (!hs) continue;
    if (hs.permissionDecision === 'deny') return { deny: hs.permissionDecisionReason || 'bloqueado por una regla de conducta' };
    if (hs.additionalContext) partes.push(hs.additionalContext);
  }
  return { contexto: partes.join('\n\n') };
}

// Se drena stdin (contrato del hook) y se despacha segun el evento y la clase.
let input = '';
process.stdin.on('data', c => { input += c; });
process.stdin.on('end', () => {
  let data = {};
  try { data = JSON.parse(input || '{}'); } catch (e) { data = {}; }
  let momento = null;
  try { momento = momentoDe(data); } catch (e) { momento = null; }

  const ev = data.hook_event_name === 'PreToolUse' ? 'PreToolUse' : 'UserPromptSubmit';

  // clase `correr` primero (SessionStart): ejecuta y reenvia; no se combina.
  try { if (correr(momento, input)) return process.exit(0); } catch (e) { /* sigue */ }

  // clase `bloquear`: si alguna frena, se emite el deny solo y no se sigue.
  let medido = { contexto: '' };
  try { medido = bloquear(momento, input); } catch (e) { medido = { contexto: '' } }
  if (medido.deny) {
    process.stdout.write(JSON.stringify({ hookSpecificOutput: {
      hookEventName: ev, permissionDecision: 'deny', permissionDecisionReason: medido.deny } }));
    return process.exit(0);
  }

  // clase `inyectar` (cada turno / al escribir), combinada con lo que midio `bloquear`.
  let ctx = '';
  try { ctx = construir(momento); } catch (e) { ctx = ''; }   // ante error, no romper el turno
  if (medido.contexto) ctx = ctx ? ctx + '\n' + medido.contexto : medido.contexto;
  if (ctx) {
    // PreToolUse: se OMITE permissionDecision a proposito (=> 'defer'): inyecta sin auto-aprobar.
    process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: ev, additionalContext: ctx } }));
  }
  process.exit(0);
});
process.stdin.on('error', () => process.exit(0));
```

`.claude/conducta/establecer-conducta/README.md`:

````markdown
# establecer-conducta — hook repartidor de conducta

Hook del subsistema `conducta`. **No es una Herramienta** (los hooks van afuera del registro de Herramientas): es infra co-ubicada del subsistema, como el lint. El agente no lo invoca — lo dispara el harness.

## Qué hace

Un mismo script sirve a varios eventos. Según el evento que lo dispara, resuelve qué **momento** realiza (con su condición, sin juicio), lee el registro **vivo** `../INDICE.md` y despacha las reglas `vigente` de ese momento según su clase. Agregar o cambiar una regla **no toca este script**: lee el registro en cada disparo. El vocabulario de momentos vive en `../MOMENTOS.md`; acá vive **cómo** se realiza cada uno.

Eventos que realiza hoy:

- **`SessionStart`** → momento `al arrancar la sesión` (sin condición).
- **`UserPromptSubmit`** → momento `cada turno` (sin condición). El recordatorio en cada turno.
- **`PreToolUse`** con `Write`/`Edit`/`apply_patch` cuando **alguna** ruta tocada es un `.md` fuera de `tmp/` → momento `al escribir`.

## Las tres clases

| Clase | Qué hace | Se combina |
|-------|----------|------------|
| `inyectar` | Emite el `Contenido` de la regla como `additionalContext` | sí |
| `correr` | Ejecuta la Herramienta cuya ruta es el `Contenido` y **reenvía su salida tal cual** (la Pantalla de bienvenida emite `systemMessage`, el único campo que escribe en la terminal) | no: su salida **es** la respuesta del hook |
| `bloquear` | Ejecuta la Herramienta y **lee su respuesta**: un `deny` frena la acción y se emite solo; un `additionalContext` se suma al de las reglas `inyectar` | sí |

En un mismo momento conviven el texto fijo de las `inyectar` —que vive en el registro y lo nivela el Agente Multipropósito— y los datos medidos de las `bloquear`, que produce un programa. Se emiten juntos, uno abajo del otro.

## Contrato

- **Entrada:** el JSON del agente por stdin. Se lee `hook_event_name`, y para `PreToolUse` `tool_name` + las rutas, que llegan de dos formas: `tool_input.file_path` (Claude Code) o adentro del parche de `tool_input.command` (Codex, `apply_patch`, que puede tocar **varias** rutas de una).
- **Salida:** por stdout, `{ "hookSpecificOutput": { "hookEventName": …, "additionalContext": "…" } }`, o el `deny` con su `permissionDecisionReason`.
- **`PreToolUse` sin efecto de lado:** cuando no hay bloqueo se **omite** `permissionDecision` (= `defer`, verificado 2026-07-23): inyecta el texto y deja el flujo de permisos intacto — **no** auto-aprueba la tool. (`allow` auto-aprobaría; `deny` descarta el `additionalContext`, por eso el bloqueo se emite solo.)
- **Nunca rompe el turno:** ante cualquier error o registro vacío sale con código 0 sin emitir nada.

Mecánica y capacidades de hooks: conocimiento `hooks-claude-code` (Claude Code) y `hooks-codex-cli` (Codex). Latencia (~65 ms, Node): conocimiento `latencia-hooks`.

## Cableado

- **Claude Code (`.claude/settings.json`):** `SessionStart` + `UserPromptSubmit` (sin matcher) + `PreToolUse` (matcher `Write|Edit`).
- **Codex (`.codex/hooks.json`):** los mismos tres. El matcher `Write|Edit` alcanza igual: toda edición de Codex pasa por `apply_patch`, que matchea como `apply_patch`, `Edit` o `Write`. ⚠️ Un hook de Codex **no corre hasta que se lo revisa y se le da confianza** con `/hooks`, y la confianza se pierde cada vez que cambia su texto.

## Probar a mano

```bash
node -e 'process.stdout.write(JSON.stringify({hook_event_name:"UserPromptSubmit"}))' | node .claude/conducta/establecer-conducta/establecer-conducta.js
node -e 'process.stdout.write(JSON.stringify({hook_event_name:"PreToolUse",tool_name:"Write",tool_input:{file_path:"README.md",content:"texto"}}))' | node .claude/conducta/establecer-conducta/establecer-conducta.js
```

Emiten el JSON con las reglas vigentes de ese momento, o nada si no aplica.
````


Control del momento `al escribir` `.claude/conducta/detectar-terminologia-vetada/detectar-terminologia-vetada.js` — lo corre la Regla Base clase `bloquear`; tampoco es una Herramienta. Contenido exacto:

```js
#!/usr/bin/env node
// Control del momento `al escribir` del subsistema conducta: chequea el contenido que se esta por
// escribir contra el registro de relaciones vetadas (../../semantica/TERMINOLOGIA-FARLOPA.md) ANTES
// de que el archivo exista, y responde segun la columna Control de cada termino:
//
//   bloquea -> permissionDecision 'deny' + motivo (la palabra esta mal siempre: `levelear`)
//   avisa   -> additionalContext con los terminos hallados (la palabra puede ser legitima segun el
//              significado: `capa de configuracion` es valido, `la segunda capa del proceso` no)
//
// El bloqueo mira solo las apariciones FUERA de comillas simples invertidas y de bloques de codigo:
// citar un termino para hablar de el (esta tabla, la Base de preferencias, un plan que documenta el
// barrido) nunca se frena; se frena usarlo. Sin esa distincion el control volveria inescribibles a
// los propios archivos que documentan el veto.
//
// Lo invoca el hook repartidor `establecer-conducta` como Contenido de una regla clase `bloquear`.
// No es una Herramienta (no va al registro de Herramientas): es infra del subsistema, co-ubicada.
//
// Entrada: el JSON del hook por stdin. Se leen tool_name y tool_input, en las dos formas:
//   Claude Code -> Write: {content, file_path} | Edit: {new_string, file_path}
//   Codex       -> apply_patch: {command} (el texto del parche, con las rutas adentro)
// Salida: JSON de hook por stdout, o nada si no aplica. Nunca rompe el turno (siempre exit 0).
//
// Uso a mano (probar):
//   echo {"tool_name":"Write","tool_input":{"file_path":"README.md","content":"hay mucho churn"}} | node detectar-terminologia-vetada.js
const fs = require('fs'), path = require('path');
const registro = path.resolve(__dirname, '..', '..', 'semantica', 'TERMINOLOGIA-FARLOPA.md');

// Subsistema exento: el registro de vetados contiene los vetados por definicion.
const EXENTOS = [/(^|\/)\.claude\/semantica\//];

// -- registro: [{variantes:[...], comoDecirlo, control}] -----------------
function leerRegistro() {
  if (!fs.existsSync(registro)) return [];
  const out = [];
  const lineas = fs.readFileSync(registro, 'utf8').split('\n').map(l => l.trim()).filter(l => l.startsWith('|'));
  let cols = null;
  for (const l of lineas) {
    const celdas = l.split('|').slice(1, -1).map(c => c.trim());
    const norm = celdas.map(c => c.toLowerCase().replace(/\*/g, ''));
    if (!cols) {
      if (norm.includes('término') && norm.includes('cómo decirlo')) {
        cols = { termino: norm.indexOf('término'), como: norm.indexOf('cómo decirlo'), control: norm.indexOf('control') };
      }
      continue;
    }
    if (/^:?-{2,}:?$/.test(celdas[0].replace(/\s/g, ''))) continue;
    // las variantes del termino vienen entre comillas simples invertidas, separadas por /
    const variantes = (celdas[cols.termino].match(/`([^`]+)`/g) || []).map(v => v.slice(1, -1).trim()).filter(Boolean);
    if (!variantes.length) continue;
    const control = (cols.control >= 0 && cols.control < celdas.length ? celdas[cols.control] : '').toLowerCase();
    out.push({ variantes, comoDecirlo: celdas[cols.como] || '', control: control === 'bloquea' ? 'bloquea' : 'avisa' });
  }
  return out;
}

// -- texto en el que se busca: sin bloques de codigo ni tramos citados ---
// Se reemplaza por espacios (no se borra) para no pegar palabras que estaban separadas.
function textoDesnudo(txt) {
  return txt
    .replace(/```[\s\S]*?```/g, m => ' '.repeat(m.length))     // bloques de codigo
    .replace(/`[^`\n]*`/g, m => ' '.repeat(m.length))          // tramos entre comillas simples invertidas
    .replace(/^\s{4,}\S.*$/gm, m => ' '.repeat(m.length));     // bloques indentados
}

// Limites de palabra propios: \b es ASCII y falla con acentos (`plomería`).
const LETRA = 'A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9_';
function apariciones(texto, termino) {
  const esc = termino.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
  const re = new RegExp(`(^|[^${LETRA}])(${esc})(?=[^${LETRA}]|$)`, 'gi');
  const lineas = texto.split('\n');
  const hits = [];
  for (let i = 0; i < lineas.length; i++) { re.lastIndex = 0; if (re.test(lineas[i])) hits.push(i + 1); }
  return hits;
}

// -- que se esta por escribir: contenido + rutas -------------------------
// Codex manda el parche entero en tool_input.command y puede tocar VARIAS rutas de una.
function loQueSeEscribe(data) {
  const ti = data.tool_input || {};
  const tool = data.tool_name || '';
  if (tool === 'apply_patch' || (!ti.file_path && typeof ti.command === 'string')) {
    const patch = ti.command || '';
    const rutas = [...patch.matchAll(/^\*\*\*\s+(?:Add|Update|Delete) File:\s*(.+)$/gm)].map(m => m[1].trim());
    const agregado = patch.split('\n').filter(l => l.startsWith('+')).map(l => l.slice(1)).join('\n');
    return { rutas, contenido: agregado };
  }
  const contenido = typeof ti.content === 'string' ? ti.content
                  : typeof ti.new_string === 'string' ? ti.new_string : '';
  return { rutas: ti.file_path ? [ti.file_path] : [], contenido };
}

let input = '';
process.stdin.on('data', c => { input += c; });
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input || '{}');
    const { rutas, contenido } = loQueSeEscribe(data);
    if (!contenido.trim()) return process.exit(0);

    const normal = rutas.map(r => r.replace(/\\/g, '/'));
    if (!normal.some(r => /\.md$/i.test(r))) return process.exit(0);            // solo .md
    if (normal.some(r => EXENTOS.some(re => re.test(r)))) return process.exit(0); // subsistema exento

    const desnudo = textoDesnudo(contenido);
    const bloquear = [], avisar = [];
    for (const fila of leerRegistro()) {
      for (const v of fila.variantes) {
        const hits = apariciones(desnudo, v);
        if (!hits.length) continue;
        const item = `\`${v}\` (${hits.length === 1 ? 'línea ' : 'líneas '}${hits.slice(0, 5).join(', ')}) → ${fila.comoDecirlo}`;
        (fila.control === 'bloquea' ? bloquear : avisar).push(item);
      }
    }

    if (bloquear.length) {
      const motivo = 'Escritura rechazada: terminología vetada sin uso legítimo posible.\n- '
        + bloquear.join('\n- ')
        + '\nCorregí el texto y volvé a escribir. El veto está en .claude/semantica/TERMINOLOGIA-FARLOPA.md.';
      process.stdout.write(JSON.stringify({
        hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: motivo }
      }));
      return process.exit(0);
    }
    if (avisar.length) {
      const texto = 'Términos vetados detectados en lo que acabás de escribir (pueden ser legítimos según el significado — juzgá cada uno):\n- '
        + avisar.join('\n- ');
      process.stdout.write(JSON.stringify({
        hookSpecificOutput: { hookEventName: 'PreToolUse', additionalContext: texto }
      }));
    }
  } catch (e) { /* nunca romper el turno */ }
  process.exit(0);
});
process.stdin.on('error', () => process.exit(0));
```

`.claude/conducta/detectar-terminologia-vetada/README.md`:

````markdown
# detectar-terminologia-vetada — control del momento `al escribir`

Infra co-ubicada del subsistema `conducta`. **No es una Herramienta** (no va al registro de Herramientas): la ejecuta el hook repartidor `establecer-conducta`, no el agente.

## Qué hace

Chequea el contenido que se está por escribir contra `../../semantica/TERMINOLOGIA-FARLOPA.md` **antes de que el archivo exista**, y responde según la columna `Control` del término encontrado:

| Control | Respuesta | Cuándo |
|---------|-----------|--------|
| `bloquea` | `permissionDecision: "deny"` con el motivo | La palabra está mal **siempre**: `levelear` no tiene uso válido en español |
| `avisa` | `additionalContext` con los términos y sus líneas | La palabra puede ser legítima según el significado: `capa de configuración` sí, `la segunda capa del proceso` no |

Con `avisa`, la máquina marca y **el agente juzga el significado** — el reparto que fija el subsistema `semantica`. Con `bloquea` no hay nada que juzgar, por eso frena.

## Qué no mira

- **Lo que está citado.** Las apariciones dentro de comillas simples invertidas, de bloques de código y de bloques indentados se ignoran. Hablar de un término vetado es legítimo y frecuente: esta misma tabla lo hace, la Base de preferencias lo hace al dar ejemplos, y los planes que documentan un barrido también. Sin esa distinción el control volvería inescribibles a los archivos que documentan el veto.
- **El subsistema `semantica`.** Exento: es el registro de los vetados.
- **Lo que no es `.md`.** El filtro por extensión y la exclusión del directorio de borradores `tmp/` los aplica el repartidor, en la condición del momento.

## Contrato

- **Entrada:** el JSON del hook por `stdin`. Lee `tool_name` y `tool_input` en las dos formas — `Write` (`content` + `file_path`), `Edit` (`new_string` + `file_path`) y `apply_patch` de Codex (`command`, el parche entero, del que saca las rutas y las líneas agregadas).
- **Salida:** JSON de hook por `stdout`, o nada si no aplica.
- **Nunca rompe el turno:** ante cualquier error sale con código 0 sin emitir nada.

## Probar a mano

Reemplazá `<termino>` por cualquiera marcado `bloquea` en el registro:

```bash
node -e 'process.stdout.write(JSON.stringify({tool_name:"Write",tool_input:{file_path:"README.md",content:"Hay mucho <termino> en el repo."}}))' \
  | node .claude/conducta/detectar-terminologia-vetada/detectar-terminologia-vetada.js
```

Devuelve el `deny`. Con el mismo término entre comillas simples invertidas no devuelve nada.
````

Script de la Pantalla de bienvenida `.claude/conducta/mostrar-pantalla-bienvenida/mostrar-pantalla-bienvenida.js` — lo corre la Regla Base `correr` del momento `al arrancar la sesión` (y la skill `amp:info` a demanda). Contenido exacto:

```js
#!/usr/bin/env node
// mostrar-pantalla-bienvenida.js — Pantalla de bienvenida del Agente Multipropósito (glosario).
// Emite al arrancar un bloque de estado: Título + Propósito (de la Identidad) + métricas
// de cada subsistema (entradas) + estado de lint. Bloque de texto para el transcript
// (no un banner del CLI: SessionStart no tiene punto de extensión para eso).
//
// Agregación por DESCUBRIMIENTO DINÁMICO (Postura 2): un subsistema es un dir hijo de
// `.claude/` que tiene su lint co-ubicado `.claude/<D>/lint-<D>/lint-<D>.js`.
// Sumar un subsistema con su lint lo hace aparecer solo, sin editar este script.
//
// Co-ubicado con el subsistema `conducta`: la Pantalla de bienvenida es una Regla Base clase
// `correr` del momento `al arrancar la sesión`, no una Herramienta. La corre el hook repartidor
// `establecer-conducta` (que reenvía su stdout) y la skill `amp:info` a demanda.
// Uso:
//   node .claude/conducta/mostrar-pantalla-bienvenida/mostrar-pantalla-bienvenida.js            (a mano / skill amp:info: caja en cerca de código)
//   node .claude/conducta/mostrar-pantalla-bienvenida/mostrar-pantalla-bienvenida.js --sin-lint (rápido, sin correr lints)
//   node .claude/conducta/mostrar-pantalla-bienvenida/mostrar-pantalla-bienvenida.js --hook     (para el SessionStart hook: emite JSON {"systemMessage": <caja>} → visible al usuario)
// Sin process.exit(1): informa, no falla.
//
// Por qué --hook: el stdout crudo de un SessionStart hook va a `additionalContext` (lo ve
// el modelo, NO el usuario). El único campo que se muestra en la terminal del usuario es
// `systemMessage`. Con --hook se emite ese JSON, sin cerca de código (los backticks saldrían
// literales). Sin --hook, la caja va con cerca ``` para conservar monospace en el transcript.

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// El repo es el DIRECTORIO DE TRABAJO, no la ubicacion del script. Deducirlo desde __dirname
// hacia arriba funciona solo mientras el script viva adentro del repo que describe: corrido desde
// otra copia —el marketplace bajado, una prueba, un repo apuntado— muestra la Pantalla del repo
// equivocado sin avisar. Se acepta una ruta por argumento para inspeccionar otro repo a proposito.
const RUTA_ARG = process.argv.slice(2).find(a => !a.startsWith('--'));
const REPO = RUTA_ARG ? path.resolve(RUTA_ARG) : process.cwd();
const CLAUDE_DIR = path.join(REPO, '.claude');
const SIN_LINT = process.argv.slice(2).includes('--sin-lint');
const HOOK = process.argv.slice(2).includes('--hook');

// Sustantivo cosmético por subsistema conocido; los desconocidos caen a "entradas".
// (Solo afecta la etiqueta, no el conteo: el descubrimiento sigue siendo dinámico.)
const SUSTANTIVO = {
  memoria: 'memorias', semantica: 'términos', decisiones: 'decisiones',
  herramientas: 'herramientas', planes: 'planes', conocimiento: 'páginas',
  preferencias: 'preferencias', conducta: 'reglas', subsistemas: 'subsistemas',
};
// Nombres de índice de la forma vieja, para el subsistema que todavía no declara frontmatter.
// Van todos los que existan, no el primero: `semantica` tiene dos y quedarse con uno la subcontaba.
const INDICES = ['INDICE.md', 'MEMORIA.md', 'PLANES.md', 'PREFERENCIAS.md', 'GLOSARIO.md',
                 'TERMINOLOGIA-FARLOPA.md', 'SUBSISTEMAS.md'];

function existe(p) { try { return fs.existsSync(p); } catch { return false; } }
function leer(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } }

// --- descubrir subsistemas: dir hijo de .claude con lint co-ubicado ---
function descubrirSubsistemas() {
  const out = [];
  if (!existe(CLAUDE_DIR)) return out;
  for (const e of fs.readdirSync(CLAUDE_DIR, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const lint = path.join(CLAUDE_DIR, e.name, 'lint-' + e.name, 'lint-' + e.name + '.js');
    if (existe(lint)) out.push({ nombre: e.name, dir: path.join(CLAUDE_DIR, e.name), lint });
  }
  return out.sort((a, b) => a.nombre.localeCompare(b.nombre));
}

// --- Índices del subsistema ---
// Un subsistema puede tener más de un Índice (uno por origen), y cada archivo lo declara en su
// frontmatter. Se cuentan TODOS: quedarse con el primero informaba 2 herramientas donde hay 8.
// Sin frontmatter se cae a los nombres de la forma vieja, y ahí sí es el primero que exista.
function frontmatterDe(txt) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(txt || '');
  return m ? m[1] : null;
}
function indicesDe(dir) {
  let nombres = [];
  try { nombres = fs.readdirSync(dir).filter(n => n.endsWith('.md')).sort(); } catch { return []; }
  const declarados = nombres.filter(n => {
    const fm = frontmatterDe(leer(path.join(dir, n)));
    return !!(fm && /^indice:\s*\S/m.test(fm));
  });
  if (declarados.length) return declarados.map(n => path.join(dir, n));
  return INDICES.map(c => path.join(dir, c)).filter(existe);
}

// --- conteo genérico de entradas: filas de tabla, si no hay tabla, bullets con link ---
function contarEntradas(txt) {
  const lineas = txt.split(/\r?\n/);
  const pipe = lineas.filter(l => l.trim().startsWith('|'));
  const sep = pipe.filter(l => /^\s*\|[\s:|-]+\|\s*$/.test(l)); // separadores |---|
  if (sep.length) return pipe.length - sep.length - sep.length; // -headers -separadores
  const conLink = lineas.filter(l => /^\s*[-*]\s+\[/.test(l));  // - [texto](link)
  if (conLink.length) return conLink.length;
  return lineas.filter(l => /^\s*[-*]\s+\S/.test(l)).length;    // bullets sin link (preferencias)
}

// --- enriquecimientos baratos por subsistema conocido ---
// Planes: agrupa por CARPETA (pendientes/ejecutados/descartados), no por estado suelto.
// La agrupación sale de ESTADOS.md (fuente de verdad configurable): cada
// estado mapea a una carpeta, y los tres estados vivos caen todos en `pendientes`. Así el
// juego de estados se puede reconfigurar por repo sin tocar este script. La suma de las
// carpetas = total de planes (Pendientes + Ejecutados + Descartados = Total).
function detallePlanes(txt, estadosTxt) {
  // Estado → carpeta desde ESTADOS.md (col. Estado | Sentido | Carpeta | Terminal).
  const estadoCarpeta = {};   // 'nuevo' → 'pendientes'
  const orden = [];           // orden de aparición de carpetas: pendientes, ejecutados, descartados
  for (const l of (estadosTxt || '').split(/\r?\n/)) {
    if (!l.trim().startsWith('|')) continue;
    const c = l.split('|').slice(1, -1).map(x => x.trim());
    if (c.length < 3) continue;
    const est = c[0];
    const carpeta = c[2].replace(/`/g, '').replace(/\/+\s*$/, '').trim();
    if (/^-{2,}$/.test(est) || /^estado$/i.test(est) || !carpeta || /^carpeta$/i.test(carpeta)) continue;
    estadoCarpeta[est.toLowerCase()] = carpeta;
    if (!orden.includes(carpeta)) orden.push(carpeta);
  }
  // Contar filas de PLANES.md, tallando por carpeta del estado.
  const cont = {};
  for (const l of txt.split(/\r?\n/)) {
    if (!l.trim().startsWith('|')) continue;
    const c = l.split('|').slice(1, -1).map(x => x.trim());
    if (c.length < 2) continue;
    const est = c[1];
    if (/^-{2,}$/.test(est) || /^estado$/i.test(est)) continue;
    const carp = estadoCarpeta[est.toLowerCase()];
    if (carp) cont[carp] = (cont[carp] || 0) + 1;
  }
  if (!orden.length) return ''; // sin ESTADOS.md legible: degradar sin romper
  const partes = orden.map(carp => `${cont[carp] || 0} ${carp}`);
  return `(${partes.join(' · ')})`;
}
// Cuántas preferencias sumó este repo. El total ya está en el renglón; lo que no se ve sin abrir
// el archivo es cuántas son propias, así que ese es el único número que se desglosa. Con
// frontmatter cada archivo dice de qué origen es; sin frontmatter (forma vieja) los dos orígenes
// viven adentro de un archivo, partidos por encabezado, y se aceptan además los viejos
// ("## Base (harness vN)" / "## Adaptaciones") mientras haya Agentes Desplegados sin nivelar.
function detallePreferencias(archivos) {
  const contar = t => t ? t.split(/\r?\n/).filter(l => /^\s*[-*]\s+\S/.test(l)).length : 0;
  let delRepo = 0, declarado = false;
  for (const f of archivos) {
    const t = leer(f), fm = frontmatterDe(t);
    const m = fm && /^origen:\s*(\S+)/m.exec(fm);
    if (!m) continue;
    declarado = true;
    if (m[1] === 'agente-desplegado') delRepo += contar(t);
  }
  if (!declarado) {
    const txt = archivos.length ? leer(archivos[0]) : '';
    delRepo = contar(txt.split(/^##\s+(?:Preferencias del Agente Desplegado|Adaptaciones)\b[^\n]*$/mi)[1]);
  }
  return `(${delRepo} propias del repo)`;
}
// Semántica guarda dos cosas de NATURALEZA distinta —vocabulario legítimo y relaciones vetadas—,
// y el total solo no contesta ninguna de las dos preguntas que se le hacen al subsistema. Por eso
// se abre; los subsistemas cuyos dos Índices guardan lo mismo (cambia el origen, no la naturaleza)
// muestran un número solo. Cuál Índice es cuál sale de las columnas que declara, no de su nombre.
function detalleSemantica(archivos) {
  let legitimos = 0, vetados = 0;
  for (const f of archivos) {
    const t = leer(f), n = contarEntradas(t);
    if (/Significado vetado/.test(t)) vetados += n; else legitimos += n;
  }
  return vetados ? `(${legitimos} legítimos · ${vetados} vetados)` : '';
}

// --- correr el lint del subsistema y contar hallazgos (misma heurística que ejecutar-control-cierre) ---
function contarHallazgos(salida) {
  let t = 0;
  for (const l of salida.split(/\r?\n/)) {
    const m = l.match(/\((\d+)\):?\s*$/);
    if (m) t += parseInt(m[1], 10);
  }
  return t;
}
function correrLint(lintPath) {
  // Sin --quiet: el flag da exit ≠ 0 en algunos lints artesanales (bug de divergencia).
  // Igual que ejecutar-control-cierre: leer los totales `(N)` de la salida, no confiar en el exit.
  const r = spawnSync('node', [lintPath], { cwd: REPO, encoding: 'utf8', timeout: 15000 });
  if (r.error || r.status === null) return { estado: 'n/d', hallazgos: null };
  const salida = (r.stdout || '') + (r.stderr || '');
  const h = contarHallazgos(salida);
  return { estado: r.status !== 0 ? 'error' : (h === 0 ? 'ok' : 'hallazgos'), hallazgos: h };
}

// --- Identidad del Agente: Título + Propósito (tolerante a indefinido) ---
// Sin Propósito definido el repo todavia NO es un Agente con Proposito: es el Agente
// Multiproposito a secas, esperando el Proposito que lo hace nacer. Por eso la falta no se
// informa como un dato mas: se pide (ver pedidoDeIdentidad).
const SIN = '<sin definir>';
function leerIdentidad() {
  const p = path.join(CLAUDE_DIR, 'identidad.md');
  const txt = leer(p);
  if (!txt.trim()) return { titulo: SIN, proposito: SIN };
  const titulo = (txt.match(/^#\s+(.+)$/m) || [])[1] || SIN;
  const proposito = (txt.match(/^[*\s>]*Prop[óo]sito[*\s]*:\s*(.+)$/mi) || [])[1] || SIN;
  return { titulo: titulo.trim(), proposito: proposito.trim() };
}

// --- construir métricas ---
const subs = descubrirSubsistemas();
const filas = [];
let hallazgosTotal = 0, lintPeor = 'ok';
for (const s of subs) {
  const idxs = indicesDe(s.dir);
  const txt = idxs.map(leer).join('\n');
  let cuenta = idxs.length ? contarEntradas(txt) : 0;
  let extra = '';
  if (s.nombre === 'planes') extra = detallePlanes(txt, leer(path.join(s.dir, 'ESTADOS.md')));
  if (s.nombre === 'preferencias') extra = detallePreferencias(idxs);
  if (s.nombre === 'semantica') extra = detalleSemantica(idxs);
  let lint = { estado: 'n/d', hallazgos: null };
  if (!SIN_LINT) {
    lint = correrLint(s.lint);
    if (typeof lint.hallazgos === 'number') hallazgosTotal += lint.hallazgos;
    if (lint.estado === 'error') lintPeor = 'error';
    else if (lint.estado === 'hallazgos' && lintPeor !== 'error') lintPeor = 'hallazgos';
  }
  // Donde hay desglose, el `extra` ya trae los sustantivos (pendientes/ejecutados, legítimos/
  // vetados, propias del repo): repetir el del subsistema sería redundante y desborda el marco,
  // así que se omite y queda "80 (…)". El renglón ya dice de qué subsistema se trata.
  const sustantivo = extra ? '' : (SUSTANTIVO[s.nombre] || 'entradas');
  filas.push({ nombre: s.nombre, cuenta, extra, sustantivo, lint });
}

// --- render ---
const { titulo, proposito } = leerIdentidad();
const lintGlobal = SIN_LINT ? '(sin correr)'
  : lintPeor === 'error' ? '✖ error en algún lint'
  : hallazgosTotal === 0 ? '✔ 0 hallazgos'
  : `⚠ ${hallazgosTotal} hallazgo${hallazgosTotal === 1 ? '' : 's'}`;

// Caja de ANCHO AUTOMÁTICO: se dimensiona sola al renglón más largo, así nunca se
// desarma cuando una métrica gana dígitos (planes 9 → 99 → 999). Las líneas largas
// (Propósito) se envuelven a un techo `WRAP`; el ancho final = el renglón más largo,
// con un piso `MIN` para que no quede angosta. Envuelta en cerca de código (```) para
// el transcript de un cliente no-terminal (skill amp:info); en --hook va como systemMessage.
const WRAP = 82;                                // techo de envoltura para texto largo
const MIN = 74;                                 // piso de ancho interno
const nfc = s => (s || '').normalize('NFC');    // acentos precompuestos → .length correcto
function envolver(texto, ancho, cont) {
  const palabras = nfc(texto).split(/\s+/).filter(Boolean);
  const out = [];
  let linea = '';
  for (const p of palabras) {
    const cand = linea ? linea + ' ' + p : p;
    if (cand.length > ancho && linea) { out.push(linea); linea = cont + p; }
    else linea = cand;
  }
  if (linea) out.push(linea);
  return out;
}

const cuerpo = [];
// Renglón de marca: va sin etiqueta a propósito. Es la identidad del harness, constante
// en todo repo; ponerle prefijo lo degradaría a un campo más entre los de abajo.
cuerpo.push('Agente Multipropósito');
cuerpo.push('');  // aire: despega la identidad de los campos del repo
cuerpo.push(...envolver('Título: ' + titulo, WRAP, '   '));
cuerpo.push(...envolver('Propósito: ' + proposito, WRAP, '   '));
// Un campo vacio no pide nada por si solo. Cuando falta la Identidad, la Pantalla lo dice con
// todas las letras: es lo unico que el usuario mira al arrancar.
if (titulo === SIN || proposito === SIN) {
  cuerpo.push('');
  cuerpo.push(...envolver('⚠ Sin Propósito, este repo es el Agente Multipropósito a secas: los subsistemas no saben hacia dónde acumular. Decile al agente qué querés lograr acá y lo asienta.', WRAP, '   '));
}
cuerpo.push('__SEP__');
cuerpo.push(`Subsistemas: ${subs.length}      Lint: ${lintGlobal}`);
const anchoNom = Math.max(...filas.map(f => f.nombre.length), 0);
for (const f of filas) {
  const marca = (f.lint.estado === 'ok' || f.lint.estado === 'n/d') ? ' ' : '⚠';
  const val = f.cuenta === null ? f.extra : `${f.cuenta}${f.sustantivo ? ' ' + f.sustantivo : ''}${f.extra ? ' ' + f.extra : ''}`;
  cuerpo.push(`${marca} · ${f.nombre.padEnd(anchoNom)}   ${val}`);
}

// Ancho interno = el renglón más largo (piso MIN). Cada línea se rellena a ese ancho.
const W = Math.max(MIN, ...cuerpo.filter(l => l !== '__SEP__').map(l => nfc(l).length));
const regla = (l, mid, r) => l + mid.repeat(W + 2) + r;
const caja = s => {
  const t = nfc(s);
  return '║ ' + t + ' '.repeat(Math.max(0, W - t.length)) + ' ║';
};

const boxLines = [regla('╔', '═', '╗')];
for (const linea of cuerpo) boxLines.push(linea === '__SEP__' ? regla('╟', '─', '╢') : caja(linea));
boxLines.push(regla('╚', '═', '╝'));
const box = boxLines.join('\n');

// --hook: emitir JSON {"systemMessage": <caja>} → único campo que la terminal del usuario
// se muestra en SessionStart (sin cerca ```: los backticks saldrían literales). Sin --hook:
// caja envuelta en cerca de código para el transcript (skill amp:info + corridas a mano).
// Si falta la Identidad, no alcanza con mostrar «<sin definir>» al usuario: `systemMessage` va a
// la terminal y el modelo NO lo ve, asi que nadie queda a cargo de resolverlo y el repo se queda
// para siempre sin Proposito. El pedido va por `additionalContext`, que si entra al contexto del
// modelo, para que sea el agente quien lo levante en el primer turno.
function pedidoDeIdentidad() {
  const faltaTitulo = titulo === SIN, faltaProposito = proposito === SIN;
  if (!faltaTitulo && !faltaProposito) return null;
  const que = faltaTitulo && faltaProposito ? 'el Titulo y el Proposito'
            : faltaTitulo ? 'el Titulo' : 'el Proposito';
  return `Este repo todavia no tiene ${que} definido en \`.claude/identidad.md\`. `
    + 'Sin Proposito no es un Agente con Proposito: es el Agente Multiproposito a secas, y los '
    + 'subsistemas no tienen hacia donde acumular. En tu primera respuesta de esta sesion, '
    + `preguntale al usuario ${que} del repo —una linea cada uno— y asentalo en ese archivo `
    + '(titulo como encabezado `# <Titulo>`, y una linea `**Proposito:** <una oracion>`). '
    + 'No lo inventes ni lo infieras del contenido del repo sin confirmarlo: es la definicion '
    + 'que gobierna todo lo que el Agente acumula despues.';
}

if (HOOK) {
  // Salto inicial: separa la caja del prefijo "SessionStart:… says:" que antepone el CLI.
  const salida = { systemMessage: '\n' + box };
  const pedido = pedidoDeIdentidad();
  if (pedido) salida.hookSpecificOutput = { hookEventName: 'SessionStart', additionalContext: pedido };
  process.stdout.write(JSON.stringify(salida));
} else {
  process.stdout.write('```\n' + box + '\n```\n');
  const pedido = pedidoDeIdentidad();
  if (pedido) process.stdout.write('\n' + pedido + '\n');
}
```

`.claude/conducta/mostrar-pantalla-bienvenida/README.md`:

````markdown
# mostrar-pantalla-bienvenida

Script del subsistema `conducta`. Emite la **Pantalla de bienvenida** del Agente Multipropósito: un bloque de estado con Título + Propósito (de la **Identidad del Agente**) + métricas de cada subsistema (entradas) + estado de lint.

Es lo que corre la **Regla Base `correr`** del momento `al arrancar la sesión`: al iniciar la sesión, el hook repartidor `establecer-conducta` lo ejecuta y reenvía su salida. La skill `amp:info` muestra la misma pantalla a demanda. Por eso vive co-ubicado con `conducta` (como el repartidor y el lint) y no en el registro de Herramientas: es infra de una Regla Base, no una tool del Propósito.

## Cómo se invoca

```bash
node .claude/conducta/mostrar-pantalla-bienvenida/mostrar-pantalla-bienvenida.js
node .claude/conducta/mostrar-pantalla-bienvenida/mostrar-pantalla-bienvenida.js --sin-lint   # rápido, no corre los lints
node .claude/conducta/mostrar-pantalla-bienvenida/mostrar-pantalla-bienvenida.js --hook       # para el repartidor: emite {"systemMessage": <caja>}
```

En `settings.json` el `SessionStart` llama al repartidor `establecer-conducta`, que lee el registro de reglas, encuentra la regla `correr` de la bienvenida y ejecuta este script con `--hook`, reenviando su stdout.

## Cómo funciona

- **Descubrimiento dinámico:** un subsistema es un dir hijo de `.claude/` con su lint co-ubicado `.claude/<D>/lint-<D>/lint-<D>.js`. Sumar un subsistema con su lint lo hace aparecer solo, sin tocar este script.
- **Conteo de entradas:** genérico — filas de tabla si el índice es una tabla, si no bullets con link. Nombre del índice por prioridad (`INDICE.md` · `MEMORIA.md` · `PLANES.md` · `PREFERENCIAS.md`).
- **Enriquecimientos baratos:** `planes` desglosa los estados vivos; `preferencias` desglosa las del Agente Multipropósito y las del repo. El sustantivo por subsistema (memorias, términos…) es cosmético; los desconocidos caen a "entradas".
- **Lint:** corre cada `lint-<D>` (sin `--quiet`: ese flag da exit ≠ 0 en algunos lints artesanales) y suma los `(N)` de la salida, igual que `ejecutar-control-cierre`.
- **Identidad:** lee `.claude/identidad.md` (Título + Propósito). Tolerante a indefinido → muestra `<sin definir>`.

## Emisión (verificado)

Un `SessionStart` hook **no muestra un banner** propio como el logo del CLI. El único campo que se muestra en la terminal del usuario es `systemMessage`; el stdout crudo iría a `additionalContext`, que solo ve el modelo. Por eso `--hook` emite `{"systemMessage": <caja>}`. Sin `--hook`, la caja va envuelta en cerca de código para el transcript (skill `amp:info` y corridas a mano).
````

Cableado del repartidor — **registro doble**: el mismo script se registra en tres eventos de Claude Code (`SessionStart` + `UserPromptSubmit` + `PreToolUse`) y en dos de Codex. **Merge, nunca pisar:** sumar estas entradas a las que ya existan; si la entrada de `establecer-conducta` ya está, no duplicar. En particular el `SessionStart` del repartidor (que corre la Pantalla de bienvenida) se **mergea con el `SessionStart` de planes** (`lint-planes --quiet`) bajo el mismo evento, sin pisarlo — quedan las dos entradas en la lista de `hooks`.

**Claude Code** — merge en `.claude/settings.json` del repo (`SessionStart` merge con planes + `UserPromptSubmit` sin matcher + `PreToolUse` matcher `Write|Edit`):

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node -e \"let f=require('fs'),p=require('path'),d=process.env.CLAUDE_PROJECT_DIR||process.cwd();while(!f.existsSync(p.join(d,'.claude'))&&p.dirname(d)!==d)d=p.dirname(d);process.argv.push(p.join(d,'.claude/planes'));require(p.join(d,'.claude/planes/lint-planes/lint-planes.js'))\" lint-planes --quiet"
          },
          {
            "type": "command",
            "command": "node -e \"let f=require('fs'),p=require('path'),d=process.env.CLAUDE_PROJECT_DIR||process.cwd();while(!f.existsSync(p.join(d,'.claude'))&&p.dirname(d)!==d)d=p.dirname(d);require(p.join(d,'.claude/conducta/establecer-conducta/establecer-conducta.js'))\" establecer-conducta"
          }
        ]
      }
    ],
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node -e \"let f=require('fs'),p=require('path'),d=process.env.CLAUDE_PROJECT_DIR||process.cwd();while(!f.existsSync(p.join(d,'.claude'))&&p.dirname(d)!==d)d=p.dirname(d);require(p.join(d,'.claude/conducta/establecer-conducta/establecer-conducta.js'))\" establecer-conducta"
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "node -e \"let f=require('fs'),p=require('path'),d=process.env.CLAUDE_PROJECT_DIR||process.cwd();while(!f.existsSync(p.join(d,'.claude'))&&p.dirname(d)!==d)d=p.dirname(d);require(p.join(d,'.claude/conducta/establecer-conducta/establecer-conducta.js'))\" establecer-conducta"
          }
        ]
      }
    ]
  }
}
```

**Codex CLI** — merge en `.codex/hooks.json` del repo (los mismos tres eventos que en Claude Code):

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node -e \"let f=require('fs'),p=require('path'),d=process.env.CLAUDE_PROJECT_DIR||process.cwd();while(!f.existsSync(p.join(d,'.claude'))&&p.dirname(d)!==d)d=p.dirname(d);require(p.join(d,'.claude/conducta/establecer-conducta/establecer-conducta.js'))\" establecer-conducta"
          }
        ]
      }
    ],
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node -e \"let f=require('fs'),p=require('path'),d=process.env.CLAUDE_PROJECT_DIR||process.cwd();while(!f.existsSync(p.join(d,'.claude'))&&p.dirname(d)!==d)d=p.dirname(d);require(p.join(d,'.claude/conducta/establecer-conducta/establecer-conducta.js'))\" establecer-conducta"
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "node -e \"let f=require('fs'),p=require('path'),d=process.env.CLAUDE_PROJECT_DIR||process.cwd();while(!f.existsSync(p.join(d,'.claude'))&&p.dirname(d)!==d)d=p.dirname(d);require(p.join(d,'.claude/conducta/establecer-conducta/establecer-conducta.js'))\" establecer-conducta"
          }
        ]
      }
    ]
  }
}
```

> El matcher `Write|Edit` alcanza igual en Codex: toda edición de archivos pasa por `apply_patch`, que dispara `PreToolUse` y matchea como `apply_patch`, `Edit` o `Write`. La salvedad es el `deny`, que **hoy no frena** la escritura en Codex (bug abierto del CLI): ahí una regla `bloquear` degrada a aviso. Conocimiento `hooks-codex-cli`.
> En Codex el momento `al arrancar la sesión` **corre igual el repartidor** (mismo `SessionStart`), pero Codex **no soporta `SessionStart` → `systemMessage`** de la misma forma que Claude Code: la caja de la Pantalla de bienvenida sale solo si el agente muestra `systemMessage`; si no, degrada sin caja (la corrida no falla).
> ⚠️ Codex carga hooks de proyecto solo si la carpeta `.codex/` del repo es de **confianza** (revisar con `/hooks`) y con `features.hooks` habilitado en su config. La confianza se registra contra el texto del hook, así que **cada actualización que lo cambie lo vuelve a frenar hasta que se lo apruebe de nuevo**. Avisarle al usuario al instalar y al nivelar.

Lint `.claude/conducta/lint-conducta/lint-conducta.js` (Node, sin dependencias, sin red):

```js
#!/usr/bin/env node
// Lint del subsistema conducta: valida el registro de reglas (INDICE.md) contra el
// vocabulario de momentos (MOMENTOS.md). Sin LLM, sin red. Autocontenido: solo lee archivos del
// propio subsistema (por eso no comparte el fragmento repoRoot de los otros lints).
// Uso: node lint-conducta.js [<carpeta conducta>]   (default: .claude/conducta)
const fs = require('fs'), path = require('path');

// --- Indices por frontmatter ---
// Un subsistema tiene uno o mas Indices y cada archivo se declara a si mismo en un frontmatter
// minimo (indice, origen, columnas). El lint los descubre por ese frontmatter y no por un nombre
// fijo: el nombre dejo de codificar el origen, asi que deducirlo del nombre volveria a atarlos.
// Se acepta la forma vieja —el archivo de siempre, sin frontmatter— mientras haya Agentes
// Desplegados sin nivelar: ahi el origen queda en null y los chequeos que dependen de el no corren.
const ORIGENES = ['agente-multiproposito', 'agente-desplegado'];
const ETIQUETA_ORIGEN = { 'agente-multiproposito': 'Agente Multipropósito', 'agente-desplegado': 'Agente Desplegado' };
function leerFrontmatter(txt) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(txt);
  if (!m) return null;
  const campos = {};
  for (const linea of m[1].split(/\r?\n/)) {
    const kv = /^([a-zA-Z_][\w-]*):\s*(.*)$/.exec(linea);
    if (!kv) continue;
    const v = kv[2].trim();
    campos[kv[1]] = /^\[.*\]$/.test(v)
      ? v.slice(1, -1).split(',').map(x => x.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean)
      : v.replace(/^['"]|['"]$/g, '');
  }
  return campos;
}
// Encabezado real de la primera tabla markdown del archivo (null si no tiene tabla).
function cabeceraTabla(txt) {
  for (const linea of txt.split(/\r?\n/)) {
    const t = linea.trim();
    if (!t.startsWith('|')) continue;
    const celdas = t.split('|').slice(1, -1).map(c => c.replace(/\*/g, '').trim());
    if (/^:?-{2,}:?$/.test((celdas[0] || '').replace(/\s/g, ''))) continue;
    return celdas;
  }
  return null;
}
// Indices de un subsistema: los .md de su carpeta con frontmatter `indice:`, mas los nombres
// viejos que todavia no lo declaran. Da {archivo, nombre, texto, indice, origen, columnas, cabecera}.
function indicesDe(dirSub, nombresViejos) {
  const salida = [];
  let entradas = [];
  try { entradas = fs.readdirSync(dirSub); } catch (e) { return salida; }
  for (const nombre of entradas.sort()) {
    if (!nombre.endsWith('.md')) continue;
    const archivo = path.join(dirSub, nombre);
    let txt; try { txt = fs.readFileSync(archivo, 'utf8'); } catch (e) { continue; }
    const fm = leerFrontmatter(txt);
    const declarado = !!(fm && fm.indice);
    if (!declarado && !(nombresViejos || []).includes(nombre)) continue;
    salida.push({
      archivo, nombre, texto: txt,
      indice: declarado ? fm.indice : null,
      origen: declarado ? (fm.origen || '') : null,
      columnas: declarado && Array.isArray(fm.columnas) ? fm.columnas : null,
      cabecera: cabeceraTabla(txt),
    });
  }
  return salida;
}
// Dos controles sobre lo declarado. [a] Las columnas, en los DOS sentidos: la declarada que la
// tabla no tiene y la que la tabla tiene sin declarar. Con un solo sentido el frontmatter puede
// mentir por omision, y el codigo que ubica una columna por nombre —el repartidor de conducta
// ubica Momento y Clase— deja de encontrarla sin emitir ningun error. [b] El manifiesto contra el
// frontmatter: el manifiesto lista los Indices como texto fijo y el frontmatter es la autoridad;
// sin compararlos, el mismo dato queda escrito en dos lugares que nada sincroniza.
function problemasDeIndices(idxs, manifiestoTxt) {
  const out = [];
  const declarados = idxs.filter(i => i.indice);
  for (const i of declarados) {
    if (!ORIGENES.includes(i.origen)) out.push(`${i.nombre}: origen "${i.origen}" invalido (validos: ${ORIGENES.join(' / ')})`);
    if (!i.columnas) continue;
    if (!i.cabecera) { out.push(`${i.nombre}: declara columnas pero no se encontro la tabla`); continue; }
    for (const c of i.columnas) if (!i.cabecera.includes(c)) out.push(`${i.nombre}: columna declarada "${c}" que la tabla no tiene`);
    for (const c of i.cabecera) if (!i.columnas.includes(c)) out.push(`${i.nombre}: columna "${c}" en la tabla, sin declarar en el frontmatter`);
  }
  if (manifiestoTxt == null) return out;
  const linea = /^\*\*[IÍ]ndices?:\*\*(.*)$/m.exec(manifiestoTxt);
  if (!linea) {
    if (declarados.length) out.push('MANIFIESTO.md: falta el campo Indices, que lista los Indices del subsistema con su origen');
    return out;
  }
  const listados = [...linea[1].matchAll(/`([^`]+\.md)`\s*\(([^)]+)\)/g)].map(m => ({ nombre: m[1], origen: m[2].trim() }));
  for (const i of declarados) {
    const l = listados.find(x => x.nombre === i.nombre);
    if (!l) out.push(`MANIFIESTO.md: no lista el Indice ${i.nombre}`);
    else if (l.origen !== ETIQUETA_ORIGEN[i.origen]) out.push(`MANIFIESTO.md: ${i.nombre} figura como "${l.origen}" y su frontmatter dice "${i.origen}"`);
  }
  for (const l of listados) {
    if (!declarados.some(i => i.nombre === l.nombre)) out.push(`MANIFIESTO.md: lista ${l.nombre}, que no existe o no declara frontmatter`);
  }
  return out;
}
// --- fin indices por frontmatter ---
// La ruta es el primer argumento que NO sea una bandera: con `--quiet` primero, tomarlo por
// posicion daba una carpeta inexistente y el lint reportaba que faltaban MOMENTOS.md e INDICE.md.
const root = path.resolve(process.argv.slice(2).find(a => !a.startsWith('--')) || '.claude/conducta');
const quiet = process.argv.includes('--quiet');

const CLASES = ['inyectar', 'correr', 'bloquear'];      // las tres clases de accion, cerradas
const ESTADOS = ['vigente', 'pendiente', 'obsoleto'];

// -- parseo de tablas markdown ------------------------------------------
function filasTabla(txt, requeridas) {
  const out = [];
  const lineas = txt.split('\n').map(l => l.trim()).filter(l => l.startsWith('|'));
  let cols = null;
  for (const l of lineas) {
    const celdas = l.split('|').slice(1, -1).map(c => c.trim());
    const norm = celdas.map(c => c.toLowerCase().replace(/\*/g, ''));
    if (!cols) {
      if (requeridas.every(r => norm.includes(r))) {
        cols = {}; requeridas.forEach(r => { cols[r] = norm.indexOf(r); });
      }
      continue;
    }
    if (/^:?-{2,}:?$/.test(celdas[0].replace(/\s/g, ''))) continue;   // separador ---
    const fila = {}; for (const r of requeridas) fila[r] = (cols[r] < celdas.length ? celdas[cols[r]] : '');
    out.push(fila);
  }
  return { cols, filas: out };
}

const problemas = { estructura: [], indices: [], momentoInexistente: [], claseInvalida: [], estadoInvalido: [], inyectarSinTexto: [], vigenteSinRepartidor: [] };

// -- vocabulario de momentos --------------------------------------------
const momPath = path.join(root, 'MOMENTOS.md');
let momentos = new Map();   // nombre -> disponibilidad (activo|declarado)
if (!fs.existsSync(momPath)) problemas.estructura.push('falta MOMENTOS.md (vocabulario de momentos)');
else {
  const { cols, filas } = filasTabla(fs.readFileSync(momPath, 'utf8'), ['momento', 'disponibilidad']);
  if (!cols) problemas.estructura.push('MOMENTOS.md: no se encontro la tabla (columnas Momento, Disponibilidad)');
  else for (const f of filas) momentos.set(f.momento.toLowerCase(), f.disponibilidad.toLowerCase());
}

// -- registro de reglas -------------------------------------------------
// Las reglas se reparten entre uno o dos Indices (uno por origen) y el repartidor los lee a todos:
// mirar uno solo dejaria las reglas del otro sin validar, calladas.
const indices = indicesDe(root, ['INDICE.md']);
const maniPath = path.join(root, 'MANIFIESTO.md');
problemas.indices.push(...problemasDeIndices(indices, fs.existsSync(maniPath) ? fs.readFileSync(maniPath, 'utf8') : null));
if (!indices.length) problemas.estructura.push('falta el Indice de reglas (INDICE.md)');
for (const idx of indices) {
  const requeridas = ['regla', 'momento', 'clase', 'contenido', 'estado'];
  const { cols, filas } = filasTabla(idx.texto, requeridas);
  if (!cols) { problemas.estructura.push(`${idx.nombre}: no se encontro la tabla (columnas ${requeridas.join(', ')})`); continue; }
  for (const f of filas) {
    const regla = f.regla || '(sin nombre)';
    const momento = f.momento.toLowerCase(), clase = f.clase.toLowerCase(), estado = f.estado.toLowerCase();
    if (!momentos.has(momento)) problemas.momentoInexistente.push(`"${regla}" -> momento "${f.momento}" no esta en MOMENTOS.md`);
    if (!CLASES.includes(clase)) problemas.claseInvalida.push(`"${regla}" -> clase "${f.clase}" (validas: ${CLASES.join('/')})`);
    if (!ESTADOS.includes(estado)) problemas.estadoInvalido.push(`"${regla}" -> estado "${f.estado}" (validos: ${ESTADOS.join('/')})`);
    if (clase === 'inyectar' && !f.contenido) problemas.inyectarSinTexto.push(`"${regla}" -> clase inyectar sin Contenido`);
    // honestidad: una regla vigente no puede colgar de un momento sin repartidor (disponibilidad declarado)
    if (estado === 'vigente' && momentos.get(momento) === 'declarado')
      problemas.vigenteSinRepartidor.push(`"${regla}" -> vigente pero su momento "${f.momento}" es 'declarado' (sin repartidor): deberia ser 'pendiente'`);
  }
}

// -- salida -------------------------------------------------------------
const secciones = [
  ['ESTRUCTURA', problemas.estructura],
  ['INDICES DECLARADOS (frontmatter vs tabla vs manifiesto)', problemas.indices],
  ['MOMENTO INEXISTENTE (regla apunta a un momento fuera de MOMENTOS.md)', problemas.momentoInexistente],
  ['CLASE INVALIDA', problemas.claseInvalida],
  ['ESTADO INVALIDO', problemas.estadoInvalido],
  ['INYECTAR SIN CONTENIDO', problemas.inyectarSinTexto],
  ['VIGENTE SOBRE MOMENTO SIN REPARTIDOR', problemas.vigenteSinRepartidor],
];
const total = secciones.reduce((n, [, it]) => n + it.length, 0);
if (quiet && total === 0) process.exit(0);
console.log(`== LINT CONDUCTA: ${root} ==`);
console.log(`momentos: ${momentos.size} | hallazgos: ${total}\n`);
for (const [titulo, items] of secciones) {
  if (quiet && !items.length) continue;
  console.log(`[${titulo}] (${items.length})`);
  items.forEach(i => console.log(`    ${i}`));
  if (!quiet && !items.length) console.log('    (ninguno)');
}
```

`.claude/conducta/lint-conducta/README.md`:

```markdown
# lint-conducta

**Qué hace:** lint del subsistema `conducta` — valida el registro de reglas (`INDICE.md`) contra el vocabulario de momentos (`MOMENTOS.md`): que toda regla apunte a un momento existente, que la clase (`inyectar`/`correr`/`bloquear`) y el estado (`vigente`/`pendiente`/`obsoleto`) sean válidos, que ninguna regla `inyectar` quede sin `Contenido`, y —honestidad— que ninguna regla `vigente` cuelgue de un momento sin repartidor (disponibilidad `declarado`). Sin LLM, sin red. Autocontenido: solo lee archivos del propio subsistema.
**Cómo se corre:** `node .claude/conducta/lint-conducta/lint-conducta.js` (desde la raíz del repo). Flags: `--quiet` (solo imprime si hay hallazgos). Acepta una ruta a la carpeta de conducta como primer argumento (default `.claude/conducta`).
**Estado:** vigente.
**Referenciado por:** nadie automático — se corre a mano al cerrar tareas que tocaron `conducta`. (El hook que sí vive en el subsistema es el repartidor `establecer-conducta`, que es otra cosa: entrega reglas, no valida el registro.)
**Dependencias:** Node.js (sin libs externas).
**Origen (opcional):** funcionalidad `conducta` del harness — es infra del Patrón del subsistema (co-ubicada, como todo lint), **no** una Herramienta, así que no se registra en `herramientas/INDICE.md`.
```

## §Script — lint-preferencias — `.claude/preferencias/lint-preferencias/lint-preferencias.js`

Contenido exacto (Node, sin dependencias, sin red):

```js
#!/usr/bin/env node
// Lint estructural de preferencias: PREFERENCIAS.md con sus dos secciones por origen (Agente
// Multiproposito / Agente Desplegado) + @import en el punto de entrada (AGENTS.md/CLAUDE.md). Sin LLM, sin red.
// NO detecta contradicciones semanticas (eso es la capa semantica, a pedido).
// Uso: node lint-preferencias.js [<carpeta .claude>]   (default: .claude)
const fs = require('fs'), path = require('path');

// --- Indices por frontmatter ---
// Un subsistema tiene uno o mas Indices y cada archivo se declara a si mismo en un frontmatter
// minimo (indice, origen, columnas). El lint los descubre por ese frontmatter y no por un nombre
// fijo: el nombre dejo de codificar el origen, asi que deducirlo del nombre volveria a atarlos.
// Se acepta la forma vieja —el archivo de siempre, sin frontmatter— mientras haya Agentes
// Desplegados sin nivelar: ahi el origen queda en null y los chequeos que dependen de el no corren.
const ORIGENES = ['agente-multiproposito', 'agente-desplegado'];
const ETIQUETA_ORIGEN = { 'agente-multiproposito': 'Agente Multipropósito', 'agente-desplegado': 'Agente Desplegado' };
function leerFrontmatter(txt) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(txt);
  if (!m) return null;
  const campos = {};
  for (const linea of m[1].split(/\r?\n/)) {
    const kv = /^([a-zA-Z_][\w-]*):\s*(.*)$/.exec(linea);
    if (!kv) continue;
    const v = kv[2].trim();
    campos[kv[1]] = /^\[.*\]$/.test(v)
      ? v.slice(1, -1).split(',').map(x => x.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean)
      : v.replace(/^['"]|['"]$/g, '');
  }
  return campos;
}
// Encabezado real de la primera tabla markdown del archivo (null si no tiene tabla).
function cabeceraTabla(txt) {
  for (const linea of txt.split(/\r?\n/)) {
    const t = linea.trim();
    if (!t.startsWith('|')) continue;
    const celdas = t.split('|').slice(1, -1).map(c => c.replace(/\*/g, '').trim());
    if (/^:?-{2,}:?$/.test((celdas[0] || '').replace(/\s/g, ''))) continue;
    return celdas;
  }
  return null;
}
// Indices de un subsistema: los .md de su carpeta con frontmatter `indice:`, mas los nombres
// viejos que todavia no lo declaran. Da {archivo, nombre, texto, indice, origen, columnas, cabecera}.
function indicesDe(dirSub, nombresViejos) {
  const salida = [];
  let entradas = [];
  try { entradas = fs.readdirSync(dirSub); } catch (e) { return salida; }
  for (const nombre of entradas.sort()) {
    if (!nombre.endsWith('.md')) continue;
    const archivo = path.join(dirSub, nombre);
    let txt; try { txt = fs.readFileSync(archivo, 'utf8'); } catch (e) { continue; }
    const fm = leerFrontmatter(txt);
    const declarado = !!(fm && fm.indice);
    if (!declarado && !(nombresViejos || []).includes(nombre)) continue;
    salida.push({
      archivo, nombre, texto: txt,
      indice: declarado ? fm.indice : null,
      origen: declarado ? (fm.origen || '') : null,
      columnas: declarado && Array.isArray(fm.columnas) ? fm.columnas : null,
      cabecera: cabeceraTabla(txt),
    });
  }
  return salida;
}
// Dos controles sobre lo declarado. [a] Las columnas, en los DOS sentidos: la declarada que la
// tabla no tiene y la que la tabla tiene sin declarar. Con un solo sentido el frontmatter puede
// mentir por omision, y el codigo que ubica una columna por nombre —el repartidor de conducta
// ubica Momento y Clase— deja de encontrarla sin emitir ningun error. [b] El manifiesto contra el
// frontmatter: el manifiesto lista los Indices como texto fijo y el frontmatter es la autoridad;
// sin compararlos, el mismo dato queda escrito en dos lugares que nada sincroniza.
function problemasDeIndices(idxs, manifiestoTxt) {
  const out = [];
  const declarados = idxs.filter(i => i.indice);
  for (const i of declarados) {
    if (!ORIGENES.includes(i.origen)) out.push(`${i.nombre}: origen "${i.origen}" invalido (validos: ${ORIGENES.join(' / ')})`);
    if (!i.columnas) continue;
    if (!i.cabecera) { out.push(`${i.nombre}: declara columnas pero no se encontro la tabla`); continue; }
    for (const c of i.columnas) if (!i.cabecera.includes(c)) out.push(`${i.nombre}: columna declarada "${c}" que la tabla no tiene`);
    for (const c of i.cabecera) if (!i.columnas.includes(c)) out.push(`${i.nombre}: columna "${c}" en la tabla, sin declarar en el frontmatter`);
  }
  if (manifiestoTxt == null) return out;
  const linea = /^\*\*[IÍ]ndices?:\*\*(.*)$/m.exec(manifiestoTxt);
  if (!linea) {
    if (declarados.length) out.push('MANIFIESTO.md: falta el campo Indices, que lista los Indices del subsistema con su origen');
    return out;
  }
  const listados = [...linea[1].matchAll(/`([^`]+\.md)`\s*\(([^)]+)\)/g)].map(m => ({ nombre: m[1], origen: m[2].trim() }));
  for (const i of declarados) {
    const l = listados.find(x => x.nombre === i.nombre);
    if (!l) out.push(`MANIFIESTO.md: no lista el Indice ${i.nombre}`);
    else if (l.origen !== ETIQUETA_ORIGEN[i.origen]) out.push(`MANIFIESTO.md: ${i.nombre} figura como "${l.origen}" y su frontmatter dice "${i.origen}"`);
  }
  for (const l of listados) {
    if (!declarados.some(i => i.nombre === l.nombre)) out.push(`MANIFIESTO.md: lista ${l.nombre}, que no existe o no declara frontmatter`);
  }
  return out;
}
// --- fin indices por frontmatter ---
const claudeDir = path.resolve(process.argv[2] || '.claude');
const dirPref = path.join(claudeDir, 'preferencias');
const problems = [];

// Un Indice por origen. La forma vieja —un solo archivo con las dos secciones adentro— se acepta
// mientras haya Agentes Desplegados sin nivelar; ahi el corte se chequea por encabezado.
const indices = indicesDe(dirPref, ['PREFERENCIAS.md']);
const declarados = indices.filter(i => i.indice);
const maniPath = path.join(dirPref, 'MANIFIESTO.md');
problems.push(...problemasDeIndices(indices, fs.existsSync(maniPath) ? fs.readFileSync(maniPath, 'utf8') : null));

if (!indices.length) {
  problems.push('no existe ningun Indice de preferencias en preferencias/ (PREFERENCIAS.md)');
} else if (declarados.length) {
  for (const origen of ORIGENES) {
    if (!declarados.some(i => i.origen === origen)) problems.push(`ningun Indice de preferencias declara origen "${origen}"`);
  }
  for (const i of declarados) {
    if (i.texto.replace(/^---[\s\S]*?\n---/, '').trim().length < 50) problems.push(`${i.nombre} casi vacio (sin contenido util)`);
  }
} else {
  const txt = indices[0].texto;
  // Los nombres viejos ("## Base" / "## Adaptaciones") se aceptan mientras haya Agentes
  // Desplegados sin nivelar: el nivelador los migra, y hasta entonces el lint no debe fallar.
  if (!/^##\s+(Preferencias del Agente Multiprop[oó]sito|Base)\b/mi.test(txt)) problems.push('falta la seccion "## Preferencias del Agente Multiproposito"');
  if (!/^##\s+(Preferencias del Agente Desplegado|Adaptaciones)\b/mi.test(txt)) problems.push('falta la seccion "## Preferencias del Agente Desplegado"');
  if (txt.trim().length < 50) problems.push('PREFERENCIAS.md casi vacio (sin contenido util)');
}

// Una linea de importacion POR CADA Indice declarado: las preferencias tienen que estar siempre en
// contexto, y con dos archivos un solo import deja al otro afuera sin que nada lo marque.
// Fuente: AGENTS.md en la raiz; layouts legacy: CLAUDE.md en la raiz o dentro de <config>/.
const root = path.dirname(claudeDir);
const entradas = [path.join(root, 'AGENTS.md'), path.join(root, 'CLAUDE.md'), path.join(claudeDir, 'CLAUDE.md')]
  .filter(f => fs.existsSync(f));
if (entradas.length) {
  const textos = entradas.map(f => fs.readFileSync(f, 'utf8'));
  // el import lleva el prefijo segun donde viva el punto de entrada: @preferencias/... o @.claude/preferencias/...
  for (const i of (indices.length ? indices : [])) {
    const re = new RegExp('@[\\w./-]*preferencias/' + i.nombre.replace(/\./g, '\\.'));
    if (!textos.some(t => re.test(t)))
      problems.push(`ningun punto de entrada (AGENTS.md/CLAUDE.md) importa @preferencias/${i.nombre} (no queda en contexto)`);
  }
} else {
  problems.push('no existe punto de entrada (AGENTS.md o CLAUDE.md; no se pudo verificar el @import)');
}

console.log(`== LINT PREFERENCIAS: ${dirPref} ==`);
console.log(`hallazgos: ${problems.length}\n`);
if (!problems.length) console.log('    (ok)');
else problems.forEach(p => console.log(`    [x] ${p}`));
```


## §Componentes de Subsistema que se copian tal cual

Estos Componentes de Subsistema se instalan en sus rutas indicadas. Cada bloque es copia literal del archivo vivo del Agente Multipropósito.

### `.claude/subsistemas/MANIFIESTO.md`

````markdown
# Subsistemas — manifiesto de subsistema

Este directorio cataloga los subsistemas instalados del Agente Multipropósito y apunta a la casa de cada uno; no guarda el contenido de esos subsistemas. Un archivo por origen: los que pertenecen a la Base y los que nacieron del Propósito.

**Disparador:** consultar el catálogo para descubrir qué casas existen y quién debe recibir un Componente de Subsistema de Aprendizaje. Escribir al agregar, retirar o cambiar de origen un subsistema.

**Skills:** `agregar-subsistema` (crea una casa nueva siguiendo el Patrón) y `reubicar-aprendizaje` (coordina con las habilidades dueñas el reparto guiado de los Componentes de Subsistema antiguos).

**Índices:** `SUBSISTEMAS.md` (Agente Multipropósito) · `SUBSISTEMAS-LOCAL.md` (Agente Desplegado). **Se cargan siempre** (livianos). Al cerrar una tarea que cambió el catálogo o sus casas, correr:

```bash
node .claude/subsistemas/lint-subsistemas/lint-subsistemas.js
```

@SUBSISTEMAS.md
@SUBSISTEMAS-LOCAL.md
````

### `.claude/subsistemas/SUBSISTEMAS.md`

````markdown
---
indice: Subsistemas
origen: agente-multiproposito
columnas: [Subsistema, Qué guarda, Operación]
---

# Subsistemas

Catálogo de casas persistentes del Agente Multipropósito, separado por origen en **dos archivos** que lo declaran en su frontmatter: este (`origen: agente-multiproposito`, lo mantiene `amp:actualizar`, que lo reemplaza entero) y [`SUBSISTEMAS-LOCAL.md`](SUBSISTEMAS-LOCAL.md) (`origen: agente-desplegado`, las casas que suma el Propósito con `agregar-subsistema`; el nivelador no lo abre).

## Subsistemas del Agente Multipropósito

| Subsistema | Qué guarda | Operación |
|---|---|---|
| [subsistemas](./) | Catálogo y coordinación entre casas | `agregar-subsistema`, `reubicar-aprendizaje` |
| [preferencias](../preferencias/) | Preferencias del usuario, las del Agente Multipropósito y las del repo | `registrar-preferencia` |
| [planes](../planes/) | Planes y su ciclo de vida | `ciclo-de-plan` |
| [conocimiento](../conocimiento/) | Lo que el agente sabe y necesita reutilizar | `registrar-conocimiento`, `buscar-conocimiento` |
| [semantica](../semantica/) | Vocabulario legítimo y relaciones vetadas | `converger-terminologia` |
| [decisiones](../decisiones/) | Decisiones estructurales | `registrar-decision` |
| [herramientas](../herramientas/) | Herramientas repetibles y su registro | `registrar-herramienta` |
| [conducta](../conducta/) | Reglas entregadas en el momento de actuar | `registrar-regla` |
````

### `.claude/subsistemas/SUBSISTEMAS-LOCAL.md`

Nace **declarado y sin filas**, no vacío: el manifiesto que se instala lo nombra, y `agregar-subsistema` escribe siempre sobre un archivo que existe.

````markdown
---
indice: Subsistemas del Agente Desplegado
origen: agente-desplegado
columnas: [Subsistema, Qué guarda, Operación]
---

# Subsistemas del Agente Desplegado

Las casas que este repo suma para su Propósito con `agregar-subsistema`. El nivelador no toca este archivo. Las columnas y la convención completa están en [`SUBSISTEMAS.md`](SUBSISTEMAS.md).

| Subsistema | Qué guarda | Operación |
|---|---|---|
````

### `.claude/subsistemas/README.md`

````markdown
# Subsistemas

Un subsistema es una casa persistente con propósito propio. Sigue el Patrón mínimo: manifiesto para saber cuándo usarlo, índice o registro para descubrir sus entradas, entradas propias y un lint mecánico.

`SUBSISTEMAS.md` es el catálogo, no un segundo índice de todo el contenido. La separación por origen en dos archivos —`SUBSISTEMAS.md` y `SUBSISTEMAS-LOCAL.md`, cada uno declarado en su frontmatter— permite que el actualizador reemplace entero el que distribuye sin abrir el de las casas creadas por el repo.

La reubicación de Aprendizaje antiguo se hace de a un Componente de Subsistema por vez. `reubicar-aprendizaje` los inventaría, pide a la habilidad del destino que evalúe pertenencia y no mueve ni parte nada sin confirmación explícita del usuario.
````

### `.claude/subsistemas/lint-subsistemas/README.md`

````markdown
# lint-subsistemas

Comprueba que el catálogo y las casas instaladas coincidan, que no haya filas duplicadas y que cada subsistema catalogado tenga `MANIFIESTO.md`.

```bash
node .claude/subsistemas/lint-subsistemas/lint-subsistemas.js
```
````

### `.claude/subsistemas/lint-subsistemas/lint-subsistemas.js`

```js
#!/usr/bin/env node
// Lint del catalogo de subsistemas: catalogo<->disco, duplicados y manifiestos. Sin LLM, sin red.
const fs = require('fs');
const path = require('path');

// --- Indices por frontmatter ---
// Un subsistema tiene uno o mas Indices y cada archivo se declara a si mismo en un frontmatter
// minimo (indice, origen, columnas). El lint los descubre por ese frontmatter y no por un nombre
// fijo: el nombre dejo de codificar el origen, asi que deducirlo del nombre volveria a atarlos.
// Se acepta la forma vieja —el archivo de siempre, sin frontmatter— mientras haya Agentes
// Desplegados sin nivelar: ahi el origen queda en null y los chequeos que dependen de el no corren.
const ORIGENES = ['agente-multiproposito', 'agente-desplegado'];
const ETIQUETA_ORIGEN = { 'agente-multiproposito': 'Agente Multipropósito', 'agente-desplegado': 'Agente Desplegado' };
function leerFrontmatter(txt) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(txt);
  if (!m) return null;
  const campos = {};
  for (const linea of m[1].split(/\r?\n/)) {
    const kv = /^([a-zA-Z_][\w-]*):\s*(.*)$/.exec(linea);
    if (!kv) continue;
    const v = kv[2].trim();
    campos[kv[1]] = /^\[.*\]$/.test(v)
      ? v.slice(1, -1).split(',').map(x => x.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean)
      : v.replace(/^['"]|['"]$/g, '');
  }
  return campos;
}
// Encabezado real de la primera tabla markdown del archivo (null si no tiene tabla).
function cabeceraTabla(txt) {
  for (const linea of txt.split(/\r?\n/)) {
    const t = linea.trim();
    if (!t.startsWith('|')) continue;
    const celdas = t.split('|').slice(1, -1).map(c => c.replace(/\*/g, '').trim());
    if (/^:?-{2,}:?$/.test((celdas[0] || '').replace(/\s/g, ''))) continue;
    return celdas;
  }
  return null;
}
// Indices de un subsistema: los .md de su carpeta con frontmatter `indice:`, mas los nombres
// viejos que todavia no lo declaran. Da {archivo, nombre, texto, indice, origen, columnas, cabecera}.
function indicesDe(dirSub, nombresViejos) {
  const salida = [];
  let entradas = [];
  try { entradas = fs.readdirSync(dirSub); } catch (e) { return salida; }
  for (const nombre of entradas.sort()) {
    if (!nombre.endsWith('.md')) continue;
    const archivo = path.join(dirSub, nombre);
    let txt; try { txt = fs.readFileSync(archivo, 'utf8'); } catch (e) { continue; }
    const fm = leerFrontmatter(txt);
    const declarado = !!(fm && fm.indice);
    if (!declarado && !(nombresViejos || []).includes(nombre)) continue;
    salida.push({
      archivo, nombre, texto: txt,
      indice: declarado ? fm.indice : null,
      origen: declarado ? (fm.origen || '') : null,
      columnas: declarado && Array.isArray(fm.columnas) ? fm.columnas : null,
      cabecera: cabeceraTabla(txt),
    });
  }
  return salida;
}
// Dos controles sobre lo declarado. [a] Las columnas, en los DOS sentidos: la declarada que la
// tabla no tiene y la que la tabla tiene sin declarar. Con un solo sentido el frontmatter puede
// mentir por omision, y el codigo que ubica una columna por nombre —el repartidor de conducta
// ubica Momento y Clase— deja de encontrarla sin emitir ningun error. [b] El manifiesto contra el
// frontmatter: el manifiesto lista los Indices como texto fijo y el frontmatter es la autoridad;
// sin compararlos, el mismo dato queda escrito en dos lugares que nada sincroniza.
function problemasDeIndices(idxs, manifiestoTxt) {
  const out = [];
  const declarados = idxs.filter(i => i.indice);
  for (const i of declarados) {
    if (!ORIGENES.includes(i.origen)) out.push(`${i.nombre}: origen "${i.origen}" invalido (validos: ${ORIGENES.join(' / ')})`);
    if (!i.columnas) continue;
    if (!i.cabecera) { out.push(`${i.nombre}: declara columnas pero no se encontro la tabla`); continue; }
    for (const c of i.columnas) if (!i.cabecera.includes(c)) out.push(`${i.nombre}: columna declarada "${c}" que la tabla no tiene`);
    for (const c of i.cabecera) if (!i.columnas.includes(c)) out.push(`${i.nombre}: columna "${c}" en la tabla, sin declarar en el frontmatter`);
  }
  if (manifiestoTxt == null) return out;
  const linea = /^\*\*[IÍ]ndices?:\*\*(.*)$/m.exec(manifiestoTxt);
  if (!linea) {
    if (declarados.length) out.push('MANIFIESTO.md: falta el campo Indices, que lista los Indices del subsistema con su origen');
    return out;
  }
  const listados = [...linea[1].matchAll(/`([^`]+\.md)`\s*\(([^)]+)\)/g)].map(m => ({ nombre: m[1], origen: m[2].trim() }));
  for (const i of declarados) {
    const l = listados.find(x => x.nombre === i.nombre);
    if (!l) out.push(`MANIFIESTO.md: no lista el Indice ${i.nombre}`);
    else if (l.origen !== ETIQUETA_ORIGEN[i.origen]) out.push(`MANIFIESTO.md: ${i.nombre} figura como "${l.origen}" y su frontmatter dice "${i.origen}"`);
  }
  for (const l of listados) {
    if (!declarados.some(i => i.nombre === l.nombre)) out.push(`MANIFIESTO.md: lista ${l.nombre}, que no existe o no declara frontmatter`);
  }
  return out;
}
// --- fin indices por frontmatter ---

const claude = path.resolve(process.argv[2] || '.claude');
const dirCatalogo = path.join(claude, 'subsistemas');
const ignorar = new Set(['skills', 'tmp']);
const errores = [];

// El catalogo se reparte entre uno o dos Indices (uno por origen); las filas salen de todos.
const catalogos = indicesDe(dirCatalogo, ['SUBSISTEMAS.md']);
if (!catalogos.length) {
  console.error('[!] Falta el Indice del catalogo en .claude/subsistemas/ (SUBSISTEMAS.md)');
  process.exit(1);
}
const maniPath = path.join(dirCatalogo, 'MANIFIESTO.md');
errores.push(...problemasDeIndices(catalogos, fs.existsSync(maniPath) ? fs.readFileSync(maniPath, 'utf8') : null));

const texto = catalogos.map(i => i.texto).join('\n');
const filas = [...texto.matchAll(/^\|\s*\[([^\]]+)\]\(([^)]+)\)\s*\|/gm)]
  .map(([, nombre, enlace]) => ({ nombre: nombre.trim(), enlace: enlace.trim() }));
const nombres = filas.map(f => f.nombre);

for (const nombre of new Set(nombres)) {
  if (nombres.filter(n => n === nombre).length > 1) errores.push(`fila duplicada: ${nombre}`);
}

for (const fila of filas) {
  const destino = path.resolve(dirCatalogo, fila.enlace);
  if (!fs.existsSync(destino) || !fs.statSync(destino).isDirectory()) errores.push(`casa inexistente: ${fila.nombre} -> ${fila.enlace}`);
  else if (!fs.existsSync(path.join(destino, 'MANIFIESTO.md')) && fila.nombre !== 'preferencias')
    errores.push(`sin MANIFIESTO.md: ${fila.nombre}`);
}

const casas = fs.readdirSync(claude, { withFileTypes: true })
  .filter(e => e.isDirectory() && !e.name.startsWith('.') && !ignorar.has(e.name))
  .map(e => e.name)
  .filter(n => fs.existsSync(path.join(claude, n, 'MANIFIESTO.md')));
for (const casa of casas) {
  if (!nombres.includes(casa)) errores.push(`casa no catalogada: ${casa}`);
}

console.log(`subsistemas: ${filas.length} | casas: ${casas.length}`);
if (errores.length) {
  errores.forEach(e => console.error(`[!] ${e}`));
  process.exit(1);
}
console.log('OK');
```

### `.claude/planes/README.md`

````markdown
# Planes

Persistir y gestionar planes bajo `.claude/planes/` con tres subcarpetas: `pendientes/` (planes vivos: `Nuevo`, `En curso`, `Diferido`), `ejecutados/` y `descartados/` (registro, siempre con motivo). Lo fino (estado, fechas, origen) vive en el registro `planes/PLANES.md`, no en el nombre del archivo. Los **estados disponibles y su semántica** (a qué carpeta mapea cada uno, cuáles son terminales) están en `planes/ESTADOS.md` — fuente de verdad configurable que el lint lee.

**Máquina de un solo eje:** un plan está en exactamente un estado. `Nuevo` (creado, sin ejecutar; la revisión con `planificar` ocurre acá) → `En curso` (se tomó el plan y se está ejecutando) → `Ejecutado` (terminal). `Diferido` = pospuesto, retomable. `Descartado` = abandonado con motivo (terminal). No hay estado de "diseño": la revisión es parte de estar `Nuevo`.

**Why:** trazabilidad de qué se planificó, cuándo se creó y cuándo y cómo se cerró — sin depender de archivos efímeros de plan-mode del harness, y sin mirar carpetas a ojo: el registro es la vista, y está siempre en contexto vía el Mapa del repo. Un solo eje (en vez de prioridad × progreso) porque en la práctica un plan pausado siempre está sin empezar, y la distinción diseño/ejecución no aporta al flujo.

**How to apply:**

1. **Al crear un plan:** copiar a `.claude/planes/pendientes/<nombre-estable>.md` (sin fecha en el nombre) y agregar su fila en `PLANES.md`: Estado (de `ESTADOS.md`), Creado, Origen si se desprende de otro plan.
2. **Cada actualización al plan** se replica en la versión persistida — es la fuente de verdad, no el archivo del plans-folder del harness. Los cambios de estado se reflejan en `PLANES.md`, y el archivo se mueve a la carpeta que el estado indica.
3. **Al detectar evidencia de implementación** (commit, mensaje del user, código verificado, otro agente): pasar a `Ejecutado` y mover a `ejecutados/` **sin renombrar**, completar `Cerrado` en el registro y revisar primero los encabezados. Si ya hay una sección de implementación (`## Implementación` o `## Notas de implementación`, con cualquier nivel), conservar su contenido y normalizar solo el título a **`## Notas de implementación`** si corresponde; solo si no existe, agregarla (cómo se implementó vs planificado, hash de commit, cosas notables). Nunca crear una sección vacía que duplique notas legacy.
4. **Descartar es un cierre válido:** `Descartado`, mover a `descartados/`, completar `Cerrado` y una línea de motivo en Notas (p. ej. "superseded por <plan>").
5. **Reparar referencias entrantes** si las hubiera (el nombre estable minimiza esto; preferir enlazar planes vía `PLANES.md`).
6. **Al cerrar** una tarea que tocó planes, correr el lint: `node .claude/planes/lint-planes/lint-planes.js`.

Importante: borrar el archivo de `pendientes/` al moverlo — no duplicar. Un plan puede persistirse antes de arrancar la ejecución (p. ej. para cortar una sesión larga de diseño): Estado `Nuevo` o `Diferido` en el registro y bloque al tope con los pendientes para retomar.

**Partir un plan a medias:** cuando un plan queda `En curso` con el núcleo hecho pero un cacho pendiente, **partirlo** en vez de arrastrarlo. Cerrar como `Ejecutado` el alcance ya logrado (con sus `## Notas de implementación`) y **desprender el resto como plan nuevo** — `Nuevo` si se retoma pronto, `Diferido` si la espera es a propósito (p. ej. dejar correr una medición unas sesiones) — con `Origen` apuntando al cerrado y la condición de reanudación anotada si es Diferido. Mantiene el registro honesto (`Ejecutado` = ejecutado de verdad, `En curso` = de verdad ejecutándose) y evita planes zombis que dicen "en curso" mientras en realidad esperan. Aplica igual cuando un plan cubre dos mitades separables aunque ninguna esté a medias: cerrar la resuelta, desprender la otra.

Relacionado: [[archivo-de-estado]] (estado vivo de una exploración dentro del plan).
````

### `.claude/conocimiento/README.md`

````markdown
# Conocimiento

El conocimiento persistido del agente (documentos, estudios, temas y notas del proyecto o dominio) vive en una carpeta única: `.claude/conocimiento/`, con un `INDICE.md` en su raíz. La convención de Herramientas está en [el README de ese subsistema](../herramientas/README.md).

**Why:** ubicación determinística → el lint y cualquier consulta saben dónde mirar sin heurística; separa lo que el agente conoce de la configuración y de sus Herramientas; mantiene la raíz del repo limpia.

**How to apply:**

1. **Cuándo asentar:** al averiguar algo que costó descubrir y que va a hacer falta de nuevo (cómo funciona el proyecto, el dominio, un sistema externo, un formato o una restricción real). La skill `registrar-conocimiento` hace el flujo. **Dónde:** todo md de conocimiento nuevo va bajo `.claude/conocimiento/` (subcarpetas por tema; cada una con su `INDICE.md` si crece). Nunca en la raíz del repo.
2. Mantener `.claude/conocimiento/INDICE.md` como índice raíz (una línea por página/sección; solo punteros).
3. **Al cerrar** una tarea que escribió conocimiento, correr el lint mecánico: `node .claude/conocimiento/lint-conocimiento/lint-conocimiento.js`. Chequea refs rotas, índice incompleto y huérfanos (sin LLM, sin red). Resolver los hallazgos.
4. El **chequeo semántico** (contradicciones entre páginas, duplicación, desactualización) se corre a pedido tras una incorporación grande, no en cada cierre.
5. **Migración:** un script de datos acoplado por `__dirname` que se mueva a `.claude/herramientas/<tool>/` debe reapuntar sus paths a la carpeta de datos en `conocimiento/` (`__dirname + '/../../conocimiento/<subdir>/...'`), o se rompe.
````

### `.claude/semantica/README.md`

````markdown
# Semántica

El subsistema `semántica` mantiene la coherencia semántica del dominio en el tiempo. Vive en `.claude/semantica/` con **dos registros pares**, ninguno cargado en contexto siempre:

- `GLOSARIO.md` — terminología **legítima**: una tabla donde cada fila es un concepto (nombre canónico, definición corta, `Alias`, `Propuestos`, `Detalle`). Los conceptos complejos tienen su propia página `.claude/semantica/<nombre>.md`.
- `TERMINOLOGIA-FARLOPA.md` — relaciones **vetadas**: `Término | Significado vetado | Cómo decirlo | Control`. **Lo vetado es la relación término→significado, no el término**: el mismo término con otro significado puede ser legítimo (`plomería`=cañerías es válido; `plomería`=infra interna es farlopa). El lint **marca por término**; el agente **juzga el significado** al leer la marca. La columna `Control` dice si al escribirlo **frena** la escritura (`bloquea`: sin uso legítimo posible) o solo la **informa** (`avisa`, el default).

**Términos por estado (glosario):** `Alias` (formas válidas, ratificadas), `Propuestos` (sugeridos por el agente, sin usar hasta ratificar). El glosario **NO tiene columna de vetados**: todo veto es una relación término→significado y vive en el registro par de Terminología Farlopa.

**Why:** coherencia semántica a lo largo de la vida del repo. Los alias válidos **se registran** (saber que "birra/chela" son la misma cerveza evita confusión); los términos confusos o ajenos al dominio **se vetan** (dejan de usarse y se barren del texto vivo). Los agentes acumulan jerga sesión tras sesión —ver el conocimiento `terminologia-farlopa.md`—; la semántica la frena.

**Gobernanza:** el agente **nunca** ratifica un alias ni veta por su cuenta: solo **propone** en `Propuestos`. Ratificar y vetar son del usuario. El agente **nunca usa** un término que esté en `Propuestos`, ni uno vetado en el significado que Terminología Farlopa prohíbe, ni en texto plano, memorias, planes o código.

**How to apply:**

1. **Al planificar o analizar**, consultar los dos registros. Término nuevo válido → proponerlo en `Propuestos`. Término confuso o ajeno → proponer vetarlo (a Terminología Farlopa). En ambos casos, decide el usuario.
2. Concepto **simple** → una fila del glosario. Concepto **complejo** → fila + página de detalle enlazada.
3. **Al cerrar** una tarea que tocó semántica, correr el lint: `node .claude/semantica/lint-semantica/lint-semantica.js` (links de detalle, huérfanos, colisiones, propuestos pendientes, apariciones de vetados en el repo).

Relacionado: [[flujo-planes]] (consultar la semántica al planificar/analizar), [[terminologia-canonica]] (la ratificación no vale hasta bajarla al texto).
````

### `.claude/decisiones/README.md`

````markdown
# Decisiones

Las decisiones **estructurales al propósito del repo** se asientan en `.claude/decisiones/INDICE.md`: una tabla donde cada fila es una decisión (N° secuencial, qué se decidió y por qué, fecha, estado, y link a página de detalle si requiere conceptualización mayor). Misma estructura que el glosario: lo simple vive en la fila, lo complejo en su `NNNN-nombre.md`.

**Why:** coherencia decisional a lo largo de la vida del repo — no re-decidir ni contradecir lo estructural. Acotado a lo estructural (no lo operativo trivial) para que el registro siga siendo señal y no ruido — es lo que hacía la "A" de ADR, generalizada a repos de cualquier propósito.

**How to apply:**

1. **Qué registrar:** decisiones que definen cómo es / qué hace el repo en lo esencial, o que eligen un camino que condiciona el trabajo futuro. **No** las triviales o efímeras ("busqué en internet", "usé tal comando").
2. **Al planificar o analizar**, consultar las decisiones previas: no re-abrir lo cerrado ni contradecirlo. Reemplazar, no borrar: agregar la nueva y marcar la vieja `reemplazada por NNNN`.
3. **Simple** → una fila, Detalle en `—`. **Compleja** (contexto, alternativas, consecuencias) → fila + página `NNNN-nombre.md`.
4. **Al cerrar** una tarea que registró decisiones, correr el lint: `node .claude/decisiones/lint-decisiones/lint-decisiones.js` (numeración, links de detalle, huérfanos, superseded).

Relacionado: [[flujo-planes]] (consultar/registrar decisiones al cerrar planes).
````

### `.claude/herramientas/README.md`

````markdown
# Herramientas

Las **Herramientas** del repo son las *tools* que el **Propósito** del repo requiere y el agente invoca para tareas repetibles. Tipos: `script`, `skill` local del repo, `MCP` local. Viven catalogadas en `.claude/herramientas/INDICE.md` y `INDICE-LOCAL.md` —un archivo por origen, declarado en su frontmatter— con la misma tabla (Herramienta | Tipo | Qué hace | Cómo se invoca | Estado). Cada fila apunta a donde vive la tool: un `script` en su carpeta `<tool>/` bajo herramientas, una `skill` en `.claude/skills/<skill>/`, un `MCP` en `.mcp.json`.

**Distinción clave:** los **lints de subsistema** (`lint-subsistemas`, `lint-semantica`, …) **no** son Herramientas. Son infraestructura del Patrón de cada subsistema (índice + entradas + **lint**) y viven con su subsistema. En el registro de Herramientas solo van tools del Propósito.

**Why:** que la colección de tools del Propósito no se vuelva un conjunto de herramientas desordenadas sin saber qué son, de dónde salieron ni cómo se usan. Ubicación determinística + registro escaneable + ficha por tool. Y que la infraestructura interna del harness (lints) no se confunda con las tools de dominio.

**How to apply:**

1. Toda Herramienta nueva del repo va al registro `.claude/herramientas/INDICE-LOCAL.md` (una fila), con su `Tipo`. Un `script` vive en `.claude/herramientas/<tool>/` con su `README.md` (nunca suelto); una `skill`/`MCP` se apunta a donde vive.
2. Marcar `Estado`; los `obsoleto` se pueden depurar.
3. ⚠️ **Refs por ruta:** una tool referenciada por ruta en `settings.local.json`/`settings.json` (regla de permiso), en `.gitignore` o en un hook NO se mueve/renombra alegremente — rompe el match por prefijo exacto y se pierde la pre-autorización (en headless, denegación directa). Antes de mover, grep su ruta; si aparece, actualizar la referencia en el mismo paso.
4. **Al cerrar** una tarea que tocó Herramientas, correr el lint: `node .claude/herramientas/lint-herramientas/lint-herramientas.js` (README por herramienta local, registro completo, filas colgadas, refs por ruta de lint en settings).

Planes, conocimiento u otros subsistemas pueden referenciar una Herramienta por su ruta explicando cómo usarla en su contexto.

Relacionado: [[flujo-planes]], [[base-conocimiento]].
````

### `.claude/conducta/README.md`

````markdown
# Conducta

El subsistema `conducta` asegura comportamientos del tipo **"cuando hagas X, asegurate de Y"**: ata **momentos** del flujo a **acciones**. Vive en `.claude/conducta/`:

- `INDICE.md` e `INDICE-LOCAL.md` — el **registro de reglas**: cada fila ata un momento a una acción (`Regla | Momento | Clase | Contenido | Estado`). Separado por origen en **dos archivos**, cada uno con su frontmatter: `INDICE.md` (`origen: agente-multiproposito`, el nivelador lo reemplaza entero) e `INDICE-LOCAL.md` (`origen: agente-desplegado`, lo suma cada repo; el nivelador no lo abre). El repartidor lee los dos.
- `MOMENTOS.md` — el **vocabulario de momentos**: un momento es un **evento de hook + una condición que la máquina evalúa sin juicio** (`cada turno` = `UserPromptSubmit`; `al escribir` = `PreToolUse` sobre un `.md` de **cualquier parte del repo** salvo `tmp/`; `al cerrar tarea` = `Stop`, aún sin repartidor).
- `establecer-conducta/` — el **hook repartidor**: un mismo script sirve a varios eventos; resuelve qué momento realiza el evento que lo disparó, lee el registro **vivo** y despacha las reglas `vigente` de ese momento según su clase, **combinando** el texto de las `inyectar` con lo que midan las `bloquear`. Agregar o cambiar una regla **no toca el hook**.
- `lint-conducta/` — valida que toda regla apunte a un momento existente, con clase/estado válidos, y que ninguna regla `vigente` cuelgue de un momento sin repartidor.

**Clases de acción:** `inyectar` (el agente lee un texto y actúa con su juicio) · `correr` (una Herramienta lo resuelve sin juicio) · `bloquear` (se frena la acción; solo donde Y es sin juicio y el falso positivo es imposible).

**Why:** una regla cargada al arranque **se recita, no se obedece** (conocimiento `modos-de-falla-ante-reglas-escritas`). El aporte de conducta es entregar la regla **en el momento** en que hace falta, no al inicio de la sesión — por eso el registro **NO se carga siempre** y el agente **no lo consulta a mano**: lo entrega el hook cerca del punto de acción.

**Gobernanza:** se edita al **agregar, modificar o dar de baja una regla**. Toda regla nueva que toque terminología o decisiones pasa por el usuario (el agente propone; ratificar es potestad del usuario).

**How to apply:**

1. **En el flujo normal, no consultar `INDICE.md` a mano** — el hook entrega la regla que corresponde a cada momento.
2. **Para agregar una regla:** elegir un momento existente de `MOMENTOS.md` (o declarar uno nuevo, en `declarado` hasta que tenga repartidor), sumar la fila al archivo que corresponda (`INDICE.md` si viene con el Agente Multipropósito, `INDICE-LOCAL.md` si es de este repo), y correr el lint. Una regla `vigente` no puede colgar de un momento sin repartidor: va en `pendiente`.
3. **Al cerrar** una tarea que tocó conducta, correr el lint: `node .claude/conducta/lint-conducta/lint-conducta.js`.

Relacionado: [[flujo-planes]] (construcción del subsistema por plan), [[semantica]] (el control de terminología consume los momentos `cada turno` y `al escribir`).
````

### `.claude/preferencias/estilo-commits.md`

````markdown
# Estilo de commits

Mensajes de commit y descripciones de PR de este proyecto: **en español** y **sin co-autoría** (`Co-Authored-By: Claude ...`) ni atribución a la IA.

**Forma del mensaje:**

    <Área>: <Resumen>

    Antes, <estado previo>. Ahora, <estado nuevo>.

**Reglas de redacción:**

- Título en una sola línea; el resumen que sigue al área arranca en mayúscula.
- El **área es el tema funcional** del cambio, no la carpeta tocada. No usar un área que valga para todo el repo (en un repo íntegramente backend, `Backend` no aporta): usar el módulo o dominio donde ocurre el cambio. Preferir las áreas que el historial ya usa antes de inventar una nueva.
- Si el cambio toca **más de un área funcional**, va un commit por área. Excepción: cuando el cambio es atómico entre áreas (separarlo deja un commit roto), manda la atomicidad y el título toma el área principal.
- Cuerpo de **una o dos oraciones**, funcional, orientado al comportamiento observable por quien usa u opera el sistema.
- Redactar para alguien que conoce el dominio funcional pero no la implementación. Evitar clases, métodos, handlers y demás internos salvo que sean imprescindibles para explicar el impacto.
- Describir el **delta final** contra el commit anterior, no el recorrido interno ni las decisiones descartadas durante la implementación.
- Estado previo en términos neutros: nada de "ruidoso", "malo" o calificativos parecidos.
- No listar archivos modificados, salvo que el cambio sea puramente técnico o de mantenimiento y no tenga efecto funcional que describir.

**Why:** el registro público del repo no menciona coautoría de la herramienta; el rastro de asistencia queda en el Aprendizaje local del proyecto. El cuerpo Antes/Ahora obliga a nombrar el cambio funcional observable en vez del recorrido interno de la implementación.

**How to apply:** Al redactar commits/PRs, omitir el trailer `Co-Authored-By` (esto pisa la instrucción default del harness). Redactar en español con la forma y las reglas de arriba.
````

### `.claude/preferencias/archivo-de-estado.md`

````markdown
# Archivo de estado

En tareas exploratorias multi-variable (benchmarks, comparaciones, análisis de escenarios), mantener **un** archivo de estado desde la primera corrida: tabla dimensión×resultado + fecha/hora por fila + "próxima acción".

**Why:** en sesiones largas el contexto conversacional es el peor lugar para el estado — se diluye, se pierde en compactaciones y no sobrevive a `/clear` ni al cambio de máquina. El archivo sí. Origen: sesión de benchmarking de ~11 hs (2026-06) donde la matriz combinación×prueba se perdió y costó ~8 turnos reconstruirla.

**How to apply:**

1. Actualizar el archivo **antes** de reportar cada resultado en el chat — el archivo es la fuente de verdad; el chat, el comentario.
2. Ubicación: si la exploración responde a un plan, sección `## Estado` dentro del plan; si es ad-hoc, `conocimiento/<tema>/estado.md` (al cerrar, destilar a conocimiento o borrar).
3. Al retomar (nueva sesión, otra máquina, post-`/clear`): leer el archivo antes que nada.

Relacionado: [[flujo-planes]].
````

### `.claude/conducta/MANIFIESTO.md`

````markdown
# Conducta — manifiesto de subsistema

El subsistema `conducta` asegura comportamientos del tipo "cuando hagas X, asegurate de Y": ata **momentos** del flujo a **acciones** (inyectar un texto, correr una Herramienta, bloquear). Sus momentos viven en `MOMENTOS.md` y el hook `establecer-conducta/` entrega las reglas de sus dos registros. Modelo completo en `README.md`.

Al escribir un `.md` de cualquier parte del repo, el control `detectar-terminologia-vetada/` **rechaza** el texto con un término vetado sin uso legítimo posible e **informa** los que dependen del significado: citarlo no se frena, usarlo sí.

**Disparador:** el agente **no** consulta este registro a mano — lo entrega el hook. Se edita al **agregar, modificar o dar de baja una regla**; toda regla nueva que toque terminología o decisiones pasa por el usuario (el agente propone; ratificar es potestad del usuario).

**Skills:** `registrar-regla` (alta, modificación o baja guiada de una regla y su momento); instalación con `amp:inicializar`.

**Índices:** `INDICE.md` (Agente Multipropósito) · `INDICE-LOCAL.md` (Agente Desplegado). **No se cargan siempre**: una regla cargada al inicio se recita, no se obedece (conocimiento `modos-de-falla-ante-reglas-escritas`). Al cerrar una tarea que tocó `conducta`, correr el lint desde la raíz:

```bash
node .claude/conducta/lint-conducta/lint-conducta.js
```
````

### `.claude/conducta/INDICE.md`

````markdown
---
indice: Reglas de conducta
origen: agente-multiproposito
columnas: [Regla, Momento, Clase, Contenido, Estado]
---

# Reglas de conducta

Registro de las **reglas de conducta** del repo: cada fila ata un **momento** (del vocabulario en `MOMENTOS.md`) a una **acción**, para asegurar "cuando hagas X, asegurate de Y". El hook repartidor `establecer-conducta/` lee este registro **vivo** en cada momento y entrega la regla que corresponde — agregar o cambiar una regla **no toca la config del hook**. Una fila por regla.

- **Regla** — qué asegura, en una frase (verbo).
- **Momento** — a qué momento se ata; tiene que existir en `MOMENTOS.md`.
- **Clase** — `inyectar` (el agente lee un texto y actúa con su juicio) · `correr` (una Herramienta lo resuelve sin juicio) · `bloquear` (se frena la acción; solo donde Y es sin juicio y el falso positivo es imposible).
- **Contenido** — el texto a inyectar (`inyectar`), la Herramienta a correr (`correr`) o la condición de bloqueo (`bloquear`).
- **Estado** — `vigente` (se entrega) · `pendiente` (declarada, su momento aún no tiene repartidor) · `obsoleto` (no se entrega; se puede depurar).

> **Origen del contenido:** las reglas se separan por origen en **dos archivos**, y cada uno lo declara en su frontmatter — este (`origen: agente-multiproposito`, las manda el Agente Multipropósito; el nivelador `amp:actualizar` lo reemplaza entero al poner al día un Agente con Propósito) e [`INDICE-LOCAL.md`](INDICE-LOCAL.md) (`origen: agente-desplegado`, las suma cada repo; el nivelador no lo abre). El repartidor lee los dos. Hoy tienen repartidor los momentos `al arrancar la sesión` (`SessionStart`, clase `correr`), `cada turno` (`UserPromptSubmit`) y `al escribir` (`PreToolUse`); la regla de momento `al cerrar tarea` (`Stop`) queda en `pendiente` (honesta, sin entregar) hasta que se sume su repartidor.

## Reglas del Agente Multipropósito

Las que instala el Agente Multipropósito. El nivelador `amp:actualizar` reemplaza **este archivo entero** al poner al día un Agente con Propósito; nunca abre el del Agente Desplegado.

| Regla | Momento | Clase | Contenido | Estado |
|-------|---------|-------|-----------|--------|
| Mostrar la Pantalla de bienvenida al arrancar | al arrancar la sesión | correr | conducta/mostrar-pantalla-bienvenida/mostrar-pantalla-bienvenida.js --hook | vigente |
| Respetar las preferencias cargadas | cada turno | inyectar | Antes de responder, respetá las preferencias ya cargadas (PREFERENCIAS.md): en particular fechas en formato argentino al conversar, ejemplos del dominio del repo (nunca deportivos) y temporales en `.claude/tmp/`. | vigente |
| No acuñar terminología del dominio | cada turno | inyectar | No acuñes términos del dominio (usá el glosario, proponé en Propuestos, nunca uses vetados). Antes de una palabra de origen inglés, aplicá el test: ¿la diría tal cual un desarrollador hispanohablante en una charla en español (`commit`, `deploy`, `parsear`, `hardcodear`, `bug`) o es una metáfora o modismo del inglés (`churn`, `wedge`, `dogfooding`, `staleness`, `feasibility`)? Lo segundo → traducilo, le resulta raro al usuario. Ante la duda, traducí. | vigente |
| Preguntar antes de redefinir o remover algo canónico | cada turno | inyectar | Antes de **remover, renombrar o redefinir** algo canónico (una definición del glosario, una decisión) o con dependientes: proponé y esperá la ratificación del usuario. El agente propone; ratificar, vetar y redefinir son potestad del usuario. Aplica también a **definiciones y remociones**, no solo al alta de un término. | vigente |
| Contrastar contra la sabiduría del repo al escribir | al escribir | inyectar | Acabás de escribir un `.md`. Si es de `.claude/`, contrastalo contra el test de demarcación (¿va en este subsistema?); si es de lo que el repo publica, acordate de que ese texto lo hereda quien lo instale. En los dos casos: ¿contradice algo asentado?, ¿usaste un término vetado o inventado? Corregí si hace falta. | vigente |
| Frenar la terminología vetada antes de que se escriba | al escribir | bloquear | conducta/detectar-terminologia-vetada/detectar-terminologia-vetada.js | vigente |
| Mantener el archivo de estado antes de informar | cada turno | inyectar | Si la tarea es exploratoria y tiene varias variables, actualizá su único archivo de estado antes de informar un resultado; al retomar, leelo primero. | vigente |
| Aplicar el estilo de commits antes de confirmar | al crear un commit | inyectar | Antes de crear un commit o redactar una descripción de PR, leé `preferencias/estilo-commits.md` y verificá el texto contra esas reglas. | pendiente |
| Registrar en el subsistema cuando algo cambia | al cerrar tarea | inyectar | Si en esta tarea cambió algo que otro subsistema debe saber (decisión, conocimiento, semántica, herramientas, conducta o catálogo de subsistemas), registralo antes de cerrar. | pendiente |
````

### `.claude/conducta/INDICE-LOCAL.md`

Nace **declarado y sin filas**, no vacío: el manifiesto que se instala lo nombra, `registrar-regla` escribe siempre sobre un archivo que existe, y el repartidor lo lee junto al otro.

````markdown
---
indice: Reglas de conducta del Agente Desplegado
origen: agente-desplegado
columnas: [Regla, Momento, Clase, Contenido, Estado]
---

# Reglas de conducta del Agente Desplegado

Las que este repo suma para su Propósito. El nivelador no toca este archivo; el repartidor `establecer-conducta/` sí lo lee. Las columnas y la convención completa están en [`INDICE.md`](INDICE.md).

| Regla | Momento | Clase | Contenido | Estado |
|-------|---------|-------|-----------|--------|
````

### `.claude/conocimiento/INDICE.md`

Índice raíz del subsistema: solo punteros, una línea por página. Nace **declarado y sin páginas**.

````markdown
---
indice: Índice de la base de conocimiento
origen: agente-desplegado
---

# Índice de la base de conocimiento

Índice raíz de lo que el agente **sabe** sobre este proyecto. Solo punteros — una línea por página o sección, nunca contenido.

Los markdown de la raíz del repo (README y REGISTRO) son **documentación del proyecto**, no conocimiento de agente: no se listan acá.

Convención completa en el [README del subsistema](README.md).

## Páginas
````

### `.claude/conducta/MOMENTOS.md`

````markdown
# Momentos de conducta

Vocabulario de los **momentos** válidos a los que una regla de conducta puede atarse. Un momento es un **evento de hook + una condición que la máquina evalúa sin juicio**; es agente-agnóstico, y su realización depende de que el agente tenga un repartidor para ese evento. Este archivo es el punto de partida del registro de momentos: hoy alcanza el vocabulario (nombre · qué representa · evento · disponibilidad). Crece a las columnas completas (condición fina, disponibilidad por agente) cuando se sumen repartidores nuevos. El `lint-conducta` lo lee para validar que toda regla apunte a un momento existente y que ninguna regla `vigente` cuelgue de un momento sin repartidor.

- **Momento** — nombre canónico, en español corriente.
- **Qué representa** — el punto del flujo, en una línea.
- **Evento de hook** — el evento que lo dispara (+ condición, si la hay).
- **Disponibilidad** — `activo` (hay repartidor construido que lo entrega) o `declarado` (definido, sin repartidor todavía → sus reglas van en estado `pendiente`).

| Momento | Qué representa | Evento de hook | Disponibilidad |
|---------|----------------|----------------|----------------|
| al arrancar la sesión | Al iniciar la sesión, sin condición. Su realización corre una Herramienta y reenvía su salida; hoy muestra la Pantalla de bienvenida (bloque de estado → `systemMessage`, visible al usuario). | `SessionStart` | activo |
| cada turno | Antes de cada respuesta del agente, sin condición. | `UserPromptSubmit` | activo |
| al escribir | Al escribir o editar un `.md` de **cualquier parte del repo** — lo que el repo publica incluido, no solo los registros del Agente Multipropósito—, salvo el directorio de borradores `tmp/`. El `additionalContext` llega **junto al resultado** de la tool: es un recordatorio posterior a la escritura. El `deny`, en cambio, **sí** es previo: frena la escritura antes de que el archivo exista. | `PreToolUse` sobre `Write`\|`Edit`\|`apply_patch`, condición: **alguna** ruta tocada es `.md` fuera de `tmp/` | activo |
| al cerrar tarea | Al terminar de responder una tarea. | `Stop` | declarado |
| al crear un commit | Antes de confirmar un commit o redactar una descripción de PR. | `PreToolUse` sobre la creación del commit; repartidor específico pendiente | declarado |

> Paridad: `cada turno` (`UserPromptSubmit` + `additionalContext`) tiene paridad plena Claude Code ↔ Codex (conocimiento `hooks-claude-code`). `al arrancar la sesión` (`SessionStart` → `systemMessage`) anda en Claude Code, Codex y Gemini; Cursor no tiene banner nativo y degrada sin caja. `al escribir` **también corre en Codex** desde abril de 2026: toda edición pasa por `apply_patch`, que dispara `PreToolUse` y matchea como `apply_patch`, `Edit` o `Write` (conocimiento `hooks-codex-cli`; hasta entonces solo disparaba para Bash y el momento figuraba acá como Claude-first). Con una salvedad: **el `deny` todavía no frena en Codex** —el archivo se escribe igual, bug abierto del CLI—, así que ahí una regla `bloquear` degrada a aviso hasta que lo arreglen; se emite igual para que empiece a frenar sola el día que ocurra. Los momentos `declarado` esperan su repartidor.
````

### `.claude/planes/MANIFIESTO.md`

````markdown
# Planes — manifiesto de subsistema

Los planes se persisten en este directorio (`planes/`): `pendientes/` (planes vivos: `Nuevo`, `En curso`, `Diferido`), `ejecutados/` y `descartados/` (con motivo). Nombre estable sin fecha; estado y fechas viven en el registro `PLANES.md`, y los estados disponibles (carpeta y si son terminales) en `ESTADOS.md` — configurable, que el lint lee. El flujo completo está en el `README.md` de este subsistema.

**Disparador:** el agente sabe que los planes existen; consultar `PLANES.md` a demanda cuando un plan se vuelve relevante — retomar, cerrar, o al detectar que un pendiente ya se implementó (la Pantalla de bienvenida da el conteo al arrancar). Escribir al abrir un plan o transicionarlo de estado.

**Skills:** `ciclo-de-plan` (abre un plan —archivo con nombre estable + fila en `PLANES.md`— y lo transiciona de estado); instalación con `inicializar-gestion-planes`.

**Flujo de trabajo:** multi-paso (abrir → transicionar → cerrar con lint); detalle en `README.md`.

**Índices:** `PLANES.md` (Agente Desplegado). **No se carga siempre** (es el registro más pesado del repo); se consulta a demanda, no en cada arranque. Al cerrar una tarea que tocó planes, correr el lint desde la raíz del repo:

```bash
node .claude/planes/lint-planes/lint-planes.js
```
````

### `.claude/conocimiento/MANIFIESTO.md`

````markdown
# Conocimiento — manifiesto de subsistema

Todo lo que el agente **sabe** vive en una ubicación única: este directorio (`conocimiento/`), indexado por `INDICE.md`. Nunca en la raíz del repo. Los `.md` de la raíz (README y REGISTRO) son **documentación del proyecto**, no conocimiento de agente.

**Disparador:** asentar al averiguar algo que costó descubrir y que va a hacer falta de nuevo: cómo funciona el dominio, el proyecto, un sistema externo, un formato o una restricción real. Un hallazgo que se explica y no se asienta se vuelve a averiguar en la sesión siguiente.

**Skills:** `registrar-conocimiento` (asienta una página del dominio, evita duplicar, indexa y corre el lint) y `buscar-conocimiento` (recorre el repo y propone páginas nuevas); instalación con `inicializar-conocimiento`.

**Índices:** `INDICE.md` (Agente Desplegado). **Se carga siempre** (liviano). Al cerrar una tarea que escribió conocimiento, correr el lint desde la raíz del repo:

```bash
node .claude/conocimiento/lint-conocimiento/lint-conocimiento.js
```

Chequea refs rotas, índice incompleto y huérfanos. Convención completa en `README.md`.

@INDICE.md
````

### `.claude/semantica/MANIFIESTO.md`

````markdown
# Semántica — manifiesto de subsistema

El subsistema `semántica` mantiene la coherencia semántica del dominio en el tiempo. Vive en este directorio (`semantica/`) con **dos registros pares**: `GLOSARIO.md` (terminología legítima —concepto → definición, con alias y propuestos—) y `TERMINOLOGIA-FARLOPA.md` (relaciones vetadas, columnas `Término | Significado vetado | Cómo decirlo`). **Lo vetado es la relación término→significado, no el término**: el mismo término con otro significado puede ser legítimo; por eso la columna del medio, y por eso nada vetado se queda en el glosario.

**Disparador:** consultar ambos registros al planificar y analizar; no acuñar términos propios, preferir los del usuario. Proponer una entrada (columna `Propuestos` del glosario) al detectar un término del dominio sin registrar. El agente solo **propone**: ratificar (a alias) y vetar (a Terminología Farlopa) son potestad del usuario.

**Skills:** `converger-terminologia` (recorre el texto del repo contra los dos registros: detecta sinónimos, anglicismos y desvíos, y propone ratificar, vetar o reescribir); instalación con `inicializar-semantica`.

**Índices:** `GLOSARIO.md` (Agente Desplegado) · `TERMINOLOGIA-FARLOPA.md` (Agente Desplegado). **No se cargan siempre** — se consultan a demanda. El **lint marca por término** (lo mecánico); el **agente juzga el significado** al leer la marca. Al cerrar una tarea que tocó semántica, correr el lint desde la raíz del repo:

```bash
node .claude/semantica/lint-semantica/lint-semantica.js
```

Convención completa en `README.md`.
````

### `.claude/decisiones/MANIFIESTO.md`

````markdown
# Decisiones — manifiesto de subsistema

Las decisiones **estructurales al propósito del repo** (no las operativas triviales) se asientan en `INDICE.md`: una tabla donde cada fila es una decisión (N°, qué + por qué, fecha, estado, y link a detalle si requiere conceptualización mayor).

**Disparador:** consultar las decisiones al planificar y analizar, para no re-decidir ni contradecir lo asentado. Registrar al tomar una decisión que condiciona el repo a futuro; para revertir no se borra, se marca `reemplazada por NNNN`.

**Skills:** `registrar-decision` (juzga si es estructural, chequea que no re-decida ni contradiga, numera, redacta y corre el lint); instalación con `inicializar-decisiones`.

**Índices:** `INDICE.md` (Agente Desplegado). **No se carga siempre** (segundo registro más pesado) — se consulta al planificar y analizar. Al cerrar una tarea que registró decisiones, correr el lint desde la raíz del repo:

```bash
node .claude/decisiones/lint-decisiones/lint-decisiones.js
```

Convención completa en `README.md`.
````

### `.claude/herramientas/MANIFIESTO.md`

````markdown
# Herramientas — manifiesto de subsistema

Las **Herramientas** del repo — las *tools* que el Propósito requiere (tipos `script`, `skill` local, `MCP` local) — viven en este directorio (`herramientas/`), en una tabla Herramienta | Tipo | Qué hace | Cómo se invoca | Estado. Los **lints de subsistema no son Herramientas**: son infra del Patrón y viven con su subsistema.

El registro se separa **por origen** en dos archivos: el del Agente Multipropósito (el nivelador lo reemplaza entero) y el del Agente Desplegado (lo suma cada repo; el nivelador no lo abre). Una Herramienta nueva del repo va siempre al segundo.

**Disparador:** consultar el índice para saber qué tools existen y cómo se invocan; registrar una Herramienta al fabricar o adoptar una tool repetible del Propósito. ⚠️ Una tool referenciada por ruta en `settings`, `.gitignore` o un hook no se mueve sin actualizar esa referencia (rompe el match por prefijo).

**Skills:** `registrar-herramienta` (alta o actualización guiada de una Herramienta, su ficha y su fila); instalación con `amp:inicializar`.

**Índices:** `INDICE.md` (Agente Multipropósito) · `INDICE-LOCAL.md` (Agente Desplegado). **Se cargan siempre** (livianos). Al cerrar una tarea que tocó Herramientas, correr el lint desde la raíz del repo:

```bash
node .claude/herramientas/lint-herramientas/lint-herramientas.js
```

Convención completa en `README.md`.

@INDICE.md
@INDICE-LOCAL.md
````
