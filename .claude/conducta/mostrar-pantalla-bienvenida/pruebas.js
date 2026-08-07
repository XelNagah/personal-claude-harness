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

// El peso del contexto siempre cargado NO se mide acá: es una vigilancia del repo que publica el
// Agente Multipropósito, no algo que le sirva a un Agente Desplegado, y su tope no es suyo para
// mover. Vive en la Herramienta local `medir-contexto`, con su propio banco.

console.log('\n== SALIDA PARA EL HOOK ==');
{
  const { texto, codigo } = correr(['--hook', '--sin-lint']);
  let json = null;
  try { json = JSON.parse(texto.trim()); } catch { /* se informa abajo */ }
  chequear('con --hook emite JSON con systemMessage',
    !!(json && typeof json.systemMessage === 'string' && json.systemMessage.length > 50),
    json ? `${(json.systemMessage || '').length} caracteres` : 'no es JSON');
  chequear('  …y sale 0', codigo === 0, `código ${codigo}`);
  // Regresión: el CLI antepega "SessionStart:startup says: " al PRIMER renglón del systemMessage. Ese
  // renglón NO puede ser el borde de la caja (╔): quedaría corrido a la derecha. Tiene que ser un
  // rótulo de texto plano, con la caja arrancando en el renglón 2. Que la caja siga estando igual.
  const primerRenglon = (json?.systemMessage || '').replace(/^\n+/, '').split('\n')[0] || '';
  chequear('  …y el primer renglón es un rótulo, no el borde de la caja',
    !/^[║╔╚╟]/.test(primerRenglon) && primerRenglon.trim().length > 0, `«${primerRenglon.slice(0, 40)}»`);
  chequear('  …y la caja sigue presente debajo',
    /^╔/m.test(json?.systemMessage || ''), /^╔/m.test(json?.systemMessage || '') ? 'sí' : 'no hay caja');
  // El modelo NO ve el systemMessage: el estado le tiene que llegar por additionalContext, en texto
  // plano (sin la caja ASCII). Regresión de la negación de hallazgos: la Pantalla los mostraba al
  // usuario y el agente los desconocía.
  const ac = json?.hookSpecificOutput?.additionalContext || '';
  chequear('  …y emite additionalContext para el modelo con Título y Propósito',
    /Título:/.test(ac) && /Propósito:/.test(ac), ac ? `${ac.length} caracteres` : 'no hay');
  chequear('  …sin la caja ASCII (ruido para el modelo)',
    !/[║╔╚╟]/.test(ac), /[║╔╚╟]/.test(ac) ? 'trae bordes' : 'texto plano');
  chequear('  …y con --sin-lint dice que no corrió y no arma detalle',
    /Lint: sin correr/.test(ac) && !/Detalle del lint/.test(ac), ac.split('\n').find(l => /Lint/.test(l))?.trim() || '(sin línea de lint)');
}

console.log('\n== ESTADO AL MODELO: VERDE VS. CON HALLAZGOS ==');
// El detalle del lint va SOLO cuando hay hallazgos. Se arman dos repos mínimos con un subsistema y
// su lint co-ubicado: uno cuyo lint sale limpio (verde) y otro cuyo lint reporta hallazgos. La
// Pantalla los descubre por el lint co-ubicado, igual que en el repo real.
function repoConLint(cuerpoLint) {
  fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
  const dirLint = path.join(REPO_PRUEBA, '.claude', 'demo', 'lint-demo');
  fs.mkdirSync(dirLint, { recursive: true });
  fs.writeFileSync(path.join(REPO_PRUEBA, '.claude', 'identidad.md'),
    '# Repo de prueba\n\nPropósito: Probar el estado al modelo\n');
  fs.writeFileSync(path.join(dirLint, 'lint-demo.js'), cuerpoLint);
}
function acDe(texto) { try { return (JSON.parse(texto.trim()).hookSpecificOutput || {}).additionalContext || ''; } catch { return ''; } }
{
  // verde: el lint no reporta ningún total `(N)`
  repoConLint('console.log("demo: TODO VERDE");\n');
  const { texto } = correr(['--hook'], REPO_PRUEBA);
  const ac = acDe(texto);
  chequear('en verde el additionalContext no trae detalle del lint',
    /Lint: ✔ 0 hallazgos/.test(ac) && !/Detalle del lint/.test(ac), ac.split('\n').find(l => /Lint/.test(l))?.trim() || '(sin línea de lint)');
}
{
  // con hallazgos: el lint reporta un total `(3)` al final de una línea
  repoConLint('console.log("problema detectado en demo (3)");\n');
  const { texto } = correr(['--hook'], REPO_PRUEBA);
  const ac = acDe(texto);
  chequear('con hallazgos suma el detalle del subsistema',
    /Detalle del lint/.test(ac) && /── demo \(3 hallazgos\)/.test(ac), ac.includes('── demo') ? 'lista demo' : 'no lista el detalle');
  chequear('  …con el texto real del lint (no re-corrido, ya del arranque)',
    /problema detectado en demo/.test(ac), /problema detectado en demo/.test(ac) ? 'sí' : 'no trae el texto del lint');
}
{
  // Identidad faltante: el pedido se SUMA al estado, no lo pisa.
  fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
  fs.mkdirSync(path.join(REPO_PRUEBA, '.claude'), { recursive: true });
  const { texto } = correr(['--hook', '--sin-lint'], REPO_PRUEBA);
  const ac = acDe(texto);
  chequear('sin Identidad el additionalContext trae el estado Y el pedido',
    /Título:/.test(ac) && /identidad\.md/.test(ac), ac ? 'ambos' : 'no hay additionalContext');
}

console.log('\n== EL CHEQUEO DE PLUGINS NO SE ESPERA ==');
// Con --hook se lanza en segundo plano el chequeo de plugins, que tarda ~1,7 s y sin red se va al
// vencimiento del plazo. Lo que se fija es que la Pantalla NO LO ESPERE: si algún día se lo llamara
// de forma síncrona, el síntoma sería un arranque lento y nadie lo ataría a este cambio.
{
  const antes = Date.now();
  const { codigo } = correr(['--hook', '--sin-lint']);
  const tardo = Date.now() - antes;
  chequear('con --hook la Pantalla sale sin esperar el chequeo', tardo < 1500, `${tardo} ms`);
  chequear('  …y sale 0 igual', codigo === 0, `código ${codigo}`);
}

fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
console.log(`\ncasos: 26`);
console.log(malos ? `${malos} FALLARON.` : 'TODO VERDE.');
process.exit(malos ? 1 : 0);
