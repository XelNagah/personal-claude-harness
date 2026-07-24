---
name: actualizar
description: Nivela el .claude/ de un repo con el AMP ya instalado contra la plantilla nueva del harness. Converge por estructura, sin guardar versión: pisa lo Base (mecanismo del harness) respaldándolo antes en .claude/.respaldo-amp/<fecha>/, nunca toca lo aprendido (contenido del repo), y pregunta antes de reacomodar formas viejas. Aplica renombres conocidos (glosario→semantica) e instala subsistemas faltantes (conducta), delegando en el instalador consolidado amp:inicializar. Trae vista previa. Use when el usuario dice "nivelá el AMP", "actualizá el harness del repo", "poné al día el .claude", "amp:actualizar", o al detectar un repo con el harness viejo.
---

# amp:actualizar — nivelador del harness

Pone al día el `.claude/` de un repo que **ya** tiene el AMP instalado, contra la plantilla nueva. **No** es para arrancar un repo de cero (para eso está `amp:inicializar`): es para uno vivo, sin romperle lo que aprendió. Diseño en la decisión 0028; se apoya en la separación Base/aprendido (decisión 0027).

## Principio (qué se pisa y qué no)

La separación por origen **disuelve** el problema de "qué puedo pisar sin borrar lo aprendido":

- **Base** = mecanismo del harness (lint, `MANIFIESTO`, estructura, `MOMENTOS`, secciones `## Reglas Base`, cableado del hook) → **se pisa**, respaldando antes.
- **Aprendido** = contenido del repo (términos del glosario, memorias, planes, decisiones, conocimiento, `## Reglas del Propósito`) → **no se toca nunca**.
- **Reacomodo legacy** (formas viejas anteriores a 0027 que puedan enredar contenido aprendido) → **se pregunta antes**, bloqueante.

**Primera corrida sobre un repo viejo = migración** (instala `conducta`, renombra `glosario`→`semantica` preservando términos, mete el corte Base/Propósito). Las siguientes = reconcile limpio (todo "ya estaba").

## Reparto de trabajo (skill ↔ script)

Lo mecánico y determinista lo hace el script `amp-actualizar.js` (decisión 0009); el juicio, este skill.

- **Script** (`node <ruta-skill>/amp-actualizar.js`): barrido y clasificación de la estructura, respaldo, y el reporte / vista previa. Modos: `--vista-previa` (o sin flag) detecta y muestra el plan **sin escribir**; `--respaldo` copia `.claude/` a `.claude/.respaldo-amp/<fecha>/`. Acepta la raíz del repo como argumento (default: el repo actual).
- **Skill** (este flujo): confirma el plan, **delega la instalación** al instalador consolidado `amp:inicializar` (que trae la plantilla 0024-limpia de todos los subsistemas y es idempotente), migra términos y prosa con criterio, y pregunta ante lo divergente.

## Flujo de trabajo

1. **Vista previa primero — siempre.** Correr el script en modo detección:
   ```bash
   node <ruta-de-esta-skill>/amp-actualizar.js --vista-previa
   ```
   Muestra el plan en cuatro grupos: **Base** (instalar/pisar), **Renombres legacy**, **Divergente** (requiere ok) y **Ya estaba**. Presentárselo al usuario.
2. **Si el usuario pidió solo la vista previa → terminar acá.** Nada se escribió.
3. **Confirmar el plan.** Los **Divergentes** se preguntan uno por uno (son bloqueantes): no se toca nada de ese grupo sin ok explícito. Ejemplo típico: `conducta/INDICE.md` con reglas pero sin el corte Base/Propósito — repartirlas exige decidir cuáles son Base y cuáles del Propósito; eso lo decide el usuario.
4. **Respaldo.** Antes de escribir una sola pieza Base:
   ```bash
   node <ruta-de-esta-skill>/amp-actualizar.js --respaldo
   ```
   Deja la copia en `.claude/.respaldo-amp/<fecha>/`. Es la única red: `.claude/` suele estar gitignoreado en el host.
5. **Aplicar Base** (el grupo Base del plan). La fuente canónica es la PLANTILLA única de `amp:inicializar` (una sección por subsistema). Para cada ítem:
   - **Subsistema ausente** (p. ej. `conducta/`) → correr `amp:inicializar` (idempotente: instala los subsistemas ausentes desde su PLANTILLA consolidada y preserva lo que ya está).
   - **`MANIFIESTO`/lint/estructura vieja** → tomar el contenido canónico de la sección del subsistema en la PLANTILLA de `amp:inicializar` y **pisar** el archivo Base. (A diferencia de la reconciliación normal de `amp:inicializar`, que preserva lo existente, acá el archivo Base **se pisa** — es del harness. El contenido aprendido del mismo subsistema no se toca.)
   - **Hook sin cablear** → merge del bloque de cableado de `conducta` en `.claude/settings.json` (y `.codex/hooks.json`), sin pisar hooks existentes.
   - **`conducta/INDICE.md` sin las secciones** (y sin reglas propias que repartir) → agregar `## Reglas Base` (con las reglas Base actuales) y `## Reglas del Propósito` (vacía).
6. **Aplicar Renombres** (el caso con más juicio — preservar lo aprendido):
   - **`glosario`→`semantica`:**
     1. Mover la carpeta `.claude/glosario/` → `.claude/semantica/` y `lint-glosario/` → `lint-semantica/` (renombrar también `lint-glosario.js` → `lint-semantica.js`).
     2. Correr `amp:inicializar` en reconciliación: pone al día el mecanismo de semántica (lint nuevo, `MANIFIESTO`, estructura de columnas) **preservando** `GLOSARIO.md` y `TERMINOLOGIA-FARLOPA.md` con sus términos. Verificar que ningún término se haya perdido.
     3. Migrar las referencias: en `AGENTS.md`, `@.claude/glosario/MANIFIESTO.md` → `@.claude/semantica/MANIFIESTO.md`; el prefijo de skill `glosario:` → `semantica:` donde aparezca; y toda referencia por ruta al lint renombrado (settings, hooks).
7. **Divergentes** — aplicar solo lo que el usuario aprobó en el paso 3.
8. **Reporte final.** Resumir lo hecho en los tres grupos (`pisado/instalado` · `ya estaba` · `divergente resuelto`) y **dónde quedó el respaldo**.
9. **Lint.** Correr los lints de los subsistemas tocados (o `ejecutar-control-cierre` si es el repo autor). **No hacer commit** salvo pedido explícito.

## Reconciliación (idempotencia)

Segura de re-correr: una segunda corrida sobre un repo ya nivelado da todo "ya estaba" y no escribe nada. Es el mismo comando para migrar (repo viejo) y reconciliar (repo al día): la vista previa dice cuál es el caso.

## 0024

Todo lo que se instala o pisa en el consumidor sale de la PLANTILLA de `amp:inicializar`, que ya enuncia la razón inline sin citar números de decisión del harness. El nivelador no introduce números de decisión en el `.claude/` del consumidor.
