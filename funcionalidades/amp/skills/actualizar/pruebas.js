#!/usr/bin/env node
// Pruebas de `amp-actualizar.js`, el motor mecánico del nivelador.
//
// Este script decide si un Agente con Propósito está al día, y su falla cara no es un error: es
// contestar «ya estaba» sobre algo que quedó viejo. Un repo informado al día no se vuelve a mirar,
// así que un chequeo apagado acá se lleva puesta la versión de todos los repos instalados.
//
// Por eso cada caso viene de a dos: el detector tiene que MARCAR lo que está mal y CALLARSE sobre lo
// que está bien. Un banco que solo prueba el caso malo no distingue un detector que funciona de uno
// que marca siempre; uno que solo prueba el bueno no distingue el que funciona del que quedó mudo.
//
// LÍMITE DECLARADO: se prueban los dos modos que este script tiene —el detector y `--respaldo`—,
// que es todo lo que hace. Lo que NO se prueba acá es la APLICACIÓN: pisar el archivo y cortar por
// el separador de la tabla lo ejecuta el agente leyendo el `SKILL.md`, no este script, y ninguna
// prueba automática lo alcanza. Se verificó a mano en el plan `Local-0084`.
//
// Uso: node funcionalidades/amp/skills/actualizar/pruebas.js   (desde la raíz del repo)
const fs = require('fs'), path = require('path'), cp = require('child_process');

const NIVELADOR = path.resolve('funcionalidades/amp/skills/actualizar/amp-actualizar.js');
const BASE = path.resolve('funcionalidades/amp/skills/inicializar/base');
const REPO_PRUEBA = path.resolve('.claude/tmp/repo-prueba-nivelador');

let malos = 0, casos = 0;
function chequear(nombre, condicion, detalle) {
  casos++;
  console.log(`${condicion ? 'OK  ' : 'FALLA'} ${nombre}${detalle ? `  → ${detalle}` : ''}`);
  if (!condicion) malos++;
}

function correr(rutaRepo, modo) {
  const args = [modo || '--vista-previa'];
  if (rutaRepo) args.push(rutaRepo);
  const r = cp.spawnSync(process.execPath, [NIVELADOR, ...args], { encoding: 'utf8', timeout: 180000 });
  return { texto: (r.stdout || '') + (r.stderr || ''), codigo: r.status };
}

// Un Agente con Propósito recién instalado y al día: el árbol de `base/` colgado de `.claude/`, que
// es contra lo que el propio nivelador compara. Es el punto de partida de casi todos los casos: se
// arma al día y se lo rompe de a una cosa por vez, para que lo que marque sea atribuible.
function armarAlDia() {
  fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
  fs.mkdirSync(REPO_PRUEBA, { recursive: true });
  fs.cpSync(BASE, path.join(REPO_PRUEBA, '.claude'), { recursive: true });
  for (const c of ['pendientes', 'ejecutados', 'descartados']) {
    fs.mkdirSync(path.join(REPO_PRUEBA, '.claude', 'planes', c), { recursive: true });
  }
  // El Título y el Propósito se preguntan al instalar; sin este archivo todo repo marca uno.
  fs.writeFileSync(path.join(REPO_PRUEBA, '.claude', 'identidad.md'),
    '# Repo de prueba\n\nPropósito: ejercitar el nivelador.\n');
  cablearHooks();
  ignorarTemporales();
}

// Tampoco se copia de `base/`: se fusiona con el `.gitignore` que el repo ya tenga. Un repo al día
// ignora las dos rutas donde escribe el mecanismo — si no, versiona el buzón de avisos en cada
// commit y contradice la premisa de los lints que excluyen `.claude/tmp/` de su barrido.
function ignorarTemporales() {
  fs.writeFileSync(path.join(REPO_PRUEBA, '.gitignore'),
    '.claude/settings.local.json\n.claude/tmp/\n');
}

// Los hooks no se copian de `base/`: se fusionan con los que el repo ya tenga, así que un repo al
// día los tiene cableados aunque su árbol de archivos esté completo. Registro doble —Claude Code y
// Codex— y los tres eventos, que es lo que el detector mira.
function cablearHooks() {
  const entrada = { type: 'command', command: 'node .claude/conducta/establecer-conducta/establecer-conducta.js' };
  const cfg = {
    hooks: {
      SessionStart: [{ hooks: [entrada] }],
      UserPromptSubmit: [{ hooks: [entrada] }],
      PreToolUse: [{ matcher: 'Write|Edit', hooks: [entrada] }],
    },
  };
  fs.writeFileSync(path.join(REPO_PRUEBA, '.claude', 'settings.json'), JSON.stringify(cfg, null, 2));
  fs.mkdirSync(path.join(REPO_PRUEBA, '.codex'), { recursive: true });
  fs.writeFileSync(path.join(REPO_PRUEBA, '.codex', 'hooks.json'), JSON.stringify(cfg, null, 2));
}

const claude = f => path.join(REPO_PRUEBA, '.claude', f);
const leer = f => fs.readFileSync(claude(f), 'utf8');
const escribir = (f, t) => fs.writeFileSync(claude(f), t);

// Marca de un ítem en el reporte: alcanza con que su ruta y su motivo aparezcan en la misma línea.
function marca(texto, item, motivo) {
  return texto.split(/\r?\n/).some(l => l.includes(item) && (!motivo || l.includes(motivo)));
}

console.log('== EL REPO AL DÍA NO SE MARCA ==');
// Si esto fallara, todo lo de abajo daría un falso verde: el detector estaría marcando de más y
// cualquier caso malo «pasaría» sin que su rotura tenga nada que ver.
armarAlDia();
{
  const { texto, codigo } = correr(REPO_PRUEBA);
  chequear('corre y emite el reporte', /amp-actualizar/.test(texto) && codigo === 0, `código ${codigo}`);
  // El cierre en verde tiene frase propia, distinta del total que imprime cuando hay algo que hacer.
  chequear('un repo al día cierra sin nada para nivelar',
    /Repo al d[ií]a: nada para nivelar/.test(texto),
    (texto.match(/Total de acciones propuestas: \d+/) || ['sin acciones propuestas'])[0]);
  chequear('informa los ocho subsistemas como ya estaban', /YA ESTABA[\s\S]*conducta/.test(texto));
}

console.log('\n== CONTENIDO: LO VIEJO SE MARCA, LO PROPIO DEL REPO NO ==');
{
  // Caso malo: un archivo de mecanismo en la versión de cuando se instaló. Es el caso más frecuente
  // al poner al día un repo, y el que justifica comparar contenido en vez de sola presencia: un
  // consumidor que ya tiene el script viejo se lo queda para siempre.
  armarAlDia();
  escribir('conocimiento/lint-conocimiento/lint-conocimiento.js', '// version vieja\n');
  const { texto } = correr(REPO_PRUEBA);
  chequear('un archivo de mecanismo desactualizado se marca como contenido viejo',
    marca(texto, 'lint-conocimiento.js', 'contenido viejo'));
}
{
  // Caso bueno, y el que más importa: el repo agregó filas a un registro suyo. Si esto se marcara,
  // el nivelador propondría pisar el Aprendizaje del repo.
  armarAlDia();
  escribir('semantica/GLOSARIO.md', leer('semantica/GLOSARIO.md').trimEnd() +
    '\n| Local-0001 | Bulto | Cada unidad que se cotiza por separado | — | — |\n');
  const { texto } = correr(REPO_PRUEBA);
  chequear('las filas que agrega el repo a un registro suyo NO se marcan',
    !marca(texto, 'GLOSARIO.md'),
    (texto.split(/\r?\n/).find(l => l.includes('GLOSARIO.md')) || 'ninguna línea lo nombra').trim());
}
{
  // Caso malo del mismo archivo: lo de ARRIBA de la tabla es del Agente Multipropósito y cambia con
  // él. Sin esto, un repo instalado hace tres versiones lee una convención que ya no rige.
  armarAlDia();
  const t = leer('semantica/GLOSARIO.md').split(/\r?\n/);
  const sep = t.findIndex(l => /^\|[\s\-:|]+\|\s*$/.test(l));
  t.splice(sep - 1, 0, '> Convención vieja: las entradas se numeran por posición.', '');
  escribir('semantica/GLOSARIO.md', t.join('\n'));
  const { texto } = correr(REPO_PRUEBA);
  chequear('el encabezado viejo de un registro del repo se marca',
    marca(texto, 'GLOSARIO.md', 'encabezado viejo'));
  chequear('y el reporte aclara que sus entradas no se tocan',
    marca(texto, 'GLOSARIO.md', 'no se tocan'));
}
// Un registro del Agente Desplegado con una columna que el repo le sumó, que la decisión Local-0042
// le permite. Se usa en los dos casos de abajo, que solo difieren en si además cambió la convención.
function conColumnaPropia() {
  const t = leer('semantica/GLOSARIO.md').split(/\r?\n/);
  const cab = t.findIndex(l => l.trim().startsWith('|'));
  const sep = t.findIndex(l => /^\|[\s\-:|]+\|\s*$/.test(l));
  t[cab] = t[cab].trimEnd() + ' Origen |';
  t[sep] = t[sep].trimEnd() + '---|';
  t.splice(sep + 1, 0, '| Local-0001 | Bulto | Cada unidad que se cotiza por separado | — | — | usuario |');
  return t;
}
{
  // Caso bueno, y el que más fácil se rompe: el repo extendió su registro y NADA más cambió. El
  // bloque de arriba de la tabla difiere igual —la columna cambia la línea de columnas y el
  // separador—, así que compararlo entero marcaría este repo en cada corrida, para siempre y sin
  // nada que pueda hacer al respecto. Un hallazgo permanente que no se puede resolver es la forma
  // más segura de que se deje de leer el reporte entero.
  armarAlDia();
  escribir('semantica/GLOSARIO.md', conColumnaPropia().join('\n'));
  const { texto } = correr(REPO_PRUEBA);
  chequear('una columna propia del repo, sola, NO se marca',
    !marca(texto, 'GLOSARIO.md'),
    (texto.split(/\r?\n/).find(l => l.includes('GLOSARIO.md')) || 'ninguna línea lo nombra').trim());
  chequear('y el repo sigue informándose al día',
    /Repo al d[ií]a: nada para nivelar/.test(texto));
}
{
  // Caso malo: la convención de arriba cambió Y el repo tiene una columna propia. Pisar el bloque le
  // dejaría las filas bajo una cabecera con menos columnas de las que tienen. Tiene que salir por
  // DIVERGENTE, que es bloqueante, y no por «encabezado viejo», que el flujo pisa sin preguntar.
  armarAlDia();
  const t = conColumnaPropia();
  const cab = t.findIndex(l => l.trim().startsWith('|'));
  t.splice(cab - 1, 0, '> Convención vieja: las entradas se numeran por posición.', '');
  escribir('semantica/GLOSARIO.md', t.join('\n'));
  const { texto } = correr(REPO_PRUEBA);
  chequear('convención nueva y columna propia a la vez se marca DIVERGENTE, no para pisar',
    marca(texto, 'GLOSARIO.md', 'fuera de la convencion') && !marca(texto, 'GLOSARIO.md', 'encabezado viejo'),
    (texto.split(/\r?\n/).find(l => l.includes('GLOSARIO.md')) || 'ninguna línea lo nombra').trim());
  // El detalle tiene que nombrar la columna: sin eso el usuario no sabe qué está decidiendo, y las
  // dos formas de este hallazgo (columna fuera de la convención y encabezado viejo) se leen igual.
  chequear('y el reporte nombra la columna en juego',
    marca(texto, 'GLOSARIO.md', 'Origen'));
}
{
  // La otra forma de tener una columna que la Base no declara, y la que el texto de la convención no
  // alcanza a distinguir: la Base RENOMBRÓ una columna suya y el repo conserva el nombre viejo. La
  // evidencia es idéntica a la de una columna propia —hay un nombre que la Base no trae— pero acá
  // la convención de arriba puede no haber cambiado, así que el único rastro es que las columnas de
  // la Base dejaron de estar donde estaban. Sin mirar el orden, esto se calla y el repo se queda con
  // la columna vieja para siempre, con su lint marcándole que no coincide con lo declarado.
  armarAlDia();
  escribir('semantica/GLOSARIO.md',
    leer('semantica/GLOSARIO.md').replace(/^(\|\s*Código\s*\|[^\n]*)Alias/m, '$1Sinónimos'));
  const { texto } = correr(REPO_PRUEBA);
  chequear('una columna de la Base renombrada en el repo también se marca DIVERGENTE',
    marca(texto, 'GLOSARIO.md', 'fuera de la convencion') && marca(texto, 'GLOSARIO.md', 'Sinónimos'),
    (texto.split(/\r?\n/).find(l => l.includes('GLOSARIO.md')) || 'ninguna línea lo nombra').trim());
}
{
  // Los bancos de pruebas viajan pero no se nivelan: se instalan y listo. Si se compararan, todo
  // repo que corriera sus pruebas quedaría marcado para siempre.
  armarAlDia();
  escribir('planes/lint-planes/pruebas.js', '// otra cosa\n');
  const { texto } = correr(REPO_PRUEBA);
  chequear('un banco de pruebas distinto NO se marca (se instala, no se nivela)',
    !marca(texto, 'pruebas.js'));
}

console.log('\n== ESTRUCTURA ==');
{
  armarAlDia();
  fs.rmSync(claude('decisiones'), { recursive: true, force: true });
  const { texto } = correr(REPO_PRUEBA);
  chequear('un subsistema ausente se marca para instalar',
    marca(texto, 'decisiones/', 'ausente'));
  // Y se marca UNA vez, no una por archivo que le falta adentro. Marcar de más es la forma de
  // apagarse que no se nota: el control sigue encendido y lo que se apaga es el lector.
  const lineas = texto.split(/\r?\n/).filter(l => l.includes('decisiones/')).length;
  chequear('y se marca una sola vez, no una por archivo del subsistema',
    lineas === 1, `${lineas} línea(s) lo nombran`);
}
{
  // El otro camino a la línea repetida, y el que la guarda anterior no cubre: un archivo cuya
  // carpeta SÍ existe y que además tiene un chequeo propio. `conducta/MOMENTOS.md` lo tiene, así
  // que sin deduplicar sale dos veces —una por su chequeo, otra por el barrido del árbol— con dos
  // motivos distintos para el mismo faltante.
  armarAlDia();
  fs.rmSync(claude('conducta/MOMENTOS.md'), { force: true });
  const { texto } = correr(REPO_PRUEBA);
  const lineas = texto.split(/\r?\n/).filter(l => l.includes('conducta/MOMENTOS.md')).length;
  chequear('un archivo con chequeo propio no se reporta dos veces',
    lineas === 1, `${lineas} línea(s) lo nombran`);
}
{
  // Un Componente que viaja y que ninguna lista escrita a mano nombra. `ESTADOS-LOCAL.md` es el que
  // lo destapó —un Agente Desplegado lo reportó ausente y el nivelador lo informaba al día— y es el
  // par del Agente Desplegado de `ESTADOS.md`: sin él, un estado propio se escribe en el archivo del
  // Agente Multipropósito y la corrida siguiente se lo lleva puesto.
  armarAlDia();
  fs.rmSync(claude('planes/ESTADOS-LOCAL.md'), { force: true });
  const { texto } = correr(REPO_PRUEBA);
  chequear('el Índice del Agente Desplegado de planes ausente se marca',
    marca(texto, 'planes/ESTADOS-LOCAL.md', 'ausente'));
}
{
  // El mismo agujero en un Componente de otra clase: una página de detalle de preferencias, que no
  // es Índice ni lint ni README. Si este pasara y el anterior no, el arreglo habría sido agregar un
  // nombre más a una lista en vez de recorrer el árbol — y el que viaje mañana volvería a faltar.
  armarAlDia();
  fs.rmSync(claude('preferencias/archivo-de-estado.md'), { force: true });
  const { texto } = correr(REPO_PRUEBA);
  chequear('una página de detalle ausente también se marca (el árbol es la lista)',
    marca(texto, 'preferencias/archivo-de-estado.md', 'ausente'));
}
{
  // Un archivo cambiado dispara DOS chequeos distintos: el de contenido, que lo compara con el que
  // viaja, y el de estructura, que le mira los campos mínimos. Por eso la aserción exige el motivo:
  // sin él, este caso daba verde con el chequeo de estructura apagado — lo cubría el de contenido.
  armarAlDia();
  escribir('planes/MANIFIESTO.md', '# Planes\n\nUn manifiesto sin los campos que el Patrón pide.\n');
  const { texto } = correr(REPO_PRUEBA);
  chequear('un manifiesto sin los campos mínimos se marca por estructura, no solo por contenido',
    marca(texto, 'planes/MANIFIESTO.md', 'estructura vieja'));
}
{
  armarAlDia();
  fs.rmSync(claude('semantica/lint-semantica'), { recursive: true, force: true });
  const { texto } = correr(REPO_PRUEBA);
  chequear('el lint ausente de un subsistema se marca',
    marca(texto, 'semantica/lint-semantica'));
}
{
  // La identidad se pregunta, no se inventa: su ausencia es el único faltante esperado de una
  // instalación limpia, y el detector tiene que nombrarla igual para que el flujo sepa pedirla.
  armarAlDia();
  fs.rmSync(claude('identidad.md'), { force: true });
  const { texto } = correr(REPO_PRUEBA);
  chequear('identidad.md ausente se marca', marca(texto, 'identidad.md', 'ausente'));
}

{
  // El repartidor se cablea por merge, no se copia: un repo puede tener el árbol completo y el hook
  // sin enganchar. Sin SessionStart no hay Pantalla de bienvenida, que es una regla del Agente
  // Multipropósito — el archivo está instalado y aun así la conducta no se entrega.
  armarAlDia();
  fs.writeFileSync(claude('settings.json'), JSON.stringify({ hooks: {} }, null, 2));
  const { texto } = correr(REPO_PRUEBA);
  chequear('el repartidor sin cablear en Claude Code se marca',
    marca(texto, 'settings.json', 'sin cablear'));
}
{
  // Registro doble: el mismo repartidor va en Codex, y ahí se cablea aparte. Que esté en uno no
  // dice nada del otro.
  armarAlDia();
  fs.writeFileSync(path.join(REPO_PRUEBA, '.codex', 'hooks.json'), JSON.stringify({ hooks: {} }, null, 2));
  const { texto } = correr(REPO_PRUEBA);
  chequear('el repartidor sin cablear en Codex se marca aparte',
    marca(texto, '.codex/hooks.json', 'sin cablear') && !marca(texto, 'settings.json', 'sin cablear'));
}
{
  // El mecanismo escribe en `.claude/tmp/` (el buzón de avisos) desde el primer SessionStart. Un
  // repo que no lo ignora mete esos archivos en su primer commit, y los lints que excluyen ese
  // directorio de su barrido por descartable trabajan sobre algo que ese repo no cumple.
  armarAlDia();
  fs.rmSync(path.join(REPO_PRUEBA, '.gitignore'), { force: true });
  const { texto } = correr(REPO_PRUEBA);
  chequear('sin .gitignore se marcan las dos rutas donde escribe el mecanismo',
    marca(texto, '.gitignore', 'settings.local.json') && marca(texto, '.gitignore', 'tmp'));
}
{
  // Se marca lo que falta, no el archivo entero: un repo que ya ignora una de las dos rutas no
  // tiene que ver reclamada la que sí puso.
  armarAlDia();
  fs.writeFileSync(path.join(REPO_PRUEBA, '.gitignore'), '# lo suyo\nnode_modules/\n.claude/tmp\n');
  const { texto } = correr(REPO_PRUEBA);
  chequear('con una sola de las dos rutas se reclama únicamente la que falta',
    marca(texto, '.gitignore', 'settings.local.json') && !marca(texto, '.gitignore', '.claude/tmp'));
}

console.log('\n== FORMAS ANTERIORES ==');
{
  // La generación previa de semántica. Renombrar preserva los términos; el detector tiene que
  // decir cuántos hay en juego, porque es lo que el usuario mira antes de aprobar.
  armarAlDia();
  fs.renameSync(claude('semantica'), claude('glosario'));
  const { texto } = correr(REPO_PRUEBA);
  chequear('la carpeta glosario/ se marca como renombre a semantica/',
    marca(texto, 'glosario/', 'semantica/'));
}
{
  armarAlDia();
  escribir('preferencias/PREFERENCIAS.md',
    leer('preferencias/PREFERENCIAS.md').replace(/^##\s+Preferencias del Agente Multipropósito.*$/m, '## Base (harness v3)'));
  const { texto } = correr(REPO_PRUEBA);
  chequear('un encabezado con la forma anterior se marca para renombrar',
    marca(texto, 'PREFERENCIAS.md', 'renombrar'));
}
{
  // El `origen` del frontmatter es lo que decide el trato del nivelador. Un Índice que no lo declara
  // obliga a deducirlo del nombre del archivo, que es justo lo que este modelo vino a dejar de hacer.
  armarAlDia();
  escribir('decisiones/INDICE.md', leer('decisiones/INDICE.md').replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, ''));
  const { texto } = correr(REPO_PRUEBA);
  chequear('un Índice sin frontmatter se marca para declarar',
    marca(texto, 'decisiones/INDICE.md', 'frontmatter'));
}
{
  // Los dos orígenes conviviendo adentro de un archivo: se migra partiéndolo, no reemplazándolo.
  armarAlDia();
  fs.rmSync(claude('herramientas/INDICE-LOCAL.md'), { force: true });
  escribir('herramientas/INDICE.md', leer('herramientas/INDICE.md') +
    '\n## Herramientas del Agente Desplegado\n\n| Código | Nombre | Descripción | Tipo | Cómo se invoca | Estado | Detalle |\n|---|---|---|---|---|---|---|\n');
  const { texto } = correr(REPO_PRUEBA);
  chequear('un Índice con los dos orígenes adentro se marca para partir',
    marca(texto, 'herramientas/INDICE.md', 'partir por origen'));
}
{
  // `conocimiento` gana Índice del Agente Multipropósito, así que su `INDICE.md` pasa a viajar como
  // mecanismo y se pisa entero. En un repo instalado ese archivo tiene las páginas DEL REPO adentro:
  // sin este renombre, el único hallazgo sería "instalar el que viaja" y quien lo aplique las pisa.
  armarAlDia();
  fs.rmSync(claude('conocimiento/INDICE-LOCAL.md'), { force: true });
  escribir('conocimiento/INDICE.md',
    '---\nindice: Índice de la base de conocimiento\norigen: agente-desplegado\ncolumnas: [Código, Nombre, Descripción, Detalle]\ndescripcion: de qué trata esa página, en una línea\n---\n\n' +
    '# Índice de la base de conocimiento\n\n## Páginas\n\n| Código | Nombre | Descripción | Detalle |\n|---|---|---|---|\n' +
    '| Local-0001 | Algo que aprendió el repo | Una página propia. | [algo.md](algo.md) |\n');
  const { texto } = correr(REPO_PRUEBA);
  chequear('el Índice de conocimiento en la forma vieja se marca para partir',
    marca(texto, 'conocimiento/INDICE.md', 'partir por origen'));
}
{
  // El par del anterior, y afirma "no avisa POR ESTO", no "no avisa nada": un repo YA migrado no
  // puede quedar reportando una partición pendiente en cada corrida. Lo que lo separa es el `\s*$`
  // del patrón, que distingue `## Páginas` de `## Páginas del Agente Multipropósito`.
  armarAlDia();
  const { texto } = correr(REPO_PRUEBA);
  chequear('un repo ya migrado no reclama partir el Índice de conocimiento',
    !marca(texto, 'conocimiento/INDICE.md', 'partir por origen'));
}
{
  // Una Herramienta Base ausente tiene que proponerse SOLA, no de rebote por el índice. El índice
  // Base se reemplaza entero y trae su fila, así que si la carpeta no se propone el nivelado deja
  // la Herramienta declarada y sin carpeta, y `lint-herramientas` sale con FILAS COLGADAS: el repo
  // termina "al día" con un control que rompió el propio nivelado. Se prueba con
  // `instalar-plugins-codex` porque es la que faltaba en la lista.
  armarAlDia();
  fs.rmSync(claude('herramientas/instalar-plugins-codex'), { recursive: true, force: true });
  const { texto } = correr(REPO_PRUEBA);
  chequear('una Herramienta Base ausente se marca para instalar con su carpeta',
    marca(texto, 'herramientas/instalar-plugins-codex/', 'ausente'));
}
{
  // La generación retirada. Su sola presencia significa migración incompleta y nunca puede terminar
  // en «repo al día», aunque todos sus archivos sean válidos para la versión vieja.
  armarAlDia();
  fs.mkdirSync(claude('memoria'), { recursive: true });
  fs.writeFileSync(path.join(claude('memoria'), 'feedback_decisiones.md'), '# retirado\n');
  fs.writeFileSync(path.join(claude('memoria'), 'lo_que_aprendio_el_repo.md'), '# propio\n');
  const { texto } = correr(REPO_PRUEBA);
  chequear('memoria/ presente se marca como migración pendiente',
    marca(texto, 'memoria/', 'migracion pendiente'));
  chequear('y separa lo conocido del Agente Multipropósito de lo que es Aprendizaje',
    /1 Componente\(s\) de Subsistema conocido/.test(texto) && /solo sobre 1 de Aprendizaje/.test(texto),
    (texto.split(/\r?\n/).find(l => l.includes('memoria/')) || '').trim().slice(0, 120));
}

console.log('\n== RESPALDO: EL ÚNICO MODO QUE ESCRIBE ==');
{
  // Es la red antes de pisar, y decide solo. Si se equivocara omitiendo, se pisaría sin respaldo y
  // sin aviso; si se equivocara respaldando adentro de `.claude/`, cada copia congelada duplicaría
  // los hallazgos de todos los lints del repo — las dos las sufrió un repo real.
  armarAlDia();
  const { texto, codigo } = correr(REPO_PRUEBA, '--respaldo');
  const ruta = (texto.match(/[A-Za-z]:[\\/][^\s]+|\/[^\s]+/) || [''])[0];
  chequear('sobre un repo sin git respalda y dice dónde', /respaldo/i.test(texto) && !!ruta && codigo === 0, ruta || texto.trim().slice(0, 80));
  chequear('y el respaldo NO queda adentro de .claude/',
    !ruta || !path.resolve(ruta).startsWith(path.join(REPO_PRUEBA, '.claude')), ruta);
  // Este modo escribe fuera del repo, así que la prueba levanta lo suyo: dejarlo sería ir dejando
  // una copia completa de `.claude/` en el directorio temporal por cada corrida del banco.
  if (ruta) fs.rmSync(path.dirname(path.resolve(ruta)), { recursive: true, force: true });
}
{
  // Con `.claude/` versionado, git ya es la red: omitir es lo correcto, y tiene que decirlo en vez
  // de callarse, porque el flujo informa al final qué pasó con el respaldo.
  armarAlDia();
  cp.spawnSync('git', ['init', '-q'], { cwd: REPO_PRUEBA });
  cp.spawnSync('git', ['add', '-A'], { cwd: REPO_PRUEBA });
  cp.spawnSync('git', ['-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-qm', 'x'], { cwd: REPO_PRUEBA });
  const { texto, codigo } = correr(REPO_PRUEBA, '--respaldo');
  chequear('con .claude/ versionado en git omite el respaldo y lo dice',
    /OMITIDO/i.test(texto) && codigo === 0, texto.split(/\r?\n/)[0]);
}

console.log('\n== NO SE ROMPE NI SE CALLA ANTE LO INESPERADO ==');
{
  // Un repo sin `.claude/` es caso de instalación, no de nivelado. Callarse acá mandaría al usuario
  // a nivelar un repo que todavía no tiene nada.
  fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
  fs.mkdirSync(REPO_PRUEBA, { recursive: true });
  const { texto, codigo } = correr(REPO_PRUEBA);
  chequear('un repo sin .claude/ se reporta como caso de instalación',
    marca(texto, '.claude/', 'no existe') && codigo === 0, `código ${codigo}`);
}
{
  armarAlDia();
  escribir('conducta/INDICE.md', 'esto no es una tabla ni tiene frontmatter');
  const { texto, codigo } = correr(REPO_PRUEBA);
  chequear('un Índice mal formado no lo hace reventar', codigo === 0, `código ${codigo}`);
  chequear('y tampoco lo deja pasar en silencio', marca(texto, 'conducta/INDICE.md'));
}

fs.rmSync(REPO_PRUEBA, { recursive: true, force: true });
console.log(`\ncasos: ${casos}`);
console.log('no cubierto a propósito: la APLICACIÓN (pisar el archivo, cortar por el separador de la');
console.log('                         tabla) la ejecuta el agente leyendo el SKILL.md, no este script.');
console.log(malos ? `${malos} FALLARON.` : 'TODO VERDE.');
process.exit(malos ? 1 : 0);
