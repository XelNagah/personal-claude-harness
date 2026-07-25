#!/usr/bin/env node
// actualizar-plugins.js — pone al dia la CAPA DE PLUGINS del Agente Multiproposito en esta maquina.
//
// Los plugins se sirven de un clon del repo del marketplace, asi que no se actualizan solos: la
// version que CORRE es la que quedo en el cache el dia que se instalo. Este script compara lo que
// corre contra lo que hay disponible y, con --aplicar, corre los comandos del CLI que lo nivelan.
//
//   node .claude/herramientas/actualizar-plugins/actualizar-plugins.js            (solo diagnostica)
//   node .claude/herramientas/actualizar-plugins/actualizar-plugins.js --aplicar  (actualiza)
//
// Sin argumentos NO toca nada: sirve como control de desfase disco<->cargado.
// Generico: no hardcodea nombres de plugin ni de marketplace — sale de `enabledPlugins` del repo.
// Sin process.exit(1): reporta, no frena (decision 0003, capa mecanica).

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');

const APLICAR = process.argv.includes('--aplicar');
// Acepta una ruta de repo como argumento (para apuntarlo a otro AMP de la maquina); por omision, el propio.
const RUTA_ARG = process.argv.slice(2).find(a => !a.startsWith('--'));
const REPO = RUTA_ARG ? path.resolve(RUTA_ARG) : path.resolve(__dirname, '..', '..', '..');
const PLUGINS_DIR = path.join(os.homedir(), '.claude', 'plugins');

function leerJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { return null; }
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
  // preferir la entrada de este repo; si no hay, la de alcance usuario
  const propia = entradas.find(e => e.projectPath && path.resolve(e.projectPath) === REPO);
  const usuario = entradas.find(e => e.scope === 'user');
  return propia || usuario || entradas[0] || null;
}

// -- version DISPONIBLE: la del clon del marketplace, leyendo el plugin.json que apunta el catalogo --
function disponible(nombre, marketplace) {
  const mkts = leerJson(path.join(PLUGINS_DIR, 'known_marketplaces.json')) || {};
  const mkt = mkts[marketplace];
  if (!mkt || !mkt.installLocation) return { error: 'marketplace no registrado' };
  const catalogo = leerJson(path.join(mkt.installLocation, '.claude-plugin', 'marketplace.json'));
  if (!catalogo || !Array.isArray(catalogo.plugins)) return { error: 'catalogo ilegible' };
  const fila = catalogo.plugins.find(p => p.name === nombre);
  // Habilitado pero ausente del catalogo = el marketplace ya no lo ofrece (renombrado o dado de baja).
  // No es "sin dato": es un plugin colgado, y actualizarlo no lo arregla — hay que migrar los nombres.
  if (!fila) return { retirado: true };
  // `source` es una ruta relativa dentro del clon ("./funcionalidades/amp"). Algunos marketplaces
  // lo declaran como objeto (origen remoto propio): ahi el manifiesto no esta en este clon.
  const origen = fila.source === undefined ? '.' : fila.source;
  if (typeof origen !== 'string') return { error: 'el plugin se sirve de un origen propio, no del clon' };
  const manifiesto = leerJson(path.join(mkt.installLocation, origen, '.claude-plugin', 'plugin.json'));
  if (!manifiesto) return { error: 'plugin.json ilegible' };
  // Sin campo `version` el plugin se versiona por commit: se compara el sha del clon.
  if (!manifiesto.version) {
    const r = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: mkt.installLocation, encoding: 'utf8' });
    return { version: null, sha: (r.stdout || '').trim() || null };
  }
  return { version: manifiesto.version, sha: null };
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
      estado = inst.version === disp.version ? 'AL DIA' : 'DESACTUALIZADO';
      detalle = `corre ${inst.version} · disponible ${disp.version}`;
    } else if (disp.sha) {
      const igual = (inst.gitCommitSha || '').startsWith(disp.sha.slice(0, 12));
      estado = igual ? 'AL DIA' : 'DESACTUALIZADO';
      detalle = `versiona por commit · corre ${(inst.gitCommitSha || '?').slice(0, 12)} · disponible ${disp.sha.slice(0, 12)}`;
    } else {
      estado = 'SIN DATO';
      detalle = 'no se pudo determinar la version disponible';
    }
    filas.push({ id, nombre, marketplace, estado, detalle, scope: (inst && inst.scope) || 'project' });
  }
  return filas;
}

function imprimir(filas) {
  const ancho = Math.max(...filas.map(f => f.id.length), 10);
  for (const f of filas) {
    console.log(`  ${f.id.padEnd(ancho)}  ${f.estado.padEnd(15)} ${f.detalle}`);
  }
}

// -- aplicar: refrescar el catalogo del marketplace y actualizar lo desactualizado --
// El CLI exige el identificador COMPLETO (plugin@marketplace) y el alcance: con el nombre pelado
// o con el alcance por omision falla con el mismo mensaje, `Plugin "x" not found`.
function aplicar(filas) {
  const marketplaces = [...new Set(filas.map(f => f.marketplace))];
  for (const m of marketplaces) {
    console.log(`\n> Refrescando el catalogo de ${m}...`);
    const r = spawnSync('claude', ['plugin', 'marketplace', 'update', m], { encoding: 'utf8', shell: true, timeout: 180000 });
    console.log('  ' + ((r.stdout || r.stderr || '').trim().split('\n').pop() || 'sin salida'));
  }

  // Releer: refrescar el catalogo puede haber cambiado que esta desactualizado.
  const pendientes = diagnosticar().filter(f => f.estado === 'DESACTUALIZADO' || f.estado === 'NO INSTALADO');
  if (!pendientes.length) {
    console.log('\nNada que actualizar despues de refrescar el catalogo.');
    return;
  }
  for (const f of pendientes) {
    console.log(`\n> Actualizando ${f.id} (alcance ${f.scope})...`);
    const r = spawnSync('claude', ['plugin', 'update', f.id, '--scope', f.scope], { encoding: 'utf8', shell: true, timeout: 180000 });
    console.log('  ' + ((r.stdout || r.stderr || '').trim().split('\n').pop() || 'sin salida'));
  }
}

// ---------------------------------------------------------------------------
console.log(`== ACTUALIZAR PLUGINS: ${REPO} ==`);

let filas = diagnosticar();
if (!filas.length) {
  console.log('\nNingun plugin habilitado para este repo (enabledPlugins vacio o ausente).');
} else {
  console.log('');
  imprimir(filas);

  const desfasados = filas.filter(f => f.estado === 'DESACTUALIZADO' || f.estado === 'NO INSTALADO');
  const retirados = filas.filter(f => f.estado === 'RETIRADO');

  if (APLICAR) {
    aplicar(filas);
    console.log('\n-- despues de aplicar --\n');
    filas = diagnosticar();
    imprimir(filas);
    console.log('\nREINICIAR LA SESION para que los cambios tomen efecto.');
    console.log('(`/reload-plugins` no alcanza: recarga los plugins en la version que ya tenian.)');
  } else if (desfasados.length) {
    console.log(`\n${desfasados.length} plugin(s) con desfase. Para nivelarlos:`);
    console.log('  node .claude/herramientas/actualizar-plugins/actualizar-plugins.js --aplicar');
  } else if (!retirados.length) {
    console.log('\nTODO AL DIA.');
  }

  // Los retirados no se arreglan actualizando: son nombres que el marketplace dejo de ofrecer.
  if (retirados.length) {
    console.log(`\n${retirados.length} plugin(s) RETIRADO(S): este repo quedo en una generacion de nombres`);
    console.log('que el marketplace ya no ofrece. Actualizar no los arregla — hay que desinstalar los');
    console.log('nombres viejos e instalar el conjunto nuevo (migracion, no actualizacion).');
    console.log('  ' + retirados.map(f => f.id).join('\n  '));
  }
}
