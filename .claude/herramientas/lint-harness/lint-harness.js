#!/usr/bin/env node
// Lint de coherencia del harness: punto de entrada (AGENTS.md + adaptador CLAUDE.md, decision 0010),
// funcionalidades vs marketplace vs REGISTRO, archivos clave por funcionalidad, divergencia de bloques textuales entre PLANTILLAs,
// tamaño de los MANIFIESTO.md de subsistema (dec. 0017: breves, siempre en contexto) y su estructura
// minima (dec. 0019 + 0023: campos obligatorios incl. Skills + coherencia carga<->@INDICE), citas a
// decisiones del harness en archivos distribuibles (dec. 0024) y terminologia vetada en el texto que
// viaja (funcionalidades/: lo que se escribe en cada Agente con Propósito). Sin LLM, sin red.
// Uso: node lint-harness.js [--quiet]   (correr desde la raiz del repo del harness)
const fs = require('fs'), path = require('path'), os = require('os'), crypto = require('crypto');
const quiet = process.argv.includes('--quiet');
const repo = process.cwd();
const funcDir = path.join(repo, 'funcionalidades');

// -- inventarios ---------------------------------------------------------
const enDisco = fs.existsSync(funcDir)
  ? fs.readdirSync(funcDir, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name)
  : [];

let plugins = [];
try {
  const mp = JSON.parse(fs.readFileSync(path.join(repo, '.claude-plugin', 'marketplace.json'), 'utf8'));
  plugins = (mp.plugins || []).map(p => ({ name: p.name, source: p.source }));
} catch (e) { /* reportado abajo como faltante */ }

const registro = fs.existsSync(path.join(repo, 'REGISTRO.md')) ? fs.readFileSync(path.join(repo, 'REGISTRO.md'), 'utf8') : '';
// filas en negrita de la tabla de catalogo: | **nombre** | ...
const enRegistro = [...registro.matchAll(/^\|\s*\*\*([\w-]+)\*\*\s*\|/gm)].map(m => m[1]);

// -- [1] disco vs marketplace vs REGISTRO --------------------------------
const setDisco = new Set(enDisco), setMp = new Set(plugins.map(p => p.name)), setReg = new Set(enRegistro);
const soloDisco = enDisco.filter(f => !setMp.has(f) || !setReg.has(f))
  .map(f => `${f}  [${!setMp.has(f) ? 'falta en marketplace' : ''}${!setMp.has(f) && !setReg.has(f) ? ' + ' : ''}${!setReg.has(f) ? 'falta en REGISTRO' : ''}]`);
const fantasmas = [...new Set([...setMp, ...setReg])].filter(n => !setDisco.has(n))
  .map(n => `${n}  [en ${setMp.has(n) ? 'marketplace' : 'REGISTRO'} pero no en funcionalidades/]`);
const srcRotos = plugins.filter(p => !fs.existsSync(path.join(repo, p.source))).map(p => `${p.name} -> ${p.source}`);

// -- [2] archivos clave por funcionalidad --------------------------------
const incompletas = [];
for (const f of enDisco) {
  const base = path.join(funcDir, f);
  const faltan = [];
  for (const req of ['README.md', '.claude-plugin/plugin.json']) {
    if (!fs.existsSync(path.join(base, req))) faltan.push(req);
  }
  const skillsDir = path.join(base, 'skills');
  const skills = fs.existsSync(skillsDir) ? fs.readdirSync(skillsDir).filter(s => fs.existsSync(path.join(skillsDir, s, 'SKILL.md'))) : [];
  if (!skills.length) faltan.push('skills/<skill>/SKILL.md');
  if (faltan.length) incompletas.push(`${f}/  [faltan: ${faltan.join(', ')}]`);
}

// nombre del marketplace que publica este repo (para no mirar plugins de otros)
let mktName = '';
try { mktName = JSON.parse(fs.readFileSync(path.join(repo, '.claude-plugin', 'marketplace.json'), 'utf8')).name || ''; } catch (e) { /* ya reportado */ }

// que plugins de ESTE marketplace estan instalados para ESTE repo. El registro guarda una
// entrada por projectPath: dos repos de la misma maquina pueden correr versiones distintas.
const instalados = new Map(); // nombre de plugin -> version instalada
try {
  const reg = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.claude', 'plugins', 'installed_plugins.json'), 'utf8'));
  for (const [id, entradas] of Object.entries(reg.plugins || {})) {
    const corte = id.lastIndexOf('@');
    if (corte < 0 || id.slice(corte + 1) !== mktName) continue;
    const propia = (entradas || []).find(e => e.projectPath && path.resolve(e.projectPath) === path.resolve(repo))
                || (entradas || []).find(e => e.scope === 'user');
    if (propia) instalados.set(id.slice(0, corte), propia.version);
  }
} catch (e) { /* sin registro: se trata como "no instalado" */ }

// -- [3] version en disco vs version instalada ---------------------------
// Es el desfase que
// paso en silencio el 25/07/2026 (disco 0.6.3, corriendo 0.6.2, seis commits atras): la
// version que corre es la carpeta de la cache, la de disco es el campo version del plugin.json.
// Lo "traido pero no cargado" (la sesion arranco antes) no se mira aca: lo cubre la Herramienta
// actualizar-plugins, que compara contra la hora de arranque del proceso de la sesion.
const versionDesfasada = [];
for (const f of enDisco) {
  const instalada = instalados.get(f);
  if (!instalada) continue; // no instalado para este repo: lo diagnostica actualizar-plugins
  let enDiscoVer = '';
  try { enDiscoVer = JSON.parse(fs.readFileSync(path.join(funcDir, f, '.claude-plugin', 'plugin.json'), 'utf8')).version || ''; } catch (e) { continue; }
  if (!enDiscoVer) continue; // sin version fija: auto-versiona por commit, no hay resta que hacer
  if (enDiscoVer !== instalada) versionDesfasada.push(`${f}: disco ${enDiscoVer}, instalado ${instalada}  (publicar y actualizar, o se consume una version vieja)`);
}

// -- [5] punto de entrada (AGENTS.md fuente + CLAUDE.md adaptador) -------
const entrada = [];
const agentsMd = path.join(repo, 'AGENTS.md');
const claudeMdRoot = path.join(repo, 'CLAUDE.md');
if (!fs.existsSync(agentsMd)) entrada.push('falta AGENTS.md en la raiz (fuente unica de instrucciones)');
if (!fs.existsSync(claudeMdRoot)) entrada.push('falta CLAUDE.md en la raiz (adaptador para Claude Code)');
else if (!/@AGENTS\.md/.test(fs.readFileSync(claudeMdRoot, 'utf8'))) entrada.push('CLAUDE.md no importa @AGENTS.md (adaptador roto)');
if (fs.existsSync(path.join(repo, '.claude', 'CLAUDE.md'))) entrada.push('.claude/CLAUDE.md residual (el contenido vive en AGENTS.md; genera doble carga)');

// -- [4] divergencia de bloques verbatim entre PLANTILLAs ----------------
// Compara los bloques ```markdown que definen una memoria (---\nname: X) entre las PLANTILLA.md
// de cada funcionalidad y la del orquestador setup-completo (ambas usan .claude literal).
// Ademas de las memorias, se comparan los FRAGMENTOS de codigo que deben viajar identicos en
// todos los lints (no el lint entero: cada subsistema tiene el suyo, pero comparten fragmentos).
// Se identifican por su comentario ancla. Los fragmentos NO se normalizan como las memorias:
// deben coincidir caracter a caracter (solo se unifica el fin de linea).
// Son tres fragmentos con alcance distinto: la raiz del repo la usan los 5 lints; la resolucion de
// refs solo los 4 que validan links .md (lint-herramientas valida rutas en settings, no refs);
// la atribucion por ancestro solo los 2 que recorren subarbol (lint-conocimiento y lint-memoria).
const FRAGMENTOS = [
  { nombre: 'raiz del repo', re: /\/\/ La raiz del repo se deduce[\s\S]*?const repoRoot = path\.resolve\(__dirname, '\.\.', '\.\.', '\.\.'\);/g },
  { nombre: 'resolucion de refs', re: /const dentroDelRepo = p => \{[\s\S]*?\n\}\n/g },
  { nombre: 'atribucion por ancestro', re: /\/\/ --- Atribucion por ancestro[\s\S]*?\/\/ --- fin atribucion por ancestro ---/g },
  { nombre: 'indices por frontmatter', re: /\/\/ --- Indices por frontmatter ---[\s\S]*?\/\/ --- fin indices por frontmatter ---/g },
];

const bloques = new Map(); // name -> [{archivo, hash}]
function registrar(name, archivo, cuerpo) {
  const hash = crypto.createHash('sha1').update(cuerpo).digest('hex').slice(0, 10);
  const arr = bloques.get(name) || [];
  arr.push({ archivo: path.relative(repo, archivo).replace(/\\/g, '/'), hash });
  bloques.set(name, arr);
}
function extraer(archivo) {
  const txt = fs.readFileSync(archivo, 'utf8');
  const re = /```markdown\n(---\nname: ([\w-]+)[\s\S]*?)\n```/g;
  let m;
  while ((m = re.exec(txt))) {
    registrar(m[2], archivo, m[1].replace(/\s+/g, ' ').trim());
  }
  for (const frag of FRAGMENTOS) {
    let f; frag.re.lastIndex = 0;
    while ((f = frag.re.exec(txt))) {
      registrar('codigo: ' + frag.nombre, archivo, f[0].replace(/\r\n/g, '\n'));
    }
  }
}
for (const f of enDisco) {
  const skillsDir = path.join(funcDir, f, 'skills');
  if (!fs.existsSync(skillsDir)) continue;
  for (const s of fs.readdirSync(skillsDir)) {
    const p = path.join(skillsDir, s, 'PLANTILLA.md');
    if (fs.existsSync(p)) extraer(p);
  }
}
// Los lints vivos de este repo entran a la misma comparacion: la deriva mas probable no es entre
// dos plantillas sino entre el lint que corre aca y la plantilla que lo distribuye.
function buscarLints(dir, out) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory() || e.name === '.git' || e.name === 'node_modules' || e.name === 'tmp') continue;
    const full = path.join(dir, e.name);
    if (/^lint-/.test(e.name)) {
      const js = path.join(full, e.name + '.js');
      if (fs.existsSync(js)) out.push(js);
      continue;
    }
    buscarLints(full, out);
  }
  return out;
}
for (const js of buscarLints(path.join(repo, '.claude'), [])) extraer(js);
const divergentes = [];
for (const [name, arr] of bloques) {
  const hashes = new Set(arr.map(a => a.hash));
  if (hashes.size > 1) divergentes.push(`"${name}": ${arr.map(a => `${a.archivo} (${a.hash})`).join('  vs  ')}`);
}

// -- [4b] un destino, un solo bloque en la PLANTILLA ---------------------
// Cada archivo que el instalador escribe se declara UNA vez. Dos bloques para el mismo destino no
// son redundancia inofensiva: nada los sincroniza, se separan solos y despues nada decide cual se
// instala. Paso con conducta/INDICE.md y conducta/MOMENTOS.md, que estuvieron duplicados entre dos
// secciones hasta que una quedo vieja (un momento y dos reglas de menos) sin que ningun lint lo viera.
const DECLARA_DESTINO = [
  /^### `(\.claude\/[^`]+)`/gm,                       // catalogo de copias textuales
  /Contenido inicial de `(\.claude\/[^`]+)`/g,        // bloque presentado en la seccion del subsistema
  /^## §Script — (?:[^`]*)`(\.claude\/[^`]+)`/gm,     // seccion de script
];
const destinosDuplicados = [];
for (const f of enDisco) {
  const skillsDir = path.join(funcDir, f, 'skills');
  if (!fs.existsSync(skillsDir)) continue;
  for (const s of fs.readdirSync(skillsDir)) {
    const pl = path.join(skillsDir, s, 'PLANTILLA.md');
    if (!fs.existsSync(pl)) continue;
    const txt = fs.readFileSync(pl, 'utf8').replace(/\r\n/g, '\n');
    const porDestino = new Map();
    for (const re of DECLARA_DESTINO) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(txt))) {
        const linea = txt.slice(0, m.index).split('\n').length;
        porDestino.set(m[1], (porDestino.get(m[1]) || []).concat(linea));
      }
    }
    const rel = path.relative(repo, pl).replace(/\\/g, '/');
    for (const [destino, lineas] of porDestino) {
      if (lineas.length > 1) destinosDuplicados.push(`${rel}: ${destino} declarado ${lineas.length} veces (lineas ${lineas.sort((a, b) => a - b).join(', ')})`);
    }
  }
}

// -- [6] tamaño de los manifiestos de subsistema (dec. 0017) -------------
// El MANIFIESTO.md de cada subsistema va SIEMPRE en el contexto de arranque (via @import
// desde AGENTS.md); si engorda, infla cada sesion. La regla es "breve". Chequeo preventivo
// por palabras (mas estable que lineas/bytes): hoy el mayor ronda 160; el limite da aire.
const LIMITE_MANIFIESTO = 220;
const manifiestosLargos = [];
const claudeDir = path.join(repo, '.claude');
if (fs.existsSync(claudeDir)) {
  for (const sub of fs.readdirSync(claudeDir, { withFileTypes: true })) {
    if (!sub.isDirectory()) continue;
    const mani = path.join(claudeDir, sub.name, 'MANIFIESTO.md');
    if (!fs.existsSync(mani)) continue;
    const palabras = (fs.readFileSync(mani, 'utf8').match(/\S+/g) || []).length;
    if (palabras > LIMITE_MANIFIESTO) manifiestosLargos.push(`${sub.name}/MANIFIESTO.md  [${palabras} palabras > ${LIMITE_MANIFIESTO}]`);
  }
}

// -- [7] Base de preferencias identica entre PREFERENCIAS.md y las PLANTILLA -----
// Hueco detectado 26-07-20: el texto de la Base viaja (PREFERENCIAS.md -> PLANTILLA de
// preferencias-trabajo y del orquestador setup-completo) y NADA comparaba las copias
// (el chequeo [4] solo mira bloques de memoria y fragmentos de lint). Se extrae la seccion
// seccion del Agente Multiproposito de cada archivo que la contenga, hasta la del Agente
// Desplegado, y se comparan normalizadas. Divergen -> se listan por hash.
// Se aceptan los encabezados viejos (`## Base (harness vN)` / `## Adaptaciones`) mientras haya
// Agentes Desplegados sin nivelar. OJO: si el encabezado cambia y este patron no, la funcion
// devuelve null y el chequeo pasa en verde SIN comparar nada (falso verde), por eso el aviso.
// El corte de abajo no puede ser solo la seccion del Agente Desplegado: desde que las preferencias
// se partieron en un archivo por origen, esa seccion ya no esta y la del Agente Multiproposito
// llega hasta el proximo encabezado, el cierre del bloque de la plantilla, o el fin del archivo.
const RE_BASE_PREF = /(## (?:Preferencias del Agente Multiprop[oó]sito|Base \(harness[^\n]*\))[^\n]*)\n([\s\S]*?)(?=\n## |\n```|$)/;
function extraerBase(txt) {
  const m = txt.match(RE_BASE_PREF);
  return m ? (m[1] + '\n' + m[2]).replace(/\s+/g, ' ').trim() : null;
}
const fuentesBase = [path.join(repo, '.claude', 'preferencias', 'PREFERENCIAS.md')];
for (const f of enDisco) {
  const skillsDir = path.join(funcDir, f, 'skills');
  if (!fs.existsSync(skillsDir)) continue;
  for (const s of fs.readdirSync(skillsDir)) {
    const p = path.join(skillsDir, s, 'PLANTILLA.md');
    if (fs.existsSync(p)) fuentesBase.push(p);
  }
}
const basePorHash = new Map(); // hash -> [archivos]
const baseSinSeccion = [];     // archivos donde el patron no encontro la seccion
for (const f of fuentesBase) {
  if (!fs.existsSync(f)) continue;
  const rel = path.relative(repo, f).replace(/\\/g, '/');
  const txt = fs.readFileSync(f, 'utf8');
  const base = extraerBase(txt);
  if (base == null) {
    // Solo es hallazgo si el archivo dice tener preferencias: una PLANTILLA de otro
    // subsistema no las lleva y no tiene por que matchear.
    if (/PREFERENCIAS\.md|## Preferencias del Agente|## Base \(harness/i.test(txt)) baseSinSeccion.push(rel);
    continue;
  }
  const h = crypto.createHash('sha1').update(base).digest('hex').slice(0, 10);
  const arr = basePorHash.get(h) || [];
  arr.push(rel);
  basePorHash.set(h, arr);
}
// Sin este aviso el chequeo daba FALSO VERDE: si los encabezados cambiaban y el patron no,
// extraerBase devolvia null en todos lados, no se comparaba nada y la salida quedaba limpia.
const baseDivergente = [
  ...baseSinSeccion.map(f => `sin seccion de preferencias reconocible (encabezado cambiado?): ${f}`),
  ...(basePorHash.size > 1 ? [...basePorHash].map(([h, arr]) => `(${h}) ${arr.join('  |  ')}`) : []),
];

// -- [8] estructura minima de los manifiestos de subsistema (dec. 0019 + 0023) ---
// Cada MANIFIESTO.md debe traer los campos obligatorios: titulo H1, "Disparador",
// "**Skills**" (dec. 0023: nombra las skills de operacion; "ninguna aun" si no tiene),
// una declaracion de carga del indice (se carga siempre | NO se carga siempre) y el
// comando de lint del propio subsistema. El "Flujo de trabajo" es opcional (solo multi-paso,
// como puntero) y no se chequea. Ademas la presencia de la linea de import del
// indice (la linea @<archivo>.md del propio manifiesto) debe ser COHERENTE con esa declaracion:
// la linea ES la declaracion (M1 de 0017), no puede mentir. Lado autor, informativo: no
// viaja al consumidor (se instala correcto desde PLANTILLA).
const manifiestosSinCampos = [];
if (fs.existsSync(claudeDir)) {
  for (const sub of fs.readdirSync(claudeDir, { withFileTypes: true })) {
    if (!sub.isDirectory()) continue;
    const mani = path.join(claudeDir, sub.name, 'MANIFIESTO.md');
    if (!fs.existsSync(mani)) continue;
    const t = fs.readFileSync(mani, 'utf8');
    const faltan = [];
    if (!/^#\s+\S/m.test(t)) faltan.push('titulo H1');
    if (!/Disparador/.test(t)) faltan.push('campo Disparador');
    if (!/\*\*Skills\b/.test(t)) faltan.push('campo Skills (dec. 0023)');
    // sexto campo (dec. 0042): la lista de Indices del subsistema con el origen de cada uno.
    if (!/^\*\*[IÍ]ndices?:\*\*/m.test(t)) faltan.push('campo Índices (lista sus Indices con el origen de cada uno)');
    const cargaM = /(NO\s+)?se carga[n]? siempre/i.exec(t);
    const cargaNo = !!(cargaM && /NO/i.test(cargaM[1] || ''));
    const cargaSi = !!(cargaM && !cargaNo);
    if (!cargaM) faltan.push('declaracion de carga del indice');
    if (!new RegExp('node \\.claude/' + sub.name + '/lint-' + sub.name + '/').test(t)) faltan.push('comando de lint');
    const tieneImport = /^@\S+\.md\s*$/m.test(t);
    if (cargaSi && !tieneImport) faltan.push('declara "se carga siempre" pero falta la linea de import del indice');
    if (cargaNo && tieneImport) faltan.push('declara "NO se carga siempre" pero incluye una linea de import');
    if (faltan.length) manifiestosSinCampos.push(`${sub.name}/MANIFIESTO.md  [${faltan.join('; ')}]`);
  }
}

// -- [9] refs a decisiones del harness en archivos distribuibles (dec. 0024) ---
// El numero de decision referencia el registro de ESTE repo, que NO viaja al consumidor.
// Un archivo que se instala (PLANTILLA, MANIFIESTO de subsistema, lint distribuido) no debe
// citarlo: enuncia la razon inline. Se excluye lo que se queda en el harness: lint-harness
// (Herramienta de este repo). SKILL/README son instruccion que no se persiste en el consumidor.
const citaDec = /(?:decisi[óo]n(?:es)?|dec\.)\s+0\d{3}(?:\/0\d{3})?/g;
const refsDecision = [];
function escanearCitas(archivo) {
  if (!fs.existsSync(archivo)) return;
  const txt = fs.readFileSync(archivo, 'utf8');
  const rel = path.relative(repo, archivo).replace(/\\/g, '/');
  const ms = [...txt.matchAll(citaDec)];
  if (ms.length) refsDecision.push(`${rel}  [${[...new Set(ms.map(m => m[0]))].join(', ')}]`);
}
for (const f of enDisco) {
  const skillsDir = path.join(funcDir, f, 'skills');
  if (!fs.existsSync(skillsDir)) continue;
  for (const s of fs.readdirSync(skillsDir)) escanearCitas(path.join(skillsDir, s, 'PLANTILLA.md'));
}
if (fs.existsSync(claudeDir)) {
  for (const sub of fs.readdirSync(claudeDir, { withFileTypes: true })) {
    if (!sub.isDirectory()) continue;
    escanearCitas(path.join(claudeDir, sub.name, 'MANIFIESTO.md'));
  }
}
for (const js of buscarLints(path.join(repo, '.claude'), [])) {
  const b = path.basename(js);
  if (b === 'lint-harness.js') continue;
  escanearCitas(js);
}

// -- [10] terminologia vetada en el Producto ------------------------------
// El Producto (funcionalidades/) es lo que viaja: un termino vetado en .claude/ lo lee el autor,
// uno en una PLANTILLA lo hereda cada Agente con Propósito que se inicialice. Por eso el hallazgo
// vive aca y CUENTA, mientras lint-semantica lo sigue reportando como informacion para el repo.
//
// La clasificacion NO puede ser la de lint-semantica (todo lo que esta entre backticks es codigo):
// en una PLANTILLA los bloques ```markdown son justamente el texto literal que se escribe en el
// repo destino. Se clasifica por LENGUAJE del bloque: markdown/md/text (y el texto sin bloque) es
// texto que viaja y falla; js/json/bash/powershell es codigo y queda informativo.
//
// Una sola exclusion automatica: el registro de Terminologia Farlopa embebido en la PLANTILLA,
// que contiene los vetados por definicion.
const farlopaPath = path.join(repo, '.claude', 'semantica', 'TERMINOLOGIA-FARLOPA.md');
const vetadosProducto = [];
// El termino se ubica por el NOMBRE de su columna, no por su posicion: con el nucleo la primera
// celda es el Codigo, y saltear el encabezado por su texto —`Término`— dejo de funcionar apenas
// esa columna se llamo `Nombre`, con lo que la palabra `Código` del encabezado entraba a la lista
// de vetados y marcaba 54 apariciones legitimas del texto que viaja.
try {
  let cols = null;
  for (const line of fs.readFileSync(farlopaPath, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t.startsWith('|')) continue;
    const cells = t.split('|').slice(1, -1).map(c => c.trim());
    if (cells.length < 3) continue;
    if (!cols) {
      const norm = cells.map(c => c.replace(/\*/g, '').trim().toLowerCase());
      // `Nombre` es la forma con nucleo; `Término` la vieja, que se acepta mientras haya Agentes
      // Desplegados sin nivelar. Sin encabezado reconocible no se lee ninguna fila.
      const i = norm.indexOf('nombre') >= 0 ? norm.indexOf('nombre') : norm.indexOf('término');
      if (i >= 0 && norm.includes('cómo decirlo')) cols = { termino: i };
      continue;
    }
    if (/^:?-{2,}:?$/.test(cells[0].replace(/[*`\s]/g, ''))) continue;
    const celda = cells[cols.termino] || '';
    for (const v of celda.replace(/`/g, '').split(/[,;/]/).map(x => x.trim()).filter(x => x && x !== '—' && x !== '-')) {
      vetadosProducto.push(v.toLowerCase());
    }
  }
} catch (e) { /* sin registro de farlopa: no hay nada contra que barrer */ }

// Los bloques SIN lenguaje son arboles de estructura y salidas de consola: nombres de archivo,
// no texto para reescribir. El texto que se escribe literal en el repo destino siempre viene
// marcado ```markdown, que es lo que el instalador copia.
const LENG_TEXTO = new Set(['markdown', 'md', 'text', 'txt']);
// Unica via de excepcion: apariciones que el propio registro de farlopa declara legitimas, porque
// el veto es sobre la relacion termino->significado y el lint solo ve el termino. Se identifican
// por un fragmento del texto, no por linea. Lo demas NO se exime: se corrige el texto.
const USOS_LEGITIMOS = [
  { term: 'capa', fragmento: 'capa mecánica', motivo: 'nivel de integridad mecánica/semántica, legítimo por el propio registro' },
  { term: 'capa', fragmento: 'capa semántica', motivo: 'nivel de integridad mecánica/semántica, legítimo por el propio registro' },
];
const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const vetadosProductoTerms = [...new Set(vetadosProducto)];
const vetadoEnProducto = [];      // texto que viaja: cuenta como hallazgo
let vetadoEnCodigoProducto = 0;   // bloques de codigo y .js/.json: informativo
function barrerProducto(archivo) {
  let txt; try { txt = fs.readFileSync(archivo, 'utf8'); } catch (e) { return; }
  const rel = path.relative(repo, archivo).replace(/\\/g, '/');
  const esMd = path.extname(archivo).toLowerCase() === '.md';
  const lineas = txt.split(/\r?\n/);
  let cerco = null;        // { largo, viaja } del bloque abierto
  let bloque = [];         // lineas del bloque abierto, para decidir si es el registro de farlopa
  let inicioBloque = 0;
  // un termino entre backticks es un identificador (nombre de skill, de archivo, de campo):
  // tocarlo es refactor con refs por ruta de por medio, no reescritura. Va a informativo aunque
  // este adentro del texto que viaja.
  // Tambien son identificadores el destino de un link markdown —](ruta)— y el campo `name` del
  // frontmatter de un SKILL.md, que ES el nombre con el que se invoca la habilidad.
  const spansDeLinea = l => {
    const runs = []; let m; const re = /`+/g;
    while ((m = re.exec(l))) runs.push([m.index, m[0].length]);
    const spans = [];
    for (let i = 0; i < runs.length; ) {
      const [open, largo] = runs[i]; let j = i + 1;
      while (j < runs.length && runs[j][1] !== largo) j++;
      if (j < runs.length) { spans.push([open, runs[j][0] + runs[j][1]]); i = j + 1; } else i++;
    }
    const link = /\]\(([^)]*)\)/g;
    while ((m = link.exec(l))) spans.push([m.index, m.index + m[0].length]);
    if (/^name:\s*\S/.test(l)) spans.push([0, l.length]);
    return spans;
  };
  const emitir = (linea, nro, viaja) => {
    const spans = esMd ? spansDeLinea(linea) : null;
    for (const term of vetadosProductoTerms) {
      const re = new RegExp('\\b' + escRe(term) + '\\b', 'gi');
      let m;
      while ((m = re.exec(linea))) {
        const identificador = spans && spans.some(([s, e]) => m.index >= s && m.index < e);
        const legitimo = USOS_LEGITIMOS.some(u => u.term === term.toLowerCase() && linea.includes(u.fragmento));
        if (viaja && !identificador && !legitimo) vetadoEnProducto.push(`${rel}:${nro}  "${term}"`);
        else vetadoEnCodigoProducto++;
      }
    }
  };
  const volcar = () => {
    // el registro de Terminologia Farlopa embebido lista los vetados por definicion
    const esFarlopa = bloque.some(l => /Terminolog[íi]a Farlopa|Relaciones vetadas/.test(l));
    if (esFarlopa) return;
    bloque.forEach((l, i) => emitir(l, inicioBloque + i, cerco.viaja));
  };
  for (let i = 0; i < lineas.length; i++) {
    const linea = lineas[i], nro = i + 1;
    if (!esMd) { emitir(linea, nro, false); continue; }
    if (cerco) {
      const cierre = /^(`{3,})\s*$/.exec(linea);
      if (cierre && cierre[1].length >= cerco.largo) { volcar(); cerco = null; bloque = []; }
      else bloque.push(linea);
      continue;
    }
    const apertura = /^(`{3,})\s*([\w-]*)/.exec(linea);
    if (apertura) {
      cerco = { largo: apertura[1].length, viaja: LENG_TEXTO.has(apertura[2].toLowerCase()) };
      bloque = []; inicioBloque = nro + 1;
      continue;
    }
    emitir(linea, nro, true);
  }
  if (cerco) volcar();   // bloque sin cerrar: se juzga igual
}
if (vetadosProductoTerms.length && fs.existsSync(funcDir)) {
  const EXT_PRODUCTO = new Set(['.md', '.js', '.json', '.mjs', '.cjs', '.sh', '.ps1']);
  (function recorrer(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name === 'node_modules' || e.name === '.git') continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) recorrer(full);
      else if (EXT_PRODUCTO.has(path.extname(e.name).toLowerCase())) barrerProducto(full);
    }
  })(funcDir);
}

// -- salida --------------------------------------------------------------
const secciones = [
  ['PUNTO DE ENTRADA (AGENTS.md + adaptador CLAUDE.md)', entrada],
  ['FUNCIONALIDADES SIN CABLEAR (disco vs marketplace/REGISTRO)', soloDisco],
  ['FANTASMAS (catalogadas pero sin carpeta)', fantasmas],
  ['SOURCES DEL MARKETPLACE QUE NO RESUELVEN', srcRotos],
  ['FUNCIONALIDADES INCOMPLETAS (archivos clave)', incompletas],
  ['VERSION EN DISCO DISTINTA DE LA INSTALADA', versionDesfasada],
  ['BLOQUES VERBATIM DIVERGENTES ENTRE PLANTILLAS', divergentes],
  ['DESTINOS DECLARADOS MAS DE UNA VEZ EN UNA PLANTILLA', destinosDuplicados],
  ['BASE DE PREFERENCIAS DIVERGENTE (PREFERENCIAS.md vs PLANTILLAS)', baseDivergente],
  [`MANIFIESTOS QUE ENGORDARON (> ${LIMITE_MANIFIESTO} palabras)`, manifiestosLargos],
  ['MANIFIESTOS SIN CAMPOS MINIMOS (dec. 0019)', manifiestosSinCampos],
  ['CITAS A DECISIONES DEL HARNESS EN DISTRIBUIBLES (dec. 0024)', refsDecision],
  ['TERMINOLOGIA VETADA EN EL TEXTO QUE VIAJA (funcionalidades/)', vetadoEnProducto],
];
const total = secciones.reduce((n, [, items]) => n + items.length, 0);
if (quiet && total === 0) process.exit(0);
console.log(`== LINT HARNESS: ${repo} ==`);
console.log(`funcionalidades: ${enDisco.length} | plugins en marketplace: ${plugins.length} | filas en REGISTRO: ${enRegistro.length} | hallazgos: ${total}`);
console.log(`plugins instalados para este repo: ${instalados.size}\n`);
for (const [titulo, items] of secciones) {
  if (quiet && !items.length) continue;
  console.log(`[${titulo}] (${items.length})`);
  items.forEach(i => console.log(`    ${i}`));
  if (!quiet && !items.length) console.log('    (ninguno)');
}
// informativo: no es hallazgo (tocar un identificador en codigo es refactor, con refs por ruta de
// por medio). Se imprime sin el formato "(N)" para que el control de cierre no lo cuente.
if (!quiet && vetadoEnCodigoProducto) {
  console.log(`\ninformativo: ${vetadoEnCodigoProducto} aparicion(es) de vetados en bloques de codigo e identificadores del Producto — refactor, no reescritura.`);
}
