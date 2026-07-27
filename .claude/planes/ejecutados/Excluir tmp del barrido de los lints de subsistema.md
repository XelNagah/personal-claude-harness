# Excluir tmp del barrido de los lints de subsistema

**Estado: Ejecutado · Creado 26-07-26 · Cerrado 26-07-27.** Origen: reporte del Agente-Coordinador del 26/07/2026, con evidencia de su propio repo (corriendo `amp` 0.6.16, 3 de 5 apariciones del vetado `estacionar` que reportó `lint-semantica` salían de un handoff en `.claude/tmp/`). El arreglo es de este repo: el defecto está en la plantilla de `amp:inicializar`, la corrección viaja a todos los consumidores por el plugin y la versión la sube el harness.

## El problema

Los lints de subsistema barren directorios y cuentan hallazgos que salen de `.claude/tmp/`: material de trabajo descartable —handoffs, notas de sesión, borradores— que **el propio harness declara no versionado** (`amp:inicializar` asegura la línea `.claude/tmp/` en el `.gitignore` del consumidor).

Es el mismo defecto ya corregido para `.respaldo-amp`, que sí está en `EXCLUDE`: hallazgos que nadie va a corregir porque el archivo se borra, ahogando la señal real.

Medido en este repo el 26/07/2026: `lint-semantica` reporta **236 apariciones de vetados (103 prosa + 133 código) y 51 de ellas —el 21%— tienen ruta `.claude/tmp/`**.

## Los seis puntos a tocar

Tres en lo que viaja (`funcionalidades/amp/skills/inicializar/PLANTILLA.md`) y tres en los lints vivos de este repo, que es el harness aplicado a sí mismo. No hay una fuente única de la que deriven: la pieza está duplicada a mano en las seis.

**Grupo A — `EXCLUDE` de cinco entradas** (lint-conocimiento y lint-semantica):

- `funcionalidades/amp/skills/inicializar/PLANTILLA.md:394` — §Script lint-conocimiento
- `funcionalidades/amp/skills/inicializar/PLANTILLA.md:1006` — §Script lint-semantica
- `.claude/conocimiento/lint-conocimiento/lint-conocimiento.js:8`
- `.claude/semantica/lint-semantica/lint-semantica.js:122`

```js
// antes
const EXCLUDE = new Set(['.git', 'node_modules', '.respaldo-amp', 'exports', 'pdfs']);
// despues
const EXCLUDE = new Set(['.git', 'node_modules', '.respaldo-amp', 'tmp', 'exports', 'pdfs']);
```

**Grupo B — `EXCLUDE` de tres entradas** (lint-memoria):

- `funcionalidades/amp/skills/inicializar/PLANTILLA.md:2676`
- `.claude/memoria/lint-memoria/lint-memoria.js:8`

```js
// antes
const EXCLUDE = new Set(['.git', 'node_modules', '.respaldo-amp']);
// despues
const EXCLUDE = new Set(['.git', 'node_modules', '.respaldo-amp', 'tmp']);
```

> Las líneas son las del 26/07/2026 con `amp` en 0.6.16; si la plantilla se movió, buscar por `EXCLUDE` / `.respaldo-amp`.

## El comentario inline

El comentario que acompaña al `EXCLUDE` hoy explica solo `.respaldo-amp`. Un `tmp` sin razón escrita se borra en la próxima limpieza, así que en los seis puntos, a continuación de las dos líneas que ya están, va (ASCII sin tildes, como el resto de los comentarios de los lints):

```js
// 'tmp' es material de trabajo descartable (handoffs, notas, borradores) que el propio harness
// gitignorea: sus hallazgos no se corrigen, se borra la carpeta. Excluye por NOMBRE, en
// cualquier nivel del repo, no solo `.claude/tmp/`.
```

## Salvedades

- **`EXCLUDE` filtra por NOMBRE, no por ruta.** `lint-semantica` barre desde la raíz del repo, así que `'tmp'` saca de la barrida *cualquier* carpeta llamada `tmp` en cualquier nivel, no solo `.claude/tmp/`: en un consumidor con `src/tmp/` de contenido real, ese contenido deja de mirarse. Es el mismo alcance que ya tienen `exports` y `pdfs`, y `tmp` es descartable por convención universal — se acepta y se declara en el comentario. Alternativa más quirúrgica, evaluada y descartada por complejidad: sumar `path.join(repoRoot, '.claude', 'tmp')` al `AUTOEXCL` de lint-semantica, que sí es por ruta.
- **El grupo B es funcionalmente inocuo hoy.** lint-memoria y lint-conocimiento barren solo su propio subsistema (`.claude/memoria`, `.claude/conocimiento`) y `.claude/tmp/` no cuelga de ahí; solo actuaría si alguien creara `memoria/tmp/`. Se hace igual por uniformidad de la pieza compartida, pero **el arreglo real es el de lint-semantica**.
- **Ningún lint necesita mirar `tmp/`.** Verificados los nueve (`memoria`, `preferencias`, `planes`, `conocimiento`, `semantica`, `decisiones`, `herramientas`, `conducta`, `harness`): ninguno lo referencia.
- **`lint-harness` no lo detecta.** Su chequeo de texto literal divergente compara tres fragmentos anclados (`raiz del repo`, `resolucion de refs`, `atribucion por ancestro`) y la línea `EXCLUDE` no está entre ellos: tocar solo la plantilla no dispararía alarma. Por eso las seis de una.

## Cierre

- **No amerita decisión asentada**: es la extensión mecánica de un criterio ya vigente (no barrer lo descartable y no versionado), no condiciona el repo a futuro ni re-decide nada. La razón va inline en el comentario — los archivos distribuibles no citan números de decisión de este repo.
- **Sí amerita subir `funcionalidades/amp/.claude-plugin/plugin.json` de `0.6.16` a `0.6.17`**, porque el texto viaja.

## Fuera del pedido — mismo defecto, otras dos piezas

Detectadas al analizar; se resuelven con este plan o se dejan asentadas al cerrarlo:

- `.claude/herramientas/inventariar-componentes-sueltos/inventariar-componentes-sueltos.js:36` — el set `INFRA` no lista `'tmp'`, así que reporta `tmp/` como componente suelto en cada corrida, acá y contra cualquier consumidor al que se lo apunte.
- `funcionalidades/amp/skills/actualizar/amp-actualizar.js:215` — el `EXCL` del respaldo no excluye `tmp`: hoy se lleva material descartable al respaldo, que es de un solo uso y se borra.

## Verificación esperada

1. `node .claude/semantica/lint-semantica/lint-semantica.js` — cero hallazgos con ruta `.claude/tmp/` (hoy 51) y total de 236 a ~185.
2. `node .claude/memoria/lint-memoria/lint-memoria.js` y `node .claude/conocimiento/lint-conocimiento/lint-conocimiento.js` — salida sin cambios.
3. `node .claude/herramientas/lint-harness/lint-harness.js` — sin divergencias nuevas.
4. `claude plugin validate .` — limpio.

## Notas de implementación

- **26-07-27** — `tmp` quedó excluido en los lints vivos de memoria, conocimiento y semántica, y en sus tres copias distribuidas. El inventario lo reconoce como infraestructura y el nivelador no lo incluye en respaldos. `amp` sube a `0.6.22`.
- **Verificación:** `lint-semantica` no informa rutas bajo `.claude/tmp/`; memoria, conocimiento e inventario dan salida limpia; los tres lints embebidos coinciden byte a byte con sus fuentes. El control de cierre queda sin divergencias, salvo los plugins locales instalados en versiones anteriores.
