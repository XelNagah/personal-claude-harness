#!/usr/bin/env node
// Pruebas de `actualizar-plugins`.
//
// Esta Herramienta es la que decide si la fase de plugins esta al dia, y de eso depende que
// `amp:actualizar` nivele los archivos con el instalador correcto o con uno viejo. Su falla mas caro
// no es un error: es contestar TODO ACTUALIZADO cuando algo falta, que es exactamente lo que paso
// antes de que existiera la deteccion de dependencias sin declarar — el plugin que las pide no carga
// y la Herramienta informaba todo bien.
//
// LIMITE DECLARADO: el cache y las entradas de instalacion se miran sobre la carpeta REAL del
// usuario — fabricarlas exigiria copiar el arbol de plugins bajado entero—, asi que esos casos no
// pueden simular otra maquina. Lo que si se fabrica es el repo (su `enabledPlugins`) y la casa de
// usuario de donde sale la OTRA mitad de lo declarado. Lo que no se cubre queda dicho en la salida.
//
// Uso: node .claude/herramientas/actualizar-plugins/pruebas.js   (desde la raíz del repo)
const fs = require('fs'), os = require('os'), path = require('path'), cp = require('child_process');
const TOOL = path.resolve('.claude/herramientas/actualizar-plugins/actualizar-plugins.js');
const REPO_PRUEBA = path.resolve('.claude/tmp/repo-prueba-plugins');
const CASA_PRUEBA = path.resolve('.claude/tmp/casa-usuario-prueba');
const CASA_REAL = path.join(os.homedir(), '.claude', 'plugins');

// `--agente claude` se pasa siempre: sin eso la Herramienta deduce el agente del entorno, y la
// prueba pasaría o fallaría según desde dónde se la corra.
// `casa` reemplaza la carpeta del usuario del subproceso: ver la nota de `fabricarCasa`.
function correr(rutaRepo, flags = [], casa = null) {
  const args = ['--agente', 'claude', ...flags];
  if (rutaRepo) args.push(rutaRepo);
  // `os.homedir()` sale de USERPROFILE en Windows y de HOME en POSIX: se fijan los dos.
  const env = casa ? { ...process.env, USERPROFILE: casa, HOME: casa } : process.env;
  const r = cp.spawnSync(process.execPath, [TOOL, ...args], { encoding: 'utf8', timeout: 180000, env });
  return { texto: (r.stdout || '') + (r.stderr || ''), codigo: r.status };
}

// -- la casa de usuario fabricada --------------------------------------------
// Lo que un repo declara NO sale de un solo archivo: la Herramienta une tres, y una es
// `~/.claude/settings.json`, que vale para todos los repos de la maquina. Asi que fabricar el
// `enabledPlugins` del repo no alcanza para fijar la clasificacion — el 14/08/2026 esta maquina paso
// a declarar los nueve `amp-<sub>` a nivel usuario, la Herramienta dejo de marcarlos SIN DECLARAR
// (con razon: ahi estan declarados) y el caso se puso rojo sin que la Herramienta hubiera cambiado.
// Un caso que depende de como este configurada la maquina no prueba a la Herramienta, prueba la
// maquina. Se le fabrica entonces una casa de usuario propia, con el `enabledPlugins` que el caso
// pida y los registros de plugins copiados de la real, para que siga habiendo un marketplace bajado
// del cual leer las dependencias que `amp` declara.
const REGISTROS_DE_CASA = ['known_marketplaces.json', 'installed_plugins.json',
  'plugin-catalog-cache.json', 'blocklist.json'];
// Los `installLocation` de los marketplaces son rutas absolutas a la casa real, asi que el catalogo
// se sigue leyendo de donde esta y no hay que copiar el arbol bajado.
const HAY_CATALOGO = fs.existsSync(path.join(CASA_REAL, 'known_marketplaces.json'));

function fabricarCasa(enabledPlugins = {}) {
  fs.rmSync(CASA_PRUEBA, { recursive: true, force: true });
  fs.mkdirSync(path.join(CASA_PRUEBA, '.claude', 'plugins'), { recursive: true });
  fs.writeFileSync(path.join(CASA_PRUEBA, '.claude', 'settings.json'),
    JSON.stringify({ enabledPlugins }, null, 2));
  for (const f of REGISTROS_DE_CASA) {
    const src = path.join(CASA_REAL, f);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(CASA_PRUEBA, '.claude', 'plugins', f));
  }
  return CASA_PRUEBA;
}

// Arma un repo con el `enabledPlugins` que se le pida, en `settings.local.json` (alcance `local`,
// que es el que fija la decisión `Local-0035`).
function armar(plugins) {
  fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
  fs.mkdirSync(path.join(REPO_PRUEBA, '.claude'), { recursive: true });
  fs.writeFileSync(path.join(REPO_PRUEBA, '.claude', 'settings.local.json'),
    JSON.stringify({ enabledPlugins: plugins }, null, 2));
}

// El total sale de contar, no de un numero escrito aparte: hay casos que corren o no segun lo que la
// maquina tenga, y un total a mano queda mintiendo el dia que uno se saltea.
let malos = 0, casos = 0;
const chequear = (nombre, condicion, detalle) => {
  console.log(`${condicion ? 'OK  ' : 'FALLA'} ${nombre}${detalle ? `  → ${detalle}` : ''}`);
  casos++;
  if (!condicion) malos++;
};

console.log('== SOBRE EL REPO REAL ==');
const antes = fs.readFileSync('.claude/settings.local.json', 'utf8');
{
  const { texto, codigo } = correr();
  chequear('corre y emite el diagnóstico', /ACTUALIZAR PLUGINS/.test(texto) && codigo === 0, `código ${codigo}`);
  chequear('informa el estado de cada plugin declarado',
    /amp@xelnagah-harness\s+\w/.test(texto), (texto.match(/amp@xelnagah-harness\s+\S+/) || [''])[0]);
  chequear('informa el estado del marketplace bajado', /MARKETPLACES BAJADOS/.test(texto));
}
// Sin `--aplicar` no toca nada: es diagnóstico. Si esto se rompiera, un simple chequeo cambiaría la
// configuración de la máquina.
chequear('sin --aplicar no modifica la configuración del repo',
  fs.readFileSync('.claude/settings.local.json', 'utf8') === antes, 'settings.local.json intacto');

console.log('\n== CLASIFICACIÓN SEGÚN LO QUE EL REPO DECLARA ==');
// Estos casos corren contra una casa de usuario fabricada, para que lo declarado sea SOLO lo que
// cada uno pone: ver la nota de `fabricarCasa`.
{
  // Un nombre que el marketplace no ofrece: tiene que salir marcado, no callado.
  armar({ 'amp-inexistente@xelnagah-harness': true });
  const { texto } = correr(REPO_PRUEBA, [], fabricarCasa());
  chequear('un plugin declarado que no existe se marca',
    /amp-inexistente/.test(texto) && /RETIRADO|NO INSTALADO|SIN DATO/.test(texto),
    (texto.match(/amp-inexistente\S*\s+\S+/) || ['(no aparece)'])[0]);
}
// Las dependencias que el primer caso vio faltar alimentan al segundo, que las declara a nivel
// usuario. Se leen de la salida en vez de escribirlas a mano: así el par queda atado al catálogo que
// la Herramienta miró de verdad, y no a una lista que envejece cuando `amp` suma una dependencia.
let faltantes = [];
{
  // El caso que motivó la detección: se declara `amp` sin sus dependencias. El plugin que las pide
  // no carga, y antes de esto la Herramienta informaba todo al día.
  armar({ 'amp@xelnagah-harness': true });
  const { texto } = correr(REPO_PRUEBA, [], fabricarCasa());
  faltantes = [...texto.matchAll(/^\s*(\S+@\S+)\s+SIN DECLARAR/gm)].map(m => m[1]);
  chequear('una dependencia que el repo no declara se marca SIN DECLARAR',
    /SIN DECLARAR/.test(texto), (texto.match(/\S+\s+SIN DECLARAR/) || ['(no la marca)'])[0]);
  chequear('  …y no informa que está todo al día',
    !/^TODO ACTUALIZADO/m.test(texto), /^TODO ACTUALIZADO/m.test(texto) ? 'dice TODO ACTUALIZADO' : 'no lo dice');
}
{
  // El otro lado, que faltaba: una dependencia declarada a nivel USUARIO vale para todos los repos de
  // la máquina, así que no falta y no se marca. Callarse ahí es la respuesta correcta — es la que
  // esta máquina empezó a dar el 14/08/2026 y el banco leyó como falla por no tener este caso.
  if (!faltantes.length || !HAY_CATALOGO) {
    chequear('una dependencia declarada a nivel usuario no se marca', true,
      'NO CUBIERTO: sin dependencias que el caso anterior viera faltar, no hay qué declarar');
  } else {
    armar({ 'amp@xelnagah-harness': true });
    const casa = fabricarCasa(Object.fromEntries(faltantes.map(id => [id, true])));
    const { texto } = correr(REPO_PRUEBA, [], casa);
    chequear('una dependencia declarada a nivel usuario no se marca',
      !/SIN DECLARAR/.test(texto),
      /SIN DECLARAR/.test(texto) ? 'las marca igual' : `${faltantes.length} declaradas a nivel usuario, ninguna marcada`);
  }
}

console.log('\n== LAS DOS PARTES ENTRE SÍ ==');
// Un Agente Multipropósito son dos cosas que viajan por caminos distintos —los plugins traen las
// skills, `amp:inicializar` escribe los archivos—, así que cada parte puede estar al día por su cuenta
// y no coincidir con la otra. Es el desfase que la decisión `Local-0034` se autodiagnosticó y que
// ningún control miraba hasta el 30/07/2026.
{
  const { texto } = correr();
  chequear('informa si los archivos son de la misma generación que los plugins',
    /Las dos partes coinciden|DE OTRA GENERACION/.test(texto),
    (texto.match(/(Las dos partes coinciden|\d+ archivo\(s\) DE OTRA GENERACION)/) || ['(no lo informa)'])[0]);
}
{
  // Si el plugin no está instalado PARA ese repo, no hay contra qué comparar y el chequeo se calla.
  // Es lo correcto y conviene fijarlo: inventar una comparación con la versión de otro repo sería
  // exactamente el modo de falla que esta Herramienta existe para no cometer.
  armar({ 'amp@xelnagah-harness': true });
  const { texto } = correr(REPO_PRUEBA, [], fabricarCasa());
  chequear('sin el plugin instalado para ese repo, no compara nada',
    !/DE OTRA GENERACION|Las dos partes coinciden/.test(texto), 'se calla, como debe');
}

console.log('\n== CACHE HUÉRFANO Y SU LIMPIEZA ==');
// El cache es de la MÁQUINA, no del repo: dos repos pueden correr versiones distintas del mismo
// plugin. Por eso solo se informa lo que NINGUNA entrada de instalación declara.
//
// Estos casos FABRICAN sus dos sobrantes en vez de esperar que la máquina tenga basura. La primera
// versión no lo hacía, y el día que se limpió el cache los chequeos del informe se pusieron rojos sin
// que la Herramienta hubiera cambiado: se habían quedado sin población que controlar. Un control que
// depende de que la máquina esté sucia no controla nada en una máquina limpia.
//   · un nombre que el marketplace SÍ ofrece, en una versión inventada  → rama «ya no corren»
//   · un nombre que el marketplace NO ofrece                            → rama «ya no ofrece»
{
  const CACHE = path.join(CASA_REAL, 'cache');
  const registro = path.join(CASA_REAL, 'installed_plugins.json');
  const reg = fs.existsSync(registro) ? JSON.parse(fs.readFileSync(registro, 'utf8')) : { plugins: {} };
  // La Herramienta ahora solo informa el cache del marketplace del Agente Multipropósito, así que el
  // sobrante hay que fabricarlo bajo ESE marketplace o la rama no se ejercita (queda fuera del barrido).
  const MK_AMP = 'xelnagah-harness';
  const conCache = Object.entries(reg.plugins || {})
    .map(([id, ent]) => ({ id, v: (ent || [])[0] && (ent || [])[0].version }))
    .filter(x => x.v && x.id.endsWith('@' + MK_AMP)
      && fs.existsSync(path.join(CACHE, x.id.split('@')[1] || '', x.id.split('@')[0], x.v)));
  // La rama «ya no ofrece» compara contra el catálogo del marketplace bajado, así que el sobrante fabricado tiene
  // que colgar de uno cuyo catálogo se pueda leer: sin catálogo la Herramienta no marca nada retirado,
  // y con razón (no puede saber qué se ofrece). Se prefiere un anfitrión que lo tenga.
  const conCatalogo = m => fs.existsSync(path.join(os.homedir(), '.claude', 'plugins', 'marketplaces',
    m, '.claude-plugin', 'marketplace.json'));
  const anfitrion = conCache.find(x => conCatalogo(x.id.split('@')[1])) || conCache[0];
  if (!anfitrion) {
    console.log('OMITIDO  no hay ningún plugin con cache en esta máquina: nada contra qué probar.');
  } else {
    const [nombre, mercado] = anfitrion.id.split('@');
    const sobrante = path.join(CACHE, mercado, nombre, '0.0.0-prueba-actualizar-plugins');
    const sobrantePlugin = path.join(CACHE, mercado, 'plugin-de-prueba-actualizar-plugins');
    const enUso = path.join(CACHE, mercado, nombre, anfitrion.v);
    try {
      fs.mkdirSync(sobrante, { recursive: true });
      fs.writeFileSync(path.join(sobrante, 'marca.txt'), 'carpeta sobrante fabricada por las pruebas');
      fs.mkdirSync(path.join(sobrantePlugin, '0.0.0'), { recursive: true });

      const { texto } = correr();   // diagnóstico pelado: informa, no borra
      chequear('informa las carpetas de versión que nadie usa',
        /carpeta\(s\) de version en el CACHE/.test(texto),
        (texto.match(/\d+ carpeta\(s\) de version en el CACHE/) || ['(no lo informa)'])[0]);
      chequear('  …separa el nombre que el marketplace ya no ofrece',
        conCatalogo(mercado) ? /ya no ofrece/.test(texto) : true,
        conCatalogo(mercado) ? '' : `NO CUBIERTO: ${mercado} no tiene catálogo bajado que leer`);
      chequear('  …de la versión vieja de un plugin vigente', /ya no corren/.test(texto));
      chequear('  …y no borra nada sin que se lo pidan', fs.existsSync(sobrante),
        fs.existsSync(sobrante) ? 'los sobrantes siguen ahí' : 'LOS BORRÓ SIN QUE SE LO PIDIERAN');

      // Cualquier plugin que alguna entrada declare no puede figurar como sobrante en su versión usada.
      const usados = Object.entries(reg.plugins || {})
        .flatMap(([id, ent]) => (ent || []).map(e => ({ id, v: e.version })))
        .filter(x => x.v);
      const mal = usados.filter(x => {
        const re = new RegExp(x.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s+\\((\\d+) de (\\d+)\\)');
        const m = re.exec(texto);
        return m && Number(m[1]) === Number(m[2]);   // marca TODAS sus versiones, incluida la usada
      });
      chequear('nunca marca como sobrante la versión que un repo está usando',
        mal.length === 0, mal.length ? mal.map(x => x.id).join(', ') : `${usados.length} entradas en uso, ninguna marcada entera`);

      // El borrado escribe AFUERA del repo, en la carpeta del usuario. Lo que más importa fijar no es
      // que borre, sino qué NO borra: ninguna versión que el registro declare puede desaparecer.
      // La guarda «sesion viva» saltea el plugin ENTERO cuando esta SIN CARGAR: esta sesion corre una
      // de sus carpetas del cache, asi que borrarlas rompe la sesion abierta. Es correcto, y pasa
      // siempre que se acaben de actualizar los plugins sin reiniciar — o sea, en el flujo normal de
      // una publicacion. El caso DERIVA su expectativa de lo que la Herramienta informa de su propia
      // guarda: exigir el borrado sin mirarla ponia el banco en rojo por una publicacion bien hecha,
      // que es un control avisando de algo que no esta mal.
      const limpieza = correr(null, ['--limpiar-cache']);
      const anfitrionSalteado = new RegExp('salteado: '
        + anfitrion.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(limpieza.texto);
      if (anfitrionSalteado) {
        chequear('--limpiar-cache saltea entero al plugin SIN CARGAR y no le borra ninguna carpeta',
          fs.existsSync(sobrante),
          'NO CUBIERTO el borrado: reiniciar la sesion y volver a correr para ejercitarlo');
      } else {
        chequear('--limpiar-cache borra lo que nadie declara', !fs.existsSync(sobrante),
          (limpieza.texto.match(/\d+ borrada\(s\)/) || ['(no lo informa)'])[0]);
      }
      chequear('  …y deja intacta la versión que el registro declara en uso',
        fs.existsSync(enUso), `${anfitrion.id} ${anfitrion.v}`);
    } finally {
      fs.rmSync(sobrante, { recursive: true, force: true });
      fs.rmSync(sobrantePlugin, { recursive: true, force: true });
    }
  }
}

console.log('\n== MODO DE SEGUNDO PLANO (--avisar) ==');
// Lo lanza la Pantalla de bienvenida sin esperarlo, así que NADIE mira su salida: lo único que
// produce es el aviso en el Buzón de Avisos Generales. Dos cosas hay que fijar — que no imprima
// (su stdout va al vacío) y que un repo SANO no deje aviso, porque un aviso que aparece siempre
// se vuelve ruido y se deja de leer.
{
  const repoAviso = path.resolve('.claude/tmp/repo-avisos-prueba');
  const buzon = path.join(repoAviso, '.claude', 'tmp', 'avisos', 'plugins.txt');
  try {
    // Un repo que declara `amp` sin sus dependencias: no cargan, y sus skills no existen.
    fs.rmSync(repoAviso, { recursive: true, force: true });
    fs.mkdirSync(path.join(repoAviso, '.claude'), { recursive: true });
    fs.writeFileSync(path.join(repoAviso, '.claude', 'settings.local.json'),
      JSON.stringify({ enabledPlugins: { 'amp@xelnagah-harness': true } }, null, 2));

    const { texto, codigo } = correr(repoAviso, ['--avisar'], fabricarCasa());
    chequear('no imprime nada: su salida no la mira nadie', !texto.trim(), texto.slice(0, 50) || '(silencio)');
    chequear('  …y sale 0', codigo === 0, `código ${codigo}`);
    chequear('deja el aviso en el buzón', fs.existsSync(buzon), buzon);
    const aviso = fs.existsSync(buzon) ? fs.readFileSync(buzon, 'utf8') : '';
    // El orden importa: lo que deja al plugin sin cargar va ANTES que una versión atrasada.
    chequear('  …y pone primero lo que rompe', /NO CARGAN/.test(aviso.split('\n')[1] || ''),
      (aviso.split('\n')[1] || '').slice(0, 60));
    chequear('  …y avisa que hay que reiniciar', /REINICIAR/.test(aviso));
    chequear('  …y que informa, no actúa', /informa, no actua/i.test(aviso));

    // Ahora el mismo repo, sano: el aviso viejo tiene que desaparecer, no quedar repitiéndose.
    fs.writeFileSync(path.join(repoAviso, '.claude', 'settings.local.json'),
      JSON.stringify({ enabledPlugins: {} }, null, 2));
    correr(repoAviso, ['--avisar'], fabricarCasa());
    chequear('un repo sin desfases no deja aviso', !fs.existsSync(buzon),
      fs.existsSync(buzon) ? 'QUEDÓ UN AVISO VIEJO' : 'buzón limpio');
  } finally {
    fs.rmSync(repoAviso, { recursive: true, force: true });
  }
}

console.log('\n== TOLERA LO QUE FALTA ==');
// También con casa fabricada: «sin plugins declarados» tiene que ser de verdad ninguno, y con la casa
// real el repo hereda los que la persona haya habilitado a nivel usuario.
{
  // repo sin ninguna configuración: no hay nada que diagnosticar, pero no puede reventar
  fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
  fs.mkdirSync(path.join(REPO_PRUEBA, '.claude'), { recursive: true });
  const { codigo } = correr(REPO_PRUEBA, [], fabricarCasa());
  chequear('un repo sin plugins declarados no rompe', codigo === 0, `código ${codigo}`);
}
{
  // `enabledPlugins` con basura en vez de un objeto
  fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
  fs.mkdirSync(path.join(REPO_PRUEBA, '.claude'), { recursive: true });
  fs.writeFileSync(path.join(REPO_PRUEBA, '.claude', 'settings.local.json'), '{"enabledPlugins": "no soy un objeto"}');
  const { codigo } = correr(REPO_PRUEBA, [], fabricarCasa());
  chequear('una configuración mal formada no rompe', codigo === 0, `código ${codigo}`);
}

fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
fs.rmSync(CASA_PRUEBA, { recursive: true, force: true });
console.log(`\ncasos: ${casos}`);
console.log('no cubierto a propósito: el cache y las entradas de instalación se miran sobre la carpeta real');
console.log('                         del usuario; fabricarlas exigiría copiar el árbol de plugins bajado.');
console.log(malos ? `${malos} FALLARON.` : 'TODO VERDE.');
process.exit(malos ? 1 : 0);
