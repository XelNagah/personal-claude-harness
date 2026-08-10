#!/usr/bin/env node
// Mide el texto que un repo carga en CADA arranque de sesion y lo compara contra un tope.
//
// Por que es una Herramienta de ESTE repo y no algo que viaje: el tope lo fija el Agente
// Multiproposito y decidir si sube es potestad de aca. Un Agente Desplegado no puede moverlo —el
// actualizador le repone cualquier archivo que edite—, asi que informarselo seria darle un numero
// sobre el que no puede actuar. Lo unico que si esta en sus manos, bajar su propio contexto, no
// necesita esta Herramienta para hacerse.
//
// Que mide: lo que entra al contexto sin que nadie lo pida. Arranca por `CLAUDE.md` y `AGENTS.md`
// y sigue las lineas `@ruta`, que son imports. Los registros que se consultan a demanda no cuentan,
// justamente porque no se cargan.
//
// QUE MIDE EL TOPE: solo lo que aporta el Agente Multiproposito. Lo que el repo aprendio
// persiguiendo su Proposito se informa como dato, sin veredicto. Son dos cosas que se mueven
// distinto: la primera la acota el diseño de aca, la segunda crece con el Proposito y su umbral es
// indeterminado desde el rol de quien publica. Con el tope sobre el total, el aviso se encendia por
// lo que este repo aprendio y mandaba a recortarlo, que es justo lo que no hay que recortar por un
// tope de diseño.
//
// De donde sale el tope: se fijo el 30/07/2026 midiendo lo que habia ese dia —43,9 KB en 17
// archivos— y dejando unos 4 KB de margen. Subio a 52 KB el 01/08/2026, con el mismo criterio.
// Bajo a 35 KB el 10/08/2026 al pasar a medir solo el Agente Multiproposito: 31,0 medidos mas ~4 KB
// de margen, que alcanza para un subsistema nuevo completo —su manifiesto mas su Indice, del orden
// de 3 a 4 KB— y avisa al segundo.
// No sale de un limite del modelo ni de ningun calculo: es
// una disciplina auto-impuesta. Lo que aporta el control es QUE HAYA UN NUMERO, no
// cual sea: el contexto siempre cargado no lo vigila nadie y crece de a poco —cada Indice liviano
// que se suma no pesa nada por si solo—, y el modelo de carga por manifiesto se adopto para bajarlo.
// Sin un numero a la vista ese ahorro se vuelve a consumir sin que se note.
//
// Pasar el tope no es una alarma que haya que apagar: es el momento de decidir a mano entre subirlo
// —porque el Agente Multiproposito legitimamente crecio— o recortar. El primer lugar donde mirar
// son las celdas de `Descripcion` de los Indices cargados, que son de una linea por convencion y
// tienden a crecer a parrafo: el desarrollo va en la pagina, y lo que sale de la celda deja de
// estar cargado.
//
// Reporta y no falla (sale 0 siempre): describe el estado del repo, y pasar el tope es informacion,
// no error. Conocimiento `controles-que-no-avisan`.
//
// Uso: node .claude/herramientas/medir-contexto/medir-contexto.js [--hook] [rutaRepo]
//   --hook   una linea, en el formato que consume el repartidor de conducta: {"systemMessage": …}.
//            Sin el flag, el informe completo con el desglose por archivo.
const fs = require('fs'), path = require('path');
const { basesDeInstalacion } = require('../../common/bases-de-instalacion.js');

const TOPE = 35 * 1024;
// El encabezado del bloque que `amp:inicializar` escribe en el punto de entrada. Es lo unico del
// Agente Multiproposito que no viaja como archivo —se fusiona adentro del que el repo ya tenia—,
// asi que sin esto quedaria fuera del numero controlado, y es la parte que crece cada vez que se
// suma un subsistema.
const CABLEADO = '## Subsistemas';

const args = process.argv.slice(2);
const modoHook = args.includes('--hook');
// El repo sale del argumento o del directorio de trabajo, NUNCA de __dirname: en cuanto existe una
// segunda copia de este archivo, deducirlo de su ubicacion describe el repo equivocado y no falla,
// contesta. Conocimiento `el-repo-que-un-script-describe`.
const repo = path.resolve(args.find(a => !a.startsWith('--')) || process.cwd());

// Devuelve [{rel, bytes}] en el orden en que se cargan, sin repetir.
function cargados(raiz) {
  const vistos = new Set(), out = [];
  const sumar = f => {
    const abs = path.resolve(f);
    if (vistos.has(abs) || !fs.existsSync(abs)) return;
    vistos.add(abs);
    let txt; try { txt = fs.readFileSync(abs, 'utf8'); } catch { return; }
    out.push({ rel: path.relative(raiz, abs).replace(/\\/g, '/'), bytes: Buffer.byteLength(txt), txt });
    for (const m of txt.matchAll(/^@(\S+)\s*$/gm)) {
      const hit = [path.join(raiz, m[1]), path.join(path.dirname(abs), m[1])].find(c => fs.existsSync(c));
      if (hit) sumar(hit);
    }
  };
  for (const entrada of ['CLAUDE.md', 'AGENTS.md']) sumar(path.join(raiz, entrada));
  return out;
}

// -- las tres categorias -------------------------------------------------
// Lo cargado se reparte en tres, y solo la primera tiene tope:
//
//   Agente Multiproposito — lo que este repo MANDA y carga todo Agente Desplegado el dia uno.
//   este repo             — las filas que le agrego a esos Indices persiguiendo su Proposito.
//   afuera                — el punto de entrada menos su bloque de cableado: es la descripcion del
//                           proyecto de cada repo, no se reparte y no entra en ningun veredicto.
//
// Lo que manda se mide contra los archivos de `base/`, no se deduce: un registro `origen:
// agente-desplegado` viaja declarado y SIN filas, asi que su contraparte ya pesa lo que va a pesar
// el dia uno de un repo nuevo. Lo unico que no viaja como archivo es el bloque de cableado, que se
// mide aparte por su encabezado.
// Bytes con que viaja un archivo cargado, o null si no viaja por archivo.
function bytesQueViajan(rel, bases) {
  // Defensa explicita, NO probada por si sola: hoy es redundante —un archivo de la raiz tampoco
  // tiene contraparte en `base/`, asi que igual saldria null por el otro camino— y sacarla no hace
  // fallar ningun caso. Se deja porque declara la intencion, no porque el banco la cubra.
  if (!rel.startsWith('.claude/')) return null;   // se fusiona desde la PLANTILLA, no sale de base/
  const dentro = rel.slice('.claude/'.length);
  for (const b of bases) {
    const cand = path.join(b, dentro);
    if (!fs.existsSync(cand)) continue;
    try { return Buffer.byteLength(fs.readFileSync(cand, 'utf8')); } catch { return null; }
  }
  return null;
}

// Bytes del bloque de cableado dentro de un archivo que no viaja: desde su encabezado hasta el
// proximo `## `, o hasta el final. Devuelve 0 si el archivo no lo tiene.
function bytesDelCableado(txt) {
  const lineas = txt.split(/\r?\n/);
  const i = lineas.findIndex(l => l.startsWith(CABLEADO));
  if (i === -1) return 0;
  let fin = lineas.length;
  for (let j = i + 1; j < lineas.length; j++) if (/^## /.test(lineas[j])) { fin = j; break; }
  return Buffer.byteLength(lineas.slice(i, fin).join('\n'));
}

const bases = basesDeInstalacion(repo);
// «afuera» es el punto de entrada, no cualquier archivo sin contraparte: un Indice que el repo se
// invento bajo `.claude/` tampoco viaja, y es suyo entero — cuenta como este repo, no como afuera.
const archivos = cargados(repo).map(f => ({
  ...f,
  viajan: bytesQueViajan(f.rel, bases),
  puntoDeEntrada: !f.rel.startsWith('.claude/'),
  cableado: f.rel.startsWith('.claude/') ? 0 : bytesDelCableado(f.txt),
}));
const total = archivos.reduce((a, f) => a + f.bytes, 0);
const cableado = archivos.reduce((a, f) => a + f.cableado, 0);
const amp = archivos.reduce((a, f) => a + (f.viajan || 0), 0) + cableado;
// Lo que el punto de entrada aporta fuera del cableado: descripcion del proyecto de cada repo.
const afuera = archivos.filter(f => f.puntoDeEntrada).reduce((a, f) => a + f.bytes - f.cableado, 0);
const propio = total - amp - afuera;
const kb = n => (n / 1024).toFixed(1);

// En modo hook: una linea sola. Se emite SIEMPRE, tambien dentro del tope — un aviso que solo
// aparece cuando ya es tarde no deja ver que el margen se estaba comiendo.
if (modoHook) {
  const linea = !archivos.length
    ? 'contexto: no se encontro el punto de entrada del repo'
    : `contexto: Agente Multipropósito ${kb(amp)} KB de ${kb(TOPE)}` +
      (amp > TOPE ? ` — PASA EL TOPE por ${kb(amp - TOPE)} KB` : ` (libre ${kb(TOPE - amp)} KB)`) +
      `  ·  este repo ${kb(propio)} KB` +
      (cableado ? '' : '  ·  ⚠ sin hallar el bloque de cableado en el punto de entrada');
  process.stdout.write(JSON.stringify({ systemMessage: linea }));
  process.exit(0);
}

console.log(`== MEDIR CONTEXTO: ${repo} ==`);
if (!archivos.length) {
  // Cero archivos no es un repo liviano: es que no se encontro el punto de entrada. Decirlo, o el
  // silencio se lee como un contexto de 0 KB.
  console.log('\nno se encontro CLAUDE.md ni AGENTS.md en la raiz: no hay contexto que medir.');
  process.exit(0);
}
console.log(`archivos: ${archivos.length} | total cargado: ${kb(total)} KB\n`);
// Solo la primera linea tiene tope. Las otras dos son datos: la segunda solo la puede bajar el repo
// que la escribio, y la tercera ni siquiera se reparte.
console.log(`  Agente Multipropósito  ${kb(amp).padStart(6)} KB   de ${kb(TOPE)} KB   (cableado: ${kb(cableado)} KB)`);
console.log(`  este repo              ${kb(propio).padStart(6)} KB   dato, sin tope`);
console.log(`  afuera                 ${kb(afuera).padStart(6)} KB   punto de entrada, no se reparte\n`);
if (!cableado) {
  // Cero cableado no es un repo sin cableado: es que no se hallo el encabezado. Decirlo, o el
  // silencio deja al numero controlado corto sin que nadie se entere.
  console.log(`  ⚠ no se hallo el bloque «${CABLEADO}» en el punto de entrada: falta esa parte del número controlado.\n`);
}

console.log('       acá     viaja');
for (const f of [...archivos].sort((a, b) => b.bytes - a.bytes)) {
  const v = f.viajan === null ? (f.cableado ? `${kb(f.cableado).padStart(6)}*` : '   —  ') : kb(f.viajan).padStart(6);
  console.log(`    ${kb(f.bytes).padStart(6)} KB  ${v}    ${f.rel}`);
}
if (cableado) console.log('    (* el bloque de cableado, que no viaja como archivo)');

const libre = TOPE - amp;
console.log(libre >= 0
  ? `\nDENTRO DEL TOPE por ${kb(libre)} KB.`
  : `\nPASA EL TOPE por ${kb(-libre)} KB: decidir entre subirlo o recortar lo que este repo manda (arriba, columna «viaja»).`);
