#!/usr/bin/env node
// Mide el texto que un repo carga en CADA arranque de sesion y lo compara contra un tope.
//
// Por que es una Herramienta de ESTE repo y no algo que viaje: el tope lo fija el Agente
// Multiproposito y decidir si sube es potestad de aca. Un Agente Desplegado no puede moverlo —el
// nivelador le repone cualquier archivo que edite—, asi que informarselo seria darle un numero
// sobre el que no puede actuar. Lo unico que si esta en sus manos, bajar su propio contexto, no
// necesita esta Herramienta para hacerse.
//
// Que mide: lo que entra al contexto sin que nadie lo pida. Arranca por `CLAUDE.md` y `AGENTS.md`
// y sigue las lineas `@ruta`, que son imports. Los registros que se consultan a demanda no cuentan,
// justamente porque no se cargan.
//
// De donde sale el tope: se fijo el 30/07/2026 midiendo lo que habia ese dia —43,9 KB en 17
// archivos— y dejando unos 4 KB de margen. Subio a 52 KB el 01/08/2026, con el mismo criterio:
// lo que habia mas ~4 KB, despues de recortar la celda que mas habia crecido.
// No sale de un limite del modelo ni de ningun calculo: es
// una disciplina auto-impuesta. Como referencia, ese texto son unos 13 a 16 mil tokens, del orden
// del 7% de las ventanas de contexto actuales. Lo que aporta el control es QUE HAYA UN NUMERO, no
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

const TOPE = 52 * 1024;

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
    out.push({ rel: path.relative(raiz, abs).replace(/\\/g, '/'), bytes: Buffer.byteLength(txt) });
    for (const m of txt.matchAll(/^@(\S+)\s*$/gm)) {
      const hit = [path.join(raiz, m[1]), path.join(path.dirname(abs), m[1])].find(c => fs.existsSync(c));
      if (hit) sumar(hit);
    }
  };
  for (const entrada of ['CLAUDE.md', 'AGENTS.md']) sumar(path.join(raiz, entrada));
  return out;
}

// -- el piso del Agente Desplegado ---------------------------------------
// El total de arriba mezcla dos cosas que se mueven distinto: lo que este repo MANDA —viaja en
// `base/` y lo carga todo Agente Desplegado— y lo que este repo APRENDIO, que son sus propias filas
// y no las hereda nadie. Con un solo numero, recortar una fila propia se ve igual que recortar una
// que viaja, y solo la segunda le devuelve contexto a los repos instalados.
//
// El piso se mide contra los archivos de `base/`, no se deduce: un registro `origen:
// agente-desplegado` viaja declarado y SIN filas, asi que su contraparte ya pesa lo que va a pesar
// el dia uno de un repo nuevo. Es una COTA INFERIOR: `AGENTS.md` y `CLAUDE.md` no estan en `base/`
// —se fusionan desde la PLANTILLA de `amp:inicializar`— y no se pueden medir desde aca.
function basesDeInstalacion(raiz) {
  const out = [];
  const funcDir = path.join(raiz, 'funcionalidades');
  if (!fs.existsSync(funcDir)) return out;
  for (const f of fs.readdirSync(funcDir)) {
    const skillsDir = path.join(funcDir, f, 'skills');
    if (!fs.existsSync(skillsDir)) continue;
    for (const s of fs.readdirSync(skillsDir)) {
      const b = path.join(skillsDir, s, 'base');
      if (fs.existsSync(b)) out.push(b);
    }
  }
  return out;
}
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

const bases = basesDeInstalacion(repo);
const archivos = cargados(repo).map(f => ({ ...f, viajan: bytesQueViajan(f.rel, bases) }));
const total = archivos.reduce((a, f) => a + f.bytes, 0);
const piso = archivos.reduce((a, f) => a + (f.viajan || 0), 0);
const sinMedir = archivos.filter(f => f.viajan === null).reduce((a, f) => a + f.bytes, 0);
const kb = n => (n / 1024).toFixed(1);

// En modo hook: una linea sola. Se emite SIEMPRE, tambien dentro del tope — un aviso que solo
// aparece cuando ya es tarde no deja ver que el margen se estaba comiendo.
if (modoHook) {
  const linea = !archivos.length
    ? 'contexto: no se encontro el punto de entrada del repo'
    : `contexto ${kb(total)} KB de ${kb(TOPE)} en ${archivos.length} archivos` +
      (total > TOPE ? ` — PASA EL TOPE por ${kb(total - TOPE)} KB` : ` (libre ${kb(TOPE - total)} KB)`);
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
console.log(`archivos: ${archivos.length} | total: ${kb(total)} KB | tope: ${kb(TOPE)} KB`);
// El piso NO tiene tope propio: es un dato, no un control. Sube solo cuando este repo le agrega
// algo a la Base, y el unico que puede bajarlo es este repo.
console.log(`piso del Agente Desplegado: ${kb(piso)} KB  ·  propio de este repo: ${kb(total - piso - sinMedir)} KB`
  + `  ·  sin medir: ${kb(sinMedir)} KB (se fusiona desde la PLANTILLA)\n`);

console.log('       acá     viaja');
for (const f of [...archivos].sort((a, b) => b.bytes - a.bytes)) {
  const v = f.viajan === null ? '   —  ' : kb(f.viajan).padStart(6);
  console.log(`    ${kb(f.bytes).padStart(6)} KB  ${v}    ${f.rel}`);
}

const libre = TOPE - total;
console.log(libre >= 0
  ? `\nDENTRO DEL TOPE por ${kb(libre)} KB.`
  : `\nPASA EL TOPE por ${kb(-libre)} KB: decidir entre subirlo o recortar (arriba, los archivos mas pesados).`);
