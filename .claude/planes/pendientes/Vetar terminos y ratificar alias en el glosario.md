# Vetar términos y ratificar alias en el glosario

**Estado: En curso · Creado 26-07-19.** Extiende el plan ejecutado [Propagar gobernanza de terminología al harness](../ejecutados/Propagar%20gobernanza%20de%20terminologia%20al%20harness.md) (26-07-18, commit `4ff41ee`), que llevó la [decisión 0004](../../decisiones/INDICE.md) a las funcionalidades. Aquel plan puso el control sobre **conceptos**; este lo extiende a **alias** y agrega lo que 0004 no contempla: **prohibir**, no solo registrar.

> **Mitad ejecutada el 26-07-20** (commit `edb0bd6`): el **barrido de texto** está hecho — ~250 reemplazos en 56 archivos, canónicos incluidos, Base v2→v3 propagada. Falta la **parte estructural**: columna `Vetados`, cambios al `lint-glosario` y la decisión nueva. Detalle abajo en "Estado de ejecución".

## El problema

La filosofía actual es "los alias **se registran, no se prohíben**" (memoria [feedback glosario](../../memoria/feedback_glosario.md), `README.md`, `SKILL.md`, `prompt.md`, `CLAUDE.md`). Sirve para mapear "birra/chela = cerveza", pero tiene un efecto no querido: **registrar un alias lo legitima**. Un término confuso o en inglés ("roster", "gate") queda asentado como válido ⇒ el agente lo sigue usando ⇒ reaparece en prosa, memorias y hasta en el código. El glosario, que existe para dar coherencia, termina conservando el desorden.

Contraste con la [decisión 0005](../../decisiones/INDICE.md), que ya resolvió el caso opuesto a mano: al renombrar los estados de planes, "los términos viejos se **barren, no se registran como alias**". Eso fue una excepción manual porque el modelo no tenía dónde poner un término muerto. Este plan le da lugar.

## Qué ya está resuelto (por el plan del 26-07-18)

- **Gate duro sobre conceptos.** El header de `glosario/INDICE.md` dice: *"Toda entrada nueva pasa por el usuario: el agente puede proponer términos (marcados como propuestos), pero no se asientan como canónicos sin ratificación."* Ya propagado a `funcionalidades/glosario/` (prompt + SKILL + PLANTILLA) y al orquestador.
- **La regla en la Base de preferencias** (`harness v2`), que viaja a todo repo nuevo.
- **La decisión 0004** asentada y vigente.

## Qué falta (lo que abre este plan)

1. **El gate cubre conceptos, no alias.** "Toda entrada nueva" se leyó siempre como fila nueva. Un alias agregado a una fila existente entra sin ratificación.
2. **"Propuesto" no tiene forma mecánica.** El texto dice "marcados como propuestos" pero no define **cómo** se marca ⇒ el lint no puede verlo ni recordarlo.
3. **No existe el veto.** No hay manera de decir "este término no se usa más, usá aquel".
4. **El lint nunca mira fuera de `.claude/glosario/`.** Aunque hubiera vetados, no sabría dónde aparecen.

## Diseño acordado (a ratificar)

### Modelo: términos con estado

El glosario deja de tener "conceptos con alias" y pasa a tener, por concepto, un conjunto de **términos**, cada uno con un estado — un solo eje, como `ESTADOS.md` en planes:

- **canónico** — la celda `Concepto`. Es el nombre bueno.
- **alias** — forma válida alternativa. Ratificada por el usuario.
- **propuesto** — alias que el agente sugiere. No se usa hasta ratificarse.
- **vetado** — prohibido. **Su reemplazo es el canónico de su propia fila** — no hace falta columna de reemplazo.

### Tabla

```
| Concepto | Definición | Alias | Propuestos | Vetados | Detalle |
```

```markdown
| **Textual** | Copia idéntica carácter a carácter entre la fuente y sus duplicados. | literal | idéntico | verbatim, byte-exact | — |
| **Control** | Chequeo que frena el avance si no se cumple. | validación | — | gate | — |
```

- **Alias** — válidos, ratificados. Separados por coma; `—` si no hay.
- **Propuestos** — sugeridos por el agente, **sin usar** hasta que el usuario los mueva a Alias o a Vetados. Es un buzón, no un estado de reposo.
- **Vetados** — prohibidos; reemplazar por el Concepto de la fila.
- Columnas nuevas **antes** de `Detalle` ⇒ el parser posicional del lint cambia sí o sí (hoy lee `cells[3]` como detalle). Se actualiza en el mismo movimiento.

### Reglas de gobernanza

- El agente **nunca** escribe en `Alias` ni en `Vetados`: solo propone en `Propuestos`. Vetar es potestad del usuario.
- El agente **nunca** usa un término que esté en `Propuestos` o en `Vetados` en prosa, memorias, planes ni código.
- Vetar un término no lo borra del repo: lo marca para barrer. La limpieza la guía el lint.

## Lint: qué chequea

Chequeos actuales, con [3] extendido:

- **[1]** links de `Detalle` rotos — sin cambios.
- **[2]** páginas huérfanas — sin cambios.
- **[3]** colisiones — ahora sobre las tres columnas de términos:
  - mismo término como alias en dos conceptos ⇒ **error** (ya existía);
  - término como alias en una fila y vetado en otra ⇒ **error duro** (contradicción: el glosario lo bendice y lo prohíbe a la vez);
  - mismo término vetado en dos filas ⇒ **no es error**: es un vetado **ambiguo** (`gate` reemplaza a "control" en un contexto y a "compuerta" en otro). Se reporta como tal y se pide página de `Detalle`.

Nuevos:

- **[4] Propuestos pendientes de ratificación** — lista de términos en la columna `Propuestos` con su concepto. Recordatorio, no error: existe para que el buzón no se vuelva depósito.
- **[5] Apariciones de vetados en el repo** — barrido recursivo desde la raíz. Reutilizar `walk()` + `EXCLUDE` de [`lint-conocimiento.js`](../../conocimiento/lint-conocimiento/lint-conocimiento.js) (líneas 6-18: excluye `.git`, `node_modules`, carpetas `lint-*`). Match `\b<término>\b` case-insensitive. Salida en **dos baldes**:
  - **prosa** — texto de `.md` **fuera** de cercas ``` ``` ``` y fuera de backticks inline. Se limpia reescribiendo; acción inmediata.
  - **código** — archivos de código, contenido de cercas, backticks inline y nombres de archivo/carpeta. Tocarlo es refactor: puede romper refs por ruta en `settings`, `.gitignore` o hooks (misma advertencia que Herramientas). Informativo, nunca automático.
  - **Autoexclusiones obligatorias**: `.claude/glosario/` (el índice contiene los vetados por definición) y `planes/ejecutados/` + `planes/descartados/` (histórico congelado: reescribir el pasado falsea el registro).

Sin `process.exit(1)`, coherente con la familia de lints (decisión 0003, capa mecánica).

## Insumo: barrido del 2026-07-19 (sesión de skills operativas)

Barrido real del repo (`.md`, prosa + textos duplicados) hecho al detectar que el agente seguía propagando términos en inglés. Estado de cada término al 2026-07-19:

| Término en circulación | Alcance medido | Canónico | Estado |
|---|---|---|---|
| `levelear` / `leveleo` / `leveling` | ~30 usos (todos los SKILL.md/prompt.md, Base de preferencias) | **Nivelar** (alias: poner al día) | **Ratificado 26-07-19**, ya en glosario; los tres términos quedan para la columna Vetados |
| `verbatim` / `byte-exact` / `byte-check` | 63 usos en 36 archivos (memorias, planes, lint-harness) | **Textual** (alias: literal, carácter a carácter) | **Ratificado 26-07-19**, ya en glosario; los tres quedan para Vetados |
| `gate` / "Gate duro" | ~25 usos — incluida la **Base de preferencias** (la propia regla de terminología) y la decisión 0004, con 6+ copias en funcionalidades | **Control** | **Ratificado 26-07-19**, ya en glosario; `gate` queda para Vetados |
| `harness` | **175 usos en 55 archivos**, incluido el identificador del marketplace (`xelnagah-harness`) | **Harness** (ratificado como canónico; alias "setup estándar") | **Ratificado 26-07-19**, ya en glosario |
| `skill` vs "habilidad" | ambos en uso por el usuario | **Skill** (canónico; alias "habilidad") | **Ratificado 26-07-19**, ya en glosario |

| `slug` | CLAUDE.md §Planes, `PLANES.md`, memoria del flujo de planes, funcionalidades | "nombre estable (sin fecha)" — sin entrada de glosario: los planes no tienen id, el nombre del archivo es la identidad | **Ratificado 26-07-19**; `slug` queda para Vetados |
| `prosa` | plan de veto (baldes del barrido), sesión de skills | **Texto plano** | **Ratificado 26-07-19**, ya en glosario; `prosa` queda para Vetados (los baldes de este plan pasan a "texto plano" / "código" al ejecutarlo) |

Nota: la Base de preferencias usa "gate" para enunciar la regla que prohíbe términos como "gate" — al ejecutar este plan, reescribirla implica **Base v3 + propagación textual**. *(Hecho el 26-07-20.)*

## Insumo: ratificaciones del 2026-07-20

Barrido nuevo (87 `.md` + 10 `.js`) al detectar que los términos del 26-07-19 seguían circulando sin bajar al texto. Ratificados en sesión:

| Término | Usos medidos | Canónico | Nota |
|---|---|---|---|
| `baldes` | 33 | **grupos** | calco de "buckets"; estaba en `AGENTS.md` |
| `linkea` / `linkear` | 31 | **apunta a**, **enlaza** | estaba en la decisión 0007 |
| `semilla` | 23 | **contenido inicial** | calco de "seed" |
| `stale` / `staleness` | 21 | **desactualizado** / **desactualización** | estaba en glosario y decisión 0003 |
| `bump` / `bumpear` | 15 | **subir la versión** | estaba en `AGENTS.md` |
| `cementerio de tools` | 14 | **herramientas desordenadas** | el texto ya lo glosaba al lado ⇒ la metáfora no trabajaba |
| `Workflow` (encabezado) | 10 | **Flujo de trabajo** | única sección con título en inglés |
| `reconcile-on-use` | 6 | **se ponen al día cuando se usan** | acuñado en inglés, sin glosar |
| `sigilo` | 2 | **símbolo** | falso amigo: traducía *sigil*, no *disimulo* |
| `plomería` | 1 | **infraestructura interna** | metáfora |

**Aceptados en inglés** (decisión del usuario, van a Alias no a Vetados): `parsear`, `pushear`, `refactor`, `legacy`, `flag`, `idempotente`, más la infraestructura ya asentada (`hook`, `commit`, `lint`, `plugin`, `junction`, `marketplace`, `harness`, `skill`).

**Sin resolver:** `artefacto` (19 usos) → propuesto **archivo de estado**; implica renombrar la memoria `feedback_artefacto_estado.md` y arreglar referencias entrantes. Esperando definición.

**Regla de fondo acordada:** el veto no se enuncia como lista de prohibidos (infinita) sino contra la **lista aprobada** — si el término del dominio no está en el glosario, no se usa como establecido. Ver la memoria [terminología canónica](../../memoria/feedback_terminologia_canonica.md).

## Estado de ejecución

**Hecho (26-07-20, commit `edb0bd6`):**

- Barrido de texto completo: canónicos (`PREFERENCIAS.md`, `AGENTS.md`, glosario, decisiones), memorias, planes vivos, las 10 funcionalidades y el orquestador.
- Base v2 → v3, verificada con el mismo md5 en los tres lugares; v2 registrada en `§Bases anteriores` para que la reconciliación distinga base desactualizada de base editada a mano.
- Plugins 0.3.0 → 0.4.0.

**Falta (la parte estructural de este plan):**

- Columna `Vetados` en el glosario + las tres preguntas abiertas de abajo.
- Cambios al `lint-glosario` ([3], [4], [5] de la sección de lint).
- Decisión nueva en el registro.
- **Hueco detectado el 26-07-20:** `lint-harness` **no compara la Base** entre `PREFERENCIAS.md` y las dos `PLANTILLA.md` — no tiene ninguna referencia a preferencias. La divergencia de hoy no la habría cazado nadie; se verificó a mano. Sumar ese chequeo entra naturalmente acá, que ya toca lints.

## Preguntas abiertas

1. **¿Columna `Propuestos` propia, o marca inline en `Alias`?** Columna: 6 columnas, más ancha, pero el lint la lee sin parsear sigilos y el pendiente se ve de un vistazo. Inline (`nómina, ?lista de jugadores`): tabla angosta, pero introduce un sigilo críptico — roza el "español corriente en todo" de la Base v2. **Recomendación: columna propia.**
2. **¿El veto necesita motivo?** Hoy no hay dónde ponerlo. Si hace falta, va en la página de `Detalle` del concepto, no en una columna más.
3. **¿Se replantea la frase "los alias se registran, no se prohíben"?** Sigue siendo cierta para los alias; deja de describir el subsistema entero. Reescribirla en los 5 lugares donde aparece (memoria, README, SKILL, prompt, CLAUDE.md) — no borrarla.

## Impacto de propagación

Doble formato + orquestador (`CLAUDE.md` §Mantenimiento, memoria [feedback propagación harness](../../memoria/feedback_propagacion_harness.md) — delegar a subagente fresco, verificar byte-exactness uno mismo):

1. **Repo local**: `.claude/glosario/INDICE.md` (columnas + header de gobernanza), `.claude/glosario/lint-glosario/lint-glosario.js` + su `README.md`, `.claude/memoria/feedback_glosario.md`, `.claude/CLAUDE.md` §Glosario.
2. **Funcionalidad** `funcionalidades/glosario/`: `prompt.md` (agnóstico), `skills/inicializar-glosario/SKILL.md`, `PLANTILLA.md` (§Glosario semilla **y** §Script — el lint va verbatim), `README.md`, `plugin.json` (bump `version`; su `description` todavía dice *"término canónico + sinónimos a evitar"*, residuo del modelo viejo que este cambio vuelve casi cierto pero mal redactado — corregir).
3. **Orquestador** `funcionalidades/setup-completo/`: `PLANTILLA.md` + `prompt.md` duplican los textos verbatim.
4. **Registro**: decisión nueva en `.claude/decisiones/INDICE.md` (el veto condiciona el repo a futuro ⇒ entra por criterio). `REGISTRO.md` si cambia la descripción de la funcionalidad.

## Verificación

- `node .claude/glosario/lint-glosario/lint-glosario.js` — verde con el índice real; probar con un vetado sembrado a propósito y confirmar que lo caza y lo clasifica bien (prosa vs código).
- `node .claude/herramientas/lint-harness/lint-harness.js` — verde (byte-exactness del script entre `lint-glosario.js`, `PLANTILLA.md` §Script de la funcionalidad y el orquestador).
- `claude plugin validate .` — verde.
- `inicializar-glosario` en un repo scratch instala la tabla de 6 columnas vacía + el lint nuevo.
- Corrida real del barrido sobre este repo: revisar que las autoexclusiones no dejen ruido (falsos positivos en planes vivos, memorias).

## Correr por

`planificar` — es diseño estructural del subsistema y toca terminología, gobernada por 0004.
