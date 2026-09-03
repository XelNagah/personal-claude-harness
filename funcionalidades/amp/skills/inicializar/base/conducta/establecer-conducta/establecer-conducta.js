#!/usr/bin/env node
// Hook repartidor del subsistema conducta. Un mismo script sirve a varios eventos:
// lee el registro VIVO de reglas (../INDICE.md), resuelve que momento(s) realiza el evento que lo
// disparo (con su condicion, sin juicio), y despacha las reglas de ese momento segun su clase.
// Agregar/cambiar una regla NO toca este script: lee el registro en cada disparo.
//
// Eventos que realiza hoy (la realizacion del momento es agente-especifica):
//   - UserPromptSubmit         -> momento `cada turno`            (sin condicion)      [clase Inyectar]
//   - PreToolUse Write|Edit|apply_patch de un .md -> momento `al escribir` (condicion sin juicio)
//                                                   [clases Inyectar + Controlar, combinadas]
//   - SessionStart             -> momento `al arrancar la sesion` (sin condicion)     [clase Ejecutar]
//   - Stop                     -> momento `al cerrar tarea`       (sin condicion)     [clases Controlar + Inyectar]
// El vocabulario de momentos vive en ../MOMENTOS.md; aca vive COMO se realiza cada uno.
//
// `al cerrar tarea` es distinto a todos los demas y por eso tiene reglas propias mas abajo: ahi
// HABLAR CUESTA UNA VUELTA COMPLETA DEL MODELO. Un hook `Stop` no puede dejar una nota y que el turno
// igual cierre —`decision: block` con `reason` y `hookSpecificOutput.additionalContext` continuan las
// dos la conversacion—, asi que en ese momento CALLAR ES EL DEFAULT: el texto fijo de las reglas
// `Inyectar` sale solo si un control del mismo momento lo habilito. Sin eso el aviso saldria en cada
// cierre y el agente no podria terminar nunca, hasta el corte del CLI a las 8 continuaciones seguidas.
//
// Tres clases de despacho:
//   - Inyectar: arma un texto y lo emite como additionalContext (llega al modelo).
//   - Ejecutar: ejecuta la Herramienta cuya ruta es el Contenido de la regla y REENVIA su stdout
//               (ej. la Pantalla de bienvenida emite {systemMessage} en SessionStart: ese campo es
//               el unico que escribe en la terminal del usuario). Es para momentos donde la salida
//               del hijo ES la respuesta del hook; si hay varias reglas, se fusionan (ver abajo).
//   - Controlar: ejecuta el Control cuya ruta es el Contenido y LEE su respuesta. Si trae
//               permissionDecision 'deny', se emite ese deny solo (frena la accion; el
//               additionalContext se descartaria igual). Si trae additionalContext, se COMBINA
//               con el texto de las reglas `Inyectar` del mismo momento.
//
// Combinacion: en un mismo momento conviven reglas `Inyectar` (texto fijo, vive en el registro y lo
// actualiza el harness) y `Controlar` (datos medidos, los produce un Control). Se emiten juntas, una
// abajo de la otra. `Ejecutar` tambien se combina, pero por otro campo: sus salidas se fusionan en
// un unico `systemMessage`, porque dos JSON pegados no son JSON valido y el harness los descarta.
//
// Contrato de hook (conocimiento hooks-claude-code): stdin = JSON del harness; stdout = JSON.
//   UserPromptSubmit/PreToolUse: { hookSpecificOutput: { hookEventName, additionalContext } }
//     (PreToolUse sin permissionDecision => 'defer': inyecta y deja el flujo de permisos intacto,
//     verificado 2026-07-23; NO auto-aprueba. additionalContext llega junto al resultado de la tool.)
//   SessionStart: lo que emitan las Herramientas de la clase `Ejecutar` (ej. { systemMessage: <caja> }, visible al usuario).
//   Stop: mismo { hookSpecificOutput: { hookEventName, additionalContext } }, con la salvedad de que
//     emitir CONTINUA la conversacion. Si el harness manda `stop_hook_active`, se sale mudo sin
//     despachar nada — es la unica forma de que el turno cierre.
// Nunca rompe el turno: ante cualquier error o registro vacio, sale 0 sin emitir nada.
//
// Uso a mano (probar): echo {"hook_event_name":"SessionStart"} | node establecer-conducta.js
const fs = require('fs'), path = require('path');
const { spawnSync } = require('child_process');
const dirSub = path.resolve(__dirname, '..');
const repoRoot = path.resolve(__dirname, '..', '..', '..');   // .../conducta/establecer-conducta -> repo

// -- los Indices de reglas del subsistema --------------------------------
// Son los .md del subsistema que se declaran Indice en su frontmatter (uno por origen), con
// INDICE.md de respaldo para la forma vieja. El repartidor los lee a TODOS: quedarse con el del
// Agente Multiproposito dejaria sin entregar las reglas que el repo sumo, y sin ninguna senal.
const { leerFrontmatter, celdasDe, esSeparadora } = require('../../common/frontmatter.js');
const { indicesDe } = require('../../common/indices.js');
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
  if (ev === 'Stop') return 'al cerrar tarea';
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

// -- momentos donde hablar cuesta un turno completo ---------------------
// En estos momentos el harness NO deja emitir sin forzar otra respuesta del modelo, asi que el texto
// fijo de las reglas `Inyectar` NO sale solo: necesita que una regla `Controlar` del mismo momento
// —un programa que mide— lo habilite. El registro sigue siendo el dueno del texto y el usuario lo
// edita sin tocar codigo; lo que decide el control es CUANDO se dice, no QUE se dice.
// En los demas momentos las `Inyectar` salen siempre, como hasta ahora.
// La lista vive en UN solo archivo del subsistema, que tambien lee el `lint-conducta`: escrita dos
// veces, la que sume un momento primero deja a la otra sin marcarlo.
const { cuestaUnTurno } = require('../momentos-que-cuestan-un-turno.js');
// Eventos cuyo nombre se devuelve tal cual en `hookSpecificOutput.hookEventName`. Lo que no este aca
// cae a `UserPromptSubmit`, que es el comportamiento que habia antes de sumar `Stop`.
const EVENTOS_DE_SALIDA = new Set(['PreToolUse', 'UserPromptSubmit', 'Stop']);

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

// -- Contraste automático: filas de los registros que el turno toca ---
// (concepto del glosario: `Contraste automático`)
// El repartidor ya corre en `cada turno`; en vez de arrancar un programa aparte (48 ms por mensaje,
// medido y descartado) o esperar a que el modelo invoque una skill (los tres disparos automaticos
// dieron 0/3, ver el plan del disparo automatico), aca mismo se buscan las filas de los registros que
// el turno toca y se inyectan las pocas que pegan fuerte. El contraste con la sabiduria del repo
// ocurre porque el material esta en el contexto, sin que el modelo decida nada.
// No agrega clase a CLASES.md: es mecanica interna que escribe en `additionalContext`, como el Buzon.
//
// DOS CAMINOS con alcances distintos, porque tienen precisiones distintas (plan Local-0118):
//   - PUNTAJE, sobre el mensaje del usuario. Alcance: glosario, Terminologia Farlopa y decisiones —
//     los dos registros que no cargan siempre y que las skills de contraste ya leen—. Esta calibrado
//     para un mensaje de 16 palabras y NO se traslada a un documento entero: medido, con un handoff
//     pasan 124 de 166 filas y la primera es una que no viene al caso, o sea mide largo y no
//     relevancia.
//   - CITAS, exactas, sobre el mensaje Y sobre el material que el mensaje apunta. Alcance: los tres
//     anteriores mas planes. La Preferencia Base-0016 obliga a citar cada codigo con su tipo delante
//     y los documentos del repo la cumplen (un handoff cita 9 codigos), asi que extraerlas no adivina
//     nada. Planes entra porque su ruido era de la formula, no de la cita, y es justo lo que se lee
//     al retomar un trabajo. Conocimiento no entra en ninguno de los dos: su Indice ya carga siempre,
//     y traer una fila que ya esta en contexto gasta presupuesto sin agregar nada.
const REGISTROS_PUNTAJE = [
  { dir: 'semantica', archivo: 'GLOSARIO.md', tipo: 'término del glosario' },
  { dir: 'semantica', archivo: 'TERMINOLOGIA-FARLOPA.md', tipo: 'relación vetada (Terminología Farlopa)' },
  { dir: 'decisiones', archivo: 'INDICE.md', tipo: 'Decisión' },
];
const REGISTROS_CITAS = REGISTROS_PUNTAJE.concat([
  { dir: 'planes', archivo: 'PLANES.md', tipo: 'plan' },
]);

// Palabras vacias del castellano (gramaticales, no del dominio) mas los verbos de bajo peso que
// aparecen al plantear un tema. Se descartan para que no sumen puntaje: el corte es por funcion, no
// por dominio (un termino del dominio nunca se filtra aca).
const VACIAS = new Set(('a al ante bajo con contra de desde en entre hacia hasta para por segun sin so ' +
  'sobre tras el la los las lo un una unos unas y e o u ni que se su sus mi tu me te nos les le esto ' +
  'esta este estos estas ese esa eso como cuando donde cual cuales quien hay son ser es estan estar ' +
  'muy ya no si pero mas porque cada todo toda todos todas algo cuanto cuantos cuantas deberia ' +
  'deberian quiero hacer tiene tienen tener va van ir solo sola solos solas ocurre').split(/\s+/));

// Normaliza SIN acentos para tolerar que el usuario los omita —los omite seguido— al escribir su
// mensaje. Ojo: fusiona homografos (`termino` verbo con `término` sustantivo), lo que a veces suma
// una fila de baja relevancia detras de la correcta; el tope duro la contiene.
const RANGO_ACENTOS = [0x300, 0x36f];
const normalizar = s => Array.from(String(s == null ? '' : s).normalize('NFD'))
  .filter(ch => { const c = ch.codePointAt(0); return c < RANGO_ACENTOS[0] || c > RANGO_ACENTOS[1]; })
  .join('').toLowerCase();
const palabrasDe = s => normalizar(s).split(/[^a-z0-9]+/).filter(Boolean);
const esContenido = t => t.length >= 3 && !VACIAS.has(t);

// Todas las filas de entrada de los registros del contraste, cada una con su tipo para nombrarla.
// Reusa el descubrimiento de Indices de `common/indices.js` (misma copia que los ocho lints) en vez
// de reparsear tablas a mano; ubica las columnas por nombre de encabezado, nunca por posicion, para
// que renombrar o reordenar una columna no corra el contenido (conocimiento cambiar-la-forma-de-un-registro).
function filasDeContraste(registros) {
  const filas = [];
  const tipoDe = (dir, nombre) => {
    const r = registros.find(x => x.dir === dir && x.archivo === nombre);
    return r ? r.tipo : null;
  };
  const dirs = [...new Set(registros.map(r => r.dir))];
  for (const dir of dirs) {
    for (const idx of indicesDe(path.join(repoRoot, '.claude', dir))) {
      const tipo = tipoDe(dir, idx.nombre);
      if (!tipo) continue;
      const cab = idx.cabecera || [];
      const col = n => cab.findIndex(c => normalizar(c) === n);
      const iCod = col('codigo'), iNom = col('nombre'), iDes = col('descripcion'), iDet = col('detalle');
      if (iNom < 0 || iDes < 0) continue;
      for (const linea of idx.texto.split('\n')) {
        const celdas = celdasDe(linea);
        if (!celdas || esSeparadora(celdas)) continue;
        const codigo = iCod >= 0 ? (celdas[iCod] || '') : '';
        if (!/^(?:Base|Local)-\d{4}$/.test(codigo)) continue;   // solo filas de entrada
        const nombre = celdas[iNom] || '', descripcion = celdas[iDes] || '';
        if (!nombre || !descripcion) continue;
        // `registro` y `clave` identifican la fila entre registros: el mismo codigo existe en varios
        // (Local-0073 es una Decision Y un plan), asi que ni la cita ni la memoria pueden usar solo
        // el codigo.
        const registro = dir + '/' + idx.nombre;
        filas.push({ tipo, codigo, nombre, descripcion, registro, clave: registro + '#' + codigo,
          detalle: iDet >= 0 ? (celdas[iDet] || '') : '' });
      }
    }
  }
  return filas;
}

// Precision primero (acordado con el usuario, ver el plan): puntaje idf con el `Nombre` pesado mas
// que la `Descripcion`, umbral alto y tope duro bajo. Una palabra que aparece en el Nombre de muchas
// filas pesa poco (idf baja); una discriminante (`prioridad`, `capa`) pesa mucho. La mayoria de los
// turnos no supera el umbral y no inyecta nada. El umbral se calibra con el banco `pruebas.js`, que
// es gratis porque esto es determinista: no hace falta una sesion real para medir que fila elige.
const PESO_NOMBRE = 3, PESO_DESCRIPCION = 1, UMBRAL = 7.0, TOPE = 3;

// Devuelve las filas del alcance del PUNTAJE que superan el umbral, ordenadas. Sin topear: el tope
// se aplica una sola vez al final, ya mezclado con las citas y ya filtrado por la memoria.
// El idf se calcula SOLO sobre las filas del puntaje: sumar las de planes al corpus le correria el
// peso a cada palabra y descalibraria un umbral que se midio con un banco de 38 casos.
function porPuntaje(prompt, todas) {
  const mensaje = new Set(palabrasDe(prompt).filter(esContenido));
  if (!mensaje.size) return [];
  const alcance = new Set(REGISTROS_PUNTAJE.map(r => r.dir + '/' + r.archivo));
  const filas = todas.filter(f => alcance.has(f.registro));
  if (!filas.length) return [];

  // idf sobre el corpus (Nombre + Descripcion de cada fila): cuantas filas contienen la palabra.
  // Rara en el registro => mucho peso; comun => poco. El `+0.5` evita dividir por cero.
  const N = filas.length, df = Object.create(null);
  const conjuntos = filas.map(f => {
    const nom = new Set(palabrasDe(f.nombre).filter(esContenido));
    const des = new Set(palabrasDe(f.descripcion).filter(esContenido));
    for (const t of new Set([...nom, ...des])) df[t] = (df[t] || 0) + 1;
    return { nom, des };
  });
  const idf = t => Math.log(N / ((df[t] || 0) + 0.5));

  const candidatos = [];
  for (let i = 0; i < filas.length; i++) {
    const { nom, des } = conjuntos[i];
    let puntaje = 0;
    for (const t of mensaje) {
      if (nom.has(t)) puntaje += idf(t) * PESO_NOMBRE;
      else if (des.has(t)) puntaje += idf(t) * PESO_DESCRIPCION;
    }
    if (puntaje >= UMBRAL) candidatos.push({ fila: filas[i], puntaje });
  }
  candidatos.sort((a, b) => b.puntaje - a.puntaje || a.fila.codigo.localeCompare(b.fila.codigo));
  return candidatos.map(c => c.fila);
}

// -- citas: el codigo de una Entrada con su tipo delante ------------------
// Las palabras con que un documento nombra el tipo de una Entrada, mapeadas a su registro. Salen de
// la forma que impone la Preferencia Base-0016 —«el plan Local-NNNN», «la Decision Local-NNNN», «el
// glosario Local-NNNN»—. Sin una de estas palabras cerca, un codigo NO se toma como cita: eso es lo
// que separa la referencia del numero suelto, y lo que deja afuera a conocimiento y preferencias,
// cuyos Indices ya cargan siempre.
const PALABRA_DE_TIPO = {
  plan: 'planes/PLANES.md', planes: 'planes/PLANES.md',
  decision: 'decisiones/INDICE.md', decisiones: 'decisiones/INDICE.md',
  glosario: 'semantica/GLOSARIO.md', termino: 'semantica/GLOSARIO.md',
  farlopa: 'semantica/TERMINOLOGIA-FARLOPA.md', vetada: 'semantica/TERMINOLOGIA-FARLOPA.md',
  vetado: 'semantica/TERMINOLOGIA-FARLOPA.md', vetados: 'semantica/TERMINOLOGIA-FARLOPA.md',
};
// Tokens hacia atras donde se busca la palabra de tipo. Seis y no dos, para que una enumeracion
// —«las Decisiones Local-NNNN, Local-NNNN, Local-NNNN»— no pierda las citas de la segunda en
// adelante: el tipo esta escrito una sola vez, al principio.
const VENTANA_TIPO = 6;

// Extrae las citas de un texto. Devuelve un Map clave -> { clave, orden, veces }: el orden de
// aparicion y cuantas veces se la nombra. Un documento que insiste con una Entrada la trae primero.
function citasDe(texto) {
  const vistas = new Map();
  if (!texto) return vistas;
  const re = /(?:Base|Local)-\d{4}/g;
  let m;
  while ((m = re.exec(texto)) !== null) {
    const tokens = palabrasDe(texto.slice(Math.max(0, m.index - 160), m.index)).slice(-VENTANA_TIPO);
    let registro = null;
    for (let i = tokens.length - 1; i >= 0 && !registro; i--) registro = PALABRA_DE_TIPO[tokens[i]] || null;
    if (!registro) continue;
    const clave = registro + '#' + m[0];
    const ya = vistas.get(clave);
    if (ya) ya.veces++;
    else vistas.set(clave, { clave, orden: vistas.size, veces: 1 });
  }
  return vistas;
}

// -- el material que el mensaje apunta -----------------------------------
// Un pedido que apunta a un archivo lleva el contenido AFUERA del mensaje («leé este handoff y
// seguimos»): el comparador ve la frase que apunta, no lo apuntado, y el agente carga un documento
// entero sin que ninguna de sus palabras se haya comparado contra nada. Aca el hook sigue el puntero.
// Se descarto un momento nuevo `al leer` sobre PostToolUse/Read: cobraria ~50 ms en la operacion mas
// frecuente de la sesion.
const EXTENSIONES_APUNTABLES = /\.(?:md|txt|json|js)$/i;
const TOPE_ARCHIVOS = 3;               // un mensaje que apunta a mas, apunta a un directorio
const TOPE_BYTES = 200 * 1024;         // de un documento mas largo alcanzan las citas del principio
const TOKENS_ATRAS = 25;               // hasta donde se retrocede armando una ruta con espacios

// Resuelve una ruta contra el repo. Devuelve null si sale del repo: el hook no abre nada de afuera.
function resolverEnRepo(rel) {
  try {
    const norm = String(rel).replace(/\\/g, '/').trim();
    if (!norm || /^[a-z][a-z0-9+.-]*:\/\//i.test(norm)) return null;
    const abs = path.resolve(repoRoot, norm);
    if (abs !== repoRoot && !abs.startsWith(repoRoot + path.sep)) return null;
    return fs.statSync(abs).isFile() ? abs : null;
  } catch (e) { return null; }
}

// Los nombres de archivo de este repo TIENEN ESPACIOS («El Contraste automatico no lee…md»), asi que
// no se puede cortar la ruta por el espacio. Se ancla en la extension y se retrocede token a token
// probando cual existe: el sistema de archivos es el que valida, no una expresion regular que
// adivine donde empieza la ruta. Gana el candidato mas largo que exista.
function archivosApuntados(prompt) {
  const encontrados = [];
  for (const linea of String(prompt).split(/\r?\n/)) {
    const partes = linea.split(/(\s+)/);
    for (let i = 0; i < partes.length; i++) {
      const limpio = partes[i].replace(/[)\]}»"'`,.;:]+$/, '');
      if (!EXTENSIONES_APUNTABLES.test(limpio)) continue;
      let mejor = null;
      for (let j = i; j >= Math.max(0, i - TOKENS_ATRAS * 2); j--) {
        const cand = (partes.slice(j, i).join('') + limpio).replace(/^[(\[{«"'`]+/, '');
        const abs = resolverEnRepo(cand);
        if (abs) mejor = abs;
      }
      if (mejor && !encontrados.includes(mejor)) encontrados.push(mejor);
      if (encontrados.length >= TOPE_ARCHIVOS) return encontrados;
    }
  }
  return encontrados;
}

function leerApuntado(abs) {
  try {
    if (fs.statSync(abs).size <= TOPE_BYTES) return fs.readFileSync(abs, 'utf8');
    const fd = fs.openSync(abs, 'r');
    try {
      const b = Buffer.alloc(TOPE_BYTES);
      const n = fs.readSync(fd, b, 0, TOPE_BYTES, 0);
      return b.slice(0, n).toString('utf8');
    } finally { fs.closeSync(fd); }
  } catch (e) { return ''; }
}

// -- memoria de sesion ---------------------------------------------------
// El comparador solo miraba `data.prompt` y no guardaba nada entre turnos, asi que volvia a inyectar
// la misma fila cada vez que el tema se repetia: medido sobre las transcripciones reales de este
// repo, el 64% de lo entregado en una sesion eran repeticiones, con cinco Decisiones entrando cuatro
// veces cada una. El tope de 3 dolia porque dos de esas tres se gastaban repitiendo.
//
// Una fila entregada se calla mientras no pasen VENTANA turnos, y despues PUEDE VOLVER. No se calla
// para siempre: «ya se la traje» no es «la tiene» —en una conversacion larga el contexto se resume—,
// y el silencio permanente apagaria el mecanismo justo cuando vuelve a hacer falta, sin emitir
// ninguna senal (conocimiento Local-0013). Simulado sobre las 8 sesiones mas recientes, 131 filas:
// 20 turnos libera 34 de los 37 puntos posibles de presupuesto y sigue siendo una ventana real —40
// daba exactamente lo mismo que el silencio permanente, porque ninguna sesion del corpus llega a 40—.
//
// Molde y degradacion, los de `avisar-contexto-pesado`: si escribir la marca falla, la fila se repite
// en vez de perderse, o sea el comportamiento anterior. Sin `session_id` la memoria NO se aplica, por
// lo mismo: compartir una marca entre sesiones distintas callaria filas que nadie vio.
const VENTANA_MEMORIA = 20;
const DIR_MEMORIA = path.join(repoRoot, '.claude', 'tmp', 'contraste-automatico');
const archivoMemoria = sesion => path.join(DIR_MEMORIA, sesion + '.txt');

function leerMemoria(sesion) {
  const estado = { turno: 0, entregadas: new Map() };
  if (!sesion) return estado;
  try {
    for (const linea of fs.readFileSync(archivoMemoria(sesion), 'utf8').split(/\r?\n/)) {
      const t = /^turno=(\d+)$/.exec(linea);
      if (t) { estado.turno = Number(t[1]); continue; }
      const m = /^(\S+)\s+(\d+)$/.exec(linea);
      if (m) estado.entregadas.set(m[1], Number(m[2]));
    }
  } catch (e) { /* sin marca: es la primera vuelta de la sesion */ }
  return estado;
}

function escribirMemoria(sesion, estado) {
  if (!sesion) return;
  try {
    fs.mkdirSync(DIR_MEMORIA, { recursive: true });
    const lineas = ['turno=' + estado.turno];
    for (const [clave, turno] of estado.entregadas) {
      if (estado.turno - turno < VENTANA_MEMORIA) lineas.push(clave + ' ' + turno);
    }
    fs.writeFileSync(archivoMemoria(sesion), lineas.join('\n') + '\n');
  } catch (e) { /* la fila se repetira: molesta, no se pierde */ }
  // Limpieza de marcas viejas (mejor esfuerzo): tmp/ es descartable pero no se poda solo.
  try {
    const limite = Date.now() - 7 * 24 * 60 * 60 * 1000;
    for (const n of fs.readdirSync(DIR_MEMORIA)) {
      const p = path.join(DIR_MEMORIA, n);
      try { if (fs.statSync(p).mtimeMs < limite) fs.unlinkSync(p); } catch (e) { /* otra vez sera */ }
    }
  } catch (e) { /* sin limpieza no pasa nada */ }
}

function contrastar(data) {
  const prompt = data && typeof data.prompt === 'string' ? data.prompt : '';
  if (!prompt.trim()) return '';

  const sesion = String((data && data.session_id) || '').replace(/[^A-Za-z0-9_-]/g, '_');
  const memoria = leerMemoria(sesion);
  memoria.turno++;

  const filas = filasDeContraste(REGISTROS_CITAS);
  if (!filas.length) { escribirMemoria(sesion, memoria); return ''; }
  const porClave = new Map(filas.map(f => [f.clave, f]));

  const candidatos = [], yaEsta = new Set();
  const sumar = clave => {
    const f = porClave.get(clave);
    if (!f || yaEsta.has(clave)) return;
    yaEsta.add(clave); candidatos.push(f);
  };
  const ordenar = mapa => [...mapa.values()].sort((a, b) => b.veces - a.veces || a.orden - b.orden);

  // 1. CITAS, primero las del mensaje del usuario —es lo que esta pidiendo ahora— y despues las del
  //    material que apunta. Son exactas: no hay formula, ni umbral, ni nada que calibrar.
  for (const c of ordenar(citasDe(prompt))) sumar(c.clave);
  for (const abs of archivosApuntados(prompt)) for (const c of ordenar(citasDe(leerApuntado(abs)))) sumar(c.clave);

  // 2. PUNTAJE sobre el mensaje, donde esta calibrado. Va DETRAS de las citas: si las citas llenan el
  //    tope es porque el texto nombro esas Entradas, y eso no hay que adivinarlo.
  for (const f of porPuntaje(prompt, filas)) sumar(f.clave);

  // 3. MEMORIA y recien despues el tope, que es lo que hace que las 3 del turno sean 3 NUEVAS.
  const nuevas = candidatos.filter(f => {
    const t = memoria.entregadas.get(f.clave);
    return t === undefined || (memoria.turno - t) >= VENTANA_MEMORIA;
  }).slice(0, TOPE);

  for (const f of nuevas) memoria.entregadas.set(f.clave, memoria.turno);
  escribirMemoria(sesion, memoria);
  if (!nuevas.length) return '';

  const lineas = nuevas.map(fila => {
    const det = fila.detalle && fila.detalle !== '—' ? ` Detalle: ${fila.detalle}` : '';
    return `- ${fila.tipo} ${fila.codigo} (${fila.nombre}): ${fila.descripcion}${det}`;
  });
  return 'Contraste con la sabiduría del repo — lo que estás mirando toca estos registros ' +
    '(candidatos para contrastar tu respuesta, no veredictos):\n' + lineas.join('\n');
}

// -- ejecutar la Herramienta de una regla y devolver su stdout ----------
// El Contenido es la ruta del script relativa a .claude/ (con sus flags), ej.
// `conducta/mostrar-pantalla-bienvenida/mostrar-pantalla-bienvenida.js --hook`.
function ejecutar(regla, input) {
  // spawnSync SIN shell —no `execSync`, que en Windows pasa por cmd.exe y abre una ventana que
  // parpadea en cada turno— y con `windowsHide` por si el hijo abriera consola. El Contenido es
  // `ruta/script.js --flags`: el primer token es la ruta del script bajo .claude/, el resto son
  // argumentos. Las rutas del repo no llevan espacios, asi que partir por espacios es seguro.
  const partes = regla.contenido.trim().split(/\s+/);
  const script = path.join(repoRoot, '.claude', partes[0]);
  try {
    const r = spawnSync(process.execPath, [script, ...partes.slice(1)],
      { cwd: repoRoot, input, encoding: 'utf8', timeout: 20000, windowsHide: true });
    if (r.error || r.status !== 0) return '';   // igual que el `catch` viejo: solo se usa el exito
    return r.stdout || '';
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

// -- controlar: leer la respuesta del hijo -----------------------------
// Devuelve { deny: <motivo> } si alguna regla frena la accion, o { contexto: <texto> } con lo que
// haya que sumarle a las reglas `inyectar` del mismo momento. El deny gana: si la escritura no va a
// ocurrir, el recordatorio sobra (y Claude Code descarta el additionalContext en un deny).
function controlar(momento, input) {
  const partes = [];
  for (const r of reglasDe(momento, 'controlar')) {
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

  // GUARDA CONTRA EL BUCLE, obligatoria en `Stop`: si el turno actual ya lo continuo un hook, el
  // harness manda `stop_hook_active` y hay que salir MUDO. Sin esto, cada continuacion vuelve a
  // disparar el evento y el agente no puede cerrar hasta el corte del CLI a las 8 seguidas. Va antes
  // de despachar nada para que ni siquiera se arranquen los programas de las reglas `Controlar`.
  // El control del momento la repite por su cuenta; que este en los dos lados es a proposito.
  if (data.stop_hook_active) return process.exit(0);

  const ev = EVENTOS_DE_SALIDA.has(data.hook_event_name) ? data.hook_event_name : 'UserPromptSubmit';

  // clase `Controlar`: si alguna frena, se emite el deny SOLO y no se sigue — si la escritura no va
  // a ocurrir, el resto sobra (y Claude Code descarta el additionalContext en un deny).
  let medido = { contexto: '' };
  try { medido = controlar(momento, input); } catch (e) { medido = { contexto: '' } }
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
  // `Controlar`, en `additionalContext` (lo lee el modelo).
  let corrida = { mensaje: '', extra: null };
  try { corrida = ejecutarClase(momento, input); } catch (e) { corrida = { mensaje: '', extra: null }; }

  // En un momento que cuesta un turno, el texto fijo NO sale solo: lo habilita el control que midio.
  // Si ninguna regla `Controlar` del momento aporto contexto, el hook se calla y el turno cierra.
  let ctx = '';
  if (!cuestaUnTurno(momento) || medido.contexto) {
    try { ctx = construir(momento); } catch (e) { ctx = ''; }   // ante error, no romper el turno
  }
  if (medido.contexto) ctx = ctx ? ctx + '\n' + medido.contexto : medido.contexto;

  // El contraste con la sabiduria del repo solo tiene sentido cuando hay un mensaje del usuario, o
  // sea en `cada turno` (UserPromptSubmit trae `data.prompt`). Se combina con las reglas `Inyectar`.
  let contraste = '';
  if (momento === 'cada turno') { try { contraste = contrastar(data); } catch (e) { contraste = ''; } }
  if (contraste) ctx = ctx ? ctx + '\n' + contraste : contraste;

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
