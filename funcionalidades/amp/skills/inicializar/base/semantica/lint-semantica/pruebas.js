// Prueba cada control de lint-semantica contra un caso malo y uno bueno. Un lint que lee mal
// contesta en verde sobre un conjunto vacio, asi que verde no prueba nada por si solo: cada control
// tiene que ENCENDERSE ante su defecto, y solo ante el suyo.
//
// El banco es un REPO DE PRUEBA completo —con su propio `.claude/`— y no solo una copia de la
// carpeta del subsistema. Hace falta asi porque el lint barre el repo entero buscando apariciones de
// terminos vetados: si el banco no fuera un repo, ese barrido caeria sobre el repo real y los casos
// no serian aislados. Esto se volvio posible el 30/07/2026, cuando el lint paso a derivar el repo de
// la carpeta que se le pasa en vez de deducirlo de su propia ubicacion.
//
// Uso: node .claude/semantica/lint-semantica/pruebas.js   (desde la raíz del repo)
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ORIGEN = '.claude/semantica';
const REPO_PRUEBA = '.claude/tmp/repo-prueba-semantica';
const BANCO = path.join(REPO_PRUEBA, '.claude', 'semantica');
const LINT = '.claude/semantica/lint-semantica/lint-semantica.js';

function armar() {
  fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
  fs.mkdirSync(path.join(REPO_PRUEBA, '.claude'), { recursive: true });
  fs.cpSync(ORIGEN, BANCO, { recursive: true });
  fs.rmSync(path.join(BANCO, 'lint-semantica'), { recursive: true, force: true });
}
const leer = f => fs.readFileSync(path.join(BANCO, f), 'utf8');
const escribir = (f, t) => fs.writeFileSync(path.join(BANCO, f), t);
const GLO = 'GLOSARIO.md', FAR = 'TERMINOLOGIA-FARLOPA.md';

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
  () => escribir(GLO, leer(GLO).replace('| Local-0001 | Propósito |', '| Local-0001 | Propósito |').replace(
    /(\| Local-0002 \|[^\n]*\| )—( \|\n)/, '$1[pagina-que-no-existe.md](pagina-que-no-existe.md)$2')));

caso('página que ningún Índice referencia', 'PAGINAS HUERFANAS',
  () => fs.writeFileSync(path.join(BANCO, 'pagina-suelta.md'), '# Suelta\n\nNadie la referencia.\n'));

caso('mismo término legítimo y vetado a la vez', 'COLISIONES DE TERMINOS',
  () => escribir(FAR, leer(FAR).replace(/^\| Local-0039 \|/m, '| Local-0099 | `Propósito` | el objetivo del repo | otra cosa | avisa | — |\n| Local-0039 |')));

caso('propuesto sin ratificar', 'PROPUESTOS PENDIENTES DE RATIFICACION',
  () => escribir(GLO, leer(GLO).replace(/(\| Local-0001 \| Propósito \|[^\n]*\| )—( \| — \|)/, '$1palabra-propuesta$2')));

caso('columna declarada que la tabla no tiene', 'INDICES DECLARADOS',
  () => escribir(GLO, leer(GLO).replace('columnas: [Código, Nombre, Descripción, Alias, Propuestos, Detalle]',
    'columnas: [Código, Nombre, Descripción, Alias, Propuestos, Inventada, Detalle]')));

caso('término vetado usado en texto plano del repo', 'VETADOS EN TEXTO PLANO',
  () => fs.writeFileSync(path.join(REPO_PRUEBA, 'nota.md'), 'Este texto tiene mucho churn adentro.\n'));

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
console.log('\n== CASO BUENO: citar un término vetado no es usarlo ==');
// Desde el 02/08/2026 se verifican los DOS grupos que el lint informa, no solo el de texto plano.
// La cita caía fuera de texto plano —eso ya se probaba— pero se listaba igual bajo `codigo/nombres`,
// que es donde van las apariciones que sí hay que refactorizar: 164 de 255 renglones eran citas y
// sepultaban las pocas accionables. Ahora van a un tercer grupo que no se informa, y esta prueba es
// lo único que lo vigila: si el clasificador de citas se rompiera y las mandara de vuelta a
// cualquiera de los dos grupos, acá se enciende.
const informados = s => {
  const v = /APARICIONES DE VETADOS \(prosa: (\d+), codigo: (\d+)\)/.exec(s);
  return v ? [parseInt(v[1], 10), parseInt(v[2], 10)] : [0, 0];
};
for (const [nombre, texto] of [
  ['entre comillas simples invertidas', 'El término `churn` está vetado en este repo.\n'],
  ['entre comillas rectas', 'El término "churn" está vetado en este repo.\n'],
  ['entre comillas angulares', 'El término «churn» está vetado en este repo.\n'],
]) {
  // El banco puede traer apariciones propias en código, así que lo que se mide es el DELTA que
  // introduce la nota: con el archivo agregado, ninguno de los dos grupos tiene que moverse.
  armar();
  const [p0, c0] = informados(correr());
  fs.writeFileSync(path.join(REPO_PRUEBA, 'nota.md'), texto);
  const [p1, c1] = informados(correr());
  const bien = p1 === p0 && c1 === c0;
  console.log(`${bien ? 'OK  ' : 'FALLA'} ${nombre} → texto plano ${p0}→${p1}, código ${c0}→${c1}`);
  if (!bien) malos++;
}

// -- CASOS MALOS finos: los dos límites que `\b` no podía ------------------
// Arreglados el 30/07/2026 alineando con el control, que ya los tenía resueltos. `\b` es del
// alfabeto inglés y falla de dos maneras: no separa bien con acentos, y no funciona en absoluto si el
// término arranca con un carácter que no es letra.
console.log('\n== CASOS MALOS: los límites que `\\b` no podía ==');
{
  armar();
  fs.writeFileSync(path.join(REPO_PRUEBA, 'nota.md'), 'La capa   de   plugins va primero.\n');
  const n = hallazgos(correr())['VETADOS EN TEXTO PLANO'] || 0;
  console.log(`${n === 1 ? 'OK  ' : 'FALLA'} término de varias palabras con espacios de más → ${n} (1 esperada)`);
  if (n !== 1) malos++;
}
{
  armar();
  // Se suma al registro del banco una relación que arranca con `#`: con `\b` no se encontraba nunca,
  // y el veto quedaba escrito sin vigilar a nadie.
  escribir(FAR, leer(FAR).replace(/^\| Local-0039 \|/m,
    '| Local-0098 | `## Adaptaciones` | el encabezado viejo de un Índice | `## Preferencias del Agente Desplegado` | avisa | — |\n| Local-0039 |'));
  fs.writeFileSync(path.join(REPO_PRUEBA, 'nota.md'), '## Adaptaciones\n\nUna sección con el encabezado viejo.\n');
  const n = hallazgos(correr())['VETADOS EN TEXTO PLANO'] || 0;
  console.log(`${n === 1 ? 'OK  ' : 'FALLA'} término que arranca con un carácter que no es letra → ${n} (1 esperada)`);
  if (n !== 1) malos++;
}

// -- CASO BUENO fino: el repo que se barre es el que se le pasa -------------
// Regresion del 30/07/2026: el lint deducia el repo de su propia ubicacion, asi que apuntado a otro
// subsistema leia un registro y barria otro repo, sin emitir error.
console.log('\n== CASO BUENO: barre el repo que se le pasa, no el propio ==');
armar();
fs.writeFileSync(path.join(REPO_PRUEBA, 'nota.md'), 'Un solo churn en todo el repo de prueba.\n');
{
  const h = hallazgos(correr());
  const n = h['VETADOS EN TEXTO PLANO'] || 0;
  console.log(`${n === 1 ? 'OK  ' : 'FALLA'} apuntado al repo de prueba → ${n} aparición(es) (1 esperada; si fueran más, está barriendo el repo real)`);
  if (n !== 1) malos++;
}

fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
console.log(`\ncasos: ${casos.length + 5}`);
console.log(malos ? `${malos} FALLARON.` : 'TODO VERDE.');
process.exit(malos ? 1 : 0);
