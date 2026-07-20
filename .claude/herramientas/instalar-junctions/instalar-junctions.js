#!/usr/bin/env node
// Crea/repara las dos tandas de junctions de skills (decision 0010):
//   ~/.claude/skills/<skill>  -> la ve Claude Code
//   ~/.agents/skills/<skill>  -> la ven Codex CLI / Cursor / Gemini CLI (ubicacion estandar Agent Skills)
// apuntando ambas a la fuente unica funcionalidades/*/skills/<skill>. Idempotente: crea solo lo ausente,
// no pisa lo divergente (lo reporta). Sin LLM, sin red.
// Uso: node instalar-junctions.js [<raiz-del-harness>]   (default: cwd)
const fs = require('fs'), path = require('path'), os = require('os');
const repo = path.resolve(process.argv[2] || '.');
const fdir = path.join(repo, 'funcionalidades');
if (!fs.existsSync(fdir)) {
  console.error(`no existe ${fdir} — correr desde la raiz del harness (o pasarla como argumento)`);
  process.exit(1);
}

const tandas = [
  path.join(os.homedir(), '.claude', 'skills'),
  path.join(os.homedir(), '.agents', 'skills'),
];

// fuente unica: toda carpeta funcionalidades/*/skills/<skill>
const fuentes = [];
for (const f of fs.readdirSync(fdir)) {
  const sk = path.join(fdir, f, 'skills');
  if (!fs.existsSync(sk) || !fs.statSync(sk).isDirectory()) continue;
  for (const s of fs.readdirSync(sk)) {
    const src = path.join(sk, s);
    if (fs.statSync(src).isDirectory()) fuentes.push({ nombre: s, src });
  }
}

const normalizar = p => path.resolve(String(p).replace(/^\\\\\?\\/, '')).toLowerCase();
const balde = { agregado: [], ya_estaba: [], divergente: [] };

for (const tanda of tandas) {
  fs.mkdirSync(tanda, { recursive: true });
  for (const { nombre, src } of fuentes) {
    const link = path.join(tanda, nombre);
    let st = null;
    try { st = fs.lstatSync(link); } catch {}
    if (!st) {
      fs.symlinkSync(src, link, 'junction');
      balde.agregado.push(link);
    } else if (st.isSymbolicLink()) {
      const target = normalizar(fs.readlinkSync(link));
      if (target === normalizar(src)) balde.ya_estaba.push(link);
      else balde.divergente.push(`${link} -> ${target} (esperado ${src})`);
    } else {
      balde.divergente.push(`${link} (carpeta real, no junction — no se toca)`);
    }
  }
}

console.log(`== INSTALAR JUNCTIONS: ${fuentes.length} skills x ${tandas.length} tandas ==\n`);
for (const [k, v] of Object.entries(balde)) {
  console.log(`[${k.toUpperCase().replace('_', ' ')}] (${v.length})`);
  if (!v.length) console.log('    (ninguno)');
  else v.forEach(x => console.log(`    ${x}`));
}
process.exit(balde.divergente.length ? 1 : 0);
