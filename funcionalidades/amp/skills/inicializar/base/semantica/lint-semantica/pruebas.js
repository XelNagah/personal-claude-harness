// Prueba cada control de lint-semantica contra un caso malo y uno bueno. Un lint que lee mal
// contesta en verde sobre un conjunto vacio, asi que verde no prueba nada por si solo: cada control
// tiene que ENCENDERSE ante su defecto, y solo ante el suyo.
//
// El banco es un REPO DE PRUEBA completo —con su propio `.claude/`— y no solo una carpeta de
// subsistema. Hace falta asi porque el lint barre el repo entero buscando apariciones de terminos
// vetados: si el banco no fuera un repo, ese barrido caeria sobre el repo real y los casos no serian
// aislados. Esto se volvio posible el 30/07/2026, cuando el lint paso a derivar el repo de la
// carpeta que se le pasa en vez de deducirlo de su propia ubicacion.
//
// EL BANCO FABRICA SUS DOS REGISTROS. Antes copiaba el `semantica/` del repo que lo corre y rompia
// los registros REALES buscando texto literal —la fila `Local-0039` de las relaciones vetadas, las
// filas `Local-0001` y `Local-0002` del glosario— y usaba como terminos de prueba dos que solo este
// repo veta. Los dos registros de semantica son Aprendizaje de cada repo y viajan VACIOS, asi que en
// el destino ese texto no existe: el `replace` no cambiaba nada, el archivo quedaba sano, el lint
// contestaba cero hallazgos —correctamente— y el banco lo leia como «el control no vio el defecto».
// Tres de sus casos se encendian en rojo en todo repo instalado, sin que hubiera nada roto. Medido
// el 20/08/2026 en un Agente Desplegado al dia con `amp` 0.50.0, con el banco y el lint byte a byte
// iguales a los que viajan. Es la forma «escenario prestado» del conocimiento
// `controles-que-no-avisan`, y la Decision `Local-0075` es la que la prohibe para todo banco que viaja.
//
// Los terminos son DATOS SINTETICOS y estan elegidos a proposito: palabras corrientes del espanol
// que no estan vetadas en ningun registro real, ni en este repo ni en el destino. El registro de
// relaciones vetadas cubre las cuatro formas de la celda `Nombre` —con comillas simples invertidas,
// sin comillas, hermanas separadas por barra, y expresion que arranca con un caracter que no es
// letra—, que son las que el desarme compartido tiene que tolerar.
//
// Lo unico que se toma del subsistema instalado es el `MANIFIESTO.md`, Componente del Agente
// Multiproposito e igual en todas las instalaciones, y que es ademas lo que el control de Indices
// declarados contrasta.
//
// Uso: node .claude/semantica/lint-semantica/pruebas.js   (desde la raíz del repo)
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ORIGEN = '.claude/semantica';
const REPO_PRUEBA = '.claude/tmp/repo-prueba-semantica';
const BANCO = path.join(REPO_PRUEBA, '.claude', 'semantica');
const LINT = '.claude/semantica/lint-semantica/lint-semantica.js';

const DEL_SUBSISTEMA = ['MANIFIESTO.md'];
const GLO = 'GLOSARIO.md', FAR = 'TERMINOLOGIA-FARLOPA.md';
// La pagina de detalle que una fila del glosario referencia, nombrada una sola vez.
const PAGINA = 'el-cierre-mensual.md';
// Los terminos sinteticos que algun caso usa por su nombre. Se nombran aca una sola vez.
const VETADO = 'berenjena';                    // fila CON comillas
const VETADO_LARGO = 'almacén de repuestos';   // expresion de varias palabras, sin comillas
const VETADO_SIN_LETRA = '## Depósito central';// arranca con un caracter que no es letra
const CONCEPTO = 'Remito';                     // concepto del glosario, para la colision

function glosarioSintetico() {
  return '---\nindice: Glosario\norigen: agente-desplegado\n'
    + 'columnas: [Código, Nombre, Descripción, Alias, Propuestos, Detalle]\n'
    + 'descripcion: qué significa el término\n---\n\n'
    + '# Glosario\n\nDatos sintéticos: este registro existe solo para romperlo.\n\n'
    + '| Código | Nombre | Descripción | Alias | Propuestos | Detalle |\n|---|---|---|---|---|---|\n'
    + `| Local-0001 | ${CONCEPTO} | El comprobante con que se entrega la mercadería. | — | — | — |\n`
    + `| Local-0002 | Cierre mensual | El corte con que se congelan los totales del período. | — | — | [${PAGINA}](${PAGINA}) |\n`;
}
function vetadosSintetico() {
  return '---\nindice: Terminología Farlopa\norigen: agente-desplegado\n'
    + 'columnas: [Código, Nombre, Descripción, Cómo decirlo, Control, Detalle]\n'
    + 'descripcion: el significado que este registro veta para ese término\n---\n\n'
    + '# Terminología Farlopa\n\nDatos sintéticos: este registro existe solo para romperlo.\n\n'
    + '| Código | Nombre | Descripción | Cómo decirlo | Control | Detalle |\n|---|---|---|---|---|---|\n'
    + `| Local-0001 | \`${VETADO}\` | dato de prueba: fila CON comillas | hortaliza | bloquea | — |\n`
    + '| Local-0002 | damajuana / damajuanear | dato de prueba: fila SIN comillas, dos hermanas | garrafa | bloquea | — |\n'
    + `| Local-0003 | ${VETADO_LARGO} | dato de prueba: expresión de varias palabras | depósito | avisa | — |\n`
    + `| Local-0004 | \`${VETADO_SIN_LETRA}\` | dato de prueba: arranca con un carácter que no es letra | Depósito central | avisa | — |\n`;
}

function armar() {
  fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
  fs.mkdirSync(BANCO, { recursive: true });
  for (const f of DEL_SUBSISTEMA) {
    const src = path.join(ORIGEN, f);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(BANCO, f));
  }
  escribir(GLO, glosarioSintetico());
  escribir(FAR, vetadosSintetico());
  fs.writeFileSync(path.join(BANCO, PAGINA),
    '# El cierre mensual\n\nDatos sintéticos: esta página existe para que una fila la referencie.\n');
}
const leer = f => fs.readFileSync(path.join(BANCO, f), 'utf8');
const escribir = (f, t) => fs.writeFileSync(path.join(BANCO, f), t);
// Un archivo suelto del repo de prueba: es lo que el barrido de vetados tiene que encontrar.
const nota = texto => fs.writeFileSync(path.join(REPO_PRUEBA, 'nota.md'), texto);

function correr() {
  const r = cp.spawnSync('node', [LINT, BANCO], { encoding: 'utf8' });
  return (r.stdout || '') + (r.stderr || '');
}
// hallazgos por seccion: {titulo: cantidad}. El grupo [6] lleva dos numeros en el titulo, asi que se
// lee aparte: lo que importa de el es el conteo de texto plano.
function hallazgos(salida) {
  const out = {};
  for (const m of salida.matchAll(/^\[\d+\] ([^(]+?) \((\d+)\)/gm)) out[m[1].trim()] = parseInt(m[2], 10);
  const v = /APARICIONES DE VETADOS \(prosa: (\d+), codigo: (\d+)\)/.exec(salida);
  if (v) out['VETADOS EN TEXTO PLANO'] = parseInt(v[1], 10);
  return out;
}
const total = h => Object.entries(h).reduce((a, [, n]) => a + n, 0);

let malos = 0;

// -- CASO BUENO: el banco intacto tiene que dar cero ------------------------
console.log('== CASO BUENO: el banco intacto da cero ==');
armar();
{
  const h = hallazgos(correr());
  const t = total(h);
  console.log(`${t === 0 ? 'OK  ' : 'FALLA'} banco sin tocar → ${t} hallazgos${t ? '  ' + JSON.stringify(h) : ''}`);
  if (t !== 0) malos++;
}

// -- CASOS MALOS: cada control se enciende ante su defecto ------------------
const casos = [];
const caso = (nombre, seccion, romper) => casos.push({ nombre, seccion, romper });

caso('Detalle que apunta a un archivo que no existe', 'LINKS DE DETALLE ROTOS',
  () => escribir(GLO, leer(GLO).replace(`[${PAGINA}](${PAGINA})`, '[pagina-que-no-existe.md](pagina-que-no-existe.md)')));

caso('página que ningún Índice referencia', 'PAGINAS HUERFANAS',
  () => fs.writeFileSync(path.join(BANCO, 'pagina-suelta.md'), '# Suelta\n\nNadie la referencia.\n'));

caso('mismo término legítimo y vetado a la vez', 'COLISIONES DE TERMINOS',
  () => escribir(FAR, leer(FAR).trimEnd() + '\n'
    + `| Local-0005 | \`${CONCEPTO}\` | dato de prueba: el mismo término que el glosario bendice | comprobante | avisa | — |\n`));

caso('propuesto sin ratificar', 'PROPUESTOS PENDIENTES DE RATIFICACION',
  () => escribir(GLO, leer(GLO).replace(/(\| Local-0001 \|[^\n]*\| — \| )—( \| — \|)/, '$1palabra-propuesta$2')));

caso('columna declarada que la tabla no tiene', 'INDICES DECLARADOS',
  () => escribir(GLO, leer(GLO).replace(/^columnas: \[(.+)\]$/m, 'columnas: [$1, Inventada]')));

caso('término vetado usado en texto plano del repo', 'VETADOS EN TEXTO PLANO',
  () => nota(`En la huerta plantamos una ${VETADO} el mes pasado.\n`));

console.log('\n== CASOS MALOS: cada control se enciende ante su defecto ==');
for (const c of casos) {
  armar();
  try { c.romper(); } catch (e) { console.log(`FALLA ${c.nombre}\n      no se pudo romper el banco: ${e.message}`); malos++; continue; }
  const h = hallazgos(correr());
  const propio = h[c.seccion] || 0;
  if (propio === 0) {
    console.log(`FALLA ${c.nombre}  → [${c.seccion}] siguió en 0 (el control no lo vio)`);
    malos++; continue;
  }
  const otros = Object.entries(h).filter(([k, n]) => k !== c.seccion && n > 0).map(([k, n]) => `${k}=${n}`);
  console.log(`OK    ${c.nombre}  → [${c.seccion}] 0→${propio}${otros.length ? '   (además: ' + otros.join(', ') + ')' : ''}`);
}

// -- CASO BUENO fino: la cita no cuenta como uso ----------------------------
// Regresion del 30/07/2026: nombrar un termino para explicar su veto es legitimo, y sin esta
// exencion la lista de hallazgos se llenaba de menciones que no habia que corregir.
// Desde el 02/08/2026 se verifican los DOS grupos que el lint informa, no solo el de texto plano.
// La cita caia fuera de texto plano —eso ya se probaba— pero se listaba igual bajo `codigo/nombres`,
// que es donde van las apariciones que si hay que refactorizar: 164 de 255 renglones eran citas y
// sepultaban las pocas accionables. Ahora van a un tercer grupo que no se informa, y esta prueba es
// lo unico que lo vigila: si el clasificador de citas se rompiera y las mandara de vuelta a
// cualquiera de los dos grupos, aca se enciende.
console.log('\n== CASO BUENO: citar un término vetado no es usarlo ==');
const informados = s => {
  const v = /APARICIONES DE VETADOS \(prosa: (\d+), codigo: (\d+)\)/.exec(s);
  return v ? [parseInt(v[1], 10), parseInt(v[2], 10)] : [0, 0];
};
for (const [nombre, texto] of [
  ['entre comillas simples invertidas', `El término \`${VETADO}\` está vetado en este repo.\n`],
  ['entre comillas rectas', `El término "${VETADO}" está vetado en este repo.\n`],
  ['entre comillas angulares', `El término «${VETADO}» está vetado en este repo.\n`],
]) {
  // Se mide el DELTA que introduce la nota: con el archivo agregado, ninguno de los dos grupos
  // tiene que moverse.
  armar();
  const [p0, c0] = informados(correr());
  nota(texto);
  const [p1, c1] = informados(correr());
  const bien = p1 === p0 && c1 === c0;
  console.log(`${bien ? 'OK  ' : 'FALLA'} ${nombre} → texto plano ${p0}→${p1}, código ${c0}→${c1}`);
  if (!bien) malos++;
}

// -- CASOS MALOS finos: los dos límites que `\b` no podía ------------------
// Arreglados el 30/07/2026 alineando con el control, que ya los tenía resueltos. `\b` es del
// alfabeto inglés y falla de dos maneras: no separa bien con acentos, y no funciona en absoluto si el
// término arranca con un carácter que no es letra. Las dos filas viven en el registro sintético.
console.log('\n== CASOS MALOS: los límites que `\\b` no podía ==');
{
  armar();
  nota(`El ${VETADO_LARGO.replace(/ /g, '   ')} está lleno.\n`);
  const n = hallazgos(correr())['VETADOS EN TEXTO PLANO'] || 0;
  console.log(`${n === 1 ? 'OK  ' : 'FALLA'} término de varias palabras con espacios de más → ${n} (1 esperada)`);
  if (n !== 1) malos++;
}
{
  armar();
  nota(`${VETADO_SIN_LETRA}\n\nUna sección con el encabezado viejo.\n`);
  const n = hallazgos(correr())['VETADOS EN TEXTO PLANO'] || 0;
  console.log(`${n === 1 ? 'OK  ' : 'FALLA'} término que arranca con un carácter que no es letra → ${n} (1 esperada)`);
  if (n !== 1) malos++;
}

// -- CASO BUENO fino: el repo que se barre es el que se le pasa -------------
// Regresion del 30/07/2026: el lint deducia el repo de su propia ubicacion, asi que apuntado a otro
// subsistema leia un registro y barria otro repo, sin emitir error.
// Lo que distingue este caso NO es el conteo alto: es que el repo de prueba vive bajo `.claude/tmp/`,
// y `tmp` esta EXCLUIDA del barrido. Si el lint estuviera barriendo el repo real, esta aparicion
// caeria dentro de una carpeta excluida y el conteo daria 0 en vez de 1. La afirmacion vale igual en
// cualquier instalacion, porque no depende de que el repo tenga ningun otro contenido.
console.log('\n== CASO BUENO: barre el repo que se le pasa, no el propio ==');
armar();
nota(`Una sola ${VETADO} en todo el repo de prueba.\n`);
{
  const h = hallazgos(correr());
  const n = h['VETADOS EN TEXTO PLANO'] || 0;
  console.log(`${n === 1 ? 'OK  ' : 'FALLA'} apuntado al repo de prueba → ${n} aparición(es) (1 esperada; barriendo el repo real daría 0, porque el banco vive bajo tmp/)`);
  if (n !== 1) malos++;
}

fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
console.log(`\ncasos: ${casos.length + 6}`);
console.log(malos ? `${malos} FALLARON.` : 'TODO VERDE.');
process.exit(malos ? 1 : 0);
