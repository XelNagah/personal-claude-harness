// Descubrimiento y control de los Indices de Subsistema. Unica copia del repo: la usan los ocho
// lints de subsistema, que antes llevaban este mismo bloque copiado adentro.
//
// Un subsistema tiene uno o mas Indices y cada archivo se declara a si mismo en un frontmatter
// minimo (indice, origen, columnas). Se los descubre por ese frontmatter y no por un nombre fijo:
// el nombre dejo de codificar el origen, asi que deducirlo del nombre volveria a atarlos.
// Se acepta la forma vieja —el archivo de siempre, sin frontmatter— mientras haya Agentes
// Desplegados sin actualizar: ahi el origen queda en null y los chequeos que dependen de el no corren.

const fs = require('fs');
const path = require('path');
const { leerFrontmatter, cabeceraTabla } = require('./frontmatter.js');

const ORIGENES = ['agente-multiproposito', 'agente-desplegado'];
const ETIQUETA_ORIGEN = { 'agente-multiproposito': 'Agente Multipropósito', 'agente-desplegado': 'Agente Desplegado' };

// Indices de un subsistema: los .md de su carpeta con frontmatter `indice:`, mas los nombres
// viejos que todavia no lo declaran. Da {archivo, nombre, texto, indice, origen, columnas, cabecera}.
function indicesDe(dirSub, nombresViejos) {
  const salida = [];
  let entradas = [];
  try { entradas = fs.readdirSync(dirSub); } catch (e) { return salida; }
  for (const nombre of entradas.sort()) {
    if (!nombre.endsWith('.md')) continue;
    const archivo = path.join(dirSub, nombre);
    let txt; try { txt = fs.readFileSync(archivo, 'utf8'); } catch (e) { continue; }
    const fm = leerFrontmatter(txt);
    const declarado = !!(fm && fm.indice);
    if (!declarado && !(nombresViejos || []).includes(nombre)) continue;
    salida.push({
      archivo, nombre, texto: txt,
      indice: declarado ? fm.indice : null,
      origen: declarado ? (fm.origen || '') : null,
      columnas: declarado && Array.isArray(fm.columnas) ? fm.columnas : null,
      cabecera: cabeceraTabla(txt),
    });
  }
  return salida;
}

// Tres controles sobre lo declarado. [a] Las columnas, en los DOS sentidos: la declarada que la
// tabla no tiene y la que la tabla tiene sin declarar. Con un solo sentido el frontmatter puede
// mentir por omision, y el codigo que ubica una columna por nombre —el repartidor de conducta
// ubica Momento y Clase— deja de encontrarla sin emitir ningun error. [b] El manifiesto contra el
// frontmatter: el manifiesto lista los Indices como texto fijo y el frontmatter es la autoridad;
// sin compararlos, el mismo dato queda escrito en dos lugares que nada sincroniza. [c] Las filas
// pegadas, abajo.
// [c] Dos filas en una sola linea. Una edicion que pierde el salto fusiona la fila siguiente dentro
// de la celda final de la anterior: el texto queda entero y se lee normal —abrir el archivo no lo
// delata— pero la entrada deja de existir para todo el que lea el registro por filas. Una
// preferencia deja de aplicarse, una Herramienta deja de estar registrada, un termino deja de estar
// vetado, y ningun control lo dice.
//
// Medido el 01/08/2026: dos decisiones consecutivas del repo autor estaban asi, y los once del
// control de cierre daban verde. Se vio de casualidad, por la numeracion correlativa —que solo ese
// registro tiene— y recien al sumarse una decision nueva que desalineo la cuenta. Repetido a
// proposito en `preferencias`, donde no hay numeracion que lo delate: la entrada desaparecio del
// registro y los once chequeos siguieron en verde.
//
// Va aca y no en un lint porque los ocho lints de subsistema ya corren esta funcion: es un solo
// lugar para los ocho registros. Se cuenta el Codigo, que es la primera celda de toda fila de
// entrada por convencion del Patron; una linea de tabla con dos o mas son filas fusionadas.
function filasPegadas(idx) {
  const out = [];
  // `indicesDe` siempre trae el texto; la guarda es para el llamador que arme el objeto a mano.
  if (typeof idx.texto !== 'string') return out;
  for (const [n, linea] of idx.texto.split('\n').entries()) {
    if (!linea.trim().startsWith('|')) continue;
    const codigos = linea.match(/\|\s*(?:Base|Local)-\d{4}\s*\|/g) || [];
    if (codigos.length > 1) {
      out.push(`${idx.nombre}: linea ${n + 1} lleva ${codigos.length} entradas en una sola fila (falta el salto de linea): ${codigos.map(c => c.replace(/[|\s]/g, '')).join(', ')}`);
    }
  }
  return out;
}

// Un Indice en la forma anterior —descubierto por su nombre de siempre, sin frontmatter— se tolera
// a proposito: hay Agentes Desplegados sin actualizar y romperles el lint no los actualiza. Pero la
// tolerancia se dice. Sin esta linea el archivo queda afuera de `declarados` y los controles de
// origen y columnas no corren sobre el, con lo cual el lint contesta que no encontro nada: no es
// que el registro este sano, es que nadie lo miro. Medido el 05/08/2026 sobre un consumidor cuyo
// registro de planes no tenia ni Codigo ni Nombre ni Descripcion — el chequeo del nucleo dio cero
// hallazgos y el lint salio en verde.
function problemasDeIndices(idxs, manifiestoTxt) {
  const out = [];
  for (const i of idxs.filter(i => !i.indice)) {
    out.push(`${i.nombre}: sin frontmatter de Índice (forma anterior). Mientras falte no se controlan su origen ni sus columnas: actualizarlo con amp:actualizar`);
  }
  const declarados = idxs.filter(i => i.indice);
  for (const i of declarados) {
    if (!ORIGENES.includes(i.origen)) out.push(`${i.nombre}: origen "${i.origen}" invalido (validos: ${ORIGENES.join(' / ')})`);
    out.push(...filasPegadas(i));
    if (!i.columnas) continue;
    if (!i.cabecera) { out.push(`${i.nombre}: declara columnas pero no se encontro la tabla`); continue; }
    for (const c of i.columnas) if (!i.cabecera.includes(c)) out.push(`${i.nombre}: columna declarada "${c}" que la tabla no tiene`);
    for (const c of i.cabecera) if (!i.columnas.includes(c)) out.push(`${i.nombre}: columna "${c}" en la tabla, sin declarar en el frontmatter`);
  }
  if (manifiestoTxt == null) return out;
  const linea = /^\*\*[IÍ]ndices?:\*\*(.*)$/m.exec(manifiestoTxt);
  if (!linea) {
    if (declarados.length) out.push('MANIFIESTO.md: falta el campo Indices, que lista los Indices del subsistema con su origen');
    return out;
  }
  const listados = [...linea[1].matchAll(/`([^`]+\.md)`\s*\(([^)]+)\)/g)].map(m => ({ nombre: m[1], origen: m[2].trim() }));
  for (const i of declarados) {
    const l = listados.find(x => x.nombre === i.nombre);
    if (!l) out.push(`MANIFIESTO.md: no lista el Indice ${i.nombre}`);
    else if (l.origen !== ETIQUETA_ORIGEN[i.origen]) out.push(`MANIFIESTO.md: ${i.nombre} figura como "${l.origen}" y su frontmatter dice "${i.origen}"`);
  }
  for (const l of listados) {
    if (!declarados.some(i => i.nombre === l.nombre)) out.push(`MANIFIESTO.md: lista ${l.nombre}, que no existe o no declara frontmatter`);
  }
  return out;
}

module.exports = { ORIGENES, ETIQUETA_ORIGEN, indicesDe, problemasDeIndices };
