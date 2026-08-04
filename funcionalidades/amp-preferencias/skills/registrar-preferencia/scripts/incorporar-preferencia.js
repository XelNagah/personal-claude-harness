#!/usr/bin/env node
// Materializa una propuesta de Preferencia en el Índice del Agente Desplegado.
// El juicio semántico y la ratificación pertenecen a la skill registrar-preferencia;
// este auxiliar solo hace la parte mecánica, con vista previa por defecto.
//
// Copiar desde otro Agente:
//   node incorporar-preferencia.js --fuente <repo> --codigo Base-0006 --destino <repo>
//   node incorporar-preferencia.js --fuente <repo> --codigo Base-0006 --destino <repo> --aplicar
//
// Adoptar del catálogo de Recomendadas, que es un directorio con la misma forma que
// preferencias/ pero sin repo alrededor:
//   node incorporar-preferencia.js --catalogo <dir> --codigo Base-0003 --destino <repo> [--aplicar]
//
// Incorporar una propuesta ya redactada:
//   node incorporar-preferencia.js --propuesta <archivo.json> --destino <repo> [--aplicar]
//
// Esquema de propuesta:
// {
//   "nombre": "...", "descripcion": "...",
//   "detalle": null | { "archivo": "detalle.md", "contenido": "..." },
//   "procedencia": { "repo": "...", "codigo": "Base-0006" }
// }

const fs = require('fs');
const path = require('path');

function argumentos(argv) {
  const out = { aplicar: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--aplicar') out.aplicar = true;
    else if (['--fuente', '--codigo', '--destino', '--propuesta', '--catalogo'].includes(a)) out[a.slice(2)] = argv[++i];
    else throw new Error(`argumento desconocido: ${a}`);
  }
  return out;
}

const sinBom = s => s.replace(/^\uFEFF/, '');
const normalizarTexto = s => sinBom(String(s)).replace(/\r\n/g, '\n').replace(/\s+$/, '');
const normalizarComparacion = s => String(s || '').trim().replace(/\s+/g, ' ').toLocaleLowerCase('es');

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

function tabla(texto) {
  const lineas = normalizarTexto(texto).split('\n');
  const inicio = lineas.findIndex(l => {
    if (!l.trim().startsWith('|')) return false;
    const cs = celdas(l).map(c => c.replace(/\*/g, ''));
    return ['Código', 'Nombre', 'Descripción', 'Detalle'].every(n => cs.includes(n));
  });
  if (inicio < 0 || !lineas[inicio + 1] || !/^\s*\|[\s:|-]+\|\s*$/.test(lineas[inicio + 1])) return null;
  const cabecera = celdas(lineas[inicio]).map(c => c.replace(/\*/g, ''));
  let fin = inicio + 2;
  while (fin < lineas.length && lineas[fin].trim().startsWith('|')) fin++;
  const filas = [];
  for (const linea of lineas.slice(inicio + 2, fin)) {
    const cs = celdas(linea), fila = { linea };
    cabecera.forEach((n, i) => { fila[n] = cs[i] === undefined ? '' : cs[i]; });
    filas.push(fila);
  }
  return { lineas, inicio, fin, cabecera, filas };
}

function indicesDe(repo) {
  return indicesEnDirectorio(path.join(path.resolve(repo), '.claude', 'preferencias'));
}

// El catálogo de Recomendadas es un directorio con la misma forma que preferencias/ pero sin repo
// alrededor: por eso el descubrimiento recibe el directorio y no la raíz que lo contiene.
function indicesEnDirectorio(dir) {
  if (!fs.existsSync(dir)) throw new Error(`no existe ${dir}`);
  const out = [];
  for (const nombre of fs.readdirSync(dir).filter(n => n.endsWith('.md')).sort()) {
    const archivo = path.join(dir, nombre), texto = fs.readFileSync(archivo, 'utf8');
    const fm = frontmatter(texto);
    if (!fm.indice) continue;
    const t = tabla(texto);
    if (!t) throw new Error(`${archivo} declara un Índice pero no tiene la tabla de Preferencias`);
    out.push({ dir, archivo, nombre, texto, origen: fm.origen, tabla: t });
  }
  if (!out.length) throw new Error(`no hay Índices declarados en ${dir}`);
  return out;
}

function enlaceDetalle(valor) {
  if (!valor || valor === '—' || valor === '-') return null;
  const m = /^\s*\[[^\]]+\]\(([^)]+\.md)\)\s*$/.exec(valor);
  if (!m) throw new Error(`Detalle no soportado: "${valor}"; debe ser — o un único enlace Markdown a .md`);
  if (path.isAbsolute(m[1]) || m[1].includes('..')) throw new Error(`Detalle fuera de preferencias/: ${m[1]}`);
  return m[1].replace(/\\/g, '/');
}

function propuestaDesdeFuente(repo, codigoPedido) {
  return propuestaDesde(indicesDe(repo), codigoPedido, path.resolve(repo));
}

function propuestaDesdeCatalogo(dir, codigoPedido) {
  return propuestaDesde(indicesEnDirectorio(path.resolve(dir)), codigoPedido, path.resolve(dir));
}

function propuestaDesde(indices, codigoPedido, procedencia) {
  const codigo = String(codigoPedido || '').replace(/^Preferencia\s+/i, '');
  if (!/^(?:Base|Local)-\d{4}$/.test(codigo)) throw new Error(`Código inválido: ${codigoPedido}`);
  for (const idx of indices) {
    const fila = idx.tabla.filas.find(f => f['Código'] === codigo);
    if (!fila) continue;
    const relDetalle = enlaceDetalle(fila['Detalle']);
    let detalle = null;
    if (relDetalle) {
      const archivo = path.join(idx.dir, relDetalle);
      if (!fs.existsSync(archivo)) throw new Error(`la Preferencia ${codigo} apunta a un detalle ausente: ${archivo}`);
      detalle = { archivo: path.basename(relDetalle), contenido: fs.readFileSync(archivo, 'utf8') };
    }
    return {
      nombre: fila['Nombre'], descripcion: fila['Descripción'], detalle,
      procedencia: { repo: procedencia, codigo },
    };
  }
  throw new Error(`no se encontró la Preferencia ${codigo} en ${procedencia}`);
}

function validarPropuesta(p) {
  if (!p || typeof p !== 'object') throw new Error('la propuesta no es un objeto JSON');
  for (const campo of ['nombre', 'descripcion']) {
    if (typeof p[campo] !== 'string' || !p[campo].trim()) throw new Error(`falta ${campo} en la propuesta`);
    if (/\r|\n/.test(p[campo])) throw new Error(`${campo} debe caber en una celda, sin saltos de línea`);
  }
  if (p.detalle != null) {
    if (typeof p.detalle !== 'object' || typeof p.detalle.archivo !== 'string' || typeof p.detalle.contenido !== 'string')
      throw new Error('detalle debe ser null o { archivo, contenido }');
    if (path.basename(p.detalle.archivo) !== p.detalle.archivo || !p.detalle.archivo.endsWith('.md'))
      throw new Error('detalle.archivo debe ser el nombre de un .md, sin directorios');
    const locales = [...p.detalle.contenido.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)]
      .map(m => m[1].trim().replace(/^<|>$/g, ''))
      .filter(destino => destino && !destino.startsWith('#') && !/^[a-z][a-z+.-]*:/i.test(destino));
    if (locales.length)
      throw new Error(`el detalle declara dependencias locales fuera del alcance: ${[...new Set(locales)].join(', ')}`);
  }
  return p;
}

function reemplazarCodigo(texto, desde, hacia) {
  if (!desde) return texto;
  return String(texto).replace(new RegExp(`\\b${desde.replace('-', '\\-')}\\b`, 'g'), hacia);
}

function contenidoDetalleDe(idx, fila) {
  const rel = enlaceDetalle(fila['Detalle']);
  if (!rel) return null;
  const archivo = path.join(idx.dir, rel);
  if (!fs.existsSync(archivo)) throw new Error(`${idx.nombre}: ${fila['Código']} apunta a un detalle ausente: ${rel}`);
  return normalizarTexto(fs.readFileSync(archivo, 'utf8'));
}

function escaparCelda(s) {
  return String(s).trim().replace(/(?<!\\)\|/g, '\\|');
}

function resultadoBase(args, propuesta, destino, estado, motivo) {
  return {
    estado,
    modo: args.aplicar ? 'aplicar' : 'vista-previa',
    procedencia: propuesta.procedencia || null,
    destino: path.resolve(destino),
    motivo,
    rutas: [],
  };
}

function ejecutar(args) {
  if (!args.destino) throw new Error('falta --destino <repo>');
  if (args.fuente && args.catalogo) throw new Error('usar --fuente o --catalogo; no ambos');
  const origenPorCodigo = args.fuente || args.catalogo;
  if ((origenPorCodigo || args.codigo) && !(origenPorCodigo && args.codigo))
    throw new Error('--fuente o --catalogo se usan junto con --codigo');
  if (!!origenPorCodigo === !!args.propuesta)
    throw new Error('usar --fuente + --codigo, --catalogo + --codigo, o --propuesta; no ambos');

  const propuesta = validarPropuesta(args.propuesta
    ? JSON.parse(fs.readFileSync(path.resolve(args.propuesta), 'utf8'))
    : args.catalogo
      ? propuestaDesdeCatalogo(args.catalogo, args.codigo)
      : propuestaDesdeFuente(args.fuente, args.codigo));
  const indices = indicesDe(args.destino);
  const local = indices.filter(i => i.origen === 'agente-desplegado');
  if (local.length !== 1) throw new Error(`se esperaba un Índice de Preferencias del Agente Desplegado y hay ${local.length}`);

  const codigoFuente = propuesta.procedencia && propuesta.procedencia.codigo
    ? String(propuesta.procedencia.codigo).replace(/^Preferencia\s+/i, '') : null;
  const mismoNombre = [];
  for (const idx of indices) {
    for (const fila of idx.tabla.filas) {
      if (normalizarComparacion(fila['Nombre']) !== normalizarComparacion(propuesta.nombre)) continue;
      mismoNombre.push({ idx, fila });
      const detalleEsperado = propuesta.detalle == null ? null
        : normalizarTexto(reemplazarCodigo(propuesta.detalle.contenido, codigoFuente, fila['Código']));
      const igual = normalizarComparacion(fila['Descripción']) === normalizarComparacion(propuesta.descripcion)
        && contenidoDetalleDe(idx, fila) === detalleEsperado;
      if (igual) {
        const r = resultadoBase(args, propuesta, args.destino, 'ya estaba', `equivale a Preferencia ${fila['Código']} (${fila['Nombre']})`);
        r.entrada = { codigo: fila['Código'], nombre: fila['Nombre'], indice: idx.nombre };
        r.rutas = [path.relative(path.resolve(args.destino), idx.archivo).replace(/\\/g, '/')];
        return r;
      }
    }
  }
  if (mismoNombre.length) {
    const r = resultadoBase(args, propuesta, args.destino, 'divergente', 'ya existe el mismo Nombre con contenido distinto; no se pisa');
    r.coincidencias = mismoNombre.map(x => ({ codigo: x.fila['Código'], nombre: x.fila['Nombre'], indice: x.idx.nombre }));
    return r;
  }

  const numeros = local[0].tabla.filas.map(f => /^Local-(\d{4})$/.exec(f['Código'] || '')).filter(Boolean).map(m => Number(m[1]));
  const siguiente = (numeros.length ? Math.max(...numeros) : 0) + 1;
  if (siguiente > 9999) throw new Error('se agotó el espacio de Códigos Local-NNNN');
  const codigo = `Local-${String(siguiente).padStart(4, '0')}`;
  const contenidoDetalle = propuesta.detalle == null ? null
    : normalizarTexto(reemplazarCodigo(propuesta.detalle.contenido, codigoFuente, codigo));
  const detalle = propuesta.detalle == null ? '—' : `[${propuesta.detalle.archivo}](${propuesta.detalle.archivo})`;
  const fila = `| ${codigo} | ${escaparCelda(propuesta.nombre)} | ${escaparCelda(propuesta.descripcion)} | ${detalle} |`;
  const r = resultadoBase(args, propuesta, args.destino, 'agregado', args.aplicar ? 'incorporada' : 'lista para incorporar');
  r.entrada = { codigo, nombre: propuesta.nombre, fila, indice: local[0].nombre };
  r.rutas = [path.relative(path.resolve(args.destino), local[0].archivo).replace(/\\/g, '/')];

  let archivoDetalle = null;
  if (propuesta.detalle) {
    archivoDetalle = path.join(local[0].dir, propuesta.detalle.archivo);
    r.rutas.push(path.relative(path.resolve(args.destino), archivoDetalle).replace(/\\/g, '/'));
    if (fs.existsSync(archivoDetalle) && normalizarTexto(fs.readFileSync(archivoDetalle, 'utf8')) !== contenidoDetalle) {
      r.estado = 'divergente';
      r.motivo = `${propuesta.detalle.archivo} ya existe con otro contenido; no se pisa`;
      delete r.entrada.fila;
      return r;
    }
  }

  if (!args.aplicar) return r;
  const t = local[0].tabla;
  t.lineas.splice(t.fin, 0, fila);
  let detalleCreado = false;
  try {
    if (archivoDetalle && !fs.existsSync(archivoDetalle)) {
      fs.writeFileSync(archivoDetalle, contenidoDetalle + '\n', 'utf8');
      detalleCreado = true;
    }
    fs.writeFileSync(local[0].archivo, t.lineas.join('\n').replace(/\s+$/, '') + '\n', 'utf8');
  } catch (e) {
    if (detalleCreado) fs.rmSync(archivoDetalle, { force: true });
    throw e;
  }
  return r;
}

try {
  const args = argumentos(process.argv.slice(2));
  console.log(JSON.stringify(ejecutar(args), null, 2));
} catch (e) {
  console.log(JSON.stringify({ estado: 'rechazado', motivo: e.message }, null, 2));
  process.exitCode = 1;
}
