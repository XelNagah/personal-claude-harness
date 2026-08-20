// Lectura del registro de relaciones vetadas (`semantica/TERMINOLOGIA-FARLOPA.md`). Unica copia del
// repo: la usan el `lint-semantica` y el control `detectar-terminologia-vetada` del momento
// `al escribir`.
//
// Por que existe: los dos lo leian por su cuenta con contratos incompatibles. El lint quitaba las
// comillas simples invertidas si estaban y separaba por `,`, `;` y `/`; el control exigia las
// comillas y salteaba la fila que no las tuviera. Como el formato de la celda no estaba documentado
// en ninguna parte —y la copia que viaja en `base/` llega con la tabla VACIA, sin una sola fila de
// la que deducirlo—, un Agente Desplegado que poblara su registro sin comillas dejaba al control
// leyendo un registro vacio: contestaba en verde sin frenar nada. Medido en tres instalaciones el
// 20/08/2026: dos de tres no detectaban ninguna de sus filas.
//
// El contrato es TOLERAR, no exigir. Quien puebla este registro es un agente cualquiera de un repo
// cualquiera, y las comillas no tienen ninguna virtud funcional: no las necesita el lint y no las
// necesita el control. Exigirlas y castigar el incumplimiento apagando el control es lo peor de los
// dos mundos. Se acepta la celda con comillas y sin comillas, con resaltado y sin el.
//
// OJO: tolerar la ausencia de comillas NO alcanza por si solo. Las hermanas de una fila van
// separadas por `/` (`levelear / leveleo / leveling`), asi que tomar la celda entera cuando no hay
// comillas da una variante literal que no aparece en ningun texto: el control seguiria en verde y
// encima creyendo que leyo la fila. Por eso el desarme de la celda es lo que se comparte.

const fs = require('fs');
const { sinMarcaDeOrden, celdasDe, esSeparadora } = require('./frontmatter.js');

// La variable de entorno con que se apunta el control a otro registro. Existe para que su banco de
// pruebas traiga el suyo en vez de medir el registro real del repo, que es contenido del Proposito
// y cambia de un Agente Desplegado a otro. El nombre vive aca —en el modulo que lee— y no en cada
// llamador, para que no haya dos variables con el mismo proposito.
const ENV_REGISTRO = 'AMP_REGISTRO_VETADOS';

// Nombres aceptados de cada columna, en minuscula. La columna del termino se llama `Nombre` desde
// que el registro tomo el nucleo de columnas; `Término` es la forma vieja y se acepta mientras haya
// Agentes Desplegados sin actualizar. Sin ninguna de las dos el encabezado no matchea, el registro
// se lee vacio y el control deja de frenar nada — sin error.
const COLUMNAS = {
  codigo:      ['código', 'codigo'],
  termino:     ['nombre', 'término', 'termino'],
  significado: ['descripción', 'descripcion', 'significado vetado'],
  comoDecirlo: ['cómo decirlo', 'como decirlo'],
  control:     ['control'],
  detalle:     ['detalle'],
};

const normalizar = c => String(c == null ? '' : c).replace(/\*/g, '').trim().toLowerCase();

// Ubica cada columna por NOMBRE, nunca por posicion: con el nucleo la primera celda es el Codigo, y
// leer por posicion hacia que el registro listara `Local-0001` como termino vetado — dejaba de
// detectar cualquier cosa, en verde y sin error (conocimiento `cambiar-la-forma-de-un-registro`).
// Devuelve null si el encabezado no es el del registro de vetados, para que una tabla anterior del
// mismo `.md` no se lea como si lo fuera.
function mapearCabecera(celdas) {
  const norm = celdas.map(normalizar);
  const donde = nombres => { for (const n of nombres) { const i = norm.indexOf(n); if (i >= 0) return i; } return -1; };
  const cols = {};
  for (const clave of Object.keys(COLUMNAS)) cols[clave] = donde(COLUMNAS[clave]);
  if (cols.termino < 0 || cols.comoDecirlo < 0) return null;
  return cols;
}

// Desarma la celda del termino en los terminos que veta la fila. Una fila puede vetar varias formas
// hermanas de la misma relacion (`levelear / leveleo / leveling` son tres terminos en un solo veto).
// Se quitan las comillas simples invertidas SI ESTAN, se quita el resaltado, y se separa por `,`,
// `;` y `/`.
function variantesDeNombre(celda) {
  return String(celda == null ? '' : celda)
    .replace(/`/g, '')
    .replace(/\*/g, '')
    .split(/[,;/]/)
    .map(x => x.trim())
    .filter(x => x && x !== '—' && x !== '-');
}

// Las filas del registro, a partir de su TEXTO. Cada una:
//   { codigo, nombre, variantes: [...], significado, comoDecirlo, control: 'bloquea'|'avisa', detalle }
// `control` vacio o desconocido se lee como `avisa`, que es lo que declara el propio registro.
// Se devuelven tambien las filas sin variantes: contarlas es del llamador, y el lint cuenta
// relaciones vetadas —filas— que no son lo mismo que terminos.
function filasVetadas(texto) {
  const out = [];
  let cols = null;
  for (const linea of sinMarcaDeOrden(String(texto == null ? '' : texto)).split(/\r?\n/)) {
    const celdas = celdasDe(linea);
    if (!celdas) continue;
    if (!cols) { cols = mapearCabecera(celdas); continue; }
    if (esSeparadora(celdas)) continue;
    const en = i => (i >= 0 && i < celdas.length ? celdas[i] : '');
    const nombre = en(cols.termino);
    if (!nombre) continue;
    const control = normalizar(en(cols.control));
    out.push({
      codigo: en(cols.codigo),
      nombre,
      variantes: variantesDeNombre(nombre),
      significado: en(cols.significado),
      comoDecirlo: en(cols.comoDecirlo),
      control: control === 'bloquea' ? 'bloquea' : 'avisa',
      detalle: en(cols.detalle),
    });
  }
  return out;
}

// La ruta del registro que hay que leer: la de la instalacion, salvo que la variable de entorno
// apunte a otra. Un registro que no existe se lee como registro vacio, no como error: el subsistema
// puede no estar instalado todavia.
const rutaDelRegistroVetados = porDefecto => process.env[ENV_REGISTRO] || porDefecto;

function leerRegistroVetados(ruta) {
  const r = rutaDelRegistroVetados(ruta);
  if (!r || !fs.existsSync(r)) return [];
  try { return filasVetadas(fs.readFileSync(r, 'utf8')); } catch { return []; }
}

module.exports = { ENV_REGISTRO, COLUMNAS, variantesDeNombre, filasVetadas, rutaDelRegistroVetados, leerRegistroVetados };
