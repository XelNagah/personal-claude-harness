#!/usr/bin/env node
// Pruebas del control `detectar-terminologia-vetada`.
//
// Por que existen: el conocimiento `cambiar-la-forma-de-un-registro` midio que de once roturas de
// un control, OCHO no emitieron ninguna senal — el control contestaba en verde sobre un conjunto
// vacio. Un control sin prueba no avisa cuando deja de controlar. De ahi la regla: una prueba por
// control, con caso bueno Y caso malo. Sin el caso bueno no se detecta el falso positivo; sin el
// malo, un control que no hace nada pasa por sano.
//
// EL BANCO FABRICA SU PROPIO REGISTRO. Antes corria contra el registro real del repo y usaba como
// testigos tres filas de ESTE repo. El control viaja a cada Agente Desplegado, pero el registro es
// contenido de su Proposito y arranca VACIO: alla esos terminos no existen, asi que los casos que
// esperan un veredicto fallaban siempre. Medido el 20/08/2026 en un Agente Desplegado: 8 de 20 en
// rojo, y seis de esas ocho no tenian nada que ver con el defecto que se estaba buscando. Un banco
// que mide el contenido del repo destino no prueba el mecanismo: prueba lo que el repo haya vetado.
//
// Los terminos del registro de prueba son DATOS SINTETICOS y estan elegidos a proposito: palabras
// corrientes del espanol que no estan vetadas en ningun registro real. Asi el banco no depende de lo
// que este repo haya vetado ni de lo que vete el destino, y escribir este archivo no dispara el
// control contra si mismo.
//
// El registro de prueba cubre a proposito las cuatro formas de la celda `Nombre`, porque el defecto
// que motivo este banco vivia justo ahi: CON comillas simples invertidas, SIN comillas, hermanas
// separadas por barra, y expresion de varias palabras. El caso sin comillas es la regresion.
//
// Uso:  node .claude/conducta/detectar-terminologia-vetada/pruebas.js
// Sale con codigo 1 si alguna prueba falla, para que `ejecutar-pruebas` lo detecte.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { ENV_REGISTRO } = require('../../common/terminos-vetados.js');

const CONTROL = path.join(__dirname, 'detectar-terminologia-vetada.js');
// Ruta cualquiera dentro del repo: el control decide por la extension y por el subsistema, no por
// que el archivo exista. Se usa una ruta que NO existe a proposito, para que ninguna prueba escriba.
const REPO = path.resolve(__dirname, '..', '..', '..');
const MD = path.join(REPO, 'caso-de-prueba-que-no-existe.md').replace(/\\/g, '/');

// -- el registro de prueba -----------------------------------------------------
const CABECERA = '| Código | Nombre | Descripción | Cómo decirlo | Control | Detalle |\n'
               + '| --- | --- | --- | --- | --- | --- |\n';
const REGISTRO = '# Registro de prueba (datos sintéticos)\n\n' + CABECERA
  + '| Local-0001 | `berenjena` | dato de prueba: fila CON comillas | hortaliza | bloquea | — |\n'
  + '| Local-0002 | damajuana / damajuanear / damajuaneo | dato de prueba: fila SIN comillas, tres hermanas | garrafa | bloquea | — |\n'
  + '| Local-0003 | almacén de repuestos | dato de prueba: expresión de varias palabras, sin comillas | depósito | avisa | — |\n'
  + '| Local-0004 | **`caléndula`** | dato de prueba: celda con resaltado | flor | avisa | — |\n';
// La forma vieja del encabezado, que se acepta mientras haya Agentes Desplegados sin actualizar.
const REGISTRO_VIEJO = '# Registro de prueba con la columna vieja\n\n'
  + '| Término | Significado vetado | Cómo decirlo | Control |\n| --- | --- | --- | --- |\n'
  + '| berenjena | dato de prueba | hortaliza | bloquea |\n';

// El escenario se fabrica entero y se borra al terminar: nada de lo que mide el banco sale del banco.
const BASE_TMP = path.join(REPO, '.claude', 'tmp');
const TMP = fs.mkdtempSync(path.join(fs.existsSync(BASE_TMP) ? BASE_TMP : os.tmpdir(), 'pruebas-vetados-'));
const RUTA_REGISTRO = path.join(TMP, 'TERMINOLOGIA-FARLOPA.md');
const RUTA_REGISTRO_VIEJO = path.join(TMP, 'REGISTRO-VIEJO.md');
fs.writeFileSync(RUTA_REGISTRO, REGISTRO, 'utf8');
fs.writeFileSync(RUTA_REGISTRO_VIEJO, REGISTRO_VIEJO, 'utf8');

// -- correr el control una vez -------------------------------------------------
function correr({ tool = 'Write', ruta = MD, contenido = '', campo = 'content', registro = RUTA_REGISTRO }) {
  const tool_input = tool === 'apply_patch' ? { command: contenido } : { file_path: ruta, [campo]: contenido };
  const entrada = JSON.stringify({ tool_name: tool, tool_input });
  const env = Object.assign({}, process.env);
  env[ENV_REGISTRO] = registro;
  const salida = execFileSync(process.execPath, [CONTROL], { input: entrada, encoding: 'utf8', env });
  if (!salida.trim()) return { veredicto: 'nada', texto: '' };
  const json = JSON.parse(salida);
  const h = json.hookSpecificOutput || {};
  if (h.permissionDecision === 'deny') return { veredicto: 'bloquea', texto: h.permissionDecisionReason || '' };
  if (h.additionalContext) return { veredicto: 'avisa', texto: h.additionalContext };
  return { veredicto: 'nada', texto: salida };
}

// -- los casos ----------------------------------------------------------------
// `espera` es el veredicto buscado; `contiene` (opcional) exige que el mensaje lo mencione, para que
// una prueba no pase por el motivo equivocado (bloquear por otro termino tambien seria 'bloquea').
const CASOS = [
  // --- las cuatro formas de la celda `Nombre` ---
  { nombre: 'fila CON comillas: uso real de un termino que bloquea',
    entrada: { contenido: 'hay mucha berenjena en el repo' }, espera: 'bloquea', contiene: 'berenjena' },
  { nombre: 'fila SIN comillas: la fila igual se lee (regresion del 20/08/2026)',
    entrada: { contenido: 'esto es puro damajuana' }, espera: 'bloquea', contiene: 'damajuana' },
  { nombre: 'fila SIN comillas: las hermanas separadas por barra son terminos distintos',
    entrada: { contenido: 'el damajuaneo del proceso' }, espera: 'bloquea', contiene: 'damajuaneo' },
  { nombre: 'expresion de varias palabras, sin comillas y con acento',
    entrada: { contenido: 'eso vive en el almacén de repuestos' }, espera: 'avisa', contiene: 'almacén de repuestos' },
  { nombre: 'expresion con espacios de mas (el termino se normaliza)',
    entrada: { contenido: 'eso vive en el almacén   de   repuestos' }, espera: 'avisa', contiene: 'almacén de repuestos' },
  { nombre: 'celda con resaltado: los asteriscos no son parte del termino',
    entrada: { contenido: 'la caléndula del subsistema' }, espera: 'avisa', contiene: 'caléndula' },
  { nombre: 'la columna vieja Término sigue leyendose',
    entrada: { contenido: 'hay mucha berenjena', registro: RUTA_REGISTRO_VIEJO }, espera: 'bloquea', contiene: 'berenjena' },

  // --- el codigo entro al momento avisando (decision `Local-0052`) ---
  // El MISMO termino, el mismo contenido: lo unico que cambia es la extension. En un .md rechaza la
  // escritura; en un .js informa y la deja pasar, porque ahi no hay forma de citar un termino sin
  // usarlo (las comillas simples invertidas son plantillas de cadena, no cita).
  { nombre: 'en codigo, un termino que bloquea solo avisa',
    entrada: { ruta: 'D:/repo/script.js', contenido: 'hay mucha berenjena en el repo' }, espera: 'avisa', contiene: 'berenjena' },
  { nombre: 'en codigo, un termino que avisa sigue avisando',
    entrada: { ruta: 'D:/repo/script.js', contenido: 'la caléndula del subsistema' }, espera: 'avisa', contiene: 'caléndula' },
  { nombre: 'un archivo que no es texto ni codigo queda fuera de alcance',
    entrada: { ruta: 'D:/repo/datos.json', contenido: 'hay mucha berenjena' }, espera: 'nada' },
  { nombre: 'el directorio de borradores queda afuera',
    entrada: { ruta: 'D:/repo/.claude/tmp/nota.md', contenido: 'hay mucha berenjena' }, espera: 'nada' },
  { nombre: 'Edit manda new_string en vez de content',
    entrada: { contenido: 'hay mucha berenjena', campo: 'new_string' }, espera: 'bloquea', contiene: 'berenjena' },
  { nombre: 'Codex manda el parche entero en command',
    entrada: { tool: 'apply_patch', contenido: '*** Update File: nota.md\n+hay mucha berenjena acá' },
    espera: 'bloquea', contiene: 'berenjena' },

  // --- caso bueno: el control NO tiene que frenar ---
  { nombre: 'citado entre comillas simples invertidas',
    entrada: { contenido: 'el término `berenjena` está vetado' }, espera: 'nada' },
  { nombre: 'citado entre comillas rectas',
    entrada: { contenido: 'el término "berenjena" está vetado' }, espera: 'nada' },
  { nombre: 'citado entre comillas angulares',
    entrada: { contenido: 'el término «berenjena» está vetado' }, espera: 'nada' },
  { nombre: 'citado entre comillas tipograficas',
    entrada: { contenido: 'el término “berenjena” está vetado' }, espera: 'nada' },
  { nombre: 'dentro de un bloque de codigo cercado',
    entrada: { contenido: 'ejemplo:\n\n~~~js\nconst x = "hay mucha berenjena";\n~~~\n'.replace(/~~~/g, '```') }, espera: 'nada' },
  { nombre: 'una palabra que no esta en el registro no dispara nada',
    entrada: { contenido: 'eso es la capa semántica, y aquella la capa de configuración' }, espera: 'nada' },
  // Ata la variable de entorno: si el control ignorara el registro de prueba y leyera el del repo,
  // este caso daria un veredicto en vez de silencio, y todo el banco estaria midiendo otra cosa.
  // Se usa una ruta de codigo a proposito: ahi el control como maximo avisa, asi que este archivo se
  // puede escribir aunque nombre un termino que el registro real si tiene vetado.
  { nombre: 'con el registro de prueba puesto, el registro real del repo no se lee',
    entrada: { ruta: 'D:/repo/script.js', contenido: 'esto es plomería del subsistema' }, espera: 'nada' },
  { nombre: 'una imagen u otro binario no dispara nada',
    entrada: { ruta: path.join(REPO, 'diagrama.png').replace(/\\/g, '/'), contenido: 'hay mucha berenjena' }, espera: 'nada' },
  { nombre: 'el propio subsistema semantica esta exento',
    entrada: { ruta: path.join(REPO, '.claude', 'semantica', 'TERMINOLOGIA-FARLOPA.md').replace(/\\/g, '/'),
               contenido: 'hay mucha berenjena' }, espera: 'nada' },
  { nombre: 'contenido vacio',
    entrada: { contenido: '   \n  ' }, espera: 'nada' },
  { nombre: 'texto limpio',
    entrada: { contenido: 'un texto en español corriente, sin nada que objetar.' }, espera: 'nada' },
  // El registro que no existe se lee como registro vacio, no como error: el subsistema puede no
  // estar instalado todavia, y el control nunca debe romper el turno.
  { nombre: 'sin registro instalado, el control no rompe ni frena',
    entrada: { contenido: 'hay mucha berenjena', registro: path.join(TMP, 'no-existe.md') }, espera: 'nada' },
];

// -- correr ------------------------------------------------------------------
console.log(`== PRUEBAS detectar-terminologia-vetada ==\ncasos: ${CASOS.length}\n`);
let fallas = 0;
for (const c of CASOS) {
  let got;
  try { got = correr(c.entrada); }
  catch (e) { console.log(`  FALLA  ${c.nombre}\n         reventó: ${e.message.split('\n')[0]}`); fallas++; continue; }

  if (got.veredicto !== c.espera) {
    console.log(`  FALLA  ${c.nombre}\n         esperaba "${c.espera}", dio "${got.veredicto}"${got.texto ? ` — ${got.texto.split('\n')[0]}` : ''}`);
    fallas++; continue;
  }
  if (c.contiene && !got.texto.includes(c.contiene)) {
    console.log(`  FALLA  ${c.nombre}\n         veredicto "${got.veredicto}" correcto pero por otro término: no menciona "${c.contiene}"`);
    fallas++; continue;
  }
  console.log(`  OK     ${c.nombre}`);
}

try { fs.rmSync(TMP, { recursive: true, force: true }); } catch { /* el escenario es descartable */ }

console.log(fallas ? `\n${fallas} de ${CASOS.length} FALLARON.` : `\nTODO VERDE (${CASOS.length} casos).`);
process.exit(fallas ? 1 : 0);
