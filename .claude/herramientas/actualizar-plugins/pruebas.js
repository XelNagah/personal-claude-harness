#!/usr/bin/env node
// Pruebas de `actualizar-plugins`.
//
// Esta Herramienta es la que decide si la fase de plugins esta al dia, y de eso depende que
// `amp:actualizar` nivele los archivos con el instalador correcto o con uno viejo. Su falla mas caro
// no es un error: es contestar TODO ACTUALIZADO cuando algo falta, que es exactamente lo que paso
// antes de que existiera la deteccion de dependencias sin declarar — el plugin que las pide no carga
// y la Herramienta informaba todo bien.
//
// LIMITE DECLARADO: el estado de instalacion sale de la carpeta del usuario (`os.homedir()`) y no es
// parametrizable, asi que las pruebas NO pueden simular una maquina distinta. Lo que si se controla
// es el repo: se le apunta a un repo de prueba con su `enabledPlugins` fabricado, y se verifica la
// clasificacion que depende de eso. Lo que la prueba no cubre queda dicho en la salida.
//
// Uso: node .claude/herramientas/actualizar-plugins/pruebas.js   (desde la raíz del repo)
const fs = require('fs'), path = require('path'), cp = require('child_process');
const TOOL = path.resolve('.claude/herramientas/actualizar-plugins/actualizar-plugins.js');
const REPO_PRUEBA = path.resolve('.claude/tmp/repo-prueba-plugins');

// `--agente claude` se pasa siempre: sin eso la Herramienta deduce el agente del entorno, y la
// prueba pasaría o fallaría según desde dónde se la corra.
function correr(rutaRepo, flags = []) {
  const args = ['--agente', 'claude', ...flags];
  if (rutaRepo) args.push(rutaRepo);
  const r = cp.spawnSync(process.execPath, [TOOL, ...args], { encoding: 'utf8', timeout: 180000 });
  return { texto: (r.stdout || '') + (r.stderr || ''), codigo: r.status };
}

// Arma un repo con el `enabledPlugins` que se le pida, en `settings.local.json` (alcance `local`,
// que es el que fija la decisión `Local-0035`).
function armar(plugins) {
  fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
  fs.mkdirSync(path.join(REPO_PRUEBA, '.claude'), { recursive: true });
  fs.writeFileSync(path.join(REPO_PRUEBA, '.claude', 'settings.local.json'),
    JSON.stringify({ enabledPlugins: plugins }, null, 2));
}

let malos = 0;
const chequear = (nombre, condicion, detalle) => {
  console.log(`${condicion ? 'OK  ' : 'FALLA'} ${nombre}${detalle ? `  → ${detalle}` : ''}`);
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
{
  // Un nombre que el marketplace no ofrece: tiene que salir marcado, no callado.
  armar({ 'amp-inexistente@xelnagah-harness': true });
  const { texto } = correr(REPO_PRUEBA);
  chequear('un plugin declarado que no existe se marca',
    /amp-inexistente/.test(texto) && /RETIRADO|NO INSTALADO|SIN DATO/.test(texto),
    (texto.match(/amp-inexistente\S*\s+\S+/) || ['(no aparece)'])[0]);
}
{
  // El caso que motivó la detección: se declara `amp` sin sus dependencias. El plugin que las pide
  // no carga, y antes de esto la Herramienta informaba todo al día.
  armar({ 'amp@xelnagah-harness': true });
  const { texto } = correr(REPO_PRUEBA);
  chequear('una dependencia que el repo no declara se marca SIN DECLARAR',
    /SIN DECLARAR/.test(texto), (texto.match(/\S+\s+SIN DECLARAR/) || ['(no la marca)'])[0]);
  chequear('  …y no informa que está todo al día',
    !/^TODO ACTUALIZADO/m.test(texto), /^TODO ACTUALIZADO/m.test(texto) ? 'dice TODO ACTUALIZADO' : 'no lo dice');
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
  const { texto } = correr(REPO_PRUEBA);
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
  const os = require('os');
  const CACHE = path.join(os.homedir(), '.claude', 'plugins', 'cache');
  const registro = path.join(os.homedir(), '.claude', 'plugins', 'installed_plugins.json');
  const reg = fs.existsSync(registro) ? JSON.parse(fs.readFileSync(registro, 'utf8')) : { plugins: {} };
  const conCache = Object.entries(reg.plugins || {})
    .map(([id, ent]) => ({ id, v: (ent || [])[0] && (ent || [])[0].version }))
    .filter(x => x.v && fs.existsSync(path.join(CACHE, x.id.split('@')[1] || '', x.id.split('@')[0], x.v)));
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
      const limpieza = correr(null, ['--limpiar-cache']);
      chequear('--limpiar-cache borra lo que nadie declara', !fs.existsSync(sobrante),
        (limpieza.texto.match(/\d+ borrada\(s\)/) || ['(no lo informa)'])[0]);
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

    const { texto, codigo } = correr(repoAviso, ['--avisar']);
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
    correr(repoAviso, ['--avisar']);
    chequear('un repo sin desfases no deja aviso', !fs.existsSync(buzon),
      fs.existsSync(buzon) ? 'QUEDÓ UN AVISO VIEJO' : 'buzón limpio');
  } finally {
    fs.rmSync(repoAviso, { recursive: true, force: true });
  }
}

console.log('\n== TOLERA LO QUE FALTA ==');
{
  // repo sin ninguna configuración: no hay nada que diagnosticar, pero no puede reventar
  fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
  fs.mkdirSync(path.join(REPO_PRUEBA, '.claude'), { recursive: true });
  const { codigo } = correr(REPO_PRUEBA);
  chequear('un repo sin plugins declarados no rompe', codigo === 0, `código ${codigo}`);
}
{
  // `enabledPlugins` con basura en vez de un objeto
  fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
  fs.mkdirSync(path.join(REPO_PRUEBA, '.claude'), { recursive: true });
  fs.writeFileSync(path.join(REPO_PRUEBA, '.claude', 'settings.local.json'), '{"enabledPlugins": "no soy un objeto"}');
  const { codigo } = correr(REPO_PRUEBA);
  chequear('una configuración mal formada no rompe', codigo === 0, `código ${codigo}`);
}

fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
console.log(`\ncasos: 22`);
console.log('no cubierto a propósito: el estado de instalación de la máquina sale de la carpeta del usuario');
console.log('                         y no es parametrizable, así que no se puede simular otra máquina.');
console.log(malos ? `${malos} FALLARON.` : 'TODO VERDE.');
process.exit(malos ? 1 : 0);
