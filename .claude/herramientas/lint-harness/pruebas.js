// Prueba cada control de lint-harness contra un caso malo y uno bueno. Un lint que lee mal contesta
// en verde sobre un conjunto vacio, asi que verde no prueba nada por si solo: cada control tiene que
// ENCENDERSE ante su defecto, y solo ante el suyo.
//
// El banco es un REPO DE PRUEBA: `lint-harness` mira el repo entero (punto de entrada, marketplace,
// REGISTRO, `funcionalidades/` y los manifiestos), asi que se copia lo que necesita y se corre con el
// directorio de trabajo puesto ahi. Se copia selectivamente porque los planes pesan mas que todo lo
// demas junto y este lint no los mira.
//
// Uso: node .claude/herramientas/lint-harness/pruebas.js   (desde la raíz del repo)
const fs = require('fs'), path = require('path'), cp = require('child_process');
const REPO_PRUEBA = path.resolve('.claude/tmp/repo-prueba-harness');
const LINT = path.resolve('.claude/herramientas/lint-harness/lint-harness.js');

// Lo que el lint mira. De `.claude/` alcanzan los manifiestos, semantica (los terminos vetados) y
// preferencias (la Base que compara contra las plantillas).
function armar() {
  fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
  fs.mkdirSync(REPO_PRUEBA, { recursive: true });
  for (const f of ['AGENTS.md', 'CLAUDE.md', 'REGISTRO.md', 'README.md']) {
    if (fs.existsSync(f)) fs.cpSync(f, path.join(REPO_PRUEBA, f));
  }
  fs.cpSync('.claude-plugin', path.join(REPO_PRUEBA, '.claude-plugin'), { recursive: true });
  fs.cpSync('funcionalidades', path.join(REPO_PRUEBA, 'funcionalidades'), { recursive: true });
  // `.claude/` se copia ENTRADA POR ENTRADA, no de una: el repo de prueba vive en `.claude/tmp/` —donde el
  // repo guarda sus temporales— y copiar `.claude/` entera ahí adentro es copiarla dentro de sí
  // misma, que Node rechaza. Salteando `tmp` en el nivel de arriba, el conflicto desaparece.
  // Se saltean además las carpetas de planes, que pesan más que todo el resto junto y este lint no mira.
  const salteados = new Set(['tmp', 'pendientes', 'ejecutados', 'descartados']);
  fs.mkdirSync(path.join(REPO_PRUEBA, '.claude'), { recursive: true });
  for (const e of fs.readdirSync('.claude', { withFileTypes: true })) {
    if (salteados.has(e.name)) continue;
    fs.cpSync(path.join('.claude', e.name), path.join(REPO_PRUEBA, '.claude', e.name), {
      recursive: true,
      filter: src => !salteados.has(path.basename(src)),
    });
  }
  neutralizarEnlaceConocido();
}

// El repo real tiene HOY un enlace roto legítimo en lo que viaja: `TERMINOLOGIA-FARLOPA.md` apunta a
// una página de conocimiento que todavía no viaja, y existe un plan abierto para subirla. Es un
// hallazgo del repo, no del banco, así que acá se neutraliza para que el caso bueno pueda medir cero
// — un banco que arranca con un hallazgo adentro no distingue el control sano del que marca de más.
// El caso malo de más abajo repone un enlace roto por su cuenta, así que el control se prueba igual.
// Cuando el plan se ejecute y el enlace resuelva, este reemplazo deja de encontrar qué cambiar y no
// estorba.
//
// Se toca en LOS DOS LADOS —el que viaja y el instalado— porque otro control compara esas dos
// copias: neutralizar uno solo las hace divergir y enciende un hallazgo que no tiene nada que ver
// con lo que este banco quería preparar.
function neutralizarEnlaceConocido() {
  const rel = 'semantica/TERMINOLOGIA-FARLOPA.md';
  for (const f of [path.join(REPO_PRUEBA, 'funcionalidades/amp/skills/inicializar/base', rel),
                   path.join(REPO_PRUEBA, '.claude', rel)]) {
    if (!fs.existsSync(f)) continue;
    const antes = fs.readFileSync(f, 'utf8');
    const despues = antes.replace(/\[([^\]]+)\]\(\.\.\/conocimiento\/[^)]+\.md\)/g, '$1');
    if (antes !== despues) fs.writeFileSync(f, despues);
  }
}
const leer = f => fs.readFileSync(path.join(REPO_PRUEBA, f), 'utf8');
const escribir = (f, t) => fs.writeFileSync(path.join(REPO_PRUEBA, f), t);

function correr() {
  const r = cp.spawnSync('node', [LINT], { cwd: REPO_PRUEBA, encoding: 'utf8', timeout: 120000 });
  return (r.stdout || '') + (r.stderr || '');
}
function hallazgos(salida) {
  const out = {};
  for (const m of salida.matchAll(/^\[([^\]]+)\] \((\d+)\)$/gm)) out[m[1]] = parseInt(m[2], 10);
  return out;
}
const total = h => Object.values(h).reduce((a, b) => a + b, 0);

let malos = 0;
const PLANTILLA = 'funcionalidades/amp/skills/inicializar/PLANTILLA.md';
const BASE_INST = 'funcionalidades/amp/skills/inicializar/base';

// -- CASO BUENO: el repo de prueba intacto da cero --------------------------------
// Salvo el control de versiones, que compara contra los plugins instalados EN LA MAQUINA: en un
// repo de prueba no hay ninguno instalado, asi que ese control no aplica y se ignora a proposito.
const IGNORAR = 'VERSION EN DISCO DISTINTA DE LA INSTALADA';
console.log('== CASO BUENO: el repo de prueba intacto da cero ==');
armar();
{
  const h = hallazgos(correr());
  delete h[IGNORAR];
  const t = total(h);
  console.log(`${t === 0 ? 'OK  ' : 'FALLA'} repo de prueba sin tocar → ${t} hallazgos${t ? '  ' + JSON.stringify(h) : ''}`);
  if (t !== 0) malos++;
}

// -- CASOS MALOS -----------------------------------------------------------
const casos = [];
// `exigeTexto` es opcional y hace falta cuando dos casos comparten seccion: el conteo solo dice que
// el control se encendio, no CUAL de los dos defectos vio, y un control que confundiera los dos
// pasaria igual.
const caso = (nombre, seccion, romper, exigeTexto) => casos.push({ nombre, seccion, romper, exigeTexto });

// El motivo del control: arreglar un lint en `.claude/` y olvidar la copia que viaja dejaba el
// defecto saliendo publicado con el control de cierre en verde.
caso('un script que viaja difiere del instalado', 'LO QUE VIAJA DIFIERE DE LO INSTALADO EN .claude/',
  () => fs.appendFileSync(path.join(REPO_PRUEBA, '.claude/subsistemas/lint-subsistemas/lint-subsistemas.js'),
    '\n// divergencia que la copia que viaja no tiene\n'));

// El encabezado de un registro del Agente Desplegado SI se compara: es la convencion que manda el
// Agente Multiproposito y, si nadie la mira, queda vieja para siempre en cada repo instalado.
caso('el encabezado de un registro del Agente Desplegado difiere', 'LO QUE VIAJA DIFIERE DE LO INSTALADO EN .claude/',
  () => escribir('.claude/semantica/GLOSARIO.md',
    leer('.claude/semantica/GLOSARIO.md').replace('# Glosario del proyecto', '# Glosario del proyecto (retocado)')));

// El otro sentido: un Componente que se declara en lo que viaja y no existe instalado.
caso('viaja un Componente que no existe en .claude/', 'VIAJA UN COMPONENTE QUE NO EXISTE EN .claude/',
  () => fs.rmSync(path.join(REPO_PRUEBA, '.claude/subsistemas/lint-subsistemas/README.md'), { force: true }));

// Y el hueco que ningun control veia: infra Base instalada que nunca viajo. Partir del bloque no
// podia verlo —no hay bloque—, y asi estuvo meses la Herramienta `instalar-plugins-codex`, que el
// registro Base declaraba y la instalacion no llevaba.
caso('infra Base instalada que no viaja', 'INFRA BASE EN .claude/ QUE NO VIAJA',
  () => fs.rmSync(path.join(REPO_PRUEBA, BASE_INST, 'subsistemas/lint-subsistemas/README.md'), { force: true }));

// El mismo control, pero sobre `.claude/common/`, que cuelga directo de `.claude/`. El control
// salteaba TODA carpeta de primer nivel —la raiz de un subsistema es donde cada repo acumula sus
// entradas, y marcarlas daba 30 hallazgos falsos—, asi que la carpeta de infra compartida entraba
// en la excepcion sin serlo: se le borro el modulo que viaja y contesto en verde (01/08/2026).
// Es el caso que separa las dos clases de carpeta de primer nivel; sin el, la lista INFRA_RAIZ
// puede quedar vacia o mal escrita y nada lo dice — los trece lectores del modulo se instalarian
// con un `require` a un archivo que nunca llego.
caso('el modulo comun instalado que no viaja', 'INFRA BASE EN .claude/ QUE NO VIAJA',
  () => fs.rmSync(path.join(REPO_PRUEBA, BASE_INST, 'common/frontmatter.js'), { force: true }));

// Ese caso prueba ademas que la exencion de abajo no exime de mas: `frontmatter` esta declarado en
// el Indice del Agente MULTIPROPOSITO, asi que tiene que seguir marcandose. Si el filtro por origen
// se cayera y cualquier fila eximiera, este caso dejaria de fallar.
//
// Y el reves: un archivo de `common/` puede legitimamente no viajar si lo declara el Indice del
// Agente DESPLEGADO —es maquinaria de quien publica, no de quien instala—. El caso bueno ya lo
// ejercita, pero solo mientras exista un archivo asi: el dia que no quede ninguno, la exencion deja
// de tener con que probarse y el caso bueno pasa igual, sin que nada lo diga. Por eso se prueba
// rompiendola: se le quita la fila al Indice y el archivo tiene que volver a marcarse.
caso('un modulo comun que no viaja y perdio su fila en el Indice', 'INFRA BASE EN .claude/ QUE NO VIAJA',
  () => {
    const rel = '.claude/herramientas/INDICE-LOCAL.md';
    escribir(rel, leer(rel).split('\n').filter(l => !l.includes('common/bases-de-instalacion.js')).join('\n'));
  });

// Un Indice del Agente Desplegado nace declarado y SIN filas. Si viaja con alguna, todo repo que
// se instale arranca con las entradas de este como si fueran propias. El control del encabezado no
// puede verlo —mira arriba de la tabla justamente para no comparar filas—, asi que va aparte.
caso('un Índice del Agente Desplegado viaja con filas', 'UN INDICE DEL AGENTE DESPLEGADO VIAJA CON FILAS',
  () => fs.appendFileSync(path.join(REPO_PRUEBA, BASE_INST, 'herramientas/INDICE-LOCAL.md'),
    '| Local-0001 | una-tool | Que hace. | script | `node x.js` | vigente | [x/](x/) |\n'));

// Lo que se instala en cada Agente Desplegado no puede apuntar a algo que se queda en este repo:
// allá el enlace no lleva a ningún lado. El caso real lo encontró una persona —un Agente Desplegado
// se topó con el enlace roto y terminó reescribiendo la página a mano—, no un control. Se repone
// sobre un registro del Agente Desplegado y fuera de su tabla, para que el defecto que enciende sea
// solo este y no el del encabezado ni el de las filas.
caso('lo que viaja enlaza a una página que no viaja', 'LO QUE VIAJA APUNTA A ALGO QUE NO VIAJA (enlaces y require)',
  () => fs.appendFileSync(path.join(REPO_PRUEBA, BASE_INST, 'conocimiento/INDICE.md'),
    '\nVer la [página que se queda en el repo autor](../conocimiento/una-que-no-viaja.md).\n'),
  'una-que-no-viaja.md');

// La forma GRAVE del mismo defecto: en código no confunde a nadie, mata el hook. Node resuelve el
// `require` al cargar, antes de cualquier try/catch, así que el repartidor muere con MODULE_NOT_FOUND
// y el Agente Desplegado se queda sin ninguna regla entregada, en cada turno. Medido el 02/08/2026
// sobre un consumidor simulado sin `conducta/alcance-al-escribir.js`: exit 1 y ni una regla.
// Entró porque `sincronizar-base` decide qué viaja recorriendo `base/`: un Componente nuevo no entra
// solo, y hasta este control nada lo decía — ni el lint ni la Herramienta que sincroniza.
caso('lo que viaja hace require de un módulo que no viaja', 'LO QUE VIAJA APUNTA A ALGO QUE NO VIAJA (enlaces y require)',
  () => fs.rmSync(path.join(REPO_PRUEBA, BASE_INST, 'conducta/alcance-al-escribir.js'), { force: true }),
  'alcance-al-escribir.js');

caso('funcionalidad en REGISTRO sin carpeta en disco', 'FANTASMAS (catalogadas pero sin carpeta)',
  () => fs.rmSync(path.join(REPO_PRUEBA, 'funcionalidades/amp-conducta'), { recursive: true, force: true }));

const SKILL_PRUEBA = 'funcionalidades/amp/skills/info/SKILL.md';
caso('skill con frontmatter inválido', 'SKILLS CON FRONTMATTER INVALIDO',
  () => escribir(SKILL_PRUEBA, leer(SKILL_PRUEBA).replace('name: info', 'name: Info fuera de estándar')),
  'name invalido');

caso('skill sin disparador', 'SKILLS SIN DISPARADOR EN DESCRIPTION',
  () => escribir(SKILL_PRUEBA, leer(SKILL_PRUEBA).replace(/ Use when[^\n]+/, '')),
  'description sin');

caso('skill sin reconciliación', 'SKILLS SIN RECONCILIACION',
  () => escribir(SKILL_PRUEBA, leer(SKILL_PRUEBA).replace(/\n## Reconciliaci[oó]n[\s\S]*$/, '\n')),
  'falta sección');

caso('referencia rota en una skill', 'REFERENCIAS ROTAS EN SKILLS',
  () => escribir(SKILL_PRUEBA, leer(SKILL_PRUEBA) + '\nVer [detalle](no-existe.md).\n'),
  'no-existe.md');

caso('nombre retirado en una skill', 'NOMBRES DE SKILLS RETIRADOS TODAVIA REFERENCIADOS',
  () => escribir(SKILL_PRUEBA, leer(SKILL_PRUEBA) + '\nUsar `inicializar-conocimiento`.\n'),
  'inicializar-conocimiento');

caso('skill sin cierre verificable', 'SKILLS SIN CIERRE VERIFICABLE',
  () => escribir(SKILL_PRUEBA,
    '---\nname: info\ndescription: Explica algo. Use when el usuario pide una explicación.\n---\n\n# Info\n\nExplicar el tema.\n\n## Reconciliación\n\nNo modifica archivos.\n'),
  'no declara cómo');

caso('manifiesto que engordó', 'MANIFIESTOS QUE ENGORDARON (> 220 palabras)',
  () => escribir('.claude/decisiones/MANIFIESTO.md',
    leer('.claude/decisiones/MANIFIESTO.md') + '\n' + 'palabra '.repeat(250) + '\n'));

caso('manifiesto sin el campo Disparador', 'MANIFIESTOS SIN CAMPOS MINIMOS (dec. 0019)',
  () => escribir('.claude/decisiones/MANIFIESTO.md',
    leer('.claude/decisiones/MANIFIESTO.md').replace(/\*\*Disparador:\*\*/g, 'Cuando conviene:')));

caso('cita a una decisión del harness en texto que viaja', 'CITAS A DECISIONES DEL HARNESS EN DISTRIBUIBLES (dec. 0024)',
  () => escribir(PLANTILLA, leer(PLANTILLA).replace(/^# /m, 'Ver la decisión 0017 para el detalle.\n\n# ')),
  'PLANTILLA.md');

// El caso de arriba entra por la PLANTILLA, que el control nombra archivo por archivo. Los otros 86
// que se despachan no los abria nadie: el barrido llegaba a tres nombres (PLANTILLA, MANIFIESTO,
// lint) y todo lo demas de `base/` —preferencias, conocimiento, bancos— viajaba sin mirar. Asi
// estuvieron cuatro citas en `base/preferencias/` hasta el 02/08/2026, con el control en verde.
caso('cita en un archivo cualquiera de base/', 'CITAS A DECISIONES DEL HARNESS EN DISTRIBUIBLES (dec. 0024)',
  () => fs.appendFileSync(path.join(REPO_PRUEBA, BASE_INST, 'conocimiento/INDICE.md'),
    '\nEl reparto sale de la decisión 0011.\n'),
  'conocimiento/INDICE.md');

// Y la forma larga del codigo, que es la que pide la Preferencia Base-0016. El patron exigia digito
// pegado a la palabra, asi que `decision Local-0044` —la forma que el propio repo escribe -- pasaba
// entera sin marca.
caso('cita con el prefijo de origen adelante', 'CITAS A DECISIONES DEL HARNESS EN DISTRIBUIBLES (dec. 0024)',
  () => fs.appendFileSync(path.join(REPO_PRUEBA, BASE_INST, 'conocimiento/INDICE.md'),
    '\nEl reparto sale de la Decisión Local-0011.\n'),
  'Local-0011');

caso('término vetado en el texto que viaja', 'TERMINOLOGIA VETADA EN EL TEXTO QUE VIAJA (funcionalidades/)',
  () => escribir('funcionalidades/amp/README.md',
    leer('funcionalidades/amp/README.md') + '\nEste repo tiene mucho churn.\n'));

caso('adaptador CLAUDE.md que dejó de importar AGENTS.md', 'PUNTO DE ENTRADA (AGENTS.md + adaptador CLAUDE.md)',
  () => escribir('CLAUDE.md', '# Instrucciones propias\n\nSin importar nada.\n'));

// Los dos defectos del caracter invisible. Se siembra por codigo, nunca literal: un banco escrito
// con el caracter que el control persigue se lo lleva puesto a si mismo.
// El primero es el defecto en su forma destructiva: el `.md` deja de matchear `^---` y todo lo que
// declaraba de si mismo se lee como no declarado, sin señal. Va sobre REGISTRO.md, que no viaja,
// para que el unico control que se encienda sea este.
const MARCA = String.fromCharCode(0xFEFF);
caso('marca de orden de bytes al inicio de un .md', 'MARCA DE ORDEN DE BYTES (U+FEFF) EN ARCHIVOS DEL REPO',
  () => escribir('REGISTRO.md', MARCA + leer('REGISTRO.md')),
  'marca de orden al inicio');

// El segundo es el que reintroduce el defecto: el caracter literal escrito adentro del codigo —en el
// mismo regex puesto para sacarlo—, donde funciona y no se ve. Va sobre lint-harness.js, que es
// Local y no viaja; ademas es la COPIA del repo de prueba, no el script que corre.
caso('carácter literal en medio de un .js', 'MARCA DE ORDEN DE BYTES (U+FEFF) EN ARCHIVOS DEL REPO',
  () => escribir('.claude/herramientas/lint-harness/lint-harness.js',
    leer('.claude/herramientas/lint-harness/lint-harness.js') + `\nconst colado = /^${MARCA}/;\n`),
  'carácter literal en el texto');

// Los dos controles sobre los FRAGMENTOS compartidos entre lints, que hasta el 01/08/2026 no tenian
// ningun caso —y por eso dos de sus cuatro fragmentos se habian apagado sin que nadie lo viera—.
//
// Los dos casos tocan LOS DOS LADOS, el que viaja y el instalado: el control que los compara entre si
// se enciende con tocar uno solo, y el conteo dejaria de decir cual defecto se vio.
const LINTS_CON_REPO_DE = ['conocimiento/lint-conocimiento', 'decisiones/lint-decisiones',
                           'herramientas/lint-herramientas', 'semantica/lint-semantica'];
const ambosLados = sub => [`.claude/${sub}/${path.basename(sub)}.js`,
                           `${BASE_INST}/${sub}/${path.basename(sub)}.js`];

// El fragmento sigue existiendo en el codigo pero el ancla deja de matchearlo — que es exactamente
// como murio `raiz del repo`: los lints migraron de __dirname a derivar la raiz de la carpeta que
// miran, y el regex quedo buscando el patron viejo. Sin este control, cero muestras da verde.
caso('un fragmento vigilado se queda sin muestras', 'FRAGMENTOS VIGILADOS CON MENOS DE 2 MUESTRAS (no controlan nada)',
  () => {
    for (const sub of LINTS_CON_REPO_DE) for (const f of ambosLados(sub)) {
      escribir(f, leer(f).replace('// El repo se deriva de `root`', '// El repo sale de la carpeta mirada'));
    }
  },
  'raiz del repo');

// Y que el fragmento reparado SI vea una divergencia real: se le cambia el cuerpo a una sola de las
// cuatro copias. Con el ancla vieja este caso pasaba desapercibido.
caso('una copia de un fragmento compartido diverge', 'FRAGMENTOS DE CODIGO DIVERGENTES ENTRE LINTS',
  () => {
    for (const f of ambosLados('decisiones/lint-decisiones')) {
      escribir(f, leer(f).replace('function repoDe(carpetaSubsistema) {',
                                  'function repoDe(carpetaSubsistema) {   // divergencia sembrada'));
    }
  },
  'raiz del repo');

// Un subagente sin `model` anda igual: corre al modelo de la sesion, asi que el recorrido se paga
// al mismo precio que en el hilo principal y nadie lo nota. La delegacion entera existe para eso,
// de modo que el defecto vacia el mecanismo sin romperlo — el modo de falla que ningun control
// posterior encuentra.
const SUBAGENTE = 'funcionalidades/amp-semantica/agents/buscador-de-terminologia.md';
caso('un subagente que no declara model', 'SUBAGENTES CON FRONTMATTER INVALIDO',
  () => escribir(SUBAGENTE, leer(SUBAGENTE).replace(/^model: .*$/m, '')),
  'falta model');

// El otro defecto silencioso: el `name` manda, no el archivo. Con los dos distintos el subagente
// existe con un nombre y la habilidad lo invoca por el otro, asi que la delegacion no ocurre y el
// flujo sigue —en el hilo principal— sin decir que se cayo.
caso('un subagente cuyo name no coincide con su archivo', 'SUBAGENTES CON FRONTMATTER INVALIDO',
  () => escribir(SUBAGENTE, leer(SUBAGENTE).replace(/^name: .*$/m, 'name: buscador-de-terminologias')),
  'no coincide con el archivo');

console.log('\n== CASOS MALOS: cada control se enciende ante su defecto ==');
for (const c of casos) {
  armar();
  try { c.romper(); } catch (e) { console.log(`FALLA ${c.nombre}\n      no se pudo romper el repo de prueba: ${e.message}`); malos++; continue; }
  const salida = correr();
  const h = hallazgos(salida);
  delete h[IGNORAR];
  const propio = h[c.seccion] || 0;
  if (propio === 0) {
    console.log(`FALLA ${c.nombre}  → [${c.seccion}] siguió en 0 (el control no lo vio)`);
    malos++; continue;
  }
  if (c.exigeTexto && !salida.includes(c.exigeTexto)) {
    console.log(`FALLA ${c.nombre}  → se encendió, pero sin decir "${c.exigeTexto}" (vio otro defecto)`);
    malos++; continue;
  }
  const otros = Object.entries(h).filter(([k, n]) => k !== c.seccion && n > 0).map(([k, n]) => `${k}=${n}`);
  console.log(`OK    ${c.nombre}  → 0→${propio}${otros.length ? '   (además: ' + otros.join(', ') + ')' : ''}`);
}

// -- CASO BUENO fino: un enlace a internet no es un enlace que no viaja ----
// El control resuelve cada enlace contra el disco, y una dirección de internet nunca va a existir
// ahí. Sin la exención, lo que viaja quedaría sin poder citar una fuente externa: cada enlace a un
// `.md` publicado se marcaría como roto, y un control que marca lo legítimo se deja de leer.
console.log('\n== CASO BUENO: un enlace a internet no cuenta como enlace roto ==');
armar();
fs.appendFileSync(path.join(REPO_PRUEBA, BASE_INST, 'conocimiento/INDICE.md'),
  '\nVer el [estándar abierto Agent Skills](https://example.org/agent-skills/SKILL.md).\n');
{
  const h = hallazgos(correr());
  const n = h['LO QUE VIAJA APUNTA A ALGO QUE NO VIAJA (enlaces y require)'] || 0;
  console.log(`${n === 0 ? 'OK  ' : 'FALLA'} enlace https a un .md → ${n} hallazgos`);
  if (n !== 0) malos++;
}

// -- CASO BUENO fino: citar un término vetado en lo que viaja no es usarlo --
console.log('\n== CASO BUENO: citar un término vetado en lo que viaja no es usarlo ==');
armar();
escribir('funcionalidades/amp/README.md', leer('funcionalidades/amp/README.md') + '\nEl término `churn` está vetado.\n');
{
  const h = hallazgos(correr());
  const n = h['TERMINOLOGIA VETADA EN EL TEXTO QUE VIAJA (funcionalidades/)'] || 0;
  console.log(`${n === 0 ? 'OK  ' : 'FALLA'} citado entre comillas simples invertidas → ${n} hallazgos`);
  if (n !== 0) malos++;
}

// -- CASO BUENO fino: las FILAS de un registro del Agente Desplegado son del repo ------
// Es el contrario exacto del caso malo del encabezado, y hace falta que esten los dos: un control
// que marcara todo el archivo dejaria en rojo a cualquier repo apenas escribe su primer termino,
// y uno que no mirara nada dejaria el encabezado viejo para siempre. La linea esta en la tabla.
console.log('\n== CASO BUENO: las filas de un registro del Agente Desplegado no se comparan ==');
armar();
escribir('.claude/semantica/GLOSARIO.md',
  leer('.claude/semantica/GLOSARIO.md') + '| Local-0099 | Mudanza | Un termino que suma este repo. | — | — | — |\n');
{
  const h = hallazgos(correr());
  const n = h['LO QUE VIAJA DIFIERE DE LO INSTALADO EN .claude/'] || 0;
  console.log(`${n === 0 ? 'OK  ' : 'FALLA'} una fila propia en el glosario → ${n} hallazgos`);
  if (n !== 0) malos++;
}

// -- CONTROL de versión↔contenido: contenido de plugin cambiado sin subir su version ------
// Este control mira la HISTORIA de git, no el árbol de archivos, así que el repo de prueba tiene que
// ser un repo git: se le hace un commit inicial coherente —cada plugin con su version y su contenido
// juntos— y de ahí se rompe. En un árbol sin git el control se saltea solo, como el de la versión
// instalada, y por eso no aparece en los casos de arriba. Se prueba con caso malo y dos buenos: que
// marque al cambiar contenido sin subir la version, que calle con el repo coherente, y que subir la
// version en disco APAGUE el hallazgo (la version nueva no está en ningún commit: no hay colisión).
const SECCION_VER = 'CONTENIDO DE PLUGIN CAMBIADO SIN SUBIR SU VERSION';
let gitOk = true;
try { cp.execSync('git --version', { stdio: 'ignore' }); } catch (e) { gitOk = false; }
function commitInicial() {
  const env = { ...process.env, GIT_AUTHOR_NAME: 'banco', GIT_AUTHOR_EMAIL: 'banco@x',
                GIT_COMMITTER_NAME: 'banco', GIT_COMMITTER_EMAIL: 'banco@x' };
  // core.autocrlf=false: sin él, git avisa por cada .md al normalizar fin de línea y ensucia la salida.
  const opt = { cwd: REPO_PRUEBA, env, stdio: ['ignore', 'ignore', 'ignore'] };
  cp.execSync('git -c core.autocrlf=false init -q', opt);
  cp.execSync('git -c core.autocrlf=false add -A', opt);
  cp.execSync('git -c core.autocrlf=false commit -q -m inicial', opt);
}
const contarVer = () => (hallazgos(correr())[SECCION_VER] || 0);
console.log('\n== CONTROL versión↔contenido (repo git de banco) ==');
if (!gitOk) {
  console.log('OMITIDO  git no está disponible en esta máquina: el control no se puede ejercitar acá.');
} else {
  // caso bueno: cada plugin con su version y su contenido en el mismo commit → coherente
  armar(); commitInicial();
  { const n = contarVer(); console.log(`${n === 0 ? 'OK  ' : 'FALLA'} repo git coherente → ${n} hallazgos`); if (n !== 0) malos++; }
  // caso malo: cambiar un archivo del plugin sin subir su version
  armar(); commitInicial();
  fs.appendFileSync(path.join(REPO_PRUEBA, 'funcionalidades/amp/README.md'), '\nun cambio posterior sin subir la version\n');
  { const n = contarVer(); console.log(`${n > 0 ? 'OK  ' : 'FALLA'} contenido cambiado sin subir la version → ${n} hallazgos`); if (n === 0) malos++; }
  // caso bueno fino: subir la version en disco apaga el hallazgo
  armar(); commitInicial();
  fs.appendFileSync(path.join(REPO_PRUEBA, 'funcionalidades/amp/README.md'), '\nun cambio posterior\n');
  { const pj = path.join(REPO_PRUEBA, 'funcionalidades/amp/.claude-plugin/plugin.json');
    const o = JSON.parse(fs.readFileSync(pj, 'utf8')); o.version = '99.0.0';
    fs.writeFileSync(pj, JSON.stringify(o, null, 2) + '\n');
    const n = contarVer(); console.log(`${n === 0 ? 'OK  ' : 'FALLA'} version nueva en disco → ${n} hallazgos`); if (n !== 0) malos++; }
}

fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
console.log(`\ncasos: ${casos.length + 3}${gitOk ? ' + 3 (versión↔contenido, repo git de banco)' : ''}`);
console.log(`no cubierto a propósito: [${IGNORAR}] — compara contra los plugins instalados en la máquina, que un repo de prueba no tiene.`);
console.log(malos ? `${malos} FALLARON.` : 'TODO VERDE.');
process.exit(malos ? 1 : 0);
