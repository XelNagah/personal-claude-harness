# Rebautizar el glosario como subsistema semántica

**Estado: Ejecutado · Creado 26-07-22 · Rediseñado por `planificar` el 26-07-23 · Ejecutado el 26-07-23.** Origen: sesión de `planificar` del 22/07 sobre *efecto conductual*, al vetar `tripa`. Antes se llamaba *Terminología Farlopa como subsistema propio*; el análisis del 23/07 lo reencuadró. Decisión asociada: **0026**.

## Qué se decidió (planificar 26-07-23)

El plan preguntaba si Terminología Farlopa merecía subsistema propio. Respuesta: **no un subsistema nuevo, sí crecer el existente**. El `glosario` se generaliza y rebautiza a **`semántica`**, sosteniendo dos registros pares — igual que `scripts`→`herramientas` (decisión 0007) generalizó al quedar corto el nombre.

- **Sin subsistema nuevo.** El costo de superficie (índice + lint + funcionalidad + plugin + orquestador + nivelador) no se justifica; la gobernanza de veto (0004/0018) ya vive en el glosario y no hay que replicarla.
- **El veto es contra la relación término→significado, no contra el término.** `plomería`=cañerías (repo de fontanería) es válido; `plomería`=mecánica interna de un subsistema es farlopa. Es **relativo al lector del Propósito** del repo (un anglicismo es farlopa para un hispanohablante y no para un angloparlante) ⇒ el registro se calibra por repo, sin columna de lector.
- **`glosario` → `semántica`**, dos registros pares (Forma A):
  - `GLOSARIO.md` — terminología legítima (término→significado).
  - `TERMINOLOGIA-FARLOPA.md` — relaciones vetadas, columnas `Término | Significado vetado | Cómo decirlo`. EN: *Farlop Terminology* (broma deliberada — que la publicación EN / `converger-terminologia` no la "corrijan").
  - `lint-semantica/` cubre los dos; `MANIFIESTO.md` declara ambos registros.
- **Lint marca por término** (lo mecánico); **el agente juzga el significado** al leer la marca.
- **Canonizar un significado como concepto es independiente del veto** (default: no se canoniza — no se define cada palabra) → el criterio vive en `Criterio de pertenencia al glosario`. El caso testigo `tripa` **se queda** en Terminología Farlopa, no gana concepto propio.
- **Grafo latente:** Glosario y Terminología Farlopa son dos tipos de arista (`significa` / `vetado`) sobre el mismo grafo término↔significado. Base de grafos = norte futuro, no se construye ahora.

## Qué falta ejecutar (otra sesión)

Rebautizo del tamaño de `scripts`→`herramientas`:

1. Crear `.claude/semantica/` con `GLOSARIO.md` (contenido actual de `glosario/INDICE.md` menos la fila Terminología Farlopa) + `TERMINOLOGIA-FARLOPA.md` (registro de 3 columnas) + `MANIFIESTO.md`.
2. `lint-glosario` → `lint-semantica`: recorre los dos registros; la sección [5] (apariciones de vetados) lee `TERMINOLOGIA-FARLOPA.md`.
3. Migrar el mapa actual (~22 entradas término→reemplazo) al formato `Término | Significado vetado | Cómo decirlo`: para la mayoría (anglicismos puros) el significado vetado es "cualquier uso"; para `plomería`/`tripa`, el significado específico.
4. Funcionalidad/plugin `glosario`→`semantica`, orquestador `setup-completo`, nivelador, `REGISTRO.md`, `marketplace.json`, segmentación `glosario:`→`semantica:` (0013). `converger-terminologia` se mantiene (evaluar si se renombra al par de `semantica`).
5. Actualizar la definición del concepto en `GLOSARIO.md` y `feedback_glosario`; propagar al harness (0024: sin números de decisión en lo distribuible).
6. Control de cierre + `lint-harness`.

## Cruces

- **`Revisar la nomenclatura de los subsistemas`** — el rebautizo a `semántica` es un caso de eso; coordinar. Observación registrada: `semántica` es el nombre más abstracto del harness (una disciplina, no una cosa-que-se-guarda); aceptado por el autor.
- **`Criterio de pertenencia al glosario`** — dueño del criterio "¿este significado merece concepto propio?"; este plan le delega esa pregunta.
- **`Publicar el harness en inglés`** — *Farlop Terminology* es intencional.
- Decisión **0026** (extiende 0007/0018/0025).
- **Skill de resolución de términos + arista de procedencia (diferidos).** Durante la ejecución surgió que el flujo `Propuestos → (Alias | Farlopa)` hoy es **a mano** y que la **procedencia** farlopa→concepto (qué concepto originó un vetado) se pierde al no haber columna que la registre. Ambos diferidos: la skill de resolución (mover Propuestos→Alias/Farlopa + lint) cae en `Revisar cada subsistema — sentido, disparador y skill de operación`; la arista de procedencia es parte del **grafo latente** (0026, norte futuro). Se evaluó y **descartó** una 4ª columna `Viene de` en Terminología Farlopa: redundante con `Cómo decirlo` donde hay canónico, `—` en las farlopa puras, e impuesto fijo sobre un registro que crece.

## Notas de implementación

**Ejecutado el 26-07-23.** Rebautizo completo `glosario` → `semántica`, del tamaño de `scripts`→`herramientas`.

- **Refinamiento de 0026 sobre la marcha (ratificado por el usuario):** el glosario **pierde la columna `Vetados`** por completo — todo veto, con canónico de reemplazo o sin él, es una relación término→significado y vive en `TERMINOLOGIA-FARLOPA.md`. El glosario quedó en 5 columnas (`Concepto | Definición | Alias | Propuestos | Detalle`). Los 5 ex-`Vetados` (`artefacto`, `gate`, `prosa`, `levelear`, `verbatim`) migraron con su significado. Enunciado de 0026 actualizado.
- **Disco:** `.claude/semantica/` con `GLOSARIO.md` (29 conceptos) + `TERMINOLOGIA-FARLOPA.md` (27 relaciones, 36 términos) + `MANIFIESTO.md` (≤220 palabras, NO carga índice) + `lint-semantica/`. `.claude/glosario/` borrado.
- **Lint:** `lint-semantica` lee vetados solo de `TERMINOLOGIA-FARLOPA.md` (columna `Término`, split por `/,;`); `[5]` autoexcluye `.claude/semantica`; `[3]` cruza alias/concepto del glosario contra la farlopa. Fragmentos ancla byte-exactos con los otros lints (lint-harness `[4]` = 0 divergencias).
- **Funcionalidad/plugin:** `funcionalidades/glosario`→`semantica` (git mv), `plugin.json` v0.4.5→0.5.0, `inicializar-glosario`→`inicializar-semantica` (SKILL+PLANTILLA con §Glosario 5-col + §Farlopa nueva), `converger-terminologia` **mantiene nombre** (ratificado), orquestador `setup-completo` (SKILL+PLANTILLA, §Script embebido byte-exacto vía splice que lee el lint vivo), `marketplace.json`, `REGISTRO.md`, segmentación `glosario:`→`semantica:` (0013). Propagación 0024: sin números de decisión en distribuibles.
- **Refs por ruta:** `mostrar-pantalla-bienvenida.js` (key `glosario`→`semantica` + `GLOSARIO.md` sumado a `INDICES`), `conocimiento/terminologia-farlopa.md`, `conducta/INDICE.md`, wikilink roto `[[glosario]]`→`[[semantica]]` en `feedback_terminologia_canonica`, memoria `feedback_glosario`→`feedback_semantica`. Ninguna ref en `settings.json` ni hooks (el bloqueo de 0025 vía lint sigue pendiente, no cableado).
- **Junctions:** removidos los stale (`inicializar-glosario`, `converger-terminologia`→path viejo colgado por el git mv); recreados hacia `semantica`.
- **Cierre:** control de cierre **10/10 verde** (incl. `lint-semantica`, `lint-harness`, `plugin validate`).
