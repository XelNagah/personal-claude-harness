#!/usr/bin/env node
// inventariar-componentes-sueltos.js — que hay en `.claude/` que no pertenece a nada declarado.
//
// El punto ciego que le da sentido: los lints de subsistema barren cada uno ADENTRO de su propia
// casa, asi que nadie mira el pasillo. Este chequeo cierra esa mitad — barre `.claude/` y lista los
// componentes (archivos y carpetas) que no son de ningun subsistema, no los declara ningun Indice
// y no son infraestructura conocida.
// INVENTARIA, NO JUZGA: solo dice "esto esta fuera de todo lo declarado"; que hacer con cada cosa
// lo decide un humano, contra el Test de demarcacion.
//
// Alcance: SOLO `.claude/`. La raiz del repo no se toca — ahi vive el Producto del Proposito, que
// legitimamente no pertenece a ningun subsistema, y barrerla marcaria el trabajo real como
// sospechoso. Lo fijo asi el Test de demarcacion.
//
// -- de donde sale que algo es legitimo ---------------------------------------------------------
// De los REGISTROS DEL PROPIO REPO, no de una lista escrita aca. La lista escrita existio, se
// declaraba "corta y estable a proposito" y se rompio apenas el Agente Multiproposito sumo una
// carpeta: los diez Agentes Desplegados medidos el 20/08/2026 marcaban `output-styles/` —que el
// propio Agente Multiproposito les acababa de instalar— como suelto. Un hallazgo permanente que
// nadie puede llevar a cero es defecto del control: los hallazgos tienen que ser resolubles.
//
// Tres fuentes, en este orden:
//   (1) el catalogo de `subsistemas`, que declara cada casa con su carpeta;
//   (2) los enlaces de todos los Indices de Subsistema, que declaran lo suyo — `common/` sale del
//       Indice de Herramientas, y una Herramienta o una skill del Proposito se reconocen solas
//       apenas se registran, sin tocar este codigo;
//   (3) lo que git no versiona, que es material de trabajo y va a su propio grupo del reporte.
//
// NO se lista la carpeta `base/` que trae el plugin, aunque la decision que fijo que lo que esta en `base/` viaja la nombre como
// la fuente del destino: `base/` no llega al repo sino al deposito de plugins de la maquina, con
// una version adentro, y alcanzarla obligaria a leer la configuracion de plugins —distinta en
// Claude Code y en Codex— y no tendria respuesta en un repo instalado por copia. Leer los registros
// del repo ademas lo describe A EL, y no a la version del plugin que haya en el deposito, que es la
// trampa asentada en el conocimiento sobre el repo que un script describe.
//
// Uso:
//   node .claude/herramientas/inventariar-componentes-sueltos/inventariar-componentes-sueltos.js            (este repo, cwd)
//   node .claude/herramientas/inventariar-componentes-sueltos/inventariar-componentes-sueltos.js <rutaRepo> (apuntar a otro repo)
//   node .claude/herramientas/inventariar-componentes-sueltos/inventariar-componentes-sueltos.js --quiet    (calla si no hay sueltos)
// Sin process.exit(1): informa, no falla (capa mecanica).

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { hijosDeclarados } = require('../../common/enlaces-de-indices.js');
const { indicesDe } = require('../../common/indices.js');
const { celdasDe, esSeparadora } = require('../../common/frontmatter.js');

const args = process.argv.slice(2);
const quiet = args.includes('--quiet');
const rutaArg = args.find(a => !a.startsWith('--'));
const REPO = rutaArg ? path.resolve(rutaArg) : process.cwd();
const CLAUDE_DIR = path.join(REPO, '.claude');

// -- infraestructura que no declara ningun registro ----------------------------------------------
// Los unicos nombres escritos a mano, y no se pueden derivar de nada: son justamente lo que ningun
// Indice declara. Envejece solo si Claude Code suma una carpeta estandar o si el Agente
// Multiproposito empieza a poner algo nuevo sin copiarlo — no cada vez que el harness crece, que
// era el ritmo que rompio la lista anterior.
const INFRA = new Map([
  // Lo que pone el Agente Multiproposito sin copiarlo desde `base/`: `identidad.md` lo genera
  // `amp:inicializar` con el Titulo y el Proposito del repo, y a `settings.json` le escribe partes
  // por merge sobre un archivo que es del CLI. Son los mismos tres renglones que `sincronizar-base`
  // ya tiene del lado del origen.
  ['identidad.md', 'Identidad del Agente, la genera amp:inicializar'],
  ['settings.json', 'config de Claude Code, el harness le escribe fragmentos'],
  // Par del anterior, y el CLI lo crea en todo repo donde se lo use. Va en la lista y no se deja a
  // git aunque este gitignoreado: la fuente (3) se apaga donde `.claude/` entero no se versiona, y
  // ahi este archivo —que existe siempre— seria un falso positivo permanente.
  ['settings.local.json', 'config local de Claude Code'],
  // El Estilo de Respuesta del Modelo del Agente. Viaja en `base/` pero
  // ningun Indice lo declara: es el unico Componente del Agente Multiproposito sin registro propio.
  ['output-styles', 'Estilo de Respuesta del Modelo del Agente'],
  // Carpetas estandar del CLI. Existan o no, cuando estan son legitimas.
  ['skills', 'carpeta estandar de Claude Code'],
  ['commands', 'carpeta estandar de Claude Code'],
  ['agents', 'carpeta estandar de Claude Code'],
  ['hooks', 'carpeta estandar de Claude Code'],
]);

function existe(p) { try { return fs.existsSync(p); } catch { return false; } }

// -- (1) las casas que declara el catalogo de subsistemas ----------------------------------------
// La columna `Nombre` de los dos Indices de `subsistemas/` es tambien el nombre de la carpeta, por
// convencion del Patron. Se le suma el reconocimiento por lint co-ubicado, que era el criterio
// anterior: la union, no el reemplazo. Un Agente Desplegado con el harness viejo no tiene catalogo
// y se marcaria sus propios subsistemas como sueltos; una casa sin lint tampoco esta declarada por
// el criterio viejo. Cada fuente tapa el agujero de la otra.
function casasDelCatalogo() {
  const out = new Set();
  const dir = path.join(CLAUDE_DIR, 'subsistemas');
  if (!existe(dir)) return out;
  for (const idx of indicesDe(dir, ['SUBSISTEMAS.md', 'SUBSISTEMAS-LOCAL.md'])) {
    const col = (idx.cabecera || []).findIndex(c => /^nombre$/i.test(c));
    if (col < 0) continue;
    for (const linea of (idx.texto || '').split('\n')) {
      const celdas = celdasDe(linea);
      if (!celdas || esSeparadora(celdas)) continue;
      if (!/^(?:Base|Local)-\d{4}$/.test(celdas[0] || '')) continue;
      const nombre = (celdas[col] || '').replace(/`/g, '').trim();
      if (nombre) out.add(nombre);
    }
  }
  return out;
}

// Una carpeta que contiene un Indice de Subsistema es una casa, aunque el catalogo todavia no la
// liste: el Indice se declara a si mismo en su frontmatter, y esa declaracion
// alcanza. Cubre el hueco entre crear una casa y anotarla, que es donde el catalogo miente.
function tieneIndice(nombre) {
  const dir = path.join(CLAUDE_DIR, nombre);
  return indicesDe(dir, []).some(i => i.indice);
}

// -- (3) lo que git no versiona ------------------------------------------------------------------
// Material de trabajo: ni del Agente Multiproposito ni del Proposito. Se informa en su propio grupo
// y NO cuenta como hallazgo — pero se informa, no se esconde: una carpeta del Proposito mal ubicada
// que ademas este gitignoreada tiene que seguir a la vista.
//
// LA FUENTE SE APAGA SI `.claude/` ENTERO ESTA IGNORADO, y el reporte lo dice. Medido el 21/08/2026
// en un Agente Desplegado con el harness viejo (`BeatSaber-Overlay`): ahi `.claude/` no se versiona,
// asi que TODOS sus hijos son "material de trabajo" y el inventario contestaba cero sueltos
// escondiendo los hallazgos reales — el `memory/` de la generacion retirada entre ellos. Un criterio
// que en ese repo no distingue nada no puede decidir nada; apagado, los hallazgos vuelven a salir.
function claudeEsteIgnorado() {
  try {
    execFileSync('git', ['check-ignore', '-q', '.claude'], { cwd: REPO, stdio: 'ignore' });
    return true;
  } catch (e) {
    return false; // salida 1 = no esta ignorado; salida 128 = no hay repo git, y ahi tampoco aplica
  }
}

function ignoradosPorGit(nombres) {
  if (!nombres.length) return new Set();
  const leer = salida => new Set(String(salida || '').split('\n').filter(Boolean)
    .map(l => l.trim().replace(/\\/g, '/').replace(/^\.claude\//, '').replace(/\/$/, '')));
  try {
    return leer(execFileSync('git', ['check-ignore', '--stdin'], {
      cwd: REPO, input: nombres.map(n => '.claude/' + n).join('\n'), encoding: 'utf8',
    }));
  } catch (e) {
    // `check-ignore` sale con 1 cuando ninguna ruta esta ignorada: es una respuesta, no un error, y
    // trae en stdout las que si lo estaban. Con git ausente o sin repo no hay stdout y queda vacio:
    // ahi el peor caso es nombrar de mas, que es ruido visible — nunca callar de mas en silencio.
    return leer(e && e.stdout);
  }
}

// -- clasificar los hijos directos de `.claude/` -------------------------------------------------
const subsistemas = [];  // nombres — casa del catalogo o carpeta con lint co-ubicado
const declarados = [];   // nombres — los enlaza algun Indice de Subsistema
const infra = [];        // nombres — infraestructura conocida, con su motivo
const trabajo = [];      // nombres — no versionados
const sueltos = [];      // { nombre, motivo } — lo que no es nada de lo anterior
let gitApagado = false;  // `.claude/` entero sin versionar: la fuente (3) no distingue nada

if (existe(CLAUDE_DIR)) {
  const entradas = fs.readdirSync(CLAUDE_DIR, { withFileTypes: true });
  const casas = casasDelCatalogo();
  const porIndices = hijosDeclarados(CLAUDE_DIR);
  gitApagado = claudeEsteIgnorado();
  const ignorados = gitApagado ? new Set() : ignoradosPorGit(entradas.map(e => e.name));

  for (const e of entradas) {
    const nombre = e.name;
    const esDir = e.isDirectory();
    const lintCoubicado = esDir && existe(path.join(CLAUDE_DIR, nombre, 'lint-' + nombre, 'lint-' + nombre + '.js'));
    if ((esDir && casas.has(nombre)) || lintCoubicado || (esDir && tieneIndice(nombre))) { subsistemas.push(nombre); continue; }
    if (INFRA.has(nombre)) { infra.push(`${nombre}${esDir ? '/' : ''}   [${INFRA.get(nombre)}]`); continue; }
    if (porIndices.has(nombre)) { declarados.push(nombre + (esDir ? '/' : '')); continue; }
    if (ignorados.has(nombre)) { trabajo.push(nombre + (esDir ? '/' : '')); continue; }
    sueltos.push({
      nombre: nombre + (esDir ? '/' : ''),
      motivo: esDir
        ? 'carpeta, no es subsistema del catálogo, no la declara ningún Índice ni es infra conocida'
        : 'archivo, no lo declara ningún Índice ni es infra conocida',
    });
  }
}

const ordenar = a => a.sort((x, y) => x.localeCompare(y));
ordenar(subsistemas); ordenar(declarados); ordenar(infra); ordenar(trabajo);
sueltos.sort((a, b) => a.nombre.localeCompare(b.nombre));

// --- salida (formato `[SECCION] (N)` como los demas lints) --------------------------------------
if (quiet && sueltos.length === 0) process.exit(0);

console.log('== COMPONENTES SUELTOS: ' + REPO + ' ==');
if (!existe(CLAUDE_DIR)) {
  console.log('no hay `.claude/` en esta ruta — nada que barrer.');
  process.exit(0);
}
console.log(`.claude/ escaneado | subsistemas: ${subsistemas.length} | declarados por un Índice: ${declarados.length} `
  + `| infra conocida: ${infra.length} | material de trabajo: ${trabajo.length} | sueltos: ${sueltos.length}\n`);

if (gitApagado) {
  console.log('⚠ `.claude/` entero está fuera del control de versiones: el criterio "material de '
    + 'trabajo" no distingue nada acá y queda apagado. Todo lo no declarado aparece como suelto.\n');
}

const secciones = [
  ['SUBSISTEMAS RECONOCIDOS (catálogo o lint co-ubicado)', subsistemas],
  ['DECLARADOS POR UN ÍNDICE DE SUBSISTEMA', declarados],
  ['INFRAESTRUCTURA CONOCIDA', infra],
  ['MATERIAL DE TRABAJO (git no lo versiona)', trabajo],
  ['COMPONENTES SUELTOS EN .claude/', sueltos.map(x => `${x.nombre}   [${x.motivo}]`)],
];
for (const [titulo, items] of secciones) {
  if (quiet && titulo !== 'COMPONENTES SUELTOS EN .claude/') continue;
  console.log(`[${titulo}] (${items.length})`);
  items.forEach(i => console.log(`    ${i}`));
  if (!quiet && !items.length) console.log('    (ninguno)');
}
