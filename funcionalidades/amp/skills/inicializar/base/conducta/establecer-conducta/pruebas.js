#!/usr/bin/env node
// Pruebas del repartidor `establecer-conducta`.
//
// Es el control mas importante del repo y el que menos se ve: los diez lints pueden dar verde
// mientras el repartidor no entrega NADA. Una regla bien escrita, con su momento y su clase validos,
// no sirve de nada si el hook no la despacha — y el sintoma es que el agente simplemente trabaja sin
// ella, sin ningun error en ninguna parte. La decision `Local-0042` describe el caso exacto: el
// repartidor ubica `Momento` y `Clase` por nombre de columna, y si una se renombra no encuentra
// ninguna y cada fila queda con el momento vacio, sin emitir un error.
//
// Corre contra una COPIA del repo, no contra el repo real: el repartidor resuelve su registro desde
// su propia ubicacion, y eso es correcto para un hook (siempre opera sobre el repo donde esta
// instalado, y su directorio de trabajo no es confiable), asi que darle otro escenario es correr una
// copia suya en otro arbol. Lo que se verifica es la cadena completa: leer el registro, resolver el
// momento del evento, despachar por clase.
//
// Uso: node .claude/conducta/establecer-conducta/pruebas.js   (desde la raíz del repo)
const path = require('path');
const { spawnSync } = require('child_process');

const fs = require('fs');
const os = require('os');
const REPO_REAL = path.resolve(__dirname, '..', '..', '..');

// EL BANCO FABRICA SU REPO. El repartidor resuelve todo desde su propia ubicación —correcto para un
// hook, que siempre opera sobre el repo donde está instalado—, así que la única forma de darle otro
// escenario es correr una COPIA suya en otro árbol. Se copia `.claude/` entero y después se pisan los
// tres registros que el contraste lee, con datos sintéticos.
//
// Antes corría contra los registros reales de este repo y esperaba encontrar filas de acá: el término
// `churn` vetado, y tres Decisiones por su código. En un Agente Desplegado esas filas no existen —los
// registros de semántica y decisiones son Aprendizaje de cada repo, y viajan vacíos—, así que el banco
// daba 10 de 38 en rojo el día que se instalaba. Dos de esos rojos eran justamente los que prueban el
// control de terminología vetada: el banco decía que el control no frena, cuando sí frena. Reportado
// el 21/08/2026 por un Agente Desplegado. Es la forma «escenario prestado» del conocimiento
// `controles-que-no-avisan`, y la Decisión `Local-0072` es la que la prohíbe.
//
// Lo que NO se fabrica es el subsistema `conducta` en sí —momentos, clases, reglas y controles— ni
// `common/`: son Componentes del Agente Multipropósito, iguales en todas las instalaciones, y son
// justamente lo que este banco viene a probar.
// El árbol va al directorio temporal del sistema y no a `.claude/tmp/` —que es donde el repo pide
// dejar los temporales— por un impedimento del copiado: copiar `.claude/` adentro de `.claude/tmp/`
// es copiar una carpeta dentro de sí misma, y la biblioteca lo rechaza aunque el filtro excluya el
// destino. Se borra al terminar, así que no queda nada fuera del repo.
const REPO = fs.mkdtempSync(path.join(os.tmpdir(), 'banco-conducta-'));
fs.cpSync(path.join(REPO_REAL, '.claude'), path.join(REPO, '.claude'), {
  recursive: true,
  // `tmp` es material descartable y puede pesar; `.respaldo-amp` son copias congeladas del `.claude/`
  // que dejaron corridas viejas del actualizador. Ninguno de los dos es parte del escenario.
  filter: src => !/[\\/](tmp|\.respaldo-amp)([\\/]|$)/.test(src),
});

// -- los tres registros que lee el contraste, con datos sintéticos --------------
// Los términos y las decisiones son inventados a propósito: palabras corrientes del español que no
// están vetadas en ningún registro real, y decisiones que no son de ningún repo. Cada fila existe
// para que un mensaje concreto de más abajo la encuentre.
const escribirRegistro = (rel, texto) => fs.writeFileSync(path.join(REPO, '.claude', rel), texto, 'utf8');
escribirRegistro('semantica/GLOSARIO.md',
  '---\nindice: Glosario\norigen: agente-desplegado\n'
  + 'columnas: [Código, Nombre, Descripción, Alias, Propuestos, Detalle]\ndescripcion: qué significa el término\n---\n\n'
  + '# Glosario\n\n| Código | Nombre | Descripción | Alias | Propuestos | Detalle |\n|---|---|---|---|---|---|\n'
  + '| Local-0031 | Damajuana | El envase de vidrio donde se guarda el líquido de prueba | — | — | — |\n');
escribirRegistro('semantica/TERMINOLOGIA-FARLOPA.md',
  '---\nindice: Terminología Farlopa\norigen: agente-desplegado\n'
  + 'columnas: [Código, Nombre, Descripción, Cómo decirlo, Control, Detalle]\n'
  + 'descripcion: el significado que este registro veta para ese término\n---\n\n'
  + '# Terminología Farlopa\n\n| Código | Nombre | Descripción | Cómo decirlo | Control | Detalle |\n|---|---|---|---|---|---|\n'
  + '| Local-0021 | `berenjena` | dato de prueba: término sin uso legítimo posible | hortaliza | bloquea | — |\n'
  + '| Local-0022 | `capa de instalación` | la carpeta que viaja adentro del plugin | fase | avisa | — |\n');
// El registro de reglas del Agente Desplegado también se fabrica: es Aprendizaje de cada repo y en el
// destino puede estar vacío o traer cualquier cosa. Sin fabricarlo, el caso que verifica que las
// reglas del Agente Multipropósito salen ANTES que las del repo no tenía ninguna regla del repo
// contra la cual ordenar —este repo tiene una, `medir-contexto`, que no viaja—, y en toda instalación
// pasaba en verde sin ejercitar nada. La regla sintética es `Ejecutar` sobre el mismo momento que la
// Pantalla de bienvenida, que es donde el orden se observa.
const NOTA = 'herramientas/emitir-nota-de-prueba/emitir-nota-de-prueba.js';
const MARCA_NOTA = 'nota-de-prueba-del-agente-desplegado';
fs.mkdirSync(path.join(REPO, '.claude', path.dirname(NOTA)), { recursive: true });
fs.writeFileSync(path.join(REPO, '.claude', NOTA),
  `console.log(JSON.stringify({ systemMessage: ${JSON.stringify(MARCA_NOTA)} }));\n`, 'utf8');
escribirRegistro('conducta/INDICE-LOCAL.md',
  '---\nindice: Reglas de conducta del Agente Desplegado\norigen: agente-desplegado\n'
  + 'columnas: [Código, Nombre, Descripción, Momento, Clase, Contenido, Estado, Detalle]\n'
  + 'descripcion: qué asegura la regla, en una línea\n---\n\n'
  + '# Reglas de conducta del Agente Desplegado\n\n'
  + '| Código | Nombre | Descripción | Momento | Clase | Contenido | Estado | Detalle |\n|---|---|---|---|---|---|---|---|\n'
  + `| Local-0001 | Dejar una nota al arrancar | Dato de prueba: una regla del repo sobre el mismo momento que la Pantalla. | al arrancar la sesión | Ejecutar | ${NOTA} | vigente | — |\n`);
escribirRegistro('decisiones/INDICE.md',
  '---\nindice: Decisiones del proyecto\norigen: agente-desplegado\n'
  + 'columnas: [Código, Nombre, Descripción, Fecha, Estado, Detalle]\ndescripcion: qué se decidió y por qué\n---\n\n'
  + '# Decisiones del proyecto\n\n| Código | Nombre | Descripción | Fecha | Estado | Detalle |\n|---|---|---|---|---|---|\n'
  + '| Local-0011 | Los planes guardan su prioridad en el registro | Cada plan guarda la prioridad que se le asignó, en una columna del registro de planes. | 2026-01-01 | vigente | — |\n'
  + '| Local-0012 | Los lints corren solos al terminar una tarea | Los lints de subsistema corren solos al cerrar cada tarea, sin que nadie los invoque. | 2026-01-02 | vigente | — |\n');

const HOOK = path.join(REPO, '.claude', 'conducta', 'establecer-conducta', 'establecer-conducta.js');
const MD = path.join(REPO, 'caso-de-prueba-que-no-existe.md').replace(/\\/g, '/');

function disparar(entrada, ms = 120000) {
  const r = spawnSync(process.execPath, [HOOK], {
    input: typeof entrada === 'string' ? entrada : JSON.stringify(entrada),
    encoding: 'utf8', timeout: ms, cwd: REPO,
  });
  const salida = (r.stdout || '').trim();
  let json = null;
  try { json = salida ? JSON.parse(salida) : null; } catch { /* salida no-JSON: se informa cruda */ }
  const h = (json && json.hookSpecificOutput) || {};
  return {
    codigo: r.status,
    crudo: salida,
    contexto: h.additionalContext || '',
    decision: h.permissionDecision || '',
    mensaje: (json && json.systemMessage) || '',
  };
}

let malos = 0, total = 0;
const chequear = (nombre, condicion, detalle) => {
  total++;
  console.log(`${condicion ? 'OK  ' : 'FALLA'} ${nombre}${detalle ? `  → ${detalle}` : ''}`);
  if (!condicion) malos++;
};

console.log('== ENTREGA: cada evento despacha las reglas de su momento ==');

// `cada turno`: el momento que más reglas tiene. Si no entrega, el agente pierde el recordatorio de
// preferencias y el de terminología en TODOS los turnos.
{
  const r = disparar({ hook_event_name: 'UserPromptSubmit' });
  chequear('UserPromptSubmit entrega las reglas de «cada turno»',
    r.contexto.length > 100, `${r.contexto.length} caracteres de contexto`);
  chequear('  …y el texto es el del registro, no uno vacío',
    /preferencia|terminolog/i.test(r.contexto), r.contexto.slice(0, 60).replace(/\n/g, ' ') + '…');
}

// `al escribir` sobre un .md: combina el texto fijo de las reglas `Inyectar` con lo que mide la
// regla `Bloquear`.
{
  const r = disparar({ hook_event_name: 'PreToolUse', tool_name: 'Write',
    tool_input: { file_path: MD, content: 'Un texto en español corriente, sin nada que objetar.\n' } });
  chequear('PreToolUse sobre un .md entrega las reglas de «al escribir»',
    r.contexto.length > 50, `${r.contexto.length} caracteres`);
  chequear('  …y no frena una escritura limpia',
    r.decision !== 'deny', r.decision || '(sin decisión: defer)');
}

// La clase `Bloquear` en acción: el mismo momento, con un término que no tiene uso legítimo posible.
{
  const r = disparar({ hook_event_name: 'PreToolUse', tool_name: 'Write',
    tool_input: { file_path: MD, content: 'hay mucha berenjena en el repo\n' } });
  chequear('PreToolUse frena la escritura con un término vetado', r.decision === 'deny', r.decision || '(nada)');
}

// La clase `Ejecutar`: su salida ES la respuesta del hook, y `systemMessage` es el único campo que
// escribe en la terminal del usuario.
{
  const r = disparar({ hook_event_name: 'SessionStart' });
  chequear('SessionStart entrega la Pantalla de bienvenida por systemMessage',
    r.mensaje.length > 100, `${r.mensaje.length} caracteres`);
  chequear('  …y la caja llega armada, no en pedazos',
    r.mensaje.includes('╔') && r.mensaje.includes('╚'), r.mensaje.split('\n')[1] || '');
  // Varias reglas `Ejecutar` en el mismo momento se FUSIONAN en un `systemMessage`. Escribir los
  // JSON uno detrás del otro deja dos objetos pegados, que no es JSON válido: el harness lo
  // descarta y no se ve NADA — ni siquiera la caja que sí funcionaba. El banco fabrica la segunda
  // regla, así que el caso corre de verdad en cualquier instalación: se afirma que la respuesta
  // sigue siendo un JSON con `systemMessage` Y que el texto de la segunda regla llegó.
  chequear('  …y con varias reglas la respuesta sigue siendo un JSON solo',
    r.crudo.trim().startsWith('{') && r.crudo.trim().endsWith('}') && !/\}\s*\{/.test(r.crudo),
    `${r.crudo.length} caracteres, un objeto`);
  chequear('  …y el texto de la segunda regla llegó', r.mensaje.includes(MARCA_NOTA),
    r.mensaje.includes(MARCA_NOTA) ? 'presente' : 'se perdió');
  // El orden lo decide el origen, no el nombre del archivo. `INDICE-LOCAL.md` ordena antes que
  // `INDICE.md`, así que sin ordenar por origen lo que sumó el repo saldría DELANTE de la Pantalla de
  // bienvenida. Lo único que precede a la caja, por diseño, es el rótulo de la propia Pantalla —la
  // marca `Agente Multipropósito`, o el modelo activo cuando el dato llega—, que absorbe la etiqueta
  // del hook para no correr la caja. Se afirma que ese rótulo es lo que hay antes de la caja y que no
  // se le coló texto de una regla del repo, que es lo que se rompe al invertir el orden por origen.
  const antesDeLaCaja = r.mensaje.slice(0, r.mensaje.indexOf('╔')).trim();
  chequear('  …con las del Agente Multipropósito antes que las del repo',
    r.mensaje.includes('╔') && antesDeLaCaja === 'Agente Multipropósito',
    antesDeLaCaja ? `"${antesDeLaCaja.slice(0, 50)}" quedó delante` : 'la caja primero');
}

console.log('\n== NO ENTREGA donde no corresponde ==');

{
  // El código entró al momento con la decisión `Local-0052`, pero solo avisando: el mismo término
  // que en un `.md` rechaza la escritura, acá tiene que informarse y dejarla pasar.
  const r = disparar({ hook_event_name: 'PreToolUse', tool_name: 'Write',
    tool_input: { file_path: path.join(REPO, 'caso.js').replace(/\\/g, '/'), content: '// hay mucha berenjena\n' } });
  chequear('un .js dispara «al escribir»', !!r.contexto, r.contexto.slice(0, 50) || '(no emitió nada)');
  chequear('  …y en código nunca frena, aunque el término bloquee en texto',
    r.decision !== 'deny', r.decision || 'sin decisión, como debe');
}
{
  const r = disparar({ hook_event_name: 'PreToolUse', tool_name: 'Write',
    tool_input: { file_path: path.join(REPO, 'caso.json').replace(/\\/g, '/'), content: 'hay mucha berenjena\n' } });
  chequear('un archivo que no es texto ni código no dispara «al escribir»', !r.crudo, r.crudo.slice(0, 60) || '(nada)');
}
{
  const md = path.join(REPO, 'caso-de-prueba-vetado.md').replace(/\\/g, '/');
  const r = disparar({ hook_event_name: 'PreToolUse', tool_name: 'Write',
    tool_input: { file_path: md, content: 'hay mucha berenjena en el repo\n' } });
  chequear('el mismo término en un .md sí frena', r.decision === 'deny', r.decision || '(no frenó)');
}
{
  const r = disparar({ hook_event_name: 'Stop' });
  chequear('un evento sin momento realizado no emite nada', !r.crudo, r.crudo.slice(0, 60) || '(nada)');
}

console.log('\n== BUZÓN DE AVISOS GENERALES ==');
// Un trabajo en segundo plano deja lo que averiguó y el repartidor lo entrega en el turno siguiente.
// Lo que hay que fijar es que el aviso llegue POR LOS DOS CANALES —`systemMessage` para el usuario,
// que es quien decide, y `additionalContext` para el modelo— SIN pisar las reglas `Inyectar`, y que
// se borre: un aviso que no se borra se repite para siempre.
{
  const fs = require('fs');
  const dir = path.join(REPO, '.claude', 'tmp', 'avisos');
  const archivo = path.join(dir, 'prueba-repartidor.txt');
  const MARCA = 'AVISO DE PRUEBA DEL REPARTIDOR';
  const habia = fs.existsSync(dir) ? fs.readdirSync(dir) : null;
  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(archivo, MARCA, 'utf8');
    const r = disparar({ hook_event_name: 'UserPromptSubmit' });
    chequear('el aviso llega al usuario por systemMessage', r.mensaje.includes(MARCA),
      r.mensaje.slice(0, 40) || '(sin systemMessage)');
    chequear('  …y también al modelo por additionalContext', r.contexto.includes(MARCA));
    chequear('  …sin pisar las reglas Inyectar del momento',
      r.contexto.includes('Recordatorio de conducta'), 'las reglas siguen ahí');
    chequear('  …y el aviso se borra: no se repite', !fs.existsSync(archivo),
      fs.existsSync(archivo) ? 'QUEDÓ SIN BORRAR' : 'borrado');
    const otra = disparar({ hook_event_name: 'UserPromptSubmit' });
    chequear('  …tanto que el turno siguiente ya no lo trae', !otra.mensaje.includes(MARCA));
  } finally {
    try { fs.unlinkSync(archivo); } catch (e) { /* ya no estaba */ }
    // El directorio se saca solo si lo creó esta prueba: un buzón real con avisos no se toca.
    if (habia === null) { try { fs.rmdirSync(dir); } catch (e) { /* tiene algo adentro */ } }
  }
}
{
  // Sin buzón no hay nada que entregar, y eso NO es un error: el turno sale igual con sus reglas.
  const r = disparar({ hook_event_name: 'UserPromptSubmit' });
  chequear('sin avisos pendientes el turno sale igual', r.codigo === 0 && !!r.contexto,
    `código ${r.codigo}`);
}

console.log('\n== LAS CLASES CONVIVEN EN UN MOMENTO ==');
// Hasta el 02/08/2026 el repartidor despachaba `Ejecutar` primero y CORTABA, así que una regla
// `Ejecutar` en un momento con reglas `Inyectar` las apagaba a todas sin ninguna señal. Se fija por
// los campos, que es lo que las hace combinables: `Ejecutar` escribe en `systemMessage` e `Inyectar`
// en `additionalContext`, y el momento `al arrancar la sesión` tiene que seguir dando su caja.
{
  const r = disparar({ hook_event_name: 'SessionStart' });
  chequear('«al arrancar la sesión» sigue emitiendo la Pantalla de bienvenida',
    r.mensaje.includes('Agente Multipropósito'), r.mensaje.split('\n')[1] || '(sin caja)');
}
{
  const r = disparar({ hook_event_name: 'UserPromptSubmit' });
  chequear('«cada turno» entrega sus reglas Inyectar', r.contexto.includes('Recordatorio de conducta'));
}

console.log('\n== CONTRASTE CON LA SABIDURÍA DEL REPO (el comparador) ==');
// El comparador vive dentro del repartidor, en `cada turno`: puntúa el mensaje del usuario contra las
// celdas Nombre+Descripción de semántica (glosario + Terminología Farlopa) y decisiones, e inyecta las
// pocas filas que pegan fuerte al `additionalContext`. Es determinista, así que su calidad de selección
// se prueba acá SIN costo de sesión (mensaje → filas esperadas), y es donde se calibra el umbral. La
// Herramienta `probar-disparo-de-skills` NO aplica: mide si una skill dispara, y esto no dispara ninguna.
//
// Corre contra los registros REALES del repo, igual que el resto de este banco: qué fila elige para un
// mensaje depende del contenido vivo de los registros, y eso es lo que se quiere verificar. Si una edición
// de los registros deja de surtir el caso, el banco lo dice — que es el punto de un control.
const H = 'Contraste con la sabiduría del repo';
const contrasteDe = msg => disparar({ hook_event_name: 'UserPromptSubmit', prompt: msg }).contexto;

// El `additionalContext` de `cada turno` trae tres cosas: las reglas `Inyectar`, este contraste y, si
// hay algo pendiente, el Buzón de Avisos Generales — que se entrega UNA vez y se borra. Lo que mide
// este apartado es el comparador, así que se le recorta su bloque: el encabezado y las viñetas de
// candidatas que lo siguen. Sin recortar, un aviso pendiente hace que la misma entrada dé dos salidas
// distintas y se lea como falta de determinismo del comparador — y el aviso se lo deposita este mismo
// banco, porque su caso de `SessionStart` lanza la Pantalla, que corre el chequeo de plugins en
// segundo plano y escribe en el Buzón un segundo y medio después, ya corriendo esta sección.
const bloqueDelContraste = (ctx) => {
  const lineas = ctx.split('\n');
  const desde = lineas.findIndex(l => l.startsWith(H));
  if (desde < 0) return '';
  let hasta = desde + 1;
  while (hasta < lineas.length && lineas[hasta].startsWith('- ')) hasta++;
  return lineas.slice(desde, hasta).join('\n');
};

// Los tres casos positivos del plan del disparo automático, cada uno con la fila que debe encabezar.
{
  const c = contrasteDe('quiero que los planes guarden la prioridad');
  chequear('«…los planes guarden la prioridad» trae el contraste', c.includes(H));
  chequear('  …y encabeza la Decisión de prioridad de planes (Local-0011)', c.includes('Local-0011'),
    c.includes('Local-0011') ? 'presente' : 'ausente');
  // Preferencia Base-0016: el código de una Entrada va precedido por su tipo. El patrón se arma en
  // runtime para no dejar en este archivo la adjacencia «Decisión»+número, que la Decisión de no
  // citar decisiones del harness en lo que viaja marca como cita colgante en el repo destino.
  const conTipo = new RegExp('Decisión' + '\\s+Local-0011');
  chequear('  …con el tipo de entrada delante del código (Base-0016)', conTipo.test(c));
}
{
  const c = contrasteDe('se me ocurre que los lints deberían correr solos cuando termino una tarea');
  chequear('«…los lints deberían correr solos…» trae la Decisión de lints que corren solos (Local-0012)',
    c.includes(H) && c.includes('Local-0012'), c.includes('Local-0012') ? 'presente' : 'ausente');
}
{
  const c = contrasteDe('a la carpeta que viaja adentro del plugin la llamaría capa de instalación');
  chequear('«…la llamaría capa de instalación» trae la relación vetada `capa de instalación`=fase (Local-0022)',
    c.includes(H) && c.includes('Local-0022'), c.includes('Local-0022') ? 'presente' : 'ausente');
  chequear('  …nombrada como relación vetada (Terminología Farlopa)', c.includes('Terminología Farlopa'));
  // Tope duro: nunca más de tres filas, aunque peguen muchas. Se cuentan los renglones de candidato,
  // que empiezan con «- » dentro del bloque del contraste.
  const candidatas = (bloqueDelContraste(c).match(/^- /gm) || []).length;
  chequear('  …y respeta el tope duro de 3 filas', candidatas > 0 && candidatas <= 3, `${candidatas} filas`);
}

// Precisión primero: la mayoría de los turnos NO inyecta nada. Un saludo y una consulta fáctica que solo
// menciona un sustantivo del dominio se quedan en silencio, sin pisar las reglas `Inyectar` del momento.
{
  const c = contrasteDe('hola, gracias por la ayuda');
  chequear('un saludo no dispara el contraste', !c.includes(H), c.includes(H) ? 'disparó de más' : 'silencio');
  chequear('  …y las reglas Inyectar del momento siguen ahí', c.includes('Recordatorio de conducta'));
}
{
  const c = contrasteDe('cuántos planes pendientes hay');
  chequear('una consulta fáctica de un solo sustantivo no dispara', !c.includes(H),
    c.includes(H) ? 'disparó de más' : 'silencio');
}

// Determinista: el mismo mensaje da exactamente las mismas candidatas (el comparador no tiene azar ni
// estado). Se comparan los bloques, no los contextos: el Buzón que viaja al lado sí tiene estado, y es
// de un solo uso por diseño.
{
  const msg = 'a la carpeta que viaja adentro del plugin la llamaría capa de instalación';
  const primera = bloqueDelContraste(contrasteDe(msg));
  const segunda = bloqueDelContraste(contrasteDe(msg));
  chequear('el mismo mensaje da el mismo contraste (determinista)',
    !!primera && primera === segunda, primera === segunda ? undefined : 'dos salidas distintas');
}

// Sin mensaje del usuario (UserPromptSubmit sin `prompt`) no hay nada que contrastar, pero el momento
// sigue entregando sus reglas: el contraste no se come el resto del turno.
{
  const r = disparar({ hook_event_name: 'UserPromptSubmit' });
  chequear('sin prompt no hay contraste pero sí las reglas del momento',
    !r.contexto.includes(H) && r.contexto.includes('Recordatorio de conducta'));
}

console.log('\n== NUNCA ROMPE EL TURNO ==');
// Un hook que revienta se lleva puesto el turno del usuario. Ante cualquier entrada, sale 0.
for (const [nombre, entrada] of [
  ['entrada vacía', ''],
  ['JSON inválido', '{esto no es json'],
  ['objeto sin evento', '{}'],
  ['evento con tool_input nulo', '{"hook_event_name":"PreToolUse","tool_name":"Write","tool_input":null}'],
]) {
  const r = disparar(entrada, 30000);
  chequear(`${nombre} → sale 0 sin romper`, r.codigo === 0, `código ${r.codigo}`);
}

console.log(`\ncasos: ${total}`);
console.log(malos ? `${malos} FALLARON.` : 'TODO VERDE.');
try { fs.rmSync(REPO, { recursive: true, force: true }); } catch { /* el escenario es descartable */ }
process.exit(malos ? 1 : 0);
