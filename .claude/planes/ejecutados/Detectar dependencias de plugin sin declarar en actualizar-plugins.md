# Detectar dependencias de plugin sin declarar en actualizar-plugins

**Estado: Ejecutado · Creado 26-07-28 · Cerrado 26-07-28.** Origen: el repo testigo `Agente-Coordinador` quedó sin la skill `amp:actualizar` mientras `actualizar-plugins` informaba todo `ACTUALIZADO`. El agente que lo diagnosticó tuvo que llegar al código; la Herramienta no dio ninguna señal.

## Por qué existe

La Herramienta Base `actualizar-plugins` compara, por cada plugin, lo instalado contra lo disponible. La lista de plugins sale de `plugesHabilitados()`: los identificadores que `enabledPlugins` declara en los tres `settings` (repo, local y usuario). Nada más entra a la tabla.

`enabledPlugins` es una **foto del momento en que se instaló**, no la lista de lo que el paquete necesita hoy. Cuando `amp` suma un subsistema, su `plugin.json` gana una dependencia y los repos ya instalados no se enteran: su `enabledPlugins` sigue nombrando el conjunto viejo. Ese plugin nuevo **no está en ninguna tabla** — no es `NO INSTALADO`, porque ese estado solo se dispara para un identificador que `enabledPlugins` ya nombra. Es invisible.

La resolución por dependencias existe en el archivo, pero está en el camino de Codex y solamente ahí: `manifest.dependencies` aparece una única vez en las 563 líneas, en `bundleCodex()` (línea 100), a donde el diagnóstico de Claude Code nunca llega. El bucle de `diagnosticar()` (líneas 392-394) recorre `plugesHabilitados()` y se acabó.

Evidencia medida el 28/07/2026 sobre `D:\Proyectos\Agente-Coordinador`:

- `amp` 0.7.1 declara ocho dependencias.
- El `enabledPlugins` de ese repo lista cinco. Faltan `amp-subsistemas`, `amp-herramientas` y `amp-conducta`: ni declarados ni instalados ahí.
- `amp` no resuelve sus dependencias, no carga, y sus tres skills (`actualizar`, `info`, `inicializar`) no se registran en la sesión. Los plugins hermanos cargan bien porque ninguno declara dependencias.
- La corrida de `actualizar-plugins --agente claude` sobre ese estado no menciona los tres que faltan.

**El agujero también está en la aplicación, no solo en el diagnóstico.** `aplicar()` elige la acción con `const accion = yaEsta ? 'update' : 'install'`, y las dependencias entran arrastradas únicamente por `install`. Un repo cuyo `amp` está instalado y atrasado recibe `update`: si esa versión nueva sumó dependencias, siguen sin llegar aunque el diagnóstico las nombre. Las dos mitades se arreglan juntas o no se arregla nada.

## Por qué importa más que otro error

Es el peor modo de falla posible para esta Herramienta en particular: **no avisa**. Su razón de existir, escrita en su propio README, es que hay desfases que engañan; este agrega un cuarto desfase que engaña más que los tres documentados, porque los otros al menos dejan una fila en la tabla. Un repo que cae acá queda sin las skills del paquete, con salida tranquilizadora y sin ninguna pista de dónde mirar.

Además rompe lo que la propia skill promete. `funcionalidades/amp/skills/actualizar/SKILL.md`, línea 52: *"Nunca hace falta que el usuario tipee comandos del CLI de plugins: la Herramienta ya está en la máquina."* Hoy sí hace falta, y hay que saber de antemano qué instalar.

Le pega a **cualquier** Agente con Propósito cuya declaración de plugins quedó atrás del `plugin.json` de `amp` — el caso típico después de que el paquete suma subsistemas, que es exactamente lo que pasó en las últimas semanas.

## El trabajo

1. **Reproducir y confirmar el mecanismo** sobre `Agente-Coordinador` (y sobre `.claude/tmp/prueba-actualizar/consumidor-viejo/`, que ya sirve de consumidor viejo). Qué hay que dejar establecido: que Claude Code descarta el plugin cuando una dependencia no está instalada, si deja algún rastro en algún lado, y qué hace exactamente `claude plugin update amp` frente a una dependencia recién agregada. El arreglo cambia de forma según la respuesta, así que esto va primero y no se saltea.

2. **Sacar la resolución de dependencias del camino de Codex a una función compartida.** Hoy `bundleCodex()` hace el recorrido con `visitar()` y su conjunto `vistos`. Extraer un ayudante —el cierre de dependencias sobre la raíz de un marketplace, con guarda de ciclos— que sirva a los dos caminos, en vez de escribir el recorrido dos veces. `bundleCodex()` pasa a llamarlo.

3. **Ampliar `diagnosticar()`.** Por cada plugin habilitado, resolver su cierre de dependencias leyendo el `plugin.json` del **marketplace bajado** (que es de donde ya sale todo lo "disponible") y sumar una fila por cada dependencia que `enabledPlugins` no declare. Condiciones que hay que respetar:
   - El cierre se resuelve por marketplace: un identificador de otro marketplace se resuelve contra el suyo.
   - Si el marketplace no está registrado o su catálogo no se puede leer, la fila degrada a `SIN DATO`. Nunca revienta ni omite en silencio.
   - Un plugin `RETIRADO` no tiene fila en el catálogo: no se le resuelven dependencias.
   - `versionDe()` relee `marketplace.json` en cada llamada; con el cierre eso se multiplica. Si se nota, cachear el catálogo por raíz.

4. **Hacer que la aplicación instale lo que falta.** Una dependencia sin declarar nunca estuvo instalada, así que no tiene entrada de la cual sacar el alcance: hereda el del plugin que la requiere. Y como `update` no arrastra dependencias nuevas, `aplicar()` tiene que instalarlas explícitamente. El re-diagnóstico posterior ya existe y verifica el resultado.

5. **Que el cierre final no mienta.** `TODO ACTUALIZADO` no puede imprimirse con dependencias faltantes: la fila nueva tiene que entrar en el conjunto que hoy se llama `desfasados`, para que la salida termine ofreciendo el comando con `--aplicar`.

6. **Documentar el estado nuevo** en `.claude/herramientas/actualizar-plugins/README.md`: la tabla "Qué compara" y la lista de los desfases, que hoy son tres y pasan a cuatro.

7. **Propagar.** El código del script viaja embebido en `funcionalidades/amp/skills/inicializar/PLANTILLA.md` (a partir de la línea 1043) y su README en la misma plantilla (línea 1616). Correr `propagar-harness` con verificación carácter a carácter y subir la versión de `amp`. Sin esto, el arreglo no llega a ningún repo consumidor: es la parte que hace que el plan sirva de algo.

8. **Control de cierre** (`ejecutar-control-cierre`) y corrida de la Herramienta arreglada contra los dos repos testigo, con `--aplicar` recién después de confirmar que el diagnóstico nombra los tres plugins que faltan.

## Lo que midió el paso 1 (28/07/2026)

El mecanismo se reprodujo en un repo de prueba propio (`.claude/tmp/prueba-dependencias/`), instalando `amp` y sacándole tres dependencias. Dos hallazgos cambiaron el arreglo previsto:

- **Claude Code descarta el plugin entero.** Con una dependencia afuera, el arranque procesa `7 plugins habilitados` en vez de 8 y la línea `Checking plugin amp:` desaparece del registro de depuración; con las tres puestas vuelve, y procesa 11 de 11. El aviso existe —`error type: dependency-unsatisfied`— pero **solo con `claude --debug`**, y nombra **una sola** de las que faltan.
- **`update` no repara nada e `install` repara de a una.** `claude plugin update amp` contesta *"already at the latest version"* sobre el repo roto. `claude plugin install amp`, ya instalado, agrega `+ 1 dependency` por corrida: con tres faltantes hacen falta tres. Por eso `--aplicar` **instala cada dependencia por su nombre** en vez de confiar en el arrastre, que era lo previsto en el paso 4.

## Decidido al ejecutar

- **El estado nuevo se llama `SIN DECLARAR`**, no se reusó `NO INSTALADO`. Reusarlo obligaba a redefinir un término que el README define como *"habilitado en `settings` pero sin entrada instalada"* — justo lo que este caso no es: acá el repo ni siquiera lo declara. El cableado se resolvió con una lista única (`DESFASADOS`) que leen el resumen final y el bucle de aplicación, para que no pueda existir un estado que se informe y no se toque.
- **`plugesHabilitados()` pasó a `pluginsHabilitados()`.** Era una abreviatura inventada de las que las preferencias vetan, en la función que este arreglo tocaba de todos modos.
- **`docs/INSTALAR.md` se arregló acá y no aparte.** Es el manual que alguien sigue para instalar y actualizar: dejarlo diciendo "7 plugins" con `amp-memoria` vigente produce exactamente la falla que este plan arregla. Quedó en nueve plugins, con `amp-memoria` marcado como retirado y un párrafo sobre qué hacer cuando `amp:actualizar` no responde.

## Notas de implementación

Commit `ecc798b`, con `amp` **0.7.2** publicada. Lo que cambió:

- `.claude/herramientas/actualizar-plugins/actualizar-plugins.js` — cierre de dependencias compartido (`cerrarDependencias`, `manifiestoDe`, catálogo cacheado por raíz y olvidado al empezar cada diagnóstico), filas `SIN DECLARAR`, lista única `DESFASADOS`, instalación por nombre de cada dependencia faltante, y `bundleCodex()` reescrito sobre la función compartida.
- Su `README.md` y la fila del registro de Herramientas: tres desfases pasan a cuatro.
- `funcionalidades/amp/skills/actualizar/SKILL.md`: qué hacer ante `SIN DECLARAR`, incluida la salvedad de que si la que falta es dependencia de `amp`, esa misma skill no está cargada y hay que entrar por la Herramienta del marketplace bajado.
- `funcionalidades/amp/skills/inicializar/PLANTILLA.md`: script embebido reemplazado y verificado idéntico byte a byte (37.326 bytes), README embebido regenerado conservando la única línea que ya divergía de antes, y fila del registro al día.
- `docs/INSTALAR.md` y la página de conocimiento `despliegue-de-plugins-claude-code.md` (más su línea del índice).

## Verificado

- La copia **distribuida** (marketplace bajado, commit `ecc798b`) corrida contra el repo testigo `Agente-Coordinador` en modo diagnóstico nombra las tres que faltan (`amp-subsistemas`, `amp-herramientas`, `amp-conducta`), cada una con quién la requiere. El testigo no se tocó: sigue con el árbol limpio.
- Sobre el repo de prueba, `--aplicar` instaló las tres en **una sola corrida** y el arranque siguiente cargó `amp` sin errores de dependencia.
- Sobre este repo, que está sano, el diagnóstico no inventa ninguna fila `SIN DECLARAR`.
- El camino de Codex sigue resolviendo el paquete con la función compartida.
- Control de cierre: verde salvo los 43 hallazgos de terminología que ya estaban abiertos (son del plan de nomenclatura, no de este cambio).
