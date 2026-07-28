# Despliegue de plugins de Claude Code: las seis paradas de una versión

Una versión de un plugin no está en un solo lugar: **vive en seis, y cada uno se pone al día por su cuenta**. Casi todo lo que sorprende al actualizar sale de confundir dos paradas distintas — la versión que figura instalada no es la que corre, y la que corre no es la que está publicada.

## Las seis paradas

| # | Parada | Dónde | Cómo avanza |
|---|--------|-------|-------------|
| 1 | Entorno de desarrollo | el repo que autora el plugin | editar y commitear |
| 2 | Producción | el repo en GitHub | `git push` |
| 3 | Marketplace bajado | `~/.claude/plugins/marketplaces/<marketplace>/` — el repo entero, traído a la máquina | `claude plugin marketplace update <marketplace>` |
| 4 | Plugins instalados | `~/.claude/plugins/cache/<marketplace>/<plugin>/<version>/` | `claude plugin install` / `update` |
| 5 | Plugins cargados | en memoria, desde que arrancó la sesión | **reiniciar la sesión** |
| 6 | Archivos desplegados | lo que el plugin escribe dentro de cada repo | lo que provea el plugin |

Las paradas 1 a 5 son mecanismo de Claude Code y valen para cualquier marketplace. La 6 existe solo si el plugin escribe archivos en el repo destino; en el Agente Multipropósito es el `.claude/` que nivela la skill `amp:actualizar`.

Vocabulario para no confundirlas: **publicado** (parada 2) · **bajado** (3) · **instalado** (4) · **cargado** (5).

## Los cuatro desfases

Tres se abren entre paradas consecutivas, y se ven distinto:

1. **`publicado ↔ bajado`** — el marketplace de la máquina todavía no trajo lo que hay en GitHub. **Es el más engañoso, porque contamina la comparación de los otros dos:** todo lo demás se compara contra lo bajado, así que con el marketplace viejo un plugin atrasado se informa como al día. Se averigua sin bajar nada con `git ls-remote` contra el origen (~0,6 s).
2. **`bajado ↔ instalado`** — lo bajado tiene una versión que el plugin todavía no trajo. Se arregla actualizando.
3. **`instalado ↔ cargado`** — el plugin ya se trajo, pero la sesión arrancó antes y sigue ejecutando la anterior. **También engaña:** `claude plugin list` muestra la versión nueva mientras la sesión corre la vieja. Se arregla **reiniciando**, no actualizando.

El desfase 3 **no se puede diagnosticar desde afuera**: depende de qué levantó una sesión al arrancar, así que apuntar la inspección a otro repo lo deja ciego por definición.

El cuarto no está entre dos paradas sino **al costado de todas**, y es el que menos rastro deja:

4. **`declarado ↔ requerido`** — el repo declara un plugin que exige dependencias que ese repo nunca nombró. `enabledPlugins` es la **foto del momento en que se instaló**: se escribe entera al instalar y no se vuelve a mover, así que cuando una versión posterior suma una dependencia, el repo ya instalado no se entera. El plugin que la pide **no carga**: Claude Code lo descarta entero y sus skills no se registran.

Medido el 28/07/2026 sobre un repo consumidor con `amp` 0.7.1 (ocho dependencias declaradas) y cinco instaladas:

- En el registro de depuración (`claude --debug --debug-file <ruta>`) aparece `Plugin not available for MCP: amp@xelnagah-harness - error type: dependency-unsatisfied` y el detalle `Dependency "amp-subsistemas@xelnagah-harness" is not installed`. **El aviso existe, pero solo ahí**: en la sesión no se ve nada, y nombra **una sola** de las tres que faltaban.
- El arranque procesa `7 plugins habilitados` en vez de 8, y la línea `Checking plugin amp:` no aparece. Con las tres instaladas, procesa 11 de 11 y la línea vuelve. Ese par —`dependency-unsatisfied` presente/ausente y `Checking plugin <nombre>:` ausente/presente— es la forma barata de verificar si un plugin carga sin abrir una sesión interactiva.
- **`claude plugin update <plugin>` no repara nada**: contesta `already at the latest version` y no instala ninguna dependencia, aunque falten.
- **`claude plugin install <plugin>` sobre un plugin ya instalado repara UNA dependencia por corrida** (`+ 1 dependency: amp-subsistemas`). Con tres faltantes hacen falta tres corridas. Por eso conviene instalar cada dependencia **por su nombre**, que sí es determinista, en vez de confiar en el arrastre del que las pide.
- Una dependencia instalada pero **deshabilitada** en el repo cuenta como faltante: la resolución es por repo, no por máquina.

## Mecánicas del CLI que sorprenden

**El registro de instalaciones es por repo, no por máquina.** `~/.claude/plugins/installed_plugins.json` guarda, para cada `<plugin>@<marketplace>`, **una entrada por `projectPath`**. Un mismo plugin puede estar instalado en un repo y no en otro. Ejemplo real de esta máquina (26/07/2026): `amp@xelnagah-harness` tiene dos entradas, una por cada repo que lo usa, y las dos comparten `installPath` — la caché es **por versión**, no por repo, por eso el registro necesita el `projectPath` para distinguir. Cada entrada trae `version`, `installedAt`, `lastUpdated` y `gitCommitSha`.

**`/reload-plugins` no trae versión nueva.** Recarga los plugins que ya están, en la versión que ya tenían. Para pasar de la parada 4 a la 5 hay que reiniciar la sesión.

**`claude plugin update` exige el identificador completo *y* el alcance.** Con el nombre pelado (`claude plugin update amp`) falla con `Plugin "amp" not found`; sin `--scope` lo busca en el alcance de usuario, donde puede no estar. El mensaje de error es el mismo en los dos casos y no dice cuál de las dos cosas falta.

**`claude plugin prune` solo mira el alcance de usuario.** Con seis dependencias huérfanas instaladas en alcance de proyecto contesta `Nothing to prune (no auto-installed plugins at user scope)`. Las dependencias de proyecto se sacan a mano.

**Desinstalar un plugin no arrastra sus dependencias.** `claude plugin uninstall <plugin> --scope project` saca solo ese plugin; los que había traído por `dependencies` quedan instalados y habilitados. Hay que desinstalarlos uno por uno.

**Instalar y desinstalar sí mantienen `enabledPlugins`.** Instalar agrega la línea de cada plugin (el pedido y sus dependencias) y desinstalar saca la del desinstalado, en el archivo que corresponde al alcance: `.claude/settings.json` con `project`, `.claude/settings.local.json` con `local`.

**Pero esa declaración commiteada no hace que el plugin llegue.** Se midió el 26/07/2026: un repo cuyo `.claude/settings.json` declaraba un plugin **sin tenerlo instalado** abrió sesión sin la skill, y no se creó ninguna entrada de instalación. O sea que versionar `enabledPlugins` no le ahorra a otra máquina el paso de instalar — el alcance `project`, que el menú ofrece como *"install for all collaborators"*, no cumple esa promesa.

**Dos generaciones de un mismo plugin coexisten: no se pisan.** Si un marketplace renombra sus plugins, el nombre viejo y el nuevo pueden quedar instalados a la vez y **cada uno aporta sus skills**. Dos skills con el mismo nombre y la misma descripción, distinto prefijo de plugin, **no tienen ganador definido**: el modelo elige. Por eso migrar exige desinstalar, y desinstalar lo retirado **no se puede deshacer** — el marketplace ya no ofrece ese nombre, así que no hay forma de reinstalarlo.

**El orden de una migración de nombres es obligatorio:** instalar lo nuevo → desinstalar lo viejo → reiniciar. Al revés, entre medio el repo se queda sin las skills que todavía usa.

## Una migración no se prueba en el repo autor

Que el repo autor quede verde sólo demuestra que la **forma nueva** es coherente. No demuestra que `amp:actualizar` pueda llevar un consumidor viejo hasta ella. El modo de falla comprobado el 27/07/2026 fue exactamente ése: el detector consideraba `memoria/` un subsistema vigente, de modo que podía informar “al día” sin ejecutar la migración que retiraba Memoria.

La prueba útil es una copia congelada de un consumidor viejo bajo `.claude/tmp/`:

1. Conservar la estructura anterior completa, incluido el Aprendizaje real que debe repartirse.
2. Darle a un agente recién iniciado una sola entrada: `amp:actualizar`.
3. Permitir que itere sobre la copia, nunca sobre el repo autor.
4. Exigir como cierre la **forma final en disco**, no el relato del agente: la casa retirada no existe, los destinos conservan el contenido, los índices y referencias están reparados, todos los lints terminan bien y una nueva vista previa da cero acciones.
5. Verificar también la **superficie de confirmación**: la infraestructura y los duplicados Base conocidos se reconcilian automáticamente; sólo el Aprendizaje propio o ambiguo llega al usuario como pregunta. Una migración que termina bien después de pedir permiso por cada pieza Base todavía tiene mal separado el trabajo mecánico del juicio.
6. Después de cualquier cambio en un archivo Base embebido, repetir la última nivelación: el detector debe volver a ponerse rojo ante esa diferencia y regresar a cero sólo después de copiar la pieza nueva.

El detector necesita **invariantes de generación**, además de comparar piezas conocidas. Ejemplo: mientras exista `.claude/memoria/`, la migración está incompleta aunque sus archivos sean válidos para la versión vieja. Sin esa invariante, una lista manual de piezas puede olvidar justamente la novedad que debería buscar.

## Codex y Claude Code no actualizan igual

El mismo marketplace tiene dos mecanismos locales distintos:

- **Codex:** el marketplace instalado vive bajo `~/.codex/.tmp/marketplaces/`; `codex plugin list` puede mostrar los plugins habilitados apuntando directamente a ese checkout y con las versiones nuevas, aunque sobrevivan carpetas históricas en `~/.codex/plugins/cache/`. Una caché vieja no prueba que esté activa: manda el registro que muestra `plugin list`.
- **Claude Code:** el marketplace bajado, el registro por proyecto y la caché de versiones son paradas separadas. Actualizar el plugin transversal actualiza los plugins ya instalados, pero en la prueba del 27/07/2026 **no instaló dos dependencias nuevas agregadas al paquete**. Hubo que instalar `amp-herramientas` y `amp-conducta` explícitamente y recién después desinstalar `amp-memoria`.

Por eso “actualizar el paquete” no alcanza como verificación de una migración del catálogo. Hay que comparar el conjunto esperado con el conjunto **registrado y habilitado** en cada agente: nuevos presentes, retirados ausentes y versiones coincidentes.

## Cierre verificable de una publicación

No aceptar un mensaje aislado de “todo actualizado” si contradice otra evidencia. El cierre completo recorre estas comprobaciones:

1. `git rev-parse HEAD` coincide con `git ls-remote origin refs/heads/main`.
2. El checkout local de cada marketplace coincide con ese commit publicado.
3. El registro del agente muestra todos los plugins esperados, habilitados y en la versión publicada; ningún nombre retirado sigue activo.
4. El control del repo autor queda enteramente verde.
5. El consumidor viejo de prueba llega a cero acciones y pierde físicamente la casa retirada.
6. Un agente efímero, iniciado **después** de la instalación, confirma que las skills nuevas están cargadas como capacidades. Leer los archivos instalados no sustituye esta prueba: la sesión actual puede conservar el catálogo con el que arrancó.

Esta última comprobación evita pedirle al usuario que reinicie “para ver si ahora sí”. El reinicio o agente nuevo sigue siendo la frontera de carga, pero la verificación la puede hacer el propio proceso de publicación antes de entregar.

**Cómo se verificó:** las mecánicas de `prune`, de las dependencias al desinstalar, de `enabledPlugins` y del registro por `projectPath` se comprobaron el 26/07/2026 instalando y revirtiendo `amp@xelnagah-harness` en un repo de esta máquina, con salida textual del CLI y lectura de `installed_plugins.json`. El 27/07/2026 se migró una copia con diez piezas reales de `.claude/memoria/`: el detector pasó de dos acciones a cero, la casa retirada desapareció y nueve lints terminaron con código 0. Una prueba posterior encontró que el flujo preguntaba también por ocho memorias Base; se corrigió el inventario previo y una prueba aislada quedó en `8 Base automáticas / 1 Aprendizaje para decidir`. Después se compararon los hashes local, remoto y de ambos marketplaces; Codex y Claude Code quedaron con nueve plugins vigentes. Finalmente, un Codex efímero de solo lectura confirmó que `amp-herramientas:registrar-herramienta` y `amp-conducta:registrar-regla` estaban cargadas, sin inferirlo desde archivos.

**Cuándo aplica / cuándo no:** vale para plugins de Claude Code servidos por un marketplace de repo git. Un marketplace servido desde una carpeta local no tiene parada 3 ni desfase 1: se lee directo. Las rutas de arriba son de Windows; en Linux/macOS el directorio raíz es `~/.claude/plugins/` igual. Los nombres de comando y de archivo se verificaron contra la versión de Claude Code instalada en julio de 2026 — el CLI cambia, conviene re-verificar si algo no coincide.
