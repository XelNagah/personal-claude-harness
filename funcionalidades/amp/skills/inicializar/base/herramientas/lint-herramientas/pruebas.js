// Prueba cada control de lint-herramientas contra un caso malo y uno bueno.
//
// El control mas propio de este lint es el cuarto: verifica que las rutas de lint que aparecen en la
// configuracion de hooks sigan existiendo. Es el que caza el defecto que el manifiesto advierte —una
// tool referenciada por ruta en `settings`, en `.gitignore` o en un hook no se mueve sin actualizar
// esa referencia—, y su falla no se ve en ningun informe: el hook simplemente deja de correr.
//
// Uso: node .claude/herramientas/lint-herramientas/pruebas.js   (desde la raíz del repo)
const fs = require('fs'), path = require('path'), cp = require('child_process');
const REPO_PRUEBA = '.claude/tmp/repo-prueba-herramientas';
const CLAUDE = path.join(REPO_PRUEBA, '.claude');
const BANCO = path.join(CLAUDE, 'herramientas');
const LINT = '.claude/herramientas/lint-herramientas/lint-herramientas.js';

// Se copia `.claude/` entera y tambien `.codex/`: el control de las rutas de lint mira la
// configuracion de hooks de los dos agentes.
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
  if (fs.existsSync('.codex')) fs.cpSync('.codex', path.join(REPO_PRUEBA, '.codex'), { recursive: true });
  // El lint co-ubicado se deja en el banco, para que sea fiel a como vive en un repo instalado. Ya no
  // hay una fila que lo registre —se retiró el 30/07/2026, porque el manifiesto, el glosario y el
  // encabezado del propio Índice coinciden en que los lints de subsistema no son Herramientas—, y no
  // queda reclamado porque el lint se autoexcluye del barrido por nombre.
}
const leer = f => fs.readFileSync(path.join(BANCO, f), 'utf8');
const escribir = (f, t) => fs.writeFileSync(path.join(BANCO, f), t);
const LOCAL = 'INDICE-LOCAL.md';

function correr() {
  const r = cp.spawnSync('node', [LINT, BANCO], { encoding: 'utf8' });
  return (r.stdout || '') + (r.stderr || '');
}
function hallazgos(salida) {
  const out = {};
  for (const m of salida.matchAll(/^\[\d+\] (.+?) \((\d+)\):/gm)) out[m[1].trim()] = parseInt(m[2], 10);
  return out;
}
const total = h => Object.values(h).reduce((a, b) => a + b, 0);

let malos = 0;

console.log('== CASO BUENO: el banco intacto da cero ==');
armar();
{
  const h = hallazgos(correr());
  const t = total(h);
  console.log(`${t === 0 ? 'OK  ' : 'FALLA'} banco sin tocar → ${t} hallazgos${t ? '  ' + JSON.stringify(h) : ''}`);
  if (t !== 0) malos++;
}

const casos = [];
const caso = (nombre, seccion, romper) => casos.push({ nombre, seccion, romper });

caso('herramienta con carpeta local y sin README', 'SIN README',
  () => fs.rmSync(path.join(BANCO, 'ejecutar-pruebas', 'README.md')));

caso('carpeta de herramienta que ningún Índice lista', 'FUERA DEL INDICE',
  () => {
    const nueva = path.join(BANCO, 'medir-algo');
    fs.mkdirSync(nueva, { recursive: true });
    fs.writeFileSync(path.join(nueva, 'README.md'), '# medir-algo\n\nSin fila en el registro.\n');
    fs.writeFileSync(path.join(nueva, 'medir-algo.js'), '// nada\n');
  });

caso('fila que apunta a una carpeta local que no existe', 'FILAS COLGADAS',
  () => escribir(LOCAL, leer(LOCAL).replace('[ejecutar-pruebas/](ejecutar-pruebas/)', '[no-existe/](no-existe/)')));

// El defecto silencioso: el hook queda apuntando a un lint que se movió, y deja de correr sin avisar.
caso('la configuración de hooks apunta a un lint que ya no está', 'REFS POR RUTA DE LINT ROTAS EN SETTINGS',
  () => {
    const s = path.join(CLAUDE, 'settings.json');
    fs.writeFileSync(s, fs.readFileSync(s, 'utf8')
      .replace(/\.claude\/planes\/lint-planes\/lint-planes\.js/g, '.claude/planes/lint-mudado/lint-mudado.js'));
  });

caso('columna declarada que la tabla no tiene', 'INDICES DECLARADOS',
  () => escribir(LOCAL, leer(LOCAL).replace(/^columnas: \[(.+)\]$/m, 'columnas: [$1, Inventada]')));

console.log('\n== CASOS MALOS: cada control se enciende ante su defecto ==');
for (const c of casos) {
  armar();
  try { c.romper(); } catch (e) { console.log(`FALLA ${c.nombre}\n      no se pudo romper el banco: ${e.message}`); malos++; continue; }
  const h = hallazgos(correr());
  const propio = h[c.seccion] || 0;
  if (propio === 0) {
    console.log(`FALLA ${c.nombre}  → [${c.seccion}] siguió en 0 (el control no lo vio)`);
    malos++; continue;
  }
  const otros = Object.entries(h).filter(([k, n]) => k !== c.seccion && n > 0).map(([k, n]) => `${k}=${n}`);
  console.log(`OK    ${c.nombre}  → [${c.seccion}] 0→${propio}${otros.length ? '   (además: ' + otros.join(', ') + ')' : ''}`);
}

// -- CASO BUENO fino: el lint co-ubicado no se reclama a sí mismo ------------
// `lint-herramientas` vive dentro de `herramientas/` y es infra del Patrón, no una Herramienta. El
// lint se autoexcluye del barrido de carpetas por nombre (`lint-` + el del subsistema); si esa
// autoexclusión se rompiera, se reclamaría a sí mismo una fila. Se prueba con un lint de otro nombre:
// tiene que seguir exigiéndole fila, porque la autoexclusión es solo para el propio.
console.log('\n== CASO BUENO: la autoexclusión es solo para el lint del propio subsistema ==');
armar();
{
  const otro = path.join(BANCO, 'lint-otra-cosa');
  fs.mkdirSync(otro, { recursive: true });
  fs.writeFileSync(path.join(otro, 'README.md'), '# lint-otra-cosa\n\nNo es el lint de este subsistema.\n');
  const h = hallazgos(correr());
  const n = h['FUERA DEL INDICE'] || 0;
  console.log(`${n === 1 ? 'OK  ' : 'FALLA'} carpeta lint-otra-cosa/ → ${n} reclamo(s) (1 esperado: la autoexclusión no la cubre)`);
  if (n !== 1) malos++;
}

fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
console.log(`\ncasos: ${casos.length + 2}`);
console.log(malos ? `${malos} FALLARON.` : 'TODO VERDE.');
process.exit(malos ? 1 : 0);
