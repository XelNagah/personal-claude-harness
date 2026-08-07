#!/usr/bin/env node
// Lint del ciclo de planes: carpeta<->registro, sueltos, resueltos sin mover, cierres a medias, activos envejecidos. Sin LLM, sin red.
// Estados y su mapeo (carpeta, terminal) se leen de ESTADOS.md: fuente de verdad configurable, no hardcodeada.
// Uso: node lint-planes.js [<carpeta>] [--quiet] [--dias N]   (default: .claude/planes, N=30)
const fs = require('fs'), path = require('path');

const { indicesDe, problemasDeIndices } = require('../../common/indices.js');
const args = process.argv.slice(2);
const quiet = args.includes('--quiet');
const diasIdx = args.indexOf('--dias');
const MAX_DIAS = diasIdx >= 0 ? parseInt(args[diasIdx + 1], 10) : 30;
const root = path.resolve(args.find(a => !a.startsWith('--') && !/^\d+$/.test(a)) || '.claude/planes');

// Estado(s) cuya antiguedad se vigila: un plan que se esta ejecutando (En curso) o que quedo
// interrumpido con intencion de retomar (En pausa) hace demasiado es un zombi que dice avanzar
// mientras espera. Diferido NO se vigila: posponer a proposito es legitimo y puede durar. Si se
// renombra un estado en ESTADOS.md, ajustar esta lista (en minusculas).
const VIGILAR_ANTIGUEDAD = ['en curso', 'en pausa'];

// --- estados: nombre -> {nombre, carpeta, terminal} ---
// Se leen de DOS archivos: `ESTADOS.md` (lo manda el Agente Multiproposito y el actualizador lo
// reemplaza entero) y `ESTADOS-LOCAL.md` (los estados que suma el Proposito de cada repo, que
// el actualizador no abre). El del Agente Desplegado es OPCIONAL —la mayoria de los repos no suma
// estados— y su ausencia no es un hallazgo. Mismo molde que los momentos en `lint-conducta`.
const estPath = path.join(root, 'ESTADOS.md');
const estLocalPath = path.join(root, 'ESTADOS-LOCAL.md');
const estados = new Map();
const estadoRepetido = [];
function leerEstados(archivo, esLocal) {
  if (!fs.existsSync(archivo)) return;
  for (const line of fs.readFileSync(archivo, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t.startsWith('|')) continue;
    const cells = t.split('|').slice(1, -1).map(c => c.trim());
    if (cells.length < 4) continue;
    const nombre = cells[0];
    const c0 = nombre.replace(/[*\s]/g, '');
    if (/^:?-{2,}:?$/.test(c0) || /^estado$/i.test(c0)) continue;
    const clave = nombre.toLowerCase();
    // El del Agente Multiproposito manda: repetirlo abajo lo pisaria en silencio, con otra
    // carpeta o distinta terminalidad, y los planes que lo usan cambiarian de lugar solos.
    if (esLocal && estados.has(clave)) { estadoRepetido.push(nombre); continue; }
    const carpeta = cells[2].replace(/[`/\\]/g, '').trim();
    const terminal = /^s[ií]$/i.test(cells[3].trim());
    estados.set(clave, { nombre, carpeta, terminal, esLocal });
  }
}
leerEstados(estPath, false);
leerEstados(estLocalPath, true);

// --- grafo de transiciones: tabla | Desde | Hacia | de ESTADOS.md ---------------------------
// La transicion es un EVENTO y el lint solo ve el estado ACTUAL, asi que no puede cazar una
// transicion ilegal ya hecha: cuando corre, el plan ya esta en su estado nuevo y no queda rastro
// de por donde paso. Lo que SI controla es que el GRAFO este bien formado. La tabla es la fuente
// unica que declara los destinos validos de cada estado —antes eso vivia como texto plano en tres
// lugares que podian divergir—, y de sus ENTRADAS a "En pausa" se derivan los valores validos de
// estado_a_retomar (ver mas abajo por que de las entradas y no de la fila "En pausa").
const sinAcento = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
function leerTransiciones(archivo) {
  const t = new Map();
  if (!fs.existsSync(archivo)) return t;
  let enTabla = false;
  for (const line of fs.readFileSync(archivo, 'utf8').split('\n')) {
    const s = line.trim();
    if (!s.startsWith('|')) { enTabla = false; continue; }
    const c = s.split('|').slice(1, -1).map(x => x.trim());
    if (c.length < 2) continue;
    const c0 = c[0].replace(/[*`\s]/g, '').toLowerCase();
    if (c0 === 'desde') { enTabla = true; continue; }   // encabezado de la tabla de transiciones
    if (/^:?-{2,}:?$/.test(c0)) continue;                // separador
    if (!enTabla) continue;                              // otras tablas (la de estados) no cuentan
    const desde = c[0].replace(/[`*]/g, '').trim().toLowerCase();
    const hRaw = c[1].replace(/[`*]/g, '').trim();
    const hacia = (!hRaw || hRaw === '—' || hRaw === '-') ? []
      : hRaw.split(',').map(x => x.trim().toLowerCase()).filter(Boolean);
    t.set(desde, hacia);
  }
  return t;
}
const transiciones = leerTransiciones(estPath);
const grafoMal = [];
if (transiciones.size) {
  // (a) cada estado de la Base tiene su fila; un estado propio del repo (ESTADOS-LOCAL) queda exento.
  for (const [clave, e] of estados) {
    if (!e.esLocal && !transiciones.has(clave)) grafoMal.push(`estado "${e.nombre}" sin fila en la tabla de transiciones`);
  }
  // (b) cada Desde es un estado; (c) terminal <=> sin salidas; (d) cada destino es un estado.
  for (const [desde, hacia] of transiciones) {
    const e = estados.get(desde);
    if (!e) { grafoMal.push(`transición desde "${desde}", que no es un estado de ESTADOS.md`); continue; }
    if (e.terminal && hacia.length) grafoMal.push(`"${e.nombre}" es terminal pero declara salidas (${hacia.join(', ')})`);
    if (!e.terminal && !hacia.length) grafoMal.push(`"${e.nombre}" no es terminal pero no declara ninguna salida`);
    for (const h of hacia) if (!estados.has(h)) grafoMal.push(`"${e.nombre}" transiciona a "${h}", que no es un estado`);
  }
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
// | Creado | Cerrado | Origen | Notas |— mientras haya Agentes Desplegados sin actualizar.
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
  // La forma <ruta> de CommonMark (rutas con espacios o parentesis) se prueba primero: el patron
  // sin angulos la captura con los angulos adentro y ademas trunca en el primer `)` de la ruta.
  // CommonMark permite espacios entre `(` y `<` (y antes del `)`): sin \s* esa forma caeria a la
  // regex simple y devolveria la ruta con los angulos pegados, un ref que nunca matchea en silencio.
  const m = /\]\(\s*<([^>]+)>\s*\)/.exec(celda) || /\]\(([^)]+?)\)/.exec(celda);
  const cruda = (m ? m[1] : celda.replace(/[`\[\]<>]/g, '')).trim();
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
                   && !['PLANES.md', 'ESTADOS.md', 'ESTADOS-LOCAL.md', 'MANIFIESTO.md', 'README.md'].includes(e.name)).map(e => e.name)
  : [];

const norm = r => r.replace(/\\/g, '/').replace(/^\.\//, '');
const refs = new Set(rows.map(r => norm(r.ref)));
const sinFila = [...enDisco.keys()].filter(k => !refs.has(k));
const colgadas = [], estadoInvalido = [], estadoCarpeta = [], cierreAMedias = [], sinMotivo = [];
for (const r of rows) {
  const rel = norm(r.ref), carpeta = enDisco.get(rel);
  if (!estados.size) break;                       // sin ningun archivo de estados no se valida
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

// contenido: pendientes con marcador de resolucion; ejecutados sin notas de implementacion;
// coherencia de estado_a_retomar: SOLO "En pausa" lo lleva, con valor Analisis o En curso, y
// vive en el archivo del plan (no en PLANES.md). Un plan pausado sin el dato no sabe a donde
// volver; el dato en cualquier otro estado sobra. La ausencia del control dejaba el "obligatorio"
// de ESTADOS.md sin nadie que lo controlara (conocimiento controles-que-no-avisan).
const estadoDe = new Map(rows.map(r => [norm(r.ref), r.estado]));
const reRetomar = /(?:^|\n)[ \t>*]*estado_a_retomar\**\s*[:：]\s*\**\s*([^\n*]+)/i;
// Los valores validos de estado_a_retomar son los ORIGENES de "En pausa" —los estados que la
// declaran entre sus destinos—, no los destinos de su fila. Retomar es deshacer la pausa, asi que
// el destino de retomada es por definicion el origen de la pausa. Derivarlo de la fila "En pausa"
// era correcto solo mientras esa fila no tuviera salidas de cierre; desde que las tiene, ese camino
// daba por valido un estado_a_retomar="Descartado" y NO lo avisaba, porque para el lint era un
// valor declarado (conocimiento controles-que-no-avisan).
const origenesDeEnPausa = [...transiciones].filter(([, hacia]) => hacia.includes('en pausa')).map(([desde]) => desde);
const VALIDOS_RETOMAR = new Set((origenesDeEnPausa.length ? origenesDeEnPausa : ['análisis', 'en curso']).map(sinAcento));
const resueltosSinMover = [], ejecSinNotas = [], retomarFaltante = [], retomarSobrante = [];
for (const [rel, carpeta] of enDisco) {
  const txt = fs.readFileSync(path.join(root, rel), 'utf8');
  if (carpeta === 'pendientes' && (/\bRESUELTO\b/.test(txt) || tieneNotasDeImplementacion(txt))) resueltosSinMover.push(rel);
  if (carpeta === 'ejecutados' && !tieneNotasDeImplementacion(txt)) ejecSinNotas.push(rel);
  const est = estadoDe.get(norm(rel));
  const mRet = reRetomar.exec(txt);
  if (est === 'en pausa') {
    const val = mRet ? sinAcento(mRet[1].replace(/[`*.]/g, '').trim().toLowerCase()) : null;
    if (!val) retomarFaltante.push(`${rel}  [falta estado_a_retomar]`);
    else if (!VALIDOS_RETOMAR.has(val)) retomarFaltante.push(`${rel}  estado_a_retomar="${mRet[1].trim()}" (solo Análisis o En curso)`);
  } else if (est && mRet) {
    retomarSobrante.push(`${rel}  estado="${est}" no debe llevar estado_a_retomar`);
  }
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
  ['ESTADO REPETIDO EN ESTADOS-LOCAL.md (el del Agente Multiproposito manda)', estadoRepetido],
  ['GRAFO DE TRANSICIONES MAL FORMADO (ESTADOS.md)', grafoMal],
  ['SUELTOS EN LA RAIZ (mover a una carpeta del ciclo)', sueltos],
  ['ARCHIVOS SIN FILA EN PLANES.md', sinFila],
  ['FILAS COLGADAS (archivo no existe)', colgadas],
  ['ESTADO INVALIDO (no esta en ESTADOS.md)', estadoInvalido.map(([r, e]) => `${r}  estado="${e}"`)],
  ['ESTADO vs CARPETA INCONSISTENTE', estadoCarpeta.map(([r, e, c, esp]) => `${r}  estado="${e}" en ${c}/ (deberia ir en ${esp}/)`)],
  ['EN PAUSA SIN estado_a_retomar VALIDO', retomarFaltante],
  ['estado_a_retomar EN UN ESTADO QUE NO ES EN PAUSA', retomarSobrante],
  ['PENDIENTES CON MARCADOR DE RESUELTO (¿mover a ejecutados?)', resueltosSinMover],
  ['CIERRES A MEDIAS', cierreAMedias.map(([r, w]) => `${r}  [${w}]`)],
  ['DESCARTADOS SIN MOTIVO', sinMotivo],
  ['EJECUTADOS SIN SECCIÓN DE IMPLEMENTACIÓN', ejecSinNotas],
  [`ACTIVOS ENVEJECIDOS (> ${MAX_DIAS} dias activo o en pausa: ¿sigue/retomar/diferido/descartado?)`, viejos.map(([r, d]) => `${r}  (${d} dias)`)],
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
