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

// El texto y el código que el repo escribe. El código entró con la decisión `Local-0052`: medido, un
// término vetado se escribió nueve veces en un `.js` y viajó a `base/` sin que ningún control lo
// tocara. Los `.json` quedan afuera a propósito — son datos, y los de configuración se editan con
// nombres que no son del dominio.
const ALCANZADOS = /\.(md|js|mjs|cjs|sh|ps1)$/i;

// El directorio de borradores: el repo lo gitignorea y es material descartable.
const BORRADORES = /(^|\/)tmp\//;

// Una ruta que el momento realiza. Se normalizan las barras invertidas de Windows antes de mirar.
function alcanzaAlEscribir(ruta) {
  const r = String(ruta || '').replace(/\\/g, '/');
  return ALCANZADOS.test(r) && !BORRADORES.test(r);
}

// Si es código y no texto, el control avisa en vez de frenar (decisión `Local-0052`).
function esCodigo(ruta) {
  return !/\.md$/i.test(String(ruta || ''));
}

module.exports = { ALCANZADOS, BORRADORES, alcanzaAlEscribir, esCodigo };
