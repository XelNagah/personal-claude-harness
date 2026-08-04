// Prueba cada control de lint-preferencias contra un caso malo y uno bueno.
//
// Este lint no agrupa por secciones: emite una lista plana de problemas. Así que cada caso declara
// un FRAGMENTO del mensaje esperado, y no alcanza con que el conteo suba — si subiera por otro
// motivo, la prueba pasaría por la razón equivocada.
//
// El control más valioso del conjunto no mira la tabla sino el contexto: verifica que el punto de
// entrada importe el manifiesto y que el manifiesto importe sus Índices. Sin eso las preferencias
// existen y **no están cargadas**, que es la falla que el subsistema entero existe para evitar y la
// que ningún otro control puede ver.
//
// Uso: node .claude/preferencias/lint-preferencias/pruebas.js   (desde la raíz del repo)
const fs = require('fs'), path = require('path'), cp = require('child_process');
const REPO_PRUEBA = '.claude/tmp/repo-prueba-preferencias';
const CLAUDE = path.join(REPO_PRUEBA, '.claude');
const BANCO = path.join(CLAUDE, 'preferencias');
const LINT = '.claude/preferencias/lint-preferencias/lint-preferencias.js';

// Hace falta la raíz del repo además de `.claude/`: el lint chequea que `AGENTS.md` importe el
// manifiesto, y sin punto de entrada ese control se dispara siempre.
function armar() {
  fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
  const salteados = new Set(['tmp', 'pendientes', 'ejecutados', 'descartados']);
  fs.mkdirSync(CLAUDE, { recursive: true });
  for (const e of fs.readdirSync('.claude', { withFileTypes: true })) {
    if (salteados.has(e.name)) continue;
    fs.cpSync(path.join('.claude', e.name), path.join(CLAUDE, e.name), {
      recursive: true,
      filter: src => !salteados.has(path.basename(src)),
    });
  }
  for (const f of ['AGENTS.md', 'CLAUDE.md']) if (fs.existsSync(f)) fs.cpSync(f, path.join(REPO_PRUEBA, f));
  fs.rmSync(path.join(BANCO, 'lint-preferencias'), { recursive: true, force: true });
}
const leer = f => fs.readFileSync(path.join(BANCO, f), 'utf8');
const escribir = (f, t) => fs.writeFileSync(path.join(BANCO, f), t);
const IDX = 'PREFERENCIAS.md', LOCAL = 'PREFERENCIAS-LOCAL.md';

function correr() {
  const r = cp.spawnSync('node', [LINT, CLAUDE], { encoding: 'utf8' });
  return (r.stdout || '') + (r.stderr || '');
}
const cuantos = salida => {
  const m = /hallazgos: (\d+)/.exec(salida);
  return m ? parseInt(m[1], 10) : -1;
};

let malos = 0;

console.log('== CASO BUENO: el banco intacto da cero ==');
armar();
{
  const s = correr(), n = cuantos(s);
  console.log(`${n === 0 ? 'OK  ' : 'FALLA'} banco sin tocar → ${n} hallazgos`);
  if (n !== 0) { malos++; console.log(s.split('\n').filter(l => l.includes('[x]')).join('\n')); }
}

const casos = [];
const caso = (nombre, fragmento, romper) => casos.push({ nombre, fragmento, romper });

caso('código con prefijo que no corresponde al origen', 'no tiene la forma',
  () => escribir(IDX, leer(IDX).replace('| Base-0003 |', '| Local-0099 |')));

caso('código duplicado', 'codigo duplicado',
  () => escribir(IDX, leer(IDX).replace('| Base-0009 |', '| Base-0003 |')));

caso('fila sin Nombre', 'no tiene Nombre',
  () => escribir(IDX, leer(IDX).replace(/(\| Base-0009 \| )[^|]+(\|)/, '$1 $2')));

// Se le pone a Base-0009 el Nombre que ya tiene Base-0003, que es otro: ponerle el suyo propio no
// duplica nada y el caso pasaría en verde sin ejercitar el control.
caso('nombre duplicado', 'nombre duplicado',
  () => escribir(IDX, leer(IDX).replace(/(\| Base-0009 \| )[^|]+(\|)/, '$1Mostrar el texto exacto antes de escribir en un registro canónico $2')));

caso('fila sin Descripción', 'no tiene Descripción',
  () => escribir(IDX, leer(IDX).replace(/(\| Base-0009 \| [^|]+\| )[^|]+(\|)/, '$1 $2')));

caso('Detalle que apunta a una página que no existe', 'que no existe',
  () => escribir(IDX, leer(IDX).replace('[archivo-de-estado.md](archivo-de-estado.md)', '[no-existe.md](no-existe.md)')));

caso('página que ninguna celda Detalle declara', 'pagina huerfana',
  () => fs.writeFileSync(path.join(BANCO, 'pagina-suelta.md'), '# Suelta\n\nNadie la declara.\n'));

// El control de las secciones `##` vive en la rama de la FORMA VIEJA: solo corre cuando ningún
// Índice declara frontmatter, porque ahí los encabezados eran el único mecanismo de separación por
// origen. Con dos Índices declarados ese chequeo no aplica —la separación es por archivo—, así que
// para ejercitarlo hay que reconstruir la forma vieja: un solo archivo, sin frontmatter, con las dos
// secciones adentro. Es el estado de un Agente Desplegado que todavía no se niveló.
caso('forma vieja: falta la sección del Agente Multipropósito', 'falta la seccion',
  () => {
    fs.rmSync(path.join(BANCO, LOCAL));
    const sinFrontmatter = leer(IDX).replace(/^---[\s\S]*?\n---\n/, '');
    escribir(IDX, sinFrontmatter.replace('## Preferencias del Agente Multipropósito', '## Otra cosa'));
  });

// El control que importa de verdad: la preferencia existe pero queda fuera del contexto.
caso('el punto de entrada dejó de importar el manifiesto', 'no queda en contexto',
  () => fs.writeFileSync(path.join(REPO_PRUEBA, 'AGENTS.md'), '# Instrucciones\n\nSin importar nada.\n'));

caso('el manifiesto declara cargar un Índice que no importa', 'no importa @',
  () => escribir('MANIFIESTO.md', leer('MANIFIESTO.md').replace(/^@PREFERENCIAS-LOCAL\.md$/m, '')));

console.log('\n== CASOS MALOS: cada control se enciende ante su defecto ==');
for (const c of casos) {
  armar();
  try { c.romper(); } catch (e) { console.log(`FALLA ${c.nombre}\n      no se pudo romper el banco: ${e.message}`); malos++; continue; }
  const s = correr();
  if (!s.includes(c.fragmento)) {
    console.log(`FALLA ${c.nombre}  → no apareció "${c.fragmento}" (hallazgos: ${cuantos(s)})`);
    malos++; continue;
  }
  console.log(`OK    ${c.nombre}  → hallazgos: ${cuantos(s)}`);
}

// -- CASO BUENO fino: el Índice del Agente Desplegado sin filas es válido ----
console.log('\n== CASO BUENO: el Índice del Agente Desplegado sin filas propias es válido ==');
armar();
{
  const t = leer(LOCAL);
  // Se le quitan las filas dejando el encabezado: es el estado de un repo recién instalado.
  // También salen sus detalles exclusivos; conservarlos fabricaría páginas huérfanas que una
  // instalación pública nunca recibe. Los detalles que además declare la Base se conservan.
  const filasBase = leer(IDX).split('\n').filter(l => /^\| Base-/.test(l)).join('\n');
  const filasLocales = t.split('\n').filter(l => /^\| Local-/.test(l)).join('\n');
  const detallesBase = new Set([...filasBase.matchAll(/\]\(([^)]+\.md)\)/g)].map(m => m[1]));
  const detallesLocales = [...filasLocales.matchAll(/\]\(([^)]+\.md)\)/g)].map(m => m[1]);
  escribir(LOCAL, t.split('\n').filter(l => !/^\| Local-/.test(l)).join('\n'));
  for (const detalle of detallesLocales) {
    if (!detallesBase.has(detalle)) fs.rmSync(path.join(BANCO, detalle), { force: true });
  }
  const s = correr(), n = cuantos(s);
  console.log(`${n === 0 ? 'OK  ' : 'FALLA'} sin preferencias propias → ${n} hallazgos`);
  if (n !== 0) { malos++; console.log(s.split('\n').filter(l => l.includes('[x]')).join('\n')); }
}

fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
console.log(`\ncasos: ${casos.length + 2}`);
console.log(malos ? `${malos} FALLARON.` : 'TODO VERDE.');
process.exit(malos ? 1 : 0);
