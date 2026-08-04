// Pruebas de la incorporación mecánica de Preferencias.
// Usa repos temporales bajo .claude/tmp/: nunca toca otro Agente real.
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

function raizRepo(desde) {
  let dir = path.resolve(desde);
  while (path.dirname(dir) !== dir) {
    if (fs.existsSync(path.join(dir, '.claude')) && fs.existsSync(path.join(dir, 'funcionalidades'))) return dir;
    dir = path.dirname(dir);
  }
  throw new Error('no se encontró la raíz del repo');
}

const REPO = raizRepo(__dirname);
const SCRIPT = path.join(__dirname, 'incorporar-preferencia.js');
const TMP = path.join(REPO, '.claude', 'tmp', 'pruebas-incorporar-preferencia');
const DESTINO = path.join(TMP, 'destino');
const DESTINO_2 = path.join(TMP, 'destino-2');
const FUENTE = path.join(TMP, 'fuente');
const CODIGO_REAL = 'Local-0006';

const cabecera = (origen, titulo) => `---
indice: ${titulo}
origen: ${origen}
columnas: [Código, Nombre, Descripción, Detalle]
descripcion: prueba
---

# ${titulo}

| Código | Nombre | Descripción | Detalle |
|--------|--------|-------------|---------|
`;

function escribir(archivo, texto) {
  fs.mkdirSync(path.dirname(archivo), { recursive: true });
  fs.writeFileSync(archivo, texto, 'utf8');
}

function armarDestino(filasLocales = '', destino = DESTINO) {
  fs.rmSync(destino, { recursive: true, force: true });
  const pref = path.join(destino, '.claude', 'preferencias');
  escribir(path.join(destino, 'AGENTS.md'), '# Prueba\n\n@.claude/preferencias/MANIFIESTO.md\n');
  escribir(path.join(pref, 'MANIFIESTO.md'), `# Preferencias — manifiesto de subsistema

**Índices:** \`PREFERENCIAS.md\` (Agente Multipropósito) · \`PREFERENCIAS-LOCAL.md\` (Agente Desplegado). **Se cargan siempre.**

@PREFERENCIAS.md
@PREFERENCIAS-LOCAL.md
`);
  escribir(path.join(pref, 'README.md'), '# Preferencias\n');
  escribir(path.join(pref, 'PREFERENCIAS.md'), cabecera('agente-multiproposito', 'Preferencias'));
  escribir(path.join(pref, 'PREFERENCIAS-LOCAL.md'), cabecera('agente-desplegado', 'Preferencias del Agente Desplegado') + filasLocales);
  fs.cpSync(path.join(REPO, '.claude', 'common'), path.join(destino, '.claude', 'common'), { recursive: true });
  fs.cpSync(path.join(REPO, '.claude', 'preferencias', 'lint-preferencias'), path.join(pref, 'lint-preferencias'), { recursive: true });
}

function armarFuente(conDetalle = true) {
  fs.rmSync(FUENTE, { recursive: true, force: true });
  const pref = path.join(FUENTE, '.claude', 'preferencias');
  escribir(path.join(pref, 'PREFERENCIAS.md'), cabecera('agente-multiproposito', 'Preferencias')
    + '| Base-0006 | Analizar antes de construir | Primero entender el problema. | [detalle.md](detalle.md) |\n');
  escribir(path.join(pref, 'PREFERENCIAS-LOCAL.md'), cabecera('agente-desplegado', 'Preferencias del Agente Desplegado'));
  if (conDetalle) escribir(path.join(pref, 'detalle.md'), '# Detalle\n\nAmplía la Preferencia Base-0006.\n');
}

function correr(args) {
  const r = cp.spawnSync(process.execPath, [SCRIPT, ...args], { cwd: REPO, encoding: 'utf8' });
  let json;
  try { json = JSON.parse(r.stdout); } catch { json = { estado: 'salida-invalida', stdout: r.stdout, stderr: r.stderr }; }
  return { ...r, json };
}

let fallas = 0, casos = 0;
function caso(nombre, fn) {
  casos++;
  try {
    fn();
    console.log(`OK    ${nombre}`);
  } catch (e) {
    fallas++;
    console.log(`FALLA ${nombre}\n      ${e.message}`);
  }
}
const exigir = (condicion, mensaje) => { if (!condicion) throw new Error(mensaje); };

caso('vista previa de la Preferencia Local-0006 no modifica el destino', () => {
  armarDestino();
  const antes = fs.readFileSync(path.join(DESTINO, '.claude', 'preferencias', 'PREFERENCIAS-LOCAL.md'), 'utf8');
  const r = correr(['--fuente', REPO, '--codigo', CODIGO_REAL, '--destino', DESTINO]);
  exigir(r.status === 0 && r.json.estado === 'agregado', JSON.stringify(r.json));
  exigir(r.json.entrada.codigo === 'Local-0001', 'no asignó Local-0001');
  exigir(fs.readFileSync(path.join(DESTINO, '.claude', 'preferencias', 'PREFERENCIAS-LOCAL.md'), 'utf8') === antes, 'la vista previa escribió el Índice');
  exigir(!fs.existsSync(path.join(DESTINO, '.claude', 'preferencias', 'analizar-y-disenar-de-alto-a-bajo-nivel.md')), 'la vista previa copió el detalle');
});

caso('copia Local-0006 a dos Agentes temporales con detalle y lint verde', () => {
  for (const destino of [DESTINO, DESTINO_2]) {
    armarDestino('', destino);
    const r = correr(['--fuente', REPO, '--codigo', `Preferencia ${CODIGO_REAL}`, '--destino', destino, '--aplicar']);
    exigir(r.status === 0 && r.json.estado === 'agregado', JSON.stringify(r.json));
    const idx = fs.readFileSync(path.join(destino, '.claude', 'preferencias', 'PREFERENCIAS-LOCAL.md'), 'utf8');
    exigir(idx.includes('| Local-0001 | Analizar y diseñar de alto a bajo nivel |'), 'no incorporó la fila local');
    exigir(fs.existsSync(path.join(destino, '.claude', 'preferencias', 'analizar-y-disenar-de-alto-a-bajo-nivel.md')), 'no copió la página de detalle');
    const lint = cp.spawnSync(process.execPath, [path.join(destino, '.claude', 'preferencias', 'lint-preferencias', 'lint-preferencias.js'), path.join(destino, '.claude')], { cwd: destino, encoding: 'utf8' });
    exigir(/hallazgos: 0/.test(lint.stdout), lint.stdout + lint.stderr);
  }
});

caso('la segunda corrida da ya estaba y no duplica', () => {
  armarDestino();
  correr(['--fuente', REPO, '--codigo', CODIGO_REAL, '--destino', DESTINO, '--aplicar']);
  const archivo = path.join(DESTINO, '.claude', 'preferencias', 'PREFERENCIAS-LOCAL.md');
  const antes = fs.readFileSync(archivo, 'utf8');
  const r = correr(['--fuente', REPO, '--codigo', CODIGO_REAL, '--destino', DESTINO, '--aplicar']);
  exigir(r.status === 0 && r.json.estado === 'ya estaba', JSON.stringify(r.json));
  exigir(fs.readFileSync(archivo, 'utf8') === antes, 'modificó el Índice en la segunda corrida');
});

caso('asigna máximo más uno aunque haya huecos o colisión con la fuente', () => {
  armarDestino('| Local-0001 | Otra | Una. | — |\n| Local-0042 | Última | Otra. | — |\n');
  const r = correr(['--fuente', REPO, '--codigo', CODIGO_REAL, '--destino', DESTINO]);
  exigir(r.json.estado === 'agregado' && r.json.entrada.codigo === 'Local-0043', JSON.stringify(r.json));
});

caso('el mismo tema con contenido distinto da divergente y no pisa', () => {
  armarDestino('| Local-0001 | Analizar y diseñar de alto a bajo nivel | Implementar primero. | — |\n');
  const archivo = path.join(DESTINO, '.claude', 'preferencias', 'PREFERENCIAS-LOCAL.md');
  const antes = fs.readFileSync(archivo, 'utf8');
  const r = correr(['--fuente', REPO, '--codigo', CODIGO_REAL, '--destino', DESTINO, '--aplicar']);
  exigir(r.status === 0 && r.json.estado === 'divergente', JSON.stringify(r.json));
  exigir(fs.readFileSync(archivo, 'utf8') === antes, 'pisó la divergencia');
});

caso('una colisión de nombre de archivo da divergente y no escribe', () => {
  armarDestino();
  const detalle = path.join(DESTINO, '.claude', 'preferencias', 'analizar-y-disenar-de-alto-a-bajo-nivel.md');
  escribir(detalle, '# Otro contenido\n');
  const r = correr(['--fuente', REPO, '--codigo', CODIGO_REAL, '--destino', DESTINO, '--aplicar']);
  exigir(r.status === 0 && r.json.estado === 'divergente', JSON.stringify(r.json));
  const idx = fs.readFileSync(path.join(DESTINO, '.claude', 'preferencias', 'PREFERENCIAS-LOCAL.md'), 'utf8');
  exigir(!idx.includes('Local-0001'), 'escribió la fila pese a la colisión del detalle');
  exigir(fs.readFileSync(detalle, 'utf8') === '# Otro contenido\n', 'pisó el detalle divergente');
});

caso('un detalle ausente en la fuente se rechaza', () => {
  armarDestino();
  armarFuente(false);
  const r = correr(['--fuente', FUENTE, '--codigo', 'Base-0006', '--destino', DESTINO]);
  exigir(r.status === 1 && r.json.estado === 'rechazado' && /ausente/.test(r.json.motivo), JSON.stringify(r.json));
});

caso('repara referencias al Código de la fuente dentro del detalle', () => {
  armarDestino();
  armarFuente(true);
  const r = correr(['--fuente', FUENTE, '--codigo', 'Base-0006', '--destino', DESTINO, '--aplicar']);
  exigir(r.status === 0 && r.json.estado === 'agregado', JSON.stringify(r.json));
  const detalle = fs.readFileSync(path.join(DESTINO, '.claude', 'preferencias', 'detalle.md'), 'utf8');
  exigir(detalle.includes('Preferencia Local-0001') && !detalle.includes('Base-0006'), detalle);
});

caso('acepta una preferencia nueva como propuesta JSON', () => {
  armarDestino();
  const propuesta = path.join(TMP, 'propuesta.json');
  escribir(propuesta, JSON.stringify({ nombre: 'Explicar el motivo', descripcion: 'Explicar por qué se recomienda una alternativa.', detalle: null, procedencia: { tipo: 'texto del usuario' } }, null, 2));
  const r = correr(['--propuesta', propuesta, '--destino', DESTINO, '--aplicar']);
  exigir(r.status === 0 && r.json.estado === 'agregado', JSON.stringify(r.json));
  const idx = fs.readFileSync(path.join(DESTINO, '.claude', 'preferencias', 'PREFERENCIAS-LOCAL.md'), 'utf8');
  exigir(idx.includes('| Local-0001 | Explicar el motivo |'), 'no incorporó la propuesta');
});

caso('rechaza dependencias locales del detalle que esta versión no copia', () => {
  armarDestino();
  const propuesta = path.join(TMP, 'propuesta-con-dependencia.json');
  escribir(propuesta, JSON.stringify({
    nombre: 'Conservar una guía', descripcion: 'Seguir la guía declarada.',
    detalle: { archivo: 'guia.md', contenido: '# Guía\n\nVer [anexo](anexo.md).\n' },
    procedencia: { tipo: 'texto del usuario' },
  }, null, 2));
  const r = correr(['--propuesta', propuesta, '--destino', DESTINO, '--aplicar']);
  exigir(r.status === 1 && r.json.estado === 'rechazado' && /dependencias locales/.test(r.json.motivo), JSON.stringify(r.json));
  exigir(!fs.existsSync(path.join(DESTINO, '.claude', 'preferencias', 'guia.md')), 'copió un detalle incompleto');
});

// El catálogo de Recomendadas es un directorio con la forma de preferencias/ pero sin repo alrededor:
// si --catalogo se resolviera como un repo, buscaría un .claude/preferencias/ que no existe.
caso('adopta del catálogo de Recomendadas, que no es un repo', () => {
  armarDestino();
  const catalogo = path.join(TMP, 'recomendadas');
  fs.mkdirSync(catalogo, { recursive: true });
  escribir(path.join(catalogo, 'RECOMENDADAS.md'), [
    '---', 'indice: preferencias', 'origen: agente-multiproposito',
    'columnas: Código, Nombre, Descripción, Detalle', '---', '',
    '# Preferencias Recomendadas', '',
    '| Código | Nombre | Descripción | Detalle |',
    '|--------|--------|-------------|---------|',
    '| Base-0002 | Enumerar en bullets | Tres o más elementos van en lista. | [bullets.md](bullets.md) |',
    '',
  ].join('\n'));
  escribir(path.join(catalogo, 'bullets.md'), '# Bullets\n\nElaboración de la Preferencia Base-0002.\n');

  const r = correr(['--catalogo', catalogo, '--codigo', 'Base-0002', '--destino', DESTINO, '--aplicar']);
  exigir(r.status === 0 && r.json.estado === 'agregado', JSON.stringify(r.json));
  const idx = fs.readFileSync(path.join(DESTINO, '.claude', 'preferencias', 'PREFERENCIAS-LOCAL.md'), 'utf8');
  exigir(idx.includes('| Local-0001 | Enumerar en bullets |'), 'no incorporó la recomendada');
  const detalle = fs.readFileSync(path.join(DESTINO, '.claude', 'preferencias', 'bullets.md'), 'utf8');
  exigir(detalle.includes('Preferencia Local-0001') && !detalle.includes('Base-0002'), detalle);

  const segunda = correr(['--catalogo', catalogo, '--codigo', 'Base-0002', '--destino', DESTINO, '--aplicar']);
  exigir(segunda.json.estado === 'ya estaba', JSON.stringify(segunda.json));
});

caso('no acepta --fuente y --catalogo a la vez', () => {
  armarDestino();
  const r = correr(['--fuente', FUENTE, '--catalogo', TMP, '--codigo', 'Base-0006', '--destino', DESTINO]);
  exigir(r.status === 1 && r.json.estado === 'rechazado' && /no ambos/.test(r.json.motivo), JSON.stringify(r.json));
});

fs.rmSync(TMP, { recursive: true, force: true });
console.log(`\ncasos: ${casos}`);
console.log(fallas ? `${fallas} FALLARON.` : 'TODO VERDE.');
process.exit(fallas ? 1 : 0);
