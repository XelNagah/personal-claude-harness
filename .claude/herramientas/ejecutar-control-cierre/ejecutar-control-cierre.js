#!/usr/bin/env node
// ejecutar-control-cierre.js — corre de una pasada todos los chequeos del repo:
// cada lint-*.js de los subsistemas (descubiertos, no hardcodeados) + `claude plugin validate .`.
// Reporta por chequeo (OK / N hallazgos / ERROR) y muestra la salida completa solo de lo que no está verde.
// Sin process.exit(1): reporta, no falla (decision 0003, capa mecanica).

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const REPO = path.resolve(__dirname, '..', '..', '..');
const CLAUDE_DIR = path.join(REPO, '.claude');
const EXCLUDE = new Set(['.git', 'node_modules']);

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
