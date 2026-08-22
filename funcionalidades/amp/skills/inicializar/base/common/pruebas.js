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
const fs = require('fs');
const path = require('path');
const fm = require(path.resolve('.claude/common/frontmatter.js'));
const idx = require(path.resolve('.claude/common/indices.js'));
const ide = require(path.resolve('.claude/common/identidad.js'));
const tv = require(path.resolve('.claude/common/terminos-vetados.js'));
const ee = require(path.resolve('.claude/common/enlaces-de-indices.js'));

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

// CONTROL DE LONGITUD DE DESCRIPCION — avisa. La convencion de cada Indice define esa celda como
// "una linea"; el Control es esa linea escrita como numero. Los cuatro Indices que se cargan en
// cada arranque de cada repo instalado pagan el ancho de esa celda siempre, y hasta ahora nada lo
// miraba: se veia recien cuando `medir-contexto` pasaba el tope, y sin decir que celda fue.
const conDesc = (desc, archivo) => [{
  archivo, nombre: 'INDICE.md', indice: 'X', origen: 'agente-desplegado',
  columnas: ['Código', 'Descripción'], cabecera: ['Código', 'Descripción'],
  texto: `| Código | Descripción |\n|---|---|\n| Local-0001 | ${desc} |\n`,
}];
const LARGA = 'x'.repeat(idx.LARGO_MAX_DESCRIPCION + 1);
const JUSTA = 'x'.repeat(idx.LARGO_MAX_DESCRIPCION);
caso('la Descripcion pasada de largo se marca',
  idx.problemasDeIndices(conDesc(LARGA, '.claude/conocimiento/INDICE.md'), MANI).length, 1);
// El caso bueno en el limite exacto: sin el, un control con `>=` marcaria toda celda del repo y la
// unica salida seria apagarlo. Se afirma el borde, no un valor comodo.
caso('la Descripcion justo en el limite no se marca',
  idx.problemasDeIndices(conDesc(JUSTA, '.claude/conocimiento/INDICE.md'), MANI), []);
// La celda OPERATIVA tiene su propio maximo: en `herramientas` el agente invoca desde el Indice sin
// abrir la ficha —lo manda su manifiesto— y una condicion que sale de la celda no se muda, se
// pierde. Se prueba con el MISMO texto que se marca en un Indice puntero: lo que se afirma es el
// maximo distinto y no el texto.
const OPERATIVA = 'x'.repeat(idx.LARGO_MAX_DESCRIPCION_OPERATIVA);
caso('herramientas admite mas que el maximo puntero',
  idx.problemasDeIndices(conDesc(OPERATIVA, '.claude/herramientas/INDICE.md'), MANI), []);
// El mismo texto en un Indice puntero SI se marca: sin este par, un maximo operativo puesto por
// error en todos los registros pasaria igual.
caso('ese mismo texto en un Indice puntero se marca',
  idx.problemasDeIndices(conDesc(OPERATIVA, '.claude/conocimiento/INDICE.md'), MANI).length, 1);
caso('herramientas tambien tiene techo, no es exento',
  idx.problemasDeIndices(conDesc(OPERATIVA + 'x', '.claude/herramientas/INDICE.md'), MANI).length, 1);

// Los exentos: registros donde la celda es el contenido y no un puntero a el. Se prueba con el
// MISMO texto que se marca en un Indice medido, asi lo que se afirma es la exencion y no el texto.
caso('preferencias esta exento por subsistema',
  idx.problemasDeIndices(conDesc(LARGA, '.claude/preferencias/INDICE.md'), MANI), []);
caso('el glosario esta exento y su par de semantica no',
  idx.problemasDeIndices([...conDesc(LARGA, '.claude/semantica/GLOSARIO.md'),
    ...conDesc(LARGA, '.claude/semantica/TERMINOLOGIA-FARLOPA.md')].map((i, n) =>
    ({ ...i, nombre: n ? 'TERMINOLOGIA-FARLOPA.md' : 'GLOSARIO.md' })),
  null).length, 1);
// Sin ruta no se puede resolver el exento, y ahi se controla igual: la ausencia de un dato no puede
// apagar un control, que es el modo de falla que persigue todo este banco.
caso('sin ruta se controla igual, no se exime',
  idx.problemasDeIndices(conDesc(LARGA, undefined), MANI).length, 1);
// Un Indice sin columna Descripcion no tiene nada que medir y no debe inventar hallazgos.
caso('un Indice sin columna Descripcion no se marca',
  idx.problemasDeIndices(idxDe(['A'], ['A']), MANI), []);
// La tuberia escapada adentro de la celda: sin respetarla, la Descripcion se corta donde no termina
// y una celda pasada de largo se mide corta — el control da verde sobre el caso que persigue.
caso('la tuberia escapada no corta la Descripcion medida',
  idx.problemasDeIndices([{
    archivo: '.claude/conocimiento/INDICE.md', nombre: 'INDICE.md', indice: 'X',
    origen: 'agente-desplegado', columnas: ['Código', 'Descripción'], cabecera: ['Código', 'Descripción'],
    texto: `| Código | Descripción |\n|---|---|\n| Local-0001 | ${'x'.repeat(150)} \\| ${'x'.repeat(60)} |\n`,
  }], MANI).length, 1);

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

console.log('\n== La Identidad se lee del repo que se le pasa, no del que corre ==');
// El parseo tenia una sola copia incrustada en la Pantalla de bienvenida, que solo miraba su propio
// repo. Ahora lo lee tambien el buscador de Agentes Multiproposito Conocidos, que abre el
// `identidad.md` de OTROS repos: si la funcion se atara al directorio de trabajo, describiria el
// repo equivocado sin fallar —contestaria— (conocimiento Local-0008).
const TMP = path.resolve('.claude/tmp/prueba-identidad');
const repoDe = (nombre, contenido) => {
  const d = path.join(TMP, nombre);
  fs.mkdirSync(path.join(d, '.claude'), { recursive: true });
  if (contenido !== null) fs.writeFileSync(path.join(d, '.claude', 'identidad.md'), contenido);
  return d;
};
fs.rmSync(TMP, { recursive: true, force: true });
const OTRO = repoDe('otro', '# Contabilidad Personal\n\nPropósito: Llevar la contabilidad de la familia.\n');
caso('titulo y proposito de OTRO repo', ide.leerIdentidad(OTRO),
  { titulo: 'Contabilidad Personal', proposito: 'Llevar la contabilidad de la familia.' });
// La forma mas comun en Markdown cierra el enfasis DESPUES de los dos puntos. La copia incrustada
// solo salteaba las marcas de antes y devolvia el Proposito con `**` pegado adelante; este repo
// escribe la linea llana, asi que nadie lo vio hasta que hubo que leer el `identidad.md` de otros.
caso('el enfasis cerrado despues de los dos puntos no se cuela',
  ide.leerIdentidad(repoDe('enfasis', '# C\n\n**Propósito:** Llevar la contabilidad.\n')),
  { titulo: 'C', proposito: 'Llevar la contabilidad.' });
// Las cuatro formas de faltar: sin archivo, vacio, sin H1 y sin la linea del Proposito. Ninguna
// puede devolver cadena vacia: quien la muestre no podria distinguirla de un campo declarado vacio.
caso('sin identidad.md', ide.leerIdentidad(repoDe('sin-archivo', null)), { titulo: ide.SIN, proposito: ide.SIN });
caso('identidad.md vacio', ide.leerIdentidad(repoDe('vacio', '   \n')), { titulo: ide.SIN, proposito: ide.SIN });
caso('sin H1', ide.leerIdentidad(repoDe('sin-h1', 'Propósito: Solo el propósito.\n')),
  { titulo: ide.SIN, proposito: 'Solo el propósito.' });
caso('sin la linea del Proposito', ide.leerIdentidad(repoDe('sin-prop', '# Solo el título\n\nTexto suelto.\n')),
  { titulo: 'Solo el título', proposito: ide.SIN });
// Tolerancias que ya tenia la copia incrustada y que no se pueden perder al extraerla: el acento
// faltante, las marcas de enfasis y la linea citada.
caso('sin acento, con enfasis y citada',
  ide.leerIdentidad(repoDe('tolerante', '# T\n\n> **Proposito**: Con marcas.\n')),
  { titulo: 'T', proposito: 'Con marcas.' });
// Un directorio que no existe no es un error: el buscador prueba candidatos que pueden no estar.
caso('directorio inexistente', ide.leerIdentidad(path.join(TMP, 'no-existe')), { titulo: ide.SIN, proposito: ide.SIN });
console.log('\n== La celda del termino de la Terminologia Farlopa ==');
// El defecto que motivo el modulo: el registro tenia DOS lectores con contratos incompatibles. El
// lint quitaba las comillas simples invertidas si estaban; el control del momento `al escribir` las
// EXIGIA y salteaba la fila que no las trajera. Como el formato no estaba documentado en ninguna
// parte —y la copia que viaja llega con la tabla vacia—, un repo que poblara su registro sin
// comillas dejaba al control leyendo un registro VACIO: contestaba en verde sin frenar nada. El
// contrato es tolerar, no exigir.
caso('con comillas', tv.variantesDeNombre('`levelear`'), ['levelear']);
caso('SIN comillas', tv.variantesDeNombre('levelear'), ['levelear']);
caso('hermanas con comillas', tv.variantesDeNombre('`levelear` / `leveleo`'), ['levelear', 'leveleo']);
caso('hermanas SIN comillas', tv.variantesDeNombre('levelear / leveleo / leveling'), ['levelear', 'leveleo', 'leveling']);
caso('con resaltado', tv.variantesDeNombre('**`levelear`**'), ['levelear']);
caso('expresion de varias palabras', tv.variantesDeNombre('capa de plugins'), ['capa de plugins']);
caso('separada por coma', tv.variantesDeNombre('uno, dos'), ['uno', 'dos']);
caso('celda vacia', tv.variantesDeNombre(''), []);
caso('celda con guion largo', tv.variantesDeNombre('—'), []);
caso('celda ausente', tv.variantesDeNombre(undefined), []);

console.log('\n== Las filas del registro se ubican por NOMBRE de columna ==');
// Leer por posicion hacia que la primera celda —el Codigo— entrara como termino vetado: el registro
// dejaba de detectar nada, en verde y sin error (conocimiento `cambiar-la-forma-de-un-registro`).
const REG = '| Código | Nombre | Descripción | Cómo decirlo | Control | Detalle |\n'
  + '| --- | --- | --- | --- | --- | --- |\n'
  + '| Local-0001 | `uno` | sig | asi | bloquea | — |\n'
  + '| Local-0002 | dos / tres | sig | asa | | — |\n';
caso('cuantas filas', tv.filasVetadas(REG).length, 2);
caso('el Codigo no entra como termino', tv.filasVetadas(REG)[0].variantes, ['uno']);
caso('control bloquea', tv.filasVetadas(REG)[0].control, 'bloquea');
caso('control vacio se lee avisa', tv.filasVetadas(REG)[1].control, 'avisa');
caso('las hermanas de una fila', tv.filasVetadas(REG)[1].variantes, ['dos', 'tres']);
// La forma vieja del encabezado se acepta mientras haya Agentes Desplegados sin actualizar.
caso('columna vieja Término',
  tv.filasVetadas('| Término | Cómo decirlo |\n| --- | --- |\n| uno | asi |\n')[0].variantes, ['uno']);
// Sin encabezado reconocible no se lee NINGUNA fila: es preferible el vacio explicito a leer las
// columnas corridas. Quien lo nota es el banco del control, que exige veredicto.
caso('sin encabezado reconocible', tv.filasVetadas('| A | B |\n| --- | --- |\n| uno | dos |\n'), []);
caso('texto sin tabla', tv.filasVetadas('solo texto\n'), []);
// Una tabla anterior en el mismo `.md` no se lee como si fuera el registro.
caso('la tabla que no es el registro se saltea',
  tv.filasVetadas('| X | Y |\n| --- | --- |\n| a | b |\n\n' + REG).length, 2);
// Las tuberias escapadas no corren las columnas: quien lea la de al lado se lleva otro contenido.
caso('tuberia escapada en una celda',
  tv.filasVetadas('| Código | Nombre | Cómo decirlo |\n| --- | --- | --- |\n| L-1 | uno | a \\| b |\n')[0].comoDecirlo, 'a | b');
// Un registro que no existe se lee vacio, no revienta: el subsistema puede no estar instalado.
caso('registro inexistente', tv.leerRegistroVetados(path.join(TMP, 'no-esta.md')), []);

console.log('\n== Los enlaces que declaran los Indices de Subsistema ==');
// Las dos puntas leen esto: en el origen, para saber que es Aprendizaje del repo y no viaja; en el
// destino, para saber que hijo de `.claude/` esta declarado y no es un componente suelto. Contestar
// de menos no falla en ninguna de las dos: en el origen nombra un candidato de mas, en el destino
// enciende un hallazgo que nadie puede resolver.
{
  const CL = path.join(TMP, 'claude');
  const poner = (rel, txt) => {
    const f = path.join(CL, rel);
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, txt, 'utf8');
  };
  const indice = (origen, cuerpo) => `---\nindice: X\norigen: ${origen}\n---\n\n${cuerpo}`;

  poner('planes/PLANES.md', indice('agente-desplegado',
    // Un plan se llama con una frase entera: un patron que corte en el primer espacio los deja a
    // todos sin declarar. Con `%20` y con espacios crudos, que las dos formas circulan.
    '[Un plan con espacios](pendientes/Un plan con espacios.md)\n'
    + '[Otro](pendientes/Otro%20con%20escape.md)\n'
    + '[Con ancla](pendientes/Con ancla.md#seccion)\n'
    + '[Afuera](../../README.md)\n'
    + '[Externo](https://example.com/x.md)\n'));
  poner('herramientas/INDICE.md', indice('agente-multiproposito', '[f](../modulos/f.js)\n'));
  poner('semantica/README.md', '[no es Indice](../nada/x.md)\n');

  const todos = ee.enlacesDeIndices(CL);
  const tiene = (s, r) => s.has(r);
  caso('enlace con espacios crudos', tiene(todos, 'planes/pendientes/Un plan con espacios.md'), true);
  caso('enlace con %20', tiene(todos, 'planes/pendientes/Otro con escape.md'), true);
  caso('el ancla no queda pegada a la ruta', tiene(todos, 'planes/pendientes/Con ancla.md'), true);
  caso('lo que sale de .claude/ no cuenta', tiene(todos, '../README.md'), false);
  caso('un enlace externo no cuenta', [...todos].some(r => r.includes('example.com')), false);
  caso('un .md que no es Indice no declara nada', [...todos].some(r => r.includes('nada/')), false);

  // Acotado por origen: es como lo lee `sincronizar-base`, que solo quiere lo del Agente Desplegado.
  const soloRepo = ee.enlacesDeIndices(CL, { origen: 'agente-desplegado' });
  caso('acotado por origen deja el Indice del repo', tiene(soloRepo, 'planes/pendientes/Un plan con espacios.md'), true);
  caso('y saca el del Agente Multiproposito', tiene(soloRepo, 'modulos/f.js'), false);

  // Los hijos directos: la forma en que lo lee el inventario del destino.
  caso('hijos directos, sin acotar', [...ee.hijosDeclarados(CL)].sort(), ['modulos', 'planes']);
  caso('una carpeta que no enlaza nadie no aparece', ee.hijosDeclarados(CL).has('nada'), false);
  // Sin `.claude/` no revienta: el subsistema puede no estar instalado.
  caso('directorio inexistente', [...ee.enlacesDeIndices(path.join(TMP, 'no-esta'))], []);
}

fs.rmSync(TMP, { recursive: true, force: true });

console.log(`\ncasos: ${casos}`);
console.log(malos ? `${malos} FALLARON.` : 'TODO VERDE.');
process.exit(malos ? 1 : 0);
