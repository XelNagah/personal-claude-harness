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
function correr(rutaRepo) {
  const args = ['--agente', 'claude'];
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

console.log('\n== CACHE HUÉRFANO ==');
// El cache es de la MÁQUINA, no del repo: dos repos pueden correr versiones distintas del mismo
// plugin. Por eso solo se informa lo que NINGUNA entrada de instalación declara. El caso real que lo
// prueba: `amp-memoria` es un nombre que el marketplace ya no ofrece, pero un repo de esta máquina
// todavía lo declara, así que NO puede aparecer como sobrante.
{
  const { texto } = correr();
  chequear('informa las carpetas de versión que nadie usa',
    /carpeta\(s\) de version en el CACHE/.test(texto),
    (texto.match(/\d+ carpeta\(s\) de version en el CACHE/) || ['(no lo informa)'])[0]);
  chequear('  …y separa los nombres retirados de las versiones viejas',
    /ya no ofrece/.test(texto) || /ya no corren/.test(texto));
  const enUso = require('fs').existsSync(require('path').join(require('os').homedir(),
    '.claude', 'plugins', 'installed_plugins.json'));
  if (enUso) {
    const reg = JSON.parse(require('fs').readFileSync(require('path').join(require('os').homedir(),
      '.claude', 'plugins', 'installed_plugins.json'), 'utf8'));
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
console.log(`\ncasos: 12`);
console.log('no cubierto a propósito: el estado de instalación de la máquina sale de la carpeta del usuario');
console.log('                         y no es parametrizable, así que no se puede simular otra máquina.');
console.log(malos ? `${malos} FALLARON.` : 'TODO VERDE.');
process.exit(malos ? 1 : 0);
