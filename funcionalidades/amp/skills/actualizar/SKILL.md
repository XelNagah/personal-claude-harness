---
name: actualizar
description: Nivela el .claude/ de un Agente con Propósito ya instalado contra la Base actual. Pisa Base con respaldo, preserva el Aprendizaje y conduce los reacomodos viejos que requieren juicio. En particular, si encuentra la generación retirada memoria/, retira automáticamente su infraestructura y sus ocho Componentes de Subsistema conocidos del Agente Multipropósito; solo coordina de a uno por vez el Aprendizaje restante. No informa "al día" hasta que memoria desaparece o queda esperando una confirmación explícita del usuario. También actualiza y migra plugins retirados antes de tocar archivos. Use when el usuario dice "nivelá el Agente Multipropósito", "actualizá el harness del repo", "poné al día el .claude", "amp:actualizar", o al detectar un Agente con Propósito cuyo Agente Multipropósito quedó viejo.
---

# amp:actualizar — nivelador del harness

Pone al día el `.claude/` de un **Agente con Propósito**: actualiza el Agente Multipropósito que tiene adentro contra la Base nueva, sin tocar su Aprendizaje. **No** es para arrancar un repo de cero (para eso está `amp:inicializar`, que es donde un Agente con Propósito nace): es para uno vivo, sin romperle lo que aprendió. Diseño en la decisión 0028; se apoya en la separación Base/aprendido (decisión 0027) y en la composición de la decisión 0034.

## Principio (qué se pisa y qué no)

Un Agente con Propósito son dos cosas superpuestas, y la separación por origen **disuelve** el problema de "qué puedo pisar sin borrar lo aprendido":

- **Base** = el **Agente Multipropósito** que tiene adentro (lint, `MANIFIESTO`, estructura, `MOMENTOS`, secciones `## Reglas del Agente Multipropósito`, cableado del hook) → **se pisa**, respaldando antes. Es lo único que esta skill actualiza.
- **Aprendizaje** = las entradas que acumuló persiguiendo su Propósito (términos del glosario, planes, decisiones, conocimiento, y todo lo que viva en un Índice con `origen: agente-desplegado`) → **no se pisa ni se reclasifica en silencio**. Cuando una forma retirada lo contiene, esta skill conduce su reubicación y pide confirmación de a un Componente de Subsistema por vez.
- **Reacomodo legacy** (formas viejas anteriores a 0027 que puedan enredar el Aprendizaje) → **se pregunta antes**, bloqueante.

**Primera corrida sobre un Agente con Propósito viejo = migración** (instala la Base nueva, renombra formas conocidas y reubica el Aprendizaje que quedó en casas retiradas). Las siguientes = reconciliación limpia (todo "ya estaba").

### Condición de cierre obligatoria

La presencia de `.claude/memoria/` significa **migración incompleta**, aunque todos sus archivos sean válidos para la versión vieja. Nunca responder “ya estaba al día” ni “nada para nivelar” mientras exista. El único cierre válido es uno de estos:

- `memoria/` ya no existe, todos sus Componentes de Subsistema fueron reubicados o descartados con confirmación y los lints quedan verdes;
- el flujo está detenido esperando **una decisión concreta** del usuario sobre el Componente de Subsistema que se mostró textual.

No mandar al usuario a invocar otra skill: `amp:actualizar` llama y coordina `amp-subsistemas:reubicar-aprendizaje` como un paso interno.

## Reparto de trabajo (skill ↔ script)

Lo mecánico y determinista lo hace el script `amp-actualizar.js` (decisión 0009); el juicio, este skill.

- **Script** (`node <ruta-skill>/amp-actualizar.js`): barrido y clasificación de la estructura, respaldo, y el reporte / vista previa. Modos: `--vista-previa` (o sin flag) detecta y muestra el plan **sin escribir**; `--respaldo` copia `.claude/` a `.claude/.respaldo-amp/<fecha>/`. Acepta la raíz del repo como argumento (default: el repo actual).
- **Skill** (este flujo): confirma el plan, **delega la instalación** al instalador consolidado `amp:inicializar` (que trae los Componentes de todos los subsistemas como archivos, ya limpios de citas a decisiones del harness, y es idempotente), migra términos y textos con criterio, y pregunta ante lo divergente.

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

   El detector compara el **contenido** de cada Componente de Subsistema contra el que viaja en `base/`, no solo su presencia, y **recorre el árbol entero**: no hay lista escrita a mano que pueda quedarse corta. (La había, con once scripts y un ancla cada uno, y su defecto era estructural — un Componente que nadie agregaba a la lista no se buscaba y no aparecía, así que el repo se informaba al día sin haberlo mirado.)

   ⚠️ Lo único que el detector no puede ver es lo que no viaja: si `base/` no llegó con el plugin, lo reporta como divergente en vez de callarse. Los tres archivos que se **fusionan** —`AGENTS.md` y los dos de hooks— tampoco se comparan por contenido: ahí se contrastan a mano los tres eventos en los dos archivos de cableado.
2. **Si el usuario pidió solo la vista previa → terminar acá.** Nada se escribió.
3. **Confirmar el plan.** Los **Divergentes** se preguntan uno por uno (son bloqueantes): no se toca nada de ese grupo sin ok explícito. Ejemplo típico: `conducta/INDICE.md` con reglas pero sin el corte Base/Propósito — repartirlas exige decidir cuáles son Base y cuáles del Propósito; eso lo decide el usuario.

   **`columna(s) fuera de la convención de la Base`** es el otro caso, y el que más cuidado pide: el encabezado del repo declara una columna que la Base no trae. Pisar el bloque dejaría cada fila con un dato de más bajo una cabecera que ya no lo nombra — el registro queda corrupto y sus lectores validan sobre una columna que desapareció.

   El detector **no dice cuál de las dos historias es**, porque las dos dejan la misma evidencia y solo el usuario conoce la de su repo:

   - **El repo sumó la columna**, como el Índice del Agente Desplegado tiene permitido. → Rehacer el encabezado nuevo **sumándole esa columna**, a mano, y dejar las filas intactas.
   - **La Base renombró una columna suya** y el repo conserva el nombre viejo. → Pisar el encabezado y **renombrar el dato en cada fila**, que sigue siendo el mismo dato con otro nombre.

   Nunca pisar el bloque a secas, y nunca fusionar automático: bajo la segunda historia, pegar la columna «propia» al final duplica la que la Base renombró.

   ⚠️ Una columna propia **sola** —sin que la convención de arriba haya cambiado y con las columnas de la Base en su lugar— **no genera hallazgo**: es Aprendizaje legítimo y no hay nada que nivelar. Si un repo con una columna propia apareciera marcado en cada corrida sin nada que hacer al respecto, eso es un defecto del detector, no del repo.
4. **Respaldo.** Antes de escribir un solo Componente de Subsistema del Agente Multipropósito:
   ```bash
   node <ruta-de-esta-skill>/amp-actualizar.js --respaldo
   ```
   El script decide solo, y puede no hacer nada:

   - **Si `.claude/` está versionado en git** (lo chequea con `git ls-files`) → **omite el respaldo** y lo dice. Git ya es la red: para volver atrás alcanza con `git diff` y `git checkout --` sobre lo pisado. Es el caso normal.
   - **Si no lo está** → respalda **fuera del repo**, en el directorio temporal del sistema, e imprime la ruta absoluta. Pasársela al usuario en el reporte final.

   ⚠️ **El respaldo no va adentro de `.claude/`,** y las dos razones se sufrieron en repos reales: ahí el agente **no puede borrarlo** —el borrado recursivo bajo `.claude/` está vedado, así que la limpieza que este mismo flujo manda hacer le queda al usuario a mano—, y además **contamina los lints**, que barren `.claude/` entero: cada copia congelada duplica los hallazgos viejos, que ya no se pueden corregir, y tapa los reales.
5. **Aplicar Base** (el grupo Base del plan). La fuente canónica es la carpeta `base/` de `amp:inicializar`: los Componentes de Subsistema son **archivos**, con el mismo árbol que ocupan en el destino.

   ⚠️ **`common/` va primero.** Los módulos que varios subsistemas comparten —hoy la lectura de frontmatter— los requieren los ocho lints y los dos hooks. Si se pisa un lint con la versión nueva y su módulo todavía no llegó, ese lint no arranca: falla al cargar, que en un hook es una sesión sin reglas entregadas. Copiar `common/` antes que el resto deja al repo corriendo en todo momento.

   Para cada ítem:
   - **Subsistema ausente** (p. ej. `conducta/`) → correr `amp:inicializar` (idempotente: instala los subsistemas ausentes copiando su parte del árbol y preserva lo que ya está).
   - **`MANIFIESTO`/lint/estructura vieja** → **copiar encima** el archivo de `base/`. (A diferencia de la reconciliación normal de `amp:inicializar`, que preserva lo existente, acá el archivo Base **se pisa** — es del harness. El contenido aprendido del mismo subsistema no se toca.)
   - **`contenido viejo`** (un archivo Base instalado que difiere del que viaja) → **copiar el de `base/` encima**, entero y tal cual. Es el caso más frecuente al poner al día un repo que ya tenía el Agente Multipropósito: el Componente de Subsistema está, pero en la versión de cuando se instaló. No hay nada que preservar — los archivos Base no se ajustan por repo; lo que el repo aprendió vive en sus registros.
   - **`encabezado viejo`** (un registro `origen: agente-desplegado` cuya convención quedó atrás) → **pisar solo hasta el separador de la tabla** y dejar las filas intactas. Arriba de la tabla está la convención, las columnas y la gobernanza, que manda el Agente Multipropósito y cambia con él; abajo están las entradas del repo. Sin esto, un repo instalado hace tres versiones lee instrucciones que ya no rigen y las obedece. El separador entra en lo que se pisa: es el que declara cuántas columnas tiene la tabla, así que es parte de la convención y no de las filas. Cuando el repo le sumó una columna propia el detector **no** emite este hallazgo, sino el divergente de abajo.
   - **`Componente de Subsistema ausente`** (un archivo que viaja en `base/` y que el repo no tiene) → **copiarlo de `base/`, entero y tal cual**. Sale del barrido del árbol, no de una lista de nombres, así que cubre lo que ningún chequeo nombra a mano: los Índices del Agente Desplegado (`ESTADOS-LOCAL.md`, `MOMENTOS-LOCAL.md`), las páginas de detalle de preferencias, y lo que viaje mañana. Un Agente Desplegado sin `ESTADOS-LOCAL.md` escribe sus estados propios en el archivo del Agente Multipropósito, y la corrida siguiente se los lleva puestos.
   - **Hook sin cablear** → merge del bloque de cableado de `conducta` en `.claude/settings.json` (y `.codex/hooks.json`), sin pisar hooks existentes.
   - **`conducta/INDICE.md` sin el corte por origen** (y sin reglas propias que repartir) → instalar `INDICE.md` con las reglas actuales del Agente Multipropósito e `INDICE-LOCAL.md` declarado y sin filas.
   - **Índice del Agente Desplegado ausente** (`SUBSISTEMAS-LOCAL.md`, `PREFERENCIAS-LOCAL.md`, `INDICE-LOCAL.md` de herramientas o de conducta) → copiarlo de `base/`, que lo trae **declarado y sin filas**. No es un archivo vacío: el manifiesto instalado lo nombra y las skills de alta escriben sobre él.
   - **Generación con `memoria/`** → instalar primero el subsistema `subsistemas/`, sus tres Componentes de Subsistema del Agente Multipropósito (`MANIFIESTO.md`, `SUBSISTEMAS.md`, `README.md`) y su lint. No borrar todavía ningún Componente de Subsistema aprendido.
6. **Aplicar Renombres** (el caso con más juicio — preservar lo aprendido):
   - **`glosario`→`semantica`:**
     1. Mover la carpeta `.claude/glosario/` → `.claude/semantica/` y `lint-glosario/` → `lint-semantica/` (renombrar también `lint-glosario.js` → `lint-semantica.js`).
     2. Correr `amp:inicializar` en reconciliación: pone al día el mecanismo de semántica (lint nuevo, `MANIFIESTO`, estructura de columnas) **preservando** `GLOSARIO.md` y `TERMINOLOGIA-FARLOPA.md` con sus términos. Verificar que ningún término se haya perdido.
     3. Migrar las referencias: en `AGENTS.md`, `@.claude/glosario/MANIFIESTO.md` → `@.claude/semantica/MANIFIESTO.md`; el prefijo de skill `glosario:` → `semantica:` donde aparezca; y toda referencia por ruta al lint renombrado (settings, hooks).
   - **Encabezados de los índices separados por origen** (`preferencias/PREFERENCIAS.md`, `conducta/INDICE.md`, `herramientas/INDICE.md`): el detector lista cada encabezado viejo con su nombre nuevo.
     1. Reemplazar **solo la línea del encabezado**, dejando intacto todo el contenido de esa sección. No es un reemplazo de contenido: la sección del Agente Desplegado sigue siendo del repo y no se toca aunque cambie de nombre.
     2. En `preferencias/PREFERENCIAS.md` el encabezado viejo llevaba adentro un número de versión (`## Base (harness vN)`). **Ese número se descarta y no se traslada a ningún lado**: la versión vive en el plugin, y un Agente Desplegado no guarda ninguna.
     3. Cerrar corriendo el lint de cada subsistema tocado.
   - **Índice todavía sin frontmatter** (`sin frontmatter de Indice`): agregarle al tope el bloque `indice` / `origen` / `columnas` que trae su archivo en `base/`, sin tocar el resto. El `origen` es lo que después decide el trato del nivelador, así que un valor equivocado acá pisa contenido del repo: si el archivo no es uno de los conocidos, preguntar antes de asignarlo.
   - **Índice partido por origen** (`partir por origen`): el subsistema todavía tiene los dos orígenes adentro de un archivo.
     1. Crear el archivo del Agente Desplegado (`-LOCAL`) con su frontmatter y **mover ahí la sección del Agente Desplegado con su contenido intacto** — filas, bullets, texto suelto y todo. Es una mudanza, no un reemplazo.
     2. Sacar esa sección del archivo que queda, que pasa a ser el del Agente Multipropósito.
     3. Si la sección estaba vacía, el archivo nace igual: declarado y sin filas.
     4. La segunda línea de importación vive en el `MANIFIESTO.md` del subsistema, que es Base y se reemplaza entero, así que llega sola. Chequear igual que esté: sin ella, el Índice del Agente Desplegado queda fuera del contexto y el subsistema se lee como si no tuviera entradas propias.
     5. Recién con los dos archivos al día, aplicar el reemplazo del archivo del Agente Multipropósito del punto 5. Al revés, el reemplazo se lleva puesto contenido del repo.
     6. Cerrar corriendo el lint de cada subsistema tocado: compara las columnas declaradas contra la tabla real y el manifiesto contra el frontmatter.
   - **Índice sin el núcleo de columnas** (`tabla sin el nucleo del Indice`, `sin tabla`): el archivo puede estar declarado y partido por origen y aun así conservar la forma vieja de su tabla. Es **migración de contenido, no reemplazo**: el nivelador nunca la aplica solo.
     1. Llevar la tabla a `Código | Nombre | Descripción | Detalle` más las columnas operativas que ese subsistema ya tenía (`Estado`, `Momento`, `Tipo`…), **conservando cada entrada**. Si el archivo no era tabla (bullets), pasarlo a tabla sin perder ninguna.
     2. Asignar el `Código` en el orden en que las entradas fueron creadas, con el prefijo del `origen` declarado en el frontmatter (`Base-` o `Local-`). Es un código, no una posición: de ahí en más se asigna como `máximo + 1` y los huecos no se reusan.
     3. Donde el núcleo no exista todavía —una `Descripción` que el registro nunca tuvo—, es **texto nuevo en un registro canónico**: se le muestra al usuario antes de escribirlo.
     4. Declarar las columnas nuevas en el frontmatter y sumar el campo `descripcion`, que dice qué representa la Descripción de ese Índice.
     5. Las filas quedan en orden ascendente por Código.
     6. Cerrar con el lint del subsistema, que valida el núcleo fila por fila.
   - **Sección `## Preferencias` en el punto de entrada:** borrarla. `preferencias` entra por su `MANIFIESTO.md` como los otros siete subsistemas, así que dejarla importa los mismos archivos dos veces.
7. **Migrar `memoria/` retirada — responsabilidad de esta skill.**
   1. Inventariar `memoria/` en tres grupos, **antes de hacer cualquier pregunta**:
      - infraestructura Base retirada: `MANIFIESTO.md`, `MEMORIA.md`, `README.md` y `lint-memoria/`;
      - los ocho Componentes de Subsistema conocidos del Agente Multipropósito que distribuía la generación anterior;
      - Aprendizaje restante del Propósito.
   2. Retirar automáticamente la infraestructura vieja cuando la Base `subsistemas/` ya está instalada.
   3. Reconciliar automáticamente los ocho Componentes de Subsistema conocidos del Agente Multipropósito. **No pedir confirmación por ellas**: comprobar primero que su destino actual exista y cubra el comportamiento; después retirar el duplicado viejo.

      | Componente de Subsistema retirado | Destino actual |
      |---|---|
      | `feedback_flujo_planes.md` | `.claude/planes/README.md` |
      | `feedback_semantica.md` | `.claude/semantica/README.md` |
      | `feedback_decisiones.md` | `.claude/decisiones/README.md` |
      | `feedback_base_conocimiento.md` | `.claude/conocimiento/README.md` |
      | `feedback_conducta.md` | `.claude/conducta/README.md` |
      | `feedback_herramientas.md` | `.claude/herramientas/README.md` |
      | `feedback_estilo_commits.md` | `.claude/preferencias/estilo-commits.md` + regla Base de conducta correspondiente |
      | `feedback_archivo_de_estado.md` | `.claude/preferencias/archivo-de-estado.md` + regla Base de conducta correspondiente |

      Si un Componente de Subsistema con uno de esos nombres contiene una adición propia del repo que no está cubierta por el destino, **solo esa adición** pasa al grupo de Aprendizaje; no se pregunta si se mueve el bloque Base entero.
   4. Recién con el Aprendizaje restante, invocar internamente `amp-subsistemas:reubicar-aprendizaje`: mostrar **un Componente de Subsistema por vez**, proponer destino y texto resultante, y esperar confirmación explícita antes de mover, partir o descartar.
   5. Reparar índices, vínculos y referencias después de cada confirmación.
   6. Cuando no queda ninguno, retirar el directorio `memoria/`, correr nuevamente la vista previa y verificar que no aparezca la migración.

   Si la sesión debe detenerse por una confirmación, informar exactamente qué Componente de Subsistema espera decisión. No presentar la migración como terminada.
8. **Otros Divergentes** — aplicar solo lo que el usuario aprobó en el paso 3.
9. **Reporte final.** Volver a correr la vista previa. Solo si da cero acciones y no existe `memoria/`, resumir lo hecho en los tres grupos (`pisado/instalado` · `ya estaba` · `divergente resuelto`) y **qué pasó con el respaldo**: si se omitió (git lo cubre) o dónde quedó, con la ruta absoluta. Cuando se hizo, decir que es **de un solo uso**: sirve hasta que el usuario verifique que el repo quedó bien, y después se borra.

   **Si el repo tiene `.claude/.respaldo-amp/`,** viene de corridas anteriores a este cambio. Avisarlo: son copias completas de `.claude/` que nadie limpia y que **inflan los hallazgos de todos los lints**. Ofrecer borrarlas — y si el borrado recursivo bajo `.claude/` está vedado en ese entorno, decírselo al usuario con el comando exacto en vez de dejarlo pasar en silencio.
10. **Lint.** Correr los lints de los subsistemas tocados (o `ejecutar-control-cierre` si es el repo autor). **No hacer commit** salvo pedido explícito.

## Reconciliación (idempotencia)

Segura de re-correr: una segunda corrida sobre un repo ya nivelado da todo "ya estaba" y no escribe nada. Es el mismo comando para migrar (repo viejo) y reconciliar (repo al día): la vista previa dice cuál es el caso.

## 0024

Todo lo que se instala o pisa en el consumidor sale de `base/` y de la PLANTILLA de `amp:inicializar`, que ya enuncian la razón inline sin citar números de decisión del harness. El nivelador no introduce números de decisión en el `.claude/` del consumidor.
