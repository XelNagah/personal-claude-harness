// Prueba cada control de lint-planes contra un caso bueno y uno malo. Un lint que lee mal contesta
// en verde sobre un conjunto vacio, asi que verde no prueba nada por si solo: cada control tiene
// que ENCENDERSE ante su defecto. Arma un banco en .claude/tmp/, lo rompe de a un defecto por vez
// y verifica que el hallazgo esperado aparezca (y que ningun otro control se dispare de mas).
// Uso: node .claude/planes/lint-planes/pruebas.js   (desde la raíz del repo)
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ORIGEN = '.claude/planes', BANCO = '.claude/tmp/banco-planes';
const LINT = '.claude/planes/lint-planes/lint-planes.js';

// Cuántas filas tiene el registro del banco AHORA. Se cuenta en vez de escribirse: los dos casos
// del final comparaban contra un 81 escrito a mano y empezaron a fallar solos el día que el repo
// abrió el plan 82 — la prueba avisaba de un defecto del lint que no existía. Un número absoluto
// dentro de una prueba envejece igual que dentro de un registro.
const filasDelBanco = () => (reg().match(/^\| Local-/gm) || []).length;

// El banco FABRICA su registro y sus planes; no copia los del repo. Antes copiaba `.claude/planes`
// entero y rompía archivos por su nombre real y filas por su código, que son planes de ESTE repo. En
// un Agente Desplegado —donde el registro de planes es Aprendizaje propio y esos planes no existen—
// el banco no fallaba: REVENTABA con ENOENT en el primer caso que tocaba un archivo por nombre, y se
// llevaba puesta la corrida entera, con los últimos diez casos sin ejecutar. Reportado el 21/08/2026
// por un Agente Desplegado cuyo `descartados/` ni siquiera existía. Es la forma «escenario prestado»
// del conocimiento `controles-que-no-avisan`, y la Decisión `Local-0072` es la que la prohíbe.
//
// Lo único que se copia del subsistema instalado es lo que NO es contenido del repo: el par de
// estados, el manifiesto y el README, que son Componentes del Agente Multipropósito e iguales en
// todas las instalaciones. El registro y los planes se fabrican con datos sintéticos.
const DEL_SUBSISTEMA = ['ESTADOS.md', 'ESTADOS-LOCAL.md', 'MANIFIESTO.md', 'README.md'];

// Los tres planes que algún caso rompe por nombre de archivo. Se nombran una sola vez acá, para que
// ningún caso vuelva a escribir el nombre de un plan real.
const EJEC = 'ejecutados/Plan de prueba 01.md';
const DESC = 'descartados/Plan de prueba 02.md';
const PEND = 'pendientes/Plan de prueba 15.md';

// La fecha de apertura de los planes vivos se deriva del reloj en vez de escribirse: un plan con
// fecha fija envejece solo y cruza el umbral de antigüedad un día cualquiera, poniendo en rojo un
// caso que no cambió (medido el 19/08/2026 sobre este mismo banco).
const hoyAA = () => {
  const d = new Date();
  return [String(d.getFullYear()).slice(2), String(d.getMonth() + 1).padStart(2, '0'),
          String(d.getDate()).padStart(2, '0')].join('-');
};
const nn = n => String(n).padStart(2, '0');
const relDe = n => `pendientes/Plan de prueba ${nn(n)}.md`;
const enlace = rel => `[${rel}](${rel.replace(/ /g, '%20')})`;

function registroSintetico() {
  const hoy = hoyAA();
  const fila = (n, desc, estado, creado, cerrado, rel) =>
    `| Local-${String(n).padStart(4, '0')} | Plan de prueba ${nn(n)} | ${desc} | ${estado} | ${creado} | ${cerrado} | — | ${enlace(rel)} |`;
  const filas = [
    fila(1, 'Plan terminado, con sus notas de implementación', 'Ejecutado', '26-07-18', '26-07-18', EJEC),
    fila(2, 'Plan abandonado, con su motivo escrito', 'Descartado', '26-07-18', '26-07-19', DESC),
  ];
  for (let n = 3; n <= 20; n++) filas.push(fila(n, `Plan vivo de prueba, el número ${n}`, 'Nuevo', hoy, '—', relDe(n)));
  return '---\nindice: Registro de planes\norigen: agente-desplegado\n'
    + 'columnas: [Código, Nombre, Descripción, Estado, Fecha de creación, Fecha de cierre, Origen, Detalle]\n'
    + 'descripcion: de qué se trata el plan\n---\n\n# Registro de planes\n\n'
    + '| Código | Nombre | Descripción | Estado | Fecha de creación | Fecha de cierre | Origen | Detalle |\n'
    + '|--------|--------|-------------|--------|-------------------|-----------------|--------|---------|\n'
    + filas.join('\n') + '\n';
}

function armar() {
  fs.rmSync(BANCO, { recursive: true, force: true });
  for (const c of ['pendientes', 'ejecutados', 'descartados']) fs.mkdirSync(path.join(BANCO, c), { recursive: true });
  for (const f of DEL_SUBSISTEMA) {
    const src = path.join(ORIGEN, f);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(BANCO, f));
  }
  escribir(registroSintetico());
  const cuerpo = (n, estado, extra) =>
    `# Plan de prueba ${nn(n)}\n\n**Estado: ${estado}.**\n\nDatos sintéticos: este plan existe solo para romperlo.\n${extra || ''}`;
  fs.writeFileSync(path.join(BANCO, EJEC), cuerpo(1, 'Ejecutado', '\n## Notas de implementación\n\nHecho.\n'));
  fs.writeFileSync(path.join(BANCO, DESC), cuerpo(2, 'Descartado', '\n## Notas de cierre\n\nNo se hace: era de prueba.\n'));
  for (let n = 3; n <= 20; n++) fs.writeFileSync(path.join(BANCO, relDe(n)), cuerpo(n, 'Nuevo'));
}
const reg = () => fs.readFileSync(path.join(BANCO, 'PLANES.md'), 'utf8');
const escribir = t => fs.writeFileSync(path.join(BANCO, 'PLANES.md'), t);
function correr() {
  const r = cp.spawnSync('node', [LINT, BANCO], { encoding: 'utf8' });
  return (r.stdout || '') + (r.stderr || '');
}
// hallazgos por seccion: {titulo: cantidad}
function hallazgos(salida) {
  const out = {};
  for (const m of salida.matchAll(/^\[([^\]]+)\] \((\d+)\)$/gm)) out[m[1]] = parseInt(m[2], 10);
  return out;
}
const total = h => Object.values(h).reduce((a, b) => a + b, 0);

const casos = [];
const caso = (nombre, seccion, romper) => casos.push({ nombre, seccion, romper });

caso('código mal formado', 'NUCLEO DEL INDICE (código, Nombre, Descripción, orden)',
  () => escribir(reg().replace('| Local-0005 |', '| 0005 |')));
caso('prefijo que no corresponde al origen', 'NUCLEO DEL INDICE (código, Nombre, Descripción, orden)',
  () => escribir(reg().replace('| Local-0005 |', '| Base-0005 |')));
caso('código repetido', 'NUCLEO DEL INDICE (código, Nombre, Descripción, orden)',
  () => escribir(reg().replace('| Local-0006 |', '| Local-0005 |')));
caso('Nombre vacío', 'NUCLEO DEL INDICE (código, Nombre, Descripción, orden)',
  () => escribir(reg().replace(/(\| Local-0007 \| )[^|]+(\|)/, '$1 $2')));
caso('Nombre duplicado', 'NUCLEO DEL INDICE (código, Nombre, Descripción, orden)',
  () => escribir(reg().replace(/(\| Local-0007 \| )[^|]+(\|)/, '$1Plan de prueba 06 $2')));
caso('Descripción vacía', 'NUCLEO DEL INDICE (código, Nombre, Descripción, orden)',
  () => escribir(reg().replace(/(\| Local-0008 \| [^|]+\| )[^|]+(\|)/, '$1— $2')));
caso('filas fuera de orden ascendente', 'NUCLEO DEL INDICE (código, Nombre, Descripción, orden)',
  () => { const l = reg().split('\n'); const i = l.findIndex(x => x.startsWith('| Local-0010 '));
          const j = l.findIndex(x => x.startsWith('| Local-0011 '));
          [l[i], l[j]] = [l[j], l[i]]; escribir(l.join('\n')); });
caso('archivo sin fila en el registro', 'ARCHIVOS SIN FILA EN PLANES.md',
  () => escribir(reg().split('\n').filter(x => !x.startsWith('| Local-0015 ')).join('\n')));
caso('fila colgada (archivo inexistente)', 'FILAS COLGADAS (archivo no existe)',
  () => escribir(reg().replace(/(\| Local-0015 \|[^\n]*)pendientes\/[^)]*\)/,
                               '$1pendientes/No existe.md)')));
caso('estado que no está en ESTADOS.md', 'ESTADO INVALIDO (no esta en ESTADOS.md)',
  () => escribir(reg().replace(/(\| Local-0015 \| [^|]+\| [^|]+\| )Nuevo /, '$1Inventado ')));
caso('estado vs carpeta inconsistente', 'ESTADO vs CARPETA INCONSISTENTE',
  () => escribir(reg().replace(/(\| Local-0015 \| [^|]+\| [^|]+\| )Nuevo /, '$1Ejecutado ')));
caso('cierre a medias (terminal sin fecha de cierre)', 'CIERRES A MEDIAS',
  () => escribir(reg().replace(/(\| Local-0001 \| [^|]+\| [^|]+\| Ejecutado \| 26-07-18 \| )26-07-18 /, '$1— ')));
caso('descartado sin sección de notas de cierre', 'DESCARTADOS SIN MOTIVO',
  () => { const f = path.join(BANCO, DESC);
          fs.writeFileSync(f, fs.readFileSync(f, 'utf8').replace(/^#{1,6}\s+Notas de cierre.*$/mi, '## Otra cosa')); });
caso('ejecutado sin sección de implementación', 'EJECUTADOS SIN SECCIÓN DE IMPLEMENTACIÓN',
  () => { const f = path.join(BANCO, EJEC);
          fs.writeFileSync(f, fs.readFileSync(f, 'utf8').replace(/^#{1,6}\s+(Notas de )?[Ii]mplementaci[oó]n.*$/m, '## Otra cosa')); });
caso('pendiente con marcador de resuelto', 'PENDIENTES CON MARCADOR DE RESUELTO (¿mover a ejecutados?)',
  () => { const f = path.join(BANCO, PEND);
          fs.appendFileSync(f, '\n\n## Notas de implementación\n\nHecho.\n'); });
caso('columna declarada que la tabla no tiene', 'INDICES DECLARADOS (frontmatter vs tabla vs manifiesto)',
  () => escribir(reg().replace('| Código | Nombre |', '| Codigo | Nombre |')));
caso('fila sin Detalle (no apunta a ningún archivo)', 'NUCLEO DEL INDICE (código, Nombre, Descripción, orden)',
  () => escribir(reg().replace(/(\| Local-0020 \|[^\n]*\| )\[[^\n]*\](\([^)]*\)) \|/, '$1 |')));
caso('En pausa sin estado_a_retomar', 'EN PAUSA SIN estado_a_retomar VALIDO',
  () => escribir(reg().replace(/(\| Local-0015 \| [^|]+\| [^|]+\| )Nuevo /, '$1En pausa ')));
caso('estado_a_retomar en un estado que no es En pausa', 'estado_a_retomar EN UN ESTADO QUE NO ES EN PAUSA',
  () => fs.appendFileSync(path.join(BANCO, PEND),
                          '\n**estado_a_retomar:** En curso\n'));
// "En pausa" sale ademas hacia Diferido y Descartado, pero de esos no se RETOMA. Mientras los
// valores validos se derivaban de la fila "En pausa", este caso pasaba: el lint leia "Descartado"
// entre los destinos declarados y lo daba por bueno, sin emitir nada. Se derivan de los origenes.
caso('estado_a_retomar con una salida de cierre (no es un estado de retomada)', 'EN PAUSA SIN estado_a_retomar VALIDO',
  () => { escribir(reg().replace(/(\| Local-0015 \| [^|]+\| [^|]+\| )Nuevo /, '$1En pausa '));
          fs.appendFileSync(path.join(BANCO, PEND),
                            '\n**estado_a_retomar:** Descartado\n'); });
const romperEstados = f => { const p = path.join(BANCO, 'ESTADOS.md'); fs.writeFileSync(p, f(fs.readFileSync(p, 'utf8'))); };
caso('grafo: un terminal declara salidas', 'GRAFO DE TRANSICIONES MAL FORMADO (ESTADOS.md)',
  () => romperEstados(t => t.replace('| Ejecutado | — |', '| Ejecutado | Nuevo |')));
caso('grafo: transición a algo que no es estado', 'GRAFO DE TRANSICIONES MAL FORMADO (ESTADOS.md)',
  () => romperEstados(t => t.replace('| Diferido | Análisis, Descartado |', '| Diferido | Inventado |')));
caso('grafo: un estado de la Base sin fila de transiciones', 'GRAFO DE TRANSICIONES MAL FORMADO (ESTADOS.md)',
  () => romperEstados(t => t.replace('\n| Listo | Análisis, En curso, Diferido, Descartado |', '')));
caso('En pausa envejecido (interrumpido hace demasiado)', 'ACTIVOS ENVEJECIDOS (> 30 dias activo o en pausa: ¿sigue/retomar/diferido/descartado?)',
  () => { escribir(reg().replace(/(\| Local-0015 \| [^|]+\| [^|]+\| )Nuevo \| [0-9]{2}-[0-9]{2}-[0-9]{2}/, '$1En pausa | 20-01-01'));
          fs.appendFileSync(path.join(BANCO, PEND), '\n**estado_a_retomar:** En curso\n'); });

let malos = 0;
console.log('== CASO MALO: cada control tiene que encenderse ==\n');
for (const c of casos) {
  armar();
  const base = hallazgos(correr());
  c.romper();
  const h = hallazgos(correr());
  const subio = (h[c.seccion] || 0) > (base[c.seccion] || 0);
  const otros = Object.keys(h).filter(k => k !== c.seccion && (h[k] || 0) > (base[k] || 0));
  console.log(`${subio ? 'OK  ' : 'FALLA'} ${c.nombre}  → [${c.seccion}] ${base[c.seccion] || 0}→${h[c.seccion] || 0}` +
              (otros.length ? `   (además: ${otros.join(', ')})` : ''));
  if (!subio) malos++;
}

console.log('\n== CASO BUENO: el banco intacto tiene que dar cero ==');
armar();
const limpio = hallazgos(correr());
console.log(`${total(limpio) === 0 ? 'OK  ' : 'FALLA'} banco sin tocar → ${total(limpio)} hallazgos`);
if (total(limpio) !== 0) malos++;

// Compatibilidad: la forma vieja (| Plan | Estado | Creado | Cerrado | Origen | Notas |) tiene que
// seguir LEYENDOSE mientras haya Agentes Desplegados sin actualizar —el lint no se cae ni se queda sin
// filas— y ademas tiene que AVISAR que el registro quedo en la forma anterior. Son dos cosas
// distintas: esta prueba exigia cero hallazgos, y ese cero era justamente el silencio que hacia que
// un Agente Desplegado sin actualizar diera verde. Medido el 05/08/2026: cinco repos en la forma
// anterior contestaban "hallazgos: 0". Se controla el aviso, no su ausencia.
console.log('\n== FORMA VIEJA: se sigue leyendo Y avisa que quedo en la forma anterior ==');
armar();
// El conteo se toma ANTES de reescribir: despues las filas ya no empiezan con "| Local-".
const filasEsperadasVieja = filasDelBanco();
{
  const t = reg();
  const filas = t.split('\n').filter(l => l.startsWith('| Local-'));
  const viejas = filas.map(l => {
    const c = l.trim().replace(/^\|/, '').replace(/\|$/, '').split(/(?<!\\)\|/).map(x => x.trim());
    // c = [codigo, nombre, desc, estado, creado, cerrado, origen, detalle]
    return `| ${c[7]} | ${c[3]} | ${c[4]} | ${c[5]} | ${c[6]} | nota corta |`;
  });
  const cabecera = `# Registro de planes\n\n| Plan | Estado | Creado | Cerrado | Origen | Notas |\n|---|---|---|---|---|---|`;
  escribir(cabecera + '\n' + viejas.join('\n') + '\n');
  // El manifiesto de un Agente Desplegado sin actualizar tampoco declara sus Indices: sacar el
  // frontmatter y dejar el manifiesto declarandolo es un estado que no existe en la realidad, y
  // el lint lo marca con razon (el dato quedaria escrito en dos lugares que nada sincroniza).
  const mani = path.join(BANCO, 'MANIFIESTO.md');
  fs.writeFileSync(mani, fs.readFileSync(mani, 'utf8').replace(/^\*\*[IÍ]ndices?:\*\*.*$/m, ''));
}
const salidaVieja = correr();
const vieja = hallazgos(salidaVieja);
const filasViejas = /filas en registro: (\d+)/.exec(salidaVieja);
const leidas = filasViejas ? parseInt(filasViejas[1], 10) : 0;
const seccionAviso = 'INDICES DECLARADOS (frontmatter vs tabla vs manifiesto)';
// Se sigue leyendo: entraron todas las filas. Y avisa: exactamente un hallazgo, el del aviso.
const okVieja = leidas === filasEsperadasVieja && vieja[seccionAviso] === 1 && total(vieja) === 1;
console.log(`${okVieja ? 'OK  ' : 'FALLA'} forma vieja → ${leidas} filas leídas (${filasEsperadasVieja} esperadas) ` +
            `y ${total(vieja)} hallazgo(s), de los cuales ${vieja[seccionAviso] || 0} es el aviso de forma anterior` +
            (okVieja ? '' : '  ' + JSON.stringify(vieja)));
if (!okVieja) malos++;

// Tuberias escapadas: una celda que nombra columnas no puede correr las siguientes.
console.log('\n== TUBERIAS ESCAPADAS: una celda con \\| no corre las columnas ==');
armar();
escribir(reg().replace(/(\| Local-0009 \| [^|]+\| )([^|]+)(\|)/, '$1Núcleo `Código \\| Nombre` del Índice $3'));
const tub = hallazgos(correr());
console.log(`${total(tub) === 0 ? 'OK  ' : 'FALLA'} celda con tubería escapada → ${total(tub)} hallazgos` +
            (total(tub) ? '  ' + JSON.stringify(tub) : ''));
if (total(tub) !== 0) malos++;

// Un `%` suelto en el nombre de un archivo hacia que decodificar la ruta tirara URIError y
// volteara el lint entero. Regresion.
console.log('\n== RUTA CON % : no puede voltear el lint ==');
armar();
{
  const viejo = PEND;
  const nuevo = 'pendientes/100% de cobertura.md';
  fs.renameSync(path.join(BANCO, viejo), path.join(BANCO, nuevo));
  escribir(reg().split(viejo).join(nuevo));
}
const esperadasPorciento = filasDelBanco();
const conPorciento = correr();
const vivo = /filas en registro: (\d+)/.exec(conPorciento);
const okPorciento = vivo && Number(vivo[1]) === esperadasPorciento;
console.log(`${okPorciento ? 'OK  ' : 'FALLA'} ruta con % → filas leidas: ${vivo ? vivo[1] : 'el lint no corrio'} (${esperadasPorciento} esperadas)`);
if (!okPorciento) malos++;

// La forma <ruta> de CommonMark es la que usa el registro cuando el nombre lleva espacios o
// parentesis. Sin pelar los angulos, el cruce fila↔archivo daba un 0/N uniforme: la misma fila
// como colgada y su archivo como sin fila (reportado por un Agente Desplegado el 06/08/2026).
console.log('\n== RUTA ENTRE ANGULOS: la forma <ruta con espacios y parentesis> se cruza bien ==');
armar();
{
  const viejo = PEND;
  const nuevo = 'pendientes/Plan de prueba (forma B).md';
  fs.renameSync(path.join(BANCO, viejo), path.join(BANCO, nuevo));
  escribir(reg().replace(/\| Local-0015 \|([^\n]*\| )\[[^\]]*\]\([^\n|]*\)( \|)/,
    (_, medio, fin) => `| Local-0015 |${medio}[Plan de prueba (forma B).md](<${nuevo}>)${fin}`));
}
const conAngulos = hallazgos(correr());
console.log(`${total(conAngulos) === 0 ? 'OK  ' : 'FALLA'} link con <ruta> → ${total(conAngulos)} hallazgos` +
            (total(conAngulos) ? '  ' + JSON.stringify(conAngulos) : ''));
if (total(conAngulos) !== 0) malos++;

// Dos Indices en el mismo subsistema: cada uno declara sus columnas, asi que el segundo no puede
// leerse con el mapa del primero ni aportar su encabezado como si fuera un plan.
console.log('\n== DOS INDICES: cada uno con su encabezado ==');
armar();
const esperadasDos = filasDelBanco();   // partir el registro en dos no cambia el total de filas
{
  const t = reg(), l = t.split('\n');
  const corte = l.findIndex(x => x.startsWith('| Local-0011 '));
  const filas = l.slice(corte).filter(x => x.startsWith('| Local-'));
  escribir(l.slice(0, corte).join('\n') + '\n');
  fs.writeFileSync(path.join(BANCO, 'PLANES-EXTRA.md'),
    '---\nindice: Registro de planes extra\norigen: agente-desplegado\n' +
    'columnas: [Código, Nombre, Descripción, Estado, Fecha de creación, Fecha de cierre, Origen, Detalle]\n---\n\n' +
    '# Extra\n\n| Código | Nombre | Descripción | Estado | Fecha de creación | Fecha de cierre | Origen | Detalle |\n' +
    '|---|---|---|---|---|---|---|---|\n' + filas.join('\n') + '\n');
  const mani = path.join(BANCO, 'MANIFIESTO.md');
  fs.writeFileSync(mani, fs.readFileSync(mani, 'utf8')
    .replace(/^(\*\*[IÍ]ndices?:\*\*)/m, '$1 `PLANES-EXTRA.md` (Agente Desplegado) ·'));
}
const dos = correr();
const n2 = /filas en registro: (\d+)/.exec(dos);
const h2 = hallazgos(dos);
const okDos = n2 && Number(n2[1]) === esperadasDos && (h2['NUCLEO DEL INDICE (código, Nombre, Descripción, orden)'] || 0) === 0;
console.log(`${okDos ? 'OK  ' : 'FALLA'} dos Índices → filas: ${n2 ? n2[1] : '?'} (${esperadasDos} esperadas, sin fila fantasma del encabezado)`);
if (!okDos) { malos++; console.log(JSON.stringify(h2)); }

// El par de estados: los del Agente Multiproposito en ESTADOS.md y los que suma el Proposito de
// cada repo en ESTADOS-LOCAL.md. Sin este par, un estado propio se escribia en el archivo que el
// actualizador reemplaza entero, y al actualizar desaparecia junto con la validez de todos los planes
// que lo usaban.
console.log('\n== EL PAR DE ESTADOS ==');
const estadosLocal = (filas) =>
  '---\norigen: agente-desplegado\n---\n\n# Estados de planes del Agente Desplegado\n\n' +
  '| Estado | Sentido | Carpeta | Terminal |\n|---|---|---|---|\n' + filas + '\n';

// (a) un plan en un estado propio es valido
armar();
fs.writeFileSync(path.join(BANCO, 'ESTADOS-LOCAL.md'),
  estadosLocal('| En espera | Frenado esperando algo de afuera. | `pendientes/` | no |'));
// Se le cambia el estado a un plan que ya vive en `pendientes/`, que es la carpeta del estado
// propio: si no, el control de estado-vs-carpeta se enciende y la prueba culpa al control
// equivocado.
escribir(reg().replace('| Nuevo |', '| En espera |'));
const propio = hallazgos(correr());
console.log(`${total(propio) === 0 ? 'OK  ' : 'FALLA'} un plan en un estado propio es válido → ${total(propio)} hallazgos`);
if (total(propio) !== 0) { malos++; console.log(JSON.stringify(propio)); }

// (b) repetir abajo un estado del Agente Multiproposito se marca
armar();
fs.writeFileSync(path.join(BANCO, 'ESTADOS-LOCAL.md'),
  estadosLocal('| Nuevo | Otra cosa, con otra carpeta. | `ejecutados/` | sí |'));
const rep = hallazgos(correr());
const nRep = rep['ESTADO REPETIDO EN ESTADOS-LOCAL.md (el del Agente Multiproposito manda)'] || 0;
console.log(`${nRep === 1 ? 'OK  ' : 'FALLA'} un estado propio que repite uno de la Base se marca → ${nRep} (1 esperado)`);
if (nRep !== 1) { malos++; console.log(JSON.stringify(rep)); }

// (c) el archivo del Agente Desplegado es opcional: su ausencia no es un hallazgo
armar();
fs.rmSync(path.join(BANCO, 'ESTADOS-LOCAL.md'), { force: true });
const sinLocal = hallazgos(correr());
console.log(`${total(sinLocal) === 0 ? 'OK  ' : 'FALLA'} sin ESTADOS-LOCAL.md no se queja → ${total(sinLocal)} hallazgos`);
if (total(sinLocal) !== 0) { malos++; console.log(JSON.stringify(sinLocal)); }

// Caso bueno de estado_a_retomar: un plan En pausa CON el dato valido no dispara ningun control.
// El caso malo prueba que el control enciende sin el dato; este prueba que no es un control que
// marca siempre (marcar el caso legitimo lo volveria ruido que se aprende a ignorar).
console.log('\n== estado_a_retomar EN PAUSA (caso bueno) ==');
armar();
// El banco es copia del repo real, con sus fechas reales de apertura: al poner este plan En pausa
// heredaba la suya y cruzaba solo el umbral de 30 dias. El 19/08/2026 el caso se puso rojo sin que
// el repo hubiera cambiado — Local-0015 se abrio el 19/07 y ese dia cumplio 31. El caso malo de
// envejecidos ya fijaba su fecha (20-01-01); este la heredaba de la maquina. Ahora la declara
// tambien: un plan abierto hoy no esta envejecido ningun dia que se corra la prueba.
const d = new Date();
const abiertoHoy = [String(d.getFullYear()).slice(2), String(d.getMonth() + 1).padStart(2, '0'),
                    String(d.getDate()).padStart(2, '0')].join('-');
escribir(reg().replace(/(\| Local-0015 \| [^|]+\| [^|]+\| )Nuevo \| [0-9]{2}-[0-9]{2}-[0-9]{2}/, `$1En pausa | ${abiertoHoy}`));
fs.appendFileSync(path.join(BANCO, PEND),
                  '\n**estado_a_retomar:** En curso\n');
const pausaOk = hallazgos(correr());
console.log(`${total(pausaOk) === 0 ? 'OK  ' : 'FALLA'} En pausa con estado_a_retomar válido → ${total(pausaOk)} hallazgos`);
if (total(pausaOk) !== 0) { malos++; console.log(JSON.stringify(pausaOk)); }

fs.rmSync(BANCO, { recursive: true, force: true });
console.log(`\n${malos === 0 ? 'TODO OK' : malos + ' FALLAS'}`);
process.exit(malos ? 1 : 0);
