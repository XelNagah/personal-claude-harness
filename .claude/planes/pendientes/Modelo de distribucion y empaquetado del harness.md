# Modelo de distribución y empaquetado del harness

**Estado: Nuevo · Creado 26-07-23.** Diseño acordado en una sesión larga del agente `automejora` (repo `como-uso-claude`); traspaso a este repo, que es su dueño. Corrió en parte por `planificar` (esta sesión). **Ratifica y refina** las decisiones 0009/0010/0013; suma piezas nuevas (nivelador consolidado, subagentes, plantilla de estructura empaquetada en el plugin).

## Contexto

La sesión arrancó preguntando por subagentes en un AMP y derivó en repensar la **distribución y actualización** del harness ahora que se consolidó como Producto concreto (el Agente Multipropósito). Se recorrió el árbol de opciones a fondo. Este plan **captura el diseño acordado** para no re-derivarlo; la ejecución (y el asentado formal de las decisiones nuevas) queda para cuando se tome.

## Qué se decidió (firme)

1. **Distribución = marketplace / skills globales (Modelo A).** Ratifica 0010 (skills a nivel usuario) y 0013 (plugin-install en Claude, junction en Codex). Se evaluó y **descartó** el Modelo B (repo-plantilla clonable con todo adentro, "cloná y listo"): motivo — el usuario tiene ~18 AMP; con skills globales una mejora se propaga a todos con un `/plugin update`; con B habría que actualizar repo por repo, y se pierde el prefijo `plugin:skill`.

2. **Empaquetado = multi-plugin por subsistema (ratifica 0013).** Se evaluaron dos variantes estilo Matt Pocock (`mattpocock/skills`): (B) un solo plugin con carpetas de categoría → `amp:registrar-memoria`; (C) un plugin con nombres `<sub>-<verbo>` → `amp:memoria-agregar`. Se **descartaron** a favor del multi-plugin: el subsistema en el prefijo (`amp-memoria:registrar-memoria`) da **claridad operativa** al usar, que el usuario prioriza sobre el menor costo de mantenimiento del plugin único. **Las skills NO se renombran** (el prefijo de plugin da la agrupación) ⇒ 0015 (verbo+objeto) queda intacto.

3. **Los inicializadores se consolidan: 10 `inicializar-<x>` → 1 `amp-inicializar`.** Bajo Modelo A no hay carpeta que se copie por git (las skills viven en cache): la **estructura** (`.claude/` esqueleto + `agents/`) viaja **empaquetada dentro del plugin transversal `amp`** (una plantilla), y `amp-inicializar` la **escribe** en el repo destino. El à la carte pasa a la lógica del skill: `amp-inicializar <sub>` instala un subconjunto (resolviendo dependencias). El sistema de plugins **es** el instalador — no hay `instalar.js` ni `plantilla/` sueltos en la raíz del harness.

4. **`amp-actualizar`: nivelador de estructura consolidado.** La idempotencia hoy repartida en las secciones "Reconciliación" de cada skill se junta en **un** skill que pone al día el `.claude/` de un repo vivo contra la plantilla nueva. Clasifica cada archivo en tres tipos —estructura pura / mixto por región / dominio puro— y reporta en tres grupos (agregado / ya estaba / divergente→pregunta), sin pisar lo divergente. Cubre el requisito duro del usuario: **actualizar los agentes legacy sin romperles el comportamiento**.

5. **Subagentes como componente nuevo del Producto.** Los transversales (investigador, test-runner, code-reviewer) viajan en la plantilla → `.claude/agents/` del consumidor (commiteados, tuneables). Los de dominio se commitean en cada repo consumidor. Análisis fuente en el conocimiento del agente `automejora` (páginas `subagentes-agentes-codigo` y `subagentes-en-harness`).

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

## Lección de referencia — Matt Pocock (`mattpocock/skills`)

Dos canales desde un repo, con las filosofías nombradas: **plugin** (paquete gestionado, auto-actualiza, "suscribirse") + **skills.sh** (`npx skills add`, copia al repo para revisar/derivar, e instala en Codex/Agent Skills). Skill de setup por repo (`/setup-matt-pocock-skills` ≈ `amp-inicializar`). Decisiones en `.agents/adr/`. Claude-plugin-first + Codex-por-copia + Codex-plugin en camino (idéntico a 0013). Estructura: **un** solo plugin (`source: "./"`) con skills por carpetas de categoría. El multi-plugin es donde divergimos **a propósito** (claridad operativa por sobre menor mantenimiento).
