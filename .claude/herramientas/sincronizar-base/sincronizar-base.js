#!/usr/bin/env node
// Copia los Componentes de Subsistema del Agente Multiproposito desde el `.claude/` vivo de este
// repo a la carpeta `base/` de la skill de instalacion, que es la que viaja adentro del plugin.
//
// La regla la declara cada archivo en su frontmatter, no una lista escrita aca:
//   - sin frontmatter, u `origen: agente-multiproposito`  ->  se copia entero
//   - `origen: agente-desplegado`  ->  se copia SOLO hasta el separador de la tabla. Las filas son
//     las que puebla cada repo; si viajaran, todo repo nuevo naceria con las entradas de este.
//     (Paso el 30/07/2026 al sincronizar a mano un encabezado: se colaron seis Herramientas.)
//
// Solo toca archivos que YA estan en `base/`: sumar uno nuevo es una decision, no una copia, y se
// hace a mano. Sin `--aplicar` solo informa.
//
// Uso: node .claude/herramientas/sincronizar-base/sincronizar-base.js [--aplicar] [rutaRepo]
const fs = require('fs');
const path = require('path');

// El repo sale del directorio de trabajo, no de la ubicacion del script: en cuanto existe una
// segunda copia (el marketplace bajado es un clon de este repo), deducirlo desde __dirname
// describe y modifica el repo equivocado, y no falla — contesta.
const args = process.argv.slice(2);
const APLICAR = args.includes('--aplicar');
const REPO = path.resolve(args.find(a => !a.startsWith('--')) || process.cwd());
const INSTALADO = path.join(REPO, '.claude');

const norm = s => s.replace(/\r\n/g, '\n').replace(/\s+$/, '');
function origenDe(txt) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(txt);
  if (!m) return null;
  const o = /^origen:\s*(\S+)\s*$/m.exec(m[1]);
  return o ? o[1] : null;
}
function hastaLaTabla(txt) {
  const ls = norm(txt).split('\n');
  const i = ls.findIndex(l => /^\s*\|[\s:|-]+\|\s*$/.test(l));
  return i === -1 ? null : ls.slice(0, i + 1).join('\n') + '\n';
}
function listar(raiz, rel, out) {
  for (const e of fs.readdirSync(path.join(raiz, rel || '.'), { withFileTypes: true })) {
    const r = rel ? rel + '/' + e.name : e.name;
    if (e.isDirectory()) listar(raiz, r, out); else out.push(r);
  }
  return out;
}

// Las carpetas `base/` de cada skill de instalacion que haya en el repo.
const basesDeInstalacion = [];
const funcDir = path.join(REPO, 'funcionalidades');
if (fs.existsSync(funcDir)) {
  for (const f of fs.readdirSync(funcDir)) {
    const skillsDir = path.join(funcDir, f, 'skills');
    if (!fs.existsSync(skillsDir)) continue;
    for (const s of fs.readdirSync(skillsDir)) {
      const b = path.join(skillsDir, s, 'base');
      if (fs.existsSync(b)) basesDeInstalacion.push(b);
    }
  }
}

console.log(`== SINCRONIZAR BASE: ${REPO} ==`);
if (!basesDeInstalacion.length) {
  console.log('no hay ninguna carpeta base/ de instalacion en funcionalidades/. Nada que hacer.');
  process.exit(0);
}

const copiados = [], iguales = [], sinInstalar = [];
for (const baseDir of basesDeInstalacion) {
  for (const r of listar(baseDir, '', [])) {
    const desde = path.join(INSTALADO, r);
    const hacia = path.join(baseDir, r);
    if (!fs.existsSync(desde)) { sinInstalar.push(r); continue; }
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
}

console.log(`archivos que viajan: ${copiados.length + iguales.length}`);
console.log(`\n[${APLICAR ? 'SINCRONIZADOS' : 'PARA SINCRONIZAR'}] (${copiados.length})`);
copiados.forEach(r => console.log('    ' + r));
if (!copiados.length) console.log('    (ninguno)');
if (sinInstalar.length) {
  console.log(`\n[VIAJAN Y NO ESTAN EN .claude/] (${sinInstalar.length})`);
  sinInstalar.forEach(r => console.log('    ' + r));
  console.log('    Estos no se sincronizan solos: falta el archivo del lado que manda.');
}
console.log(`\nya estaban al dia: ${iguales.length}`);
if (!APLICAR && copiados.length) console.log('\n(informe; nada escrito. Volver a correr con --aplicar)');
