// Qué archivos realiza el momento `al escribir`, en una sola definición.
//
// La comparten los dos Componentes de Subsistema que la necesitan: el hook repartidor
// `establecer-conducta`, que decide si el evento realiza el momento, y el control
// `detectar-terminologia-vetada`, que decide qué hacer con lo escrito. Escrito dos veces, el día que
// una lista sume una extensión y la otra no, el repartidor dispara y el control se calla — o al
// revés, y el control no llega a correr. Las dos formas dan un archivo sin revisar y ninguna emite
// señal, que es el modo de falla que el subsistema existe para no tener.
//
// No vive en `.claude/common/`: ahí va el código que comparten DOS O MÁS SUBSISTEMAS (decisión
// `Local-0049`), y los dos consumidores de esto son del mismo. Viaja con `conducta`, por el Patrón.

const fs = require('fs');
const path = require('path');

// El texto y el código que el repo escribe. El código entró con la decisión `Local-0052`: medido, un
// término vetado se escribió nueve veces en un `.js` y viajó a `base/` sin que ningún control lo
// tocara. Los `.json` quedan afuera a propósito — son datos, y los de configuración se editan con
// nombres que no son del dominio.
const ALCANZADOS = /\.(md|js|mjs|cjs|sh|ps1)$/i;

// El directorio de borradores: el repo lo gitignorea y es material descartable.
//
// SE MIDE CONTRA LA RAÍZ DEL REPO AL QUE PERTENECE EL ARCHIVO, no contra la ruta entera. Mirando la
// ruta entera, cualquier `tmp` intermedio apagaba el control: los worktrees caían en
// `.claude/tmp/worktrees/<nombre>/`, así que TODO archivo escrito adentro de un worktree quedaba
// exento y el control no revisaba nada — el agente que trabaja en una copia escribía sin ningún
// freno. Medido el 08/09/2026: el mismo contenido con el mismo término vetado se rechaza en
// `<repo>/nota.md` y pasa sin una palabra en `<repo>/.claude/tmp/worktrees/plan-0067/nota.md`. Es la
// forma «su excepción abarca todo el repo» del conocimiento `controles-que-no-avisan`: el control
// quedaba encendido, corría y contestaba que sí.
const BORRADORES = /(^|\/)tmp\//;

// La raíz del repo al que pertenece un archivo: el primer ancestro que tenga `.git`. En un worktree
// `.git` es un ARCHIVO y no una carpeta, así que se mira que exista, no de qué tipo es. Si no
// encuentra ninguna, devuelve null y la exención vuelve a medirse sobre la ruta entera.
function raizDelRepo(rutaAbsoluta) {
  let dir = path.dirname(rutaAbsoluta);
  for (let i = 0; i < 60; i++) {
    try { if (fs.existsSync(path.join(dir, '.git'))) return dir; } catch { return null; }
    const padre = path.dirname(dir);
    if (padre === dir) return null;
    dir = padre;
  }
  return null;
}

// Si la ruta cae en el directorio de borradores DE SU PROPIO REPO. Un worktree es un repo: su
// `.claude/tmp/` es descartable igual, pero el resto de su árbol es trabajo real y se revisa.
function esBorrador(rutaNormalizada) {
  if (path.isAbsolute(rutaNormalizada)) {
    const raiz = raizDelRepo(rutaNormalizada);
    if (raiz) {
      const rel = path.relative(raiz, rutaNormalizada).replace(/\\/g, '/');
      // Fuera del repo encontrado (`..`): se mide la ruta entera, como antes.
      if (!rel.startsWith('..')) return BORRADORES.test('/' + rel);
    }
  }
  return BORRADORES.test(rutaNormalizada);
}

// Una ruta que el momento realiza. Se normalizan las barras invertidas de Windows antes de mirar.
function alcanzaAlEscribir(ruta) {
  const r = String(ruta || '').replace(/\\/g, '/');
  return ALCANZADOS.test(r) && !esBorrador(r);
}

// Si es código y no texto, el control avisa en vez de frenar (decisión `Local-0052`).
function esCodigo(ruta) {
  return !/\.md$/i.test(String(ruta || ''));
}

module.exports = { ALCANZADOS, BORRADORES, alcanzaAlEscribir, esCodigo, esBorrador, raizDelRepo };
