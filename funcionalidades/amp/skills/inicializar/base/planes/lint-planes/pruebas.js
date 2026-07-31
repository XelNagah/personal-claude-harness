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

function armar() {
  fs.rmSync(BANCO, { recursive: true, force: true });
  fs.cpSync(ORIGEN, BANCO, { recursive: true });
  fs.rmSync(path.join(BANCO, 'lint-planes'), { recursive: true, force: true });
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
  () => escribir(reg().replace(/(\| Local-0007 \| )[^|]+(\|)/, '$1Habilidad de ejecución de planes $2')));
caso('Descripción vacía', 'NUCLEO DEL INDICE (código, Nombre, Descripción, orden)',
  () => escribir(reg().replace(/(\| Local-0008 \| [^|]+\| )[^|]+(\|)/, '$1— $2')));
caso('filas fuera de orden ascendente', 'NUCLEO DEL INDICE (código, Nombre, Descripción, orden)',
  () => { const l = reg().split('\n'); const i = l.findIndex(x => x.startsWith('| Local-0010 '));
          const j = l.findIndex(x => x.startsWith('| Local-0011 '));
          [l[i], l[j]] = [l[j], l[i]]; escribir(l.join('\n')); });
caso('archivo sin fila en el registro', 'ARCHIVOS SIN FILA EN PLANES.md',
  () => escribir(reg().split('\n').filter(x => !x.startsWith('| Local-0015 ')).join('\n')));
caso('fila colgada (archivo inexistente)', 'FILAS COLGADAS (archivo no existe)',
  () => escribir(reg().replace(/(\| Local-0015 \|[^\n]*)pendientes\/Estructura del documento de Plan\.md\)/,
                               '$1pendientes/No existe.md)')));
caso('estado que no está en ESTADOS.md', 'ESTADO INVALIDO (no esta en ESTADOS.md)',
  () => escribir(reg().replace(/(\| Local-0015 \| [^|]+\| [^|]+\| )Nuevo /, '$1Inventado ')));
caso('estado vs carpeta inconsistente', 'ESTADO vs CARPETA INCONSISTENTE',
  () => escribir(reg().replace(/(\| Local-0015 \| [^|]+\| [^|]+\| )Nuevo /, '$1Ejecutado ')));
caso('cierre a medias (terminal sin fecha de cierre)', 'CIERRES A MEDIAS',
  () => escribir(reg().replace(/(\| Local-0001 \| [^|]+\| [^|]+\| Ejecutado \| 26-07-18 \| )26-07-18 /, '$1— ')));
caso('descartado sin sección de notas de cierre', 'DESCARTADOS SIN MOTIVO',
  () => { const f = path.join(BANCO, 'descartados/Restaurar la portabilidad copiar y pegar del orquestador.md');
          fs.writeFileSync(f, fs.readFileSync(f, 'utf8').replace(/^#{1,6}\s+Notas de cierre.*$/mi, '## Otra cosa')); });
caso('ejecutado sin sección de implementación', 'EJECUTADOS SIN SECCIÓN DE IMPLEMENTACIÓN',
  () => { const f = path.join(BANCO, 'ejecutados/Excluir tmp del barrido de los lints de subsistema.md');
          fs.writeFileSync(f, fs.readFileSync(f, 'utf8').replace(/^#{1,6}\s+(Notas de )?[Ii]mplementaci[oó]n.*$/m, '## Otra cosa')); });
caso('pendiente con marcador de resuelto', 'PENDIENTES CON MARCADOR DE RESUELTO (¿mover a ejecutados?)',
  () => { const f = path.join(BANCO, 'pendientes/Estructura del documento de Plan.md');
          fs.appendFileSync(f, '\n\n## Notas de implementación\n\nHecho.\n'); });
caso('columna declarada que la tabla no tiene', 'INDICES DECLARADOS (frontmatter vs tabla vs manifiesto)',
  () => escribir(reg().replace('| Código | Nombre |', '| Codigo | Nombre |')));
caso('fila sin Detalle (no apunta a ningún archivo)', 'NUCLEO DEL INDICE (código, Nombre, Descripción, orden)',
  () => escribir(reg().replace(/(\| Local-0020 \|[^\n]*\| )\[[^\n]*\](\([^)]*\)) \|/, '$1 |')));

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
// seguir leyendose mientras haya Agentes Desplegados sin nivelar.
console.log('\n== FORMA VIEJA: un Agente Desplegado sin nivelar sigue validandose ==');
armar();
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
  // El manifiesto de un Agente Desplegado sin nivelar tampoco declara sus Indices: sacar el
  // frontmatter y dejar el manifiesto declarandolo es un estado que no existe en la realidad, y
  // el lint lo marca con razon (el dato quedaria escrito en dos lugares que nada sincroniza).
  const mani = path.join(BANCO, 'MANIFIESTO.md');
  fs.writeFileSync(mani, fs.readFileSync(mani, 'utf8').replace(/^\*\*[IÍ]ndices?:\*\*.*$/m, ''));
}
const vieja = hallazgos(correr());
console.log(`${total(vieja) === 0 ? 'OK  ' : 'FALLA'} forma vieja sin frontmatter → ${total(vieja)} hallazgos` +
            (total(vieja) ? '  ' + JSON.stringify(vieja) : ''));
if (total(vieja) !== 0) malos++;

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
  const viejo = 'pendientes/Estructura del documento de Plan.md';
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

// Dos Indices en el mismo subsistema: cada uno declara sus columnas, asi que el segundo no puede
// leerse con el mapa del primero ni aportar su encabezado como si fuera un plan.
console.log('\n== DOS INDICES: cada uno con su encabezado ==');
armar();
const esperadasDos = filasDelBanco();   // partir el registro en dos no cambia el total de filas
{
  const t = reg(), l = t.split('\n');
  const corte = l.findIndex(x => x.startsWith('| Local-0041 '));
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
// nivelador reemplaza entero, y al nivelar desaparecia junto con la validez de todos los planes
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

fs.rmSync(BANCO, { recursive: true, force: true });
console.log(`\n${malos === 0 ? 'TODO OK' : malos + ' FALLAS'}`);
process.exit(malos ? 1 : 0);
