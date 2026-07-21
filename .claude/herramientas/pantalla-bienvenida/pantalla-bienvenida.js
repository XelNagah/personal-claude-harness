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
//   node .claude/herramientas/pantalla-bienvenida/pantalla-bienvenida.js            (a mano / skill /info: caja en cerca de código)
//   node .claude/herramientas/pantalla-bienvenida/pantalla-bienvenida.js --sin-lint (rápido, sin correr lints)
//   node .claude/herramientas/pantalla-bienvenida/pantalla-bienvenida.js --hook     (para el SessionStart hook: emite JSON {"systemMessage": <caja>} → visible al usuario)
// Pensado también para un hook SessionStart. Sin process.exit(1): informa, no falla.
//
// Por qué --hook: el stdout crudo de un SessionStart hook va a `additionalContext` (lo ve
// el modelo, NO el usuario). El único campo que se pinta en la terminal del usuario es
// `systemMessage`. Con --hook se emite ese JSON, sin cerca de código (los backticks saldrían
// literales). Sin --hook, la caja va con cerca ``` para conservar monospace en el transcript.

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const REPO = path.resolve(__dirname, '..', '..', '..');
const CLAUDE_DIR = path.join(REPO, '.claude');
const SIN_LINT = process.argv.slice(2).includes('--sin-lint');
const HOOK = process.argv.slice(2).includes('--hook');

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
// Planes: agrupa por CARPETA (pendientes/ejecutados/descartados), no por estado suelto.
// La agrupación sale de ESTADOS.md (fuente de verdad configurable, decisión 0005): cada
// estado mapea a una carpeta, y los tres estados vivos caen todos en `pendientes`. Así el
// juego de estados se puede reconfigurar por repo sin tocar este script. La suma de las
// carpetas = total de planes (Pendientes + Ejecutados + Descartados = Total).
function detallePlanes(txt, estadosTxt) {
  // Estado → carpeta desde ESTADOS.md (col. Estado | Sentido | Carpeta | Terminal).
  const estadoCarpeta = {};   // 'nuevo' → 'pendientes'
  const orden = [];           // orden de aparición de carpetas: pendientes, ejecutados, descartados
  for (const l of (estadosTxt || '').split(/\r?\n/)) {
    if (!l.trim().startsWith('|')) continue;
    const c = l.split('|').slice(1, -1).map(x => x.trim());
    if (c.length < 3) continue;
    const est = c[0];
    const carpeta = c[2].replace(/`/g, '').replace(/\/+\s*$/, '').trim();
    if (/^-{2,}$/.test(est) || /^estado$/i.test(est) || !carpeta || /^carpeta$/i.test(carpeta)) continue;
    estadoCarpeta[est.toLowerCase()] = carpeta;
    if (!orden.includes(carpeta)) orden.push(carpeta);
  }
  // Contar filas de PLANES.md, tallando por carpeta del estado.
  const cont = {};
  for (const l of txt.split(/\r?\n/)) {
    if (!l.trim().startsWith('|')) continue;
    const c = l.split('|').slice(1, -1).map(x => x.trim());
    if (c.length < 2) continue;
    const est = c[1];
    if (/^-{2,}$/.test(est) || /^estado$/i.test(est)) continue;
    const carp = estadoCarpeta[est.toLowerCase()];
    if (carp) cont[carp] = (cont[carp] || 0) + 1;
  }
  if (!orden.length) return ''; // sin ESTADOS.md legible: degradar sin romper
  const partes = orden.map(carp => `${cont[carp] || 0} ${carp}`);
  return `(${partes.join(' · ')})`;
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
  if (s.nombre === 'planes') extra = detallePlanes(txt, leer(path.join(s.dir, 'ESTADOS.md')));
  if (s.nombre === 'preferencias') { extra = detallePreferencias(txt); cuenta = null; }
  let lint = { estado: 'n/d', hallazgos: null };
  if (!SIN_LINT) {
    lint = correrLint(s.lint);
    if (typeof lint.hallazgos === 'number') hallazgosTotal += lint.hallazgos;
    if (lint.estado === 'error') lintPeor = 'error';
    else if (lint.estado === 'hallazgos' && lintPeor !== 'error') lintPeor = 'hallazgos';
  }
  // En planes el `extra` ya trae los sustantivos (pendientes/ejecutados/descartados):
  // el sustantivo "planes" sería redundante y desborda el marco → se omite (queda "34 (…)").
  const sustantivo = s.nombre === 'planes' ? '' : (SUSTANTIVO[s.nombre] || 'entradas');
  filas.push({ nombre: s.nombre, cuenta, extra, sustantivo, lint });
}

// --- render ---
const { titulo, proposito } = leerIdentidad();
const lintGlobal = SIN_LINT ? '(sin correr)'
  : lintPeor === 'error' ? '✖ error en algún lint'
  : hallazgosTotal === 0 ? '✔ 0 hallazgos'
  : `⚠ ${hallazgosTotal} hallazgo${hallazgosTotal === 1 ? '' : 's'}`;

// Caja de ANCHO AUTOMÁTICO: se dimensiona sola al renglón más largo, así nunca se
// desarma cuando una métrica gana dígitos (planes 9 → 99 → 999). Las líneas largas
// (Propósito) se envuelven a un techo `WRAP`; el ancho final = el renglón más largo,
// con un piso `MIN` para que no quede angosta. Envuelta en cerca de código (```) para
// el transcript de un cliente no-terminal (skill /info); en --hook va como systemMessage.
const WRAP = 82;                                // techo de envoltura para texto largo
const MIN = 74;                                 // piso de ancho interno
const nfc = s => (s || '').normalize('NFC');    // acentos precompuestos → .length correcto
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
// Renglón de marca: va sin etiqueta a propósito. Es la identidad del harness, constante
// en todo repo; ponerle prefijo lo degradaría a un campo más entre los de abajo.
cuerpo.push('Agente Multipropósito');
cuerpo.push('');  // aire: despega la identidad de los campos del repo
cuerpo.push(...envolver('Título: ' + titulo, WRAP, '   '));
cuerpo.push(...envolver('Propósito: ' + proposito, WRAP, '   '));
cuerpo.push('__SEP__');
cuerpo.push(`Subsistemas: ${subs.length}      Lint: ${lintGlobal}`);
const anchoNom = Math.max(...filas.map(f => f.nombre.length), 0);
for (const f of filas) {
  const marca = (f.lint.estado === 'ok' || f.lint.estado === 'n/d') ? ' ' : '⚠';
  const val = f.cuenta === null ? f.extra : `${f.cuenta}${f.sustantivo ? ' ' + f.sustantivo : ''}${f.extra ? ' ' + f.extra : ''}`;
  cuerpo.push(`${marca} · ${f.nombre.padEnd(anchoNom)}   ${val}`);
}

// Ancho interno = el renglón más largo (piso MIN). Cada línea se rellena a ese ancho.
const W = Math.max(MIN, ...cuerpo.filter(l => l !== '__SEP__').map(l => nfc(l).length));
const regla = (l, mid, r) => l + mid.repeat(W + 2) + r;
const caja = s => {
  const t = nfc(s);
  return '║ ' + t + ' '.repeat(Math.max(0, W - t.length)) + ' ║';
};

const boxLines = [regla('╔', '═', '╗')];
for (const linea of cuerpo) boxLines.push(linea === '__SEP__' ? regla('╟', '─', '╢') : caja(linea));
boxLines.push(regla('╚', '═', '╝'));
const box = boxLines.join('\n');

// --hook: emitir JSON {"systemMessage": <caja>} → único campo que la terminal del usuario
// pinta en SessionStart (sin cerca ```: los backticks saldrían literales). Sin --hook:
// caja envuelta en cerca de código para el transcript (skill /info + corridas a mano).
if (HOOK) {
  // Salto inicial: separa la caja del prefijo "SessionStart:… says:" que antepone el CLI.
  process.stdout.write(JSON.stringify({ systemMessage: '\n' + box }));
} else {
  process.stdout.write('```\n' + box + '\n```\n');
}
