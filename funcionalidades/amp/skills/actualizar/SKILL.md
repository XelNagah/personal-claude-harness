---
name: actualizar
description: Nivela el .claude/ de un Agente con Propósito ya instalado contra la Base actual. Pisa Base con respaldo, preserva el Aprendizaje y conduce los reacomodos viejos que requieren juicio. En particular, si encuentra la generación retirada memoria/, retira automáticamente su infraestructura y sus ocho piezas Base conocidas; solo coordina pieza por pieza el Aprendizaje restante. No informa "al día" hasta que memoria desaparece o queda esperando una confirmación explícita del usuario. También actualiza y migra plugins retirados antes de tocar archivos. Use when el usuario dice "nivelá el Agente Multipropósito", "actualizá el harness del repo", "poné al día el .claude", "amp:actualizar", o al detectar un Agente con Propósito cuyo Agente Multipropósito quedó viejo.
---

# amp:actualizar — nivelador del harness

Pone al día el `.claude/` de un **Agente con Propósito**: actualiza el Agente Multipropósito que tiene adentro contra la plantilla nueva, sin tocar su Aprendizaje. **No** es para arrancar un repo de cero (para eso está `amp:inicializar`, que es donde un Agente con Propósito nace): es para uno vivo, sin romperle lo que aprendió. Diseño en la decisión 0028; se apoya en la separación Base/aprendido (decisión 0027) y en la composición de la decisión 0034.

## Principio (qué se pisa y qué no)

Un Agente con Propósito son dos cosas superpuestas, y la separación por origen **disuelve** el problema de "qué puedo pisar sin borrar lo aprendido":

- **Base** = el **Agente Multipropósito** que tiene adentro (lint, `MANIFIESTO`, estructura, `MOMENTOS`, secciones `## Reglas Base`, cableado del hook) → **se pisa**, respaldando antes. Es lo único que esta skill actualiza.
- **Aprendizaje** = las entradas que acumuló persiguiendo su Propósito (términos del glosario, planes, decisiones, conocimiento, `## Reglas del Propósito`) → **no se pisa ni se reclasifica en silencio**. Cuando una forma retirada lo contiene, esta skill conduce su reubicación y pide confirmación pieza por pieza.
- **Reacomodo legacy** (formas viejas anteriores a 0027 que puedan enredar el Aprendizaje) → **se pregunta antes**, bloqueante.

**Primera corrida sobre un Agente con Propósito viejo = migración** (instala la Base nueva, renombra formas conocidas y reubica el Aprendizaje que quedó en casas retiradas). Las siguientes = reconciliación limpia (todo "ya estaba").

### Condición de cierre obligatoria

La presencia de `.claude/memoria/` significa **migración incompleta**, aunque todos sus archivos sean válidos para la versión vieja. Nunca responder “ya estaba al día” ni “nada para nivelar” mientras exista. El único cierre válido es uno de estos:

- `memoria/` ya no existe, todas sus piezas fueron reubicadas o descartadas con confirmación y los lints quedan verdes;
- el flujo está detenido esperando **una decisión concreta** del usuario sobre la pieza que se mostró textual.

No mandar al usuario a invocar otra skill: `amp:actualizar` llama y coordina `amp-subsistemas:reubicar-aprendizaje` como un paso interno.

## Reparto de trabajo (skill ↔ script)

Lo mecánico y determinista lo hace el script `amp-actualizar.js` (decisión 0009); el juicio, este skill.

- **Script** (`node <ruta-skill>/amp-actualizar.js`): barrido y clasificación de la estructura, respaldo, y el reporte / vista previa. Modos: `--vista-previa` (o sin flag) detecta y muestra el plan **sin escribir**; `--respaldo` copia `.claude/` a `.claude/.respaldo-amp/<fecha>/`. Acepta la raíz del repo como argumento (default: el repo actual).
- **Skill** (este flujo): confirma el plan, **delega la instalación** al instalador consolidado `amp:inicializar` (que trae la plantilla 0024-limpia de todos los subsistemas y es idempotente), migra términos y textos con criterio, y pregunta ante lo divergente.

## Paso previo obligado: la fase de plugins

Poner al día un repo son **dos fases** y esta skill ejecuta la segunda. La primera —los plugins de la máquina— va **antes**, porque esta misma skill viaja adentro del plugin: si se nivelan los archivos con los plugins atrasados, el repo queda puesto al día por una versión vieja del instalador.

Por eso lo primero de todo, antes de la vista previa, es diagnosticar los plugins con la **Herramienta Base `actualizar-plugins`**. La skill elige el agente que está ejecutando el flujo: `claude` para Claude Code y `codex` para Codex CLI. Nunca consulta la configuración de Claude Code mientras trabaja en Codex, ni al revés.

```bash
node .claude/herramientas/actualizar-plugins/actualizar-plugins.js --agente <claude|codex>
```

**Si ese archivo no existe** —repo instalado antes de que la Herramienta existiera— usar la del **marketplace bajado**, que siempre está. En Codex, si tampoco está registrado el marketplace, la Herramienta distribuida conoce su origen y `--aplicar` lo agrega antes de resolver el paquete completo.

```bash
node ~/.claude/plugins/marketplaces/<marketplace>/.claude/herramientas/actualizar-plugins/actualizar-plugins.js
```

En Windows, `~` es `%USERPROFILE%`. El `<marketplace>` es el que sirve este plugin. Nunca hace falta que el usuario tipee comandos del CLI de plugins: la Herramienta ya está en la máquina. La copia propia del repo llega después, cuando `amp:inicializar` la instala como Herramienta Base; hasta entonces vale la del marketplace.

Según lo que reporte:

- **`TODO ACTUALIZADO`** → seguir con el flujo de abajo.
- **`ACTUALIZAR` en algún plugin, marketplace faltante, o el marketplace bajado en `ACTUALIZAR`** → resolverlo acá y **frenar**: correr la Herramienta con `--aplicar`, avisarle al usuario que **reinicie la sesión** y que vuelva a pedir `amp:actualizar` al volver. En Codex, `--aplicar` primero asegura el marketplace y después instala el paquete completo por dependencias. No seguir con los archivos en esta corrida: la skill que los escribiría sigue siendo la vieja hasta el reinicio.
- **`SIN DECLARAR`** → otro plugin **requiere** esa dependencia y el repo no la nombra en `enabledPlugins`. El plugin que la pide **no carga**: Claude Code lo descarta entero y sus skills no están en la sesión, sin avisar. Es el caso típico del repo instalado antes de que el paquete sumara subsistemas. Mismo tratamiento que los anteriores —`--aplicar`, reiniciar, volver a pedir la skill— y **frenar igual**. Ojo: si la que falta es una dependencia de `amp`, esta misma skill no está cargada, así que el usuario llega acá por la Herramienta del marketplace bajado, no por `amp:actualizar`.
- **`NO INSTALADO`** → el repo declara un plugin en `settings` que **no llegó a instalarse**: los archivos pueden estar al día y las skills no. Mismo tratamiento que el anterior —`--aplicar`, reiniciar, volver a pedir la skill— y **frenar igual**. Es el estado típico de una migración que quedó por la mitad, y seguir nivelando archivos acá los pondría al día con las skills viejas.
- **`RETIRADO`** → migración de nombres: ver abajo.

Se recuerda un solo nombre —`amp:actualizar`— y el orden lo garantiza esta skill.

### Migración de nombres retirados

El repo quedó con nombres de plugin que el marketplace ya no ofrece. **No se arregla actualizando**, y **no se le pasa la lista al usuario para que la corra**: la ejecuta esta skill. Mientras el nombre viejo y el nuevo conviven **no se pisan, coexisten** —dos skills con la misma descripción y distinto prefijo, sin ganador definido—, así que desinstalar no es opcional.

1. **Mostrar qué se va a hacer y pedir confirmación**, una sola vez, con la lista de plugins a desinstalar. Es **irreversible**: esos nombres ya no se publican, así que no hay forma de reinstalarlos desde el marketplace. Sin confirmación no se ejecuta nada.
2. **Instalar el conjunto nuevo primero**, si todavía no está. El orden es obligatorio —instalar lo nuevo → desinstalar lo viejo → reiniciar—: al revés, entre medio el repo se queda sin las skills que todavía usa.
3. **Desinstalar los retirados**, uno por uno, **cada uno con el alcance que informa la Herramienta** (`--scope` de su fila). No asumir un alcance parejo: es normal que los viejos estén en `project` y los nuevos en `local`, y con el alcance equivocado el comando no encuentra nada y no borra nada, sin error claro.
4. **Verificar** que `enabledPlugins` quedó solo con los nombres nuevos, y volver a correr la Herramienta para confirmar que no queda ningún `RETIRADO`.
5. **Frenar y pedir el reinicio.** Los plugins nuevos no cargan hasta entonces. Al volver, el usuario pide `amp:actualizar` de nuevo y ahí sí se nivelan los archivos.

## Flujo de trabajo

1. **Vista previa primero — siempre.** Correr el script en modo detección:
   ```bash
   node <ruta-de-esta-skill>/amp-actualizar.js --vista-previa
   ```
   Muestra el plan en cuatro grupos: **Base** (instalar/pisar), **Renombres legacy**, **Divergente** (requiere ok) y **Ya estaba**. Presentárselo al usuario.

   ⚠️ **«Nada para nivelar» no se reporta sin mirar.** El detector compara el **contenido** de los scripts Base contra la PLANTILLA, no solo su presencia — pero la lista de piezas que conoce está escrita a mano en su código, así que una pieza nueva que nadie haya agregado ahí **no se busca y no aparece**. Si el repo tiene el Agente Multipropósito de una versión anterior y el detector devuelve cero, desconfiar: contrastar a mano las piezas de `conducta/` y los tres eventos de hook en los dos archivos de cableado antes de declararlo al día.
2. **Si el usuario pidió solo la vista previa → terminar acá.** Nada se escribió.
3. **Confirmar el plan.** Los **Divergentes** se preguntan uno por uno (son bloqueantes): no se toca nada de ese grupo sin ok explícito. Ejemplo típico: `conducta/INDICE.md` con reglas pero sin el corte Base/Propósito — repartirlas exige decidir cuáles son Base y cuáles del Propósito; eso lo decide el usuario.
4. **Respaldo.** Antes de escribir una sola pieza Base:
   ```bash
   node <ruta-de-esta-skill>/amp-actualizar.js --respaldo
   ```
   El script decide solo, y puede no hacer nada:

   - **Si `.claude/` está versionado en git** (lo chequea con `git ls-files`) → **omite el respaldo** y lo dice. Git ya es la red: para volver atrás alcanza con `git diff` y `git checkout --` sobre lo pisado. Es el caso normal.
   - **Si no lo está** → respalda **fuera del repo**, en el directorio temporal del sistema, e imprime la ruta absoluta. Pasársela al usuario en el reporte final.

   ⚠️ **El respaldo no va adentro de `.claude/`,** y las dos razones se sufrieron en repos reales: ahí el agente **no puede borrarlo** —el borrado recursivo bajo `.claude/` está vedado, así que la limpieza que este mismo flujo manda hacer le queda al usuario a mano—, y además **contamina los lints**, que barren `.claude/` entero: cada copia congelada duplica los hallazgos viejos, que ya no se pueden corregir, y tapa los reales.
5. **Aplicar Base** (el grupo Base del plan). La fuente canónica es la PLANTILLA única de `amp:inicializar` (una sección por subsistema). Para cada ítem:
   - **Subsistema ausente** (p. ej. `conducta/`) → correr `amp:inicializar` (idempotente: instala los subsistemas ausentes desde su PLANTILLA consolidada y preserva lo que ya está).
   - **`MANIFIESTO`/lint/estructura vieja** → tomar el contenido canónico de la sección del subsistema en la PLANTILLA de `amp:inicializar` y **pisar** el archivo Base. (A diferencia de la reconciliación normal de `amp:inicializar`, que preserva lo existente, acá el archivo Base **se pisa** — es del harness. El contenido aprendido del mismo subsistema no se toca.)
   - **`contenido viejo`** (un script Base instalado que difiere del de la PLANTILLA) → **pisarlo con el bloque de la PLANTILLA**, entero y tal cual. Es el caso más frecuente al poner al día un repo que ya tenía el Agente Multipropósito: la pieza está, pero en la versión de cuando se instaló. No hay nada que preservar — los scripts Base no se ajustan por repo; lo que el repo aprendió vive en sus registros, no en el código del harness.
   - **Hook sin cablear** → merge del bloque de cableado de `conducta` en `.claude/settings.json` (y `.codex/hooks.json`), sin pisar hooks existentes.
   - **`conducta/INDICE.md` sin las secciones** (y sin reglas propias que repartir) → agregar `## Reglas Base` (con las reglas Base actuales) y `## Reglas del Propósito` (vacía).
   - **Generación con `memoria/`** → instalar primero el subsistema `subsistemas/`, sus tres piezas Base (`MANIFIESTO.md`, `SUBSISTEMAS.md`, `README.md`) y su lint. No borrar todavía ninguna pieza aprendida.
6. **Aplicar Renombres** (el caso con más juicio — preservar lo aprendido):
   - **`glosario`→`semantica`:**
     1. Mover la carpeta `.claude/glosario/` → `.claude/semantica/` y `lint-glosario/` → `lint-semantica/` (renombrar también `lint-glosario.js` → `lint-semantica.js`).
     2. Correr `amp:inicializar` en reconciliación: pone al día el mecanismo de semántica (lint nuevo, `MANIFIESTO`, estructura de columnas) **preservando** `GLOSARIO.md` y `TERMINOLOGIA-FARLOPA.md` con sus términos. Verificar que ningún término se haya perdido.
     3. Migrar las referencias: en `AGENTS.md`, `@.claude/glosario/MANIFIESTO.md` → `@.claude/semantica/MANIFIESTO.md`; el prefijo de skill `glosario:` → `semantica:` donde aparezca; y toda referencia por ruta al lint renombrado (settings, hooks).
7. **Migrar `memoria/` retirada — responsabilidad de esta skill.**
   1. Inventariar `memoria/` en tres grupos, **antes de hacer cualquier pregunta**:
      - infraestructura Base retirada: `MANIFIESTO.md`, `MEMORIA.md`, `README.md` y `lint-memoria/`;
      - las ocho piezas Base conocidas que distribuía la generación anterior;
      - Aprendizaje restante del Propósito.
   2. Retirar automáticamente la infraestructura vieja cuando la Base `subsistemas/` ya está instalada.
   3. Reconciliar automáticamente las ocho piezas Base conocidas. **No pedir confirmación por ellas**: comprobar primero que su destino actual exista y cubra el comportamiento; después retirar el duplicado viejo.

      | Pieza Base retirada | Destino actual |
      |---|---|
      | `feedback_flujo_planes.md` | `.claude/planes/README.md` |
      | `feedback_semantica.md` | `.claude/semantica/README.md` |
      | `feedback_decisiones.md` | `.claude/decisiones/README.md` |
      | `feedback_base_conocimiento.md` | `.claude/conocimiento/README.md` |
      | `feedback_conducta.md` | `.claude/conducta/README.md` |
      | `feedback_herramientas.md` | `.claude/herramientas/README.md` |
      | `feedback_estilo_commits.md` | `.claude/preferencias/estilo-commits.md` + regla Base de conducta correspondiente |
      | `feedback_archivo_de_estado.md` | `.claude/preferencias/archivo-de-estado.md` + regla Base de conducta correspondiente |

      Si una pieza con uno de esos nombres contiene una adición propia del repo que no está cubierta por el destino, **solo esa adición** pasa al grupo de Aprendizaje; no se pregunta si se mueve el bloque Base entero.
   4. Recién con el Aprendizaje restante, invocar internamente `amp-subsistemas:reubicar-aprendizaje`: mostrar **una pieza por vez**, proponer destino y texto resultante, y esperar confirmación explícita antes de mover, partir o descartar.
   5. Reparar índices, vínculos y referencias después de cada confirmación.
   6. Cuando no queda ninguna pieza, retirar el directorio `memoria/`, correr nuevamente la vista previa y verificar que no aparezca la migración.

   Si la sesión debe detenerse por una confirmación, informar exactamente qué pieza espera decisión. No presentar la migración como terminada.
8. **Otros Divergentes** — aplicar solo lo que el usuario aprobó en el paso 3.
9. **Reporte final.** Volver a correr la vista previa. Solo si da cero acciones y no existe `memoria/`, resumir lo hecho en los tres grupos (`pisado/instalado` · `ya estaba` · `divergente resuelto`) y **qué pasó con el respaldo**: si se omitió (git lo cubre) o dónde quedó, con la ruta absoluta. Cuando se hizo, decir que es **de un solo uso**: sirve hasta que el usuario verifique que el repo quedó bien, y después se borra.

   **Si el repo tiene `.claude/.respaldo-amp/`,** viene de corridas anteriores a este cambio. Avisarlo: son copias completas de `.claude/` que nadie limpia y que **inflan los hallazgos de todos los lints**. Ofrecer borrarlas — y si el borrado recursivo bajo `.claude/` está vedado en ese entorno, decírselo al usuario con el comando exacto en vez de dejarlo pasar en silencio.
10. **Lint.** Correr los lints de los subsistemas tocados (o `ejecutar-control-cierre` si es el repo autor). **No hacer commit** salvo pedido explícito.

## Reconciliación (idempotencia)

Segura de re-correr: una segunda corrida sobre un repo ya nivelado da todo "ya estaba" y no escribe nada. Es el mismo comando para migrar (repo viejo) y reconciliar (repo al día): la vista previa dice cuál es el caso.

## 0024

Todo lo que se instala o pisa en el consumidor sale de la PLANTILLA de `amp:inicializar`, que ya enuncia la razón inline sin citar números de decisión del harness. El nivelador no introduce números de decisión en el `.claude/` del consumidor.
