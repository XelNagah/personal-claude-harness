'use strict';

/**
 * worktrees.js — lo que comparten `preparar-worktree` y `limpiar-worktree`.
 *
 * Vive acá y no adentro de una de las dos Herramientas porque las necesitan las dos y no se invoca
 * por comando. Node nativo, sin dependencias.
 *
 * Lo que este módulo NO hace: crear ni borrar worktrees. Calcula, lista, compara y verifica; el que
 * arma y el que borra son las Herramientas, y cada una dice en su nombre cuál es.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

/** Límite de ruta de Windows. Una ruta más larga falla al abrir el archivo, no al crearlo. */
const LIMITE_RUTA_WINDOWS = 260;

/** Dónde van los worktrees por omisión, relativo a la raíz del repo. */
const DESTINO_POR_OMISION = path.join('.claude', 'tmp', 'worktrees');

/** Lo que nunca se copia al worktree: el material de trabajo y los respaldos del actualizador. */
const NO_SE_COPIA = new Set(['tmp', '.respaldo-amp']);

// ---------------------------------------------------------------------------- git

function git(rutaRepo, args) {
  return execFileSync('git', args, {
    cwd: rutaRepo,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });
}

/**
 * La raíz del repo que contiene `ruta`, o null si no hay ninguno.
 * Se toma del directorio que se pasa, nunca de `__dirname`: un script que se describe a sí mismo
 * describe el repo equivocado apenas hay una segunda copia.
 */
function raizDelRepo(ruta) {
  try {
    return path.resolve(git(ruta, ['rev-parse', '--show-toplevel']).trim());
  } catch {
    return null;
  }
}

/**
 * Los worktrees registrados en git, el principal incluido.
 * Devuelve `[{ ruta, head, rama, principal, huerfano }]`; `huerfano` es el que git todavía registra
 * y en disco ya no está — lo que deja un borrado sin `prune`.
 */
function listarWorktrees(rutaRepo) {
  let salida;
  try {
    salida = git(rutaRepo, ['worktree', 'list', '--porcelain']);
  } catch {
    return [];
  }

  const lista = [];
  let actual = null;

  for (const linea of salida.split(/\r?\n/)) {
    if (linea.startsWith('worktree ')) {
      if (actual) lista.push(actual);
      actual = { ruta: path.resolve(linea.slice('worktree '.length)), head: null, rama: null };
    } else if (!actual) {
      continue;
    } else if (linea.startsWith('HEAD ')) {
      actual.head = linea.slice('HEAD '.length);
    } else if (linea.startsWith('branch ')) {
      actual.rama = linea.slice('branch '.length).replace(/^refs\/heads\//, '');
    } else if (linea === 'detached') {
      actual.rama = null;
    }
  }
  if (actual) lista.push(actual);

  return lista.map((w, i) => ({
    ...w,
    principal: i === 0,
    huerfano: !fs.existsSync(w.ruta),
  }));
}

// ---------------------------------------------------------------- margen de ruta

/** La ruta relativa más larga que hay versionada en el repo. Es la que decide si el worktree entra. */
function rutaVersionadaMasLarga(rutaRepo) {
  let archivos;
  try {
    archivos = git(rutaRepo, ['ls-files']).split(/\r?\n/).filter(Boolean);
  } catch {
    return { ruta: '', largo: 0 };
  }
  let mayor = '';
  for (const a of archivos) if (a.length > mayor.length) mayor = a;
  return { ruta: mayor, largo: mayor.length };
}

/**
 * Dónde va a caer el worktree `nombre`, y por qué.
 *
 * La regla acordada: `.claude/tmp/worktrees/` por omisión, y una raíz corta solo cuando
 * la ruta no entra en el límite de Windows. El rodeo queda como excepción medida y **dicha**, no
 * como criterio suelto.
 */
function calcularUbicacion(rutaRepo, nombre, opciones = {}) {
  const raizCorta = opciones.raizCorta || null;
  const masLarga = opciones.rutaMasLarga || rutaVersionadaMasLarga(rutaRepo);

  const preferida = path.join(rutaRepo, DESTINO_POR_OMISION, nombre);
  // +1 por el separador entre el directorio del worktree y la ruta relativa de adentro.
  const totalPreferida = preferida.length + 1 + masLarga.largo;

  if (totalPreferida <= LIMITE_RUTA_WINDOWS) {
    return {
      ruta: preferida,
      cae: false,
      total: totalPreferida,
      limite: LIMITE_RUTA_WINDOWS,
      rutaMasLarga: masLarga,
      motivo: null,
    };
  }

  if (!raizCorta) {
    return {
      ruta: null,
      cae: true,
      total: totalPreferida,
      limite: LIMITE_RUTA_WINDOWS,
      rutaMasLarga: masLarga,
      motivo:
        `la ruta daría ${totalPreferida} de ${LIMITE_RUTA_WINDOWS} caracteres ` +
        `(${preferida.length} de destino + ${masLarga.largo} de la ruta interna más larga, ` +
        `\`${masLarga.ruta}\`) y no se indicó una raíz corta`,
    };
  }

  const alternativa = path.resolve(raizCorta, nombre);
  const totalAlternativa = alternativa.length + 1 + masLarga.largo;
  return {
    ruta: alternativa,
    cae: true,
    total: totalAlternativa,
    limite: LIMITE_RUTA_WINDOWS,
    rutaMasLarga: masLarga,
    motivo:
      `en \`${DESTINO_POR_OMISION}\` la ruta daría ${totalPreferida} de ${LIMITE_RUTA_WINDOWS} ` +
      `caracteres (la ruta interna más larga es \`${masLarga.ruta}\`, de ${masLarga.largo}); ` +
      `en la raíz corta da ${totalAlternativa}`,
    noEntraTampoco: totalAlternativa > LIMITE_RUTA_WINDOWS,
  };
}

// -------------------------------------------------------------- recorrer `.claude/`

/**
 * Inventario de `.claude/`: ruta relativa → tamaño, para cada archivo.
 *
 * No sigue enlaces (`lstat`): un junction adentro se anota como enlace y no se atraviesa. Es la
 * misma prudencia que hace inocente al borrado recursivo de Node, y acá evita contar dos veces —o
 * contar el repo entero— cuando alguien dejó un enlace de una corrida anterior.
 */
function inventariarClaude(rutaRepo, opciones = {}) {
  const excluir = opciones.excluir || NO_SE_COPIA;
  const raiz = path.join(rutaRepo, '.claude');
  const archivos = new Map();
  const enlaces = [];

  if (!fs.existsSync(raiz)) return { archivos, enlaces, total: 0, bytes: 0 };

  const recorrer = (dir, relativo) => {
    let entradas;
    try {
      entradas = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entradas) {
      const rel = relativo ? path.join(relativo, e.name) : e.name;
      if (!relativo && excluir.has(e.name)) continue;
      const completa = path.join(dir, e.name);
      let st;
      try {
        st = fs.lstatSync(completa);
      } catch {
        continue;
      }
      if (st.isSymbolicLink()) {
        enlaces.push(rel);
        continue;
      }
      if (st.isDirectory()) recorrer(completa, rel);
      else archivos.set(rel, st.size);
    }
  };

  recorrer(raiz, '');
  let bytes = 0;
  for (const s of archivos.values()) bytes += s;
  return { archivos, enlaces, total: archivos.size, bytes };
}

/**
 * De una lista de rutas relativas a `.claude/`, cuáles ignora git.
 *
 * Una sola invocación para todas: `check-ignore` contesta por lote y sale con 1 cuando ninguna está
 * ignorada, que no es un error. Si git no puede contestar —no hay repo, no hay git—, la respuesta
 * segura es «ninguna»: de ahí sale que no se copie nada, y un worktree sin copiar se nota enseguida,
 * mientras que copiar de más se lleva el trabajo a medias sin que nadie lo vea.
 */
function archivosIgnorados(rutaRepo, relativas) {
  if (!relativas.length) return new Set();
  const entrada = relativas.map(r => path.join('.claude', r).replace(/\\/g, '/')).join('\n');
  let salida = '';
  try {
    salida = execFileSync('git', ['check-ignore', '--stdin'], {
      cwd: rutaRepo, input: entrada, encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'], windowsHide: true,
    });
  } catch (e) {
    salida = String(e.stdout || '');
  }
  const set = new Set();
  for (const linea of salida.split(/\r?\n/)) {
    if (!linea.trim()) continue;
    set.add(path.normalize(linea.trim().replace(/^\.claude[\\/]/, '')));
  }
  return set;
}

/**
 * Qué tiene el `.claude/` del repo que el worktree necesita y git no le puede llevar.
 *
 * **Lo ignorado por git, y solo eso.** Es lo que git no puede llevar por más commits que se hagan:
 * con `.claude/` versionado son los pocos ignorados de adentro —y el que importa es
 * `settings.local.json`, donde vive `enabledPlugins` porque no se commitea, sin el cual el
 * worktree arranca sin ningún plugin y sin señal—; con `.claude/` gitignoreado es el árbol entero.
 * Misma operación, otro tamaño.
 *
 * Lo que está **sin commitear pero no ignorado** NO se copia, aunque git tampoco lo haya llevado:
 * el worktree se arma desde un commit justamente para no arrastrar el trabajo a medias del repo
 *. Copiarlo además hacía que la limpieza lo leyera como escrito adentro y frenara
 * siempre — verificado en este repo con seis archivos nuevos sin commitear.
 */
function faltantesEnWorktree(rutaRepo, rutaWorktree) {
  const origen = inventariarClaude(rutaRepo);
  const destino = inventariarClaude(rutaWorktree);
  const ignorados = archivosIgnorados(rutaRepo, [...origen.archivos.keys()]);
  const faltan = [];
  let bytes = 0;
  for (const rel of ignorados) {
    if (destino.archivos.has(rel)) continue;
    if (!origen.archivos.has(rel)) continue;
    faltan.push(rel);
    bytes += origen.archivos.get(rel);
  }
  faltan.sort();
  return { faltan, bytes, origen, destino, ignorados };
}

/** Copia al worktree la lista de rutas relativas a `.claude/`. Devuelve las copiadas y las que fallaron. */
function copiarFaltantes(rutaRepo, rutaWorktree, faltan) {
  const copiados = [];
  const fallados = [];
  for (const rel of faltan) {
    const desde = path.join(rutaRepo, '.claude', rel);
    const hasta = path.join(rutaWorktree, '.claude', rel);
    try {
      fs.mkdirSync(path.dirname(hasta), { recursive: true });
      fs.copyFileSync(desde, hasta);
      copiados.push(rel);
    } catch (e) {
      fallados.push({ ruta: rel, error: e.message });
    }
  }
  return { copiados, fallados };
}

/**
 * Qué se escribió en el `.claude/` del worktree que se pierde al borrarlo.
 *
 * Se mira antes de borrar. El motivo no es la copia sino la reserva de códigos, que todavía no
 * existe: dos worktrees que registran una entrada a la vez eligen los dos `máximo + 1`, y git
 * mergea las dos filas sin conflicto porque son dos líneas distintas al final de la misma tabla.
 *
 * Son dos preguntas distintas y cada una se le hace a quien sabe contestarla:
 *
 * - **Lo versionado se lo pregunta a git** (`status`), nunca comparando bytes contra el repo. Con
 *   `core.autocrlf` prendido —el valor por omisión en Windows— el checkout del worktree convierte
 *   los fines de línea, así que una comparación byte a byte marca como escrito CADA archivo
 *   versionado. Medido en el banco: los 4 casos del enlace fallaban por eso, y la limpieza frenaba
 *   siempre. Un control que marca todo entrena a ignorarlo.
 * - **Lo no versionado se compara byte a byte**, que es lo que la propia Herramienta copió con
 *   `copyFileSync` sin que git lo tocara — `settings.local.json` entre ellos. Es además el único
 *   camino que queda cuando `.claude/` entero está gitignoreado y git no sabe nada de nada.
 */
function escriturasEnClaude(rutaRepo, rutaWorktree) {
  const nuevos = new Set();
  const cambiados = new Set();

  // (a) lo versionado, según git
  let versionados = new Set();
  try {
    const lista = git(rutaWorktree, ['ls-files', '--', '.claude']).split(/\r?\n/).filter(Boolean);
    versionados = new Set(lista.map(r => path.normalize(r.replace(/^\.claude[\\/]/, ''))));
    const estado = git(rutaWorktree, ['status', '--porcelain', '--untracked-files=all', '--', '.claude']);
    for (const linea of estado.split(/\r?\n/)) {
      if (!linea.trim()) continue;
      const marca = linea.slice(0, 2);
      const ruta = linea.slice(3).replace(/^"|"$/g, '');
      const rel = path.normalize(ruta.replace(/^\.claude[\\/]/, ''));
      if (rel.split(path.sep)[0] === 'tmp') continue;
      if (marca.includes('?')) nuevos.add(rel);
      else cambiados.add(rel);
    }
  } catch {
    /* sin git utilizable queda solo la comparación de abajo, que es la que importa */
  }

  // (b) lo no versionado, byte a byte contra el repo
  const origen = inventariarClaude(rutaRepo);
  const destino = inventariarClaude(rutaWorktree);
  for (const [rel, size] of destino.archivos) {
    if (versionados.has(rel)) continue;
    if (!origen.archivos.has(rel)) {
      nuevos.add(rel);
      continue;
    }
    if (origen.archivos.get(rel) !== size) {
      cambiados.add(rel);
      continue;
    }
    try {
      const a = fs.readFileSync(path.join(rutaRepo, '.claude', rel));
      const b = fs.readFileSync(path.join(rutaWorktree, '.claude', rel));
      if (!a.equals(b)) cambiados.add(rel);
    } catch {
      cambiados.add(rel);
    }
  }

  // Un archivo que git ve sin rastrear y que además difiere del original entra por los dos caminos:
  // se cuenta una sola vez, y como nuevo, que es lo que el usuario tiene que decidir si guarda.
  for (const rel of nuevos) cambiados.delete(rel);
  const orden = s => [...s].sort();
  return { nuevos: orden(nuevos), cambiados: orden(cambiados), hay: nuevos.size + cambiados.size > 0 };
}

// ------------------------------------------------------------------- verificación

/**
 * Enlaces (junctions y symlinks) que haya adentro de un árbol.
 *
 * Una instalación que venía armando worktrees a mano puede tener uno, y es el caso que causó el
 * daño: `git worktree remove` lo atraviesa y vacía el destino real. Se informa siempre, aunque el
 * borrado recursivo de Node no lo atraviese: el estado sucio se ve, no se supone.
 */
function enlacesEn(ruta, opciones = {}) {
  const tope = opciones.tope || 5000;
  const hallados = [];
  if (!fs.existsSync(ruta)) return hallados;

  const recorrer = (dir, relativo, restante) => {
    if (restante.n <= 0) return;
    let entradas;
    try {
      entradas = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entradas) {
      if (restante.n-- <= 0) return;
      const completa = path.join(dir, e.name);
      const rel = relativo ? path.join(relativo, e.name) : e.name;
      let st;
      try {
        st = fs.lstatSync(completa);
      } catch {
        continue;
      }
      if (st.isSymbolicLink()) {
        let destino = null;
        try {
          destino = fs.readlinkSync(completa);
        } catch {
          /* un junction roto no tiene destino legible */
        }
        hallados.push({ ruta: rel, destino });
        continue; // no se atraviesa: del otro lado está lo que no hay que tocar
      }
      if (st.isDirectory()) recorrer(completa, rel, restante);
    }
  };

  recorrer(ruta, '', { n: tope });
  return hallados;
}

/**
 * Después de borrar: ¿desapareció el árbol, y quedó intacto el `.claude/` del repo?
 *
 * La verificación la hace la Herramienta, no un subagente: comparar dos listados y mirar
 * `git status` no es un recorrido de volumen. Un fallo de borrado es estado
 * sucio a revisar, nunca un no-evento — allá el daño se descubrió siete minutos tarde porque un
 * `Permission denied` se leyó como «no borró nada».
 */
function verificarBorrado(rutaRepo, rutaWorktree, inventarioPrevio) {
  const hallazgos = [];

  if (fs.existsSync(rutaWorktree)) {
    const resto = enlacesEn(rutaWorktree).length;
    hallazgos.push({
      clase: 'arbol-sobreviviente',
      texto:
        `el árbol \`${rutaWorktree}\` sigue en disco` +
        (resto ? ` y tiene ${resto} enlace(s) adentro` : ''),
    });
  }

  const ahora = inventariarClaude(rutaRepo);
  const perdidos = [];
  for (const rel of inventarioPrevio.archivos.keys()) {
    if (!ahora.archivos.has(rel)) perdidos.push(rel);
  }
  if (perdidos.length) {
    perdidos.sort();
    hallazgos.push({
      clase: 'claude-danado',
      texto: `faltan ${perdidos.length} archivo(s) en el \`.claude/\` del repo`,
      rutas: perdidos.slice(0, 20),
    });
  }

  let registrado = false;
  for (const w of listarWorktrees(rutaRepo)) {
    if (path.resolve(w.ruta) === path.resolve(rutaWorktree)) registrado = true;
  }
  if (registrado) {
    hallazgos.push({
      clase: 'registro-sucio',
      texto: 'git todavía registra el worktree: falta correr `git worktree prune`',
    });
  }

  return { limpio: hallazgos.length === 0, hallazgos, archivosAhora: ahora.total, perdidos };
}

module.exports = {
  LIMITE_RUTA_WINDOWS,
  DESTINO_POR_OMISION,
  NO_SE_COPIA,
  raizDelRepo,
  listarWorktrees,
  rutaVersionadaMasLarga,
  calcularUbicacion,
  inventariarClaude,
  archivosIgnorados,
  faltantesEnWorktree,
  copiarFaltantes,
  escriturasEnClaude,
  enlacesEn,
  verificarBorrado,
};
