---
name: actualizar
description: Nivela el .claude/ de un Agente con Propósito ya instalado, poniendo al día el Agente Multipropósito que tiene adentro contra la plantilla nueva. Converge por estructura, sin guardar versión: pisa lo Base (mecanismo del harness) respaldándolo antes en .claude/.respaldo-amp/<fecha>/, nunca toca el Aprendizaje (las entradas que el repo acumuló persiguiendo su Propósito), y pregunta antes de reacomodar formas viejas. Aplica renombres conocidos (glosario→semantica) e instala subsistemas faltantes (conducta), delegando en el instalador consolidado amp:inicializar. Arranca chequeando los plugins de la máquina y, si están atrasados, los pone al día y pide reiniciar antes de tocar archivos. Trae vista previa. Use when el usuario dice "nivelá el Agente Multipropósito", "actualizá el harness del repo", "poné al día el .claude", "amp:actualizar", o al detectar un Agente con Propósito cuyo Agente Multipropósito quedó viejo.
---

# amp:actualizar — nivelador del harness

Pone al día el `.claude/` de un **Agente con Propósito**: actualiza el Agente Multipropósito que tiene adentro contra la plantilla nueva, sin tocar su Aprendizaje. **No** es para arrancar un repo de cero (para eso está `amp:inicializar`, que es donde un Agente con Propósito nace): es para uno vivo, sin romperle lo que aprendió. Diseño en la decisión 0028; se apoya en la separación Base/aprendido (decisión 0027) y en la composición de la decisión 0034.

## Principio (qué se pisa y qué no)

Un Agente con Propósito son dos cosas superpuestas, y la separación por origen **disuelve** el problema de "qué puedo pisar sin borrar lo aprendido":

- **Base** = el **Agente Multipropósito** que tiene adentro (lint, `MANIFIESTO`, estructura, `MOMENTOS`, secciones `## Reglas Base`, cableado del hook) → **se pisa**, respaldando antes. Es lo único que esta skill actualiza.
- **Aprendizaje** = las entradas que acumuló persiguiendo su Propósito (términos del glosario, memorias, planes, decisiones, conocimiento, `## Reglas del Propósito`) → **no se toca nunca**.
- **Reacomodo legacy** (formas viejas anteriores a 0027 que puedan enredar el Aprendizaje) → **se pregunta antes**, bloqueante.

**Primera corrida sobre un Agente con Propósito viejo = migración** (instala `conducta`, renombra `glosario`→`semantica` preservando términos, mete el corte Base/Propósito). Las siguientes = reconcile limpio (todo "ya estaba").

## Reparto de trabajo (skill ↔ script)

Lo mecánico y determinista lo hace el script `amp-actualizar.js` (decisión 0009); el juicio, este skill.

- **Script** (`node <ruta-skill>/amp-actualizar.js`): barrido y clasificación de la estructura, respaldo, y el reporte / vista previa. Modos: `--vista-previa` (o sin flag) detecta y muestra el plan **sin escribir**; `--respaldo` copia `.claude/` a `.claude/.respaldo-amp/<fecha>/`. Acepta la raíz del repo como argumento (default: el repo actual).
- **Skill** (este flujo): confirma el plan, **delega la instalación** al instalador consolidado `amp:inicializar` (que trae la plantilla 0024-limpia de todos los subsistemas y es idempotente), migra términos y prosa con criterio, y pregunta ante lo divergente.

## Paso previo obligado: la fase de plugins

Poner al día un repo son **dos fases** y esta skill ejecuta la segunda. La primera —los plugins de la máquina— va **antes**, porque esta misma skill viaja adentro del plugin: si se nivelan los archivos con los plugins atrasados, el repo queda puesto al día por una versión vieja del instalador.

Por eso lo primero de todo, antes de la vista previa, es diagnosticar los plugins:

```bash
node .claude/herramientas/actualizar-plugins/actualizar-plugins.js
```

- **Si reporta `TODO ACTUALIZADO`** → seguir con el flujo de abajo.
- **Si reporta `ACTUALIZAR` en algún plugin, o el marketplace bajado en `ACTUALIZAR`** → resolverlo acá y **frenar**: correr la Herramienta con `--aplicar`, avisarle al usuario que **reinicie la sesión** y que vuelva a pedir `amp:actualizar` al volver. No seguir con los archivos en esta corrida: la skill que los escribiría sigue siendo la vieja hasta el reinicio.
- **Si reporta `NO INSTALADO`** → el repo declara un plugin en `settings` que **no llegó a instalarse**: los archivos pueden estar al día y las skills no. Mismo tratamiento que el anterior —`--aplicar`, reiniciar, volver a pedir la skill— y **frenar igual**. Es el estado típico de una migración que quedó por la mitad, y seguir nivelando archivos acá los pondría al día con las skills viejas.
- **Si reporta `RETIRADO`** → el repo quedó con nombres de plugin que el marketplace ya no ofrece. Eso **no se arregla actualizando**: es una migración. La Herramienta imprime el comando de desinstalación y el orden (instalar lo nuevo → desinstalar lo viejo → reiniciar); pasárselo al usuario, remitir al manual de instalación y **no seguir**. Ojo: mientras conviven, el plugin viejo y el nuevo **no se pisan, coexisten** —dos skills con la misma descripción y distinto prefijo—, así que el paso de desinstalar no es opcional.
- **Si la Herramienta no existe** en el repo (instalación anterior a que existiera) → decirlo y remitir al manual: esa primera pasada se hace con los comandos del CLI, una sola vez, y después la Herramienta queda instalada.

Se recuerda un solo nombre —`amp:actualizar`— y el orden lo garantiza esta skill.

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

   **Asegurar que el respaldo esté ignorado por git.** Si el repo usa git, agregar `.claude/.respaldo-amp/` al `.gitignore` (si no está ya). Es una copia completa de `.claude/`: commitearla duplicaría la base entera, y en un repo donde `.claude/` **sí** está versionado el respaldo ya es redundante —git cumple ese papel—, pero igual aparece como pendiente y confunde.
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
8. **Reporte final.** Resumir lo hecho en los tres grupos (`pisado/instalado` · `ya estaba` · `divergente resuelto`) y **dónde quedó el respaldo**. Decir explícitamente que el respaldo es **de un solo uso**: sirve hasta que el usuario verifique que el repo quedó bien, y después se borra. Si al respaldar ya había respaldos de corridas anteriores, mencionarlo — se acumulan copias completas de `.claude/` que nadie limpia.
9. **Lint.** Correr los lints de los subsistemas tocados (o `ejecutar-control-cierre` si es el repo autor). **No hacer commit** salvo pedido explícito.

## Reconciliación (idempotencia)

Segura de re-correr: una segunda corrida sobre un repo ya nivelado da todo "ya estaba" y no escribe nada. Es el mismo comando para migrar (repo viejo) y reconciliar (repo al día): la vista previa dice cuál es el caso.

## 0024

Todo lo que se instala o pisa en el consumidor sale de la PLANTILLA de `amp:inicializar`, que ya enuncia la razón inline sin citar números de decisión del harness. El nivelador no introduce números de decisión en el `.claude/` del consumidor.
