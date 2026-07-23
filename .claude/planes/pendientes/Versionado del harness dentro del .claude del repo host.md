# Versionado del harness dentro del .claude del repo host

**Estado: Nuevo · Creado 26-07-22.** Traspaso de Javier (26-07-22), a partir de una prueba real hecha en la oficina. No está decidido nada: esto es un plan de **análisis**.

## El problema

El harness se instala dentro del `.claude/` de un **repo host** (el repo del Producto del Propósito: la app, el backend, lo que sea). Pero `.claude/` **no se versiona junto con el Producto**: el host lo tiene gitignoreado. Consecuencia directa: todo lo que el agente aprende sesión a sesión —memorias, planes, glosario, decisiones, conocimiento— vive sin historia, sin respaldo y sin forma de volver atrás.

Javier probó en la oficina poner un **sub-git** (un repositorio git independiente, anidado) adentro de `.claude/`. Eso **funciona** para versionar el harness aparte del Producto.

**Pero queda un hueco:** `AGENTS.md` —la fuente única de instrucciones del repo (decisión 0010)— vive en la **raíz del repo host**, un nivel **arriba** de `.claude/`, y también está gitignoreado por el host. Git no puede incluir en un repositorio archivos que están fuera (arriba) de su directorio raíz. Entonces el sub-git de `.claude/` versiona todos los subsistemas pero **deja afuera justo la pieza de entrada**.

Ejemplo concreto de la mecánica:

```
repo-host/
├── .gitignore          ← contiene ".claude/" y "AGENTS.md"
├── AGENTS.md           ← ignorado por el host, FUERA del sub-git ⇒ sin versionar
├── src/                ← versionado por el host (el Producto)
└── .claude/
    ├── .git/           ← sub-git: versiona de acá para abajo
    ├── memoria/        ← versionado por el sub-git ✔
    ├── planes/         ← versionado por el sub-git ✔
    └── ...
```

**Idea tentativa de Javier (NO decidida):** dejar en la raíz un `AGENTS.md` chico que solo apunte/importe a `.claude/AGENTS.md`, y que el `AGENTS.md` real viva **adentro** de `.claude/` (así lo agarra el sub-git). Javier no está seguro de que sea la mejor vía.

## Por qué no es obvio

Hay un precedente que juega a favor: en este repo la raíz ya tiene un **`CLAUDE.md` adaptador de una línea** (`@AGENTS.md`), porque Claude Code no lee `AGENTS.md` nativo. El patrón "archivo chico en raíz que apunta al real" **ya existe y funciona**.

Y hay un dato que juega en contra, escrito en el propio `AGENTS.md`: *"Si tu agente no soporta imports, leé esos archivos al inicio de la sesión"*. Es decir: **el `@import` no es universal**. Claude Code lo expande; para los demás (Codex CLI, Cursor, Gemini CLI, Copilot) el `AGENTS.md` de raíz es texto plano que se lee tal cual.

La cadena de consecuencias, entonces:

- **A ⇒ B:** si el `AGENTS.md` real se muda a `.claude/` y en la raíz queda `@.claude/AGENTS.md` ⇒ Claude Code sigue viendo todo (expande el import).
- **Si no fuera B:** un agente que **no** expande imports leería en la raíz una sola línea con una ruta y **nada más** ⇒ arranca la sesión sin preferencias, sin manifiestos, sin memoria. No falla ruidosamente: degrada en silencio, que es peor.
- **⇒ no A**, salvo que se acepte a propósito romper la **paridad Claude Code ↔ Codex CLI** que la decisión 0010 puso como objetivo, o que se pruebe agente por agente que la degradación es tolerable.

Ese es el nudo del análisis, no un detalle de implementación.

## Ejes a analizar (ninguno decidido)

### 1. ¿Qué es exactamente la unidad que se quiere versionar?

`.claude/` mezcla dos cosas distintas: la **mecánica del harness** (lints, plantillas, estructura) y los **datos del host** (sus memorias, sus planes, su glosario, su Propósito). Son la misma carpeta pero no el mismo objeto: la mecánica viaja desde este repo por plugins; los datos nacen y mueren en el host.

Preguntas: ¿el sub-git versiona las dos cosas juntas? ¿O lo que realmente se quiere respaldar son solo los **datos**, y la mecánica ya está versionada acá? Si es lo segundo, el problema del `AGENTS.md` cambia de peso: `AGENTS.md` es mayormente mecánica + Propósito.

### 2. Cuestionar la premisa: ¿por qué `.claude/` está gitignoreado en el host?

Es una premisa heredada, no una ley. Si el motivo es ruido o secretos, se puede **ignorar selectivamente** (`.claude/tmp/`, `settings.local.json`) y versionar el resto **con el repo host** — lo que borra el problema entero, incluido el del `AGENTS.md`.

Costo de esa vía: la historia del harness se mezcla con la del Producto (commits de memoria en medio de commits de código), y el harness deja de tener ciclo de vida propio. Hay que ponerle nombre a por qué eso molesta, si molesta.

### 3. Mecanismo de versionado: el sub-git no es la única opción

Alternativas a evaluar, con su consecuencia:

- **Sub-git anidado** (lo probado): simple, aislado. Riesgo: git lo ve como directorio ajeno; `git status` devuelve un repo distinto según desde dónde se corra; los agentes se confunden de repositorio; herramientas del host pueden tropezar.
- **Submódulo git**: versionado real y referenciable desde el host. Costo: el host tiene que dejar de ignorarlo (choca con la premisa) y los submódulos son ásperos de operar.
- **Rama huérfana** en el mismo repo host: sin repositorio extra. Costo: flujo poco frecuente, fácil de romper.
- **Repo externo + junction/symlink** hacia `.claude/`: el contenido vive afuera y se enlaza adentro. Precedente en casa: este repo ya usa junctions dobles para skills. Costo: solo-Windows en la forma actual (junctions NTFS), y ya hay un hallazgo de auditoría abierto sobre eso.
- **Copia/espejo** por Herramienta (sincronizar `.claude/` contra un repo aparte a demanda): sin git anidado, pero sincronización manual y con riesgo de divergencia.

### 4. El hueco del `AGENTS.md`: alternativas concretas

- **(a) Adaptador en raíz + real adentro** (la idea de Javier). Ventaja: reusa un patrón ya probado (`CLAUDE.md`). Riesgo: los agentes sin imports, descrito arriba.
- **(b) `AGENTS.md` real en raíz y versionado por el host** (dejar de ignorarlo). Ventaja: todos los agentes lo leen tal cual, cero riesgo de degradación. Costo: la pieza de entrada del harness queda en la historia del Producto, separada del resto del harness.
- **(c) `AGENTS.md` de raíz generado** desde `.claude/AGENTS.md` por una Herramienta (concatenación literal, no puntero). Ventaja: el archivo de raíz tiene contenido completo para cualquier agente, y la fuente única vive versionada adentro. Costo: hay que regenerar y hay dos copias que pueden divergir. Nota: es exactamente el mismo problema que ya tiene abierto el plan `Restaurar la portabilidad copiar y pegar del orquestador` (puntero vs. contenido concatenado) ⇒ **posible mecanismo compartido**.
- **(d) Junction/symlink** de `raíz/AGENTS.md` → `.claude/AGENTS.md`. El contenido real lo ve cualquier lector; el archivo ignorado es solo el enlace. Costo: portabilidad (Windows/Unix), y git puede tratarlo distinto según plataforma.
- **(e) No resolverlo**: aceptar que `AGENTS.md` queda sin versionar, dado que es reinstalable desde el harness. Costo: se pierden las **Adaptaciones** locales que ese archivo pueda tener.

### 5. Consecuencia mecánica ineludible: las rutas de los imports

Si el `AGENTS.md` real se muda a `.claude/AGENTS.md`, **todas** sus líneas `@` cambian de base:

- `@.claude/preferencias/PREFERENCIAS.md` ⇒ `@preferencias/PREFERENCIAS.md`
- `@.claude/memoria/MANIFIESTO.md` ⇒ `@memoria/MANIFIESTO.md` (ídem los otros cinco manifiestos)
- `CLAUDE.md` de raíz: `@AGENTS.md` ⇒ `@.claude/AGENTS.md`

Además hay que verificar el comportamiento real, no suponerlo: si un import anidado (manifiesto → `@INDICE.md`) resuelve igual desde la ubicación nueva, y si Codex CLI levanta o no un `AGENTS.md` que está en un subdirectorio en vez de la raíz. **Prueba de humo obligatoria, agente por agente**, antes de decidir.

### 6. Alcance de la decisión y arrastre

Si se elige una vía, arrastra:

- Es una **decisión estructural** ⇒ registrarla (el `AGENTS.md` en raíz es la decisión 0010; esto la modifica o la matiza).
- Toca el **orquestador** y los `inicializar-*`, que hoy escriben/parchean `AGENTS.md` en la raíz del host.
- Toca `lint-harness` y los lints que resuelven la raíz del repo por `__dirname` (ver el plan ya ejecutado `Unificar la resolución de refs en los lints de subsistema`): un sub-git anidado cambia qué es "la raíz".
- Toca los **consumidores ya instalados** (hay 9 migrados en la decisión 0010) ⇒ plan de migración, o convivencia de las dos formas.

## Salvedades de esta redacción

- Se usa **sub-git** porque es la palabra de Javier. No se acuña término nuevo ni se propone nada al glosario en este plan.
- Se asume que el problema es de los **repos consumidores** (donde el harness está instalado), no de este repo —acá `.claude/` sí se versiona con el resto—. Si el planteo también aplicaba a este repo, corregir al retomar.
- Se asume que `.claude/` está ignorado por **política** del host y no por una imposición externa. El eje 2 existe precisamente para verificar ese supuesto.

## Diseñar con `planificar`

Correr por `planificar` antes de tocar nada: cruza con la decisión 0010 (paridad multiagente), con `Restaurar la portabilidad copiar y pegar del orquestador` (puntero vs. contenido) y con el hallazgo de auditoría sobre junctions solo-Windows.
