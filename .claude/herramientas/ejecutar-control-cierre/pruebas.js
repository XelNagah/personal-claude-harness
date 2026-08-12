#!/usr/bin/env node
// Pruebas de `ejecutar-control-cierre`.
//
// Es la Herramienta que decide si el repo está verde, y la que más corre de todo: la invoca
// `mostrar-pantalla-bienvenida`, o sea en cada arranque de sesión, y el actualizador la manda al
// cerrar. Su falla cara es de omisión: si dejara de descubrir un lint, el repo se informaría verde
// sobre un conjunto más chico y nadie lo notaría, porque lo que falta no aparece en ninguna lista.
//
// Por eso el caso central no es que reporte bien lo que corre, sino que **corra todo lo que hay**:
// los lints se descubren, no están escritos en el código.
//
// LÍMITE DECLARADO: `claude plugin validate` depende del CLI instalado en la máquina y del repo
// contra el que se lo corra, así que el banco NO controla su resultado — solo que aparezca como un
// chequeo más. Por eso los casos se afirman sobre las filas de los lints y no sobre el veredicto
// final del conjunto.
//
// Uso: node .claude/herramientas/ejecutar-control-cierre/pruebas.js   (desde la raíz del repo)
const fs = require('fs'), path = require('path'), cp = require('child_process');

const TOOL = path.resolve('.claude/herramientas/ejecutar-control-cierre/ejecutar-control-cierre.js');
const REPO_PRUEBA = path.resolve('.claude/tmp/repo-prueba-cierre');

let malos = 0, casos = 0;
function chequear(nombre, condicion, detalle) {
  casos++;
  console.log(`${condicion ? 'OK  ' : 'FALLA'} ${nombre}${detalle ? `  → ${detalle}` : ''}`);
  if (!condicion) malos++;
}

function correr() {
  const r = cp.spawnSync(process.execPath, [TOOL, REPO_PRUEBA], { encoding: 'utf8', timeout: 180000 });
  return { texto: (r.stdout || '') + (r.stderr || ''), codigo: r.status };
}

// Un lint de mentira, en la ubicación donde la Herramienta los busca: `.claude/<sub>/lint-<x>/`.
// `cuerpo` es lo que imprime y con qué código sale, que es lo que se está clasificando.
function ponerLint(sub, nombre, cuerpo, rel) {
  const dir = path.join(REPO_PRUEBA, '.claude', ...(rel || [sub]), nombre);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, nombre + '.js'), cuerpo);
}

// La fila que la Herramienta imprime para un chequeo: `  nombre    ESTADO`.
const fila = (texto, nombre) =>
  (texto.split(/\r?\n/).find(l => new RegExp('^\\s+' + nombre + '\\s{2,}').test(l)) || '').trim();

function armar() {
  fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
  fs.mkdirSync(path.join(REPO_PRUEBA, '.claude'), { recursive: true });
}

console.log('== DESCUBRE Y CLASIFICA ==');
armar();
// Verde: no imprime ninguna categoría con conteo.
ponerLint('uno', 'lint-uno', 'console.log("== LINT UNO ==");\n');
// Con hallazgos: la heurística cuenta las líneas de categoría que terminan en `(N)`.
ponerLint('dos', 'lint-dos', 'console.log("== LINT DOS ==\\n[REFS ROTAS] (2)\\n    a\\n    b\\n[HUERFANOS] (1)\\n    c");\n');
// Reventado: sale con código distinto de cero. Es un caso DISTINTO de tener hallazgos —uno describe
// el repo, el otro dice que el control no pudo mirarlo— y confundirlos deja pasar un control muerto.
ponerLint('tres', 'lint-tres', 'console.error("explotó");\nprocess.exit(1);\n');
{
  const { texto, codigo } = correr();
  chequear('corre y emite el reporte', /CONTROL DE CIERRE/.test(texto));
  chequear('descubre los lints sin tenerlos escritos en el código',
    ['lint-uno', 'lint-dos', 'lint-tres'].every(n => fila(texto, n)),
    ['lint-uno', 'lint-dos', 'lint-tres'].filter(n => !fila(texto, n)).join(', ') || 'los tres');
  chequear('un lint sin hallazgos queda OK', /\bOK$/.test(fila(texto, 'lint-uno')), fila(texto, 'lint-uno'));
  chequear('un lint con hallazgos los suma de todas sus categorías',
    /\b3 HALLAZGO\(S\)$/.test(fila(texto, 'lint-dos')), fila(texto, 'lint-dos'));
  chequear('un lint que revienta se marca ERROR, no como hallazgos',
    /\bERROR$/.test(fila(texto, 'lint-tres')), fila(texto, 'lint-tres'));
  chequear('muestra la salida completa de lo que no está verde',
    texto.includes('explotó') && /\[REFS ROTAS\]/.test(texto));
  chequear('cierra diciendo cuántos chequeos requieren atención',
    /\d+ chequeo\(s\) requieren atencion/.test(texto),
    (texto.match(/\d+ chequeo\(s\) requieren atencion/) || ['no lo dice'])[0]);
  // Decisión Local-0003: la capa mecánica REPORTA, no falla. Si esta Herramienta saliera con 1, el
  // hook que la invoca al arrancar la sesión trataría un hallazgo del repo como un error de sesión.
  chequear('reporta pero NO falla: sale con código 0 aunque haya rojos', codigo === 0, `código ${codigo}`);
}

console.log('\n== UN LINT NUEVO ENTRA SOLO ==');
{
  // Es la propiedad que sostiene todo lo demás: agregar un subsistema con su lint no requiere tocar
  // esta Herramienta. Si dejara de valer, el repo se informaría verde sobre menos de lo que tiene.
  const antes = correr().texto;
  ponerLint('cuatro', 'lint-cuatro', 'console.log("== LINT CUATRO ==");\n');
  const despues = correr().texto;
  const cuenta = t => Number((t.match(/chequeos:\s*(\d+)/) || [0, 0])[1]);
  chequear('sumar un lint nuevo lo suma al conteo sin tocar la Herramienta',
    cuenta(despues) === cuenta(antes) + 1 && !!fila(despues, 'lint-cuatro'),
    `${cuenta(antes)} → ${cuenta(despues)}`);
}

console.log('\n== NO CUENTA DOS VECES NI SE PIERDE ==');
{
  // No se desciende adentro de una carpeta de lint: un archivo que viva ahí no es otro chequeo.
  armar();
  ponerLint('cinco', 'lint-cinco', 'console.log("== LINT CINCO ==");\n');
  fs.mkdirSync(path.join(REPO_PRUEBA, '.claude', 'cinco', 'lint-cinco', 'lint-anidado'), { recursive: true });
  fs.writeFileSync(path.join(REPO_PRUEBA, '.claude', 'cinco', 'lint-cinco', 'lint-anidado', 'lint-anidado.js'),
    'console.log("no soy un chequeo");\n');
  const { texto } = correr();
  chequear('un lint adentro de otro lint no se cuenta como chequeo aparte',
    !fila(texto, 'lint-anidado'), fila(texto, 'lint-anidado') || 'no aparece');
}
{
  // Una carpeta `lint-x/` sin su `lint-x.js` no es un chequeo: contarla como tal daría un ERROR
  // permanente por un archivo que nadie escribió.
  armar();
  fs.mkdirSync(path.join(REPO_PRUEBA, '.claude', 'seis', 'lint-vacio'), { recursive: true });
  const { texto } = correr();
  chequear('una carpeta de lint sin su script no se cuenta',
    !fila(texto, 'lint-vacio'), fila(texto, 'lint-vacio') || 'no aparece');
}
{
  // `tmp/` queda afuera: ahí viven borradores y repos de prueba, y sus lints no son del repo. Sin
  // esto, este mismo banco haría aparecer chequeos fantasma en el repo autor.
  armar();
  ponerLint('siete', 'lint-siete', 'console.log("ok");\n', ['tmp', 'siete']);
  const { texto } = correr();
  chequear('los lints bajo tmp/ no se corren', !fila(texto, 'lint-siete'), fila(texto, 'lint-siete') || 'no aparece');
}

console.log('\n== CORRE EL BANCO QUE SU HERMANA NO PUEDE CORRER ==');
// `ejecutar-pruebas` declara verdes a todos los controles del repo, así que su banco no puede
// correrlo él: un descubrimiento roto tampoco encontraría ese archivo. Lo corre esta Herramienta.
// Es una PRUEBA, no un lint, así que el contrato cambia — la prueba falla con código 1 y acá se
// reporta como un chequeo más, sin que esta Herramienta falle (decisión Local-0003).
const BANCO_HERMANO = ['herramientas', 'ejecutar-pruebas'];
function ponerBancoHermano(cuerpo) {
  const dir = path.join(REPO_PRUEBA, '.claude', ...BANCO_HERMANO);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'pruebas.js'), cuerpo);
}
{
  armar();
  ponerBancoHermano('console.log("casos: 12");\nprocess.exit(0);\n');
  const { texto } = correr();
  chequear('el banco de ejecutar-pruebas se corre como un chequeo más',
    /\bOK$/.test(fila(texto, 'banco de ejecutar-pruebas')),
    fila(texto, 'banco de ejecutar-pruebas') || 'no aparece');
}
{
  armar();
  ponerBancoHermano('console.log("2 FALLARON.");\nprocess.exit(1);\n');
  const { texto, codigo } = correr();
  chequear('si ese banco falla se marca FALLA y se muestra su salida',
    /\bFALLA$/.test(fila(texto, 'banco de ejecutar-pruebas')) && texto.includes('2 FALLARON.'),
    fila(texto, 'banco de ejecutar-pruebas') || 'no aparece');
  chequear('y esta Herramienta sigue sin fallar ella misma', codigo === 0, `código ${codigo}`);
}
{
  // Que el archivo no esté es exactamente el estado que este chequeo viene a cerrar: sin banco, el
  // corredor de bancos vuelve a no tener quién lo controle. Saltearlo en silencio dejaría el repo
  // informándose verde con el agujero abierto.
  armar();
  const { texto } = correr();
  chequear('y si el banco no está se reporta AUSENTE, no se saltea',
    /\bAUSENTE$/.test(fila(texto, 'banco de ejecutar-pruebas')),
    fila(texto, 'banco de ejecutar-pruebas') || 'no aparece');
}

console.log('\n== CORRE TAMBIÉN LAS PRUEBAS DE LOS CONTROLES DEL REPO ==');
// El banco de arriba prueba al corredor; esto corre al corredor, que es otra cosa. Durante un
// tiempo se corrió solo el primero, y esta Herramienta declaró «TODO VERDE» con un banco del repo
// en rojo: el verde de acá no incluía las pruebas. Lo que sigue es ese agujero, cerrado.
const CORREDOR = ['herramientas', 'ejecutar-pruebas', 'ejecutar-pruebas.js'];
function ponerCorredor(cuerpo) {
  const destino = path.join(REPO_PRUEBA, '.claude', ...CORREDOR);
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, cuerpo);
}
{
  armar();
  ponerCorredor('console.log("TODO VERDE.");\nprocess.exit(0);\n');
  const { texto } = correr();
  chequear('el corredor de pruebas se corre como un chequeo más',
    /\bOK$/.test(fila(texto, 'pruebas de los controles')),
    fila(texto, 'pruebas de los controles') || 'no aparece');
}
{
  // El caso que motivó todo: un banco del repo en rojo tiene que teñir de rojo el control de
  // cierre. Si esto pasara a fallar, el verde volvería a significar menos de lo que dice.
  armar();
  ponerCorredor('console.log("1 prueba(s) fallaron: hay un control que dejó de controlar.");\nprocess.exit(1);\n');
  const { texto, codigo } = correr();
  chequear('un banco del repo en rojo se marca FALLA y se muestra su salida',
    /\bFALLA$/.test(fila(texto, 'pruebas de los controles')) && texto.includes('dejó de controlar'),
    fila(texto, 'pruebas de los controles') || 'no aparece');
  chequear('y esta Herramienta sigue sin fallar ella misma', codigo === 0, `código ${codigo}`);
}
{
  // Sin corredor no hay quién corra los bancos del repo, que es el mismo agujero con otra forma.
  armar();
  const { texto } = correr();
  chequear('y si el corredor no está se reporta AUSENTE, no se saltea',
    /\bAUSENTE$/.test(fila(texto, 'pruebas de los controles')),
    fila(texto, 'pruebas de los controles') || 'no aparece');
}

fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
console.log(`\ncasos: ${casos}`);
console.log('no cubierto a propósito: el resultado de `claude plugin validate`, que depende del CLI');
console.log('                         instalado en la máquina y no del repo que se está mirando.');
console.log(malos ? `${malos} FALLARON.` : 'TODO VERDE.');
process.exit(malos ? 1 : 0);
