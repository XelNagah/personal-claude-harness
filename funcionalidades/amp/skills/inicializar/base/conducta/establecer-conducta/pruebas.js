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
  //
  // SE MIDE CONTRA LA RUTA RELATIVA AL REPO, no contra la absoluta. Mirando la absoluta, un repo que
  // viva bajo una carpeta `tmp` —el caso del worktree, que caía en `.claude/tmp/worktrees/<nombre>/`—
  // hacía que el filtro excluyera TODO: no se copiaba un solo archivo y el banco moría con ENOENT al
  // escribir el primer registro, antes de correr un caso. Medido el 08/09/2026 adentro de un
  // worktree. Es el mismo defecto que tenía la exención de borradores de `alcance-al-escribir.js`.
  filter: src => {
    const rel = path.relative(REPO_REAL, src).replace(/\\/g, '/');
    return !/(^|\/)(tmp|\.respaldo-amp)(\/|$)/.test(rel);
  },
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
// El registro de planes también se fabrica, y por el mismo motivo que los otros tres: es Aprendizaje
// de cada repo, así que esperar filas de acá sería el escenario prestado que prohíbe la Decisión
// `Local-0072`. Entró al alcance del contraste por la vía de las CITAS —un documento que dice «el plan
// Local-0041» nombra la fila exacta, sin fórmula—, que es lo que estos planes sintéticos ejercitan.
escribirRegistro('planes/PLANES.md',
  '---\nindice: Registro de planes\norigen: agente-desplegado\n'
  + 'columnas: [Código, Nombre, Descripción, Estado, Fecha de creación, Fecha de cierre, Origen, Detalle]\n'
  + 'descripcion: qué problema resuelve el plan y qué va a cambiar cuando esté hecho\n---\n\n'
  + '# Registro de planes\n\n'
  + '| Código | Nombre | Descripción | Estado | Fecha de creación | Fecha de cierre | Origen | Detalle |\n'
  + '|---|---|---|---|---|---|---|---|\n'
  + '| Local-0041 | Cambiar el envase del líquido de prueba | Dato de prueba: el envase actual no entra en la heladera y hay que reemplazarlo. | Nuevo | 26-01-03 | — | — | — |\n'
  + '| Local-0042 | Cambiar la cerradura del galpón | Dato de prueba: la cerradura se trabó dos veces y conviene reemplazarla antes del invierno. | Nuevo | 26-01-04 | — | — | — |\n');

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
// regla `Controlar`.
{
  const r = disparar({ hook_event_name: 'PreToolUse', tool_name: 'Write',
    tool_input: { file_path: MD, content: 'Un texto en español corriente, sin nada que objetar.\n' } });
  chequear('PreToolUse sobre un .md entrega las reglas de «al escribir»',
    r.contexto.length > 50, `${r.contexto.length} caracteres`);
  chequear('  …y no frena una escritura limpia',
    r.decision !== 'deny', r.decision || '(sin decisión: defer)');
}

// La clase `Controlar` en acción: el mismo momento, con un término que no tiene uso legítimo posible.
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
// Corre contra los registros SINTÉTICOS que este banco fabrica más arriba, no contra los del repo:
// semántica, decisiones y planes son Aprendizaje de cada repo y viajan vacíos, así que esperar filas
// de acá daría rojo el día que se instala (Decisión `Local-0072`).
const H = 'Contraste con la sabiduría del repo';
// Sin `session_id` la memoria de sesión no se aplica, así que cada caso arranca de cero salvo los que
// piden explícitamente una sesión — que son los que la prueban.
const contrasteDe = (msg, sesion) => disparar(Object.assign(
  { hook_event_name: 'UserPromptSubmit', prompt: msg }, sesion ? { session_id: sesion } : {})).contexto;

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

console.log('\n== el contraste sigue el puntero: citas del mensaje y del material apuntado ==');
// El puntaje solo mira el mensaje. Un pedido que apunta a un archivo lleva el contenido AFUERA del
// mensaje —«leé este handoff y seguimos»—, así que el agente cargaba el documento entero sin que
// ninguna de sus palabras se hubiera comparado contra nada. Las CITAS son la salida: el código de una
// Entrada con su tipo delante nombra la fila exacta, sin fórmula ni umbral.

// Una cita en el propio mensaje. El puntaje no la encuentra —«plan» y el número no son palabras
// discriminantes de ninguna celda—, y es el caso más corriente al retomar un trabajo.
{
  const c = contrasteDe('Seguimos con el plan Local-0041');
  chequear('un plan citado en el mensaje trae su fila', c.includes(H) && c.includes('Local-0041'),
    c.includes('Local-0041') ? 'presente' : 'ausente');
  chequear('  …nombrada como plan, no como Decisión del mismo código',
    /- plan Local-0041/.test(c));
}
// El mismo código existe en varios registros: sin el tipo delante no se sabe cuál es, y por eso la
// palabra de tipo es obligatoria. `Local-0012` es una Decisión Y no existe como plan.
{
  const c = contrasteDe('acordate de Local-0041 cuando puedas');
  chequear('un código suelto, sin su tipo delante, NO se toma como cita', !c.includes('Local-0041'),
    c.includes('Local-0041') ? 'lo tomó igual' : 'ignorado');
}
// Una enumeración escribe el tipo una sola vez, al principio. La ventana hacia atrás tiene que
// alcanzar para que la segunda y la tercera no se pierdan.
//
// El tipo va en una variable y no pegado al código: este archivo VIAJA, y la adjacencia
// «Decisión»+número deja una cita colgante en el repo destino, donde esa decisión no existe. Es el
// mismo recaudo que toma el caso del tipo de entrada, más arriba.
const TIPO_DEC = 'Decisión', TIPO_DECS = 'Decisiones';
{
  const c = contrasteDe(`mirá las ${TIPO_DECS} Local-0011, Local-0012 antes de seguir`);
  chequear('una enumeración con el tipo escrito una vez trae las dos filas',
    c.includes('Local-0011') && c.includes('Local-0012'));
}
// Conocimiento y preferencias quedan afuera a propósito: sus Índices ya cargan siempre, así que
// traer la fila de nuevo gasta el presupuesto del turno sin agregar nada.
{
  const c = contrasteDe('esto lo dice el conocimiento Local-0011 y la Preferencia Local-0012');
  chequear('conocimiento y preferencias citados NO entran (ya cargan siempre)',
    !c.includes(H) || (!c.includes('Local-0011') && !c.includes('Local-0012')),
    c.includes('Local-0011') || c.includes('Local-0012') ? 'entró una' : 'ignorados');
}

// El material apuntado. El nombre lleva espacios a propósito: los archivos de este repo los tienen, y
// una ruta cortada por el espacio no existiría — el hook se ancla en la extensión y retrocede token a
// token probando cuál existe.
{
  const doc = path.join(REPO, 'una nota de trabajo.md');
  fs.writeFileSync(doc, `Lo que sigue sale del plan Local-0042 y de la ${TIPO_DEC} Local-0011.\n`, 'utf8');
  const c = contrasteDe('Leé "una nota de trabajo.md" y seguimos');
  chequear('el hook sigue el puntero y trae las citas del archivo apuntado',
    c.includes(H) && c.includes('Local-0042') && c.includes('Local-0011'),
    c.includes('Local-0042') ? 'trajo el plan citado' : 'no abrió el archivo');
  chequear('  …y el nombre con espacios se resuelve entero', c.includes('Local-0042'));
}
// Una ruta que no existe, y una que sale del repo, no rompen el turno ni abren nada: el hook resuelve
// contra el repo y descarta lo de afuera.
{
  const c = contrasteDe('leé archivo-que-no-existe.md y ../../afuera-del-repo.md');
  chequear('rutas inexistentes o fuera del repo no rompen el turno',
    c.includes('Recordatorio de conducta'));
}

console.log('\n== memoria de sesión: la misma fila no se repite dentro de la ventana ==');
// El comparador no guardaba nada entre turnos, así que volvía a inyectar la misma fila cada vez que
// el tema se repetía —medido sobre transcripciones reales, el 64% de lo entregado en una sesión—. El
// tope de 3 dolía porque dos de esas tres se gastaban repitiendo.
{
  const S = 'banco-memoria-1';
  const uno = contrasteDe('Seguimos con el plan Local-0041', S);
  const dos = contrasteDe('Seguimos con el plan Local-0041', S);
  chequear('la primera vez trae la fila citada', uno.includes('Local-0041'));
  chequear('  …y la segunda, en la misma sesión, ya no la repite', !dos.includes('Local-0041'),
    dos.includes('Local-0041') ? 'la repitió' : 'callada');
}
// Callar libera presupuesto: con el tope lleno de repeticiones, la cuarta fila nunca entraba. Al
// callar las tres primeras, el turno siguiente trae las que quedaban afuera.
{
  const S = 'banco-memoria-2';
  const msg = 'a la carpeta que viaja adentro del plugin la llamaría capa de instalación';
  const uno = bloqueDelContraste(contrasteDe(msg, S));
  const dos = bloqueDelContraste(contrasteDe(msg, S));
  chequear('el mismo mensaje repetido no devuelve las mismas filas', !!uno && uno !== dos,
    uno === dos ? 'devolvió lo mismo' : 'entregó filas nuevas');
}
// Que sin `session_id` la memoria NO se aplique lo prueba el caso de determinismo de más arriba: sin
// sesión, el mismo mensaje repetido devuelve exactamente las mismas filas. Es la degradación buscada
// —compartir una marca entre sesiones distintas callaría filas que nadie vio—, no un olvido.

console.log('\n== `al cerrar tarea`: el momento donde CALLAR ES EL DEFAULT ==');
// Es el unico momento donde emitir CONTINUA la conversacion en vez de dejar una nota, asi que el
// texto fijo de su regla `Inyectar` no sale solo: lo habilita la regla `Controlar` del mismo momento.
// Las dos formas de romperlo son mudas — de mas, el agente no puede cerrar; de menos, el aviso no
// existe— y ninguna emite un error en ninguna parte.
{
  // Una transcripcion que dispara: pasa el piso del control y no asienta nada. El piso real esta en
  // el Contenido de la regla del registro copiado, asi que el archivo tiene que superarlo de verdad.
  const relleno = JSON.stringify({ type: 'user', message: { role: 'user', content: 'relleno de una conversación larga' } }) + '\n';
  const tDispara = path.join(REPO, 'sesion-sin-asentar.jsonl');
  fs.writeFileSync(tDispara, relleno.repeat(3000), 'utf8');
  // Y otra que no: la misma conversacion, pero con un registro escrito.
  const asentado = JSON.stringify({ type: 'assistant', message: { role: 'assistant', content: [
    { type: 'tool_use', name: 'Write', input: { file_path: path.join(REPO, '.claude', 'decisiones', 'INDICE.md') } }] } }) + '\n';
  const tCalla = path.join(REPO, 'sesion-que-asento.jsonl');
  fs.writeFileSync(tCalla, asentado + relleno.repeat(3000), 'utf8');

  const r = disparar({ hook_event_name: 'Stop', transcript_path: tDispara, session_id: 'banco-stop-1' });
  chequear('Stop sobre una sesión sin asentar entrega la regla de «al cerrar tarea»',
    /registralo antes de cerrar/i.test(r.contexto), r.contexto.slice(0, 70).replace(/\n/g, ' ') + '…');
  chequear('  …y el evento de salida es Stop, no UserPromptSubmit',
    r.crudo.includes('"hookEventName":"Stop"'), r.crudo.slice(0, 80));

  const rAsento = disparar({ hook_event_name: 'Stop', transcript_path: tCalla, session_id: 'banco-stop-2' });
  chequear('Stop sobre una sesión que ya asentó → mudo', !rAsento.contexto, rAsento.crudo.slice(0, 60));

  // LA GUARDA CONTRA EL BUCLE. Sin ella cada continuacion vuelve a disparar el evento y el agente no
  // termina hasta el corte del CLI a las 8 seguidas. Va en el repartidor para proteger a TODAS las
  // reglas del momento, no solo a la que hoy existe.
  const rBucle = disparar({ hook_event_name: 'Stop', transcript_path: tDispara,
    session_id: 'banco-stop-3', stop_hook_active: true });
  chequear('Stop con stop_hook_active → mudo aunque la señal dispararía',
    !rBucle.contexto && !rBucle.crudo, rBucle.crudo.slice(0, 60) || '(sin salida)');

  // Sin transcripcion el control no puede medir y se calla; y si el control calla, el texto fijo
  // NO sale. Este es el caso que prueba que la regla `Inyectar` no se entrega sola.
  const rSinDatos = disparar({ hook_event_name: 'Stop' });
  chequear('Stop sin nada que medir → el texto fijo tampoco sale', !rSinDatos.contexto, rSinDatos.crudo.slice(0, 60));
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
