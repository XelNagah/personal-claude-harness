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
const { leerFrontmatter, cabeceraTabla, celdasDe, esSeparadora } = require('./frontmatter.js');

const ORIGENES = ['agente-multiproposito', 'agente-desplegado'];
const ETIQUETA_ORIGEN = { 'agente-multiproposito': 'Agente Multipropósito', 'agente-desplegado': 'Agente Desplegado' };

// CONTROL DE LONGITUD DE DESCRIPCION — avisa (reporta el hallazgo y deja seguir; no bloquea).
//
// Largo maximo de la celda `Descripcion`, en caracteres. La convencion de cada Indice ya la define
// como "una linea"; esto es esa linea escrita como numero, para que deje de depender del criterio
// del que edita. Importa porque cuatro de estos Indices se cargan en CADA arranque de sesion de
// CADA repo instalado: una celda que crece deja de ser un puntero y pasa a ser contenido que se
// paga siempre. Medido el 06/08/2026, el arranque de este repo estaba en 52.7 KB contra un tope de
// 52.0 y el grueso recortable eran celdas de estos registros.
//
// El numero NO es uno solo, porque la celda no cumple la misma funcion en todos los registros, y
// eso lo declara cada uno de si mismo:
// - Donde la celda es un puntero —`conocimiento` dice "lo suficiente para decidir si vale abrirla;
//   el desarrollo va en la pagina"— el agente abre la pagina antes de actuar y lo que sobra se baja
//   sin costo.
// - Donde la celda es OPERATIVA el agente actua desde ella sin abrir nada: el manifiesto de
//   `herramientas` manda "consultar el indice para saber que existe y como se invoca". Ahi una
//   condicion que sale de la celda no se muda, se pierde. El caso medido: `medir-contexto` lleva en
//   su celda que el tope no es de un Agente Desplegado para mover, y su salida ofrece literalmente
//   "decidir entre subirlo o recortar" — sin esa frase cargada, la salida barata es subir el tope.
//
// Lo que se recorta es la elaboracion, nunca la condicion operativa ni la enumeracion que hace la
// fila encontrable: la celda es tambien el gancho de busqueda, y una pagina que existe y que nadie
// encuentra buscando por su tema esta perdida igual que si no estuviera.
const LARGO_MAX_DESCRIPCION = 200;
const LARGO_MAX_DESCRIPCION_OPERATIVA = 350;

// Las excepciones al largo por defecto: `0` es exento y cualquier otro numero es su propio maximo.
// Es una lista de excepciones y no de incluidos a proposito, asi un subsistema que un Agente
// Desplegado agregue con `agregar-subsistema` nace controlado en vez de nacer afuera. Un control
// que solo alcanza lo que alguien se acordo de anotar valida sobre un conjunto vacio y contesta en
// verde (conocimiento `controles-que-no-avisan`).
//
// Los exentos, con su motivo:
// - `preferencias`: su convencion dice que la Descripcion lleva TODO lo que hace falta para
//   obedecer, aunque sea larga — el corte es por funcion, no por largo. Lo que sale de la celda deja
//   de estar cargado, y una regla que hay que ir a buscar es una regla que no se aplica.
// - `decisiones/INDICE.md`: la celda es el que + por que de la decision, no un resumen de el.
// - `semantica/GLOSARIO.md`: la celda es la definicion del termino.
// Se anotan por `subsistema` o por `subsistema/archivo`: `semantica` tiene dos Indices y solo uno
// esta exento, asi que la clave gruesa no alcanzaria.
const LARGO_MAX_POR_INDICE = {
  preferencias: 0,
  'decisiones/INDICE.md': 0,
  'semantica/GLOSARIO.md': 0,
  herramientas: LARGO_MAX_DESCRIPCION_OPERATIVA,
};

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

// Cuatro controles sobre lo declarado. [a] Las columnas, en los DOS sentidos: la declarada que la
// tabla no tiene y la que la tabla tiene sin declarar. Con un solo sentido el frontmatter puede
// mentir por omision, y el codigo que ubica una columna por nombre —el repartidor de conducta
// ubica Momento y Clase— deja de encontrarla sin emitir ningun error. [b] El manifiesto contra el
// frontmatter: el manifiesto lista los Indices como texto fijo y el frontmatter es la autoridad;
// sin compararlos, el mismo dato queda escrito en dos lugares que nada sincroniza. [c] Las filas
// pegadas y [d] el Control de Longitud de Descripcion, los dos abajo.
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

// [d] CONTROL DE LONGITUD DE DESCRIPCION: celdas que se pasaron. El maximo de cada Indice sale de su ruta
// —`.claude/<subsistema>/<Indice>.md` por el Patron—; si el llamador armo el objeto a mano y no la
// trae, rige el maximo por defecto: la excepcion tiene que declararse, porque un dato ausente
// apagando un control es justamente el modo de falla que este banco persigue.
function maximoDe(idx) {
  if (!idx.archivo) return LARGO_MAX_DESCRIPCION;
  const sub = path.basename(path.dirname(path.resolve(idx.archivo)));
  for (const clave of [`${sub}/${idx.nombre}`, sub]) {
    if (Object.prototype.hasOwnProperty.call(LARGO_MAX_POR_INDICE, clave)) return LARGO_MAX_POR_INDICE[clave];
  }
  return LARGO_MAX_DESCRIPCION;
}

function descripcionesLargas(idx) {
  const out = [];
  const maximo = maximoDe(idx);
  if (typeof idx.texto !== 'string' || maximo === 0) return out;
  const col = (idx.cabecera || []).findIndex(c => /^descripci[oó]n$/i.test(c));
  if (col < 0) return out;
  for (const linea of idx.texto.split('\n')) {
    const celdas = celdasDe(linea);
    if (!celdas || esSeparadora(celdas)) continue;
    if (!/^(?:Base|Local)-\d{4}$/.test(celdas[0] || '')) continue;
    const desc = celdas[col] || '';
    if (desc.length > maximo) {
      out.push(`Control de Longitud de Descripción — ${idx.nombre}: ${celdas[0]} la tiene en ${desc.length} caracteres y el máximo es ${maximo}. Bajar a la página de detalle la elaboración, nunca una condición operativa ni lo que hace encontrable la fila`);
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
    out.push(...descripcionesLargas(i));
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

module.exports = {
  ORIGENES, ETIQUETA_ORIGEN, LARGO_MAX_DESCRIPCION, LARGO_MAX_DESCRIPCION_OPERATIVA, LARGO_MAX_POR_INDICE,
  indicesDe, problemasDeIndices,
};
