#!/usr/bin/env node
// pantalla-bienvenida.js — Pantalla de bienvenida del Agente Multipropósito (glosario).
// Emite al arrancar un bloque de estado: Título + Propósito (de la Identidad) + métricas
// de cada subsistema (entradas) + estado de lint. Bloque de texto para el transcript
// (no un banner del CLI: SessionStart no tiene punto de extensión para eso).
//
// Agregación por DESCUBRIMIENTO DINÁMICO (Postura 2): un subsistema es un dir hijo de
// `.claude/` que tiene su lint co-ubicado `.claude/<D>/lint-<D>/lint-<D>.js` (decisión 0008).
// Sumar un subsistema con su lint lo hace aparecer solo, sin editar este script.
//
// Uso:
//   node .claude/herramientas/pantalla-bienvenida/pantalla-bienvenida.js            (a mano)
//   node .claude/herramientas/pantalla-bienvenida/pantalla-bienvenida.js --sin-lint (rápido, sin correr lints)
// Pensado también para un hook SessionStart. Sin process.exit(1): informa, no falla.

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const REPO = path.resolve(__dirname, '..', '..', '..');
const CLAUDE_DIR = path.join(REPO, '.claude');
const SIN_LINT = process.argv.slice(2).includes('--sin-lint');

// Sustantivo cosmético por subsistema conocido; los desconocidos caen a "entradas".
// (Solo afecta la etiqueta, no el conteo: el descubrimiento sigue siendo dinámico.)
const SUSTANTIVO = {
  memoria: 'memorias', glosario: 'términos', decisiones: 'decisiones',
  herramientas: 'herramientas', planes: 'planes', conocimiento: 'páginas',
  preferencias: 'preferencias',
};
// Archivo de índice del subsistema, por prioridad (nombres no uniformes entre subsistemas).
const INDICES = ['INDICE.md', 'MEMORIA.md', 'PLANES.md', 'PREFERENCIAS.md'];

function existe(p) { try { return fs.existsSync(p); } catch { return false; } }
function leer(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } }

// --- descubrir subsistemas: dir hijo de .claude con lint co-ubicado ---
function descubrirSubsistemas() {
  const out = [];
  if (!existe(CLAUDE_DIR)) return out;
  for (const e of fs.readdirSync(CLAUDE_DIR, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const lint = path.join(CLAUDE_DIR, e.name, 'lint-' + e.name, 'lint-' + e.name + '.js');
    if (existe(lint)) out.push({ nombre: e.name, dir: path.join(CLAUDE_DIR, e.name), lint });
  }
  return out.sort((a, b) => a.nombre.localeCompare(b.nombre));
}

// --- índice del subsistema ---
function indiceDe(dir) {
  for (const cand of INDICES) {
    const p = path.join(dir, cand);
    if (existe(p)) return p;
  }
  return null;
}

// --- conteo genérico de entradas: filas de tabla, si no hay tabla, bullets con link ---
function contarEntradas(txt) {
  const lineas = txt.split(/\r?\n/);
  const pipe = lineas.filter(l => l.trim().startsWith('|'));
  const sep = pipe.filter(l => /^\s*\|[\s:|-]+\|\s*$/.test(l)); // separadores |---|
  if (sep.length) return pipe.length - sep.length - sep.length; // -headers -separadores
  const bullets = lineas.filter(l => /^\s*[-*]\s+\[/.test(l));  // - [texto](link)
  return bullets.length;
}

// --- enriquecimientos baratos por subsistema conocido ---
function detallePlanes(txt) {
  const vivos = {};
  for (const l of txt.split(/\r?\n/)) {
    if (!l.trim().startsWith('|')) continue;
    const c = l.split('|').slice(1, -1).map(x => x.trim());
    if (c.length < 2) continue;
    const est = c[1];
    if (/^-{2,}$/.test(est) || /^estado$/i.test(est)) continue;
    if (/^(nuevo|en curso|diferido)$/i.test(est)) vivos[est] = (vivos[est] || 0) + 1;
  }
  const partes = Object.entries(vivos).map(([e, n]) => `${n} ${e.toLowerCase()}`);
  return partes.length ? `(${partes.join(' · ')})` : '';
}
function detallePreferencias(txt) {
  const v = (txt.match(/harness\s+v(\d+)/i) || [])[1];
  const m = txt.split(/##\s+Adaptaciones/i);
  let adapt = 0;
  if (m[1]) adapt = (m[1].split(/\r?\n/).filter(l => /^\s*[-*]\s+\S/.test(l))).length;
  return `Base${v ? ' v' + v : ''} · ${adapt} adaptaci${adapt === 1 ? 'ón' : 'ones'}`;
}

// --- correr el lint del subsistema y contar hallazgos (misma heurística que control-cierre) ---
function contarHallazgos(salida) {
  let t = 0;
  for (const l of salida.split(/\r?\n/)) {
    const m = l.match(/\((\d+)\):?\s*$/);
    if (m) t += parseInt(m[1], 10);
  }
  return t;
}
function correrLint(lintPath) {
  // Sin --quiet: el flag da exit ≠ 0 en algunos lints artesanales (bug de divergencia).
  // Igual que control-cierre: leer los totales `(N)` de la salida, no confiar en el exit.
  const r = spawnSync('node', [lintPath], { cwd: REPO, encoding: 'utf8', timeout: 15000 });
  if (r.error || r.status === null) return { estado: 'n/d', hallazgos: null };
  const salida = (r.stdout || '') + (r.stderr || '');
  const h = contarHallazgos(salida);
  return { estado: r.status !== 0 ? 'error' : (h === 0 ? 'ok' : 'hallazgos'), hallazgos: h };
}

// --- Identidad del Agente: Título + Propósito (tolerante a indefinido) ---
function leerIdentidad() {
  const p = path.join(CLAUDE_DIR, 'identidad.md');
  const txt = leer(p);
  const SIN = '<sin definir>';
  if (!txt.trim()) return { titulo: SIN, proposito: SIN };
  const titulo = (txt.match(/^#\s+(.+)$/m) || [])[1] || SIN;
  const proposito = (txt.match(/^[*\s>]*Prop[óo]sito[*\s]*:\s*(.+)$/mi) || [])[1] || SIN;
  return { titulo: titulo.trim(), proposito: proposito.trim() };
}

// --- construir métricas ---
const subs = descubrirSubsistemas();
const filas = [];
let hallazgosTotal = 0, lintPeor = 'ok';
for (const s of subs) {
  const idx = indiceDe(s.dir);
  const txt = idx ? leer(idx) : '';
  let cuenta = idx ? contarEntradas(txt) : 0;
  let extra = '';
  if (s.nombre === 'planes') extra = detallePlanes(txt);
  if (s.nombre === 'preferencias') { extra = detallePreferencias(txt); cuenta = null; }
  let lint = { estado: 'n/d', hallazgos: null };
  if (!SIN_LINT) {
    lint = correrLint(s.lint);
    if (typeof lint.hallazgos === 'number') hallazgosTotal += lint.hallazgos;
    if (lint.estado === 'error') lintPeor = 'error';
    else if (lint.estado === 'hallazgos' && lintPeor !== 'error') lintPeor = 'hallazgos';
  }
  filas.push({ nombre: s.nombre, cuenta, extra, sustantivo: SUSTANTIVO[s.nombre] || 'entradas', lint });
}

// --- render ---
const { titulo, proposito } = leerIdentidad();
const lintGlobal = SIN_LINT ? '(sin correr)'
  : lintPeor === 'error' ? '✖ error en algún lint'
  : hallazgosTotal === 0 ? '✔ 0 hallazgos'
  : `⚠ ${hallazgosTotal} hallazgo${hallazgosTotal === 1 ? '' : 's'}`;

// Caja de ancho fijo con envoltura: las líneas largas (Propósito) pasan a varios
// renglones sin desbordar el marco. Envuelto en cerca de código (```) para que
// sobreviva monospace en el transcript de un cliente que no es terminal.
const W = 70;                                   // ancho interno (chars entre los bordes)
const nfc = s => (s || '').normalize('NFC');    // acentos precompuestos → .length correcto
const regla = (l, mid, r) => l + mid.repeat(W + 2) + r;
const caja = s => {
  const t = nfc(s);
  return '║ ' + t + ' '.repeat(Math.max(0, W - t.length)) + ' ║';
};
function envolver(texto, ancho, cont) {
  const palabras = nfc(texto).split(/\s+/).filter(Boolean);
  const out = [];
  let linea = '';
  for (const p of palabras) {
    const cand = linea ? linea + ' ' + p : p;
    if (cand.length > ancho && linea) { out.push(linea); linea = cont + p; }
    else linea = cand;
  }
  if (linea) out.push(linea);
  return out;
}

const cuerpo = [];
cuerpo.push('Agente Multipropósito');
cuerpo.push(...envolver(titulo, W, '  '));
cuerpo.push(...envolver('Propósito: ' + proposito, W, '   '));
cuerpo.push('__SEP__');
cuerpo.push(`Subsistemas: ${subs.length}      Lint: ${lintGlobal}`);
const anchoNom = Math.max(...filas.map(f => f.nombre.length), 0);
for (const f of filas) {
  const marca = (f.lint.estado === 'ok' || f.lint.estado === 'n/d') ? ' ' : '⚠';
  const val = f.cuenta === null ? f.extra : `${f.cuenta} ${f.sustantivo}${f.extra ? ' ' + f.extra : ''}`;
  cuerpo.push(`${marca} · ${f.nombre.padEnd(anchoNom)}   ${val}`);
}

const L = ['```'];
L.push(regla('╔', '═', '╗'));
for (const linea of cuerpo) L.push(linea === '__SEP__' ? regla('╟', '─', '╢') : caja(linea));
L.push(regla('╚', '═', '╝'));
L.push('```');

process.stdout.write(L.join('\n') + '\n');
