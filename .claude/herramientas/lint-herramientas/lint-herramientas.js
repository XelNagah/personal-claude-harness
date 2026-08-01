#!/usr/bin/env node
// Lint del registro de Herramientas: README por herramienta con carpeta local, herramienta en indice,
// filas colgadas (link a subdir local inexistente), refs por ruta de lint en settings. Sin LLM, sin red.
// Uso: node lint-herramientas.js [<carpeta herramientas>]   (default: .claude/herramientas)
const fs = require('fs'), path = require('path');

const { indicesDe, problemasDeIndices } = require('../../common/indices.js');
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

// [3] el nucleo de cada fila y los links que apuntan a un subdir LOCAL inexistente
//     (se saltan links externos: ../skills/, .mcp.json, etc. — esos no viven bajo herramientas/)
// Cada dato se ubica por el NOMBRE de su columna, no por su posicion: con el nucleo la primera
// celda es el Codigo y la carpeta se mudo a `Detalle`, asi que buscar el link en la celda inicial
// no encontraba ninguno y el chequeo salia limpio sin validar una sola fila.
// Y las celdas se separan RESPETANDO las tuberias escapadas (`\|`), que si no corren las columnas.
function celdasDe(linea) {
  return linea.trim().replace(/^\|/, '').replace(/\|$/, '')
    .split(/(?<!\\)\|/).map(c => c.replace(/\\\|/g, '|').trim());
}
function filasDe(texto) {
  const lineas = texto.split(/\r?\n/).map(l => l.trim()).filter(l => l.startsWith('|'));
  if (lineas.length < 2) return [];
  const cab = celdasDe(lineas[0]).map(c => c.replace(/\*/g, '').trim());
  const out = [];
  for (const l of lineas.slice(1)) {
    const c = celdasDe(l);
    if (/^:?-{2,}:?$/.test((c[0] || '').replace(/\s/g, ''))) continue;
    const fila = {};
    cab.forEach((n, k) => { fila[n] = c[k] !== undefined ? c[k] : ''; });
    out.push(fila);
  }
  return out;
}

// El prefijo del codigo es el origen: un `Local-` en el Indice del Agente Multiproposito significa
// que la fila se escribio en el archivo equivocado.
const PREFIJO = { 'agente-multiproposito': 'Base', 'agente-desplegado': 'Local' };
const colgadas = [], problemasNucleo = [];
const codigosVistos = new Set();
for (const i of indices) {
  const esperado = PREFIJO[i.origen];
  const nombresVistos = new Set();
  for (const f of filasDe(i.texto)) {
    const cod = f['Código'] || '', nombre = f['Nombre'] || '';
    if (esperado) {
      if (!new RegExp(`^${esperado}-\\d{4}$`).test(cod))
        problemasNucleo.push(`${i.nombre}: codigo "${cod}" no tiene la forma ${esperado}-NNNN que pide su origen`);
      else if (codigosVistos.has(cod)) problemasNucleo.push(`${i.nombre}: codigo duplicado ${cod}`);
      else codigosVistos.add(cod);
    }
    if (!nombre) problemasNucleo.push(`${i.nombre}: la fila ${cod || '(sin codigo)'} no tiene Nombre`);
    else if (nombresVistos.has(nombre.toLowerCase())) problemasNucleo.push(`${i.nombre}: nombre duplicado "${nombre}"`);
    else nombresVistos.add(nombre.toLowerCase());
    if (!(f['Descripción'] || '').trim()) problemasNucleo.push(`${i.nombre}: ${cod} no tiene Descripción`);

    const m = /\]\(([^)]+?)\)/.exec(f['Detalle'] || '');
    if (!m) continue;                                             // fila sin link -> no se valida ruta
    const target = m[1].trim();
    if (target.startsWith('..') || target.includes('.json') || /^\w+:/.test(target)) continue; // externo
    const name = target.replace(/\/$/, '').replace(/[`]/g, '').trim();
    if (name && !fs.existsSync(path.join(root, name))) colgadas.push(name);
  }
}
problemasIndices.push(...problemasNucleo);

// [4] refs por ruta a lints en settings que no resuelven (cualquier .claude/**/*.js|sh|...)
// El repo se deriva de `root` —la carpeta del subsistema que se esta mirando—, NUNCA de la ubicacion
// de este script. En cuanto hay una segunda copia (un plugin instalado, un marketplace bajado, otro
// repo con el harness) deducirlo desde __dirname describe el repo equivocado, y no falla: contesta.
// Derivandolo de `root`, la carpeta que se lee y el repo que se barre salen de la misma fuente y no
// pueden divergir. Conocimiento `el-repo-que-un-script-describe`.
function repoDe(carpetaSubsistema) {
  let d = path.resolve(carpetaSubsistema);
  for (;;) {
    if (fs.existsSync(path.join(d, '.claude'))) return d;
    const padre = path.dirname(d);
    if (padre === d) return path.resolve(carpetaSubsistema, '..', '..');   // sin `.claude` arriba
    d = padre;
  }
}
const repoRoot = repoDe(root);
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
