# Referencias colgadas a decisiones del harness en las skills inicializar-*

**Estado: Nuevo · Creado 26-07-22.** Traspaso del **agente salud** (26-07-22), que lo detectó sobre su propio repo consumidor. Al inicializar un repo con las skills de setup, los componentes instalados **citan por número decisiones del diseño del harness** (0004, 0008, 0010) que **no se siembran** en el `decisiones/INDICE.md` del repo destino ⇒ el repo cita decisiones que no puede resolver.

## El hallazgo

Las skills `inicializar-*` (glosario, memoria, herramientas, decisiones, conocimiento, preferencias) instalan componentes —lints `.js`, docs de memoria, tabla del glosario, secciones de `AGENTS.md`— cuyo texto referencia decisiones del harness **por número**. Pero esas decisiones no viajan al repo destino: su `decisiones/INDICE.md` arranca vacío mientras el código y los docs referencian 0004 / 0008 / 0010.

Consecuencias concretas:

- Un usuario que quiera entender *"por qué el lint hace X (decisión 0008)"* no tiene dónde leerlo: la referencia apunta a un registro que no existe en su repo.
- Numerar una decisión local nueva es **ambiguo**: ¿la primera del usuario es `0001` (choca conceptualmente con la 0004 citada en su código) o `0011` (asume una numeración del harness que él no ve)?

## Causa raíz

Los templates de las skills traen los **números hardcodeados**, asumiendo un registro de decisiones del harness que la inicialización **no instala** en el repo destino. Los números que citan son correctos respecto del harness (0004 = gobernanza de terminología, 0008 = lints co-ubicados, 0010 = `AGENTS.md` fuente única) — el problema no es el número, es que el registro que los define no acompaña al template.

## Referencias detectadas (10 refs · 3 decisiones · 8 archivos)

Barrido del agente salud sobre su repo (solo cubrió los subsistemas presentes: glosario, memoria, herramientas, decisiones, conocimiento, preferencias):

**decisión 0004** — gobernanza del glosario (agente propone; usuario ratifica/veta):
- `.claude/glosario/INDICE.md:14`
- `.claude/memoria/feedback_glosario.md:14`
- `AGENTS.md:66`

**decisión 0008** — "la profundidad la fija el instalador" / "el lint co-ubicado no es Herramienta":
- `.claude/conocimiento/lint-conocimiento/lint-conocimiento.js:23`
- `.claude/glosario/lint-glosario/lint-glosario.js:11`
- `.claude/memoria/lint-memoria/lint-memoria.js:23`
- `.claude/decisiones/lint-decisiones/lint-decisiones.js:11`
- `.claude/herramientas/lint-herramientas/lint-herramientas.js:11`
- `.claude/herramientas/lint-herramientas/lint-herramientas.js:44`

**decisión 0010** — "fuente = `AGENTS.md` en la raíz":
- `.claude/preferencias/lint-preferencias/lint-preferencias.js:20`

## Dos caminos de arreglo (elegir uno, aplicar consistente)

1. **Sembrar las decisiones-base** (0004, 0008, 0010 y cualquier otra que los templates citen) en el `decisiones/INDICE.md` al inicializar. Las refs resuelven y el repo arranca con su fundamento documentado. Exige **definir una numeración reservada del harness** para que las decisiones locales arranquen por encima (ej.: locales desde `0100`), y decidir cómo se marca lo que es del harness vs lo del repo.
2. **Despersonalizar los comentarios**: sacar el número y dejar solo la justificación (ej.: `// el lint co-ubicado NO es Herramienta`, sin `decisión 0008`). Más simple, pero se pierde la trazabilidad.

Recomendación del agente salud: opción 1 si se quiere trazabilidad; opción 2 si las decisiones del harness no deben aparecer en el registro local del usuario. **A decidir con `planificar`.**

## Pendiente de verificación

Verificar si hay **más números citados** además de 0004 / 0008 / 0010 en otras skills **no instaladas** en el repo donde se detectó (el barrido cubrió solo los seis subsistemas presentes). El harness tiene decisiones hasta 0021: relevar cuáles filtran a los templates.

## Cruce con material del repo

- Toca la **decisión 0008** (lints co-ubicados) y el patrón instalador→consumidor: es exactamente el tipo de referencia que 0008 introdujo en los lints.
- Se relaciona con `Separar mecánica del harness de criterio del autor` (qué del harness viaja al repo del usuario y con qué forma) y con `Analizar la auditoría externa del 2026-07-21` (que ya lista huecos de lo distribuible: vetos en PLANTILLAs, datos personales). No lo cubren: ninguno ataca las **refs a decisiones por número** en los templates.

## Diseño decidido (26-07-23, `planificar` → decisión 0024)

**Camino 2: sacar el número.** El texto distribuido no expone el registro de decisiones del harness — enuncia la regla/razón inline, sin número. Se descartó Camino 1 (instalar las decisiones-base): ensucia el registro del consumidor con arquitectura interna del harness (choca con 0001) y **crea** la ambigüedad de numeración que decía resolver (exige rango reservado); Camino 2 la disuelve gratis (el consumidor arranca en 0001).

**Regla operativa:** un número de decisión solo aparece en archivos que **nunca** se instalan en un consumidor.

- **Sacar número** (se escribe en el consumidor): lints `.js` (un solo archivo en los dos roles), `MANIFIESTO.md` (los 6), gobernanza en `glosario/INDICE.md` + `feedback_glosario.md`, bloques que los skills agregan a `AGENTS.md`, PLANTILLAs + gemelos Textual en el orquestador.
- **Conserva número** (queda en el harness): `SKILL.md`/`README.md` de instalación, páginas de detalle, `PLANES.md`/planes, prosa propia de `AGENTS.md`.

La justificación ya está inline en cada caso ⇒ sacar el número no pierde información; `decisiones/INDICE.md` sigue siendo la fuente de procedencia.

**Alcance real (mayor que las 3 decisiones / 8 archivos de salud):** las PLANTILLAs + el orquestador citan **6** decisiones del harness — 0004, 0008, 0010, 0011, 0017, 0019 — y **0017 aparece en cada MANIFIESTO** (item que el barrido original no listó). El barrido de arreglo cubre todo el lado distribuido, no solo los 6 subsistemas del repo donde se detectó.

**Guarda de regresión:** `lint-harness` gana un chequeo que falla si un archivo distribuible cita `decisión NNNN` (regex `dec(isión|ision|\.)? \d{4}` sobre PLANTILLAs + lints + MANIFIESTOs + docs de gobernanza).

## Notas de implementación (26-07-23)

Ejecutado en una pasada. **Camino 2** aplicado; decisión **0024** registrada.

- **Barrido:** script auditable (`.claude/tmp/sacar-numeros-decision.js`, dry-run + `--write`) sobre lista blanca explícita — **52 citas en 22 archivos** (6 MANIFIESTO de subsistema, 7 lints distribuidos, 2 memorias `feedback_`, 8 PLANTILLAs + orquestador). 4 reglas de sacado (coma / guion-antes / guion-después / paréntesis entero), conservando la razón inline.
- **Quirúrgico** en los 2 archivos mixtos (preámbulo-plantilla saca; filas de contenido propio conservan): `glosario/INDICE.md` (encabezado de gobernanza) y `herramientas/INDICE.md` (preámbulo 0007/0008; la fila de `lint-harness` conserva `dec. 0017/0019/0024`).
- **Fuera de alcance a propósito:** `conducta/*` (aún no es funcionalidad distribuible; su plan de empaquetado aplicará 0024) y `lint-harness` (Herramienta de este repo, no viaja).
- **Hallazgo:** el `§Manifiesto` de las PLANTILLAs ya estaba sin número, pero la copia propia del harness le había agregado `(decisión 0017)` ⇒ había divergencia Textual; el sacado **re-sincronizó** (chequeo `[4]` verbatim verde).
- **Guarda de regresión:** chequeo `[9]` en `lint-harness` — falla si un distribuible (PLANTILLA / MANIFIESTO de subsistema / lint distribuido) cita `decisión NNNN`; excluye `conducta` y `lint-harness`. Probado en negativo (caza las 4 formas; deja pasar `0024`-sin-palabra y `año 2024`).
- **Versiones:** 8 plugins con patch subido (glosario 0.4.5, decisiones 0.4.4, memoria-local 0.4.5, conocimiento 0.5.3, herramientas 0.4.5, preferencias-trabajo 0.4.1, gestion-de-planes 0.4.4, setup-completo 0.5.7).
- **Control de cierre 10/10 verde** (9 lints + `plugin validate`).

**Pendiente menor (follow-up, no bloquea):** cuando se empaquete `conducta` como funcionalidad, aplicarle 0024 (su MANIFIESTO + `lint-conducta` + `INDICE`) y sacar su exclusión de la guarda `[9]`.
