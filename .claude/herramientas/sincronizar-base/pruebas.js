#!/usr/bin/env node
// Pruebas de `sincronizar-base`.
//
// Esta Herramienta decide QUÉ VIAJA a cada Agente con Propósito, y su falla cara no es dejar algo
// sin copiar: es copiar de más. La regla es un corte —el mecanismo se copia entero, pero un registro
// `origen: agente-desplegado` solo hasta el separador de su tabla— y si ese corte fallara, las
// entradas de este repo nacerían adentro de todo repo que se instale. Ya pasó una vez: al sincronizar
// a mano un encabezado se colaron seis Herramientas.
//
// Por eso los casos vienen de a dos: lo que tiene que viajar entero viaja entero, y lo que tiene que
// cortarse se corta. Un banco que solo probara el corte no distinguiría un cortador que funciona de
// uno que trunca todo.
//
// Uso: node .claude/herramientas/sincronizar-base/pruebas.js   (desde la raíz del repo)
const fs = require('fs'), path = require('path'), cp = require('child_process');

const TOOL = path.resolve('.claude/herramientas/sincronizar-base/sincronizar-base.js');
const REPO_PRUEBA = path.resolve('.claude/tmp/repo-prueba-sincronizar');
const BASE_PRUEBA = path.join(REPO_PRUEBA, 'funcionalidades', 'x', 'skills', 'instalar', 'base');

let malos = 0, casos = 0;
function chequear(nombre, condicion, detalle) {
  casos++;
  console.log(`${condicion ? 'OK  ' : 'FALLA'} ${nombre}${detalle ? `  → ${detalle}` : ''}`);
  if (!condicion) malos++;
}

function correr(aplicar) {
  const args = aplicar ? ['--aplicar', REPO_PRUEBA] : [REPO_PRUEBA];
  const r = cp.spawnSync(process.execPath, [TOOL, ...args], { encoding: 'utf8', timeout: 60000 });
  return { texto: (r.stdout || '') + (r.stderr || ''), codigo: r.status };
}

// Una tabla con filas. El encabezado es lo que manda el Agente Multipropósito; las filas son lo que
// puebla cada repo, y son justamente las que no pueden viajar.
const tabla = (nota, filas) =>
  `${nota}\n\n| Código | Nombre |\n|---|---|\n${filas.map(f => `| ${f} |`).join('\n')}\n`;

const conFrontmatter = (origen, cuerpo) => `---\nindice: X\norigen: ${origen}\n---\n\n${cuerpo}`;

// Escribe el mismo archivo de los dos lados: `vivo` es lo que hay en `.claude/` y `viejo` lo que
// quedó en `base/`. La Herramienta solo toca lo que ya está en `base/`, así que los dos lados tienen
// que existir para que el archivo entre en juego.
function poner(rel, vivo, viejo) {
  for (const [raiz, txt] of [[path.join(REPO_PRUEBA, '.claude'), vivo], [BASE_PRUEBA, viejo]]) {
    if (txt === null) continue;
    const f = path.join(raiz, rel);
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, txt, 'utf8');
  }
}

const enBase = rel => fs.readFileSync(path.join(BASE_PRUEBA, rel), 'utf8');

function armar() {
  fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
  fs.mkdirSync(BASE_PRUEBA, { recursive: true });
  fs.mkdirSync(path.join(REPO_PRUEBA, '.claude'), { recursive: true });
}

console.log('== EL CORTE: QUÉ VIAJA ENTERO Y QUÉ SE CORTA ==');
armar();
poner('lint-x/lint-x.js', '// version nueva\n', '// version vieja\n');
poner('AMP.md', conFrontmatter('agente-multiproposito', tabla('Del Agente Multipropósito.', ['Base-0001 | uno'])),
                conFrontmatter('agente-multiproposito', tabla('Texto viejo.', [])));
poner('REPO.md', conFrontmatter('agente-desplegado', tabla('Convención nueva.', ['Local-0001 | algo del repo', 'Local-0002 | otra cosa'])),
                 conFrontmatter('agente-desplegado', tabla('Convención vieja.', [])));
{
  const { texto, codigo } = correr(true);
  chequear('corre y emite el informe', /SINCRONIZAR BASE/.test(texto) && codigo === 0, `código ${codigo}`);
  chequear('un archivo de mecanismo viaja entero',
    enBase('lint-x/lint-x.js').includes('version nueva'));
  chequear('un registro del Agente Multipropósito viaja entero, con sus filas',
    enBase('AMP.md').includes('Base-0001'));

  // El caso que justifica toda la Herramienta.
  const repo = enBase('REPO.md');
  chequear('un registro del Agente Desplegado viaja con el encabezado nuevo',
    repo.includes('Convención nueva'));
  chequear('y SIN las filas que puso el repo',
    !repo.includes('Local-0001') && !repo.includes('Local-0002'),
    repo.includes('Local-0001') ? 'se colaron las filas del repo' : 'ninguna fila viajó');
  chequear('pero conservando el separador, para que la tabla siga siendo una tabla',
    /\|\s*-+\s*\|/.test(repo));
  chequear('el informe avisa que de ese archivo viajó solo el encabezado',
    /REPO\.md\s*\(solo el encabezado\)/.test(texto));
}

console.log('\n== SIN --aplicar NO ESCRIBE ==');
{
  armar();
  poner('lint-x/lint-x.js', '// version nueva\n', '// version vieja\n');
  const antes = enBase('lint-x/lint-x.js');
  const { texto } = correr(false);
  chequear('informa lo que haría', /PARA SINCRONIZAR/.test(texto) && /lint-x/.test(texto));
  chequear('y no toca ningún archivo', enBase('lint-x/lint-x.js') === antes, 'base/ intacto');
}

console.log('\n== LO QUE NO PUEDE DECIDIR SOLO ==');
{
  // Sumar un archivo nuevo a lo que viaja es una decisión, no una copia: si `base/` no lo tiene,
  // la Herramienta no lo agrega. Al revés —está en `base/` y no en `.claude/`— sí se reporta,
  // porque falta el archivo del lado que manda.
  armar();
  poner('solo-en-base.md', null, '# quedó del lado que viaja\n');
  poner('solo-en-claude.md', '# nuevo, del lado vivo\n', null);
  const { texto } = correr(true);
  chequear('un archivo que viaja y ya no está en .claude/ se reporta',
    /VIAJAN Y NO ESTAN/.test(texto) && /solo-en-base\.md/.test(texto));
  chequear('un archivo nuevo de .claude/ NO se suma solo a lo que viaja',
    !fs.existsSync(path.join(BASE_PRUEBA, 'solo-en-claude.md')));
}
{
  // Un registro que se declara del repo pero no tiene tabla no se puede cortar. Copiarlo entero
  // mandaría su contenido a todos los consumidores, así que se reporta y no se toca.
  armar();
  poner('SIN-TABLA.md', conFrontmatter('agente-desplegado', 'Texto nuevo sin ninguna tabla.\n'),
                        conFrontmatter('agente-desplegado', 'Texto viejo.\n'));
  const { texto } = correr(true);
  chequear('un registro del repo sin tabla se reporta en vez de copiarse entero',
    /no se le encontro la tabla/i.test(texto) && !enBase('SIN-TABLA.md').includes('Texto nuevo'),
    enBase('SIN-TABLA.md').includes('Texto nuevo') ? 'se copió entero' : 'no se tocó');
}

console.log('\n== LA TRAMPA DEL BOM ==');
{
  // Un `.md` guardado con marca de orden de bytes deja de matchear el frontmatter, así que el
  // archivo pierde su `origen` y pasa a tratarse como mecanismo — o sea se copia ENTERO, con las
  // filas del repo adentro. Es la falla más cara de esta Herramienta y la más difícil de ver: el
  // archivo se lee igual en cualquier editor.
  armar();
  poner('CON-BOM.md', '﻿' + conFrontmatter('agente-desplegado', tabla('Convención nueva.', ['Local-0001 | fila del repo'])),
                      conFrontmatter('agente-desplegado', tabla('Convención vieja.', [])));
  correr(true);
  const r = enBase('CON-BOM.md');
  chequear('un registro del repo con BOM NO hace viajar sus filas',
    !r.includes('Local-0001'),
    r.includes('Local-0001') ? 'las filas del repo viajaron: el BOM tapó el origen' : 'el corte resistió el BOM');
}

fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
console.log(`\ncasos: ${casos}`);
console.log(malos ? `${malos} FALLARON.` : 'TODO VERDE.');
process.exit(malos ? 1 : 0);
