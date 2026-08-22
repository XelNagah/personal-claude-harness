#!/usr/bin/env node
// Pruebas de `inventariar-componentes-sueltos`.
//
// Esta Herramienta contesta "qué hay acá adentro que no pertenece a nada declarado", y sus dos
// fallas son opuestas y las dos graves. De más: un hallazgo permanente que nadie puede llevar a
// cero —es lo que le pasó con su lista escrita a mano, que marcaba en los diez Agentes Desplegados
// una carpeta que el propio Agente Multipropósito les había instalado—. De menos: callar sobre algo
// real, que es peor porque el reporte en cero se lee como "acá está todo bien".
//
// Por eso cada fuente de reconocimiento se prueba con su par: algo que esa fuente tiene que
// reconocer y algo que NO, y que sí tiene que salir como hallazgo. Un banco que solo probara el
// reconocimiento no distinguiría una fuente que anda de una que reconoce todo.
//
// El escenario es SINTÉTICO y se fabrica entero, porque un banco que viaja no puede medir
// contenido del repo que lo corre: no lee el `.claude/` del repo
// que corre el banco. Un caso que buscara texto del repo autor pasaría en verde en toda otra
// instalación sin ejercitar nada.
//
// Uso: node .claude/herramientas/inventariar-componentes-sueltos/pruebas.js   (desde la raíz del repo)
const fs = require('fs'), path = require('path'), cp = require('child_process');

const TOOL = path.resolve('.claude/herramientas/inventariar-componentes-sueltos/inventariar-componentes-sueltos.js');
const REPO_PRUEBA = path.resolve('.claude/tmp/repo-prueba-inventario');
const CLAUDE = path.join(REPO_PRUEBA, '.claude');

let malos = 0, casos = 0;
function chequear(nombre, condicion, detalle) {
  casos++;
  console.log(`${condicion ? 'OK  ' : 'FALLA'} ${nombre}${detalle ? `  → ${detalle}` : ''}`);
  if (!condicion) malos++;
}

function correr() {
  const r = cp.spawnSync(process.execPath, [TOOL, REPO_PRUEBA], { encoding: 'utf8', timeout: 60000 });
  return (r.stdout || '') + (r.stderr || '');
}

// La sección de un reporte, como lista de líneas. Se busca por sección y no por texto suelto: que un
// nombre aparezca en el reporte no dice nada — lo que importa es EN QUÉ GRUPO cayó, y un chequeo que
// solo mire si el nombre está presente da verde aunque la Herramienta lo haya clasificado al revés.
function seccion(texto, titulo) {
  const ls = texto.split('\n');
  const i = ls.findIndex(l => l.startsWith(`[${titulo}`));
  if (i < 0) return null;
  const out = [];
  for (const l of ls.slice(i + 1)) {
    if (l.startsWith('[')) break;
    const t = l.trim();
    if (t && t !== '(ninguno)') out.push(t);
  }
  return out;
}
const enSeccion = (texto, titulo, nombre) => (seccion(texto, titulo) || []).some(l => l.startsWith(nombre));

const SUELTOS = 'COMPONENTES SUELTOS EN .claude/';
const SUBS = 'SUBSISTEMAS RECONOCIDOS';
const DECLARADOS = 'DECLARADOS POR UN ÍNDICE';
const INFRA = 'INFRAESTRUCTURA CONOCIDA';
const TRABAJO = 'MATERIAL DE TRABAJO';

function escribir(rel, txt) {
  const f = path.join(CLAUDE, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, txt, 'utf8');
}
const carpeta = rel => fs.mkdirSync(path.join(CLAUDE, rel), { recursive: true });

// El repo de prueba se inicializa como repo git PROPIO. Sin `git init`, el `check-ignore` lo
// contestaría el repo que contiene al banco —que gitignorea `.claude/tmp/`, donde el banco vive— y
// respondería que todo está ignorado: los casos de material de trabajo no podrían fallar nunca.
function armar(gitignore) {
  fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
  fs.mkdirSync(CLAUDE, { recursive: true });
  cp.spawnSync('git', ['init', '-q'], { cwd: REPO_PRUEBA, timeout: 30000 });
  fs.writeFileSync(path.join(REPO_PRUEBA, '.gitignore'), (gitignore || '') + '\n', 'utf8');
}

// Un catálogo de subsistemas con las casas que se le pasen, en la forma del Patrón.
const catalogo = casas => '---\nindice: Subsistemas\norigen: agente-multiproposito\n'
  + 'columnas: [Código, Nombre, Detalle]\n---\n\n# Subsistemas\n\n'
  + '| Código | Nombre | Detalle |\n|---|---|---|\n'
  + casas.map((c, n) => `| Base-000${n + 1} | ${c} | [${c}/](../${c}/) |`).join('\n') + '\n';

console.log('== LAS TRES FUENTES RECONOCEN, Y LO QUE NO ESTÁ EN NINGUNA SALE COMO HALLAZGO ==');
{
  armar();
  // (1) el catálogo: declara la casa y la casa existe.
  escribir('subsistemas/SUBSISTEMAS.md', catalogo(['subsistemas', 'planes']));
  carpeta('planes');
  // (2) el criterio anterior, por lint co-ubicado, para una casa que el catálogo no lista.
  escribir('conducta/lint-conducta/lint-conducta.js', '// lint\n');
  // (3) una casa que no está en el catálogo ni tiene lint, pero sí un Índice que se declara.
  escribir('inventarios/INDICE.md', '---\nindice: Inventarios\norigen: agente-desplegado\n---\n\n# x\n');
  // (4) algo que enlaza un Índice: así se reconoce `common/`, que no es subsistema ni infra.
  escribir('herramientas/INDICE.md', '---\nindice: Herramientas\norigen: agente-multiproposito\n---\n\n'
    + '# H\n\n| Código | Nombre | Detalle |\n|---|---|---|\n| Base-0001 | f | [../modulos/f.js](../modulos/f.js) |\n');
  escribir('modulos/f.js', '// modulo\n');
  // (5) la lista escrita a mano.
  escribir('identidad.md', '# Identidad\n');
  carpeta('output-styles');
  // (6) lo que no es nada de lo anterior: el caso que justifica la Herramienta.
  carpeta('datos-del-cliente');
  escribir('notas.md', '# suelto\n');

  const t = correr();
  chequear('corre y emite el informe', /COMPONENTES SUELTOS:/.test(t));
  chequear('una casa del catálogo es subsistema', enSeccion(t, SUBS, 'planes'));
  chequear('una casa con lint co-ubicado también, aunque el catálogo no la liste', enSeccion(t, SUBS, 'conducta'));
  chequear('una casa con Índice propio también, sin catálogo ni lint', enSeccion(t, SUBS, 'inventarios'));
  chequear('lo que enlaza un Índice queda declarado, no suelto', enSeccion(t, DECLARADOS, 'modulos'));
  chequear('la infraestructura conocida no es hallazgo', enSeccion(t, INFRA, 'identidad.md') && enSeccion(t, INFRA, 'output-styles'));

  // El par de cada caso anterior: si estas dos no salieran, la Herramienta reconocería todo.
  chequear('una carpeta que nadie declara SÍ es hallazgo', enSeccion(t, SUELTOS, 'datos-del-cliente'),
    enSeccion(t, SUELTOS, 'datos-del-cliente') ? 'la nombró' : 'la Herramienta la dejó pasar');
  chequear('un archivo que nadie declara SÍ es hallazgo', enSeccion(t, SUELTOS, 'notas.md'));
  chequear('y no hay más hallazgos que esos dos', (seccion(t, SUELTOS) || []).length === 2,
    `sueltos: ${JSON.stringify(seccion(t, SUELTOS))}`);
}

console.log('\n== EL MATERIAL DE TRABAJO SE INFORMA APARTE, NO COMO HALLAZGO ==');
{
  armar('.claude/basura.log');
  escribir('subsistemas/SUBSISTEMAS.md', catalogo(['subsistemas']));
  escribir('basura.log', 'ruido\n');
  carpeta('datos-del-cliente');

  const t = correr();
  chequear('lo que git no versiona va a su propio grupo', enSeccion(t, TRABAJO, 'basura.log'));
  chequear('y no cuenta como hallazgo', !enSeccion(t, SUELTOS, 'basura.log'));
  chequear('pero lo versionado sin declarar sigue siendo hallazgo', enSeccion(t, SUELTOS, 'datos-del-cliente'),
    'la fuente de git no puede tapar lo demás');
}

console.log('\n== SI `.claude/` ENTERO NO SE VERSIONA, LA FUENTE DE GIT SE APAGA Y LO DICE ==');
{
  // El falso negativo medido el 21/08/2026 en un Agente Desplegado con el harness viejo: ahí
  // `.claude/` no se versiona, así que TODOS sus hijos son material de trabajo y el inventario
  // contestaba cero sueltos escondiendo los hallazgos reales, el `memory/` retirado entre ellos.
  // Un reporte en cero se lee como "está todo bien", que es la peor forma de fallar.
  armar('.claude/');
  escribir('subsistemas/SUBSISTEMAS.md', catalogo(['subsistemas']));
  escribir('memory/viejo.md', '# generación retirada\n');

  const t = correr();
  chequear('avisa que el criterio quedó apagado', /queda apagado/.test(t));
  chequear('el grupo de material de trabajo queda vacío', (seccion(t, TRABAJO) || []).length === 0);
  chequear('y el harness viejo vuelve a salir como hallazgo', enSeccion(t, SUELTOS, 'memory'),
    enSeccion(t, SUELTOS, 'memory') ? 'lo nombró' : 'lo tapó el criterio de git');
  chequear('el catálogo sigue reconociendo su casa', enSeccion(t, SUBS, 'subsistemas'));
}

fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
console.log(`\ncasos: ${casos}`);
console.log(malos ? `${malos} FALLARON.` : 'TODO VERDE.');
process.exit(malos ? 1 : 0);
