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

// -- filas de la tabla, leidas por NOMBRE de columna ------------------------
// Con el nucleo del Indice la tabla es | Codigo | Nombre | Descripcion | Estado | Fecha de
// creacion | Fecha de cierre | Origen | Detalle |, y la ruta del plan vive en Detalle, no en la
// primera celda. Leer por posicion dejaba el registro leyendo el Codigo como si fuera el link:
// 81 archivos "sin fila" y la tabla entera invalidada. Se acepta la forma vieja —| Plan | Estado
// | Creado | Cerrado | Origen | Notas |— mientras haya Agentes Desplegados sin nivelar.
// Y las celdas se separan RESPETANDO las tuberias escapadas (`\|`), que de otro modo corren
// todas las columnas siguientes.
function celdasDe(linea) {
  return linea.trim().replace(/^\|/, '').replace(/\|$/, '')
    .split(/(?<!\\)\|/).map(c => c.replace(/\\\|/g, '|').trim());
}
// El link puede venir con la ruta escapada (`%20`) o con espacios crudos; el disco siempre tiene
// el nombre real. Un `%` suelto en el nombre de un plan hace que decodificar TIRE, asi que el
// fallo se contiene: sin esto, un solo plan con `%` en el nombre voltea el lint entero.
function rutaDeLink(celda) {
  const m = /\]\(([^)]+?)\)/.exec(celda);
  const cruda = (m ? m[1] : celda.replace(/[`\[\]]/g, '')).trim();
  try { return decodeURIComponent(cruda); } catch (e) { return cruda; }
}
// Se parsea CADA Indice por separado, no el texto de todos concatenado: cada uno declara sus
// propias columnas, asi que compartir el encabezado leeria el segundo con el mapa del primero
// —columnas corridas, en silencio— y ademas contaria su fila de encabezado como un plan mas.
const rows = [];
const sinNucleo = [];
let algunaCabecera = false;
for (const indice of (indices.length ? indices : [{ nombre: 'PLANES.md', texto: reg }])) {
  let cab = null;
  for (const line of indice.texto.split('\n')) {
    const t = line.trim();
    if (!t.startsWith('|')) continue;
    const c = celdasDe(t);
    if (!cab) {
      const n = c.map(x => x.replace(/\*/g, '').trim().toLowerCase());
      const idx = (...nombres) => { for (const x of nombres) { const i = n.indexOf(x); if (i >= 0) return i; } return -1; };
      if (n.includes('código') || n.includes('plan')) {
        algunaCabecera = true;
        cab = { codigo: idx('código'), nombre: idx('nombre'), descripcion: idx('descripción'),
                estado: idx('estado'), creado: idx('fecha de creación', 'creado'),
                cerrado: idx('fecha de cierre', 'cerrado'), origen: idx('origen'),
                detalle: idx('detalle', 'plan'), notas: idx('notas') };
      }
      continue;
    }
    if (/^:?-{2,}:?$/.test((c[0] || '').replace(/[*\s]/g, ''))) continue;   // separador |---|
    const val = i => (i >= 0 && i < c.length ? c[i] : '');
    const ref = rutaDeLink(val(cab.detalle));
    const codigo = val(cab.codigo).replace(/[*\s]/g, '');
    // Una fila sin ruta no se puede cruzar contra el disco. Se reporta en vez de descartarla:
    // descartarla la saca tambien de los controles del nucleo y la fila desaparece sin señal.
    if (!ref) { sinNucleo.push(`${codigo || '(sin código)'}  sin Detalle: la fila no apunta a ningun archivo`); continue; }
    rows.push({ indice: indice.nombre, conNucleo: cab.codigo >= 0,
                ref, codigo, nombre: val(cab.nombre), descripcion: val(cab.descripcion),
                estado: val(cab.estado).toLowerCase(), creado: val(cab.creado),
                cerrado: val(cab.cerrado), origen: val(cab.origen),
                notas: cab.notas >= 0 ? val(cab.notas) : null });
  }
}
if (!algunaCabecera) console.error('[!] no se encontro el encabezado de la tabla (columna Código o Plan)');

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
  // Motivo obligatorio en la carpeta de descarte (convencion de carpetas del harness). Con el
  // nucleo la columna Notas desaparece y el motivo vive en el archivo del plan, que es su
  // Detalle: se exige la seccion de notas de cierre. En la forma vieja se sigue exigiendo la celda.
  if (carpeta === 'descartados') {
    if (r.notas !== null) {
      if (!r.notas || r.notas === '—' || r.notas === '-') sinMotivo.push(rel);
    } else {
      let cuerpo = ''; try { cuerpo = fs.readFileSync(path.join(root, rel), 'utf8'); } catch (e) {}
      if (!/^#{1,6}\s+Notas\s+de\s+cierre\b/im.test(cuerpo)) sinMotivo.push(`${rel}  [sin sección "## Notas de cierre"]`);
    }
  }
}
// filas colgadas (archivo no existe) para estados validos que no aparecieron en disco
for (const r of rows) {
  const rel = norm(r.ref);
  if (estados.size && estados.has(r.estado) && !enDisco.has(rel) && !colgadas.includes(rel)) colgadas.push(rel);
}

// -- controles del nucleo del Indice ---------------------------------------
// Solo corren si la tabla declara el nucleo. El codigo lleva el prefijo del origen declarado en
// el frontmatter, se asigna como maximo + 1 y no se reusa: por eso se controlan formato, prefijo
// y repeticion, pero NO los huecos —retirar un plan deja uno y nadie vuelve a ocuparlo—.
const PREFIJO_DE_ORIGEN = { 'agente-multiproposito': 'Base', 'agente-desplegado': 'Local' };
const nucleoMal = sinNucleo;
// El codigo y el orden son de CADA Indice: dos Indices del mismo subsistema numeran por separado,
// asi que unicidad y orden se validan por archivo y no sobre la mezcla.
for (const indice of new Set(rows.filter(r => r.conNucleo).map(r => r.indice))) {
  const filas = rows.filter(r => r.indice === indice);
  const vistosCod = new Set(), vistosNom = new Set();
  const declarado = indices.find(i => i.nombre === indice) || {};
  const esperado = PREFIJO_DE_ORIGEN[declarado.origen];
  let previo = null;
  for (const r of filas) {
    const m = /^(Base|Local)-(\d{4})$/.exec(r.codigo);
    if (!m) { nucleoMal.push(`${indice}: ${r.ref}  codigo "${r.codigo}" mal formado (esperado Base-NNNN o Local-NNNN)`); continue; }
    if (esperado && m[1] !== esperado) nucleoMal.push(`${indice}: ${r.codigo}  prefijo "${m[1]}" no corresponde al origen "${declarado.origen}" (esperado ${esperado})`);
    if (vistosCod.has(r.codigo)) nucleoMal.push(`${indice}: ${r.codigo}  codigo repetido`);
    vistosCod.add(r.codigo);
    if (!r.nombre) nucleoMal.push(`${indice}: ${r.codigo}  sin Nombre`);
    else if (vistosNom.has(r.nombre.toLowerCase())) nucleoMal.push(`${indice}: ${r.codigo}  Nombre duplicado "${r.nombre}"`);
    else vistosNom.add(r.nombre.toLowerCase());
    if (!r.descripcion || r.descripcion === '—') nucleoMal.push(`${indice}: ${r.codigo}  sin Descripción`);
    // Las filas van en orden ascendente por Codigo. Se comparan solo las bien formadas: un codigo
    // roto ya tiene su hallazgo y contarlo como 0 arrastraria un segundo hallazgo prestado.
    const n = parseInt(m[2], 10);
    if (previo !== null && n <= previo.n) nucleoMal.push(`${indice}: filas fuera de orden ascendente por Código — ${previo.codigo} antes de ${r.codigo}`);
    previo = { n, codigo: r.codigo };
  }
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
  ['NUCLEO DEL INDICE (código, Nombre, Descripción, orden)', nucleoMal],
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
