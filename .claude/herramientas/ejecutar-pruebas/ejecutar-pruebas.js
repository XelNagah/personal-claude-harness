#!/usr/bin/env node
// ejecutar-pruebas.js — corre de una pasada todas las pruebas de los controles del repo.
//
// Hermana de `ejecutar-control-cierre`, y la diferencia entre las dos es el punto: el control de
// cierre pregunta «¿el repo está bien?»; esta pregunta «¿los controles que contestan eso siguen
// funcionando?». Hacen falta las dos. El conocimiento `cambiar-la-forma-de-un-registro` midió que
// de once roturas de un control, OCHO no emitieron ninguna señal: el control seguía contestando en
// verde sobre un conjunto vacío. Un control sin prueba no avisa cuando deja de controlar, y el
// control de cierre no puede detectarlo porque le cree.
//
// Descubre las pruebas: cualquier `pruebas.js` bajo `.claude/`, co-ubicado con lo que prueba (misma
// convención que los lints, decisión Local-0008). No hay lista que mantener.
//
// Contrato de una prueba: sale con código 0 si todo pasó y 1 si algo falló. A diferencia de los
// lints —que reportan y no fallan— acá el código de salida SÍ importa: una prueba que falla es un
// control roto, no un hallazgo del repo.
//
// Uso: node .claude/herramientas/ejecutar-pruebas/ejecutar-pruebas.js [rutaRepo]

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// El repo sale del directorio de trabajo (o del argumento), NUNCA de la ubicación de este script:
// en cuanto existe una segunda copia —un plugin, un marketplace bajado, otro repo instalado—
// deducirlo desde `__dirname` describe el repo equivocado, y no falla: contesta. Está asentado en
// el conocimiento `el-repo-que-un-script-describe`.
function resolverRepo(desde) {
  let d = path.resolve(desde);
  for (;;) {
    if (fs.existsSync(path.join(d, '.claude'))) return d;
    const padre = path.dirname(d);
    if (padre === d) return path.resolve(desde);   // no se encontró: se usa lo pedido tal cual
    d = padre;
  }
}

const REPO = resolverRepo(process.argv[2] || process.cwd());
const CLAUDE_DIR = path.join(REPO, '.claude');
const EXCLUDE = new Set(['.git', 'node_modules', 'tmp', '.respaldo-amp']);

function buscarPruebas(dir, out) {
  let entradas;
  try { entradas = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entradas) {
    if (EXCLUDE.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) buscarPruebas(full, out);
    else if (e.name === 'pruebas.js') out.push(full);
  }
  return out;
}

// Nombre legible: la carpeta que contiene la prueba dice qué se está probando.
const etiqueta = js => path.basename(path.dirname(js));

// Cuántos casos corrieron y cuántos fallaron, si la prueba lo dice. Es informativo: la autoridad
// sobre pasa/falla es el código de salida, no este parseo.
function resumirCasos(salida) {
  const total = /casos?:\s*(\d+)/i.exec(salida) || /\((\d+)\s+casos\)/i.exec(salida);
  const fallas = /(\d+)\s+(?:de\s+\d+\s+)?FALLA(?:RON|S)?/i.exec(salida);
  return { total: total ? Number(total[1]) : null, fallas: fallas ? Number(fallas[1]) : null };
}

const pruebas = buscarPruebas(CLAUDE_DIR, []).sort();

console.log('== PRUEBAS DE LOS CONTROLES: ' + REPO + ' ==');
if (!pruebas.length) {
  console.log('\nNo se encontró ninguna `pruebas.js` bajo .claude/.');
  console.log('Un control sin prueba no avisa cuando deja de controlar.');
  process.exit(0);
}
console.log('pruebas: ' + pruebas.length + '\n');

const resultados = [];
for (const js of pruebas) {
  const r = spawnSync(process.execPath, [js], { cwd: REPO, encoding: 'utf8', timeout: 180000 });
  const salida = (r.stdout || '') + (r.stderr || '');
  const { total, fallas } = resumirCasos(salida);
  let estado;
  if (r.error || r.status === null) estado = 'NO CORRIO';
  else if (r.status !== 0) estado = 'FALLA';
  else estado = 'OK';
  resultados.push({ nombre: etiqueta(js), estado, total, fallas, salida });
}

const ancho = Math.max(...resultados.map(r => r.nombre.length));
for (const r of resultados) {
  const detalle = r.estado === 'OK' && r.total ? `(${r.total} casos)`
                : r.estado === 'FALLA' && r.fallas ? `(${r.fallas} fallaron)` : '';
  console.log('  ' + r.nombre.padEnd(ancho) + '  ' + r.estado.padEnd(9) + ' ' + detalle);
}

const rojos = resultados.filter(r => r.estado !== 'OK');
if (!rojos.length) {
  console.log('\nTODO VERDE.');
  process.exit(0);
}
for (const r of rojos) {
  console.log('\n---- ' + r.nombre + ' (' + r.estado + ') ----');
  console.log(r.salida.trim());
}
console.log('\n' + rojos.length + ' prueba(s) fallaron: hay un control que dejó de controlar.');
process.exit(1);
