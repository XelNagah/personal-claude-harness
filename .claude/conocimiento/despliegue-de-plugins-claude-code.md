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

## Los tres desfases

Entre paradas consecutivas se abre un desfase, y los tres se ven distinto:

1. **`publicado ↔ bajado`** — el marketplace de la máquina todavía no trajo lo que hay en GitHub. **Es el más engañoso, porque contamina la comparación de los otros dos:** todo lo demás se compara contra lo bajado, así que con el marketplace viejo un plugin atrasado se informa como al día. Se averigua sin bajar nada con `git ls-remote` contra el origen (~0,6 s).
2. **`bajado ↔ instalado`** — lo bajado tiene una versión que el plugin todavía no trajo. Se arregla actualizando.
3. **`instalado ↔ cargado`** — el plugin ya se trajo, pero la sesión arrancó antes y sigue ejecutando la anterior. **También engaña:** `claude plugin list` muestra la versión nueva mientras la sesión corre la vieja. Se arregla **reiniciando**, no actualizando.

El desfase 3 **no se puede diagnosticar desde afuera**: depende de qué levantó una sesión al arrancar, así que apuntar la inspección a otro repo lo deja ciego por definición.

## Mecánicas del CLI que sorprenden

**El registro de instalaciones es por repo, no por máquina.** `~/.claude/plugins/installed_plugins.json` guarda, para cada `<plugin>@<marketplace>`, **una entrada por `projectPath`**. Un mismo plugin puede estar instalado en un repo y no en otro. Ejemplo real de esta máquina (26/07/2026): `amp@xelnagah-harness` tiene dos entradas, una por cada repo que lo usa, y las dos comparten `installPath` — la caché es **por versión**, no por repo, por eso el registro necesita el `projectPath` para distinguir. Cada entrada trae `version`, `installedAt`, `lastUpdated` y `gitCommitSha`.

**`/reload-plugins` no trae versión nueva.** Recarga los plugins que ya están, en la versión que ya tenían. Para pasar de la parada 4 a la 5 hay que reiniciar la sesión.

**`claude plugin update` exige el identificador completo *y* el alcance.** Con el nombre pelado (`claude plugin update amp`) falla con `Plugin "amp" not found`; sin `--scope project` lo busca en el alcance de usuario, donde puede no estar. El mensaje de error es el mismo en los dos casos y no dice cuál de las dos cosas falta.

**`claude plugin prune` solo mira el alcance de usuario.** Con seis dependencias huérfanas instaladas en alcance de proyecto contesta `Nothing to prune (no auto-installed plugins at user scope)`. Las dependencias de proyecto se sacan a mano.

**Desinstalar un plugin no arrastra sus dependencias.** `claude plugin uninstall <plugin> --scope project` saca solo ese plugin; los que había traído por `dependencies` quedan instalados y habilitados. Hay que desinstalarlos uno por uno.

**Instalar y desinstalar sí mantienen `enabledPlugins`.** Con alcance de proyecto, instalar agrega la línea de cada plugin (el pedido y sus dependencias) en `.claude/settings.json`, y desinstalar saca la del plugin desinstalado.

**Dos generaciones de un mismo plugin coexisten: no se pisan.** Si un marketplace renombra sus plugins, el nombre viejo y el nuevo pueden quedar instalados a la vez y **cada uno aporta sus skills**. Dos skills con el mismo nombre y la misma descripción, distinto prefijo de plugin, **no tienen ganador definido**: el modelo elige. Por eso migrar exige desinstalar, y desinstalar lo retirado **no se puede deshacer** — el marketplace ya no ofrece ese nombre, así que no hay forma de reinstalarlo.

**El orden de una migración de nombres es obligatorio:** instalar lo nuevo → desinstalar lo viejo → reiniciar. Al revés, entre medio el repo se queda sin las skills que todavía usa.

**Cómo se verificó:** las mecánicas de `prune`, de las dependencias al desinstalar, de `enabledPlugins` y del registro por `projectPath` se comprobaron el 26/07/2026 instalando y revirtiendo `amp@xelnagah-harness` en un repo de esta máquina, con salida textual del CLI y lectura de `installed_plugins.json`. Los tres desfases, el comportamiento de `/reload-plugins` y el de `claude plugin update` salen del desarrollo y las pruebas de la Herramienta `actualizar-plugins` (24-26/07/2026), documentados en su README. La coexistencia de generaciones se observó con `memoria-local` y `amp-memoria`, que traen las dos una skill `registrar-memoria` con la misma descripción.

**Cuándo aplica / cuándo no:** vale para plugins de Claude Code servidos por un marketplace de repo git. Un marketplace servido desde una carpeta local no tiene parada 3 ni desfase 1: se lee directo. Las rutas de arriba son de Windows; en Linux/macOS el directorio raíz es `~/.claude/plugins/` igual. Los nombres de comando y de archivo se verificaron contra la versión de Claude Code instalada en julio de 2026 — el CLI cambia, conviene re-verificar si algo no coincide.
