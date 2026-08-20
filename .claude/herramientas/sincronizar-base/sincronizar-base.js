#!/usr/bin/env node
// Copia los Componentes de Subsistema del Agente Multiproposito desde el `.claude/` vivo de este
// repo a la carpeta `base/` de la skill de instalacion, que es la que viaja adentro del plugin.
//
// La regla de cuanto se copia la declara cada archivo en su frontmatter, no una lista escrita aca:
//   - sin frontmatter, u `origen: agente-multiproposito`  ->  se copia entero
//   - `origen: agente-desplegado`  ->  se copia SOLO hasta el separador de la tabla. Las filas son
//     las que puebla cada repo; si viajaran, todo repo nuevo naceria con las entradas de este.
//     (Paso el 30/07/2026 al sincronizar a mano un encabezado: se colaron seis Herramientas.)
//
// El recorrido va del ORIGEN al destino: lista `.claude/`, que es el lado que manda, y para cada
// archivo busca su par en `base/`. Fue al reves hasta el 20/08/2026 —listaba `base/` y buscaba el
// par vivo— y esa direccion no puede ver lo que falta: un Componente nuevo de la Base nunca viajaba
// y ninguna corrida lo mencionaba. Es una forma del conocimiento Local-0013 (`controles-que-no-avisan`):
// recorrer el destino en vez del origen deja al control ciego justo para lo que viene a detectar.
// Los dos sentidos hacen falta y estan los dos: el que falta en `base/` sale como CANDIDATO, y el
// que esta en `base/` sin par vivo sale como VIAJA Y NO ESTA INSTALADO.
//
// Sumar un Componente nuevo a `base/` sigue siendo una decision de una persona: la Herramienta lo
// nombra, no lo copia sola.
//
// Uso: node .claude/herramientas/sincronizar-base/sincronizar-base.js [--aplicar] [rutaRepo]
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

// El repo sale del directorio de trabajo, no de la ubicacion del script: en cuanto existe una
// segunda copia (el marketplace bajado es un clon de este repo), deducirlo desde __dirname
// describe y modifica el repo equivocado, y no falla — contesta.
const args = process.argv.slice(2);
const APLICAR = args.includes('--aplicar');
const REPO = path.resolve(args.find(a => !a.startsWith('--')) || process.cwd());
const INSTALADO = path.join(REPO, '.claude');

// La marca de orden de bytes se saca SIEMPRE, y es lo primero que pasa con cualquier texto: un `.md`
// guardado con ella deja de matchear `^---`, o sea pierde su `origen`, y un registro sin origen se
// trata como mecanismo y se copia ENTERO — con las filas de este repo adentro, a todo consumidor.
// Es la falla más cara de esta Herramienta y la más difícil de ver, porque el archivo se lee igual
// en cualquier editor. Al sacarla también del texto que se escribe, lo que viaja nunca la lleva.
const { sinMarcaDeOrden, origenDe, leerFrontmatter } = require('../../common/frontmatter.js');
const { basesDeInstalacion: basesDe } = require('../../common/bases-de-instalacion.js');
const norm = s => sinMarcaDeOrden(s).replace(/\r\n/g, '\n').replace(/\s+$/, '');
function hastaLaTabla(txt) {
  const ls = norm(txt).split('\n');
  const i = ls.findIndex(l => /^\s*\|[\s:|-]+\|\s*$/.test(l));
  return i === -1 ? null : ls.slice(0, i + 1).join('\n') + '\n';
}
function listar(raiz, rel, out) {
  let entradas;
  try { entradas = fs.readdirSync(path.join(raiz, rel || '.'), { withFileTypes: true }); } catch (e) { return out; }
  for (const e of entradas) {
    const r = rel ? rel + '/' + e.name : e.name;
    if (e.isDirectory()) listar(raiz, r, out); else out.push(r);
  }
  return out;
}

// -- lo que el Agente Multiproposito pone en el destino sin copiarlo desde `base/` ---------------
// Son los unicos renglones escritos a mano de todo el indice, y es a proposito: no salen de ningun
// recorrido, porque en `base/` no hay nada que recorrer. Sin ellos, el inventario del destino
// marcaria `identidad.md` y `tmp/` como componentes sueltos, que es la punta que el plan Local-0106
// mide como falso positivo. `generado` es contenido propio del repo que crea `amp:inicializar`;
// `fragmentos` es un archivo ajeno al que el Agente Multiproposito le escribe partes por merge.
const NO_COPIADOS = [
  { nombre: 'identidad.md', comoLlega: 'generado' },
  { nombre: 'tmp/', comoLlega: 'generado' },
  { nombre: 'settings.json', comoLlega: 'fragmentos' },
];

// Las carpetas `base/` de cada skill de instalacion que haya en el repo.
const basesDeInstalacion = basesDe(REPO);

console.log(`== SINCRONIZAR BASE: ${REPO} ==`);
if (!basesDeInstalacion.length) {
  console.log('no hay ninguna carpeta base/ de instalacion en funcionalidades/. Nada que hacer.');
  process.exit(0);
}

// -- que del `.claude/` vivo ya esta declarado como algo que NO es de la Base --------------------
// Un archivo que no viaja puede ser tres cosas, y las tres estan declaradas en algun lado: (1) lo
// que git no versiona no es del repo; (2) lo que enlaza un Indice de origen `agente-desplegado` es
// Aprendizaje de este repo — sus planes, sus paginas, sus Herramientas propias, cada uno con su
// fila; (3) lo que el Agente Multiproposito genera en el destino, arriba. Lo que no cae en ninguna
// es un CANDIDATO: no se copia solo, se nombra para que alguien decida.
function ignoradosPorGit(rutas) {
  if (!rutas.length) return new Set();
  const leer = salida => new Set(String(salida || '').split('\n').filter(Boolean)
    .map(l => l.trim().replace(/\\/g, '/').replace(/^\.claude\//, '')));
  try {
    return leer(execFileSync('git', ['check-ignore', '--stdin'], {
      cwd: REPO, input: rutas.map(r => '.claude/' + r).join('\n'), encoding: 'utf8',
    }));
  } catch (e) {
    // `check-ignore` sale con 1 cuando ninguna ruta esta ignorada: es una respuesta, no un error, y
    // trae en stdout las que si lo estaban. Con git ausente o sin repo no hay stdout y queda vacio:
    // ahi el peor caso es nombrar de mas, que es ruido visible — nunca copiar de menos en silencio.
    return leer(e && e.stdout);
  }
}

// Los enlaces relativos de los Indices de origen `agente-desplegado`, como rutas relativas a
// `.claude/`. Se resuelven desde la carpeta del Indice y se aceptan con espacios y con `%20`: los
// planes se llaman con una frase entera, asi que un patron que corte en el primer espacio deja
// afuera a los 110 archivos de `planes/` y los nombra a todos como candidatos.
function declaradosPorIndicesDelRepo() {
  const out = new Set();
  let subs = [];
  try { subs = fs.readdirSync(INSTALADO, { withFileTypes: true }).filter(e => e.isDirectory()); } catch (e) { return out; }
  for (const sub of subs) {
    const dir = path.join(INSTALADO, sub.name);
    let archivos = [];
    try { archivos = fs.readdirSync(dir).filter(n => n.endsWith('.md')); } catch (e) { continue; }
    for (const f of archivos) {
      let txt; try { txt = fs.readFileSync(path.join(dir, f), 'utf8'); } catch (e) { continue; }
      const fm = leerFrontmatter(txt);
      if (!fm || !fm.indice || fm.origen !== 'agente-desplegado') continue;
      for (const m of sinMarcaDeOrden(txt).matchAll(/\]\(([^)]+)\)/g)) {
        let destino = m[1].trim().replace(/^<|>$/g, '').split('#')[0];
        if (!destino || /^[a-z][a-z0-9+.-]*:/i.test(destino)) continue;
        try { destino = decodeURIComponent(destino); } catch (e) { /* la ruta cruda sirve igual */ }
        const rel = path.relative(INSTALADO, path.resolve(dir, destino)).replace(/\\/g, '/');
        if (rel && !rel.startsWith('..')) out.add(rel.replace(/\/$/, ''));
      }
    }
  }
  return out;
}

const cubierto = (r, conjunto) => conjunto.has(r) || [...conjunto].some(d => d && r.startsWith(d + '/'));

// -- sincronizar ---------------------------------------------------------------------------------
const copiados = [], iguales = [], sinInstalar = [], candidatos = [];
const vivos = listar(INSTALADO, '', []);
const ignorados = ignoradosPorGit(vivos);
const declarados = declaradosPorIndicesDelRepo();
const noCopiados = new Set(NO_COPIADOS.map(c => c.nombre.replace(/\/$/, '')));

for (const baseDir of basesDeInstalacion) {
  // El indice se arma y se escribe ANTES de comparar, para que la comparacion lo vea al dia: es un
  // archivo de `base/` como cualquier otro y tiene que quedar identico de los dos lados.
  const enBase = new Set(listar(baseDir, '', []));

  for (const r of vivos) {
    const desde = path.join(INSTALADO, r);
    const hacia = path.join(baseDir, r);
    if (!enBase.has(r)) {
      if (!cubierto(r, ignorados) && !cubierto(r, declarados) && !cubierto(r, noCopiados)) candidatos.push(r);
      continue;
    }
    const vivo = fs.readFileSync(desde, 'utf8');
    const esRegistroDelRepo = r.endsWith('.md') && origenDe(vivo) === 'agente-desplegado';
    let queVaAViajar = vivo;
    if (esRegistroDelRepo) {
      const cabeza = hastaLaTabla(vivo);
      if (cabeza === null) { sinInstalar.push(`${r}  (declara origen agente-desplegado y no se le encontro la tabla)`); continue; }
      queVaAViajar = cabeza;
    }

    const actual = fs.readFileSync(hacia, 'utf8');
    if (norm(actual) === norm(queVaAViajar)) { iguales.push(r); continue; }
    copiados.push(r + (esRegistroDelRepo ? '  (solo el encabezado)' : ''));
    if (APLICAR) fs.writeFileSync(hacia, norm(queVaAViajar) + '\n', 'utf8');
  }

  // El sentido inverso: lo que viaja y no tiene par vivo. Casi nunca pasa, pero cuando pasa es un
  // Componente que se le instala a todo consumidor y que este repo ya no tiene para compararle.
  for (const r of enBase) if (!fs.existsSync(path.join(INSTALADO, r))) sinInstalar.push(r);

}

console.log(`archivos que viajan: ${copiados.length + iguales.length}`);
console.log(`\n[${APLICAR ? 'SINCRONIZADOS' : 'PARA SINCRONIZAR'}] (${copiados.length})`);
copiados.forEach(r => console.log('    ' + r));
if (!copiados.length) console.log('    (ninguno)');
if (candidatos.length) {
  console.log(`\n[EN .claude/ Y NO VIAJAN — CANDIDATOS] (${candidatos.length})`);
  candidatos.forEach(r => console.log('    ' + r));
  console.log('    No los versiona git como Aprendizaje ni los declara ningun Indice del Agente');
  console.log('    Desplegado. Que algo viaje es una decision: sumarlo a base/ o declararlo, a mano.');
}
if (sinInstalar.length) {
  console.log(`\n[VIAJAN Y NO ESTAN EN .claude/] (${sinInstalar.length})`);
  sinInstalar.forEach(r => console.log('    ' + r));
  console.log('    Estos no se sincronizan solos: falta el archivo del lado que manda.');
}
console.log(`\nya estaban al dia: ${iguales.length}`);
if (!APLICAR && (copiados.length || candidatos.length)) console.log('\n(informe; nada escrito. Volver a correr con --aplicar)');
