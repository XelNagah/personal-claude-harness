#!/usr/bin/env node
// Lint del ciclo de planes: carpeta<->registro, sueltos, resueltos sin mover, cierres a medias, focos envejecidos. Sin LLM, sin red.
// Uso: node lint-planes.js [<carpeta>] [--quiet] [--dias N]   (default: .claude/planes, N=30)
const fs = require('fs'), path = require('path');
const args = process.argv.slice(2);
const quiet = args.includes('--quiet');
const diasIdx = args.indexOf('--dias');
const MAX_DIAS = diasIdx >= 0 ? parseInt(args[diasIdx + 1], 10) : 30;
const root = path.resolve(args.find(a => !a.startsWith('--') && !/^\d+$/.test(a)) || '.claude/planes');
const CARPETAS = ['pendientes', 'ejecutados', 'descartados'];
const regPath = path.join(root, 'PLANES.md');
const reg = fs.existsSync(regPath) ? fs.readFileSync(regPath, 'utf8') : '';

// filas: | Plan | Prioridad | Estado | Creado | Cerrado | Origen | Notas |
const rows = [];
for (const line of reg.split('\n')) {
  const t = line.trim();
  if (!t.startsWith('|')) continue;
  const cells = t.split('|').slice(1, -1).map(c => c.trim());
  if (cells.length < 7) continue;
  const c0 = cells[0].replace(/[*\s]/g, '');
  if (/^:?-{2,}:?$/.test(c0) || /^plan$/i.test(c0)) continue;
  const m = /\]\(([^)]+?)\)/.exec(cells[0]);
  const ref = (m ? m[1] : cells[0].replace(/[`\[\]]/g, '')).trim();
  rows.push({ ref, prioridad: cells[1].toLowerCase(), estado: cells[2].toLowerCase(),
              creado: cells[3], cerrado: cells[4], notas: cells[6] });
}

const enDisco = new Map(); // rel -> carpeta
for (const c of CARPETAS) {
  const dir = path.join(root, c);
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir)) if (f.endsWith('.md')) enDisco.set(c + '/' + f, c);
}

const sueltos = fs.existsSync(root)
  ? fs.readdirSync(root, { withFileTypes: true })
      .filter(e => e.isFile() && e.name.endsWith('.md') && e.name !== 'PLANES.md').map(e => e.name)
  : [];

const norm = r => r.replace(/\\/g, '/').replace(/^\.\//, '');
const refs = new Set(rows.map(r => norm(r.ref)));
const sinFila = [...enDisco.keys()].filter(k => !refs.has(k));
const colgadas = [], estadoCarpeta = [], cierreAMedias = [], sinMotivo = [];
for (const r of rows) {
  const rel = norm(r.ref), carpeta = enDisco.get(rel);
  if (!carpeta) { colgadas.push(rel); continue; }
  const esEjec = /ejecutado/.test(r.estado), esDesc = /descartado|superseded/.test(r.estado);
  if (carpeta === 'ejecutados' && !esEjec) estadoCarpeta.push([rel, r.estado, carpeta]);
  if (carpeta === 'descartados' && !esDesc) estadoCarpeta.push([rel, r.estado, carpeta]);
  if (carpeta === 'pendientes' && (esEjec || esDesc)) estadoCarpeta.push([rel, r.estado, carpeta]);
  if (carpeta !== 'pendientes' && (!r.cerrado || r.cerrado === '—' || r.cerrado === '-')) cierreAMedias.push([rel, 'sin fecha Cerrado']);
  if (carpeta === 'descartados' && (!r.notas || r.notas === '—' || r.notas === '-')) sinMotivo.push(rel);
}

// contenido: pendientes con marcador de resolucion; ejecutados sin notas de implementacion
const resueltosSinMover = [], ejecSinNotas = [];
for (const [rel, carpeta] of enDisco) {
  const txt = fs.readFileSync(path.join(root, rel), 'utf8');
  if (carpeta === 'pendientes' && /(✅|RESUELTO|## Notas de implementación)/i.test(txt)) resueltosSinMover.push(rel);
  if (carpeta === 'ejecutados' && !/## Notas de implementación/i.test(txt)) ejecSinNotas.push(rel);
}

// focos envejecidos (solo pendientes con prioridad foco)
const viejos = [];
const hoy = Date.now();
for (const r of rows) {
  if (enDisco.get(norm(r.ref)) !== 'pendientes' || !/foco/.test(r.prioridad)) continue;
  const m = /^(\d{2})-(\d{2})-(\d{2})$/.exec(r.creado);
  if (!m) continue;
  const dias = Math.floor((hoy - Date.parse(`20${m[1]}-${m[2]}-${m[3]}`)) / 86400000);
  if (dias > MAX_DIAS) viejos.push([norm(r.ref), dias]);
}

const secciones = [
  ['SUELTOS EN LA RAIZ (mover a una carpeta del ciclo)', sueltos],
  ['ARCHIVOS SIN FILA EN PLANES.md', sinFila],
  ['FILAS COLGADAS (archivo no existe)', colgadas],
  ['ESTADO vs CARPETA INCONSISTENTE', estadoCarpeta.map(([r, e, c]) => `${r}  estado="${e}" en ${c}/`)],
  ['PENDIENTES CON MARCADOR DE RESUELTO (¿mover a ejecutados?)', resueltosSinMover],
  ['CIERRES A MEDIAS', cierreAMedias.map(([r, w]) => `${r}  [${w}]`)],
  ['DESCARTADOS SIN MOTIVO', sinMotivo],
  ['EJECUTADOS SIN "## Notas de implementación"', ejecSinNotas],
  [`FOCOS ENVEJECIDOS (> ${MAX_DIAS} dias: ¿sigue/estacionado/descartado?)`, viejos.map(([r, d]) => `${r}  (${d} dias)`)],
];
const total = secciones.reduce((n, [, items]) => n + items.length, 0);
if (quiet && total === 0) process.exit(0);
console.log(`== LINT PLANES: ${root} ==`);
console.log(`filas en registro: ${rows.length} | archivos en ciclo: ${enDisco.size} | hallazgos: ${total}\n`);
for (const [titulo, items] of secciones) {
  if (quiet && !items.length) continue;
  console.log(`[${titulo}] (${items.length})`);
  items.forEach(i => console.log(`    ${i}`));
  if (!quiet && !items.length) console.log('    (ninguno)');
}
