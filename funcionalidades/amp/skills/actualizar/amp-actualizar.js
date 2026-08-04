#!/usr/bin/env node
// amp-actualizar.js — motor mecanico del nivelador del harness (decision 0028).
// Barre el .claude/ del repo actual (process.cwd()), clasifica cada archivo y carpeta contra la estructura
// objetivo del harness y emite el plan/reporte. Ademas hace el respaldo. La parte de JUICIO
// (confirmar el plan, migrar terminos, preguntar ante lo divergente, escribir el contenido Base
// usando amp:inicializar solo para ausencias) vive en el SKILL; aca vive solo lo determinista (dec. 0009).
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
// Los renombres puramente estructurales viven aca. Memoria -> subsistemas NO es un renombre:
// requiere clasificar el Aprendizaje de a un Componente de Subsistema por vez y por eso se reporta como migracion guiada.
const RENOMBRES = [
  { viejo: 'glosario', nuevo: 'semantica', que: 'subsistema', lintViejo: 'lint-glosario', lintNuevo: 'lint-semantica' },
];

// Encabezados renombrados: mismo criterio que RENOMBRES pero adentro de un archivo. Los tres
// indices separados por origen estrenaron nombres nuevos; un Agente Desplegado que todavia tenga
// los viejos se migra renombrando el encabezado y CONSERVANDO el contenido de cada seccion — es
// renombre, no reemplazo. En preferencias el encabezado viejo ademas llevaba adentro un numero de
// version: ese numero se descarta, la version vive en el plugin y el Agente Desplegado no guarda
// ninguna. El lint de cada subsistema acepta las dos formas mientras dure la migracion.
const ENCABEZADOS_RENOMBRADOS = [
  { archivo: 'preferencias/PREFERENCIAS.md', viejo: /^##\s+Base\b[^\n]*$/mi,                  nuevo: '## Preferencias del Agente Multipropósito' },
  { archivo: 'preferencias/PREFERENCIAS.md', viejo: /^##\s+Adaptaciones\b[^\n]*$/mi,          nuevo: '## Preferencias del Agente Desplegado' },
  { archivo: 'conducta/INDICE.md',           viejo: /^##\s+Reglas Base\b[^\n]*$/mi,           nuevo: '## Reglas del Agente Multipropósito' },
  { archivo: 'conducta/INDICE.md',           viejo: /^##\s+Reglas del Prop[oó]sito\b[^\n]*$/mi, nuevo: '## Reglas del Agente Desplegado' },
  { archivo: 'herramientas/INDICE.md',       viejo: /^##\s+Herramientas Base\b[^\n]*$/mi,     nuevo: '## Herramientas del Agente Multipropósito' },
  { archivo: 'herramientas/INDICE.md',       viejo: /^##\s+Herramientas del Prop[oó]sito\b[^\n]*$/mi, nuevo: '## Herramientas del Agente Desplegado' },
];

// Indices de Subsistema por subsistema Base: los archivos que listan sus entradas. Cada uno se
// declara a si mismo en un frontmatter minimo (indice, origen, columnas), y ES ESE `origen` —no el
// nombre del archivo— lo que decide el trato del nivelador: `agente-multiproposito` se reemplaza
// entero, `agente-desplegado` no se abre. Deducirlo de la posicion de una seccion obligaba a entrar
// al archivo del repo para pisar media parte; con un archivo por origen se pisa uno y listo.
const INDICES_BASE = {
  subsistemas: ['SUBSISTEMAS.md'],
  preferencias: ['PREFERENCIAS.md'],
  planes: ['PLANES.md'],
  conocimiento: ['INDICE.md'],
  semantica: ['GLOSARIO.md', 'TERMINOLOGIA-FARLOPA.md'],
  decisiones: ['INDICE.md'],
  herramientas: ['INDICE.md'],
  conducta: ['INDICE.md'],
};

// Los subsistemas que ALGUNA VEZ tuvieron los dos origenes adentro de un mismo archivo. Un Agente
// Desplegado que todavia lo tenga asi se migra PARTIENDOLO: el frontmatter en los dos y el contenido
// de cada seccion conservado.
//
// Esta lista es solo para esa migracion, y por eso no estan todos los pares partidos por origen que
// existen hoy: `planes` (ESTADOS.md/ESTADOS-LOCAL.md) y el par MOMENTOS.md/MOMENTOS-LOCAL.md de
// `conducta` nacieron ya separados, asi que no hay nada que partir. Lo que si les hace falta —que la
// ausencia del archivo del Agente Desplegado se reporte— NO sale de aca: sale de `chequearContenido`,
// que recorre el arbol de `base/`. Meterlos aca para conseguirlo tendria ademas un efecto no
// buscado: [1d] les exigiria el nucleo `Codigo | Nombre | Descripcion | Detalle`, que ninguno de los
// dos tiene ni debe tener.
const INDICES_PARTIDOS = [
  { sub: 'subsistemas',  amp: 'SUBSISTEMAS.md', local: 'SUBSISTEMAS-LOCAL.md', seccionLocal: /^##\s+Subsistemas del (?:Agente Desplegado|Prop[oó]sito)\b/mi },
  { sub: 'preferencias', amp: 'PREFERENCIAS.md', local: 'PREFERENCIAS-LOCAL.md', seccionLocal: /^##\s+(?:Preferencias del Agente Desplegado|Adaptaciones)\b/mi },
  { sub: 'conducta',     amp: 'INDICE.md',      local: 'INDICE-LOCAL.md',      seccionLocal: /^##\s+Reglas del (?:Agente Desplegado|Prop[oó]sito)\b/mi },
  { sub: 'herramientas', amp: 'INDICE.md',      local: 'INDICE-LOCAL.md',      seccionLocal: /^##\s+Herramientas del (?:Agente Desplegado|Prop[oó]sito)\b/mi },
  // `conocimiento` entra por otro camino que los cuatro de arriba: no tenia dos secciones sino UNA,
  // y toda del Agente Desplegado —el Agente Multiproposito no aportaba ninguna pagina—. Al ganar su
  // Indice Base, `INDICE.md` pasa a viajar como mecanismo y se pisa entero: sin este renombre, el
  // hallazgo que ve quien aplica es "instalar el que viaja", sin ninguna senal de que ahi adentro
  // estan las paginas del repo. El `\s*$` es lo que separa la forma vieja (`## Paginas`, la que hay
  // que migrar) de la nueva (`## Paginas del Agente Multiproposito`): sin el, un repo ya migrado
  // reportaria una particion pendiente en cada corrida, para siempre y sin nada que hacer.
  { sub: 'conocimiento', amp: 'INDICE.md',      local: 'INDICE-LOCAL.md',      seccionLocal: /^##\s+P[áa]ginas\s*$/mi },
];

// El modulo comun de lectura de frontmatter. Se lo trae de la carpeta `base/` que este mismo plugin
// lleva al lado —la que instala en el destino—, y NO del `.claude/` del repo que se esta nivelando:
// ese es justo el que puede no tenerlo todavia, o tenerlo en la version vieja. Es la misma ruta
// relativa con la que este script ya resuelve BASE, asi que existe siempre que exista el plugin.
const { declaraIndice: declaraIndiceEn, cabeceraTabla, origenDe } = require('../inicializar/base/common/frontmatter.js');
const declaraIndice = archivo => declaraIndiceEn(leer(archivo));

// Nucleo de columnas que comparten todos los Indices de Subsistema. Cada uno suma ademas las
// columnas operativas que su codigo consume (`Momento`, `Tipo`, `Estado`…), que no se chequean acá.
const NUCLEO_INDICE = ['Código', 'Nombre', 'Descripción', 'Detalle'];

// Estas ocho entradas eran Base distribuida por la generación memoria/. Sus destinos ya forman
// parte de la Base actual, así que actualizar las reconcilia sin preguntarle al usuario. Cualquier
// otro .md es Aprendizaje; si uno de estos Componentes de Subsistema fue ampliado por el repo, la skill preserva solo
// esa adición y pide decisión sobre ella, no sobre el bloque Base.
const MEMORIAS_BASE_RETIRADAS = new Set([
  'feedback_flujo_planes.md',
  'feedback_archivo_de_estado.md',
  'feedback_estilo_commits.md',
  'feedback_base_conocimiento.md',
  'feedback_semantica.md',
  'feedback_decisiones.md',
  'feedback_herramientas.md',
  'feedback_conducta.md',
]);

// Subsistemas del Agente Multiproposito esperados por el harness al dia (carpetas bajo .claude/).
const SUBSISTEMAS = ['subsistemas', 'preferencias', 'planes', 'conocimiento', 'semantica', 'decisiones', 'herramientas', 'conducta'];

// Herramientas que el harness manda (origen Base) y que todo repo al dia deberia tener bajo
// .claude/herramientas/<nombre>/<nombre>.js. No confundir con las del Proposito, que las suma
// cada repo y el nivelador nunca toca.
// Toda Herramienta que viaje en `base/herramientas/` va aca. Faltar en esta lista no es "no se
// avisa": el INDICE.md Base se reemplaza entero y trae la fila, asi que la Herramienta queda
// declarada y sin carpeta, y `lint-herramientas` sale con FILAS COLGADAS. El nivelado termina
// "aplicado" habiendo roto un control que estaba verde.
const HERRAMIENTAS_BASE = ['actualizar-plugins', 'instalar-plugins-codex'];

// -- contenido Base: comparar el archivo instalado contra el que viaja ------
// Chequear que el Componente de Subsistema EXISTA no alcanza: un consumidor que ya tiene el script en su version vieja
// se lo queda para siempre y nunca recibe una mejora. La fuente es la carpeta `base/` de
// `amp:inicializar`, que viaja en el mismo plugin que este script — por eso se resuelve desde
// __dirname y no desde el repo: lo que viaja es del Producto, el repo es el destino.
const BASE = path.resolve(__dirname, '..', 'inicializar', 'base');
const normalizar = s => s.replace(/\r\n/g, '\n').trimEnd();

// El origen que cada archivo declara en su frontmatter decide cuanto se compara. No hay lista
// escrita aca: la habia —once scripts con un ancla cada uno— y su defecto era estructural, porque
// un Componente que nadie agregaba a la lista no se buscaba y no aparecia. El arbol es la lista.
// Encabezado = todo lo anterior a la primera fila de datos. De ahi para abajo estan las entradas
// que puebla cada repo, que no se comparan ni se tocan.
//
// El separador queda ADENTRO (`i + 1`) a proposito: es el que declara cuantas columnas tiene la
// tabla, asi que pertenece a la convencion y no a las filas. Dejarlo afuera haria que al pisar el
// encabezado sobreviviera el separador viejo, y la tabla quedaria con una cabecera nueva y un
// separador de otra forma. Que este adentro es tambien lo que obliga al chequeo de columnas de
// `chequearContenido`: si el repo le sumo una columna propia, este bloque difiere y pisarlo dejaria
// sus filas bajo una cabecera que no las describe.
function hastaLaTabla(txt) {
  const ls = normalizar(txt).split('\n');
  const i = ls.findIndex(l => /^\s*\|[\s:|-]+\|\s*$/.test(l));
  return i === -1 ? null : ls.slice(0, i + 1).join('\n');
}
// La mitad del encabezado que NO es la tabla: la convencion, la gobernanza, el texto. Comparar el
// bloque entero como una sola cadena no alcanza, porque una columna que el repo sumo cambia la linea
// de columnas Y el separador — y sumarla es un derecho del Agente Desplegado. Sin partirlo, un
// registro extendido difiere para siempre y ese repo no vuelve a informarse al dia nunca mas.
function textoDeLaConvencion(bloque) {
  const ls = (bloque || '').split('\n');
  const i = ls.findIndex(l => l.trim().startsWith('|'));
  return (i === -1 ? ls : ls.slice(0, i)).join('\n').trimEnd();
}
function listarBase(rel, out) {
  const dir = path.join(BASE, rel || '.');
  if (!existe(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const r = rel ? rel + '/' + e.name : e.name;
    if (e.isDirectory()) listarBase(r, out); else out.push(r);
  }
  return out;
}

function chequearContenido(add) {
  if (!existe(BASE)) {
    // Callarse deja el repo informado "al dia" sin haberlo mirado, que es justo el modo de falla
    // que este chequeo viene a cerrar.
    add('divergente', '?', 'base/', 'no se pudo comparar: no llego la carpeta de Componentes del plugin (revisar a mano)');
    return;
  }
  for (const rel of listarBase('', [])) {
    if (/(^|\/)pruebas\.js$/.test(rel)) continue;   // banco de pruebas: se instala, no se nivela
    const destino = path.join(claude, rel);
    if (!existe(destino)) {
      // La ausencia NO siempre la reporta otro chequeo: los de arriba nombran a mano el MANIFIESTO,
      // el lint, el README y las Herramientas de rio arriba, asi que un Componente que viaja y que
      // nadie sumo a esas listas —`planes/ESTADOS-LOCAL.md`, `conducta/MOMENTOS-LOCAL.md`,
      // `preferencias/estilo-commits.md`— se saltaba en silencio y el repo se informaba al dia sin
      // haberlo recibido nunca. El arbol es la lista, tambien para lo ausente.
      //
      // La unica condicion es que nadie se haya hecho cargo antes. Se probo tambien exigir que la
      // carpeta contenedora existiera —para que un subsistema entero ausente no saliera una vez por
      // archivo—, y sobra: el hallazgo de la carpeta ya cubre a sus hijos. Peor que sobrar, ante una
      // carpeta nueva que viaje sin chequeo propio devolveria silencio, que es exactamente el
      // defecto que este chequeo cierra. Varias lineas se leen; ninguna, no.
      if (!yaCubierto(rel))
        add('base', '+', rel, 'Componente de Subsistema ausente: instalar el que viaja en la Base');
      continue;
    }
    const queViaja = leer(path.join(BASE, rel));
    const instalado = leer(destino);
    if (rel.endsWith('.md') && origenDe(queViaja) === 'agente-desplegado') {
      const a = hastaLaTabla(queViaja), b = hastaLaTabla(instalado);
      if (a === null || b === null) { add('divergente', '?', rel, 'declara origen agente-desplegado y no se le encontro la tabla (revisar a mano)'); continue; }
      if (a === b) continue;
      // Antes de proponer pisar el encabezado hay que mirar QUE difiere. Un Agente Desplegado puede
      // sumarle columnas propias a su registro, asi que difieren por dos motivos distintos y cada
      // uno pide otra cosa.
      const delRepo = cabeceraTabla(instalado) || [], deLaBase = cabeceraTabla(queViaja) || [];
      const propias = delRepo.filter(c => !deLaBase.includes(c));
      if (!propias.length) {
        add('base', '~', rel, 'encabezado viejo: la convencion instalada difiere de la del Agente Multiproposito (sus entradas no se tocan)');
        continue;
      }
      // El repo extendio la tabla. Si eso es lo UNICO que difiere —el texto de la convencion es el
      // mismo y las columnas de la Base siguen estando, en su orden— no hay nada que nivelar y hay
      // que callarse: marcarlo dejaria a ese repo con un hallazgo bloqueante en cada corrida, para
      // siempre, sin nada que hacer al respecto.
      if (textoDeLaConvencion(a) === textoDeLaConvencion(b) && deLaBase.every((c, i) => delRepo[i] === c))
        continue;
      // Queda algo mas que la columna: o la convencion tambien cambio, o las columnas de la Base ya
      // no estan donde estaban. Pisar el bloque le dejaria las filas bajo una cabecera con menos
      // columnas de las que tienen —registro corrupto, y clasificado como un cambio de convencion
      // cualquiera—, y fusionar a ciegas duplicaria la columna si lo que paso fue un renombre.
      //
      // El mensaje no afirma cual de las dos cosas es, porque el detector no puede saberlo: que el
      // repo sume `Sinonimos` y que la Base renombre `Alias` a otra cosa dejan exactamente la misma
      // evidencia. Lo decide el usuario, que si conoce la historia de su repo.
      add('divergente', '?', rel, `columna(s) fuera de la convencion de la Base (${propias.join(', ')}): las sumo el repo, o la Base renombro las suyas — pisar el encabezado dejaria sus ${contarFilasTabla(instalado)} fila(s) bajo una cabecera que no las describe`);
      continue;
    }
    if (normalizar(instalado) !== normalizar(queViaja))
      add('base', '~', rel, 'contenido viejo: la version instalada difiere de la del Agente Multiproposito');
  }
}

// Campos minimos de un MANIFIESTO (mismo criterio que lint-harness): titulo, Disparador, Skills,
// declaracion de carga del indice, comando de lint del propio subsistema.
function manifiestoCompleto(txt, sub) {
  if (!/^#\s+\S/m.test(txt)) return false;
  if (!/Disparador/.test(txt)) return false;
  if (!/\*\*Skills\b/.test(txt)) return false;
  if (!/(NO\s+)?se carga[n]? siempre/i.test(txt)) return false;
  if (!/^\*\*[IÍ]ndices?:\*\*/m.test(txt)) return false;   // lista sus Indices con el origen de cada uno
  if (!new RegExp('node \\.claude/' + sub + '/lint-' + sub + '/').test(txt)) return false;
  return true;
}

// -- clasificacion ------------------------------------------------------
// Cada hallazgo: { grupo: 'base'|'renombre'|'divergente'|'ok', marca, item, detalle }
const hallazgos = [];
const add = (grupo, marca, item, detalle) => hallazgos.push({ grupo, marca, item, detalle: detalle || '' });
// ¿Algun hallazgo anterior ya se hace cargo de esta ruta? El chequeo de ausencia del arbol corre
// ultimo, y sin esto un subsistema entero ausente se reportaria una vez por archivo — veinte lineas
// diciendo lo mismo que la primera, que es como una senal real se pierde entre las que no lo son.
// Cubre tanto la ruta exacta como la carpeta que la contiene (`planes/lint-planes/`).
const yaCubierto = rel => hallazgos.some(h =>
  rel === h.item || rel.startsWith(h.item.endsWith('/') ? h.item : h.item + '/'));

function clasificar() {
  if (!esDir(claude)) {
    add('divergente', '?', '.claude/', 'no existe: este repo no tiene el Agente Multiproposito instalado (usar amp:inicializar, no el nivelador)');
    return;
  }

  // Memoria fue retirada. Su presencia nunca puede terminar en "Repo al dia": primero se instala
  // la Base nueva y despues la skill coordina reubicar-aprendizaje, con confirmacion del usuario
  // para cada Componente de Subsistema aprendido. El detector no intenta clasificar contenido: solo impide el falso verde.
  const memoriaLegacy = path.join(claude, 'memoria');
  if (esDir(memoriaLegacy)) {
    const componentes = fs.readdirSync(memoriaLegacy, { withFileTypes: true })
      .filter(e => e.isFile() && e.name.endsWith('.md') && !['MEMORIA.md', 'MANIFIESTO.md', 'README.md'].includes(e.name))
      .map(e => e.name);
    const baseConocida = componentes.filter(nombre => MEMORIAS_BASE_RETIRADAS.has(nombre)).length;
    const aprendizaje = componentes.length - baseConocida;
    add(
      'divergente',
      '!',
      'memoria/ → subsistemas/',
      `migracion pendiente: retirar automaticamente ${baseConocida} Componente(s) de Subsistema conocido(s) del Agente Multiproposito y decidir solo sobre ${aprendizaje} de Aprendizaje antes de informar que el repo esta al dia`
    );
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

  // [1b] encabezados renombrados (el archivo esta, la seccion se llama como antes)
  for (const e of ENCABEZADOS_RENOMBRADOS) {
    const f = path.join(claude, e.archivo);
    if (!existe(f)) continue;
    const m = leer(f).match(e.viejo);
    if (m) add('renombre', '→', `${e.archivo}: ${m[0].trim()}`, `renombrar el encabezado a "${e.nuevo}" conservando el contenido de la seccion`);
  }

  // [1c] Indices sin declarar y partición por origen pendiente
  for (const [sub, archivos] of Object.entries(INDICES_BASE)) {
    if (!esDir(path.join(claude, sub))) continue;     // subsistema ausente: ya se reporta abajo
    for (const nombre of archivos) {
      const f = path.join(claude, sub, nombre);
      if (existe(f) && !declaraIndice(f))
        add('renombre', '→', `${sub}/${nombre}`, 'sin frontmatter de Indice: declarar `indice`, `origen` y `columnas` (el origen deja de deducirse del nombre)');
    }
  }
  for (const p of INDICES_PARTIDOS) {
    const dir = path.join(claude, p.sub);
    if (!esDir(dir)) continue;
    const fAmp = path.join(dir, p.amp), fLocal = path.join(dir, p.local);
    if (existe(fAmp) && p.seccionLocal.test(leer(fAmp)))
      add('renombre', '→', `${p.sub}/${p.amp} → ${p.local}`, `partir por origen: mover la seccion del Agente Desplegado a ${p.local} CONSERVANDO su contenido; el archivo que queda es el del Agente Multiproposito`);
    else if (!existe(fLocal) && existe(fAmp))
      add('base', '+', `${p.sub}/${p.local}`, 'Indice del Agente Desplegado ausente: nace declarado y sin filas (el manifiesto instalado lo nombra)');
  }

  // [1d] Indices que todavia no tienen el nucleo de columnas. Un Indice puede estar declarado y
  // partido por origen y aun asi conservar la forma vieja de su tabla (`| Plan | Estado | …`,
  // `| Concepto | Definicion | …`). Sin esta deteccion el nivelador informa "al dia" un Agente
  // Desplegado cuyo registro no tiene Codigo ni Descripcion: el frontmatter esta, la tabla no.
  for (const [sub, archivos] of Object.entries(INDICES_BASE)) {
    const dir = path.join(claude, sub);
    if (!esDir(dir)) continue;
    const locales = INDICES_PARTIDOS.filter(p => p.sub === sub).map(p => p.local);
    for (const nombre of [...archivos, ...locales]) {
      const f = path.join(dir, nombre);
      if (!existe(f)) continue;
      const cab = cabeceraTabla(leer(f));
      if (!cab) { add('renombre', '→', `${sub}/${nombre}`, 'sin tabla: pasar a tabla con el nucleo `Codigo | Nombre | Descripcion | Detalle` conservando cada entrada'); continue; }
      const faltan = NUCLEO_INDICE.filter(c => !cab.includes(c));
      if (faltan.length)
        add('renombre', '→', `${sub}/${nombre}`, `tabla sin el nucleo del Indice: falta ${faltan.join(', ')} — migrar conservando cada entrada (el Codigo se asigna al pasar y no se reusa)`);
    }
  }

  // [1e] La seccion propia de preferencias en el punto de entrada. Dejo de existir cuando
  // preferencias entro al Patron: hoy sus Indices llegan por su MANIFIESTO, como los otros siete.
  // Si la seccion sobrevive, el Agente Desplegado importa los mismos archivos dos veces.
  for (const nombre of ['AGENTS.md', 'CLAUDE.md']) {
    const f = path.join(repo, nombre);
    if (existe(f) && /^##\s+Preferencias\s*$/m.test(leer(f)))
      add('renombre', '→', nombre, 'seccion `## Preferencias` propia: borrarla — preferencias entra por su MANIFIESTO como los demas subsistemas');
  }

  // [2] subsistemas Base: presentes / ausentes / con Componentes de Subsistema faltantes
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
    // README del subsistema: la convencion completa, que el MANIFIESTO no lleva porque va siempre
    // cargado. `preferencias` fue el ultimo en tenerlo y un Agente Desplegado viejo no lo tiene.
    if (!existe(path.join(dir, 'README.md'))) add('base', '+', `${sub}/README.md`, 'ausente: instalar la convencion completa del subsistema');
  }

  // [2b] Herramientas de rio arriba: viven DENTRO de herramientas/, asi que un subsistema presente puede
  // igual estar incompleto. Sin este chequeo, un repo al que le falta una Herramienta de rio arriba se
  // informa "ya estaba" — que es lo que pasa cuando se clasifica por subsistema y no por Componente de Subsistema.
  const dirHerr = path.join(claude, 'herramientas');
  if (esDir(dirHerr)) {
    for (const h of HERRAMIENTAS_BASE) {
      if (!existe(path.join(dirHerr, h, `${h}.js`))) add('base', '+', `herramientas/${h}/`, 'Herramienta de rio arriba ausente: instalar con su README y su fila en el INDICE');
      else if (!existe(path.join(dirHerr, h, 'README.md'))) add('base', '~', `herramientas/${h}/README.md`, 'ausente: instalar');
    }
    const indiceHerr = path.join(dirHerr, 'INDICE.md');
    if (existe(indiceHerr)) {
      const t = leer(indiceHerr);
      for (const h of HERRAMIENTAS_BASE) {
        if (!t.includes(h)) add('base', '~', `herramientas/INDICE.md`, `sin fila para la Herramienta de rio arriba ${h}: agregar en la seccion de Herramientas del Agente Multiproposito`);
      }
    }
  }

  // [3] conducta: Componentes de Subsistema propios + corte Base/Proposito + la Pantalla de bienvenida
  const cond = path.join(claude, 'conducta');
  if (esDir(cond)) {
    for (const componente of [['MOMENTOS.md', 'archivo'], ['CLASES.md', 'registro de clases de accion (lo lee el lint)'],
                         ['establecer-conducta', 'hook'], ['lint-conducta', 'lint'],
                         ['mostrar-pantalla-bienvenida', 'Herramienta de la Pantalla de bienvenida'],
                         ['detectar-terminologia-vetada', 'control de terminologia del momento «al escribir»']]) {
      if (!existe(path.join(cond, componente[0]))) add('base', '~', `conducta/${componente[0]}`, `${componente[1]} ausente: instalar`);
    }
    // El momento "al arrancar la sesion" es lo que dispara la Pantalla; sin el, la regla no se entrega.
    const momentos = path.join(cond, 'MOMENTOS.md');
    if (existe(momentos) && !/al arrancar la sesi[oó]n/i.test(leer(momentos)))
      add('base', '~', 'conducta/MOMENTOS.md', 'sin el momento «al arrancar la sesion» (SessionStart): agregar la fila');

    const indice = path.join(cond, 'INDICE.md');
    if (existe(indice)) {
      const t = leer(indice);
      // Acepta las tres formas: el corte por origen puede estar entre dos archivos (la forma al
      // dia), o entre dos secciones de este —con los encabezados nuevos o con los viejos, que
      // [1b] migra—. Lo que no puede pasar es que haya reglas y ningun corte.
      const tieneCorte = existe(path.join(cond, 'INDICE-LOCAL.md'))
                      || (/##\s+Reglas (Base|del Agente Multiprop[oó]sito)/i.test(t)
                          && /##\s+Reglas del (Prop[oó]sito|Agente Desplegado)/i.test(t));
      const tieneReglas = /\|\s*inyectar\s*\||\|\s*correr\s*\||\|\s*bloquear\s*\|/i.test(t);
      if (!tieneCorte && tieneReglas)
        add('divergente', '?', 'conducta/INDICE.md', 'reglas sin corte por origen: repartir requiere decidir cuales vienen de rio arriba y cuales son del Agente Desplegado');
      else if (!tieneCorte)
        add('base', '~', 'conducta/INDICE.md', 'sin las dos secciones de reglas por origen: poner al dia');
      if (!/mostrar-pantalla-bienvenida/.test(t))
        add('base', '~', 'conducta/INDICE.md', 'sin la regla de rio arriba que muestra la Pantalla de bienvenida al arrancar: agregar la fila');
      if (!/detectar-terminologia-vetada/.test(t))
        add('base', '~', 'conducta/INDICE.md', 'sin la regla de rio arriba que frena la terminologia vetada al escribir: agregar la fila');
    }
    // La condicion del momento «al escribir» se amplio a todo .md del repo (antes solo `.claude/`):
    // un MOMENTOS.md con la condicion vieja deja sin cubrir lo que el repo publica.
    if (existe(momentos) && /`file_path` es `\.md` bajo `\.claude\//.test(leer(momentos)))
      add('base', '~', 'conducta/MOMENTOS.md', 'el momento «al escribir» todavia se limita a `.claude/`: ampliar a todo .md del repo salvo tmp/');
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
  // Registro doble: el mismo repartidor se cablea en Codex. Los tres eventos valen alla tambien
  // (toda edicion pasa por apply_patch, que matchea como Edit/Write).
  const hooksCodex = path.join(repo, '.codex', 'hooks.json');
  const cableadoCodex = revisarHook(hooksCodex);
  if (!cableadoCodex.ups || !cableadoCodex.pre || !cableadoCodex.ses) {
    const faltan = [!cableadoCodex.ses && 'SessionStart', !cableadoCodex.ups && 'UserPromptSubmit', !cableadoCodex.pre && 'PreToolUse Write|Edit'].filter(Boolean).join(' + ');
    add('base', '~', '.codex/hooks.json', `hook establecer-conducta sin cablear en Codex (${faltan}): agregar por merge`);
  }

  // [5] contenido de los scripts Base ya instalados: existir no es estar al dia.
  chequearContenido(add);
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
  const EXCL = new Set(['.respaldo-amp', 'node_modules', '.git', 'tmp']);
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
