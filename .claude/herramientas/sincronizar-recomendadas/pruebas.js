#!/usr/bin/env node
// Banco de sincronizar-recomendadas. Cada caso siembra un defecto y exige que el control lo marque:
// un caso que pasa en verde sin ejercitar nada es un control apagado, no un control sano.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const HERRAMIENTA = path.join(__dirname, 'sincronizar-recomendadas.js');
const RELATIVO_CATALOGO = path.join(
  'funcionalidades', 'amp-preferencias', 'skills', 'adoptar-recomendadas', 'recomendadas');

let malos = 0;
const ok = (nombre, cond, extra) => {
  console.log(`${cond ? 'OK   ' : 'FALLA'} ${nombre}${cond || !extra ? '' : `  → ${extra}`}`);
  if (!cond) malos++;
};

const INDICE_LOCAL = `---
indice: preferencias
origen: agente-desplegado
columnas: Código, Nombre, Descripción, Detalle
---

# Preferencias del Agente Desplegado

| Código | Nombre | Descripción | Detalle |
|--------|--------|-------------|---------|
| Local-0001 | Usar fechas en formato argentino | \`DD/MM/AAAA\` al conversar. | — |
| Local-0004 | Diseñar de alto a bajo nivel | Entender el problema antes de implementar. | [disenar.md](disenar.md) |
`;

const INDICE_BASE = `---
indice: preferencias
origen: agente-multiproposito
columnas: Código, Nombre, Descripción, Detalle
---

# Preferencias

| Código | Nombre | Descripción | Detalle |
|--------|--------|-------------|---------|
| Base-0003 | Mostrar el texto exacto | Antes de escribir en un registro canónico. | — |
`;

function repoDePrueba() {
  const raiz = fs.mkdtempSync(path.join(os.tmpdir(), 'reco-'));
  const preferencias = path.join(raiz, '.claude', 'preferencias');
  fs.mkdirSync(preferencias, { recursive: true });
  fs.writeFileSync(path.join(preferencias, 'PREFERENCIAS-LOCAL.md'), INDICE_LOCAL, 'utf8');
  fs.writeFileSync(path.join(preferencias, 'PREFERENCIAS.md'), INDICE_BASE, 'utf8');
  fs.writeFileSync(path.join(preferencias, 'disenar.md'),
    '# Diseñar\n\nElaboración de la Preferencia Local-0004.\n', 'utf8');
  return raiz;
}

function correr(raiz, aplicar) {
  const args = [HERRAMIENTA];
  if (aplicar) args.push('--aplicar');
  args.push(raiz);
  try {
    return { codigo: 0, salida: execFileSync('node', args, { encoding: 'utf8' }) };
  } catch (e) {
    return { codigo: e.status === undefined ? 1 : e.status, salida: `${e.stdout || ''}${e.stderr || ''}` };
  }
}

const leerCatalogo = raiz =>
  fs.readFileSync(path.join(raiz, RELATIVO_CATALOGO, 'RECOMENDADAS.md'), 'utf8');

// --- caso bueno: genera el catálogo desde el Índice del Agente Desplegado ---
{
  const raiz = repoDePrueba();
  const previo = correr(raiz, false);
  ok('sin catálogo todavía → avisa y sale con 1', previo.codigo === 1, `codigo: ${previo.codigo}`);

  const r = correr(raiz, true);
  ok('genera el catálogo', r.codigo === 0, r.salida);
  const texto = leerCatalogo(raiz);
  ok('renumera desde Base-0001', texto.includes('| Base-0001 | Usar fechas en formato argentino'));
  ok('renumera la segunda como Base-0002', texto.includes('| Base-0002 | Diseñar de alto a bajo nivel'));
  ok('no filtra Códigos del Agente Desplegado', !texto.includes('Local-0001') && !texto.includes('Local-0004'));
  ok('declara el frontmatter que lo vuelve legible por el motor',
    /^---\n[\s\S]*indice: preferencias[\s\S]*origen: agente-multiproposito[\s\S]*\n---/.test(texto));
  ok('copia la página de detalle', fs.existsSync(path.join(raiz, RELATIVO_CATALOGO, 'disenar.md')));
  ok('repara el Código dentro del detalle',
    fs.readFileSync(path.join(raiz, RELATIVO_CATALOGO, 'disenar.md'), 'utf8').includes('Preferencia Base-0002'));
  ok('no deja el Código viejo en el detalle',
    !fs.readFileSync(path.join(raiz, RELATIVO_CATALOGO, 'disenar.md'), 'utf8').includes('Local-0004'));

  const segunda = correr(raiz, false);
  ok('segunda corrida sin cambios → verde', segunda.codigo === 0, `codigo: ${segunda.codigo}`);
  ok('informa que no hay nada para sincronizar', /\[PARA SINCRONIZAR\] \(0\)/.test(segunda.salida));
  fs.rmSync(raiz, { recursive: true, force: true });
}

// --- el catálogo quedó viejo: el Índice cambió y nadie regeneró ---
{
  const raiz = repoDePrueba();
  correr(raiz, true);
  const indice = path.join(raiz, '.claude', 'preferencias', 'PREFERENCIAS-LOCAL.md');
  fs.writeFileSync(indice, fs.readFileSync(indice, 'utf8')
    .replace('`DD/MM/AAAA` al conversar.', 'Otro texto que nadie propagó.'), 'utf8');
  const r = correr(raiz, false);
  ok('detecta que el catálogo quedó viejo', r.codigo === 1 && /RECOMENDADAS\.md/.test(r.salida), r.salida);
  correr(raiz, true);
  ok('al aplicar, lo pone al día', leerCatalogo(raiz).includes('Otro texto que nadie propagó.'));
  fs.rmSync(raiz, { recursive: true, force: true });
}

// --- una fila que sale del Índice tiene que salir del catálogo ---
{
  const raiz = repoDePrueba();
  correr(raiz, true);
  const indice = path.join(raiz, '.claude', 'preferencias', 'PREFERENCIAS-LOCAL.md');
  fs.writeFileSync(indice, fs.readFileSync(indice, 'utf8')
    .split('\n').filter(l => !l.startsWith('| Local-0004 ')).join('\n'), 'utf8');
  const r = correr(raiz, true);
  ok('retira del catálogo la página que ya nadie declara',
    r.codigo === 0 && !fs.existsSync(path.join(raiz, RELATIVO_CATALOGO, 'disenar.md')), r.salida);
  ok('y retira su fila', !leerCatalogo(raiz).includes('Diseñar de alto a bajo nivel'));
  fs.rmSync(raiz, { recursive: true, force: true });
}

// --- defectos que tienen que frenar la generación ---
{
  const raiz = repoDePrueba();
  const indice = path.join(raiz, '.claude', 'preferencias', 'PREFERENCIAS-LOCAL.md');
  fs.writeFileSync(indice, fs.readFileSync(indice, 'utf8')
    .replace('[disenar.md](disenar.md)', '[ausente.md](ausente.md)'), 'utf8');
  const r = correr(raiz, true);
  ok('frena si una fila declara un detalle que no existe',
    r.codigo === 1 && /detalle ausente/.test(r.salida), r.salida);
  fs.rmSync(raiz, { recursive: true, force: true });
}

{
  const raiz = repoDePrueba();
  const indice = path.join(raiz, '.claude', 'preferencias', 'PREFERENCIAS-LOCAL.md');
  fs.writeFileSync(indice, fs.readFileSync(indice, 'utf8')
    .split('\n').filter(l => !/^\| Local-/.test(l)).join('\n'), 'utf8');
  const r = correr(raiz, true);
  ok('frena si el Índice del Agente Desplegado no tiene filas',
    r.codigo === 1 && /no tiene filas/.test(r.salida), r.salida);
  fs.rmSync(raiz, { recursive: true, force: true });
}

{
  const raiz = repoDePrueba();
  fs.rmSync(path.join(raiz, '.claude', 'preferencias', 'PREFERENCIAS-LOCAL.md'));
  const r = correr(raiz, true);
  ok('frena si no hay Índice del Agente Desplegado',
    r.codigo === 1 && /agente-desplegado/.test(r.salida), r.salida);
  fs.rmSync(raiz, { recursive: true, force: true });
}

// --- el catálogo no se alimenta del Índice del Agente Multipropósito ---
{
  const raiz = repoDePrueba();
  correr(raiz, true);
  ok('no publica las Preferencias del Agente Multipropósito del repo fuente',
    !leerCatalogo(raiz).includes('Mostrar el texto exacto'));
  fs.rmSync(raiz, { recursive: true, force: true });
}

console.log(`\ncasos: 17`);
if (malos) {
  console.log(`${malos} FALLARON.`);
  process.exitCode = 1;
} else {
  console.log('TODO VERDE.');
}
