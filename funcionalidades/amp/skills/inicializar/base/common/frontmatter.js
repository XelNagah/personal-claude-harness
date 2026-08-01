// Lectura del frontmatter de un `.md`. Unica copia del repo: la usan los lints de subsistema, los
// hooks, las Herramientas y el nivelador que viaja en el plugin.
//
// Por que existe: este parseo estuvo escrito a mano en trece piezas de codigo, y el defecto de la
// marca de orden de bytes (conocimiento `marca-de-orden-de-bytes-y-frontmatter`) hubo que taparlo en
// las doce que ya lo tenian, a la vez. Taparlo en una sola no habria sido una mejora parcial sino
// una divergencia. Con una sola copia, el proximo defecto de esta clase se tapa una vez.
//
// No usa ninguna biblioteca externa a proposito: los scripts del Agente Multiproposito corren con
// Node pelado, sin `package.json` ni `node_modules`, porque una dependencia no la paga este repo
// sino cada Agente Desplegado que lo instale.

// La marca de orden de bytes se saca SIEMPRE, y es lo primero que pasa con cualquier texto: un `.md`
// guardado con ella deja de matchear `^---`, o sea pierde todo lo que declaraba de si mismo, y se lo
// lee como "sin frontmatter" — que es una respuesta que el codigo ya sabe manejar, asi que no emite
// ninguna senal. El archivo ademas se ve igual en cualquier editor.
// Se compara por codigo de caracter y no con un literal ni con un `\u`-escape a proposito: el
// literal es invisible en cualquier editor y `lint-harness` lo marca como marca suelta, y el escape
// no sobrevive a las herramientas que reescriben este archivo (queda `uFEFF`, el control se apaga y
// nadie lo ve). Un numero no se puede corromper en silencio.
const MARCA_DE_ORDEN = 0xFEFF;
const sinMarcaDeOrden = s => {
  const t = String(s == null ? '' : s);
  return t.charCodeAt(0) === MARCA_DE_ORDEN ? t.slice(1) : t;
};

// El bloque crudo entre los dos `---`, o null. El cierre exige fin de linea o fin de archivo
// (`(?:\r?\n|$)`): sin esa guarda, un `---` con texto pegado en la misma linea cuenta como cierre y
// el bloque se corta donde no termina.
const RE_FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/;
function bloqueFrontmatter(txt) {
  const m = RE_FRONTMATTER.exec(sinMarcaDeOrden(txt));
  return m ? m[1] : null;
}

// Los campos del frontmatter como objeto, o null si no tiene. Un valor entre corchetes se devuelve
// como arreglo (`columnas: [Codigo, Nombre]`); al resto se le sacan las comillas.
function leerFrontmatter(txt) {
  const bloque = bloqueFrontmatter(txt);
  if (bloque === null) return null;
  const campos = {};
  for (const linea of bloque.split(/\r?\n/)) {
    const kv = /^([a-zA-Z_][\w-]*):\s*(.*)$/.exec(linea);
    if (!kv) continue;
    const v = kv[2].trim();
    campos[kv[1]] = /^\[.*\]$/.test(v)
      ? v.slice(1, -1).split(',').map(x => x.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean)
      : v.replace(/^['"]|['"]$/g, '');
  }
  return campos;
}

// El `origen` declarado, o null. Es lo que decide el trato del nivelador y de `sincronizar-base`:
// un registro sin origen se trata como mecanismo y se copia ENTERO, con las filas del repo adentro.
function origenDe(txt) {
  const fm = leerFrontmatter(txt);
  return fm && fm.origen ? fm.origen : null;
}

// Un `.md` se considera Indice de Subsistema cuando declara el campo `indice` con valor.
function declaraIndice(txt) {
  const fm = leerFrontmatter(txt);
  return !!(fm && fm.indice);
}

// Encabezado real de la primera tabla markdown del texto (null si no tiene tabla). Las celdas se
// separan respetando las tuberias escapadas (`\|`), que de otro modo corren las columnas. La linea
// separadora (`|---|---|`) se saltea: no es el encabezado, lo sigue.
function cabeceraTabla(txt) {
  for (const linea of sinMarcaDeOrden(txt).split(/\r?\n/)) {
    const t = linea.trim();
    if (!t.startsWith('|')) continue;
    const celdas = t.replace(/^\|/, '').replace(/\|$/, '')
      .split(/(?<!\\)\|/).map(c => c.replace(/\*/g, '').replace(/\\\|/g, '|').trim());
    if (/^:?-{2,}:?$/.test((celdas[0] || '').replace(/\s/g, ''))) continue;
    return celdas;
  }
  return null;
}

module.exports = { sinMarcaDeOrden, bloqueFrontmatter, leerFrontmatter, origenDe, declaraIndice, cabeceraTabla };
