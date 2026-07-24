# Plantilla de conducta

Textos literales que esta skill escribe. (El formato general de una memoria lo define la funcionalidad `memoria-local`.) Ninguno cita números de decisión del harness: enuncian la razón inline (esos textos se instalan en el repo destino).

## §Momentos — contenido inicial de `.claude/conducta/MOMENTOS.md`

Si el archivo no existe, crearlo con este contenido:

````markdown
# Momentos de conducta

Vocabulario de los **momentos** válidos a los que una regla de conducta puede atarse. Un momento es un **evento de hook + una condición que la máquina evalúa sin juicio**; es agente-agnóstico, y su realización depende de que el agente tenga un repartidor para ese evento. Este archivo es el punto de partida del registro de momentos: hoy alcanza el vocabulario (nombre · qué representa · evento · disponibilidad). Crece a las columnas completas (condición fina, disponibilidad por agente) cuando se sumen repartidores nuevos. El `lint-conducta` lo lee para validar que toda regla apunte a un momento existente y que ninguna regla `vigente` cuelgue de un momento sin repartidor.

- **Momento** — nombre canónico, en español corriente.
- **Qué representa** — el punto del flujo, en una línea.
- **Evento de hook** — el evento que lo dispara (+ condición, si la hay).
- **Disponibilidad** — `activo` (hay repartidor construido que lo entrega) o `declarado` (definido, sin repartidor todavía → sus reglas van en estado `pendiente`).

| Momento | Qué representa | Evento de hook | Disponibilidad |
|---------|----------------|----------------|----------------|
| cada turno | Antes de cada respuesta del agente, sin condición. | `UserPromptSubmit` | activo |
| al escribir | Al escribir o editar un `.md` bajo `.claude/` (registros y docs del harness). El `additionalContext` llega **junto al resultado** de la tool: es un recordatorio posterior a la escritura, no un aviso previo. | `PreToolUse` sobre `Write`\|`Edit`, condición: `file_path` es `.md` bajo `.claude/` | activo (Claude) |
| al cerrar tarea | Al terminar de responder una tarea. | `Stop` | declarado |

> Paridad: `cada turno` (`UserPromptSubmit` + `additionalContext`) tiene paridad plena Claude Code ↔ Codex (conocimiento `hooks-claude-code`). `al escribir` es **Claude-first**: el `PreToolUse` de Codex intercepta solo Bash, así que ese momento **no es realizable** en Codex sin desviar por Bash — degradación explícita, no rota en silencio. Los momentos `declarado` esperan su repartidor.
````

## §Registro — contenido inicial de `.claude/conducta/INDICE.md`

Si el archivo no existe, crearlo con este contenido. Las **Reglas Base** son las que instala el harness (van tal cual); la sección **Reglas del Propósito** arranca vacía (cada repo la llena):

````markdown
# Reglas de conducta

Registro de las **reglas de conducta** del repo: cada fila ata un **momento** (del vocabulario en `MOMENTOS.md`) a una **acción**, para asegurar "cuando hagas X, asegurate de Y". El hook repartidor `establecer-conducta/` lee este registro **vivo** en cada momento y entrega la regla que corresponde — agregar o cambiar una regla **no toca la config del hook**. Una fila por regla.

- **Regla** — qué asegura, en una frase (verbo).
- **Momento** — a qué momento se ata; tiene que existir en `MOMENTOS.md`.
- **Clase** — `inyectar` (el agente lee un texto y actúa con su juicio) · `correr` (una Herramienta lo resuelve sin juicio) · `bloquear` (se frena la acción; solo donde Y es sin juicio y el falso positivo es imposible).
- **Contenido** — el texto a inyectar (`inyectar`), la Herramienta a correr (`correr`) o la condición de bloqueo (`bloquear`).
- **Estado** — `vigente` (se entrega) · `pendiente` (declarada, su momento aún no tiene repartidor) · `obsoleto` (no se entrega; se puede depurar).

> **Origen del contenido:** las reglas se separan por origen en dos secciones — **Reglas Base** (las manda el harness; el nivelador `amp-actualizar` las reemplaza enteras al poner al día un AMP) y **Reglas del Propósito** (las suma cada repo; el nivelador no las toca). Hoy tienen repartidor los momentos `cada turno` (`UserPromptSubmit`) y `al escribir` (`PreToolUse`); la regla de momento `al cerrar tarea` (`Stop`) queda en `pendiente` (honesta, sin entregar) hasta que se sume su repartidor.

## Reglas Base

Las que instala el harness (origen **Base**). El nivelador `amp-actualizar` reemplaza **esta sección entera** al poner al día un AMP; nunca abre la de abajo.

| Regla | Momento | Clase | Contenido | Estado |
|-------|---------|-------|-----------|--------|
| Respetar las preferencias cargadas | cada turno | inyectar | Antes de responder, respetá las preferencias ya cargadas (PREFERENCIAS.md). | vigente |
| No acuñar terminología del dominio | cada turno | inyectar | No acuñes términos del dominio (usá el glosario, proponé en Propuestos, nunca uses vetados). Antes de una palabra de origen inglés, aplicá el test: ¿la diría tal cual un desarrollador hispanohablante en una charla en español (`commit`, `deploy`, `parsear`, `hardcodear`, `bug`) o es una metáfora o modismo del inglés (`churn`, `wedge`, `dogfooding`, `staleness`, `feasibility`)? Lo segundo → traducilo, le resulta raro al usuario. Ante la duda, traducí. | vigente |
| Preguntar antes de redefinir o remover algo canónico | cada turno | inyectar | Antes de **remover, renombrar o redefinir** algo canónico (una definición del glosario, una decisión) o con dependientes: proponé y esperá la ratificación del usuario. El agente propone; ratificar, vetar y redefinir son potestad del usuario. Aplica también a **definiciones y remociones**, no solo al alta de un término. | vigente |
| Contrastar contra la sabiduría del repo al escribir | al escribir | inyectar | Acabás de escribir un `.md` del harness (`.claude/`): contrastá lo escrito contra el test de demarcación, el glosario y las decisiones — ¿va en este subsistema?, ¿contradice algo asentado?, ¿usaste un término vetado o inventado? Corregí si hace falta. | vigente |
| Registrar en el subsistema cuando algo cambia | al cerrar tarea | inyectar | Si en esta tarea cambió algo que otro subsistema debe saber (memoria, decisión, conocimiento, semántica, herramientas), registralo antes de cerrar. | pendiente |

## Reglas del Propósito

Las que cada repo suma para su Propósito (origen **aprendido**). El nivelador **no toca esta sección**. Hoy vacía: cuando el repo sume una regla propia, va acá con las mismas columnas que la tabla de arriba.
````

> **Nota sobre la primera regla Base:** el texto de arriba es el mínimo genérico. En un repo con preferencias propias (fechas, ejemplos del dominio, ubicación de temporales), esa fila se afina para nombrar esas preferencias — pero esa afinación es del Propósito y no la escribe la instalación.

## §Hook-script — `.claude/conducta/establecer-conducta/establecer-conducta.js`

Contenido exacto (Node, sin dependencias, sin red):

```js
#!/usr/bin/env node
// Hook repartidor del subsistema conducta. Un mismo script sirve a varios eventos:
// lee el registro VIVO de reglas (../INDICE.md), resuelve que momento(s) realiza el evento que lo
// disparo (con su condicion, sin juicio), y entrega el Contenido de las reglas de clase `inyectar`,
// estado `vigente` y ese momento, como additionalContext para el modelo.
// Agregar/cambiar una regla NO toca este script: lee el registro en cada disparo.
//
// Eventos que realiza hoy (la realizacion del momento es agente-especifica):
//   - UserPromptSubmit         -> momento `cada turno`   (sin condicion)
//   - PreToolUse Write|Edit .md bajo .claude/ -> momento `al escribir` (condicion sin juicio)
// El vocabulario de momentos vive en ../MOMENTOS.md; aca vive COMO se realiza cada uno.
//
// Contrato de hook (conocimiento hooks-claude-code): stdin = JSON del harness; stdout = JSON.
//   UserPromptSubmit: { hookSpecificOutput: { hookEventName, additionalContext } }
//   PreToolUse:       { hookSpecificOutput: { hookEventName, additionalContext } }  (sin
//                     permissionDecision => 'defer': inyecta y deja el flujo de permisos intacto,
//                     verificado 2026-07-23; NO auto-aprueba). additionalContext llega junto al
//                     resultado de la tool (post-ejecucion): recordatorio posterior, no aviso previo.
// Nunca rompe el turno: ante cualquier error o registro vacio, sale 0 sin emitir nada.
//
// Uso a mano (probar): echo {"hook_event_name":"UserPromptSubmit"} | node establecer-conducta.js
const fs = require('fs'), path = require('path');
const idxPath = path.resolve(__dirname, '..', 'INDICE.md');

// -- que momento realiza cada evento, con su condicion sin juicio -------
// Devuelve el nombre del momento a entregar, o null si el evento+datos no realiza ninguno.
function momentoDe(data) {
  const ev = data.hook_event_name;
  if (ev === 'UserPromptSubmit') return 'cada turno';
  if (ev === 'PreToolUse') {
    const tool = data.tool_name || '';
    const fp = ((data.tool_input && data.tool_input.file_path) || '').replace(/\\/g, '/');
    // condicion `al escribir`: escribir/editar un .md bajo .claude/ (registros y docs del harness)
    if ((tool === 'Write' || tool === 'Edit') && /\.md$/i.test(fp) && /(^|\/)\.claude\//.test(fp)) return 'al escribir';
    return null;
  }
  return null;
}

// -- parseo minimo de la tabla markdown del registro de reglas ----------
function leerReglas(txt) {
  const filas = [];
  const lineas = txt.split('\n').map(l => l.trim()).filter(l => l.startsWith('|'));
  let cols = null;
  for (const l of lineas) {
    const celdas = l.split('|').slice(1, -1).map(c => c.trim());
    const norm = celdas.map(c => c.toLowerCase().replace(/\*/g, ''));
    if (!cols) {
      if (norm.includes('regla') && norm.includes('momento')) {
        cols = { momento: norm.indexOf('momento'), clase: norm.indexOf('clase'),
                 contenido: norm.indexOf('contenido'), estado: norm.indexOf('estado') };
      }
      continue;
    }
    if (/^:?-{2,}:?$/.test(celdas[0].replace(/\s/g, ''))) continue;
    const val = i => (i >= 0 && i < celdas.length ? celdas[i] : '');
    filas.push({ momento: val(cols.momento).toLowerCase(), clase: val(cols.clase).toLowerCase(),
                 contenido: val(cols.contenido), estado: val(cols.estado).toLowerCase() });
  }
  return filas;
}

function construir(momento) {
  if (!momento || !fs.existsSync(idxPath)) return '';
  const reglas = leerReglas(fs.readFileSync(idxPath, 'utf8'))
    .filter(r => r.clase === 'inyectar' && r.estado === 'vigente' && r.momento === momento && r.contenido);
  if (!reglas.length) return '';
  const bullets = reglas.map(r => `- ${r.contenido}`).join('\n');
  return `Recordatorio de conducta — momento «${momento}» (subsistema conducta):\n${bullets}`;
}

// Se drena stdin (contrato del hook) y se despacha segun el evento.
let input = '';
process.stdin.on('data', c => { input += c; });
process.stdin.on('end', () => {
  let data = {}, ctx = '';
  try { data = JSON.parse(input || '{}'); } catch (e) { data = {}; }
  try { ctx = construir(momentoDe(data)); } catch (e) { ctx = ''; }   // ante error, no romper el turno
  if (ctx) {
    const ev = data.hook_event_name === 'PreToolUse' ? 'PreToolUse' : 'UserPromptSubmit';
    // PreToolUse: se OMITE permissionDecision a proposito (=> 'defer'): inyecta sin auto-aprobar.
    process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: ev, additionalContext: ctx } }));
  }
  process.exit(0);
});
process.stdin.on('error', () => process.exit(0));
```

## §Hook-readme — `.claude/conducta/establecer-conducta/README.md`

````markdown
# establecer-conducta — hook repartidor de conducta

Hook del subsistema `conducta`. **No es una Herramienta** (los hooks van afuera del registro de Herramientas): es infra co-ubicada del subsistema, como el lint. El agente no lo invoca — lo dispara el harness.

## Qué hace

Un mismo script sirve a varios eventos. Según el evento que lo dispara, resuelve qué **momento** realiza (con su condición, sin juicio), lee el registro **vivo** `../INDICE.md`, filtra las reglas de clase `inyectar`, estado `vigente` y ese momento, y emite su `Contenido` como `additionalContext` para el modelo. Agregar o cambiar una regla **no toca este script**: lee el registro en cada disparo. El vocabulario de momentos vive en `../MOMENTOS.md`; acá vive **cómo** se realiza cada uno.

Eventos que realiza hoy:

- **`UserPromptSubmit`** → momento `cada turno` (sin condición). El recordatorio en cada turno.
- **`PreToolUse`** con `Write`/`Edit` de un `.md` bajo `.claude/` → momento `al escribir`. El `additionalContext` llega **junto al resultado** de la tool (post-ejecución): es un recordatorio posterior a la escritura, no un aviso previo.

## Contrato

- **Entrada:** el JSON del harness por stdin (se lee `hook_event_name`, y para `PreToolUse` `tool_name` + `tool_input.file_path`).
- **Salida:** por stdout, `{ "hookSpecificOutput": { "hookEventName": …, "additionalContext": "…" } }`.
- **`PreToolUse` sin efecto de lado:** se **omite** `permissionDecision` (= `defer`, verificado 2026-07-23): inyecta el texto y deja el flujo de permisos intacto — **no** auto-aprueba la tool. (`allow` auto-aprobaría; `deny` descartaría el `additionalContext`.)
- **Nunca rompe el turno:** ante cualquier error o registro vacío sale con código 0 sin emitir nada.

Mecánica y capacidades de hooks: conocimiento `hooks-claude-code`. Latencia (~65 ms, Node): conocimiento `latencia-hooks`.

## Cableado

- **Claude Code (`.claude/settings.json`):** `UserPromptSubmit` (sin matcher) + `PreToolUse` (matcher `Write|Edit`).
- **Codex (`.codex/hooks.json`):** solo `UserPromptSubmit` (paridad del momento `cada turno`). El momento `al escribir` es **Claude-first**: el `PreToolUse` de Codex intercepta solo Bash, no es realizable ahí — degradación documentada en `../MOMENTOS.md`.

## Probar a mano

```bash
echo {"hook_event_name":"UserPromptSubmit"} | node .claude/conducta/establecer-conducta/establecer-conducta.js
echo {"hook_event_name":"PreToolUse","tool_name":"Write","tool_input":{"file_path":".claude/semantica/GLOSARIO.md"}} | node .claude/conducta/establecer-conducta/establecer-conducta.js
```

Emiten el JSON con las reglas vigentes de ese momento, o nada si no aplica.
````

## §Lint-script — `.claude/conducta/lint-conducta/lint-conducta.js`

Contenido exacto (Node, sin dependencias, sin red):

```js
#!/usr/bin/env node
// Lint del subsistema conducta: valida el registro de reglas (INDICE.md) contra el
// vocabulario de momentos (MOMENTOS.md). Sin LLM, sin red. Autocontenido: solo lee archivos del
// propio subsistema (por eso no comparte el fragmento repoRoot de los otros lints).
// Uso: node lint-conducta.js [<carpeta conducta>]   (default: .claude/conducta)
const fs = require('fs'), path = require('path');
const root = path.resolve(process.argv[2] || '.claude/conducta');
const quiet = process.argv.includes('--quiet');

const CLASES = ['inyectar', 'correr', 'bloquear'];      // las tres clases de accion, cerradas
const ESTADOS = ['vigente', 'pendiente', 'obsoleto'];

// -- parseo de tablas markdown ------------------------------------------
function filasTabla(txt, requeridas) {
  const out = [];
  const lineas = txt.split('\n').map(l => l.trim()).filter(l => l.startsWith('|'));
  let cols = null;
  for (const l of lineas) {
    const celdas = l.split('|').slice(1, -1).map(c => c.trim());
    const norm = celdas.map(c => c.toLowerCase().replace(/\*/g, ''));
    if (!cols) {
      if (requeridas.every(r => norm.includes(r))) {
        cols = {}; requeridas.forEach(r => { cols[r] = norm.indexOf(r); });
      }
      continue;
    }
    if (/^:?-{2,}:?$/.test(celdas[0].replace(/\s/g, ''))) continue;   // separador ---
    const fila = {}; for (const r of requeridas) fila[r] = (cols[r] < celdas.length ? celdas[cols[r]] : '');
    out.push(fila);
  }
  return { cols, filas: out };
}

const problemas = { estructura: [], momentoInexistente: [], claseInvalida: [], estadoInvalido: [], inyectarSinTexto: [], vigenteSinRepartidor: [] };

// -- vocabulario de momentos --------------------------------------------
const momPath = path.join(root, 'MOMENTOS.md');
let momentos = new Map();   // nombre -> disponibilidad (activo|declarado)
if (!fs.existsSync(momPath)) problemas.estructura.push('falta MOMENTOS.md (vocabulario de momentos)');
else {
  const { cols, filas } = filasTabla(fs.readFileSync(momPath, 'utf8'), ['momento', 'disponibilidad']);
  if (!cols) problemas.estructura.push('MOMENTOS.md: no se encontro la tabla (columnas Momento, Disponibilidad)');
  else for (const f of filas) momentos.set(f.momento.toLowerCase(), f.disponibilidad.toLowerCase());
}

// -- registro de reglas -------------------------------------------------
const idxPath = path.join(root, 'INDICE.md');
if (!fs.existsSync(idxPath)) problemas.estructura.push('falta INDICE.md (registro de reglas)');
else {
  const requeridas = ['regla', 'momento', 'clase', 'contenido', 'estado'];
  const { cols, filas } = filasTabla(fs.readFileSync(idxPath, 'utf8'), requeridas);
  if (!cols) problemas.estructura.push(`INDICE.md: no se encontro la tabla (columnas ${requeridas.join(', ')})`);
  else for (const f of filas) {
    const regla = f.regla || '(sin nombre)';
    const momento = f.momento.toLowerCase(), clase = f.clase.toLowerCase(), estado = f.estado.toLowerCase();
    if (!momentos.has(momento)) problemas.momentoInexistente.push(`"${regla}" -> momento "${f.momento}" no esta en MOMENTOS.md`);
    if (!CLASES.includes(clase)) problemas.claseInvalida.push(`"${regla}" -> clase "${f.clase}" (validas: ${CLASES.join('/')})`);
    if (!ESTADOS.includes(estado)) problemas.estadoInvalido.push(`"${regla}" -> estado "${f.estado}" (validos: ${ESTADOS.join('/')})`);
    if (clase === 'inyectar' && !f.contenido) problemas.inyectarSinTexto.push(`"${regla}" -> clase inyectar sin Contenido`);
    // honestidad: una regla vigente no puede colgar de un momento sin repartidor (disponibilidad declarado)
    if (estado === 'vigente' && momentos.get(momento) === 'declarado')
      problemas.vigenteSinRepartidor.push(`"${regla}" -> vigente pero su momento "${f.momento}" es 'declarado' (sin repartidor): deberia ser 'pendiente'`);
  }
}

// -- salida -------------------------------------------------------------
const secciones = [
  ['ESTRUCTURA', problemas.estructura],
  ['MOMENTO INEXISTENTE (regla apunta a un momento fuera de MOMENTOS.md)', problemas.momentoInexistente],
  ['CLASE INVALIDA', problemas.claseInvalida],
  ['ESTADO INVALIDO', problemas.estadoInvalido],
  ['INYECTAR SIN CONTENIDO', problemas.inyectarSinTexto],
  ['VIGENTE SOBRE MOMENTO SIN REPARTIDOR', problemas.vigenteSinRepartidor],
];
const total = secciones.reduce((n, [, it]) => n + it.length, 0);
if (quiet && total === 0) process.exit(0);
console.log(`== LINT CONDUCTA: ${root} ==`);
console.log(`momentos: ${momentos.size} | hallazgos: ${total}\n`);
for (const [titulo, items] of secciones) {
  if (quiet && !items.length) continue;
  console.log(`[${titulo}] (${items.length})`);
  items.forEach(i => console.log(`    ${i}`));
  if (!quiet && !items.length) console.log('    (ninguno)');
}
```

## §Lint-readme — `.claude/conducta/lint-conducta/README.md`

```markdown
# lint-conducta

**Qué hace:** lint del subsistema `conducta` — valida el registro de reglas (`INDICE.md`) contra el vocabulario de momentos (`MOMENTOS.md`): que toda regla apunte a un momento existente, que la clase (`inyectar`/`correr`/`bloquear`) y el estado (`vigente`/`pendiente`/`obsoleto`) sean válidos, que ninguna regla `inyectar` quede sin `Contenido`, y —honestidad— que ninguna regla `vigente` cuelgue de un momento sin repartidor (disponibilidad `declarado`). Sin LLM, sin red. Autocontenido: solo lee archivos del propio subsistema.
**Cómo se corre:** `node .claude/conducta/lint-conducta/lint-conducta.js` (desde la raíz del repo). Flags: `--quiet` (solo imprime si hay hallazgos). Acepta una ruta a la carpeta de conducta como primer argumento (default `.claude/conducta`).
**Estado:** vigente.
**Referenciado por:** nadie automático — se corre a mano al cerrar tareas que tocaron `conducta`. (El hook que sí vive en el subsistema es el repartidor `establecer-conducta`, que es otra cosa: entrega reglas, no valida el registro.)
**Dependencias:** Node.js (sin libs externas).
**Origen (opcional):** funcionalidad `conducta` del harness — es infra del Patrón del subsistema (co-ubicada, como todo lint), **no** una Herramienta, así que no se registra en `herramientas/INDICE.md`.
```

## §Memoria — `.claude/memoria/feedback_conducta.md`

```markdown
---
name: conducta
description: Subsistema conducta en .claude/conducta/ — reglas "cuando hagas X, asegurate de Y" que atan momentos (evento de hook + condición sin juicio) a acciones (inyectar/correr/bloquear); las entrega un hook repartidor que lee el registro vivo, no el agente a mano; Base (harness) vs Propósito (repo); lint al cerrar.
metadata:
  type: feedback
---

El subsistema `conducta` asegura comportamientos del tipo **"cuando hagas X, asegurate de Y"**: ata **momentos** del flujo a **acciones**. Vive en `.claude/conducta/`:

- `INDICE.md` — el **registro de reglas**: cada fila ata un momento a una acción (`Regla | Momento | Clase | Contenido | Estado`). Separado por origen en dos secciones: **Reglas Base** (las manda el harness; el nivelador las reemplaza enteras) y **Reglas del Propósito** (las suma cada repo; el nivelador no las toca).
- `MOMENTOS.md` — el **vocabulario de momentos**: un momento es un **evento de hook + una condición que la máquina evalúa sin juicio** (`cada turno` = `UserPromptSubmit`; `al escribir` = `PreToolUse` sobre un `.md` bajo `.claude/`; `al cerrar tarea` = `Stop`, aún sin repartidor).
- `establecer-conducta/` — el **hook repartidor**: un mismo script sirve a varios eventos; resuelve qué momento realiza el evento que lo disparó, lee el registro **vivo** y emite el `Contenido` de las reglas `inyectar` `vigente` de ese momento como `additionalContext`. Agregar o cambiar una regla **no toca el hook**.
- `lint-conducta/` — valida que toda regla apunte a un momento existente, con clase/estado válidos, y que ninguna regla `vigente` cuelgue de un momento sin repartidor.

**Clases de acción:** `inyectar` (el agente lee un texto y actúa con su juicio) · `correr` (una Herramienta lo resuelve sin juicio) · `bloquear` (se frena la acción; solo donde Y es sin juicio y el falso positivo es imposible).

**Why:** una regla cargada al arranque **se recita, no se obedece** (conocimiento `modos-de-falla-ante-reglas-escritas`). El aporte de conducta es entregar la regla **en el momento** en que hace falta, no al inicio de la sesión — por eso el registro **NO se carga siempre** y el agente **no lo consulta a mano**: lo entrega el hook cerca del punto de acción.

**Gobernanza:** se edita al **agregar, modificar o dar de baja una regla**. Toda regla nueva que toque terminología o decisiones pasa por el usuario (el agente propone; ratificar es potestad del usuario).

**How to apply:**

1. **En el flujo normal, no consultar `INDICE.md` a mano** — el hook entrega la regla que corresponde a cada momento.
2. **Para agregar una regla:** elegir un momento existente de `MOMENTOS.md` (o declarar uno nuevo, en `declarado` hasta que tenga repartidor), sumar la fila a la sección que corresponda (`Reglas Base` si la manda el harness, `Reglas del Propósito` si es de este repo), y correr el lint. Una regla `vigente` no puede colgar de un momento sin repartidor: va en `pendiente`.
3. **Al cerrar** una tarea que tocó conducta, correr el lint: `node .claude/conducta/lint-conducta/lint-conducta.js`.

Relacionado: [[flujo-planes]] (construcción del subsistema por plan), [[semantica]] (el control de terminología consume los momentos `cada turno` y `al escribir`).
```

## §Manifiesto — `.claude/conducta/MANIFIESTO.md`

Contenido EXACTO (si el archivo no existe, crearlo con esto; si existe, reconciliar sin pisar):

`````markdown
# Conducta — manifiesto de subsistema

El subsistema `conducta` asegura comportamientos del tipo "cuando hagas X, asegurate de Y": ata **momentos** del flujo (evento de hook + condición sin juicio) a **acciones** (inyectar un texto, correr una Herramienta, bloquear). Vive en este directorio (`conducta/`): el registro de reglas en `INDICE.md`, el vocabulario de momentos en `MOMENTOS.md`, y el hook repartidor `establecer-conducta/`, que entrega en cada momento la regla que corresponde. Viene con una **Base** instalada (respetar preferencias, contrastar al escribir, registrar cambios) y admite reglas del Propósito de cada repo. Modelo completo en la memoria `feedback_conducta.md`.

**Disparador:** en el flujo normal el agente **no** consulta este registro a mano — lo entrega el hook. Se edita al **agregar, modificar o dar de baja una regla**; toda regla nueva que toque terminología o decisiones pasa por el usuario (el agente propone; ratificar es potestad del usuario).

**Skills:** ninguna de operación aún — las entrega el hook repartidor `establecer-conducta`; instalación con `inicializar-conducta`.

**Índice: NO se carga siempre**: cargar las reglas al arranque es el modo de falla que este subsistema corrige (una regla cargada al inicio se recita, no se obedece — conocimiento `modos-de-falla-ante-reglas-escritas`). El registro se consulta a demanda solo para gestionarlo. Al cerrar una tarea que tocó `conducta`, correr el lint desde la raíz del repo:

```bash
node .claude/conducta/lint-conducta/lint-conducta.js
```
`````

## §Subsistemas — sección `## Subsistemas` de `AGENTS.md`

Asegurar la sección `## Subsistemas` y, dentro, la línea `@.claude/conducta/MANIFIESTO.md`. **No** quitar las líneas de otros subsistemas: solo agregar la de conducta si falta. Si la sección no existe, crearla con este encabezado + la línea de conducta:

```markdown
## Subsistemas (manifiestos siempre cargados)

Cada subsistema tiene un **Manifiesto** (`.claude/<sub>/MANIFIESTO.md`): una descripción breve —qué es, cómo se usa, cuándo consultarlo— que va **siempre en contexto** y que **declara si su índice también se carga** incluyendo —o no— la línea `@INDICE.md`. Lo que se carga siempre es el manifiesto, no necesariamente el índice.

Si tu agente no expande imports, **leé estos manifiestos al inicio de la sesión** (y, si el manifiesto importa su índice, ese índice también).

@.claude/conducta/MANIFIESTO.md
```

## §Cableado — hook en `settings.json` y `.codex/hooks.json`

El mismo script (`establecer-conducta.js`) se registra en dos eventos de Claude Code y en uno de Codex. **Merge, nunca pisar:** sumar estas entradas a las que ya existan (p. ej. un `SessionStart` de otra funcionalidad); si la entrada de `establecer-conducta` ya está, no duplicar.

**Claude Code** — merge en `.claude/settings.json` del repo:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/conducta/establecer-conducta/establecer-conducta.js"
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/conducta/establecer-conducta/establecer-conducta.js"
          }
        ]
      }
    ]
  }
}
```

**Codex CLI** — merge en `.codex/hooks.json` del repo (solo `UserPromptSubmit`: el momento `al escribir` es Claude-first):

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/conducta/establecer-conducta/establecer-conducta.js"
          }
        ]
      }
    ]
  }
}
```

> Codex carga hooks de proyecto solo si la capa `.codex/` del repo está **trusted** (revisar con `/hooks`) y con `features.hooks` habilitado en su config. Avisarle al usuario al instalar.
