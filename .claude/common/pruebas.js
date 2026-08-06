// Banco del modulo comun. Es la pieza mas apoyada del repo —la requieren los ocho lints de
// subsistema, los dos hooks, dos Herramientas y el actualizador que viaja en el plugin—, asi que un
// defecto aca no rompe una cosa: apaga a los trece a la vez y cada uno contesta lo que sabe
// contestar cuando no hay frontmatter, que es "no lo declara". Ninguno emite una senal.
//
// Por eso el banco prueba el CASO MALO de cada guarda por separado, no el modulo entero: romper
// todo de una no prueba ninguna condicion en particular, y la guarda que quedaria en verde es
// justamente la que nadie va a mirar.
//
// Uso: node .claude/common/pruebas.js   (desde la raíz del repo)
const path = require('path');
const fm = require(path.resolve('.claude/common/frontmatter.js'));
const idx = require(path.resolve('.claude/common/indices.js'));

let malos = 0, casos = 0;
function caso(nombre, obtenido, esperado) {
  casos++;
  const ok = JSON.stringify(obtenido) === JSON.stringify(esperado);
  if (!ok) malos++;
  console.log(`${ok ? 'OK  ' : 'FALLA'} ${nombre}  → ${JSON.stringify(obtenido)}${ok ? '' : `  (esperado ${JSON.stringify(esperado)})`}`);
}

const MARCA = String.fromCharCode(0xFEFF);
const DOC = '---\nindice: Preferencias\norigen: agente-desplegado\ncolumnas: [Código, Nombre, Detalle]\n---\n\n'
  + '| Código | Nombre | Detalle |\n|---|---|---|\n| Local-0001 | Una fila | — |\n';

console.log('== La marca de orden de bytes no tapa el frontmatter ==');
// El defecto que motivo el modulo: un `.md` guardado con U+FEFF deja de matchear `^---` y pierde
// todo lo que declaraba de si mismo. Se lee "sin frontmatter", que es una respuesta valida, asi
// que ningun lector emite senal. Conocimiento `marca-de-orden-de-bytes-y-frontmatter`.
caso('origen con marca al inicio', fm.origenDe(MARCA + DOC), 'agente-desplegado');
caso('origen sin marca', fm.origenDe(DOC), 'agente-desplegado');
caso('la marca no se le come el primer caracter a un texto limpio', fm.sinMarcaDeOrden('---\na: 1\n---'), '---\na: 1\n---');
caso('solo saca la marca del INICIO', fm.sinMarcaDeOrden('x' + MARCA), 'x' + MARCA);

console.log('\n== El cierre del frontmatter exige fin de linea ==');
// Sin la guarda `(?:\r?\n|$)`, un `---` con texto pegado cuenta como cierre y el bloque se corta
// donde no termina. Es la forma laxa que tenian los dos hooks antes de unificar.
caso('cierre con texto pegado no vale', fm.leerFrontmatter('---\na: 1\n---x\ny: 2\n'), null);
caso('cierre a fin de archivo si vale', fm.leerFrontmatter('---\na: 1\n---'), { a: '1' });
caso('cierre con fin de linea Windows', fm.leerFrontmatter('---\r\na: 1\r\n---\r\n'), { a: '1' });

console.log('\n== Campos, listas y ausencias ==');
caso('lista entre corchetes', fm.leerFrontmatter(DOC).columnas, ['Código', 'Nombre', 'Detalle']);
caso('sin frontmatter da null', fm.leerFrontmatter('# Solo un titulo\n'), null);
caso('texto nulo no explota', fm.leerFrontmatter(null), null);
caso('origen ausente da null, no cadena vacia', fm.origenDe('---\nindice: X\n---\n'), null);
caso('declaraIndice con el campo', fm.declaraIndice(DOC), true);
// `indice:` sin valor no declara nada: un campo vacio es un archivo a medio migrar, y tratarlo como
// Indice lo mete en los controles de columnas con `null` adentro.
caso('declaraIndice con el campo vacio', fm.declaraIndice('---\nindice:\norigen: agente-desplegado\n---\n'), false);
caso('declaraIndice sin frontmatter', fm.declaraIndice('# Nada\n'), false);

console.log('\n== Cabecera de tabla ==');
caso('cabecera de la primera tabla', fm.cabeceraTabla(DOC), ['Código', 'Nombre', 'Detalle']);
caso('sin tabla da null', fm.cabeceraTabla('# Solo texto\n'), null);
// La tuberia escapada es una celda, no un separador: sin respetarla las columnas se corren y el
// control de columnas del frontmatter compara contra una cabecera que no existe.
caso('tuberia escapada no corre las columnas', fm.cabeceraTabla('| A \\| B | C |\n|---|---|\n'), ['A | B', 'C']);

console.log('\n== problemasDeIndices: cada control se enciende con su defecto ==');
const idxDe = (columnas, cabecera, origen, texto) => [{
  nombre: 'INDICE.md', indice: 'X', origen: origen === undefined ? 'agente-desplegado' : origen,
  columnas, cabecera, texto: texto === undefined ? '' : texto,
}];
const MANI = '**Índices:** `INDICE.md` (Agente Desplegado)\n';
caso('todo coherente no reclama nada', idx.problemasDeIndices(idxDe(['A'], ['A']), MANI), []);
caso('columna declarada que la tabla no tiene',
  idx.problemasDeIndices(idxDe(['A', 'B'], ['A']), MANI).length, 1);
caso('columna en la tabla sin declarar',
  idx.problemasDeIndices(idxDe(['A'], ['A', 'B']), MANI).length, 1);
// Dos hallazgos y no uno: un origen que no esta en ORIGENES tampoco tiene etiqueta, asi que el
// cotejo contra el manifiesto no puede coincidir nunca. Se afirman los dos porque el segundo es el
// que quedaria mudo si alguien "arreglara" el cotejo devolviendo el origen crudo como etiqueta.
caso('origen invalido enciende el origen y el cotejo con el manifiesto',
  idx.problemasDeIndices(idxDe(['A'], ['A'], 'agente-inventado'), MANI).length, 2);
// Filas fusionadas: una edicion que pierde el salto mete la fila siguiente adentro de la celda
// final de la anterior. El texto se lee igual y la entrada deja de existir para quien lea por
// filas; medido en dos registros el 01/08/2026 con los once chequeos del cierre en verde.
const TABLA_SANA = '| Código | Nombre |\n|---|---|\n| Local-0001 | Uno |\n| Local-0002 | Dos |\n';
const TABLA_PEGADA = '| Código | Nombre |\n|---|---|\n| Local-0001 | Uno | | Local-0002 | Dos |\n';
caso('dos filas en una sola linea se marcan',
  idx.problemasDeIndices(idxDe(['A'], ['A'], undefined, TABLA_PEGADA), MANI).length, 1);
// El caso bueno con las MISMAS filas separadas: sin el, un chequeo que marcara siempre pasaria.
caso('las mismas filas bien separadas no se marcan',
  idx.problemasDeIndices(idxDe(['A'], ['A'], undefined, TABLA_SANA), MANI), []);
// Tres pegadas cuentan como UN hallazgo por linea, no como tres: la linea es la unidad a reparar.
caso('tres filas pegadas dan un hallazgo por linea',
  idx.problemasDeIndices(idxDe(['A'], ['A'], undefined,
    '| Código |\n|---|\n| Local-0001 | a | | Local-0002 | b | | Local-0003 | c |\n'), MANI).length, 1);

// Forma anterior: el archivo se descubre por su nombre de siempre y no declara nada de si mismo.
// Se tolera —hay Agentes Desplegados sin actualizar— pero se dice, porque los controles de origen y
// columnas no corren sobre el y el silencio se lee como registro sano.
const VIEJO = { nombre: 'PLANES.md', indice: null, origen: null, columnas: null, cabecera: ['Plan', 'Estado'], texto: '' };
caso('el Indice sin frontmatter se marca',
  idx.problemasDeIndices([VIEJO], null).length, 1);
// Convive con uno declarado y sano: el hallazgo es del viejo, no del par.
caso('el viejo se marca sin ensuciar al declarado',
  idx.problemasDeIndices([VIEJO, ...idxDe(['A'], ['A'])], MANI).length, 1);
// El caso bueno con el MISMO archivo ya declarado: sin el, un chequeo que marcara siempre pasaria.
caso('declarado y sano no se marca por la forma anterior',
  idx.problemasDeIndices(idxDe(['A'], ['A']), MANI), []);

caso('el manifiesto no lista el Indice',
  idx.problemasDeIndices(idxDe(['A'], ['A']), '**Índices:** `OTRO.md` (Agente Desplegado)\n').length, 2);
caso('el manifiesto le pone otro origen',
  idx.problemasDeIndices(idxDe(['A'], ['A']), '**Índices:** `INDICE.md` (Agente Multipropósito)\n').length, 1);
caso('manifiesto sin el campo Indices',
  idx.problemasDeIndices(idxDe(['A'], ['A']), '# Manifiesto sin campo\n').length, 1);
// Sin manifiesto que comparar, los controles de columnas siguen corriendo: se pasa null a proposito
// cuando el archivo no existe, y eso no puede apagar la mitad del control.
caso('sin manifiesto igual controla las columnas',
  idx.problemasDeIndices(idxDe(['A', 'B'], ['A']), null).length, 1);

console.log(`\ncasos: ${casos}`);
console.log(malos ? `${malos} FALLARON.` : 'TODO VERDE.');
process.exit(malos ? 1 : 0);
