#!/usr/bin/env node
// Lint de coherencia del harness: punto de entrada (AGENTS.md + adaptador CLAUDE.md, decision 0010),
// funcionalidades vs marketplace vs REGISTRO, archivos clave por funcionalidad, junctions de skills
// (dos tandas: ~/.claude/skills y ~/.agents/skills), divergencia de bloques verbatim entre PLANTILLAs,
// tamaño de los MANIFIESTO.md de subsistema (dec. 0017: breves, siempre en contexto) y su estructura
// minima (dec. 0019 + 0023: campos obligatorios incl. Skills + coherencia carga<->@INDICE). Sin LLM, sin red.
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

// -- [3] junctions/symlinks de skills (dos tandas, decision 0010) --------
const tandas = [
  path.join(os.homedir(), '.claude', 'skills'),   // la ve Claude Code
  path.join(os.homedir(), '.agents', 'skills'),   // la ven Codex/Cursor/Gemini (estandar Agent Skills)
];
const sinJunction = [], junctionAjeno = [];
for (const f of enDisco) {
  const skillsDir = path.join(funcDir, f, 'skills');
  if (!fs.existsSync(skillsDir)) continue;
  for (const s of fs.readdirSync(skillsDir)) {
    const target = path.join(skillsDir, s);
    if (!fs.existsSync(path.join(target, 'SKILL.md'))) continue;
    for (const tanda of tandas) {
      const link = path.join(tanda, s);
      const donde = path.basename(path.dirname(tanda)); // .claude | .agents
      if (!fs.existsSync(link)) { sinJunction.push(`${s} [~/${donde}/skills]  (instalar-junctions -> ${path.relative(repo, target)})`); continue; }
      try {
        const real = fs.realpathSync(link);
        if (path.resolve(real) !== path.resolve(target)) junctionAjeno.push(`${s} [~/${donde}/skills]  apunta a ${real}`);
      } catch (e) { junctionAjeno.push(`${s} [~/${donde}/skills]  [irresoluble: ${e.code || e.message}]`); }
    }
  }
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
// todos los lints (no el lint entero: cada subsistema tiene el suyo, pero comparten piezas).
// Se identifican por su comentario ancla. Los fragmentos NO se normalizan como las memorias:
// deben coincidir caracter a caracter (solo se unifica el fin de linea).
// Son dos piezas con alcance distinto: la raiz del repo la usan los 5 lints; la resolucion de
// refs solo los 4 que validan links .md (lint-herramientas valida rutas en settings, no refs).
const FRAGMENTOS = [
  { nombre: 'raiz del repo', re: /\/\/ La raiz del repo se deduce[\s\S]*?const repoRoot = path\.resolve\(__dirname, '\.\.', '\.\.', '\.\.'\);/g },
  { nombre: 'resolucion de refs', re: /const dentroDelRepo = p => \{[\s\S]*?\n\}\n/g },
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
    if (!e.isDirectory() || e.name === '.git' || e.name === 'node_modules') continue;
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
// `## Base (harness vN)` hasta `## Adaptaciones` de cada archivo que la contenga —incluida la
// version en el encabezado— y se comparan normalizadas. Divergen -> se listan por hash.
function extraerBase(txt) {
  const m = txt.match(/(## Base \(harness[^\n]*)\n([\s\S]*?)\n## Adaptaciones/);
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
for (const f of fuentesBase) {
  if (!fs.existsSync(f)) continue;
  const base = extraerBase(fs.readFileSync(f, 'utf8'));
  if (base == null) continue;
  const h = crypto.createHash('sha1').update(base).digest('hex').slice(0, 10);
  const arr = basePorHash.get(h) || [];
  arr.push(path.relative(repo, f).replace(/\\/g, '/'));
  basePorHash.set(h, arr);
}
const baseDivergente = basePorHash.size > 1
  ? [...basePorHash].map(([h, arr]) => `(${h}) ${arr.join('  |  ')}`)
  : [];

// -- [8] estructura minima de los manifiestos de subsistema (dec. 0019 + 0023) ---
// Cada MANIFIESTO.md debe traer los campos obligatorios: titulo H1, "Disparador",
// "**Skills**" (dec. 0023: nombra las skills de operacion; "ninguna aun" si no tiene),
// una declaracion de carga del indice (se carga siempre | NO se carga siempre) y el
// comando de lint del propio subsistema. El "Flujo de trabajo" es opcional (solo multi-paso,
// como puntero) y no se chequea. Ademas la presencia de la linea de import del
// indice (@...INDICE / @...MEMORIA / @...PLANES) debe ser COHERENTE con esa declaracion:
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
    const cargaM = /(NO\s+)?se carga siempre/i.exec(t);
    const cargaNo = !!(cargaM && /NO/i.test(cargaM[1] || ''));
    const cargaSi = !!(cargaM && !cargaNo);
    if (!cargaM) faltan.push('declaracion de carga del indice');
    if (!new RegExp('node \\.claude/' + sub.name + '/lint-' + sub.name + '/').test(t)) faltan.push('comando de lint');
    const tieneImport = /^@\S*(INDICE|MEMORIA|PLANES)/m.test(t);
    if (cargaSi && !tieneImport) faltan.push('declara "se carga siempre" pero falta la linea @INDICE');
    if (cargaNo && tieneImport) faltan.push('declara "NO se carga siempre" pero incluye una linea @INDICE');
    if (faltan.length) manifiestosSinCampos.push(`${sub.name}/MANIFIESTO.md  [${faltan.join('; ')}]`);
  }
}

// -- salida --------------------------------------------------------------
const secciones = [
  ['PUNTO DE ENTRADA (AGENTS.md + adaptador CLAUDE.md)', entrada],
  ['FUNCIONALIDADES SIN CABLEAR (disco vs marketplace/REGISTRO)', soloDisco],
  ['FANTASMAS (catalogadas pero sin carpeta)', fantasmas],
  ['SOURCES DEL MARKETPLACE QUE NO RESUELVEN', srcRotos],
  ['FUNCIONALIDADES INCOMPLETAS (archivos clave)', incompletas],
  ['SKILLS SIN JUNCTION (tandas ~/.claude/skills y ~/.agents/skills)', sinJunction],
  ['JUNCTIONS QUE APUNTAN A OTRO LADO', junctionAjeno],
  ['BLOQUES VERBATIM DIVERGENTES ENTRE PLANTILLAS', divergentes],
  ['BASE DE PREFERENCIAS DIVERGENTE (PREFERENCIAS.md vs PLANTILLAS)', baseDivergente],
  [`MANIFIESTOS QUE ENGORDARON (> ${LIMITE_MANIFIESTO} palabras)`, manifiestosLargos],
  ['MANIFIESTOS SIN CAMPOS MINIMOS (dec. 0019)', manifiestosSinCampos],
];
const total = secciones.reduce((n, [, items]) => n + items.length, 0);
if (quiet && total === 0) process.exit(0);
console.log(`== LINT HARNESS: ${repo} ==`);
console.log(`funcionalidades: ${enDisco.length} | plugins en marketplace: ${plugins.length} | filas en REGISTRO: ${enRegistro.length} | hallazgos: ${total}\n`);
for (const [titulo, items] of secciones) {
  if (quiet && !items.length) continue;
  console.log(`[${titulo}] (${items.length})`);
  items.forEach(i => console.log(`    ${i}`));
  if (!quiet && !items.length) console.log('    (ninguno)');
}
