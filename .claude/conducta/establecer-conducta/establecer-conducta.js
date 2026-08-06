#!/usr/bin/env node
// Hook repartidor del subsistema conducta. Un mismo script sirve a varios eventos:
// lee el registro VIVO de reglas (../INDICE.md), resuelve que momento(s) realiza el evento que lo
// disparo (con su condicion, sin juicio), y despacha las reglas de ese momento segun su clase.
// Agregar/cambiar una regla NO toca este script: lee el registro en cada disparo.
//
// Eventos que realiza hoy (la realizacion del momento es agente-especifica):
//   - UserPromptSubmit         -> momento `cada turno`            (sin condicion)      [clase Inyectar]
//   - PreToolUse Write|Edit|apply_patch de un .md -> momento `al escribir` (condicion sin juicio)
//                                                   [clases Inyectar + Bloquear, combinadas]
//   - SessionStart             -> momento `al arrancar la sesion` (sin condicion)     [clase Ejecutar]
// El vocabulario de momentos vive en ../MOMENTOS.md; aca vive COMO se realiza cada uno.
//
// Tres clases de despacho:
//   - Inyectar: arma un texto y lo emite como additionalContext (llega al modelo).
//   - Ejecutar: ejecuta la Herramienta cuya ruta es el Contenido de la regla y REENVIA su stdout
//               (ej. la Pantalla de bienvenida emite {systemMessage} en SessionStart: ese campo es
//               el unico que escribe en la terminal del usuario). Es para momentos donde la salida
//               del hijo ES la respuesta del hook; si hay varias reglas, se fusionan (ver abajo).
//   - Bloquear: ejecuta la Herramienta cuya ruta es el Contenido y LEE su respuesta. Si trae
//               permissionDecision 'deny', se emite ese deny solo (frena la accion; el
//               additionalContext se descartaria igual). Si trae additionalContext, se COMBINA
//               con el texto de las reglas `Inyectar` del mismo momento.
//
// Combinacion: en un mismo momento conviven reglas `Inyectar` (texto fijo, vive en el registro y lo
// actualiza el harness) y `Bloquear` (datos medidos, los produce un programa). Se emiten juntas, una
// abajo de la otra. `Ejecutar` tambien se combina, pero por otro campo: sus salidas se fusionan en
// un unico `systemMessage`, porque dos JSON pegados no son JSON valido y el harness los descarta.
//
// Contrato de hook (conocimiento hooks-claude-code): stdin = JSON del harness; stdout = JSON.
//   UserPromptSubmit/PreToolUse: { hookSpecificOutput: { hookEventName, additionalContext } }
//     (PreToolUse sin permissionDecision => 'defer': inyecta y deja el flujo de permisos intacto,
//     verificado 2026-07-23; NO auto-aprueba. additionalContext llega junto al resultado de la tool.)
//   SessionStart: lo que emitan las Herramientas de la clase `Ejecutar` (ej. { systemMessage: <caja> }, visible al usuario).
// Nunca rompe el turno: ante cualquier error o registro vacio, sale 0 sin emitir nada.
//
// Uso a mano (probar): echo {"hook_event_name":"SessionStart"} | node establecer-conducta.js
const fs = require('fs'), path = require('path');
const { execSync } = require('child_process');
const dirSub = path.resolve(__dirname, '..');
const repoRoot = path.resolve(__dirname, '..', '..', '..');   // .../conducta/establecer-conducta -> repo

// -- los Indices de reglas del subsistema --------------------------------
// Son los .md del subsistema que se declaran Indice en su frontmatter (uno por origen), con
// INDICE.md de respaldo para la forma vieja. El repartidor los lee a TODOS: quedarse con el del
// Agente Multiproposito dejaria sin entregar las reglas que el repo sumo, y sin ninguna senal.
const { leerFrontmatter } = require('../../common/frontmatter.js');
function indicesDeReglas() {
  let nombres = [];
  try { nombres = fs.readdirSync(dirSub).filter(n => n.endsWith('.md')).sort(); } catch (e) { return []; }
  // Se guarda el `origen` de cada uno porque decide el ORDEN en que se entregan sus reglas, y ese
  // orden se ve: cuando un momento tiene varias, salen una detras de la otra. Sin esto el orden lo
  // decide el nombre del archivo —`INDICE-LOCAL.md` ordena antes que `INDICE.md`— y las reglas que
  // sumo el repo saldrian delante de las del Agente Multiproposito, al reves que en todo registro.
  const declarados = [];
  for (const n of nombres) {
    let txt; try { txt = fs.readFileSync(path.join(dirSub, n), 'utf8'); } catch (e) { continue; }
    const fm = leerFrontmatter(txt);
    if (!(fm && fm.indice)) continue;
    const esBase = fm.origen === 'agente-multiproposito';
    declarados.push({ nombre: n, orden: esBase ? 0 : 1 });
  }
  declarados.sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre));
  const elegidos = declarados.length ? declarados.map(d => d.nombre) : ['INDICE.md'];
  return elegidos.map(n => path.join(dirSub, n)).filter(p => fs.existsSync(p));
}

// -- rutas que toca una escritura ---------------------------------------
// Dos formas, segun el agente:
//   Claude Code -> tool_input.file_path, una sola ruta.
//   Codex       -> apply_patch manda el parche entero en tool_input.command y puede tocar VARIAS
//                  rutas de una (`*** Update File: <ruta>`), asi que la condicion pregunta por
//                  ALGUNA ruta, no por LA ruta. Leer file_path ahi devuelve vacio y la condicion
//                  contestaria que no se cumple, sin fallar: el momento no se entregaria nunca.
function rutasDe(ti) {
  if (!ti) return [];
  if (ti.file_path) return [String(ti.file_path).replace(/\\/g, '/')];
  if (typeof ti.command === 'string')
    return [...ti.command.matchAll(/^\*\*\*\s+(?:Add|Update|Delete) File:\s*(.+)$/gm)]
      .map(m => m[1].trim().replace(/\\/g, '/'));
  return [];
}

// Que archivos realiza el momento `al escribir` lo define UN solo archivo del subsistema, que
// tambien lee el control que despacha: escrito dos veces, una lista suma una extension y la otra no,
// y queda un archivo sin revisar sin que nada lo diga.
const { alcanzaAlEscribir } = require('../alcance-al-escribir.js');

// -- que momento realiza cada evento, con su condicion sin juicio -------
// Devuelve el nombre del momento a entregar, o null si el evento+datos no realiza ninguno.
function momentoDe(data) {
  const ev = data.hook_event_name;
  if (ev === 'UserPromptSubmit') return 'cada turno';
  if (ev === 'SessionStart') return 'al arrancar la sesión';
  if (ev === 'PreToolUse') {
    const tool = data.tool_name || '';
    if (tool !== 'Write' && tool !== 'Edit' && tool !== 'apply_patch') return null;
    // condicion `al escribir`: escribir/editar un .md O UN ARCHIVO DE CODIGO de cualquier parte del
    // repo (lo que se publica incluido, que es por donde entra la terminologia ajena), salvo el
    // directorio de borradores tmp/, que el repo gitignorea y es material descartable.
    // El codigo entro con la decision `Local-0052`: medido, un termino vetado se escribio nueve
    // veces en un .js y viajo a base/ sin que ningun control lo tocara. ALLA EL CONTROL SOLO AVISA,
    // y eso lo decide el propio control mirando la ruta, no este repartidor.
    const rutas = rutasDe(data.tool_input);
    if (!rutas.some(alcanzaAlEscribir)) return null;
    return 'al escribir';
  }
  return null;
}

// -- parseo minimo de la tabla markdown del registro de reglas ----------
function leerReglas(txt) {
  const filas = [];
  const lineas = txt.split('\n').map(l => l.trim()).filter(l => l.startsWith('|'));
  let cols = null;
  for (const l of lineas) {
    const celdas = l.split('|').slice(1, -1).map(c => c.trim());
    const norm = celdas.map(c => c.toLowerCase().replace(/\*/g, ''));
    if (!cols) {
      // La columna del nombre es `Nombre` desde que el registro tomo el nucleo; `Regla` es la
      // forma vieja y se acepta mientras haya Agentes Desplegados sin actualizar. Sin ninguna de las
      // dos el encabezado no matchea, no se lee una sola fila y el repartidor deja de entregar
      // reglas SIN emitir error: es el fallo silencioso que motivo declarar las columnas.
      if ((norm.includes('nombre') || norm.includes('regla')) && norm.includes('momento')) {
        cols = { momento: norm.indexOf('momento'), clase: norm.indexOf('clase'),
                 contenido: norm.indexOf('contenido'), estado: norm.indexOf('estado') };
      }
      continue;
    }
    if (/^:?-{2,}:?$/.test(celdas[0].replace(/\s/g, ''))) continue;
    const val = i => (i >= 0 && i < celdas.length ? celdas[i] : '');
    filas.push({ momento: val(cols.momento).toLowerCase(), clase: val(cols.clase).toLowerCase(),
                 contenido: val(cols.contenido), estado: val(cols.estado).toLowerCase() });
  }
  return filas;
}

// Devuelve las reglas del registro que matchean (clase, vigente, momento) con Contenido.
function reglasDe(momento, clase) {
  if (!momento) return [];
  const filas = [];
  for (const p of indicesDeReglas()) {
    try { filas.push(...leerReglas(fs.readFileSync(p, 'utf8'))); } catch (e) { /* un indice ilegible no frena el turno */ }
  }
  return filas.filter(r => r.clase === clase && r.estado === 'vigente' && r.momento === momento && r.contenido);
}

// -- inyectar: texto para el modelo -------------------------------------
function construir(momento) {
  const reglas = reglasDe(momento, 'inyectar');
  if (!reglas.length) return '';
  const bullets = reglas.map(r => `- ${r.contenido}`).join('\n');
  return `Recordatorio de conducta — momento «${momento}» (subsistema conducta):\n${bullets}`;
}

// -- ejecutar la Herramienta de una regla y devolver su stdout ----------
// El Contenido es la ruta del script relativa a .claude/ (con sus flags), ej.
// `conducta/mostrar-pantalla-bienvenida/mostrar-pantalla-bienvenida.js --hook`.
function ejecutar(regla, input) {
  try {
    return execSync('node .claude/' + regla.contenido, { cwd: repoRoot, input, encoding: 'utf8', timeout: 20000 });
  } catch (e) { return ''; }   // no romper el turno: el hijo fallo, se ignora
}

// -- Buzon de Avisos Generales -------------------------------------------
// Un trabajo que corre en SEGUNDO PLANO deja lo que averiguo en `.claude/tmp/avisos/<origen>.txt`,
// y este repartidor lo entrega en el turno siguiente y lo borra: un aviso se da una vez. Existe
// porque un dato que tarda mas que el arranque no se puede dar al arrancar —consultarle al remoto
// por los plugins cuesta ~1,7 s, y sin red se va al vencimiento del plazo, contra un presupuesto de
// 100 ms para un evento bloqueante— y este repartidor es lo unico que ya corre en cada turno, asi
// que leer un archivo no le cuesta arrancar un proceso. Un archivo por origen, para que el mismo
// trabajo reemplace su aviso en vez de acumular copias.
//
// No sabe de que trata el aviso: cualquier trabajo en segundo plano escribe ahi.
const DIR_AVISOS = path.join(repoRoot, '.claude', 'tmp', 'avisos');
function levantarAvisos() {
  let nombres = [];
  try { nombres = fs.readdirSync(DIR_AVISOS).filter(n => n.endsWith('.txt')).sort(); }
  catch (e) { return ''; }   // sin buzon no hay nada que entregar, y no es un error
  const textos = [];
  for (const n of nombres) {
    const ruta = path.join(DIR_AVISOS, n);
    try {
      const t = fs.readFileSync(ruta, 'utf8').trim();
      if (t) textos.push(t);
    } catch (e) { continue; }        // ilegible: se deja y se intenta en el turno siguiente
    // Se borra recien despues de leerlo: si el borrado falla, el aviso se repite — molesta, pero
    // no se pierde. Al reves se perderia sin que nadie se entere.
    try { fs.unlinkSync(ruta); } catch (e) { /* se repetira; no rompe el turno */ }
  }
  return textos.join('\n');
}

// -- Ejecutar: reenviar el stdout del hijo ---------------------------------
// Con UNA regla se reenvia tal cual, que es lo que el hijo produjo y ya es la respuesta del hook.
// Con VARIAS hay que combinar: escribir los JSON uno detras del otro deja dos objetos pegados, que
// no es JSON valido — el harness lo descarta y NO SE VE NADA, sin ninguna senal de que habia dos
// reglas. Se fusionan por `systemMessage`, que es el unico campo que este evento muestra. Lo que no
// venga como JSON con ese campo entra como texto, para que nada se pierda en silencio.
function ejecutarClase(momento, input) {
  const reglas = reglasDe(momento, 'ejecutar');
  if (!reglas.length) return { mensaje: '', extra: null };
  const salidas = [];
  for (const r of reglas) {
    const out = ejecutar(r, input);
    if (out && out.trim()) salidas.push(out.trim());
  }
  // Cada salida puede ser JSON con `systemMessage` (lo normal) o texto pelado. Se junta el mensaje
  // de todas y se conservan los demas campos que hayan emitido, para no comerse nada al fusionar.
  const mensajes = [];
  let extra = null;
  for (const s of salidas) {
    let o = null;
    try { o = JSON.parse(s); } catch (e) { /* no era JSON: entra como texto */ }
    if (o && typeof o === 'object') {
      if (typeof o.systemMessage === 'string' && o.systemMessage.trim()) mensajes.push(o.systemMessage.trim());
      const { systemMessage, ...resto } = o;
      if (Object.keys(resto).length) extra = Object.assign(extra || {}, resto);
    } else {
      mensajes.push(s);
    }
  }
  return { mensaje: mensajes.join('\n'), extra };
}

// -- bloquear: leer la respuesta del hijo -------------------------------
// Devuelve { deny: <motivo> } si alguna regla frena la accion, o { contexto: <texto> } con lo que
// haya que sumarle a las reglas `inyectar` del mismo momento. El deny gana: si la escritura no va a
// ocurrir, el recordatorio sobra (y Claude Code descarta el additionalContext en un deny).
function bloquear(momento, input) {
  const partes = [];
  for (const r of reglasDe(momento, 'bloquear')) {
    const out = ejecutar(r, input);
    if (!out || !out.trim()) continue;
    let hs = null;
    try { hs = JSON.parse(out).hookSpecificOutput; } catch (e) { continue; }
    if (!hs) continue;
    if (hs.permissionDecision === 'deny') return { deny: hs.permissionDecisionReason || 'bloqueado por una regla de conducta' };
    if (hs.additionalContext) partes.push(hs.additionalContext);
  }
  return { contexto: partes.join('\n\n') };
}

// Se drena stdin (contrato del hook) y se despacha segun el evento y la clase.
let input = '';
process.stdin.on('data', c => { input += c; });
process.stdin.on('end', () => {
  let data = {};
  try { data = JSON.parse(input || '{}'); } catch (e) { data = {}; }
  let momento = null;
  try { momento = momentoDe(data); } catch (e) { momento = null; }

  const ev = data.hook_event_name === 'PreToolUse' ? 'PreToolUse' : 'UserPromptSubmit';

  // clase `Bloquear`: si alguna frena, se emite el deny SOLO y no se sigue — si la escritura no va
  // a ocurrir, el resto sobra (y Claude Code descarta el additionalContext en un deny).
  let medido = { contexto: '' };
  try { medido = bloquear(momento, input); } catch (e) { medido = { contexto: '' } }
  if (medido.deny) {
    process.stdout.write(JSON.stringify({ hookSpecificOutput: {
      hookEventName: ev, permissionDecision: 'deny', permissionDecisionReason: medido.deny } }));
    return process.exit(0);
  }

  // Las tres clases CONVIVEN en un mismo momento y se emiten en una sola respuesta. Antes `Ejecutar`
  // se despachaba primero y CORTABA: una regla `Ejecutar` en un momento con reglas `Inyectar` las
  // apagaba a todas sin emitir ninguna senal, y el registro esta pensado para editarse sin tocar
  // este script. Se combinan por campos distintos, que es lo que las hace combinables: `Ejecutar` y
  // el Buzon de Avisos Generales escriben en `systemMessage` (lo ve el usuario); `Inyectar` y
  // `Bloquear`, en `additionalContext` (lo lee el modelo).
  let corrida = { mensaje: '', extra: null };
  try { corrida = ejecutarClase(momento, input); } catch (e) { corrida = { mensaje: '', extra: null }; }

  let ctx = '';
  try { ctx = construir(momento); } catch (e) { ctx = ''; }   // ante error, no romper el turno
  if (medido.contexto) ctx = ctx ? ctx + '\n' + medido.contexto : medido.contexto;

  // El buzon se levanta solo en `cada turno`: al arrancar, el trabajo en segundo plano recien sale.
  let aviso = '';
  if (momento === 'cada turno') { try { aviso = levantarAvisos(); } catch (e) { aviso = ''; } }

  const mensaje = [corrida.mensaje, aviso].filter(t => t && t.trim()).join('\n');
  const salida = Object.assign({}, corrida.extra || {});
  if (mensaje) salida.systemMessage = mensaje;
  // El aviso tambien va al modelo: el usuario decide, pero el agente tiene que poder responder si
  // le preguntan. Se emite con las reglas `Inyectar`, no en lugar de ellas.
  const contexto = [ctx, aviso].filter(t => t && t.trim()).join('\n');
  // PreToolUse: se OMITE permissionDecision a proposito (=> 'defer'): inyecta sin auto-aprobar.
  if (contexto) salida.hookSpecificOutput = { hookEventName: ev, additionalContext: contexto };
  if (Object.keys(salida).length) process.stdout.write(JSON.stringify(salida));
  process.exit(0);
});
process.stdin.on('error', () => process.exit(0));
