#!/usr/bin/env node
// Pruebas de la Pantalla de bienvenida.
//
// Lo que hay que proteger acá no es un conteo sino una FORMA: es lo primero que el usuario ve al
// abrir la sesión, y una caja desalineada por un dígito de más es el defecto típico. Por eso el
// control central compara el ancho de todos los renglones entre sí, en vez de contra un número fijo
// —el ancho es automático a propósito, para que no se desarme cuando una métrica gana dígitos—.
//
// El otro control que importa es la tolerancia: un repo sin identidad definida, o sin subsistemas,
// tiene que mostrar la pantalla igual y decirlo, no reventar. Esta pantalla corre en un hook de
// arranque: si falla, se lleva puesto el inicio de la sesión.
//
// Uso: node .claude/conducta/mostrar-pantalla-bienvenida/pruebas.js   (desde la raíz del repo)
const fs = require('fs'), path = require('path'), cp = require('child_process');
const PANTALLA = path.resolve('.claude/conducta/mostrar-pantalla-bienvenida/mostrar-pantalla-bienvenida.js');
const REPO_PRUEBA = path.resolve('.claude/tmp/repo-prueba-pantalla');

function correr(args = [], cwd = process.cwd()) {
  const r = cp.spawnSync(process.execPath, [PANTALLA, ...args], { cwd, encoding: 'utf8', timeout: 180000 });
  return { texto: (r.stdout || '') + (r.stderr || ''), codigo: r.status };
}
// Los renglones de la caja, sin la cerca de código con que se envuelve la salida.
const renglones = texto => texto.split(/\r?\n/).filter(l => /^[║╔╚╟]/.test(l));

let malos = 0;
const chequear = (nombre, condicion, detalle) => {
  console.log(`${condicion ? 'OK  ' : 'FALLA'} ${nombre}${detalle ? `  → ${detalle}` : ''}`);
  if (!condicion) malos++;
};

console.log('== LA CAJA NO SE DESARMA ==');
{
  const { texto, codigo } = correr(['--sin-lint']);
  const ren = renglones(texto);
  chequear('emite la caja', ren.length > 4 && codigo === 0, `${ren.length} renglones, código ${codigo}`);
  const anchos = [...new Set(ren.map(l => l.length))];
  chequear('todos los renglones tienen el mismo ancho',
    anchos.length === 1, anchos.length === 1 ? `${anchos[0]} caracteres` : `anchos distintos: ${anchos.join(', ')}`);
  chequear('cierra la caja', /^╚/.test(ren[ren.length - 1] || ''), ren[ren.length - 1] ? 'sí' : 'no hay último renglón');
}

console.log('\n== EL ANCHO ES AUTOMÁTICO ==');
// Un Propósito largo tiene que ensanchar la caja, no romperla: es la razón por la que el ancho no es
// fijo. Se arma un repo aparte para no tocar la identidad del repo real.
{
  fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
  fs.mkdirSync(path.join(REPO_PRUEBA, '.claude'), { recursive: true });
  // El Título sale del encabezado `#`, no de una línea con etiqueta: así lo lee la pantalla.
  fs.writeFileSync(path.join(REPO_PRUEBA, '.claude', 'identidad.md'),
    '# Un título deliberadamente largo para ensanchar la caja de bienvenida\n\n' +
    'Propósito: Verificar que el ancho se calcula sobre el renglón más largo y no sobre una constante\n');
  const { texto, codigo } = correr(['--sin-lint'], REPO_PRUEBA);
  const ren = renglones(texto);
  const anchos = [...new Set(ren.map(l => l.length))];
  chequear('con un título largo sigue pareja', anchos.length === 1 && codigo === 0,
    anchos.length === 1 ? `${anchos[0]} caracteres` : `anchos distintos: ${anchos.join(', ')}`);
}

console.log('\n== TOLERA LO QUE FALTA, NO REVIENTA ==');
{
  // repo sin identidad.md: tiene que mostrar la pantalla y decir que no está definida
  fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
  fs.mkdirSync(path.join(REPO_PRUEBA, '.claude'), { recursive: true });
  const { texto, codigo } = correr(['--sin-lint'], REPO_PRUEBA);
  chequear('un repo sin identidad definida no rompe', codigo === 0, `código ${codigo}`);
  chequear('  …y lo dice en vez de callarlo',
    /sin definir|no tiene/i.test(texto), texto.split('\n').find(l => /sin definir|no tiene/i.test(l))?.trim().slice(0, 70) || '(no lo dice)');
}
{
  // repo sin .claude/ en absoluto
  fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
  fs.mkdirSync(REPO_PRUEBA, { recursive: true });
  const { codigo } = correr(['--sin-lint'], REPO_PRUEBA);
  chequear('un repo sin .claude/ no rompe', codigo === 0, `código ${codigo}`);
}

console.log('\n== MIRA EL REPO QUE SE LE PASA ==');
// Regresion: si tomara el repo de su propia ubicacion, apuntada a otro repo mostraria las metricas
// del repo real en vez de las del pedido.
{
  fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
  fs.mkdirSync(path.join(REPO_PRUEBA, '.claude'), { recursive: true });
  fs.writeFileSync(path.join(REPO_PRUEBA, '.claude', 'identidad.md'),
    '# Titulo del repo apuntado\n\nPropósito: Verificar que la pantalla mira el repo pedido\n');
  const { texto } = correr([REPO_PRUEBA, '--sin-lint']);
  chequear('apuntada a otro repo muestra la identidad de ese repo',
    texto.includes('Titulo del repo apuntado'), texto.includes('Titulo del repo apuntado') ? 'sí' : 'muestra otra cosa');
  chequear('  …y no las métricas del repo real',
    !/43 decisiones|81 |48 pendientes/.test(texto), 'sin métricas del repo autor');
}

console.log('\n== EL PESO DEL CONTEXTO ==');
// Lo que se carga en cada sesión no lo vigilaba nadie y crece de a poco: cada índice liviano pesa nada
// por sí solo. El modelo de carga por manifiesto se decidió para bajarlo, y sin un número a la vista
// ese ahorro se vuelve a consumir sin que se note.
{
  const { texto } = correr(['--sin-lint']);
  chequear('informa el peso del contexto siempre cargado',
    /·\s+contexto\s+[\d.]+ KB en \d+ archivos/.test(texto),
    (texto.match(/[\d.]+ KB en \d+ archivos/) || ['(no lo informa)'])[0]);
  chequear('  …sin avisar si está dentro del presupuesto',
    !/pasa el presupuesto/.test(texto), 'dentro del presupuesto');
}
{
  // Un repo cuyo punto de entrada importa un archivo enorme: el aviso tiene que saltar.
  fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
  fs.mkdirSync(path.join(REPO_PRUEBA, '.claude'), { recursive: true });
  fs.writeFileSync(path.join(REPO_PRUEBA, '.claude', 'identidad.md'), '# Repo pesado\n\nPropósito: probar el presupuesto\n');
  fs.writeFileSync(path.join(REPO_PRUEBA, 'gordo.md'), 'x'.repeat(50 * 1024) + '\n');
  fs.writeFileSync(path.join(REPO_PRUEBA, 'CLAUDE.md'), '@gordo.md\n');
  const { texto } = correr(['--sin-lint'], REPO_PRUEBA);
  chequear('avisa cuando el contexto pasa el presupuesto',
    /pasa el presupuesto/.test(texto), (texto.match(/[\d.]+ KB en \d+ archivos[^║]*/) || ['(no avisa)'])[0].trim());
  const ren = renglones(texto);
  const anchos = [...new Set(ren.map(l => l.length))];
  chequear('  …y la caja sigue pareja con el aviso adentro', anchos.length === 1, `${anchos[0] || '?'} caracteres`);
}

console.log('\n== SALIDA PARA EL HOOK ==');
{
  const { texto, codigo } = correr(['--hook', '--sin-lint']);
  let json = null;
  try { json = JSON.parse(texto.trim()); } catch { /* se informa abajo */ }
  chequear('con --hook emite JSON con systemMessage',
    !!(json && typeof json.systemMessage === 'string' && json.systemMessage.length > 50),
    json ? `${(json.systemMessage || '').length} caracteres` : 'no es JSON');
  chequear('  …y sale 0', codigo === 0, `código ${codigo}`);
}

fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
console.log(`\ncasos: 15`);
console.log(malos ? `${malos} FALLARON.` : 'TODO VERDE.');
process.exit(malos ? 1 : 0);
