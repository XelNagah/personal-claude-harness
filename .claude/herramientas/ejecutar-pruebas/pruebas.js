#!/usr/bin/env node
// Pruebas de `ejecutar-pruebas.js`, el corredor de los bancos del repo.
//
// Es el último control de la cadena y el que más se parece a su propio modo de falla: declara
// verdes a todos los demás, así que si el descubrimiento se rompe informa «TODO VERDE» sobre cero
// bancos y nadie se entera. El conocimiento `controles-que-no-avisan` lo llama validar sobre un
// conjunto vacío.
//
// ⚠️ QUIÉN CORRE ESTE BANCO. Lo corre `ejecutar-control-cierre`, NO `ejecutar-pruebas`. Si lo
// descubriera el propio corredor no probaría nada: un descubrimiento roto tampoco encontraría este
// archivo, y el hueco quedaría abierto con el banco en verde. Son Herramientas distintas, así que la
// circularidad desaparece sin inventar un piso numérico —«tienen que ser al menos 16»— que envejece
// solo con abrir un lint más.
//
// El repo de prueba se arma bajo `.claude/tmp/`, que el corredor excluye: acá se escriben archivos
// llamados `pruebas.js` a propósito, y en cualquier otro lado el barrido del repo real los levantaría
// como bancos verdaderos.
//
// Uso: node .claude/herramientas/ejecutar-pruebas/pruebas.js   (desde la raíz del repo)
const fs = require('fs'), path = require('path'), cp = require('child_process');

const CORREDOR = path.resolve('.claude/herramientas/ejecutar-pruebas/ejecutar-pruebas.js');
const REPO_PRUEBA = path.resolve('.claude/tmp/repo-prueba-corredor');
const RUTA_EXCLUIDA = 'funcionalidades/amp/skills/inicializar/base';

let malos = 0, casos = 0;
function chequear(nombre, condicion, detalle) {
  casos++;
  console.log(`${condicion ? 'OK  ' : 'FALLA'} ${nombre}${detalle ? `  → ${detalle}` : ''}`);
  if (!condicion) malos++;
}

function correr() {
  const r = cp.spawnSync(process.execPath, [CORREDOR, REPO_PRUEBA], { encoding: 'utf8', timeout: 180000 });
  return { texto: (r.stdout || '') + (r.stderr || ''), codigo: r.status };
}

// Un repo pelado: tiene `.claude/` —que es lo que el corredor busca para ubicar la raíz— y ningún
// banco. De acá para arriba cada caso agrega lo suyo.
//
// La carpeta del propio corredor se crea vacía porque el corredor la excluye, y una exclusión que
// apunta a algo que no está emite un aviso: sin ella, todos los casos de abajo arrastrarían un
// aviso que no tiene que ver con lo que prueban.
function repoVacio() {
  fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
  fs.mkdirSync(path.join(REPO_PRUEBA, '.claude', 'herramientas', 'ejecutar-pruebas'), { recursive: true });
}

// Un banco de mentira que sale con el código pedido. `casos:` va en la salida porque el corredor lo
// parsea para el detalle del reporte.
function ponerBanco(rel, { codigo = 0, casos = 3, salida = '' } = {}) {
  const dir = path.join(REPO_PRUEBA, rel);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'pruebas.js'),
    `console.log(${JSON.stringify(salida || 'banco de mentira')});\n` +
    `console.log('casos: ${casos}');\nprocess.exit(${codigo});\n`);
  return dir;
}

// El nombre con que el corredor rotula un banco sale del script hermano, así que un banco sin
// hermano se rotula por su carpeta. Los casos que miran el rótulo ponen el hermano.
function ponerHermano(dir, nombre) {
  fs.writeFileSync(path.join(dir, nombre + '.js'), '// el control que el banco acompaña\n');
}

const marca = (texto, item, motivo) =>
  texto.split(/\r?\n/).some(l => l.includes(item) && (!motivo || l.includes(motivo)));

console.log('== CERO BANCOS NO ES VERDE ==');
{
  // El caso que da nombre a este banco. Un repo sin ninguna `pruebas.js` no está sano: o el
  // descubrimiento se rompió, o la instalación quedó a medias. Mientras esto salía en 0, romper el
  // barrido dejaba al corredor informando éxito sobre la nada.
  repoVacio();
  const { texto, codigo } = correr();
  chequear('un repo sin ningún banco sale en rojo', codigo === 1, `código ${codigo}`);
  chequear('y dice que cero encontradas no es un repo sano',
    /descubrimiento roto|instalaci[oó]n incompleta/i.test(texto));
  chequear('y NO dice TODO VERDE', !/TODO VERDE/.test(texto));
}

console.log('\n== DESCUBRIMIENTO: LAS DOS RAÍCES, Y NADA MÁS ==');
{
  // Las dos raíces existen por motivos distintos: `.claude/` es donde viven los lints de cada
  // subsistema, y `funcionalidades/` porque ahí vive código propio que ningún otro barrido alcanza
  // —el motor del actualizador—. Que encuentre una y no la otra deja bancos sin correr, y un banco que
  // no se corre es lo mismo que no tenerlo.
  repoVacio();
  ponerHermano(ponerBanco('.claude/planes/lint-planes'), 'lint-planes');
  ponerHermano(ponerBanco('funcionalidades/amp/skills/actualizar'), 'amp-actualizar');
  const { texto, codigo } = correr();
  chequear('encuentra el banco de .claude/ y el de funcionalidades/',
    marca(texto, 'lint-planes', 'OK') && marca(texto, 'amp-actualizar', 'OK'),
    (texto.match(/pruebas: \d+/) || ['sin conteo'])[0]);
  chequear('y con todo en verde cierra en verde', /TODO VERDE/.test(texto) && codigo === 0, `código ${codigo}`);
}
{
  // Los bancos de `base/` son COPIAS de los de `.claude/`, que ya corren. Correrlos otra vez no
  // controla nada nuevo: solo infla el número que este corredor informa, y un tablero con
  // duplicados adentro se deja de leer. La exclusión va por ruta y no por nombre de carpeta a
  // propósito — excluir la palabra `base` apagaría en silencio cualquier otra que llegara a
  // llamarse así.
  repoVacio();
  ponerHermano(ponerBanco('.claude/planes/lint-planes'), 'lint-planes');
  ponerBanco(RUTA_EXCLUIDA + '/planes/lint-planes');
  const { texto } = correr();
  const cuantas = Number((texto.match(/pruebas: (\d+)/) || [0, 0])[1]);
  chequear('el banco que viaja en base/ NO se cuenta dos veces', cuantas === 1, `${cuantas} banco(s)`);
}
{
  // Una exclusión que apunta a una carpeta que ya no está dejó de excluir algo. Eso se nota en el
  // conteo pero no dice por qué, así que se avisa. Solo cuando la raíz existe: un Agente Desplegado
  // no tiene `funcionalidades/` y ahí no hay nada que reportar.
  repoVacio();
  ponerHermano(ponerBanco('.claude/planes/lint-planes'), 'lint-planes');
  ponerBanco('funcionalidades/amp/skills/actualizar');
  const { texto } = correr();
  chequear('avisa que una exclusión ya no existe', marca(texto, RUTA_EXCLUIDA, 'ya no existe'));
}
{
  // Caso bueno del aviso anterior: sin `funcionalidades/` no hay nada que avisar. Un Agente
  // Desplegado —que es la mayoría de los repos donde esto corre— no la tiene, y un aviso que sale
  // siempre es ruido que entrena a saltear la salida entera.
  repoVacio();
  ponerHermano(ponerBanco('.claude/planes/lint-planes'), 'lint-planes');
  const { texto } = correr();
  chequear('y NO avisa cuando la raíz entera no existe',
    !marca(texto, RUTA_EXCLUIDA, 'ya no existe') && !marca(texto, 'ya no existe'));
}

console.log('\n== EL RESULTADO DE CADA BANCO LLEGA ENTERO ==');
{
  // Lo que este corredor tiene que hacer: si un banco falla, decirlo y salir en rojo. Es su razón
  // de ser, así que va con caso bueno y caso malo en la misma corrida — y el bueno importa igual,
  // porque un corredor que marca siempre no distingue un control roto de uno sano.
  repoVacio();
  ponerHermano(ponerBanco('.claude/planes/lint-planes', { codigo: 1, salida: '2 FALLARON.' }), 'lint-planes');
  ponerHermano(ponerBanco('.claude/semantica/lint-semantica'), 'lint-semantica');
  const { texto, codigo } = correr();
  chequear('un banco que falla se marca y el corredor sale en rojo',
    marca(texto, 'lint-planes', 'FALLA') && codigo === 1, `código ${codigo}`);
  chequear('y el que pasó en la misma corrida NO se marca',
    marca(texto, 'lint-semantica', 'OK') && !marca(texto, 'lint-semantica', 'FALLA'));
  chequear('y la salida del que falló se muestra entera',
    marca(texto, '2 FALLARON.'));
}
{
  // Un banco que revienta antes de decir nada —error de sintaxis, dependencia que no está— sale con
  // código distinto de cero sin haber chequeado nada. Tratarlo como éxito sería creerle a un control
  // que ni siquiera arrancó.
  repoVacio();
  const dir = path.join(REPO_PRUEBA, '.claude/planes/lint-planes');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'pruebas.js'), 'esto no es javascript válido {{{\n');
  ponerHermano(dir, 'lint-planes');
  const { texto, codigo } = correr();
  chequear('un banco que revienta no se informa verde',
    !/TODO VERDE/.test(texto) && codigo === 1, `código ${codigo}`);
}

fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
console.log(`\ncasos: ${casos}`);
console.log('lo corre `ejecutar-control-cierre`, no `ejecutar-pruebas`: un descubrimiento roto');
console.log('                         tampoco encontraría este archivo.');
console.log(malos ? `${malos} FALLARON.` : 'TODO VERDE.');
process.exit(malos ? 1 : 0);
