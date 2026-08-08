// Lectura del Índice de Agentes Multipropósito Conocidos. Módulo del subsistema `comunicacion`,
// compartido por su lint y por el mecanismo de consulta: los dos leen las mismas filas, así que el
// parseo vive en un solo lugar (un dato leído de dos formas distintas diverge).
//
// Node pelado, sin dependencias externas: reusa el lector de tablas de `common/frontmatter.js`, que
// es la única copia del repo. Un Índice ausente es válido —es Aprendizaje local que puede no
// existir— y devuelve la lista vacía sin señal de error.

const fs = require('fs');
const path = require('path');
const { sinMarcaDeOrden, cabeceraTabla, celdasDe, esSeparadora } = require('../common/frontmatter.js');

// Los CLI cuyo modo de invocación no interactiva de solo lectura conoce el mecanismo. Un CLI fuera
// de esta lista no se invoca a ciegas: se informa como degradación (ver `consultar/consultar.js`).
const CLIS_SOPORTADOS = ['claude', 'codex'];

// Las filas del Índice, ubicadas por NOMBRE de columna y no por posición: si mañana se agrega una
// columna, leer por posición se llevaría el dato de al lado sin emitir señal. Cada fila trae su
// número de línea para que quien informe un problema pueda señalarlo.
function leerIndice(dirSub) {
  const archivo = path.join(dirSub, 'INDICE.md');
  let txt;
  try { txt = fs.readFileSync(archivo, 'utf8'); } catch (e) { return []; }
  const cab = cabeceraTabla(txt);
  if (!cab) return [];
  const norm = cab.map(c => c.toLowerCase());
  const col = nombre => norm.indexOf(nombre);
  const iCod = col('código'), iNom = col('nombre'), iProp = col('propósito');
  const iDir = col('directorio'), iCli = col('cli');
  const filas = [];
  const lineas = sinMarcaDeOrden(txt).split(/\r?\n/);
  for (let n = 0; n < lineas.length; n++) {
    const celdas = celdasDe(lineas[n]);
    if (!celdas || esSeparadora(celdas)) continue;
    const cod = (celdas[iCod] || '').replace(/[*\s]/g, '');
    if (!/^(?:Base|Local)-\d{4}$/.test(cod)) continue;   // saltea el encabezado y lo que no es fila
    const val = i => (i >= 0 && i < celdas.length ? celdas[i] : '');
    filas.push({
      codigo: cod,
      nombre: val(iNom),
      proposito: val(iProp),
      directorio: val(iDir),
      cli: val(iCli).toLowerCase(),
      linea: n + 1,
    });
  }
  return filas;
}

module.exports = { CLIS_SOPORTADOS, leerIndice };
