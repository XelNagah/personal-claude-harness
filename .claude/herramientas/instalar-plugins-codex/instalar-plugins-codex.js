#!/usr/bin/env node
// Instala un bundle de plugins en Codex CLI resolviendo dependencies que Codex no resuelve.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const args = process.argv.slice(2);
const aplicar = args.includes('--aplicar');
const valor = flag => { const i = args.indexOf(flag); return i < 0 ? null : args[i + 1]; };
const marketplace = valor('--marketplace') || 'xelnagah-harness';
const raiz = path.resolve(valor('--fuente') || path.join(__dirname, '..', '..', '..'));
const principal = valor('--plugin') || 'amp';
const catalogo = JSON.parse(fs.readFileSync(path.join(raiz, '.claude-plugin', 'marketplace.json'), 'utf8'));
const porNombre = new Map(catalogo.plugins.map(p => [p.name, p]));
const orden = [], vistos = new Set();
function visitar(nombre) {
  if (vistos.has(nombre)) return;
  const fila = porNombre.get(nombre);
  if (!fila) throw new Error(`Plugin ausente del marketplace: ${nombre}`);
  vistos.add(nombre);
  const manifest = JSON.parse(fs.readFileSync(path.join(raiz, fila.source, '.claude-plugin', 'plugin.json'), 'utf8'));
  for (const dep of manifest.dependencies || []) visitar(dep);
  orden.push(nombre);
}
visitar(principal);
console.log(`== BUNDLE CODEX: ${principal}@${marketplace} ==`);
console.log(`orden: ${orden.join(' -> ')}`);
if (!aplicar) {
  console.log('\nVista previa. Para instalar:');
  console.log(`  node ${JSON.stringify(process.argv[1])} --aplicar`);
  process.exit(0);
}
for (const nombre of orden) {
  console.log(`\n> codex plugin add ${nombre}@${marketplace}`);
  const r = spawnSync('codex', ['plugin', 'add', `${nombre}@${marketplace}`], { cwd: process.cwd(), encoding: 'utf8', shell: process.platform === 'win32' });
  process.stdout.write(r.stdout || ''); process.stderr.write(r.stderr || '');
  if (r.status !== 0) process.exit(r.status || 1);
}
console.log('\nInstalación completa. Iniciá una sesión nueva de Codex para cargar los plugins.');
