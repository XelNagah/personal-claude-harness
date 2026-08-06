// Prueba cada control de lint-conducta contra un caso malo y uno bueno.
//
// Este lint es el de mayor riesgo del repo, y su defecto no se ve en un informe: si deja de validar,
// el hook repartidor **deja de entregar reglas en silencio**. Una regla que apunta a un momento que
// no existe no falla — simplemente no se despacha nunca, y el agente sigue trabajando sin ella. Es
// el caso que la decision `Local-0042` describe: el repartidor ubica `Momento` y `Clase` por nombre
// de columna, y si una se renombra no encuentra ninguna y cada fila queda con el momento vacio.
//
// El banco es un REPO DE PRUEBA con `.claude/` entera, porque las reglas referencian rutas de otros
// subsistemas en su columna `Contenido` (la ruta del programa que corre una regla `Ejecutar`).
//
// Uso: node .claude/conducta/lint-conducta/pruebas.js   (desde la raíz del repo)
const fs = require('fs'), path = require('path'), cp = require('child_process');
const REPO_PRUEBA = '.claude/tmp/repo-prueba-conducta';
const BANCO = path.join(REPO_PRUEBA, '.claude', 'conducta');
const LINT = '.claude/conducta/lint-conducta/lint-conducta.js';

function armar() {
  fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
  const salteados = new Set(['tmp', 'pendientes', 'ejecutados', 'descartados']);
  fs.mkdirSync(path.join(REPO_PRUEBA, '.claude'), { recursive: true });
  for (const e of fs.readdirSync('.claude', { withFileTypes: true })) {
    if (salteados.has(e.name)) continue;
    fs.cpSync(path.join('.claude', e.name), path.join(REPO_PRUEBA, '.claude', e.name), {
      recursive: true,
      filter: src => !salteados.has(path.basename(src)),
    });
  }
  fs.rmSync(path.join(BANCO, 'lint-conducta'), { recursive: true, force: true });
}
const leer = f => fs.readFileSync(path.join(BANCO, f), 'utf8');
const escribir = (f, t) => fs.writeFileSync(path.join(BANCO, f), t);
const IDX = 'INDICE.md';

function correr() {
  const r = cp.spawnSync('node', [LINT, BANCO], { encoding: 'utf8' });
  return (r.stdout || '') + (r.stderr || '');
}
// hallazgos por seccion: el formato es `[TITULO] (N)`
function hallazgos(salida) {
  const out = {};
  for (const m of salida.matchAll(/^\[([^\]]+)\] \((\d+)\)/gm)) out[m[1]] = parseInt(m[2], 10);
  return out;
}
const total = h => Object.values(h).reduce((a, b) => a + b, 0);

// Cambia una celda por su NOMBRE de columna en la fila del código dado. Se ubica por nombre y no por
// posición justamente porque es el defecto que este subsistema ya sufrió.
function cambiarCelda(codigo, columna, valor) {
  const lineas = leer(IDX).split('\n');
  const iCab = lineas.findIndex(l => l.startsWith('| Código |'));
  const cab = lineas[iCab].split('|').slice(1, -1).map(c => c.trim());
  const col = cab.indexOf(columna);
  if (col < 0) throw new Error(`no existe la columna ${columna} (hay: ${cab.join(', ')})`);
  const iFila = lineas.findIndex(l => l.startsWith(`| ${codigo} `));
  if (iFila < 0) throw new Error(`no existe la fila ${codigo}`);
  const celdas = lineas[iFila].split('|').slice(1, -1);
  celdas[col] = ' ' + valor + ' ';
  lineas[iFila] = '|' + celdas.join('|') + '|';
  escribir(IDX, lineas.join('\n'));
}

let malos = 0;

console.log('== CASO BUENO: el banco intacto da cero ==');
armar();
{
  const h = hallazgos(correr());
  const t = total(h);
  console.log(`${t === 0 ? 'OK  ' : 'FALLA'} banco sin tocar → ${t} hallazgos${t ? '  ' + JSON.stringify(h) : ''}`);
  if (t !== 0) malos++;
}

const casos = [];
const caso = (nombre, seccion, romper) => casos.push({ nombre, seccion, romper });

// El defecto más caro: la regla existe, se ve bien en la tabla, y no se entrega nunca.
caso('regla atada a un momento que no existe', 'MOMENTO INEXISTENTE (regla apunta a un momento fuera de MOMENTOS.md)',
  () => cambiarCelda('Base-0002', 'Momento', 'cuando se le ocurra'));

caso('clase que no está en CLASES.md', 'CLASE INVALIDA',
  () => cambiarCelda('Base-0002', 'Clase', 'Sugerir'));

caso('estado inventado', 'ESTADO INVALIDO',
  () => cambiarCelda('Base-0002', 'Estado', 'casi vigente'));

// Dos formas de no tener contenido, y las dos tienen que encenderlo: la celda vacía y la celda con
// el guión, que es el marcador de «nada» en todos los registros del repo. La segunda pasaba el
// control hasta el 30/07/2026: la regla quedaba entregando una cadena vacía sin que nadie avisara.
caso('regla Inyectar con la celda de Contenido vacía', 'INYECTAR SIN CONTENIDO',
  () => cambiarCelda('Base-0002', 'Contenido', ''));

caso('regla Inyectar con Contenido en «—»', 'INYECTAR SIN CONTENIDO',
  () => cambiarCelda('Base-0002', 'Contenido', '—'));

// `al cerrar tarea` está declarado en MOMENTOS.md pero no tiene repartidor: una regla vigente ahí
// promete un comportamiento que nadie entrega.
caso('regla vigente sobre un momento sin repartidor', 'VIGENTE SOBRE MOMENTO SIN REPARTIDOR',
  () => cambiarCelda('Base-0002', 'Momento', 'al cerrar tarea'));

caso('columna declarada que la tabla no tiene', 'INDICES DECLARADOS (frontmatter vs tabla vs manifiesto)',
  () => escribir(IDX, leer(IDX).replace(/^columnas: \[(.+)\]$/m, 'columnas: [$1, Inventada]')));

caso('falta el vocabulario de momentos', 'ESTRUCTURA',
  () => fs.rmSync(path.join(BANCO, 'MOMENTOS.md')));

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
  console.log(`OK    ${c.nombre}  → 0→${propio}${otros.length ? '   (además: ' + otros.join(', ') + ')' : ''}`);
}

// -- EL PAR DE MOMENTOS: el repo puede sumar los suyos -----------------------
// Hasta el 30/07/2026 el único archivo de momentos era el del Agente Multipropósito, que el actualizador
// reemplaza entero: un repo que necesitaba un momento propio no tenía dónde declararlo sin perderlo
// en la corrida siguiente.
console.log('\n== EL PAR DE MOMENTOS ==');
{
  armar();
  fs.writeFileSync(path.join(BANCO, 'MOMENTOS-LOCAL.md'),
    '# Momentos del Agente Desplegado\n\n| Momento | Qué representa | Evento de hook | Disponibilidad |\n' +
    '|---|---|---|---|\n| antes de asentar una factura | Propio de este Propósito. | `PreToolUse` | declarado |\n');
  cambiarCelda('Base-0002', 'Momento', 'antes de asentar una factura');
  cambiarCelda('Base-0002', 'Estado', 'pendiente');
  const h = hallazgos(correr());
  const t = total(h);
  console.log(`${t === 0 ? 'OK  ' : 'FALLA'} una regla pendiente sobre un momento propio es válida → ${t} hallazgos${t ? '  ' + JSON.stringify(h) : ''}`);
  if (t !== 0) malos++;
}
{
  // El mismo momento propio, pero con la regla `vigente`: promete algo que ningún repartidor entrega.
  armar();
  fs.writeFileSync(path.join(BANCO, 'MOMENTOS-LOCAL.md'),
    '# Momentos del Agente Desplegado\n\n| Momento | Qué representa | Evento de hook | Disponibilidad |\n' +
    '|---|---|---|---|\n| antes de asentar una factura | Propio de este Propósito. | `PreToolUse` | declarado |\n');
  cambiarCelda('Base-0002', 'Momento', 'antes de asentar una factura');
  const n = hallazgos(correr())['VIGENTE SOBRE MOMENTO SIN REPARTIDOR'] || 0;
  console.log(`${n === 1 ? 'OK  ' : 'FALLA'} vigente sobre un momento propio sin repartidor → ${n} (1 esperado)`);
  if (n !== 1) malos++;
}
{
  // Un momento propio que repite uno de la Base: el de arriba manda y el de abajo lo pisaría callado.
  armar();
  fs.writeFileSync(path.join(BANCO, 'MOMENTOS-LOCAL.md'),
    '# Momentos del Agente Desplegado\n\n| Momento | Qué representa | Evento de hook | Disponibilidad |\n' +
    '|---|---|---|---|\n| cada turno | Repite el de la Base. | `UserPromptSubmit` | declarado |\n');
  const n = hallazgos(correr())['ESTRUCTURA'] || 0;
  console.log(`${n >= 1 ? 'OK  ' : 'FALLA'} un momento propio que repite uno de la Base se marca → ${n} (1 esperado)`);
  if (n < 1) malos++;
}
{
  // Sin el archivo del Agente Desplegado: es el estado normal, no un hallazgo.
  armar();
  const t = total(hallazgos(correr()));
  console.log(`${t === 0 ? 'OK  ' : 'FALLA'} sin MOMENTOS-LOCAL.md no se queja → ${t} hallazgos`);
  if (t !== 0) malos++;
}

// -- CASO BUENO fino: sin CLASES.md el lint NO se queja -----------------------
// Es deliberado y conviene dejarlo escrito para que nadie lo "arregle": un Agente Desplegado sin
// actualizar todavía no tiene ese archivo, y el lint se cae a las tres clases de siempre en vez de dar
// por inválida cada regla del repo. Si algún día esto se vuelve un hallazgo, es una decisión, no un
// descuido.
console.log('\n== CASO BUENO: sin CLASES.md se cae a las tres clases de siempre ==');
armar();
fs.rmSync(path.join(BANCO, 'CLASES.md'));
{
  const h = hallazgos(correr());
  const t = total(h);
  console.log(`${t === 0 ? 'OK  ' : 'FALLA'} CLASES.md ausente → ${t} hallazgos (0 esperados: es un caso soportado)`);
  if (t !== 0) malos++;
}

// -- CASO BUENO fino: el Índice del Agente Desplegado sin filas es válido ----
// Un repo recién instalado tiene su `INDICE-LOCAL.md` declarado y sin ninguna regla propia. Eso no
// es un defecto: es el estado normal, y el lint no tiene que marcarlo.
console.log('\n== CASO BUENO: el Índice del Agente Desplegado sin filas es válido ==');
armar();
{
  const h = hallazgos(correr());
  const t = total(h);
  console.log(`${t === 0 ? 'OK  ' : 'FALLA'} INDICE-LOCAL.md declarado y sin reglas → ${t} hallazgos`);
  if (t !== 0) malos++;
}

fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
console.log(`\ncasos: ${casos.length + 2}`);
console.log(malos ? `${malos} FALLARON.` : 'TODO VERDE.');
process.exit(malos ? 1 : 0);
