#!/usr/bin/env node
// Pruebas del control `detectar-terminologia-vetada`.
//
// Por que existen: el conocimiento `cambiar-la-forma-de-un-registro` midio que de once roturas de
// un control, OCHO no emitieron ninguna senal — el control contestaba en verde sobre un conjunto
// vacio. Un control sin prueba no avisa cuando deja de controlar. De ahi la regla: una prueba por
// control, con caso bueno Y caso malo. Sin el caso bueno no se detecta el falso positivo; sin el
// malo, un control que no hace nada pasa por sano.
//
// Estas pruebas corren contra el registro REAL del repo, no contra uno armado a mano: lo que se
// verifica es la cadena completa (leer el registro, clasificar, decidir). Por eso usan terminos
// estables del registro y no cualquiera:
//   - `churn`  -> control `bloquea` (anglicismo puro, sin uso legitimo posible)
//   - `capa de plugins` -> control `avisa`, y ademas es EXPRESION de varias palabras
//   - `capa` sola -> NO esta en el registro desde el 30/07/2026: el termino montado sobre una
//     palabra corriente se registra como expresion, no como la palabra suelta
// Si alguna vez se cambia el control de esas filas, estas pruebas fallan y hay que actualizarlas:
// eso es correcto, es el aviso de que el contrato cambio.
//
// Uso:  node .claude/conducta/detectar-terminologia-vetada/pruebas.js
// Sale con codigo 1 si alguna prueba falla, para que `ejecutar-pruebas` lo detecte.

const path = require('path');
const { execFileSync } = require('child_process');

const CONTROL = path.join(__dirname, 'detectar-terminologia-vetada.js');
// Ruta cualquiera dentro del repo: el control decide por la extension y por el subsistema, no por
// que el archivo exista. Se usa una ruta que NO existe a proposito, para que ninguna prueba escriba.
const REPO = path.resolve(__dirname, '..', '..', '..');
const MD = path.join(REPO, 'caso-de-prueba-que-no-existe.md').replace(/\\/g, '/');

// -- correr el control una vez -------------------------------------------------
function correr({ tool = 'Write', ruta = MD, contenido = '', campo = 'content' }) {
  const tool_input = tool === 'apply_patch' ? { command: contenido } : { file_path: ruta, [campo]: contenido };
  const entrada = JSON.stringify({ tool_name: tool, tool_input });
  const salida = execFileSync(process.execPath, [CONTROL], { input: entrada, encoding: 'utf8' });
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
  // --- caso malo: el control tiene que frenar ---
  { nombre: 'uso real de un termino que bloquea',
    entrada: { contenido: 'hay mucho churn en el repo' }, espera: 'bloquea', contiene: 'churn' },
  // --- el codigo entro al momento avisando (decision `Local-0052`) ---
  // El MISMO termino, el mismo contenido: lo unico que cambia es la extension. En un .md rechaza la
  // escritura; en un .js informa y la deja pasar, porque ahi no hay forma de citar un termino sin
  // usarlo (las comillas simples invertidas son plantillas de cadena, no cita).
  { nombre: 'en codigo, un termino que bloquea solo avisa',
    entrada: { ruta: 'D:/repo/script.js', contenido: 'hay mucho churn en el repo' }, espera: 'avisa', contiene: 'churn' },
  { nombre: 'en codigo, un termino que avisa sigue avisando',
    entrada: { ruta: 'D:/repo/script.js', contenido: 'esto es plomería del subsistema' }, espera: 'avisa', contiene: 'plomería' },
  { nombre: 'un archivo que no es texto ni codigo queda fuera de alcance',
    entrada: { ruta: 'D:/repo/datos.json', contenido: 'hay mucho churn' }, espera: 'nada' },
  { nombre: 'el directorio de borradores queda afuera',
    entrada: { ruta: 'D:/repo/.claude/tmp/nota.md', contenido: 'hay mucho churn' }, espera: 'nada' },
  { nombre: 'uso real con acento (limites de palabra no-ASCII)',
    entrada: { contenido: 'esto es plomería del subsistema' }, espera: 'avisa', contiene: 'plomería' },
  { nombre: 'expresion de varias palabras',
    entrada: { contenido: 'la capa de plugins va antes que la de archivos' }, espera: 'avisa', contiene: 'capa de plugins' },
  { nombre: 'expresion con espacios de mas (el termino se normaliza)',
    entrada: { contenido: 'la capa   de   plugins va primero' }, espera: 'avisa', contiene: 'capa de plugins' },
  { nombre: 'Edit manda new_string en vez de content',
    entrada: { contenido: 'hay mucho churn', campo: 'new_string' }, espera: 'bloquea', contiene: 'churn' },
  { nombre: 'Codex manda el parche entero en command',
    entrada: { tool: 'apply_patch', contenido: '*** Update File: nota.md\n+hay mucho churn acá' },
    espera: 'bloquea', contiene: 'churn' },

  // --- caso bueno: el control NO tiene que frenar ---
  { nombre: 'citado entre backticks',
    entrada: { contenido: 'el término `churn` está vetado' }, espera: 'nada' },
  { nombre: 'citado entre comillas rectas',
    entrada: { contenido: 'el término "churn" está vetado' }, espera: 'nada' },
  { nombre: 'citado entre comillas angulares',
    entrada: { contenido: 'el término «churn» está vetado' }, espera: 'nada' },
  { nombre: 'citado entre comillas tipograficas',
    entrada: { contenido: 'el término “churn” está vetado' }, espera: 'nada' },
  { nombre: 'dentro de un bloque de codigo cercado',
    entrada: { contenido: 'ejemplo:\n\n```js\nconst x = "hay mucho churn";\n```\n' }, espera: 'nada' },
  { nombre: 'palabra corriente que ya no esta en el registro (regresion de Local-0044)',
    entrada: { contenido: 'eso es la capa semántica, y aquella la capa de configuración' }, espera: 'nada' },
  // Este caso esperaba 'nada' para un `.js` hasta que la decisión `Local-0052` metió el código en el
  // alcance. Ahora el silencio es de los archivos que no son ni texto ni código, un caso más arriba.
  { nombre: 'una imagen u otro binario no dispara nada',
    entrada: { ruta: path.join(REPO, 'diagrama.png').replace(/\\/g, '/'), contenido: 'hay mucho churn' }, espera: 'nada' },
  { nombre: 'el propio subsistema semantica esta exento',
    entrada: { ruta: path.join(REPO, '.claude', 'semantica', 'TERMINOLOGIA-FARLOPA.md').replace(/\\/g, '/'),
               contenido: 'hay mucho churn' }, espera: 'nada' },
  { nombre: 'contenido vacio',
    entrada: { contenido: '   \n  ' }, espera: 'nada' },
  { nombre: 'texto limpio',
    entrada: { contenido: 'un texto en español corriente, sin nada que objetar.' }, espera: 'nada' },
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

console.log(fallas ? `\n${fallas} de ${CASOS.length} FALLARON.` : `\nTODO VERDE (${CASOS.length} casos).`);
process.exit(fallas ? 1 : 0);
