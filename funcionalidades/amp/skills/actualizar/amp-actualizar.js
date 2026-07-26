#!/usr/bin/env node
// amp-actualizar.js — motor mecanico del nivelador del harness (decision 0028).
// Barre el .claude/ del repo actual (process.cwd()), clasifica cada pieza contra la estructura
// objetivo del harness y emite el plan/reporte. Ademas hace el respaldo. La parte de JUICIO
// (confirmar el plan, migrar terminos, preguntar ante lo divergente, escribir el contenido Base
// delegando en los inicializar-<sub>) vive en el SKILL; aca vive solo lo determinista (dec. 0009).
// Sin LLM, sin red.
//
// Modos (uno por corrida):
//   (sin flag) | --vista-previa   detecta y muestra el plan; NO escribe nada.
//   --respaldo                     respalda .claude/ FUERA del repo (o lo omite si git ya lo cubre).
// Uso: node amp-actualizar.js [--vista-previa | --respaldo] [<raiz del repo>]
//      (default: raiz = cwd; sin flag equivale a --vista-previa)

const fs = require('fs'), path = require('path'), os = require('os');
const { spawnSync } = require('child_process');

const args = process.argv.slice(2);
const modoRespaldo = args.includes('--respaldo');
const rutaArg = args.find(a => !a.startsWith('--'));
const repo = path.resolve(rutaArg || process.cwd());
const claude = path.join(repo, '.claude');

const hoy = fechaISO(new Date());   // AAAA-MM-DD (script real, no Workflow: new Date esta permitido)

// -- utilidades ---------------------------------------------------------
function fechaISO(d) {
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
const existe = p => fs.existsSync(p);
const esDir = p => { try { return fs.statSync(p).isDirectory(); } catch { return false; } };
const leer = p => { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } };

// Renombres conocidos (carpeta vieja -> nueva). Extensible: se suman los que aparezcan (dec. 0028).
// v1 arranca solo con glosario -> semantica (dec. 0026).
const RENOMBRES = [
  { viejo: 'glosario', nuevo: 'semantica', que: 'subsistema', lintViejo: 'lint-glosario', lintNuevo: 'lint-semantica' },
];

// Subsistemas Base esperados por el harness al dia (carpetas bajo .claude/).
const SUBSISTEMAS = ['memoria', 'planes', 'conocimiento', 'semantica', 'decisiones', 'herramientas', 'conducta'];

// Herramientas que el harness manda (origen Base) y que todo repo al dia deberia tener bajo
// .claude/herramientas/<nombre>/<nombre>.js. No confundir con las del Proposito, que las suma
// cada repo y el nivelador nunca toca.
const HERRAMIENTAS_BASE = ['actualizar-plugins'];

// Campos minimos de un MANIFIESTO (mismo criterio que lint-harness): titulo, Disparador, Skills,
// declaracion de carga del indice, comando de lint del propio subsistema.
function manifiestoCompleto(txt, sub) {
  if (!/^#\s+\S/m.test(txt)) return false;
  if (!/Disparador/.test(txt)) return false;
  if (!/\*\*Skills\b/.test(txt)) return false;
  if (!/(NO\s+)?se carga siempre/i.test(txt)) return false;
  if (!new RegExp('node \\.claude/' + sub + '/lint-' + sub + '/').test(txt)) return false;
  return true;
}

// -- clasificacion ------------------------------------------------------
// Cada hallazgo: { grupo: 'base'|'renombre'|'divergente'|'ok', marca, item, detalle }
const hallazgos = [];
const add = (grupo, marca, item, detalle) => hallazgos.push({ grupo, marca, item, detalle: detalle || '' });

function clasificar() {
  if (!esDir(claude)) {
    add('divergente', '?', '.claude/', 'no existe: este repo no tiene el Agente Multiproposito instalado (usar amp:inicializar, no el nivelador)');
    return;
  }

  // [1] renombres legacy (carpeta vieja presente)
  for (const r of RENOMBRES) {
    const dirViejo = path.join(claude, r.viejo);
    if (esDir(dirViejo)) {
      const glos = path.join(dirViejo, 'GLOSARIO.md');
      const terminos = existe(glos) ? contarFilasTabla(leer(glos)) : null;
      const nota = terminos != null ? `${terminos} termino(s) preservado(s)` : 'contenido preservado';
      add('renombre', '→', `${r.viejo}/ → ${r.nuevo}/`, `${r.que} renombrado; ${r.lintViejo} → ${r.lintNuevo}; ${nota}`);
    }
  }

  // [2] subsistemas Base: presentes / ausentes / con piezas faltantes
  for (const sub of SUBSISTEMAS) {
    const dir = path.join(claude, sub);
    // si es el destino de un renombre y todavia esta como carpeta vieja, ya se reporto arriba
    const esDestinoRenombre = RENOMBRES.find(r => r.nuevo === sub);
    if (esDestinoRenombre && esDir(path.join(claude, esDestinoRenombre.viejo)) && !esDir(dir)) continue;

    if (!esDir(dir)) {
      add('base', '+', `${sub}/`, 'subsistema ausente: instalar completo');
      continue;
    }
    // MANIFIESTO presente y con campos minimos
    const mani = path.join(dir, 'MANIFIESTO.md');
    if (!existe(mani)) add('base', '~', `${sub}/MANIFIESTO.md`, 'ausente: instalar');
    else if (!manifiestoCompleto(leer(mani), sub)) add('base', '~', `${sub}/MANIFIESTO.md`, 'estructura vieja: poner al dia');
    // lint del subsistema presente
    if (!existe(path.join(dir, `lint-${sub}`, `lint-${sub}.js`))) add('base', '~', `${sub}/lint-${sub}/`, 'lint ausente: instalar');
  }

  // [2b] Herramientas Base: viven DENTRO de herramientas/, asi que un subsistema presente puede
  // igual estar incompleto. Sin este chequeo, un repo al que le falta una Herramienta Base se
  // informa "ya estaba" — que es lo que pasa cuando se clasifica por subsistema y no por pieza.
  const dirHerr = path.join(claude, 'herramientas');
  if (esDir(dirHerr)) {
    for (const h of HERRAMIENTAS_BASE) {
      if (!existe(path.join(dirHerr, h, `${h}.js`))) add('base', '+', `herramientas/${h}/`, 'Herramienta Base ausente: instalar con su README y su fila en el INDICE');
      else if (!existe(path.join(dirHerr, h, 'README.md'))) add('base', '~', `herramientas/${h}/README.md`, 'ausente: instalar');
    }
    const indiceHerr = path.join(dirHerr, 'INDICE.md');
    if (existe(indiceHerr)) {
      const t = leer(indiceHerr);
      for (const h of HERRAMIENTAS_BASE) {
        if (!t.includes(h)) add('base', '~', `herramientas/INDICE.md`, `sin fila para la Herramienta Base ${h}: agregar en la seccion Herramientas Base`);
      }
    }
  }

  // [3] conducta: piezas propias + corte Base/Proposito + la Pantalla de bienvenida
  const cond = path.join(claude, 'conducta');
  if (esDir(cond)) {
    for (const pieza of [['MOMENTOS.md', 'archivo'], ['establecer-conducta', 'hook'], ['lint-conducta', 'lint'],
                         ['mostrar-pantalla-bienvenida', 'Herramienta de la Pantalla de bienvenida']]) {
      if (!existe(path.join(cond, pieza[0]))) add('base', '~', `conducta/${pieza[0]}`, `${pieza[1]} ausente: instalar`);
    }
    // El momento "al arrancar la sesion" es lo que dispara la Pantalla; sin el, la regla no se entrega.
    const momentos = path.join(cond, 'MOMENTOS.md');
    if (existe(momentos) && !/al arrancar la sesi[oó]n/i.test(leer(momentos)))
      add('base', '~', 'conducta/MOMENTOS.md', 'sin el momento «al arrancar la sesion» (SessionStart): agregar la fila');

    const indice = path.join(cond, 'INDICE.md');
    if (existe(indice)) {
      const t = leer(indice);
      const tieneCorte = /##\s+Reglas Base/i.test(t) && /##\s+Reglas del Prop[oó]sito/i.test(t);
      const tieneReglas = /\|\s*inyectar\s*\||\|\s*correr\s*\||\|\s*bloquear\s*\|/i.test(t);
      if (!tieneCorte && tieneReglas)
        add('divergente', '?', 'conducta/INDICE.md', 'reglas sin corte Base/Proposito (pre-0027): repartir requiere decidir cuales son Base y cuales del Proposito');
      else if (!tieneCorte)
        add('base', '~', 'conducta/INDICE.md', 'sin secciones Reglas Base / Reglas del Proposito: poner al dia');
      if (!/mostrar-pantalla-bienvenida/.test(t))
        add('base', '~', 'conducta/INDICE.md', 'sin la Regla Base que muestra la Pantalla de bienvenida al arrancar: agregar la fila');
    }
  }

  // [3b] identidad del repo: Titulo + Proposito. Sin este archivo, la Pantalla de bienvenida y
  // amp:info no tienen que mostrar.
  if (!existe(path.join(claude, 'identidad.md')))
    add('base', '+', 'identidad.md', 'ausente: Titulo + Proposito del repo (se preguntan, no se inventan)');

  // [4] cableado de los hooks en settings.json. Son TRES eventos y cada uno cumple lo suyo: sin
  // SessionStart no hay Pantalla de bienvenida al arrancar, que es una regla Base de conducta.
  const settings = path.join(claude, 'settings.json');
  const cableado = revisarHook(settings);
  if (!cableado.ups || !cableado.pre || !cableado.ses) {
    const faltan = [!cableado.ses && 'SessionStart', !cableado.ups && 'UserPromptSubmit', !cableado.pre && 'PreToolUse Write|Edit'].filter(Boolean).join(' + ');
    add('base', '~', 'settings.json', `hook establecer-conducta sin cablear (${faltan}): agregar por merge`);
  }
}

// cuenta filas de datos de la primera tabla markdown (descarta header y separador)
function contarFilasTabla(txt) {
  let n = 0, enTabla = false, pasoHeader = false;
  for (const linea of txt.split('\n')) {
    const l = linea.trim();
    if (!l.startsWith('|')) { if (enTabla) break; continue; }
    if (!enTabla) { enTabla = true; continue; }              // header
    if (/^\|[\s:|-]+\|?$/.test(l)) { pasoHeader = true; continue; } // separador ---
    if (pasoHeader) n++;
  }
  return n;
}

// lee settings.json y dice si el hook establecer-conducta esta en UserPromptSubmit y en PreToolUse
function revisarHook(settingsPath) {
  const out = { ups: false, pre: false, ses: false };
  if (!existe(settingsPath)) return out;
  let cfg; try { cfg = JSON.parse(leer(settingsPath)); } catch { return out; }
  const hooks = (cfg && cfg.hooks) || {};
  const tiene = (evento) => (hooks[evento] || []).some(g =>
    (g.hooks || []).some(h => typeof h.command === 'string' && /establecer-conducta/.test(h.command)));
  out.ups = tiene('UserPromptSubmit');
  out.pre = tiene('PreToolUse');
  out.ses = tiene('SessionStart');
  return out;
}

// -- respaldo -----------------------------------------------------------
// El respaldo existe por UNA razon: `.claude/` suele estar fuera del control de versiones, asi que
// pisar lo Base no tiene red. Cuando `.claude/` SI esta versionado, git ya cumple ese papel y el
// respaldo solo agrega una copia que nadie limpia.
function claudeVersionado() {
  const r = spawnSync('git', ['ls-files', '--', '.claude'], { cwd: repo, encoding: 'utf8', timeout: 10000 });
  if (!r || r.status !== 0) return false;         // no es repo git, o git no esta: hace falta respaldo
  return !!(r.stdout || '').trim();
}

// Cuando hace falta, el respaldo va FUERA de `.claude/`, al temporal del sistema. Dos motivos, y
// los dos se sufrieron: adentro de `.claude/` el propio agente no puede borrarlo (el borrado
// recursivo bajo `.claude/` esta vedado, asi que la limpieza que la skill manda hacer queda para
// el usuario a mano), y ademas los lints barren `.claude/` entero — una copia congelada duplica
// cada hallazgo viejo, ya incorregible, y ahoga la senal con ruido.
function carpetaRespaldo() {
  const marca = path.basename(repo).replace(/[^\w.-]+/g, '-');
  return path.join(os.tmpdir(), 'amp-respaldo', marca, hoy);
}

function respaldar() {
  if (!esDir(claude)) { console.log('No hay .claude/ para respaldar.'); process.exit(0); }
  if (claudeVersionado()) {
    console.log('Respaldo OMITIDO: `.claude/` esta versionado en git, que ya es la red.');
    console.log('(Para volver atras: `git diff` y `git checkout --` sobre lo que se haya pisado.)');
    return;
  }
  const destino = carpetaRespaldo();
  const EXCL = new Set(['.respaldo-amp', 'node_modules', '.git']);
  fs.mkdirSync(destino, { recursive: true });
  let copiados = 0;
  for (const entrada of fs.readdirSync(claude)) {
    if (EXCL.has(entrada)) continue;
    fs.cpSync(path.join(claude, entrada), path.join(destino, entrada), { recursive: true });
    copiados++;
  }
  console.log(`Respaldo hecho (${copiados} entrada(s)) FUERA del repo:`);
  console.log(`  ${destino}`);
  console.log('Es de un solo uso: sirve hasta verificar que el repo quedo bien, despues se borra.');
}

// -- reporte ------------------------------------------------------------
function reportar() {
  clasificar();
  const grupos = [
    ['BASE — INSTALAR / PISAR (se respalda antes de aplicar)', 'base'],
    ['RENOMBRES LEGACY', 'renombre'],
    ['DIVERGENTE — REQUIERE TU OK (no se toca sin confirmar)', 'divergente'],
  ];
  const nombreRepo = path.basename(repo);
  console.log(`amp-actualizar · repo «${nombreRepo}» · ${hoy} · modo: vista previa`);
  console.log('(no se escribe nada; para aplicar, el skill confirma el plan, respalda y ejecuta)\n');

  let totalAccion = 0;
  for (const [titulo, g] of grupos) {
    const items = hallazgos.filter(h => h.grupo === g);
    totalAccion += items.length;
    console.log(`${titulo}   (${items.length})`);
    items.forEach(h => console.log(`    ${h.marca} ${h.item}${h.detalle ? '   — ' + h.detalle : ''}`));
    if (!items.length) console.log('    (ninguno)');
    console.log('');
  }
  // ya estaba: los subsistemas presentes y completos, sin hallazgo alguno
  const conHallazgo = new Set(hallazgos.filter(h => h.grupo !== 'ok').map(h => h.item.split('/')[0]));
  const yaEstaban = SUBSISTEMAS.filter(s => esDir(path.join(claude, s)) && !conHallazgo.has(s) && !conHallazgo.has(`${s}`));
  console.log(`YA ESTABA (sin cambios)   (${yaEstaban.length})`);
  console.log(yaEstaban.length ? '    ' + yaEstaban.map(s => `${s}/`).join('  ') : '    (ninguno)');
  console.log('');

  if (totalAccion === 0) console.log('Repo al día: nada para nivelar.');
  else console.log(`Total de acciones propuestas: ${totalAccion}. Revisá el plan antes de aplicar.`);
}

// -- despacho -----------------------------------------------------------
if (modoRespaldo) respaldar();
else reportar();   // sin flag = vista previa
