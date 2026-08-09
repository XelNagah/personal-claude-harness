#!/usr/bin/env node
// buscar.js — encuentra las instalaciones del Agente Multipropósito de esta máquina y devuelve las
// que todavía no están en el Índice de Agentes Multipropósito Conocidos. Lo usa la habilidad
// `amp-comunicacion:buscar-agentes`, que le presenta los candidatos al usuario para registrarlos.
//
// NO BARRE EL DISCO. Los CLI ya guardan dónde corrieron, así que recorrer carpetas sería
// reimplementar un dato que ya existe (Preferencia Local-0012, evaluar soluciones existentes):
//   - claude — `~/.claude.json`, clave `projects`: un directorio por proyecto abierto alguna vez.
//   - codex  — `~/.codex/sessions/**/rollout-*.jsonl`, campo `cwd` de la primera línea de cada
//              archivo (`session_meta`). Se leen los primeros KB de cada rollout, no el archivo
//              entero: son transcripciones completas y no hay nada más que buscar ahí.
// Medido el 26-08-08 en esta máquina: 33 + 14 directorios, 93 rollouts, decenas de milisegundos.
//
// De qué CLI viene cada candidato lo dice la FUENTE, no una heurística: un directorio que aparece
// en las dos se informa con las dos, y quien registre elige.
//
// Uso: node buscar.js [--json] [rutaRepo]
//
// Node pelado, sin dependencias externas (los scripts del Agente Multipropósito corren así).

const fs = require('fs');
const os = require('os');
const path = require('path');
const { leerIdentidad, SIN } = require('../../common/identidad.js');
const { leerIndice } = require('../indice.js');

// La señal de que un directorio es una instalación del Agente Multipropósito: el catálogo de
// subsistemas, que existe en todo repo inicializado y en ninguno que no lo esté. Se elige ese
// archivo y no `.claude/` a secas porque `.claude/` la tiene cualquier repo que haya visto Claude
// Code una vez, sin nada del harness adentro.
const SENAL = path.join('.claude', 'subsistemas', 'SUBSISTEMAS.md');

// Windows escribe la misma ruta de varias formas —`d:\x` y `D:/x`—, y un candidato repetido se
// presentaría dos veces. La clave normaliza separadores y mayúsculas SOLO para comparar; lo que se
// muestra y lo que se registra es la ruta resuelta, no esta clave.
const clave = dir => path.resolve(dir).replace(/[\\/]+/g, path.sep).replace(/[\\/]+$/, '').toLowerCase();

// Los directorios que `claude` recuerda haber abierto. Un `~/.claude.json` ausente o ilegible no es
// un error: significa que este CLI nunca corrió acá, y el buscador sigue con el otro.
function candidatosDeClaude() {
  const p = path.join(os.homedir(), '.claude.json');
  try {
    const j = JSON.parse(fs.readFileSync(p, 'utf8'));
    return Object.keys(j.projects || {});
  } catch (e) { return []; }
}

// Los directorios donde corrió `codex`. El `cwd` está en la primera línea de cada rollout, así que
// se leen los primeros bytes y no el archivo: un rollout es la transcripción entera de una sesión.
function candidatosDeCodex() {
  const raiz = path.join(os.homedir(), '.codex', 'sessions');
  const dirs = [];
  const TROZO = 8192;
  (function recorrer(d) {
    let entradas;
    try { entradas = fs.readdirSync(d, { withFileTypes: true }); } catch (e) { return; }
    for (const e of entradas) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) { recorrer(p); continue; }
      if (!/^rollout-.*\.jsonl$/.test(e.name)) continue;
      let cabeza = '';
      try {
        const fd = fs.openSync(p, 'r');
        const b = Buffer.alloc(TROZO);
        const n = fs.readSync(fd, b, 0, TROZO, 0);
        fs.closeSync(fd);
        cabeza = b.toString('utf8', 0, n);
      } catch (e) { continue; }
      const m = /"cwd"\s*:\s*"((?:[^"\\]|\\.)*)"/.exec(cabeza);
      if (!m) continue;
      try { dirs.push(JSON.parse('"' + m[1] + '"')); } catch (e) { /* escape roto: se saltea */ }
    }
  })(raiz);
  return dirs;
}

// El resultado: un candidato por instalación, con de dónde salió, su Identidad, y si ya está en el
// Índice. Los ya registrados y el propio repo NO se borran de la lista: se marcan, para que quien
// la lea pueda decir "de las 8 que hay, 2 ya estaban" en vez de presentar 6 sin explicar el resto.
//
// `candidatos` se puede pasar armado —`{ claude: [...], codex: [...] }`— y es lo que hace probable
// el filtrado: leído de las fuentes reales, el resultado depende de qué repos vio esta máquina, así
// que el banco no podría afirmar nada. Sin el parámetro se leen las fuentes, que es el uso real.
function buscarAgentes(dirRepo, candidatos = null) {
  const fuentes = candidatos || { claude: candidatosDeClaude(), codex: candidatosDeCodex() };
  const porClave = new Map();
  const sumar = (dir, cli) => {
    const k = clave(dir);
    if (!porClave.has(k)) porClave.set(k, { directorio: path.resolve(dir), clis: new Set() });
    porClave.get(k).clis.add(cli);
  };
  for (const d of fuentes.claude || []) sumar(d, 'claude');
  for (const d of fuentes.codex || []) sumar(d, 'codex');

  const registrados = new Map(leerIndice(path.join(dirRepo, '.claude', 'comunicacion'))
    .map(f => [clave(f.directorio), f.nombre]));
  const propio = clave(dirRepo);

  const encontrados = [];
  for (const c of porClave.values()) {
    if (!fs.existsSync(path.join(c.directorio, SENAL))) continue;
    const { titulo, proposito } = leerIdentidad(c.directorio);
    encontrados.push({
      directorio: c.directorio,
      clis: [...c.clis].sort(),
      titulo,
      proposito,
      // Sin Identidad declarada no hay con qué nombrarlo ni qué preguntarle: se informa igual, pero
      // marcado, porque el usuario tiene que poner el Nombre y el Propósito a mano.
      sinIdentidad: titulo === SIN && proposito === SIN,
      yaRegistradoComo: registrados.get(clave(c.directorio)) || null,
      esEsteRepo: clave(c.directorio) === propio,
    });
  }
  return encontrados.sort((a, b) => a.directorio.localeCompare(b.directorio));
}

function main() {
  const args = process.argv.slice(2);
  const json = args.includes('--json');
  const ruta = args.find(a => !a.startsWith('--'));
  // El repo es el DIRECTORIO DE TRABAJO, no la ubicación del script: deducirlo de __dirname
  // describiría el repo equivocado apenas haya una segunda copia (conocimiento Local-0008).
  const repo = ruta ? path.resolve(ruta) : process.cwd();

  const todos = buscarAgentes(repo);
  if (json) { console.log(JSON.stringify(todos, null, 2)); return; }

  const nuevos = todos.filter(a => !a.yaRegistradoComo && !a.esEsteRepo);
  console.log(`Instalaciones del Agente Multipropósito encontradas en esta máquina: ${todos.length}`);
  console.log(`  ya registradas: ${todos.filter(a => a.yaRegistradoComo).length} · este repo: ${todos.filter(a => a.esEsteRepo).length} · sin registrar: ${nuevos.length}`);
  if (!nuevos.length) { console.log('\nNo hay ninguna sin registrar.'); return; }
  console.log('\nSin registrar:');
  for (const a of nuevos) {
    console.log(`\n  ${a.titulo}`);
    console.log(`    Propósito : ${a.proposito}`);
    console.log(`    Directorio: ${a.directorio}`);
    console.log(`    CLI       : ${a.clis.join(' / ')}`);
    if (a.sinIdentidad) console.log('    ⚠️ No declara su Identidad: hay que ponerle Nombre y Propósito a mano.');
  }
}

if (require.main === module) main();

module.exports = { buscarAgentes, candidatosDeClaude, candidatosDeCodex, clave, SENAL };
