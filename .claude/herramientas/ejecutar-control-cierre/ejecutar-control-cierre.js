#!/usr/bin/env node
// ejecutar-control-cierre.js — corre de una pasada todos los chequeos del repo:
// cada lint-*.js de los subsistemas (descubiertos, no hardcodeados) + `claude plugin validate .`.
// Reporta por chequeo (OK / N hallazgos / ERROR) y muestra la salida completa solo de lo que no está verde.
//
// DOS MODOS, y el predeterminado es el informativo: reporta y sale con 0 aunque haya rojos, porque
// describe el estado del repo y no un error de la corrida. De eso depende la Pantalla de bienvenida,
// que lo invoca en cada arranque de sesion y lee los totales `(N)` de la salida, no el codigo.
// Con `--estricto` sale con 1 si algun chequeo no esta verde, para el guion que tiene que frenar.
// ⚠️ El «nunca falla» NO sale de la decision Local-0003, aunque este comentario lo afirmo hasta el
// 13/08/2026: esa decision fija que la capa mecanica es obligatoria para todo subsistema que
// persiste estado, y no dice nada de codigos de salida. Sale del rol de esta Herramienta, arriba.

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// -- argumentos: banderas primero, y despues la ruta opcional del repo --
// Una bandera mal escrita corta acá en vez de ignorarse: `--estrico` corriendo silenciosamente en
// modo informativo le daria verde a un guion que cree estar en estricto, que es exactamente un
// control que deja de controlar sin avisar (conocimiento `controles-que-no-avisan`).
const ARGS = process.argv.slice(2);
const DESCONOCIDAS = ARGS.filter(a => a.startsWith('-') && a !== '--estricto');
if (DESCONOCIDAS.length) {
  console.error('bandera desconocida: ' + DESCONOCIDAS.join(', '));
  console.error('uso: node ejecutar-control-cierre.js [--estricto] [rutaRepo]');
  process.exit(2);
}
const ESTRICTO = ARGS.includes('--estricto');

// El repo sale del directorio de trabajo (o del argumento), NUNCA de la ubicacion de este script:
// en cuanto hay una segunda copia deducirlo desde __dirname corre los chequeos del repo equivocado,
// y no falla — contesta. Conocimiento `el-repo-que-un-script-describe`.
const REPO = (desde => {
  let d = path.resolve(desde);
  for (;;) {
    if (fs.existsSync(path.join(d, '.claude'))) return d;
    const padre = path.dirname(d);
    if (padre === d) return path.resolve(desde);
    d = padre;
  }
})(ARGS.find(a => !a.startsWith('-')) || process.cwd());
const CLAUDE_DIR = path.join(REPO, '.claude');
const EXCLUDE = new Set(['.git', 'node_modules', 'tmp']);

// -- descubrir lints: todo .claude/**/lint-*/lint-*.js --
function findLints(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDE.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (/^lint-/.test(entry.name)) {
        const js = path.join(full, entry.name + '.js');
        if (fs.existsSync(js)) out.push(js);
        continue; // no descender dentro de una carpeta de lint
      }
      findLints(full, out);
    }
  }
  return out;
}

// -- heuristica de hallazgos: lineas de categoria que terminan en "(N)" o "(N):" --
function countFindings(output) {
  let total = 0;
  for (const line of output.split(/\r?\n/)) {
    const m = line.match(/\((\d+)\):?\s*$/);
    if (m) total += parseInt(m[1], 10);
  }
  return total;
}

const results = [];

for (const js of findLints(CLAUDE_DIR, []).sort()) {
  const name = path.basename(js, '.js');
  const r = spawnSync('node', [js], { cwd: REPO, encoding: 'utf8', timeout: 60000 });
  const output = (r.stdout || '') + (r.stderr || '');
  if (r.status !== 0 || r.error) {
    results.push({ name, status: 'ERROR', findings: null, output });
  } else {
    const findings = countFindings(output);
    results.push({ name, status: findings === 0 ? 'OK' : 'HALLAZGOS', findings, output });
  }
}

// -- las pruebas de los controles del repo --
// El corredor `ejecutar-pruebas` descubre los `pruebas.js` co-ubicados con lo que prueban y los
// corre. Sin este chequeo, este control declaraba el repo verde mirando SOLO los lints: un banco en
// rojo —el del actualizador, con un control suyo roto— no aparecia por ningun lado, y el verde de
// acá significaba menos de lo que parecia. Se descubrio corriendo el corredor a mano el 11/08/2026,
// despues de que este control diera «TODO VERDE» sobre ese banco fallando.
//
// No se pisa con el bloque de abajo: el corredor excluye su propio banco (correrlo desde adentro es
// el manual de su propio modo de falla), asi que cada uno corre lo que el otro no puede.
//
// Esto es una PRUEBA, no un lint, y el contrato es distinto: falla con codigo 1 —tambien si no
// encuentra ningun banco— y este control lo REPORTA como un chequeo mas, sin fallar el.
{
  const corredor = path.join(CLAUDE_DIR, 'herramientas', 'ejecutar-pruebas', 'ejecutar-pruebas.js');
  const name = 'pruebas de los controles';
  if (!fs.existsSync(corredor)) {
    results.push({ name, status: 'AUSENTE', findings: null, output: 'no existe ' + corredor });
  } else {
    const r = spawnSync('node', [corredor], { cwd: REPO, encoding: 'utf8', timeout: 300000 });
    const output = (r.stdout || '') + (r.stderr || '');
    if (r.error || r.status === null) results.push({ name, status: 'NO CORRIO', findings: null, output });
    else if (r.status !== 0) results.push({ name, status: 'FALLA', findings: null, output });
    else results.push({ name, status: 'OK', findings: 0, output });
  }
}

// -- el banco de `ejecutar-pruebas`, que su propio corredor no puede correr --
// `ejecutar-pruebas` declara verdes a todos los demas controles, asi que su modo de falla es
// informar «TODO VERDE» sobre cero bancos si el descubrimiento se rompe. Su banco no puede correrlo
// el: un descubrimiento roto tampoco encontraria ese archivo. Lo corre esta Herramienta, que es
// otra, y asi la circularidad desaparece sin un piso numerico que envejece.
//
// Esto es una PRUEBA, no un lint, y el contrato es distinto: la prueba falla con codigo 1 y este
// control lo REPORTA como un chequeo mas, sin fallar el (misma forma que `plugin validate`).
{
  const banco = path.join(CLAUDE_DIR, 'herramientas', 'ejecutar-pruebas', 'pruebas.js');
  const name = 'banco de ejecutar-pruebas';
  if (!fs.existsSync(banco)) {
    // Que el archivo no este es exactamente el estado que este chequeo viene a cerrar, asi que se
    // reporta en vez de saltearse en silencio.
    results.push({ name, status: 'AUSENTE', findings: null, output: 'no existe ' + banco });
  } else {
    const r = spawnSync('node', [banco], { cwd: REPO, encoding: 'utf8', timeout: 180000 });
    const output = (r.stdout || '') + (r.stderr || '');
    if (r.error || r.status === null) results.push({ name, status: 'NO CORRIO', findings: null, output });
    else if (r.status !== 0) results.push({ name, status: 'FALLA', findings: null, output });
    else results.push({ name, status: 'OK', findings: 0, output });
  }
}

// -- claude plugin validate . --
{
  const r = spawnSync('claude plugin validate .', {
    cwd: REPO, encoding: 'utf8', timeout: 120000, shell: true,
  });
  const output = (r.stdout || '') + (r.stderr || '');
  if (r.error || r.status === null) {
    results.push({ name: 'plugin validate', status: 'NO DISPONIBLE', findings: null, output });
  } else if (r.status !== 0) {
    results.push({ name: 'plugin validate', status: 'ERROR', findings: null, output });
  } else {
    results.push({ name: 'plugin validate', status: 'OK', findings: 0, output });
  }
}

// -- reporte --
console.log('== CONTROL DE CIERRE: ' + REPO + ' ==');
console.log('chequeos: ' + results.length + '\n');

const width = Math.max(...results.map(r => r.name.length));
for (const r of results) {
  const label = r.status === 'HALLAZGOS' ? r.findings + ' HALLAZGO(S)' : r.status;
  console.log('  ' + r.name.padEnd(width) + '  ' + label);
}

const rojos = results.filter(r => r.status !== 'OK');
if (rojos.length === 0) {
  console.log('\nTODO VERDE.');
} else {
  for (const r of rojos) {
    console.log('\n---- ' + r.name + ' (' + r.status + ') ----');
    console.log(r.output.trim());
  }
  console.log('\n' + rojos.length + ' chequeo(s) requieren atencion.');
}

// -- salida --
// El modo estricto es lo unico que cambia el codigo: el reporte de arriba es identico en los dos, y
// sin la bandera se sale con 0 pase lo que pase. Se anuncia el modo para que la corrida diga con
// que criterio esta contestando, y no haya que deducirlo del codigo de salida.
if (ESTRICTO) {
  console.log('modo estricto: ' + (rojos.length ? 'sale con codigo 1.' : 'sale con codigo 0.'));
  if (rojos.length) process.exit(1);
}
