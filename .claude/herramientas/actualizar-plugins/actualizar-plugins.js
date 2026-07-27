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
let ARRANQUE = null;   // se completa abajo, una sola vez (consultar el proceso cuesta ~150 ms)
// Acepta una ruta de repo como argumento (para apuntarlo a otro Agente Multiproposito de la maquina);
// por omision, el propio.
const RUTA_ARG = process.argv.slice(2).find(a => !a.startsWith('--'));
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
const COMANDO_APLICAR = '  node ' + JSON.stringify(process.argv[1]) + (RUTA_ARG ? ' ' + JSON.stringify(RUTA_ARG) : '') + ' --aplicar';

function leerJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { return null; }
}

// git de una linea: devuelve la salida o null si el comando falla, no existe el repo o vence.
function gitEn(dir, args, timeout = 5000, confiarDirectorio = false) {
  // El marketplace puede pertenecer al usuario aunque el proceso que corre el
  // control sea un sandbox. Confiar solo su ruta exacta permite leer su commit
  // sin cambiar la configuracion global de Git ni confiar directorios amplios.
  const comando = confiarDirectorio ? ['-c', `safe.directory=${dir}`, ...args] : args;
  const r = spawnSync('git', comando, { cwd: dir, encoding: 'utf8', timeout });
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

// -- que plugins usa este repo: enabledPlugins del settings del repo + el del usuario --
function plugesHabilitados() {
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
  const catalogo = leerJson(path.join(raiz, '.claude-plugin', 'marketplace.json'));
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
  const esDirectorio = mkt.source && mkt.source.source === 'directory';
  // N/A solo es valido cuando el registro declara explicitamente una carpeta.
  // Un fallo de Git (por ejemplo safe.directory) en un marketplace GitHub no
  // puede convertirse en "todo actualizado": hay que pedir refresco.
  if (esDirectorio) return { estado: 'N/A', detalle: 'marketplace servido desde una carpeta local' };

  const local = gitEn(bajado, ['rev-parse', 'HEAD'], 5000, true);
  if (!local) return {
    estado: 'ACTUALIZAR',
    detalle: 'no se pudo leer el checkout del marketplace; no se verifico contra lo publicado',
  };

  // Para GitHub consultar la URL declarada evita depender de `origin` y de la
  // propiedad del checkout. Los otros origenes conservan la consulta normal.
  const remoto = mkt.source && mkt.source.source === 'github' && mkt.source.repo
    ? `https://github.com/${mkt.source.repo}.git`
    : 'origin';
  const publicado = (gitEn(bajado, ['ls-remote', remoto, 'HEAD'], 5000, true) || '').split(/\s+/)[0] || null;
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
    if (headRepo) return {
      estado: 'ACTUALIZAR',
      detalle: `sin salida a red: bajado ${local.slice(0, 12)} = este repo, pero GitHub no se verifico`,
    };
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

// -- diagnostico: una fila por plugin habilitado --
function diagnosticar() {
  const filas = [];
  for (const id of plugesHabilitados().sort()) {
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
  return filas;
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
  const pendientes = diagnosticar().filter(f => f.estado === 'ACTUALIZAR' || f.estado === 'NO INSTALADO');
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

  const desfasados = filas.filter(f => f.estado === 'ACTUALIZAR' || f.estado === 'NO INSTALADO');
  const retirados = filas.filter(f => f.estado === 'RETIRADO');

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
