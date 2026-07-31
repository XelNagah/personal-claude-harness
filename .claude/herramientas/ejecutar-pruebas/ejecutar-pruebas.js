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
// Descubre las pruebas: cualquier `pruebas.js` co-ubicado con lo que prueba (misma convención que
// los lints, decisión Local-0008), bajo `.claude/` y bajo `funcionalidades/`. No hay lista que
// mantener.
//
// `funcionalidades/` entra porque ahí vive código propio que ningún otro barrido alcanza —hoy
// `amp-actualizar.js`, el motor del nivelador—, y un banco que no se corre es lo mismo que no
// tenerlo. Lo que se excluye de esa rama es `base/`: sus `pruebas.js` son COPIAS de las de
// `.claude/`, que ya corren acá, y `lint-harness` compara los dos lados en ambos sentidos. Correrlas
// de nuevo no controla nada nuevo — solo infla el número que este corredor informa, y un número
// inflado de duplicados es la forma en que un tablero deja de leerse.
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
const EXCLUDE = new Set(['.git', 'node_modules', 'tmp', '.respaldo-amp']);

// Las dos raíces que se barren, cada una con lo que excluye. Lo excluido va por RUTA y no por
// nombre a propósito: excluir la palabra `base` apagaría en silencio cualquier otra carpeta que
// llegara a llamarse así, y un banco que deja de correrse sin avisar es justo lo que este corredor
// existe para que no pase. Con la ruta, mover el árbol que viaja hace reaparecer los duplicados
// —visible en el conteo— en vez de dejar algo sin mirar.
const RAICES = [
  { dir: '.claude', excluir: [] },
  { dir: 'funcionalidades', excluir: ['funcionalidades/amp/skills/inicializar/base'] },
];

const relativa = dir => path.relative(REPO, dir).split(path.sep).join('/');

function buscarPruebas(dir, excluir, out) {
  if (excluir.includes(relativa(dir))) return out;
  let entradas;
  try { entradas = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entradas) {
    if (EXCLUDE.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) buscarPruebas(full, excluir, out);
    else if (e.name === 'pruebas.js') out.push(full);
  }
  return out;
}

// Nombre legible: lo dice el script que la prueba acompaña, y si no se puede saber, la carpeta que
// la contiene. Para un lint las dos formas coinciden (`lint-planes/lint-planes.js`); donde no
// coinciden es en `funcionalidades/`, y ahí la carpeta sola diría «actualizar», que no nombra nada.
function etiqueta(js) {
  const dir = path.dirname(js);
  const hermanos = fs.readdirSync(dir).filter(n => n.endsWith('.js') && n !== 'pruebas.js');
  return hermanos.length === 1 ? path.basename(hermanos[0], '.js') : path.basename(dir);
}

// Cuántos casos corrieron y cuántos fallaron, si la prueba lo dice. Es informativo: la autoridad
// sobre pasa/falla es el código de salida, no este parseo.
function resumirCasos(salida) {
  const total = /casos?:\s*(\d+)/i.exec(salida) || /\((\d+)\s+casos\)/i.exec(salida);
  const fallas = /(\d+)\s+(?:de\s+\d+\s+)?FALLA(?:RON|S)?/i.exec(salida);
  return { total: total ? Number(total[1]) : null, fallas: fallas ? Number(fallas[1]) : null };
}

const pruebas = RAICES
  .flatMap(r => buscarPruebas(path.join(REPO, r.dir), r.excluir, []))
  .sort();

console.log('== PRUEBAS DE LOS CONTROLES: ' + REPO + ' ==');

// Una exclusión que apunta a una carpeta que ya no está dejó de excluir algo, y eso se nota en el
// conteo pero no dice por qué. Se avisa solo cuando la raíz existe: un Agente Desplegado no tiene
// `funcionalidades/` y ahí no hay nada que reportar.
for (const r of RAICES) {
  if (!fs.existsSync(path.join(REPO, r.dir))) continue;
  for (const e of r.excluir) {
    if (!fs.existsSync(path.join(REPO, e)))
      console.log('aviso: la exclusión `' + e + '` ya no existe — revisar si se movió.');
  }
}
if (!pruebas.length) {
  console.log('\nNo se encontró ninguna `pruebas.js` bajo ' + RAICES.map(r => r.dir + '/').join(' ni ') + '.');
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
