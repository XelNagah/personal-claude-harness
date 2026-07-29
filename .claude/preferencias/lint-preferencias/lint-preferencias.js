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
