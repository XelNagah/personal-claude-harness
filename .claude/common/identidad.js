// Lectura de la Identidad de un Agente: el Título y el Propósito que declara su `.claude/identidad.md`.
// Módulo común porque lo leen dos mecanismos que no se conocen entre sí —la Pantalla de bienvenida,
// que la muestra al arrancar, y `comunicacion/buscar/`, que la lee de OTROS repos para presentar los
// candidatos a Agente Multipropósito Conocido—. Dos copias del mismo parseo divergen sin señal: la
// que se quedó vieja sigue devolviendo un título, solo que el equivocado (conocimiento Base-0001).
//
// Sin Propósito definido el repo todavía NO es un Agente con Propósito: es el Agente Multipropósito
// a secas, esperando el Propósito que lo hace nacer. Por eso la falta devuelve el centinela `SIN`
// en vez de una cadena vacía — quien la lea tiene que poder distinguir "no lo declara" de "lo
// declara vacío", y decidir si eso se informa o se pide.
//
// Node pelado, sin dependencias externas.

const fs = require('fs');
const path = require('path');

// Lo que devuelve un campo que el archivo no declara. Es texto y no `null` a propósito: los dos
// consumidores lo muestran, así que un centinela imprimible evita que cada uno invente el suyo.
const SIN = '<sin definir>';

// El Título es el H1 del archivo; el Propósito, la línea que arranca con `Propósito:` (tolerante a
// las marcas de énfasis y de cita, y al acento faltante). Se busca en TODO el archivo, no en las
// primeras líneas: `identidad.md` es de escritura humana y nadie garantiza el orden.
//
// Las marcas se saltean a los DOS lados de los dos puntos. La copia incrustada solo las salteaba
// antes, así que la forma más común en Markdown —`**Propósito:** …`, con el cierre después de los
// dos puntos— devolvía el Propósito con `**` pegado adelante. Este repo escribe la línea llana, así
// que nadie lo vio; el buscador abre el `identidad.md` de repos escritos por otras manos.
function leerIdentidad(dirRepo) {
  const archivo = path.join(dirRepo, '.claude', 'identidad.md');
  let txt;
  try { txt = fs.readFileSync(archivo, 'utf8'); } catch (e) { return { titulo: SIN, proposito: SIN }; }
  if (!txt.trim()) return { titulo: SIN, proposito: SIN };
  const titulo = (txt.match(/^#\s+(.+)$/m) || [])[1] || SIN;
  const proposito = (txt.match(/^[*_\s>]*Prop[óo]sito[*_\s]*:[*_\s]*(.+)$/mi) || [])[1] || SIN;
  return { titulo: titulo.trim(), proposito: proposito.trim() };
}

module.exports = { SIN, leerIdentidad };
