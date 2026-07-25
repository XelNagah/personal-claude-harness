# Modelo de distribución y empaquetado del harness

**Estado: Ejecutado · Creado 26-07-23 · Cerrado 26-07-25.** Diseño acordado en una sesión larga del agente `automejora` (repo `como-uso-claude`); traspaso a este repo, que es su dueño. Corrió en parte por `planificar` (esta sesión). **Ratifica y refina** las decisiones 0009/0010/0013; suma piezas nuevas (nivelador consolidado, subagentes, plantilla de estructura empaquetada en el plugin).

## Contexto

La sesión arrancó preguntando por subagentes en un AMP y derivó en repensar la **distribución y actualización** del harness ahora que se consolidó como Producto concreto (el Agente Multipropósito). Se recorrió el árbol de opciones a fondo. Este plan **captura el diseño acordado** para no re-derivarlo; la ejecución (y el asentado formal de las decisiones nuevas) queda para cuando se tome.

## Qué se decidió (firme)

1. **Distribución = marketplace / skills globales (Modelo A).** Ratifica 0010 (skills a nivel usuario) y 0013 (plugin-install en Claude, junction en Codex). Se evaluó y **descartó** el Modelo B (repo-plantilla clonable con todo adentro, "cloná y listo"): motivo — el usuario tiene ~18 AMP; con skills globales una mejora se propaga a todos con un `/plugin update`; con B habría que actualizar repo por repo, y se pierde el prefijo `plugin:skill`.

2. **Empaquetado = multi-plugin por subsistema (ratifica 0013).** Se evaluaron dos variantes estilo Matt Pocock (`mattpocock/skills`): (B) un solo plugin con carpetas de categoría → `amp:registrar-memoria`; (C) un plugin con nombres `<sub>-<verbo>` → `amp:memoria-agregar`. Se **descartaron** a favor del multi-plugin: el subsistema en el prefijo (`amp-memoria:registrar-memoria`) da **claridad operativa** al usar, que el usuario prioriza sobre el menor costo de mantenimiento del plugin único. **Las skills NO se renombran** (el prefijo de plugin da la agrupación) ⇒ 0015 (verbo+objeto) queda intacto.

3. **Los inicializadores se consolidan: 10 `inicializar-<x>` → 1 `amp-inicializar`.** Bajo Modelo A no hay carpeta que se copie por git (las skills viven en cache): la **estructura** (`.claude/` esqueleto + `agents/`) viaja **empaquetada dentro del plugin transversal `amp`** (una plantilla), y `amp-inicializar` la **escribe** en el repo destino. El à la carte pasa a la lógica del skill: `amp-inicializar <sub>` instala un subconjunto (resolviendo dependencias). El sistema de plugins **es** el instalador — no hay `instalar.js` ni `plantilla/` sueltos en la raíz del harness.

4. **`amp-actualizar`: nivelador de estructura consolidado.** La idempotencia hoy repartida en las secciones "Reconciliación" de cada skill se junta en **un** skill que pone al día el `.claude/` de un repo vivo contra la plantilla nueva. Clasifica cada archivo en tres tipos —estructura pura / mixto por región / dominio puro— y reporta en tres grupos (agregado / ya estaba / divergente→pregunta), sin pisar lo divergente. Cubre el requisito duro del usuario: **actualizar los agentes legacy sin romperles el comportamiento**.

5. **Subagentes como componente nuevo del Producto.** Los transversales (investigador, test-runner, code-reviewer) viajan en la plantilla → `.claude/agents/` del consumidor (commiteados, tuneables). Los de dominio se commitean en cada repo consumidor. Análisis fuente en el conocimiento del agente `automejora` (páginas `subagentes-agentes-codigo` y `subagentes-en-harness`).

## Resuelto — Frente 2 (sesión `planificar`, 24/07/2026, decisión 0029)

Los puntos 2, 3 y 4 de "Qué se decidió (firme)" se **concretaron y asentaron** en la decisión **0029**. Diseño final del empaquetado:

- **7 plugins:** `amp` transversal (prefijo `amp:`, skills `inicializar` · `planificar` · `info` · `actualizar`) + 6 `amp-<sub>` con skill de operación (`amp-memoria`, `amp-conocimiento`, `amp-decisiones`, `amp-preferencias`, `amp-planes`, `amp-semantica`). Prefijo `amp-<sub>:` → agrupa al tipear "amp" **y** deja visible el subsistema.
- **Subsistema sin skill de operación** (`herramientas`, `conducta`, `commits`) → **no tiene plugin** hasta que gane una; su estructura la escribe `amp:inicializar`.
- **Bundle completo** vía `dependencies` de `amp` → **1 install/repo, project scope** (no user). Absorbe el fix de `dependencies` (Frente 1) como mecanismo.
- **10 `inicializar-<sub>` → 1 `amp:inicializar`** (sin argumento à la carte; el bundle es siempre todo).
- **Modifica 0013:** prefijo pelado (`memoria:`) → `amp-<sub>:`. Multi-plugin y segmentación por prefijo quedan.

**Ejecución pendiente** (migración coordinada, no hecha aún): reescribir `marketplace.json`, renombrar carpetas de `funcionalidades/` a `amp-<sub>` + fusionar `setup-completo`/`planificar`/`amp-actualizar` en `amp`, cablear `dependencies`, renombrar las 4 skills transversales, actualizar junctions/REGISTRO/AGENTS, `claude plugin validate`. Cuidado: `amp-actualizar` está instalado como plugin vivo → la migración lo rompe si se hace suelto. Cruza con `Nombres y distribucion de las skills del harness`. Follow-up de terminología: el término vetado esta sesión (ver `TERMINOLOGIA-FARLOPA.md`) aparece en el `SKILL.md` de `planificar` → barrer y propagar.

## Forma del repo (publicado como marketplace)

```
harness/  (se publica como marketplace)
├── .claude-plugin/marketplace.json          lista los plugins amp-*
├── plugins/
│   ├── amp/                                  plugin transversal
│   │   ├── .claude-plugin/plugin.json
│   │   ├── skills/{amp-inicializar, amp-actualizar, amp-planificar, amp-info}/
│   │   └── plantilla/                        ESTRUCTURA empaquetada (.claude/ esqueleto + agents/)
│   │                                         que amp-inicializar ESCRIBE en el destino
│   ├── amp-memoria/    plugin.json + skills/registrar-memoria/
│   ├── amp-planes/     plugin.json + skills/ciclo-de-plan/
│   └── amp-conocimiento/ … amp-glosario/ … amp-decisiones/ … amp-herramientas/ …
├── AGENTS.md · CLAUDE.md · README.md
└── .claude/                                  el harness probándose a sí mismo (su propio dato)
```

- La plantilla de estructura vive **dentro** del plugin `amp` (viaja en el cache) → `amp-inicializar` la tiene disponible aunque el destino esté vacío.
- La raíz del consumidor queda limpia: `amp-inicializar` escribe solo `.claude/` + `AGENTS.md`/`CLAUDE.md`; las skills quedan globales (cache Claude / `~/.agents/skills` Codex).

## Decisiones a asentar al ejecutar

- Consolidación de los inicializadores en `amp-inicializar` + plantilla de estructura empaquetada en el plugin `amp` (refina 0009 y el orquestador `setup-completo`; cruza con `Restaurar la portabilidad copiar y pegar del orquestador`).
- `amp-actualizar` como nivelador consolidado (baja la idempotencia de 0001 a una pieza única).
- Subagentes como componente distribuible (categoría nueva junto a subsistemas y Herramientas).
- Prefijo `amp-` en el nombre de plugin (`amp-memoria`) — **modifica** la cláusula de 0013 que pedía el subsistema pelado (`memoria`). A ratificar (0016).

## Abierto (resolver con planificar al ejecutar)

- **es/en (amp/mpa):** ¿carpetas en un monorepo de autoría que publica un marketplace por idioma, o repos separados? Cruza con `Publicar el harness en ingles`.
- **Marcadores de región gestionada** para archivos mixtos (`AGENTS.md`, `PREFERENCIAS.md`, índices): formato exacto de los delimitadores que `amp-actualizar` respeta al actualizar solo lo de la plantilla. (Nota 24/07/2026: la decisión 0027 —separar Base de aprendido— disuelve buena parte de esto; los marcadores solo harían falta donde Base y aprendido sigan conviviendo en un mismo archivo tras esa separación.)
- **Refresco de autoría** (hueco de 0013): al pasar junction→plugin en Claude se pierde la edición en vivo; falta el flujo de refresco. Cruza con `Restaurar la portabilidad copiar y pegar del orquestador`.
- **Canal-copia opcional** estilo `skills.sh` de Pocock (Modelo B como secundario, para revisar/derivar + multiagente). No urgente.

## Cruces con lo ya decidido/planificado

- **Ratifica:** 0009 (multi-plugin), 0010 (multiagente / skills a nivel usuario), 0013 (segmentación por prefijo de plugin).
- **Precondición:** `Separar origen Base y aprendido en los subsistemas` (decisión 0027) — el nivelador `amp-actualizar` la necesita para saber qué puede pisar.
- **Refina/absorbe:** `Nombres y distribucion de las skills del harness` (ahí viven el `amp-` prefijo y la limpieza de nombres); `Restaurar la portabilidad copiar y pegar del orquestador` (el orquestador se vuelve `amp-inicializar`).
- **Relacionado, NO igual:** `Habilidad para poblar subsistemas desde un repo existente` (Diferido; es descubrimiento/siembra activa, distinto de `amp-actualizar`, que pone al día la estructura); `Publicar el harness en ingles` (es/en).

## Notas de implementación

**Cerrado 26-07-25.** Es un plan paraguas: capturó un diseño completo, y sus partes se ejecutaron o se desprendieron por separado. Cierra porque **no le queda cuerpo propio** — todo lo suyo está ejecutado, asentado como decisión, o vive en un plan con dueño.

**De los 5 puntos "firme":**

| Punto | Dónde terminó |
|-------|---------------|
| 1. Distribución = marketplace (Modelo A) | **Ejecutado.** `.claude-plugin/marketplace.json` publica `xelnagah-harness`; instalación por `/plugin marketplace add` + `/plugin install amp`, documentada en `docs/INSTALAR.md` (decisión 0031) |
| 2. Multi-plugin por subsistema | **Ejecutado**, asentado en la decisión **0029**: 7 plugins (`amp` + 6 `amp-<sub>`), bundle por `dependencies`, 1 install por repo, project scope |
| 3. Inicializadores 10 → 1 | **Ejecutado.** `amp:inicializar` es la fuente única del setup; los `inicializar-<sub>` ya no existen |
| 4. `amp:actualizar` (nivelador) | **Ejecutado** por el plan desprendido `Nivelador amp-actualizar de estructura` (cerrado 24/07/2026), con la decisión 0027 como precondición |
| 5. Subagentes como componente nuevo | **NO ejecutado** → desprendido a [Subagentes como componente distribuible del AMP](../pendientes/Subagentes%20como%20componente%20distribuible%20del%20AMP.md). Verificado al cerrar: no hay `.claude/agents/`, ni mención en `amp:inicializar`, ni subagentes empaquetados en el plugin `amp` |

**Ejecución de 0029 — verificada al cerrar.** El plan la declaraba pendiente; hoy está hecha: `marketplace.json` reescrito a 7 plugins, carpetas renombradas a `amp-<sub>`, `dependencies` cableadas en el `plugin.json` de `amp`, y las 4 skills transversales renombradas (`amp:inicializar`, `amp:planificar`, `amp:info`, `amp:actualizar`). El follow-up de terminología también: barrido de los vetados del 24/07/2026 sobre `funcionalidades/`, `REGISTRO.md`, `AGENTS.md` y `docs/` sin acierto — el único es la propia regla de conducta que cita `dogfooding` como **ejemplo** del test de anglicismos, uso legítimo.

**De los 4 abiertos:**

- **es/en (amp/mpa)** → al plan [Publicar el harness en inglés](../pendientes/Publicar%20el%20harness%20en%20ingles.md), que es su dueño natural. Ahí se sumó como pregunta abierta, con la observación de que el eje **solo existe si la publicación es bilingüe**: si es reemplazo, desaparece.
- **Marcadores de región gestionada** → al plan [Separar origen Base y aprendido](../pendientes/Separar%20origen%20Base%20y%20aprendido%20en%20los%20subsistemas.md), donde ya está resuelto por la vía negativa: separar por origen elimina los archivos mixtos, así que no hay delimitadores que definir.
- **Refresco de autoría** (hueco de 0013) → desprendido a [Refresco de autoría al pasar de enlace a plugin](../pendientes/Refresco%20de%20autoria%20al%20pasar%20de%20junction%20a%20plugin.md). Sigue abierto y hoy pesa: esta máquina está del lado plugin, así que el repo que autora el harness lo consume como si fuera ajeno.
- **Canal-copia estilo `skills.sh`** → desprendido a [Canal de instalación por copia](../pendientes/Canal%20de%20instalacion%20por%20copia.md), en estado **Diferido**, que refleja el "no urgente" del original.

**Lo que queda como referencia y no se mueve:** las secciones "Forma del repo", "Cruces con lo ya decidido" y la lección de Pocock de abajo. La primera describe una estructura (`plugins/` en la raíz) que **no** es la que quedó — el repo usa `funcionalidades/`; se conserva como registro de lo que se pensó, no como instrucción.

## Lección de referencia — Matt Pocock (`mattpocock/skills`)

Dos canales desde un repo, con las filosofías nombradas: **plugin** (paquete gestionado, auto-actualiza, "suscribirse") + **skills.sh** (`npx skills add`, copia al repo para revisar/derivar, e instala en Codex/Agent Skills). Skill de setup por repo (`/setup-matt-pocock-skills` ≈ `amp-inicializar`). Decisiones en `.agents/adr/`. Claude-plugin-first + Codex-por-copia + Codex-plugin en camino (idéntico a 0013). Estructura: **un** solo plugin (`source: "./"`) con skills por carpetas de categoría. El multi-plugin es donde divergimos **a propósito** (claridad operativa por sobre menor mantenimiento).
