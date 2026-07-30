#!/usr/bin/env node
// mostrar-pantalla-bienvenida.js — Pantalla de bienvenida del Agente Multipropósito (glosario).
// Emite al arrancar un bloque de estado: Título + Propósito (de la Identidad) + métricas
// de cada subsistema (entradas) + estado de lint. Bloque de texto para el transcript
// (no un banner del CLI: SessionStart no tiene punto de extensión para eso).
//
// Agregación por DESCUBRIMIENTO DINÁMICO (Postura 2): un subsistema es un dir hijo de
// `.claude/` que tiene su lint co-ubicado `.claude/<D>/lint-<D>/lint-<D>.js`.
// Sumar un subsistema con su lint lo hace aparecer solo, sin editar este script.
//
// Co-ubicado con el subsistema `conducta`: la Pantalla de bienvenida es una Regla Base clase
// `correr` del momento `al arrancar la sesión`, no una Herramienta. La corre el hook repartidor
// `establecer-conducta` (que reenvía su stdout) y la skill `amp:info` a demanda.
// Uso:
//   node .claude/conducta/mostrar-pantalla-bienvenida/mostrar-pantalla-bienvenida.js            (a mano / skill amp:info: caja en cerca de código)
//   node .claude/conducta/mostrar-pantalla-bienvenida/mostrar-pantalla-bienvenida.js --sin-lint (rápido, sin correr lints)
//   node .claude/conducta/mostrar-pantalla-bienvenida/mostrar-pantalla-bienvenida.js --hook     (para el SessionStart hook: emite JSON {"systemMessage": <caja>} → visible al usuario)
// Sin process.exit(1): informa, no falla.
//
// Por qué --hook: el stdout crudo de un SessionStart hook va a `additionalContext` (lo ve
// el modelo, NO el usuario). El único campo que se muestra en la terminal del usuario es
// `systemMessage`. Con --hook se emite ese JSON, sin cerca de código (los backticks saldrían
// literales). Sin --hook, la caja va con cerca ``` para conservar monospace en el transcript.

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// El repo es el DIRECTORIO DE TRABAJO, no la ubicacion del script. Deducirlo desde __dirname
// hacia arriba funciona solo mientras el script viva adentro del repo que describe: corrido desde
// otra copia —el marketplace bajado, una prueba, un repo apuntado— muestra la Pantalla del repo
// equivocado sin avisar. Se acepta una ruta por argumento para inspeccionar otro repo a proposito.
const RUTA_ARG = process.argv.slice(2).find(a => !a.startsWith('--'));
const REPO = RUTA_ARG ? path.resolve(RUTA_ARG) : process.cwd();
const CLAUDE_DIR = path.join(REPO, '.claude');
const SIN_LINT = process.argv.slice(2).includes('--sin-lint');
const HOOK = process.argv.slice(2).includes('--hook');

// Sustantivo cosmético por subsistema conocido; los desconocidos caen a "entradas".
// (Solo afecta la etiqueta, no el conteo: el descubrimiento sigue siendo dinámico.)
const SUSTANTIVO = {
  memoria: 'memorias', semantica: 'términos', decisiones: 'decisiones',
  herramientas: 'herramientas', planes: 'planes', conocimiento: 'páginas',
  preferencias: 'preferencias', conducta: 'reglas', subsistemas: 'subsistemas',
};
// Nombres de índice de la forma vieja, para el subsistema que todavía no declara frontmatter.
// Van todos los que existan, no el primero: `semantica` tiene dos y quedarse con uno la subcontaba.
const INDICES = ['INDICE.md', 'MEMORIA.md', 'PLANES.md', 'PREFERENCIAS.md', 'GLOSARIO.md',
                 'TERMINOLOGIA-FARLOPA.md', 'SUBSISTEMAS.md'];

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

// --- Índices del subsistema ---
// Un subsistema puede tener más de un Índice (uno por origen), y cada archivo lo declara en su
// frontmatter. Se cuentan TODOS: quedarse con el primero informaba 2 herramientas donde hay 8.
// Sin frontmatter se cae a los nombres de la forma vieja, y ahí sí es el primero que exista.
function frontmatterDe(txt) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(txt || '');
  return m ? m[1] : null;
}
function indicesDe(dir) {
  let nombres = [];
  try { nombres = fs.readdirSync(dir).filter(n => n.endsWith('.md')).sort(); } catch { return []; }
  const declarados = nombres.filter(n => {
    const fm = frontmatterDe(leer(path.join(dir, n)));
    return !!(fm && /^indice:\s*\S/m.test(fm));
  });
  if (declarados.length) return declarados.map(n => path.join(dir, n));
  return INDICES.map(c => path.join(dir, c)).filter(existe);
}

// --- conteo genérico de entradas: filas de tabla, si no hay tabla, bullets con link ---
function contarEntradas(txt) {
  const lineas = txt.split(/\r?\n/);
  const pipe = lineas.filter(l => l.trim().startsWith('|'));
  const sep = pipe.filter(l => /^\s*\|[\s:|-]+\|\s*$/.test(l)); // separadores |---|
  if (sep.length) return pipe.length - sep.length - sep.length; // -headers -separadores
  const conLink = lineas.filter(l => /^\s*[-*]\s+\[/.test(l));  // - [texto](link)
  if (conLink.length) return conLink.length;
  return lineas.filter(l => /^\s*[-*]\s+\S/.test(l)).length;    // bullets sin link (preferencias)
}

// --- enriquecimientos baratos por subsistema conocido ---
// Planes: agrupa por CARPETA (pendientes/ejecutados/descartados), no por estado suelto.
// La agrupación sale de ESTADOS.md (fuente de verdad configurable): cada
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
  // Contar filas de PLANES.md, tallando por carpeta del estado. El Estado se ubica por el NOMBRE
  // de su columna: con el núcleo del Índice la tabla pasó a ocho columnas y el Estado dejó de ser
  // la segunda, así que leerlo por posición contaba el Nombre del plan como si fuera un estado —
  // ningún estado matchea, la métrica sale en cero y nada lo dice.
  const cont = {};
  let iEstado = -1;
  for (const l of txt.split(/\r?\n/)) {
    if (!l.trim().startsWith('|')) continue;
    const c = l.trim().replace(/^\|/, '').replace(/\|$/, '')
      .split(/(?<!\\)\|/).map(x => x.replace(/\\\|/g, '|').trim());
    if (c.length < 2) continue;
    if (iEstado < 0) {                                   // encabezado: ubicar la columna Estado
      const n = c.map(x => x.replace(/\*/g, '').trim().toLowerCase());
      const i = n.indexOf('estado');
      if (i >= 0) iEstado = i;
      continue;
    }
    const est = c[iEstado] || '';
    if (/^:?-{2,}:?$/.test(est.replace(/\s/g, ''))) continue;   // separador |---|
    const carp = estadoCarpeta[est.toLowerCase()];
    if (carp) cont[carp] = (cont[carp] || 0) + 1;
  }
  if (!orden.length) return '';   // sin ESTADOS.md legible: degradar sin romper
  // Sin columna Estado no hay nada que tallar, y un `0 · 0 · 0` con planes a la vista miente en
  // silencio — que es justo el defecto que este bloque vino a arreglar. Se muestra solo el total.
  if (iEstado < 0) return '';
  const partes = orden.map(carp => `${cont[carp] || 0} ${carp}`);
  return `(${partes.join(' · ')})`;
}
// Cuántas preferencias sumó este repo. El total ya está en el renglón; lo que no se ve sin abrir
// el archivo es cuántas son propias, así que ese es el único número que se desglosa. Con
// frontmatter cada archivo dice de qué origen es; sin frontmatter (forma vieja) los dos orígenes
// viven adentro de un archivo, partidos por encabezado, y se aceptan además los viejos
// ("## Base (harness vN)" / "## Adaptaciones") mientras haya Agentes Desplegados sin nivelar.
function detallePreferencias(archivos) {
  // Se cuenta con el contador generico —filas de tabla si hay tabla, si no bullets con link—, no
  // con un contador de bullets propio: el registro paso de bullets a tabla y este numero se fue a
  // cero, informando "0 propias del repo" con las cinco filas a la vista y sin emitir ninguna senal.
  const contar = t => (t ? contarEntradas(t) : 0);
  let delRepo = 0, declarado = false;
  for (const f of archivos) {
    const t = leer(f), fm = frontmatterDe(t);
    const m = fm && /^origen:\s*(\S+)/m.exec(fm);
    if (!m) continue;
    declarado = true;
    if (m[1] === 'agente-desplegado') delRepo += contar(t);
  }
  if (!declarado) {
    const txt = archivos.length ? leer(archivos[0]) : '';
    delRepo = contar(txt.split(/^##\s+(?:Preferencias del Agente Desplegado|Adaptaciones)\b[^\n]*$/mi)[1]);
  }
  return `(${delRepo} propias del repo)`;
}
// Semántica guarda dos cosas de NATURALEZA distinta —vocabulario legítimo y relaciones vetadas—,
// y el total solo no contesta ninguna de las dos preguntas que se le hacen al subsistema. Por eso
// se abre; los subsistemas cuyos dos Índices guardan lo mismo (cambia el origen, no la naturaleza)
// muestran un número solo. Cuál Índice es cuál sale de las columnas que declara, no de su nombre.
function detalleSemantica(archivos) {
  let legitimos = 0, vetados = 0;
  for (const f of archivos) {
    const t = leer(f), n = contarEntradas(t);
    // Cual registro es cual sale de lo que el archivo declara de si mismo: su `indice`, o su
    // columna testigo `Control`. Antes se miraba la cadena `Significado vetado`, que era un
    // encabezado de columna: al pasar el registro al nucleo de columnas esa cadena desaparecio
    // y los vetados se habrian contado como legitimos, sin emitir ninguna senal.
    const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(t);
    const esFarlopa = (fm && /^indice:.*Farlopa/mi.test(fm[1]))
      || (fm && /^columnas:.*\bControl\b/mi.test(fm[1]))
      || /Significado vetado/.test(t);
    if (esFarlopa) vetados += n; else legitimos += n;
  }
  return vetados ? `(${legitimos} legítimos · ${vetados} vetados)` : '';
}

// --- correr el lint del subsistema y contar hallazgos (misma heurística que ejecutar-control-cierre) ---
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
  // Igual que ejecutar-control-cierre: leer los totales `(N)` de la salida, no confiar en el exit.
  const r = spawnSync('node', [lintPath], { cwd: REPO, encoding: 'utf8', timeout: 15000 });
  if (r.error || r.status === null) return { estado: 'n/d', hallazgos: null };
  const salida = (r.stdout || '') + (r.stderr || '');
  const h = contarHallazgos(salida);
  return { estado: r.status !== 0 ? 'error' : (h === 0 ? 'ok' : 'hallazgos'), hallazgos: h };
}

// --- Identidad del Agente: Título + Propósito (tolerante a indefinido) ---
// Sin Propósito definido el repo todavia NO es un Agente con Proposito: es el Agente
// Multiproposito a secas, esperando el Proposito que lo hace nacer. Por eso la falta no se
// informa como un dato mas: se pide (ver pedidoDeIdentidad).
const SIN = '<sin definir>';
function leerIdentidad() {
  const p = path.join(CLAUDE_DIR, 'identidad.md');
  const txt = leer(p);
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
  const idxs = indicesDe(s.dir);
  const txt = idxs.map(leer).join('\n');
  let cuenta = idxs.length ? contarEntradas(txt) : 0;
  let extra = '';
  if (s.nombre === 'planes') extra = detallePlanes(txt, leer(path.join(s.dir, 'ESTADOS.md')));
  if (s.nombre === 'preferencias') extra = detallePreferencias(idxs);
  if (s.nombre === 'semantica') extra = detalleSemantica(idxs);
  let lint = { estado: 'n/d', hallazgos: null };
  if (!SIN_LINT) {
    lint = correrLint(s.lint);
    if (typeof lint.hallazgos === 'number') hallazgosTotal += lint.hallazgos;
    if (lint.estado === 'error') lintPeor = 'error';
    else if (lint.estado === 'hallazgos' && lintPeor !== 'error') lintPeor = 'hallazgos';
  }
  // Donde hay desglose, el `extra` ya trae los sustantivos (pendientes/ejecutados, legítimos/
  // vetados, propias del repo): repetir el del subsistema sería redundante y desborda el marco,
  // así que se omite y queda "80 (…)". El renglón ya dice de qué subsistema se trata.
  const sustantivo = extra ? '' : (SUSTANTIVO[s.nombre] || 'entradas');
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
// el transcript de un cliente no-terminal (skill amp:info); en --hook va como systemMessage.
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
// Un campo vacio no pide nada por si solo. Cuando falta la Identidad, la Pantalla lo dice con
// todas las letras: es lo unico que el usuario mira al arrancar.
if (titulo === SIN || proposito === SIN) {
  cuerpo.push('');
  cuerpo.push(...envolver('⚠ Sin Propósito, este repo es el Agente Multipropósito a secas: los subsistemas no saben hacia dónde acumular. Decile al agente qué querés lograr acá y lo asienta.', WRAP, '   '));
}
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
// se muestra en SessionStart (sin cerca ```: los backticks saldrían literales). Sin --hook:
// caja envuelta en cerca de código para el transcript (skill amp:info + corridas a mano).
// Si falta la Identidad, no alcanza con mostrar «<sin definir>» al usuario: `systemMessage` va a
// la terminal y el modelo NO lo ve, asi que nadie queda a cargo de resolverlo y el repo se queda
// para siempre sin Proposito. El pedido va por `additionalContext`, que si entra al contexto del
// modelo, para que sea el agente quien lo levante en el primer turno.
function pedidoDeIdentidad() {
  const faltaTitulo = titulo === SIN, faltaProposito = proposito === SIN;
  if (!faltaTitulo && !faltaProposito) return null;
  const que = faltaTitulo && faltaProposito ? 'el Titulo y el Proposito'
            : faltaTitulo ? 'el Titulo' : 'el Proposito';
  return `Este repo todavia no tiene ${que} definido en \`.claude/identidad.md\`. `
    + 'Sin Proposito no es un Agente con Proposito: es el Agente Multiproposito a secas, y los '
    + 'subsistemas no tienen hacia donde acumular. En tu primera respuesta de esta sesion, '
    + `preguntale al usuario ${que} del repo —una linea cada uno— y asentalo en ese archivo `
    + '(titulo como encabezado `# <Titulo>`, y una linea `**Proposito:** <una oracion>`). '
    + 'No lo inventes ni lo infieras del contenido del repo sin confirmarlo: es la definicion '
    + 'que gobierna todo lo que el Agente acumula despues.';
}

if (HOOK) {
  // Salto inicial: separa la caja del prefijo "SessionStart:… says:" que antepone el CLI.
  const salida = { systemMessage: '\n' + box };
  const pedido = pedidoDeIdentidad();
  if (pedido) salida.hookSpecificOutput = { hookEventName: 'SessionStart', additionalContext: pedido };
  process.stdout.write(JSON.stringify(salida));
} else {
  process.stdout.write('```\n' + box + '\n```\n');
  const pedido = pedidoDeIdentidad();
  if (pedido) process.stdout.write('\n' + pedido + '\n');
}
