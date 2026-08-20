#!/usr/bin/env node
// Lint de coherencia del harness: punto de entrada (AGENTS.md + adaptador CLAUDE.md, decision 0010),
// funcionalidades vs marketplace vs REGISTRO, archivos clave por funcionalidad, divergencia de bloques textuales entre PLANTILLAs,
// tamaño de los MANIFIESTO.md de subsistema (dec. 0017: breves, siempre en contexto) y su estructura
// minima (dec. 0019 + 0023: campos obligatorios incl. Skills + coherencia carga<->@INDICE), citas a
// decisiones del harness en archivos distribuibles (dec. 0024), enlaces de lo que viaja a algo que
// se queda en este repo, terminologia vetada en el texto que viaja (funcionalidades/: lo que se
// escribe en cada Agente con Propósito) y la marca de orden de bytes (U+FEFF) suelta en cualquier
// archivo del repo. Sin LLM, sin red.
// Uso: node lint-harness.js [--quiet]   (correr desde la raiz del repo del harness)
const fs = require('fs'), path = require('path'), os = require('os'), crypto = require('crypto'), cp = require('child_process');
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
const frontmatterSkillInvalido = [];
const skillSinDisparador = [];
const skillSinReconciliacion = [];
const refsRotasSkill = [];
const nombresRetiradosSkill = [];
const skillSinCierre = [];
const frontmatterSubagenteInvalido = [];
const NOMBRES_RETIRADOS_SKILL = [
  'inicializar-subsistemas', 'inicializar-preferencias', 'inicializar-planes',
  'inicializar-conocimiento', 'inicializar-semantica', 'inicializar-decisiones',
  'inicializar-herramientas', 'inicializar-conducta',
  'ciclo-de-plan',
  'consultar-agente',   // partida en `preguntar` y `resolver`: el modo lo elige el usuario, no el modelo
];
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

  for (const s of skills) {
    const skillMd = path.join(skillsDir, s, 'SKILL.md');
    const rel = path.relative(repo, skillMd).replace(/\\/g, '/');
    const txt = fs.readFileSync(skillMd, 'utf8').replace(/\r\n/g, '\n');
    const fm = /^---\n([\s\S]*?)\n---(?:\n|$)/.exec(txt);
    let name = '', description = '';
    if (!fm) {
      frontmatterSkillInvalido.push(`${rel}  [falta frontmatter YAML al inicio]`);
    } else {
      const campos = new Map();
      const invalidas = [];
      for (const linea of fm[1].split('\n')) {
        const m = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(linea);
        if (!m) { invalidas.push(linea); continue; }
        campos.set(m[1], m[2].trim());
      }
      name = campos.get('name') || '';
      description = campos.get('description') || '';
      const inesperados = [...campos.keys()].filter(k => !['name', 'description'].includes(k));
      const problemas = [];
      if (invalidas.length) problemas.push('lineas YAML no reconocidas');
      if (!name) problemas.push('falta name');
      else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name) || name.length > 64) problemas.push('name invalido');
      else if (name !== s) problemas.push(`name ${name} no coincide con la carpeta ${s}`);
      if (!description) problemas.push('falta description');
      else if (description.length > 1024 || /[<>]/.test(description)) problemas.push('description invalida');
      if (inesperados.length) problemas.push(`campos no admitidos: ${inesperados.join(', ')}`);
      if (problemas.length) frontmatterSkillInvalido.push(`${rel}  [${problemas.join('; ')}]`);
    }
    if (!/\bUse when\b/.test(description)) skillSinDisparador.push(`${rel}  [description sin "Use when"]`);
    if (!/^## Reconciliaci[oó]n\b/m.test(txt)) skillSinReconciliacion.push(`${rel}  [falta sección Reconciliación]`);
    if (!/(?:^## (?:Cierre|Reportar)\b|\b(?:correr|ejecutar|verificar|validar|reportar)\b)/im.test(txt)) {
      skillSinCierre.push(`${rel}  [no declara cómo verificar o reportar el resultado]`);
    }
    for (const retirado of NOMBRES_RETIRADOS_SKILL) {
      if (new RegExp(`\\b${retirado}\\b`, 'i').test(txt)) nombresRetiradosSkill.push(`${rel}  [${retirado}]`);
    }
    for (const m of txt.matchAll(/\]\(([^)#]+)(?:#[^)]*)?\)/g)) {
      const destino = m[1].trim();
      if (/^(?:https?:|mailto:|\/)/i.test(destino)) continue;
      let rutaLocal;
      try { rutaLocal = decodeURIComponent(destino); }
      catch { refsRotasSkill.push(`${rel}  [ruta inválida: ${destino}]`); continue; }
      if (!fs.existsSync(path.resolve(path.dirname(skillMd), rutaLocal))) {
        refsRotasSkill.push(`${rel}  [${destino}]`);
      }
    }
  }

  // Los subagentes que el plugin transporta. `model` y `tools` son obligatorios y son el punto
  // entero de delegar: sin `model` el subagente corre al modelo de la sesion y el recorrido se
  // paga igual que en el hilo principal, con la diferencia de que ahora nadie lo ve. Sin `tools`
  // hereda todas, incluidas las de escritura, y deja de ser de solo lectura por construccion.
  // Los dos defectos contestan en verde en la invocacion: el subagente anda, solo que no ahorra
  // nada o puede escribir.
  const agentsDir = path.join(base, 'agents');
  if (fs.existsSync(agentsDir)) {
    for (const a of fs.readdirSync(agentsDir).filter(x => x.endsWith('.md'))) {
      const agenteMd = path.join(agentsDir, a);
      const rel = path.relative(repo, agenteMd).replace(/\\/g, '/');
      const txt = fs.readFileSync(agenteMd, 'utf8').replace(/\r\n/g, '\n');
      const fm = /^---\n([\s\S]*?)\n---(?:\n|$)/.exec(txt);
      if (!fm) { frontmatterSubagenteInvalido.push(`${rel}  [falta frontmatter YAML al inicio]`); continue; }
      // Solo las claves de columna cero: `description: >` sigue en las lineas indentadas de abajo,
      // que no son claves y no se cuentan.
      const campos = new Map();
      for (const linea of fm[1].split('\n')) {
        const m = /^([a-z][\w-]*):\s*(.*)$/.exec(linea);
        if (m) campos.set(m[1], m[2].trim());
      }
      const problemas = [];
      const name = campos.get('name') || '';
      const esperado = a.replace(/\.md$/, '');
      if (!name) problemas.push('falta name');
      else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) problemas.push('name invalido');
      else if (name !== esperado) problemas.push(`name ${name} no coincide con el archivo ${esperado}`);
      if (!campos.has('description')) problemas.push('falta description');
      if (!campos.has('tools')) problemas.push('falta tools (sin declararlas hereda todas, incluidas las de escritura)');
      if (!campos.has('model')) problemas.push('falta model (sin declararlo corre al modelo de la sesion y no ahorra nada)');
      if (problemas.length) frontmatterSubagenteInvalido.push(`${rel}  [${problemas.join('; ')}]`);
    }
  }
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

// -- [3b] contenido de un plugin cambiado sin subir su version -----------
// El desfase que paso en silencio el 07/08/2026: dos commits cambiaron archivos que viajan en el
// plugin `amp` bajo la MISMA version 0.40.0. actualizar-plugins compara solo por numero de version
// —dos contenidos distintos con el mismo numero le dan verde— y solo la vista previa de amp:actualizar
// mira contenido. Nadie comparaba la version contra su contenido: la forma 3 del conocimiento
// `controles-que-no-avisan` (mira una copia, no la que se usa). Un plugin que publica contenido nuevo
// bajo una version ya publicada no llega a los Agentes Desplegados, porque Claude Code no reinstala si
// el numero no sube.
//
// La comparacion mira el DISCO, no solo la historia: se busca el commit donde se fijo la version que
// hoy declara el plugin.json, y se compara el arbol de ese commit contra el estado en disco.
// Asi, subir la version en disco apaga el hallazgo al instante —la version nueva todavia no aparece en
// ningun commit, no puede haber colision— y no hay ruido durante la edicion. Un plugin sin campo
// `version` auto-versiona por commit (cada commit es una version): no hay numero que subir, queda exento.
//
// Es git puro y sin red. En un arbol que no es repo git —el banco de prueba se copia como archivos— el
// control se saltea solo, igual que [3] cuando no hay plugins instalados; por eso su prueba arma su
// propio repo git.
const versionSinSubir = [];
let esRepoGit = false;
try { cp.execSync('git rev-parse --is-inside-work-tree', { cwd: repo, stdio: ['ignore', 'pipe', 'ignore'] }); esRepoGit = true; }
catch (e) { /* no es repo git: el control no aplica */ }
if (esRepoGit) {
  const versionEnCommit = (commit, rutaPj) => {
    try { return JSON.parse(cp.execSync(`git show ${commit}:"${rutaPj}"`, { cwd: repo, encoding: 'utf8' })).version || ''; }
    catch (e) { return ''; }
  };
  for (const f of enDisco) {
    const rutaPj = `funcionalidades/${f}/.claude-plugin/plugin.json`;
    let vDisco = '';
    try { vDisco = JSON.parse(fs.readFileSync(path.join(repo, rutaPj), 'utf8')).version || ''; } catch (e) { continue; }
    if (!vDisco) continue; // sin version fija: auto-versiona por commit, no hay numero que subir
    let commits = [];
    try { commits = cp.execSync(`git log --format=%H -- "${rutaPj}"`, { cwd: repo, encoding: 'utf8' }).split('\n').map(s => s.trim()).filter(Boolean); }
    catch (e) { continue; }
    if (!commits.length) continue; // plugin sin historia: nada publicado con que colisionar
    // commitFijado = el commit mas viejo de la racha contigua reciente donde version == la de disco.
    // Si el commit mas nuevo ya no la tiene, la version de disco no se commiteo todavia: es nueva,
    // nunca se publico con otro contenido, no marca.
    let commitFijado = null;
    for (const c of commits) { if (versionEnCommit(c, rutaPj) === vDisco) commitFijado = c; else break; }
    if (!commitFijado) continue;
    let cambios = '';
    try { cambios = cp.execSync(`git diff --name-only ${commitFijado} -- "funcionalidades/${f}/"`, { cwd: repo, encoding: 'utf8' }).trim(); }
    catch (e) { continue; }
    if (cambios) {
      const n = cambios.split('\n').filter(Boolean).length;
      versionSinSubir.push(`${f}: version ${vDisco} (fijada en ${commitFijado.slice(0, 9)}) pero ${n} archivo(s) del plugin cambiaron despues  (subir la version, o el Agente Desplegado no recibe el cambio)`);
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
// todos los lints (no el lint entero: cada subsistema tiene el suyo, pero comparten fragmentos).
// Se identifican por su comentario ancla. Los fragmentos NO se normalizan como las memorias:
// deben coincidir caracter a caracter (solo se unifica el fin de linea).
// Son dos fragmentos con alcance distinto: la raiz del repo la usan los 4 lints que la derivan de
// la carpeta que miran; la resolucion de refs solo los 3 que validan links .md (lint-herramientas
// deriva la raiz pero valida rutas en settings, no refs).
//
// Fue tercero `indices por frontmatter`, el bloque de 94 lineas que los 8 lints de subsistema
// llevaban copiado. Se retiro al mudarlo a `.claude/common/indices.js`: con una sola copia no hay
// divergencia posible, asi que el fragmento se quedo sin nada que comparar. Un fragmento vigilado
// se retira en la MISMA tanda en que desaparece su duplicacion — si no, MUESTRAS_MINIMAS lo marca
// como si le hubieran migrado el patron, que es el caso opuesto y se arregla al reves.
//
// UN FRAGMENTO CON MENOS DE DOS MUESTRAS NO CONTROLA NADA: `hashes.size > 1` no puede ser verdadero
// sobre cero o una copia, asi que el fragmento contesta en verde pase lo que pase. Pasa solo, por
// dos caminos ya vistos (01/08/2026): al fragmento `raiz del repo` le migraron el patron —los lints
// dejaron de deducirla de __dirname al aplicar el conocimiento `el-repo-que-un-script-describe`, y
// el regex siguio buscando el codigo viejo—, y a `atribucion por ancestro` le retiraron el segundo
// consumidor con `lint-memoria`. Por eso MUESTRAS_MINIMAS: un fragmento que se queda sin con quien
// compararse es un hallazgo, no un verde. Conocimiento `controles-que-no-avisan`.
const MUESTRAS_MINIMAS = 2;
const FRAGMENTOS = [
  { nombre: 'raiz del repo', re: /\/\/ El repo se deriva de `root`[\s\S]*?\nconst repoRoot = repoDe\(root\);/g },
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
// Los fragmentos declarados que se quedaron sin con quien compararse. Se recorre FRAGMENTOS, no
// `bloques`: el que junto cero muestras no llego a entrar al Map, que es justo el caso mas mudo.
const fragmentosSinMuestras = [];
for (const frag of FRAGMENTOS) {
  const n = (bloques.get('codigo: ' + frag.nombre) || []).length;
  if (n < MUESTRAS_MINIMAS) fragmentosSinMuestras.push(`"${frag.nombre}": ${n} muestra(s) — el ancla no matchea el codigo actual, o quedo un solo consumidor: reapuntar el patron o retirar el fragmento`);
}

// -- [4b] el Agente Multiproposito que viaja vs el instalado en este repo ------
// Los Componentes de Subsistema viajan como ARCHIVOS, en la carpeta `base/` de la skill de
// instalacion, con el mismo arbol que ocupan en el destino. Este control compara ese arbol
// contra el `.claude/` vivo de este repo, que es donde se editan y donde se usan.
//
// La regla de comparacion la declara CADA ARCHIVO en su frontmatter, no una lista escrita
// aparte —una lista aparte es justamente el dato en dos lugares que este cambio vino a sacar—:
//   - sin frontmatter, u `origen: agente-multiproposito`  ->  identicos, entero
//   - `origen: agente-desplegado`  ->  identico hasta la primera fila de tabla; de ahi para
//     abajo estan las filas que puebla cada repo, que legitimamente difieren
//
// Y en el otro sentido: la infra Base que existe en `.claude/` y NO tiene contraparte. Partir
// del archivo que viaja no puede ver el que nunca viajo — es como se escondio por meses que la
// Herramienta `instalar-plugins-codex` estuviera declarada en el registro Base y no se instalara.
const normArch = s => s.replace(/\r\n/g, '\n').replace(/\s+$/, '');
const { origenDe } = require('../../common/frontmatter.js');
const { basesDeInstalacion: basesDe } = require('../../common/bases-de-instalacion.js');
const { indicesDe } = require('../../common/indices.js');
const { leerRegistroVetados } = require('../../common/terminos-vetados.js');
// Encabezado = todo lo anterior a la primera fila de datos de la primera tabla. El separador
// `|---|` va incluido: es parte de la forma que manda el Agente Multiproposito.
function encabezadoDe(txt) {
  const ls = normArch(txt).split('\n');
  const i = ls.findIndex(l => /^\s*\|[\s:|-]+\|\s*$/.test(l));
  return i === -1 ? null : ls.slice(0, i + 1).join('\n');
}
function listarArchivos(raiz, rel, out) {
  for (const e of fs.readdirSync(path.join(raiz, rel || '.'), { withFileTypes: true })) {
    const r = rel ? rel + '/' + e.name : e.name;
    if (e.isDirectory()) listarArchivos(raiz, r, out); else out.push(r);
  }
  return out;
}
const basesDeInstalacion = basesDe(repo);
// Filas de datos de la primera tabla (las que van despues del separador `|---|`).
function filasDe(txt) {
  const ls = normArch(txt).split('\n');
  const i = ls.findIndex(l => /^\s*\|[\s:|-]+\|\s*$/.test(l));
  if (i === -1) return [];
  return ls.slice(i + 1).filter(l => /^\s*\|/.test(l.trim()));
}
// Carpetas de primer nivel de `.claude/` que NO son subsistemas sino infra compartida: no acumulan
// entradas de ningun repo, asi que lo que tienen adentro debe viajar SALVO que este registrado como
// Herramienta del Agente Desplegado (ver `registradasComoLocales`).
const INFRA_RAIZ = new Set(['common']);

// Las rutas que el Indice de Herramientas del AGENTE DESPLEGADO declara: son maquinaria de quien
// publica el Agente Multiproposito, no de quien lo instala, asi que legitimamente no viajan.
//
// El indice se localiza por el `origen` de su frontmatter y no por su nombre (decision Local-0042):
// el nombre dejo de codificar el origen. Si no se encuentra ninguno, el conjunto queda vacio y todo
// vuelve a exigirse — el control marca de mas, que es el lado seguro.
const registradasComoLocales = new Set();
for (const idx of indicesDe(path.join(repo, '.claude', 'herramientas'))) {
  if (idx.origen !== 'agente-desplegado') continue;
  for (const m of idx.texto.matchAll(/\(\.{0,2}\/?([\w.-]+\/[\w.-]+\.js)\)/g)) {
    registradasComoLocales.add(m[1]);
  }
}
const viajaDistinto = [], viajaSinInstalar = [], sinViajar = [], viajaConFilas = [];
const carpetasQueViajan = new Set();
for (const baseDir of basesDeInstalacion) {
  const relBase = path.relative(repo, baseDir).replace(/\\/g, '/');
  for (const r of listarArchivos(baseDir, '', [])) {
    carpetasQueViajan.add(path.posix.dirname(r));
    const instalado = path.join(repo, '.claude', r);
    if (!fs.existsSync(instalado)) { viajaSinInstalar.push(`${r}  — viaja en ${relBase} y no existe en .claude/`); continue; }
    const aViajar = fs.readFileSync(path.join(baseDir, r), 'utf8');
    const enUso = fs.readFileSync(instalado, 'utf8');
    if (!r.endsWith('.md') || origenDe(aViajar) !== 'agente-desplegado') {
      if (normArch(aViajar) !== normArch(enUso)) {
        const a = normArch(enUso).split('\n'), c = normArch(aViajar).split('\n');
        let k = 0; while (k < Math.max(a.length, c.length) && a[k] === c[k]) k++;
        viajaDistinto.push(`${r}  — difiere desde la linea ${k + 1} (instalado ${a.length} lineas, viaja ${c.length})`);
      }
      continue;
    }
    // Registro del Agente Desplegado: manda el encabezado, las filas son de cada repo.
    // Y por eso mismo el que VIAJA no puede llevar ninguna: nace declarado y sin filas. Si lleva,
    // todo repo que se instale arranca con las entradas de este — sus Herramientas, sus terminos,
    // sus reglas— como si fueran propias. El control del encabezado no puede verlo: mira arriba
    // de la tabla justamente para no comparar las filas.
    const filas = filasDe(aViajar);
    if (filas.length) viajaConFilas.push(`${r}  — viaja con ${filas.length} fila(s); un Indice del Agente Desplegado nace sin ninguna`);
    const ea = encabezadoDe(aViajar), eb = encabezadoDe(enUso);
    if (ea === null || eb === null) { viajaDistinto.push(`${r}  — declara origen agente-desplegado y no se encontro su tabla`); continue; }
    if (ea !== eb) {
      const a = eb.split('\n'), c = ea.split('\n');
      let k = 0; while (k < Math.max(a.length, c.length) && a[k] === c[k]) k++;
      viajaDistinto.push(`${r}  — encabezado distinto desde la linea ${k + 1} (las filas no se comparan: son del repo)`);
    }
  }
}
// El otro sentido: un archivo instalado sin contraparte es infra Base que se quedo sin viajar.
//
// Se mira SOLO dentro de las carpetas de infra —las anidadas dentro del subsistema, del tipo
// `planes/lint-planes/` o `herramientas/actualizar-plugins/`—, nunca en la raiz de un subsistema.
// La raiz es donde cada repo acumula sus entradas: sus paginas de conocimiento, sus decisiones,
// sus planes. Ahi un archivo sin contraparte es lo normal, no un hueco, y marcarlos convertia el
// control en 30 hallazgos de los que ninguno era real — una fila que marca todo se deja de leer.
if (basesDeInstalacion.length) {
  const queViajan = new Set();
  for (const baseDir of basesDeInstalacion) for (const r of listarArchivos(baseDir, '', [])) queViajan.add(r);
  for (const carpeta of carpetasQueViajan) {
    // La excepcion es para la raiz de un SUBSISTEMA, no para todo lo de primer nivel. `common/`
    // tambien cuelga directo de `.claude/` y es lo contrario: infra pura, sin entradas de ningun
    // repo, donde un archivo que no viaja tiene que estar declarado. Sin esta lista el control
    // saltea la carpeta entera y un modulo compartido que nunca se copio a `base/` sale en verde —
    // verificado borrando `base/common/frontmatter.js` el 01/08/2026: no lo marco nadie.
    if (!carpeta.includes('/') && !INFRA_RAIZ.has(carpeta)) continue;
    // Una carpeta de la que viaja SOLO un `.gitkeep` viaja como contenedor vacio: lo que se
    // instala es la carpeta, no su contenido. Son las tres del ciclo de planes, y ahi un archivo
    // que no viaja es una entrada del repo, no un hueco. Sin esta guarda el control exige que
    // viajen los 109 planes de este repo, y una fila que marca todo se deja de leer. Se deduce de
    // lo que viaja y no de una lista: `.gitkeep` no significa otra cosa en ningun lado.
    const queViajanDeLaCarpeta = [...queViajan].filter(r => path.posix.dirname(r) === carpeta);
    if (queViajanDeLaCarpeta.every(r => path.posix.basename(r) === '.gitkeep')) continue;
    const dir = path.join(repo, '.claude', carpeta);
    if (!fs.existsSync(dir)) continue;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!e.isFile()) continue;
      const r = carpeta + '/' + e.name;
      if (queViajan.has(r) || registradasComoLocales.has(r)) continue;
      sinViajar.push(`.claude/${r}`);
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

// -- [7] la Base de preferencias la cubre [4b] -----------------------------------
// Este chequeo comparaba la seccion del Agente Multiproposito de `PREFERENCIAS.md` contra la copia
// que llevaba cada PLANTILLA, buscandola con una expresion que dependia del texto del encabezado
// —y que daba FALSO VERDE si el encabezado cambiaba y ella no—. Desde que el archivo viaja como
// archivo, `PREFERENCIAS.md` es un caso mas de [4b]: se compara entero, sin buscar ninguna seccion.

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
// El prefijo de origen es opcional y la palabra va sin distinguir mayusculas: `Decisión Local-0044`
// cita el mismo registro que `dec. 0044` y viaja igual de rota. Sin eso en el patron, la forma
// larga —la que pide la Preferencia Base-0016, y con la que el repo escribe hoy— pasaba entera por
// abajo del control.
const citaDec = /(?:decisi[óo]n(?:es)?|dec\.)\s+(?:Local-|Base-)?0\d{3}(?:\/0\d{3})?/gi;
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
// Y todo lo que viaja en las carpetas `base/`. Los tres barridos de arriba miran la copia instalada
// en `.claude/` y nombran un archivo por vez (PLANTILLA, MANIFIESTO, lint), asi que solo alcanzaban
// a tres de los 87 archivos que se despachan: el resto de `base/` —preferencias, conocimiento,
// bancos de prueba— nunca se abria. Verificado el 02/08/2026: `base/preferencias/` citaba cuatro
// decisiones de este repo y el control estaba en verde.
for (const baseDir of basesDeInstalacion) {
  for (const rel of listarArchivos(baseDir, '', [])) {
    if (!/\.(md|js)$/.test(rel)) continue;
    escanearCitas(path.join(baseDir, rel));
  }
}

// -- [9b] enlaces de lo que viaja que no resuelven adentro de lo que viaja ---
// Hermano del chequeo de arriba, y por el mismo motivo: un archivo que se instala en cada Agente
// Desplegado no puede apuntar a algo que se queda en este repo. Alla el enlace no lleva a ningun
// lado, y el que lo sigue no encuentra nada — o peor, lo resuelve escribiendo a mano la pagina que
// falta, con lo que cada consumidor termina con su propia version de lo mismo.
//
// El caso que lo motivo: `TERMINOLOGIA-FARLOPA.md` viaja y apunta a `../conocimiento/
// terminologia-farlopa.md`, que no viaja. Lo encontro una persona, no un control, despues de que un
// Agente Desplegado se topara con el enlace roto y reescribiera la pagina.
//
// Se mira CUALQUIER enlace relativo, no solo los que van a `conocimiento/`: el defecto es que el
// destino no viaje, y eso le puede pasar a una decision, a una preferencia o a lo que se sume
// manana. Medido el 31/07/2026 sobre lo que viaja: 23 enlaces resuelven y 1 no, asi que generalizar
// no trae ruido. El destino se busca adentro de la MISMA carpeta que viaja, que es lo unico que el
// consumidor recibe.
// El mismo defecto tiene una forma MAS GRAVE en el codigo: un archivo que viaja que hace `require`
// de uno que no viaja no confunde a nadie, MATA el hook. Node resuelve el require al cargar, antes
// de cualquier try/catch, asi que el repartidor muere con `MODULE_NOT_FOUND` y el Agente Desplegado
// se queda SIN NINGUNA REGLA ENTREGADA, en cada turno. Medido el 02/08/2026 sobre un consumidor
// simulado al que le faltaba `conducta/alcance-al-escribir.js`: exit 1 y ni una regla.
//
// Por que este control y no uno que compare los dos arboles: `sincronizar-base` decide que viaja
// recorriendo `base/`, asi que un Componente nuevo no entra solo. Comparar `.claude/` contra `base/`
// para descubrirlo marca 24 archivos en este repo y LOS 24 son Aprendizaje legitimo que no debe
// viajar (paginas de conocimiento, detalles de decisiones) — un control que marca todo entrena a
// ignorarlo. Este, en cambio, no opina sobre que DEBERIA viajar: solo dice que lo que ya viaja no
// puede quedar colgado. Cero falsos positivos por construccion.
const enlaceMd = /\]\(([^)#\s]+\.md)(?:#[^)]*)?\)/g;
const requireRelativo = /require\(\s*['"](\.[^'"]+)['"]\s*\)/g;
const enlacesRotos = [];
// Node acepta el require sin extension y resolviendo a un index: se prueban las tres formas antes de
// dar por roto, para no marcar como faltante algo que alla si resuelve.
const resuelveComoModulo = p => fs.existsSync(p) || fs.existsSync(p + '.js') || fs.existsSync(path.join(p, 'index.js'));
for (const baseDir of basesDeInstalacion) {
  for (const r of listarArchivos(baseDir, '', [])) {
    const esMd = r.endsWith('.md'), esJs = /\.(js|mjs|cjs)$/.test(r);
    if (!esMd && !esJs) continue;
    const archivo = path.join(baseDir, r);
    const texto = fs.readFileSync(archivo, 'utf8');
    const rotos = new Set();
    if (esMd) {
      for (const m of texto.matchAll(enlaceMd)) {
        const ruta = m[1];
        if (/^(?:https?:|\/)/.test(ruta)) continue;        // absoluto o externo: no es asunto de este control
        if (!fs.existsSync(path.resolve(path.dirname(archivo), ruta))) rotos.add(ruta);
      }
    } else {
      for (const m of texto.matchAll(requireRelativo)) {
        if (!resuelveComoModulo(path.resolve(path.dirname(archivo), m[1]))) rotos.add(m[1]);
      }
    }
    if (rotos.size) enlacesRotos.push(`${r}  — apunta a ${[...rotos].join(', ')}, que no viaja`);
  }
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
// Lo lee el modulo comun —el mismo que `lint-semantica` y el control del momento `al escribir`—,
// que ubica el termino por el NOMBRE de su columna y no por su posicion: con el nucleo la primera
// celda es el Codigo, y saltear el encabezado por su texto —`Término`— dejo de funcionar apenas
// esa columna se llamo `Nombre`, con lo que la palabra `Código` del encabezado entraba a la lista
// de vetados y marcaba 54 apariciones legitimas del texto que viaja.
for (const fila of leerRegistroVetados(farlopaPath)) {
  for (const v of fila.variantes) vetadosProducto.push(v.toLowerCase());
}

// Los bloques SIN lenguaje son arboles de estructura y salidas de consola: nombres de archivo,
// no texto para reescribir. El texto que se escribe literal en el repo destino siempre viene
// marcado ```markdown, que es lo que el instalador copia.
const LENG_TEXTO = new Set(['markdown', 'md', 'text', 'txt']);
// Sin lista de excepciones por fragmento, a proposito. Hubo una —eximia `capa mecánica` y
// `capa semántica` del termino `capa`— y se retiro el 30/07/2026 al reformularse esa fila del
// registro: donde el termino ajeno se monta sobre una palabra corriente del espanol, lo que se
// registra es la EXPRESION (`capa de plugins`), no la palabra. Asi el registro sigue enumerando lo
// prohibido, que es finito, en vez de lo permitido, que no lo es. La fila `capa` marcaba 37
// apariciones y acertaba en ninguna; reformulada marca 0 y sigue cazando el uso ajeno.
const USOS_LEGITIMOS = [];
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
    // Las COMILLAS son la marca de cita del espanol: nombrar un termino para explicar su veto no es
    // usarlo. Sin esto, un plan o una pagina que documenta un barrido no se puede escribir. La
    // cursiva queda afuera a proposito (marca cita pero tambien enfasis).
    for (const reCita of [/"[^"\n]*"/g, /[“”][^“”\n]*[“”]/g, /«[^»\n]*»/g]) {
      let c; while ((c = reCita.exec(l))) spans.push([c.index, c.index + c[0].length]);
    }
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

// -- [11] la divergencia del texto que viaja la cubre [4b] -----------------------
// Este chequeo comparaba cada script transcripto adentro de una PLANTILLA contra su archivo en
// `.claude/`, parseando cercas de codigo para recuperar el texto. Desde que los scripts viajan
// como archivos, la comparacion es archivo contra archivo y no hay nada que parsear: la hace
// [4b], que ademas alcanza a los `.md`, que este nunca miro.

// -- [12] la marca de orden de bytes (U+FEFF) suelta en el repo ----------
// Un mismo caracter invisible, dos defectos distintos segun donde caiga. AL INICIO de un archivo es
// la marca de orden de bytes: el `.md` deja de matchear `^---`, se lo lee "sin frontmatter" y pierde
// todo lo que declaraba de si mismo —origen, indice, columnas— sin emitir ninguna señal. En
// CUALQUIER OTRA posicion es el caracter literal metido adentro del texto, tipicamente en el regex
// que se escribio para sacarlo: funciona, se lee igual, y deja en el fuente exactamente aquello de
// lo que trata el defecto. Ninguno de los dos se ve abriendo el archivo, asi que el unico que los
// encuentra es un barrido.
// El caracter se construye por codigo a proposito: escribirlo literal aca dejaria en este archivo
// justamente lo que el control persigue.
const MARCA_DE_ORDEN = String.fromCharCode(0xFEFF);
const EXT_TEXTO = new Set(['.md', '.js', '.json', '.mjs', '.cjs', '.sh', '.ps1']);
const TMP = path.join(repo, '.claude', 'tmp');
const marcaDeOrden = [];
(function barrerMarca(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.git') continue;
    const full = path.join(dir, e.name);
    // `.claude/tmp/` queda afuera: esta gitignoreada, nada de ahi viaja ni se ejecuta, y es donde
    // los bancos siembran la marca a proposito para probar que sus controles la ven.
    if (e.isDirectory()) { if (full !== TMP) barrerMarca(full); continue; }
    if (!EXT_TEXTO.has(path.extname(e.name).toLowerCase())) continue;
    let txt; try { txt = fs.readFileSync(full, 'utf8'); } catch (err) { continue; }
    if (!txt.includes(MARCA_DE_ORDEN)) continue;
    const rel = path.relative(repo, full).replace(/\\/g, '/');
    txt.split(/\r?\n/).forEach((linea, i) => {
      let idx = linea.indexOf(MARCA_DE_ORDEN);
      while (idx !== -1) {
        marcaDeOrden.push(i === 0 && idx === 0
          ? `${rel}:1  marca de orden al inicio: tapa el frontmatter`
          : `${rel}:${i + 1}  columna ${idx + 1}: carácter literal en el texto`);
        idx = linea.indexOf(MARCA_DE_ORDEN, idx + 1);
      }
    });
  }
})(repo);

// -- salida --------------------------------------------------------------
const secciones = [
  ['PUNTO DE ENTRADA (AGENTS.md + adaptador CLAUDE.md)', entrada],
  ['FUNCIONALIDADES SIN CABLEAR (disco vs marketplace/REGISTRO)', soloDisco],
  ['FANTASMAS (catalogadas pero sin carpeta)', fantasmas],
  ['SOURCES DEL MARKETPLACE QUE NO RESUELVEN', srcRotos],
  ['FUNCIONALIDADES INCOMPLETAS (archivos clave)', incompletas],
  ['SKILLS CON FRONTMATTER INVALIDO', frontmatterSkillInvalido],
  ['SKILLS SIN DISPARADOR EN DESCRIPTION', skillSinDisparador],
  ['SKILLS SIN RECONCILIACION', skillSinReconciliacion],
  ['REFERENCIAS ROTAS EN SKILLS', refsRotasSkill],
  ['NOMBRES DE SKILLS RETIRADOS TODAVIA REFERENCIADOS', nombresRetiradosSkill],
  ['SKILLS SIN CIERRE VERIFICABLE', skillSinCierre],
  ['SUBAGENTES CON FRONTMATTER INVALIDO', frontmatterSubagenteInvalido],
  ['VERSION EN DISCO DISTINTA DE LA INSTALADA', versionDesfasada],
  ['CONTENIDO DE PLUGIN CAMBIADO SIN SUBIR SU VERSION', versionSinSubir],
  ['FRAGMENTOS DE CODIGO DIVERGENTES ENTRE LINTS', divergentes],
  [`FRAGMENTOS VIGILADOS CON MENOS DE ${MUESTRAS_MINIMAS} MUESTRAS (no controlan nada)`, fragmentosSinMuestras],
  ['LO QUE VIAJA DIFIERE DE LO INSTALADO EN .claude/', viajaDistinto],
  ['VIAJA UN COMPONENTE QUE NO EXISTE EN .claude/', viajaSinInstalar],
  ['INFRA BASE EN .claude/ QUE NO VIAJA', sinViajar],
  ['UN INDICE DEL AGENTE DESPLEGADO VIAJA CON FILAS', viajaConFilas],
  [`MANIFIESTOS QUE ENGORDARON (> ${LIMITE_MANIFIESTO} palabras)`, manifiestosLargos],
  ['MANIFIESTOS SIN CAMPOS MINIMOS (dec. 0019)', manifiestosSinCampos],
  ['CITAS A DECISIONES DEL HARNESS EN DISTRIBUIBLES (dec. 0024)', refsDecision],
  ['LO QUE VIAJA APUNTA A ALGO QUE NO VIAJA (enlaces y require)', enlacesRotos],
  ['TERMINOLOGIA VETADA EN EL TEXTO QUE VIAJA (funcionalidades/)', vetadoEnProducto],
  ['MARCA DE ORDEN DE BYTES (U+FEFF) EN ARCHIVOS DEL REPO', marcaDeOrden],
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
