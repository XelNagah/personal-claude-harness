#!/usr/bin/env node
// Genera el catálogo de Preferencias Recomendadas que viaja en el plugin amp-preferencias, a partir
// del Índice del Agente Desplegado de este repo. El catálogo es DERIVADO: no se edita a mano, se
// regenera. Así la misma preferencia no queda escrita en dos lugares que divergen sin que nadie mire.
//
//   node .claude/herramientas/sincronizar-recomendadas/sincronizar-recomendadas.js [--aplicar] [rutaRepo]
//
// Sin --aplicar solo informa qué cambiaría. Sale con código 1 si hay algo para sincronizar y no se
// pidió aplicar: así el control de cierre se entera de que el catálogo quedó viejo.

const fs = require('fs');
const path = require('path');

const RELATIVO_CATALOGO = path.join(
  'funcionalidades', 'amp-preferencias', 'skills', 'adoptar-recomendadas', 'recomendadas');

const sinBom = s => s.replace(/^\uFEFF/, '');
const normalizar = s => sinBom(String(s)).replace(/\r\n/g, '\n').replace(/\s+$/, '');

function frontmatter(texto) {
  const m = /^---\s*\n([\s\S]*?)\n---(?:\s*\n|$)/.exec(sinBom(texto));
  if (!m) return {};
  const out = {};
  for (const linea of m[1].split(/\r?\n/)) {
    const x = /^([\w-]+):\s*(.*)$/.exec(linea);
    if (x) out[x[1]] = x[2].trim();
  }
  return out;
}

function celdas(linea) {
  return linea.trim().replace(/^\|/, '').replace(/\|$/, '')
    .split(/(?<!\\)\|/).map(c => c.replace(/\\\|/g, '|').trim());
}

function filasDe(texto) {
  const lineas = normalizar(texto).split('\n');
  const inicio = lineas.findIndex(l => {
    if (!l.trim().startsWith('|')) return false;
    const cs = celdas(l).map(c => c.replace(/\*/g, ''));
    return ['Código', 'Nombre', 'Descripción', 'Detalle'].every(n => cs.includes(n));
  });
  if (inicio < 0) throw new Error('el Índice no tiene la tabla de Preferencias');
  const cabecera = celdas(lineas[inicio]).map(c => c.replace(/\*/g, ''));
  const filas = [];
  for (let i = inicio + 2; i < lineas.length && lineas[i].trim().startsWith('|'); i++) {
    const cs = celdas(lineas[i]), fila = {};
    cabecera.forEach((n, j) => { fila[n] = cs[j] === undefined ? '' : cs[j]; });
    if (fila['Código']) filas.push(fila);
  }
  return filas;
}

function indiceDesplegado(dirPreferencias) {
  for (const nombre of fs.readdirSync(dirPreferencias).filter(n => n.endsWith('.md')).sort()) {
    const archivo = path.join(dirPreferencias, nombre);
    const texto = fs.readFileSync(archivo, 'utf8');
    const fm = frontmatter(texto);
    if (fm.indice && fm.origen === 'agente-desplegado') return { archivo, nombre, texto };
  }
  throw new Error(`no hay un Índice con origen agente-desplegado en ${dirPreferencias}`);
}

function enlaceDetalle(valor) {
  if (!valor || valor === '—' || valor === '-') return null;
  const m = /^\s*\[[^\]]+\]\(([^)]+\.md)\)\s*$/.exec(valor);
  if (!m) throw new Error(`Detalle no soportado: "${valor}"`);
  return m[1].replace(/\\/g, '/');
}

const ENCABEZADO = `---
indice: preferencias
origen: agente-multiproposito
columnas: Código, Nombre, Descripción, Detalle
---

# Preferencias Recomendadas

Catálogo de preferencias que el Agente Multipropósito **ofrece**, no instala. Ninguna llega a un repo
por instalar el plugin: la habilidad \`adoptar-recomendadas\` las muestra y el usuario elige cuáles
adoptar. Lo adoptado entra en el Índice del Agente Desplegado del destino, con un Código propio.

Son las elecciones de quien publica el Agente Multipropósito, ofrecidas como sugerencia. Adoptar una
no crea vínculo con este catálogo ni propaga sus cambios posteriores.

**Archivo derivado: no se edita a mano.** Se regenera desde el Índice del Agente Desplegado del repo
que publica el Agente Multipropósito, con
\`node .claude/herramientas/sincronizar-recomendadas/sincronizar-recomendadas.js --aplicar\`.

| Código | Nombre | Descripción | Detalle |
|--------|--------|-------------|---------|
`;

function catalogoEsperado(repo) {
  const dirPreferencias = path.join(repo, '.claude', 'preferencias');
  const indice = indiceDesplegado(dirPreferencias);
  const archivos = new Map();
  const lineas = [];
  let n = 0;
  for (const fila of filasDe(indice.texto)) {
    n++;
    const codigo = `Base-${String(n).padStart(4, '0')}`;
    const rel = enlaceDetalle(fila['Detalle']);
    let celdaDetalle = '—';
    if (rel) {
      const origen = path.join(dirPreferencias, rel);
      if (!fs.existsSync(origen)) throw new Error(`${fila['Código']} apunta a un detalle ausente: ${rel}`);
      const contenido = normalizar(fs.readFileSync(origen, 'utf8'))
        .replace(new RegExp(`\\b${fila['Código'].replace('-', '\\-')}\\b`, 'g'), codigo);
      archivos.set(path.basename(rel), contenido + '\n');
      celdaDetalle = `[${path.basename(rel)}](${path.basename(rel)})`;
    }
    lineas.push(`| ${codigo} | ${fila['Nombre']} | ${fila['Descripción']} | ${celdaDetalle} |`);
  }
  if (!n) throw new Error('el Índice del Agente Desplegado no tiene filas para publicar');
  archivos.set('RECOMENDADAS.md', ENCABEZADO + lineas.join('\n') + '\n');
  return archivos;
}

function main() {
  const args = process.argv.slice(2);
  const aplicar = args.includes('--aplicar');
  const repo = path.resolve(args.filter(a => a !== '--aplicar')[0] || process.cwd());

  console.log(`== SINCRONIZAR RECOMENDADAS: ${repo} ==`);
  const destino = path.join(repo, RELATIVO_CATALOGO);
  const esperado = catalogoEsperado(repo);

  const pendientes = [];
  for (const [nombre, contenido] of esperado) {
    const archivo = path.join(destino, nombre);
    const actual = fs.existsSync(archivo) ? normalizar(fs.readFileSync(archivo, 'utf8')) : null;
    if (actual !== normalizar(contenido)) pendientes.push({ nombre, archivo, contenido });
  }
  const sobrantes = fs.existsSync(destino)
    ? fs.readdirSync(destino).filter(n => n.endsWith('.md') && !esperado.has(n))
    : [];

  console.log(`\narchivos del catalogo: ${esperado.size}`);
  console.log(`\n[PARA SINCRONIZAR] (${pendientes.length})`);
  pendientes.forEach(p => console.log(`    ${p.nombre}`));
  if (!pendientes.length) console.log('    (ninguno)');
  console.log(`\n[SOBRANTES EN EL CATALOGO] (${sobrantes.length})`);
  sobrantes.forEach(n => console.log(`    ${n}`));
  if (!sobrantes.length) console.log('    (ninguno)');

  if (!aplicar) {
    console.log(`\nya estaban al dia: ${esperado.size - pendientes.length}`);
    if (pendientes.length || sobrantes.length) {
      console.log('\nel catalogo quedo viejo; correr con --aplicar');
      process.exitCode = 1;
    }
    return;
  }

  fs.mkdirSync(destino, { recursive: true });
  for (const p of pendientes) fs.writeFileSync(p.archivo, p.contenido, 'utf8');
  for (const n of sobrantes) fs.rmSync(path.join(destino, n), { force: true });
  console.log(`\nescritos: ${pendientes.length} | borrados: ${sobrantes.length}`);
}

if (require.main === module) {
  try {
    main();
  } catch (e) {
    console.error(`ERROR: ${e.message}`);
    process.exitCode = 1;
  }
}

module.exports = { catalogoEsperado, RELATIVO_CATALOGO };
