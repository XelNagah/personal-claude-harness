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
//   node .claude/herramientas/actualizar-plugins/actualizar-plugins.js --limpiar-cache  (borra el
//     cache huerfano: las carpetas de version que ninguna instalacion de la maquina declara. Flag
//     aparte porque escribe AFUERA del repo y borra; `--aplicar` no lo enciende.)
//
// Sin argumentos NO toca nada: sirve como control de desfase disco<->cargado.
// Generico: no hardcodea nombres de plugin ni de marketplace — sale de `enabledPlugins` del repo.
// Sin process.exit(1): reporta, no frena — es capa mecanica, el juicio queda del lado del agente.

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');

const APLICAR = process.argv.includes('--aplicar');
// Flag propio, y a proposito NO lo enciende `--aplicar`: quien corre el actualizador pidio poner al dia
// un repo, no borrar nada de su carpeta de usuario. Son dos permisos distintos.
const LIMPIAR_CACHE = process.argv.includes('--limpiar-cache');
// Modo de segundo plano: no imprime, deja el aviso en el Buzon de Avisos Generales y el hook
// repartidor lo entrega en el turno siguiente. Lo lanza la Pantalla de bienvenida al arrancar.
const AVISAR = process.argv.includes('--avisar');
// La unica salida a internet de esta Herramienta se puede apagar por repo, con `env` en su settings.
const SIN_RED = process.env.AMP_SIN_RED === '1';
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
// El cache es de la MAQUINA: la limpieza no lleva la ruta de repo, que ahi no significa nada.
const COMANDO_LIMPIAR = '  node ' + JSON.stringify(process.argv[1])
  + (AGENTE_PEDIDO ? ` --agente ${AGENTE_PEDIDO}` : '') + ' --limpiar-cache';

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

// -- cache huerfano: lo que quedo bajado y ya no lo usa NADIE ------------------
// El cache de plugins es de la MAQUINA, no de este repo: dos repos pueden correr versiones distintas
// del mismo plugin. Por eso lo unico que se informa es lo que NINGUNA entrada de instalacion declara,
// mirando todas las entradas de todos los repos. Marcar como sobrante una version que otro repo esta
// usando seria el mismo error que esta Herramienta evita al no tomar la version instalada allá.
//
// Nada limpia esto hoy y crece con cada publicacion. No se borra automaticamente ni con `--aplicar`:
// esta afuera del repo, en la carpeta del usuario, y borrar es destructivo. Se informa y se da el
// comando.
function cacheHuerfano() {
  const cacheDir = path.join(PLUGINS_DIR, 'cache');
  const registro = leerJson(path.join(PLUGINS_DIR, 'installed_plugins.json'));
  const plugins = (registro && registro.plugins) || {};
  // Todas las versiones en uso por cualquier repo, por nombre completo del plugin.
  // `sinVersion` es la contracara: una entrada que no declara version no aporta nada a `enUso`, asi
  // que TODAS las carpetas de ese plugin quedarian marcadas como libres — un plugin en uso que se ve
  // entero huerfano. Como informe es ruido; para el borrado es fatal, y por eso se anota por plugin.
  const enUso = new Map();
  const sinVersion = new Set();
  for (const [id, entradas] of Object.entries(plugins)) {
    for (const e of entradas || []) {
      if (!enUso.has(id)) enUso.set(id, new Set());
      if (e.version) enUso.get(id).add(e.version);
      else sinVersion.add(id);
    }
  }
  const sobran = [];
  let marketplaces = [];
  try { marketplaces = fs.readdirSync(cacheDir, { withFileTypes: true }).filter(e => e.isDirectory()); }
  catch { return sobran; }
  for (const mk of marketplaces) {
    const raizMk = path.join(cacheDir, mk.name);
    let nombres = [];
    try { nombres = fs.readdirSync(raizMk, { withFileTypes: true }).filter(e => e.isDirectory()); } catch { continue; }
    // Lo que el marketplace bajado todavia ofrece: un nombre que no esta ahi es una generacion vieja.
    // `catalogoDe` devuelve el `marketplace.json` entero, no la lista: la lista es su campo `plugins`.
    const cat = catalogoDe(path.join(PLUGINS_DIR, 'marketplaces', mk.name));
    const filasCat = (cat && Array.isArray(cat.plugins)) ? cat.plugins : [];
    const ofrecidos = new Set(filasCat.map(p => p.name));
    for (const n of nombres) {
      const id = `${n.name}@${mk.name}`;
      const usadas = enUso.get(id) || new Set();
      let versiones = [];
      try { versiones = fs.readdirSync(path.join(raizMk, n.name)); } catch { continue; }
      const libres = versiones.filter(v => !usadas.has(v));
      if (!libres.length) continue;
      const retirado = ofrecidos.size > 0 && !ofrecidos.has(n.name);
      sobran.push({
        id, ruta: path.join(raizMk, n.name), libres, total: versiones.length, retirado,
        incompleto: sinVersion.has(id),
      });
    }
  }
  return sobran;
}

// -- borrado del cache huerfano (solo con --limpiar-cache) --------------------
// "Ninguna instalacion la declara" alcanza para INFORMAR una carpeta, no para borrarla: el registro
// puede no saber lo que la maquina esta usando. Dos guardas, y cada una saltea el plugin ENTERO en vez
// de adivinar cual de sus carpetas se salva:
//   A) REGISTRO INCOMPLETO — una entrada sin `version` deja todas las carpetas de ese plugin sin
//      dueno aparente. Hoy el registro siempre la trae, asi que la guarda no se dispara nunca; existe
//      porque el dia que falte, el borrado se lleva puesta justo la version que corre.
//   B) SESION VIVA — un plugin SIN CARGAR se actualizo despues de que arranco esta sesion, que sigue
//      corriendo la version ANTERIOR desde su carpeta del cache. Esa version ya no figura en el
//      registro, o sea que aparece como huerfana, y borrarla no rompe la sesion que viene: rompe la
//      que esta abierta. Se saltea hasta el reinicio, que es cuando deja de estar en uso.
function limpiarCache(sobra, filas) {
  const sinCargar = new Set(filas.filter(f => f.sinCargar).map(f => f.id));
  const borradas = [], fallidas = [], salteados = [];
  for (const s of sobra) {
    if (s.incompleto) { salteados.push({ id: s.id, motivo: 'el registro tiene una entrada suya sin version' }); continue; }
    if (sinCargar.has(s.id)) { salteados.push({ id: s.id, motivo: 'esta SIN CARGAR: esta sesion corre una de estas carpetas' }); continue; }
    for (const v of s.libres) {
      const ruta = path.join(s.ruta, v);
      try { fs.rmSync(ruta, { recursive: true, force: true }); borradas.push(ruta); }
      catch (e) { fallidas.push({ ruta, error: e.message }); }
    }
  }
  return { borradas, fallidas, salteados };
}

// -- desfase entre las DOS PARTES del Agente Multiproposito -------------------
// Un Agente Multiproposito son dos cosas que viajan por caminos distintos: sus SKILLS, que llegan
// como plugins, y sus ARCHIVOS, que escribe `amp:inicializar` dentro de `.claude/`. Cada camino tiene
// su propio control —esta Herramienta mira los plugins, `amp:actualizar` mira los archivos— y hasta
// el 30/07/2026 nadie miraba las dos partes ENTRE SI. El caso medido: un repo con los archivos de la
// generacion nueva y los plugins de la vieja, con los dos controles en verde por separado.
//
// Se compara contra la PLANTILLA del plugin que EFECTIVAMENTE CORRE, cuya ruta sale del propio
// registro de instalacion (`installPath`), no de adivinar una version. Cada bloque de codigo de esa
// plantilla declara su destino: si el archivo que hay en el repo no coincide, las dos partes estan
// en generaciones distintas.
function archivosDeOtraGeneracion(filas) {
  const amp = filas.find(f => /^amp@/.test(f.id));
  if (!amp) return null;
  const ent = instalado(amp.id);
  if (!ent || !ent.installPath) return null;
  const plantilla = path.join(ent.installPath, 'skills', 'inicializar', 'PLANTILLA.md');
  let txt; try { txt = fs.readFileSync(plantilla, 'utf8'); } catch { return null; }

  const lineas = txt.split(/\r?\n/);
  const distintos = [], faltantes = [];
  let destino = null, dentro = false, buf = [];
  for (const l of lineas) {
    if (!dentro) {
      const m = l.match(/`(\.claude\/[^`]+\.js)`/);
      if (m) destino = m[1];
      if (/^```js\s*$/.test(l)) { dentro = true; buf = []; }
      continue;
    }
    if (/^```\s*$/.test(l)) {
      dentro = false;
      if (destino) {
        const enRepo = path.join(REPO, destino);
        const norm = s => s.replace(/\r\n/g, '\n').replace(/\s+$/, '');
        if (!fs.existsSync(enRepo)) faltantes.push(destino);
        else if (norm(fs.readFileSync(enRepo, 'utf8')) !== norm(buf.join('\n'))) distintos.push(destino);
      }
      continue;
    }
    buf.push(l);
  }
  return { version: ent.version || '(sin version)', distintos, faltantes };
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

// -- modo `--avisar`: correr en segundo plano y dejar el aviso en el buzon ----
// Lo lanza la Pantalla de bienvenida al arrancar, sin esperarlo. No imprime nada y no toca nada
// fuera del buzon: es una LECTURA del estado, asi que puede convivir con un `--aplicar` a mano.
//
// El aviso pone PRIMERO lo que rompe. Un plugin sin declarar o sin instalar no carga: Claude Code lo
// descarta entero y sus skills no existen en la sesion, sin avisar. Eso es peor que una version
// atrasada, y no necesita red para detectarse.
const RUTA_AVISO = path.join(REPO, '.claude', 'tmp', 'avisos', 'plugins.txt');
const MARCA_CONSULTA = path.join(REPO, '.claude', 'tmp', 'ultima-consulta-plugins.txt');
// Sin esto, abrir varias sesiones de golpe dispara una consulta al remoto por cada una. La marca es
// SOLO de la parte cara: el aviso se rehace siempre, asi que nunca queda uno viejo dando vueltas.
const ESPERA_ENTRE_CONSULTAS_MS = 60 * 1000;

function consultaReciente() {
  try {
    const t = Number(fs.readFileSync(MARCA_CONSULTA, 'utf8').trim());
    return Number.isFinite(t) && (Date.now() - t) < ESPERA_ENTRE_CONSULTAS_MS;
  } catch (e) { return false; }
}

function textoDelAviso(filas) {
  const lineas = [];
  const rompe = filas.filter(f => f.estado === 'SIN DECLARAR' || f.estado === 'NO INSTALADO');
  const retirados = filas.filter(f => f.estado === 'RETIRADO');
  const atrasados = filas.filter(f => f.estado === 'ACTUALIZAR');
  const sinCargar = filas.filter(f => f.sinCargar);

  if (rompe.length) {
    lineas.push(`${rompe.length} plugin(s) NO CARGAN en esta sesion y sus skills no existen, sin ninguna senal:`);
    for (const f of rompe) lineas.push(`  ${f.id} — ${f.estado}`);
  }
  if (retirados.length) {
    lineas.push(`${retirados.length} plugin(s) con un nombre que el marketplace ya no ofrece (es migracion, no actualizacion):`);
    for (const f of retirados) lineas.push(`  ${f.id}`);
  }
  if (sinCargar.length) {
    lineas.push(`${sinCargar.length} plugin(s) se actualizaron despues de que arranco esta sesion: corre la version vieja.`);
  }
  if (atrasados.length) {
    lineas.push(`${atrasados.length} plugin(s) con version nueva sin instalar:`);
    for (const f of atrasados) lineas.push(`  ${f.id} — ${f.detalle}`);
  }
  return lineas;
}

if (AVISAR) {
  try {
    // Sin saber que agente corre no se puede mirar la configuracion correcta, y en segundo plano no
    // hay a quien preguntarle: se sale sin escribir, que es callarse, no mentir.
    if (!AGENTE) process.exit(0);
    fs.mkdirSync(path.dirname(RUTA_AVISO), { recursive: true });
    ARRANQUE = arranqueSesion();
    const filas = diagnosticar();
    const lineas = textoDelAviso(filas);

    // La consulta al remoto es lo unico caro y lo unico que sale a internet. Se puede apagar entera
    // con AMP_SIN_RED=1 en el bloque `env` del settings del repo: esto corre en cada arranque de
    // cada Agente Desplegado, y una salida a internet que el usuario no pidio tiene que poder no
    // ocurrir. Lo de arriba es todo de disco y sigue funcionando igual.
    if (!SIN_RED && filas.length && !consultaReciente()) {
      const nombresPorMkt = new Map();
      for (const f of filas) {
        if (!nombresPorMkt.has(f.marketplace)) nombresPorMkt.set(f.marketplace, []);
        nombresPorMkt.get(f.marketplace).push(f.nombre);
      }
      const publicados = [];
      for (const [m, nombres] of nombresPorMkt) {
        const c = estadoCatalogo(m, nombres);
        if (c.estado === 'ACTUALIZAR') publicados.push(`  ${m} — ${c.detalle}`);
      }
      try { fs.writeFileSync(MARCA_CONSULTA, String(Date.now()), 'utf8'); } catch (e) { /* sin marca, se reconsulta */ }
      if (publicados.length) {
        lineas.push(`${publicados.length} marketplace(s) con novedades publicadas que esta maquina no bajo:`);
        lineas.push(...publicados);
      }
    }

    if (!lineas.length) {
      // Nada que decir: se limpia un aviso viejo en vez de dejarlo repitiendo algo ya resuelto.
      try { fs.unlinkSync(RUTA_AVISO); } catch (e) { /* no habia */ }
    } else {
      const texto = ['Plugins del Agente Multiproposito — hay desfases:', ...lineas,
        'Para resolverlo, pedi `amp:actualizar`; despues hay que REINICIAR la sesion para que los',
        'plugins nuevos carguen. Esto informa, no actua: no actualices por tu cuenta sin que te lo pidan.',
      ].join('\n');
      fs.writeFileSync(RUTA_AVISO, texto, 'utf8');
    }
  } catch (e) { /* en segundo plano nadie lo mira: si falla, no hay aviso y listo */ }
  process.exit(0);
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
    console.log(`\n${desfasados.length} plugin(s) con desfase. Para actualizarlos:`);
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

  // Las dos partes entre si: los archivos del repo contra los que instalaria el plugin que corre.
  const gen = archivosDeOtraGeneracion(filas);
  if (gen && (gen.distintos.length || gen.faltantes.length)) {
    const total = gen.distintos.length + gen.faltantes.length;
    console.log(`\n${total} archivo(s) DE OTRA GENERACION que los plugins: el plugin que corre (${gen.version})`);
    console.log('instalaria una version distinta de estos archivos que la que hay en el repo. Los plugins y');
    console.log('los archivos son las dos partes del mismo Agente Multiproposito y viajan por caminos');
    console.log('distintos, asi que cada uno puede estar al dia por su cuenta y no coincidir entre si.');
    for (const d of gen.distintos) console.log(`  distinto:  ${d}`);
    for (const d of gen.faltantes) console.log(`  no esta:   ${d}`);
    console.log('\nSi los plugins ya estan al dia, esto se resuelve actualizando los archivos: pedir `amp:actualizar`.');
    console.log('En el repo que PUBLICA el Agente Multiproposito es lo esperable cuando hay cambios sin publicar.');
  } else if (gen) {
    console.log('\nLas dos partes coinciden: los archivos del repo son los que instalaria el plugin que corre.');
  }

  // Cache huerfano: informativo. Es de la maquina, no del repo, y no lo limpia nadie.
  const sobra = cacheHuerfano();
  if (sobra.length) {
    const carpetas = sobra.reduce((n, s) => n + s.libres.length, 0);
    const retirados = sobra.filter(s => s.retirado);
    console.log(`\n${carpetas} carpeta(s) de version en el CACHE que ningun repo de esta maquina usa`);
    console.log('(se mira el registro completo, no solo este repo: otro repo puede estar corriendo una');
    console.log('version vieja a proposito). Nada las limpia y crecen con cada publicacion.');
    if (retirados.length) {
      console.log(`\n  ${retirados.length} de nombres que el marketplace ya no ofrece:`);
      for (const s of retirados) console.log(`    ${s.id}  (${s.libres.length} de ${s.total})`);
    }
    const viejas = sobra.filter(s => !s.retirado);
    if (viejas.length) {
      console.log(`\n  ${viejas.length} de plugins vigentes, en versiones que ya no corren:`);
      for (const s of viejas) console.log(`    ${s.id}  (${s.libres.length} de ${s.total})`);
    }
    if (LIMPIAR_CACHE) {
      const { borradas, fallidas, salteados } = limpiarCache(sobra, filas);
      console.log(`\n> Limpiando (--limpiar-cache): ${borradas.length} borrada(s)`
        + (salteados.length ? `, ${salteados.length} plugin(s) salteado(s)` : '')
        + (fallidas.length ? `, ${fallidas.length} con error` : '') + '.');
      for (const r of borradas) console.log(`  borrada:  ${r}`);
      for (const s of salteados) console.log(`  salteado: ${s.id} — ${s.motivo}`);
      for (const f of fallidas) console.log(`  ERROR:    ${f.ruta} — ${f.error}`);
      if (salteados.length) {
        console.log('\nLo salteado no es un sobrante confirmado: son carpetas que el registro da por libres');
        console.log('y que igual pueden estar en uso. Volver a correr la limpieza despues de reiniciar.');
      }
    } else {
      console.log('\nBorrarlas es seguro pero es DESTRUCTIVO y esta afuera del repo, en la carpeta del');
      console.log('usuario, asi que no se hace ni sin flags ni con --aplicar. Para borrarlas:');
      console.log(COMANDO_LIMPIAR);
      console.log('\nLas rutas son:');
      for (const s of sobra) for (const v of s.libres) console.log(`  ${path.join(s.ruta, v)}`);
    }
  } else if (LIMPIAR_CACHE) {
    console.log('\n(--limpiar-cache: no hay ninguna carpeta de version sin usar. Nada que borrar.)');
  }
}
